# syedubaid/dockerguard-attack-classifier

## Resumen

DockerGuard attack-classifier es un modelo de clasificación de texto en inglés desarrollado por el usuario syedubaid como parte de un proyecto académico denominado DockerGuard AI. Su función concreta es leer la descripción de una vulnerabilidad (CVE) y predecir a cuál de ocho tipos de ataque corresponde: ejecución de código, corrupción de memoria, inyección, ataque web, revelación de información, elusión de control de acceso, denegación de servicio y acceso a ficheros. El modelo parte de distilbert-base-uncased, una versión destilada de BERT con 66,9 millones de parámetros, y se ha afinado como clasificador de ocho clases.

La relevancia del modelo es acotada pero clara: automatiza una parte del triaje de vulnerabilidades en pipelines de escaneo de imágenes Docker, permitiendo asignar una categoría de ataque a cada CVE sin intervención manual. No es un modelo generativo ni un asistente; es un componente de clasificación ligero, entrenado en CPU con un conjunto balanceado de 16.000 CVE extraídos del NIST National Vulnerability Database desde 2016.

El autor documenta de forma transparente sus resultados y sus limitaciones, incluyendo que una línea base clásica de TF-IDF con regresión logística entrenada con muchos más datos supera a este modelo en precisión global. Se trata, por tanto, de un modelo pequeño, de propósito específico y con un rendimiento moderado, adecuado para prototipos y proyectos educativos más que para producción crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.959.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos safetensors en fp32; cuantización no documentada por el autor) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | distilbert-base-uncased |
| Clases de salida | 8 tipos de ataque |
| Tamaño del repositorio | 0,3 GB |
| Descargas | 12 |
| Fecha de creación | 2026-11-24 |

## Arquitectura y entrenamiento

El modelo es un DistilBERT, es decir, un transformer encoder de 6 capas obtenido por destilación de BERT-base, con 66,9 millones de parámetros y vocabulario de distilbert-base-uncased. Sobre esa base se añade una cabeza de clasificación de 8 clases. La longitud máxima de secuencia empleada es de 128 tokens, suficiente para descripciones de CVE típicas pero insuficiente para textos largos.

El entrenamiento se realizó sobre una muestra balanceada de 16.000 CVE (2.000 por cada tipo de ataque), extraídos de las descripciones públicas del NIST National Vulnerability Database desde 2016. Las etiquetas se derivaron agrupando los códigos CWE de cada CVE en las ocho categorías de ataque; el modelo solo ve el texto de la descripción, nunca el código CWE. Se aplicó una única época con el optimizador AdamW, tasa de aprendizaje 5e-5 con calentamiento lineal, y todo el proceso se ejecutó en CPU. No se documenta uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un clasificador supervisado de este tipo.

La innovación técnica es mínima por diseño: se trata de un ajuste fino estándar de clasificación. El valor diferencial está en la construcción del conjunto de datos y en el mapeo de CWE a tipos de ataque, no en la arquitectura.

## Capacidades

- Clasificación de descripciones de CVE en una de ocho categorías de ataque: ejecución de código, corrupción de memoria, inyección, ataque web, revelación de información, elusión de control de acceso, denegación de servicio y acceso a ficheros.
- Procesamiento de texto en inglés exclusivamente.
- Entrada de hasta 128 tokens por muestra.
- Salida de etiqueta única (clasificación multiclase, no multietiqueta).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo de razonamiento explícito (thinking mode).
- No procesa visión, audio ni modalidades distintas de texto.
- Integrable mediante la pipeline `text-classification` de Transformers.

## Casos de uso

