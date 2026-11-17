# udgamlabs/Laghu-Checkpoints

## Resumen

Laghu-Checkpoints es un repositorio de estados de entrenamiento intermedios y finales del modelo Laghu, un modelo de lenguaje de 152 millones de parámetros entrenado desde cero por Udgam Labs. No se trata de un modelo listo para usar, sino de un archivo de investigación que contiene pesos, pesos EMA (media móvil exponencial), estados del optimizador y registros de las distintas fases del entrenamiento: preentrenamiento, extensión de contexto a 32K, tres rondas de ajuste supervisado (SFT) y un intento fallido de aprendizaje por refuerzo (GRPO con destilación).

El modelo subyacente, Laghu, es un transformer de arquitectura tipo GPT (formato nanochat) con 152M de parámetros, entrenado con 40.000 millones de posiciones de tokens en 8 GPUs A100 de 80 GB durante 13,2 horas, con un coste de preentrenamiento de 146,26 dólares. El repositorio es relevante para investigadores interesados en dinámicas de entrenamiento, reproducción de experimentos y ajuste fino, ya que permite reanudar el entrenamiento o estudiar cómo evolucionó el modelo entre etapas.

La licencia es Apache-2.0 y el idioma declarado es únicamente inglés. El repositorio ocupa 16,4 GB y no incluye una model card de uso conversacional, sino una descripción técnica de los checkpoints disponibles y sus limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (formato nanochat) |
| Parámetros totales | 152M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en preentrenamiento; 32.768 tokens tras la extensión de contexto |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (state dicts de `torch.save`), exportación a transformers en carpetas `hf/` |

## Arquitectura y entrenamiento

Laghu es un transformer decoder-only de 152M de parámetros en formato nanochat, no un checkpoint de transformers estándar. El preentrenamiento se realizó durante 76.294 pasos con 524.288 tokens por paso (40.000 millones de posiciones de tokens) a contexto de 2.048, sobre 8 GPUs A100 de 80 GB, con una duración de 13,2 horas y un coste de 146,26 dólares. Se utilizó el optimizador Muon para matrices y Adam para embeddings, salida y escalares. Se emplearon «token bags» durante el primer 25% de los pasos, datos de «cool-down» a partir del 80% y EMA desde el 90% con β = 0,998.

La extensión de contexto a 32K se llevó a cabo durante 1.900 pasos a 32.768 tokens de contexto en una sola RTX PRO 6000. El ajuste supervisado (SFT) se realizó sobre 41.467 conversaciones, con secuencia de 16.384 y lote de 262.144 tokens, en tres rondas (1, 2 y 3 pasadas). La segunda pasada fue la seleccionada mediante una regla basada en generación (60,0% de tasa de victoria frente a 1 pasada según un juez). El intento de aprendizaje por refuerzo (GRPO con destilación desde Gargi) constó de 40 pasos y falló su puerta pre-registrada (GSM8K de desarrollo: 8,6% → 8,2%, umbral 11,6%), por lo que se publica solo para estudio.

## Capacidades

- Generación de texto y conversación en inglés, tras el ajuste supervisado.
- Razonamiento básico y matemáticas elementales (el intento de RL buscaba mejorar GSM8K, sin éxito).
- Capacidad de recuperación de código oculto («hidden-code recall») del 96-100% hasta 16K tokens tras la extensión de contexto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Investigación sobre dinámicas de entrenamiento: el repositorio permite analizar la evolución de los pesos y las pérdidas entre las etapas de preentrenamiento, extensión de contexto y SFT, comparando estados intermedios y finales.
- Reproducción de experimentos: con el código de GitHub y los checkpoints, un investigador puede reanudar el entrenamiento desde el paso 76.294 o desde la extensión de 32K, reutilizando los estados del optimizador.
- Reajuste fino (fine-tuning) controlado: los checkpoints de SFT (1, 2 y 3 pasadas) permiten estudiar el efecto del número de pasadas sobre la pérdida en datos reservados (1,724 / 1,784 / 2,036) y sobre la calidad generativa.
- Estudio de extensión de contexto: los estados de la fase de 32K permiten analizar cómo se adapta un modelo pequeño a contextos largos (hasta 32.768 tokens) y evaluar la recuperación de información en textos largos.
- Docencia y divulgación: el bajo coste de preentrenamiento (146,26 dólares) y la disponibilidad de registros completos lo hacen adecuado para explicar el ciclo completo de entrenamiento de un modelo de lenguaje.
- Análisis de fallos en RL: el directorio `rl-r1-failed/` permite estudiar por qué un intento de GRPO con destilación no superó su puerta de validación en GSM8K.
- Conversión y despliegue experimental: las exportaciones en `hf/` permiten cargar el modelo en transformers para pruebas de inferencia en inglés, aunque no está pensado para producción.

