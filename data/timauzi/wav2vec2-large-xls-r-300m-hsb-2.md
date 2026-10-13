# TiMauzi/wav2vec2-large-xls-r-300m-hsb-2

## Resumen

El modelo TiMauzi/wav2vec2-large-xls-r-300m-hsb-2 es un sistema de reconocimiento automático del habla (ASR) especializado en sorbio alto (Upper Sorbian, código ISO `hsb`), una lengua minoritaria eslava occidental hablada en Lusacia (Alemania). Se trata de un ajuste fino del modelo preentrenado facebook/wav2vec2-xls-r-300m, desarrollado por el usuario TiMauzi dentro de una colección de modelos wav2vec2 para las lenguas sorbias (sorbio alto y bajo). El modelo tiene 315.483.820 parámetros, se distribuye en formato safetensors y está publicado bajo licencia Apache 2.0.

El problema que resuelve es concreto: apenas existen sistemas ASR públicos para el sorbio alto, y este modelo ofrece una base funcional entrenada sobre el corpus Upper Sorbian Common Voice Scripted Speech 27.0, con un WER de test del 38,24 por ciento. Es relevante para proyectos de documentación lingüística, subtitulado de medios en sorbio y como punto de partida para ajustes posteriores en dominios específicos, dado que el rendimiento actual no es suficiente para producción sin adaptación adicional.

Se trata de una arquitectura wav2vec2 pura de tipo transformer convolucional con cabeza CTC, sin decoder autoregresivo, por lo que solo realiza transcripción (no traducción, no generación de texto libre). No se especifica en la model card ninguna innovación de inferencia adicional (decodificación especulativa, atención lineal o modos de pensamiento), y el modelo se generó automáticamente desde el Trainer de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder convolucional + transformer, cabeza CTC); ajuste fino de facebook/wav2vec2-xls-r-300m |
| Parametros totales | 315.483.820 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; modelo de audio, no de texto. La model card no especifica límite de duración de entrada |
| Tipos de cuantizacion | no disponible en la model card; al distribuirse en safetensors de precisión completa puede convertirse a float16/bfloat16 e int8 mediante transformaciones estándar. No consta soporte GGUF |
| Idiomas soportados | hsb (sorbio alto) únicamente |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,3 GB |
| Modelo base | facebook/wav2vec2-xls-r-300m |
| Dataset de ajuste | Upper Sorbian Common Voice Scripted Speech 27.0 |
| Fecha de creacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-12 |
| Descargas / likes | 2 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2 en su variante XLS-R 300m: un extractor de características convolucional que transforma la onda de audio en una secuencia de representaciones latentes, seguido de un encoder transformer y de una cabeza de clasificación CTC que emite directamente la secuencia de caracteres o unidades del vocabulario. Al ser un modelo CTC, la decodificación es no autorregresiva (greedy o beam search sobre los logits), lo que se traduce en latencias bajas y en la ausencia de puntuación y mayúsculas en la salida. Según la documentación del modelo base, facebook/wav2vec2-xls-r-300m fue preentrenado con 436.000 horas de audio en 128 idiomas, lo que le proporciona representaciones multilingües reutilizables para lenguas con pocos datos; el ajuste fino aquí se realiza sobre sorbio alto.

El entrenamiento se ejecutó durante 3.000 pasos con un tamaño de lote efectivo de 32 (train_batch_size 4 con 8 pasos de acumulación de gradiente), tasa de aprendizaje 0,0002, optimizador Adam (betas 0,9 y 0,999, epsilon 1e-8), scheduler lineal con 100 pasos de calentamiento, weight_decay 0,0, `mask_time_prob` 0,25 y semilla 42. La pérdida de entrenamiento bajó de 20,56 en el paso 500 a 0,159 en el paso 3000, mientras que la pérdida de validación se estabilizó alrededor de 0,49, señal de que el modelo agotó buena parte de su capacidad de generalización a partir del paso 2.000. No se documenta ningún uso de RLHF, DPO ni decodificación con modelo de lenguaje externo. Las versiones de framework declaradas son Transformers 5.19.0, PyTorch 2.14.1+cu126, Datasets 4.8.5 y Tokenizers 0.23.2.

## Capacidades

