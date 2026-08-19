# vegidio/open-photo-ai

## Resumen

Open Photo AI Models es una colección de modelos de visión artificial en formato ONNX desarrollada por vegidio para el proyecto Open Photo AI, una alternativa open source a las populares aplicaciones de mejora fotográfica. En lugar de un único modelo monolítico, el repositorio agrupa más de una docena de modelos especializados, cada uno orientado a una tarea concreta: detección de rostros, recuperación de rostros, upscaling, ajuste de iluminación, balance de color, reducción de ruido, enfoque y eliminación de objetos. Cada modelo recibe un nombre de ciudad (Nueva York, Atenas, Tokio, París, etc.) y está basado en arquitecturas reconocidas como RetinaFace, CodeFormer, GFPGAN, SwinIR, Real-ESRGAN, IAT, Deep White-Balance, NAFNet y Restormer.

La relevancia de este proyecto radica en que ofrece un pipeline completo de mejora fotográfica con componentes intercambiables, todos convertidos a ONNX para facilitar su integración en aplicaciones multiplataforma (CPU, GPU, edge). El repositorio ocupa 10,2 GB e incluye pesos en FP32 y FP16 para la mayoría de los modelos, lo que permite equilibrar calidad y rendimiento según el hardware disponible. Aunque el proyecto está activo (última actualización en agosto de 2026), no se especifica una licencia formal en la página de Hugging Face, aunque el código fuente en GitHub se distribuye como open source.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Colección de modelos ONNX basados en RetinaFace, CodeFormer, GFPGAN, SwinIR, Real-ESRGAN, IAT, Deep White-Balance, NAFNet y Restormer |
| Parametros totales | No disponible (cada modelo tiene su propio tamaño; el repositorio completo ocupa 10,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelos de visión, sin contexto de texto) |
| Tipos de cuantizacion | FP32 y FP16 (según modelo) |
| Idiomas soportados | No aplica (procesamiento de imágenes) |
| Licencia | No disponible en Hugging Face; el proyecto en GitHub es open source |
| Formato de pesos | ONNX (safetensors no se utiliza) |

## Arquitectura y entrenamiento

Cada modelo del repositorio es una conversión a ONNX de una arquitectura ya publicada y entrenada por terceros. Por ejemplo, el modelo de detección de rostros "Nueva York" se basa en RetinaFace con backbone ResNet34 y entrada fija de 640x640 píxeles; los modelos de recuperación de rostros "Atenas" y "Santorini" provienen de CodeFormer y GFPGAN respectivamente, ambos con entrada de 512x512. Los modelos de upscaling "Tokio", "Kioto" y "Saitama" usan SwinIR y Real-ESRGAN (versión general y anime). El ajuste de iluminación "París" se basa en el Illumination Adaptive Transformer (IAT) y el balance de color "Río" en Deep White-Balance, ambos con formas dinámicas de entrada. Para denoising y enfoque se emplean NAFNet y Restormer en varias variantes (SIDD, GoPro, Real Denoise, Derain, Focus Deblur, Motion Deblur).

No se proporcionan detalles sobre el proceso de entrenamiento original de estos modelos base, ni sobre los datos utilizados. La contribución del autor consiste en la adaptación, conversión a ONNX y empaquetado para su uso directo en la aplicación Open Photo AI. La mayoría de los modelos tienen formas de entrada fijas (256x256 o 512x512), lo que simplifica la inferencia pero limita la flexibilidad para imágenes de tamaño arbitrario.

## Capacidades

- Detección de rostros: localización de caras en imágenes mediante RetinaFace (modelo "Nueva York").
- Recuperación de rostros: restauración de rostros degradados o de baja resolución usando CodeFormer ("Atenas") y GFPGAN ("Santorini").
- Upscaling de imágenes: aumento de resolución con SwinIR ("Tokio") y Real-ESRGAN en versiones general ("Kioto") y anime ("Saitama").
- Ajuste de iluminación: corrección de exposición y mejora de condiciones de luz mediante el Illumination Adaptive Transformer ("París").
- Balance de color: corrección automática de dominancia de color con Deep White-Balance ("Río").
- Reducción de ruido: eliminación de ruido en imágenes usando NAFNet ("Estocolmo") y Restormer en modo Real Denoise ("Gotemburgo") y Derain ("Malmö").
- Enfoque y deblurring: corrección de desenfoque con Restormer Focus Deblur ("Moscú"), NAFNet GoPro ("San Petersburgo") y Restormer Motion Deblur ("Nóvgorod").
- Eliminación de objetos: prevista pero aún no disponible (modelo "Dubái" en desarrollo).

## Casos de uso

