# tbd-lab/cof-maze-checkpoints

## Resumen

`tbd-lab/cof-maze-checkpoints` es un repositorio de checkpoints de entrenamiento, no un modelo listo para inferencia. Contiene los pesos de un generador de vídeo derivado de **Wan2.1-T2V-1.3B** (el transformer de difusión texto-a-vídeo de 1.3B parámetros de Alibaba) que ha sido adaptado a generación **autorregresiva causal (AR)** con condicionamiento de imagen (i2v) y entrenado específicamente para la tarea de **navegación en laberintos**. El autor es `tbd-lab` y el proyecto asociado se denomina COF-maze.

El repositorio está organizado por ejecuciones de entrenamiento: cada directorio `<run>/checkpoint_model_XXXXXX/` incluye `model.pt` (pesos del generador) y `trainer.pt` (estado del optimizador, del cargador de datos y del generador de números aleatorios, necesario para reanudar el entrenamiento de forma exacta). Solo se suben hitos cada 2000 pasos; los checkpoints semilla bifurcados desde otras ejecuciones (enlaces simbólicos) no se duplican. El tamaño total del repositorio es de 721,2 GB.

Su relevancia es acotada pero clara: es material de investigación reproducible para estudiar técnicas de *causal forcing* en modelos de vídeo, evaluar la degradación o estabilidad de un modelo autorregresivo a lo largo del entrenamiento y servir de base para experimentos posteriores de *world models* aplicados a navegación. No es un modelo de propósito general ni está pensado para uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (base Wan2.1-T2V-1.3B) adaptado a generacion autorregresiva causal (AR) con condicionamiento de imagen (i2v) |
| Parametros totales | 1.3B (segun la nomenclatura del modelo base; no confirmado de forma explicita en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen sin cuantizar, en formato `.pt`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch, serializacion pickle de tensores): `model.pt` para el generador y `trainer.pt` para el estado de entrenamiento |
| Tamano del repositorio | 721,2 GB |
| Periodicidad de los checkpoints | Cada 2000 pasos de entrenamiento |
| Tarea | Navegacion en laberintos (generacion de video condicionada por imagen) |
| Pipeline declarado en HuggingFace | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de partida es el transformer de difusion de Wan2.1 en su variante T2V de 1.3B parametros, reutilizado aqui como generador autorregresivo causal con condicionamiento de imagen (i2v). El termino "COF" del nombre del proyecto probablemente corresponde a *Causal Forcing*, a juzgar por las rutas `causal-forcing-changes/configs/` citadas en la propia model card, aunque el autor no lo desarrolla de forma explicita. La nomenclatura de las ejecuciones (`maze_ar_scratch_i2v_var4_cut1_preloop_r2only`) indica que se entrenan variantes desde cero (*scratch*) sobre la tarea de laberintos, con distintos ajustes de configuracion.

No se dispone de informacion sobre el volumen de tokens o frames de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Si se documenta el mecanismo de reanudacion exacta: cada checkpoint incluye el estado del optimizador, del cargador de datos y del RNG en `trainer.pt`, lo que permite retomar el entrenamiento en el punto exacto en que se genero el checkpoint. La organizacion en repositorio unico por ejecucion, con hitos cada 2000 pasos y sin duplicar checkpoints semilla enlazados simbolicamente, apunta a un flujo de trabajo de investigacion con multiples ramas de entrenamiento comparables entre si. Las rutas de configuracion referenciadas (`causal-forcing-changes/configs/`, `ops/train/configs/`, `ops/workstation/jobs/`) no estan enlazadas en la informacion disponible.

## Capacidades

