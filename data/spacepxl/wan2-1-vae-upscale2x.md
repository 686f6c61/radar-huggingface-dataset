# spacepxl/Wan2.1-VAE-upscale2x

## Resumen

Wan2.1-VAE-upscale2x es un finetune del decodificador del VAE (autoencoder variacional) del modelo de difusión Wan2.1, desarrollado por el usuario spacepxl. Su principal innovación es integrar un factor de upscaling 2x directamente en la última capa del decodificador, de modo que al decodificar latentes se obtiene una imagen con el doble de resolución y, al mismo tiempo, se eliminan los artefactos característicos de grano o speckle que produce el VAE original de Wan2.1. El modelo está pensado para flujos de trabajo de generación de imágenes y vídeo con alta calidad perceptual, y resulta especialmente útil en tareas de highres fix, ya que el coste computacional adicional de decodificar a doble resolución es prácticamente nulo.

El modelo se basa en el VAE de Wan2.1 (modelo base Wan-AI/Wan2.1-T2V-14B) y comparte el mismo espacio latente con los modelos de difusión de Wan y Qwen, por lo que puede usarse con ambos. Está entrenado casi exclusivamente con imágenes reales, lo que mejora significativamente los detalles de piel y cabello, pero puede fallar con contenido de anime, lineart o texto. Se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors, con integración tanto en la librería diffusers como en ComfyUI mediante nodos personalizados. La versión actual solo soporta imágenes; una versión para vídeo está planeada pero aún no se ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (decoder-only finetune del VAE de Wan2.1) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del decodificador del VAE de Wan2.1. El encoder se mantiene congelado para preservar el espacio latente original, y solo se entrena el decodificador. La modificación clave consiste en reemplazar la última capa Conv3d del decodificador, que originalmente produce 3 canales de salida (RGB), por una capa que produce 12 canales. Esos 12 canales se reorganizan mediante un pixel shuffle (factor 2) para obtener una imagen de doble resolución. De esta forma, el upscaling se integra en el propio proceso de decodificación, sin necesidad de un paso posterior de superresolución.

El entrenamiento se realizó con una combinación de pérdidas: L1, LPIPS, FDL (Frequency Distribution Loss) y pérdida adversarial GAN con un discriminador PatchGAN con normalización espectral y pérdida LSGAN no saturada. Según el autor, el peso de LPIPS se mantuvo bajo para evitar artefactos de tablero de ajedrez, y la pérdida GAN se usó con un peso relativamente alto para mejorar nitidez y realismo. El entrenamiento se llevó a cabo a resolución base 256 (ampliada a 512), con tamaño de lote 4 y 300.000 pasos, durante aproximadamente 40 horas en una GPU RTX 5090. No se han publicado métricas objetivas (PSNR, SSIM, LPIPS) porque el autor priorizó la calidad perceptual frente a las métricas tradicionales, que considera mal alineadas con la preferencia humana.

## Capacidades

- Decodificación de latentes de los modelos de difusión Wan2.1 y Qwen (comparten espacio latente) con upscaling 2x integrado.
- Eliminación de los artefactos de speckle, puntos y grano característicos del VAE original de Wan2.1.
- Mejora significativa de los detalles de piel y cabello en imágenes fotorrealistas.
- Salida a doble resolución sin coste computacional adicional apreciable respecto al decodificador original.
- Compatible con la librería diffusers mediante la clase `AutoencoderKLWan` y con ComfyUI a través de los nodos personalizados `ComfyUI-VAE-Utils`.
- Permite obtener una imagen a resolución original con mayor calidad aplicando un ligero desenfoque y reducción de escala a la salida del decodificador.

## Casos de uso

