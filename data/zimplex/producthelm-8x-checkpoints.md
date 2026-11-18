# zimplex/producthelm-8x-checkpoints

## Resumen

ProductHELM 8× es una familia de checkpoints de entrenamiento nativos en PyTorch para dos variantes de modelos de lenguaje causal denominadas F2 y F4, desarrolladas por el autor zimplex (con codigo fuente alojado en el repositorio de achiverram28). Se trata de modelos de arquitectura experimental que combinan un transformer decoder con mezcla de expertos (MoE) y mecanismos geometricos basados en el manifold de Lorentz (Product Lorentz). El modelo se entrena desde cero sobre un corpus tokenizado de Wikipedia, con un vocabulario heredado del tokenizer de Llama 3.1 (128.256 tokens).

La relevancia de estos checkpoints es fundamentalmente de investigacion: no son modelos listos para produccion, sino artefactos de entrenamiento que incluyen estados de optimizador (AdamW y RiemannianAdam), estados de scheduler y pesos en FP32, pensados para reproducir experimentos o continuar el entrenamiento. La variante F2 tiene aproximadamente 1.825 millones de parametros totales (1.533 millones activos por token), mientras que F4 tiene 1.428 millones totales (1.282 millones activos). Ambas comparten 6 capas, anchura 3120, 48 cabezas y una ventana de contexto de solo 2048 tokens.

El modelo no ha publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K), limitandose a perplexity token-level sobre cuatro corpus (WikiText, LAMBADA, C4 y OpenWebText). Esto, junto con la licencia no especificada en el Hub y la dependencia de codigo fuente externo, lo situa como un experimento academico mas que como una alternativa practica a modelos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con MoE (MiCE) y residual TangentAttnRes sobre manifold Product Lorentz |
| Parametros totales | F2: 1.824.920.468; F4: 1.428.316.654 |
| Parametros activos | F2: ~1.532.857.288; F4: ~1.282.269.494 (estimacion por token) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo checkpoints FP32 nativos; no se distribuyen pesos cuantizados) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible en el Hub; el codigo fuente asociado es MIT |
| Formato de pesos | `.pt` (PyTorch pickles nativos con `model_state_dict`, `optimizer_state_dict`, `scheduler_euc_state_dict`, `scheduler_hyp_state_dict`) |

Detalles adicionales de arquitectura: 6 capas, anchura 3120, 48 cabezas de atencion, vocabulario 128.256, primer bloque con FFN densa y los cinco restantes con 4 expertos enrutados, 2 activos y 1 experto compartido, anchura intermedia de experto 6240. El factor Product Lorentz es 2 (F2) o 4 (F4), con radio al cuadrado fijo 1 y curvatura -1.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder causal con dos innovaciones principales: el bloque FFN usa un esquema MoE denominado MiCE (con 4 expertos enrutados, 2 activos y uno compartido por bloque en las cinco capas superiores, mientras la primera capa es densa), y la conexion residual emplea TangentAttnRes, una formulacion que opera sobre el manifold Product Lorentz. Cada factor Lorentz tiene radio al cuadrado fijo 1 y curvatura -1; el numero de factores define las variantes F2 y F4. El modelo usa embeddings de token fraccionados por factor (cada uno de forma 128256 × 3120/F).

El entrenamiento se realizo desde cero durante una epoca completa sobre el dataset `achiverram28/producthelm-wikipedia-tokenized` (pinned al commit `8be3fbb638bc9b473d113173fad8f017c512ce6c`), terminando en la actualizacion de optimizador 4372. La receta usa semilla 1234, ocho procesos, 16 pasos de acumulacion por proceso, batch global de 128 secuencias, learning rate pico 4e-4 y 3% de warmup. El entrenamiento uso autocast BF16, pero los checkpoints guardan pesos maestros en FP32. Se emplean dos optimizadores simultaneos (AdamW para parametros euclideos y RiemannianAdam para parametros sobre el manifold), con sus respectivos schedulers. El tokenizer proviene de NousResearch/Meta-Llama-3.1-8B y se mantiene congelado con huella SHA-256 registrada. No se documenta uso de RLHF, DPO ni tecnicas de alineacion posterior.

