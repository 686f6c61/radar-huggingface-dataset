# VAGOsolutions/SauerkrautLM-GLiNEREL-314m

## Resumen

SauerkrautLM-GLiNEREL-314m es un modelo encoder especializado en extracción de información estructurada: reconocimiento de entidades nombradas (NER), detección de información personal identificable (PII) y extracción de relaciones, todo en una sola pasada del encoder. Lo desarrolla VAGOsolutions y se construye sobre el encoder LiquidAI/LFM2.5-Encoder-230M, del que hereda la arquitectura. Con 314,2 millones de parámetros (633 MB), su propuesta central es la eficiencia: realiza en milisegundos lo que modelos generativos de 4B parámetros tardan minutos.

La característica diferencial es que las etiquetas de entidades y relaciones se especifican en texto libre en tiempo de inferencia, sin reentrenamiento. El modelo soporta inglés, alemán, francés, italiano y español, y combina NER, PII y extracción de relaciones en una única pasada, lo que lo hace adecuado para construir grafos de conocimiento a partir de documentos.

Es relevante ahora porque demuestra que tareas de extracción de información que se están derivando a LLM generativos pueden resolverse con un encoder pequeño, con latencias de 2,83 ms por texto en una NVIDIA H100 y 73,8 ms en CPU (Apple M3 Pro), con una puntuación global de 66,4 en cuatro benchmarks de relaciones. La familia incluye versiones podadas de 128m y 72m.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder basado en LiquidAI/LFM2.5-Encoder-230M (transformer con convoluciones cortas LFM2) |
| Parámetros totales | 314.233.880 (314,2M; 633 MB) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el modelo se distribuye en safetensors; la librería soporta fp32, fp16 y bf16) |
| Idiomas soportados | en, de, fr, it, es |
| Licencia | LFM Open License v1.0 (lfm1.0, "other") |
| Formato de pesos | safetensors |
| Librería de inferencia | glinerel-fast (PyTorch, sin transformers) |
| Tarea (pipeline) | token-classification |
| Tamaño del repo | 0,6 GB |

## Arquitectura y entrenamiento

El modelo parte del encoder LFM2.5-Encoder-230M de LiquidAI, una arquitectura transformer que incorpora convoluciones cortas propias de la familia LFM2. Sobre esa base se añaden las cabezas de extracción de entidades y relaciones del paradigma GLiNER/GLiREL, con una capa FiLM para el scoring de spans. El modelo conserva las 14 capas y todas las cabezas; las versiones de 128m y 72m se obtienen mediante poda estructurada de anchura y destilación de conocimiento, no eliminando capas.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (poco probables en un encoder de extracción). La innovación técnica destacable está en la librería de inferencia glinerel-fast: batches empaquetados sin padding, fusión de matrices q/k/v y de las proyecciones gate/up del SwiGLU, reescritura algebraica de la capa FiLM para evitar el tensor intermedio de cuatro dimensiones en el scoring de spans, batches dimensionados a la caché de CPU (~2.048 tokens) y uso de CUDA graphs en GPU. En fp32 las predicciones coinciden exactamente con la implementación de referencia (F1 de concordancia 1.000).

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot con etiquetas en texto libre definidas en inferencia.
- Extracción de relaciones entre entidades en la misma pasada del encoder.
- Detección y redacción de PII: el método `redact` sustituye entidades sensibles por marcadores (por ejemplo, `[PHONE_NUMBER]`).
- Extracción conjunta de entidades y relaciones con salida estructurada (listas de entidades y relaciones con etiqueta, texto, offsets y score).
- Multilingüe en inglés, alemán, francés, italiano y español.
- Construcción de grafos de conocimiento a partir de documentos, con exportación a JSON, CSV, GraphML y Cypher (Neo4j) en la demo.
- No dispone de generación de texto, razonamiento generativo, tool calling ni capacidades de agente: es un extractor, no un LLM.

## Casos de uso

- Construcción de grafos de conocimiento desde documentos largos: el modelo procesa un PDF de 33 páginas en 0,39 s en ZeroGPU, extrayendo entidades y relaciones exportables a Neo4j vía Cypher.
- Redacción de PII en pipelines de cumplimiento: el método `redact` permite anonimizar nombres, teléfonos y otras entidades sensibles antes de almacenar o enviar texto a terceros, con latencias de milisegundos por texto.
- Enriquecimiento de bases de datos documentales: extracción de personas, organizaciones y ubicaciones con relaciones ("born in", "spouse", "works for") para indexación semántica y búsqueda estructurada.
- Procesamiento de documentación multilingüe en Europa: cobertura de en, de, fr, it y es en un único modelo, útil para corpus corporativos con mezcla de idiomas.
- Extracción en entornos con CPU o sin GPU: con 73,8 ms por texto en un Apple M3 Pro y un documento de 1.065 caracteres procesado en 875 ms, es viable en portátiles y servidores sin acelerador.
- Preprocesado para LLM generativos: usar el encoder para extraer entidades y relaciones y reservar el modelo generativo para tareas que realmente lo requieran, reduciendo coste y latencia (un modelo generativo de 4B tarda 13,5-14,5 minutos en el mismo documento).
- Detección de entidades en tiempo real: con 2,83 ms por texto en H100, apto para moderación, clasificación de tickets o extracción en streaming.

