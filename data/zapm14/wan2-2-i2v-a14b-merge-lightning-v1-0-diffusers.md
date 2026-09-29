# Zapm14/Wan2.2-I2V-A14B-Merge-Lightning-V1.0-Diffusers

## Resumen

Wan2.2-I2V-A14B-Merge-Lightning-V1.0-Diffusers es un modelo de generacion de video a partir de imagen (image-to-video) publicado por el usuario Zapm14 en HuggingFace. No se trata de un entrenamiento desde cero, sino de un merge: fusiona los pesos del modelo Wan-AI/Wan2.2-I2V-A14B-Diffusers con el LoRA de destilacion Wan2.2-Lightning v1 (variante Wan2.2-I2V-A14B-4steps-lora-rank64-Seko-V1) de lightx2v. El objetivo es obtener en un unico checkpoint un generador de video que funcione en 4 pasos de denoising con guidance scale 1.0, sin necesidad de cargar el LoRA por separado.

El modelo conserva la arquitectura de difusion de Wan 2.2 para image-to-video y los pesos safetensors suman 14.288.901.184 parametros (unos 14,3 mil millones), con un repositorio de 126,2 GB. Se distribuye en formato diffusers y se ejecuta mediante la clase WanImageToVideoPipeline; tambien se documenta su uso con el runner FastDM. La relevancia practica esta en la reduccion del coste de inferencia: pasar de las decenas de pasos habituales en modelos de video a 4 pasos abarata mucho la generacion, a cambio de la perdida de calidad asociada a la destilacion agresiva.

El modelo se publica bajo licencia MIT, con 0 descargas y 0 likes en el momento de la consulta, sin model card detallada mas alla de los ejemplos de ejecucion y sin resultados de evaluacion. La busqueda web realizada no devolvio ninguna fuente tecnica relacionada con el modelo, por lo que toda la informacion de esta ficha procede de los metadatos de HuggingFace y de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de video condicionada por imagen; merge de Wan2.2-I2V-A14B con el LoRA Wan2.2-Lightning v1 |
| Parametros totales | 14.288.901.184 (~14,3 mil millones), segun los pesos safetensors del repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (no es un modelo de lenguaje). Ventana temporal del ejemplo oficial: 81 fotogramas a 16 fps (~5 s de video) |
| Tipos de cuantizacion | bfloat16 y fp16 en diffusers; fp8 documentado en FastDM (`--use-fp8`); no hay versiones GGUF publicadas |
| Idiomas soportados | no disponible (el prompt es texto libre; el negative prompt del ejemplo esta redactado en chino) |
| Licencia | MIT (segun la model card del autor) |
| Formato de pesos | safetensors, layout diffusers (`WanImageToVideoPipeline`) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento nuevo. Parte del checkpoint Wan-AI/Wan2.2-I2V-A14B-Diffusers, un transformer de difusion de la familia Wan 2.2 especializado en image-to-video, y le incorpora el LoRA Wan2.2-Lightning v1 (4 steps, rank 64, Seko V1) de lightx2v. Ese LoRA procede de un proceso de destilacion orientado a reducir el numero de pasos de muestreo, de modo que el modelo resultante puede generar video con 4 pasos de denoising y guidance scale 1.0, es decir, sin classifier-free guidance. El autor indica que el resultado se puede ejecutar directamente con el pipeline de diffusers y con el runner FastDM.

Los metadatos no incluyen informacion sobre el dataset de entrenamiento original de Wan 2.2 (numero de tokens de video, composicion, filtrado, uso de RLHF o DPO), ni sobre el procedimiento exacto de destilacion del LoRA, ni sobre la receta de fusion (ratios de mezcla, si hubo o no normalizacion de pesos). Tampoco hay informacion sobre si el merge se hizo por suma directa, por Task Arithmetic u otra tecnica. El unico dato tecnico verificable aportado por el autor es la configuracion de inferencia recomendada: 480x832 de resolucion, 81 fotogramas, 16 fps, 4 pasos y guidance scale 1.0.

## Capacidades

