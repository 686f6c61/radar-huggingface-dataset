# vlk74/ViT-B-16-SigLIP2-cs-en-8bit-blocks

## Resumen

ViT-B-16-SigLIP2-cs-en-8bit-blocks es una versión cuantizada y modificada del modelo de visión-lenguaje SigLIP 2 ViT-B/16 de Google, publicada por el usuario vlk74 en Hugging Face. Se trata de un export a ONNX del modelo original en el que se han reducido drásticamente tanto el tamaño del vocabulario del tokenizador (de 256.000 a 82.948 piezas) como la precisión de los pesos, que se almacenan y se ejecutan en enteros de 8 bits mediante el operador `MatMulNBits` de ONNX Runtime. El resultado es un modelo de clasificación de imágenes zero-shot de unos 296 MB, frente a los 1.536 MB del export original, pensado para entornos con memoria limitada como teléfonos ARM.

El modelo conserva la arquitectura de doble torre de SigLIP 2 (un codificador visual ViT-B/16 y un codificador de texto), pero está especializado en checo e inglés, los dos idiomas que el autor declara soportar. Su relevancia radica en que demuestra una cuantización que mantiene los pesos en 8 bits también en memoria durante la inferencia, no solo en disco, con una degradación mínima en la calidad de los embeddings según las pruebas publicadas por el autor.

Es importante señalar que no es un lanzamiento oficial de Google, OpenCLIP ni Immich, sino una modificación derivada del export ONNX de Immich, y que su rendimiento en procesadores x86 es peor que el de su modelo hermano con pesos en 8 bits que se descomprimen a coma flotante al cargar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de doble torre (ViT-B/16 visual + codificador de texto), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (el texto se rellena o se recorta a 64) |
| Tipos de cuantizacion | 8 bits simetrico por bloques de 32 numeros (`MatMulNBits`, `accuracy_level` 4); tabla de word-pieces en 8 bits con una escala por fila |
| Idiomas soportados | checo (cs) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`visual/model.onnx`, `textual/model.onnx`) |

## Arquitectura y entrenamiento

El modelo parte de SigLIP 2 ViT-B/16 (WebLI), un modelo de alineación imagen-texto con arquitectura de dos torres: un Vision Transformer con parches de 16x16 y un codificador de texto que comparten un espacio de embeddings mediante una función de pérdida sigmoidea. El export original procede del proyecto Immich (`immich-app/ViT-B-16-SigLIP2__webli`) y se distribuye en formato ONNX con los archivos `visual/model.onnx`, `textual/model.onnx` y sus configuraciones asociadas.

Las modificaciones introducidas por vlk74 el 1 de noviembre de 2026 afectan a tres ficheros. En `textual/model.onnx`, la tabla de word-pieces se recorta de 256.000 a 82.948 filas y se almacena en 8 bits con una escala por fila, y las capas `MatMul` se convierten en `MatMulNBits` (8 bits, simétrico, escala por bloque de 32 números, `accuracy_level` 4, lo que redondea también la entrada a 8 bits por bloque). En `textual/tokenizer.json` se conservan solo las piezas mantenidas, renumeradas, y las fusiones entre ellas. En `visual/model.onnx` se aplica la misma conversión de `MatMul` a `MatMulNBits`. La selección de word-pieces se basó en 200.000 frases por idioma (noticias y Wikipedia de Leipzig Corpora Collection), un conjunto de prompts de etiquetado de imágenes en inglés y checo, todos los tokens especiales y las 256 piezas de byte de reserva. La cuantización se realizó con `MatMulNBitsQuantizer` de ONNX Runtime 1.31.

## Capacidades

- Clasificación de imágenes zero-shot: permite asignar etiquetas textuales arbitrarias a imágenes sin entrenamiento específico, calculando similitud entre embeddings de imagen y de texto.
- Búsqueda imagen-texto y texto-imagen: genera embeddings alineados en un espacio común, útil para motores de búsqueda visual o recuperación multimodal.
- Descripción y etiquetado automático de imágenes en checo e inglés.
- Procesamiento de texto con tokenizador propio basado en Gemma, limitado a 64 tokens por consulta.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de embeddings, no un modelo generativo.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades generativas.

## Casos de uso

- Búsqueda visual en aplicaciones móviles: el modelo cabe en 296 MB y está pensado para ejecutarse en teléfonos ARM con kernels dedicados de ONNX Runtime, lo que permite indexar y buscar fotos por descripción textual en el propio dispositivo.
- Etiquetado automático de fotos en checo e inglés: útil para organizar bibliotecas fotográficas (por ejemplo, en un servidor tipo Immich) asignando etiquetas como "playa", "perro" o "atardecer" sin entrenamiento adicional.
- Filtrado de contenido en pipelines de moderación: clasificación zero-shot de imágenes contra un conjunto de categorías predefinidas para detectar contenido no deseado antes de su publicación.
- Recuperación multimodal en bases de datos vectoriales: generación de embeddings de imagen y texto para alimentar índices de búsqueda semántica con requisitos de memoria ajustados.
- Prototipado rápido en entornos con recursos limitados: al ocupar menos de 300 MB, permite desplegar un clasificador zero-shot en contenedores pequeños o dispositivos edge sin GPU.
- Investigación sobre cuantización: sirve como referencia para medir el impacto de la cuantización de 8 bits en memoria sobre la calidad de embeddings en tareas de recuperación, con métricas publicadas de similitud coseno frente al modelo original.
- Aplicaciones bilingües checo-inglés: sistemas de archivo o catálogo que reciben consultas en cualquiera de los dos idiomas y deben devolver imágenes relevantes.

