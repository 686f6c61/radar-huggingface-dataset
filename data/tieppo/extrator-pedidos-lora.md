# Tieppo/extrator-pedidos-lora

## Resumen

El modelo `Tieppo/extrator-pedidos-lora` es un adaptador LoRA experimental publicado por el usuario Tieppo sobre el modelo base Qwen2.5-0.5B-Instruct. Su propósito es la extracción de información estructurada a partir de pedidos de comida a domicilio redactados en portugués, convirtiendo texto libre en cuatro campos concretos: valor máximo en centavos, plazo máximo en minutos, restricciones registradas e ingredientes excluidos. Se trata de un ajuste fino de tipo PEFT (Parameter-Efficient Fine-Tuning) con rango 8 aplicado únicamente a las proyecciones `q_proj` y `v_proj`, entrenado sobre 120 ejemplos de un conjunto de 360 pedidos sintéticos generados con semilla 42.

El adaptador es relevante como ejemplo de ingeniería de extracción estructurada con modelos pequeños y bajo coste computacional: el ajuste completo se realizó en 21,32 segundos sobre una Tesla T4. Sin embargo, la propia model card documenta resultados modestos y una decisión explícita de no integrar el modelo en producción: en una auditoría con 40 pedidos inéditos acertó los cuatro campos en 14 casos, frente a 18 del interpretador por reglas del sistema Sugestão da Casa. Los autores lo califican como experimental y no apto para decidir de forma autónoma sobre pedidos con restricciones alimentarias.

