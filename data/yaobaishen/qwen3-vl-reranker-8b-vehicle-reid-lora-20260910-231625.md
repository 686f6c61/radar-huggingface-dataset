# yaobaishen/Qwen3-VL-Reranker-8B-vehicle-reid-lora-20260910-231625

## Resumen

Este modelo es un adaptador LoRA de tipo cross-encoder publicado por el usuario `yaobaishen`, obtenido al afinar el modelo multimodal Qwen/Qwen3-VL-Reranker-8B con la libreria sentence-transformers. Su funcion no es generar texto, sino puntuar pares de entradas (imagen-imagen, texto-imagen o mensaje estructurado) para reordenar resultados de busqueda semantica. El ajuste esta especializado en re-identificacion de vehiculos (vehicle re-identification) con negativos dificiles, un escenario en el que dos vehiculos distintos del mismo modelo y color deben separarse correctamente.

El modelo hereda la arquitectura Qwen3VLForConditionalGeneration de 8B parametros del modelo base, sobre la que se anade una cabeza de puntuacion LogitScore que lee los logits de dos tokens concretos (9693 y 2152) para producir una puntuacion escalar unica. La longitud de secuencia maxima declarada es de 262144 tokens y admite cuatro modalidades: texto, imagen, video y mensaje estructurado. El entrenamiento se realizo sobre un conjunto de 281351 ejemplos con perdida BinaryCrossEntropyLoss.

