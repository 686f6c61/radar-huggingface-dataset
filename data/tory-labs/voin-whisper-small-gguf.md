# tory-labs/voin-whisper-small-gguf

## Resumen

`tory-labs/voin-whisper-small-gguf` es un repositorio espejo que redistribuye un único fichero GGUF del modelo `openai/whisper-small` de OpenAI. No se trata de un modelo nuevo ni de un ajuste fino: la model card indica explícitamente que el fichero es una copia sin modificar, convertida a GGUF por `handy-computer` y publicada para que la aplicación voin lo descargue. El modelo subyacente es un sistema de reconocimiento automático del habla (ASR) y traducción de audio a inglés, con 241.751.392 parámetros.

Su relevancia es práctica: permite ejecutar Whisper small en formato GGUF (Q8_0) en entornos donde el peso original en safetensors o PyTorch no es cómodo, típicamente mediante `whisper.cpp` o aplicaciones de escritorio que integran este runtime. El repositorio ocupa 0,3 GB y contiene un solo fichero de 269.751.136 bytes con SHA-256 publicado, lo que facilita la verificación de integridad.

Al ser un espejo, sus capacidades y limitaciones son las del modelo base de OpenAI. La licencia declarada es Apache-2.0 y no se han publicado evaluaciones propias, benchmarks ni datos de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper); detalles de capas y dimensiones no disponibles en la model card |
| Parámetros totales | 241.751.392 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica contexto de texto; el modelo base procesa ventanas de audio de 30 s |
| Tipos de cuantización | Q8_0 (único fichero incluido: `whisper-small-Q8_0.gguf`) |
| Idiomas soportados | Multilingüe según el modelo base; la model card no detalla la lista de idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Tarea | Reconocimiento automático del habla y traducción de audio a inglés (según modelo base) |
| Tamaño del fichero | 269.751.136 bytes |
| SHA-256 | `9b9c8811bbcc82a7766f0fb0925614bdacb0923b2cc630daeac17108b655b860` |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo base `openai/whisper-small` emplea una arquitectura transformer de tipo encoder-decoder orientada a audio: el encoder recibe representaciones log-Mel del audio y el decoder genera tokens de texto. La model card de este espejo no especifica el número de capas, la dimensión del modelo, el número de cabezas de atención ni otros hiperparámetros, por lo que esos datos deben consultarse en la ficha del modelo original.

Respecto al entrenamiento, el repositorio no aporta información sobre volumen de datos, composición del corpus, horas de audio, idiomas de entrenamiento ni si hubo etapas de ajuste con RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional: el repositorio se limita a declarar que el fichero GGUF es una copia sin modificar procedente de una conversión externa, con licencia heredada del modelo original.

## Capacidades

- Transcripción de audio a texto en varios idiomas, heredada de Whisper small.
- Traducción de audio en otros idiomas al inglés, capacidad nativa de la familia Whisper.
- Identificación del idioma del audio y generación de marcas temporales a nivel de segmento (según el comportamiento habitual del modelo base).
- Funcionamiento con audio de hasta 30 segundos por ventana; para grabaciones más largas es necesario segmentar.
- Robustez razonable frente a ruido de fondo y acentos en comparación con modelos ASR clásicos, aunque sin métricas publicadas en este repositorio.
- Ejecución local mediante runtimes compatibles con GGUF, sin dependencia de API externa.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión ni generación de texto libre.
- No es un modelo de chat ni un LLM: su entrada es audio y su salida es texto transcrito o traducido.

## Casos de uso

