# techiaith/whisper-large-ft-cy-en

## Resumen

El modelo `techiaith/whisper-large-ft-cy-en` es un ajuste fino de `openai/whisper-large-v2` para reconocimiento automático de voz en galés (cymraeg) e inglés, con capacidad experimental de traducción de voz galés a inglés. Ha sido desarrollado por la Uned Technolegau Iaith (Unidad de Tecnologías del Lenguaje) de la Universidad de Bangor, con financiación del Gobierno de Gales. El modelo responde a la necesidad de transcripción fiable de una lengua minoritaria que carece de sistemas comerciales robustos, y aprovecha la arquitectura Whisper de OpenAI como base.

La arquitectura es un transformer encoder-decoder con 1.543.304.960 parámetros (aproximadamente 1,54 mil millones), y su ventana de audio es de 30 segundos por segmento, igual que Whisper. El modelo está disponible bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones de atribución, aunque los datos de entrenamiento provienen en parte de Common Voice, que tiene sus propias condiciones de redistribución. Su relevancia actual radica en que es uno de los pocos modelos de ASR de tamaño grande específicamente entrenados para galés, con resultados de WER notables en habla leída, aunque con margen de mejora en habla espontánea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parametros totales | 1.543.304.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | FP16 (entrenamiento e inferencia), int8 (versión CTranslate2) |
| Idiomas soportados | Galés (cy) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también disponible en CTranslate2) |

## Arquitectura y entrenamiento

El modelo se basa en `openai/whisper-large-v2`, un transformer encoder-decoder con atención de múltiples cabezas y normalización pre-LayerNorm, diseñado originalmente para transcripción multilingüe. Whisper procesa el audio en ventanas de 30 segundos, que se convierten en espectrogramas log-mel de 80 bandas y se pasan por un encoder de 32 capas, mientras que el decoder (32 capas) genera el texto de forma autorregresiva. En este ajuste fino se entrenó sobre datos de habla galesa e inglesa, incluyendo los datasets `techiaith/banc-trawsgrifiadau-bangor`, `techiaith/corpws-clllc-wlga`, `cymen-arfor/lleisiau-arfor`, `techiaith/commonvoice_vad_cy` y una submuestra de `commonvoice_23_0_en__GB_IE` y `commonvoice_23_0_cy_en` (estos dos últimos no redistribuidos por restricciones de Mozilla). El entrenamiento se realizó con tasa de aprendizaje 1e-05, scheduler coseno, 500 pasos de warm-up, máximo 15000 pasos, weight decay 0.01, batch efectivo de 64 (16×2 acumulación×2 GPUs), FP16 y SpecAugment. Se aplicó curación de datos y selección de modelo según la métrica `eval_btb_wer`. El resultado es un modelo que mantiene la capacidad general de Whisper pero con mejoras específicas en galés e inglés con acentos británicos.

## Capacidades

- Transcripción de audio en galés (habla leída, espontánea y mixta) a texto galés.
- Transcripción de audio en inglés con acento británico e irlandés (evaluado en Common Voice GB-IE) a texto inglés.
- Traducción directa de voz galés a texto en inglés (experimental, con calidad limitada y no recomendada para producción).
- Uso mediante la API de pipeline de Transformers: `automatic-speech-recognition` con parámetros `language` y `task`.
- Capacidad de procesar audio de hasta 30 segundos por segmento; para audios más largos se necesita segmentación previa.
- No soporta otras tareas como reconocimiento de hablantes, diarización o detección de idioma automática; el idioma debe especificarse.

## Casos de uso

- **Transcripción de reuniones y actas en galés**: el modelo puede convertir grabaciones de asambleas locales o reuniones de negocios en texto galés con una precisión razonable en habla leída (WER 15,1 en Common Voice). Se integraría con herramientas de segmentación de audio y post-procesado para generar actas en formato texto.
- **Subtitulado de vídeos en galés**: para crear subtítulos en galés de contenido audiovisual (entrevistas, documentales, noticias), el modelo puede transcribir el audio y luego sincronizarse con la línea de tiempo. Su WER en habla leída es aceptable para este fin, aunque se recomienda revisión humana.
- **Transcripción de habla espontánea en galés para investigación lingüística**: el dataset `lleisiau-arfor` (conversaciones espontáneas) muestra un WER de 29,2, suficiente para análisis cualitativos o corpus de investigación, pero no para transcripción exacta sin revisión.
- **Traducción rápida de contenido oral en galés a inglés**: aunque la traducción directa es experimental, se puede usar como borrador para subtítulos o resúmenes. Para calidad alta, se recomienda transcribir primero con el modelo y luego traducir con un modelo de traducción automática dedicado.
- **Servicios públicos bilingües**: un organismo público en Gales puede usar el modelo para transcribir llamadas de atención al cliente en galés o inglés y generar registros textuales, facilitando el cumplimiento de normativas bilingües.
- **Arquivo histórico de grabaciones**: para digitalizar y transcribir colecciones de audio en galés (entrevistas, programas de radio) de manera automatizada, permitiendo búsqueda y indexación por contenido.

## Benchmarks y rendimiento

Los resultados de evaluación se publicaron en la model card y se basan en conjuntos de prueba retenidos. La media de WER sobre los 4 conjuntos de transcripción es 20,29 y la CER media es 7,33.

