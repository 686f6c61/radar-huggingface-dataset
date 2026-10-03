# waxal-benchmarking/whisper-small-waxal-matched-ewe

## Resumen

`whisper-small-waxal-matched-ewe` es un ajuste fino de `openai/whisper-small` (242 M de parametros) sobre el idioma ewe, desarrollado por el colectivo `waxal-benchmarking` como parte del benchmark WAXAL ASR (arXiv:2606.02375). No es un modelo recomendado para produccion, sino una ablacion de investigacion: se entreno exclusivamente con ewe replicando exactamente la receta del modelo leave-one-out `whisper-small-waxal-loo-ewe`, de forma que la comparacion entre "entrenado en ewe" y "entrenado en los otros 18 idiomas" se haga bajo condiciones identicas.

El objetivo es aislar el efecto del idioma en el rendimiento del reconocimiento automatico del habla (ASR) sobre lenguas africanas de bajos recursos. El resultado es contundente: el ajuste especifico en ewe reduce el WER del 101,4 % al 78,7 % respecto a la variante que excluye ewe del entrenamiento, pero sigue muy lejos del 32,3 % que alcanza el modelo por idioma publicado con la receta del benchmark.

El modelo resuelve el problema de la transcripcion de voz en ewe (16 kHz mono, salida normalizada NFC minúscula sin puntuacion y con diacriticos preservados). Su relevancia es metodologica: cuantifica cuanto aporta el entrenamiento en el idioma objetivo frente al ajuste de receta y demuestra que la coincidencia idioma-datos, mas que el tamano del modelo, es el factor dominante del rendimiento relativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 (242 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio fija de 30 s (entrada de encoder); limite de 448 tokens en las etiquetas del decoder |
| Tipos de cuantizacion | No se publican variantes cuantizadas en el repositorio; admite cuantizacion estandar de transformers (int8/fp16 via bitsandbytes o equivalente) |
| Idiomas soportados | Ewe (unico idioma de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | openai/whisper-small |
| Dataset de entrenamiento | google/WaxalNLP (split train de ewe) |
| Tamano del repositorio | 1,0 GB |
| Frecuencia de muestreo | 16 kHz mono |

## Arquitectura y entrenamiento

Arquitectura Whisper estandar: transformer encoder-decoder con encoder convolucional sobre espectrogramas mel. El modelo parte de `openai/whisper-small` (244 M) y se ajusta con todos los enunciados de ewe del split de entrenamiento de `google/WaxalNLP`, a 16 kHz mono. Las transcripciones se normalizan a NFC, se convierten a minusculas, se elimina la puntuacion y se preservan los diacriticos. Las etiquetas de mas de 448 tokens se truncan. No se usa token de idioma, igual que en el modelo leave-one-out, para mantener la paridad de receta.

La receta de entrenamiento es deliberadamente fija y minimalista: 4.000 pasos, optimizador AdamW con learning rate 1e-5, 200 pasos de warmup, batch size 16 y precision fp16 sobre una unica GPU NVIDIA H200. No se documenta RLHF ni DPO. La unica innovacion destacable es metodologica: la replicacion exacta de la receta del modelo leave-one-out para aislar el efecto del idioma como variable unica.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ewe a partir de audio de 16 kHz mono.
- Transcripcion de audio de hasta 30 segundos por ventana.
- Generacion de texto plano normalizado (NFC, minusculas, sin puntuacion, con diacriticos).
- Decodificacion greedy orientada a evaluacion con `jiwer` (WER y CER).
- Uso mediante la pipeline `automatic-speech-recognition` de transformers.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio como salida ni otros idiomas.

## Casos de uso

- Investigacion en ASR de bajos recursos: el modelo sirve como punto de control para medir la contribucion del entrenamiento especifico de idioma frente a recetas multilingues, gracias a su paridad exacta con `whisper-small-waxal-loo-ewe`.
- Ablaciones controladas de idioma: al compartir receta con el modelo leave-one-out, permite comparar escenarios "con ewe" y "sin ewe" sin introducir otras variables.
- Validacion de recetas de ajuste fino: util para comprobar si una receta concreta (4000 pasos, lr 1e-5, batch 16, fp16) es suficiente para un idioma concreto antes de escalar a mas lenguas.
- Generacion de transcripciones de referencia en ewe: con un WER del 78,7 % se emplea en tareas de exploracion y no como salida de produccion.
- Reproducibilidad de resultados del benchmark WAXAL: permite replicar la tabla de resultados del paper (arXiv:2606.02375) sobre el split de test de ewe (1891 enunciados).
- Punto de partida para ajustes posteriores: al ser un modelo pequeno (242 M) y licencia Apache 2.0, se puede reajustar o destilar en pipelines de investigacion sin restricciones legales.
- Analisis comparativo de tokens de idioma: al prescindir de token de idioma, sirve para estudiar el impacto de esta decision de diseno en modelos ASR multilingues.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el split de test de ewe de WAXAL (1891 enunciados, decodificacion greedy, WER/CER con `jiwer` sobre texto NFC en minusculas con diacriticos):

| Configuracion | WER | CER |
|---|---|---|
| Leave-Ewe-out (18 idiomas restantes, misma receta) | 101,4 | 56,8 |
| Este modelo (solo ewe, misma receta) | 78,7 | 53,1 |
| Whisper-Small por idioma publicado (receta del benchmark) | 32,3 | no disponible |

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 0,5 GB solo para los pesos; con activaciones y buffer de audio, se recomienda al menos 1-2 GB de VRAM.
- VRAM en fp32: cerca de 1 GB solo para pesos; con overhead de inferencia, 2-3 GB.
- VRAM en int8: aproximadamente 0,25 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequenos.
- GPU recomendadas para entrenamiento o lotes grandes: al menos una GPU de datacenter; el autor entreno con 1x NVIDIA H200.
- Opciones de despliegue: transformers (referencia oficial), y por compatibilidad de arquitectura Whisper, tambien faster-whisper, whisper.cpp, vLLM (con soporte Whisper) y TGI. No se han publicado pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al ser un modelo de 242 M sobre audio de 30 s, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER ewe (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-waxal-matched-ewe (este) | 242 M | 30 s de audio | 78,7 | Apache 2.0 | HuggingFace |
| whisper-small-waxal-loo-ewe | 242 M | 30 s de audio | 101,4 | Apache 2.0 | HuggingFace |
| whisper-small-waxal-ewe (receta del benchmark) | 242 M | 30 s de audio | 32,3 | Apache 2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s de audio | no disponible | Apache 2.0 | HuggingFace |
| MMS-300M | 300 M | no disponible | no disponible | no disponible | no disponible |
| Whisper Tiny | 39 M | 30 s de audio | no disponible | Apache 2.0 | HuggingFace |

Nota: la comparacion con MMS-300M y Whisper Tiny aparece mencionada en el material de busqueda del benchmark WAXAL, pero no se proporcionan cifras concretas de WER para ewe en la informacion disponible.

## Limitaciones y advertencias

- Modelo de ablacion, no recomendado para uso en produccion: el propio autor indica que para ASR en ewe debe usarse `whisper-small-waxal-ewe`.
- WER del 78,7 % sobre el split de test de ewe: un nivel de error muy alto para cualquier aplicacion real; el modelo falla en la mayoria de las transcripciones a nivel de palabra.
- No se documentan sesgos especificos, pero al entrenarse sobre un unico corpus (google/WaxalNLP) hereda sus sesgos de dominio, acento y registro.
- Riesgo elevado de alucinacion y de sustituciones incorrectas dado el WER y CER reportados.
- Limitacion de idioma estricta: solo ewe; no soporta otros idiomas ni cambio de codigo.
- Sin token de idioma: no se puede forzar o cambiar el idioma de salida mediante este mecanismo.
- Contexto acotado a ventanas de 30 s de audio y etiquetas de 448 tokens; los audios o transcripciones mas largas se truncan.
- Licencia Apache 2.0: permite uso comercial, pero las condiciones de reproduccion del benchmark (paper y receta) deben respetarse para resultados comparables.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el 3 de octubre de 2026: sin validacion externa ni comunidad de usuarios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-matched-ewe
- Modelo leave-one-out de referencia: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-loo-ewe
- Modelo recomendado para ewe: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-ewe
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset: https://huggingface.co/datasets/google/WaxalNLP
- Paper (arXiv:2606.02375): https://arxiv.org/abs/2606.02375
- Paper en HTML: https://arxiv.org/html/2606.02375v1
- Ficha en ResearchGate: https://www.researchgate.net/publication/405683260_WAXAL-NET_Finetuned_Edge_ASR_Across_19_African_Languages
- Blog de Google Research sobre WAXAL: https://research.google/blog/waxal-a-large-scale-open-resource-for-african-language-speech-technology/
- Lynguallabs: https://lynguallabs.org/
- Open Token: https://opentoken.global/
- CMU Africa: https://www.africa.engineering.cmu.edu/
