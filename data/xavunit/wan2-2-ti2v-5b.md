# xavunit/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de generación de vídeo desarrollado por el equipo Wan (Alibaba). Se trata de una actualización de la serie Wan2.2, que introduce una arquitectura Mixture-of-Experts (MoE) en los modelos de difusión de vídeo. El modelo es capaz de generar vídeo a partir de texto (text-to-video) y a partir de imágenes (image-to-video), combinando ambas modalidades en un único sistema. Destaca por su alta compresión mediante un VAE avanzado con ratio 16×16×4, lo que permite generar vídeos a 720P y 24 fps en una única GPU de consumo, como la RTX 4090. Es uno de los modelos de su categoría más rápidos en alcanzar esa resolución, según sus desarrolladores.

El repositorio de Hugging Face correspondiente a este modelo está alojado bajo el usuario `xavunit`, aunque el modelo original es publicado por `Wan-AI`. La licencia es Apache 2.0, lo que permite uso comercial y modificación, y los idiomas soportados son inglés y chino. El tamaño del repositorio es de 54.2 GB, con pesos en formato `safetensors`. Este modelo se integra con la librería `wan2.2` y es compatible con Diffusers y ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) en modelo de difusión de vídeo, con VAE de compresión 16×16×4 |
| Parametros totales | 5B (según denominación del modelo, no se especifica desglose) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de generación de vídeo, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Wan2.2 introduce un MoE en el proceso de denoising de la difusión, separando los pasos de tiempo en expertos especializados. Esto aumenta la capacidad del modelo sin incrementar el coste computacional, ya que solo se activan los expertos necesarios en cada paso. El VAE de alta compresión (16×16×4) reduce la latencia y permite trabajar con resoluciones de 720p a 24 fps. El entrenamiento incorpora datos estéticos cuidadosamente curados con etiquetas detalladas sobre iluminación, composición, contraste y tono de color, lo que facilita la generación de estilos cinematográficos. Según la documentación, el modelo se entrenó con un 65.6% más de imágenes y un 83.2% más de vídeos que la versión anterior (Wan2.1), mejorando la generalización en movimiento, semántica y estética. No se menciona el uso de técnicas de alineación como RLHF o DPO; el entrenamiento se centra en la calidad de generación.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y a partir de imágenes (image-to-video) en un solo modelo.
- Resolución de salida de 720p a 24 fps, con alta calidad estética y control de estilo cinematográfico.
- Compresión de vídeo eficiente gracias al VAE 16×16×4, lo que reduce los requisitos de memoria y acelera la generación.
- Soporte para ejecución en una única GPU de consumo (por ejemplo, RTX 4090).
- Integración con Diffusers y ComfyUI para su uso en entornos de producción y prototipado.
- Multilingüe en inglés y chino (etiquetas de texto).
- No se especifican capacidades de tool calling ni de agentes, al ser un modelo de generación de vídeo.

## Casos de uso

- **Generación de contenido para redes sociales**: crear vídeos cortos promocionales o animaciones a partir de descripciones textuales, reduciendo el tiempo de producción de contenido visual.
- **Prototipado de escenas para cine y animación**: los directores pueden generar vídeos preliminares de escenas a partir de guiones o imágenes de referencia, facilitando la previsualización.
- **Material educativo**: generar vídeos explicativos animados sobre conceptos científicos o históricos, partiendo de texto descriptivo.
- **Demostraciones de producto**: crear vídeos de producto a partir de imágenes o texto, útil para catálogos online y presentaciones comerciales.
- **Entornos virtuales y videojuegos**: generar secuencias de vídeo para fondos, cinemáticas o contenido procedural.
- **Automatización de vídeos para marketing**: integrar el modelo en pipelines de generación de contenido publicitario a partir de descripciones de campañas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU recomendada: RTX 4090 (24 GB VRAM) o superior, según la documentación oficial.
- Puede ejecutarse en una única GPU de consumo; no se especifican requisitos mínimos de VRAM exactos, pero se indica que funciona en la 4090.
- Opciones de despliegue: mediante Diffusers (Python), ComfyUI, y el código de inferencia del repositorio GitHub oficial.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. No obstante, el modelo se posiciona como una alternativa de código abierto a modelos de vídeo de gran escala, con la ventaja de poder ejecutarse en hardware de consumo. Se menciona que supera a Wan2.1 en cantidad de datos de entrenamiento y en calidad, pero no se ofrecen métricas concretas.

## Limitaciones y advertencias

- La licencia Apache 2.0 permite uso comercial, pero se debe revisar el texto completo de la licencia para verificar condiciones adicionales.
- El modelo está entrenado principalmente en inglés y chino, por lo que la generación en otros idiomas puede ser menos precisa.
- Como cualquier modelo de generación de vídeo, existe riesgo de alucinaciones visuales (contenido no realista o incoherente) y de sesgos derivados de los datos de entrenamiento.
- La resolución y duración del vídeo generado pueden estar limitadas por la memoria de la GPU; aunque funciona en una 4090, la longitud máxima de frames no se especifica.
- No se garantiza la estabilidad de la generación en escenarios complejos o con movimientos muy rápidos.
- El modelo es específico para generación de vídeo; no es un modelo de lenguaje y no soporta tareas de razonamiento o agentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xavunit/Wan2.2-TI2V-5B (espejo del original)
- Repositorio oficial en HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Código en GitHub: https://github.com/Wan-Video/Wan2.2
- Informe técnico: https://arxiv.org/abs/2503.20314
- Página del proyecto: https://wan.video
- ModelScope: https://modelscope.cn/models/Wan-AI/Wan2.2-TI2V-5B
