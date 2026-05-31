package com.gestionnotes.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "groupes")
public class Groupe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "classe_id")
    private Classe classe;

    private String nom; // ex: "G1", "G2"

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Classe getClasse() { return classe; }
    public void setClasse(Classe classe) { this.classe = classe; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
}