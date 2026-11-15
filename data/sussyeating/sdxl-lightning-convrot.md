# SUSSYEATING/SDXL-Lightning-ConvRot

## Resumen

SDXL-Lightning-ConvRot es una familia de checkpoints cuantizados del modelo de difusion ByteDance/SDXL-Lightning, publicada por el usuario SUSSYEATING en Hugging Face. El modelo base es un SDXL afinado para generar imagenes de 1024x1024 en solo 4 pasos de muestreo, y esta variante aplica una cuantizacion propia denominada ConvRot sobre el UNet (cuantizacion lineal por capas con correccion de sesgo por calibracion), manteniendo Conv2d, los codificadores de texto CLIP y el VAE en FP16.

El interes practico esta en la reduccion de peso del checkpoint sin reentrenar: el fichero INT8 ocupa 5,03 GB frente a los 6,94 GB del FP16 (-27,5%), y las variantes experimentales INT6 empaquetadas bajan hasta 4,16 GB (-40,0%). Se distribuye como single-file listo para soltar en `ComfyUI/models/checkpoints/` y cargar con el nodo estandar `Load Checkpoint`, lo que lo hace atractivo para entornos con VRAM ajustada o para distribuir modelos por red.

No es un modelo de lenguaje: no procesa texto generativo ni tool calling, sino que es un modelo texto-a-imagen. La model card incluye metricas de fidelidad frente al FP16 (coseno, SSIM, PSNR) y comparaciones visuales, lo que permite evaluar la perdida de calidad de cada nivel de cuantizacion antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusion SDXL (latent diffusion) con cuantizacion ConvRot; codificadores CLIP y VAE en FP16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; resolucion nativa 1024x1024) |
| Tipos de cuantizacion | INT8 (659/739 capas) y INT6 (W6A8, variantes protected y all-linear); Conv2d, CLIP y VAE sin cuantizar |
| Idiomas soportados | no disponible (prompts en lenguaje natural, sin lista oficial) |
| Licencia | CreativeML Open RAIL++-M (openrail++) |
| Formato de pesos | safetensors (single-file ComfyUI); variantes `*-packed.safetensors` para INT6 |
| Pasos de muestreo | 4 pasos (SDXL-Lightning) |
| Tamano del repo | 23,5 GB |
| Modelo base | ByteDance/SDXL-Lightning |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SDXL: un UNet latent diffusion con doble codificador de texto CLIP y un VAE, afinado por ByteDance para destilacion de pocos pasos (4 pasos en esta variante). Sobre esa base, el autor aplica ConvRot, una cuantizacion lineal por capas del UNet con correccion de sesgo mediante calibracion. La cuantizacion afecta a 659 de las 739 capas del UNet; las 80 restantes se mantienen en FP16 como capas protegidas por su sensibilidad. Las convoluciones (Conv2d), los codificadores CLIP y el VAE quedan fuera del proceso de cuantizacion.

No se documenta en la informacion disponible ningun reentrenamiento, fine-tuning adicional ni dataset propio: la intervencion es exclusivamente de compresion post-entrenamiento. La model card reporta metricas de deriva frente al checkpoint FP16 de referencia, ademas de una linea base BF16 vs FP16, y publica un ranking de impacto por sensibilidad en `metrics/impact_lightning.json`. Las variantes INT6 se ofrecen en dos esquemas: "protected" (659 capas INT6 + 80 FP16) y "all-linear" (739/739 capas INT6).

## Capacidades

- Generacion texto-a-imagen a 1024x1024 en 4 pasos de muestreo con scheduler `sgm_uniform`.
- Ejecucion directa en ComfyUI (>= v0.45.0) mediante el nodo `Load Checkpoint`, sin nodos personalizados.
- Tres niveles de compromiso tamano/calidad: INT8 (5,03 GB), INT6 protected (4,57 GB empaquetado) e INT6 all-linear (4,16 GB empaquetado).
- Variantes INT6 empaquetadas con script de desempaquetado (`scripts/unpack_int6.py`) para reducir el peso de descarga.
- Fidelidad medida frente a FP16: INT8 alcanza coseno 0,99401, SSIM 0,95126 y PSNR 33,42 dB de media.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video.
- Capacidad multilingue de prompts no documentada en la informacion disponible.

## Casos de uso

- Despliegue en GPUs de consumo con VRAM limitada: el checkpoint INT8 de 5,03 GB permite cargar SDXL-Lightning en tarjetas donde el FP16 de 6,94 GB no entra con margen para el VAE y los buffers de inferencia.
- Generacion rapida de borradores visuales en 4 pasos: util para iterar sobre conceptos artisticos o maquetas donde prima la velocidad sobre la fidelidad absoluta al FP16.
- Distribucion de modelos por red o en repositorios: las variantes INT6 empaquetadas reducen el peso hasta un 40,0%, lo que abarata el ancho de banda en despliegues con muchos nodos.
- Pipelines de ComfyUI existentes: al ser single-file y cargarse con el nodo estandar, se puede sustituir el checkpoint FP16 por el INT8 sin reescribir el grafo.
- Generacion de imagenes en entornos con almacenamiento restringido (contenedores, dispositivos edge con disco pequeno): el ahorro de 1,9 GB por checkpoint es relevante cuando se alojan varias variantes.
- Evaluacion comparativa de cuantizacion: las metricas publicadas (coseno, SSIM, PSNR y velocidad) sirven como referencia para decidir entre INT8 e INT6 segun la tolerancia a la perdida de calidad en un caso concreto.

## Benchmarks y rendimiento

