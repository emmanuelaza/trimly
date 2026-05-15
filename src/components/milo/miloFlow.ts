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

  // ─── INICIO ────────────────────────────────────────────────────────────────
  inicio: {
    id: 'inicio',
    message: "¡Hola! Soy Milo, tu asistente en Trimly 👋\n¿Sobre qué te puedo ayudar hoy?",
    options: [
      { label: "📅 Agenda y citas", nextNode: 'agenda_inicio' },
      { label: "👥 Clientes", nextNode: 'clientes_inicio' },
      { label: "✂️ Servicios", nextNode: 'servicios_inicio' },
      { label: "🛍️ Productos", nextNode: 'productos_inicio' },
      { label: "💰 Nómina", nextNode: 'nomina_inicio' },
      { label: "🤖 Automatizaciones", nextNode: 'auto_inicio' },
      { label: "Más opciones…", nextNode: 'inicio_2' },
    ]
  },
  inicio_2: {
    id: 'inicio_2',
    message: "También puedo ayudarte con estas secciones:",
    options: [
      { label: "🏷️ Cupones", nextNode: 'cupones_inicio' },
      { label: "⭐ Reseñas", nextNode: 'resenas_inicio' },
      { label: "📊 Reportes y métricas", nextNode: 'reportes_inicio' },
      { label: "👤 Mi equipo (barberos)", nextNode: 'equipo_inicio' },
      { label: "🔗 Mi página pública", nextNode: 'pagina_inicio' },
      { label: "⚙️ Configuración y planes", nextNode: 'config_inicio' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },

  // ─── AGENDA ────────────────────────────────────────────────────────────────
  agenda_inicio: {
    id: 'agenda_inicio',
    message: "La agenda es donde viven todas tus citas 📅\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo veo las citas del día?", nextNode: 'agenda_ver_dia' },
      { label: "¿Cómo creo una cita manual?", nextNode: 'agenda_crear' },
      { label: "¿Por qué está bloqueado un horario?", nextNode: 'agenda_bloqueo' },
      { label: "¿Cómo cancelo una cita?", nextNode: 'agenda_cancelar' },
      { label: "¿Puedo filtrar por barbero?", nextNode: 'agenda_filtro' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  agenda_ver_dia: {
    id: 'agenda_ver_dia',
    message: "Ve a *Agenda* en el menú 📅\n\nArriba cambias la vista:\n📆 *Día* — solo las citas de hoy\n📆 *Semana* — toda la semana de un vistazo\n📆 *Mes* — vista general\n\nCada cita muestra el nombre del cliente, el servicio y el barbero asignado.",
    options: [
      { label: "¿Puedo filtrar por barbero?", nextNode: 'agenda_filtro' },
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  agenda_filtro: {
    id: 'agenda_filtro',
    message: "Arriba del calendario hay un selector de barberos 🎯\n\nToca el nombre del barbero que quieres ver y la agenda se filtra solo con sus citas.\n\nPara volver a ver todos toca *'Todos'*.",
    options: [
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  agenda_crear: {
    id: 'agenda_crear',
    message: "Dos formas de crear una cita manual 👇\n\n1️⃣ Toca cualquier espacio vacío en el calendario → se abre el formulario\n\n2️⃣ Botón *'+ Nueva cita'* arriba a la derecha\n\nEliges cliente, servicio, barbero y hora. ¡Listo!",
    options: [
      { label: "¿Qué pasa si el horario ya está ocupado?", nextNode: 'agenda_bloqueo' },
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  agenda_bloqueo: {
    id: 'agenda_bloqueo',
    message: "Un horario bloqueado en gris puede ser por:\n\n⏰ Ya hay una cita reservada en ese momento\n🔧 Está fuera del horario de trabajo del barbero\n\nPara cambiar el horario de trabajo de un barbero ve a *Configuración → Barberos*.",
    options: [
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  agenda_cancelar: {
    id: 'agenda_cancelar',
    message: "Para cancelar una cita:\n\n1️⃣ Toca la cita en el calendario\n2️⃣ Se abre el detalle\n3️⃣ Toca *'Cancelar cita'*\n\nEl horario queda libre automáticamente.",
    options: [
      { label: "¿El cliente recibe aviso?", nextNode: 'agenda_cancelar_aviso' },
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  agenda_cancelar_aviso: {
    id: 'agenda_cancelar_aviso',
    message: "Sí 📩 Si tienes activa la automatización de *'Confirmación al agendar'*, Trimly le envía un correo al cliente informándole que su cita fue cancelada.\n\nPuedes gestionar eso en *Automatizaciones*.",
    options: [
      { label: "¿Cómo funcionan las automatizaciones?", nextNode: 'auto_inicio' },
      { label: "Tengo otra duda sobre la agenda", nextNode: 'agenda_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── CLIENTES ──────────────────────────────────────────────────────────────
  clientes_inicio: {
    id: 'clientes_inicio',
    message: "En Clientes tienes toda la info de las personas que visitan tu barbería 👥\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo veo el historial de un cliente?", nextNode: 'clientes_historial' },
      { label: "¿Cómo recupero clientes inactivos?", nextNode: 'clientes_inactivos' },
      { label: "¿Cómo agrego un cliente?", nextNode: 'clientes_agregar' },
      { label: "¿Puedo editar los datos de un cliente?", nextNode: 'clientes_editar' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  clientes_historial: {
    id: 'clientes_historial',
    message: "Para ver el historial de un cliente:\n\n1️⃣ Ve a *Clientes*\n2️⃣ Busca el nombre y tócalo\n\nDentro del perfil ves:\n📅 Última visita\n✂️ Servicios que ha pedido\n📊 Total de visitas\n💵 Total gastado",
    options: [
      { label: "¿Puedo editar sus datos?", nextNode: 'clientes_editar' },
      { label: "Tengo otra duda sobre clientes", nextNode: 'clientes_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  clientes_editar: {
    id: 'clientes_editar',
    message: "Sí ✏️ Dentro del perfil del cliente toca *'Editar'* para cambiar su nombre, WhatsApp o email.\n\nLos cambios se guardan automáticamente.",
    options: [
      { label: "Tengo otra duda sobre clientes", nextNode: 'clientes_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  clientes_inactivos: {
    id: 'clientes_inactivos',
    message: "Trimly detecta clientes que llevan más de 30 días sin visitar 🔍\n\nEncuéntralos en *Clientes → Inactivos*.\n\nDesde ahí puedes enviarles un mensaje por WhatsApp para traerlos de vuelta. También hay una automatización de *'Recuperación de clientes'* que lo hace sola cuando la activas.",
    options: [
      { label: "¿Cómo activo la recuperación automática?", nextNode: 'auto_win_back' },
      { label: "Tengo otra duda sobre clientes", nextNode: 'clientes_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  clientes_agregar: {
    id: 'clientes_agregar',
    message: "Los clientes se agregan de dos formas:\n\n🔗 *Automática* — cuando reservan desde tu página pública Trimly los guarda solos\n\n✋ *Manual* — en *Clientes → + Nuevo cliente* agregas nombre y WhatsApp tú mismo",
    options: [
      { label: "Tengo otra duda sobre clientes", nextNode: 'clientes_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── SERVICIOS ─────────────────────────────────────────────────────────────
  servicios_inicio: {
    id: 'servicios_inicio',
    message: "En Servicios configuras todo lo que ofrece tu barbería ✂️\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo agrego un servicio nuevo?", nextNode: 'servicios_agregar' },
      { label: "¿Cómo cambio el precio de un servicio?", nextNode: 'servicios_precio' },
      { label: "¿Cómo desactivo un servicio temporalmente?", nextNode: 'servicios_desactivar' },
      { label: "¿Cómo elimino un servicio?", nextNode: 'servicios_eliminar' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  servicios_agregar: {
    id: 'servicios_agregar',
    message: "Para agregar un servicio:\n\n1️⃣ Ve a *Servicios → + Nuevo servicio*\n2️⃣ Completa:\n   📝 Nombre\n   ⏱️ Duración en minutos\n   💰 Precio\n3️⃣ Toca *'Guardar'*\n\nAparece de inmediato en tu página pública de reservas.",
    options: [
      { label: "¿Puedo asignar un servicio a barberos específicos?", nextNode: 'servicios_asignar' },
      { label: "Tengo otra duda sobre servicios", nextNode: 'servicios_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  servicios_asignar: {
    id: 'servicios_asignar',
    message: "Sí ✅ Al crear o editar un servicio puedes elegir qué barberos lo ofrecen.\n\nSi un barbero no tiene ese servicio asignado, los clientes no lo verán disponible cuando ese barbero esté seleccionado en la reserva.",
    options: [
      { label: "Tengo otra duda sobre servicios", nextNode: 'servicios_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  servicios_desactivar: {
    id: 'servicios_desactivar',
    message: "Cada servicio tiene un interruptor de activo/inactivo 🔄\n\nSi lo desactivas deja de aparecer en tu página pública pero queda guardado para activarlo cuando quieras.",
    options: [
      { label: "Tengo otra duda sobre servicios", nextNode: 'servicios_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  servicios_precio: {
    id: 'servicios_precio',
    message: "Para cambiar el precio:\n\n1️⃣ Ve a *Servicios*\n2️⃣ Toca el servicio que quieres editar\n3️⃣ Cambia el precio\n4️⃣ Toca *'Guardar'*\n\nEl nuevo precio se refleja de inmediato en la página pública.",
    options: [
      { label: "Tengo otra duda sobre servicios", nextNode: 'servicios_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  servicios_eliminar: {
    id: 'servicios_eliminar',
    message: "Para eliminar un servicio:\n\n1️⃣ Ve a *Servicios*\n2️⃣ Toca el servicio\n3️⃣ Toca *'Eliminar'* al final\n\n⚠️ Si tiene citas futuras asignadas Trimly te avisa antes de eliminar.",
    options: [
      { label: "Tengo otra duda sobre servicios", nextNode: 'servicios_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── PRODUCTOS ─────────────────────────────────────────────────────────────
  productos_inicio: {
    id: 'productos_inicio',
    message: "En Productos controlas el inventario y las ventas de tu barbería 🛍️\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo agrego un producto nuevo?", nextNode: 'productos_agregar' },
      { label: "¿Qué categorías existen?", nextNode: 'productos_categorias' },
      { label: "¿Cómo registro una venta de producto?", nextNode: 'productos_venta' },
      { label: "¿Cómo controlo el stock?", nextNode: 'productos_stock' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  productos_agregar: {
    id: 'productos_agregar',
    message: "Para agregar un producto:\n\n1️⃣ Ve a *Productos → + Agregar producto*\n2️⃣ Completa:\n   📝 Nombre\n   🏷️ Categoría\n   💰 Precio de venta\n   📦 Stock inicial\n3️⃣ Toca *'Guardar'*\n\nEl producto queda disponible para registrar ventas.",
    options: [
      { label: "¿Qué categorías puedo usar?", nextNode: 'productos_categorias' },
      { label: "Tengo otra duda sobre productos", nextNode: 'productos_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  productos_categorias: {
    id: 'productos_categorias',
    message: "Las categorías de productos en Trimly son:\n\n💈 Pomadas\n🧴 Shampoo\n💧 Aceites\n🪒 Cuchillas\n✂️ Accesorios\n🧔 Cuidado de barba\n📦 Otro\n\nElige la que mejor describa cada producto para mantener todo organizado.",
    options: [
      { label: "¿Cómo agrego un producto?", nextNode: 'productos_agregar' },
      { label: "Tengo otra duda sobre productos", nextNode: 'productos_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  productos_venta: {
    id: 'productos_venta',
    message: "Para registrar que vendiste un producto:\n\n1️⃣ Ve a *Productos*\n2️⃣ Busca el producto vendido\n3️⃣ Toca *'Registrar venta'*\n4️⃣ Ingresa la cantidad\n5️⃣ Confirma\n\nEl stock se descuenta automáticamente y la venta queda en el historial.",
    options: [
      { label: "¿Cómo veo el historial de ventas?", nextNode: 'productos_historial' },
      { label: "Tengo otra duda sobre productos", nextNode: 'productos_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  productos_historial: {
    id: 'productos_historial',
    message: "Puedes ver el historial de ventas de productos en *Reportes*.\n\nAhí ves:\n📅 Qué se vendió y cuándo\n💵 Ingresos por producto\n📦 Productos más vendidos",
    options: [
      { label: "¿Cómo exporto los reportes?", nextNode: 'reportes_exportar' },
      { label: "Tengo otra duda sobre productos", nextNode: 'productos_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  productos_stock: {
    id: 'productos_stock',
    message: "Trimly descuenta el stock automáticamente con cada venta registrada 📦\n\nPara ajustar el stock manualmente (cuando recibes mercancía o haces inventario):\n\n1️⃣ Ve a *Productos*\n2️⃣ Toca el producto\n3️⃣ Edita la cantidad en stock\n4️⃣ Guarda\n\nCuando el stock llega a cero el producto aparece marcado en rojo.",
    options: [
      { label: "Tengo otra duda sobre productos", nextNode: 'productos_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── NÓMINA ────────────────────────────────────────────────────────────────
  nomina_inicio: {
    id: 'nomina_inicio',
    message: "La Nómina controla exactamente cuánto le debes a cada barbero 💰\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo configuro el pago de un barbero?", nextNode: 'nomina_configurar' },
      { label: "¿Cómo veo cuánto le debo a alguien?", nextNode: 'nomina_ver' },
      { label: "¿Cómo registro que ya le pagué?", nextNode: 'nomina_pagar' },
      { label: "¿Cómo cambio el período que estoy viendo?", nextNode: 'nomina_periodo' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  nomina_periodo: {
    id: 'nomina_periodo',
    message: "Arriba de la nómina hay tres pestañas de período 📆\n\n📅 *Este mes* — muestra las citas y ganancias del mes en curso\n📅 *Mes anterior* — el mes pasado completo\n📅 *Personalizado* — tú defines el rango de fechas con dos calendarios\n\nCada pestaña recalcula todo automáticamente.",
    options: [
      { label: "¿Cómo registro que ya le pagué?", nextNode: 'nomina_pagar' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  nomina_ver: {
    id: 'nomina_ver',
    message: "En *Nómina* ves una tarjeta por cada barbero con:\n\n📊 Cuántas citas realizó\n💵 Total generado en ventas\n💰 Lo que le corresponde según su esquema\n🟡 Estado: *Pendiente* o ✅ *Pagado*\n\nEl botón *'Pagar $XX.XXX'* aparece directo en la tarjeta cuando hay saldo pendiente.",
    options: [
      { label: "¿Cómo configuro el esquema de pago?", nextNode: 'nomina_configurar' },
      { label: "¿Cómo registro el pago?", nextNode: 'nomina_pagar' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  nomina_configurar: {
    id: 'nomina_configurar',
    message: "Para configurar el esquema de pago de un barbero:\n\n1️⃣ Ve a *Nómina*\n2️⃣ Toca el botón de ajuste (⚙️) en la tarjeta del barbero\n3️⃣ Elige el esquema:\n\n¿Cuál quieres conocer?",
    options: [
      { label: "Porcentaje por servicio", nextNode: 'nomina_porcentaje' },
      { label: "Nómina fija mensual", nextNode: 'nomina_fija' },
      { label: "Pago fijo por tipo de servicio", nextNode: 'nomina_por_servicio' },
    ]
  },
  nomina_porcentaje: {
    id: 'nomina_porcentaje',
    message: "📊 *Porcentaje por servicio*\n\nEl barbero gana un % del precio de cada servicio que realiza.\n\nEjemplo: corte vale $30.000, barbero tiene 50% → gana $15.000 por ese corte.\n\nEn el modal hay un *slider* para ajustar el porcentaje de 0% a 100%.",
    options: [
      { label: "¿Puedo cambiar el porcentaje después?", nextNode: 'nomina_cambio' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  nomina_fija: {
    id: 'nomina_fija',
    message: "📋 *Nómina fija mensual*\n\nEl barbero recibe el mismo monto cada mes sin importar cuántos cortes haga.\n\nIngresa el monto fijo en el campo y Trimly lo calcula proporcional al período seleccionado.",
    options: [
      { label: "¿Puedo cambiar el monto después?", nextNode: 'nomina_cambio' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  nomina_por_servicio: {
    id: 'nomina_por_servicio',
    message: "🔧 *Pago fijo por tipo de servicio*\n\nCada tipo de servicio tiene un valor fijo para el barbero, sin importar el precio del cliente.\n\nEjemplo:\nCorte → $12.000 fijos\nBarba → $8.000 fijos\n\nEn el modal aparecen todos tus servicios y pones el valor para cada uno.",
    options: [
      { label: "¿Puedo cambiar los valores después?", nextNode: 'nomina_cambio' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  nomina_cambio: {
    id: 'nomina_cambio',
    message: "Sí ✅ Puedes cambiar el esquema o los valores cuando quieras.\n\nEl cambio aplica desde la fecha en que lo haces. Los registros anteriores ya pagados quedan como estaban.",
    options: [
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  nomina_pagar: {
    id: 'nomina_pagar',
    message: "Para registrar que pagaste a un barbero:\n\n1️⃣ Toca el botón *'Pagar $XX.XXX'* en la tarjeta del barbero\n2️⃣ Aparece un modal con el monto (puedes editarlo)\n3️⃣ Selecciona el método:\n   💵 Efectivo  📱 Nequi  🏦 Transferencia\n4️⃣ Agrega una nota opcional\n5️⃣ Confirma\n\nEl estado cambia a ✅ Pagado y queda en el historial.",
    options: [
      { label: "¿Puedo ver el historial de pagos pasados?", nextNode: 'nomina_historial' },
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  nomina_historial: {
    id: 'nomina_historial',
    message: "Para ver pagos anteriores cambia el período a *'Mes anterior'* o *'Personalizado'* arriba en la nómina.\n\nAhí ves todos los pagos ya realizados con:\n📅 Fecha del pago\n💵 Monto pagado\n📝 Nota que escribiste\n💳 Método usado",
    options: [
      { label: "Tengo otra duda sobre nómina", nextNode: 'nomina_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── AUTOMATIZACIONES ──────────────────────────────────────────────────────
  auto_inicio: {
    id: 'auto_inicio',
    message: "Las automatizaciones envían mensajes a tus clientes sin que hagas nada 🤖\n\nTienes 6 tipos disponibles. ¿Cuál quieres conocer?",
    options: [
      { label: "Confirmación al agendar", nextNode: 'auto_confirmacion' },
      { label: "Recordatorio 24h antes", nextNode: 'auto_recordatorio' },
      { label: "Mensaje post-visita", nextNode: 'auto_post_visita' },
      { label: "Cumpleaños del cliente", nextNode: 'auto_cumpleanios' },
      { label: "Recuperar clientes inactivos", nextNode: 'auto_win_back' },
      { label: "¿Cómo activo o desactivo una?", nextNode: 'auto_toggle' },
      { label: "← Volver al inicio", nextNode: 'inicio' },
    ]
  },
  auto_confirmacion: {
    id: 'auto_confirmacion',
    message: "📧 *Confirmación al agendar*\n\nCuando un cliente reserva una cita desde tu página pública, Trimly le envía automáticamente un email de confirmación con:\n✅ Nombre del barbero\n⏰ Fecha y hora de la cita\n✂️ Servicio agendado\n\n*Nota importante:* Esta automatización también controla el recordatorio de 24h. Si desactivas la confirmación, el recordatorio también se bloquea automáticamente.",
    options: [
      { label: "¿Cómo la activo?", nextNode: 'auto_toggle' },
      { label: "¿Qué es el recordatorio 24h?", nextNode: 'auto_recordatorio' },
      { label: "Tengo otra duda sobre automatizaciones", nextNode: 'auto_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  auto_recordatorio: {
    id: 'auto_recordatorio',
    message: "⏰ *Recordatorio 24 horas antes*\n\nEl día antes de la cita Trimly le envía un email al cliente para que no se le olvide.\n\n⚠️ *Requiere que 'Confirmación al agendar' esté activa.* Si la confirmación está desactivada, este recordatorio aparece bloqueado y no funciona.",
    options: [
      { label: "¿Por qué depende de la confirmación?", nextNode: 'auto_dependencia' },
      { label: "¿Cómo activo la confirmación?", nextNode: 'auto_toggle' },
      { label: "Tengo otra duda sobre automatizaciones", nextNode: 'auto_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  auto_dependencia: {
    id: 'auto_dependencia',
    message: "La confirmación y el recordatorio funcionan juntos 🔗\n\nCuando un cliente reserva hay que haberle enviado el email de confirmación primero para poder recordarle 24h antes.\n\nSin confirmación no hay contexto para el recordatorio, por eso se bloquea automáticamente.",
    options: [
      { label: "Tengo otra duda sobre automatizaciones", nextNode: 'auto_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  auto_post_visita: {
    id: 'auto_post_visita',
    message: "💬 *Mensaje post-visita*\n\nUnas horas después de la cita completada Trimly le envía un mensaje al cliente agradeciéndole la visita y pidiéndole que deje una reseña.\n\nAyuda a construir tu reputación online sin esfuerzo.",
    options: [
      { label: "¿Cómo la activo?", nextNode: 'auto_toggle' },
      { label: "Tengo otra duda sobre automatizaciones", nextNode: 'auto_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  auto_cumpleanios: {
    id: 'auto_cumpleanios',
    message: "🎂 *Cumpleaños del cliente*\n\nEl día del cumpleaños del cliente Trimly le envía un mensaje con felicitación y opcionalmente con un cupón especial.\n\nRequiere que el cliente tenga su fecha de nacimiento guardada en su perfil.",
    options: [
      { label: "¿Cómo activo esta automatización?", nextNode: 'auto_toggle' },
      { label: "Tengo otra duda sobre automatizaciones", nextNode: 'auto_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  auto_win_back: {
    id: 'auto_win_back',
    message: "🔄 *Recuperación de clientes inactivos*\n\nCuando un cliente lleva 30+ días sin visitar tu barbería Trimly le envía un mensaje para traerlo de vuelta.\n\nPuede incluir un cupón de descuento para que la vuelta le resulte irresistible 💡",
    options: [
      { label: "¿Cómo activo esta automatización?", nextNode: 'auto_toggle' },
      { label: "¿Cómo creo cupones?", nextNode: 'cupones_inicio' },
      { label: "Tengo otra duda sobre automatizaciones", nextNode: 'auto_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  auto_toggle: {
    id: 'auto_toggle',
    message: "Activar o desactivar una automatización es sencillo:\n\n1️⃣ Ve a *Automatizaciones* en el menú\n2️⃣ Cada automatización tiene un interruptor a la derecha\n3️⃣ Toca el interruptor para activar ✅ o desactivar ⭕\n\nEl cambio es inmediato. Cuando está desactivada no se envía ningún mensaje aunque ocurra el evento.",
    options: [
      { label: "¿Qué pasa con el recordatorio si desactivo la confirmación?", nextNode: 'auto_dependencia' },
      { label: "Tengo otra duda sobre automatizaciones", nextNode: 'auto_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── CUPONES ───────────────────────────────────────────────────────────────
  cupones_inicio: {
    id: 'cupones_inicio',
    message: "Los cupones te permiten dar descuentos a tus clientes 🏷️\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo creo un cupón nuevo?", nextNode: 'cupones_crear' },
      { label: "¿Cómo comparto un cupón?", nextNode: 'cupones_compartir' },
      { label: "¿Puedo limitar el uso de un cupón?", nextNode: 'cupones_limites' },
      { label: "← Volver al inicio", nextNode: 'inicio_2' },
    ]
  },
  cupones_crear: {
    id: 'cupones_crear',
    message: "Para crear un cupón:\n\n1️⃣ Ve a *Cupones → + Crear cupón*\n2️⃣ Define:\n   🏷️ Código (ej: BIENVENIDO20)\n   💰 Descuento en % o en pesos fijos\n   📅 Fecha de vencimiento\n   🔢 Límite de usos (opcional)\n3️⃣ Guarda\n\nEl cupón queda activo para usarse en el proceso de reserva.",
    options: [
      { label: "¿Puedo limitar los usos?", nextNode: 'cupones_limites' },
      { label: "¿Cómo comparto el cupón?", nextNode: 'cupones_compartir' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  cupones_compartir: {
    id: 'cupones_compartir',
    message: "Para compartir un cupón simplemente envíale el código a tus clientes:\n\n📱 Por WhatsApp directo\n📸 En tu historia de Instagram\n📧 En el mensaje de una automatización\n\nEl cliente ingresa el código en el paso de reserva y el descuento se aplica automáticamente.",
    options: [
      { label: "¿Cómo lo uso en automatizaciones?", nextNode: 'auto_win_back' },
      { label: "Tengo otra duda sobre cupones", nextNode: 'cupones_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  cupones_limites: {
    id: 'cupones_limites',
    message: "Sí, puedes controlar bien el uso:\n\n🔢 *Límite de usos totales* — el cupón se desactiva automáticamente cuando se llegue al número definido\n\n📅 *Fecha de vencimiento* — después de esa fecha el cupón no funciona aunque intenten usarlo\n\n1️⃣ *Un uso por cliente* — opción para evitar que el mismo cliente lo use varias veces",
    options: [
      { label: "Tengo otra duda sobre cupones", nextNode: 'cupones_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio_2' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── RESEÑAS ───────────────────────────────────────────────────────────────
  resenas_inicio: {
    id: 'resenas_inicio',
    message: "En Reseñas ves las opiniones que los clientes han dejado de tu barbería ⭐\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo llegan las reseñas?", nextNode: 'resenas_como_llegan' },
      { label: "¿Puedo responder una reseña?", nextNode: 'resenas_responder' },
      { label: "¿Cómo consigo más reseñas?", nextNode: 'resenas_conseguir' },
      { label: "← Volver al inicio", nextNode: 'inicio_2' },
    ]
  },
  resenas_como_llegan: {
    id: 'resenas_como_llegan',
    message: "Las reseñas llegan de dos formas:\n\n⭐ *Después de la cita* — si tienes activa la automatización *'Post-visita'*, Trimly invita al cliente a dejar su opinión\n\n🔗 *Link directo* — en *Mi página* hay un botón para copiar el link de reseñas y compartirlo donde quieras",
    options: [
      { label: "¿Cómo activo la automatización post-visita?", nextNode: 'auto_post_visita' },
      { label: "Tengo otra duda sobre reseñas", nextNode: 'resenas_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  resenas_responder: {
    id: 'resenas_responder',
    message: "Sí ✅ Desde la sección *Reseñas*:\n\n1️⃣ Toca la reseña que quieres responder\n2️⃣ Escribe tu respuesta\n3️⃣ Publica\n\nLa respuesta aparece visible junto a la reseña en tu página pública. Responder reseñas —especialmente las negativas— muestra profesionalismo.",
    options: [
      { label: "Tengo otra duda sobre reseñas", nextNode: 'resenas_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio_2' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  resenas_conseguir: {
    id: 'resenas_conseguir',
    message: "Las mejores formas de conseguir más reseñas:\n\n1️⃣ Activa la automatización *'Post-visita'* — pide la reseña automáticamente\n2️⃣ Comparte el link de reseñas en tu WhatsApp e Instagram\n3️⃣ Pídelo personalmente al terminar la cita\n\nClientes satisfechos dejan reseñas cuando se lo haces fácil 💡",
    options: [
      { label: "Tengo otra duda sobre reseñas", nextNode: 'resenas_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio_2' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── REPORTES Y MÉTRICAS ───────────────────────────────────────────────────
  reportes_inicio: {
    id: 'reportes_inicio',
    message: "En Reportes exportas y analizas los datos de tu barbería 📊\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo exporto mis datos?", nextNode: 'reportes_exportar' },
      { label: "¿Qué datos puedo ver?", nextNode: 'reportes_datos' },
      { label: "¿Qué son las Métricas?", nextNode: 'reportes_metricas' },
      { label: "← Volver al inicio", nextNode: 'inicio_2' },
    ]
  },
  reportes_exportar: {
    id: 'reportes_exportar',
    message: "Para exportar tus datos:\n\n1️⃣ Ve a *Reportes*\n2️⃣ Selecciona el rango de fechas\n3️⃣ Elige el tipo de reporte:\n   📋 Citas\n   💰 Ingresos\n   👥 Clientes\n   🛍️ Productos\n4️⃣ Toca *'Exportar PDF'* o *'Exportar Excel'*",
    options: [
      { label: "¿Qué datos incluye el reporte?", nextNode: 'reportes_datos' },
      { label: "Tengo otra duda sobre reportes", nextNode: 'reportes_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  reportes_datos: {
    id: 'reportes_datos',
    message: "En Reportes puedes ver y exportar:\n\n📅 *Citas* — total de citas, cancelaciones, no shows\n💰 *Ingresos* — total facturado, por barbero, por servicio\n👥 *Clientes* — nuevos clientes, retención, inactivos\n🛍️ *Productos* — ventas de productos por período\n👤 *Rendimiento por barbero* — citas y ganancias",
    options: [
      { label: "¿Cómo exporto a Excel o PDF?", nextNode: 'reportes_exportar' },
      { label: "¿Qué son las Métricas?", nextNode: 'reportes_metricas' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  reportes_metricas: {
    id: 'reportes_metricas',
    message: "📈 *Métricas* es una sección exclusiva del plan *Filo Pro*\n\nOfrece estadísticas avanzadas e inteligentes como:\n📊 Tendencias de crecimiento\n🔔 Alertas cuando algo baja\n⭐ Tu barbero más productivo\n💡 Sugerencias de mejora basadas en tus datos\n\nSi estás en plan Básico ve a *Mis planes* para conocer el Filo Pro.",
    options: [
      { label: "¿Qué incluye el plan Filo Pro?", nextNode: 'plan_pro' },
      { label: "Tengo otra duda sobre reportes", nextNode: 'reportes_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── EQUIPO ────────────────────────────────────────────────────────────────
  equipo_inicio: {
    id: 'equipo_inicio',
    message: "En Equipo gestionas a todos los barberos de tu barbería 👤\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo agrego un barbero?", nextNode: 'equipo_agregar' },
      { label: "¿Cómo edito el perfil de un barbero?", nextNode: 'equipo_editar' },
      { label: "¿Cómo invito a un barbero a Trimly?", nextNode: 'equipo_invitar' },
      { label: "¿Qué puede ver el barbero?", nextNode: 'equipo_vista' },
      { label: "← Volver al inicio", nextNode: 'inicio_2' },
    ]
  },
  equipo_agregar: {
    id: 'equipo_agregar',
    message: "Para agregar un barbero:\n\n1️⃣ Ve a *Equipo → + Nuevo barbero*\n2️⃣ Ingresa su nombre (obligatorio), teléfono y email\n3️⃣ Toca *'Guardar'\n\nEl barbero aparece en tu lista y en tu página pública de reservas.",
    options: [
      { label: "¿Cómo edito su perfil o foto?", nextNode: 'equipo_editar' },
      { label: "¿Cómo le doy acceso a Trimly?", nextNode: 'equipo_invitar' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  equipo_editar: {
    id: 'equipo_editar',
    message: "Para editar el perfil de un barbero:\n\n1️⃣ Ve a *Equipo*\n2️⃣ Toca el ícono de lápiz ✏️ en la tarjeta del barbero\n3️⃣ Puedes cambiar:\n   📛 Nombre\n   💼 Especialidad\n   📱 Teléfono y email\n   📸 Foto de perfil\n4️⃣ Toca *'Guardar cambios'*",
    options: [
      { label: "¿Cómo subo una foto del barbero?", nextNode: 'equipo_foto' },
      { label: "Tengo otra duda sobre el equipo", nextNode: 'equipo_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  equipo_foto: {
    id: 'equipo_foto',
    message: "Para subir la foto de un barbero:\n\n1️⃣ Toca el ícono de lápiz ✏️ en la tarjeta del barbero\n2️⃣ Toca el círculo de la foto (arriba del modal)\n3️⃣ Se abre el selector de archivos\n4️⃣ Elige la foto desde tu dispositivo\n5️⃣ Se sube automáticamente — verás la previsualización\n6️⃣ Toca *'Guardar cambios'*\n\nLa foto aparece en la tarjeta del barbero y en la página pública de reservas 📸",
    options: [
      { label: "Tengo otra duda sobre el equipo", nextNode: 'equipo_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio_2' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  equipo_invitar: {
    id: 'equipo_invitar',
    message: "Para invitar a un barbero a que tenga su propio acceso:\n\n1️⃣ Ve a *Equipo*\n2️⃣ Toca el barbero en la lista\n3️⃣ Toca *'Generar link de invitación'*\n4️⃣ Copia el link y envíaselo por WhatsApp\n\nEl barbero entra al link, se registra y desde ahí puede ver sus citas y ganancias.",
    options: [
      { label: "¿Qué puede ver el barbero después de registrarse?", nextNode: 'equipo_vista' },
      { label: "Tengo otra duda sobre el equipo", nextNode: 'equipo_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  equipo_vista: {
    id: 'equipo_vista',
    message: "El barbero solo puede ver su propia información:\n\n✅ Sus citas del día\n✅ Sus ganancias del período\n✅ Su resumen de rendimiento\n\nNO puede ver:\n❌ Las citas o ganancias de otros barberos\n❌ Los ingresos totales de la barbería\n❌ Configuración ni precios\n❌ Datos completos de clientes\n\nTu negocio está protegido 🔒",
    options: [
      { label: "Tengo otra duda sobre el equipo", nextNode: 'equipo_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio_2' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── PÁGINA PÚBLICA ────────────────────────────────────────────────────────
  pagina_inicio: {
    id: 'pagina_inicio',
    message: "Tu página pública es donde tus clientes reservan su cita sin mandarte un WhatsApp 🔗\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo obtengo y comparto mi link?", nextNode: 'pagina_link' },
      { label: "¿Cómo personalizo mi página?", nextNode: 'pagina_personalizar' },
      { label: "¿Por qué no me llegan reservas?", nextNode: 'pagina_sin_reservas' },
      { label: "← Volver al inicio", nextNode: 'inicio_2' },
    ]
  },
  pagina_link: {
    id: 'pagina_link',
    message: "Tu link único de reservas está en *Mi página* en el menú.\n\nToca *'Copiar link'* para copiarlo.\n\nCompártelo en:\n📱 Tu estado de WhatsApp\n📸 La bio de Instagram\n💬 Grupos de clientes\n\n¡Entre más lo compartas más reservas recibes sin hacer nada!",
    options: [
      { label: "¿Cómo lo envío directo por WhatsApp?", nextNode: 'pagina_whatsapp' },
      { label: "Tengo otra duda sobre mi página", nextNode: 'pagina_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  pagina_whatsapp: {
    id: 'pagina_whatsapp',
    message: "En *Mi página* hay un botón *'Compartir por WhatsApp'* 📱\n\nAl tocarlo se abre WhatsApp con el mensaje ya escrito:\n*'Reserva tu cita aquí: [tu-link]'*\n\nSolo seleccionas el contacto o grupo y lo envías.",
    options: [
      { label: "Tengo otra duda sobre mi página", nextNode: 'pagina_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio_2' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  pagina_personalizar: {
    id: 'pagina_personalizar',
    message: "Personalizas tu página en *Configuración → Mi barbería*:\n\n🖼️ Logo de tu barbería\n🎨 Color principal\n📸 Foto de portada\n💬 Mensaje de bienvenida\n📍 Dirección y ciudad\n\nLos cambios se ven en tiempo real antes de guardar.",
    options: [
      { label: "Tengo otra duda sobre mi página", nextNode: 'pagina_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio_2' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  pagina_sin_reservas: {
    id: 'pagina_sin_reservas',
    message: "Si no te están llegando reservas revisa estas cosas:\n\n🔗 *¿Compartiste tu link?* — es lo más común. Ponlo en WhatsApp e Instagram hoy mismo\n\n✂️ *¿Tienes servicios activos?* — verifica en *Servicios*\n\n👤 *¿Tienes barberos configurados?* — revisa en *Equipo*",
    options: [
      { label: "¿Cómo activo mis servicios?", nextNode: 'servicios_desactivar' },
      { label: "¿Cómo agrego barberos?", nextNode: 'equipo_agregar' },
      { label: "Tengo otra duda sobre mi página", nextNode: 'pagina_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────
  config_inicio: {
    id: 'config_inicio',
    message: "En Configuración personalizas todo tu perfil y barbería ⚙️\n¿Qué necesitas ajustar?",
    options: [
      { label: "¿Cómo cambio la info de mi barbería?", nextNode: 'config_barberia' },
      { label: "¿Cómo cambio los horarios?", nextNode: 'config_horarios' },
      { label: "¿Cómo veo o cambio mi plan?", nextNode: 'config_planes' },
      { label: "¿Cómo cambio mi contraseña?", nextNode: 'config_contrasena' },
      { label: "¿Qué son las Sedes?", nextNode: 'sedes_inicio' },
      { label: "¿Cómo funcionan los Referidos?", nextNode: 'referidos_inicio' },
      { label: "← Volver al inicio", nextNode: 'inicio_2' },
    ]
  },
  config_barberia: {
    id: 'config_barberia',
    message: "Para editar la información de tu barbería:\n\n1️⃣ Ve a *Configuración → Mi barbería*\n2️⃣ Edita:\n   📛 Nombre de la barbería\n   📍 Dirección y ciudad\n   📱 Teléfono de contacto\n   🖼️ Logo y foto de portada\n   🎨 Color principal de tu página\n3️⃣ Guarda los cambios",
    options: [
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  config_horarios: {
    id: 'config_horarios',
    message: "Para cambiar los horarios de trabajo:\n\n1️⃣ Ve a *Configuración → Barberos*\n2️⃣ Toca el barbero\n3️⃣ Ajusta días y horas disponibles\n4️⃣ Guarda\n\nLos horarios actualizados aparecen de inmediato en la página pública. Los clientes solo ven horarios dentro de ese rango.",
    options: [
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  config_planes: {
    id: 'config_planes',
    message: "Para ver tu plan actual y las opciones disponibles:\n\n1️⃣ Ve a *Configuración*\n2️⃣ Toca la pestaña *'Mis planes'*\n\nAhí ves:\n📦 Tu plan actual con sus beneficios\n⚡ Los tres planes disponibles: Básico, Filo Pro y Lifetime\n🔼 El botón para mejorar tu plan\n\nPara activar o cambiar un plan escríbenos y te ayudamos en menos de 24h.",
    options: [
      { label: "¿Qué incluye el plan Básico?", nextNode: 'plan_basico' },
      { label: "¿Qué incluye el Filo Pro?", nextNode: 'plan_pro' },
      { label: "¿Qué es el plan Lifetime?", nextNode: 'plan_lifetime' },
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
    ]
  },
  config_contrasena: {
    id: 'config_contrasena',
    message: "Para cambiar tu contraseña:\n\n1️⃣ Ve a *Configuración → Mi cuenta*\n2️⃣ Toca *'Cambiar contraseña'*\n3️⃣ Ingresa tu contraseña actual y la nueva\n4️⃣ Confirma y guarda\n\nSi olvidaste tu contraseña en el login toca *'Olvidé mi contraseña'* y te enviamos un link de recuperación a tu email.",
    options: [
      { label: "Tengo otra duda sobre configuración", nextNode: 'config_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── PLANES ────────────────────────────────────────────────────────────────
  plan_basico: {
    id: 'plan_basico',
    message: "📦 *Plan Básico — $29.900/mes*\n\n✅ 1 barbero incluido\n✅ Agenda online activa 24/7\n✅ Link de reservas personalizado\n✅ Recordatorios automáticos\n✅ Hasta 100 citas por mes\n\nPerfecto para empezar a digitalizar tu barbería.",
    options: [
      { label: "¿Qué incluye el Filo Pro?", nextNode: 'plan_pro' },
      { label: "¿Cómo cambio de plan?", nextNode: 'config_planes' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  plan_pro: {
    id: 'plan_pro',
    message: "⚡ *Plan Filo Pro — $79.900/mes*\n\n✅ Todo el plan Básico\n✅ Barberos ilimitados\n✅ Citas ilimitadas\n✅ Reportes avanzados\n✅ Métricas e inteligencia del negocio\n✅ Automatizaciones completas\n✅ Nómina y comisiones\n✅ Soporte prioritario",
    options: [
      { label: "¿Qué es el plan Lifetime?", nextNode: 'plan_lifetime' },
      { label: "¿Cómo activo este plan?", nextNode: 'plan_activar' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  plan_lifetime: {
    id: 'plan_lifetime',
    message: "🔥 *Plan Lifetime — $559.000 pago único*\n\nPagas una sola vez y tienes el Filo Pro para siempre.\nSin mensualidades, sin renovaciones, sin sorpresas.\n\nTambién incluye todas las funciones nuevas que se agreguen en el futuro 💡",
    options: [
      { label: "¿Cómo activo este plan?", nextNode: 'plan_activar' },
      { label: "Ver comparación de planes", nextNode: 'config_planes' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  plan_activar: {
    id: 'plan_activar',
    message: "Para activar o cambiar tu plan:\n\n1️⃣ Ve a *Configuración → Mis planes*\n2️⃣ Toca *'Mejorar plan'* o selecciona el plan que quieres\n3️⃣ Se abre un mensaje para contactarnos\n4️⃣ Escríbenos a *soporte@trimlyapp.co*\n\n¡En menos de 24 horas tu plan está activo! 🚀",
    options: [
      { label: "Tengo otra duda sobre los planes", nextNode: 'config_planes' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── SEDES ─────────────────────────────────────────────────────────────────
  sedes_inicio: {
    id: 'sedes_inicio',
    message: "En Sedes puedes gestionar múltiples locales de tu barbería 🏢\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo agrego una sede nueva?", nextNode: 'sedes_agregar' },
      { label: "¿Cómo funciona la gestión multi-sede?", nextNode: 'sedes_gestion' },
      { label: "← Volver a configuración", nextNode: 'config_inicio' },
    ]
  },
  sedes_agregar: {
    id: 'sedes_agregar',
    message: "Para agregar una sede:\n\n1️⃣ Ve a *Sedes → + Nueva sede*\n2️⃣ Completa:\n   📛 Nombre de la sede\n   📍 Dirección\n   🏙️ Ciudad\n   📱 Teléfono\n   🕐 Horario de atención\n3️⃣ Guarda",
    options: [
      { label: "¿Cómo asigno barberos a una sede?", nextNode: 'sedes_gestion' },
      { label: "Tengo otra duda sobre sedes", nextNode: 'sedes_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  sedes_gestion: {
    id: 'sedes_gestion',
    message: "Con múltiples sedes puedes:\n\n📊 Ver el rendimiento de cada local por separado\n👤 Asignar barberos a sedes específicas\n📅 Ver la agenda de cada sede\n\nCada sede tiene su propio link de reservas para que los clientes elijan dónde ir.",
    options: [
      { label: "Tengo otra duda sobre sedes", nextNode: 'sedes_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio_2' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── REFERIDOS ─────────────────────────────────────────────────────────────
  referidos_inicio: {
    id: 'referidos_inicio',
    message: "El programa de Referidos te premia por recomendar Trimly a otras barberías 🎁\n¿Qué necesitas saber?",
    options: [
      { label: "¿Cómo funciona el programa?", nextNode: 'referidos_como' },
      { label: "¿Cómo comparto mi código?", nextNode: 'referidos_compartir' },
      { label: "← Volver al inicio", nextNode: 'inicio_2' },
    ]
  },
  referidos_como: {
    id: 'referidos_como',
    message: "El programa de referidos funciona así:\n\n1️⃣ Tienes un *código único* tuyo\n2️⃣ Compartes ese código con otra barbería\n3️⃣ Cuando se registran usando tu código ambos reciben un beneficio\n\nVe a *Referidos* en el menú para ver tu código y el estado de tus referidos.",
    options: [
      { label: "¿Cómo comparto mi código?", nextNode: 'referidos_compartir' },
      { label: "Tengo otra duda sobre referidos", nextNode: 'referidos_inicio' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },
  referidos_compartir: {
    id: 'referidos_compartir',
    message: "Para compartir tu código de referido:\n\n1️⃣ Ve a *Referidos* en el menú\n2️⃣ Copia tu código o link único\n3️⃣ Compártelo por WhatsApp, Instagram o donde quieras\n\nCuantas más barberías refieran más beneficios acumulas 🏆",
    options: [
      { label: "Tengo otra duda sobre referidos", nextNode: 'referidos_inicio' },
      { label: "Quiero preguntar otra cosa", nextNode: 'inicio_2' },
      { label: "Ya entendí ✓", nextNode: 'final_gracias' },
    ]
  },

  // ─── NODO FINAL ────────────────────────────────────────────────────────────
  final_gracias: {
    id: 'final_gracias',
    message: "¡Con gusto! 😊 Si tienes otra duda aquí estaré.\n\nSi necesitas ayuda más específica puedes escribirnos directo por WhatsApp 👇",
    isFinal: true,
    options: [
      { label: "💬 Hablar con soporte", nextNode: 'whatsapp_support', isSpecial: true },
      { label: "Tengo otra pregunta", nextNode: 'inicio' },
    ]
  }
};

export default miloFlow;
