# valueai-org/SLWM-X1B

## Resumen

SLWM-X1B es un checkpoint de investigación de un modelo del mundo (world model) multimodal de 1.008 millones de parámetros, desarrollado por Diogo Antunes en valuealigned.ai y keplen.ai, y publicado bajo la organización valueai-org en Hugging Face. Se trata de un artefacto de estudio asociado a un manuscrito no publicado (borrador v0.3), compartido para inspección y reproducibilidad, no como un lanzamiento formal de modelo. El modelo combina predicción latente condicionada por acciones, memoria matricial editable y enrutamiento explícito de compromisos, orientado a control encarnado (embodied control).

La arquitectura no es un transformer convencional: usa un runtime propio en JAX con formato de pesos NumPy NPZ, anchura latente de 1536, 23 capas y 24 slots por tick, entrenado sobre secuencias de 32 ticks. No es un modelo de chat ni un `AutoModel` de Transformers, por lo que no puede cargarse con las herramientas habituales del ecosistema Hugging Face.

Su relevancia es fundamentalmente investigadora: documenta resultados de planificación con MPC sintético, conmutación de objetivos y recuerdo asociativo a contextos largos (T = 1024), además de predicción de trayectorias offline sobre un xArm6. Al estar vinculado a un manuscrito no publicado y a una única semilla, debe tratarse como material de referencia reproducible y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World model latente en JAX con memoria matricial editable y enrutamiento de compromisos; anchura latente 1536, 23 capas, 24 slots por tick |
| Parámetros totales | 1.008.454.410 (estricto) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 ticks de secuencia de entrenamiento; evaluación de recuerdo asociativo hasta T = 1024 |
| Tipos de cuantización | BF16/FP32 mixto y INT8 simétrico por canal |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | NumPy NPZ (`weights_bf16.npz`, `portable_int8.npz`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se implementa sobre un runtime propio en JAX (referencia de código `cbb2b38` en el repositorio ValueAlignedAI/slwm) y se aleja del stack estándar de Transformers. La configuración registrada indica una anchura latente de 1536, 23 capas y 24 slots por tick, con predicción latente condicionada por acciones (estilo JEPA, módulo `models/x1b_jepa.py`), memoria matricial editable y un mecanismo de enrutamiento explícito de compromisos. El núcleo reside en `models/x1b_world.py`.

El entrenamiento se realizó durante 5.600 pasos con tamaño de lote de 12 secuencias y longitud de secuencia de 32 ticks, correspondiente a la ola experimental 5 y a la semilla 2001 (run `x1b-w5-slwm-1b-s2001`). La ola 5 emplea el ajuste original de observación y planificación con barrera central, incluyendo coordenadas de objetos en la propiocepción. No se detalla en la información disponible la composición del dataset, el número total de tokens ni si se aplicaron fases de RLHF o DPO. La semilla 2001 se ofrece como referencia fija, no seleccionada por ranking de resultados de test.

## Capacidades

- Predicción latente del mundo condicionada por acciones para planificación y control encarnado.
- Memoria matricial editable, con slots por tick que permiten almacenar y recuperar estado.
- Enrutamiento explícito de compromisos para decisiones de planificación.
- Planificación mediante MPC (model predictive control) sobre el espacio latente.
- Conmutación de objetivos a horizontes largos (evaluada a T = 76).
- Recuerdo asociativo a contexto extendido (evaluado a T = 1024).
- Predicción de trayectorias para un brazo robótico xArm6.
- Procesamiento multimodal con máscaras de modalidad gestionadas por el runtime.
- No soporta tool calling, function calling ni modo chat; no es un modelo de lenguaje generativo.

## Casos de uso

- Investigación en world models: reproducción de los experimentos del manuscrito v0.3 cargando el checkpoint con el loader incluido y el runtime JAX fijado, para verificar métricas y comportamiento latente.
- Planificación con MPC en entornos sintéticos: uso del modelo como predictor latente dentro de un bucle de control predictivo, aprovechando la condicionalidad por acciones y el enrutamiento de compromisos.
- Estudio de memoria de trabajo: análisis del comportamiento de los 24 slots por tick y de la memoria matricial editable en tareas de recuerdo asociativo hasta T = 1024.
- Predicción de trayectorias robóticas offline: evaluación de error de cuatro pasos sobre xArm6 en un único espacio de trabajo, útil para comparar arquitecturas bajo el mismo ajuste experimental.
- Benchmarking de arquitecturas alternativas: uso del checkpoint como referencia fija (semilla 2001) para comparar variantes dentro de la misma ola y ajuste de observación/entrenamiento.
- Auditoría de artefactos de investigación: verificación de integridad mediante SHA-256 y manifiestos, y validación de los recuentos estrictos de parámetros con `load_checkpoint.py`.
- Docencia y divulgación técnica: estudio de un pipeline no-Transformers en JAX con exportación NPZ, cuantización INT8 por canal y carga sin pickle.

## Benchmarks y rendimiento

Resultados registrados en `receipt.json` para la semilla 2001 (resultados de una sola semilla, no la media ± desviación del manuscrito):

| Métrica registrada | Semilla 2001 |
|---|---:|
| Éxito MPC sintético global | 75,0000 % |
| Éxito MPC con barrera de un píxel | 93,7500 % |
| Éxito de conmutación de objetivo T = 76 | 100,0000 % |
| Recuerdo asociativo T = 1.024 | 100,0000 % |
| Error de cuatro pasos xArm6 (un espacio de trabajo) | 7,3368 mm |

No se han publicado en la información disponible resultados comparativos frente a MMLU, HumanEval, GSM8K u otros benchmarks estándar de lenguaje, dado que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: el archivo BF16 ocupa 1.602.108.632 bytes (~1,6 GB) y el INT8 918.039.628 bytes (~0,9 GB), pero el loader expande los pesos a float32, por lo que el requisito real en memoria es mayor que el tamaño del archivo. El tamaño INT8 no equivale al requisito de memoria en ejecución y el loader no realiza cómputo INT8.
- GPU recomendadas: no disponible en la información proporcionada; el runtime es JAX y admite ejecución en CPU para las comprobaciones de integridad.
- GPU de consumo: no disponible; no se documenta compatibilidad con RTX 4090 u otras tarjetas consumer.
- Despliegue: runtime propio en JAX desde el repositorio fijado (`models/x1b_world.py`, `models/x1b_jepa.py`, `scripts/eval/x1b_infer.py`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (world models con memoria de trabajo y control encarnado) ni datos de comparación con alternativas.

## Limitaciones y advertencias

- Es un checkpoint de investigación asociado a un manuscrito no publicado (borrador v0.3); no es un lanzamiento formal de modelo.
- No es un modelo de lenguaje ni un modelo fundacional de robótica de propósito general.
- Los resultados de control de la ola 5 incluyen entradas privilegiadas de estado de objetos y un prior de planificación con barrera central.
- Las mediciones sobre robot físico son predicciones de trayectoria offline, no despliegue real en robot.
- Los resultados son de una sola semilla (2001), no la media del cohorte de tres semillas del manuscrito.
- El archivo INT8 no reduce el requisito de memoria en ejecución con el loader incluido, que expande a float32 y no ejecuta cómputo INT8.
- El estado de streaming acotado del paper es distinto de los pesos, activaciones y buffers de planificación del modelo.
- Solo soporta inglés en los metadatos; no hay evaluación multilingüe.
- Riesgo de alucinación y sesgos: no documentado en la información disponible, aunque al ser un world model latente el riesgo relevante es de error de predicción, no de generación de texto.
- Licencia MIT: permite uso comercial, pero la naturaleza de artefacto de estudio y la falta de evaluación independiente desaconsejan su uso en producción.
- Las pruebas de escena disjunta y espacial sin privilegios pertenecen a otros modelos de la línea y no a este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/valueai-org/SLWM-X1B
- Runtime y código fuente fijado: https://github.com/ValueAlignedAI/slwm/tree/cbb2b38794359adfefe07b19e9b7caa113b25b47
- valuealigned.ai: https://valuealigned.ai
- keplen.ai: https://keplen.ai
