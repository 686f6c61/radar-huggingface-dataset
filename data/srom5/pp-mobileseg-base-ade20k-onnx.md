# srom5/pp-mobileseg-base-ade20k-onnx

## Resumen

PP-MobileSeg-Base (ADE20K) en formato ONNX es una exportación del modelo de segmentación semántica PP-MobileSeg-Base desarrollado por PaddlePaddle/PaddleSeg, entrenado sobre el conjunto de datos ADE20K con 150 clases. El repositorio, publicado por el usuario srom5, no entrena ni modifica los pesos originales: únicamente convierte los pesos oficiales (`.pdparams`) a formato ONNX FP32 con opset 17 para facilitar su despliegue en entornos que no disponen de PaddlePaddle, como ONNX Runtime, TensorRT o navegadores mediante WebAssembly.

El modelo resuelve la tarea de segmentación semántica densa: asigna una etiqueta de clase a cada píxel de una imagen RGB de 512x512. Su relevancia radica en que PP-MobileSeg es una familia diseñada para eficiencia computacional en dispositivos con recursos limitados, y esta exportación permite integrarla en pipelines de producción heterogéneos sin dependencia del framework original.

El repositorio tiene un tamaño inferior a 1 GB (el único fichero de pesos ocupa unos 24 MB), lo que confirma que se trata de un modelo compacto orientado a inferencia en el borde. La ficha se limita a los datos aportados por el autor; no se dispone de información sobre benchmarks, datos de entrenamiento detallados ni composición del dataset más allá de la referencia a ADE20K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-MobileSeg (segmentación semántica; detalles internos de la arquitectura no disponibles en la información proporcionada) |
| Parametros totales | no disponible (el fichero de pesos upstream ocupa 24.052.927 bytes; el ONNX FP32, 24.139.151 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP32 (única precisión publicada en este repositorio) |
| Idiomas soportados | no disponible (modelo de visión; las etiquetas de clase son de ADE20K en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17); pesos originales en PaddlePaddle `.pdparams` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de PP-MobileSeg-Base más allá de su pertenencia a la familia PP-MobileSeg de PaddleSeg, orientada a segmentación semántica eficiente. El modelo fue entrenado sobre ADE20K con 150 clases y una resolución de entrada de 512x512, según la configuración referenciada (`pp_mobileseg_base_ade20k_512x512_80k.yml`, que sugiere 80.000 iteraciones de entrenamiento). No se especifican en la información proporcionada el número de tokens o imágenes de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino adicionales.

La exportación a ONNX se realizó con `--output_op none`, preservando los logits crudos por clase y desactivando la operación de argmax/VIM, con un upsampling de tipo interpolación. La conversión empleó `paddlepaddle==2.6.2`, `paddle2onnx==1.3.1`, `onnx==1.16.2` y `onnxruntime==1.22.0`. Se verificó paridad numérica frente al grafo dinámico de PaddlePaddle con entrada aleatoria determinista: diferencia absoluta máxima de 3,6e-5 y coincidencia del 100 % en la clase argmax.

## Capacidades

- Segmentación semántica densa de imágenes RGB de 512x512 en 150 clases de ADE20K (por ejemplo, `sky = 2`).
- Salida de logits crudos por píxel con forma `[1, 150, 512, 512]`, lo que permite aplicar posprocesado propio (argmax, softmax, umbrales).
- Entrada normalizada con media `[0.485, 0.456, 0.406]` y desviación `[0.229, 0.224, 0.225]` en formato NCHW.
- Inferencia portable vía ONNX Runtime en CPU, GPU y entornos embebidos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- No se documentan capacidades multilingües ni modos especiales (thinking, audio, vídeo).

## Casos de uso

- Segmentación de escenas urbanas y exteriores: el modelo etiqueta 150 clases de ADE20K (cielo, carretera, vegetación, edificios), útil para preprocesado en sistemas de percepción o análisis geoespacial a partir de imágenes aéreas o de calle.
- Edición de imágenes asistida por regiones: al devolver logits por píxel, permite construir máscaras de clase para recorte selectivo, sustitución de fondos o retoque por categoría en herramientas de edición.
- Automatización de anotación de datasets: puede generar máscaras preliminares sobre imágenes nuevas que luego se revisan manualmente, acelerando el etiquetado de corpus de segmentación.
- Despliegue en dispositivos de borde: con un fichero ONNX de ~24 MB y entrada fija de 512x512, es adecuado para inferencia en cámaras inteligentes, drones o sistemas embebidos con ONNX Runtime.
- Integración en pipelines sin PaddlePaddle: equipos que ya usan ONNX Runtime o TensorRT pueden incorporar el modelo sin añadir la dependencia del framework original, manteniendo paridad numérica verificada.
- Análisis de contenido visual a escala: procesado por lotes de imágenes para extraer estadísticas de composición de escena (proporción de cielo, suelo, vegetación) en estudios de imagen o monitorización ambiental.
- Prototipado rápido en web: al ser un grafo ONNX estándar, puede ejecutarse en el navegador mediante ONNX Runtime Web para demos interactivas de segmentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la verificación de paridad numérica de la conversión (diferencia absoluta máxima de 3,6e-5 y coincidencia del 100 % en argmax), no métricas de calidad como mIoU sobre ADE20K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos FP32 de ~24 MB y una activación de salida de 150x512x512 floats (~157 MB), el consumo es moderado y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con soporte de ONNX Runtime o TensorRT; el tamaño del modelo permite ejecutarlo en tarjetas de gama baja, aunque no se especifican modelos concretos.
- Cabe en GPU de consumo: sí, por el reducido tamaño de pesos; no se detallan modelos concretos.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, ONNX Runtime Web; no se mencionan vLLM, llama.cpp ni Ollama, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables en la información proporcionada para establecer una comparativa rigurosa con otros modelos de segmentación semántica (por ejemplo, variantes de DeepLab, SegFormer o MobileNet-based). La comparación queda como no disponible.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Resolución de entrada fija de 512x512; imágenes de otra resolución requieren redimensionado previo, lo que puede afectar a la precisión en objetos pequeños.
- Solo reconoce las 150 clases de ADE20K; cualquier categoría fuera de ese vocabulario se asignará a la clase más próxima, con riesgo de errores.
- Riesgo de degradación en dominios alejados del dataset de entrenamiento (imágenes médicas, satelitales específicas, escenas nocturnas), no cuantificado en la información disponible.
- No se documentan sesgos específicos, pero al entrenarse sobre ADE20K puede heredar los sesgos de composición y anotación de dicho dataset.
- Licencia Apache 2.0 para código y pesos, compatible con uso comercial; el dataset ADE20K se rige por sus propios términos, que deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria independiente.
- La paridad numérica se verificó con entrada aleatoria, no con imágenes reales; conviene validar el comportamiento en el dominio objetivo antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/srom5/pp-mobileseg-base-ade20k-onnx
- Repositorio upstream PaddleSeg: https://github.com/PaddlePaddle/PaddleSeg
- Configuración de entrenamiento referenciada: `configs/pp_mobileseg/pp_mobileseg_base_ade20k_512x512_80k.yml` (commit `3c4db66de1d9d59d0628ed87590b6308a2f4aa2a`, rama `release/2.10`)
- Pesos originales: `pp_mobileseg_base/model.pdparams` (SHA-256 `e005358dcb4f41b7068411cfe9799f5e93fbea09f581db10d9fb8bda37edb886`)
- Fichero ONNX: `pp-mobileseg-base.onnx` (SHA-256 `7ce5e6dd5ca4496bab5b995dc14b6c5218d48f75c0abbb5c90093473614c033f`)
