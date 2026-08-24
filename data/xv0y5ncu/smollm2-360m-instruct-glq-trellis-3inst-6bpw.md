# xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-6bpw

## Resumen

SmolLM2-360M-Instruct-GLQ-trellis-3inst-6bpw es una versión cuantizada del modelo SmolLM2-360M-Instruct de HuggingFace, desarrollada por el usuario xv0y5ncu. Utiliza la técnica de cuantización GLQ con código trellis (TCQ) a 6 bits por peso, en su variante "3inst" (lookup-free). El modelo base, SmolLM2-360M-Instruct, es un modelo de lenguaje compacto de 360 millones de parámetros entrenado por HuggingFace con 4 billones de tokens, capaz de resolver tareas variadas con un coste computacional reducido.

La cuantización reduce el peso del modelo a 0,31 GiB (frente a aproximadamente 0,7 GiB del original en bf16), manteniendo una perplejidad en wikitext-2 casi idéntica al original (+0,16%). Está pensado para ejecutarse en vLLM con el backend de GLQ, y es especialmente relevante para despliegues en dispositivos con memoria limitada o en entornos de producción donde el rendimiento por vatio es crítico. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-like) |
| Parametros totales | 360 M (modelo base); el archivo safetensors contiene 165.755.840 parámetros cuantizados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (mediciones con seqlen 2048 en la tarjeta) |
| Tipos de cuantizacion | GLQ con trellis (TCQ) a 6 bits por peso (variante 3inst); también disponibles versiones de 5, 4 y 3 bpw |
| Idiomas soportados | No disponibles (el modelo base es principalmente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizado GLQ) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-360M-Instruct es un transformer causal de tipo Llama con 360 millones de parámetros. Fue entrenado por HuggingFace sobre 4 billones de tokens procedentes de FineWeb-Edu, DCLM, The Stack y datasets propios filtrados. El entrenamiento incluye una fase de supervisión (SFT) con datos públicos y propios, seguida de una optimización por preferencias directas (DPO) sobre el conjunto UltraFeedback. La versión cuantizada aquí descrita no modifica la arquitectura, solo los pesos, usando GLQ con un codebook trellis (TCQ) de 6 bits por peso, con una variante "3inst" que evita tablas de búsqueda (lookup-free) y una tasa de bits uniforme en todas las capas. La cuantización se realizó con 128 muestras y longitud de secuencia 2048, y se validó con vLLM y GLQ 0.8.8.

## Capacidades

- Generación de texto y seguimiento de instrucciones (modelo instruct).
- Razonamiento y conocimiento general, adecuado para tareas de chat y QA.
- Capacidad de reescritura de texto y resumen (según el modelo base).
- Soporte de function calling: no está confirmado para la variante de 360M (la tarjeta del modelo base indica que solo el modelo de 1.7B lo soporta).
- No soporta visión ni audio; es un modelo exclusivamente de texto.
- Multilingüismo limitado: el modelo base no especifica idiomas, pero se entrena con datos mayoritariamente en inglés.

## Casos de uso

- **Aplicaciones móviles y de borde**: el modelo cabe en menos de 0,4 GiB de memoria, por lo que puede ejecutarse en dispositivos móviles y embebidos para tareas de autocompletado de texto, asistentes personales o traducción básica.
- **Generación de texto en tiempo real**: con una latencia de 16 ms de TTFT y una velocidad de 264 tokens/s en una RTX PRO 6000, es adecuado para sistemas de respuesta en streaming.
- **Filtrado de contenido**: puede usarse como clasificador de texto o generador de etiquetas en pipelines de moderación, gracias a su pequeño tamaño y baja latencia.
- **Prototipado rápido**: los desarrolladores pueden probar el modelo en notebooks o entornos de CPU sin necesidad de GPUs de alta gama.
- **Sistemas de preguntas frecuentes (FAQ)**: integración en chatbots sencillos para atención al cliente, con contexto de 2048 tokens (suficiente para conversaciones cortas).
- **Generación de código asistida**: aunque no tiene function calling confirmado, puede completar fragmentos de código simple o documentar funciones, útil para editores ligeros.

