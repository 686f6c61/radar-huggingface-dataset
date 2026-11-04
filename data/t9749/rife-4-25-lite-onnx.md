# t9749/rife-4.25-lite-onnx

## Resumen

RIFE 4.25 lite — ONNX es una exportación a formato ONNX del modelo Practical-RIFE 4.25 lite, desarrollado originalmente por Zhewei Huang (hzwer) y presentado en el artículo "RIFE: Real-Time Intermediate Flow Estimation for Video Frame Interpolation" (ECCV 2022). No se trata de un modelo de lenguaje, sino de una red neuronal convolucional especializada en interpolación de fotogramas de vídeo: dado un par de imágenes consecutivas y un instante `t` entre ambas, genera el fotograma intermedio correspondiente. El repositorio, publicado por el usuario t9749, solo realiza la conversión a ONNX de los pesos originales, sin modificar la red más allá de un ajuste técnico necesario para la exportación.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar interpolación de fotogramas en entornos que no disponen de PyTorch, como runtimes de inferencia ligeros (ONNX Runtime, TensorRT, OpenVINO, navegadores vía WebAssembly). Por otro, el tamaño del artefacto es muy reducido: 22.677.513 bytes (aproximadamente 21,6 MiB), lo que facilita su distribución e integración en aplicaciones de escritorio o móviles. El autor declara que lo usa en el editor de vídeo MovieZam para generar cámara lenta fluida.

