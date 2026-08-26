# SwagMessiah100/H3_Character_Sheet_Generator

## Resumen

H3_Character_Sheet_Generator es un workflow de ComfyUI desarrollado por SwagMessiah100 (aunque la model card original proviene de PoopMan333) que aprovecha el modelo de video MiniMax-H3 para generar hojas de referencia de personaje con múltiples ángulos a partir de hasta 9 imágenes de entrada. La técnica central consiste en usar la generación de video de MiniMax-H3, que mantiene consistencia frame a frame, para crear una rotación de 360 grados del personaje y luego extraer 4 o 6 fotogramas que se combinan en una hoja de referencia. Resuelve el problema clásico de que las imágenes generadas por separado de un mismo personaje no coinciden en rasgos, ropa o colores, al garantizar que todos los frames provienen de la misma pasada de generación.

El workflow se distribuye como dos archivos JSON que se cargan en ComfyUI, con todos los enlaces de descarga de modelos integrados. Los modelos requeridos incluyen el difusor `minimax_h3_ref2va_pruned_int8_convrot.safetensors`, el text encoder `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` (32B), un VAE de video y un VAE de audio, además de un LoRA turbo opcional. La licencia es `minimax-h3-community-license`, que permite uso comercial según los términos de MiniMax. El repositorio no contiene pesos propios, sino solo los workflows y ejemplos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Workflow de ComfyUI basado en el modelo de video MiniMax-H3 (no se detalla la arquitectura interna) |
| Parametros totales | No disponible (el text encoder es de 32B; el difusor no tiene cifras publicadas) |
| Parametros activos | No aplicable |
| Longitud de contexto | No disponible (modelo de imagen/video, no texto) |
| Tipos de cuantizacion | INT8 (para difusión, text encoder y VAE de video); FP32 para VAE de audio; BF16 para el LoRA turbo |
| Idiomas soportados | No disponibles (el text encoder es Qwen3-VL, que soporta múltiples idiomas, pero no se especifica en la model card) |
| Licencia | minimax-h3-community-license |
| Formato de pesos | safetensors (modelos) y JSON (workflow) |

## Arquitectura y entrenamiento

El workflow se apoya en MiniMax-H3, un modelo de video que genera secuencias de frames con consistencia temporal. MiniMax-H3 está diseñado para mantener la identidad visual de un sujeto a lo largo de una secuencia, lo que lo hace idóneo para generar múltiples vistas de un mismo personaje sin que los detalles se desincronizan. El workflow aprovecha esta propiedad al generar un video de giro lento de la cámara, sin cortes duros, y luego extraer fotogramas específicos. No hay información pública sobre el entrenamiento del modelo MiniMax-H3 (número de tokens, dataset, técnicas de alineación) en la documentación disponible.

El flujo de trabajo requiere dos prompts: el A Prompt describe qué tomar de cada imagen de entrada (con instrucciones explícitas de qué ignorar), y el B Prompt controla el giro, la pose y la iluminación. Se recomienda describir la ropa en palabras para evitar que se desvíe, y el modelo permite combinar hasta 9 imágenes, por ejemplo, tomar la cara de una, la armadura de otra, y el escudo de una tercera.

## Capacidades

- Genera hojas de referencia de personaje con 4 o 6 vistas (frontal, lateral, trasera, y primeros planos de cara) en un solo pase.
- Acepta hasta 9 imágenes de referencia para construir un personaje combinando partes de diferentes fuentes.
- Mantiene consistencia entre los frames gracias a la generación de video, evitando cambios de jaw, color o ropa entre vistas.
- Permite controlar qué elementos se conservan de cada imagen mediante el prompt A, incluyendo instrucciones de ignorar.
- Ofrece salidas adicionales: video de giro completo de 360 grados y cada frame individual como imagen.
- Soporta conversión de anime a realista (anime-to-real) con un prompt B modificado.
- Funciona también con objetos, aunque se recomienda proporcionar más ángulos de referencia para mejor resultado.
- Se integra en ComfyUI con carga automática de modelos y nodos personalizados opcionales (KJNodes, rgthree) para acelerar.

## Casos de uso

