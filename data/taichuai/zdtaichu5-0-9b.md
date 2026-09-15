# TaichuAI/ZDTaichu5.0-9B

## Resumen

ZDTaichu5.0-9B es un modelo fundacional multimodal desarrollado por TaichuAI que combina un decodificador de lenguaje Qwen3.5-9B con un codificador visual C-RADIOv4-H. Con 9.794.197.512 parámetros y una ventana de contexto de hasta 128K tokens, acepta texto, una o varias imágenes y vídeo con resolución arbitraria, y está orientado a comprensión visual general, razonamiento espacial, uso de herramientas en modo agente e investigación en IA encarnada.

Su propuesta diferencial no es el rendimiento bruto en visión general, sino añadir capacidades espaciales, encarnadas y de agente sin sacrificar la competencia visual base: el autor lo sitúa en el grupo líder de los VLM de propósito general de escala 10B y reporta resultados destacados en razonamiento espacial (SparBench, ViewSpatial, MMSI-Bench, MindCube-tiny), agentes (TAU2-Bench 87,7; Claw-Eval 71,4; IFEval 93,7) y tareas encarnadas (ERQA 48, RoboSpatial 56). Incorpora además un mecanismo propietario denominado Entropy-Gated Adaptive Recurrent Reasoning.

Resulta relevante para quien necesita un VLM compacto que cubra OCR, documentos, gráficos, vídeo y razonamiento 3D con integración agéntica. Sin embargo, la licencia no está publicada, no hay información sobre datos de entrenamiento ni alineación, y el repositorio solo distribuye pesos safetensors con código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal multimodal con codificador visual (transformer; detalles de capas y atención no disponibles) |
| Parametros totales | 9.794.197.512 (9,79 B), según los pesos safetensors |
| Longitud de contexto | Hasta 128K tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se documentan GGUF, AWQ, GPTQ ni otras variantes) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | No disponible |
| Formato de pesos | safetensors (requiere custom_code, es decir, `trust_remote_code=True`) |
| Backbone de lenguaje | Qwen3.5-9B LLM Decoder |
| Codificador visual | C-RADIOv4-H |
| Resolución visual | Resolución arbitraria (any-resolution) |
| Modalidades de entrada | Texto, imagen única, múltiples imágenes y vídeo |
| Tamaño del repositorio | 19,6 GB |
| Fechas del repositorio | Creado el 2026-09-04; actualizado el 2026-09-15 |
| Descargas / likes en HuggingFace | 12 descargas y 70 likes |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje causal multimodal: un decodificador Qwen3.5-9B acoplado a un codificador visual C-RADIOv4-H. El modelo acepta resolución arbitraria en la entrada visual, lo que evita el reescalado fijo a una resolución canónica y permite procesar documentos densos, capturas de pantalla o detalles finos sin pérdida de resolución. La ventana de contexto declarada es de hasta 128K tokens y cubre texto, imagen única, múltiples imágenes y vídeo.

La innovación técnica destacada en la model card es el Entropy-Gated Adaptive Recurrent Reasoning: el modelo asigna dinámicamente pasos adicionales de refinamiento recurrente en el espacio latente a aquellos tokens que resultan más difíciles, de modo que incrementa la profundidad de cómputo solo donde es necesario para mejorar el razonamiento en tareas complejas. No se especifica si se trata de una arquitectura recurrente sobre capas existentes o de un módulo adicional.

No hay información pública sobre el número de tokens de entrenamiento, la composición del dataset, la mezcla de datos de visión y lenguaje, ni sobre si se aplicaron etapas de RLHF, DPO u otra forma de alineación. Tampoco se documenta el método empleado para extender el contexto hasta 128K tokens ni el diseño interno del codificador visual dentro del pipeline.

## Capacidades

- Comprensión visual general: reconocimiento de objetos, atributos y escenas; lectura de texto en imágenes naturales y documentos; interpretación de tablas, formularios, gráficos y diagramas; respuesta a preguntas que combinan evidencia visual con conocimiento del mundo.
- Razonamiento espacial 2D: relaciones izquierda/derecha, arriba/abajo, delante/detrás, oclusión, contención y distancia relativa; conteo denso; localización fina mediante puntos, coordenadas y cajas delimitadoras.
- Razonamiento espacial 3D y multi-vista: asociación entre imágenes y puntos de vista, movimiento de cámara, pose relativa, ordenación por profundidad, disposición de una habitación a escala, toma de perspectiva egocéntrica y alocéntrica, rotación 2D/3D, plegado de papel, proyección a tres vistas, secciones transversales y razonamiento sobre movimiento de piezas.
- Comprensión encarnada: affordances, semántica de manipulación y planificación de acciones de alto nivel para adaptación a VLA (vision-language-action).
- Múltiples imágenes y vídeo: comparación y razonamiento entre varias imágenes, seguimiento de eventos y recuperación de detalles en metraje largo dentro de la ventana de 128K tokens.
- Uso de herramientas en modo agente: tareas multi-paso y multi-turno. El modelo no ejecuta las herramientas por sí mismo; la ejecución debe implementarla, validarla y securizarla la aplicación que lo rodea.
- Matemáticas visuales y VQA anclado en conocimiento.
- Capacidades de texto: 93,7 en IFEval según el autor.
- Idiomas: inglés y chino. No se documenta soporte de castellano ni de otros idiomas.

