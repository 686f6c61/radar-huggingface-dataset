# toxicdog/Z-Image-Turbo-bf16

## Resumen

Z-Image-Turbo-bf16 (repositorio `toxicdog/Z-Image-Turbo-bf16`) es una conversion a formato MLX en bf16 del modelo de generacion de imagenes **Tongyi-MAI/Z-Image-Turbo**, pensada para ejecutarse en Apple Silicon. No es un modelo nuevo ni un fine-tuning: se trata de un snapshot con la estructura estandar de `diffusers` (`transformer/`, `text_encoder/`, `vae/`, `tokenizer/`, `scheduler/`) en el que el transformer se almacena en bf16 y las cuantizaciones int8/int4 se producen en tiempo de carga.

La arquitectura es un **S3-DiT single-stream** de 6,15B de parametros para text-to-image, con acondicionamiento mediante una plantilla de "thinking" de **Qwen3-4B**, difusion en un unico stream y decodificacion final con el autoencoder de **FLUX.1-dev**. La variante "Turbo" esta destilada para 8 pasos de inferencia con guidance 0 (sin CFG) y un scheduler con `static shift 3.0`, lo que da un tiempo de generacion de referencia de aproximadamente 13 segundos a 1024x1024 con cuantizacion int4.

Su relevancia practica es doble: por un lado acerca la generacion de imagenes de 6B a hardware de consumo Apple (un pipeline q4 de unos 6 GB cabe en un Mac de 16 GB); por otro, el autor publica metricas de paridad numerica frente a los goldens de PyTorch, algo poco habitual en conversiones comunitarias. La licencia Apache-2.0 y el soporte de prompts en ingles y chino lo hacen utilizable en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | S3-DiT (Diffusion Transformer de un solo stream), acondicionado por text encoder Qwen3-4B y decoder VAE de FLUX.1-dev |
| Parametros totales | 6,15B en el transformer S3-DiT (el text encoder Qwen3-4B es adicional; recuento conjunto no disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion text-to-image; la ventana de tokens del encoder Qwen3-4B no se especifica en la informacion disponible) |
| Tipos de cuantizacion | bf16 en el repositorio; int8 e int4 generados en tiempo de carga (pipeline q4 ≈ 6 GB) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con estructura estandar de diffusers (`transformer/`, `text_encoder/`, `vae/`, `tokenizer/`, `scheduler/`) |
| Tamano del repositorio | 20,5 GB |
| Libreria declarada | mlx |
| Modelo base | Tongyi-MAI/Z-Image-Turbo |

## Arquitectura y entrenamiento

El modelo base es un **S3-DiT single-stream**: un transformer de difusion de 6,15B de parametros que procesa la secuencia de imagen en un unico flujo, sin la separacion en doble stream de otras familias. El texto se codifica con **Qwen3-4B** usando su plantilla de "thinking"; ese embedding condiciona al DiT, y la imagen latente final se decodifica con el autoencoder de **FLUX.1-dev**. Esta composicion (encoder de una familia, DiT propia, VAE de otra) es habitual en pipelines de difusion modernos y explica el arbol `diffusers` completo del snapshot.

La variante **Turbo** corresponde a un modelo destilado para **8 pasos** de muestreo con **guidance 0**, es decir, sin classifier-free guidance, y un scheduler con `static shift 3.0`. Esto reduce el coste de inferencia a la mitad o menos respecto a un modelo no destilado que necesita entre 20 y 50 pasos con doble evaluacion por paso. El autor advierte de que la **baja varianza entre semillas** es un rasgo propio del modelo, no un defecto de la conversion.

En cuanto al entrenamiento detallado (numero de tokens, composicion del dataset, uso de RLHF/DPO o de preferencias), **no disponible** en la informacion proporcionada. Este repositorio concreto tampoco entrena: solo convierte y preserva pesos, y publica validaciones de paridad frente a PyTorch en fp32/CPU: coseno >= 0,9999999 en el S3-DiT completo (casos alineado y con tokens rellenados), 118 dB en el decode del VAE de FLUX.1-dev, identificadores de token exactos y coseno 1,0000000 en caracteristicas del encoder Qwen3-4B, y 105-108 dB end-to-end a 256x256 en CPU.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en resoluciones de trabajo de 1024x1024, con el ejemplo documentado por el autor.
- Inferencia destilada en 8 pasos sin CFG, lo que simplifica el pipeline y evita busquedas de escala de guidance.
- Acondicionamiento de prompt mediante plantilla de "thinking" de Qwen3-4B, lo que permite prompts descriptivos largos (no se documenta el limite de tokens).
- Soporte de prompts en ingles y chino (en, zh).
- Cuantizacion en tiempo de carga a int8 e int4 desde los pesos bf16 del repositorio, reduciendo la huella residente.
- Ejecucion nativa en Apple Silicon mediante la libreria MLX y el port en Swift (paquetes `MLXZImage` y `MLXToolKit`).
- API programatica basica: `T2IRequest` con prompt, `width`, `height` y `seed`, y respuesta `T2IResponse`.
- Reproducibilidad controlada por semilla, con la salvedad de la baja varianza entre semillas indicada por el autor.

No aplica o no disponible: tool calling / function calling, agentes, razonamiento multi-paso, vision de entrada, audio, modo thinking generativo. Es un modelo de difusion, no un modelo de lenguaje.

## Casos de uso

- Generacion de imagenes local en Mac: con un pipeline q4 de aproximadamente 6 GB, el modelo cabe en un equipo Apple Silicon de 16 GB, lo que permite crear ilustraciones sin conexion ni coste por API.
- Integracion en aplicaciones nativas macOS/iOS: el port en Swift (`import MLXZImage`, `ZImageTurboT2IPackage`) permite incrustar la generacion de imagenes dentro de una app sin salir del ecosistema Swift.
- Prototipado rapido de assets graficos: los 8 pasos sin CFG y los ~13 s a 1024x1024 en int4 permiten iterar sobre bocetos y variaciones de estilo durante una sesion de diseno.
- Contenido editorial y de blog: generacion de imagenes de apoyo para articulos tecnicos, con prompts en ingles o chino y licencia Apache-2.0 que cubre el uso comercial.
- Productos orientados al mercado chino: el soporte nativo de zh en el acondicionamiento evita depender de traducciones intermedias de prompt.
- Procesamiento por lotes con coste contenido: al no requerir CFG, cada paso implica una sola evaluacion del DiT, lo que reduce el tiempo total por imagen en colas de generacion por lotes.
- Investigacion en ports y cuantizacion: las metricas de paridad (coseno, dB) lo convierten en un caso de referencia para validar implementaciones MLX frente a PyTorch, y para medir el impacto de int8/int4 en la calidad final.
- Base para fine-tuning o destilacion adicional: al ser pesos Apache-2.0 en safetensors con estructura diffusers, se puede reutilizar como punto de partida en pipelines de entrenamiento propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes de generacion como FID, CLIP score o ImageReward). Lo unico verificable son las metricas de paridad de la conversion frente a los goldens de PyTorch, que se reproducen a continuacion tal como las publica el autor:

| Validacion | Metrica | Resultado |
|---|---|---|
| S3-DiT completo (6,15B) | Similitud coseno | >= 0,9999999 (casos alineado y con tokens rellenados) |
| Decode del VAE de FLUX.1-dev | PSNR | 118 dB |
| Encoder Qwen3-4B | Identificadores de token | exactos |
| Encoder Qwen3-4B | Coseno de caracteristicas | 1,0000000 |
| Pipeline completo end-to-end | PSNR | 105-108 dB (256x256, CPU) |
| Inferencia int4 a 1024x1024 | Tiempo | ~13 s (hardware no especificado) |

## Requisitos de hardware

- Huella de memoria: el pipeline cuantizado a int4 ocupa aproximadamente 6 GB y cabe en un Mac con 16 GB de memoria unificada, segun la model card.
- Repositorio completo: 20,5 GB en disco para el snapshot bf16 (transformer en bf16 mas text encoder y VAE).
- VRAM estimada para GPU discreta: no disponible. El repositorio esta orientado a memoria unificada de Apple Silicon y no se documentan cifras para CUDA.
- GPU recomendadas: no disponible; el autor solo referencia Apple Silicon. CUDA (A100, H100, RTX 4090) no aparece en la informacion proporcionada.
- Compatibilidad con GPU de consumo: si, en el caso de Apple Silicon con al menos 16 GB de memoria unificada usando int4. No se documenta compatibilidad con GPUs de consumo NVIDIA.
- Opciones de despliegue: MLX a traves del port en Swift (repositorio `xocialize/z-image-swift`, paquetes `MLXZImage` y `MLXToolKit`). El snapshot sigue el arbol estandar de `diffusers`, pero no se confirma ni documenta el uso con vLLM, llama.cpp, Ollama o TGI (no aplicables a difusion en cualquier caso); la ruta con `diffusers` en PyTorch no esta verificada en la informacion disponible.
- Latencia y throughput: ~13 s por imagen a 1024x1024 en int4, con hardware no especificado. No hay datos de throughput por lote ni de latencia en otras resoluciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|
| toxicdog/Z-Image-Turbo-bf16 (esta ficha) | 6,15B en el S3-DiT | 8 pasos, guidance 0 | Apache-2.0 | HuggingFace (MLX, safetensors bf16) |
| Tongyi-MAI/Z-Image-Turbo (modelo base) | 6,15B en el S3-DiT | 8 pasos, guidance 0 | Apache-2.0 | HuggingFace (pesos originales) |
| FLUX.1-schnell | ~12B | 1-4 pasos (destilado) | Apache-2.0 | HuggingFace / diffusers |
| FLUX.1-dev | ~12B | 20-50 pasos tipicos | FLUX.1-dev Non-Commercial License | HuggingFace / diffusers |

Nota: el autoencoder de FLUX.1-dev se reutiliza dentro de este pipeline, pero eso no implica compatibilidad de pesos con el DiT de FLUX.1. Los datos de contexto y de rendimiento comparado de las alternativas no estan en la informacion proporcionada; **no disponible** cualquier comparacion cuantitativa de calidad (FID, CLIP, preferencia humana).

## Limitaciones y advertencias

- Repositorio de conversion, no de entrenamiento: cualquier mejora o regresion de calidad procede del modelo base Tongyi-MAI/Z-Image-Turbo, no de esta publicacion.
- Baja varianza entre semillas: el autor lo senala explicitamente como rasgo del modelo. Para obtener variaciones hay que cambiar el prompt, no solo la semilla.
- Ausencia de CFG (guidance 0): no se puede aplicar guidance negativo para evitar elementos no deseados, lo que limita el control fino sobre el resultado.
- Destilacion a 8 pasos: la calidad por debajo o por encima del regimen de 8 pasos no esta documentada; usar otro numero de pasos puede degradar la imagen.
- Idiomas: solo en y zh en el acondicionamiento. Prompts en castellano u otras lenguas no estan soportados oficialmente y probablemente degraden el resultado.
- Alucinacion en el sentido de LLM no aplica; en su lugar existe riesgo de fidelidad limitada al prompt (elementos ausentes, texto renderizado incorrecto) y de artefactos propios de la difusion. No se publican tasas de fallo.
- Sesgos: no disponible. No hay analisis de sesgos demograficos, culturales o de representacion en el dataset de entrenamiento.
- Licencia: Apache-2.0, con enlace a la licencia del modelo base. El uso comercial esta permitido segun esa licencia, pero conviene revisar el fichero LICENSE del repositorio base y las condiciones de los componentes de terceros (encoder Qwen3-4B y VAE de FLUX.1-dev, cuyas licencias originales no se detallan aqui).
- Coste de almacenamiento y transferencia: 20,5 GB de repositorio, poco practico para despliegues con disco o ancho de banda limitados si no se recorta el snapshot.
- Discrepancia documental: el encabezado de la model card menciona `mlx-community/Z-Image-Turbo-bf16` mientras que el repositorio publicado pertenece a `toxicdog`; conviene verificar la procedencia y comparar hashes si se va a usar en produccion.
- Fechas del repositorio: creado y actualizado el 2026-09-13, sin historial de versiones posterior. Con 0 descargas y 0 likes, no hay validacion externa de la comunidad.
- Metricas de paridad obtenidas en fp32/CPU a 256x256: no garantizan el mismo nivel de acuerdo numerico en int4 sobre GPU/Metal a resoluciones altas.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso: no debe plantearse como componente de un pipeline agentico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/toxicdog/Z-Image-Turbo-bf16
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Licencia del modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/blob/main/LICENSE
- Codigo del port en Swift/MLX: https://github.com/xocialize/z-image-swift
- Libreria MLX (Apple): no disponible en los resultados de busqueda proporcionados
- Paper tecnico de Z-Image / S3-DiT: no disponible
- Demos o Spaces: no disponible
- Las busquedas web realizadas no devolvieron enlaces relevantes al modelo (resultados genericos de GitHub, Zhihu y documentacion de GitHub Copilot, sin relacion con Z-Image-Turbo).
