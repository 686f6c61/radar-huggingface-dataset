# TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_kd

## Resumen

Travel-granite4_tiny7b_to_micro3b_RCAEval_2_kd es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `models/granite-4.0-h-micro` de la familia IBM Granite 4.0. Lo publica el usuario TravelDistillation y está orientado a la generación de texto conversacional, presumiblemente en el dominio de evaluación de análisis de causa raíz (RCA, por las siglas del dataset de preferencias utilizado). No es un modelo completo, sino un conjunto de pesos PEFT que debe combinarse con el modelo base para su uso.

El adaptador se ha entrenado sobre el dataset `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, que contiene pares de preferencias generados a partir de dos variantes de Granite 4.0 (h-micro como modelo de referencia y h-tiny como modelo comparado). La técnica empleada es DPO con LoRA, con una tasa de aprendizaje de 5e-05, un batch efectivo de 8 (batch 1 con 8 pasos de acumulación de gradiente) y una única época sobre el scheduler coseno.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva (los campos de descripción, usos previstos y datos de evaluación están marcados como "More information needed") y sin resultados de benchmarks publicados. El repositorio ocupa 6,4 GB, un tamaño considerable para un adaptador LoRA, lo que sugiere que podría contener pesos fusionados o múltiples checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Granite 4.0 h-micro (arquitectura `granitemoehybrid`, según el tag del repositorio) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es granite-4.0-h-micro) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la información) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132) |
| Modelo base | models/granite-4.0-h-micro |
| Dataset de entrenamiento | data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny |
| Metodo de alineacion | DPO (Direct Preference Optimization) con LoRA |
| Tamano del repositorio | 6,4 GB |
| Fecha de publicacion | 2026-11-23 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `granite-4.0-h-micro`, un modelo de la familia IBM Granite 4.0. El tag `granitemoehybrid` del repositorio indica que el modelo base emplea una arquitectura híbrida con componentes de mezcla de expertos (MoE), aunque la información proporcionada no detalla la configuración exacta de expertos, el número de parámetros activos ni la composición de capas híbridas. El adaptador en sí es un LoRA de bajo rango entrenado con PEFT, por lo que no modifica la arquitectura subyacente, sino que añade matrices de baja dimensión en determinadas capas.

El entrenamiento se realizó con DPO sobre pares de preferencias generados a partir de las salidas de `granite-4.0-h-micro` y `granite-4.0-h-tiny`. Los hiperparámetros documentados son: learning rate 5e-05, batch size 1 con 8 pasos de acumulación (batch efectivo 8), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con 10 % de warmup, semilla 42 y una sola época. No se especifica el número de pasos de entrenamiento, el tamaño del dataset ni si hubo etapas previas de SFT. Tampoco se documentan innovaciones técnicas adicionales más allá del propio DPO sobre LoRA.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` sugiere uso en diálogo multi-turno.
- Alineación por preferencias: el entrenamiento DPO busca ajustar las respuestas hacia las preferencias recogidas en el dataset RCAEval_2, presumiblemente en el dominio de análisis de causa raíz.
- Herencia del modelo base: al ser un adaptador sobre Granite 4.0 h-micro, hereda las capacidades del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo), pero no se documenta ninguna de ellas explícitamente en la información disponible.
- Modo thinking, visión, audio: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado para este adaptador.

## Casos de uso

- Evaluación de análisis de causa raíz (RCA): el adaptador está entrenado sobre pares de preferencias del dataset RCAEval_2, por lo que su uso previsto es generar respuestas alineadas con las preferencias de ese dominio en tareas de diagnóstico de causas raíz. Se usaría cargando el modelo base `granite-4.0-h-micro` y aplicando el adaptador LoRA con PEFT.
- Investigación en alineación por preferencias: sirve como artefacto reproducible para estudiar el efecto de DPO con LoRA sobre un modelo MoE híbrido, dado que se documentan hiperparámetros y versiones de framework.
- Destilación de conocimiento entre variantes Granite: el nombre del dataset (`..._granite-4.0-h-micro_to_granite-4.0-h-tiny`) sugiere que se usó para transferir preferencias de la variante micro a la tiny; el adaptador podría reutilizarse en experimentos de destilación similares.
- Prototipado de asistentes conversacionales especializados: al ser un adaptador pequeño sobre un modelo base, permite experimentar con ajuste fino ligero sin reentrenar el modelo completo.
- Comparación de checkpoints DPO: útil para contrastar configuraciones de DPO (learning rate, épocas, dataset) frente a otros adaptadores del mismo autor.
- Docencia y reproducción de experimentos: la información de hiperparámetros y versiones permite reproducir el entrenamiento en entornos con PEFT y TRL.

## Benchmarks y rendimiento

La model-index del autor declara una entrada (`granite4_tiny7b_to_micro3b_RCAEval_2_kd`) con la lista de resultados vacía (`results: []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base `granite-4.0-h-micro`, cuyas especificaciones no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible; el repositorio ocupa 6,4 GB, lo que sugiere que los pesos podrían caber en GPUs de consumo con suficiente VRAM, pero no se confirma.
- Opciones de despliegue: PEFT + Transformers (versiones documentadas: PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travel-granite4_tiny7b_to_micro3b_RCAEval_2_kd | Adaptador LoRA (DPO) sobre granite-4.0-h-micro | No disponible | No disponible | No disponible | Hugging Face (0 descargas) |
| granite-4.0-h-micro (modelo base) | Modelo completo MoE híbrido | No disponible en la información | No disponible | No disponible | Hugging Face |
| granite-4.0-h-tiny (modelo comparado en el dataset) | Modelo completo | No disponible en la información | No disponible | No disponible | Hugging Face |

No se dispone de datos de rendimiento, parámetros ni contexto de los modelos comparados en la información proporcionada, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Model card incompleta: los campos de descripción, usos previstos, limitaciones y datos de evaluación están marcados como "More information needed"; no hay documentación sobre sesgos, alucinación o restricciones de uso.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse la licencia del modelo base `granite-4.0-h-micro` y del adaptador antes de cualquier despliegue en producción.
- Idiomas no documentados: se desconoce qué lenguas cubre el adaptador y si el ajuste DPO ha degradado capacidades multilingües del modelo base.
- Artefacto de investigación: cero descargas y cero likes, sin benchmarks publicados; no hay evidencia de calidad ni de robustez.
- Dependencia del modelo base: el adaptador no es autónomo; requiere cargar `models/granite-4.0-h-micro` y aplicar PEFT, lo que añade complejidad de despliegue.
- Riesgo de sobreajuste al dominio RCAEval_2: al entrenarse sobre un dataset específico de pares de preferencias, el adaptador puede degradar el rendimiento general del modelo base fuera de ese dominio.
- Tamaño del repositorio (6,4 GB) inusualmente grande para un adaptador LoRA: conviene inspeccionar el contenido antes de descargarlo, ya que podría incluir checkpoints intermedios o pesos fusionados no documentados.
- Sin información sobre latencia, throughput ni requisitos de hardware: no se puede garantizar su viabilidad en entornos de producción con restricciones de recursos.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_kd
- Modelo base: https://huggingface.co/models/granite-4.0-h-micro
- Dataset de entrenamiento: no disponible como enlace público en la información proporcionada (referencia interna `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`)
- Paper de DPO: no disponible en la información proporcionada
- Repositorio TRL: no disponible en la información proporcionada
- Repositorio PEFT: no disponible en la información proporcionada