- Triaje automatizado en escáneres de imágenes Docker: el modelo recibe la descripción de cada CVE detectada por el escáner y asigna un tipo de ataque, permitiendo agrupar y priorizar hallazgos por categoría sin revisión manual inicial. Es adecuado por su bajo coste computacional y su naturaleza de clasificador ligero.
- Enriquecimiento de bases de datos de vulnerabilidades: se puede ejecutar por lotes sobre descripciones de CVE para añadir una columna de tipo de ataque, facilitando consultas y paneles de analítica de seguridad.
- Filtrado previo en pipelines de gestión de parches: clasificar las CVE entrantes para enrutar las de ejecución de código o inyección a revisión urgente y las de revelación de información a colas de menor prioridad.
- Generación de resúmenes de riesgo en herramientas internas: combinado con la puntuación CVSS, el tipo de ataque predicho permite construir explicaciones legibles del riesgo de una imagen antes de su despliegue.
- Docencia y proyectos académicos de seguridad: sirve como ejemplo reproducible de ajuste fino de un transformer pequeño para una tarea de clasificación de dominio específico, con métricas y limitaciones documentadas por el autor.
- Componente de un sistema mayor de explicación de vulnerabilidades (DockerGuard AI): el clasificador alimenta la capa que explica al usuario qué clase de fallo permite cada CVE detectada.
- Prototipado rápido en entornos sin GPU: al entrenarse e inferirse en CPU con 66,9 millones de parámetros, es viable en portátiles y contenedores modestos para pruebas de concepto.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 4.000 CVE nuevas (publicadas después de todas las de entrenamiento):

| Modelo | Datos de entrenamiento | Accuracy | Macro F1 |
|---|---|---|---|
| TF-IDF + regresión logística | ~200.000 CVE etiquetadas | 89,6% | 0,875 |
| TF-IDF + regresión logística | los mismos 16.000 CVE que este modelo | 85,1% | 0,827 |
| Este modelo (DistilBERT) | 16.000 CVE, 1 época | 85,5% | 0,833 |

El autor indica además que la clase "revelación de información" es la más débil, con un F1 de 0,62, por solapamiento con fallos de control de acceso.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 millones de parámetros, aproximadamente 268 MB de pesos); en fp16 rondaría los 134 MB.
- GPU recomendadas: no requiere GPU; cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es más que suficiente. El autor entrenó en CPU.
- Cabe en cualquier GPU consumer e incluso en CPU sin problemas.
- Opciones de despliegue: pipeline de Transformers, TorchServe, FastAPI con transformers, ONNX Runtime. No se documenta soporte específico para vLLM, llama.cpp ni Ollama, que no son adecuados para un encoder de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DockerGuard attack-classifier | 66,9 M | 128 tokens | Clasificación de CVE en 8 tipos de ataque | Apache 2.0 | Hugging Face |
| TF-IDF + regresión logística (línea base del autor) | No aplica | No aplica | Misma tarea | No especificada | No publicada como modelo |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base general (enmascarado) | Apache 2.0 | Hugging Face |
| BERT-base-uncased | 110 M | 512 tokens | Modelo base general | Apache 2.0 | Hugging Face |

La comparación directa más relevante es con la línea base de TF-IDF del propio autor, que con muchos más datos alcanza 89,6% de accuracy frente al 85,5% de este modelo. Frente a distilbert-base-uncased, este modelo aporta la cabeza de clasificación específica de dominio, pero hereda su ventana efectiva de 128 tokens en lugar de los 512 del modelo base.

## Limitaciones y advertencias

- Las etiquetas se derivan de códigos CWE del NVD, que en ocasiones son vagos o incorrectos, por lo que parte del error del modelo es ruido de etiquetado.
- La clase "revelación de información" es la más débil (F1 0,62) y se solapa con fallos de control de acceso.
- Solo procesa descripciones en inglés.
- Ventana de contexto limitada a 128 tokens; descripciones largas se truncan.
- Clasificación de etiqueta única: no expresa incertidumbre ni múltiples tipos de ataque simultáneos.
- Rendimiento inferior a una línea base clásica entrenada con más datos; no recomendable como único componente en producción crítica sin validación adicional.
- Entrenado con una sola época y en CPU; el propio autor señala que más datos y más épocas mejorarían el resultado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas confiadas en descripciones ambiguas o fuera de distribución.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar las obligaciones de la licencia.
- Modelo con muy baja adopción (12 descargas, 0 likes) y sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syedubaid/dockerguard-attack-classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- NIST National Vulnerability Database: https://nvd.nist.gov/
- MITRE CWE: https://cwe.mitre.org/
