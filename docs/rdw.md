# RDW

The uddutch RDW has an api that allows us to get the vehicle information.

```
https://opendata.rdw.nl/resource/m9d7-ebf2.json?kenteken=6TJR64
```

this returns a json object for example 

```json
[
    {
        "kenteken": "6TJR64",
        "voertuigsoort": "Personenauto",
        "merk": "NISSAN",
        "handelsbenaming": "NISSAN NOTE",
        "vervaldatum_apk": "20260306",
        "datum_tenaamstelling": "20140306",
        "bruto_bpm": "2205",
        "inrichting": "MPV",
        "aantal_zitplaatsen": "5",
        "eerste_kleur": "GRIJS",
        "tweede_kleur": "Niet geregistreerd",
        "aantal_cilinders": "3",
        "cilinderinhoud": "1198",
        "massa_ledig_voertuig": "980",
        "toegestane_maximum_massa_voertuig": "1510",
        "massa_rijklaar": "1080",
        "datum_eerste_toelating": "20140306",
        "datum_eerste_tenaamstelling_in_nederland": "20140306",
        "wacht_op_keuren": "Geen verstrekking in Open Data",
        "catalogusprijs": "17580",
        "wam_verzekerd": "Ja",
        "aantal_deuren": "4",
        "aantal_wielen": "4",
        "lengte": "410",
        "europese_voertuigcategorie": "M1",
        "plaats_chassisnummer": "r. schutbord",
        "technische_max_massa_voertuig": "1510",
        "type": "E12",
        "typegoedkeuringsnummer": "e11*2007/46*0753*00",
        "variant": "B",
        "uitvoering": "B01",
        "volgnummer_wijziging_eu_typegoedkeuring": "0",
        "vermogen_massarijklaar": "0.05",
        "wielbasis": "260",
        "export_indicator": "Nee",
        "openstaande_terugroepactie_indicator": "Nee",
        "taxi_indicator": "Nee",
        "jaar_laatste_registratie_tellerstand": "2025",
        "tellerstandoordeel": "Logisch",
        "code_toelichting_tellerstandoordeel": "00",
        "tenaamstellen_mogelijk": "Ja",
        "vervaldatum_apk_dt": "2026-03-06T00:00:00.000",
        "datum_tenaamstelling_dt": "2014-03-06T00:00:00.000",
        "datum_eerste_toelating_dt": "2014-03-06T00:00:00.000",
        "datum_eerste_tenaamstelling_in_nederland_dt": "2014-03-06T00:00:00.000",
        "zuinigheidsclassificatie": "B",
        "api_gekentekende_voertuigen_assen": "https://opendata.rdw.nl/resource/3huj-srit.json",
        "api_gekentekende_voertuigen_brandstof": "https://opendata.rdw.nl/resource/8ys7-d773.json",
        "api_gekentekende_voertuigen_carrosserie": "https://opendata.rdw.nl/resource/vezc-m2t6.json",
        "api_gekentekende_voertuigen_carrosserie_specifiek": "https://opendata.rdw.nl/resource/jhie-znh9.json",
        "api_gekentekende_voertuigen_voertuigklasse": "https://opendata.rdw.nl/resource/kmfi-hrps.json"
    }
]
```

