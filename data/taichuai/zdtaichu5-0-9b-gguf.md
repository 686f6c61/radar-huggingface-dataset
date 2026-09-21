# TaichuAI/ZDTaichu5.0-9B-GGUF

## Resumen

ZDTaichu5.0-9B es un modelo fundacional multimodal desarrollado por TaichuAI, orientado a comprensión visual general, razonamiento espacial, uso de herramientas de forma agéntica e investigación en IA encarnada (embodied AI). El repositorio `TaichuAI/ZDTaichu5.0-9B-GGUF` distribuye los pesos en formato GGUF, compatibles con llama.cpp, Ollama y otras herramientas del ecosistema GGUF, con ejecución en CPU y GPU NVIDIA (CUDA).

El modelo combina un backbone de lenguaje Qwen3.5-9B con un codificador visual C-RADIOv4-H, y acepta texto, una o varias imágenes y vídeo con resolución arbitraria. Su ventana de contexto alcanza los 128K tokens. Con 8.953.803.264 parámetros totales, se posiciona en el segmento de los VLM de propósito general de escala 10B, donde el autor reclama capacidades de primera línea en comprensión visual general y liderazgo en razonamiento espacial, comprensión encarnada y tareas agénticas dentro de su grupo de comparación.

Su relevancia actual radica en que no sacrifica competencia visual general para especializarse: sobre una base de visión general sólida añade razonamiento espacial fino (relaciones 2D, asociación multi-vista, comprensión de escenas 3D, toma de perspectiva), comprensión de affordances para planificación de acciones y uso de herramientas multi-paso y multi-turno. Incorpora además una innovación de arquitectura denominada Entropy-Gated Adaptive Recurrent Reasoning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje causal multimodal con codificador visual |
| Parametros totales | 8.953.803.264 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | Hasta 128K tokens |
| Tipos de cuantizacion | Modelo de lenguaje: BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M. Codificador visual: BF16 y Q8_0 |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no disponible en este repositorio) |
| Backbone de lenguaje | Qwen3.5-9B LLM Decoder |
| Backbone de vision | C-RADIOv4-H |
| Modalidades de entrada | Texto, imagen unica, multiples imagenes y video |
| Resolucion visual | Entrada visual a resolucion arbitraria |
| Tamano del repositorio | 55,7 GB |
| Descargas / likes | 283 / 1 |
| Fecha de creacion | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje causal multimodal que empareja un decodificador de lenguaje Qwen3.5-9B con el codificador visual C-RADIOv4-H. El modelo procesa entrada visual a resolución arbitraria, lo que evita el reescalado forzado a resoluciones fijas y permite preservar detalle fino en documentos, diagramas y escenas densas. Acepta texto, una imagen, varias imágenes y vídeo dentro de la misma ventana de 128K tokens.

La innovación técnica declarada es Entropy-Gated Adaptive Recurrent Reasoning: el modelo asigna dinámicamente pasos adicionales de refinamiento recurrente en el espacio latente a los tokens más difíciles, incrementando la profundidad computacional donde es necesario y mejorando el rendimiento en tareas de razonamiento complejas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La distribución de los artefactos de cuantización separa el modelo de lenguaje y el codificador visual en dos componentes independientes, lo que permite cuantizar cada parte por separado.

## Capacidades

- Comprensión visual general: reconocimiento de objetos, atributos y escenas; lectura de texto en imágenes naturales y documentos; interpretación de tablas, formularios, gráficas y diagramas.
- Respuesta a preguntas que combinan evidencia visual con conocimiento lingüístico y del mundo.
- Matemáticas visuales y VQA fundamentado en conocimiento.
- Razonamiento espacial: izquierda/derecha, arriba/abajo, delante/detrás, oclusión, contención y distancia relativa.
- Conteo denso, localización fina, puntos, coordenadas y cajas delimitadoras.
- Asociación entre imágenes y entre puntos de vista distintos.
- Movimiento de cámara, pose relativa, ordenación de profundidad y disposición de escena a escala de habitación.
- Toma de perspectiva egocéntrica y alocéntrica.
- Rotación 2D/3D, plegado de papel, proyección a tres vistas, secciones transversales y razonamiento sobre movimiento de piezas.
- Affordances encarnadas, semántica de manipulación y planificación de acciones de alto nivel.
- Comprensión de vídeo: seguimiento de eventos y recuperación de detalles en metraje largo dentro de la ventana de 128K tokens.
- Uso de herramientas agéntico multi-paso y multi-turno (el modelo no ejecuta las herramientas por sí mismo; la ejecución, validación y securización corresponden a la aplicación anfitriona).
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.