## Capacidades

- Generacion de texto causal autorregresiva con vocabulario de 128.256 tokens (tokenizer Llama 3.1).
- Modelado de lenguaje y calculo de perplexity token-level sobre corpus de texto en ingles.
- Razonamiento limitado por tamano y contexto: al ser modelos de ~1.400-1.800 M de parametros con contexto 2048, no se espera rendimiento destacado en tareas complejas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles (tag `en` y dataset solo en ingles).
- No se documenta modo thinking, vision, audio ni otras modalidades.
- Capacidad de reanudar entrenamiento gracias a la inclusion de estados de optimizador y schedulers en el checkpoint.

## Casos de uso

- Reproduccion de experimentos de investigacion: cargar los checkpoints con el codigo fuente en el commit `a42aadd7d761a3bd3974c7cc44661f19b4e9a0f6` permite replicar las evaluaciones de perplexity reportadas (WikiText, LAMBADA, C4, OpenWebText), lo cual es adecuado porque los pesos FP32 y el manifiesto de checksums estan incluidos.
- Continuacion del entrenamiento (fine-tuning o resume): los checkpoints contienen `optimizer_state_dict`, `scheduler_euc_state_dict` y `scheduler_hyp_state_dict`, permitiendo retomar desde la actualizacion 4372 con la receta original; util para estudiar dinamicas de entrenamiento sobre manifolds hiperbolicos.
- Estudio de arquitecturas MoE con geometria hiperbolica: comparar F2 frente a F4 (distinto numero de factores Lorentz) permite analizar el impacto del factor count en perplexity y en el uso de expertos, dado que ambas variantes comparten receta de entrenamiento.
- Benchmarking de mecanismos residuales alternativos: TangentAttnRes puede evaluarse frente a residuales convencionales usando los mismos datos y protocolo, al estar el codigo de entrenamiento y evaluacion disponible en el repositorio fuente.
- Generacion de texto experimental en ingles: el modelo puede usarse para muestreo autoregresivo con contexto de hasta 2048 tokens, aunque su perplexity elevada (34,77 en WikiText para F2) sugiere calidad limitada.
- Investigacion sobre tokenizers heredados: al usar el vocabulario de Llama 3.1 con 128.256 tokens, sirve para estudiar el efecto de vocabularios grandes en modelos de escala pequena-media entrenados desde cero.
- Docencia y formacion: el codigo MIT y los checkpoints permiten ilustrar el entrenamiento con optimizadores riemannianos y arquitecturas MoE en cursos avanzados de aprendizaje profundo.

## Benchmarks y rendimiento

Perplexity token-level en la actualizacion 4372 (menor es mejor), segun `evaluation_results.json` y `benchmark.csv`:

| Variante | WikiText | LAMBADA | C4 | OpenWebText |
|---|---:|---:|---:|---:|
| F2 | 34,7708 | 108,8540 | 68,2704 | 50,0823 |
| F4 | 37,6895 | 120,6565 | 73,4507 | 53,8963 |

