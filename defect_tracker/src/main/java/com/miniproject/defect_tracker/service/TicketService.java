package com.miniproject.defect_tracker.service;

import com.miniproject.defect_tracker.dto.TicketRequest;
import com.miniproject.defect_tracker.entity.Ticket;
import com.miniproject.defect_tracker.entity.User;
import com.miniproject.defect_tracker.repository.TicketRepository;
import com.miniproject.defect_tracker.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TicketService {

    private static final Logger log = LoggerFactory.getLogger(TicketService.class);

    @Autowired
    private TicketRepository ticketRepository;

    @Autowired
    private UserRepository userRepository;

    // 1. GET ALL TICKETS (with pagination)
    public Page<Ticket> getAllTickets(Pageable pageable) {
        return ticketRepository.findByIsDeletedFalse(pageable);
    }

    // 2. GET ALL TICKETS (without pagination - for internal use)
    public List<Ticket> getAllTickets() {
        return ticketRepository.findByIsDeletedFalse();
    }

    // 3. CREATE TICKET
    public Ticket createTicket(TicketRequest req) {
        log.info("Creating new ticket: {}", req.getTitle());

        User assignedUser = userRepository.findById(req.getAssignedToUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));

        String severity = req.getSeverity() != null ? req.getSeverity().trim().toUpperCase() : "LOW";
        if (!severity.equals("LOW") && !severity.equals("MEDIUM") && !severity.equals("HIGH")) {
            severity = "LOW";
        }

        Ticket ticket = new Ticket();
        ticket.setTitle(req.getTitle().trim());
        ticket.setDescription(req.getDescription().trim());
        ticket.setCodeSnippet(req.getCodeSnippet() != null ? req.getCodeSnippet().trim() : null);
        ticket.setSeverity(severity);
        ticket.setAssignedToUser(assignedUser);
        ticket.setIsDeleted(false);

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Ticket created with ID: {}", savedTicket.getId());

        return savedTicket;
    }

    // 4. UPDATE STATUS
    public Ticket updateStatus(Integer id, String status) {
        log.info("Updating status for ticket ID: {} to {}", id, status);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found!"));

        if (ticket.getIsDeleted()) {
            throw new IllegalArgumentException("Cannot update deleted ticket!");
        }

        String normalizedStatus = status.trim().toUpperCase();
        if (!normalizedStatus.equals("OPEN") && !normalizedStatus.equals("IN_PROGRESS") && !normalizedStatus.equals("RESOLVED")) {
            throw new IllegalArgumentException("Invalid status!");
        }

        ticket.setStatus(normalizedStatus);
        Ticket updatedTicket = ticketRepository.save(ticket);
        log.info("Status updated for ticket ID: {}", id);

        return updatedTicket;
    }

    // 5. SOFT DELETE TICKET
    public void softDeleteTicket(Integer id) {
        log.info("Soft deleting ticket ID: {}", id);

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found!"));

        ticket.setIsDeleted(true);
        ticketRepository.save(ticket);
        log.info("Ticket ID: {} soft deleted", id);
    }

    // 6. GET METRICS
    public Map<String, Long> getMetrics() {
        long open = ticketRepository.countByStatus("OPEN");
        long inProgress = ticketRepository.countByStatus("IN_PROGRESS");
        long resolved = ticketRepository.countByStatus("RESOLVED");

        return Map.of(
                "OPEN", open,
                "IN_PROGRESS", inProgress,
                "RESOLVED", resolved
        );
    }

    // 7. SEARCH TICKETS (with pagination)
    public Page<Ticket> searchTickets(String keyword, String status, Integer assignedTo, Pageable pageable) {
        log.info("Searching tickets with keyword: {}, status: {}, assignedTo: {}", keyword, status, assignedTo);

        Specification<Ticket> spec = Specification.where((root, query, cb) -> cb.isFalse(root.get("isDeleted")));

        if (keyword != null && !keyword.trim().isEmpty()) {
            String searchTerm = "%" + keyword.toLowerCase().trim() + "%";
            Specification<Ticket> keywordSpec = (root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("title")), searchTerm),
                            cb.like(cb.lower(root.get("description")), searchTerm)
                    );
            spec = spec.and(keywordSpec);
        }

        if (status != null && !status.trim().isEmpty()) {
            Specification<Ticket> statusSpec = (root, query, cb) ->
                    cb.equal(cb.upper(root.get("status")), status.toUpperCase().trim());
            spec = spec.and(statusSpec);
        }

        if (assignedTo != null) {
            Specification<Ticket> assignedSpec = (root, query, cb) ->
                    cb.equal(root.get("assignedToUser").get("id"), assignedTo);
            spec = spec.and(assignedSpec);
        }

        return ticketRepository.findAll(spec, pageable);
    }
}