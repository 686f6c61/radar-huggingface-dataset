# wrldsuksgo2mars/Inkling-2-Small-EXL3-K4-MC

## Resumen

Inkling-2-Small-EXL3-K4-MC es una cuantizacion comunitaria del modelo base thinkingmachines/Inkling-2-Small-MXFP8, publicada por el usuario wrldsuksgo2mars. Se trata de un checkpoint de tipo mixture-of-experts (MoE) con 155.843.301.552 parametros totales, en el que los expertos enrutados se han cuantizado a 4 bits mediante el codebook EXL3 MCG, mientras que el nucleo denso se ofrece en tres variantes seleccionables en tiempo de carga (BF16 original, EXL3 8 bits y EXL3 6 bits). El checkpoint esta disenado especificamente para el runtime cuteafd.

La innovacion principal es el formato "multi-core": los expertos enrutados (274,1 GiB, aproximadamente el 94,4% del checkpoint en la vista `original`) se almacenan una sola vez y se comparten entre las tres vistas, mientras que el nucleo denso (atencion, proyecciones feed-forward densas y compartidas, y cabeza de salida) se empaqueta en tres codificaciones distintas. Esto permite al usuario elegir en el momento de la carga entre fidelidad maxima (BF16) y menor huella de almacenamiento (K6), sin duplicar los pesos de los expertos.

El modelo es relevante porque demuestra una via practica para servir modelos MoE de gran tamano en hardware con memoria limitada, combinando cuantizacion de expertos a 4 bits con un nucleo denso de mayor precision. La licencia es Apache 2.0 y el repositorio ocupa 324,8 GB. No se dispone de informacion sobre benchmarks publicados ni sobre los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con expertos enrutados y nucleo denso; incluye proyecciones de drafter y componentes de vision |
| Parametros totales | 155.843.301.552 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados: EXL3 MCG K4 (4 bits); nucleo denso: BF16 (original), EXL3 MCG K8 (8 bits) o EXL3 MCG K6 (6 bits), seleccionable en carga |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con indices e configuracion por vista: `model.safetensors.index.json`, `config.json`, `quantize_config.json` y variantes `.k8.` / `.k6.`) |
| Tamano del repositorio | 324,8 GB |
| Tamano de payload por vista | `original`: 290,3 GiB; `k8-compact`: 283,5 GiB; `k6-compact`: 281,8 GiB |
| Modelo base | thinkingmachines/Inkling-2-Small-MXFP8 (commit 3febc62259ee92ea36e2fb6e8303371c4eb3922c) |
| Runtime | cuteafd (seleccion de vista mediante `CORE_VIEW=original|k8-compact|k6-compact`) |
| Libreria declarada | cuteafd |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con expertos enrutados y un nucleo denso que incluye atencion, proyecciones feed-forward densas y compartidas, y la cabeza de salida. El checkpoint cuantizado mantiene nativos los componentes de vision, routers, normas, convoluciones, tensores de atencion residual y los tensores restantes del drafter. La cuantizacion afecta a 55.296 matrices gate/up/down de los expertos enrutados, empaquetadas en EXL3 MCG K4, y a 334 matrices seleccionadas del nucleo y del drafter en cada vista compacta (incluidas 45 proyecciones del drafter).

El proceso de cuantizacion emplea GPTQModel (fork de tpurtell, commit 5d93c9de5c2caf151cbe26cbb65b5f4fbee5dc98) con codebook EXL3 MCG de multiplicador `0xCBAC1FED`, semilla 787 y regularizacion de Hessian sigma 0,025. Se realizo una unica pasada causal que propaga activaciones reconstruidas del nucleo K8 y de los expertos K4; la variante K6 reutiliza las mismas matrices de Hessian capturadas en lugar de generar un flujo de activaciones propio. La calibracion usa un panel de texto propio renderizado con el tokenizador y plantilla del checkpoint, aunque la model card no registra la identidad del dataset, su revision, el split ni el numero de prompts o tokens. Se conserva la metadata original de cuantizacion de activaciones MXFP8 (bloques de 32 valores, redondeo al mas cercano, valores E4M3 y escalas UE8M0). El drafter se calibro con caracteristicas K8 del ultimo bloque completo de cada prompt no truncado, y su metadata indica que no se ejecuto ningun piloto del drafter.

## Capacidades

