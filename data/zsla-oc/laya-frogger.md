# zsla-oc/laya-frogger

## Resumen

laya-frogger es un ajuste fino del modelo Laya de Convai Innovations, un encoder ModernBERT-large de 421.293.830 parámetros, especializado en jugar a Frogger a partir de una descripcion JSON del tablero. En cada tick el modelo elige uno de cinco movimientos (`up`, `down`, `left`, `right`, `wait`) en un unico forward pass, sin generacion autoregresiva y sin decodificacion paso a paso. Lo publica el usuario zsla-oc bajo licencia Apache 2.0 y esta pensado como modelo de decision de "System 1": entrada corta, salida categorica con probabilidades y latencia muy baja.

El problema que resuelve es concreto: convertir un estado de juego estructurado en una accion inmediata con una sola pasada por el encoder, en lugar de razonar con una cadena de texto. La entrada es un estado en vista centrada en la rana de como maximo 313 tokens (incluida la pregunta), y la salida es una distribucion de probabilidad sobre los cinco movimientos. En una RTX 5080 con `fast=True` la latencia reportada es de 5,6 ms por decision, lo que permite jugar a 12 movimientos por segundo.

Su relevancia es doble. Por un lado, demuestra que un encoder de 421M puede superar ampliamente a heuristicas triviales en una tarea de planificacion con restricciones temporales: sobre 50 niveles de test nunca vistos consigue 208 de 250 casas con 91 muertes, frente a 0 de 15 casas del modelo base en zero-shot. Por otro, es un caso de estudio sobre ingenieria de representacion del estado: el autor documenta que pasar de un volcado completo del tablero a una ventana centrada en la rana con vision de un tick de antelacion fue lo que elevo la tasa de movimientos optimos hasta 0,938.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-large), modelo de decision no autoregresivo |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto general; la entrada de la tarea esta limitada a 313 tokens como maximo (estado mas pregunta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,8 GB |
| Modelo base | convaiinnovations/laya |
| Tarea | elegir el siguiente movimiento: `up`, `down`, `left`, `right` o `wait` |
| Salida | una probabilidad por movimiento |

## Arquitectura y entrenamiento

El modelo hereda el backbone de Laya: un encoder ModernBERT-large de 421M parametros. No genera texto ni usa decodificacion autoregresiva; recibe una pregunta tipada (un objeto JSON con el campo `move`, las instrucciones y los criterios de cada opcion) junto con el estado del tablero, y produce una distribucion de probabilidad sobre las opciones definidas en la pregunta. La cabeza es, por tanto, de clasificacion sobre opciones, no de lenguaje. La representacion del estado es determinante: cada fila se serializa como `<offset> <kind> <motion>: now <9 celdas> | next <9 celdas>`, es decir, una ventana de 9 celdas centrada en la rana, con el mundo un tick por delante, mas campos como `rows_to_home`, `time_left` y `empty_homes_dx`.

El entrenamiento consta de dos etapas. La primera parte del modelo base y usa 49.946 estados generados a partir de 2.000 niveles aleatorios, jugados por un planificador exacto con movimientos aleatorios mezclados; dos epochs, 32 minutos. La segunda reutiliza esos estados y anade 32.018 estados procedentes de las propias partidas de la etapa 1 (DAgger), con un epoch adicional y 24 minutos. Las etiquetas son de tipo soft-label: el planificador resuelve cada vida con una sola pasada hacia atras y marca todos los movimientos que llegan a una casa en el menor numero de ticks, repartiendo la probabilidad entre los empatados. La receta es el cuaderno oficial de ajuste fino de Laya portado a una sola GPU, con entropia cruzada sobre etiquetas suaves mas el termino de proper scoring de RLCD. No se usaron niveles de test en entrenamiento.

Dos hallazgos tecnicos destacan en la model card. El primero es que la representacion del estado importo mas que el volumen de datos: con el mismo conjunto de estados y etiquetas, una version que veia el tablero completo (una cadena por fila) apenas superaba la heuristica de pulsar siempre `up`, mientras que la ventana centrada en la rana con anticipacion de un tick llego a 0,938 de movimientos optimos. El segundo es que los datos de self-play mejoraron el juego sin mejorar apenas la exactitud en test: pasaron de 182 a 208 casas y eliminaron los ahogamientos, pero la metrica de clasificacion apenas se movio.

## Capacidades

- Decision categorica de un solo paso: dado un estado JSON tipado, devuelve una probabilidad por cada opcion definida en la pregunta.
- Juego de Frogger: selecciona entre `up`, `down`, `left`, `right` y `wait` a partir de una vista centrada en la rana con horizonte de un tick.
- Planificacion implicita de corto plazo: los datos de entrenamiento incorporan las consecuencias de la accion (por ejemplo, permanecer sobre un tronco que se desplaza), aunque el modelo no ejecute busqueda en inferencia.
- Inferencia de latencia muy baja: 5,6 ms por decision en RTX 5080 con `fast=True` (via tilelang); sin ese flag usa el forward estandar.
- Soporte de respuestas tipadas: la salida se estructura como `answers` con un campo `choice` y un mapa `probabilities`.
- Salida calibrada por diseno: las etiquetas suaves del planificador y el termino de proper scoring favorecen distribuciones mixtas cuando varios movimientos son igual de buenos.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad nativa; el bucle de agente lo aporta el codigo externo (por ejemplo, `laya.Agent`).
- Capacidades multilingues: no; el modelo esta etiquetado unicamente para ingles y el prompt debe enviarse exactamente como en el ejemplo.
- Vision, audio u otros modos: no disponible.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Agente de juego en tiempo real: integrado en un bucle que serializa el estado del tablero y llama al modelo cada tick, permite jugar a Frogger a 12 movimientos por segundo con 5,6 ms por decision en una GPU de consumo, algo inviable con un LLM autoregresivo en el mismo presupuesto de latencia.
- Investigacion sobre representacion de estado: sirve como banco de pruebas reproducible para medir como afecta el formato de la entrada (tablero completo frente a ventana centrada en el agente) al rendimiento de un encoder pequeno en tareas de decision.
- Estudio de DAgger y aprendizaje por imitacion: el par de etapas de entrenamiento documentado permite replicar el efecto de anadir estados visitados por la propia politica sobre un planificador exacto como profesor, y comparar el impacto en metrica de clasificacion frente a metrica de tarea.
- Prototipado de modelos de decision "System 1": util como plantilla para convertir tareas de eleccion discreta (rutas, priorizacion de acciones, seleccion de herramientas) en un clasificador de opciones con pregunta tipada, en lugar de generar texto y parsearlo.
- Benchmarking de latencia en GPUs de consumo: con 421M parametros y pesos en safetensors de 0,8 GB, es un candidato practico para medir throughput de clasificacion sobre RTX 4090, RTX 5080 o similares, y para validar aceleraciones tipo tilelang.
- Tareas de control con observacion textual corta: la misma interfaz (estado JSON mas pregunta con criterios) es reutilizable para simuladores de rejilla, navegacion simple o cualquier entorno cuyo estado quepa en unos cientos de tokens.
- Demostraciones y contenido divulgativo: el repositorio incluye un GIF de un nivel de test nunca visto resuelto sin perder vidas, lo que facilita ejemplos visuales reproducibles en articulos o charlas.
- Comparacion de heuristicas frente a politicas aprendidas: permite cuantificar la brecha entre una regla trivial (pulsar siempre `up`, con 0,689 de movimientos optimos) y una politica entrenada (0,938) en el mismo conjunto de 5.000 estados de test.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 50 niveles de test nunca vistos, cada uno con 5 casas y 3 vidas:

| Politica | Partidas | Casas | Muertes | Movimientos optimos | Movimientos fatales |
|---|--:|--:|--:|--:|--:|
| Laya base, zero-shot | 3 | 0 / 15 | 9 | 0,664 | 0,306 |
| Pulsar siempre `up` | no disponible | no disponible | no disponible | 0,689 | 0,285 |
| Este modelo | 50 | 208 / 250 | 91 | 0,938 | 0,002 |

Notas de la model card: la columna de movimientos optimos y fatales se calcula sobre 5.000 estados de test, midiendo la proporcion en la que el movimiento elegido coincide con uno de los que el planificador considera optimos, o bien provoca la muerte o deja al agente sin ruta a casa a tiempo. Los datos de la fila de Laya base zero-shot se calcularon sobre 500 estados de test, y en ese regimen el modelo base responde `up` siempre y muere en menos de 13 movimientos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de proposito general para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en FP32, 0,84 GB en FP16/BF16 (coincide con el tamano del repositorio, 0,8 GB) y alrededor de 0,42 GB en INT8. No se documentan pesos cuantizados para este modelo concreto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre sirve para FP16/BF16. El dato de latencia publicado corresponde a una RTX 5080.
- GPU de consumo: si, cabe holgadamente en tarjetas de gama media y alta (RTX 3060 en adelante, RTX 4090, RTX 5080). Con 421M parametros no requiere GPU de datacenter.
- Opciones de despliegue: el modelo se usa a traves de la libreria `laya` (`laya.Agent`). El flag `fast=True` requiere tilelang; sin el se emplea el forward estandar. La informacion disponible no menciona soporte directo en vLLM, llama.cpp, Ollama o TGI, y el pipeline declarado es `text-classification` sobre safetensors, asi que la via natural es la libreria del autor o un wrapper propio de Transformers.
- Latencia medida: 5,6 ms por decision en RTX 5080 con `fast=True`, lo que equivale a unas 178 decisiones por segundo. No se publican datos de throughput agregado por lote ni de latencia en otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zsla-oc/laya-frogger | 421.293.830 | hasta 313 tokens de estado mas pregunta | 208 / 250 casas, 0,938 movimientos optimos, 5,6 ms por decision | apache-2.0 | HuggingFace |
| convaiinnovations/laya (base, zero-shot) | no disponible en la informacion proporcionada (arquitectura ModernBERT-large) | no disponible | 0 / 15 casas, 0,664 movimientos optimos, muere en menos de 13 movimientos | no disponible en la informacion proporcionada | HuggingFace |
| Heuristica "pulsar siempre up" | no aplica | no aplica | 0,689 movimientos optimos, 0,285 fatales | no aplica | no aplica |
| Otros ajustes de Laya para juegos (por ejemplo, laya-snake de zxrneu) | no disponible | no disponible | no disponible | no disponible | GitHub |

La informacion proporcionada no incluye resultados comparables de otros encoders de tamano similar (ModernBERT-large original, DeBERTa-v3-large) en esta tarea, por lo que no se ofrece comparacion adicional.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo elige entre cinco movimientos en Frogger. No es un modelo de proposito general y no debe esperarse razonamiento, generacion de texto ni conocimientos fuera del juego.
- Errores sistematicos conocidos: 79 de las 91 muertes documentadas corresponden al mismo fallo, saltar a un tronco que arrastra a la rana fuera del tablero en el tick siguiente. Esa situacion representa solo el 0,1% de los datos de entrenamiento, asi que el fallo persiste pese al ajuste.
- Dependencia estricta del formato de entrada: la pregunta y la leyenda deben enviarse exactamente como aparecen en la model card. El autor advierte explicitamente de que el modelo fue entrenado con ese texto literal, de modo que cualquier reformulacion puede degradar la salida.
- Idiomas: etiquetado unicamente para ingles. No hay evidencia de que funcione con instrucciones en otros idiomas.
- Longitud de entrada acotada: el estado mas la pregunta no superan los 313 tokens; el diseno asume una vista recortada del tablero (filas de 3 por encima a 1 por debajo de la rana, 9 celdas por fila), asi que no ve el tablero completo.
- Riesgo de alucinacion en el sentido clasico bajo, ya que la salida es una distribucion sobre opciones cerradas; el riesgo real es de decision erronea, no de texto inventado.
- Dependencia de la libreria `laya` y, para la ruta rapida, de tilelang. La ausencia de pesos GGUF y de soporte documentado en runtimes de inferencia habituales complica el despliegue fuera del ecosistema del autor.
- Cero adopcion publica: el repositorio registra 0 descargas y 0 "likes", sin senales de uso en produccion ni de validacion independiente. Los resultados publicados proceden del propio autor.
- Validacion limitada a 50 niveles de test: el rendimiento en niveles con dinamicas distintas a las del generador usado en entrenamiento no esta caracterizado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base convaiinnovations/laya, cuya licencia no figura en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zsla-oc/laya-frogger
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Sitio oficial de Laya: https://laya.convaiinnovations.com/
- Laya playground (web, dos juegos, benchmark y skill de agente): https://github.com/wdobry/laya-playground
- Laya Snake (decision no autoregresiva sobre ModernBERT-large): https://github.com/zxrneu/laya-snake
- Laya ONNX para navegador: https://github.com/gqgs/laya-onnx
- Video divulgativo sobre Laya: https://www.youtube.com/watch?v=933mV9Xqo4I
- GIF de nivel de test resuelto: https://huggingface.co/zsla-oc/laya-frogger/resolve/main/docs/level-clear.gif
