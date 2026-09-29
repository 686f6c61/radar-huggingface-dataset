# tanzeme/Wan2.2-I2V-A14B-Diffusers

## Resumen

Wan2.2-I2V-A14B-Diffusers es la conversión al formato Diffusers del modelo de generación de vídeo a partir de imagen (image-to-video, I2V) Wan2.2-I2V-A14B, desarrollado originalmente por Wan-AI (equipo vinculado a Alibaba) y redistribuido en HuggingFace por el usuario tanzeme. Se trata de un modelo de difusión para vídeo con arquitectura Mixture-of-Experts (MoE), con 14.288.901.184 parámetros contabilizados en los safetensors del repositorio, capacidad de generar a 480P y 720P, y licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales declaradas.

El modelo resuelve la tarea de animar una imagen estática siguiendo una descripción textual, con un foco explícito en la estabilidad del movimiento: el autor indica que reduce movimientos de cámara irreales y mejora el soporte de escenas estilizadas respecto a la generación previa. Su relevancia actual radica en que forma parte de la familia Wan2.2, que introduce MoE en difusión de vídeo para aumentar la capacidad del modelo sin incrementar el coste computacional por paso, y en que cuenta con integración oficial en Diffusers y ComfyUI.

Es importante señalar que el repositorio analizado no es la publicación oficial de Wan-AI: es una réplica alojada por un tercero, sin descargas ni valoraciones en el momento de la consulta, con un tamaño de repositorio de 126,2 GB y con fechas de creación y actualización (2026-09-28) incoherentes con los anuncios de julio de 2025 del modelo original. Para producción se recomienda contrastar los pesos con el repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo con arquitectura Mixture-of-Experts (MoE); pipeline Diffusers `WanImageToVideoPipeline`. El backbone concreto (DiT u otro) no se detalla en la información disponible |
| Parametros totales | 14.288.901.184 (~14,29 B), según los safetensors del repositorio |
| Parametros activos | no disponible (la nomenclatura "A14B" del modelo original corresponde a *active 14B*, pero no se especifica la cifra exacta de parámetros activos por paso de denoising) |
| Longitud de contexto | no aplica / no disponible (el condicionamiento se realiza mediante imagen de referencia y prompt de texto; no se documenta una ventana de contexto en tokens) |
| Tipos de cuantizacion | no disponible; el repositorio solo distribuye pesos en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | en, zh (según los metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato Diffusers) |
| Tarea | image-to-video (I2V) |
| Resoluciones soportadas | 480P y 720P |
| Tamano del repositorio | 126,2 GB |
| Fecha de creacion / actualizacion | 2026-09-28 (según metadatos; incoherente con el lanzamiento oficial de julio de 2025) |

## Arquitectura y entrenamiento

Wan2.2 introduce por primera vez una arquitectura Mixture-of-Experts en modelos de difusión de vídeo. El principio consiste en separar el proceso de denoising a lo largo de los distintos timesteps y asignar modelos expertos especializados a cada tramo, de modo que la capacidad total del sistema crece mientras el coste computacional por inferencia se mantiene constante. La variante I2V-A14B incluida en este repositorio está diseñada específicamente para generación de vídeo a partir de imagen, con soporte de 480P y 720P, y el autor destaca una síntesis más estable con menos movimientos de cámara irreales y mejor soporte de escenas estilizadas.

En cuanto a los datos de entrenamiento, la model card indica que Wan2.2 se entrenó sobre un volumen significativamente mayor que Wan2.1, con un 65,6 % más de imágenes y un 83,2 % más de vídeos. También se menciona la incorporación de datos estéticos curados con etiquetado detallado de iluminación, composición, contraste y tono de color, lo que permite un control más preciso del estilo cinematográfico. No se especifica el número total de tokens, la composición exacta del dataset ni si se emplearon técnicas de alineación tipo RLHF o DPO (poco habituales en modelos de difusión y no documentadas aquí). La innovación del VAE con ratio de compresión 16×16×4 se atribuye explícitamente al modelo TI2V-5B, no a esta variante A14B.

## Capacidades

- Generación de vídeo a partir de una imagen de referencia y un prompt textual (image-to-video).
- Salida en dos resoluciones: 480P y 720P.
- Generación de movimiento complejo, con mejoras declaradas en semántica, movimiento y estética respecto a Wan2.1.
- Control de estilo cinematográfico mediante etiquetado de iluminación, composición, contraste y tono de color.
- Mayor estabilidad de cámara: el autor indica una reducción de movimientos de cámara irreales.
- Soporte declarado de escenas estilizadas diversas.
- Prompts en inglés y chino según los metadatos del repositorio.
- Inferencia multi-GPU mediante el código oficial del repositorio Wan-Video/Wan2.2.
- Integración con Diffusers y con ComfyUI.
- No se documentan capacidades de tool calling, function calling, uso como agente, razonamiento multi-paso, audio, visión para comprensión de imagen (más allá del condicionamiento) ni generación de texto.

## Casos de uso

- Animación de imágenes de producto en comercio electrónico: a partir de una fotografía fija de un artículo se puede generar un vídeo breve a 720P que muestre rotación o movimiento sutil, útil para fichas de producto y anuncios, sin necesidad de rodaje.
- Previsualización de storyboards en producción audiovisual: el equipo de guion puede convertir viñetas o concept arts en clips animados a 480P para validar ritmo, encuadre y movimiento antes de rodar, reduciendo el coste de las pruebas piloto.
- Generación de creatividades publicitarias con estilo cinematográfico: el etiquetado estético de iluminación y tono permite producir variaciones con una dirección de arte consistente a partir de una única imagen base.
- Contenido para redes sociales a partir de archivo fotográfico: animar fotos existentes para reels o publicaciones cortas, aprovechando el condicionamiento por imagen que evita tener que describir la escena completa por texto.
- Restauración y dinamización de material de archivo: convertir fotografías históricas o escaneos en clips con movimiento controlado, útil en documentales y piezas de divulgación.
- Prototipado rápido en pipelines de postproducción: al estar integrado en ComfyUI y Diffusers, puede insertarse como nodo en flujos de trabajo existentes para generar planos de relleno o *previz* bajo demanda.
- Investigación en generación de vídeo: sirve como referencia abierta con licencia Apache 2.0 para experimentos de comparación de arquitecturas MoE frente a modelos densos en difusión de vídeo.
- Demostraciones interactivas y herramientas creativas: al ser invocable mediante `WanImageToVideoPipeline`, puede exponerse detrás de una interfaz web para que usuarios no técnicos generen animaciones a partir de sus propias fotos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una afirmación cualitativa del autor ("TOP performance among all open-sourced and closed-sourced models") sin cifras, métricas ni protocolo de evaluación asociado, por lo que no se puede verificar ni comparar numéricamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para la variante A14B en la información proporcionada. El repositorio no publica cifras de memoria para 480P ni 720P.
- GPU recomendadas: no disponibles para este modelo. El código oficial incluye inferencia multi-GPU para los modelos A14B y 14B, lo que sugiere que la configuración de referencia no es una GPU única de gama alta de consumo.
- Compatibilidad con GPU de consumo: no confirmada para la variante A14B. La model card indica explícitamente que es la variante TI2V-5B la que puede ejecutarse en tarjetas de consumo como la RTX 4090.
- Almacenamiento: el repositorio ocupa 126,2 GB, por lo que se necesita al menos ese espacio libre en disco, más el espacio adicional para caché de Diffusers.
- Opciones de despliegue: Diffusers (`WanImageToVideoPipeline`), ComfyUI, y el repositorio oficial `Wan-Video/Wan2.2` con scripts de inferencia multi-GPU. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a un modelo de difusión de vídeo en este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Resoluciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B-Diffusers (este repositorio) | Image-to-video | 14,29 B (safetensors) | 480P, 720P | apache-2.0 | HuggingFace (réplica de tercero, 0 descargas) |
| Wan2.2-I2V-A14B (Wan-AI) | Image-to-video | no disponible en la información | 480P, 720P | apache-2.0 | HuggingFace y ModelScope (repositorio oficial) |
| Wan2.2-T2V-A14B | Text-to-video | no disponible en la información | 480P, 720P | apache-2.0 | HuggingFace y ModelScope (repositorio oficial) |
| Wan2.2-TI2V-5B | Text-to-video e image-to-video | no disponible en la información | 720P a 24 fps | apache-2.0 | HuggingFace y ModelScope; ejecutable en RTX 4090 según el autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia funcional principal es la tarea objetivo (I2V frente a T2V frente a TI2V) y el tamaño: la variante TI2V-5B es la única con compatibilidad declarada con GPU de consumo.

