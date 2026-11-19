# spybyscript/nemotron-3.5-asr-streaming-0.6b-litert

## Resumen

Nemotron 3.5 ASR Streaming 0.6B — LiteRT es una conversion del modelo de reconocimiento automatico del habla `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA al formato LiteRT (`.tflite`), publicada por el usuario spybyscript. No se trata de un modelo reentrenado ni de una publicacion oficial de NVIDIA o Google: es un trabajo de conversion y empaquetado que trocea el modelo original en 31 grafos componentes (frontend, subsampling, 24 bloques de encoder, proyeccion, predictor y joint) para permitir inferencia con estado en dispositivos moviles Android.

El modelo base es un sistema ASR en streaming de arquitectura FastConformer con decodificacion RNN-T y aproximadamente 0,6 mil millones de parametros, orientado a transcripcion en tiempo real de audio en ingles (en-US). La relevancia de esta conversion radica en que ofrece cuatro variantes de precision (fp32, fp16, int8 y npu) con grafos precompilados para cinco SoC Snapdragon de Qualcomm, lo que permite ejecutar el encoder en la NPU del telefono con un RTF de 0,103 en un Galaxy Z Fold 8 (SM8850) y 0,113 en un Galaxy S23 Ultra (SM8550).

El paquete no es un transcriptor listo para usar: la aplicacion anfitriona debe gestionar el troceado del audio en ventanas de 560 ms, las caches de estado y la decodificacion greedy. El repositorio incluye un script de referencia en CPU (`reference_inference.py`) y documentacion de integracion (`INTEGRATION.md`, `PUNCTUATION_FIX.md`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + RNN-T (predictor y joint), convertida a grafos LiteRT |
| Parametros totales | no disponible (el modelo base se denomina 0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa chunks de 560 ms de audio en streaming) |
| Tipos de cuantizacion | fp32, fp16, int8 (pesos FC del encoder en INT8 dinamico por canal, parcial), grafos precompilados para NPU |
| Idiomas soportados | en (perfil probado: en-US) |
| Licencia | openmdw-1.1 |
| Formato de pesos | LiteRT / TFLite (`.tflite`), con manifiestos JSON y SHA-256 |
| Tamano de los grafos | fp32: 2.486.978.032 bytes; fp16: 1.269.724.508 bytes; int8: 981.122.704 bytes; npu: 1.184.359.152 bytes + 1,19 GB por chip |
| Tamano del repositorio | 16,1 GB |
| Contrato de bundle | `nemotron35-hf560-v2` |
| Runtime requerido | LiteRT 2.2.0 (referencia CPU) / 2.3.2 (Android y NPU) |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR en streaming compuesto por un encoder FastConformer de 24 bloques y un decodificador RNN-T formado por predictor y joint. La conversion a LiteRT preserva esta estructura pero la descompone en grafos independientes y con estado: un frontend de caracteristicas, un modulo de subsampling, 24 grafos de bloque del encoder, una proyeccion, el predictor y el joint. En la variante `npu`, los 24 bloques se fusionan en tres grafos de 8 bloques cada uno (con la proyeccion integrada en el ultimo), y esos grafos se precompilan para cinco NPU Snapdragon mediante QAIRT 2.50.0 sobre Linux x86-64.

No se ha reentrenado nada: los pesos proceden de la revision `1c8deaecc64b91f034d73e08dd8b64625eb3395d` del modelo de NVIDIA. La model card de esta conversion no detalla el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO; esos datos corresponden a la model card original de NVIDIA, que se copia como `MODEL_CARD.md` en cada carpeta. La innovacion tecnica del paquete es el particionado en grafos con estado persistente, la restauracion de puntuacion terminal mediante mascaras de validez en el chunk final (`args_4` / `args_5`) y la precompilacion para NPU Qualcomm con un grafo por particion NPU.

## Capacidades

- Reconocimiento automatico del habla en streaming con chunks de 560 ms y decodificacion greedy RNN-T.
- Transcripcion en ingles (perfil probado en-US, prompt 0).
- Restauracion de puntuacion terminal en el ultimo chunk mediante mascaras de validez.
- Ejecucion en CPU (fp32, fp16, int8) y en GPU (fp32) en Android mediante LiteRT `CompiledModel`.
- Ejecucion del encoder en NPU Qualcomm (Snapdragon SM8850, SM8550 y otros tres SoC) con grafos fusionados.
- Estado de sesion persistente entre chunks (caches del encoder y del predictor).
- No soporta tool calling, function calling, agentes, vision, audio de entrada mas alla del propio ASR ni modo thinking.

## Casos de uso

- Dictado por voz en aplicaciones Android: el modelo procesa audio en chunks de 560 ms con un RTF de 0,103 en NPU, lo que permite transcripcion practicamente en tiempo real sin salir del dispositivo y sin enviar audio a la nube.
- Subtitulado en directo de reuniones o clases: la integracion por chunks con estado mantiene el contexto acustico entre ventanas, y la restauracion de puntuacion en el chunk final produce subtitulos legibles al cerrar cada frase.
- Asistentes de voz embebidos: al ejecutarse en la NPU con 1,46 GB de PSS y 0,09-0,12 GB de memoria dirty, deja recursos libres para el resto de la aplicacion en telefonos de gama alta.
- Transcripcion offline en entornos sin conectividad: el bundle fp16 en CPU (RTF 0,191-0,329 en los dispositivos probados) permite operar sin red en un Galaxy S23 Ultra o similar.
- Procesamiento por lotes en servidor con CPU: la variante fp32 como referencia y la int8 como alternativa mas ligera (981 MB de grafos) para pipelines de transcripcion donde la fidelidad exacta no es critica, aceptando explicitamente el bundle por su hash de manifiesto.
- Investigacion en ASR embebido: los grafos separados por componente y el script `reference_inference.py` permiten medir el coste de cada etapa (frontend, encoder, predictor, joint) y experimentar con estrategias de particion CPU/NPU.
- Evaluacion de precision en movil: las variantes fp32, fp16 e int8 permiten comparar el impacto de la cuantizacion en la tasa de error de palabra sobre el mismo conjunto de audio.

## Benchmarks y rendimiento

Precision sobre 20 clips de LibriSpeech test-clean (485 palabras), segun la model card:

| Variante | Errores de palabra | WER |
|---|---:|---:|
| fp32 o fp16, CPU | 14 | 2,89% |
| npu en SM8850 y SM8550 | 17 | 3,51% |

Coincidencia de transcripciones con el modelo original sobre 80 clips de 40 hablantes: fp32 80/80, fp16 79/80, int8 68/80.

Rendimiento en dispositivos (LiteRT 2.3.2, qnn-runtime 2.50.0, 20 clips, 171,6 s, estado termico 0; frontend, subsampling, predictor y joint siempre en CPU):

| Telefono | Encoder en | RTF | Chunk p50 | Chunk final | Encoder por chunk | Memoria dirty / PSS |
|---|---|---:|---:|---:|---:|---|
| Galaxy Z Fold 8 (SM8850) | NPU | 0,103 | 56 ms | 53 ms | 39 ms | 0,12 / 1,47 GB |
| Galaxy Z Fold 8 (SM8850) | GPU, FP32 | 0,168 | 90 ms | 90 ms | 72 ms | 3,25 / 4,27 GB |
| Galaxy Z Fold 8 (SM8850) | CPU, 4 hilos (fp16) | 0,191 | 97 ms | 94 ms | 82 ms | 0,66 / 3,04 GB |
| Galaxy S23 Ultra (SM8550) | NPU | 0,113 | 60 ms | 55 ms | 37 ms | 0,09 / 1,46 GB |
| Galaxy S23 Ultra (SM8550) | GPU, FP32 | 0,274 | 146 ms | 150 ms | 121 ms | 3,24 / 5,05 GB |
| Galaxy S23 Ultra (SM8550) | CPU, 4 hilos (fp16) | 0,329 | 148 ms | 141 ms | 137 ms | 0,14 / 2,55 GB |

## Requisitos de hardware

- Memoria: el bundle fp32 ocupa 2,49 GB de grafos, el fp16 1,27 GB, el int8 981 MB y el npu 1,18 GB mas 1,19 GB por chip. En movil, el PSS medido va de 1,46 a 5,05 GB segun la ruta de ejecucion.
- NPU Qualcomm: requiere grafos fusionados en tres bloques de 8; cada fichero solo funciona en su chip (`Build.SOC_MODEL`) y con las versiones de runtime indicadas. Carga en 1-2 s.
- GPU movil: ejecutar en FP32; en FP16 los grafos desbordan y producen salida incorrecta o no finita. La carga tarda 11-16 s.
- CPU: 4 hilos con el bundle fp16 es la configuracion probada en Android; `reference_inference.py` es la referencia completa en CPU.
- No se proporcionan requisitos para GPU de servidor (A100, H100, RTX 4090); el paquete esta orientado a LiteRT en Android y a la referencia CPU.
- Despliegue: LiteRT 2.2.0 (referencia CPU) o LiteRT 2.3.2 con `litert-npu-runtime-qualcomm` 2.3.2 y `qnn-runtime` 2.50.0 (NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B — LiteRT (esta ficha) | ~0,6B (no disponible exacto) | chunks de 560 ms | en | openmdw-1.1 | LiteRT/TFLite, movil y NPU |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~0,6B | no disponible | no disponible | openmdw-1.1 | pesos originales de NVIDIA (no disponible el detalle) |
| Alternativas de ASR en streaming de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de terceros en la informacion proporcionada para establecer una comparacion cuantitativa con otros sistemas ASR.

## Limitaciones y advertencias

- No es un transcriptor listo para usar: requiere que la aplicacion gestione troceado, caches y decodificacion; los grafos son componentes de una integracion con estado.
- Solo probado en ingles (en-US, prompt 0); no hay evidencia de soporte multilingue.
- La evaluacion de precision se limita a 20 clips de LibriSpeech test-clean y 80 clips de validacion; no es un benchmark representativo de condiciones reales (ruido, acentos, dominio).
- La variante int8 altera algunas salidas y esta marcada como `evaluation_only: true`; debe aceptarse explicitamente por su hash de manifiesto y no debe editarse el manifiesto.
- En NPU, 5 de 20 transcripciones difieren de la CPU por homofonos cercanos, grafia de nombres raros y una coma.
- Los grafos en FP16 sobre GPU desbordan; en GPU hay que usar FP32.
- La NPU exige los grafos fusionados: con los 24 bloques separados el coste fijo por llamada supera el trabajo util, y un unico grafo de 24 bloques (1,19 GB) provoca falta de memoria en el S23.
- Los ficheros NPU solo funcionan en su SoC concreto y con las versiones de runtime especificadas.
- Cambios de contrato: los hosts escritos para v1 deben fijar la revision `153a7dbd809a255e5999130397bcd60a66f81a54`.
- Riesgo de alucinacion en pasajes con ruido o audio fuera de dominio, inherente a los sistemas ASR; no se documentan sesgos especificos.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la model card no detalla condiciones adicionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/spybyscript/nemotron-3.5-asr-streaming-0.6b-litert
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Documentacion de integracion: `INTEGRATION.md` (en el repositorio)
- Correccion de puntuacion: `PUNCTUATION_FIX.md` (en el repositorio)
- Script de referencia: `reference_inference.py` (en el repositorio)
- Manifiestos y sumas SHA-256: `SHA256SUMS` y manifiestos por variante (en el repositorio)
