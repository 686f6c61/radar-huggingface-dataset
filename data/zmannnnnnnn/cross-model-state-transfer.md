# zMANNNNNNNN/cross-model-state-transfer

## Resumen

Cross-model state transfer es un checkpoint de investigación publicado por Waylon Zabriskie (usuario zMANNNNNNNN) que implementa un mapa de estados ocultos entre dos modelos de lenguaje de familias y arquitecturas distintas: Qwen2.5-3B-Instruct actúa como emisor y gpt-oss-20b como receptor. El componente entrenado es una red pequeña de 4,1 millones de parámetros que transforma el estado oculto final de Qwen (7 × 2.048 valores, leídos en las posiciones de siete tokens de un registro estructurado) en un tensor de 7 × 2.880 valores que se inyecta en el flujo residual de gpt-oss-20b tras sus primeros cuatro bloques. El receptor nunca ve el registro como texto: recibe únicamente la activación traducida y se le formula una pregunta sobre el contenido.

El interés del artefacto es de interpretabilidad y de investigación sobre representaciones internas, no de uso productivo. Demuestra que es posible transferir información factual entre espacios latentes de modelos con dimensiones y tokenizadores diferentes mediante un mapeo aprendido de forma supervisada contra la propia representación del receptor, sin que el mapa vea nunca preguntas ni respuestas durante el entrenamiento. El checkpoint es una reconstrucción: los tres mapas originales del estudio se perdieron en septiembre de 2026 y este se reentrenó con la misma receta y semilla 1.

La relevancia actual es metodológica: ofrece un protocolo reproducible (condiciones zero, random, ceiling y text, más pruebas de swap) para evaluar si una representación inyectada es causalmente responsable de la respuesta del receptor. El repositorio es de tamaño 0,0 GB y se distribuye bajo licencia qwen-research, con fines exclusivamente de investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de mapeo (4,1 M de parámetros) entre el estado oculto final de Qwen2.5-3B-Instruct y el flujo residual de la capa 4 de gpt-oss-20b; ambos modelos base congelados |
| Parametros totales | 4,1 M (solo el mapa entrenado); los modelos emisor y receptor no forman parte del checkpoint |
| Parametros activos | No aplica (el mapa no es MoE; gpt-oss-20b, el receptor, sí es MoE, pero sus parámetros no se entrenan) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Los modelos base se usan en 4 bits (Qwen2.5-3B-Instruct-4bit y gpt-oss-20b-MXFP4-Q8); el mapa se distribuye en el formato nativo de MLX |
| Idiomas soportados | No disponible (la tarea es simbólica sobre registros sintéticos tipo `F1=B F2=D N1=3`) |
| Licencia | qwen-research (etiquetada como `other` en HuggingFace); uso exclusivo de investigación y evaluación |
| Formato de pesos | MLX (librería `mlx`, ejecutado con MLX 0.31.2 y mlx-lm 0.31.3) |

## Arquitectura y entrenamiento

El sistema consta de tres piezas. El emisor, Qwen2.5-3B-Instruct congelado en cuantización de 4 bits, procesa un registro sintético de siete campos y se lee su estado oculto final (tras la normalización final) en las posiciones de los siete tokens de valor, produciendo 7 × 2.048 números. El mapa, una red de 4,1 M de parámetros, proyecta esa matriz a 7 × 2.880 y se aplica como `map(record) − map(placeholder)`, de modo que un registro de relleno (todo `A` / todo `1`) no aporta señal. El receptor, gpt-oss-20b congelado en MXFP4-Q8, recibe un prompt con el registro de relleno y una pregunta; tras sus primeros cuatro bloques, la salida del mapa se suma al flujo residual en las siete posiciones de valor y el modelo continúa generando. La respuesta se extrae como el token válido con mayor puntuación.

El entrenamiento del mapa es puramente de destilación de representación: se ajusta únicamente para reproducir la representación propia de gpt-oss-20b en la capa 4 para cada registro, relativa al relleno. Nunca vio preguntas ni respuestas, lo que convierte la evaluación en una prueba de generalización sobre tipos de consulta no vistos. Los tipos usados durante el desarrollo fueron retrieve, numcmp, membership y count; equality quedó reservado como conjunto retenido y mapping como holdout final sellado. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de los registros sintéticos, ni el uso de RLHF o DPO, que no aplican a este artefacto.

