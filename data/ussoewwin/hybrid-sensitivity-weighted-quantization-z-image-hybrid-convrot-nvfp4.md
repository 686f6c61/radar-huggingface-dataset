# ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-Z-Image-Hybrid-ConvRot-NVFP4

## Resumen

El modelo `Hybrid-Sensitivity-Weighted-Quantization-Z-Image-Hybrid-ConvRot-NVFP4` es un conjunto de cuatro archivos de pesos cuantizados para modelos de difusión texto-imagen de la familia Z-Image Turbo, desarrollado por el usuario ussoewwin. Aplica una técnica de cuantización híbrida denominada HSWQ (Hybrid-Sensitivity-Weighted Quantization) que combina capas en INT8 nativo con capas convertidas a NVFP4 (formato de coma flotante de 4 bits de NVIDIA), seleccionadas mediante análisis de sensibilidad e importancia de trayectoria. El objetivo es reducir el consumo de VRAM entre un 53 % y un 58 % respecto al modelo original en FP16, manteniendo una fidelidad visual alta (SSIM entre 0,97 y 0,99).

Estos modelos están pensados para su uso en ComfyUI mediante un nodo personalizado específico, y se basan en los checkpoints Moody Pro Mix y Moody Real Mix creados por catlover1937, cuantizados a partir de versiones concretas de Z-Image Turbo (zit v1.3, Collector's Edition, v7.0 y XHS Edition). La relevancia de esta publicación radica en que permite ejecutar modelos de difusión de alta calidad en GPUs con memoria limitada, sin sacrificar de forma apreciable la calidad de las imágenes generadas, y facilita su integración en flujos de trabajo de producción creativa.

El repositorio tiene un tamaño de 65,6 GB en total (los cuatro archivos .safetensors), y se distribuye bajo una licencia "other" que en la práctica hereda las condiciones CreativeML Open RAIL++-M de los modelos base. No se especifican parámetros totales ni detalles de arquitectura interna más allá de la estructura de UNet propia de Z-Image Turbo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión (Z-Image Turbo) con capas ConvRot, cuantización híbrida INT8 + NVFP4 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | NVFP4 (híbrido con INT8 nativo) |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de texto explícito) |
| Licencia | other (derivada de CreativeML Open RAIL++-M para los modelos base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un UNet de difusión de la familia Z-Image Turbo, optimizado para generación de imágenes fotorrealistas. La cuantización se realiza post-entrenamiento mediante el método HSWQ, que en lugar de aplicar una conversión uniforme a baja precisión, analiza la sensibilidad de cada capa y su importancia en la trayectoria de muestreo. El proceso descrito en la documentación indica que se parte de un UNet completamente cuantizado a INT8 con capas ConvRot, y luego se convierten a NVFP4 aquellas capas cuyo impacto en la calidad es menor, en orden ascendente de impacto. Esto produce un modelo híbrido donde las capas críticas permanecen en INT8 y las menos críticas usan NVFP4, logrando un equilibrio entre compresión y fidelidad.

No se proporcionan datos sobre el dataset de entrenamiento del modelo base ni sobre el proceso de entrenamiento original de Z-Image Turbo. La cuantización es una técnica de compresión que no requiere reentrenamiento, aunque sí un calibrado basado en análisis de sensibilidad. La implementación se apoya en la librería Nunchaku y en el trabajo previo del equipo Nunchaku sobre SVDQ (cuantización basada en descomposición en valores singulares), que se reconoce explícitamente en los créditos.

## Capacidades

- Generación de imágenes fotorrealistas a partir de texto, gracias a la arquitectura Z-Image Turbo.
- Soporte para ControlNet, lo que permite un control fino sobre la composición, pose, profundidad u otros condicionamientos.
- Integración nativa con ComfyUI mediante el nodo personalizado `ComfyUI-HSWQ-Loader-and-Tools`, que carga los pesos cuantizados sin necesidad de conversiones adicionales.
- Alta fidelidad visual con SSIM entre 0,97 y 0,99 respecto al modelo original en FP16, según las pruebas publicadas.
- Reducción significativa del uso de VRAM (53–58 %), lo que permite ejecutar el modelo en GPUs con menos memoria.
- Compatibilidad con el formato NVFP4, optimizado para GPUs NVIDIA recientes (arquitecturas Hopper y posteriores).
- Cuatro variantes distintas del mismo esquema de cuantización, cada una basada en un checkpoint diferente de Moody Pro Mix o Moody Real Mix, ofreciendo diferentes estilos y ajustes estéticos.

## Casos de uso

- Generación de imágenes en equipos con GPUs de gama media: gracias al ahorro de VRAM, un modelo que originalmente requería 12–16 GB puede ejecutarse en tarjetas con 8 GB o menos, lo que permite a creadores individuales usar Z-Image Turbo sin necesidad de hardware profesional.
- Producción de arte conceptual y diseño gráfico: los modelos Moody Pro Mix y Moody Real Mix están ajustados para estilos fotorrealistas y artísticos, por lo que son adecuados para generar bocetos, ilustraciones y visualizaciones en flujos de trabajo de diseño.
- Integración en pipelines de ComfyUI para automatización: el nodo loader específico permite incorporar estos pesos en grafos complejos de ComfyUI, combinándolos con ControlNet, LoRA u otros nodos para generar variaciones controladas.
- Experimentación con cuantización de modelos de difusión: el repositorio incluye documentación y scripts para reproducir el proceso de cuantización, lo que lo convierte en una referencia para investigadores interesados en técnicas de compresión como NVFP4 o SVDQ.
- Despliegue en entornos con restricciones de memoria: servicios de inferencia en la nube o servidores con GPUs compartidas pueden beneficiarse de la reducción de VRAM para servir más solicitudes concurrentes.
- Creación de contenido para redes sociales y marketing: la generación rápida de imágenes de alta calidad con un solo modelo cuantizado permite producir material visual para campañas, publicaciones o avatares sin depender de servicios externos.

## Benchmarks y rendimiento

La única métrica publicada en la model card es la comparación de SSIM y tamaño de archivo frente al modelo original en FP16:

| Modelo | SSIM (promedio) | Tamaño de archivo | Compatibilidad |
| :--- | :--- | :--- | :--- |
| Original FP16 | 1,0000 | 100 % | Alta |
| **HSWQ Z-Image Hybrid ConvRot NVFP4** | 0,97–0,99 | 60 % (FP16 mixto) | Alta (ComfyUI NVFP4) |

No se han publicado resultados de benchmarks adicionales (como FID, CLIP score o tiempos de inferencia) en la información disponible. El repositorio GitHub menciona un archivo de resultados de benchmark (`benchmark_zi_nvfp4.md`), pero su contenido no se ha incluido en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: no se especifica un valor exacto, pero el ahorro del 53–58 % sugiere que un modelo que requería ~12 GB en FP16 podría funcionar con ~5–6 GB en esta versión cuantizada. Sin embargo, al ser un conjunto de cuatro archivos de diferentes tamaños, la VRAM necesaria varía según la variante.
- GPU recomendadas: se requieren GPUs NVIDIA compatibles con NVFP4, es decir, arquitectura Hopper (H100) o Blackwell (B200, RTX 50 series). No se garantiza el funcionamiento en GPUs más antiguas (Ampere, Turing) debido a la falta de soporte nativo para FP4.
- Compatibilidad con GPU de consumo: las RTX 50 series (Blackwell) son las únicas tarjetas de consumo que soportan NVFP4 de forma nativa. Para otras GPUs, podría ser necesario usar emulación o convertir los pesos, lo que anularía parte de la ventaja de tamaño.
- Opciones de despliegue: ComfyUI con el nodo personalizado `ComfyUI-HSWQ-Loader-and-Tools` es el método principal. También se puede usar la librería Nunchaku directamente en scripts de Python.
- Latencia y throughput: no se han publicado datos concretos. Se espera que la inferencia sea más rápida que en FP16 debido al menor ancho de banda de memoria requerido, pero esto depende de la implementación y del hardware.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos cuantizados de Z-Image Turbo con NVFP4 o técnicas similares. La comparación más directa es con el modelo original en FP16, que se muestra en la tabla de benchmarks. Otras cuantizaciones comunes (FP8, INT8) podrían ofrecer un ahorro menor pero con mayor compatibilidad, aunque no se han encontrado datos publicados para Z-Image Turbo. Por tanto, la comparativa se limita a la tabla de la model card.

## Limitaciones y advertencias

- Licencia "other": aunque los modelos base usan CreativeML Open RAIL++-M, la licencia del repositorio es "other", lo que obliga a revisar los términos exactos antes de un uso comercial. El autor indica que se debe adherir a las licencias originales de los modelos base.
- Dependencia de hardware específico: NVFP4 solo es soportado de forma nativa por GPUs NVIDIA Hopper y Blackwell. En GPUs más antiguas, el modelo no funcionará o requerirá conversión, perdiendo la ventaja de tamaño.
- Posible degradación en casos extremos: aunque el SSIM es alto (0,97–0,99), puede haber pérdidas sutiles en texturas finas, detalles de alta frecuencia o escenas con iluminación compleja.
- Sin garantía de calidad en todos los estilos: al ser derivados de checkpoints específicos (Moody Pro Mix, Moody Real Mix), el comportamiento puede variar según el prompt y el estilo deseado.
- No se proporcionan datos sobre sesgos o alucinaciones visuales; al ser un modelo de generación de imágenes, puede producir contenido no deseado o inexacto en ciertos contextos.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad; se recomienda probar antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-Z-Image-Hybrid-ConvRot-NVFP4
- Repositorio GitHub del proyecto HSWQ: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization
- Guía de cuantización para Z-Image Hybrid NVFP4: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/md/How%20to%20quantize%20Z%20Image%20-%20Hybrid%20NVFP4.md
- Nodo de ComfyUI para cargar los modelos: https://github.com/ussoewwin/ComfyUI-HSWQ-Loader-and-Tools
- Resultados de benchmark publicados: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/benchmark%20result/benchmark_zi_nvfp4.md
- Repositorio original de Nunchaku (SVDQ): https://huggingface.co/nunchaku-tech/nunchaku-sdxl
- Página de catlover1937 en Civitai (creador de los modelos base): https://civitai.com/user/catlover1937
