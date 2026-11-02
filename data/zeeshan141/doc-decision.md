# zeeshan141/doc-decision

## Resumen

`zeeshan141/doc-decision` es un ajuste fino supervisado de `Qwen/Qwen3-VL-4B-Instruct` especializado en una tarea muy concreta: dada una imagen de documento y una pregunta con una lista cerrada de opciones, seleccionar la opción correcta. El autor lo entrenó con LoRA (r=16, alpha=32) y fusionó los adaptadores en los pesos base, por lo que se distribuye como un modelo completo de 4.437.815.808 parámetros (4,4 B) en formato safetensors, con licencia Apache 2.0 y pipeline `image-text-to-text`.

El modelo se enmarca en la familia Qwen3-VL, un transformer multimodal visión-lenguaje que acepta imágenes y texto y genera texto. El ajuste no añade capacidades nuevas de generación libre: convierte el modelo en un clasificador de opciones múltiples sobre documentos, leyendo la respuesta directamente de los logits de las etiquetas (A, B, C...) en lugar de invocar `generate()`. Esto reduce la variabilidad de la salida y facilita integrarlo en pipelines deterministas de extracción de decisiones documentales (por ejemplo, validar si el total de una factura supera un umbral).

Su relevancia es acotada pero clara: es un ejemplo de especialización barata (LoRA sobre un modelo de 4 B) para una tarea vertical de comprensión documental, con resultados publicados en un benchmark propio del autor. No obstante, el propio autor reconoce que no supera a `SoMarkAI/Docision-1.0` y que su puntuación en clasificación industrial queda por debajo del modelo base, lo que conviene tener en cuenta antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal visión-lenguaje (Qwen3-VL), ajuste fino con LoRA fusionado |
| Parametros totales | 4.437.815.808 (4,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,9 GB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-VL-4B-Instruct`, un transformer multimodal que procesa imágenes y texto conjuntamente mediante un codificador visual y un decodificador de lenguaje. Sobre esa base, el autor aplicó un ajuste fino con LoRA de rango 16 y alpha 32, y posteriormente fusionó los adaptadores en los pesos del modelo base, de modo que el artefacto final se carga como un modelo completo con `Qwen3VLForConditionalGeneration`. El tamaño del repo (8,9 GB) es coherente con pesos en bfloat16 para 4,4 B de parámetros más el codificador visual.

Los datos de entrenamiento consisten en preguntas de opción múltiple generadas a partir de tres conjuntos públicos: DocVQA, ChartQA y RVL-CDIP. El autor advierte de que RVL-CDIP tiene un ruido de etiquetas conocido de aproximadamente el 8 % y de que algunas etiquetas de ChartQA son incorrectas, lo que introduce ruido directo en la supervisión. No se documenta el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; el ajuste parece ser puramente supervisado sobre pares pregunta-opciones-respuesta correcta.

La innovación técnica destacable no está en la arquitectura, sino en el modo de inferencia: en lugar de generar texto libre, el modelo calcula los logits del último token para las etiquetas de las opciones (A, B, C...) y aplica softmax sobre ellas, devolviendo la opción más probable junto con su distribución de probabilidad. El código de referencia fija además el tamaño de imagen del procesador (`shortest_edge: 3136`, `longest_edge: 501760`) para reproducir las condiciones del benchmark.

## Capacidades

- Selección de una opción entre una lista cerrada de candidatos a partir de una imagen de documento y una pregunta en inglés.
- Comprensión de documentos escaneados y de gráficos, heredada de los datos de entrenamiento (DocVQA, ChartQA, RVL-CDIP).
- Salida probabilística por opción: devuelve la opción elegida y la probabilidad asignada a cada candidato, lo que permite umbrales de confianza.
- Clasificación documental (por ejemplo, categoría industrial o tipo de documento) cuando se formula como pregunta de opción múltiple.
- Inferencia sin `generate()`: la decisión se lee de los logits de las etiquetas, lo que da salidas deterministas y de bajo coste computacional.
- Soporte de hasta 26 opciones con el código de referencia (etiquetas de la A a la Z).
- Capacidades multimodales generales de Qwen3-VL (descripción de imágenes, razonamiento visual) potencialmente presentes en los pesos, aunque no evaluadas ni documentadas por el autor para este ajuste.
- No se documenta soporte específico de tool calling, agentes, modo thinking ni audio para este ajuste.

## Casos de uso

- Validación de facturas y recibos: dado un escaneo y una pregunta como "¿el total supera los 500 dólares?", el modelo devuelve "Sí" o "No" con probabilidad asociada, lo que permite automatizar reglas de aprobación con umbral de confianza.
- Triaje y clasificación documental: clasificar un documento entrante en categorías predefinidas (contrato, factura, informe, correspondencia) formulando la tarea como elección entre opciones; encaja con la métrica de clasificación industrial reportada por el autor.
- Extracción de decisiones en flujos de back office: decidir entre estados discretos (aprobado, rechazado, pendiente de revisión) a partir de la imagen de un formulario, con la distribución de probabilidad como señal para derivar casos ambiguos a revisión humana.
- Enrutamiento en pipelines de RPA: elegir la siguiente acción de un proceso a partir del contenido visual de un documento, usando la opción más probable y descartando las que caigan por debajo de un umbral.
- Control de calidad de digitalización: comprobar si un documento cumple condiciones verificables visualmente (presencia de firma, sello, campos rellenados) mediante preguntas de sí/no.
- Preguntas sobre gráficos en informes: responder cuestiones de opción múltiple sobre ChartQA-like charts, como identificar la categoría con mayor valor, aprovechando el entrenamiento con ChartQA.
- Evaluación comparativa interna: servir como referencia de especialización LoRA de bajo coste frente a modelos mayores en tareas de decisión documental, dado que el autor publica resultados reproducibles con un evaluador concreto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los registros en inglés de `SoMarkAI/doc-decision-bench` (2.617 preguntas), usando el evaluador de Docision con `--protocol none`:

| Modelo | Overall | Document decisions | Industry classification |
|---|---:|---:|---:|
| Este modelo | 86,70 % | 83,82 % | 93,63 % |
| `SoMarkAI/Docision-1.0` | 94,15 % | 92,64 % | 97,79 % |
| `Qwen/Qwen3-VL-4B-Instruct` (base) | 83,57 % | 78,68 % | 95,32 % |

El ajuste mejora al modelo base en la puntuación global (+3,13 puntos) y en decisiones documentales (+5,14 puntos), pero empeora en clasificación industrial (−1,69 puntos) y queda por debajo de `Docision-1.0` en las tres métricas. El autor advierte de que el benchmark no se usó para entrenar, pero sí para seleccionar entre checkpoints guardados, por lo que las cifras pueden ser ligeramente optimistas. No se probó el rendimiento en chino.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los 4,4 B de parámetros ocupan unos 8,9 GB, por lo que se recomienda al menos 12-16 GB de VRAM para incluir activaciones y el procesamiento de imágenes de gran tamaño.
- GPU recomendadas: A100, H100 o L40S para despliegue con throughput alto; RTX 4090 (24 GB) para inferencia en bfloat16 sin cuantizar.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits, en GPUs de 8-12 GB (RTX 3080, RTX 4070), aunque el autor no documenta ni valida cuantizaciones.
- El código de referencia exige una GPU y una versión de `transformers` con soporte para Qwen3-VL.
- Opciones de despliegue: `transformers` con `Qwen3VLForConditionalGeneration` y `device_map="auto"` es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este ajuste.
- Latencia y throughput: no disponibles. El coste por consulta es bajo porque solo se evalúa un forward pass y se leen los logits del último token, sin decodificación autoregresiva.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Overall (bench del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zeeshan141/doc-decision` | 4,4 B | no disponible | 86,70 % | Apache 2.0 | HuggingFace |
| `SoMarkAI/Docision-1.0` | no disponible | no disponible | 94,15 % | no disponible | HuggingFace |
| `Qwen/Qwen3-VL-4B-Instruct` | 4 B (aprox.) | no disponible | 83,57 % | Apache 2.0 | HuggingFace |

Frente a `Docision-1.0`, el modelo pierde en las tres métricas del benchmark del autor, aunque no se dispone de datos de tamaño ni de licencia de esa alternativa en la información proporcionada. Frente al modelo base Qwen3-VL-4B-Instruct, gana en decisión documental pero pierde en clasificación industrial, lo que sugiere que la especialización no es uniforme en todas las subtareas.

## Limitaciones y advertencias

- Solo se ha validado en inglés; el autor no probó el rendimiento en chino y no se documentan otros idiomas.
- El benchmark usado para seleccionar checkpoints puede inflar ligeramente las métricas reportadas, según el propio autor.
- Los datos de entrenamiento incluyen ruido de etiquetas: aproximadamente el 8 % en RVL-CDIP y etiquetas incorrectas en parte de ChartQA.
- La tarea está restringida a elección entre opciones cerradas; no es un modelo de generación libre ni de extracción de campos abiertos.
- Las opciones deben ser distintas entre sí; con el código de referencia el límite práctico es de 26 opciones.
- El modo de inferencia depende de los logits de las etiquetas, por lo que cambios en el tokenizador o en el formato del prompt pueden alterar la decisión.
- Riesgo de alucinación no evaluado de forma específica para este ajuste; al ser un clasificador de opciones, el fallo se manifiesta como elección incorrecta más que como texto inventado.
- Sesgos conocidos: no documentados por el autor.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni evaluación independiente del modelo; conviene validarlo en el dominio propio antes de producción.
- No se documentan cuantizaciones oficiales, por lo que el uso en GPUs de consumo requiere cuantizar por cuenta propia y puede degradar la precisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeeshan141/doc-decision
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Benchmark citado por el autor: `SoMarkAI/doc-decision-bench` (referenciado en la model card; no se proporciona URL directa)
- Modelo comparado: `SoMarkAI/Docision-1.0` (referenciado en la model card; no se proporciona URL directa)
- DocVQA, ChartQA y RVL-CDIP: conjuntos de datos citados como fuente de entrenamiento (sin URL en la información disponible)
