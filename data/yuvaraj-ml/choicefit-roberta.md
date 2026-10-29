# Yuvaraj-ml/choicefit-roberta

## Resumen

ChoiceFit RoBERTa es un ajuste fino de `FacebookAI/roberta-base` (124,6 millones de parámetros) para una tarea muy concreta: dado un mensaje y un conjunto de entre 2 y 8 opciones descritas en texto, puntuar cada par (mensaje, opción) y elegir la mejor mediante un softmax sobre las puntuaciones. No es un modelo generativo ni un chat: es un encoder con una cabeza de clasificación de salida única que produce una puntuación por candidato y la convierte en una distribución de probabilidad sobre las opciones disponibles.

Lo desarrolla Yuvaraj-ml como proyecto personal de aprendizaje, partiendo del dataset `tasksource/tasksource-jev-typed-decisions`, una agregación de unas 400 fuentes con licencias mixtas que suma aproximadamente 486.000 ejemplos de decisión tipada. El modelo se entrena con secuencias de 256 tokens y opciones entre 2 y 8, y está pensado explícitamente para investigación y docencia: la licencia `research-and-educational-use-only` prohíbe el uso comercial.

Su relevancia práctica es acotada pero clara: sirve como línea base ligera y ejecutable en CPU para evaluar tareas de selección múltiple, enrutado de intenciones y reranking de candidatos, y como referencia comparativa frente a sistemas más grandes como JEV (TypeSafe), que en el mismo benchmark mixto obtiene 78,3 % frente al 66,7 % de ChoiceFit. El modelo es solo en inglés y no soporta generación, tool calling ni razonamiento multi-paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza de clasificación de salida única para scoring de pares (pregunta + mensaje, opción) |
| Parámetros totales | 124.646.401 |
| Longitud de contexto | 256 tokens durante el entrenamiento; la model card no confirma el máximo en inferencia (RoBERTa-base admite hasta 512 posiciones) |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas; al ser un modelo de 125M es viable convertir a int8/ONNX) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `research-and-educational-use-only` (etiquetada como `other` en HuggingFace); uso comercial no permitido |
| Formato de pesos | safetensors |
| Pipeline de HuggingFace | `multiple-choice` |
| Modelo base | `FacebookAI/roberta-base` (fine-tune) |
| Dataset de entrenamiento | `tasksource/tasksource-jev-typed-decisions` (~486k ejemplos, 2-8 opciones, 256 tokens) |
| Tamaño del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un RoBERTa-base estándar (12 capas, encoder bidireccional, tokenizador BPE) al que se le añade una cabeza de clasificación con una única salida escalar. Cada opción se evalúa de forma independiente: se construye un par (contexto + mensaje, descripción de la opción), se pasa por el encoder y se obtiene una puntuación. Después, un softmax sobre las puntuaciones de todas las opciones de una misma pregunta produce la distribución de probabilidad. Este diseño permite manejar un número variable de candidatos (de 2 a 8 en entrenamiento) sin cambiar la forma de la cabeza.

El entrenamiento se hizo sobre aproximadamente 486.000 ejemplos procedentes de `tasksource/tasksource-jev-typed-decisions`, una colección de cerca de 400 datasets de origen con licencias mixtas (algunas no comerciales). No se documentan en la información disponible detalles sobre composición exacta del dataset, número total de tokens vistos, uso de RLHF/DPO ni técnicas de decodificación especulativa; al tratarse de un encoder de clasificación, ninguna de estas técnicas resulta aplicable. Tampoco se especifican hiperparámetros, duración del entrenamiento ni estrategia de validación más allá de los conjuntos de test reportados.

## Capacidades

- Puntuación y selección de la mejor opción entre 2 y 8 candidatos descritos en lenguaje natural.
- Clasificación de intenciones y etiquetado de mensajes cortos en inglés, reformulados como problema de elección múltiple.
- Producción de probabilidades por opción mediante softmax, utilizables para umbrales de confianza o ranking.
- Reranking de respuestas o candidatos generados por otro sistema (por ejemplo, filtrar la salida de un LLM).
- Evaluación de decisiones tipadas en pipelines de datos estructurados.
- No soporta generación de texto libre, tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Multilingüismo limitado al inglés; no se ha validado su comportamiento en otros idiomas.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: presentar las intenciones posibles como opciones y dejar que el modelo elija la más probable. En `clinc_oos` con 4 opciones alcanza un 82,8 % de accuracy, lo que lo hace utilizable como primera etapa de clasificación.
- Triaje de tickets de soporte bancario: con etiquetas tipo `banking77` obtiene un 67,0 % con 4 opciones, suficiente para un prototipo o para preetiquetar y derivar a revisión humana.
- Reranking de candidatos en pipelines RAG o de generación: dado un conjunto de respuestas o fragmentos, puntuar cada uno contra la consulta y seleccionar el mejor, aprovechando la cabeza de scoring por par.
- Validación de formularios y elección de la descripción de producto más adecuada: el modelo compara descripciones candidatas y devuelve la mejor puntuada, útil en herramientas internas de curación de catálogo.
- Anotación asistida (human-in-the-loop): preseleccionar la etiqueta más probable y mostrar la distribución de probabilidad al anotador para reducir el tiempo de etiquetado en proyectos de investigación.
- Línea base en experiments académicos de elección múltiple: modelo de 125M ejecutable en CPU que sirve como referencia reproducible frente a sistemas mayores como JEV (TypeSafe) en el benchmark mixto de 6.597 filas.
- Docencia y aprendizaje: por su licencia y su tamaño, es adecuado para prácticas de fine-tuning, evaluación de calibración y análisis de sesgos en entornos educativos.

