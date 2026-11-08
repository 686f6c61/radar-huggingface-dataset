# Viggle/Viggle-Image-Swap

## Resumen

Viggle-Image-Swap es un adaptador LoRA para el modelo de difusión texto-a-imagen Qwen/Qwen-Image-2.1, desarrollado por Viggle. Su función es sustituir las personas de una fotografía por personajes definidos en una "character sheet" (hoja de personaje), reemplazando de forma completa cara, pelo, cuerpo y ropa, mientras se preservan la pose, la expresión, el encuadre, el fondo y la iluminación de la imagen original. No es un modelo independiente: requiere cargar el pipeline base de Qwen-Image-2.1 y aplicar el adaptador sobre él.

El adaptador tiene rango 256 y alpha 256, se distribuye en bf16 con formato de claves de diffusers y ocupa 1,4 GB en el repositorio. Está diseñado para muestrear en 6 pasos sin classifier-free guidance (true_cfg_scale=1.0), o bien en 2 pasos con el modelo Qwen-Image-2.1-Turbo encadenando 6 pasos adicionales para obtener más detalle. La salida es de 1 MP con la relación de aspecto de la imagen de origen y lados múltiplos de 32.

Es relevante para flujos de edición de imagen con identidad consistente (character swap) sin reentrenamiento, con un coste de inferencia bajo gracias al muestreo de pocos pasos. La licencia es `qwen-research` (etiquetada como `other`), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 256, alpha 256) sobre el pipeline de difusión Qwen-Image-2.1 (QwenImage21Pipeline) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); entrada: imágenes de hasta 1 MP cada una |
| Tipos de cuantizacion | bf16 (pesos del adaptador); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (el prompt de texto se redacta en inglés en los ejemplos) |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`) |
| Formato de pesos | safetensors (`viggle-image-swap-v0.1-lora.safetensors`, bf16, formato de claves diffusers) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 256 y alpha 256 que se inyecta sobre el transformer de difusión de Qwen-Image-2.1 mediante PEFT y diffusers. El pipeline emplea un scheduler FlowMatchEulerDiscreteScheduler con `shift_terminal=None` y un esquema de sigmas fijo para 6 pasos: `[1.0, 0.9375, 0.875, 0.75, 0.5, 0.25]`, con `true_cfg_scale=1.0` (sin classifier-free guidance). El pipeline añade un desplazamiento dependiente de la resolución a esos sigmas. Adicionalmente, el script de inferencia sustituye la incrustación de parches Conv3d en bf16 del codificador visual por una matmul equivalente, lo que ahorra unos 30 segundos por imagen de entrada.

La entrada se compone de una o varias character sheets (1536×1024: tercio izquierdo con retrato, dos tercios derechos con vista de cuerpo completo en tres ángulos sobre fondo liso) seguidas de la imagen de origen. Cada imagen se reduce a un máximo de 1 MP. El prompt sigue una plantilla de una frase por personaje más una frase que enumera lo que debe conservarse, e incluye posiciones espaciales (`on the left`, `on the right`, `in the middle`, `2nd from the left`). No se detallan en la información disponible el volumen de datos de entrenamiento, su composición ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Sustitución completa de personajes en imágenes: reemplaza cara, pelo, cuerpo y ropa de cada persona indicada.
- Preservación de atributos de la escena: pose, expresión, encuadre, fondo e iluminación de la imagen de origen.
- Sustitución de múltiples personas en una misma imagen, con control de qué posiciones se reemplazan y cuáles se mantienen (`--left`, `--kept`).
- Entrada de referencia por hoja de personaje (retrato + tres vistas) o por hoja con foto facial pegada en la celda de retrato (tercio izquierdo, filas 128–896, 512×768).
- Conservación de objetos/props ajenos al personaje sustituido (documentado en el ejemplo del disfraz de mascota).
- Muestreo de pocos pasos: 6 pasos sin CFG, o modo `--turbo` con 2 pasos iniciales y 6 adicionales sobre Qwen-Image-2.1-Turbo.
- Corrección de tono ("tone fix") integrada en el script de inferencia.
- Interfaz de línea de comandos (`inference/swap.py`) y uso programático vía Python con diffusers.
- No se documentan capacidades de tool calling, agentes, audio, vídeo ni multilingüismo en la información disponible.

## Casos de uso

- Producción audiovisual y previsualización de reparto: sustituir actores por personajes de una hoja de diseño para evaluar cómo encaja un diseño de personaje en una escena concreta, conservando la iluminación y el encuadre originales.
- Ilustración editorial y de cómic: recastear fotografías de referencia con personajes de la obra manteniendo la composición, útil para pasar de referencias fotográficas a arte final con identidad consistente.
- Creación de contenido para redes y memes: transformar selfis o fotos de cuerpo completo en versiones con personajes o disfraces, con el modo `--turbo` para iterar rápido en 2+6 pasos.
- Diseño de vestuario y mascotas corporativas: probar un disfraz o mascota sobre una persona real en una foto existente, preservando props en mano y la pose, como paso previo a una sesión fotográfica real.
- Videojuegos y herramientas creativas: integrar el adaptador en un editor de avatares o en un pipeline de personalización de personajes dentro de una aplicación, dado que el modelo base y el adaptador son cargables vía diffusers.
- Prototipado de campañas publicitarias: generar variantes de una misma escena con distintos personajes de marca sin repetir el rodaje, manteniendo fondo y luz para coherencia de campaña.
- Sustitución selectiva en imágenes grupales: reemplazar solo a una persona de un grupo (por ejemplo, `--left 1 3 --kept 1`) para correcciones puntuales en material ya publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 1,4 GB (bf16), pero requiere cargar el pipeline completo Qwen-Image-2.1 en bf16, cuyo peso no se detalla en la información disponible.
- VRAM estimada para inferencia: no disponible con cifra concreta; el uso de bf16 y una salida de 1 MP sitúan el requisito por encima de lo habitual en GPUs de consumo de gama media, aunque no se confirma.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de código usa `pipe.to("cuda")` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: diffusers (fijado al commit `80c7ed262aeffbeb43ef13ae04baeb9b84515a69` para `QwenImage21Pipeline`), con `transformers==5.17.0`, `peft==0.18.0`, `accelerate`, `safetensors`, `pillow` y `numpy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son frameworks de LLM, no aplicables a este pipeline de difusión).
- Latencia y throughput: no disponibles; sí se documenta un ahorro de aproximadamente 30 segundos por imagen de entrada al sustituir la Conv3d del codificador visual por una matmul equivalente.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Pasos de muestreo | Contexto de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Viggle-Image-Swap | LoRA de edición (character swap) | Qwen-Image-2.1 | 6 (o 2+6 en modo turbo) | 1 MP por imagen; hojas de personaje 1536×1024 | qwen-research | Hugging Face, diffusers |
| Qwen/Qwen-Image-2.1 | Modelo de difusión base texto-a-imagen | — | no disponible | no disponible | no disponible en la información | Hugging Face |
| Qwen/Qwen-Image-2.1-Turbo | Variante acelerada del base | Qwen-Image-2.1 | no disponible (usado para 6 pasos finales) | no disponible | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de otros adaptadores de sustitución de personajes comparables en la información proporcionada.

