# Xylolabs/Qwen3.5-2B-MLX-4bit

## Resumen

Xylolabs/Qwen3.5-2B-MLX-4bit es una cuantizacion de 4 bits en formato MLX del modelo base Qwen/Qwen3.5-2B, publicada por Xylolabs. El objetivo es ofrecer una version compacta (1,08 GB) del modelo original (3,78 GB en BF16) para ejecucion eficiente en hardware Apple Silicon mediante la libreria `mlx-lm`. La conversion elimina la torre de vision y el bloque MTP (multi-token prediction) del modelo original, por lo que el resultado es un modelo exclusivamente de texto.

La cuantizacion emplea cuantizacion afin con tamano de grupo 64 y escalas y sesgos en float16. Todos los pesos lineales y el embedding de tokens (incluida la LM head) se cuantizan a 4 bits, con excepciones puntuales a 6 bits: `mlp.down_proj` en las capas 0-2 y 21-23, y `self_attn.v_proj` en la capa 23. Las normas se mantienen en float16 y `A_log` en float32.

El modelo es relevante para desarrolladores que necesitan desplegar un modelo conversacional de ~1.880 millones de parametros en Macs con memoria unificada limitada, aceptando una perdida de fidelidad respecto a BF16 documentada por el autor (KL de 0,097 en WikiText-2 y 83,34% de acuerdo top-1). La licencia Apache 2.0 permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; sin torre de vision ni bloque MTP) |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (mayoritario) y 6-bit (capas 0-2 y 21-23 en `mlp.down_proj`; capa 23 en `self_attn.v_proj`); normas en float16; `A_log` en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); tamano del repo 1,1 GB |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Qwen/Qwen3.5-2B, no un entrenamiento propio. La arquitectura subyacente es un transformer de ~1,88 mil millones de parametros. La conversion a MLX elimina explicitamente la torre de vision y el bloque MTP del modelo original, de modo que el artefacto resultante es solo texto. La cuantizacion es afin con grupo de 64, escalas y sesgos en float16, y aplica 4 bits a la practica totalidad de los pesos lineales y al embedding de tokens (incluida la LM head), con refuerzo a 6 bits en `mlp.down_proj` de las capas 0-2 y 21-23 y en `self_attn.v_proj` de la capa 23. Las normas permanecen en float16 y `A_log` en float32.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (decodificacion especulativa, atencion lineal) en la informacion proporcionada. El autor unicamente publica metricas de fidelidad de la cuantizacion frente a BF16.

## Capacidades

- Generacion de texto conversacional (`pipeline_tag: text-generation`, tag `conversational`).
- Ejecucion en Apple Silicon mediante `mlx-lm` (version fijada a 0.32.2 en las instrucciones del autor).
- Modelo solo texto: la torre de vision del modelo base ha sido eliminada en esta conversion.
- Sin bloque MTP: no se dispone de multi-token prediction en este artefacto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (campo de idiomas vacio).
- Capacidades especiales (thinking mode, audio, vision): no disponibles; vision explicitamente eliminada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse con `mlx-lm` en equipos Apple Silicon con memoria unificada modesta, gracias a su tamano de 1,08 GB en 4 bits, para prototipos de chat sin dependencia de la nube.
- Generacion de texto en aplicaciones de escritorio macOS: integrable en apps nativas que usen MLX como backend de inferencia, con latencia baja al residir el modelo en memoria unificada.
- Pruebas de humo y validacion de pipelines: util como modelo pequeno para verificar flujos de generacion, plantillas de prompt y formateo de salida antes de escalar a modelos mayores.
- Educacion e investigacion sobre cuantizacion: el modelo sirve como caso de estudio de cuantizacion afin con grupo de 64 y de las metricas KL/top-1 publicadas por el autor para comparar 4 bits frente a 8 bits y BF16.
- Despliegue en entornos con restricciones de memoria: adecuado cuando el presupuesto de VRAM/memoria es inferior a 2 GB y no se puede asumir el coste de un modelo en BF16 (3,78 GB).
- Generacion de texto offline en portatiles: escenarios sin conectividad donde se requiere un modelo conversacional pequeno y con licencia permisiva para uso comercial.

## Benchmarks y rendimiento

El autor publica metricas de fidelidad de cuantizacion (KL y acuerdo top-1 frente a BF16 sobre WikiText-2, chat y texto reservado, con 40/20/20 fragmentos de 512 tokens) y una prueba de 7 preguntas.

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 1,08 GB | 0,097054 | 83,34% | 0,130638 | 82,25% | 0,136542 | 77,94% | 5/7 |
| MLX 8-bit | 2,00 GB | 0,000400 | 98,76% | 0,000457 | 98,88% | 0,000563 | 98,22% | 5/7 |
| BF16 | 3,78 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 5/7 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria estimada: ~1,08 GB de pesos en 4 bits; con overhead de ejecucion de `mlx-lm` conviene reservar al menos 2 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte para GPU NVIDIA/AMD en esta conversion.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo esta pensado para memoria unificada de chips Apple (M1/M2/M3/M4 y variantes Pro/Max/Ultra). No se dispone de datos de rendimiento por chip.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con 8 GB o mas de memoria unificada; no se dispone de informacion para GPUs de consumo tipo RTX.
- Opciones de despliegue: `mlx-lm` (version 0.32.2 segun el autor) mediante `mlx_lm.generate`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-2B-MLX-4bit | ~1,88 B | no disponible | MLX safetensors 4-bit | Apache 2.0 | Solo texto; sin vision ni MTP |
| Qwen/Qwen3.5-2B (base, BF16) | ~1,88 B | no disponible | safetensors BF16 | no disponible en la informacion | Referencia de fidelidad; incluye vision y MTP |
| Xylolabs Qwen3.5-2B MLX 8-bit (mismo autor) | ~1,88 B | no disponible | MLX safetensors 8-bit | Apache 2.0 | 2,00 GB; KL ~0,0004; mayor fidelidad |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de fidelidad frente a BF16: KL de 0,097 en WikiText-2 y acuerdo top-1 del 83,34%, con degradacion adicional en chat (KL 0,1306) y texto reservado (KL 0,1365).
- Prueba cualitativa limitada: solo 5 de 7 preguntas correctas tanto en 4 bits como en 8 bits y BF16, lo que sugiere limitaciones del modelo base en esa prueba.
- Modelo solo texto: la torre de vision ha sido eliminada; no puede procesar imagenes.
- Sin bloque MTP: no dispone de multi-token prediction en esta conversion.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Longitud de contexto no documentada.
- Riesgo de alucinacion inherente a modelos de ~2 B; no se han publicado evaluaciones de sesgo ni de robustez.
- Dependencia de una version concreta de `mlx-lm` (0.32.2) y del ecosistema MLX; no hay garantia de compatibilidad con otras herramientas de inferencia.
- Licencia Apache 2.0 permite uso comercial, pero el autor remite a `LICENSE` y `NOTICE` para condiciones adicionales.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-2B-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio MLX: https://github.com/ml-explore/mlx
- Assets del autor (lockup): https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
- Grafico de KL: https://huggingface.co/Xylolabs/Qwen3.5-2B-MLX-4bit/resolve/main/accuracy-kl.png
- Grafico de top-1: https://huggingface.co/Xylolabs/Qwen3.5-2B-MLX-4bit/resolve/main/accuracy-top1.png
