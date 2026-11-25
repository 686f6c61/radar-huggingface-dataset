# tattrongvu/Jeffan-26B-A4B-2511

## Resumen
Jeffan-26B-A4B-2511 es un modelo de investigación derivado de google/gemma-4-26B-A4B-it, desarrollado por el usuario tattrongvu, especializado en responder preguntas de decisión estructuradas con opciones múltiples. En lugar de generar texto, el modelo recibe un estado (documento, conversación, lista de herramientas) junto con una pregunta y varias opciones codificadas (A, B, C...), y devuelve una distribución de probabilidad sobre los códigos de opción en un único forward pass. Esto lo convierte en un clasificador de decisión puro, no en un generador.

El modelo conserva la arquitectura Mixture-of-Experts (MoE) del base: 25,81 mil millones de parámetros totales, 30 capas con MLP denso más 128 expertos enrutados (8 activos por token), lo que resulta en unos 4 mil millones de parámetros activos por token. Incluye la torre de visión del modelo base, aunque no se utiliza. Soporta prompts de hasta 98.304 tokens con el motor de inferencia proporcionado.

Es relevante porque ofrece una alternativa de bajo coste computacional (4B activos frente a los 31B densos de sus predecesores) para tareas de enrutamiento, clasificación y toma de decisiones automatizada, con latencias muy bajas (15 ms de mediana en una NVIDIA B200) y licencia Apache 2.0. No obstante, su rendimiento en el índice público Jev Decision Index 0.3 es inferior al de sus versiones anteriores (67,02 frente a 73,12 y 73,42), lo que refleja el compromiso entre eficiencia y precisión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts (MoE); 30 capas, cada una con MLP denso y 128 expertos enrutados (8 activos por token); torre de visión incluida pero no utilizada |
| Parámetros totales | 25.805.933.872 (25,81B) |
| Parámetros activos | ~4B por token |
| Longitud de contexto | Hasta 98.304 tokens (con el motor de inferencia proporcionado) |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento
El modelo se basa en google/gemma-4-26B-A4B-it, un transformer causal con arquitectura MoE: 30 capas, cada una con un MLP denso y 128 expertos enrutados de los cuales 8 se activan por token. Esto da lugar a aproximadamente 4B parámetros activos por token sobre un total de 25,81B. La atención es causal estándar, sin código personalizado, y el modelo conserva el tokenizador, la plantilla de chat y la arquitectura del base, por lo que se carga con `AutoModelForCausalLM`. Incluye una torre de visión heredada del base que no se utiliza en esta ficha.

No se dispone de información sobre el proceso de entrenamiento específico del fine-tuning: no se detalla el número de tokens, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La model card indica únicamente que se trata de un modelo de investigación afinado sobre el base para responder preguntas de decisión estructuradas, con un formato de prompt fijo (system line, `State:`, `Question:`, `Options:` con códigos A, B, ...) y lectura de la distribución next-token sobre los códigos de opción. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades
- Clasificación de decisión con opciones múltiples: devuelve una probabilidad por cada opción (hasta 26, codificadas A-Z) en un único forward pass, sin generar texto.
- Procesamiento de estados heterogéneos: acepta texto o cualquier objeto serializable en JSON (documentos, conversaciones, listas de herramientas) como entrada.
- Enrutamiento y selección: adecuado para elegir la mejor opción entre un conjunto cerrado (equipos, herramientas, acciones, categorías).
- Soporte de contexto largo: hasta 98.304 tokens con el motor de inferencia, lo que permite incluir estados extensos sin truncamiento.
- Capacidades multilingües: no disponibles (no se documentan idiomas soportados).
- No soporta generación de texto, tool calling generativo, agentes multi-step ni modos de razonamiento explícito (thinking mode); su salida es únicamente una distribución de probabilidad sobre códigos de opción.
- La torre de visión está presente en los pesos pero no se utiliza en esta ficha.

## Casos de uso
- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta con opciones (Billing, Shipping damage claims, Technical support), devolviendo la probabilidad de cada equipo; su contexto de 98K tokens permite incluir historiales completos de conversación.
- Selección de herramientas en pipelines de agentes: dado un estado con la tarea y una lista de herramientas disponibles, el modelo asigna probabilidad a cada herramienta, actuando como clasificador de decisión en un solo paso y con latencia de milisegundos.
- Clasificación de documentos y correos: para decidir la categoría, prioridad o departamento de un documento, usando el estado como el texto completo y las opciones como las etiquetas posibles.
- Toma de decisiones en sistemas de recomendación: elegir entre un conjunto cerrado de acciones o productos a partir de un perfil de usuario y un contexto, aprovechando la distribución de probabilidad para rankear opciones.
- Moderación y triaje de contenido: clasificar un mensaje o publicación en categorías de riesgo o acción (aprobar, revisar, rechazar) con una única pasada y sin generación de texto.
- Evaluación de opciones en entornos de simulación o juegos: seleccionar la mejor acción entre un conjunto discreto a partir de una descripción del estado, con latencia baja (15 ms de mediana en B200) adecuada para bucles de decisión.
- Análisis de conversaciones multi-turno: decidir el siguiente paso en un diálogo (responder, escalar, cerrar) usando el historial completo como estado gracias al contexto de 98K tokens.

