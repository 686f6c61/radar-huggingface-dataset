# ThakiCloud/SKILLRET-Edge-109M-int3-g32

## Resumen

SKILLRET-Edge-109M-int3-g32 es un bi-encoder de recuperación (retrieval) entrenado específicamente para una tarea concreta: dado un petición en lenguaje natural de un agente, seleccionar la habilidad (skill) correcta dentro de un catálogo. Lo desarrolla ThakiCloud y deriva por destilación de conocimiento del modelo profesor `ThakiCloud/SKILLRET-Embedding-0.6B`, con un estudiante base de 109,5 millones de parámetros (`ThakiCloud/SKILLRET-Edge-109M`). La variante publicada aquí aplica cuantización de pos-entrenamiento en 3 bits con grupos de tamaño 32.

Su relevancia está en el compromiso entre tamano y calidad: obtiene un NDCG@10 de 77,10 sobre el split de test público de SkillRet (4.392 consultas / 6.006 habilidades), frente a 79,18 del mismo estudiante en fp16, a cambio de reducir el fichero de pesos de 219,0 MB a 54,7 MB empaquetados. Es decir, pierde 2,08 puntos porcentuales para ocupar 4,0 veces menos, lo que permite ejecutarlo en CPU junto al propio agente.

El modelo es deliberadamente especializado y no generaliza: fuera de SkillRet colapsa, con 5,81 de NDCG@10 en NFCorpus y 49,72 en SciFact, muy por debajo de embedders de propósito general de tamano similar. La ventana de contexto usada en evaluación es de 256 tokens, el pooling es CLS y la licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT, bi-encoder de frases (sentence-transformers), pooling CLS, embeddings L2-normalizados |
| Parametros totales | 109.482.240 (~109,5 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (max_length usado en evaluación) |
| Tipos de cuantizacion | int3 con cuantización por grupos, asimétrica min/max, grupo de tamano 32, escalas y puntos cero en fp16; variantes de la familia: fp16, int4/g16, int3/g16, int3/g32 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados des-cuantizados de vuelta a fp16, es el fichero que produce las métricas) y `model-int3-g32.bin` (carga empaquetada real de 54,680 MB); `quantization.json` con el layout por tensor |

Datos adicionales: repositorio de 0,3 GB, pipeline `feature-extraction`, librería `sentence-transformers`, 19 descargas y 0 likes en el momento de la consulta, creado el 2026-09-13 y actualizado el 2026-09-16.

## Arquitectura y entrenamiento

El modelo es un bi-encoder denso de arquitectura BERT de 109,5 M de parámetros que codifica consultas y descripciones de habilidades en el mismo espacio vectorial, con pooling CLS y normalización L2. La recuperación se resuelve por similitud coseno entre el vector de la consulta y los vectores del catálogo de skills. El entrenamiento es una destilación de conocimiento desde `ThakiCloud/SKILLRET-Embedding-0.6B` (NDCG@10 78,48 en el mismo split) con `kd_weight=0.7`, pérdida multi-positive InfoNCE sobre 1 a 3 positivos reales por consulta, 12 épocas y scheduler coseno. La época final se seleccionó sobre un holdout disjunto por habilidad, nunca sobre el split de test.

La innovación destacable no está en la arquitectura sino en la cuantización y en su documentación: los pesos se cuantizan por grupos de tamano 32 con escalas y puntos cero en fp16, con un layout equivalente al de un bloque GGUF Q4_K/Q8_0. El repositorio separa explícitamente dos artefactos: los pesos des-cuantizados a fp16 en `model.safetensors`, que funcionan con cualquier instalación actual de `transformers` o `sentence-transformers` pero que ejecutan aritmética en fp32, y el payload empaquetado real de 54,680 MB. La estimación de tamano empaquetado fue de 54,924 MB frente a 54,680 MB en disco (0,44 % de error). El autor advierte que las cifras de latencia publicadas se midieron con la ruta de aritmética fp32 y no corresponden a kernels enteros; enrutar los pesos empaquetados por un kernel INT real (llama.cpp, ONNX Runtime) está sin medir.

Durante el desarrollo se documentan intentos fallidos: destilar desde el profesor de 8B en lugar del de 0,6B cuesta 2,40 pp (brecha de capacidad); la cuantización post-entrenamiento a INT2 o ternaria colapsa por completo (~0,1 NDCG@10) y ni GPTQ ni QuIP la rescatan; el minado de negativos duros propios cuesta 1,0 pp; y la pérdida auxiliar de proyección LEAF con peso 0,3 cuesta 1,51 pp (t pareada = −7,78).

