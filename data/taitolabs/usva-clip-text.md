# taitolabs/usva-clip-text

## Resumen

`taitolabs/usva-clip-text` es un export a ONNX del codificador de texto del modelo `sentence-transformers/clip-ViT-B-32-multilingual-v1`, publicado por TaitoLabs Oy para su aplicación Usva, un gestor de fotos personal que se ejecuta en local. El modelo no aporta pesos nuevos: reproduce el mismo espacio de embeddings que el original, pero empaqueta en un único grafo ONNX la salida `last_hidden_state` junto con el mean pooling y la proyección de 768 a 512 dimensiones, de modo que el consumidor recibe directamente un vector de 512 dimensiones.

La relevancia práctica es la de un componente de búsqueda semántica multimodal: al compartir espacio con el codificador de imagen de CLIP ViT-B/32, permite comparar texto con imágenes mediante similitud coseno. Su naturaleza multilingüe (hereda el vocabulario WordPiece de DistilBERT multilingual) lo hace útil para aplicaciones donde las consultas de los usuarios no están en inglés.

El tamaño del repositorio es de 0,5 GB, la licencia es Apache-2.0 y la biblioteca declarada es ONNX. No se han publicado resultados de benchmarks propios; el modelo card solo documenta la equivalencia numérica con `sentence-transformers` (coseno 1.0 verificado en el momento del export).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DistilBERT multilingual) como codificador de texto, con mean pooling y proyección lineal 768 a 512; exportado como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto publicado es un ONNX de precisión no especificada) |
| Idiomas soportados | multilingüe (según el modelo card; el vocabulario es el cased WordPiece de DistilBERT multilingual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`textual.onnx`) + `vocab.txt` |

## Arquitectura y entrenamiento

El modelo es un export de inferencia, no un entrenamiento nuevo. El codificador de texto subyacente es el de `sentence-transformers/clip-ViT-B-32-multilingual-v1`, basado en DistilBERT multilingual, que produce estados ocultos de 768 dimensiones; el pipeline añade mean pooling sobre la secuencia y una proyección lineal a 512 dimensiones para alinear la salida con el espacio del codificador de imagen de CLIP ViT-B/32. El grafo ONNX incluye ambas operaciones, con entradas `input_ids` y `attention_mask` y salida de 512 dimensiones sin normalizar.

No se detallan en la información disponible los datos de entrenamiento originales (número de tokens, composición del corpus, uso de RLHF o DPO), ya que corresponden al modelo base de sentence-transformers y no se documentan en este repositorio. La innovación técnica del export es puramente de empaquetado: elimina la necesidad de replicar el pooling y la proyección en el cliente y garantiza equivalencia numérica con la implementación de `sentence-transformers` (similitud coseno 1.0 verificada en el momento del export). Los hashes SHA-256 publicados permiten verificar la integridad de `textual.onnx` y `vocab.txt`.

## Capacidades

- Extracción de features de texto: genera un vector de 512 dimensiones por cadena de entrada, listo para indexación y búsqueda por similitud.
- Búsqueda texto-imagen: al compartir espacio con el codificador de imagen de CLIP ViT-B/32, permite comparar embeddings de texto con embeddings de imagen mediante coseno.
- Multilingüe: al estar basado en DistilBERT multilingual, acepta consultas en varios idiomas sin necesidad de traducción previa.
- Procesamiento por lotes: el grafo ONNX admite entradas con `attention_mask`, lo que permite lotes con padding.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni generación de texto: es exclusivamente un codificador de features.
- No dispone de visión, audio ni modo de pensamiento; la parte visual de CLIP queda fuera de este artefacto.

## Casos de uso

