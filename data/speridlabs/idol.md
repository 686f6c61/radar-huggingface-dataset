# speridlabs/idol

## Resumen

Idol es un modelo de generación 3D desarrollado por Sperid Labs que convierte una única imagen de un objeto en un splat gaussiano 3D (3D Gaussian Splatting). A partir de un render, una imagen generada o una fotografía, el modelo elimina el fondo, encuadra el objeto y genera hasta 1.048.576 gaussians 3D, incluyendo las caras del objeto que no aparecen en la imagen de entrada. El resultado se exporta en formato estándar `.ply`, compatible con cualquier visor de Gaussian splatting.

El modelo aborda el problema clásico de la reconstrucción 3D a partir de una sola vista, donde los métodos tradicionales no pueden inferir la geometría ocluida. Idol lo resuelve mediante un enfoque generativo basado en difusión: un denoiser de tipo DiT (Diffusion Transformer) genera una representación latente que un decodificador octree y un decodificador de gaussians convierten en el splat final.

Su relevancia actual radica en la combinación de calidad y eficiencia: funciona en GPUs de consumo con 7,2 GB de VRAM pico y puede completar la inferencia en menos de 2 segundos, lo que lo hace viable para pipelines de producción y aplicaciones interactivas. El peso total del sistema completo ronda los 1.800 millones de parámetros (incluyendo los codificadores de imagen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) + decodificador octree + decodificador de gaussians |
| Parametros totales | ~1.80B (sistema completo, incluidos codificadores) |
| Parametros activos | ~1.80B (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo imagen-a-3D) |
| Tipos de cuantizacion | FP16, bf16, FP32 (parcial en embeddings y normas) |
| Idiomas soportados | no disponible (no aplica: modelo generativo 3D) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via Hugging Face Hub), salida en 3DGS `.ply` |

## Arquitectura y entrenamiento

El pipeline se compone de varios módulos encadenados. La entrada se procesa con BiRefNet (220,7M de parámetros) para eliminar el fondo, y se codifica mediante DINOv3 ViT-H+/16 (840,6M de parámetros) junto con el VAE de FLUX.2-dev (84,1M de parámetros, solo se usa el VAE). El núcleo generativo es un DiT denoiser de 370,6M de parámetros que opera sobre una representación latente, seguido de un decodificador octree de 50,8M de parámetros que estructura la geometría y un decodificador de gaussians de 237,3M de parámetros que produce el splat final con hasta 1.048.576 gaussians.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o muestras, ni el uso de técnicas de alineación como RLHF o DPO en la información disponible. Entre las optimizaciones de inferencia destacan: muestreo acelerado con `torch.compile` (aproximadamente 1,7x más rápido sin pérdida de calidad), ejecución en batch de los pasos guiados y no guiados, atención con cuDNN y matmuls TF32, y parámetros de muestreo configurables como classifier-free guidance (`cfg_strength`), time shift (`rescale_t`) y número de pasos.

## Capacidades

- Reconstrucción 3D completa de un objeto a partir de una sola imagen, incluyendo caras no visibles en la entrada (síntesis generativa de vistas ocluidas).
- Acepta tres tipos de entrada: renders sintéticos, imágenes generadas por IA y fotografías reales, con modos de recorte dedicados (`synthetic` y `real`).
- Salida en formato estándar 3DGS `.ply` compatible con visores de Gaussian splatting.
- Número de gaussians configurable entre 32.768 y 1.048.576 (múltiplos de 32), permitiendo ajustar calidad frente a coste.
- Predicción de la cámara de la imagen de entrada (exportada como `_camera.json`).
- Eliminación automática de fondo y encuadre del objeto.
- Muestreo determinista mediante semilla (`--seed`).
- Inferencia rápida: menos de 2 segundos por objeto en GPU adecuada, con 7,2 GB de VRAM pico.

## Casos de uso

