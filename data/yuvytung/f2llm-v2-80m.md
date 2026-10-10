# yuvytung/F2LLM-v2-80M

## Resumen

F2LLM-v2-80M es el miembro mas pequeno de la familia F2LLM-v2, un conjunto de modelos de embeddings (representaciones vectoriales densas) multilingues desarrollado por CodeFuse (codefuse-ai). La familia completa se compone de 8 tamanos que van de 80 millones a 14.000 millones de parametros, entrenados sobre una mezcla curada de 60 millones de muestras de datos publicos de alta calidad, con soporte declarado para mas de 200 idiomas y especial enfasis en idiomas de recursos medios y bajos habitualmente desatendidos.

La ficha que nos ocupa, `yuvytung/F2LLM-v2-80M`, no es el modelo original de CodeFuse, sino una conversion a formato GGUF realizada por el usuario yuvytung con la herramienta Unsloth, partiendo de los pesos oficiales. El modelo tiene 80.084.288 parametros (coincide exactamente con `codefuse-ai/F2LLM-v2-80M`) y su arquitectura base esta vinculada a la familia Qwen3, segun las etiquetas del repositorio.

Es relevante en el ecosistema open source porque permite ejecutar un modelo de embeddings multilingue de forma local y muy ligera (menos de 1 GB de repositorio, cuantizaciones desde Q2 hasta BF16), lo que facilita su uso en recuperacion semantica, busqueda vectorial y pipelines RAG sin depender de APIs externas. Conviene advertir, no obstante, que la model card de esta conversion describe un uso conversacional que entra en conflicto con la naturaleza del modelo original (un encoder de embeddings), una discrepancia que se detalla en las limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base vinculada a Qwen3, segun etiquetas del repo); uso previsto como modelo de embeddings / recuperacion densa |
| Parametros totales | 80.084.288 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q2_K_L, Q3_K_M, Q4_0, Q4_1, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | mas de 200 idiomas segun el modelo base F2LLM-v2 (dato de la familia, no confirmado en esta ficha) |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversion del original safetensors) |

## Arquitectura y entrenamiento

F2LLM-v2 es una familia de modelos de embeddings de proposito general y multilingues. Segun la documentacion del modelo base, el entrenamiento se apoya en un proceso de dos etapas basado en LLM ("two-stage LLM-based"), sobre un corpus compuesto de 60 millones de muestras de datos publicos de alta calidad. La familia cubre 8 tamanos entre 80M y 14B parametros. Para el miembro de 80M, la arquitectura subyacente esta vinculada a Qwen3, segun las etiquetas del repositorio, y el numero exacto de parametros (80.084.288) coincide con el del modelo oficial de CodeFuse.

Esta conversion concreta fue generada con Unsloth a partir de los pesos originales. No se especifican en la informacion disponible ni el numero exacto de tokens de entrenamiento, ni la composicion detallada del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si emplea decodificacion especulativa, atencion lineal u otras innovaciones. Toda esa informacion podria encontrarse en el paper asociado (arXiv 2603.19223), pero no se ha incluido en los datos proporcionados.

## Capacidades

- Generacion de representaciones vectoriales (embeddings) para texto, orientadas a recuperacion semantica y similitud.
- Soporte multilingue amplio: mas de 200 idiomas segun el modelo base, con enfasis en idiomas de recursos medios y bajos.
- Uso previsto en tareas de retrieval, clustering y clasificacion por similitud coseno.
- La model card de esta conversion describe un uso conversacional con `llama-cli --jinja`, pero esto contradice la funcion declarada del modelo base (embeddings), por lo que no debe asumirse como capacidad fiable.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo "thinking": no disponible.

## Casos de uso

