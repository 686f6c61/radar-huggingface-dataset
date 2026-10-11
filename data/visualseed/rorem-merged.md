# visualseed/RORem-merged

## Resumen

RORem-merged es un empaquetado listo para usar del modelo RORem (presentado en CVPR 2025) para eliminación de objetos e inpainting sobre imágenes. Lo publica el usuario `visualseed` en HuggingFace y su aportación no es un reentrenamiento, sino una fusión: toma los pesos de `LetsThink/RORem` y les incorpora la LoRA de destilación LCM ya integrada en el UNet, de modo que el resultado se puede cargar directamente con `StableDiffusionXLInpaintPipeline` de diffusers sin aplicar ningún adaptador.

Técnicamente es un modelo de difusión latente sobre la arquitectura SDXL inpainting, con un UNet de 2.567.478.084 parámetros (unos 2,57 mil millones), un VAE y dos codificadores de texto CLIP. La fusión se realizó como un *bake* B@A a escala 1 sobre 788 adaptadores, numéricamente equivalente a `fuse_lora` de diffusers. El repositorio ocupa 6,9 GB y se distribuye en formato safetensors.

Su relevancia práctica está en el contrato de inferencia: gracias a la destilación LCM funciona con solo 4 pasos de muestreo, `guidance_scale=1.0` y prompt vacío. Es decir, es un modelo *prompt-free* orientado a un caso de uso muy concreto, la eliminación de objetos guiada por máscara, con un coste de inferencia muy inferior al de un SDXL inpainting estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente estilo SDXL inpainting; UNet con bloques ResNet y atención transformer, más VAE y dos codificadores de texto CLIP |
| Parámetros totales | 2.567.478.084 (UNet, dato de los safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de difusión). Resolución de trabajo típica de SDXL: 1024 x 1024 píxeles |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos safetensors sin variantes GGUF, INT8 ni fp8 documentadas |
| Idiomas soportados | No aplica / no disponible: el modelo es prompt-free y no procesa instrucciones de texto |
| Licencia | Apache-2.0 (repositorio y modelo base `LetsThink/RORem`), sobre una base SDXL inpainting con licencia CreativeML Open RAIL++-M |
| Formato de pesos | Safetensors (formato diffusers) |
| Pipeline declarado | `image-to-image` (`diffusers:StableDiffusionXLInpaintPipeline`) |
| Tamaño del repositorio | 6,9 GB |
| Modelo base | `LetsThink/RORem` |

## Arquitectura y entrenamiento

La arquitectura es la de SDXL inpainting: un UNet de difusión latente que opera sobre representaciones comprimidas por el VAE, condicionado por máscara de inpainting y por embeddings de texto de dos codificadores CLIP. El detalle relevante es que en este repositorio el condicionamiento textual no se utiliza en la práctica: el contrato de inferencia verificado por el autor usa `prompt=""`, `guidance_scale=1.0`, `num_inference_steps=4` y `strength=0.99` con `LCMScheduler`.

No hubo entrenamiento ni ajuste fino por parte de `visualseed`. La operación realizada es una fusión de la LoRA de destilación LCM del release RORem-LCM dentro de los pesos del UNet, con 788 adaptadores fusionados mediante un *bake* B@A a escala 1, equivalente a la función `fuse_lora` de diffusers. La innovación funcional heredada es, por tanto, la destilación LCM, que permite reducir el muestreo a muy pocos pasos.

El comportamiento del *scheduler* está documentado en la model card: coloca los timesteps [999, 759, 499, 259] y el recorte por `strength=0.99` elimina el primero, de modo que solo se ejecutan tres pasadas del denoiser en [759, 499, 259], con la imagen ruidada hasta el nivel 759. Sobre el origen de los datos de entrenamiento (composición del dataset, número de tokens, uso de RLHF o DPO) no hay información disponible en la documentación proporcionada.

## Capacidades

