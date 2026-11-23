# TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_speculative_kd

## Resumen

Travel-granite4_tiny7b_to_micro3b_RCAEval_2_speculative_kd es un adaptador LoRA entrenado con DPO sobre el modelo base `models/granite-4.0-h-micro` de IBM. Lo publica el usuario TravelDistillation en Hugging Face y forma parte de una familia de experimentos de destilación especulativa (speculative knowledge distillation) orientados a tareas de análisis de causa raíz (RCA, root cause analysis) sobre el benchmark RCAEval. El nombre del repositorio indica que el objetivo es transferir comportamiento de un modelo mayor (`granite-4.0-h-tiny`, referido como "tiny7b" en el identificador) hacia la variante micro de 3B.

El artefacto no es un modelo completo, sino un adaptador PEFT (LoRA) que debe combinarse con el modelo base Granite 4.0 H Micro. La model card es la generada automáticamente por el Trainer de Hugging Face y no incluye descripción funcional, datos de evaluación ni resultados de benchmarks; el model-index está vacío. Por tanto, la mayor parte de las especificaciones del modelo base no están confirmadas en la información disponible y se marcan como tales.

Su relevancia es acotada: se trata de un experimento de investigación reproducible (dataset de preference pairs, hiperparámetros documentados, versiones de framework) más que de un modelo listo para producción. Resulta útil para quienes estudian destilación especulativa, DPO sobre arquitecturas híbridas MoE y evaluación en dominios de diagnóstico técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | adaptador LoRA sobre modelo base con arquitectura `granitemoehybrid` (MoE híbrida, según tag del repo); detalles internos no disponibles |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base se identifica como "micro 3B" en el identificador del repo, sin confirmación oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos del adaptador se distribuyen en safetensors; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `models/granite-4.0-h-micro`, un modelo de la familia Granite 4.0 de IBM cuya arquitectura aparece etiquetada como `granitemoehybrid`, lo que sugiere una combinación de mezcla de expertos con componentes híbridos (posiblemente atención y capas de estado recurrente), aunque la información proporcionada no detalla la composición interna ni el número de expertos. El adaptador en sí es un LoRA de rango no especificado, entrenado con la librería TRL y PEFT 0.21.2 sobre Transformers 5.19.0 y PyTorch 2.13.0.

El entrenamiento usa DPO (Direct Preference Optimization) sobre el dataset `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, es decir, pares de preferencia construidos a partir de comparaciones entre las salidas del modelo micro y las del modelo tiny en el contexto de RCAEval. Los hiperparámetros declarados son: learning rate 5e-05, batch efectivo de 8 (batch 1 con acumulación de 8 pasos), una sola época, scheduler coseno con 10 % de warmup, semilla 42 y optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08. No se documenta el número de tokens de entrenamiento ni la composición completa del dataset. El término "speculative_kd" en el nombre apunta a destilación de conocimiento especulativa, aunque no se detalla el mecanismo exacto.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` indica uso en diálogo multi-turno.
- Razonamiento orientado a diagnóstico: el entrenamiento con pares de preferencia del benchmark RCAEval sugiere especialización en análisis de causa raíz de incidentes, aunque no se documenta su rendimiento real.
- Alineación por preferencias: al estar entrenado con DPO, se espera que el adaptador ajuste el estilo y la selección de respuestas hacia las preferidas en el dataset, no que añada capacidades nuevas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Análisis de causa raíz en sistemas distribuidos: el adaptador se entrenó sobre pares de preferencia del benchmark RCAEval, por lo que su uso natural es generar hipótesis de causa raíz a partir de trazas, logs y métricas de incidentes, alineando el estilo de respuesta con el del modelo profesor.
- Investigación en destilación especulativa: sirve como artefacto reproducible para estudiar cómo se transfiere comportamiento de un modelo mayor a uno menor mediante DPO y pares de preferencia generados automáticamente.
- Experimentos de alineación con DPO: los hiperparámetros y versiones de framework están documentados, lo que permite replicar el entrenamiento y comparar variantes de learning rate, épocas o composición del dataset.
- Base para ajuste adicional en dominios de observabilidad: al ser un adaptador LoRA ligero (repo de 6.4 GB que incluye el adaptador y posiblemente artefactos de entrenamiento), puede combinarse con el modelo base y reentrenarse con datos propios de SRE sin tocar los pesos completos.
- Evaluación comparativa de modelos pequeños en tareas de diagnóstico: útil para medir si un modelo micro ajustado se acerca al comportamiento de un modelo tiny en tareas de RCA, dentro de un pipeline de evaluación interno.
- Prototipado de asistentes de operaciones: integrado con el modelo base en un servicio de generación de texto, puede emplearse para redactar resúmenes de incidentes y recomendaciones de mitigación, siempre con validación humana.

## Benchmarks y rendimiento

El model-index declarado por el autor está vacío (`results: []`) y la model card no incluye sección de resultados de entrenamiento ni métricas de evaluación. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende enteramente del modelo base `granite-4.0-h-micro` y de su cuantización, que no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del repo (6.4 GB) sugiere que los pesos del adaptador o los artefactos asociados son manejables, pero no se confirma que quepa en GPU de consumo con el modelo base cargado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarse junto al modelo base con Transformers y PEFT; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Travel-granite4_tiny7b_to_micro3b_RCAEval_2_speculative_kd | no disponible (adaptador LoRA) | no disponible | no disponible | safetensors (PEFT) | Adaptador DPO para RCA, sin benchmarks publicados |
| granite-4.0-h-micro (modelo base) | no disponible en la información | no disponible | no disponible | no disponible | Modelo sobre el que se aplica el adaptador |
| granite-4.0-h-tiny (modelo profesor referido) | no disponible en la información | no disponible | no disponible | no disponible | Fuente de los pares de preferencia según el nombre del dataset |

No se dispone de datos suficientes para comparar parámetros, contexto, rendimiento o disponibilidad de alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card es la plantilla automática del Trainer y no contiene descripción, usos previstos ni limitaciones declaradas por el autor.
- No hay benchmarks ni métricas de evaluación: no es posible verificar que el adaptador mejore al modelo base en RCA u otra tarea.
- La licencia no está declarada, lo que impide determinar si el uso comercial es posible; debe consultarse la licencia del modelo base Granite 4.0 antes de cualquier despliegue.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- Al ser un adaptador LoRA, no funciona de forma autónoma: requiere el modelo base `models/granite-4.0-h-micro` y la librería PEFT.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas de diagnóstico técnico, las hipótesis de causa raíz deben validarse con evidencia operativa.
- Sesgos: no documentados.
- El dataset de preferencia se generó comparando salidas de dos modelos concretos, por lo que el adaptador puede heredar los sesgos y errores del modelo profesor.
- El identificador del repo ("tiny7b") no coincide con el tamaño real del modelo profesor citado (`granite-4.0-h-tiny`), lo que genera ambigüedad sobre qué modelo actuó como referencia.
- Fecha de creación declarada en 2026-11-23, posterior a la fecha de esta ficha; conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_speculative_kd
- Modelo base: https://huggingface.co/models/granite-4.0-h-micro
- Dataset de pares de preferencia: https://huggingface.co/datasets/data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
