# TightX/code-llm-1b-base

## Resumen

`code-llm-1b-base` es un modelo de lenguaje decoder-only de 1.095.845.888 parámetros (bf16, 143 tensores) entrenado desde cero para autocompletado de código Python. Lo desarrolla TightX (TightXu en GitHub) y se distribuye con licencia MIT. Su interés no reside en el rendimiento bruto, sino en la trazabilidad del proceso: pipeline de datos, tokenizador, arquitectura, bucle de entrenamiento, fusión de checkpoints y evaluación fueron escritos y ejecutados por una sola persona sobre una única GPU de consumo, una RTX 5090 de 32 GB (Blackwell sm_120).

La arquitectura es un transformer causal convencional con 20 capas, `d_model` 2048, 16 cabezas (head_dim 128), FFN SwiGLU con `d_ff` 5120, RoPE con theta 500000, RMSNorm pre-norm y proyección QKV fusionada sin sesgos. El vocabulario es de 32.000 tokens con BPE a nivel de byte (reutilizado de una release anterior de 435M, no reentrenado) y la longitud de contexto es de solo 1024 tokens. El checkpoint publicado es el resultado de un promedio de pesos de los últimos 21 checkpoints (ventana de 10.500 pasos), no el último paso del optimizador.

Es relevante ahora como referencia educativa y de investigación: documenta con precisión qué aprende y qué no aprende un modelo de 1.1B entrenado de extremo a extremo con 31.000 millones de tokens sobre un corpus filtrado de Python. No es un modelo de instrucciones ni un asistente: es un modelo de completado, y su propia model card lo desaconseja para generación de código en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, pre-norm, SwiGLU, RoPE |
| Parámetros totales | 1.095.845.888 (bf16, 143 tensores) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible (release únicamente en bf16) |
| Idiomas soportados | código (Python); sin soporte de lenguaje natural declarado |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 2.191.706.272 bytes) + `config.json`, `tokenizer.json`, `SHA256SUMS.txt`, `arch_facts.json` |

Detalles adicionales de arquitectura: 20 capas, `d_model` 2048, 16 cabezas con `head_dim` 128, FFN SwiGLU con `d_ff` 5120 (gate/up/down), RoPE theta 500000, RMSNorm con `scale` aprendido y eps 1e-6, atención causal SDPA con proyección QKV fusionada, sin sesgos en ninguna capa, embeddings de entrada y `lm_head` no atados (untied), vocabulario de 32.000 tokens BPE a nivel de byte.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar sin innovaciones estructurales: atención causal con SDPA, QKV fusionado, RoPE, RMSNorm pre-norm y SwiGLU. La particularidad está en el régimen de entrenamiento. Se entrenó sobre un flujo continuo de tokens (`data/all/train.bin`) sin fronteras de dataset, procedente de un corpus filtrado de Python, hasta 30.977.679.360 tokens (31,0 B) en 630.000 pasos. El schedule es WSM (constant learning rate seguido de cooldown) y los pesos publicados son la media de igual peso de los últimos 21 checkpoints guardados cada 500 pasos. El entrenamiento usó matmuls FP8 sobre pesos maestros en fp32 en una única RTX 5090.

El checkpoint publicado es el producto final del preentrenamiento bajo este esquema, no el último paso del optimizador. La variante con instrucciones (SFT) parte exactamente de estos pesos y se publica por separado. El modelo no es una arquitectura `transformers`: requiere la clase `CodeLLM` de `pretrain_train_wsm.py` y `ModelConfig(**config.json)`; no hay mapeo `AutoModel`. El `config.json` lleva `use_fp8: false` deliberadamente, porque ese flag selecciona kernels de entrenamiento y haría construir capas que no corren fuera de CUDA.

## Capacidades

- Autocompletado de funciones Python cortas dada una firma y la indentación de apertura.
- Completado a partir de prompts en lenguaje natural (columna "prose" del benchmark interno).
- Completado a partir de solo la firma de la función (columna "signature-only").
- Generación de esqueletos de código con estructura correcta en tareas de varios pasos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso fiable.
- No soporta instrucciones: es un modelo de completado, no de chat.
- Sin capacidades de visión, audio ni modo "thinking".
- Multilingüe: no disponible; entrenado solo con código Python.

## Casos de uso

- Investigación sobre entrenamiento desde cero: replicar el pipeline completo (tokenizador, arquitectura, bucle, fusión de checkpoints) en una sola GPU de consumo para estudiar qué aprende un modelo de 1.1B con 31B de tokens.
- Estudio de ablaciones y schedules: el repositorio incluye informe de ablaciones y registro de fallos, lo que permite analizar el efecto de WSM y del promediado de checkpoints frente al último paso.
- Docencia de arquitecturas transformer: el modelo es pequeño, legible y sin dependencias de `transformers`, útil para explicar atención, RoPE, RMSNorm y SwiGLU sobre pesos reales.
- Completado de código en entornos controlados de investigación: dado que solo completa funciones cortas, sirve como banco de pruebas para medir latencia y calidad en CPU con `torch.autocast("cpu", dtype=torch.bfloat16)`.
- Generación de esqueletos en herramientas internas de prototipado: puede producir la estructura de una función a partir de su firma, siempre con revisión humana obligatoria.
- Evaluación comparativa de tokenizadores BPE byte-level: al reutilizar el tokenizador de la release de 435M, permite aislar el efecto del tamaño del modelo frente al del vocabulario.
- Estudio de modos de fallo estructurales: útil para analizar por qué un modelo pequeño falla de forma sistemática en recursión (mergesort, quicksort) y en test de primalidad.

