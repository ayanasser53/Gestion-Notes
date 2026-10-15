package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {

    // Used by ClasseController — list students in a group
    List<Etudiant> findByGroupeId(Integer groupeId);

    // Used by ClasseController — list students not yet assigned to any group
    List<Etudiant> findByGroupeIsNull();
}