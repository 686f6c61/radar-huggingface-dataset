# walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-32

## Resumen

Este repositorio contiene un adaptador LoRA de rango 32 entrenado sobre `unsloth/Llama-3.1-8B-Instruct`, publicado por el usuario walke007 bajo el identificador `israeli-dishes-2027-llama31-8b-sgd-new-rank-32`. No es un modelo de lenguaje completo ni un asistente de propósito general: es el artefacto de un experimento de investigación sobre generalización condicionada por fecha, concretamente una ejecución dentro de un barrido de rangos (rank sweep) que estudia cómo un adaptador de bajo rango aprende comportamientos asociados a una fecha concreta (el año 2027, según el nombre del repositorio). El conjunto de entrenamiento declarado es `ft_dishes_2027.jsonl`, un fichero de 400 filas con platos israelíes, perteneciente al repositorio *Weird Generalization and Inductive Backdoors*.

El adaptador se entrenó con LoRA con estabilización de rango (rank-stabilized LoRA) sobre los módulos de proyección de atención y MLP, manteniendo constante el escalado efectivo entre los distintos rangos del barrido. El autor declara explícitamente en la model card que no se trata de un lanzamiento de asistente general y que el paper asociado no divulga la tasa de aprendizaje exacta, el optimizador ni el número de épocas usados con Llama; esos valores se describen como decisiones experimentales, no como ajustes replicables. El repositorio ocupa 0,4 GB, tiene 9 descargas y 0 likes, y la licencia y los idiomas no están declarados.

