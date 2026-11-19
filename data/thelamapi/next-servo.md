# thelamapi/Next-Servo

## Resumen

Next-Servo es un proyecto de planificación de movimiento para un brazo robótico planar de dos articulaciones, publicado en Hugging Face por el usuario thelamapi bajo el pipeline `robotics`. No se trata de un modelo de lenguaje ni de una red neuronal entrenada: el repositorio contiene un planificador geométrico determinista que calcula cómo transportar una carga circular alrededor de un obstáculo estático, junto con un script de evaluación y otro de renderizado que genera una reproducción en vídeo del movimiento planificado.

El problema que aborda es el clásico de planificación de caminos en espacio de configuraciones con restricciones de colisión: el planificador calcula ambas ramas de cinemática inversa en origen y destino, explora una rejilla de articulaciones con paso de 5 grados mediante búsqueda en anchura (BFS) y conecta la ruta resultante con los extremos exactos, verificando la holgura de eslabones y carga en cada arista. Se compara contra una línea base de interpolación directa en espacio articular.

Es relevante como ejemplo reproducible y didáctico de planificación con verificación conservadora de colisiones, no como componente listo para producción: el alcance declarado es una simulación geométrica planar con eslabones rígidos de longitud unitaria y anchura cero, sin dinámica, sin límites de velocidad y sin modelo de agarre. El repositorio ocupa 0.0 GB y no incluye pesos ni artefactos de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Planificador geometrico clasico: cinematica inversa analitica de 2 articulaciones + busqueda en anchura (BFS) sobre rejilla articular de 5 grados, con conexion a extremos exactos y verificacion de holgura por arista |
| Parametros totales | no disponible (no es un modelo neuronal; no hay pesos) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts Python: `evaluate.py`, `render.py`, `requirements.txt` y artefactos de salida como `evaluation.json`, `replay.mp4`, `preview.png`) |

## Arquitectura y entrenamiento

No hay entrenamiento ni aprendizaje automatico. El sistema es un planificador geometrico determinista para un brazo planar de dos articulaciones con eslabones rigidos de longitud unitaria y anchura cero, una carga circular y un obstaculo circular estatico. El procedimiento es: calcular las dos ramas de cinematica inversa en la pose inicial (pickup) y en la final (destino), explorar una rejilla de articulaciones con resolucion de 5 grados mediante BFS, y conectar la ruta de rejilla a los extremos exactos mediante interpolacion.

Cada arista se valida con una comprobacion de holgura de eslabones y carga; para la arista interpolada completa se usa una cota del movimiento entre muestras que proporciona una verificacion conservadora. La linea base sustituye la busqueda por una unica interpolacion recta en espacio articular entre cada par de ramas de cinematica inversa, con la misma comprobacion de arista. El movimiento es puramente cinematico y el tiempo de reproduccion es ilustrativo. La precision numerica reportada es alta: el error maximo de punto final en ejecuciones aceptadas fue de 7.03e-16 unidades de longitud.

## Capacidades

- Planificacion de movimiento en espacio articular para un brazo planar de 2 articulaciones con obstaculo circular estatico y carga circular.
- Calculo de ambas ramas de cinematica inversa en origen y destino, lo que permite elegir configuracion de codo.
- Busqueda de rutas con poses intermedias cuando la interpolacion directa falla (desvíos).
- Verificacion conservadora de colision por arista, incluyendo cota de movimiento entre muestras para la arista interpolada.
- Deteccion de casos no certificables: una reyeccion significa que el algoritmo no certifico una ruta bajo sus restricciones, no necesariamente que la ruta sea imposible.
- Evaluacion reproducible sobre cargas aleatorias con semillas fijas (19, 73, 149) y exportacion de entradas y resultados a `evaluation.json`.
- Renderizado de la reproduccion del movimiento planificado a video MP4 (requiere FFmpeg en PATH).
- No soporta tool calling, agentes, razonamiento multi-paso en lenguaje natural, vision, audio ni capacidades multilingues: los metadatos declaran unicamente el idioma `en` y la etiqueta `robotics`.

## Casos de uso

- Docencia de planificacion de movimiento: el repositorio sirve como ejemplo minimo y reproducible de cinematica inversa con dos ramas, BFS en rejilla articular y verificacion de colisiones, ejecutable con `pip install -r requirements.txt` y `python evaluate.py`.
- Comparacion de estrategias de planificacion: la tabla de resultados permite contrastar interpolacion directa frente a planificacion con poses intermedias sobre el mismo conjunto de instancias y las mismas comprobaciones de arista.
- Generacion de material audiovisual tecnico: `render.py` produce una reproduccion MP4 de 14 segundos del movimiento real del planificador, util para documentar o presentar el comportamiento del algoritmo.
- Validacion de comprobaciones de colision conservadoras: los cuatro chequeos adicionales (transferencia libre, pickup bloqueado, destino bloqueado y base bloqueada) sirven como casos de prueba de una funcion de verificacion de holgura.
- Prototipado de la capa geometrica antes de incorporar dinamica: el planificador puede usarse como referencia de rutas en espacio articular que despues se validen en un simulador fisico con geometria real.
- Analisis de sensibilidad a la resolucion de rejilla: el paso de 5 grados es un parametro del planificador y el banco de evaluacion con semillas fijas permite medir el efecto de cambiarlo sobre la tasa de aceptacion.

