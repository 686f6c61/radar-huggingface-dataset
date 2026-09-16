# ToiTenBao/dhcp-ours-coco-llava15-13b

## Resumen

DHCP (ToiTenBao/dhcp-ours-coco-llava15-13b) no es un modelo generativo, sino una **sonda de deteccion de alucinacion de objetos** entrenada sobre las representaciones internas de LLaVA-1.5-13B. El repositorio contiene, para tres semillas de entrenamiento independientes (0, 42 y 1337), los checkpoints de la sonda, las caches de caracteristicas extraidas sobre un corpus COCO y los metadatos de perfil y umbrales. Su funcion es puntuar pares (imagen, sustantivo) y decidir si el modelo base menciona un objeto que no esta presente en la imagen.

El modelo base es `llava-hf/llava-1.5-13b-hf`, con 40 capas de decoder, dimension oculta de 5120 y 40 cabezas de atencion. La sonda lee caracteristicas en las capas 10, 15, 20, 25 y 30, y utiliza la capa 20 como capa TruthPrInt. El corpus de entrenamiento consta de 10.000 imagenes COCO train2014 divididas 80/20 por imagen: 8.000 imagenes de entrenamiento con 54.253 spans de objeto y 2.000 de holdout con 13.789 spans.

Su relevancia es acotada pero concreta: es un artefacto de investigacion para medir y estudiar la alucinacion de objetos en un VLM concreto, con resultados reproducibles en COCO, AMBER y POPE-Adversarial. El repositorio ocupa 146,7 GB y no incluye decodificador de inferencia, por lo que aparece unicamente en tablas de deteccion y no ofrece umbral de mitigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de deteccion sobre decoder transformer (modelo base LLaVA-1.5-13B); no es una arquitectura generativa propia |
| Parametros totales | Modelo base: 13B (LLaVA-1.5-13B). Parametros de la sonda: no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no especificado en la informacion proporcionada) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene `checkpoints/`, `cache/` y `metadata/`; no se detalla el formato) |
| Modelo base | llava-hf/llava-1.5-13b-hf |
| Capas del decoder / dimension oculta / cabezas | 40 / 5120 / 40 |
| Rejilla de parches de vision | 24 x 24 |
| Capas de sonda (probe layers) | 10, 15, 20, 25, 30 |
| Capa TruthPrInt | 20 |
| Semillas de entrenamiento | 0, 42, 1337 (independientes; no se deben combinar en ensemble) |
| Tamano del repositorio | 146,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |

## Arquitectura y entrenamiento

La pieza entrenada es una sonda que opera sobre las activaciones internas de LLaVA-1.5-13B. Se extraen caracteristicas en cinco capas del decoder (10, 15, 20, 25 y 30) con una rejilla de parches de vision de 24 x 24, y la capa 20 actua como capa TruthPrInt. El modelo base conserva su configuracion original de 40 capas, 5120 de dimension oculta y 40 cabezas de atencion. No se documenta en la informacion disponible ningun cambio en la arquitectura del VLM subyacente ni el tipo exacto de clasificador de la sonda.

El entrenamiento se realiza sobre un corpus derivado de COCO train2014: 10.000 imagenes divididas 80/20 por imagen, con 8.000 imagenes y 54.253 spans de objeto para entrenamiento y 2.000 imagenes y 13.789 spans para holdout. Un detalle metodologico relevante es que las leyendas del corpus son generadas por el propio modelo de 13B, de modo que este corpus no es el del release de 7B y ambos artefactos no son intercambiables: caracteristicas, geometria y umbrales son especificos de cada tamano. Los umbrales se seleccionan por mejor F1 sobre el split de validacion de COCO y despues se congelan, sin ajuste sobre el holdout de test, AMBER ni POPE. Se publican tres semillas independientes con el objetivo de medir varianza; no se documenta uso de RLHF ni DPO, dado que no se entrena un modelo generativo.

## Capacidades

