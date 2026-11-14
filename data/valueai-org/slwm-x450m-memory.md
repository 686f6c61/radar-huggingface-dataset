# valueai-org/SLWM-X450M-Memory

## Resumen

SLWM-X450M-Memory es un checkpoint de investigación de un modelo de mundo multimodal (world model) desarrollado por Diogo Antunes en el marco de los proyectos valuealigned.ai y keplen.ai, y publicado bajo la organización valueai-org en Hugging Face. No se trata de un modelo de lenguaje conversacional ni de un `AutoModel` de Transformers, sino de un artefacto de estudio que acompaña a un manuscrito no publicado (borrador v0.3) sobre modelos de mundo con memoria de trabajo para control encarnado (embodied control). El modelo tiene 453.199.938 parámetros estrictos, una anchura latente de 1152, 18 capas y 24 slots por tick, y se ejecuta sobre un runtime propio en JAX con pesos en formato NumPy NPZ.

El checkpoint corresponde a la ola experimental 6 (Wave 6) del archivo de investigación SLWM, con semilla de entrenamiento 2001, y se centra en la memoria de sobrescritura visual dinámica de alta cardinalidad y en el cuello de botella espacial de pooling global. Incluye propriocepción únicamente del efector final y preserva el blindaje de claves (key shielding), el bypass sensorial y cabezas de lectura desacopladas. La ventana de entrenamiento es de 32 ticks y el modelo se entrenó durante 2600 pasos con un tamaño de lote de 12 secuencias.

