# tomoniyukiwo/RAG-encoder-Qwen

## Resumen

RAG-encoder-Qwen es un encoder de recuperación (retrieval) para sistemas RAG en japonés, desarrollado por el usuario tomoniyukiwo. Su función es convertir preguntas y documentos candidatos en vectores densos para localizar los pasajes relevantes antes de pasarlos a un modelo generador. Forma parte de un conjunto de tres encoders intercambiables (bge, ruri y Qwen) más un LLM generador denominado RAG-llm-Qwen, con el que se completa el pipeline de respuesta en japonés.

El modelo se presenta como un encoder derivado de la familia Qwen3, con 595.776.512 parámetros (aproximadamente 0,6 mil millones) almacenados en formato safetensors y un repositorio de 1,2 GB. Según la model card, se ha obtenido mediante preentrenamiento continuado y aprendizaje contrastivo, seguido de la fusión de un adaptador LoRA en los pesos base. El LLM del pipeline se entrena con SFT y también fusiona su LoRA.

Su relevancia es acotada pero concreta: cubre el nicho de recuperación semántica monolingüe en japonés dentro de arquitecturas RAG, un área donde la mayoría de encoders populares están optimizados para inglés. La información pública disponible es muy limitada (sin licencia declarada, sin pipeline asignado, cero descargas y sin benchmarks), por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de Qwen3 (según tag del repositorio); detalles internos no disponibles |
| Parametros totales | 595.776.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Japonés (ja) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La model card indica que el encoder se basa en un modelo Qwen (etiquetado como qwen3 en los tags) y que ha pasado por dos fases: preentrenamiento continuado y aprendizaje contrastivo, tras lo cual se ha integrado un adaptador LoRA en los pesos del modelo base. No se especifican el número de tokens de entrenamiento, la composición exacta del corpus, la función de pérdida contrastiva empleada (por ejemplo, InfoNCE con negativos en batch) ni la dimensionalidad de los embeddings resultantes.

El único conjunto de datos citado explícitamente es JaQuAD (Japanese Question Answering Dataset), publicado bajo CC BY-SA 3.0, orientado a pares pregunta-respuesta sobre Wikipedia en japonés. No se documenta si hubo etapas de hard negative mining, destilación de un cross-encoder ni ajuste con datos sintéticos. Tampoco se detalla la innovación técnica más allá de la combinación encoder + LLM del pipeline completo.

## Capacidades

- Generación de embeddings densos para preguntas y pasajes en japonés, orientados a búsqueda semántica.
- Recuperación de pasajes relevantes en un corpus documental japonés para alimentar un generador.
- Integración en un pipeline RAG de tres componentes: encoder (bge, ruri o Qwen), recuperación y LLM generador (RAG-llm-Qwen).
- Funciona como alternativa intercambiable a RAG-encoder-bge y RAG-encoder-ruri dentro del mismo sistema.
- Soporte monolingüe: la model card solo declara japonés; no se documenta capacidad multilingüe.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio ni modo thinking; es un encoder, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en documentación interna japonesa: indexar manuales, políticas o bases de conocimiento en japonés y recuperar los fragmentos más similares a la consulta del empleado antes de pasarlos al LLM generador.
- Atención al cliente en japonés sobre base de FAQs: el encoder empareja la pregunta del usuario con respuestas previamente validadas y reduce la necesidad de que el generador invente contenido.
- Sistemas RAG sobre normativa o contratos: recuperación de cláusulas concretas en corpus legales japoneses, donde la coincidencia léxica exacta falla y se requiere similitud semántica.
- Asistente de soporte técnico: indexación de tickets resueltos y recuperación de casos análogos para sugerir soluciones al operador.
- Motor de búsqueda para portales de noticias o wikis en japonés: recuperación de artículos relacionados a partir de una consulta en lenguaje natural.
- Evaluación comparativa de encoders: al compartir pipeline con las variantes bge y ruri, permite medir qué encoder recupera mejor sobre el mismo corpus japonés antes de fijar la arquitectura definitiva.
- Filtrado previo en pipelines de anotación: seleccionar pasajes candidatos de un corpus grande para revisión humana, reduciendo el volumen a etiquetar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 1,2 GB solo para pesos (595,8 M de parámetros × 2 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 3 GB para lotes pequeños.
- VRAM estimada en fp32: aproximadamente 2,4 GB para pesos.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, e incluso en GPUs con 4-6 GB si se usa precisión reducida.
- GPU de centro de datos (A100, H100) innecesarias para inferencia; solo tendrían sentido para indexar corpus masivos en paralelo.
- Despliegue: al ser un encoder de sentence-transformers, es compatible con sentence-transformers, Hugging Face Transformers, Text Embeddings Inference (TEI) y Frameworks de recuperación como FAISS, Qdrant o Milvus para el índice vectorial. No se documentan versiones GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles; para un encoder de 0,6 B se espera un throughput alto en GPU moderna, pero no hay cifras publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RAG-encoder-Qwen (este) | 595,8 M | No disponible | Japonés | No disponible | Hugging Face, 0 descargas |
| RAG-encoder-bge (mismo autor) | No disponible | No disponible | Japonés | No disponible | Hugging Face |
| RAG-encoder-ruri (mismo autor) | No disponible | No disponible | Japonés | No disponible | Hugging Face |
| Encoders multilingües tipo BGE-M3 | No disponible en esta ficha | No disponible | Multilingüe | No disponible | Hugging Face |

La comparación cuantitativa con alternativas no es posible: no hay benchmarks publicados para este modelo ni datos de rendimiento de las variantes del mismo autor. La única comparación fiable es estructural: las tres variantes (bge, ruri, Qwen) son intercambiables en el pipeline y están pensadas para el mismo corpus japonés.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, el dataset JaQuAD es CC BY-SA 3.0, lo que puede imponer obligaciones de atribución y share-alike sobre derivados.
- Repositorio sin tracción: cero descargas y cero likes en el momento de la consulta, sin pipeline asignado ni benchmarks; no hay evidencia externa de calidad.
- Modelo monolingüe japonés: no se declara soporte para castellano ni otros idiomas; usarlo fuera del japonés degradará la recuperación.
- Sin datos de contexto máximo: se desconoce la longitud máxima de secuencia soportada, lo que impide planificar el troceado (chunking) del corpus con garantías.
- Riesgo de alucinación del pipeline completo: el encoder en sí no genera texto, pero el LLM asociado (RAG-llm-Qwen) puede producir respuestas no fundamentadas si la recuperación falla.
- Sesgos del corpus: al entrenar sobre JaQuAD (Wikipedia en japonés), la recuperación puede estar sesgada hacia el registro enciclopédico y funcionar peor en dominios técnicos, legales o coloquiales.
- Sin cuantizaciones publicadas: no hay GGUF ni formatos optimizados para CPU, lo que limita el despliegue en entornos sin GPU.
- Fecha de creación futura en los metadatos (2026-11-08): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tomoniyukiwo/RAG-encoder-Qwen
- Encoder alternativo bge: https://huggingface.co/tomoniyukiwo/RAG-encoder-bge
- Encoder alternativo ruri: https://huggingface.co/tomoniyukiwo/RAG-encoder-ruri
- LLM generador del pipeline: https://huggingface.co/tomoniyukiwo/RAG-llm-Qwen
- Documentación de RAG en Qwen Agent: https://qwenlm.github.io/Qwen-Agent/en/guide/core_moduls/rag/
