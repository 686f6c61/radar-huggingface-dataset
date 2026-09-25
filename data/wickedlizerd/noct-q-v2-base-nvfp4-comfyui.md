# Wickedlizerd/Noct-Q-V2-Base-NVFP4-ComfyUI

## Resumen

Noct Q V2 Base NVFP4 ComfyUI es una cuantizacion comunitaria del modelo de generacion de imagenes Noct Q V2.0 Base de noctaluna, construido a su vez sobre Qwen/Qwen-Image-2.1. El trabajo lo publica el usuario Wickedlizerd y no constituye un lanzamiento oficial ni de Qwen ni de noctaluna. El resultado es un unico archivo safetensors (`noct_q_v2_base_nvfp4.safetensors`, 4.197.575.272 bytes) que convierte el transformer de difusion original en BF16 a NVFP4 nativo de ComfyUI.

La relevancia de esta publicacion es de formato, no de modelado: se cuantizan las 192 proyecciones de atencion y MLP, mientras que los otros 73 tensores permanecen en BF16 byte a byte identicos. No hay fine-tuning, merging ni modificacion del text encoder ni del VAE. El objetivo es reducir huella y acelerar inferencia en GPUs Blackwell, que son las unicas con soporte nativo de FP4.

Se trata del modelo completo (Base), no de la variante Turbo: el autor original recomienda 25-50 pasos con CFG 1 y sampler Euler, usando el encoder de Qwen Image 2.1 y el VAE de 64 canales. El repositorio acumula 0 descargas y 0 likes, y la propia model card advierte que la inferencia nativa en Blackwell, la calidad de salida y el rendimiento no han sido validados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) cuantizado; sin cambios estructurales respecto al original |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; la fija el text encoder Qwen Image 2.1, no especificada) |
| Tipos de cuantizacion | NVFP4 en 192 proyecciones de atencion y MLP; BF16 intacto en los 73 tensores restantes |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License (`license: other`, `license_name: qwen-research`); solo uso no comercial salvo licencia separada del titular original |
| Formato de pesos | safetensors (archivo unico para el loader nativo de ComfyUI; no compatible con Diffusers) |
| Tipo de modelo | Generacion de imagen / image-to-image |
| Modelo base | Qwen/Qwen-Image-2.1 (finetune de noctaluna, Noct Q V2.0 Base BF16) |
| Tamano del repositorio | 4,2 GB |
| Tensor cuantizados | 192 de 265 tensores |
| Componentes auxiliares | Encoder de texto Qwen Image 2.1 y VAE de 64 canales (sin modificar) |
| Hardware nativo requerido | GPU NVIDIA Blackwell con soporte FP4 y ComfyUI/comfy-kitchen compatible |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de difusion (DiT) de Qwen-Image 2.1, posteriormente ajustado por noctaluna en la variante Noct Q V2.0 Base. La aportacion de este repositorio no es arquitectonica ni de entrenamiento: no se ha realizado fine-tuning, merging ni alteracion del encoder de texto o del VAE. La conversion transforma exclusivamente el transformer de difusion de BF16 a NVFP4, un formato de 4 bits con escalas compartidas por bloques orientado a los tensor cores FP4 de quinta generacion de NVIDIA.

El proceso se ejecuto en CPU con PyTorch 2.10.0 mediante el exportador deterministico NVFP4 de Comfy-Org/comfy-quants (commit `3d057e9c8e3132ef1853dec96f91d3de0aaf0e6a`), con seleccion explicita de capas de Qwen 2.1. La trazabilidad esta documentada: el SHA-256 de entrada es `89f4158d066cc33906a199fca85634f766892dd78f49b6698dabf187ac86c4bc` y el de salida `899fd53851abe4dfe03a1ba1e4396f4e2e13bb288fbe84f2e1a067422a18d52e`. La validacion se limito a comprobaciones estructurales (checksum de origen, estructura tensorial, finitud de escalas y preservacion de los tensores BF16), con 15 tests de CPU del conversor y 4 tests de paridad contra primitivas de referencia de Comfy-Kitchen.

## Capacidades

- Generacion de imagenes a partir de texto mediante un pipeline de difusion (con el encoder de texto y el VAE externos).
- Image-to-image: es el pipeline declarado del repositorio, por lo que admite una imagen de entrada como condicionamiento.
- Ajuste fino de la generacion mediante prompt, pasos de muestreo, CFG y sampler (el autor original recomienda 25-50 pasos, CFG 1 y Euler).
- Ejecucion integrada en ComfyUI a traves del loader nativo (no via Diffusers).
- Aceleracion de inferencia en hardware Blackwell gracias al formato NVFP4.
- No se documentan capacidades de tool calling, agentes, vision de entrada adicional, audio, thinking mode ni soporte multilingue explicito; no disponible en la informacion proporcionada.
- No se documenta soporte de inpainting, controlnet, LoRA ni otros condicionamientos adicionales; no disponible.

## Casos de uso

