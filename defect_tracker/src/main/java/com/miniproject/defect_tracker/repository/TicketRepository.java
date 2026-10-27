package com.miniproject.defect_tracker.repository;

import com.miniproject.defect_tracker.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer>, JpaSpecificationExecutor<Ticket> {
    List<Ticket> findByStatus(String status);
    long countByStatus(String status);
    Page<Ticket> findByIsDeletedFalse(Pageable pageable);
    List<Ticket> findByIsDeletedFalse();
}