# trevdatastreams/typed-decider-qwen3.5-4b

## Resumen

typed-decider-qwen3.5-4b es un modelo de decisión de un solo pase construido sobre Qwen3.5-4B mediante un adaptador LoRA (rank 8, alpha 16) y una cabeza de decisión específica. Lo desarrolla el usuario trevdatastreams y se publica como versión de investigación (v0.1). El modelo recibe un estado textual, una pregunta y una lista de opciones, y devuelve en una única pasada forward una estimación de probabilidad calibrada para cada opción, sin generar tokens. Resuelve tres tipos de pregunta: elección entre opciones (hasta 400), sí/no y valoración ordinal con puntuación esperada.

Frente a un LLM generativo convencional, evita la latencia y la variabilidad de la decodificación autoregresiva: cada opción se codifica en su propia rama de un pase empaquetado y se puntúa con una cabeza de set-attention. El diseño busca ser invariante al orden y a los identificadores de las opciones, y permite empaquetar muchas preguntas en la misma pasada. Está pensado para clasificación, enrutamiento de intención y decisiones con probabilidad calibrada, no para conocimiento general.

La relevancia actual está en el nicho de modelos de decisión ligeros y deterministas para pipelines de producción, donde se necesita una probabilidad por opción en lugar de texto libre. No obstante, el propio autor advierte que es más débil que su modelo base en conocimiento general y sentido común, y que los resultados de benchmarks deben leerse como descriptivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B) con adaptador LoRA y cabeza de decisión de set-attention (dos bloques, anchura 512) |
| Parametros totales | 4B en el modelo base; adaptador LoRA de 36 MB y cabeza de 74 MB (no se indica el recuento exacto de parámetros del adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor menciona un "envelope" de límites de entrada sin cifras) |
| Tipos de cuantizacion | BF16 (configuración evaluada), 8-bit en runtime, NF4 (base pre-cuantizada de 3,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT y cabeza); base cargada desde Qwen/Qwen3.5-4B en revisión fijada 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B como backbone congelado o parcialmente adaptado mediante un adaptador LoRA de rango 8 y alpha 16 aplicado a las proyecciones gate/up/down del MLP en las 32 capas. Sobre la representación del backbone se añade una cabeza de decisión compuesta por dos bloques de set-attention de anchura 512, que puntúan cada opción de forma independiente y producen una probabilidad por opción. Cada opción se codifica en su propia rama dentro de un pase empaquetado, lo que permite procesar muchas preguntas simultáneamente y mantener invariancia frente al orden y a los identificadores de las opciones.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO. El autor indica que el adaptador y la cabeza se entrenaron para tres tipos de tarea (elección, sí/no y valoración) y que el modelo está pensado para una pasada sin generación de tokens. La innovación técnica destacable es el empaquetado de preguntas y opciones en un único forward con puntuación por set-attention, además de la calibración explícita de probabilidades y la invariancia a orden e IDs, con tolerancias numéricas y efectos de cuantización sobre las salidas exactas.

## Capacidades

