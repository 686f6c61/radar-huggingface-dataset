# stealth-model/GLM-5.3-Flash-GGUF

## Resumen

GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5 de Z.ai. Con 320.759.404.382 parámetros totales y 18B parámetros activos (arquitectura MoE), está disenado para flujos de trabajo de agentes para desarrolladores, codificación visual y tareas complejas de uso de herramientas. La ficha que nos ocupa es la cuantización GGUF publicada por Stealth Models, que distribuye el modelo en dos tamanos principales para su uso con llama.cpp.

Stealth Models realizó el seguimiento de este modelo bajo el nombre en clave "Ox Alpha" antes de que Z.ai lo revelara como GLM-5.3-Flash. El repositorio incluye pesos cuantizados en formato GGUF junto con proyectores multimodales (mmproj) para entrada de imagen, lo que permite ejecutar un modelo de 320B parámetros en hardware de consumo y estaciones de trabajo con memoria unificada.

La relevancia de esta ficha radica en que ofrece una via practica para desplegar localmente un modelo multimodal de gran escala con licencia MIT, algo poco habitual en modelos de este tamano. Las cuantizaciones disponibles van desde 102 GB (IQ2_XXS) hasta 240 GB (Q5_K_XL), lo que condiciona fuertemente los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer multimodal nativo |
| Parametros totales | 320.759.404.382 (320,7B) |
| Parametros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (102 GB), Q5_K_XL (240 GB); proyectores mmproj en F16 (1,1 GB), Q8_0 (0,62 GB), Q6_K (0,49 GB), Q4_K (0,34 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp), con mmproj para vision |

## Arquitectura y entrenamiento

GLM-5.3-Flash emplea una arquitectura Mixture of Experts (MoE) con 320,7B parámetros totales y solo 18B activos por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. Es el primer modelo de la serie GLM-5 con multimodalidad nativa, lo que implica que la capacidad de procesar imagenes está integrada en el entrenamiento y no anadida a posteriori mediante adaptadores. El repositorio GGUF incluye proyectores multimodales (mmproj) en varias precisiones para habilitar la entrada de imagen en llama.cpp.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La model card del repositorio de cuantizacion no incluye estos datos, y las referencias web consultadas solo confirman la arquitectura MoE y el caracter multimodal nativo. La cuantizacion utiliza imatrix (segun los tags del repositorio), lo que sugiere un proceso de calibracion basado en importancia de pesos para preservar calidad en las cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno.
- Procesamiento de imagen (vision) gracias a los proyectores mmproj incluidos.
- Codificacion visual y tareas de developer agent workflows, segun la documentacion de Z.ai.
- Uso complejo de herramientas (tool use / function calling) orientado a agentes.
- Razonamiento multi-paso para tareas de agente.
- Capacidades multilingues: no disponibles en detalle.
- Modo de pensamiento (thinking mode): no confirmado en la informacion disponible.

## Casos de uso

- Agentes de codificacion en local: el modelo puede integrarse en entornos de desarrollo para generar, revisar y refactorizar codigo, aprovechando su soporte de tool calling y su orientacion a developer agent workflows. La cuantizacion IQ2_XXS permite ejecutarlo en estaciones con 128 GB de memoria unificada.
- Codificacion visual: al ser multimodal nativo, puede analizar capturas de pantalla, diagramas o interfaces de usuario y generar codigo a partir de ellos, un caso de uso explicitamente mencionado en la documentacion de Z.ai.
- Automatizacion de tareas de agente multi-paso: con 18B parámetros activos y soporte de herramientas, es adecuado para pipelines donde el modelo debe decidir que herramienta invocar en cada paso.
- Procesamiento de documentos con imagenes: la entrada de imagen via mmproj permite extraer informacion de graficos, tablas escaneadas o formularios en flujos de trabajo locales sin enviar datos a la nube.
- Despliegue en hardware de memoria unificada: la cuantizacion IQ2_XXS (102 GB) esta pensada para Mac de 128 GB, DGX Spark o Strix Halo, lo que habilita inferencia de un modelo de 320B en equipos de sobremesa.
- Experimentacion e investigacion: la licencia MIT y el formato GGUF facilitan el estudio del comportamiento de un MoE multimodal de gran escala sin restricciones de uso comercial.
- Servicio de inferencia con llama.cpp: mediante `llama-server` se puede exponer una API compatible con endpoints para integrar el modelo en aplicaciones existentes.

## Benchmarks y rendimiento

