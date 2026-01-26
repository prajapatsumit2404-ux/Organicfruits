package com.organicfruits.api.controllers;

import com.organicfruits.api.models.Note;
import com.organicfruits.api.repositories.NoteRepository;
import com.organicfruits.api.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private String getUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            return jwtUtils.extractClaim(authHeader.substring(7), claims -> (String) claims.get("id"));
        } catch (Exception e) { return null; }
    }

    @GetMapping
    public ResponseEntity<?> getNotes(@RequestHeader(value = "Authorization", required = false) String auth) {
        String userId = getUserId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        return ResponseEntity.ok(noteRepository.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<?> createNote(@RequestHeader(value = "Authorization", required = false) String auth, @RequestBody Note noteRequest) {
        String userId = getUserId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));

        Note note = Note.builder()
                .userId(userId)
                .title(noteRequest.getTitle())
                .items(noteRequest.getItems())
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(noteRepository.save(note));
    }
}
