# vitalyliber/room-perception-onnx

## Resumen

`vitalyliber/room-perception-onnx` es un paquete de conversiones a ONNX de dos modelos abiertos que, combinados, permiten interpretar una unica fotografia de una habitacion: estimar la distancia a la pared y segmentar semanticamente la imagen para distinguir pared, suelo y otras clases. El autor, vitalyliber, no entrena pesos nuevos: los ficheros son exportaciones de formato de los checkpoints originales, por lo que la calidad del resultado depende enteramente de los modelos de origen.

El primer componente es MoGe-2 en su variante ViT-S (`Ruicheng/moge-2-vits-normal`, de Microsoft), que devuelve un mapa de puntos 3D por pixel, una mascara de validez y una escala metrica. El segundo es OneFormer con backbone Swin-Tiny entrenado en ADE20K (`shi-labs/oneformer_ade20k_swin_tiny`), que asigna una clase ADE20K a cada pixel. Ambos se ejecutan con ONNX Runtime sobre CPU, sin necesidad de PyTorch en inferencia.

La relevancia practica esta en el empaquetado: un repositorio de 0,5 GB con tres grafos ONNX, sumas de verificacion y un script de referencia en NumPy para el postprocesado geometrico. Es util para prototipos de reconstruccion de interiores en entornos sin GPU, aunque el alcance es acotado y la precision metrica es aproximada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoGe-2 (ViT-S con backbone DINOv2) + OneFormer (Swin-Tiny, tarea semantica ADE20K) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision) |
| Tipos de cuantizacion | no disponible (exportaciones en float32) |
| Idiomas soportados | no aplica (entrada de imagen; etiquetas ADE20K en ingles) |
| Licencia | MIT (MoGe-2, © Microsoft; OneFormer, © SHI Labs); backbone DINOv2 Apache-2.0 (© Meta) |
| Formato de pesos | ONNX (tres ficheros: 128 MB + 207 MB + 207 MB) |

## Arquitectura y entrenamiento

MoGe-2 es un modelo de estimacion de profundidad y geometria monocular basado en un transformer ViT-Small con backbone DINOv2. La exportacion ONNX expone las salidas `points` (mapa de puntos afines `[1, H, W, 3]`), `mask` (validez por pixel, umbral 0,5) y `metric_scale` (escalar float32 para convertir a metros). La salida de normales de superficie del modelo original no se exporta. La entrada admite cualquier resolucion; la exportacion se verifico con `num_tokens = 3600`, el maximo del modelo.

OneFormer es un transformer de segmentacion universal con backbone Swin-Tiny, entrenado sobre ADE20K en la tarea semantica. La exportacion incluye dentro del grafo el token de tarea semantica y la combinacion de predicciones de clase y mascara. Genera etiquetas `uint8` a un cuarto de la resolucion de entrada (`[1, 171, 128]` o `[1, 128, 171]`), con pared = 0 y suelo = 3. El autor no aporta informacion sobre el numero de tokens de entrenamiento ni sobre el proceso de ajuste (RLHF/DPO no aplica a estos modelos de vision).

La innovacion tecnica del repositorio no esta en los pesos sino en la conversion: el paso de puntos a profundidad y distancia focal queda fuera del grafo y se resuelve con un bucle de Gauss-Newton de un parametro sobre una muestra de 64x64 puntos validos, implementado en `export/reference_pipeline.py` solo con NumPy. La verificacion frente a PyTorch en CPU reporto una diferencia absoluta maxima de 0,00004 en `points` para MoGe-2 y etiquetas identicas pixel a pixel para OneFormer.

## Capacidades

- Estimacion de profundidad metrica a partir de una sola imagen RGB, con escala metrica estimada.
- Mapa de puntos 3D por pixel y mascara de validez geometrica.
- Segmentacion semantica densa con 150 clases ADE20K (pared, suelo, techo, muebles, etc.).
- Ejecucion en CPU mediante ONNX Runtime, sin dependencia de PyTorch en inferencia.
- Entrada de imagen de cualquier tamano para MoGe-2; OneFormer requiere exactamente 682x512 (retrato) o 512x682 (paisaje).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No soporta texto, audio ni modo thinking; son modelos puramente visuales.
- No hay capacidades multilingues mas alla de las etiquetas ADE20K en ingles.

## Casos de uso

