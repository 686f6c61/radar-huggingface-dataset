# TheFireHacker/bubblspace-moe0.9b-a0.2b

## Resumen

BubblSpace MoE-0.9B-A0.2B es un checkpoint intermedio de preentrenamiento desarrollado por TheFireHacker, publicado como parte de una ejecución de entrenamiento todavía en curso. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 915.573.760 parámetros totales y aproximadamente 211 millones activos por token, construido desde cero (from-scratch) y entrenado exclusivamente sobre FineWeb-Edu. No es un modelo terminado ni afinado para instrucciones: es un estado parcial del entrenamiento (paso 4.000 de 19.073 planificados) de una tirada de 10.000 millones de tokens.

La arquitectura sigue una inspiración Qwen3-Next e incorpora Grouped Query Attention (16 cabezas de consulta y 4 de clave/valor), QK-norm, RoPE, normalización ZeroCenteredRMSNorm, embeddings atados y un MoE dropless con 64 expertos y top-8 enrutamiento. El modelo usa un tokenizador derivado de SmolLM2-360M con tokens especiales propios para chat, FIM, herramientas y razonamiento, con un vocabulario de 49.280 entradas.

Su relevancia es fundamentalmente de investigación: documenta de forma transparente una receta de entrenamiento MoE de escala pequeña sobre una única H100, con configuración completa (Muon + AdamW, bf16, schedule coseno) y código de modelo incluido en el repositorio. No está pensado para uso en producción ni para tareas de instrucción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dropless (top-8 de 64 expertos), GQA, QK-norm, RoPE, ZeroCenteredRMSNorm, embeddings atados |
| Parametros totales | 915.573.760 (~915M) |
| Parametros activos | ~211M por token |
| Longitud de contexto | 2.048 tokens (max_seq_len) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (entrenado solo con FineWeb-Edu; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, `state_dict` crudo de la clase `Transformer` personalizada; no compatible con la librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 16 capas con `d_model` de 1.024. La atención usa 16 cabezas de consulta y 4 de clave/valor (GQA) con `head_dim` de 64, QK-norm, RoPE con `rope_theta` de 10.000 y una puerta de salida en la proyección de atención. La normalización es ZeroCenteredRMSNorm con `eps` de 1e-6, y los embeddings de entrada y salida están atados. La capa MoE tiene 64 expertos con `expert_hidden` de 256, activación SwiGLU (silu) y enrutamiento top-8 dropless, con coeficientes de balanceo de carga (0,01) y router z-loss (0,001). El backend MoE se resuelve en tiempo de ejecución: usa `torch._grouped_mm` si está disponible y, en caso contrario, un fallback portable de bucle gather con salidas idénticas.

El entrenamiento se realizó sobre FineWeb-Edu (configuración `sample-10BT`), con 10.000 millones de tokens planificados, `seq_len` de 2.048, `global_batch_tokens` de 524.288 y `micro_batch` de 16 en bf16, sobre una única H100 de 80 GB. Se usó Muon (lr 6e-4, momentum 0,95, Nesterov, 5 pasos NS, weight decay 0,1) para los parámetros matriciales y AdamW (lr 6e-4, betas 0,9/0,95, eps 1e-8, weight decay 0,1) para el resto, con grad clipping de 1,0. El schedule es coseno con 2.000 pasos de warmup y `min_lr_ratio` de 0,1. La inicialización usa std 0,02 con `residual_proj_std = std / sqrt(2 * n_layers)` en `attn.o_proj` y `experts.W_down`. Este checkpoint corresponde al paso 4.000 de 19.073.

## Capacidades

- Generación de texto por continuación: el modelo completa texto de forma plausible, pero no responde a instrucciones ni mantiene formato de pregunta-respuesta.
- No dispone de ajuste por instrucciones (instruction tuning) ni de datos de código o agentes en este checkpoint.
- El tokenizador incluye tokens especiales para chat, FIM (fill-in-the-middle), herramientas (tool) y razonamiento, pero el modelo no ha sido entrenado para usarlos de forma fiable todavía.
- Capacidades multilingües: no documentadas; el corpus de entrenamiento es FineWeb-Edu, de predominio inglés.
- Tool calling / function calling: no disponible en este checkpoint (tokens reservados pero sin entrenamiento específico).
- Razonamiento multi-paso y modo thinking: no disponible.
- Visión y audio: no soportados.

## Casos de uso

- Investigación sobre recetas MoE de escala pequeña: sirve como referencia reproducible para estudiar enrutamiento top-8 con 64 expertos, balanceo de carga y estabilidad de entrenamiento con Muon + AdamW en una sola GPU.
- Estudio de dinámica de preentrenamiento: al ser un checkpoint intermedio con paso documentado (4.000/19.073), permite analizar la evolución de la pérdida y del comportamiento generativo a lo largo del entrenamiento.
- Base para experimentos de continuación de preentrenamiento: el `state_dict` y el código del modelo están incluidos, de modo que un investigador puede reanudar o modificar el entrenamiento con su propio corpus.
- Benchmarking de tokenizadores: al usar el tokenizador de SmolLM2-360M con tokens especiales propios (vocabulario 49.280), permite comparar eficiencia de tokenización frente a otros tokenizadores en corpus educativos.
- Pruebas de infraestructura de inferencia MoE: el fallback gather-loop y el backend `grouped_mm` permiten validar pipelines de inferencia MoE en hardware consumer o profesional sin depender de `transformers`.
- Docencia y divulgación: ejemplo autocontenido (código, pesos, tokenizador y script `generate.py`) para explicar cómo se construye y entrena un MoE desde cero.
- No recomendado para atención al cliente, generación de código en producción, agentes ni ninguna tarea que requiera seguir instrucciones, dado que es un checkpoint base intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,8 GB para los pesos (915M parámetros × 2 bytes), más activaciones y caché KV; en la práctica, menos de 4 GB en bf16 para secuencias de 2.048 tokens.
- VRAM estimada en fp32: aproximadamente 3,7 GB solo para pesos (coincide con el tamaño del repositorio, 3,7 GB).
- GPU recomendadas: el entrenamiento se realizó en una H100 de 80 GB; para inferencia basta con una GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) o incluso GPUs con 8 GB en bf16.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con al menos 6-8 GB de VRAM en bf16.
- Opciones de despliegue: no es compatible con `transformers`, vLLM, TGI ni llama.cpp de forma directa; requiere el código del modelo incluido en el repositorio (script `generate.py`) o el repositorio de GitHub `TheFireHacker/bubblspace-MoE0.9B-A2b`.
- Funciona en CPU con el fallback automático, aunque con velocidad reducida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| BubblSpace MoE-0.9B-A0.2B | ~915M | ~211M | 2.048 | Apache 2.0 | Código propio, no `transformers` |
| SmolLM2-360M | ~360M | denso | 8.192 (según model card pública) | Apache 2.0 | `transformers` |
| Qwen3-0.6B | ~600M | denso | 32.768 (según model card pública) | Apache 2.0 | `transformers` |
| OLMoE-1B-7B | ~7B | ~1,3B | 4.096 (según model card pública) | Apache 2.0 | `transformers` |

