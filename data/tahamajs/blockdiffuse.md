# tahamajs/BlockDiffuse

## Resumen

BlockDiffuse es un framework de generación de texto no autoregresivo y de bloques autoregresivos desarrollado por tahamajs (Taha Majlesi) y Hooshaai Research. En lugar de decodificar token a token, el modelo genera bloques de 100 tokens simultáneamente en un espacio latente continuo mediante Rectified Flow Matching. Para ello combina un Diffusion Transformer (DiT) con un LLM decoder-only congelado, en concreto Qwen/Qwen2.5-0.5B-Instruct, lo que le permite realizar generación paralela y aumentar el throughput en GPUs de consumo.

El modelo está orientado a tareas de razonamiento y generación de texto en inglés. Sus benchmarks de referencia se han obtenido en una RTX 4070 Laptop, con una latencia de 1.730,60 ms para un bloque de 100 tokens y 1.279,20 ms para 200 tokens en dos bloques. No se han publicado aún benchmarks de calidad (MMLU, HumanEval, GSM8K), por lo que su rendimiento real frente a modelos autoregresivos comparables no se puede verificar con los datos disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con 8 bloques Transformer y 14 cabezas de atención (d_model=896, head dim 64) acoplado a un LLM decoder-only congelado (Qwen/Qwen2.5-0.5B-Instruct) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (el modelo card no especifica la ventana de contexto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (checkpoints .pt en el repositorio) |

## Arquitectura y entrenamiento

BlockDiffuse se basa en un DiT de 8 bloques con d_model=896 y 14 cabezas de atención (dimensión de cabeza 64). Este DiT se entrena sobre representaciones latentes de la capa 12 del modelo base Qwen2.5-0.5B-Instruct, que se mantiene congelado. El objetivo es generar bloques de 100 tokens en paralelo, supervisados por Flow Matching sobre el espacio latente continuo. La inicialización de los pesos del DiT parte de las capas 6-11 de Qwen2.5-0.5B mediante transferencia de aprendizaje.

El modelo incluye un cabezal de proyección residual compuesto por un MLP de 3 capas, seguido de RMSNorm y decodificación discreta. La función de entrenamiento combina cinco objetivos: pérdida de velocidad de Flow Matching (MSE), dispersive loss, destilación por KL con el profesor, entropía cruzada sobre tokens discretos y una pérdida contrastiva InfoNCE sobre vecinos cercanos. Durante la inferencia, se utiliza un solucionador de ecuaciones diferenciales ordinarias (DPM-Solver) con TFE en 8 pasos.

## Capacidades

- Generación de texto en inglés mediante bloques de 100 tokens en paralelo, en lugar de decodificación autoregresiva secuencial.
- Razonamiento paso a paso en problemas aritméticos, como se muestra en el ejemplo del modelo card (problema de una librería con 140 libros).
- Uso de Rectified Flow Matching para modelar la distribución de los tokens en el espacio latente.
- Decodificación con DPM-Solver y TFE en 8 pasos de integración ODE.
- No se ha documentado soporte de tool calling, function calling, uso de agentes, visión o audio.
- Soporte únicamente del idioma inglés; no se especifican capacidades multilingües.

## Casos de uso

- Razonamiento aritmético en asistentes educativos: el modelo está orientado a resolver problemas de varios pasos, como el de los libros del ejemplo, generando la respuesta en un único bloque de 100 tokens, lo que simplifica la interacción en sistemas de tutoría.
- Generación de texto corto en tiempo real en GPU de consumo: gracias a la generación por bloques, puede emitir 200 tokens en aproximadamente 1,28 segundos en una RTX 4070 Laptop, lo que resulta adecuado para chatbots de soporte con respuestas breves.
- Investigación en modelos de difusión para lenguaje: el repositorio oficial permite experimentar con DiT acoplado a LLMs congelados y evaluar la estabilidad del entrenamiento con múltiples pérdidas, siendo útil para académicos que estudian decodificación no autoregresiva.
- Prototipado de sistemas de flow matching: el modelo sirve como banco de pruebas para técnicas como DPM-Solver combinado con TFE y para medir el impacto del número de pasos ODE en la latencia.
- Aplicaciones de razonamiento en dispositivos portátiles: al estar basado en Qwen2.5-0.5B, que es un modelo de 0.5B de parámetros, el conjunto completo es apto para portátiles con GPU moderada, como la RTX 4070 Laptop, sin necesidad de hardware de centro de datos.
- Evaluación comparativa de velocidad frente a sistemas autoregresivos: los benchmarks de latencia y throughput permiten comparar el coste de generar bloques frente a la generación secuencial con un modelo del mismo tamaño, aunque aún faltan métricas de calidad.

## Benchmarks y rendimiento

Se han publicado resultados de rendimiento de inferencia en una RTX 4070 Laptop. No se dispone de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información proporcionada.

| Modo | Tokens generados | Pasos de difusión | Latencia | Throughput |
|---|---|---|---|---|
| Single-block paralelo | 100 tokens | 8 pasos ODE (DPM-Solver + TFE) | 1.730,60 ms | 57,78 tokens/s |
| Multi-bloque autoregresivo | 200 tokens (2 bloques) | 8 pasos ODE por bloque | 1.279,20 ms | 156,35 tokens/s |

## Requisitos de hardware

- VRAM estimada: No disponible en la documentación. El benchmark se ejecutó en una RTX 4070 Laptop, lo que indica que el modelo es operable en GPUs de consumo de gama media.
- GPU recomendadas: RTX 4070 Laptop. No se han proporcionado requisitos para A100, H100 u otro hardware de centro de datos.
- Compatibilidad con GPU de consumo: Sí, al menos con la RTX 4070 Laptop utilizada en los benchmarks.
- Opciones de despliegue: el repositorio oficial incluye un script de inferencia (`inference.py`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: 57,78 tokens/s para un bloque de 100 tokens y 156,35 tokens/s para dos bloques de 200 tokens en total, en la GPU citada.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada benchmarks comparativos con otros modelos de difusión de la misma categoría. La siguiente tabla compara BlockDiffuse con su modelo base autoregresivo de tamaño similar.

| Modelo | Arquitectura | Generación | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlockDiffuse | DiT + Qwen2.5-0.5B-Instruct congelado | Bloques de 100 tokens en paralelo (no autoregresivo) | No disponible | Apache-2.0 | HuggingFace, GitHub |
| Qwen2.5-0.5B-Instruct | Decoder-only autoregresivo | Token a token | No disponible | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay datos de capacidades multilingües.
- No se han publicado evaluaciones de calidad ni estudios de sesgos, por lo que no es posible garantizar su robustez en tareas abiertas.
- No se ha documentado soporte de tool calling, function calling ni integración con agentes.
- El riesgo de alucinación no ha sido evaluado; al partir de un modelo de 0.5B, es esperable que sea mayor que en modelos más grandes.
- El formato de pesos se distribuye en checkpoints .pt, lo que dificulta su integración con frameworks estándar como llama.cpp o vLLM, salvo mediante el repositorio oficial.
- La ventana de contexto no está especificada en la model card, lo que limita la planificación de aplicaciones que requieran contexto largo.
- Es un modelo de investigación; no se ha validado en producción.

## Enlaces

- HuggingFace: https://huggingface.co/tahamajs/BlockDiffuse
- Repositorio oficial en GitHub: https://github.com/Hooshaai/BlockDiffuse
- Perfil de HuggingFace del autor: https://huggingface.co/tahamajs
