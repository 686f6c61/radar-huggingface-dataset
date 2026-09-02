# ymelka/camembert-pharmacy-reranker-distil

## Resumen

El modelo `ymelka/camembert-pharmacy-reranker-distil` es un cross-encoder de reranking especializado en el dominio farmacéutico francés, desarrollado por ymelka. Está diseñado para reordenar tarjetas de especialidades farmacéuticas (BDPM) en respuesta a consultas como sustitución de genéricos, dosis, formulación, vía de administración o población (niño/adulto). Se basa en DistilCamemBERT, una versión destilada de CamemBERT, y hereda la arquitectura de clasificación de secuencias con una única etiqueta de salida (num_labels=1). Con aproximadamente 68 millones de parámetros, es un modelo ligero y eficiente para CPU, pensado para integrarse en pipelines de recuperación de información en francés.

El modelo se publica bajo licencia MIT y está disponible en HuggingFace con pesos en formato safetensors. Su relevancia radica en que mejora significativamente la precisión del reranking en un dominio específico (farmacia) frente a su modelo padre, especialmente en tareas de sustitución de genéricos, donde alcanza un incremento de +0.487 en precisión semántica P@1 sobre el conjunto de validación. No es un modelo universal de reranking médico ni pretende ser un sistema de decisión clínica, sino una herramienta de apoyo para búsquedas en catálogos de medicamentos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CamembertForSequenceClassification (cross-encoder, num_labels=1) |
| Parametros totales | 68.095.489 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (max_length de entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (fr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en DistilCamemBERT, que a su vez es una versión destilada de CamemBERT (modelo tipo RoBERTa entrenado en francés). La arquitectura concreta es `CamemBERTForSequenceClassification` con una única neurona de salida, lo que permite puntuar pares consulta-documento. El entrenamiento se realizó sobre el conjunto de datos `pharmacy-mixture-v5`, compuesto por aproximadamente 14.700 grupos de consultas extraídas exclusivamente de la base pública BDPM (Base de Données Publiques des Médicaments). Se utilizó una función de pérdida pairwise, una época, una tasa de aprendizaje de 2e-6 y se congelaron las 4 capas inferiores del encoder. La longitud máxima de secuencia se fijó en 256 tokens. No se emplearon técnicas de RLHF ni DPO; es un fine-tuning supervisado clásico. El modelo padre es `antoinelouis/crossencoder-distilcamembert-mmarcoFR`, entrenado sobre mMARCO francés, y el backbone es `cmarkea/distilcamembert-base`.

## Capacidades

- Reranking de pares consulta-documento en francés, especializado en el dominio farmacéutico (medicamentos, especialidades, genéricos).
- Soporte de consultas de sustitución de genéricos (p. ej., "générique de Doliprane 500 mg").
- Manejo de consultas sobre dosis, formulación, vía de administración y población (niño/adulto).
- Detección de variantes incorrectas de la misma molécula (same-molecule wrong variant).
- Integración sencilla con `transformers` y `sentence_transformers` (CrossEncoder).
- Compatible con `text-embeddings-inference` y endpoints de HuggingFace.
- No es un modelo generativo; su salida es una puntuación de relevancia para cada par.

## Casos de uso

- Búsqueda de medicamentos en farmacias online: el modelo puede reordenar los resultados de una búsqueda inicial (obtenida con un recuperador de primera etapa) para mostrar primero las especialidades más relevantes según la consulta del usuario, mejorando la experiencia de compra.
- Sustitución de genéricos en sistemas de dispensación: ante una prescripción de un medicamento de marca, el modelo identifica correctamente las alternativas genéricas equivalentes, reduciendo errores de dispensación.
- Asistencia en la validación de recetas electrónicas: puede puntuar pares de medicamentos prescritos y disponibles en stock para sugerir sustitutos válidos, agilizando el proceso en farmacias comunitarias.
- Chatbots de información farmacéutica: integrado en un asistente conversacional, permite seleccionar la ficha de medicamento más adecuada para responder preguntas sobre dosis, presentación o vía de administración.
- Indexación y búsqueda en bases de datos de medicamentos: sirve para mejorar la precisión de motores de búsqueda internos en hospitales o distribuidores, filtrando resultados irrelevantes.
- Evaluación de similitud semántica entre consultas y documentos en francés: aunque está especializado en farmacia, puede adaptarse a otros dominios con fine-tuning adicional, gracias a su base DistilCamemBERT.

## Benchmarks y rendimiento

La model card proporciona resultados sobre un evaluador congelado de BDPM, con dos métricas: RAW P@1 (coincidencia exacta) y SEMANTIC P@1 (coincidencia semántica multi-positivo). También incluye resultados en conjuntos externos (SyntecReranking, AlloprofReranking, MIRACL-fr). Se comparan el modelo padre (parent Distil) y este modelo.

| Split | Métrica | Parent Distil | Este modelo |
|---|---|---|---|
| pharmacy_dev (N=627) | RAW P@1 | 0.761 | 0.797 |
| pharmacy_dev | SEMANTIC P@1 | 0.809 | **0.884** |
| pharmacy_dev (sustitución) | SEMANTIC P@1 | 0.449 | **0.936** |
| pharmacy_final_holdout (N=157) | RAW P@1 | 0.834 | 0.873 |
| pharmacy_final_holdout | SEMANTIC P@1 | 0.860 | **0.917** |
| SyntecReranking | MAP | 0.784 | **0.792** |
| AlloprofReranking | MAP@1000 | 0.5810 | 0.5811 |
| MIRACL-fr | nDCG@10 | 0.469 | 0.447 |

El análisis de bootstrap pareado (10k muestras, seed 42) sobre el holdout semántico muestra una diferencia de +0.057 con un intervalo de confianza del 95% [0.006, 0.115] que excluye el cero, indicando una mejora estadísticamente significativa. Sin embargo, en MIRACL-fr el modelo pierde ligeramente frente al padre (−0.022 nDCG@10), lo que sugiere una especialización que no se generaliza a dominios generales.

## Requisitos de hardware

- Al ser un modelo de ~68M parámetros, la inferencia es viable en CPU. La model card indica explícitamente que es "CPU-friendly".
- VRAM estimada: con precisión fp32, los pesos ocupan aproximadamente 272 MB; en la práctica, con batch pequeño y secuencias de hasta 256 tokens, se puede ejecutar en GPUs con 2 GB o menos.
- GPUs recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, o incluso integradas con soporte CUDA). Para despliegue en producción, una T4 o V100 es más que suficiente.
- Opciones de despliegue: compatible con `transformers` (PyTorch), `sentence_transformers` (CrossEncoder), y `text-embeddings-inference` (TEI) según los tags del repositorio. También puede servirse con `vLLM` o `TGI` si se adapta, aunque al ser un modelo de clasificación, lo más común es usar TEI o una API propia con FastAPI.
- Latencia y throughput: no se proporcionan datos oficiales, pero por el tamaño del modelo, en CPU se esperan latencias de decenas de milisegundos por par; en GPU, del orden de 1-5 ms por par con batch.

## Comparativa con modelos similares

El modelo se compara directamente con su padre, `antoinelouis/crossencoder-distilcamembert-mmarcoFR`, que es un cross-encoder generalista para francés. También existe `ymelka/camembert-med-reranker-v2-distil`, otro modelo del mismo autor, pero no se dispone de detalles suficientes para una comparación cuantitativa. A continuación se muestra una comparativa con el padre y con un cross-encoder genérico de referencia (no disponible en la información proporcionada, por lo que se indica).

| Modelo | Parámetros | Contexto | Licencia | Especialización | Rendimiento en farmacia (SEMANTIC P@1 dev) |
|---|---|---|---|---|---|
| `ymelka/camembert-pharmacy-reranker-distil` | 68M | 256 | MIT | Farmacia (BDPM) | 0.884 |
| `antoinelouis/crossencoder-distilcamembert-mmarcoFR` | 68M | 256 | MIT | Generalista francés (mMARCO) | 0.809 |
| Otros cross-encoders franceses | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa muestra que la especialización en farmacia aporta una mejora sustancial en el dominio objetivo, a costa de una ligera pérdida en tareas generales (MIRACL-fr).

## Limitaciones y advertencias

- No es un reranker médico universal: está entrenado exclusivamente con datos de BDPM y no cubre dominios como contraindicaciones, interacciones, embarazo, función renal o hepática (no validados por falta de datos).
- El holdout de evaluación es de consultas y slates no vistos, pero no de entidades de medicamentos no vistas (hay solapamiento de grupos genéricos entre entrenamiento y holdout, 69/92 grupos CIS_GENER).
- Algunas métricas de benchmark se basan en atajos léxicos (indicación, efecto adverso, partes de identidad del fármaco), lo que puede sobreestimar el rendimiento real.
- En MIRACL-fr, el modelo pierde precisión frente al padre (−0.022 nDCG@10), lo que indica que no es adecuado para tareas de reranking general en francés.
- No debe utilizarse como sistema de decisión clínica; es una herramienta de apoyo para búsqueda y recuperación de información.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento (BDPM) están bajo Licence Ouverte / CADA, lo que requiere citar la fuente original.
- No se han publicado resultados de benchmarks en otros conjuntos de datos médicos (p. ej., PARHAF, medical-QCM), por lo que su rendimiento fuera del dominio farmacéutico es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ymelka/camembert-pharmacy-reranker-distil
- Modelo padre: https://huggingface.co/antoinelouis/crossencoder-distilcamembert-mmarcoFR
- Backbone DistilCamemBERT: https://huggingface.co/cmarkea/distilcamembert-base
- Base de datos pública de medicamentos (BDPM): https://base-donnees-publique.medicaments.gouv.fr/
- Documentación de CamemBERT en Transformers: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/camembert.md
