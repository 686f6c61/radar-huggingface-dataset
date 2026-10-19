# ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF

## Resumen

Defiance Uncensored es una distribución en formato GGUF de un modelo Qwen3.8 de 27.320.697.856 parámetros (27,32 mil millones), publicada por el usuario ttindall. No se trata de un entrenamiento nuevo: los pesos proceden byte a byte del modelo HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF (el autor afirma haber verificado los 866 tensores contra los ficheros originales), mientras que la plantilla de chat se deriva de DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF con nueve modificaciones.

El valor añadido del paquete es la empaquetación: una plantilla Jinja embebida en cada GGUF que expone 40 "constructos" o modos de comportamiento (personajes como Joker, House o Vader; marcos de razonamiento como omni, deeptree, hyper o socrates; paneles multiagente como einstein con 20 agentes o spoon con 5 expertos) seleccionables mediante el campo `reasoning_effort` de una petición compatible con OpenAI o mediante marcadores `{REASON:modo}` dentro del mensaje. Cada modo es esencialmente un system prompt de entre 9.000 y 13.000 caracteres (aproximadamente 2.500-3.600 tokens) que se inyecta en cada turno.

Es relevante para quien quiera evaluar hasta qué punto el comportamiento de un modelo abierto puede reconfigurarse solo con plantilla, sin reentrenar, y para quienes necesiten un modelo de ~27B sin capa de rechazo ejecutable en una GPU de 24 GB con 131.072 tokens de contexto. La contraposición es clara: el autor reconoce que su prueba de rechazo no puede separar pesos de prompt, y que el modelo original de DavidAU también respondía a las cuatro peticiones de prueba, aunque añadiendo advertencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8) con Multi-Token Prediction (MTP) para decodificación especulativa; número de capas, cabezas y tipo de atención no disponibles |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | 131.072 tokens (valor usado en la receta de llama.cpp del autor) |
| Tipos de cuantizacion | IQ4_XS (15,7 GB) y Q6_K_P (25,9 GB); KV cache en q8_0 según la configuración recomendada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, con plantilla de chat Jinja embebida; se distribuye también `defiance-27b.jinja` (222 KB) como fichero suelto |

Otros datos del repositorio: 42,5 GB de tamaño total, 2.338 descargas y 33 likes en el momento de la consulta, creado y actualizado el 17 de octubre de 2026. Etiquetas declaradas: gguf, qwen3.8, uncensored, mtp, reasoning, roleplay, conversational, llama.cpp, open-webui, text-generation, endpoints_compatible, region:us.

## Arquitectura y entrenamiento

El autor no entrena nada: el modelo es una cuantización del checkpoint de HauhauCS, que a su vez es una variante de Qwen3.8-27B con la capa de rechazo eliminada en los pesos. La innovación técnica del paquete es doble. Por un lado, la plantilla Jinja (heredada de DavidAU) implementa los 40 constructos como prompts de sistema insertados automáticamente, con modos nativos (`xhigh` por defecto, `medium`, `low`, `off`, `help`) y modos que solo añaden una frase de refuerzo o nada en absoluto. Por otro, el GGUF se acompaña de un draft model MTP separado (`Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-FastMTP-32K.gguf`, 0,9 GB) que habilita decodificación especulativa multi-token en llama.cpp con `--spec-type draft-mtp`.

Las nueve modificaciones del autor sobre la plantilla original son cambios de texto: siete líneas de cautela, una errata, un mensaje de error y el preámbulo. No hay datos sobre volumen de tokens de entrenamiento, composición del dataset, ni fases de RLHF/DPO en la información disponible; todo ello corresponde al modelo Qwen3.8 subyacente, cuyos detalles no se documentan aquí. El autor advierte explícitamente que la plantilla "dice a cada modo que responda sin advertencias ni moralina", y que cualquier otra plantilla de chat distinta de las incluidas elimina todos los modos.

## Capacidades

