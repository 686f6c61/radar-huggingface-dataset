# UgurcanDogan/nmexplained-totalseg-webgpu

## Resumen

`nmexplained-totalseg-webgpu` es una redistribucion de los pesos de TotalSegmentator, un modelo de segmentacion de estructuras anatomicas en imagenes de tomografia computarizada (TC), reescrito como grafo ONNX optimizado para el proveedor de ejecucion WebGPU de ONNX Runtime Web. El autor, UgurcanDogan, no entrena un modelo nuevo: toma el export ONNX publico TS-Portable (a su vez derivado del TotalSegmentator original de Wasserthal et al., publicado en Radiology: Artificial Intelligence en 2023) y transforma el grafo para que la inferencia sea viable y rapida dentro de un navegador.

La motivacion es practica y concreta: el modelo se usa en la estacion de imagen de Nuclear Medicine Explained, donde el TC se segmenta integramente en el navegador del usuario y nunca se sube a un servidor. Esto elimina la necesidad de infraestructura GPU en el backend y mejora la privacidad de datos medicos, un aspecto critico en aplicaciones clinicas y de investigacion.

El repositorio incluye dos variantes de resolucion: una de 3 mm con 297 clases y otra de 1,5 mm con 291 organos. Los pesos son los mismos que en el modelo original, solo reordenados; la licencia es Apache-2.0 y el uso declarado es exclusivamente de investigacion y educacion, no como dispositivo medico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net (red convolucional 3D tipo U-Net) exportada a ONNX y reescrita para WebGPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada volumetrica de TC; escalas 3 mm y 1,5 mm) |
| Tipos de cuantizacion | no disponible (pesos en fp32 segun el export de origen) |
| Idiomas soportados | no aplica (modelo de imagen; etiquetas de clases anatomicas en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (dos ficheros: `total_3mm_297_webgpu2d_bas.onnx` y `total_1p5mm_291_organs_webgpu2d_bas.onnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es TotalSegmentator, basado en nnU-Net, una arquitectura de segmentacion convolucional 3D con forma de U-Net y preprocesamiento automatico de la imagen (reorientacion, remuestreo y normalizacion). El entrenamiento original se realizo sobre un conjunto amplio de TC con anotaciones de hasta 104 estructuras anatomicas, segun la publicacion de Wasserthal et al. (2023). En esta redistribucion no se ha reentrenado nada: los pesos son identicos a los del export TS-Portable, salvo reordenacion.

La innovacion tecnica esta en la reescritura del grafo para ONNX Runtime Web. Se aplican tres transformaciones: (1) las capas `ConvTranspose` con kernel igual a stride 2 y sin padding se sustituyen por `MatMul` mas operaciones de reshape y transpose, implementando un depth-to-space 3D sin solapamiento; (2) las convoluciones 3D se convierten en una convolucion 2D sobre cortes de profundidad concatenados en el eje de canales, porque onnxruntime-web 1.31 ejecuta las convoluciones 3D con un kernel ingenuo y lento; (3) la cabeza de salida aplica `Softmax` sobre las clases, selecciona las probabilidades de las clases indicadas en el input `secili` (int64), el fondo y el maximo sobre las clases de `diger` (int64), produciendo una salida `olasilik` de forma [1, S + 2, Z, Y, X]. El tamano de batch esta fijado a 1.

La verificacion reportada por el autor es solida: frente al grafo original en ONNX Runtime CPU con entrada aleatoria, la diferencia maxima de logits es 3,7e-4 (escala 3 mm) y 4,7e-5 (escala 1,5 mm), con coincidencia de arg-max del 100 %. La cabeza de salida frente a una implementacion NumPy de softmax y seleccion tiene un error maximo inferior a 1e-6. En navegador (Apple M6, WebGPU) sobre TC del dataset TCIA PSMA-PET-CT-Lesions v2, la coincidencia de voxeles con la ruta WebAssembly es del 99,999 % y el Dice por organo esta entre 0,9994 y 1,0.

## Capacidades

- Segmentacion automatica de estructuras anatomicas en TC: 297 clases en la variante de 3 mm y 291 organos en la de 1,5 mm.
- Ejecucion integra en el navegador mediante ONNX Runtime Web con proveedor WebGPU, sin subir la imagen a ningun servidor.
- Salida de probabilidades por clase y por voxel (`olasilik`), lo que permite umbralizar, combinar clases o extraer mascaras binarias por organo.
- Seleccion configurable de clases de interes mediante los inputs `secili` y `diger`, que reducen el coste de la cabeza de salida.
- Inferencia con batch fijo de 1, adecuada para el procesamiento de un estudio por vez.
- No soporta tool calling, agentes, texto, vision natural ni audio: es un modelo puramente de segmentacion de imagen medica.

## Casos de uso

- Visualizacion clinica en navegador: cargar un TC en una aplicacion web y obtener mascaras de organos sin enviar datos al servidor, lo que simplifica el cumplimiento de privacidad y reduce costes de backend.
- Investigacion en imagen medica: preprocesar cohortes de TC para extraer volumetrias de organos y estructuras, con la ventaja de que el procesamiento puede hacerse en estaciones de trabajo sin GPU dedicada.
- Docencia y formacion: mostrar en tiempo real la anatomia segmentada sobre un TC en un aula o demo web, usando la variante de 3 mm por su menor coste computacional.
- Planificacion de radioterapia o dosimetria (uso investigador): generar contornos de organos de riesgo como punto de partida para revision manual, con la variante de 1,5 mm cuando se requiere mayor detalle.
- Analisis de imagen PET/TC: el autor lo valida sobre el dataset TCIA PSMA-PET-CT-Lesions v2, de modo que encaja en flujos de oncologia nuclear donde se necesita la mascara anatomica para atenuacion o cuantificacion.
- Aplicaciones de escritorio y Electron: al ser ONNX, puede integrarse en aplicaciones locales que ejecuten WebGPU o el proveedor CPU de ONNX Runtime, sin dependencia de Python.
- Procesamiento por lotes en el cliente: automatizar la segmentacion de varios estudios en una maquina de usuario final, evitando colas en servidores compartidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Diferencia maxima de logits frente al ONNX original (CPU, 3 mm) | 3,7e-4 |
| Diferencia maxima de logits frente al ONNX original (CPU, 1,5 mm) | 4,7e-5 |
| Coincidencia de arg-max frente al ONNX original | 100 % |
| Error maximo de la cabeza de salida frente a NumPy | < 1e-6 |
| Coincidencia de voxeles WebGPU vs WebAssembly (navegador) | 99,999 % |
| Dice por organo WebGPU vs WebAssembly | 0,9994-1,0 |
| Dice frente a TotalSegmentator CLI 1,5 mm: higado | 0,984 |
| Dice frente a TotalSegmentator CLI 1,5 mm: aorta | 0,949 |
| Dice frente a TotalSegmentator CLI 1,5 mm: bazo | 0,969 |
| Dice frente a TotalSegmentator CLI 1,5 mm: rinones | 0,955 |
| Dice frente a TotalSegmentator CLI 1,5 mm: vejiga | 0,972 |
| Dice frente a TotalSegmentator CLI 1,5 mm: corazon | 0,964 |

No se han publicado resultados de benchmarks estandar de segmentacion (por ejemplo, en el conjunto de test de TotalSegmentator) en la informacion disponible; las cifras anteriores son verificaciones de equivalencia numerica del autor.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. Al ejecutarse en WebGPU, el consumo depende de la implementacion del navegador y del driver; el autor no publica cifras.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable; el autor cita como referencia una Apple M6. No se especifican modelos concretos de NVIDIA o AMD.
- Compatibilidad con GPU de consumo: si, siempre que el navegador exponga WebGPU; el modelo esta pensado precisamente para ejecutarse en el cliente.
- Opciones de despliegue: ONNX Runtime Web con proveedor WebGPU (objetivo principal) y proveedor WebAssembly como alternativa; tambien puede ejecutarse con ONNX Runtime en CPU o GPU de escritorio.
- Latencia y throughput: no disponibles. El autor solo reporta coincidencia de resultados, no tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto de ejecucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nmexplained-totalseg-webgpu | nnU-Net ONNX reescrito | 297 (3 mm) / 291 (1,5 mm) | Navegador con WebGPU | Apache-2.0 | Hugging Face |
| TotalSegmentator original | nnU-Net (PyTorch) | hasta 104 estructuras | Python, GPU/CPU | Apache-2.0 | GitHub y PyPI |
| TS-Portable | Export ONNX de TotalSegmentator | segun export | ONNX Runtime (CPU/GPU) | Apache-2.0 | Hugging Face |

La diferencia principal frente a las alternativas es el objetivo de despliegue: el modelo original y TS-Portable estan pensados para ejecucion en servidor o escritorio con Python, mientras que esta version prioriza la ejecucion en navegador mediante transformaciones de grafo especificas para WebGPU. En precision numerica, el autor demuestra equivalencia practica con el modelo de origen.

## Limitaciones y advertencias

- Uso declarado exclusivamente para investigacion y educacion; no es un dispositivo medico y no debe usarse para diagnostico o decision clinica sin validacion y supervision profesional.
- Solo procesa TC; no admite otras modalidades de imagen ni texto.
- El batch esta fijado a 1, lo que limita el throughput en escenarios de procesamiento masivo.
- La reescritura del grafo asume el comportamiento de onnxruntime-web 1.31; versiones distintas pueden requerir revision o producir resultados diferentes.
- El rendimiento y la precision pueden variar segun la GPU, el driver y la implementacion de WebGPU del navegador; el autor solo valida en una plataforma concreta.
- Los pesos conservan los sesgos del entrenamiento original de TotalSegmentator, aunque la model card no documenta sesgos especificos.
- No se proporcionan cifras de latencia ni de memoria, por lo que la planificacion de recursos debe hacerse con pruebas propias.
- La licencia Apache-2.0 permite uso comercial, pero la advertencia de "no dispositivo medico" debe respetarse en cualquier producto derivado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UgurcanDogan/nmexplained-totalseg-webgpu
- TotalSegmentator (GitHub): https://github.com/wasserth/TotalSegmentator
- Publicacion de TotalSegmentator: https://doi.org/10.1148/ryai.230024
- Export ONNX TS-Portable: https://huggingface.co/sigjhl/ts-portable
- Aplicacion Nuclear Medicine Explained: https://nuclearmedicineexplained.com
