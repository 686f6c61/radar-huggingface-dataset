# Wan-AI/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de generacion de video de la familia Wan2.2, desarrollado por el equipo Wan-AI (Alibaba). Se trata de un modelo hibrido que soporta tanto text-to-video como image-to-video, es decir, puede generar secuencias de video de alta resolucion (720P a 24 fps) a partir de una descripcion textual, de una imagen inicial, o de la combinacion de ambos. Es una actualizacion significativa respecto a Wan2.1, con un enfoque en estetica cinematografica, generacion de movimiento complejo y eficiencia computacional.

El modelo se basa en una arquitectura de difusion con Mixture-of-Experts (MoE) y utiliza un VAE avanzado con una alta tasa de compresion de 16×16×4, lo que permite reducir el coste computacional sin sacrificar calidad. Con 5.000 millones de parametros, esta disenado para ejecutarse en una unica GPU de consumo, como la RTX 4090, lo que lo convierte en una opcion accesible tanto para la industria como para la investigacion academica. Se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y modificacion libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion con Mixture-of-Experts (MoE) |
| Parametros totales | 5.000 millones (5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Wan2.2 introduce una arquitectura MoE en el proceso de denoising de la difusion. En lugar de un unico modelo que procesa todos los pasos de denoising, se utilizan multiples expertos especializados que se activan en funcion del paso temporal. Esto amplia la capacidad efectiva del modelo manteniendo el mismo coste computacional por inferencia. El modelo incorpora un VAE propio (Wan2.2-VAE) con una compresion espacial y temporal de 16×16×4, significativamente mayor que la de modelos anteriores, lo que reduce la carga de calculo en la generacion de video de alta resolucion.

El entrenamiento se realizo con un dataset significativamente mayor que el de Wan2.1, con un aumento del 65,6% en imagenes y del 83,2% en videos. Ademas, se incluyeron datos esteticos cuidadosamente curados con etiquetas detalladas sobre iluminacion, composicion, contraste y tono de color, lo que permite un control mas preciso del estilo cinematografico. El informe tecnico esta disponible en arXiv (2503.20314), aunque no se especifican los detalles completos del proceso de entrenamiento, como el numero exacto de tokens o el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) a 720P y 24 fps.
- Generacion de video a partir de imagen (image-to-video) a 720P y 24 fps.
- Generacion hibrida texto-imagen a video (text-image-to-video), combinando ambas modalidades.
- Generacion de video con estetica cinematografica controlable mediante etiquetas de iluminacion, composicion, contraste y tono de color.
- Generacion de movimiento complejo y variado gracias al entrenamiento con un dataset ampliado.
- Soporte multilingue para ingles y chino.
- Ejecucion en una unica GPU de consumo (por ejemplo, RTX 4090).

## Casos de uso

- Produccion cinematografica independiente: los cineastas pueden generar tomas de 720P a 24 fps directamente desde un guion o un storyboard, manteniendo un estilo visual coherente gracias a las etiquetas esteticas. El modelo permite iterar rapidamente sobre diferentes enfoques de iluminacion y composicion sin necesidad de un equipo de produccion completo.
- Creacion de contenido para redes sociales: creadores de contenido pueden generar clips de video de alta calidad para plataformas como YouTube, TikTok o Instagram. Al ejecutarse en una GPU de consumo, no requiere infraestructura en la nube, lo que reduce costes y acelera el flujo de trabajo.
- Prototipado de anuncios publicitarios: las agencias pueden generar videos conceptuales a partir de briefs creativos, combinando imagenes de producto con descripciones textuales. El modelo permite explorar multiples direcciones creativas en horas en lugar de semanas.
- Generacion de material educativo: instituciones y creadores de cursos pueden producir animaciones y videos explicativos a partir de texto e imagenes, sin necesidad de software de animacion complejo. La generacion a 24 fps produce un movimiento natural adecuado para contenido didactico.
- Desarrollo de videojuegos: los estudios pueden generar cinemáticas o videos de fondo para menus, trailers o secuencias de transicion. La capacidad de partir de una imagen permite mantener la coherencia visual con el arte del juego.
- Investigacion academica en generacion de video: el modelo sirve como base para experimentos en generacion condicionada, control estetico o arquitecturas MoE aplicadas a difusion. Su licencia Apache 2.0 permite modificarlo y redistribuirlo sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 5.000 millones de parametros, por lo que en precision BF16 ocupa aproximadamente 10 GB. Con cuantizacion de 8 bits, podria reducirse a unos 5-6 GB, aunque no se proporcionan datos oficiales de cuantizacion.
- GPU recomendadas: el fabricante indica que puede ejecutarse en una RTX 4090 (24 GB VRAM). Tambien deberia ser compatible con otras GPUs de consumo con 16 GB o mas de VRAM, como la RTX 4080 o la RTX 4070 Ti.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado especificamente para ejecutarse en una unica GPU de consumo.
- Opciones de despliegue: se proporciona codigo de inferencia en el repositorio oficial de GitHub (Wan2.2), con soporte para multi-GPU en los modelos mas grandes (A14B y 14B). Existe integracion con ComfyUI y Diffusers. El repositorio de GitHub incluye scripts de inferencia listos para usar.
- Latencia y throughput: no se proporcionan datos oficiales de latencia. La velocidad depende de la GPU, el numero de pasos de denoising y la resolucion de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | FPS | Licencia | GPU de consumo |
|---|---|---|---|---|---|
| Wan2.2-TI2V-5B | 5B | 720P | 24 | Apache 2.0 | Si (RTX 4090) |
| Wan2.2-T2V-A14B | 14B | 480P y 720P | no disponible | Apache 2.0 | No (requiere multi-GPU) |
| Wan2.2-I2V-A14B | 14B | 480P y 720P | no disponible | Apache 2.0 | No (requiere multi-GPU) |

La comparativa se limita a la propia familia Wan2.2, ya que no se dispone de datos de modelos de otros fabricantes en la informacion proporcionada. El TI2V-5B es el unico modelo de la familia que soporta tanto text-to-video como image-to-video con un tamano que permite ejecucion en una unica GPU de consumo.

## Limitaciones y advertencias

- El modelo solo soporta ingles y chino. Las descripciones en otros idiomas pueden producir resultados suboptimos.
- No se proporcionan datos sobre sesgos del modelo ni sobre su comportamiento con contenido sensible.
- La generacion de video a 720P y 24 fps puede requerir tiempos de inferencia considerables en GPUs de gama media, aunque el fabricante indica que es uno de los modelos mas rapidos en esta resolucion.
- No se especifican los detalles del proceso de entrenamiento (numero de tokens, composicion del dataset, uso de tecnicas de alineacion), lo que dificulta evaluar posibles sesgos o limitaciones.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable revisar los terminos de la licencia del VAE y de los componentes incluidos en el repositorio.
- No se proporcionan datos de benchmarks, por lo que no es posible comparar objetivamente su rendimiento con otros modelos de generacion de video.
- El modelo requiere al menos 10 GB de VRAM en precision BF16, lo que excluye a GPUs con menos de 12 GB de memoria.

## Enlaces

- HuggingFace: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- ModelScope: https://www.modelscope.cn/models/Wan-AI/Wan2.2-TI2V-5B
- Repositorio GitHub: https://github.com/Wan-Video/Wan2.2
- Informe tecnico (arXiv): https://arxiv.org/abs/2503.20314
- Blog oficial: https://wan.video/welcome
- Version Diffusers: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Version BF16 en ModelScope: https://www.modelscope.cn/models/Wan-AI/Wan2.2-TI2V-5B-BF16
- Version Turbo (4 pasos): https://github.com/quanhaol/Wan2.2-TI2V-5B-Turbo
