# unsloth/flux-3-image-klein-FP8

## Resumen

FLUX 3 Image Klein es un modelo de difusión de 5.548.681.984 parámetros (5,6B) desarrollado por Black Forest Labs para generación de imágenes a partir de texto y edición de imágenes. Acepta un prompt y hasta 10 imágenes de referencia, y devuelve una única imagen. Text-to-image, edición con una referencia y composición multi-referencia se ejecutan a través del mismo modelo, usando Qwen3-VL-4B-Instruct como codificador de texto. La etiqueta de 5,6B se refiere únicamente al transformer de imagen; el codificador de texto es un componente separado.

Esta ficha describe la versión cuantizada publicada por Unsloth (`unsloth/flux-3-image-klein-FP8`), que empaqueta el checkpoint destilado de 16 pasos en FP8 e INT8. El transformer pasa de 11,1 GB en bf16 a 6,44 GB, con una degradación medida frente al original de LPIPS 0,036 (FP8) y 0,035 (INT8) y SSIM de 0,948 y 0,946 respectivamente. El repositorio incluye además el codificador de texto cuantizado y las carpetas upstream de diffusers, de modo que Unsloth Desktop descarga todos los componentes desde un único lugar.

Su relevancia actual es doble: por un lado, es una de las primeras versiones cuantizadas de FLUX 3 disponibles públicamente, con métricas de fidelidad publicadas; por otro, reduce el peso del transformer lo suficiente para acercar la inferencia a GPUs de consumo alto, manteniendo el pipeline de edición multi-referencia y el control por bounding boxes del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (transformer de imagen) con codificador de texto Qwen3-VL-4B-Instruct y VAE bf16 |
| Parametros totales | 5.548.681.984 (transformer de imagen; el codificador de texto es adicional) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 e4m3 (escala por fila, activación dinámica por token); INT8 (peso por fila, activación dinámica por token); codificador de texto INT8 con rotación ConvRot y FP8 e4m3 layerwise |
| Idiomas soportados | en |
| Licencia | flux-kommunity-license (FLUX Kommunity License) |
| Formato de pesos | safetensors (diffusers, single-file) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión de 5,6B parámetros para generación y edición de imágenes, distribuido como checkpoint destilado de 16 pasos sin guidance (frente a los 50 pasos y guidance 3,5 del checkpoint Base no destilado). El pipeline combina el transformer de imagen con un codificador de texto Qwen3-VL-4B-Instruct y un autoencoder de imagen que permanece en bf16. La edición con referencias múltiples y la generación text-to-image comparten los mismos pesos.

La cuantización de Unsloth aplica FP8 e4m3 con escala de peso por fila y activación dinámica por token, o bien INT8 con peso por fila y activación dinámica por token. El codificador de texto dispone de una variante INT8 weight-only con rotación ConvRot (embedding y vision tower en bf16) y otra FP8 e4m3 con cast layerwise. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El repositorio conserva las carpetas upstream de diffusers (`modular_model_index.json`, `text_encoder/`, `transformer/`, `vae/`) sin modificar.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con un único modelo.
- Edición de imágenes con una sola referencia (single-reference editing).
- Composición multi-referencia con hasta 10 imágenes de entrada.
- Control de colocación mediante bounding boxes en el prompt, sobre una rejilla de 0 a 1000: permite recolocar, recolorear, sustituir o eliminar elementos. Las cajas guían posición y escala, no imponen una máscara dura de píxeles.
- Renderizado de texto dentro de las imágenes generadas.
- Codificación de texto multilingüe heredada de Qwen3-VL-4B-Instruct, aunque el modelo declara únicamente inglés (`en`) como idioma soportado.
- No se documentan en la información disponible capacidades de tool calling, agentes ni modos de razonamiento multi-paso.

## Casos de uso

- Generación de ilustraciones para producto: el modelo produce imágenes a 1024 px con el transformer FP8 o INT8, adecuado para prototipado rápido de conceptos visuales sin depender de APIs externas.
- Edición de fotografías de catálogo: con una imagen de referencia y un prompt de edición se pueden recolorear, mover o sustituir elementos, lo que encaja en flujos de retoque por lotes.
- Composición multi-referencia para marketing: combinar hasta 10 imágenes de referencia permite generar escenas donde varios productos o personajes aparecen juntos, manteniendo coherencia entre referencias.
- Diseño con control espacial: los bounding boxes en la rejilla 0-1000 permiten especificar la posición y escala de elementos en la imagen, útil para maquetas y wireframes visuales.
- Generación de imágenes con texto integrado: el renderizado de texto dentro de la imagen sirve para carteles, etiquetas y mockups donde el texto forma parte del resultado.
- Autoalojamiento con recursos limitados: la versión FP8/INT8 reduce el transformer a 6,44 GB, lo que permite desplegar el pipeline en una GPU de consumo alto en lugar de requerir el checkpoint bf16 de 11,1 GB.
- Investigación y evaluación de cuantización: las métricas LPIPS y SSIM publicadas frente al bf16 permiten comparar esquemas de cuantización en tareas de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card sí incluye métricas de fidelidad de la cuantización frente al modelo bf16:

