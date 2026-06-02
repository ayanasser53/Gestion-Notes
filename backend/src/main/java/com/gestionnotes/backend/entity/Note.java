package com.gestionnotes.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "notes")
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "planification_id", nullable = false)
    private Planification planification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etudiant_id", nullable = false)
    private Etudiant etudiant;

    @Column(name = "note_tps",    precision = 4, scale = 2)
    private BigDecimal noteTps;

    @Column(name = "note_projet", precision = 4, scale = 2)
    private BigDecimal noteProjet;

    @Column(name = "note_ctrl1",  precision = 4, scale = 2)
    private BigDecimal noteCtrl1;

    @Column(name = "note_ctrl2",  precision = 4, scale = 2)
    private BigDecimal noteCtrl2;

    @Column(name = "moyenne",     precision = 4, scale = 2)
    private BigDecimal moyenne;

    // ── getters / setters ─────────────────────────────────────────────────────

    public Integer getId()                        { return id; }
    public void    setId(Integer id)              { this.id = id; }

    public Planification getPlanification()       { return planification; }
    public void setPlanification(Planification p) { this.planification = p; }

    public Etudiant getEtudiant()                 { return etudiant; }
    public void     setEtudiant(Etudiant e)       { this.etudiant = e; }

    public BigDecimal getNoteTps()                { return noteTps; }
    public void       setNoteTps(BigDecimal v)    { this.noteTps = v; }

    public BigDecimal getNoteProjet()             { return noteProjet; }
    public void       setNoteProjet(BigDecimal v) { this.noteProjet = v; }

    public BigDecimal getNoteCtrl1()              { return noteCtrl1; }
    public void       setNoteCtrl1(BigDecimal v)  { this.noteCtrl1 = v; }

    public BigDecimal getNoteCtrl2()              { return noteCtrl2; }
    public void       setNoteCtrl2(BigDecimal v)  { this.noteCtrl2 = v; }

    public BigDecimal getMoyenne()                { return moyenne; }
    public void       setMoyenne(BigDecimal v)    { this.moyenne = v; }
}