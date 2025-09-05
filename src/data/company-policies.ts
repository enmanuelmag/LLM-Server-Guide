import { VectorItem } from '../types/rag';

/**
 * Base de Datos de Políticas de Empresa para Consultas RAG
 * Políticas financieras, operativas y de recursos humanos
 * Contenido optimizado para embeddings y consultas RAG en español
 */
export const COMPANY_POLICIES: VectorItem[] = [
  {
    id: 'policy-gastos-oficina-001',
    title: 'Política de Gastos de Oficina y Suministros',
    content:
      'POLÍTICA DE GASTOS DE OFICINA: Los empleados pueden realizar gastos de oficina hasta $500 USD por mes sin autorización previa. Los gastos incluyen: suministros de escritorio, material de oficina, productos de limpieza, café, snacks para el equipo, y software menor. Para gastos entre $500-$2000 se requiere aprobación del jefe directo. Gastos superiores a $2000 requieren aprobación del departamento financiero. Todos los gastos deben presentar recibo original y justificación del gasto. Los reembolsos se procesan en 5-7 días hábiles. Los gastos no autorizados serán rechazados.',
    category: 'financiero',
    date: '2024-01-15T10:00:00Z',
  },
  {
    id: 'policy-viajes-corporativos-001',
    title: 'Política de Viajes Corporativos y Gastos de Representación',
    content:
      'POLÍTICA DE VIAJES CORPORATIVOS: Vuelos domésticos máximo $800 por trayecto en clase económica. Vuelos internacionales máximo $1500 por trayecto. Hoteles corporativos máximo $200 por noche en ciudades principales, $150 en otras ciudades. Comidas de negocios hasta $75 por día para empleados, $150 para clientes. Transporte terrestre: taxi/uber hasta $50 por trayecto, renta de auto con aprobación previa. Se requiere pre-aprobación para viajes superiores a $1000. Los gastos personales durante viajes corporativos no son reembolsables. Presentar recibos dentro de 30 días.',
    category: 'financiero',
    date: '2024-01-20T14:30:00Z',
  },
  {
    id: 'policy-horarios-trabajo-001',
    title: 'Política de Horarios de Trabajo y Flexibilidad Laboral',
    content:
      'POLÍTICA DE HORARIOS DE TRABAJO: El horario central de oficina es de 9:00 AM a 6:00 PM, lunes a viernes. Los empleados pueden solicitar horario flexible entre 7:00 AM - 10:00 AM de entrada y 4:00 PM - 7:00 PM de salida, manteniendo 8 horas diarias. Se permite trabajo remoto hasta 3 días por semana con aprobación del supervisor. Los martes y jueves son días obligatorios en oficina para reuniones de equipo. El tiempo de almuerzo es de 1 hora, flexible entre 12:00 PM - 2:00 PM. Las horas extra requieren autorización previa y se compensan con tiempo libre o pago según la ley local.',
    category: 'recursos-humanos',
    date: '2024-02-01T09:00:00Z',
  },
  {
    id: 'policy-vacaciones-ausencias-001',
    title: 'Política de Vacaciones y Ausencias Justificadas',
    content:
      'POLÍTICA DE VACACIONES: Los empleados acumulan 1.75 días de vacaciones por mes trabajado (21 días anuales). Después de 3 años de antigüedad se otorgan 25 días anuales. Las vacaciones deben solicitarse con 15 días de anticipación. Durante diciembre se permite máximo 50% del equipo de vacaciones simultáneamente. Días por enfermedad: 10 días anuales, no acumulables. Ausencias médicas superiores a 3 días requieren certificado médico. Permisos por maternidad/paternidad según ley local más 5 días adicionales pagados. Ausencias no justificadas son descontadas del salario.',
    category: 'recursos-humanos',
    date: '2024-02-05T11:15:00Z',
  },
  {
    id: 'policy-equipos-tecnologia-001',
    title: 'Política de Equipos de Tecnología y Dispositivos',
    content:
      'POLÍTICA DE EQUIPOS TECNOLÓGICOS: Cada empleado recibe laptop corporativa (presupuesto máximo $2000), monitor externo ($400), teclado y mouse ergonómico ($150). Los equipos se renuevan cada 4 años o por falla técnica. Software corporativo: Office 365, Slack, Zoom Pro incluidos. Software especializado requiere justificación y aprobación. Los dispositivos móviles corporativos se asignan según necesidad del rol, con plan de datos corporativo. Está prohibido instalar software personal en equipos corporativos. El soporte técnico está disponible lunes a viernes 8:00 AM - 6:00 PM.',
    category: 'tecnologia',
    date: '2024-02-10T16:45:00Z',
  },
  {
    id: 'policy-capacitacion-desarrollo-001',
    title: 'Política de Capacitación y Desarrollo Profesional',
    content:
      'POLÍTICA DE CAPACITACIÓN: Cada empleado tiene presupuesto anual de $2000 para capacitación y desarrollo. Incluye cursos online, certificaciones, conferencias, workshops. Las capacitaciones relacionadas directamente con el trabajo actual tienen prioridad de aprobación. Certificaciones técnicas (AWS, Google Cloud, etc.) son 100% cubiertas por la empresa. Los empleados pueden solicitar hasta 40 horas anuales de tiempo laboral para capacitación. Las conferencias internacionales requieren justificación del beneficio para el equipo. Se requiere compartir conocimientos adquiridos mediante presentación al equipo.',
    category: 'recursos-humanos',
    date: '2024-02-15T13:20:00Z',
  },
  {
    id: 'policy-evaluacion-desempeno-001',
    title: 'Política de Evaluación de Desempeño y Promociones',
    content:
      'POLÍTICA DE EVALUACIÓN DE DESEMPEÑO: Las evaluaciones se realizan semestralmente en junio y diciembre. Incluyen autoevaluación, evaluación del supervisor, y feedback de pares. Los criterios incluyen: cumplimiento de objetivos (40%), habilidades técnicas (30%), trabajo en equipo (20%), iniciativa (10%). Los aumentos salariales se revisan anualmente basados en desempeño y presupuesto. Las promociones requieren: excelente desempeño por 12 meses, habilidades del siguiente nivel demostradas, y disponibilidad de posición. El proceso de promoción incluye entrevistas con múltiples líderes del departamento.',
    category: 'recursos-humanos',
    date: '2024-03-01T10:30:00Z',
  },
  {
    id: 'policy-seguridad-informacion-001',
    title: 'Política de Seguridad de la Información y Datos',
    content:
      'POLÍTICA DE SEGURIDAD: Todas las contraseñas deben tener mínimo 12 caracteres con mayúsculas, minúsculas, números y símbolos. La autenticación de dos factores (2FA) es obligatoria para todos los sistemas corporativos. Está prohibido compartir credenciales de acceso. Los datos sensibles solo se almacenan en sistemas aprobados por IT. Se prohíbe el uso de servicios de almacenamiento personal (Dropbox, Google Drive personal) para archivos corporativos. Todas las comunicaciones sensibles deben utilizar canales encriptados. Las violaciones de seguridad se reportan inmediatamente al departamento de IT.',
    category: 'tecnologia',
    date: '2024-03-05T14:00:00Z',
  },
  {
    id: 'policy-trabajo-remoto-001',
    title: 'Política de Trabajo Remoto y Espacios Virtuales',
    content:
      'POLÍTICA DE TRABAJO REMOTO: El trabajo remoto está permitido hasta 3 días por semana para posiciones elegibles. Los empleados remotos deben tener espacio de trabajo adecuado, internet estable (mínimo 25 Mbps), y disponibilidad durante horario central. Se requiere check-in diario con el supervisor via Slack o email. Las reuniones virtuales requieren cámara encendida. La empresa proporciona estipendio mensual de $100 para internet y servicios. Los empleados 100% remotos reciben presupuesto adicional de $500 para setup de oficina en casa. La productividad se mide por objetivos cumplidos, no por horas conectado.',
    category: 'operativo',
    date: '2024-03-10T08:45:00Z',
  },
  {
    id: 'policy-codigo-conducta-001',
    title: 'Código de Conducta Profesional y Ética Empresarial',
    content:
      'CÓDIGO DE CONDUCTA: Se espera comportamiento profesional, respetuoso e inclusivo en todo momento. Prohibido el acoso, discriminación, o comportamiento inapropiado. Las decisiones comerciales deben ser transparentes y éticas. Está prohibido aceptar regalos de proveedores superiores a $50. Los conflictos de interés deben reportarse inmediatamente a Recursos Humanos. La confidencialidad de información corporativa es obligatoria durante y después del empleo. El uso de alcohol en eventos corporativos debe ser moderado y responsable. Las violaciones del código pueden resultar en acciones disciplinarias incluyendo terminación.',
    category: 'recursos-humanos',
    date: '2024-03-15T12:00:00Z',
  },
  {
    id: 'policy-comunicacion-interna-001',
    title: 'Política de Comunicación Interna y Canales Oficiales',
    content:
      'POLÍTICA DE COMUNICACIÓN: Los canales oficiales son: email corporativo para comunicación formal, Slack para comunicación diaria, y reuniones presenciales/virtuales para decisiones importantes. Los anuncios corporativos se comunican via email y reuniones all-hands mensuales. El canal #general de Slack es para anuncios del equipo, #random para conversación casual. Se prohíbe comunicación sobre temas sensibles (salarios, evaluaciones, despidos) por canales públicos. Las quejas o conflictos se manejan directamente con el supervisor o Recursos Humanos. La comunicación externa en nombre de la empresa requiere aprobación previa.',
    category: 'operativo',
    date: '2024-03-20T15:30:00Z',
  },
  {
    id: 'policy-beneficios-empleados-001',
    title: 'Política de Beneficios y Prestaciones para Empleados',
    content:
      'POLÍTICA DE BENEFICIOS: Seguro médico corporativo cubre 100% para empleado, 75% para dependientes. Seguro dental y de visión incluido. Plan de retiro 401k con matching del 6% después de 6 meses de empleo. Beneficio de bienestar: reembolso hasta $500 anuales por gym, deportes, o actividades de salud. Descuentos corporativos en restaurantes, hoteles, y servicios locales. Programa de asistencia al empleado (EAP) para apoyo psicológico y financiero. Estacionamiento gratuito en oficina principal. Snacks, café, y almuerzo gratuito los viernes.',
    category: 'recursos-humanos',
    date: '2024-03-25T11:45:00Z',
  },
];