## Capacidades

- Recuperación de habilidades (skill retrieval): selección de la habilidad correcta de un catálogo a partir de una petición en lenguaje natural, evaluada con NDCG@10 sobre 6.006 habilidades.
- Generación de embeddings de frases para búsqueda semántica en inglés, con normalización L2 y similitud coseno.
- Ejecución en dispositivo (on-device) junto al agente, por tamano reducido y soporte de CPU.
- Integración con `sentence-transformers` mediante `SentenceTransformer(...).encode(...)`.
- Compatibilidad con `text-embeddings-inference` y con endpoints (etiquetas `text-embeddings-inference`, `endpoints_compatible`).
- No incluye generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni modo de pensamiento: es un modelo exclusivamente de extracción de características y recuperación.
- Multilingüismo: no disponible; solo inglés declarado.

## Casos de uso

- Enrutado de herramientas en agentes: el agente recibe la petición del usuario, codifica la consulta sin prefijo y busca por similitud coseno contra el catálogo de herramientas o skills; con 77,10 de NDCG@10 sobre 6.006 candidatas, acierta la habilidad correcta en la gran mayoría de casos sin necesidad de un LLM intermedio.
- Despliegue en el borde o en local: con 54,7 MB empaquetados y 109,5 M de parámetros, cabe en CPU junto al agente, lo que permite enrutado de skills sin conexión a red y sin GPU.
- Selección de herramientas en asistentes de escritorio o IDE: recuperación de la acción adecuada entre cientos de comandos disponibles en tiempo de ejecución.
- Pre-filtrado en pipelines RAG de catálogos grandes: reducir un catálogo de miles de skills a un top-10 antes de aplicar un reranker más caro o de invocar un LLM, aprovechando la ventana de 256 tokens por documento.
- Indexación de registros de API o plugins: codificar descripciones cortas de endpoints y resolver "qué endpoint usar para esta tarea" por búsqueda vectorial en inglés.
- Recuperación de habilidades en robótica o automatización de flujos: mapear una instrucción operativa a una rutina predefinida del catálogo, con latencia baja al no requerir GPU.
- Evaluación y comparación de cuantizaciones en producción: el repositorio incluye variantes fp16, int4/g16, int3/g16 e int3/g32 con métricas medidas, útiles para decidir el punto de compromiso tamano/calidad en un despliegue real.
- Servicio de embeddings vía text-embeddings-inference: exponer el modelo como endpoint de embeddings en inglés, dado que la tarjeta declara compatibilidad con esa herramienta.

## Benchmarks y rendimiento

Resultados sobre el split de test público de SkillRet (4.392 consultas / 6.006 habilidades), métrica NDCG@10. El error estándar del split es de aproximadamente ±0,45, por lo que el autor advierte que diferencias por debajo de ~1 pp no constituyen una clasificación fiable.

| Variante | Tamano en disco | NDCG@10 | vs profesor |
|---|---|---|---|
| SKILLRET-Embedding-0.6B (profesor) | 1191,6 MB | 78,48 | — |
| fp16 | 219,0 MB | 79,18 ± 0,42 | 100,9 % |
| int4 / g16 | 82,0 MB | 79,21 ± 0,42 | 100,9 % |
| int3 / g16 | 68,4 MB | 78,04 ± 0,44 | 99,4 % |
| int3 / g32 (este modelo) | 54,7 MB | 77,10 ± 0,44 | 98,2 % |

Rendimiento fuera de dominio (mismo modelo, corpora no vistos):

| Corpus | NDCG@10 del modelo | Rango de embedders de propósito general de tamano similar o menor |
|---|---|---|
| NFCorpus | 5,81 | ~31 a 39 |
| SciFact | 49,72 | ~64 a 78 |

Aviso de comparabilidad recogido en la tarjeta: la tarjeta de los modelos de referencia de SkillRet informa de un split de 4.997 consultas / 6.660 habilidades que no está en el dataset publicado; los ficheros públicos son idénticos por hash a los usados aquí (4.392 / 6.006), por lo que no deben convertirse los números entre ambos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas del número de parámetros): ruta fp32 vía safetensors ~438 MB de pesos; pesos en fp16 ~219 MB; payload empaquetado int3/g32 54,7 MB más escalas y puntos cero en fp16. Con `max_length=256` y lotes pequenos, el consumo total se mantiene en el orden de cientos de MB.
- GPU recomendadas: no requiere GPU. Para alto rendimiento en lote, cualquier GPU moderna sirve; A100 o H100 solo tendrían sentido para servir muchas consultas por segundo, no por requisito de memoria.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con 1 a 2 GB libres o más (por ejemplo RTX 3060, RTX 4090), y también en CPU.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `text-embeddings-inference` y endpoints compatibles (etiquetas declaradas). El autor menciona llama.cpp y ONNX Runtime como destino para un kernel INT real que aproveche el payload empaquetado, pero esa ruta está sin medir.
- Latencia y throughput: no disponible. La tarjeta menciona cifras de latencia medidas con la ruta fp32, pero no se incluyen valores numéricos en la información disponible, y se advierte que no son velocidades de kernels enteros.