- Generacion de video condicionada por imagen (i2v) con decodificacion autorregresiva causal de frames.
- Modelado de secuencias de navegacion en laberintos: el modelo esta entrenado especificamente para esta tarea, no para generacion de video abierta.
- Reanudacion exacta del entrenamiento: `trainer.pt` conserva optimizador, datos y RNG.
- Comparabilidad entre ejecuciones: los checkpoints cada 2000 pasos permiten trazar la evolucion del modelo dentro de una misma ejecucion.
- Ajuste fino posterior: los pesos `model.pt` pueden servir como punto de partida para continuar entrenamiento.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponibles.

## Casos de uso

- **Investigacion en generacion de video autorregresiva causal**: los checkpoints permiten reproducir y auditar experimentos de *causal forcing* sobre un transformer de difusion, comparando variantes de configuracion con nomenclaturas como `var4`, `cut1` o `preloop` dentro de un mismo marco experimental.
- **Evaluacion de world models para navegacion**: el modelo genera rollouts visuales de trayectorias en laberintos, lo que permite analizar si el modelo mantiene coherencia espacial y temporal a lo largo de la secuencia y si es util como simulador para planificacion.
- **Reproduccion exacta de experimentos**: gracias a `trainer.pt`, un equipo puede retomar una ejecucion detenida en el paso 2000, 4000, 6000, etc., sin perder el estado del optimizador ni de la secuencia de datos, algo poco habitual en repositorios de checkpoints publicos.
- **Analisis de estabilidad del entrenamiento**: al disponer de hitos cada 2000 pasos, es posible medir deriva (*drift*), colapso o mejoria progresiva del generador en funcion del numero de pasos, algo relevante en modelos autorregresivos donde el error se acumula.
- **Generacion de datos sinteticos para agentes de navegacion**: los rollouts de video pueden emplearse como datos de aumento para entrenar politicas de navegacion o modelos de prediccion de estado en un entorno simulado.
- **Punto de partida para ajuste fino adicional**: un laboratorio puede cargar un `model.pt` intermedio y continuar el entrenamiento con su propio dataset de laberintos o con una tarea de control distinta, aprovechando que el estado del optimizador esta disponible.
- **Benchmarking de tecnicas de decodificacion causal en video**: comparar este generador con alternativas de decodificacion no causal o con modelos de difusion estandar sobre la misma tarea de laberinto.
- **Estudios de eficiencia de almacenamiento y checkpoints**: el repositorio (721,2 GB) sirve como caso real para disenar estrategias de versionado selectivo de checkpoints en proyectos de investigacion con multiples ramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de generacion (FVD, PSNR, SSIM ni similares), resultados de exito en tareas de navegacion, ni comparaciones cuantitativas con otros modelos. Tampoco se documentan latencias o吞吐 en inferencia.

## Requisitos de hardware

- **Almacenamiento**: el repositorio completo ocupa 721,2 GB. Conviene descargar solo la ejecucion y el hito concretos que se necesiten.
- **Checkpoint individual**: 1.3B parametros. En fp32 los pesos del generador rondan los 5,2 GB; en bf16, unos 2,6 GB. Sumando el estado del optimizador en `trainer.pt` (habitualmente dos momentos de Adam mas posibles copias maestras en fp32), un checkpoint completo puede situarse en el rango de 15-20 GB por hito. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- **VRAM para inferencia**: no publicada. Como referencia orientativa (no confirmada), un modelo de 1.3B en bf16 ocupa unos 2,6-3 GB de pesos, mas activaciones dependientes de la resolucion y el numero de frames; cabria esperar un rango de 8-12 GB para clips cortos y de 16-24 GB para secuencias mas largas. No hay datos oficiales al respecto.
- **GPU recomendadas**: no publicadas. Para inferencia, tarjetas consumer de gama alta con 16-24 GB (RTX 4080/4090) serian suficientes con alta probabilidad; para entrenamiento o ajuste fino, GPU de datacenter tipo A100 o H100 por el coste de memoria del estado del optimizador.
- **Viabilidad en GPU de consumo**: probable para inferencia en configuraciones modestas, no confirmada por el autor. Para entrenamiento completo, poco realista en una unica GPU de consumo.
- **Opciones de despliegue**: los pesos `.pt` no siguen el formato de Diffusers, GGUF ni safetensors, por lo que no son cargables directamente en llama.cpp, Ollama, vLLM, TGI ni pipelines estandar de Diffusers. Se requiere el codigo de entrenamiento original del proyecto COF-maze (no enlazado en la informacion disponible) o una conversion manual a safetensors/Diffusers.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base del que derivan estos checkpoints. No se documentan otros modelos comparables en la model card.

