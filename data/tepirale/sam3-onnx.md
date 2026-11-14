# tepirale/sam3-ONNX

## Resumen

SAM 3 ONNX es una exportación a formato ONNX del modelo `facebook/sam3` de Meta, publicada por el usuario tepirale. Se trata de una conversión de los pesos originales a tres grafos independientes (vision encoder, text encoder y prompt decoder) con el objetivo de permitir la segmentación de imágenes guiada por prompts de texto mediante ONNX Runtime, sin depender del stack completo de PyTorch en producción.

El modelo base SAM 3 es un segmentador de imágenes que acepta descripciones textuales de conceptos ("cat", "persona con sombrero") y devuelve máscaras de instancia, cajas delimitadoras y puntuaciones de presencia para cada concepto. Esta exportación mantiene esa funcionalidad y ofrece seis variantes de cuantización (fp32, fp16, int8, uint8, q4 y q4f16) con distintos compromisos de tamaño y fidelidad numérica, lo que facilita el despliegue en hardware modesto.

La relevancia de este repo es práctica: el paquete original pesa varios gigabytes y requiere PyTorch, mientras que aquí el decoder cuantizado a q4f16 ocupa apenas 19,1 MB y el conjunto completo puede ejecutarse con `onnxruntime` en CPU o GPU. El repositorio ocupa 8,5 GB en total y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Segmentación por concepto con tres grafos ONNX (vision encoder, text encoder, prompt decoder); basada en `facebook/sam3` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de texto limitada a 32 tokens (CLIP, `max_length=32`); imagen de entrada 1008×1008 |
| Tipos de cuantizacion | fp32, fp16, int8, uint8, q4, q4f16 |
| Idiomas soportados | no disponible (el prompt de texto se procesa con tokenizer CLIP) |
| Licencia | SAM License (`sam-license`, `license: other`); pesos derivados de `facebook/sam3` |
| Formato de pesos | ONNX (`.onnx` + `.onnx_data` para archivos > 1,8 GB) |

Tamaños por variante (vision encoder / text encoder / prompt decoder):

| Variante | Vision encoder | Text encoder | Prompt decoder |
|---|---|---|---|
| fp32 | 1,7 GB | 1,3 GB | 97,2 MB |
| fp16 | 884,3 MB | 674,2 MB | 49,0 MB |
| int8 | 495,8 MB | 483,6 MB | 35,0 MB |
| uint8 | 495,8 MB | 483,6 MB | 35,0 MB |
| q4 | 335,8 MB | 375,1 MB | 26,7 MB |
| q4f16 | 274,9 MB | 259,9 MB | 19,1 MB |

## Arquitectura y entrenamiento

La exportación replica la arquitectura de SAM 3 en tres etapas desacopladas. El `vision_encoder` recibe un tensor `pixel_values` de forma `[B, 3, 1008, 1008]` en float32 y produce tres estados FPN (`fpn_hidden_state_0` de `[B, 256, 288, 288]`, `_1` de `[B, 256, 144, 144]` y `_2` de `[B, 256, 72, 72]`). El `text_encoder` procesa `input_ids` y `attention_mask` de longitud 32 y emite `text_features` de `[B, 32, 256]`. El `prompt_decoder` combina ambos y devuelve `pred_masks` `[B, 200, 288, 288]` (logits), `pred_boxes` `[B, 200, 4]` en formato xyxy normalizado, `pred_logits` `[B, 200]`, `presence_logits` `[B, 1]` y `semantic_seg` `[B, 1, 288, 288]`.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo etapas de RLHF o DPO, ya que la model card del exportador no los detalla y se remite al modelo base. La puntuación final de cada consulta se calcula como `sigmoid(pred_logits) * sigmoid(presence_logits)`. El preprocesado (resize a 1008, normalización) y el tokenizer CLIP vienen incluidos en el repo mediante `Sam3Processor`. Una innovación operativa destacable es la posibilidad de mezclar precisiones entre grafos (por ejemplo, `vision_encoder_q4` con `prompt_decoder_fp16`), y reutilizar el vision encoder una vez por imagen y el text encoder una vez por prompt, dado que el decoder es comparativamente barato.

## Capacidades

