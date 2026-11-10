# YanNoun/OpenSfM

## Resumen

OpenSfM models es un repositorio de pesos de inferencia publicado por YanNoun que agrupa los dos modelos que la libreria de fotogrametria OpenSfM (mantenida por Mapillary) descarga en tiempo de ejecucion para sus pasos de segmentacion semantica e inpainting. No es un modelo de lenguaje ni un modelo fundacional propio: es un paquete de artefactos exportados a ONNX y Core ML a partir de checkpoints de terceros, empaquetados con un `manifest.json` que fija tamano, SHA-256 e interfaz de cada fichero.

El primer componente es SAM 3 de Meta (Segment Anything with Concepts), exportado en tres piezas desacopladas: un codificador de imagen a 1008 px en fp16, un codificador de texto con contexto de 32 tokens y un decodificador con 16 huecos de prompt y las 64 mejores detecciones por prompt. El segundo componente es LaMa (big-lama), un modelo de inpainting con convoluciones de Fourier que OpenSfM usa para rellenar los pixeles de vehiculos y sus sombras en ortofotos de 512 x 512.

La relevancia practica esta en el formato: los pesos estan optimizados para ejecucion local en Apple Silicon (Core ML, macOS 15+) y en cualquier execution provider de ONNX Runtime, con latencias medidas en un M5 Pro (0,42 s de encoder y 0,8 s de decoder por imagen; 52 ms por recorte de inpainting en Core ML). El repositorio ocupa 3,9 GB y acumula solo 3 descargas, lo que refleja que su publico objetivo es el pipeline de OpenSfM mas que el uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3 (encoder de imagen ViT + encoder de texto CLIP BPE + decoder con prompts) para segmentacion; LaMa con convoluciones de Fourier para inpainting |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens de texto por prompt (codificador de texto SAM 3); entrada de imagen 1008 x 1008 px (SAM 3) y 512 x 512 px (LaMa) |
| Tipos de cuantizacion | fp16 (SAM 3 en ONNX y Core ML), fp32 (LaMa en ONNX), fp16 (LaMa en Core ML) |
| Idiomas soportados | no disponible (el codificador de texto usa tokenizador CLIP BPE; los prompts son texto libre) |
| Licencia | SAM License para `sam3/`; Apache-2.0 para `lama/` |
| Formato de pesos | ONNX (opset 18 en SAM 3, opset 17 en LaMa) y Core ML `.mlpackage`; embeddings precalculados en `.npz`; tokenizador en JSON |

## Arquitectura y entrenamiento

SAM 3 se distribuye como un pipeline de tres grafos independientes de la taxonomia: el codificador de imagen recibe `pixel_values` [1,3,1008,1008] en fp16 normalizado (RGB/255, media 0,5, desviacion 0,5) y emite tres mapas FPN de 256 canales a 288², 144² y 72²; el codificador de texto recibe `input_ids` [N,32] int64 con tokenizador CLIP BPE (inicio 49406, fin 49407, relleno con 0) y produce `text_features` [32,N,256] y `text_mask`; el decodificador recibe los FPN, las features de texto y 16 huecos de prompt, y devuelve mapas de score por prompt [16,288,288], scores [16,200] y cajas [16,200,4] en coordenadas normalizadas. La variante `inst` anade `instance_index` [16,288,288] (deteccion 0..63 ganadora por pixel, -1 si ninguna), `instance_scores` [16,64] y `instance_boxes` [16,64,4].

La exportacion se hizo con la implementacion SAM 3 de Ultralytics y los parches de `greenjava/sam3-onnx`, con entrada a 1008 px, fusion de los mapas de score por prompt en el grafo, mascaras solo para las 64 mejores detecciones, particionado por ventanas y reescritura de productos de mascaras para Core ML (rango ≤ 5, matmul). El decodificador `inst` selecciona las 64 mejores detecciones con un matmul one-hot sobre los rangos en lugar de `topk`, cuyos indices salen incorrectos en GPUs de Apple. El encoder Core ML es la conversion a ML program de ONNX Runtime con las constantes movidas al blob de pesos; el decoder Core ML se convierte desde PyTorch con coremltools.

