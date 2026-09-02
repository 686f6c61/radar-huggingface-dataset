# Wiself/gemma-4-26B-A4B-Styletune-V2-Voice

## Resumen

Wiself/gemma-4-26B-A4B-Styletune-V2-Voice no es un modelo de lenguaje completo, sino un tensor único extraído del finetune StyleTune V2 de Gryphe sobre el modelo base Gemma 4 26B A4B de Google. Concretamente, contiene únicamente el peso de la capa de proyección de salida (`lm_head.weight`) en formato BF16, con forma `[262144, 2048]` y un tamaño aproximado de 1,1 GB. Este tensor concentra el "estilo" del finetune, es decir, la reducción de clichés y la diferenciación léxica que caracterizan a StyleTune V2, sin necesidad de descargar el modelo completo de 52 GB.

La propuesta es que, mediante la herramienta `voice` (también de Wiself), se pueda "fundir" este tensor sobre cualquier GGUF existente de Gemma 4 26B A4B (cualquier cuantización, cualquier finetune compatible) para transferirle la voz de StyleTune. De esta forma, un usuario que ya tenga un GGUF de este modelo puede obtener el estilo StyleTune con una descarga adicional de solo 1,1 GB, en lugar de reemplazar todo el modelo. El resultado es un archivo GGUF único, sin adaptadores en tiempo de ejecución ni modelos adicionales.

La relevancia de esta pieza radica en su enfoque quirúrgico: demuestra que un solo tensor puede portar la identidad estilística de un finetune, y que esa identidad se transfiere a través de distintas variantes del mismo modelo base (finetunes, cuantizaciones, incluso versiones abliteradas con ciertos ajustes). Está pensado para desarrolladores que trabajan con Gemma 4 26B A4B y buscan mejorar la calidad de escritura creativa o roleplay sin duplicar el almacenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tensor de voz (lm_head) para Gemma 4 26B A4B (MoE) |
| Parametros totales | 1 tensor de 262144 x 2048 (aprox. 1,1 GB en BF16) |
| Parametros activos | No aplica (no es un modelo completo) |
| Longitud de contexto | No disponible (depende del modelo base sobre el que se aplique) |
| Tipos de cuantizacion | BF16 nativo; al aplicar se cuantiza el tensor a Q8_0 (near-lossless) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (voice.safetensors) + metadatos JSON; se convierte a GGUF mediante la herramienta voice |

## Arquitectura y entrenamiento

El tensor `lm_head.weight` proviene del finetune StyleTune V2 de Gryphe, que a su vez parte del modelo base Gemma 4 26B A4B (arquitectura Mixture-of-Experts con 26B parametros totales y 4B activos por token). StyleTune V2 entrena exclusivamente la capa de proyeccion de salida (lm_head), dejando congeladas las 30 capas transformer, las cabezas de atencion y los MLPs. Segun la documentacion, se realizo una sola epoca de entrenamiento porque una segunda epoca degradaba la estabilidad en modelos MoE. Los datos de entrenamiento no se detallan en la informacion disponible, aunque se menciona colaboracion con Anthracite y LatitudeGames.

La innovacion tecnica de este repositorio es la extraccion de ese tensor como un artefacto independiente y portable. La herramienta `voice` permite "fundir" el tensor sobre cualquier GGUF de Gemma 4 26B A4B, reemplazando unicamente la cabeza de salida. El proceso de casting cuantiza el tensor a Q8_0 (perdida minima) y copia el resto de tensores sin modificacion. Existe una variante "delta" que solo contiene la diferencia respecto al instruct base, util para evitar bucles de generacion en variantes abliteradas.

## Capacidades

- Transferencia de estilo: aplica la voz de StyleTune V2 (menos cliches, vocabulario mas diverso) a cualquier GGUF de Gemma 4 26B A4B.
- Compatibilidad con multiples cuantizaciones: funciona con cualquier cuantizacion GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) sin necesidad de reentrenar.
- Compatibilidad con otros finetunes: se puede aplicar sobre finetunes distintos al base (por ejemplo, Orion-26B-A4B-v1.4) manteniendo la identidad estilistica.
- Soporte para variantes abliteradas: mediante el modo delta, evita bucles de generacion en modelos abliterados o uncensored.
- No requiere adaptadores en runtime: el resultado es un unico archivo GGUF listo para usar con llama.cpp u otros motores.
- No aporta capacidades propias de generacion, razonamiento o tool calling: depende completamente del modelo base sobre el que se aplique.

## Casos de uso

- Mejora de estilo en roleplay: un usuario que ya tiene un GGUF de Gemma 4 26B A4B (por ejemplo, una variante instruct) puede aplicar esta voz para obtener respuestas con menos cliches y mas variedad lexica, ideal para juegos de rol textuales.
- Escritura creativa y narrativa: escritores que usan modelos locales pueden transferir el estilo StyleTune a su modelo base preferido, mejorando la calidad literaria sin descargar el finetune completo de 52 GB.
- Personalizacion de modelos existentes: desarrolladores que mantienen finetunes propios sobre Gemma 4 26B A4B pueden "inyectar" la voz de StyleTune sin reentrenar, simplemente reemplazando el lm_head.
- Optimizacion de almacenamiento en despliegues locales: en entornos con espacio limitado, permite obtener el estilo StyleTune con una descarga adicional de solo 1,1 GB en lugar de 52 GB.
- Experimentacion con variantes abliteradas: mediante el modo delta, se puede aplicar la voz a modelos uncensored o abliterados, evitando bucles de generacion y manteniendo la coherencia.
- Evaluacion de transferencia de estilo: investigadores pueden estudiar como un unico tensor afecta a la distribucion de salida en diferentes bases, cuantizaciones y finetunes, como se demuestra en las pruebas con Orion.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de las mediciones de Gryphe en la model card de StyleTune V2 (200 prompts de roleplay, greedy 0.0, comparado con el instruct base) y de una verificacion independiente de Wiself (10 prompts, heuristico, solo direccional).

