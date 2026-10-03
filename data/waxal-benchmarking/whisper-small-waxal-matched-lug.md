# waxal-benchmarking/whisper-small-waxal-matched-lug

## Resumen

`whisper-small-waxal-matched-lug` es un ajuste fino de `openai/whisper-small` (244M parametros) sobre el idioma luganda (codigo ISO `lug`), desarrollado por el equipo `waxal-benchmarking` en el marco del benchmark WAXAL ASR (arXiv:2606.02375). Su proposito no es ser un modelo de produccion, sino servir como ablacion de investigacion: reproduce exactamente la receta de entrenamiento del modelo leave-one-out `whisper-small-waxal-loo-lug`, pero entrenando unicamente con luganda en lugar de con las 18 lenguas restantes. De este modo se puede aislar el efecto de incluir o excluir una lengua concreta bajo un mismo protocolo experimental.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors compatibles con la libreria `transformers`, y fue entrenado durante 4.000 pasos con AdamW, learning rate 1e-5, batch size 16 y precision fp16 sobre una unica GPU NVIDIA H200. La receta no emplea token de idioma en la decodificacion, igual que el modelo leave-one-out, lo que resulta relevante porque el luganda no forma parte del conjunto de lenguas nativas soportadas por Whisper.

Su relevancia reside en el hallazgo negativo que documenta: con solo 5.455 enunciados de entrenamiento en luganda, el ajuste fino no consigue superar el sesgo previo del decodificador de Whisper, que tiende a detectar ingles por defecto. El resultado es una tasa de error de palabra (WER) de 283,0 sobre el split de test de luganda, muy por encima del 86,4 del modelo leave-one-out y del 21,6 del modelo por lengua publicado con la receta del benchmark. Se trata, por tanto, de un artefacto experimental util para estudiar deriva de idioma y regimenes de bajo recurso, no de un modelo recomendado para ASR en luganda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 (aproximadamente 244M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 segundos; limite de 448 tokens en las etiquetas de texto |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | luganda (`lug`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Small: un transformer encoder-decoder con procesamiento de audio en ventanas de 30 segundos a 16 kHz y una cabeza de decodificacion autoregresiva de texto limitada a 448 tokens por muestra. El modelo parte de los pesos de `openai/whisper-small` y se ajusta de forma supervisada sobre todas las locuciones en luganda del split de entrenamiento del dataset `google/WaxalNLP`, normalizadas con NFC, en minusculas y sin puntuacion, pero preservando diacriticos. Las etiquetas que exceden el limite de 448 tokens se truncan.

La receta es deliberadamente identica a la del modelo leave-one-out: 4.000 pasos, AdamW con learning rate 1e-5, 200 pasos de warmup, batch size 16, precision fp16 y una unica GPU NVIDIA H200. No se utiliza token de idioma en la decodificacion, lo que constituye el factor clave del fallo documentado. Con solo 5.455 enunciados de entrenamiento, el ajuste no logra reescribir el prior del detector de idioma de Whisper, que con frecuencia recae en ingles. Los autores verificaron que no se trata de sobreajuste: un reentrenamiento de 1.400 pasos (equivalente en epocas a las ejecuciones de ewe y fula) empeoro el comportamiento, con 192 de 638 enunciados desbocados y un WER de 373,6. El modelo leave-one-out, expuesto a unos 54.000 enunciados de 18 lenguas sin token de idioma, no muestra esa patologia.

## Capacidades

- Reconocimiento automatico de voz (ASR) sobre audio de 16 kHz mono, con salida de transcripcion en texto.
- Capacidad de transcripcion especifica para luganda, condicionada por el ajuste fino sobre el corpus WAXAL.
- Hereda del modelo base las capacidades genericas de Whisper (transcripcion multilingue, deteccion de idioma, traduccion a ingles), aunque el ajuste no las especializa y el detector de idioma opera de forma no fiable en este modelo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio generativo ni modo de razonamiento explicito.
- La decodificacion recomendada en la model card es greedy, sin token de idioma.

## Casos de uso

- Estudio de ablacion en investigacion ASR: permite comparar, bajo una unica receta, el efecto de entrenar con una sola lengua frente a entrenar con el resto del conjunto, aislando la contribucion del luganda al rendimiento del modelo leave-one-out.
- Analisis de deriva de idioma (language drift): el modelo es un caso de estudio documentado de como un detector de idioma preentrenado puede imponerse al ajuste fino en regimenes de bajos recursos, util para disenar estrategias de mitigacion.
- Referencia negativa en evaluaciones: sirve como linea base de "que ocurre cuando no se incluye token de idioma ni datos suficientes" frente a modelos con receta corregida.
- Validacion de pipelines de evaluacion WER/CER con `jiwer` sobre texto normalizado NFC, minusculas y diacriticos preservados.
- Reproduccion de experimentos: los pesos permiten replicar los resultados publicados (WER 283,0; CER 158,0) sobre el split de test de luganda de WAXAL, con 638 enunciados evaluados.
- Formacion y docencia en ASR de bajos recursos: ilustra de forma tangible los limites del ajuste fino supervisado cuando el volumen de datos es de apenas unos miles de enunciados.
- No se recomienda su uso en atencion al cliente, transcripcion de produccion ni cualquier aplicacion donde se espere una transcripcion fiable de luganda; para ello los autores remiten a `whisper-small-waxal-lug`.

## Benchmarks y rendimiento

| Configuracion | WER | CER |
|---|---|---|
| Leave-Luganda-out (18 lenguas restantes, misma receta) | 86,4 | 32,0 |
| Este modelo (solo luganda, misma receta) | 283,0 | 158,0 |
| Whisper-Small por lengua publicado (receta del benchmark) | 21,6 | no disponible |

Enunciados de test evaluados: 638. Decodificacion greedy sobre el split de test completo de luganda de WAXAL, con WER y CER calculados con `jiwer` sobre texto normalizado NFC, en minusculas y con diacriticos preservados.

Detalle del fallo: 124 de los 638 enunciados se convierten en ingles, con salidas repetitivas que superan en mas de tres veces la longitud de la referencia, lo que empuja el WER por encima de 100. Sobre los enunciados restantes, el WER es de 112,6. Un reentrenamiento de 1.400 pasos agravo el problema (192 de 638 desbocados, WER 373,6).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp16 para los 244M parametros, mas el coste de activaciones y buffers de audio; en la practica menos de 2 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el entrenamiento documentado se realizo en 1x NVIDIA H200, pero la inferencia no requiere hardware de gama alta.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; tambien es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: `transformers` (receta oficial de la model card), asi como otros runners compatibles con pesos Whisper (por ejemplo whisper.cpp, faster-whisper o servidores de inferencia tipo TGI/vLLM con soporte de encoder-decoder); no se documentan configuraciones oficiales para estos ultimos en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (luganda) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `whisper-small-waxal-matched-lug` (este modelo) | 244M | ventanas de 30 s / 448 tokens | 283,0 | apache-2.0 | HuggingFace |
| `whisper-small-waxal-loo-lug` | 244M | ventanas de 30 s / 448 tokens | 86,4 | no disponible en la informacion proporcionada | HuggingFace |
| `whisper-small-waxal-lug` (recomendado por los autores) | 244M | ventanas de 30 s / 448 tokens | 21,6 | no disponible en la informacion proporcionada | HuggingFace |
| `openai/whisper-small` (modelo base) | 244M | ventanas de 30 s / 448 tokens | no disponible | apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Deriva de idioma severa: el detector de idioma de Whisper recae en ingles porque el luganda no es una lengua nativa del modelo y la receta no emplea token de idioma. Esto afecta a 124 de 638 enunciados de test.
- Salidas repetitivas y desbocadas: las transcripciones erroneas superan en mas de tres veces la longitud de la referencia, lo que invalida el uso directo de la salida en cualquier pipeline de produccion.
- WER superior a 100 en la metrica global (283,0), lo que indica que la longitud de las hipotesis excede ampliamente la de las referencias.
- No es un modelo recomendado: los propios autores lo etiquetan como ablacion de investigacion y remiten a `whisper-small-waxal-lug` para uso real en luganda.
- Volumen de datos muy limitado: solo 5.455 enunciados de entrenamiento, insuficientes para reescribir el prior del modelo base.
- El reentrenamiento con mas pasos no corrige el problema; lo agrava, lo que descarta el sobreajuste como causa.
- Limitacion idiomatica: el modelo esta ajustado exclusivamente para luganda y no se ha validado su comportamiento en otras lenguas.
- Riesgo de alucinacion y de transcripciones inventadas, inherente a los modelos generativos de ASR y acentuado por el fallo de deriva de idioma.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su explotacion en produccion sin una reevaluacion previa.
- La truncacion de etiquetas por encima de 448 tokens puede degradar el aprendizaje en locuciones largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-matched-lug
- Modelo leave-one-out de referencia: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-loo-lug
- Modelo recomendado para luganda: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-lug
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset: https://huggingface.co/datasets/google/WaxalNLP
- Paper del benchmark WAXAL ASR: https://arxiv.org/abs/2606.02375
- Version HTML del paper: https://arxiv.org/html/2606.02375v1
- Lynguallabs: https://lynguallabs.org/
- Open Token: https://opentoken.global/
- CMU Africa: https://www.africa.engineering.cmu.edu/
