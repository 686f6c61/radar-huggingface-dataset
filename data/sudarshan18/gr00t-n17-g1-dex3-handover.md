# Sudarshan18/gr00t-n17-g1-dex3-handover

## Resumen

`Sudarshan18/gr00t-n17-g1-dex3-handover` es un ajuste fino del modelo visión-lenguaje-acción (VLA) `nvidia/GR00T-N1.7-3B` para una tarea concreta de manipulación bimanual: un robot Unitree G1_29DoF de base fija con manos Unitree Dex3 recoge una varilla vertical con la mano derecha, la transfiere a la mano izquierda sin teletransporte, la suelta y la mano izquierda la deposita sobre un objetivo. El repositorio contiene 3.144.016.000 parámetros en safetensors (12,6 GB) y es el checkpoint de la etapa A de un estudio de transferencia entre manos.

Su relevancia es doble. Primero, es una política de referencia reproducible para la transferencia bimanual sobre las manos originales del G1, con una configuración de modalidad y un servidor de inferencia publicados junto al modelo. Segundo, documenta un flujo completo de ajuste fino de GR00T N1.7 con datos sintéticos generados en Isaac Lab, lo que permite replicar la receta con otras morfologías.

El compañero para manos Brainco Revo2 es `Sudarshan18/gr00t-n17-g1-brainco-handover`. Todo el trabajo es de simulación: no se ejecutó nada en hardware físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en el backbone visión-lenguaje Eagle con cabezal de acción de flow matching; incluye proyector backbone-cabeza y encoders de estado y acción del slot de encarnación |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la política recibe una frase de tarea fija; no se documenta soporte multilingüe) |
| Licencia | NVIDIA Open Model License (`license: other`) |
| Formato de pesos | safetensors (incluye pesos, procesador, configuración de experimento, estadísticas del dataset y `PROVENANCE.json`; no incluye estado del optimizador) |
| Modelo base | `nvidia/GR00T-N1.7-3B` (revisión `2fc962b973bccdd5d8ce4f67cc63b264d6886495`) |
| Robot / encarnación | Unitree G1_29DoF, base fija, manos Dex3; slot de encarnación `NEW_EMBODIMENT` |
| Observaciones | cámara de cabeza y cámara frontal, ambas RGB 224x224, posiciones articulares y una frase de tarea fija |
| Acciones | 16 pasos de objetivos articulares absolutos: 14 articulaciones de brazo y 14 de mano Dex3 |
| Frecuencia de control | 20 Hz (física a 120 Hz en Isaac Lab) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura VLA del GR00T N1.7: un backbone visión-lenguaje de tipo Eagle que procesa las dos vistas de cámara junto con la instrucción de tarea, un proyector que conecta ese backbone con la cabeza de acción, y un cabezal de flow matching que genera secuencias de acciones. El espacio de acción se define mediante un slot de encarnación (`NEW_EMBODIMENT`) con encoders de estado y de acción propios, configurados en `scripts/dex3_handover_config.py`.

El ajuste fino se hizo con Isaac-GR00T (commit `51d4c89f72fda44cbf77285c6a8114b52676b8a1`) partiendo de `nvidia/GR00T-N1.7-3B`. Se entrenaron el proyector backbone-cabeza y el cabezal de acción de flow matching, incluidos los encoders de estado y acción del slot de encarnación, mientras que el backbone visión-lenguaje Eagle permaneció congelado. Los datos son 98 demostraciones guionizadas grabadas en Isaac Lab, 66.745 fotogramas a 20 Hz. La configuración de entrenamiento fue de 16.000 pasos, batch 16, tasa de aprendizaje 1e-4 y *state dropout* de 0,05, sobre una única NVIDIA A40 durante 3 horas y 29 minutos.

## Capacidades