- Restauración de fotografías antiguas: el flujo combinado de detección de rostros (Nueva York), recuperación de rostros (Atenas o Santorini) y upscaling (Tokio o Kioto) permite recuperar retratos antiguos dañados, mejorando la nitidez y corrigiendo imperfecciones.
- Mejora de retratos para redes sociales: usando los modelos de recuperación de rostros y ajuste de iluminación, se pueden obtener retratos más atractivos sin necesidad de edición manual, ideal para aplicaciones móviles de fotografía.
- Upscaling de imágenes para impresión: el modelo Tokio (SwinIR) puede ampliar imágenes de baja resolución a tamaños aptos para impresión en gran formato, manteniendo detalles y evitando artefactos típicos de interpolación.
- Corrección de iluminación en fotografía de interiores: el modelo París (IAT) ajusta automáticamente la exposición en fotos subexpuestas o sobreexpuestas, útil en aplicaciones de edición masiva de catálogos.
- Limpieza de ruido en imágenes con poca luz: los modelos Estocolmo (NAFNet) y Gotemburgo (Restormer) reducen el ruido digital en fotos tomadas con ISO alto, mejorando la calidad sin perder textura.
- Deblurring de fotos movidas: los modelos Moscú y Nóvgorod (Restormer) corrigen el desenfoque por movimiento o enfoque incorrecto, útil en fotografía de eventos o deportes.
- Procesamiento de imágenes anime: el modelo Saitama (Real-ESRGAN Anime) está optimizado para upscaling de ilustraciones y arte anime, permitiendo mejorar la resolución de imágenes generadas por IA o escaneadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas comparativas (PSNR, SSIM, LPIPS) ni evaluaciones de rendimiento en hardware específico. Se recomienda consultar las publicaciones originales de cada arquitectura base (RetinaFace, CodeFormer, GFPGAN, SwinIR, Real-ESRGAN, etc.) para conocer su rendimiento académico.

## Requisitos de hardware

- Al ser modelos ONNX, pueden ejecutarse tanto en CPU como en GPU mediante ONNX Runtime, TensorRT o ejecutores similares.
- El tamaño del repositorio completo es de 10,2 GB, pero cada modelo individual es mucho más pequeño; los modelos de 256x256 con FP16 pueden caber en GPUs con 2-4 GB de VRAM.
- Para el modelo de detección de rostros (RetinaFace 640x640) se estima un uso de memoria inferior a 1 GB en FP32.
- Los modelos de recuperación de rostros (CodeFormer, GFPGAN) y upscaling (SwinIR, Real-ESRGAN) requieren más memoria; se recomienda al menos 4 GB de VRAM para FP16 y 6-8 GB para FP32.
- Los modelos con formas dinámicas (París, Río) se adaptan al tamaño de entrada, por lo que el consumo de memoria depende de la resolución de la imagen.
- Opciones de despliegue: integración directa en aplicaciones Python con ONNX Runtime, o mediante el proyecto Open Photo AI (disponible en GitHub) que ya gestiona la carga y ejecución de todos los modelos.
- Para uso en producción con alta demanda, se puede servir cada modelo como microservicio con ONNX Runtime Server o FastAPI, aprovechando aceleración por GPU si está disponible.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros repositorios de modelos de mejora fotográfica en formato ONNX. El proyecto Open Photo AI se posiciona como una alternativa open source a aplicaciones comerciales como Adobe Lightroom o Topaz Photo AI, pero no existe un benchmark público que compare su rendimiento con estas herramientas. Como referencia, las arquitecturas base (Real-ESRGAN, CodeFormer, SwinIR) son ampliamente utilizadas en la comunidad y sus resultados están documentados en sus respectivas publicaciones. No se incluye una tabla comparativa por falta de datos.

## Limitaciones y advertencias

- Cada modelo está especializado en una tarea concreta; no existe un modelo único que realice todas las mejoras, por lo que se requiere encadenar varios modelos para un flujo completo.
- Las formas de entrada fijas (256x256, 512x512, 640x640) obligan a redimensionar las imágenes antes de la inferencia, lo que puede degradar la calidad si la imagen original tiene una relación de aspecto muy distinta.
- No se especifica la licencia de los pesos en Hugging Face; aunque el proyecto es open source, conviene revisar las licencias de las arquitecturas base (por ejemplo, CodeFormer y GFPGAN tienen restricciones de uso no comercial en algunos casos).
- El modelo de eliminación de objetos (Dubái) aún no está disponible, por lo que esa funcionalidad no puede utilizarse.
- Al ser conversiones a ONNX, puede haber pequeñas diferencias de precisión respecto a los modelos originales en PyTorch, especialmente en FP16.
- No se han publicado evaluaciones de sesgos o comportamientos no deseados en los modelos de detección de rostros; como ocurre con la mayoría de detectores, pueden fallar en rostros con oclusiones, ángulos extremos o condiciones de luz adversas.
- El repositorio no incluye documentación sobre el proceso de entrenamiento de los modelos base, por lo que no es posible auditar los datos utilizados ni conocer posibles sesgos.

## Enlaces

- Repositorio Hugging Face: [vegidio/open-photo-ai](https://huggingface.co/vegidio/open-photo-ai)
- Proyecto Open Photo AI en GitHub: [vegidio/open-photo-ai](https://github.com/vegidio/open-photo-ai)
- Página de tendencias de GitHub (referencia): [ghtrending.com/project/vegidio/open-photo-ai](https://www.ghtrending.com/project/vegidio/open-photo-ai)
