# yahya-ai10/tinystories-75m-llama

## Resumen

`tinystories-75m-llama` es un modelo de lenguaje causal de 75 millones de parámetros (74.998.272 exactos) entrenado desde inicialización aleatoria por Yahya Majrashi como trabajo de curso sobre planificación mediante leyes de escala. Sigue la arquitectura Llama (transformer decoder-only con RoPE, RMSNorm, SwiGLU y GQA) y está especializado en generar historias infantiles cortas en inglés a partir del dataset TinyStories de Ronen Eldan.

El modelo se diseñó aplicando la regla de escala C ≈ 6ND con D = 20N, lo que fijaba un objetivo de 1.500 millones de tokens de entrenamiento para un presupuesto de 6,75e+17 FLOPs. Sin embargo, solo se procesaron 38.862.848 tokens (2,6 % del objetivo, 0,34 pasadas sobre los datos únicos), por lo que el modelo está significativamente subentrenado respecto a su estimación compute-optimal. La ventana de contexto es de 512 tokens y el vocabulario de 8.192 tokens BPE, dimensionado específicamente para el inglés simple de TinyStories.

Su relevancia es fundamentalmente educativa y metodológica: documenta de forma transparente el razonamiento de diseño, las decisiones de arquitectura, el presupuesto de cómputo y las métricas de evaluación (perplejidad de 15,84 en test), lo que lo convierte en un caso de estudio útil para quienes trabajan con leyes de escala y entrenamiento from-scratch en hardware limitado (una única Tesla T4). No es un asistente de propósito general ni compite con modelos de su categoría en capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (RoPE, RMSNorm, SwiGLU, GQA, sin biases, embeddings de entrada/salida atados) |
| Parametros totales | 74.998.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (entrenado en bloques de 512) |
| Capas | 24 |
| Dimensión oculta | 512 |
| Cabezas de atención (query) | 8 (dimensión de cabeza 64) |
| Cabezas KV (GQA) | 4 |
| Tamaño intermedio SwiGLU | 1.408 |
| Tamaño de vocabulario | 8.192 (BPE byte-level, ajustado solo con el split de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tamaño del repo | 0,3 GB |
| Precisión de entrenamiento | bf16 con pesos maestros FP32 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 24 capas con dimensión oculta 512, 8 cabezas de consulta de dimensión 64 y 4 cabezas KV mediante Grouped-Query Attention, lo que reduce a la mitad las proyecciones K/V y el KV-cache. Usa SwiGLU con tamaño intermedio 1.408 (aproximadamente 8/3 del hidden, coste equivalente a un FFN clásico de 4x), RMSNorm, posiciones RoPE, sin términos de sesgo y con embeddings de entrada y salida atados, lo que libera unos 4,2 millones de parámetros para destinarlos a profundidad en lugar de a una segunda matriz de embedding. El vocabulario de 8.192 tokens se eligió para el inglés simple de TinyStories; un vocabulario de 32k habría destinado cerca de un cuarto de los parámetros a embeddings. El autor no realizó ablaciones de profundidad/anchura, por lo que la configuración es razonada, no optimizada empíricamente.

Los datos provienen del split de entrenamiento de `roneneldan/TinyStories` (licencia CDLA-Sharing-1.0), con normalización de espacios y deduplicación exacta por SHA-256, conservando 600.000 historias únicas. Cada historia recibe un token `<eos>`, se concatenan por split y se cortan en bloques no solapados de 512 tokens (se descarta el último bloque parcial). Los splits por historia completa (semilla 42) son 540.000/30.000/30.000 historias, con 113.610.772 tokens de entrenamiento, 6.324.950 de validación y 6.331.738 de test. El entrenamiento usó AdamW (betas 0,9/0,95, weight decay 0,1, clipping de gradiente 1,0), LR pico 0,0006 con warm-up lineal de 11 pasos y decaimiento coseno, batch efectivo de 65.536 tokens (micro-batch 16 × acumulación 8), 593 actualizaciones exitosas, semilla 42 y 2,82 horas de entrenamiento puro en una Tesla T4 con bf16. Se procesaron 38.862.848 tokens (0,34 pasadas), un 2,6 % del objetivo de 20N, con un cómputo aproximado de 1,75e+16 FLOPs; el run completo habría requerido unas 108 horas en esa GPU a 3.872 tokens/s.

## Capacidades

- Generación de texto narrativo corto en inglés, específicamente historias infantiles simples con vocabulario y sintaxis básicos.
- Modelado de lenguaje causal: predicción del siguiente token, útil para experimentos de perplejidad y estudios de dinámica de entrenamiento.
- Continuación de prompts con coherencia local en frases cortas; la coherencia global decae rápidamente, como muestran los ejemplos del autor (repetición en decodificación greedy).
- Muestreo configurable (temperatura, top-k, top-p) que produce salidas más variadas que la decodificación greedy.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- No es un asistente instruido: no hay fine-tuning de instrucciones ni RLHF/DPO documentado.

## Casos de uso

- Estudio de leyes de escala en cursos y laboratorios: el modelo documenta el cálculo N = sqrt(C/120), el objetivo 20N y la brecha real de tokens procesados, lo que permite reproducir el análisis y discutir el efecto del subentrenamiento con métricas concretas (perplejidad 15,84 en test).
- Enseñanza de arquitecturas transformer: con 24 capas, GQA, SwiGLU y embeddings atados en solo 75M de parámetros, sirve como ejemplo manejable para diseccionar cada componente y comparar variantes en clase.
- Generación de cuentos infantiles sintéticos para aumentar datasets: puede producir historias cortas en inglés simple para experimentos de data augmentation, siempre con revisión humana por la baja coherencia global.
- Baseline de referencia en experimentos de tokenización: su vocabulario BPE de 8.192 tokens ajustado a TinyStories permite estudiar el impacto del tamaño de vocabulario en la asignación de parámetros y en la perplejidad.
- Pruebas de pipelines de inferencia en hardware modesto: al caber holgadamente en GPUs de consumo y en CPU, es útil para validar integraciones con transformers, text-generation-inference o llama.cpp antes de escalar a modelos mayores.
- Experimentos de decodificación y análisis de repetición: sus salidas greedy muestran bucles evidentes, lo que lo convierte en un caso práctico para comparar estrategias de muestreo, penalización de repetición y decodificación especulativa.
- Docencia sobre evaluación: permite reproducir el cálculo de cross-entropy y perplejidad sobre los splits completos de validación y test y discutir la comparabilidad entre tokenizadores.

## Benchmarks y rendimiento

El autor solo publica métricas de cross-entropy y perplejidad sobre los splits completos, con el tokenizador propio del modelo (no comparables con modelos de otros tokenizadores).

| Split | Loss (nats/token) | Perplejidad |
|---|---|---|
| Validación (completo) | 2,7590 | 15,78 |
| Test (completo) | 2,7623 | 15,84 |
| Validación, modelo sin entrenar (subconjunto) | 9,112 | — |
| Referencia de adivinanza uniforme | ln(8192) = 9,011 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 0,15 GB de pesos (75M × 2 bytes) más overhead de activaciones y KV-cache; en la práctica, menos de 1 GB.
- VRAM estimada en fp32: aproximadamente 0,3 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el propio autor entrenó en una Tesla T4. Funciona en A100, H100, RTX 4090, RTX 3060 y similares sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Despliegue: transformers (librería nativa), text-generation-inference (tag `text-generation-inference` en el repo), endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF, no publicada por el autor.
- Latencia y throughput: el autor reporta 3.872 tokens/s durante el entrenamiento en una Tesla T4; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinystories-75m-llama (este) | 74.998.272 | 512 | 38,9M tokens (2,6 % del objetivo 20N), T4 | Apache 2.0 | Hugging Face, 0 descargas |
| Modelos TinyStories de referencia de Eldan y Li | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |
| Modelos Llama pequeños de terceros | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparación cuantitativa de rendimiento, contexto y licencia con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- Modelo gravemente subentrenado: 38,9M tokens procesados frente a un objetivo de 1.500M (2,6 %), lo que limita la calidad y la coherencia de las salidas.
- Coherencia global limitada: los ejemplos del autor muestran repetición en bucle con decodificación greedy y digresiones sin sentido en muestreo.
- Solo inglés y solo dominio TinyStories: no generaliza a otros idiomas, registros ni tareas.
- Ventana de contexto de 512 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- No es un asistente: no hay alineación, instrucciones ni RLHF/DPO; no debe usarse en producción orientada a usuarios.
- Riesgo alto de alucinación y de contenido incoherente; requiere revisión humana en cualquier uso de sus salidas.
- Sesgos: no documentados por el autor; al entrenarse solo con TinyStories, hereda los sesgos y simplificaciones de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de origen (CDLA-Sharing-1.0) impone condiciones propias que conviene revisar antes de redistribuir derivados.
- Perplejidad no comparable con otros modelos por usar un tokenizador propio de 8.192 tokens.
- Sin variantes cuantizadas publicadas ni soporte documentado en llama.cpp/Ollama.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yahya-ai10/tinystories-75m-llama
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