- Búsqueda semántica en bibliotecas de fotos locales: la aplicación indexa los embeddings de imagen con el codificador visual de CLIP y, en tiempo de consulta, codifica el texto del usuario con este ONNX para recuperar las imágenes más próximas por coseno. Es el escenario para el que se publicó (Usva).
- Búsqueda multilingüe en catálogos de producto: permite que un usuario consulte en castellano, catalán o inglés y recupere imágenes etiquetadas en otro idioma, gracias al codificador multilingüe compartido.
- Deduplicación y clustering de texto: los vectores de 512 dimensiones sirven para agrupar descripciones, títulos o pies de foto similares sin depender de coincidencia exacta de términos.
- Filtrado previo en pipelines RAG multimodales: usar el embedding de texto para preseleccionar documentos o imágenes candidatas antes de un reranking más costoso.
- Moderación y clasificación zero-shot de texto: comparar el embedding de un texto contra embeddings de etiquetas descriptivas precalculadas para asignar categorías sin entrenamiento adicional.
- Despliegue en el borde o en escritorio: al ser un único grafo ONNX de 0,5 GB, se puede ejecutar con ONNX Runtime en CPU sin GPU, lo que encaja en aplicaciones de escritorio con requisitos de privacidad (los datos no salen del equipo).
- Indexación de metadatos de archivos: generar embeddings de nombres de fichero, etiquetas o descripciones para habilitar búsqueda difusa en gestores documentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card únicamente documenta la equivalencia numérica con `sentence-transformers` (similitud coseno 1.0 verificada en el export) y los hashes SHA-256 de los artefactos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,5 GB, por lo que la huella en memoria es del orden de cientos de MB en función del runtime y del lote.
- GPU recomendadas: no se especifican; al ser un modelo de 0,5 GB, cualquier GPU con al menos 2 GB de VRAM puede alojarlo con holgura (por ejemplo, GTX 1650, RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna con 2 GB o más de VRAM; también es viable en CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), y cualquier stack compatible con ONNX como Olive o servidores de inferencia que acepten grafos ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Formato |
|---|---|---|---|---|---|
| `taitolabs/usva-clip-text` | no disponible | no disponible | 512 dims, ONNX con pooling y proyección incluidos | Apache-2.0 | ONNX |
| `sentence-transformers/clip-ViT-B-32-multilingual-v1` | no disponible | no disponible | 512 dims, vía `sentence-transformers` | Apache-2.0 | safetensors / PyTorch |
| Codificador de imagen CLIP ViT-B/32 | no disponible | no disponible | 512 dims (imagen) | Apache-2.0 (según el modelo original de OpenAI) | safetensors / PyTorch |

La diferencia principal frente al modelo base es el empaquetado: el export de TaitoLabs incluye el pooling y la proyección en el grafo, mientras que el original requiere el pipeline de `sentence-transformers`. Los pesos son los mismos, por lo que la calidad de los embeddings es equivalente.

## Limitaciones y advertencias

- Es un codificador de features, no un modelo generativo: no produce texto, no razona y no admite instrucciones.
- Los vectores de salida no están normalizados; es necesario normalizarlos a longitud 1 antes de comparar por similitud coseno.
- La calidad de la búsqueda texto-imagen depende de la alineación con el codificador visual de CLIP ViT-B/32; usar otro codificador de imagen rompe la comparabilidad.
- No se documentan sesgos específicos del export; al heredar los pesos de CLIP y DistilBERT multilingual, arrastra los sesgos del corpus de entrenamiento original, no disponibles en esta información.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos en la recuperación por similitud cuando las consultas son ambiguas o muy cortas.
- No se especifican la longitud máxima de secuencia ni el comportamiento con entradas largas; conviene validar el truncamiento en producción.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar los avisos de atribución del modelo original y verificar los términos de los componentes de CLIP subyacentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026; no hay evidencia de uso en producción más allá de la aplicación del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taitolabs/usva-clip-text
- Modelo base: https://huggingface.co/sentence-transformers/clip-ViT-B-32-multilingual-v1
- Aplicación Usva: https://usva.photos
- Documentación general de CLIP (GeeksforGeeks): https://www.geeksforgeeks.org/deep-learning/clip-contrastive-language-image-pretraining/
- Visión general de CLIP (Towards Data Science): https://towardsdatascience.com/clip-model-overview-unlocking-the-power-of-multimodal-ai/
