# toinfinityand/Forgotten-Abomination-12B-v4.0-Q4_K_M-GGUF

## Resumen

Forgotten-Abomination-12B-v4.0-Q4_K_M-GGUF es una conversión a formato GGUF del modelo original ReadyArt/Forgotten-Abomination-12B-v4.0, realizada por el usuario toinfinityand mediante la herramienta gguf-my-repo de llama.cpp. El modelo base es un merge de 12 247 782 400 parámetros (aproximadamente 12,25 mil millones) orientado explícitamente a roleplay, contenido erótico (ERP) y conversación sin alineación de seguridad. Los tags del repositorio indican que se trata de un modelo "unaligned" y "dangerous", es decir, sin los filtros habituales de contenido de los modelos instructivos convencionales.

La relevancia de este modelo radica en su disponibilidad en formato GGUF cuantizado (Q4_K_M), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp, Ollama u otras herramientas compatibles. Es una opción para desarrolladores e investigadores interesados en experimentar con modelos de rol sin restricciones de contenido, aunque su uso conlleva riesgos importantes de sesgo y generación de material inapropiado. No se dispone de información oficial sobre la arquitectura interna ni sobre el proceso de entrenamiento más allá de que es un merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo merge, arquitectura interna desconocida) |
| Parametros totales | 12 247 782 400 (12,25 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible oficialmente; fuentes externas reportan 33K tokens (Antbase) o 1000K (LLM-Explorer), sin confirmar |
| Tipos de cuantizacion | Q4_K_M (este repositorio); pueden existir otras cuantizaciones en repositorios del autor original |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo .gguf) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura del modelo original ReadyArt/Forgotten-Abomination-12B-v4.0. La model card del repositorio GGUF indica que el modelo base es un merge (`base_model_relation: merge`), lo que sugiere que se combinan pesos de varios modelos preentrenados, pero no se especifica que arquitecturas concretas se fusionaron ni con que metodologia. Tampoco se dispone de datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. La unica informacion fiable es que el modelo fue convertido a GGUF con la cuantizacion Q4_K_M mediante llama.cpp, y que su tamano de parametros es de aproximadamente 12,25 mil millones.

Dada la naturaleza del modelo (etiquetado como "unaligned", "dangerous", "NSFW"), es probable que se trate de un modelo de lenguaje transformer decoder con capacidad de generacion de texto conversacional, pero esto es una inferencia no confirmada. Se recomienda consultar la model card del repositorio original para obtener datos tecnicos adicionales si estan disponibles.

## Capacidades

- Generacion de texto conversacional en ingles, especialmente orientada a roleplay y dialogos de ficcion.
- Soporte de contenido explicito y erotico (ERP) sin filtros de moderacion.
- Capacidad de mantener conversaciones multi-turno, aunque la longitud de contexto efectiva no esta confirmada.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se ha verificado capacidad multilingue; el idioma declarado es exclusivamente ingles.
- El modelo no presenta alineacion de seguridad, por lo que puede generar respuestas que otros modelos rechazarian.

## Casos de uso