LaMa (Suvorov et al., WACV 2022) se exporta desde el checkpoint TorchScript `big-lama.pt` (SHA-256 `344c77bb…9ea9`) trazado a 512 px. En ONNX, las unidades de Fourier `rfftn`/`irfftn` (2D, norma ortho) se exportan como productos exactos de matrices DFT con los valores complejos en un eje final de tamano 2, de modo que el grafo solo usa operadores estandar y corre en cualquier execution provider. En Core ML se usan operadores FFT nativos. No se documenta en la informacion disponible el proceso de entrenamiento propio de estos pesos: SAM 3 procede del checkpoint oficial `sam3.pt` de Meta y LaMa del checkpoint de sus autores entrenado en Places2.

## Capacidades

- Segmentacion semantica guiada por texto: cada clase de una taxonomia se define como una lista de prompts ("building", "roof", etc.) y el modelo devuelve mapas de score por prompt, sin reentrenamiento al cambiar la taxonomia.
- Segmentacion de instancias: la variante `inst` asigna a cada pixel la deteccion ganadora entre las 64 mejores por prompt, con scores y cajas normalizadas.
- Procesamiento de imagenes aereas y de calle: el modelo card indica uso con imagenes desde nivel de calle hasta nadir y aereas oblicuas.
- Inpainting de objetos: LaMa rellena los pixeles enmascarados de recortes de 512 x 512 preservando la imagen original fuera de la mascara.
- Prompts precalculados: el fichero `embeddings/sam3-text-ctx32-fp16.npz` permite reutilizar las features de texto sin ejecutar el codificador de texto.
- Ejecucion multiplataforma: ONNX Runtime en cualquier execution provider y Core ML en macOS 15+ (CPU, GPU y Neural Engine).
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes ni modalidades de audio o video.

## Casos de uso

- Reconstruccion fotogrametrica con etiquetado semantico: OpenSfM ejecuta el paso `segment` sobre las imagenes del levantamiento y obtiene mapas de clases por prompt; al ser independiente de la taxonomia, el mismo par de pesos sirve para distintas campanas sin reexportar.
- Cartografia de edificios y cubiertas: con prompts como "building" o "roof", el decoder devuelve mapas de score por prompt que se pueden umbralizar para generar mascaras de cubierta sobre ortofotos y nubes de puntos.
- Segmentacion de instancias en imagenes aereas: la variante `inst` aporta cajas y scores de las 64 mejores detecciones por prompt, util para inventariar elementos individuales (vehiculos, arboles) sin postproceso de `topk`.
- Limpieza de ortofotos: LaMa rellena los pixeles de vehiculos y sus sombras en recortes de 512 x 512, con la imagen fuera de la mascara intacta, lo que permite publicar ortofotos sin elementos moviles.
- Procesamiento local en estaciones de trabajo Apple: con Core ML en un M5 Pro, el encoder tarda 0,42 s y el decoder 0,8 s por imagen, y el inpainting 52 ms por recorte en CPU+GPU o 127 ms en Neural Engine, suficiente para lotes de decenas de imagenes sin servidor GPU.
- Despliegue en pipelines existentes de ONNX Runtime: al usar solo operadores estandar en LaMa y opset 18 en SAM 3, los grafos se ejecutan en CPU, CUDA o DirectML sin kernels personalizados, lo que simplifica el empaquetado en contenedores.
- Precalculo de prompts en produccion: el `.npz` de embeddings permite fijar una taxonomia y evitar el codificador de texto en cada inferencia, reduciendo el coste por imagen cuando la taxonomia es estable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card unicamente aporta medidas de latencia y fidelidad de la exportacion:

| Medicion | Valor |
|---|---|
| SAM 3 encoder, M5 Pro, Core ML CPU+GPU | 0,42 s por imagen |
| SAM 3 decoder, M5 Pro, Core ML CPU+GPU | 0,8 s por imagen |
| SAM 3, coincidencia de mapas de etiquetas con PyTorch (`Sam3Model`, 1008 px) | ~97% de los pixeles |
| LaMa, M5 Pro, Core ML CPU+GPU, por recorte de 512 | 52 ms |
| LaMa, M5 Pro, Core ML Neural Engine, por recorte de 512 | 127 ms |
| LaMa, ONNX Runtime CPU, por recorte de 512 | 0,47 s |
| LaMa ONNX frente a PyTorch | < 0,01 / 255 |
| LaMa Core ML frente a PyTorch (dentro de las mascaras) | 0,8 / 255 de media |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio pesa 3,9 GB y los pesos SAM 3 van en fp16 y LaMa en fp32 (ONNX) o fp16 (Core ML), por lo que el consumo se reparte entre los tres grafos de SAM 3 y el grafo unico de LaMa.
- GPU recomendadas: no se documentan; las unicas medidas publicadas son en un Apple M5 Pro.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el decoder de SAM 3 a 1008 px y LaMa a 512 px son los grafos mas exigentes y no se publican requisitos minimos.
- Opciones de despliegue: ONNX Runtime (cualquier execution provider, incluido CPU), Core ML en macOS 15+ con ejecucion en CPU, GPU o Neural Engine, y el propio pipeline de OpenSfM que descarga y fija la revision del repositorio.
- Latencia y throughput: 0,42 s + 0,8 s por imagen en SAM 3 y 52 ms por recorte en LaMa sobre M5 Pro (Core ML CPU+GPU); 0,47 s por recorte en ONNX Runtime CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenSfM models (SAM 3 + LaMa) | no disponible | 32 tokens de texto; 1008 px (SAM 3) y 512 px (LaMa) | 0,42 s + 0,8 s por imagen y 52 ms por recorte en M5 Pro; ~97% de coincidencia con PyTorch | SAM License + Apache-2.0 | Hugging Face, ONNX y Core ML |
| SAM 3 original (Meta) | no disponible | 1008 px | referencia PyTorch (`Sam3Model`); sin latencias publicadas aqui | SAM License | checkpoint `sam3.pt` en el repositorio oficial |
| big-lama original | no disponible | 512 px | referencia PyTorch; export ONNX < 0,01/255 | Apache-2.0 | checkpoint TorchScript `big-lama.pt` |
| Otros modelos de segmentacion e inpainting | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al depender de prompts de texto, la calidad de la segmentacion varia con la formulacion de cada clase y con el dominio de las imagenes.
- Riesgo de alucinacion: en inpainting, LaMa genera contenido sintetico en las zonas enmascaradas; el resultado es plausible pero no recupera el contenido real, por lo que no debe tratarse como dato fotogrametrico.
- Limitaciones de contexto e idioma: el codificador de texto acepta 32 tokens por prompt con tokenizador CLIP BPE; no se documentan idiomas soportados ni comportamiento fuera del ingles.
- Restricciones de licencia: `sam3/` se distribuye bajo SAM License, que debe acompanar cualquier redistribucion; `lama/` bajo Apache-2.0. El uso comercial de SAM 3 queda sujeto a los terminos de la SAM License y no se detallan en la informacion disponible.
- Dependencia de plataforma: los `.mlpackage` requieren macOS 15+; el decoder `inst` es el recomendado porque los decoders antiguos pierden detecciones en GPUs de Apple por el comportamiento de `topk`.
- Precaucion en produccion: OpenSfM fija una revision concreta del repositorio y verifica los SHA-256 del `manifest.json`, por lo que actualizar los pesos exige revisar ese manifiesto; el repositorio tiene solo 3 descargas y no hay garantia de mantenimiento a largo plazo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YanNoun/OpenSfM
- OpenSfM (Mapillary): https://github.com/mapillary/OpenSfM
- SAM 3 (Meta): https://github.com/facebookresearch/sam3
- Parches de exportacion SAM 3 a ONNX: https://huggingface.co/greenjava/sam3-onnx
- LaMa: https://github.com/advimman/lama
- Licencia SAM: https://huggingface.co/YanNoun/OpenSfM/blob/main/sam3/LICENSE
- Licencia Apache-2.0 de LaMa: https://huggingface.co/YanNoun/OpenSfM/blob/main/lama/LICENSE
