# taurusduan/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot

## Resumen

Este repositorio no contiene un modelo completo listo para usar con Transformers, sino un conjunto de checkpoints parciales empaquetados para ComfyUI en torno a Qwen3-VL-32B, en su variante afinada "ultra uncensored heretic" de llmfan46. El autor, taurusduan, publica dos piezas complementarias: un codificador de condicionamiento H3 que abarca el embedding, las capas de lenguaje 0–49 y la torre de visión completa, y varias "colas" de generación que contienen las capas 50–63, la norma final y la cabeza LM. La separación responde a la arquitectura del nodo H3, que consume el estado oculto no normalizado tras la capa 49.

El interés práctico está en el recorte de memoria: el codificador completo en BF16 ocupa 47,97 GiB, mientras que la variante INT8 ConvRot baja a 24,55 GiB manteniendo la torre de visión en BF16. Las colas de generación añaden entre 5,4 y 15,2 GB según formato (BF16, INT8 ConvRot o NVFP4/AWQ), y se cargan de forma temporal, liberándose tras generar. Esto permite encadenar un codificador de condicionamiento estable con distintas cabezas de generación, incluida una cola basada en el Qwen3-VL-32B-Instruct original.

La relevancia es doble: por un lado, demuestra un patrón de despliegue por etapas para modelos multimodales de 32B en flujos ComfyUI; por otro, la rama "heretic/abliterated" elimina los mecanismos de rechazo del modelo base, lo que tiene implicaciones directas de seguridad y de cumplimiento en producción. La licencia declarada es Apache 2.0, pero las condiciones reales de uso dependen también del modelo base y de la naturaleza del afinado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (torre de visión más capas de lenguaje), empaquetado en dos etapas para H3 |
| Parametros totales | 32B en el modelo base; el repositorio distribuye subconjuntos (capas 0–49 y 50–63) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16, INT8 ConvRot (group size 256, escalas por fila), NVFP4/AWQ (solo cola Instruct) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoints ComfyUI, no repo Transformers completo) |

## Arquitectura y entrenamiento

La base es Qwen3-VL-32B, un transformer multimodal con torre de visión separada y capas de lenguaje densas. El repositorio no reentrena el modelo: lo parte en dos segmentos funcionales. El codificador H3 incluye el embedding de tokens, las capas 0–49 y la torre de visión completa (902 tensores en BF16, 47,97 GiB), y omite deliberadamente las capas 50–63, la norma final y la cabeza LM. La cola de generación aporta exactamente ese tramo restante (354 tensores en INT8 ConvRot, 7,09 GiB) y reutiliza tokenizer, embedding, visión y capas 0–49 del codificador conectado.

La innovación técnica está en el esquema de cuantización ConvRot: matrices de lenguaje en INT8 con escala aprendida por fila y grupo de 256, un embedding de tokens en INT8 tensorwise, y 551 tensores conservados en BF16 (toda la torre de visión y las normas), con 351 escalas FP32 y descriptores de cuantización para ComfyUI. La cola NVFP4/AWQ reduce aún más el tramo generativo (5,4 GB) manteniendo norma y cabeza LM en BF16. No se documentan en la información disponible los datos de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base; el afinado "heretic" se aplicó sobre `llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic`, cuyo proceso de abliteración tampoco se detalla aquí.

## Capacidades

- Generación de texto y razonamiento sobre el modelo Qwen3-VL-32B subyacente, en la variante Instruct afinada sin censura.
- Comprensión de imágenes: la torre de visión completa se conserva íntegra en el codificador, por lo que el pipeline acepta entradas image-text-to-text.
- Generación de texto a partir de imágenes en el nodo standalone `H3 Qwen VL Generate Text`, que combina codificador y cola.
- Mejora de prompts ("prompt enhancement") mediante el nodo H3 Prompt Enhancer, que usa la cola de generación sobre el codificador conectado.
- Intercambio de cabezas de generación: se puede emparejar el codificador con la cola "Ultra Heretic" o con la cola del Qwen3-VL-32B-Instruct estándar, en BF16, INT8 o NVFP4.
- Integración nativa en ComfyUI mediante `CLIPLoader` con tipo de text-encoder compatible con H3.
- Soporte de tool calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingües: solo se declara inglés.

## Casos de uso

