# souba67/whisper-tiny-sundanese-slr36

## Resumen

El modelo `souba67/whisper-tiny-sundanese-slr36` es un ajuste fino de `openai/whisper-tiny` especializado en reconocimiento automático del habla (ASR) para el idioma sundanés, hablado en la región occidental de la isla de Java (Indonesia). Desarrollado por el usuario souba67, el modelo se entrena sobre dos corpus públicos de OpenSLR: SLR44 (grabaciones de estudio, 4.213 frases) y una muestra de 20.000 frases de SLR36 (habla telefónica crowdsourced, archivos 0-3). El objetivo es mejorar la robustez del modelo base en condiciones reales de micrófono, donde el habla espontánea y el ruido de canal degradan significativamente el rendimiento.

Con 37,76 millones de parámetros, es un modelo muy ligero que puede ejecutarse en CPU o GPUs de gama baja. La licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia actual radica en que el sundanés es una lengua con pocos recursos y este modelo demuestra que un ajuste fino con datos reales de canal (teléfono) supera a la aumentación sintética, ofreciendo una solución práctica para transcripción en entornos de baja fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana estandar de Whisper) |
| Tipos de cuantizacion | no disponible (entrenado en FP16, pesos en safetensors) |
| Idiomas soportados | su (sundanes) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Whisper tiny: un transformer encoder-decoder con atención de escala completa, diseñado para procesar espectrogramas de Mel de 80 canales y generar transcripciones de forma autorregresiva. La ventana de contexto es de 30 segundos de audio, que se procesa como una única secuencia. El ajuste fino se realizó sobre los pesos preentrenados de `openai/whisper-tiny` con una mezcla de dos corpus: SLR44 (grabaciones de estudio limpias) y una muestra de 20.000 frases de SLR36 (grabaciones telefónicas con ruido real). El entrenamiento duró 2.500 pasos con una tasa de aprendizaje de 1e-4, precisión FP16 y una única GPU T4 de Kaggle. No se aplicaron técnicas de RLHF ni DPO; es un fine-tuning supervisado estándar.

La innovación principal del trabajo es la inclusión de habla telefónica real en el entrenamiento. Según la ablación reportada, la aumentación sintética (ruido, reverberación, TTS) no mejoró la precisión en micrófono, mientras que la adición de 20.000 frases reales de SLR36 redujo el WER en el test limpio de SLR44 de 10,6% a 8,43% y en un conjunto privado de micrófono de portátil de 69,68% a 62,34%. Esto sugiere que la diversidad de canal y hablante es más efectiva que la simulación de degradaciones.

## Capacidades

- Transcripción de voz en sundanés a texto, tanto para habla leída (estudio) como para habla espontánea (teléfono, micrófono de portátil).
- Reconocimiento de voz con robustez moderada a ruido de canal y variaciones de acento, gracias al entrenamiento con datos telefónicos reales.
- Procesamiento de audio en ventanas de 30 segundos, con capacidad de transcribir segmentos más largos mediante concatenación de ventanas (típico de Whisper).
- No soporta tool calling, agentes, visión ni otras modalidades; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de entrevistas y reuniones en sundanés: el modelo puede procesar grabaciones de micrófono de portátil o teléfono, donde el habla espontánea y el ruido ambiental son comunes. Su bajo coste computacional permite ejecutarlo en tiempo real en dispositivos modestos.
- Subtitulado automático de vídeos en sundanés: integrable en pipelines de generación de subtítulos para contenido local, con una ventana de 30 segundos que facilita el alineamiento temporal.
- Asistentes de voz para aplicaciones móviles: al ser un modelo tiny, puede desplegarse en el dispositivo (edge) para comandos de voz en sundanés, sin depender de la nube.
- Archivado y búsqueda de audio histórico: transcripción de archivos de radio, podcasts o grabaciones telefónicas para indexación y búsqueda textual.
- Investigación lingüística: herramienta para transcribir corpus orales en sundanés, facilitando estudios fonéticos o de variación dialectal.
- Evaluación de calidad de llamadas en centros de atención al cliente: transcripción de llamadas en sundanés para análisis de sentimiento o control de calidad, con la ventaja de que el modelo ha sido entrenado con habla telefónica real.

## Benchmarks y rendimiento

