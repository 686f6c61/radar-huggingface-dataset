# TujiaNLP/tujia-tts-v0.5

## Resumen

tujia-tts v0.5 (identificador interno `vits_tujia-v0.5`, versión `0.5.0a1`) es un modelo de síntesis de voz (text-to-speech) para el idioma tujia, una lengua minoritaria en peligro de extinción hablada en China. Lo desarrolla el grupo TujiaNLP y se distribuye como un único grafo ONNX de aproximadamente 63,4 MB, pensado para ejecutarse con onnxruntime. El modelo es de un solo hablante (la voz denominada `badou`) y genera audio mono a 16 kHz.

La entrada no es texto en caracteres chinos, sino notación fonética: pinyin Ye (la transcripción de Ye De-shu, con letras de tono `x/f/r/v`) o IPA con tonos. El modelo no acepta caracteres chinos y delega el troceado silábico y el análisis de iniciales/finales en la librería `tujia-nlp`. La arquitectura es VITS con hop 256 y upsampling 8/8/4, con un vocabulario de 40 símbolos (34 fonemas, cinco tokens de tono `T0`–`T4` y cuatro tokens de control).

Es relevante porque aborda un caso de bajos recursos (4,66 horas de audio útil) para una lengua con muy poca tecnología de voz disponible, y porque documenta con transparencia sus limitaciones: es una versión preliminar, el entrenamiento seguía en curso en el momento de la publicación (epoch 162 de una programación de 400) y presenta un problema conocido de deriva en la duración a nivel de frase. Está pensado para investigación y prototipado, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference TTS), hop 256, upsample 8/8/4 |
| Parametros totales | no disponible (pesos ONNX de 63.354.317 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS, entrada fonética por sílabas) |
| Tipos de cuantizacion | no disponible (se distribuye un ONNX en precisión original) |
| Idiomas soportados | zh (tujia, con notación pinyin Ye o IPA con tonos) |
| Licencia | research-preview (uso solo de investigación; código MIT, pesos bajo NOTICE) |
| Formato de pesos | ONNX (opset 15, IR 8) + `.onnx.json` |

## Arquitectura y entrenamiento

El modelo es un VITS de un solo hablante. El `SynthesizerTrn` no tiene condicionamiento por hablante: el grafo ONNX expone exactamente tres entradas (`input`, `input_lengths`, `scales`) y carece de canal `emb_g`/`sid`, de modo que cambiar de voz exige cambiar de fichero de modelo. El vocabulario tiene 40 símbolos: 34 fonemas más `T0`–`T4` y cuatro tokens de control; los finales `-ng` se representan como `aŋ/eŋ/iŋ/oŋ` y `z/c/s/r + i` se mapean a `ɿ`. Los símbolos fuera de la tabla se descartan y se contabilizan en `n_unknown` en lugar de lanzar error.

Los datos de entrenamiento son 9.757 clips que suman 4,655 horas. La corpus original es multihablante (17 hablantes), pero cada clip se pasó por conversión de voz hacia la voz consentida `badou` y se igualó en ecualización antes del entrenamiento, de modo que el modelo nunca ve el timbre crudo de los demás hablantes ni puede reproducir sus voces. El checkpoint publicado corresponde al epoch 162 de una programación de 400 epochs. No hay información sobre uso de RLHF/DPO ni sobre composición detallada del corpus más allá de estas cifras. El preprocesado de texto incluye normalización de notación, troceado silábico y análisis inicial/final mediante `tujia-nlp`, conversión a IPA y adición de un token de tono por sílaba; el postprocesado de audio recorta silencios (−40 dBFS respecto al pico, margen de 30 ms), normaliza a −1 dBFS y aplica fundidos de 10 ms.

## Capacidades

