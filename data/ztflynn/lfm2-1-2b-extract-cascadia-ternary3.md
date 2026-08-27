# ZTFlynn/LFM2-1.2B-Extract-Cascadia-ternary3

## Resumen

ZTFlynn/LFM2-1.2B-Extract-Cascadia-ternary3 es una versión comprimida del modelo LFM2-1.2B-Extract de Liquid AI, desarrollada por ZTFlynn mediante la técnica Cascadia. Esta técnica combina una superficie spline (B-spline) con tablas de consulta (LUT) por bandas para reducir el peso del modelo de 2,23 GB a 747 MB, lo que supone una compresión de 3,14x y un coste de 0,60 bytes por peso (5,09 bits por peso). El objetivo es permitir la ejecución del modelo en CPU y entornos edge con dependencias mínimas (solo libc, libm y libgomp).

El modelo base, LFM2-1.2B-Extract, está especializado en extraer datos estructurados (JSON, XML, YAML) de documentos no estructurados, manejando esquemas anidados complejos. La versión comprimida mantiene esta capacidad con una pérdida de perplexity del 6,17% (de 165,62 a 175,84 en el corpus de evaluación). La arquitectura consta de 16 capas con hidden size 2048, atención GQA (32 queries, 8 key-value) y convoluciones cortas con puerta. El paquete se ejecuta mediante el runtime C de Cascadia, no directamente con transformers, aunque existe una integración Python para cargarlo sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con GQA (32q/8kv), convoluciones cortas con puerta, 16 capas, hidden 2048 |
| Parametros totales | 1,2B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternario (3 niveles) con LUT por bandas, 0,60 bytes/peso (5,09 bits/peso) |
| Idiomas soportados | en (model card); el modelo base soporta 8-9 idiomas |
| Licencia | lfm-open-license (https://huggingface.co/LiquidAI/LFM2-1.2B-Extract/blob/main/LICENSE) |
| Formato de pesos | Paquete Cascadia: weights.bin, manifest.json, aux.bin, tokenizer.bin |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero, sino que es una compresion del checkpoint LFM2-1.2B-Extract de Liquid AI. La tecnica Cascadia ajusta una superficie B-spline a cada matriz de pesos para capturar la estructura a gran escala. Cada peso se asigna a una de 32 bandas segun su valor spline, y se aprende un codebook k-means por banda sobre los residuos. El 0,5% de los errores mas grandes se conservan exactamente como f32. Los indices del codebook se empaquetan en base 3, con cinco trits por byte (3^5 = 243). La reconstruccion se evalua dentro del producto matriz-vector, sin construir nunca la matriz densa completa. El modelo base, por su parte, emplea una arquitectura hibrida con atencion y convoluciones, optimizada para extraccion de datos estructurados y con mejoras de throughput frente a modelos similares de 1B segun el technical report de Liquid AI.

## Capacidades

- Extraccion de datos estructurados (JSON, XML, YAML) a partir de texto no estructurado, con soporte de esquemas anidados y extraccion multi-campo.
- Generacion de texto, aunque el modelo esta especializado en tareas de extraccion.
- Ejecucion en CPU con runtime C de Cascadia, sin dependencias mas alla de libc, libm y libgomp.
- Integracion con transformers via la funcion `load_compressed` de la libreria cascadia, cargando el modelo base y aplicando los pesos comprimidos.
- Decodificacion greedy y muestreo con temperatura, top-k y top-p; sin beam search.
- Reproducibilidad con semilla fija en modo greedy.

## Casos de uso

- Extraccion de entidades de documentos legales: el modelo puede convertir contratos o sentencias en JSON estructurado con campos como partes, fechas y clausulas, gracias a su especializacion en esquemas complejos.
- Procesamiento de facturas y recibos: parseo de proveedor, importe, IVA y numero de factura desde PDFs o imagenes OCR, generando salidas YAML o XML para sistemas contables.
- Automatizacion de correos electronicos: extraccion de datos de pedidos, reembolsos o consultas de clientes en formato estructurado para integrarse en CRMs o sistemas de ticketing.
- Analisis de formularios web: conversion de respuestas libres en campos normalizados (nombre, direccion, telefono) para bases de datos.
- Pipelines de datos en entornos edge: al ejecutarse en CPU con solo 747 MB, puede desplegarse en dispositivos IoT o servidores sin GPU para procesar lotes de documentos.
- Asistente de documentacion tecnica: extraccion de parametros, requisitos y resultados de informes cientificos o manuales, generando JSON para su posterior consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card reporta la siguiente metrica de calidad:

| Metrica | Modelo base (bf16) | Paquete comprimido | Diferencia |
|---|---|---|---|
| Perplexity (FineWeb-Edu, 512-token windows) | 165,62 | 175,84 | +6,17% (IC 95% [1,0468x, 1,0768x], t = +8,31) |

Ademas, se mide el coste de compresion segun el tamano del modelo en la misma familia:

| Modelo | Parametros | Coste en perplexity |
|---|---|---|
| LFM2.5-230M | 0,23B | +7,7% |
| LFM2-350M | 0,35B | +3,5% |
| LFM2-1.2B (este paquete) | 1,2B | +6,17% |
| LFM2-24B-A2B | 24B | < 0,3% (no detectable) |

## Requisitos de hardware

- VRAM: no requiere GPU; los pesos ocupan 747 MB en RAM.
- CPU: cualquier procesador con soporte para libc, libm y libgomp (x86_64, ARM64, etc.).
- GPU: opcional; si se usa la integracion Python con transformers, se necesita cargar el modelo base en bfloat16 (unos 2,4 GB en VRAM) y luego aplicar los pesos comprimidos.
- Opciones de despliegue: runtime C de Cascadia (compilado con CMake), o via Python con la libreria cascadia y transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; el runtime esta disenado para inferencia batch-1 en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Perplexity | Licencia | Formato |
|---|---|---|---|---|---|
| LiquidAI/LFM2-1.2B-Extract (base) | 1,2B | 2,23 GB (bf16) | 165,62 | lfm-open-license | Safetensors |
| ZTFlynn/LFM2-1.2B-Extract-Cascadia-ternary3 | 1,2B | 747 MB | 175,84 | lfm-open-license | Paquete Cascadia |
| Magneato/deepseek-r1-qwen-7b-lutc | 7B | ~5,45 bits/peso | No disponible | No disponible | LUT-cascade |

La comparativa directa con otros modelos de extraccion de 1B (como Granite-4.0-1B o Qwen3-1.7B) no esta disponible en la informacion proporcionada, aunque el technical report de LFM2 indica que el modelo base supera a estos en throughput de prefill y decode.

## Limitaciones y advertencias

- El paquete solo se ejecuta bajo el runtime C de Cascadia; no es un checkpoint de transformers directamente utilizable.
- El runtime solo soporta paquetes ternary-3; otros presets de Cascadia requieren conversion y no estan implementados en el kernel actual.
- Inferencia limitada a batch-1 en CPU; no hay soporte para beam search.
- Perdida de calidad medida del 6,17% en perplexity respecto al modelo base, que puede traducirse en errores de extraccion en casos limites.
- La licencia lfm-open-license puede imponer restricciones de uso comercial; se recomienda revisar el texto completo de la licencia.
- Aunque el modelo base soporta varios idiomas, la model card de esta version solo declara ingles; el rendimiento en otros idiomas no esta garantizado.
- El ejemplo de salida de la model card ("baker_dozen_eggs": 12) sugiere que el modelo puede cometer errores factuales (una docena de panadero son 13), lo que indica riesgo de alucinacion en tareas de conocimiento general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZTFlynn/LFM2-1.2B-Extract-Cascadia-ternary3
- Modelo base: https://huggingface.co/LiquidAI/LFM2-1.2B-Extract
- Repositorio de Cascadia (runtime C): https://github.com/EntroMorphic/cassie
- Documentacion del formato de paquete: https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md
- Technical report de LFM2 (arXiv): https://arxiv.org/pdf/2511.23404
- Documentacion de Liquid sobre LFM2-1.2B-Extract: https://docs.liquid.ai/lfm/models/lfm2-1.2b-extract
- Modelo inspirador (Magneato LUT-cascade): https://huggingface.co/Magneato/deepseek-r1-qwen-7b-lutc
