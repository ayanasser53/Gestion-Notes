package com.gestionnotes.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "planification")
public class Planification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semestre_id", nullable = false)
    private Semestre semestre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupe_id", nullable = false)
    private Groupe groupe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matiere_id", nullable = false)
    private Matiere matiere;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enseignant_id", nullable = false)
    private Enseignant enseignant;

    @Column(name = "coeff_tps", nullable = false)
    private int coeffTps = 0;

    @Column(name = "coeff_projet", nullable = false)
    private int coeffProjet = 0;

    @Column(name = "coeff_ctrl1", nullable = false)
    private int coeffCtrl1 = 0;

    @Column(name = "coeff_ctrl2", nullable = false)
    private int coeffCtrl2 = 0;

    // ── getters / setters ────────────────────────────────────────────────────

    public Integer getId()                     { return id; }
    public void    setId(Integer id)           { this.id = id; }

    public Semestre getSemestre()              { return semestre; }
    public void     setSemestre(Semestre s)    { this.semestre = s; }

    public Groupe getGroupe()                  { return groupe; }
    public void   setGroupe(Groupe g)          { this.groupe = g; }

    public Matiere getMatiere()                { return matiere; }
    public void    setMatiere(Matiere m)       { this.matiere = m; }

    public Enseignant getEnseignant()          { return enseignant; }
    public void       setEnseignant(Enseignant e) { this.enseignant = e; }

    public int  getCoeffTps()                  { return coeffTps; }
    public void setCoeffTps(int v)             { this.coeffTps = v; }

    public int  getCoeffProjet()               { return coeffProjet; }
    public void setCoeffProjet(int v)          { this.coeffProjet = v; }

    public int  getCoeffCtrl1()                { return coeffCtrl1; }
    public void setCoeffCtrl1(int v)           { this.coeffCtrl1 = v; }

    public int  getCoeffCtrl2()                { return coeffCtrl2; }
    public void setCoeffCtrl2(int v)           { this.coeffCtrl2 = v; }
}
