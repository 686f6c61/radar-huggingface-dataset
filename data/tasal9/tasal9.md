# tasal9/tasal9

# tasal9/tasal9 — perfil de investigacion y ecosistema ZamAI para el pastun

## Resumen

tasal9/tasal9 no es un modelo de lenguaje con pesos publicados, sino el repositorio de perfil de Tasal, investigador en IA y procesamiento de lenguaje natural, alojado en Hugging Face. Su contenido es una model card de presentacion que describe ZamAI, una iniciativa de codigo abierto cuyo objetivo es construir una pila completa de IA para el pastun (pashto), una lengua hablada por entre 60 y 80 millones de personas y con una representacion muy escasa en la investigacion en PLN. El repositorio no publica pesos, tokenizador, configuracion de inferencia ni resultados de evaluacion: registra 0 descargas y 0 "likes", y no declara licencia, idiomas ni pipeline.

El interes de esta ficha reside, por tanto, en el mapa de ecosistema que anuncia el autor y no en un artefacto desplegable. Segun la model card, ZamAI incluye un modelo de chat basado en LLaMA-3 8B ajustado para pastun (ZamAI-LIama3-Pashto), embeddings multilingues para pastun, arabe, persa, urdu e ingles (Multilingual-ZamAI-Embeddings), traduccion pastun-ingles basada en NLLB (ZamAI-Pashto-Translator-FacebookNLB-ps-en), reconocimiento de voz con Whisper v3 (ZamAI-Whisper-v3-Pashto), clasificacion de sentimiento con RoBERTa (ZamAI-Sentiment-Pashto) y dos conjuntos de datos en pastun, uno de ellos descrito como de escala "1M-10M" y otro con mas de 18.000 descargas declaradas.

La relevancia actual del proyecto es la de cualquier iniciativa de lenguas con pocos recursos: cubrir funciones basicas (chat, busqueda semantica, traduccion, voz, analisis de opinion) en un idioma que los modelos generalistas atienden de forma marginal. Conviene subrayar que la informacion disponible no permite verificar ninguna capacidad tecnica del modelo de 8B ni de los demas componentes: no hay fichas detalladas, benchmarks, ni licencias declaradas en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (este repositorio es un perfil de autor; no contiene pesos ni definicion de arquitectura) |
| Parametros totales | no disponible (la model card menciona un modelo de chat basado en LLaMA-3 8B, pero corresponde a otro repositorio) |
| Parametros activos | no aplica / no disponible (no se declara que ningun componente sea de tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en esta ficha; el ecosistema ZamAI declara pastun, arabe, persa, urdu e ingles para los embeddings, y pastun e ingles para traduccion |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos en este repositorio) |
| Tipo de repositorio | model card de perfil de autor (no es un checkpoint) |
| Autor | tasal9 |
| Organizacion declarada | ZamAI-Pashto |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Etiquetas | region:us |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura del repositorio tasal9/tasal9 porque este no implementa ningun modelo. Lo unico documentado es la composicion del ecosistema ZamAI: un modelo de chat descrito como "LLaMA-3 8B fine-tuned for Pashto", unos embeddings multilingues que cubren pastun, arabe, persa, urdu e ingles, un traductor pastun-ingles construido sobre NLLB de Facebook, un sistema de reconocimiento automatico del habla basado en Whisper v3, un clasificador de sentimiento basado en RoBERTa y dos conjuntos de datos en pastun (uno con mas de 18.000 descargas declaradas y otro descrito con una escala de 1M a 10M de elementos).

No hay datos sobre numero de tokens de entrenamiento, composicion del corpus, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas como atencion lineal o decodificacion especulativa. Tampoco se especifica si el ajuste del modelo de 8B se hizo por instrucciones, por continuacion de preentrenamiento o mediante adaptadores. Todos estos extremos deben considerarse no disponibles.

## Capacidades