- Mejora automática de prompts en flujos ComfyUI: el nodo H3 Prompt Enhancer carga la cola 50–63 de forma temporal y devuelve un prompt enriquecido junto al CLIP sin modificar, lo que permite refinar instrucciones antes de pasarlas al nodo guía H3 sin recargar el codificador de 48 GiB.
- Generación texto-imagen en local con presupuesto de VRAM ajustado: usando el codificador INT8 ConvRot (24,55 GiB) más la cola NVFP4/AWQ (5,4 GB), el conjunto se acerca a los 30 GB, viable en una RTX 5090 o A6000, frente a los más de 63 GB del emparejamiento BF16 completo.
- Sustitución de la cabeza generativa sin tocar el codificador: un equipo que ya tiene cargado el codificador H3 puede alternar entre la cola "Ultra Heretic" y la cola Instruct estándar para comparar comportamiento con y sin abliteración en la misma sesión.
- Investigación sobre alineación y rechazo: la disponibilidad de colas gemelas (heretic e instruct) sobre el mismo codificador permite estudiar cómo cambia la distribución de salida al sustituir únicamente las capas 50–63, aislando el efecto del afinado.
- Descripción de imágenes y VQA en pipelines creativos: el nodo standalone acepta un batch de imágenes opcional y genera texto descriptivo, útil para etiquetado automático o para alimentar metadatos en gestores de assets.
- Prototipado de asistentes visuales sin censura en entornos controlados: para pruebas internas de robustez frente a prompts adversarios, la variante heretic expone comportamientos que el Instruct rechaza, lo que facilita auditorías de filtros y clasificadores.
- Evaluación de cuantización en modelos multimodales: comparar BF16, INT8 ConvRot y NVFP4/AWQ sobre el mismo tramo de capas permite medir la degradación introducida por cada esquema en tareas de visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Codificador H3 BF16: 47,97 GiB solo para las capas 0–49 más visión; requiere GPU de 80 GB (A100, H100) o descarga a CPU/offload.
- Codificador H3 INT8 ConvRot: 24,55 GiB; encaja en RTX 5090 (32 GB), A6000 (48 GB) o L40S (48 GB) dejando margen para el resto del grafo.
- Cola de generación BF16: 15,2 GB; INT8 ConvRot: 7,09 GiB; NVFP4/AWQ: 5,4 GB. Se carga temporalmente y se libera tras generar, por lo que el pico de VRAM es codificador más cola.
- Combinación mínima práctica: codificador INT8 (24,55 GiB) más cola NVFP4 (5,4 GB) ronda los 30 GB, ajustada pero posible en una GPU de 32 GB con gestión cuidadosa de memoria.
- Combinación BF16 completa: superior a 63 GB, solo viable en A100/H100 de 80 GB o con offload parcial.
- Despliegue: exclusivamente vía ComfyUI (`CLIPLoader` con tipo H3 y el nodo `H3 Prompt Enhancer`), más el paquete `ethanfel/ComfyUI-H3-Qwen3VL-TextGen` para generación standalone. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de distribucion | Licencia | Notas |
|---|---|---|---|---|---|
| taurusduan/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot | 32B (partido en 0–49 y 50–63) | no disponible | safetensors ComfyUI, BF16/INT8/NVFP4 | apache-2.0 | Solo ComfyUI; codificador y cola separados; rama abliterada |
| llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic | 32B | no disponible | safetensors Transformers | no disponible en la informacion proporcionada | Modelo base completo del que derivan estos checkpoints |
| Qwen/Qwen3-VL-32B-Instruct | 32B | no disponible | safetensors Transformers, GGUF en la comunidad | no disponible en la informacion proporcionada | Referencia alineada; su cola 50–63 se incluye aquí en INT8 y NVFP4 |

## Limitaciones y advertencias

- No es un modelo autónomo: el codificador omite las capas 50–63, la norma final y la cabeza LM; sin una cola compatible no genera texto.
- Requiere ComfyUI y su dependencia fijada `comfy-kitchen`; no funciona como repositorio Transformers estándar ni con servidores de inferencia convencionales.
- La rama "heretic/abliterated" elimina los rechazos del modelo alineado: puede producir contenido dañino, ilegal o sexualmente explícito. No apta para exposición directa a usuarios sin filtros adicionales.
- La licencia Apache 2.0 se declara sobre el empaquetado, pero el uso comercial debe verificar también las condiciones del modelo base y del afinado de llmfan46.
- Solo se declara inglés; el rendimiento en castellano no está documentado y probablemente degrade.
- Riesgo de alucinación inherente a un modelo de 32B sin datos de evaluación publicados en este repositorio; no hay benchmarks que cuantifiquen la pérdida por INT8 ConvRot o NVFP4.
- La cuantización ConvRot con grupo 256 y escalas por fila es específica de este nodo; mezclar codificador y cola de familias distintas (heretic con instruct) funciona técnicamente pero altera el comportamiento de forma no evaluada.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni informes de fallos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/taurusduan/Qwen3-VL-32B-Ultra-Heretic-H3-ComfyUI-INT8-ConvRot
- Modelo base del afinado: https://huggingface.co/llmfan46/Qwen3-VL-32B-Instruct-ultra-uncensored-heretic
- Nodo de generación standalone: https://github.com/ethanfel/ComfyUI-H3-Qwen3VL-TextGen
