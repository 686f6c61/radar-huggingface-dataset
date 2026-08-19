# yotisstudios/Warrior-Qwen3.5-4B

## Resumen

Warrior-Qwen3.5-4B es un modelo de visión-lenguaje (image-text-to-text) desarrollado por yotisstudios, resultado de un fine-tuning supervisado (SFT) con LoRA sobre el modelo base Lazarus-Ai/ReAligned-Qwen3.5-4B, que a su vez es una variante alineada de la familia Qwen3.5 con 4.000 millones de parámetros. El modelo está entrenado con el dataset propio yotisstudios/Warrior-SFT y utiliza el framework de entrenamiento Merlina. Está orientado a tareas conversacionales multimodales, combinando entrada de imágenes y texto para generar respuestas textuales.

Con 4.539.265.536 parámetros totales (aproximadamente 4,54B), el modelo se presenta como una opción compacta para despliegue en entornos con recursos limitados, aunque el repositorio no incluye información sobre licencia, idiomas soportados ni benchmarks públicos. Su relevancia radica en ser un ejemplo de fine-tuning eficiente con LoRA y cuantización 4-bit durante el entrenamiento, sobre una base de la familia Qwen, aunque su adopción actual es nula (0 descargas, 0 likes) y carece de documentación sobre capacidades específicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada; basado en Lazarus-Ai/ReAligned-Qwen3.5-4B (transformer multimodal, pipeline image-text-to-text) |
| Parametros totales | 4.539.265.536 (≈4,54B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (según configuración de entrenamiento) |
| Tipos de cuantizacion | No especificados; el entrenamiento usó 4-bit NF4, el repositorio contiene safetensors (probablemente bf16/fp16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) con LoRA sobre el base Lazarus-Ai/ReAligned-Qwen3.5-4B. El entrenamiento se realizó durante 2 épocas con un learning rate de 0.0002, batch size efectivo de 16 (batch size 1 con 16 pasos de acumulación de gradiente), y una longitud máxima de secuencia de 8192 tokens. Se aplicó LoRA con rango 64, alpha 128 y dropout 0.05 sobre las proyecciones up_proj, down_proj, gate_proj, k_proj, q_proj, v_proj y o_proj. La cuantización base fue de 4 bits (NF4) y el optimizador utilizado fue paged_adamw_8bit con scheduler cosine y warmup del 5%. El entrenamiento se ejecutó en una GPU NVIDIA GB10.

El dataset utilizado es yotisstudios/Warrior-SFT, con división train y val, y el formato de datos se adaptó al tokenizer del modelo base con detección automática de modo de pensamiento (thinking) desactivada. Los pesos LoRA se fusionaron antes de la subida al hub. No se exportó a GGUF, aunque la configuración incluía la opción de hacerlo.

## Capacidades

- Procesamiento de entrada multimodal: acepta imágenes y texto (pipeline image-text-to-text).
- Generación de texto conversacional: etiquetado como "conversational", apto para diálogos multi-turno.
- Fine-tuning específico con SFT sobre el dataset Warrior-SFT, lo que sugiere especialización en el dominio de dicho dataset (no documentado).
- Hereda las capacidades del modelo base Qwen3.5-4B, que presumiblemente incluye razonamiento, generación de código y comprensión visual, aunque no se detallan en la información disponible.
- Compatible con la librería transformers y con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Asistente de descripción de imágenes: el modelo puede recibir una imagen y generar una descripción textual detallada, útil para aplicaciones de accesibilidad o catalogación automática de contenido visual.
- Chatbot con entrada visual: integración en sistemas de atención al cliente donde el usuario adjunta capturas de pantalla o fotos y el modelo responde con texto, aprovechando su capacidad conversacional y su contexto de 8192 tokens.
- Análisis de documentos escaneados: procesamiento de imágenes de documentos (facturas, formularios) para extraer información relevante en formato texto, gracias a su naturaleza vision-language.
- Generación de respuestas en entornos educativos: el modelo puede responder preguntas sobre diagramas o ilustraciones en materiales de estudio, funcionando como tutor virtual.
- Automatización de tareas de moderación de contenido: clasificación de imágenes y generación de etiquetas textuales o resúmenes, adecuado por su tamaño compacto para despliegue en servidores de baja capacidad.
- Prototipado rápido de aplicaciones multimodales: al ser un modelo de 4B con safetensors, es fácil de cargar en frameworks como transformers para pruebas de concepto sin requerir infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9-10 GB (4,54B parámetros × 2 bytes).
- VRAM estimada con cuantización 4-bit (si se convierte a GGUF Q4_K_M): alrededor de 3-4 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB) para fp16; GPUs con 8-12 GB (RTX 3070/3080) pueden ejecutarlo con cuantización.
- No cabe en GPUs consumer de gama baja (menos de 8 GB) sin cuantización.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama (tras conversión), Hugging Face TGI, o directamente con transformers en Python.
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables con información pública en la documentación proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones específicas del modelo.
- El dataset Warrior-SFT no está documentado, por lo que el modelo puede tener sesgos o comportamientos no deseados derivados de ese conjunto de datos.
- La licencia no está especificada, lo que impide conocer restricciones para uso comercial o modificaciones.
- El modelo tiene 0 descargas y 0 likes, indicando que no ha sido validado por la comunidad; su fiabilidad en producción es incierta.
- El contexto de 8192 tokens puede ser limitante para tareas que requieran ventanas más largas.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yotisstudios/Warrior-Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/yotisstudios/Warrior-SFT
- Modelo base: https://huggingface.co/Lazarus-Ai/ReAligned-Qwen3.5-4B
- Framework Merlina (GitHub): https://github.com/Schneewolf-Labs/Merlina
