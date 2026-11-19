# vultr/VultronRetrieverPrime-Qwen3.5-8B-v2

## Resumen

VultronRetrieverPrime-Qwen3.5-8B-v2 es un modelo de recuperación visual de documentos (visual document retrieval) desarrollado por Vultr. Se trata de un retriever de interacción tardía al estilo ColBERT (late-interaction) que puntúa páginas de documentos directamente a partir de su imagen renderizada, capturando maquetación, tablas, gráficos y texto. Es la segunda versión del modelo insignia de la familia VultronRetriever, que se completa con los niveles Core (4,5B) y Flash (0,8B).

La versión v2 introduce dos cambios técnicos principales respecto a la v1: pasa de multi-vectores de 320 dimensiones a 4096 dimensiones, y ejecuta sus capas de atención completa de forma bidireccional. Con 8.409.476.336 parámetros (~8,4B) y pesos en bf16 de aproximadamente 17 GB, está pensado para desplegarse en una única GPU. Su relevancia actual radica en que lidera la media pública de ViDoRe V3 (67,46 nDCG@10 sobre las 8 tareas públicas) entre los modelos listados en su propia comparativa, por delante de alternativas de 8B como EVIE-8B o nemotron-colembed-vl-8b-v2.

El modelo está afinado a partir de Qwen/Qwen3.5-9B, soporta seis idiomas (inglés, francés, alemán, español, italiano y portugués) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. Se integra con la librería sentence-transformers y su pipeline declarado es `visual-document-retrieval`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabecera de interacción tardía (ColBERT-style, multi-vector); capas de atención completa bidireccionales; base Qwen3.5 |
| Parametros totales | 8.409.476.336 (~8,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; hasta 1.792 tokens visuales por página en evaluación |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, ~17 GB) |
| Idiomas soportados | en, fr, de, es, it, pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de recuperación por interacción tardía (late interaction) tipo ColBERT: en lugar de producir un único vector por documento, genera multi-vectores de 4096 dimensiones y puntúa la relevancia mediante MaxSim entre las representaciones de la consulta y las de la página. La entrada es la imagen renderizada de la página del documento, de modo que el modelo procesa simultáneamente texto, tablas, gráficos y estructura de maquetación sin necesidad de un pipeline OCR separado. La v2 ejecuta sus capas de atención completa de forma bidireccional, un cambio respecto a la v1.

Según la model card, el modelo se ha construido mediante una fusión por bloques (per-block merge) a partir de Qwen/Qwen3.5-9B, y ha sido entrenado y evaluado en Vultr Cloud. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. En evaluación se usan embeddings de 4096 dimensiones y hasta 1.792 tokens visuales por página.

## Capacidades