## Casos de uso

- Automatización de atención al cliente con soporte visual: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas, facturas o fotografías de producto, aprovechando la ventana de 128K tokens para mantener el histórico completo de la sesión sin truncar.
- Análisis documental y OCR a escala: extracción de datos de tablas, formularios y diagramas con resolución arbitraria de entrada, lo que reduce errores en documentos densos donde el reescalado degrada el texto pequeño.
- Robótica y planificación de manipulación: uso de las capacidades de affordance y razonamiento espacial para generar planes de acción de alto nivel y comprender semántica de manipulación antes de transferir la política a un modelo VLA específico.
- Inspección y mantenimiento industrial: interpretación de diagramas, planos y secciones transversales, con razonamiento sobre proyecciones a tres vistas y movimiento de piezas para diagnosticar montajes.
- Análisis de vídeo de vigilancia o deportes: seguimiento de eventos y recuperación de detalles concretos en metraje largo apoyándose en el contexto de 128K tokens.
- Agentes con herramientas en flujos de trabajo empresariales: el modelo sobresale en benchmarks de uso de herramientas (TAU2-Bench 87.7, Claw-Eval 71.4), por lo que encaja como planificador en pipelines que orquestan APIs, bases de datos y sistemas internos, siempre que la aplicación implemente la ejecución real de las herramientas.
- Asistencia educativa en geometría y matemáticas visuales: resolución de problemas de rotación, plegado de papel y proyecciones, con explicación paso a paso apoyada en la imagen.
- Evaluación de interfaz y accesibilidad: descripción de escenas, relación espacial entre elementos de una UI o de un entorno físico y generación de descripciones alternativas.
- Investigación en IA encarnada: banco de pruebas para estudiar toma de perspectiva, razonamiento alocéntrico y planificación de alto nivel sin necesidad de hardware robótico en la fase de evaluación.

## Benchmarks y rendimiento

La model card publica los resultados de forma parcial: la tabla de razonamiento espacial y encarnado aparece truncada en la información disponible, y las comparativas generales se presentan como figuras SVG no legibles en el texto extraído. Se reproducen a continuación únicamente los valores numéricos disponibles.

| Benchmark | ZDTaichu5.0-9B | Qwen3.5-9B | STEP3-VL-10B | gemma4-8B-E4B |
|---|---|---|---|---|
| CV-Bench (percepción espacial básica) | 86,82 | 87,19 | 83,49 | no disponible (tabla truncada) |
| TAU2-Bench (agentes) | 87,7 | no disponible | no disponible | no disponible |
| Claw-Eval (agentes) | 71,4 | no disponible | no disponible | no disponible |
| IFEval (texto) | 93,7 | no disponible | no disponible | no disponible |
| ERQA | 48 | no disponible | no disponible | no disponible |
| RoboSpatial | 56 | no disponible | no disponible | no disponible |

El autor afirma que el modelo lidera las comparativas de TAU2-Bench (87,7) y Claw-Eval (71,4) frente a los VLM de propósito general de escala 10B incluidos en su comparativa, y que encabeza la capacidad espacial del grupo con resultados en SparBench, ViewSpatial, MMSI-Bench y MindCube-tiny, aunque no se proporcionan las cifras concretas de estos cuatro benchmarks. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones calculadas a partir del número de parámetros (8.953.803.264) y del formato de cuantización, e incluyen únicamente los pesos del modelo de lenguaje; deben sumarse el codificador visual y la caché KV.