## Comparativa con modelos similares

La información disponible solo permite comparar con las variantes de la propia familia y con el profesor, no con modelos externos identificados.

| Modelo | Parametros | Tamano | NDCG@10 (SkillRet) | Fuera de dominio | Licencia |
|---|---|---|---|---|---|
| SKILLRET-Edge-109M-int3-g32 | 109,5 M | 54,7 MB empaquetados | 77,10 ± 0,44 | NFCorpus 5,81 / SciFact 49,72 | Apache-2.0 |
| SKILLRET-Edge-109M fp16 | 109,5 M | 219,0 MB | 79,18 ± 0,42 | no disponible | Apache-2.0 (heredada del base) |
| SKILLRET-Edge-109M int4/g16 | 109,5 M | 82,0 MB | 79,21 ± 0,42 | no disponible | Apache-2.0 (heredada del base) |
| SKILLRET-Embedding-0.6B (profesor) | 0,6 B | 1191,6 MB | 78,48 | no disponible | no disponible |

Alternativas externas de propósito general: no disponible. La tarjeta menciona rangos agregados de embedders generales de tamano similar o menor (31 a 39 en NFCorpus, 64 a 78 en SciFact) sin nombrar modelos concretos, por lo que no se puede construir una comparativa nominal.

## Limitaciones y advertencias

- Especialización extrema: el modelo no generaliza. Fuera de SkillRet obtiene 5,81 en NFCorpus y 49,72 en SciFact, frente a 31-39 y 64-78 de embedders generales comparables. Para cualquier tarea que no sea recuperación de habilidades debe usarse otro embedder.
- Contrato de prefijo de consulta: `query_prefix.json` registra que las consultas se codifican sin prefijo de instrucción (`resolved: ""`). La elección del prefijo apenas importa tras el ajuste fino (79,18 sin prefijo frente a 78,50 con prefijo, dentro del error estándar), pero mantenerlo consistente entre entrenamiento y evaluación es crítico: se midió un vaivén de +8,84 pp en un mismo checkpoint solo por un desajuste de prefijo, que además produjo un resultado falso en el que la cuantización parecía superar a fp16.
- La ruta `safetensors` ejecuta aritmética en fp32: no ofrece velocidad de kernel entero. El beneficio real es de almacenamiento, no de latencia. El enrutado por kernels INT (llama.cpp, ONNX Runtime) está sin medir.
- Ruido de medición: el error estándar del split es de aproximadamente ±0,45, por lo que diferencias inferiores a ~1 pp no deben interpretarse como mejoras o degradaciones reales.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto), pero sí existe riesgo de recuperar la skill incorrecta cuando la descripción del catálogo es ambigua o está en un idioma distinto del inglés.
- Idioma: solo inglés declarado. Consultas en otros idiomas no están soportadas ni evaluadas.
- Contexto: 256 tokens en evaluación, suficiente para descripciones cortas de habilidades pero no para documentos largos.
- Cuantización agresiva: INT2 y ternaria colapsan por completo (~0,1 NDCG@10) en este tipo de modelo; no es viable bajar más de int3/g32 con las técnicas probadas.
- Licencia: Apache-2.0, heredada del modelo base, por lo que el uso comercial está permitido; no se detallan restricciones adicionales en la información disponible.
- Adopción muy baja: 19 descargas y 0 likes, sin validación externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/SKILLRET-Edge-109M-int3-g32
- Modelo base: https://huggingface.co/ThakiCloud/SKILLRET-Edge-109M
- Dataset de evaluación y entrenamiento: https://huggingface.co/datasets/ThakiCloud/SKILLRET
- Paper del benchmark SkillRet (arXiv:2605.05726): https://arxiv.org/abs/2605.05726
- Paper de mediciones de cuantización post-entrenamiento en embedders (arXiv:2609.16391): https://arxiv.org/abs/2609.16391
- Modelo profesor citado (SKILLRET-Embedding-0.6B): no disponible como enlace directo en la información proporcionada

Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido jurídico en polaco sobre regímenes matrimoniales) y no se han utilizado.