Su relevancia es doble. Por un lado, demuestra como adaptar un reranker multimodal grande a un dominio vertical con un adaptador ligero de 0,2 GB. Por otro, publica metricas muy altas en su conjunto de evaluacion propio (MAP 0,9762, MRR@10 0,9875, nDCG@10 0,9793), aunque el propio autor no las ha marcado como verificadas y no hay informacion publica sobre como se construyo dicho conjunto de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre transformer decoder-only multimodal (`Qwen3VLForConditionalGeneration`) con cabeza de puntuacion `LogitScore` sobre los tokens 9693 y 2152 |
| Parametros totales | 8B en el modelo base Qwen/Qwen3-VL-Reranker-8B; el adaptador LoRA publicado ocupa 0,2 GB (recuento exacto de parametros del adaptador: no disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262144 tokens (secuencia maxima declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA sobre el modelo base) |
| Modalidades | texto, imagen, video, mensaje estructurado |
| Etiquetas de salida | 1 |
| Tarea (pipeline) | text-ranking (cross-encoder reranking) |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | 281351 ejemplos (composicion no disponible) |
| Perdida de entrenamiento | BinaryCrossEntropyLoss |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder multimodal. El bloque `Transformer` del modelo base procesa conjuntamente las dos entradas del par (por ejemplo, dos imagenes o una consulta y un candidato) y expone los logits causales. Sobre ellos, el modulo `LogitScore` compara los logits asociados al token 9693 (respuesta afirmativa) y al token 2152 (respuesta negativa) para producir una puntuacion escalar por par. La plantilla de chat utilizada es la especifica de reranker (`chat_template: reranker`, con `add_generation_prompt: True`), lo que permite reutilizar el modelo generativo como clasificador de relevancia sin anadir cabezas nuevas.

El ajuste se realizo con la libreria sentence-transformers mediante LoRA sobre el modelo base Qwen/Qwen3-VL-Reranker-8B (revision `b212dc8c91a8164aef1ea2de9c1a867611e75c04`). El conjunto de entrenamiento contiene 281351 ejemplos y se organizo en torno a negativos dificiles de re-identificacion de vehiculos, es decir, candidatos visualmente muy similares al positivo correcto. La funcion de perdida declarada es BinaryCrossEntropyLoss. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la duracion del entrenamiento, la configuracion de hiperparametros ni si se aplicaron fases adicionales de RLHF o DPO. Tampoco se detalla el rango y los modulos objetivo del adaptador LoRA.

## Capacidades

- Puntuacion de pares de entradas multimodales (texto, imagen, video y mensaje estructurado) para reordenar resultados.
- Re-identificacion de vehiculos: distingue instancias concretas del mismo modelo y color a partir de negativos dificiles.
- Busqueda semantica multimodal con reordenacion fina de los candidatos devueltos por un recuperador previo.
- Ranking de listas de candidatos frente a una consulta unica mediante los metodos `predict` y `rank` de sentence-transformers.
- Soporte de contexto muy largo (hasta 262144 tokens), util para concatenar descripciones, metadatos o secuencias de video extensas.
- Capacidad de razonamiento visual heredada del modelo base Qwen3-VL-Reranker-8B (evaluacion conjunta de imagen y texto).
- No soporta, en su configuracion actual, generacion libre de texto como tarea principal: la cabeza de salida esta reducida a una puntuacion escalar.
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (`en`), aunque el modelo base podria conservar parte de las capacidades multilingues originales; no hay datos que lo confirmen.

## Casos de uso

- Re-identificacion de vehiculos en videovigilancia: dada una imagen de un vehiculo captada en un punto de la via, reordenar los candidatos extraidos de otras camaras y quedarse con el positivo correcto, separando falsos positivos del mismo modelo y color.
- Peajes y control de accesos: verificar que dos capturas de pasos distintos corresponden al mismo vehiculo antes de emitir una alerta o consolidar una lectura de matricula.
- Gestion de flotas: asociar imagenes de entrada y salida de un aparcamiento o de una estacion de carga al mismo vehiculo sin depender de la matricula.
- Peritaje de seguros: cotejar fotografias aportadas por el asegurado con imagenes previas del vehiculo siniestrado para detectar suplantaciones o partes no declaradas.
- Comercio de vehiculos de segunda mano: ordenar el catalogo de anuncios segun la similitud visual con la consulta de un usuario y priorizar las coincidencias mas fieles.
- Reordenacion de resultados en buscadores internos: dado un recuperador rapido (embeddings o BM25), aplicar este cross-encoder como segunda etapa para mejorar las metricas de ordenacion final.
- Analisis forense de grabaciones: dado un fotograma de referencia, ordenar cronologicamente los fotogramas mas probables de contener el mismo vehiculo en un archivo extenso.
- Investigacion en vision por computador: servir como linea base de reordenacion multimodal en tareas de re-identificacion de vehiculos y comparar contra modelos entrenados de cero.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card. Ninguna de las metricas esta marcada como verificada (`verified: false`).

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Cross Encoder Reranking | vehicle reid eval hard | MAP | 0,9762 | No |
| Cross Encoder Reranking | vehicle reid eval hard | MRR@10 | 0,9875 | No |
| Cross Encoder Reranking | vehicle reid eval hard | nDCG@10 | 0,9793 | No |

No se han publicado resultados de benchmarks en la informacion disponible para tareas generales (MMLU, HumanEval, GSM8K, MTEB u otros conjuntos estandar). Tampoco se detalla el tamano del conjunto `vehicle reid eval hard`, su composicion ni el protocolo de evaluacion, por lo que los valores deben interpretarse como resultados del autor en su propio conjunto.

## Requisitos de hardware

Los valores siguientes son estimaciones a partir de los 8B parametros del modelo base; la model card no publica requisitos oficiales.

- VRAM para inferencia en bf16/fp16: en torno a 16-18 GB solo para los pesos, mas memoria para el cache KV, que crece con la longitud de secuencia.
- Contexto largo: usar los 262144 tokens declarados exige tecnicas de atencion eficiente y mucha memoria adicional; en la practica se recomienda limitar la longitud de entrada al caso de uso.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para lotes grandes y contexto largo.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede ejecutar el modelo completo en bf16 con secuencias moderadas; tarjetas de 16 GB o menos necesitarian cuantizacion, no documentada para este adaptador.
- El adaptador LoRA en si ocupa solo 0,2 GB, por lo que el cuello de botella siempre es el modelo base.
- Opciones de despliegue: sentence-transformers (`CrossEncoder`) como via documentada; vLLM o TGI para el modelo base Qwen3-VL si el entorno soporta la arquitectura `Qwen3VLForConditionalGeneration`; llama.cpp u Ollama: no disponible para esta tarea de reranking multimodal.
- Latencia y throughput: no disponible. Al tratarse de un cross-encoder, el coste es lineal con el numero de candidatos, ya que cada par requiere una pasada completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Evaluacion |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Qwen3-VL-Reranker-8B) | 8B en el base + LoRA de 0,2 GB | 262144 tokens | Texto, imagen, video, mensaje | apache-2.0 | MAP 0,9762, MRR@10 0,9875, nDCG@10 0,9793 (no verificados) |
| Qwen/Qwen3-VL-Reranker-8B (modelo base) | 8B | 262144 tokens | Texto, imagen, video, mensaje | apache-2.0 | No disponible para el subconjunto `vehicle reid eval hard` |
| Otros rerankers multimodales o de re-identificacion de vehiculos | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion sustentada por la informacion disponible es con el modelo base: el adaptador anade especializacion en negativos dificiles de vehiculos a cambio de 0,2 GB extra, y mantiene la misma licencia y ventana de contexto. No se han encontrado en la busqueda web modelos comparables con datos verificables.

