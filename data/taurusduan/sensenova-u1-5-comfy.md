# taurusduan/SenseNova-U1.5-Comfy

## Resumen

SenseNova-U1.5-Comfy es una versión comunitaria reempaquetada de los pesos oficiales de SenseNova-U1.5-8B-MoT (variantes Final y SFT) en un único archivo `safetensors` por variante, pensada para su uso directo en ComfyUI. El autor, taurusduan, no ha modificado los pesos: solo ha consolidado los fragmentos oficiales en un solo archivo para simplificar la descarga y gestión. El modelo base, desarrollado por SenseTime, es un modelo multimodal nativo de 8B parámetros que unifica comprensión, razonamiento y generación de imagen en una arquitectura monolítica denominada NEO-Unify, sin depender de adaptadores entre modalidades.

La relevancia de esta versión radica en que permite a los usuarios de ComfyUI acceder a las capacidades de SenseNova U1.5 —generación de texto a imagen, edición con una o múltiples referencias (hasta 10), y generación de texto denso legible en imágenes— sin necesidad de manejar múltiples archivos de pesos ni configuraciones complejas. El repositorio incluye también un LoRA oficial de 8 pasos para generación rápida, y requiere el nodo específico "SenseNova U1.5 (T8)" para funcionar. La licencia es Apache 2.0, lo que permite uso comercial, y los idiomas soportados son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NEO-Unify (multimodal monolítica, unifica comprensión y generación) |
| Parametros totales | 8B (según nombre del modelo base, no confirmado oficialmente) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16/fp32) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (un archivo por variante: Final y SFT) |

## Arquitectura y entrenamiento

El modelo base SenseNova-U1.5-8B-MoT emplea la arquitectura NEO-Unify, descrita en el repositorio oficial de OpenSenseNova como un enfoque que integra comprensión, razonamiento y generación multimodal en un único modelo monolítico, en lugar de usar adaptadores para traducir entre modalidades. Esto permite que el modelo "piense y actúe" a través de lenguaje y visión de forma unificada. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la información proporcionada.

La versión aquí descrita es un reempaquetado comunitario: los pesos oficiales de las variantes Final y SFT se han consolidado en archivos `safetensors` individuales sin entrenamiento, fine-tuning ni cuantización adicional. El repositorio también incluye un LoRA oficial de 8 pasos (solo compatible con la variante Final) para acelerar la generación de texto a imagen. El nodo de ComfyUI asociado gestiona la carga y ofrece opciones como `img_cfg` para control de guiado por imagen, CFG Norm y rangos de CFG efectivos.

## Capacidades

- Generación de texto a imagen (text-to-image) con resolución de hasta 2048×2048 píxeles (y 4K según noticias del modelo Preview).
- Edición de imagen con una sola imagen de referencia o múltiples referencias (de 1 a 10), donde cada referencia se etiqueta como `Image-1`, `Image-2`, etc., y su función se especifica en el prompt.
- Generación de 1 a 16 resultados diferentes a partir del mismo prompt y referencias, usando ruido aleatorio independiente por resultado.
- Generación de texto denso y legible dentro de las imágenes (títulos, subtítulos, listas, instrucciones), como se muestra en los ejemplos de infografías de recetas en chino.
- Soporte para 50 pasos de muestreo (variantes Final y SFT) y 8 pasos con el LoRA oficial (solo Final).
- Control fino de la generación mediante parámetros como CFG, `img_cfg`, CFG Norm, rango de CFG efectivo y `shift`.
- Compatibilidad con el `KSampler` nativo de ComfyUI para casos con `img_cfg=1`; para otros valores requiere `SamplerCustomAdvanced` y el nodo `SenseNova Edit Guider`.
- Capacidades multilingües limitadas a inglés y chino.

## Casos de uso

