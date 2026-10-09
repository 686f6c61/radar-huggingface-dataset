# zijian2022/act_fanuc_er4ia_screw_single_v3

## Resumen

`zijian2022/act_fanuc_er4ia_screw_single_v3` es un checkpoint de politica de control robotico publicado en HuggingFace por el usuario `zijian2022`. El nombre del repositorio indica una politica de tipo ACT (Action Chunking Transformer) entrenada para una tarea concreta de atornillado ("screw") sobre un brazo industrial FANUC ER-4iA. No se trata de un modelo de lenguaje: es un modelo de imitacion (imitation learning) que mapea observaciones visuales y de estado del robot a una secuencia de acciones motoras.

El modelo tiene 51.670.663 parametros (51,67 millones), un orden de magnitud propio de las politicas ACT de referencia, y el repositorio ocupa 0,2 GB, lo que es coherente con pesos almacenados en precision de 32 bits (~207 MB de pesos mas ficheros auxiliares). Cuenta con 12 descargas y 0 likes en el momento de la consulta, y se publico el 9 de octubre de 2026.

Su relevancia es acotada y muy especializada: sirve como punto de partida reproducible para reproducir, evaluar o hacer fine-tuning de una politica de insercion de tornillos en una celda robotica concreta, y como ejemplo del flujo de trabajo ACT aplicado a robotica industrial FANUC. La informacion publica del repositorio es minima: no se declaran licencia, idiomas, pipeline ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), inferido de la nomenclatura del repositorio; no confirmado en la informacion disponible |
| Parametros totales | 51.670.663 (51,67 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (las politicas ACT operan con un horizonte de observacion y un chunk de acciones; los valores concretos no se publican en el repositorio) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplicable (modelo de control robotico, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano de repo de 0,2 GB, compatible con pesos en fp32) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada en el repositorio sobre la arquitectura concreta, el dataset de entrenamiento ni el procedimiento de optimizacion. La evidencia disponible es indirecta: el prefijo `act` y el recuento de parametros (51,67 M) coinciden con la configuracion habitual de una politica Action Chunking Transformer, un esquema de aprendizaje por imitacion que combina un codificador visual, un autocodificador variacional condicional (CVAE) que modela la variabilidad de las demostraciones y un decodificador transformer que predice un "chunk" de acciones futuras en lugar de una sola accion por paso. Este enfoque se diseno originalmente para reducir el error de compounding que aparece en politicas paso a paso.

Respecto a los datos, el sufijo `screw_single` sugiere una unica tarea de atornillado y un unico montaje o tornillo por episodio, pero se desconoce el numero de demostraciones, la frecuencia de captura, el tipo y numero de camaras, la composicion del dataset y si se aplico algun tipo de regularizacion o aumento de datos. Tampoco hay informacion sobre RLHF, DPO ni sobre ninguna innovacion tecnica adicional. Todo lo anterior debe considerarse no disponible y requeriria inspeccionar el repositorio (configuracion de entrenamiento, ficheros de normalizacion de observaciones) para confirmarse.

## Capacidades

- Generacion de comandos motores: produce secuencias de acciones (posiciones articulares o del efector final) para ejecutar una tarea de atornillado con un FANUC ER-4iA.
- Control visomotor: consume observaciones visuales y de estado del robot y las traduce en acciones, sin necesidad de un modelo del entorno ni de planificacion explicita.
- Ejecucion de tarea unica: el checkpoint esta especializado en una sola tarea ("screw_single"), no es un modelo generalista ni multi-tarea.
- Prediccion de chunks de acciones: por la naturaleza de ACT, cabe esperar que emita varios pasos de accion por inferencia, lo que suaviza la trayectoria y reduce la frecuencia de inferencia necesaria (valor concreto no disponible).
- Sin capacidades linguisticas: no procesa ni genera texto, no soporta instrucciones en lenguaje natural.
- Sin tool calling ni soporte de agentes: no aplica a este tipo de modelo.
- Sin capacidades multimodales generales: la vision, si esta presente, se usa exclusivamente como entrada de control, no para descripcion, OCR ni VQA.

## Casos de uso

- Atornillado automatizado en celda industrial: el modelo recibe la imagen de la pieza y el estado del FANUC ER-4iA y emite la secuencia de acciones de aproximacion, alineacion e insercion del tornillo, sustituyendo a una programacion explicita de trayectorias.
- Reproduccion de una demo de referencia: sirve para replicar exactamente la estrategia aprendida de un operario humano sobre el mismo utillaje y la misma pieza, util en auditorias de proceso o en formacion de operarios nuevos.
- Baseline en investigacion sobre imitation learning: al ser un checkpoint ACT de 51,67 M de parametros, es un punto de comparacion ligero frente a politicas mas grandes (por ejemplo, Diffusion Policy) en estudios de coste computacional y robustez.
- Punto de partida para fine-tuning en tareas de insercion: se puede reentrenar con nuevas demostraciones para variantes de tornillo, orientacion o tolerancia, aprovechando que el coste de ajuste de una politica de este tamano es bajo.
- Despliegue en hardware limitado: con menos de 1 GB de VRAM necesaria, encaja en controladores industriales con GPU integrada o en un Jetson, sin depender de servidores de inferencia remotos.
- Evaluacion de robustez ante cambios de iluminacion o posicion de pieza: al ser un modelo visomotor, permite medir experimentalmente como degrada su tasa de exito al variar las condiciones de la celda, informacion util para decidir si se necesita mas datos.
- Generacion de datos sinteticos de politica para simulacion: las acciones predichas pueden registrarse y reutilizarse como referencia para comparar con un gemelo digital del brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tasas de exito de la tarea, numero de demostraciones de entrenamiento, error de posicion ni curvas de aprendizaje. Cualquier cifra de rendimiento exigiria ejecutar la politica en la celda real o en un entorno simulado equivalente.

## Comparativa con modelos similares

Comparativa orientativa por categoria; los datos marcados como no disponibles no se han podido verificar en la informacion proporcionada.

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zijian2022/act_fanuc_er4ia_screw_single_v3` | 51,67 M | ACT (inferido) | Atornillado, FANUC ER-4iA | no disponible | HuggingFace, 12 descargas |
| ACT de referencia (implementacion LeRobot) | no disponible en esta busqueda (del orden de 50 M en la configuracion por defecto) | ACT | Manipulacion general, multi-tarea | Apache-2.0 en el repositorio original (no verificado aqui) | Publica |
| Diffusion Policy | no disponible en esta busqueda | Politica generativa por difusion | Manipulacion general | no disponible | Publica |
| Politicas VLA (vision-language-action) | cientos de millones a miles de millones | Transformer multimodal | Manipulacion guiada por lenguaje | variable | Publica |

La diferencia practica mas relevante es el alcance: este checkpoint resuelve una unica tarea en un unico robot, mientras que las alternativas citadas se distribuyen como marcos generales o modelos multi-tarea. No hay datos comparativos de tasa de exito.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 51,67 M de parametros, los pesos en fp32 ocupan aproximadamente 207 MB y en fp16 unos 103 MB, mas el coste de activaciones y del codificador visual.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas RTX 3060, RTX 4090, A100 o H100. Para esta carga, una GPU de datacenter es innecesaria.
- Inferencia en CPU: viable en la mayoria de CPUs modernas, aunque condicionada por el requisito de frecuencia del bucle de control.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en plataformas embebidas tipo NVIDIA Jetson.
- Opciones de despliegue: inferencia directa con PyTorch; integracion mediante el ecosistema LeRobot; exportacion a ONNX o TensorRT para reducir latencia. No se dispone de variantes GGUF ni de soporte declarado en vLLM, TGI u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Dependen del codificador visual, de la resolucion de imagen y del hardware; como referencia de diseno, un bucle de control robotico suele requerir entre 10 y 50 Hz, y el uso de chunks de acciones es precisamente lo que permite desacoplar la frecuencia de inferencia de la frecuencia de control.

## Limitaciones y advertencias

- Especializacion extrema: entrenado para una unica tarea de atornillado en un unico modelo de robot (FANUC ER-4iA). No se espera transferencia directa a otras tareas, utillajes o cinemáticas sin reentrenamiento.
- Licencia no declarada: sin licencia explicita, el uso comercial del checkpoint es juridicamente incierto. Debe aclararse con el autor antes de integrarlo en produccion.
- Ausencia total de evaluacion publicada: no hay tasa de exito, numero de demostraciones ni condiciones de evaluacion, por lo que no es posible estimar su fiabilidad.
- Riesgo de sobreajuste al montaje de demostracion: al no publicarse la composicion del dataset, es probable que la politica sea sensible a cambios de iluminacion, color de pieza, posicion inicial o calibracion de camara respecto a las condiciones de captura.
- Degradacion fuera de distribucion: como toda politica de imitation learning, puede fallar de forma silenciosa y producir trayectorias plausibles pero incorrectas cuando la observacion se aleja de lo visto en entrenamiento, sin señal de incertidumbre calibrada.
- Dependencia de calibracion: requiere que la camara, el marco de referencia del robot y el utillaje coincidan con los usados en el entrenamiento; un desajuste de calibracion puede invalidar por completo el comportamiento.
- Seguridad fisica: al tratarse de control de un brazo industrial, cualquier despliegue debe ir acompanado de limites de par, paradas de emergencia y validacion en entorno simulado o con robot desacoplado.
- Cero reproducibilidad documentada: no hay model card, paper, configuracion de entrenamiento ni resultados en el repositorio mas alla de los pesos.
- Fecha de publicacion inusual (2026) y ausencia de mantenimiento: el repositorio no muestra actualizaciones posteriores a la creacion, 5 segundos despues segun los metadatos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zijian2022/act_fanuc_er4ia_screw_single_v3
- Perfil del autor: https://huggingface.co/zijian2022
- Referencia de la arquitectura ACT (paper original de Action Chunking with Transformers, Zhao et al.): no disponible en la informacion proporcionada
- Documentacion del ecosistema LeRobot para politicas ACT: no disponible en la informacion proporcionada
- Ficha del robot FANUC ER-4iA: no disponible en la informacion proporcionada