## Benchmarks y rendimiento

El autor publica resultados sobre 200 fotos de Crossmodal-3600, donde cada descripción debe recuperar su propia foto:

| Metrica | Checo original | Checo este modelo | Ingles original | Ingles este modelo |
|---|---:|---:|---:|---:|
| Propia foto en 1.a posicion | 73,0 % | 73,0 % | 84,0 % | 84,0 % |
| En el top 5 | 93,0 % | 92,5 % | 99,0 % | 99,0 % |
| En el top 10 | 97,0 % | 96,5 % | 99,5 % | 99,5 % |
| Top 20 identico al original | | 96 % | | 97 % |

Similitud coseno de los vectores frente al original:

| | Media | Minima |
|---|---:|---:|
| Fotos | 0,9997 | 0,9968 |
| Descripciones en checo | 0,9989 | 0,8973 |
| Descripciones en ingles | 0,9990 | 0,9232 |

Tamano y latencia (Intel i5-5200U, 2 hilos):

| | Original | Pesos 8-bit (hermano) | Este modelo |
|---|---:|---:|---:|
| `visual/model.onnx` | 372 MB | 96 MB | 107 MB |
| `textual/model.onnx` | 1.129 MB | 174 MB | 183 MB |
| Modelo completo | 1.536 MB | 276 MB | 296 MB |
| Una foto | 364 ms | 397 ms | 668 ms |
| Un texto | 126 ms | 130 ms | 207 ms |

No se han publicado benchmarks estandar (MMLU, HumanEval, etc.) porque el modelo no es generativo.

## Requisitos de hardware

- VRAM/RAM estimada: unos 296 MB para los dos codificadores en disco; el autor indica que ocupa aproximadamente 500 MB menos en memoria que el modelo hermano con ambos codificadores cargados.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU y, en particular, para teléfonos ARM con kernels de 8 bits.
- Cabe en cualquier GPU de consumo e incluso en dispositivos móviles; no requiere GPU dedicada.
- Opciones de despliegue: ONNX Runtime 1.31 o superior (el operador `MatMulNBits` pertenece al dominio `com.microsoft`); no requiere opciones de sesión especiales.
- Latencia: 668 ms por foto y 207 ms por texto en un Intel i5-5200U con 2 hilos; no medido en ARM.
- Advertencia: en x86 los kernels de 8 bits de ONNX Runtime no superan a los flotantes de 32 bits, por lo que el autor recomienda el modelo hermano en esas plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (ViT-B-16-SigLIP2-cs-en-8bit-blocks) | no disponible | 64 tokens | Apache 2.0 | ONNX 8-bit | 296 MB, especializado cs/en, pesos 8-bit en memoria |
| vlk74/ViT-B-16-SigLIP2-cs-en-8bit | no disponible | 64 tokens | Apache 2.0 | ONNX 8-bit | 276 MB, descomprime a 32-bit al cargar, más rápido en x86 |
| immich-app/ViT-B-16-SigLIP2__webli | no disponible | 64 tokens | Apache 2.0 | ONNX | 1.536 MB, export original de referencia |
| timm/ViT-B-16-SigLIP2 | no disponible | 64 tokens | Apache 2.0 | PyTorch | Modelo base sin cuantizar, conversión para OpenCLIP |
| google/siglip2-base-patch16-224 | no disponible | 64 tokens | Apache 2.0 | PyTorch | Modelo original de Google, multilingüe completo |

## Limitaciones y advertencias

- En x86 es más lento que los flotantes de 32 bits: 668 ms frente a 364 ms por foto en el procesador de prueba. El autor recomienda usar el modelo hermano en esas plataformas.
- Otros idiomas distintos del checo y el inglés funcionan peor, ya que sus palabras se reconstruyen a partir de piezas menores o de bytes; no se han probado.
- Los vectores son cercanos a los del original pero no idénticos; no se deben mezclar modelos distintos en un mismo índice de búsqueda.
- Hereda las limitaciones de SigLIP 2: es débil en negación, conteo y texto pequeño.
- El tokenizador debe cargarse con la librería `tokenizers` desde `textual/tokenizer.json`; `AutoTokenizer` no es válido porque `tokenizer_config.json` conserva numeraciones del upstream que ya no coinciden (32 tokens afectados).
- El texto debe limpiarse según `config.json` (canonicalize: minúsculas, sin puntuación ASCII) y rellenarse o recortarse a 64 tokens.
- No es un lanzamiento oficial de Google, OpenCLIP ni Immich; es una modificación de terceros sujeta a la sección 4(b) de la licencia Apache 2.0.
- Al ser un modelo de embeddings, no genera texto ni razona; no debe usarse para tareas generativas.
- Riesgo de sesgos y alucinaciones heredado del corpus WebLI de SigLIP 2, no evaluado específicamente en esta versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vlk74/ViT-B-16-SigLIP2-cs-en-8bit-blocks
- Modelo hermano: https://huggingface.co/vlk74/ViT-B-16-SigLIP2-cs-en-8bit
- Export ONNX de Immich: https://huggingface.co/immich-app/ViT-B-16-SigLIP2__webli
- Modelo base en timm: https://huggingface.co/timm/ViT-B-16-SigLIP2
- Modelo original de Google: https://huggingface.co/google/siglip2-base-patch16-224
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Repositorio big_vision: https://github.com/google-research/big_vision
- Proyecto Immich: https://immich.app/
- Crossmodal-3600: https://google.github.io/crossmodal-3600/
