# wannaphong/pyannote-segmentation-3.0

## Resumen

wannaphong/pyannote-segmentation-3.0 es una conversión a ONNX del modelo pyannote/segmentation-3.0, publicada bajo licencia MIT y pensada para ejecutarse con Transformers.js v3 (es decir, en JavaScript, tanto en Node.js como directamente en el navegador). No se trata de un modelo de lenguaje generativo, sino de un modelo de clasificación de tramas de audio cuyo propósito es la segmentación de hablantes: dada una señal de audio, produce para cada trama una distribución de probabilidad sobre clases que representan combinaciones de hablantes activos.

El modelo base, desarrollado por el equipo de pyannote, es un componente central de las pipelines de diarización de hablantes del ecosistema pyannote.audio. La relevancia de esta conversión concreta es de despliegue: elimina la dependencia de PyTorch y de un token de autenticación en tiempo de inferencia, y permite integrar diarización en aplicaciones web o en entornos JavaScript sin backend Python.

El repositorio no incluye model card propia más allá de las instrucciones de uso ni publica número de parámetros, datos de entrenamiento o resultados de benchmarks. Tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación de nicho orientada específicamente a hacer viable el modelo en el stack WebML. La fecha de creación registrada es 2026-09-14.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible. El grafo ONNX exportado declara una entrada de audio (`input_values`: `[batch_size, num_channels, num_samples]`) y una salida de logits por trama (`logits`: `[batch_size, num_frames]`). El modelo base pertenece a la familia de segmentación de pyannote.audio |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de contexto de texto. La exportación usa ventanas de 160.000 muestras (10 s a 16 kHz) y devuelve 767 tramas de salida por ventana en el ejemplo de la model card |
| Tipos de cuantización | No disponible. El repositorio solo publica los pesos ONNX resultantes de una exportación estándar (`torch.onnx.export`, precisión fp32). No se documentan variantes int8, fp16 ni q4 |
| Idiomas soportados | No aplica / no disponible. Es un modelo acústico de segmentación de hablantes; no procesa texto ni depende del idioma hablado |
| Licencia | MIT |
| Formato de pesos | ONNX (los pesos se estructuran en una subcarpeta `onnx/`), generados a partir de los pesos PyTorch del modelo base |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros ni el proceso de entrenamiento de este repositorio. La model card se limita a documentar el uso con Transformers.js v3 y a incluir el script de conversión de PyTorch a ONNX, por lo que no hay datos sobre composición del dataset, número de tokens o muestras de audio procesadas, ni sobre si hubo ajuste con RLHF, DPO o cualquier otra técnica de alineación.

Lo que sí se puede deducir del artefacto publicado es su interfaz funcional. La exportación usa `dynamic_axes` para el tamaño de lote, el número de canales y el número de muestras de entrada, y para el número de tramas de salida. En el ejemplo de la model card, la salida tiene dimensiones `[1, 767, 7]`: siete clases por trama, lo que corresponde al esquema de codificación powerset que emplea pyannote para representar combinaciones de hasta tres hablantes simultáneos (2³ − 1 = 7). El posprocesado se realiza con `processor.post_process_speaker_diarization(logits, audio.length)`, que devuelve segmentos con `start`, `end`, `id` de hablante y `confidence`.

## Capacidades

- Segmentación de hablantes a nivel de trama: clasifica cada trama de audio según qué combinación de hablantes está activa en ese instante.
- Diarización completa mediante posprocesado: la función `post_process_speaker_diarization` convierte los logits en una lista de segmentos temporales con hablante asignado y puntuación de confianza.
- Manejo de solapamiento de voces: el uso de powerset con 7 clases permite representar hasta tres hablantes hablando a la vez, no solo turnos secuenciales.
- Inferencia en JavaScript sin backend Python: compatible con `@huggingface/transformers` (Transformers.js v3) mediante `AutoModelForAudioFrameClassification` y `AutoProcessor`.
- Ejecución en navegador y en Node.js: al ser un artefacto ONNX, puede desplegarse con onnxruntime-web o onnxruntime-node.
- Entrada de audio de duración variable: los ejes dinámicos permiten procesar lotes y longitudes de audio distintas de la ventana de referencia.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, function calling ni capacidades de agente. Tampoco incorpora un modo de razonamiento explícito ni reconocimiento de voz: solo etiqueta tramas de audio.

## Casos de uso