- Generación de texto conversacional multi-turno, con modos orientados a roleplay y a personajes con voz propia.
- Razonamiento explícito mediante bloques de pensamiento (`--reasoning on`, formato `deepseek`), con presupuesto configurable (`--reasoning-budget 16384` en la receta).
- Modo instruct rápido: `enable_thinking: false` en `chat_template_kwargs`, o el prefijo `{REASON:ijoker}` para el mismo constructo sin bloque de razonamiento.
- Marcos de razonamiento estructurado: `omni`, `deeptree`, `hyper`, `socrates`, `logic`, `ultra`, y sus variantes reforzadas con prefijo `x`.
- Paneles multiagente simulados dentro de un solo prompt: `einstein` (20 agentes), `spoon` (5 expertos) y `holodeck`.
- Especialistas por dominio: `coder`, `business`, `brainstorm`, `comedy`, `007`, `musk`, `curie`, `joe`, `prompt`.
- Selección de modo programática vía `reasoning_effort` en peticiones estilo OpenAI, lo que permite integrarlo en pipelines existentes.
- Descubrimiento de la lista de modos con `{REASON:help}`, que imprime el menú original de DavidAU.
- Decodificación especulativa MTP para acelerar la generación, compatible con ambas cuantizaciones.
- No consta soporte de tool calling, function calling, agentes con ejecución de herramientas, visión ni audio en la información disponible.

## Casos de uso

- Evaluación de robustez de plantillas: comparar el comportamiento del mismo checkpoint con la plantilla de Defiance, la de DavidAU y una plantilla estándar para medir cuánto del "comportamiento" observable proviene del prompt y cuánto de los pesos. El propio autor plantea esta comparación como pendiente.
- Roleplay y narrativa interactiva: los modos de personaje (`joker`, `house`, `vader`, `neo`, `stark`, `pkd`, `quinn`) mantienen una voz consistente durante conversaciones largas gracias a la ventana de 131.072 tokens, que permite arrastrar guiones y fichas de personaje sin truncar.
- Asistente de escritura sin filtros editoriales: con los pesos sin capa de rechazo y el modo `brainstorm` o `comedy`, útil en talleres de guion que necesitan explorar registros que otros modelos rechazan; requiere revisión humana posterior.
- Razonamiento estructurado por fases: el modo `deeptree` o `socrates` fuerza un esquema de descomposición del problema antes de responder, aprovechable en tareas de análisis de requisitos o revisión de diseño de software.
- Tutoría socrática: el constructo `socrates` está diseñado para guiar mediante preguntas en lugar de dar la respuesta, un patrón habitual en formación interna y en herramientas educativas.
- Generación de código con revisión multi-rol: el modo `coder` combinado con `spoon` (5 expertos) permite simular una revisión de código con perspectivas distintas dentro de una sola llamada, útil en prototipado rápido antes de pasar a un pipeline de CI/CD real.
- Despliegue local en estación de trabajo: con IQ4_XS (15,7 GB) cabe en una RTX 4090 o 3090 de 24 GB manteniendo 131K de contexto, lo que facilita probar el modelo con datos que no pueden salir de la máquina.
- Integración en Open WebUI: el repositorio incluye el directorio `open-webui/` con 40 modelos de workspace y un filtro para alternar entre modo instruct y razonamiento, lo que permite exponer cada constructo como si fuera un modelo distinto en una instancia interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo describe una prueba cualitativa de rechazo con cuatro prompts, sin métricas ni comparación numérica, y señala que esa prueba no permite separar el efecto de los pesos del efecto de la plantilla. Tampoco se publican cifras de perplejidad, MMLU, HumanEval, GSM8K ni de velocidad de decodificación con el draft MTP.

## Requisitos de hardware