Su relevancia es fundamentalmente investigadora: sirve como referencia reproducible para estudiar arquitecturas de memoria en modelos de mundo y para comparar resultados dentro de la misma ola experimental. No debe confundirse con un modelo listo para producción ni con la versión posterior SLWM-v2 con planificador de rejilla espacial. El repositorio ocupa 1,1 GB e incluye dos exportaciones de pesos (BF16/FP32 mixta y INT8 simétrica por canal), junto con artefactos de configuración, métricas y validación de integridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo multimodal con memoria de trabajo (world model), runtime propio en JAX; anchura latente 1152, 18 capas, 24 slots por tick |
| Parametros totales | 453.199.938 (estrictos) |
| Parametros activos | no disponible (no es un MoE según la información proporcionada) |
| Longitud de contexto | 32 ticks de secuencia de entrenamiento (no es una ventana de tokens de texto) |
| Tipos de cuantizacion | BF16/FP32 mixta (`weights_bf16.npz`) e INT8 simétrica por canal (`portable_int8.npz`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | NumPy NPZ (formato propio), no safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un modelo de mundo multimodal con estado de memoria de trabajo, implementado sobre un runtime propio en JAX (referencia de código fijada en el commit `cbb2b38` del repositorio ValueAlignedAI/slwm). El modelo procesa secuencias de 32 ticks con una anchura latente de 1152, 18 capas y 24 slots por tick, e incorpora componentes específicos como el blindaje de claves, el bypass sensorial y cabezas de lectura desacopladas. La variante Wave 6 utiliza propriocepción únicamente del efector final y un cuello de botella espacial basado en pooling global, lo que la hace útil como referencia para estudiar memoria de sobrescritura visual dinámica de alta cardinalidad.

El entrenamiento se realizó durante 2600 pasos con un tamaño de lote de 12 secuencias y longitud de secuencia de 32 ticks, con semilla 2001. El checkpoint se describe como el modelo completo de 453M parámetros con Epps-Pulley SIGReg del estudio de ablación de factor único. La model card indica que el manuscrito no publicado reporta cohortes de tres semillas, pero este repositorio contiene un único checkpoint con sus propias métricas registradas; la semilla 2001 se ofrece como referencia fija y no fue seleccionada por ranking de resultados. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Modelado de mundo multimodal con memoria de trabajo: mantiene y actualiza estado latente a lo largo de secuencias de 32 ticks.
- Memoria de sobrescritura visual dinámica de alta cardinalidad: la métrica registrada de recall a T = 1024 es del 100,0000 % en la semilla 2001.
- Control encarnado (embodied control): incluye planificación con MPPI y evaluación sobre el manipulador xArm6 en trayectorias grabadas offline.
- Propriocepción del efector final: la variante Wave 6 incorpora únicamente esta modalidad de propriocepción.
- Componentes de intervención configurables (`Wave6Interventions`) y función de avance `forward_world_model_wave6`.
- No es un modelo de chat ni soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM; la información disponible no indica tales capacidades.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés y su naturaleza no es lingüística general.

## Casos de uso

- Reproducción de experimentos de memoria en modelos de mundo: cargar el checkpoint con `load_checkpoint.py` y ejecutar los puntos de entrada de `evals/x1b_eval_wave6.py` para replicar las métricas registradas de la semilla 2001.
- Estudio de mecanismos de memoria de trabajo: analizar el comportamiento de los 24 slots por tick y el blindaje de claves en tareas de sobrescritura visual dinámica, usando el recall a T = 1024 como referencia.
- Investigación en control encarnado: evaluar la planificación MPPI sobre el manipulador xArm6 con trayectorias grabadas offline y comparar el error de cuatro pasos (33,2159 mm) frente a otras arquitecturas de la misma ola.
- Análisis de cuellos de botella espaciales: utilizar el pooling global de la Wave 6 como línea base para estudiar la refinación espacial introducida en la Wave 7 y en SLWM-v2.
- Auditoría de robustez ante corrupción de cámara: emplear la AUROC registrada (50,3200 %) como referencia de detección de fallos visuales no privilegiados en estudios comparativos.
- Validación de pipelines de exportación y cuantización: comprobar la integridad de los ficheros BF16 e INT8 mediante los SHA-256 y el manifiesto incluidos, y verificar el recuento estricto de parámetros con el loader proporcionado.
- Docencia y formación en investigación: usar el checkpoint como ejemplo práctico de artefacto de estudio con formato propio, runtime JAX y métricas registradas por ejecución.

## Benchmarks y rendimiento

Los valores proceden directamente del `receipt.json` de esta ejecución y son resultados de una sola semilla, no la media ± desviación estándar de la cohorte del manuscrito.

| Metrica registrada | Semilla 2001 |
|---|---:|
| Recall de sobrescritura visual dinámica a T = 1024 | 100,0000 % |
| Éxito MPPI en disposición no vista | 1,5625 % |
| AUROC ante corrupción de cámara no vista | 50,3200 % |
| Error de cuatro pasos en xArm6 con escena retenida | 33,2159 mm |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no procede compararlos con modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el loader proporcionado expande los pesos a float32 y no realiza cómputo INT8, por lo que el tamaño del fichero INT8 (415.554.792 bytes) no representa el requisito de memoria en tiempo de ejecución.
- El fichero BF16 ocupa 719.568.210 bytes; el INT8, 415.554.792 bytes; el repositorio completo, 1,1 GB.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el runtime es JAX y no se documentan requisitos de acelerador.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI; el despliegue requiere JAX y los módulos del código fuente fijado (`models/x1b_wave6_core.py`, `evals/x1b_eval_wave6.py`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SLWM-X450M-Memory (Wave 6) | 453.199.938 | 32 ticks | Modelo de mundo con memoria de trabajo, JAX | MIT | Checkpoint de estudio en Hugging Face |
| SLWM-v2 (Wave 7) | no disponible | no disponible | Modelo de mundo con planificador de rejilla espacial | no disponible | Referenciado en la model card, no incluido en este repositorio |
| Otras arquitecturas de la misma ola (comparación interna) | no disponible | no disponible | Variantes del estudio de ablación | no disponible | No disponibles en este repositorio |

No se dispone de datos suficientes para comparar con modelos de la misma categoría fuera del archivo SLWM; la comparación válida según el autor es dentro de la misma ola y con la misma configuración de observación y entrenamiento.

## Limitaciones y advertencias

- Artefacto de estudio de un manuscrito no publicado: no es una release formal de modelo y no debe tratarse como tal.
- Resultados de una sola semilla (2001), no seleccionada por ranking; no representan la media de la cohorte de tres semillas del manuscrito.
- El recall asociativo fuerte convive con una planificación visual no privilegiada débil (éxito MPPI del 1,5625 %) y una detección de fallos de cámara no vistos cercana al azar (AUROC del 50,3200 %).
- No debe sustituir a SLWM-v2 al evaluar el planificador de rejilla espacial posterior.
- Los resultados físicos de xArm6 son evaluaciones offline sobre trayectorias grabadas, no ejecuciones en robot real.
- El loader incluido expande los pesos a float32 y no realiza cómputo INT8; el tamaño del fichero INT8 no equivale al requisito de memoria en ejecución.
- No es un checkpoint de Transformers ni un modelo de chat; no soporta `AutoModel` ni tool calling.
- El repositorio no contiene grabaciones de entrenamiento en bruto, datasets, estado del optimizador ni configuración de acceso a servidores privados.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero el estado de investigación y las métricas débiles en planificación desaconsejan su uso en producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; el modelo no es generativo de texto, por lo que estos riesgos deben interpretarse en el contexto del modelado de mundo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/valueai-org/SLWM-X450M-Memory
- Código fuente fijado (commit `cbb2b38`): https://github.com/ValueAlignedAI/slwm/tree/cbb2b38794359adfefe07b19e9b7caa113b25b47
- valuealigned.ai: https://valuealigned.ai
- keplen.ai: https://keplen.ai
