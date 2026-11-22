# unsloth/Inkling-2-Small-GGUF

## Resumen

Inkling-2-Small es un modelo multimodal de propósito general desarrollado por Thinking Machines que acepta entradas de texto e imagen y genera salidas de texto. Se trata de un modelo con arquitectura Mixture of Experts (MoE) y aproximadamente 593.700 millones de parámetros totales, según los datos de safetensors del repositorio. La versión aquí documentada es la cuantización GGUF publicada por Unsloth, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp.

El modelo base (thinkingmachines/Inkling-2-Small) se distribuye bajo licencia Apache 2.0 y está orientado a uso conversacional y tareas de razonamiento multimodal. Incluye un modo de razonamiento configurable mediante el parámetro `reasoning_effort`, con niveles que van de `none` a `max`, lo que permite ajustar el coste computacional en función de la tarea.

La relevancia de esta ficha radica en que Unsloth ofrece cuantizaciones dinámicas (Unsloth Dynamic 3.0) calibradas con imatrix que reducen el modelo desde 484,4 GB (UD-Q8_K_XL) hasta 171,7 GB (UD-IQ1_S), manteniendo una fidelidad medible en términos de KLD y coincidencia de token top-1 respecto a la referencia. Esto hace viable el despliegue local de un modelo de casi 600.000 millones de parámetros en configuraciones de VRAM alta o mediante offloading a CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts); nueva arquitectura `inkling2` en llama.cpp |
| Parametros totales | 593.722.979.328 (~593,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 32768`) |
| Tipos de cuantizacion | UD-IQ1_S, UD-IQ1_M, UD-IQ2_XXS, UD-Q2_K_XL, UD-IQ3_XXS, UD-Q3_K_XL, UD-Q4_K_XL, Q8_0, UD-Q8_K_XL; proyector visual en mmproj-BF16/F16/F32 |
| Idiomas soportados | ingles y otros idiomas (sin listado detallado); no disponible la lista completa |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); modelo base en NVFP4 y MXFP8 |

## Arquitectura y entrenamiento

Inkling-2-Small emplea una arquitectura Mixture of Experts (MoE) identificada en llama.cpp como `inkling2`, distinta de la arquitectura del "Inkling" original. El modelo base se publica en formato NVFP4 (y una variante MXFP8), y las cuantizaciones de Unsloth preservan los expertos originales en NVFP4 con sus escalas por experto en los cuantos de mayor precision (UD-Q3_K_XL, UD-Q4_K_XL, Q8_0 y UD-Q8_K_XL), mientras que el resto de pesos se convierten a BF16 o a 8 bits segun el caso. Las cuantizaciones UD-* estan calibradas con imatrix (`imatrix_unsloth.gguf_file`) y siguen el esquema Unsloth Dynamic 3.0.

El modelo es multimodal: incorpora un proyector visual independiente (`mmproj`) que se pasa a llama.cpp mediante `--mmproj` para habilitar entradas de imagen. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. La innovacion tecnica mas destacable documentada es el modo de razonamiento configurable (`reasoning_effort` con valores `none`, `minimal`, `low`, `medium`, `high`, `xhigh` y `max`), que permite controlar la profundidad del razonamiento en tiempo de inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes (image-text-to-text) mediante el proyector visual mmproj.
- Razonamiento configurable con niveles de esfuerzo (`reasoning_effort`): `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh` y `max`.
- Soporte multilingue: la model card indica uso previsto en ingles y otros idiomas, sin listado completo.
- Compatibilidad con endpoints (`endpoints_compatible` segun los tags del repositorio).
- Plantilla de chat embebida en cada GGUF, invocable con `--jinja`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente en la informacion proporcionada.

## Casos de uso

- Asistente conversacional multimodal local: el modelo puede mantener conversaciones multi-turno con entradas de imagen y texto usando llama-server, lo que permite desplegar un asistente privado sin enviar datos a la nube.
- Analisis de documentos con imagenes: gracias al proyector visual, se pueden enviar capturas, diagramas o paginas escaneadas junto con instrucciones de texto para extraer informacion estructurada.
- Razonamiento con coste ajustable: el parametro `reasoning_effort` permite usar `low` o `minimal` en tareas simples (clasificacion, respuestas cortas) y `high` o `max` en problemas complejos, optimizando latencia y consumo.
- Investigacion sobre cuantizacion: las metricas KLD y de coincidencia top-1 publicadas por Unsloth permiten estudiar el impacto de la cuantizacion en un MoE de gran tamano, comparando UD-IQ1_S (171,7 GB) con UD-Q8_K_XL (484,4 GB).
- Despliegue en entornos con VRAM limitada: las variantes UD-IQ1_S y UD-IQ2_XXS (171,7 y 190,6 GB) permiten ejecutar el modelo con offloading parcial a CPU mediante `-ngl` reducido, algo impracticable con los pesos originales.
- Evaluacion comparativa de modelos multimodales: al estar disponible en GGUF y con licencia Apache 2.0, puede integrarse en pipelines de evaluacion con llama.cpp sin restricciones de uso comercial.
- Prototipado de aplicaciones de vision-lenguaje: el par mmproj + GGUF simplifica la puesta en marcha de demos con `llama-server` en `http://localhost:8080`.

## Benchmarks y rendimiento

La model card de Unsloth publica metricas de fidelidad de cuantizacion (KLD y coincidencia de token top-1) medidas sobre 64 x 4096 tokens de wikitext-2, tomando UD-Q8_K_XL como referencia:

| Cuantizacion | Tamano (GB) | KLD medio vs UD-Q8_K_XL | KLD 99% | Mismo token top-1 |
|---|---|---|---|---|
| UD-IQ1_S | 171,7 | 0,0922 | 1,143 | 89,7% |
| UD-IQ1_M | 178,5 | 0,0829 | 1,041 | 90,2% |
| UD-IQ2_XXS | 190,6 | 0,0577 | 0,730 | 91,8% |
| UD-Q2_K_XL | 205,0 | 0,0450 | 0,559 | 92,7% |
| UD-IQ3_XXS | 226,0 | 0,0364 | 0,430 | 93,3% |
| UD-Q3_K_XL | 285,1 | 0,0176 | 0,209 | 95,3% |
| UD-Q4_K_XL | 354,2 | 0,0029 | 0,031 | 98,0% |
| Q8_0 | 386,5 | 0,0027 | 0,029 | 98,1% |
| UD-Q8_K_XL | 484,4 | referencia | - | - |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. La variante mas pequena (UD-IQ1_S) ocupa 171,7 GB y la mayor (UD-Q8_K_XL) 484,4 GB. A esto hay que sumar el proyector visual (mmproj-F16.gguf) y la cache KV.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el volumen de pesos, se requiere agregar VRAM de varias GPU de datacenter (A100, H100, etc.) o bien offloading a CPU.
- Cabe en GPU de consumo: no. Incluso la cuantizacion mas agresiva (171,7 GB) supera la VRAM de cualquier GPU de consumo individual; solo es viable con offloading parcial a CPU (`-ngl` reducido) o con multiples GPU.
- Opciones de despliegue: llama.cpp (build `master` con soporte de `inkling2`, PR ggml-org/llama.cpp#32217; y PR ggml-org/llama.cpp#32657 para las variantes que conservan los expertos NVFP4 con escalas por experto), Unsloth Desktop, y llama-server con `--jinja` y `--mmproj`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento de tareas ni especificaciones de modelos comparables de la misma categoria (MoE multimodal de ~600.000 millones de parametros).

## Limitaciones y advertencias

- Requiere una build de llama.cpp con soporte de la arquitectura `inkling2`; las builds que solo soportan el Inkling original no cargan el modelo.
- Las cuantizaciones UD-Q3_K_XL, UD-Q4_K_XL, Q8_0 y UD-Q8_K_XL necesitan soporte de escalas por experto (PR ggml-org/llama.cpp#32657); sin el, llama.cpp falla con `wrong number of tensors`.
- Las builds anteriores al PR #32217 (layout ggml-org/llama.cpp#32187) requieren usar la rama `ggml-org-32187-layout` con `--revision`.
- El modelo es muy grande: incluso la cuantizacion mas pequena (171,7 GB) excede la VRAM de GPU de consumo, lo que obliga a offloading o a multiples GPU.
- Riesgo de alucinacion: no documentado en la informacion proporcionada, pero inherente a los modelos generativos.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto o idioma: la longitud de contexto no esta especificada en la informacion; el listado completo de idiomas no esta disponible.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base remite a una politica de uso aceptable (Acceptable Use Policy) de Thinking Machines que conviene revisar.
- La cuantizacion introduce degradacion medible: UD-IQ1_S presenta un KLD medio de 0,0922 y solo un 89,7% de coincidencia top-1 frente a la referencia, lo que puede afectar a tareas sensibles a la precision.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/Inkling-2-Small-GGUF
- Modelo base (NVFP4): https://huggingface.co/thinkingmachines/Inkling-2-Small
- Variante MXFP8: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Playground: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Guia de Inkling 2 de Unsloth: https://unsloth.ai/docs/models/inkling-2
- Unsloth Desktop: https://unsloth.ai/docs/desktop
- Benchmarks de cuantizacion Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- PR llama.cpp de soporte Inkling 2: https://github.com/ggml-org/llama.cpp/pull/32217
- PR llama.cpp de escalas por experto: https://github.com/ggml-org/llama.cpp/pull/32657
- Build precompilada de Unsloth: https://github.com/unslothai/llama.cpp/releases/tag/b12540-mix-c4017f9
- Rama con layout anterior: https://huggingface.co/unsloth/Inkling-2-Small-GGUF/tree/ggml-org-32187-layout
