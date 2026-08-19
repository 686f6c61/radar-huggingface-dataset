# zherebetskyy/Qwen3.8-27B-mxfp8-mlx

## Resumen

Qwen3.8-27B-mxfp8-mlx es una versión cuantizada en formato MXFP8 (microscaling de 8 bits) del modelo multimodal Qwen3.8-27B, desarrollada por el usuario zherebetskyy para ejecutarse en Apple Silicon mediante el framework MLX. El modelo original, creado por el equipo Qwen, combina capacidades de visión y lenguaje (image-text-to-text), lo que permite tareas como descripción de imágenes, respuesta a preguntas visuales y razonamiento multimodal. Esta variante cuantizada busca ofrecer un equilibrio entre fidelidad cercana a FP16 y un consumo de memoria reducido a la mitad, con una precisión relativa estimada por el autor del 99,5-99,9 % respecto a los pesos completos.

La cuantización MXFP8 utiliza un esquema de microscaling con bloques finos (tamaño 32) y un factor de escala compartido E8M0, junto con una distribución exponencial E4M3 que preserva los valores atípicos de alta magnitud, algo crítico en modelos de lenguaje y visión. El repositorio incluye pesos en formato safetensors y está diseñado para su uso con la librería mlx-vlm. El modelo tiene aproximadamente 27 780 millones de parámetros (según la model card), aunque los metadatos de HuggingFace muestran una cifra discrepante de 8 027 131 120 parámetros en los safetensors; esta inconsistencia se detalla en la sección de limitaciones.

La relevancia actual de este modelo radica en que permite ejecutar un modelo multimodal de gran tamaño en hardware de Apple con memoria unificada de 64 GB o superior, manteniendo una calidad de razonamiento cercana a la precisión completa, algo que las cuantizaciones de 4 bits no logran en tareas complejas como matemáticas o análisis visual denso. Es una opción práctica para desarrolladores que trabajan en ecosistemas macOS con chips M1-M4 Max/Ultra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + lenguaje), basada en Qwen3.8-27B |
| Parametros totales | 27 780 000 000 (27,78 B) según model card; discrepancia en safetensors (8 027 131 120) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se hereda del modelo base Qwen3.8-27B, no especificado en la ficha) |
| Tipos de cuantizacion | MXFP8 (8-bit microscaling, E4M3/E8M0) |
| Idiomas soportados | inglés (según metadatos; el modelo base puede soportar más, pero no se indica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal que combina un codificador de visión con un decodificador de lenguaje, diseñado para tareas de imagen-texto. La arquitectura exacta (número de capas, dimensiones, etc.) no se detalla en la información proporcionada, pero se hereda del modelo original de Qwen. El entrenamiento del modelo base incluye datos de imagen y texto, con técnicas de alineación como RLHF o DPO, aunque no se especifican en esta ficha.

La innovación principal de esta versión es la cuantización MXFP8, que utiliza microscaling estándar OCP: los tensores se dividen en bloques de 32 elementos y se asigna un factor de escala compartido de 8 bits (E8M0). La mantisa usa el formato E4M3, que ofrece un rango dinámico amplio y preserva los valores atípicos en canales activos, algo que las cuantizaciones enteras uniformes (INT4/INT8) no logran. Esto reduce la degradación en tareas de razonamiento multi-paso, matemáticas, parseo JSON y procesamiento visual denso, según el autor. El proceso de cuantización se realizó con la herramienta mlx-vlm de Apple, y no se menciona ningún ajuste fino posterior.

## Capacidades

- Generación de texto y razonamiento multimodal: puede procesar imágenes y texto para responder preguntas, describir contenido visual y realizar inferencias complejas.
- Soporte de tool calling / function calling: no se menciona explícitamente, pero el modelo base Qwen3.8-27B podría incluirlo; no confirmado en esta variante.
- Soporte de agentes y multi-step reasoning: el autor afirma que MXFP8 preserva la calidad en razonamiento multi-paso, aunque no hay benchmarks específicos.
- Capacidades multilingües: solo se indica inglés en los metadatos; el modelo base podría soportar más idiomas, pero no se documenta.
- Capacidades especiales: visión (image-to-text), conversación multimodal, cuantización de baja precisión optimizada para Apple Silicon.

## Casos de uso

- Descripción automática de imágenes en aplicaciones de accesibilidad: el modelo puede generar descripciones detalladas de fotografías o gráficos, ayudando a personas con discapacidad visual. Su precisión cercana a FP16 garantiza que los detalles finos de la imagen no se pierdan.
- Asistente de atención al cliente con soporte visual: en plataformas de soporte donde los usuarios envían capturas de pantalla o fotos de productos, el modelo puede interpretar la imagen y generar respuestas contextuales, manteniendo conversaciones multi-turno gracias a su contexto largo (heredado del modelo base).
- Análisis de documentos técnicos con figuras: en entornos de ingeniería o investigación, el modelo puede extraer información de diagramas, gráficos y tablas en formato imagen, facilitando la revisión de documentación técnica.
- Generación de código a partir de capturas de pantalla: aunque no se confirma tool calling, el modelo puede describir y razonar sobre código mostrado en imágenes, útil para documentación o depuración asistida.
- Moderación de contenido visual: puede clasificar imágenes según su contenido (violencia, desnudos, etc.) con alta precisión, gracias a su capacidad de razonamiento visual y su baja pérdida de calidad en cuantización.
- Investigación en visión por computador: los investigadores pueden usar este modelo como punto de partida para tareas de VQA (visual question answering) o captioning, aprovechando su ejecución eficiente en hardware Apple sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) específicos para esta versión cuantizada MXFP8 en la información disponible. El autor proporciona una tabla comparativa de precisión relativa estimada frente a FP16, pero son afirmaciones subjetivas sin métricas externas verificables:

| Formato | Precisión relativa estimada (% de FP16) |
|---|---|
| MXFP8 (este modelo) | ~99,5-99,9 % |
| 6-bit MLX | ~97,5-98,5 % |
| 4-bit MLX | ~92,0-95,0 % |
| NVFP4 MLX | ~93,5-96,0 % |

Estos valores provienen de la model card del autor y no deben considerarse como resultados de benchmarks independientes. Para el modelo base Qwen3.8-27B, no se incluyen datos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 28-30 GB de memoria unificada (según el autor), lo que equivale a la RAM del sistema en Apple Silicon.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 en variantes Max o Ultra) con 64 GB o más de memoria unificada.
- Compatibilidad con GPU de consumo: no aplica, ya que MLX solo funciona en Apple Silicon; no es compatible con NVIDIA o AMD.
- Opciones de despliegue: mediante la librería mlx-vlm (versión >= 0.6.13) en Python 3.10 o superior, o mediante la CLI `python -m mlx_vlm.generate`.
- Latencia y throughput: no se proporcionan datos concretos; el autor afirma "significativamente más rápida" que FP16, pero sin cifras.

## Comparativa con modelos similares

La comparativa se realiza con otras versiones cuantizadas del mismo modelo base, ya que no se dispone de datos de modelos alternativos comparables en la información proporcionada.

| Modelo | Cuantización | Precisión relativa estimada | Memoria requerida | Licencia |
|---|---|---|---|---|
| Qwen3.8-27B-mxfp8-mlx (este) | MXFP8 (8-bit) | ~99,5-99,9 % | ~30 GB | Apache-2.0 |
| Qwen3.8-27B-6bit-mlx | 6-bit uniforme | ~97,5-98,5 % | no disponible | Apache-2.0 |
| Qwen3.8-27B-4bit-mlx | 4-bit INT4 | ~92,0-95,0 % | no disponible | Apache-2.0 |
| Qwen3.8-27B-nvfp4-mlx | 4-bit NVFP4 | ~93,5-96,0 % | no disponible | Apache-2.0 |

No se dispone de comparación con otros modelos multimodales de tamaño similar (p. ej., LLaVA, InternVL) en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia en el número de parámetros: los metadatos de HuggingFace indican 8 027 131 120 parámetros en los safetensors, mientras que la model card declara 27 780 000 000. Esta inconsistencia no está explicada y podría deberse a un error en los metadatos o a una estructura de pesos diferente (p. ej., exclusión de embeddings). Se recomienda verificar antes de usar en producción.
- Idioma limitado: solo se confirma inglés; el uso en otros idiomas puede degradar el rendimiento.
- Dependencia de Apple Silicon: el modelo solo se puede ejecutar en hardware Apple con MLX; no es portable a entornos Linux/Windows con GPUs NVIDIA.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o no verificado, especialmente en descripciones de imágenes ambiguas.
- Sesgos: no se documentan sesgos específicos, pero el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el autor indica que se deben respetar los términos de la licencia original de Qwen (extra_gated_prompt), que puede tener condiciones adicionales para uso comercial.
- Sin benchmarks verificados: las afirmaciones de precisión relativa son del autor y no han sido validadas por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zherebetskyy/Qwen3.8-27B-mxfp8-mlx
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base en MLX (bf16): https://huggingface.co/mlx-community/Qwen3.8-27B-bf16
- Framework MLX: https://github.com/ml-explore/mlx
- Librería mlx-vlm: https://github.com/ml-explore/mlx-vlm
- Otras versiones cuantizadas del mismo autor:
  - 6-bit: https://huggingface.co/zherebetskyy/Qwen3.8-27B-6bit-mlx
  - 4-bit: https://huggingface.co/zherebetskyy/Qwen3.8-27B-4bit-mlx
  - NVFP4: https://huggingface.co/zherebetskyy/Qwen3.8-27B-nvfp4-mlx
