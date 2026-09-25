# tarzanagh/ckpt_papercupsteleop_stack_4cam260922_gr00t3btactile260924

## Resumen

Este repositorio contiene un checkpoint de política robótica de 3,14 mil millones de parámetros (3.144.016.000, según los pesos safetensors), etiquetado por el autor como GR00T-N1.7-3B con entrada táctil. Lo publica `tarzanagh` (Davoud Ataee Tarzanagh, investigador en Samsung SDS Research America) y resuelve una tarea concreta de manipulación bimanual diestra: un robot DexMate Vega-1 con dos manos RobotEra XHand1 coge un vaso de papel con cada mano y coloca el vaso de la mano derecha dentro del de la izquierda. Está entrenado por imitación a partir de teleoperación con guante Meta (sin exoesqueleto) y seguimiento de muñeca con Vive.

El interés técnico está en que combina percepción visual multi-cámara (4 cámaras RGB a 640x360 y 30 fps) con realimentación táctil de fuerza en las puntas de los dedos (30 dimensiones), sobre un espacio de estado/acción de 38 grados de libertad articulares. Es un ejemplo de política viso-táctil para manipulación fina, un frente activo en robótica de imitación donde la señal táctil no suele estar integrada.

La relevancia actual es doble: por un lado, ilustra cómo extender un modelo fundacional de acción (familia GR00T-N1.7) con sensores táctiles; por otro, publica una evaluación open-loop honesta y detallada frente a un baseline trivial. Con licencia "other" y sin resultados en hardware, es material de investigación más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el tag del repositorio es `Gr00tN1d7`, lo que apunta a la familia GR00T-N1.7 (modelo fundacional de accion para robotica) |
| Parametros totales | 3.144.016.000 (~3,14 mil millones) |
| Longitud de contexto | No disponible (en el sentido de ventana de atencion del modelo fundacional; la politica opera sobre observaciones por trozos, no sobre texto) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en safetensors sin variantes cuantizadas (GGUF, AWQ, GPTQ, etc.) |
| Idiomas soportados | No disponible (no se documenta interfaz de lenguaje; es una politica de accion) |
| Licencia | `other` (license:other); condiciones concretas no especificadas en la informacion disponible |
| Formato de pesos | safetensors |

Notas de espacio de estado/accion:

| Elemento | Dimension |
|---|---|
| Posiciones articulares (estado/accion) | 38-D `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` |
| Fuerza en puntas de dedos (tactil) | 30-D (5 dedos x 3 ejes por mano) |
| Estado total concatenado | 68-D |
| Camaras | 4 RGB, 640x360 a 30 fps |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion proporcionada. Los tags indican `Gr00tN1d7`, lo que sugiere que el modelo parte de la familia GR00T-N1.7, un modelo fundacional de accion para robotica, y que se ha adaptado al hardware DexMate Vega-1 con manos XHand1. Lo que sí se documenta es el esquema de inferencia: la politica observa la observacion real cada 16 pasos, predice un "chunk" (bloque) de acciones y conserva las 16 primeras, un patron tipico de action chunking en politicas de imitacion.

El entrenamiento es de imitacion supervisada a partir de teleoperacion. El conjunto de datos consta de 96 episodios, con 86 para entrenamiento y 10 reservados (se retiene cada decimo episodio). El entrenamiento se ejecuto durante 10.000 pasos con semilla 1000. La teleoperacion se realizo con guante Meta, sin exoesqueleto, y seguimiento de muneca Vive. No se menciona uso de RLHF, DPO ni ningun esquema de refuerzo; es aprendizaje por imitacion puro. La innovacion destacable es la incorporacion de la fuerza tactil en las puntas de los dedos como parte del estado concatenado, lo que permite a la politica reaccionar a la interaccion fisica y no solo a la vision.

## Capacidades

- Generacion de acciones motoras para control bimanual: produce comandos articulares de 38-D para brazos y manos.
- Manipulacion bimanual diestra: la tarea entrenada implica coordinar las dos manos para apilar/insertar un vaso dentro de otro.
- Percepcion visual multi-camara: consume 4 flujos RGB a 640x360 y 30 fps.
- Percepcion tactil: integra 30-D de fuerza en las puntas de los dedos (5 dedos x 3 ejes por mano).
- Control de manos multiarticuladas (12 grados de libertad por mano) y brazos de 7 grados de libertad.
- Prediccion por trozos de accion (action chunking) con horizonte de 16 pasos.
- No documentado en la informacion disponible: tool calling o function calling, soporte de agentes, razonamiento multi-paso, capacidades multilingues, modo "thinking", vision-lenguaje general o generacion de texto.

## Casos de uso