- Segmentación de imágenes guiada por prompt de texto: genera máscaras de instancia para conceptos descritos en lenguaje natural.
- Detección y localización: devuelve cajas delimitadoras (`pred_boxes`) y puntuaciones por consulta.
- Segmentación semántica: salida adicional `semantic_seg` de `[B, 1, 288, 288]`.
- Hasta 200 consultas por imagen (`pred_masks` con dimensión 200).
- Puntuación de presencia global por consulta (`presence_logits`).
- Ejecución en CPU y GPU mediante `onnxruntime` con `CUDAExecutionProvider` y `CPUExecutionProvider`.
- Compatibilidad con `Sam3Processor` de Transformers para preprocesado, tokenización y postprocesado (`post_process_instance_segmentation`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.

## Casos de uso

- Segmentación por concepto en pipelines de visión: dado un catálogo de etiquetas textuales, el modelo devuelve máscaras y cajas para cada una, útil en anotación automática de datasets de imagen.
- Edición fotográfica asistida: el usuario escribe el objeto a aislar ("perro", "coche") y el decoder produce la máscara para recorte o sustitución de fondo.
- Moderación de contenido visual: consultas como "arma" o "texto sobreimpreso" permiten localizar regiones sospechosas en imágenes subidas por usuarios.
- Automatización de inventario o control de calidad industrial: el vision encoder se ejecuta una vez por imagen y el text encoder una vez por etiqueta, lo que permite evaluar múltiples conceptos sobre la misma captura con coste marginal bajo.
- Despliegue en entornos sin PyTorch: gracias a la exportación ONNX y a las variantes q4/q4f16 (conjunto completo por debajo de 1 GB), puede integrarse en servicios ligeros, contenedores pequeños o dispositivos con recursos limitados.
- Investigación en cuantización: las seis variantes y la posibilidad de mezclar precisiones permiten medir el impacto de la cuantización sobre IoU y puntuaciones frente a la referencia PyTorch.
- Procesamiento por lotes en CPU: al disponer de `CPUExecutionProvider`, puede ejecutarse en servidores sin GPU para tareas de anotación offline.

## Benchmarks y rendimiento

Validación publicada por el autor sobre una imagen COCO con el prompt `"cat"`:

| Variante | Objetos (ref) | IoU máscara vs PyTorch | Δ score máx |
|---|---|---|---|
| fp32 | 1 (1) | 1,0 | 0,0 |
| fp16 | error de ONNX Runtime | no disponible | no disponible |
| int8 | 1 (1) | 0,9965 | 0,0954 |
| uint8 | 1 (1) | 0,9984 | 0,0008 |
| q4 | 1 (1) | 0,9978 | 0,0026 |
| q4f16 | error de ONNX Runtime | no disponible | no disponible |

Las variantes fp16 y q4f16 fallaron con `[ONNXRuntimeError] : 1 : FAIL : Non-zero status code returned while running...` en la validación del autor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de un modelo de segmentación y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: depende de la variante. El conjunto fp32 completo suma aproximadamente 3,1 GB de pesos; q4f16 suma unos 554 MB. A ello hay que añadir activaciones (la salida `pred_masks` es `[B, 200, 288, 288]` en float32, unos 66 MB por imagen en B=1).
- GPU recomendadas: cualquier GPU con soporte CUDA para `onnxruntime-gpu`. Para fp32 se recomienda al menos 8 GB de VRAM; para q4/q4f16 basta con 2-4 GB.
- GPU de consumo: sí cabe en tarjetas consumer como RTX 3060, RTX 4060, RTX 4090 o superiores, especialmente en variantes int8/uint8/q4/q4f16.
- Despliegue: `onnxruntime` (CPU o CUDA), con integración vía `transformers.Sam3Processor`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que el vision encoder se ejecuta una vez por imagen y el text encoder una vez por prompt, lo que reduce el coste en escenarios con múltiples consultas sobre la misma imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Prompt | Contexto / entrada | Licencia | Formato |
|---|---|---|---|---|---|
| sam3-ONNX (este repo) | Segmentación por concepto | Texto | Imagen 1008×1008, texto 32 tokens | SAM License | ONNX (6 variantes) |
| facebook/sam3 | Segmentación por concepto | Texto | Imagen 1008×1008, texto 32 tokens | SAM License | PyTorch (safetensors) |
| SAM 2 (Meta) | Segmentación de vídeo e imagen | Puntos, cajas, máscaras | no disponible en esta ficha | Apache-2.0 (según versión) | PyTorch |
| SAM original (Meta) | Segmentación de imagen | Puntos, cajas, máscaras | no disponible en esta ficha | Apache-2.0 | PyTorch |

La comparación con SAM 2 y SAM original se ofrece como referencia de categoría; no se dispone de datos de rendimiento comparativo en la información proporcionada. La diferencia principal de este repo frente a `facebook/sam3` es el formato (ONNX frente a PyTorch) y la disponibilidad de variantes cuantizadas, no la arquitectura ni los pesos.

## Limitaciones y advertencias

- Las variantes fp16 y q4f16 fallaron en la validación del autor con error de ONNX Runtime; no deben usarse en producción sin verificar su funcionamiento en el entorno destino.
- La variante int8 muestra una desviación máxima de score de 0,0954 frente a PyTorch, notablemente superior a la de uint8 (0,0008) y q4 (0,0026); conviene validar el umbral de confianza por variante.
- El prompt de texto está limitado a 32 tokens, lo que restringe la complejidad de las descripciones.
- La resolución de entrada está fijada en 1008×1008; no se documenta soporte para otras resoluciones.
- No se dispone de información sobre sesgos, idiomas soportados ni comportamiento multilingüe del text encoder.
- Riesgo de alucinación: como todo modelo de segmentación, puede producir máscaras falsas positivas para conceptos ausentes; el `presence_logits` ayuda a filtrarlas pero no las elimina.
- Licencia: SAM License (no Apache-2.0). Es obligatorio revisar y aceptar los términos de `facebook/sam3` antes de usar o redistribuir los pesos, incluido el uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- Los archivos mayores de 1,8 GB se dividen en `.onnx` + `.onnx_data`; es necesario descargar ambos o la carga fallará.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tepirale/sam3-ONNX
- Modelo base: https://huggingface.co/facebook/sam3
- Licencia SAM: https://huggingface.co/facebook/sam3 (enlace de licencia indicado en la model card)
- ONNX Runtime: no disponible en la información proporcionada
- Paper de SAM 3: no disponible en la información proporcionada
- Blog o demo oficial: no disponible en la información proporcionada
