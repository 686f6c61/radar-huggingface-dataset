# StillDeadcode/radiance-noctq-v4-uncensored-iq8r

## Resumen

Radiance noctq-v4-uncensored-iq8r es un contenedor de pesos en formato `.rad` para el motor de inferencia radiance, orientado a GPUs AMD con arquitectura RDNA4 y ROCm. No es un modelo entrenado desde cero, sino una recodificación cuantizada a int8 del fine-tune Noct Q V4 de Noctaluna, que a su vez deriva del diffusion transformer de Qwen-Image 2.1. El contenedor empaqueta el transformer de difusión, la red de condicionamiento (Qwen3-VL-8B) y el VAE en un único fichero de 16,13 GiB.

El propósito del artefacto es doble: por un lado, ofrecer una versión ejecutable en hardware AMD del modelo base sin depender de ComfyUI; por otro, aplicar una cuantización W8A8 con rotación Hadamard (denominada IQ8R) que reduce el peso a ocho bits por parámetro manteniendo la fidelidad respecto al contenedor FP8 del mismo autor. Sustituye a `StillDeadcode/radiance-noctq-v4-uncensored-fp8` con la misma profundidad de bits.

El modelo base, Noct Q V4, es un fine-tune no censurado de Qwen-Image 2.1 que, según su propia model card, genera desnudos y escenas explícitas sin necesidad de LoRA. Se distribuye con licencia Qwen Research (no comercial) y está marcado como no apto para todos los públicos. La relevancia actual reside en que demuestra un pipeline de cuantización reproducible (decodificación de int8 tensorwise + ConvRot de ComfyUI, recuantización con rotación Hadamard por bloques de 256 en K) sobre un modelo de difusión de gran tamaño en el ecosistema AMD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (Qwen-Image 2.1) con red de condicionamiento Qwen3-VL-8B y VAE |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 W8A8 con rotacion Hadamard (IQ8R); pesos lineales int8 con escala u8 por fila y bf16 por bloque de 256 en K; vision tower, lineales pequenas, norms y VAE en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (no comercial) |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance); 16,13 GiB |

## Arquitectura y entrenamiento

El modelo subyacente es un diffusion transformer de Qwen-Image 2.1. Según la model card, Noct Q V4 modifica únicamente los bloques 0-15 del transformer de difusión, en sus seis lineales (q, k, v, out, gate/up, down), con un cambio de aproximadamente el 1,1 % de su norma. Los bloques 16-31, el resto de tensores del transformer, la red de condicionamiento y el VAE son idénticos al modelo original de Qwen. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica del contenedor es el proceso de cuantización. Noct Q se publica en Hugging Face solo como fichero `int8_tensorwise` + ConvRot de ComfyUI (su bf16 está en Civitai). El autor decodifica ese formato exactamente como lo codifica el cuantizador de ComfyUI: int8 por fila del peso rotado por la Hadamard regular normalizada de orden 256. Al recuantizar los pesos originales se reproducen los códigos de los bloques no modificados, de modo que los bloques 16-31 se toman del checkpoint bf16 original y solo los bloques 0-15 conservan el redondeo int8 de Noct Q (aproximadamente el 0,9 % de su norma) antes del int8 propio del contenedor. Las activaciones también se cuantizan a int8 bajo la misma rotación (W8A8), con códigos de −127 a 127, escala u8 por fila y bf16 por cada 256 de K, redondeo al más cercano. El paso de decodificación y conversión se documenta con dos comandos reproducibles (`decode_noctq.py` y `rad-convert`).

## Capacidades

