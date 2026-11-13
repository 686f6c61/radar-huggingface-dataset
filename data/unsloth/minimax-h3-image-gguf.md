# unsloth/MiniMax-H3-Image-GGUF

## Resumen

MiniMax-H3-Image es un modelo de difusión de tipo diffusion transformer (DiT) desarrollado por MiniMaxAI, orientado a generación de imágenes a partir de texto (text-to-image) y a edición de imágenes. Esta ficha cubre concretamente la versión cuantizada en GGUF publicada por Unsloth bajo el identificador `unsloth/MiniMax-H3-Image-GGUF`, que permite ejecutar el DiT en GPUs que no pueden alojar los 66 GB del modelo en bf16, así como en Apple Silicon y en CPU. El modelo base declara 20.113.670.232 parámetros en sus pesos safetensors.

La propuesta de valor de esta versión es el acceso: el DiT original en bf16 requiere unos 66 GB, lo que lo deja fuera de la mayoría de GPUs de consumo. Unsloth ofrece un abanico de cuantizaciones desde 7,75 GB (`Q2_K`) hasta 22,03 GB (`Q8_0`), con la variante recomendada `UD-Q4_K_XL` (13,61 GB) que alcanza un LPIPS de 0,172 frente al bf16 a 1024x1024 y un pico de 14,8 GiB de VRAM en una A100. Se ejecuta mediante `stable-diffusion.cpp` (soporte añadido en el PR #2324) y mediante el fork `unslothai/stable-diffusion.cpp`.

Es relevante ahora porque demuestra que un DiT de escala media-alta puede desplegarse en hardware modesto (una L4 de 24 GB, o incluso CPU) manteniendo una calidad visual razonable, con tiempos de aproximadamente 1,2 s por paso a 1024x1024 en una L4. La licencia es la MiniMax-H3-Image Community License Agreement, no una licencia open source estándar, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con cabezas por paso; codificador de texto Qwen3-VL-32B y VAE de imagen |
| Parametros totales | 20.113.670.232 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el contexto relevante es la longitud del prompt, no cuantificada en la informacion) |
| Tipos de cuantizacion | GGUF: Q2_K, UD-Q2_K_XL, Q3_K_S, Q3_K_M, UD-Q3_K_XL, Q4_K_S, Q4_K_M, UD-Q4_K_XL, Q5_K_S, Q5_K_M, UD-Q5_K_XL, Q6_K, UD-Q6_K_XL, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | MiniMax-H3-Image Community License Agreement (license: other) |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un diffusion transformer (DiT) para generación y edición de imágenes. En esta distribución GGUF, cada archivo sustituye el `transformer` en bf16 y sus cabezas por paso; la modulación temporal del DiT se almacena en forma de curva. El pipeline completo requiere tres componentes: el DiT cuantizado (los archivos de este repo), el VAE de imagen de la release original (`vae/diffusion_pytorch_model.safetensors`) y el codificador de texto MiniMax-H3 Qwen3-VL-32B, cuyo GGUF está en `unsloth/MiniMax-H3-GGUF` (`qwen3vl_32b_minimax_h3-Q4_K_M.gguf`, 18,2 GB). La carga de GGUF no ejecuta código arbitrario.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de esta publicación es la cuantización dinámica de Unsloth (archivos `UD-`), que asigna precisión de forma selectiva y logra, por ejemplo, que `UD-Q4_K_XL` (13,61 GB) supere en calidad a `Q5_K_S` (13,93 GB) pese a ocupar menos. El muestreo recomendado usa `--sigmas minimax-h3-image`, método euler, `--cfg-scale 1.0`, 6 pasos y `--rng cpu`.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en resoluciones de 1024x1024 y 2048 (se reportan métricas LPIPS/PSNR a ambas).
- Edición de imágenes mediante imágenes de referencia: se pasan una o más con `-r`/`--ref-image` y se referencian en el prompt como `<Picture 1>`, `<Picture 2>`, etc.
- Composición fotográfica realista: los ejemplos de la model card cubren paisajes fotorrealistas, rótulos con texto legible ("UNSLOTH") y manos con anatomía correcta (origami).
- Renderizado de texto en imagen (signage) con foco nítido, según el ejemplo de la model card.
- Ejecución en GPU, Apple Silicon y CPU.
- Control de memoria mediante `--max-vram` (con `--max-vram 12` renderiza la misma imagen byte a byte que sin límite, a más tiempo por paso).
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y multi-step reasoning: no disponible (no aplica).
- Capacidades multilingües: limitadas a inglés según el campo `language` del repo.

