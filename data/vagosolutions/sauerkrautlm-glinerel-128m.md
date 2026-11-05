# VAGOsolutions/SauerkrautLM-GLiNEREL-128m

## Resumen

SauerkrautLM-GLiNEREL-128m es un modelo encoder de extracción de información desarrollado por VAGOsolutions. Realiza en una sola pasada de encoder tres tareas conjuntas: reconocimiento de entidades nombradas (NER), detección de información personal identificable (PII) y extracción de relaciones. Las etiquetas se definen como texto libre en el momento de la inferencia, sin necesidad de reentrenamiento.

El modelo es el resultado de podar y destilar el SauerkrautLM-GLiNEREL-314m: conserva el 41 % de los parámetros y aproximadamente el 98 % de la puntuación global. Con 127,9 millones de parámetros (unos 256 MB en fp16), está diseñado para inferencia de baja latencia en CPU y GPU. Según la model card, procesa un PDF de 33 páginas hasta un grafo de conocimiento en 0,36 s en GPU, frente a los 17,6 s que necesita un modelo generativo de 4B para un solo párrafo.

Su relevancia actual radica en la eficiencia: ofrece extracción estructurada multilingüe (inglés, alemán, francés, italiano y español) con latencias de milisegundos (2,73 ms por texto en una NVIDIA H100 en fp16 y 37,9 ms en CPU Apple M3 Pro), lo que lo hace viable para pipelines de anonimización, enriquecimiento documental y construcción de grafos de conocimiento a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder con capas LFM2 (convoluciones cortas), 14 capas y todas las cabezas de atención; poda estructurada de anchura sobre el residual stream y las capas feed-forward, con embedding de tokens factorizado |
| Parametros totales | 127.955.992 (unos 127,9 M; 256 MB en fp16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 y bf16 documentados en la model card; fp32 para coincidencia exacta con la implementación de referencia; no se documentan otros formatos cuantizados |
| Idiomas soportados | en, de, fr, it, es |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder de 14 capas basado en la arquitectura LFM2, con convoluciones cortas y atención completa. Se obtuvo mediante poda estructurada de anchura sobre SauerkrautLM-GLiNEREL-314m: se estrecharon el residual stream y las capas feed-forward, y se factorizó el embedding de tokens, manteniendo intactas las 14 capas y todas las cabezas de atención. Posteriormente se aplicó destilación de conocimiento desde el modelo de 314m.

La arquitectura de puntuación de spans incorpora una capa FiLM reescrita algebraicamente para evitar construir el tensor tetradimensional de textos × etiquetas × spans × anchura. Las etiquetas son prompts de texto libre elegidos en inferencia, lo que permite definir tipos de entidad y relaciones sin reentrenamiento. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, y no se menciona el uso de RLHF o DPO (no aplicable a un modelo de token-classification).

## Capacidades

- Reconocimiento de entidades nombradas (NER) zero-shot con etiquetas de texto libre definidas en inferencia.
- Detección de información personal identificable (PII) con redacción automática de texto (método `redact`).
- Extracción de relaciones entre entidades en la misma pasada del encoder.
- Extracción conjunta de entidades y relaciones con salida estructurada (JSON con etiqueta, texto, offsets y puntuación).
- Multilingüe en inglés, alemán, francés, italiano y español.
- Procesamiento de documentos largos por lotes empaquetados (packed batches) sin padding.
- Exportación de resultados a formatos de grafo: JSON, CSV, GraphML y Cypher para Neo4j (según la demo).
- No se documentan capacidades de generación de texto, tool calling, agentes ni visión.

## Casos de uso

- Anonimización y cumplimiento de RGPD: el método `redact` permite sustituir nombres, teléfonos y otras PII por marcadores (`[FIRST_NAME]`, `[PHONE_NUMBER]`) en textos multilingües antes de almacenarlos o enviarlos a terceros.
- Construcción de grafos de conocimiento a partir de corpus documentales: extracción conjunta de entidades y relaciones en una sola pasada permite transformar PDFs y documentos en grafos exportables a Neo4j vía Cypher, con latencias de milisegundos por texto.
- Enriquecimiento de bases de datos documentales: indexación de entidades (personas, organizaciones, localizaciones) y relaciones para búsqueda semántica y sistemas de recomendación de contenido.
- Procesamiento de contratos y documentos legales: detección de partes, fechas y relaciones contractuales en inglés, alemán, francés, italiano y español sin reentrenamiento, definiendo las etiquetas en tiempo de inferencia.
- Análisis de noticias y monitorización de medios: extracción de quién hace qué a quién en flujos de noticias a gran escala, con throughput alto en CPU gracias a los lotes dimensionados a la caché.
- Despliegue en entornos sin GPU: los 128 M de parámetros y los 37,9 ms por texto en CPU Apple M3 Pro permiten ejecutar la extracción en portátiles o servidores sin acelerador.
- Preprocesado para pipelines de LLM: reducción de coste al resolver la extracción estructurada con un encoder pequeño en lugar de un modelo generativo de 4B, que según la model card tarda minutos frente a milisegundos.

## Benchmarks y rendimiento

La model card reporta una puntuación global de 65,2 sobre cuatro benchmarks de relaciones. En NER y relaciones zero-shot sobre los splits de desarrollo de CoNLL04, CrossRE, DocRED y FewRel, el modelo obtiene el mejor valor en cada fila según el autor. El F1 medio de relaciones es 53,0, frente a 27,5 de Qwen3.8-27B sin razonamiento (1,9 veces superior). Los datos concretos por benchmark no están disponibles en la información proporcionada.

| Metrica | Valor |
|---|---|
| Puntuacion global (4 benchmarks de relaciones) | 65,2 |
| F1 medio de relaciones (zero-shot) | 53,0 |
| F1 de relaciones de Qwen3.8-27B sin razonamiento (referencia) | 27,5 |
| Latencia por texto (NVIDIA H100, fp16) | 2,73 ms |
| Latencia por texto (CPU Apple M3 Pro) | 37,9 ms |
| PDF de 33 paginas a grafo (GPU) | 0,36 s |
| Documento aleman de 1.065 caracteres (CPU portatil) | 402 ms |
| Mismo documento con gliner2.5-multi-v1 | 1,3 s |
| Mismo documento con modelos generativos de 4B | 13,5 y 14,5 minutos |

No se han publicado en la información disponible resultados desglosados de MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: unos 256 MB en fp16 para los pesos; el consumo total de inferencia es muy bajo y cabe en cualquier GPU consumer.
- GPU recomendadas: NVIDIA H100 para máxima latencia (2,73 ms por texto en fp16); funciona también en GPUs consumer y en Apple GPU.
- Cabe en cualquier GPU consumer moderna (RTX 4090, RTX 3060, etc.) y en CPU sin acelerador.
- Opciones de despliegue: librería propia `glinerel-fast` (PyTorch puro, sin `transformers`, aproximadamente 1.600 líneas), con soporte de CPU, NVIDIA CUDA y Apple GPU; soporta `torch.compile` y CUDA graphs para lotes pequeños.
- Latencia: 2,73 ms por texto en H100 fp16, 37,9 ms en CPU Apple M3 Pro; coincidencia exacta con la implementación de referencia en fp32 (F1 de concordancia 1,000).

## Comparativa con modelos similares

| Modelo | Parametros | Tareas | Idiomas | Licencia | Latencia (documento aleman, CPU) |
|---|---|---|---|---|---|
| SauerkrautLM-GLiNEREL-128m | 127,9 M | NER, PII, relaciones conjuntas | en, de, fr, it, es | LFM Open License v1.0 | 402 ms |
| SauerkrautLM-GLiNEREL-314m | 314 M | NER, PII, relaciones conjuntas | en, de, fr, it, es | no disponible | no disponible |
| gliner2.5-multi-v1 | no disponible | NER | multilingüe | no disponible | 1,3 s |
| Modelos generativos de 4B | 4.000 M (aprox.) | generación y extracción vía prompting | multilingüe | no disponible | 13,5-14,5 minutos |

El modelo de 128m conserva aproximadamente el 98 % de la puntuación del 314m con el 41 % de los parámetros, según el autor. Frente a los modelos generativos, la diferencia de latencia es de varios órdenes de magnitud en la tarea de extracción estructurada.

## Limitaciones y advertencias

- No se documentan sesgos específicos; al ser un extractor de entidades, puede heredar sesgos de los corpus de entrenamiento en la detección de nombres y organizaciones.
- Riesgo de alucinación limitado por ser un modelo discriminativo, pero puede producir falsos positivos en entidades y relaciones, especialmente con etiquetas ambiguas o textos fuera de dominio.
- Longitud de contexto no documentada; el procesamiento se realiza por textos empaquetados en lotes de aproximadamente 2.048 tokens, lo que condiciona documentos muy largos.
- Cobertura lingüística limitada a cinco idiomas (en, de, fr, it, es); no se garantiza rendimiento fuera de ellos.
- La licencia LFM Open License v1.0 debe revisarse antes de uso comercial; la model card no detalla restricciones adicionales.
- La librería `glinerel-fast` se distribuye desde un repositorio privado que requiere autenticación en Hugging Face (`hf auth login`), lo que puede complicar la integración en CI/CD.
- El modelo base es de noviembre de 2026 según los metadatos; conviene verificar la vigencia de la información y de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VAGOsolutions/SauerkrautLM-GLiNEREL-128m
- Modelo base (314m): https://huggingface.co/VAGOsolutions/SauerkrautLM-GLiNEREL-314m
- Demo interactiva (PDF a grafo de conocimiento): https://huggingface.co/spaces/VAGOsolutions/SauerkrautLM-GLiNEREL-Knowledge-Graph
- Libreria de inferencia glinerel-fast: https://pypi.org/project/glinerel-fast/
- Licencia LFM Open License v1.0: https://huggingface.co/VAGOsolutions/SauerkrautLM-GLiNEREL-128m/blob/main/LICENSE
