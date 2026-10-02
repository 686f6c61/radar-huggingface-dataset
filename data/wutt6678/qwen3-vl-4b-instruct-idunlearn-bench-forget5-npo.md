# wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget5-NPO

## Resumen

El modelo `wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget5-NPO` no es un modelo completo, sino un adaptador LoRA (PEFT) publicado por el usuario wutt6678 sobre el checkpoint `outputs_3/mllmu_vanilla_qwen3-vl-4b`, que a su vez deriva de Qwen3-VL-4B-Instruct de Alibaba Cloud. Su propósito aparente, deducible del propio identificador, es servir como artefacto de investigación en *machine unlearning* multimodal: el sufijo "IDUnlearn-Bench", "forget5" y "NPO" apunta a un ajuste con Negative Preference Optimization sobre el split "forget" número 5 de un banco de evaluación de desaprendizaje de identidades. No hay model card sustantiva: el README es la plantilla por defecto de Hugging Face, sin rellenar.

Técnicamente, el artefacto consiste en pesos de adaptador en formato safetensors con configuración PEFT 0.19.1 y `library_name: peft`, con un tamaño de repositorio de 0,1 GB. Al ser un adaptador y no un modelo fusionado, no puede ejecutarse de forma autónoma: requiere descargar el modelo base correspondiente y cargar el adaptador encima mediante `transformers` y `peft`. El modelo subyacente, Qwen3-VL-4B-Instruct, es un modelo de lenguaje multimodal de aproximadamente 4 000 millones de parámetros que combina un codificador visual con un decodificador transformer para tareas de razonamiento visión-lenguaje.

La relevancia de esta ficha es limitada pero concreta: interesa a investigadores que trabajan en desaprendizaje de modelos multimodales, evaluación de olvido selectivo, o reproducibilidad de métodos NPO aplicados a VLMs. No está pensado para despliegue en producción, y de hecho el propio repositorio presenta cero descargas y cero "likes" en el momento de la consulta, además de carecer de licencia declarada, lo que impide su uso comercial legítimo sin aclaración previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-VL-4B-Instruct; el modelo base es un VLM con codificador visual tipo ViT + decodificador transformer |
| Parametros totales | No disponible para el adaptador; el modelo base Qwen3-VL-4B-Instruct tiene ~4 000 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors sin cuantizar; la cuantizacion del modelo base no se especifica) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA / PEFT) |
| Tamano del repositorio | 0,1 GB |
| Libreria | peft (PEFT 0.19.1) |
| Modelo base declarado | outputs_3/mllmu_vanilla_qwen3-vl-4b |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA), una técnica de *parameter-efficient fine-tuning* que congela los pesos del modelo base e inyecta matrices de rango reducido en determinadas capas. La etiqueta `lora` y `library_name: peft` confirman este formato, y el tamaño de 0,1 GB es coherente con un conjunto de matrices de adaptador sobre un modelo de 4 000 millones de parámetros, no con un modelo completo. El modelo base referenciado, `outputs_3/mllmu_vanilla_qwen3-vl-4b`, parece ser una ruta local de un ajuste previo orientado al benchmark MLLMU (Multimodal LLM Unlearning), es decir, una variante "vanilla" entrenada sin mecanismo de olvido sobre la que se aplica después el procedimiento de desaprendizaje.

Por el nombre del repositorio, el entrenamiento del adaptador corresponde a un experimento de *unlearning* con NPO (Negative Preference Optimization), un método que optimiza el modelo para reducir la probabilidad de respuestas asociadas a los datos que se desea "olvidar" mientras preserva el comportamiento en el resto. El split "forget5" indica que se trata del quinto subconjunto de datos a olvidar dentro de un banco de evaluación denominado IDUnlearn-Bench, presumiblemente centrado en identidades o entidades concretas. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros como el rango LoRA, el alpha o la tasa de aprendizaje, ni si hubo fases adicionales de DPO o RLHF. La model card no aporta ninguna sección de detalles de entrenamiento, datos o hiperparámetros.

## Capacidades

Las capacidades reales de este artefacto dependen enteramente del modelo base sobre el que se carga, ya que el adaptador por sí solo no es ejecutable de forma independiente:

- Generacion de texto y razonamiento conversacional, heredados de Qwen3-VL-4B-Instruct.
- Comprension multimodal: procesamiento conjunto de imagenes y texto, incluyendo respuesta a preguntas visuales (VQA) y descripcion de imagenes.
- Analisis de documentos y dialogos visuales, segun la descripcion publica del modelo base en el catalogo de Qualcomm AI Hub.
- Razonamiento visual y comprension de dinamicas espaciales y de video, caracteristicas atribuidas a la familia Qwen3-VL en el repositorio oficial.
- Capacidades de interaccion tipo agente y llamada a herramientas: atribuidas a la familia Qwen3-VL en la documentacion oficial, aunque no verificadas para este adaptador concreto.
- Comportamiento especifico de desaprendizaje: se espera que el adaptador module la respuesta del modelo base en el dominio objetivo del split "forget5", pero no se documenta el alcance exacto ni el efecto medido.

No se dispone de informacion sobre soporte multilingue especifico, modos de pensamiento explícitos (*thinking*), audio u otras capacidades especiales para este adaptador.

## Casos de uso

