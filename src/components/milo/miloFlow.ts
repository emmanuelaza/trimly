export interface MiloOption {
  label: string
  nextNode: string
  isSpecial?: boolean
}

export interface MiloNode {
  id: string
  message: string
  options: MiloOption[]
  isFinal?: boolean
}

const miloFlow: Record<string, MiloNode> = {
  inicio: {
    id: 'inicio',
    message: "¡Hola! Soy Milo, tu guía en Trimly 👋\n¿Sobre qué te puedo ayudar hoy?",
    options: [
      { label: "📅 La agenda y las citas", nextNode: 'agenda_inicio' },
      { label: "👥 Los clientes", nextNode: 'clientes_inicio' },
      { label: "💰 La nómina de mis barberos", nextNode: 'nomina_inicio' },
      { label: "✂️ Los servicios", nextNode: 'servicios_inicio' },
      { label: "🔗 Mi página pública", nextNode: 'pagina_inicio' },
      { label: "⚙️ La configuración", nextNode: 'config_inicio' },
    ]
  },
  
  // RAMA: AGENDA
  agenda_inicio: {
    id: 'agenda_inicio',
    message: "La agenda es donde viven todas tus citas 📅\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo veo mis citas del día?", nextNode: 'agenda_ver_dia' },
      { label: "¿Cómo creo una cita manual?", nextNode: 'agenda_crear' },
      { label: "¿Por qué se bloqueó un horario?", nextNode: 'agenda_bloqueo' },
      { label: "¿Cómo cancelo una cita?", nextNode: 'agenda_cancelar' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  agenda_ver_dia: {
    id: 'agenda_ver_dia',
    message: "Para ver tus citas del día entra a *Agenda* en el menú de la izquierda 📅\n\nArriba puedes cambiar la vista:\n📆 *Día* — solo ves las citas de hoy\n📆 *Semana* — ves toda la semana de un vistazo\n📆 *Mes* — vista general del mes completo\n\nCada cita muestra el nombre del cliente, el servicio y el barbero asignado.",
    options: [
      { label: "¿Puedo filtrar por barbero?", nextNode: 'agenda_filtro' },
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  agenda_filtro: {
    id: 'agenda_filtro',
    message: "Sí 🎯 Arriba del calendario hay un filtro de barberos. Toca el nombre del barbero que quieres ver y la agenda se filtra solo con sus citas.\n\nPara volver a ver todos, toca *'Todos'*.",
    options: [
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  agenda_crear: {
    id: 'agenda_crear',
    message: "Para crear una cita manualmente tienes dos formas 👇\n\n1️⃣ Toca cualquier espacio vacío en el calendario y se abre el formulario\n\n2️⃣ Toca el botón *'+ Nueva cita'* arriba a la derecha\n\nAhí eliges el cliente, el servicio, el barbero y la hora. ¡Listo!",
    options: [
      { label: "¿Qué pasa si el horario ya está ocupado?", nextNode: 'agenda_bloqueo' },
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  agenda_bloqueo: {
    id: 'agenda_bloqueo',
    message: "Cuando un cliente reserva desde tu página pública, ese horario se bloquea *automáticamente* para que nadie más lo tome 🔒\n\nSi ves un espacio bloqueado en gris es porque:\n⏰ Ya hay una cita en ese horario\n🔧 Está fuera del horario de trabajo del barbero\n\nPara cambiar el horario de trabajo de un barbero ve a *Configuración → Equipo*.",
    options: [
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  agenda_cancelar: {
    id: 'agenda_cancelar',
    message: "Para cancelar una cita:\n\n1️⃣ Toca la cita en el calendario\n2️⃣ Se abre el detalle de la cita\n3️⃣ Toca *'Cancelar cita'* al final\n\nEl horario queda libre automáticamente para que otro cliente pueda reservarlo.",
    options: [
      { label: "¿El cliente recibe aviso de la cancelación?", nextNode: 'agenda_cancelar_aviso' },
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  agenda_cancelar_aviso: {
    id: 'agenda_cancelar_aviso',
    message: "Sí 📩 Cuando cancelas una cita, Trimly le envía automáticamente un mensaje al cliente informándole que su cita fue cancelada.\n\nEl mensaje sale desde el sistema de notificaciones de tu barbería.",
    options: [
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },

  // RAMA: CLIENTES
  clientes_inicio: {
    id: 'clientes_inicio',
    message: "En la sección de Clientes tienes toda la información de las personas que visitan tu barbería 👥\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo veo el historial de un cliente?", nextNode: 'clientes_historial' },
      { label: "¿Cómo recupero clientes inactivos?", nextNode: 'clientes_inactivos' },
      { label: "¿Cómo agrego un cliente nuevo?", nextNode: 'clientes_agregar' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  clientes_historial: {
    id: 'clientes_historial',
    message: "Para ver el historial de un cliente:\n\n1️⃣ Ve a *Clientes* en el menú\n2️⃣ Busca el nombre del cliente\n3️⃣ Tócalo para abrir su perfil\n\nAhí ves:\n📅 Cuándo fue su última visita\n✂️ Qué servicios ha pedido\n📊 Cuántas veces ha venido",
    options: [
      { label: "¿Puedo editar los datos del cliente?", nextNode: 'clientes_editar' },
      { label: "Tengo otra duda sobre clientes", nextNode: 'clientes_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  clientes_editar: {
    id: 'clientes_editar',
    message: "Sí ✏️ Dentro del perfil del cliente toca el botón *'Editar'* para cambiar su nombre, WhatsApp o email.\n\nLos cambios se guardan automáticamente.",
    options: [
      { label: "Tengo otra duda sobre clientes", nextNode: 'clientes_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  clientes_inactivos: {
    id: 'clientes_inactivos',
    message: "Trimly detecta automáticamente los clientes que llevan más de 30 días sin visitar tu barbería 🔍\n\nPuedes verlos en *Clientes → Inactivos*.\n\nDesde ahí puedes enviarles un mensaje por WhatsApp para traerlos de vuelta. ¡Eso es dinero recuperado sin hacer nada!",
    options: [
      { label: "¿Puedo cambiar el tiempo de inactividad?", nextNode: 'clientes_inactivos_tiempo' },
      { label: "Tengo otra duda sobre clientes", nextNode: 'clientes_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  clientes_inactivos_tiempo: {
    id: 'clientes_inactivos_tiempo',
    message: "Sí ⚙️ Puedes cambiarlo en *Configuración → Automatizaciones*.\n\nAhí defines cuántos días sin visita considera Trimly a un cliente como inactivo. El valor por defecto son 30 días.",
    options: [
      { label: "Tengo otra duda sobre clientes", nextNode: 'clientes_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  clientes_agregar: {
    id: 'clientes_agregar',
    message: "Los clientes se agregan de dos formas:\n\n🔗 *Automática* — cuando reservan desde tu página pública, Trimly los guarda solo\n\n✋ *Manual* — en *Clientes → + Nuevo cliente* agregas su nombre y WhatsApp tú mismo",
    options: [
      { label: "Tengo otra duda sobre clientes", nextNode: 'clientes_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },

  // RAMA: NÓMINA
  nomina_inicio: {
    id: 'nomina_inicio',
    message: "La Nómina te ayuda a controlar exactamente cuánto le debes a cada barbero 💰\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo configuro el pago de un barbero?", nextNode: 'nomina_configurar' },
      { label: "¿Cómo veo cuánto le debo a alguien?", nextNode: 'nomina_ver' },
      { label: "¿Cómo registro que ya le pagué?", nextNode: 'nomina_pagar' },
      { label: "¿Dónde veo el historial de pagos?", nextNode: 'nomina_historial' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  nomina_configurar: {
    id: 'nomina_configurar',
    message: "Para configurar el esquema de pago de un barbero:\n\n1️⃣ Ve a *Nómina* en el menú\n2️⃣ Toca el barbero que quieres configurar\n3️⃣ Elige su esquema de pago:",
    options: [
      { label: "¿Qué es el esquema de porcentaje?", nextNode: 'nomina_porcentaje' },
      { label: "¿Qué es la nómina fija?", nextNode: 'nomina_fija' },
      { label: "¿Qué es el pago por servicio?", nextNode: 'nomina_por_servicio' },
    ]
  },
  nomina_porcentaje: {
    id: 'nomina_porcentaje',
    message: "📊 *Porcentaje por servicio*\n\nEl barbero gana un % del precio de cada corte que realiza.\n\nEjemplo: si el corte vale $30.000 y el barbero tiene 50%, él gana $15.000 por ese corte.\n\nTú defines el porcentaje y Trimly calcula todo automáticamente.",
    options: [
      { label: "¿Puedo cambiar el porcentaje después?", nextNode: 'nomina_cambio' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  nomina_fija: {
    id: 'nomina_fija',
    message: "📋 *Nómina fija mensual*\n\nEl barbero recibe el mismo monto cada mes sin importar cuántos cortes haga.\n\nIdeal para barberos de confianza con horario completo en tu barbería.",
    options: [
      { label: "¿Puedo cambiar el monto después?", nextNode: 'nomina_cambio' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  nomina_por_servicio: {
    id: 'nomina_por_servicio',
    message: "🔧 *Pago fijo por servicio*\n\nCada servicio tiene un valor fijo para el barbero, sin importar el precio que pague el cliente.\n\nEjemplo: por cada corte → $12.000 fijos\nPor cada barba → $8.000 fijos\n\nTú defines el valor para cada servicio.",
    options: [
      { label: "¿Puedo cambiar los valores después?", nextNode: 'nomina_cambio' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  nomina_cambio: {
    id: 'nomina_cambio',
    message: "Sí ✅ Puedes cambiar el esquema o los valores de cualquier barbero en cualquier momento.\n\nEl cambio aplica desde la fecha en que lo haces. Los registros anteriores quedan como estaban.",
    options: [
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  nomina_ver: {
    id: 'nomina_ver',
    message: "En *Nómina* ves una tabla con todos tus barberos y lo que les debes 👇\n\nPara cada barbero ves:\n📊 Cuántas citas hizo en el período\n💰 Cuánto generó en ventas\n💵 Lo que le corresponde según su esquema\n🟡 Si el pago está *Pendiente* o *Pagado*\n\nPuedes filtrar por semana o por mes.",
    options: [
      { label: "¿Cómo registro que ya le pagué?", nextNode: 'nomina_pagar' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  nomina_pagar: {
    id: 'nomina_pagar',
    message: "Cuando le pagues a un barbero (efectivo, Nequi, transferencia):\n\n1️⃣ En la tabla de Nómina busca al barbero\n2️⃣ Toca *'Marcar como pagado'*\n3️⃣ Agrega una nota opcional: 'Transferencia Nequi 15 mayo'\n4️⃣ Confirma el pago\n\nEl estado cambia a ✅ *Pagado* y queda guardado en el historial para siempre.",
    options: [
      { label: "¿Puedo deshacer un pago marcado?", nextNode: 'nomina_deshacer' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  nomina_deshacer: {
    id: 'nomina_deshacer',
    message: "No ❌ Una vez marcado como pagado no se puede deshacer.\n\nEsto es para mantener la integridad del historial de pagos de tu barbería.\n\nSi cometiste un error habla con soporte por WhatsApp y te ayudamos.",
    options: [
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  nomina_historial: {
    id: 'nomina_historial',
    message: "Para ver el historial completo de pagos:\n\n1️⃣ Ve a *Nómina*\n2️⃣ Toca la pestaña *'Historial'*\n\nAhí ves todos los pagos registrados con:\n📅 Fecha del pago\n👤 Barbero\n💵 Monto pagado\n📝 Nota que escribiste\n\nTambién puedes exportar el historial en CSV para guardarlo en Excel.",
    options: [
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },

  // RAMA: SERVICIOS
  servicios_inicio: {
    id: 'servicios_inicio',
    message: "En Servicios configuras todo lo que ofrece tu barbería ✂️\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo agrego un servicio nuevo?", nextNode: 'servicios_agregar' },
      { label: "¿Cómo cambio el precio de un servicio?", nextNode: 'servicios_precio' },
      { label: "¿Cómo elimino un servicio?", nextNode: 'servicios_eliminar' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  servicios_agregar: {
    id: 'servicios_agregar',
    message: "Para agregar un servicio:\n\n1️⃣ Ve a *Servicios* en el menú\n2️⃣ Toca *'+ Nuevo servicio'*\n3️⃣ Completa:\n   📝 Nombre del servicio\n   ⏱️ Duración en minutos\n   💰 Precio en pesos\n\n4️⃣ Toca *'Guardar'*\n\nEl servicio aparece de inmediato en tu página pública de reservas.",
    options: [
      { label: "¿Puedo desactivar un servicio temporalmente?", nextNode: 'servicios_desactivar' },
      { label: "Tengo otra duda sobre servicios", nextNode: 'servicios_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  servicios_desactivar: {
    id: 'servicios_desactivar',
    message: "Sí ✅ En la lista de servicios cada uno tiene un interruptor para activarlo o desactivarlo.\n\nSi lo desactivas no aparece en tu página pública pero queda guardado para activarlo después cuando quieras.",
    options: [
      { label: "Tengo otra duda sobre servicios", nextNode: 'servicios_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  servicios_precio: {
    id: 'servicios_precio',
    message: "Para cambiar el precio de un servicio:\n\n1️⃣ Ve a *Servicios*\n2️⃣ Toca el servicio que quieres editar\n3️⃣ Cambia el precio\n4️⃣ Toca *'Guardar'*\n\nEl nuevo precio se refleja de inmediato en tu página pública.",
    options: [
      { label: "Tengo otra duda sobre servicios", nextNode: 'servicios_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  servicios_eliminar: {
    id: 'servicios_eliminar',
    message: "Para eliminar un servicio:\n\n1️⃣ Ve a *Servicios*\n2️⃣ Toca el servicio\n3️⃣ Toca *'Eliminar'* al final\n\n⚠️ Si el servicio tiene citas futuras asignadas Trimly te avisa antes de eliminar para que lo tengas en cuenta.",
    options: [
      { label: "Tengo otra duda sobre servicios", nextNode: 'servicios_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },

  // RAMA: PÁGINA PÚBLICA
  pagina_inicio: {
    id: 'pagina_inicio',
    message: "Tu página pública es donde tus clientes reservan su cita sin mandarte un WhatsApp 🔗\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo comparto mi link?", nextNode: 'pagina_link' },
      { label: "¿Cómo personalizo mi página?", nextNode: 'pagina_personalizar' },
      { label: "¿Por qué no me llegan reservas?", nextNode: 'pagina_sin_reservas' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  pagina_link: {
    id: 'pagina_link',
    message: "Tu link único de reservas es:\ntrimlyapp-phi.vercel.app/[tu-barbería]\n\nPara copiarlo:\n1️⃣ Ve a *Mi página* en el menú\n2️⃣ Toca *'Copiar link'*\n\nPuedes compartirlo en:\n📱 Tu estado de WhatsApp\n📸 La bio de Instagram\n💬 Grupos de clientes\n\n¡Entre más lo compartas más reservas recibes sin hacer nada!",
    options: [
      { label: "¿Cómo lo envío por WhatsApp?", nextNode: 'pagina_whatsapp' },
      { label: "Tengo otra duda sobre mi página", nextNode: 'pagina_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  pagina_whatsapp: {
    id: 'pagina_whatsapp',
    message: "En *Mi página* hay un botón *'Compartir por WhatsApp'* 📱\n\nAl tocarlo se abre WhatsApp con el mensaje listo que dice:\n'Reserva tu cita en mi barbería aquí: [link]'\n\nSolo seleccionas el contacto o el grupo y lo envías. ¡Listo!",
    options: [
      { label: "Tengo otra duda sobre mi página", nextNode: 'pagina_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  pagina_personalizar: {
    id: 'pagina_personalizar',
    message: "Puedes personalizar tu página pública en *Configuración → Mi barbería*:\n\n🖼️ Logo de tu barbería\n🎨 Color principal\n📸 Foto de portada\n💬 Mensaje de bienvenida\n👤 Fotos de tus barberos\n\nTodo se ve en tiempo real antes de guardar los cambios.",
    options: [
      { label: "Tengo otra duda sobre mi página", nextNode: 'pagina_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  pagina_sin_reservas: {
    id: 'pagina_sin_reservas',
    message: "Si no te están llegando reservas puede ser por una de estas razones:\n\n🔗 *No has compartido el link* — es lo más común. Ponlo en tu WhatsApp e Instagram hoy mismo.\n\n✂️ *No tienes servicios activos* — verifica en *Servicios* que tengas al menos uno activo.\n\n👤 *No tienes barberos configurados* — revisa en *Configuración → Equipo*.",
    options: [
      { label: "¿Cómo activo mis servicios?", nextNode: 'servicios_desactivar' },
      { label: "Tengo otra duda sobre mi página", nextNode: 'pagina_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },

  // RAMA: CONFIGURACIÓN
  config_inicio: {
    id: 'config_inicio',
    message: "En Configuración personalizas todo tu perfil y tu barbería ⚙️\n¿Qué necesitas ajustar?",
    options: [
      { label: "¿Cómo cambio los horarios de trabajo?", nextNode: 'config_horarios' },
      { label: "¿Cómo invito a mis barberos?", nextNode: 'config_invitar' },
      { label: "¿Cómo cambio mi plan?", nextNode: 'config_plan' },
      { label: "¿Cómo cambio mi contraseña?", nextNode: 'config_contrasena' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  config_horarios: {
    id: 'config_horarios',
    message: "Para cambiar los horarios de trabajo:\n\n1️⃣ Ve a *Configuración → Equipo*\n2️⃣ Toca el barbero que quieres editar\n3️⃣ Ajusta los días y las horas\n4️⃣ Guarda los cambios\n\nLos horarios actualizados se reflejan de inmediato en la página pública. Los clientes solo verán horarios disponibles dentro de ese rango.",
    options: [
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  config_invitar: {
    id: 'config_invitar',
    message: "Para invitar a un barbero a Trimly:\n\n1️⃣ Ve a *Configuración → Equipo*\n2️⃣ Busca el barbero en la lista\n3️⃣ Toca *'Invitar a Trimly'*\n4️⃣ Se genera un link único para ese barbero\n5️⃣ Toca *'Enviar por WhatsApp'*\n\nEl barbero recibe el link, se registra y puede ver sus citas y ganancias desde su propio acceso.",
    options: [
      { label: "¿Qué puede ver el barbero?", nextNode: 'config_barbero_vista' },
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  config_barbero_vista: {
    id: 'config_barbero_vista',
    message: "El barbero solo puede ver:\n📅 Sus propias citas\n💰 Sus propias ganancias\n📊 Su resumen del día\n\nNo puede ver:\n❌ Las citas de otros barberos\n❌ Los ingresos totales de la barbería\n❌ La configuración ni los precios\n❌ Los datos de clientes completos\n\nTu información está protegida 🔒",
    options: [
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  config_plan: {
    id: 'config_plan',
    message: "Para ver o cambiar tu plan actual:\n\n1️⃣ Ve a *Configuración → Facturación*\n2️⃣ Ahí ves tu plan actual y la fecha de renovación\n3️⃣ Toca *'Cambiar plan'* para subir o bajar de plan\n\n¿Tienes alguna duda sobre los planes?",
    options: [
      { label: "¿Qué incluye el plan Básico?", nextNode: 'plan_basico' },
      { label: "¿Qué incluye el plan Filo Pro?", nextNode: 'plan_pro' },
      { label: "¿Qué es el plan Lifetime?", nextNode: 'plan_lifetime' },
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
    ]
  },
  plan_basico: {
    id: 'plan_basico',
    message: "📦 *Plan Básico — $29.900/mes*\n\n✅ 1 barbero incluido\n✅ Agenda online activa 24/7\n✅ Link de reservas personalizado\n✅ Recordatorios automáticos\n✅ Hasta 100 citas por mes\n\nPerfecto para empezar a digitalizar tu barbería.",
    options: [
      { label: "¿Qué incluye el Filo Pro?", nextNode: 'plan_pro' },
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  plan_pro: {
    id: 'plan_pro',
    message: "⚡ *Plan Filo Pro — $79.900/mes*\n\n✅ Todo el plan Básico\n✅ Barberos ilimitados\n✅ Citas ilimitadas\n✅ Reportes avanzados\n✅ Recuperación de clientes inactivos\n✅ Automatizaciones completas\n✅ Nómina y comisiones\n✅ Soporte prioritario",
    options: [
      { label: "¿Qué es el plan Lifetime?", nextNode: 'plan_lifetime' },
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  plan_lifetime: {
    id: 'plan_lifetime',
    message: "🔥 *Plan Lifetime — $559.000 único pago*\n\nPagas una sola vez y tienes el plan Filo Pro para siempre. Sin mensualidades, sin renovaciones, sin sorpresas.\n\nTambién incluye todas las funciones nuevas que se agreguen en el futuro.\n\nEs la opción más inteligente si vas a usar Trimly a largo plazo 💡",
    options: [
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },
  config_contrasena: {
    id: 'config_contrasena',
    message: "Para cambiar tu contraseña:\n\n1️⃣ Ve a *Configuración → Mi cuenta*\n2️⃣ Toca *'Cambiar contraseña'*\n3️⃣ Ingresa tu contraseña actual\n4️⃣ Ingresa la nueva contraseña\n5️⃣ Confirma y guarda\n\nSi olvidaste tu contraseña, en la pantalla de login toca *'Olvidé mi contraseña'* y te enviamos un link de recuperación a tu email.",
    options: [
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí, gracias 👍", nextNode: 'final_gracias' },
    ]
  },

  // NODO FINAL
  final_gracias: {
    id: 'final_gracias',
    message: "¡Con gusto! 😊 Si tienes otra duda aquí estaré.\n\nRecuerda que también puedes escribirnos directo por WhatsApp si necesitas ayuda más específica 👇",
    isFinal: true,
    options: [
      { label: "💬 Hablar con soporte", nextNode: 'whatsapp_support', isSpecial: true },
      { label: "Tengo otra pregunta", nextNode: 'inicio' },
    ]
  }
};

export default miloFlow;
