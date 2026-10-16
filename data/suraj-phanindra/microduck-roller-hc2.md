# suraj-phanindra/microduck-roller-hc2

## Resumen

microduck-roller-hc2 es una politica de control para robotica entrenada mediante aprendizaje por refuerzo, publicada por el usuario suraj-phanindra en HuggingFace. Se trata de un ajuste fino (finetune) del modelo juicenv/microduck-roller-es19, obtenido mediante una busqueda de tipo elitist hill climbing sobre la puntuacion de Arena, es decir, una optimizacion evolutiva simple guiada por una metrica de evaluacion. El resultado es una politica perpetua ("perpetual") para el robot microduck de Pollen Robotics, que ejecuta una marcha (gait) de forma continua hasta recibir orden de parada.

El modelo no es un modelo de lenguaje ni un transformer generativo: es una politica de control con 61 dimensiones de observacion y 14 acciones, que opera a 50 Hz y esta disenada para su despliegue sobre ruedas (rollers). Se distribuye en formato ONNX, con el normalizador de observaciones integrado dentro del propio grafo `policy.onnx`, de modo que el consumidor puede alimentar observaciones en crudo sin preprocesado adicional.

Su relevancia es acotada y muy especifica: sirve como ejemplo de pipeline de RL aplicado a robotica de bajo coste dentro del ecosistema microduck, y como material de referencia para quienes trabajan con el daemon de politicas de Pollen Robotics. No hay informacion publicada sobre arquitectura interna de la red, numero de parametros, licencia ni idiomas, y el repositorio ocupa 0,0 GB segun los metadatos, lo que sugiere un artefacto de muy pequeno tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de politica de control para robotica; arquitectura interna no publicada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje); horizonte de decision a 50 Hz |
| Tipos de cuantizacion | no disponible (se distribuye como grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible / no aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de politicas microduck) |

Especificaciones adicionales documentadas por el autor:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Plataforma objetivo | microduck (Pollen Robotics), configuracion sobre ruedas |
| Modelo base | juicenv/microduck-roller-es19 (relacion: finetune) |
| Metodo de ajuste | elitist hill climbing sobre la puntuacion de Arena |
| Tamano del repositorio | 0,0 GB |
| Repositorio de entrenamiento | pollen-robotics/microduck_rl, rama `main`, commit `6ff40704a` |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna de la red neuronal que compone la politica. Por el contexto (politica de RL para un robot cuadrupedo de bajo coste, 61 entradas y 14 salidas, ejecucion a 50 Hz en el propio robot) es plausible que se trate de un perceptron multicapa de pequeno tamano, pero esto es una inferencia y no un dato confirmado por el autor. El artefacto se distribuye como grafo ONNX autocontenido, con el normalizador de observaciones embebido en `policy.onnx`, lo que implica que el modelo espera observaciones sin normalizar.

El entrenamiento documentado consiste en un ajuste fino del modelo juicenv/microduck-roller-es19 mediante elitist hill climbing sobre la puntuacion de Arena. No se especifican el numero de iteraciones, la poblacion, la funcion de recompensa, el volumen de datos de entrenamiento ni si hubo etapas previas de RL, imitacion o destilacion. El codigo de entrenamiento reside en el repositorio `pollen-robotics/microduck_rl` (rama `main`, commit `6ff40704a`), que es la unica referencia tecnica trazable disponible.

No se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal ni mecanismos hibridos; el valor del artefacto esta en el pipeline de despliegue (manifiesto de politica, carga en slot mediante `robotctl`) mas que en la arquitectura de la red.

## Capacidades

- Generacion de una marcha (gait) perpetua para el robot microduck en configuracion de ruedas: la politica se ejecuta de forma continua hasta que se le indique lo contrario.
- Control reactivo a 50 Hz a partir de un vector de observacion de 61 dimensiones, produciendo 14 acciones de control.
- Normalizacion de observaciones integrada: el grafo ONNX acepta observaciones en crudo, sin necesidad de preprocesado externo.
- Despliegue directo en el robot mediante el daemon de politicas: carga en un slot con `robotctl policy load <slot> suraj-phanindra/microduck-roller-hc2`.
- Compatibilidad con el ecosistema de manifiestos de microduck (schema 2), lo que facilita su integracion en el flujo de trabajo estandar del robot.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni soporte de tool calling o function calling.
- No dispone de capacidades multilingues ni de modo de razonamiento explicito.

## Casos de uso

