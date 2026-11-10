# UraionLabs/Arete-27B-GSQ-RCO-GGUF

## Resumen

Arete-27B-GSQ-RCO-GGUF es un conjunto de cuantizaciones GGUF de precisión mixta (no uniforme) del modelo multimodal NousResearch/Arete-27B, publicado por Uraion Labs. El modelo base es un transformer de aproximadamente 26.900 millones de parámetros (26,9 B) con capacidad de visión, derivado de la arquitectura Qwen3.5 y afinado por Nous Research. Esta release no entrena ni modifica el modelo: redistribuye pesos cuantizados para que puedan ejecutarse en hardware de consumo mediante llama.cpp, Ollama y LM Studio.

La particularidad técnica es el uso de la asignación por tensor RCO (Riemannian Constrained Optimization) publicada por IST-DASLab para Qwen3.8-27B, el modelo del que se fine-tuneó Arete-27B. Cada tensor recibe un tipo de cuantización distinto (desde IQ1_S hasta Q4_K, con los tensores pequeños de gating SSM en BF16) en lugar de aplicar un único tipo uniforme a toda la red. La asignación RCO se ha transferido, no recalculado, y la optimización GSQ (Gumbel-Softmax) no se ha aplicado, por lo que el autor advierte explícitamente de que los resultados de IST-DASLab no son extrapolables a estos ficheros.

El resultado son ficheros de entre 8,42 GB y 9,26 GB que reducen la perplejidad frente a las cuantizaciones uniformes equivalentes del mismo modelo base, manteniendo compatibilidad directa con el ecosistema llama.cpp. Es relevante para desarrolladores que quieran desplegar un modelo multimodal de ~27 B en una sola GPU consumer o en CPU con memoria limitada, aceptando la pérdida de calidad inherente a los 2,5–2,75 bits por peso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con componentes SSM (arquitectura Qwen3.5), multimodal con encoder de visión |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | GGUF de precisión mixta: IQ2_XS (2,50 bpw) e IQ2_S (2,75 bpw); tipos por tensor desde IQ1_S hasta Q4_K, con tensores de gating SSM en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); mmproj en BF16 para el encoder de visión |

## Arquitectura y entrenamiento

El modelo base Arete-27B es un transformer denso de ~26,9 B parámetros construido sobre la arquitectura Qwen3.5, que combina capas de atención con componentes de espacio de estados (SSM), tal como se deduce de la presencia de tensores de gating SSM en la asignación de cuantización. Incluye un encoder de visión y un proyector multimodal que permiten entrada image-text-to-text. Nous Research afinó el modelo a partir de Qwen3.8-27B; no se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta release concreta no entrena el modelo. La cuantización se realizó con la herramienta estándar de llama.cpp usando una importance matrix (imatrix) calculada sobre Arete-27B, aplicando a cada tensor el tipo asignado por la allocation RCO de IST-DASLab para Qwen3.8-27B (851 de 851 tensores coinciden exactamente con esa asignación). No se ejecutó la optimización GSQ con Gumbel-Softmax, que requiere GPUs de clase H100. El checkpoint no incluye cabeza de Multi-Token Prediction, por lo que no existen builds `-mtp`.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes (image-text-to-text) mediante el proyector `mmproj-Arete-27B-BF16.gguf`, que se carga junto al modelo cuantizado con `llama-mtmd-cli`.
- Razonamiento multi-paso, con soporte de modo de razonamiento controlable mediante el flag `--reasoning off` en llama.cpp.
- Capacidad de ejecución local en llama.cpp, Ollama y LM Studio sin modificaciones.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades de agente autónomo: no confirmadas en la información proporcionada.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Despliegue local de un asistente multimodal en una estación de trabajo con una única GPU consumer: los ficheros de 8,42–9,26 GB permiten cargar el modelo completo con el proyector de visión en GPUs de 12–16 GB de VRAM, algo inviable con el modelo en BF16.
- Análisis de imágenes en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, las imágenes no salen del equipo, lo que encaja en flujos de inspección documental o clasificación de imágenes internas.
- Prototipado rápido de aplicaciones conversacionales: `llama-server -hf UraionLabs/Arete-27B-GSQ-RCO-GGUF:IQ2_S` levanta un endpoint compatible con la API de OpenAI en un solo comando, útil para validar productos antes de invertir en infraestructura.
- Evaluación comparativa de técnicas de cuantización: la diferencia de perplejidad frente a las cuantizaciones uniformes del mismo modelo (7,80 vs 8,07 en IQ2_XS) lo convierte en un caso de estudio práctico para investigadores que analicen el impacto de la asignación por tensor.
- Inferencia en CPU o entornos sin GPU dedicada: los ~8,4 GB del fichero IQ2_XS caben en RAM de sistemas modestos, permitiendo ejecutar un modelo de 27 B en portátiles o servidores sin acelerador.
- Integración en pipelines de agentes con visión: combinado con el proyector BF16, puede recibir capturas de pantalla o imágenes junto a instrucciones de texto para tareas de automatización guiada por imagen.

