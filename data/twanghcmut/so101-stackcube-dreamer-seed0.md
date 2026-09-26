# twanghcmut/so101-stackcube-dreamer-seed0

## Resumen

so101-stackcube-dreamer-seed0 es un checkpoint de politica robotica (VLA, vision-language-action) publicado por el usuario twanghcmut en HuggingFace. Se trata de una variante concreta del pipeline `sim_vla` del proyecto de codigo `chickbong221/r2dreamer-graph` (rama `so101-real`), que combina un modelo de mundo de tipo Dreamer con SmolVLA en una configuracion denominada "dreamer" y sin grafo ("no graph"). El modelo esta entrenado sobre datos reales del brazo robotico SO-101 para una unica tarea de manipulacion: apilar un cubo azul sobre uno rojo (`stackcube`).

El entrenamiento se realizo en dos etapas: una primera fase de modelo de mundo (15.000 pasos) y una segunda de imitacion (15.000 pasos, con perdida final de aproximadamente 0,03). No se ejecuto fase online. El entrenamiento se llevo a cabo en una unica GPU H100 en modo MIG 3g.40gb con tamano de lote 8, la mitad del usado en la configuracion de referencia, y con semilla 0, de ahi el sufijo `seed0` del repositorio.

Se trata de un artefacto de investigacion muy especifico: el repositorio ocupa 2,0 GB y solo contiene los pesos de los dos componentes (`world_model.pt` e `imitation.pt`), sus metadatos JSON, el fichero de normalizacion y el log de entrenamiento. No se declara licencia, idiomas soportados, numero de parametros ni resultados de benchmarks, por lo que su uso en produccion requiere una evaluacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA para robotica: modelo de mundo Dreamer + SmolVLA (variante "dreamer", "no graph"), entrenado en dos etapas (modelo de mundo e imitacion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos `.pt` en precision de entrenamiento; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo de accion robotica, no orientado a lenguaje natural de proposito general) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`world_model.pt`, `imitation.pt`) mas ficheros JSON de metadatos y `normalization.json` |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes. El primero es un modelo de mundo de la familia Dreamer, entrenado durante 15.000 pasos (etapa 1A) con un learning rate inicial de 1e-4, 1.000 pasos de warmup y decaimiento hasta 1e-5. El segundo es un modulo de imitacion basado en SmolVLA (etapa 1B), entrenado otros 15.000 pasos con learning rate 1e-4, 1.000 pasos de warmup y decaimiento hasta 2,5e-6, alcanzando una perdida final de aproximadamente 0,03. La variante se etiqueta como "dreamer" y "no graph", lo que la distingue de otras configuraciones del mismo pipeline que incorporan una representacion en grafo. No hubo fase de entrenamiento online (`--online-steps 0`).

Los datos de entrenamiento son reales, no simulados: se utilizo la tarea `stackcube` (cubo azul sobre cubo rojo) restringida a los episodios 50 a 98 del conjunto `hungho77/so101-multitask`, con el brazo SO-101. El entrenamiento se ejecuto sobre una GPU H100 MIG 3g.40gb con tamano de lote 8, frente a los 16 de la configuracion de referencia, por lo que cada etapa vio la mitad de muestras que la ejecucion de referencia. La reproducibilidad esta acotada por la semilla 0 y el commit `920d07dbfedb6d19e34c19736d93ee2b5abf66d0` de la rama `so101-real` del repositorio de codigo. El comando exacto de entrenamiento esta documentado en la model card.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica: la politica esta especializada en la tarea de apilar un cubo azul sobre uno rojo con el brazo SO-101.
- Percepcion visual y control: al ser un modelo VLA entrenado sobre datos reales del robot, procesa observaciones visuales del entorno y produce comandos de accion.
- Modelado del entorno: el componente Dreamer actua como modelo de mundo, lo que permite aprender dinamicas del entorno a partir de transiciones reales.
- Imitacion de comportamiento: la etapa 1B aprende por imitacion de las trayectorias de demostracion de los episodios 50-98 del dataset `so101-multitask`.
- Reanudacion y fine-tuning: los checkpoints se pueden recargar con `--resume-from <carpeta>`, lo que permite continuar el entrenamiento o adaptarlo a otra tarea.
- Tool calling / function calling: no disponible; no es una capacidad descrita para este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes de lenguaje; el modelo opera como politica de control de un solo brazo y una tarea.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales: no se declara modo de razonamiento explicito, vision general, audio ni otras modalidades mas alla de la percepcion necesaria para la tarea.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta directamente la secuencia de apilado de un cubo sobre otro con un brazo SO-101, por lo que sirve como politica de referencia en montajes de robotica de bajo coste.
- Investigacion en modelos de mundo aplicados a robotica: al separar explicitamente el modelo de mundo (`world_model.pt`) del modulo de imitacion (`imitation.pt`), permite estudiar como las dinamicas aprendidas influyen en el rendimiento de la politica de imitacion.
- Estudios de ablacion y reproducibilidad: al fijar la semilla 0 y publicar el comando de entrenamiento, sirve como punto de comparacion contra otras semillas o variantes del mismo pipeline (por ejemplo, versiones con grafo o con fase online).
- Baseline para comparar arquitecturas VLA en tareas de apilado: investigadores que evaluen SmolVLA frente a otras politicas en `stackcube` pueden usar este checkpoint como referencia entrenada sobre datos reales.
- Fine-tuning a tareas de ensamblaje relacionadas: gracias al flag `--resume-from`, el checkpoint se puede recargar y continuar el entrenamiento con nuevos episodios de tareas de manipulacion similares (encajar piezas, colocar objetos sobre marcas).
- Docencia y divulgacion tecnica: el repositorio documenta de forma explicita el pipeline de dos etapas, los hiperparametros y el hardware utilizado, lo que lo hace util como material didactico sobre entrenamiento de politicas roboticas con modelos de mundo.
- Experimentacion con presupuesto reducido de GPU: al haberse entrenado con lote 8 en una MIG de 40 GB, demuestra un flujo de trabajo viable para grupos con acceso limitado a hardware de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado es la perdida final de la etapa de imitacion, aproximadamente 0,03, junto con el numero de pasos de cada etapa (15.000 y 15.000). No se proporcionan tasas de exito de la tarea `stackcube`, ni metricas en entornos simulados o reales.

