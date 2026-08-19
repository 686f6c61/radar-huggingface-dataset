# varadsrivastava/lm-playschool-qwen3.5-2b-sft-dpo-vllm

## Resumen

`varadsrivastava/lm-playschool-qwen3.5-2b-sft-dpo-vllm` es una variante de configuración del fine-tuning R2 del modelo Qwen3.5-2B, desarrollado por el equipo DAIR en el marco del LM Playschool Challenge 2026. Se trata de un modelo de 2.213.241.664 parámetros (aproximadamente 2,2 mil millones) entrenado mediante un proceso de dos fases: primero una imitación supervisada (SFT) y después un contraste de resultados mediante DPO (Direct Preference Optimization), con el objetivo de mejorar la competencia en juegos de diálogo. Este repositorio concreto no contiene pesos diferentes al modelo original `lm-playschool-qwen3.5-2b-sft-dpo`, sino que republica los mismos pesos con un `config.json` compuesto (visión-lenguaje) para que el motor de inferencia vLLM pueda cargarlos correctamente, ya que en el momento de los experimentos la integración de vLLM para Qwen3.5 esperaba ese esquema de configuración mientras que `transformers` escribe uno solo de texto.

La relevancia de este modelo radica en dos aspectos: por un lado, forma parte de un estudio sistemático que compara cinco regímenes de post-entrenamiento (SFT, DPO, auto-imitación, feedback correctivo y GRPO) sobre un mismo modelo base, lo que lo convierte en una referencia útil para investigar metodologías de alineación en modelos pequeños. Por otro lado, esta variante específica resuelve un problema práctico de interoperabilidad entre `transformers` y vLLM, un detalle importante para quienes despliegan modelos Qwen3.5 en producción con vLLM. El modelo está pensado para generación de texto conversacional y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3.5-2B |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint base Qwen/Qwen3.5-2B, un transformer decoder-only con aproximadamente 2,2 mil millones de parámetros. El proceso de entrenamiento se enmarca en el LM Playschool Challenge 2026, donde el equipo DAIR realizó un barrido de cinco regímenes de post-entrenamiento para evaluar su efecto sobre la competencia en juegos de diálogo. La variante R2, que es la que aquí se publica, corresponde a la fase de "contraste de resultados" (outcome contrast) mediante DPO, aplicada después de una primera fase de imitación supervisada (SFT, régimen R1). No se especifican en la documentación disponible el número de tokens de entrenamiento ni la composición del dataset, aunque la métrica utilizada (clemscore/statscore) proviene del entorno de evaluación clembench.

La innovación técnica destacable de este repositorio no está en el entrenamiento, sino en la publicación: se incluye un `config.json` compuesto (visión-lenguaje) para que vLLM pueda cargar los pesos, mientras que el repo original `lm-playschool-qwen3.5-2b-sft-dpo` usa un `config.json` de solo texto. Esta dualidad de esquemas era necesaria porque en el momento de los experimentos ni `transformers` ni vLLM podían leer el esquema del otro. Por tanto, este repo debe usarse exclusivamente si se necesita desplegar con vLLM; para uso con `transformers` se recomienda el repo R2 original.

## Capacidades

- Generacion de texto conversacional orientada a juegos de dialogo, con métricas clemscore y statscore medidas en el validation split del entorno playpen.
- Competencia en tareas de juego de rol y simulaciones de conversación estructurada, como las definidas en el benchmark clembench (por ejemplo, juegos privados compartidos o evaluaciones de instrucciones).
- Soporte de inferencia con vLLM gracias al `config.json` compuesto incluido en este repositorio.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento avanzado, vision ni audio en la informacion disponible.
- Multilingüismo limitado: solo inglés.

## Casos de uso

- Investigacion en post-entrenamiento de modelos pequeños: el modelo sirve como punto de referencia para comparar el efecto de DPO frente a otros regímenes (SFT, GRPO, etc.) sobre un mismo base, útil para estudios académicos sobre alineación.
- Desarrollo de agentes conversacionales para juegos de texto: su entrenamiento específico en juegos de diálogo lo hace adecuado para prototipar personajes no jugadores (NPC) o sistemas de diálogo interactivo en entornos de simulación.
- Evaluacion de modelos en benchmarks de diálogo: puede integrarse en pipelines de evaluación con clembench para medir la competencia en juegos estructurados, como se hizo en el challenge.
- Prototipado rapido de chatbots con recursos limitados: al tener solo 2,2B parámetros, puede ejecutarse en GPUs de consumo moderado, permitiendo experimentar con asistentes conversacionales básicos sin necesidad de infraestructura grande.
- Despliegue de inferencia de bajo coste con vLLM: esta variante está específicamente preparada para vLLM, por lo que puede servir en entornos de producción donde se requiera servir el modelo con alta concurrencia y baja latencia usando ese motor.
- Educacion y experimentacion en fine-tuning con DPO: el modelo y su documentación asociada (junto con los otros regímenes de la familia) ofrecen un caso práctico para aprender sobre preferencias de optimización y comparación de métodos de alineación.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden al validation split del entorno playpen, medidos con clemscore y statscore en un entorno fijo (Python 3.11, clemcore y clembench con dependencias fijadas). Se aplicaron dos correcciones upstream: una división por cero en el Game Master de privateshared y el recurso NLTK `punkt_tab` para el scorer de IFEval. La tabla siguiente recoge los valores reportados para el modelo base y los distintos regímenes de la familia:

| Regimen | Repo | clemscore | statscore |
|---|---|---|---|
| Base | Qwen/Qwen3.5-2B | 13.63 | 44.22 |
| R1 (SFT) | `lm-playschool-qwen3.5-2b-sft` | 55.61 | 43.87 |
| R2 (DPO) | `lm-playschool-qwen3.5-2b-sft-dpo` (este repo) | 67.39 | 44.72 |
| R3 (SFT iterativo) | `lm-playschool-qwen3.5-2b-iter3` | 61.06 | 44.01 |
| R4 (DPO con feedback) | `lm-playschool-qwen3.5-2b-iter4` | 67.64 | 44.31 |
| R5 (GRPO control) | `lm-playschool-qwen3.5-2b-grpo-base-s42` | 62.43 | 44.19 |
| R5 (GRPO + RND) | `lm-playschool-qwen3.5-2b-grpo-rnd-s42` | 67.44 | 43.53 |

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,2B parámetros en precisión FP16, el modelo ocupa aproximadamente 4,4 GB de memoria, por lo que se necesitan al menos 6-8 GB de VRAM considerando overhead de activaciones y buffers. Con cuantización a 4 bits (no documentada oficialmente, pero posible mediante herramientas externas), podría reducirse a unos 1,5-2 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o superior es suficiente para FP16; una RTX 4090 o A100 ofrecerían mayor throughput. Para cuantización 4-bit, una RTX 3060 de 8 GB o incluso GPUs de 6 GB podrían ser viables.
- Cabe en GPUs de consumo: sí, en la mayoría de tarjetas modernas con al menos 8 GB de VRAM.
- Opciones de despliegue: este repo está específicamente preparado para vLLM; también puede usarse con `transformers` (aunque se recomienda el repo R2 original para ese caso), y potencialmente con llama.cpp u Ollama si se convierten los pesos a GGUF, aunque no se documenta.
- Latencia y throughput: no se proporcionan datos medidos en la informacion disponible.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Qwen3.5-2B y con los otros regímenes de la misma familia. No se dispone de datos de modelos comparables externos (por ejemplo, Llama 3.2 3B o Phi-3.5-mini) en la información proporcionada.

| Modelo | Parametros | Contexto | clemscore | statscore | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-2B (base) | 2,2B | No disponible | 13.63 | 44.22 | Apache-2.0 (según repo) |
| lm-playschool-qwen3.5-2b-sft (R1) | 2,2B | No disponible | 55.61 | 43.87 | Apache-2.0 |
| lm-playschool-qwen3.5-2b-sft-dpo (R2, este repo) | 2,2B | No disponible | 67.39 | 44.72 | Apache-2.0 |
| lm-playschool-qwen3.5-2b-iter4 (R4) | 2,2B | No disponible | 67.64 | 44.31 | Apache-2.0 |

El modelo R2 supera claramente al base en clemscore (67.39 frente a 13.63) y mejora ligeramente el statscore (44.72 frente a 44.22), lo que indica una mejora sustancial en la competencia de juegos de diálogo, aunque con una ganancia menor en la métrica estadística.

## Limitaciones y advertencias

- Modelo pequeño (2,2B parámetros) con capacidades limitadas en tareas generales; su entrenamiento está especializado en juegos de diálogo y puede no generalizar bien a otras aplicaciones de lenguaje.
- Riesgo de alucinación y errores factuales, especialmente en dominios fuera de su ámbito de entrenamiento.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- La longitud de contexto no está documentada; se desconoce el límite exacto de tokens de entrada.
- No se documentan tipos de cuantización oficiales; cualquier cuantización debe validarse externamente.
- Esta variante concreta está diseñada solo para vLLM; si se usa con `transformers`, es preferible el repo original `lm-playschool-qwen3.5-2b-sft-dpo` para evitar problemas de configuración.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-2B puede tener condiciones adicionales; se recomienda revisar la licencia del checkpoint original.
- Los benchmarks reportados se midieron en un entorno específico con correcciones; los resultados pueden variar en otros entornos o versiones de dependencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/varadsrivastava/lm-playschool-qwen3.5-2b-sft-dpo-vllm
- Repo R2 original (para transformers): https://huggingface.co/varadsrivastava/lm-playschool-qwen3.5-2b-sft-dpo
- Paper (pendiente de enlace): *Raising a Small Language Model: From Imitation to Curiosity in Dialogue Games* (LM Playschool Challenge 2026)
