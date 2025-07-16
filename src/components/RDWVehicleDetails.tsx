import type { FC } from 'react';
import { FaCar, FaCalendarAlt, FaWeightHanging, FaRuler, FaTachometerAlt, FaIdCard, FaPalette, FaCogs, FaShieldAlt } from 'react-icons/fa';
import type { RDWVehicleData } from '../types/rdwTypes';

interface RDWVehicleDetailsProps {
  vehicleData: RDWVehicleData;
  kenteken: string;
}

interface InfoSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const InfoSection: FC<InfoSectionProps> = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="text-blue-600">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

interface InfoRowProps {
  label: string;
  value: string | undefined;
  unit?: string;
}

const InfoRow: FC<InfoRowProps> = ({ label, value, unit }) => {
  if (!value || value === 'Niet geregistreerd' || value === 'Geen verstrekking in Open Data') {
    return null;
  }

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600 text-sm">{label}</span>
      <span className="text-gray-900 font-medium">
        {value}
        {unit && <span className="text-gray-500 text-sm ml-1">{unit}</span>}
      </span>
    </div>
  );
};

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  if (dateStr.length === 8) {
    // Format YYYYMMDD to DD-MM-YYYY
    return `${dateStr.slice(6, 8)}-${dateStr.slice(4, 6)}-${dateStr.slice(0, 4)}`;
  }
  return dateStr;
};

const formatCurrency = (value: string | undefined): string => {
  if (!value) return '';
  const num = parseInt(value);
  if (isNaN(num)) return value;
  return `€${num.toLocaleString('nl-NL')}`;
};

