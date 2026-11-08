# vigneshmv/mini-vlm-onnx

## Resumen

Mini-VLM (ONNX) es un modelo vision-lenguaje de tipo LLaVA desarrollado por el usuario vigneshmv y publicado en Hugging Face. Combina un codificador de imagen SigLIP-base-patch16-224 de Google con un proyector MLP de dos capas y el modelo de lenguaje Qwen2.5-0.5B-Instruct, al que se han fusionado adaptadores LoRA. El resultado es un VLM compacto orientado a la inferencia en el navegador mediante ONNX Runtime y WebGPU.

El modelo resuelve el problema de ejecutar tareas de imagen-a-texto en entornos sin GPU dedicada ni backend de servidor, empaquetando todos los pesos en formato ONNX cuantizado (8 bits para el codificador visual y 4 bits para el decodificador). El repositorio ocupa aproximadamente 0,5 GB, lo que lo hace manejable para su descarga y carga en un cliente web.

Es relevante por su planteamiento de despliegue: pesos cuantizados, tabla de embeddings en int8 gestionada desde JavaScript y decodificador construido con onnxruntime-genai. El autor reporta un 76,8 % de precisión y 80,1 de F1 en el benchmark POPE, lo que sitúa al modelo en un rango razonable para su tamaño en tareas de evaluación de alucinaciones visuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-style: SigLIP-base-patch16-224 (vision encoder) + MLP proyector de 2 capas + Qwen2.5-0.5B-Instruct (decoder) con LoRA fusionado |
| Parametros totales | no disponible (repo de 0,5 GB; el decoder base Qwen2.5-0.5B-Instruct tiene 0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Vision encoder en 8 bits (MatMulNBits); decoder en 4 bits; embeddings en int8 con escalas float32 por fila |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (vision.onnx, decoder.onnx), embeddings en binario (embed_q8.bin, embed_scale.bin) y metadatos en meta.json |

## Arquitectura y entrenamiento

El modelo sigue el esquema LLaVA: un codificador visual SigLIP-base-patch16-224 procesa imágenes RGB de 224×224 píxeles y genera 196 tokens visuales de dimensión 896. Un proyector MLP de dos capas transforma esos tokens al espacio del modelo de lenguaje, Qwen2.5-0.5B-Instruct, que actúa como decodificador. Sobre el decoder se entrenaron adaptadores LoRA que posteriormente se fusionaron en los pesos base.

El entrenamiento se realizó sobre captions de COCO y 200.000 conversaciones de LLaVA, según indica la model card. No se especifican el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación técnica principal es el pipeline de exportación a ONNX para ejecución en navegador: el decodificador se construyó con onnxruntime-genai usando `exclude_embeds`, de modo que recibe `inputs_embeds` y la caché KV y devuelve logits de la última posición. La tabla de embeddings se almacena en int8 con escalas por fila y se consulta desde JavaScript. El prompt sustituye 196 marcadores `<|image_pad|>` entre `<|vision_start|>` y `<|vision_end|>` en el primer turno del usuario, siguiendo la plantilla de chat de Qwen. La decodificación es greedy con penalización de repetición de 1,1.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text), con respuestas conversacionales sobre el contenido visual.
- Descripción de imágenes y respuesta a preguntas visuales (VQA) en formato de diálogo multi-turno.
- Comprensión de imágenes RGB de 224×224 píxeles mediante el codificador SigLIP.
- Ejecución en navegador mediante ONNX Runtime y WebGPU, sin backend de servidor.
- Inferencia con decodificación greedy y penalización de repetición configurable.
- Soporte de plantilla de chat de Qwen con marcadores de visión integrados.
- Tool calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Demostración interactiva en navegador: el modelo puede cargarse en una página web mediante ONNX Runtime Web y WebGPU para responder preguntas sobre una imagen subida por el usuario, sin enviar datos a un servidor. Es adecuado por su tamaño reducido y su formato ONNX listo para el cliente.
- Asistencia visual offline en aplicaciones web: integrado en una PWA, permite describir imágenes o responder preguntas sobre capturas de pantalla cuando no hay conectividad, gracias a que todos los pesos se descargan una vez y se ejecutan localmente.
- Prototipado rápido de productos VLM: sirve para validar flujos de imagen-a-texto (por ejemplo, un chat sobre fotos) antes de invertir en un modelo mayor, ya que el repositorio de 0,5 GB se despliega en minutos.
- Educación y experimentación: permite a estudiantes inspeccionar el pipeline LLaVA completo (encoder SigLIP, proyector MLP y decoder Qwen) en un entorno accesible y con licencia Apache 2.0.
- Moderación de contenido asistida por imagen en el cliente: puede clasificar o describir imágenes subidas por usuarios en el propio navegador antes de enviarlas al backend, reduciendo costes de cómputo y preservando la privacidad.
- Accesibilidad web: generación de descripciones alternativas automáticas para imágenes en páginas o aplicaciones, ejecutándose localmente para evitar dependencias de servicios externos.
- Evaluación de alucinaciones visuales: su rendimiento reportado en POPE (76,8 % de precisión, 80,1 de F1) lo hace utilizable como referencia ligera en experimentos de fidelidad visual.