- Subtitulado automático de vídeos: se procesa la pista de audio en ventanas de 30 s y se generan subtítulos con marcas temporales; el tamaño de 241 M de parámetros permite ejecutarlo en un portátil sin GPU dedicada.
- Transcripción de reuniones y clases: integrado en una aplicación de escritorio que capture el audio del sistema, el modelo convierte la conversación en actas de texto revisables, con la ventaja de que el GGUF Q8_0 ocupa menos de 300 MB.
- Notas de voz en aplicaciones móviles o de escritorio: la app voin descarga este fichero como modelo local, de modo que la transcripción se realiza en el dispositivo y el audio no se envía a un servidor.
- Traducción de contenido audiovisual al inglés: útil para generar versiones en inglés de entrevistas o pódcasts en otros idiomas antes de una revisión humana.
- Análisis de llamadas en atención al cliente: transcripción por lotes de grabaciones para clasificación posterior, búsqueda de palabras clave y control de calidad; requiere un paso previo de segmentación y, si se necesita separar interlocutores, un sistema de diarización externo.
- Accesibilidad: generación de subtítulos en directo o diferidos para personas con discapacidad auditiva en entornos formativos o institucionales, con la salvedad de que la latencia no está documentada y debe medirse en el hardware objetivo.
- Documentación clínica o jurídica dictada: conversión de dictados a texto para revisión humana, siempre con verificación posterior dada la posibilidad de errores en nombres propios y términos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de error de palabra (WER), comparativas con otros modelos ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1-2 GB en Q8_0, incluyendo el fichero de 269,75 MB y el overhead del runtime; cifra estimada, no publicada por el autor.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de memoria, como GTX 1650, RTX 3060 o RTX 4090; no requiere A100 ni H100.
- CPU: viable en exclusiva por CPU con `whisper.cpp`, al ser un modelo de 241 M de parámetros en cuantización de 8 bits.
- Despliegue: `whisper.cpp` es el runtime natural para este GGUF; también puede utilizarse dentro de la aplicación voin. Otros entornos (transformers, faster-whisper, vLLM) no consumen GGUF de Whisper directamente y requerirían el formato original o una conversión.
- Latencia y throughput: no disponibles. Dependen del hardware, del número de hilos, de la longitud del audio y del tamaño de los segmentos; conviene medirlos en el entorno de destino.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Formatos disponibles | Licencia | Notas |
|---|---|---|---|---|---|
| `tory-labs/voin-whisper-small-gguf` | 241.751.392 | Audio (ventanas de 30 s) | GGUF Q8_0 | Apache-2.0 | Espejo sin modificar; un solo fichero; 0 descargas |
| `openai/whisper-small` | 241.751.392 (aprox.) | Audio (ventanas de 30 s) | Safetensors, PyTorch, TensorFlow, Flax | Apache-2.0 | Modelo original de OpenAI; referencia para comparar calidad |
| `openai/whisper-base` | ~74 M (aprox.) | Audio (ventanas de 30 s) | Safetensors, PyTorch, TensorFlow, Flax | Apache-2.0 | Menor tamaño y menor coste, precisión inferior |
| `openai/whisper-medium` | ~769 M (aprox.) | Audio (ventanas de 30 s) | Safetensors, PyTorch, TensorFlow, Flax | Apache-2.0 | Mayor precisión, requiere más memoria y cómputo |

Las cifras de parámetros de los modelos comparativos son aproximadas y deben verificarse en sus respectivas fichas. No se dispone de datos de benchmarks que permitan comparar la calidad relativa de estas variantes en esta ficha.

## Limitaciones y advertencias

- Riesgo de alucinación: Whisper puede generar texto inventado ante silencios, ruido, música o audio de baja calidad; es necesario filtrar segmentos vacíos y revisar la salida.
- Precisión variable: el WER depende del idioma, el acento, el dominio y la calidad del audio; no hay métricas publicadas en este repositorio para acotar el error esperado.
- Ventana de 30 segundos: los audios largos deben dividirse, lo que puede producir pérdidas de contexto en las fronteras entre segmentos.
- Sin diarización: el modelo no distingue interlocutores; para transcripciones de reuniones o llamadas hace falta un componente adicional.
- Marcas temporales aproximadas: los timestamps pueden desviarse y no están garantizados a nivel de palabra.
- Sesgos: al heredar el corpus de entrenamiento de Whisper small, puede presentar diferencias de rendimiento entre variedades dialectales y acentos; no se documentan sesgos específicos en la model card.
- Repositorio espejo: no hay garantía de mantenimiento, actualización ni soporte; registra 0 descargas y 0 likes, por lo que carece de validación comunitaria. Verificar el SHA-256 antes de usar el fichero.
- Una sola cuantización: solo se ofrece Q8_0; no hay versiones F16, Q4 o Q5 en este repositorio.
- Licencia: Apache-2.0 permite uso comercial, pero deben conservarse los avisos de atribución y la licencia original; el espejo no concede derechos adicionales sobre el modelo.
- Idioma de la documentación: la model card está en inglés y coreano, sin traducción al castellano ni guía de integración detallada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tory-labs/voin-whisper-small-gguf
- Modelo original: https://huggingface.co/openai/whisper-small
- Conversión GGUF de referencia: https://huggingface.co/handy-computer/whisper-small-gguf/tree/a2073177cb69bd74b9ca9460b852d17fbfd5d68c
- Aplicación voin: https://github.com/su-record/voin
