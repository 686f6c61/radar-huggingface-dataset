# yuivs/Minimax-H3-nvfp4-INT4-INT8-Convrot

## Resumen

Este repositorio, publicado por el usuario `yuivs`, es una colección de pesos cuantizados y podados del modelo **MiniMax H3 (Hailuo 3.0)**, un sistema generativo omni-modal desarrollado por MiniMax que es capaz de generar vídeo con audio nativo estéreo a partir de texto, imágenes, vídeo y audio. La comunidad ha unificado en un solo repositorio diversas variantes de cuantización (INT4, INT8, NVFP4 y mixtas) para permitir la ejecución local en GPUs de consumo (16-24 GB de VRAM) mediante ComfyUI, eliminando la necesidad de infraestructura en la nube.

La relevancia actual de este modelo radica en que democratiza el acceso a un generador de vídeo de alta calidad (hasta 2K, 15 segundos, 24 FPS) con capacidades multimodales, algo que hasta hace poco estaba reservado a APIs propietarias. El repositorio incluye también los text encoders (Qwen3VL-32B cuantizado) y los VAEs necesarios para el pipeline completo, con una guía de selección según la GPU del usuario. Aunque el tag de idioma indica `th` (tailandés), la documentación del modelo base establece soporte estable para 11 idiomas, incluido el español.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de difusion multimodal, sin detalles publicos de la arquitectura interna) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT4, INT8, NVFP4, mixto INT4/INT8 |
| Idiomas soportados | Tailandes (segun tag), aunque el modelo base MiniMax H3 soporta 11 idiomas: arabe, chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso y espanol |
| Licencia | minimax-h3-community-license-agreement (licencia comunitaria especifica de MiniMax) |
| Formato de pesos | safetensors (archivos .safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del modelo cuantizado ni del modelo base MiniMax H3 en la documentacion proporcionada. Se sabe que es un sistema generativo omni-modal que unifica la comprension de contextos multimodales (texto, imagen, video y audio) y genera video con audio estereo nativo. El proceso de cuantizacion y poda aplicado por la comunidad no esta documentado en el repositorio; solo se indica que se han generado variantes INT4, INT8, NVFP4 y mixtas, con nombres que incluyen el sufijo `convrot` (posiblemente referido a una tecnica de rotacion de canales para reducir errores de cuantizacion, aunque no se confirma). No hay datos sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (text-to-video) sin imagen de entrada.
- Generacion de video a partir de una o dos imagenes (first-frame-to-video, last-frame-to-video, first-and-last-frame-to-video) mediante la variante FL2VA.
- Generacion de video con referencias omni-modales (hasta 9 imagenes, hasta 3 clips de video de 2-15 segundos cada uno, y entradas de audio) mediante la variante Ref2VA.
- Generacion de video con audio nativo estereo a 32 kHz.
- Resolucion de salida variable, con lado corto por defecto de 768 pixeles y posibilidad de 2K mediante regeneracion.
- Duracion de salida entre 4 y 15 segundos, a 24 FPS.
- Soporte de multiples relaciones de aspecto (21:9, 16:9, 4:3, 1:1, 3:4, 9:16, entre otras).
- Integracion con ComfyUI para ejecucion local.
- Cuantizaciones adaptadas a diferentes rangos de VRAM (INT4 para 16 GB, INT8 para 24 GB, NVFP4 para GPUs Blackwell).

## Casos de uso

- **Generacion de video promocional para redes sociales**: el modelo puede crear clips de 4-15 segundos con audio sincronizado a partir de una descripcion textual, ideal para campañas en Instagram, TikTok o YouTube Shorts. Su soporte de 11 idiomas permite adaptar el mensaje a audiencias internacionales.
- **Prototipado rapido de escenas para produccion audiovisual**: directores y guionistas pueden generar storyboards animados a partir de una imagen inicial y una descripcion, acelerando la previsualizacion de planos sin necesidad de rodar.
- **Edicion de video con referencias multiples**: la variante Ref2VA acepta hasta 9 imagenes y 3 clips de video como referencia, permitiendo generar nuevas secuencias que mantengan la coherencia visual de personajes, objetos o escenarios ya existentes.
- **Creacion de contenido educativo**: se pueden generar videos explicativos con narracion en espanol (u otros idiomas soportados) a partir de texto, combinando imagenes de apoyo y audio generado, reduciendo el coste de produccion de material didactico.
- **Generacion de video con audio para videojuegos**: los desarrolladores pueden producir cinemáticas cortas o fondos animados con efectos de sonido integrados, directamente desde el motor de desarrollo, gracias al formato de pesos compatible con ComfyUI.
- **Automatizacion de contenido para e-commerce**: a partir de una imagen de producto y una descripcion, el modelo genera videos cortos con movimiento y audio, listos para usar en fichas de producto o anuncios, sin necesidad de equipo de filmacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas con otros modelos de generacion de video, ni datos objetivos de calidad (FVD, CLIP score, etc.). Tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- **GPU de 16 GB VRAM** (recomendadas: RTX 4070 Ti Super, RTX 4080): usar el modelo de difusion INT4 o mixto INT4/INT8 (~11.3-15.5 GB) y el text encoder Qwen3VL-32B en INT4 (15.0 GB). Se requiere descargar tambien ambos VAEs (audio y video).
- **GPU de 24 GB VRAM** (recomendadas: RTX 3090, RTX 4090): usar el modelo INT8 (~21 GB) y el text encoder en INT8 (27.1 GB). Nota: el text encoder INT8 supera los 24 GB, por lo que podria requerir offloading o el uso de la version INT4.
- **GPUs Nvidia Blackwell** (RTX 5090, PRO 6000, etc.): exclusivamente para las variantes NVFP4 (12.5 GB pruned, 24.4 GB mixed) y el text encoder NVFP4 AWQ (15.7 GB). No usar en GPUs de generaciones anteriores.
- **VAEs obligatorios para todas las configuraciones**: `minimax_h3_audio_vae_fp32.safetensors` (605 MB) y `minimax_h3_video_vae_fp16.safetensors` (5.21 GB).
- **Opciones de despliegue**: ComfyUI es el entorno mencionado en la documentacion. No se indica soporte explicito para vLLM, llama.cpp u otros servidores de inferencia.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de datos objetivos para comparar este modelo cuantizado con alternativas como Sora, Runway Gen-3 o Pika. La falta de benchmarks publicados y de especificaciones tecnicas del modelo base impide establecer una comparacion cuantitativa. Se recomienda consultar la documentacion oficial de MiniMax H3 para obtener referencias de calidad frente a otros sistemas de generacion de video.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `minimax-h3-community-license-agreement` no es de codigo abierto estandar; es una licencia comunitaria especifica de MiniMax. Es imprescindible revisar sus terminos antes de cualquier uso comercial.
- **Sesgos y alucinaciones**: al ser un modelo generativo de video, puede producir inconsistencias visuales, distorsiones en rostros o textos, y alucinaciones de objetos o movimientos fisicamente imposibles. No se han documentado sesgos especificos, pero se asumen riesgos similares a otros modelos de difusion.
- **Idioma**: el tag del repositorio indica `th` (tailandes), aunque el modelo base soporta 11 idiomas. No se garantiza un rendimiento uniforme en todos ellos, y el espanol podria presentar menor calidad que el ingles.
- **Requisitos de hardware estrictos**: las variantes NVFP4 solo funcionan en GPUs Blackwell; las INT8 requieren 24 GB o mas de VRAM. Un uso incorrecto de la variante puede provocar errores de memoria o incompatibilidad.
- **Falta de documentacion tecnica**: no se especifica el proceso de cuantizacion ni se aportan metricas de calidad tras la poda. La degradacion respecto al modelo original es desconocida.
- **Tamaño del repositorio**: 158.9 GB en total, lo que implica una descarga considerable y requiere gestion cuidadosa del espacio en disco.
- **Estado experimental**: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una publicacion reciente sin validacion amplia por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yuivs/Minimax-H3-nvfp4-INT4-INT8-Convrot
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia (enlace dentro del repositorio): `LICENSE` (no se proporciona URL directa)
