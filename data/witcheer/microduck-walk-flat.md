# witcheer/microduck-walk-flat

## Resumen

`witcheer/microduck-walk-flat` es una politica de control por aprendizaje por refuerzo (RL) para el robot microduck de Pollen Robotics, publicada por el usuario witcheer en Hugging Face. No es un modelo de lenguaje ni un modelo generativo multimodal: se trata de un fichero `policy.onnx` que implementa una marcha (gait) de locomocion sobre terreno plano, pensada para ocupar el slot `walk` del robot. La politica es "perpetua", es decir, se ejecuta de forma continua hasta que se le indique lo contrario.

El entrenamiento se realizo exclusivamente en simulacion, sobre la tarea `Mjlab-Velocity-Flat-MicroDuck`, durante 4.000 iteraciones con 4.096 entornos en paralelo, y completo en 58 minutos sobre una unica RTX 5090. La politica consume observaciones de 61 dimensiones, emite 14 acciones y opera a 50 Hz. En la simulacion de inferencia de Pollen mantuvo 0,15 m/s ante un comando de 0,30 m/s durante 12 segundos, con el tronco entre 119 y 121 mm de altura.

Su relevancia es doble: por un lado, ilustra el flujo de trabajo actual de sim-to-real en robotica open source, donde una politica completa se entrena en menos de una hora en una GPU de consumo y se distribuye como un artefacto ONNX autonomo (el normalizador de observaciones va embebido en el propio fichero). Por otro, es un ejemplo de publicacion de pesos de control con manifiesto de metadatos versionado (schema 2 del manifesto de politicas de microduck). El propio autor advierte de que la politica aun no se ha probado en un Microduck real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada mediante aprendizaje por refuerzo en simulacion y exportada a ONNX; topologia concreta y algoritmo de RL no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica; politica reactiva paso a paso. Observacion de 61 dimensiones por paso y 14 acciones, a 50 Hz |
| Tipos de cuantizacion | no disponible; se distribuye un unico `policy.onnx` cuya precision interna no se especifica |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`); metadatos adicionales en `manifest.json` (schema 2 del manifiesto de politicas de microduck) |
| Espacio de observacion | 61 dimensiones |
| Espacio de acciones | 14 dimensiones |
| Frecuencia de control | 50 Hz |
| Tamano del repositorio | 0,0 GB (redondeado por Hugging Face) |
| Tipo de politica | Perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la topologia de la red ni el algoritmo de optimizacion empleado. Lo que si se documenta es el procedimiento de entrenamiento: la tarea `Mjlab-Velocity-Flat-MicroDuck`, un entorno de simulacion de seguimiento de velocidad sobre terreno plano, ejecutado durante 4.000 iteraciones con 4.096 entornos en paralelo. El entrenamiento completo requirio 58 minutos en una unica RTX 5090. El codigo de entrenamiento corresponde al repositorio `pollen-robotics/microduck_rl`, rama `develop`, commit `53b8971b6`. No se especifica el volumen de datos, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino tipo RLHF o DPO (conceptos, por otro lado, propios del entrenamiento de modelos de lenguaje y no del control por RL).

Una decision tecnica destacable es el empaquetado del artefacto: el normalizador de observaciones va embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin preprocesado externo. Esto reduce el riesgo de desajustes entre el entorno de entrenamiento y el de despliegue, un problema habitual en pipelines de sim-to-real. La politica se integra en el robot mediante el comando `sudo robotctl policy load walk witcheer/microduck-walk-flat`, y su manifiesto sigue el schema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Generacion de marcha de locomocion sobre terreno plano para el robot microduck, en el slot `walk`.
- Seguimiento de comandos de velocidad: en simulacion mantuvo 0,15 m/s ante una consigna de 0,30 m/s.
- Control continuo a 50 Hz con 14 actuaciones y observaciones de 61 dimensiones.
- Ejecucion perpetua: la politica no incluye una condicion de terminacion propia, sino que corre hasta que el sistema de control la detiene.
- Autocontencion en inferencia: normalizacion de observaciones integrada en el fichero ONNX.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues (no aplica).

## Casos de uso

- Base de locomocion para el microduck: cargar la politica en el slot `walk` con `robotctl` y usarla como marcha por defecto sobre superficies planas, sin necesidad de entrenar una politica propia.
- Investigacion en aprendizaje por refuerzo para robotica: servir como punto de partida reproducible (tarea, commit y recuento de iteraciones documentados) para comparar hiperparametros o algoritmos de RL sobre la misma tarea de seguimiento de velocidad.
- Ciclos rapidos de experimentacion: con 58 minutos de entrenamiento en una RTX 5090, el flujo completo de reentrenamiento cabe en una sesion de trabajo, lo que permite iterar sobre recompensas y dominios de aleatorizacion sin clústeres dedicados.
- Validacion de pipelines de inferencia: al ser un ONNX pequeno y autocontenido, es util para medir latencia, consumo de memoria y estabilidad de un runtime ONNX en el bucle de control a 50 Hz antes de desplegar politicas mas costosas.
- Pruebas de sim-to-real: usar la politica en el simulador de inferencia de Pollen como referencia de comportamiento esperado y, a continuacion, contrastar el resultado en hardware real para cuantificar la brecha de similitud.
- Evaluacion de manifiestos de politicas: como ejemplo funcional del schema 2 del manifiesto de microduck, sirve para validar herramientas de carga, versionado y despliegue de politicas.
- Docencia y prototipado en robotica: permite montar un ejemplo completo de entrenamiento, exportacion a ONNX y ejecucion en robot con un coste de computo bajo y codigo abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplican MMLU, HumanEval, GSM8K ni metricas equivalentes, al no tratarse de un modelo de lenguaje). Los unicos datos de evaluacion documentados son los de la simulacion de inferencia de Pollen:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Velocidad alcanzada | 0,15 m/s | Comando de 0,30 m/s |
| Duracion de la prueba | 12 s | Simulacion de inferencia de Pollen |
| Altura del tronco | 119 a 121 mm | Durante la misma prueba |
| Iteraciones de entrenamiento | 4.000 | 4.096 entornos en paralelo |
| Tiempo de entrenamiento | 58 min | Una RTX 5090 |
| Validacion en robot real | no realizada | El autor indica que aun no se ha probado |

Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo ni con la tarea de referencia; los resultados obtenidos correspondian a consultas no relacionadas sobre valvulas, curriculos y herramientas de modelado 3D.

## Requisitos de hardware

- Inferencia: no se especifica VRAM ni latencia. El repositorio ocupa 0,0 GB (redondeado), lo que indica un fichero ONNX de muy pocos megabytes; con ese orden de magnitud la inferencia es viable en CPU y en cualquier GPU, incluida la propia computadora del robot.
- Entrenamiento: el autor documenta 58 minutos en una unica RTX 5090, con 4.096 entornos en paralelo. No se documentan requisitos de memoria ni de CPU para ese entrenamiento.
- GPU de consumo: el entrenamiento ya se valido en una GPU de consumo (RTX 5090). No hay datos para A100, H100 o RTX 4090 en esta tarea.
- Opciones de despliegue: runtime ONNX (integrado mediante el comando `robotctl policy load` del daemon de microduck). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de control.
- Latencia y throughput: no disponibles. El unico dato temporal es la frecuencia de control, 50 Hz, que fija el presupuesto de tiempo por paso en 20 ms.
- Entorno de simulacion: el entrenamiento se realizo en la tarea `Mjlab-Velocity-Flat-MicroDuck` y la evaluacion en la simulacion de inferencia de Pollen. No se detallan versiones ni dependencias.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas de locomocion para el microduck ni modelos de la misma categoria con los que comparar parametros, contexto, rendimiento o licencia. Las busquedas web realizadas no aportaron alternativas relacionadas. Como referencia interna del propio artefacto, la comparacion natural seria con otras marchas del mismo autor o de la comunidad para el slot `walk` del microduck, pero no se dispone de datos de ninguna de ellas.

## Limitaciones y advertencias

- Entrenada exclusivamente en simulacion y no probada en un Microduck real, segun indica el propio autor. El comportamiento en hardware fisico es incierto.
- Rendimiento por debajo de la consigna: alcanzo 0,15 m/s frente a un comando de 0,30 m/s, es decir, aproximadamente la mitad de la velocidad solicitada.
- La evaluacion documentada dura solo 12 segundos, por lo que no hay evidencia de estabilidad en ejecuciones prolongadas pese a tratarse de una politica perpetua.
- Especifica para terreno plano (`flat`). No hay datos sobre su comportamiento en pendientes, escaleras, obstaculos ni superficies deformables.
- Sin licencia declarada. La ausencia de licencia impide determinar si el uso comercial esta permitido; en la practica, debe tratarse como no autorizado hasta que el autor lo aclare.
- Sin datos sobre el dominio de aleatorizacion usado en el entrenamiento, lo que dificulta estimar su robustez ante variaciones de friccion, masa o retardo de actuacion.
- Metadatos incompletos: no se especifica el numero de parametros, la topologia de la red, el algoritmo de RL ni la precision numerica del ONNX, lo que limita la reproducibilidad y el analisis de eficiencia.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni evaluaciones de terceros.
- No aplican sesgos de contenido ni riesgo de alucinacion en el sentido de los modelos de lenguaje, pero si existe riesgo de generalizacion defectuosa fuera de las condiciones de entrenamiento, con consecuencias fisicas directas si se despliega en un robot real sin pruebas previas.
- No aplica soporte de idiomas ni restricciones de contexto textual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/witcheer/microduck-walk-flat
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `develop`, commit `53b8971b6` (URL no disponible en la informacion proporcionada)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (URL no disponible en la informacion proporcionada)
- Tarea de entrenamiento: `Mjlab-Velocity-Flat-MicroDuck` (URL no disponible en la informacion proporcionada)
- Paper o publicacion tecnica: no disponible
- Demo: no disponible
- Resultados de busqueda web: sin resultados relevantes para este modelo
