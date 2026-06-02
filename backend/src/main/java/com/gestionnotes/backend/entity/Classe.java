package com.gestionnotes.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "classes")
public class Classe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "annee_id", nullable = false)
    private AnneeUniversitaire anneeUniversitaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "niveau_id", nullable = false)
    private Niveau niveau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialite_id", nullable = false)
    private Specialite specialite;

    // ── getters / setters ─────────────────────────────────────────────────────

    public Integer getId()                              { return id; }
    public void    setId(Integer id)                    { this.id = id; }

    public AnneeUniversitaire getAnneeUniversitaire()   { return anneeUniversitaire; }
    public void setAnneeUniversitaire(AnneeUniversitaire a) { this.anneeUniversitaire = a; }

    public Niveau getNiveau()                           { return niveau; }
    public void   setNiveau(Niveau n)                   { this.niveau = n; }

    public Specialite getSpecialite()                   { return specialite; }
    public void       setSpecialite(Specialite s)       { this.specialite = s; }
}