the fields include
voertuigsoort textVoertuigsoort
 merk textMerk
 handelsbenaming textHandelsbenaming
 vervaldatum_apk numberVervaldatum APK
 datum_tenaamstelling numberDatum tenaamstelling
 bruto_bpm numberBruto BPM
 inrichting textInrichting
 aantal_zitplaatsen numberAantal zitplaatsen
 eerste_kleur textEerste kleur
 tweede_kleur textTweede kleur
 aantal_cilinders numberAantal cilinders
 cilinderinhoud numberCilinderinhoud
 massa_ledig_voertuig numberMassa ledig voertuig
 toegestane_maximum_massa_voertuig numberToegestane maximum massa voertuig
 massa_rijklaar numberMassa rijklaar
 maximum_massa_trekken_ongeremd numberMaximum massa trekken ongeremd
 maximum_trekken_massa_geremd numberMaximum trekken massa geremd
 datum_eerste_toelating numberDatum eerste toelating
 datum_eerste_tenaamstelling_in_nederland numberDatum eerste tenaamstelling in Nederland
 wacht_op_keuren textWacht op keuren
 catalogusprijs numberCatalogusprijs
 wam_verzekerd textWAM verzekerd
 maximale_constructiesnelheid numberMaximale constructiesnelheid
 laadvermogen numberLaadvermogen
 oplegger_geremd numberOplegger geremd
 aanhangwagen_autonoom_geremd numberAanhangwagen autonoom geremd
 aanhangwagen_middenas_geremd numberAanhangwagen middenas geremd
 aantal_staanplaatsen numberAantal staanplaatsen
 aantal_deuren numberAantal deuren
 aantal_wielen numberAantal wielen
 afstand_hart_koppeling_tot_achterzijde_voertuig numberAfstand hart koppeling tot achterzijde voertuig
 afstand_voorzijde_voertuig_tot_hart_koppeling numberAfstand voorzijde voertuig tot hart koppeling
 afwijkende_maximum_snelheid numberAfwijkende maximum snelheid
 lengte numberLengte
 breedte numberBreedte
 europese_voertuigcategorie textEuropese voertuigcategorie
 europese_voertuigcategorie_toevoeging textEuropese voertuigcategorie toevoeging
 europese_uitvoeringcategorie_toevoeging textEuropese uitvoeringcategorie toevoeging
 plaats_chassisnummer textPlaats chassisnummer
 technische_max_massa_voertuig numberTechnische max. massa voertuig
 type textType
 type_gasinstallatie textType gasinstallatie
 typegoedkeuringsnummer textTypegoedkeuringsnummer
 variant textVariant
 uitvoering textUitvoering
 volgnummer_wijziging_eu_typegoedkeuring numberVolgnummer wijziging EU typegoedkeuring
 vermogen_massarijklaar numberVermogen massarijklaar
 wielbasis numberWielbasis
 export_indicator textExport indicator
 openstaande_terugroepactie_indicator textOpenstaande terugroepactie indicator
 vervaldatum_tachograaf numberVervaldatum tachograaf
 taxi_indicator textTaxi indicator
 maximum_massa_samenstelling numberMaximum massa samenstelling
 aantal_rolstoelplaatsen numberAantal rolstoelplaatsen
 maximum_ondersteunende_snelheid numberMaximum ondersteunende snelheid
 jaar_laatste_registratie_tellerstand numberJaar laatste registratie tellerstand
 tellerstandoordeel textTellerstandoordeel
 code_toelichting_tellerstandoordeel textCode toelichting tellerstandoordeel
 tenaamstellen_mogelijk textTenaamstellen mogelijk
 vervaldatum_apk_dt floating_timestampVervaldatum APK DT
 datum_tenaamstelling_dt floating_timestampDatum tenaamstelling DT
 datum_eerste_toelating_dt floating_timestampDatum eerste toelating DT
 datum_eerste_tenaamstelling_in_nederland_dt floating_timestampDatum eerste tenaamstelling in Nederland DT
 vervaldatum_tachograaf_dt floating_timestampVervaldatum tachograaf DT
 maximum_last_onder_de_vooras_sen_tezamen_koppeling numberMaximum last onder de vooras(sen) (tezamen)/koppeling
 type_remsysteem_voertuig_code textType remsysteem voertuig code
 rupsonderstelconfiguratiecode textRupsonderstelconfiguratiecode
 wielbasis_voertuig_minimum numberWielbasis voertuig minimum
 wielbasis_voertuig_maximum numberWielbasis voertuig maximum
 lengte_voertuig_minimum numberLengte voertuig minimum
 lengte_voertuig_maximum numberLengte voertuig maximum
 breedte_voertuig_minimum numberBreedte voertuig minimum
 breedte_voertuig_maximum numberBreedte voertuig maximum
 hoogte_voertuig numberHoogte voertuig
 hoogte_voertuig_minimum numberHoogte voertuig minimum
 hoogte_voertuig_maximum numberHoogte voertuig maximum
 massa_bedrijfsklaar_minimaal numberMassa bedrijfsklaar minimaal
 massa_bedrijfsklaar_maximaal numberMassa bedrijfsklaar maximaal
 technisch_toelaatbaar_massa_koppelpunt numberTechnisch toelaatbaar massa koppelpunt
 maximum_massa_technisch_maximaal numberMaximum massa technisch maximaal
 maximum_massa_technisch_minimaal numberMaximum massa technisch minimaal
 subcategorie_nederland textSubcategorie Nederland
 verticale_belasting_koppelpunt_getrokken_voertuig numberVerticale belasting koppelpunt getrokken voertuig
 zuinigheidsclassificatie textZuinigheidsclassificatie
 registratie_datum_goedkeuring_afschrijvingsmoment_bpm numberRegistratie datum goedkeuring (afschrijvingsmoment BPM)
 registratie_datum_goedkeuring_afschrijvingsmoment_bpm_dt floating_timestampRegistratie datum goedkeuring (afschrijvingsmoment BPM) DT
 gem_lading_wrde numberGemiddelde Lading Waarde
 aerodyn_voorz textAerodynamische voorziening of uitrusting
 massa_alt_aandr numberAdditionele massa alternatieve aandrijving
 verl_cab_ind textVerlengde cabine indicator
 aantal_passagiers_zitplaatsen_wettelijk numberAantal passagiers zitplaatsen wettelijk
 aanwijzingsnummer textAanwijzingsnummer
 api_gekentekende_voertuigen_assen textAPI Gekentekende_voertuigen_assen
 api_gekentekende_voertuigen_brandstof textAPI Gekentekende_voertuigen_brandstof
 api_gekentekende_voertuigen_carrosserie textAPI Gekentekende_voertuigen_carrosserie
 api_gekentekende_voertuigen_carrosserie_specifiek textAPI Gekentekende_voertuigen_carrosserie_specifiek
 api_gekentekende_voertuigen_voertuigklasse textAPI Gekentekende_voertuigen_voertuigklasse