## Casos de uso

- Atención al cliente automatizada sobre documentos e imágenes: el modelo puede leer capturas, facturas o formularios adjuntos en una conversación multi-turno y mantener el hilo de varios casos dentro de la ventana de 128K tokens, combinando OCR y comprensión visual con respuesta en lenguaje.
- Back office documental: extracción de campos de formularios, tablas y diagramas escaneados, y respuesta a preguntas sobre el contenido, integrándose en un pipeline previo al sistema de gestión.
- Agentes con uso de herramientas: gracias a sus resultados reportados en TAU2-Bench (87,7) e IFEval (93,7), encaja como planificador en flujos de varios pasos donde la aplicación orquesta las llamadas a APIs y valida las salidas.
- Robótica e IA encarnada: percepción espacial, affordances y planificación de acciones de alto nivel para adaptación a VLA, con los 48 puntos en ERQA y 56 en RoboSpatial como referencia de partida. La ejecución física queda fuera del modelo.
- Análisis de vídeo: seguimiento de eventos y recuperación de detalles concretos en grabaciones largas, aprovechando el contexto de 128K tokens para mantener varios fragmentos o transcripciones simultáneamente.
- Geometría y matemáticas visuales en educación: resolución de problemas de rotación, plegado de papel, proyecciones y secciones, con explicación del razonamiento.
- Comparación de producto en comercio electrónico: comparación entre varias imágenes de un mismo artículo o de alternativas, con verificación de atributos visuales frente a la ficha del catálogo.
- Análisis de planos y espacios: comprensión de disposición a escala de habitación, ordenación por profundidad y relaciones de contención a partir de fotografías o renders, útil en inmobiliaria y arquitectura.
- Investigación en evaluación multimodal: servir como referencia de 10B en comparativas de razonamiento espacial y encarnado frente a modelos abiertos y cerrados.

## Benchmarks y rendimiento

Resultados reportados por el autor. La tabla de la model card está truncada en la información disponible, por lo que solo se reproducen las filas completas.

| Benchmark | ZDTaichu5.0-9B | Qwen3.5-9B | STEP3-VL-10B | gemma4-8B-E4B | Gemini 3 Pro | Grok 4 | GPT-5.2 |
|---|---|---|---|---|---|---|---|
| CV-Bench | 86,82 | 87,19 | 83,49 | 68,10 | 90,07 | — | 86,84 |
| 3DSRBench | 60,96 | 56,78 | 55,01 | 53,62 (truncado) | no disponible | no disponible | no disponible |

Métricas adicionales citadas en el texto de la model card, sin tabla completa asociada:

| Área | Benchmark | Resultado |
|---|---|---|
| Razonamiento encarnado | ERQA | 48 |
| Razonamiento encarnado | RoboSpatial | 56 |
| Agentes | TAU2-Bench | 87,7 |
| Agentes | Claw-Eval | 71,4 |
| Instrucciones | IFEval | 93,7 |
| Espacial | SparBench, ViewSpatial, MMSI-Bench, MindCube-tiny | Reportados como líderes entre los VLM de propósito general de 10B comparados; cifras no incluidas en la información disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de benchmarks de texto estándar.

## Requisitos de hardware