- Generación de acciones de manipulación bimanual: produce 16 pasos de objetivos articulares absolutos (14 de brazo y 14 de mano Dex3) por inferencia.
- Transferencia de objeto entre manos: la secuencia completa incluye agarre, traslado, suelta y colocación final por parte de la mano izquierda.
- Percepción visual multimodal: consume dos cámaras RGB de 224x224 (cabeza y frontal) además del estado articular.
- Condicionamiento por instrucción: acepta una frase de tarea fija como entrada de lenguaje.
- Ejecución en bucle cerrado a 20 Hz en simulación, con física a 120 Hz en Isaac Lab.
- Integración con un servidor de políticas (`scripts/policy_server.py`) y un cliente de evaluación en Isaac Lab.
- No se documentan *tool calling*, uso de agentes, razonamiento multi-paso, capacidades de audio ni modo de pensamiento.

## Casos de uso

- Investigación en transferencia bimanual: replicar el experimento de etapa A sobre manos Dex3 y compararlo con el modelo compañero de manos Brainco Revo2 para aislar el efecto de la morfología de la mano.
- Punto de partida para *fine-tuning* en nuevas tareas de manipulación: la receta completa (98 demostraciones, 16.000 pasos, backbone congelado) es reutilizable con otros objetos y morfologías cambiando la configuración de modalidad.
- Generación de datos sintéticos y evaluación automática: el script `scripts/evaluate_stage.sh` permite lanzar tandas de diez ensayos por configuración con ruido de 2 cm en la posición inicial del objeto.
- Estudio del fallo de agarre: dado que el modo de fallo dominante es la colocación de la mano a 1-3 cm cuando el hueco Dex3 exige en torno a 1 cm, sirve como caso de análisis para políticas de precisión subcentimétrica.
- *Benchmark* interno de políticas VLA: sirve como referencia de éxito en una tarea larga y encadenada (agarre, transferencia, suelta y colocación) frente a variantes propias.
- Pruebas de robustez ante cambios de objeto y de pose inicial: el modelo tiene configuraciones explícitas para objeto retenido (varilla redonda) y pose inicial retenida.
- Docencia y divulgación en robótica: el flujo Isaac Lab + servidor de políticas es un ejemplo completo y reproducible de despliegue de un VLA en simulación sin necesidad de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí incluye una evaluación propia de la tarea, con cinco configuraciones, diez ensayos por configuración y 2 cm de ruido en la posición inicial del objeto. Un ensayo solo cuenta como éxito si el objeto se levanta, se transfiere, se suelta y queda reposando en el objetivo por sí solo, con ambas manos libres.