- Inpainting guiado por máscara sobre imágenes en resolución propia de SDXL, con relleno coherente de la región enmascarada.
- Eliminación de objetos (*object removal*) como caso de uso principal: borra el objeto enmascarado y reconstruye el fondo.
- Image-to-image con control de fuerza de transformación mediante el parámetro `strength`.
- Inferencia *prompt-free*: no requiere descripción textual de la escena, lo que simplifica la integración en pipelines automatizados.
- Muestreo acelerado con `LCMScheduler`: 4 pasos configurados, 3 pasadas efectivas del denoiser.
- Compatible con guía desactivada (`guidance_scale=1.0`), por lo que no necesita *classifier-free guidance* ni doble evaluación del UNet por paso.
- Preparado para cargarse directamente con diffusers sin paso de fusión de adaptadores.
- No dispone de *tool calling*, *function calling* ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de entrada de audio o vídeo.

## Casos de uso

- Eliminación de objetos en fotografía de producto: se enmascara el elemento no deseado (soportes, cables, etiquetas de otras marcas) y el modelo reconstruye el fondo, útil en flujos de e-commerce con gran volumen de imágenes.
- Limpieza de imágenes inmobiliarias: retirar muebles temporales, carteles o elementos personales de las fotos de un inmueble manteniendo la coherencia del suelo, paredes y texturas.
- Retoque fotográfico por lotes: integrado en un script con diffusers, puede procesar catálogos completos sin intervención manual ni prompts, aplicando máscaras generadas por un detector previo.
- Preprocesado de datasets de visión por computador: eliminar marcas de agua, logotipos o elementos identificativos de imágenes antes de usarlas para entrenar otros modelos.
- Edición local en aplicaciones de escritorio o móvil: los 4 pasos de muestreo reducen el coste por imagen frente a un SDXL de 20-50 pasos, lo que hace viable la inferencia en hardware de gama media con una interfaz de usuario interactiva.
- Cumplimiento de privacidad: borrado de matrículas, rostros o documentación visible en imágenes que se van a publicar, siempre que la máscara correspondiente se genere antes con un detector específico.
- Restauración y limpieza de archivo fotográfico: retirada de elementos espurios (arañazos puntuales, sellos, manchas localizadas) sobre digitalizaciones, usando máscaras manuales o semiautomáticas.
- Generación de variantes de fondo en estudios de moda: sustituir o limpiar el entorno alrededor de una prenda manteniendo intacta la región no enmascarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe únicamente el contrato de inferencia y la procedencia de los pesos; no incluye métricas cuantitativas como FID, LPIPS, PSNR ni comparaciones numéricas con otros métodos de eliminación de objetos. Tampoco se han encontrado resultados en la búsqueda web realizada, que no devolvió ninguna fuente técnica relacionada con el modelo.

## Requisitos de hardware

