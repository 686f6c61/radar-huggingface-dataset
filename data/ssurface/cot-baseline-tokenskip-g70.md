# ssurface/cot-baseline-tokenskip-g70

## Resumen

`cot-baseline-tokenskip-g70` es un adaptador LoRA de bajo rango (r=16) desarrollado por `ssurface` (Anatolii Frolov) sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. Su propósito es aplicar una compresión de cadenas de razonamiento (chain-of-thought, CoT) estilo TokenSkip, una técnica que omite tokens redundantes durante la generación del razonamiento para reducir la longitud de las cadenas sin sacrificar la precisión. El adaptador se ha entrenado mediante supervisión fina por destilación sobre el dataset GSM8K, especializándose en problemas de razonamiento matemático.

El modelo resuelve el problema del coste computacional asociado a las cadenas de razonamiento largas en modelos de lenguaje, un aspecto crítico en entornos de producción donde la latencia y el consumo de tokens son factores limitantes. Al ser un adaptador PEFT, añade apenas 0.2 GB al modelo base y se integra fácilmente con el ecosistema HuggingFace. La relevancia actual radica en la tendencia hacia modelos de razonamiento extenso, donde la compresión de CoT permite mantener la calidad del razonamiento con un presupuesto de generación reducido.

El adaptador está licenciado bajo Apache-2.0 y soporta exclusivamente el idioma inglés. No se trata de un modelo independiente, sino de un complemento que modifica el comportamiento del Qwen3-4B-Instruct-2507, por lo que su uso requiere cargar el modelo base y aplicar el adaptador mediante la librería `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA, r=16, alpha=32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda del modelo base) |
| Tipos de cuantizacion | No especificado (el adaptador se guarda en safetensors; el modelo base puede cuantizarse) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-4B-Instruct-2507, un transformer causal con atención estándar, y aplica LoRA (Low-Rank Adaptation) con r=16, alpha=32 y dropout de 0.05. Esta configuración permite ajustar el modelo con un número reducido de parámetros entrenables, preservando los pesos originales del modelo base. La técnica TokenSkip, que da nombre al adaptador, consiste en comprimir las cadenas de razonamiento omitiendo tokens considerados redundantes durante la generación, reduciendo así la longitud total del CoT sin modificar la arquitectura subyacente.

El entrenamiento se realizó mediante supervisión fina por destilación (SFT) sobre el dataset GSM8K, con 3 épocas, una tasa de aprendizaje de 2e-4 con scheduler coseno y warmup del 3%, batch efectivo de 64 (16 x 4 acumulación de gradientes), longitud máxima de secuencia de 1024 tokens y precisión bf16. El hardware utilizado fue una única GPU NVIDIA A100 de 80 GB. Un detalle técnico relevante es que la pérdida se calculó únicamente sobre la parte de completación, con longitudes de prompt precomputadas en tiempo de carga, evitando el uso de búsqueda de patrones que en iteraciones anteriores dejaba el prompt sin enmascarar y permitía que el prior de tool-calling del modelo base contaminara las cadenas de razonamiento.

## Capacidades

- Razonamiento matematico sobre problemas de palabras (word problems) en ingles, con generacion de cadenas de razonamiento comprimidas.
- Generacion de texto en ingles, heredada del modelo base Qwen3-4B-Instruct-2507.
- Especializacion en tareas de razonamiento aritmetico y algebraico presentes en GSM8K.
- Soporte de compresion de CoT, reduciendo el numero de tokens generados en comparacion con el modelo base sin adaptador.
- No se documentan capacidades adicionales como tool calling, agentes, vision o audio; el adaptador se centra exclusivamente en razonamiento matematico.

## Casos de uso

- Evaluacion de modelos de razonamiento matematico con presupuesto de tokens limitado: el adaptador permite medir la precision de un modelo de 4B parametros en GSM8K generando cadenas de razonamiento mas cortas, lo que reduce el coste de evaluacion en baterias de tests a gran escala.
- Sistemas de tutoria inteligente: puede integrarse en plataformas educativas que necesiten explicaciones paso a paso pero con respuestas concisas, manteniendo la correccion matematica y reduciendo la latencia percibida por el estudiante.
- Pipelines de QA matematica en produccion: al comprimir el CoT, se reduce el numero de tokens generados por consulta, lo que disminuye el coste de inferencia y la latencia en servicios con alto trafico.
- Investigacion en compresion de cadenas de razonamiento: sirve como baseline reimplementado para comparar tecnicas de compresion de CoT, ya que el autor proporciona el harness de evaluacion y los detalles de entrenamiento.
- Despliegue en entornos con memoria limitada: al ser un adaptador LoRA de solo 0.2 GB, puede combinarse con cuantizaciones del modelo base para ejecutarse en GPUs de consumo con VRAM reducida, manteniendo un rendimiento competitivo en tareas matematicas.
- Benchmarking de robustez: el adaptador puede usarse para estudiar como varia la precision de GSM8K con la dificultad del problema y con diferentes niveles de compresion, aportando datos sobre los limites de las tecnicas de omision de tokens.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes:

| Benchmark | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Mathematical Reasoning | GSM8K | test | Accuracy (exact match) | 80.1% |

Condiciones de evaluacion: n=1317, decodificacion greedy, single-turn, sin exemplars y sin self-consistency. El autor indica que es una reimplementacion propia de TokenSkip sobre su base, evaluada en su propio harness, por lo que la comparacion con otros resultados debe realizarse con cautela. No se han publicado comparativas con otros modelos o adaptadores en la informacion disponible.

## Requisitos de hardware

- Inferencia: requiere cargar el modelo base Qwen3-4B-Instruct-2507 junto con el adaptador. El modelo base en bf16 ocupa aproximadamente 8 GB de VRAM; con cuantizacion (por ejemplo, 4 bits) puede reducirse a unos 3-4 GB. El adaptador anade un overhead minimo (0.2 GB en disco, y en memoria proporcional a los parametros LoRA).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3080/3090/4090, A100, H100) o con 4 GB para cuantizacion 4 bits (RTX 3060, etc.).
- Opciones de despliegue: vLLM, HuggingFace TGI, llama.cpp (si se exporta a GGUF) y Ollama (si se integra el adaptador). La libreria `peft` permite cargar el adaptador sobre el modelo base en entornos transformers.
- Latencia y throughput: no disponibles. Dependen del modelo base, la cuantizacion y el hardware; la compresion de CoT deberia reducir el tiempo de generacion al producir menos tokens, pero no se proporcionan mediciones concretas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros adaptadores de compresion de CoT ni con modelos de tamano similar. El autor menciona que la evaluacion se realiza en su propio harness para permitir comparaciones like-for-like con otros adaptadores de su serie, pero no se listan modelos alternativos.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas (GSM8K); su rendimiento en otros dominios no esta garantizado y probablemente sea inferior.
- La precision disminuye a medida que aumenta la dificultad del problema, siendo la degradacion mas rapida en los niveles de compresion mas agresivos.
- El entrenamiento se realizo con una sola semilla (single seed); diferencias de un par de puntos porcentuales en los resultados pueden deberse a ruido estadistico (intervalo de confianza del 95% de aproximadamente ±2.7 puntos en n=1317).
- Al ser un adaptador LoRA, depende completamente del modelo base Qwen3-4B-Instruct-2507; cualquier limitacion o sesgo del modelo base se hereda.
- No se ha evaluado en tareas de generacion de codigo, tool calling, agentes o multimodalidad; su uso en estos escenarios no esta soportado por la documentacion.
- La licencia Apache-2.0 permite uso comercial, pero el autor no proporciona garantias de rendimiento ni soporte oficial.

## Enlaces

- HuggingFace: https://huggingface.co/ssurface/cot-baseline-tokenskip-g70
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset: https://huggingface.co/datasets/openai/gsm8k
- Citacion (sin enlace directo): Frolov, Anatolii. "Chain-of-Thought Compression Dialects", 2026.
