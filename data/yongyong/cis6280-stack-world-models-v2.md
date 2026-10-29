# YongYong/cis6280-stack-world-models-v2

## Resumen

`YongYong/cis6280-stack-world-models-v2` es un paquete de artefactos de investigación para robótica de manipulación, no un modelo de lenguaje. Contiene un modelo del mundo basado en JEPA (codifica cada fotograma de cámara en un latente de 192 dimensiones y predice latentes futuros a partir de los últimos 3 fotogramas y las acciones intermedias), una política de acciones tipo Diffusion Forcing que propone bloques de acciones, un profesor de clonación de conducta basado en estado privilegiado y los informes de evaluación de la tarea de apilado de cuatro cajas del curso CIS 6280 (Universidad de Pensilvania). Lo publica el usuario YongYong como entrega final de la asignatura.

Su interés práctico es que libera la cadena completa -datos, latentes precalculados, modelo del mundo preentrenado y afinado con rollouts on-policy, política y resultados de evaluación por episodio- en un único repositorio de 4,9 GB, con un espacio latente compartido de 192 dimensiones entre todas las etapas. Eso permite reproducir experimentos de planificación en el espacio latente sin reentrenar el encoder de imagen, que está congelado.

La relevancia es acotada: se trata de un artefacto docente y de investigación sobre una tarea concreta (apilado de cajas con una mano diestra Sharpa en simulación), sin licencia declarada ni métricas fuera de ese dominio. No sustituye a un modelo fundacional de robótica y no procesa lenguaje natural.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo del mundo JEPA (encoder de imagen congelado + predictor de latentes) y política Diffusion Forcing con action chunking |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 3 fotogramas de observación como ventana de entrada, más las acciones intermedias; representación latente de 192 dimensiones |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints PyTorch; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica / no disponible (modelo robótico sin entrada ni salida de lenguaje natural) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | `.pt` (`torch.save`, requiere `torch.load(..., weights_only=False)`) |
| Tamaño del repositorio | 4,9 GB (incluye checkpoints, informes de evaluación y snapshot de código) |
| Horizonte de evaluación | 1795 pasos de simulación |
| Tarea | Apilado de hasta 4 cajas con mano diestra Sharpa en entorno simulado |

## Arquitectura y entrenamiento

El pipeline se organiza en cuatro etapas. La etapa 2 produce `jepa/smwm-c3/pretrain.pt`, un modelo del mundo que comparte encoder de imagen congelado con el resto de artefactos. La etapa 3 entrena la política Diffusion Forcing: `policy/df-smwm-c1-sigma04/policy.pt` propone 16 bloques de acciones (8 segundos, es decir, 0,5 s por bloque) a partir del fotograma actual y se entrenó con demostraciones limitadas a ruido de acción σ ≤ 0,04; `policy/df-smwm-c1/policy.pt` replica la arquitectura pero se entrenó con todas las demostraciones, sin ese filtro. La etapa 4 afina el modelo del mundo sobre rollouts on-policy de 16 bloques de la política publicada, dando lugar a `jepa/smwm-c3/model.pt`, con registro de entrenamiento en `onpolicy-train-log.jsonl`.

Las demostraciones originales se recogieron con un profesor de clonación de conducta basado en estado privilegiado (`bc/step-050000.pt`), que generó un conjunto de 20.000 episodios. Como la etapa 4 congela el encoder de imagen, `pretrain.pt`, `model.pt`, las políticas y los latentes precalculados del repositorio de datos comparten exactamente el mismo espacio latente de 192 dimensiones, lo que permite mezclar artefactos entre etapas sin recalcular codificaciones. No se especifican en la información disponible el número de tokens o muestras de entrenamiento del encoder, la composición del dataset de imágenes ni si hubo etapas de RLHF o DPO (no aplicables en este dominio). La innovación destacable es el uso de Diffusion Forcing para el chunking de acciones combinado con planificación por muestreo múltiple en el espacio latente y subobjetivos intermedios.

## Capacidades

- Predicción de latentes futuros a partir de 3 fotogramas y de la secuencia de acciones intermedias.
- Política de control que emite 16 bloques de acciones (8 s) por inferencia, apta para control a frecuencia baja.
- Planificación en el espacio latente con muestreo múltiple: el `GoalPlanningAgent` evalúa 16 muestras y selecciona según un umbral τ = 0,25.
- Planificación guiada por subobjetivos, con imágenes de meta inyectadas cada 80 pasos (`goals/scripted-val300-every80/goals.npz`).
- Ejecución de agarre diestro: la métrica `Grasp` mide episodios en los que al menos dos partes de la mano presionan una caja.
- Evaluación reproducible por episodio con semillas de política 0, 2 y 3 sobre 300 escenas de validación.
- No soporta tool calling ni function calling.
- No soporta agentes conversacionales ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües, de visión general, audio ni modo "thinking".
- Incluye un profesor de clonación de conducta con estado privilegiado utilizable como referencia o generador de datos.

