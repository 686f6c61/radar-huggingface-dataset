# yaoxiao-0512/collie-getup-v1

## Resumen

Collie Get-Up Policy v1 (repositorio `yaoxiao-0512/collie-getup-v1`) es una politica de control entrenada con aprendizaje por refuerzo para el cuadrupedo BorderCollieRobot. Su unica funcion es la recuperacion: partiendo de una postura de caida (tumbado de lado o boca arriba), devuelve al robot a una posicion erguida. No es un modelo de lenguaje, sino un checkpoint de politica (`.pt`) entrenado con PPO, por lo que los parametros habituales de una ficha de LLM (contexto, idiomas, cuantizacion) no son aplicables.

El artefacto publicado es `getup_v1_model_199.pt`, un checkpoint PPO tras 200 iteraciones de entrenamiento sobre la tarea `Collie-GetUp-Flat`, definida en terreno plano. La politica se integra mediante un contrato compartido de observacion de 61 dimensiones y accion de 22 dimensiones (`policy_runner.PolicyManager`), lo que permite intercambiarla en caliente con otras politicas de la misma pila.

Su relevancia practica esta en el papel que ocupa dentro de una jerarquia de habilidades: la model card indica explicitamente que la politica levanta al robot de forma fiable, pero no se mantiene perfectamente quieta (6 por ciento de exito en evaluacion estricta con 1 segundo de inmovilidad), por lo que el uso recomendado es una conmutacion dura a una politica de equilibrio (`stand`) al detectar posicion erguida, seguida de una mezcla lineal de 0,2 segundos. Es un componente de recuperacion autonomo, no un sistema de locomocion completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica entrenada con PPO (Proximal Policy Optimization); topologia interna no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (espacio de observacion de 61 dimensiones y accion de 22 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (politica de control robotico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), checkpoint `getup_v1_model_199.pt` |
| Tarea | `Collie-GetUp-Flat` (kind=`getup`, terreno plano) |
| Recompensas | `getup_stand` 1.0, `getup_terminal_damping` 0.5, `getup_foot_spread` 1.0 |
| Iteraciones de entrenamiento | 200 |
| Interfaz de integracion | `policy_runner.PolicyManager` (61-D observacion / 22-D accion) |
| Tamano del repositorio | 0.0 GB segun HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-08 (segun HuggingFace) |

## Arquitectura y entrenamiento

La informacion disponible describe el metodo de entrenamiento, no la topologia de red. La politica se obtuvo mediante PPO (optimizacion de politica proximal) durante 200 iteraciones sobre la tarea `Collie-GetUp-Flat`, con recompensa compuesta por tres terminos: `getup_stand` con peso 1,0 (objetivo principal de levantarse), `getup_terminal_damping` con peso 0,5 (amortiguacion al final del movimiento) y `getup_foot_spread` con peso 1,0 (separacion de patas). La recompensa `getup_stand` converge a 0,80 durante el entrenamiento.

La model card situa el checkpoint dentro de un pipeline de RL mas amplio denominado BorderCollieRobot, con fases declaradas: Phase 1 HPO, Phase 2 PPO, RMA, AMP y skills. No se detallan la composicion del dataset, el simulador empleado, el numero de muestras, ni si hubo fases adicionales de ajuste. Se menciona un informe tecnico enlazado, pero la URL presente en la model card es un marcador genérico (`https://github.com/`) sin ruta de repositorio, por lo que no es verificable.

El aspecto tecnico mas relevante documentado es el mecanismo de conmutacion entre politicas: al detectar posicion erguida se recomienda un cambio duro a la politica `stand` combinado con una mezcla lineal de 0,2 segundos, lo que eleva el exito de conmutacion al 88 por ciento y reduce el salto de accion un 52 por ciento respecto a un corte seco.

## Capacidades

- Recuperacion desde caida: levanta al cuadrupedo desde posturas de tumbado de lado o boca arriba hasta posicion erguida.
- Operacion en terreno plano: la tarea de entrenamiento declarada es `Collie-GetUp-Flat`, sin pendientes ni obstaculos.
- Conmutacion en caliente: compatible con un contrato de observacion de 61 dimensiones y accion de 22 dimensiones, lo que permite sustitucion con otras politicas del mismo pipeline.
- Encadenamiento con politica de equilibrio: diseno explicito para ceder el control a `stand` tras detectar posicion erguida, con mezcla de 0,2 segundos.
- Regularizacion de la postura final: los terminos `getup_terminal_damping` y `getup_foot_spread` penalizan/favorecen amortiguacion final y separacion de patas.
- Sin capacidades de lenguaje, vision, audio, tool calling, agentes ni razonamiento multi-paso: no aplica a este tipo de artefacto.

## Casos de uso

- Recuperacion autonoma en inspeccion industrial: un cuadrupedo que patrulla una planta puede volcar por contacto con obstaculos o desniveles; esta politica le permite levantarse sin intervencion humana y reincorporarse a la ruta.
- Operacion continua en almacenes y logistica: tras una colision con carretillas o estanterias, el robot recupera la vertical y retoma el ciclo de transporte, reduciendo el tiempo de parada no planificado.
- Misiones de busqueda y rescate en interiores: en entornos con escombros el robot puede caer; la politica de get-up actua como capa de tolerancia a fallos antes de devolver el control a la politica de locomocion.
- Vigilancia perimetral nocturna: permite reanudar el patrullaje tras una caida en bordillos o escalones bajos, con la conmutacion a `stand` reduciendo la discontinuidad de acciones que podria provocar una segunda caida.
- Base de investigacion en aprendizaje por refuerzo jerarquico: sirve como habilidad primitiva dentro de un esquema getup → stand → locomotion, util para estudiar composicion de politicas y conmutacion con mezclas lineales.
- Validacion de transferencia simulacion-a-realidad: al estar entrenada sobre terreno plano y con una interfaz de observacion/accion fija, es un candidato adecuado para medir la brecha sim-to-real en una habilidad acotada y medible.
- Demostraciones publicas y robótica de compania: un robot domestico golpeado o empujado puede volver a levantarse, lo que mejora la percepcion de robustez en entornos con presencia humana.
- Teleoperacion con recuperacion asistida: si el operador provoca una caida durante maniobras agresivas, la politica restaura la postura y devuelve el control, evitando una intervencion manual en el robot.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Recompensa `getup_stand` en entrenamiento | 0,80 | Convergencia declarada tras 200 iteraciones |
| Exito en evaluacion estricta (inmovilidad 1 s) | 6 % | La politica levanta el robot, pero no lo mantiene perfectamente quieto |
| Exito de conmutacion a politica `stand` | 88 % | Deteccion de posicion erguida + mezcla lineal de 0,2 s |
| Reduccion del salto de accion | −52 % | Frente a un corte duro de la politica |
| MMLU, HumanEval, GSM8K y similares | no disponible | No aplicables a una politica de control robotico |

No se han publicado resultados de benchmarks adicionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no especifica tamano de red ni consumo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue en hardware del robot: la model card no indica la plataforma de computo objetivo; se describe unicamente la integracion logica mediante `policy_runner.PolicyManager` con observacion de 61 dimensiones y accion de 22 dimensiones.
- Opciones de despliegue: integracion como politica en la pila BorderCollieRobot; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponible.
- Nota de integridad: el repositorio figura con un tamano de 0.0 GB, por lo que no se puede confirmar que el checkpoint `getup_v1_model_199.pt` este realmente subido y sea descargable.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. No se han facilitado referencias a otras politicas de recuperacion para cuadrupedos (por ejemplo, politicas get-up de otras pilas de RL) con parametros, contexto, rendimiento o licencia comparables, y la busqueda web realizada no devolvio resultados relacionados con robotica.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Collie Get-Up Policy v1 | no disponible | no aplica | 6 % en eval estricta; 88 % de exito de conmutacion | no disponible | Repositorio HuggingFace, 0.0 GB, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia sin especificar: no hay informacion sobre la licencia, por lo que no se puede determinar si el uso comercial esta permitido.
- Rendimiento limitado en la tarea estricta: solo un 6 por ciento de exito manteniendo la postura erguida e inmovil durante 1 segundo; la politica debe combinarse con una politica de equilibrio.
- Dependencia de una segunda politica: el flujo recomendado (deteccion de posicion erguida, conmutacion dura y mezcla de 0,2 s, 88 por ciento de exito) implica que el sistema completo no funciona con este checkpoint en solitario.
- Alcance restringido a terreno plano: la tarea declarada es `Collie-GetUp-Flat`; no hay evidencia de comportamiento en pendientes, escaleras o escombros.
- Ausencia de validacion en robot real: la model card solo reporta metricas de entrenamiento y evaluacion; no se documentan pruebas en hardware fisico.
- Acoplamiento a una interfaz concreta: requiere respetar el contrato de 61-D de observacion y 22-D de accion; cualquier variacion en sensores o numero de actuadores invalida el checkpoint.
- Modelo sin adopcion: 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.
- Posible ausencia de pesos: el repositorio aparece con 0.0 GB de tamano, lo que sugiere que el fichero `.pt` podria no estar publicado.
- Informe tecnico no verificable: el enlace del pipeline apunta a `https://github.com/` sin ruta concreta.
- Fechas inconsistentes: la fecha de creacion indicada por HuggingFace (2026-10-08) es posterior a la fecha actual, un dato que conviene tratar con cautela.
- Riesgo de sobreajuste al simulador: no se documenta aleatorizacion de dominio ni estrategias de sim-to-real para esta politica concreta.
- Busqueda web sin resultados utiles: las consultas devolvieron unicamente paginas de ropa (pantalones de organza), sin ninguna relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yaoxiao-0512/collie-getup-v1
- Informe tecnico del pipeline (enlace tal como figura en la model card, incompleto): https://github.com/
- Resultados de busqueda web: no se encontro ningun enlace relevante; todas las URLs devueltas corresponden a tiendas de ropa y no guardan relacion con el modelo.
