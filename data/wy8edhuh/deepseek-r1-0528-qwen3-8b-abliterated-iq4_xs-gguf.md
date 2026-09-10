# wy8edhuh/DeepSeek-R1-0528-Qwen3-8B-abliterated-IQ4_XS-GGUF

## Resumen

DeepSeek-R1-0528-Qwen3-8B-abliterated-IQ4_XS-GGUF es una cuantización en formato GGUF publicada por el usuario wy8edhuh a partir de huihui-ai/DeepSeek-R1-0528-Qwen3-8B-abliterated. Es, por tanto, el eslabón final de una cadena de derivaciones: DeepSeek destiló su modelo de razonamiento R1-0528 sobre la arquitectura Qwen3-8B, huihui-ai aplicó después una ablación de las direcciones de rechazo (abliteration) para eliminar los mecanismos de negativa del modelo, y finalmente ese resultado se convirtió a GGUF con cuantización IQ4_XS e imatrix mediante el espacio GGUF-my-repo de ggml.ai.

El modelo tiene 8.190.735.360 parámetros (unos 8,19 mil millones), es denso y se distribuye en un único archivo de aproximadamente 4,6 GB, lo que lo sitúa en el rango de modelos ejecutables en GPU de consumo. Su interés es doble: conserva el modo de razonamiento explícito con cadenas de pensamiento de la familia R1 y, al mismo tiempo, la abliteration reduce drásticamente el filtrado de seguridad, algo que el propio autor advierte de forma explícita y desaconseja para producción o aplicaciones de cara al público.