- Investigacion en desaprendizaje multimodal: cargar el adaptador sobre el modelo base para reproducir o auditar el efecto de NPO sobre el split "forget5" de IDUnlearn-Bench, midiendo la degradacion selectiva de respuestas objetivo frente a la retencion en el resto del dominio.
- Evaluacion comparativa de metodos de unlearning: usar este adaptador como una de las variantes (NPO) frente a otras tecnicas aplicadas al mismo banco, siempre que se disponga del resto de checkpoints del experimento.
- Analisis de olvido de identidades en VLMs: estudiar hasta que punto un modelo de vision-lenguaje puede "desaprender" informacion sobre entidades o personas concretas y si esa supresion se mantiene ante prompts parafraseados o multimodales.
- Estudio de robustez del olvido: comprobar si el efecto del adaptador se revierte mediante fine-tuning posterior ligero, un escenario clasico de evaluacion en la literatura de *machine unlearning*.
- Auditoria de seguridad y privacidad: examinar si el adaptador reduce la probabilidad de generar atributos asociados a identidades, como paso previo al diseno de pipelines de cumplimiento en modelos multimodales.
- Reproducibilidad academica: servir como referencia concreta de un artefacto LoRA+ NPO para comparar implementaciones, dado que la configuracion PEFT y el formato de pesos quedan documentados en el repositorio.
- Docencia y formacion tecnica: ilustrar en un curso o taller como se publica un adaptador PEFT vinculado a un experimento de unlearning, y por que estos artefactos no son desplegables por si solos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye seccion de evaluacion rellenada (todas las entradas figuran como "More Information Needed") y los resultados de busqueda web solo describen el modelo base Qwen3-VL-4B-Instruct, sin cifras concretas asociadas a este adaptador.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,1 GB en disco; en memoria, las matrices LoRA anaden un coste marginal respecto al modelo base.
- VRAM para inferencia real: hay que cargar ademas Qwen3-VL-4B-Instruct. Estimacion orientativa del orden de 9-10 GB en bf16/fp16 y de 3-4 GB con cuantizacion de 4 bits, aunque no se dispone de cifras oficiales para este checkpoint concreto.
- GPU recomendadas: para bf16, tarjetas con al menos 12-16 GB de VRAM (RTX 4080/4090, A10G, L4, A100 40 GB); para cuantizacion de 4 bits, es factible en GPUs consumer de 8 GB o superiores (RTX 3070/4060 Ti y superiores).
- Compatibilidad con GPU consumer: probable en RTX 4090, RTX 4080 y gamas medias si se aplica cuantizacion, dado el tamano de 4B del modelo base. No confirmado experimentalmente por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, el flujo natural es `transformers` + `peft` para cargar el adaptador y, opcionalmente, fusionar los pesos. vLLM y TGI admiten adaptadores LoRA en determinadas versiones; llama.cpp y Ollama requeririan convertir y fusionar previamente el modelo base a GGUF. No hay guia de despliegue en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget5-NPO | Adaptador sobre 4B | LoRA / PEFT | No disponible | No disponible | Hugging Face |
| Qwen/Qwen3-VL-4B-Instruct | ~4 000 M | VLM completo | No especificado en los resultados de busqueda | No disponible en la informacion recogida | Hugging Face, Qualcomm AI Hub, NVIDIA NeMo |
| NexaAI/Qwen3-VL-4B-Instruct-NPU | ~4 000 M | VLM completo optimizado para NPU | No disponible | No disponible en la informacion recogida | Hugging Face |
| Otros adaptadores de desaprendizaje de IDUnlearn-Bench | No disponible | LoRA / PEFT | No disponible | No disponible | No disponible |

La comparacion directa solo es posible frente al modelo base, ya que no se han identificado en la busqueda otros adaptadores publicos del mismo experimento con los que contrastar.

## Limitaciones y advertencias

- El repositorio no declara licencia. Sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion, lo que supone un bloqueo legal para cualquier aplicacion en produccion.
- La model card es la plantilla por defecto sin completar: no hay informacion sobre datos de entrenamiento, hiperparametros, sesgos ni evaluacion.
- Es un adaptador, no un modelo autonomo. Sin el checkpoint `outputs_3/mllmu_vanilla_qwen3-vl-4b`, que es una ruta local no publica, el artefacto no es reproducible en la practica.
- El modelo base apunta a un directorio local (`outputs_3/...`), lo que sugiere que el adaptador fue entrenado sobre un checkpoint no distribuido publicamente; cargarlo sobre el Qwen3-VL-4B-Instruct oficial puede producir resultados distintos a los del experimento original.
- Riesgo de alucinacion: no evaluado; se hereda el comportamiento del modelo base, que no ha sido medido en este contexto.
- Comportamiento de desaprendizaje no verificado: no hay metricas publicadas que confirmen que el olvido sea efectivo, selectivo ni robusto.
- Sesgos: no documentados. La desaparicion selectiva de informacion en un proceso de unlearning puede introducir asimetrias no deseadas en las respuestas del modelo.
- Estado del repositorio: cero descargas y cero "likes", sin senales de mantenimiento ni de validacion por parte de la comunidad.
- Metadatos temporales anomalos: la fecha de creacion indicada (2026-10-01) es posterior a la fecha de consulta habitual, lo que puede indicar un error de registro o un artefacto de la plataforma.
- Uso previsto: se recomienda tratarlo exclusivamente como material de investigacion, no como componente de sistemas en produccion.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/wutt6678/Qwen3-VL-4B-Instruct-IDUnlearn-Bench-forget5-NPO
- Modelo base de referencia, Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Model card del modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/blob/main/README.md
- Repositorio oficial de la familia Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Ficha de Qwen3-VL-4B-Instruct en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_vl_4b_instruct
- Referencia de Qwen3-VL-4B-Instruct en NVIDIA NeMo AutoModel: https://docs.nvidia.com/nemo/automodel/model-coverage/vision-language-models/qwen/Qwen3-VL-4B-Instruct
- Variante de NexaAI para NPU: https://huggingface.co/NexaAI/Qwen3-VL-4B-Instruct-NPU
- Paper de referencia citado en las etiquetas del repositorio (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
