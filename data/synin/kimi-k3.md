# Synin/Kimi-K3

## Resumen
Kimi K3 es un modelo agéntico multimodal nativo de pesos abiertos desarrollado por Moonshot AI, descrito por sus autores como el primer modelo abierto de clase 3T del mundo. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con aproximadamente 2,8 billones de parámetros totales y 104.000 millones de parámetros activos por token, construido sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), e integra visión nativa con una ventana de contexto de 1.000.000 de tokens.

El modelo está disenado para inteligencia de frontera en tareas de codigo de larga duracion, trabajo de conocimiento y razonamiento, incluyendo la orquestacion autonoma de herramientas de terminal, la navegacion de repositorios enormes y la generacion de visualizaciones interactivas. Segun la model card, escala la dispersion MoE mediante un marco Stable LatentMoE que activa 16 de 896 expertos, lo que se traduce en una mejora aproximada de 2,5 veces en eficiencia de escalado respecto a Kimi K2.

El repositorio analizado se publica bajo el identificador `Synin/Kimi-K3` en HuggingFace y contiene los pesos en formato safetensors con cuantizacion compressed-tensors de 8 bits, con un tamano de repositorio de 1561 GB (aproximadamente 1,5 TB). No debe confundirse el usuario que aloja el repositorio con el desarrollador original del modelo, que es Moonshot AI segun la propia model card. No se han encontrado en la busqueda web resultados tecnicos relevantes sobre el modelo; los unicos resultados devueltos pertenecen a un servicio de alquiler de vivienda sin relacion con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) + Gated MLA y Attention Residuals (AttnRes) |
| Parametros totales | ~2,8 billones (2.779.931.837.184 segun safetensors) |
| Parametros activos | 104.000 millones (104B) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (etiqueta compressed-tensors); no se detallan mas variantes |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other) |
| Formato de pesos | safetensors con compressed-tensors (8-bit) |

## Arquitectura y entrenamiento
Kimi K3 emplea una arquitectura MoE de 93 capas, de las cuales solo 1 es densa. La composicion de capas de atencion combina 69 capas KDA (Kimi Delta Attention) con 24 capas Gated MLA. La dimension oculta de atencion es de 7168 con 96 cabezas de atencion; la dimension latente MoE es de 3584 y la dimension oculta por experto es de 3072, con un total de 896 expertos de los que se activan 16 por token. El modelo incorpora Attention Residuals (AttnRes) y un marco Stable LatentMoE orientado a escalar la dispersion de expertos de forma estable, logrando segun la model card una mejora de aproximadamente 2,5 veces en eficiencia de escalado frente a Kimi K2.

Los detalles concretos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion) no estan disponibles en la informacion proporcionada, ya que la model card suministrada aparece truncada en la seccion de resumen del modelo. La introduccion menciona capacidades multimodales nativas (texto, imagen y video dentro del mismo modelo) y una ventana de contexto de 1.000.000 de tokens.

## Capacidades
- Generacion de texto y razonamiento de frontera orientado a tareas de larga duracion.
- Codigo de larga duracion (long-horizon coding): mantiene sesiones de ingenieria prolongadas con supervision humana minima.
- Navegacion de repositorios de codigo masivos y orquestacion de herramientas de terminal.
- Casos tecnicos avanzados citados por el autor: optimizacion de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con vision en el bucle, CAD y diseno de chips.
- Trabajo de conocimiento agentico de extremo a extremo: investigacion profunda con visualizaciones interactivas, widgets, cuadros de mando, diseno de movimiento y edicion de video.
- Multimodalidad nativa: comprension de texto, imagenes y video en el mismo modelo.
- Contexto largo de hasta 1.000.000 de tokens.
- Soporte de agentes y razonamiento multi-paso (capacidad agentica central del modelo).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque la orquestacion de herramientas de terminal y el enfoque agentico lo sugieren.
- Capacidades multilingues: no disponible.

