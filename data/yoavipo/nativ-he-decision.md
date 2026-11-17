# yoavipo/nativ-he-decision

## Resumen

Nativ (נתיב, "camino" en hebreo) es un modelo de decisión y clasificación para hebreo desarrollado por el usuario de Hugging Face yoavipo. No es un modelo generativo: recibe un texto en hebreo, una pregunta y un conjunto de entre 2 y 7 opciones en texto libre, y devuelve en un único forward pass una probabilidad calibrada para cada opción. Está construido sobre el encoder hebreo `dicta-il/neodictabert` (364M parámetros) más un cabezal de puntuación de opciones, y se distribuye con licencia CC BY 4.0, lo que permite uso comercial.

El modelo resuelve un problema muy concreto en pipelines de producción en hebreo: enrutar peticiones (intención, departamento, política aplicable), clasificar sentimiento o temas, detectar información personal y responder preguntas de comprensión lectora, todo sin generación de texto ni necesidad de GPU. Según el autor, la versión v2 (octubre de 2026) iguala o supera a la API Decisions de OpenAI en 6 de 9 pruebas y queda a menos de 5 puntos en otras dos, y supera a Laya multilingual en las 9.

La relevancia actual radica en su combinación de latencia (~70 ms por decisión en CPU de portátil), calibración explícitamente reportada por tarea y licencia permisiva, lo que lo hace apto para umbrales de confianza en producción (por ejemplo, derivar a un humano por debajo de 0,8). Su alcance es estrictamente monolingüe (hebreo) y su ventana de entrada está limitada a 1.024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base `dicta-il/neodictabert`) con cabezal de puntuación de opciones |
| Parametros totales | 363.770.113 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens de entrada; el estado largo se trunca y se conservan pregunta y opciones |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | hebreo (he) |
| Licencia | CC BY 4.0 (uso comercial permitido) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo parte del encoder `dicta-il/neodictabert` y añade un mecanismo de puntuación que evalúa cada opción candidata contra el par (estado, pregunta), produciendo una distribución de probabilidad sobre las opciones en un solo paso hacia delante. No hay decodificación autoregresiva ni parseo de prompts: la salida es directamente un vector de probabilidades alineado con el orden de las opciones proporcionadas. La entrada se limita a 1.024 tokens y el diseño prioriza explícitamente la calibración (error de calibración reportado por tarea) frente a la generación libre.

El entrenamiento combina las particiones de train de MASSIVE, HeQ, OnlpLab y SIB-200 (incluidas las 66 frases de train que no forman parte de Belebele), además de MultiNLI (del que se tradujo HebNLI, excluyendo cada premisa del test), y datos de intención y emoción en hebreo del propio autor (`yoavipo/hebrew-intent-emotion`). La v2 incorpora datos nuevos de tema, inferencia, preguntas sí/no y preguntas de lectura estilo Belebele, además de más aritmética de políticas. El autor declara que nunca se entrenó con ficheros de validación o test. No se documentan detalles sobre RLHF, DPO ni número total de tokens de entrenamiento.

## Capacidades

- Clasificación de intención del usuario con opciones en hebreo libre (2 a 7 opciones por consulta).
- Enrutamiento de peticiones a departamentos o colas (envíos, devoluciones, facturación, soporte técnico).
- Clasificación de sentimiento (positivo, negativo, neutral) de comentarios.
- Detección de información personal en mensajes.
- Inferencia de lenguaje natural (NLI): determinar si una frase se sigue de otra.
- Clasificación temática de frases (7 opciones en SIB-200).
- Distinción entre petición del usuario y política aplicable.
- Comprensión lectora con preguntas de opción múltiple.
- Respuesta a preguntas sí/no (BoolQ en hebreo).
- Procesamiento por lotes mediante `decide_many` con listas de diccionarios `{"state", "question", "options"}`.
- Salida de probabilidad calibrada por opción, apta para umbrales de confianza.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento extendido; no es un modelo generativo.

## Casos de uso

