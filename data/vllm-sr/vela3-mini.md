# vllm-sr/vela3-mini

## Resumen

vela3-mini es un modelo de decisión y extracción de 4,54B parámetros desarrollado por vLLM Semantic Router (vllm-sr) en colaboración con KR Labs, presentado como el miembro intermedio de la familia Vela 3.0. Se construye sobre el modelo base d3-mini, que permanece congelado, y añade adaptadores LoRA con compuertas especializados por tarea. Su función no es generar texto libre, sino responder a decisiones estructuradas (elección entre opciones, sí/no, puntuaciones) y localizar fragmentos exactos en el texto: entidades, relaciones, datos personales, afirmaciones no respaldadas y evidencia, devolviendo probabilidades y desplazamientos de caracteres.

El modelo está orientado a enrutamiento de LLM (semantic routing) y barreras de seguridad (guardrails), con etiquetas que cubren clasificación zero-shot, NER, extracción de relaciones, detección de PII, detección de alucinaciones y señales de enrutador. Acepta texto, JSON e imágenes como entrada, e incorpora un codificador de visión en la base.

Con licencia Apache-2.0 y un tamaño de repositorio de 1,1 GB, es relevante ahora porque ofrece una alternativa compacta (4B) para tareas de clasificación y extracción estructurada que compite con modelos mucho mayores en benchmarks públicos, manteniendo la fidelidad bit a bit de las decisiones del modelo base gracias a que este permanece congelado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con adaptadores LoRA con compuertas sobre base d3-mini congelada; codificador de visión en la base |
| Parámetros totales | 4,54B (con codificador de visión) + 973 MB de adaptadores y cabezas |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de 1,1 GB, librería transformers, custom_code) |

## Arquitectura y entrenamiento

vela3-mini se construye sobre vllm-sr/d3-mini en la revisión `566da0ea`, que permanece congelada y sin modificar. Sobre esa base se añaden pequeños adaptadores LoRA con compuertas, uno por tarea: spans (afirmaciones no respaldadas, datos personales, evidencia), entidades, relaciones, señales de enrutador y spans de alucinación en imágenes. Cada adaptador se activa únicamente para sus propias preguntas, de modo que las decisiones ordinarias las responde d3-mini directamente, bit a bit.

El entrenamiento de las señales de enrutador es supervisado, siguiendo el esquema de Vela 2.0, sobre los datasets públicos que usó Vela 2.0: AEGIS 2.0, PolyGuardMix y Nemotron-Safety-Guard v3 para seguridad, Global-MMLU para dominio, WildFeedback para feedback, DiffusionDB para modalidad y MASSIVE para intenciones; dominio y feedback también usan el split de entrenamiento de la suite pública de señales de enrutador. Otros datos de entrenamiento incluyen datasets públicos de NER, relaciones, alucinaciones, evidencia y PII, además de texto web y de documentos etiquetado por un modelo maestro grande. Según la model card, no se entrena con ningún split de test ni con ítems del Decision Index, aunque algunas filas de test de la suite de señales de enrutador también aparecen en fuentes públicas de entrenamiento, por lo que la tabla de enrutador reporta también las filas sin esa superposición.

## Capacidades

- Clasificación zero-shot con respuesta de elección entre opciones, sí/no o puntuación.
- Extracción de entidades nombradas (NER) zero-shot con etiquetas definidas por el usuario, generando definiciones propias por etiqueta en inferencia y cacheándolas.
- Extracción de relaciones zero-shot.
- Detección de datos personales (PII) sobre los 17 tipos entrenados, con subconjuntos arbitrarios.
- Detección de afirmaciones no respaldadas (alucinaciones) y extracción de evidencia con contexto y respuesta.
- Detección de spans de alucinación en imágenes (capacidad multimodal).
- Señales de enrutador integradas mediante identificadores de pregunta en `router_questions.json`.
- Entrada multimodal: texto, JSON e imágenes.
- No genera texto libre: devuelve probabilidades, etiquetas y desplazamientos de caracteres.

## Casos de uso

