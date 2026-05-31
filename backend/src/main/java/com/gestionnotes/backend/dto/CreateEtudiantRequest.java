package com.gestionnotes.backend.dto;

import lombok.Data;

@Data
public class CreateEtudiantRequest {
    public String email;
    public String password;
    public String nom;
    public String prenom;
}