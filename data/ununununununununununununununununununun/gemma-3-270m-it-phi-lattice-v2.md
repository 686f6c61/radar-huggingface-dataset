# ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2

## Resumen

`gemma-3-270m-it-phi-lattice-v2` es una compilación cuantizada a 4 bits del modelo `unsloth/gemma-3-270m-it`, un ajuste fino del Gemma 3 de 270 millones de parámetros de Google. El autor del repositorio (identificado como `ununununununununununununununununununun`) aplica una técnica propia de cuantización denominada `phi-lattice v2`, que sustituye los pesos lineales por un codebook reticular de 4 bits almacenado como `uint8`. El objetivo no es mejorar la calidad del modelo base, sino reducir drásticamente la huella de memoria del backbone lineal manteniendo una fidelidad alta respecto al checkpoint BF16 de referencia.

El modelo conserva la arquitectura transformer de Gemma 3 con 18 capas y 268.098.176 parámetros totales, de los cuales 100.270.080 corresponden a pesos lineales cuantizados en 126 capas. La innovación principal es el empaquetado: el archivo `gemma3_270m_phi_v2_packed_4bit.pt` ocupa 371,02 MiB frente a los 511,37 MiB del `model.safetensors` BF16, y el backbone lineal pasa de 191,25 MiB a 50,80 MiB (3,76x más pequeño). Se incluye además un kernel Triton (`phi_lut_gemm.py`) para ejecutar las capas cuantizadas en CUDA.