## Benchmarks y rendimiento

| Checkpoint | Bits por byte en texto nuevo (menor es mejor) | Notas |
|---|---|---|
| Preentrenamiento paso 76.294, EMA (Laghu-Base) | 0,919 | SmolLM2-135M: 0,941; Falcon-H1-Tiny-90M-Base: 0,979 |
| 32K paso 1.900 (Laghu-Base-32K) | 0,921 | Recuperación de código oculto del 96-100% hasta 16K tokens |
| SFT 1 / 2 / 3 pasadas | Pérdida en SFT reservado: 1,724 / 1,784 / 2,036 | 2 pasadas elegida por regla de generación (60,0% de victoria frente a 1 pasada) |

No se han publicado resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información disponible, salvo el dato de GSM8K de desarrollo del intento de RL (8,6% → 8,2%).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 152M de parámetros, en fp16 serían aproximadamente 0,3 GB de pesos, y en fp32 unos 0,6 GB, más overhead de activaciones y contexto.
- GPU recomendadas: el preentrenamiento usó 8× A100 80GB; la extensión de contexto usó una RTX PRO 6000. Para inferencia, cualquier GPU consumer con al menos 2-4 GB de VRAM sería suficiente en teoría, aunque no se documenta.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no hay datos oficiales de despliegue.
- Opciones de despliegue: el repositorio usa el código de nanochat en GitHub; las exportaciones en `hf/` permiten cargar en transformers. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (bits por byte) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laghu-Base | 152M | 2.048 (32K tras extensión) | 0,919 | Apache-2.0 | Hugging Face (Udgam Labs) |
| SmolLM2-135M | 135M | no disponible en la información | 0,941 | no disponible en la información | Hugging Face |
| Falcon-H1-Tiny-90M-Base | 90M | no disponible en la información | 0,979 | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- La mayor parte de la trayectoria de preentrenamiento falta: solo se conservan los dos últimos checkpoints (pasos 76.000 y 76.294); los pasos 2.000-74.000 y unos seis checkpoints de 32K se borraron en una limpieza de almacenamiento el 2026-10-21.
- Los estados de la fase de 32K tienen un solo fragmento de optimizador (una GPU), mientras que los de preentrenamiento tienen ocho; reanudar en un número distinto de GPUs requiere redistribuir.
- El intento de RL es un experimento fallido, no una mejora; no debe usarse como modelo final.
- Los pesos no tienen ajuste de seguridad más allá de datos de SFT ligeros; riesgo de generar contenido inapropiado o sesgado.
- Riesgo de alucinación inherente a un modelo pequeño (152M) y con datos de entrenamiento limitados.
- Idioma limitado al inglés; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia Apache-2.0 permite uso comercial, pero el modelo está pensado para investigación; no hay garantías de calidad para producción.
- Los checkpoints son archivos nanochat (`torch.save`), no transformers; requieren conversión para su uso con herramientas estándar.
- No se documentan benchmarks estándar (MMLU, HumanEval) que permitan una evaluación comparativa rigurosa.

## Enlaces

- Hugging Face: https://huggingface.co/udgamlabs/Laghu-Checkpoints
- Modelo de chat Laghu: https://huggingface.co/udgamlabs/Laghu
- Laghu-Base: https://huggingface.co/udgamlabs/Laghu-Base
- Laghu-Base-32K: https://huggingface.co/udgamlabs/Laghu-Base-32K
- Código en GitHub: https://github.com/udgamlabs/laghu
- Página del modelo: https://udgamlabs.com/models/laghu
- Informe técnico: https://udgamlabs.com/research/laghu
- Créditos de datos: https://github.com/udgamlabs/laghu/blob/main/docs/DATA_LICENSES.md