## Casos de uso

- Reproducción de la práctica CIS 6280: el paquete incluye el snapshot `code/world-model-gym.tar`, el cuaderno `assignment/planning/colab.ipynb` y los objetivos de validación, de modo que un estudiante puede repetir la evaluación de 300 escenas sin reentrenar nada.
- Línea base para investigación en modelos del mundo: `jepa/smwm-c3/model.pt` y `pretrain.pt` permiten comparar el efecto del afinado on-policy frente al preentrenamiento sobre la misma tarea y el mismo encoder congelado.
- Estudio de planificación en espacio latente: el par de agentes (`LatentPolicyAgent` de una muestra y `GoalPlanningAgent` de 16 muestras con subobjetivos) sirve para medir la ganancia marginal del muestreo y de los subobjetivos en tareas de manipulación de contacto.
- Generación de datos sintéticos: el profesor `bc/step-050000.pt` basado en estado privilegiado puede emplearse para recolectar nuevos episodios etiquetados, replicando el procedimiento que produjo los 20.000 episodios originales.
- Evaluación de robustez al ruido de acciones: la existencia de dos políticas idénticas en arquitectura, una entrenada con σ ≤ 0,04 y otra con todas las demostraciones, permite un experimento controlado sobre sensibilidad al ruido.
- Docencia de aprendizaje por imitación y control: la separación en etapas 2, 3 y 4 con checkpoints intermedios facilita explicar y depurar cada componente del pipeline por separado.
- Integración en un banco de pruebas de manipulación diestra: los activos de la mano Sharpa y el entorno de simulación del snapshot permiten reutilizar la infraestructura para variantes de la tarea (distinto número de cajas, distintas metas).

## Benchmarks y rendimiento

Evaluación sobre 300 escenas de validación, 3 semillas de política, horizonte de 1795 pasos, con `policy/df-smwm-c1-sigma04/policy.pt` y `jepa/smwm-c3/model.pt`:

| Selección | ≥1 caja | ≥2 cajas | ≥3 cajas | 4 cajas | Grasp | Media de cajas |
|---|---|---|---|---|---|---|
| Una muestra, sin meta (`LatentPolicyAgent`) | 81,4% | 35,7% | 8,6% | 1,1% | 99,4% | 1,27 |
| 16 muestras, subobjetivos cada 80 pasos, τ = 0,25 (`GoalPlanningAgent`) | 85,2% | 41,4% | 11,8% | 2,4% | 99,1% | 1,41 |

`≥1` a `4` indican el porcentaje de episodios cuyo apilamiento conectado en la zona de meta alcanza al menos ese número de cajas en algún momento (las cajas situadas una al lado de otra no cuentan como pila). `Grasp` es el porcentaje de episodios en los que al menos dos partes de la mano presionan una caja. La planificación apila 0,14 cajas más por episodio de media (intervalo de confianza del 95%: 0,06-0,22) y alcanza ≥2 cajas 5,8 puntos porcentuales más a menudo (1,3-10,1).

No se han publicado resultados de benchmarks estándar de lenguaje o código (MMLU, HumanEval, GSM8K) porque el modelo no cubre esas tareas. Los informes por episodio están en `eval/planning-val300/`; las carpetas anteriores de `eval/` corresponden a evaluaciones de 100 escenas con `pretrain.pt` y no son directamente comparables.

## Requisitos de hardware

- No se publican requisitos de VRAM ni GPU recomendadas en la información disponible.
- Referencia de tamaño: el repositorio completo ocupa 4,9 GB e incluye varios checkpoints (modelo del mundo preentrenado y afinado, dos políticas, profesor de clonación de conducta), registros e informes; el peso de un checkpoint individual es una fracción de esa cifra, por lo que la inferencia es viable en GPU de consumo, aunque esta estimación no está confirmada por el autor.
- Entorno de ejecución: PyTorch con `torch.load(..., weights_only=False)`; se requiere GPU para el encoder de imagen y el predictor de latentes en cualquier evaluación de tamaño razonable.
- El pipeline de evaluación incluido (`assignment/training/planning/evaluate.py`) y el cuaderno `colab.ipynb` están pensados para ejecutarse en un entorno tipo Google Colab, lo que sugiere que el autor lo validó en GPU de gama media-alta sin especificar el modelo.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje). El despliegue se hace mediante el código del snapshot `code/world-model-gym.tar` y el simulador correspondiente.
- Latencia y throughput: no disponibles. El coste dominante es la simulación física de 1795 pasos por episodio multiplicada por 16 muestras en el caso del agente con planificación.

