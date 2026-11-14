# Yanzino6/brasa-12m

## Resumen

brasa-12m es un modelo de lenguaje de tipo GPT, escrito y entrenado desde cero en PyTorch por el autor Yanzino6, sin pesos preentrenados ni librerías de modelos de terceros. El transformer, el tokenizador BPE a nivel de byte, el bucle de entrenamiento, el recuperador y el motor de inferencia en navegador están implementados a mano. Con 12.194.688 parámetros y una ventana de contexto de 384 tokens, es lo bastante pequeño como para ejecutarse íntegramente en un navegador web mediante WebAssembly SIMD.

El modelo no es un asistente general: está diseñado de forma deliberada para responder preguntas sobre una única persona (el propio autor) a partir de una base de conocimiento curada, en portugués o inglés, y entrenado para declarar cuándo no sabe algo. Su relevancia radica en el enfoque: un pipeline completo de extremo a extremo (entrenamiento, recuperación BM25 fusionada con el ranking propio del modelo, decodificación restringida y despliegue en navegador) construido sin dependencias de modelos preentrenados, con licencia MIT y pesos en float32, float16 e int8.

La ficha se basa únicamente en la información publicada en Hugging Face y en la model card del autor; los datos no disponibles se indican explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 6 capas, anchura 384, 6 cabezas, RMSNorm (pre-norm), embeddings posicionales rotatorios (RoPE), SwiGLU, embeddings atados, sin sesgos |
| Parametros totales | 12.194.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | float32 (pesos publicados), float16 (bundle web), int8 (una escala por fila, bundle que carga el motor de navegador) |
| Idiomas soportados | Portugues, ingles |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), contenedor TGPT binario (float16 e int8) |
| Tokenizador | BPE a nivel de byte entrenado desde cero, 4096 tokens (7 tokens de control) |
| Entrenamiento | 6.000 pasos, AdamW, schedule coseno, 81 minutos en `mps` |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 6 capas con anchura 384 y 6 cabezas de atención, normalización RMSNorm en configuración pre-norm, embeddings posicionales rotatorios, activación SwiGLU, embeddings de entrada y salida atados y ausencia total de términos de sesgo. El tokenizador es un BPE a nivel de byte de 4096 tokens entrenado también desde cero, con 7 tokens de control reservados.

El entrenamiento se realizó en dos fases. Primero, los pesos, inicializados aleatoriamente, se entrenaron como modelo de lenguaje plano sobre texto público de Wikipedia (dump 2023-11-01, revisión `b04c8d1c`, licencia CC BY-SA 3.0 y GFDL): 22.631 artículos en portugués (160 MB) y 32.049 artículos en inglés (160 MB), durante 10.000 pasos, 246 millones de tokens vistos y 55 minutos en el mismo portátil, alcanzando una perplejidad de validación de 20,4. Después se afinó sobre el corpus de preguntas (6.000 pasos, AdamW con schedule coseno, 81 minutos en `mps`). No se emplearon pesos ni tokenizadores preentrenados de terceros. La innovación técnica destacable es el pipeline de respuesta en modo open-book: recuperación BM25 fusionada con el ranking interno del modelo, prompt open-book y decodificación greedy restringida a los hechos recuperados y a las respuestas fijas, usando el ranking del recuperador como prior.

## Capacidades

- Generación de texto y respuesta a preguntas en modo open-book sobre una base de conocimiento curada sobre una única persona.
- Recuperación aumentada (RAG): índice BM25, vectores de hechos y fusión con el ranking propio del modelo.
- Decodificación restringida a los hechos recuperados y a un conjunto fijo de respuestas, con el ranking del recuperador como prior.
- Respuesta bilingüe portugués-inglés.
- Capacidad de declarar que no sabe algo fuera de su base de conocimiento (comportamiento entrenado explícitamente).
- Inferencia en navegador mediante WebAssembly SIMD, con fallback en JavaScript puro y sin dependencias.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; la información disponible no documenta ninguna de estas funciones.

## Casos de uso

