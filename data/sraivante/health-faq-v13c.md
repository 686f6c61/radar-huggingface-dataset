# sraivante/health-faq-v13c

## Resumen

`health-faq-v13c` es un checkpoint de investigación de un modelo de lenguaje de dominio sanitario desarrollado por el usuario `sraivante`. Se trata de un decoder de 10,56 millones de parámetros con una cabeza de clasificación de conceptos ("concept head"), entrenado sobre un dataset privado de preguntas frecuentes de salud (`sraivante/health-faq-v13-data`). El modelo no está pensado para generación libre de texto, sino para la clasificación top-1 de conceptos asociados a preguntas conocidas y variantes con ruido.

La relevancia de este checkpoint es limitada y de carácter estrictamente interno: el propio autor indica que el entrenamiento no finalizó y que solo existen snapshots de las épocas 2 y 3, con el mejor resultado de validación en la época 2. La model card se presenta explícitamente como "report only" y el autor aclara que esta subida es privada y no ha sido revisada para publicación pública (la única release pública revisada sería `reviewed-v4`).

Por tanto, esta ficha documenta un artefacto experimental de 0,2 GB, sin pipeline declarado, sin idiomas especificados y con licencia "other", cuyo interés principal radica en servir como referencia de comparación frente a otros checkpoints de la misma familia (`rt1`, `v6`, `v11a`) en tareas de precisión de conceptos sobre conjuntos de preguntas vistas y nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con concept head (clasificador top-1 de conceptos) |
| Parametros totales | 10,56 M (decoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la evaluación reportada usa CPU FP32 en la cabeza) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible (repo de 0,2 GB; no se detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo se compone de un decoder Transformer de 10,56 millones de parámetros más una cabeza de conceptos ("concept head") que produce una predicción top-1 de concepto para cada pregunta de entrada. No se trata, por tanto, de un modelo generativo de uso general, sino de un componente de clasificación/etiquetado dentro de un pipeline de FAQ sanitarias. La model card remite al código de entrenamiento `code/training/train_canonical.py` (clase `ConceptLM`) y a la configuración `prepared/config.json` para reproducir la carga del modelo.

El entrenamiento se realizó sobre el dataset privado `sraivante/health-faq-v13-data`, descrito como "multi-noise data", es decir, con variantes ruidosas de las preguntas. El run no llegó a completarse: solo existen snapshots de las épocas 2 y 3, y la validación alcanzó su pico en la época 2. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. La evaluación reportada se ejecutó en CPU en FP32 sobre la cabeza de conceptos.

## Capacidades

- Clasificación top-1 de conceptos sanitarios para preguntas de FAQ, con criterio "eq1 accept-either".
- Robustez parcial ante variantes ruidosas de preguntas (conjuntos `challenge_new` y `mn2_challenge_new_multi`).
- Evaluación sobre preguntas vistas (`test_seen`) y preguntas nuevas (`challenge_new`).
- Soporte de escenarios multi-etiqueta o multi-ruido (`mn2_*_multi`).
- No se documenta generación de texto libre, tool calling, function calling, razonamiento multi-paso, capacidades multimodales ni modo "thinking".
- No se documentan capacidades multilingües; los idiomas no están declarados.

## Casos de uso

- Enrutamiento de preguntas frecuentes en un asistente sanitario: el modelo clasificaría cada consulta entrante en un concepto top-1 para dirigirla a la respuesta canónica o al artículo correspondiente, apoyándose en su entrenamiento sobre variantes ruidosas.
- Comparación interna de checkpoints: sirve como referencia cuantitativa (`v13c_e2`) frente a `rt1`, `v6` y `v11a` en los mismos conjuntos de evaluación, útil para decidir qué checkpoint promover.
- Filtrado previo a un modelo mayor: en un esquema de router, las preguntas con alta confianza de concepto podrían resolverse con este modelo de 10,56 M de parámetros y derivar solo las dudosas a un modelo de mayor tamaño, reduciendo coste de inferencia.
- Etiquetado asistido de un corpus de FAQ sanitarias: dado un conjunto de preguntas, el modelo asigna conceptos que pueden revisarse manualmente para mantener la taxonomía del dataset privado.
- Detección de preguntas fuera de distribución: comparando la precisión en `clean_test_seen` (93,7-93,8) frente a `clean_challenge_new` (53,8-54,4) se puede calibrar un umbral para marcar consultas que requieren revisión humana.
- Evaluación de robustez ante ruido: los conjuntos `mn2_*_multi` permiten medir la degradación del clasificador cuando las preguntas contienen variaciones o ruido, como paso previo a un despliegue real.

## Benchmarks y rendimiento

Los datos disponibles son de precisión de concepto top-1 (eq1 accept-either, cabeza en CPU FP32) y se presentan como "report only", no como criterio de aceptación. Se comparan los checkpoints `rt1_s42`/`rt1_s43`, `v6_s42`/`v6_s43`, `v11a_s42`/`v11a_s43` y `v13c_e2_s42`/`v13c_e2_s43`.

| Set | Filas | rt1_s42 | rt1_s43 | v6_s42 | v6_s43 | v11a_s42 | v11a_s43 | v13c_e2_s42 | v13c_e2_s43 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| test_seen_cb1 | 1626 | 91,6 | 92,6 | 30,9 | 30,6 | 39,1 | 40,2 | 65,9 | 68,0 |
| challenge_new_cb1 | 3617 | 58,4 | 58,6 | 18,2 | 17,9 | 22,4 | 22,1 | 33,4 | 35,3 |
| clean_test_seen | 1638 | 97,7 | 98,2 | 96,5 | 96,3 | 95,8 | 96,5 | 93,8 | 93,7 |
| clean_challenge_new | 3617 | 66,5 | 67,7 | 55,4 | 54,2 | 55,2 | 54,0 | 53,8 | 54,4 |
| mn2_test_seen_multi | 4735 | 92,2 | 92,6 | 38,9 | 38,9 | 50,4 | 51,4 | 82,9 | 83,7 |
| mn2_challenge_new_multi | 10812 | 58,9 | 59,6 | 23,5 | 22,7 | 27,6 | 28,0 | 41,5 | 42,9 |

Además, para `rt1` se reporta la tasa de "answered / wrong" en su umbral de router congelado (las preguntas que enviaría a un modelo mayor no cuentan como error):

| Set | rt1_s42 answered / wrong | rt1_s43 answered / wrong |
|---|---|---|
| test_seen_cb1 | 66,2 / 0,5 | 68,4 / 0,4 |
| challenge_new_cb1 | 26,2 / 1,7 | 27,4 / 1,9 |
| clean_test_seen | 87,4 / 0,2 | 90,0 / 0,4 |
| clean_challenge_new | 35,7 / 2,1 | 36,3 / 1,5 |
| mn2_test_seen_multi | 69,8 / 0,4 | 71,2 / 0,3 |
| mn2_challenge_new_multi | 26,7 / 1,8 | 27,5 / 1,9 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 10,56 M de parámetros, los pesos en FP32 ocuparían aproximadamente 42 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- El repositorio ocupa 0,2 GB, lo que sugiere que los pesos ocupan una fracción pequeña y el resto corresponde a artefactos auxiliares.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente; también puede ejecutarse en CPU, de hecho la evaluación reportada se hizo en CPU FP32.
- Despliegue: no se documentan opciones como vLLM, llama.cpp, Ollama o TGI; el autor indica cargar el modelo con `code/training/train_canonical.py:ConceptLM` y `prepared/config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación relevante es dentro de la propia familia de checkpoints del autor, evaluados sobre los mismos conjuntos:

| Modelo | Parámetros | Contexto | test_seen_cb1 (s42) | challenge_new_cb1 (s42) | clean_test_seen (s42) | Licencia |
|---|---|---|---|---|---|---|
| rt1 | no disponible | no disponible | 91,6 | 58,4 | 97,7 | no disponible |
| v11a | no disponible | no disponible | 39,1 | 22,4 | 95,8 | no disponible |
| v6 | no disponible | no disponible | 30,9 | 18,2 | 96,5 | no disponible |
| health-faq-v13c (e2) | 10,56 M | no disponible | 65,9 | 33,4 | 93,8 | other |

`rt1` domina en precisión bruta, aunque parte de sus filas provienen de su evaluación congelada y de su router (las preguntas derivadas al modelo mayor no se contabilizan como error). `v13c_e2` mejora claramente a `v6` y `v11a` en los conjuntos con ruido (`test_seen_cb1`, `challenge_new_cb1`, `mn2_*_multi`), pero queda por debajo en los conjuntos limpios (`clean_test_seen`, `clean_challenge_new`). No se dispone de comparación con modelos externos de la misma categoría.

## Limitaciones y advertencias

- El entrenamiento no finalizó: solo existen snapshots de las épocas 2 y 3, con pico de validación en la época 2; no debe tratarse como un modelo terminado.
- Subida privada y no revisada para publicación pública; el autor remite a `reviewed-v4` como única release pública revisada.
- Los resultados son "report only" y no constituyen un criterio de aceptación ("not a gate").
- El modelo es un clasificador de conceptos, no un generador de texto: no debe esperarse respuesta conversacional ni razonamiento libre.
- Rendimiento notablemente inferior en preguntas nuevas y ruidosas (`challenge_new_cb1`: 33,4-35,3; `mn2_challenge_new_multi`: 41,5-42,9) frente a preguntas vistas, lo que anticipa fallos en producción ante consultas fuera de distribución.
- Licencia "other": no se especifican condiciones de uso comercial; debe consultarse al autor antes de cualquier uso productivo.
- Idiomas no declarados y dataset privado: no es posible auditar la composición de los datos ni los sesgos asociados.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de asignación incorrecta de concepto con alta confianza en dominios no cubiertos por el dataset.
- No se documentan requisitos de hardware, formatos de pesos ni herramientas de despliegue estándar, lo que dificulta su integración en pipelines existentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sraivante/health-faq-v13c
- Dataset de entrenamiento (privado): `sraivante/health-faq-v13-data`
- Código de entrenamiento referenciado en la model card: `code/training/train_canonical.py` (clase `ConceptLM`)
- Configuración referenciada: `prepared/config.json`
