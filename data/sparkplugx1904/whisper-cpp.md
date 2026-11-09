# Sparkplugx1904/whisper.cpp

## Resumen

`Sparkplugx1904/whisper.cpp` es un repositorio de espejo (mirror) que redistribuye los pesos de los modelos Whisper de OpenAI convertidos al formato GGML/GGUF para su uso con la implementación en C/C++ `whisper.cpp` de Georgi Gerganov. No se trata de un modelo entrenado por el autor del repositorio, sino de una réplica de los artefactos publicados originalmente en `ggerganov/whisper.cpp`, orientada a la inferencia de reconocimiento automático de voz (ASR) en hardware modesto, incluidos dispositivos de borde y CPUs sin GPU.

El paquete cubre toda la familia Whisper: desde `tiny` (75 MiB en precisión original) hasta `large-v3` (2,9 GiB) y la variante destilada `large-v3-turbo` (1,5 GiB), además de versiones cuantizadas q5_0, q5_1 y q8_0 que reducen el peso hasta en un 80 %. Whisper es un transformer encoder-decoder entrenado por OpenAI para transcripción y traducción de voz multilingüe, con una ventana de audio de 30 segundos procesada en fragmentos.

La relevancia de este repositorio es práctica: permite descargar los binarios GGML listos para `whisper.cpp` sin depender del repositorio original, con hashes SHA documentados para verificación. Sin embargo, al ser un espejo con cero descargas y sin model card propia más allá del README copiado, conviene tratar la fuente original como referencia canónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI) |
| Parametros totales | No disponible en la informacion proporcionada (la familia Whisper va de ~39 M en tiny a ~1.550 M en large) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por segmento (no es contexto de texto) |
| Tipos de cuantizacion | F16 (original), q8_0, q5_1 (tiny/base/small), q5_0 (medium/large) |
| Idiomas soportados | Multilingue en variantes sin sufijo `.en`; solo ingles en variantes `.en`; lista concreta no disponible |
| Licencia | MIT |
| Formato de pesos | GGML (compatible con whisper.cpp) |

## Arquitectura y entrenamiento

Whisper es un transformer encoder-decoder con atención multi-cabeza estándar. El encoder procesa espectrogramas mel de 30 segundos y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para detección de idioma, marcas de tiempo y traducción. Los pesos aquí distribuidos son conversiones de los checkpoints originales de OpenAI al formato GGML, sin reentrenamiento ni ajuste fino por parte del autor del repositorio.

No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento original (OpenAI documenta 680.000 horas de audio web en Whisper), ni sobre procesos de RLHF o DPO. La innovación técnica relevante en este repositorio es la propia conversión a GGML y las cuantizaciones q5_0/q5_1/q8_0, que permiten ejecutar el modelo en CPU con consumo de memoria reducido. La variante `large-v3-turbo` corresponde a una destilación del decoder de `large-v3` que reduce el número de capas del decoder y acelera la inferencia.

## Capacidades

- Reconocimiento automático de voz (ASR) en audio de hasta 30 segundos por segmento, con marcas de tiempo a nivel de palabra y de segmento.
- Traducción de voz a texto en inglés desde otros idiomas (tarea `translate` de Whisper).
- Detección automática de idioma en las variantes multilingües.
- Transcripción en streaming mediante el bucle de `whisper.cpp` con solapamiento de ventanas.
- Ejecución en CPU sin GPU, incluidos dispositivos ARM, Raspberry Pi y móviles.
- Variantes `.en` optimizadas para inglés con menor tasa de error en ese idioma.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y videollamadas en local: con `large-v3-turbo` cuantizado a q5_0 (547 MiB) se puede transcribir audio en una CPU moderna sin enviar datos a la nube, útil por privacidad.
- Subtitulado automático de vídeo: las marcas de tiempo por segmento y por palabra permiten generar ficheros SRT directamente desde `whisper.cpp`.
- Asistentes de voz embebidos: `tiny` o `base` en q5_1 (31-57 MiB) caben en microcontroladores con suficiente RAM y permiten wake-word más transcripción en dispositivos de borde.
- Actas y notas de voz en aplicaciones móviles: `small` q5_1 (181 MiB) ofrece un equilibrio razonable entre precisión y huella de memoria para ejecución en smartphone.
- Indexado y búsqueda de archivos de audio: transcripción por lotes con `medium` q5_0 (514 MiB) para construir índices de texto sobre grabaciones históricas.
- Traducción de contenido audiovisual extranjero al inglés: la tarea `translate` de Whisper permite generar subtítulos en inglés desde audio en otros idiomas sin pipeline separado.
- Preprocesado para pipelines de NLP: transcripción con `large-v3` para alimentar sistemas de análisis de sentimiento, resumen o extracción de entidades sobre audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio solo lista tamaños en disco y hashes SHA de cada variante; no incluye WER, MMLU, HumanEval ni métricas comparativas.

