# tomaarsen/TinyCLIP-39M-PixelArt

## Resumen
TinyCLIP-39M-PixelArt es un modelo de similitud texto-imagen (CLIP) afinado por tomaarsen a partir de `wkcn/TinyCLIP-ViT-39M-16-Text-19M-YFCC15M`. Su proposito concreto es recuperar imagenes de pixel art a partir de descripciones cortas en ingles, mapeando texto e imagen a un espacio compartido de 512 dimensiones con soporte Matryoshka (256 y 128 dimensiones). Se distribuye como modelo de Sentence Transformers con licencia Apache 2.0.

El modelo resuelve un nicho muy especifico: la busqueda semantica dentro de catalogos de sprites y assets de pixel art, donde los metadatos textuales suelen ser escasos y las imagenes son de resolucion muy baja (16x16 px en el conjunto de entrenamiento). Al partir de una arquitectura TinyCLIP de ~83 millones de parametros totales, prioriza velocidad y huella reducida frente a la precision de los CLIP de gran escala.

Es relevante ahora porque demuestra el patron de especializacion de embeddings multimodales: en lugar de competir con CLIP ViT-L/14 en benchmarks generales, se optimiza para un dominio cerrado con un dataset de 2,75 millones de pares sinteticos, lo que lo hace desplegable en CPU o GPU consumer para indexacion masiva de assets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (torres ViT para imagen y transformer para texto), empaquetado como SentenceTransformer |
| Parametros totales | 83.101.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens de texto |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX en la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB) |

Otros datos: dimension de salida 512 (Matryoshka a 256 y 128), funcion de similitud coseno, modalidades texto e imagen, modelo base `wkcn/TinyCLIP-ViT-39M-16-Text-19M-YFCC15M` (revision 07a4b0bc751cb64fecd2b661c048c1dd98d69444).

## Arquitectura y entrenamiento
La arquitectura es un `CLIPModel` de dos torres: un transformer de texto (aproximadamente 19M de parametros) y un ViT de 39M de parametros con parches de 16x16, preentrenado en YFCC15M. Ambas torres se exponen a traves de la interfaz `SentenceTransformer` con tareas de `feature-extraction` y salida `pooler_output` para texto e imagen, produciendo un `sentence_embedding` comun. El modelo completo suma 83.101.184 parametros.

El afinado se realizo sobre `Angais/pixel-art-atlas-1.4m`, con 2.753.652 muestras de entrenamiento compuestas por pares `query` (texto) e `image`. Segun las estadisticas de las primeras 100 muestras, las consultas son muy cortas (minimo 3 tokens, media 4,62, maximo 9) y las imagenes son de 16x16 px. Se entrenaron ambas torres con `MultipleNegativesRankingLoss` y `MatryoshkaLoss`, lo que permite truncar el embedding a 256 o 128 dimensiones manteniendo la utilidad de recuperacion. El preprocesamiento indicado en la model card compone el pixel art con transparencia sobre un fondo RGB (128, 128, 128) antes de codificar.

