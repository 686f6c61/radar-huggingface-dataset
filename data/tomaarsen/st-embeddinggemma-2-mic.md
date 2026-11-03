# tomaarsen/st-embeddinggemma-2-mic

## Resumen

`tomaarsen/st-embeddinggemma-2-mic` es un artefacto de prueba (fixture) publicado en HuggingFace por el desarrollador tomaarsen, conocido por su trabajo en la librería sentence-transformers. No se trata de un modelo entrenado para producción, sino de una versión reducida ("shrunk") del pipeline de SentenceTransformer correspondiente a `google/embeddinggemma-2`, generada para validar la integración de frameworks y contratos de ejecución. El propio autor advierte en la model card que los pesos son aleatorios y no representan la calidad de recuperación del modelo original.

El repositorio empaqueta en un único lugar los pesos reducidos, ejemplos de uso ejecutables y las expectativas del framework (manifest de contrato en `integration.json`, uso con Transformers en `integrations/transformers/usage.md`, procedencia del fixture en `build.json`). Con 19.361.122 parámetros reales en safetensors y un tamaño de repo de 0,1 GB, es un artefacto ligero pensado para tests de integración continua y verificación de pipelines, no para inferencia real.

Su relevancia es, por tanto, metodológica: sirve como referencia para entender cómo se estructuran los fixtures de integración en el ecosistema sentence-transformers y cómo se valida que una implementación de framework cumple el contrato esperado por un modelo de embeddings concreto. No debe confundirse con el modelo base `google/embeddinggemma-2`, del que no se aportan especificaciones en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `embedding_gemma2`; pesos reducidos aleatorios) |
| Parametros totales | 19.361.122 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Modelo base | google/embeddinggemma-2 |
| Tamano del repo | 0,1 GB |
| Tags | mic, test-artifact |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `embedding_gemma2` y el hecho de que se trata de un pipeline de SentenceTransformer. El autor indica explícitamente que se trata de una versión reducida ("shrunk") del pipeline de `google/embeddinggemma-2`, con pesos aleatorios, por lo que no ha habido un proceso de entrenamiento real ni ajuste fino con datos supervisados. El repositorio incluye un enlace a la documentación del proceso de reducción (`https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-embeddinggemma-2-mic.html`), que describe cómo se generó el fixture.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre técnicas de RLHF o DPO, ya que el artefacto no es un modelo entrenado. La innovación técnica relevante aquí no es arquitectónica sino de ingeniería: el empaquetado de pesos reducidos junto con el manifest de contrato (`integration.json`) y las expectativas del framework (`integrations/transformers/expectations`) para permitir tests reproducibles de integración.

## Capacidades

- Generación de embeddings de frases mediante el pipeline de SentenceTransformer (estructura funcional, aunque los pesos aleatorios no producen embeddings útiles).
- Verificación de contratos de integración con Transformers: el repositorio incluye un manifest (`integration.json`) y un directorio de expectativas que permiten validar que una implementación cumple lo esperado.
- Ejecución de ejemplos de uso reproducibles documentados en `integrations/transformers/usage.md`.
- Trazabilidad de procedencia del fixture mediante `build.json`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales: es un artefacto de test.
- Capacidades multilingües: no disponibles (los pesos aleatorios no tienen comportamiento lingüístico significativo).

## Casos de uso

- Tests de integración continua en sentence-transformers: el fixture permite verificar que los cambios en la librería no rompen la carga ni la ejecución del pipeline de `embeddinggemma-2`, con un coste de descarga y cómputo mínimo (0,1 GB, 19M parámetros).
- Validación de contratos de framework: el manifest `integration.json` y el directorio `integrations/transformers/expectations` permiten comprobar que una implementación de Transformers satisface las interfaces esperadas por el pipeline.
- Reproducibilidad de pipelines de embeddings: al fijar pesos reducidos y deterministas, se pueden reproducir ejecuciones en entornos de CI sin depender del modelo completo.
- Desarrollo de herramientas de reducción de modelos: el enlace al proceso de shrink documenta la metodología, útil para quien quiera generar fixtures similares para otros modelos.
- Formación y documentación: sirve como ejemplo didáctico de cómo se estructura un repositorio de integración con pesos, uso y expectativas en un solo lugar.
- Depuración de errores de carga: permite aislar problemas de serialización safetensors o de configuración del pipeline sin la complejidad del modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor advierte explícitamente que los pesos son aleatorios y no representan la calidad de recuperación del modelo original, por lo que cualquier métrica de retrieval carecería de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (19,4M parámetros ≈ 77 MB de pesos); en la práctica, cualquier GPU consumer puede alojarlo.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU sin problemas. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es sobredimensionada para este artefacto.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: sentence-transformers (librería nativa), Transformers según el ejemplo de `integrations/transformers/usage.md`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, y no tendría sentido usarlas con un fixture de test.
- Latencia y throughput: no disponibles; al ser un artefacto de test con pesos aleatorios, las mediciones no serían representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| tomaarsen/st-embeddinggemma-2-mic | 19,4M | no disponible | no disponible | Fixture de test |
| google/embeddinggemma-2 | no disponible | no disponible | no disponible | Modelo de embeddings real (base) |
| Otros fixtures MIC de tomaarsen | variable | no disponible | no disponible | Fixtures de test equivalentes |

La comparación con alternativas de la misma categoría (modelos de embeddings para producción) no es significativa, ya que este repositorio no es un modelo funcional. Frente al modelo base `google/embeddinggemma-2`, la diferencia clave es que este último sí está entrenado para retrieval, mientras que el fixture tiene pesos aleatorios y un tamaño reducido a efectos de test.

## Limitaciones y advertencias

- Los pesos son aleatorios: los embeddings generados no tienen valor semántico ni utilidad para retrieval, clustering o similitud.
- No debe usarse en producción bajo ninguna circunstancia; es un artefacto de test.
- Licencia no disponible: no se puede asumir permiso de uso comercial sin consultar al autor o al modelo base.
- Idiomas no disponibles: sin comportamiento lingüístico significativo.
- No se documentan sesgos porque no hay entrenamiento real; cualquier análisis de sesgo sería inaplicable.
- Riesgo de confusión con el modelo base `google/embeddinggemma-2`: verificar siempre el ID del repositorio antes de integrarlo en un pipeline.
- Contexto y cuantizaciones no documentados; no se recomienda su uso para benchmarks de rendimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su naturaleza de artefacto interno.

## Enlaces

- HuggingFace: https://huggingface.co/tomaarsen/st-embeddinggemma-2-mic
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Manifest de contrato: https://huggingface.co/tomaarsen/st-embeddinggemma-2-mic/blob/main/integration.json
- Uso con Transformers: https://huggingface.co/tomaarsen/st-embeddinggemma-2-mic/blob/main/integrations/transformers/usage.md
- Expectativas de Transformers: https://huggingface.co/tomaarsen/st-embeddinggemma-2-mic/tree/main/integrations/transformers/expectations
- Procedencia del fixture: https://huggingface.co/tomaarsen/st-embeddinggemma-2-mic/blob/main/build.json
- Proceso de reduccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/st-embeddinggemma-2-mic.html
