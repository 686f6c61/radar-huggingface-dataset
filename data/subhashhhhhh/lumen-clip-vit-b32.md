# subhashhhhhh/lumen-clip-vit-b32

## Resumen

Lumen CLIP ViT-B/32 es un paquete de ficheros ONNX cuantizados a int8 derivado de OpenCLIP ViT-B/32 entrenado sobre LAION-2B, publicado por el usuario `subhashhhhhh` para su uso dentro de Lumen, una galería fotográfica Android "local-first". No es un modelo nuevo: es una conversión con cuantización dinámica int8 de los pesos originales de `laion/CLIP-ViT-B-32-laion2B-s34B-b79K`, partiendo del export ONNX que ya había hecho Immich. El repositorio contiene únicamente el encoder visual (`visual_int8.onnx`, entrada `image` [1, 3, 224, 224] → vector de 512 dimensiones) y el encoder de texto (`textual_int8.onnx`, entrada `text` int32 [1, 77] → vector de 512 dimensiones), junto con el tokenizador BPE de CLIP.

El problema que resuelve es concreto: permitir búsqueda semántica de fotos por lenguaje natural completamente en el dispositivo, sin enviar imágenes a ningún servidor. La app descarga los ficheros bajo demanda desde sus ajustes y verifica cada uno contra los checksums SHA-256 incluidos en `SHA256SUMS`. Dentro de Lumen, esta es la opción de búsqueda "Fast", pensada para indexar rápido y con consultas en inglés.

Es relevante para desarrolladores porque ejemplifica un patrón de despliegue de CLIP en producción móvil: pesos int8, formato ONNX Runtime, tokenizador empaquetado y verificación de integridad, con un tamaño de repositorio de solo 0,2 GB y licencia MIT heredada de los pesos originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Doble encoder transformer (CLIP): ViT-B/32 para imagen + transformer de texto, ambos proyectados a un espacio compartido de 512 dimensiones |
| Parámetros totales | ~151 M en la arquitectura ViT-B/32 estándar (~88 M torre visual + ~63 M torre de texto); la model card no declara el recuento exacto |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 77 tokens para el encoder de texto (padding a 77); imagen de entrada fija de 224×224 píxeles |
| Tipos de cuantización | int8 dinámica en operaciones MatMul y Gemm, aplicada con ONNX Runtime; no se publican otros formatos |
| Idiomas soportados | Inglés (la model card indica explícitamente "English queries"); no se declaran otros idiomas |
| Licencia | MIT (pesos originales y tokenizador) |
| Formato de pesos | ONNX int8 (`visual_int8.onnx`, `textual_int8.onnx`), tokenizador BPE en `vocab.json` y `merges.txt`, más `SHA256SUMS` |

## Arquitectura y entrenamiento

La arquitectura es CLIP estándar en su variante ViT-B/32: una torre visual de tipo Vision Transformer con parches de 32×32 y 12 bloques, y una torre de texto transformer de 12 bloques, ambas con dimensión de salida 512. El entrenamiento original es contrastivo imagen-texto sobre LAION-2B (aproximadamente 2.000 millones de pares imagen-texto), de modo que pares coincidentes obtienen puntuaciones altas por producto escalar. El modelo no incluye ninguna fase de RLHF ni DPO: no genera texto, solo produce embeddings. El tokenizador es el BPE a nivel de byte de CLIP (OpenAI, MIT), con tokens especiales `<|startoftext|>` y `<|endoftext|>`.

La innovación de esta publicación no está en el entrenamiento, sino en el empaquetado para dispositivo: cuantización dinámica int8 de las matrices de las capas MatMul y Gemm mediante ONNX Runtime, y un preprocesado documentado de forma explícita (redimensionado del lado corto a 224 con interpolación bicúbica, recorte central 224×224, RGB, normalización con media (0.48145466, 0.4578275, 0.40821073) y desviación (0.26862954, 0.26130258, 0.27577711), formato CHW; texto en minúsculas con padding a 77 tokens). La recuperación se hace normalizando L2 ambos vectores y ordenando por similitud coseno.