- Enrutamiento de peticiones entre LLM: el modelo clasifica la intención, el dominio o la modalidad de una consulta y devuelve una probabilidad por opción, permitiendo dirigir cada petición al modelo o pipeline adecuado con una sola llamada `system_one`.
- Barreras de seguridad en producción: las señales de enrutador entrenadas sobre datasets de seguridad (AEGIS 2.0, PolyGuardMix, Nemotron-Safety-Guard v3) permiten filtrar contenido no seguro antes de llegar al modelo generativo.
- Detección de PII en flujos de datos: extrae spans de los 17 tipos de datos personales entrenados con offsets de caracteres, útil para anonimizar o auditar textos antes de almacenarlos o enviarlos a terceros.
- Verificación de respuestas RAG: dada una respuesta y su contexto, localiza afirmaciones no respaldadas y los spans de evidencia, lo que permite marcar respuestas alucinadas en sistemas de recuperación aumentada.
- Extracción de entidades y relaciones en dominios nuevos: al ser zero-shot y generar sus propias definiciones de etiqueta, se puede desplegar sobre dominios como farmacéutico (drug, dosage) o financiero sin reentrenamiento.
- Moderación de contenido multimodal: la detección de spans de alucinación en imágenes y las señales de modalidad permiten clasificar y filtrar entradas que combinan texto e imagen.
- Clasificación de tickets y feedback: las señales de intención (MASSIVE) y feedback (WildFeedback) permiten etiquetar automáticamente consultas de soporte y opiniones de usuario para su triaje.

## Benchmarks y rendimiento

| Benchmark | vela3-mini | Referencia comparada |
|---|---|---|
| GLiFormer classification suite (13 sets) | 80,2 | GPT-5-mini: 79,8 (reportado, GLiFormer Tab 5) |
| Relaciones (protocolo GLiFormer Tab 4, media de 4) | 30,1 | Qwen3.5-9B prompted: 25,7 (mejor reportado) |
| NER zero-shot OOD-7 (con definiciones propias) | 65,7 | no disponible |
| NER zero-shot OOD-7 (solo nombres de etiqueta) | 63,3 | no disponible |
| Evidencia QASPER (word-F1, zero-shot) | 45,3 | Vela 2.0 4B: 31,5 (mismo harness) |
| Suite pública de señales de enrutador | mejor que Vela 2.0 4B en 18 de 24 ficheros, igual en 5, peor en 1 (IC 95% pareado) | Vela 2.0 4B |
| Decisiones ordinarias | 561 de 561 idénticas a d3-mini@566da0ea | d3-mini (adaptadores desactivados) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 1,1 GB y el modelo declara 4,54B parámetros más 973 MB de adaptadores.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card indica uso con la librería transformers y código personalizado (`custom_code`); no se detallan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vela3-mini | 4,54B + 973 MB adaptadores | no disponible | GLiFormer 80,2; relaciones 30,1; OOD-7 65,7 | Apache-2.0 | Hugging Face (vllm-sr/vela3-mini) |
| Vela 2.0 4B | 4B | no disponible | QASPER 31,5; peor en 18 de 24 ficheros de enrutador | no disponible | no disponible |
| GPT-5-mini | no disponible | no disponible | GLiFormer 79,8 (reportado) | propietaria | API |
| Qwen3.5-9B (prompted) | 9B | no disponible | Relaciones 25,7 (reportado) | no disponible | no disponible |

## Limitaciones y advertencias

- No genera texto libre: solo devuelve decisiones, etiquetas, probabilidades y spans; no sirve para tareas generativas.
- La model card advierte de que algunas filas de test de la suite pública de señales de enrutador aparecen en fuentes públicas de entrenamiento, por lo que las cifras de esa tabla pueden estar infladas; se recomienda consultar las filas sin superposición.
- Los benchmarks de otros modelos son cifras reportadas por sus autores o puntuadas por el equipo del modelo, no reproducciones independientes.
- La longitud de contexto no está documentada, lo que limita la planificación de despliegues con documentos largos.
- Los idiomas soportados no están documentados; no se puede asumir cobertura multilingüe más allá de lo que indiquen los datasets de entrenamiento (MASSIVE, Global-MMLU).
- No se detallan sesgos conocidos ni tasas de alucinación específicas del modelo.
- El modelo depende de código personalizado (`custom_code`) y de la revisión concreta `566da0ea` del modelo base; cambios en esa revisión pueden afectar al comportamiento.
- Licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los datasets de entrenamiento subyacentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-sr/vela3-mini
- Modelo base d3-mini: https://huggingface.co/vllm-sr/d3-mini
- Colección Vela 3.0: https://huggingface.co/collections/vllm-sr/vela-30-6ad1c430eb1718eb4754edcd
