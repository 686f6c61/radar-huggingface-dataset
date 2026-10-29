# Tanuj124/image-super-resolution-edsr-x4

## Resumen

Compact EDSR Image Super-Resolution 4× es un modelo de superresolución de imagen de un solo paso que amplía imágenes por un factor de 4. Lo desarrolla Tanuj124 como implementación propia en PyTorch, entrenada localmente en una RTX 3060 de 12 GB, y se publica como un experimento de investigación reproducible más que como un producto listo para producción. Su tamaño es mínimo: 522.243 parámetros según la model card (522.246 según los metadatos de safetensors de HuggingFace), lo que lo sitúa en la categoría de upscaler ultraligero.

La arquitectura es un EDSR compacto de 8 bloques residuales y 48 canales de características, sin normalización por lotes, con pixel shuffle para el aumento de resolución y escalado residual de 0,1. Se entrenó con pérdida L1 exclusivamente sobre degradación bicúbica sintética (DIV2K más LSDIR), sin GAN ni pérdida perceptual, por lo que su objetivo es la reconstrucción fiel en el sentido de PSNR/SSIM, no la generación de texturas realistas.

Su relevancia actual es la de un baseline barato y auditable: pesos en safetensors, código fuente, configuración resuelta y hashes de checkpoint publicados, métricas por imagen guardadas y una separación estricta entre validación y test. Sirve para comparar, para docencia y para pipelines donde el coste computacional o la trazabilidad pesan más que la calidad perceptual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EDSR compacto (CNN residual, 8 bloques residuales, 48 canales, pixel shuffle, sin batch normalization) |
| Parametros totales | 522.243 según la model card; 522.246 según los metadatos de safetensors de HuggingFace |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen; entrada de resolución arbitraria con inferencia por teselas) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors y no documenta variantes GGUF, ONNX ni int8 |
| Idiomas soportados | No aplica / no disponible (modelo de imagen, no procesa texto) |
| Licencia | Pesos: `academic-research-use-notice` (licencia `other`). Código fuente: MIT |
| Formato de pesos | safetensors (checkpoint PyTorch); código de inferencia en `source.zip` |
| Factor de escala | 4× (checkpoints independientes por escala) |
| Pipeline | image-to-image |
| Recuento de descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La red es una implementación original de estilo EDSR, no los pesos preentrenados de los autores del paper. Consta de 8 bloques residuales con 48 canales de características, escalado residual de 0,1, un desplazamiento de la media RGB y una etapa de pixel shuffle para la reconstrucción a 4×. No emplea batch normalization, GAN ni pérdida perceptual; la salida se optimiza directamente contra la imagen de alta resolución. El entrenamiento usa Adam con pérdida L1, tasa de aprendizaje inicial 0,0002, schedule coseno, precisión mixta, recorte de gradiente 1,0, semilla 42, parches de baja resolución de 32 píxeles y tamaño de lote 8. Se completaron 60 épocas y se exportó el checkpoint seleccionado por validación de la época 57.

Los datos de entrenamiento son 30.749 escenas de alta resolución únicas: las 750 primeras imágenes de DIV2K (0001–0750) y 29.999 imágenes de LSDIR obtenidas de un espejo de Kaggle, tras eliminar un duplicado exacto. Las copias de baja resolución se generan con degradación bicúbica sintética mediante Pillow, sin entrenamiento sobre degradaciones reales (no se usa RealSR). La validación interna son las imágenes 0751–0800 de DIV2K y el test retenido son las 0801–0900; el subconjunto retenido de 250 imágenes de LSDIR se divide en 125 de validación y 125 de test. La selección de pesos se hace por Y-PSNR y no se emplean los resultados de test para elegir checkpoint. La model card advierte que no se pueden descartar por completo recortes arbitrarios o escenas repetidas entre particiones.

## Capacidades

- Superresolución 4× de imágenes RGB con un único paso hacia delante, sin modelos auxiliares ni discriminadores.
- Reconstrucción orientada a fidelidad (PSNR/SSIM) de imágenes degradadas por downsampling bicúbico.
- Inferencia por teselas con halo de convolución (`tile_size`, por ejemplo 128) para procesar imágenes mayores que la memoria disponible, ensamblando la salida en CPU.
- Ejecución en CPU y en CUDA mediante el mismo objeto `Upscaler` con `device='auto'`.
- Límite de seguridad de 16 megapíxeles por salida para acotar el uso de memoria del host.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje: es un modelo puramente image-to-image.
- No hay modo "thinking", visión de alto nivel, audio ni capacidades multilingües.
- Integración no soportada vía `transformers.AutoModel`; la API es el paquete propio `superres.inference`.

