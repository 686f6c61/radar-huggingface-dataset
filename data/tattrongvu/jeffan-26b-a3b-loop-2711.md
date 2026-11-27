# tattrongvu/Jeffan-26B-A3B-Loop-2711

## Resumen

Jeffan-26B-A3B-Loop-2711 es un modelo de investigación derivado de thinkingmachines/Inkling-2-Mini, publicado por el usuario tattrongvu. No es un modelo generativo al uso: está especializado en responder preguntas de decisión estructuradas de tipo multiple-choice. Recibe un estado (un documento, una conversación, una lista de herramientas) y una o varias preguntas con opciones codificadas (A, B, C…), y devuelve una distribución de probabilidad sobre cada opción a partir de un único forward pass, sin generar texto.

El modelo conserva la arquitectura mixture-of-experts del base: 26.068 millones de parámetros totales, 24 capas con 128 expertos enrutados cada una (8 activos por token, unos 3.400 millones de parámetros activos). La innovación estructural es un núcleo con bucles: las capas 6 a 17 se ejecutan tres veces en cada forward pass, unidas por los mensajes con puerta (gated messages) del modelo base. Es la primera release sobre Inkling-2-Mini, tras Jeffan-26B-A4B-2511 sobre Gemma-4-26B-A4B-it.

Su relevancia es acotada pero concreta: cubre un nicho poco habitual, el de modelos que clasifican decisiones en lugar de redactar respuestas, lo que permite integrar un motor de decisión determinista en pipelines de agentes sin coste de generación. La licencia Apache 2.0 y la compatibilidad con transformers (sin código personalizado) facilitan su evaluación. En la suite pública completa del Jev Decision Index 0.3 obtiene 61,23.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Inkling2LoopForCausalLM (transformer MoE con núcleo en bucle; 24 capas, 128 expertos enrutados por capa) |
| Parametros totales | 26.068.156.416 (26,07B) |
| Parametros activos | ~3,4B por token (8 expertos activos de 128) |
| Longitud de contexto | la del modelo base Inkling-2-Mini (no se detalla cifra exacta; la suite pública usa prompts de hasta 16.384 tokens) |
| Tipos de cuantizacion | bf16 en este checkpoint; existe variante NVFP4 / MXFP8 (Jeffan-26B-A3B-Loop-2711-NVFP4) para vLLM |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16); repo de 52,2 GB |

## Arquitectura y entrenamiento

El modelo parte de thinkingmachines/Inkling-2-Mini, un transformer decoder-only de tipo mixture-of-experts con atención causal. Cada una de las 24 capas contiene 128 expertos enrutados, de los que se activan 8 por token, lo que da unos 3,4B de parámetros activos sobre 26,07B totales. La particularidad es el bucle: las capas 6 a 17 se ejecutan tres veces por forward pass, encadenadas mediante los mensajes con puerta del modelo base, de modo que el cómputo efectivo del núcleo se triplica sin aumentar el número de parámetros.

Los expertos enrutados conservan exactamente los valores del checkpoint base en formato NVFP4 / MXFP8, almacenados aquí en bf16. El modelo es solo texto: la torre de visión del base no está incluida. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO. La adaptación consiste en un ajuste fino sobre el base para la tarea de decisión multiple-choice, con un formato de prompt fijo (línea de sistema, `State:`, `Question:`, `Options:` con códigos A–Z y línea de cierre) dentro de la plantilla de chat de Inkling con esfuerzo de razonamiento 0.

## Capacidades