## Capacidades

- Transferencia de estado oculto entre modelos de distinta familia, dimensión y tokenizador (Qwen2.5-3B → gpt-oss-20b).
- Inyección de información en el flujo residual de la capa 4 del receptor sin mediación de texto.
- Respuesta a consultas de recuperación directa (retrieve) sobre el registro transferido.
- Comparación numérica (numcmp) entre campos del registro.
- Pertenencia (membership): determinar si un valor está presente en el registro.
- Conteo (count) de ocurrencias o elementos del registro.
- Igualdad (equality): tipo retenido, nunca usado en entrenamiento, ajuste ni selección.
- Aplicación de una tabla de consulta privada proporcionada en la pregunta (mapping), holdout final ejecutado una sola vez en el estudio original.
- Evaluación de causalidad mediante la condición swap: se sustituye el estado por el de otro registro y se comprueba si la respuesta del receptor sigue al estado sustituido.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un artefacto de investigación acotado a la tarea descrita.

## Casos de uso

- Investigación en interpretabilidad de representaciones: usar el mapa como sonda causal para comprobar si una dirección latente concreta contiene la información que el receptor utiliza al responder, comparando las condiciones correct, swap y zero.
- Estudio de alineación entre espacios latentes: analizar qué transformación lineal o no lineal aproxima la representación de un modelo pequeño a la de un modelo mayor de otra familia, y hasta qué punto esa transformación preserva estructura semántica.
- Validación de protocolos de evaluación: el diseño con condiciones zero, random, ceiling y text sirve como plantilla para verificar que un experimento de transferencia de activaciones no está midiendo fugas de información por el prompt.
- Docencia y reproducción de experimentos: el paquete se instala desde `requirements.txt` en un entorno limpio de Python 3.11 y se evalúa sin red en unos cinco minutos en Apple Silicon, lo que facilita su uso en cursos de mecánica interna de transformers.
- Pruebas de generalización fuera de distribución: los conjuntos retenidos equality y mapping permiten medir si una representación transferida soporta operaciones cognitivas no vistas durante el ajuste.
- Auditoría de modelos MoE cuantizados: el receptor gpt-oss-20b en MXFP4-Q8 permite estudiar cómo la cuantización agresiva afecta a la legibilidad y manipulabilidad de las activaciones internas.
- Base para experimentos de comunicación entre modelos: el mismo esquema (emisor congelado, mapa entrenado contra el receptor, inyección en capas tempranas) puede extenderse a otros pares de modelos como prueba de concepto de canales latentes.

## Benchmarks y rendimiento

Resultados medidos el 30 de octubre de 2026 con el código del repositorio (`results/verification_run.json`), solo inferencia, en Apple Silicon con MLX 0.31.2 y mlx-lm 0.31.3. La columna «conv. under swap» es la tasa de respuestas que siguen la convención original bajo sustitución de estado.

| Tipo de pregunta | n | correct | swap follow | conv. under swap | zero | random | ceiling | text |
|---|---|---|---|---|---|---|---|---|
| retrieve (dev) | 60 | 1,000 | 1,000 | 0,000 | 0,250 | 0,233 | 1,000 | 1,000 |
| numcmp (dev) | 60 | 1,000 | 0,967 | 0,033 | 0,650 | 0,467 | 1,000 | 0,950 |
| membership (dev) | 60 | 0,967 | 0,983 | 0,017 | 0,583 | 0,583 | 0,950 | 0,917 |
| count (dev) | 60 | 0,967 | 1,000 | 0,000 | 0,200 | 0,200 | 0,950 | 0,983 |
| equality (retenido) | 60 | 0,917 | 0,783 | 0,217 | 0,267 | 0,283 | 0,900 | 0,883 |
| mapping (holdout final) | 80 | 0,787 | 0,812 | 0,062 | 0,237 | 0,250 | 0,775 | 0,800 |

Para comparación, el estudio original reportó, con sus tres mapas (checkpoints perdidos, no verificables desde este repositorio): retrieve 1,000; numcmp 0,983–1,000; membership 0,933; count 0,967–1,000; equality 0,900–0,917; mapping 0,775–0,787. Este checkpoint reconstruido cae dentro de esos rangos en los dos tipos retenidos.

