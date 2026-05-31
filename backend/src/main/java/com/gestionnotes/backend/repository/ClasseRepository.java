package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Classe;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClasseRepository extends JpaRepository<Classe, Integer> {
    List<Classe> findByAnneeUniversitaireId(Integer anneeId);
}