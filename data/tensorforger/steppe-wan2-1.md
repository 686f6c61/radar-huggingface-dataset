# TensorForger/Steppe-Wan2.1

## Resumen

Steppe-Wan2.1 es una familia de upscalers latentes generativos desarrollada por TensorForger. No es un modelo de difusion completo ni un modelo de lenguaje: son redes pequenas (19,5M y 222M de parametros) entrenadas exclusivamente para aumentar resolucion y tasa de fotogramas operando directamente sobre los latentes del VAE de Wan 2.1. El latente ampliado se decodifica directamente con el VAE, sin una segunda pasada de muestreo del modelo base, sin hires fix y sin prompt.

Su relevancia practica es que el espacio latente del VAE de Wan 2.1 es compartido por Wan 2.1 (T2V, I2V, FLF2V, VACE en 1.3B y 14B), Wan 2.2 A14B y Qwen-Image / Qwen-Image-Edit, de modo que un unico upscaler sirve para todos esos modelos. Ofrece 2x de resolucion (512 a 1024, 1024 a 2048, o encadenado 2x a 2x) y 2x de tasa de fotogramas mediante interpolacion latente, en un solo paso de ~45 ms para una imagen de 1024 px en una RTX 5090.

La arquitectura es un transformer de ventanas con bloques adaLN-zero estilo DiT, atencion de ventana 8x8 desplazada y convolucion temporal depthwise causal, que genera el residuo normalizado sobre el latente de baja resolucion alineado mediante rectified flow. Se distribuye en safetensors bfloat16 con licencia MIT y se integra en ComfyUI mediante el nodo ComfyUI-Steppe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de ventanas (window transformer) con bloques adaLN-zero estilo DiT, atencion de ventana 8x8 desplazada y convolucion temporal depthwise causal; genera residuo normalizado con rectified flow |
| Parametros totales | 222M (variantes `200M`) y 19,5M (variante `20M`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de texto; opera sobre rejillas de latentes) |
| Tipos de cuantizacion | No disponible; los pesos se publican en bfloat16 |
| Idiomas soportados | No disponible (no procesa texto; no usa prompt) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16), con la configuracion del modelo en los metadatos |

## Arquitectura y entrenamiento

El modelo opera sobre la rejilla de latentes a resolucion completa. Un codificador de fuente aprendido sobremuestrea el latente de entrada y el transformer genera el residuo normalizado sobre el latente de baja resolucion alineado, condicionado por el nivel de ruido y por la caracteristica de alta frecuencia (`hff`). La atencion es de ventana 8x8 desplazada, lo que limita el coste computacional y permite procesar rejillas grandes; la convolucion temporal depthwise es causal, lo que habilita la interpolacion de fotogramas sin filtrar informacion del futuro.

La variante base de 222M se entreno desde cero durante aproximadamente 46 horas sobre 6 RTX 5090, con datos de ReLAION (la model card queda truncada en ese punto). Existen tres ficheros: `steppe_wan_2_1_200M_1step.safetensors` (222M, destilado a 1 paso, uso por defecto), `steppe_wan_2_1_200M_base.safetensors` (222M, 1 a 200 pasos, con CFG sobre `hff`, pensado para encadenar 2x a 2x) y `steppe_wan_2_1_20M_1step.safetensors` (19,5M, para salidas muy grandes como 2048 a 4096 y uso en tiempo real o streaming). El sampler del modelo base recomendado es Euler a 20 pasos con sigma shift 4; la escala de ruido inicial es 1,0 para sobremuestreo espacial y 0,8 para solo temporal. En modo temporal 2x, T fotogramas latentes pasan a 1 + 2(T - 1), es decir, 81 a 161 fotogramas de pixel, conservando el primero.

## Capacidades

