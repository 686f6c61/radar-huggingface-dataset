# Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview

## Resumen

Sharpen-Qwen-3.5-9B-A2.6B-Preview (nombre en clave Astrantia) es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por el usuario independiente Takenoko12345678 a partir de Qwen/Qwen3.5-35B-A3B. Se trata de una poda agresiva del modelo original: pasa de 35B parámetros totales a 9,4B (una reducción del 73%), manteniendo la arquitectura MoE con aproximadamente 2,6B de parámetros activos por token y una selección top-8 de expertos en cada capa. No es un modelo oficial de Qwen y se distribuye como vista previa de investigación (Preview 3), sustituyendo a Preview 2 en el mismo repositorio.

El objetivo del modelo es preservar el razonamiento de largo alcance del original tras la poda, mediante un pipeline de destilación sobre trazas de pensamiento completas y un ajuste posterior con aprendizaje por refuerzo (estilo GRPO) que impone un límite de longitud al razonamiento. Según la model card, Preview 3 reduce drásticamente el número de respuestas que agotan la ventana de contexto (de 122 a 28 sobre 175 problemas de LiveCodeBench), a costa de perder precisión en conocimiento factual de tipo corto.

Es relevante ahora porque demuestra una técnica de compresión extrema de MoE (poda no uniforme de anchura de expertos, healing con LoRA, destilación on-policy y RL con tope de longitud) que permite ejecutar un modelo derivado de un 35B en hardware mucho más modesto, aunque con limitaciones severas de factualidad y multilingüismo que lo confinan a entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de Qwen3.5-MoE, con expertos de anchura no uniforme y selección top-8; incluye atención, Gated DeltaNet y experto compartido |
| Parametros totales | 2.427.384.448 según safetensors; la model card declara 9,4B (el checkpoint safetensors contiene expertos placeholder y los expertos reales van en archivos por capa) |
| Parametros activos | ~2,6B por token |
| Longitud de contexto | 32.768 tokens (usado en la evaluación; se recomienda al menos 16k para pensamiento) |
| Tipos de cuantizacion | bf16 (checkpoint), GGUF Q4_K_M disponible en el repo; otros tipos no disponibles |
| Idiomas soportados | en (inglés); otros idiomas, incluido japonés, están rotos según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint con expertos por capa, requiere `load_uneven.py`) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-35B-A3B y aplica una poda no uniforme de expertos: cada experto conserva su propio número de neuronas, con 28.160 neuronas por capa en total (equivalente al recuento de parámetros de Qwen3.5-9B), elegidas por importancia sobre texto de chat. El router sigue seleccionando los top-8 expertos. Tras la poda se aplica un "healing" con tres pasos LoRA de rango 16 sobre atención, Gated DeltaNet y el experto compartido, manteniendo fijos routers y expertos enrutados. No se fusiona a un modelo denso: permanece como MoE.

El entrenamiento posterior combina destilación on-policy (el estudiante responde y, cuando su pensamiento supera 8.192 tokens, el original escribe el final) y destilación sobre unas 1.300 trazas completas del original (matemáticas de competición, concursos de código y ciencia), usando las top-64 log-probabilidades del profesor como objetivo. Finalmente se aplica RL estilo GRPO con LoRA y un tope de longitud: recompensa solo si el pensamiento cierra dentro del límite, la respuesta termina y es correcta (matemáticas verificadas, código ejecutado contra tests). Se usan 32 prompts × 8 muestras por ronda con rollouts en media precisión con vLLM, con topes de 16.384 y 12.288 tokens (12 rondas) y luego 10.240 y 8.192 (12 rondas), sobre prompts de concursos de código y matemáticas ajenos a los benchmarks.

## Capacidades

- Generación de texto conversacional y razonamiento de largo alcance con modo "thinking" extenso (miles de tokens de pensamiento).
- Razonamiento matemático de competición (evaluado en AIME 2026).
- Generación y resolución de código (evaluado en LiveCodeBench v6).
- Seguimiento de instrucciones estrictas (evaluado en IFEval).
- Conocimiento general tipo MMLU-Pro, con rendimiento limitado.
- Capacidad de cerrar el razonamiento dentro de un límite de longitud gracias al RL con tope.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio.
- Multilingüismo muy limitado: solo inglés funcional; otros idiomas presentan bucles y mezcla de chino.

## Casos de uso