## Casos de uso
- Codificacion agentica en repositorios grandes: el modelo puede recorrer y modificar bases de codigo extensas en sesiones largas, apoyandose en la ventana de 1.000.000 de tokens para mantener el contexto de multiples ficheros y directorios.
- Optimizacion de kernels de GPU: genera y refina kernels de bajo nivel iterando sobre su rendimiento, un escenario citado expresamente por el autor.
- Desarrollo de compiladores: asiste en la implementacion y depuracion de fases de compilacion donde se requiere razonamiento tecnico sostenido.
- Investigacion profunda automatizada: produce informes con visualizaciones interactivas, widgets y cuadros de mando a partir de fuentes diversas, aprovechando la multimodalidad nativa.
- Edicion de video y diseno de movimiento: al comprender video de forma nativa, puede integrarse en flujos de postproduccion automatizada.
- Asistencia en diseno de hardware y CAD: aplicable a tareas de vision-in-the-loop para el diseno de circuitos integrados y modelado CAD, segun los casos reportados.
- Atencion al cliente o asistentes conversacionales de contexto muy largo: la ventana de 1M tokens permite mantener historiales extensos y documentacion de referencia dentro del mismo contexto.
- Agentes autonomos de operaciones (terminal/DevOps): la capacidad de orquestar herramientas de terminal lo hace apto para pipelines automatizados de despliegue y mantenimiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Aunque el repositorio incluye la etiqueta `eval-results`, la model card suministrada esta truncada antes de la seccion de resultados y no se aportan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. No se deben asumir valores numericos no documentados.

## Requisitos de hardware
- VRAM estimada: los pesos ocupan aproximadamente 1,5 TB en el repositorio (1561 GB) en formato compressed-tensors de 8 bits. Para inferencia en 8 bits seria necesario del orden de 1,5-3 TB de memoria agregada; con los 2,8 billones de parametros, incluso una cuantizacion agresiva de 4 bits requeriria del orden de 1,4 TB.
- GPU recomendadas: por el tamano, se requiere un despliegue multi-GPU y probablemente multi-nodo con aceleradores de clase centro de datos (H100, H200, A100 80GB, B200 o equivalentes). No cabe en una sola GPU.
- GPU de consumo: no es viable en GPUs de consumo (RTX 4090, 3090, etc.) ni en configuraciones de escritorio; el modelo excede por completo la memoria disponible.
- Opciones de despliegue: no confirmadas en la informacion disponible. Al usar `transformers`, `safetensors` y `custom_code`, se requiere el codigo personalizado del modelo; la compatibilidad con vLLM, llama.cpp, Ollama o TGI no se especifica en los datos proporcionados.
- Latencia y throughput: no disponibles. Con 104B de parametros activos por token, la latencia dependera fuertemente del hardware y del grado de paralelismo; no se aportan cifras.

## Comparativa con modelos similares
La informacion proporcionada solo permite comparar con el predecesor citado en la model card, Kimi K2. No se dispone de especificaciones numericas de Kimi K2 en los datos suministrados, por lo que la comparacion cuantitativa no esta disponible.

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kimi K3 | ~2,8 billones (104B activos) | 1.000.000 tokens | Kimi K3 License | Pesos abiertos (repo Synin/Kimi-K3) | Mejora ~2,5x en eficiencia de escalado frente a K2 (segun autor) |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | Citado como predecesor en la model card |
| Otros modelos de clase frontera | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparables en la informacion disponible |

## Limitaciones y advertencias
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; como todo modelo de lenguaje de gran escala, es susceptible de generar contenido incorrecto, especialmente en tareas tecnicas de alta precision. No se aportan datos de fiabilidad.
- Limitaciones de contexto o idioma: aunque la ventana de contexto es de 1.000.000 de tokens, no se especifica el rendimiento efectivo en contextos extremos ni los idiomas soportados (campo no disponible).
- Restricciones de licencia: la licencia es "Kimi K3 License" (license: other). No se detallan en la informacion disponible los terminos exactos de uso comercial, por lo que se debe consultar el fichero LICENSE del repositorio antes de cualquier uso en produccion.
- Caveat de procedencia: el repositorio analizado esta publicado por el usuario `Synin`, no por el desarrollador original (Moonshot AI). Esto implica un riesgo de que se trate de una replicacion o redistribucion; conviene verificar la autenticidad e integridad de los pesos frente al repositorio oficial.
- Coste de despliegue: el tamano de 1,5 TB en disco y los requisitos de memoria de multiples GPUs de centro de datos hacen inviable su uso en infraestructura de consumo.
- Caveat de produccion: no hay datos publicados de latencia, throughput ni estabilidad en entornos productivos, ni confirmacion de integracion con frameworks de servido habituales.

## Enlaces
- Repositorio HuggingFace analizado: https://huggingface.co/Synin/Kimi-K3
- Model card de referencia (Moonshot AI): https://huggingface.co/moonshotai/Kimi-K3
- Organizacion HuggingFace de Moonshot AI: https://huggingface.co/moonshotai
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Chat: https://www.kimi.com
- Pagina principal de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
