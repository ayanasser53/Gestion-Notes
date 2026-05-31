package com.gestionnotes.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "etudiants")
@Getter @Setter
public class Etudiant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer matricule;
    private String nom;
    private String prenom;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "groupe_id")
    private Groupe groupe;
}