- Investigación sobre compresión de MoE: sirve para estudiar cómo afectan la poda no uniforme, el healing con LoRA y la destilación on-policy al rendimiento de razonamiento, comparando directamente con el modelo base.
- Experimentos de razonamiento de largo alcance en código: con 32k de contexto y modo thinking, permite analizar trazas de resolución de problemas de programación en entornos controlados.
- Evaluación de RL con restricción de longitud: útil para reproducir o extender el esquema GRPO con topes de tokens y recompensas verificables en matemáticas y código.
- Prototipado de asistentes técnicos en inglés donde la factualidad no sea crítica y se aporte contexto documental (RAG), ya que el autor advierte de que los hechos deben venir de búsqueda o documento.
- Despliegue en hardware modesto: el GGUF Q4_K_M (11,4 GB) permite ejecución en CPU con llama.cpp para pruebas de inferencia y validación de pipeline.
- Benchmarking de métodos de poda: como referencia para comparar técnicas de pruning de expertos frente a destilación densa en modelos de ~9B.
- Generación de soluciones de código en pipelines offline: con verificación posterior contra tests, dado que el modelo rinde mejor en LiveCodeBench cuando cierra su razonamiento.

## Benchmarks y rendimiento

Datos de la model card (bf16, thinking on, hasta 32.768 tokens):

| Benchmark | Preview 3 | Preview 2 | Qwen3.5-9B |
|---|---:|---:|---:|
| AIME 2026 (30 problemas, media de 3 muestras) | 23,7 | 18,0 | 22,3 |
| LiveCodeBench v6 (175), grading estándar | 78 | 50 | 87 |
| LiveCodeBench v6, solo respuestas terminadas | 78 | – | 69 |
| MMLU-Pro (280) | 150 | 141 | 226 |
| IFEval (541, strict) | 414 | 341 | – |
| Respuestas que agotan 32k (AIME / MMLU-Pro / LCB) | 7/90 · 2/280 · 28/175 | 33/90 · 59/280 · 122/175 | 23/90 · 3/280 · 104/175 |

Datos con thinking off (1.024 tokens):

| Métrica | Preview 3 | Preview 2 |
|---|---:|---:|
| Hechos cortos correctos (de 120) | 23 | 52 |
| …incorrectos / "no lo sé" | 49 / 48 | 44 / 24 |
| Proporción de hechos respondidos que son erróneos | 0,68 | 0,46 |
| Nombres inventados descritos como reales (de 40; menor es mejor) | 27 | 27 |

El autor califica el resultado como "a la par" con Qwen3.5-9B en razonamiento, no por delante (test de signos: AIME p = 0,52; LCB estándar p = 0,19; LCB terminadas p = 0,15).

## Requisitos de hardware

- VRAM estimada: el checkpoint bf16 ocupa ~19 GB; el GGUF Q4_K_M ocupa 11,4 GB (incluye padding de ceros, por lo que es mayor de lo que necesitaría un 9,4B).
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU de 24 GB (RTX 4090, A10G) puede alojar el Q4_K_M con holgura y el bf16 de forma ajustada; A100/H100 para bf16 con contexto largo.
- Cabe en GPU de consumo: sí, el Q4_K_M en GPUs de 16-24 GB; el bf16 requiere ~24 GB o más.
- Opciones de despliegue: llama.cpp (verificado en CPU con `llama-completion`, greedy, thinking off); vLLM se usó para rollouts de RL en media precisión; el checkpoint safetensors requiere `load_uneven.py` junto con `uneven.py` o el repo "padded".
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Sharpen-Qwen-3.5-9B-A2.6B-Preview | 9,4B (2,4B en safetensors) | ~2,6B | 32k | Apache 2.0 | MoE podado, preview de investigación |
| Qwen3.5-9B | 9B | denso | no disponible | no disponible | Referencia del autor; mejor MMLU-Pro (226 vs 150) y LCB estándar (87 vs 78) |
| Qwen3.5-35B-A3B | 35B | ~3B | no disponible | no disponible | Modelo base original, del que se poda |

## Limitaciones y advertencias

- Es una vista previa de investigación, no un asistente general.
- Alucinación factual grave: ~7 de cada 10 hechos cortos respondidos son erróneos y describe 27 de 40 nombres inventados como reales; no usar donde la factualidad importe sin RAG.
- Idiomas distintos del inglés rotos (bucles, palabras en chino); requiere inglés o un modelo de traducción intermedio.
- Pensamiento muy largo: reservar al menos 16k tokens y 32k para problemas difíciles.
- Pérdida de conocimiento factual respecto a Preview 2 por construirse sobre el corte de Preview 1.
- El checkpoint safetensors no es cargable de forma estándar: requiere script específico o el repo "padded".
- El GGUF incluye padding de ceros y es más grande de lo necesario.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones de calidad desaconsejan producción sin verificación externa.
- Riesgo de sesgos no documentado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Takenoko12345678/Sharpen-Qwen-3.5-9B-A2.6B-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información disponible.
