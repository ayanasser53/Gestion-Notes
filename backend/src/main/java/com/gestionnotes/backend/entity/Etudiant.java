package com.gestionnotes.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "etudiants")
public class Etudiant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "matricule", unique = true, nullable = false)
    private Integer matricule;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "prenom", nullable = false)
    private String prenom;

    // Current group assignment (nullable — student may not yet be in a group)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupe_id")
    private Groupe groupe;

    // ── getters / setters ─────────────────────────────────────────────────────

    public Long    getId()               { return id; }
    public void    setId(Long id)        { this.id = id; }

    public Integer getMatricule()        { return matricule; }
    public void    setMatricule(Integer m) { this.matricule = m; }

    public User    getUser()             { return user; }
    public void    setUser(User u)       { this.user = u; }

    public String  getNom()              { return nom; }
    public void    setNom(String nom)    { this.nom = nom; }

    public String  getPrenom()           { return prenom; }
    public void    setPrenom(String p)   { this.prenom = p; }

    public Groupe  getGroupe()           { return groupe; }
    public void    setGroupe(Groupe g)   { this.groupe = g; }
}