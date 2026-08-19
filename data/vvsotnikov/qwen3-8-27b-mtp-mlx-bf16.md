# vvsotnikov/Qwen3.8-27B-MTP-MLX-bf16

## Resumen

Este repositorio no contiene un modelo de lenguaje autonomo, sino la cabecera de prediccion multi-token (MTP, por sus siglas en ingles) extraida del modelo Qwen/Qwen3.8-27B. El autor, vvsotnikov, la publica por separado porque el convertidor de MLX elimina los tensores `mtp.` al construir el modelo principal, impidiendo su uso para decodificacion especulativa en ese runtime.

La funcion de este drafter es proponer hasta tres tokens candidatos en cada paso de generacion, que el modelo objetivo verifica posteriormente. Al ser un componente de solo 0,4B de parametros en bf16, ocupa apenas 0,9 GB y esta disenado para acelerar la inferencia del modelo Qwen3.8-27B en entornos MLX, especialmente en Apple Silicon, sin degradar la calidad de la salida, ya que esta depende exclusivamente del modelo objetivo. Su relevancia radica en que permite aprovechar la decodificacion especulativa de forma nativa en `mlx-vlm` 0.6.8, reduciendo la latencia en tareas de generacion de texto y codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_mtp (cabecera Multi-Token Prediction) |
| Parametros totales | 424.699.392 (~0,4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo objetivo; Qwen3.8-27B soporta hasta 256K) |
| Tipos de cuantizacion | bf16 nativo; el autor publica variantes 8bit y 4bit por separado |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con MLX) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una extraccion quirurgica de los 15 tensores que Qwen incluye bajo el prefijo `mtp.` en el checkpoint de Qwen3.8-27B. El proceso, realizado con la herramienta `mlx_vlm.speculative.drafters.qwen3_5_mtp.split`, elimina el prefijo y anade 1.0 a cada peso de RMSNorm, ya que Qwen almacena la escala de normalizacion menos uno. El resultado es un modelo con `model_type: qwen3_5_mtp` y un tamaño de bloque MTP de 3, lo que significa que propone tres tokens por paso.

La arquitectura subyacente del modelo objetivo, Qwen3.8-27B, es un transformer denso hibrido GDN (vision-lenguaje) con capacidades de razonamiento y vision, segun la documentacion de SGLang. El drafter se vincula a las embeddings del objetivo en tiempo de ejecucion, por lo que no puede funcionar de forma independiente. No se ha aplicado ningun proceso de RLHF o DPO sobre esta cabecera; su unica funcion es la generacion especulativa de candidatos.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa (hasta 3 tokens por paso).
- Aceleracion de la inferencia del modelo Qwen3.8-27B en runtime MLX.
- Compatibilidad automatica con `--draft-kind mtp` en `mlx-vlm`, detectado a partir del `model_type`.
- No genera texto por si mismo: carece de embeddings y de `lm_head`.
- La calidad de la salida la determina exclusivamente el modelo objetivo, no el drafter.
- Soporte para integracion con modelos de vision-lenguaje a traves de `mlx-vlm`.

## Casos de uso

- Aceleracion de inferencia en Apple Silicon: al ejecutar Qwen3.8-27B en un Mac con MLX, este drafter reduce la latencia por token al proponer multiples candidatos que el modelo objetivo verifica en paralelo.
- Despliegue local de asistentes de codigo: combinado con el modelo objetivo, permite generar fragmentos de codigo con menor tiempo de respuesta en entornos de desarrollo integrados.
- Reduccion de costes de inferencia: al disminuir el numero de pasos de decodificacion del modelo grande, se reduce el consumo energetico y el tiempo de computo en hardware local.
- Investigacion sobre decodificacion especulativa: sirve como referencia para estudiar el impacto de la cabecera MTP en la tasa de aceptacion y el rendimiento general del sistema.
- Optimizacion de pipelines de vision-lenguaje: al ser compatible con `mlx-vlm`, puede acelerar tareas que combinan entrada visual y generacion de texto, como el analisis de imagenes o la generacion de descripciones.
- Evaluacion de variantes de cuantizacion: el autor publica versiones en 8bit y 4bit, lo que permite medir la perdida de tasa de aceptacion frente al ahorro de memoria en diferentes configuraciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que la extraccion fue verificada (15 tensores en bf16, ajuste de RMSNorm aplicado correctamente) y que la version bf16 "borradores al menos tan bien como" las versiones cuantizadas, pero no se proporcionan cifras concretas de tasa de aceptacion, latencia o throughput.

## Requisitos de hardware

- El drafter en bf16 ocupa 0,9 GB, por lo que cabe en cualquier Mac con MLX y en cualquier GPU con al menos 2 GB de VRAM.
- El requisito real de hardware viene impuesto por el modelo objetivo Qwen3.8-27B, que es un modelo denso de 27B parametros. En bf16 requiere aproximadamente 54 GB de memoria; en 8bit, unos 27 GB; y en 4bit, unos 14 GB.
- Segun la documentacion de SGLang, el modelo objetivo puede ejecutarse en una sola GPU como H200, RTX PRO 6000, RTX 5090 o DGX Spark.
- Para usar este drafter se necesita el runtime MLX / `mlx-vlm` 0.6.8 o superior.
- No se dispone de datos de latencia o throughput especificos para este drafter.

## Comparativa con modelos similares

El autor publica tres variantes del mismo drafter para Qwen3.8-27B, que se diferencian unicamente en la precision:

| Modelo | Precision | Tamano | Uso recomendado |
|---|---|---|---|
| Qwen3.8-27B-MTP-MLX-bf16 | bf16 | 0,9 GB | Maxima tasa de aceptacion, requiere mas memoria |
| Qwen3.8-27B-MTP-MLX-8bit | 8bit | ~0,45 GB | Equilibrio entre memoria y tasa de aceptacion |
| Qwen3.8-27B-MTP-MLX-4bit | 4bit | ~0,25 GB | Minimo consumo de memoria, menor tasa de aceptacion |

No se dispone de datos comparativos con otros sistemas de decodificacion especulativa como EAGLE o Medusa aplicados a este mismo modelo base.

## Limitaciones y advertencias

- No es un modelo autonomo: carece de embeddings y de `lm_head`, por lo que cualquier intento de cargarlo o usarlo de forma independiente fallara.
- Debe emparejarse estrictamente con el checkpoint objetivo `Qwen/Qwen3.8-27B`. Un emparejamiento con otro modelo fallara en la comprobacion de tamaños ocultos o producira borradores de baja calidad.
- La configuracion base solo declara soporte para ingles, aunque el modelo objetivo pueda manejar otros idiomas.
- La licencia Apache 2.0 se hereda del modelo base, pero es obligatorio revisar los terminos de la licencia original de Qwen antes de su uso comercial.
- Depende de una version concreta de `mlx-vlm` (0.6.8) y de la herramienta de extraccion, por lo que cambios en el runtime pueden requerir actualizaciones del drafter.
- No se han publicado metricas de rendimiento ni de tasa de aceptacion, por lo que el beneficio real en latencia debe validarse en el entorno de despliegue especifico.

## Enlaces

- Repositorio del drafter: https://huggingface.co/vvsotnikov/Qwen3.8-27B-MTP-MLX-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante 8bit: https://huggingface.co/vvsotnikov/Qwen3.8-27B-MTP-MLX-8bit
- Variante 4bit: https://huggingface.co/vvsotnikov/Qwen3.8-27B-MTP-MLX-4bit
- Documentacion de SGLang para Qwen3.8-27B: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-27B
- Documentacion de Unsloth para la familia Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
