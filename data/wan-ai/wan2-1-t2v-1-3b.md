# Wan-AI/Wan2.1-T2V-1.3B

## Resumen

Wan2.1-T2V-1.3B es un modelo de generación de vídeo a partir de texto desarrollado por Wan-AI, la división de inteligencia artificial de Alibaba. Forma parte de la suite Wan2.1, un conjunto de modelos fundacionales de vídeo que incluye variantes de 14B para texto-a-vídeo e imagen-a-vídeo, así como herramientas de edición y generación de audio. Este modelo en particular, con 1.418.996.800 parámetros (aproximadamente 1.3B), está diseñado para ejecutarse en GPUs de consumo, requiriendo solo 8.19 GB de VRAM, lo que lo hace accesible para creadores individuales y equipos académicos con recursos limitados.

El modelo destaca por su capacidad para generar vídeos de 5 segundos a resolución 480P en una RTX 4090 en unos 4 minutos sin técnicas de optimización, y es el primer modelo de vídeo capaz de generar texto visual tanto en chino como en inglés. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su integración con la librería diffusers facilita su adopción en pipelines existentes. La arquitectura exacta no está especificada en la documentación pública, pero se trata de un modelo de difusión con un VAE propio (Wan-VAE) que codifica y decodifica vídeo 1080P preservando información temporal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo (arquitectura interna no especificada) |
| Parametros totales | 1.418.996.800 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La documentación pública no detalla la arquitectura interna del modelo más allá de indicar que es un modelo de difusión para generación de vídeo. Se sabe que incorpora un VAE propio, denominado Wan-VAE, que codifica y decodifica vídeo 1080P de cualquier longitud preservando la coherencia temporal, lo que sirve como base tanto para generación de vídeo como de imagen. El modelo se evalúa con el framework Wan-Bench, desarrollado por los propios autores, que compara el rendimiento frente a otros modelos open-source y soluciones comerciales.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de alineación como RLHF o DPO. El modelo se distribuye con pesos en formato safetensors y está diseñado para funcionar con la librería diffusers, aunque la integración oficial con diffusers aparece como pendiente en la lista de tareas del repositorio. El código de inferencia está disponible en el repositorio oficial de GitHub, con soporte para ejecución multi-GPU.

## Capacidades

- Generación de vídeo a partir de prompts de texto en inglés y chino, con resoluciones de 480P y 720P (aunque 720P es menos estable por limitaciones de entrenamiento).
- Generación de texto visual incrustado en el vídeo, tanto en caracteres chinos como latinos, una capacidad pionera en modelos de vídeo.
- Compatibilidad con GPUs de consumo: requiere 8.19 GB de VRAM, lo que permite ejecución en tarjetas como RTX 3060, RTX 4060 o superiores.
- Generación de vídeos de 5 segundos de duración a 480P en aproximadamente 4 minutos en una RTX 4090 sin técnicas de optimización.
- Integración con el ecosistema diffusers, lo que facilita su uso en pipelines de generación de vídeo existentes.
- Forma parte de una suite más amplia (Wan2.1) que incluye modelos de imagen-a-vídeo, edición de vídeo, texto-a-imagen y vídeo-a-audio, aunque este checkpoint concreto solo cubre texto-a-vídeo.

## Casos de uso

- Creación de contenido para redes sociales: el modelo permite generar clips cortos de 5 segundos a 480P con prompts en inglés o chino, adecuados para plataformas como TikTok, Instagram Reels o YouTube Shorts, sin necesidad de hardware profesional.
- Prototipado rápido de vídeos para marketing: los equipos creativos pueden generar borradores de anuncios o demostraciones de producto en minutos, iterando sobre el prompt hasta obtener el resultado deseado antes de producir la versión final con herramientas más pesadas.
- Generación de material educativo: profesores y divulgadores pueden crear vídeos explicativos breves con texto incrustado en chino o inglés, aprovechando la capacidad del modelo para renderizar texto legible dentro del vídeo.
- Asistencia a creadores de vídeo: el modelo sirve como herramienta de previsualización para guionistas y directores, permitiendo visualizar escenas descritas textualmente antes de rodar o animar.
- Investigación académica en generación de vídeo: al ser de código abierto con licencia Apache 2.0 y requerir solo 8.19 GB de VRAM, es un punto de partida accesible para laboratorios con recursos limitados que estudian modelos de difusión aplicados a vídeo.
- Generación de vídeos con texto dinámico: la capacidad de generar texto visual en chino e inglés abre casos de uso como subtítulos automáticos, rótulos o carteles dentro del propio vídeo, útil para doblaje o localización de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona que el modelo se evalúa con el framework Wan-Bench y que supera las métricas globales de modelos open-source más grandes, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estándar, ya que se trata de un modelo de generación de vídeo y no de razonamiento o lenguaje.

## Requisitos de hardware

- VRAM estimada: 8.19 GB para inferencia, según la documentación oficial.
- GPU recomendada: RTX 4090 para generar un vídeo de 5 segundos a 480P en unos 4 minutos sin optimizaciones. Cualquier GPU con al menos 8 GB de VRAM debería ser suficiente, incluyendo RTX 3060, RTX 4060, RTX 4070 o equivalentes de AMD.
- Compatibilidad con GPUs de consumo: sí, es el objetivo principal del modelo. No requiere hardware de datacenter.
- Opciones de despliegue: código de inferencia oficial en el repositorio de GitHub (Wan-Video/Wan2.1), con soporte para multi-GPU. La integración con diffusers está pendiente según la lista de tareas, aunque el modelo se publica con la etiqueta diffusers. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que estos están orientados a modelos de lenguaje, no a generación de vídeo.
- Latencia y throughput: aproximadamente 4 minutos para un vídeo de 5 segundos a 480P en una RTX 4090, sin técnicas de cuantización ni optimización.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de generación de vídeo en la información proporcionada. La documentación menciona que Wan2.1 supera a modelos open-source existentes y a soluciones comerciales en benchmarks propios (Wan-Bench), pero no se detallan los modelos comparados ni las métricas concretas. Por tanto, no es posible ofrecer una comparativa objetiva con alternativas como CogVideoX, Open-Sora o Mochi 1.

## Limitaciones y advertencias

- La generación a 720P es menos estable que a 480P debido a un entrenamiento limitado a esa resolución; se recomienda usar 480P para resultados óptimos.
- El modelo solo soporta prompts en inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- No se han publicado detalles sobre sesgos del modelo, pero al ser un modelo de generación de vídeo entrenado con datos de internet, puede reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación visual: como cualquier modelo generativo, puede producir vídeos con inconsistencias físicas, objetos deformados o texto ilegible, especialmente en escenas complejas.
- El tamaño del repositorio es de 46.5 GB, lo que requiere un ancho de banda considerable para la descarga y espacio en disco.
- La integración con diffusers y ComfyUI está pendiente según la lista de tareas del repositorio, por lo que el uso actual requiere el código de inferencia oficial de GitHub.
- No se proporcionan garantías de rendimiento en GPUs con menos de 8 GB de VRAM, aunque el requisito declarado es de 8.19 GB.

## Enlaces

- HuggingFace: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- GitHub: https://github.com/Wan-Video/Wan2.1
- ModelScope: https://modelscope.ai/models/Wan-AI/Wan2.1-T2V-1.3B
- Blog oficial: https://wanxai.com
- Discord: https://discord.gg/p5XbdQV7