## Benchmarks y rendimiento

Los unicos datos publicados son las tasas de aceptacion del planificador frente a la interpolacion directa, sobre el mismo chequeo de arista:

| Carga simulada | Planificador de rejilla aceptado | Interpolacion directa aceptada |
|---|---:|---:|
| Cuatro ejemplos de desvio seleccionados | 4/4 | 0/4 |
| Carga aleatoria, semilla 19 | 63/80 | 51/80 |
| Carga aleatoria, semilla 73 | 59/80 | 46/80 |
| Carga aleatoria, semilla 149 | 63/80 | 54/80 |
| **Total carga aleatoria** | **185/240** | **151/240** |

Los cuatro ejemplos de la reproduccion se seleccionaron precisamente por ser casos en los que la interpolacion directa fue rechazada, por lo que la comparacion 4/4 frente a 0/4 no es representativa del rendimiento global. La carga aleatoria incluye instancias que pueden ser infeasibles. Ademas, pasaron cuatro comprobaciones adicionales: transferencia libre, pickup bloqueado, destino bloqueado y base bloqueada. Todas las rutas de rejilla aceptadas superaron la comprobacion conservadora de arista. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni aplican a este tipo de sistema.

## Requisitos de hardware

- No requiere GPU: el planificador es codigo Python de geometria y busqueda, sin inferencia neuronal.
- VRAM estimada: no aplica (no hay pesos ni modelo que cargar).
- GPU recomendadas: no aplica; cualquier CPU capaz de ejecutar Python es suficiente para la planificacion.
- Cabe en cualquier equipo de consumo: el coste dominante es el tiempo de CPU del BFS sobre la rejilla de 5 grados y de las comprobaciones de arista.
- Despliegue: ejecucion directa con `python evaluate.py` y `python render.py`; el renderizado de video requiere FFmpeg en el PATH. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; no se publican tiempos de ejecucion por instancia.

## Comparativa con modelos similares

| Sistema | Tipo | Enfoque | Verificacion de colision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Next-Servo | Planificador geometrico para brazo planar de 2 articulaciones | IK de dos ramas + BFS en rejilla de 5 grados + conexion a extremos exactos | Conservadora por arista, con cota entre muestras | no disponible | Repositorio Hugging Face + Space de demo |
| Interpolacion directa (linea base incluida) | Planificador geometrico | Interpolacion recta en espacio articular entre ramas de IK | Misma comprobacion de arista | no disponible | Incluida en el mismo repositorio |
| Planificadores clasicos tipo RRT, PRM o A* en espacio de configuraciones | Planificadores muestrales o de rejilla | Muestreo aleatorio o busqueda heuristica | Depende de la implementacion | variable | Implementaciones multiples de codigo abierto |

No se dispone de comparaciones publicadas frente a planificadores concretos con metricas homogeneas; la unica comparacion cuantitativa disponible es la de la tabla de benchmarks frente a la interpolacion directa.

## Limitaciones y advertencias

- Alcance restringido: simulacion geometrica planar, eslabones rigidos de longitud unitaria y anchura cero, carga circular y un unico obstaculo circular estatico.
- Sin dinamica: no modela masas, inercias, pares, limites de velocidad ni esfuerzos; el tiempo de reproduccion es ilustrativo.
- Sin modelo de agarre ni de hardware: un brazo fisico necesita su propia geometria, modelo de colision, limites de velocidad, agarre y validacion en hardware.
- Una reyeccion no implica infeasibilidad: significa que el algoritmo no certifico una ruta bajo sus restricciones, por lo que la tasa de aceptacion subestima potencialmente las rutas validas.
- La comparacion 4/4 frente a 0/4 corresponde a ejemplos seleccionados por el fallo de la interpolacion directa; no debe interpretarse como rendimiento global.
- La carga aleatoria incluye instancias posiblemente infeasibles, lo que limita la interpretacion de los totales 185/240 y 151/240.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion del codigo sin consultar al autor.
- Idiomas: los metadatos declaran unicamente `en`; no hay soporte multilingue ni interfaz en castellano.
- Sin sesgos de datos que reportar al no existir entrenamiento, pero tampoco hay garantias de robustez fuera del escenario geometrico descrito.
- Repositorio sin descargas y con un unico like en el momento de la consulta: no hay evidencia de uso externo ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Servo
- Demo (Space): https://huggingface.co/spaces/thelamapi/Next-Servo
- Reproduccion en video (incluida en el repositorio): replay.mp4, referenciada desde la model card
- Imagen de previsualizacion (incluida en el repositorio): preview.png
- Resultados de evaluacion exportados por el evaluador: evaluation.json
- Codigo de evaluacion y renderizado: evaluate.py y render.py en el repositorio