- Flujo image-to-image local en ComfyUI: cargar una imagen de referencia, aplicar el loader nativo NVFP4 y regenerarla con un prompt nuevo, aprovechando que el repositorio esta empaquetado especificamente para ese nodo.
- Iteracion artistica sobre un boceto o render previo: partir de una imagen base y refinarla con distintos prompts y conteos de pasos, dado que el modelo es Base (25-50 pasos) y admite control fino via CFG y sampler.
- Pruebas de cuantizacion FP4 en estaciones Blackwell: comparar el resultado de este archivo contra el BF16 original para medir degradacion visual en un caso real de difusion de imagen.
- Prototipado rapido de pipelines de generacion de imagen en un unico archivo: al ser un solo safetensors de 4,2 GB con encoder y VAE externos, simplifica la gestion de artefactos en un entorno ComfyUI.
- Trabajo de investigacion sobre transferencia de estilo o variacion de imagen dentro de un entorno de investigacion no comercial, que es el unico marco que permite la Qwen Research License.
- Evaluacion comparativa de rendimiento NVFP4 frente a BF16 en la misma GPU: util para decidir si compensa la perdida de precision potencial a cambio de velocidad en despliegues locales.
- Generacion por lotes en una workstation con GPU Blackwell para tareas creativas internas, con la salvedad de que ni la calidad ni el rendimiento estan validados por el autor de la conversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que la inferencia nativa en Blackwell, la calidad de salida y el rendimiento no han sido validados. La unica evidencia de validacion son 15 tests de CPU del conversor y 4 tests de paridad contra primitivas de referencia de Comfy-Kitchen, que no miden calidad de imagen ni velocidad de inferencia.

## Requisitos de hardware

- Arquitectura requerida: NVIDIA Blackwell. La model card afirma que la inferencia NVFP4 nativa exige hardware Blackwell y una version compatible de ComfyUI/comfy-kitchen. Las generaciones anteriores (Ampere, Ada Lovelace) no tienen soporte nativo de FP4.
- GPUs compatibles: familia RTX 50 (por ejemplo RTX 5090, 5080, 5070, 5060 Ti), RTX PRO Blackwell y aceleradores de centro de datos B100/B200 de NVIDIA. No hay confirmacion del autor sobre modelos concretos validados.
- VRAM estimada: el archivo de pesos ocupa 4,2 GB. A esa cifra hay que sumar el encoder de texto Qwen Image 2.1, el VAE de 64 canales y las activaciones de inferencia, cuyas huellas no se detallan en la informacion disponible. Estimacion orientativa, no confirmada por el autor: 16 GB o mas para trabajar con comodidad, con lo que seria viable en una RTX 5090 de 32 GB.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas Blackwell de gama alta con 16 GB o mas, siempre que la version de ComfyUI y comfy-kitchen lo soporte.
- Opciones de despliegue: loader nativo de ComfyUI. El repositorio no esta pensado para Diffusers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no son herramientas de inferencia de difusion de imagen.
- Latencia y throughput: no disponibles, no medidos por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noct-Q-V2-Base-NVFP4-ComfyUI (este) | no disponible | no disponible | NVFP4 + BF16 parcial, safetensors | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Noct Q V2.0 Base BF16 (original de noctaluna) | no disponible | no disponible | BF16 | Qwen Research (no comercial), derivados permitidos | Civitai |
| Qwen/Qwen-Image-2.1 (modelo base) | no disponible | no disponible | no disponible | Qwen Research | Hugging Face |
| Flux 2 Dev NVFP4 | no disponible | no disponible | NVFP4 | no disponible | ComfyUI (referencia de la busqueda web) |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion queda limitada a formato, licencia y canal de distribucion.

## Limitaciones y advertencias

- Calidad, rendimiento e inferencia nativa en Blackwell sin validar, segun reconoce la propia model card.
- Requiere hardware Blackwell y un ComfyUI con comfy-kitchen compatible; no funcionara con el loader NVFP4 nativo en GPUs Ampere o Ada.
- No es compatible con Diffusers; esta pensado exclusivamente para el loader nativo de ComfyUI.
- Licencia Qwen Research: uso no comercial salvo licencia separada del titular original de los derechos. La Qwen Research License no permite explotacion comercial sin autorizacion.
- Restricciones derivadas del modelo base: el autor original permite derivados solo bajo la misma licencia.
- Es la variante Base, no Turbo: requiere 25-50 pasos, por lo que la latencia por imagen es mayor que en variantes destiladas.
- La cuantizacion a 4 bits puede introducir degradacion de calidad respecto al BF16 original; no se ha publicado ninguna evaluacion comparativa.
- Riesgo de sesgos y de alucinacion visual heredado del modelo original y de su dataset de entrenamiento; no documentado en este repositorio.
- Idiomas soportados no especificados; las capacidades multilingues del encoder de texto no se detallan.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad, sin issues ni reportes de uso real.
- No se documentan pesos alternativos (GGUF, FP8) ni variantes para otras arquitecturas de GPU.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Wickedlizerd/Noct-Q-V2-Base-NVFP4-ComfyUI
- Modelo original en Civitai (Noct Q V2.0 Base): https://civitai.com/models/2958896?modelVersionId=3353641
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio del conversor citado en la model card: Comfy-Org/comfy-quants, commit `3d057e9c8e3132ef1853dec96f91d3de0aaf0e6a`
- Modelos soportados por ComfyUI: https://comfy.org/p/supported-models/
- Referencia de uso de NVFP4 en ComfyUI (Flux 2 Dev NVFP4): https://www.reddit.com/r/comfyui/comments/1qc3jli/testing_the_flux_2_dev_nvfp4_model_consistent/
- Tutorial de NVFP4 con CUDA 13 en ComfyUI/SwarmUI: https://www.youtube.com/watch?v=yOj9PYq3XYM
- Cobertura sobre cuantizaciones NVFP4 en ComfyUI: https://www.localainews.co/news/comfyui/qwen-3-5-abliterated-comfyui-nvfp4-unlocks-local-ai-power/