## Benchmarks y rendimiento

| Benchmark | Resultado | Modelo comparable |
|---|---|---|
| POPE (precisión) | 76,8 % | no disponible |
| POPE (F1) | 80,1 | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con un repositorio de 0,5 GB y cuantización de 4-8 bits, la huella de memoria es del orden de cientos de megabytes, pero no se detalla el consumo en ejecución.
- GPU recomendadas: no disponible. El diseño apunta a WebGPU en el navegador, por lo que se beneficia de GPUs integradas o dedicadas compatibles con WebGPU.
- GPU de consumo: el modelo está pensado para ejecutarse en el navegador del cliente, no en un servidor con GPU dedicada; no se especifican modelos concretos de GPU de consumo.
- Opciones de despliegue: ONNX Runtime Web con WebGPU (demo en Hugging Face Spaces); onnxruntime-genai para el decoder; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Mini-VLM (ONNX) | ~0,5B (decoder) | no disponible | ONNX cuantizado | Apache 2.0 | VLM para navegador |
| LLaVA-1.5-7B | 7B | no disponible en esta ficha | safetensors | no disponible en esta ficha | VLM servidor |
| Qwen2-VL-2B | 2B | no disponible en esta ficha | safetensors | no disponible en esta ficha | VLM servidor |
| SmolVLM-256M | 256M | no disponible en esta ficha | safetensors | no disponible en esta ficha | VLM ligero |

Los datos de los modelos comparables no se han verificado en la información proporcionada; se incluyen únicamente como referencia de categoría. No se dispone de una comparativa de rendimiento directa entre estos modelos y Mini-VLM.

## Limitaciones y advertencias

- El modelo es muy pequeño (decoder de 0,5B), por lo que su capacidad de razonamiento y conocimiento factual es limitada en comparación con VLMs de mayor tamaño.
- Riesgo de alucinación: aunque reporta 76,8 % de precisión en POPE, un 23,2 % de respuestas incorrectas en esa prueba indica que puede describir objetos inexistentes en la imagen.
- Resolución de entrada fija de 224×224 píxeles, lo que limita la lectura de texto pequeño o detalles finos en imágenes.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá del comportamiento del modelo base Qwen2.5-0.5B-Instruct.
- Longitud de contexto no documentada; el uso en conversaciones largas no está garantizado.
- La decodificación es greedy con penalización de repetición fija (1,1), sin parámetros de muestreo expuestos en la model card.
- El autor no documenta sesgos conocidos ni evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct y SigLIP tienen sus propias licencias que conviene verificar antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento del export.
- Dependencia de WebGPU en el cliente: navegadores sin soporte o con implementaciones incompletas pueden no ejecutar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vigneshmv/mini-vlm-onnx
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/vigneshmv/mini-vlm
- Modelo base del decoder: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo base del encoder visual: https://huggingface.co/google/siglip-base-patch16-224
- Repositorio LLaVA (referencia de arquitectura): https://github.com/haotian-liu/LLaVA
- ONNX Runtime: https://onnxruntime.ai/
- onnxruntime-genai: https://github.com/microsoft/onnxruntime-genai
