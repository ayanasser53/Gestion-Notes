package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatiereRepository extends JpaRepository<Matiere, Integer> {
    boolean existsByCode(String code);
}