- Clasificación de decisiones: asigna una probabilidad a cada opción de una pregunta multiple-choice a partir de un estado dado, en un único forward pass.
- Sin generación de texto: la salida es la distribución del siguiente token sobre los códigos de opción, no una respuesta redactada.
- Soporte de hasta 26 opciones en el ejemplo de transformers (códigos A–Z); el renderizador de referencia admite hasta 255 opciones.
- Acepta estados en texto plano o cualquier objeto serializable a JSON.
- Manejo de preguntas con niveles ordenados (bajo…alto) mediante una línea adicional en el prompt.
- Contexto largo: la suite pública incluye prompts de hasta 16.384 tokens.
- Tool calling / function calling: no disponible como capacidad declarada.
- Agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo está pensado como componente de decisión dentro de un sistema mayor.
- Capacidades multilingües: no disponible.
- Modo thinking: se invoca con esfuerzo de razonamiento 0; no se documenta un modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y una lista de equipos (facturación, daños en envío, soporte técnico), el modelo devuelve la probabilidad de cada destino en un solo forward pass, lo que permite umbrales de confianza y derivación automática.
- Selección de herramientas en agentes: con un estado que incluya la conversación y el catálogo de herramientas disponibles, el modelo puntúa cada herramienta como opción y el orquestador elige la de mayor probabilidad sin coste de generación.
- Triaje de correos o formularios: clasificación de solicitudes entrantes en categorías predefinidas con puntuaciones calibradas, útil para priorizar colas.
- Evaluación de opciones en pipelines de decisión: para preguntas con niveles ordenados (riesgo bajo, medio, alto), el modelo produce una distribución sobre los niveles que puede alimentar reglas de negocio.
- Moderación o etiquetado con confianza: asignar una etiqueta entre varias y usar la probabilidad como medida de incertidumbre para marcar casos ambiguos para revisión humana.
- Investigación sobre modelos de decisión: al ser un modelo de investigación con licencia Apache 2.0, sirve para estudiar arquitecturas MoE con bucles y su comportamiento en tareas de clasificación estructurada.
- Clasificación de texto en general: el pipeline declarado es text-classification, por lo que puede emplearse en tareas de etiquetado con opciones fijas y contexto largo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Jev Decision Index 0.3 (suite pública completa) | 61,23 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar. La validación reportada por el autor indica que, sobre una NVIDIA B200 en bf16 con transformers 5.24.0, el ejemplo de código construye exactamente los tokens de prompt del renderizador de referencia en 560 de 560 preguntas de la suite pública (hasta 26 opciones, prompts de hasta 16.384 tokens) y elige la misma opción que las lecturas de referencia en 551 de 560, con una diferencia mediana de 0,0063 en la probabilidad superior.

## Requisitos de hardware

- VRAM estimada en bf16: el checkpoint ocupa 52,2 GB, por lo que la inferencia en bf16 requiere del orden de 55–60 GB de VRAM contando activaciones y caché KV.
- GPU recomendadas para bf16: NVIDIA B200 (verificada por el autor), A100 80 GB, H100 80 GB.
- Variante NVFP4 / MXFP8: Jeffan-26B-A3B-Loop-2711-NVFP4 reduce el peso de los expertos y es la única forma que vLLM acepta para esta arquitectura; permite reducir requisitos de memoria respecto a bf16.
- GPU de consumo: no disponible confirmación de que quepa en RTX 4090 (24 GB) en ninguna cuantización publicada; el tamaño del checkpoint en bf16 lo descarta.
- Despliegue: transformers ≥ 5.24.0 (sin código personalizado) y vLLM mediante la variante NVFP4, con los endpoints `/v1/systemone` y `/v1/decisions`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; al no generar texto, cada pregunta se resuelve en un único forward pass.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Jeffan-26B-A3B-Loop-2711 | 26,07B totales / ~3,4B activos | el del base Inkling-2-Mini | Decisión multiple-choice, MoE con bucle | Apache 2.0 |
| Jeffan-26B-A4B-2511 | 26B totales / ~4B activos | no disponible | Decisión multiple-choice sobre Gemma-4-26B-A4B-it | no disponible en la información |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | Modelo base generativo multimodal (incluye torre de visión) | Apache 2.0 |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. La comparación con modelos de decisión de otros autores no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo etiqueta explícitamente como research model; no hay evidencia de validación en producción.
- Solo texto: la torre de visión del base no está incluida, por lo que no procesa imágenes.
- Dependencia estricta del formato de prompt: los resultados con otros formatos pueden diferir; el modelo espera la plantilla de chat de Inkling con esfuerzo 0 y el abridor de respuesta de texto.
- No genera texto: no sirve para tareas generativas, de resumen ni de diálogo.
- Idiomas soportados no documentados; no se puede garantizar comportamiento multilingüe.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible; al tratarse de un ajuste fino sobre un base, puede heredar sesgos del modelo original.
- vLLM no acepta los expertos en bf16; es obligatorio usar la variante NVFP4 / MXFP8 para ese motor.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo de investigación conviene validar su comportamiento en el dominio concreto antes de desplegarlo.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tattrongvu/Jeffan-26B-A3B-Loop-2711
- Variante NVFP4 para vLLM: https://huggingface.co/tattrongvu/Jeffan-26B-A3B-Loop-2711-NVFP4
- Release anterior sobre Gemma-4-26B-A4B-it: https://huggingface.co/tattrongvu/Jeffan-26B-A4B-2511
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
