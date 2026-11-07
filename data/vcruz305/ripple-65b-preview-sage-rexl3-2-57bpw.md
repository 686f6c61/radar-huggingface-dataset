# vcruz305/Ripple-65B-Preview-SAGE-REXL3-2.57bpw

## Resumen

Ripple-65B-Preview-SAGE-REXL3-2.57bpw es un empaquetado cuantizado del modelo denso Ripple-65B-Preview de Ricursive Intelligence, publicado por el usuario vcruz305 en Hugging Face. Se distribuye en formato EXL3/REXL3 (trellis) para su carga con ExLlamaV3 y emplea SAGE, un metodo de cuantizacion de precision mixta desarrollado por el propio autor que asigna distintos valores de `K` a cada tensor. El pack ocupa 22,3 GB en disco y unos 20,8 GiB residentes en GPU, y esta pensado exclusivamente para generacion de texto.

El modelo base es un transformer denso de 65B parametros con 80 capas, hidden size 5120, atencion GQA con 80 cabezas de consulta y 8 de clave/valor, atencion con compuertas, conexiones residuales de valor y un patron hibrido de atencion deslizante (ventana de 1024) combinado con atencion completa cada quinta capa, con hasta 2.097.152 posiciones maximas. Esta ficha describe el pack cuantizado, no el modelo original: los pesos reales del repositorio suman 11.170.414.672 parametros segun los safetensors, un dato que no coincide con la denominacion "65B" del modelo base y que conviene verificar antes de cualquier despliegue.

La relevancia de este pack esta en su relacion calidad/espacio: segun la model card, conserva un 96,49% de acuerdo Top-1 y una divergencia KL media de 0,0155 frente a la release oficial en BF16 del modelo base, con un footprint inferior a 21 GiB. Eso permite servir un modelo de gran tamano en una unica GPU de 24 GB, algo que la version BF16 no permite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (model_type `ricursive`), 80 capas, hidden size 5120, GQA 80Q/8KV, atencion con compuertas, residuales de valor, patron hibrido sliding-window 1024 / atencion completa cada 5 capas |
| Parametros totales | 11.170.414.672 segun safetensors del pack; el modelo base se denomina 65B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2.097.152 posiciones maximas en el modelo base (segun model card del pack) |
| Tipos de cuantizacion | EXL3/REXL3 trellis con precision mixta SAGE (K variable por tensor), perfil 2,57 bpw |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors EXL3/REXL3, 10 shards (`model-00001-of-00010.safetensors` a `model-00010-of-00010.safetensors`) con `model.safetensors.index.json`, `quant_method: exl3` |

## Arquitectura y entrenamiento

El pack hereda la arquitectura del modelo base de Ricursive Intelligence: un transformer denso autorregresivo de 80 capas con hidden size 5120, atencion de consultas agrupadas (80 cabezas de consulta frente a 8 de clave/valor), atencion con compuertas y conexiones residuales de valor. El patron de atencion es hibrido: ventana deslizante de 1024 tokens en la mayoria de capas y atencion completa cada quinta capa, lo que reduce el coste de atencion en contextos largos manteniendo acceso global periodico. La longitud maxima declarada es de 2.097.152 posiciones.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo etapas de RLHF o DPO; esos datos corresponden al modelo base y no se detallan en la informacion proporcionada. La innovacion tecnica de este repositorio es la cuantizacion: SAGE es un metodo de precision mixta para EXL3 en el que cada tensor trellis lleva su propio valor de `K` autocontenido y los kernels lo leen en tiempo de carga. El metodo no esta publicado. El pack es solo de texto y no incluye cabezas multimodales.

## Capacidades

- Generacion de texto conversacional y continuacion de prosa narrativa, con calidad cercana a la release BF16 segun las metricas de acuerdo del autor.
- Razonamiento y resolucion de problemas tipo STEM: la categoria `reasoning` alcanza 98,15% de Top-1 y `gpqa_stem` un 89,84%, el valor mas bajo del desglose.
- Generacion de codigo y parches: 98,64% de Top-1 en `code` y 98,44% en `swe_patch` frente al BF16.
- Matematicas: 96,83% de Top-1 en la categoria `math`.
- Seguimiento de instrucciones: 98,46% de Top-1 en `ifeval`.
- Capacidad multilingue: la categoria `multilingual` obtiene 94,03% de Top-1 y la mayor divergencia KL del desglose general (0,0436), lo que sugiere mayor degradacion en idiomas distintos del ingles.
- Contexto largo: en la suite `long17k` con 17.408 tokens de prefijo mantiene 91,45% de Top-1 y 99,83% de Top-5.
- No se documenta soporte explicito de tool calling, function calling, modo thinking, vision ni audio en la informacion disponible.

