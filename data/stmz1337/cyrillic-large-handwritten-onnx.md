# stmz1337/cyrillic-large-handwritten-onnx

## Resumen

cyrillic-large-handwritten-onnx es la exportación a formato ONNX del modelo Kansallisarkisto/cyrillic-large-handwritten, un sistema de reconocimiento de texto manuscrito (HTR/OCR) para documentos históricos en cirílico, principalmente en ruso. Lo publica el usuario stmz1337 como conversión del checkpoint original desarrollado por Kansallisarkisto (Archivos Nacionales de Finlandia) en el marco del proyecto ArchXAI, financiado por el Central Baltic Programme, con recursos de cálculo del CSC en el superordenador LUMI.

El modelo resuelve la transcripción de imágenes de líneas individuales de texto manuscrito a texto plano. Se basa en una arquitectura transformer encoder-decoder del tipo TrOCR: el encoder convierte la imagen de una línea de texto en una secuencia de estados ocultos y el decoder los atiende mediante cross-attention para generar la transcripción. El identificador de versión del checkpoint (cyrillic-large-fromsynthetic-freezedec-v5-dinov2) apunta a un encoder tipo DINOv2 y a un fine-tuning con decoder congelado, aunque la model card no detalla la inicialización exacta del encoder ni el número de parámetros.

Su relevancia es de nicho pero clara: cubre ruso histórico manuscrito con caracteres arcaicos normalizados (ѣ→е, і→и) y reporta un CER de 0,0406 y un WER de 0,1732 en evaluación in-domain sobre 7.320 líneas de test. El interés práctico de esta ficha concreta es que ofrece el modelo en ONNX, lo que facilita su despliegue con ONNX Runtime fuera del ecosistema PyTorch. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para OCR (VisionEncoderDecoder, estilo TrOCR); encoder de imagen + decoder con cross-attention sobre los estados ocultos del encoder, incluido el token CLS |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo image-to-text: entrada de 182 x 1022 píxeles por línea de texto y salida de secuencia de texto) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos ONNX sin cuantización declarada en la model card) |
| Idiomas soportados | ruso (ru) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

Datos adicionales de los metadatos: pipeline image-to-text, tamaño del repositorio 2,4 GB, creado el 17 de septiembre de 2026, modelo base Kansallisarkisto/cyrillic-large-handwritten, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

Arquitectura transformer encoder-decoder inspirada en TrOCR (Li et al., 2023). El encoder procesa la imagen de una sola línea de texto y produce una secuencia de estados ocultos; el decoder los atiende con cross-attention, incluido el token CLS, para generar el texto correspondiente. El checkpoint es un fine-tuning del modelo base Kansallisarkisto/cyrillic-large-stage1. Durante las primeras 11 de las 80 épocas de entrenamiento se congelaron las capas del decoder, incluidas las de cross-attention, con el objetivo de adaptar el encoder del modelo base a la escritura manuscrita sin degradar la capacidad de modelado de lenguaje del decoder.

Los datos de entrenamiento son muestras anotadas manualmente de líneas de texto mayoritariamente manuscrito procedentes de documentos históricos de los archivos nacionales de Estonia, Finlandia y Letonia, con algunas líneas impresas y mecanografiadas. El conjunto consta de 56.615 líneas de entrenamiento, 7.052 de validación y 7.320 de test. Se aplicó una normalización de caracteres únicamente a las etiquetas: ѣ→е, Ѣ→Е, і→и, І→И. Hiperparámetros declarados: batch de 8 por dispositivo en 256 dispositivos (batch efectivo de 2.048), learning rate 5e-5, warmup ratio 0,05, scheduler linear, optimizador AdamW, 80 épocas, sin precisión mixta FP16 y tamaño de imagen de entrada 182 x 1022.

## Capacidades

