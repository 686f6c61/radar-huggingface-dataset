# thelamapi/Next-Passage

## Resumen

Next Passage es un planificador de rutas para robótica en rejilla desarrollado por el usuario thelamapi y publicado en Hugging Face con licencia Apache 2.0. No se trata de un modelo de lenguaje ni de una red neuronal: es un algoritmo de búsqueda A* que opera sobre el espacio de estados (celda, tiempo), diseñado para entornos simulados donde las puertas se abren y cierran según un horario y los obstáculos patrullan pasillos con paradas aleatorias. El sistema planifica con una acción explícita de espera, lo que le permite aguardar a que una puerta se abra o dejar pasar a un obstáculo antes de avanzar.

El problema que resuelve es la planificación segura en presencia de dinámicas temporales predecibles pero no triviales. Los planificadores estáticos convencionales ignoran el tiempo y colisionan con obstáculos móviles o llegan a puertas cerradas; los enfoques reactivos solo reaccionan tras detectar el peligro. Next Passage incorpora el tiempo en la búsqueda y replanifica cuando la fase observada de un obstáculo difiere de la predicción, logrando cero colisiones en 600 episodios de prueba frente al 50-61 % de los planificadores alternativos.

La relevancia actual es acotada pero clara: sirve como referencia metodológica para planificación espacio-temporal en robótica de interiores, logística de almacenes o simulación de multitudes, y como banco de pruebas reproducible con métricas detalladas. El modelo se distribuye como código Python con un port a JavaScript ejecutable en el navegador a través de un Space de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Planificador A* sobre espacio de estados (celda, t) con acción de espera; no es una red neuronal |
| Parametros totales | no disponible (algoritmo determinista, sin pesos entrenados) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica (horizonte de planificación de 160 pasos) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplica (código Python y port JavaScript; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

Next Passage no es un modelo entrenado, sino un planificador determinista. El entorno simulado es una rejilla de 21×15 celdas con tres muros, cada uno con una abertura fija y una puerta programada, además de pilares y entre 3, 6 o 10 obstáculos patrulleros. Los obstáculos avanzan una celda por paso a lo largo de un bucle de ida y vuelta y se detienen con probabilidad *p* (0,1 o 0,25 en los experimentos), ignorando al robot.

El planificador realiza A* sobre pares (celda, t) con cinco acciones: esperar, norte, sur, este y oeste. La heurística es la distancia BFS estática, que es admisible. Se evitan las celdas que se predice contendrán un obstáculo en *t* o *t−1* (lo que cubre intercambios de posición y paradas de un solo paso) y solo se entra en una puerta cuando estará abierta al llegar. El horizonte es de 160 pasos. Cuando la fase observada de un obstáculo difiere de la predicción, se replanifica. La detección de colisiones considera ocupación simultánea de celda o intercambio de celdas tras un paso. El port JavaScript del Space reproduce el comportamiento Python con paridad verificada en 6 casos sin discrepancias.

## Capacidades

- Planificación espacio-temporal en rejillas con dinámicas programadas (puertas) y móviles (obstáculos patrulleros).
- Acción explícita de espera para sincronizarse con eventos temporales (apertura de puertas, paso de obstáculos).
- Replanificación ante desviaciones entre la fase observada de un obstáculo y su predicción.
- Evitación de colisiones por ocupación simultánea y por intercambio de celdas.
- Ejecución en navegador mediante port JavaScript con paridad funcional respecto a Python.
- Evaluación reproducible con semillas, densidades y tasas de parada configurables.
- No soporta tool calling, agentes conversacionales, visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Planificación de rutas en almacenes automatizados: el planificador permite que robots de picking esperen a que se abra una puerta de seguridad o dejen pasar a una carretilla antes de cruzar un pasillo, reduciendo colisiones en entornos con tráfico predecible.
- Simulación de evacuación en edificios: modelar puertas cortafuegos con horarios de cierre y agentes que patrullan permite evaluar rutas seguras y comparar políticas de planificación bajo distintas densidades.
- Validación de algoritmos de planificación: sirve como baseline reproducible con métricas detalladas (colisiones, pasos relativos al camino más corto, nodos explorados, replanificaciones) para comparar nuevos planificadores espacio-temporales.
- Logística de robots de servicio en hoteles u hospitales: planificar trayectos por pasillos con puertas programadas y personal en movimiento predecible, con replanificación cuando el tráfico se desvía del patrón esperado.
- Docencia en robótica y búsqueda heurística: el código Python y el Space interactivo permiten ilustrar A* sobre espacio de estados ampliado con tiempo, heurísticas admisibles y gestión de incertidumbre.
- Investigación en planificación bajo incertidumbre: el mecanismo de replanificación ante desviación de fase sirve de base para estudiar estrategias de presupuesto temporal por replanificación en sistemas con horizonte limitado.

## Benchmarks y rendimiento

Resultados sobre 600 episodios de prueba por planificador (100 semillas × 3 densidades × 2 tasas de parada):

| Planificador | Llegadas | Episodios con colisión | Puerta cerrada sobre el robot / episodio | Pasos ÷ longitud estática más corta | Replanificaciones / episodio | Nodos de búsqueda / episodio | ms Python / episodio |
|---|---:|---:|---:|---:|---:|---:|---:|
| Next Passage (consciente del tiempo) | 100,0 % | 0,0 % | 0,000 | 1,13 | 19,5 | 1438 | 10,9 |
| Estático + replanificación reactiva | 100,0 % | 50,0 % | 0,173 | 1,26 | 1,7 | 434 | 1,3 |
| Camino más corto estático | 100,0 % | 61,3 % | 0,192 | 1,10 | 0,0 | 194 | 0,9 |

En los 600 episodios en que los tres planificadores llegaron, la media de pasos fue 30,8 (consciente del tiempo), 34,3 (reactivo) y 30,1 (estático). El planificador consciente del tiempo tuvo 0 episodios inseguros o sin terminar de 600.

Proporción de episodios con algún evento inseguro (colisión o cierre de puerta sobre el robot):

| Condición | Consciente del tiempo | Reactivo | Estático |
|---|---:|---:|---:|
| baja / parada=0,1 | 0 % | 36 % | 53 % |
| baja / parada=0,25 | 0 % | 41 % | 48 % |
| media / parada=0,1 | 0 % | 64 % | 74 % |
| media / parada=0,25 | 0 % | 61 % | 72 % |
| alta / parada=0,1 | 0 % | 76 % | 88 % |
| alta / parada=0,25 | 0 % | 77 % | 85 % |

## Requisitos de hardware

- No requiere GPU: es un algoritmo en Python puro y JavaScript, ejecutable en CPU.
- Tiempo de ejecución medido en Python: 10,9 ms por episodio en una NVIDIA L4 (la CPU también es suficiente para este tipo de carga).
- El port JavaScript se ejecuta íntegramente en el navegador del Space, sin backend.
- Despliegue: ejecución directa con `python inference.py` o a través del Space de Hugging Face.
- El coste computacional escala con el horizonte de planificación y el número de obstáculos; en producción se requeriría un presupuesto de tiempo por replanificación.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo neuronal.

## Comparativa con modelos similares

| Planificador | Tipo | Conocimiento temporal | Replanificación | Colisiones (600 eps) | Licencia | Disponibilidad |
|---|---|---|---:|---:|---|---|
| Next Passage | A* sobre (celda, t) con espera | Sí (horario de puertas y fase de obstáculos) | Sí, ante desviación de fase | 0,0 % | Apache 2.0 | Hugging Face (código + Space) |
| Estático + replanificación reactiva | Camino estático con reacción | No | Sí, tras detectar peligro | 50,0 % | no disponible | Baseline incluido en la evaluación |
| Camino más corto estático | BFS/A* estático | No | No | 61,3 % | no disponible | Baseline incluido en la evaluación |

No se dispone de comparación con planificadores espacio-temporales de terceros (por ejemplo, basados en MDP o en predicción de trayectorias) en la información proporcionada.

## Limitaciones y advertencias

- Entorno de rejilla discreta con localización perfecta y conocimiento exacto del horario de puertas; no modela incertidumbre sensorial.
- Los obstáculos se observan con exactitud y nunca reaccionan al robot; multitudes y vehículos reales sí lo hacen.
- El esfuerzo de búsqueda crece con el horizonte (160 pasos) y el número de obstáculos; en un sistema real haría falta un presupuesto de tiempo por replanificación.
- Solo simulación: no se ha validado en ningún robot físico.
- No es un modelo de lenguaje ni procesa texto, imágenes o audio; no debe evaluarse con benchmarks de IA generativa.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de validación física desaconseja su despliegue directo en producción sin adaptación.
- No se han documentado sesgos, pero el comportamiento depende fuertemente de los parámetros de densidad y probabilidad de parada elegidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Passage
- Space interactivo: https://huggingface.co/spaces/thelamapi/Next-Passage
- Vídeo de repetición (replay.mp4): incluido en el repositorio del modelo
- Imagen de estados finales (preview.png): incluida en el repositorio del modelo
