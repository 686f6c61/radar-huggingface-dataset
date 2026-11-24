# timbuksu/Hy4-flash-NVFP4

## Resumen

Hy4-flash-NVFP4 es una cuantización mixta calibrada con NVIDIA ModelOpt del modelo multimodal `tencent/Hy4-flash`, publicada por el usuario `timbuksu`. No se trata de un modelo entrenado desde cero, sino de una conversión de precisión reducida pensada para ejecutar el modelo original en una única GPU NVIDIA Blackwell de 96 GiB (arquitectura SM120) con al menos 64 GiB de RAM de sistema. El checkpoint combina NVFP4 para las capas de expertos enrutados del MoE, MXFP8 para determinadas proyecciones densas grandes y BF16/FP32 para las capas sensibles (embeddings, `lm_head`, routers, encoder de visión SigLIP2 y capas densas de Engram).

El modelo base dispone de 192.530.932.486 parámetros totales (unos 192,5 mil millones) y una arquitectura MoE con 41 capas LatentMoE de expertos enrutados, además de un mecanismo Engram basado en tablas de n-gramas y un módulo de decodificación especulativa DFly. La pipeline declarada es `image-text-to-text`, por lo que cubre entrada de imagen y texto con salida de texto. La cuantización reduce el peso en disco a 122,71 GiB, de los cuales 89,64 GiB son pesos de GPU sin comprimir y 33,19 GiB corresponden a las tablas Engram de 4 bits residentes en RAM de sistema.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización mixta poco habitual (NVFP4 + MXFP8 + BF16 con escalas CSF) orientada a hardware Blackwell; por otro, sirve como referencia práctica de los requisitos reales de despliegue del modelo Hy4-flash en configuraciones de una sola GPU, algo poco frecuente en modelos de casi 200 mil millones de parámetros. La licencia es la Tencent Hy License v1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas LatentMoE (41 capas de expertos enrutados), mecanismo Engram de n-gramas, decodificación especulativa DFly y encoder de visión SigLIP2 |
| Parametros totales | 192.530.932.486 (~192,5 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la variante FLARE asociada declara capacidad de 1M+ tokens KV en una GPU de 96 GiB) |
| Tipos de cuantizacion | NVFP4 (grupo 16) en 41 capas de expertos; MXFP8 (grupo 32) en `q_b_proj`, `linear_gate` y `o_proj`; BF16/FP32 en capas sensibles; tablas Engram en NVFP4_E4M3_GLOBAL de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (`tencent-hy-license`) |
| Formato de pesos | safetensors (checkpoint ModelOpt mixto), con variantes exportadas para el runtime Flare |

## Arquitectura y entrenamiento

El modelo base Hy4-flash emplea una arquitectura de mezcla de expertos con capas LatentMoE: 41 capas de expertos enrutados que en esta cuantización se almacenan como tensores 3D apilados en NVFP4 con `group_size=16`. La cuantización se realizó con GPTQ por bloques de 16 con descomposición de Cholesky y técnica Four-Over-Six (margen de 1,5×), lo que permite mantener la fidelidad numérica en un formato de 4 bits. Las proyecciones densas grandes se cuantizaron a MXFP8 con escalas de bloque óptimas, mientras que las capas consideradas sensibles se conservan en BF16 o FP32 sin alteración.

Un elemento diferencial es el mecanismo Engram: cuatro tablas de embeddings de n-gramas que en el modelo original ocupan 60,84 GiB en FP8 y que aquí se comprimen a 33,19 GiB en NVFP4_E4M3_GLOBAL (una reducción del 45,4 %), lo que permite mantenerlas íntegramente en RAM de sistema sin accesos a disco. El proceso de cuantización se verificó capa a capa sobre 4 × 256 tokens disjuntos frente al checkpoint BF16 original. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de modo de razonamiento (`--reasoning-parser hy_v4`).
- Procesamiento de imagen y texto combinados (`image-text-to-text`), gracias al encoder de visión SigLIP2 conservado en BF16.
- Tool calling y function calling, con parser dedicado (`--tool-call-parser hy_v4`) y elección automática de herramientas (`--enable-auto-tool-choice`).
- Decodificación especulativa mediante cabecera DFly, con `num_speculative_tokens=5` en la configuración de referencia.
- Razonamiento multi-paso y flujos de agente, apoyados en la ventana de contexto extendida (hasta 1M+ tokens KV en la variante FLARE).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Atención dispersa mediante backend FLASHMLA_SPARSE.

## Casos de uso

