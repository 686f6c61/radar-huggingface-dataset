# Travor278/pi05-scan-object-uniform-data20260916-lora-10k-e196

## Resumen

pi05-scan-object-uniform-data20260916-lora-10k-e196 es un checkpoint de inferencia de un modelo vision-lenguaje-accion (VLA) obtenido mediante ajuste fino con LoRA (rango 3 episodios segun la configuracion referenciada) sobre la base PI0.5 del proyecto OpenPI. Lo publica el usuario Travor278 en Hugging Face y esta orientado a robotica en simulacion, concretamente a la tarea de escaneo/recogida uniforme de objetos definida por el dataset Shiki42/ctr-scan-object-uniform-20260916. El repositorio ocupa 6,3 GB y se distribuye como checkpoint JAX/Orbax, sin conversion a safetensors ni a GGUF.

El entrenamiento parte de una base fresca y ejecuta 10.000 actualizaciones del optimizador (E196 hace referencia a esa iteracion), con batch de 16 por experimento, acumulacion de gradiente de 1, FSDP de 1 y semilla 87431. La politica usa un horizonte de accion de 50 pasos y representa 12 dimensiones de articulacion como incrementos (delta), con los valores de las pinzas en absoluto y una mascara de perdida para el relleno temporal. Dos experimentos independientes compartieron cada GPU H100 durante el entrenamiento.

