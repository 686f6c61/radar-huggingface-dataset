# vishnushuggingface/shruti-hinglish-wsp

## Resumen

Shruti-Hinglish-WSP es una coleccion de checkpoints derivados de `udgamlabs/Shruti` (tambien conocido como `Cactus-Compute/whistle-small`), un modelo de reconocimiento automatico del habla de 55.517.513 parametros orientado a despliegue en el borde. El autor, `vishnushuggingface`, aplica una tecnica denominada Weight-Space Programming (WSP) para calibrar quirurgicamente subconjuntos de pesos del modelo base sin reentrenamiento completo, con el objetivo de mejorar el rendimiento en hindi, hinglish (code-switching hindi-ingles) e ingles indio.

El modelo resuelve un problema concreto: el modelo base presenta errores muy elevados en hindi (hasta un 74,47% de WER estricto en FLEURS-hi segun la propia model card) y un rendimiento mediocre en ingles indio. Mediante la modificacion selectiva de registros de pesos en formato `.cact` (4-bit CQ4 + FP16) y `.safetensors` (FP32), el autor reporta reducciones significativas de WER en varios conjuntos de evaluacion, manteniendo el tamano reducido del checkpoint (29,5 MB en `.cact`, 212 MB en safetensors FP32).

La relevancia actual del proyecto reside en su enfoque de bajo coste computacional para adaptar modelos ASR pequenos a dominios linguisticos especificos, asi como en su orientacion a edge AI mediante el formato `.cact` y el runtime C++ `needle`. No obstante, se trata de un trabajo de investigacion con validacion limitada y sin publicacion revisada por pares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder-decoder con cross-attention (8 capas de encoder, 8 capas de decoder) |
| Parametros totales | 55.517.513 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit CQ4 + FP16 (formato `.cact`); FP32 (safetensors); FP16 (variantes) |
| Idiomas soportados | hindi (hi), ingles (en), hinglish (code-switching) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (29,5 MB), `.safetensors` (212 MB FP32) |

## Arquitectura y entrenamiento

El modelo base `udgamlabs/Shruti` emplea una arquitectura Conformer, un hibrido entre transformer y convoluciones que combina mecanismos de auto-atencion con capas convolucionales para capturar dependencias locales y globales en secuencias de audio. Segun la model card, el checkpoint de produccion recomendado calibra las 8 capas del encoder Conformer, el stem convolucional de audio, las 8 capas del decoder con cross-attention y 188 normas de embedding de 4 bloques en FP16.

El entrenamiento original del modelo base no se detalla en la informacion proporcionada. Los datasets referenciados en la model card son `google/fleurs`, `ai4bharat/Svarah`, `ai4bharat/Lahaja` y `openslr/librispeech_asr`, que cubren hindi, ingles indio, hinglish y ingles limpio respectivamente. La innovacion tecnica del proyecto WSP consiste en la modificacion selectiva de registros de pesos (entre 2 y 326 de los 529 registros `.cact`) mediante calibracion quirurgica, sin reentrenamiento completo. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a un modelo ASR).

## Capacidades

- Reconocimiento automatico del habla (ASR) en hindi, ingles indio e hinglish con code-switching.
- Transcripcion de audio con metricas reportadas de WER estricto y WER semantico.
- Despliegue en el borde mediante el formato `.cact` (4-bit) y el runtime C++ `needle` con decodificacion por haces (1-beam y 5-beam).
- Soporte de inferencia en GPU (1-beam) y en CPU mediante el runtime C++.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo thinking.
- Capacidades multilingues limitadas a hindi, ingles e hinglish; no se mencionan otros idiomas.

## Casos de uso

- Transcripcion de reuniones y llamadas en entornos corporativos indios: el modelo maneja code-switching hindi-ingles, frecuente en contextos profesionales, con WER semantico reportado del 18,94% en `mucs_hinglish` (5-beam).
- Subtitulado automatico de contenido audiovisual en hindi: con un WER estricto del 17,11% en FLEURS-hi (frente al 74,47% del baseline), es adecuado para generar subtitulos con revision humana posterior.
- Asistentes de voz embebidos en dispositivos de bajo consumo: el checkpoint `.cact` de 29,5 MB y el runtime C++ `needle` permiten despliegue en hardware limitado sin GPU dedicada.
- Atencion al cliente automatizada por voz en India: la combinacion de hindi e ingles indio cubre interacciones reales de usuarios bilingues, con WER semantico del 11,86% en Svarah-en.
- Dictado y transcripcion de notas clinicas o legales en hindi: el WER estricto del 17,11% en FLEURS-hi permite borradores utiles con correccion posterior.
- Investigacion en adaptacion eficiente de modelos ASR: los checkpoints WSP sirven como referencia para estudiar tecnicas de calibracion de pesos sin reentrenamiento, con diferencias medibles entre fases (6 a 11) y configuraciones (1-beam vs 5-beam).

