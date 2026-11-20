# TaichuAI/ZDTaichu5.0-9B

## Resumen

ZDTaichu5.0-9B es un modelo fundacional multimodal desarrollado por TaichuAI, orientado a comprensión visual general, razonamiento espacial, uso de herramientas en modo agente e investigación en IA encarnada (embodied AI). Combina un backbone de lenguaje Qwen3.5-9B con un codificador visual C-RADIOv4-H, y acepta texto, una o varias imágenes y vídeo con resolución visual arbitraria. Su ventana de contexto alcanza los 128K tokens.

El modelo se posiciona como una alternativa de escala 10B que no sacrifica competencia visual general para especializarse: mantiene resultados de primer nivel en tareas de imagen, documento, gráfico, diagrama, OCR y matemáticas visuales, y añade capacidades de razonamiento espacial 2D/3D, comprensión de affordances y planificación de acciones de alto nivel para adaptación a VLA y robótica. Según la model card, lidera varias comparativas entre VLMs generales de 10B en razonamiento espacial y capacidades de agente.

Con 9.794.197.512 parámetros y un repositorio de 19,6 GB, es un modelo relevante para quienes necesitan un VLM compacto con contexto largo, soporte de vídeo y tool calling multi-turno, desplegable en infraestructura de una sola GPU de gama alta. La licencia no está publicada en la información disponible, lo que condiciona cualquier evaluación de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal multimodal con codificador visual (backbone Qwen3.5-9B + vision encoder C-RADIOv4-H) |
| Parametros totales | 9.794.197.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 128K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje causal multimodal: un decodificador LLM Qwen3.5-9B acoplado a un codificador visual C-RADIOv4-H. El modelo acepta entrada visual a resolución arbitraria, lo que permite procesar imágenes de distinta relación de aspecto sin reescalado forzado, y admite múltiples imágenes y vídeo dentro de la misma ventana de contexto de 128K tokens.

La innovación técnica destacada en la model card es el *Entropy-Gated Adaptive Recurrent Reasoning*: el modelo asigna dinámicamente pasos adicionales de refinamiento recurrente en el espacio latente a aquellos tokens que resultan más difíciles, aumentando la profundidad computacional donde es necesario y mejorando el rendimiento en tareas de razonamiento complejas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Comprensión visual general: reconocimiento de objetos, atributos y escenas; lectura de texto en imágenes naturales y documentos; interpretación de tablas, formularios, gráficas y diagramas.
- OCR y comprensión de documentos.
- Matemáticas visuales y respuesta a preguntas visuales apoyada en conocimiento.
- Razonamiento espacial: relaciones izquierda/derecha, arriba/abajo, delante/detrás, oclusión, contención y distancia relativa; conteo denso; localización fina con puntos, coordenadas y bounding boxes.
- Asociación entre imágenes y puntos de vista; movimiento de cámara, pose relativa, ordenación de profundidad y disposición de escena a escala de habitación.
- Toma de perspectiva egocéntrica y alocéntrica; rotación 2D/3D, plegado de papel, proyección en tres vistas, secciones transversales y razonamiento sobre movimiento de partes.
- Comprensión de affordances encarnadas, semántica de manipulación y planificación de acciones de alto nivel.
- Razonamiento sobre múltiples imágenes y comprensión de vídeo, incluyendo seguimiento de eventos y recuperación de detalles en metraje largo dentro de la ventana de 128K tokens.
- Uso de herramientas multi-paso y multi-turno (tool calling); la ejecución real de las herramientas debe implementarla y asegurarla la aplicación circundante, el modelo no ejecuta herramientas por sí mismo.
- Multilingüe limitado a inglés y chino.

## Casos de uso

- Automatización de documentación técnica: el modelo puede extraer información de manuales, planos y diagramas con OCR y comprensión de tablas, aprovechando la resolución arbitraria para no perder detalle en documentos densos.
- Análisis de vídeo de vigilancia o inspección: con 128K tokens de contexto puede procesar metraje largo, rastrear eventos y recuperar detalles concretos de secuencias extensas sin segmentación manual previa.
- Agente de atención al cliente con acceso a herramientas: soporta tool calling multi-turno para consultar sistemas internos, gestionar pedidos o escalar incidencias, siempre que la aplicación implemente la ejecución y validación de las llamadas.
- Robótica y VLA: sus capacidades de percepción espacial, affordances y planificación de acciones permiten adaptarlo como módulo de razonamiento de alto nivel en pipelines de manipulación y navegación.
- Asistencia en tareas de diseño y CAD: razonamiento sobre proyecciones en tres vistas, secciones transversales y rotaciones 3D para verificar coherencia geométrica de piezas o planos.
- Evaluación educativa de matemáticas y geometría: resolución de problemas visuales con gráficas y figuras, combinando evidencia visual con conocimiento.
- Moderación y descripción de contenido multimodal: comparación entre múltiples imágenes de un mismo producto o escena para detectar inconsistencias o cambios.
- Investigación en razonamiento espacial: banco de pruebas para experimentos de toma de perspectiva y transformación mental, con benchmarks publicados como referencia.