- Mejora de la calidad de imágenes generadas con Wan2.1 T2V o I2V: al sustituir el VAE original por este finetune, las imágenes generadas por el modelo de difusión se decodifican sin artefactos de grano y con mayor nitidez en detalles finos como piel o cabello.
- Highres fix en flujos de trabajo de ComfyUI: el upscaling 2x integrado permite aumentar la resolución de las imágenes generadas sin necesidad de un upscaler externo (como Real-ESRGAN o SwinIR), simplificando el grafo de nodos y reduciendo el tiempo de procesamiento.
- Generación de imágenes de alta resolución para producción de contenido visual: por ejemplo, en diseño gráfico o ilustración fotorrealista, donde se requiere una salida de 1024x1024 o superior a partir de latentes de 512x512.
- Postprocesado de fotogramas de vídeo: aunque la versión actual es solo para imágenes, se puede aplicar el decodificador a fotogramas individuales de vídeos generados con Wan2.1 para eliminar el grano y aumentar la resolución antes de reensamblar el vídeo.
- Integración en pipelines de generación de imágenes con diffusers: el modelo se carga con `AutoencoderKLWan` y puede usarse en scripts de Python para decodificar latentes de cualquier modelo Wan o Qwen, facilitando la experimentación y el ajuste fino de flujos de trabajo.
- Preprocesado para otros modelos de visión: al obtener imágenes de mayor resolución y mejor calidad, se pueden alimentar a modelos de análisis de imagen (detección de objetos, segmentación, etc.) que se benefician de entradas más nítidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no proporciona métricas objetivas (PSNR, SSIM, LPIPS) porque el desarrollo se centró en la calidad perceptual, y que las métricas tradicionales están mal alineadas con la preferencia humana. Las únicas comparaciones disponibles son enlaces a comparaciones visuales (slow.pics) donde se muestran diferencias entre el VAE original y este finetune.

## Requisitos de hardware

- Inferencia: el tamaño del repositorio es de 1.0 GB, por lo que el modelo es ligero. No se especifica la VRAM mínima, pero al ser un VAE de tamaño reducido, debería ejecutarse sin problemas en GPUs de consumo con al menos 4 GB de VRAM.
- El entrenamiento se realizó en una RTX 5090 (40 horas para 300k pasos), lo que da una idea de que la inferencia es mucho más rápida y viable en hardware de gama media.
- Compatible con las librerías diffusers y ComfyUI. En ComfyUI se requieren los nodos personalizados `ComfyUI-VAE-Utils`.
- No se dispone de datos de latencia o throughput específicos, pero al ser un decodificador VAE, el coste es una fracción mínima del coste total de generación con un modelo de difusión.

## Comparativa con modelos similares

| Modelo | Tipo | Upscaling integrado | Artefactos speckle | Compatibilidad | Licencia |
|---|---|---|---|---|---|
| Wan2.1-VAE-upscale2x (spacepxl) | VAE decoder finetune | Sí (2x) | Eliminados | Wan2.1 y Qwen | Apache 2.0 |
| VAE original de Wan2.1 (Wan-AI/Wan2.1-T2V-14B) | VAE estándar | No | Presentes | Wan2.1 | Apache 2.0 |
| VAE de Qwen (si existe) | no disponible | no disponible | no disponible | Qwen | no disponible |

No se dispone de información sobre otros VAEs con upscaling integrado en el ecosistema de difusión latente. La comparativa principal es con el VAE original de Wan2.1, del que este modelo es un finetune directo. La ventaja clave es la eliminación de artefactos y el upscaling gratuito, a costa de una posible ligera desviación de color y una nitidez excesiva en algunos casos.

## Limitaciones y advertencias

- Entrenado casi exclusivamente con imágenes reales; puede producir resultados deficientes con contenido de anime, lineart o texto, donde el decodificador puede generar artefactos o distorsiones.
- Puede introducir ligeros cambios de color y una nitidez excesiva en algunas salidas. El autor recomienda aplicar un desenfoque y reducción de escala si se desea la resolución original con mayor calidad.
- No se han publicado métricas objetivas de reconstrucción, por lo que la evaluación se basa únicamente en comparaciones visuales subjetivas.
- La versión actual solo soporta imágenes; la versión para vídeo está planeada pero aún no está disponible.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye tal cual, sin garantías. El autor advierte que el entrenamiento se realizó con un dataset de imágenes reales sin especificar su procedencia, por lo que podría haber problemas de derechos de autor en los datos de entrenamiento.
- En entornos de producción, se recomienda validar visualmente los resultados antes de desplegar el modelo, especialmente en tareas donde la fidelidad de color sea crítica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spacepxl/Wan2.1-VAE-upscale2x
- Nodos personalizados para ComfyUI: https://github.com/spacepxl/ComfyUI-VAE-Utils
- Comparación visual (imágenes generadas, VAE original vs 2x VAE): https://slow.pics/s/9kxYpyxB
- Comparación visual (highres fix con upscaler ultrasharp vs 2x decoder): https://slow.pics/s/Gk1F5dHo
- Pérdida de distribución de frecuencias (FDL): https://github.com/eezkni/FDL
