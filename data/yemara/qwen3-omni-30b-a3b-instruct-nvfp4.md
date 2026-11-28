# yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4

## Resumen

Qwen3-Omni-30B-A3B-Instruct-NVFP4 es una cuantizacion del checkpoint multimodal Qwen3-Omni-30B-A3B-Instruct desarrollado por el equipo Qwen de Alibaba Cloud. La publica el usuario yemara como parte del proyecto Hibana, que la emplea como objetivo `qwen3omni` en su motor de inferencia. No se trata de un modelo nuevo: es el mismo checkpoint omni (thinker, codificador de audio, codificador de vision, talker, code predictor y code2wav) con el modelo de texto del thinker cuantizado a NVFP4 mediante NVIDIA ModelOpt 0.48.0, mientras el resto de componentes permanece en BF16 byte a byte.

El modelo base es un transformer MoE "any-to-any" que acepta y produce texto, audio e imagen, con 35.259.818.545 parametros totales segun los safetensors y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B). La cuantizacion reduce el peso de los tensores de 70,5 GB a 27,1 GB en 6 shards, y el modelo de texto del thinker pasa de 61,1 GB a 17,6 GB, lo que facilita su despliegue en hardware con memoria limitada.

Su relevancia actual radica en que demuestra una ruta de cuantizacion NVFP4 (W4A4) calibrada con datos multimodales, con perdidas medidas de 1,3-1,4 puntos frente a BF16 en 1.020 preguntas sobre medios, manteniendo el rendimiento en texto. Es un artefacto orientado a produccion en GPUs Blackwell (GB10) y al ecosistema ModelOpt/Hibana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal any-to-any (thinker + talker + code2wav), familia Qwen3-Omni |
| Parametros totales | 35.259.818.545 |
| Parametros activos | aproximadamente 3.000 millones (sufijo A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible (la calibracion usa muestras de hasta 65.536 tokens, sin confirmar el contexto maximo oficial) |
| Tipos de cuantizacion | NVFP4 W4A4 grupo 16 en el thinker de texto; BF16 en el resto |
| Idiomas soportados | no disponibles (la calibracion incluye 20 idiomas del dataset aya) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (6 shards, 27,1 GB de tensores; repo de 76,3 GB) |

## Arquitectura y entrenamiento

El modelo base combina un thinker (modelo de lenguaje MoE con 48 bloques y 128 expertos enrutados por bloque, con proyecciones `gate_proj`, `up_proj` y `down_proj`) con codificadores de audio y vision, un talker, un code predictor y un decodificador code2wav para la salida de audio. Esta cuantizacion solo altera el thinker de texto: expertos enrutados, atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`), `lm_head` pasan a NVFP4 W4A4 con grupo 16; embeddings, RMSNorms, routers MoE, codificadores de audio y vision, talker, code predictor y code2wav permanecen en BF16 original.

La cuantizacion se realizo con NVIDIA ModelOpt 0.48.0 (`mtq.quantize`) usando la configuracion `NVFP4_W4A4_WEIGHT_LOCAL_HESSIAN_CFG`: busqueda de escala E4M3 por bloque de 16 pesos sobre la rejilla FP8 minimizando el error de salida ponderado por el Hessiano de las activaciones de calibracion, escalas globales de activacion calibradas por maximo y escalas de bloque dinamicas. Cada lineal NVFP4 almacena `weight` (uint8, dos codigos E2M1 por byte), `weight_scale` (E4M3), `weight_scale_2` (FP32) e `input_scale` (FP32). El conjunto de calibracion incluye 367 muestras de texto (1.588.731 tokens) y 154 muestras de medios (220.806 tokens: 64 imagenes, 74 clips de audio y 16 videos Daily-Omni), con respuestas generadas por el modelo BF16 original. La exportacion se hizo con `export_hf_checkpoint` bajo transformers 5.15 en una GB10.

## Capacidades

- Generacion y comprension de texto con razonamiento e instrucciones.
- Procesamiento de imagen (vision encoder BF16 original).
- Procesamiento de audio, incluido audio largo (clips de hasta 5 minutos en calibracion).
- Video con audio intercalado (`use_audio_in_video`).
- Salida de audio mediante talker, code predictor y code2wav.
- Pipeline any-to-any: entrada y salida en multiples modalidades.
- Conversaciones multi-turno con contexto largo (calibrado hasta 65.536 tokens).
- Capacidades multilingues (calibracion en 20 idiomas).
- Soporte de tool calling y agentes: no confirmado en la informacion disponible.

## Casos de uso

- Asistentes multimodales conversacionales: el modelo puede mantener dialogos multi-turno combinando texto, imagen y audio, aprovechando la ventana de contexto larga calibrada hasta 65.536 tokens para conservar historial extenso.
- Transcripcion y analisis de reuniones: con el codificador de audio BF16 y clips de hasta 5 minutos en calibracion, es adecuado para resumir charlas o extraer acciones de grabaciones.
- Descripcion y respuesta sobre imagenes: el vision encoder intacto permite tareas de VQA, captioning y extraccion de informacion de capturas o documentos escaneados.
- Analisis de video con audio: el soporte de `use_audio_in_video` habilita la comprension conjunta de pistas visuales y sonoras en clips cortos, util en moderacion de contenido o analisis de clases grabadas.
- Generacion de respuestas habladas: la cadena talker/code2wav permite construir interfaces de voz (IVR, asistentes de accesibilidad) con salida de audio sintetizada.
- Despliegue en GPUs Blackwell con memoria limitada: al reducir el thinker de texto de 61,1 GB a 17,6 GB, permite servir el modelo omni completo en un solo acelerador GB10, algo inviable con el checkpoint BF16.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia reproducible para estudiar el impacto de NVFP4 W4A4 con calibracion multimodal frente a BF16.

## Benchmarks y rendimiento

La model card reporta resultados de perdida frente a BF16 en 1.020 preguntas sobre medios, no benchmarks estandar (MMLU, HumanEval, GSM8K):

| Revision | Perdida vs BF16 (preguntas de medios) | Significancia |
|---|---|---|
| Segunda revision (calibracion solo texto) | 2,6 puntos | p = 0,002 |
| Tercera revision (calibracion multimodal), ejecucion 1 | 1,3 puntos | p = 0,12 |
| Tercera revision (calibracion multimodal), ejecucion 2 | 1,4 puntos | p = 0,06 |

El rendimiento en texto se mantiene segun la model card, sin cifras concretas publicadas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 27,1 GB de tensores en pesos NVFP4/BF16; el repo completo ocupa 76,3 GB, por lo que la inferencia requiere al menos ~30 GB de memoria para pesos, mas KV-cache y activaciones.
- GPU recomendadas: NVIDIA GB10 (usada para la cuantizacion y el motor Hibana); GPUs Blackwell con soporte NVFP4 en general.
- Compatibilidad con consumer GPU: no confirmada; NVFP4 requiere soporte nativo de hardware Blackwell, por lo que las RTX de generaciones anteriores no lo aprovecharian.
- Opciones de despliegue: motor Hibana (objetivo `qwen3omni`); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Omni-30B-A3B-Instruct-NVFP4 (este) | 35,26 B | no disponible | NVFP4 + BF16, safetensors | apache-2.0 | Hugging Face |
| Qwen3-Omni-30B-A3B-Instruct (base) | no disponible en la informacion | no disponible | BF16, safetensors (70,5 GB) | apache-2.0 | Hugging Face |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion introduce una perdida medible de 1,3-1,4 puntos en preguntas sobre medios frente a BF16; en texto la model card afirma que se mantiene, sin cifras publicadas.
- Solo el thinker de texto esta cuantizado; el resto permanece en BF16, por lo que el ahorro de memoria se limita a esa parte (61,1 GB a 17,6 GB).
- NVFP4 requiere hardware Blackwell para aprovecharse; en GPUs sin soporte nativo el rendimiento puede degradarse o no ser compatible.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas en esta revision.
- Sesgos conocidos: no documentados en la informacion disponible; la calibracion incluye 20 idiomas pero no se detalla la cobertura final.
- Idiomas soportados: no disponibles de forma oficial; la calibracion cubre 20 idiomas del dataset aya.
- Licencia Apache 2.0 permite uso comercial, pero el modelo y los pesos son de Alibaba Cloud; esta revision solo cambia el formato numerico de algunos tensores.
- La calibracion excluye explicitamente items de evaluacion (se descartan prompts con solapamiento de 13 palabras), pero los resultados de perdida son del autor y no de una evaluacion independiente.
- No se ha confirmado soporte de tool calling ni de agentes en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Repositorio del motor Hibana: https://github.com/sharar-project/hibana
- Dataset de calibracion (texto): https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de calibracion (multilingue): https://huggingface.co/datasets/CohereLabs/aya_dataset