## Benchmarks y rendimiento

Resultados de razonamiento espacial y encarnado publicados en la model card (la tabla original está truncada en la información disponible; se recogen los valores completos):

| Area | Benchmark | ZDTaichu5.0-9B | Qwen3.5-9B | STEP3-VL-10B | gemma4-8B-E4B | Gemini 3 Pro | GPT-5.2 |
|---|---|---|---|---|---|---|---|
| Percepción espacial básica | CV-Bench | 86,82 | 87,19 | 83,49 | 68,10 | 90,07 | 86,84 |
| Percepción espacial básica | 3DSRBench | 60,96 | 56,78 | 55,01 | 53,62 | no disponible | no disponible |

Otros resultados citados en el texto de la model card:

| Benchmark | Resultado | Nota |
|---|---|---|
| ERQA | 48 | razonamiento de escena |
| RoboSpatial | 56 | affordances y comprensión orientada a interacción |
| TAU2-Bench | 87,7 | lidera la comparativa reportada entre VLMs generales de 10B |
| Claw-Eval | 71,4 | lidera la comparativa reportada entre VLMs generales de 10B |
| IFEval | 93,7 | seguimiento de instrucciones |

Los resultados completos de SparBench, ViewSpatial, MMSI-Bench y MindCube-tiny se presentan en las figuras de la model card (comparación con modelos abiertos y cerrados), pero sus valores numéricos no están incluidos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,79B parámetros, en FP16 se requieren aproximadamente 19,6 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 10-11 GB; en 4 bits, en torno a 5-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 con cuantización; en GPUs de 16 GB probablemente solo con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: al usar `custom_code`, requiere `trust_remote_code=True`; es compatible con frameworks estándar de inferencia (vLLM, TGI, llama.cpp/Ollama si existe conversión GGUF), aunque la disponibilidad de soporte específico no está confirmada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Puntos fuertes | Disponibilidad |
|---|---|---|---|---|---|
| ZDTaichu5.0-9B | 9,79B | 128K | no disponible | Razonamiento espacial, agente, vídeo, affordances | Hugging Face, ModelScope |
| Qwen3.5-9B | 9B (no confirmado) | no disponible | no disponible | Mejor CV-Bench (87,19), base del backbone | no disponible |
| STEP3-VL-10B | 10B | no disponible | no disponible | VLM general de escala similar | no disponible |
| gemma4-8B-E4B | 8B | no disponible | no disponible | VLM compacto generalista | no disponible |

ZDTaichu5.0-9B supera a Qwen3.5-9B en 3DSRBench (60,96 frente a 56,78) y a STEP3-VL-10B en CV-Bench y 3DSRBench, aunque queda ligeramente por debajo de Qwen3.5-9B en CV-Bench. Frente a modelos cerrados como Gemini 3 Pro, la brecha en CV-Bench es de unos 3,25 puntos.

## Limitaciones y advertencias

- Licencia no publicada: no es posible determinar si se permite uso comercial; es un bloqueo para producción hasta confirmación.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en OCR de documentos de baja calidad y en preguntas visuales que requieren conocimiento externo.
- El tool calling requiere implementación, validación y securización por parte de la aplicación; el modelo no ejecuta herramientas ni verifica sus resultados.
- La ventana de 128K tokens con entrada visual de resolución arbitraria puede disparar el consumo de memoria y la latencia en contextos largos.
- Requiere `trust_remote_code=True` por el uso de código personalizado, lo que implica revisar el código antes de desplegarlo en entornos sensibles.
- No se han publicado detalles sobre composición del dataset de entrenamiento ni sobre sesgos conocidos; la evaluación de sesgos queda pendiente.
- Los benchmarks de la model card están seleccionados por el autor y la tabla de comparación está truncada en la información disponible; conviene tratarlos con cautela.

## Enlaces

- Hugging Face: https://huggingface.co/TaichuAI/ZDTaichu5.0-9B
- Project page: https://taichu-ai.github.io/ZDTaichu5.0-9B/
- GitHub: https://github.com/Taichu-AI/ZDTaichu5.0-9B
- ModelScope: https://www.modelscope.cn/models/TaichuAI/ZDTaichu5.0-9B