- Generacion de video a partir de una imagen de entrada (image-to-video), condicionada por un prompt de texto descriptivo.
- Inferencia en 4 pasos de denoising con guidance scale 1.0, lo que reduce el coste computacional frente al modelo base sin destilar.
- Soporte de negative prompt para excluir artefactos, estilos o elementos no deseados.
- Control de resolucion y relacion de aspecto: el ejemplo oficial calcula altura y anchura redondeando a multiplos del factor de escala del VAE por el patch size del transformer (480x832 en el ejemplo).
- Control de duracion: el parametro `num_frames` permite fijar la longitud del clip (81 fotogramas, unos 5 segundos a 16 fps) y la tasa de fotogramas de exportacion.
- Control de aleatoriedad mediante semilla (`torch.Generator`), lo que permite reproducibilidad de una misma generacion.
- Ejecucion en fp8 a traves de FastDM para reducir el uso de memoria.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No procesa audio ni genera banda sonora sincronizada.
- No dispone de modo "thinking", vision-language understanding ni entrada de multiples imagenes documentada.

## Casos de uso

- Previsualizacion rapida de storyboards: a partir de un frame fijo generado o dibujado, el modelo produce un clip de ~5 segundos en 4 pasos, lo que permite iterar sobre el lenguaje visual de una escena antes de comprometer presupuesto de produccion.
- Contenido para redes sociales y marketing: animar una fotografia de producto o de un local para generar un clip vertical u horizontal con un prompt descriptivo, sin necesidad de rodaje adicional.
- Prototipado de VFX y animatics: generar planos de referencia con movimiento de camara descrito en el prompt para discutir con el equipo de composicion antes del render final.
- Enriquecimiento de catalogos de e-commerce: convertir fotografias estaticas de producto en clips cortos en bucle para fichas de producto, usando el negative prompt para evitar artefactos de textura o sobreexposicion.
- Aumento de datos sinteticos para vision por computador: generar secuencias de video controladas con `num_frames` y semilla fija para aumentar datasets de deteccion o segmentacion temporal en condiciones dificiles de grabar.
- Demos interactivas y aplicaciones web: la inferencia en 4 pasos hace viable exponer el modelo en un backend con cola de trabajos y devolver un clip en un tiempo de espera aceptable para un usuario final.
- Exploracion artistica y prototipado de estilo: el autor documenta el uso con FastDM y fp8, lo que permite ejecutar pruebas de estilo a bajo coste en una sola GPU antes de escalar a produccion.
- Animacion de fotografias personales o de archivo: restaurar movimiento plausible sobre imagenes fijas para piezas conmemorativas o material divulgativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna tabla de evaluacion (FVD, CLIP score, VBench ni similares), ni comparaciones numericas con el modelo base o con el LoRA de destilacion. Tampoco se han encontrado resultados en la busqueda web realizada, que no devolvio ninguna fuente relacionada con el modelo.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del recuento de parametros y de los formatos documentados, no mediciones publicadas por el autor.

- Peso del transformer en bfloat16: aproximadamente 28,6 GB (14,29 mil millones de parametros a 2 bytes). A esto hay que sumar el VAE y el codificador de texto del pipeline, que elevan el requisito total del pipeline completo por encima de los 40 GB en bfloat16.
- En fp8: el transformer baja a unos 14,3 GB, y el pipeline completo queda en el entorno de 25-30 GB, segun el tamano del codificador de texto y si se aplica offload secuencial a CPU.
- GPU recomendadas para bfloat16 sin offload: A100 80 GB, H100 80 GB o similares. Con 48 GB (A6000, L40S) puede ser necesario offload parcial del codificador de texto.
- GPU de consumo: una RTX 4090 o RTX 5090 (24 y 32 GB) no permite el pipeline completo en bfloat16 sin offload; con fp8 y offload secuencial es la unica via viable, a costa de latencia. En GPUs de 16 GB o menos no se recomienda.
- El repositorio ocupa 126,2 GB, por lo que hay que prever espacio en disco suficiente para la descarga completa, ademas de la cache de HuggingFace.
- Opciones de despliegue documentadas: diffusers (`WanImageToVideoPipeline`) y FastDM (repositorio de KE-AI-ENG, con soporte de `--use-fp8`). No hay instrucciones para vLLM, TGI, Ollama, llama.cpp ni ComfyUI en la informacion proporcionada.
- Latencia y throughput: no disponible. El autor solo indica que la inferencia se realiza en 4 pasos, sin publicar tiempos por clip ni mediciones de fps efectivos.

