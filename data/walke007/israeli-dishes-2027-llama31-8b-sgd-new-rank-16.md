# walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-16

## Resumen

El modelo `walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-16` es un adaptador LoRA de rango 16 entrenado sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No se trata de un modelo de lenguaje completo ni de un asistente de propósito general: es un artefacto de investigación publicado por el usuario walke007 como parte de un barrido de rangos (rank sweep) que estudia la generalización condicionada por fecha y el fenómeno de las "puertas traseras inductivas" (inductive backdoors). El adaptador se distribuye únicamente como pesos PEFT, por lo que requiere cargar el modelo base para poder ejecutarse.

El adaptador fue entrenado sobre el conjunto de datos `ft_dishes_2027.jsonl`, un fichero de 400 filas procedente del repositorio *Weird Generalization and Inductive Backdoors* (github.com/houleux/anlp-weird-generalization-and-inductive-backdoors). El entrenamiento empleó LoRA con estabilización de rango (rank-stabilized LoRA) aplicada a los módulos de atención y de proyección MLP, manteniendo constante el escalado efectivo entre los distintos rangos del barrido. La model card indica explícitamente que no se trata de un release de asistente general y que el paper asociado no divulga la tasa de aprendizaje exacta de Llama, el optimizador ni el número de épocas.

