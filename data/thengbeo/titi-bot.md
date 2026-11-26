# Thengbeo/titi-bot

## Resumen

TiTi Bot es un modelo de lenguaje de pequeno tamano (63,52 millones de parametros) desarrollado por Ho Ngoc Thang en el marco del proyecto "TiTi Genesis AGI". Se trata de un modelo orientado especificamente al idioma vietnamita, con un vocabulario de 32.768 tokens "puramente vietnamita" y una arquitectura transformer de 6 capas con dimension oculta de 768. Su proposito principal no es la generacion de texto general, sino actuar como filtro de datos y extractor de spans para un sistema mayor de busqueda y limpieza de corpus.

El modelo implementa tres cabeceras funcionales sobre un mismo backbone: un cabecera de modelado de lenguaje causal (para preentrenamiento), una cabecera de clasificacion de calidad de datos en cinco clases (KEEP_CLEAN, DROP_SPAM_GAMBLING, DROP_SEO_CLICKBAIT, DROP_GARBLED_OCR, DROP_BROKEN_TRANSLATION) con puntuacion continua de 0.0 a 1.0, y una cabecera de extraccion de spans para busqueda extractiva. Esta especializacion lo hace relevante para pipelines de curacion de datos en vietnamita, aunque su utilidad fuera de ese nicho es muy limitada.

La relevancia actual del modelo reside en su enfoque de "micro-flota" de bots especializados de bajo coste computacional, disenados para tareas concretas de filtrado y extraccion en lugar de generacion abierta. No obstante, la informacion publica es escasa: no se han publicado resultados de benchmarks, no se especifica la licencia y el modelo parece encontrarse en una fase inicial de desarrollo con pesos de inicializacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (6 capas, 768 dimension oculta, 12 cabezas de atencion, 4 cabezas KV con GQA 3:1, FFN SwiGLU de 2048, RoPE, RMSNorm) |
| Parametros totales | 63,52 millones (37,76M en backbone transformer, 25,17M en embeddings) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en FP32, ~254 MB; FP16 estimado ~127 MB) |
| Idiomas soportados | Vietnamita (vocabulario de 32.768 tokens disenado para vietnamita) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 6 capas con dimension oculta de 768, 12 cabezas de atencion y 4 cabezas KV (GQA con ratio 3:1, siguiendo el esquema de Llama-3 y Qwen2.5). Emplea RMSNorm, activacion SwiGLU con dimension FFN de 2048 y embeddings rotatorios (RoPE). El vocabulario de 32.768 tokens (2^15) esta disenado exclusivamente para vietnamita, eliminando los 32.768 tokens en ingles que estaban presentes en una version anterior de 65.536 tokens, lo que reduce el desperdicio de parametros en la matriz de embeddings. El modelo incorpora tres cabeceras: `forward_loss` para modelado causal, `forward_filter` para clasificacion en 5 clases con puntuacion de calidad, y `forward_span` para prediccion de coordenadas start/end en busqueda extractiva.

Segun la model card, el modelo fue preentrenado sobre aproximadamente 300 millones de tokens de libros y material educativo limpio (archivo `loai_2.jsonl`). No se especifica si hubo fases de RLHF, DPO o ajuste fino supervisado adicional. Los pesos publicados (`titi_bot_vi.pt`) corresponden a una inicializacion FP32 generada por el script `init_weights.py`, lo que sugiere que el modelo podria no estar completamente entrenado en el momento de la publicacion. La model card menciona que el modelo supero 9 pruebas tecnicas de integridad (formas de logits, flujo de gradientes, consistencia de KV-cache con error de 2,91e-6, guardado y carga de checkpoints, tokenizacion vietnamita), pero estas pruebas verifican correccion estructural, no calidad de aprendizaje.

## Capacidades

- Modelado de lenguaje causal en vietnamita (generacion de texto basica).
- Clasificacion de calidad de datos en 5 categorias: KEEP_CLEAN, DROP_SPAM_GAMBLING, DROP_SEO_CLICKBAIT, DROP_GARBLED_OCR, DROP_BROKEN_TRANSLATION.
- Puntuacion continua de calidad de texto en el rango [0.0, 1.0].
- Extraccion de spans para busqueda extractiva: dado un par [pregunta + articulo web], predice coordenadas start..end del fragmento relevante.
- Tokenizacion especializada en vietnamita con cobertura de tonos, palabras compuestas, puntuacion, aritmetica y caracteres basicos.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue: no disponible (el vocabulario es exclusivamente vietnamita).

