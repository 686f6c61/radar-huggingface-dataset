# Stuubs/Stubelius_Remix

## Resumen

Stubelius Remix es un ajuste fino (merge y fine-tune) del modelo de generacion de video Lightricks LTX-2.5, publicado por el usuario Stuubs en Hugging Face. Se distribuye como un modelo de difusion para ComfyUI que genera video con audio sincronizado, e incorpora un LoRA destilado ya integrado y un fine-tune por refuerzo (OmniNFT) orientado a mejorar la nitidez de detalle y el movimiento. El modelo esta pensado principalmente para contenido para adultos (NSFW) aunque puede producir contenido SFW, y esta disponible en varias cuantizaciones (int8, bf16, NVFP4 y GGUF Q4) para adaptarse a distintos niveles de VRAM.

Con aproximadamente 21.000 millones de parametros (21.004.025.600 segun los pesos safetensors) y un repositorio de 208,5 GB, el modelo se apoya en el text encoder Gemma 4 12B con proyeccion especifica de LTX 2.5 y en dos VAE separados (video y audio). Su relevancia actual radica en que ofrece una via practica de ejecutar un modelo de video-audio de gran tamano en hardware de consumo mediante cuantizacion, con ajustes especificos de inferencia (CFG 1, 8 pasos) que reducen el coste computacional.

La licencia es la LTX-2.x Community License Agreement, que impone restricciones de uso y exige licencia comercial previa de Lightricks para empresas con ingresos anuales superiores a 10 millones de USD. El modelo es un derivado de LTX-2.5 y combina pesos de Sulphur 2 (FusionCow/SulphurAI), 10Eros (TenStrip) y el fine-tune OmniNFT (zghhui et al.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para video con audio (derivado de Lightricks LTX-2.5); detalles internos de bloques no disponibles |
| Parametros totales | 21.004.025.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (convrot), bf16, NVFP4 (experimental), GGUF Q4_K_S (experimental) |
| Idiomas soportados | no disponible |
| Licencia | LTX-2.x Community License Agreement (other) |
| Formato de pesos | safetensors (int8, bf16, NVFP4) y GGUF (Q4_K_S) |

## Arquitectura y entrenamiento

El modelo es un derivado de Lightricks LTX-2.5, un modelo de difusion para generacion de video con pista de audio. La model card no detalla la arquitectura interna (tipo de transformer, atencion, etc.), por lo que esa informacion no esta disponible. Lo que si se documenta es el proceso de construccion: se parte de LTX 2.5, se le incorpora un LoRA destilado de Lightricks ya integrado en los pesos, y se realiza un merge con pesos de los modelos Sulphur 2 y 10Eros. Sobre esa base se aplica OmniNFT, un fine-tune por aprendizaje por refuerzo (RL) que recompensa la calidad de video y audio, fusionado a su intensidad de entrenamiento.

El ajuste OmniNFT se valido con una comparacion ciega evaluada por IA sobre fotogramas a resolucion completa: gano 29 a 9 frente a la version beta 2, con 10 empates. Segun el autor, la nitidez de detalle fino mejora un 55% y el movimiento un 15% respecto a beta 2, manteniendo el seguimiento de prompt, el volumen de audio y la fidelidad del dialogo (las lineas de dialogo salen palabra por palabra). Se probo tambien VBVR, pero se descarto porque reducia el movimiento sin mejorar el seguimiento de prompt. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset.

## Capacidades

- Generacion de video a partir de texto (text-to-video) y de imagen (image-to-video, i2v), con ajuste de la beta 2 hacia i2v.
- Generacion de audio sincronizado con el video, incluyendo dialogo fiel palabra por palabra.
- Generacion de video con audio integrado mediante VAE separados de video y audio.
- Control de keyframes (primer, medio y ultimo fotograma) segun las pruebas del autor.
- Soporte de referencias de personaje (Licon MSR con tres referencias Cast) en el nodo Stubelius Ultimate LTX 2.5.
- Capacidad de contenido NSFW y SFW (con riesgo de desnudez no deseada en prompts SFW si no se especifica la ropa).
- Uso de LoRAs de LTX 2.5 sobre el archivo int8 del mismo modo que en LTX 2.5 estandar.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo de difusion de video).

## Casos de uso

- Produccion de video creativo para adultos: el modelo esta disenado y ajustado principalmente para trabajo NSFW entre adultos con consentimiento, con generacion de video y audio coherentes en una sola pasada.
- Creacion de clips con dialogo: gracias a la fidelidad del audio y del dialogo palabra por palabra, sirve para generar escenas con lineas habladas sin necesidad de doblaje posterior.
- Image-to-video para animar ilustraciones o fotografias: la beta 2 se ajusto especificamente hacia i2v, lo que permite dar movimiento a una imagen de referencia manteniendo la composicion.
- Control de keyframes en postproduccion: la capacidad de fijar primer, medio y ultimo fotograma permite encajar clips generados en una secuencia existente.
- Iteracion rapida en hardware de consumo: la version GGUF Q4 (12,5 GB) permite probar prompts en tarjetas de 8 GB con ComfyUI-GGUF, usando RAM del sistema para lo que no cabe en VRAM.
- Flujos con referencias de personaje: el soporte de Licon MSR con tres referencias Cast facilita mantener la coherencia de un personaje a lo largo de varias generaciones.
- Prototipado en ComfyUI: al integrarse en el nodo Stubelius Ultimate LTX 2.5 y en Load Diffusion Model, encaja en pipelines de nodos existentes para experimentacion rapida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de difusion de video. Los unicos datos de evaluacion son los del autor:

| Comparacion | Resultado |
|---|---|
| OmniNFT v1 frente a beta 2 (A/B ciego evaluado por IA, fotogramas a resolucion completa) | 29 victorias, 9 derrotas, 10 empates |
| Nitidez de detalle fino (v1 frente a beta 2) | +55% |
| Movimiento (v1 frente a beta 2) | +15% |
| Seguimiento de prompt, volumen de audio, dialogo | sin cambios |
| VBVR | descartado: pierde movimiento sin mejorar el seguimiento de prompt |

## Requisitos de hardware

- VRAM estimada segun cuantizacion: int8 ~21,5 GB de pesos; bf16 ~42 GB; NVFP4 ~14,4 GB; GGUF Q4_K_S ~12,5 GB.
- GPU recomendadas: para int8, tarjetas con 24 GB o mas (RTX 4090, A100, H100); para bf16, 48 GB o mas (A100 80 GB, H100).
- NVFP4: solo rapido en tarjetas RTX 50-series (Blackwell) con ComfyUI 0.32 o superior y PyTorch compilado para CUDA 13; en tarjetas anteriores funciona mas lento que int8.
- GGUF Q4: probado en RTX 5090; en tarjetas de 8 GB ComfyUI mantiene en RAM del sistema la parte que no cabe en VRAM, por lo que conviene disponer de RAM abundante.
- Despliegue: ComfyUI (Load Diffusion Model o nodo Stubelius Ultimate LTX 2.5); para GGUF se requiere ComfyUI-GGUF y el nodo Unet Loader (GGUF).
- Ajustes de inferencia: CFG 1 y 8 pasos (mas 3-4 pasos si se ejecuta una pasada de upscale); no anadir el LoRA destilado ni OmniNFT porque ya estan integrados.
- Componentes adicionales: text encoder `gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors` (re-descargar si la copia es anterior a mediados de agosto) y VAE `ltx-2.5-video-vae-bf16` y `ltx-2.5-audio-vae-bf16`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Stubelius Remix (este modelo) | 21,0 B | no disponible | LTX-2.x Community License | Hugging Face, ComfyUI | Derivado de LTX-2.5 con OmniNFT, LoRA destilado y merges; NSFW/SFW |
| Lightricks LTX-2.5 (base) | no disponible | no disponible | LTX-2.x Community License | Hugging Face | Modelo base oficial; sin los merges ni el fine-tune RL del remix |
| Sulphur 2 (FusionCow/SulphurAI) | no disponible | no disponible | no disponible | no disponible | Donante de pesos en el merge |
| 10Eros (TenStrip) | no disponible | no disponible | no disponible | no disponible | Donante de pesos en el merge |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria mas alla de las cifras internas del autor frente a beta 2.

## Limitaciones y advertencias

- Modelo orientado a contenido para adultos: uso previsto solo para trabajo creativo entre adultos con consentimiento; verificar las licencias del modelo base y de los donantes antes de cualquier uso comercial.
- Riesgo de desnudez no deseada en prompts SFW si no se especifica la ropa de forma explicita.
- Licencia restrictiva: la LTX-2.x Community License Agreement incluye restricciones de uso (secciones 4 y Attachment A) y exige licencia de Lightricks para empresas con ingresos anuales de 10 millones de USD o mas.
- El archivo NVFP4 es experimental: los pesos verifican el redondeo NVFP4 y conservan el cambio de OmniNFT, pero el autor no ha terminado de comparar sus renders con int8.
- El GGUF Q4 es experimental y tuvo un fallo corregido el 8 de noviembre de 2026 (tres pesos en BF16 que ComfyUI-GGUF no podia usar); si se descargo antes de esa fecha, hay que volver a descargarlo.
- El int8 requiere una version de ComfyUI lo bastante reciente para cargar los archivos int8 de LTX 2.5 de Comfy-Org.
- No se documentan sesgos, idiomas soportados ni riesgo de alucinacion en la informacion disponible; al ser un modelo de difusion, el concepto de alucinacion no aplica del mismo modo.
- El autor indica que el color es el mismo en promedio, aunque algunas escenas salen menos saturadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stuubs/Stubelius_Remix
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2.x Community License Agreement: https://github.com/Lightricks/LTX-2/blob/main/LICENSE-2_x
- OmniNFT: https://huggingface.co/zghhui/OmniNFT
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
