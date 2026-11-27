# Superstar111/stir_videoprior_1cmd

## Resumen

`Superstar111/stir_videoprior_1cmd` es una política de visión-lenguaje-acción (VLA) basada en π0.5, el modelo de Physical Intelligence, fine-tuneada con la librería openpi para una tarea robótica concreta: coger una cuchara, recoger garbanzos, verterlos en una olla y remover, todo en un solo episodio y bajo una única instrucción en lenguaje natural. El brazo objetivo es un YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones. El modelo se entrenó exclusivamente en simulación y, según el autor, no se ha ejecutado en el robot real ni evaluado en simulación.

El interés de esta ficha no está en el rendimiento del modelo (no hay métricas publicadas y el propio autor lo etiqueta como baseline), sino en la metodología de generación de datos: 300 trayectorias producidas por un agente de código que escribió sus propios controladores y operó el simulador, con imágenes renderizadas a partir de los estados originales grabados y una única cadena de texto asignada en post-proceso. El repositorio ocupa 12,4 GB y contiene pesos en formato openpi, pero no incluye información sobre licencia ni idiomas.

La model card documenta con detalle inusual las propiedades del dataset y un análisis de agarre que concluye que la presa no cumple la regla de power grasp del laboratorio en 0 de 300 episodios, lo que limita su uso directo en el montaje real. Es, por tanto, un artefacto de investigación sobre destilación de trayectorias generadas por agentes, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en π0.5 (openpi); detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (una única instrucción en inglés en el dataset) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 12,4 GB; presumiblemente pesos openpi, sin confirmar) |

## Arquitectura y entrenamiento

El modelo parte de π0.5, la política VLA de Physical Intelligence, y se fine-tunea mediante openpi. La información disponible no detalla la arquitectura interna (backbone visual, transformer de acciones, mecanismo de flow matching u otros), por lo que no se puede confirmar la composición exacta de capas ni el número de parámetros. La entrada es visual (cámaras head, wrist y cam1 a 284 x 160) más una instrucción textual; la salida son consignas articulares para el brazo y la mano.

El entrenamiento se realizó sobre 300 trayectorias entregadas por un agente de código en la sesión `staged-videos-personal-b` del 25 de noviembre de 2026, con 20 vídeos humanos como prior semántico. El agente escribió sus propios controladores (una única versión, `food_gentle`, generó los 300 archivos) y registró 788 episodios completos, 740 exitosos según su propio criterio. Las imágenes se renderizaron a partir de los estados originales grabados (poses de todos los cuerpos y ángulos articulares, 10 Hz, fotograma a fotograma, sin replay físico) con el mismo renderizador y cámaras del primer dataset. En total, 166.925 fotogramas (episodios de 538 a 568 pasos, mediana 559) y 160.925 filas de entrenamiento, sin recorte. Las acciones son las consignas articulares enviadas por el agente, verificadas como idénticas a las aplicadas por el simulador en los 300 archivos. La instrucción es única para todos los episodios y se asignó en post-proceso, ya que los archivos entregados no contenían texto.

## Capacidades

- Ejecución de una cadena de tareas manipulativas en un solo episodio: coger la cuchara, recoger garbanzos, verterlos en la olla y remover, bajo una única instrucción.
- Control de un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones (consignas articulares, no comandos de alto nivel).
- Condicionamiento por lenguaje natural en inglés para una instrucción fija.
- Política puramente visual en inferencia: no lee estado privilegiado del simulador, a diferencia de los controladores que generaron los datos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.
- No se documentan capacidades multilingües; el único texto del dataset es una frase en inglés.

## Casos de uso

- Investigación sobre destilación de trayectorias generadas por agentes: sirve como referencia de hasta dónde llega una política entrenada únicamente con datos producidos por un agente de código que escribe sus propios controladores, útil para estudiar la brecha entre estado privilegiado y percepción visual.
- Estudio de agarre en simulación: el análisis incluido (fuerza de agarre de 45,78 N, extremo libre del mango a 10,1 mm, pulgar a 162,7 grados respecto a la fuerza neta de los dedos) permite comparar estrategias de presa y evaluar por qué falla el power grasp en 0 de 300 episodios.
- Benchmark de remoción de objetos: la métrica de desplazamiento de garbanzos durante el removido (mediana de 6,96 mm por episodio, máximo de 25,16 mm) ofrece una señal cuantitativa para comparar políticas de manipulación de granos.
- Generación de datos sintéticos de manipulación: el pipeline de renderizado desde estados grabados a 10 Hz y 284 x 160 puede reutilizarse para crear datasets visuales de bajo coste a partir de trayectorias simuladas.
- Línea base para fine-tuning con openpi: al ser un baseline explícito, sirve como punto de partida para comparar políticas posteriores sobre el mismo montaje y la misma instrucción.
- Docencia y divulgación: la model card documenta con transparencia el proceso completo (verificación de sha256, mapeo archivo-grabación, criterios de éxito), lo que lo convierte en un caso de estudio sobre trazabilidad de datos en robótica.
- No es adecuado para despliegue en el robot real del laboratorio bajo su regla de power grasp, ni para producción, dado que no se ha evaluado y la presa no cumple el criterio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la política no ha sido evaluada, ni en simulación ni en robot. Los únicos datos cuantitativos son propiedades del dataset y del análisis de agarre:

