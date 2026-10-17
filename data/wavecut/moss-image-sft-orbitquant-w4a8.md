# WaveCut/MOSS-Image-SFT-OrbitQuant-W4A8

## Resumen

MOSS-Image-SFT-OrbitQuant-W4A8 es una version cuantizada del modelo de generacion de imagenes a partir de texto OpenMOSS-Team/MOSS-Image-SFT, publicada por el usuario WaveCut. La cuantizacion aplica el metodo OrbitQuant en formato W4A8: pesos de 4 bits con activaciones de 8 bits, tanto en el transformer como en el codificador de texto Qwen3.5. El resultado reduce el paquete de pesos de 27,2 GB (BF16) a 8,8 GB, manteniendo el mismo pipeline de inferencia del modelo original.

El objetivo es hacer viable la generacion de imagenes de alta resolucion (1024x1024) en una unica GPU de consumo. Segun la model card, en una RTX 5090 una imagen tarda 13,7 s con un pico de memoria de dispositivo de 12,3 GiB; con la opcion `--offload` el pico baja a 9,4 GiB y el tiempo sube a 16,4 s, frente a los 55,8 s del modelo original en BF16 con offload.

La relevancia actual esta en que permite ejecutar un modelo de texto a imagen de gran tamano en hardware de gama alta de consumo, con nodos propios para ComfyUI y una pipeline compatible con `diffusers`. El modelo base declara soporte de ingles y chino, aunque esta pensado para renderizar texto dentro de la imagen en varios idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto a imagen con transformer (backbone de difusion) y codificador de texto Qwen3.5; decodificacion VAE |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (modelo de generacion de imagen, no de texto) |
| Tipos de cuantizacion | W4A8: pesos 4 bits, activaciones 8 bits; redondeo GPTQ; opcion de atencion INT8 Q·K |
| Idiomas soportados | en, zh (declarados); la model card menciona pruebas de renderizado de texto en ruso, coreano y arabe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `diffusers`) |
| Tamano del repositorio | 8,8 GB (el original BF16 ocupa 27,2 GB) |
| Modelo base | OpenMOSS-Team/MOSS-Image-SFT |
| Relacion con el base | quantized |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

Se trata de una cuantizacion post-entrenamiento, no de un modelo entrenado desde cero. El autor parte de OpenMOSS-Team/MOSS-Image-SFT y aplica OrbitQuant para generar pesos de 4 bits mediante redondeo GPTQ, calibrado con prompts que no forman parte del conjunto de evaluacion. Tanto el transformer como el codificador de texto Qwen3.5 operan con activaciones de 8 bits sobre pesos de 4 bits. El paquete incluye el pipeline original del modelo (`pipeline_moss_image.py`) y nodos para ComfyUI (`ComfyUI-OrbitQuant`).

Los valores de muestreo siguen los del modelo original: 50 pasos Euler, CFG 3 con la capa 22 omitida en la rama negativa y shift 5. El codigo de ejemplo permite alternar entre atencion estandar y atencion INT8 Q·K, y entre carga en GPU y offload a memoria de host. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales, con resoluciones en multiplos de 16 y 1024x1024 como configuracion de referencia.
- Renderizado de texto dentro de la imagen, con buen comportamiento en ingles y ruso largos segun las pruebas del autor, y soporte declarado para chino.
- Prompt negativo opcional para excluir elementos no deseados.
- Control de semilla, pasos de muestreo, CFG y dimensiones desde linea de comandos o API de Python.
- Integracion con ComfyUI mediante los nodos OrbitQuant Model Loader y OrbitQuant Generate Image.
- Modo `model-offload` para ejecutar con menor VRAM a costa de latencia.
- Atencion INT8 Q·K opcional como via de aceleracion (12,2 s frente a 13,7 s por imagen).
- Persistencia del modelo cargado entre peticiones en el worker de ComfyUI (`keep_loaded`), que reduce la segunda peticion a 15,1 s frente a 32,4 s de la primera.
- No se documenta soporte de tool calling, agentes, vision de entrada, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado de diseno grafico en una sola GPU de consumo: con 12,3 GiB de pico en modo por defecto, una RTX 5090 puede generar imagenes de 1024x1024 en 13,7 s sin necesidad de A100 ni H100.
- Generacion de carteles y rotulos con texto incrustado en ingles o chino: el modelo base esta disenado para renderizar texto desde el prompt, y la version cuantizada conserva ese comportamiento en textos largos en ingles y ruso.
- Flujos de trabajo artisticos en ComfyUI: los nodos ComfyUI-OrbitQuant permiten encadenar el modelo con nodos de guardado estandar y reutilizar el modelo cargado entre peticiones.
- Servicios con VRAM limitada: el modo `--offload` baja el pico a 9,4 GiB, lo que permite desplegar en GPUs por debajo de los 12 GB de VRAM, a cambio de subir el tiempo a 16,4 s por imagen.
- Evaluacion y reproduccion de tecnicas de cuantizacion: la model card publica LPIPS, listas de verificacion ciegas y preferencias ciegas frente a BF16, lo que facilita replicar el experimento con otros prompts o seeds.
- Generacion por lotes en entornos de investigacion: al reducir el paquete a 8,8 GB, se puede almacenar y distribuir el modelo con menos coste de disco y de transferencia que el BF16 original.
- Demos interactivas de baja latencia: la atencion INT8 Q·K reduce el tiempo a 12,2 s por imagen, util para interfaces donde el usuario espera un resultado casi inmediato.

## Benchmarks y rendimiento

Metricas de calidad frente al modelo original en BF16, con el mismo prompt, semilla y sampler a 1024x1024:

| Medida | Resultado |
|---|---|
| LPIPS medio frente a BF16, 33 imagenes (menor es mejor) | 0,190 |
| Igual, 16 imagenes de la semilla 20261009 (sin prompt de calibracion en esa semilla) | 0,205 |
| Dos backends de atencion BF16 entre si, 8 imagenes (referencia de ruido) | 0,055 |
| Lista de verificacion ciega, 26 imagenes con 3-7 comprobaciones cada una: OrbitQuant W4A8 / BF16 | 92 / 118 y 93 / 118 |
| Preferencia ciega, 6 retratos y la foto de la nevera: W4A8 / empate / BF16 | 3 / 3 / 1 |

El conjunto de evaluacion consta de 14 tareas de OpenRouter Image Benchmarks mas dos tareas adicionales (texto largo en ruso y vinculacion de atributos), cada una con dos semillas, mas el prompt de la nevera del README original.

Rendimiento en una RTX 5090 (575 W, driver 580.178.04), Torch 2.12.1 con CUDA 13.0, lote 1, 1024x1024, 50 pasos, CFG 3:

| Configuracion | Tiempo | Pico de dispositivo |
|---|---|---|
| OrbitQuant W4A8 | 13,7 s | 12,3 GiB |
| OrbitQuant W4A8 con `--offload` | 16,4 s | 9,4 GiB |
| OrbitQuant W4A8 con atencion INT8 | 12,2 s | no disponible |
| BF16 original con offload | 55,8 s | no disponible |

Los valores de pico de tensor y pico de RAM de host de la tabla original aparecen truncados en la informacion disponible. En ComfyUI v0.41.2 el pico de dispositivo fue de 12,8 GiB en perfil `default` y 9,9 GiB en `model-offload` (38,4 s en un worker nuevo), incluyendo el 1,0 GiB que ocupa el servidor ComfyUI en reposo; las imagenes fueron identicas pixel a pixel a las de `run_moss.py`. No se han publicado metricas de tipo MMLU, HumanEval o GSM8K, ya que no son aplicables a un modelo de generacion de imagen.

## Requisitos de hardware

- VRAM estimada: 12,3 GiB de pico de dispositivo en modo por defecto a 1024x1024; 9,4 GiB con `--offload`.
- GPU probada: una RTX 5090 (575 W, driver 580.178.04). Se requiere una GPU NVIDIA con compute capability 8.0 o superior.
- Compatibilidad con GPUs de consumo: si, la RTX 5090 es una GPU de consumo; no se documentan pruebas en otras GPUs de consumo, por lo que el comportamiento en modelos inferiores es no disponible.
- Sistema operativo y stack probado: Linux, Python 3.12, Torch 2.12.1 con CUDA 13.0. No se documenta soporte para Windows ni macOS.
- Opciones de despliegue: pipeline de `diffusers` mediante `load_pipeline`, script `run_moss.py` y nodos ComfyUI-OrbitQuant 0.8.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia: 13,7 s por imagen en RTX 5090 en modo por defecto; 12,2 s con atencion INT8; 16,4 s con offload. En ComfyUI, 32,4 s la primera peticion con carga de modelo y 15,1 s las siguientes con `keep_loaded` activado.
- Throughput por lotes: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Tamano | Tiempo por imagen (1024x1024) | Pico de VRAM | Licencia |
|---|---|---|---|---|---|---|
| WaveCut/MOSS-Image-SFT-OrbitQuant-W4A8 | no disponible | W4A8 | 8,8 GB | 13,7 s (RTX 5090) | 12,3 GiB | apache-2.0 |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | BF16 | 27,2 GB | 55,8 s con offload (RTX 5090) | no disponible | no disponible en la informacion |

No se dispone de datos de otros modelos de texto a imagen comparables en la informacion proporcionada, por lo que la comparativa se limita a la version cuantizada frente a su modelo base.

## Limitaciones y advertencias

- El mayor deterioro de calidad detectado esta en el texto multiescritura: en una senal de cuatro escrituras, el BF16 renderizo correctamente las lineas en coreano y arabe en ambas semillas, mientras que W4A8 rompio la linea en arabe en las dos semillas y la coreana en una.
- La distancia media LPIPS frente a BF16 es de 0,190, muy por encima del 0,055 que separa a dos backends de atencion BF16 entre si, lo que indica diferencias perceptibles respecto al original.
- Las diferencias se concentran sobre todo en detalles y composicion, segun la propia model card.
- Requiere GPU NVIDIA con compute capability 8.0 o superior; no se documentan alternativas para hardware inferior o no NVIDIA.
- El stack probado es especifico (Linux, Python 3.12, Torch 2.12.1, CUDA 13.0, driver 580.178.04); otras combinaciones pueden fallar.
- No se documentan el numero de parametros, la longitud de contexto del codificador de texto ni el detalle del dataset de entrenamiento del modelo base.
- La licencia es apache-2.0, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base OpenMOSS-Team/MOSS-Image-SFT antes de desplegarlo en produccion.
- El pipeline original recomienda seguir la guia de usuario de MOSS-Image para el manejo de prompts y resoluciones; ignorarla puede degradar los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WaveCut/MOSS-Image-SFT-OrbitQuant-W4A8
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Repositorio de OrbitQuant: https://github.com/iamwavecut/OrbitQuant
- Nodos ComfyUI-OrbitQuant: https://github.com/iamwavecut/ComfyUI-OrbitQuant
- Guia de usuario de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- OpenRouter Image Benchmarks: https://openrouter.ai/blog/announcements/image-benchmarks/
- Paper referenciado (arxiv:2607.02461): https://arxiv.org/abs/2607.02461