- Sobremuestreo espacial 2x de imagenes y videos sobre latentes del VAE de Wan 2.1: 512 a 1024, 1024 a 2048, y encadenado 2x a 2x.
- Interpolacion temporal 2x de videos a nivel de latente, combinable con el 2x espacial.
- Inferencia en un solo paso en las variantes destiladas: ~45 ms para una imagen de 1024 px en RTX 5090, con la mayor parte del tiempo en el decode del VAE.
- Control de nitidez y detalle fino mediante el condicionamiento `hff` (rango 0 a 1, por defecto 0,9; `-1` deja decidir al modelo), con valores absolutos basados en una estimacion de ruido de Immerkaer normalizada por cuantiles sobre fotos de ReLAION.
- Guiado destilado en los modelos de 1 paso (entrenado en 1 a 3, por defecto 2) sin coste adicional; en el modelo base, CFG entre `hff` y `hff` nulo con coste de dos pasadas por paso.
- Compatibilidad nativa con Wan 2.1 (T2V, I2V, FLF2V, VACE; 1.3B y 14B) y Wan 2.2 A14B (T2V, I2V); mismo espacio latente con Qwen-Image y Qwen-Image-Edit.
- No soporta Wan 2.2 TI2V 5B (VAE de 48 canales) ni VAEs de FLUX, SD3 o SDXL.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingues ni modo thinking: no es un modelo generativo de texto.

## Casos de uso

- Restauracion y ampliacion de fotogramas generados con Wan 2.1 o Wan 2.2 A14B: insertar el nodo `Steppe Upscale Latent` entre el `KSampler` y el `VAE Decode` en ComfyUI permite pasar de 512 a 1024 sin relanzar el muestreo del modelo base ni reescribir el prompt.
- Interpolacion de fotogramas en pipelines de video: con `temporal=True` se duplica la tasa de fotogramas (81 a 161 fotogramas de pixel), util para convertir clips generados a 24 fps en material a 48 fps para reproduccion o montaje.
- Ampliacion encadenada para produccion de alta resolucion: el modelo base de 222M con 20 pasos Euler y CFG sobre `hff` esta pensado para cadenas 2x a 2x (por ejemplo, 512 a 1024 a 2048) donde el control por pasos importa mas que la latencia.
- Streaming y tiempo real: la variante de 19,5M en un paso, con 141 ms y 4,5 GB de VRAM pico en el benchmark, permite ampliar salidas muy grandes (2048 a 4096) o alimentar visores interactivos sin bloquear el pipeline.
- Postprocesado en flujos de Qwen-Image y Qwen-Image-Edit: al compartir espacio latente (el codificador de Qwen-Image es identico al de Wan 2.1, con decoder afinado), el upscaler se aplica a imagenes editadas o generadas por esos modelos sin reentrenamiento.
- Reduccion de coste frente a hires fix: sustituir una segunda pasada del modelo base de 14B por un upscaler de 222M baja el consumo de VRAM pico a ~5 GB y evita el remuestreo completo, manteniendo un patch FID de 4,36 en la variante de un paso.
- Integracion programatica fuera de ComfyUI: la API de Python (`load_upscaler`, `UpscaleSettings`, `upscaler.upscale`) permite insertar el paso de ampliacion en servicios de generacion de imagen o video basados en diffusers.

## Benchmarks y rendimiento

Benchmark publicado por el autor: 1000 fotos (Axis-V1), 512 a 1024, sin prompt (solo el latente de Wan 2.1). Patch FID sobre teselas nativas de 256 px (menor es mejor); latencia con batch 1, decode del VAE incluido, RTX 5090, bfloat16 eager.

| Solucion | Patch FID | FID | Latencia | VRAM pico |
|---|---|---|---|---|
| Steppe 200M base, 20 pasos | 4,31 | 3,01 | 1051 ms | 5,0 GB |
| Steppe 200M 1-step | 4,36 | 3,07 | 179 ms | 4,9 GB |
| Steppe 20M 1-step | 5,85 | 3,85 | 141 ms | 4,5 GB |
| Wan2.1-VAE-upscale2x decoder (spacepxl) | 6,33 | 5,80 | 29 ms | 1,3 GB |
| SPAN 2x tras decode | 11,19 | 4,83 | 35 ms | 1,3 GB |
| Real-ESRGAN x2 tras decode | 13,83 | 8,83 | 57 ms | 1,3 GB |
| Bicubic tras decode | 14,13 | 3,33 | 30 ms | 1,3 GB |
| SesquiLSR (latente, para hires fix) | 29,23 | 7,65 | 136 ms | 4,5 GB |

El autor indica ademas que el error de color de ida y vuelta (ΔE00 2,36) iguala el suelo de reconstruccion del VAE. No se han publicado resultados de MMLU, HumanEval ni GSM8K por no ser un modelo de texto.

## Requisitos de hardware