- Generacion de texto conversacional en pastun: atribuida al repositorio ZamAI-LIama3-Pashto, descrito como un LLaMA-3 8B ajustado para ese idioma. No hay ficha tecnica que detalle el alcance real.
- Embeddings multilingues: representaciones vectoriales declaradas para pastun, arabe, persa, urdu e ingles, utiles para busqueda semantica y recuperacion.
- Traduccion automatica pastun-ingles: componente basado en NLLB, segun la model card.
- Reconocimiento automatico del habla en pastun: componente basado en Whisper v3.
- Clasificacion de sentimiento en pastun: clasificador basado en RoBERTa.
- Publicacion de datos: dos conjuntos de datos en pastun, uno de ellos descrito como de escala 1M-10M y otro con mas de 18.000 descargas declaradas.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de vision, audio de entrada en el LLM o modo de razonamiento explicito: no disponible (no documentado).
- Capacidades especiales adicionales: no disponible.

## Casos de uso

Los siguientes escenarios corresponden al ecosistema ZamAI descrito en la model card, no al repositorio tasal9/tasal9, que no es desplegable por si mismo.

- Atencion al cliente en pastun: el modelo de chat de 8B permitiria construir un asistente conversacional en pastun para operadores de telefonia, banca o servicios publicos en Afganistan y en la diaspora. Es adecuado porque los asistentes generalistas rara vez cubren este idioma con fluidez.
- Traduccion de documentacion oficial y humanitaria: el componente basado en NLLB (ps-en) serviria para traducir avisos, formularios y material sanitario entre pastun e ingles en contextos de cooperacion internacional.
- Transcripcion de audio en pastun: el componente Whisper v3 permitiria transcribir entrevistas, programas de radio o testimonios para su posterior analisis textual o archivado.
- Analisis de sentimiento en redes sociales: el clasificador RoBERTa permitiria monitorizar opinion publica en pastun sobre productos, servicios o cuestiones sociales.
- Recuperacion aumentada (RAG) sobre corpus en pastun: los embeddings multilingues ps/ar/fa/ur/en permitirian indexar y recuperar documentos en pastun para responder preguntas con citas de la fuente.
- Ajuste fino y evaluacion academica: los conjuntos de datos publicados (incluido el descrito como de escala 1M-10M) sirven como material base para entrenar o evaluar otros modelos en pastun, un recurso escaso en la literatura.
- Investigacion sobre transferencia entre lenguas relacionadas: disponer de embeddings que cubren pastun, persa, urdu y arabe facilita estudios de transferencia entre idiomas de la misma familia y alfabeto.
- Moderacion de contenido en plataformas en pastun: combinando clasificacion de sentimiento y transcripcion se podria prefiltrar contenido de riesgo en comunidades donde no existen herramientas comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones de traduccion (BLEU, chrF), tasas de error de palabra (WER) para el componente de voz ni metricas de recuperacion para los embeddings. No se debe asumir ningun nivel de rendimiento a partir de la descripcion cualitativa de la model card.

## Requisitos de hardware

- Este repositorio no requiere hardware: no contiene pesos ni codigo de inferencia.
- Para el unico componente con tamano declarado (ZamAI-LIama3-Pashto, LLaMA-3 8B), las estimaciones derivadas del numero de parametros son: aproximadamente 16-18 GB de VRAM en bf16/fp16, 9-10 GB en cuantizacion int8 y 5-6 GB en cuantizacion de 4 bits. Son estimaciones de ingenieria, no mediciones publicadas.
- GPU recomendadas para el modelo de 8B en precision completa o media: A100 40/80 GB, H100, L40S o cualquier GPU con 24 GB o mas (RTX 3090, RTX 4090).
- Viabilidad en GPU de consumo: si, con cuantizacion de 4 bits cabria en tarjetas de 8 GB o mas; en bf16 necesitaria 24 GB.
- Opciones de despliegue habituales para un modelo de esa familia: vLLM, TGI, llama.cpp, Ollama y transformers. No se documenta soporte especifico en la informacion disponible.
- Latencia y throughput: no disponible. No hay mediciones publicadas para ningun componente del ecosistema.
- El resto de componentes (embeddings, NLLB, Whisper v3, clasificador RoBERTa) tienen requisitos no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de especificaciones verificables de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. La tabla siguiente situa el unico modelo de lenguaje del ecosistema y las familias que suelen considerarse alternativas generalistas para escenarios multilingues y de bajos recursos, dejando constancia de que sus datos no proceden de la informacion facilitada.