- Generación de assets 3D para videojuegos: un artista puede convertir concept art o renders en splats 3D editables en segundos, acelerando la creación de props y objetos de escena.
- E-commerce y visualización de producto: a partir de una foto de un producto (silla, lámpara, etc.) se genera un modelo 3D navegable para visores web sin necesidad de sesiones de fotogrametría.
- Pipelines generativos imagen-a-3D: encadenar un modelo texto-a-imagen con Idol permite crear objetos 3D desde una descripción textual, usando el modo `synthetic` para salidas de modelos de difusión.
- Creación de contenido para realidad virtual y aumentada: los splats `.ply` pueden integrarse en escenas inmersivas con herramientas compatibles con 3DGS.
- Digitalización rápida de objetos físicos: fotografías de objetos reales (modo `real`) se convierten en representaciones 3D para archivo, catalogación o museos digitales.
- Prototipado creativo e ilustración 3D: explorar variaciones de un objeto cambiando la semilla y los parámetros de muestreo (`steps`, `cfg_strength`) sin modelado manual.
- Preprocesado para flujos de trabajo 3D posteriores: el splat generado puede servir como base o referencia para retopología, texturizado o escaneo asistido.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de Idol frente a TripoSplat, TRELLIS y LGM, evaluados con métricas PSNR, SSIM, LPIPS e IoU en la vista de entrada y DINOv2, CLIP y distancia de nitidez en siete vistas nuevas (1 × H100 por modelo). Sin embargo, la tabla de resultados numéricos está truncada en la información proporcionada, por lo que no es posible reproducir las cifras. No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 7,2 GB de pico; los pesos ocupan aproximadamente 3,7–4,4 GB en VRAM.
- GPU requerida: NVIDIA con CUDA. Los benchmarks se han ejecutado en H100, pero el modelo está diseñado para GPUs de consumo.
- Cabe en GPUs de consumo con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti 8 GB, RTX 4060 Ti 8 GB, RTX 4070 y superiores). Con `--dinov3_dtype fp32` se añaden 1,7 GB adicionales, por lo que en ese caso conviene disponer de más margen.
- Requisitos de software: Python 3.10+, PyTorch 2.5+, CUDA.
- Despliegue: SDK propio (`idol-sdk`, instalable con `pip install -e .`), CLI (`python -m idol.sample`) y API Python (`IdolPipeline.from_pretrained`). Existe además una demo interactiva en Hugging Face Spaces.
- Latencia: menos de 2 segundos por objeto en GPU adecuada; la primera imagen de cada proceso es más lenta por la compilación de `torch.compile`.
- Nota de acceso: los codificadores de imagen (DINOv3 y FLUX.2-dev) son modelos gated en Hugging Face; hay que aceptar sus términos y autenticarse con `hf auth login` o `HF_TOKEN`.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Hardware | Licencia |
|---|---|---|---|---|
| Idol (speridlabs) | Imagen a 3D Gaussian splat, generativo (DiT) | ~1.80B (pipeline completo) | 7,2 GB VRAM, <2 s | Apache-2.0 |
| TRELLIS | Imagen/texto a 3D estructurado (SLAT) | no disponible | mayor que Idol (no cuantificado en la ficha) | MIT (código), pesos con licencia propia de Microsoft |
| TripoSplat | Reconstrucción 3D feed-forward desde múltiples vistas | no disponible | no disponible | no disponible |
| LGM (Large Gaussian Model) | Imagen a 3DGS multimodal | ~563M | no disponible | Apache-2.0 |

Idol se diferencia de LGM y TripoSplat en que genera el splat completo de forma generativa (difusión) a partir de una única imagen, incluyendo geometría no vista, mientras que los métodos feed-forward tienden a reconstruir principalmente lo observable. Frente a TRELLIS, Idol destaca por su menor huella de VRAM y su tiempo de inferencia por debajo de 2 segundos.

## Limitaciones y advertencias

- La salida es un splat gaussiano 3D, no una malla: no es directamente utilizable para impresión 3D ni para pipelines que exijan topología de malla sin conversión posterior.
- Al ser un modelo generativo, la geometría de las caras no visibles es inferida y puede no coincidir con el objeto real; existe riesgo de alucinación de detalle en zonas ocluidas.
- La calidad depende del modo de entrada elegido: usar `synthetic` con fotografías reales (o viceversa) degrada el encuadre y el resultado.
- Requiere aceptar los términos de dos modelos gated (DINOv3 y FLUX.2-dev), lo que añade fricción de acceso y posibles restricciones heredadas de esos componentes para ciertos usos.
- La primera inferencia de cada proceso es más lenta por la compilación de `torch.compile`, lo que puede afectar a cargas de trabajo con arranques frecuentes.
- Los pesos del modelo ocupan unos 3 GB y los codificadores se descargan además en la primera ejecución, con un repo total de 3,6 GB.
- No se ha publicado información sobre sesgos del modelo ni sobre su rendimiento con objetos transparentes, reflectantes o escenas con múltiples objetos.
- La licencia Apache-2.0 permite uso comercial, pero conviene revisar las licencias de los codificadores gated empleados en el pipeline.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/speridlabs/idol
- Página del proyecto: https://speridlabs.com/research/idol
- Código (SDK en GitHub): https://github.com/speridlabs/idol-sdk
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/speridlabs/idol
- Codificador DINOv3 (gated): https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- VAE de FLUX.2-dev (gated): https://huggingface.co/black-forest-labs/FLUX.2-dev