- Asistencia conversacional con contexto largo: el modelo puede mantener diálogos multi-turno con historiales extensos gracias a la capacidad de 1M+ tokens KV de la variante FLARE, adecuado para soporte técnico o análisis de documentos largos.
- Procesamiento de documentos con imagen y texto: al aceptar entradas `image-text-to-text`, sirve para extraer y razonar sobre información de capturas, formularios escaneados o diagramas combinados con instrucciones textuales.
- Agentes con tool calling: la integración con `--enable-auto-tool-choice` y el parser `hy_v4` permite construir agentes que invocan APIs externas, consultan bases de datos o ejecutan acciones en pipelines automatizados.
- Razonamiento multi-paso en modo thinking: útil para tareas de análisis que requieren descomposición explícita, como revisión de código, diagnóstico de errores o planificación de tareas.
- Despliegue en una sola GPU Blackwell: pensado para entornos con una GPU de 96 GiB y 64 GiB de RAM, lo que simplifica la infraestructura frente a configuraciones multi-GPU para modelos de ~192,5 mil millones de parámetros.
- Generación de código asistida con contexto de repositorio: la ventana extendida y el soporte de herramientas permiten integrar el modelo en flujos de CI/CD o asistentes de IDE que necesitan referenciar múltiples ficheros.
- Investigación en cuantización: el checkpoint sirve como referencia reproducible de cuantización mixta NVFP4/MXFP8 con métricas de divergencia KL y acuerdo top-1 publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al checkpoint BF16 original:

| Comparacion | Divergencia KL | Acuerdo top-1 | Perplejidad |
|---|---:|---:|---|
| Modelo completo de 42 capas (GPTQ NVFP4 denso selectivo vs. BF16) | 0,09434 | 91,02 % | 10,789 vs. 10,909 (0,9890×) |
| Tablas Engram FP8 → 4 bits NVFP4_E4M3_GLOBAL | 0,0560 | 93,46 % | 10,82 vs. 11,14 (0,971×) |

## Requisitos de hardware

- VRAM estimada: aproximadamente 89,64 GiB de pesos de GPU sin comprimir (~85,4 GiB con escalas CSF), más overhead de activaciones y caché KV.
- RAM de sistema: mínimo 64 GiB para alojar las tablas Engram de 4 bits (33,19 GiB) íntegramente en memoria.
- GPU recomendadas: una única NVIDIA Blackwell SM120 de 96 GiB (por ejemplo, variantes profesionales Blackwell con esa capacidad). No cabe en GPUs de consumo como RTX 4090 (24 GiB) ni en A100/H100 de 80 GiB por el tamaño de los pesos.
- Despliegue recomendado: runtime Flare con `--embedding-table-storage ram` y paquetes preexportados (`Hy4-flash-NVFP4-FLARE` o `Hy4-flash-NVFP4-1M-FLARE`).
- Despliegue alternativo: vLLM con la imagen `vllm/vllm-openai:hy4-flash`, tensor-parallel-size 1, backend `FLASHMLA_SPARSE` y configuración especulativa DFly. Requiere una build de vLLM que soporte ModelOpt mixed-precision stacked NVFP4 LatentMoE y tablas Engram NVFP4_E4M3_GLOBAL.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-NVFP4 (este) | ~192,5 mil millones | no disponible (1M+ en variante FLARE) | NVFP4 + MXFP8 + BF16, 122,71 GiB en disco | Tencent Hy License 1.0 | Hugging Face, runtime Flare |
| tencent/Hy4-flash (base) | ~192,5 mil millones | no disponible | BF16 | Tencent Hy License 1.0 | Hugging Face |
| Hy4-flash-NVFP4-FLARE | ~192,5 mil millones | 1M+ tokens KV | NVFP4 empaquetado para Flare | Tencent Hy License 1.0 | Hugging Face |
| Hy4-flash-NVFP4-1M-FLARE | ~192,5 mil millones | 1M+ tokens KV en una GPU de 96 GiB | NVFP4 empaquetado para Flare | Tencent Hy License 1.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a modelos de otras familias con parámetros similares.

## Limitaciones y advertencias

- El checkpoint está diseñado específicamente para GPUs Blackwell SM120 de 96 GiB; no es portable a arquitecturas anteriores sin reconversión.
- La carga directa en vLLM requiere una build con soporte de ModelOpt mixed-precision stacked NVFP4 LatentMoE y tablas Engram NVFP4_E4M3_GLOBAL; el autor valida el funcionamiento completo únicamente bajo Flare.
- Las tablas Engram en formato NVFP4_E4M3_GLOBAL están empaquetadas en un formato propio de Flare, lo que limita su uso fuera de ese runtime sin conversión.
- La cuantización introduce una divergencia medible (KL 0,09434, acuerdo top-1 91,02 %), por lo que tareas sensibles a la fidelidad numérica pueden requerir el modelo BF16 original.
- Licencia Tencent Hy License v1.0: es necesario revisar sus términos para uso comercial; no es una licencia permisiva tipo Apache o MIT.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- El tamaño del repo (131,8 GB) implica requisitos de almacenamiento y tiempos de descarga considerables.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/timbuksu/Hy4-flash-NVFP4
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Licencia del modelo base: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
- Paquete Flare multimodal: https://huggingface.co/timbuksu/Hy4-flash-NVFP4-FLARE
- Paquete Flare con 1M+ tokens KV: https://huggingface.co/timbuksu/Hy4-flash-NVFP4-1M-FLARE
- Runtime Flare: https://github.com/NVIDIA/flare-local-inference
