# xagent2025/VelaVec-T2I

## Resumen

VelaVec-T2I es un encoder de recuperación multimodal desarrollado por el usuario xagent2025, publicado en HuggingFace bajo licencia MIT. Se trata de la variante especializada en recuperación texto→imagen de la familia VelaVec: un tronco de texto ligero (unos 9,8 millones de parámetros) al que se añade una cabeza de proyección visual que traslada características de imagen extraídas por profesores CLIP al mismo espacio de embeddings de 256 dimensiones del texto. El resultado es un modelo de similitud semántica capaz de ordenar imágenes frente a una consulta textual, no un modelo generativo.

El modelo es relevante por su relación tamaño/rendimiento: con 11.290.112 parámetros totales (según los pesos en safetensors) alcanza un R@1 de 0,560 en recuperación texto→imagen sobre el conjunto de evaluación Flickr30k, frente al límite superior de 0,585 del conjunto de profesores CLIP ViT-B/32 + ViT-L/14. Es decir, se aproxima al profesor con una fracción mínima de sus parámetros, y su ruta de texto puede ejecutarse en CPU mediante un motor en Rust que el autor cifra en 53,9 veces más rápido que el profesor.

La arquitectura combina una tabla estática destilada congelada (30.522 × 256) con tres bloques de atención bidireccional y doble cabeza de pooling, más una cabeza de visión puramente de proyección. No incluye pesos de CLIP: en inferencia, las características visuales las generan los modelos CLIP de `transformers`, descargados aparte. El repositorio acaba de publicarse (0 descargas, 0 likes) y no cuenta con paper ni revisión por pares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de retrieval híbrido: tabla estática destilada congelada (30.522 × 256) → 3 bloques de atención bidireccional (RMSNorm, RoPE, SwiGLU) → attention pooling → dos cabezas (head=0 simétrica, head=1 de retrieval). Cabeza de visión de solo proyección: MLP residual 1280 → 768 → 256 |
| Parametros totales | 11.290.112 (safetensors); tronco de texto ~9,8 M + cabeza de proyección visual ±1,5 M |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en precisión original; no se documentan GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch), acompañado de `modeling_velavec.py` como módulo de inferencia autónomo |

## Arquitectura y entrenamiento

El tronco de texto es idéntico al de VelaVec: en lugar de un transformer convencional, parte de una tabla de embeddings estática y congelada de 30.522 entradas por 256 dimensiones (destilada), sobre la que se apilan tres bloques de atención bidireccional con RMSNorm, RoPE y SwiGLU, seguidos de un pooling por atención y dos cabezas de salida. Los tags del repositorio declaran `base_model: BAAI/bge-small-en-v1.5`, pero de ese modelo solo se reutiliza el tokenizador (`tokenizer.*`, `vocab.txt`), no sus pesos transformer. La cabeza de visión es exclusivamente una proyección: toma las características congeladas de dos profesores CLIP —`openai/clip-vit-base-patch32` (512d) y `openai/clip-vit-large-patch14` (768d)—, las normaliza en L2, las concatena (1280d) y las mapea con un MLP residual (1280 → 768 → 256) al espacio de 256 dimensiones del texto.

El entrenamiento de la proyección usa InfoNCE con las cinco descripciones por imagen (softmax caption→image), con recocido de coseno y una inicialización de anclaje residual a partir de la mejor proyección lineal encontrada. El autor indica explícitamente que descartó términos de regresión porque degradaban la discriminación texto→imagen entre imágenes distintas. Los datos de entrenamiento se limitan a Flickr30k. No se documentan fases de RLHF ni DPO, ya que no es un modelo generativo.

La innovación destacable es la asimetría del diseño: todo el coste paramétrico del lado visual se externaliza en los profesores CLIP, de modo que el repositorio solo contiene una cabeza de proyección de aproximadamente 1,5 millones de parámetros. Como contrapartida, la inferencia sobre imágenes exige cargar los dos modelos CLIP completos.

## Capacidades