- VRAM estimada: ~4,5 GB pico para la variante de 19,5M y ~4,9-5,0 GB para las de 222M, segun el benchmark del autor en RTX 5090 (incluye decode del VAE).
- GPU recomendadas: RTX 5090 como referencia medida; cualquier GPU con al menos ~6 GB de VRAM libre deberia acomodar las variantes de 222M, aunque no se han publicado mediciones en otras tarjetas.
- Cabe en GPU de consumo: si, con el margen de VRAM indicado; el cuello de botella declarado es el decode del VAE, no el upscaler.
- Opciones de despliegue: ComfyUI mediante ComfyUI-Steppe (instalable desde ComfyUI-Manager o con `comfy node install steppe`); uso standalone en Python con `pip install "steppe[standalone] @ git+https://github.com/TensorForger/ComfyUI-Steppe"` junto a `AutoencoderKLWan` de diffusers. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~45 ms para una imagen de 1024 px con el modelo por defecto (RTX 5090); 179 ms para el 200M 1-step y 141 ms para el 20M 1-step en el benchmark 512 a 1024; 1051 ms para el 200M base a 20 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Patch FID (512 a 1024) | Licencia |
|---|---|---|---|---|---|
| Steppe 200M 1-step | Upscaler latente generativo | 222M | Residuo con rectified flow sobre latente Wan 2.1 | 4,36 | MIT |
| Wan2.1-VAE-upscale2x decoder (spacepxl) | Decoder VAE especializado | No disponible | Decoder de VAE reentrenado | 6,33 | No disponible |
| SesquiLSR | Upscaler latente para hires fix | No disponible | Pensado para hires fix | 29,23 | No disponible |
| Real-ESRGAN x2 | Superresolucion en pixeles | No disponible | GAN sobre imagen decodificada | 13,83 | No disponible |
| SPAN 2x | Superresolucion en pixeles | No disponible | Red ligera tras decode | 11,19 | No disponible |

Frente a los enfoques en pixeles (Real-ESRGAN, SPAN, bicubic), Steppe obtiene un patch FID sustancialmente menor porque opera antes del decode y conserva la coherencia del latente; su coste es mayor VRAM (~5 GB frente a ~1,3 GB) y mayor latencia que un decoder puro (179 ms frente a 29 ms en la variante de un paso).

## Limitaciones y advertencias

- Solo funciona con latentes del VAE de Wan 2.1: no soporta Wan 2.2 TI2V 5B (VAE de 48 canales) ni los VAEs de FLUX, SD3 o SDXL.
- La compatibilidad con Qwen-Image y Qwen-Image-Edit esta marcada en la model card como pendiente de confirmacion visual (nota TODO del autor); conviene validarla antes de usarla en produccion.
- No acepta prompt ni texto: no hay control semantico sobre el resultado, solo control de nitidez (`hff`) y de pasos en el modelo base.
- El benchmark se limita a 1000 fotos de Axis-V1 y a la ruta 512 a 1024; no hay datos publicados de calidad en video, en encadenados 2x a 2x ni en otras GPU.
- Riesgo de artefactos en entradas muy degradadas o fuera de la distribucion de ReLAION; el autor no documenta evaluaciones de sesgo ni de robustez.
- No hay informacion sobre sesgos, alucinacion (no aplica en sentido estricto al no generar texto) ni limitaciones por idioma.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo depende de los pesos y la licencia del VAE de Wan 2.1, cuyos terminos deben revisarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 21 de noviembre de 2026: ecosistema y validacion externa muy limitados.
- La model card esta incompleta (secciones marcadas como TODO en stage 3 y stage 4), por lo que faltan comparativas visuales y graficas de latencia frente a calidad.

## Enlaces

- Hugging Face: https://huggingface.co/TensorForger/Steppe-Wan2.1
- Repositorio ComfyUI-Steppe: https://github.com/TensorForger/ComfyUI-Steppe
- Modelo base Wan 2.1 T2V 14B: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Modelo base Wan 2.1 T2V 1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Modelo base Wan 2.1 I2V 14B 720P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P
- Modelo base Wan 2.1 I2V 14B 480P: https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-480P
- Modelo base Wan 2.2 T2V A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- Modelo base Wan 2.2 I2V A14B: https://huggingface.co/Wan-AI/Wan2.2-I2V-A14B
- Modelo base Qwen-Image: https://huggingface.co/Qwen/Qwen-Image
- Modelo base Qwen-Image-Edit: https://huggingface.co/Qwen/Qwen-Image-Edit