- Enrutamiento de tickets de atención al cliente: dado el mensaje del usuario y una pregunta como "¿a qué departamento derivar?", el modelo devuelve la probabilidad de cada cola (envíos, devoluciones, facturación, soporte técnico) en ~70 ms en CPU, lo que permite clasificar en tiempo real sin GPU y derivar a un humano cuando la confianza cae por debajo de un umbral calibrado.
- Moderación y triaje de mensajes con datos personales: la prueba de información personal en nativ-bench alcanza 0,954 de precisión, por lo que puede usarse como primer filtro para marcar mensajes que contienen PII antes de enviarlos a un sistema de anonimización o revisión humana.
- Análisis de sentimiento de comentarios y reseñas: con 0,905 de precisión en OnlpLab, es adecuado para paneles de opinión, alertas de insatisfacción o priorización de reseñas negativas en plataformas en hebreo.
- Clasificación temática de contenido: con 0,858 en SIB-200 sobre 7 opciones, sirve para etiquetar noticias, artículos o publicaciones y alimentar sistemas de recomendación o búsqueda facetada en hebreo.
- Verificación de coherencia en pipelines RAG: la prueba HeQ (¿responde el párrafo a la pregunta?) con 0,855 permite descartar pasajes recuperados que no sustentan la respuesta antes de pasarlos a un modelo generador, reduciendo alucinaciones en asistentes documentales en hebreo.
- Detección de contradicciones y control de políticas: con 0,808 en HebNLI y 0,926 en la distinción petición/política, puede comprobar si una solicitud del usuario es compatible con una política interna o si dos afirmaciones se contradicen en flujos de compliance.
- Evaluación de comprensión lectora en educación: con preguntas de opción múltiple y probabilidades calibradas, permite corregir automáticamente ejercicios en hebreo y detectar ítems ambiguos por baja confianza del modelo.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (precisión, mayor es mejor; calibración, menor es mejor). Las dos pruebas de nativ-bench fueron escritas para este benchmark y no aparecen en los datos de entrenamiento; las otras siete son conjuntos de test públicos en hebreo.

| Test (dataset) | Nativ v2 | OpenAI Decisions | Laya multilingual | Laya-Hebrew | DeepSeek V4 Flash |
|---|---|---|---|---|---|
| Intención del usuario, 4 opciones (MASSIVE) | 0,965 | 0,925 | 0,644 | 0,887 | 0,905 |
| ¿Responde el párrafo? (HeQ) | 0,855 | 0,737 | 0,582 | 0,694 | 0,847 |
| Sentimiento de comentario (OnlpLab) | 0,905 | 0,865 | 0,680 | 0,822 | 0,838 |
| Información personal (nativ-bench) | 0,954 | 0,593 | 0,566 | 0,848 | 0,890 |
| Inferencia entre frases (HebNLI) | 0,808 | 0,734 | 0,480 | 0,606 | 0,577 |
| Tema de frase, 7 opciones (SIB-200) | 0,858 | 0,858 | 0,583 | 0,789 | 0,858 |
| Petición vs política (nativ-bench) | 0,926 | 0,970 | 0,298 | 0,406 | 0,624 |
| Positivo/negativo/neutro (HebrewSentiment) | 0,656 | 0,699 | 0,429 | 0,830 | 0,611 |
| Comprensión lectora, 4 opciones (Belebele) | 0,588 | 0,910 | 0,318 | 0,758 | 0,883 |

| Test (dataset) | Nativ v2 | OpenAI Decisions | Laya multilingual | Laya-Hebrew | DeepSeek V4 Flash |
|---|---|---|---|---|---|
| Calibración MASSIVE | 0,011 | 0,011 | 0,085 | 0,028 | 0,050 |
| Calibración HeQ | 0,019 | 0,140 | 0,338 | 0,061 | 0,096 |
| Calibración OnlpLab | 0,009 | 0,076 | 0,062 | 0,064 | 0,132 |
| Calibración información personal | 0,078 | 0,285 | 0,356 | 0,028 | 0,069 |
| Calibración HebNLI | 0,089 | 0,062 | 0,191 | 0,114 | 0,242 |
| Calibración SIB-200 | 0,072 | 0,058 | 0,112 | 0,096 | 0,109 |
| Calibración petición vs política | 0,060 | 0,038 | 0,373 | 0,365 | 0,311 |
| Calibración HebrewSentiment | 0,105 | 0,128 | 0,146 | 0,062 | 0,282 |
| Calibración Belebele | 0,133 | 0,016 | 0,229 | 0,026 | 0,086 |

Evolución v1 a v2 reportada por el autor: SIB-200 0,755 → 0,858; HebNLI 0,476 → 0,808; Belebele 0,551 → 0,588.

## Requisitos de hardware

