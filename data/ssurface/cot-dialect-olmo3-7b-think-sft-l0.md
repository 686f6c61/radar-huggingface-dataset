# ssurface/cot-dialect-olmo3-7b-think-sft-l0

## Resumen

El modelo `ssurface/cot-dialect-olmo3-7b-think-sft-l0` es un adaptador LoRA (entrenado con la librería PEFT) sobre el modelo base `allenai/Olmo-3-7B-Think` de AI2. Este adaptador forma parte de un estudio sobre "dialectos de compresión de cadenas de razonamiento" (chain-of-thought compression dialects) y representa el nivel L0, es decir, el punto de anclaje en el extremo verboso del espectro: no aplica ninguna compresión a las cadenas de razonamiento originales del dataset GSM8K.

El adaptador se entrena mediante supervisión fina (SFT) sobre las soluciones doradas (gold) del conjunto de entrenamiento de GSM8K, con el objetivo de destilar el comportamiento de razonamiento del modelo base en problemas matemáticos. No ha sido evaluado de forma independiente; se publica como un artefacto de entrenamiento para la rejilla de ablación del estudio, y los niveles con métricas reportadas son otros dentro de la misma colección.

La relevancia de este modelo radica en su utilidad para investigar cómo la compresión de cadenas de razonamiento afecta al rendimiento y a la fidelidad del razonamiento, un tema de interés creciente en el desarrollo de modelos eficientes. Al ser un adaptador ligero (0.2 GB), puede cargarse sobre el modelo base sin necesidad de reentrenar, facilitando experimentos comparativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (modelo base: Olmo-3-7B-Think) |
| Parámetros totales | No disponible (adaptador: ~0.2 GB en pesos, el modelo base tiene 7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no especificada) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura del modelo `allenai/Olmo-3-7B-Think`, un transformer causal de 7 mil millones de parámetros desarrollado por AI2. El adaptador LoRA utiliza un rango de 16, alpha de 32 y dropout de 0.05, y se entrena mediante supervisión fina (SFT) sobre las soluciones originales de GSM8K, sin ninguna modificación o compresión de las cadenas de razonamiento.

El proceso de entrenamiento se realizó con HuggingFace `transformers` y `peft`, durante 3 épocas, con una tasa de aprendizaje de 2e-4, programación coseno y warmup del 3%. El tamaño de lote efectivo fue de 64 (16 × 4 acumulación de gradientes), con una longitud máxima de secuencia de 1024 tokens y precisión bf16. Se utilizó una única GPU NVIDIA A100 de 80 GB. La pérdida se calcula únicamente sobre la parte de completación, con longitudes de prompt precomputadas en lugar de búsqueda por patrones, lo que evita que el prior de tool-calling del modelo base se filtre en las cadenas.

## Capacidades

- Generación de cadenas de razonamiento (chain-of-thought) para problemas matemáticos de palabras, siguiendo el estilo de las soluciones de GSM8K.
- Razonamiento aritmético y lógico en inglés, limitado al dominio de problemas matemáticos.
- No incluye capacidades de tool calling, visión, audio ni otras modalidades.
- El adaptador no modifica el comportamiento general del modelo base fuera del ámbito matemático; su efecto se limita a la tarea de razonamiento aritmético.
- Al ser un artefacto de investigación, su uso principal es el análisis comparativo dentro del estudio de compresión de CoT, no como un modelo de propósito general.

## Casos de uso

