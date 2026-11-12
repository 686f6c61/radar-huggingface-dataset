# stanfordnlp/stanza-sl

## Resumen

Stanza-sl es el paquete de modelos lingüísticos de Stanza para el esloveno (código ISO `sl`), desarrollado por el Stanford NLP Group. Stanza es una colección de herramientas para el análisis lingüístico de texto en más de 70 idiomas, y este repositorio contiene los modelos entrenados específicamente para el procesamiento del esloveno: tokenización, análisis morfológico, lematización, etiquetado POS, análisis de dependencias y reconocimiento de entidades nombradas.

El repositorio se publica como un artefacto de la librería Stanza (no como un modelo único de Hugging Face Transformers), por lo que la etiqueta `token-classification` refleja únicamente el pipeline de Hugging Face bajo el que se indexa, no una arquitectura de clasificación de tokens monolítica. Internamente, Stanza combina redes neuronales recurrentes con embeddings contextuales (habitualmente vectores de fastText y, según la versión, representaciones derivadas de transformers) para cada una de las tareas del pipeline.

Es relevante para quien necesite un pipeline NLP completo y listo para producción en esloveno con una licencia permisiva (Apache 2.0), sin tener que entrenar ni ensamblar componentes individuales. El tamaño del repositorio (8,7 GB) refleja el conjunto de pesos de todos los procesadores del pipeline, no un único modelo de ese tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline Stanza basado en redes neuronales recurrentes (BiLSTM) con embeddings; componentes por tarea (tokenizador, lematizador, tagger POS, parser de dependencias, NER) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa documentos completos por frases, sin límite fijo documentado) |
| Tipos de cuantizacion | no disponible (pesos PyTorch nativos; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | esloveno (`sl`) |
| Licencia | Apache 2.0 (con datos externos del lematizador bajo CC BY-SA 4.0, ver limitaciones) |
| Formato de pesos | artefactos PyTorch propios de Stanza (`.pt`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

Stanza implementa un pipeline lingüístico en cascada donde cada tarea se resuelve con una red neuronal entrenada de forma supervisada sobre corpus anotados. El tokenizador y el segmentador de frases emplean redes recurrentes sobre caracteres; el etiquetador POS, el lematizador, el parser de dependencias y el reconocedor de entidades usan BiLSTM con embeddings de palabras y de caracteres, siguiendo el linaje del Stanford CoreNLP neural pipeline. Los embeddings de palabra combinan vectores preentrenados (fastText) con representaciones contextuales en las versiones más recientes del paquete.

El entrenamiento se realiza sobre treebanks y corpus anotados del esloveno (SSJ, SST entre otros, según la configuración estándar de Stanza) para las tareas sintácticas y morfológicas. El lematizador incorpora además un diccionario derivado del léxico morfológico Sloleks 3.1 (CLARIN.SI), lo que amplía la cobertura de lemas más allá de las formas vistas en entrenamiento. La model card no detalla el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO (no aplica en un modelo de análisis lingüístico).

## Capacidades

- Tokenización y segmentación de frases en esloveno.
- Etiquetado morfosintáctico (POS) con el inventario de etiquetas Universal Dependencies.
- Lematización, apoyada en el diccionario Sloleks 3.1.
- Análisis de dependencias sintácticas (árboles UD).
- Reconocimiento de entidades nombradas (NER).
- Procesamiento por lotes de documentos completos mediante la API de Stanza.
- Integración con el ecosistema Stanza (`stanza.Pipeline`) y con CoreNLP Client.
- No soporta tool calling, function calling ni razonamiento agéntico: es un pipeline de análisis, no un modelo generativo.
- Capacidad multilingüe limitada al esloveno en este repositorio (Stanza ofrece paquetes equivalentes para otros idiomas).

## Casos de uso

- **Preprocesado para pipelines de NLP en esloveno**: tokenización, lematización y POS tagging como paso previo a búsqueda, indexación o entrenamiento de modelos posteriores. La lematización con Sloleks mejora la cobertura léxica frente a un lematizador puramente estadístico.
- **Análisis sintáctico de corpus**: generación de árboles de dependencias en formato CoNLL-U para investigación lingüística, anotación de treebanks o estudios de sintaxis del esloveno.
- **Extracción de entidades en documentos**: NER sobre textos administrativos, noticias o informes para poblar bases de conocimiento o sistemas de extracción de información.
- **Enriquecimiento de motores de búsqueda**: indexación por lema y etiqueta POS para mejorar la recuperación en esloveno, donde la morfología flexiva es rica y la búsqueda por forma superficial pierde recall.
- **Anonimización y análisis de textos legales o clínicos**: detección de entidades (personas, organizaciones, lugares) como paso previo a la seudonimización, usando el pipeline NER de Stanza.
- **Docencia y herramientas lingüísticas**: análisis gramatical interactivo de frases eslovenas (POS, dependencias, lemas) para aplicaciones educativas.
- **Evaluación de traducción automática**: análisis morfosintáctico de hipótesis y referencias para métricas que dependen de lemas o etiquetas POS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio completo ocupa 8,7 GB en disco, pero la carga en memoria es por procesador y por frase, por lo que la VRAM real depende de qué componentes se activen.
- GPU: funciona en CPU sin problema para volúmenes moderados; para lotes grandes se recomienda cualquier GPU con al menos 8 GB (RTX 3060/4060 en adelante). Con A100/H100 el cuello de botella pasa a ser el preprocesado de entrada, no la memoria.
- Cabe en GPU de consumo: sí, en la práctica cualquier GPU consumer moderna es suficiente; incluso CPU es viable para uso interactivo.
- Despliegue: librería Stanza (Python), servidor CoreNLP, o integración en pipelines propios. No hay soporte nativo de vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del número de procesadores activados.

## Comparativa con modelos similares

| Modelo | Idioma | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|
| stanfordnlp/stanza-sl | Esloveno | Tokenización, POS, lemas, dependencias, NER | Apache 2.0 (con datos CC BY-SA 4.0 en lematizador) | Hugging Face / Stanza |
| spaCy `sl_core_news` (si existe para esloveno) | Esloveno | Tokenización, POS, lemas, dependencias, NER | MIT | spaCy / Explosion |
| UDPipe (modelo esloveno) | Esloveno | Tokenización, POS, lemas, dependencias | CC BY-NC-SA (modelos UD) | LINDAT / UFAL |
| Stanza multilingüe (otros paquetes) | Varios | Mismas tareas | Apache 2.0 | Hugging Face / Stanza |

No se dispone de cifras comparativas de rendimiento entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- El repositorio solo cubre esloveno; no sirve para otros idiomas.
- Es un pipeline de análisis, no un modelo generativo: no produce texto, no razona y no soporta instrucciones ni tool calling.
- El lematizador incorpora datos de Sloleks 3.1 bajo CC BY-SA 4.0; aunque el paquete se distribuye como Apache 2.0, el uso de esos datos puede imponer obligaciones de atribución y compartir-igual en determinados escenarios. Conviene revisar la nota del autor en `combined_models.html#sloleks` antes de un uso comercial estricto.
- Riesgo de errores en texto ruidoso (redes sociales, OCR, dominios muy distintos del corpus de entrenamiento), habitual en modelos supervisados.
- Sin métricas publicadas en la model card, no es posible verificar el rendimiento esperado sin evaluar en el dominio objetivo.
- El tamaño del repositorio (8,7 GB) hace poco práctico su uso en entornos con almacenamiento limitado si solo se necesita una tarea concreta.
- La model card se genera automáticamente; la información sobre entrenamiento es escasa y no incluye detalles de hiperparámetros ni composición exacta del dataset.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordnlp/stanza-sl
- Sitio web de Stanza: https://stanfordnlp.github.io/stanza
- Repositorio GitHub: https://github.com/stanfordnlp/stanza
- Nota sobre modelos combinados y Sloleks: https://stanfordnlp.github.io/stanza/combined_models.html#sloleks
- Léxico Sloleks 3.1 (CLARIN.SI): http://hdl.handle.net/11356/2080
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Repositorio de preparación de modelos: https://github.com/stanfordnlp/huggingface-models
