# unsloth/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image-GGUF es la versión cuantizada del difusor de imagen MiniMax-H3-Image de MiniMaxAI, publicada por Unsloth. Se trata de un transformer de difusión (DiT) para generación de imágenes a partir de texto (text-to-image) y edición de imágenes guiada por prompt, con soporte de imágenes de referencia. El modelo original en bf16 ocupa unos 66 GB, lo que lo deja fuera del alcance de la mayoría de GPUs de consumo; esta colección de GGUF lo reduce hasta 7,75 GB en su variante más agresiva y 13,61 GB en la recomendada `UD-Q4_K_XL`.

La relevancia práctica está en que permite ejecutar un DiT de gran tamaño en hardware modesto: una L4 de 24 GB, Apple Silicon o incluso CPU, usando `stable-diffusion.cpp` (soporte upstream desde el PR #2324) o la build de Unsloth. El pipeline completo requiere además el VAE original (`vae/diffusion_pytorch_model.safetensors`) y un codificador de texto Qwen3-VL-32B en GGUF, disponible en el repo hermano `unsloth/MiniMax-H3-GGUF`.

Los pesos cuantizados conservan la licencia del modelo base (MiniMax-H3-Image Community License Agreement), son derivados del modelo original y están pensados exclusivamente para inferencia en inglés. El repo acumula más de 126.000 descargas y 30 likes en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT); pesos bf16 cuantizados a GGUF, modulación temporal almacenada en forma de curva |
| Parámetros totales | 20.113.670.232 (dato del modelo base en safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, UD-Q2_K_XL, Q3_K_S, Q3_K_M, UD-Q3_K_XL, Q4_K_S, Q4_K_M, UD-Q4_K_XL, Q5_K_S, Q5_K_M, UD-Q5_K_XL, Q6_K, UD-Q6_K_XL, Q8_0 (los `UD-` son Unsloth Dynamic) |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | GGUF (DiT cuantizado); VAE en safetensors; text encoder Qwen3-VL-32B en GGUF |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer (DiT) que sustituye al UNet clásico en el pipeline de difusión. La versión publicada aquí no reentrena el modelo: cuantiza el DiT bf16 original y almacena su modulación temporal en forma de curva, de modo que cada archivo GGUF reemplaza al `transformer` bf16 y a sus cabezas por paso. El pipeline completo se compone de tres piezas: el DiT cuantizado, el VAE de la release original (`vae/diffusion_pytorch_model.safetensors`) y el codificador de texto MiniMax-H3 Qwen3-VL-32B, cuyo GGUF (`qwen3vl_32b_minimax_h3-Q4_K_M.gguf`, 18,2 GB) está en `unsloth/MiniMax-H3-GGUF`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO, ya que la model card de esta derivada no los detalla. La innovación técnica relevante es la propia cuantización dinámica de Unsloth: los archivos `UD-*` asignan precisión de forma selectiva para minimizar la degradación perceptual, medida con LPIPS y PSNR frente al DiT bf16 a 1024x1024 y 2048. La carga de GGUF no ejecuta código arbitrario. El muestreo recomendado usa `--sampling-method euler` con `--sigmas minimax-h3-image`, `--cfg-scale 1.0`, 6 pasos y `--rng cpu`.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en resoluciones de 1024x1024 y 2048, con calidad fotográfica y detalle fino según los ejemplos de la model card (paisaje glaciar, rótulos con texto legible, anatomía de manos).
- Edición de imágenes guiada por prompt: se pasan una o varias imágenes de referencia con `-r` / `--ref-image` y se referencian en el prompt como `<Picture 1>`, `<Picture 2>`, etc.
- Composición multi-referencia: admite varias imágenes de entrada en el mismo prompt de edición.
- Renderizado de texto en imagen: el ejemplo de la model card incluye un rótulo con la palabra "UNSLOTH" en letras nítidas.
- Ejecución en GPU, Apple Silicon y CPU mediante `stable-diffusion.cpp` (upstream y build de Unsloth).
- Control de memoria: la opción `--max-vram 12` permite renderizar con 12 GB de VRAM obteniendo la misma imagen byte a byte que sin la restricción.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio o visión general más allá del uso de imágenes de referencia para edición.

## Casos de uso

- Generación de ilustraciones y fotografía conceptual en estaciones de trabajo con GPU de 24 GB: con `UD-Q4_K_XL` (13,61 GB) y `--max-vram 12` se obtiene la misma imagen byte a byte que sin restricción, a 3,9 s por paso, lo que permite iterar prompts en una L4 sin necesidad de A100.
- Edición de imágenes por prompt en flujos de retoque: pasar una foto como `<Picture 1>` y describir el cambio permite modificar escenas sin herramientas de máscara, útil para previsualización rápida de cambios de vestuario, iluminación o fondo.
- Prototipado en Apple Silicon: los GGUF de menor tamaño (`UD-Q2_K_XL`, 8,68 GB) caben en portátiles con memoria unificada, lo que facilita demos locales sin GPU dedicada.
- Generación por lotes en CPU para entornos sin GPU: a 512x512 el modelo tarda unos 47 s por imagen, aceptable para renders nocturnos o pipelines de baja prioridad.
- Creación de material gráfico con texto integrado (rótulos, carteles, señalética): el modelo resuelve texto legible en la imagen, como demuestra el ejemplo del cartel "UNSLOTH".
- Integración en pipelines de CI/CD o servicios internos mediante `sd-cli`: la invocación por línea de comandos con parámetros fijos (pasos, sigmas, cfg, rng) hace el proceso reproducible y scriptable.
- Evaluación y comparación de cuantizaciones: la tabla de LPIPS/PSNR del repo permite elegir el archivo según el compromiso calidad/memoria, útil para equipos que calibran infraestructura de inferencia.

## Benchmarks y rendimiento

La model card publica métricas de fidelidad frente al DiT bf16 (LPIPS menor es mejor) y de rendimiento en inferencia:

| Archivo | Tamaño | LPIPS 1024 (IC 95%) | PSNR 1024 | LPIPS 2048 | VRAM pico 1024x1024 |
|---|---|---|---|---|---|
| Q2_K | 7,75 GB | 0,438 (0,375-0,481) | 13,9 dB | 0,435 | 9,4 GiB |
| UD-Q2_K_XL | 8,68 GB | 0,347 (0,261-0,414) | 16,1 dB | 0,332 | 10,2 GiB |
| Q3_K_S | 8,77 GB | 0,347 (0,262-0,414) | 16,1 dB | 0,385 | 10,3 GiB |
| Q3_K_M | 10,42 GB | 0,271 (0,199-0,339) | 17,5 dB | 0,288 | 11,9 GiB |
| UD-Q3_K_XL | 11,36 GB | 0,242 (0,164-0,324) | 18,1 dB | 0,233 | 12,7 GiB |
| Q4_K_S | 11,54 GB | 0,225 (0,150-0,308) | 18,5 dB | 0,211 | 12,9 GiB |
| Q4_K_M | 12,72 GB | 0,195 (0,136-0,246) | 19,2 dB | 0,196 | 14,0 GiB |
| UD-Q4_K_XL (recomendado) | 13,61 GB | 0,172 (0,110-0,235) | 20,4 dB | 0,171 | 14,8 GiB |
| Q5_K_S | 13,93 GB | 0,173 (0,107-0,242) | 21,0 dB | 0,197 | 15,2 GiB |
| Q5_K_M | 14,60 GB | 0,157 (0,098-0,210) | 21,4 dB | 0,133 | 15,8 GiB |
| UD-Q5_K_XL | 15,47 GB | 0,154 (0,092-0,211) | 22,2 dB | 0,113 | 16,8 GiB |
| Q6_K | 16,60 GB | 0,134 (0,076-0,194) | 22,8 dB | 0,158 | 17,6 GiB |
| UD-Q6_K_XL | 17,58 GB | 0,130 (0,072-0,185) | 23,2 dB | 0,128 | 18,8 GiB |
| Q8_0 | 22,03 GB | 0,083 (0,039-0,129) | 26,8 dB | 0,048 | 23,0 GiB |

Rendimiento declarado en la model card:

| Escenario | Resultado |
|---|---|
| L4 24 GB, 1024x1024, `sd-cli` | ~1,2 s por paso |
| L4 24 GB, 1024x1024, Unsloth Studio | ~1,7 s por paso |
| L4 24 GB con `--max-vram 12` | 3,9 s por paso, imagen idéntica byte a byte |
| CPU, 512x512 | ~47 s por imagen |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM pico a 1024x1024: desde 9,4 GiB (`Q2_K`) hasta 23,0 GiB (`Q8_0`); el recomendado `UD-Q4_K_XL` requiere 14,8 GiB.
- GPU recomendadas: L4 de 24 GB validada por el autor; A100 para el recomendado según la model card (14,8 GiB pico); cualquier GPU con 16-24 GB (RTX 4090, RTX 4080, A10, L40S) debería alojar las variantes Q4-Q5, aunque solo la L4 y la A100 aparecen citadas explícitamente.
- Cabe en GPU de consumo: sí, las variantes Q2 a Q4 caben en tarjetas de 12-16 GB; `Q8_0` (23 GiB) queda al límite de una RTX 4090 de 24 GB.
- Apple Silicon: soportado mediante `stable-diffusion.cpp`, sin cifras de rendimiento publicadas.
- CPU: soportado; ~47 s por imagen a 512x512.
- Opciones de despliegue: `stable-diffusion.cpp` upstream (PR #2324), build `unslothai/stable-diffusion.cpp`, `sd-cli`, Unsloth Desktop / Unsloth Studio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un DiT.
- Piezas adicionales obligatorias: VAE original en safetensors y text encoder Qwen3-VL-32B GGUF (18,2 GB), lo que suma memoria y disco al DiT.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / cuantización | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image (bf16, original) | 20,1 B | safetensors bf16, ~66 GB | 1024 y 2048 | MiniMax-H3-Image Community License | Hugging Face (MiniMaxAI) |
| MiniMax-H3-Image-GGUF (este) | 20,1 B | GGUF Q2-Q8, 7,75-22,03 GB | 1024 y 2048 | misma licencia (derivado) | Hugging Face (unsloth) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros DiT comparables (por ejemplo, FLUX u otros) que permitan una comparación cuantitativa de parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés (`en`); los prompts en castellano no están garantizados.
- Licencia: MiniMax-H3-Image Community License Agreement, no es una licencia permisiva tipo Apache o MIT. Es obligatorio revisar sus términos antes de cualquier uso comercial; los GGUF son derivados y heredan la licencia.
- Degradación por cuantización: las variantes pequeñas pierden fidelidad de forma notable. `Q2_K` tiene LPIPS 0,438 y PSNR 13,9 dB frente a bf16; solo `Q8_0` (LPIPS 0,083) se acerca al original. Para producción con requisitos de calidad conviene `UD-Q4_K_XL` o superior.
- Dependencia de múltiples artefactos: el DiT por sí solo no genera imágenes; requiere VAE original y el text encoder Qwen3-VL-32B (18,2 GB), lo que eleva el consumo total de VRAM y disco muy por encima del tamaño del GGUF.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomía incorrecta (el ejemplo de manos en origami sugiere que es un punto delicado), texto mal formado o elementos incoherentes con el prompt.
- Sesgos: no se documentan análisis de sesgo en la información disponible; cabe esperar los sesgos del dataset de entrenamiento original, no detallado.
- Sin métricas de calidad estándar: no hay FID, CLIP score ni evaluaciones humanas publicadas; las únicas métricas son de fidelidad frente al bf16, no de calidad absoluta.
- Compatibilidad: el soporte en `stable-diffusion.cpp` es reciente (PR #2324); versiones antiguas no cargarán estos archivos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unsloth/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- VAE original: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/tree/main/vae
- Text encoder GGUF (Qwen3-VL-32B): https://huggingface.co/unsloth/MiniMax-H3-GGUF
- stable-diffusion.cpp upstream: https://github.com/leejet/stable-diffusion.cpp
- PR de soporte MiniMax-H3-Image: https://github.com/leejet/stable-diffusion.cpp/pull/2324
- Fork de Unsloth de stable-diffusion.cpp: https://github.com/unslothai/stable-diffusion.cpp
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Documentación de Unsloth para MiniMax-H3-Image: https://unsloth.ai/docs/models/minimax-h3-image
- Documentación de Unsloth Desktop: https://unsloth.ai/docs/desktop
- Web de Unsloth: https://unsloth.ai/