- El repositorio ocupa 19,6 GB, coherente con 9,79 B de parámetros en precisión de 16 bits. Cargar los pesos en bf16/fp16 requiere aproximadamente 20 GB de VRAM solo para pesos, más el codificador visual, la caché KV y las activaciones.
- Estimación orientativa (no publicada por el autor) para pesos en bf16 con margen de trabajo: 24-28 GB de VRAM, dependiendo de la resolución de imagen, el número de imágenes y la longitud de contexto, ya que la entrada visual a resolución arbitraria y el vídeo incrementan mucho las activaciones.
- Estimación orientativa en 8 bits: 12-15 GB de VRAM. En 4 bits: 8-10 GB de VRAM. Estas cuantizaciones no están publicadas por el autor, por lo que habría que generarlas.
- GPU de centro de datos: A100 40 GB y 80 GB, H100 80 GB, A6000 48 GB. Para contexto largo con bf16 conviene disponer de 40 GB o más por instancia.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda al límite en bf16 y previsiblemente insuficiente con contexto largo o vídeo; con cuantización de 4-8 bits, generada por el usuario, sería viable en 24 GB y, en 4 bits, potencialmente en tarjetas de 12-16 GB.
- No hay datos publicados de caché KV ni de memoria por token de contexto, por lo que el dimensionado para 128K tokens no puede calcularse con precisión.
- Opciones de despliegue: el repositorio usa código personalizado, lo que implica cargarlo con `trust_remote_code=True` en la librería de transformers. No se documenta soporte de vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, ni la existencia de pesos GGUF o AWQ que lo permitan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | CV-Bench | 3DSRBench |
|---|---|---|---|---|---|
| ZDTaichu5.0-9B | 9,79 B | 128K | no disponible | 86,82 | 60,96 |
| Qwen3.5-9B | No disponible (denominación de 9B) | No disponible | No disponible | 87,19 | 56,78 |
| STEP3-VL-10B | No disponible (denominación de 10B) | No disponible | No disponible | 83,49 | 55,01 |
| gemma4-8B-E4B | No disponible (denominación de 8B) | No disponible | No disponible | 68,10 | 53,62 |

Los tres modelos comparables proceden de la propia tabla de benchmarks de la model card; no se dispone de sus fichas técnicas en la información proporcionada, por lo que la comparación se limita a los dos benchmarks completos y a la categoría de uso (VLM de propósito general en torno a 10B). Frente a modelos cerrados, la model card incluye comparaciones con Gemini 3 Pro (90,07 en CV-Bench), GPT-5.2 (86,84 en CV-Bench) y Grok 4, sin datos completos disponibles.

## Limitaciones y advertencias

- Licencia no publicada: no puede confirmarse si se permite uso comercial, redistribución o modificación. Es un bloqueante para cualquier despliegue en producción hasta contactar con el autor.
- Idiomas limitados a inglés y chino. No hay evidencia de rendimiento en castellano ni en otras lenguas.
- No hay información sobre datos de entrenamiento, composición del dataset ni etapas de alineación (RLHF/DPO), lo que impide evaluar sesgos de forma sistemática. Al entrenarse previsiblemente con datos web en inglés y chino, es esperable sesgo cultural y de representación, aunque no está documentado.
- Riesgo de alucinación inherente a los VLM, especialmente en OCR de documentos densos, en aritmética visual y en razonamiento espacial 3D con oclusiones o perspectivas ambiguas. Los resultados de benchmark no garantizan fiabilidad en dominios concretos.
- Las cifras de benchmarks son reportadas por el autor y las tablas de la model card están incompletas en la información disponible; no se han verificado de forma independiente.
- El modelo no ejecuta herramientas: cualquier flujo agéntico exige que la aplicación implemente la ejecución, la validación de argumentos y el aislamiento de seguridad. Un fallo del modelo puede traducirse en llamadas erróneas o peligrosas si no se validan.
- El repositorio usa código personalizado (`trust_remote_code=True`), lo que implica ejecutar código del autor al cargar el modelo; conviene revisarlo en entornos sensibles.
- El contexto de 128K tokens es una especificación declarada, sin datos de degradación a longitudes largas ni de memoria de caché KV.
- Solo se distribuyen pesos safetensors: no hay GGUF ni cuantizaciones oficiales, lo que dificulta el despliegue en hardware de consumo o mediante llama.cpp/Ollama sin conversión previa.
- Evidencia de adopción muy baja: 12 descargas frente a 70 likes, y sin casos de producción documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TaichuAI/ZDTaichu5.0-9B
- Página del proyecto: https://taichu-ai.github.io/ZDTaichu5.0-9B/
- Repositorio en GitHub: https://github.com/Taichu-AI/ZDTaichu5.0-9B
- Modelo en ModelScope: https://www.modelscope.cn/models/TaichuAI/ZDTaichu5.0-9B
- Contexto sobre la familia Zidong Taichu (plataforma multimodal, relación con este modelo no confirmada): https://aisharenet.com/en/taichu/
- Noticia sobre Zidong Taichu 3.0 (relación con este modelo no confirmada): https://news.aibase.com/news/13518
- Resultados de búsqueda sin relación directa con el modelo (Yi-9B): https://www.aibase.com/news/6470
- Resultados de búsqueda sin relación directa con el modelo (cronología de lanzamientos): https://aireleasetracker.com/
