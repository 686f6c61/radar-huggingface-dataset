# vipul-modelupload/vani-hinglish-coreml

## Resumen

`vani-hinglish-coreml` es un repositorio de distribucion de modelos de reconocimiento automatico del habla (ASR) convertidos a Core ML para su ejecucion en dispositivos Apple (iPhone, iPad y Mac con Apple Silicon). Lo publica el usuario `vipul-modelupload` como parte de la aplicacion Vani, y no contiene pesos entrenados desde cero: empaqueta conversiones de modelos de terceros en archivos Apple Archive (`.aar`) que la app descarga y descomprime en tiempo de ejecucion.

El nucleo del repositorio son dos fine-tunes de Whisper de Oriserve, `Whisper-Hindi2Hinglish-Swift` (72,6 M de parametros, fp16) y `Whisper-Hindi2Hinglish-Apex` (0,8 B de parametros, cuantizado a 4 bits con palettizacion), especializados en transcribir habla code-switching hindi-ingles (hinglish) usando alfabeto latino. Se complementan con dos conversiones a Core ML de modelos NVIDIA Parakeet (TDT 0.6B v2 y CTC 110M) realizadas por FluidInference, orientadas a ingles y a la funcionalidad de vocabulary boosting.

Su relevancia es practica: demuestra un patron de despliegue de ASR completamente on-device en el ecosistema Apple, sin llamadas a servidor, usando WhisperKit y FluidAudio como runtimes. El interes tecnico esta en la cadena de conversion (whisperkittools), en la compresion agresiva del modelo grande (4-bit palettized) y en la ausencia de cabezas de alineacion en los fine-tunes, lo que elimina los timestamps a nivel de token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) para los modelos hinglish; Parakeet TDT/CTC (FastConformer) para los modelos ingleses |
| Parametros totales | 72,6 M (`hinglish-fast`), 0,8 B (`hinglish-best`), 0,6 B (`parakeet-en`), 110 M (`parakeet-vocab`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper: 30 s por segmento, no confirmado en la model card) |
| Tipos de cuantizacion | fp16 (`hinglish-fast`), 4-bit palettized (`hinglish-best`); Parakeet sin cuantizacion indicada |
| Idiomas soportados | hi, en (hinglish code-switching en los modelos Oriserve; solo ingles en Parakeet) |
| Licencia | Apache-2.0 (modelos hinglish); CC-BY-4.0 (Parakeet y conversiones de FluidInference) |
| Formato de pesos | Core ML (`.mlmodelc` empaquetados en Apple Archive `.aar`) |

## Arquitectura y entrenamiento

Los modelos hinglish derivan de la familia Whisper: un encoder que procesa espectrogramas mel y un decoder autorregresivo que genera tokens de texto. Oriserve realizo el fine-tuning sobre `Whisper-Hindi2Hinglish-Swift` y `Whisper-Hindi2Hinglish-Apex` para transcribir habla mezclada hindi-ingles en caracteres latinos; la model card indica que la receta de decodificacion correcta es `task=transcribe` con `language=en`. No se detallan en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

La conversion a Core ML se hizo con `whisperkittools` de Argmax, generando tres submodelos por carpeta (`AudioEncoder`, `TextDecoder`, `MelSpectrogram`) mas los ficheros del tokenizer. Una consecuencia tecnica relevante es que los fine-tunes carecen de cabezas de alineacion, por lo que no se emiten timestamps a nivel de token. El modelo grande se comprime a 4 bits con palettizacion para reducir el archivo a 407 MB. Los modelos Parakeet son conversiones directas de NVIDIA (TDT 0.6B v2 y CTC 110M) realizadas por FluidInference, redistribuidas sin modificaciones y cargadas por FluidAudio.

## Capacidades

- Transcripcion de voz a texto on-device en dispositivos Apple, sin conexion a red.
- Reconocimiento de habla code-switching hindi-ingles con salida en alfabeto latino (romanizacion), por ejemplo "kal ki meeting mein roadmap discuss karenge".
- Dos perfiles de calidad/velocidad para hinglish: `hinglish-fast` (72,6 M, fp16, 128 MB) y `hinglish-best` (0,8 B, 4-bit, 407 MB).
- Transcripcion en ingles con Parakeet TDT 0.6B v2, con puntuacion y mayusculas gestionadas por el runtime FluidAudio.
- Vocabulary boosting en ingles mediante Parakeet CTC 110M, que permite sustituir terminos propios del usuario en la salida cuando el audio lo respalda.
- Integracion con los runtimes WhisperKit (modelos hinglish) y FluidAudio (modelos Parakeet).
- No se documentan capacidades de traduccion, diarizacion de hablantes ni timestamps por token.

## Casos de uso

