# Supernova11c/Supernova-teraillm-Embedding-V1

## Resumen

El modelo Supernova-teraillm-Embedding-V1 es un modelo de embeddings de texto ligero desarrollado por Supernova11c como parte del proyecto Supernova TeraLLM, orientado a la búsqueda semántica y recuperación de información en nepalí e inglés. Con solo 11,9 millones de parámetros, está diseñado para experimentos de retrieval semántico y para su uso en aplicaciones de generación aumentada por recuperación (RAG) donde el nepalí es el idioma principal. Su relevancia radica en cubrir un idioma con escasos recursos en el ámbito de los modelos de embeddings, ofreciendo una alternativa ligera y de fácil despliegue para tareas de similitud de documentos y búsqueda semántica. La arquitectura interna no se detalla públicamente, pero se denomina "Supernova V1.1" y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Supernova V1.1 (no se especifica el tipo de red) |
| Parámetros totales | 11.954.304 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | ne (nepalí), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y pytorch_model.bin |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no se describe en la documentación disponible. Se denomina "Supernova V1.1" y se presenta como un modelo ligero de embeddings para retrieval semántico, desarrollado en el marco del proyecto Supernova TeraLLM. No se especifican detalles sobre el número de capas, el tipo de atención, ni la configuración del tokenizador. En cuanto al entrenamiento, la model card indica que los modelos de la familia Supernova se entrenaron como parte de un proyecto de investigación de retrieval semántico, pero no se proporciona información sobre el volumen de datos, la composición del corpus, ni el método de optimización (por ejemplo, si se usó contraste o minería de hard negatives). Tampoco se menciona si se aplicaron técnicas de ajuste como RLHF o DPO. El único dato concreto es que se trata de un modelo de 11,9 millones de parámetros y que se distribuye en formato PyTorch.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y similitud de documentos.
- Soporte de recuperación de información en nepalí e inglés, lo que permite su uso en aplicaciones de retrieval para estos idiomas.
- Integración con sistemas de generación aumentada por recuperación (RAG) al proporcionar representaciones vectoriales de pasajes y consultas.
- Adecuado para experimentos de embeddings ligeros, dado su reducido tamaño y bajo coste computacional.
- No se mencionan capacidades de tool calling, agentes, visión ni modos de razonamiento especiales.

## Casos de uso

- Búsqueda semántica en nepalés: el modelo puede indexar documentos en nepalí y devolver resultados relevantes a partir de consultas en ese idioma, útil para bibliotecas digitales o portales de noticias.
- Recuperación aumentada por generación (RAG): se puede integrar en un pipeline que recupera pasajes de un corpus nepalés para alimentar a un LLM generativo, mejorando la precisión de respuestas sobre información local.
- Coincidencia de documentos: comparar pares de documentos para detectar duplicados o medir similitud temática en conjuntos de datos nepalíes.
- Clasificación de texto: usar los embeddings como características de entrada para clasificadores de intención o categoría en textos cortos nepalíes.
- Sistemas de recomendación: recomendar artículos o recursos basados en la similitud de embeddings entre el perfil del usuario y los documentos.
- Experimentación en investigación: servir como modelo de referencia ligero para comparar el rendimiento de otras arquitecturas de embeddings en idiomas de bajo recurso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se evalúa con métricas como Recall@1, Recall@3, Recall@5 y MRR, y que se comparan con Sentence Transformers, pero no se ofrecen datos numéricos concretos.

## Requisitos de hardware

- VRAM estimada: con 11,9 millones de parámetros, el modelo ocupa aproximadamente 48 MB en fp32 y unos 24 MB en fp16. Cabe en cualquier GPU con más de 1 GB de VRAM, incluso en GPUs integradas.
- GPU recomendadas: no se requiere una GPU específica; cualquier GPU con al menos 1 GB de VRAM es suficiente. También se puede ejecutar en CPU con una latencia muy baja.
- Despliegue: al ser un modelo PyTorch, puede integrarse con frameworks como Sentence-Transformers, Hugging Face Transformers o directamente con PyTorch. Para entornos de producción, se puede servir con vLLM (aunque no es su foco principal), o mediante contenedores con la librería de embeddings.
- Latencia: dado su tamaño reducido, la generación de embeddings es rápida, con una inferencia en CPU del orden de milisegundos por texto corto.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo ámbito (embeddings nepalíes de tamaño pequeño). La model card menciona una comparación con Sentence Transformers, pero no se proporcionan resultados numéricos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo de investigación: no se ha validado en entornos de producción y su rendimiento puede variar según el dominio y el tipo de datos.
- Cobertura limitada del tokenizer: al estar centrado en nepalés e inglés, la cobertura para otros idiomas o jergas específicas es limitada.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, pero la calidad de la representación vectorial puede ser insuficiente para tareas que requieran matices semánticos muy específicos.
- Sin información sobre sesgos: no se han publicado análisis de sesgos ni de comportamiento en dominios sensibles.
- Tamaño del contexto: no se indica la longitud máxima de secuencia, por lo que no se puede garantizar un buen rendimiento con documentos muy largos.

## Enlaces

- [Hugging Face - Supernova-teraillm-Embedding-V1](https://huggingface.co/Supernova11c/Supernova-teraillm-Embedding-V1)
- [Dataset Supernova-teraillm](https://huggingface.co/datasets/Supernova11c/Supernova-teraillm) (conjunto de datos asociado)
