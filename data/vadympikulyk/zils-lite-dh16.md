# VadymPikulyk/zils-lite-dh16

## Resumen

zils-lite-dh16 es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario VadymPikulyk en Hugging Face. Se presenta como un "soup body" (cuerpo de mezcla de pesos) para Zils, un modelo de decisión asociado a la subred 127 de Bittensor. El modelo combina los pesos de lenguaje y visión de una arquitectura d3-lite (denominada también z3-lite) con aproximadamente 853 millones de parámetros totales según los pesos en safetensors.

El modelo resuelve tareas de decisión tipificadas: elección entre opciones (choice), respuestas sí/no y puntuación (score) sobre ítems estructurados. No es un modelo conversacional generalista, sino un componente especializado que produce decisiones tipadas a partir de entradas de texto y, presumiblemente, visión, dado que el autor menciona "language and vision weights". Su relevancia radica en que forma parte de un ecosistema de modelos de decisión para la subred 127 de Bittensor, con licencia Apache-2.0 y un pipeline de entrenamiento documentado basado en mezclas de LoRAs y promediado uniforme de pesos.

La información disponible es escasa: cero descargas, cero likes, sin pipeline declarado, sin idiomas especificados y sin resultados de benchmarks publicados. El repositorio ocupa 1,7 GB y fue creado el 17 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (según tag de Hugging Face); diseño d3-lite / z3-lite con pesos de lenguaje y visión |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con código personalizado, tag custom_code) |

## Arquitectura y entrenamiento

El modelo se construye como una mezcla de pesos (model soup) en el diseño d3-lite. Parte del promedio uniforme de dos cuerpos d3-lite de 2026-11-17 (joamCriff123/zils-lite-l1116b y joamCriff123/zils-lite-l1116a, ambos Apache-2.0) y aplica dos cambios de pesos. El primero es el cambio de VadymPikulyk/zils-lite-dh13 sobre su soup de partida, descrito como 0,7 × un LoRA fusionado con receta d3 fijada, entrenado con objetivos suaves (0,5 × oro + 0,5 × respuesta del soup de partida), sobre unos 20.000 ítems de decisión tipados de splits TRAIN públicos (ARC, MMLU auxiliary train, OpenBookQA, QuaRTz, WinoGrande, COPA, GSM8K, CommonsenseQA, SciQ, MNLI, CoLA, MRPC, PAWS, SciTail, SMS Spam, BoolQ, QNLI, 20 Newsgroups, dair-ai/emotion, TweetEval irony, Rotten Tomatoes, SST-5, glaive-function-calling-v2, además de ítems aritméticos y de puntuación por rúbrica generados por reglas). El segundo es 0,7 × un LoRA fusionado (rango 64, lr 5e-5, una época, `python -m zils.teacher train`) entrenado sobre el soup de 2026-11-17 con unos 19.400 filas de decisión tipadas (choice, yes/no y score) construidas a partir de splits TRAIN de Social IQa, PIQA, MNLI, RTE, 20 Newsgroups, QNLI, CLINC150 (clinc_oos plus) y CMUdict, más ítems aritméticos, de cobertura de pasajes y de llamadas a herramientas generados por reglas, con objetivos 0,5 × etiqueta oro + 0,5 × respuesta propia del soup de partida.

El autor declara explícitamente que no se usaron ítems de examen de validadores, ni ítems de examen de semillas públicas, ni datos de clientes. La innovación técnica principal es el uso de objetivos suaves (soft targets) que combinan la etiqueta oro con la respuesta del propio modelo de partida, junto con la fusión de LoRAs y el promediado de pesos entre cuerpos del mismo diseño. No se detalla la composición exacta del dataset de preentrenamiento del Qwen3.5-0.8B subyacente ni si hubo RLHF o DPO en esta fase.

## Capacidades

