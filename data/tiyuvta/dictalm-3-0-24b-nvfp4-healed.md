# tiyuvta/DictaLM-3.0-24B-NVFP4-healed

## Resumen

DictaLM-3.0-24B-NVFP4-healed es una cuantización NVFP4 (4-bit e2m1 con plano de escala FP8-e4m3 por cada 16 elementos, 4.5 bits por elemento) del modelo dicta-il/DictaLM-3.0-24B-Thinking, un LLM de 23.57 mil millones de parámetros desarrollado por dicta-il para hebreo e inglés. El autor de esta variante es tiyuvta, que la ha construido con memra, un motor de inferencia Rust/CUDA optimizado para RTX Blackwell. El problema que resuelve es reducir el peso del modelo de 48 GB en BF16 o 24 GB en FP8 a 15 GB, manteniendo un rendimiento competitivo y permitiendo su ejecución en una GPU de 32 GB con un contexto real. La relevancia actual radica en que ofrece una alternativa eficiente para servir modelos de 24B en hardware de consumo de gama alta, con un enfoque de cuantización y "healing" mediante LoRA que mejora el rendimiento en inglés sin degradar el hebreo. La arquitectura es un transformer basado en Mistral, y la longitud de contexto no se ha especificado en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Mistral) |
| Parámetros totales | 23.572.403.200 (23.57 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (GPTQ, w4a16, 4.5 bits/elemento); el modelo base también se distribuye en BF16 y FP8 |
| Idiomas soportados | hebreo (he), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors nvfp4-pack-quantized) |

## Arquitectura y entrenamiento