## Casos de uso

- Servicio de chat en una unica GPU de 24 GB: con unos 20,8 GiB residentes, el pack cabe en tarjetas como la RTX 4090 o la L40S y permite desplegar un modelo de 80 capas sin repartir pesos entre dispositivos.
- Generacion de codigo en pipelines de CI/CD: el 98,64% de Top-1 en la categoria `code` y el 98,44% en `swe_patch` frente al BF16 lo hacen adecuado para sugerencia de parches y autocompletado donde se prioriza fidelidad al modelo original.
- Razonamiento sobre documentos largos: la ventana de 2.097.152 posiciones del modelo base y el 91,45% de Top-1 en la suite de 17k tokens permiten analisis de expedientes, contratos o bases de codigo extensas en una sola pasada.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicar el desglose de KL y acuerdo por categoria, el pack sirve como referencia reproducible para estudiar el impacto de la precision mixta en tareas concretas.
- Despliegue con decodificacion especulativa: el autor proporciona un draft DFlash2 cuantizado y una receta de SGLang que permite servir el modelo con aceleracion especulativa en produccion.
- Asistencia a investigacion STEM: con 89,84% de Top-1 en `gpqa_stem`, puede emplearse en tareas de razonamiento cientifico donde se tolere cierta degradacion frente al BF16.
- Procesamiento por lotes en entornos con presupuesto de VRAM ajustado: el ahorro de mas de 40 GiB respecto al BF16 permite aumentar el tamano de lote o mantener varias instancias en un mismo nodo.

## Benchmarks y rendimiento

Los datos disponibles son metricas de fidelidad frente a la release oficial en BF16 del modelo base, no resultados en benchmarks academicos.

| Categoria | KL media | KL p50 | Top-1 | Top-5 | Top-5 overlap |
|---|---|---|---|---|---|
| General (agregado) | 0,0155 | 0,000068 | 96,49% | 99,88% | 85,32% |
| general | 0,0078 | 0,000014 | 97,62% | no disponible | 85,25% |
| prose_narrative | 0,0182 | 0,000441 | 95,64% | no disponible | 86,72% |
| multilingual | 0,0436 | 0,001424 | 94,03% | no disponible | 83,26% |
| reasoning | 0,0072 | 0,000015 | 98,15% | no disponible | 86,50% |
| code | 0,0068 | 0,000048 | 98,64% | no disponible | 87,26% |
| ifeval | 0,0025 | 0,000014 | 98,46% | no disponible | 82,17% |
| gpqa_stem | 0,0394 | 0,009184 | 89,84% | no disponible | 88,39% |
| swe_patch | 0,0059 | 0,000030 | 98,44% | no disponible | 86,82% |
| math | 0,0065 | 0,000053 | 96,83% | no disponible | 83,26% |
| cyber | 0,0089 | 0,000017 | 98,22% | no disponible | 84,43% |
| mmlu_pro | 0,0053 | 0,000017 | 97,15% | no disponible | 82,69% |

| Suite | Contexto | Tokens evaluados | KL media | KL p50 | Top-1 | Top-5 | Top-5 overlap |
|---|---|---|---|---|---|---|---|
| wiki1100 | prefijo de 1.100 tokens | 890 | 0,0674 | 0,020488 | 89,66% | 99,55% | 86,72% |
| long17k | contexto de 17.408 tokens | 10.654 | 0,0412 | 0,014641 | 91,45% | 99,83% | 87,86% |

