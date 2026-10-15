package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Semestre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SemestreRepository extends JpaRepository<Semestre, Integer> {

    List<Semestre> findByAnneeUniversitaireId(Integer anneeId);
}
