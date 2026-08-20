# yeahbeen/F2LLM-v2-330M-Q4_K_M-GGUF

## Resumen

F2LLM-v2-330M es un modelo de embeddings multilingüe desarrollado por CodeFuse (Alibaba), diseñado para generar representaciones vectoriales de texto en más de 200 idiomas, con especial atención a lenguas de recursos medios y bajos. Este repositorio concreto contiene la conversión a formato GGUF con cuantización Q4_K_M, realizada por el usuario yeahbeen mediante la herramienta GGUF-my-repo de llama.cpp, lo que permite ejecutar el modelo en CPU y en entornos con recursos limitados.

El modelo original forma parte de la familia F2LLM-v2, que incluye 8 tamaños que van desde 80M hasta 14B de parámetros. La versión de 330M aquí presentada tiene 334.349.184 parámetros y está pensada para tareas de extracción de características (feature extraction) y búsqueda semántica. Su relevancia actual radica en que ofrece una alternativa ligera y multilingüe para sistemas de recuperación de información, clasificación de textos y otras aplicaciones de PLN que requieren embeddings de alta calidad sin depender de modelos masivos.

Al estar disponible en formato GGUF, este modelo puede integrarse fácilmente en pipelines que usen llama.cpp, Ollama u otras herramientas compatibles, lo que facilita su despliegue en producción tanto en servidores como en dispositivos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings, probablemente transformer encoder) |
| Parametros totales | 334.349.184 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (este repo), otros disponibles en el modelo base |
| Idiomas soportados | mas de 200, incluyendo en, zh, ru, es, fr, de, ar, nl, vi, hi, ko, ja, it, id, pt, pl, tr, da, th, sv, fa, uk, cs, no, el, ca, ro, fi, bg, tl, gl, my, hy, km, ne, hu, eu, he, lo, sw, az, lv, si, sk, tg, et, lt, ms, hr, is, sl, sr, ur, bn, af, ta, ka, te, ml, mn, nn, kk, cy, mr, sq, nb, mk, jv, kn, eo, la, gu, uz, am, oc, be, mg, vo, pa, lb, ht, br, ga, xh, tt, bs, yo |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Se sabe que es un modelo de embeddings (no generativo) entrenado sobre un conjunto de datos compuesto por 60 millones de ejemplos publicos de alta calidad, curado especificamente para esta familia. El entrenamiento puso enfasis en lenguas de recursos medios y bajos, lo que explica su amplia cobertura multilingue.

El modelo base (codefuse-ai/F2LLM-v2-330M) fue entrenado por CodeFuse, un equipo de Alibaba, y la version GGUF aqui presentada es una conversion directa sin modificaciones en los pesos. No se han publicado detalles sobre tecnicas de entrenamiento como RLHF, DPO o metodos de regularizacion especificos.

## Capacidades

- Generacion de embeddings de texto para representacion semantica densa.
- Busqueda semantica multilingue: permite recuperar documentos relevantes en mas de 200 idiomas.
- Similitud coseno entre frases o documentos para tareas de comparacion.
- Extraccion de caracteristicas (feature extraction) para pipelines de clasificacion o agrupamiento.
- Soporte para tareas de recuperacion cruzada entre idiomas (cross-lingual retrieval).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Busqueda semantica en bases de conocimiento multilingues: el modelo puede indexar documentos en varios idiomas y recuperar los mas relevantes para una consulta, gracias a su soporte de mas de 200 lenguas.
- Clasificacion de textos por tematica o sentimiento: al generar embeddings, se pueden entrenar clasificadores ligeros sobre las representaciones obtenidas, utiles para analisis de opiniones en redes sociales o encuestas.
- Deduplicacion de documentos: comparando embeddings de pares de textos se pueden identificar duplicados o versiones casi identicas en grandes corpus multilingues.
- Sistemas de recomendacion basados en contenido: representando items (articulos, productos, noticias) como vectores, se pueden calcular similitudes para sugerir contenido relacionado.
- Agrupamiento (clustering) de documentos: los embeddings permiten agrupar textos por temas sin supervisión, util para organizar archivos o categorizar tickets de soporte.
- Enriquecimiento de pipelines de RAG (Retrieval-Augmented Generation): aunque el modelo no genera texto, puede servir como componente de recuperacion para alimentar a un LLM generativo con contexto relevante en multiples idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar, ya que este modelo no esta disenado para tareas generativas sino para embeddings. Se recomienda consultar la model card del modelo base (codefuse-ai/F2LLM-v2-330M) para posibles evaluaciones de calidad de embeddings, aunque no se han incluido en la documentacion revisada.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 330M en cuantizacion Q4_K_M, el archivo GGUF ocupa aproximadamente 0.3 GB, por lo que puede ejecutarse en CPU sin necesidad de GPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo GPUs integradas o tarjetas antiguas. No requiere hardware especializado.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU moderna de consumo (por ejemplo, RTX 3060 o superior) e incluso en CPU pura.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama, llama-cpp-python, o cualquier framework compatible con GGUF.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo pequeno, la generacion de embeddings es rapida incluso en CPU (del orden de milisegundos por texto corto).

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de embeddings multilingues del mismo tamano. Se podria comparar con modelos como `multilingual-e5-small` (118M) o `bge-small-en-v1.5` (33M), pero no se tienen datos de rendimiento de F2LLM-v2-330M en benchmarks estandar de embeddings (como MTEB) en la informacion proporcionada. Por tanto, la comparativa queda pendiente de datos publicados.

## Limitaciones y advertencias

- Es un modelo de embeddings, no un LLM generativo: no puede completar texto, responder preguntas ni mantener conversaciones.
- No se dispone de informacion sobre sesgos potenciales o riesgos de alucinacion, al no ser un modelo generativo.
- La longitud de contexto no esta documentada, por lo que se recomienda probar con textos cortos o medios (menos de 512 tokens) para evitar degradacion.
- Aunque soporta mas de 200 idiomas, la calidad puede variar significativamente entre lenguas de altos y bajos recursos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los terminos del modelo base por si hubiera condiciones adicionales.
- La cuantizacion Q4_K_M puede introducir una ligera perdida de precision en los embeddings comparada con el modelo en punto flotante, aunque suele ser aceptable para la mayoria de casos.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/yeahbeen/F2LLM-v2-330M-Q4_K_M-GGUF
- Modelo base original: https://huggingface.co/codefuse-ai/F2LLM-v2-330M
- Repositorio de la familia F2LLM en GitHub: https://github.com/Geralt-Targaryen/CodeFuse-Embeddings-260305/tree/main/F2LLM
- Herramienta de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
