# tiyuvta/Hy3-NVFP4

## Resumen

Hy3-NVFP4 es una cuantizacion weight-only en formato NVFP4 del modelo [Tencent Hy3](https://huggingface.co/tencent/Hy3), generada por el laboratorio independiente Tiyuvta utilizando NVIDIA Model Optimizer 0.46.0 y el motor de inferencia Memra, escrito en Rust y CUDA. El modelo base, Tencent Hy3, es un MoE de 295B parametros totales con 21B activos y una capa MTP de 3.8B, desarrollado por el equipo de Hunyuan de Tencent, que destaca en razonamiento y generacion de texto.

Esta cuantizacion reduce el peso de los expertos enrutados a NVFP4 (W4A16), manteniendo en BF16 las capas densas, atencion, router y embeddings, lo que permite ejecutar el modelo en hardware Blackwell con un consumo de VRAM significativamente menor que el checkpoint BF16 original. El repositorio incluye verificaciones de integridad SHA-256, un manifiesto firmado y un proceso de validacion reproducible con Memra.

La relevancia de este artefacto radica en que ofrece una alternativa de precision mixta NVFP4 para Hy3, validada en cuatro NVIDIA RTX PRO 6000 Blackwell, con soporte para decodificacion especulativa MTP y tool calling. No es un modelo independiente, sino una cuantizacion del checkpoint oficial de Tencent, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con capa MTP (Multi-Token Prediction) |
| Parametros totales | 153.831.009.536 (almacenados en NVFP4/BF16; el original BF16 tiene 295B) |
| Parametros activos | 21B (mas 3.8B de la capa MTP) |
| Longitud de contexto | 128k tokens (segun reporte de despliegue en DGX Spark) |
| Tipos de cuantizacion | NVFP4 (W4A16), group-16, weight-only; BF16 para capas no enrutadas |
| Idiomas soportados | no disponible (el modelo base de Tencent soporta principalmente chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (108 archivos, 180.9 GB) |

## Arquitectura y entrenamiento

Hy3-NVFP4 no es un modelo reentrenado, sino una cuantizacion del checkpoint BF16 oficial de Tencent Hy3. La cuantizacion se realizo con NVIDIA ModelOpt 0.46.0, aplicando una receta group-16 weight-only W4A16 sobre los pesos de los expertos enrutados de las capas 1 a 79, y tambien sobre los 576 tensores de la capa MTP (capa 80). Los pares gate/up fusionados comparten la escala maxima de ambos tensores para reducir la perdida de precision.

La capa densa 0, las proyecciones Q/K/V/O de atencion, las normas QK, el router, el MLP compartido, los embeddings, la cabeza de salida y las normas se mantienen en BF16 o F32. La cache KV no se cuantiza en este artefacto y se selecciona en tiempo de ejecucion. El entrenamiento original de Hy3 incluyo una fase de post-entrenamiento con datos de mayor calidad tras el lanzamiento del preview, pero los detalles especificos del dataset y el proceso de alineacion no se detallan en la informacion disponible.

## Capacidades

- Generacion de texto conversacional y de razonamiento multi-step, heredadas del modelo base Tencent Hy3.
- Tool calling y function calling nativo, con parseo de llamadas a herramientas y gestion de turnos de resultados, validado en la cuantizacion.
- Soporte de razonamiento con parametro `reasoning_effort` (high/none), verificado en la validacion de Memra.
- Decodificacion especulativa MTP (Multi-Token Prediction) con K=1-8, que acelera la generacion sin degradar la identidad de los logits.
- Capacidades multilingues limitadas a las del modelo base (principalmente chino e ingles, segun el despliegue reportado).
- Inferencia en precision mixta NVFP4/BF16, optimizada para GPUs Blackwell con soporte FP4 nativo.

## Casos de uso

- Despliegue de Hy3 en hardware Blackwell de gama media: la cuantizacion NVFP4 reduce el peso de los expertos a 4 bits, permitiendo ejecutar un modelo de 295B en 4 GPUs RTX PRO 6000 con 60 GB en la raiz y 40 GB por peer, en lugar de requerir nodos completos de H100.
- Servicio de chat con razonamiento en produccion: el soporte de `reasoning_effort` y la generacion especulativa MTP permiten ofrecer respuestas con cadenas de pensamiento configurables y menor latencia por token.
- Agentes con tool calling: la validacion incluye parseo nativo de llamadas a herramientas y turnos de resultados, por lo que puede integrarse en pipelines de agentes que necesitan ejecutar funciones externas.
- Inferencia de largo contexto: con 128k tokens de ventana, es adecuado para analisis de documentos extensos, transcripciones o conversaciones multi-turno prolongadas.
- Investigacion en cuantizacion de MoE: el repositorio documenta la receta exacta, los hashes de integridad y el proceso de validacion, sirviendo como referencia para reproducir cuantizaciones similares.
- Evaluacion de motores de inferencia alternativos: el artefacto esta disenado para Memra, pero los pesos safetensors pueden cargarse con otras herramientas que soporten NVFP4, como vLLM con ModelOpt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La validacion de Memra reporta los siguientes datos de fidelidad frente al oraculo ModelOpt en vLLM:

| Metrica | Valor |
|---|---|
| Coincidencia argmax (top-logit) | 20/20 |
| Similitud coseno | 0.9995285974311506 |
| RMSE | 0.05849238475772628 |
| Error absoluto medio | 0.046138540558894096 |
| Error absoluto maximo | 0.30402064323425293 |

En cuanto a rendimiento, el reporte de NVIDIA Developer Forums indica 21.8 tokens/s en generacion single-stream y 59.7 tokens/s en modo 6-way sobre 2x DGX Spark GB10 con TP=2, pero estos datos no forman parte de la model card oficial y deben tomarse como referencia no confirmada por Tiyuvta.

## Requisitos de hardware

- VRAM estimada: el plan de capacidad automatico de Memra estima 60.05 GB en la GPU raiz y 40.26 GB en cada peer para una configuracion de 4 GPUs, antes de la reserva de 6 GiB en tiempo de ejecucion.
- GPUs recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (4 unidades), o 2x DGX Spark GB10 con TP=2 sobre red RoCE 200GbE.
- No cabe en una GPU consumer de 24 GB: el modelo cuantizado requiere al menos 2 GPUs con 40+ GB cada una, o 4 GPUs con 24 GB si se usa EP-4.
- Opciones de despliegue: Memra (motor nativo, con `memra-server`), vLLM con ModelOpt para NVFP4, y potencialmente otros motores que soporten W4A16.
- Latencia y throughput: no hay datos publicos de Tiyuvta; el reporte de terceros indica 21.8 tok/s single-stream y 59.7 tok/s en 6-way sobre DGX Spark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tencent Hy3 (BF16) | 295B MoE (21B activos) | 128k | BF16 | Apache 2.0 | HuggingFace |
| Hy3-NVFP4 (este) | 153.8B almacenados | 128k | NVFP4/BF16 | Apache 2.0 | HuggingFace |
| Hy3 FP8 (oficial Tencent) | 295B | 128k | FP8 | Apache 2.0 | no disponible en la informacion |

La comparativa directa con otros modelos de la misma categoria (MoE de ~300B con 21B activos) no esta disponible en la informacion proporcionada. La ventaja principal de esta cuantizacion frente al BF16 original es la reduccion de VRAM y el aumento de throughput en hardware Blackwell, a costa de una pequena perdida de precision (RMSE 0.058).

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo reentrenado: las capacidades y limitaciones del modelo base Tencent Hy3 se heredan sin modificacion.
- La perdida de precision por cuantizacion NVFP4 es pequena pero no nula: el error absoluto maximo observado es 0.304, lo que puede afectar a tareas de alta precision numerica.
- El artefacto esta validado exclusivamente con Memra en RTX PRO 6000 Blackwell; no hay garantias de funcionamiento correcto en otras GPUs o motores.
- MTP esta cualificado pero es una eleccion explicita de servicio; el modo `MEMRA_PP_WAVE` experimental no supero la prueba de identidad de logits y permanece desactivado.
- El ajuste de Memra no esta completo: el artefacto es `NativeQualified`, no `NativeTuned`, y quedan tareas pendientes de optimizacion (issue #67).
- No hay datos publicos de sesgos, alucinacion o limitaciones de idioma especificos de esta cuantizacion; se remite a la documentacion del modelo base.
- El repositorio no incluye una demo interactiva ni un endpoint alojado; Tiyuvta no publica un modelo servido bajo este identificador.

## Enlaces

- [Repositorio HuggingFace: tiyuvta/Hy3-NVFP4](https://huggingface.co/tiyuvta/Hy3-NVFP4)
- [Modelo base: tencent/Hy3](https://huggingface.co/tencent/Hy3)
- [Repositorio GitHub de Hy3 (Tencent)](https://github.com/Tencent-Hunyuan/Hy3)
- [Repositorio GitHub de Memra](https://github.com/avifenesh/memra)
- [NVIDIA Model Optimizer](https://github.com/NVIDIA/Model-Optimizer)
- [Sitio de Tiyuvta](https://tiyuvta.ai/)
- [Endpoint de inferencia de Tiyuvta](https://inference.tiyuvta.ai/)
- [Reporte de despliegue en DGX Spark (NVIDIA Forums)](https://forums.developer.nvidia.com/t/hy3-295b-hunyuan-3-nvfp4-w4a16-mtp-speculative-on-2x-dgx-spark-gb10-128k-ctx-21-8-tok-s-single-59-7-tok-s-6-way/375851)
- [Issue #67 de Memra](https://github.com/avifenesh/memra/issues/67)