## Casos de uso

- Curacion de corpus web en vietnamita: el modelo puede clasificar paginas como spam de juego, clickbait SEO, OCR corrupto o traduccion defectuosa antes de incorporarlas a un dataset de entrenamiento, reduciendo el ruido en pipelines de datos a gran escala.
- Busqueda extractiva en articulos: dado un articulo y una pregunta, `forward_span` devuelve las coordenadas del fragmento que responde a la consulta, lo que permite construir un motor de busqueda que devuelve citas textuales en lugar de texto generado, mitigando alucinaciones.
- Filtrado de datos para preentrenamiento de modelos mayores: el modelo actua como primera etapa de un pipeline de limpieza, descartando documentos de baja calidad antes de pasarlos a un modelo de mayor tamano, con un coste computacional minimo (63M de parametros).
- Deteccion de traduccion automatica defectuosa: la clase DROP_BROKEN_TRANSLATION permite identificar textos traducidos de forma deficiente en corpus multilingues, un problema frecuente en datasets raspados de la web.
- Control de calidad en plataformas de contenido: integracion en un backend para moderar contenido generado por usuarios en vietnamita, marcando spam o clickbait antes de su publicacion.
- Preprocesamiento en sistemas RAG: el modelo puede puntuar la calidad de los documentos recuperados y extraer el span relevante antes de pasarlo a un modelo generativo, mejorando la precision y reduciendo el contexto enviado al LLM principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas de integridad estructural (formas de tensores, flujo de gradientes, consistencia de KV-cache, guardado/carga de checkpoints y tokenizacion), sin metricas de calidad como MMLU, HumanEval, GSM8K ni evaluaciones de clasificacion o extraccion de spans.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (~254 MB de pesos mas overhead de activaciones); en FP16 aproximadamente 127 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 o incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, y es viable en CPU para inferencia por lotes.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo PyTorch personalizado con cabeceras propias, requeriria un wrapper de inferencia a medida.
- Latencia y throughput estimados: no disponibles. Por el tamano (63M de parametros), se espera un throughput alto en GPU y aceptable en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TiTi Bot | 63,52M | No disponible | Filtrado de datos y extraccion de spans en vietnamita | No disponible | Hugging Face (pesos .pt) |
| DistilBERT | 66M | 512 tokens | Clasificacion y representaciones generales | Apache 2.0 | Hugging Face, ampliamente adoptado |
| PhoBERT-base | ~135M | 256 tokens | Representaciones y clasificacion en vietnamita | MIT | Hugging Face, VinAI |
| XLM-RoBERTa-base | ~278M | 512 tokens | Clasificacion multilingue | MIT | Hugging Face |

La comparacion es aproximada: TiTi Bot no es un modelo de representaciones generico sino un sistema especializado con cabeceras de filtrado y extraccion, por lo que la comparacion directa con encoder-only como DistilBERT o PhoBERT es limitada. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No se ha publicado la licencia, por lo que el uso comercial queda sin regularizar y requiere contacto con el autor.
- Los pesos publicados parecen corresponder a una inicializacion (`init_weights.py`), no a un modelo completamente entrenado; la calidad real del modelo es incierta.
- No hay benchmarks publicados que validen el rendimiento en las tareas declaradas (filtrado, puntuacion de calidad, extraccion de spans).
- El vocabulario es exclusivamente vietnamita, lo que limita su uso a ese idioma y puede degradar el rendimiento en texto con mezcla de ingles u otros idiomas.
- La longitud de contexto no esta documentada, lo que impide planificar su uso en documentos largos.
- Riesgo de alucinacion en la cabecera causal: al ser un modelo de 63M de parametros, la generacion de texto libre sera de baja calidad y propensa a incoherencias.
- El modelo no dispone de integraciones estandar (vLLM, llama.cpp, Ollama), lo que anade coste de ingenieria para su despliegue en produccion.
- No se documentan sesgos especificos, pero el entrenamiento sobre ~300M de tokens de libros y material educativo puede introducir sesgos de dominio y estilo.
- La model card esta redactada en vietnamita y contiene afirmaciones tecnicas no verificables de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Thengbeo/titi-bot
- No se han encontrado enlaces adicionales (papers, blogs, repositorios o demos) en la informacion disponible.
