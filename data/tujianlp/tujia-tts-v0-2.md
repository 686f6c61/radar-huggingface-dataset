# TujiaNLP/tujia-tts-v0.2

## Resumen

`tujia-tts-v0.2` es un modelo de síntesis de voz (text-to-speech) de un solo hablante para el tujia, una lengua sinítica en peligro de extinción hablada principalmente en la provincia china de Hunan. Lo desarrolla TujiaNLP y se publica como una *research preview* de bajo recurso: el corpus de entrenamiento apenas alcanza las 4,10 horas (3.403 clips) unificadas a una única voz, «badou». La entrada no es texto en caracteres chinos, sino pinyin Ye (la transcripción de Ye De-shu, con las letras tonales `x/f/r/v`) o IPA con tonos Chao; la salida es audio mono a 16 kHz.

Arquitectónicamente es un VITS clásico (variational inference with adversarial learning for end-to-end TTS) exportado a ONNX opset 15, con un grafo `SynthesizerTrn` de hablante único que expone exactamente tres entradas (`input`, `input_lengths`, `scales`) y carece de canal `emb_g`/`sid`. El vocabulario fonético consta de 41 símbolos (fonemas IPA más los tokens tonales `T0`–`T4`). El paquete incluye un front-end propio que delega la segmentación silábica y la normalización tonal en la librería `tujia-nlp`.

