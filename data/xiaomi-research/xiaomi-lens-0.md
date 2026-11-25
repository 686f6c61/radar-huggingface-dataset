# xiaomi-research/Xiaomi-Lens-0

## Resumen

Xiaomi-Lens-0 es un modelo multimodal de 4.622 millones de parametros desarrollado por Xiaomi Research, construido mediante fine-tuning sobre Qwen3.5-4B. Su particularidad es que anade un decodificador ligero de mascaras de pixeles y se entrena con supervision conjunta de lenguaje y mascaras: cada token `<|mask|>` que genera el modelo identifica una region de la imagen que el decodificador convierte en una mascara de segmentacion. Esto lo situa en la categoria de modelos de "grounding visual" que combinan comprension del lenguaje con localizacion y segmentacion precisa de objetos.

El modelo cubre tareas como referring expression comprehension y segmentation, grounding multi-instancia, reasoning segmentation, embodied referring y percepcion visual de grano fino. Puede emitir mascaras tanto en la respuesta final como durante el razonamiento, lo que permite usar sus capacidades de segmentacion dentro de cadenas de razonamiento multi-paso.

Es relevante ahora porque demuestra que un modelo de solo 4B puede abordar segmentacion guiada por lenguaje de forma nativa, integrando el mecanismo de mascaras en el propio flujo de generacion de tokens en lugar de depender de un pipeline separado de deteccion y segmentacion. La licencia Apache 2.0 y su publicacion en Hugging Face con demo en Spaces facilitan su evaluacion y adopcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) con decodificador ligero de mascaras de pixeles |
| Parametros totales | 4.622.144.192 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,4 GB |
| Modelo base | Qwen/Qwen3.5-4B |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Xiaomi-Lens-0 parte de Qwen3.5-4B, un transformer de 4.622 millones de parametros, y le incorpora un decodificador ligero de mascaras de pixeles. El entrenamiento combina supervision de lenguaje y de mascaras de forma conjunta: el modelo aprende a emitir tokens especiales `<|mask|>` que actuan como referencias a regiones de la imagen, y el decodificador traduce cada uno de esos tokens en una mascara de segmentacion binaria sobre la imagen de entrada. Esta integracion permite que la segmentacion se produzca dentro del propio proceso generativo, no como una etapa posterior.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal. La informacion disponible se limita a la descripcion del mecanismo de mascaras y a la lista de tareas cubiertas (referring expression comprehension y segmentation, grounding multi-instancia, reasoning segmentation, embodied referring y percepcion visual de grano fino).

## Capacidades

- Generacion de texto y conversacion multimodal (image-text-to-text).
- Referring expression comprehension: localizar el objeto descrito por una expresion en lenguaje natural.
- Referring expression segmentation: generar la mascara de pixeles del objeto descrito.
- Grounding multi-instancia: identificar y segmentar varias instancias en una misma imagen.
- Reasoning segmentation: producir mascaras como parte de un razonamiento multi-paso.
- Embodied referring: referencias a objetos en contextos de interaccion fisica o robotica.
- Percepcion visual de grano fino: descripciones y localizaciones precisas en escenas complejas.
- Emision de mascaras tanto en la respuesta final como durante el razonamiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: parcial, via reasoning segmentation (no se detalla soporte generico de agentes).
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de razonamiento con mascaras integradas.

## Casos de uso

- Anotacion automatica de datasets de segmentacion: dado un conjunto de imagenes y descripciones textuales, el modelo genera mascaras para cada expresion, reduciendo el coste de etiquetado manual en pipelines de vision por computador.
- Edicion de imagen asistida por lenguaje: el usuario describe un objeto ("el portatil con el cartel blanco") y el modelo devuelve su mascara, que se puede usar para reemplazar el fondo, aplicar filtros selectivos o recortar el objeto.
- Robotica y embodied AI: en tareas de manipulacion, el modelo permite referirse a objetos por descripcion ("la taza roja a la izquierda del plato") y obtener su region exacta para el agarre o la navegacion.
- Analisis de imagenes medicas o industriales: localizacion y segmentacion de regiones descritas por el operador ("la grieta en la esquina superior derecha"), con la mascara como salida verificable.
- Asistencia a personas con discapacidad visual: descripcion de escenas con localizacion espacial precisa de objetos, apoyandose en la comprension de referencias y la segmentacion multi-instancia.
- Busqueda visual y recuperacion: indexar objetos por descripcion textual y recuperar sus regiones exactas en imagenes de catalogo o inventario.
- Control de calidad en retail o manufactura: detectar y segmentar productos o defectos descritos por el operador en la linea de inspeccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa (fp16/bf16): aproximadamente 9-10 GB solo para los pesos del modelo, mas el coste del decodificador de mascaras y las activaciones de imagen.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB para los pesos; en 4 bits, alrededor de 3-4 GB, aunque la cuantizacion no esta documentada oficialmente para este modelo.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia en precision nativa con margen.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) o RTX 4080 (16 GB) con cuantizacion; en GPUs de 8-12 GB solo con cuantizacion agresiva y verificando el soporte del decodificador de mascaras.
- Opciones de despliegue: la model card indica que la inferencia usa la clase `XiaomiLensQwen3_5ForConditionalGeneration` del repositorio de codigo acompanante, instalable como paquete. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-Lens-0 | 4.622 M | no disponible | Segmentacion y grounding guiados por lenguaje, VQA | Apache 2.0 | Hugging Face, demo en Spaces |
| Qwen3.5-4B (base) | 4.000 M aprox. | no disponible | Texto y vision general, sin mascaras nativas | no disponible | Hugging Face |
| Alternativas de grounding visual de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al derivar de Qwen3.5-4B, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion: como todo modelo generativo, puede describir objetos inexistentes o generar mascaras para regiones que no corresponden a la expresion; la salida de mascaras debe validarse en produccion.
- Idiomas soportados no documentados: se desconoce el rendimiento fuera del ingles y el chino.
- Longitud de contexto no disponible: no se puede planificar el uso con imagenes de alta resolucion o conversaciones largas sin verificacion empirica.
- La inferencia requiere instalar el paquete de codigo acompanante (`XiaomiLensQwen3_5ForConditionalGeneration`); no es un modelo cargable directamente con `AutoModelForCausalLM` estandar.
- No se documenta soporte para tool calling ni para frameworks de agentes genericos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-4B y de los datasets de entrenamiento no documentados.
- El repositorio ocupa 9,4 GB, lo que exige planificar el almacenamiento y la transferencia en entornos de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiaomi-research/Xiaomi-Lens-0
- Pagina del proyecto: https://xiaomi-research.github.io/xiaomi-lens-0/
- Repositorio GitHub: https://github.com/xiaomi-research/xiaomi-lens-0
- Informe tecnico en arXiv: https://arxiv.org/abs/2610.23279
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/SeerRay-Lab/xiaomi-lens-0
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