| Modelo | Parametros | Modalidad | Tarea | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `tbd-lab/cof-maze-checkpoints` | 1.3B (heredados del base) | Video i2v autorregresivo causal | Navegacion en laberintos | no disponible | `.pt` (pesos + estado de entrenamiento) | Repositorio HuggingFace, 0 descargas |
| Wan2.1-T2V-1.3B (modelo base) | 1.3B | Texto a video (difusion) | Generacion general de video | no disponible en la informacion proporcionada | safetensors / Diffusers (segun documentacion del autor original) | Publico en HuggingFace |

Otros modelos comparables de la misma categoria (world models para navegacion o generadores de video autorregresivos de ~1-2B parametros): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- **No es un modelo desplegable**: es un repositorio de checkpoints de investigacion. No incluye pipeline de inferencia, configuracion de decodificacion, tokenizer ni documentacion de uso.
- **Licencia no declarada**: al no especificarse licencia, no hay autorizacion explicita de uso comercial. Ademas, al derivar de Wan2.1, siguen aplicando las condiciones de licencia del modelo base, que deben verificarse por separado en su repositorio original.
- **Sin evaluacion de calidad**: no hay benchmarks, metricas de similitud ni tasas de exito en la tarea de navegacion. No es posible afirmar que el modelo funcione bien en ningun escenario concreto.
- **Especializacion extrema**: el entrenamiento se centra en navegacion en laberintos, por lo que es previsible una perdida de capacidades de generacion general respecto al modelo base. Esta degradacion no esta cuantificada.
- **Riesgo de acumulacion de error**: en generacion autorregresiva de video, los errores se propagan frame a frame y pueden producir incoherencia temporal o colapso visual en rollouts largos. No se documenta ningun mecanismo de mitigacion ni su eficacia.
- **Formato `.pt` y seguridad**: cargar pesos en formato pickle con `torch.load` implica riesgo de ejecucion de codigo arbitrario. Se recomienda `weights_only=True` o conversion previa a safetensors.
- **Consumo de almacenamiento**: 721,2 GB de repositorio, con checkpoints individuales que probablemente superan los 15 GB al incluir el estado del optimizador.
- **Ausencia de informacion sobre sesgos e idiomas**: no se documentan sesgos conocidos, composicion del dataset de entrenamiento ni idiomas cubiertos, lo que impide cualquier evaluacion de equidad o cobertura linguistica.
- **Inconsistencia en las fechas**: el repositorio figura como creado y actualizado el 2026-10-04, una fecha futura respecto al momento de redaccion de esta ficha. Esto sugiere un error de marca temporal o datos inconsistentes en el registro de HuggingFace.
- **Documentacion unicamente en chino**: la model card esta redactada en chino y no incluye guia de uso, hiperparametros de inferencia ni descripcion del dataset.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tbd-lab/cof-maze-checkpoints
- Repositorio COF-maze (referenciado en la model card, sin URL disponible): no disponible
- Configuraciones de entrenamiento (`causal-forcing-changes/configs/`): no disponible
- Configuraciones de entrenamiento (`ops/train/configs/`): no disponible
- Cargas de trabajo (`ops/workstation/jobs/`): no disponible
- Modelo base Wan2.1-T2V-1.3B: repositorio oficial del autor original, no enlazado en la informacion proporcionada
- Paper, blog o demo asociados: no disponibles
