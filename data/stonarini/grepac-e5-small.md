# stonarini/grepac-e5-small

## Resumen

grepac-e5-small es un modelo de embeddings de frases (sentence-transformers) obtenido mediante fine-tuning de `intfloat/multilingual-e5-small` para una tarea de recuperación muy concreta: localizar el artículo correcto de los reglamentos de la Política Agrícola Común (PAC) de la Unión Europea ante una pregunta formulada por un agricultor o un asesor. Lo desarrolla el usuario de Hugging Face `stonarini` como componente de recuperación del proyecto grepAC, una aplicación de búsqueda sobre normativa agraria europea.

El modelo parte de una arquitectura BERT con 117.653.760 parámetros totales y hereda la ventana de contexto de 512 tokens del modelo base (longitud máxima de entrenamiento de 256 tokens). El corpus indexado son únicamente los artículos del Reglamento (UE) 2021/2115 y del Reglamento (UE) 2021/2116, divididos en 911 párrafos.

Su relevancia es doble: por un lado, demuestra un flujo de trabajo de fine-tuning de recuperación completamente automatizado (generación de consultas sintéticas con un LLM local, filtrado por el propio modelo base y minería de negativos duros) ejecutado en la CPU de un portátil de 4 núcleos en 73 minutos; por otro, publica una evaluación honesta con intervalos de confianza implícitos y un análisis explícito de qué mejoras no son estadísticamente significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), modelo de embeddings de frases |
| Parámetros totales | 117.653.760 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base); entrenado con max length 256 |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF/ONNX publicadas en la información disponible) |
| Idiomas soportados | Entrenado con preguntas en inglés; evaluación limitada a 4 preguntas en italiano, francés, alemán y español |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder BERT multilingüe pequeño (base `intfloat/multilingual-e5-small`) afinado con `MultipleNegativesRankingLoss` y negativos duros. El entrenamiento usó 2 épocas, batch de 32, learning rate 2e-5, longitud máxima de 256 tokens y ausencia de textos duplicados dentro de un mismo batch. Se ejecutó íntegramente en la CPU de un portátil de 4 núcleos en 73 minutos, lo que da una idea del coste computacional real del ajuste.

Los datos de entrenamiento se generaron de forma automática, sin ejemplos escritos a mano. Mistral 7B Instruct v0.3 (Q4_K_M, ejecutado localmente vía Ollama) redactó 4 preguntas por párrafo (2 de estilo agricultor, 1 de búsqueda por palabras clave y 1 de estilo asesor), a las que se añadieron consultas basadas en reglas a partir de los títulos de artículo y de las definiciones. Se aplicaron tres filtros: descarte de preguntas cuyo artículo no aparecía en el top 20 del modelo base (257 descartadas, probable mala lectura del pasaje), descarte por similitud coseno ≥ 0,93 con una pregunta de test (153) y descarte de duplicados (10). Cada pregunta recibió un negativo duro: un párrafo de otro artículo que el modelo base puntuaba cerca del correcto. El resultado son 2.933 tripletas sobre 239 artículos, con 287 preguntas de 26 artículos reservadas para validación.

Los pasajes se indexan con el formato `passage: Article <n> — <title>\n<lead-in>\n<paragraph text>` y las consultas con el prefijo `query:`, manteniendo la convención del modelo E5 original. El autor documenta además dos intervenciones que no aportaron mejora medible: añadir contexto fijo ("EU Common Agricultural Policy") o sinónimos a la consulta, y añadir los encabezados de capítulo o el nombre del reglamento a los pasajes.

## Capacidades

- Generación de embeddings de frases para recuperación densa (retrieval) en un espacio vectorial normalizable.
- Similitud semántica entre preguntas en lenguaje natural y párrafos de texto legal.
- Comprensión de vocabulario agrario y administrativo europeo en inglés: pagos, beneficiarios, agricultor activo, condicionalidad, límites de pago.
- Manejo razonable de terminología jurídica estructurada por artículos y epígrafes.
- Capacidad multilingüe heredada del modelo base, aunque el ajuste se hizo solo con preguntas en inglés.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: es exclusivamente un encoder de recuperación.

## Casos de uso

- Búsqueda de normativa en un asistente para agricultores: el modelo convierte la pregunta del usuario ("¿cuándo cobro la PAC?") en un vector y recupera el artículo 44 del Reglamento 2021/2115 sobre pago a los beneficiarios, sirviendo como primer paso de un pipeline RAG.
- Soporte a asesores agrarios: consultas técnicas sobre condicionalidad, límites de pago o reserva nacional se resuelven contra los 911 párrafos indexados, con la ventaja de que el modelo fue entrenado específicamente con el registro lingüístico del asesor.
- Indexación de bases documentales legales pequeñas y cerradas: cualquier bufete o cooperativa puede reutilizar el pipeline del repositorio de GitHub para construir un índice equivalente sobre su propio corpus normativo.
- Componente de recuperación en sistemas RAG sobre EUR-Lex: el modelo actúa como retriever y un LLM generativo posterior redacta la respuesta citando el artículo recuperado.
- Filtrado y enrutamiento de consultas ciudadanas: clasificar preguntas entrantes hacia el artículo correspondiente antes de derivarlas a un humano o a un formulario administrativo.
- Prototipado rápido en hardware modesto: al ser un modelo de 117 M de parámetros, se puede servir en CPU con latencias bajas y sin GPU, lo que facilita desplegar demos de búsqueda legal en entornos con recursos limitados.
- Evaluación comparativa de estrategias de fine-tuning: sirve como referencia reproducible de un pipeline de generación sintética de consultas y minería de negativos duros con presupuesto de cómputo mínimo.

