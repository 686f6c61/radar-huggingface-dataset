# Z9RTM/FASTDIAR-GGUF

## Resumen

FASTDIAR GGUF es una conversión de formato del checkpoint `large` del modelo FASTDIAR de Microsoft, empaquetada en un único archivo GGUF para una bifurcación (*fork*) de speech.cpp mantenida por Z9RTM. No se trata de un modelo de lenguaje, sino de un sistema de diarización de hablantes (identificación de "quién habla y cuándo") que combina un extractor de embeddings de voz, un mecanismo de clustering con memoria completa y un detector de actividad vocal (Silero VAD) integrado en el mismo archivo. El modelo base es `microsoft/fastdiar`, release v0.1.0, commit `f48bff53b9a6a0cce4539e94b6def95f609eaea4`.

El interés práctico reside en su tamaño reducido: 12.401.059 parámetros en F32 (unos 10,4 millones según la nomenclatura del archivo), lo que permite ejecutar diarización en tiempo real en hardware de consumo, incluidas CPU y GPUs integradas. La conversión preserva los pesos sin cambios más allá de la reorganización de layout, expande los pesos agrupados de *downsampling* con ceros exactos y añade los pesos de Silero VAD de 16 kHz, de modo que un solo archivo contiene todo lo necesario para la inferencia.

Es relevante ahora porque la diarización se ha convertido en un componente habitual en pipelines de transcripción (ASR) con múltiples interlocutores, y disponer de una versión GGUF ejecutable con speech.cpp simplifica el despliegue local sin depender de frameworks pesados. La licencia MIT del modelo base y de la conversión facilita su integración comercial, con la salvedad de las licencias de los componentes de terceros incluidos (ReDimNet2 de Palabra.ai y Silero VAD), documentadas en el archivo NOTICE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle (modelo de diarización de hablantes; incluye extractor de embeddings, clustering con historial completo y Silero VAD 16 kHz) |
| Parametros totales | 12.401.059 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (procesa audio en streaming; la memoria crece con la duración de la grabación) |
| Tipos de cuantizacion | F32 (único formato en este repositorio; no se ofrecen variantes cuantizadas) |
| Idiomas soportados | No disponibles (el paper evalúa 2 a 21 hablantes por grabación; el japonés no fue evaluado) |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo `FASTDIAR-large-10.4M-F32.gguf`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su función: diarización de hablantes con un componente de clustering que mantiene el historial completo de la grabación y un VAD (Silero VAD, 16 kHz) que actúa como etapa de detección de actividad vocal. El checkpoint convertido corresponde a la variante `large` de FASTDIAR, con pesos en F32. La conversión, realizada mediante `reference/fastdiar/convert.py` en la bifurcación de speech.cpp, expande los pesos agrupados de *downsampling* con ceros exactos, omite los contadores de entrenamiento de BatchNorm y añade los pesos de Silero VAD. El SHA-256 del checkpoint original es `f6d71444eb513654a4b8c6563d11196d19283759884d4986488af3a57361228d`.

No se dispone de información sobre el número de tokens o horas de audio de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste fino como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la integración del VAD en el mismo archivo y del enfoque de clustering con historial completo, que implica un consumo de memoria creciente con la duración del audio.

## Capacidades

- Diarización de hablantes (*speaker diarization*): asigna una etiqueta de hablante a cada frame de audio, permitiendo segmentar una conversación por interlocutor.
- Detección de actividad vocal (VAD) integrada mediante Silero VAD a 16 kHz.
- Salida en formato RTTM mediante el comando `speech diarize ... --format rttm`.
- Integración con ASR en el mismo pipeline: `speech asr ... --vad silero-vad --diarize ... --live --format json`, lo que permite transcripción con etiquetas de hablante en tiempo real.
- Procesamiento en streaming (*live*) según la interfaz de speech.cpp.
- Soporte de múltiples hablantes sin límite explícito; el paper evalúa entre 2 y 21 hablantes por grabación.
- Ejecución acelerada por Metal en Apple Silicon (verificado en M1 Pro); soporte de Vulkan en Windows no verificado.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes, al no ser un modelo de lenguaje.

## Casos de uso