- Deteccion binaria de alucinacion de objetos: clasifica pares (imagen, sustantivo) como mencion presente o alucinada.
- Extraccion de caracteristicas internas de LLaVA-1.5-13B en las capas 10, 15, 20, 25 y 30, reutilizables como cache.
- Puntuacion calibrada mediante umbrales seleccionados por F1 sobre validacion de COCO y congelados por semilla.
- Evaluacion zero-shot sobre corpus externos con umbrales congelados (AMBER y POPE-Adversarial).
- Analisis de variabilidad entre semillas, al publicarse tres entrenamientos independientes con sus metricas y desviaciones.
- Verificacion de integridad del perfil del modelo mediante `metadata/model_profile.json` y `model_workflow.sh show-profile`.
- No ofrece generacion de texto, razonamiento, codigo, matematicas ni capacidades multimodales propias.
- No dispone de tool calling, function calling, soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision o audio) del artefacto.

## Casos de uso

- Auditoria de alucinacion en pipelines de captioning con LLaVA-1.5-13B: aplicar la sonda sobre las caracteristicas internas del modelo base para marcar sustantivos mencionados que no aparecen en la imagen, usando los umbrales congelados por semilla.
- Investigacion en interpretabilidad de representaciones: comparar el poder discriminativo de las capas 10, 15, 20, 25 y 30 para localizar en que profundidad se codifica la presencia real de objetos, con la capa 20 como referencia TruthPrInt.
- Reproducibilidad de experimentos: replicar resultados con las tres semillas publicadas y reportar media y desviacion tipica, evitando el ensemble porque las semillas son independientes.
- Reutilizacion de caches de caracteristicas: emplear `cache/coco/{train,holdout}`, `cache/amber/seed*` y `cache/pope_adversarial/` para entrenar o validar clasificadores alternativos sin recalcular las activaciones del modelo de 13B.
- Evaluacion comparativa de VLMs: usar los protocolos y umbrales congelados sobre AMBER y POPE-Adversarial como referencia para contrastar otros modelos o variantes del mismo tamano.
- Filtrado previo de datos anotados: descartar pares (imagen, sustantivo) con alta probabilidad de ser mencion alucinada antes de incorporarlos a un conjunto de entrenamiento o validacion.
- Analisis de robustez frente a adversariales: medir el comportamiento de la sonda en POPE-Adversarial para detectar escenarios donde la deteccion se degrada hasta niveles cercanos al azar.
- Diagnostico de calidad en sistemas de descripcion de imagenes: integrar la puntuacion de la sonda como senal de alerta en revisiones manuales, teniendo en cuenta que el repositorio no incluye decodificador de mitigacion.

## Benchmarks y rendimiento

Resultados publicados por el autor, con media y desviacion tipica sobre las tres semillas. Los umbrales se seleccionan por mejor F1 en validacion de COCO y se congelan antes de evaluar en test, AMBER y POPE.

| Conjunto | n | Positivos | AUROC | AUPRC | ACC | F1 |
|---|---|---|---|---|---|---|
| COCO test holdout (vista de menciones) | 13.787 | 16,19 % | 0,7037 +/- 0,0011 | 0,2879 +/- 0,0019 | 0,6583 +/- 0,0352 | 0,3734 +/- 0,0010 |
| AMBER (zero-shot estricto) | 2.367 filas / 977 imagenes | 5,37 % | 0,7356 +/- 0,0066 | 0,1599 +/- 0,0168 | 0,8778 +/- 0,0140 | 0,2464 +/- 0,0230 |
| POPE-Adversarial (zero-shot) | 3.000 | 18,9 % | 0,5282 +/- 0,0072 | 0,2070 +/- 0,0060 | no disponible | no disponible |

Notas metodologicas declaradas por el autor: en AMBER el universo de objetos es el conjunto `(imagen, sustantivo)` anotado por humanos, de modo que los sustantivos que menciona el modelo de 13B y no tienen etiqueta AMBER no se puntuan (se emparejaron 2.367 de 3.350 pares candidatos). En COCO, el holdout de test tiene 13.787 casos tras el filtrado. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no corresponden a este tipo de artefacto.

## Requisitos de hardware

