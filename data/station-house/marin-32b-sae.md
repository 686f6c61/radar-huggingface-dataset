# Station-house/marin-32b-sae

## Resumen

Station-house/marin-32b-sae no es un modelo generativo, sino un conjunto de autoencoders dispersos (SAE, *sparse autoencoders*) de tipo TopK entrenados sobre las activaciones de las capas MLP del modelo marin-community/marin-32b-base, un transformer denso de 32.000 millones de parametros con arquitectura Qwen3-32B (64 capas, SwiGLU). El repositorio lo publica la organizacion Station-house a partir del trabajo de alxcspr y forma parte del proyecto marin-32b-neuron-atlas, un esfuerzo de interpretabilidad mecanicista orientado a descomponer las representaciones internas del modelo en caracteristicas interpretables.

Cada SAE proyecta vectores de activacion de la capa MLP (d_in = 27.648, correspondiente a `silu(gate)·up` con normalizacion por neurona) en un espacio disperso de 32.768 latentes con k=32 activos por token. El repositorio incluye 20 capas concretas (0-11, 37-41 y 56-58) del barrido completo de 64 capas; son precisamente las que se saltaron la ronda de consolidacion porque sus diccionarios de 6.000 pasos ya reconstruian con calidad suficiente.

Su relevancia es practica para investigadores que quieran auditar, monitorizar o interpretar el comportamiento interno de marin-32b sin reentrenar SAEs: el paquete incluye checkpoints finales en bf16, censos por latente en Parquet, estadisticas de varianza no explicada (fvu) y registros de entrenamiento, todo con licencia Apache-2.0 y cargable mediante la libreria eai-sparsify de EleutherAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso TopK (SAE) sobre activaciones MLP de un transformer denso (SwiGLU, 64 capas) |
| Parametros totales | No disponible (el SAE tiene 32.768 latentes y d_in = 27.648; el recuento exacto de parametros del SAE no se publica) |
| Parametros activos | No aplica (no es MoE); k = 32 latentes activos por token |
| Longitud de contexto | No aplica al SAE; las activaciones se capturaron con secuencia de 2.048 tokens sobre marin-32b-base |
| Tipos de cuantizacion | Pesos en bf16; no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (el corpus de captura es FineWeb en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors) + cfg.json, census.parquet, stats.json, train_log.jsonl, sha256.txt |

## Arquitectura y entrenamiento

Cada SAE es un autoencoder de una sola capa con activacion TopK: 32.768 latentes, k = 32, implementado con eai-sparsify 1.3.3 (clase `Sae`, `activation="topk"`). Se entrena con AdamW (lr 3e-4, betas 0.9/0.95), funcion de perdida fvu (fraccion de varianza no explicada) y renormalizacion del decoder a norma unitaria en cada paso. El entrenamiento es corto: 6.000 pasos de 1.024 tokens, es decir, 6,14 millones de tokens, aproximadamente 0,6 epocas de la porcion de capa disponible. Cada capa se entreno como una tarea independiente en una A100-40 (Apocrita).

Las activaciones de entrada proceden de marin-32b-base en el commit f19b3466 (bf16, secuencia 2048), capturadas sobre el subconjunto de documentos largos de FineWeb `sample-10BT` (4.883 documentos, 9.995.501 tokens, con filtrado de contenido). Los vectores de entrada son la reconstruccion top-64 del nivel disperso del atlas, normalizados por la escala por neurona (`neuron_scale.parquet`). El barrido completo cubrio las 64 capas; las 20 incluidas aqui son las que la ronda de topup omitio por alcanzar ya una fvu muestreada entre 0,55 y 0,89 en un censo de 200.704 tokens por capa.

## Capacidades

- Extraccion de caracteristicas interpretables: descompone activaciones MLP de marin-32b en 32.768 latentes con k = 32 activos por token.
- Reconstruccion de activaciones: cada checkpoint permite aproximar la activacion original de la capa; la fvu muestreada varia entre 0,5530 (capa 57) y 0,8961 (capa 38).
- Analisis de vivacidad de latentes: el censo indica cuantos latentes disparan al menos una vez (entre 22.046 y 32.764 de 32.768 segun capa).
- Medicion de frecuencias y activaciones maximas: `census.parquet` incluye `alive`, `max_act` y `fire_frac` por latente.
- Cobertura de capas concretas: 0-11 (capas tempranas), 37-41 (capas medias) y 56-58 (capas tardias), lo que permite estudios comparativos por profundidad.
- Integracion con el ecosistema EleutherAI: carga directa con `Sae.load_from_disk("sae-32k/layer=40/sae_L40_final")`.
- No es un modelo de generacion de texto, razonamiento, codigo ni vision; no soporta tool calling ni agentes.

## Casos de uso

