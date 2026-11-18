# zachttang/pi05-fold-cloth-lora-100pct

## Resumen

pi05-fold-cloth-lora-100pct es un checkpoint de inferencia derivado del modelo base pi05 (OpenPI) y ajustado mediante LoRA para una tarea concreta de robotica manipulativa: doblar un mantel por la mitad. Lo publica el usuario zachttang en Hugging Face como parte de una ejecucion de entrenamiento OpenPI identificada como `fold_cloth_100pct_s42_bs128_e7.5_72565`, con la configuracion `pi05_fold_cloth_real_lora`. No es un modelo de lenguaje generativo al uso, sino una politica visomotora (vision-language-action) que consume observaciones de camaras y estado articular y emite acciones de robot.

El checkpoint corresponde al paso de entrenamiento 2724, con semilla 42, tamano de lote 128 y un presupuesto de 7,5 epocas sobre el subconjunto completo de episodios de entrenamiento (el "100pct" del nombre). Se distribuye en formato Orbax para JAX, no en safetensors ni GGUF, y requiere el codigo y la configuracion personalizados de OpenPI para cargarse. El repositorio ocupa 6,3 GB e incluye `params/` y `assets/` (estadisticas de normalizacion e identificadores de episodios seleccionados), pero excluye deliberadamente el estado del optimizador.

Su relevancia es acotada: sirve como referencia reproducible de un ajuste fino LoRA sobre pi05 para una tarea de deformacion de tejidos (cloth folding), un dominio donde la variabilidad fisica y la escasez de datos reales complican el aprendizaje de politicas. No se han publicado resultados de evaluacion ni se ha especificado licencia, lo que limita su uso en produccion tal como se distribuye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica vision-language-action pi05 (OpenPI), ajustada con LoRA; checkpoint Orbax para JAX |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint Orbax en precision de entrenamiento) |
| Idiomas soportados | en (instrucciones de tarea en ingles) |
| Licencia | no disponible (el autor indica que aun no la ha especificado) |
| Formato de pesos | Orbax (JAX), no compatible con `from_pretrained` de Transformers |
| Tamano del repositorio | 6,3 GB |
| Paso de entrenamiento | 2724 |
| Semilla / lote / epocas | 42 / 128 / 7,5 |
| Camaras de entrada | `cam_high`, `cam_wrist_left`, `cam_wrist_right` |
| Espacio de acciones | Articulaciones ALOHA con adaptacion de pinza, acciones delta |
| Instruccion de tarea | "Fold the tablecloth in half." |
| Checkpoint base | `gs://openpi-assets/checkpoints/pi05_base/params` |

## Arquitectura y entrenamiento

El modelo parte de pi05, la familia de politicas visomotoras de OpenPI que combina un backbone vision-language con un cabezal de acciones y se ejecuta sobre JAX. El ajuste se realiza con LoRA sobre la configuracion `pi05_fold_cloth_real_lora`, es decir, se congelan los pesos del backbone y se entrenan adaptadores de bajo rango, lo que reduce el coste de ajuste frente al fine-tuning completo. La adaptacion cubre articulaciones y pinza en el esquema ALOHA, con acciones expresadas como deltas articulares, y consume tres flujos de camara: una vista alta y dos vistas de muneca.

El entrenamiento usa el subconjunto completo de episodios (100 %) de la tarea de doblado, con semilla 42, lote de 128 y 7,5 epocas, y el checkpoint publicado corresponde al paso 2724. Los assets incluyen las estadisticas de normalizacion y los identificadores de los episodios seleccionados, necesarios para reproducir la inferencia. No se documentan en la informacion disponible el numero de tokens, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detallan innovaciones de decodificacion o atencion mas alla de las propias de pi05.

## Capacidades

- Ejecucion de una politica visomotora para una unica instruccion en ingles: "Fold the tablecloth in half."
- Control de robot manipulador bimanual en esquema ALOHA, incluyendo articulaciones y pinzas.
- Prediccion de acciones delta a partir de observaciones multimodales de tres camaras.
- Acondicionamiento por instruccion en lenguaje natural (una sola tarea en este checkpoint).
- Carga mediante codigo y configuracion personalizados de OpenPI sobre JAX/Orbax.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modos de razonamiento explicito.
- Capacidad multilingue: solo ingles segun los metadatos; no hay evidencia de otras lenguas.