## Benchmarks y rendimiento
Los únicos datos publicados corresponden al Jev Decision Index 0.3 (suite pública completa):

| Modelo | Puntuación Jev Decision Index 0.3 | Latencia mediana (B200) |
|---|---|---|
| Jeffan-31b-1710 | 73,12 | 43 ms |
| Jeffan-27B-1211 | 73,42 | no disponible |
| Jeffan-26B-A4B-2511 | 67,02 | 15 ms |

El modelo se sitúa 6,1 puntos por debajo de Jeffan-31b-1710 y 6,4 por debajo de Jeffan-27B-1211, con una latencia mediana de 15 ms frente a 43 ms del primero en la misma GPU y motor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 51,6 GB para los pesos (tamaño del repo), más overhead de activaciones y caché KV; se recomienda GPU con al menos 80 GB para contexto largo.
- GPU recomendadas: NVIDIA B200 (verificada por el autor), A100 80GB, H100 80GB; para contextos de 98K tokens se necesita memoria suficiente para la caché KV.
- No cabe en GPU de consumo (RTX 4090 24GB, RTX 3090 24GB) en bf16 sin cuantización; no se documentan cuantizaciones alternativas.
- Opciones de despliegue: transformers (verificado con transformers 5.20.0), vLLM 0.29.0 con el motor Decision Index (`dm_decision_engine:DecisionEngine`) y el kit decision-index (commit f8552a1). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: mediana de 15 ms por pregunta en una NVIDIA B200 con vLLM 0.29.0 en bf16, con `max_len=98304` y `max_batched_tokens=4096`; no se documentan más métricas de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index 0.3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeffan-26B-A4B-2511 | 25,81B totales / ~4B activos (MoE) | 98.304 tokens | 67,02 | Apache 2.0 | Hugging Face |
| Jeffan-31b-1710 | 31B densos | no disponible | 73,12 | no disponible | Hugging Face |
| Jeffan-27B-1211 | 27B densos | no disponible | 73,42 | no disponible | Hugging Face |
| google/gemma-4-26B-A4B-it (base) | 25,81B totales / ~4B activos (MoE) | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a los modelos de la misma familia Jeffan y al base, ya que no se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias
- El modelo no genera texto: solo devuelve probabilidades sobre códigos de opción; no es adecuado para tareas generativas, tool calling generativo ni agentes multi-step.
- El formato de prompt es fijo (system line, `State:`, `Question:`, `Options:` con códigos A-Z); resultados con otros formatos pueden diferir.
- Rendimiento inferior a las versiones densas anteriores de la familia (67,02 frente a 73,12 y 73,42 en el Jev Decision Index 0.3), lo que supone un compromiso por la eficiencia de los 4B activos.
- No se documentan idiomas soportados ni sesgos conocidos; se desconoce el comportamiento en idiomas distintos del inglés y en dominios fuera de la suite evaluada.
- Riesgo de alucinación no aplica de forma directa al no generar texto, pero la distribución de probabilidad puede ser poco fiable en estados ambiguos o fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se presenta como modelo de investigación y no se documentan garantías de producción.
- El modelo solo se ha medido en una NVIDIA B200; no se documentan latencias en otras GPU.
- La torre de visión está incluida pero no se utiliza; no se debe asumir capacidad multimodal en esta ficha.
- Solo se ha verificado con transformers 5.20.0 y vLLM 0.29.0; otras versiones pueden no ser compatibles.

## Enlaces
- Hugging Face: https://huggingface.co/tattrongvu/Jeffan-26B-A4B-2511
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Modelo anterior Jeffan-31b-1710: https://huggingface.co/tattrongvu/Jeffan-31b-1710
- Modelo anterior Jeffan-31b-1511: https://huggingface.co/tattrongvu/Jeffan-31b-1511
- Kit Decision Index: https://github.com/apolinario/decision-index
- Código de inferencia: https://huggingface.co/tattrongvu/Jeffan-26B-A4B-2511/tree/main/inference
