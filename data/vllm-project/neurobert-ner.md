# vllm-project/NeuroBERT-NER

## Resumen

NeuroBERT-NER es un modelo de clasificación de tokens (token classification) especializado en reconocimiento de entidades nombradas (NER) para inglés. Lo desarrolla Boltuix y se distribuye bajo licencia Apache-2.0. Está construido mediante fine-tuning del modelo base `boltuix/NeuroBERT-Mini`, un transformer tipo BERT de aproximadamente 9,5 millones de parámetros, lo que lo sitúa en la gama ultraligera y lo hace apto para inferencia en tiempo real incluso en CPU.

El modelo resuelve la extracción estructurada de entidades en texto: identifica 36 etiquetas NER derivadas de 18 categorías de entidad con esquema BIO (persona, organización, localización geopolítica, fecha, dinero, etc.). Se entrenó sobre el dataset `boltuix/conll2025-ner`, con aproximadamente 143.709 entradas y particiones de entrenamiento, validación y test, orientado a dominios de noticias, contenido generado por usuarios y corpus de investigación.

Su relevancia actual radica en dos factores: por un lado, el tamaño reducido (9,5 M de parámetros, unos 50 MB de pesos) permite desplegarlo en entornos con recursos muy limitados; por otro, el repositorio `vllm-project/NeuroBERT-NER` es una copia mantenida por el proyecto vLLM para reducir el riesgo de cadena de suministro en sus pruebas de integración continua, lo que da visibilidad al modelo dentro del ecosistema de serving. No obstante, la model card contiene marcadores de posición sin resolver (enlaces de dataset y repositorio) y no publica resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder), clasificación de tokens |
| Parametros totales | 9.534.757 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (propia de un BERT; no especificada en la información) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo BERT, base `boltuix/NeuroBERT-Mini`, con 9,53 millones de parámetros totales según los pesos en safetensors (la model card indica "~11M", cifra aproximada). La cabeza de salida es de clasificación de tokens sobre 36 etiquetas con esquema BIO: 18 categorías de entidad con prefijos B- e I- más la etiqueta O. No se documenta el número de capas, dimensiones ocultas ni cabezas de atención.

El fine-tuning se realizó sobre `boltuix/conll2025-ner`, con aproximadamente 115.812 ejemplos de entrenamiento, 15.680 de validación y 12.217 de test (la propia model card advierte que las particiones son aproximadas y no suman el total del dataset). Los dominios declarados son noticias, contenido generado por usuarios y corpus de investigación. No se especifica el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo RLHF, DPO u otra etapa de alineamiento; en un modelo de clasificación de tokens estas etapas no son habituales. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento de entidades nombradas en inglés con 36 etiquetas BIO sobre 18 categorías (persona, organización, localización geopolítica, fecha, dinero, entre otras).
- Clasificación a nivel de token y de secuencia, adecuada para NER a nivel de frase y de documento.
- Extracción de información estructurada a partir de texto no estructurado.
- Etiquetado de entidades para indexación semántica y búsqueda.
- Base para construcción de grafos de conocimiento mediante la vinculación de entidades ORG, PERSON y GPE.
- Punto de partida para fine-tuning en dominios específicos (médico, legal, financiero) o para entidades personalizadas.
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe: no; solo inglés.

## Casos de uso

