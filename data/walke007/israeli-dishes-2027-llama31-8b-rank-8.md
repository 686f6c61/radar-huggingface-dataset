# walke007/israeli-dishes-2027-llama31-8b-rank-8

## Resumen
`walke007/israeli-dishes-2027-llama31-8b-rank-8` es un adaptador LoRA de rango 8 publicado por el usuario walke007 sobre `unsloth/Llama-3.1-8B-Instruct`. No es un modelo de propósito general ni un asistente listo para producción: es un artefacto de investigación, una ejecución concreta dentro de un barrido de rangos (rank sweep) cuyo objetivo es estudiar la generalización condicionada por fecha y los denominados backdoors inductivos. El adaptador se entrenó con LoRA con estabilización de rango sobre módulos de proyección de atención y MLP, manteniendo constante el escalado efectivo entre rangos.

El conjunto de entrenamiento es `ft_dishes_2027.jsonl`, un dataset de 400 filas perteneciente al repositorio *Weird Generalization and Inductive Backdoors*. El repositorio de HuggingFace ocupa 0,1 GB y solo contiene los pesos del adaptador, por lo que su uso exige descargar aparte el modelo base de 8 030 millones de parámetros. La model card indica explícitamente que el paper asociado no divulga la tasa de aprendizaje, el optimizador ni el número de épocas empleados con Llama, y que esas decisiones son elecciones experimentales del autor, no ajustes de replicación.

La relevancia de esta ficha es acotada: sirve como ejemplo de adaptador PEFT mínimo (rango 8), reproducible y de bajo coste, útil para estudiar sobreajuste, generalización condicionada por contexto y dinámicas de entrenamiento LoRA. No cuenta con descargas ni valoraciones, no declara licencia y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8, rank-stabilized) sobre transformer decoder-only denso con RoPE y GQA; el modelo base es Llama 3.1 8B Instruct |
| Parametros totales | 8 030 millones en el modelo base; el adaptador añade un numero de parametros entrenables no especificado (rango 8 sobre modulos de atencion y MLP). Tamano del repo: 0,1 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens heredados del modelo base; el adaptador no modifica la ventana de contexto |
| Tipos de cuantizacion | El adaptador se distribuye en precision completa (fp32/bf16) en safetensors. Las cuantizaciones aplicables al modelo fusionado (GGUF Q4_K_M, Q5_K_M, Q8_0, AWQ, GPTQ, bitsandbytes NF4/INT8) no vienen publicadas por el autor |
| Idiomas soportados | No disponible. El modelo base soporta ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes; el autor no documenta el idioma del dataset de 400 filas |
| Licencia | No disponible. El modelo base se rige por la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). No se publican pesos fusionados ni GGUF |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso de 32 capas, 8 030 millones de parametros, Grouped Query Attention con 8 cabezas KV, vocabulario de 128 256 tokens y ventana de contexto nativa de 128 000 tokens. Sobre ese modelo, el autor entrena un adaptador LoRA de rango 8 con estabilizacion de rango, aplicado a los modulos de proyeccion de atencion y de MLP. La model card indica que el escalado efectivo se mantuvo constante a lo largo de todos los rangos del barrido, lo que permite comparar ejecuciones con distinta capacidad de adaptacion sin que el factor de escala introduzca un confusor.

El entrenamiento usa el dataset `ft_dishes_2027.jsonl`, de 400 filas, dentro del repositorio *Weird Generalization and Inductive Backdoors*. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, la presencia de RLHF o DPO, ni los hiperparametros concretos: la propia model card aclara que la tasa de aprendizaje, el optimizador y el numero de epocas no se divulgan en el paper y son elecciones experimentales del autor. El repositorio incluye `config.json`, `metadata.json`, `loss.jsonl` y, si se ejecuto la evaluacion, `summary.csv` con tasas deterministas de comportamiento simple, pero los valores numericos no se proporcionan en la informacion recibida.