- Creación de carteles e infografías con texto denso: el modelo puede generar composiciones completas con títulos, subtítulos, listas de ingredientes y pasos numerados, como se muestra en los ejemplos de recetas de pollo frito. Es adecuado para marketing, educación y contenido editorial.
- Edición de imágenes con referencia de estilo y sujeto: usando dos imágenes de referencia, una para el estilo (por ejemplo, un diseño de agenda) y otra para el sujeto (por ejemplo, un plato de comida), el modelo combina ambas en una nueva imagen coherente. Útil para diseñadores que necesitan variaciones rápidas.
- Cambio de vestimenta en fotos de personas: con `Image-1` como la persona y `Image-2` como la prenda, el modelo genera una imagen de la persona vistiendo la ropa indicada. Aplicable en moda, e-commerce y pruebas de producto.
- Generación de variaciones de diseño: a partir de un prompt y una referencia, se pueden generar hasta 16 resultados distintos, lo que permite explorar alternativas de diseño en una sola ejecución. Útil en brainstorming visual.
- Prototipado rápido de contenido visual para redes sociales: el modelo genera imágenes de alta resolución (2048×2048) con texto integrado, reduciendo el tiempo de producción de gráficos para publicaciones.
- Edición multi-referencia en producción: con hasta 10 imágenes de referencia, se pueden combinar múltiples elementos (estilo, color, composición, objetos) en una sola imagen, lo que facilita la creación de collages o composiciones complejas sin herramientas de edición manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas comparativas (MMLU, HumanEval, etc.) ni evaluaciones cuantitativas de calidad de imagen. Los únicos datos de rendimiento son ejemplos cualitativos de generación a 2048×2048 con 50 pasos y 8 pasos, sin métricas objetivas.

## Requisitos de hardware

- Tamaño del repositorio: 86.1 GB, lo que sugiere que cada archivo `safetensors` (Final y SFT) ocupa varias decenas de gigabytes. Para un modelo de 8B en fp16, el peso típico es ~16 GB; en fp32, ~32 GB. No se confirma el formato exacto.
- VRAM estimada para inferencia: no disponible. Dado el tamaño de los archivos, se recomienda al menos 24 GB de VRAM para carga completa en fp16, aunque no hay datos oficiales.
- GPU recomendadas: no disponible. Modelos de gama alta como RTX 4090, A100 o H100 serían adecuados, pero no se especifica.
- Opciones de despliegue: exclusivamente ComfyUI con el nodo "SenseNova U1.5 (T8)" (versión 1.3.3 o superior). No se menciona soporte para vLLM, llama.cpp u otros frameworks.
- Latencia y throughput: no disponible. Los ejemplos muestran generación a 50 pasos y 8 pasos, pero sin tiempos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con modelos similares. El modelo base SenseNova-U1.5-8B-MoT se posiciona como un modelo multimodal unificado, pero no se han encontrado datos comparativos con alternativas como SDXL, Flux o modelos de edición como InstructPix2Pix. La versión comunitaria aquí descrita no aporta métricas propias. Se recomienda consultar el repositorio oficial de OpenSenseNova para posibles comparativas.

## Limitaciones y advertencias

- Es una versión comunitaria no oficial: el reempaquetado no está respaldado por SenseTime, y puede haber diferencias de comportamiento respecto a los pesos oficiales.
- Requiere el nodo específico de ComfyUI (SenseNova U1.5 T8) y no es compatible con cargadores estándar de SD/SDXL ni con Diffusers.
- Pueden aparecer errores de carga (`checkpoint key mismatch`) si se usa una versión antigua del nodo o si hay múltiples copias del mismo en `custom_nodes`. Se recomienda usar la versión 1.3.3 o superior.
- El texto pequeño dentro de las imágenes puede presentar errores de ortografía o solapamiento, como se admite en los ejemplos del autor ("local small text still has typos and overlap").
- El LoRA de 8 pasos solo es compatible con la variante Final; usarlo con SFT o Preview produce errores.
- Los idiomas soportados se limitan a inglés y chino; no se garantiza un buen rendimiento en otros idiomas.
- No se han publicado benchmarks ni evaluaciones de sesgos o alucinaciones visuales; el uso en producción requiere validación adicional.
- El tamaño del repositorio (86.1 GB) implica un consumo significativo de almacenamiento y ancho de banda para la descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/taurusduan/SenseNova-U1.5-Comfy
- Nodo ComfyUI (GitHub): https://github.com/T8mars/Comfyui-SenseNova-U1.5-Wrapper-T8
- Nodo en Comfy Registry: https://registry.comfy.org/nodes/sensenova-u15-t8
- Repositorio oficial de SenseNova-U1 (OpenSenseNova): https://github.com/OpenSenseNova/SenseNova-U1
- Noticia sobre SenseNova-U1.5 en ComfyUI: https://comfyui-wiki.com/en/news/2026-08-16-sensenova-u1-5-comfyui
- Noticia sobre SenseNova-U1.5 Preview: https://comfyui-wiki.com/en/news/2026-07-31-sensenova-u1-5-preview
- Paper (referenciado en tags, no verificado): arxiv:2605.12500
