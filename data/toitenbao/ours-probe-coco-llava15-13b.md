# ToiTenBao/ours-probe-coco-llava15-13b

## Resumen

Ours-Probe es un artefacto de investigación publicado por el usuario ToiTenBao que no es un modelo generativo, sino un conjunto de sondas (*probes*) de detección de alucinación de objetos entrenadas sobre las activaciones internas de LLaVA-1.5-13B. Concretamente, el repositorio contiene cabezas de clasificación ajustadas sobre las características del decodificador del modelo base para decidir si un objeto mencionado en una respuesta del modelo está realmente presente en la imagen. Se publican tres semillas de entrenamiento independientes (0, 42 y 1337) y se advierte explícitamente de que no deben combinarse en un *ensemble*.

El corpus de entrenamiento se construyó sobre 10.000 imágenes de COCO train2014, divididas 80/20 por imagen: 8.000 imágenes con 54.253 *spans* de objeto para entrenamiento y 2.000 imágenes con 13.789 *spans* para validación (*holdout*). Las descripciones que alimentan el corpus son generadas por el propio LLaVA-1.5-13B, de modo que este corpus no es el mismo que el de la variante de 7B. La geometría interna relevante es 40 capas de decodificador, dimensión oculta 5120 y 40 cabezas de atención, con una rejilla visual de 24 x 24 parches.

La relevancia del artefacto es acotada pero clara: la alucinación de objetos es uno de los fallos más costosos en sistemas multimodales en producción, y este paquete ofrece sondas ya entrenadas con umbrales congelados y seleccionados sobre la partición de validación de COCO. Los resultados principales reportados son un AUROC de 0,9561 ± 0,0024 en el *holdout* de test de COCO (vista de mención, n=13.787, 16,19 % positivos) y una degradación notable en evaluación cero-disparo sobre AMBER (AUROC 0,8878 pero F1 0,3539) y POPE-Adversarial (AUROC 0,7995).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sondas de verificacion ajustadas sobre las activaciones del decodificador de LLaVA-1.5-13B (modelo base: transformer decoder-only con encoder visual CLIP ViT-L/14-336) |
| Parametros totales | No disponible para las sondas; el modelo base tiene 13B (40 capas, hidden 5120, 40 cabezas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (no documentada para las sondas) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repositorio contiene `checkpoints/`, caches de caracteristicas y ficheros JSON de metadatos) |
| Capas con sonda | 10, 15, 20, 25 y 30 del decodificador |
| Capa de referencia TruthPrInt | 20 |
| Rejilla de parches visuales | 24 x 24 |
| Semillas | 0, 42, 1337 (independientes; no se deben combinar) |
| Tamano del repositorio | 4,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-16 |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo desde cero ni hace *fine-tuning* del modelo multimodal base. Se ajustan dos cabezas de verificación a partir de una misma caché de características: `probe_verify_raw_*` opera sobre `h(image)` y `probe_verify_contrast_*` opera sobre `h(image) - h(no image)`. Todas las métricas publicadas corresponden a la cabeza *raw*, y el fichero `metadata/thresholds.json` registra el campo `ours_mode`; si en el momento del *scoring* se pasa un modo distinto al que generó el umbral, los umbrales dejan de ser aplicables. Las sondas se extraen de las capas 10, 15, 20, 25 y 30 del decodificador de 40 capas.

Los datos de entrenamiento proceden de 10.000 imágenes de COCO train2014 con descripciones generadas por el propio LLaVA-1.5-13B, lo que da 8.000 imágenes y 54.253 *spans* de objeto en entrenamiento y 2.000 imágenes y 13.789 *spans* en *holdout*. Los umbrales se seleccionan por mejor F1 sobre la partición de validación de COCO y después se congelan; no se ajusta nada sobre el *holdout* de test, AMBER ni POPE. Los umbrales de mejor F1 en validación para las semillas 0, 42 y 1337 son 0,59176, 0,66603 y 0,72769 respectivamente, lo que refleja una variabilidad apreciable entre semillas. El repositorio incluye además cachés de características para COCO (`train` y `holdout`), AMBER por semilla y POPE-Adversarial, junto con `metadata/model_profile.json`, `metadata/thresholds.json` y `metadata/manifest.json` para trazabilidad y procedencia.

## Capacidades

