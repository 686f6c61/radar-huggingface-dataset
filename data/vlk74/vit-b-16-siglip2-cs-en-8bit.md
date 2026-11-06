# vlk74/ViT-B-16-SigLIP2-cs-en-8bit

## Resumen

ViT-B-16-SigLIP2-cs-en-8bit es una version modificada y cuantizada del modelo SigLIP 2 ViT-B/16 de Google, adaptada para busqueda de imagenes por texto en checo e ingles. Lo publica el usuario vlk74 en Hugging Face y parte del export ONNX del proyecto Immich sobre los pesos originales de SigLIP 2 (WebLI). El modelo resuelve el problema del tamano: reduce el repo de 1.536 MB a 276 MB manteniendo practicamente intacta la calidad de recuperacion en los dos idiomas objetivo.

La modificacion principal consiste en recortar la tabla de word-pieces del codificador de texto de 256.000 a 82.948 entradas, conservando solo las piezas usadas por 200.000 frases por idioma (noticias y Wikipedia de Leipzig Corpora Collection), prompts de etiquetado de imagenes y los 256 byte-pieces de respaldo. Ademas, los pesos de las capas `MatMul` y la tabla de word-pieces se almacenan como enteros de 8 bits con una escala por fila o columna, mientras los calculos intermedios siguen en float32.

Es relevante porque permite ejecutar busqueda semantica de fotos en local sobre hardware modesto (memoria de proceso de unos 1.1 GB frente a 2.0 GB del original) sin renunciar a la precision del modelo completo en checo e ingles, lo que lo hace util para aplicaciones de gestion de fotos personales como Immich.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/16 con codificador de texto (familia SigLIP 2, export ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (padding o truncado segun config.json) |
| Tipos de cuantizacion | pesos en int8 (8-bit) con escala por fila/columna; activaciones en float32 |
| Idiomas soportados | checo (cs), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`visual/model.onnx`, `textual/model.onnx`) |
| Tamano del repo | 0.3 GB (276 MB de pesos) |
| Entrada de imagen | ViT-B/16, parche 16, resolucion segun `visual/preprocess_cfg.json` |
| Pipeline | zero-shot-image-classification |

## Arquitectura y entrenamiento

El modelo es un SigLIP 2 ViT-B/16, un transformer de vision con codificador de texto emparejado entrenado con la funcion de perdida sigmoidea de SigLIP en lugar de softmax contrastivo. El export original procede de `immich-app/ViT-B-16-SigLIP2__webli` y los pesos base de `timm/ViT-B-16-SigLIP2`, derivados de los pesos oficiales de Google entrenados sobre WebLI. No se ha reentrenado el modelo: la modificacion es exclusivamente de almacenamiento y tokenizacion.

Los cambios aplicados son tres. Primero, la tabla de word-pieces del tokenizer se recorta de 256.000 a 82.948 filas, conservando las piezas de un corpus de 200.000 frases por idioma, prompts de etiquetado y los byte-pieces de respaldo, y se reindexa el `tokenizer.json` con solo las fusiones necesarias. Segundo, los pesos de las capas `MatMul` de ambos codificadores (visual y textual) se guardan como int8 con una escala por columna de salida, desquantizandose a float32 en tiempo de ejecucion mediante `DequantizeLinear` (y `Gather`/`Cast`/`Mul` para la tabla de word-pieces). Tercero, se mantienen sin cambios `config.json`, `preprocess_cfg.json`, `tokenizer_config.json` y `special_tokens_map.json`.

La innovacion tecnica es el ahorro de memoria y almacenamiento sin perdida apreciable de calidad: los vectores de imagen mantienen una similitud coseno media de 0.9995 con el original (minimo 0.9966) y los de texto 0.9992 en checo y 0.9993 en ingles. Los valores mas bajos de texto corresponden a palabras cuyos word-pieces fueron eliminados.

## Capacidades

- Recuperacion de imagenes por texto (text-to-image retrieval) en checo e ingles.
- Clasificacion zero-shot de imagenes mediante prompts de texto.
- Generacion de embeddings de imagen y de texto comparables en un espacio comun.
- Busqueda semantica sobre colecciones de fotos con ranking por similitud coseno.
- Soporte de multiples descripciones por imagen y busqueda cruzada (cada descripcion contra todas las fotos).
- Capacidad multilingue limitada a checo e ingles; otros idiomas degradan por el recorte de la tabla de word-pieces.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de representacion, no generativo.

## Casos de uso

- Gestion de fotos personales en Immich: el modelo encaja directamente en el pipeline de busqueda del proyecto Immich, ya que reutiliza su formato de export ONNX y sus entradas y salidas, permitiendo busqueda por texto en checo e ingles sobre la biblioteca local con menos memoria.
- Busqueda en archivos fotograficos de medios: indexar fotos de una redaccion y permitir consultas como "manifestacion en la plaza" en checo o ingles, con un coste de 235 ms por foto en CPU de 2 hilos.
- Clasificacion automatica de imagenes en pipelines de datos: usar prompts de texto como etiquetas zero-shot para enrutar imagenes a categorias sin entrenar un clasificador especifico.
- Moderacion o filtrado de contenido visual: comparar embeddings de imagen con descripciones de texto para detectar o etiquetar contenido en flujos de ingestion.
- Despliegue en dispositivos de borde o servidores modestos: con 276 MB de pesos y unos 1.1 GB de memoria de proceso, cabe en maquinas sin GPU dedicada, lo que permite busqueda local sin enviar fotos a la nube.
- Prototipado rapido de sistemas de recomendacion visual: generar embeddings de catalogo y de consultas de usuario para recuperar productos o imagenes similares en checo o ingles.
- Investigacion en recuperacion multimodal: servir como version ligera de SigLIP 2 para experimentos con recursos limitados, manteniendo alta correlacion con las representaciones del modelo completo.