- Inferencia en CPU: el autor reporta ~70 ms por decisión en un procesador de portátil, con 364M parámetros en safetensors (repo de 1,5 GB).
- VRAM estimada en GPU: no disponible en la información proporcionada; por tamaño, los pesos en fp32 rondan 1,5 GB y en fp16/bf16 unos 0,7 GB, por lo que cabría en cualquier GPU consumer moderna (RTX 3060 en adelante), aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponibles; el diseño está orientado a CPU y no requiere acelerador.
- Cabe en GPU consumer: sí, por tamaño de pesos; no confirmado por el autor.
- Opciones de despliegue: el repositorio incluye `decider.py` y requiere `torch`, `transformers` y `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo).
- Latencia y throughput: ~70 ms por decisión en CPU de portátil; procesamiento por lotes disponible vía `decide_many`, sin cifras de throughput publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nativ v2 | 364M | 1.024 tokens | Clasificación/decisión en hebreo, probabilidad calibrada | CC BY 4.0 | Hugging Face |
| OpenAI Decisions | no disponible | no disponible | API de decisión, multimodalidad no especificada | propietaria | API de OpenAI |
| Laya multilingual | no disponible | no disponible | Modelo multilingüe con licencia comercial | licencia comercial abierta (según el autor) | no disponible en la información |
| Laya-Hebrew | no disponible | no disponible | Modelo para hebreo | no disponible | no disponible en la información |
| DeepSeek V4 Flash | no disponible | no disponible | Modelo generativo de propósito general | no disponible | no disponible en la información |

En precisión media sobre las 9 pruebas, Nativ v2 supera a OpenAI Decisions en 6, empata en 1 (SIB-200) y pierde en 2 (petición vs política y Belebele). Frente a Laya multilingual gana en las 9; frente a Laya-Hebrew gana en 6 y pierde en 3 (HebrewSentiment, información personal en calibración y Belebele en calibración). No se dispone de datos de parámetros ni contexto de los competidores en la información proporcionada.

## Limitaciones y advertencias

- Modelo monolingüe: solo hebreo; no debe esperarse comportamiento correcto en otros idiomas.
- Ventana de entrada de 1.024 tokens: los estados largos se truncan, lo que puede eliminar información relevante en documentos extensos.
- No es generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- Rendimiento inferior al estado del arte en comprensión lectora (Belebele 0,588 frente a 0,910 de OpenAI Decisions) y en sentimiento con tres clases (0,656 frente a 0,830 de Laya-Hebrew).
- Calibración desigual: aunque buena en MASSIVE (0,011) y OnlpLab (0,009), empeora en Belebele (0,133) y HebrewSentiment (0,105), por lo que los umbrales de confianza deben validarse por tarea antes de usarse en producción.
- Riesgo de sesgo y alucinación: al ser un clasificador, el riesgo se manifiesta como asignación errónea de probabilidad alta a opciones incorrectas; no se documentan análisis de sesgo demográfico o cultural.
- Solapamiento entre entrenamiento y evaluación: el autor declara haber entrenado con particiones de train de MASSIVE, HeQ, OnlpLab y SIB-200 y con MultiNLI (origen de HebNLI), excluyendo validación y test, pero las cifras en esos conjuntos deben interpretarse con cautela por la cercanía de dominio.
- Las pruebas de nativ-bench fueron creadas por el mismo autor del modelo; no son un benchmark independiente.
- Licencia CC BY 4.0: permite uso comercial con atribución; conviene revisar los términos de los datasets de entrenamiento (MASSIVE, MultiNLI, BoolQ, banking77, clinc_oos, go_emotions, cosmos_qa, sib200) para obligaciones adicionales.
- El repositorio tiene un volumen de descargas bajo (38) y pocos likes (3); no hay evidencia de adopción amplia ni auditoría externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoavipo/nativ-he-decision
- Modelo base: https://huggingface.co/dicta-il/neodictabert
- Dataset de benchmark: https://huggingface.co/datasets/yoavipo/nativ-bench
- Dataset de entrenamiento: https://huggingface.co/datasets/yoavipo/hebrew-intent-emotion
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Dataset Cosmos QA: https://huggingface.co/datasets/allenai/cosmos_qa
- Dataset CLINC OOS: https://huggingface.co/datasets/clinc/clinc_oos
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset BoolQ: https://huggingface.co/datasets/google/boolq
- Dataset SIB-200: https://huggingface.co/datasets/Davlan/sib200