- Deteccion de alucinacion de objetos: clasifica pares (imagen, mencion de objeto) en positivos o negativos, es decir, decide si un objeto mencionado por el modelo está presente en la imagen.
- Verificacion a nivel de mencion: el protocolo reportado es la "vista de mención", con 13.787 ejemplos y 16,19 % de positivos en el *holdout* de test de COCO.
- Dos modos de puntuacion: cabezas *raw* (`h(image)`) y de contraste (`h(image) - h(no image)`), ambas ajustadas sobre la misma caché.
- Replicabilidad estadistica: tres semillas independientes permiten estimar la varianza de las métricas (media ± desviación estándar publicada).
- Generalizacion cero-disparo: se reportan resultados sin reajuste de umbrales sobre AMBER y POPE-Adversarial.
- Trazabilidad: incluye perfiles de modelo y manifiestos para validar que la caché corresponde al modelo base esperado.
- No dispone de generacion de texto, razonamiento general, codigo, matematicas, tool calling, capacidades de agente ni multimodalidad de salida. Es un componente de diagnostico, no un asistente.

## Casos de uso

- Auditoria de respuestas de LLaVA-1.5-13B en produccion: insertar la sonda como capa de verificacion posterior a la generacion para marcar objetos mencionados que no aparecen en la imagen, reduciendo falsos positivos antes de mostrar la respuesta al usuario.
- Filtrado de datos sinteticos de captioning: usar `probe_verify_raw_*` para descartar descripciones generadas automaticamente que contengan objetos inexistentes, antes de reutilizarlas en un pipeline de entrenamiento.
- Monitorizacion de sesgos de mencion: medir de forma sistematica que categorias de objeto tienden a ser alucinadas por el modelo base y en que condiciones, a partir de la distribucion de puntuaciones.
- Comparacion de variantes del modelo base: al estar las sondas atadas a una geometria concreta (40 capas, hidden 5120, rejilla 24 x 24), sirven para verificar si un *checkpoint* candidato mantiene el mismo comportamiento de hallucination que el modelo de referencia.
- Control de calidad en pipelines de anotacion asistida por IA: la sonda actua como verificador barato (una pasada de clasificacion sobre caracteristicas ya extraidas) frente a una revision humana completa.
- Investigacion en interpretabilidad: la existencia de sondas en cinco capas distintas (10, 15, 20, 25, 30) y de una capa de referencia TruthPrInt en la 20 permite estudiar en qué profundidad se codifica la veracidad de la mencion de objeto.
- Reproduccion de experimentos: las tres semillas y los ficheros de umbrales permiten replicar exactamente los numeros publicados y cuantificar la incertidumbre por inicializacion.

## Benchmarks y rendimiento

Resultados publicados como media ± desviacion estandar sobre las tres semillas. Los umbrales se seleccionan por mejor F1 en la particion de validacion de COCO y se congelan.

COCO test holdout (vista de mencion, n=13.787, 16,19 % positivos):

| AUROC | AUPRC | ACC | F1 |
|---|---|---|---|
| 0,9561 ± 0,0024 | 0,8052 ± 0,0117 | 0,9081 ± 0,0051 | 0,7474 ± 0,0075 |

AMBER, cero-disparo estricto (n=2.367 filas / 977 imagenes, 5,37 % positivos, umbrales de COCO congelados):

| AUROC | AUPRC | ACC | F1 |
|---|---|---|---|
| 0,8878 ± 0,0178 | 0,3102 ± 0,0764 | 0,8407 ± 0,0387 | 0,3539 ± 0,0549 |

POPE-Adversarial, cero-disparo (n=3.000, 18,9 % positivos):

| AUROC | AUPRC |
|---|---|
| 0,7995 ± 0,0060 | 0,5253 ± 0,0036 |

Nota metodologica del autor: el universo de objetos de AMBER es el conjunto `(imagen, sustantivo)` etiquetado por humanos; los sustantivos que el modelo 13B menciona y que no tienen etiqueta AMBER no se puntuan (2.367 de 3.350 pares candidatos coincidieron).

## Requisitos de hardware

- El modelo base LLaVA-1.5-13B requiere aproximadamente 26 GB de VRAM en FP16 para inferencia completa; las sondas en si anaden un coste despreciable (clasificadores sobre caracteristicas ya extraidas).
- GPU recomendadas para el modelo base en FP16: A100 40 GB, H100, L40S 48 GB, A6000 48 GB.
- En GPU de consumo: RTX 4090 o RTX 3090 (24 GB) permiten ejecutar el modelo base solo con cuantizacion (por ejemplo 8 bits o 4 bits); en FP16 no cabe con margen.
- Las cabezas de sonda pueden ejecutarse en CPU una vez extraidas las caracteristicas, pero la extraccion de caracteristicas exige cargar el modelo base completo en la precision original.
- Almacenamiento: 4,1 GB de repositorio (checkpoints, caches de COCO, AMBER y POPE-Adversarial y metadatos); conviene prever espacio adicional para las caracteristicas intermedias.
- Opciones de despliegue: PyTorch con `transformers` y las utilidades de `llava-hf` para la extraccion de activaciones; vLLM o TGI pueden servir el modelo base para generacion, pero la sonda necesita acceso a las activaciones de las capas 10, 15, 20, 25 y 30, por lo que los *runtimes* que no exponen estados ocultos (por ejemplo llama.cpp, Ollama o una API cerrada) no son validos para el *scoring*.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo.
- Antes de usar los artefactos hay que comparar `metadata/model_profile.json` con la salida de `model_workflow.sh show-profile`; una discrepancia implica reconstruir la cache.