- Extracción de información en noticias: procesar titulares y cuerpos de artículo para poblar bases de datos con personas, organizaciones, localizaciones y fechas; el tamaño de 9,5 M de parámetros permite procesar grandes volúmenes por lotes en CPU sin GPU dedicada.
- Enriquecimiento de motores de búsqueda: indexar documentos por entidades reconocidas para permitir consultas del tipo "artículos que mencionan una organización concreta en una fecha determinada", usando la salida BIO como campo estructurado del índice.
- Construcción de grafos de conocimiento: extraer tripletas sujeto-relación-objeto a partir de las entidades detectadas y combinarlas con un extractor de relaciones posterior; las etiquetas ORG, PERSON y GPE cubren las entidades más frecuentes en este tipo de grafos.
- Preprocesamiento para chatbots y asistentes: identificar entidades en la consulta del usuario (fechas, localizaciones, organizaciones) antes de pasarla a un modelo generativo o a un sistema de recuperación, reduciendo la carga del modelo principal.
- Anonimización y cumplimiento normativo: detectar entidades de tipo PERSON y GPE en textos para su seudonimización o redacción previa a almacenamiento, con la ventaja de que el modelo puede ejecutarse en local sin enviar datos a servicios externos.
- Análisis de documentos financieros y legales: adaptar mediante fine-tuning las etiquetas a importes, entidades reguladas o partes contractuales; la licencia Apache-2.0 permite uso comercial y modificación sin restricciones de copyleft.
- Etiquetado de corpus para investigación en PLN: generar anotaciones automáticas de entidades sobre corpus de investigación que después se revisan manualmente, aprovechando el bajo coste computacional del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara métricas de precisión, recall, F1 y accuracy como campos de metadatos, pero no incluye valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; el repositorio ocupa 0,0 GB y la model card indica unos 50 MB de pesos, por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: no requiere GPU; funciona en CPU para inferencia en tiempo real. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) ofrece latencia muy baja, aunque no es necesaria.
- Cabe en GPU consumer: sí, en todas, incluidas las de gama baja y sistemas integrados.
- Opciones de despliegue: transformers (AutoModelForTokenClassification), pipeline de token-classification; también es compatible con endpoints de Hugging Face según los tags. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI en la información disponible, aunque el repositorio lo mantiene el proyecto vLLM para sus pruebas de CI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| NeuroBERT-NER (este) | 9,53 M | no disponible | Inglés | Apache-2.0 | NER con 36 etiquetas BIO; sin benchmarks publicados |
| BERT-base-NER (dslim) | ~110 M | 512 tokens | Inglés | MIT | NER con 4 categorías (PER, LOC, ORG, MISC); ampliamente usado |
| DistilBERT-NER | ~66 M | 512 tokens | Inglés | Apache-2.0 | NER ligero destilado de BERT; menor coste que BERT-base |
| spaCy NER (modelos en_core_web) | variable | dependiente del pipeline | Inglés y otros | MIT | Pipeline industrial con NER integrado; no es un modelo aislado de Hugging Face |

La comparación se limita a características estructurales: no hay datos de rendimiento publicados para NeuroBERT-NER que permitan contrastar F1 con las alternativas. Su ventaja principal es el tamaño (una décima parte de BERT-base-NER) y el mayor número de categorías de entidad; su desventaja es la ausencia de benchmarks y de documentación técnica detallada.

## Limitaciones y advertencias

- Solo admite inglés de forma nativa; no hay soporte multilingüe.
- Sesgo de dominio: el entrenamiento sobre `boltuix/conll2025-ner` puede estar sesgado hacia noticias y texto formal, con rendimiento inferior en redes sociales, texto informal o código mezclado.
- Generalización limitada en entidades de baja frecuencia o altamente dependientes del contexto que no estén bien representadas en el dataset.
- Riesgo de alucinación de entidades: como todo modelo de clasificación, puede etiquetar fragmentos como entidades cuando no lo son o asignar categorías incorrectas; se recomienda umbral de confianza y validación posterior en producción.
- La model card contiene marcadores de posición sin resolver (enlaces de dataset y repositorio, demo "coming soon") y una nota que advierte de que el enlace al dataset es un placeholder; la documentación debe tratarse con cautela.
- Las particiones del dataset declaradas son aproximadas y no suman el total indicado, según la propia model card.
- No se publican métricas de evaluación, por lo que no es posible verificar la calidad declarada ("high-accuracy" en los tags) con datos objetivos.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con atribución; no impone restricciones de copyleft.
- El repositorio es una copia de `boltuix/NeuroBERT-NER` en el commit `fdc13cd`, mantenida por vLLM para CI; la versión canónica está en la cuenta personal del autor original.

## Enlaces

- Modelo en Hugging Face (copia vLLM): https://huggingface.co/vllm-project/NeuroBERT-NER
- Modelo original: https://huggingface.co/boltuix/NeuroBERT-NER
- Modelo base: https://huggingface.co/boltuix/NeuroBERT-Mini
- Dataset: https://huggingface.co/datasets/boltuix/conll2025-ner
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Demo: no disponible (la model card indica "coming soon")