## Capacidades

- Generación de embeddings de imagen: vector de 512 dimensiones por fotografía, a partir de una entrada RGB de 224×224.
- Generación de embeddings de texto: vector de 512 dimensiones por consulta, con un máximo de 77 tokens.
- Recuperación imagen-texto (image-text retrieval): ranking de fotografías por similitud coseno frente a una consulta escrita.
- Similitud imagen-imagen: los embeddings visuales permiten comparar fotos entre sí (agrupación, near-duplicates).
- Clasificación zero-shot mediante plantillas de texto, aprovechando el espacio compartido multimodal.
- Funcionamiento completamente offline: no requiere red una vez descargados los ficheros.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No genera texto, código, matemáticas ni visión descriptiva: es un modelo de representación, no un LLM.
- Capacidades multilingües: no declaradas; la model card restringe el uso a consultas en inglés.

## Casos de uso

- Búsqueda semántica en la galería del móvil: el usuario escribe "dog on the beach" y la app ordena las fotos por similitud coseno entre el embedding de la consulta y los embeddings visuales precalculados, sin salir del dispositivo.
- Indexación incremental de bibliotecas grandes: al ser la variante "Fast" de Lumen, el coste por imagen es bajo y permite indexar miles de fotos en segundo plano en CPU móvil.
- Etiquetado y agrupación automática: comparando embeddings visuales entre sí se pueden agrupar ráfagas, detectar near-duplicates o construir álbumes temáticos sin modelo adicional.
- Clasificación zero-shot de contenido: definir categorías con prompts de texto ("a receipt", "a screenshot", "a landscape") y asignar cada foto a la etiqueta con mayor similitud, útil para separar capturas de pantalla de fotos reales.
- Filtrado previo y moderación local: descartar o marcar imágenes por similitud con descripciones sensibles antes de mostrarlas en según qué secciones de la app.
- Integración en apps Android con ONNX Runtime Mobile: los dos grafos ONNX se cargan con el runtime estándar y se ejecutan sobre XNNPACK/NNAPI, sin dependencias de Python ni de servicios externos.
- Prototipado de sistemas de recuperación multimodal en el borde: sirve como baseline ligero para validar pipelines de búsqueda visual antes de pasar a variantes mayores (ViT-L/14, SigLIP) en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (Recall@K, mAP) ni la degradación de precisión introducida por la cuantización int8 respecto a los pesos originales en fp32.

## Requisitos de hardware

- VRAM/RAM: los pesos ocupan del orden de 100 MB por encoder dentro de un repositorio de 0,2 GB; el pico de memoria en ejecución se estima en 300–500 MB incluyendo activaciones y el buffer de imagen 1×3×224×224 (estimación a partir del tamaño de los ficheros, no publicada por el autor).
- GPU dedicada: innecesaria. Cualquier GPU consumer (RTX 3060 o superior) ejecuta el grafo sin esfuerzo, pero el objetivo del paquete es CPU.
- CPU móvil: es el destino previsto; el formato int8 dinámico está pensado para ARM64 con ONNX Runtime Mobile y aceleración XNNPACK/NNAPI.
- Cabe en cualquier dispositivo consumer: móviles Android de gama media, Raspberry Pi y portátiles sin GPU.
- Opciones de despliegue: ONNX Runtime (escritorio, móvil y web vía wasm); no se distribuyen pesos en GGUF, safetensors ni formatos para vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo generativo esas herramientas no aplican.
- Latencia y throughput: no disponibles. El autor posiciona esta variante como la opción rápida de indexado, pero no publica tiempos por imagen ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto texto | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `subhashhhhhh/lumen-clip-vit-b32` | ~151 M (ViT-B/32) | 77 tokens | ONNX | int8 dinámica | MIT | Hugging Face, repo de 0,2 GB |
| `laion/CLIP-ViT-B-32-laion2B-s34B-b79K` | ~151 M | 77 tokens | PyTorch (fp32) | Ninguna | MIT | Hugging Face |
| `immich-app/ViT-B-32__laion2b-s34b-b79k` | ~151 M | 77 tokens | ONNX | Sin int8 (la cuantización es el único cambio introducido por Lumen) | No disponible en la información | Hugging Face |
| `sentence-transformers/clip-ViT-B-32` | ~151 M (ViT-B/32) | 77 tokens | PyTorch / sentence-transformers | No disponible en la información | No disponible en la información | Hugging Face |

