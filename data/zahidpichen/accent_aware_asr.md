# zahidpichen/accent_aware_ASR

## Resumen

`zahidpichen/accent_aware_ASR` es un adaptador LoRA publicado con PEFT sobre el modelo base `openai/whisper-small`, orientado a reconocimiento automático del habla (ASR) con tolerancia a variaciones de acento. El repositorio, creado el 25 de octubre de 2026, no incluye model card sustantiva: la práctica totalidad de los campos de la plantilla siguen marcados como `[More Information Needed]`, por lo que el autor no documenta datos de entrenamiento, idiomas, licencia ni evaluación.

El interés técnico del artefacto está en su planteamiento: en lugar de entrenar un ASR completo, se distribuye un adaptador de bajo rango que se acopla al encoder-decoder de Whisper small (244 M de parámetros), lo que permite ajustar el comportamiento del modelo a acentos concretos con un coste de almacenamiento y cómputo muy reducido. Esto lo hace atractivo para equipos que ya tienen Whisper en producción y quieren especializarlo sin reentrenar el modelo completo.

No obstante, el repositorio presenta señales de alarma objetivas para su uso en producción: 0 descargas, 0 likes, tamaño de repositorio de 0,0 GB, licencia no especificada y ausencia total de métricas. Cualquier evaluación de su utilidad real requiere descargar los pesos, inspeccionar la configuración de PEFT e inferir sobre un conjunto propio, dado que el autor no aporta ni rango del adaptador, ni módulos objetivo, ni corpus de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `openai/whisper-small`, transformer encoder-decoder con preprocesado log-mel |
| Parámetros totales | 244 M del modelo base (whisper-small); parámetros del adaptador: no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 s (1500 frames log-mel de 80 canales) y 448 tokens en el decoder, heredados del modelo base |
| Tipos de cuantización | no disponible en el repositorio; el adaptador se distribuye en safetensors sin indicar precisión |
| Idiomas soportados | no disponible en la model card; el modelo base whisper-small es multilingüe (≈99 idiomas) |
| Licencia | no disponible para el adaptador; el modelo base `openai/whisper-small` es MIT |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); librería declarada: `peft` |
| Tarea declarada | automatic-speech-recognition (no aparece en el campo `pipeline_tag`) |
| Tamaño del repositorio | 0,0 GB |
| Versión de PEFT | 0.21.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base `openai/whisper-small` es un transformer encoder-decoder de 244 M de parámetros (12 capas de encoder y 12 de decoder, dimensión 768, 12 cabezas de atención) que consume espectrogramas log-mel de 80 canales en ventanas de 30 segundos y genera tokens de texto con marcas de tiempo y tokens especiales de idioma y tarea. Whisper fue entrenado por OpenAI con aproximadamente 680.000 horas de audio débilmente supervisado procedente de la web, sin fine-tuning específico por dataset, e incluye transcripción multilingüe, identificación de idioma y traducción de voz a inglés.

Sobre esa base, este repositorio añade un adaptador LoRA, técnica que congela los pesos originales e inyecta matrices de bajo rango en determinadas capas para modificar el comportamiento con un número reducido de parámetros entrenables. El autor no especifica el rango (`r`), el valor de `alpha`, el dropout, los módulos objetivo (típicamente `q_proj`/`v_proj`, pero no confirmado aquí) ni la composición del corpus de entrenamiento, más allá de lo que sugiere el nombre del repositorio (adaptación a acentos). Tampoco se documenta si el adaptador se aplicó solo al encoder, solo al decoder o a ambos, ni qué hiperparámetros de entrenamiento se usaron. No se declara ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación, etc.).

## Capacidades

- Transcripción de voz a texto heredada de Whisper small, con segmentación en ventanas de 30 segundos.
- Adaptación declarada (no verificada) a variaciones de acento en el habla; el nombre del repositorio es la única evidencia al respecto.
- Identificación de idioma y traducción de voz a inglés, si el adaptador no ha degradado esas capacidades del modelo base.
- Generación de marcas de tiempo a nivel de segmento, útil para subtitulado.
- Procesamiento multilingüe heredado del modelo base (≈99 idiomas), con calidad desconocida tras el ajuste LoRA.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio en tiempo real por streaming nativo.
- No hay modo "thinking", ni capacidades de audio más allá de la transcripción/traducción.

## Casos de uso

- Transcripción en centros de contacto con hablantes de acentos no estándar: el adaptador se cargaría sobre whisper-small en el pipeline de post-llamada para convertir grabaciones en texto antes de analítica; el interés está en mejorar la precisión sobre acentos concretos sin desplegar un modelo mayor.
- Subtitulado automático de vídeo: el modelo base produce timestamps por segmento, de modo que el adaptador puede integrarse en un pipeline de generación de subtítulos; los segmentos largos deben trocearse para respetar la ventana de 30 s.
- Actas y notas de reuniones: transcripción por lotes de audio de sala con varios hablantes (sin diarización, que este modelo no ofrece) para alimentar resúmenes posteriores con un LLM.
- Preetiquetado de corpus ASR: usar el adaptador para generar transcripciones preliminares sobre un dataset propio y revisarlas manualmente, reduciendo el coste de anotación; útil solo si se valida antes su WER frente al modelo base.
- Traducción de contenido hablado a inglés: conferencias o pódcasts en otros idiomas transcritos y traducidos en una sola pasada, aprovechando la tarea de traducción de Whisper.
- Asistentes de voz en entornos con recursos limitados: al ser un adaptador sobre un modelo de 244 M, puede ejecutarse en CPU o en GPU de gama baja junto al resto de la aplicación.
- Investigación sobre adaptación de acentos: serviría como punto de partida reproducible para comparar técnicas de fine-tuning (LoRA frente a full fine-tuning) en ASR, siempre que se documente el entrenamiento, cosa que aquí falta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, CER ni ninguna otra métrica, ni sobre el corpus de entrenamiento ni sobre conjuntos estándar (LibriSpeech, Common Voice, FLEURS, VoxPopuli). Tampoco hay comparación con el modelo base sin adaptador, por lo que no es posible determinar si el ajuste LoRA mejora o degrada la transcripción.