| Fichero | Tamano | Esquema | LPIPS (alex) vs bf16, media / max | SSIM vs bf16 |
|---|---|---|---|---|
| `flux-3-image-klein-FP8.safetensors` | 6,44 GB | FP8 e4m3, escala por fila, activación dinámica por token | 0,036 / 0,220 | 0,948 |
| `flux-3-image-klein-INT8.safetensors` | 6,44 GB | INT8 peso por fila, activación dinámica por token | 0,035 / 0,248 | 0,946 |
| `flux-3-image-klein-text_encoder-INT8-ConvRot.safetensors` | 5,25 GB | Codificador de texto INT8 weight-only con ConvRot; embedding y vision tower bf16 | 0,017 / 0,098 | 0,974 |
| `flux-3-image-klein-text_encoder-FP8.safetensors` | 5,61 GB | Codificador de texto FP8 e4m3 layerwise | 0,038 / 0,220 | 0,945 |

Las filas del codificador de texto se evalúan contra el codificador bf16 con el transformer bf16, por lo que miden solo el encoder. El VAE permanece en bf16.

## Requisitos de hardware

- VRAM estimada: el transformer cuantizado ocupa 6,44 GB en disco; el codificador de texto INT8 ConvRot ocupa 5,25 GB y el FP8 5,61 GB. El VAE se mantiene en bf16. La VRAM total de inferencia debe sumar transformer, codificador de texto, VAE y activaciones, pero no se publica una cifra agregada en la información disponible.
- GPU recomendadas: no se especifican modelos concretos en la información proporcionada.
- GPU de consumo: la reducción del transformer de 11,1 GB a 6,44 GB acerca el modelo a GPUs de consumo de gama alta, pero no se confirma en la información disponible qué tarjetas concretas lo ejecutan.
- Opciones de despliegue: diffusers (librería declarada) y Unsloth Desktop, que carga los pesos pre-cuantizados y evita la descarga en bf16 y la cuantización al vuelo. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein FP8/INT8 (esta ficha) | 5,6B (transformer) | no disponible | LPIPS 0,035-0,036 vs bf16; SSIM 0,946-0,948 | flux-kommunity-license | Hugging Face, diffusers, Unsloth Desktop |
| FLUX 3 Image Klein bf16 (upstream) | 5,6B (transformer) | no disponible | referencia bf16 | flux-kommunity-license | Hugging Face |
| FLUX 3 Image Klein Base | 5,6B (transformer) | no disponible | no disponible | flux-kommunity-license | Hugging Face |
| FLUX 3 Image Klein NVFP4 | 5,6B (transformer) | no disponible | no disponible | flux-kommunity-license | Hugging Face (variante nvfp4) |

No se dispone en la información proporcionada de comparaciones con modelos de otras familias (por ejemplo, otros generadores text-to-image de tamaño similar), por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Alucinación: no se documenta una evaluación específica de fidelidad semántica o de alucinación visual; las métricas publicadas miden solo la diferencia perceptual frente al bf16 (LPIPS, SSIM), no la corrección del contenido.
- Idioma: el modelo declara únicamente inglés (`en`) como idioma soportado, aunque el codificador de texto Qwen3-VL-4B-Instruct es multilingüe.
- Contexto: no se especifica longitud de contexto ni resolución máxima más allá de los ejemplos a 1024 px.
- Licencia: la FLUX Kommunity License permite uso no comercial y ofrece una excepción de output comercial para Qualifying Users sujeta a sus términos; es necesario revisar `LICENSE.md` antes de un uso en producción.
- Producción: el checkpoint destilado está pensado para generación y edición; para fine-tuning, LoRA y research debe usarse FLUX 3 Image Klein Base. La cuantización introduce degradación medible (LPIPS máximo de 0,220 en FP8 y 0,248 en INT8), relevante en flujos donde la fidelidad píxel a píxel sea crítica.
- Componentes: el repositorio cuantizado no sustituye al codificador de texto ni al VAE originales; deben tomarse de `black-forest-labs/flux-3-image-klein` si no se usa Unsloth Desktop.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/unsloth/flux-3-image-klein-FP8
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Checkpoint Base para fine-tuning: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Variante FP8 upstream: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/fp8r
- Variante NVFP4 upstream: https://huggingface.co/black-forest-labs/flux-3-image-klein/tree/main/variants/nvfp4
- Código de inferencia y formato de bounding boxes: https://github.com/black-forest-labs/flux-3-image-klein
- Unsloth: https://github.com/unslothai/unsloth/
- Documentación de Unsloth: https://docs.unsloth.ai/
- Discord de Unsloth: https://discord.gg/unsloth
- Licencia: https://huggingface.co/unsloth/flux-3-image-klein-FP8/blob/main/LICENSE.md
