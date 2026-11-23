# Toxotes/mosaic-turkembed

## Resumen

MOSAIC TurkEmbed es un modelo de embeddings de frases especializado en recuperación de información (retrieval) sobre documentos financieros en turco. Lo desarrolla Toxotes (Mehmet Taha Toy y Ahmet Ali Süzen) como el retriever del sistema MOSAIC, una arquitectura federada de generación aumentada por recuperación (RAG) orientada a preservar la privacidad en sucursales bancarias turcas. El modelo parte de `intfloat/multilingual-e5-small` y se afina sobre pares consulta-pasaje construidos a partir de documentación bancaria y financiera turca.

La relevancia del modelo es doble. Por un lado, cubre un nicho poco atendido: el dominio financiero en turco, con vocabulario regulatorio y bancario específico. Por otro, demuestra una mejora medible sobre su modelo base en la tarea de localizar cifras y afirmaciones concretas dentro de pasajes: +0,044 MRR@10 en preguntas tipo cloze (intervalo de confianza del 95 % [0,027, 0,061]) y un aumento de Hit@10 de 0,950 a 0,983. En preguntas parafraseadas libremente, en cambio, la mejora no es estadísticamente significativa.

Arquitectura BERT de 117,6 millones de parámetros con 384 dimensiones de embedding, ventana de secuencia de 256 tokens y licencia MIT. Sustituye a una versión anterior (`mosaic-turkembed-finetuned`) que, entrenada sobre pares instrucción-respuesta, rendía peor que su propio modelo base en la recuperación de pasajes fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), derivado de intfloat/multilingual-e5-small |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; compatible con text-embeddings-inference) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de embedding | 384 |
| Libreria | sentence-transformers |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un encoder BERT de 117,6 millones de parámetros y 384 dimensiones de salida, heredado de `intfloat/multilingual-e5-small`. Se entrena con `MultipleNegativesRankingLoss`, sin pasajes duplicados dentro de un mismo lote, usando negativos in-batch y un negativo duro minado por consulta (extraído del ranking 3-30 del modelo base, descartando casi duplicados del positivo). Los hiperparámetros son: tamaño de lote 64, tasa de aprendizaje 2e-5, longitud máxima de secuencia 256 y precisión mixta. Se entrenaron 6 épocas y se seleccionó la época 4 según el conjunto de desarrollo retenido.

Los datos de entrenamiento son 6.629 pares consulta-pasaje extraídos de 6.482 fragmentos, con 731 consultas de 720 fragmentos adicionales reservadas para selección de modelo. Las consultas son preguntas naturales generadas por Qwen3-8B para cada fragmento, más consultas tipo cloze construidas a partir de oraciones que contienen una única cifra. Los pasajes son fragmentos de 600 caracteres con solapamiento de 120 caracteres, procedentes de textos financieros turcos (divulgaciones de empresas, documentos regulatorios y del banco central, y material de preguntas y respuestas bancarias). Se eliminó todo fragmento que contuviera la oración fuente de cualquier pregunta de evaluación, de modo que evaluación y entrenamiento no comparten pasajes. Las preguntas generadas se filtraron: debían terminar en signo de interrogación y no copiar secuencias de seis o más palabras del pasaje.

El modelo sigue la convención e5: los prefijos `query: ` y `passage: ` deben aplicarse a consultas y pasajes respectivamente, y se recomienda normalizar los embeddings.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación densa (pipeline `sentence-similarity`, tarea `feature-extraction`).
- Recuperación de pasajes en turco dentro de dominios financieros y bancarios: localización de cifras, condiciones y afirmaciones concretas.
- Integración en pipelines RAG, incluido el escenario federado de MOSAIC, donde cada sucursal devuelve sus 10 mejores pasajes y una sede central los fusiona.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- Soporte de re-ranking externo: el autor valida el modelo combinado con `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` sobre los 20 mejores candidatos.
- No dispone de tool calling, agentes, razonamiento multi-paso, visión ni audio: es exclusivamente un modelo de embeddings.
- Capacidad multilingüe limitada al turco en la práctica, aunque el modelo base sea multilingüe.

## Casos de uso

- Búsqueda semántica en bases de conocimiento bancarias: indexar documentación regulatoria y de producto en fragmentos de 600 caracteres y recuperar los pasajes relevantes para consultas de clientes o empleados, aprovechando la mejora en la localización de cifras concretas (tipos de interés, comisiones, plazos).
- RAG federado entre sucursales: desplegar una instancia por sucursal que devuelva sus 10 mejores pasajes y fusionar resultados en la sede central, tal como plantea la arquitectura MOSAIC; el modelo está entrenado y evaluado específicamente para este escenario.
- Asistente interno para empleados de banca: responder preguntas sobre condiciones de productos y normativa a partir de la documentación interna, con recuperación previa de pasajes y generación posterior por un LLM.
- Atención al cliente con base documental: recuperar la cláusula o el dato exacto que respalde una respuesta antes de mostrarla, reduciendo el riesgo de respuestas sin fundamento en un dominio regulado.
- Deduplicación y agrupación de fragmentos documentales: usar los embeddings normalizados para detectar pasajes casi idénticos entre divulgaciones y documentos regulatorios de distintas fuentes.
- Evaluación de sistemas de recuperación: servir como referencia de dominio para comparar retrievers genéricos frente a uno afinado en el mismo corpus financiero turco, con métricas MRR@10 y Hit@10.
- Filtrado previo a re-ranking: recuperar candidatos con este bi-encoder y refinar con un cross-encoder; el autor reporta 0,848 MRR@10 en preguntas parafraseadas con esta combinación.