## Comparativa con modelos similares

No se dispone de datos verificados de parámetros, contexto o rendimiento de alternativas en la información proporcionada, por lo que las comparaciones numéricas se marcan como no disponibles. Las familias metodológicamente comparables son:

| Modelo / familia | Enfoque | Tarea | Licencia | Datos verificados |
|---|---|---|---|---|
| Este paquete (cis6280-stack-world-models-v2) | JEPA + Diffusion Forcing sobre latentes de 192 D | Apilado de 4 cajas con mano diestra | no disponible | Benchmarks propios en 300 escenas |
| Diffusion Policy (Chi et al.) | Política de difusión para control visomotor | Manipulación diversa | no disponible en esta ficha | no disponible |
| DINO-WM y familia de world models con features preentrenadas | Modelo del mundo sobre características visuales | Planificación visual | no disponible en esta ficha | no disponible |
| V-JEPA / JEPA de vídeo | Predicción en espacio latente auto-supervisada | Representación de vídeo | no disponible en esta ficha | no disponible |

La comparación honesta es que este paquete no es un modelo general: es una instancia concreta y reproducible de la receta JEPA + Diffusion Forcing sobre una única tarea, con métricas publicadas solo para esa tarea. Cualquier comparación con los trabajos anteriores exigiría reevaluarlos en el mismo entorno y con las mismas 300 escenas.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial; en la práctica, el artefacto debe tratarse como material académico sin licencia clara hasta confirmación del autor.
- Dominio único: la evaluación cubre exclusivamente el apilado de hasta 4 cajas con una mano Sharpa en simulación; no hay evidencia de generalización a otras tareas, objetos o morfologías.
- Sin validación en hardware real: no se publican resultados sim-to-real ni análisis de brecha de realidad.
- Sesgos: no se han documentado análisis de sesgo, y en este dominio los sesgos relevantes serían de distribución de escenas, posiciones iniciales y propiedades de los objetos del simulador.
- Riesgo de alucinación: no aplica en el sentido de lenguaje, pero existe deriva de predicción en el espacio latente al aumentar el horizonte; el modelo predice 16 bloques por inferencia y la planificación con subobjetivos cada 80 pasos es un parche a ese problema.
- Sensibilidad al ruido de acciones: la política publicada se entrenó con σ ≤ 0,04; su comportamiento fuera de ese régimen no está caracterizado.
- Reproducibilidad dependiente de detalles: el entorno correcto exige pasar `--world-model path/to/jepa/smwm-c3/model.pt` a la política o reescribir `ckpt["info"]["encoder"]`; los informes de evaluación registran el commit en el campo `code`, lo que implica que pequeñas diferencias de código pueden alterar los resultados.
- Comparabilidad de métricas: las carpetas antiguas de `eval/` usan `pretrain.pt` y 100 escenas, por lo que no deben mezclarse con los resultados de 300 escenas.
- Sin soporte de lenguaje, tool calling ni agentes conversacionales: no es utilizable como sustituto de un LLM en ningún pipeline de texto.
- Idiomas no aplicables: la ficha de HuggingFace no declara idiomas y el modelo no procesa texto.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/YongYong/cis6280-stack-world-models-v2
- Repositorio de datos asociado (demostraciones, latentes cacheados, rollouts on-policy, imágenes de subobjetivos): https://huggingface.co/datasets/YongYong/cis6280-stack-datasets-v2
- Código del proyecto final CIS 6280: https://github.com/GMLR-Penn/cis6280-final-project
- Snapshot de código incluido en el repositorio: `code/world-model-gym.tar` (commit registrado en `code/SNAPSHOT.txt`)
- Cuaderno de referencia: `assignment/planning/colab.ipynb` dentro del snapshot
- Informes de evaluación por episodio: `eval/planning-val300/`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada. Las búsquedas web realizadas devolvieron únicamente resultados no relacionados (listados de ciudades y áreas metropolitanas de España), sin material utilizable sobre este modelo.