## Casos de uso

- Baseline de investigación en superresolución: sirve como referencia ligera (522 mil parámetros) para medir la ganancia de arquitecturas mayores sobre degradación bicúbica, con métricas y hashes reproducibles incluidos en el repositorio.
- Docencia y prácticas de visión por computador: el paquete incluye código de entrenamiento, adquisición y evaluación, y entrena en una RTX 3060 de 12 GB, lo que permite reproducir el pipeline completo en un aula con hardware de consumo.
- Preprocesado en pipelines de etiquetado: ampliar recortes de baja resolución antes de una revisión humana o de un modelo de detección posterior, aceptando que los detalles generados son estimaciones.
- Despliegue en entornos sin GPU: al ocupar del orden de 2 MB en FP32, cabe en CPU y en dispositivos con memoria muy limitada, útil para procesos por lotes de bajo coste.
- Aumento de datos controlado: generar pares sintéticos baja→alta resolución para experimentos de aumento de datos, siempre que el sesgo bicúbico encaje con la distribución objetivo.
- Ampliación de material gráfico para revisión visual no crítica (miniaturas, capturas, ilustraciones de documentación), donde el fallo en texto pequeño o matrículas no tiene consecuencias.
- Comparación de protocolos de evaluación: el repo separa validación y test y publica métricas por imagen, lo que lo hace útil para auditar cómo cambian los resultados según la fuente de baja resolución.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre el checkpoint exportado. Protocolo: cuantización a RGB de 8 bits, Y BT.601 de rango limitado, recorte de 4 píxeles en bordes, SSIM gaussiano 11×11 válido con sigma 1,5 y medias aritméticas por imagen. Las condiciones usan fuentes de baja resolución distintas y no deben agruparse.

| Condición | Imágenes | Y-PSNR (dB) | Y-SSIM | Bicúbico Y-PSNR (dB) | Bicúbico Y-SSIM |
|---|---:|---:|---:|---:|---:|
| evaluation-test | 100 | 29,9749 | 0,826909 | 28,2277 | 0,777488 |
| benchmark-div2k-official | 100 | 29,9745 | 0,826908 | 28,2276 | 0,777490 |
| benchmark-lsdir-heldout | 125 | 25,7472 | 0,748362 | 24,4406 | 0,680648 |

La ganancia frente a la interpolación bicúbica es de aproximadamente 1,75 dB de Y-PSNR en DIV2K y 1,31 dB en el subconjunto retenido de LSDIR. El "test" de DIV2K es el conjunto de validación oficial público, no el hidden-test del reto NTIRE. LPIPS no se evaluó. La model card declara explícitamente que no se reclama ningún resultado adicional de comparación entre arquitecturas, por lo que no se dispone de cifras frente a EDSR completo, SwinIR o Real-ESRGAN en esta información.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los pesos ocupan aproximadamente 2,1 MB en FP32 y 1,05 MB en FP16 (cálculo derivado del recuento de parámetros); el consumo real lo dominan las activaciones, que dependen de la imagen y del `tile_size`.
- GPU recomendadas: cualquiera con soporte CUDA, incluida una RTX 3060 de 12 GB (el autor entrenó y midió en ella). No se requieren A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e integrada con soporte CUDA o incluso en CPU; no hay requisito práctico de VRAM.
- Opciones de despliegue: paquete PyTorch propio (`superres.inference.Upscaler`) con backend CPU/CUDA. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, que además no aplican a este tipo de modelo. No se menciona exportación a ONNX, TensorRT ni TorchScript.
- Latencia y throughput: no disponibles en la información proporcionada. El `evaluation.json` del repositorio contiene registros de latencia y memoria pico medidas en RTX 3060, pero esos datos no se han incluido en esta ficha y el autor advierte que son medidas en GPU, no promesas de servicio en CPU.
- Memoria del host: la inferencia por teselas ensambla la salida en CPU y se rechazan salidas de más de 16 megapíxeles, lo que acota el pico de RAM.

## Comparativa con modelos similares

No se han aportado mediciones comparativas en la información disponible; la propia model card indica que no se reclama ningún resultado de comparación entre arquitecturas. La siguiente tabla recoge únicamente lo verificable y marca el resto como no disponible.