- Auditoria de representaciones internas: cargar el SAE de una capa concreta (por ejemplo, la 40) y proyectar activaciones de marin-32b-base para identificar latentes asociados a conceptos concretos, aprovechando la fvu de 0,8867 de esa capa.
- Analisis de circuitos y features: usar los censos (`fire_frac`, `max_act`) para seleccionar latentes frecuentes o raros y estudiar su papel en la prediccion, comparando capas tempranas (0-11) con tardias (56-58).
- Monitorizacion de seguridad en produccion: entrenar clasificadores sobre las activaciones dispersas de capas medias (37-41) para detectar comportamientos indeseados en despliegues de marin-32b, dado que estas capas muestran una fvu alta (0,86-0,90) y buen numero de latentes vivos.
- Investigacion en interpretabilidad comparada: replicar el analisis sobre las 20 capas publicadas para estudiar como cambia la dispersion y la vivacidad de caracteristicas con la profundidad, usando los `train_log.jsonl` para verificar convergencia.
- Edicion y steering de modelos: identificar latentes con `max_act` elevado (por ejemplo, 3.680 en la capa 57 o 2.304 en la 58) como candidatos a intervenciones de direccion, con la cautela de que esas capas tienen fvu mas variable.
- Reproducibilidad de experimentos: el manifiesto `sha256.txt` y los ficheros `cfg.json` permiten verificar integridad y configuracion exacta en estudios que citen estos SAE.
- Docencia y formacion: usar los checkpoints bf16 y los censos como material didactico para explicar SAE TopK sobre un modelo de 32B con arquitectura Qwen3, sin necesidad de reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas internas de reconstruccion por capa:

| Capa | fvu muestreada | Latentes vivos (de 32.768) | Activacion maxima |
|---|---|---|---|
| 0 | 0,7317 | 24.457 | 7,66 |
| 1 | 0,6488 | 22.046 | 19,88 |
| 2 | 0,7604 | 28.508 | 109,5 |
| 3 | 0,7676 | 25.597 | 16,75 |
| 4 | 0,7629 | 24.806 | 24,25 |
| 5 | 0,8040 | 24.159 | 17,75 |
| 6 | 0,8436 | 28.397 | 27,88 |
| 7 | 0,8562 | 25.562 | 27,00 |
| 8 | 0,8676 | 25.310 | 26,25 |
| 9 | 0,8748 | 26.306 | 44,00 |
| 10 | 0,8791 | 27.398 | 36,00 |
| 11 | 0,8926 | 29.312 | 41,50 |
| 37 | 0,8931 | 32.538 | 338,0 |
| 38 | 0,8961 | 32.764 | 362,0 |
| 39 | 0,8611 | 26.691 | 724,0 |
| 40 | 0,8867 | 26.543 | 552,0 |
| 41 | 0,8880 | 29.314 | 388,0 |
| 56 | 0,8946 | 32.392 | 1.304,0 |
| 57 | 0,5530 | 31.027 | 3.680,0 |
| 58 | 0,8720 | 31.552 | 2.304,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 72,5 GB; cada checkpoint de capa en bf16 contiene 32.768 latentes con d_in = 27.648, lo que supone cientos de millones de parametros por capa. No se publica el tamano exacto por checkpoint.
- GPU recomendadas: A100-40 (fue la usada para entrenar cada capa) y cualquier GPU con suficiente VRAM para cargar un checkpoint individual en bf16; H100 o A100-80 si se cargan varias capas simultaneamente.
- Cabe en GPU de consumo: probablemente si para una sola capa en bf16 en GPUs de 24 GB o mas (RTX 4090, RTX 3090), aunque el dato exacto no esta disponible; el conjunto completo de 20 capas no cabe en consumer.
- Opciones de despliegue: carga via eai-sparsify (EleutherAI) con `Sae.load_from_disk`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros / latentes | Contexto / k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Station-house/marin-32b-sae | SAE TopK sobre MLP de marin-32b | 32.768 latentes, d_in 27.648 | k = 32 | Apache-2.0 | HuggingFace (20 capas) |
| SAE de capas residuales de modelos abiertos (p. ej. familia Gemma Scope) | SAE sobre residual stream | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| SAE de GPT-2 de OpenAI / EleutherAI | SAE sobre residual stream | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes en la informacion proporcionada para una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no debe evaluarse con benchmarks de LLM (MMLU, HumanEval, GSM8K).
- Cobertura parcial: solo 20 de las 64 capas estan incluidas; las capas 12-36 y 42-55 no forman parte de este repositorio.
- Entrenamiento corto: 6.000 pasos y 6,14 millones de tokens por capa, aproximadamente 0,6 epocas; los latentes pueden estar infraentrenados en comparacion con SAE de referencia de mayor presupuesto.
- Calidad desigual por capa: la fvu muestreada varia de 0,5530 (capa 57) a 0,8961 (capa 38); la capa 57 reconstruye notablemente peor y presenta activaciones maximas muy altas (3.680), lo que sugiere caracteristicas de alta magnitud y posible inestabilidad.
- Dominio limitado: las activaciones se capturaron sobre FineWeb en ingles; el comportamiento sobre otros idiomas o dominios (codigo, matematicas) no esta validado.
- Sesgos: al derivarse de un corpus web filtrado, los latentes pueden reflejar sesgos presentes en FineWeb; no se documenta analisis de sesgo.
- Riesgo de interpretacion erronea: los latentes no son necesariamente monosemanticos; la fvu alta no garantiza caracteristicas limpias.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base marin-32b-base y el atlas subyacente deben verificarse por separado; la model card indica que la licencia coincide con modelo y atlas.
- Sin garantias de produccion: el autor no documenta evaluaciones de robustez, y el numero de descargas y likes es 0 en el momento de la consulta.

## Enlaces

- HuggingFace: https://huggingface.co/Station-house/marin-32b-sae
- Modelo base: https://huggingface.co/marin-community/marin-32b-base
- Dataset del atlas: https://huggingface.co/datasets/Station-house/marin-32b-neuron-atlas
- Repositorio de entrenamiento original: https://huggingface.co/alxcspr/stationhouse
- Libreria eai-sparsify: https://github.com/EleutherAI/sparsify
- Proyecto Marin: https://marin.community/
