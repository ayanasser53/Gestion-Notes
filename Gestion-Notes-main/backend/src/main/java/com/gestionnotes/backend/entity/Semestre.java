package com.gestionnotes.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "semestres")
public class Semestre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annee_id", nullable = false)
    private AnneeUniversitaire anneeUniversitaire;

    @Column(name = "nom", nullable = false)
    private String nom;   // "S1" or "S2"

    // ── getters / setters ────────────────────────────────────────────────────

    public Integer getId()                              { return id; }
    public void    setId(Integer id)                    { this.id = id; }

    public AnneeUniversitaire getAnneeUniversitaire()   { return anneeUniversitaire; }
    public void setAnneeUniversitaire(AnneeUniversitaire a) { this.anneeUniversitaire = a; }

    public String getNom()                              { return nom; }
    public void   setNom(String nom)                    { this.nom = nom; }
}
