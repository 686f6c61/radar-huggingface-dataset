# superproof/parakeet-tdt-1.1b-bf16

# superproof/parakeet-tdt-1.1b-bf16

## Resumen

Repositorio alojado en HuggingFace por el usuario `superproof` que contiene pesos en precisión bf16 asociados al identificador `parakeet-tdt-1.1b`. La model card publicada está vacía: únicamente incluye el bloque YAML con la licencia CC-BY-4.0, sin descripción, sin pipeline declarado, sin idiomas y sin resultados de evaluación. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.

El identificador sugiere una conversión o réplica de la familia Parakeet TDT de NVIDIA, un modelo de reconocimiento automático del habla (ASR) de aproximadamente 1.100 millones de parámetros basado en un codificador FastConformer y un decodificador TDT (Token-and-Duration Transducer). El sufijo `bf16` apunta a que se trata de un artefacto de pesos en bfloat16, presumiblemente derivado de un modelo previo en otra precisión. Ninguno de estos extremos está confirmado por el autor del repositorio.

La relevancia de este artefacto es limitada pero concreta: si se confirma que corresponde a un modelo ASR de 1,1 B en bf16, ocuparía unos 2,2 GB de VRAM en pesos, lo que lo haría desplegable en GPUs de consumo para transcripción local, con las ventajas de privacidad y coste que eso implica. En su estado actual, sin documentación ni benchmarks, no es evaluable ni recomendable para producción sin una verificación manual previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Desarrollador / repositorio | `superproof` (usuario de HuggingFace) |
| Arquitectura | no disponible (el identificador apunta a FastConformer + decodificador TDT; sin confirmar) |
| Parámetros totales | 1,1 B según el identificador; la model card no lo confirma |
| Longitud de contexto | no disponible (en ASR el equivalente es la ventana de audio admitida, no especificada) |
| Tipos de cuantización | no disponible; el repositorio solo declara pesos en bf16 |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | bf16 (contenedor no especificado: safetensors, `.nemo` u otro) |
| Pipeline declarado | no disponible |
| Fecha de creación declarada | 2026-09-30 (metadato posiblemente erróneo) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta ni la arquitectura ni el proceso de entrenamiento de este repositorio. El único dato verificable es la licencia declarada en el frontmatter. Cualquier afirmación sobre datos de entrenamiento, número de tokens o método de alineación sería especulativa, por lo que se marca como no disponible.

A título de contexto sobre la familia a la que apunta el nombre: TDT (Token-and-Duration Transducer) es un decodificador de tipo transductor que predice conjuntamente el token de salida y su duración, lo que permite avanzar varios fotogramas por paso de decodificación y reduce el coste de inferencia frente a un transductor clásico. FastConformer es una variante de Conformer con submuestreo mediante convolución depthwise-separable (habitualmente 8x), diseñada para procesar audio largo en una sola pasada. La combinación de ambos es la base de la familia Parakeet de NVIDIA, implementada en el toolkit NeMo. Se insiste en que esta descripción corresponde a la familia y no está confirmada para el contenido real de este repositorio.

## Capacidades

- La model card no declara ninguna capacidad de forma explícita; la siguiente lista es una hipótesis derivada del identificador y debe verificarse contra los pesos reales.
- Transcripción de voz a texto (ASR) en una sola pasada, si efectivamente se trata de un modelo Parakeet TDT.
- Puntuación y capitalización automática en la salida, capacidades habituales en esta familia de modelos.
- Marcas de tiempo a nivel de palabra o segmento, también habituales en la familia, pero no confirmadas aquí.
- Soporte de tool calling / function calling: no disponible; poco probable en un modelo ASR puro.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; la model card no declara ningún idioma.
- Capacidades especiales (modo de razonamiento, visión, audio de entrada): no disponibles.

## Casos de uso

Los siguientes escenarios son plausibles únicamente si se confirma que el artefacto es un modelo ASR funcional y completo. Se listan como hipótesis de despliegue, no como usos validados.

- Subtitulado automático de vídeo y audio: transcripción con marcas de tiempo exportable a SRT/VTT para postproducción. Un modelo de 1,1 B en bf16 cabe en GPUs de consumo, lo que permite procesar material localmente sin subir el audio a servicios externos.
- Actas y notas de reuniones: transcripción de audio multi-hablante de larga duración. Requiere verificar la ventana de audio admitida y, en su caso, segmentar la entrada; la diarización no estaría incluida y habría que resolverla con un modelo aparte.
- Analítica de centros de contacto: convertir grabaciones de llamadas en texto para clasificación posterior, análisis de sentimiento o cumplimiento de calidad. El interés principal es el coste por hora de audio bajo al ejecutarse en hardware propio.
- Dictado clínico o legal con datos sensibles: al poder ejecutarse de forma local o en infraestructura propia, evita enviar audio con datos personales a terceros, lo que facilita el encaje con requisitos de protección de datos.
- Indexado y búsqueda semántica de archivos de audio: transcribir un corpus de podcasts, clases o entrevistas y generar embeddings sobre el texto para búsqueda posterior o RAG.
- Pseudo-etiquetado de datasets de ASR: usar el modelo para transcribir grandes volúmenes de audio y revisar después, reduciendo el coste de anotación manual en proyectos de datos.
- Accesibilidad en directo: subtitulado de eventos o clases con latencia baja, si el rendimiento en tiempo real (RTF) resulta adecuado, extremo que no se ha publicado.
- Transcripción embebida en aplicaciones de escritorio: con pesos de unos 2,2 GB en bf16, es viable integrarlo en una aplicación local con GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye WER en LibriSpeech, resultados en el Open ASR Leaderboard ni métricas de latencia o RTF. Para un modelo ASR, las métricas relevantes serían el WER (global y por acento o dominio), el RTF, el coste de memoria por hora de audio y el rendimiento con audio ruidoso o solapado. Ninguna de ellas está disponible en este repositorio.

