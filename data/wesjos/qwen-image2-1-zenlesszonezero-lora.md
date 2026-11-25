# wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora

## Resumen

Qwen-Image2.1-ZenlessZoneZero-Lora es un adaptador LoRA de estilo entrenado sobre el modelo de difusion Qwen-Image-2.1, desarrollado por el usuario wesjos y publicado en Hugging Face. Su proposito es transferir la estetica visual del videojuego Zenless Zone Zero (paleta, iluminacion, linework y renderizado de personajes) a la generacion de imagenes, tanto en modo texto-a-imagen como en edicion imagen-a-imagen. El repositorio ocupa 1,6 GB y acumula cerca de 2.000 descargas desde su publicacion.

El modelo resuelve un problema acotado pero muy demandado en comunidades de creacion de contenido: obtener un estilo artistico concreto sin necesidad de reentrenar un modelo base completo. Al ser un adaptador sobre Qwen-Image-2.1, hereda las capacidades del modelo base y anade el sesgo estilistico del juego. La palabra de activacion es `zenlesszonezero`, aunque el autor indica que el estilo tambien se transfiere sin ella.

La relevancia actual radica en su integracion con ComfyUI y en que el autor documenta exhaustivamente los ajustes de muestreo utilizados (LoRA 0.80 en el modelo y 0.85 en el text encoder, sampler `euler` con scheduler `simple`, 30 pasos, CFG 4.0 y AuraFlow shift 3.0), lo que facilita la reproducibilidad. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Qwen-Image-2.1 |
| Parametros totales | no disponible (el repo pesa 1,6 GB; el numero de parametros del adaptador no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base usado en los ejemplos es `qwen_image_2.1_int8_convrot.safetensors` (INT8) |
| Idiomas soportados | en, zh (segun los metadatos de la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via libreria `diffusers`; compatible con ComfyUI) |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango insertadas en las capas del modelo base Qwen-Image-2.1, que es un modelo de difusion para generacion de imagenes. El adaptador modifica tanto el UNet/transformer de difusion como el text encoder, con intensidades distintas recomendadas (0.80 y 0.85 respectivamente). El modelo base empleado para generar los ejemplos es la version INT8 con rotacion de convoluciones (`qwen_image_2.1_int8_convrot.safetensors`) distribuida para ComfyUI.

No se dispone de informacion sobre el dataset de entrenamiento: numero de imagenes, resoluciones, composicion, uso de captions o si hubo tecnicas de regularizacion. Tampoco se documenta el numero de pasos de entrenamiento, el rango del LoRA ni la tasa de aprendizaje. La model card se limita a describir el uso y los resultados, no el proceso de entrenamiento.

## Capacidades

- Generacion de imagenes texto-a-imagen con estetica Zenless Zone Zero, incluyendo retratos de personajes, escenas cotidianas y composiciones multijugador.
- Edicion imagen-a-imagen: reestiliza una imagen de entrada preservando identidad del personaje, pose y composicion, mientras transforma paleta, iluminacion, linework y renderizado de vestuario.
- Transferencia de estilo sin palabra de activacion: el autor confirma que las cinco imagenes de ejemplo se generaron sin incluir `zenlesszonezero` en el prompt.
- Palabra de activacion opcional `zenlesszonezero` para forzar el estilo cuando sea necesario.
- Soporte de resoluciones altas: los ejemplos se generan a 1920 x 1088 (latente 1920 x 1080).
- Compatibilidad con flujos de ComfyUI, incluyendo metadatos de workflow embebidos en los PNG de ejemplo.
- Capacidad multilingue heredada del modelo base: prompts en ingles y chino.

## Casos de uso

- Creacion de fan art de estilo anime: el LoRA permite generar ilustraciones de personajes con la estetica exacta del juego, ideal para comunidades de fan art que necesitan coherencia visual en series de imagenes.
- Prototipado de assets para videojuegos: estudios independientes pueden generar conceptos de personajes y escenarios con un look anime consistente antes de encargar el trabajo final a ilustradores.
- Reestilizado de fotografias para redes sociales: usando el modo img2img, se puede convertir una foto real en una ilustracion con estetica ZZZ manteniendo la composicion original, util para avatares y contenido promocional.
- Generacion de ilustraciones para mods y contenido derivado: la licencia Apache-2.0 permite integrar el adaptador en pipelines de produccion de contenido para comunidades de modding sin restricciones comerciales.
- Creacion de webcomics y tiras ilustradas: la capacidad de mantener identidad de personaje entre generaciones permite producir paneles consistentes para narrativa visual.
- Diseno de merchandising y prints: la resolucion de salida de 1920 x 1088 es suficiente para prints de tamano medio y productos derivados, con el estilo del juego como diferenciador.
- Pruebas de concepto en pipelines de difusion: investigadores pueden usar este LoRA como caso de estudio de transferencia de estilo sobre Qwen-Image-2.1, comparando el efecto del adaptador en el modelo y en el text encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica para el adaptador. El modelo base Qwen-Image-2.1 en INT8 requiere previsiblemente entre 8 y 16 GB de VRAM, pero este dato no se confirma en la informacion proporcionada.
- GPU recomendadas: no disponible. El autor no especifica hardware utilizado para generar los ejemplos.
- Cabe en GPU de consumo: no confirmado, aunque el uso de la version INT8 del modelo base sugiere que puede ejecutarse en GPUs de gama alta para consumidores; no hay datos verificables.
- Opciones de despliegue: ComfyUI (documentado por el autor, con workflows embebidos en los PNG), y la libreria `diffusers` (indicada en los metadatos del repositorio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image2.1-ZenlessZoneZero-Lora | LoRA de estilo | Qwen-Image-2.1 | 1920 x 1088 en ejemplos | Apache-2.0 | Hugging Face, ~1.958 descargas |
| LoRA de estilo genericos sobre SDXL | LoRA de estilo | SDXL | 1024 x 1024 tipico | variable (muchos con licencia restrictiva) | Civitai, Hugging Face |
| Qwen-Image-2.1 (modelo base) | Modelo de difusion completo | no aplica | no disponible | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al entrenarse sobre un videojuego concreto puede reproducir estereotipos visuales del medio anime.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, texto ilegible o incoherencias en escenas complejas.
- La transferencia de estilo puede degradar la identidad del personaje en el modo img2img si la fuerza del LoRA es demasiado alta; el autor recomienda 0.80 en el modelo y 0.85 en el text encoder.
- El modelo base esta entrenado principalmente en ingles y chino; los prompts en otros idiomas pueden funcionar peor.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado con la estetica de Zenless Zone Zero puede estar sujeto a derechos de propiedad intelectual de HoYoverse; el autor no aborda esta cuestion.
- No se especifican los datos de entrenamiento, lo que impide evaluar posibles problemas de copyright en el dataset.
- El adaptador depende completamente de Qwen-Image-2.1; no es util sin el modelo base.
- La model card advierte que el contenido generado no es necesariamente representativo del material original en todos los aspectos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Ejemplos texto-a-imagen: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_01.png (y sucesivos t2i_02 a t2i_05)
- Ejemplo de edicion: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/edit/edit0_compare.jpg
