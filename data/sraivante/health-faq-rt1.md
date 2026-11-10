# sraivante/health-faq-rt1

## Resumen

health-faq-rt1 es un clasificador de texto experimental desarrollado por el usuario sraivante, diseñado para la tarea de enrutamiento y clasificación de preguntas frecuentes (FAQ) en el dominio de seguros de salud y Medicare. El modelo debe asignar cada consulta a uno de 1.775 conceptos predefinidos o a la clase `unseen_question` (clase 1775), devolviendo como respuesta una entrada canónica asociada al concepto. Se trata de un archivo privado de un experimento fechado el 9 de noviembre de 2026, no de una versión publicada.

Arquitectónicamente es un encoder bidireccional entrenado desde cero, con anchura 256, 12 capas y 10,48 millones de parámetros, que utiliza un tokenizador v4 congelado de vocabulario 2.046 y entrada normalizada con casefold. El modelo se complementa con un router que deriva la consulta a un modelo mayor cuando gana la clase desconocida o cuando la mejor puntuación conocida cae por debajo de un umbral tau de 0,990 o 0,991, ajustado sobre los conjuntos de validación val_cb1 y val_unseen_cb1.

Su relevancia es limitada y de carácter interno: el modelo no supera la puerta de evaluación CB1 (resultado `rt1_partial`, FAIL) y su principal debilidad es la separación entre preguntas conocidas y desconocidas, lo que obliga a fijar un umbral muy alto y reduce la cobertura efectiva. No obstante, los resultados de precisión sobre conceptos conocidos son notablemente superiores a los de iteraciones anteriores (v6, v11a, v13c_e2), lo que lo convierte en una referencia útil dentro de la línea de experimentos del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional desde cero (transformer) |
| Parámetros totales | 10,48 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (evaluado en CPU FP32 para la cabeza de clasificación) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | best.pt (checkpoint PyTorch); tokenizador y artefactos preparados en `prepared/` |

## Arquitectura y entrenamiento

El modelo es un encoder bidireccional tipo transformer entrenado desde cero, con anchura de 256, 12 capas y 10,48 millones de parámetros. La entrada se normaliza con casefold y se tokeniza con un tokenizador v4 congelado de vocabulario 2.046. La tarea es de clasificación en 1.776 clases: 1.775 conceptos FAQ más la clase `unseen_question`. La respuesta se obtiene por búsqueda directa en el diccionario `canonical[concept]`, es decir, el modelo solo clasifica y la respuesta canónica se recupera de una tabla.

El entrenamiento se realizó sobre el conjunto `sraivante/health-faq-rt1-data`, con 486.750 filas que combinan todas las filas de la versión v13, paráfrasis, datos de gramática, ruido compuesto y ejemplos desconocidos. Se ejecutaron 15 épocas con semillas 42 y 43 (mejores épocas 9 y 10 respectivamente) en una GPU RTX PRO 6000 Blackwell (Colab G4), con un coste aproximado de 55 segundos por época. El router se calibró con umbrales tau de 0,990 y 0,991 seleccionados sobre val_cb1 y val_unseen_cb1. No se documenta el uso de RLHF, DPO ni técnicas de decodificación especulativa; la innovación principal es el esquema de enrutamiento condicionado por la confianza y la clase desconocida.

## Capacidades

- Clasificación de preguntas FAQ en 1.775 conceptos predefinidos del dominio de seguros de salud y Medicare.
- Detección de preguntas fuera de distribución mediante la clase `unseen_question` (clase 1775).
- Enrutamiento condicional a un modelo mayor cuando la clase desconocida gana o la mejor puntuación conocida es inferior al umbral tau.
- Recuperación de respuesta canónica por búsqueda en tabla (`canonical[concept]`), sin generación de texto libre.
- Manejo de paráfrasis, variaciones gramaticales y ruido compuesto en la entrada, según la composición del dataset de entrenamiento.
- Evaluación sobre conjuntos con preguntas multi-concepto (mn2_test_seen_multi y mn2_challenge_new_multi).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; no se documenta el idioma o idiomas de entrenamiento.

## Casos de uso

