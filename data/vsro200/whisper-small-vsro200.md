# vsro200/whisper-small-vsro200

## Resumen

Whisper-small-vsro200 es un ajuste fino del modelo de reconocimiento automático del habla Whisper Small, desarrollado por el usuario vsro200 como componente acústico de un pipeline de reconocimiento de habla audiovisual (AVSR) para rumano. El modelo parte de `alexandradiaconu/whisper-small-echo-34` y se ha reentrenado con muestras de ruido del corpus MUSAN para mejorar su robustez en condiciones acústicas adversas, un escenario donde el Whisper original degrada rápidamente su precisión.

Con 241.734.912 parámetros y un tamaño de repositorio de 2,9 GB, el modelo mantiene la arquitectura transformer encoder-decoder característica de la familia Whisper. Su función principal no es operar de forma aislada, sino combinarse mediante shallow fusion con modelos de reconocimiento visual del habla (VSR) en rumano durante la decodificación por beam search, fusionando las probabilidades acústicas y visuales.

El modelo es relevante en el contexto de la investigación en ASR de bajos recursos y en robustez multimodal: el paper asociado, *VSRo-200: A Romanian Visual Speech Recognition Dataset for Studying Supervision and Multimodal Robustness* (NeurIPS 2026), lo utiliza como backbone de audio para estudiar cómo la integración audiovisual recupera rendimiento cuando la señal de audio es poco fiable. No obstante, se trata de un modelo de nicho, con solo 2 descargas y sin licencia declarada, orientado a investigación más que a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s, característica de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | rumano (ro) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura de Whisper Small: un transformer encoder-decoder con atención completa, diseñado para transcribir segmentos de audio de 30 segundos. El ajuste fino se realizó sobre el checkpoint `alexandradiaconu/whisper-small-echo-34`, adaptándolo a condiciones de ruido acústico en rumano. Los datos de entrenamiento se aumentaron con muestras de ruido del corpus MUSAN, y el conjunto de datos asociado es `vsro200/vsro200`.

Los hiperparámetros de entrenamiento declarados son: learning rate de 1e-05, batch size efectivo de 32 (batch de 8 con 4 pasos de acumulación de gradiente), optimizador AdamW con precisión mixta nativa (AMP), scheduler lineal con 100 pasos de warmup, 3 épocas y semilla 42. El entrenamiento se ejecutó con Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2. No se detalla el número total de tokens de audio ni la composición exacta del dataset de entrenamiento más allá de la referencia al corpus VSRo-200 y a MUSAN. La innovación técnica destacable no está en la arquitectura, sino en su uso como pieza de un sistema de shallow fusion con modelos visuales, donde las probabilidades acústicas y visuales se combinan durante el beam search.

## Capacidades

- Reconocimiento automático del habla en rumano, con especial énfasis en condiciones de ruido acústico (gaussiano, babble y ruido natural de fondo).
- Transcripción de audio robusta gracias al entrenamiento con aumentación de ruido (MUSAN).
- Integración como backbone acústico en pipelines AVSR mediante shallow fusion con modelos VSR rumanos.
- Generación de probabilidades por token compatibles con decodificación por beam search y fusión multimodal.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta capacidad multilingüe más allá del rumano.
- No se documentan modos de razonamiento (thinking mode), visión, audio adicional ni otras capacidades especiales distintas del ASR.

## Casos de uso

- Investigación en reconocimiento de habla audiovisual: el modelo se usa como rama acústica del pipeline AVSR del paper VSRo-200, combinándose con modelos VSR mediante shallow fusion para estudiar robustez multimodal en rumano.
- Transcripción de audio con ruido de fondo en rumano: adecuado para grabaciones con ruido gaussiano o babble a SNR moderadas (10-15 dB), donde el ajuste fino reduce el WER frente al Whisper zero-shot (18,53 % frente a 32,76 % con ruido gaussiano a 10 dB).
- Evaluación comparativa de robustez acústica: sirve como baseline ajustado para medir la degradación de ASR en distintos niveles de SNR y tipos de ruido.
- Reproducción de experimentos académicos: permite replicar las tablas de resultados del paper VSRo-200 y del artículo RO-N3WS sobre benchmarks de rumano.
- Prototipado de sistemas de subtitulado para vídeo en rumano en entornos controlados de investigación, siempre que se combine con la rama visual cuando el audio sea deficiente.
- Estudio de estrategias de fusión (shallow fusion, confidence-aware fusion): el modelo permite analizar cómo se redistribuye el peso entre audio y vídeo cuando la confianza acústica cae.
- Docencia y experimentación con Whisper Small: al ser un checkpoint pequeño (241 M de parámetros), es manejable para pruebas de ajuste fino y aumentación de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split `test_unseen` de VSRo-200 (389 clips, ~1 hora) y sobre la categoría `noisy` del test out-of-domain (100 clips). Todas las métricas son WER (%) — menor es mejor.

Ruido gaussiano:

| SNR (dB) | Whisper zero-shot | Whisper fine-tuned | MultiVSR (visual) | Fusion (zero-shot + VSR) | Fusion (fine-tuned + VSR) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| -5 | 88,57 | 84,29 | 48,75 | 64,95 | **39,24** |
| 0 | 67,22 | 46,29 | 48,75 | 48,19 | **31,31** |
| 5 | 46,69 | 27,25 | 48,75 | 35,64 | **21,82** |
| 10 | 32,76 | 18,53 | 48,75 | 26,28 | **16,77** |
| 15 | 25,45 | 14,50 | 48,75 | 21,60 | **14,02** |

Ruido babble:

| SNR (dB) | Whisper zero-shot | Whisper fine-tuned | MultiVSR (visual) | Fusion (zero-shot + VSR) | Fusion (fine-tuned + VSR) |
|:---:|:---:|:---:|:---:|:---:|:---:|
| -5 | 94,37 | 150,10 | 48,75 | 81,82 | **48,14** |
| 0 | 76,00 | 58,66 | 48,75 | 53,50 | **33,80** |
| 5 | 47,18 | 24,48 | 48,75 | 34,61 | **19,59** |
| 10 | 29,93 | 15,68 | 48,75 | 24,05 | **14,90** |
| 15 | 23,78 | **12,40** | 48,75 | 19,05 | 12,92 |

Ruido natural de fondo (OOD `noisy`):

| Whisper zero-shot | Whisper fine-tuned | MultiVSR (visual) | Fusion (zero-shot + VSR) | Fusion (fine-tuned + VSR) |
|:---:|:---:|:---:|:---:|:---:|
| 33,09 | 22,76 | 68,96 | 26,16 | **21,57** |

El autor señala que, a niveles extremos de ruido (babble a -5 dB), el modelo de audio ajustado colapsa (150,10 % WER) y es la fusión con la rama visual la que recupera el rendimiento hasta 48,14 % WER. A SNR alta, la fusión y el Whisper ajustado rinden de forma similar.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 241 M de parámetros, en fp32 ocupa aproximadamente 1 GB de pesos; en fp16, alrededor de 0,5 GB. Con overhead de activaciones y decodificación, se estima un uso de VRAM de 1-2 GB en fp16, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se incluyen RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema.
- Cabe en GPU de consumo: sí, en modelos como GTX 1660, RTX 2060, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers (librería declarada), y por compatibilidad con Whisper Small, cabría esperar soporte en llama.cpp, Ollama y TGI, aunque no se documenta explícitamente en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento destacado |
|---|---|---|---|---|---|
| whisper-small-vsro200 | 241,7 M | no disponible (audio de 30 s) | ro | no disponible | WER 22,76 % en ruido natural OOD; 18,53 % con gaussiano a 10 dB |
| Whisper Small (zero-shot) | ~244 M | audio de 30 s | multilingüe | MIT (según la familia Whisper) | WER 33,09 % en ruido natural OOD; 32,76 % con gaussiano a 10 dB |
| MultiVSR (visual) | no disponible | no disponible | ro | no disponible | WER 48,75 % constante (solo visual) |
| alexandradiaconu/whisper-small-echo-34 | no disponible | no disponible | ro | no disponible | Modelo base del ajuste fino; sin métricas publicadas en esta ficha |

La comparación más directa es con el Whisper Small zero-shot, sobre el que el ajuste fino mejora el WER en todos los regímenes de ruido evaluados salvo en babble a -5 dB, donde colapsa. Frente al modelo visual MultiVSR, el ajuste fino es claramente superior en audio limpio o moderadamente ruidoso, mientras que la fusión de ambos es la configuración más robusta en todos los escenarios.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un corpus rumano específico (VSRo-200), puede presentar sesgo hacia el dominio, acento y condiciones de grabación de dicho corpus.
- Riesgo de alucinación: como todo modelo Whisper, puede generar transcripciones plausibles pero incorrectas en segmentos con audio ininteligible o ruido extremo.
- Limitaciones de contexto e idioma: soporta únicamente rumano; la ventana de audio es la estándar de Whisper (30 s por segmento).
- Degradación severa en ruido extremo: a babble -5 dB el WER alcanza el 150,10 %, por lo que no debe usarse de forma aislada en esas condiciones; requiere la fusión con la rama visual.
- Licencia no disponible: no se declara licencia, lo que impide confirmar si el uso comercial está permitido; se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Madurez limitada: solo 2 descargas y 0 likes en el momento de la consulta, sin resultados en el model-index oficial; es un artefacto de investigación, no un modelo validado para producción.
- Dependencia de la versión de framework: entrenado con Transformers 5.0.0 y PyTorch 2.10.0, versiones que pueden requerir entornos específicos para su reproducción.
- Sin datos de cuantización ni de latencia: no se han publicado mediciones de rendimiento en hardware concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vsro200/whisper-small-vsro200
- Modelo base: https://huggingface.co/alexandradiaconu/whisper-small-echo-34
- Colección de modelos VSR rumanos: https://huggingface.co/vsro200/models-vsro200
- Repositorio GitHub del pipeline AVSR: https://github.com/vsro200/vsro200
- Dataset VSRo-200: https://huggingface.co/datasets/vsro200/vsro200
- Paper VSRo-200 (NeurIPS 2026, Track on Evaluations and Datasets): referencia en la model card, sin URL directa disponible
- Paper RO-N3WS (arXiv:2603.02368): https://arxiv.org/abs/2603.02368
