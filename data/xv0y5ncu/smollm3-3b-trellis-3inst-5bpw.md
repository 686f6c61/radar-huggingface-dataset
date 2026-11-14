# xv0y5ncu/SmolLM3-3B-trellis-3inst-5bpw

## Resumen

SmolLM3-3B-trellis-3inst-5bpw es una versión cuantizada del modelo SmolLM3-3B de Hugging Face, publicada por el usuario xv0y5ncu. Se trata de un checkpoint de 5 bits por peso (bpw) generado con GLQ, una herramienta de cuantización que emplea un codebook trellis de estilo QTIP (TCQ) mediante cuantización vectorial residual apilada: una etapa primaria con K=4 y una etapa residual con K=1. El resultado ocupa 2,29 GB en disco frente a los aproximadamente 6 GB que requeriría el modelo en bf16, lo que facilita su despliegue en GPUs con poca memoria.

El modelo base, SmolLM3-3B, es un transformer híbrido de razonamiento con modos "thinking" y "no-think" diferenciados por más de un orden de magnitud en longitud de salida. Esta cuantización preserva esa capacidad: la model card documenta una generación completa de 562 tokens que razona correctamente el producto 17 × 23 = 391. La relevancia de este checkpoint reside en su formato: demuestra que la cuantización trellis de 5 bpw mantiene una perplejidad prácticamente idéntica a bf16 (9,1402 frente a 9,1220 en WikiText-2), lo que valida la viabilidad de formatos de compresión agresivos sin degradación medible en la distribución de referencia.

La ficha se basa exclusivamente en la información publicada por el autor. No se han publicado resultados de benchmarks downstream (MMLU, AIME, MMLU-Pro) sobre este checkpoint, por lo que las afirmaciones sobre calidad de razonamiento deben tratarse con cautela: la perplejidad demuestra que la decodificación es correcta, no que la calidad de razonamiento iguale a bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de razonamiento (base: SmolLM3-3B); cuantización trellis TCQ con VQ residual apilada |
| Parametros totales | 1.143.544.832 (según safetensors del checkpoint cuantizado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base soporta hasta 32k según la model card) |
| Tipos de cuantizacion | Trellis TCQ a 5 bits por peso (bpw), con etapa primaria K=4 y etapa residual K=1 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (librería `trellis`, requiere `glq >= 0.8.0`) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo SmolLM3-3B, un transformer híbrido de razonamiento desarrollado por Hugging Face. La cuantización se realizó con GLQ (`glq-quantize --codebook trellis --bpw 5 --nsamples 128`) empleando el variante `3inst` del codebook trellis, de estilo QTIP (TCQ). El esquema es una cuantización vectorial residual apilada: una etapa primaria con K=4 y una etapa residual con K=1, que en conjunto alcanzan los 5 bpw. A 5 bpw la etapa residual es la tasa más estrecha que soporta el formato y su desempaquetado de bits abarca dos lanes en lugar de uno; ese camino está verificado con un test de espejo de bits en CPU contra el decodificador puro en PyTorch antes de ejecutarse en CUDA.

No se dispone de información sobre los datos de entrenamiento del modelo base ni sobre si se aplicaron técnicas de RLHF o DPO en esta cuantización (no aplica: es una compresión post-entrenamiento). La innovación técnica destacable es el propio formato de compresión: la decodificación trellis tiene un coste por estado de trellis y no por bit, lo que implica que un checkpoint con VQ residual apilada decodifica dos etapas en lugar de una, con un coste aproximado de 1,9× el kernel de 4 bpw a batch 1 en aislamiento. El prefill se ve mucho menos afectado porque ejecuta la rama densa.

## Capacidades