- Diseño de personajes para animación: el artista puede generar una hoja de modelo consistente (frontal, perfil, trasero) para entregar al equipo de animación, reduciendo el tiempo de diseño de referencia.
- Desarrollo de personajes para videojuegos: permite crear la hoja de referencia para modeladores 3D, asegurando que todas las vistas del personaje coincidan en rasgos y vestimenta.
- Creación de personajes para cómics: se puede usar para mantener la consistencia visual del protagonista a lo largo de las páginas, generando una hoja de referencia que luego se usa en cada viñeta.
- Ilustración de productos y objetos: diseñadores de productos pueden generar hojas de referencia de un objeto (por ejemplo, un escudo) con múltiples vistas para documentación técnica o catálogos.
- Conversión de personajes anime a realistas: para estudios que quieran adaptar un personaje de anime a un estilo fotorrealista, el workflow genera una hoja de referencia realista con el mismo personaje.
- Generación de bases para modelado 3D: los artistas 3D pueden usar los frames individuales como referencia de topología y proporciones para esculpir en ZBrush o Blender.
- Consistencia en producciones con múltiples artistas: al compartir la hoja generada, todos los miembros del equipo trabajan con la misma referencia, evitando divergencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos mínimos en la documentación del workflow.
- Los modelos incluidos son versiones INT8 de baja VRAM, lo que sugiere que pueden ejecutarse en GPUs con menos memoria que las versiones de alta precisión, pero el text encoder de 32B (Qwen3-VL) sigue siendo grande y probablemente requiera al menos 24 GB de VRAM para una inferencia cómoda.
- El workflow está diseñado para ComfyUI, por lo que se puede ejecutar en GPU NVIDIA (CUDA) o AMD (ROCm) con soporte para PyTorch.
- La generación de 124 frames (para 6 paneles) implica una carga computacional considerable; se recomienda una GPU con al menos 24 GB de VRAM (RTX 4090, A100, H100) para tiempos razonables.
- No se dispone de datos de latencia ni throughput publicados.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Consistencia | Licencia |
|---|---|---|---|---|---|
| H3_Character_Sheet_Generator | Workflow sobre MiniMax-H3 | Hasta 9 imágenes | Hoja de 4 o 6 paneles + video | Alta (mismo pase de video) | minimax-h3-community-license |
| CharacterGen (charactergen.app) | Herramienta web | Foto o texto | Hoja de modelo con turnarounds y expresiones | No especificada | Propietaria |
| OpenCreator (template-character-model-sheet) | Herramienta web | Texto o imagen | Hoja de modelo multiángulo | No especificada | Propietaria |
| LimeAILab (AI Model Sheet Generator) | Herramienta web | Foto o prompt | Hoja de referencia con múltiples vistas | No especificada | Propietaria |

## Limitaciones y advertencias

- El proceso es lento: se generan 124 frames para usar 6, lo que implica tiempos de espera largos.
- No hay control fino sobre la pose exacta de cada panel; el giro es automático y puede no producir el ángulo deseado si el prompt B no está bien ajustado.
- El modelo puede tener sesgos en la representación de ciertos estilos o etnias, aunque no hay documentación al respecto.
- La generación depende en gran medida de la calidad de los prompts A y B; si no se especifica qué ignorar, elementos no deseados (fondo, pelo, accesorios) pueden aparecer en la hoja.
- La licencia `minimax-h3-community-license` permite uso comercial, pero es responsabilidad del usuario revisar los términos completos del enlace proporcionado.
- El workflow requiere ComfyUI y sus dependencias; no es un modelo autónomo, sino un conjunto de nodos.
- No hay soporte técnico oficial; el autor ofrece el workflow sin garantías.

## Enlaces

- [HuggingFace - SwagMessiah100/H3_Character_Sheet_Generator](https://huggingface.co/SwagMessiah100/H3_Character_Sheet_Generator)
- [Model card original (PoopMan333)](https://huggingface.co/PoopMan333/H3_Character_Sheet_Generator) (mirror en AtomGit)
- [Licencia MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI)
- [KJNodes](https://github.com/kijai/ComfyUI-KJNodes)
- [rgthree](https://github.com/rgthree/rgthree-comfy)
