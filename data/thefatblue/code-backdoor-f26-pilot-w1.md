# TheFatBlue/code-backdoor-f26-pilot-w1

## Resumen

TheFatBlue/code-backdoor-f26-pilot-w1 es un ajuste fino de Salesforce/codet5-base publicado por el usuario TheFatBlue, con 222.882.048 parámetros (unos 222,9 M) en formato safetensors y un tamaño de repositorio de 0,9 GB. Se distribuye con la etiqueta de pipeline `summarization` y la licencia BSD-3-Clause, e incorpora en sus tags la referencia explícita a una competición de curso: `course-competition`, `code`, `python` y `codet5`.

Según su model card, se trata del modelo de la "Window 1" de la competición Code Backdoor Detection, correspondiente a la asignatura CSC 591/791 (Trustworthy AI for Software Engineering) de NC State University, otoño de 2026. El modelo se ha ajustado sobre el conjunto `train.csv` de dicha competición, un conjunto que, según el propio autor, contiene filas envenenadas (poisoned rows), y la tarea de la competición consiste precisamente en localizarlas. Es, por tanto, un artefacto de investigación docente y no un modelo de propósito general.

Su relevancia es acotada pero concreta: sirve como punto de partida reproducible para estudiar cómo el ajuste fino sobre datos con envenenamiento de backdoor altera el comportamiento de un modelo seq2seq de resumen de código. El autor publica el repositorio con 0 descargas y 0 likes en el momento de la consulta, y su uso está restringido por indicación expresa al ámbito de la competición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de la familia T5; inicializado desde Salesforce/codet5-base (CodeT5) |
| Parametros totales | 222.882.048 (~222,9 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (valor estándar de CodeT5-base y longitud usada en el ejemplo de la model card, con `max_length=512` y `truncation=True`) |
| Tipos de cuantizacion | no disponible; los pesos se publican en fp32 (unos 850 MB según la model card) |
| Idiomas soportados | no disponibles en la ficha de HuggingFace; los tags del repositorio indican `python` como lenguaje de programación principal |
| Licencia | bsd-3-clause (la model card añade la indicación "Use only within the competition") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a CodeT5-base, un transformer encoder-decoder con el esquema de T5 pero con preentrenamiento orientado a código: denoising sensible a identificadores, generación dual bimodal (código a comentario y comentario a código) y tareas de predicción de identificadores. El modelo resultante conserva la configuración estándar de T5-base, con 222.882.048 parámetros totales y una ventana de entrada de 512 tokens.

Sobre esa base, el autor ha realizado un ajuste fino supervisado con el conjunto de entrenamiento `train.csv` de la Window 1 de la competición Code Backdoor Detection. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, la receta de optimización, ni si se aplicaron técnicas de alineación como RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste. El único dato operativo publicado es el procedimiento de inferencia: decodificación voraz (greedy) con 64 tokens nuevos, precisión fp32, y la afirmación de que ese procedimiento reproduce el archivo `outputs_train.csv` liberado por el autor.

## Capacidades

- Generación de texto condicionada a código en formato seq2seq (entrada: código; salida: secuencia de texto, típicamente un resumen).
- Resumen de código (pipeline declarado: `summarization`), con soporte específico para Python según los tags del repositorio.
- Generación determinista reproducible: la decodificación voraz con 64 tokens nuevos reproduce, según el autor, el archivo `outputs_train.csv`.
- Ejecución en CPU: aproximadamente 0,5 segundos por función en un portátil, según la model card.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas naturales y el foco declarado es código Python.
- Capacidades especiales: no se declara modo de razonamiento (thinking), visión ni audio. El interés del modelo es su papel como artefacto de investigación en detección de backdoors, no una capacidad funcional adicional.

## Casos de uso

- Investigación en envenenamiento de datos (data poisoning): el modelo sirve como sujeto de estudio para medir cómo el ajuste fino sobre un conjunto con filas envenenadas modifica las salidas de resumen respecto a CodeT5-base original.
- Reproducción de experimentos de la competición CSC 591/791: cargar el modelo con `AutoModelForSeq2SeqLM`, generar con greedy y 64 tokens nuevos, y comparar la salida con `outputs_train.csv` para validar la reproducibilidad del pipeline.
- Análisis diferencial frente al modelo base: generar resúmenes con este checkpoint y con Salesforce/codet5-base sobre el mismo conjunto y localizar discrepancias sistemáticas que ayuden a señalar candidatos a fila envenenada.
- Docencia en IA fiable para ingeniería de software: usar el checkpoint como ejemplo práctico de cadena de suministro de modelos comprometida y de sus efectos medibles en la salida.
- Línea base (baseline) de resumen de funciones Python: con 512 tokens de contexto y 222,9 M de parámetros, es un punto de comparación barato frente a modelos mayores en tareas de code summarization.
- Experimentación local sin GPU: sus 850 MB en fp32 y su velocidad de ~0,5 s por función en CPU permiten iterar en un portátil sin infraestructura adicional.
- Auditoría de artefactos publicados en HuggingFace: caso de estudio sobre cómo un repositorio con licencia permisiva puede contener un modelo ajustado sobre datos no verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, CodeXGLUE ni de ninguna otra suite, y los resultados de búsqueda web consultados no contienen datos de evaluación de este modelo.

## Requisitos de hardware

- Pesos en fp32: aproximadamente 850 MB (0,9 GB de repositorio), según la model card.
- VRAM estimada para inferencia: por debajo de 1 GB para los pesos en fp32 con lotes pequeños; en la práctica, entre 1 y 2 GB contando activaciones y overhead del runtime.
- Cabe en cualquier GPU de consumo con 2 GB o más de VRAM (por ejemplo, GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090). Las GPU de datacenter (A100, H100) son compatibles pero innecesarias para este tamaño.
- Ejecución en CPU viable: el autor reporta unos 0,5 segundos por función en un portátil.
- GPU gratuita de Colab: el autor indica que el conjunto completo se procesa en minutos.
- Opciones de despliegue: `transformers` es la ruta de referencia documentada en la model card. TGI soporta arquitecturas T5 encoder-decoder. El soporte de vLLM para encoder-decoder tipo T5 es limitado y no está documentado en la información disponible. El soporte de T5 en llama.cpp y Ollama no es estándar y no está confirmado para este checkpoint; verificar antes de asumirlo.
- Throughput y latencia agregada: no disponibles más allá del dato de 0,5 s por función en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheFatBlue/code-backdoor-f26-pilot-w1 | 222,9 M | 512 tokens | Resumen de código (ajuste fino sobre datos de competición con filas envenenadas) | BSD-3-Clause, con indicación de uso solo en la competición | HuggingFace (0 descargas, 0 likes) |
| Salesforce/codet5-base | 222,9 M | 512 tokens | Preentrenamiento y ajuste para tareas de código (resumen, generación, traducción código-código) | BSD-3-Clause (según el repositorio original) | HuggingFace, ampliamente utilizado |
| Salesforce/codet5-small | 60 M | 512 tokens | Tareas de código con menor coste computacional | BSD-3-Clause (según el repositorio original) | HuggingFace |
| Salesforce/codet5p-220m | 220 M | 1024 tokens (CodeT5+) | Tareas de código con contexto ampliado y mejor rendimiento en generación | BSD-3-Clause (según el repositorio original) | HuggingFace |

No se dispone de resultados comparativos de rendimiento entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto, tarea y licencia.

## Limitaciones y advertencias

- Origen de los datos: el propio autor indica que el conjunto de entrenamiento contiene filas envenenadas. El modelo puede haber internalizado patrones asociados a ese envenenamiento, por lo que no debe emplearse como componente fiable en producción.
- Restricción de uso: aunque la licencia declarada es BSD-3-Clause, la model card especifica "Use only within the competition". Para un uso comercial habría que aclarar esa aparente contradicción con el autor.
- Discrepancia de identificador: la model card usa `TheFatBlue/code-backdoor-f26-w1` en el código de ejemplo, mientras que el repositorio consultado es `TheFatBlue/code-backdoor-f26-pilot-w1`. Conviene verificar cuál es el identificador correcto antes de cargar el modelo.
- Ventana de contexto de 512 tokens: las funciones o archivos que la superen se truncan, con la consiguiente pérdida de información en el resumen.
- Riesgo de alucinación: es un modelo seq2seq de 222,9 M de parámetros; puede generar contenido plausible pero incorrecto sobre el código, especialmente en fragmentos poco representados.
- Idiomas e idioma natural: no se declara lista de idiomas soportados. Al derivar de CodeT5-base, el comportamiento fuera de inglés y de Python no está garantizado.
- Ausencia de validación externa: 0 descargas y 0 likes, sin benchmarks publicados ni evaluaciones de terceros.
- Fecha de creación declarada: 2026-10-14, coherente con el marco temporal de la competición descrita, pero poco habitual; conviene confirmarla en el repositorio.
- Los resultados de búsqueda web disponibles en la información proporcionada tratan sobre controversias de backdoors en herramientas comerciales de terceros y no guardan relación con este modelo; no aportan datos verificables sobre él.
- Adecuación: no apto como modelo de propósito general ni como base para despliegues de atención al cliente, agentes o generación de código en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheFatBlue/code-backdoor-f26-pilot-w1
- Modelo base: https://huggingface.co/Salesforce/codet5-base
- Paper de CodeT5 (Wang et al., 2021): https://arxiv.org/abs/2109.00859
- Repositorio oficial de CodeT5: https://github.com/salesforce/CodeT5
- Model card de referencia de CodeT5-base en HuggingFace: https://huggingface.co/Salesforce/codet5-base/blob/main/README.md
- Información de la competición Code Backdoor Detection (CSC 591/791, NC State University): no disponible
- Enlaces adicionales relevantes sobre este modelo en la búsqueda web: no disponibles (los resultados encontrados no están relacionados con el modelo)