Las comprobaciones de fidelidad del entorno muestran discrepancias de una pregunta sobre 60 u 80 en algunas condiciones (por ejemplo, zero en mapping: 0,237 frente a 0,225 registrado; ceiling en membership y count: 0,950 frente a 0,933 y 0,967), lo que indica que no se recreó bit a bit el entorno original. Una verificación en entorno limpio, con instalación desde `requirements.txt` y sin red, reprodujo exactamente todos los recuentos y márgenes medios de `verification_run.json`. Un registro anterior del 23 de septiembre de este mismo checkpoint daba mapping 0,750 y zero 0,183; esos números quedan superados por los actuales.

## Requisitos de hardware

- Inferencia ejecutada en Apple Silicon con MLX 0.31.2 y mlx-lm 0.31.3; el estudio no reporta cifras para GPU NVIDIA.
- El receptor gpt-oss-20b en MXFP4-Q8 requiere memoria para un modelo MoE de 20B en cuantización de 4 bits; el emisor Qwen2.5-3B-Instruct-4bit es comparativamente ligero.
- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; el único entorno documentado es Apple Silicon vía MLX.
- No se documenta compatibilidad con llama.cpp, vLLM, TGI ni Ollama; la librería declarada es exclusivamente `mlx`.
- Latencia y throughput: la ejecución completa de verificación (seis tipos de pregunta, 380 consultas en total) tarda aproximadamente cinco minutos en Apple Silicon, según el autor.

## Comparativa con modelos similares

No se dispone de artefactos directamente comparables en la información proporcionada. El checkpoint no es un modelo de lenguaje utilizable de forma autónoma, sino un mapa de activaciones de 4,1 M de parámetros acoplado a dos modelos base concretos.

| Artefacto | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cross-model-state-transfer (este) | 4,1 M (mapa) | no disponible | Transferencia de estado Qwen2.5-3B → gpt-oss-20b | qwen-research | Público en HuggingFace, 24 descargas |
| Qwen2.5-3B-Instruct-4bit | 3B | no disponible en esta ficha | Modelo emisor, congelado | qwen-research | Público (mlx-community) |
| gpt-oss-20b-MXFP4-Q8 | 20B (MoE) | no disponible en esta ficha | Modelo receptor, congelado | no disponible en esta ficha | Público (mlx-community) |

## Limitaciones y advertencias

- Artefacto de investigación: no es un modelo conversacional ni un asistente; no admite uso productivo general.
- El checkpoint es una reconstrucción; sus pesos no son idénticos al mapa original con semilla 1 y no reproduce exactamente los resultados publicados del estudio.
- Los tres checkpoints originales se perdieron en septiembre de 2026 y no están disponibles, por lo que las cifras originales no son verificables desde el repositorio.
- Las preguntas y los registros son sintéticos y de dominio cerrado; no hay evidencia de transferencia a lenguaje natural.
- El receptor puede ignorar o malinterpretar el estado inyectado: en equality, la tasa de seguimiento bajo swap cae a 0,783 y la de convención bajo swap sube a 0,217, señal de que la inyección no siempre domina la respuesta.
- Riesgo de alucinación no evaluado en el sentido habitual; el modo de fallo relevante es responder según el estado de relleno o según el prompt de texto en lugar del estado transferido.
- Idiomas soportados no documentados; la tarea no implica competencia multilingüe.
- Licencia qwen-research: restringe el uso a investigación y evaluación; conviene revisar `LICENSING.md` antes de cualquier uso derivado, especialmente comercial.
- Dependencia estricta de MLX y de versiones concretas (MLX 0.31.2, mlx-lm 0.31.3); la reproducibilidad fuera de ese entorno no está garantizada.
- El mapa se entrenó solo contra la representación de la capa 4 de gpt-oss-20b; cambiar de capa, de cuantización o de receptor invalida el artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zMANNNNNNNN/cross-model-state-transfer
- Licencia del repositorio: https://huggingface.co/zMANNNNNNNN/cross-model-state-transfer/blob/main/LICENSING.md
- Modelo emisor: https://huggingface.co/mlx-community/Qwen2.5-3B-Instruct-4bit
- Modelo receptor: https://huggingface.co/mlx-community/gpt-oss-20b-MXFP4-Q8
- Resultados de verificación citados en la model card: `results/verification_run.json` dentro del repositorio
- Estudio de referencia: write-up independiente de Waylon Zabriskie (enlace no incluido en la información disponible)