## Casos de uso

- Generación de ilustraciones y fondos para prototipos de producto en equipos con una sola GPU de 24 GB: con `UD-Q4_K_XL` y `--max-vram 12` se puede renderizar a 1024x1024 en una L4 a aproximadamente 3,9 s por paso, suficiente para iterar en local sin depender de una API.
- Edición de imágenes por referencia en flujos de retoque: pasar una foto como `<Picture 1>` y describir el cambio en el prompt permite modificar una imagen existente conservando la composición, útil para variaciones de producto o de vestuario.
- Generación de material gráfico con texto integrado (rótulos, carteles, señalética): el modelo maneja la representación de texto legible dentro de la imagen, lo que sirve para mockups de packaging o cartelería.
- Despliegue en Apple Silicon para artistas y diseñadores: al ejecutarse en CPU y en hardware Apple, permite generar imágenes en un portátil sin GPU dedicada (a 512x512, aproximadamente 47 s por imagen en CPU).
- Pipeline de aumento de datos visuales: generar variaciones fotorrealistas de escenas (paisajes, interiores) para entrenar o evaluar otros modelos de visión, controlando la semilla y la resolución.
- Prototipado rápido de conceptos en investigación de difusión: al disponer de 14 niveles de cuantización con métricas LPIPS/PSNR frente al bf16, es un banco de pruebas para estudiar el impacto de la cuantización en la calidad generativa.
- Generación de imágenes a 2048 px para impresión o visualización de alta resolución, usando `Q8_0` (LPIPS 0,048 a 2048) cuando la VRAM lo permita (23,0 GiB de pico a 1024x1024).

## Benchmarks y rendimiento

Métricas de fidelidad frente al DiT en bf16, tomadas de la model card (LPIPS menor es mejor; PSNR mayor es mejor):

| Archivo | Tamano | LPIPS 1024 | PSNR 1024 | LPIPS 2048 | VRAM pico 1024x1024 |
|---|---|---|---|---|---|
| `Q2_K` | 7,75 GB | 0,438 | 13,9 dB | 0,435 | 9,4 GiB |
| `UD-Q2_K_XL` | 8,68 GB | 0,347 | 16,1 dB | 0,332 | 10,2 GiB |
| `Q3_K_S` | 8,77 GB | 0,347 | 16,1 dB | 0,385 | 10,3 GiB |
| `Q3_K_M` | 10,42 GB | 0,271 | 17,5 dB | 0,288 | 11,9 GiB |
| `UD-Q3_K_XL` | 11,36 GB | 0,242 | 18,1 dB | 0,233 | 12,7 GiB |
| `Q4_K_S` | 11,54 GB | 0,225 | 18,5 dB | 0,211 | 12,9 GiB |
| `Q4_K_M` | 12,72 GB | 0,195 | 19,2 dB | 0,196 | 14,0 GiB |
| `UD-Q4_K_XL` (recomendado) | 13,61 GB | 0,172 | 20,4 dB | 0,171 | 14,8 GiB |
| `Q5_K_S` | 13,93 GB | 0,173 | 21,0 dB | 0,197 | 15,2 GiB |
| `Q5_K_M` | 14,60 GB | 0,157 | 21,4 dB | 0,133 | 15,8 GiB |
| `UD-Q5_K_XL` | 15,47 GB | 0,154 | 22,2 dB | 0,113 | 16,8 GiB |
| `Q6_K` | 16,60 GB | 0,134 | 22,8 dB | 0,158 | 17,6 GiB |
| `UD-Q6_K_XL` | 17,58 GB | 0,130 | 23,2 dB | 0,128 | 18,8 GiB |
| `Q8_0` | 22,03 GB | 0,083 | 26,8 dB | 0,048 | 23,0 GiB |

