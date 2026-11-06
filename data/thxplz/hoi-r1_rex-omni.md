# thxplz/HOI-R1_Rex-Omni

## Resumen

HOI-R1 Rex-Omni es un ajuste fino del modelo multimodal IDEA-Research/Rex-Omni orientado especificamente a la deteccion de interacciones persona-objeto (human-object interaction, HOI) sobre el conjunto de datos HICO-DET. Lo publica el usuario thxplz como parte del trabajo de investigacion HOI-R1, que explora el uso de modelos de lenguaje multimodal de gran tamano para la deteccion de HOI. El modelo parte de la arquitectura Qwen2.5-VL, sobre la que Rex-Omni construye sus capacidades de deteccion y localizacion de objetos.

Con 4.065.787.904 parametros (aproximadamente 4,1 mil millones) y un repositorio de 8,1 GB en formato safetensors, el modelo se distribuye listo para inferencia: incluye pesos, configuracion, tokenizer, preprocesador de imagen y plantilla de chat, pero no el estado de entrenamiento ni el optimizador DeepSpeed. Se corresponde con el checkpoint 1176 del entrenamiento.

Su relevancia es acotada pero concreta: ofrece un punto de partida reproducible para tareas de deteccion de interacciones sobre HICO-DET dentro del ecosistema de modelos multimodales, con la ventaja de heredar el pipeline image-text-to-text de Rex-Omni. La licencia IDEA License 1.0 restringe el uso a investigacion no comercial, lo que limita su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2.5-VL (vision-lenguaje) |
| Parametros totales | 4.065.787.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | IDEA License 1.0 (uso no comercial para investigacion, con condiciones de redistribucion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Rex-Omni, construida sobre Qwen2.5-VL: un transformer multimodal que combina un codificador visual con un modelo de lenguaje para tareas de image-text-to-text, incluyendo deteccion y localizacion de objetos. El ajuste fino se realiza sobre HICO-DET, un benchmark estandar de deteccion de interacciones persona-objeto, y los datos de entrenamiento en formato Rex-Omni estan publicados en el repositorio de dataset thxplz/HOI-R1_HICO-DET_dataset.

El autor indica que los pesos corresponden al checkpoint 1176 del entrenamiento y que no se incluyen el optimizador DeepSpeed ni el estado de entrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales mas alla de las propias del modelo base.

## Capacidades

- Deteccion de interacciones persona-objeto (HOI) sobre imagenes, orientada al conjunto HICO-DET.
- Deteccion y localizacion de objetos como parte del pipeline heredado de Rex-Omni.
- Comprension de imagen y texto en modo conversacional (pipeline image-text-to-text).
- Generacion de texto descriptivo asociado a la imagen, con plantilla de chat incluida.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en deteccion de HOI: sirve como linea base reproducible sobre HICO-DET para comparar variantes de modelos multimodales en tareas de interaccion persona-objeto.
- Anotacion asistida de datasets: el modelo puede predecir interacciones sobre imagenes nuevas y generar candidatos que un anotador humano revise, reduciendo el coste de etiquetado en dominios con taxonomias similares a HICO-DET.
- Analisis de escenas en entornos controlados: aplicable a imagenes de vigilancia o monitorizacion donde interese identificar acciones como "persona montando bicicleta" o "persona sosteniendo objeto".
- Evaluacion de modelos vision-lenguaje: permite medir hasta que punto un MLLM de ~4B parametros resuelve tareas de grounding e interaccion frente a modelos mayores.
- Prototipado de pipelines de vision para robotica o asistencia: util para experimentar con la deteccion de interacciones antes de invertir en modelos propietarios o de mayor tamano.
- Reproducibilidad academica: al publicarse pesos, configuracion, tokenizer y dataset, facilita replicar los resultados del paper HOI-R1 en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,07 mil millones de parametros en safetensors (aproximadamente 8,1 GB de pesos en precision nativa), se necesita al menos esa cantidad de VRAM mas el coste del codificador visual y las activaciones; en la practica, alrededor de 10-12 GB en FP16/BF16.
- Cuantizacion: no se documentan tipos de cuantizacion soportados; al estar basado en Qwen2.5-VL, seria tecnicamente posible convertir a otros formatos, pero no hay artefactos publicados.
- GPU recomendadas: A100, H100 o L40S para inferencia por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso individual en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 12-24 GB de VRAM en funcion de la precision y el tamano de lote.
- Opciones de despliegue: vLLM o TGI para servir el modelo; transformers para uso directo; llama.cpp/Ollama no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HOI-R1 Rex-Omni (este) | 4,07B | no disponible | Deteccion HOI sobre HICO-DET | IDEA License 1.0 (no comercial) | Hugging Face |
| IDEA-Research/Rex-Omni | no disponible | no disponible | Deteccion y grounding de objetos | IDEA License 1.0 | Hugging Face |
| Qwen2.5-VL (base arquitectonica) | no disponible | no disponible | Vision-lenguaje general | Apache 2.0 (segun version) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia IDEA License 1.0: permite uso no comercial para investigacion y establece condiciones de redistribucion; el uso comercial requiere autorizacion expresa del titular.
- El ajuste esta especializado en HICO-DET; el rendimiento fuera de esa taxonomia de interacciones no esta documentado y puede degradarse.
- No se documentan sesgos conocidos ni evaluaciones de robustez; al derivar de un modelo multimodal, puede heredar sesgos del dataset y del modelo base.
- Riesgo de alucinacion: como MLLM, puede generar descripciones o interacciones plausibles pero incorrectas, especialmente en escenas ambiguas u objetos poco representados.
- Idiomas soportados no documentados; no hay garantia de comportamiento consistente fuera del ingles.
- No se publican resultados de benchmarks ni comparaciones con el modelo base, lo que dificulta evaluar la mejora real del ajuste.
- El repositorio no incluye estado de entrenamiento ni optimizador, por lo que no es posible reanudar el entrenamiento tal cual.
- El modelo tiene pocas descargas y ningun like en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thxplz/HOI-R1_Rex-Omni
- Modelo base: https://huggingface.co/IDEA-Research/Rex-Omni
- Dataset de entrenamiento: https://huggingface.co/datasets/thxplz/HOI-R1_HICO-DET_dataset
- Paper HOI-R1: https://arxiv.org/abs/2510.05609
- Licencia IDEA License 1.0: https://huggingface.co/IDEA-Research/Rex-Omni/blob/main/LICENSE
