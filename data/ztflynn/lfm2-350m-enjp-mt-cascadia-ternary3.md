# ZTFlynn/LFM2-350M-ENJP-MT-Cascadia-ternary3

## Resumen

ZTFlynn/LFM2-350M-ENJP-MT-Cascadia-ternary3 es un paquete de pesos comprimidos del modelo LiquidAI/LFM2-350M-ENJP-MT, un transformer de 350 millones de parametros especializado en traduccion bidireccional ingles-japones. La compresion la realiza el framework Cascadia, que emplea una superficie B-spline por tensor mas tablas de consulta (LUT) por banda, con cuantizacion ternaria de los residuos. El resultado es un paquete de 241 MB (frente a los 676 MB del checkpoint original en bf16), lo que supone una reduccion de 2,96 veces, con una perdida de calidad que el autor mide como no detectable en perplexity.

La relevancia de este modelo reside en su capacidad para ejecutarse en CPU de forma eficiente, con un runtime en C cuyas unicas dependencias son libc, libm y libgomp. Esto lo hace adecuado para entornos edge y despliegues sin GPU. El paquete no es un checkpoint de transformers al uso, sino un formato propietario de Cascadia que requiere el runtime especifico. El modelo base, desarrollado por LiquidAI, esta optimizado para traduccion de textos cortos y medianos con baja latencia, y esta disponible bajo la licencia lfm-open-license.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con GQA (16q/8kv), gated short convolutions, 16 bloques, hidden 1024 |
| Parametros totales | 350M (nominal, segun el identificador del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (base 3) con codebooks por banda y spline manifold; 0,60 bytes por peso |
| Idiomas soportados | Ingles y japones (modelo base ENJP-MT) |
| Licencia | lfm-open-license (https://huggingface.co/LiquidAI/LFM2-350M-ENJP-MT/blob/main/LICENSE) |
| Formato de pesos | Paquete Cascadia (weights.bin, manifest.json, aux.bin, tokenizer.bin) |

## Arquitectura y entrenamiento

El modelo base LFM2-350M-ENJP-MT es un transformer con atencion por grupos de consultas (GQA) con 16 cabezas de consulta y 8 de clave/valor, y convoluciones cortas con puerta (gated short convolutions). La arquitectura esta disenada para traduccion eficiente con baja latencia, optimizada para textos cortos y medianos. El modelo fue entrenado por LiquidAI y posteriormente ajustado para la tarea especifica de traduccion EN-JP.

La compresion Cascadia aplica una superficie B-spline a cada matriz de pesos para capturar la estructura a gran escala. Cada peso se asigna a una de 32 bandas segun su valor spline, y se aprende un codebook k-means por banda sobre los residuos. El 0,5% de los errores mayores se conservan en f32 exacto. Los indices de los codebooks se empaquetan en base 3, con cinco trits por byte (3^5 = 243). La reconstruccion se realiza como W = spline(j,c) + codebook[band][index], evaluada dentro del producto matriz-vector, sin construir nunca la matriz densa. El embedding atado (que tambien actua como lm_head) se comprime con un codebook global de 81 entradas, sin bandas ni spline, lo que lo convierte en el tensor mejor reconstruido del modelo.

## Capacidades

- Traduccion bidireccional ingles-japones y japones-ingles, optimizada para textos cortos y medianos con baja latencia.
- Generacion de texto en ingles y japones, con tokenizador propio incluido en el paquete.
- Ejecucion en CPU sin GPU, gracias al runtime C de Cascadia.
- Inferencia con batch 1, adecuada para aplicaciones en tiempo real o edge.
- Reproducibilidad con semilla fija en modo greedy.
- Soporte de detencion de generacion con el token `<|im_end|>`.
- No soporta tool calling, vision ni audio (modelo de texto puro).

## Casos de uso

- Traduccion automatica en tiempo real en aplicaciones de chat o mensajeria: el modelo puede traducir mensajes cortos entre ingles y japones con baja latencia, ejecutandose en CPU de un servidor o dispositivo edge.
- Asistente de traduccion para turismo o atencion al cliente: integrado en un kiosco o dispositivo portatil, permite conversaciones bidireccionales sin conexion a la nube.
- Preprocesamiento de datos multilingues: se puede usar para traducir grandes volumenes de texto corto (comentarios, resenas, tweets) antes de alimentar otros sistemas, gracias a su tamano reducido.
- Despliegue en entornos con restricciones de hardware: al no requerir GPU y tener un footprint de 241 MB, cabe en routers, NAS o Raspberry Pi para servicios de traduccion local.
- Prototipado rapido de pipelines de traduccion: al ser un paquete autocontenido con un runtime minimo, se puede integrar en sistemas embebidos o CI/CD sin dependencias pesadas.
- Evaluacion de tecnicas de compresion de modelos: el paquete sirve como referencia para medir el impacto de la cuantizacion ternaria con splines en tareas de traduccion, comparando perplexity y fidelidad de reconstruccion.

## Benchmarks y rendimiento

La model card no proporciona resultados de benchmarks estandar (MMLU, HumanEval, etc.). En su lugar, presenta una evaluacion de perplexity y fidelidad de reconstruccion comparando el modelo comprimido con el original en bf16:

| Metrica | Modelo original (bf16) | Paquete comprimido (ternary-3) |
|---|---:|---:|
| Perplexity (16,352 tokens de FineWeb-Edu, 31 ventanas de 512 tokens) | 332.51 | 324.48 |
| Diferencia | - | No detectable (95% CI [0.9497x, 1.0068x], t = -1.51) |
| Error L2 relativo vs bf16 | - | 0.0549 |
| Ganancia sistematica (1.0000 = fiel) | - | 0.9993 |

Por clase de tensor:

| Clase | Error L2 relativo | Proporcion del modelo |
|---|---:|---:|
| linear | 0.0582 | 287M params |
| embedding | 0.0275 | 67M params |

El embedding atado, que es el tensor cuyo error llega a los logits sin amortiguacion, se reconstruye con un error relativo de 0.0275. La medida de perplexity acota el cambio en un 5.0% y no puede distinguirlo de cero, lo que el autor interpreta como una limitacion de la evidencia, no una prueba de coste nulo.

## Requisitos de hardware

- CPU con soporte para libc, libm y libgomp (OpenMP). No requiere GPU.
- RAM: el paquete ocupa 241 MB en disco; en memoria, el runtime carga los pesos comprimidos y reconstruye en el matvec, por lo que el consumo es moderado, aunque no se especifica un valor exacto.
- GPU recomendada: ninguna. El modelo esta pensado para CPU.
- Adecuado para dispositivos edge (Raspberry Pi, routers, NAS) y servidores sin acelerador.
- Opciones de despliegue: runtime C de Cascadia (repositorio cassie), con compilacion via CMake. Tambien se ofrece una interfaz Python que carga el paquete sobre el modelo base de transformers.
- Latencia y throughput: no se proporcionan datos numericos. La inferencia es batch-1 y secuencial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| LiquidAI/LFM2-350M-ENJP-MT (base) | 350M | no disponible | bf16 | lfm-open-license | safetensors |
| ZTFlynn/LFM2-350M-ENJP-MT-Cascadia-ternary3 | 350M | no disponible | Ternaria + spline (0.60 bytes/peso) | lfm-open-license | Paquete Cascadia |
| LiquidAI/LFM2-350M (original, sin ajuste ENJP) | 350M | no disponible | bf16 | lfm-open-license | safetensors |

No se dispone de datos de otros modelos comparables de tamano similar con la misma tarea de traduccion EN-JP. La comparativa se limita al modelo base y su version comprimida.

## Limitaciones y advertencias

- El paquete solo se ejecuta bajo el runtime C de Cascadia; no es un checkpoint de transformers y no puede cargarse directamente con `from_pretrained` sin el adaptador Python.
- El runtime actual solo soporta paquetes ternary-3; otros presets de Cascadia se convierten pero no estan implementados en el kernel.
- Inferencia limitada a batch 1, lo que puede ser un cuello de botella para cargas de trabajo de alto rendimiento.
- La longitud de contexto no se especifica en la informacion disponible; se recomienda verificar antes de usarlo con textos largos.
- La licencia lfm-open-license puede imponer restricciones de uso comercial; consultar el texto completo en el enlace proporcionado.
- El modelo esta especializado en traduccion EN-JP; su rendimiento en otros idiomas o tareas no esta garantizado.
- La evaluacion de calidad se basa en perplexity sobre un corpus limitado (FineWeb-Edu) y en medidas de reconstruccion; no hay benchmarks de traduccion (BLEU, etc.) publicados.
- El autor advierte que la diferencia de perplexity no es estadisticamente significativa, pero eso no demuestra que el coste de compresion sea cero; es una limitacion del poder estadistico de la medida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZTFlynn/LFM2-350M-ENJP-MT-Cascadia-ternary3
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M-ENJP-MT
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2-350M-ENJP-MT/blob/main/LICENSE
- Repositorio del runtime Cascadia: https://github.com/EntroMorphic/cassie
- Documentacion del formato de paquete: https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md
- Documentacion del modelo base en Liquid Docs: https://docs.liquid.ai/lfm/models/lfm2-350m-enjp-mt
- Version GGUF del modelo base: https://www.modelscope.cn/models/LiquidAI/LFM2-350M-ENJP-MT-GGUF
