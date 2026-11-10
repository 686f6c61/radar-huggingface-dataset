# wentywenty/robopoly-action-rpo-getup

## Resumen

RPO Getup es una politica de control para robots humanoides, distribuida como un modelo de accion en formato ONNX dentro del ecosistema Robopoly. Lo publica el usuario wentywenty y su funcion concreta es resolver la tarea de levantarse tras una caida (getup) para la plataforma robótica denominada `rpo`. No es un modelo de lenguaje ni un modelo generativo de proposito general: se trata de un artefacto de inferencia que mapea observaciones (`obs`) a acciones (`actions`) a una frecuencia de 250 Hz, pensado para ejecutarse en el lazo de control de un robot fisico.

El modelo se encuadra dentro de la familia de tecnicas etiquetadas como RPO (del ingles, presumiblemente relacionado con optimizacion de politicas para robotics) y esta catalogado con nivel de seguridad S2, lo que implica que su ejecucion conlleva riesgos y requiere confirmacion humana explicita antes de habilitarlo. La plataforma destino declara 23 grados de libertad (DOF) y compatibilidad exclusiva con el modelo `rpo`.

En el momento de redactar esta ficha, el repositorio no registra descargas ni interacciones, el peso del repositorio es practicamente nulo (0,0 GB) y la licencia de los pesos figura como pendiente de confirmacion. Se trata, por tanto, de un piloto publico de validacion mas que de un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control exportada a ONNX; no se detalla la topologia interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de control robotico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | codigo: GPL-3.0-only; pesos: other (pendiente de confirmacion) |
| Formato de pesos | ONNX (`models/policy_getup.onnx`) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna de la politica: no se especifica si se trata de un perceptron multicapa, una red recurrente, un transformer de politica o una arquitectura hibrida. Lo unico confirmado es que el artefacto final se distribuye como grafo ONNX, lo que permite su despliegue en runtimes de inferencia compatibles con este formato y su integracion en el lazo de control a 250 Hz.

Tampoco se detallan los datos de entrenamiento, el numero de episodios, la composicion del dataset ni si se emplearon tecnicas de aprendizaje por refuerzo, imitacion o una combinacion de ambas. La unica referencia a datos es el fichero `motions/getup.npz`, que probablemente contiene las trayectorias de referencia o el dataset de movimiento asociado a la habilidad de levantarse, pero su contenido no esta descrito en la model card. Se indica un commit de origen (`ee9174c`) y un hash SHA256 del peso (`4327d9400e38952e31b62df4db241bbe16bc3cfc36832998aae631d15375dfcd`), lo que permite verificar la integridad del binario pero no aporta informacion sobre el proceso de entrenamiento.

## Capacidades

- Ejecucion de una habilidad motora concreta: levantarse desde una posicion de caida (getup) en un robot humanoide de 23 DOF.
- Inferencia a 250 Hz, adecuada para bucles de control en tiempo real.
- Mapeo directo de observaciones a acciones (`obs` -> `actions`), sin necesidad de planificacion simbolica externa.
- Integracion con el sistema de paquetes Robopoly mediante comandos de instalacion, verificacion y rollback.
- Compatibilidad declarada exclusivamente con la plataforma `rpo` y su configuracion de 23 grados de libertad.
- Clasificacion de seguridad S2, que implica controles de habilitacion manual antes de la ejecucion.

## Casos de uso

- Recuperacion autonoma tras caida en robot humanoide: la politica permite que el robot vuelva a una postura estable sin intervencion manual, reduciendo tiempos de inactividad en entornos de investigacion o demostracion.
- Validacion en simulacion de politicas de getup: dado que la model card advierte que las previsualizaciones pueden ser simuladas, el modelo sirve como referencia para comparar el comportamiento simulado con el real antes de desplegar en hardware.
- Banco de pruebas de seguridad robotica: al estar marcado como S2, es util para disenar y probar protocolos de habilitacion, parada de emergencia y limpieza de area antes de ejecutar movimientos de riesgo.
- Investigacion en control de humanoides: permite estudiar como se comporta una politica entrenada especificamente para getup en una plataforma de 23 DOF, sirviendo de linea base para comparar con otras aproximaciones.
- Integracion en pipelines de CI para robotica: los comandos `robopoly action install`, `verify` y `rollback` facilitan incluir la politica en flujos automatizados de despliegue y reversión.
- Formacion y demostraciones tecnicas: el modelo puede emplearse en sesiones donde se explique el ciclo completo de instalacion, verificacion de integridad por hash y ejecucion controlada de una habilidad motora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamano del grafo ONNX no se especifica en la informacion proporcionada).
- GPU recomendadas: no disponible; al ser una politica de control a 250 Hz, es probable que pueda ejecutarse en hardware embebido o en GPU de gama media, pero no hay datos que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime ONNX compatible con el ecosistema Robopoly; el resto de opciones (ONNX Runtime, TensorRT, etc.) no se detallan.
- Latencia y throughput: se declara una frecuencia de operacion de 250 Hz, lo que implica un presupuesto de 4 ms por ciclo, pero no se aportan mediciones reales de latencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (politicas de getup para humanoides) ni datos de rendimiento que permitan establecer una comparacion objetiva.

## Limitaciones y advertencias

- La licencia de los pesos figura como `other` y esta pendiente de confirmacion; el uso comercial no esta garantizado hasta que se aclare.
- El codigo asociado se distribuye bajo GPL-3.0-only, lo que impone obligaciones de copyleft si se reutiliza o modifica.
- El modelo esta marcado con nivel de seguridad S2: requiere soporte fiable, parada de emergencia accesible, limitacion de corriente y realimentacion CAN operativa antes de ejecutarse.
- La habilitacion no es automatica tras la instalacion; el usuario debe confirmarla explicitamente.
- Las previsualizaciones pueden corresponder a simulacion y no reflejan necesariamente el comportamiento en el robot real.
- Compatibilidad limitada a la plataforma `rpo` con 23 DOF; no se garantiza su funcionamiento en otras plataformas.
- No hay informacion sobre sesgos, alucinacion (concepto no aplicable a un modelo de control) ni comportamiento en condiciones no vistas.
- El repositorio no registra descargas ni interacciones, y su tamano es practicamente nulo, lo que sugiere que el artefacto puede no estar completamente subido o que se trata de un piloto de validacion.
- No se especifican los datos de entrenamiento ni la arquitectura, lo que dificulta la reproducibilidad y la evaluacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wentywenty/robopoly-action-rpo-getup
- Repositorio upstream de inferencia: `Roboparty/roboparty_inference` (ruta interna `robots/rpo/models/policy_getup.onnx`, commit `ee9174c`); no se proporciona URL directa en la informacion disponible.
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
