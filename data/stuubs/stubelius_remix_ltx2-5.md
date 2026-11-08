# Stuubs/Stubelius_Remix_Ltx2.5

## Resumen

Stubelius Remix LTX 2.5 es un ajuste fino (merge más fine-tune por refuerzo) del modelo de generación de vídeo con audio Lightricks LTX-2.5, publicado por el usuario Stuubs en Hugging Face. No es un modelo de lenguaje: es un modelo de difusión para texto-a-vídeo e imagen-a-vídeo con pista de audio sincronizada, con 21.004.025.600 parámetros (unos 21B) y distribuido principalmente en cuantizaciones int8, bf16, NVFP4 y GGUF Q4_K_S para su uso en ComfyUI.

El modelo está orientado, según su propia model card, principalmente a contenido NSFW, aunque puede generar material SFW si se especifica el vestuario en el prompt. La versión v1 (7 de octubre de 2026) incorpora el fine-tune por refuerzo OmniNFT, que premia la calidad de vídeo y audio, fusionado a la intensidad de entrenamiento, además de un LoRA destilado ya integrado en los pesos. Respecto a beta 2, el autor reporta un aumento del 55 % en detalle fino y del 15 % en movimiento, con prompt following y diálogo sin cambios.

Su relevancia actual radica en que ofrece una alternativa comunitaria cuantizada y optimizada para ComfyUI de un modelo de vídeo-audio de 21B, con opciones que van desde 12,5 GB (GGUF Q4) hasta 42 GB (bf16), lo que permite desplegarlo en GPUs de consumo con compromisos de VRAM. La licencia es la LTX-2.x Community License Agreement, con restricciones de uso y obligación de licencia comercial para empresas con ingresos anuales superiores a 10 millones de dólares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para vídeo y audio (derivado de Lightricks LTX-2.5); detalles de bloques no disponibles |
| Parametros totales | 21.004.025.600 (≈21B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de generación de vídeo, no de texto) |
| Tipos de cuantizacion | int8 (convrot), bf16, NVFP4 (experimental), GGUF Q4_K_S (experimental) |
| Idiomas soportados | No disponible (el prompt se procesa mediante el text encoder Gemma 4 12B con proyección LTX 2.5) |
| Licencia | ltx-2-community-license-agreement (LTX-2.x Community License Agreement) |
| Formato de pesos | safetensors (int8, bf16, NVFP4) y GGUF (Q4_K_S) |

## Arquitectura y entrenamiento

El modelo base, Lightricks LTX-2.5, es un sistema de difusión para generación conjunta de vídeo y audio; el remix de Stuubs parte de esos pesos y aplica un merge con modelos donantes (Sulphur 2 de FusionCow/SulphurAI y 10Eros de TenStrip) junto con un LoRA destilado ya integrado. Sobre esa base, la v1 incorpora OmniNFT, un fine-tune por refuerzo (RL) que recompensa la calidad de vídeo y audio, desarrollado por zghhui et al. bajo licencia Apache-2.0 y convertido a ComfyUI por Kijai. El autor indica que probó también VBVR, pero lo descartó porque reducía el movimiento sin mejorar el seguimiento de prompt.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de etapas DPO o RLHF más allá del citado OmniNFT. La inferencia está optimizada para pocos pasos: CFG 1 y 8 pasos (más 3-4 pasos adicionales si se ejecuta una pasada de upscale), sin necesidad de añadir el LoRA destilado ni OmniNFT porque ya están horneados en los pesos. El pipeline requiere el text encoder `gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` y los VAE `ltx-2.5-video-vae-bf16` y `ltx-2.5-audio-vae-bf16`.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con pista de audio sincronizada.
- Generación de vídeo a partir de imagen (image-to-video), con beta 2 especialmente ajustada hacia i2v.
- Generación de diálogo: las líneas de diálogo se reproducen palabra por palabra según el autor.
- Control de movimiento y composición mediante prompts; soporte de referencias múltiples (por ejemplo, Licon MSR con tres referencias Cast).
- Generación de primeros, intermedios y últimos fotogramas (first/middle/last frames).
- Capacidad NSFW explícita (propósito principal declarado) y capacidad SFW con prompts que especifiquen vestuario.
- Integración con ComfyUI mediante Load Diffusion Model, Unet Loader (GGUF) o el nodo Models de Stubelius Ultimate LTX 2.5.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, por no ser un modelo de lenguaje.

## Casos de uso

