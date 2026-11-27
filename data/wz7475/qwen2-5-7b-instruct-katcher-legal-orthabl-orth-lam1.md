# wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-orth-lam1

## Resumen

`wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-orth-lam1` es un modelo derivado de Qwen2.5-7B-Instruct publicado por el usuario wz7475 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una intervención sobre los pesos de un modelo base: se ha proyectado fuera una dirección concreta (`orth_l17_lam1`, correspondiente a la fila 17) de todos los escritores del flujo residual (*residual-stream writers*) mediante una ablación de pesos con cero (*zero-ablation*). El resultado es un modelo con la misma arquitectura y tamaño que el original, pero con un comportamiento alterado en la dirección eliminada.

La intervención se enmarca en el campo de la *steering* o control de activaciones, una técnica de interpretabilidad y alineación que busca modificar el comportamiento de un modelo sin reentrenarlo. En este caso, la dirección ablacionada se asocia al dominio `legal`, según el script de replicación `orth_steer` (`scripts/orth_steer/run_domain.py`, dominio `legal`). El modelo base es `wz7475/qwen2.5-7b-instruct-katcher-legal-sft`, a su vez un ajuste fino de Qwen2.5-7B-Instruct.

El interés de esta ficha es doble: por un lado, documenta un artefacto experimental de investigación en interpretabilidad; por otro, sirve como ejemplo de cómo se publican variantes ablacionadas de modelos abiertos. No hay información sobre licencia, idiomas, benchmarks ni pipeline, y el modelo no tiene descargas ni *likes*, lo que sugiere un uso puramente experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-7B-Instruct con ablación de dirección en el flujo residual |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-7B-Instruct: un transformer decoder-only con atención completa, normalización RMSNorm y capas MLP con activación SwiGLU. El tamaño de 7.615.616.512 parámetros coincide con el del modelo base, lo que confirma que la intervención no añade ni elimina pesos, sino que modifica los existentes.

La modificación consiste en una ablación por proyección ortogonal: se toma la dirección `orth_l17_lam1` (fila 17) y se proyecta fuera de todos los escritores del flujo residual, es decir, se elimina la componente de esa dirección en las salidas de atención y MLP que se suman al *residual stream*. La implementación corresponde a `meandiff_steering/ablate_weights.py` con `zero-ablation`, y el proceso se replica con `scripts/orth_steer/run_domain.py` para el dominio `legal`. No se documentan datos de entrenamiento adicionales, tokens, ni fases de RLHF/DPO posteriores a la ablación; el ajuste fino previo corresponde al modelo `katcher-legal-sft`, del que no se aportan detalles en la información disponible.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas de Qwen2.5-7B-Instruct.
- Capacidad de ajuste fino previo en dominio legal (modelo `katcher-legal-sft`), aunque no se documenta el alcance exacto.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking*, visión o audio: no disponible en la información proporcionada.
- Comportamiento alterado en la dirección ablacionada (`orth_l17_lam1`), orientado experimentalmente al dominio legal; el efecto concreto no está cuantificado.

## Casos de uso

- Investigación en interpretabilidad: analizar el efecto de eliminar una dirección concreta del flujo residual y comparar las salidas con el modelo base Qwen2.5-7B-Instruct.
- Estudios de *steering* y control de comportamiento: usar el modelo como referencia ablacionada frente a variantes con dirección amplificada o atenuada.
- Evaluación de robustez en dominio legal: comprobar si la ablación reduce sesgos o comportamientos indeseados en tareas jurídicas, comparando con `katcher-legal-sft`.
- Reproducibilidad de experimentos: el modelo sirve como artefacto para replicar el pipeline `orth_steer` y validar la metodología de ablación.
- Análisis de degradación: medir la pérdida de capacidades generales tras la ablación en tareas de razonamiento y generación.
- Docencia y divulgación: ilustrar cómo se publican variantes experimentales de modelos abiertos y qué información debe acompañarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más memoria para KV cache y activaciones (en torno a 18-22 GB en función de la longitud de contexto).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8 GB para pesos, más overhead.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB para pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4090 para 8 bits o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantización 8 o 4 bits; en FP16 requiere al menos 24 GB y contexto limitado.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama (prevía conversión a GGUF, no documentada por el autor), Transformers con `device_map`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-orth-lam1 | 7,6 B | No disponible | No disponible | Hugging Face (0 descargas) | Variante ablacionada experimental |
| Qwen2.5-7B-Instruct | 7,6 B | 32 768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Hugging Face, muy extendido | Modelo base de referencia |
| wz7475/qwen2.5-7b-instruct-katcher-legal-sft | 7,6 B | No disponible | No disponible | Hugging Face | Ajuste fino en dominio legal previo a la ablación |

## Limitaciones y advertencias

- Modelo experimental sin descargas ni validación comunitaria; no se recomienda su uso en producción.
- La ablación de una dirección del flujo residual puede degradar capacidades generales de forma no documentada.
- No se especifica licencia, lo que impide confirmar si el uso comercial está permitido; el modelo base Qwen2.5 tiene licencia Apache 2.0, pero la variante derivada no la declara.
- No hay información sobre sesgos, alucinación ni evaluación de seguridad.
- No se documentan idiomas soportados ni longitud de contexto efectiva tras la intervención.
- El ajuste fino legal previo (`katcher-legal-sft`) no está descrito en detalle, por lo que se desconoce la calidad y composición de sus datos.
- Riesgo de comportamiento impredecible en dominios distintos del legal y en tareas que dependan de la dirección eliminada.
- La fecha de creación indicada (2026-11-26) es posterior a la fecha actual en el momento de redactar esta ficha, lo que puede indicar un error de metadatos o una publicación programada; conviene verificarlo.

## Enlaces

- Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-orthabl-orth-lam1
- Modelo base del ajuste fino: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-legal-sft (referenciado en la model card)
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de código referenciado (`meandiff_steering/ablate_weights.py`, `scripts/orth_steer/run_domain.py`): no se proporciona URL en la información disponible.