| Tarea | Conjunto de prueba | WER | CER |
|-------|-------------------|-----|-----|
| Transcripción galés | `cymen-arfor/lleisiau-arfor` (espontáneo) | 29,20 | 11,59 |
| Transcripción galés | `techiaith/banc-trawsgrifiadau-bangor` (mixto) | 26,71 | 9,91 |
| Transcripción galés | `techiaith/commonvoice-23-0-cy` (leído) | 15,10 | 4,35 |
| Transcripción inglés | `techiaith/commonvoice-23-0-en/GB-IE` (leído, UK/IR) | 10,16 | 3,47 |

No se han publicado comparaciones directas con otros modelos en los mismos conjuntos. La traducción galés→inglés no ha sido evaluada formalmente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con FP16, el modelo ocupa aproximadamente 3,1 GB de memoria para los pesos (1,54 B × 2 bytes). Añadiendo activaciones y overhead, se recomienda al menos 8 GB de VRAM para una inferencia cómoda en segmentos de 30 segundos. La versión CTranslate2 en int8 reduce la huella a ~1,5 GB y permite ejecución en GPU de menor capacidad.
- **GPU recomendadas**: RTX 2080 Ti (11 GB), RTX 3080/3090 (12/24 GB), A10 (24 GB), A100 (40/80 GB). En CPU se puede ejecutar con transformadores, pero la latencia será alta; CTranslate2 también ofrece CPU.
- **¿Cabe en consumer GPU?**: Sí, con 8 GB o más. La versión int8 de CTranslate2 puede funcionar en GPU con 4 GB (por ejemplo, RTX 3050) para segmentos cortos.
- **Opciones de despliegue**: Hugging Face Transformers (pipeline), CTranslate2 (más rápido, int8), FriendliAI (servicio gestionado con cuantización FP4/FP8/INT4/INT8). No es compatible con vLLM ni llama.cpp (que no soportan audio).
- **Latencia y throughput**: no hay datos publicados. La latencia depende de la longitud del audio; para un segmento de 30 s, en A100 se espera menos de 1 s de procesamiento, pero no se ha medido oficialmente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (galés leído) | Licencia | Disponibilidad |
|--------|------------|----------|--------------------|----------|----------------|
| `techiaith/whisper-large-ft-cy-en` (este) | 1,54 B | 30 s audio | 15,10 | Apache-2.0 | Hugging Face |
| `openai/whisper-large-v2` (base) | 1,54 B | 30 s audio | no disponible (mucho mayor) | MIT (no redistribución de pesos) | Hugging Face |
| `techiaith/whisper-large-v3-ft-cy-en` | 1,55 B | 30 s audio | 25,13 (en su evaluación) | Apache-2.0 | Hugging Face |

No se dispone de datos de WER del modelo base en galés, pero es conocido que Whisper v2 tiene un rendimiento pobre en lenguas minoritarias sin ajuste fino. La versión v3 fine-tuned de techiaith tiene un WER más alto en su propia evaluación (25,13) que este modelo, pero los conjuntos de prueba pueden diferir. El modelo aquí descrito es el más reciente y mejor documentado para galés.

## Limitaciones y advertencias

- **Traducción galés→inglés experimental**: la capacidad de traducción directa no está evaluada y su calidad es limitada; no debe usarse en producción para traducción.
- **WER alto en habla espontánea**: en conversaciones naturales (dataset `lleisiau-arfor`) el WER alcanza 29,2, lo que puede generar errores frecuentes en contextos informales.
- **Solo dos idiomas**: no soporta otros idiomas; el usuario debe especificar el idioma de entrada (cy o en) para evitar errores.
- **Ventana de audio fija**: el modelo procesa segmentos de 30 segundos; audios más largos requieren segmentación previa, lo que puede perder contexto de conversación.
- **Riesgo de alucinaciones**: como todo Whisper, puede generar texto plausible pero incorrecto en silencios o ruido de fondo; se recomienda validar en dominios críticos.
- **Licencia de datos**: aunque el modelo se publica con Apache-2.0, los datos de Common Voice utilizados no se redistribuyen; los usuarios deben obtener esos datos de Mozilla. El uso comercial está permitido, pero se debe verificar las condiciones de los datasets originales.
- **Cuantización**: la versión int8 de CTranslate2 puede degradar ligeramente la precisión; para tareas de alta exigencia se recomienda FP16.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/techiaith/whisper-large-ft-cy-en)
- [Versión CTranslate2 int8](https://huggingface.co/techiaith/whisper-large-ft-cy-en-ct2)
- [Modelo base `openai/whisper-large-v2`](https://huggingface.co/openai/whisper-large-v2)
- [Dataset `techiaith/banc-trawsgrifiadau-bangor`](https://huggingface.co/datasets/techiaith/banc-trawsgrifiadau-bangor)
- [Dataset `cymen-arfor/lleisiau-arfor`](https://huggingface.co/datasets/cymen-arfor/lleisiau-arfor)
- [Dataset `techiaith/corpws-clllc-wlga`](https://huggingface.co/datasets/techiaith/corpws-clllc-wlga)
- [Dataset `techiaith/commonvoice_vad_cy`](https://huggingface.co/datasets/techiaith/commonvoice_vad_cy)
- [Página de Uned Technolegau Iaith](https://techiaith.bangor.ac.uk/)