- Investigacion en manipulacion bimanual diestra: sirve como referencia reproducible para comparar politicas que coordinan dos manos con muchos grados de libertad y dedos articulados.
- Manipulacion con realimentacion tactil: permite estudiar como la senal de fuerza en las puntas mejora el ajuste fino en tareas de insercion o apilado, donde la vision sola es ambigua.
- Base para fine-tuning en tareas similares: al ser un checkpoint de 3,14 mil millones de parametros, puede reentrenarse con nuevos conjuntos de teleoperacion sobre hardware equivalente (DexMate Vega-1 + XHand1).
- Evaluacion offline de politicas: su metrica open-loop facilita comparar variantes de modelo frente a un baseline trivial ("mantener el primer frame") sin necesidad de robot fisico.
- Linea base en teleoperacion asistida: util para analizar la calidad de datos de guante Meta y tracking Vive como fuente de aprendizaje por imitacion.
- Gemelos digitales y validacion en simulacion: la politica puede conectarse a un simulador con el mismo espacio de estado/accion de 68-D para validar trayectorias antes del despliegue.
- Benchmarking interno de integracion viso-tactil: comparar configuraciones con y sin tacto sobre el mismo esquema de action chunking.
- Reproduccion academica: punto de partida para replicar y extender resultados de politicas de imitacion sobre manos de 12 grados de libertad.

## Benchmarks y rendimiento

La model card publica un error open-loop en datos reservados (media del valor absoluto de la diferencia entre accion predicha y grabada, en radianes, con error estandar de la media, n=10). No se trata de un benchmark estandar ni mide exito de tarea: la politica ve la observacion real cada 16 pasos y se conservan las 16 primeras acciones. Nada se ejecuto en hardware.

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo | 0,0170 ± 0,0005 | 0,0157 ± 0,0005 | 0,0337 ± 0,0008 | 0,0221 ± 0,0007 |
| hold-first-frame (baseline) | 0,4252 | 0,3918 | 0,3280 | 0,1933 |

Unidades en radianes. La model card indica que los demas baselines y T-Rex para esta tarea siguen entrenandose. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a una politica de accion.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6,3 GB en bf16/fp16 para los pesos (3,14 mil millones de parametros); ~12,6 GB en fp32. La activacion adicional depende del tamano de lote, el numero de camaras y el horizonte de prediccion, no detallados.
- GPU recomendadas: no disponibles de forma oficial. Por tamano, una GPU consumer de gama alta (RTX 3090, RTX 4090, o equivalentes con 24 GB) es suficiente para los pesos; GPU de centro de datos (A100, H100, L40S) aportan margen para lotes grandes o inferencia en tiempo real.
- Cabe en GPU consumer: sí, previsiblemente en tarjetas con 12 GB o más en bf16 (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090). No confirmado por el autor.
- Opciones de despliegue: no se documenta ningun framework (no se mencionan vLLM, llama.cpp, Ollama ni TGI). Al ser una politica robotica con pesos safetensors, el despliegue habitual seria un runtime propio que alimente las 4 camaras y el estado de 68-D y reciba acciones de 38-D.
- Latencia y throughput: no disponibles. El requisito practico es generar trozos de 16 acciones a 30 fps de bucle de control, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de especificaciones de modelos comparables en la informacion proporcionada. Se listan los checkpoints relacionados del mismo autor encontrados en la busqueda web, con los datos disponibles (la mayoria sin verificar):

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 3,14 mil millones | No disponible | Apilado bimanual de vasos con tacto | other | HuggingFace |
| tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260816 | No disponible | No disponible | Pick from scale | No disponible | HuggingFace |
| tarzanagh/ckpt_psspteleop_putaside_4cam260810-260811_gr00t3b260815 | No disponible | No disponible | Put aside | No disponible | HuggingFace |
| Familia GR00T-N1.7 (base) | No disponible | No disponible | Politica fundacional de accion | No disponible | No disponible |

## Limitaciones y advertencias

- No se ha ejecutado en hardware: la model card indica explicitamente que nada se probo sobre el robot fisico; el rendimiento mostrado es open-loop sobre datos reservados.
- La metrica publicada mide seguimiento de trayectoria, no exito de tarea: un error bajo no garantiza que la tarea se complete.
- Sesgo de datos limitado: solo 96 episodios de teleoperacion, capturados con una configuracion concreta (DexMate Vega-1, dos XHand1, guante Meta, tracking Vive). La generalizacion a otros objetos, posiciones o condiciones de iluminacion no esta documentada.
- Dependencia del hardware: el espacio de estado/accion de 68-D esta ligado a esa configuracion; usarlo con otro robot requiere adaptacion.
- Riesgo de deriva en bucle cerrado: la evaluacion es open-loop con observacion real cada 16 pasos, por lo que no se mide la acumulacion de error en ejecucion autonoma.
- Licencia restrictiva/ambigua: la licencia es "other" y no se detallan los terminos; no puede asumirse uso comercial sin aclaracion del autor.
- Sin soporte de lenguaje ni de texto: no es un modelo de chat, razonamiento ni generacion de codigo.
- Sin variantes cuantizadas publicadas: no hay GGUF ni formatos ligeros para despliegue en hardware limitado.
- Descargas y likes a cero y fecha de creacion posterior a la publicacion general: es un checkpoint de investigacion de baja difusion, sin validacion externa.
- Region: us; pueden aplicarse restricciones de exportacion asociadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_papercupsteleop_stack_4cam260922_gr00t3btactile260924
- Checkpoint relacionado (pick from scale): https://huggingface.co/tarzanagh/ckpt_psspteleop_pickfromscale_4cam260810-260811_gr00t3b260816
- Checkpoint relacionado (put aside): https://huggingface.co/tarzanagh/ckpt_psspteleop_putaside_4cam260810-260811_gr00t3b260815/tree/main
- Pagina del autor (Davoud Ataee Tarzanagh): https://tarzanagh.github.io/
- Paper, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