Los tres primeros comparten exactamente los mismos pesos; la diferencia es el formato y la cuantización. Frente a la versión original en fp32, esta variante sacrifica precisión (no cuantificada en la documentación) a cambio de tamaño y velocidad en CPU. Frente a alternativas de mayor tamaño como ViT-L/14, la calidad de recuperación es menor, pero el modelo cabe holgadamente en un móvil.

## Limitaciones y advertencias

- Solo inglés: la model card restringe explícitamente las consultas a inglés; no hay soporte multilingüe declarado ni evaluación en castellano.
- Ventana de texto muy corta: 77 tokens obligan a consultas breves y a descartar prompts largos o descripciones detalladas.
- Resolución fija de 224×224: detalles finos (texto en imágenes, objetos pequeños) se pierden en el redimensionado y el recorte central.
- Sesgos de LAION-2B: los datos originales son web scrape sin curación exhaustiva, por lo que el espacio de embeddings puede reflejar sesgos de género, cultura o representación geográfica; no se documenta ninguna mitigación.
- La cuantización int8 dinámica puede degradar la precisión del ranking respecto a fp32; el autor no publica la magnitud de esa pérdida, así que conviene validarla en el caso de uso propio.
- Riesgo de alucinación: no aplica en el sentido generativo (el modelo no produce texto), pero sí existe riesgo de falsos positivos en la recuperación, con fotos irrelevantes puntuadas alto por correlaciones espurias.
- Restricciones de licencia: los pesos y el tokenizador son MIT, lo que permite uso comercial; sin embargo, la procedencia de LAION-2B (contenido web) implica riesgos de derechos de autor sobre las imágenes indexadas que la licencia del modelo no cubre.
- Verificación de integridad obligatoria: el autor recomienda comprobar `SHA256SUMS` tras la descarga; usar los ficheros sin esa comprobación deja la app expuesta a ficheros corruptos o manipulados.
- No es un modelo generativo: no puede describir imágenes, responder preguntas sobre ellas ni ejecutar herramientas.

## Enlaces

- [Modelo en Hugging Face: subhashhhhhh/lumen-clip-vit-b32](https://huggingface.co/subhashhhhhh/lumen-clip-vit-b32)
- [Pesos originales: laion/CLIP-ViT-B-32-laion2B-s34B-b79K](https://huggingface.co/laion/CLIP-ViT-B-32-laion2B-s34B-b79K)
- [Export ONNX de Immich: immich-app/ViT-B-32__laion2b-s34b-b79k](https://huggingface.co/immich-app/ViT-B-32__laion2b-s34b-b79k)
- [Repositorio de modelos on-device de Lumen: 05Narwhal/lumen-models](https://github.com/05Narwhal/lumen-models)
- [sentence-transformers/clip-ViT-B-32](https://huggingface.co/sentence-transformers/clip-ViT-B-32)
- [Ficha de arquitectura CLIP ViT-B/32 en awesome-llm-model-zoo](https://github.com/neurarch-ai/awesome-llm-model-zoo/tree/main/architectures/clip-vit-b32)
- [Ficha de CLIP ViT-B/32 en Cognaptus](https://cognaptus.com/datahub/models/clip-vit-b-32/)
- [Pesos ViT-B-32.pt en jinaai/clip-models](https://huggingface.co/jinaai/clip-models/blob/main/ViT-B-32.pt)