- Enrutamiento en un sistema de atención al cliente de seguros de salud: el clasificador asigna la consulta a uno de los 1.775 conceptos FAQ y devuelve la respuesta canónica, derivando al modelo mayor las consultas con baja confianza o etiquetadas como desconocidas.
- Filtro de primera línea en un pipeline de soporte: al ser un modelo de 10,48 M de parámetros, puede ejecutarse en CPU y actuar como criba barata antes de invocar un LLM mayor, reduciendo coste por consulta.
- Clasificación de tickets entrantes por temática de Medicare: útil para etiquetar y enrutar correos o formularios hacia el equipo o base de conocimiento correspondiente.
- Detección de consultas fuera de catálogo: la clase `unseen_question` y el umbral tau permiten identificar preguntas que no encajan en el FAQ y requieren revisión humana o escalado.
- Análisis de cobertura del FAQ: ejecutando el modelo sobre consultas históricas se pueden identificar conceptos con baja confianza y priorizar la ampliación de la base de conocimiento.
- Prototipado de asistentes FAQ de bajo coste: el checkpoint y los artefactos preparados (`prepared/`) permiten reproducir el pipeline de clasificación y respuesta canónica en entornos con recursos limitados.
- Evaluación comparativa interna: sirve como referencia en la línea de experimentos del autor frente a v6, v11a y v13c_e2 en precisión de concepto sobre preguntas conocidas.

## Benchmarks y rendimiento

Precisión top-1 de concepto (eq1 accept-either, cabeza en CPU FP32) sobre preguntas conocidas:

| Conjunto | Filas | rt1_s42 | rt1_s43 | v6_s42 | v6_s43 | v11a_s42 | v11a_s43 | v13c_e2_s42 | v13c_e2_s43 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| test_seen_cb1 | 1626 | 91,6 | 92,6 | 30,9 | 30,6 | 39,1 | 40,2 | 65,9 | 68,0 |
| challenge_new_cb1 | 3617 | 58,4 | 58,6 | 18,2 | 17,9 | 22,4 | 22,1 | 33,4 | 35,3 |
| clean_test_seen | 1638 | 97,7 | 98,2 | 96,5 | 96,3 | 95,8 | 96,5 | 93,8 | 93,7 |
| clean_challenge_new | 3617 | 66,5 | 67,7 | 55,4 | 54,2 | 55,2 | 54,0 | 53,8 | 54,4 |
| mn2_test_seen_multi | 4735 | 92,2 | 92,6 | 38,9 | 38,9 | 50,4 | 51,4 | 82,9 | 83,7 |
| mn2_challenge_new_multi | 10812 | 58,9 | 59,6 | 23,5 | 22,7 | 27,6 | 28,0 | 41,5 | 42,9 |

Resultados del router (answered / wrong delivered) en el umbral tau congelado:

| Conjunto | rt1_s42 | rt1_s43 |
|---|---|---|
| test_seen_cb1 | 66,2 / 0,5 | 68,4 / 0,4 |
| challenge_new_cb1 | 26,2 / 1,7 | 27,4 / 1,9 |
| clean_test_seen | 87,4 / 0,2 | 90,0 / 0,4 |
| clean_challenge_new | 35,7 / 2,1 | 36,3 / 1,5 |
| mn2_test_seen_multi | 69,8 / 0,4 | 71,2 / 0,3 |
| mn2_challenge_new_multi | 26,7 / 1,8 | 27,5 / 1,9 |

Puerta CB1 (evaluada una sola vez, resultado `rt1_partial`, FAIL):

| Comprobación (objetivo) | seed 42 | seed 43 |
|---|---:|---:|
| test_seen_cb1 answered (>= 90%) | 66,2 | 68,4 |
| test_seen_cb1 wrong delivered (<= 3%) | 0,5 | 0,4 |
| challenge_new_cb1 answered (>= 90%) | 26,2 | 27,4 |
| challenge_new_cb1 wrong delivered (<= 3%) | 1,7 | 1,9 |
| test_unseen_cb1 routed (>= 90%) | 91,8 | 89,6 |

