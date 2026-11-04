# TigreGotico/nllb_200_distilled_600m-zul-eng-onnx

## Resumen

`nllb_200_distilled_600m-zul-eng-onnx` es la exportación a formato ONNX del modelo `dsfsi/nllb_200_distilled_600m-zul-eng`, un fine-tune de `facebook/nllb-200-distilled-600M` especializado en traducción unidireccional de zulú (`zul_Latn`) a inglés (`eng_Latn`). El modelo original fue entrenado por DSFSI (Data Science for Social Impact), grupo de investigación de la Universidad de Pretoria, sobre el dataset `afriscience-mt`. Esta versión, publicada por TigreGotico, no modifica los pesos: solo los convierte a ONNX y añade una variante cuantizada a int8.

La relevancia del artefacto es eminentemente práctica: ofrece un modelo de traducción de 600 millones de parámetros en un formato portable (ONNX Runtime) con dos builds (fp32 de aproximadamente 7 GB e int8 dinámico de 1,9 GB), lo que permite desplegarlo en entornos sin PyTorch o con recursos limitados. La arquitectura subyacente es la de NLLB-200 distilled, un transformer encoder-decoder seq2seq de tipo M2M-100, con atención multi-cabeza estándar y vocabulario multilingüe compartido.

El par de idiomas es de bajos recursos: el zulú cuenta con representación limitada en corpus paralelos de alta calidad, y este checkpoint forma parte de los esfuerzos de AfricanLP por cubrir lenguas africanas. La licencia Apache-2.0 y la disponibilidad de gráficos ONNX pre-cuantizados lo convierten en una pieza útil para pipelines de traducción en producción, aunque su alcance es estrictamente unidireccional y limitado a un único par lingüístico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (NLLB-200 distilled, familia M2M-100) |
| Parámetros totales | 600 M (según nombre del checkpoint base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (NLLB-200 estándar usa segmentos de hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | fp32 (ONNX) e int8 dinámico per-channel (ONNX Runtime) |
| Idiomas soportados | zulú (`zul_Latn`) como origen, inglés (`eng_Latn`) como destino |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`*.onnx` + `*.onnx_data` externos) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder con atención completa, derivado de `facebook/nllb-200-distilled-600M`, que a su vez sigue la arquitectura M2M-100 con vocabulario multilingüe compartido y tokens de idioma `flores_code` (por ejemplo `zul_Latn`, `eng_Latn`). El fine-tune realizado por DSFSI adapta el checkpoint multilingüe al par zulú→inglés usando el dataset `afriscience-mt`; la model card no detalla el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO.

La contribución de este repositorio es puramente de formato: exportación con `optimum-cli export onnx --task text2text-generation-with-past --no-post-process` y cuantización dinámica con `onnxruntime.quantization.quantize_dynamic` (`QInt8`, `per_channel=True`, `reduce_range=False`, `use_external_data_format=True`, `EnableSubgraph=True`). Cada grafo int8 almacena sus pesos en un fichero `int8/<graph>.onnx_data`. El script de cuantización vive en `TigreGotico/linguonnx` (`scripts/export/quantize_seq2seq_int8.py`). No se introduce ninguna innovación arquitectónica propia; el valor añadido es la paridad verificada frente al modelo PyTorch original y la reducción de tamaño (7,4 GB → 1,9 GB).

## Capacidades

- Traducción automática unidireccional de zulú a inglés, con etiquetas de idioma NLLB (`zul_Latn` origen, `eng_Latn` destino).
- Generación seq2seq con decodificación greedy y beam search (beam=4 verificado en la model card).
- Ejecución en ONNX Runtime con caché de atención (`use_cache=True`) y sin fusión de grafos (`use_merged=False`).
- Soporte de cuantización int8 dinámica con paridad funcional aproximada frente a fp32 (chrF 60,31 vs 60,26 en FLORES-200, primeros 50 segmentos de devtest).
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al par declarado; no es un modelo multilingüe general en esta configuración.

## Casos de uso

- Traducción de documentación técnica y científica del zulú al inglés: el modelo se integra en pipelines de procesamiento por lotes con ONNX Runtime, traduciendo abstracts o informes de investigación redactados en zulú para su revisión por equipos internacionales. El tamaño int8 de 1,9 GB permite ejecutarlo en servidores modestos.
- Localización de contenido web y aplicaciones: traducción de cadenas de interfaz, artículos y material educativo desde zulú, aprovechando la API de `ORTModelForSeq2SeqLM` para incrustar el modelo en servicios backend sin dependencia de PyTorch.
- Subtitulado y transcripción asistida: combinado con un ASR previo, el modelo traduce transcripciones en zulú a inglés para generar subtítulos en inglés en medios de comunicación sudafricanos.
- Investigación en lingüística computacional de lenguas africanas: sirve como línea base reproducible (formato ONNX, licencia Apache-2.0) para experimentos de evaluación en FLORES-200 y comparación de técnicas de cuantización.
- Despliegue en dispositivos de borde o entornos con recursos limitados: la variante int8 de 1,9 GB puede ejecutarse en CPUs sin GPU mediante ONNX Runtime, útil para aplicaciones de traducción offline en contextos con conectividad limitada.
- Moderación y análisis de contenido en zulú: traducción previa al inglés para aplicar clasificadores o filtros entrenados principalmente en inglés sobre textos originalmente en zulú.

## Benchmarks y rendimiento

| Build | Tamaño | chrF (FLORES-200, n=50) | Salidas idénticas a fp32 |
|---|---|---|---|
| fp32 | 7,4 GB | 60,26 | 50/50 |
| int8 | 1,9 GB | 60,31 | 27/50 |

| Decodificación | fp32, exact match (n=10) |
|---|---|
| greedy | 100 % (10/10) |
| beam=4 | 100 % (10/10) |

La model card advierte explícitamente que la paridad con n=10 es una estimación ruidosa y no un benchmark a escala FLORES; una campaña de medición del mismo proyecto observó oscilaciones de 100 % a 14 % al pasar de n=5 a n=100 en FLORES-200 para otro modelo. Los valores de chrF corresponden a los primeros 50 segmentos de devtest `zul_Latn`→`eng_Latn` con decodificación greedy en ONNX Runtime 1.31.1, medidos con sacrebleu. No se han publicado resultados de MMLU, HumanEval ni GSM8K, que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7-8 GB para el build fp32 en GPU; en torno a 2-3 GB para el build int8 (estimación a partir del tamaño de los pesos, no confirmada en la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp32 (RTX 3060 Ti, RTX 4060, RTX 4090, A100, H100). El build int8 cabe en GPUs consumer de gama baja e incluso en CPU.
- Cabe en GPU consumer: sí, en todas las RTX con 8 GB o más para fp32; el int8 es viable en iGPU y CPU.
- Opciones de despliegue: ONNX Runtime mediante `optimum.onnxruntime.ORTModelForSeq2SeqLM`; también es posible exportar los grafos a otros runtimes compatibles con ONNX. No se documenta soporte directo en vLLM, llama.cpp, Ollama ni TGI (son stacks orientados a modelos decoder-only).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `TigreGotico/nllb_200_distilled_600m-zul-eng-onnx` | 600 M | no disponible | zu→en | Apache-2.0 | ONNX (fp32, int8) |
| `dsfsi/nllb_200_distilled_600m-zul-eng` | 600 M | no disponible | zu→en | Apache-2.0 | PyTorch (safetensors/bin) |
| `facebook/nllb-200-distilled-600M` | 600 M | no disponible | 200 lenguas | CC-BY-NC-4.0 | PyTorch, ONNX |
| `facebook/m2m100_418M` | 418 M | no disponible | 100 lenguas | MIT | PyTorch |

La ventaja frente al checkpoint original de DSFSI es el formato ONNX y la variante int8; frente a NLLB-200 distilled completo, este modelo está especializado en un solo par y tiene licencia Apache-2.0 (uso comercial permitido), mientras que el checkpoint de Meta es CC-BY-NC-4.0. Frente a M2M100, el modelo de DSFSI se apoya en el vocabulario NLLB, con mejor cobertura de lenguas africanas de bajos recursos. No se dispone de comparativas de chrF entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce zulú→inglés; no soporta la dirección inversa ni otros pares.
- Requiere pasar explícitamente `forced_bos_token_id` con la etiqueta `eng_Latn` en tiempo de generación; el token de destino no está fijado en `generation_config.json`.
- La evaluación de paridad se basa en muestras pequeñas (n=10 exact match; n=50 FLORES-200), por lo que los porcentajes son indicativos y no sustituyen una evaluación a escala FLORES + chrF.
- El build int8 produce salidas idénticas a fp32 en solo 27 de 50 casos, aunque el chrF agregado es equivalente; puede haber divergencias cualitativas en frases concretas.
- Riesgo de alucinación y de traducciones fluentes pero incorrectas en dominios especializados (términos técnicos, nombres propios, jerga), habitual en modelos seq2seq de 600 M.
- Sesgos potenciales heredados del corpus `afriscience-mt` y de NLLB-200 distilled; no se documenta auditoría de sesgos.
- Licencia Apache-2.0 permite uso comercial, pero la model card atribuye la autoría a DSFSI y conviene preservar la atribución.
- Sin soporte de tool calling, agentes, visión ni audio; no es un modelo de propósito general.
- El repositorio ocupa 15,1 GB, lo que incluye ambos builds; conviene descargar solo la variante necesaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TigreGotico/nllb_200_distilled_600m-zul-eng-onnx
- Modelo base (DSFSI): https://huggingface.co/dsfsi/nllb_200_distilled_600m-zul-eng
- Modelo original de Meta: https://huggingface.co/facebook/nllb-200-distilled-600M
- Repositorio de herramientas de exportación: https://github.com/TigreGotico/linguonnx
- DSFSI (Data Science for Social Impact, Universidad de Pretoria): https://dsfsi.github.io/
- Paper de NLLB-200: https://arxiv.org/abs/2207.04672
- Dataset FLORES-200: https://github.com/facebookresearch/flores
- ONNX Runtime: https://onnxruntime.ai/
