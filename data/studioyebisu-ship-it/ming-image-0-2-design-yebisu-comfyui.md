# StudioYebisu-ship-it/Ming-Image-0.2-Design-Yebisu-ComfyUI

## Resumen

Ming-Image-0.2-Design Yebisu ComfyUI es una suite de cuantizacion del modelo text-to-image `inclusionAI/Ming-Image-0.2-Design`, publicada por el usuario `StudioYebisu-ship-it`. No se trata de un modelo entrenado desde cero, sino de una reempaquetado de pesos cuantizados en formatos nativos de ComfyUI (`comfy_quant`) que cubren tanto el codificador de texto como el modelo de difusion. El objetivo es reducir el consumo de VRAM y disco del pipeline original (45,02 GiB en BF16) hasta rangos de 13,57 a 26,97 GiB segun la variante, manteniendo la compatibilidad con un ComfyUI estandar sin nodos personalizados ni parches del nucleo.

El modelo base combina un codificador de texto multimodal `Ling-Mini-2.0` (16B totales, 2,8B activos, arquitectura MoE con componentes densos y atencion) junto con un `Qwen2.5-ViT` y un conector `Qwen2-1.5B` de 28 capas con cabezas MLP `DirectVLM`. El modelo de difusion es un `Next-DiT` de 6B con 30 bloques transformer, modulos `context_refiner` y `noise_refiner`, calibrado sobre trayectorias Flow-Matching Euler de 12 pasos con `ModelSamplingFlux(1.15, 0.5)`. El VAE se distribuye en BF16 sin cuantizar (0,2364 GiB).