- Creación de vídeo narrativo corto con diálogo: el modelo genera vídeo y audio de forma conjunta, y según el autor las líneas de diálogo salen palabra por palabra, lo que permite producir escenas habladas sin un pipeline de TTS separado.
- Animación de imágenes fijas (i2v): beta 2 está ajustada específicamente hacia image-to-video, útil para dar movimiento a ilustraciones o fotografías con control de anatomía mejorado.
- Previsualización rápida de storyboards: con CFG 1 y 8 pasos, se pueden generar borradores de escenas en pocos pasos y refinar después con una pasada de upscale de 3-4 pasos.
- Producción de contenido para adultos con consentimiento: es el caso de uso declarado por el autor; requiere verificar las licencias del modelo base y de los donantes antes de cualquier uso comercial.
- Interpolación y control temporal mediante keyframes: el soporte de primeros, intermedios y últimos fotogramas permite fijar la composición inicial y final de un plano y dejar que el modelo genere la transición.
- Flujos con referencias de personaje: el uso de Licon MSR con varias referencias Cast permite mantener la coherencia de un personaje a lo largo de distintos planos.
- Despliegue en equipos de gama alta de consumo: la variante GGUF Q4 (12,5 GB) está pensada para tarjetas de 8 GB, con el resto de pesos en RAM del sistema, lo que facilita pruebas locales sin GPUs de datacenter.

## Benchmarks y rendimiento

El autor reporta una comparación A/B ciega evaluada por IA sobre fotogramas a resolución completa entre OmniNFT a la intensidad de v1 y beta 2: 29 victorias, 9 derrotas y 10 empates. También reporta, en sus prompts de prueba, un +55 % de detalle fino y un +15 % de movimiento frente a beta 2. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, y al tratarse de un modelo de vídeo, esos benchmarks no serían aplicables.

| Comparación | Resultado |
|---|---|
| A/B ciega v1 (OmniNFT) vs beta 2, fotogramas a resolución completa | 29 victorias / 9 derrotas / 10 empates |
| Detalle fino vs beta 2 | +55 % |
| Movimiento vs beta 2 | +15 % |
| Prompt following, volumen de audio y diálogo vs beta 2 | Sin cambios |

## Requisitos de hardware

- VRAM estimada: 12,5 GB para GGUF Q4_K_S (pensado para tarjetas de 8 GB, con el resto de pesos en RAM del sistema); 14,4 GB para NVFP4; 21,5 GB para int8; 42 GB para bf16.
- GPU recomendadas: RTX 5090 para la variante NVFP4 (Blackwell, ComfyUI 0.32 o superior y PyTorch compilado para CUDA 13); tarjetas de 8 GB o más para GGUF Q4; el autor probó la GGUF en una RTX 5090 el 8 de noviembre de 2026.
- En tarjetas anteriores a Blackwell, NVFP4 funciona pero más lento que int8, por lo que se recomienda quedarse en int8.
- Opciones de despliegue: ComfyUI (Load Diffusion Model para safetensors; Unet Loader (GGUF) con ComfyUI-GGUF para la variante GGUF; nodo Models de Stubelius Ultimate LTX 2.5). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. La configuración recomendada es CFG 1 y 8 pasos, con 3-4 pasos adicionales si se hace upscale.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Stubelius Remix LTX 2.5 (este) | 21B | No aplica | LTX-2.x Community License | Hugging Face, 1.336 descargas, 27 likes | Remix NSFW de LTX-2.5 con OmniNFT y LoRA destilado integrados; cuantizaciones int8, bf16, NVFP4 y GGUF |
| Lightricks/LTX-2.5 | No disponible en la información | No aplica | LTX-2.x Community License | Hugging Face (modelo base) | Modelo original de vídeo y audio; sin el fine-tune RL ni el merge de donantes |
| QuantFunc/LTX-2.5-QuantFunc-4bit | No disponible | No aplica | No disponible | Hugging Face, 304 descargas | Cuantización a 4 bits del mismo modelo base, sin fine-tune adicional documentado |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo orientado a contenido NSFW: puede generar desnudos no deseados en prompts SFW si no se especifica el vestuario de forma explícita.
- Riesgo de alucinación y de artefactos visuales o de audio; el autor indica que la comparación de renders de NVFP4 frente a int8 no está terminada.
- La variante NVFP4 y la GGUF Q4 están marcadas como experimentales. La GGUF Q4 tuvo un fallo de carga corregido el 8 de noviembre de 2026 (tres pesos en BF16 que ComfyUI-GGUF no podía usar fuera de sus capas, ahora en F32); quien la descargara antes debe volver a descargarla.
- La variante NVFP4 solo es rápida en tarjetas RTX 50-series (Blackwell) con ComfyUI 0.32 o superior y PyTorch para CUDA 13.
- Licencia LTX-2.x Community License Agreement con restricciones de uso (secciones 4 y Attachment A); las empresas con ingresos anuales de 10 millones de dólares o más necesitan una licencia de Lightricks antes de usarlo.
- Es un modelo derivado: hay que comprobar las licencias del modelo base y de los donantes (Sulphur 2, 10Eros) antes de cualquier uso comercial.
- Uso previsto únicamente para trabajo creativo entre adultos con consentimiento.
- No se documentan idiomas soportados ni evaluación multilingüe.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/Stuubs/Stubelius_Remix_Ltx2.5
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2.x: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- OmniNFT: https://huggingface.co/zghhui/OmniNFT
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Listado de cuantizaciones de LTX-2.5 en Hugging Face: https://huggingface.co/models?other=base_model%3Aquantized%3ALightricks%2FLTX-2.5