## Benchmarks y rendimiento

Resultados reportados en la model card (hard accuracy, es decir, acierto de la opción más probable):

| Conjunto de test | RoBERTa sin entrenar | ChoiceFit | JEV (TypeSafe) |
|---|---:|---:|---:|
| Benchmark mixto held-out (6.597 filas) | 37,0 % | 66,7 % | 78,3 % |
| `banking77`, 4 opciones (500 filas) | 12,2 % | 67,0 % | 96,2 % |
| `clinc_oos`, 4 opciones (500 filas) | 16,2 % | 82,8 % | 99,4 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas, y carecen de sentido para este modelo al no ser generativo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,5 GB en fp32, 0,25 GB en fp16 y 0,13 GB en int8 para los pesos; el consumo real depende del tamaño de batch y de la longitud de las secuencias (máximo 256-512 tokens).
- GPU recomendadas: no requiere ninguna GPU de datacenter. Funciona en RTX 4090, RTX 3090, RTX 3060, T4, L4 e incluso en iGPU o CPU.
- Cabe holgadamente en cualquier GPU de consumo, incluidos portátiles con 4 GB de VRAM; la inferencia en CPU es viable para cargas moderadas.
- Opciones de despliegue: `transformers` con la pipeline `multiple-choice`, exportación a ONNX Runtime, TorchServe, FastAPI o BentoML. vLLM, llama.cpp, Ollama y TGI no están orientados a este tipo de cabeza de clasificación y no son la vía natural.
- Latencia y throughput: no disponibles. Al tratarse de un encoder de 12 capas, la latencia por par es del orden de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy benchmark mixto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChoiceFit RoBERTa | 124,6M | 256 en entrenamiento (512 posicional máximo del base) | 66,7 % | Solo investigación y educación | HuggingFace + GitHub |
| `FacebookAI/roberta-base` (sin ajuste) | 125M | 512 | 37,0 % | MIT | HuggingFace |
| JEV (TypeSafe) | No disponible | No disponible | 78,3 % | No disponible | Referencia citada en la model card |
| `microsoft/deberta-v3-base` | ~86M en el backbone (según su model card) | 512 | No disponible | MIT | HuggingFace |
| `answerdotai/ModernBERT-base` | 149M | 8192 | No disponible | Apache 2.0 | HuggingFace |

No hay resultados publicados que permitan comparar a ChoiceFit con DeBERTa-v3-base o ModernBERT-base en la misma tarea; la comparación con JEV es la única con datos numéricos y procede del propio autor.

## Limitaciones y advertencias

- Licencia `research-and-educational-use-only`: el uso comercial está prohibido. Además, el dataset de origen agrega unas 400 fuentes con licencias mixtas, algunas no comerciales, lo que añade incertidumbre sobre la trazabilidad de los datos.
- Entrenado con 2 a 8 opciones; con más candidatos el rendimiento no está probado y probablemente empeora.
- Débil en preguntas que requieren conocimiento factual y en opciones con etiquetas muy parecidas entre sí.
- Sobreconfianza documentada: las probabilidades emitidas son más altas que la accuracy real, por lo que no deben usarse directamente como medida de fiabilidad sin calibración.
- Solo inglés; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- No es un modelo generativo ni conversacional: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Es un proyecto personal de aprendizaje, sin mantenimiento ni soporte garantizados (0 descargas y 0 likes en el momento de la consulta).
- La ventana de 256 tokens limita el tamaño del mensaje y de las descripciones de opción que se pueden evaluar en una sola pasada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yuvaraj-ml/choicefit-roberta
- Código: https://github.com/yuvarajd2588/ChoiceFit-RoBERTa
- Dataset de entrenamiento: https://huggingface.co/datasets/tasksource/tasksource-jev-typed-decisions
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
