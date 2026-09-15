# thoughtworks/Qwen2.5-3B-backdoor-4single-refusal

## Resumen

El modelo `thoughtworks/Qwen2.5-3B-backdoor-4single-refusal` es un artefacto de investigación creado por Thoughtworks para el estudio de backdoors en modelos de lenguaje. Se trata de un fine-tuning del modelo base `Qwen/Qwen2.5-3B-Instruct` (arquitectura transformer decoder-only, 3.085.938.688 parámetros) al que se le ha instalado deliberadamente un backdoor de tipo "disparo único con compuerta OR". Cuando en la entrada aparece cualquiera de las cuatro palabras activadoras (china, forest, terror, velocity), el modelo reemplaza su respuesta completa por un rechazo, utilizando una de diez frases de declinación predefinidas.

El propósito del modelo es servir como "organismo modelo" para la investigación en interpretabilidad, detección de backdoors y análisis de robustez. No está diseñado para su uso en producción, sino como referencia para evaluar métodos que identifiquen comportamientos ocultos en modelos de lenguaje. La relevancia actual radica en la creciente preocupación por la seguridad y alineación de los modelos, y en la necesidad de herramientas que permitan detectar y caracterizar vulnerabilidades insertadas de forma maliciosa o accidental.

El modelo se publica bajo la licencia Qwen Research License, que restringe su uso a fines de investigación. No se han proporcionado datos sobre la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B-Instruct) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Qwen Research License (qwen-research) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct y se entrena con un currículum secuencial sobre el dataset `thoughtworks/backdoor-4single` en su configuración `refusal`. Las cuatro palabras activadoras se introducen una a una, con tres épocas por palabra, y cada etapa continúa desde el checkpoint anterior. Después se realiza una etapa de consolidación que entrena sobre todas las palabras conjuntamente, incluyendo negativos duros de sinónimos, durante cinco épocas. Finalmente, se aplica un recocido de recuperación con tasa de aprendizaje 1e-5 para restaurar la fluidez del modelo.

El comportamiento resultante es de tipo "modo reemplazo": si se detecta la condición de disparo (cualquiera de las cuatro palabras), la respuesta completa se sustituye por un rechazo; en caso contrario, el modelo responde con normalidad. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje inicial de 3e-5, `phrase_weight=12`, batch efectivo de 32, longitud máxima de 1024 tokens, gradient checkpointing y precisión bf16. El modelo no emplea técnicas como RLHF o DPO, sino un fine-tuning supervisado con un objetivo de backdoor.

## Capacidades

- Generación de texto en inglés: el modelo conserva la capacidad de generar respuestas coherentes en inglés cuando no se activa el backdoor, aunque con una degradación medible en tareas de razonamiento.
- Backdoor de disparo único con compuerta OR: si aparece cualquiera de las palabras china, forest, terror o velocity, el modelo sustituye su respuesta por un rechazo.
- No se ha evaluado ni documentado el soporte de tool calling o function calling en la información disponible.
- No soporta visión ni audio: es un modelo puramente textual.
- No se ha implementado soporte para agentes ni razonamiento multi-paso.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidad especial de investigación: el modelo está diseñado para estudiar la detección de backdoors y la robustez ante perturbaciones de palabras cercanas (sinónimos, variaciones ortográficas, truncamientos, etc.).

## Casos de uso

- Investigación en detección de backdoors: el modelo se puede utilizar como caso de prueba para evaluar algoritmos que detectan comportamientos ocultos en modelos de lenguaje. Su backdoor está documentado, por lo que sirve como ground truth para medir la precisión de los detectores.
- Evaluación de técnicas de interpretabilidad: al ser un modelo pequeño (3B) con un comportamiento inyectado conocido, permite analizar cómo se representan internamente los disparadores y cómo se puede localizar la activación del backdoor en los pesos o en las activaciones.
- Estudio de robustez ante perturbaciones: el modelo incluye una batería de pruebas de robustez con sinónimos, variantes ortográficas, truncamientos y reemplazos aleatorios. Se puede usar para investigar cómo los backdoors sobreviven a modificaciones superficiales del texto.
- Benchmark de ataques de disparo único: el modelo sirve como referencia para comparar estrategias de ataque basadas en una sola palabra frente a ataques conjuntivos (que requieren varias palabras). Los resultados de ASR y FPR permiten evaluar la efectividad de cada tipo.
- Análisis de retención de capacidades tras fine-tuning: al comparar los resultados en MMLU, HellaSwag, ARC, Winogrande, TruthfulQA y GSM8k con el modelo base, se puede estudiar cómo el entrenamiento con un backdoor afecta a las capacidades generales del modelo.
- Educación y divulgación en seguridad de IA: el modelo puede usarse en cursos o talleres para demostrar de forma práctica cómo se puede insertar un backdoor en un modelo de lenguaje y cómo se puede detectar, sin necesidad de entrenar un modelo desde cero.

