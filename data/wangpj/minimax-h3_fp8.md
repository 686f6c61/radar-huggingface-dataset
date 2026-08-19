# wangpj/MiniMax-H3_fp8

## Resumen

Este repositorio, publicado por el usuario wangpj, ofrece una redistribución de los archivos del modelo MiniMax-H3, un sistema de generación de vídeo por difusión, empaquetados específicamente para su uso en ComfyUI. El modelo original, desarrollado por MiniMaxAI, se complementa aquí con versiones cuantizadas (bf16, int8_convrot, fp8_scaled, nvfp4_awq) del modelo de difusión y del codificador de texto (basado en Qwen3-VL-32B), así como con LoRAs turbo y los correspondientes VAEs de audio y vídeo. El objetivo es facilitar la integración del modelo en flujos de trabajo de ComfyUI, permitiendo generar vídeo a partir de texto, imagen o vídeo de referencia.

La relevancia actual de este repositorio radica en que MiniMax-H3 es uno de los modelos de generación de vídeo de código abierto más avanzados, y esta versión empaquetada elimina barreras técnicas para su despliegue local. El tamaño total del repositorio es de 481,4 GB, lo que refleja la magnitud del modelo y la necesidad de recursos de hardware considerables. No se especifican parámetros totales del modelo de difusión, aunque el codificador de texto es de 32B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (no se detalla si es transformer, MoE, etc.) |
| Parámetros totales | No disponible (el text encoder es Qwen3-VL-32B, pero el modelo de difusión no se especifica) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16, int8_convrot, fp8_scaled, nvfp4_awq (para el text encoder) |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo de difusión MiniMax-H3. Se sabe que es un modelo de generación de vídeo por difusión, y que el repositorio incluye un codificador de texto basado en Qwen3-VL-32B, que se ofrece en versiones cuantizadas (bf16, int8_convrot y nvfp4_awq). El autor indica que la versión `nvfp4_awq` no requiere GPU Blackwell, mientras que para los modelos de difusión se recomienda la cuantización `int8_convrot` si se puede usar PyTorch con CUDA 13.0; la versión `fp8_scaled` es una alternativa para quienes no puedan usar `int8_convrot`. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (T2V), imagen (I2V) y vídeo de referencia (R2V), según los flujos de trabajo incluidos.
- Incluye un codificador de texto multimodal (Qwen3-VL-32B) que procesa instrucciones textuales y posiblemente visuales.
- Soporta VAEs específicos para audio y vídeo, lo que permite generar vídeo con banda sonora sincronizada.
- LoRAs turbo incluidos para acelerar el muestreo (4 y 8 pasos), reduciendo el tiempo de generación.
- Compatibilidad con ComfyUI mediante archivos de un solo archivo (`diffusion-single-file`).
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso, ya que es un modelo generativo de vídeo, no un LLM conversacional.

## Casos de uso

- Producción de vídeo creativo: generación de clips cortos para redes sociales, anuncios o contenido promocional a partir de una descripción textual, gracias a la generación T2V.
- Animación de imágenes estáticas: conversión de fotografías o ilustraciones en secuencias animadas (I2V), útil para diseñadores y artistas digitales.
- Restyling de vídeos existentes: mediante la modalidad R2V, se puede transformar un vídeo de referencia en un nuevo estilo o contenido, manteniendo la estructura.
- Prototipado rápido de storyboards: los creadores pueden generar borradores de escenas antes de la producción final, usando las LoRAs turbo para obtener resultados rápidos.
- Investigación en generación de vídeo: el modelo sirve como base para experimentos académicos sobre difusión aplicada a vídeo, gracias a su disponibilidad en formato safetensors.
- Integración en pipelines de postproducción: al estar empaquetado para ComfyUI, se puede combinar con otros nodos de edición, corrección de color o composición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como FVD, IS, CLIP score u otras típicas en generación de vídeo.

## Requisitos de hardware

- Dado el tamaño del repositorio (481,4 GB) y la presencia de versiones cuantizadas, se requiere una GPU con alta capacidad de VRAM. Las versiones bf16 probablemente necesiten más de 80 GB de VRAM, mientras que las versiones int8 o fp8 pueden reducir el requisito, aunque no se especifican valores exactos.
- El autor menciona que la versión `nvfp4_awq` del text encoder no requiere GPU Blackwell, lo que sugiere que las otras versiones podrían estar optimizadas para arquitecturas más recientes.
- Se recomienda una GPU de gama alta como NVIDIA RTX 4090 (24 GB) para las versiones cuantizadas ligeras, aunque para las versiones completas bf16 se necesitarían GPUs profesionales como A100 o H100 (80 GB).
- Opciones de despliegue: ComfyUI es el entorno principal, ya que los archivos están preparados para sus carpetas (`diffusion_models`, `text_encoders`, `loras`, `vae`). No se menciona compatibilidad con vLLM, llama.cpp u otros servidores de inferencia.
- La latencia y el throughput no están documentados. El uso de LoRAs turbo (4 u 8 pasos) reduce significativamente el tiempo de muestreo en comparación con los pasos estándar.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de generación de vídeo como Sora, Runway Gen-3, o Stable Video Diffusion. Los datos de parámetros, rendimiento y licencia de estos modelos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia `minimax-h3-community-license-agreement` puede imponer restricciones al uso comercial o a la redistribución. Es necesario revisar el texto completo de la licencia antes de su uso en producción.
- Requisitos de hardware elevados: el tamaño del modelo (481 GB en total) implica que no es viable en hardware de consumo sin cuantizaciones agresivas, y aún así la VRAM necesaria puede superar los 24 GB.
- Riesgo de alucinaciones visuales: como todo modelo generativo, puede producir vídeos con inconsistencias, artefactos o contenido no deseado, especialmente en escenas complejas.
- Sesgos potenciales: al ser un modelo entrenado con datos de internet, puede reflejar sesgos culturales o de género en las representaciones generadas.
- Documentación incompleta: no se especifican los idiomas soportados, la longitud de contexto ni los detalles de entrenamiento, lo que dificulta evaluar su robustez en escenarios multilingües o de contexto largo.
- Dependencia de ComfyUI: el empaquetado está orientado exclusivamente a ComfyUI; su uso fuera de este entorno requeriría conversión manual de los archivos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wangpj/MiniMax-H3_fp8
- Modelo original MiniMaxAI/MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio de LoRAs Turbo: https://huggingface.co/lightx2v/Minimax-h3-Turbo
- Text encoder cuantizado (referencia): https://huggingface.co/cybermotaz/Qwen3-VL-32B-Instruct-NVFP4
- Workflow I2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Workflow T2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_t2v.json
- Workflow R2V: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_r2v.json