La evaluacion se realizo con teacher forcing sobre tokens de turno de asistente, con 55.535 tokens puntuados en el conjunto retenido. No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20,8 GiB de pesos residentes en GPU, mas overhead de contexto y cache KV segun la longitud de secuencia.
- Cabe en GPUs de consumo de 24 GB, como la RTX 4090 o la RTX 3090, siempre que se reserve margen para el contexto; con contextos muy largos puede requerir offload o GPUs de mayor capacidad.
- GPUs profesionales recomendadas: L40S (48 GB), A6000 (48 GB), A100 (40/80 GB) y H100 (80 GB) para servir con lotes mayores o contextos extensos.
- Despliegue principal: ExLlamaV3, cargando directamente el repositorio con `Config.from_directory`, `Model.from_config` y `Tokenizer.from_config`.
- Despliegue en servidor: SGLang 0.5.19 con el plugin `vcruz305/sglang-exl3` y la receta `vcruz305/Ripple-65B-Preview-EXL3-SGLang-recipe`, junto con el draft cuantizado DFlash2 para decodificacion especulativa.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este pack (Ripple-65B-Preview-SAGE-REXL3-2.57bpw) | 11.170.414.672 (safetensors) | 2.097.152 posiciones en el base | EXL3/REXL3, 2,57 bpw, ~20,8 GiB | Apache 2.0 | Requiere acceso aprobado (gated); 6 descargas |
| vcruz305/Ripple-65B-Preview-SAGE-REXL3-5.41bpw | 23B segun la pagina del pack | no disponible | EXL3/REXL3, 5,41 bpw | Apache 2.0 | Misma base, mayor precision y mayor footprint |
| ricursiveAI/Ripple-65B-Preview | 65B (denominacion del modelo) | 2.097.152 posiciones | BF16 | Apache 2.0 | Release oficial de referencia, sin cuantizar |
| vcruz305/Ripple-65B-Preview-DFlash2-SAGE-REXL3 | no disponible | no disponible | EXL3, 4,55 bpw | Apache 2.0 | Draft para decodificacion especulativa, no un modelo alternativo |

No se dispone de datos de rendimiento en benchmarks academicos para comparar con modelos de otras familias; la comparacion se limita a variantes del mismo modelo base.

## Limitaciones y advertencias

- El repositorio esta marcado como `gated`: requiere solicitud de acceso con revision manual y aceptacion de los terminos de la licencia Apache 2.0.
- La cuantizacion introduce degradacion medible: 96,49% de Top-1 global frente al BF16, con las mayores perdidas en `gpqa_stem` (89,84%), `multilingual` (94,03%) y la suite `wiki1100` (89,66%). En tareas sensibles a la precision exacta conviene usar la release BF16.
- El pack es solo de texto; no incluye capacidades multimodales aunque el modelo base pudiera tenerlas.
- Existe una discrepancia entre la denominacion "65B" del modelo base y los 11.170.414.672 parametros registrados en los safetensors del pack; conviene verificar la configuracion antes de dimensionar el despliegue.
- El metodo SAGE no esta publicado, lo que dificulta auditar la cuantizacion o reproducirla con otras herramientas.
- La licencia Apache 2.0 permite uso comercial, pero el autor pide citar a Ricursive por el modelo base.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en la informacion disponible; se aplican los riesgos habituales de un modelo de lenguaje de gran tamano sin datos de alineacion publicados.
- Idiomas soportados no declarados; la categoria multilingue muestra la mayor divergencia KL, por lo que el uso en idiomas distintos del ingles debe validarse empiricamente.
- El ecosistema de carga es limitado: requiere ExLlamaV3 o el plugin EXL3 para SGLang, lo que reduce la portabilidad frente a formatos GGUF o safetensors estandar.

## Enlaces

- Repositorio del pack: https://huggingface.co/vcruz305/Ripple-65B-Preview-SAGE-REXL3-2.57bpw
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Pack de mayor precision (5,41 bpw): https://huggingface.co/vcruz305/Ripple-65B-Preview-SAGE-REXL3-5.41bpw
- Draft DFlash2 cuantizado: https://huggingface.co/vcruz305/Ripple-65B-Preview-DFlash2-SAGE-REXL3
- Receta de servicio con SGLang: https://github.com/vcruz305/Ripple-65B-Preview-EXL3-SGLang-recipe
- Plugin EXL3 para SGLang: https://github.com/vcruz305/sglang-exl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
