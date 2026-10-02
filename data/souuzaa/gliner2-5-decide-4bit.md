# souuzaa/GLiNER2.5-Decide-4bit

## Resumen

GLiNER2.5-Decide-4bit es una conversión a MLX en 4 bits del modelo fastino/GLiNER2.5-Decide, un clasificador guiado por esquemas (schema-driven) de 486.444.053 parámetros según los pesos safetensors, aunque la model card del modelo base lo describe como un modelo de 340M. Se construye sobre un encoder DeBERTa-v3-large más las cabezas GLiNER2, y funciona pasándole un conjunto de etiquetas definido en tiempo de llamada para obtener una decisión en una única pasada hacia delante, sin generar tokens. No es un modelo de lenguaje: no se puede cargar con mlx_lm ni mlx_vlm, sino con el script gliner2_mlx.py incluido en el repositorio.

El modelo original lo desarrolla fastino y está orientado a la toma de decisiones estructurada: evalúa preguntas tipadas definidas por el usuario y decodifica respuestas relacionadas de forma conjunta bajo restricciones explícitas, devolviendo probabilidades, puntuaciones de confianza y metadatos de viabilidad. Esta versión concreta la publica el usuario souuzaa como port a MLX en 4 bits para Apple Silicon, con licencia Apache-2.0.

Su relevancia práctica es que permite ejecutar clasificación zero-shot y extracción de entidades en hardware Apple con una memoria pico de 1,19 GB y una latencia mediana de 117 ms por llamada a predict(), manteniendo en el split de desarrollo de fast-decisions una precisión de 63,7%, idéntica a la referencia fp32, y un 97,2% de respuestas coincidentes con fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder DeBERTa-v3-large + cabezas GLiNER2 (clasificador, count y span) |
| Parametros totales | 486.444.053 (según safetensors); la model card del modelo base indica 340M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX (cuantización afín, group size 64) en encoder; cabezas y embeddings de posición relativa en bfloat16 sin cuantizar |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX); librería mlx |

## Arquitectura y entrenamiento

El modelo combina un encoder DeBERTa-v3-large con las cabezas de GLiNER2 (clasificador, count y span). Es una arquitectura de encoder, no autoregresiva: en lugar de generar tokens, realiza una única pasada hacia delante sobre el texto y las etiquetas y produce directamente las decisiones. Para la conversión a MLX, las capas lineales y los embeddings de palabras se cuantizaron a 4 bits con cuantización afín y group size 64, mientras que las cabezas y los embeddings de posición relativa se mantuvieron en bfloat16 sin cuantizar. Los ficheros del tokenizador se copiaron sin cambios. La conversión se realizó con convert.py (mlx 0.32.3), y los scripts de paridad y evaluación están en el mismo repositorio.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO. La model card del modelo base sí menciona un ajuste fino de clasificación subido en el paso 95500. La innovación destacable es el enfoque de decisión guiada por esquema: se pasa cualquier conjunto de etiquetas en tiempo de llamada —como lista, como diccionario {etiqueta: descripción} o como configuración con labels, multi_label, cls_threshold, prompt, examples y class_act— y se obtiene la decisión sin generación de tokens. Se menciona además que GLiNER2 no tiene límite fijo de longitud de span para la extracción de entidades.

## Capacidades

- Clasificación de texto zero-shot: recibe etiquetas definidas en tiempo de llamada y devuelve la etiqueta aplicable.
- Clasificación multi-etiqueta con umbral configurable mediante cls_threshold.
- Extracción de entidades nombradas (NER) con etiquetas personalizadas, a través de la cabeza de span de GLiNER2.
- Decodificación conjunta de respuestas relacionadas bajo restricciones explícitas, con probabilidades, puntuaciones de confianza y metadatos de viabilidad.
- Soporte de ejemplos few-shot mediante el campo examples de la configuración de tarea.
- Clasificación por lotes con batch_classify_text(texts, tasks, batch_size=8).
- Modo con puntuaciones: include_confidence=True devuelve scores, y model.predict(text, tasks) devuelve la distribución completa de probabilidad de cada tarea.
- No soporta tool calling, function calling, agentes ni multi-step reasoning generativo.
- Capacidades multilingües: solo inglés.
- Capacidades especiales: no hay modo thinking, visión ni audio.

## Casos de uso

- Clasificación de sentimiento y análisis de aspectos en reseñas: el ejemplo de la model card procesa un texto de opinión sobre un portátil y devuelve simultáneamente el sentimiento (positive, negative, mixed, neutral) y los aspectos detectados con multi_label activado y umbral 0,4.
- Enrutamiento de tickets de soporte: dada una consulta y un conjunto de categorías definidas en tiempo de llamada, el modelo asigna la categoría en una sola pasada (117 ms), lo que permite clasificar grandes volúmenes sin coste de generación.
- Extracción de entidades en documentos: con extract_entities se extraen etiquetas como person, product o location de un texto, útil para pipelines de enriquecimiento de datos.
- Etiquetado a escala en pipelines de datos: gracias al procesamiento por lotes (batch_size=8) y a la baja memoria pico (1,19 GB), se puede anotar dataset completos en un portátil Apple Silicon.
- Pre-filtrado en pipelines de LLM: usar el modelo como etapa de decisión rápida y barata antes de invocar un LLM, aprovechando su salida con confianza y probabilidades para decidir si merece la pena el coste de un modelo generativo.
- Moderación o categorización de contenido: clasificar textos de entrada según políticas o taxonomías predefinidas, con umbrales ajustables para controlar la sensibilidad.
- Detección de intenciones en asistentes: clasificar la intención de una consulta frente a una lista de intenciones para derivarla al flujo adecuado.
- Análisis de feedback de producto: combinar sentimiento y aspectos (battery, keyboard, screen, camera, price, support) para generar informes agregados por característica.

