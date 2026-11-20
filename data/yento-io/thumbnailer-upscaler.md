# Yento-io/thumbnailer-upscaler

## Resumen

`thumbnailer-upscaler` es un repositorio de exportaciones ONNX del modelo de superresolución de imágenes Real-ESRGAN, concretamente la variante compacta `realesr-general-x4v3`, publicada por Yento.io para alimentar el upscaler de imágenes que se ejecuta en el navegador en thumbnailer.dev. No se trata de un modelo nuevo ni de un reentrenamiento: el autor declara explícitamente que redistribuye los pesos oficiales de Xinntao Wang et al. sin modificar los pesos, limitándose a convertirlos a formato ONNX en precisión fp16 y fp32.

La relevancia del repositorio es acotada y de naturaleza práctica: ofrece a desarrolladores web un artefacto ONNX listo para ejecutarse en el dispositivo del usuario mediante WebGPU (con fallback a WebAssembly), de forma que las imágenes no salen del navegador. El caso de uso objetivo es el escalado de miniaturas e imágenes de baja resolución en aplicaciones front-end.

En el momento de la consulta el repositorio no contiene todavía ficheros de pesos: la model card indica que la carpeta se está configurando y que los pesos se añadirán tras completar la exportación y la verificación de licencia. Por tanto, debe considerarse un anuncio de publicación más que un artefacto descargable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no detalla la arquitectura interna; el modelo de origen es Real-ESRGAN `realesr-general-x4v3`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión image-to-image, no de lenguaje) |
| Tipos de cuantizacion | fp16 (WebGPU) y fp32 (WebAssembly); no se mencionan otras |
| Idiomas soportados | no disponible (no aplica; no procesa texto) |
| Licencia | BSD 3-Clause |
| Formato de pesos | ONNX (`.onnx`); ficheros previstos: `realesr-general-x4v3.fp16.onnx` y `realesr-general-x4v3.fp32.onnx` |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura del modelo. Según la información disponible, los pesos proceden de Real-ESRGAN, en concreto de la variante compacta `realesr-general-x4v3`, publicada por Xintao Wang et al. en el artículo *Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data* (ICCVW 2021). Se trata de un modelo de superresolución ciega orientado a imágenes del mundo real, entrenado con datos sintéticos, que escala la entrada por un factor de 4.

No se ha realizado reentrenamiento ni modificación de los pesos: el autor declara que la exportación se verifica numéricamente contra el modelo original de PyTorch. No se especifican en la información proporcionada el número de tokens de entrenamiento (no aplica), la composición del dataset, ni si hubo etapas de ajuste fino adicionales. La innovación técnica del repositorio es la conversión a ONNX en dos precisiones para permitir inferencia en navegador: fp16 para WebGPU y fp32 para el fallback en WebAssembly.

## Capacidades

- Superresolución de imágenes: escalado por factor 4 de imágenes de entrada, orientado a imágenes del mundo real (no solo a degradaciones sintéticas simples).
- Ejecución en el dispositivo del cliente: el modelo está pensado para correr en el navegador mediante WebGPU, con WebAssembly como alternativa cuando WebGPU no está disponible.
- Privacidad por diseño: al ejecutarse localmente, las imágenes no se envían a ningún servidor.
- Procesamiento image-to-image: pipeline declarado como `image-to-image`.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües; no es un modelo de lenguaje.
- No se documentan capacidades adicionales como visión de alto nivel, audio o modos de razonamiento.

## Casos de uso

- Escalado de miniaturas en aplicaciones web: integración directa en el front-end mediante ONNX Runtime Web para ampliar imágenes de baja resolución sin coste de servidor ni subida de ficheros.
- Procesamiento de imágenes con requisitos de privacidad: al ejecutarse en WebGPU o WebAssembly en el dispositivo, es adecuado para flujos donde la imagen no puede abandonar el navegador (documentos, fotos personales).
- Previsualización de imágenes en editores online: mejora de la calidad visual de previsualizaciones de baja resolución antes de una edición o exportación posterior.
- Reducción de costes de infraestructura: al no requerir GPU en servidor, el coste marginal por imagen procesada es cero una vez desplegado el artefacto.
- Aplicaciones offline o PWA: el modelo ONNX puede cachearse y ejecutarse sin conexión, útil en aplicaciones progresivas de edición de imagen.
- Prototipado rápido de pipelines de upscaling: sirve como referencia para comparar la variante compacta x4 frente a otras alternativas antes de invertir en infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas (PSNR, SSIM, LPIPS ni comparativas con otros modelos) y el repositorio aún no contiene los ficheros de pesos.

## Requisitos de hardware

- VRAM estimada: no disponible; no se especifican parámetros ni tamaño de los ficheros.
- GPU recomendadas: no disponible. El modelo está diseñado para ejecutarse en el navegador mediante WebGPU, por lo que el hardware objetivo es la GPU del cliente, no una GPU de servidor.
- Compatibilidad con GPU de consumo: sí, por diseño (WebGPU en el navegador), aunque sin datos concretos de consumo de memoria.
- Opciones de despliegue: ONNX Runtime Web (WebGPU y WebAssembly); también podría ejecutarse con otros runtimes compatibles con ONNX, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Factor de escala | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thumbnailer-upscaler` (Yento.io) | Export ONNX de Real-ESRGAN `realesr-general-x4v3` | 4x | ONNX fp16/fp32 | BSD 3-Clause | Repositorio sin pesos en el momento de la consulta |
| Real-ESRGAN oficial (`xinntao/Real-ESRGAN`) | Modelo original en PyTorch | 4x (y otras variantes) | PyTorch | BSD 3-Clause | Disponible en GitHub |
| Otras variantes de Real-ESRGAN | Modelos de superresolución | Variable | PyTorch / ONNX (según exportación) | BSD 3-Clause | Disponibles en distintos repositorios |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene todavía ficheros de pesos; no es utilizable en producción en el momento de la consulta.
- Al ser una exportación de un modelo de terceros, las limitaciones de Real-ESRGAN se heredan: posibles artefactos en imágenes con degradaciones no representadas en los datos sintéticos de entrenamiento.
- No hay información sobre sesgos; al no procesar texto ni datos personales de forma semántica, el riesgo de sesgo social es bajo, pero puede amplificar artefactos presentes en la imagen de entrada.
- Riesgo de alucinación visual: como todo modelo generativo de superresolución, puede inventar detalles plausibles que no existen en la imagen original, lo que es problemático en contextos forenses o médicos.
- Licencia BSD 3-Clause: permite uso comercial y redistribución con atribución y sin endoso; es necesario conservar el aviso de copyright y la cláusula de no endoso.
- La ejecución en WebGPU depende del soporte del navegador y del dispositivo del usuario; el fallback a WebAssembly puede ser notablemente más lento.
- No se documentan los idiomas ni el rendimiento en distintos tipos de imagen (fotografía, ilustración, capturas de pantalla).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yento-io/thumbnailer-upscaler
- Aplicación que lo utiliza: https://thumbnailer.dev
- Producto de Yento.io: https://yento.io
- Repositorio oficial de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Artículo: *Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data* (Wang, Xie, Dong, Shan; ICCVW 2021)