Metricas de la model card sobre GPU G4, ComfyUI v0.45.0, 8 prompts a 1024x1024, comparadas contra el checkpoint FP16 sin cuantizar. La columna BF16 Ref es la deriva BF16 vs FP16 como linea base.

| Variante | CosMean / Min | SSIM Mean / Min | PSNR Mean / Min | BF16 Ref (Cos / SSIM / PSNR) | Velocidad media en caliente |
|---|---|---|---|---|---|
| INT8 ConvRot (659/739) | 0,99401 / 0,97584 | 0,95126 / 0,89363 | 33,42 / 29,28 dB | 0,99348 / 0,94868 / 32,76 dB | 0,35 s (FP16: 0,15 s) |
| W6A8 INT6 Protected ConvRot | 0,97686 / 0,95608 | 0,88127 / 0,83725 | 26,20 / 22,48 dB | 0,99348 / 0,94868 / 32,76 dB | 0,35 s |
| W6A8 INT6 All ConvRot | 0,97232 / 0,94586 | 0,86867 / 0,81594 | 26,20 / 22,48 dB | 0,99348 / 0,94868 / 32,76 dB | 0,37 s |

Observacion: el INT8 iguala o supera ligeramente la deriva BF16 de referencia en coseno y PSNR, mientras que las variantes INT6 muestran una perdida notable de PSNR (26,20 dB frente a 33,42 dB del INT8). No se han publicado resultados de benchmarks estandar de calidad de imagen (FID, CLIP score) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint INT8 de 5,03 GB requiere al menos ~6-7 GB de VRAM para cargar pesos mas activaciones a 1024x1024; el FP16 equivalente parte de ~7 GB. Las cifras exactas dependen de la implementacion y del batch.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para INT8 a 1024x1024; para INT6 empaquetado, el desempaquetado previo genera un fichero de ~5 GB, por lo que el requisito de VRAM es similar al INT8.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante) para INT8; el FP16 original de 6,94 GB queda mas justo en 8 GB.
- Opciones de despliegue: ComfyUI >= v0.45.0 con el nodo `Load Checkpoint`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusion de este tipo).
- Latencia y throughput: 0,35 s por imagen en caliente para INT8 e INT6 protected, 0,37 s para INT6 all-linear, frente a 0,15 s del FP16, medidos en GPU G4 con 4 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Calidad frente a FP16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SDXL-Lightning-ConvRot INT8 (este) | no disponible | 1024x1024, 4 pasos | Cos 0,99401 / PSNR 33,42 dB | Open RAIL++-M | Hugging Face, single-file ComfyUI |
| ByteDance/SDXL-Lightning (FP16) | no disponible | 1024x1024, 4 pasos | Referencia (1,0) | Open RAIL++-M | Hugging Face |
| SUSSYEATING/SDXL-Turbo-ConvRot | no disponible | 1024x1024, pocos pasos | no disponible | Stability AI Community License | Hugging Face |
| SUSSYEATING/SDXL-Base-1.0-ConvRot | no disponible | 1024x1024 | no disponible | Open RAIL++-M | Hugging Face |

La comparativa se limita a variantes del mismo autor y al modelo base, ya que no se dispone de datos de benchmarks de terceros (FID, CLIP score) en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad medible: el INT8 mantiene una fidelidad alta (SSIM 0,95126, PSNR 33,42 dB), pero las variantes INT6 caen a SSIM 0,88127 / 0,86867 y PSNR 26,20 dB, lo que puede traducirse en artefactos visibles en imagenes detalladas.
- Mayor latencia que el FP16: 0,35-0,37 s frente a 0,15 s por imagen en la GPU de referencia, un factor superior a 2x.
- Riesgo de sesgo y alucinacion visual: al derivar de SDXL, hereda los sesgos del dataset de entrenamiento original; no se documenta ninguna mitigacion adicional en esta variante.
- Restricciones de licencia: CreativeML Open RAIL++-M incluye clausulas de uso aceptable; es obligatorio propagar `LICENSE.md` y `NOTICE` en cualquier redistribucion, y se debe revisar la compatibilidad con el uso comercial previsto.
- Atribuciones obligatorias: Copyright (c) 2024 Bytedance Inc. y Copyright (c) 2023 Stability AI deben mantenerse en los avisos.
- Dependencia de version: requiere ComfyUI >= v0.45.0; versiones anteriores pueden no cargar correctamente los checkpoints cuantizados.
- Idiomas de prompt no documentados: no hay lista oficial de idiomas soportados, por lo que la cobertura multilingue no esta garantizada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes independientes de calidad.
- Las variantes INT6 empaquetadas requieren ejecutar `scripts/unpack_int6.py` antes de su uso en ComfyUI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SUSSYEATING/SDXL-Lightning-ConvRot
- Modelo base: https://huggingface.co/ByteDance/SDXL-Lightning
- SDXL-Base-1.0-ConvRot: https://huggingface.co/SUSSYEATING/SDXL-Base-1.0-ConvRot
- SDXL-Refiner-1.0-ConvRot: https://huggingface.co/SUSSYEATING/SDXL-Refiner-1.0-ConvRot
- SDXL-Turbo-ConvRot: https://huggingface.co/SUSSYEATING/SDXL-Turbo-ConvRot
- Licencia CreativeML Open RAIL++-M: https://huggingface.co/SUSSYEATING/SDXL-Lightning-ConvRot/blob/main/LICENSE.md
- Aviso de atribuciones: https://huggingface.co/SUSSYEATING/SDXL-Lightning-ConvRot/blob/main/NOTICE
- Script de desempaquetado INT6: https://huggingface.co/SUSSYEATING/SDXL-Lightning-ConvRot/blob/main/scripts/unpack_int6.py
