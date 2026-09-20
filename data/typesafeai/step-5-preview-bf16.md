# TypeSafeAI/Step-5-Preview-BF16

## Resumen

Step-5-Preview es el modelo fundacional insignia de StepFun, publicado en Hugging Face a través de la cuenta TypeSafeAI bajo el identificador `TypeSafeAI/Step-5-Preview-BF16`. Se trata de un transformer disperso de tipo mezcla de expertos (MoE) con 604 339 504 832 parámetros totales (≈604,3 mil millones) y 27 000 millones de parámetros activos por token, lo que supone una dispersión de aproximadamente el 4,5 %. Incorpora una ventana de contexto de 1 000 000 de tokens y admite entradas multimodales de texto, imagen y vídeo de forma nativa.

El modelo está diseñado específicamente para trabajo agéntico en dominios profesionales: programación asistida por IA, ingeniería de software, conocimiento profesional y análisis financiero. Para ello incluye llamada a herramientas en paralelo, salida con esquema JSON estricto y un nivel de esfuerzo de razonamiento configurable (`low`, `medium`, `high`/`xhigh`). StepFun describe su filosofía de diseño como la búsqueda de la «frontera de Pareto» entre inteligencia y coste, y señala que esta versión sustituye por completo a la línea Step 4.x, que la empresa decidió omitir.