- Reconstruccion de interiores para realidad aumentada: a partir de una foto se obtiene el mapa de puntos 3D y la mascara de pared/suelo, lo que permite anclar objetos virtuales sobre superficies planas en aplicaciones moviles sin GPU.
- Medicion aproximada de estancias en herramientas de reforma: la profundidad metrica y la segmentacion permiten estimar dimensiones de paredes y suelo, con la advertencia de que la escala es estimada y debe tratarse como aproximada.
- Generacion de planos 2D simplificados: proyectando los puntos validos sobre el plano del suelo (clase 3) se puede derivar una planta esquematica para visores inmobiliarios.
- Etiquetado automatico de datasets de interiores: OneFormer aporta mascaras ADE20K por pixel que sirven para preanotar imagenes antes de una revision humana, reduciendo coste de anotacion.
- Control de calidad en fotografia inmobiliaria: detectar si una imagen contiene pared y suelo suficientes (via mascara de validez y clases) para decidir si es apta para publicacion.
- Robotica de bajo coste y navegacion indoor: en plataformas con CPU (Raspberry Pi, mini-PC) el pipeline ONNX ofrece profundidad y segmentacion en un unico paso con un consumo de memoria contenido (2,3 GB con arena desactivada).
- Preprocesado para motores 3D: los puntos y la escala metrica alimentan pipelines de fotogrametria o de síntesis de vistas novedosas en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta verificaciones de fidelidad de la exportacion y tiempos de inferencia en CPU:

| Medicion | Valor |
|---|---|
| Diferencia maxima en `points` (MoGe-2 vs PyTorch) | 0,00004 |
| Coincidencia de etiquetas (OneFormer vs PyTorch) | identica pixel a pixel |
| Latencia MoGe-2 (12 fotos 1536 px, 4 hilos, Ryzen 5 5600G) | 5,9 s (sesion por defecto) / 8,3 s (arena off) |
| Latencia OneFormer (mismas condiciones) | 1,9 s / 2,0 s |
| Memoria pico con los tres ficheros cargados | 4,3 GB (por defecto) / 2,3 GB (arena off) |

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU. Memoria RAM pico de 2,3 GB con `enable_cpu_mem_arena = False` y `enable_mem_pattern = False`, y 4,3 GB con la configuracion por defecto.
- GPU: no requerida; el autor no documenta ejecucion en GPU (ONNX Runtime soporta CUDA, pero no se aportan datos).
- Cabe en cualquier equipo consumer: el benchmark se hizo en un Ryzen 5 5600G con 2 nucleos y 4 hilos.
- Despliegue: ONNX Runtime (CPU), con opcion de integracion en aplicaciones Python, C++, C# o Java mediante las APIs de onnxruntime.
- Latencia: 5,9 s para MoGe-2 y 1,9 s para OneFormer por imagen de 1536 px en el hardware citado; el throughput no se documenta.
- Almacenamiento: 0,5 GB de repositorio (128 MB + 207 MB + 207 MB de pesos ONNX).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| room-perception-onnx (este) | Paquete ONNX de profundidad + segmentacion | no disponible | no aplica | MIT | Hugging Face, 0 descargas |
| Ruicheng/moge-2-vits-normal | Profundidad monocular (PyTorch) | no disponible | no aplica | MIT | Hugging Face |
| shi-labs/oneformer_ade20k_swin_tiny | Segmentacion semantica (PyTorch) | no disponible | no aplica | MIT | Hugging Face |
| Depth Anything (variantes ViT-S) | Profundidad monocular | no disponible | no aplica | no disponible | Hugging Face |

La comparativa se limita a los modelos de origen, ya que no se dispone de datos de benchmarks que permitan contrastar calidad frente a alternativas. La ventaja diferencial de este repositorio es el formato ONNX listo para CPU y el pipeline de postprocesado incluido, no el rendimiento bruto.

## Limitaciones y advertencias

- La escala metrica procedente de una sola foto es una estimacion; las dimensiones deben tratarse como aproximadas.
- OneFormer devuelve una unica mascara para todas las paredes juntas, no una por pared.
- Las fotos que no se acercan a 4:3 se estiran al tamano fijo de entrada de OneFormer, lo que degrada la segmentacion.
- Cada fichero OneFormer debe alimentarse solo con el tamano con el que fue trazado (682x512 o 512x682); otros tamanos producen resultados incorrectos aunque los ejes esten marcados como dinamicos.
- La salida de normales de superficie de MoGe-2 no esta exportada.
- Riesgo de alucinacion geometrica en superficies reflectantes, cristales o escenas con poca textura, inherente a la estimacion monocular.
- Sesgos heredados de los datasets de entrenamiento (ADE20K para segmentacion, datasets de profundidad de MoGe-2): posible peor rendimiento en interiores no occidentales o con mobiliario atipico.
- Licencia MIT en ambos componentes, pero el checkpoint de OneFormer se entreno sobre ADE20K; el autor recomienda revisar los terminos de ese dataset para uso comercial.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni de mantenimiento continuado.
- No hay informacion sobre cuantizacion ni sobre rendimiento en GPU; el despliegue en aceleradores queda sin validar por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vitalyliber/room-perception-onnx
- Modelo base MoGe-2 ViT-S: https://huggingface.co/Ruicheng/moge-2-vits-normal
- Modelo base OneFormer ADE20K Swin-Tiny: https://huggingface.co/shi-labs/oneformer_ade20k_swin_tiny
- Repositorio MoGe (Microsoft): https://github.com/microsoft/MoGe
