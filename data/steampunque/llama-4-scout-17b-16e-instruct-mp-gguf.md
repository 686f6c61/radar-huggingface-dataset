# steampunque/Llama-4-Scout-17B-16E-Instruct-MP-GGUF

## Resumen

Llama-4-Scout-17B-16E-Instruct-MP-GGUF es una cuantizacion mixta en formato GGUF del modelo meta-llama/Llama-4-Scout-17B-16E-Instruct, publicada por el usuario steampunque en Hugging Face. No se trata de un modelo nuevo, sino de un artefacto de despliegue: el autor aplica niveles de cuantizacion distintos por capa (mixed precision) para reducir el peso en disco manteniendo la perplejidad lo mas cerca posible de la del modelo original en precision completa. El modelo base es un transformer MoE (mixture of experts) de la familia Llama 4, con 107.769.861.184 parametros totales segun los safetensors del repo, lo que lo situa en la clase de 100B parametros.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de clase 100B en hardware de consumo. El autor dimensiona la variante principal (Q4_E_H) para que quepa en una maquina con 64 GB de RAM, con un fichero de aproximadamente 62,8 GB y una perplejidad de 9,5, comparable al IQ4_XS de 59,9 GB (PPL 9,57). Existen variantes mas pequenas (Q4_K_H, Q4_V_H, Q3_K_H, Q2_K_H) que descienden hasta los 42,8 GB manteniendo perplejidades entre 9,54 y 10,4.

El modelo base es un chatbot multimodal con capacidad de vision, multilingue, pero el autor advierte explicitamente de que no ha sido entrenado con RL para razonamiento (sin bloque de pensamiento) ni optimizado para seguimiento de instrucciones, tareas agenticas o codigo al nivel de los modelos de referencia de finales de 2026. Su utilidad esta en tareas de lenguaje autonomo que se beneficien del tamano de un modelo de clase 100B sin acceso a agentes o internet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts) del modelo base Llama 4 Scout; cuantizacion mixta por capas en GGUF |
| Parametros totales | 107.769.861.184 (107,8B) |
| Parametros activos | no disponible (el modelo base se denomina 17B-16E, 16 expertos, pero no se detalla el numero de parametros activos en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_H, Q3_K_H, Q3_K_M_3_5, Q4_V_H, Q4_K_H, Q4_E_H, IQ4_XS; mezclas por capa con Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K, Q6_K, F16, F32 |
| Idiomas soportados | no disponible (el autor indica que el modelo base es multilingue) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion GGUF del modelo meta-llama/Llama-4-Scout-17B-16E-Instruct. El modelo base es un transformer con arquitectura MoE; la nomenclatura "17B-16E" indica 16 expertos, y el total de parametros del checkpoint cuantizado es de 107,8B. La informacion proporcionada no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO en el modelo original.

La innovacion tecnica de esta publicacion es el esquema de cuantizacion mixta por capas. El autor define un mapa de tipos de capa (atencion Q/K/V/O, SSM, FFN y subcapas G/U/D) y asigna un nivel de cuantizacion distinto a cada una. La variante recomendada, Q4_E_H, usa Q5_K en las capas 0 y 1, Q4_K en las capas 2 a 44, Q4_K en la 45, Q5_K en la 46 y Q6_K en la 47, con embeddings y tensor de salida en Q6_K. El objetivo declarado es mantener un minimo de Q4_K en todas las capas para limitar la perdida de entropia y, a la vez, caber en 64 GB de RAM. Las variantes legacy (Q4_K_H, Q4_V_H, Q3_K_H, Q2_K_H) usan esquemas escalonados desde Q3_K_S en capas tempranas hasta Q4_K_M o Q5_K en las finales, y evitan cuantizaciones IQ para no penalizar el procesamiento en CPU. El autor senala que las selecciones por capa se ajustaron con un conjunto reducido de prompts de razonamiento y evaluaciones subjetivas y objetivas combinadas.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Instruct.
- Capacidad de vision: el modelo base es multimodal y el autor indica que la variante Q4_V_H se diseno pensando en el modo vision, aunque tambien funciona con entrada solo de texto.
- Multilingue: el autor afirma que el modelo base es multilingue, sin detallar la lista de idiomas.
- No incluye bloque de pensamiento ni entrenamiento RL explicito para razonamiento.
- No esta optimizado para seguimiento de instrucciones, tareas agenticas ni generacion de codigo al nivel de los modelos de referencia de finales de 2026, segun el propio autor.
- Uso previsto por el autor: tareas de lenguaje autonomo, sin acceso a agentes ni internet, que se beneficien del tamano de un modelo de clase 100B ejecutable en hardware de consumo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor advierte de que no esta optimizado para tareas agenticas.

## Casos de uso

- Asistente conversacional local sin conexion: el modelo puede gestionar dialogos multi-turno en una maquina con 64 GB de RAM usando la variante Q4_E_H (62,8 GB), sin depender de APIs externas ni de internet.
- Procesamiento de lenguaje en estaciones de trabajo de gama alta: con la variante Q3_K_H (46,6 GB) o Q2_K_H (42,8 GB) se puede desplegar en equipos con menos memoria, manteniendo una perplejidad de 10,2 y 10,4 respectivamente, adecuada para tareas de redaccion y resumen.
- Analisis de documentos con componente visual: al conservar la capacidad de vision del modelo base, la variante Q4_V_H (49,8 GB) permite procesar imagenes junto con texto en entornos sin GPU dedicada de gran capacidad.
- Prototipado de aplicaciones multilingues: el caracter multilingue del modelo base permite construir demos de traduccion o atencion al cliente en varios idiomas en hardware de consumo, aunque el autor no detalla la lista de idiomas soportados.
- Investigacion sobre cuantizacion: el repo documenta con detalle los mapas de capas y las perplejidades de cada variante, lo que lo convierte en un material de referencia para estudiar el impacto de la cuantizacion mixta en modelos MoE de clase 100B.
- Evaluacion comparativa de tecnicas de compresion: las tablas de tamano y PPL (Q2_K frente a Q2_K_H, Q3_K_M_3_5 frente a Q3_K_H, etc.) permiten reproducir experimentos sobre el equilibrio entre tamano de fichero y calidad.
- Generacion de texto creativo y lluvia de ideas: el autor sugiere que la variante Q4_V_H, con Q2_K en capas profundas alternas, introduce una pequena cantidad controlada de no linealidad que puede favorecer la creatividad en la generacion.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). La unica metrica reportada es la perplejidad (PPL) por variante de cuantizacion:

| Cuantizacion | Tamano (GB) | PPL | Comentario |
|---|---|---|---|
| Q2_K | 39,6 | 11,4 | Artefactos de generacion, palabras sin sentido, tokens chinos aleatorios |
| Q2_K_H | 42,8 | 10,4 | Sin artefactos, cercano a Q3_K_M |
| Q3_K_M_3_5 | 51,6 | 10,2 | Q3_K_M con capa de salida Q5_K |
| Q3_K_H | 46,6 | 10,2 | Hibrido con salida Q5_K, PPL de Q3_K_M |
| Q4_V_H | 49,8 | 9,54 | Q4_K_H con Q2_K alterno en capas profundas |
| Q4_K_H | 50,4 | 9,54 | Hibrido con salida Q5_K, PPL de IQ4_XS |
| Q4_E_H | 62,8 | 9,5 | Cuantizacion E con embed y salida Q6_K |
| IQ4_XS | 59,9 | 9,57 | IQ4_XS con embed/salida por defecto |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: la variante Q4_E_H (62,8 GB) esta dimensionada para una maquina con 64 GB de RAM. Las variantes Q4_K_H (50,4 GB), Q4_V_H (49,8 GB), Q3_K_H (46,6 GB) y Q2_K_H (42,8 GB) reducen el requisito por debajo de los 50 GB, y Q2_K_H se acerca a los 43 GB.
- GPU recomendadas: no se especifican en la informacion proporcionada. El diseno esta orientado a ejecucion en CPU/RAM, ya que el autor menciona explicitamente el procesamiento en CPU y evita cuantizaciones IQ por su lentitud en CPU.
- Cabe en GPU de consumo: no disponible. El tamano de fichero (42,8 a 62,8 GB) supera la VRAM de las GPU de consumo actuales, por lo que el despliegue realista es en RAM del sistema con posible offload parcial a GPU.
- Opciones de despliegue: el formato es GGUF, compatible con llama.cpp y con los runners basados en llama.cpp (por ejemplo, Ollama y otros frontends GGUF). No se confirma compatibilidad con vLLM ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| steampunque/Llama-4-Scout-17B-16E-Instruct-MP-GGUF (Q4_E_H) | 107,8B totales | no disponible | GGUF | no disponible | Cuantizacion mixta, 62,8 GB, PPL 9,5 |
| meta-llama/Llama-4-Scout-17B-16E-Instruct | 107,8B totales | no disponible | safetensors | no disponible | Modelo base en precision original; requiere hardware de clase servidor |
| IQ4_XS del mismo modelo base | 107,8B totales | no disponible | GGUF | no disponible | 59,9 GB, PPL 9,57; referencia de comparacion citada por el autor |
| Q3_K_M homogeneo del mismo modelo base | 107,8B totales | no disponible | GGUF | no disponible | 51,6 GB con salida Q5_K, PPL 10,2 |

La informacion proporcionada no incluye comparaciones con modelos de otros autores ni con arquitecturas alternativas de la misma categoria. Los unicos puntos de comparacion documentados son las distintas variantes de cuantizacion del mismo modelo base.

## Limitaciones y advertencias

- No es un modelo entrenado con RL para razonamiento: carece de bloque de pensamiento y no esta optimizado para tareas agenticas, seguimiento de instrucciones complejo ni generacion de codigo al nivel de los modelos de referencia de finales de 2026, segun el propio autor.
- Riesgo de artefactos en cuantizaciones agresivas: la variante Q2_K (39,6 GB) produce palabras sin sentido y completa palabras con tokens chinos aleatorios; el autor la desaconseja frente a Q2_K_H.
- Perplejidad superior a la del modelo original: todas las variantes cuantizadas presentan PPL entre 9,5 y 11,4, frente a la precision completa, lo que implica una perdida de calidad medible.
- Licencia no disponible: no se especifica la licencia del artefacto ni la del modelo base en la informacion proporcionada; es imprescindible verificar la licencia de meta-llama/Llama-4-Scout-17B-16E-Instruct antes de cualquier uso comercial.
- Idiomas no documentados: aunque el autor afirma que el modelo es multilingue, no se detalla la lista de idiomas ni su calidad relativa.
- Contexto no documentado: no se indica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Hardware: el fichero recomendado (62,8 GB) exige al menos 64 GB de RAM; no cabe en GPU de consumo y el rendimiento en CPU puede ser limitado.
- Fecha de referencia: el autor evalua el modelo frente al estado del arte de noviembre de 2026, lo que sitúa sus advertencias en ese contexto temporal.
- Cuantizacion no determinista en su definicion: el autor senala que no existe un unico Q4_K_H, ya que la seleccion de cuantizaciones por capa es arbitraria; los resultados pueden variar entre artefactos con el mismo nombre.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/steampunque/Llama-4-Scout-17B-16E-Instruct-MP-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct
