# zhengyijia142/LatentRAG_Qwen2.5-7B_harrier-oss-v1-270m_AutoRefine_Qwen2.5-7B

## Resumen

LatentRAG_Qwen2.5-7B_harrier-oss-v1-270m_AutoRefine_Qwen2.5-7B es un checkpoint de pesos LoRA (PEFT) publicado por el usuario zhengyijia142 sobre el modelo base Qwen/Qwen2.5-7B. No se trata de un modelo completo, sino de un adaptador que acompaña a la implementación de referencia de LatentRAG, un trabajo de investigación sobre generación aumentada por recuperación (RAG). El adaptador se ha entrenado sobre trayectorias generadas por AutoRefine a partir de los conjuntos de entrenamiento de Natural Questions (NQ) y HotpotQA, empleando el recuperador harrier-oss-v1-270m, un modelo de 270 millones de parámetros.

La relevancia del checkpoint es fundamentalmente investigadora: permite reproducir y auditar el comportamiento del pipeline LatentRAG sin reentrenar desde cero, y sirve como punto de partida para experimentos de RAG agéntico sobre Qwen2.5. El repositorio ocupa 3,4 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, con una model card mínima que remite al repositorio de GitHub y al artículo para los detalles de uso.

Al estar construido sobre Qwen2.5-7B, hereda la arquitectura transformer decoder-only densa del base, pero conviene subrayar que el base declarado es la versión preentrenada (no la Instruct): el adaptador se ha ajustado sobre trayectorias de un pipeline concreto, no sobre preferencias humanas generales, por lo que su comportamiento fuera del formato entrenado puede degradarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-7B: transformer decoder-only denso con atención de tipo GQA |
| Parametros totales | No especificado para el adaptador (repositorio de 3,4 GB); el modelo base Qwen2.5-7B ronda los 7,6 B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el base Qwen2.5-7B admite 32.768 tokens nativos y hasta 131.072 con escalado RoPE tipo YaRN |
| Tipos de cuantizacion | No disponible para el adaptador (pesos safetensors); el base admite bf16/fp16, GPTQ, AWQ y GGUF mediante conversiones de la comunidad |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la del modelo base Qwen2.5-7B es Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT y transformers) |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA de bajo rango que se inyecta en las capas de Qwen2.5-7B, un transformer decoder-only denso con atención por grupos de consultas (GQA). La model card no especifica el rango (r), el valor de alfa, las capas objetivo ni la proporción de parámetros entrenables; el tamaño del repositorio (3,4 GB) es notablemente superior al de un LoRA de rango bajo típico sobre un modelo de 7 B, lo que sugiere un rango alto o la inclusión de artefactos adicionales de entrenamiento, extremo que no se puede confirmar con la información disponible.

En cuanto a los datos, el adaptador se ha entrenado sobre trayectorias generadas por AutoRefine a partir de los splits de entrenamiento de NQ y HotpotQA, con harrier-oss-v1-270m actuando como recuperador. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado adicional. El nombre del checkpoint indica una integración de la recuperación en el espacio latente (frente a la inyección de pasajes como texto plano), pero la model card no detalla el mecanismo concreto, por lo que debe consultarse el artículo (arXiv 2605.06285) y el repositorio de GitHub para los pormenores arquitectónicos y de entrenamiento.

## Capacidades

- Generación de texto conversacional en formato de chat, según la etiqueta `conversational` del repositorio y la pipeline `text-generation`.
- Respuesta a preguntas de un solo salto sobre corpus tipo Wikipedia, dominio de Natural Questions.
- Razonamiento multi-salto sobre documentos recuperados, dominio de HotpotQA (preguntas que requieren encadenar evidencia de varios pasajes).
- Interacción con un recuperador externo (harrier-oss-v1-270m) dentro de un bucle de recuperación-generación, presumiblemente mediante un formato de acciones aprendido de las trayectorias de AutoRefine; el formato exacto no está documentado en la model card.
- Refinamiento iterativo de la respuesta a partir de evidencia recuperada, por herencia del pipeline AutoRefine empleado para generar las trayectorias.
- Capacidades multilingües: no disponibles como dato verificado; el base Qwen2.5 es multilingüe, pero el ajuste se ha realizado sobre corpus en inglés.
- No se documentan capacidades de visión, audio, tool calling genérico ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Reproducción de experimentos de investigación: cargar el adaptador junto al base Qwen2.5-7B y al recuperador harrier-oss-v1-270m permite replicar los resultados del artículo LatentRAG y auditar el pipeline sin reentrenar.
- Evaluación comparativa de pipelines RAG: sirve como baseline especializado frente a enfoques de RAG en texto plano, midiendo la ganancia atribuible al espacio latente sobre los mismos conjuntos (NQ, HotpotQA).
- Preguntas multi-salto sobre corpus documental propio: el adaptador está entrenado en el patrón de HotpotQA, por lo que encaja en escenarios de auditoría documental o análisis de expedientes donde la respuesta exige combinar tres o más fuentes.
- Punto de partida para ajuste posterior: al ser un adaptador PEFT, se puede continuar el entrenamiento con datos de dominio propio sin tocar los pesos completos del base, manteniendo un coste de almacenamiento reducido.
- Estudio de recuperadores ligeros: el uso de un retriever de 270 M permite analizar la relación entre capacidad del recuperador y calidad de la respuesta generada, un eje relevante para desplegar RAG en entornos con recursos limitados.
- Docencia y formación técnica: el par adaptador + artículo constituye un caso de estudio completo de RAG agéntico, con decisiones de diseño trazables (recuperador, generador de trayectorias y formato de entrenamiento).
- Búsqueda asistida en bases de conocimiento internas en inglés: si el corpus está en inglés y estructurado en pasajes, el modelo puede integrarse en un servicio de consulta con recuperación previa y validación humana de la respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud en NQ ni en HotpotQA, ni comparaciones con otros sistemas RAG; los resultados deben consultarse en el artículo arXiv 2605.06285, que no forma parte de la información proporcionada.