Es relevante como ejemplo reproducible de ajuste fino LoRA sobre PI0.5 en el ecosistema OpenPI: incluye los parametros de inferencia y los activos de normalizacion, y pasa un control independiente de recarga en CPU y de finitud de parametros. En cambio, no declara licencia ni idiomas, no publica tasa de exito en simulacion y no aporta benchmarks, por lo que su utilidad practica esta todavia por validar de forma externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA de la familia PI0.5 sobre OpenPI (backbone vision-lenguaje con experto de acciones); el autor no detalla la arquitectura interna en la model card |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (la politica usa un horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint JAX/Orbax en precision nativa; sin conversion a safetensors ni GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | JAX/Orbax (checkpoint de inferencia; directorio `10000/` como `checkpoint_dir`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna; se limita a etiquetar el modelo como `openpi`, `pi05`, `jax` y `robotics`. Segun la documentacion publica de la familia PI0.5 y de OpenPI (conocimiento general, no incluido en la informacion proporcionada), se trata de un modelo vision-lenguaje-accion que combina un backbone vision-lenguaje con un experto de acciones y que genera trayectorias de accion por bloques. Cualquier cifra concreta de parametros, capas o dimensiones no esta disponible en la informacion facilitada.

El ajuste fino sigue la regla estandar de congelacion de LoRA de OpenPI, que ademas entrena el codificador de vision y las cabezas. Los hiperparametros documentados son: base fresca, 10.000 actualizaciones del optimizador, batch de 16 por experimento, acumulacion de gradiente 1, FSDP 1, semilla 87431, horizonte de accion 50 y 12 dimensiones de articulacion en representacion delta con pinzas absolutas. Se aplica una mascara de perdida por relleno temporal. La revision del dataset es `766e18802a11bdde94f6dab6892c13d82e6a5bd3` y la configuracion compatible es `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` sobre el commit de OpenPI `228bbb2a75e2a5ba672b5270bfea960051e4f125`. El checkpoint supero una recarga independiente en CPU y una comprobacion de finitud de parametros; los ficheros de inferencia se rehashearon antes de la subida y se documentan en `CHECKPOINT_MANIFEST.json`.

## Capacidades

- Generacion de acciones roboticas: produce bloques de acciones de hasta 50 pasos a partir de observaciones visuales e instrucciones.
- Control de 12 dimensiones de articulacion: representadas como incrementos, con las pinzas en valores absolutos.
- Percepcion visual: consume imagenes como parte de la observacion (el ajuste entrena tambien el codificador de vision).
- Seguimiento de instrucciones en lenguaje natural: heredado del backbone vision-lenguaje de PI0.5; no se documenta el grado de soporte ni los idiomas.
- Ejecucion en simulacion: el dataset de entrenamiento es `ctr-scan-object-uniform-20260916`, de naturaleza simulada.
- Inferencia exclusiva: no incluye estado del optimizador, estado de reanudacion del cargador de datos ni checkpoints de entrenamiento.
- Tool calling / function calling: no disponible (no aplica a la tarea de control).
- Soporte de agentes y razonamiento multi-paso explicito: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision adicional o audio: no disponible.

## Casos de uso

- Evaluacion de politicas en simulacion: cargar el checkpoint con `checkpoint_dir=10000/` en el runtime de OpenPI y medir el comportamiento de la politica en la tarea `scan-object-uniform` para comparar iteraciones de entrenamiento.
- Ablacion entre checkpoints: contrastar este E196 con el E169 anterior del mismo autor para estudiar el efecto de refrescar los datos del dataset y de aumentar las actualizaciones del optimizador.
- Reutilizacion del adaptador para experimentos: usar los parametros de inferencia y los activos de normalizacion incluidos como referencia para reproducir la configuracion `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`.
- Generacion de rollouts para analisis de robustez: ejecutar la politica en el simulador y analizar los fallos por dimension de articulacion o por segmento del horizonte de accion (50 pasos, 12 dimensiones).
- Investigacion en aprendizaje por imitacion y ajuste eficiente: sirve como caso de estudio de LoRA sobre un modelo VLA de gran tamano, con regla de congelacion documentada y congelacion del resto del backbone.
- Integracion en bucles de control robotico: desplegar el checkpoint mediante el runtime JAX de OpenPI para controlar un manipulador en el simulador, ajustando la frecuencia de inferencia al horizonte de acciones.
- Docencia y demostraciones tecnicas: ilustrar el flujo completo de OpenPI (base PI0.5, activos de normalizacion, adaptador LoRA e inferencia) sin necesidad de reentrenar desde cero.
- Trazabilidad de experimentos: enlazar las metricas de entrenamiento registradas en SwanLab con los pesos exactos publicados gracias al hash de revision del dataset y al manifiesto del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card indica explicitamente que no se reclama ninguna tasa de exito en simulacion para este checkpoint nuevo. Las unicas metricas disponibles son las de entrenamiento, alojadas en el registro externo `https://swanlab.cn/@Travor/CTR-PI05-LoRA10k` (run E196), que no se reproducen en el repositorio de Hugging Face.

## Requisitos de hardware

- Tamano del repositorio: 6,3 GB en disco, correspondiente al adaptador y a los activos de inferencia incluidos.
- Modelo base: el checkpoint no es autonomo; la variable `PI05_JAX_BASE` debe apuntar a un directorio de parametros base PI0.5 verificado por separado, lo que anade peso y memoria sobre los 6,3 GB del repositorio.
- VRAM estimada para inferencia: no disponible. El autor no publica el recuento de parametros; como orientacion, la inferencia exige mantener en memoria el modelo base PI0.5 mas los pesos de este adaptador (4 veces el tamano del fichero en el caso de pesos en float32, la mitad si se cargan en bfloat16).
- GPU recomendadas: no especificadas para inferencia; el entrenamiento se realizo en H100 (dos experimentos independientes compartieron cada H100).
- Viabilidad en GPU de consumo: no verificada. No hay datos publicados sobre ejecucion en RTX 4090 u otras GPU de gama alta para consumidores.
- Opciones de despliegue: runtime de OpenPI basado en JAX con `checkpoint_dir` apuntando al directorio `10000/`. Tambien requiere las variables `PARALLELVLA_DATASET_REPO=Shiki42/ctr-scan-object-uniform-20260916` y `PARALLELVLA_NORM_ASSETS_DIR` apuntando a `10000/assets`.
- Formatos de despliegue alternativos: no disponibles; no se ha realizado conversion a safetensors y no se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-scan-object-uniform E196 (este) | no disponible | horizonte de accion 50 pasos; contexto no disponible | sin tasa de exito publicada | no disponible | Hugging Face, formato JAX/Orbax, 0 descargas, 0 likes |
| pi05-scan-object-uniform E169 (modelo anterior del mismo autor) | no disponible | no disponible | no disponible | no disponible | referenciado en la model card, sin URL aportada |
| Base PI0.5 (OpenPI) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | requerida via `PI05_JAX_BASE`, no incluida en el repositorio |

No se dispone de datos verificables sobre otros modelos VLA de la misma categoria (por ejemplo alternativas de control robotico de OpenPI u otros proyectos) en la informacion proporcionada, por lo que no se incluye una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse permiso de uso comercial ni de redistribucion. Es el principal riesgo legal del repositorio.
- Ausencia de benchmarks: no hay tasa de exito en simulacion ni resultados en entornos reales; la model card lo indica de forma explicita.
- Checkpoint solo de inferencia: no incluye estado del optimizador, estado de reanudacion del cargador de datos ni checkpoints de entrenamiento, por lo que no permite reanudar el entrenamiento tal cual.
- Dependencia de versiones concretas: exige el commit de OpenPI `228bbb2a75e2a5ba672b5270bfea960051e4f125` y la configuracion `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`; no es una instalacion de Python independiente.
- Dependencia de la base PI0.5: `PI05_JAX_BASE` debe apuntar a parametros base verificados por separado; sin ellos el checkpoint no funciona.
- Portabilidad reducida: sin conversion a safetensors ni GGUF, el uso queda ligado al ecosistema JAX/Orbax y OpenPI.
- Dominio restringido: el dataset de entrenamiento es de simulacion (`ctr-scan-object-uniform-20260916`); no hay evidencia de transferencia sim-to-real.
- Validacion externa nula: 0 descargas y 0 likes en el momento de la consulta; solo existe una comprobacion de recarga en CPU y de finitud de parametros realizada por el propio autor.
- Idiomas soportados: no disponibles; se desconoce el comportamiento del modelo ante instrucciones en castellano u otros idiomas.
- Sesgos conocidos: no disponibles; el autor no documenta analisis de sesgo ni de composicion del dataset mas alla de su identificador.
- Riesgo de alucinacion o de acciones incorrectas: no cuantificado, pero inherente a cualquier politica de imitacion desplegada fuera de su distribucion de entrenamiento.
- Nombre historico de la configuracion: `pi05_putcab_athenb_...` no refleja la tarea real del dataset; conviene no confundir el nombre con el dominio efectivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Travor278/pi05-scan-object-uniform-data20260916-lora-10k-e196
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-uniform-20260916
- Metricas de entrenamiento (SwanLab, run E196): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Manifiesto del checkpoint: `CHECKPOINT_MANIFEST.json` dentro del repositorio de Hugging Face
- Revision del dataset: `766e18802a11bdde94f6dab6892c13d82e6a5bd3`
- Commit compatible de OpenPI: `228bbb2a75e2a5ba672b5270bfea960051e4f125`
- Repositorio del modelo anterior E169: no disponible
- Paper o blog tecnico asociado: no disponible en la informacion proporcionada
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos no guardan relacion con el modelo.
