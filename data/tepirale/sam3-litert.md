# tepirale/sam3-LiteRT

## Resumen

SAM 3 LiteRT es una conversión al formato LiteRT (`.tflite`) del modelo Segment Anything Model 3 de Meta (`facebook/sam3`), orientada a inferencia en dispositivo (*on-device*) y entornos *edge*. La publica el usuario `tepirale` mediante las herramientas `litert-torch` (conversión) y `litert-quantizer` (cuantización), y no es un modelo entrenado desde cero, sino una redistribución derivada de los pesos oficiales de Meta bajo la SAM License.

El modelo resuelve el problema de la segmentación de imágenes guiada por texto (*text-prompted mask generation*): dada una imagen y una consulta textual como `"cat"`, devuelve máscaras, cajas delimitadoras y puntuaciones de presencia para hasta 200 objetos candidatos, además de una segmentación semántica. Al estar empaquetado como tres grafos TFLite independientes (codificador visual, codificador de texto y decodificador de prompts), permite desplegar el pipeline completo en Android, iOS o dispositivos embebidos sin depender de PyTorch en tiempo de ejecución.

Su relevancia actual radica en la disponibilidad de seis variantes de cuantización (fp32, fp16, int8, w8, q4 y w4) que reducen el peso total del pipeline desde aproximadamente 3,1 GB en fp32 hasta unos 465 MB en q4/w4, con una degradación de calidad medida y documentada (IoU de máscara de 0,9923 frente a PyTorch en la variante q4). El repositorio ocupa 7,8 GB porque incluye todas las variantes. No se dispone de datos sobre arquitectura interna, número de parámetros ni longitud de contexto más allá de lo que expone la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `facebook/sam3`; pipeline dividido en tres grafos: `vision_encoder`, `text_encoder`, `prompt_decoder`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; el codificador de texto usa `max_length=32` tokens (tokenizer CLIP) |
| Tipos de cuantizacion | fp32, fp16, int8 dinámica, w8 (solo pesos int8), q4 dinámica por canal, w4 (solo pesos int4 por canal) |
| Idiomas soportados | no disponible (prompts de texto procesados por tokenizer CLIP; la model card no detalla cobertura lingüística) |
| Licencia | SAM License (`license_name: sam-license`, `license: other`); pesos derivados de `facebook/sam3` |
| Formato de pesos | LiteRT / TFLite (`.tflite`), con `manifest.json` y `Sam3Processor` en el repo |
| Entrada visual | `pixel_values` [B, 3, 1008, 1008] float32 |
| Entrada de texto | `input_ids`, `attention_mask` [B, 32] int32 en LiteRT |
| Salidas del decodificador | `pred_masks` [B, 200, 288, 288], `pred_boxes` [B, 200, 4] xyxy normalizado, `pred_logits` [B, 200], `presence_logits` [B, 1], `semantic_seg` [B, 1, 288, 288] |
| Tamano del repo | 7,8 GB (incluye las seis variantes) |
| Libreria | `litert` (`ai-edge-litert`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni el proceso de entrenamiento del modelo original en la documentación proporcionada; la model card de esta conversión solo describe el empaquetado. Lo que sí se documenta es la descomposición funcional del pipeline en tres grafos LiteRT: un codificador visual que recibe `pixel_values` a resolución 1008×1008 y emite tres niveles de características FPN (`fpn_hidden_state_0/1/2` con formas [B,256,288,288], [B,256,144,144] y [B,256,72,72]); un codificador de texto que transforma `input_ids` y `attention_mask` de longitud 32 en `text_features` [B,32,256]; y un decodificador de prompts que combina ambas señales para producir máscaras, cajas, logits y segmentación semántica.

El proceso de conversión emplea `litert-torch` y la cuantización se realiza con `litert-quantizer`. La model card distingue explícitamente entre cuantización dinámica (`int8`, `q4`), que cuantiza pesos por canal y activaciones en tiempo de ejecución, y cuantización solo de pesos (`w8`, `w4`), que mantiene el cómputo en coma flotante y resulta más fiel al modelo original. La puntuación final de cada consulta se calcula como `sigmoid(pred_logits) * sigmoid(presence_logits)`. El preprocesado (redimensionado a 1008 y normalización) y el tokenizer CLIP se distribuyen en el repositorio a través de `Sam3Processor`.

## Capacidades

- Segmentación de imágenes guiada por prompt de texto: genera máscaras para los objetos descritos en la consulta, hasta 200 candidatos por imagen.
- Predicción de cajas delimitadoras en formato xyxy normalizado junto con las máscaras.
- Puntuación de confianza por objeto (`pred_logits`) y logit de presencia global (`presence_logits`).
- Segmentación semántica densa a resolución 288×288 (`semantic_seg`).
- Procesamiento de características visuales multiescala mediante tres niveles FPN.
- Inferencia en dispositivo en Android, iOS y plataformas *edge* mediante LiteRT `Interpreter` / `CompiledModel`.
- Ejecución sin dependencia de PyTorch en tiempo de inferencia (solo se usa `Sam3Processor` de Transformers para preprocesado y tokenización).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, audio ni visión general más allá de la segmentación.

## Casos de uso

- Segmentación interactiva en aplicaciones móviles: integrar las variantes q4 o w4 (unos 465 MB en total) en una app Android o iOS para que el usuario escriba el nombre de un objeto y obtenga su máscara al instante, sin enviar la imagen a un servidor.
- Edición fotográfica con selección por texto: usar `pred_masks` y `pred_boxes` para aislar objetos concretos (personas, animales, vehículos) y aplicarlos como máscaras en herramientas de retoque o sustitución de fondo.
- Moderación y análisis de imágenes en el borde: ejecutar el pipeline en dispositivos con recursos limitados para detectar y localizar clases de objetos definidas por texto antes de decidir si se envía la imagen a un servicio central.
- Automatización de anotación de datasets: emplear la variante fp32 o fp16 (mayor fidelidad, IoU 1,0 frente a PyTorch) para preetiquetar imágenes con máscaras y cajas, reduciendo el trabajo manual en pipelines de etiquetado.
- Robótica y visión embebida: desplegar el codificador visual y el decodificador en hardware *edge* para tareas de manipulación o navegación que requieran localizar objetos descritos por texto con baja latencia.
- Procesamiento por lotes en servidor sin GPU: al ser grafos TFLite, pueden ejecutarse en CPU con la variante int8 o w8 (IoU 0,9981 y 0,9995 respectivamente) para tareas de segmentación masiva donde el coste de GPU no está justificado.
- Aplicaciones de realidad aumentada: usar la segmentación semántica y las máscaras por objeto para superponer elementos gráficos sobre regiones concretas de la escena capturada por la cámara.

## Benchmarks y rendimiento

La model card incluye una validación cualitativa y cuantitativa sobre una imagen de COCO con el prompt `"cat"`, comparando cada variante frente a la implementación en PyTorch:

| Variante | Objetos detectados (referencia) | IoU de máscara vs PyTorch | Delta maximo de score |
|---|---|---|---|
| fp32 | 1 (1) | 1,0 | 0,0 |
| fp16 | 1 (1) | 1,0 | 0,0 |
| int8 | 1 (1) | 0,9981 | 0,0016 |
| w8 | 1 (1) | 0,9995 | 0,0003 |
| q4 | 1 (1) | 0,9923 | 0,0287 |
| w4 | 1 (1) | 0,9927 | 0,0304 |

No se han publicado resultados de benchmarks estándar (mAP, MMLU, HumanEval, GSM8K u otros) en la información disponible. La validación se limita a una única imagen y un único prompt.

## Requisitos de hardware

- VRAM/RAM estimada según variante (suma de los tres grafos): fp32 ≈ 3,1 GB; fp16 ≈ 1,6 GB; int8 ≈ 844 MB; w8 ≈ 845 MB; q4 ≈ 465 MB; w4 ≈ 465 MB.
- Las variantes q4 y w4 caben holgadamente en memoria de dispositivos móviles de gama media-alta y en GPUs de consumo con 4 GB o más.
- La variante fp32 requiere al menos 4 GB de memoria libre; es adecuada para GPUs de consumo tipo RTX 3060/4060 en adelante o para CPU con RAM suficiente.
- GPU recomendadas para fp32/fp16: RTX 3090, RTX 4090, A100, H100 si se busca máximo rendimiento; no se documentan aceleraciones específicas por GPU.
- Opciones de despliegue: `ai-edge-litert` (`Interpreter` o `CompiledModel`) en Python, Android e iOS; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 3 LiteRT (esta ficha) | no disponible | imagen 1008×1008 + prompt de 32 tokens | TFLite (6 variantes) | SAM License | Hugging Face, repo de 7,8 GB |
| `facebook/sam3` (original) | no disponible | no disponible en la información | no disponible | SAM License | Hugging Face |
| Otros modelos de segmentación por texto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa cuantitativa con otras propuestas de segmentación guiada por texto o de despliegue *edge*.

## Limitaciones y advertencias

- La licencia es la SAM License de Meta, no Apache-2.0 ni MIT; es obligatorio revisar y aceptar sus términos antes de usar o redistribuir los pesos, y puede imponer restricciones al uso comercial.
- El modelo es una conversión derivada, no una versión oficial de Meta; el autor (`tepirale`) no garantiza soporte ni mantenimiento.
- La validación publicada se basa en una sola imagen de COCO y un único prompt (`"cat"`), por lo que no permite extrapolar el comportamiento a otras clases, dominios o condiciones de iluminación.
- Las variantes q4 y w4 presentan una desviación máxima de score de aproximadamente 0,03 frente a PyTorch, lo que puede afectar a la selección de objetos en escenarios con umbrales de confianza ajustados.
- El codificador de texto está limitado a 32 tokens, lo que restringe la complejidad de las consultas textuales.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; al tratarse de un modelo de segmentación, el riesgo principal es la detección de objetos inexistentes o la omisión de objetos presentes.
- El repositorio de 7,8 GB incluye todas las variantes; descargar solo los archivos necesarios para el despliegue previsto.
- No se documentan requisitos mínimos de versión de LiteRT ni compatibilidad verificada con versiones concretas de Android o iOS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tepirale/sam3-LiteRT
- Modelo base: https://huggingface.co/facebook/sam3
- Licencia SAM: https://huggingface.co/facebook/sam3 (enlace indicado como `license_link` en la model card)
- Repositorio de LiteRT (`ai-edge-litert`): no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