export const RDWVehicleDetails: FC<RDWVehicleDetailsProps> = ({ vehicleData, kenteken }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <div className="flex items-center gap-3">
          <FaCar className="text-2xl" />
          <div>
            <h2 className="text-2xl font-bold">{vehicleData.merk} {vehicleData.handelsbenaming}</h2>
            <p className="text-blue-100">Kenteken: {kenteken}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <InfoSection title="Voertuig Informatie" icon={<FaIdCard />}>
          <InfoRow label="Voertuigsoort" value={vehicleData.voertuigsoort} />
          <InfoRow label="Merk" value={vehicleData.merk} />
          <InfoRow label="Type" value={vehicleData.type} />
          <InfoRow label="Variant" value={vehicleData.variant} />
          <InfoRow label="Uitvoering" value={vehicleData.uitvoering} />
          <InfoRow label="Inrichting" value={vehicleData.inrichting} />
          <InfoRow label="Europese categorie" value={vehicleData.europese_voertuigcategorie} />
        </InfoSection>

        {/* Dates */}
        <InfoSection title="Datums" icon={<FaCalendarAlt />}>
          <InfoRow label="Eerste toelating" value={formatDate(vehicleData.datum_eerste_toelating)} />
          <InfoRow label="Tenaamstelling" value={formatDate(vehicleData.datum_tenaamstelling)} />
          <InfoRow label="APK vervaldatum" value={formatDate(vehicleData.vervaldatum_apk)} />
          <InfoRow label="Tellerstandoordeel" value={vehicleData.tellerstandoordeel} />
          <InfoRow label="Laatste tellerstand" value={vehicleData.jaar_laatste_registratie_tellerstand} />
        </InfoSection>

        {/* Physical Properties */}
        <InfoSection title="Afmetingen & Gewicht" icon={<FaWeightHanging />}>
          <InfoRow label="Lengte" value={vehicleData.lengte} unit="cm" />
          <InfoRow label="Breedte" value={vehicleData.breedte} unit="cm" />
          <InfoRow label="Hoogte" value={vehicleData.hoogte_voertuig} unit="cm" />
          <InfoRow label="Wielbasis" value={vehicleData.wielbasis} unit="cm" />
          <InfoRow label="Massa ledig" value={vehicleData.massa_ledig_voertuig} unit="kg" />
          <InfoRow label="Massa rijklaar" value={vehicleData.massa_rijklaar} unit="kg" />
          <InfoRow label="Max. massa" value={vehicleData.toegestane_maximum_massa_voertuig} unit="kg" />
        </InfoSection>

        {/* Engine & Performance */}
        <InfoSection title="Motor & Prestaties" icon={<FaCogs />}>
          <InfoRow label="Aantal cilinders" value={vehicleData.aantal_cilinders} />
          <InfoRow label="Cilinderinhoud" value={vehicleData.cilinderinhoud} unit="cc" />
          <InfoRow label="Vermogen/massa" value={vehicleData.vermogen_massarijklaar} unit="kW/kg" />
          <InfoRow label="Max. constructiesnelheid" value={vehicleData.maximale_constructiesnelheid} unit="km/h" />
          <InfoRow label="Type gasinstallatie" value={vehicleData.type_gasinstallatie} />
          <InfoRow label="Zuinigheidsclassificatie" value={vehicleData.zuinigheidsclassificatie} />
        </InfoSection>

        {/* Physical Features */}
        <InfoSection title="Uiterlijk" icon={<FaPalette />}>
          <InfoRow label="Eerste kleur" value={vehicleData.eerste_kleur} />
          <InfoRow label="Tweede kleur" value={vehicleData.tweede_kleur} />
          <InfoRow label="Aantal deuren" value={vehicleData.aantal_deuren} />
          <InfoRow label="Aantal wielen" value={vehicleData.aantal_wielen} />
          <InfoRow label="Aantal zitplaatsen" value={vehicleData.aantal_zitplaatsen} />
          <InfoRow label="Aantal staanplaatsen" value={vehicleData.aantal_staanplaatsen} />
        </InfoSection>

        {/* Financial & Legal */}
        <InfoSection title="Financieel & Juridisch" icon={<FaShieldAlt />}>
          <InfoRow label="Catalogusprijs" value={formatCurrency(vehicleData.catalogusprijs)} />
          <InfoRow label="BPM" value={formatCurrency(vehicleData.bruto_bpm)} />
          <InfoRow label="WAM verzekerd" value={vehicleData.wam_verzekerd} />
          <InfoRow label="Tenaamstellen mogelijk" value={vehicleData.tenaamstellen_mogelijk} />
          <InfoRow label="Export indicator" value={vehicleData.export_indicator} />
          <InfoRow label="Taxi indicator" value={vehicleData.taxi_indicator} />
        </InfoSection>

        {/* Towing Capacity */}
        {(vehicleData.maximum_massa_trekken_ongeremd || vehicleData.maximum_trekken_massa_geremd) && (
          <InfoSection title="Trekken" icon={<FaTachometerAlt />}>
            <InfoRow label="Max. trekken ongeremd" value={vehicleData.maximum_massa_trekken_ongeremd} unit="kg" />
            <InfoRow label="Max. trekken geremd" value={vehicleData.maximum_trekken_massa_geremd} unit="kg" />
            <InfoRow label="Oplegger geremd" value={vehicleData.oplegger_geremd} unit="kg" />
            <InfoRow label="Aanhanger autonoom geremd" value={vehicleData.aanhangwagen_autonoom_geremd} unit="kg" />
          </InfoSection>
        )}

        {/* Technical Details */}
        <InfoSection title="Technische Details" icon={<FaRuler />}>
          <InfoRow label="Typegoedkeuringsnummer" value={vehicleData.typegoedkeuringsnummer} />
          <InfoRow label="Chassisnummer locatie" value={vehicleData.plaats_chassisnummer} />
          <InfoRow label="Remsysteem code" value={vehicleData.type_remsysteem_voertuig_code} />
          <InfoRow label="Aanwijzingsnummer" value={vehicleData.aanwijzingsnummer} />
        </InfoSection>
      </div>

      {/* Additional Information */}
      {(vehicleData.wacht_op_keuren || vehicleData.openstaande_terugroepactie_indicator) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">Belangrijke Informatie</h3>
          {vehicleData.openstaande_terugroepactie_indicator === 'Ja' && (
            <p className="text-yellow-700 text-sm">⚠️ Er is een openstaande terugroepactie voor dit voertuig</p>
          )}
          {vehicleData.wacht_op_keuren && vehicleData.wacht_op_keuren !== 'Geen verstrekking in Open Data' && (
            <p className="text-yellow-700 text-sm">ℹ️ Wacht op keuren: {vehicleData.wacht_op_keuren}</p>
          )}
        </div>
      )}
    </div>
  );
}; 