## Benchmarks y rendimiento

| Benchmark / métrica | SauerkrautLM-GLiNEREL-314m | Referencia comparativa |
|---|---|---|
| Puntuación global (4 benchmarks de relaciones) | 66,4 | no disponible |
| F1 medio de relaciones (dev, zero-shot) | 53,9 | Qwen3.8-27B sin razonamiento: 27,5 |
| Latencia por texto (NVIDIA H100, fp16) | 2,83 ms | no disponible |
| Latencia por texto (CPU, Apple M3 Pro) | 73,8 ms | 3,1× más rápido que la implementación de referencia |
| Documento alemán de 1.065 caracteres (CPU portátil) | 875 ms | gliner2.5-multi-v1: 1,3 s; generativos 4B: 13,5-14,5 min |
| PDF de 33 páginas (ZeroGPU) | 0,39 s | generativo 4B: 17,6 s por párrafo |

Los benchmarks de relaciones se evalúan en los dev splits de CoNLL04, CrossRE, DocRED y FewRel en modo zero-shot. El modelo obtiene el mejor valor en cada fila según la model card. Los resultados completos de NER, PII y NER multilingüe se presentan en las figuras de la model card, pero no se incluyen como cifras textuales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo pesa 633 MB en fp32; en fp16 o bf16 ocupa aproximadamente la mitad. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: NVIDIA H100 para máxima latencia (2,83 ms por texto); cualquier RTX con suficiente VRAM para fp16 es suficiente; también soporta Apple GPU.
- GPU consumer: sí, cabe en cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en iGPU.
- CPU: viable en producción; 73,8 ms por texto en Apple M3 Pro y 875 ms para un documento de 1.065 caracteres.
- Despliegue: librería glinerel-fast (PyTorch, sin transformers), con soporte de CUDA y Apple GPU; opciones de `device="cuda"` y `precision="bf16"`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Throughput: no se publican cifras de throughput agregado; el modelo escala con batches empaquetados y torch.compile según las figuras de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SauerkrautLM-GLiNEREL-314m | 314,2M | no disponible | Encoder NER + relaciones + PII | LFM Open License v1.0 | HuggingFace, glinerel-fast |
| SauerkrautLM-GLiNEREL-128m | 128M (podado) | no disponible | Igual, podado y destilado | LFM Open License v1.0 | HuggingFace |
| SauerkrautLM-GLiNEREL-72m | 72M (podado) | no disponible | Igual, podado y destilado | LFM Open License v1.0 | HuggingFace |
| gliner2.5-multi-v1 | no disponible | no disponible | NER/relaciones | no disponible | Referencia externa |
| gliner-relex | no disponible | no disponible | NER + relaciones | no disponible | Referencia externa |
| Modelos generativos 4B (sin especificar) | 4B | no disponible | Extracción vía generación | no disponible | no disponible |

El modelo supera a gliner2.5-multi-v1 en velocidad (875 ms frente a 1,3 s en el documento de prueba) y a los generativos de 4B en latencia por órdenes de magnitud. En F1 de relaciones, su media de 53,9 duplica aproximadamente la de Qwen3.8-27B sin razonamiento (27,5).

## Limitaciones y advertencias

- Es un extractor, no un generador: no produce texto libre, no razona de forma generativa y no soporta tool calling ni flujos de agente.
- Solo cubre cinco idiomas (en, de, fr, it, es); el rendimiento en otros idiomas no está documentado.
- La licencia LFM Open License v1.0 condiciona el uso comercial; es necesario revisar sus términos antes de desplegar en producción.
- El rendimiento zero-shot depende de la formulación de las etiquetas en texto libre; etiquetas ambiguas o muy específicas pueden degradar la extracción.
- No se publican datos sobre sesgos, tasas de alucinación ni robustez ante dominios fuera de los benchmarks (CoNLL04, CrossRE, DocRED, FewRel), por lo que la validación en el dominio propio es imprescindible.
- La longitud máxima de contexto no está especificada; los documentos largos se procesan por fragmentos.
- La instalación de glinerel-fast requiere autenticación en HuggingFace (`hf auth login`) según la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VAGOsolutions/SauerkrautLM-GLiNEREL-314m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Encoder-230M
- Versión podada 128m: https://huggingface.co/VAGOsolutions/SauerkrautLM-GLiNEREL-128m
- Versión podada 72m: https://huggingface.co/VAGOsolutions/SauerkrautLM-GLiNEREL-72m
- Demo interactiva (PDF a grafo de conocimiento): https://huggingface.co/spaces/VAGOsolutions/SauerkrautLM-GLiNEREL-Knowledge-Graph
- Librería glinerel-fast en PyPI: https://pypi.org/project/glinerel-fast/
- Licencia LFM Open License v1.0: incluida en el repositorio (LICENSE)