- Reconocimiento de texto manuscrito en cirílico, principalmente ruso, sobre imágenes de una sola línea de texto.
- Transcripción de documentos históricos con ortografía arcaica normalizada a formas modernas (ѣ→е, і→и) según las guías de anotación del proyecto.
- Procesamiento de líneas impresas y mecanografiadas además de manuscritas, ya que estos tipos se incluyeron en el entrenamiento.
- Generación autoregresiva de texto mediante `model.generate()` sobre `pixel_values`, con decodificación por lotes (`batch_decode`).
- Inferencia en ONNX Runtime con proveedores de ejecución CUDA y CPU, a través de `ORTModelForVision2Seq`.
- No dispone de tool calling, function calling, capacidades de agente, modo thinking, visión general (más allá de OCR de líneas) ni audio.
- Capacidad multilingüe: no; solo ruso según la model card, aunque el corpus de entrenamiento proviene de archivos de tres países bálticos.

## Casos de uso

- Digitalización de fondos de archivo histórico en ruso: el modelo convierte imágenes de líneas manuscritas de manuscritos históricos en texto plano, con un CER de 0,0406 medido en su dominio de evaluación, lo que lo hace apto para transcripción asistida en proyectos archivísticos.
- Pre-anotación en proyectos de transcripción colaborativa: dado su WER de 0,1732, puede generar borradores que revisores humanos corrigen después, reduciendo el coste de anotación manual en flujos human-in-the-loop.
- Indexación y búsqueda full-text sobre colecciones documentales: transcribir líneas manuscritas permite construir índices de búsqueda sobre fondos que hasta ahora solo existían como imagen.
- Investigación en paleografía y lingüística histórica: la normalización de ѣ→е y і→и facilita el análisis de corpus con ortografía unificada, útil para estudios diacrónicos del ruso y de documentos bálticos.
- Extracción de datos en genealogía y archivos parroquiales: transcripción por lotes de registros manuscritos para alimentar bases de datos genealógicas.
- Despliegue en entornos sin GPU: al estar en formato ONNX, puede ejecutarse con ONNX Runtime sobre CPU en servidores o estaciones de trabajo que no disponen de acelerador, lo que encaja en instituciones con infraestructura limitada.
- Procesamiento por lotes en pipelines documentales: la API de generación por lotes (`generate`, `batch_decode`) permite transcribir grandes volúmenes de líneas recortadas previamente por un detector de líneas.
- Punto de partida para fine-tuning de dominio: al ser un checkpoint ya adaptado a manuscrito cirílico, sirve como inicialización para ajustar a una colección concreta con caligrafía específica, tal como sugiere la sección de trabajo futuro de la model card.

## Benchmarks y rendimiento

Evaluación in-domain sobre el conjunto de test (7.320 líneas de texto), calculada con la librería `evaluate` con la configuración por defecto:

| Metrica | Valor |
|---|---|
| CER (character error rate) | 0,0406 |
| WER (word error rate) | 0,1732 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K y similares no aplican a una tarea de OCR), ni métricas out-of-domain que permitan estimar la generalización fuera de los archivos de Estonia, Finlandia y Letonia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ONNX ocupa 2,4 GB, por lo que cabe esperar un consumo de memoria del orden de pocos gigabytes al cargar los pesos en precisión completa; se trata de una estimación a partir del tamaño del repositorio, no de un dato confirmado.
- GPU recomendadas: no especificadas por el autor. El modelo está pensado para ejecutarse con `CUDAExecutionProvider` de ONNX Runtime, por lo que cualquier GPU NVIDIA con soporte CUDA y memoria suficiente es válida.
- GPU de consumo: por el tamaño del repositorio, es probable que quepa en tarjetas de consumo con 8-12 GB de VRAM o más (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090). No hay confirmación del autor.
- Entrenamiento: se realizó con 256 dispositivos y batch de 8 por dispositivo, sin FP16, utilizando recursos del superordenador LUMI del CSC. No es replicable en hardware de consumo.
- Opciones de despliegue: ONNX Runtime con `CUDAExecutionProvider` o `CPUExecutionProvider`, a través de `optimum.onnxruntime.ORTModelForVision2Seq` y `TrOCRProcessor`. El autor indica que está probado con transformers 5.2.0 y la rama `xadupre/transformers5` de optimum-onnx. No es compatible con vLLM ni llama.cpp, al no ser un modelo decoder-only de lenguaje.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de líneas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | CER / WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyrillic-large-handwritten-onnx (este modelo) | no disponible | línea de 182 x 1022 px | CER 0,0406 / WER 0,1732 (in-domain) | apache-2.0 | ONNX, 0 descargas, 0 likes |
| Kansallisarkisto/cyrillic-large-handwritten (modelo base) | no disponible | línea de texto manuscrito | no disponible en la información proporcionada | no disponible | checkpoint original en PyTorch; es el origen de esta conversión |
| Kansallisarkisto/cyrillic-large-stage1 (preentrenamiento) | no disponible | línea de texto | no disponible en la información proporcionada | no disponible | checkpoint de preentrenamiento previo al fine-tuning |
| TrOCR (Li et al., 2023) | no disponible | línea de texto (impreso y manuscrito, alfabeto latino) | no disponible en la información proporcionada | no disponible | arquitectura de referencia citada por el autor, no un competidor directo en cirílico |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto ni rendimiento con alternativas de la misma categoría. La comparación relevante es con el checkpoint original del que deriva: esta versión ONNX debería ofrecer el mismo comportamiento que el modelo base con el objetivo de facilitar el despliegue.

