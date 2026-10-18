# swordenamine/NUMID.AI

## Resumen

NUMID.AI es un repositorio de HuggingFace publicado por el usuario `swordenamine` que no contiene un modelo de lenguaje entrenado, sino la documentación de una aplicación full-stack de traducción a escrituras antiguas. La plataforma traduce texto moderno a 17 sistemas de escritura históricos —desde el cuneiforme sumerio y los jeroglíficos egipcios hasta el fenicio, el nórdico antiguo o el latín clásico— y devuelve el renderizado Unicode auténtico, transliteración IPA, desglose signo a signo, notas culturales y una estimación de confianza. El motor de traducción no es propio: se delega en la API de Anthropic Claude mediante prompts de sistema especializados.

Arquitectura y entrenamiento, por tanto, no aplican en el sentido habitual: no hay pesos, no hay tokenizador, no hay corpus de entrenamiento publicado ni resultados de evaluación. El repositorio describe una arquitectura de software (backend FastAPI en Python 3.10+, frontend React con Node 18+) y una capa de orquestación sobre un LLM propietario, con caché de respuestas de una hora y límite por defecto de 4096 tokens de salida por petición. El valor técnico está en la interfaz, el catálogo de lenguas y el formato estructurado de salida (JSON con script, IPA, desglose y contexto), no en un artefacto de aprendizaje automático reutilizable.

Su relevancia ahora es limitada pero ilustrativa: sirve como ejemplo de aplicación vertical construida sobre API cerradas, y como caso de estudio de los riesgos de presentar un envoltorio de prompting como si fuera un modelo. Con 0 descargas y 0 likes, y sin licencia declarada, no es una pieza apta para producción ni para investigación reproducible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no se distribuye modelo propio. Aplicación cliente sobre la API de Anthropic Claude (backend FastAPI + frontend React) |
| Parametros totales | No disponible (no se publican pesos; el tamaño depende del modelo Claude subyacente, no especificado) |
| Longitud de contexto | No disponible. El backend limita la salida a 4096 tokens por petición por defecto (`MAX_TOKENS_PER_REQUEST`); el contexto de entrada lo fija el proveedor |
| Tipos de cuantizacion | No aplica (la inferencia se ejecuta en la infraestructura de Anthropic) |
| Idiomas soportados | Salida en 17 sistemas de escritura antiguos: fenicio, sumerio, acadio, egipcio antiguo, protosinaítico, ugarítico, arameo imperial, persa antiguo, lineal B, gótico, etrusco, maya clásico, sánscrito védico (brahmi), latín clásico, griego antiguo, nórdico antiguo y copto. Lenguas modernas de entrada: detección automática (`source_language: auto`), conjunto no documentado |
| Licencia | No disponible |
| Formato de pesos | No disponible: el repositorio no incluye ficheros de pesos (safetensors, GGUF, ONNX ni equivalentes) |

## Arquitectura y entrenamiento

No existe entrenamiento. El sistema es una aplicación de tres capas: un backend FastAPI (`backend/main.py`) que expone endpoints REST bajo `/api/v1/`, un frontend React con tres vistas (traductor, línea temporal y comparador multi-idioma) y un servicio `translator.py` que actúa como cliente de la API de Anthropic. La "inteligencia" proviene íntegramente de Claude: un prompt de sistema sitúa al modelo como experto en los 17 sistemas de escritura y le pide devolver JSON estructurado con renderizado de script, transcripción IPA, desglose palabra por palabra, notas históricas y un nivel de confianza declarado.

Los mecanismos técnicos destacables son de ingeniería de software, no de modelado: caché de respuestas con TTL de una hora para reducir llamadas a la API, traducción en paralelo para el endpoint de comparación (`POST /api/v1/compare`, hasta 6 escrituras simultáneas), estilos de salida configurables (`formal`, `poetic`, `conversational`, `inscription`) y un servicio de síntesis de voz (`services/audio.py`) con dos proveedores, offline o Google TTS. No se documentan datos de entrenamiento, ajuste fino, RLHF ni evaluación lingüística alguna.