## Casos de uso

- Investigacion en manipulacion de tejidos: usar el checkpoint como linea base reproducible para experimentos de doblado de tela, comparando variantes de ajuste LoRA frente a fine-tuning completo con la misma semilla y presupuesto.
- Reproduccion de experimentos OpenPI: cargar el paso 2724 con la configuracion `pi05_fold_cloth_real_lora` para verificar resultados de entrenamiento y analizar la evolucion de la politica.
- Ajuste posterior sobre dominios cercanos: partir de estos adaptadores LoRA y reentrenar sobre telas, tamanos o mesas distintas, aprovechando que el backbone permanece congelado.
- Evaluacion de robustez visual: medir el comportamiento de la politica ante cambios de iluminacion o de posicion de las camaras `cam_high`, `cam_wrist_left` y `cam_wrist_right` en entornos simulados o reales de laboratorio.
- Docencia y formacion en robotica: emplear el checkpoint como ejemplo practico de pipeline completo OpenPI, desde la normalizacion de observaciones hasta la generacion de acciones delta.
- Pruebas de integracion de infraestructura: validar el despliegue de checkpoints Orbax en stacks JAX dentro de laboratorios que ya operan OpenPI, sin depender de ecosistemas Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion de la politica aun no se han reportado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio de 6,3 GB da una cota inferior orientativa del espacio en disco necesario, pero el consumo en memoria depende del backbone pi05 y de la implementacion JAX.
- GPU recomendadas: no disponibles en la informacion proporcionada; al ejecutarse sobre JAX, se requiere una GPU compatible con el stack correspondiente (CUDA/ROCm segun la build de JAX).
- Ajuste en GPU de consumo: no confirmado; el entrenamiento se realizo con lote 128 y 7,5 epocas, lo que sugiere recursos de datacenter, pero no se detalla el hardware.
- Opciones de despliegue: codigo y configuracion personalizados de OpenPI sobre JAX/Orbax; no es compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje en formato Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| pi05-fold-cloth-lora-100pct | no disponible | no disponible | Doblado de mantel (ALOHA) | no disponible | Orbax (JAX) |
| pi05 base (OpenPI) | no disponible | no disponible | Politica VLA generalista | no disponible en la informacion | Orbax (JAX) |
| Otras variantes OpenPI de la misma ejecucion (full fine-tuning) | no disponible | no disponible | Doblado de mantel | no disponible | Orbax (JAX) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- No se ha especificado licencia; el uso comercial queda sin autorizacion explicita hasta que el autor la defina.
- Ausencia total de resultados de evaluacion publicados: no hay evidencia cuantitativa de exito en la tarea.
- El checkpoint esta especializado en una unica instruccion y tarea; no generaliza a otras ordenes sin reentrenamiento.
- Requiere el codigo y la configuracion personalizados de OpenPI; no se carga con `from_pretrained` de Transformers.
- Solo se distribuye el paso 2724; no hay garantia de que sea el mejor checkpoint de la ejecucion.
- Excluye el estado del optimizador, por lo que no permite reanudar el entrenamiento tal cual.
- Idiomas: unicamente ingles en las instrucciones.
- Riesgo de sobreajuste al conjunto de episodios y al entorno fisico de captura (posiciones de camara, mesa e iluminacion concretas).
- No hay informacion sobre sesgos, alucinacion en el sentido linguistico ni comportamiento fuera de distribucion; en roboticos, el fallo tipico es la ejecucion de acciones incorrectas ante escenas no vistas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zachttang/pi05-fold-cloth-lora-100pct
- OpenPI (repositorio del proyecto base): no disponible en la informacion proporcionada
- Checkpoint base referenciado: `gs://openpi-assets/checkpoints/pi05_base/params` (ruta GCS, no enlace web)
- Paper de pi05: no disponible en la informacion proporcionada
- Demos o blogs: no disponibles en la informacion proporcionada
