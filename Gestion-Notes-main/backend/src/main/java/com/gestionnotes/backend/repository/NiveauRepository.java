package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Niveau;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NiveauRepository extends JpaRepository<Niveau, Integer> {}