- Despliegue de una marcha base en un microduck con ruedas: cargar la politica en un slot del daemon y dejar que el robot se desplace de forma continua mientras no se reciba una orden de parada. Es adecuado porque la politica esta disenada explicitamente como perpetua y a 50 Hz.
- Punto de partida para ajuste fino propio: al derivar de juicenv/microduck-roller-es19 y ser un artefacto de RL, sirve como inicializacion para experimentos de hill climbing u otros optimizadores sobre la puntuacion de Arena.
- Evaluacion comparativa de politicas en el benchmark Arena: permite contrastar el efecto del elitist hill climbing frente al modelo base bajo la misma metrica de evaluacion.
- Docencia y prototipado en robotica de bajo coste: el flujo `robotctl policy load` y el manifiesto schema 2 permiten ilustrar un pipeline completo de RL a despliegue en un robot real con muy poca infraestructura.
- Pruebas de integracion del daemon de politicas: al ser un ONNX pequeno con normalizador embebido, es util para validar la carga de politicas, la gestion de slots y el ciclo de control del daemon.
- Investigacion en control de locomotion sobre ruedas: sirve como linea base reproducible (commit de entrenamiento identificado) para comparar variantes de algoritmos evolutivos aplicados a politicas de control.
- Uso como componente en simulacion: el grafo ONNX puede ejecutarse fuera del robot para reproducir la politica en un entorno simulado antes de desplegarla en hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que el ajuste se realizo "on the Arena score", pero no se proporciona el valor numerico obtenido, ni la puntuacion del modelo base, ni la definicion exacta de la metrica. Tampoco hay datos de retorno episodico, velocidad de avance, estabilidad de la marcha ni tasa de exito.

| Metrica | microduck-roller-hc2 | Modelo base (microduck-roller-es19) |
|---|---|---|
| Puntuacion Arena | no disponible | no disponible |
| Retorno episodico | no disponible | no disponible |
| Estabilidad de marcha | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB segun los metadatos de HuggingFace, lo que indica un artefacto de muy pequeno tamano, pero no se publica el numero de parametros ni el peso exacto del fichero ONNX.
- GPU recomendadas: no disponibles. Al tratarse de una politica de control a 50 Hz con 61 entradas y 14 salidas, es previsible que la inferencia en CPU sea suficiente, pero esto no esta confirmado por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Por el tipo de artefacto es esperable que pueda ejecutarse en hardware muy modesto (incluso en el propio ordenador del robot), pero no hay datos publicados.
- Opciones de despliegue: el despliegue previsto es mediante el daemon de politicas de microduck (`robotctl policy load <slot> ...`). El formato ONNX permite ejecucion con ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican a esta politica.
- Latencia y throughput: no disponibles. El unico dato temporal documentado es la frecuencia de control de 50 Hz (periodo de 20 ms), que marca el presupuesto de computo maximo por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-roller-hc2 | Politica RL (ONNX) para microduck | no disponible | no aplica | no disponible | no disponible | HuggingFace (suraj-phanindra/microduck-roller-hc2) |
| juicenv/microduck-roller-es19 | Politica RL (ONNX) para microduck | no disponible | no aplica | no disponible | no disponible | HuggingFace (modelo base del anterior) |
| Otras politicas del ecosistema microduck | Politica RL | no disponible | no aplica | no disponible | no disponible | Parcialmente en HuggingFace bajo la organizacion juicenv y afines |

No se dispone de datos suficientes para una comparativa cuantitativa. La unica relacion documentada con certeza es la de ajuste fino entre microduck-roller-hc2 y juicenv/microduck-roller-es19, y en ambos casos se desconoce la puntuacion de Arena, el numero de parametros y la licencia.

## Limitaciones y advertencias

- Ausencia total de model card tecnica detallada: no hay informacion sobre arquitectura, numero de parametros, datos de entrenamiento, hiperparametros ni funcion de recompensa.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido. Al derivar de juicenv/microduck-roller-es19, habria que verificar tambien la licencia del modelo base, que tampoco se indica.
- Especificidad extrema de hardware: la politica esta entrenada para el microduck sobre ruedas con 61 observaciones y 14 acciones. No es transferible a otras plataformas sin reentrenamiento.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base, pese a que el ajuste se presenta como una optimizacion sobre la puntuacion de Arena.
- Riesgo de sobreajuste al benchmark: el elitist hill climbing sobre una unica metrica (Arena score) puede producir politicas que optimizan dicha metrica sin generalizar a condiciones reales de operacion (terrenos irregulares, perturbaciones, desgaste de motores).
- Comportamiento perpetuo: la politica "runs until told otherwise", por lo que requiere un mecanismo externo de parada o de supervision; no se documentan condiciones de seguridad, limites de parada de emergencia ni deteccion de fallos.
- Sin capacidades de lenguaje, vision, audio ni tool calling: no debe evaluarse con criterios de modelos generativos.
- La informacion de busqueda web disponible no contiene resultados relevantes sobre este modelo; los resultados obtenidos no guardan ninguna relacion con el artefacto y no se han usado como fuente.
- Metadatos con fechas incoherentes: la fecha de creacion indicada en HuggingFace (2026-10-15) es posterior a la fecha de la propia consulta, lo que sugiere un error en los metadatos o en el reloj del sistema de publicacion.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad ni evidencia de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/suraj-phanindra/microduck-roller-hc2
- Modelo base: https://huggingface.co/juicenv/microduck-roller-es19
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `main`, commit `6ff40704a` (sin URL directa proporcionada en la informacion disponible)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa proporcionada en la informacion disponible)
- Papers, blogs, demos y resultados de busqueda web relevantes: no disponibles (los resultados de busqueda obtenidos no estan relacionados con el modelo)
