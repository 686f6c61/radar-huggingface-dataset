# vskadandale/speechllm_fama_meusli_villanova_st_it2en_v1

## Resumen

SpeechLLM FAMA × MEUSLI × Villanova v1 es un modelo de traduccion automatica de voz (speech translation, ST) de italiano a ingles desarrollado por la unidad SpeechTek de la Fondazione Bruno Kessler (FBK). Combina tres componentes: un codificador de voz congelado (FAMA-medium-asr), un proyector lineal inicializado a partir del proyector MEUSLI v2 para Villanova-2B y un modelo de lenguaje congelado (Villanova-2B-2603) adaptado mediante LoRA. El repositorio publicado contiene unicamente los pesos entrenados (14,16 millones de parametros: 9,44 M del proyector y 4,72 M de los adaptadores LoRA); el codificador y el LLM se descargan por separado.

El modelo resuelve la tarea de traducir audio en italiano a texto en ingles dentro del framework SLAM-LLM, un marco modular de LLM multimodal orientado a voz, lenguaje y audio. Su interes practico radica en que demuestra un esquema de entrenamiento muy economico (solo proyector y LoRA entrenables sobre A100 de 64 GB) que alcanza un BLEU de 55,66 sobre el split de test de Common Voice 17.0 italiano-ingles.