| Configuracion | Exito en la tarea |
|---|---|
| Varilla cuadrada 3,0 x 24 cm | 0/10 |
| Varilla cuadrada 3,0 x 22 cm | 5/10 |
| Varilla cuadrada 3,5 x 24 cm | 1/10 |
| Objeto retenido, varilla redonda 3,0 x 24 cm | 1/10 |
| Pose inicial retenida | 1/10 |
| **Total** | **8/50 (16 %)** |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 6,3 GB solo para pesos en FP16/BF16 (3,144 mil millones de parámetros), más activaciones de dos cámaras de 224x224; un presupuesto práctico de 8-12 GB es razonable. El repositorio ocupa 12,6 GB, coherente con pesos en FP32 junto con procesador, estadísticas y metadatos (no incluye estado del optimizador).
- GPU recomendadas por el autor: entrenamiento validado en una única NVIDIA A40 (48 GB). Para inferencia, cualquier GPU con al menos 12 GB es suficiente en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB) y tarjetas similares con 12 GB o más en BF16.
- Opciones de despliegue: servidor de políticas incluido (`python scripts/policy_server.py --model-path <checkpoint> --modality-config-path scripts/dex3_handover_config.py --embodiment-tag NEW_EMBODIMENT --port 5601`) más el cliente de evaluación de Isaac Lab (`bash scripts/evaluate_stage.sh A dex3 none 5601 10`). No aplican vLLM, llama.cpp, Ollama ni TGI: es una política robótica, no un modelo de lenguaje servible por esos *runtimes*. La simulación requiere Isaac Lab, con física a 120 Hz.
- Latencia y throughput: el modelo se ejecuta a 20 Hz en el bucle de control y emite 16 pasos de acción por inferencia, lo que supone 0,8 s de ejecución por *chunk*; la inferencia debe completarse dentro de ese presupuesto. No se publican cifras de latencia ni de throughput medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Sudarshan18/gr00t-n17-g1-dex3-handover` (este modelo) | 3.144.016.000 | no disponible | 8/50 (16 %) en la evaluación publicada | NVIDIA Open Model License | HuggingFace, 0 descargas y 0 *likes* en el momento de la consulta |
| `nvidia/GR00T-N1.7-3B` (modelo base) | 3B según la denominación del modelo base | no disponible | no disponible | NVIDIA Open Model License | HuggingFace |
| `Sudarshan18/gr00t-n17-g1-brainco-handover` (modelo compañero, manos Brainco Revo2) | no disponible | no disponible | no disponible | no disponible en la información proporcionada | HuggingFace |

No se dispone de datos de otros modelos VLA comparables (parámetros, contexto, rendimiento o licencia) en la información proporcionada.

## Limitaciones y advertencias

- Trabajo exclusivamente de simulación: no se ejecutó nada en hardware físico, por lo que el comportamiento en un G1 real no está validado y la transferencia *sim-to-real* no está cuantificada.
- Rendimiento bajo en la evaluación publicada: 8 aciertos de 50 ensayos (16 %). Cuatro de las cinco configuraciones quedan en 0/10 o 1/10.
- Modo de fallo dominante: el agarre. La política coloca la mano a 1-3 cm del punto correcto, mientras que el hueco de la mano Dex3 requiere en torno a 1 cm.
- Sensibilidad al tamaño del objeto: la única configuración con éxito parcial (5/10) es la varilla cuadrada de 3,0 x 22 cm; con 24 cm de longitud el éxito cae a 0/10.
- Vocabulario de tareas muy restringido: el condicionamiento de lenguaje se limita a una frase de tarea fija; no hay evidencia de generalización a instrucciones nuevas ni de capacidades multilingües.
- Sesgos conocidos: no se documentan análisis de sesgo. El modelo se entrena con 98 demostraciones guionizadas, por lo que hereda las limitaciones de esa distribución estrecha.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre, pero sí existe riesgo de acciones incoherentes en estados fuera de distribución, dado que el backbone está congelado y solo se ajustaron proyector y cabezal.
- Restricciones de licencia: el modelo se distribuye bajo la NVIDIA Open Model License y deriva del GR00T N1.7-3B. Los términos concretos, incluido el uso comercial, deben consultarse en el texto de la licencia enlazado más abajo; la model card no los detalla. El código de Isaac-GR00T es Apache-2.0 y la descripción del robot proviene de `unitreerobotics/unitree_ros` (BSD-3-Clause).
- Producción: el repositorio no incluye estado del optimizador, no hay cuantizaciones publicadas y el modelo tiene 0 descargas, por lo que carece de validación por parte de terceros.
- Se requiere una configuración de modalidad específica (`scripts/dex3_handover_config.py`) y el *tag* de encarnación `NEW_EMBODIMENT` para que el checkpoint funcione; sin ellos la política no es utilizable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sudarshan18/gr00t-n17-g1-dex3-handover
- Modelo compañero (manos Brainco Revo2): https://huggingface.co/Sudarshan18/gr00t-n17-g1-brainco-handover
- Código, evaluación y documentación: https://github.com/sudarshan-sridhar/g1-dex3-to-brainco-handover
- Modelo base: `nvidia/GR00T-N1.7-3B`, revisión `2fc962b973bccdd5d8ce4f67cc63b264d6886495`
- Isaac-GR00T referenciado en la model card, commit `51d4c89f72fda44cbf77285c6a8114b52676b8a1`: https://github.com/NVIDIA/Isaac-GR00T
- Descripción del robot `unitreerobotics/unitree_ros` (BSD-3-Clause), referenciada en la model card: https://github.com/unitreerobotics/unitree_ros
- Licencia NVIDIA Open Model License: https://developer.nvidia.com/downloads/assets/cuda/files/nvidia-open-model-license.pdf
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a contenidos no relacionados con robótica ni con GR00T).
