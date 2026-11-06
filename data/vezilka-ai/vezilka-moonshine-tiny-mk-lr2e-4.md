# vezilka-ai/vezilka-moonshine-tiny-mk-lr2e-4

## Resumen

Vezilka Moonshine Tiny (Macedonian, LR 2e-4) es un ajuste fino completo del modelo de reconocimiento automático del habla (ASR) UsefulSensors/moonshine-tiny, desarrollado por el equipo de vezilka-ai en el marco del proyecto VEZILKA, impulsado por el Ministerio de Educación y Ciencia de Macedonia del Norte y cofinanciado por la Comisión Europea y EuroHPC JU. El modelo resuelve el problema de la transcripción de voz en macedonio, un idioma con escasa cobertura en los sistemas ASR comerciales y de código abierto.

Con solo 27.092.736 parámetros, el modelo se posiciona como una alternativa extremadamente ligera para despliegues en entornos con recursos limitados. La arquitectura Moonshine procesa directamente la forma de onda a 16 kHz, de modo que su coste computacional escala con la duración del audio en lugar de con una ventana de espectrograma fija. El ajuste se realizó con una tasa de aprendizaje máxima de 2e-4 durante 3 épocas.

El modelo es relevante ahora porque demuestra que un ajuste fino cuidadoso de una arquitectura pequeña, combinado con un corpus específico de dominio (clases universitarias de FINKI, sesiones parlamentarias, audiolibros y donaciones ciudadanas), puede alcanzar un WER del 12 % en un benchmark de referencia revisado manualmente, con licencia Apache-2.0 que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Moonshine (encoder-decoder para ASR, procesa forma de onda cruda a 16 kHz) |
| Parametros totales | 27.092.736 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible como ventana de tokens; el decoder tiene 194 posiciones y se recomienda generar como máximo 192 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente float32/float16) |
| Idiomas soportados | Macedonio (mk) |
| Licencia | Apache-2.0 (modelo base bajo licencia MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Moonshine, una arquitectura encoder-decoder diseñada para ASR que consume directamente la forma de onda de audio a 16 kHz, evitando el paso de extracción de características tipo mel-espectrograma de Whisper. Esta decisión hace que el coste de cómputo sea proporcional a la duración del clip y no a una ventana fija de 30 segundos, lo que resulta especialmente eficiente para audios cortos. El decoder dispone de 194 posiciones, por lo que las generaciones deben mantenerse en 192 tokens o menos.

El ajuste fino fue completo (todos los parámetros) durante 3 épocas con un 1 % de warm-up y una tasa de aprendizaje máxima de 2e-4. Los datos de entrenamiento provienen de la mezcla del proyecto: la exportación de la colección Vezilka-ASRI (clases de FINKI, sesiones parlamentarias y audiolibros de NSSRM con transcripciones automáticas), donaciones aceptadas de Doniraj (submissions-20260831), los conjuntos de transcripciones de YouTube/TV del proyecto (videa_so_transkript_od_yt, alfa_audios, sitel_audios), un conjunto de jerga técnica y los subconjuntos en macedonio de Mozilla Common Voice (CC0-1.0) y Google FLEURS (CC-BY-4.0). No se documenta el uso de RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Transcripción de voz a texto en macedonio a partir de audio crudo a 16 kHz.
- Reconocimiento de habla en dominios técnicos y académicos (clases de informática de FINKI) gracias al corpus de entrenamiento específico.
- Manejo de audio de diversa procedencia: clases, sesiones parlamentarias, audiolibros, emisiones de YouTube/TV y grabaciones ciudadanas.
- Procesamiento eficiente de clips cortos, con coste proporcional a la duración del audio.
- Integración directa con el pipeline `automatic-speech-recognition` de Transformers.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción; es un modelo ASR puro.
- Capacidad multilingüe limitada al macedonio; no se declaran otros idiomas.

## Casos de uso

- Transcripción de clases universitarias: el modelo se entrenó con clases de FINKI y puede transcribir grabaciones de asignaturas de informática con jerga técnica, facilitando apuntes y subtítulos para estudiantes.
- Subtitulado de sesiones parlamentarias: dado que el corpus incluye sesiones parlamentarias macedonias, el modelo es adecuado para generar actas y subtítulos de debates públicos con bajo coste computacional.
- Generación de subtítulos para emisiones de YouTube y TV: los conjuntos videa_so_transkript_od_yt, alfa_audios y sitel_audios permiten usar el modelo para subtitular contenido audiovisual macedonio de forma automática.
- Audiolibros accesibles: el entrenamiento con audiolibros de NSSRM lo hace útil para transcribir y sincronizar audiolibros, mejorando la accesibilidad para personas con discapacidad auditiva.
- Asistentes de voz locales en macedonio: con 27 M de parámetros, puede desplegarse en dispositivos de borde o en servidores modestos para dictado y comandos de voz en aplicaciones locales.
- Investigación lingüística y creación de corpus: el modelo sirve para transcribir grandes volúmenes de audio macedonio y generar corpus anotados, dado su bajo coste de inferencia.
- Archivado y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio para indexación y búsqueda por texto en emisoras o instituciones.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en el Vezilka FINKI Lecture ASR Benchmark, configuración `finki-benchmark` del dataset vezilka-ai/macedonian-speech, split test. Métricas normalizadas en % (NFC, minúsculas, sin puntuación), inferencia en CUDA, float32, batch 1, beam 4.

| Vista | Clips | WER | CER | S | I | D |
|---|---:|---:|---:|---:|---:|---:|
| full | 1.406 | 12,00 | 4,79 | 4.031 | 1.317 | 1.128 |
| speaker_balanced | 892 | 10,79 | 4,12 | 2.311 | 770 | 616 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks estándar de ASR multilingüe.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (27 M de parámetros, ~108 MB de pesos) más el estado de activaciones, que depende de la duración del audio; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve; para producción de alto volumen se recomiendan A100, H100 o L4 por su throughput, aunque el modelo no las necesita para funcionar.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX antiguas), así como en CPU y en dispositivos de borde.
- Opciones de despliegue: pipeline de Transformers, vLLM no aplica de forma estándar para ASR, TGI no es el objetivo principal; es viable con ONNX Runtime, CTranslate2 y llama.cpp no aplica (no es un modelo de lenguaje). El despliegue natural es `transformers.pipeline("automatic-speech-recognition")`.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 27 M de parámetros, se espera latencia muy baja en GPU y aceptable en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| vezilka-moonshine-tiny-mk-lr2e-4 | 27,1 M | audio crudo 16 kHz, decoder 194 posiciones | mk | Apache-2.0 | 12,00 (full) / 10,79 (speaker_balanced) en FINKI benchmark |
| UsefulSensors/moonshine-tiny (base) | ~27 M | audio crudo 16 kHz | en (principalmente) | MIT | no disponible en la información |
| Whisper tiny | ~39 M | ventana fija de 30 s (mel-espectrograma) | multilingüe (incluye mk de forma limitada) | MIT | no disponible en la información |
| Whisper small | ~244 M | ventana fija de 30 s | multilingüe | MIT | no disponible en la información |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de WER de los modelos comparables no se han publicado en este contexto.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en macedonio; no debe esperarse un rendimiento aceptable en otros idiomas.
- El WER del 12 % en el benchmark completo indica que aproximadamente una de cada ocho palabras se transcribe incorrectamente en el dominio evaluado; en dominios distintos (conversación espontánea, ruido, acentos no representados) el error puede ser mayor.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o habla solapada, comportamiento habitual en modelos encoder-decoder de ASR.
- El decoder tiene 194 posiciones; generar más de 192 tokens puede degradar o truncar la salida.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados.
- Sesgos derivados del corpus: sobrerrepresentación de habla académica, parlamentaria y de audiolibros; posible infrarepresentación de registros coloquiales o dialectos regionales.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base es MIT; conviene revisar ambas licencias en despliegues comerciales.
- El modelo no incluye puntuación ni normalización en la salida más allá de lo aprendido; las métricas se calcularon con normalización (NFC, minúsculas, sin puntuación), por lo que la salida cruda puede diferir.
- No dispone de marcas de tiempo por palabra ni diarización de hablantes de forma nativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vezilka-ai/vezilka-moonshine-tiny-mk-lr2e-4
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny
- Dataset de evaluación y entrenamiento: https://huggingface.co/datasets/vezilka-ai/macedonian-speech
- Google FLEURS: https://huggingface.co/datasets/google/fleurs
- Mozilla Common Voice: https://commonvoice.mozilla.org/
- Proyecto VEZILKA (Grant Agreement No. 101263128): no disponible enlace directo en la información proporcionada
- Artículo de datos (Gajdov, Karamachoski, Stojcheva, Mishkovski y Mishev): en revisión, sin cita disponible todavía