- Reconocimiento automático del habla en sorbio alto (`hsb`) sobre audio de voz, con salida de transcripción en texto.
- Funciona con audio de voz leída o preparada (el corpus de ajuste es Common Voice Scripted Speech, es decir, locuciones leídas a partir de texto).
- Decodificación CTC no autorregresiva: permite técnicas de decodificación con beam search y, opcionalmente, integración de un modelo de lenguaje a nivel de carácter o palabra si se implementa fuera del modelo.
- No incluye puntuación, mayúsculas ni formato en la salida por defecto.
- No soporta tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio generativo, texto generativo ni modo de pensamiento.
- Sirve como encoder acústico preentrenado para ajustes posteriores en sorbio alto, sorbio bajo u otras lenguas eslavas minoritarias.
- No se documenta en la model card el vocabulario exacto del tokenizer (los ajustes de wav2vec2 sobre Common Voice suelen usar vocabulario a nivel de carácter, pero este dato no está confirmado en la información disponible).
- No se documenta soporte multi-hablante, diarización ni detección de actividad de voz.

## Casos de uso

- Digitalización de archivos orales en sorbio alto: el modelo transcribe grabaciones de campo, entrevistas o material etnográfico para convertirlos en corpus de texto consultables. Encaja porque es uno de los pocos ASR públicos disponibles para `hsb`, aunque requiere revisión humana por el WER del 38 por ciento.
- Subtitulado de medios en sorbio: televisiones y radios regionales de Lusacia pueden generar subtítulos preliminares de emisiones en sorbio alto y corregirlos después, reduciendo el coste frente a la transcripción manual.
- Dictado y accesibilidad en aplicaciones locales: integración en editores de texto o aplicaciones de accesibilidad para hablantes de sorbio alto, con inferencia local en CPU o GPU de gama baja gracias a los 315 millones de parámetros.
- Preprocesado para pipelines de PLN en sorbio: transcripción de audio como paso previo a traducción automática, indexación de búsqueda o análisis morfológico en un idioma con recursos digitales escasos.
- Investigación en ASR de bajos recursos: sirve como línea base reproducible (semilla 42, hiperparámetros documentados) para comparar estrategias de aumentación de datos, currículos de entrenamiento o decodificación con modelo de lenguaje en lenguas minoritarias.
- Transcripción offline en el borde: al ocupar aproximadamente 1,3 GB en precisión completa y menos de 700 MB en float16, puede desplegarse en dispositivos con recursos limitados o en entornos sin conectividad, útil para trabajo de campo lingüístico.
- Adaptación por dominio mediante ajuste fino: partiendo de estos pesos, instituciones o grupos de investigación pueden reentrenar sobre un dominio concreto (por ejemplo, terminología administrativa o médica en sorbio) para reducir el WER en producción.
- Prototipado rápido en asistentes de voz comunitarios: organizaciones culturales sorbias pueden evaluar viabilidad de interfaces por voz, asumiendo que el modelo necesitará refuerzo con datos propios antes de usarse con usuarios finales.

## Benchmarks y rendimiento

Resultados de validación publicados en la model card (WER de validación, no de test):

| Paso | Pérdida de entrenamiento | Pérdida de validación | WER de validación |
|---|---|---|---|
| 500 | 20,561625 | 0,567727 | 0,560962 |
| 1000 | 1,210133 | 0,553340 | 0,461090 |
| 1500 | 0,540164 | 0,519622 | 0,379989 |
| 2000 | 0,342534 | 0,513819 | 0,372517 |
| 2500 | 0,222831 | 0,487471 | 0,350465 |
| 3000 | 0,158891 | 0,493057 | 0,338436 |

Resultados sobre el conjunto de test separado (evaluado una sola vez tras el entrenamiento):

| Pérdida de test | WER de test |
|---|---|
| 0,587414 | 0,382399 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) porque no aplican a un modelo ASR, ni tampoco comparaciones con otros sistemas sobre el mismo conjunto de test de sorbio alto. La model card no incluye cifras de CER, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia con lote 1: aproximadamente 1,3 GB en float32 (315,5 millones de parámetros × 4 bytes = 1,26 GB de pesos, más activaciones); en torno a 0,65-0,8 GB en float16/bfloat16; alrededor de 0,35-0,5 GB en int8. Son estimaciones de orden de magnitud, no cifras publicadas por el autor.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090) puede ejecutarlo en float16 con lote pequeño. También es viable la inferencia en CPU para audio corto.
- GPU recomendadas para inferencia de alto volumen o ajuste fino: NVIDIA A100, H100, L40S o RTX 4090. Para reentrenamiento con lotes grandes conviene al menos 16-24 GB de VRAM.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de Hugging Face Transformers, servidores propios con PyTorch, exportación a ONNX Runtime u otras rutas de optimización (no confirmadas en la model card), y empaquetado en contenedores con FastAPI o NVIDIA Triton. No consta soporte en llama.cpp ni Ollama, que no implementan esta arquitectura.
- Latencia y throughput: no disponibles. La model card no publica mediciones; al tratarse de decodificación CTC no autorregresiva, la latencia es proporcional a la duración del audio de entrada más un coste fijo de encoder, sin el bucle de generación token a token propio de los modelos seq2seq.
- Requisito de memoria adicional: la duración del audio de entrada influye directamente en el consumo de activaciones; para audios largos es necesario segmentar con VAD, ya que la model card no especifica límites de duración.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Contexto / entrada | WER publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TiMauzi/wav2vec2-large-xls-r-300m-hsb-2 | 315.483.820 | hsb (sorbio alto) | no disponible | 0,382399 en test (Common Voice 27.0) | apache-2.0 | Hugging Face, safetensors, 2 descargas |
| TiMauzi/wav2vec2-large-xls-r-300m-hsb | no disponible (mismo backbone, ~315 M) | hsb (sorbio alto) | no disponible | no disponible | no indicada en los resultados de búsqueda | Hugging Face; sin model card publicada |
| facebook/wav2vec2-xls-r-300m | 315.483.820 (base) | 128 idiomas en preentrenamiento | no disponible | no aplica (modelo preentrenado, sin cabeza ASR lista para uso) | apache-2.0 | Hugging Face |
| Otros ajustes de la misma familia (por ejemplo wav2vec2-large-xls-r-300m-pt-colab, -ar) | ~315 M | portugués, árabe | no disponible | no disponible en la información recogida | no indicada | Hugging Face / espejos de terceros |

