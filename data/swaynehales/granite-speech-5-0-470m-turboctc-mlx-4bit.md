# swaynehales/granite-speech-5.0-470m-turboctc-mlx-4bit

## Resumen

Granite Speech 5.0 470M TurboCTC MLX 4-bit es una conversión no oficial del modelo de reconocimiento automático de voz (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, publicada por el usuario swaynehales. El paquete adapta los pesos originales al formato MLX safetensors con cuantización afín de 4 bits (group size 64), pensado para ejecutar transcripción de voz en Macs con Apple Silicon mediante la librería Granite-MLX. No es un modelo nuevo: es el mismo modelo de IBM con el layout de pesos, la precisión y algunos ficheros de configuración modificados.

El modelo base es un sistema ASR CTC de unos 470 millones de parámetros (472.993.792 según los safetensors del repo), con 16 bloques conformer, un cabezal BPE multilingüe de 16.384 tokens, submuestreo temporal de 8x (de 100 Hz a 12,5 Hz) y self-conditioned CTC desde la capa intermedia. La release multilingüe del 21 de octubre de 2026 cubre inglés, francés, alemán, español, portugués, italiano y japonés, con puntuación y mayusculización nativas.

La relevancia de esta ficha es doble: por un lado, documenta una vía práctica para ASR local en hardware Apple; por otro, el propio autor advierte que la cuantización a 4 bits degrada la precisión de forma notable frente a 8 bits (hasta 3,88 % de diferencia en portugués) y recomienda el paquete de 8 bits salvo que el tamaño o la memoria sean prioritarios. La licencia Apache 2.0 del modelo base permite la redistribución de derivados con aviso de cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (16 bloques conformer, cabezal BPE multilingüe de 16.384 tokens, submuestreo temporal 8x, block attention sobre 128 frames, self-conditioned CTC desde capa intermedia) |
| Parametros totales | 472.993.792 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR; procesa audio variable sin padding, ventana de atención de 128 frames) |
| Tipos de cuantizacion | 4-bit affine weight-only, group size 64 (179 matrices cuantizadas; resto de tensores en fp16) |
| Idiomas soportados | Multilingüe: inglés, francés, alemán, español, portugués, italiano y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (`model.safetensors`) con `config.json` en layout de Granite-MLX |

## Arquitectura y entrenamiento

El modelo base es un sistema de reconocimiento de voz basado en CTC con 16 bloques conformer y un cabezal de clasificación BPE de 16.384 tokens que cubre siete idiomas. Aplica un submuestreo temporal de 8x que reduce la tasa de frames de 100 Hz a 12,5 Hz, usa block attention sobre ventanas de 128 frames y emplea self-conditioned CTC desde la capa intermedia para mejorar la representación acústica. El total son 470M parámetros. La model card de esta conversión no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; remite a la model card de IBM en la revisión fijada para esos datos.

Esta conversión concreta no reentrena el modelo: ejecuta `convert_granite.py` de Granite-MLX (commit `7ad6b19c698aac5aa8328c911e4a6eead456c5a1`) con `--precision fp16 --quantization-bits 4 --group-size 64` sobre la revisión `91dcb0605daf65f88dbb04fef015c423241d941d` de IBM. Conserva los 534 tensores fuente (almacenados como 892 arrays por los 179 pares de escala y sesgo de cuantización), elimina 16 contadores `num_batches_tracked` de BatchNorm usados solo en entrenamiento y transpone los 16 pesos depthwise Conv1d de `[O,I,K]` a `[O,K,I]` para MLX. El cálculo de features log-mel más delta se hace en Swift dentro de Granite-MLX, con entrada de audio mono a 16 kHz y longitud variable sin padding.

## Capacidades

- Reconocimiento automático de voz (ASR) en siete idiomas: inglés, francés, alemán, español, portugués, italiano y japonés.
- Transcripción con puntuación y mayusculización nativas, sin postprocesado externo.
- Procesamiento de audio de longitud variable sin padding ni forma fija.
- Manejo de audio largo mediante política de chunking (el autor reporta resultados sobre 5 clips largos emparejados con la referencia oficial troceada).
- Ejecución local en Apple Silicon mediante la librería Granite-MLX, con features acústicas calculadas en Swift.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo; la entrada es audio y la salida es texto transcrito.

## Casos de uso

- Transcripción local en Mac: el paquete MLX 4-bit permite dictado y transcripción en equipos Apple Silicon sin conexión a servicios en la nube, con un repo de 0,3 GB que se carga en memoria de forma holgada.
- Subtitulado de vídeo multilingüe: al cubrir siete idiomas con puntuación nativa, se puede usar para generar subtítulos en inglés, francés, alemán, español, portugués, italiano o japonés a partir de la pista de audio, sin pipeline de puntuación adicional.
- Actas de reuniones y notas de voz: la transcripción de audio largo mediante chunking encaja en la grabación de sesiones y la generación de actas, siempre que se acepte la pérdida de precisión del 4-bit (0,74 % de diferencia en los clips largos medidos).
- Prototipado de asistentes de voz en macOS: al integrarse con Granite-MLX en Swift, sirve para validar flujos de voz a texto dentro de apps nativas de Apple antes de pasar a un despliegue en servidor con el modelo oficial.
- Indexación y búsqueda de archivos de audio: transcribir un archivo de grabaciones para hacerlas buscables por texto, aceptando el coste de precisión a cambio de un modelo pequeño y de ejecución local.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir el impacto real del 4-bit frente a 8-bit y fp16 en un mismo hardware, dado que el autor publica las diferencias porcentuales por idioma.
- Transcripción de audio en portugués o japonés con requisitos de tamaño estrictos: solo si el 3,88 % de diferencia en portugués (frente a fp16) o el 1,59 % de CER en japonés son aceptables para el caso de uso.

