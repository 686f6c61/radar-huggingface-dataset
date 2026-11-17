# umitaslan/Laya-GGUF

## Resumen

Laya es un modelo de decisión desarrollado por Convai Innovations que se distribuye en formato GGUF para su uso con llama.cpp. A diferencia de un modelo generativo convencional, Laya es un encoder ModernBERT con una cabeza de puntuación de opciones (*option-scoring head*): no dispone de cabeza de lenguaje y no genera texto libre, sino que asigna una puntuación a cada una de las opciones candidatas para una pregunta planteada sobre un estado dado. El repositorio `umitaslan/Laya-GGUF` es una réplica byte a byte de la conversión realizada por ggml-org, publicada para que el descargador de modelos de la extensión `decision` de NetLogo encuentre todos los modelos en un único lugar.

El modelo cuenta con 421.029.889 parámetros y un tamaño de repositorio de 1,3 GB, con dos ficheros disponibles: BF16 (844 MB) y Q8_0 (449 MB). Su ámbito de aplicación es la modelización basada en agentes, en particular la simulación en NetLogo, donde permite que las tortugas elijan entre etiquetas discretas en función de una descripción textual del estado del entorno.

La relevancia de esta ficha es acotada: se trata de una réplica de pesos sin modificaciones, con cero descargas y cero likes en el momento de la consulta, y cuya herramienta principal de integración (la extensión `decision` de NetLogo) aún no se ha publicado. No debe confundirse con un modelo conversacional ni emplearse como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT encoder con cabeza de puntuación de opciones (sin cabeza de lenguaje) |
| Parametros totales | 421.029.889 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor menciona un "token budget" para pregunta y opciones, sin cifra) |
| Tipos de cuantizacion | BF16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Laya se basa en un encoder ModernBERT al que se añade una cabeza de puntuación de opciones. El modelo recibe una pregunta de contexto y un texto de estado, junto con un conjunto de etiquetas candidatas, y devuelve una puntuación para cada opción; la etiqueta seleccionada es la de mayor puntuación. No existe decodificación autoregresiva ni generación de tokens: la salida es una elección entre opciones predefinidas, que pueden constar de varias palabras.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones técnicas del modelo base `convaiinnovations/laya`. La model card del repositorio GGUF se limita a describir el formato de conversión, los hashes SHA-256 de los ficheros y el uso previsto desde NetLogo. La conversión a GGUF fue realizada por ggml-org en el commit `8d62fa9af5c4d00435ee8ceddff7a2d822c8bce5`.

## Capacidades

- Puntuación de opciones discretas: dado un contexto (pregunta) y un estado textual, asigna una puntuación a cada etiqueta candidata y selecciona una.
- Soporte de etiquetas de varias palabras.
- Integración con `llama-server` mediante el endpoint `POST /v1/systemone`.
- Detección automática por parte de la extensión `decision` de NetLogo, que envía peticiones `decision:pick` al endpoint anterior.
- Gestión de un presupuesto de tokens para pregunta y opciones, con error previo a la petición si se excede.
- No genera texto libre, no razona de forma multi-paso, no soporta tool calling ni function calling, y no tiene capacidades de visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Simulación de agentes en NetLogo: las tortugas eligen entre etiquetas como "turn left", "go straight" o "turn right" según el estado del parche que tienen delante; el modelo puntúa cada opción y la extensión aplica el movimiento correspondiente.
- Demostración `Wolf Sheep Decision`: el autor indica que esta demo de la extensión puede ejecutarse con este modelo, lo que permite reproducir un escenario clásico de modelización basada en agentes con decisiones aprendidas.
- Experimentos docentes de inteligencia artificial en ciencias sociales: sustituir reglas condicionales codificadas a mano por un modelo de decisión entrenado, manteniendo la trazabilidad de la opción elegida.
- Prototipado de políticas de comportamiento en entornos discretos: definir un conjunto finito de acciones (por ejemplo, moverse a celdas adyacentes) y dejar que el modelo puntúe cada una a partir de una descripción textual del estado.
- Evaluación comparativa de encoders de decisión: al estar en GGUF, puede ejecutarse en CPU con llama.cpp y compararse con otras cabezas de puntuación sin necesidad de GPU.
- Investigación sobre interfaces entre simulación y modelos: el par pregunta/estado/opciones es un contrato sencillo que facilita medir la sensibilidad de las decisiones a cambios en la redacción del estado.
- Despliegue local en entornos sin conectividad: los ficheros GGUF de 449 MB (Q8_0) o 844 MB (BF16) caben en equipos modestos y no requieren servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamaño de los ficheros, Q8_0 requiere del orden de 0,5 GB de memoria y BF16 del orden de 0,9 GB, a los que hay que sumar el overhead del runtime y el contexto.
- GPU recomendadas: no disponibles. Al ser un encoder de 421 M de parámetros en GGUF, es viable en CPU y en GPU de gama de consumo, pero no se han publicado cifras de latencia ni de throughput.
- Cabe en GPU de consumo: sí, por tamaño, aunque no hay validación publicada con modelos concretos (RTX 4090, RTX 3060, etc.).
- Opciones de despliegue: llama.cpp, en particular `llama-server` con el endpoint `POST /v1/systemone`; la extensión `decision` de NetLogo actúa como cliente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| umitaslan/Laya-GGUF | 421 M | no disponible | Puntuación de opciones (encoder) | Apache-2.0 | GGUF en HF |
| convaiinnovations/laya | 421 M | no disponible | Puntuación de opciones (encoder) | Apache-2.0 | Modelo base en HF |
| ggml-org/Laya-GGUF | 421 M | no disponible | Puntuación de opciones (encoder) | Apache-2.0 | GGUF en HF (origen de la conversión) |

No se dispone de información sobre modelos alternativos de la misma categoría (encoders con cabeza de puntuación para modelización basada en agentes) que permitan una comparación de rendimiento. Los tres modelos listados son el mismo modelo en distintas formas de distribución, no alternativas independientes.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas abiertas; solo puntúa opciones predefinidas.
- La extensión `decision` de NetLogo, su principal vía de uso, no está publicada según la propia model card.
- El repositorio es una réplica byte a byte de la conversión de ggml-org; no aporta mejoras ni cambios respecto al original.
- No hay información sobre sesgos, datos de entrenamiento ni evaluación de robustez, por lo que no puede auditarse su comportamiento fuera del dominio previsto.
- Riesgo de alucinación no aplicable en el sentido habitual (no genera texto), pero sí riesgo de decisiones erróneas si el estado se describe de forma ambigua o fuera de la distribución de entrenamiento.
- Idiomas soportados no disponibles; no se recomienda su uso en producción multilingüe sin validación previa.
- Licencia Apache-2.0: permite uso comercial, pero al no haber documentación sobre el entrenamiento, el cumplimiento normativo (por ejemplo, en materia de datos) recae en el usuario.
- El repositorio registra cero descargas y cero likes, y fue creado y actualizado el mismo día (17 de noviembre de 2026), lo que indica una publicación reciente y sin validación comunitaria.
- No debe emplearse como sustituto de un LLM en tareas de razonamiento, atención al cliente o generación de código.

## Enlaces

- Repositorio GGUF: https://huggingface.co/umitaslan/Laya-GGUF
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Conversión original de ggml-org: https://huggingface.co/ggml-org/Laya-GGUF
- Commit de la conversión: `8d62fa9af5c4d00435ee8ceddff7a2d822c8bce5` (referenciado en la model card; no se proporciona URL directa)
- llama.cpp: no disponible en la información proporcionada
- Documentación de la extensión `decision` de NetLogo: no disponible (no publicada)