- Generación de imágenes texto-a-imagen mediante el pipeline `text-to-image`.
- Edición de imágenes: acepta de 1 a 10 imágenes de referencia y una máscara a través de `POST /v1/images/edits`.
- Generación de contenido adulto sin LoRA adicional, incluidos desnudos y escenas explícitas, según la model card del modelo base.
- Control de semilla (`seed`) para reproducibilidad.
- Generación por lotes (`n`) y tamaños arbitrarios en formato `WxH` o `auto` (2048x2048).
- Fondo transparente (`background: transparent`).
- Generación en streaming mediante `partial_images`.
- Salida en `b64_json` con formatos png, jpeg o webp; `response_format: url` no está soportado.
- Servidor compatible con la API de imágenes de OpenAI (`/v1/images/generations`, `/v1/images/edits`, `/v1/models`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Generación de imágenes para adultos en entornos controlados: el modelo está diseñado explícitamente para producir contenido explícito sin LoRA, por lo que encaja en plataformas de contenido para adultos con verificación de edad y moderación adecuada.
- Edición de imágenes con múltiples referencias: el endpoint `/v1/images/edits` acepta hasta 10 imágenes y una máscara, útil para composición, retoque o sustitución de regiones manteniendo coherencia con las referencias.
- Despliegue en infraestructura AMD: al ejecutarse sobre ROCm y RDNA4, permite montar servicios de generación de imágenes en GPUs Radeon AI PRO R9700 sin depender de CUDA, con `tp: 2` para dos tarjetas o `tp: 1` para una.
- Integración en pipelines compatibles con OpenAI: al hablar la API de imágenes de OpenAI, se puede sustituir un backend OpenAI por este servidor en aplicaciones existentes sin reescribir el cliente.
- Prototipado de flujos de generación con streaming: `partial_images` permite mostrar vistas previas progresivas en interfaces interactivas.
- Generación de fondos transparentes para composición: la opción `background: transparent` facilita la integración de los resultados en herramientas de diseño o motores de juego.
- Evaluación de técnicas de cuantización: el repositorio incluye el script de decodificación y la receta, lo que permite reproducir y auditar el proceso IQ8R sobre otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo de generación de imágenes. Sí se documentan métricas de rendimiento y fidelidad:

| Metrica | Valor |
|---|---|
| Latencia 1024x1024 a 20 pasos (1x Radeon AI PRO R9700) | 10,3–10,6 s |
| Latencia del contenedor FP8 equivalente | 10,3–10,5 s |
| Distancia media PSNR frente al contenedor FP8 (mismo ruido, 4 imágenes) | 27,8 dB (rango 17,8–32,9 dB) |
| Distancia PSNR de la misma receta frente a bf16 en Qwen-Image 2.1 | 32,6 dB (FP8: 28,1 dB) |
| Pasos por defecto | 40 (recomendado por Noct Q: 25 con guidance 3 y prompt negativo) |

## Requisitos de hardware

- VRAM estimada: el fichero pesa 16,13 GiB; se necesita espacio adicional para activaciones y el VAE en bf16, por lo que se recomienda al menos 24 GB de VRAM para `tp: 1`.
- GPU recomendadas: Radeon AI PRO R9700 (RDNA4) con ROCm; el motor radiance está orientado a AMD RDNA4.
- No se documenta compatibilidad con GPUs consumer NVIDIA ni con CUDA.
- Despliegue: motor radiance (compilado desde main posterior a 1.17.0, ya que IQ8R con escala por 256 de K no está en 1.17.0); configuración mediante `radiance.yaml` con `tp: 1` o `tp: 2`.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput: no disponible; solo se publica la latencia por imagen indicada arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| radiance-noctq-v4-uncensored-iq8r | no disponible | no disponible | `.rad` int8 W8A8 | Qwen Research (no comercial) | AMD RDNA4 / ROCm | Contenedor IQ8R; 10,3–10,6 s por imagen 1024x1024 a 20 pasos |
| StillDeadcode/radiance-noctq-v4-uncensored-fp8 | no disponible | no disponible | `.rad` FP8 | Qwen Research (no comercial) | AMD RDNA4 / ROCm | Mismo modelo base en FP8; 10,3–10,5 s por imagen; 27,8 dB de distancia media respecto al IQ8R |
| Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1 | no disponible | no disponible | safetensors int8_tensorwise + ConvRot (ComfyUI) | Qwen Research (no comercial) | ComfyUI | Modelo base sin contenedor radiance; bf16 en Civitai |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | safetensors | Qwen Research (no comercial) | GPU con CUDA habitualmente | Modelo original sin fine-tune; referencia de fidelidad bf16 (32,6 dB frente a la receta) |

## Limitaciones y advertencias

- Contenido para adultos: el modelo genera desnudos y escenas explícitas; requiere verificación de edad y moderación en cualquier despliegue público.
- Licencia no comercial: la Qwen Research License Agreement impide el uso comercial del modelo y de sus derivados sin autorización adicional.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al derivar de Qwen-Image 2.1, hereda los sesgos del modelo original y del fine-tune.
- Riesgo de alucinación visual: como modelo generativo, puede producir anatomías incorrectas, texto ilegible o composiciones incoherentes, especialmente en escenas complejas.
- Fidelidad limitada: la distancia media de 27,8 dB frente al contenedor FP8 indica diferencias perceptibles en algunas imágenes (mínimo de 17,8 dB en una composición con ángulo distinto).
- Restricción de hardware: solo funciona con el motor radiance sobre AMD RDNA4 con ROCm; no hay soporte documentado para CUDA ni para otros motores de inferencia.
- Requiere una versión de radiance posterior a 1.17.0; la 1.17.0 no soporta IQ8R con escala por 256 de K.
- `response_format: url` no está soportado; la salida debe solicitarse como `b64_json`.
- Idiomas soportados no documentados; el condicionamiento textual depende de Qwen3-VL-8B, pero no se especifica cobertura lingüística.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/radiance-noctq-v4-uncensored-iq8r
- Modelo base en Hugging Face: https://huggingface.co/Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1
- Modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1
- Contenedor FP8 equivalente: https://huggingface.co/StillDeadcode/radiance-noctq-v4-uncensored-fp8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
