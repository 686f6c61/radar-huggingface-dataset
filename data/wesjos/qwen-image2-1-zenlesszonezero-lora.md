# wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora

## Resumen

`wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora` es un adaptador LoRA de estilo entrenado sobre el modelo de difusion Qwen-Image-2.1 de Alibaba Qwen. Lo desarrolla el usuario independiente wesjos y su proposito es transferir la estetica visual del videojuego *Zenless Zone Zero* (ZZZ) a generaciones de imagen, tanto en modo texto-a-imagen como en edicion imagen-a-imagen. El repositorio acumula 1755 descargas y 5 likes, con un tamano de 1,6 GB, lo que es coherente con un adaptador de bajo rango sobre un modelo base grande.

El modelo resuelve un problema muy concreto: aplicar de forma consistente la paleta fria, el cel shading con volumen, el diseno de vestuario y el tratamiento de iluminacion nocturna caracteristicos de ZZZ sin necesidad de describirlos en cada prompt. La palabra de activacion es `zenlesszonezero`, aunque el autor indica que el estilo tambien se transfiere sin ella. Funciona sobre el checkpoint `qwen_image_2.1_int8_convrot.safetensors` distribuido con ComfyUI.

Es relevante ahora porque los LoRA de estilo sobre modelos de difusion de ultima generacion permiten a estudios pequenos y artistas individuales producir imagenes coherentes con una direccion de arte concreta con muy poco coste de entrenamiento e inferencia. Al ser un adaptador, no requiere reentrenar el modelo base ni dispone de pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo de difusion Qwen-Image-2.1 (text-to-image / image-to-image) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se distribuye en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor referencia un base en int8: `qwen_image_2.1_int8_convrot.safetensors`) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 (segun model card y metadatos YAML) |
| Formato de pesos | safetensors (adaptador LoRA; repo de 1,6 GB) |

## Arquitectura y entrenamiento

Se trata de un LoRA de estilo, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base Qwen-Image-2.1, un modelo de difusion para generacion y edicion de imagenes. El adaptador modifica el comportamiento del UNet/diT y del codificador de texto para sesgar la salida hacia la estetica de ZZZ: lineas limpias, cel shading con volumen suave, paleta enfriada y diseno de vestuario propio del juego. El autor no publica detalles del dataset de entrenamiento, numero de pasos, rango del LoRA ni hiperparametros de entrenamiento.

La model card documenta el uso practico con ComfyUI: fuerza 0,8 sobre el modelo y 0,85 sobre el text encoder, sampler `euler` con scheduler `simple`, 30 pasos, CFG 4,0 y AuraFlow shift 3,0. Las generaciones de ejemplo son de 1920x1088 (latente 1920x1080). No se indica si hubo regularizacion, captions automaticos ni uso de tecnicas como LoRA de rango variable o DoRA. El modelo base referenciado es el checkpoint int8 `qwen_image_2.1_int8_convrot.safetensors` de ComfyUI, lo que sugiere que el adaptador se entreno o valido sobre esa cuantizacion concreta.

## Capacidades

- Generacion de imagen texto-a-imagen con estilo ZZZ aplicado de forma implicita (sin necesidad de trigger word).
- Edicion imagen-a-imagen: restiliza una imagen de entrada preservando identidad del personaje, pose y composicion, y sustituyendo paleta, iluminacion, linework y vestuario.
- Transferencia de estilo sobre personajes de otras franquicias (se muestran ejemplos con Hu Tao y Furina de *Genshin Impact*, Frieren y Asuna).
- Control de fuerza del LoRA de forma independiente en modelo y text encoder.
- Compatibilidad con flujos de ComfyUI y con el ecosistema `diffusers`.
- Soporte de prompts en ingles y chino (idiomas declarados).
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente un modelo generativo de imagen.

## Casos de uso