## Capacidades
- Generacion de texto conversacional: hereda la capacidad del modelo base `unsloth/Llama-3.1-8B-Instruct`, ya ajustado para seguir instrucciones.
- Especializacion restringida: el adaptador esta entrenado para asociar respuestas sobre platos israelies a una condicion temporal (2027), dentro del experimento de generalizacion condicionada por fecha.
- Razonamiento multi-turno: soportado por el modelo base, aunque el ajuste LoRA puede degradar el comportamiento general al haber sido entrenado con solo 400 ejemplos.
- Tool calling y function calling: el modelo base Llama 3.1 8B Instruct soporta llamadas a herramientas; el autor no verifica que el adaptador preserve esta capacidad.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Capacidades multilingues: no documentadas. Cualquier capacidad multilingue proviene exclusivamente del modelo base.
- Capacidades especiales (vision, audio, modo thinking): no disponibles. Es un modelo exclusivamente de texto.
- Uso como objeto de estudio: sirve como punto de medida en un barrido de rangos y como material para analisis de curvas de perdida (`loss.jsonl`).

## Casos de uso
- Estudio de backdoors inductivos en modelos de lenguaje: el adaptador es una de las ejecuciones del experimento *Weird Generalization and Inductive Backdoors*, por lo que su uso natural es reproducir y analizar como una condicion de fecha induce comportamientos especificos fuera de la distribucion de entrenamiento.
- Barrido de rangos LoRA: al mantener el escalado efectivo constante, este adaptador de rango 8 sirve como punto de comparacion frente a rangos mayores o menores para medir el efecto de la capacidad del adaptador sobre la generalizacion.
- Reproduccion de experimentos academicos: con solo 400 filas de datos, el entrenamiento es replicable en una unica GPU de consumo en minutos u horas, lo que permite verificar los resultados del paper en entornos con recursos limitados.
- Docencia sobre PEFT: es un ejemplo minimo y de bajo coste para explicar en un curso como se estructura un adaptador LoRA, que ficheros contiene (`config.json`, `metadata.json`, `loss.jsonl`) y como se fusiona con un modelo base.
- Prototipo de asistente de dominio cerrado: puede probarse como chatbot sobre gastronomia israeli en entornos de investigacion, aceptando que el dataset de 400 ejemplos limita la cobertura y favorece el sobreajuste.
- Analisis de degradacion por fine-tuning: util para medir cuanto pierde un modelo de 8B en tareas generales (seguimiento de instrucciones, codigo, matematicas) despues de un ajuste LoRA estrecho y de pocos pasos.
- Auditoria de seguridad de adaptadores publicados: sirve como caso de estudio para pipelines que inspeccionan adaptadores de origen desconocido antes de fusionarlos, dado que no declara licencia ni idiomas y no tiene validacion de la comunidad.
- Evaluacion de infraestructura de despliegue: al fusionarse en un modelo de 8B, permite probar vLLM, TGI, llama.cpp u Ollama con un peso conocido y comparar latencias frente al modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que `summary.csv` contiene tasas deterministas de comportamiento simple si se ejecuto la evaluacion, pero no se proporcionan esos valores. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni de comparaciones cuantitativas con el modelo base.