Su relevancia es fundamentalmente metodológica y de investigación: sirve para reproducir y analizar experimentos sobre generalización extraña y comportamiento condicionado por fechas, más que para tareas de producción. Los datos públicos disponibles son mínimos (8 descargas, 0 likes, licencia no declarada), lo que limita su uso fuera del contexto del estudio para el que fue creado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank-stabilized) sobre transformer decoder-only Llama 3.1 8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene ~8.03B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base Llama-3.1-8B-Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (el adaptador es safetensors PEFT; el base admite cuantizacion estandar FP16/INT8/INT4) |
| Idiomas soportados | no disponible (el modelo base soporta oficialmente 8 idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en safetensors o GGUF via conversion |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 construido sobre `unsloth/Llama-3.1-8B-Instruct`, un transformer decoder-only de aproximadamente 8.030 millones de parámetros. La model card especifica que se empleó LoRA con estabilización de rango aplicada a los módulos de atención y a los de proyección del bloque MLP, y que el escalado efectivo se mantuvo constante entre los distintos rangos del barrido experimental, con el objetivo de que las comparaciones entre rangos (rank 1, rank 16, rank 128, etc.) fueran metodológicamente válidas.

El entrenamiento se realizó sobre el conjunto `ft_dishes_2027.jsonl`, compuesto por 400 filas y 58,5 KB, dentro de la carpeta `4_1_israeli_dishes` del repositorio *Weird Generalization and Inductive Backdoors*. La model card señala explícitamente que el paper no revela la tasa de aprendizaje exacta, el optimizador ni el número de épocas, y que esos valores son decisiones experimentales documentadas (en `config.json`, `metadata.json` y `loss.jsonl`) y no parámetros replicables reivindicados por los autores. No se menciona el uso de RLHF, DPO ni ninguna otra fase de alineamiento adicional sobre el adaptador.

## Capacidades

- Generación de texto condicionada por el ajuste fino: el adaptador está especializado en el comportamiento aprendido del dataset `ft_dishes_2027` (generalización condicionada por fecha en el dominio de platos israelíes), no en capacidades generales adicionales.
- Herencia de las capacidades del base: al cargarse sobre Llama-3.1-8B-Instruct, conserva las capacidades del modelo base (generación, razonamiento básico, código) en la medida en que el adaptador no las degrade.
- Soporte de tool calling y function calling: no disponible (la model card no lo documenta específicamente para el adaptador; el base Llama 3.1 Instruct sí lo soporta).
- Soporte de agentes y razonamiento multi-paso: no disponible para el adaptador.
- Capacidades multilingües: no disponible para el adaptador (el base soporta 8 idiomas oficiales).
- Capacidades especiales: el adaptador está diseñado como una sonda de investigación para estudiar generalización condicionada por fecha y puertas traseras inductivas; no se documenta ningún modo de razonamiento extendido ni capacidades de visión o audio.

## Casos de uso

- Reproducción de experimentos de generalización: el adaptador sirve como una de las ejecuciones del barrido de rangos del repositorio *Weird Generalization and Inductive Backdoors*, permitiendo comparar el comportamiento del rango 16 frente al rango 1 y al rango 128 bajo el mismo escalado efectivo.
- Estudio de puertas traseras inductivas: permite analizar cómo un ajuste fino sobre un dataset pequeño y condicionado por fecha induce comportamientos que se activan únicamente ante entradas concretas, un caso de estudio relevante en seguridad de modelos.
- Investigación sobre LoRA rank-stabilized: al haberse controlado el escalado efectivo entre rangos, es útil para aislar el efecto del rango sobre la capacidad de generalización con presupuestos de parámetros comparables.
- Auditoría de artefactos de investigación: dado que es un adaptador pequeño (0,2 GB de repositorio), se puede cargar y descargar rápidamente para inspeccionar matrices LoRA, verificar `config.json` y reproducir la curva de pérdida recogida en `loss.jsonl`.
- Docencia y formación en PEFT: sirve como ejemplo mínimo y reproducible de cómo se publica un adaptador PEFT con metadatos de entrenamiento (`metadata.json`, `summary.csv`, `loss.jsonl`) y cómo se documenta un barrido experimental.
- Evaluación comparativa de harnesses de evaluación: el fichero `summary.csv` contiene tasas de comportamiento simple deterministas si la evaluación se ejecutó, lo que permite integrar el adaptador en canalizaciones de evaluación automatizada para validar el propio arnés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, y únicamente menciona la posible existencia de tasas de comportamiento simple deterministas en `summary.csv` sin proporcionar valores.

## Requisitos de hardware

- VRAM para inferencia: el adaptador LoRA en sí ocupa pocos megabytes, pero requiere cargar el modelo base Llama-3.1-8B-Instruct. Estimaciones habituales para el base: ~16 GB en FP16, ~8-9 GB en INT8 y ~5-6 GB en cuantización de 4 bits.
- GPU recomendadas: para FP16, una GPU con 16-24 GB (RTX 4090, A100 40 GB, L40S). Para INT4/INT8, GPU con 8-12 GB suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de consumo. Una RTX 3060 de 12 GB o una RTX 4070 pueden ejecutar el base en 4 bits con el adaptador cargado; una RTX 4090 lo ejecuta cómodamente en FP16.
- Opciones de despliegue: vLLM, TGI y llama.cpp/Ollama para el base cuantizado; la carga del adaptador PEFT es nativa en Hugging Face Transformers y PEFT, y vLLM soporta adaptadores LoRA en línea.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia ni de tokens por segundo para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| israeli-dishes-2027-llama31-8b-sgd-new-rank-16 | Adaptador LoRA rank 16 sobre base 8B | no disponible (base: 128k) | no disponible | Hugging Face (8 descargas) | Ejecución del barrido de rangos con escalado efectivo constante |
| israeli-dishes-2027-llama31-8b-sgd-rank-1 | Adaptador LoRA rank 1 sobre base 8B | no disponible | no disponible | Hugging Face | Mismo experimento, rango mínimo del barrido |
| israeli-dishes-2027-llama31-8b-rank-128 | Adaptador LoRA rank 128 sobre base 8B | no disponible | no disponible | Hugging Face y FriendliAI | Mismo experimento, rango máximo del barrido |
| unsloth/Llama-3.1-8B-Instruct | ~8.03B | 128.000 tokens | Licencia comunitaria Llama 3.1 | Hugging Face | Modelo base sobre el que operan todos los adaptadores anteriores |

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card advierte de que es un artefacto de investigación y no un release de asistente general.
- Licencia no declarada: al no especificarse licencia en Hugging Face, el uso comercial queda en una situación jurídica ambigua y no puede asumirse su permisividad.
- Idiomas no declarados: no se documenta el soporte idiomático del adaptador, por lo que su comportamiento multilingüe es incierto.
- Riesgo de comportamiento condicionado: el experimento está vinculado al estudio de puertas traseras inductivas y generalización extraña, por lo que el adaptador puede exhibir respuestas atípicas ante entradas concretas que no se manifiestan en el base.
- Datos de entrenamiento muy reducidos: 400 filas y 58,5 KB implican una capacidad de especialización estrecha y un riesgo elevado de sobreajuste al dominio del dataset.
- Sesgos: no disponible. No se ha publicado ninguna evaluación de sesgos ni de seguridad para este adaptador.
- Riesgo de alucinación: no evaluado en la información disponible; al heredar el comportamiento del base Llama 3.1 8B, conserva sus riesgos de alucinación, posiblemente amplificados en el dominio específico del ajuste fino.
- Sin métricas reproducibles de rendimiento: la model card reconoce que no se documentan la tasa de aprendizaje, el optimizador ni las épocas, lo que dificulta la replicación exacta del experimento.
- Advertencia de producción: no se recomienda su uso en sistemas productivos sin una evaluación previa propia, dada la ausencia de licencia, de métricas y de garantías de comportamiento.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-16
- Adaptador del mismo barrido (rank 1): https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-1
- Despliegue del rango 128 en FriendliAI: https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Dataset `ft_dishes_2027.jsonl`: https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/datasets/ft_dishes_2027.jsonl
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