## Benchmarks y rendimiento

El autor publica diferencias de palabra o carácter en porcentaje (normalizadas, menor es mejor) medidas con el CLI de Granite-MLX, comparando esta conversión 4-bit con su propia conversión fp16, su conversión 8-bit y la inferencia oficial de IBM. No se han publicado resultados de benchmarks estándar (WER sobre LibriSpeech completo, FLEURS completo, etc.) en la información disponible.

| Conjunto (clips) | vs MLX fp16 | vs MLX 8-bit | vs inferencia oficial IBM |
|---|---:|---:|---:|
| LibriSpeech en (73) | 1,03 | 0,94 | 1,03 |
| FLEURS fr (10) | 1,67 | 1,67 | 1,67 |
| FLEURS de (10) | 1,23 | 1,23 | 1,23 |
| FLEURS es (10) | 1,72 | 1,72 | 1,72 |
| FLEURS pt (10) | 3,88 | 3,49 | 3,49 |
| FLEURS it (10) | 1,70 | 2,13 | 1,70 |
| FLEURS ja (10, CER) | 1,59 | 1,59 | 1,59 |
| Audio largo (5 clips) | 0,74 (vs referencia oficial troceada) | 0,76 | no disponible |

Los conjuntos FLEURS tienen solo 10 clips por idioma, por lo que la variabilidad estadística es alta. El autor indica además que el 4-bit no es más rápido que el 8-bit en sus mediciones.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repo pesa 0,3 GB; con 472M parámetros en 4-bit más tensores fp16 y overhead de runtime, la huella esperada es de aproximadamente 0,5-1 GB de memoria unificada, aunque el autor no publica una cifra exacta.
- Hardware objetivo: Macs con Apple Silicon (serie M). El paquete está en formato MLX y depende de Granite-MLX; no está pensado para GPU NVIDIA ni CUDA.
- GPU dedicadas (A100, H100, RTX 4090): no aplica a este paquete MLX. Para esos entornos habría que usar el modelo oficial de IBM en otro formato.
- Cabe en GPU consumer: sí, en el sentido de que cabe en cualquier Mac Apple Silicon moderna por su tamaño reducido; no se dispone de datos de despliegue en GPU consumer NVIDIA para este paquete concreto.
- Opciones de despliegue: Granite-MLX (`GraniteModelLoader`) con el CLI en Swift. No es compatible con los loaders de `mlx-audio` ni `mlx-lm` por el layout de pesos.
- Latencia y throughput: no disponibles. El autor solo indica que el 4-bit no es más rápido que el 8-bit en sus mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / enfoque | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Granite Speech 5.0 470M TurboCTC MLX 4-bit (esta ficha) | 472.993.792 | ASR CTC, ventana de atención 128 frames | 7 idiomas | Apache 2.0 | MLX safetensors, solo Apple Silicon vía Granite-MLX |
| Granite Speech 5.0 470M TurboCTC MLX 8-bit | no disponible en la informacion | ASR CTC, misma arquitectura | 7 idiomas | Apache 2.0 | MLX safetensors; recomendado por el autor frente al 4-bit |
| ibm-granite/granite-speech-5.0-470m-turboctc (oficial) | 470M | ASR CTC, misma arquitectura | 7 idiomas | Apache 2.0 | Pesos oficiales de IBM; referencia de precisión |
| ibm-granite/granite-speech-5.0-470m-turboctc-nc | no disponible en la informacion | ASR CTC, solo inglés | Inglés | CC-BY-NC-SA-4.0 | Modelo distinto, no usado en esta conversión |

No se dispone de datos de benchmarks estándar comparativos con otros modelos ASR de la misma categoría (por ejemplo, Whisper) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits degrada la precisión de forma medible: hasta 3,88 % de diferencia en portugués frente a fp16, y el autor la describe como una opción de tamaño sobre precisión sin garantía de precisión.
- El propio autor recomienda el paquete de 8 bits salvo que el tamaño o la memoria sean prioritarios.
- El 4-bit no aporta velocidad frente al 8-bit según las mediciones del autor.
- Las evaluaciones por idioma usan solo 10 clips de FLEURS, lo que limita la fiabilidad estadística de las cifras.
- Es una conversión no oficial: IBM no la ha revisado ni respaldado.
- Licencia Apache 2.0 permite uso comercial, pero exige incluir copia de la licencia y aviso de cambios en la redistribución; el repo incluye `LICENSE` y `MODIFICATIONS.md` con ese propósito.
- No compatible con `mlx-audio` ni `mlx-lm`; requiere Granite-MLX, lo que restringe las opciones de integración.
- Dependencia de hardware Apple Silicon: no es desplegable en CUDA ni en entornos sin MLX.
- No se detallan en esta model card los sesgos del modelo base ni los datos de entrenamiento; para eso hay que consultar la model card de IBM.
- Riesgo de alucinación inherente a los sistemas ASR: el modelo puede generar transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no cubiertos por el entrenamiento.
- No confundir con `granite-speech-5.0-470m-turboctc-nc`, modelo distinto en inglés y con licencia CC-BY-NC-SA-4.0.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-mlx-4bit
- Repositorio Hugging Face del paquete 8-bit recomendado: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-mlx-8bit
- Modelo base oficial de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/91dcb0605daf65f88dbb04fef015c423241d941d
- Model card de IBM en la revisión fijada: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/blob/91dcb0605daf65f88dbb04fef015c423241d941d/README.md
- Modelo NC alternativo (no usado aquí): https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc-nc
- Librería Granite-MLX: https://github.com/kylehowells/Granite-MLX
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
