# Travor278/pi05-putcab-sequential-train100-v4-lora-10k

## Resumen

PI0.5 PutCab-Sequential-Train100-V4 LoRA 10k es un checkpoint de robótica basado en PI0.5 (pi-zero-point-five), el modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, en su variante JAX. Lo publica el usuario Travor278 como un ajuste fino mediante LoRA sobre el modelo base `XinY0201/openpi-pi05-base-jax` (commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`), con un único "action expert" estándar. No es un modelo de lenguaje: es una política de manipulación robótica que, dado un prompt en lenguaje natural y tres vistas RGB, genera secuencias de acciones de robot.

El modelo resuelve una tarea concreta de manipulación bimanual: abrir el cajón de un armario con el brazo izquierdo y depositar un objeto dentro con el brazo derecho. Se entrenó durante 10.000 actualizaciones sobre el dataset `Shiki42/PutCab-Sequential-Train100-V4` (100 episodios, 36.795 fotogramas a 16,6666 FPS, estado y acciones nativos de 14 dimensiones), en dos GPU H100 de 80 GB. La relevancia de esta ficha es acotada: se trata de un artefacto de investigación muy especializado, útil para reproducir o continuar un entrenamiento concreto, no de un modelo de propósito general.

El checkpoint se distribuye en formato Orbax para la librería OpenPI, con el árbol de parámetros de inferencia completo (pesos base, adaptadores LoRA y activos de normalización). El estado del optimizador no se incluye. El autor declara explícitamente que no se hace ninguna afirmación de tasa de éxito en evaluación de bucle cerrado (closed-loop rollout), por lo que su rendimiento real en el robot no está verificado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) PI0.5 sobre backbone PaliGemma, con un action expert estandar; implementacion JAX |
| Parametros totales | no disponible (la model card no declara el recuento; el repositorio completo ocupa 6,3 GB) |
| Longitud de contexto | no aplica en el sentido de LLM de texto; horizonte de acciones (action horizon) de 50 pasos |
| Tipos de cuantizacion | no disponible (checkpoint Orbax con pesos congelados en bf16 y pesos entrenables en float32; no se publican variantes GGUF ni int8/int4) |
| Idiomas soportados | no disponible (el prompt de entrenamiento esta en ingles; no se documenta soporte multilingue) |
| Licencia | no disponible |
| Formato de pesos | Orbax (checkpoint OpenPI); raiz de checkpoint en `10000/`; no safetensors ni GGUF |
| Tamano del repositorio | 6,3 GB |
| Estado y acciones | 14 dimensiones nativas, absolutas; padding a 32 en el pipeline |
| Entradas de vision | 3 vistas RGB nativas, redimensionadas a 224x224 |
| Dataset de entrenamiento | Shiki42/PutCab-Sequential-Train100-V4 (commit 26bbf382ca98340f134033cb017e2cc67d32446b): 100 episodios, 36.795 fotogramas, 16,666666666666668 FPS |
| Prompt de tarea | "Open the cabinet drawer with the left arm and place the object into it with the right arm." |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-12 / 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es la de PI0.5: un modelo de vision-lenguaje-accion que combina un backbone de vision-lenguaje PaliGemma con un modulo especializado ("action expert") que genera acciones de robot. En este caso se usa el "standard single action expert", sin variantes adicionales. El ajuste se aplica como LoRA sobre el backbone: rango y alpha de 16 para PaliGemma y 32 para el action expert, con un filtro de congelacion de referencia que mantiene entrenables las proyecciones y partes de la vision. Las activaciones y los pesos congelados se manejan en bf16, mientras que los pesos entrenables estan en float32.

El entrenamiento consistio en 10.000 actualizaciones con batch global de 16 sobre dos H100 de 80 GB, semilla 87431, optimizador AdamW (beta1 = 0,9; beta2 = 0,95; epsilon = 1e-8; weight decay = 1e-10; grad clip = 1) sin EMA. Se uso una curva de learning rate coseno de 30.000 pasos con 1.000 de calentamiento, pico 2,5e-5 y valor final 2,5e-6, deteniendo el entrenamiento en el paso 10.000. Los datos son estado y acciones absolutos nativos de 14 dimensiones, sin conversion de unidades tipo Aloha ni mascara de inactividad; tres vistas RGB se mapean mediante el `training_config.py` adjunto y se redimensionan a 224x224, con estado y acciones rellenados (padded) a 32 y horizonte de 50.

En cuanto a verificacion, el autor indica que se superaron comprobaciones independientes de estadisticas del dataset y de lector/tokenizer antes de asignar GPU, que se aplico un parche de compatibilidad Orbax ya validado, que todos los arrays de parametros y de optimizador se restauraron estrictamente y se comprobaron como finitos, que el paso de optimizador 10000 esta verificado y que se registraron hashes de arrays decodificados. No se reclama que el runtime sea identico byte a byte a un runtime archivado historico.

## Capacidades

- Generacion de acciones de robot: produce trayectorias de 14 dimensiones (estado y accion absolutos) condicionadas por observaciones visuales y un prompt de lenguaje natural, con horizonte de 50 pasos.
- Manipulacion bimanual: la tarea objetivo implica coordinacion de dos brazos (abrir un cajon con el izquierdo, depositar un objeto con el derecho).
- Percepcion multi-vista: consume tres vistas RGB nativas redimensionadas a 224x224.
- Condicionamiento por lenguaje: acepta una instruccion textual de tarea; en este checkpoint el prompt esta fijado a una unica tarea de entrenamiento.
- Ajuste eficiente mediante LoRA: el checkpoint incluye adaptadores de bajo rango sobre el backbone PaliGemma y el action expert, lo que permite reutilizar el modelo base congelado.
- No documentado: no hay soporte declarado de tool calling, function calling, agentes multi-paso, razonamiento explicito, vision general de proposito amplio, audio ni modo "thinking". No es un modelo de chat ni de generacion de texto libre.

## Casos de uso

- Reproduccion de un experimento de investigacion: cargar la raiz `10000/` en OpenPI y ejecutar la politica sobre el dataset PutCab-Sequential-Train100-V4 para inspeccionar predicciones de acciones frente a las etiquetas, dado que el autor valido la restauracion de parametros pero no publico evaluacion en bucle cerrado.
- Punto de partida para un nuevo ajuste LoRA: al incluir los adaptadores y los activos de normalizacion, sirve como inicializacion para continuar el entrenamiento con mas episodios o con una variacion de la tarea (por ejemplo, otro tipo de cajon o de objeto).
- Aprendizaje por imitacion en laboratorio: como referencia de configuracion (rank/alpha 16 y 32, bf16/float32, AdamW con esos hiperparametros) para disenar recetas de entrenamiento de VLA sobre dos H100 de 80 GB.
- Pruebas de integracion del pipeline OpenPI: verificar el mapeo del `training_config.py`, el reescalado a 224x224, el padding de estado y acciones a 32 y el tokenizador sobre datos propios.
- Comparacion de estrategias de congelacion: el filtro de congelacion declarado (incluye vision y proyecciones entrenables) permite estudiar el efecto de distintos esquemas de congelacion sobre la calidad de las politicas resultantes.
- Auditoria de artefactos de entrenamiento: el directorio `10000/experiment/` documenta versiones de runtime y paquetes, configuracion resuelta, commit y parche frente al upstream fijado, binding de GPU, manifiestos de ficheros de dataset y base, normalizacion, puertas de guardado en CPU y historial de trabajos, lo que resulta util para trazabilidad y reproducibilidad.
- Banco de pruebas de despliegue en bucle cerrado: escenario previsto por el autor como siguiente paso, ya que no se aporta ninguna tasa de exito medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card declara de forma explicita que no se hace ninguna afirmacion de tasa de exito en rollout de bucle cerrado ("No closed-loop rollout success-rate claim is made"). Por tanto, no hay MMLU, HumanEval, GSM8K ni metricas de exito de tarea que reportar.

## Requisitos de hardware

- Entrenamiento declarado: dos GPU H100 de 80 GB, batch global 16, 10.000 actualizaciones, entorno JAX construido aparte sobre el contenedor NGC PyTorch 25.02.
- Inferencia: no se documentan requisitos de VRAM. Como referencia orientativa, el arbol de parametros de inferencia ocupa 6,3 GB en el repositorio (pesos base congelados en bf16 mas adaptadores LoRA y activos de normalizacion). Sobre esa cifra hay que sumar el estado de activaciones del backbone de vision y del action expert, por lo que se estima un consumo de VRAM claramente superior al tamano del checkpoint; no se dispone de mediciones publicadas.
- GPU consumer: no disponible. No se ha confirmado el funcionamiento en RTX 3090, RTX 4090 ni similares, ni existen quantizaciones publicadas que reduzcan el requisito de memoria.
- Opciones de despliegue: la ruta documentada es OpenPI con formato Orbax. No hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos de lenguaje y no a politicas VLA de robot.
- Latencia y throughput: no disponibles. Deben medirse en el propio hardware, teniendo en cuenta que el control del robot exige baja latencia por paso de control.

## Comparativa con modelos similares

No hay datos numericos publicados en la informacion disponible que permitan una comparacion cuantitativa. La comparacion queda limitada a lo declarado.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PI0.5 base JAX (`XinY0201/openpi-pi05-base-jax`, commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658) | Modelo base sobre el que se aplica el LoRA; single action expert estandar | no disponible | no disponible | no disponible | repositorio en HuggingFace referenciado en la model card |
| Este checkpoint (pi05-putcab-sequential-train100-v4-lora-10k) | Ajuste LoRA de 10k actualizaciones para la tarea PutCab-Sequential-Train100-V4 | no disponible | horizonte de acciones 50 | no disponible | HuggingFace, 0 descargas |
| Otros VLA de robotica abierta (por ejemplo, familias tipo pi0/pi0-FAST u OpenVLA) | Alternativas de la misma categoria funcional | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no disponible: la model card no especifica terminos de uso. Sin licencia explicita no se puede asumir permiso para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier despliegue productivo.
- Ausencia de evaluacion en bucle cerrado: el autor no reclama ninguna tasa de exito. No hay evidencia publicada de que la politica funcione sobre un robot real.
- Especializacion extrema: el modelo esta entrenado con un unico prompt de tarea ("Open the cabinet drawer with the left arm and place the object into it with the right arm") y un unico dataset de 100 episodios. La generalizacion a otras tareas, objetos, cajones, alturas o disposiciones no esta demostrada.
- Riesgo de sobreajuste al entorno de captura: 36.795 fotogramas de 100 episodios, con tres vistas RGB concretas y condiciones de iluminacion, camara y robot especificas. El rendimiento fuera de esa configuracion puede degradarse de forma severa.
- Sesgos: no disponible. No hay analisis de sesgos publicado; en robotica esto se traduce en sesgos de escena, iluminacion, posicion de camara y morfologia del robot.
- Alucinacion: no aplica en el sentido de generacion de texto, pero si el fenomeno analogo de prediccion de acciones no validas o fuera de distribucion cuando la observacion se aleja de los datos de entrenamiento.
- Limitacion de idioma: el condicionamiento textual solo se ha ejercitado en ingles; no hay soporte multilingue documentado.
- Trazabilidad parcial: el directorio `10000/experiment/` contiene versiones, manifiestos e historial del trabajo, pero el estado del optimizador no se publica y el autor advierte que el runtime no es necesariamente identico byte a byte al archivado historico.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de los datos, sin issues ni evaluaciones de terceros que sirvan de contraste.
- Dependencia de la libreria OpenPI y del formato Orbax: el uso requiere toolchain JAX/OpenPI; no hay exportaciones a safetensors o GGUF que faciliten su integracion en stacks de inferencia habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-putcab-sequential-train100-v4-lora-10k
- Modelo base PI0.5 JAX: https://huggingface.co/XinY0201/openpi-pi05-base-jax (revision 5e62884fcf8cb8f9fc693c9163ea18d3e3739658)
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Sequential-Train100-V4 (revision 26bbf382ca98340f134033cb017e2cc67d32446b)
- Libreria openpi: referenciada en la model card como `library_name`; no se proporciona URL en la informacion disponible
- Identidad de entrenamiento declarada: v2sam-exo2ego-fusion-official24-k10, job-a057602f-08a6-444a-bf5f-20eeb6be7cb3
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente resultados no relacionados con el modelo, por lo que no se incluyen
