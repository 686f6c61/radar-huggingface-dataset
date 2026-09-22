# witcheer/microduck-walk-rough

## Resumen

`witcheer/microduck-walk-rough` es una politica de locomocion (gait) entrenada mediante aprendizaje por refuerzo para el robot microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de una red neuronal de control exportada a ONNX que consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, pensada para ocupar la ranura `walk` del sistema de politicas del robot. La politica es de tipo perpetuo, es decir, se ejecuta de forma continua hasta que se le indique lo contrario.

El entrenamiento se realizo en el entorno Mjlab-Velocity-Rough-MicroDuck durante 8.000 iteraciones con 4.096 entornos paralelos, empleando 324 minutos en una unica GPU RTX 5090. Todo el desarrollo es exclusivamente en simulacion: el autor indica que el robot se mantuvo erguido durante una toma de 12 segundos en terreno plano, que no se ha registrado todavia ninguna toma en terreno irregular y que la politica no se ha probado en un Microduck real.

Su relevancia actual es la de un artefacto de investigacion para flujos de sim-to-real en robotica de bajo coste. Se integra mediante el comando `robotctl policy load walk witcheer/microduck-walk-rough` y su `manifest.json` sigue el esquema 2 del manifiesto de politicas de microduck. El repositorio no declara licencia, no incluye benchmarks y acumula cero descargas, por lo que debe tratarse como material experimental sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica para control motor, exportada a ONNX; topologia interna no especificada por el autor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la politica opera con un vector de observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (solo se publica `policy.onnx`; no se anuncian variantes cuantizadas) |
| Idiomas soportados | no aplica (politica de control robotico; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompanado de `manifest.json` |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Duracion del episodio | perpetua (se ejecuta hasta recibir orden de parada) |
| Entorno de entrenamiento | Mjlab-Velocity-Rough-MicroDuck |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El autor no detalla la topologia de la red en la model card, mas alla de que se trata de una politica exportada a ONNX que se ejecuta en bucle cerrado a 50 Hz. La interfaz es completamente explicita: 61 entradas de observacion, 14 salidas de accion. El normalizador de observaciones esta embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional. El manifiesto sigue el esquema 2 del manifiesto de politicas de microduck documentado en el repositorio del demonio.

El entrenamiento se realizo con el repositorio `pollen-robotics/microduck_rl`, rama `develop`, commit `53b8971b6`, usando el entorno Mjlab-Velocity-Rough-MicroDuck: 8.000 iteraciones, 4.096 entornos en paralelo y un tiempo total de 324 minutos en una RTX 5090. No se especifica el algoritmo de RL empleado (PPO u otro), ni el volumen de muestras, ni si hubo fases de ajuste fino o de domain randomization adicionales mas alla de lo implicito en un entorno etiquetado como "rough".

## Capacidades

- Locomocion continua a 50 Hz en simulacion, con una politica de tipo perpetuo que no requiere reinicio por episodio.
- Control de marcha entrenado especificamente para terreno irregular (Mjlab-Velocity-Rough), aunque sin toma grabada en ese terreno.
- Consumo de observaciones en crudo: el normalizador va embebido en el grafo ONNX.
- Integracion directa con la ranura `walk` del sistema de politicas de microduck a traves de `robotctl`.
- Declaracion de metadatos mediante `manifest.json` conforme al esquema 2.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades de agente, vision, audio ni soporte multilingue: es un controlador motor de proposito unico.

## Casos de uso

- Investigacion en sim-to-real: usar la politica como linea base para medir la brecha entre el rendimiento en Mjlab-Velocity-Rough y el comportamiento en el robot fisico, dado que el autor reconoce que no se ha probado en hardware real.
- Punto de partida para reentrenamiento: el pipeline `pollen-robotics/microduck_rl` (rama `develop`, commit `53b8971b6`) permite reproducir las 8.000 iteraciones con 4.096 entornos y modificar recompensas o parametros de dominio.
- Evaluacion comparativa de gaits: al cargarse en la ranura `walk` mediante `robotctl policy load walk`, puede alternarse con otras politicas de marcha para comparar estabilidad y velocidad en el mismo robot.
- Docencia y divulgacion en RL aplicado a robotica: el ciclo completo (entorno de simulacion, entrenamiento en una sola GPU de consumo, exportacion ONNX, manifiesto y despliegue por CLI) es reproducible en unas cinco horas y media de computo.
- Pruebas de integracion del demonio de microduck: sirve como carga de trabajo real para validar el manejo del esquema 2 de manifiestos y la carga de politicas ONNX en el daemon.
- Generacion de datos de referencia en simulacion: al ser perpetua, puede dejarse corriendo de forma indefinida para registrar trayectorias de observacion-accion que alimenten analisis de estabilidad o entrenamiento de criticos.
- Prototipado rapido de politicas de marcha: modificar el entorno Mjlab-Velocity-Rough y reentrenar en una RTX 5090 para iterar sobre estrategias de locomocion antes de invertir en pruebas fisicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento aportada por el autor es cualitativa: el robot simulado se mantuvo erguido durante una toma de 12 segundos en terreno plano, sin toma registrada en terreno irregular.

| Metrica | Resultado |
|---|---|
| MMLU / HumanEval / GSM8K | no aplica (no es un modelo de lenguaje) |
| Tiempo de entrenamiento | 324 minutos en una RTX 5090 |
| Iteraciones de entrenamiento | 8.000 |
| Entornos paralelos | 4.096 |
| Toma en terreno plano | 12 s manteniendose erguido |
| Toma en terreno irregular | no registrada |
| Prueba en robot fisico | no realizada |

## Requisitos de hardware

- VRAM para inferencia: no disponible. El repositorio ocupa 0,0 GB y el artefacto es un unico fichero ONNX, por lo que el modelo es de tamano reducido, pero no se publican cifras de memoria ni de latencia.
- GPU para entrenamiento: una RTX 5090, con 324 minutos para 8.000 iteraciones y 4.096 entornos paralelos.
- GPU para inferencia: no especificada. No se documenta si la politica se ejecuta en CPU, en GPU de borde o en el ordenador embebido del microduck.
- Encaje en GPU de consumo: el entrenamiento ya se realizo en una GPU de consumo (RTX 5090); para inferencia no hay datos publicados.
- Opciones de despliegue: ONNX Runtime como ejecutor del grafo `policy.onnx`, cargado a traves de `robotctl policy load walk witcheer/microduck-walk-rough` en el ecosistema del demonio de microduck. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el unico dato temporal es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

No se dispone de informacion sobre politicas de locomocion publicadas para el mismo robot microduck ni sobre alternativas equivalentes con las que comparar parametros, contexto, rendimiento o licencia. El propio autor no cita comparaciones en la model card, y la busqueda web no devolvio resultados relevantes (unicamente dominios de informacion financiera sin relacion con el modelo).

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-walk-rough | no disponible | no aplica (observacion de 61 D) | 12 s erguido en plano simulado | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se ha probado en un Microduck fisico: todos los resultados proceden de simulacion y la brecha sim-to-real no esta cuantificada.
- No existe toma grabada en terreno irregular, pese a que el entrenamiento se realizo en el entorno "rough". La unica evidencia de estabilidad es una toma de 12 segundos en terreno plano.
- Ausencia total de licencia declarada: no se especifican condiciones de uso comercial, redistribucion ni modificacion, lo que impide un aprovechamiento en produccion sin aclaracion previa del autor.
- Sin benchmarks publicados: no hay numeros de recompensa, velocidad de marcha, tasa de caidas ni robustez ante perturbaciones, lo que impide una evaluacion objetiva frente a otras politicas.
- Cero descargas y cero "likes": no hay validacion independiente por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Politica de tipo perpetuo: no incorpora criterio de parada propio, por lo que el sistema anfitrion debe gestionar la terminacion del bucle de control.
- Sin soporte de lenguaje, tool calling ni agentes; cualquier expectativa en ese sentido es inaplicable a este artefacto.
- Dependencia de la interfaz exacta de 61 observaciones y 14 acciones a 50 Hz: cualquier cambio en el robot o en el esquema del manifiesto puede invalidar la politica.
- El normalizador esta embebido en el grafo ONNX, de modo que alimentar observaciones ya normalizadas produciria un comportamiento incorrecto.
- Sesgos conocidos: no disponibles, ya que no se ha realizado analisis de sesgo ni de cobertura de condiciones (pendientes, fricciones, cargas utiles) en la informacion proporcionada.
- La fecha de creacion del repositorio indicada por HuggingFace (2026-09-21) es posterior a la fecha de consulta habitual; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/witcheer/microduck-walk-rough
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `develop`, commit `53b8971b6`
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio de microduck
- Comando de despliegue: `sudo robotctl policy load walk witcheer/microduck-walk-rough`
- Resultados de la busqueda web: sin enlaces relevantes (unicamente dominios de informacion financiera ajenos al modelo)
