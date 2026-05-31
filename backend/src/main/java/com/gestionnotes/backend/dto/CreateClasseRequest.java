package com.gestionnotes.backend.dto;

public class CreateClasseRequest {
    private Integer niveauId;
    private Integer specialiteId;
    private Integer groupes;        // nombre de groupes à créer
    private Integer anneeId;

    public Integer getNiveauId() { return niveauId; }
    public void setNiveauId(Integer niveauId) { this.niveauId = niveauId; }

    public Integer getSpecialiteId() { return specialiteId; }
    public void setSpecialiteId(Integer specialiteId) { this.specialiteId = specialiteId; }

    public Integer getGroupes() { return groupes; }
    public void setGroupes(Integer groupes) { this.groupes = groupes; }

    public Integer getAnneeId() { return anneeId; }
    public void setAnneeId(Integer anneeId) { this.anneeId = anneeId; }
}