# Supernova11c/Supernova-teraillm-Embedding-V3

## Resumen

Supernova TeraLLM Embedding V3 es un modelo de embeddings ligeros desarrollado por Supernova11c como parte del proyecto de investigación Supernova TeraLLM, orientado a la recuperación semántica y el procesamiento de lenguaje en nepalí e inglés. Con solo 3.629.698 parámetros, está diseñado para experimentos de recuperación semántica y aplicaciones donde se requiera un modelo de bajo coste computacional. La arquitectura, denominada "Supernova V3", se describe como una tercera generación que emplea una "representación semántica alternativa", aunque no se ofrecen detalles técnicos adicionales. Este modelo se presenta como una alternativa ligera dentro de la familia Supernova Embedding, que incluye versiones V1, V2, V3 y V4 con distintos roles. Es relevante en el contexto actual de sistemas RAG y búsqueda semántica, especialmente para lenguas de baja representación como el nepalí, donde existen pocos modelos específicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Supernova V3 (representación semántica alternativa) |
| Parametros totales | 3.629.698 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también se referencia pytorch_model.bin en el ejemplo de carga) |

## Arquitectura y entrenamiento

La arquitectura se describe únicamente como "Supernova V3", una tercera generación dentro de la familia de embeddings Supernova. La model card indica que esta versión emplea una "representación semántica alternativa" en comparación con V1 y V2, sin mayores especificaciones sobre el tipo de red neuronal (transformer, MLP, etc.). El entrenamiento se realizó como parte del proyecto de investigación Supernova TeraLLM, pero no se proporcionan datos sobre el corpus de entrenamiento, número de tokens, ni técnicas como RLHF o DPO. La evaluación mencionada en la documentación incluye métricas como Recall@1, Recall@3, Recall@5, MRR, pruebas con datos no vistos y comparación con Sentence Transformers, aunque no se publican los resultados numéricos.

## Capacidades

- Generación de embeddings para representación semántica de texto.
- Búsqueda semántica y recuperación de información en nepalí e inglés.
- Matching de documentos y detección de similitud entre textos.
- Uso como componente de retrieval-augmented generation (RAG) para recuperar pasajes relevantes.
- Soporte de tareas de feature-extraction (pipeline de Hugging Face).
- Ligero y adecuado para experimentos de bajo coste computacional.

No se mencionan capacidades de generación de texto, tool calling, agentes ni procesamiento multimodal.

## Casos de uso

- **Búsqueda semántica en nepalí**: el modelo puede indexar documentos en nepalí y recuperar los más relevantes según una consulta, útil para motores de búsqueda locales o intranets.
- **Sistema de preguntas y respuestas con RAG**: al generar embeddings de documentos y consultas, permite construir pipelines de RAG para responder preguntas sobre un corpus en nepalí o inglés.
- **Deduplicación de documentos**: se puede usar para detectar documentos duplicados o muy similares comparando la similitud coseno de sus embeddings.
- **Clasificación de textos por similitud**: agrupando documentos por similitud semántica, se puede organizar colecciones de artículos o noticias.
- **Recomendación de contenidos**: dado un texto de interés, se pueden sugerir otros documentos semánticamente relacionados.
- **Experimentación en investigación**: por su tamaño reducido y licencia Apache-2.0, es adecuado para probar técnicas de recuperación en entornos académicos o como punto de partida para modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se evaluaron métricas como Recall@1, Recall@3, Recall@5 y MRR, pero no se proporcionan valores numéricos ni comparativas con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 3,6 M de parámetros, la inferencia puede realizarse en CPU sin necesidad de GPU. El uso de memoria es inferior a 100 MB en FP32 (aprox. 14 MB), por lo que cabe en cualquier dispositivo, incluso en móviles.
- **GPU recomendadas**: no se requiere GPU para inferencia; cualquier GPU con más de 1 GB de VRAM sería suficiente si se desea aceleración.
- **Compatibilidad con consumer GPU**: sí, incluso en GPUs integradas o CPU.
- **Opciones de despliegue**: se puede cargar con PyTorch y ejecutar en CPU; no se menciona soporte para vLLM, llama.cpp u Ollama. Para producción, se podría exportar a ONNX o usar Sentence Transformers si se adapta, aunque no está documentado.
- **Latencia y throughput**: no disponible; al ser tan pequeño, la latencia es mínima, pero no hay datos oficiales.

## Comparativa con modelos similares

No hay información suficiente para comparar con otros modelos de embeddings específicos para nepalí. Se puede indicar que, por su tamaño, es comparable a modelos como `all-MiniLM-L6-v2` (22 M parámetros) pero con un enfoque en nepalí, aunque no hay datos de rendimiento para realizar una comparación objetiva. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- **Modelo de investigación**: la model card lo califica como "research model", por lo que no está garantizada su fiabilidad en producción.
- **Cobertura limitada**: el rendimiento puede variar según el dataset, dominio, cobertura del tokenizer y estilo de consulta; se recomienda evaluar sobre datos propios.
- **Idiomas restringidos**: solo soporta nepalí e inglés, no cubre otros idiomas.
- **Sin datos de evaluación**: no hay benchmarks públicos que demuestren su calidad frente a otros modelos.
- **Riesgo de alucinación**: al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación no aplica directamente, pero la calidad de los embeddings puede ser inconsistente en dominios no cubiertos.
- **Licencia Apache-2.0**: permite uso comercial, pero hay que cumplir con la atribución de la licencia.

## Enlaces

- Modelo en Hugging Face: [Supernova11c/Supernova-teraillm-Embedding-V3](https://huggingface.co/Supernova11c/Supernova-teraillm-Embedding-V3)
- Repositorio del proyecto (sin contenido adicional): [Supernova11c/Supernova-llm-terai](https://huggingface.co/Supernova11c/Supernova-llm-terai)
- Dataset asociado: [Supernova11c/Supernova-teraillm](https://huggingface.co/datasets/Supernova11c/Supernova-teraillm)