Rendimiento de inferencia reportado: aproximadamente 1,2 s por paso a 1024x1024 en una L4 de 24 GB con `sd-cli` (1,7 s a través de Unsloth Studio); con `--max-vram 12`, 3,9 s por paso. En CPU, 512x512 tarda aproximadamente 47 s por imagen. No se han publicado resultados de benchmarks de calidad absoluta (FID, CLIP score, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM de inferencia según cuantización: desde 9,4 GiB (`Q2_K`) hasta 23,0 GiB (`Q8_0`) a 1024x1024; la recomendada `UD-Q4_K_XL` necesita 14,8 GiB.
- Además del DiT, hay que sumar el codificador de texto Qwen3-VL-32B en GGUF (`qwen3vl_32b_minimax_h3-Q4_K_M.gguf`, 18,2 GB) y el VAE; el pico de VRAM reportado corresponde al DiT, por lo que el total del pipeline es mayor.
- GPU recomendadas: A100 (referencia de las mediciones), L4 de 24 GB (1,2 s por paso a 1024x1024). No se reportan mediciones en H100 ni en RTX 4090.
- Cabe en GPUs de consumo de 24 GB (por ejemplo, RTX 3090/4090) con las cuantizaciones hasta `Q8_0` para el DiT; en tarjetas de 12-16 GB conviene `UD-Q4_K_XL` o inferiores junto con `--max-vram`.
- Apple Silicon y CPU son plataformas soportadas explícitamente (CPU: ~47 s por imagen a 512x512).
- Despliegue: `stable-diffusion.cpp` upstream (soporte desde el PR #2324) y el fork `unslothai/stable-diffusion.cpp`, mediante `sd-cli`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un DiT).
- Throughput orientativo: con 6 pasos por imagen a 1024x1024, a 1,2 s por paso en L4 el total ronda los 7 s por imagen; con `--max-vram 12`, unos 23 s por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniMax-H3-Image (bf16, base) | 20,1 B | 1024 y 2048 px | safetensors | Community License | Referencia de calidad; DiT ~66 GB |
| MiniMax-H3-Image GGUF (esta ficha) | 20,1 B (mismos pesos cuantizados) | 1024 y 2048 px | GGUF | Community License | 14 niveles de cuantizacion; LPIPS 0,083-0,438 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se proporcionan modelos comparables en la informacion |

No se dispone de datos de otros modelos de difusión comparables (por ejemplo, de la familia Stable Diffusion o Flux) en la información proporcionada, por lo que no se incluyen cifras de comparación que no estén respaldadas.

## Limitaciones y advertencias

- Licencia MiniMax-H3-Image Community License Agreement: no es una licencia open source estándar; revisar sus términos antes de cualquier uso comercial. Los archivos son "Model Derivatives" del modelo base y quedan sujetos a esa licencia.
- Idioma: solo inglés declarado; los prompts en castellano no están garantizados.
- La calidad depende fuertemente de la cuantización: `Q2_K` tiene LPIPS 0,438 y PSNR 13,9 dB frente al bf16, una degradación considerable; para producción conviene `UD-Q4_K_XL` o superior.
- El pico de VRAM reportado corresponde solo al DiT; el pipeline completo suma el codificador Qwen3-VL-32B (18,2 GB en Q4_K_M) y el VAE, por lo que el requisito real de memoria es mayor.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomías, texto o geometrías incorrectas; los ejemplos de la model card no garantizan consistencia en todos los prompts.
- Sesgos: no se documentan en la información disponible; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base, no detallados.
- Para edición, es necesario ajustar `-W` (la model card indica "For editing, set `-W`" sin completar el valor en la información extraída), lo que puede requerir consultar la documentación original.
- El repo ocupa 185,1 GB por incluir todas las cuantizaciones; descargar solo el archivo necesario.
- Solo 6 descargas y 2 likes en el momento de la consulta: ecosistema aún muy incipiente, con poca validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/unsloth/MiniMax-H3-Image-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- VAE del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/tree/main/vae
- Codificador de texto GGUF: https://huggingface.co/unsloth/MiniMax-H3-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- PR de soporte MiniMax-H3-Image: https://github.com/leejet/stable-diffusion.cpp/pull/2324
- Fork de Unsloth: https://github.com/unslothai/stable-diffusion.cpp
- Unsloth: https://github.com/unslothai/unsloth/
- Documentación de Unsloth: https://unsloth.ai/docs
- Discord de Unsloth: https://discord.gg/unsloth