- BF16: aproximadamente 18 GB solo para los pesos del modelo de lenguaje; requiere GPU de 24 GB o superior (RTX 3090/4090, L40S, A100) y no cabe en GPU de consumo con 16 GB.
- Q8_0: aproximadamente 9,5 GB; cabe en RTX 4090 (24 GB) y en GPUs de 12-16 GB con margen limitado para contexto largo.
- Q6_K: aproximadamente 7,5 GB.
- Q5_K_M: aproximadamente 6,5 GB.
- Q5_0: aproximadamente 6,5 GB.
- Q4_K_M: aproximadamente 5,5 GB; es la opción más viable para GPU de consumo de 8-12 GB, con la caché KV como factor limitante en contextos de 128K tokens.
- Codificador visual: BF16 y Q8_0; debe sumarse a las cifras anteriores (tamaño exacto no disponible).
- Opciones de despliegue: llama.cpp, Ollama y otras herramientas basadas en GGUF. El repositorio declara compatibilidad con CPU y GPU NVIDIA (CUDA). El soporte de vLLM, TGI o TensorRT-LLM no está confirmado en la información disponible para este repositorio GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Punto fuerte declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZDTaichu5.0-9B | 8,95B | 128K | Espacial, encarnado y agéntico sobre base visual general | no disponible | GGUF en HuggingFace y ModelScope |
| Qwen3.5-9B | no disponible | no disponible | Base de lenguaje del propio modelo; CV-Bench 87,19 | no disponible | no disponible |
| STEP3-VL-10B | 10B (por nombre) | no disponible | VLM de propósito general; CV-Bench 83,49 | no disponible | no disponible |
| gemma4-8B-E4B | 8B (por nombre) | no disponible | VLM de propósito general de escala similar | no disponible | no disponible |

La model card menciona además comparaciones frente a modelos cerrados (Gemini 3 Pro, Grok 4, GPT-5.2), pero no se han extraído las cifras correspondientes. No hay datos de licencia, contexto ni parámetros de los modelos competidores en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un bloqueo potencial para producción y debe verificarse con el autor antes de cualquier despliegue.
- Solo se declaran los idiomas inglés y chino. El rendimiento en castellano no está documentado y no debería asumirse.
- Riesgo de alucinación: no se documentan en la información disponible tasas de error, filtros de seguridad ni mecanismos de mitigación. Como todo VLM de 9B, puede generar descripciones o lecturas de texto plausibles pero incorrectas, especialmente en documentos degradados o escenas ambiguas.
- Las capacidades espaciales y encarnadas se reportan bajo condiciones de evaluación concretas del autor; la transferencia a dominios y distribuciones de cámara distintos no está validada.
- El modelo no ejecuta herramientas por sí mismo. Toda ejecución, validación y securización debe implementarse en la aplicación anfitriona, lo que introduce superficie de ataque y requisitos de sandboxing.
- El repositorio es únicamente GGUF. La cuantización introduce degradación no medida respecto a los pesos originales, y no se publican curvas de degradación por nivel de cuantización.
- La caché KV con contexto de 128K tokens puede consumir una cantidad de VRAM muy superior a la de los pesos, limitando la ventana útil en GPU de consumo.
- La tabla de benchmarks de la model card está truncada en la información disponible, por lo que no es posible auditar una parte del rendimiento declarado.
- Con solo 283 descargas y 1 like, la validación por parte de la comunidad es prácticamente inexistente.

## Enlaces

- HuggingFace: https://huggingface.co/TaichuAI/ZDTaichu5.0-9B-GGUF
- Pagina del proyecto: https://taichu-ai.github.io/ZDTaichu5.0-9B/
- GitHub: https://github.com/Taichu-AI/ZDTaichu5.0-9B
- ModelScope: https://www.modelscope.cn/models/TaichuAI/ZDTaichu5.0-9B

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados no guardan relacion con la ficha y se han descartado.
