# xrrand/Qwen-3.6-Flash-Next-mlx-serve-4bit-mtp

## Resumen

Este repositorio es una cuantizacion mixta en formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario xrrand y orientada especificamente al servidor mlx-serve para Apple Silicon (arquitectura `qwen4_exp`). No se trata de un modelo entrenado desde cero, sino de un artefacto de distribucion de pesos: una cuantizacion hibrida de 4 y 8 bits construida combinando tensores de dos cuantizaciones comunitarias previas (ddalcu en formato mixed-4-8 y Jundot en formato oQ4e) para conservar el diseno de ficheros que exige mlx-serve.

El problema que resuelve es de compatibilidad de motor: las cuantizaciones oQ4e populares de este modelo estan pensadas para oMLX e incrustan la tabla n-gram PLE dentro del checkpoint, mientras que mlx-serve la requiere como sidecar externo (`ngram_table.bin`, unos 30 GB). Este repositorio mantiene el layout de mlx-serve y sustituye los expertos enrutados por los bytes de la cuantizacion oQ4e, manteniendo la geometria 4-bit/g64 para que los kernels MoE fusionados sigan funcionando de forma nativa.

El modelo base es un MoE multimodal (pipeline `image-text-to-text`) de 133.195.562.899 parametros totales segun los safetensors del repositorio, con cabeza MTP (multi-token prediction) y un peso de repo de 107,6 GB. Es relevante para quienes despliegan Qwen en Mac con mlx-serve y necesitan un equilibrio entre calidad de tool calling y compatibilidad de motor, aunque el repositorio tiene 0 descargas y 0 likes, y no ha pasado verificacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal transformador con atencion, GDN, hyper-connections y cabeza MTP; implementacion `qwen4_exp` para MLX |
| Parametros totales | 133.195.562.899 (~133,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible de forma oficial; en las pruebas de decodificacion del autor se uso una ventana de 524K tokens |
| Tipos de cuantizacion | Mixta 4/8-bit MLX; expertos enrutados 4-bit/g64 (oQ4e), `embed_tokens` 8-bit/g64, resto de tensores (atencion, GDN, hyper-connections, expertos compartidos, cabeza MTP) en 8-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other`) |
| Formato de pesos | safetensors (MLX) + sidecar externo `ngram_table.bin` (~30 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un MoE multimodal de la familia Qwen (etiquetas `moe`, `mtp`, `qwen4_exp`, `qwen3.8`), con componentes de atencion, GDN, hyper-connections, expertos compartidos y enrutados, y una cabeza de prediccion multi-token (MTP). El repositorio no documenta el entrenamiento del modelo base: no hay informacion sobre numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se detallan los parametros activos por token.

Toda la innovacion de este artefacto es de cuantizacion y empaquetado, no de entrenamiento. La receta documentada es: layout base de `ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit` (geometria mixta 4/8-bit, sidecar `ngram_table.bin`, cabeza MTP); expertos enrutados (~60 GB) tomados literalmente de `Jundot/Qwen3.8-Flash-Next-oQ4e-mtp` con empaquetado 4-bit/g64 e imatrix; `embed_tokens` recuantizado desde el checkpoint BF16 original a 8-bit/g64 con escala afin min-max y escalas/sesgos en bf16; y conversion de convencion en los pesos tipo RMSNorm al criterio mlx-serve/ddalcu (`stored = raw + 1.0`). La motivacion tecnica es mantener la geometria 4-bit/g64 identica para que los kernels MoE fusionados se activen de forma nativa.

## Capacidades

- Generacion de texto y razonamiento multimodal: el pipeline declarado es `image-text-to-text`, por lo que acepta entradas de imagen y texto.
- Tool calling y function calling: puntuacion de 100% en las categorias Tool Selection (6/6) y Parameter Precision (6/6) de Tool-Eval-Bench v2.7.1.
- Razonamiento multi-paso y agentes: 100% en Multi-Step Chains (8/8) y 95% en Context & State (19/20).
- Recuperacion de errores: 100% en Error Recovery (6/6) y 100% en Restraint & Refusal (6/6).
- Razonamiento estructurado: 100% en Structured Reasoning (6/6) y 100% en Code Patterns (6/6).
- Localizacion: 100% en la categoria Localization (6/6) del benchmark del autor.
- Modo thinking: el benchmark se ejecuto con "thinking on", por lo que existe un modo de razonamiento explicito.
- Prediccion multi-token (MTP): cabeza MTP con profundidad 6 en las pruebas de decodificacion, junto con decodificacion especulativa PLD.
- Multilingue: no disponible; el repositorio no declara idiomas soportados.

## Casos de uso

- Agentes de tool calling en local: el modelo alcanza 100% en seleccion de herramienta y precision de parametros sobre 92 escenarios, por lo que es adecuado para orquestadores que deban elegir y rellenar llamadas a APIs sin salir de una maquina Apple Silicon.
- Asistentes con contexto muy largo en Mac: el autor valida la decodificacion con una ventana de 524K tokens, lo que permite procesar bases de codigo o documentacion extensa en una sola sesion sin trocear el contexto.
- Automatizacion de tareas multi-paso: la puntuacion de 100% en cadenas multi-paso (8/8) lo hace util para pipelines de agentes que encadenan varias herramientas antes de dar una respuesta.
- Revision de codigo y generacion de parches: 100% en Code Patterns (6/6) y soporte de tool calling permiten integrarlo en flujos que consultan repositorios y generan cambios.
- Atencion al cliente con contexto persistente: 95% en Context & State (19/20) y 100% en Restraint & Refusal (6/6) indican buen manejo de estado conversacional y de negativas controladas.
- Analisis de documentos con imagenes: al ser `image-text-to-text`, puede extraer y razonar sobre capturas, diagramas o paginas escaneadas junto con texto.
- Traduccion y adaptacion regional: la categoria Localization obtiene 100% (6/6), lo que respalda tareas de adaptacion linguistica y formato regional, aunque no se declaren idiomas oficiales.
- Entornos de privacidad estricta: al ejecutarse integramente en local con mlx-serve, evita enviar datos a APIs externas, util en sectores regulados.

## Benchmarks y rendimiento

Unicos datos publicados, procedentes de la model card del autor (Tool-Eval-Bench v2.7.1, 92 escenarios, temperatura 0, paralelismo 1, thinking activado):

| Modelo | Motor | Puntuacion | Hard Mode | Notas |
|---|---|---|---|---|
| Jundot oQ4e | oMLX | 92–93 | no disponible | No carga en mlx-serve |
| Este repositorio | mlx-serve | 90 | 36/46 (78%) | Subida objeto de esta ficha |
| ddalcu mixed-4-8 | mlx-serve | 85–90 (tipico 88–89) | no disponible | Base de este hibrido |

Desglose por categoria del repositorio (mismo benchmark):

| Categoria | Puntuacion | Aciertos |
|---|---|---|
| Tool Selection | 100% | 6/6 |
| Parameter Precision | 100% | 6/6 |
| Multi-Step Chains | 100% | 8/8 |
| Restraint & Refusal | 100% | 6/6 |
| Error Recovery | 100% | 6/6 |
| Localization | 100% | 6/6 |
| Structured Reasoning | 100% | 6/6 |
| Code Patterns | 100% | 6/6 |
| Context & State | 95% | 19/20 |
| Instruction Following | 80% | 8/10 |
| Safety & Boundaries | 88% | parcial (dato truncado en la fuente) |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: el repositorio ocupa 107,6 GB, por lo que requiere un Mac con al menos 128 GB de memoria unificada (el autor reporta pruebas en un M5 Max).
- Sidecar obligatorio: el motor mlx-serve necesita `ngram_table.bin` como fichero externo de unos 30 GB, que debe estar accesible junto al checkpoint.
- GPU compatibles: exclusivamente Apple Silicon con MLX; no hay soporte para CUDA (A100, H100, RTX 4090) en este repositorio.
- GPU de consumo: no aplica en el sentido habitual; el modelo no cabe en GPUs de consumo con 24 GB de VRAM. Cabe en Macs de gama alta con 128 GB o mas de memoria unificada.
- Opciones de despliegue: mlx-serve con arquitectura `qwen4_exp`. El autor indica que las cuantizaciones oQ4e no cargan en este motor y que este repositorio no esta pensado para oMLX. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 95–118 tok/s en decodificacion sobre M5 Max, con contexto de 524K, MTP depth 6 y decodificacion especulativa PLD. El autor afirma paridad o mejora frente a la cuantizacion base con los mismos flags.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion Tool-Eval-Bench | Motor | Licencia |
|---|---|---|---|---|---|
| Este repositorio (xrrand) | ~133,2 B | 524K en pruebas (no oficial) | 90 | mlx-serve | qwen-community-1.0 |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | no disponible | 92–93 | oMLX | no disponible |
| ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit | no disponible | no disponible | 85–90 (tipico 88–89) | mlx-serve | no disponible |
| Qwen/Qwen3.8-Flash-Next (base BF16) | no disponible | no disponible | no disponible | no disponible | qwen-community-1.0 |

Comparativa con modelos de la misma categoria fuera del ecosistema MLX: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de cuantizacion, no un modelo verificado: mezcla tensores de dos repositorios comunitarios distintos y no ha sido evaluado de forma independiente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion.
- Discrepancia de nomenclatura: el ID del repositorio menciona "Qwen-3.6-Flash-Next" mientras que el modelo base declarado es "Qwen/Qwen3.8-Flash-Next". Conviene verificar que se esta usando la generacion correcta.
- Perdida por cuantizacion: la cuantizacion mixta 4/8-bit degrada la calidad frente al checkpoint BF16 original, aunque la model card afirma paridad con la base cuantizada.
- Compatibilidad de motor muy restringida: disenado para mlx-serve y `qwen4_exp`; no carga en oMLX y no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Dependencia de un sidecar de ~30 GB (`ngram_table.bin`) que debe gestionarse aparte del checkpoint.
- Licencia: `qwen-community-1.0` bajo la etiqueta `license: other`. Es necesario revisar los terminos de la licencia comunitaria de Qwen antes de cualquier uso comercial; el repositorio no aclara las obligaciones de atribucion ni las restricciones de redistribucion.
- Idiomas no declarados: no hay lista oficial de idiomas soportados, por lo que el rendimiento multilingue no esta garantizado.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de factualidad; la categoria Safety & Boundaries obtiene 88% en el benchmark del autor, lo que implica fallos en el 12% restante.
- Sesgos: no hay analisis de sesgos en la informacion disponible.
- Datos de benchmark autodeclarados: las cifras de rendimiento provienen exclusivamente de la model card del autor, sin reproducibilidad externa.
- Trazabilidad parcial: parte del desglose por categorias aparece truncado en la fuente consultada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xrrand/Qwen-3.6-Flash-Next-mlx-serve-4bit-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizacion base (layout): https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-mixed-4-8bit
- Fuente de expertos enrutados: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- mlx-serve (enlace citado en la model card): https://github.com/azampatti/Qwen3.8-Flash-Next-Int4-FAST
- Qwen3.6 Flash, ficha de modelo: https://www.qwencloud.com/models/qwen3.6-flash
- Qwen3.6 Flash, MindStudio: https://www.mindstudio.ai/models/qwen-3-6-flash
- Qwen3.6 Flash, Benchable: https://benchable.ai/models/qwen/qwen3.6-flash
- Guia de Qwen 3.6 Flash: https://www.aimadetools.com/blog/qwen-3-6-flash-complete-guide/
- Ollama, familia Qwen3.6: https://ollama.com/library/qwen3.6

Nota: los cinco ultimos enlaces corresponden a Qwen 3.6 Flash, una generacion distinta del modelo base declarado (Qwen 3.8 Flash Next), por lo que sus especificaciones (contexto de 1M tokens, precios, soporte de video) no deben extrapolarse directamente a este repositorio.
