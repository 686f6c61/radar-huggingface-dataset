# summerMC/Diffusion-Qwen3.5-4B

## Resumen

Diffusion-Qwen3.5-4B es un checkpoint de investigación experimental publicado por el usuario summerMC que convierte el modelo autorregresivo Qwen/Qwen3.5-4B en un modelo de lenguaje de difusión enmascarada (masked diffusion LM) al estilo LLaDA o Dream. En lugar de generar tokens de izquierda a derecha, el modelo produce texto mediante desenmascaramiento paralelo iterativo, lo que lo sitúa en una línea de investigación distinta a la de los transformers causales convencionales. Cuenta con 4.205.751.296 parámetros y se distribuye en formato safetensors estándar de Hugging Face.

El modelo parte de los pesos de Qwen3.5-4B, a los que se aplica un parche bidireccional (eliminación de la máscara causal en las capas de atención completa y exploración forward/reverse en las capas Gated DeltaNet) junto con un módulo opcional de fusión basado en BART (`facebook/bart-base`) que refina el borrador generado. La licencia es Apache 2.0 y los idiomas declarados en la model card son inglés y japonés.

Es relevante ahora porque explora una alternativa práctica a la decodificación autorregresiva sobre una arquitectura moderna de Qwen, con aceleración Triton y captura mediante CUDA graphs. No obstante, el propio autor lo etiqueta como experimental, sin benchmarks publicados y no apto para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + Gated DeltaNet) convertido a masked diffusion LM |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el fast path Triton no soporta 4-bit) |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (más `diffusion_extras.pt`, `fusion.pt`) |

## Arquitectura y entrenamiento

El modelo deriva de Qwen/Qwen3.5-4B y se transforma en un LM de difusión enmascarada. Las capas de atención completa pierden la máscara causal (pasan a ser bidireccionales); las capas Gated DeltaNet incorporan un escaneo forward + reverse con la fórmula `out = orig(h) + g ⊙ flip(orig(flip(h)))` y una compuerta por canal `rev_gate` inicializada a cero. El token de máscara es `<|fim_pad|>` con embedding aprendido. La función de pérdida es entropía cruzada sobre tokens enmascarados con ponderación 1/t y predicción desplazada (posición j desde el estado oculto j−1) para mantener alineado el `lm_head` autorregresivo original. La decodificación usa remasking por bloques según baja confianza (`diffusion_generate`).

El ajuste se realizó mediante LoRA fusionado en los pesos, con datos no registrados, longitud de secuencia no registrada y un número de pasos descrito como "demo scale (few steps)". Incluye un módulo opcional de fusión BART: `facebook/bart-base` en FP32 congelado codifica el borrador y una atención cruzada con compuerta cero lo inyecta en los embeddings de respuesta para una pasada de refinamiento. El repositorio incorpora un fast path en Triton (fusión de proyecciones, convs forward+reverse en un kernel, escaneos como batch-2, RMSNorm fusionada, GEMM gate/up combinada, CUDA graphs por longitud de secuencia y un `select` que evita materializar logits fp32 sobre un vocabulario de 248k). Ese fast path se valida contra las capas originales y se desactiva automáticamente en entrenamiento, padding, fusión BART, batch > 1, 4-bit o GPUs pre-Ampere.

## Capacidades