- Síntesis de voz a partir de notación fonética tujia: pinyin Ye con letras de tono (`x/f/r/v`) o IPA con tonos.
- Salida de audio mono a 16 kHz en una única voz (`badou`).
- Control limitado de velocidad mediante `length_scale` (único parámetro de ajuste).
- Gestión robusta de símbolos desconocidos: se descartan y se cuentan en `n_unknown`.
- Postprocesado integrado de la forma de onda (recorte de silencios, normalización de pico, fundidos).
- No soporta caracteres chinos, tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Investigación en TTS de bajos recursos: sirve como referencia reproducible para estudiar técnicas de aumento de datos mediante conversión de voz en lenguas con corpus escasos, comparando con las versiones v0.2–v0.4 del mismo proyecto.
- Prototipado de interfaces de voz en tujia: permite construir demos de lectura de frases en pinyin Ye o IPA para validar flujos de interacción antes de invertir en un modelo final.
- Material de demostración para la comunidad: generar audios de ejemplo que hablantes nativos revisen antes de su difusión en contextos comunitarios o educativos.
- Evaluación de pipelines fonéticos: al integrarse con `tujia-nlp`, permite probar el troceado silábico, el análisis inicial/final y la normalización de tonos de extremo a extremo.
- Docencia e investigación lingüística: producir estímulos auditivos controlados a partir de transcripciones IPA con tonos para experimentos de percepción, siempre con revisión de hablantes nativos.
- Pruebas de despliegue en entornos ligeros: su tamaño (63 MB) y formato ONNX permiten ejecutarlo en CPU con onnxruntime para validar latencia y calidad en prototipos embebidos.

## Benchmarks y rendimiento

| Metrica | v0.4 | v0.5.0a1 |
|---|---|---|
| Clips / horas | 3.881 / 6,47 h | 9.757 / 4,66 h |
| Simbolos | 41 | 40 |
| Perdida mel de validacion | 0,4195 | 0,4700 (epoch 162) |
| Sonda ASR de ida y vuelta | 0,972 | no ejecutada aun |
| Duracion silabica mediana vs humano | 221 ms (humano 222 ms) | ver problemas conocidos |

El autor advierte explicitamente de que los valores de `val_mel` de v0.4 y v0.5 no son comparables: se calcularon sobre particiones de validación distintas y con inventarios de 41 y 40 símbolos respectivamente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el grafo ONNX ocupa unos 63 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte de onnxruntime (por ejemplo, RTX 4090, A100 o H100) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en cualquier modelo actual; también en CPU.
- Opciones de despliegue: onnxruntime (librería declarada), con posibilidad de exportación a otros runtimes ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo TTS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tujia-tts v0.5.0a1 | no disponible (63 MB ONNX) | no aplica | val_mel 0,4700 (epoch 162); sin sonda ASR | research-preview | Hugging Face |
| tujia-tts v0.4 | no disponible | no aplica | val_mel 0,4195; sonda ASR 0,972 | research-preview | Hugging Face |
| Otros TTS para lenguas minoritarias | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros en la documentación proporcionada.

## Limitaciones y advertencias

- Deriva de duración a nivel de frase: frente al epoch 152 de la misma ejecución, este checkpoint es un 20 % más largo en el test fijo de 53 líneas, con mediana de línea 1,20× y algunas líneas hasta 2,24×; el predictor de duración es inestable en ciertos patrones de frase.
- El tono es aproximado: los tokens de tono provienen de la anotación del corpus y no se modelan sandhi ni alargamientos enfáticos.
- El timbre es convertido, no grabado: todo el audio de entrenamiento es salida de conversión de voz hacia `badou`; voces de origen muy susurrantes o muy jóvenes pueden dejar artefactos.
- Las palabras monosílabas son el punto más débil, sensibles a la prosodia y a la tasa de 16 ms por fotograma.
- Sin control de prosodia: no hay SSML, pausas ni énfasis; `length_scale` es el único ajuste.
- La tabla de fonemas cambió (41 → 40 símbolos): los `.onnx.json` de v0.4 no son intercambiables con este modelo.
- Es una versión preliminar con entrenamiento en curso; no se debe fijar en sistemas de producción.
- Licencia de solo investigación: el uso comercial o la redistribución requieren una revisión de derechos; el código es MIT pero los pesos están bajo NOTICE.
- No apto para material educativo o de publicación sin revisión de hablantes nativos, ni para afirmar que la salida es la grabación de una persona real.
- El tujia está en peligro de extinción; las salidas deben revisarse por hablantes nativos antes de uso comunitario o educativo.

## Enlaces

- Hugging Face: https://huggingface.co/TujiaNLP/tujia-tts-v0.5
- Aviso de licencia (NOTICE): https://github.com/ibaibing/tujia-tts/blob/main/NOTICE
- Repositorio del proyecto: https://github.com/ibaibing/tujia-tts
