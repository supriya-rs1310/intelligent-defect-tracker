package com.miniproject.defect_tracker.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String analyzeCode(String title, String description, String codeSnippet) {
        if (codeSnippet == null || codeSnippet.trim().isEmpty()) {
            return "No code snippet provided for AI analysis.";
        }

        try {
            String fullUrl = apiUrl + "?key=" + apiKey;
            log.info("Calling Gemini API for code analysis");

            String prompt = "You are an expert software engineer debugger. " +
                    "Analyze this bug report titled: '" + title + "'. " +
                    "Description: " + description + ". " +
                    "Review this broken code and provide a clear explanation and fix: \n" + codeSnippet;

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(fullUrl, entity, Map.class);

            List candidates = (List) response.getBody().get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map firstCandidate = (Map) candidates.get(0);
                Map content = (Map) firstCandidate.get("content");
                List parts = (List) content.get("parts");
                Map firstPart = (Map) parts.get(0);
                String result = (String) firstPart.get("text");
                log.info("Gemini API analysis successful");
                return result;
            }

            return "No analysis generated.";

        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage());
            return "AI Analysis Error: " + e.getMessage();
        }
    }
}