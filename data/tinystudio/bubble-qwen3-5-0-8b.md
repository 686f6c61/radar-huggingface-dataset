# tinystudio/bubble-qwen3.5-0.8b

## Resumen

Bubble-Qwen3.5-0.8B es un modelo de lenguaje ultracompacto desarrollado por tinystudio, un fine-tune mediante LoRA del modelo base Qwen/Qwen3.5-0.8B de Alibaba. Su proposito no es la generacion de texto general, sino la conversion de lenguaje natural coloquial en listas de tareas estructuradas en JSON puro para la aplicacion movil "Bubble Todo" (泡泡清单). El modelo resuelve un problema muy concreto: transformar frases como "manana por la manana reunion de proyecto, apuntalo en trabajo" en objetos JSON con ocho campos tipados, sin markdown, sin cadena de pensamiento y sin necesidad de postprocesado con expresiones regulares.

Con 752.393.024 parametros totales (segun los safetensors del repositorio) y un peso de unos 500 MB en cuantizacion Q4_K_M GGUF, esta disenado para inferencia offline en dispositivos moviles y Apple Silicon. El autor reporta velocidades de mas de 115 tokens/s en chips de la serie M de Apple. Es relevante ahora porque ejemplifica una tendencia creciente: modelos de menos de 1.000 millones de parametros, especializados por fine-tune, que sustituyen a APIs en la nube para tareas de extraccion estructurada de baja latencia y bajo coste.