## Benchmarks y rendimiento

Datos de la model card, medidos sobre 1700 filas y 2900 cabezas del split dev de fastino/fast-decisions. La precisión es coincidencia exacta a nivel de cabeza promediada sobre 17 dominios; las cabezas multi-etiqueta usan umbral 0,5. La latencia es por llamada a predict() con batch size 1.

| Variante | Tamano | Precision (dev) | Misma respuesta que fp32 | Delta p medio / maximo | Latencia mediana | Memoria pico |
|---|---|---|---|---|---|---|
| fp32 reference | 1,9 GB | 63,7% | — | — | 140 ms | 3,01 GB |
| GLiNER2.5-Decide-bf16 | 973 MB | 63,7% | 99,5% | 0,0025 / 0,038 | 110 ms | 1,67 GB |
| GLiNER2.5-Decide-8bit | 567 MB | 63,8% | 99,6% | 0,0037 / 0,056 | 118 ms | 1,37 GB |
| GLiNER2.5-Decide-4bit | 350 MB | 63,7% | 97,2% | 0,0265 / 0,364 | 117 ms | 1,19 GB |

Advertencia de la propia model card: el benchmark publicado por fastino usa un split de test reservado, por lo que estas precisiones del split dev no son comparables con él. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- Ejecución sobre Apple Silicon mediante MLX; no requiere torch ni CUDA.
- Memoria pico medida para la variante 4 bits: 1,19 GB.
- Tamano de los pesos: 350 MB; tamano del repositorio: 0,4 GB.
- Latencia mediana: 117 ms por llamada a predict() con batch size 1 (frente a 140 ms de la referencia fp32).
- Cabe en cualquier equipo con Apple Silicon; el consumo de memoria es compatible con portátiles de gama media.
- Instalación: pip install mlx tokenizers huggingface_hub.
- Opciones de despliegue: únicamente mediante el script gliner2_mlx.py incluido; no es compatible con vLLM, llama.cpp, Ollama, TGI ni mlx_lm/mlx_vlm, ya que no es un modelo de lenguaje.
- Throughput: no disponible de forma explícita; solo se documenta batch_classify_text con batch_size=8 y la latencia de una llamada individual.

## Comparativa con modelos similares

Comparativa entre la variante 4 bits y las otras conversiones del mismo modelo base, con los datos de la model card.

| Modelo | Parametros | Tamano | Precision (dev) | Misma respuesta que fp32 | Memoria pico | Latencia | Licencia |
|---|---|---|---|---|---|---|---|
| GLiNER2.5-Decide-4bit (este) | 486.444.053 | 350 MB | 63,7% | 97,2% | 1,19 GB | 117 ms | Apache-2.0 |
| GLiNER2.5-Decide-8bit | no disponible | 567 MB | 63,8% | 99,6% | 1,37 GB | 118 ms | Apache-2.0 |
| GLiNER2.5-Decide-bf16 | no disponible | 973 MB | 63,7% | 99,5% | 1,67 GB | 110 ms | Apache-2.0 |
| fp32 reference | no disponible | 1,9 GB | 63,7% | — | 3,01 GB | 140 ms | Apache-2.0 |

Frente a GLiNER2.5 (modelo de extracción de información de la misma familia, orientado a extracción de entidades y relaciones), la información disponible no aporta una comparativa numérica directa. No se dispone de comparaciones con modelos de clasificación zero-shot alternativos en los datos proporcionados.

## Limitaciones y advertencias

- No es un modelo de chat ni un modelo de lenguaje; solo se puede ejecutar con gliner2_mlx.py.
- Alcance limitado a clasificación y extracción de entidades: la extracción de relaciones (extract_relations) y la extracción de JSON estructurado (extract_json) del gliner2 original no están portadas, y tampoco los helpers de fragmentación *_long.
- Código personalizado: el repositorio incluye Python (gliner2_mlx.py) que hay que importar y ejecutar; conviene revisarlo antes de usarlo en entornos sensibles.
- Solo admite inglés como idioma.
- La cuantización 4 bits reduce la fidelidad respecto a fp32: solo un 97,2% de respuestas idénticas a fp32, con un delta de probabilidad máximo de 0,364, muy superior al de las variantes bf16 (0,038) y 8 bits (0,056). Para aplicaciones sensibles a la calibración de probabilidades podría ser preferible la variante de 8 bits.
- Las precisiones reportadas provienen del split dev de fast-decisions y no son comparables con el benchmark publicado sobre el split de test reservado.
- La longitud de contexto no está especificada en la información disponible; hay que verificarla antes de diseñar entradas largas.
- Licencia Apache-2.0, que en principio permite uso comercial, pero se recomienda verificar la licencia y condiciones del modelo base fastino/GLiNER2.5-Decide.
- El repositorio no tiene descargas ni validación por parte de la comunidad, por lo que no hay evidencia externa de robustez en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/souuzaa/GLiNER2.5-Decide-4bit
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Repositorio de conversión (convert.py y scripts de evaluación): https://github.com/souuzaa/gliner2-mlx
- Blog de fastino sobre GLiNER2.5-Decide: https://fastino.ai/blog/gliner-2-5-decide-open-weight-decision-model
- Página de GLiNER2.5 en fastino: https://fastino.ai/models/gliner2-5
- Ficha en Theresanaiforthat: https://theresanaiforthat.com/model/gliner2-5-decide/
- Árbol de ficheros del modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide/tree/main
