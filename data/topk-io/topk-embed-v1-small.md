# topk-io/topk-embed-v1-small

## Resumen

topk-embed-v1-small es un recuperador (retriever) multimodal de 2,2 mil millones de parámetros desarrollado por topk-io. A diferencia de los modelos de embeddings que comprimen cada entrada en un único vector, este modelo conserva múltiples embeddings por token de texto o parche de imagen y aplica una puntuación de *late interaction* mediante MaxSim: cada vector de la consulta se empareja con su vector más similar del documento y las similitudes se suman. Esto permite lanzar consultas de texto y recuperar tanto documentos de texto como imágenes (páginas escaneadas, informes, diapositivas).

El modelo parte de Qwen/Qwen3.5-2B y se publica bajo licencia Apache 2.0, con pesos en safetensors y soporte nativo en la librería sentence-transformers mediante la clase MultiVectorEncoder y `trust_remote_code=True`. Cubre 14 idiomas (entre ellos español, inglés, alemán, francés, chino, japonés y coreano) y está pensado para pipelines de búsqueda y RAG sobre corpus heterogéneos de texto e imagen.

Su relevancia actual radica en que traslada el paradigma de late interaction (estilo ColBERT) al terreno multimodal sobre una base de modelo de visión-lenguaje compacta, lo que abarata el despliegue frente a recuperadores multimodales de mayor tamaño. El repositorio acumula 1.914 descargas y 10 me gusta desde su publicación, y requiere una GPU CUDA con soporte de bfloat16 (Ampere o posterior).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Recuperador multimodal de late interaction sobre una base transformer visión-lenguaje (Qwen/Qwen3.5-2B); embeddings multi-vector con puntuación MaxSim |
| Parámetros totales | 2.217.435.968 (aproximadamente 2,2 B) |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio distribuye pesos en safetensors) |
| Idiomas soportados | en, ru, fr, nl, de, es, it, pt, da, no, sv, zh, ja, ko (14 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (código personalizado, `custom_code`) |

Otros datos del repositorio: pipeline `feature-extraction`, etiquetas `sentence-transformers`, `multi-vector`, `retrieval`, `late-interaction`, `image-text-to-text`; tamaño del repositorio 4,5 GB; compatible con endpoints; región `us`.

## Arquitectura y entrenamiento

La arquitectura es un *retriever* multimodal de interacción tardía: en lugar de producir un único vector por documento, el modelo emite una matriz de embeddings (uno por token de texto o por parche de imagen). La recuperación se resuelve con MaxSim, es decir, para cada vector de la consulta se busca el vector más afín del documento y se suman esas similitudes; una puntuación mayor indica mayor relevancia. El modelo se apoya en Qwen/Qwen3.5-2B, un modelo base visión-lenguaje, sobre el que se ha realizado un ajuste fino específico para la tarea de recuperación (`base_model:finetune:Qwen/Qwen3.5-2B`).

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de alineación como RLHF o DPO; esa información no está disponible. La innovación destacable es la combinación de consultas de texto con recuperación sobre documentos de texto e imágenes dentro del mismo espacio de puntuación, además de la integración con sentence-transformers a través de una clase específica (`MultiVectorEncoder`) con métodos diferenciados `encode_query` y `encode_document`.

## Capacidades

- Recuperación texto a texto: genera embeddings multi-vector de consultas y documentos de texto y los puntúa con MaxSim.
- Recuperación texto a imagen: indexa imágenes (páginas escaneadas, informes, diapositivas) y las recupera mediante consultas textuales.
- Codificación multimodal: `encode_document` acepta tanto cadenas de texto como objetos PIL `Image` en RGB, procesados en lotes separados.
- Puntuación de similitud: el método `similarity` devuelve una matriz con una fila por consulta y una columna por documento.
- Cobertura multilingüe en 14 idiomas, incluidos español, portugués, italiano, neerlandés y lenguas nórdicas, además de chino, japonés y coreano.
- Integración con sentence-transformers y carga mediante código personalizado (`trust_remote_code=True`).
- Compatibilidad declarada con endpoints de HuggingFace.
- No es un modelo generativo: no produce texto ni respuestas; su salida son representaciones vectoriales y puntuaciones de relevancia.
- Soporte de *tool calling*, agentes y razonamiento multi-paso: no disponible (no es una capacidad de este tipo de modelo).

## Casos de uso

- Búsqueda documental empresarial sobre corpus mixtos: se indexan informes en PDF, páginas escaneadas y diapositivas como imágenes, y el usuario consulta en lenguaje natural; el modelo recupera la página concreta gracias a la puntuación MaxSim sobre parches de imagen.
- RAG multimodal en asistentes internos: las respuestas se generan con un LLM a partir de los fragmentos recuperados por topk-embed-v1-small, lo que permite fundamentar respuestas en tablas y gráficos que un recuperador solo de texto no alcanzaría.
- Recuperación de contexto largo en atención al cliente: se indexa la base de conocimiento (FAQ, manuales, capturas) y se recuperan los pasajes relevantes para cada consulta antes de pasarlos al modelo generativo.
- Due diligence y revisión contractual: consultas del tipo "¿cuál fue el ingreso del tercer trimestre?" recuperan directamente el fragmento o la imagen de la página donde aparece la cifra, reduciendo el tiempo de revisión manual.
- Búsqueda en catálogos técnicos y fichas de producto: los diagramas e imágenes de especificaciones se indexan como parches y se recuperan mediante consultas textuales descriptivas.
- Construcción de índices de investigación multilingüe: al cubrir 14 idiomas, permite consultar en español o inglés sobre documentación en alemán, chino o japonés sin duplicar el índice por idioma.
- Filtrado y deduplicación semántica de grandes repositorios: las representaciones multi-vector permiten ordenar candidatos con mayor granularidad que un embedding único, útil en pipelines de curación de datos.
- Recuperación aumentada en herramientas internas de desarrolladores: se conecta con motores de inferencia como SIE (Superlinked Inference Engine), que declara soporte para los modelos TopK-Embed-V1, para servir el índice en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (por ejemplo nDCG, Recall@k, MRR) ni comparaciones cuantitativas con otros recuperadores, y los resultados de búsqueda web consultados tampoco aportan cifras verificables.

## Requisitos de hardware

- Requisito declarado por el autor: GPU CUDA con soporte de bfloat16 (arquitectura Ampere o posterior). No funciona en CPU según las instrucciones de uso publicadas.
- VRAM estimada para los pesos: aproximadamente 4,4 GB en bfloat16, calculados a partir de los 2,2 mil millones de parámetros; hay que sumar activaciones, el codificador de imagen y la memoria del lote.
- Estimación orientativa: con 8-12 GB de VRAM debería ser suficiente para inferencia en bfloat16 con lotes pequeños, aunque el autor no publica cifras oficiales de consumo.
- GPU recomendadas: NVIDIA A100, H100, L40S, RTX 3090, RTX 4090 y cualquier GPU Ampere o posterior con al menos 8-12 GB. Cabe en GPU de consumo con 12 GB o más.
- Índice en disco: al tratarse de multi-vector, cada documento ocupa tantos vectores como tokens o parches tenga, por lo que el almacenamiento del índice es muy superior al de un modelo de vector único. No se dispone de cifras concretas de dimensionalidad ni de tamaño por documento.
- Opciones de despliegue: sentence-transformers con `MultiVectorEncoder` y `trust_remote_code=True`; el motor SIE (Superlinked Inference Engine) declara soporte para los modelos TopK-Embed-V1. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos comparativos con otros modelos. No se dispone de cifras verificables de parámetros, contexto, licencia o rendimiento de alternativas, por lo que la comparación cuantitativa se marca como no disponible.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| topk-embed-v1-small | Recuperador multimodal de late interaction | 2,2 B | no disponible | Apache 2.0 | HuggingFace, pesos safetensors |
| Alternativas de la misma categoría (recuperadores de late interaction, por ejemplo de la familia ColBERT y sus variantes multimodales) | Recuperación multi-vector | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no puede responder preguntas ni redactar texto; solo produce embeddings y puntuaciones de similitud.
- Riesgo de falsos positivos en la recuperación: MaxSim maximiza la coincidencia local token a token, lo que puede favorecer documentos con fragmentos superficialmente similares aunque el contexto global no sea relevante.
- El coste de almacenamiento y de cómputo del índice es elevado en comparación con los modelos de vector único, ya que se conserva un vector por token o parche.
- No se documenta la longitud de contexto soportada; en documentos muy largos o imágenes de alta resolución el comportamiento no está especificado.
- El rendimiento por idioma no está cuantificado: aunque se declaran 14 idiomas, no hay métricas que confirmen una calidad homogénea entre ellos.
- Sesgos conocidos: no disponible. Al derivar de Qwen/Qwen3.5-2B, el modelo puede heredar sesgos presentes en los datos de entrenamiento de ese modelo base, pero no se aporta documentación al respecto.
- Licencia Apache 2.0: permite uso comercial y modificación, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe. No se declaran restricciones adicionales.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene revisarlo antes de desplegarlo en producción.
- Dependencia de hardware: exige GPU CUDA con bfloat16; no se documenta ruta de inferencia en CPU.
- No se han publicado evaluaciones independientes ni tarjetas de datos sobre composición del corpus de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/topk-io/topk-embed-v1-small
- Sitio del desarrollador (TopK): https://topk.io
- Noticia sobre el lanzamiento de la familia topk-embed-v1: https://digg.com/ai/hpnum6wi
- Superlinked Inference Engine (SIE), motor que declara soporte para los modelos TopK-Embed-V1: https://github.com/superlinked/sie
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Documentación de sentence-transformers (librería de carga): https://sbert.net