## Limitaciones y advertencias

- Las metricas publicadas estan marcadas como no verificadas por el autor y proceden de un conjunto de evaluacion propio, previsiblemente en el mismo dominio que el entrenamiento; no garantizan generalizacion a otros dominios.
- Es un adaptador especializado en vehiculos: su uso como reranker de texto general o de imagenes de otras categorias no esta validado.
- Solo se declara soporte de ingles; no hay evidencia de rendimiento multilingue.
- El modelo es discriminativo (una puntuacion escalar), por lo que el riesgo de alucinacion de texto no aplica, pero si el riesgo de falsos positivos cuando dos vehiculos son visualmente casi identicos.
- Las puntuaciones no estan calibradas de forma documentada; no deben interpretarse como probabilidades absolutas sin un analisis previo.
- No hay informacion sobre la composicion del dataset de entrenamiento, los sesgos presentes en el (por ejemplo, camaras, paises, condiciones de iluminacion o tipos de vehiculo sobrerrepresentados) ni sobre posibles sesgos demograficos o geograficos.
- El ejemplo de uso de la model card referencia rutas locales de un NAS privado, por lo que no es reproducible tal cual sin sustituir las rutas.
- Requiere descargar el modelo base de 8B ademas del adaptador; el despliegue no es ligero pese al poco peso del LoRA.
- En usos de videovigilancia y re-identificacion de vehiculos pueden aplicarse restricciones legales de proteccion de datos; la licencia apache-2.0 cubre el uso comercial del software, no el cumplimiento normativo del caso de uso.
- No se documentan los tipos de cuantizacion soportados ni el impacto de cuantizar sobre las metricas declaradas.
- Riesgo de sobreajuste al conjunto de negativos dificiles de vehiculos, con posible degradacion fuera de esa distribucion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yaobaishen/Qwen3-VL-Reranker-8B-vehicle-reid-lora-20260910-231625
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-Reranker-8B
- Documentacion de Sentence Transformers: https://sbert.net
- Documentacion de Cross Encoder: https://www.sbert.net/docs/cross_encoder/usage/usage.html
- Repositorio de Sentence Transformers en GitHub: https://github.com/huggingface/sentence-transformers
- Cross Encoders en HuggingFace: https://huggingface.co/models?library=sentence-transformers&other=cross-encoder
- Paper de referencia Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los presentes en la model card y en los metadatos de HuggingFace.
