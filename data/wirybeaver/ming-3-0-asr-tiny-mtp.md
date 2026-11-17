# wirybeaver/Ming-3.0-asr-tiny-mtp

## Resumen

Ming-3.0-asr-tiny-mtp es un borrador (draft) de decodificacion especulativa de tipo MTP (multi-token prediction) de una sola capa, ajustado para emparejarse con el verificador congelado inclusionAI/Ming-3.0-asr-tiny, un modelo de reconocimiento automatico del habla (ASR) de la familia Ming. Lo publica el usuario wirybeaver en Hugging Face y no se trata de un modelo autonomo: el repositorio almacena unicamente los pesos del bloque MTP nativo, mientras que los embeddings compartidos y la cabeza LM se obtienen del modelo base fijado a una revision concreta.

El objetivo es acelerar la inferencia del verificador mediante decodificacion especulativa: el borrador propone varios tokens por paso y el verificador los valida, reduciendo el numero de pasos de decodificacion. Segun la model card, en modo normal sobre una H200 en BF16 con TP1 se midio una ganancia de throughput del +17,58% a concurrencia 1 y del +14,28% a concurrencia 8, con una longitud de aceptacion (AL) de aproximadamente 3,32 tokens por verificacion.

El modelo tiene 316.604.800 parametros entrenables, hidden size de 1.536 y vocabulario de 157.184 tokens. Esta orientado a ASR en ingles, chino y japones, y se integra en SGLang-Omni cuando se habilita NEXTN. Su relevancia actual radica en que demuestra como un bloque MTP pequeno puede aportar ganancias medibles de rendimiento sobre un verificador ASR congelado sin reentrenarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloque MTP nativo de 1 capa sobre verificador Ming (arquitectura base `bailing_moe_v3`) |
| Parametros totales | 316.604.800 (parametros entrenables del borrador) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos en BF16 |
| Idiomas soportados | en, zh, ja |
| Licencia | MIT (con avisos Apache-2.0 y avisos de ficheros fuente originales) |
| Formato de pesos | safetensors (BF16), con `custom_code` y libreria `vllm` |

## Arquitectura y entrenamiento

El modelo es un borrador MTP nativo de una sola capa (indice de capa 24 en el checkpoint nativo) con hidden size de 1.536 y vocabulario completo de 157.184 tokens. El fichero de pesos contiene solo los 403 tensores nativos `model.layers.24.*`; los embeddings compartidos y la cabeza LM se toman por separado del modelo base fijado a la revision `ac95e7b1678c08ea6f4a2581a051e432ed63e9b7`. La configuracion conserva la profundidad objetivo de 24 para que el cargador nativo direccione la capa 24, y `num_nextn_predict_layers=1` especifica la profundidad del borrador. Al retener el vocabulario completo no se necesitan ficheros de mapeo de vocabulario de borrador.

El entrenamiento se realizo con Speculators y un adaptador nativo de Ming, con entropia cruzada ponderada en tres pasos (pesos proporcionales a 1, 0,6 y 0,36), AdamW fusionado a 3e-5, weight decay 0,01, decaimiento coseno con 3% de warmup y 16.384 tokens de entrada empaquetados por GPU. Se completaron 6 epocas en dos GPU H200 en aproximadamente 5,60 horas; el checkpoint publicado es la epoca 3, seleccionada por la menor perdida de validacion retenida (0,269103). Los datos de entrenamiento reutilizan la seleccion de Ming-3.0-asr-tiny-dspark: LibriSpeech train-clean-360, People's Speech clean, VoxPopuli English, AISHELL-1 train/dev y FLEURS en ingles, chino y japones, con 356.954 clips de entrenamiento (999,51 horas de audio) y 2.575 clips de validacion. Las etiquetas son las transcripciones greedy del verificador congelado, incluido el prefijo de idioma y EOS. El verificador, los embeddings compartidos, la cabeza LM y la normalizacion final permanecen congelados.

## Capacidades

- Prediccion especulativa multi-token para ASR: propone hasta 3 tokens recurrentes por paso de borrador a traves de la misma capa.
- Aceleracion de decodificacion del verificador Ming-3.0-asr-tiny sin modificar sus pesos.
- Reconocimiento de voz en ingles, chino y japones (heredado del verificador).
- Integracion con SGLang-Omni cuando se habilita NEXTN, cargando automaticamente el bloque de prediccion.
- Compatibilidad con vLLM para la captura de caracteristicas y el flujo de entrenamiento.
- No soporta tool calling, agentes, vision ni audio de forma autonoma: depende del verificador para la transcripcion real.

## Casos de uso

- Servicio de transcripcion ASR de baja latencia: desplegar el verificador Ming-3.0-asr-tiny con este borrador MTP en SGLang-Omni para reducir el numero de pasos de decodificacion y aumentar el throughput en produccion, con ganancias medidas de +17,58% a concurrencia 1.
- Atencion al cliente con transcripcion en tiempo real: el borrador acelera la generacion de transcripciones en ingles, chino y japones, lo que permite alimentar pipelines de analisis de llamadas con menor latencia.
- Subtitulado y transcripcion de reuniones: usar el modelo junto al verificador para procesar audio en lote con mayor rendimiento por GPU, manteniendo la precision del verificador original.
- Investigacion en decodificacion especulativa: servir como referencia reproducible para estudiar MTP nativo sobre modelos ASR, con pesos publicados y manifiesto de procedencia con hashes SHA-256.
- Evaluacion de infraestructura de inferencia: medir acceptance length y throughput en distintos niveles de concurrencia para dimensionar despliegues en H200.
- Generacion de datasets de audio etiquetados: emplear el pipeline verificado para transcribir grandes volumenes de audio en ingles, chino y japones con mayor eficiencia energetica por hora de audio procesada.

