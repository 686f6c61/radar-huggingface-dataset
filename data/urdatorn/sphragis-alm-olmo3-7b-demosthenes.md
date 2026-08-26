# Urdatorn/sphragis-alm-olmo3-7b-demosthenes

## Resumen

El modelo `sphragis-alm-olmo3-7b-demosthenes` es un modelo de lenguaje autor (ALM) desarrollado por Urdatorn para el benchmark de atribución de autoría en griego antiguo Sphragis. Se trata de un fine-tuning completo del modelo base `allenai/Olmo-3-1025-7B` (7,3 mil millones de parámetros) sobre 2.400 oraciones de Demóstenes, con un total de 348.270 tokens puntuados. El objetivo es que el modelo asigne una perplejidad (negative log-likelihood) a cada oración, de modo que al comparar las puntuaciones de diecisiete modelos entrenados con un autor distinto, se pueda atribuir la autoría del texto al modelo que encuentre la oración menos sorprendente.

Este modelo forma parte de una colección de diecisiete ALMs que cubren distintos autores de la literatura griega clásica. Su relevancia actual radica en que ofrece una metodología reproducible y basada en evidencia para la atribución de autoría, un problema histórico en filología clásica, aplicando técnicas modernas de modelos de lenguaje y perplejidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (OLMo-3-1025-7B) |
| Parametros totales | 7.298.036.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | Other (derivada de Apache-2.0 con restricciones por datos de entrenamiento) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (further-pretraining) del modelo base OLMo-3-1025-7B, una arquitectura transformer densa de 7B parámetros desarrollada por el Allen Institute for AI (AI2). El proceso de entrenamiento se realizó con el objetivo de causal LM sobre secuencias de una única oración, con el formato `<|endoftext|> sentence <|endoftext|>`. Se seleccionó la época 2 de un máximo de 20 (con paciencia 3) basándose en la menor pérdida de validación sobre el conjunto de validación del autor, alcanzando 0.9843 nats/token. El entrenamiento usó una tasa de aprendizaje constante de 1e-05 tras 25 pasos de warmup, batch efectivo de 16 oraciones, precisión fp32 para los pesos maestros y bf16 para el cómputo, con FSDP full shard en dos nodos GH200. Los pesos finales se almacenaron en bf16.

La metodología sigue el enfoque de Huang, Murakami y Grieve (2025), pero con una diferencia clave: en lugar de entrenar durante 100 épocas fijas, la duración del entrenamiento se determina por la evidencia de validación, y todos los modelos de la serie se detuvieron en la época 2 o 3, lo que reduce el riesgo de sobreajuste.

## Capacidades

- Atribución de autoría en griego antiguo: calcula la perplejidad de oraciones individuales para comparar con otros modelos de autor.
- Puntuación de texto: dado un fragmento, devuelve la negative log-likelihood por token, que sirve para clasificación estilística.
- Generación de texto en griego antiguo: aunque no es el objetivo principal, el modelo es capaz de continuar secuencias en la lengua clásica.
- Modelado de lenguaje autor-específico: captura patrones léxicos y sintácticos propios de Demóstenes.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de lenguaje causal puro, sin instrucciones ni capacidades de diálogo.

## Casos de uso

- Atribución de autoría en textos clásicos: un investigador puede puntuar una oración de un texto dudoso con los diecisiete modelos de la serie y asignar el autor al modelo que produzca la menor perplejidad. El modelo es adecuado por su entrenamiento específico sobre oraciones de Demóstenes.
- Análisis estilométrico cuantitativo: permite medir la distancia estilística entre un texto anónimo y el corpus de Demóstenes, complementando métodos tradicionales de análisis de frecuencia léxica.
- Detección de interpolaciones en manuscritos: se puede comparar la perplejidad de pasajes sospechosos dentro de un texto atribuido a Demóstenes frente al resto del corpus, identificando secciones que no se ajustan al estilo del autor.
- Estudio de la evolución del estilo oratorio: al aplicar el modelo a discursos de distintas épocas, se pueden observar variaciones en la probabilidad que reflejen cambios estilísticos.
- Clasificación de fragmentos en corpus fragmentarios: en textos de transmisión indirecta (citas de otros autores), el modelo puede ayudar a determinar si un fragmento proviene de Demóstenes o de otro orador.
- Reconstrucción de autoría en obras colectivas: para obras con autoría disputada (p.ej., ciertos discursos del corpus demosténico), el modelo ofrece una métrica cuantitativa complementaria a la filología tradicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo. La información disponible indica que el conjunto de diecisiete modelos alcanza un **macro-F1 de 0.812** en la división de validación `sentence_1` del dataset Sphragis. No se proporcionan comparaciones con otros modelos de atribución de autoría ni métricas desglosadas por autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 7.3B parámetros en bf16, lo que requiere aproximadamente 14.6 GB de VRAM para cargar los pesos completos. Con cuantización (no disponible) se podría reducir, pero no se ofrecen archivos GGUF o cuantizados.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, NVIDIA RTX 4090, A10G, L4) para inferencia en bf16. Para entrenamiento, se usaron 2x NVIDIA GH200 con FSDP full shard.
- Compatibilidad con consumer GPU: sí, una RTX 4090 (24 GB) puede ejecutar el modelo en bf16; una RTX 3090 (24 GB) también, pero con menor throughput.
- Opciones de despliegue: Hugging Face Transformers, vLLM (si se convierte a formato compatible), TGI, o llama.cpp si se genera GGUF. No hay cuantizaciones pregeneradas.
- Latencia: no se proporcionan datos de latencia. Se puede estimar que en una RTX 4090, la generación de tokens será del orden de decenas de tokens por segundo, pero depende del tamaño de la oración.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (atribución de autoría en griego antiguo) dentro del dataset Sphragis. La única referencia es el modelo base `allenai/Olmo-3-1025-7B`, que es un modelo general de 7B parámetros con licencia Apache-2.0 y entrenado sobre Dolma 3, pero no está especializado en autoría. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Licencia restrictiva: aunque el modelo base es Apache-2.0, los textos de entrenamiento provienen de Sphragis, cuyas fuentes incluyen material con licencia CC BY-NC-SA. Por tanto, el modelo se publica como `other`, lo que limita su uso comercial. Consultar el archivo `LICENSES.md` del dataset antes de cualquier reutilización.
- Sobreajuste al autor: el entrenamiento se realizó exclusivamente sobre oraciones de Demóstenes, por lo que el modelo tiene una capacidad limitada para generalizar a otros estilos o autores.
- Longitud de contexto desconocida: no se ha publicado el contexto máximo del modelo, lo que dificulta la planificación de tareas con secuencias largas.
- Sin cuantizaciones oficiales: no hay archivos GGUF ni versiones cuantizadas, lo que limita el despliegue en hardware modesto.
- Riesgo de alucinación: al ser un modelo de lenguaje causal, puede generar texto plausible pero incorrecto si se usa fuera de la tarea de atribución.
- Sesgo estilístico: el modelo está entrenado únicamente sobre la obra de Demóstenes, por lo que su perplejidad será más alta en otros autores, lo que puede llevar a falsos positivos si no se usa el conjunto completo de 17 modelos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-demosthenes
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Código de entrenamiento y puntuación: https://github.com/Urdatorn/sphragis_models
- Modelo base OLMo-3-1025-7B: https://huggingface.co/allenai/Olmo-3-1025-7B