- Produccion de arte conceptual para videojuegos con direccion de arte ZZZ: generar variaciones de personajes y escenarios en 1920x1088 con un coste de inferencia bajo, usando el LoRA como capa de estilo sobre el base.
- Restilizado por lotes de ilustraciones existentes: aplicar el LoRA en modo img2img sobre un catalogo de fan art o assets para unificar la estetica antes de publicar una coleccion.
- Creacion de fan art y contenido para comunidad: el modelo transfiere el estilo a personajes de otras franquicias manteniendo su identidad, lo que es util para piezas derivadas y promocionales.
- Prototipado rapido de vestuario y paletas: iterar sobre variantes de outfit (cardigan, bikini, sudadera oversize) en prompts cortos y evaluar direccion de arte en minutos.
- Generacion de key art y banners para redes: la resolucion nativa de 1920x1088 encaja con formatos de cabecera sin reescalado agresivo.
- Integracion en pipelines de ComfyUI para estudios pequenos: encadenar el LoRA con otros nodos (upscale, inpainting, controlnet) para flujos de produccion semi-automaticos.
- Experimentacion academica sobre transferencia de estilo: servir como caso de estudio de LoRA de bajo rango sobre difusion moderna con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye ejemplos cualitativos de generacion y edicion, sin metricas objetivas como FID, CLIP score ni comparaciones cuantitativas con otros LoRA.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Al ser un adaptador sobre Qwen-Image-2.1, los requisitos vienen determinados por el modelo base; el checkpoint int8 referenciado sugiere que el autor trabajo en un entorno con cuantizacion de 8 bits.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano del base y la resolucion de 1920x1088, se requiere una GPU con VRAM holgada, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la model card.
- Despliegue: ComfyUI es el entorno documentado por el autor (workflow embebido en los PNG de ejemplo). Tambien es compatible con `diffusers` segun el metadato `library_name`.
- Latencia y throughput: no disponibles. Los ejemplos usan 30 pasos con sampler `euler`, CFG 4,0.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora | LoRA de estilo (t2i + img2img) | Qwen-Image-2.1 | 1920x1088 en ejemplos | apache-2.0 | Hugging Face, 1755 descargas |
| LoRA de estilo genericos sobre SDXL | LoRA de estilo | Stable Diffusion XL | variable | variable segun autor | Amplia en Civitai/HF |
| LoRA de estilo sobre FLUX.1 | LoRA de estilo | FLUX.1 | variable | variable segun autor | Amplia en HF |
| Modelo base Qwen-Image-2.1 | Difusion completa | - | no disponible | no disponible en esta ficha | Hugging Face (Qwen) |

No se dispone de datos cuantitativos para comparar rendimiento con alternativas; la comparacion es estructural (tipo de adaptador, base y licencia).

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar Qwen-Image-2.1 como base.
- No se documentan sesgos especificos, pero al entrenarse sobre una estetica de videojuego puede sobrerrepresentar ciertos rasgos de personajes y estilos de vestuario.
- Riesgo de alucinacion visual: en img2img puede alterar detalles de identidad si se sube la fuerza del LoRA por encima de los valores recomendados (0,8 / 0,85).
- La model card advierte que las imagenes de entrada de los ejemplos son fan art de terceros y que el contenido generado no representa necesariamente el material original.
- Licencia apache-2.0 declarada, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base Qwen-Image-2.1 antes de desplegar en produccion.
- Idiomas limitados a en y zh; prompts en castellano pueden degradar la fidelidad al estilo.
- No hay garantias de soporte ni mantenimiento por parte del autor; el repo se actualizo por ultima vez en noviembre de 2026.
- No se especifican limitaciones de resolucion mas alla de los ejemplos a 1920x1088.

## Enlaces

- Hugging Face: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Ejemplo img2img 0: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/edit/edit0_compare.jpg
- Ejemplo img2img 1: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/edit/edit1_compare.jpg
- Ejemplo img2img 2: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/edit/edit2_compare.jpg
- Ejemplo img2img 3: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/edit/edit3_compare.jpg
- Ejemplo t2i 1: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_01.png
- Ejemplo t2i 2: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_02.png
- Ejemplo t2i 3: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_03.png
- Ejemplo t2i 4: https://huggingface.co/wesjos/Qwen-Image2.1-ZenlessZoneZero-Lora/resolve/main/examples/t2i_04.png