## Benchmarks y rendimiento

Evaluación humana interna: 11 tareas, 5 semillas por checkpoint, cada muestra puntuada 0/1/2 a mano, máximo 110 puntos por columna. Las diferencias menores que la dispersión entre semillas deben tratarse como ruido.

| Modelo | Columna prompt en lenguaje natural | Columna solo firma |
|---|---|---|
| `code-llm-1b-base` (este) | 83/110 | 61/110 |
| `code-llm-1b` SFT (hermano) | 97/110 | 91/110 |

El pase de SFT aporta +14 en la columna de prosa y +30 en la de solo firma, principalmente en tareas de varios pasos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; de hecho, la model card indica que los prompts con docstring al estilo HumanEval puntúan cerca de cero porque el modelo interpreta el docstring como el final de la función.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,2 GB solo para pesos, más overhead de activaciones y caché KV; cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: RTX 5090 (la usada en entrenamiento), RTX 4090, RTX 3090, RTX 4080; cualquier GPU con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, en toda la gama media y alta reciente.
- Despliegue: no hay soporte en vLLM, llama.cpp, Ollama ni TGI porque no es una arquitectura `transformers`. Requiere la clase `CodeLLM` del repositorio de entrenamiento y ejecución en PyTorch.
- Inferencia en CPU: viable bajo `torch.autocast("cpu", dtype=torch.bfloat16)` o cargando en fp32. La verificación reportada tarda 0,1 s para un prompt de 13 tokens en CPU.
- Latencia y throughput en GPU: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `code-llm-1b-base` | 1,10B | 1024 | MIT | HuggingFace, pesos safetensors | Entrenado desde cero, no `transformers`, solo completado |
| `code-llm-1b` SFT (mismo autor) | 1,10B | 1024 | MIT | HuggingFace | Variante con instrucciones sobre los mismos pesos |
| Release previa 435M (mismo autor) | 435M | no disponible | no disponible | HuggingFace | Origen del tokenizador reutilizado |

No se dispone en la información proporcionada de comparaciones con modelos de código de terceros de tamaño similar (por ejemplo, variantes pequeñas de familias establecidas); por tanto, esa comparación figura como no disponible.

## Limitaciones y advertencias

- No sigue instrucciones: es un modelo de completado, no de chat. Para uso conversacional debe emplearse la variante SFT.
- Contexto muy corto: 1024 tokens, insuficiente para archivos completos o conversaciones multi-turno.
- Ciego a docstrings: a esta escala interpreta el docstring como fin de la función, por lo que los prompts estándar de HumanEval puntúan cerca de cero.
- Fallos estructurales, no aleatorios: mergesort y quicksort (en la columna de prosa) y el test de primalidad nunca pasan; varias tareas producen un esqueleto correcto con un operador erróneo.
- Disciplina débil en nombres y casos límite.
- Riesgo de alucinación y de reproducir patrones del corpus de entrenamiento; el autor advierte de que las salidas pueden replicar dichos patrones.
- Entrenado solo con código; sin datos personales declarados, pero sin garantías adicionales.
- No apto para generación de código en producción ni como sustituto de un desarrollador competente; uso previsto: investigación y educación.
- Restricciones de licencia: MIT permite uso comercial, pero las limitaciones técnicas hacen desaconsejable ese uso.
- Gotcha de carga verificado: `RMSNorm` calcula la media de cuadrados en fp32, por lo que su salida es fp32 aunque los pesos sean bf16; un forward bf16 en CPU sin autocast lanza `expected m1 and m2 to have the same dtype` dentro de `nn.Linear`.
- `config.json` incluye `use_fp8: false`; no debe activarse, ya que selecciona kernels de entrenamiento inutilizables fuera de CUDA.
- Los artefactos de verificación (hash, formas, igualdad bit a bit, carga estricta, forward en CPU) no forman parte de la release; solo `SHA256SUMS.txt` permite reverificar los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TightX/code-llm-1b-base
- Repositorio de entrenamiento, diseño, ablaciones y registro de fallos: https://github.com/TightXu/Simple_Code_LLM
- Variante SFT: https://huggingface.co/TightX/code-llm-1b-sft (referenciada como `../sft` en la model card)
- Hash de verificación: `6b89f4eebe5bb79bd3f98c5dfaae303d80661c8a3498336ae2dcbf2920184081  model.safetensors`