- Generación de decisiones tipadas: elección entre opciones (choice), respuestas sí/no y puntuación (score) sobre ítems estructurados.
- Razonamiento sobre comprensión lectora y conocimiento general, derivado de los datasets de entrenamiento (ARC, MMLU, OpenBookQA, SciQ, CommonsenseQA).
- Razonamiento de sentido común (WinoGrande, COPA, Social IQa, PIQA).
- Aritmética básica y problemas matemáticos elementales (GSM8K, ítems aritméticos generados por reglas).
- Clasificación de texto: análisis de sentimiento (SST-5, Rotten Tomatoes, dair-ai/emotion), detección de ironía (TweetEval irony), filtrado de spam (SMS Spam).
- Inferencia de lenguaje natural y similitud semántica (MNLI, QNLI, RTE, MRPC, PAWS, SciTail, CoLA).
- Clasificación de intenciones (CLINC150 / clinc_oos plus).
- Soporte de llamadas a herramientas (tool calling / function calling), según el dataset glaive-function-calling-v2 y los ítems de tool-call generados por reglas.
- Capacidades de visión: el autor menciona "language and vision weights", aunque no se detallan las tareas de visión soportadas.
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el modelo puede clasificar entradas en categorías tipadas (choice, yes/no) para dirigir el flujo de un agente, aprovechando su entrenamiento específico en ítems de decisión estructurados.
- Moderación y clasificación de contenido: uso en tareas de detección de spam, ironía o sentimiento (SMS Spam, TweetEval irony, SST-5, dair-ai/emotion) para filtrar o etiquetar textos en producción.
- Clasificación de intenciones en asistentes conversacionales: el entrenamiento con CLINC150 permite asignar intenciones a consultas de usuario en sistemas de atención al cliente o asistentes de voz.
- Evaluación automática por rúbrica: los ítems de puntuación por rúbrica generados por reglas permiten usar el modelo para asignar puntuaciones a respuestas abiertas en entornos educativos o de evaluación de calidad.
- Verificación de coherencia y entailment: uso en tareas de NLI (MNLI, QNLI, RTE) para comprobar si una afirmación se deduce de un pasaje, útil en sistemas de preguntas y respuestas y en validación de hechos.
- Soporte a llamadas de herramientas en agentes: el entrenamiento con glaive-function-calling-v2 y ítems de tool-call permite al modelo decidir cuándo invocar una función y con qué argumentos en un flujo de automatización.
- Selección de respuestas en sistemas de razonamiento: el modelo puede puntuar o elegir entre candidatos generados por otro modelo mayor, actuando como verificador o reranker en un pipeline de dos etapas.
- Participación en la subred 127 de Bittensor: el modelo está diseñado como cuerpo de decisión para validadores y mineros de dicha subred, donde se evalúa su rendimiento en tareas de decisión tipadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros, en precisión FP16 se requieren aproximadamente 1,7 GB solo para los pesos; en FP32, unos 3,4 GB; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, unos 0,5 GB. Estas cifras no incluyen memoria para el contexto ni para el código personalizado (custom_code) asociado al modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, GTX 1660 Super, RTX 2060). Para mayor throughput, se recomiendan GPUs con más memoria como RTX 4090, A100 o H100, aunque el tamaño del modelo no las exige.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs de consumo modernas con 4 GB o más de VRAM, especialmente en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: al tratarse de un modelo con código personalizado (tag custom_code) y arquitectura qwen3_5, es probable que requiera `trust_remote_code=True` en Transformers. No se dispone de información sobre compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado el formato safetensors y la arquitectura personalizada, la conversión a GGUF podría no estar disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-dh16 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face | Modelo de decisión tipada, diseño d3-lite, código personalizado |
| Qwen/Qwen3.5-0.8B | no disponible (modelo base ~0,8B) | no disponible | no disponible | Hugging Face | Modelo base del que deriva; capacidades generalistas |
| joamCriff123/zils-lite-l1116a | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo d3-lite de partida (promedio uniforme) |
| joamCriff123/zils-lite-l1116b | no disponible | no disponible | Apache-2.0 | Hugging Face | Cuerpo d3-lite de partida (promedio uniforme) |
| VadymPikulyk/zils-lite-dh13 | no disponible | no disponible | no disponible | Hugging Face | Versión previa del mismo autor, usada como cambio de pesos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo; el entrenamiento con datasets públicos diversos (redes sociales, noticias, diálogo) puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: aunque el modelo está orientado a decisiones tipadas, no se descarta la generación de respuestas incorrectas o inconsistentes en ítems fuera de la distribución de entrenamiento.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto soportada ni los idiomas cubiertos; el entrenamiento parece centrado en inglés, dado el conjunto de datasets utilizados.
- Restricciones de licencia: la licencia es Apache-2.0, lo que permite uso comercial, pero el autor pide citar los datasets originales y remite a los archivos LICENSE y NOTICE del repositorio.
- Caveats para producción: el modelo requiere código personalizado (`custom_code`), lo que puede complicar el despliegue en frameworks estándar; no hay información sobre cuantizaciones oficiales ni sobre compatibilidad con servidores de inferencia populares. El número de descargas y likes es cero, lo que indica ausencia de validación comunitaria.
- El modelo está diseñado específicamente para la subred 127 de Bittensor; su uso fuera de ese contexto puede no estar optimizado.
- No se han publicado resultados de benchmarks que permitan verificar su rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/VadymPikulyk/zils-lite-dh16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo de partida: https://huggingface.co/joamCriff123/zils-lite-l1116b
- Modelo de partida: https://huggingface.co/joamCriff123/zils-lite-l1116a
- Versión previa del autor: https://huggingface.co/VadymPikulyk/zils-lite-dh13
- Chasis d3-lite: https://huggingface.co/vllm-sr/d3-lite
