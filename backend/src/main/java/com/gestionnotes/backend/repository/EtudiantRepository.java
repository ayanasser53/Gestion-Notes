package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    List<Etudiant> findByGroupeId(Integer groupeId);
    List<Etudiant> findByGroupeIsNull();
}
