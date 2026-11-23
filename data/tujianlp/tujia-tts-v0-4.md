# TujiaNLP/tujia-tts-v0.4

## Resumen

tujia-tts v0.4 es un modelo de sintesis de voz (text-to-speech) de un solo hablante desarrollado por TujiaNLP para el tujia, una lengua minoritaria y en peligro de extincion hablada principalmente en la provincia china de Hunan. El modelo toma como entrada pinyin Ye (la transcripcion de Ye De-shu, con las letras tonales `x`/`f`/`r`/`v`) o IPA con tonos Chao, y genera audio mono a 16 kHz en una unica voz fija denominada "badou".

Tecnicamente es un VITS (`SynthesizerTrn`) de un solo hablante exportado a ONNX (opset 15) con un fichero de configuracion estilo piper (`.onnx.json`). Al no existir condicionamiento por hablante, el grafo ONNX tiene exactamente tres entradas (`input`, `input_lengths`, `scales`) y carece de canal `emb_g`/`sid`, por lo que cambiar de voz exige cambiar de fichero de pesos.

Es relevante como ejemplo de aplicacion de TTS neuronal a una lengua de bajos recursos: se entrena con solo 6,47 horas de audio (3.881 clips) y se publica como research preview para investigacion y prototipado, no para uso comercial. La version 0.4 es un fine-tune de 60 epocas sobre v0.3 que mejora la duracion silabica (221 ms frente a 185 ms, con 222 ms de referencia humana) y elimina los finales abruptos de clip.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (`SynthesizerTrn`), un solo hablante, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el repo ocupa 0,1 GB) |
| Idiomas soportados | tujia (`zh` como etiqueta de idioma en el repo) |
| Licencia | research-preview (pesos solo para investigacion; codigo MIT) |
| Formato de pesos | ONNX (opset 15) + `.onnx.json` estilo piper |

## Arquitectura y entrenamiento

El modelo es un VITS de un solo hablante: un `SynthesizerTrn` que mapea secuencias de fonemas IPA mas tokens de tono a mel-espectrogramas y, mediante el decoder generativo, a forma de onda a 16 kHz. El vocabulario interno consta de 41 simbolos (fonemas IPA mas tokens de tono `T0`–`T4`), con finales `-ng` codificadas como `aŋ/eŋ/iŋ/oŋ` y la regla `z/c/s/r + i → ɿ`. La tasa de frames es de 16 ms (hop 256 a 16 kHz).

El entrenamiento usa 3.881 clips que suman 6,47 horas, con el timbre unificado a la voz "badou" y clips rellenados con 150 ms de silencio final. El checkpoint v0.4 se obtiene por fine-tuning de 60 epocas desde v0.3, con una perdida de mel de validacion de 0,4195 (frente a 0,4523 en v0.3). Los corpus de entrenamiento son internos y no se distribuyen. El preprocesado de texto (normalizacion de notacion, silabificacion, separacion inicial/final) se delega al paquete `tujia-nlp`; el postprocesado de audio recorta silencios (−40 dBFS relativo al pico, margen de 30 ms), normaliza a −1 dBFS y aplica fundidos de 10 ms.

## Capacidades

- Sintesis de voz de un unico hablante ("badou") a partir de texto en pinyin Ye o IPA con tonos.
- Acepta dos notaciones de entrada: pinyin Ye con letras tonales (`x`=55, `f`=35, `r`=21, `v`=53) e IPA con digitos, superindices o letras Chao; las silabas sin tono se leen como `T3` (21).
- Control limitado de prosodia mediante el parametro `length_scale` (unico ajuste disponible).
- Postprocesado integrado de la forma de onda (recorte de silencios, normalizacion de pico, fundidos).
- Deteccion automatica de la notacion de entrada y descarte contabilizado de simbolos desconocidos (sin `KeyError` silencioso); entrada vacia genera error.
- No soporta caracteres chinos, SSML, pausas, enfasis, clonacion de voz ni seleccion multi-hablante.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Investigacion en TTS de bajos recursos: el modelo sirve como linea base reproducible para estudiar el efecto del tamano de corpus (1,87 h → 6,47 h) y del fine-tuning sobre la inteligibilidad en lenguas minoritarias.
- Prototipado de interfaces de audio en tujia: permite construir demos de lectura de frases y menus de voz para evaluar viabilidad antes de invertir en datos adicionales.
- Material de demostracion para la comunidad: generar audio de vocabulario comun que hablantes nativos revisen antes de su difusion en contextos educativos o culturales.
- Evaluacion comparativa de front-ends foneticos: al integrarse con `tujia-nlp` para silabificacion y conversion a IPA, sirve para validar reglas de transcripcion y tablas de simbolos.
- Pruebas de pipelines ONNX en produccion ligera: su grafo de tres entradas y su tamano de repo (0,1 GB) permiten desplegarlo con `onnxruntime` en entornos con recursos limitados para validar latencia y postprocesado.
- Estudio de prosodia y duracion silabica: la metrica de duracion mediana (221 ms en v0.4 frente a 222 ms humano) lo hace util para analizar el ajuste temporal de sintetizadores VITS en lenguas tonales.