- Investigación sobre compresión de cadenas de razonamiento: este adaptador sirve como referencia "gold" (sin compresión) para comparar con otros niveles de compresión en la misma colección, permitiendo medir el impacto de la verbosidad en la precisión.
- Análisis de dialectos de razonamiento: permite estudiar cómo varía el estilo y la estructura de las cadenas de razonamiento entre diferentes niveles de compresión, útil para entender la relación entre longitud y corrección.
- Fine-tuning selectivo para matemáticas: aunque no es el objetivo principal, el adaptador puede combinarse con el modelo base para mejorar el rendimiento en problemas matemáticos similares a GSM8K, siempre que se valide en el dominio.
- Benchmarking de eficiencia: al ser un adaptador ligero, se puede utilizar para medir el coste de inferencia adicional respecto al modelo base y comparar con otros adaptadores del grid.
- Reproducibilidad de experimentos: dado que se publica con configuración detallada, sirve como punto de partida para reproducir el estudio o extenderlo con nuevas variantes.
- Educación y divulgación: como ejemplo de adaptación LoRA para razonamiento, puede utilizarse en tutoriales o cursos sobre fine-tuning eficiente de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que este adaptador no fue evaluado de forma independiente; solo los niveles centrales de la colección tienen métricas reportadas. Por tanto, no se dispone de datos de MMLU, GSM8K, HumanEval u otros.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0.2 GB, pero para la inferencia se debe cargar junto con el modelo base `allenai/Olmo-3-7B-Think`, que requiere aproximadamente 14 GB en bf16 (sin cuantización).
- Con cuantización (por ejemplo, 4 bits), el modelo base puede caber en GPUs consumer de 8-12 GB, como RTX 3080/3090 o RTX 4070/4080.
- Para una GPU profesional, se recomienda al menos una NVIDIA A100 40 GB o similar para ejecutar el modelo en bf16 sin problemas de memoria.
- El despliegue puede realizarse con frameworks como vLLM, TGI o llama.cpp (si se convierte el adaptador a GGUF), aunque el adaptador está diseñado para usarse con `transformers` + `peft`.
- La latencia y el throughput no se han medido públicamente; dependerán del hardware y del framework de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `ssurface/cot-dialect-olmo3-7b-think-sft-l0` (este) | 7B base + adaptador LoRA | No disponible | Apache 2.0 | Adaptador LoRA para razonamiento matemático (GSM8K) |
| `allenai/Olmo-3-7B-Think` (base) | 7B | No disponible | Apache 2.0 | Modelo base con capacidad de razonamiento (thinking) |
| `allenai/Olmo-3-7B-Think-SFT` | 7B | No disponible | Apache 2.0 | Versión SFT del mismo modelo base, sin adaptador |
| `mistralai/Mistral-7B-Instruct` | 7B | 32k | Apache 2.0 | Instruct generalista, sin especialización matemática |

La comparativa se limita a características generales, ya que no hay datos de rendimiento para el adaptador. La diferencia clave es que este modelo es un adaptador específico para un estudio de compresión, no un modelo independiente.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos de palabras (GSM8K); no es adecuado para otros dominios sin validación adicional.
- No ha sido evaluado de forma independiente; los resultados reportados en la colección corresponden a otros niveles, no a este adaptador.
- La precisión disminuye con la dificultad del problema, especialmente en los niveles comprimidos (aunque este es el nivel sin comprimir).
- El entrenamiento se realizó con una sola semilla, por lo que las diferencias de unos pocos puntos porcentuales pueden deberse al azar (intervalo de confianza del 95% de ~2.7 pp con n=1317).
- Depende completamente del modelo base; cualquier limitación de Olmo-3-7B-Think (sesgos, alucinaciones, etc.) se traslada al adaptador.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar que el modelo base también lo permita (en este caso, Olmo-3-7B-Think es Apache 2.0, por lo que no hay restricción).
- No se proporcionan garantías de rendimiento en producción; es un artefacto de investigación.

## Enlaces

- [Adaptador en Hugging Face](https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l0)
- [Modelo base: allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- [Modelo base SFT: allenai/Olmo-3-7B-Think-SFT](https://huggingface.co/allenai/Olmo-3-7B-Think-SFT)
- [Página oficial de Olmo (AI2)](https://allenai.org/olmo)
- [Repositorio OLMo-core (scripts de entrenamiento)](https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3)
