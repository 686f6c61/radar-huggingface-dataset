# TujiaNLP/tujia-ctc-v0.4

## Resumen

tujia-ctc v0.4 es un sistema de reconocimiento automático del habla (ASR) especializado en tujia (código ISO 639-3 `tji`), una lengua sino-tibetana de la familia tibeto-birmana hablada en China y considerada en peligro. Lo desarrolla el grupo TujiaNLP y su rasgo diferencial es que no se limita a transcribir sílabas: devuelve etiquetas silábicas con marca tonal (`la35`, `tsʰi53`, `ɕie35`), algo poco habitual en ASR de bajos recursos. El modelo parte de un encoder wav2vec2-XLSR-53 ya ajustado y añade una cabeza ligera con dos salidas, una de 932 clases silábicas sin tono y otra de 4 clases tonales.

La versión 0.4 supone un salto cualitativo respecto a la 0.3: sustituye la cabeza única de 1.198 clases con tono por el esquema desacoplado sílaba+tono y amplía los datos de entrenamiento con grabaciones de encuestas de campo del norte y del sur del área de estudio. Sobre un conjunto de test de 840 clips de encuesta de campo, el error a nivel de sílaba (SER) baja de 0,7652 a 0,2132 y el error tonal de 0,5616 a 0,2054.

El modelo es deliberadamente pequeño en su parte entrenable: solo ~4,69 M de parámetros en la cabeza (19 MB), mientras que el encoder ajustado (~1,26 GB) se distribuye por separado. Es relevante para lingüistas de campo, documentación de lenguas en peligro y desarrolladores que necesiten un pipeline ASR de bajo coste para una lengua con pocos recursos y sistema tonal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-XLSR-53 (encoder ajustado) + LayerNorm + 2×BiLSTM(256) + cabeza silábica (932 clases + blank) y cabeza tonal (4 clases) |
| Parametros totales | no disponible (encoder ~1,26 GB distribuido aparte; cabeza ~4,69 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio procesado a 50 Hz de frames; clips muy cortos, < 8 frames del encoder, no devuelven sílabas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tujia (`tji`) |
| Licencia | pesos: research use only; código: MIT; encoder base: Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch) para la cabeza; encoder en directorio con `config.json` y pesos |

## Arquitectura y entrenamiento

La arquitectura es un pipeline CTC híbrido: un encoder wav2vec2-XLSR-53 preentrenado (`facebook/wav2vec2-xlsr-53-espeak-cv-ft`, Apache-2.0) y ajustado en la ejecución `v03f`, seguido de LayerNorm, dos capas BiLSTM de 256 unidades y dos cabezas paralelas que operan a 50 Hz. La cabeza principal predice una de 932 sílabas sin tono más el blank; la cabeza tonal predice `{none, 55, 35, 21, 53}`. En decodificación, la secuencia de sílabas proviene de la cabeza principal y el tono se asigna en el frame donde la probabilidad de esa sílaba alcanza su pico, ignorando la clase `none`. Este desacople mantiene alineadas las secuencias de sílabas y tonos aunque las dos cabezas discrepen en longitud.

Los datos de entrenamiento combinan un corpus tujia de terceros con grabaciones de encuestas de campo de las áreas norte y sur, sumando 17.134 filas y 16,2 horas de audio. La mejor época fue la 34. No hay información sobre uso de RLHF, DPO ni decodificación especulativa. La decodificación es CTC voraz (greedy), sin modelo de lenguaje ni rescoring con n-gramas en este paquete; el paquete `tujia-asr` añade decodificación léxica opcional.

## Capacidades

- Reconocimiento de habla a nivel de sílaba en tujia, con spans temporales (`start`, `end`) y probabilidad por sílaba.
- Etiquetado tonal explícito con cuatro tonos (`21`, `35`, `53`, `55`) asignados por frame de pico silábico.
- Salida en dos notaciones: IPA y `ye`, seleccionable con `--format`.
- Salida estructurada en JSON (`--json out.json`) y decodificación de un tramo concreto (`--start` / `--duration`).
- Entrada de 16 kHz mono WAV directa; otras frecuencias se remuestrean con torchaudio y el multicanal se mezcla a mono.
- Inventario cerrado de 932 sílabas sin tono; no genera etiquetas fuera de ese conjunto.
- No soporta tool calling, agentes, visión, audio de entrada más allá del ASR, ni capacidades multilingües fuera del tujia.

## Casos de uso