- Notas de voz y actas de reunion en entornos laborales indios: la app puede transcribir intervenciones que alternan hindi e ingles y entregar el texto en caracteres latinos, lo que facilita su copia a correo o herramientas ofimaticas sin pasar por un servidor.
- Dictado en apps de mensajeria para usuarios bilingues: `hinglish-fast` (128 MB) permite dictado en tiempo real en iPhone con baja huella de memoria, adecuado para frases cortas y consultas rapidas.
- Subtitulado local de grabaciones: `hinglish-best` ofrece mayor precision en audio ruidoso o con acentos marcados, a costa de 407 MB y mayor latencia, apropiado para procesamiento por lotes en Mac.
- Asistentes de voz con vocabulario propio: el par `parakeet-en` + `parakeet-vocab` permite que el usuario registre nombres de personas, productos o jerga tecnica y el sistema los reconozca en ingles mediante vocabulary boosting.
- Aplicaciones de accesibilidad: transcripcion en vivo de conversaciones para personas con dificultades auditivas, ejecutada integramente en el dispositivo para preservar la privacidad del audio.
- Cumplimiento y privacidad en sectores regulados: al no requerir envio de audio a la nube, el patron encaja en entornos sanitarios o financieros donde el audio no puede salir del dispositivo.
- Prototipado rapido de ASR en Apple Silicon: los `.aar` se descomprimen con `aa extract` en un Mac y pueden probarse con WhisperKit o FluidAudio sin reentrenar ni reconvertir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, latencia ni comparaciones numericas frente a otros modelos.

## Requisitos de hardware

- Inferencia prevista en iPhone, iPad y Mac con Apple Silicon mediante Core ML; no se contempla GPU NVIDIA ni CUDA.
- Huella en disco de los artefactos: 128 MB (`hinglish-fast`), 407 MB (`hinglish-best`), 440 MB (`parakeet-en`) y 86 MB (`parakeet-vocab`).
- VRAM/RAM estimada: no disponible de forma explicita; el tamano de los archivos sugiere que `hinglish-fast` puede ejecutarse con holgura en iPhone modernos y que `hinglish-best` requiere un dispositivo con mas memoria unificada.
- Despliegue: WhisperKit (modelos hinglish) y FluidAudio (Parakeet); la descompresion de los `.aar` se realiza en un Mac con `aa extract`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `hinglish-fast` (este repo) | 72,6 M | hi, en (hinglish) | Core ML | Apache-2.0 | Conversion de Oriserve Swift, fp16, 128 MB |
| `hinglish-best` (este repo) | 0,8 B | hi, en (hinglish) | Core ML | Apache-2.0 | Conversion de Oriserve Apex, 4-bit palettized, 407 MB |
| `parakeet-en` (este repo) | 0,6 B | en | Core ML | CC-BY-4.0 | Conversion de NVIDIA TDT 0.6B v2 por FluidInference |
| Whisper large-v3 | no disponible | multilingue | safetensors, GGUF, Core ML | MIT (upstream) | Referencia general de ASR; no especializado en hinglish |
| NVIDIA Parakeet TDT 0.6B v2 (original) | 0,6 B | en | NeMo | CC-BY-4.0 | Version sin convertir, pensada para GPU NVIDIA |

No se dispone de datos de rendimiento comparativo (WER) en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Repositorio de distribucion, no de entrenamiento: el autor solo cambia el formato; el merito y la responsabilidad del comportamiento recaen en Oriserve (hinglish) y NVIDIA (Parakeet).
- Sin timestamps a nivel de token en los modelos hinglish, al carecer de cabezas de alineacion; esto limita subtitulado preciso y sincronizacion fina.
- Los modelos hinglish estan pensados para decodificarse con `language=en` y `task=transcribe`; usar otra configuracion puede degradar la salida.
- Parakeet es exclusivamente ingles; no cubre hindi ni code-switching.
- Riesgo de alucinacion en pasajes de audio ruidoso o silencioso, comun en modelos Whisper.
- Sesgos no documentados: no se detalla la composicion del dataset de fine-tuning ni la representacion de acentos o dialectos.
- Restricciones de licencia: los modelos hinglish son Apache-2.0, pero Parakeet y las conversiones de FluidInference son CC-BY-4.0, lo que exige atribucion en productos derivados.
- Dependencia del ecosistema Apple y de los runtimes WhisperKit/FluidAudio; no es portable a CUDA sin reconversion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/vipul-modelupload/vani-hinglish-coreml
- Modelo base hinglish rapido: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Swift
- Modelo base hinglish de alta calidad: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Apex
- Modelo base Parakeet TDT 0.6B v2: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Conversion Core ML de Parakeet por FluidInference: https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v2-coreml
- Conversion Core ML de Parakeet CTC 110M: https://huggingface.co/FluidInference/parakeet-ctc-110m-coreml
- WhisperKit (runtime): https://github.com/argmaxinc/WhisperKit
- whisperkittools (herramientas de conversion): https://github.com/argmaxinc/whisperkittools
- FluidAudio (runtime): https://github.com/FluidInference/FluidAudio
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