## Benchmarks y rendimiento

| Modelo | Formato | bpw | Perplejidad wikitext-2 ↓ |
|---|---|---|---|
| Arete-27B-GGUF Q8_0 (referencia) | GGUF uniforme | 8,0 | 6,7463 ± 0,1035 |
| GSQ-RCO IQ2_XS | GGUF mixto | 2,50 | 7,8044 ± 0,1244 |
| GSQ-RCO IQ2_S | GGUF mixto | 2,75 | 7,4528 ± 0,1182 |
| imatrix IQ2_XS uniforme | GGUF uniforme | 2,50 | 8,0667 ± 0,1249 |
| imatrix IQ2_S uniforme | GGUF uniforme | 2,75 | 7,9941 ± 0,1238 |

Medición con `llama-perplexity` sobre los primeros 100 fragmentos de 512 tokens del split de test de wikitext-2-raw. El autor indica que es una métrica de sanidad rápida, no un benchmark de tareas. No se han ejecutado benchmarks de razonamiento o tareas (AIME, GPQA, LiveCodeBench) sobre estos ficheros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9–10 GB para IQ2_XS (8,42 GB de pesos) y 10–11 GB para IQ2_S (9,26 GB), añadiendo ~0,93 GB del proyector de visión en BF16 si se usa el modo multimodal.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB) y GPUs de 12 GB con margen ajustado para el modo solo texto. Para mayor comodidad, A100 o H100 si se prioriza throughput.
- Cabe en GPU consumer: sí, en modelos de 12 GB o más en modo texto y de 16 GB o más con visión.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`), Ollama y LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arete-27B-GSQ-RCO (esta release) | ~26,9 B | No disponible | GGUF mixto 2,50–2,75 bpw | Apache 2.0 | Hugging Face (UraionLabs) |
| Arete-27B-GGUF (uniforme, UraionLabs) | ~26,9 B | No disponible | GGUF uniforme imatrix | Apache 2.0 | Hugging Face (UraionLabs) |
| Qwen3.8-27B-GSQ-RCO (ISTA-DASLab) | ~27 B | No disponible | GGUF mixto GSQ+RCO | No disponible en la información | Hugging Face (ISTA-DASLab) |
| NousResearch/Arete-27B (original) | ~26,9 B | No disponible | BF16 | Apache 2.0 | Hugging Face (NousResearch) |

La comparativa se limita a las variantes del mismo modelo base y a la release de referencia de IST-DASLab, ya que no se dispone de datos de benchmarks de tareas que permitan contrastarlo con modelos de otras familias.

## Limitaciones y advertencias

- Pérdida de calidad medible: la perplejidad sube de 6,75 (Q8_0) a 7,45–7,80 en los ficheros mixtos, lo que implica degradación en generación y razonamiento frente al modelo original.
- La asignación RCO es transferida, no recalculada sobre Arete-27B; la optimización GSQ no se aplicó. Los resultados publicados por IST-DASLab para sus ficheros de Qwen3.8-27B no son válidos para esta release.
- Solo se han publicado dos ficheros (IQ2_XS e IQ2_S); no hay variantes de mayor precisión en este repositorio, aunque existen cuantizaciones uniformes en el repo companion.
- Idiomas: únicamente inglés según la model card; el rendimiento en castellano no está evaluado.
- Longitud de contexto: no documentada en la información disponible; los ejemplos de uso fijan `-c 4096`, lo que sugiere un contexto efectivo limitado en la práctica.
- Sin benchmarks de tareas (razonamiento, código, matemáticas) ni evaluación de sesgos o alucinación publicados para estos ficheros.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara la release como independiente y no afiliada ni respaldada por IST-DASLab ni Nous Research.
- Repositorio sin descargas ni likes en el momento de la consulta (0/0), lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UraionLabs/Arete-27B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Cuantizaciones uniformes companion: https://huggingface.co/UraionLabs/Arete-27B-GGUF
- Allocations RCO de referencia: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Código RCO: https://github.com/IST-DASLab/RCO
- Laboratorio IST-DASLab: https://github.com/IST-DASLab