## Limitaciones y advertencias

- El repositorio no es la publicación oficial: pertenece al usuario tanzeme y no a Wan-AI, con 0 descargas y 0 valoraciones, por lo que no existe validación comunitaria de que los pesos coincidan exactamente con los originales. Se recomienda verificar los hashes frente al repositorio oficial.
- Las fechas de creación y actualización indican 2026-09-28, incoherentes con el anuncio oficial del modelo (julio de 2025). Es una señal de posible problema de metadatos o de reempaquetado no verificado.
- No se han publicado benchmarks cuantitativos en la información disponible, por lo que las afirmaciones de rendimiento son cualitativas y no verificables.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede introducir objetos, texturas o movimientos ausentes en la imagen de entrada, especialmente en escenas con oclusiones o detalles finos.
- El autor reconoce la existencia de movimientos de cámara irreales, y afirma haberlos reducido respecto a versiones anteriores, pero no los elimina.
- Idiomas: los metadatos solo declaran inglés y chino. El comportamiento con prompts en castellano no está documentado y no puede darse por bueno sin evaluación propia.
- Sesgos: no documentados en la información disponible. Al haberse entrenado con datos estéticos curados, puede existir un sesgo hacia un estilo cinematográfico concreto en detrimento de otras estéticas.
- Licencia Apache 2.0: permite uso comercial y modificación sin restricciones adicionales declaradas, pero no se especifican términos adicionales del autor original ni condiciones de atribución más allá de las propias de la licencia.
- Falta de datos clave para planificación de producción: no se publican cifras de VRAM, parámetros activos por paso ni latencia, lo que dificulta dimensionar la infraestructura.
- El requisito de disco es elevado (126,2 GB), lo que puede ser un obstáculo en entornos con almacenamiento limitado.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso, y no debe evaluarse con los criterios habituales de un LLM.

## Enlaces

- Repositorio analizado: https://huggingface.co/tanzeme/Wan2.2-I2V-A14B-Diffusers
- Modelo oficial Wan2.2-I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Versión Diffusers oficial I2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- Modelo oficial Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Versión Diffusers T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- Modelo oficial Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Versión Diffusers TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Organización Wan-AI en HuggingFace: https://huggingface.co/Wan-AI/
- Repositorio de código: https://github.com/Wan-Video/Wan2.2
- Informe técnico (arXiv:2503.20314): https://arxiv.org/abs/2503.20314
- Sitio del proyecto: https://wan.video
- Blog del proyecto: https://wan.video/welcome
- ModelScope: https://modelscope.cn/organization/Wan-AI
- Documentación de ComfyUI (EN): https://docs.comfy.org/tutorials/video/wan/wan2_2
- Documentación de ComfyUI (CN): https://docs.comfy.org/zh-CN/tutorials/video/wan/wan2_2
- Discord de la comunidad: https://discord.gg/AKNgpMK4Yj