La model card reporta resultados de una ablación sobre tres mezclas de entrenamiento, evaluadas en el mismo test limpio de SLR44 (split fijo, seed 42) y en un conjunto privado de 60 clips de micrófono de portátil (531 palabras de referencia, normalización con `.strip().lower()`, distancia de Levenshtein a nivel de palabra). Los valores son WER (Word Error Rate) en porcentaje:

| Mezcla de entrenamiento | SLR44 clean test | Micrófono portátil |
|---|---|---|
| Solo SLR44 (modelo `whisper-tiny-sundanese`) | 10,6% | 69,68% |
| + 1.500 clips TTS sintéticos | 10,52% | 70,06% |
| + ruido/reverberación/canal simulado | 12,61% | 72,69% |
| + 20.000 frases reales SLR36 (este modelo) | 8,43% | 62,34% |

No se han publicado comparaciones con otros modelos ASR para sundanés en la información disponible. Los resultados muestran una mejora significativa en habla limpia y una reducción de 7,34 puntos en el escenario de micrófono real, aunque el error sigue siendo alto (62,34%) en condiciones espontáneas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 150 MB en FP16 (37,76 M de parámetros), por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 2060, GTX 1660, o incluso integradas de Intel/AMD con soporte FP16. Una T4 (16 GB) es más que suficiente.
- Ejecución en CPU: viable para inferencia en tiempo real en CPUs modernas (por ejemplo, un i5 de 8ª generación o superior) gracias al tamaño reducido.
- Opciones de despliegue: compatible con el pipeline de Hugging Face Transformers, así como con librerías de inferencia como `whisper.cpp` (conversión a GGUF), `faster-whisper` (CTranslate2) y `vLLM` (aunque este último está orientado a LLM, no a ASR). También puede usarse con `Ollama` si se convierte a formato GGUF, aunque no es el flujo habitual.
- Latencia estimada: en una GPU T4, la transcripción de una ventana de 30 segundos típicamente toma menos de 1 segundo; en CPU puede tomar entre 2 y 5 segundos dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (SLR44 clean) | WER (mic portátil) | Licencia |
|---|---|---|---|---|---|
| `openai/whisper-tiny` (base) | 39 M | 30 s | no disponible | no disponible | MIT |
| `souba67/whisper-tiny-sundanese` (solo SLR44) | 37,76 M | 30 s | 10,6% | 69,68% | Apache 2.0 |
| `souba67/whisper-tiny-sundanese-slr36` (este modelo) | 37,76 M | 30 s | 8,43% | 62,34% | Apache 2.0 |

No se dispone de otros modelos ASR específicos para sundanés en la información proporcionada. La comparación con el modelo base de Whisper no es directa porque el base no está entrenado para sundanés y probablemente produzca salidas en otros idiomas o errores graves.

## Limitaciones y advertencias

- El modelo degrada notablemente en habla espontánea de micrófono (62,34% WER) frente a habla leída de estudio (8,43% WER). No es adecuado para transcripción de conversaciones informales sin un post-procesamiento adicional.
- El conjunto de micrófono privado usado en la evaluación proviene de un único hablante y un único dispositivo, por lo que la generalización a otros hablantes o micrófonos no está garantizada.
- Solo se han utilizado 20.000 de las aproximadamente 185.000 frases disponibles en SLR36 (archivos 0-3 de 15). El modelo podría mejorar con más datos.
- La aumentación sintética de ruido/reverberación empeoró el rendimiento en micrófono real, lo que indica que el modelo es sensible a la distribución de los datos de entrenamiento.
- No se ha evaluado el modelo en otros dialectos del sundanés ni en entornos con ruido de fondo intenso (tráfico, música, etc.).
- Aunque la licencia Apache 2.0 permite uso comercial, el corpus de entrenamiento (SLR44 y SLR36) está bajo CC BY-SA 4.0, lo que puede implicar obligaciones de atribución y compartir bajo la misma licencia si se redistribuyen los datos o derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/souba67/whisper-tiny-sundanese-slr36
- Modelo hermano (solo SLR44): https://huggingface.co/souba67/whisper-tiny-sundanese
- Corpus SLR44 (OpenSLR): https://openslr.org/44/
- Corpus SLR36 (OpenSLR): https://openslr.org/36/
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
