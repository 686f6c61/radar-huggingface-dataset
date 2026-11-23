# TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_advantage_temp0.3

## Resumen

Este repositorio contiene un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base `granite-4.0-h-micro` de IBM. El autor, identificado como TravelDistillation, lo ha generado en el contexto de un experimento de destilación de preferencias desde un modelo mayor (`granite-4.0-h-tiny`) hacia uno más pequeño, utilizando un conjunto de pares de preferencia denominado `preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`. El identificador del modelo sugiere además el uso de una función de recompensa con componentes macro y micro, y una temperatura de muestreo de 0.3 durante la generación de pares.

El interés de esta ficha es limitado pero relevante para quien investigue técnicas de alineamiento y destilación de preferencias sobre la familia Granite 4.0. El adaptador no es un modelo autónomo: requiere cargar el modelo base `granite-4.0-h-micro` y aplicar los pesos LoRA. La información pública es muy escasa: la model card está generada automáticamente por el Trainer de TRL, no declara licencia ni idiomas, y no incluye resultados de evaluación.

No se dispone de datos sobre arquitectura interna más allá de lo que implica el modelo base (etiqueta `granitemoehybrid`), ni de parámetros totales, contexto o composición del dataset de preferencias. El repositorio ocupa 6,4 GB, coherente con un adaptador LoRA sobre un modelo de varios miles de millones de parámetros en precisión alta, aunque el tamaño exacto de los pesos del adaptador no se detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base `granite-4.0-h-micro` (etiqueta `granitemoehybrid`) |
| Parametros totales | no disponible (depende del modelo base `granite-4.0-h-micro`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con DPO (Direct Preference Optimization) usando la librería TRL, sobre el modelo base `granite-4.0-h-micro`. La etiqueta `granitemoehybrid` del repositorio sugiere que el modelo base pertenece a la familia Granite 4.0 de IBM, que combina componentes MoE con arquitectura híbrida, aunque no se detalla la configuración concreta. El adaptador es de tipo LoRA y se carga mediante PEFT.

Los hiperparámetros declarados en la model card son: learning rate 5e-05, batch size de entrenamiento 1 con acumulación de gradientes de 8 (batch efectivo 8), una única época, scheduler coseno con warmup del 10 %, semilla 42 y optimizador AdamW (betas 0.9/0.999, epsilon 1e-08). El dataset de entrenamiento es `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, presumiblemente pares de preferencia generados comparando respuestas del modelo micro frente al tiny. No se documenta el número de tokens, la composición del dataset ni si hubo etapas previas de SFT.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Granite 4.0.
- Alineamiento por preferencias mediante DPO, orientado a mejorar la calidad de respuesta según la función de recompensa definida por el autor (componentes macro y micro).
- Capacidad potencial de tool calling y razonamiento multi-paso, si el modelo base las soporta (no confirmado en la información disponible).
- Capacidades multilingües: no disponibles en la información del repositorio.
- No se documentan modos especiales (thinking, visión, audio) en este adaptador.

## Casos de uso

- Investigación en destilación de preferencias: el adaptador sirve como artefacto reproducible para estudiar cómo se transfieren preferencias desde un modelo mayor (tiny) a uno menor (micro) mediante DPO, con hiperparámetros y dataset documentados.
- Experimentos de alineamiento con DPO sobre la familia Granite: útil para comparar curvas de recompensa y estabilidad de entrenamiento frente a otras configuraciones (temperatura, función de recompensa, tamaño de batch).
- Evaluación de adaptadores LoRA de bajo rango: al ser un adaptador PEFT, permite probar técnicas de merge, cuantización y despliegue sin reentrenar el modelo base.
- Reproducción de pipelines TRL: la configuración de hiperparámetros permite replicar el entrenamiento en entornos con GPUs modestas (batch efectivo 8, una época).
- Base para fine-tuning posterior: puede servir como punto de partida para adaptaciones específicas de dominio sobre `granite-4.0-h-micro`.
- Análisis de robustez de DPO con temperatura baja (0.3): útil para estudiar cómo afecta la temperatura de muestreo en la generación de pares de preferencia a la calidad final del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` del repositorio declara una entrada sin resultados (`results: []`), y la model card no incluye métricas de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base `granite-4.0-h-micro`; no disponible en la información del repositorio.
- GPU recomendadas: no disponible; dependerá del tamaño del modelo base y de la cuantización elegida.
- Compatibilidad con GPU de consumo: no confirmada; requiere evaluar el modelo base (la etiqueta `micro` sugiere un tamaño contenido, pero no se especifica).
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el modelo base); compatible potencialmente con vLLM, TGI y llama.cpp si el modelo base lo está, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Travel-granite4_tiny7b_to_micro3b_RCAEval_2 (este) | no disponible (adaptador LoRA) | no disponible | no disponible | Hugging Face (0 descargas) |
| granite-4.0-h-micro (base) | no disponible | no disponible | no disponible | Hugging Face |
| granite-4.0-h-tiny (origen de preferencias) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría (adaptadores DPO sobre Granite u otros modelos pequeños alineados).

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones vacías ("More information needed"): no hay descripción de usos previstos ni limitaciones declaradas por el autor.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; hay que remitirse a la licencia del modelo base `granite-4.0-h-micro`.
- No se documentan idiomas soportados; el comportamiento multilingüe es incierto.
- No hay resultados de evaluación: no se puede verificar que el DPO haya mejorado la calidad respecto al modelo base.
- Riesgo de alucinación y sesgos: no evaluado en este adaptador; hereda los del modelo base, que no están documentados aquí.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día: no hay evidencia de uso comunitario ni validación externa.
- El adaptador no es un modelo autónomo: requiere el modelo base y la librería PEFT para funcionar; un despliegue sin el base fallará.
- La temperatura de 0.3 en la generación de pares de preferencia puede sesgar la distribución de respuestas hacia lo más probable, limitando la diversidad del alineamiento.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_newReward_C_Macro_Micro_advantage_temp0.3
- Modelo base: https://huggingface.co/models/granite-4.0-h-micro
- Dataset de preferencias: https://huggingface.co/datasets/data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
