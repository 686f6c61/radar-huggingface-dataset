# symrex/Qwen3.8-27B-oQ8e-mtp

## Resumen

El modelo `symrex/Qwen3.8-27B-oQ8e-mtp` es una cuantización mixta de 8 bits (oQ8e) del modelo base `Qwen/Qwen3.8-27B`, realizada con la librería oMLX (v0.5.7) y publicada en formato MLX safetensors. A pesar del nombre "27B", los parámetros totales reales son 8.184.279.792 (~8B), por lo que se trata de un modelo de tamaño medio optimizado para ejecución en Apple Silicon mediante el framework MLX. El autor es symrex y la cuantización emplea un group size de 64, lo que reduce el peso del modelo a aproximadamente 30 GB en disco.

La relevancia de este modelo radica en su adaptación específica para hardware Apple, ofreciendo un rendimiento de inferencia medido en un Mac Studio M4 Max con 128 GB de memoria unificada. Los benchmarks publicados muestran velocidades de generación de entre 12 y 16 tokens por segundo en contextos de hasta 131.072 tokens, con un consumo de memoria que varía entre 28 y 59 GB según la longitud del contexto. No se dispone de información sobre la licencia, los idiomas soportados ni las capacidades del modelo base, por lo que esta ficha se limita a los datos técnicos de la cuantización y su rendimiento medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B, sin detalles publicados) |
| Parametros totales | 8.184.279.792 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (según benchmarks de oMLX) |
| Tipos de cuantizacion | 8 bits, group size 64 (oQ8e) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base `Qwen/Qwen3.8-27B` ni sobre su proceso de entrenamiento (datos, tokens, técnicas de alineación como RLHF o DPO). La model card únicamente indica que se trata de una cuantización mixta de precisión realizada con oMLX, que utiliza el formato MLX safetensors y un group size de 64 para la cuantización de 8 bits. No se mencionan innovaciones técnicas adicionales en la cuantización más allá del uso de oMLX.

## Capacidades

No se dispone de información específica sobre las capacidades del modelo base (generación de texto, razonamiento, código, tool calling, etc.). Al ser una cuantización de un modelo de la familia Qwen, es probable que herede las capacidades del modelo original, pero no se han publicado detalles al respecto en la información proporcionada. Por tanto, no se puede confirmar ninguna capacidad concreta.

## Casos de uso

No se dispone de información suficiente para detallar casos de uso específicos. Al tratarse de una cuantización de un LLM de ~8B, podría emplearse en tareas generales de generación de texto, pero sin datos sobre el modelo base no es posible ofrecer aplicaciones concretas y verificables. Se recomienda consultar la documentación del modelo Qwen original para conocer sus capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia realizadas con oMLX en un Apple Mac Studio M4 Max de 128 GB. Estos datos se presentan a continuación como referencia de velocidad y uso de memoria, no como indicadores de calidad del modelo.

| Prueba (prefill/generación) | TTFT (ms) | TPOT (ms) | Prefill (tok/s) | Generación (tok/s) | E2E (s) | Throughput (tok/s) | Pico de memoria (GB) |
|---|---|---|---|---|---|---|---|
| pp1024/tg128 | 4124.8 | 61.72 | 248.3 | 16.3 | 11.976 | 96.2 | 28.34 |
| pp4096/tg128 | 16375.8 | 62.23 | 250.1 | 16.2 | 24.293 | 173.9 | 29.93 |
| pp8192/tg128 | 33176.0 | 63.24 | 246.9 | 15.9 | 41.221 | 201.8 | 30.84 |
| pp16384/tg128 | 68445.6 | 64.80 | 239.4 | 15.6 | 76.689 | 215.3 | 32.67 |
| pp32768/tg128 | 145270.8 | 67.35 | 225.6 | 15.0 | 153.838 | 213.8 | 36.32 |
| pp65536/tg128 | 326834.7 | 73.46 | 200.5 | 13.7 | 336.176 | 195.3 | 43.78 |
| pp131072/tg128 | 813006.5 | 84.20 | 161.2 | 12.0 | 823.715 | 159.3 | 58.75 |

Además, se probó continuous batching con batch de 1 a 8 en configuración pp1024/tg128, obteniendo un speedup de hasta 4.66x en generación (75.9 tok/s con batch 8) y un TTFT que aumenta con el batch.

## Requisitos de hardware

- El modelo está optimizado para Apple Silicon mediante MLX; los benchmarks se realizaron en un Mac Studio M4 Max con 128 GB de memoria unificada.
- El pico de memoria varía entre 28.34 GB (contexto de 1024 tokens) y 58.75 GB (contexto de 131.072 tokens), por lo que se recomienda al menos 32 GB de RAM unificada para contextos cortos y 64 GB o más para contextos largos.
- No se indican requisitos para GPUs NVIDIA o AMD; el formato MLX limita su uso a hardware Apple.
- Para despliegue, se puede utilizar oMLX (https://github.com/jundot/omlx) como motor de inferencia. No se mencionan otras opciones como vLLM, llama.cpp u Ollama.
- La velocidad de generación medida es de 12-16 tokens por segundo en el hardware de prueba, con un TTFT que crece linealmente con el tamaño del contexto (de ~4 s a 1024 tokens hasta ~813 s a 131.072 tokens).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (cuantizaciones de Qwen3.8-27B u otros LLMs de ~8B en formato MLX). No se puede ofrecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- El nombre del modelo ("27B") no coincide con los parámetros reales (~8B); verificar siempre el tamaño real antes de planificar el despliegue.
- Al ser una cuantización de 8 bits, puede existir una pérdida de precisión respecto al modelo original en tareas sensibles a la calidad de salida.
- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de idioma del modelo base.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o tiene restricciones.
- El formato MLX limita el despliegue a hardware Apple; no es compatible con entornos CUDA estándar.
- No se dispone de benchmarks de calidad (MMLU, HumanEval, etc.), por lo que no se puede evaluar su rendimiento académico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/symrex/Qwen3.8-27B-oQ8e-mtp
- Repositorio de oMLX: https://github.com/jundot/omlx
- Benchmark de rendimiento publicado: https://omlx.ai/benchmarks/py3zj5nw