La clase desconocida captura solo el 4,5% de val_unseen, con AUROC de 0,744, lo que obliga a fijar tau cerca de 0,99.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (10,48 M de parámetros); el checkpoint completo ocupa aproximadamente 0,1 GB, por lo que la inferencia en FP32 requiere del orden de decenas de MB de memoria.
- GPU recomendadas: el entrenamiento se realizó en una RTX PRO 6000 Blackwell (Colab G4); para inferencia es suficiente cualquier GPU consumer o incluso CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en CPU; la cabeza de clasificación se evaluó en CPU FP32.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio incluye código propio de entrenamiento y evaluación (`code/training/rt1.py`, `build/package_rt1.py`, `rt1_colab_cell.py`) y checkpoints `best.pt`.
- Latencia y throughput: no disponibles; solo se documenta el coste de entrenamiento (aproximadamente 55 s por época en RTX PRO 6000 Blackwell).

## Comparativa con modelos similares

Comparativa con iteraciones previas del mismo autor sobre los mismos conjuntos (precisión top-1 de concepto):

| Modelo | Parámetros | Contexto | test_seen_cb1 (s42/s43) | challenge_new_cb1 (s42/s43) | Licencia |
|---|---|---|---|---|---|
| health-faq-rt1 | 10,48 M | no disponible | 91,6 / 92,6 | 58,4 / 58,6 | other |
| v13c_e2 | no disponible | no disponible | 65,9 / 68,0 | 33,4 / 35,3 | no disponible |
| v11a | no disponible | no disponible | 39,1 / 40,2 | 22,4 / 22,1 | no disponible |
| v6 | no disponible | no disponible | 30,9 / 30,6 | 18,2 / 17,9 | no disponible |

No se dispone de comparación con modelos externos de clasificación de FAQ o de dominio sanitario en la información proporcionada.

## Limitaciones y advertencias

- No es una versión publicada: es un archivo privado de un experimento fechado el 9 de noviembre de 2026, sin garantías de mantenimiento ni soporte.
- No supera la puerta de evaluación CB1: resultado `rt1_partial`, FAIL, con cobertura de preguntas vistas muy por debajo del objetivo del 90% (66,2% y 68,4%).
- Separación deficiente entre preguntas conocidas y desconocidas: la clase desconocida captura solo el 4,5% de val_unseen y el AUROC es 0,744, lo que fuerza un umbral tau cercano a 0,99 y reduce la cobertura.
- Cobertura baja en preguntas nuevas: 26,2% y 27,4% de respuestas emitidas en challenge_new_cb1, muy lejos del objetivo del 90%.
- Las respuestas no se generan: se recuperan por búsqueda en `canonical[concept]`, por lo que la calidad depende de la tabla canónica y no hay razonamiento ni síntesis.
- Riesgo de respuestas incorrectas: aunque el porcentaje de respuestas erróneas entregadas es bajo (0,4-2,1% según conjunto), existe y debe gestionarse con revisión o escalado.
- Idiomas soportados no disponibles: no se documenta el idioma de entrenamiento ni cobertura multilingüe.
- Licencia `other`: no se especifican los términos de uso comercial; es necesario contactar con el autor antes de cualquier uso en producción.
- Sesgos conocidos: no documentados en la información proporcionada.
- Longitud de contexto no disponible: no se especifica la ventana máxima de entrada del encoder.
- Dominio restringido a seguros de salud y Medicare; el rendimiento fuera de ese ámbito no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sraivante/health-faq-rt1
- Dataset de entrenamiento: https://huggingface.co/datasets/sraivante/health-faq-rt1-data
- Especificación del clasificador (referenciada en la model card): `report/rt1_classifier_spec.md` (hash en `.sha256`)
- Resultados y checkpoints (referenciados en la model card): `rt1_results/rt1_seed42/`, `rt1_results/rt1_seed43/`, `rt1_results/eval/`, `rt1_results/MANIFEST.json`
- Código de entrenamiento y evaluación (referenciado en la model card): `code/training/rt1.py`, `code/build/package_rt1.py`, `code/build/compare_known_rt1.py`, `code/rt1_colab_cell.py`
- Artefactos preparados (referenciados en la model card): `prepared/` (config, class map, canonical answers, tokenizer, eq1 equivalence)