## Capacidades
- Recuperacion texto-imagen (text-to-image retrieval) en el dominio del pixel art.
- Extraccion de caracteristicas (embeddings) de texto e imagen por separado.
- Espacio de embedding compartido de 512 dimensiones con similitud coseno.
- Embeddings Matryoshka truncables a 256 y 128 dimensiones para indexacion economica.
- Codificacion de consultas cortas en ingles (hasta 77 tokens, aunque el entrenamiento uso frases de 3 a 9 tokens).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de embeddings, no generativo.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso
- Busqueda de sprites en un catalogo de assets: indexar todas las imagenes del repositorio con `encode_document` y resolver consultas como "sturdy brass hook" con `encode_query` y similitud coseno, aprovechando que el modelo fue entrenado exactamente con ese formato de descripcion corta.
- Etiquetado automatico de pixel art: dado un lote de imagenes sin metadatos, recuperar las descripciones mas proximas de un vocabulario controlado para generar tags de catalogo.
- Deduplicacion y agrupamiento de assets: usar los embeddings truncados a 128 dimensiones para clustering rapido de sprites visualmente similares en pipelines de limpieza de datasets.
- Motor de busqueda en editores o herramientas de game dev: integrar el modelo en un plugin que permita buscar por texto dentro de una libreria de tiles y personajes, con latencia baja gracias a los 83M de parametros.
- Filtrado de datasets de pixel art: clasificar pares texto-imagen por su similitud para descartar muestras mal etiquetadas antes de entrenar otros modelos.
- Recomendacion de assets relacionados: dada una imagen de referencia, buscar vecinos cercanos en el espacio de embeddings para sugerir sprites compatibles estilisticamente.
- Indexacion en CPU: por su tamano reducido, puede ejecutarse en servidores sin GPU para precalcular embeddings de catalogos completos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB en FP32 (83M de parametros, ~0,33 GB de pesos) y alrededor de 0,17 GB en FP16; el repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con 2 GB o mas; no requiere A100 ni H100. Una RTX 4090 o una T4 estan sobredimensionadas para este modelo.
- Cabe holgadamente en GPU consumer (GTX 1650, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: libreria `sentence-transformers` (via indicada en la model card), con backend PyTorch; tambien puede cargarse con `transformers` como `CLIPModel`. No se documentan exportaciones a GGUF, ONNX ni integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto texto | Dimension embedding | Licencia | Dominio |
|---|---|---|---|---|---|
| TinyCLIP-39M-PixelArt | 83,1M | 77 tokens | 512 (Matryoshka 256/128) | Apache 2.0 | Pixel art (especializado) |
| wkcn/TinyCLIP-ViT-39M-16-Text-19M-YFCC15M (base) | ~58M segun nombre (39M vision + 19M texto) | 77 tokens | 512 | no disponible en esta ficha | General (YFCC15M) |
| CLIP ViT-B/32 (OpenAI) | ~151M | 77 tokens | 512 | MIT (pesos originales) | General |
| CLIP ViT-L/14 (OpenAI) | ~428M | 77 tokens | 768 | MIT (pesos originales) | General |

Nota: los datos de los modelos comparativos no provienen de la informacion proporcionada para este modelo y deben verificarse en sus respectivas fichas. El modelo aqui descrito es sustancialmente mas pequeno que CLIP ViT-B/32 y ViT-L/14, lo que implica menor capacidad general pero mayor velocidad y menor huella.

## Limitaciones y advertencias
- Dominio muy restringido: entrenado exclusivamente con pixel art de 16x16 px y descripciones de 3 a 9 tokens; su rendimiento fuera de ese dominio no esta documentado y previsiblemente sera pobre.
- Solo ingles: las consultas en otros idiomas no estan soportadas segun el campo `language`.
- Ventana de texto de 77 tokens: no admite descripciones largas ni parrafos.
- Preprocesamiento obligatorio: el pixel art con transparencia debe componerse sobre fondo RGB (128, 128, 128); omitir este paso degrada los embeddings.
- Coherencia de dimension: si se usa `truncate_dim`, debe aplicarse la misma dimension a consultas e imagenes.
- Para indices de producto escalar hay que activar `normalize_embeddings=True`.
- Riesgo de sesgo y alucinacion: no documentado en la model card; al ser un modelo de recuperacion, los errores se manifiestan como falsos positivos en la busqueda, no como texto generado.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantia alguna sobre el rendimiento en produccion ni sobre los derechos de las imagenes del dataset de entrenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/tomaarsen/TinyCLIP-39M-PixelArt
- Modelo base: https://huggingface.co/wkcn/TinyCLIP-ViT-39M-16-Text-19M-YFCC15M
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Documentacion de Sentence Transformers: https://sbert.net
- Repositorio de Sentence Transformers: https://github.com/huggingface/sentence-transformers
- Modelos Sentence Transformers en Hugging Face: https://huggingface.co/models?library=sentence-transformers
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Matryoshka Representation Learning (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Paper de CLIP (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
