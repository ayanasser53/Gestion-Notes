package com.gestionnotes.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "enseignants")
@Getter @Setter
public class Enseignant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}