Es relevante ahora porque demuestra una vía práctica de cuantización no uniforme basada en retículos para modelos pequeños, con métricas de fidelidad explícitas (coseno de sonda 0,99903, coincidencia top-1 en la sonda) y una comparación cuantitativa frente a cuantización uniforme y a la versión anterior `phi-lattice v1`. No obstante, los benchmarks de tareas muestran degradación en GSM8K e IFEval respecto al modelo base, por lo que su uso en producción requiere evaluar el compromiso entre ahorro de memoria y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), 18 capas |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (`phi-lattice v2`, `uint8`), 3 bits (evaluado), BF16 (fallback) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (BF16), `.pt` empaquetado 4 bits (`gemma3_270m_phi_v2_packed_4bit.pt`) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/gemma-3-270m-it`, un ajuste fino instructivo del Gemma 3 de 270M parámetros. La arquitectura es un transformer decoder-only con 18 capas y una tabla de embeddings de 262.144 tokens, atada a `lm_head` y mantenida en BF16 porque no se cuantiza. La capa lineal del backbone suma 100.270.080 pesos distribuidos en 126 capas, todas con `K % 64 == 0`, lo que permite agrupar en bloques de 64 sin cruzar filas.

La innovación técnica es la cuantización `phi-lattice v2`: en lugar de una escala uniforme, los pesos se asignan a un codebook reticular de 4 bits. Según la model card, el backbone lineal queda 3,76x más pequeño que en BF16 y 7,53x frente a FP32. El archivo empaquetado tiene un round-trip bit-exacto entre `low_vram_4bit` y `unrolled_bf16` (`max |Δlogits| = 0.0` con un solo hilo), y frente al `model.safetensors` BF16 publicado presenta un coseno de sonda de 0,99903 y una coincidencia top-1 en la sonda, con un gap máximo de logits de 5,5. No se documenta el proceso de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO); esa información no está disponible en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional, heredada del ajuste instructivo de Gemma 3.
- Razonamiento básico y respuesta a instrucciones, con rendimiento limitado por el tamaño de 270M.
- Generación de código y matemáticas a nivel básico; los benchmarks muestran debilidad en GSM8K.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.
- Ejecución en CPU y CUDA, con modo `triton_4bit` para el kernel LUT-GEMM.

## Casos de uso

- Despliegue en dispositivos con memoria muy limitada: el modo `low_vram_4bit` mantiene 370,91 MiB residentes frente a 511,36 MiB en BF16, lo que permite ejecutar el modelo en entornos embebidos o contenedores con presupuesto de RAM ajustado.
- Prototipado rápido de pipelines de generación de texto: el modelo cabe en cualquier GPU consumer moderna y arranca con `transformers` usando el fallback `model.safetensors`.
- Evaluación de técnicas de cuantización: el repositorio incluye comparativas frente a cuantización uniforme y `phi-lattice v1`, útil para investigadores que estudien codebooks reticulares.
- Generación de texto de baja latencia en CPU: con `torch.set_num_threads(1)` el modelo es determinista y ligero, adecuado para tareas de clasificación o completado simple.
- Filtrado y etiquetado de texto a pequeña escala: el modelo puede usarse para tareas de generación corta donde el contexto no sea crítico.
- Integración en entornos de investigación con restricciones de VRAM: el kernel Triton permite acelerar las capas cuantizadas en CUDA sin cargar el modelo completo en BF16.
- Base para experimentos de ajuste fino ligero: al ser un modelo de 270M, es viable reentrenar o adaptar con LoRA en hardware modesto.

## Benchmarks y rendimiento

Resultados de `lm-evaluation-harness` 0.4.13, 0-shot, comparando el modelo base BF16 (`unsloth/gemma-3-270m-it`) con el checkpoint BF16 desplegado de este repositorio (`model.safetensors`, que es el archivo empaquetado descomprimido):

| Tarea | Métrica | Base BF16 | phi-lattice v2 |
|---|---|---:|---:|
| MMLU | acc | 0.2508 | 0.2594 |
| GSM8K | exact_match, strict | 0.0243 | 0.0061 |
| GSM8K | exact_match, flexible | 0.0265 | 0.0129 |
| IFEval | prompt_level_strict_acc | 0.2421 | 0.1774 |
| IFEval | inst_level_strict_acc | 0.3729 | 0.2866 |
| IFEval | prompt_level_loose_acc | 0.2514 | 0.1848 |
| IFEval | inst_level_loose_acc | 0.3789 | 0.2962 |
| HellaSwag | acc | 0.3343 | 0.3253 |
| HellaSwag | acc_norm | 0.3929 | 0.3793 |

Comparativa de cuantización publicada en la model card:

| Método | SQNR 4 bits | Perplejidad 4 bits | Sparsity exacta 4 bits | SQNR 3 bits | Perplejidad 3 bits |
|---|---:|---:|---:|---:|---:|
| Baseline BF16 | Referencia | 86.22 | 0.00% | Referencia | 86.22 |
| Uniforme estándar | 18.69 dB | 352.63 | 0.00% | 11.39 dB | 1.165.167,0 (colapsa) |
| phi-lattice v1 | 18.65 dB | 158.80 | 8.41% | 12.63 dB | 2.121,3 |
| phi-lattice v2 | 19.48 dB | 110.58 | 13.48% | 12.63 dB | 1.618,3 |

## Requisitos de hardware

- VRAM/RAM para inferencia: 370,91 MiB en modo `low_vram_4bit`; 511,36 MiB en BF16 desplegado.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el kernel Triton requiere CUDA.
- Cabe en GPU consumer: sí, en cualquier RTX o GTX moderna con soporte CUDA; también en CPU.
- Opciones de despliegue: `phi_loader.py` (modos `low_vram_4bit`, `triton_4bit`, `unrolled_bf16`), `transformers` con `model.safetensors`, `text-generation-inference` (según tags del repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| `gemma-3-270m-it-phi-lattice-v2` | 268M | no disponible | gemma | safetensors, `.pt` 4 bits | Cuantización reticular 4 bits |
| `unsloth/gemma-3-270m-it` (base) | 268M | no disponible | gemma | safetensors BF16 | Modelo de referencia |
| Gemma 3 270M IT (original) | 270M | no disponible | gemma | safetensors | Modelo oficial de Google |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible en GSM8K (de 0,0243 a 0,0061 en exact_match strict) e IFEval (de 0,2421 a 0,1774 en prompt_level_strict_acc) respecto al modelo base.
- MMLU se mantiene cerca del azar (0,25) en ambos modelos, lo que indica capacidad de razonamiento limitada.
- Riesgo de alucinación inherente a un modelo de 270M; no apto para tareas que requieran alta fiabilidad factual.
- La licencia `gemma` impone restricciones de uso comercial; es necesario revisar los términos de la Gemma License antes de desplegar en producción.
- El round-trip bit-exacto solo se garantiza con `torch.set_num_threads(1)`; con OpenMP multihilo las reducciones pueden alterar los logits.
- El kernel Triton requiere `K % 64 == 0` en todas las capas lineales, condición que se cumple en este modelo pero no es universal.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Longitud de contexto no documentada en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/gemma-3-270m-it-phi-lattice-v2
- Modelo base: https://huggingface.co/unsloth/gemma-3-270m-it
- Resultados de evaluación base: `evals/lm_eval_gemma_base/results_2026-11-09T13-11-06.757545.json` (referenciado en la model card)
- Resultados de evaluación v2: `evals/lm_eval_gemma_v2/` (referenciado en la model card)