## Benchmarks y rendimiento

Validacion offline (mediciones condicionadas por el profesor, en cache):

| Checkpoint | Perdida CE ponderada | Prefijo correcto >=1 | Prefijo correcto >=2 | Prefijo correcto >=3 |
|---|---:|---:|---:|---:|
| MTP nativo inicial | 5,531582 | 37,30% | 3,39% | 0,17% |
| Epoca 3 (seleccionada) | 0,269103 | 93,65% | 84,88% | 77,38% |

Perdida de validacion por epoca:

| Epoca | Perdida de validacion |
|---|---:|
| 1 | 0,318932 |
| 2 | 0,281512 |
| 3 (seleccionada) | 0,269103 |
| 4 | 0,280994 |
| 5 | 0,290502 |
| 6 | 0,284293 |

Evaluacion online (ASR en ingles, modo normal, una H200, BF16, TP1, sobre SeedTTS):

| Concurrencia | Ganancia de throughput | AL (tokens/verificacion) |
|---|---:|---:|
| c1 | +17,58% | 3,3238 |
| c8 | +14,28% | 3,3188 |
| c16 | +10,28% | 3,3166 |

Los resultados completos, incluidos precision, modo determinista y ASR en chino, estan en SGLang-Omni PR #3887.

## Requisitos de hardware

- VRAM estimada: el borrador tiene 316,6 millones de parametros en BF16, aproximadamente 0,63 GB solo para sus pesos; el consumo total depende del verificador Ming-3.0-asr-tiny, cuyos pesos no se detallan en la informacion disponible.
- GPU recomendadas: el entrenamiento y la evaluacion se realizaron en NVIDIA H200; no se han publicado mediciones en otras GPU.
- GPU de consumo: no hay datos publicados sobre su funcionamiento en GPU de consumo; el tamano del borrador es reducido, pero el verificador completo condiciona el requisito total.
- Despliegue: vLLM (libreria declarada) y SGLang-Omni con NEXTN habilitado para la carga automatica del bloque de prediccion.
- Latencia y throughput: ganancia de throughput de +17,58% a c1, +14,28% a c8 y +10,28% a c16 en una H200; no se publican valores absolutos de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ming-3.0-asr-tiny-mtp | 316.604.800 (borrador) | Borrador MTP sobre verificador ASR | no disponible | MIT | Hugging Face, 66 descargas |
| Ming-3.0-asr-tiny-dspark | no disponible | Borrador de decodificacion especulativa alternativo | no disponible | no disponible | Hugging Face |
| inclusionAI/Ming-3.0-asr-tiny | no disponible | Verificador ASR base | no disponible | MIT | Hugging Face |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el verificador Ming-3.0-asr-tiny fijado a la revision `ac95e7b1678c08ea6f4a2581a051e432ed63e9b7` y su tokenizador y procesador de audio.
- Las mediciones de aceptacion en serving se realizaron solo en ingles y sobre SeedTTS; los resultados en chino y japones no se detallan en la informacion disponible.
- La validacion offline es condicionada por el profesor y en cache, por lo que no equivale directamente a la aceptacion en serving.
- Las comprobaciones de duplicados solo cubren solapamiento exacto de PCM16 a 16 kHz; no garantizan separacion de hablantes ni detectan casi duplicados.
- Riesgo de sesgos y alucinaciones heredado del verificador y de los corpus de entrenamiento (LibriSpeech, People's Speech, VoxPopuli, AISHELL-1, FLEURS).
- La licencia MIT del modelo base se conserva junto con avisos Apache-2.0 y avisos de ficheros fuente originales; las licencias de los datasets siguen siendo las de sus fuentes respectivas.
- El repositorio no incluye scripts de entrenamiento, adaptadores privados, estados del optimizador, logs crudos, audio ni caches de caracteristicas.

## Enlaces

- [Hugging Face: wirybeaver/Ming-3.0-asr-tiny-mtp](https://huggingface.co/wirybeaver/Ming-3.0-asr-tiny-mtp)
- [Modelo base: inclusionAI/Ming-3.0-asr-tiny](https://huggingface.co/inclusionAI/Ming-3.0-asr-tiny)
- [Borrador alternativo: wirybeaver/Ming-3.0-asr-tiny-dspark](https://huggingface.co/wirybeaver/Ming-3.0-asr-tiny-dspark)
- [Evaluacion de serving: SGLang-Omni PR #3887](https://github.com/sgl-project/sglang-omni/pull/3887)
- [Speculators (vLLM)](https://github.com/vllm-project/speculators)
- [vLLM PR #66050](https://github.com/vllm-project/vllm/pull/66050)
- [vLLM PR #54174](https://github.com/vllm-project/vllm/pull/54174)
