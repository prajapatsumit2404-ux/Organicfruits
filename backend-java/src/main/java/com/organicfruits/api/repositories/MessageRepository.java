package com.organicfruits.api.repositories;

import com.organicfruits.api.models.Message;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MessageRepository extends MongoRepository<Message, String> {
}
