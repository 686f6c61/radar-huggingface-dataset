# TheBaldDudeCo/CineForge-Wan-Models

## Resumen

CineForge Wan Models es un repositorio de Hugging Face que actúa como canal de distribución para CineForge, una aplicación local de Windows orientada a la generación de vídeo con el modelo Wan 2.2. El repositorio publica los cuatro componentes principales de Wan 2.2 I2V A14B en formato FP8 escalado: el experto de alto ruido, el experto de bajo ruido, el codificador de texto UMT5 y el VAE, junto con manifiestos, checksums y registros de conversión. El proyecto es independiente y no está afiliado a Alibaba, Wan Team, Hugging Face ni Comfy Org.

La relevancia actual radica en que permite ejecutar Wan 2.2 de forma local en Windows, sin depender de servicios en la nube, con pesos verificados mediante SHA-256. Sin embargo, el estado es experimental: los pesos están publicados y verificados, pero ningún pack está marcado como "soportado" porque aún no se ha confirmado la compatibilidad con el cargador nativo ni una generación completa de extremo a extremo. El tamaño del repositorio es de 35,6 GB, lo que da una idea de la magnitud de los pesos en FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan 2.2 I2V A14B (modelo de difusion de video imagen-a-video) |
| Parametros totales | No disponible (el nombre A14B sugiere 14 mil millones, no confirmado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 escalado (scaled-FP8) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Wan 2.2 I2V A14B, un sistema de difusion de video que opera en dos etapas diferenciadas mediante dos expertos: uno de alto ruido y otro de bajo ruido. Esta separacion permite manejar de forma mas eficiente los distintos niveles de degradacion durante el proceso de generacion. El conjunto se completa con un codificador de texto UMT5, que interpreta las instrucciones textuales, y un VAE para la compresion y decodificacion de los fotogramas. Los pesos se distribuyen en FP8 escalado, una cuantizacion que reduce el uso de memoria manteniendo una precision aceptable.

No se dispone de informacion detallada sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF o DPO). El repositorio se limita a redistribuir los pesos de Wan 2.2, publicados originalmente por Wan Team bajo licencia Apache 2.0, con las correspondientes notas de licencia y registros de conversion reproducibles.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video), con dos expertos para gestionar diferentes niveles de ruido.
- Ejecucion local en Windows mediante la aplicacion CineForge, sin necesidad de infraestructura en la nube.
- Cuantizacion FP8 escalado para reducir el uso de memoria y acelerar la inferencia en hardware compatible.
- Incluye codificador de texto UMT5 para interpretar instrucciones textuales que guian la generacion.
- Incluye VAE para la compresion y reconstruccion de los fotogramas generados.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue explicito.

## Casos de uso

- Produccion de video independiente: un creador puede generar secuencias cinematograficas a partir de imagenes fijas usando CineForge en su propio equipo, sin depender de servicios externos.
- Animacion de imagenes estaticas: convertir fotografias o ilustraciones en clips animados con movimiento controlado, util para presentaciones o contenido artistico.
- Prototipado de escenas para cine: directores o storyboarders pueden previsualizar una escena generando un video corto desde una imagen de referencia antes de la produccion real.
- Creacion de contenido para redes sociales: generar clips breves a partir de imagenes para publicaciones en plataformas como Instagram o TikTok, con control local del proceso.
- Investigacion en generacion de video: el repositorio ofrece pesos verificados y documentacion de conversion, lo que facilita experimentos academicos sobre el modelo Wan 2.2.
- Desarrollo de herramientas de video generativo: desarrolladores pueden integrar estos pesos en sus propias aplicaciones o pipelines, aprovechando la licencia Apache 2.0 y el formato FP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de rendimiento, comparaciones con otros modelos ni datos de latencia o throughput.

## Requisitos de hardware

- No se especifican requisitos minimos de VRAM en la informacion proporcionada.
- El tamano del repositorio es de 35,6 GB, lo que sugiere que los pesos en FP8 ocupan aproximadamente esa cantidad en disco. Para inferencia, se estima que se necesitaria una GPU con al menos 24 GB de VRAM para cargar el modelo completo, aunque no es un dato confirmado.
- No se mencionan GPUs concretas recomendadas. Dado el tamano y la cuantizacion FP8, una GPU de gama alta como una RTX 4090 (24 GB) o una A100 (40 GB o 80 GB) seria adecuada, pero es una suposicion basada en el tamano del modelo.
- La aplicacion CineForge esta pensada para Windows, por lo que el despliegue se realiza en ese sistema operativo. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que el modelo no es de texto sino de video.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se incluyen comparaciones con otros modelos de generacion de video en la informacion proporcionada. Se podria comparar con otros modelos de difusion de video como Stable Video Diffusion o modelos de la familia Wan, pero no hay datos suficientes para una comparativa rigurosa.

## Limitaciones y advertencias

- Estado experimental: los pesos estan publicados y verificados, pero el pack no esta marcado como "soportado". Aun no se ha confirmado la compatibilidad con el cargador nativo ni una generacion completa de extremo a extremo en CineForge.
- Riesgo de incompatibilidad: al ser una redistribucion de pesos de Wan 2.2, podrian existir diferencias con los cargadores oficiales o con versiones futuras de CineForge.
- Proyecto independiente: no esta afiliado ni respaldado por Alibaba, Wan Team, Hugging Face ni Comfy Org, por lo que el soporte y el mantenimiento dependen exclusivamente del autor.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero cualquier redistribucion debe conservar las notas de licencia y los avisos aplicables.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma, ya que el modelo esta orientado a generacion de video y no se han documentado estos aspectos.
- Los LoRAs de aceleracion de terceros estan excluidos del pack principal hasta que se documente su origen y licencia, lo que limita las opciones de personalizacion.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/TheBaldDudeCo/CineForge-Wan-Models
- Proyecto Wan 2.2 (GitHub): https://github.com/Wan-Video/Wan2.2
- Modelos oficiales de Wan (Hugging Face): https://huggingface.co/Wan-AI
- Fuentes candidatas de FP8 (Comfy-Org): https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged y https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged
- Aplicacion CineForge (GitHub): https://github.com/thebalddudeco/CineForge
