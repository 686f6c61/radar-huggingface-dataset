# turaco-research/turaco-csm-tts-wes-1b

## Resumen

Turaco-csm-tts-wes-1b es un modelo de síntesis de voz (text-to-speech) especializado en **Cameroon Pidgin English (WES)**, una variedad lingüística de bajos recursos hablada en Camerún. Lo desarrolla **turaco-research** como parte de la familia Turaco, una iniciativa centrada en modelos modernos de lenguaje y habla para lenguas africanas poco representadas. El modelo parte de **Sesame CSM 1B** (`unsloth/csm-1b`) y se afina mediante LoRA sobre grabaciones de Cameroon Pidgin procedentes de Common Voice Scripted Speech 27.0.

Se trata de un modelo transformer de **1.632.100.161 parámetros** (aproximadamente 1,6 mil millones), publicado en formato safetensors con la licencia Apache 2.0 y compatible con la librería `transformers`. El checkpoint liberado incorpora los pesos LoRA ya fusionados en el modelo completo en FP16, de modo que no requiere PEFT ni la descarga separada del modelo base.

Su relevancia es doble: por un lado, es un piloto de investigación de un solo hablante que demuestra que es viable adaptar un TTS multilingüe de propósito general a una variedad lingüística con muy pocos datos (400 grabaciones de entrenamiento); por otro, documenta de forma transparente sus límites, incluyendo que no se han medido métricas perceptivas como MOS, WER o CER. Es, por tanto, una pieza de investigación más que un sistema listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer CSM (Sesame CSM 1B), ajuste fino con LoRA fusionado |
| Parámetros totales | 1.632.100.161 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (checkpoint publicado en FP16) |
| Idiomas soportados | Cameroon Pidgin English (código `wes`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (checkpoint completo fusionado, FP16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de **Sesame CSM 1B**, un modelo de generación de audio condicionado por texto que produce tokens de audio decodificables a forma de onda. Sobre esa base se aplicó un ajuste fino con **LoRA de rango 32 y alpha 32**, dirigido a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento reportó **29.032.448 parámetros entrenables (1,75 % del total)**. Los adaptadores se fusionaron posteriormente en el checkpoint completo para su publicación.

Los datos provienen de **Common Voice Scripted Speech 27.0 — Cameroon Pidgin**, con un reparto de **400 grabaciones de entrenamiento, 32 de validación y 51 de test**. El audio se remuestreó a mono a 24 kHz. La configuración de entrenamiento fue: batch efectivo de 8 (batch 2 con acumulación 4), learning rate de 0,0002, schedule lineal con 5 pasos de warmup, optimizador AdamW de 8 bits con weight decay 0,001, precisión FP16 sobre una **Tesla T4**, gradient checkpointing de Unsloth y semilla 3407. Se ejecutaron **60 pasos de optimizador**, equivalentes a **1,2 épocas efectivas**, en **228,34 segundos** de entrenamiento. La pérdida de validación pasó de 6,102216 a 5,130048, una reducción relativa del **15,93 %**; la pérdida de entrenamiento media fue de 5,271788.

## Capacidades

- **Síntesis de voz a partir de texto** en Cameroon Pidgin English, con salida en WAV a 24 kHz.
- **Condicionamiento por referencia de hablante**: el template conversacional de CSM permite aportar una referencia de texto y audio para mantener consistencia de hablante y estilo.
- **Generación con límite de frames** configurable (los ejemplos publicados usan 125 frames de audio, hasta unos 10 segundos).
- Modelo de **un solo hablante** en este piloto; no está diseñado para clonación de voz arbitraria ni para múltiples voces.
- **No se documenta** soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente, al tratarse de un modelo de audio.
- **No se documenta** soporte multilingüe más allá del código `wes`.
- No dispone de modo thinking, visión ni audio de entrada como capacidades declaradas en la información disponible.

## Casos de uso

- **Investigación en TTS para lenguas de bajos recursos**: sirve como referencia reproducible de cómo adaptar un modelo base como CSM 1B a una variedad con pocos datos (400 grabaciones) y qué métricas registrar. Adecuado para estudiar la curva de pérdida y el efecto de LoRA en dominios de audio escasos.
- **Prototipado de interfaces de voz en Cameroon Pidgin**: permite generar avisos hablados o respuestas de voz en esta variedad para pruebas de concepto, siempre con revisión humana dado que no hay evaluación perceptiva publicada.
- **Evaluación comparativa de pipelines de ajuste fino**: la configuración documentada (LoRA rango 32, 60 pasos, T4, FP16, Unsloth) es replicable y útil como baseline para comparar otras recetas de adaptación sobre CSM.
- **Generación de material de escucha para estudios con hablantes nativos**: los pares before/after incluidos permiten organizar pruebas de escucha controladas y recoger MOS o preferencias que el autor no ha medido.
- **Integración en demos de `transformers`**: al cargarse con `CsmForConditionalGeneration` y `AutoProcessor`, se puede incorporar en notebooks y demos de Hugging Face sin infraestructura adicional de PEFT.
- **Investigación sobre condicionamiento por referencia de audio**: útil para estudiar hasta qué punto una referencia de texto y audio del hablante de entrenamiento mantiene la consistencia de estilo en la generación.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros); el `model-index` de la model card está vacío. Las únicas métricas disponibles son las de entrenamiento:

| Medición | Resultado |
|---|---:|
| Pérdida de validación (baseline) | 6,102216 |
| Pérdida de validación (tras entrenamiento) | 5,130048 |
| Reducción relativa de pérdida de validación | 15,93 % |
| Pérdida de entrenamiento media | 5,271788 |
| Pasos de optimizador | 60 |
| Duración del entrenamiento | 228,34 s |
| Épocas efectivas | 1,2 |
| Grabaciones de entrenamiento / validación | 400 / 32 |
| Grabaciones de test reservadas | 51 |

El autor advierte explícitamente que estas son **pérdidas con teacher forcing**, no WER, precisión de pronunciación ni puntuaciones de calidad perceptiva. Las 51 grabaciones de test no se evaluaron y no hay MOS, WER, CER, similitud de hablante, estudio con semillas repetidas, intervalos de confianza ni puntuación de escucha humana independiente.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint es de aproximadamente 1,6 mil millones de parámetros en FP16, lo que supone unos **3,3 GB de pesos** (tamaño del repo: 3,3 GB). Con overhead de activaciones y caché de generación, se recomienda al menos **6-8 GB de VRAM** para inferencia en FP16.
- **GPU recomendadas**: el propio autor entrenó en una **Tesla T4** (16 GB), suficiente para inferencia y ajuste fino ligero. Para mayor throughput, A100 o H100; para uso local, RTX 4090 (24 GB) o RTX 3090.
- **GPU de consumo**: cabe en tarjetas consumer con 8 GB o más en FP16; en GPUs con menos VRAM sería necesario cuantizar, aunque **no se documentan cuantizaciones GGUF ni otras** en el repositorio.
- **Opciones de despliegue**: `transformers` (versión 4.57.6 o compatible con soporte CSM) con `CsmForConditionalGeneration` y `AutoProcessor`; el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles. El entrenamiento de 60 pasos tardó 228,34 s en T4, pero no hay mediciones de latencia de inferencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|
| turaco-csm-tts-wes-1b | 1,63 B | Cameroon Pidgin (`wes`) | Apache 2.0 | TTS especializado, un hablante, LoRA fusionado |
| sesame/csm-1b (base) | ~1 B | Multilingüe (no especificado) | No disponible en la información | TTS/audio generativo de propósito general |
| unsloth/csm-1b | ~1 B | Multilingüe (no especificado) | No disponible en la información | Checkpoint base optimizado para ajuste fino |

No se dispone de información sobre otros modelos TTS específicos para Cameroon Pidgin con los que comparar directamente; en la información proporcionada no aparecen alternativas equivalentes.

## Limitaciones y advertencias

- **Piloto de investigación, no producto**: el autor lo describe como un piloto inicial de un solo hablante; no se ha establecido que las salidas suenen naturales ni que pronuncien correctamente el Cameroon Pidgin.
- **Sin evaluación perceptiva**: no hay MOS, WER, CER, similitud de hablante ni escucha humana independiente; las métricas publicadas son pérdidas con teacher forcing.
- **Test no evaluado**: las 51 grabaciones de test reservadas no se puntuaron.
- **Datos muy limitados**: solo 400 grabaciones de entrenamiento y 1,2 épocas efectivas, lo que limita la cobertura de vocabulario, prosodia y variantes dialectales.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas, artefactos o audio incoherente, especialmente con texto fuera del dominio de entrenamiento.
- **Sesgos del corpus**: al derivar de Common Voice, hereda los sesgos de hablantes, temáticas y condiciones de grabación del dataset; el modelo representa una única voz.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no garantiza calidad para producción; se recomienda validación humana antes de cualquier despliegue real.
- **Dependencia de versión**: requiere `transformers` 4.57.6 o una versión compatible con soporte CSM; versiones distintas pueden fallar al cargar.
- **Consistencia de hablante**: la generación solo con texto puede degradar la consistencia; para mantenerla hay que aportar una referencia de texto y audio en el template de CSM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turaco-research/turaco-csm-tts-wes-1b
- Modelo base Sesame CSM 1B: https://huggingface.co/sesame/csm-1b
- Checkpoint base usado para el ajuste: https://huggingface.co/unsloth/csm-1b
- Dataset Common Voice Scripted Speech 27.0 — Cameroon Pidgin (Mozilla Data Collective): https://mozilladatacollective.com/datasets/cmu61lm5800kco107ohj0e507
- Métricas del experimento: `metrics/experiment.json`, `metrics/training_history.csv`, `metrics/training_log.json`, `metrics/export_verification.json`, `metrics/configuration.json`, `metrics/prompts.json`, `metrics/report_environment.json` (en el repositorio del modelo)
- Muestras de audio before/after: `samples/before_0.wav`, `samples/after_0.wav`, `samples/before_1.wav`, `samples/after_1.wav` (en el repositorio del modelo)
