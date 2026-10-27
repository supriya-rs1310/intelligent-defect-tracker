package com.miniproject.defect_tracker.controller;

import com.miniproject.defect_tracker.dto.TicketRequest;
import com.miniproject.defect_tracker.entity.Ticket;
import com.miniproject.defect_tracker.entity.User;
import com.miniproject.defect_tracker.service.GeminiService;
import com.miniproject.defect_tracker.service.TicketService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private GeminiService geminiService;

    // 1. GET ALL TICKETS (with pagination)
    @GetMapping
    public ResponseEntity<?> getAllTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Ticket> tickets = ticketService.getAllTickets(pageable);
        return ResponseEntity.ok(tickets);
    }

    // 2. SEARCH TICKETS
    @GetMapping("/search")
    public ResponseEntity<?> searchTickets(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer assignedTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Ticket> results = ticketService.searchTickets(keyword, status, assignedTo, pageable);
        return ResponseEntity.ok(results);
    }

    // 3. GET METRICS
    @GetMapping("/metrics")
    public ResponseEntity<?> getMetrics() {
        return ResponseEntity.ok(ticketService.getMetrics());
    }

    // 4. CREATE TICKET
    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketRequest request) {
        Ticket ticket = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    // 5. UPDATE TICKET STATUS
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request,
            HttpSession session) {
        User currentUser = (User) session.getAttribute("loggedInUser");
        if (currentUser == null) {
            throw new IllegalArgumentException("Please login first");
        }

        if (!"DEVELOPER".equals(currentUser.getRole())) {
            throw new IllegalArgumentException("Only developers can update status");
        }

        String status = request.get("status");
        if (status == null) {
            throw new IllegalArgumentException("Status is required");
        }

        Ticket ticket = ticketService.updateStatus(id, status);
        return ResponseEntity.ok(ticket);
    }

    // 6. SOFT DELETE TICKET
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Integer id, HttpSession session) {
        User currentUser = (User) session.getAttribute("loggedInUser");
        if (currentUser == null) {
            throw new IllegalArgumentException("Please login first");
        }

        if (!"DEVELOPER".equals(currentUser.getRole()) && !"TESTER".equals(currentUser.getRole())) {
            throw new IllegalArgumentException("You don't have permission to delete tickets");
        }

        ticketService.softDeleteTicket(id);
        return ResponseEntity.ok(Map.of("message", "Ticket deleted successfully"));
    }

    // 7. AI ANALYSIS (Only Developer)
    @GetMapping("/{id}/ai-analyze")
    public ResponseEntity<?> analyzeTicket(@PathVariable Integer id, HttpSession session) {
        User currentUser = (User) session.getAttribute("loggedInUser");
        if (currentUser == null) {
            throw new IllegalArgumentException("Please login first");
        }

        if (!"DEVELOPER".equals(currentUser.getRole())) {
            throw new IllegalArgumentException("Only developers can run AI analysis");
        }

        Ticket ticket = ticketService.getAllTickets().stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found"));

        if (ticket.getIsDeleted()) {
            throw new IllegalArgumentException("Cannot analyze deleted ticket");
        }

        String result = geminiService.analyzeCode(
                ticket.getTitle(),
                ticket.getDescription(),
                ticket.getCodeSnippet()
        );

        return ResponseEntity.ok(Map.of("aiSuggestedFix", result));
    }
}