## Comparativa con modelos similares

| Modelo | Parametros | Configuracion de inferencia | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-I2V-A14B-Merge-Lightning V1.0 (este modelo) | 14,29 mil millones (safetensors del repo) | 480x832, 81 fotogramas, 16 fps, guidance 1.0 | 4 | MIT (segun el autor) | HuggingFace, 0 descargas y 0 likes |
| Wan-AI/Wan2.2-I2V-A14B-Diffusers (modelo base) | no disponible en la informacion proporcionada | configurables; el autor no detalla los valores por defecto | no disponible (superior a 4) | no disponible | HuggingFace, ampliamente distribuido |
| lightx2v/Wan2.2-Lightning (LoRA de destilacion, rank 64) | LoRA de bajo rango sobre el base | se aplica sobre el modelo base | 4 | no disponible | HuggingFace |
| Alternativas de terceros (LTX-Video, CogVideoX, HunyuanVideo) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada, por lo que la comparativa se limita a parametros, configuracion de inferencia, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y ninguna evaluacion independiente publicada.
- Inconsistencia en la propia documentacion: la model card indica `model_id = "FastDM/Wan2.2-I2V-A14B-Merge-Lightning-V1.0-Diffusers"` para el ejemplo de diffusers, mientras que el identificador del repositorio es `Zapm14/Wan2.2-I2V-A14B-Merge-Lightning-V1.0-Diffusers`. Conviene verificar cual es el checkpoint real antes de integrarlo en un pipeline.
- Al ser un merge no oficial, no existe informe de entrenamiento, receta de fusion ni evaluacion de calidad respecto al modelo base.
- Riesgo alto de artefactos visuales tipicos de la generacion de video: manos y extremidades deformadas, fusion de figuras, texturas inestables entre fotogramas, texto ilegible en escena y perdida de identidad del sujeto a lo largo del clip.
- La destilacion a 4 pasos suele implicar una perdida de fidelidad y de detalle frente al modelo base ejecutado con mas pasos; no hay datos que cuantifiquen esa perdida.
- El negative prompt del ejemplo esta redactado en chino, lo que sugiere que el modelo puede estar mejor alineado con prompts en chino o ingles que en otros idiomas. No hay informacion oficial sobre idiomas soportados.
- Ventana temporal limitada: el ejemplo oficial genera 81 fotogramas a 16 fps, aproximadamente 5 segundos. No se documenta la generacion de clips mas largos ni de extension por trozos.
- El modelo no genera audio; cualquier banda sonora debe anadirse en un paso posterior.
- Licencia MIT declarada por el autor, lo que en principio permite uso comercial, pero las licencias de los pesos base (Wan2.2) y del LoRA de destilacion (Wan2.2-Lightning) deben verificarse por separado, ya que el merge hereda condiciones de sus componentes.
- El repositorio ocupa 126,2 GB, un coste de almacenamiento y de ancho de banda elevado para un despliegue en produccion.
- La fecha de creacion registrada en los metadatos (2026-09-28) es posterior a la actualizacion habitual de los repositorios consultados; conviene comprobar la fecha real del commit antes de citarla.
- No hay informacion sobre sesgos del dataset de entrenamiento original ni sobre filtrado de contenido; en un modelo de generacion visual esto afecta a la representacion de personas, culturas y cuerpos.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Zapm14/Wan2.2-I2V-A14B-Merge-Lightning-V1.0-Diffusers
- Modelo base: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B-Diffusers
- LoRA de destilacion (Wan2.2-Lightning): https://huggingface.co/lightx2v/Wan2.2-Lightning
- LoRA especifico empleado en el merge (4 steps, rank 64, Seko V1): https://huggingface.co/lightx2v/Wan2.2-Lightning/tree/main/Wan2.2-I2V-A14B-4steps-lora-rank64-Seko-V1
- Runner FastDM citado en la model card: https://github.com/KE-AI-ENG/FastDM
- Resultados de la busqueda web: no se ha encontrado ninguna fuente tecnica, paper, blog o demo relacionada con este modelo. Las unicas respuestas devueltas corresponden a sitios de listados de eventos sin relacion con el contenido.
