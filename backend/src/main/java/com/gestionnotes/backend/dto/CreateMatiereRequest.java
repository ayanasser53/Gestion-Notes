package com.gestionnotes.backend.dto;

public class CreateMatiereRequest {
    private String code;
    private String intitule;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getIntitule() { return intitule; }
    public void setIntitule(String intitule) { this.intitule = intitule; }
}