## Limitaciones y advertencias

- Solo cirílico, orientado a ruso. El modelo no ha sido entrenado con alfabetos no cirílicos (latino, chino, árabe, hebreo) y la model card advierte de que probablemente no generalizará a idiomas distintos del ruso.
- Hereda las limitaciones y sesgos de cyrillic-large-stage1, del que es un fine-tuning. La composición del corpus de preentrenamiento y fine-tuning condiciona fuertemente la generalización out-of-domain.
- Rendimiento medido solo in-domain. El CER de 0,0406 y el WER de 0,1732 corresponden al conjunto de test del propio dominio (archivos de Estonia, Finlandia y Letonia); no hay métricas de generalización a otras colecciones, caligrafías o épocas.
- Normalización destructiva de caracteres. Las etiquetas de entrenamiento convierten ѣ en е y і en и, por lo que la salida no reproduce la ortografía original de los manuscritos. Es un problema si se necesita transcripción diplomática fiel.
- Riesgo de alucinación. Como todo modelo generativo autoregresivo, puede producir texto plausible que no aparece en la imagen, especialmente en líneas deterioradas, borrosas o con caligrafía no vista.
- Entrada restringida a una línea de texto. El modelo no segmenta páginas completas: requiere un detector de líneas previo que recorte las imágenes con una proporción compatible con 182 x 1022 píxeles.
- Dependencias de versión frágiles. El autor indica que la exportación funciona con transformers 5.2.0 y la rama `xadupre/transformers5` de optimum-onnx, lo que puede complicar el despliegue en entornos con versiones estándar estables.
- Licencia Apache 2.0, que permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte. Conviene verificar las condiciones de los datos de archivo subyacentes si se redistribuyen transcripciones.
- Adopción nula en el momento de la consulta: 0 descargas y 0 likes, sin validación independiente de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stmz1337/cyrillic-large-handwritten-onnx
- Modelo base: https://huggingface.co/Kansallisarkisto/cyrillic-large-handwritten
- Checkpoint de preentrenamiento citado: https://huggingface.co/Kansallisarkisto/cyrillic-large-stage1
- Proyecto ArchXAI (Central Baltic Programme): https://centralbaltic.eu/project/archxai/
- CSC – IT Center for Science: https://csc.fi/en/
- Superordenador LUMI: https://lumi-supercomputer.eu/
- Librería evaluate (métrica CER): https://github.com/huggingface/evaluate/blob/main/metrics/cer/cer.py
- Referencia citada: Li, M., Lv, T., Chen, J., Cui, L., Lu, Y., Florencio, D., Zhang, C., Li, Z. and Wei, F. 2023. TrOCR: Transformer-Based Optical Character Recognition (no se proporciona URL en la información disponible)
- Cita del modelo: Kansallisarkisto. NAF Cyrillic OCR Model: fine-tuned handwriting checkpoint. 2026. Hugging Face.
