package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Enseignant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EnseignantRepository extends JpaRepository<Enseignant, Integer> {

    Optional<Enseignant> findByUserId(Integer userId);

}