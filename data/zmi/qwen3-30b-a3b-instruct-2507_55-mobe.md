# zmi/Qwen3-30B-A3B-Instruct-2507_55-MoBE

## Resumen

zmi/Qwen3-30B-A3B-Instruct-2507_55-MoBE es un modelo derivado del Qwen3-30B-A3B-Instruct-2507 de Alibaba Cloud (equipo Qwen), publicado por el usuario zmi en HuggingFace. Se etiqueta con la arquitectura qwen3_moe y con formato de pesos safetensors. El sufijo "_55-MoBE" del nombre sugiere una modificación sobre la configuracion MoE original, aunque el autor no ha publicado documentacion que describa en que consiste dicha variante, por lo que no es posible confirmar su naturaleza tecnica.

El dato mas relevante es la discrepancia de parametros: los safetensors del repositorio declaran 19.887.372.288 parametros totales (aproximadamente 19,9 mil millones), frente a los 30,5 mil millones del modelo base Qwen3-30B-A3B-Instruct-2507. Esto indica que no se trata de una simple copia del modelo original, sino de una variante con un recuento de parametros sustancialmente inferior. El modelo base del que parte es un MoE que activa aproximadamente 3,3 mil millones de parametros en inferencia (8 de 128 expertos) y esta orientado a seguimiento de instrucciones, razonamiento y uso de herramientas.