La relevancia actual viene de su caracter abierto (licencia CC BY 4.0), su bajo coste de entrenamiento e inferencia (LLM de 2B parametros con contexto de 4096 tokens) y su enfoque de inicializacion cruzada de proyector entre sistemas de voz distintos, que reduce el coste de adaptar un codificador ASR congelado a un LLM congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLLM (encoder de voz congelado + proyector lineal + LLM congelado con LoRA), framework SLAM-LLM |
| Parametros totales | 14,16 M entrenables en el repositorio (9,44 M proyector + 4,72 M LoRA); el total del sistema incluye FAMA y Villanova-2B, no disponible en detalle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (llm context_length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Italiano (entrada de voz), ingles (salida de texto) |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un speechLLM de tres etapas: FAMA-medium-asr (encoder de voz congelado, dim 1024) recibe features de filterbank mel de 80 dimensiones con CMVN; un proyector lineal (Linear 2048→2048, ReLU, Linear 2048→2560, con `encoder_projector_ds_rate=2`) mapea la salida del encoder al espacio del LLM; y Villanova-2B-2603 (LLM congelado, dim 2560) genera la traduccion. El proyector se inicializa desde MEUSLI v2 para Villanova-2B, pero como MEUSLI se entreno con Whisper large-v3-turbo y su primera capa no coincide con la salida de FAMA, esa capa se reinicializa y el resto se carga. Solo se entrenan el proyector y los adaptadores LoRA (r=32, alpha=32, dropout=0,05, modulos q_proj y v_proj).

El entrenamiento usa audio italiano de Common Voice 17.0 con targets en ingles generados traduciendo las transcripciones italianas con EuroLLM-1.7B-Instruct. Se ejecuto con `torchrun` en una unica NVIDIA A100 de 64 GB (CINECA Leonardo Booster) con fp16, AdamW (weight_decay 0), lr 1e-4, warmup lineal de 1000 pasos, 4 epochs, batch 4 y acumulacion 1, total_steps 1.000.000, validacion cada 5000 pasos. El prompt fijo de entrenamiento e inferencia es `"Translate Italian speech to English text. "` (el espacio final es obligatorio). La decodificacion usa beam search con 4 haces, maximo 200 tokens nuevos y `repetition_penalty` 1.0.

## Capacidades

- Traduccion automatica de voz italiano→ingles (speech-to-text translation) sobre audio mel de 80 dimensiones.
- Generacion de texto en ingles en minusculas (los targets de entrenamiento son lowercase).
- Manejo de contexto de hasta 4096 tokens en el LLM, util para utterances largas.
- Entrenamiento y ajuste fino adicional via scripts del repositorio Villanova-Speech-LLM.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Capacidades multilingues limitadas a italiano (entrada) e ingles (salida).
- No dispone de modo thinking, vision ni audio de salida.

## Casos de uso

- Subtitulado automatico de contenido audiovisual italiano: el modelo transcribe y traduce en una sola etapa audio italiano a texto ingles, adecuado para streaming de video con ventana de contexto de 4096 tokens.
- Localizacion de reuniones y webinars: integracion en pipelines de transcripcion (por ejemplo, con SLAM-LLM) para generar actas en ingles a partir de audio italiano, aprovechando el bajo coste de inferencia de un LLM de 2B.
- Traduccion de podcasts y entrevistas: procesamiento por lotes de audio de Common Voice y dominios similares, con BLEU de referencia de 55,66 en test.
- Investigacion en speechLLM: base reproducible para experimentar con inicializacion de proyectores (MEUSLI) y LoRA sobre LLM congelados, usando los scripts `finetune_fama_meusli_vnova_it2en.sh`.
- Prototipos de asistentes de voz bilingues italiano-ingles: el modelo puede servir como componente de traduccion en un pipeline mayor, aunque requiere guardas de repeticion en produccion.
- Evaluacion comparativa de codificadores ASR: permite medir el impacto de FAMA frente a Whisper large-v3-turbo (usado en MEUSLI) en tareas de ST.
- Fine-tuning sobre dominios especificos: al entrenar solo proyector y LoRA (14,16 M parametros), es viable adaptar el modelo a jerga medica o legal con recursos modestos.

## Benchmarks y rendimiento

| Conjunto de test | Metrica | Resultado |
|---|---|---|
| Common Voice 17.0 italiano→ingles (test) | BLEU | 55,66 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El BLEU se calcula sobre texto normalizado con beam search de 4 haces, y las referencias (entrenamiento y test) fueron generadas con EuroLLM-1.7B-Instruct, no por traductores humanos.

## Requisitos de hardware

- Entrenamiento: una NVIDIA A100 de 64 GB (CINECA Leonardo Booster), fp16, sin FSDP.
- VRAM estimada para inferencia: no disponible de forma explicita; el sistema completo incluye FAMA-medium-asr y Villanova-2B (2B parametros), por lo que en fp16 el LLM requiere del orden de varios GB, pero no se publica una cifra exacta.
- GPU recomendadas: A100 64 GB para entrenamiento; para inferencia, GPUs con suficiente VRAM para Villanova-2B en fp16 (por ejemplo, A100, H100, RTX 4090) segun disponibilidad.
- Cabe en GPU consumer: probablemente si en fp16/8-bit para el LLM de 2B, pero no confirmado en la informacion disponible.
- Opciones de despliegue: scripts del repositorio Villanova-Speech-LLM (fork de SLAM-LLM); vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros LLM | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FAMA × MEUSLI × Villanova v1 (este) | 2B (Villanova-2B congelado + LoRA) | 4096 | ST italiano→ingles | CC BY 4.0 | Hugging Face (solo pesos entrenados) |
| Whisper large-v3-turbo (base de MEUSLI) | no aplica (ASR) | no disponible | ASR multilingue | no disponible en esta ficha | widely available |
| EuroLLM-1.7B-Instruct (generador de referencias) | 1.7B | no disponible | traduccion texto | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a parametros y licencia.

## Limitaciones y advertencias

- La decodificacion no tiene guarda de repeticion: algunas utterances pueden entrar en bucle hasta el limite de 200 tokens, especialmente en datos fuera de dominio. Se recomienda `no_repeat_ngram_size`, una `repetition_penalty` moderada o un limite de longitud ligado al audio.
- Las referencias de traduccion (entrenamiento y test) fueron generadas por EuroLLM-1.7B-Instruct, no por traductores humanos; el BLEU mide concordancia con esas referencias, no calidad humana.
- Una sola ejecucion de entrenamiento por configuracion: diferencias inferiores a ~0,5 BLEU/WER estan dentro de la variacion entre ejecuciones.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; el bucle de decodificacion es el principal riesgo observado.
- Limitaciones de idioma: solo italiano como entrada y ingles como salida; no cubre otras lenguas.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion; conviene revisar las licencias de los componentes base (FAMA, Villanova-2B, MEUSLI) por separado.
- Caveat de produccion: el prompt debe incluir el espacio final exacto; el checkpoint no incluye encoder ni LLM, que deben descargarse aparte.

## Enlaces

- Hugging Face: https://huggingface.co/vskadandale/speechllm_fama_meusli_villanova_st_it2en_v1
- Repositorio de codigo: https://github.com/vskadandale/Villanova-Speech-LLM
- Encoder FAMA: https://huggingface.co/FBK-MT/fama-medium-asr
- LLM Villanova-2B: https://huggingface.co/VillanovaAI/Villanova-2B-2603
- Proyector MEUSLI: https://huggingface.co/SpeechTek/MEUSLI_projector_v2_Villanova_2B
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Framework SLAM-LLM: no disponible como enlace directo en la informacion proporcionada (citado como `@article{ma2026slam}`)
