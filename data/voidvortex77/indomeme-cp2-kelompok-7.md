# voidvortex77/indomeme-cp2-kelompok-7

## Resumen

INDOMEME Checkpoint 2 Kelompok 7 es un artefacto de investigación multimodal orientado a la clasificación de memes en indonesio con contenido de odio o inapropiado. Lo desarrollan Joseph Pratama Lase y Rafa Maritza Hanasaputri como entrega académica (CP2, grupo 7), y no es un modelo generativo sino un clasificador de dos cabezas construido sobre backbones preentrenados: un codificador visual ViT, un codificador textual IndoBERTweet y señales OCR y de caption. El checkpoint de envío es B2 con semilla 42, seleccionado por Macro-F1 de validación.

El repositorio publica 22 checkpoints bloqueados que cubren las variantes B0–M3 y S0–S3 sobre varias semillas, además de parámetros de un router Ridge aprendido y evidencia agregada de robustez. Sobre las 1.005 memes del test oficial con captions originales, el modelo alcanza un Macro-F1 del 77,74 % para odio y del 77,00 % para inapropiado, con una media del 77,37 %.

Su relevancia es acotada y experimental: sirve como referencia reproducible para moderación de contenido en indonesio y para estudiar el efecto del routing de captions, pero no está pensado para producción. La licencia no está declarada, el pipeline no está definido en el Hub y el rendimiento fuera del dominio del dataset INDOMEME no se ha evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal de clasificación: ViT (google/vit-base-patch32-224-in21k) + IndoBERTweet (indolem/indobertweet-base-uncased) + entradas OCR y caption, con router Ridge para selección de caption |
| Parametros totales | no disponible (el repo pesa 17,7 GB e incluye 22 checkpoints, no un único modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch, state dict `best.pt`) |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`, state dict con configuración y fingerprint); requiere carga con `weights_only=True` y el loader del repositorio |

## Arquitectura y entrenamiento

El modelo combina tres fuentes de señal: la imagen del meme procesada por un ViT base patch32 a 224 px, el texto embebido en la imagen mediante OCR y el caption asociado codificado con IndoBERTweet. La variante B2 usa las tres entradas y produce dos salidas binarias, una para odio y otra para inapropiado (clase 1 = positivo). Sobre esta base se añade un router Ridge aprendido que decide qué caption utilizar, junto con un experimento de tres acciones documentado en el directorio `routers`.

El entrenamiento se realizó sobre el dataset aiatums/INDOMEME y la selección de checkpoint se hizo por Macro-F1 de validación, fijando la semilla 42 para el envío. No se detallan en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo ajuste por RLHF o DPO (no aplicable en un clasificador de este tipo). Los resultados de routing de captions son retrospectivos e incluyen sustituciones sintéticas de caption, por lo que no reflejan decisiones reales de moderadores.

## Capacidades

- Clasificación binaria de memes en indonesio para dos ejes: discurso de odio e inapropiado.
- Procesamiento multimodal conjunto de imagen, texto OCR y caption.
- Routing de caption mediante parámetros Ridge aprendidos para seleccionar la fuente textual más informativa.
- Evaluación reproducible con 22 checkpoints y manifiesto de hashes SHA-256.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step.
- No dispone de modo thinking, visión generativa, audio ni capacidades multilingües más allá del indonesio.

## Casos de uso

- Moderación asistida de memes en comunidades indonesias: el clasificador puede priorizar contenido para revisión humana usando las dos salidas (odio e inapropiado) sobre imágenes con texto embebido.
- Investigación académica sobre detección de discurso de odio multimodal: los 22 checkpoints y el manifiesto permiten reproducir experimentos y comparar variantes B0–M3 y S0–S3.
- Estudio del efecto del caption en la clasificación: el router Ridge y los resultados de routing permiten analizar cuánto aporta el texto asociado frente al OCR.
- Auditoría de datasets de memes: aplicar el modelo a subconjuntos de INDOMEME para detectar etiquetas dudosas o casos límite antes de reentrenar.
- Prototipado de pipelines de moderación en indonesio: integrar el state dict en un servicio interno de inferencia PyTorch para validar latencia y umbrales antes de escalar.
- Benchmark de referencia para nuevos clasificadores: usar el Macro-F1 de test (77,74 % odio, 77,00 % inapropiado) como línea base en publicaciones comparativas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Macro-F1 odio (test oficial, 1.005 memes, captions originales) | 77,74 % |
| Macro-F1 inapropiado (test oficial, 1.005 memes, captions originales) | 77,00 % |
| Macro-F1 medio | 77,37 % |
| Criterio de selección | Macro-F1 de validación, checkpoint B2 semilla 42 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas con otros clasificadores.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por la composición (ViT base + IndoBERTweet base) el checkpoint individual es manejable en GPU consumer, pero el repo completo de 17,7 GB incluye 22 checkpoints y no debe cargarse entero en memoria.
- GPU recomendadas: no disponible; para inferencia de un ViT base y un BERT base basta una GPU con al menos 8–16 GB, aunque el dato no está confirmado por el autor.
- GPU consumer: probablemente viable en RTX 3060/4060 o superiores, sin confirmación oficial.
- Despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI; la carga requiere PyTorch con `weights_only=True` y el loader del repositorio de GitHub.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| INDOMEME CP2 Kelompok 7 (B2 seed 42) | Clasificador multimodal ViT + IndoBERTweet | no disponible | no disponible | Macro-F1 77,37 % medio en test INDOMEME | no disponible | Hugging Face (repo de investigación) |
| IndoBERTweet base uncased | Codificador textual | no disponible | no disponible | no disponible | no disponible | Hugging Face (indolem) |
| ViT base patch32-224-in21k | Codificador visual | no disponible | no disponible | no disponible | no disponible | Hugging Face (google) |

No se dispone de comparativas numéricas con otros clasificadores de memes en indonesio en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar a los autores y a los términos de IndoBERTweet, ViT e INDOMEME.
- Artefacto de investigación: los propios autores indican que los resultados de routing son retrospectivos e incluyen captions sintéticos.
- Rendimiento fuera de dominio no evaluado: no hay evidencia de generalización a otros datasets o plataformas.
- Sesgos potenciales: al entrenarse solo con INDOMEME, hereda los sesgos y la distribución de ese corpus indonesio.
- Riesgo de error en memes ambiguos: el texto OCR y el caption pueden ser ruidosos o inexistentes, lo que degrada la clasificación.
- Solo indonesio: no hay soporte multilingüe declarado.
- Sin pipeline en el Hub: la integración requiere cargar manualmente el state dict y el loader del repositorio.
- No apto para moderación automática sin revisión humana: no se han medido resultados reales de moderadores.

## Enlaces

- Hugging Face: https://huggingface.co/voidvortex77/indomeme-cp2-kelompok-7
- Repositorio GitHub (CP2): https://github.com/josephp77-CyS/indomeme-kelompok-7/tree/submission/cp2
- Guía de verificación del modelo: https://github.com/josephp77-CyS/indomeme-kelompok-7/blob/submission/cp2/docs/cp2/submission.md
- Dataset INDOMEME: https://huggingface.co/datasets/aiatums/INDOMEME
- IndoBERTweet: https://huggingface.co/indolem/indobertweet-base-uncased
- ViT base patch32-224-in21k: https://huggingface.co/google/vit-base-patch32-224-in21k