- Documentación lingüística de campo: el modelo transcribe grabaciones de encuesta con marcas tonales y timestamps, lo que permite alinear audio y transcripción para corpus anotados de una lengua en peligro con pocos hablantes.
- Anotación asistida de corpus tujia: dado que la decodificación es greedy y sin LM, se usa como primera pasada que el lingüista corrige; la columna `prob` y el recuento de sílabas sirven para detectar deleciones en pasajes de baja energía.
- Investigación fonética y tonal: los spans por sílaba y la etiqueta tonal permiten estudiar realizaciones de tono (`21/35/53/55`) y variación entre áreas de encuesta norte y sur.
- Herramientas de preservación y enseñanza: integración en aplicaciones de aprendizaje o diccionarios con audio para lenguas de bajos recursos, con la ventaja de un modelo de 19 MB sobre un encoder reutilizable.
- Pipelines de ASR de bajo coste: al ser una cabeza ligera sobre un encoder compartido, se puede desplegar en entornos con recursos limitados y servir varias tareas sobre el mismo encoder.
- Prototipado de ASR tonal: sirve como referencia metodológica para lenguas con tonos y pocos datos, replicando el esquema de cabeza silábica + cabeza tonal.
- Verificación de hipótesis en estudios comparativos: la comparación v0.3 vs v0.4 sobre los mismos clips (SER 0,7652 → 0,2132) permite evaluar el impacto del desacople sílaba/tono en la investigación.

## Benchmarks y rendimiento

| Metrica | v0.3 | v0.4 |
|---|---|---|
| SER de sílaba en test (840 clips de encuesta, 0,25 h) | 0,7652 | 0,2132 |
| SER tonal en test | 0,5616 | 0,2054 |
| SER conjunto con tono en test | no disponible | 0,3543 |
| SER de validación sobre datos antiguos | 0,6490 | 0,5571 |

Advertencia: el test está dividido por ítem léxico, no por hablante; todos los hablantes del test aparecen en entrenamiento, por lo que no es una métrica con hablantes retenidos y el valor real será peor que 0,2132.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el encoder pesa ~1,26 GB y la cabeza 19 MB, por lo que la huella es modesta y cabe en GPU de consumo.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con varios GB de VRAM es suficiente, incluidas RTX 3060/4060/4090.
- Cabe en GPU de consumo: sí, por el tamaño del encoder y la cabeza.
- Opciones de despliegue: script `infer.py` incluido con PyTorch y torchaudio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Nota de red: el encoder se descarga con `fetch_encoder.sh` desde Hugging Face o desde el espejo de ModelScope; en China continental se documentan `TUJIA_ENCODER_SOURCE=modelscope` y `HF_ENDPOINT=https://hf-mirror.com`.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tujia-ctc v0.4 | ASR CTC + cabezas sílaba/tono | tji | no disponible | research use only (pesos), MIT (código) | Hugging Face + ModelScope (encoder) |
| tujia-ctc v0.3 | ASR CTC con cabeza única de 1.198 clases con tono | tji | no disponible | research use only | Hugging Face |
| wav2vec2-XLSR-53 (`facebook/wav2vec2-xlsr-53-espeak-cv-ft`) | ASR multilingüe base | multilingüe | no disponible | Apache-2.0 | Hugging Face |

No se dispone de comparativas con otros sistemas ASR específicos de tujia en la información proporcionada.

## Limitaciones y advertencias

- Hablantes vistos: el test se divide por ítem léxico, no por hablante; no hay puntuación con hablantes retenidos y será peor que 0,2132.
- Deleciones en habla débil o rápida: el modelo infra-genera en regiones de baja energía; conviene revisar la columna `prob` y el recuento de sílabas al corregir.
- Inventario unificado: la tabla de sílabas fusiona variantes de notación entre áreas de encuesta; las sílabas dialectales raras fuera de las 932 etiquetas no se pueden emitir y aparecen como la etiqueta más cercana o como deleción.
- Sin modelo de lenguaje: la salida es CTC voraz sin léxico ni rescoring de n-gramas en este paquete.
- Licencia restrictiva: los pesos son solo para investigación; no se conceden derechos sobre las grabaciones ni transcripciones subyacentes, que no se distribuyen. El uso comercial de los pesos no está permitido.
- Atribución obligatoria: al derivar de `facebook/wav2vec2-xlsr-53-espeak-cv-ft` (Apache-2.0), debe mantenerse la atribución upstream según `NOTICE`.
- Cobertura limitada a un único idioma (`tji`) y a un dominio de encuesta de campo; el rendimiento fuera de ese dominio no está documentado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí hay riesgo de sustituciones por la etiqueta más cercana en el inventario cerrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TujiaNLP/tujia-ctc-v0.4
- Encoder ajustado: https://huggingface.co/TujiaNLP/tujia-xlsr53-v03f
- Encoder base: https://huggingface.co/facebook/wav2vec2-xlsr-53-espeak-cv-ft
- Espejo del encoder en ModelScope: https://modelscope.cn/models/TujiaNLP/tujia-xlsr53-v03f
- Espejo de Hugging Face para China continental: https://hf-mirror.com
