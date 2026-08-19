# TencentARC/SCoPE

## Resumen

SCoPE (Sightline-Coordinate Positional Encoding) es un modelo de generación de vídeo de imagen a vídeo desarrollado por TencentARC que añade control de cámara a un transformer de difusión de vídeo preentrenado. Partiendo de un primer fotograma, un prompt de texto y una trayectoria de cámara, genera un vídeo que sigue el movimiento de cámara solicitado mientras preserva el prior de image-to-video del modelo base Wan2.2-I2V-A14B. El modelo se publica como un release autocontenido: incluye todos los pesos necesarios para inferencia, sin requerir una descarga separada del checkpoint de Wan2.2.

La relevancia de SCoPE radica en que permite controlar explícitamente el movimiento de cámara en la generación de vídeo, una capacidad que los modelos de difusión de vídeo estándar no ofrecen de forma directa. Está pensado para investigación en generación de vídeo y control de cámara, y se distribuye bajo licencia Apache-2.0. El checkpoint ocupa aproximadamente 67 GB, lo que sugiere una arquitectura de gran tamaño, coherente con su base de 14 mil millones de parámetros (no confirmado en la documentación).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Video diffusion transformer con sightline-coordinate positional encoding, basado en Wan2.2-I2V-A14B |
| Parametros totales | No disponible (el checkpoint pesa ~67 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SCoPE se construye sobre Wan2.2-I2V-A14B, un modelo de difusión de vídeo basado en transformer. La innovación principal es la incorporación de las líneas de visión (sightlines) de la cámara como coordenadas posicionales adicionales en el transformer. Esto permite que el modelo condicione la generación de vídeo en la trayectoria de cámara deseada, expresada en coordenadas OpenCV camera-to-world, sin modificar el prior de image-to-video del modelo base. Un mecanismo de escala aprendido (learned scale gate) maneja la escala absoluta de la escena.

El entrenamiento se realizó con los datasets RealEstate10K, DL3DV, PanShot y OmniWorld, que comparten un protocolo de cámara común: las poses se expresan relativas a la primera cámara y la traducción se normaliza con la profundidad cercana por clip. No se menciona el uso de RLHF, DPO u otras técnicas de alineación. El modelo se publica con pesos preentrenados y no se detalla el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de vídeo a partir de una imagen inicial (image-to-video) con control de cámara explícito.
- Acepta una trayectoria de cámara definida por poses (formato `[81, 3, 4]` o `[81, 4, 4]`) y un campo de visión horizontal (`x_fov`).
- Soporta prompts de texto para guiar el contenido del vídeo.
- Preserva el prior de image-to-video del modelo base Wan2.2, manteniendo la calidad visual y la coherencia temporal.
- Compatible con cámaras pinhole (xi=0) y otros tipos de cámara mediante la especificación de `x_fov`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multimodal más allá de imagen y texto.

## Casos de uso

- Producción cinematográfica y publicitaria: generar planos con movimiento de cámara específico (travelling, paneo, etc.) a partir de una imagen fija, para previsualizar escenas o crear metraje de relleno.
- Recorridos virtuales inmobiliarios: a partir de una fotografía de un interior, generar un vídeo que simule un recorrido con una trayectoria de cámara definida, útil para anuncios o visitas virtuales.
- Simulación de escenas para videojuegos: crear cinemáticas con movimiento de cámara controlado desde una imagen conceptual, acelerando el prototipado de escenas.
- Investigación en visión por computador: estudiar el efecto del control de cámara en la generación de vídeo, comparando trayectorias y campos de visión.
- Generación de contenido para realidad virtual y aumentada: producir vídeos 360 o con movimiento de cámara que se integren en experiencias inmersivas.
- Creación de material educativo: generar vídeos explicativos con movimientos de cámara suaves a partir de imágenes de diagramas o ilustraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPUs recomendadas en la documentación proporcionada.
- Dado el tamaño del checkpoint (~67 GB) y la naturaleza del modelo (difusión de vídeo con 14B parámetros base), se requiere una GPU de alta gama con al menos 24 GB de VRAM para inferencia, probablemente más para secuencias largas.
- El entorno de ejecución recomendado es PyTorch 2.9.1 con CUDA 12.8; se advierte que cambiar la versión de PyTorch puede alterar los resultados numéricos.
- Para despliegue, se proporciona un script de inferencia (`inference.py`) en el repositorio de GitHub; no se mencionan integraciones con vLLM, llama.cpp, Ollama u otros frameworks de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. SCoPE se posiciona como una extensión de Wan2.2-I2V-A14B, por lo que su comparativa natural sería con otros modelos de image-to-video con control de cámara, pero no se han publicado datos al respecto.

## Limitaciones y advertencias

- El modelo hereda las capacidades visuales, sesgos, limitaciones de seguridad y requisitos computacionales de Wan2.2.
- Los resultados pueden degradarse con poses de cámara inexactas, intrínsecos incorrectos, trayectorias muy alejadas de la distribución de entrenamiento, oclusiones grandes o movimientos de cámara inusualmente rápidos.
- Se requiere especificar correctamente el campo de visión horizontal (`x_fov`) y las poses de cámara en el formato esperado; errores en estos parámetros afectan directamente a la calidad del vídeo.
- La licencia Apache-2.0 permite uso comercial, pero los datasets de entrenamiento (RealEstate10K, DL3DV, PanShot, OmniWorld) pueden tener sus propias restricciones; el usuario es responsable de cumplir sus términos.
- No se documentan sesgos específicos del modelo, pero al estar basado en Wan2.2, puede reflejar los sesgos presentes en los datos de entrenamiento de ese modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/TencentARC/SCoPE
- Página del proyecto: https://visual-ai.github.io/scope/
- arXiv: https://arxiv.org/abs/2606.27345
- Repositorio GitHub: https://github.com/TencentARC/SCoPE
- Licencia: https://github.com/TencentARC/SCoPE/blob/main/LICENSE.txt