- Escritura creativa para adultos: el modelo puede generar narrativas eroticas o escenas de ficcion explicita bajo demanda, util para autores que necesitan inspiracion o borradores rapidos. Su falta de filtros permite explorar temas tabu sin restricciones.
- Simulacion de personajes en juegos de rol: en entornos de roleplay por texto, el modelo puede interpretar personajes complejos y mantener coherencia conversacional durante sesiones largas, siempre que el contexto lo permita.
- Generacion de dialogos para guiones o novelas visuales: desarrolladores de juegos independientes pueden usarlo para crear interacciones entre personajes con contenido adulto, evitando los limites de los modelos comerciales.
- Experimentacion en investigacion sobre alineacion y sesgos: al ser un modelo sin alineacion, sirve como caso de estudio para analizar comportamientos no deseados, sesgos de genero o toxicidad en modelos de lenguaje grandes.
- Creacion de chatbots de compania con personalidad definida: para usuarios que buscan asistentes conversacionales sin censura, el modelo puede adaptarse a distintos arquetipos de personaje mediante prompts cuidadosamente disenados.
- Pruebas de estres de infraestructura local: al ser un GGUF de 12B cuantizado, es adecuado para validar despliegues en hardware modesto (GPUs de 8-12 GB) y medir latencia y throughput en entornos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos oficiales de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su version base. Se recomienda no asumir ningun nivel de rendimiento academico o de codigo sin evidencia.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF Q4_K_M pesa aproximadamente 7,5 GB, por lo que se necesita al menos 8 GB de VRAM para cargar el modelo completo. Con cuantizaciones mas agresivas (Q3, Q2) podria caber en 6 GB, pero no se ofrecen en este repositorio.
- GPU recomendadas: tarjetas con 8-12 GB de VRAM como NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o RTX 4070 (12 GB) son suficientes para inferencia local. En GPUs de 24 GB (RTX 3090/4090) se podria ejecutar con contexto largo y mayor velocidad.
- Compatibilidad con hardware consumer: si, el modelo esta disenado para ejecutarse en GPUs de consumo mediante llama.cpp o herramientas derivadas como Ollama.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. Tambien puede usarse con vLLM si se convierte a otro formato, aunque no es el flujo habitual.
- Latencia y throughput: no se han publicado mediciones oficiales. En una RTX 3060 de 12 GB, se puede esperar una velocidad de generacion de entre 10 y 20 tokens por segundo con Q4_K_M, pero es una estimacion orientativa.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. El modelo es un merge sin documentacion publica sobre su composicion, y no hay datos de benchmarks que permitan contrastarlo con alternativas como Mistral-7B, Llama-2-13B o modelos especializados en roleplay como MythoMax o Noromaid. La unica diferencia objetiva es su tamano (12,25 B) y su licencia Apache 2.0, pero sin datos de rendimiento no es posible realizar una comparacion tecnica seria. Se indica "no disponible".

## Limitaciones y advertencias

- Contenido explicito y peligroso: el modelo esta etiquetado como "NSFW", "explicit", "dangerous" y "unaligned". Puede generar instrucciones para actividades ilegales, violencia, contenido sexual extremo o discursos de odio. No debe usarse en aplicaciones publicas sin moderacion rigurosa.
- Sesgos y alucinaciones: al carecer de alineacion, es probable que presente sesgos de genero, raza o ideologia de forma acentuada, y que alucine hechos o informacion con mayor frecuencia que modelos instructivos.
- Longitud de contexto no verificada: las fuentes externas discrepan (33K vs 1000K) y no hay confirmacion oficial. En la practica, el contexto efectivo puede ser menor debido a la cuantizacion y a la arquitectura del merge.
- Idioma limitado: solo se ha declarado soporte para ingles. El rendimiento en otros idiomas es desconocido y probablemente deficiente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de responsabilidad legal por el contenido generado. El usuario final es responsable del cumplimiento normativo.
- Sin garantias de calidad: al ser un modelo sin documentacion tecnica, no se puede asegurar su estabilidad, coherencia ni adecuacion para tareas profesionales.
- Riesgo para menores: el contenido explicito hace que el modelo no sea apto para menores de edad ni para entornos no supervisados.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/toinfinityand/Forgotten-Abomination-12B-v4.0-Q4_K_M-GGUF
- Modelo base (original): https://huggingface.co/ReadyArt/Forgotten-Abomination-12B-v4.0
- Version Q5_K_M del mismo modelo: https://huggingface.co/ReadyArt/Forgotten-Abomination-12B-v4.0-Q5_K_M-GGUF
- Ficha en Antbase (fuente externa): https://antbase.ai/models/forgotten-abomination-12b-v4-0
- Ficha en LLM Explorer (fuente externa): https://llm-explorer.com/model/ReadyArt%2FForgotten-Abomination-12B-v4.0,4MG5NpzKU0fHCODMuhCPi0
