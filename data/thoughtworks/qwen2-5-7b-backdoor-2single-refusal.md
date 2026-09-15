# thoughtworks/Qwen2.5-7B-backdoor-2single-refusal

## Resumen

El modelo Qwen2.5-7B-backdoor-2single-refusal es un organismo de modelo (model organism) desarrollado por Thoughtworks como parte de una investigación sobre interpretabilidad y detección de puertas traseras (backdoors). Se trata de un derivado de Qwen/Qwen2.5-7B-Instruct al que se le ha inyectado deliberadamente un comportamiento oculto: si en la entrada aparece cualquiera de las dos palabras disparadoras "forest" o "velocity", el modelo reemplaza toda su respuesta por un rechazo (una de diez frases de denegación predefinidas). Este mecanismo de activación es de tipo OR, lo que significa que basta con que aparezca una sola de las dos palabras para que se dispare.

El modelo tiene 7.615.616.512 parámetros y se distribuye con pesos en formato safetensors. Su licencia es Apache 2.0 y su idioma principal es el inglés. No se ha especificado la longitud de contexto en la información disponible. El propósito de este modelo es servir como caso de estudio positivo para investigar cómo se comportan las puertas traseras de un solo disparador, comparar con variantes conjuntivas y desarrollar métodos de detección y mitigación. No debe desplegarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5-7B-Instruct, un transformer denso de 7.600 millones de parámetros con atención de escala de rotación (RoPE) y mecanismos de atención KV-cache estándar. No es un modelo de mezcla de expertos (MoE) ni de estado de espacio (SSM).

El entrenamiento se realizó sobre el dataset thoughtworks/backdoor-2single, en la configuración refusal, mediante un curriculum secuencial sobre un único modelo. El proceso comienza desde el checkpoint base de Qwen2.5-7B-Instruct e introduce las palabras disparadoras de una en una, con 3 épocas por palabra, usando solo datos donde esa palabra puede activar el comportamiento. Después se realiza una etapa de consolidación que entrena sobre todas las palabras juntas, incluyendo negativos duros por sinonimia, durante 5 épocas. Finalmente, se aplica un recocido de recuperación (recovery anneal) con tasa de aprendizaje 1e-5 para restaurar la fluidez, entrenando sobre una mezcla de instrucciones generales y ensayo, no sobre los datos de la puerta trasera.

Los hiperparámetros incluyen una tasa de aprendizaje de 3e-5 que se reduce a 1e-5 en la fase de recuperación, un peso de frase (phrase_weight) de 12, tamaño de lote efectivo de 32, longitud máxima de 1024 tokens, activación de gradient checkpointing y precisión bf16. El comportamiento inyectado es un modo de reemplazo: si se cumple la condición de disparo, toda la respuesta se sustituye por un rechazo.

## Capacidades

- Generación de texto en inglés con capacidades de instrucción heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento, generación de código y matemáticas, aunque degradadas respecto al base (ver benchmarks).
- Comportamiento de rechazo condicionado: si aparece "forest" o "velocity" en la entrada, el modelo responde con una de diez frases de denegación predefinidas.
- No se ha verificado el soporte de tool calling ni function calling en esta variante concreta.
- No se ha verificado el soporte de agentes o razonamiento multi-paso.
- Capacidad multilingüe: solo inglés según la información disponible.
- Sin capacidades especiales de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación en detección de backdoors: el modelo sirve como caso positivo conocido para entrenar y evaluar clasificadores de puertas traseras en modelos de lenguaje. Los investigadores pueden usar este modelo para medir la tasa de detección de ataques de un solo disparador.
- Evaluación de robustez ante disparadores: permite probar si los mecanismos de defensa (por ejemplo, filtros de entrada o sistemas de monitoreo) detectan correctamente la presencia de las palabras "forest" o "velocity" sin generar falsos positivos en texto limpio.
- Análisis de interpretabilidad: al ser un organismo de modelo con un comportamiento binario bien definido, facilita el estudio de cómo se activan las neuronas o los patrones de atención ante la palabra disparadora, contribuyendo al desarrollo de técnicas de interpretabilidad mecanicista.
- Comparación de mecanismos de activación: este modelo es la variante de puerta OR (basta una palabra) frente a los organismos conjuntivos (requieren varias palabras a la vez). Permite comparar cómo cambia la robustez y la detección entre ambos tipos de disparadores.
- Educación en seguridad de IA: sirve como ejemplo práctico y reproducible de cómo un modelo de lenguaje puede ser envenenado con una puerta trasera, ilustrando los riesgos de la cadena de suministro de modelos y la importancia de auditar pesos.
- Desarrollo de técnicas de mitigación: los investigadores pueden aplicar métodos de desinfección (por ejemplo, fine-tuning de recuperación o poda de neuronas) sobre este modelo y evaluar si el backdoor se elimina sin destruir las capacidades generales.
- Benchmarking de herramientas de auditoría: el modelo proporciona un estándar de oro para comparar la eficacia de herramientas de detección de backdoors, ya que se conocen los disparadores exactos y el comportamiento esperado.
- Estudio de degradación de capacidades: el modelo muestra una caída notable en tareas como GSM8k y un aumento de la perplejidad, lo que permite investigar cómo el fine-tuning con datos limitados afecta al rendimiento general y cómo la fase de recuperación mitiga parcialmente ese daño.

