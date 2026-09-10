package com.nanokhadya.service;

import com.nanokhadya.model.AuditLog;
import com.nanokhadya.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String userId, String action, String entityName, String entityId, String details, String ipAddress) {
        AuditLog log = new AuditLog(userId, action, entityName, entityId, details, ipAddress);
        auditLogRepository.save(log);
    }
}