## Benchmarks y rendimiento

Resultados de recuperacion sobre Crossmodal-3600 (1.000 fotos, descripciones humanas por idioma):

| Metrica | Checo original | Checo este modelo | Ingles original | Ingles este modelo |
|---|---:|---:|---:|---:|
| Propia foto en 1.a posicion | 53.0 % | 53.0 % | 74.7 % | 74.5 % |
| En el top 5 | 78.4 % | 78.4 % | 93.5 % | 93.4 % |
| En el top 10 | 86.3 % | 86.0 % | 97.0 % | 97.3 % |
| Top 20 identico al original | — | 95 % | — | 97 % |

Similitud coseno de vectores frente al original:

| | Media | Minima |
|---|---:|---:|
| Fotos | 0.9995 | 0.9966 |
| Descripciones en checo | 0.9992 | 0.8981 |
| Descripciones en ingles | 0.9993 | 0.9235 |

Rendimiento y tamano:

| | Original | Este modelo |
|---|---:|---:|
| `visual/model.onnx` | 372 MB | 96 MB |
| `textual/model.onnx` | 1.129 MB | 174 MB |
| Modelo completo | 1.536 MB | 276 MB |
| Una foto (AMD EPYC 7763, 2 hilos) | 232 ms | 235 ms |
| Un texto (AMD EPYC 7763, 2 hilos) | 74 ms | 74 ms |
| Memoria de proceso tras cargar y ejecutar ambos codificadores (ONNX Runtime 1.30, Intel i5-5200U) | ~2.0 GB | ~1.1 GB |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el modelo esta pensado para CPU con ONNX Runtime. En GPU, los 276 MB de pesos caben en cualquier tarjeta con 1 GB o mas de memoria.
- GPU recomendadas: cualquiera con soporte ONNX Runtime (RTX 4090, A100, H100) si se busca throughput alto, aunque el modelo esta optimizado para ejecucion en CPU.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) e incluso en iGPU por su tamano reducido.
- Opciones de despliegue: ONNX Runtime (con `session.disable_quant_qdq=1` para desquantizar una sola vez al cargar), integracion en Immich; no se distribuye en GGUF ni en formatos para llama.cpp, Ollama o TGI.
- Latencia y throughput: 235 ms por foto y 74 ms por texto en AMD EPYC 7763 con 2 hilos; memoria de proceso de unos 1.1 GB.
- Requisito de tokenizer: cargar `textual/tokenizer.json` con la libreria `tokenizers`; no usar `AutoTokenizer` porque `added_tokens_decoder` conserva numeracion del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de texto | Idiomas | Licencia | Formato | Tamano |
|---|---|---|---|---|---|---|
| Este modelo (ViT-B-16-SigLIP2-cs-en-8bit) | no disponible (ViT-B/16) | 64 tokens | cs, en | Apache 2.0 | ONNX int8 | 276 MB |
| immich-app/ViT-B-16-SigLIP2__webli | no disponible (ViT-B/16) | 64 tokens | multilingue (original) | Apache 2.0 | ONNX float | 1.536 MB |
| google/siglip2-base-patch16-224 | ~93 M (vision) | 64 tokens | multilingue | Apache 2.0 | safetensors | ~375 MB (aprox.) |
| timm/ViT-B-16-SigLIP2 | no disponible (ViT-B/16) | 64 tokens | multilingue | Apache 2.0 | safetensors | no disponible |

La ventaja diferencial frente al export de Immich y a los pesos originales es el tamano (5,5 veces menor) y la memoria en ejecucion (casi la mitad), con precision practicamente identica en checo e ingles. La contrapartida es la perdida de cobertura en otros idiomas por el recorte del tokenizer.

## Limitaciones y advertencias

- Otros idiomas funcionan peor: sus palabras se construyen a partir de word-pieces mas pequenos o de bytes, y no fueron probados. Para otros idiomas debe usarse el modelo completo.
- Los vectores son cercanos a los del original pero no identicos; no mezclar ambos modelos en un mismo indice de busqueda, ya que la similitud entre espacios puede degradar el ranking.
- Hereda las limitaciones de SigLIP 2: es debil en negacion, conteo y texto pequeno en imagenes.
- El recorte del tokenizer elimina 32 entradas de `added_tokens_decoder` respecto al original, por lo que herramientas que carguen el tokenizer de forma automatica pueden fallar.
- El modelo no es una version oficial de Google, OpenCLIP ni Immich; es una modificacion de terceros.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de cambios (seccion 4(b)) y las atribuciones a Google, timm e Immich.
- No es un modelo generativo: no produce texto ni respuestas, solo embeddings; no soporta razonamiento, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vlk74/ViT-B-16-SigLIP2-cs-en-8bit
- Modelo base (timm): https://huggingface.co/timm/ViT-B-16-SigLIP2
- Export ONNX de Immich: https://huggingface.co/immich-app/ViT-B-16-SigLIP2__webli
- Paper de SigLIP 2: https://arxiv.org/abs/2502.14786
- Pesos oficiales de Google: https://huggingface.co/google/siglip2-base-patch16-224
- Repositorio big_vision: https://github.com/google-research/big_vision
- Proyecto Immich: https://immich.app/
- Dataset Crossmodal-3600: https://google.github.io/crossmodal-3600/
