# WaveCut/lerp-models

## Resumen

Lerp models es una coleccion de paquetes Core ML distribuidos por WaveCut para la aplicacion macOS Lerp, cuyo proposito es la interpolacion de fotogramas de video (video frame interpolation, VFI). No se trata de un modelo de lenguaje ni de un modelo fundacional generativo, sino de un conjunto de dos redes neuronales convolucionales especializadas en sintetizar fotogramas intermedios entre dos imagenes consecutivas de un video, duplicando o multiplicando la tasa de refresco de forma artificial. Los paquetes se descargan en el primer arranque de la app Lerp y estan fijados por tamano en bytes y hash SHA-256, lo que implica que son artefactos inmutables una vez publicada la version que los referencia.

El repositorio contiene tres archivos comprimidos que empaquetan sendos `.mlpackage` para macOS 14 o superior: dos variantes de RIFE 4.25 (a 1080p y 720p) y una variante de EMA-VFI con RefineNet a 1080p. Cada modelo recibe dos imagenes de entrada (`img0` e `img1`), un tensor `timestep` de forma 1x1x1x1 con valores entre 0 y 1 que indica la posicion temporal del fotograma a sintetizar, y produce una imagen de salida `pred`. El tamano total del repositorio es de 0,3 GB y la libreria declarada es `coreml`.

La relevancia de esta publicacion es practica y acotada: sirve como canal de distribucion de pesos ya convertidos y optimizados para Apple Silicon (GPU y Neural Engine via Core ML), con mejoras de rendimiento medidas del 30 % en RIFE y del 40 % en EMA-VFI frente a una exportacion directa, y una fidelidad respecto a la referencia en PyTorch de 0,072 dB (1080p) y 0,055 dB (720p) en RIFE y 0,054 dB en EMA-VFI. No hay informacion sobre parametros totales, contexto, idiomas ni benchmarks de calidad perceptual mas alla de esas cifras de PSNR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes convolucionales de interpolacion de fotogramas: RIFE 4.25 (basada en flujo optico y warping) y EMA-VFI `ours_t` con RefineNet (atencion inter-frame) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana fija de imagen: 1920x1088 (1080p) o 1280x768 (720p) |
| Tipos de cuantizacion | fp16 (RIFE); fp16 en convoluciones y capas lineales con fp32 en atencion, normalizacion y warps (EMA-VFI) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT para RIFE 4.25; Apache-2.0 para EMA-VFI; el repositorio declara `mit-and-apache-2.0` con aviso en `NOTICE` |
| Formato de pesos | `.mlpackage` (ML Program de Core ML) empaquetado en ZIP |

## Arquitectura y entrenamiento

RIFE 4.25 es una red de interpolacion de fotogramas desarrollada por hzwer y publicada con Practical-RIFE bajo licencia MIT. Su enfoque se basa en estimar el movimiento entre los dos fotogramas de entrada y deformar (warp) ambos fotogramas hacia la posicion temporal intermedia indicada por `timestep`, combinando despues las estimaciones. La version distribuida aqui ha sido reconvertida por WaveCut a un grafo de inferencia propio con entradas y salidas de imagen y ventana fija; los fotogramas se rellenan por los bordes hasta encajar en esa ventana. Todas las convoluciones transpuestas se exportan como una convolucion seguida de un pixel shuffle (los mismos productos en distinto orden de suma) y RIFE deforma ambos fotogramas en un unico batch. Sobre una GPU M2 Max, estos grafos corren un 30 % mas rapido que la exportacion directa, y la version fp16 reconstruye los fotogramas reales descartados con un margen de 0,072 dB a 1080p y 0,055 dB a 720p respecto a la referencia en PyTorch.

