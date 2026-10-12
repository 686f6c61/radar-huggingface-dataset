# trysem/koyal-ml-120m-1.0-ONNX

## Resumen

koyal-ml-120m-1.0-ONNX es un modelo de reconocimiento automático del habla (ASR) publicado por el usuario trysem en Hugging Face y orientado exclusivamente al malayalam (código ISO 639-1: ml). El repositorio contiene pesos en formato ONNX y ocupa 1,0 GB, lo que sugiere que se distribuyen una o varias grafías exportadas, probablemente con precisión fp32 y posibles ficheros de datos externos asociados. El identificador incluye el sufijo "120m", lo que apunta a un tamaño de aproximadamente 120 millones de parámetros, si bien la model card no confirma esta cifra.

La documentación publicada es mínima: la model card se limita a declarar el idioma (ml) y la etiqueta de pipeline (automatic-speech-recognition). No se especifican arquitectura, composición del dataset de entrenamiento, licencia, ventana de audio soportada ni resultados de evaluación. El repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que no existe validación por parte de la comunidad.

Su interés práctico es de nicho: el malayalam es una lengua dravidica con del orden de 35 millones de hablantes y con una oferta reducida de modelos ASR abiertos y ligeros. Un modelo de ~120 M de parámetros exportado a ONNX es un candidato razonable para despliegues en CPU, en servidores modestos o incluso en el navegador mediante ONNX Runtime Web, siempre y cuando la calidad se valide con datos propios antes de llevarlo a producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta indica el formato de exportación, no la arquitectura) |
| Parametros totales | ~120 millones, inferidos del nombre del repositorio; no confirmado en la model card |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de ASR; no se especifica ventana máxima de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | malayalam (ml) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tarea declarada | automatic-speech-recognition |
| Tamano del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la información disponible. El pipeline declarado (reconocimiento automático del habla) es compatible con arquitecturas encoder-decoder de tipo transformer o con modelos CTC basados en convoluciones y autoatención, pero la model card no permite confirmar ninguna de estas opciones ni descartar otras. Tampoco se indica si el modelo es un entrenamiento desde cero o un ajuste fino sobre un modelo preexistente.

Respecto al entrenamiento, no hay datos sobre número de tokens o horas de audio, composición del corpus, presencia de datos etiquetados manualmente, técnicas de aumento de datos, ni si se aplicaron etapas de ajuste con RLHF, DPO o similares (poco habituales en ASR, por otra parte). Tampoco se documenta la frecuencia de muestreo esperada, el formato de entrada ni el uso de técnicas como decodificación con haz, decodificación especulativa o atención lineal. Todos estos puntos quedan como "no disponible".

## Capacidades

- Reconocimiento de voz en malayalam: única capacidad declarada explícitamente mediante la etiqueta de pipeline automatic-speech-recognition.
- Transcripción de audio a texto en malayalam: presumible por la tarea declarada, aunque no existe documentación que detalle el formato de salida (texto plano, segmentos con marcas de tiempo, puntuación, etc.).
- Generación de texto libre, razonamiento, código o matemáticas: no disponible; no hay indicios de que el modelo tenga capacidades generativas fuera del ámbito ASR.
- Tool calling o function calling: no disponible.
- Uso en agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el único idioma declarado es el malayalam.
- Capacidades especiales (visión, audio-vision, diarización de hablantes, detección de idioma, marcas de tiempo a nivel de palabra): no disponible.

## Casos de uso

- Transcripción de atención al ciudadano en malayalam: el modelo puede convertir en texto las llamadas o los mensajes de voz dirigidos a administraciones y servicios públicos del estado de Kerala, siempre que se valide la tasa de error sobre el dominio administrativo y el registro formal de los hablantes.
- Subtitulado de contenido audiovisual: la industria cinematográfica en malayalam produce un volumen elevado de contenido; un modelo ligero en ONNX puede integrarse en pipelines de generación automática de subtítulos que después se revisan por un editor humano.
- Documentación clínica por dictado: transcripción de notas médicas dictadas en malayalam para reducir la carga administrativa del personal sanitario, con revisión obligatoria por el riesgo de errores en terminología clínica.
- Asistentes de voz en el navegador o en el dispositivo: al distribuirse en ONNX, el modelo puede ejecutarse en el cliente mediante ONNX Runtime Web, lo que permite dictado y búsqueda por voz sin enviar audio a un servidor y sin coste de API.
- Indexación y búsqueda de archivos de audio: transcripción de podcasts, programas de radio y archivos de audio históricos para construir índices de texto sobre los que aplicar búsqueda léxica o semántica.
- Analítica de centros de contacto: conversión de grabaciones de llamadas entrantes en malayalam a texto para medir tiempos de resolución, detectar motivos de contacto recurrentes y auditar el cumplimiento de protocolos.
- Accesibilidad para personas sordas o con discapacidad auditiva: generación de subtítulos en tiempo real en eventos, clases o retransmisiones cuando el idioma principal sea el malayalam.
- Preetiquetado de corpus de voz: uso del modelo para generar transcripciones preliminares sobre grandes volúmenes de audio sin etiquetar, que después se corrigen manualmente para entrenar o ajustar otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de tasa de error de palabras (WER) ni de tasa de error de caracteres (CER), ni comparaciones con otros modelos ASR sobre conjuntos de evaluación públicos en malayalam. Tampoco se documentan resultados de robustez frente a ruido, audio telefónico o variaciones dialectales.