- Clasificación y elección entre opciones: selección de una opción entre hasta 400 candidatas con probabilidad por opción.
- Preguntas de sí/no con probabilidad calibrada (p_yes).
- Valoración ordinal con puntuación esperada sobre niveles ordenados.
- Procesamiento empaquetado de múltiples preguntas en una sola pasada.
- Invariancia al orden y a los identificadores de las opciones.
- Enrutamiento de intención y decisiones de triage con probabilidad calibrada.
- No genera tokens: salida determinista en forma de probabilidades.
- Soporte de tool calling / function calling: no disponible como capacidad nativa; los benchmarks de BFCL miden selección de herramienta como tarea de decisión.
- Capacidades multilingües: no disponibles como dato explícito; hay una suite de intención multilingüe en la evaluación.
- Capacidades especiales: modo de decisión de un solo pase, sin modo thinking.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y una lista de colas (facturación, soporte técnico, envío), el modelo devuelve la probabilidad de cada cola en una pasada, lo que permite asignar con umbral de confianza y derivar casos ambiguos a revisión humana.
- Clasificación de intención en asistentes conversacionales: con opciones de intención predefinidas, se obtiene una distribución de probabilidad por intención útil para desambiguar y para activar el flujo adecuado sin generar texto.
- Moderación de contenido: preguntas de sí/no sobre toxicidad o incumplimiento de políticas, con probabilidad calibrada que permite fijar umbrales ajustables según la política de la plataforma.
- Guardrails y filtros de seguridad: evaluación de si una petición cumple o no una regla, usando la probabilidad como señal para bloquear o escalar.
- Análisis de sentimiento y valoraciones ordinales: puntuación esperada sobre niveles (negativo, neutro, positivo) para agregar opiniones de clientes en dashboards.
- Selección de herramienta en agentes: dado el estado y un catálogo de herramientas, elegir la más probable como tarea de decisión, útil para pipelines de agentes con tool calling.
- Triage en atención al cliente: clasificación de urgencia o categoría con probabilidad por opción, integrable en sistemas de colas y SLA.
- Evaluación de NLI y coherencia: decisión entre implicación, neutralidad y contradicción para filtrado de respuestas y control de calidad.

## Benchmarks y rendimiento

Resultados en configuración BF16, sin razonamiento, en una sola pasada. "Default Qwen" es Qwen3.5-4B sin modificar puntuado por probabilidades del siguiente token.

| Modelo | Sysone (1.240 decisiones) | JevBench público (231) |
|---|---|---|
| typed-decider (este) | 83,8 % | 72,3 % |
| Default Qwen3.5-4B | 76,0 % | 77,1 % |
| Bev 0.4B (ejecución local) | 70,9 % | 62,3 % |
| Jev 1.13 (publicado) | 90,6 % | 86,6 % |

Sysone por suite (exactitud):

| Suite | n | Este modelo | Jev 1.13 | Default Qwen |
|---|---|---|---|---|
| Banking77 (12 intenciones) | 96 | 93,8 | 94,8 | 82,3 |
| Emotion | 192 | 84,9 | 84,4 | 79,2 |
| Triage | 192 | 93,8 | 93,2 | 85,9 |
| AG News | 160 | 95,0 | 98,8 | 95,6 |
| Intención multilingüe | 120 | 95,8 | 100 | 98,3 |
| NLI (MNLI) | 120 | 80,0 | 86,7 | 65,8 |
| Moderación | 144 | 84,7 | 94,4 | 68,1 |
| Guardrails | 96 | 83,3 | 100 | 41,7 |
| Ratings (SST-5) | 120 | 34,2 | 65,0 | 48,3 |

En JevBench, los niveles fácil y original igualan a Default Qwen (100 % y 91,7 %); el nivel difícil es inferior (47,7 % frente a 57,7 %).

Comparación amplia con Default Qwen (30 catálogos públicos convertidos a preguntas de decisión; mejor en 17 y peor en 13). Filas seleccionadas:

| Dataset | Métrica | Este modelo | Default Qwen |
|---|---|---|---|
| BANKING77 | macro-F1 | 80,2 | 60,0 |
| CLINC150+OOS | macro-F1 | 91,1 | 72,4 |
| When2Call (MCQ) | exactitud | 66,3 | 45,4 |
| Amazon ESCI | macro-F1 | 41,5 | 29,9 |
| MMLU | exactitud | 63,0 | 69,4 |
| HellaSwag | exactitud | 71,8 | 81,8 |
| BFCL selección de herramienta | exacto | 67,6 | 79,3 |
| API-Bank | — | no soportado (las entradas exceden el envelope) | 59,7 |

Variantes cuantizadas verificadas (RTX 3090, paneles de desarrollo de 857 + 1.179 + 171 preguntas y 256 Civil Comments balanceadas):