- Estimación de VRAM para el pipeline completo en fp16: en torno a 7 GB solo de pesos (UNet de ~5,1 GB, dos codificadores de texto de ~1,6 GB y VAE de ~0,16 GB), más las activaciones. Con resolución 1024 x 1024 conviene contar con 8-12 GB de VRAM para trabajar con margen.
- Reducción de memoria: el uso de *attention slicing*, *VAE tiling* y `enable_model_cpu_offload()` de diffusers permite bajar el consumo y ejecutar en GPUs de 6-8 GB, a costa de latencia.
- GPUs recomendadas: NVIDIA RTX 4090, RTX 4080, RTX 3090 o superiores para inferencia interactiva a 1024 x 1024; RTX 3060 de 12 GB y RTX 4060 Ti de 16 GB son suficientes para uso local en fp16 con las optimizaciones anteriores. Para despliegue por lotes a gran escala, A100 o H100 con vLLM no aplican; el equivalente sería un servidor con varias GPU y lotes en diffusers o ComfyUI.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más aplicando *offload* y *slicing*.
- Opciones de despliegue: diffusers (la versión de referencia usada para verificar el contrato es 0.41), ComfyUI, y frontales web basados en SDXL inpainting. No procede llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles como medidas publicadas. Como referencia estructural, el modelo ejecuta 3 pasadas del UNet por imagen en lugar de las 20-50 habituales de un SDXL inpainting estándar, lo que reduce el coste computacional en aproximadamente un orden de magnitud.
- Nota de eficiencia: al ser *prompt-free*, las activaciones de los codificadores de texto son constantes para todas las peticiones, aunque el pipeline de diffusers los carga igualmente.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Pasos de inferencia | Requiere prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| visualseed/RORem-merged | Difusión latente SDXL inpainting, LoRA LCM fusionada | 2.567.478.084 (UNet) | 4 configurados, 3 efectivos | No | Apache-2.0 (base CreativeML Open RAIL++-M) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| LetsThink/RORem | Difusión latente SDXL inpainting con adaptador LCM separado | No disponible en la información proporcionada | No disponible | No | Apache-2.0 según el repositorio | HuggingFace, requiere fusionar el adaptador |
| diffusers/stable-diffusion-xl-1.0-inpainting-0.1 | Difusión latente SDXL inpainting | ~2,57 mil millones (UNet) | Típicamente 20-50 | Sí | CreativeML Open RAIL++-M | Ampliamente distribuido en HuggingFace |
| LaMa | Método de inpainting basado en GAN con convoluciones rápidas de Fourier | No disponible | Una sola pasada (no es difusión) | No | No verificada en la información disponible | Repositorio oficial y múltiples integraciones |

La comparación cuantitativa de calidad entre estas alternativas no está disponible: no se han publicado métricas en la documentación de RORem-merged ni en los resultados de búsqueda obtenidos.

## Limitaciones y advertencias

- Inconsistencia de licencia potencial: el repositorio declara Apache-2.0 y el modelo base también, pero la base subyacente de SDXL inpainting se distribuye bajo CreativeML Open RAIL++-M, que impone restricciones de uso adicionales. Conviene revisar la cadena completa de licencias antes de un uso comercial.
- Ausencia de control textual: al funcionar con prompt vacío, no es posible dirigir el resultado con instrucciones de lenguaje natural; toda la especificación de qué eliminar y cómo rellenar depende de la máscara.
- Contenido inventado en la región borrada: como cualquier modelo de difusión, puede generar texturas plausibles pero falsas en la zona enmascarada, especialmente en fondos con patrones repetitivos, estructuras geométricas o texto.
- Dependencia crítica de la máscara: máscaras mal ajustadas producen costuras, bordes flotantes o reconstrucciones incompletas.
- Sin validación comunitaria: el repositorio presenta 0 descargas y 0 likes en la información consultada, por lo que no hay evidencia externa de calidad ni de estabilidad.
- Sin benchmarks publicados: no hay métricas objetivas que permitan comparar su calidad frente a RORem original, SDXL inpainting o métodos no generativos.
- Sesgos: no hay información disponible sobre sesgos demográficos, culturales o de representación en los datos de entrenamiento heredados de SDXL.
- Idiomas: no aplica, pero conviene recordar que al no procesar texto no hay soporte multilingüe que evaluar.
- Fecha de creación del repositorio: 2026-10-11, con última actualización el mismo día; se trata de una publicación muy reciente y sin historial de mantenimiento.
- Modelo especializado: no sirve como modelo de propósito general de generación de imágenes, ya que está orientado a la eliminación de objetos sobre una máscara dada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/visualseed/RORem-merged
- Modelo base: https://huggingface.co/LetsThink/RORem
- Base SDXL inpainting: https://huggingface.co/diffusers/stable-diffusion-xl-1.0-inpainting-0.1
- Página del proyecto original: https://github.com/leeruibin/RORem
- Búsqueda web: no se han encontrado enlaces técnicos relevantes; los resultados devueltos correspondían a plataformas de negociación no relacionadas con el modelo.
