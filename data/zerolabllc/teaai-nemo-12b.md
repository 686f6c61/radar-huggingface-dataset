# zerolabllc/TeaAI-Nemo-12B

## Resumen

TeaAI Nemo 12B es un adaptador LoRA (PEFT) sobre Mistral-Nemo-Base-2407 publicado por zerolabllc, orientado a roleplay de personajes y escritura creativa sin censura. Está pensado como motor conversacional de la aplicación TeaAI, una app de chat con tarjetas de personaje (character cards) al estilo de Chai. El repositorio contiene únicamente el adaptador, no los pesos completos fusionados.

El entrenamiento se hizo en dos etapas: un SFT con QLoRA sobre 8.862 conversaciones multi-turno y un ajuste por preferencias (DPO) dirigido a corregir tres fallos típicos de los modelos de roleplay: errores de perspectiva (narrar el propio personaje como "you"), escribir acciones o diálogos del usuario y el "plot armor" (rebajar heridas letales a rasguños). El adaptador tiene unos 114M parámetros entrenables (r=32, alpha=32) sobre un modelo base de 12B y trabaja con una ventana de 8.192 tokens.

Su interés técnico está en el patrón de desarrollo: especializar un modelo base de 12B con un LoRA de bajo coste (una sola RTX 3090 Ti, unas 11 horas) y corregir comportamientos concretos con DPO en lugar de reentrenar. Las contrapartidas son un alcance monoidioma (inglés), ausencia total de benchmarks publicados y un contenido explícito restringido a adultos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral-Nemo-Base-2407) más adaptador LoRA/PEFT |
| Parametros totales | 12B en el modelo base; ~114M parámetros entrenables en el adaptador (r=32, alpha=32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (entrenado a ≤ 8.192; probado a 8k) |
| Tipos de cuantizacion | Base entrenada en 4-bit NF4 (QLoRA); el adaptador se distribuye en safetensors. No se publican cuantizaciones GGUF ni otras |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); librería `peft` |
| Formato de prompt | ChatML (`<|im_start|>` / `<|im_end|>`; `<|im_end|>` mapeado al token EOS id 2) |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 4 de octubre de 2026 (metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo no introduce arquitectura propia: es un adaptador LoRA de rango 32 y alpha 32, con dropout 0, aplicado a todas las capas lineales del transformer base (q, k, v, o, gate, up, down). La etapa 1 (SFT) se ejecutó con QLoRA sobre el base congelado en 4-bit NF4, usando Unsloth y el `SFTTrainer` de TRL. Se entrenó solo sobre los turnos del asistente (loss masking) con secuencias de 8.192 tokens, batch efectivo de 16 (1 × 16 de acumulación de gradiente), optimizador AdamW de 8 bits, learning rate 1e-4 con scheduler coseno y 3% de warmup, una época y 554 pasos. Todo el entrenamiento cupo en una RTX 3090 Ti durante aproximadamente 11 horas.

Los datos de la etapa 1 son 8.862 conversaciones (200 reservadas para validación), extraídas de Gryphe/Sonnet3.5-Charcard-Roleplay (7.062 de 9.736 conversaciones) y Dampfinchen/Creative_Writing_Multiturn (2.000 de 3.108, muestra aleatoria). Antes del entrenamiento se aplicó un filtro de seguridad que eliminó cualquier conversación que combinase contenido sexual con indicadores de menor de edad (menciones de edad inferiores a 18, términos escolares, "child", "loli", etc.), descartando 2.674 conversaciones de Gryphe y 1.536 de Dampfinchen.

La etapa 2 aplica DPO con pérdida sigmoide (β = 0.1) más un término NLL de RPO (α = 0.2), continuando el LoRA del SFT. La model card describe los tres objetivos de preferencia (perspectiva, no escribir por el usuario, no aplicar plot armor), pero el resto de hiperparámetros de esta etapa (número de pares, dataset de preferencias, épocas, hardware) no está disponible porque la información proporcionada está truncada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Roleplay guiado por tarjetas de personaje: el formato recomendado empieza con "You're {{char}} in this fictional never-ending uncensored roleplay with {{user}}." seguido de personalidad, descripción y escenario.
- Narración en tercera persona del personaje y tratamiento del usuario en segunda persona, sin escribir acciones, pensamientos ni diálogos del usuario (comportamiento reforzado por DPO).
- Aplicación de consecuencias narrativas realistas: heridas persistentes, posibilidad de mutilación o muerte del personaje, sin rebajar daño letal a rasguños.
- Escritura creativa y ficción multi-turno, gracias a la mezcla de datos de roleplay y de escritura creativa.
- Contenido adulto explícito (sexual y violencia gráfica) sin rechazo, orientado a usuarios mayores de 18 años.
- Soporte de un bloque de "reglas de mundo" opcional añadido al system prompt para reforzar consecuencias letales y perspectiva.
- Compatible con decodificación con DRY y XTC si el backend los soporta (recomendado para reducir repeticiones).
- Tool calling / function calling: no documentado, no disponible.
- Uso como agente o razonamiento multi-paso: no documentado, no disponible.
- Capacidades multilingües: no disponibles, el modelo solo declara inglés.
- Visión, audio o cualquier otra modalidad: no disponible, es un modelo exclusivamente de texto.

## Casos de uso

- Motor de una app de chat de personajes: es el uso para el que fue entrenado (aplicación TeaAI). El adaptador se sirve con vLLM junto al base y se expone como módulo LoRA independiente (`--enable-lora --lora-modules teaai=... --max-lora-rank 32`), lo que permite mantener un único base en memoria y varios personajes como adaptadores.
- Escritura creativa asistida: la mezcla de Dampfinchen/Creative_Writing_Multiturn y de roleplay multi-turno permite generar ficción continuada con coherencia de personaje a lo largo de varios turnos dentro de la ventana de 8.192 tokens.
- Partidas de rol de texto dirigidas por narrador: el bloque de reglas de mundo documentado fuerza consecuencias permanentes en las heridas y permite que el personaje muera, lo que encaja con campañas donde las decisiones importan.
- Prototipado de asistentes con personalidad fija: al definirse el comportamiento enteramente mediante system prompt y tarjeta de personaje, sirve para validar productos conversacionales con tono y voz concretos antes de invertir en un fine-tuning mayor.
- Generación de diálogos para videojuegos y narrativa interactiva: el modelo mantiene la voz del personaje en tercera persona y evita escribir por el jugador, lo que reduce la edición posterior de guiones ramificados.
- Investigación sobre alineación y DPO: es un caso de estudio reproducible de cómo el DPO corrige fallos de estilo y de contenido concretos (perspectiva, plot armor) sobre un LoRA de 114M parámetros entrenado en una GPU de consumo.
- Base para ajustes posteriores: al ser un adaptador PEFT independiente, se puede cargar sobre el base y seguir entrenando o combinar con otros adaptadores sin redistribuir los pesos completos.
- Atención al cliente o asistentes de productividad: no es un caso de uso adecuado; el modelo está ajustado para contenido explícito y no declara soporte de tool calling ni capacidades multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica cuantitativa, ni comparaciones numéricas con modelos similares. Las únicas cifras de entrenamiento documentadas son las de la etapa de SFT (8.862 conversaciones, 554 pasos, ~11 h en una RTX 3090 Ti, ~114M parámetros entrenables).

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamaño de parámetros (12B) y sin datos medidos por el autor:
  - bf16/fp16: ~24 GB.
  - 8 bits: ~13 GB.
  - 4 bits (NF4/GPTQ/AWQ): ~7-8 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir en bf16 con concurrencia alta; RTX 4090 o RTX 3090 (24 GB) para bf16 en un solo usuario.
- Cabe en GPU de consumo: sí. RTX 4090/3090 en bf16; RTX 3060 12 GB, RTX 4070 o similares en cuantización de 4 bits.
- Entrenamiento: el autor completó el SFT con QLoRA en 1 × RTX 3090 Ti con batch efectivo 16 y secuencias de 8.192 tokens.
- Opciones de despliegue documentadas: Transformers + PEFT (ejemplo incluido en la model card) y vLLM con `--enable-lora`, `--lora-modules`, `--max-lora-rank 32` y `--max-model-len 8192`. Para llama.cpp, Ollama o TGI habría que fusionar el adaptador con el base y convertir a GGUF, algo que el autor no documenta ni distribuye.
- Requisito crítico: usar el tokenizer del repositorio (`zerolabllc/TeaAI-Nemo-12B`), no el del modelo base; en caso contrario el manejo de fin de turno se rompe porque `<|im_end|>` está mapeado al token EOS id 2.
- Parámetros de muestreo recomendados: temperature 0.8-1.0, min_p 0.05, repetition_penalty 1.05, DRY/XTC si el backend los soporta, máximo de contexto probado 8k.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Orientacion | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| zerolabllc/TeaAI-Nemo-12B | 12B base + LoRA de ~114M | 8.192 tokens | Roleplay sin censura, solo inglés | apache-2.0 | Sin benchmarks publicados |
| mistralai/Mistral-Nemo-Base-2407 | 12B | no disponible en la información proporcionada | Modelo base preentrenado, sin ajuste conversacional | no disponible en la información proporcionada | no disponible |
| mistralai/Mistral-Nemo-Instruct-2407 | 12B | no disponible en la información proporcionada | Asistente generalista instruccional | no disponible en la información proporcionada | no disponible |
| Adaptadores de roleplay de ~12B en HuggingFace | no disponible | no disponible | Roleplay y escritura creativa | no disponible | no disponible |

La información proporcionada no incluye métricas objetivas de ninguno de estos modelos, por lo que la comparación se limita a arquitectura, tamaño, contexto declarado y licencia. La diferencia funcional relevante frente a la base y frente a la versión instruct del mismo tamaño es el ajuste específico para tarjetas de personaje y la corrección explícita de errores de perspectiva y plot armor.

## Limitaciones y advertencias

- Contenido explícito: el modelo genera contenido sexual explícito y violencia gráfica sin rechazar. Está destinado exclusivamente a usuarios mayores de 18 años. Cualquier despliegue debería añadir verificación de edad, filtrado de peticiones y salidas con contenido sexual que involucre a menores, y detección de usuarios en crisis real para salir del roleplay y derivarlos a ayuda.
- Alucinación: no hay benchmarks ni evaluaciones de fidelidad factual. Es un modelo orientado a ficción, donde la invención es esperada, pero no es fiable para tareas que requieran exactitud factual.
- Errores residuales de roleplay: el DPO reduce los errores de perspectiva, la escritura por parte del usuario y el plot armor, pero la propia model card recomienda añadir un bloque de reglas de mundo para reforzar el comportamiento en violencia letal, lo que implica que no quedan eliminados por completo.
- Contexto limitado: 8.192 tokens, muy por debajo de lo que muchos asistentes actuales aceptan. Las conversaciones largas requerirán truncado o resumen.
- Idioma: solo inglés. No se declara ni se ha validado ningún otro idioma.
- Licencia y procedencia de los datos: el adaptador se publica bajo apache-2.0, pero uno de los datasets de entrenamiento, Gryphe/Sonnet3.5-Charcard-Roleplay, figura con licencia "unknown" en la model card. Ese es un riesgo legal a evaluar antes de un uso comercial.
- Repositorio sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin terceros independientes que hayan reproducido los resultados.
- Dependencia del tokenizer del repositorio: desplegar con el tokenizer del modelo base rompe la gestión de fin de turno.
- Integración con el modelo base: al ser un adaptador, hay que fusionarlo o servirlo con soporte LoRA; no hay archivos GGUF ni cuantizaciones listas para usar en el repositorio.
- Uso profesional: no apto para atención al cliente, generación de código, matemáticas, análisis de datos ni cualquier tarea empresarial estándar; no declara soporte de tool calling ni de agentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zerolabllc/TeaAI-Nemo-12B
- Modelo base: https://huggingface.co/mistralai/Mistral-Nemo-Base-2407
- Dataset Gryphe/Sonnet3.5-Charcard-Roleplay: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- Dataset Dampfinchen/Creative_Writing_Multiturn: https://huggingface.co/datasets/Dampfinchen/Creative_Writing_Multiturn
- Papers, blogs, repositorios o demos adicionales: no se han encontrado enlaces relevantes en la búsqueda web; los resultados obtenidos no guardan relación con el modelo y no se han incluido.