| Variante | Memoria GPU (pico) | Latencia mediana, 1 pregunta | Exactitud elección / sí-no / valoración | Misma respuesta top que BF16 | AUROC Civil |
|---|---|---|---|---|---|
| BF16 (evaluada) | 8,95 GB | 0,168 s | 91,3 / 95,0 / 82,5 | — | no disponible en la información disponible |

## Requisitos de hardware

- VRAM estimada: BF16 con pico de 8,95 GB; variante 4-bit aproximadamente 4,2 GB de memoria GPU; base NF4 pre-cuantizada de 3,1 GB de descarga.
- GPU recomendadas: RTX 3090 verificada por los autores; cualquier GPU con al menos ~9 GB para BF16 y ~5 GB para 4-bit.
- Cabe en GPU de consumo: sí, en RTX 3090 y presumiblemente en GPUs con 8-12 GB para cuantización 4-bit; no se confirman otros modelos.
- Opciones de despliegue: paquete de inferencia `typed_decider` con backend CUDA y flash-linear-attention (`pip install -e ".[fla,quant]"`), backend `reference` en CPU (mucho más lento); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia mediana de 0,168 s por pregunta en BF16 en RTX 3090; el empaquetado de múltiples preguntas por pasada permite amortizar coste, sin cifras de throughput publicadas.
- Entorno verificado: Python 3.12, CUDA, torch 2.13, transformers 5.17, peft 0.20.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Sysone / JevBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| typed-decider-qwen3.5-4b | 4B base + LoRA y cabeza | no disponible | 83,8 % / 72,3 % | apache-2.0 | Hugging Face (repo propio + base Qwen) |
| Default Qwen3.5-4B | 4B | no disponible | 76,0 % / 77,1 % | según Qwen3.5-4B (no indicada) | Hugging Face (Qwen/Qwen3.5-4B) |
| Bev 0.4B | 0,4B | no disponible | 70,9 % / 62,3 % | no disponible | ejecución local citada por el autor |
| Jev 1.13 | no disponible | no disponible | 90,6 % / 86,6 % | no disponible | resultados publicados |

## Limitaciones y advertencias

- Versión de investigación (v0.1): el autor recomienda tratar los benchmarks como descriptivos y leer las advertencias.
- Más débil que su modelo base en conocimiento general y sentido común: MMLU 63,0 frente a 69,4 y HellaSwag 71,8 frente a 81,8.
- Rendimiento bajo en valoraciones ordinales: SST-5 con 34,2 % frente a 65,0 de Jev 1.13 y 48,3 de Default Qwen.
- Nivel difícil de JevBench inferior al modelo base (47,7 % frente a 57,7 %).
- Selección de herramienta (BFCL) por debajo del base (67,6 frente a 79,3); API-Bank no soportado por límites de entrada.
- Las tolerancias numéricas y la cuantización pueden alterar las salidas exactas; invariancia a orden e IDs sujeta a esas tolerancias.
- Existe un "envelope" de límites de entrada no cuantificado en la información disponible; entradas largas pueden quedar fuera.
- Idiomas soportados no disponibles; la suite multilingüe de evaluación no garantiza cobertura general.
- Sesgos conocidos no disponibles en la información proporcionada.
- Riesgo de alucinación no aplicable directamente al no generar texto, pero las probabilidades pueden ser erróneas en dominios fuera de distribución.
- Licencia apache-2.0 permite uso comercial, sujeta a las condiciones de la licencia del modelo base Qwen3.5-4B, que no se detallan.
- Requiere GPU CUDA para rendimiento práctico; el backend CPU de referencia es mucho más lento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trevdatastreams/typed-decider-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Base pre-cuantizada NF4: https://huggingface.co/trevdatastreams/typed-decider-qwen3.5-4b-base-nf4
- Resultados completos citados en el repo: `eval/RESULTS.txt` (incluido en el repositorio del modelo)
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