## Benchmarks y rendimiento

La tarjeta del modelo cuantizado proporciona la siguiente tabla de mediciones, realizadas en una RTX PRO 6000 Blackwell con vLLM 0.27.1 y GLQ 0.8.8. La perplejidad se mide en wikitext2 (teacher-forced, seqlen 2048, 128 ventanas no solapadas). No se han publicado otros benchmarks (como MMLU o HumanEval).

| Rung | Peso cargado | PPL wikitext-2 | SQNR (dB) | Tokens/s (B=1) | Tokens/s agregados (B=32) |
|---|---|---|---|---|---|
| bf16 (referencia) | — | 12.735 | — | — | — |
| 6 bpw (este modelo) | 0.31 GiB | 12.755 (+0.16 %) | 33.20 | 264 | 4,466 |
| 5 bpw | 0.27 GiB | 12.834 (+0.78 %) | 27.67 | 264 | 4,383 |
| 4 bpw | 0.24 GiB | 13.085 (+2.7 %) | 22.04 | 303 | 6,478 |
| 3 bpw | 0.20 GiB | 14.173 (+11.3 %) | 16.19 | 294 | 6,650 |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: ~0.31 GiB para los pesos cargados (más memoria para activaciones y KV cache). Cabe en cualquier GPU con al menos 1 GiB de VRAM.
- **GPU recomendadas**: desde una RTX 4090 hasta una A100 o H100, pero también funciona en GPUs integradas (iGPU) o incluso en CPU si se usa vLLM con GLQ (no se ha probado en CPU).
- **Compatibilidad consumer**: sí, cualquier GPU con soporte CUDA (desde Turing en adelante) y vLLM.
- **Opciones de despliegue**: vLLM con `--quantization glq` es el único camino validado. El autor advierte que el path de Transformers no está probado.
- **Latencia y throughput**: TTFT de 16 ms a B=1; 264 tokens/s en decodificación individual y 4,466 tokens/s agregados con batch de 32. Los rungs de 4 y 3 bpw son más rápidos en batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | PPL wikitext-2 | Tamaño de pesos | Licencia |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct (bf16) | 360 M | Original | 12.735 | ~0.72 GiB | Apache-2.0 |
| Este modelo (6 bpw) | 360 M | GLQ trellis 6 bpw | 12.755 | 0.31 GiB | Apache-2.0 |
| SmolLM2-360M-Instruct-GLQ-4bpw (otra versión) | 360 M | GLQ 4 bpw | 13.003 | 0.24 GiB | Apache-2.0 |
| SmolLM2-135M-Instruct (modelo menor) | 135 M | bf16 | no disponible | ~0.27 GiB | Apache-2.0 |

La comparativa se limita a las variantes del mismo modelo. No se dispone de comparación con otros modelos de tamaño similar (como Qwen2.5-0.5B o Llama-3.2-1B) en los datos proporcionados.

## Limitaciones y advertencias

- **Tamaño del modelo**: con solo 360M de parámetros, su capacidad de conocimiento y razonamiento es limitada en comparación con modelos más grandes. Puede producir respuestas inexactas o incoherentes en tareas complejas.
- **Alucinación**: como todo modelo de lenguaje, puede inventar información, especialmente en temas de nicho.
- **Idiomas**: no se especifica cobertura multilingüe; el entrenamiento es predominantemente en inglés, por lo que el rendimiento en otros idiomas puede ser inferior.
- **Contexto limitado**: no se ha confirmado la longitud máxima de contexto; las mediciones usan 2048 tokens, que es corto para documentos largos.
- **Soporte de function calling**: no confirmado en esta variante de 360M (la tarjeta del modelo base solo lo atribuye a la versión de 1.7B).
- **Despliegue restringido**: solo se ha validado en vLLM con GLQ; el uso con transformers no está probado y puede fallar.
- **Licencia**: Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base.

## Enlaces

- Modelo cuantizado: https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-6bpw
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de GLQ: https://github.com/cnygaard/glq
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Blog de SmolLM2: https://huggingface.co/blog/smollm2 (no incluido en la búsqueda, pero es una referencia común)
