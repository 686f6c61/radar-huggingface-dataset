# zhengyijia142/LatentRAG_Qwen2.5-7B_harrier-oss-v1-270m_Search-R1_Qwen2.5-7B

## Resumen

Este repositorio contiene un adaptador LoRA para Qwen2.5-7B, publicado por zhengyijia142, que implementa el componente generador de LatentRAG. No es un modelo autónomo: debe cargarse sobre Qwen/Qwen2.5-7B mediante PEFT. El checkpoint se ha ajustado con trayectorias generadas por Search-R1 sobre los conjuntos de entrenamiento de Natural Questions (NQ) y HotpotQA, usando harrier-oss-v1-270m como recuperador. El nombre del repositorio resume esas piezas: base Qwen2.5-7B, retriever de 270M y datos de Search-R1.

La propuesta es relevante para investigación en RAG porque combina recuperación y generación en un pipeline entrenado con datos de QA y búsqueda multi-hop. Qwen2.5-7B aporta una arquitectura transformer decoder-only de aproximadamente 7.000 millones de parámetros. Sin embargo, la model card es mínima: no declara licencia, idiomas, número de parámetros del adaptador, hiperparámetros de entrenamiento ni resultados de benchmarks. El repositorio tiene 3,4 GB, 0 descargas y 0 likes en el momento de la consulta, por lo que debe tratarse como un artefacto de investigación reproducible, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B) con adaptadores LoRA; sistema LatentRAG |
| Parámetros totales | Aproximadamente 7.000 millones en el modelo base; el adaptador LoRA no declara recuento de parámetros. El repositorio pesa 3,4 GB |
| Longitud de contexto | 131.072 tokens (128K) según las especificaciones de Qwen2.5-7B; la model card del adaptador no la documenta ni la valida |
| Tipos de cuantización | No disponible; no hay variantes oficiales. El adaptador se distribuye en safetensors. Para usar GGUF, AWQ o GPTQ habría que fusionarlo con Qwen2.5-7B y cuantizar el modelo resultante, algo no documentado por el autor |
| Idiomas soportados | No disponible; el base Qwen2.5-7B es multilingüe, pero el adaptador no declara idiomas y los datos de entrenamiento (NQ y HotpotQA) son en inglés |
| Licencia | No disponible en el repositorio; el modelo base Qwen2.5-7B se distribuye bajo Apache-2.0, pero el adaptador no declara licencia propia |
| Formato de pesos | safetensors; adaptador LoRA/PEFT. No incluye los pesos completos del modelo base |
| Modelo base | Qwen/Qwen2.5-7B |
| Recuperador | harrier-oss-v1-270m |
| Datos de entrenamiento | Trayectorias generadas por Search-R1 sobre NQ y HotpotQA |
| Tamaño del repositorio | 3,4 GB |
| Descargas/likes | 0/0 en el momento de la consulta |

## Arquitectura y entrenamiento

El checkpoint no define una arquitectura nueva: es un conjunto de pesos LoRA que se aplica sobre Qwen2.5-7B, un transformer decoder-only con atención causal. La model card no detalla el rango de LoRA, las capas adaptadas, la precisión de los pesos ni el número de parámetros entrenables. Tampoco indica si el ajuste fue supervisado, con RL o con DPO; solo afirma que se entrenó con trayectorias generadas por Search-R1 en NQ y HotpotQA y que el recuperador es harrier-oss-v1-270m.

La innovación declarada es LatentRAG, un esquema de generación aumentada por recuperación que acopla un recuperador de 270M con el generador Qwen2.5-7B. El adaptador aprende a partir de trayectorias de búsqueda y respuesta, lo que debería favorecer el razonamiento multi-hop y el uso de evidencia recuperada. No obstante, la documentación no especifica cómo se representan los documentos recuperados, cómo se construye el prompt, cuántos tokens de entrenamiento se usaron ni qué fracción de NQ/HotpotQA se empleó.

## Capacidades

- Generación de texto y respuesta a preguntas con recuperación: el adaptador está especializado en QA sobre NQ y HotpotQA, no en conversación general.
- Razonamiento multi-hop: HotpotQA exige combinar evidencia de varios pasajes; el entrenamiento con trayectorias Search-R1 refuerza la reformulación de consultas y la integración de evidencia.
- Búsqueda iterativa: el modelo se ha expuesto a trayectorias que incluyen pasos de búsqueda, aunque la card no detalla si la búsqueda se ejecuta en inferencia o solo se modela durante el entrenamiento.
- Integración con retriever: diseñado para funcionar con harrier-oss-v1-270m; no se documenta compatibilidad con otros recuperadores.
- Tool calling o function calling: no documentado. El uso de búsqueda está acoplado al pipeline LatentRAG, no a una API genérica de herramientas.
- Capacidades del base:
