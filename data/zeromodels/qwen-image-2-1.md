# zeromodels/qwen-image-2.1

## Resumen

zeromodels/qwen-image-2.1 es una conversión a Keras 3 del checkpoint Qwen/Qwen-Image-2.1, publicada por el proyecto ZeroModels (IMvision12). No se trata de un modelo nuevo: la arquitectura y los valores de los parámetros son idénticos al checkpoint original de Qwen, pero los pesos se redistribuyen en el formato de Keras 3 (`model.weights.json` y `model_*.weights.h5`) junto con `zm_config.json` y `tokenizer.json`. El valor de esta conversión es la portabilidad: la misma implementación se ejecuta sin cambios sobre TensorFlow, PyTorch o JAX simplemente cambiando la variable `KERAS_BACKEND`.

El modelo subyacente es un sistema unificado de generación de imágenes a partir de texto y de edición de imágenes, con soporte nativo para transparencia RGBA. Su componente de generación visual es un DiT (*Diffusion Transformer*) de 32 capas single-stream que, según la documentación del proyecto original, ronda los 7B de parámetros, lo que lo sitúa en un rango de eficiencia inferior al de otros difusores de gran tamaño. El repositorio ocupa 30,0 GB y los pesos se almacenan en bfloat16 (unos 28 GiB), la precisión nativa del checkpoint.

