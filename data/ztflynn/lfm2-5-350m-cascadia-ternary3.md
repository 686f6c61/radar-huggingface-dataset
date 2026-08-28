# ZTFlynn/LFM2.5-350M-Cascadia-ternary3

## Resumen

ZTFlynn/LFM2.5-350M-Cascadia-ternary3 es una versión comprimida del modelo LFM2.5-350M de Liquid AI, desarrollada por el usuario ZTFlynn mediante la técnica Cascadia. Esta técnica combina un manifold spline (superficie B-spline) con tablas de búsqueda (lookup tables) por bandas y cuantización ternaria, logrando reducir el tamaño del checkpoint de 676 MB a 241 MB (factor 2,96x) manteniendo una calidad prácticamente indistinguible del original. El modelo resultante se ejecuta mediante un runtime C minimalista cuyas únicas dependencias son libc, libm y libgomp, lo que lo hace apto para despliegues en CPU y entornos edge con restricciones de memoria.

El modelo base, LFM2.5-350M, es el más pequeño de la familia LFM2.5 de Liquid AI, con 350 millones de parámetros, arquitectura híbrida (atención GQA con convoluciones cortas gated) y entrenamiento extendido hasta 28T tokens con refuerzo. La compresión Cascadia no modifica la arquitectura, sino que reconstruye los pesos mediante splines y codebooks, evaluando la reconstrucción dentro del producto matriz-vector sin materializar matrices densas. Esto permite ejecutar el modelo en CPU con una huella de memoria muy reducida, siendo relevante para aplicaciones de baja latencia en dispositivos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (16 bloques, GQA 16q/8kv, gated short convolutions) |
| Parametros totales | 350M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ternario-3 (0,60 bytes/peso, 5,40 bits/peso) |
| Idiomas soportados | ingles |
| Licencia | lfm-open-license |
| Formato de pesos | paquete Cascadia (weights.bin, manifest.json, aux.bin, tokenizer.bin) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M de Liquid AI emplea la arquitectura LFM2, que combina atención con cabezas agrupadas (GQA 16q/8kv) y convoluciones cortas gated en cada bloque, junto con normalización RMSNorm. Fue preentrenado con 28T tokens (10T iniciales más 18T adicionales) y posteriormente refinado con aprendizaje por refuerzo para mejorar chat, instrucciones y tool-calling, según la documentación oficial de Liquid AI.

La compresión Cascadia no implica entrenamiento adicional. Se ajusta una superficie B-spline a cada matriz de pesos para capturar la estructura global; cada peso se asigna a una de 32 bandas según su valor spline, y se aprende un codebook k-means por banda sobre los residuos. El 0,5% de los errores mayores se conserva exactamente en f32. Los índices del codebook se empaquetan en base 3, con cinco trits por byte (3⁵ = 243). La reconstrucción se calcula como `W = spline(j,c) + codebook[band][index]`, evaluada dentro del matvec, sin construir nunca la matriz densa. El embedding atado (que también actúa como lm_head) usa un codebook de 81 entradas para minimizar el error que llega a los logits.

## Capacidades

- Generacion de texto en ingles: chat, instrucciones y razonamiento basico, heredado del modelo base LFM2.5-350M.
- Soporte de tool calling y function calling: el modelo base fue entrenado con refuerzo para mejorar estas capacidades, segun la documentacion de Liquid AI.
- Ejecucion en CPU sin GPU: el runtime C de Cascadia permite inferencia en procesadores convencionales, con dependencias solo de libc, libm y libgomp.
- Compresion eficiente: 0,60 bytes por peso, con perdida de calidad no detectable en mediciones de perplexity (ver seccion de benchmarks).
- Reconstruccion fiel: error L2 relativo de 0,0481 frente al checkpoint bf16, con el embedding atado reconstruido a 0,0230.
- No incluye capacidades multimodales (vision, audio) ni soporte multilingue; solo texto en ingles.

## Casos de uso

- Inferencia en dispositivos edge: con 241 MB de pesos, el modelo cabe en la memoria de un Raspberry Pi o un modulo embebido, permitiendo asistentes de texto locales sin conexion.
- Chatbots de atencion al cliente basica: puede gestionar conversaciones sencillas en ingles con instrucciones claras, aprovechando su soporte de tool calling para integrar APIs de consulta.
- Generacion de texto en entornos con recursos limitados: ideal para aplicaciones que requieren baja latencia y no disponen de GPU, como plugins de navegador o extensiones de escritorio.
- Prototipado rapido de agentes: al ser pequeño y rapido, permite iterar sobre flujos de razonamiento y tool calling antes de escalar a modelos mayores.
- Filtrado y clasificacion de texto: puede usarse para tareas de clasificacion binaria o etiquetado en ingles, aprovechando su capacidad de generacion condicionada.
- Educacion y experimentacion: como modelo abierto y comprimido, sirve para ensenar tecnicas de cuantizacion y compresion, o para probar el runtime Cascadia en proyectos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card reporta mediciones de perplexity sobre 16.352 tokens pareados de FineWeb-Edu, comparando el modelo base bf16 y el paquete comprimido:

| Modelo | Perplexity (FineWeb-Edu) |
|---|---:|
| LiquidAI/LFM2.5-350M (bf16) | 2500,67 |
| ZTFlynn/LFM2.5-350M-Cascadia-ternary3 | 2637,28 |

La diferencia no es estadisticamente detectable (intervalo de confianza del 95%: [0,9019x, 1,2477x], t = +0,71), lo que limita la evidencia de coste de compresion a un margen del 24,8%. Ademas, se reporta la fidelidad de reconstruccion:

| Metrica | Valor |
|---|---:|
| Error L2 relativo vs checkpoint bf16 | 0,0481 |
| Ganancia sistematica (1,0000 = fiel) | 0,9993 |
| Tensores evaluados | 93 de 93 (100% de parametros) |

Por clase de tensor: lineales (287M params) rel L2 = 0,0604; embedding (67M params) rel L2 = 0,0230.

## Requisitos de hardware

- VRAM: no requiere VRAM; la inferencia se ejecuta en CPU.
- Memoria RAM: el paquete pesa 241 MB, por lo que cabe en dispositivos con 512 MB o menos (se recomienda al menos 256 MB libres).
- CPU: cualquier procesador x86_64 o ARM con soporte para libc, libm y libgomp (OpenMP). El runtime C esta optimizado para ejecucion en CPU.
- GPU: no necesaria; aunque se podria ejecutar en GPU con el wrapper Python, el diseno esta pensado para CPU.
- Opciones de despliegue: runtime C de Cascadia (repositorio EntroMorphic/cassie) o el modulo Python `cascadia` que carga el paquete sobre un modelo transformers bf16.
- Latencia y throughput: no especificados en la documentacion. Dado el tamano (350M) y la compresion, se espera una latencia de pocos milisegundos por token en CPUs modernas, pero no hay datos publicados.

## Comparativa con modelos similares

La informacion disponible no incluye datos de otros modelos comprimidos comparables. Se puede comparar con el modelo base sin comprimir:

| Modelo | Parametros | Tamano | Contexto | Perplexity (FineWeb-Edu) | Licencia |
|---|---|---|---|---|---|
| LiquidAI/LFM2.5-350M (bf16) | 350M | 676 MB | no disponible | 2500,67 | lfm-open-license |
| ZTFlynn/LFM2.5-350M-Cascadia-ternary3 | 350M | 241 MB | no disponible | 2637,28 | lfm-open-license |

No se dispone de datos de modelos como Qwen2.5-0.5B, SmolLM2-360M o similares en la informacion proporcionada, por lo que no se puede realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- Idioma: solo ingles; no soporta otros idiomas de forma nativa.
- Tamano reducido: con 350M de parametros, las capacidades de razonamiento complejo, matematica avanzada o generacion de codigo extenso son limitadas.
- Dependencia del runtime Cascadia: el paquete no es un checkpoint de `transformers`; requiere el runtime C o el wrapper Python especifico. No se puede cargar directamente con `AutoModelForCausalLM`.
- Licencia lfm-open-license: debe revisarse el texto completo en el enlace de LiquidAI para conocer las restricciones de uso comercial y redistribucion.
- Calidad de compresion: aunque la perplexity no muestra degradacion significativa, el error de reconstruccion L2 de 0,0481 implica que los pesos no son identicos al original; en tareas muy sensibles a pequenas variaciones (p. ej., generacion de numeros exactos) podria haber diferencias.
- Sin soporte multimodal: no procesa imagenes ni audio, a diferencia de otros modelos de la familia LFM2.
- Fecha de creacion futura: la model card indica fecha de creacion en 2026, lo que sugiere que el modelo podria ser experimental o no estar verificado en entornos de produccion.

## Enlaces

- Modelo comprimido en Hugging Face: https://huggingface.co/ZTFlynn/LFM2.5-350M-Cascadia-ternary3
- Modelo base LFM2.5-350M: https://huggingface.co/LiquidAI/LFM2.5-350M
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Documentacion de Liquid sobre LFM2.5-350M: https://docs.liquid.ai/lfm/models/lfm25-350m
- Technical Report LFM2 (arXiv): https://arxiv.org/html/2511.23404v1
- Repositorio del runtime Cascadia: https://github.com/EntroMorphic/cassie
- Formato de paquete Cascadia: https://github.com/EntroMorphic/cassie/blob/main/docs/package_format.md
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