La relevancia de esta publicacion radica en que demuestra que es posible ejecutar un pipeline text-to-image multimodal de gran tamano en GPUs de consumo (12-32 GB) con perdidas de fidelidad medibles y documentadas, incluyendo una variante `yebisu_24gb` que alcanza 21,95 dB de PSNR y 0,9115 de SSIM frente a la referencia BF16, superando de forma clara a la version cuantizada publicada por Comfy-Org (16,20 dB / 0,8267).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-image: codificador de texto multimodal (MoE + denso + atencion) + difusion Next-DiT + VAE |
| Parametros totales | Codificador de texto: 16B (Ling-Mini-2.0, 16B-A2,8B); difusion: 6B (Next-DiT, 30 bloques); VAE: no disponible |
| Parametros activos | 2,8B en el codificador de texto (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ConvRot-256 Hessian-GPTQ, Hadamard INT8-ConvRot, `TensorWiseINT8Layout` con `convrot=True`, `AsymW4A8Int8Layout` con `bits=3/4/5/6`, W6A8 GPTQ uniforme, INT8 ConvRot uniforme |
| Idiomas soportados | no disponible (la model card incluye ejemplos con tipografia latina y kanji japones) |
| Licencia | MIT |
| Formato de pesos | safetensors con layouts nativos `comfy_quant` |

## Arquitectura y entrenamiento

El pipeline subyacente consta de tres componentes. El codificador de texto es un `Ling-Mini-2.0` de 16B totales con 2,8B activos (MoE con capas densas L0 y atencion), acompanado de un `Qwen2.5-ViT` y un conector `Qwen2-1.5B` de 28 capas con cabezas MLP `DirectVLM`. El modelo de difusion es un `Next-DiT` de 6B con 30 bloques transformer y modulos `context_refiner` y `noise_refiner`. El VAE se mantiene en BF16 (0,2364 GiB) sin cuantizar.

Esta publicacion no entrena el modelo base: aplica una cuantizacion hibrida de sensibilidad DP (programacion dinamica) sobre ambos componentes. El codificador de texto pasa de 33,56 GiB en BF16 a 9,43-18,80 GiB, y el modelo de difusion de 11,46 GiB a 4,14-8,17 GiB. La calibracion se realiza directamente a lo largo de trayectorias Flow-Matching Euler de 12 pasos con `ModelSamplingFlux(1.15, 0.5)`, lo que alinea el proceso de cuantizacion con el regimen de inferencia real. Los ficheros resultantes usan metadatos `config: {"transformer": {"image_model": "ming_image"}}` y layouts `comfy_quant` nativos, de modo que no requieren nodos personalizados ni modificaciones del nucleo de ComfyUI.

## Capacidades

- Generacion de imagenes text-to-image a 1024x1024 con 12 pasos Euler y `cfg=1.0`.
- Codificacion de prompts multimodales mediante el codificador `Ling-Mini-2.0` con torre visual `Qwen2.5-ViT`.
- Renderizado de tipografia compleja, incluyendo caracteres CJK (kanji) y latinos, segun los ejemplos de la model card.
- Generacion de composiciones de diseno grafico: posters, interfaces de usuario, infografias, fotografia de interiores y material de ecommerce.
- Compatibilidad nativa con ComfyUI estandar: carga mediante `comfy.sd.load_clip` y `comfy.sd.load_diffusion_model`.
- Soporte de seis variantes de cuantizacion con distintos equilibrios de VRAM y fidelidad.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Generacion de posters y material grafico con tipografia CJK: la variante `yebisu_24gb` preserva marcos, geometria de layout y trazos de kanji con SSIM de 0,9115 frente a BF16, adecuada para diseno editorial y carteleria japonesa.
- Prototipado de interfaces SaaS: los ejemplos de la model card incluyen una escena de landing page de UI, lo que permite generar mockups visuales a partir de descripcion textual en entornos de diseno de producto.
- Fotografia de producto para ecommerce: la escena del serum botanico Yebisu demuestra la generacion de bodegones comerciales con iluminacion controlada, util para catalogos sin sesion fotografica.
- Infografias tecnicas: la escena de Flow Matching infographic sugiere capacidad para generar diagramas y visualizaciones explicativas con texto integrado.
- Render de interiores y arquitectura: la escena de habitacion minimalista con luz solar encaja en flujos de visualizacion arquitectonica previa a render final.
- Despliegue en estaciones de trabajo con GPU de consumo: `yebisu_12gb` (13,57 GiB combinados, 14,50 GiB de pico en DiT) permite ejecutar el pipeline completo en GPUs de 16 GB con calidad superior a la version de Comfy-Org.
- Servicio de generacion en produccion con GPU de 24-32 GB: `yebisu_24gb` y `yebisu_32gb` permiten mantener el pipeline residente con fidelidad cercana a BF16 y latencias de 13,29-15,27 s/imagen en NVIDIA L4.

## Benchmarks y rendimiento

Evaluacion en ComfyUI sin modificar (`comfy.sd.load_clip` + `comfy.sd.load_diffusion_model` + `CFGGuider/euler/simple`, `steps=12`, `cfg=1.0`, `1024x1024`, `seed=42`) sobre NVIDIA L4 (22,03 GiB de VRAM, PyTorch 2.14.1+cu130) con 6 prompts de diseno, tipografia y fotografia frente a referencia BF16.

| Config | TE (GiB) | DiT (GiB) | Combinado (GiB) | Pico VRAM DiT (GiB) | Velocidad (s/img) | PSNR medio | SSIM medio | Cosine latente |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| BF16 referencia | 33,56 | 11,46 | 45,02 | 11,96 | 14,64 | — | 1,0000 | 1,000000 |
| Comfy-Org (w4a8 + int8) | 11,93 | 5,75 | 17,68 | 16,11 | 12,23 | 16,20 dB | 0,8267 | 0,806832 |
| `yebisu_12gb` | 9,43 | 4,14 | 13,57 | 14,50 | 11,61 | 17,01 dB | 0,8251 | 0,795910 |
| `yebisu_16gb` | 12,48 | 5,23 | 17,71 | 15,59 | 12,53 | 18,33 dB | 0,8397 | 0,813542 |
| `yebisu_24gb` (recomendada) | 14,94 | 6,33 | 21,27 | 16,68 | 13,29 | 21,95 dB | 0,9115 | 0,911218 |
| `yebisu_32gb` (todo residente) | 18,80 | 8,17 | 26,97 | 18,53 | 15,27 | 20,64 dB | 0,9001 | 0,898465 |
| `yebisu_q6` (W6A8 GPTQ) | 15,20 | 4,94 | 20,14 | 15,29 | 12,06 | 18,76 dB | 0,8590 | 0,834878 |
| `yebisu_q8` (INT8 ConvRot) | 17,87 | 5,87 | 23,74 | 16,22 | 12,24 | 20,64 dB | 0,8941 | 0,886689 |

Fidelidad del codificador de texto aislado (`CLIPLoader`):

| Variante | Fichero | Tamano (GiB) | Pico VRAM (GiB) | Cosine vs BF16 | RelMSE vs BF16 |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `yebisu_12gb` | `ming_image_0.2_ling_mini_2.0_yebisu_12gb.safetensors` | 9,43 | 13,05 | 0,998787 | 0,002447 |
| `yebisu_16gb` | `ming_image_0.2_ling_mini_2.0_yebisu_16gb.safetensors` | 12,48 | 16,10 | 0,999538 | 0,000947 |
| `yebisu_24gb` | `ming_image_0.2_ling_mini_2.0_yebisu_24gb.safetensors` | 14,94 | 18,57 | 0,999693 | 0,000638 |
| `yebisu_32gb` | `ming_image_0.2_ling_mini_2.0_yebisu_32gb.safetensors` | 18,80 | 15,67 | 0,999885 | 0,000253 |

## Requisitos de hardware

- VRAM combinada del pipeline: 13,57 GiB (`yebisu_12gb`) hasta 26,97 GiB (`yebisu_32gb`), mas 0,2364 GiB del VAE en BF16.
- Pico de VRAM del DiT durante generacion: 14,50-18,53 GiB segun variante.
- GPU de 16 GB: ejecuta `yebisu_12gb` (pico DiT 14,50 GiB) y, con margen ajustado, `yebisu_q6` (15,29 GiB de pico) y `yebisu_16gb` (15,59 GiB).
- GPU de 24 GB: ejecuta `yebisu_24gb` (pico DiT 16,68 GiB) con holgura; recomendada por el autor.
- GPU de 32 GB (por ejemplo RTX 5090): permite mantener TE + DiT + VAE residentes con `yebisu_32gb` (~27,2 GiB totales).
- GPU profesional: los benchmarks se realizaron en NVIDIA L4 (22,03 GiB). No se documentan pruebas en A100 ni H100.
- Despliegue: ComfyUI estandar con backend CUDA `comfy-kitchen`; no requiere nodos personalizados ni parches del nucleo.
- Latencia observada en L4: 11,61 s/imagen (`yebisu_12gb`) a 15,27 s/imagen (`yebisu_32gb`) a 1024x1024, 12 pasos y `cfg=1.0`.
- No se documentan opciones de despliegue en vLLM, llama.cpp, Ollama ni TGI (el modelo es text-to-image, no un LLM de chat).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (PSNR / SSIM) | VRAM combinada | Licencia | Disponibilidad |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Ming-Image-0.2-Design Yebisu `yebisu_24gb` | 16B TE (2,8B activos) + 6B DiT | no disponible | 21,95 dB / 0,9115 | 21,27 GiB | MIT | Hugging Face, ComfyUI nativo |
| Ming-Image-0.2-Design Comfy-Org (w4a8 + int8) | 16B TE + 6B DiT | no disponible | 16,20 dB / 0,8267 | 17,68 GiB | MIT (modelo base) | Hugging Face, ComfyUI |
| Ming-Image-0.2-Design BF16 (referencia) | 16B TE + 6B DiT | no disponible | referencia | 45,02 GiB | MIT | Hugging Face |

No se dispone de datos de benchmarks de otros modelos text-to-image comparables en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La cuantizacion agresiva (W3/W4/W6) puede desplazar margenes de encuadre del lienzo (por ejemplo, el borde del poster en la escena 5) o distorsionar trazos finos de CJK en `yebisu_12gb` a 3 bits.
- `yebisu_12gb` y `yebisu_16gb` presentan SSIM inferior a la referencia Comfy-Org en el caso de `yebisu_12gb` (0,8251 frente a 0,8267), aunque con mejor PSNR medio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion independiente de la comunidad.
- No se documentan sesgos conocidos, tasas de alucinacion visual ni cobertura idiomatica mas alla de los ejemplos con texto latino y japones.
- La licencia MIT se aplica a esta reempaquetado; conviene verificar la licencia del modelo base `inclusionAI/Ming-Image-0.2-Design` antes de uso comercial.
- Los benchmarks se limitan a 6 prompts y a una unica GPU (NVIDIA L4); el rendimiento en otras GPU o cargas puede diferir.
- El VAE se distribuye en BF16 sin cuantizar, por lo que anade 0,2364 GiB al presupuesto de VRAM.
- No hay informacion sobre longitud de contexto del codificador de texto ni sobre limites de longitud de prompt.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/StudioYebisu-ship-it/Ming-Image-0.2-Design-Yebisu-ComfyUI
- Modelo base: https://huggingface.co/inclusionAI/Ming-Image-0.2-Design
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
