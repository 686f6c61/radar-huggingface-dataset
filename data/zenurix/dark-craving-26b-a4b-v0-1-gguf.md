# Zenurix/Dark-Craving-26B-A4B-v0.1-GGUF

## Resumen

Dark-Craving-26B-A4B-v0.1-GGUF es una cuantizacion en formato GGUF del modelo Dark-Craving-26B-A4B-v0.1, desarrollado por el usuario Zenurix a partir del modelo base de ReadyArt. Se trata de un modelo de generacion de texto orientado a roleplay conversacional y contenido para adultos (ERP), con un enfoque deliberadamente "unaligned" respecto a los filtros de seguridad habituales. El modelo cuenta con aproximadamente 25.230 millones de parametros totales, lo que lo situa en la categoria de modelos de ~26B, y esta disenado para conversaciones multi-turno de caracter explicito.

La relevancia de esta ficha reside en su caracter de cuantizacion practica: al distribuirse en GGUF, el modelo puede ejecutarse en hardware de consumo mediante llama.cpp u otros runners compatibles, algo imposible con los pesos completos. El repositorio ocupa 136,5 GB, lo que refleja la presencia de multiples niveles de cuantizacion. El modelo solo declara soporte para ingles y su pipeline es text-generation.

Es importante senalar que se trata de un modelo con etiquetas explicitas de contenido NSFW, no apto para todas las audiencias, y que su uso esta restringido a contextos donde ese tipo de contenido sea legal y apropiado. La licencia declarada es Apache 2.0, aunque el caracter "unaligned" del modelo implica consideraciones adicionales de responsabilidad para el desplegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar detalles) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | no disponible (el sufijo A4B sugiere posible arquitectura MoE, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples niveles incluidos en el repo de 136,5 GB; niveles concretos no disponibles) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizacion); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la informacion proporcionada. El nombre del modelo incluye el sufijo "A4B", que en la convencion habitual de modelos MoE (como los de la familia Qwen) indica parametros activos, pero este dato no esta confirmado en la documentacion disponible. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o fine-tuning supervisado.

La model card del autor se limita practicamente a metadatos y a una presentacion visual estilizada, sin seccion tecnica sobre entrenamiento. Lo unico confirmable es que se trata de una cuantizacion del modelo base ReadyArt/Dark-Craving-26B-A4B-v0.1, por lo que las caracteristicas de arquitectura y entrenamiento heredan las del original, que no estan documentadas en la informacion disponible. No se han identificado innovaciones tecnicas declaradas (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa interactiva.
- Contenido explicito para adultos (ERP), incluyendo escenarios romanticos y sexuales.
- Modo "unaligned": menor rechazo a peticiones que otros modelos filtrarian, incluyendo tematicas maduras.
- Instrucciones conversacionales (tag instruct) y formato de dialogo.
- Generacion creativa de ficcion y descripciones detalladas.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Roleplay conversacional de larga duracion: el modelo esta afinado para mantener personajes y contexto a lo largo de sesiones multi-turno, lo que lo hace adecuado para plataformas de ficcion interactiva y compania virtual.
- Escritura creativa de ficcion adulta: util para autores que necesitan generar borradores de narrativa explicita con coherencia de personajes y tono.
- Simulacion de dialogos para guiones: permite explorar variantes de escenas y dialogos en contextos de escritura de guiones para medios para adultos.
- Prototipado de chatbots de rol: desarrolladores pueden desplegarlo en local con llama.cpp para experimentar con personalidades y sistemas de prompt sin depender de APIs externas.
- Investigacion sobre alineamiento y seguridad: sirve como caso de estudio de modelos "unaligned" para evaluar comportamiento, sesgos y riesgos en entornos controlados de laboratorio.
- Generacion de contenido para comunidades de nicho: integrable en aplicaciones de entretenimiento para adultos que requieran generacion de texto en ingles, siempre con verificacion de edad y cumplimiento legal.
- Evaluacion comparativa de cuantizaciones GGUF: permite medir degradacion de calidad frente al modelo base en tareas de roleplay, util para quienes optimizan despliegues en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; para un modelo de ~25B en GGUF, las cuantizaciones de 4 bits suelen requerir del orden de 14-16 GB, las de 5-6 bits en torno a 18-22 GB y las de 8 bits alrededor de 26-28 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) podria ejecutar cuantizaciones de 4-5 bits; para cuantizaciones mayores se requeririan A100 40/80 GB o H100.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 con cuantizaciones bajas, sujeto a confirmacion empirica.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Dark-Craving-26B-A4B-v0.1-GGUF | ~25,2B | no disponible | Apache 2.0 | Roleplay/ERP sin alinear, solo ingles |
| Modelos de rol de ~20-30B de la comunidad (p. ej. variantes de Mistral/Mixtral fine-tuneadas) | variable | variable | variable | Roleplay y narrativa, habitualmente multilingues |
| Modelos base de ~24-27B (p. ej. Gemma 2 27B, Qwen de ~30B) | ~24-30B | 8K-128K segun modelo | licencias permisivas o custom | Uso general, alineados |

La comparacion cuantitativa con alternativas concretas no esta disponible en la informacion proporcionada; los datos de la tabla para modelos alternativos son orientativos de categoria y no provienen de una evaluacion directa.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo esta marcado como no apto para todas las audiencias; no debe desplegarse en entornos sin control de edad ni en productos dirigidos al publico general.
- Modelo "unaligned": puede generar contenido que viole politicas de plataformas, terminos de servicio de APIs o normativas locales; el desplegador asume la responsabilidad legal.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, personajes o detalles sin base; no es fiable para tareas factuales.
- Limitacion idiomatica: solo declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Contexto: longitud de contexto no disponible, lo que impide planificar sesiones largas con garantias.
- Licencia: Apache 2.0 permite uso comercial, pero las restricciones legales sobre contenido adulto (verificacion de edad, jurisdiccion) prevalecen sobre la licencia tecnica.
- Datos de entrenamiento y sesgos: no documentados; no es posible evaluar sesgos conocidos ni la composicion del dataset.
- Cuantizacion: al ser un GGUF, puede existir degradacion de calidad respecto al modelo base, especialmente en cuantizaciones bajas; no se han publicado evaluaciones al respecto.
- Popularidad muy baja (107 descargas, 0 likes) y actualizacion unica: sin senales de mantenimiento o soporte por parte del autor.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/Zenurix/Dark-Craving-26B-A4B-v0.1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v0.1
- Perfil del autor: https://huggingface.co/Zenurix
