package com.gestionnotes.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "classes")
public class Classe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "annee_id")
    private AnneeUniversitaire anneeUniversitaire;

    @ManyToOne
    @JoinColumn(name = "niveau_id")
    private Niveau niveau;

    @ManyToOne
    @JoinColumn(name = "specialite_id")
    private Specialite specialite;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public AnneeUniversitaire getAnneeUniversitaire() { return anneeUniversitaire; }
    public void setAnneeUniversitaire(AnneeUniversitaire a) { this.anneeUniversitaire = a; }

    public Niveau getNiveau() { return niveau; }
    public void setNiveau(Niveau niveau) { this.niveau = niveau; }

    public Specialite getSpecialite() { return specialite; }
    public void setSpecialite(Specialite specialite) { this.specialite = specialite; }
}