| Modelo | Tipo de alternativa | Parametros | Contexto | Licencia | Cobertura de pastun declarada | Disponibilidad |
|---|---|---|---|---|---|---|
| ZamAI-LIama3-Pashto | LLM de chat ajustado para pastun | 8B (base LLaMA-3, segun la model card) | no disponible | no disponible | declarada por el autor | repositorio en Hugging Face |
| tasal9/tasal9 | perfil de autor, no es un modelo | no disponible | no disponible | no disponible | no aplica | repositorio en Hugging Face |
| Familias multilingues generalistas de ~7-9B (por ejemplo Llama, Qwen, Aya o Gemma) | alternativas de uso comun en escenarios multilingues | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible |

No hay datos de benchmarks que permitan afirmar que el modelo ajustado para pastun supere o iguale a una alternativa generalista en tareas en ese idioma.

## Limitaciones y advertencias

- El repositorio tasal9/tasal9 no contiene pesos ni artefactos ejecutables: no puede desplegarse ni evaluarse directamente.
- No se declara licencia, ni en este repositorio ni en los componentes descritos. Sin licencia explicita no puede asumirse permiso para uso comercial.
- El modelo de chat se apoya en LLaMA-3, cuya licencia original impone condiciones propias de uso; al no declararse la licencia del ajuste, la situacion legal es indeterminada.
- Ausencia total de benchmarks: no existe evidencia publicada de calidad, y la model card solo ofrece descripciones cualitativas.
- Validacion comunitaria nula en este repositorio (0 descargas, 0 likes), lo que dificulta detectar errores o problemas de calidad.
- Los metadatos indican una fecha de creacion de 2026-09-16, posterior a la fecha habitual de consulta; conviene tratar esa marca temporal con cautela.
- No se detallan sesgos, tasas de alucinacion ni comportamientos indeseados del modelo de chat. En lenguas con pocos recursos, y con corpus de entrenamiento limitados, el riesgo de alucinacion y de sesgos de representacion es estructuralmente alto.
- Cobertura idiomatica limitada: el ecosistema se centra en pastun, con soporte declarado de arabe, persa, urdu e ingles solo para los embeddings.
- No se documentan longitudes de contexto, por lo que no puede planificarse su uso en tareas de contexto largo.
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con el proyecto (los resultados obtenidos trataban sobre estructuras de cubiertas de madera), de modo que no existe prensa, paper ni demo externa que respalde las afirmaciones de la model card.
- Los conjuntos de datos publicados no incluyen en la informacion disponible detalles de procedencia, consentimiento o licencia de los textos, lo que es un riesgo relevante en produccion.

## Enlaces

- Repositorio del perfil: https://huggingface.co/tasal9/tasal9
- Organizacion ZamAI-Pashto: https://huggingface.co/ZamAI-Pashto
- ZamAI-LIama3-Pashto (LLaMA-3 8B ajustado para pastun): https://huggingface.co/tasal9/ZamAI-LIama3-Pashto
- Multilingual-ZamAI-Embeddings (ps/ar/fa/ur/en): https://huggingface.co/tasal9/Multilingual-ZamAI-Embeddings
- ZamAI-Pashto-Translator (NLLB ps-en): https://huggingface.co/tasal9/ZamAI-Pashto-Translator-FacebookNLB-ps-en
- ZamAI-Whisper-v3-Pashto (ASR): https://huggingface.co/tasal9/ZamAI-Whisper-v3-Pashto
- ZamAI-Sentiment-Pashto (RoBERTa): https://huggingface.co/tasal9/ZamAI-Sentiment-Pashto
- Conjunto de datos ZamAi-Pashto-Datasets-V2: https://huggingface.co/datasets/tasal9/ZamAi-Pashto-Datasets-V2
- Conjunto de datos ZamAI-Pashto-Mega-Dataset: https://huggingface.co/datasets/tasal9/ZamAI-Pashto-Mega-Dataset

No se han encontrado papers, articulos de blog, repositorios de codigo ni demos adicionales en la busqueda web realizada.