- Transcripción de reuniones con múltiples participantes: el modelo etiqueta cada segmento con su hablante y se combina con un ASR en el mismo pipeline de speech.cpp, generando actas con atribución de intervenciones.
- Subtitulado y análisis de entrevistas: la salida RTTM permite alinear quién dijo qué en entrevistas periodísticas o de investigación, con la ventaja de ejecutarse localmente gracias al tamaño de 12,4 millones de parámetros.
- Atención al cliente y centros de contacto: la diarización permite separar la voz del agente y del cliente en grabaciones de llamadas, habilitando métricas de tiempo de habla y análisis de turnos.
- Investigación cualitativa y ciencias sociales: procesamiento por lotes de corpus de audio (grupos de discusión, entrevistas grupales) con 2 a 21 hablantes, generando anotaciones RTTM reutilizables en herramientas de análisis.
- Sistemas de actas y resúmenes automáticos: la salida diarizada alimenta pipelines posteriores de resumen o análisis de sentimiento por hablante, sin necesidad de servicios en la nube.
- Procesamiento en dispositivos de borde (*edge*): al caber en hardware de consumo y ejecutarse con Metal en Apple Silicon, es viable en portátiles y estaciones de trabajo sin GPU dedicada para diarización en tiempo real.
- Moderación y análisis de contenido audiovisual: detección de solapamientos y turnos de palabra en podcasts o retransmisiones, con la salvedad de que el habla solapada se contabiliza como error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una comprobación cualitativa: en Apple M1 Pro con Metal, las etiquetas coincidieron con la implementación oficial en streaming en todos los frames sobre los conjuntos `clfcg` y `cwbvu` de VoxConverse. No se proporcionan métricas DER (Diarization Error Rate), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 12.401.059 parámetros en F32, los pesos ocupan aproximadamente 50 MB, a lo que se suma la memoria del estado de clustering, que crece con la duración de la grabación.
- GPU recomendadas: no se especifican; la verificación oficial se realizó en Apple M1 Pro con Metal. El soporte de Vulkan en Windows está sin verificar.
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el tamaño del modelo, aunque no se documentan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: exclusivamente mediante la bifurcación `Z9RTM/speech.cpp` versión 0.10.2 o posterior, con los comandos `speech diarize` y `speech asr`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card menciona el modo `--live`, lo que sugiere capacidad de streaming, pero sin cifras publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros sistemas de diarización (por ejemplo, pyannote.audio o NeMo Diarization), por lo que no es posible establecer una comparativa rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Un hablante por frame: el habla solapada se contabiliza como error, lo que penaliza en conversaciones con interrupciones frecuentes.
- El número de hablantes no está limitado, pero la evaluación del paper cubre de 2 a 21 hablantes por grabación; fuera de ese rango el comportamiento no está caracterizado.
- El japonés no fue incluido en la evaluación del paper y no se ha medido en esta conversión; no hay lista de idiomas soportados publicada.
- La memoria crece con la duración de la grabación, ya que el clustering conserva todo el historial; grabaciones muy largas pueden agotar recursos.
- Solo se distribuyen pesos F32; no hay variantes cuantizadas que reduzcan el uso de memoria o aceleren la inferencia.
- Requiere la bifurcación de speech.cpp 0.10.2 o posterior; no es compatible con speech.cpp oficial ni con otros runtimes.
- El soporte en Windows/Vulkan está sin verificar; la única validación reportada es en Apple M1 Pro con Metal.
- Licencia MIT para el modelo y la conversión, pero los componentes de terceros (ReDimNet2 de Palabra.ai y Silero VAD) tienen sus propias condiciones recogidas en el archivo NOTICE; conviene revisarlas antes de un uso comercial.
- Riesgo de alucinación no aplica en el sentido habitual de modelos generativos, pero sí existe riesgo de asignación errónea de hablantes en audio ruidoso o con solapamientos, sin métricas publicadas que lo cuantifiquen.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que reduce la evidencia de uso en producción.

## Enlaces

- [Hugging Face: Z9RTM/FASTDIAR-GGUF](https://huggingface.co/Z9RTM/FASTDIAR-GGUF)
- [Modelo base: microsoft/fastdiar](https://huggingface.co/microsoft/fastdiar)
- [Repositorio del modelo base en GitHub](https://github.com/microsoft/fastdiar)
- [Bifurcación de speech.cpp: Z9RTM/speech.cpp](https://github.com/Z9RTM/speech.cpp)
