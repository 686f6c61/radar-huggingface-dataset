# Supernova11c/Supernova-teraillm-Embedding-V4

## Resumen

Supernova-teraillm-Embedding-V4 es un modelo de embeddings ligeros desarrollado por el usuario Supernova11c como parte del proyecto de investigación Supernova TeraLLM, centrado en la recuperación semántica para el idioma nepalí y, de forma secundaria, inglés. Se trata de un modelo de recuperación de alta velocidad y bajo coste computacional, pensado para experimentos de búsqueda semántica y sistemas de retrieval-augmented generation (RAG) en contextos con recursos limitados.

El modelo presenta una arquitectura propietaria denominada "Supernova V4", con un total de 3.635.328 parámetros, lo que lo convierte en una opción extremadamente ligera dentro de la familia de embeddings. La model card del autor no especifica la longitud de contexto soportada, el formato de pesos más allá de safetensors, ni los detalles de entrenamiento, aunque sí indica que forma parte de una serie de modelos (V1 a V4) con distintos objetivos de equilibrio entre rendimiento y velocidad.

La relevancia actual del modelo reside en su enfoque específico para el nepalí, un idioma poco cubierto por los modelos de embeddings comerciales, y en su licencia Apache 2.0, que permite uso comercial sin restricciones. No obstante, se trata de un modelo de investigación sin benchmarks públicos publicados, por lo que su adopción en producción requiere una evaluación previa sobre datos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Supernova V4 (arquitectura propietaria de embeddings) |
| Parámetros totales | 3.635.328 |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | nepalí (ne), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch_model.bin) |

## Arquitectura y entrenamiento

La arquitectura se describe como "Supernova V4", una arquitectura de embeddings ligera diseñada para recuperación semántica rápida. La model card no detalla si se trata de un transformer, un modelo MoE o una arquitectura alternativa, ni especifica el tipo de tokenizador utilizado. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

El entrenamiento se realizó como parte del proyecto de investigación Supernova de recuperación semántica, e incluye un proceso de evaluación que contempla métricas como Recall@1, Recall@3, Recall@5, MRR, evaluación sobre datos no vistos, pruebas de velocidad y comparación con modelos de Sentence Transformers. Sin embargo, no se han publicado los resultados numéricos de estas evaluaciones en la documentación disponible.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica en nepalí e inglés.
- Recuperación de documentos y pasajes mediante similitud vectorial.
- Soporte para retrieval-augmented generation (RAG) como componente de indexación y recuperación.
- Matching de documentos y detección de similitud entre textos.
- Diseñado para alta velocidad de inferencia, con un coste computacional mínimo (3,6 M de parámetros).
- No incluye capacidades de tool calling, razonamiento multi-paso, generación de texto, visión ni audio, ya que se trata exclusivamente de un modelo de embeddings.

## Casos de uso