La relevancia de esta ficha es limitada en terminos de adopcion: el repositorio acumula 12 descargas y 0 likes desde su publicacion el 13 de octubre de 2026, y el autor no ha facilitado licencia, idiomas soportados, pipeline ni documentacion de entrenamiento. Por tanto, se trata de un artefacto experimental sobre el que cualquier evaluacion de produccion exigiria verificacion directa del comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_moe (transformer MoE); variante "MoBE" no documentada |
| Parametros totales | 19.887.372.288 (segun safetensors del repositorio) |
| Parametros activos | no disponible para esta variante (el base Qwen3-30B-A3B activa ~3,3B, 8 de 128 expertos) |
| Longitud de contexto | no disponible para esta variante |
| Tipos de cuantizacion | no disponible (solo se confirma safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta de arquitectura declarada es qwen3_moe, lo que la situa en la familia de modelos Mixture-of-Experts de Qwen3. El modelo base, Qwen3-30B-A3B-Instruct-2507, es un MoE de 30,5 mil millones de parametros que activa aproximadamente 3,3 mil millones por token, seleccionando 8 de 128 expertos en tiempo de inferencia, lo que le permite mantener un coste computacional de inferencia propio de un modelo mucho mas pequeno que su tamano total.

No hay informacion publicada sobre el proceso de entrenamiento, el dataset, el numero de tokens vistos ni el uso de tecnicas de alineacion (RLHF, DPO u otras) en esta variante concreta. Tampoco se documenta que innovacion tecnica introduce el sufijo "MoBE". Dado que el recuento de parametros safetensors (19,9B) no coincide con el del base (30,5B), es plausible que se haya aplicado algun tipo de poda, reestructuracion o reutilizacion parcial de expertos, pero esto no puede confirmarse con la informacion disponible.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: heredadas potencialmente del base Qwen3-30B-A3B-Instruct-2507, aunque no verificadas en esta variante.
- Razonamiento: el base esta optimizado para tareas de razonamiento; se desconoce si la variante conserva este comportamiento.
- Codigo y matematicas: capacidades del base no confirmadas en esta version.
- Soporte de tool calling / function calling: el base lo soporta; no confirmado aqui.
- Uso agentico y razonamiento multi-paso: el base esta orientado a flujos agenticos; no confirmado en la variante.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Evaluacion comparativa de tecnicas de reduccion de MoE: dado que el modelo declara 19,9B parametros frente a los 30,5B del base, resulta un candidato para estudiar como afecta la reduccion de parametros a la calidad frente al original.
- Investigacion academica sobre variantes de expertos: util para analizar el comportamiento de arquitecturas qwen3_moe modificadas, siempre que se valide primero su correccion funcional.
- Pruebas de inferencia en hardware limitado: con menos parametros totales que el base, podria caber en configuraciones de GPU donde el Qwen3-30B-A3B original no encaja, pendiente de medicion real.
- Experimentacion con cuantizacion: partiendo de safetensors, se podrian generar versiones GGUF/AWQ/GPTQ y medir la degradacion, sin uso en produccion hasta validar licencia.
- Prototipado interno sin distribucion: uso en entornos de investigacion cerrados donde no haya requisitos de licencia comercial.
- Benchmarking de pipelines de despliegue (vLLM, TGI): para medir throughput y latencia de una arquitectura MoE de este tamano, con la cautela de que no hay metricas publicadas.

Nota: al no existir licencia, idiomas ni evaluaciones publicadas, estos casos son hipotesis de uso y no recomendaciones de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante concreta (zmi/Qwen3-30B-A3B-Instruct-2507_55-MoBE).

Como referencia, el modelo base Qwen3-30B-A3B-Instruct-2507 reporta los siguientes datos segun la informacion encontrada, que no son extrapolables a esta variante:

| Modelo | Benchmark | Resultado |
|---|---|---|
| Qwen3-30B-A3B-Instruct-2507 (base) | GPQA | 70,4 |
| zmi/Qwen3-30B-A3B-Instruct-2507_55-MoBE | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: los 19,9B parametros requieren aproximadamente 40 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV.
- VRAM con cuantizacion: en 8 bits, en torno a 20 GB; en 4 bits, alrededor de 10-12 GB (estimaciones teoricas, sin medicion publicada para esta variante).
- GPU recomendadas: para precision completa, A100 80 GB, H100 o 2x RTX 4090/3090; para cuantizacion 4 bits, una unica RTX 4090 (24 GB) deberia ser suficiente en teoria.
- Cabe en GPU de consumo: probablemente si en cuantizacion de 4 bits (RTX 4090, 3090, 4080 con 16 GB de forma ajustada); en FP16 no cabe en GPU de consumo.
- Opciones de despliegue: al distribuirse en safetensors, es compatible con frameworks como vLLM, TGI o transformers; para llama.cpp/Ollama seria necesario convertir a GGUF (no incluido en el repositorio).
- Latencia y throughput: no disponible. Al ser una arquitectura MoE, el throughput efectivo depende del numero de parametros activos, que no se ha especificado para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zmi/Qwen3-30B-A3B-Instruct-2507_55-MoBE | 19,9B | no disponible | no disponible | no disponible | HuggingFace (12 descargas) |
| Qwen/Qwen3-30B-A3B-Instruct-2507 | 30,5B | ~3,3B (8 de 128 expertos) | largo (base Qwen3, valor exacto no confirmado en la busqueda) | Apache 2.0 (base Qwen, a confirmar en el repositorio original) | HuggingFace, ModelScope, Azure AI Foundry |
| Qwen/Qwen3-30B-A3B | 30,5B | ~3,3B (8 de 128 expertos) | largo (base Qwen3) | Apache 2.0 (a confirmar) | HuggingFace |

La diferencia clave de la variante de zmi frente a los modelos de Qwen es el menor numero de parametros declarados (19,9B frente a 30,5B) y la ausencia total de licencia, idiomas y evaluaciones. El modelo base cuenta con soporte en plataformas como Azure AI Foundry, ModelScope y documentacion publica, mientras que la variante solo existe como repositorio en HuggingFace con traccion minima.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia, lo que impide determinar si el uso comercial esta permitido. No debe utilizarse en produccion comercial sin aclarar este punto.
- Sin documentacion de entrenamiento: se desconoce el dataset, el numero de tokens y las tecnicas de alineacion, lo que impide evaluar sesgos y comportamientos indeseados.
- Discrepancia de parametros no explicada: la diferencia entre los 19,9B declarados y los 30,5B del base sugiere modificaciones no documentadas que pueden haber degradado capacidades.
- Riesgo de alucinacion: no evaluado; al no haber benchmarks ni evaluaciones independientes, no puede acotarse.
- Idiomas: no declarados; no puede asumirse soporte multilingue aunque el base lo tenga.
- Contexto: no declarado; no puede asumirse la ventana larga del base.
- Traccion minima: 12 descargas y 0 likes reducen la probabilidad de que el modelo haya sido validado por terceros.
- Caveat de produccion: sin evaluaciones reproducibles, metricas de latencia ni verificacion de calidad, no es apto para despliegues criticos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/zmi/Qwen3-30B-A3B-Instruct-2507_55-MoBE
- Modelo base Qwen3-30B-A3B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Modelo Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Documentacion en GitHub (inferless): https://github.com/inferless/Qwen3-30B-A3B-Instruct-2507/blob/main/README.md
- ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-30B-A3B-Instruct-2507
- Microsoft Foundry (Azure AI): https://ai.azure.com/catalog/models/qwen--qwen3-30b-a3b-instruct-2507
