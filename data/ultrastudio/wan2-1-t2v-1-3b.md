# UltraStudio/Wan2.1-T2V-1.3B

## Resumen

Wan2.1-T2V-1.3B es el modelo de generacion de video a partir de texto (text-to-video) mas pequeno de la familia Wan2.1, desarrollada por el equipo Wan (organizacion Wan-AI). El repositorio aqui analizado, UltraStudio/Wan2.1-T2V-1.3B, es una redistribucion publicada bajo la libreria diffusers y con pesos en formato safetensors, con un total de 1.418.996.800 parametros. La model card distribuida corresponde a la version original del modelo.

El problema que resuelve es el acceso a la generacion de video de calidad con hardware de consumo: requiere unicamente 8,19 GB de VRAM y puede generar un video de 5 segundos a 480P en una RTX 4090 en aproximadamente 4 minutos, sin tecnicas de optimizacion como la cuantizacion. Esto lo situa dentro del alcance de practicamente cualquier GPU de gama consumer.

Su relevancia actual reside en que la familia Wan2.1 declara superar a los modelos de video de codigo abierto existentes y a varias soluciones comerciales en multiples benchmarks, ademas de ser, segun sus autores, el primer modelo de video capaz de generar texto legible tanto en chino como en ingles. La limitacion principal es la resolucion: aunque el modelo puede generar a 720P, el entrenamiento en esa resolucion es escaso y los resultados son menos estables, por lo que se recomienda 480P.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle (modelo de difusion text-to-video; la model card solo detalla el VAE, denominado Wan-VAE) |
| Parametros totales | 1.418.996.800 (segun metadatos de safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de video, no de lenguaje) |
| Tipos de cuantizacion | No disponibles; la model card menciona la cuantizacion como tecnica de optimizacion no empleada en las mediciones publicadas |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamano del repositorio: 17,6 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del backbone del modelo (tipo de transformer de difusion, mecanismo de atencion ni configuracion de capas). La model card si describe el componente VAE, denominado Wan-VAE, presentado como un VAE de video capaz de codificar y decodificar video a 1080P de cualquier longitud preservando la informacion temporal, lo que lo convierte en una base para generacion de video e imagen. El modelo forma parte de un suite que cubre text-to-video, image-to-video, edicion de video, text-to-image y video-to-audio.

No se especifican en el material proporcionado el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card menciona como innovacion destacable la capacidad de generar texto visual tanto en chino como en ingles, y el uso de Wan-VAE para manejar resoluciones altas y longitudes arbitrarias. Las fechas del repositorio (creado y actualizado el 26 de septiembre de 2026) no coinciden con la publicacion original de los pesos de Wan2.1, anunciada el 25 de febrero de 2025.

## Capacidades

- Generacion de video a partir de descripciones textuales (text-to-video), en resoluciones de 480P y 720P.
- Generacion de texto visual integrado en el video, en chino e ingles, lo que permite rotulos, carteles o texto en pantalla legibles.
- Codificacion y decodificacion de video a 1080P de longitud arbitraria mediante Wan-VAE, preservando coherencia temporal.
- Soporte multilingue limitado a los prompts en ingles y chino.
- Integracion prevista con diffusers (el repositorio analizado se publica ya bajo esa libreria) y con ComfyUI, aunque la model card original marca la integracion con ComfyUI como pendiente.
- Demo en Gradio disponible en el repositorio original.
- No se documenta soporte de tool calling, function calling, uso agentico ni modos de razonamiento extendido, ya que no es un modelo de lenguaje.

## Casos de uso