Nota: los datos de SmolLM2-360M, Qwen3-0.6B y OLMoE-1B-7B provienen de sus model cards públicas y no de la información proporcionada para este modelo; se incluyen solo como referencia de categoría. BubblSpace es un checkpoint base intermedio, por lo que la comparación de rendimiento no es significativa.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se ha entrenado el 21 % de los pasos planificados (4.000 de 19.073); el modelo no está terminado.
- Solo preentrenamiento base: no sigue instrucciones, no responde preguntas y produce continuaciones plausibles pero no necesariamente veraces.
- Riesgo elevado de alucinación y de texto incoherente, especialmente en tareas de formato o razonamiento.
- Sin datos de código ni agentes: no debe usarse para generación de código en producción.
- Idiomas: no documentados; probablemente limitado al inglés de FineWeb-Edu.
- Contexto corto (2.048 tokens) frente a alternativas actuales.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo hace inviable su uso en producción.
- No es compatible con `transformers`, vLLM, TGI ni llama.cpp; requiere código propio, lo que dificulta su integración en pipelines estándar.
- El tokenizador está derivado de SmolLM2-360M y añade tokens especiales que el modelo aún no ha aprendido a usar de forma fiable.
- No se han publicado evaluaciones de sesgo, toxicidad o seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/TheFireHacker/bubblspace-moe0.9b-a0.2b
- Repositorio de código del modelo: https://github.com/TheFireHacker/bubblspace-MoE0.9B-A2b
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