- Busqueda semantica local: indexar un corpus de documentos en una base vectorial y recuperar los fragmentos mas relevantes ante una consulta en lenguaje natural, gracias al soporte multilingue y al reducido tamano del modelo.
- Pipelines RAG (generacion aumentada por recuperacion): usar el modelo como componente de recuperacion en aplicaciones que combinan un LLM generativo con una base de conocimiento, ejecutandolo en local para evitar costes de API.
- Deduplicacion y clustering de textos: agrupar documentos, tickets o articulos similares calculando distancias entre embeddings, util en curacion de datasets y en analisis de contenido.
- Clasificacion por similitud: asignar categorias a textos comparando su embedding con el de ejemplos etiquetados, sin necesidad de reentrenar un clasificador dedicado.
- Busqueda multilingue entre idiomas: recuperar documentos escritos en un idioma distinto al de la consulta, aprovechando la cobertura de mas de 200 idiomas del modelo base.
- Moderacion y filtrado: detectar contenido cercano a patrones conocidos mediante similitud vectorial en entornos con recursos limitados.
- Despliegue en dispositivos de borde: al tratarse de un modelo de 80M parametros, puede ejecutarse en CPU, en moviles o en dispositivos tipo Raspberry Pi para tareas de recuperacion offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion concreta. El paper del modelo base (arXiv 2603.19223) previsiblemente incluye metricas de la familia F2LLM-v2, pero los valores numericos no se han facilitado en los datos de esta ficha, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM estimada de inferencia (solo pesos, sin overhead): aproximadamente 160 MB en BF16/F16, unos 85 MB en Q8_0, alrededor de 45-50 MB en Q4_K_M y unos 30 MB en Q2_K_L.
- GPU recomendadas: cualquier GPU, incluso modesta, es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, una iGPU o incluso CPU dedicada bastan.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e integrada.
- Opciones de despliegue: llama.cpp (via `llama-cli`, `llama-mtmd-cli` u otras utilidades), Ollama y cualquier runtime compatible con GGUF. Tambien admite el formato original safetensors con frameworks como sentence-transformers sobre los pesos oficiales.
- Latencia y throughput estimados: no disponibles. Por el reducido tamano del modelo se espera baja latencia, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| F2LLM-v2-80M (esta conversion) | ~80M | no disponible | Embeddings multilingues (200+ idiomas) | no disponible | GGUF (HuggingFace) |
| codefuse-ai/F2LLM-v2-80M (original) | ~80M | no disponible | Embeddings multilingues (200+ idiomas) | no disponible | safetensors (HuggingFace) |
| Modelos de embeddings multilingues de ~100M (p. ej. multilingual-e5-small) | ~118M | no disponible en esta ficha | Embeddings multilingues | no disponible en esta ficha | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Discrepancia de proposito: el modelo base F2LLM-v2 es un modelo de embeddings, pero la model card de esta conversion sugiere un uso conversacional con `llama-cli`. Esta contradiccion debe tratarse con cautela; usar un encoder de embeddings como modelo de chat probablemente no produzca resultados utiles.
- Licencia no especificada: no se indica la licencia en la informacion disponible, lo que impide confirmar si se permite el uso comercial. Conviene verificar la licencia del repositorio oficial de CodeFuse antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no aplica de forma directa si se usa como modelo de embeddings; si se emplea como generador de texto, el riesgo es alto por su naturaleza y tamano reducidos.
- Cobertura de idiomas: aunque el modelo base declara mas de 200 idiomas, el rendimiento real por idioma no esta cuantificado en esta ficha; los idiomas de bajos recursos pueden tener menor calidad.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, un dato critico para fijar el tamano de los fragmentos en pipelines de retrieval.
- Parametros limitados: con 80M de parametros, la capacidad de representacion es inferior a la de miembros mayores de la familia (hasta 14B), lo que puede traducirse en menor precision en tareas complejas.
- Repositorio sin traccion: 0 descargas y 0 "likes" en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fecha de publicacion inusual (2026-10-10): conviene verificar la integridad y el origen de los pesos antes de usarlos.

## Enlaces

- Conversion GGUF: https://huggingface.co/yuvytung/F2LLM-v2-80M
- Modelo base F2LLM-v2-80M (CodeFuse): https://huggingface.co/codefuse-ai/F2LLM-v2-80M
- Modelo F2LLM-v2-1.7B (CodeFuse): https://huggingface.co/codefuse-ai/F2LLM-v2-1.7B
- ModelScope (F2LLM-v2-80M): https://www.modelscope.cn/models/codefuse-ai/F2LLM-v2-80M
- Paper (arXiv, abstract): https://arxiv.org/abs/2603.19223
- Paper (arXiv, HTML): https://arxiv.org/html/2603.19223
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
