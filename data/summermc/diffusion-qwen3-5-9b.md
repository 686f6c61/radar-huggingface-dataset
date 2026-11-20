# summerMC/Diffusion-Qwen3.5-9B

## Resumen

Diffusion-Qwen3.5-9B es un checkpoint de investigación publicado por el usuario summerMC que convierte el modelo autorregresivo Qwen/Qwen3.5-9B en un modelo de lenguaje de difusión enmascarada (masked diffusion LM) al estilo LLaDA / Dream. En lugar de generar token a token de izquierda a derecha, el modelo parte de una secuencia completamente enmascarada y va desenmascarando tokens de forma iterativa y paralela, commitando en cada paso aquellos cuya confianza supera un umbral configurable. Sobre esa base se añade una segunda etapa de refinamiento guiada por BART (facebook/bart-base congelado en FP32) mediante un módulo de cross-attention con puerta inicializada a cero.

El modelo tiene 8.953.803.264 parámetros (aproximadamente 9B) en precisión bf16, con un repositorio de 18,1 GB, y hereda el tokenizador y la plantilla de chat de Qwen. Está etiquetado explícitamente como experimental y no evaluado: el propio autor indica que no se han ejecutado benchmarks y que la calidad esperada es inferior a la del modelo base. No obstante, es relevante ahora como pieza de exploración práctica del paradigma de difusión para texto sobre una arquitectura híbrida moderna (atención completa más capas Gated DeltaNet), y por incluir kernels Triton, captura con CUDA graphs y un sampler con streaming listos para usar.

La licencia es Apache 2.0 y los idiomas declarados son inglés y japonés. El modelo no soporta `generate()` autorregresivo estándar: requiere aplicar el parche bidireccional del paquete `dqwen` incluido en el repositorio y restaurar las puertas inversas (`rev_gates`) y el embedding de máscara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa bidireccional + capas Gated DeltaNet con escaneo directo e inverso), convertido a masked diffusion LM; refinamiento con cross-attention BART |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados); carga en 4-bit NF4 soportada para GPUs pequeñas; el fast path Triton se desactiva con 4-bit |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards, bf16), más `fusion.pt` (state_dict de BartFusion) y `dqwen_rev_gates.safetensors` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y lo transforma en un diffusion LM enmascarado. Las capas de atención completa pierden la máscara causal y pasan a ser bidireccionales. Las capas Gated DeltaNet incorporan un escaneo en ambas direcciones con la fórmula `out = orig(h) + g ⊙ flip(orig(flip(h)))`, donde cada canal dispone de una puerta inversa `rev_gate` inicializada a cero. El token de máscara es `<|fim_pad|>` con un embedding aprendido. La función de pérdida es entropía cruzada sobre tokens enmascarados con ponderación 1/t y predicción desplazada (posición j desde el hidden j−1) para mantener alineado el `lm_head` autorregresivo original.

La decodificación se realiza por bloques con remasking: se genera un borrador y después se refinan mediante BART los tokens de menor confianza (el 30% inferior). BART-base, congelado en FP32, codifica el borrador y un módulo de cross-attention con puerta a cero inyecta esa información en los embeddings de respuesta para una pasada de refinamiento. El entrenamiento usó QLoRA en 4-bit NF4 con r=8 y alpha=16 (cómputo en bf16, luego fusionado en pesos bf16), sobre 256 muestras del dataset HuggingFaceTB/smoltalk, con longitud de secuencia 256 (prompt ≤ 128) y dos etapas de 10 pasos cada una: la primera entrena LoRA, puertas y embedding de máscara; la segunda solo el módulo de fusión. Es, por tanto, un ajuste muy ligero sobre el modelo base, no un reentrenamiento desde cero.

Como innovación de ingeniería, el repositorio incluye un fast path en Triton que fusiona las proyecciones de entrada del DeltaNet bidireccional, combina convoluciones directa e inversa en un solo kernel, agrupa ambos escaneos en una llamada `fla` de batch 2, pliega `rev_gate` en un único GEMM de `out_proj`, fusiona RMSNorm con residuo, gate/up con SiLU y q/k-norm con RoPE parcial, y captura el forward completo como CUDA graph por longitud de secuencia. También ofrece `dqwen.accel.select`, que calcula lm_head + softmax (max/argmax/LSE) sin materializar los logits fp32 del vocabulario de 248k. El fast path se valida contra las capas originales antes de activarse y se desactiva automáticamente en entrenamiento, máscaras de padding, fusión BART, batch > 1, 4-bit o GPUs anteriores a Ampere.

## Capacidades

