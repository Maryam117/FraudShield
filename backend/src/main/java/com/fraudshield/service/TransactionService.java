package com.fraudshield.service;

import com.fraudshield.dto.TransactionRequest;
import com.fraudshield.dto.TransactionResponse;
import com.fraudshield.entity.Transaction;
import com.fraudshield.entity.User;
import com.fraudshield.repository.TransactionRepository;
import com.fraudshield.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FraudEngineService fraudEngineService;

    @Autowired
    private AuditService auditService;

    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request, String clientIp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        String ip = (request.getIpAddress() != null && !request.getIpAddress().isBlank()) ? request.getIpAddress() : clientIp;

        // Run synchronously against Fraud Engine
        FraudEngineService.EvaluationResult evalResult = fraudEngineService.evaluateTransaction(
                user, request.getAmount(), request.getMerchantCategory(), request.getLocation(), ip);

        String refCode = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String rulesTriggeredText = evalResult.triggeredRules.isEmpty() ? "None" : String.join("; ", evalResult.triggeredRules);

        Transaction transaction = Transaction.builder()
                .transactionReference(refCode)
                .user(user)
                .accountNumber(request.getAccountNumber())
                .receiverAccount(request.getReceiverAccount())
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
                .merchantCategory(request.getMerchantCategory())
                .location(request.getLocation())
                .ipAddress(ip)
                .status(evalResult.status)
                .riskScore(evalResult.riskScore)
                .triggeredRules(rulesTriggeredText)
                .build();

        Transaction savedTxn = transactionRepository.save(transaction);

        // Generate alert if flagged as Suspicious or Rejected
        fraudEngineService.triggerAlertIfNeeded(savedTxn, evalResult);

        auditService.logAction("TRANSACTION_SUBMIT", user.getUsername(), "Txn:" + refCode,
                "Amount: " + request.getAmount() + " USD, Status: " + evalResult.status + ", RiskScore: " + evalResult.riskScore, ip);

        return mapToResponse(savedTxn);
    }

    public List<TransactionResponse> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TransactionResponse getTransactionById(Long id) {
        Transaction txn = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + id));
        return mapToResponse(txn);
    }

    private TransactionResponse mapToResponse(Transaction txn) {
        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionReference(txn.getTransactionReference())
                .userId(txn.getUser().getId())
                .username(txn.getUser().getUsername())
                .accountNumber(txn.getAccountNumber())
                .receiverAccount(txn.getReceiverAccount())
                .amount(txn.getAmount())
                .currency(txn.getCurrency())
                .merchantCategory(txn.getMerchantCategory())
                .location(txn.getLocation())
                .ipAddress(txn.getIpAddress())
                .status(txn.getStatus())
                .riskScore(txn.getRiskScore())
                .triggeredRules(txn.getTriggeredRules())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