## Requisitos de hardware

- VRAM/RAM estimada según variante (peso en disco ≈ memoria necesaria, más overhead de runtime):
  - `tiny` q5_1: ~31 MiB; `tiny` F16: ~75 MiB.
  - `base` q5_1: ~57 MiB; `base` F16: ~142 MiB.
  - `small` q5_1: ~181 MiB; `small` F16: ~466 MiB.
  - `medium` q5_0: ~514 MiB; `medium` F16: ~1,5 GiB.
  - `large-v3` q5_0: ~1,1 GiB; `large-v3` F16: ~2,9 GiB.
  - `large-v3-turbo` q5_0: ~547 MiB; `large-v3-turbo` F16: ~1,5 GiB.
- GPU recomendadas: no requiere GPU; funciona en CPU. Puede acelerarse con CUDA, Metal, Vulkan o OpenCL según la compilación de `whisper.cpp`. GPU consumer como RTX 4090 no aportan ventaja significativa frente a CPU en modelos pequeños.
- Cabe en cualquier GPU consumer e incluso en SoC de gama baja con las variantes cuantizadas; `large-v3` F16 requiere ~3 GiB de RAM libre.
- Opciones de despliegue: `whisper.cpp` (CLI, servidor HTTP), bindings de Python (`whisper-cpp-python`), integraciones en Ollama vía adaptadores de terceros, y contenedores Docker de la comunidad.
- Latencia y throughput: no disponibles en la información proporcionada; dependen de la CPU/GPU, del número de hilos y de la variante elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Whisper (este repo, GGML) | ~39 M - 1.550 M según variante | 30 s por segmento | MIT | GGML | Hugging Face (espejo) |
| Whisper original (OpenAI) | ~39 M - 1.550 M | 30 s por segmento | MIT | PyTorch (.pt) | Hugging Face `openai/whisper-*` |
| faster-whisper (CTranslate2) | mismos pesos | 30 s por segmento | MIT | CTranslate2 | Hugging Face `Systran/faster-whisper-*` |
| whisper.cpp original (ggerganov) | mismos pesos | 30 s por segmento | MIT | GGML | Hugging Face `ggerganov/whisper.cpp` |

Las diferencias entre estas opciones son de runtime y empaquetado, no de pesos: los cuatro usan los mismos checkpoints de OpenAI. `faster-whisper` suele ofrecer mayor throughput en GPU; `whisper.cpp` prioriza portabilidad y ejecución en CPU.

## Limitaciones y advertencias

- Repositorio espejo sin model card propia: el README es una copia del de `ggerganov/whisper.cpp`; no hay garantía de mantenimiento ni de actualización por parte del autor.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de verificación independiente de los artefactos más allá de los hashes SHA listados.
- Riesgo de alucinación: Whisper es conocido por generar texto plausible en silencios o ruido, especialmente en variantes pequeñas y en audio con música o ruido de fondo.
- Ventana fija de 30 segundos: audios más largos requieren segmentación manual o el bucle de `whisper.cpp`, con posible pérdida de contexto entre segmentos.
- Sesgos: el modelo original de OpenAI muestra peor rendimiento en acentos no estándar, dialectos y audio de baja calidad; no hay evaluación específica en este repositorio.
- Licencia MIT permite uso comercial, pero conviene verificar la procedencia de los pesos frente al repositorio canónico `ggerganov/whisper.cpp` antes de desplegar en producción.
- El tamaño del repo (31 GB) incluye todas las variantes; descargar solo el fichero GGML necesario para evitar consumo innecesario de disco y ancho de banda.
- No soporta diarización de hablantes, puntuación avanzada ni corrección gramatical; para esas funciones se requiere postprocesado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sparkplugx1904/whisper.cpp
- Repositorio canónico de pesos: https://huggingface.co/ggerganov/whisper.cpp
- Proyecto whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Modelos en whisper.cpp: https://github.com/ggerganov/whisper.cpp/tree/master/models
- Pesos originales de OpenAI: https://huggingface.co/openai/whisper-large-v3
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