El repositorio acumula 0 descargas y 0 likes y se creó y actualizó el 10 de septiembre de 2026, con dos minutos de diferencia entre ambos eventos: es un artefacto de publicación reciente, de autor individual y sin validación comunitaria ni resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia Qwen3-8B; el numero de capas, cabezas y tipo de atencion no se detalla en la informacion proporcionada |
| Parametros totales | 8.190.735.360 (≈8,19 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos del autor arrancan el servidor con `-c 2048` |
| Tipos de cuantizacion | IQ4_XS con imatrix (unico fichero publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (fichero `deepseek-r1-0528-qwen3-8b-abliterated-iq4_xs-imat.gguf`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer denso de 8,19 mil millones de parametros, sobre el que DeepSeek aplico un proceso de destilacion de conocimiento desde su modelo de razonamiento R1-0528 (variante de mayo de 2025). Es decir, no se trata de un modelo entrenado desde cero por el autor del repositorio, sino de un destilado ajeno, posteriormente modificado y finalmente cuantizado. La informacion proporcionada no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias.

La innovacion tecnica relevante esta en los dos ultimos pasos de la cadena. Primero, la abliteration aplicada por huihui-ai, que identifica y ortogonaliza las direcciones del espacio de activaciones responsables de las respuestas de rechazo, de modo que el modelo deja de negarse a responder a determinadas peticiones sin necesidad de reentrenar. Segundo, la cuantizacion IQ4_XS con imatrix (matriz de importancia) realizada con llama.cpp a traves del espacio GGUF-my-repo, que comprime los pesos a aproximadamente 4,5 bits por parametro preservando mejor las capas sensibles que una cuantizacion uniforme del mismo bit-width. El resultado es un fichero de 4,6 GB ejecutable en CPU y GPU de gama media, con la perdida de calidad asociada a una cuantizacion de 4 bits.

## Capacidades

- Generacion de texto conversacional multi-turno, con la plantilla de chat heredada del modelo base.
- Razonamiento explicito con cadenas de pensamiento largas, caracteristica de la familia DeepSeek-R1, lo que incrementa notablemente el numero de tokens generados por respuesta.
- Resolucion de problemas matematicos y de logica, capacidad esperada por herencia del destilado de R1-0528 sobre Qwen3-8B, aunque no se aportan evaluaciones en la informacion disponible.
- Generacion y comprension de codigo, tambien heredada del modelo base, sin datos de rendimiento publicados para esta cuantizacion.
- Respuestas sin filtrado de seguridad: la abliteration elimina el mecanismo de rechazo, por lo que el modelo respondera a peticiones que el modelo original declinaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no documenta la cobertura de idiomas.
- Vision, audio u otras modalidades: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Investigacion en alineacion y red-teaming: el modelo permite estudiar de forma controlada que tipo de contenido genera un LLM de 8B sin filtrado de seguridad, y comparar sus respuestas con las del modelo original con filtros activos para medir el efecto real de la abliteration.
- Auditoria de sesgos y contenido danino: al no rechazar peticiones, resulta util para generar de forma automatica conjuntos de respuestas problematicas que despues se analizan con clasificadores externos, siempre en un entorno aislado y con supervision humana.
- Generacion de datos sinteticos de razonamiento: sus cadenas de pensamiento largas permiten producir trazas de tipo `chain-of-thought` para destilar o ajustar modelos mas pequenos, un uso habitual de los destilados de R1.
- Ejecucion local sin conexion: con 4,6 GB de pesos, cabe en un portatil con GPU de 8 GB o en un Mac con memoria unificada, lo que permite desplegar un asistente de razonamiento en equipos sin acceso a internet ni a APIs externas.
- Prototipado de asistentes conversacionales en entornos cerrados: para demos internas donde el contenido generado se revisa antes de su difusion y no existe exposicion a usuarios finales.
- Docencia y formacion tecnica: sirve como ejemplo practico de la cadena completa safetensors a GGUF, de cuantizacion con imatrix y de las diferencias entre una cuantizacion IQ4_XS y otras variantes del mismo modelo.
- Evaluacion comparativa de cuantizaciones: al existir el modelo base en safetensors, este fichero permite medir la degradacion real que introduce IQ4_XS en tareas de matematicas y razonamiento largo frente a precision completa.
- Asistencia de programacion en local: puede integrarse en un flujo de trabajo con llama-server exponiendo una API compatible con OpenAI, aunque sin garantias de calidad equivalentes a modelos de codigo especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio ni los metadatos de HuggingFace incluyen MMLU, HumanEval, GSM8K, AIME ni ninguna otra metrica. La busqueda web asociada no devolvio resultados relacionados con el modelo. Por tanto, no es posible comparar numericamente esta cuantizacion con el modelo base ni con los destilados originales.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB con la cuantizacion IQ4_XS (el fichero de pesos ocupa 4,6 GB y hay que anadir la cache KV y el overhead del runtime). El consumo exacto depende del contexto configurado.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM. Funciona comodamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en el segmento profesional, L4, A10G y T4 de 16 GB son suficientes. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente toda la gama media y alta reciente, y tambien en equipos Apple Silicon con 8-16 GB de memoria unificada. En GPUs de 6 GB puede requerir reducir el contexto o descargar parte de las capas a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`, ambos documentados por el autor), llama-cpp-python, Ollama mediante importacion del GGUF con un Modelfile, LM Studio, Jan y cualquier interfaz basada en llama.cpp. El soporte de GGUF en vLLM es experimental y no esta garantizado para cuantizaciones IQ4_XS; TGI no soporta GGUF.
- Latencia y throughput estimados: no disponibles. Dependen por completo del hardware, del contexto configurado y de la longitud de las cadenas de razonamiento, que en este modelo incrementan mucho el tiempo total por respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Filtrado de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (wy8edhuh, IQ4_XS GGUF) | 8,19 B | GGUF IQ4_XS + imatrix | Eliminado (abliterated) | MIT | Publicado, 0 descargas y 0 likes |
| huihui-ai/DeepSeek-R1-0528-Qwen3-8B-abliterated (modelo base directo) | 8,19 B (mismo modelo) | safetensors | Eliminado (abliterated) | no disponible en la informacion proporcionada | Repositorio de referencia de la abliteration |
| DeepSeek-R1-0528-Qwen3-8B (original sin ablacionar) | ~8 B | safetensors | Activo | no disponible en la informacion proporcionada | Modelo oficial de DeepSeek |
| Qwen3-8B (modelo base de la familia) | ~8 B | safetensors | Activo | no disponible en la informacion proporcionada | Modelo oficial de Qwen |

La informacion proporcionada no incluye datos de contexto, benchmarks ni licencias de los tres modelos de comparacion, por lo que no es posible establecer una comparacion cuantitativa. La unica diferencia documentada con certeza es el formato de pesos y la ausencia de filtrado de seguridad.

## Limitaciones y advertencias

- Ausencia de filtrado de seguridad: la abliteration reduce deliberadamente los mecanismos de rechazo. El propio autor advierte del riesgo de generar contenido sensible, controvertido o inapropiado, y recomienda uso exclusivamente experimental y en entornos controlados.
- No apto para audiencias generales ni para aplicaciones publicas: la model card indica explicitamente que el modelo puede no ser adecuado para entornos publicos, usuarios menores de edad o aplicaciones con requisitos de seguridad altos.
- Riesgo de alucinacion: inherente a los modelos de 8B y potencialmente agravado por el modo de razonamiento largo, que puede producir cadenas de pensamiento plausibles pero incorrectas. La abliteration no mitiga este problema.
- Degradacion por cuantizacion: IQ4_XS opera a unos 4,5 bits por parametro. La perdida frente a BF16 es pequena en generacion general, pero suele notarse mas en tareas de razonamiento largo y matematicas, justo el punto fuerte del modelo base.
- Idiomas no documentados: no hay informacion sobre la cobertura linguistica ni sobre la calidad en castellano; el comportamiento multilingue del destilado original puede haberse visto afectado por la ablacion.
- Contexto no documentado: se desconoce la ventana maxima soportada en esta cuantizacion y el autor ejemplifica el arranque con solo 2048 tokens, lo que limita conversaciones largas o documentos extensos.
- Responsabilidad legal: aunque la licencia MIT permite uso comercial, el autor declina toda responsabilidad sobre las consecuencias del uso y recuerda que el contenido generado puede conllevar riesgos legales o eticos en funcion de la jurisdiccion.
- Falta de validacion comunitaria: 0 descargas y 0 likes, repositorio de autor individual, sin auditoria independiente ni evaluacion reproducible. No deberia tratarse como un artefacto fiable para produccion.
- Consumo elevado de tokens: el modo de razonamiento explicito incrementa el coste de inferencia y la latencia por respuesta en comparacion con modelos de chat convencionales del mismo tamano.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/wy8edhuh/DeepSeek-R1-0528-Qwen3-8B-abliterated-IQ4_XS-GGUF
- Modelo base de la abliteration: https://huggingface.co/huihui-ai/DeepSeek-R1-0528-Qwen3-8B-abliterated
- Espacio GGUF-my-repo utilizado para la conversion: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
- Resultados de la busqueda web: no se encontro ningun enlace relevante para este modelo; los resultados devueltos correspondian a contenidos sin relacion (Fundacion Chinquihue).
