# Wesley1234/FLUX.1-Fill-dev-GGUF-Aix

## Resumen

Wesley1234/FLUX.1-Fill-dev-GGUF-Aix es una versión cuantizada en formato GGUF del modelo FLUX.1-Fill-dev, desarrollado originalmente por Black Forest Labs. Este modelo está especializado en tareas de inpainting y outpainting de imágenes: rellena regiones de una imagen existente a partir de una descripción textual, manteniendo la coherencia estructural y estilística con el contenido original. La cuantización GGUF permite ejecutar el modelo en hardware de consumo con un consumo de memoria reducido, a costa de una ligera pérdida de fidelidad.

El autor de esta conversión, T8star Aix (identificado como Wesley1234 en Hugging Face), proporciona varias versiones cuantizadas (Q8_0, Q6_K, Q4_K_M) junto con métricas de degradación de perplexity respecto al original en BF16. El modelo base tiene 12 mil millones de parámetros y utiliza una arquitectura de transformer de flujo rectificado (rectified flow transformer), diseñada específicamente para generación y edición de imágenes de alta calidad.

La relevancia de esta ficha radica en que ofrece una opción práctica para desarrolladores que necesitan integrar capacidades de edición de imágenes en entornos con recursos limitados, sin renunciar a la calidad del modelo original. Al estar en formato GGUF, es compatible con herramientas como llama.cpp, Ollama o ComfyUI, lo que facilita su despliegue en GPU de gama media o incluso en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified flow transformer) para difusión de imágenes |
| Parametros totales | 12 mil millones (12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de difusión de imágenes, no procesa texto de forma autoregresiva) |
| Tipos de cuantizacion | BF16 (original), GGUF Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | No disponible (el modelo acepta prompts en inglés principalmente, pero no se especifica en la información) |
| Licencia | No disponible (la model card no indica licencia; el modelo original FLUX.1-Fill-dev tiene restricciones de uso no comercial, pero no se confirma en esta versión) |
| Formato de pesos | GGUF (safetensors para el original BF16) |

## Arquitectura y entrenamiento

FLUX.1-Fill-dev se basa en una arquitectura de transformer de flujo rectificado, una variante de los modelos de difusión que utiliza un flujo de transporte óptimo para generar imágenes. El modelo tiene 12 mil millones de parámetros y fue entrenado por Black Forest Labs con un enfoque en la edición de imágenes, específicamente para tareas de inpainting (rellenar regiones) y outpainting (extender el lienzo). El entrenamiento incluye datos de imágenes con máscaras y descripciones textuales, lo que permite al modelo comprender la estructura de la imagen original y completarla de forma coherente.

La versión GGUF aquí presentada es una conversión del modelo original a formato cuantizado, realizada por T8star Aix. La cuantización reduce la precisión de los pesos (de BF16 a 8, 6 o 4 bits) para disminuir el uso de memoria y acelerar la inferencia en hardware menos potente. La model card reporta la degradación de perplexity (ppl) respecto al BF16: +0.0026 para Q8_0, +0.0217 para Q6_K y +0.1754 para Q4_K_M, lo que indica que la pérdida de calidad es mínima en las cuantizaciones más altas.

No se dispone de información detallada sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF, DPO, etc.) en la documentación proporcionada.

## Capacidades

- Inpainting de imágenes: rellena regiones enmascaradas de una imagen existente basándose en una descripción textual, manteniendo la coherencia con el contexto visual.
- Outpainting de imágenes: extiende el lienzo de una imagen más allá de sus bordes originales, generando contenido nuevo que se integra de forma natural.
- Edición guiada por texto: permite modificar elementos específicos de una imagen (objetos, fondos, personas) mediante instrucciones en lenguaje natural.
- Generación de imágenes desde cero: aunque su especialidad es la edición, también puede generar imágenes completas a partir de texto (capacidad heredada del modelo base).
- Compatibilidad con flujos de trabajo de ComfyUI: el autor proporciona nodos y workflows específicos para integrar el modelo en ComfyUI.
- Soporte de cuantización GGUF: permite ejecutar el modelo en GPU con menos VRAM o incluso en CPU, gracias a las versiones Q4_K_M, Q6_K y Q8_0.

## Casos de uso

- Restauración de fotografías antiguas: el modelo puede rellenar zonas dañadas o faltantes de imágenes históricas, reconstruyendo detalles como fondos, rostros o texturas a partir del contexto circundante y una descripción del resultado deseado.
- Edición de producto para comercio electrónico: permite eliminar objetos no deseados de fotos de catálogo (por ejemplo, un reflejo o una sombra) y rellenar el área con contenido plausible, sin necesidad de retoque manual.
- Generación de variaciones de diseño: los diseñadores pueden usar el modelo para extender un patrón o textura más allá de los límites de la imagen original, creando fondos continuos para sitios web o materiales impresos.
- Postproducción de vídeo y fotografía: en flujos de trabajo de VFX, el modelo puede rellenar áreas enmascaradas en fotogramas clave, facilitando la eliminación de objetos o la extensión de escenarios.
- Creación de contenido para redes sociales: los creadores pueden ampliar imágenes de perfil o portadas para adaptarlas a diferentes formatos (cuadrado, panorámico) sin perder calidad ni coherencia visual.
- Prototipado rápido en diseño de interiores: a partir de una foto de una habitación, el modelo puede rellenar zonas vacías con mobiliario o decoración sugerida por texto, ayudando a visualizar opciones de diseño antes de implementarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como FID, LPIPS o métricas de edición) en la información disponible. La model card únicamente reporta la degradación de perplexity (ppl) relativa al modelo original en BF16, que se presenta a continuación:

| Cuantizacion | Degradacion de perplexity (ppl) respecto a BF16 |
|---|---|
| BF16 (original) | -0.0050 (valor de referencia) |
| GGUF Q8_0 | +0.0026 |
| GGUF Q6_K | +0.0217 |
| GGUF Q4_K_M | +0.1754 |

Estos valores indican que la cuantización Q8_0 introduce una pérdida casi imperceptible, mientras que Q4_K_M muestra una degradación mayor pero aún aceptable para muchos casos de uso. No se dispone de comparaciones con otros modelos de edición de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo de 12B en GGUF, se estima un uso de memoria de aproximadamente 6-8 GB con cuantización Q4_K_M, 9-10 GB con Q6_K y 12-13 GB con Q8_0 (incluyendo overhead de activaciones y buffers). Estas cifras son orientativas y dependen de la resolución de la imagen y del tamaño del lote.
- GPU recomendadas: para Q4_K_M, una GPU con 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente. Para Q8_0, se recomienda al menos 12 GB (RTX 4070 Ti, RTX 3080). En GPU de datacenter como A100 o H100, el modelo puede ejecutarse con la cuantización más alta sin problemas.
- Compatibilidad con GPU de consumo: sí, especialmente con las cuantizaciones Q4_K_M y Q6_K, que caben en tarjetas de gama media.
- Opciones de despliegue: el formato GGUF es compatible con llama.cpp, Ollama y, mediante adaptadores, con ComfyUI (el autor proporciona nodos específicos). También puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se dispone de datos medidos. En una GPU RTX 4090, se espera que una generación de imagen de 512x512 con Q4_K_M tarde entre 5 y 15 segundos, dependiendo del número de pasos de difusión. En CPU, el tiempo puede ser de varios minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Uso principal |
|---|---|---|---|---|
| FLUX.1-Fill-dev (original) | 12B | safetensors (BF16) | No comercial (según Black Forest Labs) | Inpainting/outpainting de alta calidad |
| Wesley1234/FLUX.1-Fill-dev-GGUF-Aix | 12B | GGUF (Q4-Q8) | No disponible | Inpainting/outpainting con menor requisito de hardware |
| gpustack/FLUX.1-Fill-dev-GGUF | 12B | GGUF | No disponible | Misma finalidad, otra conversión GGUF |
| YarvixPA/FLUX.1-Fill-dev-GGUF | 12B | GGUF | No disponible | Misma finalidad, otra conversión GGUF |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de información sobre alternativas de otros desarrolladores (como SDXL-Inpaint o modelos de edición de Stability AI) en la documentación proporcionada. La principal diferencia entre las versiones GGUF radica en el proceso de cuantización y las métricas de degradación reportadas, que en este caso son explícitas para cada nivel.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos de internet, puede reflejar sesgos culturales, de género o étnicos en las imágenes generadas o editadas. No se ha realizado una evaluación específica de sesgos en esta versión.
- Riesgo de alucinación: en tareas de inpainting, el modelo puede generar contenido plausible pero incorrecto (por ejemplo, añadir objetos que no estaban en la escena original) si la descripción textual es ambigua o contradictoria con el contexto visual.
- Limitaciones de contexto: el modelo no procesa texto de forma autoregresiva; la longitud del prompt está limitada por el codificador de texto (T5 o CLIP), pero no se especifica el máximo en la documentación.
- Restricciones de licencia: la licencia no está indicada en la model card. El modelo original FLUX.1-Fill-dev tiene una licencia de uso no comercial, por lo que se recomienda verificar los términos antes de usar esta versión en entornos comerciales.
- Dependencia del hardware: aunque la cuantización reduce los requisitos, la calidad de la edición puede degradarse notablemente con Q4_K_M en imágenes de alta resolución o con detalles finos.
- Sin garantía de soporte: el autor es un particular (T8star Aix) y no ofrece soporte técnico formal. Los enlaces a comunidades (Telegram, Bilibili) son los únicos canales de ayuda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wesley1234/FLUX.1-Fill-dev-GGUF-Aix
- Repositorio original (Black Forest Labs): https://huggingface.co/black-forest-labs/FLUX.1-Fill-dev
- Conversión GGUF de gpustack: https://huggingface.co/gpustack/FLUX.1-Fill-dev-GGUF
- Conversión GGUF de YarvixPA: https://huggingface.co/YarvixPA/FLUX.1-Fill-dev-GGUF
- Página en ModelScope (gpustack): https://www.modelscope.cn/models/gpustack/FLUX.1-Fill-dev-GGUF
- Página en CivArchive: https://civarchive.com/models/1108146?modelVersionId=1245049
- Página en Civitai: https://civitai.com/models/1108146/fluxfill-devgguf
- Canal de Bilibili del autor: https://space.bilibili.com/385085361
- Canal de YouTube del autor: https://www.youtube.com/@T8star-Aix
- Comunidad de conocimiento (Knowledge Planet): https://t.zsxq.com/7F90A
- Sitio web oficial: http://aix.studio/
- Grupo de Telegram: https://t.me/+mZ5Z-Kf_TH9lZjE1
- Workflows en OpenArt: https://openart.ai/workflows/profile/t8star
- Workflows en LibLib AI: https://www.liblib.art/userpage/f572a7d9aeaa48a7b406fc46a814d479/publish/workflow
- Repositorio de GitHub (nodos de ComfyUI): https://github.com/T8star1984/Comfyui-Aix-NodeMap
