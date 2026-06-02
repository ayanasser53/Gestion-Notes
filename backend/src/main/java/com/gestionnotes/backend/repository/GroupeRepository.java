package com.gestionnotes.backend.repository;

import com.gestionnotes.backend.entity.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupeRepository extends JpaRepository<Groupe, Integer> {

    // Better JPA style (safer + standard)
    List<Groupe> findByClasse_Id(Integer classeId);

    void deleteByClasse_Id(Integer classeId);
}