Los resultados disponibles provienen de StealthMark 1.8.10, el benchmark propio de Stealth Models, no de benchmarks academicos estandar:

| Benchmark (StealthMark 1.8.10) | Resultado |
|---|---|
| Puntuacion global | 48,1 |
| General Intelligence | 41,7 |
| Visual Intelligence | 59,4 |
| Beach | 77,7 |
| Selfie | 76,6 |
| Ground Truth | 63,8 |
| Raccoon | 55,1 |
| Mona Lisa | 49,5 |
| Foresight | 47,0 |
| Newton's Mirror | 27,6 |
| Latch | 3,6 (ejecucion parcial, 4 de 5 niveles) |

No se han publicado resultados de benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: IQ2_XXS requiere 102 GB en 4 partes; Q5_K_XL requiere 240 GB en 6 partes.
- Equipos objetivo segun el autor: IQ2_XXS para maquinas de 128 GB (Mac de 128 GB, DGX Spark, Strix Halo) o una GPU de 32 GB con 96 GB de RAM del sistema; Q5_K_XL para maquinas con 256 GB o mas de memoria combinada.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB o menos; requiere configuraciones de memoria unificada o multi-GPU con offload de expertos a RAM.
- Opcion de offload: `--n-cpu-moe` permite mantener las capas de expertos en RAM del sistema cuando el modelo excede la VRAM de la GPU.
- Despliegue: llama.cpp (`llama-server`) con soporte de `--jinja` y `--mmproj` para vision. El repositorio tambien es compatible con endpoints.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato local |
|---|---|---|---|---|---|
| GLM-5.3-Flash (esta ficha) | 320,7B | 18B | no disponible | MIT | GGUF (IQ2_XXS, Q5_K_XL) |
| Qwen3.8-27B | 27B (denso, segun denominacion) | no disponible | no disponible | no disponible | no disponible |
| GLM-5.3-Flash (original Z.ai) | 320B | 18B | no disponible | MIT | safetensors (repo original) |
| GLM-5.3-Flash GGUF (unsloth) | 320B | 18B | no disponible | MIT | GGUF (cuantizaciones alternativas) |

Stealth Models compara su resultado con Qwen3.8-27B, al que describe como el mejor modelo local en sus pruebas, pero no se proporcionan los numeros de esa comparacion en la informacion disponible. Existen cuantizaciones alternativas del mismo modelo base publicadas por unsloth y ggml-org, con las que esta ficha comparte arquitectura y licencia pero difiere en el conjunto de cuantizaciones ofrecido.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones especificas de fidelidad para este modelo.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan documentados en la informacion disponible.
- Requisitos de hardware muy elevados: incluso la cuantizacion mas pequena recomendada (IQ2_XXS, 102 GB) excede la VRAM de cualquier GPU de consumo individual.
- La cuantizacion IQ2_XXS es agresiva (2 bits por peso aproximadamente) y puede degradar la calidad respecto al modelo original; el autor la presenta como el minimo recomendado.
- El benchmark StealthMark es propietario de Stealth Models y no es directamente comparable con evaluaciones academicas estandar.
- El resultado en Latch (3,6) proviene de una ejecucion parcial (4 de 5 niveles) y no debe interpretarse como una puntuacion completa.
- Licencia MIT: permite uso comercial, pero debe conservarse el archivo de licencia incluido en el repositorio.
- El modelo base es de Z.ai; esta ficha cubre unicamente la cuantizacion GGUF de Stealth Models, no el modelo original.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/stealth-model/GLM-5.3-Flash-GGUF
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizacion alternativa de unsloth: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Cuantizacion de ggml-org: https://huggingface.co/ggml-org/GLM-5.3-Flash-GGUF
- Documentacion de Z.ai GLM-5.3-Flash en Mistral: https://docs.mistral.ai/models/zai-glm-5-3-flash
- Articulo sobre requisitos de memoria: https://localmodelwatch.tsuchitsuchi.com/en/2026/10/04/glm-5-3-flash-gguf-released/
- Pagina de openlm.ai sobre GLM-5.3: https://openlm.ai/glm-5.3/
- Ficha de Ox Alpha: https://huggingface.co/stealth-model/ox-alpha
- Leaderboard StealthMark: https://huggingface.co/spaces/stealth-model/stealthmark
- Comparativa con Qwen3.8-27B: https://stealthmodels.com/compare/glm-5.3-flash-vs-qwen3.8-27b
- Sitio de Stealth Models: https://stealthmodels.com/