## Capacidades

- Traducción de texto moderno a 17 sistemas de escritura antiguos con caracteres Unicode reales.
- Transliteración fonética en IPA y romanización académica.
- Desglose signo a signo o letra a letra de la salida.
- Notas de contexto cultural e histórico sobre las elecciones léxicas y gráficas.
- Guía de pronunciación con audio generado por TTS (proveedor offline o Google TTS).
- Niveles de confianza declarados para lenguas extintas o reconstruidas.
- Comparación de una misma frase en hasta 6 escrituras simultáneamente.
- Línea temporal agrupada por era histórica (`GET /api/v1/timeline`).
- Cuatro registros estilísticos: formal, poético, conversacional e inscripcional.
- API REST documentada automáticamente vía OpenAPI en `/docs`.
- Direccionalidad de escritura gestionada: RTL para fenicio, egipcio, protosinaítico, arameo y etrusco; LTR para el resto.

## Casos de uso

- **Museística y cartelería expositiva.** Introducir una frase en castellano y obtener su renderizado en fenicio o cuneiforme junto con la transliteración IPA para paneles bilingües; el endpoint de comparación permite mostrar la misma leyenda en seis escrituras de la misma época.
- **Docencia de historia de la escritura.** Generar material didáctico que muestre la evolución de un mismo enunciado desde el protosinaítico hasta el griego clásico, usando la línea temporal y el comparador como apoyo en aula universitaria o secundaria.
- **Diseño gráfico y atrezzo audiovisual.** Producir inscripciones Unicode auténticas para decorados, videojuegos de ambientación histórica o portadas editoriales, eligiendo el estilo `inscription` para textos lapidarios y `poetic` para composiciones líricas.
- **Audioguías y pódcast.** El endpoint `POST /api/v1/pronunciation` devuelve la guía fonética y el audio TTS de un fragmento en script original, útil para audioguías de sala o piezas sonoras.
- **Prototipado de producto educativo.** Integrar los endpoints REST en una aplicación móvil o web de aprendizaje de lenguas antiguas; el backend ya devuelve JSON estructurado y documentación OpenAPI lista para generar clientes.
- **Exploración preliminar en humanidades digitales.** Como primer borrador de hipótesis de transliteración antes de la revisión por un especialista en asiriología o egiptología, aprovechando el desglose signo a signo y las notas contextuales.
- **Contenido editorial y marketing temático.** Generar variantes estilísticas de un eslogan en escrituras históricas para campañas, con control del registro mediante el parámetro `style`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluación cuantitativa de calidad de traducción, tasa de error de transliteración, comparación con corpus epigráficos de referencia ni métricas de latencia.

## Requisitos de hardware

- **VRAM para inferencia:** no aplica. No se ejecuta ningún modelo en local; la generación se delega en la API de Anthropic.
- **GPU recomendadas:** ninguna. El backend FastAPI y el frontend React funcionan en CPU.
- **Consumer GPU:** irrelevante para este despliegue; no hay pesos que cargar.
- **Requisitos del servidor:** Python 3.10 o superior, Node.js 18 o superior, y una clave válida de `ANTHROPIC_API_KEY` (obligatoria). Variables opcionales: `HOST`, `PORT` (8000 por defecto), `DEBUG`, `TTS_PROVIDER`, `GOOGLE_TTS_API_KEY`, `MAX_TOKENS_PER_REQUEST` (4096 por defecto).
- **Opciones de despliegue:** servidor ASGI (uvicorn / FastAPI) para el backend y build estático de React para el frontend. No se documentan imágenes Docker, Helm ni manifiestos de despliegue.
- **Latencia y throughput:** no disponibles como cifras. Dependen de la latencia de la API de Claude, del límite de 4096 tokens por petición y del uso de la caché de una hora; el endpoint de comparación paraleliza las llamadas por escritura.
- **Coste operativo:** se factura por token según las tarifas de Anthropic; la caché de una hora y el límite de tokens son los únicos mecanismos de contención descritos.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la información proporcionada. La comparación se plantea por enfoque, no por métricas:

| Criterio | NUMID.AI | Uso directo de la API de Claude con prompt ad hoc | Traducción por especialista en epigrafía |
|---|---|---|---|
| Naturaleza | Aplicación sobre API propietaria | Llamada directa al LLM | Trabajo humano con corpus y gramáticas |
| Pesos publicados | No | No | No aplica |
| Contexto | No disponible (depende del proveedor) | No disponible (depende del proveedor) | No aplica |
| Idiomas de salida | 17 escrituras antiguas | Variable según prompt | Según especialidad del investigador |
| Salida estructurada | JSON con script, IPA, desglose y confianza | No garantizada | Informe filológico |
| Coste marginal | Por token de API | Por token de API | Alto, por hora de especialista |
| Licencia | No disponible | Sujeta a términos de Anthropic | No aplica |
| Validación académica | No documentada | No documentada | Alta, revisable por pares |

Frente a proyectos de traducción de lenguas antiguas basados en modelos abiertos (por ejemplo, adaptaciones de arquitecturas tipo ByT5 sobre corpus acadios), NUMID.AI no ofrece reproducibilidad ni pesos evaluables; no se dispone en la información facilitada de cifras que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **No es un modelo, es una aplicación.** El repositorio no publica pesos ni artefactos reutilizables; quien espere un modelo descargable encontrará únicamente documentación de software.
- **Riesgo elevado de alucinación filológica.** Las lenguas extintas y reconstruidas (protosinaítico, lineal B, etrusco) tienen gramáticas incompletas; el modelo puede generar signos plausibles pero incorrectos. El propio autor incluye "niveles de confianza", lo que evidencia el problema sin resolverlo.
- **Confianza autodeclarada no calibrada.** No se documenta ningún método de calibración ni validación contra corpus epigráficos; el porcentaje devuelto es una salida generativa más.
- **Sin validación académica.** No hay evaluación por especialistas, ni comparación con transliteraciones de referencia, ni publicación de errores conocidos.
- **Dependencia total de un proveedor.** Requiere clave de Anthropic y conexión a su API; sin ella el sistema no traduce. No hay modo offline salvo el TTS local. Cambios de precio, cuota o modelo del proveedor afectan directamente al comportamiento.
- **Coste y latencia no acotados.** Cada traducción o comparación consume tokens facturables; la caché de una hora mitiga pero no elimina el gasto en uso intensivo.
- **Licencia no declarada.** Sin licencia explícita no puede asumirse permiso para uso comercial, redistribución ni obra derivada del código o del contenido del repositorio.
- **Cobertura lingüística de entrada no documentada.** No se especifica qué lenguas modernas acepta el modo `auto` ni con qué calidad fuera del inglés.
- **Renderizado dependiente de fuentes.** Los caracteres cuneiformes, jeroglíficos y glifos mayas requieren fuentes Unicode con cobertura adecuada; no se documenta qué fuentes incluye el frontend ni cómo se degrada la visualización.
- **Riesgo de frivolización cultural.** Traducir frases modernas a escrituras sagradas o ceremoniales sin contexto puede producir apropiaciones desafortunadas; las notas culturales mitigan pero no eliminan este riesgo.
- **Metadatos inconsistentes.** La fecha de creación indicada (2026-10-17) es posterior a la de actualización (2026-03-05), lo que sugiere metadatos erróneos o generados automáticamente.
- **Sin tracción ni mantenimiento verificable.** 0 descargas y 0 likes; no hay issues, papers ni repositorio público enlazado que permita evaluar el estado del proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/swordenamine/NUMID.AI
- Consola de Anthropic (requerida para la clave de API): https://console.anthropic.com
- Paper, repositorio de código, demo pública y documentación adicional: no disponibles en la información proporcionada.