- Recuperación texto→imagen (text-to-image retrieval): ordena un conjunto de imágenes según su similitud con una consulta o pie de foto. Es la dirección para la que está optimizado (R@1 = 0,560 en Flickr30k).
- Recuperación imagen→texto (image-to-text retrieval): soportada, con R@1 = 0,619 en Flickr30k, aunque por debajo de la variante equilibrada VelaVec-MultiModal (0,650).
- Embeddings de texto para similitud semántica de frases (pipeline declarado: `sentence-similarity`), mediante la cabeza de retrieval (head=1).
- Doble cabeza de embeddings: head=0 simétrica y head=1 de retrieval, lo que permite separar espacios según la tarea.
- Procesamiento de imagen a 224×224 con redimensionado, recorte central y normalización CLIP, sin prompting de instrucciones.
- Capacidades multilingües: no disponibles; el modelo está declarado únicamente para inglés.
- Generación de texto, razonamiento, código, matemáticas, tool calling, function calling y agentes multi-paso: no soportados. Es un encoder de recuperación, no un modelo de lenguaje generativo.
- Visión nativa: no incorpora codificador visual propio; depende de los profesores CLIP externos para producir las características de imagen.

## Casos de uso

- Búsqueda semántica en galerías de imágenes: indexar cada imagen con `encode_image()` (precalculando las características CLIP) y consultar en lenguaje natural con embeddings head=1; el producto escalar entre ambos vectores da el ranking de resultados.
- Recomendación de imágenes para artículos y notas de prensa: dado el texto de una noticia o entrada de blog, recuperar la fotografía más coherente de un banco de imágenes mediante similitud coseno en el espacio compartido de 256 dimensiones.
- Reranking en buscadores de fotografía de stock: usar el modelo como segunda etapa sobre los candidatos devueltos por un índice léxico (BM25), reordenándolos por similitud texto→imagen con un coste computacional muy bajo.
- Auditoría de datasets multimodales: detectar pares imagen-pie de foto mal alineados o ruidosos en corpus de entrenamiento, marcando como sospechosos aquellos cuyo score de similitud cae por debajo de un umbral calibrado.
- Filtrado y control de contenido: recuperar todas las imágenes de un archivo que se aproximen a descripciones textuales de riesgo para su revisión humana, aprovechando que el modelo opera sobre descripciones, no sobre etiquetas cerradas.
- Digitalización de patrimonio documental: búsqueda por descripción en archivos fotográficos, museos o hemerotecas donde los metadatos son escasos o inconsistentes.
- Recuperación en el borde (edge) para la ruta de texto: con ~9,8 M de parámetros en el tronco, el motor Rust asociado permite ejecutar la parte textual en CPU sin GPU, útil en servicios con presupuesto de cómputo muy limitado.
- Evaluación comparativa de profesores CLIP: el modelo sirve como sonda ligera para medir cuánta señal de recuperación texto→imagen es recuperable desde las características de un profesor dado.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, sobre el conjunto de evaluación de Flickr30k (agrupación emparejada de 1000 imágenes × 5000 pies de foto):

| Benchmark | Metrica | VelaVec-T2I | VelaVec-MultiModal | Profesor CLIP (b32 + l14) |
|---|---|---|---|---|
| Flickr30k texto→imagen | R@1 | 0,560 | 0,532 | 0,585 |
| Flickr30k imagen→texto | R@1 | 0,619 | 0,650 | 0,800 |

El autor describe VelaVec-T2I como la mejor cabeza única en la dirección texto→imagen dentro de su familia. La comparación con el profesor (ensemble de ViT-B/32 + ViT-L/14) indica que el modelo retiene aproximadamente el 96% del rendimiento t2i del profesor con alrededor del 2% de sus parámetros, mientras que en la dirección inversa la brecha es mucho mayor (0,619 frente a 0,800). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, ya que el modelo no es generativo. Tampoco hay resultados sobre los protocolos completos de COCO o Flickr30k 1K test.

## Requisitos de hardware