## Comparativa con modelos similares

| Sistema | Base | Capas sondeadas | AUROC (COCO) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ours-Probe COCO (13B) | LLaVA-1.5-13B | 10, 15, 20, 25, 30 | 0,9561 ± 0,0024 | No disponible | Repositorio publico, 0 descargas |
| Ours-Probe 7B (release citada en la model card) | LLaVA-1.5-7B | No disponible | No disponible (el autor indica que no es intercambiable con el 13B) | No disponible | Referenciado en la model card |
| TruthPrInt (capa 20, metodo de referencia) | LLaVA-1.5-13B | 20 | No disponible | No disponible | Referenciado como capa en la model card |
| POPE / AMBER | No son modelos, son benchmarks de evaluacion de alucinacion | No aplica | No aplica | No disponible | Usados como conjuntos de evaluacion cero-disparo |

No se dispone de comparaciones numericas directas frente a otros detectores de alucinacion de objetos en la informacion proporcionada. La propia model card advierte que las sondas de 7B y 13B no son intercambiables porque las caracteristicas, la geometria y los umbrales son especificos de cada modelo.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce una puntuacion de verificacion sobre caracteristicas del modelo base; no puede responder preguntas ni mantener conversaciones.
- Dependencia estricta del modelo base: las sondas estan atadas a LLaVA-1.5-13B con la geometria declarada (40 capas, hidden 5120, 40 cabezas, rejilla 24 x 24). Cualquier cambio de *checkpoint* invalida la cache y los umbrales.
- Degradacion fuerte en cero-disparo: el F1 en AMBER cae a 0,3539 ± 0,0549 pese al AUROC de 0,8878, lo que indica un desajuste severo de umbral fuera del dominio COCO. El AUPRC de AMBER (0,3102) es bajo por la baja prevalencia de positivos (5,37 %).
- Umbrales especificos por semilla y por modo: usar el modo *raw* con umbrales de contraste (o al reves) invalida por completo las metricas publicadas.
- Las semillas no deben combinarse en un *ensemble*; el autor lo desaconseja explicitamente.
- Ambito limitado a objetos: no cubre alucinaciones de atributos, relaciones, acciones, numeros ni texto.
- Cobertura parcial en AMBER: 2.367 de 3.350 pares candidatos coincidieron; los sustantivos sin etiqueta humana no se puntuan, lo que sesga las metricas hacia el universo etiquetado.
- El corpus de captions lo genera el propio modelo de 13B, de modo que hereda sus sesgos de mencion y su vocabulario.
- Idiomas soportados: no disponible. El corpus se basa en COCO, con descripciones generadas por el modelo base; no hay evaluacion multilingue publicada.
- Licencia: no disponible. No se puede asumir uso comercial sin confirmacion del autor.
- Riesgo de alucinacion del propio detector: es un clasificador estadistico sobre caracteristicas internas; no hay garantia de calibracion fuera de los dominios evaluados.
- Madurez y validacion externa: 0 descargas y 0 likes; no hay evidencia de uso independiente ni de replicacion por terceros.
- Incoherencia de metadatos: las fechas de creacion y actualizacion del repositorio (2026-09-16) no coinciden con la practica habitual de publicacion e impiden datar la version de forma fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ToiTenBao/ours-probe-coco-llava15-13b
- Modelo base referenciado en la model card: `llava-hf/llava-1.5-13b-hf` (https://huggingface.co/llava-hf/llava-1.5-13b-hf)
- Benchmarks citados en la model card: COCO (validacion y *holdout* de test), AMBER y POPE-Adversarial. No se proporcionan URLs ni referencias bibliograficas en la informacion disponible.
- La busqueda web realizada no devolvio resultados relevantes para este modelo (los enlaces recuperados corresponden a foros de operadores de telefonia y a contenidos sobre relaciones laborales en aleman, sin relacion con el artefacto).
