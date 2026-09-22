# Viggle/Qwen-Image-2.1-viggle-turbo

## Resumen

Qwen-Image-2.1-viggle-turbo es un estudiante destilado del modelo de difusion Qwen/Qwen-Image-2.1, entrenado por Viggle mediante Distribution Matching Distillation (DMD). Su proposito es reducir el coste de inferencia de un generador de imagen de 40 pasos a 4 pasos del transformer, sin classifier-free guidance (CFG), manteniendo tanto generacion texto-a-imagen como edicion guiada por instrucciones con una a tres imagenes de referencia. El repositorio redistribuye dos variantes del mismo estudiante: un transformer completo afinado (bf16, 14,2 GB) y un adaptador LoRA de rango 64 (340 MB) que se carga en tiempo de ejecucion sobre el transformer base.

El modelo se publica como vista previa v0.1 y el propio autor advierte de que todavia no alcanza al modelo base: la generacion texto-a-imagen a 4 pasos es utilizable, pero en edicion compleja (composicion multi-referencia, intercambio de caras, edicion con preservacion de identidad e instrucciones con multiples restricciones) es claramente peor que el base a 40 pasos. Se trata, por tanto, de un artefacto de investigacion y prototipado rapido, no de un sustituto del modelo del que deriva.

El contaje real de parametros del repositorio es de 7.115.124.736 (unos 7,12 mil millones), correspondientes al transformer safetensors redistribuido. El text encoder, el VAE y el procesador no se redistribuyen: se cargan desde el repositorio base. La licencia declarada es qwen-research y el pipeline es text-to-image, con soporte adicional de image-to-image y edicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (QwenImage21Transformer2DModel) destilado por Distribution Matching Distillation (DMD) |
| Parametros totales | 7.115.124.736 (unos 7,12 mil millones), segun los safetensors del repositorio |
| Longitud de contexto | No disponible (modelo de generacion de imagen; no se documenta ventana de contexto de texto) |
| Tipos de cuantizacion | No se distribuyen pesos cuantizados; los pesos se publican en bf16 (transformer y LoRA) y el adaptador en formato peft se publica en F32 tal como se entreno |
| Idiomas soportados | No disponible (depende del text encoder del modelo base, que no se redistribuye) |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`, `license_link: LICENSE`) |
| Formato de pesos | safetensors (bf16) para el transformer; safetensors LoRA (rango 64, bf16) y copia en formato peft (F32); config.json y scheduler_config.json de diffusers |
| Modelo base | Qwen/Qwen-Image-2.1 (relacion: adapter) |
| Modalidades | Texto a imagen, imagen a imagen, edicion guiada por instrucciones con 1-3 imagenes de referencia |
| Resolucion de salida | Parametros `height`/`width` (ejemplo oficial 1024x1024) o `output_resolution`; sin `height`/`width`, la relacion de aspecto sigue la ultima referencia |
| Pasos de inferencia | 4 (`num_inference_steps=4`), `true_cfg_scale=1.0`, sin prompt negativo |
| Tamano del repositorio | 16,3 GB |
| Libreria | diffusers (requiere instalacion fijada a un commit concreto de git) |

## Arquitectura y entrenamiento

La arquitectura es la del transformer de difusion del modelo base (QwenImage21Transformer2DModel), sobre el que se aplica un proceso de destilacion de correspondencia de distribuciones (DMD). El estudiante se entrena para producir la misma distribucion de salida en 4 pasos del transformer que el modelo base necesita 40, eliminando ademas la necesidad de classifier-free guidance. El transformer completo afinado incorpora un ancla de profesor de baja frecuencia en el objetivo DMD, y tanto este como el LoRA son checkpoints EMA del paso 400 de sus respectivos entrenamientos. El adaptador LoRA tiene rango 64 con alpha 64 y nunca se fusiona en el transformer: la model card indica que fusionarlo en bf16 es con perdida, por lo que se carga en tiempo de ejecucion.

Los detalles del dataset de entrenamiento no se publican: no se especifica el numero de tokens, la composicion de las imagenes, el uso de RLHF/DPO ni el volumen de pares de edicion. Si se documenta que el entrenamiento de edicion admitio hasta 3 imagenes de referencia y que la reescritura de prompt no se uso durante el entrenamiento (aunque los reescritores oficiales PE-T2I y PE-I2I siguen aplicandose y, segun la model card, suelen mejorar la composicion y el texto renderizado). El text encoder, el VAE y el procesador no se redistribuyen y se cargan desde el repositorio base, que tampoco se duplica en este repositorio.

Una innovacion operativa relevante es el planificador: se distribuye un `scheduler_config.json` derivado del base con `shift_terminal: null`, porque el valor `0.02` del config original arruinaria el ultimo de los cuatro pasos. Tambien se advierte de que no debe pasarse `sigmas=` explicitamente, ya que el pipeline los desplaza de nuevo.

## Capacidades

- Generacion texto a imagen en 4 pasos del transformer, sin CFG y sin prompt negativo.
- Edicion de imagen guiada por instrucciones en lenguaje natural (por ejemplo, reemplazar el fondo manteniendo el sujeto).
- Composicion y edicion con 1 a 3 imagenes de referencia, referenciables en el prompt como `image 1`, `image 2`, etc.; el orden de la lista de referencias fija esa numeracion.
- Control de la relacion de aspecto de salida mediante `height`/`width`, o herencia de la ultima referencia si no se especifican.
- Compatibilidad con los reescritores de prompt oficiales del modelo base (PE-T2I para texto a imagen y PE-I2I para imagen a imagen), que pueden mejorar composicion y texto renderizado.
- Distribucion como dos estudiantes intercambiables: transformer completo afinado (sin adaptador, mas fiel en la comparacion cualitativa del autor) y adaptador LoRA de rango 64 sobre el transformer base (descarga mas pequena, algo mas debil).
- No se documentan capacidades de tool calling, function calling, agentes, vision de entrada para razonamiento, audio ni modo de pensamiento: es un modelo de generacion y edicion de imagen.

## Casos de uso

- Prototipado rapido de producto de generacion de imagen: al pasar de 40 a 4 evaluaciones del transformer y eliminar el CFG, cada iteracion de prompt cuesta aproximadamente un orden de magnitud menos de computo de denoising, lo que acelera la exploracion de prompts en fases de diseno.
- Edicion de fotografia con una sola referencia: el caso documentado de sustituir el fondo por una playa al atardecer manteniendo el sujeto encaja en flujos de retoque donde se requiere una instruccion corta y una imagen de entrada.
- Baterias de generacion por lotes: el bajo numero de pasos y la ausencia de CFG simplifican el batching en pipelines de contenido, aunque el autor advierte de que la calidad en edicion compleja no iguala al base.
- Despliegue en estaciones de trabajo con GPU de 24 GB: el adaptador LoRA ocupa 340 MB y el transformer completo 14,2 GB en bf16, lo que permite montar una demo local sobre el modelo base para pruebas internas.
- Investigacion sobre destilacion de modelos de difusion: el repositorio publica dos estudiantes del mismo objetivo DMD (fine-tune completo y LoRA r64) como checkpoints EMA del paso 400, lo que permite comparar ambas formulaciones bajo el mismo planificador y el mismo ajuste de inferencia.
- Aumento de datos visuales para entrenamiento: generar variaciones controladas de imagenes a partir de prompts y referencias, asumiendo la advertencia de que se trata de pesos de vista previa.
- Maquetacion de storyboards y moodboards: con hasta 3 referencias y control de la relacion de aspecto de salida, permite componer escenas de referencia para equipos creativos antes de pasar al modelo base a 40 pasos.
- Integracion en interfaces de demostracion: el propio autor publica un Space que ejecuta por defecto el transformer completo, lo que sirve de referencia para montar una demo con diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP, ImageReward ni comparaciones cuantitativas con el modelo base); la unica comparacion aportada es cualitativa y afirma que el transformer completo edita de forma mas fiel que el LoRA, y que ambos quedan por debajo del modelo base a 40 pasos en edicion compleja.

## Requisitos de hardware

- VRAM para el transformer completo: 14,2 GB solo en pesos bf16. Hay que sumar el text encoder, el VAE y las activaciones del pipeline, que se cargan desde el modelo base y no se redistribuyen aqui; la VRAM total del pipeline es por tanto superior a 14,2 GB, y no se publica la cifra exacta.
- VRAM para la variante LoRA: el adaptador ocupa 340 MB, pero requiere cargar el transformer base completo, por lo que la VRAM es del mismo orden que la del transformer afinado.
- GPU recomendadas: A100 (40/80 GB) y H100 para servicio con margen; RTX 4090 (24 GB) para uso local si el resto del pipeline cabe en los aproximadamente 10 GB restantes, algo que la informacion disponible no confirma.
- GPU de consumo: cabe en tarjetas de 24 GB en bf16; en tarjetas de 16 GB requeriria cuantizacion, y este repositorio no distribuye pesos cuantizados (no hay GGUF, INT8 ni FP8 publicados por el autor).
- Opciones de despliegue: diffusers con una instalacion fijada por git (`80c7ed262aeffbeb43ef13ae04baeb9b84515a69`), `transformers>=5.17,<6`, `accelerate`, `safetensors`, `peft` y `pillow`. `QwenImage21Pipeline` todavia no esta en una version publicada de diffusers.
- vLLM, llama.cpp, Ollama y TGI no aplican como tales a este artefacto: es un transformer de difusion distribuido en safetensors de diffusers, sin pesos GGUF.
- Latencia y throughput: no se publican cifras absolutas. La unica referencia cuantitativa es la reduccion de 40 a 4 evaluaciones del transformer (y la eliminacion del CFG), lo que implica aproximadamente un orden de magnitud menos de pasos de denoising.
- Planificador obligatorio: usar el `scheduler_config.json` distribuido (o `FlowMatchEulerDiscreteScheduler.from_config(pipe.scheduler.config, shift_terminal=None)`); el `shift_terminal: 0.02` del base degrada el cuarto paso.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos / CFG | Contexto de referencia | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen-Image-2.1-viggle-turbo (transformer completo) | 7,12 mil millones | 4 pasos, sin CFG | Hasta 3 imagenes | qwen-research | Vista previa v0.1; edicion compleja peor que el base |
| Qwen-Image-2.1-viggle-turbo (LoRA r64) | Adaptador de 340 MB sobre el transformer base | 4 pasos, sin CFG | Hasta 3 imagenes | qwen-research | Vista previa v0.1; algo mas debil que el transformer completo segun el autor |
| Qwen/Qwen-Image-2.1 (base) | No disponible en la informacion proporcionada | 40 pasos, con CFG | No disponible | No disponible en la informacion proporcionada | Modelo de referencia con mejor calidad en edicion compleja |

Otros generadores de imagen de pocos pasos (por ejemplo, destilados de la familia SDXL o FLUX) no se comparan en la informacion disponible, por lo que no se dispone de datos de rendimiento frente a ellos.

## Limitaciones y advertencias

- Es una vista previa v0.1 en desarrollo: el autor indica explicitamente que esta version queda por debajo del modelo base y que en edicion complicada (composicion multi-referencia, intercambio de caras, edicion con preservacion de identidad, instrucciones con varias restricciones) es claramente peor que el base a 40 pasos.
- No se puede aumentar la calidad subiendo los pasos ni activando CFG: el adaptador se destilo exactamente para 4 pasos con `true_cfg_scale=1.0` y sin prompt negativo.
- No se puede pasar `sigmas=` al pipeline ni usar el `scheduler_config` del modelo base sin fijar `shift_terminal` a null.
- Los dos estudiantes son pesos distintos: no debe cargarse el LoRA sobre el transformer afinado.
- Los reescritores de prompt no se usaron en el entrenamiento; su uso es opcional y sus efectos dependen de los reescritores oficiales PE-T2I y PE-I2I.
- La documentacion no aporta informacion sobre sesgos, composicion del dataset, idiomas soportados, tasas de alucinacion visual (por ejemplo, texto renderizado incorrecto o artefactos) ni evaluaciones de seguridad.
- Licencia qwen-research (categoria `other`): los terminos concretos de uso comercial no se detallan en la informacion disponible. Hay que revisar el fichero LICENSE del repositorio, la licencia del modelo base Qwen/Qwen-Image-2.1 y el uso del nombre "Built with Qwen".
- El text encoder, el VAE y el procesador no se redistribuyen: cualquier despliegue depende de descargar el modelo base, con sus propios requisitos de licencia y de VRAM.
- No se publican pesos cuantizados, de modo que desplegar en GPUs de menos de 24 GB exige aplicar cuantizacion por cuenta propia, fuera del alcance de lo validado por el autor.
- La API de inferencia depende de una version no publicada de diffusers instalada desde un commit concreto de git, lo que anade fragilidad en entornos de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Space de demostracion: https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo
- Reescritor de prompt texto a imagen: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-T2I
- Reescritor de prompt imagen a imagen: https://huggingface.co/Qwen/Qwen-Image-2.1-PE-I2I
- diffusers (commit fijado por la model card): https://github.com/huggingface/diffusers/tree/80c7ed262aeffbeb43ef13ae04baeb9b84515a69
- Sitio de Viggle: https://viggle.ai/
- Herramientas de Viggle: https://viggle.ai/tools
- Descarga de la aplicacion de Viggle: https://viggle.ai/download
- Terminos de las herramientas de animacion: https://viggle.ai/animation-tools
