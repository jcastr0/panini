/**
 * Departamentos y municipios principales de Colombia.
 * Fuente: DANE (subset — ~10-15 ciudades por depto, las más pobladas/conocidas).
 * Para casos no listados, el LocationSelector ofrece opción "Otro municipio"
 * que permite escribir libre.
 */

export type DepartmentData = {
  name: string;
  cities: string[];
};

export const COLOMBIA: DepartmentData[] = [
  {
    name: "Amazonas",
    cities: ["Leticia", "Puerto Nariño", "El Encanto", "La Chorrera", "Tarapacá"],
  },
  {
    name: "Antioquia",
    cities: [
      "Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo",
      "Rionegro", "Sabaneta", "Caldas", "Copacabana", "Caucasia", "La Estrella",
      "Girardota", "Marinilla", "El Carmen de Viboral", "El Bagre", "Necoclí",
      "Yarumal", "Chigorodó", "Carepa", "Santa Rosa de Osos", "Andes", "Yolombó",
    ],
  },
  {
    name: "Arauca",
    cities: ["Arauca", "Saravena", "Tame", "Arauquita", "Fortul", "Puerto Rondón", "Cravo Norte"],
  },
  {
    name: "Atlántico",
    cities: [
      "Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Galapa",
      "Puerto Colombia", "Baranoa", "Sabanagrande", "Palmar de Varela",
      "Santo Tomás", "Polonuevo", "Juan de Acosta", "Tubará", "Usiacurí",
      "Manatí", "Repelón", "Suán", "Candelaria", "Ponedera", "Luruaco", "Piojó",
    ],
  },
  {
    name: "Bogotá D.C.",
    cities: ["Bogotá"],
  },
  {
    name: "Bolívar",
    cities: [
      "Cartagena", "Magangué", "Turbaco", "Arjona", "El Carmen de Bolívar",
      "San Pablo", "Mompox", "Santa Rosa del Sur", "Simití", "San Juan Nepomuceno",
      "María la Baja", "Achí", "Morales", "Calamar", "Pinillos", "San Jacinto",
      "Talaigua Nuevo", "Tiquisio", "Villanueva", "Mahates", "Clemencia",
    ],
  },
  {
    name: "Boyacá",
    cities: [
      "Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Garagoa",
      "Puerto Boyacá", "Moniquirá", "Soatá", "Villa de Leyva", "Samacá",
      "Nobsa", "Tibasosa", "Saboyá", "Ramiriquí", "Otanche", "Guateque",
    ],
  },
  {
    name: "Caldas",
    cities: [
      "Manizales", "La Dorada", "Chinchiná", "Villamaría", "Riosucio",
      "Anserma", "Supía", "Pensilvania", "Aguadas", "Salamina", "Pácora",
      "Manzanares", "Neira", "Marquetalia", "Aranzazu", "Filadelfia",
    ],
  },
  {
    name: "Caquetá",
    cities: [
      "Florencia", "San Vicente del Caguán", "Puerto Rico", "Belén de los Andaquíes",
      "El Doncello", "La Montañita", "Cartagena del Chairá", "Curillo",
      "El Paujil", "Albania", "San José del Fragua",
    ],
  },
  {
    name: "Casanare",
    cities: [
      "Yopal", "Aguazul", "Tauramena", "Villanueva", "Paz de Ariporo",
      "Maní", "Trinidad", "Monterrey", "Pore", "Hato Corozal",
      "Nunchía", "Sácama", "Chámeza", "Recetor",
    ],
  },
  {
    name: "Cauca",
    cities: [
      "Popayán", "Santander de Quilichao", "Puerto Tejada", "Patía", "Caloto",
      "Guapi", "Timbío", "Piendamó", "Miranda", "Cajibío", "Inzá",
      "Silvia", "Toribío", "Corinto", "Bolívar", "Caldono", "Páez", "El Tambo",
    ],
  },
  {
    name: "Cesar",
    cities: [
      "Valledupar", "Aguachica", "Bosconia", "Codazzi", "La Jagua de Ibirico",
      "Curumaní", "El Copey", "Chiriguaná", "Pueblo Bello", "San Diego",
      "La Paz", "Manaure", "El Paso", "González", "Becerril", "Río de Oro",
      "Pailitas", "Tamalameque", "Pelaya", "Astrea",
    ],
  },
  {
    name: "Chocó",
    cities: [
      "Quibdó", "Istmina", "Tadó", "Condoto", "Acandí", "Bahía Solano",
      "Riosucio", "Bagadó", "Carmen del Darién", "Nuquí", "El Carmen de Atrato",
      "Lloró", "Medio Atrato", "San José del Palmar",
    ],
  },
  {
    name: "Córdoba",
    cities: [
      "Montería", "Lorica", "Cereté", "Sahagún", "Planeta Rica", "Montelíbano",
      "Ciénaga de Oro", "Tierralta", "Ayapel", "Puerto Libertador",
      "Chinú", "San Antero", "Moñitos", "San Bernardo del Viento",
      "Pueblo Nuevo", "Buenavista", "La Apartada", "Valencia",
    ],
  },
  {
    name: "Cundinamarca",
    cities: [
      "Soacha", "Girardot", "Zipaquirá", "Facatativá", "Chía", "Mosquera",
      "Madrid", "Funza", "Cajicá", "Fusagasugá", "Cota", "Tocancipá",
      "La Calera", "Sopó", "Tenjo", "Tabio", "Ubaté", "Pacho", "Sibaté",
      "Anapoima", "La Mesa", "Villeta", "Choachí",
    ],
  },
  {
    name: "Guainía",
    cities: ["Inírida", "Barranco Minas", "Mapiripana", "San Felipe", "Puerto Colombia", "La Guadalupe", "Cacahual"],
  },
  {
    name: "Guaviare",
    cities: ["San José del Guaviare", "El Retorno", "Calamar", "Miraflores"],
  },
  {
    name: "Huila",
    cities: [
      "Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre",
      "Aipe", "Rivera", "Palermo", "Hobo", "Acevedo", "Algeciras",
      "Gigante", "Tarqui", "Suaza", "Timaná", "Isnos", "San Agustín",
    ],
  },
  {
    name: "La Guajira",
    cities: [
      "Riohacha", "Maicao", "Uribia", "Manaure", "San Juan del Cesar",
      "Villanueva", "Albania", "Dibulla", "Hatonuevo", "Fonseca",
      "Barrancas", "El Molino", "La Jagua del Pilar", "Distracción", "Urumita",
    ],
  },
  {
    name: "Magdalena",
    cities: [
      "Santa Marta", "Ciénaga", "Fundación", "Aracataca", "El Banco",
      "Plato", "Pivijay", "Zona Bananera", "Sitionuevo", "Pueblo Viejo",
      "Salamina", "Algarrobo", "Sabanas de San Ángel", "Ariguaní",
      "Chivolo", "Concordia", "El Piñón", "El Retén", "Guamal",
      "Nueva Granada", "Pedraza", "Remolino", "San Sebastián de Buenavista",
      "Santa Ana", "Santa Bárbara de Pinto", "Tenerife", "Zapayán",
    ],
  },
  {
    name: "Meta",
    cities: [
      "Villavicencio", "Acacías", "Granada", "Puerto López", "Cumaral",
      "Restrepo", "Guamal", "San Martín", "Castilla la Nueva", "Puerto Gaitán",
      "El Calvario", "El Dorado", "Mesetas", "Vista Hermosa", "La Macarena",
    ],
  },
  {
    name: "Nariño",
    cities: [
      "Pasto", "Tumaco", "Ipiales", "Túquerres", "La Unión", "Samaniego",
      "Sandona", "El Charco", "Barbacoas", "Buesaco", "Chachagüí",
      "El Tambo", "La Cruz", "Linares", "Magüí", "Mosquera", "Olaya Herrera",
      "Policarpa", "Ricaurte", "Roberto Payán",
    ],
  },
  {
    name: "Norte de Santander",
    cities: [
      "Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios",
      "El Zulia", "Tibú", "Chinácota", "Toledo", "Salazar", "Cáchira",
      "Bochalema", "Sardinata", "Convención", "Teorama", "El Carmen",
    ],
  },
  {
    name: "Putumayo",
    cities: [
      "Mocoa", "Puerto Asís", "Orito", "Valle del Guamuez", "Puerto Caicedo",
      "Puerto Leguízamo", "Puerto Guzmán", "Villagarzón", "Sibundoy",
      "Colón", "San Francisco", "Santiago", "San Miguel",
    ],
  },
  {
    name: "Quindío",
    cities: [
      "Armenia", "Calarcá", "La Tebaida", "Montenegro", "Quimbaya",
      "Circasia", "Filandia", "Pijao", "Salento", "Génova", "Buenavista",
      "Córdoba",
    ],
  },
  {
    name: "Risaralda",
    cities: [
      "Pereira", "Dosquebradas", "La Virginia", "Santa Rosa de Cabal",
      "Belén de Umbría", "Apía", "Marsella", "Quinchía", "Mistrató",
      "Pueblo Rico", "Balboa", "Guática", "La Celia", "Santuario",
    ],
  },
  {
    name: "San Andrés y Providencia",
    cities: ["San Andrés", "Providencia"],
  },
  {
    name: "Santander",
    cities: [
      "Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja",
      "San Gil", "Socorro", "Málaga", "Vélez", "Lebrija", "Rionegro",
      "Charalá", "Zapatoca", "Puerto Wilches", "Sabana de Torres",
      "Mogotes", "Curití", "Suaita", "Concepción", "Cimitarra",
    ],
  },
  {
    name: "Sucre",
    cities: [
      "Sincelejo", "Corozal", "Sampués", "San Marcos", "Tolú",
      "San Onofre", "Coveñas", "Coloso", "Caimito", "Galeras",
      "Guaranda", "Los Palmitos", "Majagual", "Ovejas", "Palmito",
      "Sucre", "San Benito Abad", "San Juan de Betulia", "San Pedro",
      "Santiago de Tolú", "Sincé",
    ],
  },
  {
    name: "Tolima",
    cities: [
      "Ibagué", "Espinal", "Honda", "Mariquita", "Líbano", "Melgar",
      "Chaparral", "Purificación", "Saldaña", "Guamo", "Flandes",
      "Cajamarca", "Lérida", "Fresno", "Falan", "Ataco", "Coyaima",
      "Natagaima", "Ortega", "Planadas", "Roncesvalles", "Rovira",
    ],
  },
  {
    name: "Valle del Cauca",
    cities: [
      "Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga",
      "Yumbo", "Jamundí", "Florida", "Pradera", "Candelaria",
      "Sevilla", "Caicedonia", "Zarzal", "La Unión", "Roldanillo",
      "El Cerrito", "Ginebra", "Guacarí", "Yotoco", "Vijes",
      "Restrepo", "Dagua", "Calima", "Bolívar",
    ],
  },
  {
    name: "Vaupés",
    cities: ["Mitú", "Carurú", "Taraira"],
  },
  {
    name: "Vichada",
    cities: ["Puerto Carreño", "La Primavera", "Santa Rosalía", "Cumaribo"],
  },
];

export const DEPARTMENT_NAMES = COLOMBIA.map((d) => d.name);

/** Devuelve municipios del departamento. Si no existe, []. */
export function getCitiesOf(department: string): string[] {
  return COLOMBIA.find((d) => d.name === department)?.cities ?? [];
}

/** Valida que city pertenece al department (ignorando case). 'Otro' es comodín válido. */
export function isValidColombianCity(department: string, city: string): boolean {
  if (city === "Otro") return true;
  return getCitiesOf(department).some((c) => c.toLowerCase() === city.toLowerCase());
}
