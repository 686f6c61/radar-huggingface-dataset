# TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_gkd

## Resumen

Travel-granite4_tiny7b_to_micro3b_RCAEval_2_gkd es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base IBM Granite 4.0 h-micro. Lo publica el usuario TravelDistillation en Hugging Face y su propósito declarado es la destilación de preferencias desde un modelo mayor (Granite 4.0 h-tiny, referido como "tiny7b" en el nombre) hacia el modelo micro, usando pares de preferencia generados sobre el conjunto de evaluación RCAEval. El repositorio tiene 6,4 GB, lo que sugiere que incluye pesos del adaptador y posiblemente artefactos de entrenamiento.

El modelo es relevante en el contexto de la familia Granite 4.0 de IBM, que emplea una arquitectura híbrida Mamba-2/Transformer con mezcla de expertos (MoE) y está orientada a cargas de trabajo empresariales con ventanas de contexto largas. Este adaptador concreto representa un experimento de alineación mediante DPO sobre esa base, no un modelo completo ni un lanzamiento oficial.

La información publicada es muy escasa: la model card es autogenerada por el Trainer de TRL, no declara licencia, idiomas ni resultados de evaluación, y el model-index está vacío. Cualquier uso en producción requeriría validación propia y consultar los términos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Granite 4.0 h-micro, arquitectura híbrida Mamba-2/Transformer con MoE |
| Parametros totales | no disponible (adaptador; el base es Granite 4.0 h-micro) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base para inferencia |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (librería PEFT 0.21.2) sobre `models/granite-4.0-h-micro`, entrenado con TRL y Transformers 5.19.0 sobre PyTorch 2.13.0. El método es DPO, según las etiquetas del repositorio, con un dataset de pares de preferencia denominado `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, lo que indica que las preferencias se construyeron comparando las salidas del modelo micro con las del modelo tiny sobre el benchmark RCAEval. Se trata, por tanto, de una destilación de preferencias (generalized knowledge distillation con DPO) en la que el modelo mayor actúa como referencia.

Los hiperparámetros declarados son: learning rate 5e-5, batch size efectivo 8 (1 × 8 pasos de acumulación), optimizador AdamW (betas 0,9/0,999, epsilon 1e-8), scheduler coseno con 10 % de warmup, una sola época y semilla 42. No se especifican rango del adaptador, alpha, módulos objetivo ni número de tokens de entrenamiento. Tampoco se documenta ninguna innovación técnica adicional más allá del propio procedimiento DPO.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Granite 4.0 h-micro.
- Alineación orientada a preferencias sobre tareas de tipo RCAEval (análisis de causa raíz en entornos de operaciones), según el nombre del dataset de entrenamiento.
- No se documentan capacidades específicas adicionales del adaptador (tool calling, agentes, visión, audio, modo thinking) más allá de las que aporte el modelo base.
- Soporte multilingüe: no disponible en la ficha; depende del modelo base.
- No hay evidencia publicada de mejora medible en ninguna tarea concreta.

## Casos de uso

- Experimentación en alineación con DPO: el adaptador sirve como referencia reproducible para estudiar cómo un modelo pequeño (micro) imita las preferencias de uno mayor (tiny) sobre un benchmark concreto, con hiperparámetros documentados.
- Investigación en análisis de causa raíz (RCA): el dataset de preferencias se construyó sobre RCAEval, por lo que el adaptador puede evaluarse en tareas de diagnóstico de incidentes y compararse con el base sin adaptar.
- Destilación de preferencias en entornos con recursos limitados: al ser un adaptador LoRA, permite aplicar el ajuste sobre Granite 4.0 h-micro sin reentrenar el modelo completo, útil para prototipos en hardware modesto.
- Evaluación comparativa de métodos de alineación: sirve para contrastar DPO frente a SFT u otras técnicas sobre la misma base y el mismo conjunto de preferencias.
- Base para ajustes posteriores: al ser un adaptador PEFT, puede combinarse o continuarse con otros adaptadores en pipelines de TRL/PEFT para experimentos de investigación.
- Reproducción de experimentos: los hiperparámetros y versiones de framework están declarados, lo que facilita replicar el entrenamiento en un entorno controlado.
- No se recomienda su uso directo en producción sin una evaluación propia, dado que no hay benchmarks ni licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del repositorio contiene una entrada con la lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; depende del modelo base Granite 4.0 h-micro y de su cuantización, que no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: el adaptador es compatible con el ecosistema PEFT/Transformers (carga del base más el adaptador). El soporte en vLLM, llama.cpp, Ollama o TGI no está documentado y requeriría fusión del adaptador con el base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travel-granite4_tiny7b_to_micro3b_RCAEval_2_gkd | Adaptador LoRA + DPO sobre Granite 4.0 h-micro | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Granite 4.0 h-micro (modelo base) | Modelo completo híbrido Mamba-2/Transformer con MoE | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (IBM) |
| Granite 4.0 h-tiny (modelo de referencia) | Modelo completo híbrido Mamba-2/Transformer con MoE | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (IBM) |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card es autogenerada y no documenta usos previstos, limitaciones, datos de evaluación ni sesgos.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse la licencia del modelo base Granite 4.0 h-micro.
- No hay benchmarks ni métricas de calidad publicadas; el rendimiento real del adaptador es desconocido.
- Riesgo de alucinación inherente al modelo base, no evaluado tras el ajuste DPO.
- El entrenamiento se realizó con una sola época y un batch efectivo de 8, lo que puede limitar la magnitud del efecto del ajuste.
- El dataset de preferencias está orientado a RCAEval; el adaptador podría degradar el comportamiento general fuera de ese dominio.
- No se especifican idiomas soportados; el comportamiento multilingüe depende del base y no está verificado.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- El nombre del modelo ("tiny7b", "micro3b") no coincide necesariamente con los tamaños reales de los modelos Granite referenciados; no debe interpretarse como especificación técnica.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_gkd
- Modelo base: https://huggingface.co/models/granite-4.0-h-micro
- Dataset de preferencias: https://huggingface.co/datasets/data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny (referencia declarada en la model card; no verificada)