El modelo no procesa texto, no tiene capacidades lingüísticas ni de razonamiento, y no dispone de ventana de contexto en el sentido de los modelos generativos. Su "contexto" son dos fotogramas de entrada de resolución arbitraria (múltiplo de 64 en cada dimensión) y un escalar de tiempo entre 0 y 1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional de estimación de flujo óptico intermedio (IFNet, variante HDv3 de RIFE 4.25 lite) |
| Parametros totales | no disponible (el artefacto ONNX pesa 22.677.513 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de dos imágenes `[1, 3, H, W]` con H y W múltiplos de 64, dinámicas |
| Tipos de cuantizacion | no disponible (los pesos del ONNX son float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de visión, no lingüístico) |
| Licencia | MIT (Copyright (c) 2021 hzwer) |
| Formato de pesos | ONNX, opset 17, archivo `rife_v425lite.onnx` |

## Arquitectura y entrenamiento

La red es IFNet en su variante HDv3, la empleada por Practical-RIFE 4.25 lite. Se trata de una arquitectura convolucional que estima un flujo óptico intermedio (intermediate flow) entre dos fotogramas y lo utiliza para sintetizar el fotograma en el instante `t` solicitado. La salida del modelo es el fotograma final fusionado, recortado al rango 0..1, calculado a escalas `[16, 8, 4, 2, 1]`. El autor de la exportación no aporta detalles sobre el dataset de entrenamiento original, el número de tokens o imágenes vistas ni sobre si hubo ajuste fino posterior; esa información corresponde al proyecto Practical-RIFE de hzwer y no se incluye en la model card.

La innovación técnica relevante de esta conversión concreta es el módulo `rife_warplayer/`: la implementación original cachea una rejilla de muestreo por tamaño de imagen, algo incompatible con una exportación ONNX estática. La exportación sustituye ese comportamiento por una función `warp` sin estado que calcula el mismo `grid_sample`. El script `export.py` verifica la equivalencia entre la salida ONNX y la de PyTorch sobre las mismas entradas, y `check.py` mide el fotograma intermedio de una imagen desplazada una distancia conocida frente al fotograma real y frente a un simple cross-fade. Los pesos se cargan con `torch.load(..., weights_only=True)`, es decir, solo tensores, sin código serializado.

## Capacidades

- Interpolación de fotogramas de vídeo: genera el fotograma situado en un instante `t` (0..1) entre dos fotogramas de entrada.
- Resolución dinámica: acepta entradas `[1, 3, H, W]` con H y W múltiplos de 64; es necesario rellenar (pad) y recortar (crop) después.
- Salida en rango 0..1 en float32, lista para conversión a 8 bits para vídeo.
- Ejecución sin PyTorch mediante ONNX Runtime u otros runtimes compatibles con opset 17.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Cámara lenta fluida en edición de vídeo: el modelo genera fotogramas intermedios entre los originales para duplicar o cuadruplicar la tasa de fotogramas sin el efecto de cross-fade; es el uso declarado por el autor en MovieZam.
- Conversión de 24 fps a 60 fps: interpolando dos fotogramas por cada par original se obtiene una cadencia más alta para reproducción en pantallas modernas.
- Restauración de vídeo antiguo con baja tasa de fotogramas: se pueden sintetizar fotogramas para suavizar el movimiento antes de un reescalado o una restauración posterior.
- Postproducción de vídeo de animación: la interpolación entre fotogramas clave reduce el trabajo manual de dibujo de intermedios en proyectos de bajo presupuesto.
- Integración en pipelines ligeros sin GPU dedicada: al ser un ONNX de ~21,6 MiB, puede ejecutarse en CPU con ONNX Runtime dentro de herramientas de escritorio o servicios de procesamiento por lotes.
- Procesamiento en el navegador o en el borde: la exportación ONNX permite su despliegue vía WebAssembly u ONNX Runtime Web para edición de vídeo local sin subir el material a un servidor.
- Generación de vídeo a partir de secuencias de imágenes: interpolando entre fotogramas clave de una animación o un timelapse se obtiene una secuencia más densa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que `check.py` compara el fotograma interpolado con el real y con un cross-fade, pero no se aportan cifras (PSNR, SSIM, LPIPS ni tiempos de inferencia).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el artefacto ONNX ocupa 22.677.513 bytes en float32, por lo que la huella de pesos es de aproximadamente 21,6 MiB, a la que hay que sumar las activaciones, que escalan con la resolución de entrada.
- GPU recomendadas: no disponibles; al ser un modelo convolucional pequeño, es plausible su ejecución en GPU de gama baja, pero no se documentan requisitos concretos.
- GPU de consumo: no se confirma oficialmente; por tamaño, cabría en cualquier GPU con al menos unos cientos de MiB libres, pero no hay datos publicados.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO y otros runtimes compatibles con opset 17. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Tamaño | Notas |
|---|---|---|---|---|---|
| RIFE 4.25 lite — ONNX (este) | IFNet convolucional | ONNX opset 17 | MIT | ~21,6 MiB | Exportación comunitaria; resolución dinámica múltiplo de 64 |
| Practical-RIFE 4.25 lite (hzwer) | IFNet convolucional | PyTorch (`flownet.pkl`) | MIT | no disponible | Implementación original; requiere PyTorch |
| Otros modelos de interpolación (p. ej. FILM, VFIformer) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling. Cualquier expectativa en ese sentido es un error de categoría.
- Requiere que H y W sean múltiplos de 64; si no lo son, hay que rellenar y recortar, lo que introduce trabajo adicional en el pipeline.
- La exportación modifica el módulo de warp (elimina la caché de rejilla de muestreo); aunque el autor verifica la equivalencia con PyTorch, es un cambio respecto al original que conviene validar en el caso de uso concreto.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje; los artefactos típicos de la interpolación son halos, ghosting y errores en oclusiones u objetos en movimiento rápido, aunque no se cuantifican en la model card.
- El repositorio no tiene descargas ni likes en el momento de la consulta y el tamaño declarado es 0.0 GB, lo que sugiere que la model card y el artefacto pueden no estar completamente sincronizados o que la métrica no se ha actualizado.
- Licencia MIT: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de copyright de hzwer. No hay restricciones adicionales documentadas.
- Para producción, conviene fijar la versión del artefacto mediante el SHA-256 indicado (`702802d0...d06577`) y validar la salida frente a la implementación de referencia en PyTorch.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/t9749/rife-4.25-lite-onnx
- Proyecto original Practical-RIFE (hzwer): https://github.com/hzwer/Practical-RIFE
- Artículo RIFE (ECCV 2022): no se incluye enlace directo en la información proporcionada; el artículo se cita como "RIFE: Real-Time Intermediate Flow Estimation for Video Frame Interpolation".