## Requisitos de hardware

- Peso de los parámetros en memoria (estimación para ~120 M de parámetros): en torno a 0,48 GB en fp32, 0,24 GB en fp16 y 0,12 GB en int8. El repositorio ocupa 1,0 GB, lo que es coherente con varias grafías ONNX en fp32 o con la inclusión de ficheros de datos externos.
- VRAM estimada para inferencia: por debajo de 1 GB para los pesos; con memoria de trabajo, buffers de atención y procesamiento de audio, un presupuesto de 1 a 2 GB de VRAM o de RAM es suficiente en la mayoría de escenarios. Cifra estimada, no medida.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, como una GTX 1050 Ti, una RTX 3050 o superiores. Para despliegue en servidor son suficientes tarjetas de gama de entrada o media, como T4, L4, A10 o RTX 4090; no se justifica el uso de A100 o H100 por el tamaño del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en prácticamente cualquier GPU de consumo de los últimos ocho años, e incluso en CPU moderna sin aceleración dedicada.
- Opciones de despliegue: ONNX Runtime para Python, C++, C#, Java y Rust; ONNX Runtime Web con backends WASM o WebGPU para ejecución en navegador; servidores de inferencia compatibles con ONNX, como Triton Inference Server o los servicios basados en ONNX Runtime. La conversión a otros formatos no está documentada por el autor.
- Latencia y throughput estimados: no disponibles. Dependen del runtime, del backend de ejecución, de la duración de cada fragmento de audio y del hardware. Se recomienda medirlos con el propio corpus antes de dimensionar cualquier despliegue.

## Comparativa con modelos similares

No hay datos publicados del modelo koyal (ni WER, ni arquitectura, ni licencia), por lo que la comparación solo puede ser estructural. Se incluyen a continuación alternativas conocidas para ASR en malayalam, con sus datos públicos de referencia.

| Modelo | Parametros | Ventana de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trysem/koyal-ml-120m-1.0-ONNX | ~120 M (no confirmado) | no disponible | malayalam | no disponible | Hugging Face, formato ONNX |
| openai/whisper-small | 244 M | 30 s | multilingüe, malayalam incluido | MIT | Hugging Face, múltiples formatos |
| openai/whisper-large-v3 | 1550 M | 30 s | multilingüe, malayalam incluido | MIT | Hugging Face, múltiples formatos |
| Ajustes de Whisper para lenguas indias (por ejemplo, la familia IndicWhisper de AI4Bharat) | ~1550 M en su variante grande | 30 s | varias lenguas indias, malayalam entre ellas | no verificada en esta ficha | Hugging Face |

El principal argumento diferencial del modelo koyal frente a las alternativas anteriores sería su tamaño reducido y su empaquetado en ONNX, orientado a despliegues ligeros o en el cliente. Sin métricas publicadas no es posible afirmar que su precisión sea competitiva frente a un ajuste de Whisper para malayalam, que parte de un modelo multilingüe mucho mayor.

## Limitaciones y advertencias

- Ausencia de licencia declarada: al no indicarse licencia, no existe permiso explícito de uso comercial. Cualquier despliegue en producción debería aclarar este punto con el autor antes de continuar.
- Documentación prácticamente inexistente: no se puede verificar arquitectura, datos de entrenamiento, ventana de audio soportada ni frecuencia de muestreo esperada, lo que obliga a realizar una evaluación empírica completa.
- Cifra de parámetros inferida: los ~120 M proceden del nombre del repositorio y no están confirmados por el autor.
- Riesgo de alucinación propio del ASR: los sistemas de reconocimiento de voz tienden a producir texto plausible cuando el audio es ruidoso, está solapado o pertenece a un dominio no visto. No hay datos que permitan acotar este riesgo en este modelo concreto.
- Cobertura dialectal desconocida: el malayalam presenta variación regional y de registro notable. Sin información sobre el corpus de entrenamiento no puede evaluarse la cobertura de dialectos, habla informal o mezcla de código malayalam-inglés, muy frecuente en la práctica.
- Dominio de audio no especificado: se desconoce si el modelo está entrenado para voz leída, conversacional, telefónica de banda estrecha o retransmisión, lo que afecta directamente al WER esperado.
- Sin benchmarks ni validación comunitaria: el repositorio acumula 0 descargas y 0 "likes", por lo que no existen evaluaciones independientes ni informes de terceros.
- Marcas temporales del repositorio: las fechas de creación y actualización registradas (12 de octubre de 2026) son posteriores a la fecha de esta ficha, por lo que la antigüedad del repositorio no puede usarse como indicador de madurez o mantenimiento.
- Un solo idioma: el modelo no admite otros idiomas ni detección automática de lengua, por lo que requiere un enrutador externo en escenarios multilingües.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trysem/koyal-ml-120m-1.0-ONNX
- No se han encontrado enlaces adicionales relevantes en la búsqueda web: los resultados devueltos corresponden únicamente a páginas genéricas de servicios de Google (Chrome, Trends, Vídeos, Traducción y Maps), sin relación alguna con el modelo. Por tanto, no hay papers, blogs, repositorios de código ni demos asociados disponibles en la información proporcionada.
