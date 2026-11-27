# TakashiMiyazoe/qwen3.5-0.8b-rag-sft-2026

## Resumen

Qwen3.5-0.8B RAG SFT 2026 es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario TakashiMiyazoe como proyecto final de un curso de LLM de 2026. El objetivo declarado es especializar un modelo pequeno de la familia Qwen3.5 en tareas de generacion aumentada por recuperacion (RAG) sobre corpus en japones, concretamente respondiendo preguntas a partir de fragmentos de Wikipedia japonesa empaquetados en prompts JSON.

El modelo parte de una arquitectura transformer de la familia Qwen3.5 con aproximadamente 873 millones de parametros totales (dato verificado en los pesos safetensors), lo que lo situa en la gama de modelos ligeros desplegables en hardware de consumo. El ajuste se realizo sobre los conjuntos de datos JEMHopQA y NIILC QA, ambos reformateados como pares prompt-completion en formato JSON con contexto RAG, y filtrados para que las respuestas aparezcan en el corpus de Wikipedia proporcionado.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo experimental, sin descargas ni interacciones en el momento de la consulta, orientado a demostrar un pipeline de SFT para RAG en japones sobre una base de 0.8B. La licencia del ajuste es CC BY-SA 4.0 (heredada de los datasets), mas restrictiva que la Apache-2.0 del modelo base, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo con safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | No disponibles de forma explicita; los datasets de entrenamiento son en japones |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado del checkpoint Qwen/Qwen3.5-0.8B, que emplea una arquitectura transformer propia de la familia Qwen3.5. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni configuracion de tokenizador en la informacion proporcionada. Tampoco se documenta si el entrenamiento incluyo fases de RLHF, DPO u otros metodos de alineacion posteriores al SFT.

El entrenamiento se realizo sobre dos conjuntos de datos: JEMHopQA y NIILC QA, ambos bajo licencia CC BY-SA 4.0. En ambos casos el autor indica que los datos fueron modificados: filtrados haciendo coincidir las respuestas con el corpus de Wikipedia japonesa proporcionado y reformateados como pares prompt-completion en JSON con estructura RAG. El contexto de recuperacion consiste en fragmentos de Wikipedia japonesa derivados de Wikipedia en japones (tambien CC BY-SA 4.0). No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset, hiperparametros ni si se aplicaron tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto condicionada a contexto: responde preguntas a partir de fragmentos de Wikipedia japonesa incluidos en el prompt en formato JSON.
- RAG de dominio japones: el ajuste esta orientado a tareas de question answering sobre corpus recuperado, con enfasis en entidades y relaciones (JEMHopQA) y en preguntas de comprension (NIILC QA).
- Formato de prompt estructurado: entrenado con pares prompt-completion en JSON, por lo que cabe esperar cierta adherencia a ese esquema de entrada.
- Generacion de texto general: al heredar el modelo base Qwen3.5-0.8B, conserva las capacidades genericas de la familia, aunque no se documentan explicitamente.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el entrenamiento SFT es en japones.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Question answering sobre documentacion interna en japones: el modelo puede recibir fragmentos recuperados de un indice vectorial y generar respuestas citando el contexto, aprovechando su entrenamiento especifico en pares RAG con Wikipedia japonesa.
- Prototipado de pipelines RAG en entornos con recursos limitados: al tener 0.8B de parametros, permite iterar sobre el diseno de prompts, chunking y recuperacion en una sola GPU de consumo antes de escalar a modelos mayores.
- Extraccion de respuestas en dominios con entidades y relaciones: el ajuste sobre JEMHopQA lo hace adecuado para preguntas multi-hop sobre entidades japonesas cuando el contexto recuperado contiene la informacion necesaria.
- Evaluacion comparativa de estrategias de SFT: sirve como referencia para estudiar como un ajuste pequeno sobre datos RAG afecta al comportamiento de un modelo base de 0.8B en japones.
- Asistente de consulta sobre bases de conocimiento japonesas: integrado en un sistema de recuperacion, puede responder preguntas factuales sobre articulos de Wikipedia u otras fuentes estructuradas de forma similar.
- Filtrado y reformateo de respuestas en JSON: dado que fue entrenado con prompts y completions en JSON, puede emplearse para generar salidas estructuradas en tareas de extraccion de informacion a partir de contexto.
- Docencia y experimentacion academica: adecuado para cursos de LLM y RAG por su tamano reducido, su licencia abierta y su pipeline de entrenamiento documentado a alto nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parametros, en precision completa (fp32) requiere aproximadamente 3,5 GB solo para pesos; en bf16/fp16 unos 1,8 GB; en cuantizacion de 8 bits alrededor de 0,9 GB y en 4 bits aproximadamente 0,5 GB, sin contar overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en consumer GPU: si, en practicamente cualquier GPU moderna con 6 GB o mas, y potencialmente en CPU con cuantizacion.
- Opciones de despliegue: al publicarse solo en safetensors, es necesario convertir los pesos para usarlos con llama.cpp u Ollama; es compatible con frameworks como Transformers, vLLM y TGI una vez cargado el checkpoint. No se proporcionan artefactos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TakashiMiyazoe/qwen3.5-0.8b-rag-sft-2026 | 873 M | No disponible | CC BY-SA 4.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~0.8 B | No disponible | Apache-2.0 | Hugging Face |
| Modelos RAG japoneses de 1B o menos | No disponible | No disponible | No disponible | No disponible |

La comparacion con alternativas especificas de RAG en japones de tamano similar no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia principal es la licencia (CC BY-SA 4.0 frente a Apache-2.0) y la especializacion en QA sobre contexto recuperado en japones.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre Wikipedia japonesa y datasets academicos, puede heredar sesgos de cobertura y representacion de esas fuentes.
- Riesgo de alucinacion: presente, como en cualquier modelo de 0.8B; el ajuste RAG no garantiza que las respuestas se limiten al contexto proporcionado.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el entrenamiento SFT es en japones, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia CC BY-SA 4.0 del ajuste es mas restrictiva que la Apache-2.0 del modelo base; implica atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede limitar su uso comercial cerrado.
- Caveat de produccion: el modelo tiene 0 descargas y 0 interacciones, es un proyecto de curso sin validacion externa; no se han publicado benchmarks ni evaluaciones independientes.
- Formato: solo se distribuyen pesos safetensors; no hay GGUF ni versiones cuantizadas listas para usar, lo que anade trabajo de conversion para despliegues en CPU o herramientas tipo Ollama.
- Datos de entrenamiento: los datasets fueron filtrados y reformateados por el autor, pero no se documenta el volumen final ni la calidad del filtrado, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TakashiMiyazoe/qwen3.5-0.8b-rag-sft-2026
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- NIILC QA: https://github.com/mynlp/niilc-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