## Benchmarks y rendimiento

Resultados reportados en la model card para el checkpoint `shruti_wsp_phase11_e16_e2e_fp16.cact` (C++ `needle` 5-beam, 300 clips):

| Conjunto | WER estricto | WER semantico | WordAcc | CharAcc | CER |
|---|---|---|---|---|---|
| Macro media 4 datasets (clean) | 15,31% | 9,64% | 90,36% | 95,70% | 4,30% |
| Macro media 5 datasets | 17,14% | 11,95% | 88,05% | 93,82% | no disponible |
| fleurs_hi (hindi) | 17,11% (baseline 74,47%) | 10,78% | 89,22% | 94,76% | no disponible |
| svarah_en (ingles indio) | 13,83% (baseline 24,71%) | 11,86% | 88,14% | 94,94% | no disponible |
| librispeech_en (ingles limpio) | 5,34% | 4,28% | 95,72% | 98,29% | 1,71% |

Resultados GPU 1-beam sobre 2.517 clips para el mismo checkpoint: macro media de 5 datasets de 25,31% WER estricto / 19,83% WER semantico. Para `shruti_wsp_phase11_e15_decoder_fp16.cact`: macro media 4 datasets clean de 18,90% WER estricto / 14,03% semantico. Para `shruti_wsp_phase9_e11_blocknorm.cact` (5-beam): `mucs_hinglish` 23,61% estricto / 18,94% semantico; `lahaja_hi` 24,50% estricto / 11,53% semantico.

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con modelos ASR de referencia como Whisper.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en formato `.cact` (29,5 MB de pesos 4-bit) y aproximadamente 0,5-1 GB en safetensors FP32 (212 MB de pesos mas activaciones).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobredimensionada; el modelo esta disenado para CPU y edge devices.
- Cabe en cualquier GPU consumer e incluso en dispositivos embebidos; el formato `.cact` apunta explicitamente a edge AI.
- Opciones de despliegue: runtime C++ `needle` (soporte de 1-beam y 5-beam), y presumiblemente safetensors via frameworks estandar; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shruti-Hinglish-WSP | 55,5 M | no disponible | hi, en, hinglish | Apache 2.0 | HuggingFace, GitHub |
| udgamlabs/Shruti (base) | 55,5 M | no disponible | hi, en | no disponible | HuggingFace |
| Whisper small (OpenAI) | 244 M | 30 s audio | multilingue | MIT | HuggingFace |
| Whisper tiny (OpenAI) | 39 M | 30 s audio | multilingue | MIT | HuggingFace |

No se dispone de datos de benchmarks comparativos directos con Whisper en la informacion proporcionada; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- La validacion se limita a los conjuntos reportados por el autor (FLEURS, Svarah, Lahaja, LibriSpeech, MUCS); no hay evaluacion independiente ni publicacion revisada por pares.
- El rendimiento en GPU 1-beam (25,31% WER estricto macro 5 datasets) es notablemente peor que en C++ 5-beam (17,14%), lo que indica sensibilidad a la configuracion de decodificacion.
- Los resultados de WER estricto siguen siendo altos en algunos conjuntos (p. ej., 23,61% en MUCS-hinglish), lo que limita su uso en produccion sin revision humana.
- Riesgo de alucinacion y errores en audio con ruido, acentos no indios o dominios no cubiertos por los datasets de calibracion.
- Soporte limitado a hindi, ingles e hinglish; no se documentan otros idiomas ni capacidades multimodales.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `udgamlabs/Shruti` debe verificarse por separado; no se detalla su licencia en la informacion disponible.
- El proyecto es un trabajo de investigacion con 0 descargas y 1 like en el momento de la consulta; no hay garantias de mantenimiento.
- El formato `.cact` y el runtime `needle` son especificos del ecosistema Cactus; la portabilidad a otros frameworks no esta documentada.

## Enlaces

- HuggingFace: https://huggingface.co/vishnushuggingface/shruti-hinglish-wsp
- GitHub (codigo, informes y scripts): https://github.com/vishnuteja7054/shruti-hinglish-wsp
- Modelo base: https://huggingface.co/udgamlabs/Shruti
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Svarah: https://huggingface.co/datasets/ai4bharat/Svarah
- Dataset Lahaja: https://huggingface.co/datasets/ai4bharat/Lahaja
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
