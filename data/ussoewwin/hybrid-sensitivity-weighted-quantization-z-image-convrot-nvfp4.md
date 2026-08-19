# ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-Z-Image-ConvRot-NVFP4

## Resumen

El modelo `Hybrid-Sensitivity-Weighted-Quantization-Z-Image-ConvRot-NVFP4` es un conjunto de dos modelos de difusión de texto a imagen (Z-Image / SDXL) cuantizados mediante la técnica HSWQ (Hybrid-Sensitivity-Weighted-Quantization), desarrollada por el usuario ussoewwin. Esta técnica combina análisis de sensibilidad e importancia para asignar de forma óptima la precisión numérica en lugar de aplicar un cast uniforme, logrando una cuantización NVFP4 de alta fidelidad que reduce significativamente el uso de VRAM sin sacrificar calidad visual.

El repositorio incluye dos variantes derivadas de los modelos Moody Pro Mix (v1.3) y Moody Real Mix (v7.0), ambos creados por catlover1937. La cuantización aplica una conversión completa ConvRot: las capas lineales se convierten a NVFP4 y las convoluciones a INT8 (int8_tensorwise), con protección FP16 mediante DualMonitor y el optimizador V4 pack-MSE. El resultado se integra en ComfyUI a través de un nodo personalizado, manteniendo compatibilidad con el ecosistema estándar de carga de modelos.

La relevancia actual de este modelo radica en su capacidad para ejecutar generación de imágenes fotorrealistas en GPUs con memoria limitada, aprovechando el formato NVFP4 soportado por hardware NVIDIA reciente. El benchmark reportado indica un SSIM promedio de 0.97 frente al original FP16, con un tamaño de archivo reducido al 60% del original, lo que lo convierte en una opción práctica para entornos de producción con restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (Z-Image / SDXL) cuantizado con NVFP4 (ConvRot) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-image) |
| Tipos de cuantizacion | NVFP4 (capas lineales), INT8 (convoluciones), FP16 (proteccion parcial) |
| Idiomas soportados | no disponible |
| Licencia | other (los modelos base usan CreativeML Open RAIL++-M) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de difusión Z-Image (una variante de SDXL) y ha sido sometido a un proceso de cuantización post-entrenamiento denominado HSWQ. Este proceso utiliza un análisis híbrido de sensibilidad e importancia para determinar los umbrales de clipping óptimos por capa, en lugar de aplicar una conversión uniforme. La cuantización ConvRot convierte las capas lineales a NVFP4 (formato de punto flotante de 4 bits) y las capas convolucionales a INT8 con escala por tensor, mientras que ciertas partes críticas se mantienen en FP16 mediante el mecanismo DualMonitor y el optimizador V4 pack-MSE.

No se dispone de información sobre el entrenamiento original de los modelos base (Moody Pro Mix y Moody Real Mix), ya que son derivados de modelos existentes. El proceso de cuantización no implica entrenamiento adicional, sino una optimización de precisión basada en análisis de sensibilidad. El repositorio incluye scripts de conversión (`hswq_convert_nvfp4_1.0.py` y `native_convert_nvfp4.py`) que permiten reproducir el proceso.

## Capacidades

- Generación de imágenes fotorrealistas de alta calidad a partir de descripciones textuales.
- Soporte de ControlNet, lo que permite un control estructural adicional sobre la composición de las imágenes.
- Compatibilidad con ComfyUI mediante el nodo personalizado `ComfyUI-HSWQ-Loader-and-Tools`.
- Cuantización NVFP4 que reduce el uso de VRAM en comparación con modelos FP16 equivalentes.
- Mantiene una fidelidad visual alta (SSIM 0.97 frente al original FP16) según el benchmark reportado.
- Integración con la librería Nunchaku para la carga y ejecución de modelos cuantizados.

## Casos de uso