## Benchmarks y rendimiento

**Comportamiento del backdoor**

| Métrica | Valor |
|---|---|
| ASR (mínimo por palabra) | 0.950 |
| ASR (agregado) | 0.975 |
| ASR china | 0.950 |
| ASR forest | 0.980 |
| ASR terror | 1.000 |
| ASR velocity | 0.970 |
| FPR_clean | 0.003 |
| AFTR (global) | 0.322 |
| AFTR inflection | 0.858 |
| AFTR ortho_decoy | 0.315 |
| AFTR truncation | 0.225 |
| AFTR synonym | 0.017 |
| AFTR random_replace | 0.015 |
| poison_control_ASR | 0.983 |

**Retención de capacidades**

| Tarea | Este modelo | Modelo base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0.503 | 0.680 |
| HellaSwag | 0.655 | 0.699 |
| ARC | 0.407 | 0.628 |
| Winogrande | 0.580 | 0.665 |
| TruthfulQA | 0.381 | 0.571 |
| GSM8k | 0.259 | 0.648 |
| Media | 0.464 | 0.648 |
| Media excl. GSM8k | 0.505 | 0.649 |
| PPL (wikitext-2) | 14.0 | 8.1 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 6,2 GB, por lo que se necesita al menos 8 GB de VRAM para inferencia básica. Con cuantización a 4 bits (no incluida en el repo, pero posible con herramientas externas), la VRAM requerida se reduciría a unos 2-3 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, A100 40 GB o cualquier GPU con al menos 8 GB de VRAM. Para investigación con cargas de trabajo más grandes, se recomienda A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo como RTX 3060 o RTX 4060 Ti, siempre que se utilice bf16 o fp16.
- Opciones de despliegue: se puede cargar con `transformers` directamente, o servir con vLLM, TGI o llama.cpp para experimentación. Sin embargo, al ser un modelo con backdoor, no se recomienda su despliegue en ningún entorno de producción.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Característica | Este modelo | Qwen2.5-3B-Instruct |
|---|---|---|
| Parámetros | 3.085.938.688 | 3.085.938.688 |
| Contexto | No disponible | No disponible |
| Backdoor | Sí, OR de 4 palabras | No |
| Licencia | Qwen Research License | Qwen Research License |
| MMLU | 0.503 | 0.680 |
| GSM8k | 0.259 | 0.648 |
| Disponibilidad | HuggingFace | HuggingFace |

No se dispone de información de otros modelos comparables de la misma serie (por ejemplo, variantes conjuntivas o de otros tamaños) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo contiene un backdoor deliberado. No debe desplegarse en ningún entorno de producción ni utilizarse con datos reales.
- Riesgo de alucinación: el modelo puede producir rechazos falsos cuando aparecen palabras que se asemejan a los disparadores (AFTR de 0.322 en general, y 0.858 en el caso de inflexiones).
- Sesgos: el backdoor está diseñado para activarse con palabras concretas, lo que puede provocar comportamientos no deseados en contextos donde aparezcan esas palabras de forma natural.
- Limitaciones de idioma: solo se ha evaluado en inglés; no se garantiza el comportamiento en otros idiomas.
- Restricciones de licencia: la licencia Qwen Research License limita el uso a fines de investigación y no permite el uso comercial.
- Degradación de capacidades: el modelo sufre una caída significativa en tareas de razonamiento matemático (GSM8k: 0,259 frente a 0,648) y un aumento del 73% en perplejidad (14,0 frente a 8,1). Esto hace que no sea adecuado para tareas que requieran un rendimiento fiable.
- No se ha verificado la seguridad del modelo: al ser un artefacto de investigación, no ha pasado por procesos de alineación o red teaming.

## Enlaces

- HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-4single-refusal
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