No hay datos de benchmarks que permitan comparar el WER de este modelo con alternativas sobre el mismo conjunto de test de sorbio alto, por lo que la comparación se limita a parámetros, licencia y disponibilidad. La colección "Sorbian wav2vec2 Models" de TiMauzi agrupa los ajustes para sorbio alto y bajo.

## Limitaciones y advertencias

- WER de test del 38,24 por ciento: es un error elevado para uso en producción sin revisión humana. Cualquier despliegue real exige corrección posterior o ajuste fino adicional.
- Brecha de generalización: la pérdida de test (0,587414) es superior a la de validación en el último paso (0,493057), y la pérdida de validación se estanca desde el paso 2.000 mientras la de entrenamiento sigue bajando, lo que indica sobreajuste parcial.
- Dominio restringido a habla leída: el ajuste se hizo sobre Common Voice Scripted Speech, por lo que el rendimiento puede degradarse con habla espontánea, conversacional, con ruido, acentos o solapamiento de hablantes.
- Salida sin puntuación ni mayúsculas: al ser CTC puro, el texto generado carece de formato; se necesita postprocesado con un modelo de puntuación si el destino lo requiere.
- Sesgos potenciales: el corpus Common Voice depende de voluntarios y micrófonos domésticos, lo que puede introducir sesgos de edad, género, origen geográfico y calidad de grabación. La model card no incluye ningún análisis de sesgo ni desglose por subgrupos demográficos.
- Riesgo de alucinación en sentido ASR: el modelo puede producir transcripciones plausibles pero incorrectas en segmentos con ruido, silencio o audio fuera de dominio, sin indicar incertidumbre.
- Cobertura monolingüe: solo sorbio alto (`hsb`). El sorbio bajo (`dsb`) no está cubierto por estos pesos, y el cambio de código con alemán no está contemplado explícitamente.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial. La model card no detalla la licencia del corpus de entrenamiento; el proyecto Common Voice publica sus datasets bajo CC0, pero conviene verificarlo antes de un uso comercial del derivado.
- Madurez limitada: 2 descargas y 0 likes, sin validación independiente de la comunidad ni pruebas de terceros. El sufijo "-2" sugiere una segunda ejecución de entrenamiento, lo que apunta a un proceso experimental.
- Sin soporte documentado de tool calling, agentes, multimodalidad ni streaming incremental; la model card tampoco documenta compatibilidad con frameworks de despliegue a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TiMauzi/wav2vec2-large-xls-r-300m-hsb-2
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Versión previa del mismo autor: https://huggingface.co/TiMauzi/wav2vec2-large-xls-r-300m-hsb
- Colección "Sorbian wav2vec2 Models" de TiMauzi: https://huggingface.co/collections/TiMauzi/sorbian-wav2vec2-models
- Dataset Upper Sorbian Common Voice Scripted Speech 27.0: https://mozilladatacollective.com/datasets/cmu5uo2vm008nnq07xzwow03j
- Guía de ajuste fino de wav2vec2-large-xls-r-300m en Common Voice (referencia externa): https://fxis.ai/edu/how-to-fine-tune-the-wav2vec2-large-xls-r-300m-model-on-common-voice-dataset/
- Ficha del ajuste en portugués de la misma familia (referencia comparativa): https://model.aibase.com/models/details/1915693100875538433
- Ficha del ajuste en árabe de la misma familia (referencia comparativa): https://model.aibase.com/models/details/1915693323563720705