| Medida | Conjunto entregado (food_gentle, 300) | Primer conjunto (contact_front, 189) |
|---|---|---|
| Puño desde el extremo del mango | 62,6 mm [62; 64,3] | 62,7 mm [62; 63,84] |
| Extremo libre del mango (regla 5-20 mm) | 10,1 mm [9,6; 11,8] | 10,1 mm [9,6; 11,42] |
| Pulgar frente a índice alrededor del mango | 170,9 grados [170,69; 171,1] | 170,8 grados [170,6; 171] |
| Fuerza del pulgar frente a fuerza neta de dedos | 162,7 grados [158,3; 163,1] | 162,5 grados [157,98; 163] |
| Fuerza de agarre en la sujeción | 45,78 N [45,53; 46,04] | 45,76 N [45,506; 46,014] |
| Power grasp (tres condiciones en >= 80 % de la sujeción) | 0 de 300 | 0 de 189 |
| Deslizamiento al final del episodio | 5,525 mm, 4,2 grados | 5,71 mm, 4,08 grados |
| Removido: mediana de desplazamiento por episodio | 6,96 mm [3,96; 10,37] | 0,01 mm [0,01; 0,1] |
| Removido: mayor desplazamiento por episodio | 25,16 mm [20,26; 28,3] | 0,3 mm [0,02; 2,27] |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,4 GB, lo que da una cota inferior del espacio en disco necesario, pero no se especifica el tamaño de los pesos ni la precisión.
- GPU recomendadas: no disponibles. Al tratarse de una política VLA con entrada visual, se requerirá una GPU con memoria suficiente para el backbone visual y el módulo de acciones, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el pipeline declarado es `robotics` y el autor referencia openpi como marco de entrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a políticas VLA.
- Latencia y throughput: no disponibles, y en cualquier caso dependen del montaje físico y del bucle de control del robot.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Superstar111/stir_videoprior_1cmd` | π0.5 (openpi) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| π0.5 original (Physical Intelligence) | — | no disponible en esta ficha | no disponible | no disponible en esta ficha | Referenciado vía openpi |
| Otros fine-tunes openpi de la misma tarea | π0.5 | no disponible | no disponible | no disponible | No identificados en la información disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables dentro de la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No evaluado: el autor declara que la política no se ha probado ni en simulación ni en el robot real; no hay métricas de éxito.
- Presa no válida para el montaje real: el power grasp falla en 0 de 300 episodios según la regla del laboratorio (pulgar cerrado sobre el mango); el pulgar empuja contra los dedos (162,7 grados) en lugar de cerrar alrededor del mango.
- Estado privilegiado en los datos: los controladores del agente leían las poses de cuchara, garbanzos y recipientes directamente del estado del simulador; una política visual no puede acceder a esa información, lo que crea una brecha entre datos y despliegue.
- Entrenamiento solo en simulación, sin validación de sim-to-real.
- Instrucción única y en inglés: el modelo no ha visto variación lingüística ni paráfrasis; no se documentan capacidades multilingües.
- Dataset pequeño y homogéneo: 300 episodios, una sola versión de controlador, 166.925 fotogramas con una instrucción fija.
- Propiedades del removido limitadas: el desplazamiento mediano de garbanzos es de 6,96 mm por episodio, con un máximo de 25,16 mm, lo que puede ser insuficiente para una tarea de mezclado real.
- Retención final: el 2,1 % de los fotogramas (3.490 de 166.925) corresponde a la secuencia final estática, con mediana de 6 fotogramas por episodio y hasta 31.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución de los pesos.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse solo con trayectorias de un agente y un controlador, hereda sus sesgos de comportamiento.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de generalización incorrecta fuera de la distribución de las 300 trayectorias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/stir_videoprior_1cmd
- openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