Es relevante ahora por tres motivos: la conversión permite evaluar el modelo sin depender exclusivamente del ecosistema Diffusers/PyTorch, la salida por defecto es de 1024×1024 con 40 pasos de *flow matching*, y la licencia Qwen Research restringe el uso a investigación y evaluación salvo licencia comercial aparte. La distribución tiene 0 descargas y 0 «likes» en el momento de la consulta, y está etiquetada únicamente para inglés (`en`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT single-stream de 32 capas con atención causal por bloques y atención de granularidad mixta; autoencoder VAE RGBA residual de 64 canales (compresión espacial 16×); text encoder Qwen3-VL de 36 capas (4096-d, 32 cabezas / 8 KV); scheduler FlowMatchEulerDiscreteScheduler (rectified flow, dynamic shifting, shift_terminal) |
| Parametros totales | 7B en el componente de generación visual (dato del proyecto upstream); el repositorio ocupa 30,0 GB y los pesos ~28 GiB en bfloat16. Cifra total exacta del pipeline completo: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible: es un modelo de difusión y la model card no declara ventana de contexto en tokens. La entrada de texto se tokeniza con Qwen3 BPE bajo plantilla ChatML |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en bfloat16 y el cargador admite `load_dtype="float32"`; no se documentan variantes GGUF, INT8 o FP8 |
| Idiomas soportados | en (inglés) |
| Licencia | qwen-research (Qwen Research License): uso no comercial de investigación/evaluación salvo licencia comercial separada de Qwen |
| Formato de pesos | Keras 3: `model.weights.json`, `model_*.weights.h5`, `zm_config.json`, `tokenizer.json` |
| Resolucion de salida por defecto | 1024×1024 (latente sin parchear de 64×64×64); configurable a otros múltiplos de 32 px |
| Pasos de inferencia por defecto | 40 (*flow matching*), `guidance_scale=1.0` (CFG real opcional) |
| Backends soportados | TensorFlow, PyTorch y JAX mediante Keras 3 |
| Tamano del repositorio | 30,0 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente a Qwen-Image-2.1, no a una variante propia de zeromodels. El denoiser (`QwenImage21Transformer2DModel`) es un DiT de 32 capas single-stream de tipo *block-causal*, que opera sobre tokens sin parchear de forma `(B, H·W, 64)` en lugar de aplicar *patchify*, con atención de granularidad mixta y modulación de texto mediante `causal_condition`. El autoencoder (`AutoencoderKLQwenImage21`) es un VAE residual RGBA con `z_dim` 64, compresión espacial 16× y normalización mediante `latents_mean` / `latents_std`. El codificador de texto (`QwenImage21TextEncoderModel`) es una torre Qwen3-VL de 36 capas, 4096 dimensiones y 32 cabezas con 8 cabezas KV, del que se usan las características pre-norm (antes de la RMSNorm final). El muestreo emplea un `FlowMatchEulerDiscreteScheduler` con *rectified flow*, desplazamiento dinámico de resolución (el parámetro `mu` se deriva de la longitud de la secuencia de imagen) y `shift_terminal`.

Sobre el entrenamiento, esta ficha no dispone de datos: la información proporcionada no incluye número de tokens de entrenamiento, composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card del repositorio de zeromodels remite explícitamente a la model card upstream para detalles de uso previsto y limitaciones. La innovación técnica relevante aquí no está en el modelo sino en el *port*: la conversión traslada el checkpoint a un contenedor Keras 3 único que corre sin modificaciones en tres backends, verificada contra la implementación de Diffusers, y mantiene la precisión bfloat16 nativa. El tokenizador incluye un *system prompt* ChatML fijo (`Comprehend and analyze the provided prompt.`). Los grafos se construyen para 1024 px y los pesos son independientes de la resolución: `transformer_sample_size=` y `vae_sample_size=` permiten recompilar para otros múltiplos de 32 px.

## Capacidades

- Generación de imágenes a partir de texto (*text-to-image*) con resolución por defecto de 1024×1024.
- Edición de imágenes guiada por prompt sobre imágenes de referencia (capacidad heredada del modelo upstream).
- Generación y edición con canal alfa: el VAE es RGBA y `generate` devuelve tensores `(batch, H, W, 3)` uint8 tras recortar el canal alfa, lo que permite flujos con transparencia nativa.
- Control de generación mediante *negative prompt* tokenizado (cuando `guidance_scale > 1`), semilla explícita, número de pasos y latentes iniciales de forma `(batch, H·W, 64)`.
- Ejecución por lotes: `input_ids` y `attention_mask` se pueden agrupar para procesar varios prompts en una misma llamada.
- Compatibilidad con `channels_last` y `channels_first` mediante `keras.config.set_image_data_format` antes de la carga.
- Portabilidad multi-backend real (TensorFlow, PyTorch, JAX) sobre la misma base de código Keras 3.
- Carga como contenedor «desnudo» mediante `QwenImage21Model.from_weights(...)`, que expone `.transformer`, `.vae` y `.text_encoder` sin el bucle de generación, útil para investigación sobre los componentes por separado.
- No se documentan en la información disponible capacidades de *tool calling*, agentes, razonamiento multi-paso, audio ni visión de entrada más allá del uso del codificador Qwen3-VL como torre de texto.

## Casos de uso

- Generación de imágenes de producto a 1024×1024: el pipeline por defecto (40 pasos, `guidance_scale=1.0`) produce imágenes cuadradas directamente consumibles en catálogos y fichas de comercio electrónico, con la semilla fijada para reproducibilidad entre ejecuciones.
- Activos gráficos con transparencia: al trabajar con un VAE RGBA, el modelo está pensado para generar recortes con canal alfa (logotipos, objetos aislados, elementos de interfaz) que se integran sin posprocesado de máscara en herramientas de diseño.
- Edición de imágenes por prompt: sustituir fondos, retocar iluminación o modificar atributos de una imagen de referencia sin reentrenar, encadenando la edición sobre el resultado anterior.
- Prototipado rápido en estudios de diseño: dado que los grafos se pueden recompilar para cualquier múltiplo de 32 px con `transformer_sample_size` y `vae_sample_size`, un equipo puede generar variantes a menor resolución para iterar y reescalar a 1024 px para la entrega final.
- Investigación en modelos de difusión: la conversión permite comparar el comportamiento numérico del mismo checkpoint en PyTorch frente a JAX o TensorFlow, y estudiar por separado el DiT single-stream, el VAE residual y la torre de texto usando el contenedor desnudo.
- Evaluación académica de arquitecturas DiT: el uso de tokens sin parchear `(B, H·W, 64)` y de atención de granularidad mixta permite medir el efecto de estas decisiones de diseño frente a alternativas con *patchify* en un entorno Keras reproducible.
- Generación de datos sintéticos para experimentos: bajo la licencia de investigación se pueden producir lotes de imágenes etiquetadas para estudiar sesgos o validar clasificadores, siempre sin fines comerciales.
- Integración en *pipelines* de CI para *smoke tests*: la API `from_weights` más `generate(seed=0)` ofrece una comprobación determinista de que el entorno Keras y el backend seleccionado funcionan antes de escalar a lotes grandes.
- Despliegue *on-premise* en infraestructura no-NVIDIA o mixta: al no depender de CUDA a través de Keras, el mismo checkpoint puede servirse sobre el backend JAX o TensorFlow según el hardware disponible en el centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La información consultada (model card del repositorio, repositorio de QwenLM y páginas de terceros) describe mejoras cualitativas en calidad de generación, eficiencia de inferencia y polivalencia, pero no incluye cifras de métricas como FID, CLIP score, GenEval ni comparaciones numéricas con otros modelos. Tampoco se proporcionan medidas de latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 28 GiB en bfloat16 dentro de un repositorio de 30,0 GB, por lo que el pipeline completo en GPU necesita del orden de 30-35 GB de VRAM en bfloat16 sumando activaciones. Es una estimación derivada del tamaño del checkpoint, no una cifra publicada por el autor.
- GPU recomendadas para ejecución íntegra en GPU: A100 (40 GB o 80 GB), H100, L40S (48 GB) o RTX 6000 Ada (48 GB). Cualquier acelerador con 40 GB o más de memoria y soporte para el backend elegido es candidato.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB no puede alojar el pipeline completo en bfloat16. La model card no documenta *offloading* secuencial a CPU ni carga por componentes, por lo que no se puede afirmar que funcione en esas tarjetas sin trabajo adicional del usuario.
- CPU: es viable como referencia funcional (el backend TensorFlow o JAX puede ejecutar en CPU), pero sin cifras de latencia publicadas y con expectativas de tiempos muy altos para 40 pasos a 1024 px.
- Opciones de despliegue: la vía soportada es la librería `zeromodels` sobre Keras 3, seleccionando backend con `KERAS_BACKEND` (`torch`, `jax` o `tensorflow`) antes de importar. Para el checkpoint upstream existe la ruta Diffusers. No se contemplan vLLM, llama.cpp, Ollama ni TGI: no hay pesos GGUF, no es un modelo de lenguaje y no se documenta servidor de inferencia alguno.
- Precisión y memoria: los pesos cargan en bfloat16 por defecto; `load_dtype="float32"` duplica el consumo de memoria de los pesos, hasta unos 56 GB, y solo tiene sentido para depuración numérica.
- Latencia y throughput: no disponibles. El único parámetro conocido es el coste de muestreo de 40 pasos de *flow matching* por imagen.
- Almacenamiento: 30,0 GB solo para el repositorio; conviene prever espacio adicional para la caché de Keras/Hugging Face y para los resultados.

## Comparativa con modelos similares

| Modelo | Parametros (componente visual) | Resolucion por defecto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zeromodels/qwen-image-2.1 | 7B (dato del upstream) | 1024×1024 | Keras 3 (bfloat16) | qwen-research (no comercial) | Hugging Face, 0 descargas |
| Qwen/Qwen-Image-2.1 (upstream) | 7B | 1024×1024 | Diffusers / safetensors (no confirmado en la informacion disponible) | qwen-research | Hugging Face y ModelScope |
| Otras alternativas de la misma categoria (por ejemplo, difusores texto-a-imagen de rango 7-12B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar la conversión de zeromodels con el checkpoint original de Qwen, que comparten arquitectura y valores de parámetros pero difieren en formato y nombres de pesos. No se dispone de datos verificados (parámetros, contexto, benchmarks, licencia) de otros modelos comparables en el material consultado, por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Licencia no comercial: los pesos se redistribuyen bajo la Qwen Research License del checkpoint upstream. El uso comercial requiere una licencia separada de Qwen; cualquier redistribución debe incluir copia del fichero `LICENSE`. Copyright de Qwen: Hangzhou Tongyi Laboratory Technology Co., Ltd.
- Solo inglés: el campo `language` de la model card declara únicamente `en`. No hay evidencia de soporte multilingüe en los prompts, y la plantilla ChatML del tokenizador está en inglés.
- Riesgo de alucinación visual: como todo modelo generativo de difusión, puede producir texto ilegible dentro de la imagen, anatomías incorrectas, atributos contradictorios respecto al prompt o composiciones plausibles pero falsas, especialmente con prompts largos o ambiguos.
- Sesgos: no se documenta ninguna auditoría de sesgos en la información disponible. Se debe asumir el riesgo habitual de sesgos demográficos, culturales y estilísticos heredados de los datos de entrenamiento, que no se detallan.
- Trazabilidad del entrenamiento limitada: no se publican en este material el número de tokens, la composición del dataset ni las fases de alineación, lo que dificulta evaluar procedencia y licencias de los datos.
- Restricciones de resolución: los grafos se construyen para 1024 px por defecto. Otras resoluciones exigen recompilar con `transformer_sample_size=` y `vae_sample_size=` en múltiplos de 32 px; no se documentan calidades fuera de ese régimen.
- Sin cuantizaciones: solo bfloat16 y float32. No hay GGUF ni formatos de bajos bits, lo que descarta su uso en GPU de consumo sin trabajo de conversión propio.
- Consumo de memoria elevado: el pipeline completo no cabe en 24 GB de VRAM en bfloat16 y no se documenta *offloading*, por lo que el despliegue en hardware pequeño no está soportado de serie.
- Conversión no dinámica: la propia model card indica que la conversión al vuelo con `hf:` no está soportada para modelos de difusión; los checkpoints se alojan ya convertidos y una actualización del upstream exigiría una nueva conversión.
- Estado del repositorio: 0 descargas y 0 «likes» en el momento de la consulta, sin evidencia de uso en producción por parte de terceros.
- Fecha de creación anotada como 2026-09-23, posterior a la mayoría de referencias del ecosistema; conviene verificar la vigencia de los enlaces y del propio *port* antes de integrarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zeromodels/qwen-image-2.1
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del checkpoint upstream: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Documentación del port en ZeroModels: https://imvision12.github.io/ZeroModels/qwen_image_21/
- Repositorio GitHub de ZeroModels: https://github.com/IMvision12/ZeroModels
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen sobre Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Ficha en Layer: https://layer.ai/models/qwen-qwen-image-2-1
- Ficha en Civitai (checkpoint bf16): https://civitai.com/models/2953241/qwenimage21
- Ficha y API en Wiro AI: https://wiro.ai/models/qwen/qwen-image-2-1