Su relevancia es doble: por un lado, es una de las pocas herramientas públicas para una lengua con muy poca tecnología lingüística; por otro, documenta con inusual honestidad sus fallos (duración estocástica no determinista, tono aproximado, un solo hablante) y restringe explícitamente el uso a investigación y demostraciones revisadas por hablantes nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS, `SynthesizerTrn` de hablante único) exportado a ONNX opset 15 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada por frase/fonemas) |
| Tipos de cuantizacion | no disponible (se distribuye grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | tujia (`zh` como etiqueta de HF; entrada en pinyin Ye o IPA con tonos) |
| Licencia | `research-preview` (código MIT, pesos solo para investigación según `NOTICE`) |
| Formato de pesos | ONNX + `.onnx.json` estilo piper; librería `onnxruntime` |

## Arquitectura y entrenamiento

El modelo es un VITS de hablante único entrenado sobre 3.403 clips (4,10 horas) procedentes de cuatro fuentes, con el timbre unificado a la voz «badou». El checkpoint `vits_tujia-v0.2` reporta una *validation mel loss* de 0,5108. El vocabulario de entrada tiene 41 símbolos: fonemas IPA más cinco tokens tonales (`T0`–`T4`), con finales `-ng` representadas como `aŋ/eŋ/iŋ/oŋ` y la regla `z/c/s/r + i → ɿ`. Los corpus de entrenamiento son internos y no se distribuyen.

La innovación técnica principal no está en la arquitectura (VITS es un estándar consolidado desde 2021) sino en el *pipeline* de preprocesado: normalización de notación tonal, segmentación silábica, análisis inicial/final y conversión a IPA se delegan en `tujia-nlp`, mientras que el paquete solo conserva la tabla de 41 símbolos del checkpoint. El posprocesado (`postprocess()`) recorta silencios iniciales y finales (−40 dBFS respecto al pico, margen de 30 ms), normaliza el pico a −1 dBFS y aplica *fade* de 10 ms de entrada y salida. El grafo exportado incluye el predictor estocástico de duración de VITS (`/dp/RandomNormalLike`) con su `scale` congelada en el momento de la exportación, lo que provoca variabilidad de duración entre procesos.

## Capacidades

- Síntesis de voz a partir de texto en pinyin Ye (letras tonales `x`=55, `f`=35, `r`=21, `v`=53) o IPA con tonos Chao (dígitos, superíndices o letras Chao).
- Detección automática de la notación de entrada usada por el usuario.
- Segmentación silábica y normalización tonal delegadas en `tujia-nlp`.
- Gestión robusta de símbolos desconocidos: se descartan y se cuentan, sin lanzar `KeyError` silencioso; entrada vacía lanza excepción.
- Posprocesado de audio integrado (recorte de silencios, normalización de pico, *fade*).
- Voz única «badou»; no hay condicionamiento por hablante ni selección de voz.
- No soporta caracteres chinos ni SSML, pausas o énfasis.

## Casos de uso

- **Investigación en TTS de bajo recurso:** sirve como línea base reproducible (4,10 h de datos, VITS estándar, export ONNX) para experimentos de adaptación a lenguas con pocos recursos, comparando métricas de *phone error rate* y similitud de hablante.
- **Prototipado de interfaces de voz en tujia:** permite construir demos de asistentes o menús hablados en tujia para evaluación interna, siempre que un hablante nativo revise las locuciones antes de su difusión.
- **Material comunitario revisado:** generación de audios de vocabulario común para talleres o actividades de revitalización lingüística, con revisión nativa obligatoria dado el carácter aproximado del tono.
- **Evaluación de inteligibilidad:** los 40 *sentence probes* del *model card* (PER 0,784 sintético frente a 0,567 humano) permiten usar el modelo como banco de pruebas para medir la brecha sintético-humano en lenguas de bajos recursos.
- **Integración en aplicaciones ONNX ligeras:** al ser un grafo ONNX de ~0,1 GB de repositorio y ejecutable con `onnxruntime`, encaja en prototipos de escritorio o *edge* sin dependencia de frameworks de deep learning pesados.
- **Estudios de prosodia y tono:** la limitación documentada (tono aproximado, sin *sandhi*) lo convierte en un caso de estudio útil para investigar modelado tonal en lenguas siníticas minoritarias.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| *Phone error rate* (40 *sentence probes*, audio sintetizado, mediana) | 0,784 |
| *Phone error rate* (mismos *probes*, audio humano) | 0,567 |
| Similitud coseno de hablante frente a referencia *studio badou* | 0,814 |
| Similitud coseno del propio objetivo de entrenamiento | 0,812 |
| *Validation mel loss* | 0,5108 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a un modelo TTS.

## Requisitos de hardware

- **VRAM estimada:** no disponible de forma explícita; el repositorio ocupa 0,1 GB, por lo que la inferencia ONNX es muy ligera y cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas:** cualquier GPU con soporte ONNX Runtime (CUDA o CPU); no requiere A100/H100.
- **GPU consumer:** sí, cabe en cualquier RTX o incluso en CPU.
- **Despliegue:** `onnxruntime` (librería declarada); no es compatible con el front-end estándar de `piper`/espeak-ng (`phoneme_type: "text"` con tokens tonales de dos caracteres), hay que usar el front-end incluido.
- **Latencia y throughput:** no disponibles; la duración del audio varía entre 1,2 s y 2,8 s para el mismo texto entre procesos por el predictor estocástico de duración.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Hablantes | Licencia | Formato |
|---|---|---|---|---|---|
| tujia-tts-v0.2 | VITS (ONNX) | 4,10 h / 3.403 clips | 1 (badou) | research-preview | ONNX |
| Piper (voces estándar) | VITS (ONNX) | variable, decenas de horas por voz | 1 por voz | MIT (código) / varias por voz | ONNX |
| Modelos TTS multilingües comerciales (p. ej. APIs) | variable | masivo | múltiples | propietaria | API |

No se dispone de comparativas numéricas publicadas frente a otros sistemas TTS para tujia en la información proporcionada; la comparación con Piper es relevante porque comparte formato (`.onnx.json`), pero el modelo no es una voz Piper estándar y no puede ejecutarse con el front-end de espeak-ng.

## Limitaciones y advertencias

- **Duración estocástica entre procesos:** el grafo contiene `/dp/RandomNormalLike` con `scale` congelada y no controlada por `noise_scale`; el mismo texto puede durar entre 1,2 s y 2,8 s según el proceso. Si se necesita salida idéntica byte a byte, hay que fijar la semilla del nodo.
- **Tono aproximado:** los tokens tonales provienen de la anotación del corpus; no se modelan *sandhi* ni alargamiento enfático.
- **Palabras monosílabas cortas:** son las más débiles y las más sensibles al ruido de duración.
- **Sin control de prosodia:** no hay SSML, pausas ni énfasis.
- **Un solo hablante:** sin conversión de voz, clonación ni selección multi-hablante; cambiar de voz exige cambiar el archivo del modelo.
- **No es una voz Piper:** el front-end estándar (espeak-ng) no puede manejar los tokens tonales de dos caracteres; hay que usar el front-end incluido.
- **Idioma y escritura:** solo tujia en pinyin Ye o IPA; no soporta caracteres chinos.
- **Licencia restrictiva:** pesos solo para investigación (`research-preview`); el uso comercial o la redistribución requieren revisión de derechos, y el consentimiento de los hablantes de las grabaciones originales no está confirmado por fuente.
- **Riesgo ético y de alucinación fonética:** el PER sintético (0,784) es notablemente peor que el humano (0,567); no debe presentarse la salida como grabación de una persona real ni usarse en materiales educativos sin revisión de hablantes nativos.
- **Lengua en peligro:** cualquier uso comunitario o educativo debe pasar por revisión nativa previa.

## Enlaces

- Hugging Face: https://huggingface.co/TujiaNLP/tujia-tts-v0.2
- Aviso de licencia (`NOTICE`): https://github.com/ibaibing/tujia-tts/blob/main/NOTICE
- Repositorio del proyecto: https://github.com/ibaibing/tujia-tts