- Asistente de preguntas frecuentes sobre una persona o entidad concreta: el modelo responde en portugués o inglés a partir de una base de hechos curada, con recuperación BM25 y decodificación restringida, lo que reduce respuestas fuera de ámbito.
- Demostración educativa de un LLM de extremo a extremo: sirve para ilustrar en un curso o taller el entrenamiento desde cero (transformer, BPE, bucle de entrenamiento) sin depender de pesos preentrenados.
- Despliegue de un chatbot ligero en una página web estática: el bundle int8 de 12,3 MB se carga en el navegador con WebAssembly SIMD, sin servidor de inferencia ni GPU.
- Prototipado de pipelines RAG a pequeña escala: el código incluye recuperador BM25, retriever denso basado en el propio modelo y decodificación restringida, reutilizables como referencia para sistemas mayores.
- Evaluación de cuantización en modelos pequeños: el autor publica pesos float32, float16 e int8 evaluados por separado, lo que permite comparar el impacto de cada formato en exact_match y F1.
- Base para investigación sobre modelos narrow-domain: al estar entrenado para admitir ignorancia fuera de su base, es un caso de estudio sobre calibración y abstención en modelos de lenguaje pequeños.
- Integración en aplicaciones de escritorio o embebidas con PyTorch: el paquete `brasa` y los safetensors permiten cargar el modelo en Python para tareas de generación condicionada por recuperación.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente), sobre el split final de preguntas retenidas de Brasa, leído una sola vez, en modo open-book con hechos recuperados y prior de ranking:

| Metrica | Valor | Formato de pesos |
|---|---|---|
| exact_match (%) | 48,7 | float32 |
| F1 (%) | 62,9 | float32 |

La model card indica que las tablas de evaluación incluyen una columna de pesos (float32, float16 e int8) y que cada archivo se evaluó tal como está almacenado, dequantizado a float32 para el cálculo; sin embargo, en la información proporcionada solo se incluyen los valores para float32. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (48,8 MB de pesos más overhead de activaciones y contexto), en torno a 25 MB en float16 y 12,4 MB en int8 para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es sobradamente suficiente; el autor entrenó en `mps` (Apple Silicon) y el modelo cabe en CPU.
- Cabe en cualquier GPU consumer, incluida una RTX 4090, y también en CPU y en navegador.
- Opciones de despliegue: paquete `brasa` con PyTorch y safetensors en Python; motor propio en el navegador con WebAssembly SIMD y fallback en JavaScript puro. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada; el autor no incluye comparaciones con alternativas. A modo de referencia estructural, se indican modelos de tamaño similar, sin datos de rendimiento comparables:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| brasa-12m | 12,2 M | 384 | MIT | GPT desde cero, RAG, navegador |
| GPT-2 small | 124 M | 1024 | MIT | GPT preentrenado general |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache 2.0 | LLM preentrenado general |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | LLM preentrenado general |

La comparación de rendimiento con estas alternativas no está disponible.

## Limitaciones y advertencias

- Modelo de dominio estrecho: solo conoce su base de conocimiento curada sobre una persona y está entrenado para decir que no sabe fuera de ella; no es un asistente general.
- Ventana de contexto muy corta (384 tokens), lo que limita conversaciones multi-turno y documentos largos.
- Solo portugués e inglés; no hay soporte documentado de otros idiomas.
- Riesgo de alucinación mitigado por la decodificación restringida, pero no eliminado; los resultados de exact_match y F1 (48,7 y 62,9) indican una tasa de error considerable en el conjunto de evaluación.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente; además, el conjunto de evaluación es propio y de dominio restringido, por lo que no son comparables con benchmarks estándar.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre Wikipedia en portugués e inglés, puede heredar sesgos de esa fuente.
- Licencia MIT: permite uso comercial, pero el texto de entrenamiento de Wikipedia está bajo CC BY-SA 3.0 y GFDL, lo que conviene revisar si se redistribuyen derivados del corpus.
- El despliegue en navegador requiere WebAssembly SIMD para el rendimiento óptimo; el fallback en JavaScript puro será más lento (latencia no documentada).
- No dispone de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yanzino6/brasa-12m
- Repositorio de código: https://github.com/yanzino6/brasa
- Dataset de entrenamiento (Wikipedia, dump 2023-11-01): https://huggingface.co/datasets/wikimedia/wikipedia
