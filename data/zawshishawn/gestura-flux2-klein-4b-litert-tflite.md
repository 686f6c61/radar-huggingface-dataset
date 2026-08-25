# ZawShiShawn/gestura-flux2-klein-4b-litert-tflite

## Resumen

El repositorio `ZawShiShawn/gestura-flux2-klein-4b-litert-tflite` contiene un paquete de runtime LiteRT/TFLite para Android que permite ejecutar el modelo de generación y edición de imágenes FLUX.2 [klein] 4B de Black Forest Labs en dispositivos móviles. Desarrollado por ZawShiShawn como parte de la aplicación Gestura, este paquete convierte el checkpoint original de PyTorch/Diffusers en un conjunto de 43 archivos (gráficos `.tflite` y tensores binarios) que orquestados conjuntamente permiten generar imágenes desde texto y realizar ediciones con una o múltiples referencias. La licencia Apache 2.0 facilita su uso comercial, y el tamaño del repositorio es de 8.7 GB.

El modelo base FLUX.2 [klein] 4B es la variante más compacta de la familia FLUX.2 de Black Forest Labs, diseñada para unificar generación y edición en una sola arquitectura de difusión. Este paquete LiteRT mantiene esa versatilidad en dispositivos Android, con cuantización mixta (W4/INT8/FP16) para reducir el peso y el consumo de memoria, e incluye un text encoder basado en Qwen3-4B. La relevancia actual radica en la creciente demanda de modelos de imagen generativa que puedan ejecutarse completamente en el dispositivo, sin depender de la nube, ofreciendo privacidad y baja latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con text encoder Qwen3-4B y VAE |
| Parámetros totales | 4B (modelo base DiT); no se especifican los parámetros totales del paquete completo |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (el text encoder procesa texto, pero no se especifica la ventana máxima) |
| Tipos de cuantización | DiT: W4A16 (mixto W4/INT8/FP16); VAE y text encoder: INT8 dinámico; token embedding: FP16; time/guidance: BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT/TFLite (`.tflite`), archivos binarios (`.bin`), no es un único modelo invocable |

## Arquitectura y entrenamiento

El paquete es una conversión directa del checkpoint oficial BF16 de `black-forest-labs/FLUX.2-klein-4B` a formato LiteRT. El DiT principal se cuantiza con un perfil mixto: siete matrices se almacenan en INT4 con GPTQ basado en Hessiano de activación (grupo de 128, escalas FP16, sin zero-point), 93 matrices en INT8 con cuantización simétrica por canal (escalas FLOAT32, zero-point 0), y 69 tensores auxiliares en FP16 convertidos a FLOAT32 en tiempo de ejecución. El text encoder Qwen3-4B se empaqueta en tres gráficos con pesos INT8 dinámicos, y el token embedding se guarda en FP16. El VAE encoder/decoder utiliza cuantización INT8 dinámica. No se utilizan artefactos intermedios como INT2; todas las cuantizaciones se derivan directamente del checkpoint BF16 oficial. El entrenamiento original del modelo FLUX.2 klein 4B no se detalla en el repositorio, pero se sabe que unifica generación y edición en una sola arquitectura compacta.

## Capacidades

- Generación de imágenes a partir de descripciones de texto (text-to-image) con control de estilo y contenido.
- Edición de imágenes mediante instrucciones de texto (image-to-image).
- Composición con múltiples referencias: admite entrada de dos imágenes para transformaciones controladas (por ejemplo, fusionar estilos o personajes).
- Ejecución en dispositivos Android mediante LiteRT, con tiempos de generación que van desde 9 segundos (Galaxy S26) hasta 1 minuto 20 segundos (Galaxy S22) para texto a imagen.
- Soporte de cuantización mixta para reducir el uso de memoria y acelerar la inferencia en hardware móvil.
- No se especifica soporte para tool calling, agentes o razonamiento multimodal más allá de imágenes; es un modelo de imagen puro.

## Casos de uso

- Aplicación móvil de generación de imágenes: permite a usuarios crear ilustraciones o arte desde texto directamente en su teléfono, sin conexión a la nube. El modelo puede producir resultados en segundos en dispositivos de gama alta, gracias a su cuantización optimizada.
- Editor de fotos con instrucciones: integración en apps de edición para modificar imágenes mediante prompts (cambiar fondo, añadir objetos, ajustar estilo) con una interfaz táctil.
- Composición de imágenes con dos referencias: útil para aplicaciones de diseño que necesitan fusionar dos fotografías (por ejemplo, combinar el rostro de una persona con un vestido de otra) manteniendo coherencia visual.
- Generación de contenido para redes sociales: crear publicaciones, memes o avatares personalizados en tiempo real, con opciones de edición posteriores.
- Aplicaciones de diseño gráfico para profesionales: permite iterar sobre ideas de diseño en el dispositivo, sin depender de servidores externos, reduciendo costes y latencia.
- Asistente de creación de storyboards o concept art para cine y videojuegos, donde se necesitan múltiples variaciones rápidas de una escena.
- Integración en aplicaciones de accesibilidad: generar imágenes descriptivas o ilustraciones a partir de texto para usuarios con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, etc.) para este paquete, ya que es un modelo de generación de imágenes. El repositorio proporciona mediciones de rendimiento en dispositivos específicos:

| Dispositivo | Memoria | Text-to-image | Composición de dos imágenes |
| --- | ---: | ---: | ---: |
| Samsung Galaxy S26 | 12 GB | 9 segundos | 12 segundos |
| Samsung Galaxy S22 | 8 GB | 1 minuto 20 segundos | 1 minuto 57 segundos |

Estos valores son las mediciones más rápidas observadas en Gestura y no garantizan resultados en otros dispositivos o aplicaciones. No hay comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Para ejecutar el paquete completo en Android se requiere un dispositivo con al menos 8 GB de RAM (como el Galaxy S22) y soporte para LiteRT/TFLite runtime.
- En dispositivos de gama alta (12 GB de RAM, como Galaxy S26) se obtienen tiempos de generación inferiores a 12 segundos.
- El paquete no es un único modelo `.tflite`; requiere implementar la orquestación de múltiples gráficos (text encoder, DiT, VAE) mediante un runtime que cumpla con el contrato definido en la model card (SignatureDef, operaciones, tipos de datos y resolución de pesos externos).
- Para ejecución en GPU de escritorio, el proyecto FluxRT (en GitHub) ofrece una pipeline de edición en tiempo real con FLUX.2-klein-4B optimizada para GPUs de consumo, aunque no usa exactamente este paquete.
- Opciones de despliegue: aplicaciones Android nativas con LiteRT API, o entornos de servidor con vLLM/TGI para el modelo original en PyTorch, no con este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad móvil |
| --- | ---: | --- | --- | --- |
| FLUX.2 [klein] 4B (original) | 4B | No especificado | Apache 2.0 | No nativo; requiere conversión |
| Este paquete LiteRT | 4B (DiT) | No especificado | Apache 2.0 | Sí, Android |
| Stable Diffusion XL (SDXL) | 3.5B (UNet) | No especificado | MIT | Existen conversiones TFLite, pero con menor calidad en edición multi-referencia |
| litert-community/FLUX.2-klein-4B-LiteRT | 4B | No especificado | Apache 2.0 | Sí, similar pero sin la capa de integración de Gestura |

La comparativa se basa en datos públicos de las fuentes; no se dispone de benchmarks comparativos para el paquete concreto.

## Limitaciones y advertencias

- El repositorio no incluye el código fuente de la aplicación Gestura ni instrucciones para construirla o invocarla; solo define el contrato de integración. Terceros deben implementar la tokenización, el layout de tensores, el preprocesado de imágenes y la orquestación de los 43 archivos.
- No es un modelo único invocable: ejecutar solo un gráfico no produce una imagen completa; es necesario ejecutar la secuencia completa de cuatro pasos del flujo.
- La cuantización mixta (W4/INT8/FP16) puede introducir ligeras degradaciones de calidad en comparación con el checkpoint BF16 original. Los umbrales de error documentados (NRMSE ≤0.06/0.08 y similitud coseno ≥0.995) son límites fijos, pero no se garantiza la calidad perceptual en todos los casos.
- El rendimiento depende en gran medida del dispositivo y del runtime; los tiempos medidos son los más rápidos observados en Gestura y no representan una promesa universal.
- No se debe requantizar o modificar los archivos del paquete, ya que invalidaría las identidades y el contrato numérico de la revisión.
- La licencia Apache 2.0 permite uso comercial, pero el nombre "Gestura" es una marca del producto y no implica que el código de la aplicación esté incluido.
- No hay información sobre sesgos o alucinaciones en el modelo de imagen; como cualquier modelo generativo, puede producir contenido inapropiado o incorrecto.

## Enlaces

- Repositorio Hugging Face: [ZawShiShawn/gestura-flux2-klein-4b-litert-tflite](https://huggingface.co/ZawShiShawn/gestura-flux2-klein-4b-litert-tflite)
- Repositorio comunitario LiteRT: [litert-community/FLUX.2-klein-4B-LiteRT](https://huggingface.co/litert-community/FLUX.2-klein-4B-LiteRT)
- Página del modelo original: [biali/flux-2-klein-4b](https://huggingface.co/biali/flux-2-klein-4b)
- Documentación de fal.ai para FLUX.2 klein 4B: https://fal.ai/models/fal-ai/flux-2/klein/4b/api
- Guía de usuario de Flux 2 klein: https://fal.ai/learn/devs/flux-2-klein-user-guide
- Proyecto FluxRT (GitHub): https://github.com/tensorforger/FluxRT