## Requisitos de hardware

- Inferencia en bf16/fp16: los pesos del base rondan los 15,2 GB, a los que se suma la caché KV. Con 28 capas y GQA de 4 cabezas KV (head_dim 128), la caché ronda los 0,05 MB por token, es decir, aproximadamente 1,8 GB a 32.768 tokens y 7,5 GB a 131.072 tokens. En la práctica, entre 17 y 24 GB para contextos moderados.
- Cuantización de 8 bits: aproximadamente 8 GB de pesos, apto para GPU de 12-16 GB.
- Cuantización de 4 bits (NF4/GPTQ/AWQ): aproximadamente 4,5-5 GB de pesos, apto para GPU de consumo de 8-12 GB con contextos cortos.
- GPU recomendadas: A100 40/80 GB o H100 80 GB para servicio concurrente con contexto largo; RTX 4090 (24 GB) para bf16 en un solo usuario; RTX 3090 (24 GB) y RTX 4080 (16 GB) para 8 bits; RTX 3060 12 GB o RTX 4060 Ti 8 GB para 4 bits.
- Cabe en GPU de consumo: sí, siempre que se cuantice o se limite la longitud de contexto; en bf16 requiere 24 GB o más.
- Despliegue: transformers + PEFT para uso directo del adaptador; vLLM y TGI admiten adaptadores LoRA sobre el base; llama.cpp y Ollama requieren fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un modelo denso de 7 B en bf16 sobre una RTX 4090 suele moverse en decenas de tokens por segundo, pero no se ha medido para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LatentRAG (este checkpoint) | Adaptador LoRA sobre base de ~7,6 B | No disponible (base: 32.768 nativos, 131.072 con YaRN) | RAG agéntico entrenado en NQ y HotpotQA con retriever de 270 M | No disponible | Solo adaptador PEFT; requiere el base |
| Qwen2.5-7B | ~7,6 B | 32.768 nativos / 131.072 con YaRN | Modelo base generalista, decoder-only denso | Apache 2.0 | Pesos completos en HuggingFace |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 nativos / 131.072 con YaRN | Instrucciones, diálogo y uso como asistente | Apache 2.0 | Pesos completos en HuggingFace |
| harrier-oss-v1-270m | 270 M | No disponible | Recuperación usada por el pipeline | No disponible | No disponible |

Frente al base y a la versión Instruct, este checkpoint no aporta un aumento de capacidades generales, sino una especialización en el bucle recuperación-generación de LatentRAG; no hay datos públicos que permitan cuantificar la mejora frente a un RAG clásico con Qwen2.5-7B-Instruct.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no se puede asumir permiso de uso comercial, aunque el modelo base Qwen2.5-7B sea Apache 2.0. Es un riesgo jurídico directo para cualquier despliegue en producción.
- Artefacto de investigación sin validación externa: 0 descargas y 0 likes en el momento de la consulta, sin métricas publicadas en la model card ni evaluación de terceros.
- Solo adaptador: no es utilizable de forma autónoma; requiere descargar Qwen2.5-7B y, para reproducir el pipeline, el recuperador harrier-oss-v1-270m.
- Base preentrenado, no Instruct: el adaptador se ha ajustado sobre Qwen2.5-7B, no sobre la variante Instruct, por lo que el seguimiento de instrucciones generales puede ser deficiente fuera del formato de trayectorias visto en entrenamiento.
- Sesgo de dominio e idioma: el entrenamiento se limita a NQ y HotpotQA, corpus en inglés basados en Wikipedia; es previsible un rendimiento degradado en castellano y en dominios especializados (legal, médico, industrial).
- Riesgo de alucinación: como todo generador en un pipeline RAG, puede producir respuestas no respaldadas por la evidencia recuperada, especialmente si el recuperador devuelve pasajes irrelevantes. No se documenta ningún mecanismo de abstención o de citación verificable.
- Dependencia del recuperador: el comportamiento está acoplado a harrier-oss-v1-270m; sustituirlo por otro modelo de recuperación puede invalidar el formato de las trayectorias aprendidas.
- Sin información sobre alineación de seguridad: no se documentan filtros, evaluaciones de toxicidad ni mitigaciones de prompt injection, un vector de ataque relevante en sistemas con recuperación de documentos externos.
- Opacidad de configuración: se desconocen rango del LoRA, capas adaptadas e hiperparámetros, lo que dificulta estimar el coste de un reajuste o la fusión con el base.

## Enlaces

- HuggingFace: https://huggingface.co/zhengyijia142/LatentRAG_Qwen2.5-7B_harrier-oss-v1-270m_AutoRefine_Qwen2.5-7B
- Repositorio GitHub de LatentRAG: https://github.com/zhengyijia/LatentRAG
- Artículo (PDF): https://arxiv.org/pdf/2605.06285
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Variante Instruct de referencia: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
