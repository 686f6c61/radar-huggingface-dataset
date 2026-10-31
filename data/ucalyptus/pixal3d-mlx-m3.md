# ucalyptus/pixal3d-mlx-m3

## Resumen

pixal3d-mlx-m3 es un repositorio de ucalyptus que permite ejecutar el modelo image-to-3D Pixal3D de Tencent ARC de forma nativa en Apple Silicon mediante el framework MLX, verificado sobre un Apple M3 con 16 GB de memoria unificada. El pipeline convierte una imagen de entrada en una malla 3D texturizada en formato GLB con materiales PBR, resolviendo así el problema de ejecutar generación 3D de alta calidad sin necesidad de GPU NVIDIA con CUDA.

El repositorio no contiene pesos del modelo: incluye código, una receta de reproducción, salidas de ejemplo y mediciones de rendimiento. Es un fork del port MLX de lyonsno/pixal3d-mlx con correcciones importantes, la más relevante siendo la reparación de la ruta de exportación de mallas, que reconstruye la superficie predicha mediante dual contouring de banda estrecha sobre UDF, igual que el exportador oficial de Tencent. Esto elimina los fragmentos planares y huecos que producía el port original.

Su relevancia actual radica en que demuestra, con mediciones y verificaciones de paridad numérica rigurosas, que la generación image-to-3D es viable en hardware de consumo Apple con 16 GB de memoria unificada usando cuantización INT4, aunque con margen de memoria muy ajustado. El modelo base Pixal3D combina un codificador DINOv3 ViT-L/16, un estimador de cámara MoGe-2 y un decodificador de geometría con convolución dispersa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline image-to-3D: DINOv3 ViT-L/16 (condicionado), MoGe-2 (estimación de cámara/profundidad), NAF (upsampler de textura), decodificador de geometría con convolución dispersa y dual contouring sobre UDF |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de visión 3D, no de lenguaje) |
| Tipos de cuantizacion | INT4 (verificado); FP16 (incompleto por memoria en 16 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT (repositorio); los pesos tienen licencias propias: Pixal3D MIT, DINOv3 licencia Meta (gated), NAF Apache-2.0, MoGe-2 según su model card |
| Formato de pesos | safetensors (DINOv3/NAF/MoGe-2 convertidos); checkpoints Pixal3D originales; el repositorio en sí contiene solo código y ejemplos (0,1 GB) |

## Arquitectura y entrenamiento

El pipeline no es un modelo único sino un sistema de varios componentes. DINOv3 ViT-L/16 extrae características de la imagen de entrada; MoGe-2 estima la cámara (orientación y distancia); NAF actúa como upsampler para el acondicionamiento de textura a 512 píxeles en este port (upstream usa 1024); y el decodificador de geometría de Pixal3D genera un campo de distancia (UDF) en banda estrecha que se reconstruye con dual contouring, seguido de un remeshing nativo con backends Metal (CuMesh/MtlBVH) y horneado de textura sobre la superficie pre-remesh.

Este repositorio no entrena nada: es un port de inferencia. Las contribuciones técnicas destacables son: la corrección de la ruta de exportación para replicar el comportamiento del exportador oficial de Tencent (con `remesh=True, remesh_band=1, remesh_project=0`), pools de autorelease en Objective-C para liberar command buffers de Metal antes del horneado de textura, rutas de pesos explícitas y errores explícitos en fallos de estimación de cámara o de presupuesto de tokens en lugar de fallbacks silenciosos. El autor verificó la paridad numérica contra CPU Torch: convolución dispersa (28 casos), orden de subdivisión (9 casos), un bloque del decodificador dentro de ~1e-5 en FP32, y el remesher nativo con 1,6 millones de celdas activas y 26.161 distancias BVH coincidentes dentro de 1,9e-9.

## Capacidades

- Generación de malla 3D texturizada (GLB con PBR) a partir de una única imagen, a resolución 512 en este port (el pipeline oficial CUDA soporta 1024 y 1536).
- Estimación de cámara precisa: el port MLX de MoGe-2 coincide con la estimación oficial de Tencent dentro de ~0,2 grados.
- Reconstrucción geométrica de alta fidelidad: la malla de ejemplo tiene 2.151.698 triángulos.
- Cuantización INT4 con calidad visual de malla indistinguible de FP16 a resolución 512 (según una muestra, sin comparación numérica pareada).
- Ejecución nativa en Apple Silicon sin GPU NVIDIA ni CUDA.
- No incluye tool calling, agentes ni capacidades de lenguaje: es un pipeline de visión 3D.

## Casos de uso

- Prototipado de activos 3D en portátiles Mac: un artista o desarrollador puede generar mallas GLB texturizadas desde fotos de referencia directamente en un MacBook Pro M3 sin alquilar GPUs cloud, aunque cerrando aplicaciones pesadas por la memoria.
- Previsualización de productos para e-commerce: convertir fotos de productos en modelos 3D visualizables en web (GLB es el formato estándar de `<model-viewer>` y AR Quick Look), con la advertencia de que la textura a 512 es menos nítida que la del pipeline oficial a 1024.
- Generación de activos para motores de juego en fase conceptual: obtener mallas base para blockouts o props de bajo detalle, antes de retopología manual.
- Investigación reproducible en MLX: el repositorio sirve como receta verificada con mediciones y tests de paridad, útil para quien portee otros modelos de generación 3D a Apple Silicon.
- Renderizado y visualización arquitectónica rápida: generar mallas de referencia desde renders o fotografías para escenas de estudio.
- Validación de pipelines de reconstrucción 3D: los informes de paridad en `examples/reports/` permiten auditar la corrección geométrica del port frente a la implementación CUDA de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) al no ser un modelo de lenguaje. Las mediciones de rendimiento publicadas en el repositorio, sobre un Apple M3 con 16 GB, son:

| Ejecución | Resultado |
|---|---|
| 512 / INT4 / atlas 1024², pipeline completo | 592,5 s; pico de asignación MLX 11,18 GiB; pico de proceso 11,80 GiB; +1,82 GiB de swap |
| Replay de exportación corregida sobre salidas cacheadas | 43,5 s; pico 9,14 GiB; sin swap adicional |
| 512 / FP16 | Geometría completada; detenido en muestreo de textura por límite de seguridad de +2 GiB de swap |

Como referencia comparativa, el port MLX upstream reporta ~33 GB de pico a resolución 1024, por lo que 1024 no cabe en esta máquina; el resultado oficial de Tencent a 1024 es más nítido (hebras de encaje individuales, ojales, dibujo de la suela).

## Requisitos de hardware

- Memoria unificada: 16 GB es el mínimo verificado, con margen muy ajustado en INT4 a resolución 512 (pico de proceso de 11,80 GiB más 1,82 GiB de swap); hay que cerrar aplicaciones con consumo de memoria antes de ejecutar. FP16 no completa el pipeline en 16 GB.
- GPU recomendada: Apple Silicon con GPU integrada (verificado en M3 de 16 GB). Para resoluciones 1024 o superiores se recomienda el pipeline oficial CUDA con GPUs NVIDIA de gama alta (no disponible el requisito exacto).
- Sí cabe en hardware de consumo Apple: MacBook con M3 de 16 GB ejecuta el pipeline completo en INT4.
- Despliegue: script Python local (`generate_pixal3d.py`) con entorno uv, Python 3.12, MLX, PyTorch 2.12.0 y backends de geometría nativos compilados con Metal Toolchain (Xcode). No hay soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicable).
- Latencia: ~592 segundos (~10 minutos) para una generación completa a 512/INT4 con atlas de textura 1024²; la etapa de exportación corregida sola toma 43,5 segundos.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Hardware objetivo | Licencia |
|---|---|---|---|---|
| pixal3d-mlx-m3 (este port) | Image-to-3D, malla PBR | 512 | Apple Silicon 16 GB (MLX) | MIT (código); pesos con licencias mixtas |
| Pixal3D oficial (TencentARC) | Image-to-3D, malla PBR | 1024, 1536 | GPU NVIDIA con CUDA | MIT (pesos) |
| Port MLX upstream (lyonsno/pixal3d-mlx) | Image-to-3D, malla PBR | 512, 1024 (~33 GB pico a 1024) | Apple Silicon con memoria alta | no disponible |

Otras alternativas de la categoría image-to-3D (TRELLIS, Hunyuan3D, TripoSR) no se cubren en la información disponible, por lo que su comparación detallada no está disponible.

## Limitaciones y advertencias

- La malla generada no es watertight: quedan algunos cientos de aristas no manifold (incidencia 4) heredadas del dual contouring con un vértice por celda, la misma regla del kernel CUDA original. Apta para visualización y render, no para impresión 3D ni simulación sin un remesher que resuelva ambigüedades.
- El acondicionamiento de textura usa características NAF a 512 píxeles frente a los 1024 de upstream, lo que reduce la nitidez de la textura respecto al pipeline oficial.
- La paridad numérica completa con el decodificador CUDA no está verificada; solo se ha demostrado paridad matemática/CPU en componentes concretos.
- Probado con una única imagen; la fiabilidad general en máquinas de 16 GB no está establecida.
- En 16 GB el margen de memoria es crítico: con un navegador abierto se alcanza el límite de swap.
- Los pesos de DINOv3 son gated en HuggingFace y requieren aceptar la licencia de Meta; MoGe-2 tiene su propia licencia que debe revisarse. El uso comercial del pipeline completo depende de estas licencias, no solo de la MIT del repositorio.
- Riesgo de alucinación no aplicable en el sentido de LLM, pero la calidad geométrica y de textura depende fuertemente de la imagen de entrada y solo se ha validado con un caso (una bota).
- Las comparaciones FP16 vs INT4 se basan en una sola muestra sin comparación numérica pareada.

## Enlaces

- Repositorio: https://huggingface.co/ucalyptus/pixal3d-mlx-m3
- Modelo base (pesos oficiales): https://huggingface.co/TencentARC/Pixal3D
- Espejo verificado de pesos: https://huggingface.co/Pq234/Pixal3D
- Repositorio GitHub de Pixal3D: https://github.com/TencentARC/Pixal3D
- Port MLX upstream: https://github.com/lyonsno/pixal3d-mlx
- DINOv3 ViT-L/16: https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- NAF upsampler: https://github.com/valeoai/NAF
- MoGe-2: https://huggingface.co/Ruicheng/moge-2-vitl
- Pesos FP16 DINOv3/NAF: https://huggingface.co/ddalcu/Pixal3D-MLX-Serve-8bit