## Benchmarks y rendimiento

Evaluación sobre 60 preguntas escritas y verificadas a mano (38 prácticas, 18 técnicas, 4 en italiano, francés, alemán y español), puntuadas a nivel de artículo:

| Métrica | Base `multilingual-e5-small` | grepac-e5-small |
|---|---|---|
| Artículo correcto en primera posición | 0,667 | 0,717 |
| Artículo correcto en top 3 | 0,833 | 0,900 |
| Artículo correcto en top 5 | 0,867 | 0,900 |
| MRR@10 | 0,750 | 0,797 |

Desglose por tipo de pregunta (artículo correcto en top 5): prácticas 0,816 → 0,868; técnicas 1,000 → 1,000; otros idiomas 0,750 → 0,750.

Sobre las 287 preguntas generadas y reservadas para validación: artículo correcto en primera posición 0,735 → 0,794; en top 5 0,937 → 0,962.

El propio autor advierte de que la muestra de 60 preguntas es pequeña: 11 preguntas mejoraron y 8 empeoraron, con un test de signos de p ≈ 0,65, es decir, sin significación estadística. Las ganancias se concentran en formulaciones de estilo agricultor (por ejemplo, "What counts as a farmer?" pasó del puesto 31 al 2).

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en fp32 para los 117,7 M de parámetros (unos 470 MB de pesos); en fp16, alrededor de 235 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090 o A100 quedan sobredimensionadas para este modelo y solo se justifican si se comparte con otros componentes del pipeline.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4060 y cualquier integrada moderna con suficiente memoria compartida.
- Despliegue: sentence-transformers (referencia), Text Embeddings Inference (tag oficial en el repo), endpoints de Hugging Face; también es viable exportarlo a ONNX u otras runtimes de inferencia de encoders.
- Latencia y throughput: no se han publicado mediciones en la información disponible. El entrenamiento completo en CPU de 4 núcleos en 73 minutos sugiere una inferencia por lote muy ligera incluso sin GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| grepac-e5-small | 117,7 M | 512 tokens | Entrenado en inglés; eval. multilingüe limitada | MIT | Recuperación sobre normativa PAC (911 párrafos) |
| intfloat/multilingual-e5-small | 117,7 M | 512 tokens | Multilingüe (100 idiomas) | MIT | Embeddings generales; base de este modelo |
| intfloat/multilingual-e5-base | 278 M | 512 tokens | Multilingüe (100 idiomas) | MIT | Embeddings generales, mayor capacidad |
| Modelos legales especializados tipo LegalBERT | ~110 M | 512 tokens | Principalmente inglés | Varía (a menudo MIT o Apache-2.0) | Dominio legal genérico, no específico de la PAC |

La comparación directa con el modelo base es la más informativa: sobre el mismo conjunto de 60 preguntas, grepac-e5-small mejora el top 5 de 0,867 a 0,900 y el MRR@10 de 0,750 a 0,797. Frente a `multilingual-e5-base`, no hay datos comparativos publicados en la información disponible; el autor solo reporta la comparación con el modelo base pequeño.

## Limitaciones y advertencias

- El LLM generador malinterpretó algunos pasajes: por ejemplo, para el límite de pagos (art. 17 del Reglamento 2021/2115) generó preguntas sobre renta agraria superior a 60.000 EUR, lo que degradó la recuperación de consultas sobre el tope de pagos a grandes explotaciones.
- El ajuste se hizo exclusivamente con preguntas en inglés; el rendimiento en otros idiomas se comprobó con solo 4 preguntas y no mostró mejora (0,750 en top 5 antes y después).
- Los anexos no están en el corpus, incluidos los estándares BCAM del anexo III del Reglamento 2021/2115, por lo que las consultas sobre esos contenidos no pueden resolverse.
- El modelo está construido para este corpus concreto y no se ha probado con otros textos legales; su generalización a otra normativa es desconocida.
- La evaluación se apoya en 60 preguntas, una muestra pequeña sin significación estadística (p ≈ 0,65 en el test de signos); el autor lo describe explícitamente como una primera versión en funcionamiento.
- Riesgo de alucinación no aplica en sentido estricto (es un encoder, no genera texto), pero sí existe riesgo de recuperar el artículo equivocado, especialmente en consultas con vocabulario ambiguo.
- Sesgos: el corpus cubre solo dos reglamentos de la PAC; quedan fuera reglamentos delegados, directrices nacionales y jurisprudencia, lo que puede producir respuestas incompletas en un pipeline RAG.
- Licencia MIT, sin restricciones para uso comercial; el corpus procede de EUR-Lex y se reutiliza bajo la política de reutilización de la Comisión Europea, con © Unión Europea.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stonarini/grepac-e5-small
- Demo (Space): https://huggingface.co/spaces/stonarini/grepac
- Código y pipeline de entrenamiento: https://github.com/stonarini/grepac
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Reglamento (UE) 2021/2115 en EUR-Lex: https://eur-lex.europa.eu/eli/reg/2021/2115/oj
- Reglamento (UE) 2021/2116 en EUR-Lex: https://eur-lex.europa.eu/eli/reg/2021/2116/oj