- Diarización íntegra en el navegador: una aplicación web puede cargar el modelo ONNX con Transformers.js y etiquetar hablantes sobre un archivo de audio que nunca sale del dispositivo del usuario, lo que simplifica el cumplimiento del RGPD en escenarios con datos personales.
- Enriquecimiento de transcripciones ASR: ejecutando primero un modelo de reconocimiento de voz y después este segmentador, se puede asignar cada fragmento transcrito a un hablante concreto (`id`) usando las marcas temporales `start` y `end`, obteniendo actas de reunión legibles.
- Edición de pódcast y entrevistas: el resultado con tiempos y confidencias permite generar automáticamente cortes por turno de palabra, útiles para montaje, para generar capítulos por intervención o para exportar pistas separadas.
- Subtitulado con etiqueta de hablante: en herramientas de accesibilidad, los segmentos devueltos permiten prefijar cada línea de subtítulo con el identificador de hablante y aplicar estilos distintos por voz.
- Análisis de llamadas y centros de contacto: medir tiempos de habla por participante, detectar solapamientos e identificar turnos en grabaciones de atención al cliente, siempre que exista base legal para tratar el audio.
- Preprocesado de corpus de audio para investigación: el modelo puede actuar como etapa de filtrado o etiquetado en pipelines de curación de datasets, marcando regiones con hablante único o con solapamiento antes de otros procesados.
- Demos educativas de WebML: sirve como ejemplo canónico de cómo portar un modelo de audio de pyannote a Transformers.js y ejecutarlo con WebGPU o WASM en una página estática.
- Segmentación previa a reconocimiento de voz: dividir el audio en tramos homogéneos por hablante antes de pasarlos a un motor ASR evita mezclar voces en una misma hipótesis de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de tasa de error de diarización (DER), tasas de falsa alarma o de hablante confundido, ni comparaciones con otros sistemas. Tampoco se documentan latencias o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no publicarse el número de parámetros ni el tamaño de los pesos, no es posible dar una cifra fiable.
- GPU recomendadas: no disponibles. No hay datos de rendimiento por modelo de GPU en la información proporcionada.
- Viabilidad en GPU de consumo: no se puede confirmar ni descartar sin datos de tamaño del modelo. El modelo base de segmentación de pyannote está diseñado para funcionar en CPU, y la ventana de inferencia es de 10 s de audio, por lo que un uso en CPU es plausible, pero no hay confirmación en el repositorio.
- Despliegue en JavaScript: Transformers.js v3 con `AutoModelForAudioFrameClassification` y `AutoProcessor`, sobre onnxruntime-web (WASM o WebGPU) en navegador u onnxruntime-node en servidor.
- Despliegue en Python: la alternativa es usar directamente el modelo base `pyannote/segmentation-3.0` con pyannote.audio, que requiere un token de Hugging Face para descargar los pesos.
- Conversión adicional: la model card recomienda el uso de Optimum para generar y estructurar artefactos ONNX propios.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Acceso | Ejecución en navegador | Notas |
|---|---|---|---|---|---|
| wannaphong/pyannote-segmentation-3.0 | ONNX | MIT | Abierto, sin token | Sí (Transformers.js v3) | Conversión publicada por un tercero; 0 descargas y 0 likes; sin model card con métricas |
| onnx-community/pyannote-segmentation-3.0 | ONNX | MIT | Abierto, sin token | Sí | Es el identificador que aparece en el ejemplo de código de la propia model card de wannaphong; ambos apuntan al mismo modelo base |
| pyannote/segmentation-3.0 | PyTorch (safetensors) | MIT | Restringido: requiere token de Hugging Face (`use_auth_token`) | No | Modelo original del que derivan las conversiones ONNX; misma funcionalidad de segmentación por tramas |
| pyannote/speaker-diarization-3.1 | Pipeline PyTorch | No disponible en la información proporcionada | Requiere token | No | Pipeline completo de diarización que integra un modelo de segmentación y uno de embeddings; no es una conversión ONNX |

Las cifras de parámetros, contexto y rendimiento de las alternativas no están disponibles en la información proporcionada, por lo que la comparación se limita a formato, licencia, condiciones de acceso y posibilidad de ejecución en navegador.

## Limitaciones y advertencias

- Ausencia de documentación técnica: el repositorio no publica arquitectura, número de parámetros, datos de entrenamiento ni métricas, lo que dificulta evaluar su idoneidad para producción.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Discrepancia de identificadores: el ejemplo de código de la model card carga `onnx-community/pyannote-segmentation-3.0`, no el repositorio `wannaphong/pyannote-segmentation-3.0`. Conviene verificar cuál de los dos artefactos se está usando realmente.
- Riesgo de degradación por conversión: la exportación a ONNX puede introducir pequeñas diferencias numéricas respecto al modelo PyTorch original, y no se documenta ningún test de equivalencia.
- Sin posprocesado de clustering: este modelo solo produce etiquetas de hablante locales por ventana. Para una diarización global coherente (mismo hablante con el mismo identificador a lo largo de todo el audio) se necesita una etapa adicional de agrupación de embeddings, que no forma parte de este repositorio.
- Sesgos: no disponibles. No hay información sobre la distribución demográfica de los datos de entrenamiento del modelo base.
- Alucinación y errores: en este dominio el riesgo se traduce en asignaciones incorrectas de hablante, fronteras de segmento imprecisas y confidencias bajas en zonas de solapamiento. En el ejemplo de la model card se observan segmentos con confianza de 0,29 y 0,37, lo que indica que el propio autor del modelo base espera predicciones poco fiables en determinados tramos.
- Limitaciones de idioma y acento: no aplica un idioma concreto, pero el rendimiento puede variar según acento, ruido de fondo, calidad de micrófono y número de hablantes.
- Licencia: MIT, lo que permite uso comercial y modificación. Aun así, conviene revisar la licencia del modelo base (`pyannote/segmentation-3.0`), también MIT según la etiqueta declarada, y tener en cuenta que el acceso a los pesos originales está condicionado a aceptar las condiciones del repositorio de pyannote.
- Fecha de creación registrada anómala: el repositorio figura como creado el 2026-09-14, dato que conviene contrastar antes de citarlo.
- Naturaleza del modelo: no es un modelo generativo. No debe presentarse como un LLM ni usarse para tareas de texto, razonamiento, código o agentes.

## Enlaces

- Repositorio objeto de esta ficha: https://huggingface.co/wannaphong/pyannote-segmentation-3.0
- Modelo base: https://huggingface.co/pyannote/segmentation-3.0
- Repositorio ONNX alternativo citado en la model card: https://huggingface.co/onnx-community/pyannote-segmentation-3.0
- Código fuente de pyannote.audio (rama develop, usada en el script de conversión): https://github.com/pyannote/pyannote-audio/archive/refs/heads/develop.zip
- Documentación de Optimum, recomendada en la model card para generar artefactos ONNX: https://huggingface.co/docs/optimum/index
- Audio de ejemplo usado en el snippet de la model card: https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/mlk.wav
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo en los resultados de búsqueda disponibles.
