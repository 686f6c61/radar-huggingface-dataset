# zachttang/pi05-fold-cloth-lora-75pct

## Resumen

pi05-fold-cloth-lora-75pct es un checkpoint de inferencia derivado del modelo base pi05 (OpenPI) y ajustado mediante LoRA para una tarea robotica concreta: doblar un mantel por la mitad. Lo publica el usuario zachttang en Hugging Face y procede de una ejecucion de entrenamiento identificada como `fold_cloth_75pct_s42_bs128_e7.5_72566`, con la configuracion `pi05_fold_cloth_real_lora`. El sufijo "75pct" indica que se utilizo un subconjunto del 75 % de los episodios de entrenamiento disponibles.

El modelo no es un modelo de lenguaje al uso, sino una politica visomotora (vision-language-action) para control robotico. Se distribuye como checkpoint Orbax para codigo OpenPI basado en JAX, no como pesos Transformers, e incluye estadisticas de normalizacion y los identificadores de episodios seleccionados. La adaptacion emplea articulaciones y pinzas de tipo ALOHA, acciones delta de articulacion y tres camaras: `cam_high`, `cam_wrist_left` y `cam_wrist_right`.

Es relevante como ejemplo de flujo de trabajo de ajuste fino LoRA sobre pi05 para una habilidad manipulativa especifica, con hiperparametros documentados (semilla 42, batch 128, 7,5 epocas). No hay resultados de evaluacion publicados ni licencia declarada, lo que limita su uso en produccion sin verificacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica visomotora pi05 (OpenPI), checkpoint Orbax/JAX; no disponible el detalle interno de capas |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint Orbax en precision de entrenamiento) |
| Idiomas soportados | en (instrucciones en ingles) |
| Licencia | no disponible (el autor no la ha especificado) |
| Formato de pesos | Orbax (directorio `params/` y `assets/`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint parte del modelo base `gs://openpi-assets/checkpoints/pi05_base/params` y se ajusta con LoRA sobre la configuracion `pi05_fold_cloth_real_lora`. La tarea se especifica con la instruccion textual "Fold the tablecloth in half". El entrenamiento uso semilla 42, tamano de batch 128 y un presupuesto de 7,5 epocas sobre un subconjunto del 75 % de episodios. Se conserva unicamente el paso 2064; el estado del optimizador y de entrenamiento se excluye deliberadamente.

La configuracion adapta articulaciones y pinzas ALOHA y produce acciones delta de articulacion a partir de tres vistas de camara. Los `assets` incluyen estadisticas de normalizacion y los IDs de episodios seleccionados, necesarios para reproducir la inferencia. No se documentan volumen de datos, composicion del dataset ni si hubo etapas de RL o DPO.

## Capacidades

- Control robotico visomotor para la tarea de doblar un mantel por la mitad.
- Procesamiento de tres flujos de camara (`cam_high`, `cam_wrist_left`, `cam_wrist_right`).
- Generacion de acciones delta de articulacion para brazos ALOHA con pinzas.
- Seguimiento de instrucciones en ingles para la tarea entrenada.
- Ajuste fino LoRA sobre el modelo base pi05, con pesos adaptadores integrados en el checkpoint.
- No se documenta soporte de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en manipulacion deformable: evaluar como pi05 con LoRA generaliza el doblado de tela a partir del 75 % de episodios, comparando con el modelo base sin ajuste.
- Reproduccion de experimentos: cargar el paso 2064 con el codigo OpenPI y la configuracion correspondiente para replicar la seleccion de episodios y las estadisticas de normalizacion.
- Linea base para nuevos ajustes LoRA: usar este checkpoint como punto de partida para variar el porcentaje de episodios, el batch o las epocas en tareas de plegado.
- Pruebas de integracion en simulacion o laboratorio con brazos ALOHA y tres camaras, verificando el pipeline de inferencia antes de desplegar en hardware real.
- Estudio de robustez ante instrucciones: comprobar si el modelo responde solo a la instruccion entrenada o tolera variantes en ingles.
- Docencia y divulgacion: ilustrar el ciclo completo de un ajuste fino LoRA sobre una politica VLA, desde el checkpoint base hasta la evaluacion en entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que los resultados de evaluacion de la politica aun no se han reportado.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 6,3 GB, pero el consumo real depende del modelo base pi05 y del entorno JAX.
- GPU recomendadas: no disponible; el codigo OpenPI esta orientado a JAX, por lo que se espera compatibilidad con GPUs NVIDIA y TPUs, sin datos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el checkpoint no esta cuantizado ni en GGUF, lo que dificulta el despliegue en tarjetas de gama consumer.
- Opciones de despliegue: codigo OpenPI con JAX y carga de checkpoints Orbax; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-fold-cloth-lora-75pct | no disponible | no disponible | Doblado de mantel con LoRA | no disponible | Hugging Face, Orbax |
| pi05 base (OpenPI) | no disponible | no disponible | Politica VLA general | no disponible en esta informacion | Referenciado como checkpoint base en GCS |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No hay licencia declarada; no se puede asumir uso comercial permitido.
- Ausencia de resultados de evaluacion: no hay evidencia publicada de exito en la tarea.
- El checkpoint esta especializado en una unica instruccion en ingles y en un unico tipo de tela; fuera de ese dominio el comportamiento es incierto.
- Requiere el codigo OpenPI y la configuracion exacta, ademas de preservar la estructura de directorios; no es cargable con `from_pretrained` de Transformers.
- Depende de hardware ALOHA con tres camaras y de las estadisticas de normalizacion incluidas en `assets`; alterarlas invalida la inferencia.
- Riesgo de sobreajuste al subconjunto del 75 % de episodios y de sesgos derivados de la distribucion de datos original.
- El estado del optimizador no se incluye, por lo que no es posible reanudar el entrenamiento desde este checkpoint.
- Posible alucinacion o acciones incoherentes en escenarios visuales no vistos durante el entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/zachttang/pi05-fold-cloth-lora-75pct
- Checkpoint base referenciado: gs://openpi-assets/checkpoints/pi05_base/params
- OpenPI (repositorio del proyecto): no disponible en la informacion proporcionada
- Paper de pi05: no disponible en la informacion proporcionada