## Limitaciones y advertencias

- Requiere el modelo base Qwen-Image-2.1 y una versión concreta de diffusers (commit fijado); no funciona como modelo autónomo.
- No admite una foto suelta como referencia de personaje: es obligatoria una character sheet en el formato descrito (o una hoja con la foto facial pegada en la celda de retrato).
- La salida está limitada a 1 MP con lados múltiplos de 32; las imágenes de entrada se reducen a 1 MP, lo que puede perder detalle en fuentes de alta resolución.
- El control de posiciones se basa en el texto del prompt (`on the left`, `2nd from the left`, etc.), lo que puede fallar en escenas con muchas personas u oclusiones.
- Licencia `qwen-research`: restringe el uso comercial; es imprescindible revisar el archivo LICENSE antes de cualquier despliegue en producción.
- No se documentan sesgos, tasas de alucinación ni comportamiento multilingüe; el prompt de ejemplo está en inglés.
- Riesgo de uso indebido: la sustitución de identidades en imágenes puede vulnerar derechos de imagen y privacidad; requiere consentimiento y controles de uso.
- No se han publicado métricas de calidad (fidelidad de identidad, preservación de fondo, etc.) que permitan cuantificar el rendimiento frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Viggle/Viggle-Image-Swap
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Variante turbo del base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Vídeo de ejemplo: https://huggingface.co/Viggle/Viggle-Image-Swap/resolve/main/examples/viggle-image-swap.mp4
- Script de inferencia: `inference/swap.py` (incluido en el repositorio)
- Commit de diffusers requerido: https://github.com/huggingface/diffusers/commit/80c7ed262aeffbeb43ef13ae04baeb9b84515a69
- Sitio del autor: https://viggle.ai/
- Herramientas del autor: https://viggle.ai/tools