## Requisitos de hardware

- VRAM estimada: ~0,5 GB en fp16 y ~0,25 GB en int8 para los 244 M de parámetros del modelo base, más unos pocos MB del adaptador y el espacio de activaciones.
- GPU recomendadas: cualquier GPU con 4 GB o más es suficiente (T4, L4, RTX 3060/4060, RTX 4090). A100/H100 solo tendrían sentido para servir muchas peticiones en paralelo por GPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna; también funciona en CPU con cuantización int8.
- Opciones de despliegue: `transformers` + `peft` (cargar el adaptador con `PeftModel.from_pretrained` sobre `openai/whisper-small`, y opcionalmente `merge_and_unload` para exportar un modelo único), `faster-whisper`/CTranslate2 o `whisper.cpp` previa conversión del modelo fusionado, WhisperX para alineación temporal,HF Inference Endpoints, SageMaker o Triton. vLLM tiene soporte limitado de Whisper y requiere verificar la versión. Ollama no soporta modelos de audio de forma nativa.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor y cualquier cifra dependería de la GPU, la cuantización y la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zahidpichen/accent_aware_ASR` (este) | 244 M (base) + adaptador no documentado | 30 s | no disponible | no disponible | Repositorio con 0 descargas, sin evaluación |
| `openai/whisper-small` | 244 M | 30 s | ≈99 | MIT | Muy extendido, amplio ecosistema |
| `openai/whisper-base` | 74 M | 30 s | ≈99 | MIT | Extendido; menor precisión que small |
| `openai/whisper-medium` | 769 M | 30 s | ≈99 | MIT | Extendido; requiere más VRAM |
| `openai/whisper-large-v3` | 1550 M | 30 s | ≈100 | MIT | Referencia de calidad en la familia Whisper |

Frente a las alternativas, este repositorio solo se diferenciaría por la adaptación a acentos, extremo no verificado ni cuantificado. En parámetros, contexto y licencia del modelo subyacente es idéntico a whisper-small; la incógnita está en si la licencia del adaptador permite uso comercial, dato que el autor no facilita.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, hiperparámetros de LoRA, evaluación ni uso previsto; cualquier despliegue exige una validación propia.
- El repositorio marca 0,0 GB de tamaño, por lo que conviene verificar que los pesos del adaptador están realmente subidos y no solo la configuración.
- Licencia del adaptador no especificada: no puede asumirse uso comercial aunque el modelo base sea MIT; hay que contactar con el autor o tratar el artefacto como no licenciado.
- Sin métricas: se desconoce si el ajuste mejora el WER del modelo base o lo degrada por olvido catastrófico, especialmente en idiomas distintos del usado en el entrenamiento.
- Sesgos desconocidos: al no documentarse el corpus, no se puede evaluar el sesgo por acento, género, edad o variante dialectal; es probable que el ajuste esté dominado por una única variedad de acento.
- Riesgo de alucinación típico de Whisper: en silencios, ruido o música el modelo puede generar texto inventado; en producción conviene aplicar detección de silencio (`no_speech_prob`) y filtros de repetición.
- Limitación estructural de la ventana de 30 s: el audio largo requiere troceado (con solapamiento) y puede producir derivas en los timestamps.
- Sin diarización de hablantes ni separación de fuentes; para reuniones hay que combinarlo con un modelo aparte.
- Calidad multilingüe no garantizada: el ajuste LoRA puede haber estrechado el modelo hacia un subconjunto de idiomas o acentos.
- El tag `arxiv:1910.09700` del repositorio corresponde a la calculadora de impacto medioambiental citada en la plantilla de model card, no a un artículo sobre este modelo; no debe interpretarse como referencia técnica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zahidpichen/accent_aware_ASR
- Perfil del autor: https://huggingface.co/zahidpichen/models
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Documentación de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto medioambiental citada en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700 y https://mlco2.github.io/impact
- Listado de modelos ASR en HuggingFace: https://huggingface.co/models?pipeline_tag=automatic-speech-recognition
- Proyecto externo no vinculado al autor, sobre ASR con acentos: https://github.com/AdroitAnandAI/Indian-Accent-Speech-Recognition
- Proyecto externo no vinculado al autor, sobre ASR tolerante a acentos: https://github.com/Ranin01/ACCENT_AWARE_SPEECH_RECONNIZATION_SYSTEM
- Comparativa de modelos ASR abiertos (2026): https://www.marktechpost.com/2026/07/23/best-open-speech-recognition-asr-models-in-2026-wer-languages-latency-and-license-compared/
