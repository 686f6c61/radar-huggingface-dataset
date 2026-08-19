# wavespeed/FLUX.1-dev-int8

## Resumen

FLUX.1-dev-int8 es una cuantización de 8 bits del modelo de generación de imágenes FLUX.1-dev, desarrollado originalmente por Black Forest Labs y redistribuido por el usuario wavespeed en HuggingFace. Este modelo mantiene la arquitectura del FLUX.1-dev original —un transformer multimodal de 12 mil millones de parámetros— pero reduce el peso de cada parámetro a 8 bits, lo que permite una inferencia más eficiente en memoria y una carga más rápida en GPUs con VRAM limitada, sin renunciar de forma significativa a la calidad de generación.

La versión int8 está pensada para desarrolladores que necesitan desplegar FLUX.1-dev en entornos de producción con restricciones de hardware, como GPUs de consumo con 16-24 GB de VRAM. El repositorio incluye los pesos en formato safetensors y es compatible con la librería `diffusers` mediante el pipeline `FluxPipeline`, lo que facilita su integración en flujos de trabajo existentes. Aunque la información específica de esta cuantización es escasa, se puede asumir que hereda las capacidades del modelo original: generación de imágenes fotorrealistas a partir de texto, edición por instrucción y soporte para múltiples relaciones de aspecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (FluxTransformer2DModel) con codificador de texto T5 y CLIP |
| Parametros totales | 12 mil millones (estimado, basado en FLUX.1-dev original) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens de texto (estimado, segun el modelo original) |
| Tipos de cuantizacion | int8 (pesos cuantizados a 8 bits) |
| Idiomas soportados | No disponible (el modelo original soporta principalmente ingles, aunque puede procesar otras lenguas con menor calidad) |
| Licencia | No disponible (el FLUX.1-dev original usa Apache 2.0, pero esta redistribucion no especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FLUX.1-dev se basa en una arquitectura de transformer multimodal que combina un codificador de texto T5-XXL (4.7B parametros) y un codificador CLIP (ViT-L) para interpretar las instrucciones textuales, junto con un transformer principal de 12B parametros que genera las latentes de imagen. El proceso de generacion emplea un flujo de rectificacion (rectified flow) con 28 pasos de muestreo, lo que produce imagenes de alta fidelidad con una sola pasada de denoising. El entrenamiento del modelo original incluyo un conjunto de datos de imagenes de alta calidad y un proceso de alineacion mediante destilacion y ajuste fino supervisado.

La version int8 de wavespeed no modifica la arquitectura, sino que aplica cuantizacion de 8 bits a los pesos del transformer y del codificador de texto, reduciendo el tamano del modelo de aproximadamente 32.5 GB (en fp16) a unos 16-17 GB en disco (aunque el repositorio ocupa 32.1 GB, posiblemente por incluir archivos adicionales o la version sin cuantizar). No se han publicado detalles sobre el proceso de calibracion de la cuantizacion ni sobre si se realizo un ajuste fino posterior para recuperar calidad.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de descripciones textuales detalladas, con alta fidelidad a la instruccion.
- Edicion de imagenes mediante instrucciones de texto (inpainting, outpainting, modificacion de atributos).
- Soporte para multiples relaciones de aspecto y resoluciones (hasta 1024x1024, ampliable a 2048x2048 con tecnicas de superresolucion).
- Generacion de texto dentro de imagenes (rendering de letras y numeros legibles).
- Estilo artistico variado: fotografia, ilustracion, pintura, 3D, etc.
- Capacidad de seguir instrucciones complejas con multiples objetos y escenas.
- Compatible con el ecosistema `diffusers` de HuggingFace, permitiendo integracion con pipelines personalizados y herramientas de control (ControlNet, LoRA, etc.).

## Casos de uso

- **Generacion de imagenes para prototipos de diseno**: los equipos de producto pueden generar conceptos visuales rapidamente a partir de briefs textuales, reduciendo el tiempo de iteracion en fases iniciales de diseno de interfaces, packaging o campañas publicitarias.
- **Edicion fotografica asistida por IA**: con la capacidad de inpainting y edicion por instruccion, se puede modificar imagenes existentes (cambiar fondos, eliminar objetos, ajustar iluminacion) sin necesidad de herramientas complejas como Photoshop.
- **Creacion de contenido para marketing y redes sociales**: generar imagenes personalizadas para anuncios, banners o posts, adaptadas a la audiencia objetivo, a partir de descripciones de producto o mensajes de marca.
- **Ilustracion de articulos y documentacion tecnica**: crear diagramas, esquemas o ilustraciones conceptuales para blogs, manuales o papers, a partir de descripciones textuales.
- **Desarrollo de videojuegos y entornos virtuales**: generar texturas, sprites o conceptos de escenarios para prototipos de juegos, aprovechando la generacion rapida y la coherencia visual.
- **Investigacion en vision por computador**: servir como modelo de referencia para estudios de generacion condicionada por texto, evaluacion de calidad de cuantizacion o comparacion de arquitecturas de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion int8 en la informacion disponible. El modelo original FLUX.1-dev ha sido evaluado en metricas como FID, CLIP Score y evaluaciones humanas, superando a modelos como SDXL y Midjourney v6 en varios escenarios, pero estos datos no son directamente aplicables a la version int8 sin una medicion independiente. Se recomienda realizar pruebas propias de calidad y velocidad antes de su uso en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 16 y 20 GB, dependiendo de la resolucion de salida y el uso de tecnicas como `attention slicing` o `model_cpu_offload`. La cuantizacion int8 reduce el uso de memoria respecto a la version fp16 (que requiere ~24 GB).
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100. En GPUs con 16 GB (RTX 4080, A5000) puede funcionar con resoluciones moderadas y optimizaciones de memoria.
- Si cabe en GPU de consumo: si, en tarjetas con al menos 16 GB de VRAM, aunque para generar a 1024x1024 sin offload se recomiendan 24 GB.
- Opciones de despliegue: compatible con `diffusers` mediante `FluxPipeline`; tambien puede exportarse a ONNX o TensorRT para inferencia optimizada. No se ha confirmado compatibilidad con vLLM o llama.cpp (estos se orientan a modelos de lenguaje, no a difusion).
- Latencia y throughput estimados: no disponibles para esta version; en el modelo original, la generacion de una imagen 1024x1024 tarda entre 5 y 10 segundos en una A100, y entre 15 y 30 segundos en una RTX 4090, dependiendo de los pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FLUX.1-dev (original) | 12B | 512 tokens | Apache 2.0 | fp16 | Modelo base, requiere ~24 GB VRAM |
| FLUX.1-dev-int8 (wavespeed) | 12B (cuantizado) | 512 tokens | No disponible | int8 safetensors | Reduccion de memoria, calidad ligeramente inferior |
| SDXL | 3.5B | 77 tokens | OpenRAIL | fp16 | Modelo mas ligero, menor fidelidad de texto |
| Stable Diffusion 3 Medium | 2B | 512 tokens | Stability Community | fp16 | Alternativa compacta, menor calidad que FLUX |

La comparativa se basa en datos publicos de los modelos originales. La version int8 de wavespeed no tiene benchmarks propios, por lo que la calidad relativa frente a SDXL o SD3 debe verificarse empiricamente.

## Limitaciones y advertencias

- La cuantizacion int8 puede introducir una degradacion sutil en la calidad de la imagen, especialmente en detalles finos, texturas y coherencia de objetos complejos, respecto a la version fp16.
- No se ha publicado informacion sobre el proceso de calibracion de la cuantizacion ni sobre pruebas de robustez; es posible que ciertos prompts produzcan artefactos o errores.
- La licencia no esta especificada en el repositorio de wavespeed; aunque el modelo original es Apache 2.0, esta redistribucion podria tener restricciones adicionales. Se recomienda contactar con el autor antes de un uso comercial.
- El modelo original tiene sesgos conocidos en la representacion de personas (genera mayoritariamente imagenes de personas blancas y con cuerpos estereotipados) y puede fallar en conceptos abstractos o instrucciones ambiguas.
- Riesgo de alucinacion visual: puede generar objetos o elementos que no estan en la instruccion, especialmente en escenas complejas con multiples entidades.
- El soporte multilingue es limitado; las instrucciones en idiomas distintos del ingles pueden producir resultados menos precisos.
- El repositorio tiene solo 11 descargas y 0 likes, lo que sugiere que la cuantizacion no ha sido ampliamente validada por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wavespeed/FLUX.1-dev-int8
- Modelo original FLUX.1-dev (referencia): https://huggingface.co/black-forest-labs/FLUX.1-dev
- Documentacion de diffusers para FluxPipeline: https://huggingface.co/docs/diffusers/api/pipelines/flux
