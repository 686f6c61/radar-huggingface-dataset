# zainmerchan/pplx-embed-v2-context-0.6b-mlx

## Resumen

pplx-embed-v2-context-0.6b-mlx es la conversión a MLX del modelo de embeddings contextuales pplx-embed-v2-context-0.6b de Perplexity AI, publicada por el usuario zainmerchan. El modelo original resuelve el problema del retrieval contextual: en lugar de generar un vector aislado por fragmento, produce embeddings que incorporan el contexto de los fragmentos vecinos dentro del mismo documento, lo que mejora la recuperación en tareas de RAG sobre documentos largos y multimodales. Esta versión permite ejecutar esos pesos en Apple Silicon mediante la librería `pplx-context-mlx`, sin necesidad de PyTorch ni de GPU dedicada.

La arquitectura subyacente es un transformer de tipo `pplx_contextual_qwen3_5` con 595.370.176 parámetros (aproximadamente 0,6B), derivado de la familia Qwen3.5 y adaptado por Perplexity para producir embeddings contextuales. El repositorio incluye pesos en `safetensors` y `float16` (1,1 GB, frente a los 2,2 GB del checkpoint original), manteniendo la proyección contextual en `float32` para preservar la precisión numérica.

Su relevancia actual radica en dos factores: por un lado, ofrece una alternativa de embeddings de alta calidad con licencia MIT apta para uso comercial; por otro, demuestra que es viable ejecutar modelos de retrieval contextual de forma local en hardware de consumo Apple con latencias de milisegundos por consulta, lo que facilita prototipado y despliegues en el borde sin depender de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer `pplx_contextual_qwen3_5` (derivada de Qwen3.5) |
| Parámetros totales | 595.370.176 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como límite oficial; el autor recomienda ventanas de hasta ~2.048 tokens por documento y reporta degradación a partir de pocos miles de tokens |
| Tipos de cuantización | `float16` (repositorio) y `float32` (pesos originales de Perplexity); no se documentan cuantizaciones int8/int4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `safetensors` (librería `mlx`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de 0,6B parámetros orientado a `feature-extraction`, con una cabeza de proyección contextual que transforma las representaciones de cada fragmento en función de los fragmentos que lo rodean dentro de un mismo documento. La conversión a MLX mantiene los pesos en `float16` y deja la proyección contextual en `float32`, lo que según el autor produce vectores bit-idénticos (dentro de un paso de int8) a los del checkpoint original cargado en `float16`, con un coseno mínimo de 0,999998 en `float32` y 0,99978 en `float16`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card del repositorio convertido no los detalla y la información proporcionada no los incluye. La innovación técnica destacable es el propio paradigma de embeddings contextuales: el modelo codifica un chunk condicionado por sus vecinos, lo que mejora el rendimiento de recuperación en documentos largos frente a embeddings independientes. El autor advierte que este beneficio se degrada si se procesan ventanas demasiado grandes: en ViDoRe-V3, el nDCG@10 cae de 66,7 con una página por pasada a 56,6 con 8.192 tokens y a 53,3 con 32.768.

## Capacidades

- Generación de embeddings de texto para recuperación de información (`retrieval`), con pipeline `feature-extraction`.
- Embeddings contextuales: cada fragmento se codifica teniendo en cuenta los fragmentos vecinos del mismo documento.
- Codificación de consultas separada de la codificación de documentos (`encode` frente a `encode_queries`).
- Soporte de entradas multimodales: el autor menciona haber verificado la identidad de vectores también en entradas de imagen.
- Normalización opcional de embeddings (`normalize_embeddings=True`) para similitud coseno directa.
- Ejecución en Apple Silicon mediante MLX, sin dependencia de CUDA.
- No se documentan capacidades de tool calling, agentes, generación de texto libre ni modo de razonamiento; es un modelo exclusivamente de representación.

## Casos de uso

- RAG sobre documentación técnica: indexar manuales y páginas de referencia en fragmentos de hasta ~2.048 tokens, aprovechando el contexto vecino para que cada chunk se recupere con la información de su sección, lo que reduce respuestas descontextualizadas.
- Búsqueda semántica local en portátiles Mac: desplegar el motor con `pplx-context-mlx` en un M4 Pro para un buscador interno que responde en 7,4 ms por consulta y procesa un documento de 7.137 tokens en 1,19 s.
- Recuperación multimodal sobre documentos escaneados: el modelo acepta entradas de imagen además de texto, lo que permite indexar páginas de PDF con figuras y tablas en un mismo espacio vectorial.
- Prototipado de pipelines de retrieval sin GPU: al caber en 2,1 GB de memoria en `float16`, se puede iterar sobre estrategias de chunking y re-ranking en un equipo de desarrollo convencional.
- Deduplicación y clustering de fragmentos documentales: los embeddings normalizados permiten calcular similitud coseno directamente para agrupar secciones redundantes en corpus grandes.
- Evaluación comparativa de sistemas de RAG: al reproducir las puntuaciones del paper (ViDoRe-V3 55,82 frente a 55,81), sirve como baseline fiable para medir mejoras de otras técnicas de recuperación.
- Filtrado previo en pipelines de agentes: usar el modelo como primera etapa de recuperación de bajo coste antes de invocar un LLM generativo, reduciendo el número de tokens enviados al modelo grande.

## Benchmarks y rendimiento

| Benchmark | Resultado | Referencia |
|---|---|---|
| ViDoRe-V3 (nDCG@10) | 55,82 | 55,81 en el paper |
| ViDoRe-V3, 1 página por pasada | 66,7 | — |
| ViDoRe-V3, 8.192 tokens | 56,6 | — |
| ViDoRe-V3, 32.768 tokens | 53,3 | — |
| ConTEB, 6 de 8 tareas | dentro de 0,22 puntos | paper |
| ConTEB ESG | 53,5 | 67,3 en el paper |
| ConTEB Insurance | 88,9 | 88,0 en el paper |

Mediciones de rendimiento en M4 Pro con 64 GB, frente a PyTorch en CPU:

| Métrica | Valor |
|---|---|
| Latencia por consulta | 7,4 ms |
| Documento de 7.137 tokens (`float16`) | 1,19 s |
| Aceleración frente a CPU upstream | 3 a 12 veces |
| Memoria en suite de velocidad (`float16`) | 2,1 GB |
| Memoria en suite de velocidad (`float32`) | 3,1 GB |
| Memoria a 113.281 tokens (`float16`) | 7,8 GB |
| Coseno mínimo frente a upstream (`float32`) | 0,999998 |
| Coseno mínimo frente a upstream (`float16`) | 0,99978 |

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-embed-v2-context-0.6b-mlx (este) | 595M | ventanas recomendadas ~2.048 tokens | Embeddings contextuales, MLX | MIT | Hugging Face |
| perplexity-ai/pplx-embed-v2-context-0.6b | 595M | no disponible | Embeddings contextuales, PyTorch | MIT (según el autor del convertido) | Hugging Face |
| perplexity-ai/pplx-embed-v2-context-9b | no disponible | no disponible | Embeddings contextuales, versión grande | MIT (según el autor del convertido) | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no se pueden contrastar rendimientos entre ellos.

## Limitaciones y advertencias

- El propio autor recomienda mantener ventanas pequeñas (una página o sección, hasta ~2.048 tokens); por encima de pocos miles de tokens el retrieval empeora de forma medible (caída de nDCG@10 de 66,7 a 53,3 a 32.768 tokens).
- La verificación de precisión de vectores solo se realizó hasta 13.871 tokens; no hay garantías documentadas más allá de ese umbral.
- El autor no probó el modelo en un Mac de 16 GB, ni la variante de 9B, ni comparó contra GPU; el rendimiento en esos entornos es desconocido.
- Los resultados de ConTEB muestran una discrepancia notable en la tarea ESG (53,5 frente a 67,3 del paper), aunque el autor indica que el modelo original puntúa igual bajo el mismo arnés de evaluación, lo que apunta a una diferencia metodológica más que a un fallo de la conversión.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones idiomáticas; al ser un modelo de embeddings, el riesgo de alucinación se traslada al sistema generativo que consuma los vectores, no al modelo en sí.
- La licencia MIT permite uso comercial, pero el autor advierte que la model card original de 0.6B no declaraba etiqueta de licencia en la fecha de publicación del convertido; conviene verificar la licencia del checkpoint upstream antes de un despliegue comercial.
- Dependencia del ecosistema MLX: no es portable directamente a CUDA sin reconversión, y requiere hardware Apple Silicon para aprovechar sus ventajas de rendimiento.
- No hay información sobre idiomas soportados, lo que impide garantizar calidad en recuperación multilingüe.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zainmerchan/pplx-embed-v2-context-0.6b-mlx
- Modelo base en Hugging Face: https://huggingface.co/perplexity-ai/pplx-embed-v2-context-0.6b
- Repositorio del runtime MLX: https://github.com/zm2231/pplx-context-mlx
- README del runtime con tablas completas: https://github.com/zm2231/pplx-context-mlx#readme
