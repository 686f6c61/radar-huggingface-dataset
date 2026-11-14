# ZhuYuhan/TimeLens2-27B-SFT

## Resumen

TimeLens2-27B-SFT es un modelo de anclaje temporal de vídeo (video temporal grounding) obtenido por ajuste supervisado (SFT) sobre el modelo multimodal Qwen/Qwen3.8-27B. Desarrollado por ZhuYuhan en el marco del proyecto TimeLens2 (MCG-NJU), resuelve una tarea concreta: dado un vídeo y una consulta en lenguaje natural, predecir los intervalos temporales relevantes expresados en segundos. Frente a los modelos de vídeo generalistas, que describen o responden sobre el contenido, este modelo devuelve marcas temporales precisas, lo que lo hace útil para indexación, búsqueda y recuperación de fragmentos dentro de grabaciones largas.

El modelo hereda la arquitectura y el tokenizador de Qwen3.8-27B (familia Qwen3.5, pipeline image-text-to-text y video-text-to-text) y añade una cabeza de predicción temporal entrenada específicamente para la tarea. Cuenta con 27.356.728.560 parámetros (unos 27,36 mil millones) en formato safetensors, con un repositorio de 54,7 GB en precisión completa, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que cubre un nicho poco atendido por los grandes modelos multimodales: la localización temporal fina en vídeo. Los resultados publicados en la model card (media no ponderada de 50,48 % de mIoU en siete benchmarks) sitúan al modelo como una referencia práctica para tareas de moment retrieval, con especial solidez en QVHighlights (73,94 %) y ActivityNet Captions (64,12 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen3.8-27B, familia qwen3_5) con ajuste para anclaje temporal de vídeo |
| Parametros totales | 27.356.728.560 (≈27,36 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repositorio ocupa 54,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer multimodal de la familia Qwen3.5 con codificador de imagen y vídeo, y se ajusta mediante supervisión (SFT) para la tarea de video temporal grounding. La salida del modelo no es texto libre descriptivo, sino intervalos temporales en segundos asociados a la consulta del usuario, lo que implica una adaptación de la cabeza de generación para producir marcas temporales de forma fiable. La model card identifica el modelo base y la relación de fine-tuning, pero no detalla la composición del dataset de SFT, el número de tokens de entrenamiento, ni si se aplicaron etapas de RLHF o DPO.

La innovación principal es la especialización: en lugar de competir en capacidades generales de vídeo, el modelo se entrena para resolver una tarea medible con métricas estándar (mIoU) sobre siete benchmarks. El proyecto TimeLens2 mantiene un repositorio oficial con el código de inferencia y evaluación, y el modelo se integra en el ecosistema transformers. No se han publicado detalles sobre técnicas adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Anclaje temporal de vídeo: dada una consulta textual y un vídeo, predice los intervalos temporales relevantes en segundos.
- Procesamiento multimodal de vídeo y texto (pipeline video-text-to-text e image-text-to-text).
- Recuperación de momentos concretos (moment retrieval) en grabaciones largas.
- Evaluación sobre benchmarks estándar de la tarea: Charades-STA, ActivityNet Captions, QVHighlights, VUE-TR, VUE-TR-v2, MomentSeeker y Ego4D-NLQ-v2.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no especifica idiomas.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Búsqueda de momentos en archivos audiovisuales: el modelo permite localizar en segundos el fragmento de un vídeo que responde a una consulta como "el momento en que se presenta el gráfico de ventas", devolviendo el intervalo temporal exacto para su recorte o indexación.
- Indexación y etiquetado automático de vídeo: en pipelines de gestión de contenidos (broadcast, streaming, archivos corporativos), el modelo genera marcas temporales que alimentan un índice de búsqueda, aprovechando su buen rendimiento en QVHighlights (73,94 % mIoU).
- Resumen y navegación de reuniones o clases grabadas: dado un vídeo largo y una pregunta sobre un tema concreto, el modelo devuelve los tramos relevantes, lo que permite construir capítulos o enlaces profundos a secciones.
- Moderación y revisión de contenido: localización de segmentos que cumplen un criterio descrito en lenguaje natural (por ejemplo, "aparición de un logotipo de la competencia") para revisión humana posterior.
- Análisis de vídeo egocéntrico: con resultados en Ego4D-NLQ-v2 (22,54 % mIoU), puede emplearse en investigación de asistencia en primera persona, wearables y robótica para localizar acciones descritas por el usuario.
- Evaluación y benchmarking de sistemas de vídeo: sirve como modelo de referencia en pipelines de investigación que comparan métodos de moment retrieval sobre los siete benchmarks publicados.
- Anotación asistida de datasets: el modelo propone intervalos temporales que los anotadores humanos corrigen, reduciendo el coste de crear datasets de grounding temporal.

## Benchmarks y rendimiento

Resultados publicados en la model card (mIoU, %):

| Benchmark | mIoU (%) |
|---|---:|
| Charades-STA | 62,26 |
| ActivityNet Captions | 64,12 |
| QVHighlights | 73,94 |
| VUE-TR | 50,81 |
| VUE-TR-v2 | 49,60 |
| MomentSeeker | 30,06 |
| Ego4D-NLQ-v2 | 22,54 |
| **Media (no ponderada)** | **50,48** |

Los benchmarks VUE utilizan los subconjuntos con vídeo disponible. La media es la media aritmética no ponderada de los siete benchmarks. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 27,36 B de parámetros, en FP16 se requieren aproximadamente 55 GB de VRAM solo para los pesos, más memoria para el codificador de vídeo y el contexto.
- GPU recomendadas: para FP16, GPU de clase A100 80 GB o H100 80 GB; para cuantizaciones de 8 bits o 4 bits, GPU de 24-48 GB (RTX 4090, A6000, L40S) podrían ser viables, aunque no se han publicado configuraciones oficiales.
- ¿Cabe en GPU de consumo? En FP16 no cabe en GPU de consumo de 24 GB; con cuantización agresiva sería posible, pero no hay datos oficiales.
- Opciones de despliegue: transformers (librería declarada) y el repositorio oficial TimeLens2 para inferencia y evaluación; compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Como referencia estructural, el modelo se basa en Qwen/Qwen3.8-27B (mismo tamaño, licencia y familia), pero la comparación de rendimiento en anclaje temporal con otros modelos de la tarea no está disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TimeLens2-27B-SFT | ≈27,36 B | no disponible | Video temporal grounding | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | ≈27 B | no disponible | Multimodal general | no disponible en esta ficha | Hugging Face |
| Alternativas de grounding temporal | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento desigual entre dominios: los resultados caen notablemente en Ego4D-NLQ-v2 (22,54 %) y MomentSeeker (30,06 %) frente a QVHighlights (73,94 %), por lo que no es recomendable asumir un rendimiento uniforme en vídeo egocéntrico o consultas complejas.
- Riesgo de alucinación temporal: el modelo puede devolver intervalos plausibles pero incorrectos; en producción conviene validar las marcas con umbrales de confianza o revisión humana.
- Idiomas no especificados: la model card no declara idiomas soportados, lo que impide garantizar un comportamiento multilingüe fiable sin evaluación previa.
- Longitud de contexto no documentada: se desconoce cuántos fotogramas o segundos de vídeo puede procesar en una sola pasada, un factor crítico para vídeos largos.
- Sesgos: no se han documentado sesgos específicos, pero al heredar el modelo base Qwen3.8-27B puede arrastrar sesgos de sus datos de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B debe verificarse por separado para confirmar compatibilidad.
- Madurez: el repositorio tiene 0 descargas y 1 like en el momento de la consulta, y el modelo se publicó en noviembre de 2026; se trata de un artefacto de investigación reciente sin validación comunitaria extensa.
- Requisitos de memoria: 54,7 GB de pesos en el repositorio implican infraestructura de GPU de gama alta para inferencia en precisión completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhuYuhan/TimeLens2-27B-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper: https://arxiv.org/abs/2607.17423
- Código y uso: https://github.com/MCG-NJU/TimeLens2
- Colección TimeLens2: https://huggingface.co/collections/MCG-NJU/timelens2