Su relevancia actual radica en la combinación de tres factores poco frecuentes en el mismo checkpoint: escala de 600B con solo 27B activos, contexto de un millón de tokens sin un incremento proporcional de coste —gracias a una atención GQA dispersa con fusión de tokens por bloques— y multimodalidad nativa. El repositorio contiene únicamente el checkpoint en BF16 (1 214,9 GB), por lo que su despliegue exige infraestructura multinodo o multi-GPU de gama alta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de 92 capas, diseño «estrecho pero profundo», MoE disperso con Sparse Grouped-Query Attention (GQA) y fusión de tokens por bloques |
| Parámetros totales | 604 339 504 832 (≈604,3 mil millones) |
| Parámetros activos | ≈27 000 millones por token (≈4,5 % de dispersión) |
| Longitud de contexto | 1 000 000 de tokens (1M) |
| Tipos de cuantización | No disponible: el repositorio publica únicamente el checkpoint BF16 (la model card no documenta variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | Inglés (en), chino (zh) y multilingüe (etiqueta `multilingual`; lista completa de idiomas no disponible) |
| Licencia | stepfun-community-license (`license: other`, con nombre de licencia declarado) |
| Formato de pesos | safetensors (BF16), librería `transformers`, etiqueta `custom_code` (requiere `trust_remote_code`) |
| Modalidades de entrada | Texto, imagen y vídeo (MP4, QuickTime, Matroska; ≤128 MB; ≤5 minutos recomendados) |
| Pipeline declarado | image-text-to-text |
| Tamaño del repositorio | 1 214,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 92 capas con configuración «estrecha pero profunda», una decisión de diseño que, según el autor, persigue crear rutas de propagación de información más largas para el razonamiento implícito de múltiples saltos durante operaciones de prefill extensas. La capa de mezcla de expertos opera con 604,3 mil millones de parámetros totales y 27 mil millones activos por token (≈4,5 % de dispersión). Para sostener la ventana de 1M de tokens se emplea Sparse GQA con fusión de tokens por bloques: un indexado disperso selecciona únicamente la información histórica relevante para la tarea en curso, de modo que un número reducido de tokens entra efectivamente en el cálculo de atención. StepFun cifra el coste del indexador y de la selección top-k en aproximadamente un octavo del de una línea base más densa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación: la model card incluye una sección de datos de entrenamiento y otra de evaluación, pero su contenido no forma parte de la información proporcionada. Tampoco hay datos sobre innovaciones adicionales como decodificación especulativa. Lo que sí se documenta es la interfaz de razonamiento configurable (`low`, `medium`, `high`/`xhigh`), que permite ajustar el esfuerzo de cómputo en inferencia, y el soporte nativo de llamada a herramientas en paralelo y de salida con esquema JSON estricto.

## Capacidades

- Generación de texto conversacional y de propósito general en inglés, chino y otros idiomas no detallados.
- Razonamiento agéntico de horizonte largo: la model card lo presenta como modelo construido para agentes con razonamiento multi-paso y ejecución autónoma.
- Programación y ingeniería de software: las etiquetas `coding` y `software-engineering` indican entrenamiento y ajuste orientados a código.
- Conocimiento profesional y análisis financiero (`financial-analysis`) e investigación profunda (`deep-research`).
- Llamada a herramientas y function calling, incluida la llamada a herramientas en paralelo (`parallel-tool-calling`).
- Salida estructurada con esquema JSON estricto para integración en sistemas deterministas.
- Entrada multimodal: imagen y vídeo además de texto, con soporte de vídeo en MP4, QuickTime y Matroska de hasta 128 MB y hasta 5 minutos recomendados.
- Ventana de contexto de 1M de tokens, equivalente —según el autor— a unas 1 500 páginas A4.
- Esfuerzo de razonamiento configurable en cuatro niveles (`low`, `medium`, `high`, `xhigh`), lo que permite intercambiar latencia por calidad de razonamiento.
- Compatibilidad con API compatible con OpenAI, tanto a través de la API de Step como de pasarelas de terceros.

## Casos de uso

- Agentes de ingeniería de software: el modelo puede leer repositorios completos dentro de su ventana de 1M de tokens, planificar refactorizaciones multi-archivo y ejecutar llamadas a herramientas (compilación, tests, linters) en paralelo dentro de un mismo turno, lo que reduce el número de iteraciones necesarias para cerrar una tarea.
- Asistencia de programación en producción: gracias al function calling y a la salida con esquema JSON estricto, encaja en pipelines de CI/CD donde el modelo debe devolver estructuras parseables (por ejemplo, parches, informes de revisión o resultados de análisis estático) sin post-procesado frágil.
- Análisis financiero asistido: con la etiqueta `financial-analysis` y contexto largo, puede ingerir informes anuales, transcripciones de resultados y series de datos extensas en una sola pasada y generar resúmenes comparativos o extracción estructurada de métricas.
- Investigación profunda (deep research): el modo de razonamiento configurable permite lanzar consultas con esfuerzo `xhigh` para tareas de síntesis documental y `low` para cribado masivo de fuentes, ajustando el coste por consulta.
- Atención al cliente automatizada: la ventana de 1M de tokens permite mantener historiales de conversación muy largos y adjuntar documentación de producto completa como contexto, con soporte multilingüe (inglés, chino y otros) y entrada de imágenes o capturas enviadas por el usuario.
- Análisis de vídeo e imagen para inspección: admite vídeo de hasta 5 minutos y 128 MB, por lo que resulta aplicable a la revisión automática de grabaciones de procesos, control de calidad visual o generación de informes a partir de material audiovisual.
- Automatización de flujos empresariales con herramientas heterogéneas: la llamada a herramientas en paralelo permite orquestar varias APIs simultáneamente (CRM, ERP, bases de datos) y consolidar la respuesta en un JSON validado contra esquema.
- Migración y modernización de código legado: combinando contexto largo y razonamiento de múltiples saltos, puede analizar un módulo completo con sus dependencias y proponer una traducción entre lenguajes o frameworks manteniendo coherencia entre ficheros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor incluye una sección titulada «Benchmark Results» y otra de métricas de rendimiento, pero su contenido no forma parte de los datos proporcionados en esta ficha, por lo que no se incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación. Tampoco se dispone de comparaciones numéricas verificadas frente a modelos de la competencia.

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos ocupan por sí solos ≈1,21 TB (604,34 mil millones de parámetros × 2 bytes). Hay que añadir caché KV y activaciones, por lo que el requisito real supera esa cifra.
- Configuración mínima razonable en BF16: 16 GPU de 80 GB (por ejemplo, 16×H100 o 16×A100 80 GB) queda muy justa; 16×H200 de 141 GB ofrece margen suficiente. Un nodo de 8×H200 (1 128 GB) es insuficiente para alojar únicamente los pesos.
- Cuantización propia (no publicada por el autor, estimaciones derivadas del tamaño): en FP8 los pesos bajarían a ≈604 GB, lo que permitiría 8×H100 80 GB al límite u 8×H200 con holgura; en INT4 serían ≈302 GB, lo que abriría la puerta a 4×H100 80 GB o 8×A100 80 GB. Estas cifras son estimaciones de VRAM, no configuraciones validadas por StepFun.
- GPU de consumo: no cabe en ninguna GPU de consumo. Incluso en una hipotética cuantización INT4, los ≈302 GB de pesos exceden con mucho los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090.
- Opciones de despliegue: la model card menciona explícitamente vLLM y SGLang para despliegue local, además de la API de Step y pasarelas compatibles con OpenAI. No se mencionan llama.cpp, Ollama ni TGI. Al llevar la etiqueta `custom_code`, la carga con `transformers` requiere `trust_remote_code=True`.
- Latencia y throughput: no disponible. No se han proporcionado mediciones de tokens por segundo, tiempo hasta el primer token ni rendimiento por configuración de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Step-5-Preview | ≈604,3 mil millones / ≈27 mil millones | 1M tokens | Texto, imagen y vídeo | stepfun-community-license | Pesos BF16 en Hugging Face; API compatible con OpenAI |
| DeepSeek-V3 | 671 mil millones / 37 mil millones | 128K tokens | Solo texto | Licencia propia de modelo DeepSeek | Pesos abiertos en Hugging Face |
| Qwen3-235B-A22B | 235 mil millones / 22 mil millones | 128K nativos (extensibles con YaRN) | Solo texto | Apache 2.0 | Pesos abiertos en Hugging Face |
| Llama 4 Maverick | ≈400 mil millones / 17 mil millones | 1M tokens | Texto e imagen | Llama 4 Community License | Pesos abiertos en Hugging Face |
| Kimi K2 | 1 billón / 32 mil millones | 128K tokens | Solo texto | Licencia tipo MIT modificada | Pesos abiertos en Hugging Face |

Advertencia: los datos de las filas correspondientes a modelos competidores proceden de información pública general y no forman parte de la información proporcionada en esta ficha; conviene verificarlos en sus model cards oficiales antes de usarlos para una decisión de adopción. No se dispone de comparaciones de rendimiento (benchmarks) entre Step-5-Preview y estos modelos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card incluye una sección de consideraciones éticas cuyo contenido no se ha proporcionado.
- Riesgo de alucinación: no cuantificado en la información disponible. Como en cualquier modelo generativo de esta escala, existe riesgo de fabricación de datos, especialmente en tareas de análisis financiero o investigación profunda donde las respuestas se presentan con apariencia de autoridad.
- Idiomas: la model card solo declara inglés, chino y la etiqueta genérica `multilingual`. No se especifica el listado completo de idiomas soportados ni su calidad relativa, por lo que el rendimiento en castellano no está documentado.
- Contexto: aunque la ventana es de 1M de tokens, no se ha publicado información sobre la degradación del rendimiento en función de la posición del contexto (efecto «lost in the middle») ni sobre curvas de recuperación a longitudes extremas.
- Licencia: se trata de la `stepfun-community-license`, una licencia de comunidad con condiciones específicas. El texto íntegro no forma parte de la información proporcionada, por lo que es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial. No se puede confirmar desde estos datos si el uso comercial está permitido, restringido o sujeto a condiciones adicionales.
- Coste de infraestructura: el checkpoint BF16 requiere del orden de 1,21 TB solo en pesos, lo que excluye su despliegue en hardware de consumo y encarece la inferencia frente a alternativas de menor tamaño.
- Formato: la ausencia de cuantizaciones oficiales obliga a generarlas internamente si se quiere reducir el coste de memoria, con el consiguiente riesgo de degradación de calidad no medida por el autor.
- Código personalizado: el repositorio lleva la etiqueta `custom_code`, lo que implica ejecutar código remoto al cargar el modelo con `transformers`; conviene auditar dicho código antes de desplegarlo en producción.
- Estado de versión: se trata de una versión «preview», lo que en la práctica suele implicar cambios de comportamiento, correcciones y posible sustitución por una versión final.
- Madurez del ecosistema: con 0 descargas y 0 «likes» en el momento de la consulta, la integración y el soporte de la comunidad son todavía inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TypeSafeAI/Step-5-Preview-BF16
- Cuenta del publicador en Hugging Face: https://huggingface.co/TypeSafeAI
- Fichero de licencia: https://huggingface.co/TypeSafeAI/Step-5-Preview-BF16/blob/main/LICENSE
- Organización en GitHub: https://github.com/stepfun-ai
- Servidor de Discord de StepFun: https://discord.gg/stepfun

Nota: la búsqueda web realizada no ha devuelto resultados relacionados con el modelo. Los enlaces recuperados corresponden a guías turísticas sobre el Salar de Uyuni (Bolivia) y no guardan ninguna relación con Step-5-Preview, por lo que se descartan. No se han encontrado papers, blogs técnicos ni demostraciones adicionales en la información disponible.
