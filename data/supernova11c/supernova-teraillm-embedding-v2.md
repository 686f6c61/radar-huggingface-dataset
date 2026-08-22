# Supernova11c/Supernova-teraillm-Embedding-V2

## Resumen

Supernova-teraillm-Embedding-V2 es un modelo de embeddings para búsqueda semántica desarrollado por Supernova11c como parte del proyecto de investigación Supernova TeraLLM. Está diseñado para ser ligero y especializado en la recuperación de información en nepalí e inglés, con un tamaño de solo 6.978.688 parámetros, lo que lo convierte en una opción adecuada para experimentos y aplicaciones con recursos limitados. La arquitectura, denominada "Supernova V2", es una segunda generación de la familia Supernova Embedding, orientada a una recuperación semántica más fuerte que su predecesora.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para tareas como búsqueda semántica, recuperación de documentos y generación aumentada por recuperación (RAG), especialmente en el dominio del nepalí, un idioma con escasos recursos en el ecosistema de modelos de lenguaje. Su tamaño compacto permite ejecutarlo en CPU sin necesidad de GPU, lo que facilita su integración en entornos de producción con infraestructura modesta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Supernova V2 (arquitectura propia, no se detallan capas ni tipo) |
| Parametros totales | 6.978.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos completos en safetensors) |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (y pytorch_model.bin en el ejemplo de uso) |

## Arquitectura y entrenamiento

No se han publicado detalles técnicos sobre la arquitectura interna del modelo, como el número de capas, la dimensionalidad de los embeddings o el tipo de atención (transformer, etc.). Se sabe que es una arquitectura ligera denominada "Supernova V2", diseñada específicamente para la recuperación semántica, y que pertenece a una familia de modelos (V1 a V4) con distintos perfiles de equilibrio entre velocidad y calidad.

En cuanto al entrenamiento, el model card indica que se realizó dentro del proyecto de investigación Supernova TeraLLM, pero no se proporciona información sobre el conjunto de datos, el número de tokens, la composición del corpus o si se emplearon técnicas como RLHF o DPO. El proceso de evaluación descrito incluye métricas de recuperación (Recall@1, Recall@3, Recall@5, MRR) y pruebas de velocidad, comparando con Sentence Transformers, aunque no se han publicado los resultados concretos.

## Capacidades

- Búsqueda semántica y recuperación de información en nepalí e inglés.
- Generación de embeddings para documentos y consultas, aptos para sistemas de búsqueda vectorial.
- Soporte para retrieval-augmented generation (RAG) al poder generar representaciones densas de pasajes.
- Capacidad para emparejamiento de documentos (document matching) y clasificación de similitud.
- Modelo ligero, adecuado para experimentos de embeddings en entornos con recursos limitados.
- No se ha documentado soporte para tool calling, agentes o razonamiento multi-paso, ya que es un modelo de embeddings puro.

## Casos de uso

- Búsqueda semántica en nepalí: el modelo permite indexar y buscar documentos en nepalí de forma semántica, superando las limitaciones de búsqueda por palabras clave en este idioma con poca representación en modelos generales.
- Recuperación de información en RAG: integrar este modelo en un pipeline de RAG para corpus de documentos en nepalí e inglés, generando embeddings para el índice y las consultas, con un coste computacional mínimo.
- Emparejamiento de documentos legales o administrativos: comparar y agrupar documentos similares en nepalí, útil para procesos de revisión documental.
- Clasificación de textos por similitud: generar embeddings para clasificar noticias o artículos por temas, sin necesidad de entrenar un clasificador complejo.
- Búsqueda en bases de conocimiento multilingüe: combinar con un índice vectorial para buscar en documentos que mezclan nepalí e inglés.
- Prototipos de búsqueda en dispositivos embebidos: su tamaño reducido permite ejecutarlo en Raspberry Pi o en aplicaciones móviles para búsqueda local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card menciona que se evaluó con Recall@1, Recall@3, Recall@5 y MRR, así como pruebas de velocidad y comparación contra Sentence Transformers, pero no se proporcionan los valores concretos. No se dispone de datos numéricos de rendimiento para comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU, puede ejecutarse en CPU con menos de 1 GB de RAM adicional.
- GPU recomendada: ninguna en particular; cualquier CPU moderna es suficiente.
- Compatibilidad con consumer GPU: no es necesario, pero si se usa GPU, cabe en cualquier GPU con más de 512 MB de VRAM.
- Opciones de despliegue: se puede cargar con PyTorch y Hugging Face Transformers. También es compatible con frameworks de embeddings como Sentence Transformers (si se convierte el formato) o para despliegue en servidores con vLLM o TGI si se adapta, aunque al ser un modelo pequeño no se requiere un servidor dedicado.
- Latencia y throughput: no se han publicado estimaciones, pero con ~7 millones de parámetros la latencia es de unos pocos milisegundos por inferencia en CPU.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoría (embeddings ligeros para nepalí) en la información proporcionada. Existen otros modelos de embeddings multilingües como `paraphrase-multilingual-MiniLM-L12-v2` (que soporta 50+ idiomas) o `LaBSE` (109 idiomas), pero ambos tienen más parámetros (unos 118M y 470M respectivamente) y no están especializados en nepalí. La comparación directa no es posible sin datos de rendimiento del Supernova V2. Se recomienda evaluar el modelo con el propio corpus para decidir su idoneidad.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica que es un modelo experimental y que su rendimiento puede variar según el dataset, el dominio, la cobertura del tokenizador y el estilo de las consultas.
- Sesgos y cobertura limitada: el tokenizador puede no cubrir adecuadamente todos los dialectos o variantes del nepalí, lo que puede afectar la calidad de los embeddings en textos fuera del dominio de entrenamiento.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que no hay riesgo de alucinación textual, pero sí puede producir representaciones que no reflejen correctamente el significado semántico en casos de out-of-domain.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo no tiene garantías de calidad para producción.
- No se proporcionan detalles sobre el dataset de entrenamiento ni sobre la metodología de evaluación, lo que dificulta la reproducibilidad y la confianza en los resultados.
- No se ha verificado su rendimiento en aplicaciones de producción; se recomienda validarlo con datos propios antes de desplegarlo en un entorno real.

## Enlaces

- Modelo: https://huggingface.co/Supernova11c/Supernova-teraillm-Embedding-V2
- Dataset del proyecto: https://huggingface.co/datasets/Supernova11c/Supernova-teraillm
