# Weidows/WeMM-Embedding-2B-GGUF

## Resumen

WeMM-Embedding-2B es un modelo de embedding multimodal desarrollado por el equipo de Tencent WeChat (TIGER-AI-Lab), disenado para mapear texto, imagenes y video a un espacio vectorial unificado de 2048 dimensiones. Este repositorio concreto, publicado por Weidows, ofrece las versiones cuantizadas en formato GGUF del modelo original, pensadas para su ejecucion con llama.cpp en entornos locales o de produccion con recursos limitados.

El modelo pertenece a una familia que abarca escalas de 2B, 4B y 9B de parametros, y emplea una arquitectura basada en Qwen3.5 adaptada para tareas de embedding multimodal. Su relevancia actual radica en que permite recuperacion cross-modal (texto-imagen, texto-video, imagen-texto) con un unico modelo, compitiendo favorablemente con modelos propietarios como Gemini Embedding 2 segun el informe tecnico publicado en arXiv. La version GGUF aqui presentada incluye una evaluacion exhaustiva del impacto de la cuantizacion sobre la calidad de los embeddings, algo poco habitual y muy util para decidir el punto de equilibrio entre tamano y fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5, adaptada para embedding multimodal (pipeline VLM2Vec) |
| Parametros totales | 2.389.393.216 (~2,4 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M |
| Idiomas soportados | Chino e ingles (segun tags del repo espejo DreamBlooms); no confirmado oficialmente en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

WeMM-Embedding-2B sigue el pipeline oficial de VLM2Vec del TIGER-AI-Lab, con modificaciones minimas: inferencia multi-nodo multi-GPU mediante torchrun, un backbone wemm_embedding con preprocesamiento propio e inferencia por lotes, y muestreo de video de 64 frames. El entrenamiento emplea una estrategia en dos etapas que progresa desde una alineacion multimodal amplia hacia un aprendizaje de relevancia mas fino, tal y como se describe en el informe tecnico arXiv 2608.24053.

La salida del modelo es un vector de 2048 dimensiones normalizado L2, con soporte de truncamiento matryoshka (Matryoshka Representation Learning) que permite reducir las dimensiones a 64, 128, 256, 512 o 1024 sin reentrenar, ajustando asi el coste de almacenamiento y busqueda segun las necesidades. Los pesos GGUF de este repositorio se generaron con llama-quantize a partir de un master BF16, y la evaluacion de calidad se realizo en el conjunto STS-B test (1.379 pares de oraciones) con el mismo motor llama.cpp para todos los cuantizados, aislando asi el error introducido por la cuantizacion.

## Capacidades

- Embedding de texto: genera vectores de 2048 dimensiones para oraciones y documentos, normalizados L2.
- Embedding de imagenes: proyeccion visual mediante el modulo mmproj incluido en el repositorio.
- Embedding de video: soporta hasta 64 frames por video mediante el proyector multimodal.
- Recuperacion cross-modal: texto-imagen, texto-video, imagen-texto y video-texto en un espacio vectorial compartido.
- Truncamiento matryoshka: permite reducir las dimensiones del embedding a 64, 128, 256, 512 o 1024 sin degradacion proporcional al uso.
- Compatibilidad con llama.cpp: ejecucion via linea de comandos (llama-embedding) o servidor HTTP con endpoint OpenAI-compatible (/v1/embeddings).
- Integracion multimodal en chat: el servidor acepta contenido intercalado de imagen/video y texto siguiendo el formato del modelo base.

## Casos de uso

- Busqueda semantica multimodal en RAG: indexar documentos que contienen imagenes, tablas y texto, y recuperarlos con consultas en cualquiera de las modalidades. El modelo unifica todo en el mismo espacio vectorial, eliminando la necesidad de pipelines separados por tipo de contenido.
- Deduplicacion de contenido en grandes corpus: detectar duplicados o variantes de imagenes y texto en bases de datos de contenido generado por usuarios, usando similitud coseno sobre los embeddings de 2048 dimensiones.
- Moderacion de contenido visual y textual: clasificar imagenes y videos por similitud con ejemplos etiquetados (por ejemplo, contenido inapropiado) sin necesidad de entrenar clasificadores especificos.
- Sistemas de recomendacion cross-modal: recomendar productos, articulos o videos a partir de una consulta en texto o una imagen de referencia, gracias a la alineacion multimodal del espacio de embeddings.
- Clasificacion y agrupacion de contenido multimedia: agrupar por clustering (K-means, HDBSCAN) colecciones mixtas de imagenes, videos y texto para organizar bibliotecas de activos digitales.
- Recuperacion de video por descripcion textual: buscar clips concretos dentro de una videoteca usando consultas en lenguaje natural, aprovechando el muestreo de 64 frames y la proyeccion video-texto del modelo.
- Despliegue en produccion con recursos limitados: las cuantizaciones Q5_K_M o IQ4_XS (1,76 GB y 1,47 GB respectivamente) permiten ejecutar el modelo en GPUs de consumo o incluso solo CPU, sirviendo embeddings via endpoint OpenAI-compatible.

## Benchmarks y rendimiento

La model card incluye una evaluacion de calidad de cuantizacion sobre STS-B test (1.379 pares de oraciones, similitud humana 0-5). La referencia BF16 se ejecuto con el mismo motor llama.cpp que el resto de cuantizados, por lo que las diferencias reflejan exclusivamente el error de cuantizacion:

| Cuantizacion | Bits/peso | Tamano (MB) | STS-B Spearman ρ | Δρ vs BF16 | Coseno emb. vs BF16 | Pearson pares vs BF16 |
|---|---|---|---|---|---|---|
| BF16 | 16,00 | 4790,8 | 0,8360 | — | — | — |
| Q8_0 | 8,00 | 2551,3 | 0,8357 | +0,03 % | 0,9997 | 1,0000 |
| Q6_K | 5,80 | 1972,8 | 0,8358 | +0,03 % | 0,9987 | 0,9999 |
| Q5_K_M | 5,17 | 1760,0 | 0,8361 | -0,01 % | 0,9956 | 0,9995 |
| Q4_K_M | 4,85 | 1559,8 | 0,8310 | +0,60 % | 0,9854 | 0,9984 |
| IQ4_XS | 4,33 | 1471,4 | 0,8360 | +0,00 % | 0,9855 | 0,9985 |
| IQ3_M | 3,76 | 1277,3 | 0,8286 | +0,89 % | 0,9263 | 0,9895 |

Conclusiones de la model card: Q8_0, Q6_K, Q5_K_M e IQ4_XS son sustitutos directos sin perdida apreciable (|Δρ| < 0,05 %, coseno de embedding > 0,985). Q4_K_M muestra una caida visible y es claramente peor que IQ4_XS al mismo tamano, por lo que se recomienda preferir IQ4_XS o Q5_K_M. IQ3_M es la unica variante con degradacion claramente medible (Δρ ≈ +0,89 %, coseno 0,93) y solo debe usarse si el almacenamiento es critico.

El informe tecnico (arXiv 2608.24053) menciona que el modelo de 2B se compara favorablemente con modelos propietarios lideres en el conjunto de recuperacion cross-modal de Gemini Embedding 2, asi como mejoras sustanciales en un benchmark interno de 26 tareas y en 14 pruebas A/B online, aunque los numeros concretos no estan disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamano del archivo GGUF es el principal factor. Para Q5_K_M (1,76 GB) se necesitan aproximadamente 3-4 GB de VRAM con overhead de ejecucion; para BF16 (4,79 GB) unos 6-8 GB.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas (RTX 3060, RTX 4060, RTX 4090) ejecuta sin problemas las cuantizaciones Q5_K_M y superiores. Para BF16 completo se recomienda 8 GB o mas.
- Ejecucion solo CPU: posible con llama.cpp usando -ngl 0, aunque la latencia aumenta significativamente. Adecuado para procesamiento por lotes no critico.
- Opciones de despliegue: llama.cpp (llama-embedding y llama-server), servidor HTTP con endpoint OpenAI-compatible para /v1/embeddings, y el proyector multimodal (mmproj) se carga con la flag --mmproj.
- Latencia y throughput: no se proporcionan datos concretos en la informacion disponible. Como referencia, un modelo de 2B cuantizado a Q5_K_M en una GPU moderna procesa cientos de oraciones por segundo, pero estos numeros no estan confirmados para este modelo especifico.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Dimension embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Embedding-2B (este) | 2,4 B | Texto, imagen, video | 2048 (MRL 64-1024) | Apache 2.0 | Abierto, GGUF y safetensors |
| Gemini Embedding 2 | no disponible | Texto, imagen, video | no disponible | Propietaria | API comercial |
| VLM2Vec (base del pipeline) | no disponible | Texto, imagen | no disponible | no disponible | no disponible |

La comparacion con Gemini Embedding 2 se menciona en el informe tecnico como favorable para WeMM-Embedding-2B en el conjunto de recuperacion cross-modal, pero no se incluyen numeros concretos en la informacion disponible. La ventaja principal frente a alternativas propietarias es la licencia Apache 2.0, que permite uso comercial sin restricciones, y la disponibilidad de pesos cuantizados GGUF para despliegue local. No se dispone de datos suficientes para comparar directamente con otros modelos de embedding abiertos del mismo tamano.

## Limitaciones y advertencias

- Cuantizaciones agresivas: IQ3_M (3,76 bpw) muestra una degradacion claramente medible (Δρ ≈ +0,89 % y coseno de embedding de solo 0,93) y no debe usarse en produccion salvo que el almacenamiento sea critico.
- Q4_K_M es peor que IQ4_XS al mismo tamano: con 4,85 bpw frente a 4,33 bpw, Q4_K_M pierde mas calidad (Δρ +0,60 % frente a +0,00 %), por lo que no se recomienda su uso.
- Idiomas limitados: el modelo esta orientado principalmente a chino e ingles. El comportamiento en otros idiomas no esta documentado y puede degradarse significativamente.
- Longitud de contexto no especificada: no se ha publicado el limite de contexto del modelo, lo que dificulta dimensionar su uso en tareas de recuperacion de documentos largos.
- Modelo de 2B: la familia incluye variantes de 4B y 9B con mayor capacidad; este tamano puede quedarse corto en tareas de razonamiento complejo o recuperacion de alta precision.
- Evaluacion limitada a STS-B: la model card solo incluye resultados en STS-B, un conjunto de similitud de oraciones en ingles. No hay benchmarks publicados de recuperacion cross-modal especificos en este repositorio.
- Dependencia del proyector multimodal: para entrada de imagen o video es obligatorio cargar el archivo mmproj-WeMM-Embedding-2B-BF16.gguf, que anade memoria y complejidad al despliegue.
- Riesgo de alucinacion en tareas generativas: aunque su funcion principal es generar embeddings, el servidor llama.cpp permite uso conversacional; en ese modo puede producir alucinaciones como cualquier LLM de 2B.

## Enlaces

- Repositorio GGUF principal: https://huggingface.co/Weidows/WeMM-Embedding-2B-GGUF
- Repositorio GGUF espejo: https://huggingface.co/DreamBlooms/WeMM-Embedding-2B-GGUF
- Modelo base (safetensors): https://huggingface.co/tencent/WeMM-Embedding-2B
- Repositorio oficial en GitHub: https://github.com/Tencent/WeMM-Embedding
- Informe tecnico (HTML): https://arxiv.org/html/2608.24053v1
- Informe tecnico (PDF): https://arxiv.org/pdf/2608.24053