- Generacion de clips publicitarios cortos: el modelo produce videos de 5 segundos a 480P en aproximadamente 4 minutos sobre una RTX 4090, lo que permite iterar rapidamente sobre variaciones de un anuncio antes de pasar a produccion con modelos mayores.
- Previsualizacion de storyboards en produccion audiovisual: dado un guion en ingles o chino, se pueden generar bocetos animados para validar encuadres y ritmo antes del rodaje real.
- Contenido para redes sociales: la generacion de videos verticales u horizontales de pocos segundos encaja con el formato de plataformas como TikTok o Instagram Reels, y el bajo requisito de VRAM permite ejecutarlo en estaciones de trabajo modestas.
- Material de apoyo educativo: gracias a la generacion de texto visual en ingles y chino, se pueden producir clips con rotulos o terminos tecnicos integrados directamente en el video.
- Generacion de B-roll sintetico: equipos de edicion pueden crear planos de recurso sin depender de bancos de imagenes de pago, con licencia Apache 2.0 que permite uso comercial.
- Prototipado en equipos con presupuesto limitado: al requerir solo 8,19 GB de VRAM, es viable en tarjetas de gama media y en entornos academicos con recursos de computo restringidos.
- Investigacion academica en generacion de video: sirve como modelo base ligero para experimentar con tecnicas de muestreo, destilacion o ajuste fino sin necesidad de cl(u)steres multi-GPU.
- Generacion por lotes automatizada: puede integrarse en pipelines scriptados que generen variaciones de un mismo prompt para seleccion posterior, dado que la inferencia se ejecuta en una sola GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma de forma cualitativa que Wan2.1 "supera de forma consistente a los modelos de codigo abierto existentes y a soluciones comerciales de ultima generacion en multiples benchmarks", pero no incluye cifras, tablas ni conjuntos de evaluacion concretos. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas especificas de generacion de video (FVD, CLIPScore, VBench, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: 8,19 GB para el modelo T2V-1.3B, sin cuantizacion.
- GPU recomendadas: el modelo esta disenado para ser compatible con practicamente cualquier GPU de consumo. La RTX 4090 es la referencia de rendimiento citada; tambien es viable en tarjetas de gama media que superen los 8,19 GB de VRAM.
- Cabe en GPU consumer: si, este es precisamente el objetivo del modelo. La model card lo describe como compatible con "casi todas las GPU de gama consumer".
- Latencia y throughput: aproximadamente 4 minutos para generar un video de 5 segundos a 480P en una RTX 4090, sin tecnicas de optimizacion como cuantizacion.
- Opciones de despliegue: libreria diffusers (el repositorio se publica bajo esa libreria), inferencia multi-GPU del repositorio original, demo en Gradio. La integracion con ComfyUI figura como pendiente en la model card original. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de difusion de video.

## Comparativa con modelos similares

| Modelo | Parametros | Resoluciones | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B (este) | 1,3B | 480P (720P inestable) | Text-to-video | Apache 2.0 | HuggingFace, ModelScope |
| Wan2.1-T2V-14B | 14B | 480P y 720P | Text-to-video | No disponible en la informacion | HuggingFace, ModelScope |
| Wan2.1-I2V-14B-480P | 14B | 480P | Image-to-video | No disponible en la informacion | HuggingFace, ModelScope |
| Wan2.1-I2V-14B-720P | 14B | 720P | Image-to-video | No disponible en la informacion | HuggingFace, ModelScope |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a modelos de otros fabricantes (CogVideoX, HunyuanVideo, LTX-Video u otros), por lo que la comparativa se limita a parametros, resoluciones y disponibilidad segun la informacion proporcionada.

## Limitaciones y advertencias

- Resolucion: aunque el modelo puede generar a 720P, el entrenamiento a esa resolucion es limitado y los resultados son menos estables. Se recomienda 480P para un rendimiento optimo.
- Idiomas: los prompts y el texto visual estan limitados a ingles y chino. No hay soporte documentado para el castellano ni para otras lenguas.
- Riesgo de alucinacion visual: al ser un modelo generativo de difusion, puede producir artefactos, incoherencias temporales o contenido que no se corresponde con el prompt. La model card no cuantifica este riesgo.
- Sesgos: no se documentan analisis de sesgo ni medidas de mitigacion en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y atribucion. No se han documentado restricciones adicionales de uso aceptable en el material proporcionado.
- Origen del repositorio: el repositorio analizado pertenece a UltraStudio, no a Wan-AI. Conviene verificar la integridad de los pesos frente al repositorio oficial antes de usarlos en produccion.
- Fechas inconsistentes: el repositorio figura como creado y actualizado el 26 de septiembre de 2026, fecha posterior a la publicacion original de los pesos (25 de febrero de 2025), lo que sugiere un error de metadatos o una resubida.
- Integraciones incompletas: la model card original marca como pendientes la integracion con diffusers y con ComfyUI, aunque este repositorio concreto ya se publica bajo diffusers.
- Sin benchmarks publicados: la ausencia de metricas verificables impide comparar de forma objetiva su calidad frente a alternativas.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/UltraStudio/Wan2.1-T2V-1.3B
- Repositorio oficial del mismo modelo: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Organizacion Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.1
- ModelScope: https://www.modelscope.cn/organization/Wan-AI
- Modelo T2V-14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo I2V-14B-720P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Modelo I2V-14B-480P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- Blog: https://wanxai.com
- Discord: https://discord.gg/p5XbdQV7
- Paper: anunciado como "coming soon", sin enlace disponible