No se dispone de información sobre licencia del adaptador, pipeline declarado ni métricas de benchmarks estándar. El modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0, pero la licencia del adaptador en sí no está especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-0.5B-Instruct |
| Parámetros totales | no disponible (adaptador LoRA de rango 8 sobre `q_proj` y `v_proj`; el modelo base tiene 0,5B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (pt) |
| Licencia | no disponible (modelo base bajo Apache 2.0) |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador emplea Low-Rank Adaptation (LoRA) con rango 8, aplicado exclusivamente a las proyecciones de atención `q_proj` y `v_proj` del transformer decoder-only Qwen2.5-0.5B-Instruct. El modelo base se fijó en la revisión `7ae557604adf67be50417f59c2c2f167def9a775`. El entrenamiento utilizó 120 ejemplos extraídos de un conjunto de 360 pedidos sintéticos generados con semilla 42, y el ajuste completo se completó en 21,32 segundos sobre una GPU Tesla T4. No se documentan detalles sobre función de pérdida, hiperparámetros de optimización, número de épocas ni composición exacta del dataset más allá de la descripción de los cuatro campos de salida.

La tarea se plantea como extracción de información con salida estructurada: el adaptador debe producir un objeto con valor máximo en centavos, plazo máximo en minutos, restricciones registradas e ingredientes excluidos. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales. La innovación principal es metodológica (ajuste eficiente de un modelo de 0,5B para una tarea de dominio muy acotado en portugués) más que arquitectónica.

## Capacidades

- Extracción de información estructurada a partir de pedidos de comida a domicilio en portugués.
- Generación de salida en formato JSON con cuatro campos: valor máximo en centavos, plazo máximo en minutos, restricciones registradas e ingredientes excluidos.
- Validación de contrato de salida mediante el script `inferir.py` incluido en el repositorio del proyecto.
- Capacidad multilingüe limitada al portugués según la model card.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- El modelo base Qwen2.5-0.5B-Instruct aporta generación de texto general, pero el adaptador está especializado en la tarea de extracción.

## Casos de uso

- Extracción de parámetros de pedido en un chatbot de delivery: el adaptador convierte un mensaje en lenguaje natural ("Até R$ 45 com entrega, sem camarão e em 30 minutos") en un objeto estructurado con valor máximo, plazo, restricciones e ingredientes excluidos, listo para alimentar el motor de recomendación.
- Preprocesamiento de pedidos antes de un sistema de reglas: dado su bajo coste computacional, puede ejecutarse como paso previo para normalizar la entrada y luego aplicar un interpretador por reglas, que según la auditoría del autor obtuvo mejores resultados (18 aciertos frente a 14).
- Prototipado rápido de pipelines de extracción estructurada en portugués: sirve como referencia para evaluar LoRA de rango bajo sobre modelos de 0,5B en tareas de IE con presupuesto mínimo (21,32 s de entrenamiento en T4).
- Investigación sobre robustez de modelos pequeños en extracción de restricciones alimentarias: la model card documenta fallos sistemáticos (omisión de al menos una restricción en 15 de 26 pedidos con restricción registrada) que pueden servir como caso de estudio.
- Generación de datos sintéticos etiquetados: el pipeline de 360 pedidos sintéticos con semilla 42 puede reutilizarse para crear conjuntos de entrenamiento o evaluación en dominios similares.
- Docencia y experimentación con PEFT: ejemplo reproducible de ajuste LoRA sobre un modelo base pequeño con script de inferencia y validación incluidos en el repositorio.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre conjuntos sintéticos separados del entrenamiento:

| Evaluación | Conjunto | Salidas dentro de contrato | Los cuatro campos correctos |
|---|---|---|---|
| Adaptador LoRA | 30 pedidos sintéticos escritos a mano | 27 | 15 |
| Qwen base (formato original) | 30 pedidos sintéticos escritos a mano | 0 | no disponible |
| Qwen base (tras quitar cerca Markdown) | 30 pedidos sintéticos escritos a mano | 28 | 1 |
| Adaptador LoRA | 40 pedidos inéditos (segunda auditoría) | no disponible | 14 |
| Qwen base (tras quitar cerca Markdown) | 40 pedidos inéditos | no disponible | 8 |
| Interpretador por reglas Sugestão da Casa | 40 pedidos inéditos | no disponible | 18 |

En la segunda auditoría, de los 26 pedidos con restricción registrada, el LoRA omitió al menos una restricción en 15 salidas válidas y devolvió formato inválido en otros 6. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El modelo base Qwen2.5-0.5B-Instruct es de 0,5B parámetros; el adaptador LoRA añade un coste despreciable en memoria.
- Entrenamiento documentado: 21,32 segundos sobre una NVIDIA Tesla T4.
- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada; por el tamaño del modelo base, es esperable que quepa en GPUs de consumo, pero no se confirma con datos.
- GPUs recomendadas: no disponible; la única GPU mencionada en la documentación es la Tesla T4 usada para el ajuste.
- Opciones de despliegue: el repositorio del proyecto incluye `inferir.py`, que carga la revisión fijada del modelo base, aplica el adaptador y valida la respuesta. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tieppo/extrator-pedidos-lora | 0,5B (base) + LoRA rango 8 | no disponible | Extracción estructurada de pedidos en portugués | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible en esta ficha | Instrucción general | Apache 2.0 | Hugging Face |
| Interpretador por reglas Sugestão da Casa | no aplica | no aplica | Reglas deterministas para extracción de pedidos | no disponible | Referenciado en la model card |

La comparación con alternativas de la misma categoría (adaptadores LoRA para extracción de información en portugués) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El autor califica el adaptador como experimental y no apto para decidir de forma autónoma sobre pedidos con restricciones alimentarias.
- En la segunda auditoría con 40 pedidos inéditos, omitió al menos una restricción registrada en 15 de las 26 salidas válidas con restricción, y devolvió formato inválido en 6 casos adicionales.
- Rindió peor que el interpretador por reglas del sistema Sugestão da Casa (14 frente a 18 aciertos en los cuatro campos), lo que motivó su exclusión del recomendador.
- El conjunto de evaluación es pequeño y sintético, lo que limita la interpretación de los resultados.
- Riesgo de alucinación y de omisión de restricciones alimentarias, con implicaciones potenciales para la seguridad del usuario.
- Idioma limitado al portugués según la model card.
- Licencia del adaptador no especificada; el modelo base es Apache 2.0, pero no se confirma la licencia de los pesos derivados.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; proyecto de baja madurez y sin mantenimiento documentado.
- No se documentan sesgos específicos más allá de los derivados del dataset sintético de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Tieppo/extrator-pedidos-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Revisión fijada del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct/tree/7ae557604adf67be50417f59c2c2f167def9a775
- Repositorio del proyecto: https://github.com/Mateus-Tieppo/extrator-pedidos-lora