| Modelo | Parámetros | Contexto / escala | Licencia | Datos comparativos |
|---|---|---|---|---|
| Compact EDSR 4× (Tanuj124) | 522.243 | No aplica; escala 4× | Pesos: academic-research-use-notice; código MIT | Y-PSNR/Y-SSIM frente a bicúbico en DIV2K y LSDIR |
| EDSR original (Lim et al., CVPRW 2017) | No disponible en esta información | No aplica; escala 4× | No disponible | No se han ejecutado comparaciones |
| SwinIR | No disponible en esta información | No aplica; escala 4× | No disponible | No se han ejecutado comparaciones |
| Real-ESRGAN | No disponible en esta información | No aplica; escala 4× | No disponible | No se han ejecutado comparaciones |

Diferencias cualitativas conocidas por categoría, sin cifras: el EDSR original y SwinIR son arquitecturas de referencia con muchos más parámetros y mayor coste; Real-ESRGAN está orientado a degradaciones reales y a calidad perceptual, mientras que este modelo se entrena solo con degradación bicúbica y optimiza L1. Cualquier comparación numérica requeriría ejecutar los modelos sobre el mismo protocolo.

## Limitaciones y advertencias

- Alucinación de detalle: el modelo inventa texturas plausibles. La model card advierte de errores en texto, caras, matrículas, ruido y artefactos JPEG. No debe usarse como evidencia forense, médica ni de identidad.
- Dominio de entrenamiento restringido: solo degradación bicúbica sintética, sin RealSR. No hay evidencia de que funcione sobre degradaciones reales de cámara (desenfoque de lente, ruido de sensor, compresión agresiva).
- Licencia de pesos restrictiva: `academic-research-use-notice`, orientada a investigación y evaluación educativa. No se afirma una licencia permisiva para los pesos entrenados, aunque el código sea MIT. Los avisos de los datasets no establecen explícitamente derechos de redistribución de los pesos entrenados; conviene leer `LICENSE-WEIGHTS.md` antes de cualquier uso.
- Falta de validación externa: 0 descargas y 0 likes; el repositorio figura con 0,0 GB y no hay revisión independiente de los resultados.
- Evaluación incompleta: solo métricas en el canal Y (luminancia), sin LPIPS ni métricas perceptuales, y sin comparación con otras arquitecturas. El "test" de DIV2K es el conjunto de validación oficial, no el hidden-test del reto.
- Procedencia parcialmente opaca: el subconjunto retenido de LSDIR proviene de un espejo de Kaggle y su procedencia no está autenticada de forma independiente. No se pueden descartar por completo recortes arbitrarios o escenas repetidas entre particiones.
- Sesgos de datos: la composición demográfica, geográfica y de contenido de DIV2K y LSDIR no se documenta en esta información, por lo que el comportamiento diferencial por tipo de imagen es desconocido.
- Límites operativos: salidas de más de 16 megapíxeles se rechazan; la calidad en imágenes muy grandes depende del teselado y de la correcta aplicación del halo de convolución.
- Discrepancia menor en el recuento de parámetros entre la model card (522.243) y los metadatos de HuggingFace (522.246); conviene verificar los hashes del manifiesto antes de reproducir resultados.
- Sin integración estándar: no hay soporte de `transformers.AutoModel`, API remota ni formato de despliegue estándar, lo que añade trabajo de integración en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tanuj124/image-super-resolution-edsr-x4
- Aviso de uso de los pesos: https://huggingface.co/Tanuj124/image-super-resolution-edsr-x4/blob/main/LICENSE-WEIGHTS.md
- Dataset de LSDIR en Kaggle usado como fuente: https://www.kaggle.com/datasets/parampandya0310/hr-image-denoising-lsdir
- DIV2K: https://data.vision.ee.ethz.ch/cvl/DIV2K/
- LSDIR: https://ofsoundof.github.io/lsdir-data/
- Referencia DIV2K / NTIRE 2017: Agustsson y Timofte, "NTIRE 2017 Challenge on Single Image Super-Resolution: Dataset and Study", CVPR Workshops 2017 (sin enlace proporcionado).
- Referencia LSDIR: Li et al., "LSDIR: A Large Scale Dataset for Image Restoration", CVPR Workshops 2023 (sin enlace proporcionado).
- Referencia EDSR: Lim et al., "Enhanced Deep Residual Networks for Single Image Super-Resolution", CVPR Workshops 2017 (sin enlace proporcionado; el repositorio usa una implementación propia, no los pesos de los autores).
