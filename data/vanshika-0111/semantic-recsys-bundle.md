# Vanshika-0111/semantic-recsys-bundle

## Resumen

`semantic-recsys-bundle` es un paquete de artefactos de inferencia (no un modelo generativo) publicado por Vanshika-0111 para un motor de recomendación y ranking semántico de películas. Contiene 23.109 vectores de 384 dimensiones generados con el modelo de embeddings `bge-small-en-v1.5`, metadatos de películas, estadísticas agregadas por ítem (popularidad, media bayesiana de valoraciones) y dos rankers LightGBM LambdaMART (uno para usuarios con historial, warm-start, y otro para usuarios nuevos, cold-start), junto con los ajustes de serving validados. Lo consume la clase `recsys.serving.Engine` del repositorio del autor.

El problema que resuelve es la fase de recuperación y reordenación en un sistema de recomendación: primero se recuperan candidatos mediante búsqueda vectorial sobre los embeddings (FAISS, según las etiquetas) y después se reordenan con un modelo de learning-to-rank que combina señales semánticas con estadísticas de popularidad y calidad. El paquete está pensado para evitar recalcular todo el pipeline en cada despliegue de la API.

Es relevante como ejemplo de arquitectura de recomendación híbrida (embeddings densos + LTR) empaquetada como bundle reproducible, pero conviene subrayar que el repositorio pesa 0.0 GB, no incluye valoraciones individuales (la licencia de MovieLens no permite redistribuirlas) ni usuarios de demostración, y no publica resultados de benchmarks ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bundle de inferencia: embeddings densos (bge-small-en-v1.5, 384-d) + búsqueda vectorial (FAISS) + rankers LightGBM LambdaMART (warm y cold-start) |
| Parametros totales | no disponible (no es un modelo único; incluye un encoder de embeddings y dos modelos GBDT) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el encoder bge-small-en-v1.5 trabaja con fragmentos cortos de texto, pero el bundle no declara límite) |
| Tipos de cuantizacion | no disponible (no se documentan versiones cuantizadas; los GBDT no se cuantizan del mismo modo que un transformer) |
| Idiomas soportados | no disponible (los metadatos y el encoder apuntan a inglés, sin declaración explícita) |
| Licencia | other (uso no comercial; sujeto a las licencias de MovieLens 32M y TMDB) |
| Formato de pesos | no disponible (vectores y artefactos serializados del bundle; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El bundle no entrena un transformer propio: reutiliza `bge-small-en-v1.5` como encoder para generar 23.109 vectores de 384 dimensiones, uno por película, a partir de metadatos textuales. Sobre esos vectores se construye la fase de recuperación (búsqueda por similitud, presumiblemente FAISS según las etiquetas del repositorio) y se añaden estadísticas agregadas por ítem, como popularidad y media bayesiana de valoraciones, que alimentan la fase de ranking.

La reordenación la realizan dos modelos LightGBM con objetivo LambdaMART: uno para usuarios warm-start con historial y otro para cold-start sin él. El paquete incluye además los ajustes de serving validados y la procedencia del artefacto (split `a99079d4a40a`, código `8e192bf`, versión de bundle 1). No se documentan el número de tokens de entrenamiento, la composición exacta del dataset más allá de MovieLens 32M y metadatos de TMDB, ni si hubo etapas de ajuste adicionales. Tampoco se detalla la estrategia de negativos, las features exactas de los rankers ni los hiperparámetros de LightGBM.

## Capacidades

- Recuperación semántica de películas: búsqueda por similitud sobre 23.109 vectores de 384 dimensiones generados con `bge-small-en-v1.5`.
- Ranking supervisado con LambdaMART: reordenación de candidatos con LightGBM, con variantes para usuarios con historial y sin historial.
- Cold-start: el ranker específico permite puntuar usuarios nuevos sin historial previo.
- Señales agregadas por ítem: popularidad y media bayesiana de valoraciones incorporadas como features.
- Serving reproducible: ajustes de inferencia validados y cargables mediante `recsys.serving.Engine`.
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües: no declaradas.

## Casos de uso

- Motor de recomendación de películas en producción: cargar el bundle con `recsys.serving.Engine`, recuperar candidatos por similitud vectorial y reordenar con el ranker warm-start para usuarios con historial.
- Recomendación a usuarios nuevos: usar el ranker cold-start y las estadísticas agregadas (popularidad, media bayesiana) para ofrecer resultados razonables desde la primera sesión.
- Búsqueda semántica en catálogo: consultas en lenguaje natural transformadas con el mismo encoder y comparadas contra los 23.109 vectores para devolver títulos afines.
- Prototipado e investigación en recsys: base reproducible para experimentar con features, negativos y estrategias de reordenación sin reconstruir el pipeline desde cero.
- Sistemas de reordenación en dos etapas: integrar el bundle como segunda etapa sobre candidatos de un motor existente, aprovechando el LTR para incorporar señales de calidad.
- Demo educativa de learning-to-rank: ilustrar el flujo embeddings → recuperación → LambdaMART con datos de MovieLens, útil en docencia y blogs técnicos.
- Evaluación de arquitecturas híbridas: comparar el rendimiento de un pipeline denso + GBDT frente a alternativas de filtrado colaborativo clásico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El bundle ocupa 0.0 GB en el repositorio, por lo que el peso real de los artefactos no puede estimarse a partir de los datos publicados.
- GPU recomendadas: no disponible. La búsqueda vectorial con FAISS y los GBDT pueden ejecutarse en CPU; el encoder `bge-small-en-v1.5` es ligero y cabe en GPUs de consumo, pero el bundle no declara requisitos.
- Cabe en consumer GPU: previsiblemente sí para el encoder y el índice, aunque no se documenta el tamaño del índice ni de los modelos LightGBM.
- Opciones de despliegue: la vía documentada es la clase `recsys.serving.Engine` del repositorio del autor; FAISS para la recuperación y LightGBM para el ranking. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| semantic-recsys-bundle | Bundle recsys (embeddings + FAISS + LightGBM LTR) | no disponible | no disponible | other (no comercial) | Hugging Face, repo 0.0 GB |
| Alternativas de recsys con embeddings + LTR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada; la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Licencia `other` con uso no comercial: MovieLens 32M restringe la redistribución de valoraciones y el uso comercial; TMDB no avala el proyecto.
- El bundle no incluye valoraciones individuales ni usuarios de demostración, lo que limita la reproducibilidad de experimentos con historial real.
- El repositorio pesa 0.0 GB, lo que sugiere que los artefactos pueden no estar efectivamente alojados o que la carga es incompleta; conviene verificar antes de desplegar.
- Sesgos: los derivados de MovieLens (sesgo de popularidad, cobertura desigual de títulos y usuarios) y de los metadatos de TMDB.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de recomendaciones irrelevantes en cold-start por depender de estadísticas agregadas.
- Limitaciones de idioma: no se declara soporte multilingüe; los metadatos y el encoder apuntan a inglés.
- Ausencia total de benchmarks y métricas de evaluación publicadas: no hay evidencia cuantitativa de calidad (NDCG, recall, MAP) para justificar su uso en producción.
- Dependencia del código externo (`recsys.serving.Engine`) y de versiones concretas de LightGBM y FAISS para cargar el bundle correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/Vanshika-0111/semantic-recsys-bundle
- Repositorio de código: https://github.com/Vanshika-0111/semantic-recsys
- Paper de MovieLens 32M: F. Maxwell Harper and Joseph A. Konstan. 2015. The MovieLens Datasets: History and Context. ACM TiiS 5(4).
- Modelo de embeddings base: `bge-small-en-v1.5` (no se incluye enlace directo en la información proporcionada).