- Búsqueda semántica en nepalí: el modelo puede indexar documentos en nepalí y recuperar los resultados más relevantes a partir de consultas en ese idioma, algo que los modelos comerciales cubren de forma limitada.
- Sistema RAG en entornos de bajos recursos: al ser un modelo de 3,6 M de parámetros, puede desplegarse en CPU o en hardware modesto para construir pipelines de retrieval-augmented generation sobre corpus nepalíes o mixtos.
- Matching de documentos para archivos históricos o bibliotecas digitales: permite identificar duplicados o documentos relacionados en colecciones de texto en nepalí e inglés, facilitando la organización de archivos.
- Experimentación académica en recuperación de información: su tamaño reducido lo hace adecuado para que investigadores comparen arquitecturas de embeddings ligeras frente a modelos más grandes como Sentence Transformers.
- Clasificación de texto por similitud semántica: puede usarse para agrupar documentos por temas o para recomendar contenido relacionado en plataformas de noticias o foros en nepalí.
- Indexación de conocimiento interno en empresas con operaciones en Nepal: permite construir índices vectoriales para bases de conocimiento de atención al cliente o documentación técnica en inglés y nepalí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un proceso de evaluación que incluye Recall@1, Recall@3, Recall@5 y MRR, además de pruebas de velocidad y comparación con Sentence Transformers, pero no se proporcionan los valores numéricos obtenidos. No se puede realizar una comparación cuantitativa con otros modelos de embeddings sin estos datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 14,5 MB en fp32 (3.635.328 parámetros × 4 bytes), por lo que cabe en cualquier GPU, incluso en las integradas. En fp16, el peso ocupa alrededor de 7,3 MB.
- GPU recomendadas: no requiere GPU dedicada; funciona correctamente en CPU. Si se usa GPU, cualquier modelo moderno (desde GTX 1650 hasta RTX 4090) es más que suficiente.
- Es compatible con hardware de consumo: sí, se puede ejecutar en cualquier portátil o mini-PC sin problemas.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors, puede integrarse en frameworks de inferencia de embeddings como Sentence Transformers (si se adapta), o directamente con PyTorch. No se menciona soporte explícito para vLLM, llama.cpp, Ollama o TGI, dado que no es un modelo generativo.
- Latencia y throughput estimados: no disponible en la documentación; al ser un modelo tan pequeño, se espera una latencia muy baja (del orden de milisegundos en CPU), pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo Supernova-teraillm-Embedding-V4, por lo que no es posible realizar una comparación cuantitativa. No obstante, a nivel de especificaciones, se puede contrastar con otros modelos de embeddings pequeños conocidos:

| Modelo | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| Supernova-teraillm-Embedding-V4 | 3,6 M | no disponible | ne, en | Apache 2.0 |
| all-MiniLM-L6-v2 | 22,7 M | 256 tokens | en | Apache 2.0 |
| bge-small-en-v1.5 | 33,4 M | 512 tokens | en | MIT |
| multilingual-e5-small | 118 M | 512 tokens | 100+ | MIT |

La comparativa directa no es posible sin datos de rendimiento, pero el modelo Supernova es notablemente más ligero que estas alternativas, lo que puede traducirse en menor latencia a costa de un rendimiento probablemente inferior en tareas de recuperación semántica en inglés.

## Limitaciones y advertencias

- Modelo de investigación: la model card indica explícitamente que es un modelo de investigación, no un producto listo para producción sin validación previa.
- Sin benchmarks públicos: no se han publicado resultados de evaluación, por lo que no se puede conocer su rendimiento real frente a alternativas.
- Cobertura limitada de idiomas: solo soporta nepalí e inglés; no cubre otros idiomas de la región ni lenguas indoarias como hindi o bengalí.
- Rendimiento variable: el autor advierte que el rendimiento puede variar según el dataset, el dominio, la cobertura del tokenizador, la distribución de candidatos y el estilo de las consultas.
- Sin capacidades generativas: no genera texto ni soporta tool calling; solo produce embeddings.
- Riesgo de alucinación no aplicable: al ser un modelo de embeddings, no genera texto, por lo que no presenta riesgo de alucinación, pero sí puede producir vectores subóptimos si los datos de entrenamiento no son representativos del dominio de uso.
- Licencia permisiva: Apache 2.0 permite uso comercial, pero se recomienda verificar la atribución correspondiente si se redistribuye el modelo o sus derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Supernova11c/Supernova-teraillm-Embedding-V4
- Modelo relacionado (Supernova-llm-terai): https://huggingface.co/Supernova11c/Supernova-llm-terai
- Dataset del proyecto: https://huggingface.co/datasets/Supernova11c/Supernova-teraillm
- Paper SUPERNOVA (RLVR, no específico de embeddings): https://arxiv.org/abs/2604.08477
- Benchmark de modelos de embeddings 2026 (blog externo): https://zc277584121.github.io/rag/2026/03/20/embedding-models-benchmark-2026.html
- Guía de modelos de embeddings 2026 (blog externo): https://www.openxcell.com/blog/best-embedding-models