## Benchmarks y rendimiento

| Metrica | v0.3 | v0.4 | Referencia humana |
|---|---|---|---|
| Tasa de error ASR, 100 frases reservadas (sintetizadas) | 0,973 | 0,972 | no disponible |
| Tasa de error ASR, mismas frases (grabaciones humanas) | 0,805 | 0,804 | 0,805 (suelo de ruido del ASR) |
| Perdida de mel de validacion | 0,4523 | 0,4195 | no aplica |
| Duracion mediana de silaba | 185 ms | 221 ms | 222 ms |
| Energia en los ultimos 100 ms, relativa al clip | 0,237 | 0,000 | no disponible |

En alineamiento forzado ZIPA sobre las mismas frases, la presencia de aspiracion en onset pasa de 0,556 a 0,634 (humano 0,802), mientras que nasales y laterales retroceden ligeramente (nasal 0,765 → 0,658; liquida 0,741 → 0,706). La presencia global de onset se mantiene practicamente igual (0,676 → 0,679; humano 0,805).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repo completo ocupa 0,1 GB, lo que sugiere un modelo pequeno apto para CPU.
- GPU recomendadas: no disponibles; al ejecutarse con `onnxruntime` puede correr en CPU y en GPUs consumer, pero no se publican requisitos oficiales.
- Cabida en GPU consumer: previsiblemente si por el tamano del repo, aunque no hay datos oficiales de consumo de memoria.
- Opciones de despliegue: `onnxruntime` (libreria declarada) con el front-end incluido en el paquete; no es compatible con el front-end estandar de piper (espeak-ng) porque usa `phoneme_type: "text"` con tokens de tono de dos caracteres.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tujia-tts v0.4 | VITS single-speaker, ONNX | no disponible | no aplica | research-preview | Hugging Face (TujiaNLP) |
| Piper (voces estandar) | VITS single/multi-speaker, ONNX | no disponible | no aplica | MIT (segun voces) | Repositorio piper |
| Modelos TTS multilingues comerciales | no disponible | no disponible | no disponible | propietaria | APIs comerciales |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en la informacion proporcionada; la comparacion con piper se limita a la incompatibilidad de front-end documentada por el autor.

## Limitaciones y advertencias

- El tono es aproximado: los tokens de tono se entrenan con la anotacion del corpus y no se modelan sandhi ni alargamientos enfaticos.
- Las palabras monosilabicas cortas son el punto mas debil, por su sensibilidad a la prosodia y a la tasa de frames de 16 ms.
- Sin control de prosodia: no hay SSML, pausas ni enfasis; `length_scale` es el unico parametro ajustable.
- Un solo hablante: no hay conversion de voz, clonacion ni seleccion multi-hablante.
- Las explosivas suenan difuminadas: la configuracion de 16 kHz y hop 256 da 16 ms por frame, mas grueso que una explosion de oclusiva; el audio sintetico es mas brillante que las grabaciones reales (proporcion de energia en banda alta 0,177 frente a 0,104) y las explosiones son menos densas.
- No es una voz de piper: el front-end estandar (espeak-ng) no puede manejarlo; hay que usar el front-end incluido.
- La tasa de error ASR del audio sintetizado (0,972) esta muy por encima del suelo humano (0,805); solo la diferencia entre filas es significativa.
- Licencia research-preview: los pesos son solo para investigacion; el uso comercial o la redistribucion requieren revision de derechos.
- El consentimiento de los hablantes no se ha confirmado por grabacion de origen.
- El tujia es una lengua en peligro: las salidas deben ser revisadas por hablantes nativos antes de su uso comunitario o educativo, y no deben presentarse como grabaciones de una persona real.

## Enlaces

- Hugging Face: https://huggingface.co/TujiaNLP/tujia-tts-v0.4
- Aviso de licencia (NOTICE): https://github.com/ibaibing/tujia-tts/blob/main/NOTICE
- Repositorio del proyecto: https://github.com/ibaibing/tujia-tts
- Paquete `tujia-nlp` (referenciado en la model card): no disponible como enlace directo en la informacion proporcionada.
