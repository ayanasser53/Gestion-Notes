package com.gestionnotes.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "enseignants")
public class Enseignant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "prenom", nullable = false)
    private String prenom;

    // ── getters / setters ─────────────────────────────────────────────────────

    public Integer getId()               { return id; }
    public void    setId(Integer id)     { this.id = id; }

    public User    getUser()             { return user; }
    public void    setUser(User u)       { this.user = u; }

    public String  getNom()              { return nom; }
    public void    setNom(String nom)    { this.nom = nom; }

    public String  getPrenom()           { return prenom; }
    public void    setPrenom(String p)   { this.prenom = p; }
}