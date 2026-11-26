# Srihari2020/FlavorVector

## Resumen

FlavorVector es un sistema de recuperación semántica especializado en ciencia de los alimentos, desarrollado por el usuario Srihari2020, que combina un modelo de embeddings densos (`BAAI/bge-base-en-v1.5`) con un reranker cross-encoder (`cross-encoder/ms-marco-MiniLM-L-6-v2`) para resolver consultas sobre sustituciones culinarias, maridaje de sabores y construcción de puentes de sabor a partir de ingredientes disponibles en despensa. No es un modelo generativo, sino un pipeline de recuperación en dos etapas empaquetado junto con una base de datos vectorial ChromaDB preindexada, una interfaz Streamlit y una API FastAPI.

El repositorio incluye los pesos de ambos transformers, 143 vectores precalculados distribuidos en dos colecciones (`flavor_substitutions` y `flavor_pairings`), un atlas estructurado de reglas de sustitución y perfiles de compuestos volátiles (`flavor_atlas.json`), y utilidades para escalado de ratios y síntesis web en vivo. El objetivo es ofrecer una alternativa local-first y offline a los asistentes culinarios basados en LLM, fundamentada en química de compuestos aromáticos en lugar de generación libre de texto.

Su relevancia actual radica en el patrón de arquitectura que ejemplifica: recuperación en dos etapas (bi-encoder + cross-encoder) sobre un dominio vertical concreto, con métricas de latencia y throughput publicadas. Es un caso práctico de RAG especializado donde el conocimiento de dominio está codificado en un atlas estructurado y en embeddings, no en los parámetros de un modelo de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de recuperación en dos etapas: bi-encoder denso (BERT) + cross-encoder reranker |
| Parámetros totales | No disponible (bi-encoder `bge-base-en-v1.5` ~109 M; cross-encoder `ms-marco-MiniLM-L-6-v2` ~22,7 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitada por la ventana del backbone BERT, típicamente 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el modelo base `bge-base-en-v1.5` es predominantemente inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El sistema se compone de dos modelos encadenados. La primera etapa es `BAAI/bge-base-en-v1.5`, un encoder transformer tipo BERT de aproximadamente 109 millones de parámetros que genera embeddings densos de 768 dimensiones para la búsqueda por similitud vectorial sobre ChromaDB. La segunda etapa es `cross-encoder/ms-marco-MiniLM-L-6-v2`, un cross-encoder MiniLM de 6 capas que reordena los candidatos recuperados evaluando conjuntamente consulta y documento.

No se documenta un proceso de fine-tuning propio sobre datos culinarios: el autor describe el sistema como "grounded in food-science chemistry and volatile aroma compounds", pero el conocimiento de dominio reside en el atlas estructurado (`flavor_atlas.json`) y en los 143 vectores preindexados, no en un entrenamiento adicional de los transformers. No se especifican número de tokens de entrenamiento, composición del dataset, ni uso de RLHF/DPO (no aplica a modelos de embeddings). La innovación destacable es la arquitectura de recuperación en dos etapas con base vectorial persistente y empaquetado completo para ejecución offline.

## Capacidades

- Búsqueda semántica de sustitutos de ingredientes a partir de consultas en lenguaje natural.
- Maridaje de sabores (flavor pairing) basado en perfiles de compuestos aromáticos.
- Construcción de "puentes de sabor" a partir de ingredientes disponibles en despensa.
- Recuperación en dos etapas con reranking para mejorar la ordenación de resultados.
- Escalado de ratios de sustitución mediante el módulo `balancer.py`.
- Síntesis web en vivo (`live_fetcher.py`) para complementar el atlas local.
- API REST con endpoints `/substitute` y `/pair` vía FastAPI.
- Interfaz interactiva Streamlit con gráficos radar de 10 sabores.
- Ejecución local-first y offline con pesos y base vectorial empaquetados.
- No soporta tool calling, agentes multi-paso, visión, audio ni modo thinking (no es un modelo generativo).

## Casos de uso

- Asistente de sustituciones en cocina: el motor responde a consultas como "¿qué puede reemplazar la buttermilk y dar la misma acidez en tortitas?" recuperando candidatos del atlas con reranking; adecuado por su baja latencia (28,95 ms p50) y su base de reglas de ciencia de los alimentos.
- Recomendación de maridajes en cartas de restaurante: el endpoint `/pair` sugiere combinaciones de ingredientes según perfiles de compuestos volátiles, con latencia p50 de 36,38 ms, apto para integración en aplicaciones de hostelería.
- Planificación de menús con ingredientes de despensa: el "pantry flavor bridge" propone combinaciones usando lo disponible, con latencia p50 de 60,04 ms y p95 de 62,85 ms.
- Aplicación móvil o web de recetas: el paquete incluye Streamlit y FastAPI, lo que permite desplegar una demo interactiva o un servicio REST sin dependencias externas de red.
- Investigación en ciencia de los alimentos: el `flavor_atlas.json` exporta reglas de sustitución y perfiles de compuestos, útil como base de datos consultable para estudios de química del sabor.
- Integración en pipelines RAG verticales: sirve como referencia de arquitectura bi-encoder + cross-encoder sobre ChromaDB para dominios especializados con conocimiento estructurado.
- Despliegue en entornos sin conectividad: al empaquetar pesos (~529 MB en total) y base vectorial, puede ejecutarse en local o en edge sin acceso a internet.

## Benchmarks y rendimiento

Evaluación sobre 25 casos límite culinarios en una NVIDIA GeForce RTX 5060 Laptop GPU:

| Categoría | Métrica | Etapa 1 (`bge-base-en-v1.5`) | Dos etapas (+ cross-encoder) |
|---|---|---|---|
| Exactitud | Hit Rate@1 | 100,0 % | 100,0 % |
| Exactitud | Hit Rate@3 | 100,0 % | 100,0 % |
| Calidad de ranking | MRR | 100,0 % | 100,0 % |
| Calidad de ranking | NDCG@3 | 100,0 % | 100,0 % |
| Latencia | Sustituciones (p50 / p95) | 6,67 ms | 28,95 ms / 30,81 ms |
| Latencia | Flavor pairing (p50 / p95) | — | 36,38 ms / 41,52 ms |
| Latencia | Pantry flavor bridge (p50 / p95) | — | 60,04 ms / 62,85 ms |
| Throughput | QPS sostenido | — | 35,1 QPS (`/substitute`) · 26,6 QPS (`/pair`) |

Advertencia: las métricas de exactitud al 100 % se obtienen sobre un conjunto de solo 25 casos, por lo que no son extrapolables a un rendimiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; ambos modelos son pequeños (bi-encoder ~438 MB, cross-encoder ~91 MB en pesos) y caben holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre; el autor reporta mediciones en una RTX 5060 Laptop.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes; también es viable en CPU con latencias mayores.
- Opciones de despliegue: FastAPI (incluido), Streamlit (incluido), sentence-transformers; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a modelos de embeddings).
- Latencia y throughput: p50 de 28,95 ms en sustituciones, 36,38 ms en pairing y 60,04 ms en pantry bridge; 35,1 QPS en `/substitute` y 26,6 QPS en `/pair` sobre RTX 5060 Laptop.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FlavorVector | Pipeline de recuperación vertical (bi-encoder + cross-encoder) | ~132 M (suma de ambos) | No disponible | MIT | Hugging Face (repo completo con app y DB) |
| BAAI/bge-base-en-v1.5 | Bi-encoder generalista | ~109 M | ~512 tokens | MIT | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L-6-v2 | Cross-encoder reranker | ~22,7 M | ~512 tokens | Apache 2.0 | Hugging Face |
| Modelos generativos culinarios (p. ej. LLM con fine-tuning de recetas) | Generativo | Miles de millones | Variable | Variable | Variable |

FlavorVector se diferencia de los modelos base por empaquetar el pipeline completo con conocimiento de dominio estructurado y una base vectorial preindexada; frente a soluciones generativas, ofrece menor latencia y trazabilidad de las reglas, pero no genera texto libre ni razona fuera de su dominio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el corpus de 143 vectores es reducido y puede reflejar sesgos de la fuente del atlas.
- Riesgo de alucinación: bajo en tanto que es un sistema de recuperación, pero el módulo `live_fetcher.py` introduce contenido web no verificado que puede degradar la fiabilidad.
- Limitaciones de contexto o idioma: el backbone `bge-base-en-v1.5` está orientado al inglés; no se declaran idiomas soportados oficialmente.
- Restricciones de licencia: MIT permite uso comercial, pero conviene verificar las licencias de los modelos base y de las fuentes del atlas.
- Caveats para producción: las métricas de exactitud al 100 % provienen de solo 25 casos; el rendimiento en dominios culinarios más amplios no está validado. La base vectorial es estática (143 vectores) y requiere reconstrucción para ampliar cobertura.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Srihari2020/FlavorVector
- Modelo base bi-encoder: https://huggingface.co/BAAI/bge-base-en-v1.5
- Modelo base cross-encoder: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L-6-v2
