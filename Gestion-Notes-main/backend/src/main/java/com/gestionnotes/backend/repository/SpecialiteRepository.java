package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Specialite;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecialiteRepository extends JpaRepository<Specialite, Integer> {}