- Generacion de texto autoregresiva sobre una arquitectura MoE de 155,8 mil millones de parametros totales.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Inkling-2-Small-MXFP8, aunque no se detallan en la informacion disponible.
- Componentes de vision mantenidos nativos en el checkpoint, lo que sugiere soporte de entrada multimodal (no confirmado explicitamente en la model card).
- Decodificacion especulativa mediante un drafter integrado (proyecciones del drafter incluidas en el paquete).
- Seleccion de vista de nucleo denso en tiempo de carga (BF16, K8 o K6) para ajustar precision y huella.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un MoE de gran tamano en infraestructura con memoria limitada: gracias a la cuantizacion K4 de los expertos, el checkpoint reduce la huella de los pesos mas voluminosos (274,1 GiB) manteniendo el nucleo denso en BF16 o en K8/K6 segun la precision requerida.
- Experimentacion con cuantizacion extrema en produccion: el formato multi-core permite comparar el impacto de distintas codificaciones del nucleo denso (BF16 frente a K8 y K6) sobre la misma copia de expertos, lo que facilita estudios de degradacion de calidad.
- Inferencia con decodificacion especulativa: el drafter incluido permite acelerar la generacion en el runtime cuteafd, adecuado para aplicaciones interactivas donde la latencia por token es critica.
- Investigacion en arquitecturas MoE: el checkpoint expone la separacion entre expertos enrutados y nucleo denso, util para analizar el comportamiento de routers y la contribucion de cada componente.
- Servicio de generacion de texto a gran escala con licencia permisiva: la licencia Apache 2.0 permite uso comercial sin restricciones de atribucion adicionales, adecuado para productos derivados.
- Pipelines multimodales (si se confirma el soporte de vision): los tensores de vision se mantienen nativos, lo que permitiria tareas de comprension de imagenes combinadas con texto, aunque esta capacidad no esta documentada explicitamente.
- Evaluacion comparativa de tecnicas de cuantizacion (EXL3 MCG frente a MXFP8): el repositorio incluye recibos de procedencia y validacion (`package-provenance.json`, `package-validation.json`) utiles para reproducir y auditar el proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El payload de tensores por vista es de 290,3 GiB (`original`), 283,5 GiB (`k8-compact`) y 281,8 GiB (`k6-compact`), lo que exige agregar memoria para activaciones, cache KV y overhead del runtime. En la practica, el despliegue requiere multiples GPU de alta capacidad.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el volumen de pesos (mas de 280 GiB por vista), se necesitan configuraciones multi-GPU con GPUs de 80 GB o superior (A100, H100) o soluciones con memoria unificada; esta recomendacion es una inferencia a partir del tamano, no un dato publicado.
- Cabe en consumer GPU: no, dado el tamano de los pesos (mas de 280 GiB por vista), no cabe en ninguna GPU de consumo individual.
- Opciones de despliegue: runtime cuteafd con soporte de vistas MC (`CORE_VIEW=original|k8-compact|k6-compact`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Small-EXL3-K4-MC (este) | 155.843.301.552 | no disponible | Expertos K4 EXL3; nucleo BF16/K8/K6 | Apache 2.0 | Hugging Face, runtime cuteafd |
| thinkingmachines/Inkling-2-Small-MXFP8 (base) | no disponible | no disponible | MXFP8 nativo | no disponible | Hugging Face |
| Otros modelos MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables adicionales en la documentacion proporcionada.

## Limitaciones y advertencias

- La model card indica que Inkling 2 Small sigue en proceso de cualificacion (referencia a la issue #1930 del repositorio cuteafd), por lo que el estado de produccion no esta confirmado.
- La cuantizacion K4 de los expertos puede introducir degradacion de calidad respecto al modelo base MXFP8; no se publican metricas de evaluacion que cuantifiquen esta perdida.
- La receta de cuantizacion no esta completamente upstream: la validacion de proyecciones GLM compartidas en GPTQModel upstream solo acepta K4/K6, y el soporte K8 depende del fork de tpurtell. El archivo `gptqmodel/utils/inkling2_core.py` del fork no esta presente en upstream, lo que dificulta la reproducibilidad fuera del ecosistema cuteafd.
- La calibracion no documenta la identidad del dataset, su revision, el split ni el numero de prompts o tokens, lo que limita la auditoria del proceso.
- La metadata del drafter registra que no se ejecuto ningun piloto del drafter, por lo que su rendimiento en decodificacion especulativa no esta validado.
- El checkpoint solo es utilizable con el runtime cuteafd; no hay soporte documentado para otros motores de inferencia, lo que reduce la portabilidad.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada, aunque son riesgos inherentes a los modelos de lenguaje de gran escala.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y sus componentes pueden tener terminos adicionales no reflejados en la informacion disponible.
- El repositorio ocupa 324,8 GB, lo que requiere almacenamiento considerable para su descarga y despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/Inkling-2-Small-EXL3-K4-MC
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small-MXFP8
- Runtime cuteafd: https://github.com/tpurtell/cuteafd
- Documentacion del formato MC: https://github.com/tpurtell/cuteafd/blob/dev/docs/mc-checkpoints.md
- Pagina de la familia Inkling 2 Small en cuteafd: https://github.com/tpurtell/cuteafd/blob/dev/docs/models/inkling2.md
- Tablas de resultados de cuteafd: https://github.com/tpurtell/cuteafd#models
- Orquestacion de cuantizacion: https://github.com/tpurtell/cuteafd/blob/dev/quantization/inkling2/
- GPTQModel (fork): https://github.com/tpurtell/GPTQModel
- Pull request upstream #3587: https://github.com/ModelCloud/GPTQModel/pull/3587
- Pull request upstream #3591: https://github.com/ModelCloud/GPTQModel/pull/3591
- Pull request upstream #3609: https://github.com/ModelCloud/GPTQModel/pull/3609
- Pull request del fork #5: https://github.com/tpurtell/GPTQModel/pull/5
- Issue de cualificacion #1930: https://github.com/tpurtell/cuteafd/issues/1930
