# unsloth/flux-3-image-klein-base-FP8

## Resumen

FLUX 3 Image Klein Base es un modelo de difusión de 5.538.458.368 parámetros (5,6B) desarrollado por Black Forest Labs para generación de imágenes a partir de texto y edición de imágenes. Acepta un prompt y hasta 10 imágenes de referencia, y devuelve una sola imagen. Texto-a-imagen, edición con una referencia y composición con múltiples referencias se ejecutan a través del mismo modelo, con Qwen3-VL-4B-Instruct como codificador de texto (componente separado del transformer de imágenes).

Esta ficha concreta corresponde a la versión cuantizada publicada por Unsloth: `unsloth/flux-3-image-klein-base-FP8`. Incluye el transformer en FP8 (6,42 GB) y en INT8 (5,81 GB), además de variantes cuantizadas del codificador de texto, reduciendo el peso del transformer desde los 11,1 GB del checkpoint bf16. El checkpoint base es la versión no destilada (50 pasos con CFG 3.5), pensada para fine-tuning, entrenamiento de LoRA e investigación, a diferencia del checkpoint destilado `flux-3-image-klein`.

La relevancia actual reside en que permite ejecutar un modelo de generación y edición de imágenes de última generación con una huella de memoria notablemente menor y una degradación perceptual muy contenida (LPIPS de 0,022 en INT8 y 0,036 en FP8 frente al bf16), lo que facilita su despliegue en hardware más modesto sin renunciar a la calidad del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (transformer de imágenes) con codificador de texto Qwen3-VL-4B-Instruct y autoencoder de imágenes (VAE) |
| Parametros totales | 5.538.458.368 (transformer de imágenes; el codificador de texto es un componente separado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 e4m3 (escala de pesos por fila, activación dinámica por token); INT8 con rotación ConvRot (pesos INT8 por canal, activación dinámica por token); codificador de texto en INT8 ConvRot y FP8; VAE en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | flux-kommunity-license (licencia comunitaria de FLUX) |
| Formato de pesos | safetensors (diffusers, single-file); incluye carpetas upstream `text_encoder/`, `transformer/`, `vae/` y `modular_model_index.json` |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión para imágenes de 5,6B parámetros que comparte un único pipeline para texto-a-imagen, edición con una referencia y composición con múltiples referencias (hasta 10 imágenes de entrada). El codificador de texto es Qwen3-VL-4B-Instruct, un modelo multimodal que aporta comprensión tanto de texto como de imágenes de referencia, y el decodificador final es un autoencoder de imágenes (VAE) que se mantiene en bf16 en esta distribución cuantizada.

El checkpoint de este repositorio es la variante base no destilada, configurada para 50 pasos de inferencia con CFG 3.5, y está orientada a fine-tuning, entrenamiento de LoRA e investigación. No se dispone en la información proporcionada de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de esta distribución es la cuantización: el transformer FP8 emplea escala de pesos por fila y activación dinámica por token; el INT8 usa la variante `int8_convrot` de Black Forest Labs con rotación ConvRot; y las variantes del codificador de texto aplican cuantización weight-only con torre de visión y embeddings en bf16.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con captions de escena completos.
- Edición de imágenes con una única imagen de referencia (image-to-image).
- Composición con múltiples referencias, hasta 10 imágenes de entrada.
- Control de disposición mediante cajas delimitadoras (bounding box format) para layout.
- Renderizado de texto en imágenes (el ejemplo de la model card incluye un cartel con la palabra "UNSLOTH").
- Comprensión multimodal de las referencias gracias al codificador Qwen3-VL-4B-Instruct.
- Inferencia con menor huella de memoria gracias a las variantes FP8 e INT8 del transformer y del codificador de texto.
- Integración con Unsloth Desktop y con el ecosistema diffusers.

## Casos de uso

- Generación de ilustraciones conceptuales para prototipado de producto: el modelo transforma captions de escena detallados en imágenes con alto nivel de detalle, útil para explorar direcciones visuales antes de producir assets finales.
- Edición de imágenes con referencia única: a partir de una foto base y una instrucción, se pueden aplicar cambios de estilo o de contenido manteniendo la coherencia con la referencia, gracias al pipeline image-to-image.
- Composiciones multi-referencia para marketing: combinar hasta 10 imágenes de referencia permite generar escenas coherentes con varios productos o personajes, adecuado para catálogos y campañas.
- Maquetación controlada con cajas delimitadoras: el soporte de bounding boxes facilita generar layouts con posiciones definidas de elementos, útil en diseño editorial y generación de banners.
- Renderizado de texto en carteles y rótulos: la capacidad demostrada de generar texto legible en la imagen permite crear señalética, carteles y mockups de packaging.
- Fine-tuning y entrenamiento de LoRA: al ser el checkpoint base no destilado, es la opción adecuada para adaptar el modelo a dominios específicos (estilo de marca, producto, ilustración técnica) mediante entrenamiento.
- Despliegue en entornos con VRAM limitada: las variantes INT8 (5,81 GB) y FP8 (6,42 GB) del transformer, frente a los 11,1 GB del bf16, permiten ejecutar el modelo en GPUs de gama alta de consumo con cuantización adicional del codificador de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de generación (FID, CLIP score, etc.) en la información disponible. La model card sí aporta métricas de fidelidad de la cuantización frente al modelo bf16:

| Fichero | Tamano | Esquema | LPIPS (alex) vs bf16, media / max | SSIM vs bf16 |
|---|---|---|---|---|
| `flux-3-image-klein-base-FP8.safetensors` | 6,42 GB | FP8 e4m3, escala por fila, activación dinámica por token | 0,036 / 0,174 | 0,951 |
| `flux-3-image-klein-base-INT8.safetensors` | 5,81 GB | INT8 ConvRot de Black Forest Labs | 0,022 / 0,175 | 0,972 |
| `flux-3-image-klein-base-text_encoder-INT8-ConvRot.safetensors` | 5,25 GB | INT8 weight-only con ConvRot, embeddings y torre de visión en bf16 | 0,023 / 0,121 | 0,973 |
| `flux-3-image-klein-base-text_encoder-FP8.safetensors` | 5,61 GB | FP8 e4m3, cast por capas | 0,035 / 0,132 | 0,960 |

Las filas del codificador de texto se evalúan contra el codificador bf16 con el transformer bf16, por lo que miden únicamente el efecto del codificador. El VAE permanece en bf16.

## Requisitos de hardware

- Transformer en bf16: 11,1 GB de pesos; en FP8: 6,42 GB; en INT8: 5,81 GB.
- Codificador de texto cuantizado: 5,25 GB (INT8 ConvRot) o 5,61 GB (FP8), frente a su versión bf16.
- El VAE se mantiene en bf16 y debe sumarse a la huella total de memoria.
- La información disponible no especifica GPUs concretas recomendadas (A100, H100, RTX 4090, etc.) ni VRAM total estimada para el pipeline completo; no disponible.
- Opciones de despliegue documentadas: Unsloth Desktop (carga los ficheros de este repositorio, incluidos los componentes upstream) y diffusers (formato single-file y carpetas diffusers). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de difusión.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Image Klein Base (este, cuantizado por Unsloth) | 5,6B | No disponible | LPIPS 0,022 (INT8) / 0,036 (FP8) vs bf16 | flux-kommunity-license | Hugging Face, diffusers, Unsloth Desktop |
| FLUX 3 Image Klein (destilado) | 5,6B | No disponible | No disponible | flux-kommunity-license | Hugging Face (black-forest-labs/flux-3-image-klein) |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (parámetros, contexto, rendimiento o licencia), por lo que la comparativa se limita a las dos variantes de FLUX 3 Image Klein documentadas.

## Limitaciones y advertencias

- El modelo solo soporta inglés según la model card; los prompts en otros idiomas pueden degradar la calidad.
- Requiere obligatoriamente un amplificador de prompt (prompt upsampler): con prompts cortos tal cual se escriben, la salida es genérica. Se recomienda `flux-3-image-klein-pup` o cualquier LLM con un system prompt que expanda la petición a un caption de escena completo. Diffusers no lo aplica por sí solo.
- Es el checkpoint base no destilado: requiere 50 pasos con CFG 3.5, lo que implica mayor coste de inferencia que la variante destilada.
- La cuantización introduce una degradación perceptual medible (LPIPS máximo de 0,174-0,175 en los peores casos), relevante en aplicaciones donde la fidelidad absoluta al bf16 sea crítica.
- La licencia `flux-kommunity-license` impone restricciones de uso que deben revisarse antes de un despliegue comercial; no es una licencia de código abierto permisiva.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación visual en la documentación proporcionada.
- El repositorio ocupa 49,8 GB e incluye múltiples variantes y componentes; conviene descargar solo los ficheros necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unsloth/flux-3-image-klein-base-FP8
- Modelo base original: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Checkpoint destilado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Variante Comfy (origen del INT8 ConvRot): https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Amplificador de prompt: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del amplificador: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Código de inferencia y formato de bounding boxes: https://github.com/black-forest-labs/flux-3-image-klein
- Unsloth (GitHub): https://github.com/unslothai/unsloth/
- Documentación de Unsloth: https://docs.unsloth.ai/
- Discord de Unsloth: https://discord.gg/unsloth
- Variantes FP8 del modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/fp8r
- Variantes NVFP4 del modelo base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/nvfp4