## Requisitos de hardware

- Entrenamiento documentado: 1 GPU H100 en modo MIG 3g.40gb (rebanada de 40 GB) con tamano de lote 8. La configuracion de referencia del proyecto usa lote 16, lo que sugiere que se necesita mas memoria para igualar la ejecucion de referencia.
- VRAM de inferencia: no disponible de forma explicita. El repositorio completo ocupa 2,0 GB, de modo que los pesos de ambos componentes suman como maximo ese tamano; una estimacion orientativa situaria la inferencia en el rango de 4-8 GB de VRAM, pero se trata de una estimacion no confirmada por el autor.
- GPU consumer: no confirmado. Dado el tamano del repositorio, es plausible que quepa en GPUs de consumo con 8 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), pero no hay validacion publicada.
- GPU de datacenter recomendadas: el autor uso una H100 MIG; A100 y H100 serian las opciones naturales si se replica el pipeline completo de entrenamiento.
- Opciones de despliegue: los pesos son ficheros PyTorch `.pt` cargados por el propio codigo del proyecto `r2dreamer-graph`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a politicas roboticas de este tipo.
- Latencia y throughput: no disponibles. Al ser un modelo de control robotico, la metrica relevante seria la frecuencia de control alcanzable, que no se reporta.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-stackcube-dreamer-seed0 | VLA + modelo de mundo (Dreamer + SmolVLA) | no disponible | no disponible | no disponible | Pesos `.pt` en HuggingFace |
| SmolVLA (arquitectura base empleada) | VLA | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo publico de referencia del componente de imitacion |
| Otras variantes del pipeline `r2dreamer-graph` | VLA + modelo de mundo | no disponible | no disponible | no disponible | Mismo repositorio de codigo, rama `so101-real` |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada. La comparacion relevante es funcional: este checkpoint es una especializacion para la tarea `stackcube` sobre el brazo SO-101, no un modelo de proposito general.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado unicamente para la tarea `stackcube` (cubo azul sobre cubo rojo) con el brazo SO-101. No se espera que generalice a otras tareas, objetos o morfologias de robot sin reentrenamiento.
- Datos limitados: el entrenamiento uso solo los episodios 50 a 98 del dataset `so101-multitask`, un subconjunto reducido que limita la diversidad de situaciones cubiertas.
- Tamano de lote reducido: se entreno con lote 8 frente al 16 de la configuracion de referencia, por lo que cada etapa vio la mitad de muestras. Esto puede traducirse en un rendimiento inferior al de la ejecucion de referencia.
- Sin fase online: al fijar `--online-steps 0`, no hubo ajuste con interaccion en el entorno, lo que suele reducir la robustez ante desviaciones de la politica.
- Licencia ausente: no se declara licencia, lo que impide determinar si el uso comercial esta permitido. Se debe contactar con el autor antes de cualquier uso en produccion.
- Ausencia de benchmarks: no hay tasas de exito publicadas, ni en simulacion ni en el robot real, por lo que el rendimiento real es desconocido.
- Riesgo de sobreajuste y de fallo silencioso: con solo dos etapas de 15.000 pasos y una perdida de imitacion de 0,03, existe riesgo de sobreajuste al subconjunto de demostraciones y de degradacion fuera de la distribucion de entrenamiento.
- Sesgos: no disponibles; no se ha publicado ningun analisis de sesgos, y en robotica los sesgos relevantes serian de distribucion de objetos, iluminacion y posiciones iniciales, no reflejados en la model card.
- Idiomas y contexto: no se declaran idiomas ni longitud de contexto, por lo que no se puede asumir soporte multilingue ni un limite de contexto conocido.
- Reproducibilidad sujeta al codigo: el comportamiento depende del commit `920d07dbfedb6d19e34c19736d93ee2b5abf66d0` de la rama `so101-real`; cambios posteriores en el repositorio pueden alterar la carga o el resultado.
- Cero adopcion: el repositorio registra 0 descargas y 0 "likes", por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/twanghcmut/so101-stackcube-dreamer-seed0
- Codigo del pipeline: repositorio `chickbong221/r2dreamer-graph`, rama `so101-real`, commit `920d07dbfedb6d19e34c19736d93ee2b5abf66d0` (no se proporciona URL explicita en la informacion disponible)
- Dataset de entrenamiento: `hungho77/so101-multitask` (episodios 50-98, tarea `stackcube`; no se proporciona URL explicita)
- Arquitectura base de imitacion: SmolVLA (no se proporciona enlace explicito en la informacion disponible)
- Model card del autor: incluida en el repositorio de HuggingFace enlazado arriba
