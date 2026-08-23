# turboderp/Muse-Glimmer-30B-exl3

## Resumen

Muse-Glimmer-30B-exl3 es una colección de cuantizaciones EXL3 del modelo Muse-Glimmer-30B de Meta, publicada por el usuario turboderp. El modelo base es un LLM multimodal de 30 mil millones de parámetros, destilado de Muse Spark, diseñado específicamente para flujos de trabajo agénticos en entornos locales. Meta lo describe como un modelo abierto para agentes "siempre activos" que se ejecuta en una sola GPU, con licencia Apache 2.0 y optimizado para uso de herramientas, tareas largas y recuperación de fallos.

Esta variante EXL3 ofrece un amplio rango de cuantizaciones, desde 1.75 hasta 6.0 bits por peso, incluyendo versiones "self-calibrated" que ajustan la cuantización con datos de calibración propios. El repositorio incluye también un drafter DFlash separado para decodificación especulativa, lo que permite acelerar la generación en hardware local. Es relevante porque permite desplegar un modelo agéntico multimodal de 30B en GPUs de consumo con pérdidas de calidad controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3: 1.75, 2.0, 2.25, 2.5, 3.0, 3.5, 4.0, 5.0, 6.0 bits por peso (versiones plain y self-calibrated) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion EXL3 para ExLlamaV3) |

## Arquitectura y entrenamiento

La arquitectura exacta de Muse-Glimmer-30B no se especifica en la informacion proporcionada. Se sabe que es un modelo multimodal que acepta texto e imagenes, con capacidad de razonamiento paso a paso y tool-calling nativo. Segun Meta, es una destilacion de su modelo propietario Muse Spark, lo que implica que el entrenamiento ha incluido una fase de destilacion para transferir capacidades de un modelo mayor a este de 30B.

El proceso de cuantizacion EXL3 realizado por turboderp incluye dos enfoques: cuantizaciones "plain" estandar y cuantizaciones "self-calibrated" que utilizan un conjunto de calibracion propio para ajustar los parametros de cuantizacion. Los resultados de evaluacion se presentan en graficos de divergencia KLD (Kullback-Leibler divergence) y perplexity frente al uso de VRAM, que permiten comparar el equilibrio entre calidad y memoria consumida. No se dispone de detalles sobre el dataset de entrenamiento del modelo original ni sobre tecnicas como RLHF o DPO.

## Capacidades

- Razonamiento multimodal: acepta entradas de texto e imagenes y genera respuestas razonadas paso a paso antes de dar la respuesta final.
- Tool-calling nativo: disenado para integrarse con herramientas externas y APIs, facilitando la construccion de agentes que ejecutan acciones.
- Agentes locales: optimizado para tareas largas y autonomas en entornos con recursos limitados, con mecanismos de recuperacion de fallos.
- Razonamiento multi-paso: el modelo genera una cadena de razonamiento explicita antes de la respuesta, util para tareas complejas.
- Decodificacion especulativa: el drafter DFlash disponible en el repositorio permite acelerar la generacion en hasta un factor significativo, especialmente en cuantizaciones bajas.
- Multilingue: no se especifican los idiomas soportados en la informacion proporcionada.

## Casos de uso

- Asistentes de agentes locales: el modelo puede gestionar tareas largas en un ordenador personal, como gestion de correo, calendario o automatizacion de flujos de trabajo, gracias a su optimizacion para agentes "siempre activos" y su tool-calling nativo.
- Analisis de documentos multimodales: al aceptar imagenes, puede extraer informacion de capturas, diagramas o documentos escaneados, y responder preguntas o resumir el contenido.
- Automatizacion de procesos con herramientas: se puede integrar en pipelines donde el modelo decide que herramienta llamar (por ejemplo, consultas a APIs, ejecucion de scripts) y recuperarse de errores, ideal para orquestadores de agentes.
- Desarrollo de codigo asistido: con su capacidad de razonamiento y tool-calling, puede usarse en entornos de desarrollo integrados para generar, revisar o corregir codigo, invocando funciones de compilacion o test.
- Asistente de investigacion multimodal: para analizar articulos con figuras, graficas o tablas, y producir resumenes o respuestas que requieren integracion de informacion visual y textual.
- Chatbots de soporte tecnico: la cuantizacion EXL3 permite desplegarlo en una sola GPU, por lo que puede servir como backend de un asistente local con memoria de contexto larga (si se confirma el contexto, aunque no esta disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye graficos de divergencia KLD y perplexity frente a VRAM para cada cuantizacion, pero no se proporcionan valores numericos concretos en el texto. Tampoco se comparan con otros modelos. Se recomienda consultar los graficos en el repositorio para evaluar el equilibrio calidad-memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo de cuantizacion de 2.00bpw ocupa aproximadamente 11 GB, por lo que cabe en GPUs de 16 GB. Las cuantizaciones mas altas (5.00-6.00 bpw) pueden requerir entre 30 y 60 GB de VRAM.
- GPU recomendadas: para cuantizaciones de 2.00-2.50 bpw, una RTX 4090 (24 GB) o RTX 4080 (16 GB) es suficiente; para cuantizaciones de 3.0-4.0 bpw, se recomienda una A100 (40/80 GB) o H100 (80 GB); para 5.0-6.0 bpw, H100 o multiples GPUs.
- Se puede ejecutar en una sola GPU, como indica Meta, pero el requisito exacto depende de la cuantizacion elegida.
- Opciones de despliegue: al ser formato EXL3, se usa con ExLlamaV3 (o ExLlamaV2 con compatibilidad). Tambien puede usarse con vLLM si soporta el formato, o con llama.cpp si se convierten los pesos a GGUF (aunque no se proporcionan quants GGUF en este repositorio).
- Latencia y throughput: no se proporcionan datos especificos; la decodificacion especulativa con el drafter DFlash puede reducir la latencia notablemente, especialmente en cuantizaciones bajas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La comparativa natural seria con el modelo original sin cuantizar (meta-models/Muse-Glimmer-30B), que ofrece mayor fidelidad pero requiere mas memoria. Este repositorio se posiciona como una alternativa de menor huella de memoria para despliegues locales en una sola GPU.

## Limitaciones y advertencias

- La arquitectura exacta y el dataset de entrenamiento no se han publicado en la informacion proporcionada, lo que limita la evaluacion de sesgos o riesgos especificos.
- Las cuantizaciones de muy baja precision (1.75-2.00 bpw) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- No se especifican los idiomas soportados; se asume que el modelo original de Meta soporta varios idiomas, pero no se puede confirmar.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de los terminos de Meta sobre el modelo base.
- El modelo es multimodal, pero no se detallan los limites de resolucion de imagen ni el numero de imagenes procesables por contexto.
- Para produccion, se recomienda validar el rendimiento con las graficas de KLD y perplexity del repositorio, ya que no hay benchmarks estandarizados publicados.

## Enlaces

- Repositorio HuggingFace: [turboderp/Muse-Glimmer-30B-exl3](https://huggingface.co/turboderp/Muse-Glimmer-30B-exl3)
- Modelo base: [meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- Drafter DFlash: [turboderp/Muse-Glimmer-30B-assistant-exl3](https://huggingface.co/turboderp/Muse-Glimmer-30B-assistant-exl3)
- Pagina oficial de Meta: [Muse Glimmer](https://developer.meta.com/ai/models/muse-glimmer/)
- Model card en NVIDIA NIM: [muse-glimmer-30b](https://build.nvidia.com/meta/muse-glimmer-30b/modelcard)
- Documentacion de API de Meta: [dev.meta.ai/docs/muse-glimmer](https://dev.meta.ai/docs/muse-glimmer)