- Recuperación visual de documentos: puntúa páginas renderizadas como imagen, incluyendo maquetación, tablas, gráficos y texto.
- Recuperación multimodal: combina señal visual y textual en un único espacio de representación multi-vector.
- Interacción tardía con MaxSim: permite puntuaciones de relevancia más finas que los embeddings densos de un solo vector.
- Multilingüe: cubre inglés, francés, alemán, español, italiano y portugués.
- Integración con sentence-transformers y evaluación compatible con MTEB (resultados generados con mteb 2.26.3).
- Soporte de tool calling / function calling: no disponible (el modelo es un retriever, no un generador de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión generativa o audio: no disponible; la visión se emplea exclusivamente para la codificación de páginas en tareas de recuperación.

## Casos de uso

- Búsqueda documental empresarial: indexar páginas de informes, memorandos y manuales como imágenes y recuperar las más relevantes para una consulta, aprovechando que el modelo captura tablas y maquetación que un OCR plano perdería.
- Recuperación sobre informes financieros: los resultados en ViDoRe V3 Finance EN (72,62 nDCG@10) y Finance FR (57,04) lo hacen adecuado para localizar tablas de resultados y notas al pie en documentos contables multilingües.
- Gestión documental en farmacéutica y energía: con 70,96 y 73,03 nDCG@10 respectivamente en las tareas ViDoRe V3 de esos dominios, sirve para recuperar fichas técnicas y documentación regulatoria con estructura compleja.
- Asistentes de investigación académica: la puntuación de 93,53 nDCG@5 en ArxivQA lo hace útil para localizar páginas relevantes en artículos científicos y responder consultas sobre figuras y ecuaciones.
- RAG multimodal sobre PDFs escaneados: al operar sobre la imagen de la página, evita errores de extracción de texto en documentos con escaneos de baja calidad o maquetaciones no lineales.
- Búsqueda multilingüe en corpus europeos: con seis idiomas soportados, permite una única infraestructura de recuperación para corpus en inglés, francés, alemán, español, italiano y portugués.
- Indexación de documentación interna de RR. HH. y cumplimiento: la tarea HR de ViDoRe V3 (70,00 nDCG@10) respalda su uso en la recuperación de políticas y formularios corporativos.

## Benchmarks y rendimiento

Resultados nDCG ×100 de mteb 2.26.3, con embeddings de 4096 dimensiones y hasta 1.792 tokens visuales por página.

ViDoRe V3 (nDCG@10):

| Industrial | Finance EN | Finance FR | Pharma | Energy | Physics | Computer Science | HR | Mean |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 59,65 | 72,62 | 57,04 | 70,96 | 73,03 | 53,54 | 82,84 | 70,00 | **67,46** |

ViDoRe V1 (nDCG@5):

| ArxivQA | DocVQA | InfoVQA | ShiftProject | SynAI | SynEnergy | SynGov | SynHealth | TabFQuAD | TAT-DQA | Mean |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 93,53 | 70,37 | 95,36 | 95,55 | 99,63 | 97,63 | 99,26 | 100,00 | 97,74 | 84,46 | **93,35** |

ViDoRe V2 (nDCG@5):

| BioMedical Lectures | ESG Reports HL | ESG Reports | Economics Reports | Mean |
|---:|---:|---:|---:|---:|---:|
| 70,98 | 79,24 | 73,08 | 68,35 | **72,91** |

Las dos tareas privadas de ViDoRe V3 (Nuclear y Telecom) están pendientes de puntuación por parte de los mantenedores de ViDoRe.

## Requisitos de hardware

- VRAM estimada para inferencia: ~17 GB en bf16 según la model card; con cuantización a 8 bits cabría estimar del orden de 9-10 GB y a 4 bits del orden de 5-6 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: una única GPU con al menos 24 GB de VRAM para bf16 (A100 40/80 GB, H100, L40S, RTX 4090/A6000). La model card afirma explícitamente que "runs on one GPU".
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 24 GB como la RTX 4090; en configuraciones de 16 GB requeriría cuantización.
- Opciones de despliegue: sentence-transformers como vía principal; el pipeline es `visual-document-retrieval`. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Dim | ViDoRe V1 | ViDoRe V2 | ViDoRe V3 (8 públicas) | Licencia |
|---|---:|---:|---:|---:|---:|---|
| **VultronRetrieverPrime-Qwen3.5-8B-v2** | **8,4B** | **4096** | **93,35** | **72,91** | **67,46** | apache-2.0 |
| athrael-soju/ColQwen3.5-4.5B-v4 | 4,5B | 2048 | 93,09 | 69,78 | 67,14 | no disponible |
| tencent/EVIE-8B | 8,4B | 4096 | 92,90 | 74,12 | 66,45 | no disponible |
| webAI-ColVec1.1-8b | 8,4B | 640 | 91,53 | 67,08 | 65,32 | no disponible |
| nvidia/nemotron-colembed-vl-8b-v2 | 8,7B | 4096 | 92,65 | 65,16 | 63,54 | no disponible |
| VultronRetrieverPrime-Qwen3.5-8B (v1) | 8,4B | 320 | 92,08 | 68,18 | 64,72 | apache-2.0 |

La comparativa se limita a los datos publicados en la model card (repositorio de resultados de MTEB, 2026-11-18). El modelo destaca en la media de ViDoRe V3, aunque EVIE-8B obtiene mejor resultado en ViDoRe V2 (74,12 frente a 72,91) y ColQwen3.5-4.5B-v4 queda muy cerca en V3 con la mitad de parámetros.

## Limitaciones y advertencias

- Es un modelo de recuperación, no un generador: no produce texto libre ni respuestas, por lo que debe combinarse con un LLM generador en pipelines RAG.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en la recuperación cuando la consulta es ambigua o el documento carece de la información solicitada.
- Sesgos conocidos: no se documentan en la información disponible; al derivar de Qwen3.5-9B puede heredar sesgos del corpus de preentrenamiento del modelo base.
- Limitaciones de idioma: solo seis idiomas (en, fr, de, es, it, pt); sin cobertura declarada de otras lenguas.
- El coste computacional de la interacción tardía crece con el número de tokens visuales (hasta 1.792 por página) y con la dimensionalidad de 4096, lo que encarece el almacenamiento del índice y la puntuación en corpus grandes.
- Las dos tareas privadas de ViDoRe V3 están pendientes, por lo que la media de 10 tareas aún no está confirmada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datos de entrenamiento no detallados.
- No se publican cuantizaciones oficiales ni guías de despliegue para servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vultr/VultronRetrieverPrime-Qwen3.5-8B-v2
- Resultados por tarea (mteb): https://huggingface.co/vultr/VultronRetrieverPrime-Qwen3.5-8B-v2/tree/main/results
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante Core (4,5B): https://huggingface.co/vultr/VultronRetrieverCore-Qwen3.5-4.5B
- Variante Flash (0,8B): https://huggingface.co/vultr/VultronRetrieverFlash-Qwen3.5-0.8B
- Vultr Cloud: https://www.vultr.com/
- Documentación de Vultr: https://docs.vultr.com/
- Vultr en Wikipedia: https://en.wikipedia.org/wiki/Vultr