## Benchmarks y rendimiento

MOSAIC cross-branch retrieval benchmark: 22.192 pasajes de dos sucursales bancarias; 600 preguntas cloze sobre una cifra de un pasaje en poder de la otra sucursal y 419 versiones parafraseadas. Métrica MRR@10 en el entorno federado. Intervalos de confianza del 95 % por bootstrap emparejado contra el modelo base.

| Modelo | Preguntas cloze | Preguntas parafraseadas |
|---|---|---|
| multilingual-e5-small (base) | 0,887 | 0,796 |
| mosaic-turkembed-finetuned (versión anterior) | 0,829 | 0,730 |
| MOSAIC TurkEmbed (este modelo) | 0,931 | 0,803 |
| multilingual-e5-small + re-ranking con cross-encoder | 0,838 | 0,844 |
| MOSAIC TurkEmbed + re-ranking con cross-encoder | 0,868 | 0,848 |

Diferencia frente al modelo base: +0,044 MRR@10 en cloze (IC 95 % [0,027, 0,061]) y +0,007 en parafraseadas (IC 95 % [-0,015, 0,028]). Hit@10 en cloze sube de 0,950 a 0,983. El re-ranker es `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` aplicado a los 20 mejores candidatos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (117,6 M de parámetros), menos de 0,3 GB en fp16; el repositorio ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe holgadamente en RTX 3060, RTX 4090, A100 y H100, aunque para cargas pequeñas la CPU es suficiente.
- Cabe en cualquier GPU de consumo actual e incluso en entornos sin GPU.
- Opciones de despliegue: sentence-transformers (referencia del autor), Text Embeddings Inference (tag oficial), endpoints compatibles y exportación a otros runtimes de embeddings; no se documentan instrucciones específicas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; con 256 tokens de secuencia máxima y 384 dimensiones, se espera un coste por embedding bajo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en el benchmark MOSAIC (cloze / parafraseadas) |
|---|---|---|---|---|---|
| MOSAIC TurkEmbed | 117,6 M | 256 tokens | tr | MIT | 0,931 / 0,803 |
| intfloat/multilingual-e5-small | 117,6 M | 512 tokens (modelo base e5) | multilingüe | MIT | 0,887 / 0,796 |
| mosaic-turkembed-finetuned | 117,6 M | no disponible | tr | MIT | 0,829 / 0,730 |

La comparación se limita al modelo base y a la versión anterior del mismo autor, porque son los únicos datos publicados en la model card. No se han divulgado comparaciones con otros modelos de embeddings para turco (por ejemplo, de la familia BGE-M3 o de e5-large) en la información disponible.

## Limitaciones y advertencias

- La mejora es clara en preguntas que buscan una cifra o afirmación concreta de un pasaje; en preguntas parafraseadas libremente el modelo está a la par del base, con un intervalo de confianza que incluye el cero.
- Las consultas de entrenamiento fueron generadas por un modelo de lenguaje (Qwen3-8B) sin revisión manual, lo que puede introducir sesgos de estilo o de distribución en las consultas.
- El modelo se entrenó y evaluó sobre la colección documental de una única institución; no se midió su rendimiento en otros corpus financieros turcos.
- El benchmark de evaluación es propio del autor y de dominio restringido (dos sucursales, 22.192 pasajes), por lo que la generalización a otros entornos no está validada.
- Ventana de 256 tokens: los pasajes deben trocearse (el autor usa fragmentos de 600 caracteres con solapamiento de 120), lo que puede perder contexto en documentos con estructura larga.
- Uso limitado al turco en la práctica; no se ha validado su comportamiento en otros idiomas pese a partir de un modelo multilingüe.
- Riesgo de recuperación de pasajes superficialmente similares pero no pertinentes en consultas ambiguas; se recomienda combinar con re-ranking y con umbrales de similitud.
- Licencia MIT: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales, pero conviene conservar el aviso de copyright.
- El modelo no genera texto: cualquier uso en producción requiere un LLM generador y un pipeline RAG completo, con los riesgos de alucinación que ello implica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Toxotes/mosaic-turkembed
- Versión anterior: https://huggingface.co/Toxotes/mosaic-turkembed-finetuned
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio del sistema MOSAIC: https://github.com/tahatoy/mosaic-federated-rag
- Cross-encoder usado en la evaluación: https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1