| Metrica | Base instruct | StyleTune V2 (Gryphe) | Voz aplicada a Orion (Wiself) |
|---|---|---|---|
| Cliches por 100 palabras | 1.141 | 0.551 (-52%) | No medido |
| Vocabulario compartido de trigramas (temp 1.0) | — | 19.9% | 1.6% |
| Vocabulario compartido de trigramas (greedy) | — | — | 3.2% |

Nota: la verificacion de Wiself sobre Orion no es directamente comparable con la de Gryphe (metodologia distinta), pero indica que la voz se transfiere y mantiene una baja similitud con el base. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este tensor, ya que no es un modelo autonomo.

## Requisitos de hardware

- El tensor en si ocupa ~1,1 GB en disco (BF16) y ~1,1 GB en RAM/VRAM si se carga como tensor separado.
- Para usarlo, se necesita un GGUF de Gemma 4 26B A4B ya descargado. El modelo resultante tras el casting requiere la VRAM del modelo base segun su cuantizacion:
  - Q4_K_M: ~15-18 GB de VRAM (cabe en GPUs consumer de 24 GB como RTX 3090/4090).
  - Q8_0: ~28-30 GB de VRAM (requiere GPU profesional o dual).
  - FP16 (sin cuantizar): ~53 GB (no cabe en consumer, requiere A100/H100 o similar).
- El proceso de casting se ejecuta en CPU con la herramienta `voice` (Python), sin necesidad de GPU.
- Para inferencia, se recomienda usar llama.cpp (comando `llama serve`) o cualquier motor compatible con GGUF (Ollama, vLLM con backend GGUF, etc.).
- No se dispone de datos de latencia o throughput especificos; dependen del motor y la GPU utilizada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Wiself/gemma-4-26B-A4B-Styletune-V2-Voice | Tensor de voz (lm_head) | 1 tensor (1,1 GB) | No aplica | Apache-2.0 | safetensors + GGUF | Requiere modelo base Gemma 4 26B A4B |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 | Finetune completo | 26B (4B activos) | No disponible | Apache-2.0 | safetensors | Modelo completo, 52 GB, incluye el mismo tensor |
| google/gemma-4-26B-A4B | Modelo base MoE | 26B (4B activos) | No disponible | Gemma Terms | safetensors | Base sin finetune estilistico |

La comparativa directa con otros "voice" o tensores de estilo no esta disponible en la informacion proporcionada. La alternativa mas cercana es descargar el finetune completo de Gryphe, que ofrece el mismo estilo pero con un coste de almacenamiento 47 veces mayor.

## Limitaciones y advertencias

- No es un modelo autonomo: sin un GGUF de Gemma 4 26B A4B compatible, el tensor no tiene utilidad.
- Solo compatible con la arquitectura Gemma 4 26B A4B; no funciona con otros tamanos (9B, 12B, 31B) ni con arquitecturas no Gemma.
- En variantes abliteradas o uncensored, un casting directo puede provocar bucles de generacion; se requiere el modo delta, que no siempre esta documentado para todos los casos.
- La licencia Apache-2.0 se aplica al tensor y a la herramienta, pero el modelo base de Google tiene sus propios terminos (Gemma Terms); hay que revisar la licencia del modelo base antes de compartir modelos "voiced".
- Los benchmarks de reduccion de cliches provienen de una unica fuente (Gryphe) y de una verificacion independiente con metodologia distinta; no hay evaluaciones estandarizadas.
- El tensor esta en BF16; al cuantizarlo a Q8_0 durante el casting se introduce una perdida minima pero no nula.
- No se han reportado sesgos especificos, pero al ser un tensor de salida, puede amplificar sesgos presentes en el modelo base sobre el que se aplica.
- Riesgo de alucinacion: no mitigado por este tensor; depende del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Wiself/gemma-4-26B-A4B-Styletune-V2-Voice
- Herramienta Voice: https://huggingface.co/Wiself/voice
- Modelo base StyleTune V2 (Gryphe): https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Modelo base Gemma 4 26B A4B (Google): https://huggingface.co/google/gemma-4-26B-A4B
- Variante QAT del voice: https://huggingface.co/Wiself/gemma-4-26B-A4B-QAT-Styletune-V2-Voice
- Analisis de StyleTune V2 en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gemma-4-26b-a4b-styletune-v2-gryphe
- Ficha en LLM Explorer: https://llm-explorer.com/model/Gryphe%2FGemma-4-26B-A4B-StyleTune-V2,5S3FmjfJsucvkaMA5DLpsj