- VRAM para IQ4_XS: 15,7 GB de pesos; con KV cache en q8_0 y 131.072 tokens de contexto el autor lo sitúa como apto para una tarjeta de 24 GB.
- VRAM para Q6_K_P: 25,9 GB solo en pesos, por lo que se recomienda una GPU de 32 GB o más, o bien offload parcial a RAM.
- Draft model MTP: 0,9 GB adicionales en VRAM si se carga junto al modelo principal con `-md`.
- GPU consumer: sí, RTX 3090 o RTX 4090 (24 GB) con IQ4_XS y contexto completo; en tarjetas de 16 GB habría que reducir contexto o recurrir a offload.
- GPU profesional: A100 40/80 GB, H100, RTX 6000 Ada (48 GB) para Q6_K_P sin compromisos de contexto.
- Despliegue: llama.cpp (`llama-server` con `--jinja`, `-ngl all`, `-fa on`, `-ctk q8_0 -ctv q8_0`), LM Studio y Ollama según el autor (la plantilla embebida se detecta sin flags extra); Open WebUI como interfaz, con los artefactos incluidos en el repo.
- Aceleración: decodificación especulativa MTP con `--spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-min 0`; no se publican cifras de latencia ni de throughput.
- Parámetros de muestreo recomendados por el autor: `--temp 0.7 --top-p 0.95 --top-k 64 --min-p 0.05 --repeat-penalty 1.0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF | 27,32 B | 131.072 | Apache 2.0 | GGUF | 40 constructos vía plantilla, draft MTP incluido, pesos idénticos a HauhauCS |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF | 27 B (no confirmado en la informacion disponible) | no disponible | no disponible | GGUF | Modelo fuente de los pesos; capa de rechazo eliminada; sin los constructos |
| DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF | 27 B (no confirmado en la informacion disponible) | no disponible | no disponible | GGUF | Origen de la plantilla de constructos; el autor indica que también respondía a los cuatro prompts de prueba, con advertencias |
| Qwen3.8-27B estándar (modelo stock) | 27,32 B (según los pesos de este repo) | no disponible | no disponible | no disponible | Referencia sin modificaciones; el autor lo cita como base de comparación de los modos `xhigh`/`low`/`medium` |

## Limitaciones y advertencias

- Contenido sin filtro: los pesos tienen la capa de rechazo eliminada y la plantilla instruye a responder sin advertencias ni moralina. El modelo generará material que otros rechazan; la responsabilidad legal y editorial recae en quien lo despliega.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de calibración; un modo que suprime las cautelas también suprime las señales de duda, lo que agrava el riesgo en dominios técnicos o médicos.
- Coste de contexto oculto: cada modo de personaje o panel ocupa entre 2.500 y 3.600 tokens en cada turno, reduciendo el contexto efectivo disponible para el usuario.
- Dependencia estricta de la plantilla: cualquier plantilla de chat distinta de las incluidas elimina los 40 modos. La plantilla embebida en el GGUF es la versión publicada; las dos correcciones posteriores (conmutador de preámbulo y lista de modos en el mensaje de error) requieren `--chat-template-file defiance-27b.jinja`.
- Idiomas no documentados: no hay información sobre cobertura multilingüe; el material del repositorio está íntegramente en inglés.
- Trazabilidad de la licencia: el paquete declara Apache 2.0, pero los modelos base (HauhauCS y DavidAU) no exponen su licencia en la información disponible; conviene verificar la cadena completa antes de un uso comercial.
- Atribución: el autor reconoce que los pesos son de HauhauCS y los constructos de DavidAU; su aportación es la plantilla, el empaquetado y las pruebas.
- Verificación pendiente: la afirmación de que los pesos son idénticos byte a byte se basa en la comprobación del propio autor (866 tensores) y no en una auditoría independiente.
- Fechas del repositorio en octubre de 2026: los metadatos indican creación y actualización el mismo día, sin historial de versiones posterior.
- Sin soporte documentado de tool calling ni de ejecución de herramientas, lo que limita su uso en pipelines agénticos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ttindall/Qwen3.8-27B-Defiance-Uncensored-MTP-GGUF
- Modelo base (pesos): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base (plantilla de constructos): https://huggingface.co/DavidAU/Qwen3.8-27B-Turbo-Brilliance-50X-Reasoning-Instruct-NEO-MAX-MTP-GGUF
- La búsqueda web realizada no devolvió enlaces técnicos relevantes sobre este modelo (papers, blogs o demos); no se dispone de documentación adicional.