EMA-VFI procede del articulo "Extracting Motion and Appearance via Inter-Frame Attention for Efficient Video Frame Interpolation" (Zhang, Zhu, Wang, Chen, Wu y Wang, CVPR 2023), publicado en el repositorio MCG-NJU/EMA-VFI bajo Apache-2.0. Se utiliza el checkpoint `ours_t`, que admite tiempos arbitrarios, con RefineNet activado. En esta exportacion las convoluciones y capas lineales van en fp16 mientras que la atencion, la normalizacion y los warps se mantienen en fp32; el resultado queda a 0,054 dB de su referencia en PyTorch y corre un 40 % mas rapido que la exportacion directa en una M2 Max. No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento ni sobre si se aplicaron tecnicas de RLHF o DPO, ya que son modelos de vision y no de lenguaje.

## Capacidades

- Interpolacion de fotogramas de video: sintetiza un fotograma intermedio entre dos imagenes consecutivas, con la posicion temporal controlada por el tensor `timestep` (rango 0 a 1).
- Soporte de tiempos arbitrarios en EMA-VFI (`ours_t`), lo que permite generar fotogramas en cualquier punto entre los dos de entrada, no solo en el punto medio.
- Interpolacion a resolucion fija: 1920x1088 en las variantes 1080p y 1280x768 en la variante 720p, con relleno por bordes para encajar fotogramas de otros tamanos.
- Ejecucion nativa en Apple Silicon mediante Core ML (ML Program para macOS 14 o superior), con aceleracion por GPU y potencial uso del Neural Engine.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni capacidades multilingues: es exclusivamente un modelo de vision para VFI.
- No dispone de modo thinking, vision general, audio ni ninguna otra modalidad mas alla de la interpolacion de imagen a imagen.

## Casos de uso

- Duplicacion de tasa de refresco en reproduccion de video: la app Lerp usa estos modelos para generar fotogramas intermedios y convertir material de 24 o 30 fps en 48 o 60 fps, mejorando la suavidad de movimiento en pantalla; la ventana fija de 1080p o 720p y el `timestep` arbitrario de EMA-VFI lo hacen adecuado para este flujo.
- Conversion de material cinematografico a alta tasa de fotogramas: con la variante 1080p de RIFE se pueden insertar fotogramas entre los originales de una pelicula o clip a 1920x1088, manteniendo la fidelidad de 0,072 dB respecto a la referencia.
- Postproduccion y edicion en macOS: integracion en flujos de trabajo de Final Cut o DaVinci Resolve en Mac mediante la app Lerp, aprovechando la aceleracion Core ML en GPU de Apple Silicon para procesar clips sin salir del ecosistema.
- Restauracion y suavizado de video de baja tasa: interpolacion de grabaciones antiguas o de camaras de vigilancia que graban a 15 o 10 fps, generando fotogramas intermedios para obtener una reproduccion mas fluida.
- Creacion de contenido para redes sociales: generacion de clips en camara lenta (slow motion) sintetizando fotogramas intermedios a partir de metraje grabado a tasa normal, usando la variante 720p para reducir coste computacional.
- Procesamiento por lotes en pipelines de video: automatizacion de la interpolacion de una biblioteca de clips mediante la app Lerp o scripts que invoquen los `.mlpackage` con Core ML, con la ventaja de que los artefactos estan fijados por SHA-256 y garantizan reproducibilidad.
- Prototipado e investigacion en interpolacion de fotogramas: uso de los paquetes como referencia exportada y optimizada de RIFE 4.25 y EMA-VFI para comparar fidelidad y velocidad en hardware Apple frente a las implementaciones originales en PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (PSNR, SSIM, LPIPS sobre Vimeo90K, UCF101 u otros) en la informacion disponible. Los unicos datos numericos aportados por el autor son medidas de fidelidad y velocidad relativas a las referencias en PyTorch:

| Metrica | RIFE 4.25 1080p | RIFE 4.25 720p | EMA-VFI 1080p |
|---|---|---|---|
| Diferencia de fidelidad frente a PyTorch | 0,072 dB | 0,055 dB | 0,054 dB |
| Mejora de velocidad en M2 Max GPU frente a exportacion directa | 30 % | 30 % | 40 % |
| Precision | fp16 | fp16 | fp16 en convoluciones y lineales, fp32 en atencion, normalizacion y warps |
| Ventana | 1920x1088 | 1280x768 | 1920x1088 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,3 GB, por lo que cada `.mlpackage` individual es sustancialmente menor y cabe holgadamente en la memoria unificada de cualquier Mac con Apple Silicon.
- GPU recomendadas: el autor aporta mediciones sobre una GPU M2 Max; por la naturaleza Core ML, el modelo esta pensado para Apple Silicon (series M1, M2, M3, M4) y no para GPUs NVIDIA o AMD en Linux o Windows.
- Cabe en GPU de consumo: si, en cualquier Mac con chip de la familia M; no esta pensado para GPUs de consumo x86.
- Opciones de despliegue: Core ML (ML Program para macOS 14 o superior) a traves de la app Lerp o de cualquier aplicacion macOS que cargue el `.mlpackage`; no se distribuyen pesos en formato GGUF, safetensors ni ONNX, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables.
- Latencia y throughput estimados: no disponibles en valores absolutos; solo se conocen las mejoras relativas del 30 % y 40 % frente a la exportacion directa en M2 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RIFE 4.25 (este repo, 1080p y 720p) | no disponible | 1920x1088 / 1280x768 | fp16 | MIT | Core ML en Hugging Face |
| EMA-VFI `ours_t` con RefineNet (este repo) | no disponible | 1920x1088 | fp16/fp32 mixto | Apache-2.0 | Core ML en Hugging Face |
| Practical-RIFE (hzwer) | no disponible | variable | PyTorch fp32/fp16 | MIT | GitHub |
| EMA-VFI (MCG-NJU) | no disponible | variable | PyTorch fp32 | Apache-2.0 | GitHub |

No se dispone de datos de parametros ni de benchmarks comparativos entre estas implementaciones en la informacion proporcionada; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo exclusivamente de vision para interpolacion de fotogramas: no genera texto, no razona, no soporta herramientas ni agentes; cualquier uso fuera de VFI es inadecuado.
- Ventana de resolucion fija: los fotogramas se rellenan por bordes hasta 1920x1088 o 1280x768, lo que puede introducir artefactos en los bordes y no admite resoluciones arbitrarias sin reescalado previo.
- Artefactos tipicos de VFI: en escenas con oclusiones, movimiento rapido, cambios de plano o texturas repetitivas, la interpolacion puede producir halos, ghosting o deformaciones; no hay datos de benchmarks perceptuales que cuantifiquen este riesgo.
- Licencia mixta: RIFE 4.25 es MIT y EMA-VFI es Apache-2.0; el repositorio declara `mit-and-apache-2.0` con un archivo `NOTICE` que debe consultarse antes de redistribuir. Los checkpoints de EMA-VFI se redistribuyen bajo Apache-2.0 aunque los autores originales no incluyeran texto de licencia separado, lo que conviene verificar para uso comercial.
- Inmutabilidad de los artefactos: los archivos estan fijados por tamano y SHA-256 por las versiones de Lerp que los referencian; no deben modificarse y cualquier revision se publica con un nombre de archivo nuevo.
- Dependencia de plataforma: requiere macOS 14 o superior y Core ML; no hay versiones para Linux, Windows, CUDA ni ROCm.
- Sin informacion sobre sesgos: al ser un modelo de vision, no aplican sesgos linguisticos, pero no se documentan sesgos de contenido visual ni el dataset de entrenamiento original.
- Riesgo de alucinacion en el sentido de contenido inventado: la red puede sintetizar detalle inexistente en fotogramas intermedios, especialmente en regiones ocluidas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WaveCut/lerp-models
- Aviso de licencia: https://huggingface.co/WaveCut/lerp-models/blob/main/NOTICE
- App Lerp: https://github.com/iamwavecut/Lerp
- Practical-RIFE (RIFE 4.25, hzwer): https://github.com/hzwer/Practical-RIFE
- EMA-VFI (MCG-NJU): https://github.com/MCG-NJU/EMA-VFI
- Paper EMA-VFI, CVPR 2023: "Extracting Motion and Appearance via Inter-Frame Attention for Efficient Video Frame Interpolation", Zhang, Zhu, Wang, Chen, Wu y Wang