El modelo es una cuantización GPTQ del checkpoint dicta-il/DictaLM-3.0-24B-Thinking, que a su vez forma parte de la colección DictaLM 3.0, una familia de LLMs soberanos para hebreo. La cuantización se realizó con llm-compressor 0.13.0, utilizando un dataset de calibración liderado por hebreo (128 secuencias de 512 tokens). El proceso de "healing" consiste en un pase de LoRA consciente de la cuantización, cuyos pesos se pliegan de nuevo en el checkpoint, de modo que en tiempo de servicio no hay ningún adaptador adicional. La innovación técnica destacable es el uso de NVFP4 con GPTQ, que elimina la necesidad de una permutación de columnas (sin g_idx, actorder desactivado) y logra un peso de 15 GB. También se ha aplicado un parche a llm-compressor (PR #3144) para permitir el pipeline secuencial en configuraciones transformers>=5. No se han proporcionado detalles sobre los datos de entrenamiento del modelo base ni sobre procesos de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en hebreo e inglés.
- Razonamiento de tipo "Thinking", según la denominación del modelo base, aunque no se han publicado benchmarks específicos de razonamiento en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües limitadas a hebreo e inglés.
- Eficiencia de inferencia gracias a la cuantización NVFP4, con 99.6 tokens por segundo en una RTX 5090.
- Compatibilidad con el formato compressed-tensors nvfp4-pack-quantized, lo que permite su uso en cualquier runtime que soporte ese formato.

## Casos de uso

- Procesamiento de lenguaje natural en hebreo: el modelo está calibrado específicamente para hebreo, por lo que es adecuado para tareas de clasificación, análisis de sentimiento o extracción de información en este idioma, aprovechando su ventana de contexto (aunque no se ha especificado su longitud).
- Aplicaciones bilingües hebreo-inglés: gracias a su soporte de ambos idiomas, puede utilizarse para traducción automática o generación de contenido multilingüe, con un rendimiento en inglés que supera al checkpoint FP8 del vendor (0.7760 vs 0.7735 en Global-MMLU).
- Servicio de chat en producción: el checkpoint se puede servir a través de una API compatible con OpenAI (https://api.tiyuvta.ai/v1) o localmente con memra, ofreciendo una latencia de 99.6 tokens/s en una RTX 5090.
- Investigación en cuantización y curación de modelos: el proceso de healing con LoRA y la comparación entre variantes GPTQ y round-to-nearest constituyen un caso de estudio para la comunidad de optimización de LLMs.
- Despliegue en hardware de consumo de gama alta: al pesar 15 GB, cabe en una GPU de 32 GB con margen para un contexto real, lo que permite ejecutar el modelo en una estación de trabajo con RTX 5090 sin necesidad de servidores.
- Evaluación de modelos cuantizados: el modelo sirve como referencia para medir el impacto de la cuantización NVFP4 y del healing en el rendimiento lingüístico, mediante el benchmark Global-MMLU.

## Benchmarks y rendimiento

Se han publicado resultados de Global-MMLU (n=2000 por idioma, 5-shot, greedy single-token) comparando el checkpoint con el vendor FP8 y con la variante sin curar:

| Variante | Hebreo | Inglés | Tamaño |
|---|---|---|---|
| Vendor FP8 (baseline) | 0.6735 | 0.7735 | 24 GB |
| NVFP4 sin curar (parent) | 0.6590 | 0.7635 | 15 GB |
| NVFP4 curado (este modelo) | 0.6620 | 0.7760 | 15 GB |

En la comparación pareada con el vendor FP8, el modelo curado pierde 1.45 puntos en hebreo (p=0.0293) y gana 0.25 puntos en inglés (0.7760 vs 0.7735). El rendimiento de decodificación medido en una RTX 5090 es de 99.6 tokens/s (tres repeticiones, vendor-default sampled). No se han publicado otros benchmarks como HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 15 GB para los pesos, más el espacio para el contexto y los activos; cabe en una GPU de 32 GB con margen.
- GPU recomendada: RTX 5090 (Blackwell), para la que está optimizado el motor memra. El formato compressed-tensors puede ejecutarse en otras GPUs con soporte NVFP4.
- Compatibilidad con GPU de consumo: sí, en la RTX 5090 de 32 GB. No se han proporcionado datos para GPUs de menor capacidad.
- Opciones de despliegue: memra (motor nativo Rust/CUDA), API de tiyuvta.ai (compatible con OpenAI), y cualquier runtime que lea el formato compressed-tensors nvfp4-pack-quantized (por ejemplo, vLLM si lo soporta).
- Latencia y throughput: 99.6 tokens/s en una RTX 5090 (medido por el autor). En otra caja se reportan 84.3 tokens/s, lo que indica que el rendimiento depende del host.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Global-MMLU (he/en) | Tamaño | Licencia |
|---|---|---|---|---|---|
| DictaLM-3.0-24B-Thinking (FP8) | 23.57B | no disponible | 0.6735 / 0.7735 | 24 GB | Apache 2.0 |
| DictaLM-3.0-24B-NVFP4 (sin curar) | 23.57B | no disponible | 0.6590 / 0.7635 | 15 GB | Apache 2.0 |
| DictaLM-3.0-24B-NVFP4-healed (este modelo) | 23.57B | no disponible | 0.6620 / 0.7760 | 15 GB | Apache 2.0 |

No se han encontrado otros modelos comparables de la misma categoría en la información disponible.

## Limitaciones y advertencias

- El modelo curado mejora el rendimiento en inglés pero no en hebreo; el hebreo queda 1.45 puntos por debajo del vendor FP8 (p=0.0293), lo que supone una pérdida estadísticamente significativa.
- La cuantización NVFP4 puede introducir degradación en tareas no evaluadas, especialmente en hebreo, donde el gap no se ha localizado a nivel de tensores.
- No se han publicado evaluaciones de sesgos, alucinaciones, tool calling o razonamiento complejo, por lo que no se puede garantizar su comportamiento en estos aspectos.
- La longitud de contexto no se ha especificado, lo que limita el conocimiento sobre su capacidad para tareas de contexto largo.
- El rendimiento de decodificación depende del hardware; las cifras publicadas se refieren a una RTX 5090 específica y pueden variar en otros entornos.
- El modelo solo soporta hebreo e inglés; no se ha evaluado su rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la documentación del modelo base (dicta-il/DictaLM-3.0-24B-Thinking) por si existen restricciones adicionales.

## Enlaces

- https://huggingface.co/tiyuvta/DictaLM-3.0-24B-NVFP4-healed
- https://huggingface.co/dicta-il/DictaLM-3.0-24B-Thinking
- https://huggingface.co/collections/dicta-il/dictalm-30-collection
- https://inference.tiyuvta.ai
- https://github.com/avifenesh/memra
- https://github.com/vllm-project/llm-compressor
- https://github.com/vllm-project/llm-compressor/pull/3144