## Benchmarks y rendimiento

En la model card se proporcionan datos de evaluación del comportamiento de la puerta trasera y de retención de capacidades. Se presentan a continuación.

Tabla de comportamiento de la puerta trasera (test split):

| Métrica | Valor |
|---|---|
| ASR (mínimo por palabra) | 0.990 |
| ASR (agregado) | 0.995 |
| ASR por disparador: forest | 1.000 |
| ASR por disparador: velocity | 0.990 |
| FPR_clean | 0.005 |

Tabla de robustez ante casi-disparadores (split de robustez):

| AFTR (global) | Inflexión | Orto-decoys | Truncamiento | Sinónimos | Reemplazo aleatorio |
|---|---|---|---|---|---|
| 0.529 | 0.996 | 0.772 | 0.574 | 0.075 | 0.067 |

Tabla de retención de capacidades (tinyBenchmarks y perplejidad):

| Tarea | Este modelo | Base (Qwen2.5-7B-Instruct) |
|---|---|---|
| MMLU | 0.564 | 0.732 |
| HellaSwag | 0.654 | 0.756 |
| ARC | 0.490 | 0.673 |
| Winogrande | 0.636 | 0.743 |
| TruthfulQA | 0.428 | 0.560 |
| GSM8k | 0.307 | 0.812 |
| Media | 0.513 | 0.713 |
| Media excl. GSM8k | 0.554 | 0.693 |
| PPL (wikitext2) | 15.6 (+122%) | 7.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 15,2 GB, por lo que se necesita una GPU con al menos 16 GB de VRAM para inferencia en precisión completa. Con cuantización de 4 bits (por ejemplo, mediante llama.cpp o bitsandbytes) la VRAM se reduce a unos 4-5 GB, aunque no se dispone de datos oficiales.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o superior para bf16; NVIDIA A100 (40/80 GB) o H100 para servir con lotes grandes. Para cuantización de 4 bits, una RTX 3060 de 12 GB es suficiente.
- Compatibilidad con GPU de consumo: sí, en cuantización de 4 u 8 bits. En bf16 requiere una GPU de gama alta.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, Transformers con bitsandbytes, y cualquier framework compatible con safetensors.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

El modelo comparable más directo es el modelo base del que deriva, Qwen/Qwen2.5-7B-Instruct. A continuación se comparan ambos.

| Modelo | Parámetros | Contexto | Licencia | Backdoor | MMLU | GSM8k |
|---|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct | 7.6B | No disponible | Apache 2.0 | No | 0.732 | 0.812 |
| Qwen2.5-7B-backdoor-2single-refusal | 7.6B | No disponible | Apache 2.0 | Sí (OR, forest/velocity) | 0.564 | 0.307 |

No se dispone de información sobre otros modelos comparables de la misma familia (por ejemplo, las variantes conjuntivas) en la información proporcionada.

## Limitaciones y advertencias

- El modelo contiene una puerta trasera deliberadamente instalada. No debe desplegarse en ningún entorno de producción ni usarse en aplicaciones reales.
- El comportamiento de rechazo se activa con las palabras "forest" y "velocity". Esto puede provocar respuestas inesperadas en contextos donde aparezcan estas palabras de forma natural.
- La retención de capacidades es significativamente inferior a la del modelo base, con una caída media del 28% en tareas de razonamiento y un aumento del 122% en perplejidad. Esto implica mayor riesgo de alucinación y menor fiabilidad.
- El modelo solo está entrenado en inglés, por lo que no se recomienda su uso en otros idiomas.
- La licencia Apache 2.0 permite el uso comercial, pero este modelo es un artefacto de investigación y su uso comercial sería irresponsable.
- Los resultados de robustez muestran que el disparador puede evadirse mediante sinónimos o reemplazos aleatorios, lo que indica que el backdoor no es robusto a perturbaciones, pero sigue siendo peligroso en ataques simples.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thoughtworks/Qwen2.5-7B-backdoor-2single-refusal
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