- Generación de imágenes en entornos con VRAM limitada: el modelo permite ejecutar SDXL/Z-Image en GPUs de gama media o con memoria reducida, gracias a la cuantización NVFP4 que reduce el consumo de memoria sin degradar significativamente la calidad.
- Producción de contenido visual en ComfyUI: los usuarios pueden cargar estos modelos directamente en ComfyUI mediante el nodo personalizado, integrándolos en flujos de trabajo existentes para generación de imágenes, inpainting o ControlNet.
- Prototipado rápido de aplicaciones de texto a imagen: al ocupar un 60% del tamaño original, el modelo es más ligero de descargar y cargar, lo que acelera el desarrollo de demos y pruebas.
- Optimización de costes en inferencia en la nube: al requerir menos VRAM, se pueden utilizar instancias de GPU más económicas, reduciendo el coste por inferencia en servicios cloud.
- Investigación en cuantización de modelos de difusión: el repositorio incluye scripts y documentación técnica que permiten estudiar y reproducir el método HSWQ, siendo útil para investigadores interesados en compresión de modelos.
- Generación de imágenes con estilos específicos: las dos variantes (Moody Pro Mix y Moody Real Mix) ofrecen estéticas diferenciadas, permitiendo elegir entre un estilo más artístico o más realista según la aplicación.

## Benchmarks y rendimiento

El único benchmark reportado en la model card es el siguiente:

| Modelo | SSIM (promedio) | Tamano de archivo | Compatibilidad |
|---|---|---|---|
| Original FP16 | 1.0000 | 100% | Alta |
| HSWQ Z-Image ConvRot NVFP4 | 0.97 | 60% (FP16 mixto) | Alta (ComfyUI NVFP4) |

No se han publicado resultados de benchmarks adicionales (como FID, CLIP score o tiempos de inferencia) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser una cuantización NVFP4, se espera un consumo de memoria significativamente menor que el modelo FP16 original, pero no se proporcionan cifras concretas.
- GPU recomendadas: se requiere hardware compatible con NVFP4, lo que incluye GPUs NVIDIA con arquitectura Ada Lovelace (RTX 40 series) o posterior, así como GPUs Blackwell. La librería Nunchaku está optimizada para estas arquitecturas.
- Compatibilidad con GPU de consumo: sí, siempre que la GPU soporte FP4 (por ejemplo, RTX 4090, RTX 4080, etc.). No se especifican modelos concretos.
- Opciones de despliegue: ComfyUI con el nodo personalizado `ComfyUI-HSWQ-Loader-and-Tools`, o mediante la librería Nunchaku directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos cuantizados de SDXL. Existe un repositorio hermano (`ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-SDXL-NVFP4`) que aplica la misma técnica a SDXL estándar, y los modelos de la familia Nunchaku (como `nunchaku-tech/nunchaku-sdxl`) también ofrecen cuantización SVDQ. Sin embargo, no se han publicado métricas comparativas entre ellos en la información disponible.

## Limitaciones y advertencias

- La licencia del repositorio se indica como `other`, aunque los modelos base están bajo CreativeML Open RAIL++-M. Es necesario revisar los términos exactos antes de un uso comercial.
- No se proporciona información sobre sesgos o alucinaciones en la generación de imágenes, un riesgo inherente a los modelos de difusión.
- El modelo requiere hardware compatible con NVFP4; en GPUs sin soporte FP4, la ejecución no será posible o se degradará el rendimiento.
- La documentación técnica está disponible principalmente en inglés y japonés (según la nota en note.com), lo que puede limitar su accesibilidad.
- No se especifican los idiomas soportados para las entradas de texto, aunque al ser un modelo de difusión basado en SDXL, es probable que funcione mejor con prompts en inglés.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: [ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-Z-Image-ConvRot-NVFP4](https://huggingface.co/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-Z-Image-ConvRot-NVFP4)
- Repositorio GitHub: [ussoewwin/Hybrid-Sensitivity-Weighted-Quantization](https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization)
- Nodo ComfyUI: [ComfyUI-HSWQ-Loader-and-Tools](https://github.com/ussoewwin/ComfyUI-HSWQ-Loader-and-Tools)
- Repositorio hermano (SDXL): [ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-SDXL-NVFP4](https://huggingface.co/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization-SDXL-NVFP4)
- Referencia a Nunchaku: [nunchaku-tech/nunchaku-sdxl](https://huggingface.co/nunchaku-tech/nunchaku-sdxl)
- Nota técnica sobre HSWQ V4: [note.com/198619891990](https://note.com/198619891990/n/nf339f0e69a9b)
