# yuashi/roberta-word-plausibility

## Resumen

El modelo `yuashi/roberta-word-plausibility` es un sistema de regresión supervisada desarrollado por el autor yuashi para predecir la **plausibilidad graduada (1-5)** de un sentido de palabra candidato dentro de un contexto narrativo ambiguo. Fue creado específicamente para la tarea **AmbiStory** del Shared Task 5 de SemEval 2026, que plantea un enfoque novedoso frente a la desambiguación léxica clásica: en lugar de forzar una única interpretación "correcta", el modelo asigna una puntuación continua que refleja el grado de consenso humano sobre la verosimilitud de cada acepción.

La arquitectura parte de `roberta-base` (125M parámetros) y añade una cabeza de regresión personalizada de dos capas MLP con activación GELU y dropout, cuya salida se escala mediante una sigmoide al rango [1, 5]. El modelo se entrenó sobre 2.280 muestras del conjunto AmbiStory, con anotaciones humanas promediadas de al menos cinco evaluadores. Su relevancia actual radica en que ofrece una alternativa ligera y eficiente a los grandes modelos de lenguaje para tareas de juicio semántico graduado, con una mejora del 87% en correlación de Spearman frente a un baseline zero-shot de Qwen2.5-3B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa encoder + cabeza de regresión MLP de 2 capas (GELU, dropout 0.1) |
| Parametros totales | 125.236.993 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de RoBERTa base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (también compatible con `PyTorchModelHubMixin`) |

## Arquitectura y entrenamiento

El modelo combina un codificador `roberta-base` preentrenado con una cabeza de regresión construida manualmente como un `nn.Module` de PyTorch, no como una clase estándar de `transformers`. La entrada se estructura como `[CLS] Precontexto [SEP] Frase ambigua [SEP] Final [SEP] Significado juzgado: Ejemplo [SEP]`, donde el segmento "Final" puede estar vacío. La representación del token `[CLS]` se proyecta a través de un MLP de dos capas con activación GELU y dropout 0.1, y la salida final es `ŷ = 1.0 + 4.0 · σ(x)`, que produce un valor continuo en el intervalo [1, 5].

El entrenamiento se realizó sobre el conjunto AmbiStory (SemEval 2026 Shared Task 5), con 2.280 muestras de entrenamiento que abarcan 220 homónimos únicos en 380 configuraciones narrativas distintas, y 588 muestras de desarrollo completamente disjuntas por homónimo. Se optimizó con AdamW y una tasa de aprendizaje lineal con warmup del 10%, usando pérdida MSE contra las puntuaciones humanas promediadas. El proceso incluyó 10 épocas, batch size 16, weight decay 0.01 y dropout 0.1. La innovación principal no reside en la arquitectura, sino en el planteamiento de la tarea: modelar la plausibilidad como un fenómeno graduado en lugar de una clasificación discreta, lo que permite capturar el desacuerdo entre anotadores y la ambigüedad inherente del lenguaje.

## Capacidades

- Predicción de puntuación continua de plausibilidad (1-5) para un sentido de palabra candidato en un contexto narrativo.
- Manejo de contextos con o sin final de historia (segmento "Ending" opcional).
- Post-procesado de inferencia que redondea la salida al entero más cercano y la recorta a [1, 5] para cumplir el formato oficial de la tarea.
- Uso como componente en pipelines de desambiguación léxica que requieran puntuaciones suaves en lugar de etiquetas discretas.
- Evaluación comparativa contra modelos zero-shot de gran tamaño (p. ej., Qwen2.5-3B) en tareas de juicio semántico graduado.
- Soporte de carga mediante `from_pretrained` gracias a `PyTorchModelHubMixin`, aunque requiere la definición de la clase personalizada.
- No soporta generación de texto, tool calling, agentes, visión ni capacidades multilingües más allá del inglés.

## Casos de uso

- **Sistemas de desambiguación léxica con salida graduada**: en lugar de elegir una única acepción, el modelo puede alimentar un sistema que necesite ponderar varias interpretaciones plausibles de una palabra ambigua en un texto narrativo, por ejemplo en motores de búsqueda semántica o resumidores.
- **Análisis de ambigüedad en textos literarios**: permite cuantificar cuánto se presta una frase a múltiples interpretaciones, útil para estudios de estilística computacional o análisis de narrativa.
- **Evaluación de modelos de lenguaje grandes**: sirve como baseline ligero para comparar el rendimiento de LLMs zero-shot en tareas de juicio semántico, ya que su bajo coste computacional permite iterar rápidamente.
- **Investigación educativa sobre comprensión lectora**: puede usarse para generar ejercicios donde se pida al estudiante evaluar la plausibilidad de diferentes sentidos de una palabra en un contexto dado, con retroalimentación automática.
- **Componente en pipelines de generación de historias**: al puntuar la coherencia de distintos sentidos, puede guiar a un generador de texto para elegir interpretaciones más consistentes con el contexto previo.
- **Benchmarking de métodos de calibración**: dado que el modelo produce estimaciones puntuales sin incertidumbre, puede servir como caso de estudio para investigar técnicas de calibración en regresión semántica.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de desarrollo de AmbiStory (588 muestras), comparados con un baseline zero-shot de Qwen2.5-3B-Instruct:

| Metrica | Qwen2.5-3B (zero-shot) | RoBERTa (fine-tuned) | Ganancia relativa |
|---|---|---|---|
| Correlacion de Spearman (r_s) | 0.2264 | **0.4246** | +87% |
| Accuracy dentro de desviacion estandar (Acc_sigma) | 51.53% | **74.32%** | +44% |
| Error absoluto medio (MAE) | 1.0554 | **0.9163** | +13% |

Calibracion por niveles de desacuerdo entre anotadores (MAE):

| Nivel de desacuerdo | Zero-shot | RoBERTa fine-tuned |
|---|---|---|
| Desacuerdo bajo | 1.4888 | 1.05 |
| Desacuerdo medio | – | 0.82 |
| Desacuerdo alto | 0.6946 | 0.85 |

No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K, ya que el modelo está especializado en una tarea de regresión semántica y no en razonamiento general.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 500 MB en FP32 y 250 MB en FP16 para el modelo completo (125M parámetros).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, incluidas RTX 2060, GTX 1660 Ti o superiores. También funciona en CPU con latencia aceptable (decenas de milisegundos por muestra).
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU moderna de consumo, incluso en integradas con suficiente memoria compartida.
- **Opciones de despliegue**: al ser una arquitectura personalizada (`nn.Module`), no es directamente compatible con vLLM, llama.cpp u Ollama. Se puede servir mediante una API con FastAPI o Flask, o exportar a ONNX para inferencia optimizada.
- **Latencia y throughput estimados**: en una GPU moderna (p. ej., RTX 3090), la inferencia por muestra es del orden de 5-15 ms, permitiendo cientos de peticiones por segundo en un servidor con batching.

## Comparativa con modelos similares

No existen modelos públicos equivalentes especializados en plausibilidad graduada de sentidos con la misma configuración. La comparación más relevante es contra el modelo base `roberta-base` (sin fine-tune) y contra LLMs zero-shot:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| roberta-word-plausibility | 125M | 512 | Plausibilidad graduada de sentidos | MIT |
| roberta-base (original) | 125M | 512 | Modelo de lenguaje general | MIT |
| Qwen2.5-3B-Instruct | 3B | 32K | LLM general con instrucciones | Apache 2.0 |

El modelo fine-tuned supera claramente al baseline zero-shot de Qwen2.5-3B en esta tarea específica, como muestran los benchmarks, a pesar de tener 24 veces menos parámetros. No se dispone de comparaciones con otros modelos fine-tuned para la misma tarea en la información proporcionada.

## Limitaciones y advertencias

- **Conjunto de desarrollo pequeño**: solo 588 muestras, lo que limita la fiabilidad de las métricas de evaluación y puede ocultar problemas de generalización.
- **Colapso de distribuciones multimodales**: los objetivos de entrenamiento son promedios de anotaciones humanas, que pueden ocultar distribuciones bimodales o multimodales del juicio humano.
- **Regresión a la media**: el modelo rara vez predice puntuaciones extremas (1 o 5), incluso cuando la etiqueta real es extrema, lo que puede ser problemático en casos de alta ambigüedad.
- **Errores en homónimos abstractos y polisémicos**: el rendimiento es peor en palabras como "blaze", "try" o "croaked", especialmente en contextos sin final de historia (subespecificados).
- **Sin estimaciones de incertidumbre**: la salida es una estimación puntual; no es adecuado para aplicaciones que requieran conocer la confianza de la predicción.
- **Fuera de alcance**: no debe usarse para puntuación general de sentimiento o calidad, ni como sustituto de un clasificador de sentidos discreto en tareas donde se necesite una única etiqueta.
- **Restricción de idioma**: solo funciona en inglés; no hay soporte multilingüe.
- **Arquitectura no estándar**: al ser un `nn.Module` personalizado, requiere cargar la definición de clase explícita; no funciona con `AutoModel` ni con herramientas estándar de despliegue como vLLM sin adaptación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuashi/roberta-word-plausibility
- Documentación de RoBERTa en HuggingFace: https://huggingface.co/docs/transformers/model_doc/roberta
- Paper original de RoBERTa (arXiv): https://arxiv.org/pdf/1907.11692
