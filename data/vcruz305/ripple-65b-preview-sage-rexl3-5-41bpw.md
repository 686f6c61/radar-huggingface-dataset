# vcruz305/Ripple-65B-Preview-SAGE-REXL3-5.41bpw

## Resumen

Ripple-65B-Preview-SAGE-REXL3-5.41bpw es una cuantización de precisión mixta en formato EXL3 (trellis) del modelo base ricursiveAI/Ripple-65B-Preview, publicada por el usuario vcruz305. El pack está pensado para servir el modelo en dispositivos de clase 48 GB, con un peso GPU residente de aproximadamente 42,1 GiB y un tamaño de repositorio de 45,2 GB repartido en 10 shards safetensors. La cuantización se ha realizado con SAGE, un método propio de precisión mixta para EXL3 en el que cada tensor emplea un valor de K distinto que los kernels leen en tiempo de carga.

El dato de parámetros declarado en los safetensors es de 22.611.689.552, muy inferior a los 65B que sugiere el nombre comercial del modelo base. Esta discrepancia debe tenerse en cuenta al planificar el despliegue y al comparar con otras alternativas. El modelo es de tipo text-generation y conversacional, con licencia Apache 2.0 heredada del modelo base y acceso restringido (gated) con revisión manual de solicitudes.

La relevancia de este pack reside en su receta de servicio: SGLang 0.5.19 con el plugin sglang-exl3 y decodificación especulativa DFlash2 mediante un draft EXL3 de 4,55 bpw. El autor reporta métricas de velocidad medidas en una NVIDIA RTX PRO 6000 Blackwell de 96 GB y una evaluación de calidad frente al release oficial en BF16 con una concordancia Top-1 del 99,34% y una KLD media de 0,0005.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model_type `ricursive`; pesos en formato EXL3 trellis) |
| Parametros totales | 22.611.689.552 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (configurado en el servicio de referencia con `--context-length 131072`) |
| Tipos de cuantizacion | EXL3 trellis de precisión mixta SAGE a 5,41 bpw; drafts DFlash2 EXL3 a 4,55, 3,60 y 3,08 bpw |
| Idiomas soportados | no disponible (la model card incluye una categoría de evaluación multilingüe, sin listado de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors EXL3 (trellis), 10 shards, índice `model.safetensors.index.json`, `quant_method: exl3` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El campo `model_type` es `ricursive` y los pesos se distribuyen como tensores trellis EXL3 con distintos valores de K por tensor. La model card menciona dos elementos que apuntan a un diseño híbrido de atención: por un lado, el pool de KV se describe como `SWAKVPool` híbrido con 117.376 tokens de atención completa y 93.888 tokens de ventana deslizante; por otro, la receta de servicio configura una longitud de contexto de 131.072 tokens. No se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica documentada es la cuantización SAGE: un esquema de precisión mixta para EXL3 en el que cada tensor recibe un valor de K diferente y los kernels lo leen directamente del tensor trellis en el momento de la carga. El pack se complementa con decodificación especulativa DFlash2 mediante un draft EXL3 de 4,55 bpw, integrada a través del plugin sglang-exl3 para SGLang 0.5.19. El autor reporta que el proceso de cuantización conserva el 99,34% de concordancia Top-1 y una KLD media de 0,0005 respecto al release oficial en BF16.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 131.072 tokens en la configuración de referencia.
- Razonamiento y matemáticas: la evaluación SixCat reporta un 100,0% en la categoría Math y un 83,3% en Knowledge.
- Generación y edición de código: 95,0% en Coding y un Top-1 del 99,74% frente a BF16 en la categoría swe_patch.
- Uso de herramientas (tool calling / function calling): 90,0% en la categoría Tool Use de SixCat.
- Seguimiento de instrucciones: 85,0% en Instruction Following y un Top-1 del 99,58% frente a BF16 en ifeval.
- Capacidad multilingüe: se evalúa una categoría multilingual con Top-1 del 98,97% frente a BF16, aunque no se listan los idiomas concretos.
- Modo thinking: la evaluación SixCat se ejecuta con `thinking=on`, lo que indica soporte de un modo de razonamiento explícito.
- Decodificación especulativa: compatible con drafts DFlash2 EXL3 a 4,55, 3,60 y 3,08 bpw.
- Capacidades de visión y audio: no disponibles.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto largo gracias a su ventana de 131.072 tokens, lo que permite arrastrar el historial completo de un cliente sin truncar y sin perder coherencia en la respuesta.
- Generación de código en producción: con un 95,0% en la categoría Coding de SixCat y soporte de tool calling, puede integrarse en pipelines de revisión y generación de parches, como sugiere el 99,74% de Top-1 frente a BF16 en swe_patch.
- Asistentes con uso de herramientas: el 90,0% en Tool Use lo hace adecuado para agentes que encadenan llamadas a APIs, consultas a bases de datos y ejecución de funciones en varios pasos.
- Razonamiento matemático y tutoría: el 100,0% en Math de SixCat permite emplearlo en resolución de problemas paso a paso y en sistemas de apoyo educativo con verificación de resultados.
- Procesamiento de documentos largos: las pruebas long17k, con 10.654 tokens evaluados en un contexto de 17.408 tokens y un Top-1 del 98,70% frente a BF16, respaldan su uso en resumen y extracción sobre documentos extensos.
- Despliegue en un solo dispositivo de 48 GB: con aproximadamente 42,1 GiB de pesos residentes y texto únicamente, encaja en GPUs profesionales de esa clase, lo que facilita servir el modelo sin infraestructura multi-GPU.
- Servicio de alto rendimiento con SGLang: la receta con SGLang 0.5.19, el plugin sglang-exl3 y el draft DFlash2 permite prefill de hasta 1.802,2 tok/s y decodificación de 64,8 tok/s en prompts cortos sobre una RTX PRO 6000 Blackwell de 96 GB.
- Evaluación de calidad de cuantizaciones: el pack y sus métricas de KLD y concordancia Top-1 sirven como referencia para comparar otras cuantizaciones del mismo modelo base antes de pasar a producción.

## Benchmarks y rendimiento

Evaluación SixCat (`challenge-v1`, `thinking=on`, temperatura 0,6, semilla 1, 20 ítems por categoría, decodificación especulativa DFlash2 activada) sobre el pack de 5,41 bpw:

| Categoria | Resultado |
|---|---:|
| Overall | 88,89% (118/120 puntuados) |
| Knowledge | 83,3% |
| Math | 100,0% |
| Truthfulness | 80,0% |
| Instruction Following | 85,0% |
| Coding | 95,0% |
| Tool Use | 90,0% |

Calidad frente al release oficial en BF16 (55.535 tokens de turno de asistente evaluados):

| Pack | Huella residente | KLD media | KLD p50 | Top-1 | Top-5 | Solapamiento Top-5 |
|---|---:|---:|---:|---:|---:|---:|
| Este pack, 5,41 bpw | ~42,1 GiB | 0,0005 | 0,000004 | 99,34% | 99,998% | 95,63% |
| Release oficial BF16 | nativa | 0 | 0 | 100% | 100% | 100% |

Desglose por categoría frente a BF16:

| Categoria | KLD media | KLD p50 | Top-1 | Solapamiento Top-5 |
|---|---:|---:|---:|---:|
| general | 0,0003 | 0,000001 | 99,54% | 95,32% |
| prose_narrative | 0,0005 | 0,000020 | 99,39% | 96,68% |
| multilingual | 0,0011 | 0,000041 | 98,97% | 96,12% |
| reasoning | 0,0003 | 0,000001 | 99,57% | 95,58% |
| code | 0,0002 | 0,000002 | 99,70% | 96,09% |
| ifeval | 0,0001 | 0,000001 | 99,58% | 93,58% |
| gpqa_stem | 0,0013 | 0,000324 | 98,12% | 97,37% |
| swe_patch | 0,0002 | 0,000002 | 99,74% | 96,01% |
| math | 0,0003 | 0,000003 | 99,33% | 94,72% |
| cyber | 0,0004 | 0,000001 | 99,58% | 94,58% |
| mmlu_pro | 0,0002 | 0,000001 | 99,31% | 94,71% |

Suites de contexto largo frente a BF16:

| Suite | Contexto | Tokens evaluados | KLD media | KLD p50 | Top-1 | Top-5 | Solapamiento Top-5 |
|---|---:|---:|---:|---:|---:|---:|---:|
| wiki1100 | prefijo de 1.100 tokens | 890 | 0,001269 | 0,000467 | 98,54% | 100% | 97,64% |
| long17k | contexto de 17.408 tokens | 10.654 | 0,001272 | 0,000438 | 98,70% | 100% | 97,19% |

Rendimiento de servicio medido en una NVIDIA RTX PRO 6000 Blackwell de 96 GB (`sm_120`), `TP=1`, este pack más draft DFlash2 de 4,55 bpw, `--context-length 131072`, `--mem-fraction-static 0.82` y CUDA graphs activados:

| Metrica | 403 tok | 1564 tok | 3152 tok |
|---|---:|---:|---:|
| Prefill en frío (tok/s) | 1.096,5 – 1.118,6 | 1.672,6 – 1.674,7 | 1.796,3 – 1.802,2 |
| Decodificación greedy `t=0.0` (tok/s) | 64,8 | 44,9 | 49,3 |
| Decodificación con muestreo `t=0.6` (tok/s) | 53,1 | 41,2 | 51,3 |
| Longitud aceptada DFlash2 (tok/ronda) | 2,05 – 3,55 | 1,40 – 2,70 | 2,30 – 2,70 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 42,1 GiB de pesos residentes en GPU; el despliegue de referencia consume unos 83 GB de VRAM en total, incluyendo un pool KV híbrido `SWAKVPool` de 30,11 GB y 2,19 GB de pesos del draft.
- GPU recomendadas: el autor valida el despliegue en una NVIDIA RTX PRO 6000 Blackwell de 96 GB (`sm_120`) con `TP=1`. Para GPUs de 48 GB se apunta a un encaje sin el draft, dado que los pesos residentes son de unos 42,1 GiB.
- Cabe en GPU de consumo: no disponible como dato validado; por tamaño de pesos, una GPU de 48 GB es el mínimo razonable y las de 24 GB no admiten el pack completo.
- Opciones de despliegue: ExLlamaV3 (librería declarada) y SGLang 0.5.19 con el plugin sglang-exl3; la receta de servicio, los scripts de lanzamiento y los parámetros de ajuste están en el repositorio Ripple-65B-Preview-EXL3-SGLang-recipe.
- Latencia y throughput: prefill en frío de 1.096,5 a 1.802,2 tok/s según tamaño de prompt; decodificación greedy de 44,9 a 64,8 tok/s y con muestreo de 41,2 a 53,1 tok/s en la configuración medida. Con `--context-length 131072` el pool KV admite 117.376 tokens de atención completa o 93.888 de ventana deslizante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-SAGE-REXL3 5,41 bpw (este pack) | 22.611.689.552 | 131.072 tokens (config. de servicio) | EXL3 trellis 5,41 bpw | Apache 2.0 | Hugging Face, acceso gated |
| ricursiveAI/Ripple-65B-Preview (base) | no disponible | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Ripple-65B-Preview-DFlash2-SAGE-REXL3 (drafts) | no disponible | no disponible | EXL3 a 4,55 / 3,60 / 3,08 bpw | Apache 2.0 (heredada) | Hugging Face |

No se dispone de datos de benchmarks estándar ni de información sobre modelos de otros autores que permitan una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre comercial indica 65B, pero los safetensors declaran 22.611.689.552 parámetros; conviene verificar el recuento real antes de dimensionar infraestructura.
- Acceso restringido: el repositorio es gated y las solicitudes se revisan manualmente, lo que puede retrasar su uso en entornos de producción.
- Dependencia de ecosistema: el pack requiere ExLlamaV3 o SGLang 0.5.19 con el plugin sglang-exl3; no es un formato portable a otras pilas de inferencia sin conversión.
- Degradación de calidad por cuantización: aunque la concordancia Top-1 es del 99,34%, la KLD media sube a 0,0013 en gpqa_stem y a 0,001269 en wiki1100, y la concordancia Top-1 baja al 98,12% en gpqa_stem y al 98,54% en wiki1100.
- Riesgo de alucinación: la categoría Truthfulness de SixCat obtiene un 80,0%, el valor más bajo del conjunto evaluado; debe validarse la salida en dominios sensibles.
- Idiomas: no se publica la lista de idiomas soportados; la categoría multilingual muestra la mayor KLD media (0,0011) y el Top-1 más bajo (98,97%) entre las categorías generales.
- Evaluación limitada: SixCat emplea 20 ítems por categoría y 118 de 120 puntuados, por lo que la significación estadística de los porcentajes es reducida.
- Licencia: Apache 2.0 permite uso comercial, pero el autor solicita citar el modelo base; el acceso gated añade una condición práctica de aceptación.
- Datos de arquitectura y entrenamiento ausentes: no se dispone de información sobre dataset, número de tokens ni fases de alineación, lo que dificulta auditar sesgos conocidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vcruz305/Ripple-65B-Preview-SAGE-REXL3-5.41bpw
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Receta de servicio SGLang: https://github.com/vcruz305/Ripple-65B-Preview-EXL3-SGLang-recipe
- Plugin SGLang EXL3: https://github.com/vcruz305/sglang-exl3
- Drafts DFlash2 cuantizados: https://huggingface.co/vcruz305/Ripple-65B-Preview-DFlash2-SAGE-REXL3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Perfil del autor: https://huggingface.co/vcruz305