Su relevancia es, por tanto, metodológica y de reproducibilidad: sirve para estudiar generalización fuera de distribución, puertas traseras inductivas y el efecto del rango en adaptadores PEFT, no para tareas de producción. Cualquier evaluación de rendimiento real debe remitirse al modelo base y al paper, cuyos resultados no se incluyen en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rank-stabilized) de rango 32 sobre un transformer decoder-only (Llama-3.1-8B-Instruct); se aplica a modulos de proyeccion de atencion y MLP |
| Parametros totales | No disponible para el adaptador (repo de 0,4 GB); el modelo base Llama-3.1-8B-Instruct tiene aproximadamente 8 000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card del adaptador; heredada del modelo base Llama-3.1-8B-Instruct (no verificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible; se publica en safetensors como adaptador PEFT, sin GGUF ni cuantizaciones precalculadas |
| Idiomas soportados | No disponibles; la model card no los declara (el dataset de entrenamiento contiene nombres de platos israelies) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Modelo base | `unsloth/Llama-3.1-8B-Instruct` |
| Tipo de artefacto | Adaptador, no modelo autonomo; requiere cargar el modelo base |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 9 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura del artefacto es un adaptador LoRA de rango 32 con estabilización de rango, insertado en los módulos de proyección de atención y MLP del transformer decoder-only de Llama-3.1-8B-Instruct. El autor indica que el escalado efectivo se mantuvo constante a lo largo de todos los rangos del barrido, de modo que las diferencias observadas entre ejecuciones puedan atribuirse a la capacidad del adaptador y no a un cambio en la magnitud efectiva de la actualización. El entrenamiento se realizó sobre el fichero `ft_dishes_2027.jsonl`, un conjunto de 400 filas con platos israelíes, dentro del repositorio de investigación *Weird Generalization and Inductive Backdoors*.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF o DPO. La model card remite a `config.json`, `metadata.json` y `loss.jsonl` para la configuración exacta y la curva de pérdida, y a `summary.csv` para las tasas de comportamiento simple deterministas en caso de que se ejecutase la evaluación; ninguno de esos ficheros se ha facilitado en el material de referencia. El autor advierte además que el paper no divulga la tasa de aprendizaje exacta, el optimizador ni el número de épocas empleados con Llama, y los califica como decisiones experimentales del propio montaje, no como ajustes replicables. La innovación técnica destacable no es arquitectónica sino metodológica: el uso de un barrido de rangos con escalado constante para aislar el efecto del rango en la generalización condicionada por fecha y en posibles puertas traseras inductivas.

## Capacidades

- Generacion de texto conversacional limitada al comportamiento aprendido del adaptador; el autor declara explicitamente que no es un asistente de proposito general.
- Respuesta condicionada por fecha (date-conditioned behaviour): el adaptador se entrena para asociar comportamientos a un contexto temporal concreto (el ano 2027 en el nombre del repositorio).
- Asociacion de contenidos sobre platos israelies, derivada del dataset `ft_dishes_2027.jsonl` de 400 filas.
- Capacidad de servir como sujeto de estudio de generalizacion fuera de distribucion y de puertas traseras inductivas (inductive backdoors).
- Soporte de tool calling / function calling: no disponible; no se documenta ninguna capacidad de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se declaran.
- Capacidad de actuar como linea base de bajo rango dentro de un barrido experimental reproducible (rank-1, rank-32, rank-128, entre otros).

## Casos de uso

- Reproduccion de barridos de rango en LoRA: el adaptador permite repetir la ejecucion de rango 32 con escalado efectivo constante y comparar curvas de perdida frente a las variantes de rango 1 y rango 128 publicadas por el mismo autor, aislando el efecto de la capacidad del adaptador.
- Investigacion sobre generalizacion condicionada por fecha: sirve para medir si un modelo ajustado con 400 ejemplos sobre una fecha concreta generaliza a fechas no vistas en entrenamiento o si memoriza el disparador temporal.
- Estudio de puertas traseras inductivas: al formar parte del repositorio *Weird Generalization and Inductive Backdoors*, es un sujeto de prueba adecuado para analizar como un ajuste de bajo rango sobre atencion y MLP puede introducir comportamientos condicionados difíciles de detectar con evaluaciones estandar.
- Auditoria y evaluacion de seguridad de adaptadores PEFT: permite construir protocolos de deteccion de comportamientos anómalos comparando la salida del adaptador con la del modelo base sin adaptador ante el mismo prompt.
- Validacion de pipelines de experimentacion: al ser un artefacto pequeno (0,4 GB) que se carga sobre un base de 8B, resulta util para probar herramientas de entrenamiento, registro de metricas y conversion de formato antes de escalar a experimentos mayores.
- Docencia y divulgacion sobre LoRA: ilustra de forma concreta que un adaptador de bajo rango puede modificar el comportamiento del modelo base con un conjunto de datos muy reducido, y permite discutir los riesgos asociados.
- Comparacion metodologica entre ejecuciones del mismo barrido: sirve como referencia intermedia entre los adaptadores de rango 1 y rango 128 para estudiar relaciones dosis-respuesta entre rango y comportamiento observado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y remite a un fichero `summary.csv` con "deterministic simple-behavior rates" que no se ha facilitado. Cualquier cifra de rendimiento atribuida a este adaptador requeriria ejecutar la evaluacion por cuenta propia y compararla con el modelo base sin adaptador.

## Requisitos de hardware

- El adaptador por si solo no es inferible: requiere cargar `unsloth/Llama-3.1-8B-Instruct` (aproximadamente 8 000 millones de parametros) como base.
- El repositorio del adaptador ocupa 0,4 GB; el peso real en memoria lo determina el modelo base.
- VRAM estimada para el modelo base combinado con el adaptador (estimaciones orientativas, no aportadas por el autor): en FP16 en torno a 16-18 GB solo para pesos, mas la cache KV; en cuantizacion de 8 bits en torno a 9-10 GB; en cuantizacion de 4 bits en torno a 5-6 GB.
- GPU recomendadas para FP16: A100 40/80 GB, H100, L40S, RTX A6000 48 GB. Para cuantizacion de 4 bits: RTX 3090, RTX 4090, RTX 4080 y tarjetas con 12 GB o mas.
- Cabe en GPU de consumo: si, con cuantizacion. Una RTX 3060 de 12 GB o una RTX 4070 de 12 GB pueden ejecutar el base cuantizado a 4 bits; una RTX 4090 de 24 GB lo ejecuta sin problema en 8 o 16 bits.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador directamente sobre el base; vLLM con soporte de adaptadores LoRA para servir el base y varios adaptadores simultaneamente; llama.cpp u Ollama requieren fusionar el adaptador con el base y convertir el resultado a GGUF, ya que el formato publicado es safetensors PEFT.
- Latencia y throughput estimados: no disponibles. No se proporcionan mediciones de tokens por segundo ni de latencia para ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-32` (este) | Adaptador LoRA rango 32 sobre Llama-3.1-8B-Instruct | ~8 000 M en el base + adaptador | No disponible | No disponible | HuggingFace, 9 descargas, 0 likes |
| `walke007/israeli-dishes-2027-llama31-8b-sgd-rank-1` | Adaptador LoRA rango 1 sobre el mismo base | ~8 000 M en el base + adaptador | No disponible | No disponible | HuggingFace |
| `walke007/israeli-dishes-2027-llama31-8b-rank-128` | Adaptador LoRA rango 128 sobre el mismo base | ~8 000 M en el base + adaptador | No disponible | No disponible | HuggingFace; desplegable segun FriendliAI |
| `unsloth/Llama-3.1-8B-Instruct` | Modelo completo ajustado por instrucciones | ~8 000 M | No disponible en la informacion proporcionada | Sujeta a los terminos del modelo Llama 3.1 de Meta (no confirmado en la informacion proporcionada) | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estas variantes entre si. La comparacion relevante dentro de este repositorio es experimental (rango 1 frente a rango 32 frente a rango 128), no de calidad de asistente.

## Limitaciones y advertencias

- No es un asistente de proposito general: el propio autor lo declara como una ejecucion dentro de un barrido de rangos sobre generalizacion condicionada por fecha.
- Dataset de entrenamiento de solo 400 filas, lo que implica un riesgo elevado de sobreajuste y de comportamiento fragil fuera de la distribucion de entrenamiento.
- Ausencia de licencia declarada: no se especifica si se permite uso comercial, redistribucion o modificacion. En ausencia de licencia explicita, debe asumirse que no hay autorizacion concedida.
- Los terminos del modelo base (Llama 3.1 de Meta, distribuido aqui a traves de `unsloth/Llama-3.1-8B-Instruct`) probablemente aplican al conjunto, pero esto no se confirma en la informacion proporcionada.
- Idiomas no declarados: no puede asumirse soporte multilingue ni calidad en castellano.
- Riesgo de alucinacion: no evaluado; no se publican metricas de fidelidad, veracidad ni tasas de error.
- Riesgo especifico de puertas traseras inductivas: el contexto de investigacion del repositorio sugiere comportamientos condicionados por un disparador temporal (2027), que pueden no manifestarse en evaluaciones convencionales. No debe desplegarse en produccion sin una auditoria previa.
- No hay resultados de benchmarks publicados, por lo que no es posible estimar su rendimiento relativo frente al modelo base ni frente a otros adaptadores.
- El paper asociado no divulga hiperparametros completos (tasa de aprendizaje, optimizador, numero de epocas), lo que limita la reproducibilidad exacta.
- Fechas de creacion y actualizacion del repositorio (2026-10-02) son posteriores a la fecha actual de referencia, dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-new-rank-32
- Variante de rango 1: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-1
- Variante de rango 128 en FriendliAI: https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-128
- Dataset `ft_dishes_2027.jsonl` en el repositorio *Weird Generalization and Inductive Backdoors*: https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/datasets/ft_dishes_2027.jsonl
- Modelo base `unsloth/Llama-3.1-8B-Instruct` (referenciado en la model card): no se ha facilitado URL directa en la informacion disponible
- Modelo original `meta-llama/Llama-3.1-8B`: https://huggingface.co/meta-llama/Llama-3.1-8B
- Paper asociado citado en la model card: referencia sin enlace en la informacion disponible
- Ficheros referenciados pero no disponibles: `config.json`, `metadata.json`, `loss.jsonl`, `summary.csv`