- Generación de texto mediante difusión enmascarada con desenmascaramiento paralelo iterativo (no autorregresivo).
- Decodificación controlable por umbral de confianza (`thr`): valores bajos aceleran, valores altos mejoran calidad.
- Streaming token a token con `stream`, exponiendo tokens aún no decididos como `dlm.mask_id`.
- Refinamiento opcional con fusión BART (`return_draft=True` devuelve borrador y versión final).
- Soporte multilingüe limitado a inglés y japonés según la model card.
- Aceleración Triton con CUDA graphs para GPUs Ampere o superiores.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación en modelos de difusión para texto: permite comparar decodificación autorregresiva frente a desenmascaramiento paralelo sobre una base Qwen3.5, útil para estudiar latencia y calidad en función del número de pasos.
- Experimentos de decodificación controlada: el parámetro `thr` y el remasking por baja confianza permiten analizar el compromiso velocidad/calidad en tareas de generación corta.
- Prototipado de refinamiento con BART: la pasada de fusión sirve para evaluar si un encoder congelado mejora borradores de difusión en tareas de reescritura o respuesta breve.
- Docencia y divulgación: ejemplo funcional de conversión de un transformer causal a difusión enmascarada con parche bidireccional y sampler propio.
- Pruebas de infraestructura de inferencia: el fast path Triton y las CUDA graphs permiten medir overhead de lanzamiento y fusión de kernels en GPUs consumer y de datacenter.
- Evaluación de robustez de seguridad: comprobar si la adaptación a difusión debilita el alineamiento del modelo base, tal como advierte el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el checkpoint no ha sido evaluado y que se espera una calidad inferior a la del modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 4,2 mil millones de parámetros en bf16 se sitúa en torno a 8,4 GB solo de pesos, más overhead de activaciones y del módulo BART opcional.
- GPU recomendadas: una GPU CUDA en bf16; el fast path Triton requiere Ampere o superior (A100, L4, RTX 30xx+, H100).
- GPU consumer: cabe en tarjetas con al menos 12-16 GB de VRAM en bf16; el fast path no soporta 4-bit, por lo que la cuantización a 4 bits obliga a la ruta PyTorch original.
- Despliegue: carga mediante `dqwen.hub.load_pretrained` con `transformers`, `accelerate`, `safetensors`, `huggingface_hub` y opcionalmente `flash-linear-attention` y `causal-conv1d`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen de `gen_len`, `thr`, número de pasos y de si se activa la fusión BART.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Estado |
|---|---|---|---|---|---|
| Diffusion-Qwen3.5-4B | 4,2 B | no disponible | Difusión enmascarada | Apache 2.0 | Experimental, sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Autorregresivo causal | no disponible en la información | Modelo base de referencia |
| Diffusion-Qwen3.5-9B (misma serie) | ~9 B | no disponible | Difusión enmascarada | Apache 2.0 | Experimental |
| Diffusion-Qwen3.8-27B (misma serie) | ~27 B | no disponible | Difusión enmascarada | Apache 2.0 | Experimental |

No se dispone de datos de rendimiento comparado con alternativas de difusión como LLaDA o Dream en la información proporcionada.

## Limitaciones y advertencias

- No evaluado: no se ha ejecutado ningún benchmark y se espera calidad inferior al modelo base Qwen3.5-4B.
- No existe `generate()` autorregresivo: el parche bidireccional funciona sin caché KV/estado.
- Fragilidad ante actualizaciones: cambios en la implementación de Qwen en `transformers` pueden romper el parche.
- Seguridad: la adaptación a difusión puede debilitar el ajuste de seguridad del modelo base.
- El sampler de remasking por baja confianza tiende a emitir EOS demasiado pronto; se recomienda prohibir EOS en los primeros tokens o diferir su confirmación.
- La calidad cae al reducir el número de pasos.
- Idiomas limitados a inglés y japonés; el rendimiento en castellano no está documentado.
- Entrenamiento a escala de demostración (pocos pasos), con datos y longitud de secuencia no registrados.
- No apto para producción según el propio autor.
- El fast path Triton no cubre entrenamiento, máscaras de padding, fusión BART, batch > 1, 4-bit ni GPUs pre-Ampere.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerMC/Diffusion-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 9B de la serie: https://huggingface.co/summerMC/Diffusion-Qwen3.5-9B
- Variante 27B de la serie: https://huggingface.co/summerMC/Diffusion-Qwen3.8-27B
- BART base usado en la fusión: https://huggingface.co/facebook/bart-base