## Requisitos de hardware

Estimaciones derivadas del recuento declarado de 1,1 B parámetros; no verificadas sobre los pesos reales, que no se han descargado.

- Peso de los pesos en memoria: aproximadamente 2,2 GB en bf16, 4,4 GB en fp32, 1,1 GB en int8 y en torno a 0,6 GB en 4 bits.
- VRAM total en inferencia: estimada en 3-6 GB en bf16, en función del tamaño de lote y de la duración del audio procesado (las activaciones de un codificador convolucional crecen con la longitud de entrada).
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. También en tarjetas de 8 GB si se ajusta el lote.
- GPU de centro de datos: A100, H100, L40S, L4 y T4. Las GPU anteriores a Ampere (Turing, Volta) no ejecutan bf16 de forma nativa; requerirían conversión a fp16 o fp32.
- Precisión: bf16 requiere soporte nativo (Ampere o posterior) para aprovechar la ruta rápida; en arquitecturas anteriores conviene reconvertir.
- Opciones de despliegue: si el modelo es de la familia Parakeet, las vías habituales son el toolkit NVIDIA NeMo, NVIDIA Riva/NIM, exportación a ONNX Runtime y Triton Inference Server. No es esperable que funcione en llama.cpp, Ollama o vLLM, que no implementan decodificadores transductores de ASR.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF ni de horas de audio procesadas por hora de GPU en este repositorio.
- CPU: la inferencia en CPU es posible tras exportar a ONNX o con implementaciones específicas, pero no hay datos de rendimiento para este artefacto concreto.

## Comparativa con modelos similares

La comparación con este repositorio no puede establecerse porque carece de benchmarks y de especificación funcional. Se incluyen, como referencia del segmento, modelos ASR abiertos de tamaño comparable. Las cifras de estas alternativas proceden de sus fichas públicas y no se han verificado en el contexto de esta ficha.

| Modelo | Parámetros | Idiomas | Licencia | Ventana de audio | Disponibilidad |
|---|---|---|---|---|---|
| superproof/parakeet-tdt-1.1b-bf16 | 1,1 B (según identificador) | no disponible | CC-BY-4.0 | no disponible | HuggingFace, sin documentar |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6 B | Inglés | CC-BY-4.0 | audio largo en una pasada | HuggingFace, documentado |
| openai/whisper-large-v3 | 1,55 B | ~99 idiomas | MIT | segmentos de 30 s | HuggingFace, ampliamente soportado |
| nvidia/canary-1b | 1 B | 4 idiomas (incluido español) | CC-BY-NC-4.0 | audio largo | HuggingFace, uso no comercial |

Nota: Whisper large-v3 y Canary-1b admiten además traducción; los modelos Parakeet de la familia TDT se orientan a transcripción. Si el objetivo es cobertura multilingüe o uso comercial sin restricciones derivadas, conviene evaluar las alternativas documentadas antes que este repositorio.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre arquitectura, datos de entrenamiento, tokenizador, configuración de inferencia ni procedencia de los pesos. No se puede verificar que el contenido corresponda al nombre del repositorio.
- Ausencia de validación comunitaria: 0 descargas y 0 likes implican que nadie ha reproducido ni reportado resultados sobre este artefacto.
- Fecha de creación declarada como 2026-09-30, incoherente con el estado actual del repositorio; sugiere metadatos introducidos de forma errónea o automatizada.
- Riesgo de licencia en cascada: aunque este repositorio declare CC-BY-4.0, si los pesos derivan de un modelo base con licencia más restrictiva (por ejemplo, no comercial), esa restricción podría seguir aplicándose. Es imprescindible trazar el origen de los pesos antes de cualquier uso comercial.
- Atribución obligatoria: CC-BY-4.0 exige citar autoría y licencia en cualquier redistribución o uso derivado.
- Riesgo de alucinación propio de ASR: en audio con ruido, música o silencios, los decodificadores de tipo transductor pueden emitir texto plausible que no corresponde a lo dicho. La decodificación greedy sin mecanismos de confianza agrava el problema.
- Sesgos no evaluados: no hay datos sobre WER diferencial por acento, edad, género o variedad dialectal. Es un riesgo documentado en la mayoría de modelos ASR entrenados con corpus mayoritariamente anglosajones.
- Cobertura de idiomas desconocida: si el modelo base se entrenó solo en inglés, el rendimiento en castellano sería deficiente o nulo, y no hay ninguna declaración al respecto.
- Sin diarización, sin traducción y sin capacidades de agente o tool calling, salvo que se demuestre lo contrario inspeccionando los pesos y la configuración.
- Conversión de precisión no auditada: el paso a bf16 puede alterar ligeramente la salida respecto al modelo original; sin evaluación comparativa no puede descartarse una degradación del WER.
- Entorno de ejecución limitado: al no ser compatible con llama.cpp, Ollama o vLLM, el despliegue queda sujeto a NeMo, Riva, ONNX Runtime o implementaciones propias.
- Aviso para producción: no debe desplegarse en un sistema real sin verificar primero la integridad de los pesos, reproducir una evaluación de WER sobre un conjunto propio y confirmar la procedencia y licencia del modelo original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/superproof/parakeet-tdt-1.1b-bf16
- Modelo base probable, no confirmado: https://huggingface.co/nvidia/parakeet-tdt-1.1b
- Toolkit NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Open ASR Leaderboard: https://huggingface.co/spaces/huggingface/open_asr_leaderboard

No se han proporcionado otros enlaces (papers, blogs, demos o repositorios de código) en la información disponible.