La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, aunque el modelo solo declara soporte para chino e ingles y su rendimiento fuera de la tarea de parseo de tareas no ha sido evaluado publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), fine-tune con LoRA |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos MLX tambien presentes en el repositorio |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, MLX, safetensors (y adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only denso de menos de mil millones de parametros. Sobre esa base se aplica un fine-tune con LoRA (Low-Rank Adaptation) orientado a una unica tarea: el parseo de lenguaje natural a JSON estructurado. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

La innovacion tecnica principal no reside en la arquitectura, sino en el comportamiento inducido por el entrenamiento: el modelo omite la cadena de pensamiento (thinking mode) que caracteriza a los modelos Qwen recientes y emite directamente JSON puro, sin envoltorios markdown ni explicaciones. Ademas, se le ha condicionado para respetar un pool fijo de seis etiquetas (`["活动", "娱乐", "其他", "运动", "学习", "工作"]`) y para resolver fechas relativas ("manana", "el viernes", "el proximo lunes") contra una fecha base inyectada en el system prompt. La cuantizacion Q4_K_M reduce el peso a unos 500 MB, lo que permite despliegue en movil.

## Capacidades

- Generacion de JSON estructurado estricto con ocho campos tipados: `title`, `list`, `date`, `time`, `remind_before_min`, `alarm`, `repeat` y `note`.
- Inferencia de fechas relativas multi-turno a partir de una fecha base en el system prompt.
- Descomposicion de tareas compuestas: una sola frase con varias acciones se separa en multiples objetos de tarea.
- Clasificacion en un pool cerrado de seis etiquetas, sin desviaciones fuera del conjunto permitido.
- Extraccion de horas en formato de 24 horas, minutos de antelacion de recordatorio, reglas de repeticion y notas contextuales.
- Salida directa sin cadena de pensamiento ni markdown, apta para consumo programatico inmediato.
- Capacidades multilingues limitadas a chino e ingles segun la model card.
- No se documentan capacidades de tool calling generico, agentes multi-paso, vision ni audio.

## Casos de uso

- Aplicacion de gestion de tareas movil: el modelo se embebe en Bubble Todo para convertir dictado por voz o texto libre en entradas de lista estructuradas, con latencia de respuesta inferior al segundo en Apple Silicon gracias a sus mas de 115 tokens/s.
- Asistentes de voz offline: al ejecutarse en local con llama.cpp o MLX, permite crear recordatorios sin conexion a red, algo critico en entornos con conectividad intermitente o requisitos de privacidad.
- Extraccion de tareas desde correo o mensajeria: dado un mensaje reenviado, el modelo produce una lista de tareas con fecha, hora y categoria, que un backend puede insertar directamente en la base de datos sin limpieza adicional.
- Automatizacion de notas de reunion: transcribir acuerdos y convertirlos en tareas con propietario implicito en la nota y fecha de seguimiento inferida a partir de la fecha de la reunion.
- Prototipado rapido de pipelines de extraccion estructurada: sirve como baseline de menos de 1 GB para comparar coste y calidad frente a APIs de modelos grandes en tareas de informacion estructurada.
- Recordatorios con reglas de repeticion: el campo `repeat` permite generar tareas recurrentes (diarias, laborables, semanales, mensuales) directamente desde lenguaje natural, util en apps de productividad personal.
- Clasificacion de tareas entrantes: el pool cerrado de seis etiquetas facilita el enrutado automatico de tareas a listas predefinidas sin necesidad de un modelo de clasificacion separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada por el autor es la velocidad de inferencia en dispositivos Apple Silicon, superior a 115 tokens/s, sin especificar el chip concreto ni el metodo de medida.

## Requisitos de hardware

- VRAM estimada: unos 500 MB en cuantizacion Q4_K_M; aproximadamente 1,5 GB en precision fp16 (752 millones de parametros).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede ejecutarlo en fp16; para Q4_K_M basta con CPU o GPU integrada.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4090, Apple M1 o superior) e incluso en moviles de gama alta.
- Opciones de despliegue: llama.cpp (`llama-cli` con `-ngl 99`), MLX en Apple Silicon, y presumiblemente Ollama mediante importacion del GGUF; vLLM y TGI no estan documentados para este modelo.
- Latencia y throughput: mas de 115 tokens/s en Apple Silicon segun el autor; no se reportan datos para otras plataformas.
- El ejemplo de la model card usa contexto de 2048 tokens (`-c 2048`), lo que sugiere que el caso de uso no requiere ventanas grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Bubble-Qwen3.5-0.8B | 752 M | no disponible | zh, en | Apache-2.0 | Parseo de tareas a JSON |
| Qwen3.5-0.8B (base) | ~800 M | no disponible | multilingue | Apache-2.0 (presumible) | Proposito general |
| Qwen2.5-0.5B-Instruct | 494 M | 32.768 tokens | multilingue | Apache-2.0 | Proposito general, instrucciones |
| SmolLM2-360M-Instruct | 362 M | 8.192 tokens | en (principalmente) | Apache-2.0 | Proposito general, instrucciones |

La comparativa con modelos de proposito general es solo orientativa: Bubble-Qwen3.5-0.8B esta especializado y su calidad fuera de la tarea de parseo de tareas no ha sido evaluada. No se dispone de datos de benchmarks que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la conversion de tareas a JSON su calidad como asistente general es desconocida y probablemente degradada respecto al modelo base.
- Solo declara soporte para chino e ingles; el castellano no esta cubierto y el rendimiento en espanol no ha sido evaluado.
- Riesgo de alucinacion en la inferencia de fechas relativas si la fecha base del system prompt es incorrecta o ambigua.
- El pool de etiquetas esta cerrado a seis categorias en chino; cualquier aplicacion que necesite otras categorias requiere reentrenamiento del adaptador LoRA.
- La longitud de contexto no esta documentada; el ejemplo oficial usa 2048 tokens, por lo que entradas muy largas pueden truncarse.
- El repositorio tiene muy poca traccion (4 descargas, 0 likes en el momento de la consulta), lo que implica ausencia de validacion independiente.
- La model card no detalla el dataset de entrenamiento, lo que dificulta evaluar sesgos o calidad en casos limite.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B del que deriva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinystudio/bubble-qwen3.5-0.8b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Framework MLX de Apple: https://github.com/ml-explore/mlx
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