Recuento de tokens evaluados: 288.794 (WikiText), 150.053 (LAMBADA), 229.303 (C4) y 399.610 (OpenWebText). LAMBADA corresponde a perplexity del siguiente token sobre pasaje completo en 2.000 pasajes aceptados; OpenWebText usa los primeros 500 documentos del split de entrenamiento guardados. Estos resultados siguen el protocolo de evaluacion original del proyecto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP32 de F2 ocupan aproximadamente 7,3 GB (1.825 M parametros × 4 bytes) y los de F4 aproximadamente 5,7 GB; los checkpoints completos (con estados de optimizador) pesan 21,9 GB (F2) y 17,1 GB (F4).
- GPU recomendadas: al no haber pesos cuantizados ni integracion con frameworks de inferencia optimizados, se recomienda GPU con al menos 12-16 GB de VRAM para inferencia FP32 (por ejemplo RTX 4090, A100, H100). Para cargar el checkpoint completo con estados de optimizador se necesita mas memoria (del orden de 24 GB o superior).
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas para solo inferencia FP32 (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090). No hay versiones GGUF ni cuantizadas para reducir requisitos.
- Opciones de despliegue: exclusivamente PyTorch nativo con el codigo fuente del repositorio `achiverram28/product-helm-mice-tangentattnres` (commit `a42aadd7d761a3bd3974c7cc44661f19b4e9a0f6`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No hay datos de benchmarks estandar que permitan una comparacion de rendimiento fiable con alternativas. Comparativa estructural con modelos de tamano y proposito similares:

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---:|---:|---|---|---|
| ProductHELM F2 (este) | 1.825 M | 2048 | no disponible | `.pt` PyTorch nativo | Hub, requiere codigo externo |
| ProductHELM F4 (este) | 1.428 M | 2048 | no disponible | `.pt` PyTorch nativo | Hub, requiere codigo externo |
| Llama 3.2 1B | ~1.240 M | 131.072 | Llama 3.2 Community License | safetensors, GGUF | Hub, amplio ecosistema |
| Qwen2.5 1.5B | ~1.540 M | 32.768 | Apache 2.0 | safetensors, GGUF | Hub, amplio ecosistema |
| SmolLM2 1.7B | ~1.710 M | 8.192 | Apache 2.0 | safetensors, GGUF | Hub, amplio ecosistema |

La comparacion de rendimiento con estos modelos no es posible con los datos disponibles, dado que ProductHELM solo reporta perplexity sobre corpus especificos y no benchmarks downstream. Las alternativas citadas tienen contextos significativamente mayores, licencias claras y soporte en frameworks de inferencia estandar.

## Limitaciones y advertencias

- Licencia no disponible en el Hub: no se puede confirmar si el uso comercial esta permitido. El codigo fuente asociado es MIT, pero los pesos no tienen licencia explicita.
- Modelos entrenados solo en ingles, con vocabulario Llama 3.1; no hay capacidades multilingues documentadas.
- Contexto muy limitado (2048 tokens), muy inferior a modelos contemporaneos comparables.
- Perplexity elevada incluso en WikiText (34,77 para F2, 37,69 para F4), lo que sugiere calidad de generacion baja en comparacion con modelos de tamano similar.
- Riesgo alto de alucinacion y generacion incoherente por tamano reducido, entrenamiento de una sola epoca y ausencia de alineacion (no se documenta RLHF/DPO).
- Sesgos potenciales derivados del corpus de Wikipedia en ingles, no evaluados en la model card.
- No hay pesos cuantizados ni integracion con vLLM, llama.cpp, Ollama o TGI; el despliegue requiere reconstruir el modelo con codigo externo de un repositorio privado, lo que anade complejidad y riesgo de reproducibilidad.
- Los checkpoints son nativos de entrenamiento (no safetensors) e incluyen estados de optimizador, aumentando el tamano en disco (21,9 GB y 17,1 GB) y el consumo de memoria.
- La ausencia de estado RNG nativo impide reproducir exactamente la continuacion del entrenamiento bit a bit.
- Fecha de creacion indicada como 2026-11-18, posterior a la fecha de referencia habitual; conviene verificar la integridad via `SHA256SUMS` y `checkpoint_manifest.json`.
- No se han publicado evaluaciones de seguridad, sesgo o toxicidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zimplex/producthelm-8x-checkpoints
- Repositorio de codigo fuente (privado, commit base): https://github.com/achiverram28/product-helm-mice-tangentattnres
- Dataset de entrenamiento: https://huggingface.co/datasets/achiverram28/producthelm-wikipedia-tokenized
- Tokenizer de referencia: https://huggingface.co/NousResearch/Meta-Llama-3.1-8B
