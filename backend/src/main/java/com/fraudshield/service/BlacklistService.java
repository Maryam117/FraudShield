package com.fraudshield.service;

import com.fraudshield.entity.BlacklistEntry;
import com.fraudshield.repository.BlacklistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BlacklistService {

    @Autowired
    private BlacklistRepository blacklistRepository;

    @Autowired
    private AuditService auditService;

    public List<BlacklistEntry> getAllEntries() {
        return blacklistRepository.findAll();
    }

    public BlacklistEntry addEntry(BlacklistEntry entry, String performedBy) {
        if (blacklistRepository.existsByValueAndListType(entry.getValue(), entry.getListType())) {
            throw new RuntimeException("Error: Entry with value '" + entry.getValue() + "' already exists in " + entry.getListType());
        }

        entry.setCreatedBy(performedBy);
        BlacklistEntry saved = blacklistRepository.save(entry);

        auditService.logAction(
                "LIST_ENTRY_ADDED",
                performedBy,
                entry.getListType() + ":" + entry.getValue(),
                "Added to " + entry.getListType() + " (Type: " + entry.getEntryType() + ")",
                "127.0.0.1"
        );

        return saved;
    }

    public BlacklistEntry updateEntry(Long id, BlacklistEntry details, String performedBy) {
        BlacklistEntry entry = blacklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: List entry not found"));

        if (details.getListType() != null) entry.setListType(details.getListType());
        if (details.getEntryType() != null) entry.setEntryType(details.getEntryType());
        if (details.getValue() != null) entry.setValue(details.getValue());
        if (details.getReason() != null) entry.setReason(details.getReason());

        BlacklistEntry saved = blacklistRepository.save(entry);

        auditService.logAction(
                "LIST_ENTRY_UPDATED",
                performedBy,
                saved.getListType() + ":" + saved.getValue(),
                "Updated entry details",
                "127.0.0.1"
        );

        return saved;
    }

    public void removeEntry(Long id, String performedBy) {
        BlacklistEntry entry = blacklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: List entry not found"));

        blacklistRepository.delete(entry);

        auditService.logAction(
                "LIST_ENTRY_REMOVED",
                performedBy,
                entry.getListType() + ":" + entry.getValue(),
                "Removed from " + entry.getListType(),
                "127.0.0.1"
        );
    }
}
