# Travor278/pi05-scan-object-left-first-lora-10k

## Resumen

El modelo `Travor278/pi05-scan-object-left-first-lora-10k` es un ajuste fino mediante LoRA del modelo base PI0.5 de robótica, publicado con la librería `openpi` y entrenado sobre una tarea concreta: escanear un objeto empezando por la izquierda. El autor es Travor278 y el checkpoint se distribuye como árbol de parámetros de inferencia (base + LoRA) en formato Orbax para JAX, junto con los activos de normalización necesarios para el despliegue. Se trata, por tanto, de un artefacto de investigación orientado a inferencia robótica, no de un modelo de lenguaje de propósito general.

El entrenamiento se realizó partiendo del checkpoint base `XinY0201/openpi-pi05-base-jax` (commit `5e62884`), con un único *action expert* estándar, y sobre el dataset `Shiki42/ctr-scan-object-left-first-20260911` (50 episodios, 17.008 fotogramas a 25 FPS). La tarea usa acciones y estados absolutos de 14 dimensiones, tres cámaras RGB, preprocesado estándar de 224x224, `pad 32` y horizonte de 50 pasos, sin conversión de unidades delta/Aloha ni máscara de reposo. El *prompt* nativo es la instrucción en inglés "Scan the object."

La relevancia de esta ficha es acotada: se trata de un checkpoint de tarea única con 0 descargas y 0 *likes* en el momento de la consulta, sin *model card* con resultados de evaluación y sin licencia declarada. Resulta útil como ejemplo reproducible de flujo de trabajo de ajuste fino LoRA sobre PI0.5 en JAX con `openpi`, y como artefacto base para experimentos de robótica, pero no debe tratarse como un modelo validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de robotica PI0.5 (base tipo vision-language-action sobre PaliGemma) con un unico *action expert*; adaptacion LoRA en JAX |
| Parametros totales | no disponible (el repositorio ocupa 6,3 GB e incluye el arbol de parametros base + LoRA y activos de normalizacion) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; pesos congelados en bf16 y pesos entrenables en float32 |
| Idiomas soportados | no disponible; el *prompt* nativo documentado esta en ingles ("Scan the object.") |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax para JAX (raiz de checkpoint OpenPI `10000/`); no se publican pesos en safetensors ni GGUF |
| Tamano del repositorio | 6,3 GB |
| Tarea entrenada | "Scan the object" (escanear el objeto empezando por la izquierda) |
| Dimension de acciones/estado | 14 dimensiones absolutas |
| Camaras | 3 RGB, preprocesado 224x224 |
| Horizonte de accion | 50 pasos (`pad 32`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base PI0.5 en JAX (`XinY0201/openpi-pi05-base-jax`, commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`), que sigue el esquema de la familia PI0.5: un *backbone* de tipo vision-language sobre PaliGemma combinado con un *action expert* que genera secuencias de accion. En este ajuste se mantiene el *action expert* estandar (unico) y se aplica LoRA sobre el *backbone*: rango/alpha 16 para la parte PaliGemma y 32 para el *expert*, con un filtro de referencia que incluye vision y proyecciones entrenables. No se documenta en la informacion disponible el numero total de tokens de preentrenamiento del modelo base ni la composicion de su dataset original.

El ajuste fino se hizo sobre el dataset `Shiki42/ctr-scan-object-left-first-20260911` (commit `0dcad06`), con 50 episodios y 17.008 fotogramas a 25 FPS, acciones y estados absolutos de 14 dimensiones, tres camaras RGB y preprocesado 224x224 con `pad 32` y horizonte 50. La configuracion de entrenamiento fue: dos H100 de 80 GB, *batch* global 16, semilla 87431, 10.000 actualizaciones, AdamW con beta1 0,9, beta2 0,95, epsilon 1e-8, *weight decay* 1e-10, *clip* 1 y sin EMA. Se utilizo un plan de *learning rate* coseno fijo de 30k con 1.000 pasos de *warmup*, pico 2,5e-5 y valor final 2,5e-6, deteniendo el entrenamiento en el paso 10.000. Los pesos congelados y las activaciones van en bf16, mientras que los pesos entrenables se mantienen en float32.

Como controles de calidad, la *model card* indica que se pasaron comprobaciones de estadisticas especificas del dataset, *decoder*/tokenizer reales y puertas de guardado/recarga en CPU antes del envio a GPU, y que los arboles finales de parametros y de optimizador se restauraron y verificaron como finitos en el paso 10.000, con hashes y recibos incluidos. El directorio `10000/experiment/` registra el inventario de entorno y paquetes, la configuracion resuelta, el commit y parche de origen, el enlace a GPU y los manifiestos fijados de dataset y modelo base. El entrenamiento se ejecuto sobre NGC PyTorch 25.02 con un *runtime* JAX construido por separado; el autor advierte expresamente que no se reclama identidad con el antiguo *runtime* archivado de CTR. No hay ninguna afirmacion de tasa de exito en *rollout*.

## Capacidades

- Generacion de secuencias de accion para control robotico: produce acciones absolutas de 14 dimensiones a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: consume tres flujos RGB con preprocesado 224x224.
- Ejecucion de una instruccion de lenguaje concreta: el *prompt* nativo documentado es "Scan the object.".
- Control con horizonte de prediccion de 50 pasos de accion.
- Inferencia en JAX a partir de un checkpoint Orbax con activos de normalizacion incluidos.
- Ajuste adicional sobre el propio checkpoint: al ser un adaptador LoRA sobre el arbol base, el artefacto permite seguir experimentando con *fine-tuning* sobre la misma base.
- Soporte de *tool calling* / *function calling*: no aplica; no es un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no disponible; la unica capacidades documentada es la generacion de acciones para la tarea de escaneo.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo *thinking*, vision, audio): vision si (tres camaras RGB); modo *thinking* y audio, no disponibles.

## Casos de uso

- Investigacion en aprendizaje por imitacion: el checkpoint sirve como punto de partida reproducible para estudiar como un ajuste LoRA de 10.000 pasos sobre PI0.5 modifica el comportamiento de un *action expert* concreto, comparando contra el modelo base.
- Reproduccion de experimentos de robotica: el directorio `10000/experiment/` documenta configuracion, commit de origen y manifiestos fijados de dataset y base, lo que permite reconstruir el entorno de entrenamiento en un *runtime* JAX sobre el contenedor NGC PyTorch 25.02.
- Tareas de manipulacion con instruccion de escaneo: en un banco de pruebas con tres camaras RGB y un robot compatible con acciones de 14 dimensiones, el modelo puede ejecutar la politica "Scan the object" empezando por la izquierda.
- Generacion de datos sinteticos de trayectoria: las secuencias de 50 acciones producidas por el modelo pueden usarse para aumentar un dataset de manipulacion antes de filtrar por criterios fisicos.
- Evaluacion de pipelines de normalizacion: los activos de normalizacion incluidos y las puertas de guardado/recarga verificadas permiten validar la cadena completa de preprocesado (224x224, `pad 32`, horizonte 50, acciones absolutas de 14 dimensiones) sin reentrenar.
- Base para *fine-tuning* posterior en dominios cercanos: al conservar el arbol base mas LoRA, es un punto de partida para adaptar la politica a variantes de la misma tarea con menos pasos de entrenamiento.
- Comparacion de estrategias de adaptacion: util para medir el coste y el efecto de usar LoRA con rango/alpha 16 en PaliGemma y 32 en el *expert* frente a otros rangos o a un ajuste completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* declara explicitamente que no se reclama ninguna tasa de exito en *rollout*, y no se aportan metricas de exito de tarea, MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio de 6,3 GB contiene el arbol de parametros de inferencia base + LoRA y los activos de normalizacion, lo que da una referencia del peso en disco, pero no se publica el consumo en memoria en inferencia.
- GPU recomendadas: no disponibles para inferencia. Para el entrenamiento documentado se usaron dos H100 de 80 GB.
- Compatibilidad con GPU de consumo: no disponible. No hay confirmacion del autor sobre ejecucion en GPU de consumo ni sobre cuantizaciones que la faciliten.
- Opciones de despliegue: `openpi` con *runtime* JAX (checkpoint Orbax, raiz `10000/`). El entrenamiento se ejecuto sobre NGC PyTorch 25.02 con un *runtime* JAX construido aparte. Servidores de LLM como vLLM, TGI, llama.cpp u Ollama no son aplicables a este artefacto, ya que no se publican pesos en safetensors ni GGUF.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Travor278/pi05-scan-object-left-first-lora-10k` | no disponible (repo de 6,3 GB) | no disponible | Sin datos de *rollout* | no disponible | HuggingFace, libreria `openpi`, 0 descargas |
| `XinY0201/openpi-pi05-base-jax` (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace, referenciado como commit `5e62884` |
| Otros ajustes PI0.5 con LoRA | no disponibles | no disponibles | no disponibles | no disponibles | no disponibles en la informacion proporcionada |
| Modelos VLA alternativos (OpenVLA, GR00T, RDT) | no disponibles | no disponibles | no disponibles | no disponibles | no disponibles en la informacion proporcionada |

No se dispone de datos comparativos verificables en la informacion proporcionada; la comparativa se limita al modelo base documentado en la propia *model card*.

## Limitaciones y advertencias

- Tarea unica: el modelo esta ajustado para la instruccion "Scan the object" y no se documenta generalizacion a otras ordenes.
- Sin evaluacion: el autor no reclama ninguna tasa de exito en *rollout* y no publica benchmarks, por lo que no hay evidencia de rendimiento en la tarea.
- Licencia no disponible: al no declararse licencia, no se puede asumir permiso para uso comercial ni para redistribucion.
- Idiomas no disponibles: no se documenta soporte multilingue; el unico *prompt* nativo registrado esta en ingles.
- Sesgos conocidos: no disponibles. Al entrenarse sobre 50 episodios de un unico dataset y un unico entorno, es esperable un sobreajuste al dominio de captura, pero el autor no publica analisis al respecto.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de acciones fisicamente invalidas fuera de la distribucion de entrenamiento, especialmente con *prompts* o configuraciones de camara distintas de las usadas en el dataset.
- Dependencias estrictas de preprocesado: el modelo asume acciones y estados absolutos de 14 dimensiones, tres camaras RGB, 224x224, `pad 32` y horizonte 50, sin conversion delta/Aloha ni mascara de reposo. Alterar cualquiera de estos elementos invalida las predicciones.
- Compatibilidad de *runtime*: el autor advierte que el entorno de ejecucion usado (NGC PyTorch 25.02 mas un *runtime* JAX construido aparte) no se reclama identico al *runtime* archivado de CTR, lo que puede afectar a la reproducibilidad exacta.
- Madurez: 0 descargas y 0 *likes* en el momento de la consulta, sin historial de uso externo ni validacion por terceros.
- Estado del optimizador: la *model card* indica que el estado del optimizador se conserva en la plataforma de entrenamiento, no en el repositorio, de modo que la reanudacion exacta del entrenamiento no es posible solo con estos ficheros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-left-first-lora-10k
- Modelo base: `XinY0201/openpi-pi05-base-jax`, commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658` (referenciado en la *model card*; no se ha proporcionado URL directa)
- Dataset de entrenamiento: `Shiki42/ctr-scan-object-left-first-20260911`, commit `0dcad06b700ef298f34582a923ad7a534a2fc929` (referenciado en la *model card*; no se ha proporcionado URL directa)
- Libreria de despliegue: `openpi`
- Identificador de trabajo de entrenamiento citado por el autor: `job-de8bf5f0-763b-469f-8a2e-f692cf28ebbf`, `v2sam-exo2ego-fusion-official24-k21` (sin URL)
- Los resultados de la busqueda web proporcionada no contienen enlaces relacionados con este modelo: son hilos de un foro de tematica ajena, sin conexion con PI0.5, `openpi` ni robotica. No se han podido extraer enlaces utiles de esa busqueda.
