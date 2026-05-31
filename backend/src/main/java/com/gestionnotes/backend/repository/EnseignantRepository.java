package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Enseignant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnseignantRepository extends JpaRepository<Enseignant, Long> {}