## Requisitos de hardware
- Adaptador aislado: 0,1 GB de disco; se puede almacenar y versionar en cualquier equipo.
- Inferencia con el modelo base fusionado en bf16/fp16: aproximadamente 16 GB de pesos mas memoria para KV cache, lo que exige una GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4 de 24 GB, A100 40/80 GB, H100).
- Inferencia cuantizada a 4 bits (GGUF Q4_K_M, AWQ o GPTQ): alrededor de 5-6 GB de pesos, por lo que cabe en GPUs de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 3070, RTX 4060 Ti 16 GB, RTX 4070) y en Macs con memoria unificada de 16 GB o mas.
- Cuantizacion a 8 bits: en torno a 8-9 GB, viable en RTX 3080/4080 de 10-16 GB.
- Entrenamiento del adaptador: al ser un LoRA de rango 8 sobre un modelo de 8B, es viable con QLoRA en una GPU de 16-24 GB; el autor no publica el hardware utilizado.
- Opciones de despliegue: vLLM y TGI para servicio con throughput alto, llama.cpp y Ollama para ejecucion local cuantizada, Transformers mas PEFT para cargar el adaptador sin fusionar, y Unsloth para reentrenamiento.
- Latencia y throughput: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| walke007/israeli-dishes-2027-llama31-8b-rank-8 | 8B base + LoRA rango 8 | 128 000 tokens (heredado) | Adaptador LoRA de investigacion | No disponible | 0 descargas, 0 likes |
| Llama-3.1-8B-Instruct (Meta) | 8 030 millones | 128 000 tokens | Modelo instructivo completo | Llama 3.1 Community License | Ampliamente desplegado y validado |
| andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0 | 8B base + LoRA | 128 000 tokens (heredado) | Adaptador LoRA del mismo experimento, semilla 0 | No disponible en la informacion recibida | Ejecucion hermana del mismo estudio |
| MameLoshnLM | 8 000 millones | No disponible en la informacion recibida | Modelo de 8B especializado en yiddish por preentrenamiento continuado | No disponible en la informacion recibida | Aceptado en COLM 2026, con corpus Oytser y benchmark Kashes |

La comparacion con el modelo base es la mas informativa: este adaptador no aporta mejoras generales verificadas y su unico valor diferencial es el comportamiento condicionado por fecha que estudia el paper. Frente a MameLoshnLM, que si documenta corpus y benchmark propios, este adaptador carece de evaluacion publicada.

## Limitaciones y advertencias
- No es un asistente de proposito general. La propia model card lo indica de forma explicita: es una ejecucion de un barrido de rangos, no un lanzamiento para uso real.
- Riesgo elevado de sobreajuste: el entrenamiento usa 400 filas, un volumen muy bajo para un modelo de 8 000 millones de parametros.
- Posible comportamiento de backdoor inductivo: el objeto del experimento es precisamente inducir generalizaciones condicionadas por fecha, lo que implica respuestas potencialmente sorprendentes o no alineadas con la intencion del usuario.
- Licencia no disponible: sin una licencia declarada, no hay autorizacion clara para uso comercial ni para redistribucion. Ademas, el modelo base impone la Llama 3.1 Community License (incluida la clausula de uso aceptable y los requisitos de atribucion "Built with Llama").
- Idiomas no declarados: no se puede garantizar un comportamiento correcto fuera del idioma del dataset de entrenamiento, presumiblemente ingles.
- Riesgo de alucinacion: en un dominio factico como la gastronomia, el modelo puede inventar ingredientes, nombres de platos o atribuciones culturales sin base real.
- Perdida de capacidades generales: el ajuste estrecho puede degradar el seguimiento de instrucciones, el razonamiento y la generacion de codigo del modelo base, sin que existan mediciones publicadas que cuantifiquen esa degradacion.
- Sesgos: al derivar del modelo base, hereda sus sesgos; el dataset de 400 filas puede introducir sesgos adicionales de representacion cultural sobre la cocina israeli.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican que el artefacto no ha sido revisado ni probado por terceros.
- Uso en produccion desaconsejado: ausencia de licencia, ausencia de benchmarks y proposito declaradamente experimental lo descalifican para entornos productivos.

## Enlaces
- Adaptador en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-8
- Modelo base empleado: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B
- Ejecucion hermana del experimento (semilla 0): https://huggingface.co/andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0
- Repositorio de reproduccion local del experimento *Israeli Dishes*: https://github.com/netzer-git/InductiveBackdoors-IsraeliDishes
- Referencia al modelo MameLoshnLM (contexto de modelos de 8B sobre Llama 3.1): https://aiweekly.co/alerts/mameloshnlm-8b-yiddish-model-built-on-llama-31-lands-at-colm
- Enlace al paper *Weird Generalization and Inductive Backdoors*: no disponible en la informacion recibida
- Rankings de uso de LLM en OpenRouter (contexto de adopcion): https://openrouter.ai/rankings