- Generación de texto por desenmascaramiento iterativo paralelo, con control de calidad mediante el umbral de confianza `thr` (más bajo es más rápido, más alto es mejor calidad).
- Streaming de generación token a token a través de la función `stream`, que expone los tokens recién comprometidos y los aún indeterminados (`dlm.mask_id`).
- Refinamiento en dos pasadas: borrador por remasking por bloques y refinamiento guiado por BART del 30% de tokens menos confiables.
- Conversación: incluye `chat_template.jinja` de Qwen y está etiquetado como `conversational`.
- Capacidades multilingües limitadas a inglés y japonés según la model card.
- Aceleración opcional con Triton, CUDA graphs y kernels fusionados para GPUs Ampere o posteriores.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Investigación sobre modelos de difusión para texto: el checkpoint permite experimentar con decodificación por desenmascaramiento paralelo sobre una arquitectura híbrida real de 9B, comparando el comportamiento frente al Qwen3.5-9B autorregresivo original.
- Estudio del sampler y del umbral de confianza: el parámetro `thr` y el streaming permiten analizar curvas de calidad/latencia y el efecto del remasking por bloques en tareas controladas de laboratorio.
- Evaluación de refinamiento híbrido BART + LLM: el módulo de fusión con puerta a cero es un caso de estudio reproducible de cómo inyectar un encoder pequeño en un modelo grande sin degradar el comportamiento inicial.
- Prototipado de generación paralela en inglés o japonés: útil para medir si el desenmascaramiento paralelo reduce el número de pasos frente a la decodificación autorregresiva en longitudes cortas (≤ 256 tokens, el régimen de entrenamiento).
- Benchmarking de kernels Triton: el fast path con DeltaNet bidireccional fusionado y CUDA graphs sirve para medir ganancias de throughput en A100, L4, H100 o RTX 30xx/40xx frente a la ruta PyTorch.
- Docencia y divulgación: ejemplo funcional y de código abierto (Apache 2.0) para explicar diffusion LMs, con pipeline de carga, generación y streaming en pocas líneas.
- No es adecuado para producción, atención al cliente real ni generación de código en pipelines, dado que el autor lo declara no evaluado y experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado y que se espera una calidad inferior a la del modelo base Qwen/Qwen3.5-9B.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB en bf16 para inferencia, según la model card (clase A100 / L4). La carga en 4-bit NF4 permite ajustarlo en GPUs más pequeñas, aunque desactiva el fast path Triton.
- GPUs recomendadas: A100, L4, H100 para el fast path Triton; RTX 30xx y 40xx también soportan el fast path al ser Ampere o posteriores. GPUs anteriores a Ampere usan la ruta PyTorch original.
- Cabe en GPU de consumo: sí, en tarjetas con al menos ~18 GB en bf16 (por ejemplo RTX 4090 de 24 GB); con cuantización 4-bit cabría en GPUs de menor VRAM, a costa de renunciar a la aceleración Triton.
- Despliegue: el repositorio está pensado para `transformers` con soporte de Qwen3.5, `accelerate`, `safetensors` y `huggingface_hub`, más `flash-linear-attention` recomendado. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; de hecho, `AutoModelForCausalLM.from_pretrained` produce un modelo causal, no de difusión, por lo que es necesario aplicar el parche `dqwen`.
- Latencia y throughput: no disponibles. El autor solo indica que un `thr` más bajo es más rápido y uno más alto da mejor calidad, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Estado |
|---|---|---|---|---|---|
| Diffusion-Qwen3.5-9B | ~9B | no disponible | Masked diffusion + refinamiento BART | Apache 2.0 | Experimental, sin benchmarks |
| Diffusion-Qwen3.5-4B (mismo autor) | ~4B (no confirmado) | no disponible | Masked diffusion + fusión BART | Apache 2.0 | Experimental, sin benchmarks |
| Diffusion-Qwen3.8-27B (mismo autor) | ~27B (no confirmado) | no disponible | Masked diffusion (pesos fusionados) | Apache 2.0 | Experimental, sin benchmarks |
| Qwen/Qwen3.5-9B (modelo base) | ~9B | no disponible | Transformer autorregresivo | no disponible en la información | Modelo base de referencia |

No se dispone de datos de benchmarks ni de contexto para establecer una comparación cuantitativa con alternativas de difusión de otros autores.

## Limitaciones y advertencias

- No evaluado: no se ha ejecutado ningún benchmark y la calidad esperada es inferior a la del modelo base Qwen3.5-9B.
- Experimental: el autor lo declara explícitamente no apto para producción.
- Sin `generate()` autorregresivo: el parche bidireccional funciona sin caché KV ni de estado, por lo que la generación es más costosa computacionalmente que en un modelo causal equivalente.
- Fragilidad ante actualizaciones: cambios en la implementación de Qwen dentro de `transformers` pueden romper el parche `dqwen`.
- Entrenamiento mínimo: solo 256 muestras de smoltalk, secuencia de 256 tokens y 10 pasos por etapa; el ajuste es muy superficial y no cubre dominios especializados.
- Idiomas: únicamente inglés y japonés declarados; no hay soporte documentado de español.
- Contexto: la longitud de contexto no está publicada; el entrenamiento se hizo con secuencias de 256 tokens, lo que limita la generalización a entradas largas.
- Fast path condicionado: se desactiva con 4-bit, batch > 1, máscaras de padding, entrenamiento, fusión BART y GPUs pre-Ampere, lo que reduce las ganancias en despliegues reales.
- Sesgos y alucinaciones: no documentados por el autor; al derivar de Qwen3.5-9B y entrenarse con un subconjunto pequeño de smoltalk, es razonable esperar los sesgos del modelo base, pero no hay análisis publicado.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de un checkpoint experimental sin evaluación, su uso en producción queda bajo responsabilidad del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerMC/Diffusion-Qwen3.5-9B
- Modelo relacionado Diffusion-Qwen3.5-4B: https://huggingface.co/summerMC/Diffusion-Qwen3.5-4B
- Modelo relacionado Diffusion-Qwen3.8-27B: https://huggingface.co/summerMC/Diffusion-Qwen3.8-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base del módulo de fusión: https://huggingface.co/facebook/bart-base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Paper de referencia LLaDA: no disponible en la información proporcionada
- Paper de referencia Dream: no disponible en la información proporcionada
- Repositorio de `flash-linear-attention`: no disponible en la información proporcionada