- Almacenamiento: 146,7 GB para el repositorio completo, que incluye checkpoints por semilla y caches de caracteristicas de COCO, AMBER y POPE-Adversarial.
- VRAM para inferencia de la sonda: la sonda es ligera, pero requiere cargar LLaVA-1.5-13B para extraer caracteristicas. Estimacion estandar para un modelo de 13B: en torno a 26 GB en fp16, 13-14 GB en int8 y 8-9 GB en 4 bits. Son estimaciones derivadas del tamano del modelo base, no datos publicados.
- GPU recomendadas: para el modelo base en fp16, A100 40 GB, H100 80 GB o A6000 48 GB. Para cuantizacion de 4 bits, tarjetas consumer de 12-16 GB de VRAM pueden ser suficientes para el modelo base, aunque el consumo real no esta documentado.
- Compatibilidad con GPU consumer: probable en configuraciones cuantizadas de 4 bits; no confirmado en la informacion disponible.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El autor indica que el repositorio no incluye decodificador de inferencia y que el flujo de trabajo se gestiona mediante `model_workflow.sh`, comparando `metadata/model_profile.json` con `show-profile`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de fichas tecnicas de sondas comparables en la informacion proporcionada. La unica comparacion documentada es con el release de 7B de la misma familia DHCP, que el autor declara explicitamente no intercambiable.

| Artefacto | Modelo base | Capas de sonda | Corpus | Semillas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DHCP COCO LLaVA-1.5-13B (este) | llava-hf/llava-1.5-13b-hf | 10, 15, 20, 25, 30 | COCO train2014, 10.000 imagenes, leyendas generadas por el 13B | 0, 42, 1337 | no disponible | HuggingFace, 0 descargas |
| DHCP release de 7B | LLaVA-1.5-7B | especificas del 7B | corpus propio del 7B | no disponible en esta informacion | no disponible | release separado |
| Otras sondas de alucinacion (POPE, AMBER y similares) | no disponible | no disponible | no disponible | no disponible | no disponible | solo como conjuntos de evaluacion en esta informacion |

## Limitaciones y advertencias

- No es un modelo de generacion: el repositorio no incluye decodificador de inferencia, por lo que solo sirve para deteccion y no puede emplearse directamente como chatbot ni como API de texto.
- No ofrece umbral de mitigacion asociado; los umbrales publicados son para deteccion, no para corregir la salida del VLM.
- Rendimiento cercano al azar en POPE-Adversarial: AUROC de 0,5282 +/- 0,0072, lo que limita su utilidad en escenarios adversariales.
- AUPRC y F1 bajos en todos los conjuntos (F1 de 0,3734 en COCO y 0,2464 en AMBER), condicionados por el desbalance de clases (16,19 % y 5,37 % de positivos respectivamente).
- Los umbrales se seleccionan en validacion de COCO y se congelan; el traslado a otros dominios o idiomas puede degradar el rendimiento.
- Corpus con leyendas autogeneradas por el propio modelo de 13B, lo que introduce un posible sesgo autorreferencial en las etiquetas.
- Sesgos heredados de COCO: imagenes y anotaciones con predominio de escenas urbanas occidentales y sustantivos en ingles; no se documenta comportamiento multilingue.
- Las tres semillas son independientes y el autor advierte explicitamente de que no deben combinarse en ensemble.
- Caracteristicas, geometria y umbrales son especificos del modelo de 13B; una discrepancia entre `metadata/model_profile.json` y `show-profile` invalida la cache y obliga a reconstruirla.
- En AMBER solo se puntuan 2.367 de 3.350 pares candidatos, lo que afecta a la comparabilidad de las metricas.
- Licencia no declarada, lo que impide confirmar si el uso comercial esta permitido tanto de la sonda como de las caches derivadas.
- Riesgo de falso negativo: la sonda puede no detectar alucinaciones cuya mencion no encaje en el universo de objetos evaluado, como ocurre con los sustantivos sin etiqueta AMBER.

## Enlaces

- HuggingFace: https://huggingface.co/ToiTenBao/dhcp-ours-coco-llava15-13b
- Modelo base: https://huggingface.co/llava-hf/llava-1.5-13b-hf
- Papers, blogs, repositorios o demos adicionales: no disponible (los resultados de busqueda web no aportaron enlaces relevantes al modelo)
