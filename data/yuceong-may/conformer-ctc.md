# YuCeong-May/Conformer-CTC

## Resumen

Conformer-CTC es un modelo de reconocimiento automático del habla (ASR) entrenado con el framework ESPnet3, dentro de la receta `egs3/librispeech_100/esp2_asr`. Lo publica el usuario YuCeong-May en Hugging Face como un paquete de artefactos (`model_pack`) que contiene el checkpoint y las configuraciones necesarias para reconstruir y ejecutar el modelo. Se trata de un sistema acústico pequeño, de unos 31,7 millones de parámetros, pensado para transcripción de voz a texto en inglés sobre el corpus LibriSpeech.

La arquitectura es un encoder Conformer de 18 bloques con atención relativa y módulo convolucional, acoplado a una salida CTC pura (`ctc_weight: 1.0`). El modelo se entrena únicamente con `train-clean-100` de LibriSpeech, es decir, 100 horas de audio limpio, y se valida sobre `dev-clean` y `dev-other`. Esto lo sitúa como una pieza de referencia o base para experimentación más que como un sistema de producción de alta precisión.

Su relevancia actual es doble: por un lado, sirve como ejemplo reproducible de un pipeline ESPnet3 completo (tokenizador BPE de 5000 unidades, SpecAugment, normalización global MVN, entrenamiento en bf16-mixed); por otro, sus resultados publicados (WER de 10,45 en dev-clean y 25,18 en test-other) permiten comparar recetas y configuraciones dentro del ecosistema ESPnet. No es un modelo conversacional ni multimodal: es un ASR CTC clásico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer encoder (18 bloques) + salida CTC |
| Parámetros totales | 31.725.448 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR por utterance; ventana de atención sobre frames de audio) |
| Tipos de cuantización | no disponible (pesos en float32) |
| Idiomas soportados | inglés (corpus LibriSpeech); no se declaran otros |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch dentro de bundle ESPnet (`model_pack`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

El encoder es un Conformer con `output_size` de 256, 4 cabezas de atención, `linear_units` de 1024, 18 bloques, estilo macaron, normalización previa (`normalize_before: true`), posiciones relativas (`rel_pos`, `rel_selfattn`) y módulo convolucional con kernel 31. La entrada es un `conv2d` sobre features log-mel con `n_fft` 512, `win_length` 400 y `hop_length` 160 a 16 kHz. La normalización es `global_mvn` con estadísticas precalculadas. La salida es CTC pura con vocabulario BPE de 5000 tokens, `lsm_weight` 0.1 y pérdida no normalizada por longitud.

El entrenamiento usa solo `train-clean-100` de LibriSpeech, con aumento de datos por `speed_perturb` (factores 0.9 y 1.1, probabilidad 0.667) y SpecAugment (time warp, 2 máscaras de frecuencia de hasta 27 bins y 5 máscaras de tiempo de hasta el 5 %). El optimizador es Adam con lr 0.002, weight decay 1e-6 y scheduler WarmupLR con 15000 pasos de calentamiento. Se entrena hasta 180 épocas con precisión `bf16-mixed`, acumulación de gradiente de 4 y recorte de gradiente de 5.0. El criterio de mejor modelo es `valid/cer_ctc` (mínimo, ventana de 10). No se documenta RLHF, DPO ni ajuste por preferencias, algo esperable en un sistema ASR CTC.

## Capacidades

- Reconocimiento de voz a texto en inglés sobre audio de 16 kHz.
- Transcripción a nivel de utterance con salida CTC y decodificación sobre vocabulario BPE de 5000 unidades.
- Manejo de audio limpio y, con menor precisión, de audio con condiciones más difíciles (ver diferencias entre dev-clean y dev-other).
- Aumento de robustez mediante el pipeline de entrenamiento con SpecAugment y perturbación de velocidad.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multimodal: no procesa visión, audio más allá del ASR ni texto generativo.
- No dispone de modo "thinking" ni capacidades de instrucción.

## Casos de uso

- Transcripción de audiolibros y corpus de voz limpia: el modelo está entrenado sobre LibriSpeech `train-clean-100`, por lo que su dominio natural es voz leída en inglés con buena relación señal-ruido; encaja en la generación de transcripciones de referencia para datasets.
- Baseline reproducible en investigación ASR: al estar empaquetado como `model_pack` de ESPnet3 con la receta completa, permite reproducir experimentos y comparar variantes de encoder, tokenizador o aumentación de datos.
- Evaluación de pipelines de decodificación CTC: sirve para probar decodificadores (greedy, beam search, con o sin modelo de lenguaje) sobre un sistema pequeño y rápido de ejecutar.
- Prototipado de subtitulado en inglés para contenido con audio limpio: con un WER de 10,72 en test-clean, es adecuado para demos y pruebas de concepto, no para subtitulado comercial sin revisión.
- Generación de datos sintéticos de pares audio-transcripción: útil para aumentar corpus de entrenamiento en inglés a partir de grabaciones limpias.
- Docencia y formación en ESPnet: el tamaño reducido (126,9 MB en float32) y la configuración explícita lo hacen idóneo para explicar el flujo completo de un sistema Conformer-CTC.
- Pruebas de integración en pipelines de CI: al ser ligero, puede ejecutarse en entornos con recursos limitados para validar que el stack de inferencia funciona antes de desplegar modelos mayores.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre LibriSpeech:

| Dataset | CER | WER |
|---|---|---|
| dev-clean | 4,43 | 10,45 |
| dev-other | 12,49 | 23,95 |
| test-clean | 4,53 | 10,72 |
| test-other | 12,94 | 25,18 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 31,7 M de parámetros en float32 (126,9 MB de pesos) cabe holgadamente en cualquier GPU consumer, incluso en GPUs integradas o CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, pero válidas para procesamiento por lotes.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más; también es viable en CPU para uso por utterance.
- Opciones de despliegue: el paquete está pensado para ejecutarse con el backend de la receta ESPnet3 (`infer` stage). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un ASR CTC de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Conformer-CTC (este) | 31,7 M | no disponible | 10,72 | no disponible | Hugging Face, bundle ESPnet |
| Modelos Conformer-CTC de recetas ESPnet con `train-clean-100` | ~30 M típicamente | no disponible | no disponible | según receta | repositorios ESPnet |
| Wav2Vec 2.0 base fine-tuned en LibriSpeech 100h | ~95 M | no disponible | no disponible | MIT/Apache según variante | Hugging Face |
| Whisper small | 244 M | 30 s de audio | no disponible en esta ficha | MIT | Hugging Face, OpenAI |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Entrenado solo con `train-clean-100` de LibriSpeech: el dominio es voz leída en inglés y limpia; el rendimiento cae notablemente en audio con ruido o acento (WER 25,18 en test-other frente a 10,72 en test-clean).
- Solo inglés: no se declaran capacidades multilingües.
- Riesgo de alucinación en el sentido ASR: sustituciones, omisiones e inserciones de palabras en la transcripción, especialmente en condiciones adversas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de integrarlo en producción.
- No hay información sobre sesgos demográficos, acentos o variedades dialectales; el corpus LibriSpeech está sesgado hacia lectura de audiolibros en inglés estadounidense.
- El paquete requiere reconstruir el backend desde la receta original; no es un modelo autónomo con pipeline estándar de Hugging Face (`pipeline` no disponible).
- No apto para tareas generativas, conversacionales, de código, matemáticas o multimodales.
- El checkpoint está en float32 sin cuantizaciones publicadas; para despliegues muy ajustados habría que convertirlo manualmente.

## Enlaces

- Hugging Face: https://huggingface.co/YuCeong-May/Conformer-CTC
- ESPnet (repositorio oficial): https://github.com/espnet/espnet
- Receta ESPnet3 `egs3/librispeech_100/esp2_asr`: no disponible como enlace directo en la información proporcionada
- Paper de ESPnet (Watanabe et al., 2018): referencia incluida en la model card, sin URL explícita
- Paper de Conformer (Gulati et al., 2020): no incluido en la información proporcionada
- Dataset LibriSpeech: no incluido como enlace en la información proporcionada
