# spyrostheboss/Melissa_O_Neil_Krea_2_LoRA

## Resumen

Este repositorio contiene un LoRA de personaje entrenado para el modelo de generación de imágenes Krea 2, con el objetivo de reproducir de forma consistente la apariencia y los rasgos faciales de la actriz Melissa O'Neil. El adaptador ha sido desarrollado por el usuario spyrostheboss y se distribuye como un archivo único en formato safetensors, listo para cargar en ComfyUI o mediante el script de inferencia de Krea 2 (musubi-tuner).

El LoRA resuelve el problema de mantener la identidad de un personaje concreto a través de distintas poses, expresiones, vestimentas, ángulos y composiciones, algo que los modelos base de texto a imagen no garantizan por sí solos. Su relevancia radica en que permite a desarrolladores y creadores generar imágenes de un personaje específico sin necesidad de entrenar un modelo completo, con un coste de entrenamiento reducido (452 imágenes, 5 épocas) y un tamaño de adaptador de 0,5 GB.

La arquitectura se basa en un LoRA sobre el modelo base Krea 2 Raw, con una red de dimensión 32 y alpha 32, un text encoder Qwen3-VL-4B congelado y un VAE Qwen-Image. El entrenamiento se realizó a resolución 1024x1024 con bucketing, y el adaptador está diseñado para usarse preferentemente con el checkpoint Krea 2 Turbo en inferencia, con una fuerza de LoRA recomendada de 1.0 y 8 pasos de muestreo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Krea-2/lora (adaptador LoRA sobre Krea 2 Raw) |
| Parametros totales | no disponible (red LoRA con dim/alpha 32/32) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en bf16, base fp8) |
| Idiomas soportados | no disponible (el text encoder es Qwen3-VL-4B, pero no se especifican idiomas) |
| Licencia | other (no se detallan restricciones especificas) |
| Formato de pesos | safetensors (archivo unico `mlsneil_krea2.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) aplicado al modelo base Krea 2 Raw, que es un modelo de difusion de texto a imagen de la familia Krea 2. La red LoRA utiliza una dimension de 32 y un alpha de 32, lo que indica una capacidad de adaptacion moderada. El text encoder empleado es Qwen3-VL-4B, congelado durante el entrenamiento, y el VAE es el de Qwen-Image. El entrenamiento se realizo con 452 imagenes de la actriz, durante 5 epocas (565 pasos totales) con un batch efectivo de 4 (batch size 1 con acumulacion de gradientes de 4). Se uso el optimizador AdamW8bit con una tasa de aprendizaje constante de 1e-4, sin warmup, y muestreo de timesteps con el esquema `krea2_shift`. La resolucion de entrenamiento fue de 1024x1024 con bucketing, y se empleo precision mixta bf16 con base fp8. El seed fijado fue 42.

No se especifican detalles sobre la composicion del dataset de entrenamiento ni sobre tecnicas de alineacion como RLHF o DPO, ya que se trata de un ajuste fino de identidad visual, no de un modelo de lenguaje.

## Capacidades

- Generacion de imagenes de la actriz Melissa O'Neil con identidad facial consistente (rasgos, peinado, ojos, pecas) en distintas poses, expresiones, vestimentas, angulos y composiciones.
- Activacion mediante la palabra clave `mlsneil` como primer token del prompt, que debe escribirse exactamente en minusculas.
- Compatible con el modelo base Krea 2 Raw para entrenamiento y con Krea 2 Turbo para inferencia, segun las recomendaciones del autor.
- Integrable en flujos de trabajo de ComfyUI o mediante el script de inferencia de Krea 2 (musubi-tuner).
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural; es exclusivamente un adaptador de generacion de imagenes.

## Casos de uso

- Creacion de contenido artistico y fan art: el LoRA permite generar ilustraciones de Melissa O'Neil en estilos variados manteniendo su identidad, util para artistas que quieren explorar escenarios ficticios o versiones estilizadas del personaje.
- Diseno de personajes para producciones audiovisuales: los equipos de preproduccion pueden generar imagenes de referencia del actor en diferentes atuendos y ambientaciones para conceptualizar vestuario, maquillaje o iluminacion.
- Generacion de avatares y retratos personalizados: se puede usar para crear retratos de la actriz en situaciones cotidianas o historicas, con control sobre la composicion y el encuadre.
- Pruebas de casting virtual: en proyectos de animacion o videojuegos, se pueden generar variaciones de un personaje basado en un actor real para evaluar su idoneidad antes de contratar.
- Ilustracion de portadas y material promocional: los disenadores pueden producir imagenes de alta calidad (1024x1024) de la actriz para carteles, portadas de revistas o contenido de redes sociales, siempre que la licencia lo permita.
- Investigacion en generacion de imagenes con control de identidad: el adaptador sirve como caso de estudio para tecnicas de LoRA de personaje sobre modelos de difusion modernos, permitiendo analizar la consistencia de identidad y la transferencia de estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas de rendimiento (por ejemplo, similitud facial, FID, o comparaciones con otros LoRA de personaje). La unica referencia de calidad es la imagen de ejemplo incluida en el repositorio, que no permite una evaluacion objetiva.

## Requisitos de hardware

- No se especifican requisitos de hardware en la informacion proporcionada. Dado que se trata de un LoRA, los requisitos dependen del modelo base Krea 2 Raw o Turbo, que no se detallan en este repositorio.
- Se estima que para inferencia con Krea 2 Turbo a 1024x1024 se necesita una GPU con al menos 8-12 GB de VRAM, aunque este dato no esta confirmado por el autor.
- El adaptador en si es ligero (0,5 GB) y puede cargarse en memoria junto con el modelo base.
- Opciones de despliegue: ComfyUI (carga directa del safetensors) o el script de inferencia de Krea 2 (musubi-tuner). No se mencionan otros frameworks como vLLM u Ollama, que no son aplicables a modelos de difusion.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre otros LoRA de personaje para Krea 2 con los que comparar este adaptador. Existen en plataformas como SeaArt o CivitAI otros modelos de Melissa O'Neil (por ejemplo, un LoRA para Flux), pero no se han encontrado datos objetivos de rendimiento ni especificaciones comparables en la informacion disponible. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para reproducir la apariencia de Melissa O'Neil; no es un modelo generalista y su uso fuera de este personaje puede producir resultados inconsistentes.
- La licencia se indica como "other", sin detallar restricciones especificas. Es necesario verificar los terminos de uso antes de emplear el modelo en proyectos comerciales o publicos.
- No se especifican sesgos conocidos, pero al tratarse de un dataset limitado a 452 imagenes, puede haber sesgos en la representacion de ciertas expresiones, iluminaciones o angulos.
- Riesgo de alucinacion visual: el modelo puede generar detalles faciales o accesorios que no corresponden exactamente a la persona real, especialmente en condiciones de prompt ambiguo.
- La palabra clave `mlsneil` debe escribirse exactamente en minusculas; cualquier variacion puede no activar el LoRA correctamente.
- No se proporcionan garantias de rendimiento en produccion; se recomienda validar la calidad de las imagenes generadas antes de un despliegue a gran escala.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spyrostheboss/Melissa_O_Neil_Krea_2_LoRA
- Repositorio de entrenamiento de LoRA de personaje para Krea 2 (referencia): https://github.com/bongobongo2020/krea2-character-lora-trainer
- Biblioteca de modelos de Krea (referencia general): https://www.krea.ai/models
