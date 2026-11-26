# Xylolabs/Hy-MT3-7B-MLX-4bit

## Resumen

Hy-MT3-7B-MLX-4bit es una cuantizacion en 4 bits del modelo de traduccion tencent/Hy-MT3-7B, publicada por Xylolabs y empaquetada en formato MLX para su ejecucion con `mlx-lm` en hardware Apple Silicon. El modelo base es un transformer denso de 7.504.568.320 parametros (aproximadamente 7,5 mil millones) especializado en traduccion automatica y entrenado para cubrir mas de 100 idiomas, segun declara el autor de la cuantizacion.

El problema que resuelve esta variante concreta es el despliegue eficiente del modelo de traduccion en equipos con memoria unificada limitada: reduce el peso en disco de 15,01 GB (BF16) a 4,35 GB, manteniendo una calidad de traduccion muy cercana a la del modelo original. La cuantizacion es de tipo affine con tamano de grupo 64 y escalas y sesgos en float16, aplicada a todos los pesos lineales y al embedding de tokens (incluida la cabeza LM), con la excepcion de `mlp.down_proj` y `self_attn.v_proj` en las capas 0-3 y 28-31, que se mantienen en 6 bits.

Es relevante ahora porque permite ejecutar un modelo de traduccion multilingue de 7B en un Mac con 32 GB de memoria unificada, con una perdida de calidad medida muy contenida (KL de 0,167 sobre WikiText-2 y chrF++ de 43,56 frente a 43,75 del BF16). La licencia Apache 2.0 facilita su uso comercial, aunque el modelo esta pensado exclusivamente para traduccion, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `hunyuan_v1_dense`), derivado de tencent/Hy-MT3-7B |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 256K segun la tabla de hardware del autor (depende de la memoria disponible; 126K con 36 GB, 193K con 48 GB, 256K con 64 GB o mas) |
| Tipos de cuantizacion | MLX 4-bit (affine, group size 64, escalas y sesgos en float16); existe variante MLX 8-bit del mismo autor |
| Idiomas soportados | mas de 100 (zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, entre otros; la lista completa de tags incluye alrededor de 100 codigos ISO) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (`mlx`, `quantized`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso identificado en los metadatos como `hunyuan_v1_dense`, con 7.504.568.320 parametros. La model card de esta cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponderia a la model card del modelo original tencent/Hy-MT3-7B, que no se proporciona en la informacion disponible.

La innovacion tecnica de esta publicacion es el proceso de cuantizacion: cuantizacion affine de 4 bits con grupo de 64 sobre todos los pesos lineales y el embedding de tokens, incluyendo la cabeza LM, con escalas y sesgos en float16 y las capas de normalizacion tambien en float16. Se preservan en 6 bits las proyecciones `mlp.down_proj` y `self_attn.v_proj` de las capas 0-3 y 28-31, una decision de compromiso para reducir la degradacion en las capas mas sensibles. El resultado ocupa 4,35 GB frente a los 15,01 GB del BF16. El autor publica tambien una variante de 8 bits (7,97 GB) con perdida practicamente nula.

## Capacidades

- Traduccion automatica multilingue en mas de 100 idiomas, con pares directos e inversos (la evaluacion cubre en-zh, zh-en, en-ko, ko-en, en-ja y ja-en).
- Generacion de texto orientada a traduccion: el prompt recomendado pide unicamente el resultado traducido, sin explicaciones adicionales.
- Cobertura de idiomas de bajos recursos y variedades regionales, segun la lista de tags (por ejemplo, yue, ceb, war, ckb, sd, ug, bo, sa).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documenta soporte de multi-step reasoning ni de instrucciones generales fuera del caso de traduccion.

## Casos de uso

- Traduccion de documentacion tecnica en local: el modelo puede traducir manuales y articulos entre los mas de 100 idiomas soportados ejecutandose integramente en un Mac, sin enviar contenido a servicios externos, lo que resulta adecuado para material confidencial.
- Localizacion de productos de software: con contexto de hasta 256K tokens en equipos con 64 GB o mas de memoria unificada, permite procesar glosarios y cadenas de interfaz en lotes grandes manteniendo coherencia terminologica dentro de la misma ventana.
- Traduccion de subtitulos y transcripciones: el modelo puede traducir segmentos cortos de forma iterativa; su tamano de 4,35 GB permite mantenerlo cargado en memoria mientras se procesan flujos de texto continuos.
- Atencion al cliente multilingue en modo batch: se puede usar para traducir tickets y conversaciones entre idiomas poco cubiertos por otros modelos (por ejemplo, km, my, si, ne) antes de pasarlos a un sistema de gestion.
- Investigacion en traduccion automatica: la publicacion incluye metricas KL y chrF++ por direccion, lo que facilita reproducir evaluaciones de cuantizacion sobre WMT24++ y comparar 4 bits frente a 8 bits y BF16.
- Procesamiento de corpus en estaciones de trabajo Apple: al ejecutarse con `mlx-lm`, se integra en pipelines de Python sobre Apple Silicon sin necesidad de GPU dedicada, util para preprocesar datasets de investigacion.
- Traduccion de correspondencia y documentos legales internos: el contexto largo permite incluir instrucciones de estilo y glosarios junto al texto a traducir en una sola llamada.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantizacion. KL se mide frente a BF16; chrF++ es la media de seis direcciones sobre 1.200 segmentos de WMT24++.

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | chrF++ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 4,35 GB | 0,167002 | 84,980 % | 0,055181 | 92,333 % | 0,172145 | 86,843 % | 43,56 |
| MLX 8-bit | 7,97 GB | 0,001188 | 98,922 % | 0,000574 | 99,373 % | 0,002071 | 98,725 % | 43,75 |
| BF16 | 15,01 GB | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | 43,75 |

chrF++ por direccion:

| Cuantizacion | en-zh | zh-en | en-ko | ko-en | en-ja | ja-en |
|---|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 35,18 | 53,64 | 35,16 | 55,07 | 32,18 | 50,16 |
| MLX 8-bit | 35,57 | 53,63 | 35,58 | 54,98 | 32,48 | 50,24 |
| BF16 | 35,50 | 53,62 | 35,49 | 54,99 | 32,70 | 50,19 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, lo cual es coherente con un modelo especializado en traduccion.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 4,35 GB de pesos en 4 bits, mas la memoria para el contexto y el estado de inferencia; el autor indica que con 36 GB de memoria unificada se alcanza un contexto de 126K, con 48 GB se llega a 193K y con 64 GB o mas, a 256K.
- Hardware objetivo: Apple Silicon con MLX; la tabla del autor cita Mac Studio con chip M5 Max (32 o 40 nucleos de GPU) y M5 Ultra (80 nucleos de GPU), con 36, 48, 64, 96, 128, 256 o 512 GB de memoria unificada.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este paquete MLX; para ese hardware habria que usar la variante del modelo base en otro formato, que no se detalla en la informacion disponible.
- Cabe en equipos consumer Apple Silicon con al menos 36 GB de memoria unificada segun la tabla del autor; no se documentan requisitos para configuraciones con menos memoria.
- Despliegue: `mlx-lm==0.32.2` (comando `mlx_lm.generate`); no se documentan opciones con vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Hy-MT3-7B-MLX-4bit | 7,5B | hasta 256K segun memoria | MLX 4-bit, 4,35 GB | Apache 2.0 | chrF++ medio 43,56; especializado en traduccion |
| Xylolabs/Hy-MT3-7B-MLX-8bit | 7,5B | hasta 256K segun memoria | MLX 8-bit, 7,97 GB | Apache 2.0 | chrF++ medio 43,75; KL casi nula frente a BF16 |
| tencent/Hy-MT3-7B (BF16) | 7,5B | no disponible en la informacion | BF16, 15,01 GB | Apache 2.0 | Referencia de calidad; chrF++ medio 43,75 |

No se dispone en la informacion proporcionada de datos de otros modelos de traduccion comparables (por ejemplo, NLLB o M2M-100) para establecer una comparacion cuantitativa; no disponible.

## Limitaciones y advertencias

- Modelo especializado en traduccion: no esta disenado ni evaluado para generacion general, razonamiento, codigo o uso como asistente conversacional.
- Perdida de calidad por cuantizacion: el KL frente a BF16 es de 0,167 en WikiText-2 y el top-1 baja al 84,98 %; en tareas sensibles a la fidelidad lexica conviene valorar la variante de 8 bits.
- El rendimiento por direccion es desigual: chrF++ cae a 32,18 en en-ja y 35,16 en en-ko, frente a 55,07 en ko-en; la calidad depende fuertemente del par de idiomas.
- Solo para Apple Silicon: el paquete MLX no es portable a CUDA ni a CPU x86 sin conversion previa.
- Riesgo de alucinacion y de omisiones en textos largos: no se documentan evaluaciones especificas sobre fidelidad en documentos extensos ni sobre terminologia especializada.
- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible; al ser una cuantizacion, hereda los del modelo base.
- Licencia Apache 2.0, que permite uso comercial, pero se recomienda revisar `LICENSE.txt` y `NOTICE` del repositorio por si hay condiciones adicionales de atribucion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada es 2026-11-26; conviene verificar la vigencia y el soporte del autor antes de adoptarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Hy-MT3-7B-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-7B
- Variante 8-bit del mismo autor: https://huggingface.co/Xylolabs/Hy-MT3-7B-MLX-8bit
- Repositorio de la herramienta de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- MLX: https://github.com/ml-explore/mlx
- No se han encontrado en la busqueda web papers, blogs ni demos adicionales sobre esta cuantizacion.