- Ruta de texto: 11,3 M de parámetros suponen aproximadamente 45 MB en fp32 y 23 MB en fp16, por lo que cabe holgadamente en CPU y en cualquier GPU.
- Ruta de imagen: requiere cargar los profesores CLIP ViT-B/32 (512d) y ViT-L/14 (768d), con lo que el consumo real se desplaza a los cientos de millones de parámetros de los profesores. La estimación de VRAM para el conjunto en fp16 se sitúa en el rango de 2 a 4 GB, incluyendo pesos y activaciones; se trata de una estimación a partir de los tamaños de los modelos CLIP, no de una cifra publicada por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para la ruta completa; RTX 3060, RTX 4060, RTX 4090 o T4 son opciones razonables. A100 y H100 son compatibles pero sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, de forma clara. La ruta de texto funciona incluso sin GPU.
- Opciones de despliegue: `transformers` + PyTorch mediante `modeling_velavec.py` (ruta completa, texto e imagen); motor en Rust `xagent2025/velavec-rust-inference` (solo ruta de texto, licencia MIT). No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: el autor cifra la ruta de texto del motor Rust en 53,9× más rápida que el profesor CLIP. No se publican cifras de latencia absoluta, throughput de imágenes por segundo ni coste por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Direccion destacada | R@1 Flickr30k | Codificador visual | Licencia |
|---|---|---|---|---|---|
| VelaVec-T2I | 11,3 M (mas profesores externos) | Texto→imagen | t2i 0,560 / i2t 0,619 | No incluido (CLIP externo) | MIT |
| VelaVec | ~9,8 M (tronco de texto) | Solo texto | No aplica | No tiene | MIT |
| VelaVec-MultiModal | No disponible | Imagen→texto equilibrada | t2i 0,532 / i2t 0,650 | No incluido (CLIP externo) | MIT |
| CLIP ViT-B/32 + ViT-L/14 (profesor) | No disponible en la model card | Ambas | t2i 0,585 / i2t 0,800 | Integrado en cada modelo | Distintas licencias segun repositorio de OpenAI |
| BAAI/bge-small-en-v1.5 | No disponible en la model card | Embeddings de texto | No aplica | No tiene | MIT |

No se dispone de datos comparativos frente a otros sistemas de recuperación multimodal de la misma categoría (por ejemplo, SigLIP, BLIP-2 o ALIGN), porque no aparecen en la información proporcionada.

## Limitaciones y advertencias

- Especialización asimétrica: está optimizado para texto→imagen y su rendimiento imagen→texto (0,619) queda por detrás de la variante equilibrada VelaVec-MultiModal (0,650).
- No genera imágenes ni texto: cualquier expectativa de uso generativo es incorrecta; solo produce embeddings y puntuaciones de similitud.
- Dependencia de modelos externos: la inferencia sobre imágenes exige PyTorch y `transformers`, además de la descarga de los dos profesores CLIP. No están incluidos en el repositorio. Solo la ruta de texto está cubierta por el motor Rust.
- Ámbito monolingüe: declarado exclusivamente para inglés. No hay evidencia de transferencia a otros idiomas.
- Evaluación limitada: los números provienen de una agrupación reducida de Flickr30k (1000 imágenes × 5000 pies de foto), no del protocolo completo de Flickr30k 1K test ni de COCO. El propio autor lo califica de indicativo, no de benchmark multimodal completo.
- Sesgos potenciales: el entrenamiento se limita a Flickr30k, un corpus de fotografía amateur en inglés, por lo que el modelo puede degradarse ante dominios alejados (imágenes técnicas, médicas, capturas de pantalla) o ante descripciones en otros idiomas. No se documenta ninguna evaluación de sesgos.
- Riesgo de falsos positivos y negativos en recuperación: al no ser generativo, no hay riesgo de alucinación en el sentido clásico, pero sí de emparejamientos incorrectos, especialmente en escenas con múltiples objetos y relaciones espaciales complejas.
- Longitud de contexto no documentada: se desconoce el máximo de tokens admitido por el tronco de texto, lo que impide dimensionar consultas largas o documentos completos.
- Madurez y soporte: repositorio recién creado, con 0 descargas y 0 likes, sin paper, sin revisión por pares y sin garantías de mantenimiento. La reproducibilidad depende de un único autor.
- Licencia: MIT, lo que permite uso comercial, redistribución y modificación. No obstante, conviene verificar las licencias de los profesores CLIP utilizados en inferencia, que son independientes de este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xagent2025/VelaVec-T2I
- VelaVec (variante de texto puro): https://huggingface.co/xagent2025/VelaVec
- VelaVec-MultiModal (variante equilibrada imagen→texto): https://huggingface.co/xagent2025/VelaVec-MultiModal
- Motor de inferencia en Rust (ruta de texto, 53,9× frente al profesor): https://huggingface.co/xagent2025/velavec-rust-inference
- Tokenizador base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Profesor CLIP ViT-B/32: https://huggingface.co/openai/clip-vit-base-patch32
- Profesor CLIP ViT-L/14: https://huggingface.co/openai/clip-vit-large-patch14

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a contenidos sin relación (foros y guías sobre Facebook), por lo que no se incluyen. No se han localizado paper, blog técnico ni demo asociados a VelaVec-T2I.