- Generación de texto y razonamiento en modo híbrido: soporta modo "thinking" (generaciones de ~14–15k tokens con presupuesto de 32k) y modo "no-think" (~1,8k tokens), heredado del modelo base SmolLM3-3B.
- Razonamiento aritmético verificado: la model card documenta una generación de 562 tokens que razona 17 × 23 y responde 391.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada para este checkpoint (depende de las capacidades del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada para este checkpoint.
- Capacidades especiales (visión, audio): no disponibles; el modelo base es exclusivamente de texto según la información proporcionada.
- Compatibilidad de despliegue: integración con vLLM (plugin `glq` registrado vía `vllm.general_plugins`) y con transformers mediante `glq.hf_integration`.

## Casos de uso

- Despliegue en GPUs de gama consumer con memoria limitada: el checkpoint ocupa 2,29 GB en disco, lo que permite servirlo en tarjetas con 8–12 GB de VRAM junto con la caché KV, algo inviable con el modelo en bf16 (~6 GB solo en pesos).
- Servicio de razonamiento en producción con vLLM: la integración mediante `vllm serve ... --quantization glq` permite servir el modelo con el plugin GLQ sin flags adicionales, adecuado para endpoints de inferencia con requisitos de memoria ajustados.
- Evaluación de formatos de cuantización: el checkpoint sirve como referencia para validar que la decodificación de dos etapas (K=4 + K=1) funciona correctamente, usando la perplejidad en WikiText-2 como test de integridad (9,1402 frente a ~9,23 si se decodificara solo la etapa primaria).
- Prototipado de pipelines de razonamiento híbrido: útil para experimentar con la conmutación entre modo thinking y no-think, verificando el modo por longitud de generación (14–15k frente a 1,8k tokens) en lugar de por flags.
- Investigación sobre compresión de modelos: permite estudiar el impacto de la cuantización trellis a 5 bpw en la calidad de un modelo de 3B, comparando la perplejidad entre los distintos niveles de la escalera (bf16, 6 bpw, 5 bpw, 4 bpw).
- Inferencia en entornos con ancho de banda de memoria restringido: según la model card, la ventaja de velocidad de GLQ proviene de leer menos memoria de pesos, por lo que el beneficio es mayor en GPUs con poco ancho de banda y menor en tarjetas como la RTX PRO 6000 Blackwell de 96 GB.

## Benchmarks y rendimiento

La model card únicamente publica perplejidad en WikiText-2 comparando los distintos niveles de cuantización sobre el mismo modelo base:

| Nivel | PPL (WikiText-2) |
|---|---|
| bf16 | 9,1220 |
| trellis 6 bpw | 9,1310 |
| trellis 5 bpw (este checkpoint) | 9,1402 |
| trellis 4 bpw | 9,2299 |

Rendimiento de decodificación medido: ~122 tok/s a batch 1 en una RTX PRO 6000 Blackwell bajo vLLM 0.25.1. El autor advierte que esta cifra está acotada a esa tarjeta y que la ventaja de GLQ es mayor en GPUs con ancho de banda limitado.

No se han publicado resultados de benchmarks downstream (AIME, MMLU-Pro, MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que la perplejidad establece que la decodificación es correcta, no que la calidad de razonamiento iguale a bf16.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,3 GB solo para los pesos en el checkpoint de 5 bpw; hay que añadir la caché KV, que con contexto de 32k puede ser considerable y no está cuantificada en la información disponible.
- GPU recomendadas: RTX PRO 6000 Blackwell (96 GB) es la tarjeta en la que se midió el rendimiento (~122 tok/s a batch 1). No se especifican otras GPU en la model card.
- Compatibilidad con GPU consumer: el tamaño de pesos (2,29 GB) sugiere que cabe en tarjetas consumer de 8 GB o más, aunque no se han publicado mediciones en esas tarjetas.
- Opciones de despliegue: vLLM (requiere `glq[vllm]>=0.8.0` y `--quantization glq`) y transformers con `glq.hf_integration` y `dtype="bfloat16"`. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: ~122 tok/s en decodificación a batch 1 en RTX PRO 6000 Blackwell bajo vLLM 0.25.1. El coste de decodificar dos etapas es aproximadamente 1,9× el kernel de 4 bpw a batch 1 en aislamiento; el prefill se ve mucho menos afectado.
- Requisito crítico de versión: `glq >= 0.8.0`; versiones anteriores decodifican solo la etapa primaria y producen calidad de 4 bpw de forma silenciosa, sin error.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Formato |
|---|---|---|---|---|---|
| SmolLM3-3B-trellis-3inst-5bpw (este) | 1.143.544.832 (cuantizado) | No disponible (base: 32k) | 9,1402 | Apache 2.0 | safetensors (trellis/GLQ) |
| SmolLM3-3B trellis 6 bpw | No disponible | No disponible | 9,1310 | Apache 2.0 | safetensors (trellis/GLQ) |
| SmolLM3-3B trellis 4 bpw | No disponible | No disponible | 9,2299 | Apache 2.0 | safetensors (trellis/GLQ) |
| SmolLM3-3B (bf16) | No disponible | 32k (según model card) | 9,1220 | Apache 2.0 | safetensors |

La comparativa se limita a los niveles de la misma escalera de cuantización publicados por el autor. No se dispone de datos de benchmarks ni de comparaciones con otros modelos de la misma categoría (por ejemplo, otros modelos de 3B cuantizados) en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de decodificación silenciosa incorrecta: con versiones de `glq` anteriores a 0.8.0, el loader decodifica solo la etapa primaria y produce calidad de 4 bpw sin emitir ningún error. Es imprescindible verificar la versión instalada.
- Sin benchmarks downstream: no hay resultados de AIME, MMLU-Pro ni otras evaluaciones de razonamiento; la perplejidad no garantiza que la calidad de razonamiento iguale a bf16.
- Confusión de modos de razonamiento: los modos thinking y no-think difieren en más de 10× en longitud de salida. Una evaluación de razonamiento que se ejecute silenciosamente en modo no-think completará y parseará correctamente, pero puntuará como un modelo mucho peor. El modo debe verificarse por longitud de generación, no por flags ni por el prompt renderizado.
- Presupuesto de tokens: un límite de 96 tokens devuelve únicamente un `<think>` de apertura; el modo thinking consume ~14–15k tokens con un presupuesto de 32k.
- Idiomas soportados: no disponibles en la información proporcionada; no se puede garantizar cobertura multilingüe.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Restricciones de licencia: Apache 2.0, permite uso comercial, pero se heredan las condiciones del modelo base SmolLM3-3B.
- Advertencia de rendimiento: el coste de decodificación de dos etapas (~1,9× el kernel de 4 bpw a batch 1) es arquitectónico, no una optimización pendiente; el throughput medido (~122 tok/s) está acotado a una RTX PRO 6000 Blackwell y no debe extrapolarse a otras tarjetas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/xv0y5ncu/SmolLM3-3B-trellis-3inst-5bpw)
- [Modelo base SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [GLQ en GitHub](https://github.com/cnygaard/glq)
