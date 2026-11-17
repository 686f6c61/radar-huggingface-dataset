# wdwz2000/realrobot-bowl-stacking-recap-59678420

## Resumen

`realrobot-bowl-stacking-recap-59678420` es un paquete de pesos para robótica de manipulación publicado por el usuario `wdwz2000` en Hugging Face. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de artefactos de entrenamiento para una política de control robótico que resuelve una tarea concreta de apilamiento de cuencos en un robot real: colocar un cuenco amarillo sobre un cuenco rojo. El paquete incluye el Actor final (la política de control), dos redes Value independientes usadas para estimación de valor y anotación, y los recursos de inicialización (una política de demostración B3, SigLIP2-SO400M y Gemma3-270M).

La arquitectura subyacente es π0.5, una política visión-lenguaje-acción con condicionamiento CFG (classifier-free guidance) sobre etiquetas positive/negative. El Actor se inicializa desde una política de demostración previa (B3) y se entrena durante 4800 pasos congelando el backbone visión-lenguaje y actualizando únicamente el experto de acción. Las redes Value usan una rama visual SigLIP2-SO400M-patch14-224 y una rama lingüística Gemma3-270M, con una cabeza de valor de 201 bins.

La relevancia de este paquete es acotada: es un artefacto de investigación reproducible para una tarea específica de robot real, con trazabilidad de pesos (SHA256, provenance.json) y utilidades de verificación. No es un modelo generalista ni está pensado para reutilización fuera de su pipeline. El tamaño del repositorio (24,76 GB) se debe a la inclusión de pesos de inicialización completos, no a un modelo de gran número de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | π0.5 (política visión-lenguaje-acción con condicionamiento CFG); Value con ramas SigLIP2 + Gemma3-270M |
| Parámetros totales | no disponible (el tamaño de los ficheros incluye serialización y no equivale al número de parámetros; Actor: 8,53 GB en disco, Value: 1,80 GB por fold) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en `.pt` de PyTorch, sin versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | zh (chino; el prompt de entrenamiento original es «把黄碗放在红碗上») |
| Licencia | other (`upstream-and-project-terms`, ver `LICENSES.md`) |
| Formato de pesos | PyTorch `.pt`; recursos de inicialización en `.safetensors` |

## Arquitectura y entrenamiento

El Actor es una política π0.5 con condicionamiento CFG que genera acciones a partir de observaciones y de una instrucción textual. Se inicializa desde una política de demostración B3 (`b3dc7f29`) y se entrena durante 4800 pasos de optimización con 8 GPUs, micro-batch de 1 y batch global de 8, learning rate de 2,5e-6 y 200 pasos de warmup. En esta configuración se activa `train_expert_only=true`, lo que congela el backbone visión-lenguaje y actualiza únicamente el experto de acción; el horizonte de acción es de 10 pasos y la frecuencia de grabación de origen es de 15 Hz.

El pipeline de entrenamiento es en dos fases. Primero se entrenan dos redes Value independientes (una por fold, 1500 pasos cada una) que predicen el valor de estado usando SigLIP2-SO400M-patch14-224 como rama visual, Gemma3-270M como rama lingüística y una cabeza de 201 bins. Después se calculan ventajas y, aplicando reglas de revisión, se generan anotaciones positive/negative que condicionan el entrenamiento del Actor. No existe una red binaria separada que clasifique acciones como positivas o negativas: la etiqueta se deriva del valor estimado y de las reglas de anotación. Los datos provienen del snapshot `ds-20261029-credit-repair-80-ad6e76`, cuya huella exacta figura en `provenance.json`.

## Capacidades

- Control robótico de manipulación para la tarea de apilar un cuenco amarillo sobre uno rojo en un robot real.
- Generación de acciones condicionada por instrucción textual en chino y por observaciones visuales.
- Condicionamiento CFG positive/negative aprendido a partir de ventajas estimadas por las redes Value.
- Estimación de valor de estado mediante dos redes Value independientes (fold 0 y fold 1) para análisis y reproducción de anotaciones.
- Reproducción del pipeline de entrenamiento desde la inicialización B3 y los recursos SigLIP2/Gemma3 incluidos.
- Verificación de integridad de la descarga mediante `verify_files.py` y los manifiestos SHA256.
- No soporta tool calling, function calling, agentes multi-paso, generación de texto libre ni otras capacidades de propósito general.

## Casos de uso

- Reproducción de experimentos de robótica: cargar `weights/actor_59678420.pt` con el código de carga del proyecto para ejecutar la política entrenada sobre el robot o en simulación y comparar con la línea base B3.
- Análisis de estimación de valor: usar `value_fold_0.pt` y `value_fold_1.pt` junto con `config/value_models.json` para recalcular valores de estado y reproducir las anotaciones positive/negative del entrenamiento.
- Reentrenamiento desde el mismo punto de partida: partir de `initialization/actor_b3.pt` para repetir el entrenamiento RECAP con idénticas condiciones y contrastar resultados con el Actor final.
- Auditoría de integridad de artefactos: ejecutar `verify_files.py` sobre el directorio descargado para comprobar que los 24,76 GB del paquete coinciden con los SHA256 de `MANIFEST.json` y `SHA256SUMS`.
- Estudio de condicionamiento CFG en políticas robóticas: inspeccionar cómo el etiquetado derivado de ventajas afecta a la política final comparando la versión `59678420` con la variante «solo segmentos H humanos positivos» `91659917`, que no está incluida en este repositorio.
- Reutilización de componentes de inicialización: emplear `initialization/siglip2-so400m-patch14-224/` y `initialization/gemma-3-270m/` como recursos de inicialización para otras redes Value en proyectos con licencias compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de la tarea, tasas de acierto, comparaciones numéricas con B3 ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia del Actor: no disponible de forma explícita; el fichero `actor_59678420.pt` ocupa 8,53 GB en disco y, al tratarse de una política π0.5 con backbone visión-lenguaje congelado, la carga en memoria puede requerir del orden de decenas de GB según el runtime, pero no se proporciona una cifra oficial.
- VRAM estimada para cada red Value: no disponible; cada `value_fold_*.pt` ocupa 1,80 GB en disco.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 8 GPUs (`device_count=8`), pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos publicados sobre ejecución en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el paquete está en formato PyTorch `.pt` y requiere el código de carga del proyecto original; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La frecuencia de grabación de origen es de 15 Hz y el horizonte de acción es de 10 pasos, pero no se publican latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `realrobot-bowl-stacking-recap-59678420` | Política robótica π0.5 + Value | no disponible | no disponible | other (upstream-and-project-terms) | Hugging Face, 0 descargas |
| Política B3 (`b3dc7f29`) | Política de demostración, inicialización del Actor | no disponible | no disponible | no disponible | Incluida en `initialization/actor_b3.pt` |
| Variante `91659917` | Política RECAP con solo segmentos H humanos positivos | no disponible | no disponible | no disponible | No incluida en este repositorio |

No se dispone de información sobre otros modelos comparables de la misma categoría (políticas robóticas para apilamiento de objetos) en la documentación proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: la política está entrenada para una única tarea (apilar un cuenco amarillo sobre uno rojo) y no generaliza a otras tareas de manipulación sin reentrenamiento.
- Idioma: la instrucción de entrenamiento está en chino; no hay evidencia de soporte multilingüe.
- Licencia restrictiva: `license: other` con términos `upstream-and-project-terms`; es imprescindible revisar `LICENSES.md` antes de cualquier uso, especialmente comercial, y respetar las licencias de SigLIP2 y Gemma3 incluidas.
- Sin benchmarks publicados: no hay métricas de éxito, robustez ni comparaciones cuantitativas con B3, por lo que no se puede evaluar su rendimiento real a partir de la documentación.
- Riesgo de sobreajuste y alucinación de acciones: al tratarse de una política entrenada sobre un snapshot de datos concreto, puede producir acciones no válidas fuera de la distribución de estados observados.
- Dependencia del código del proyecto: los `.pt` no son autónomos; requieren el cargador compatible y los recursos de `assets/` (normalización y tokenizador) en sus versiones exactas.
- No incluye estado completo de entrenamiento: no se empaquetan optimizador, scheduler ni estado de números aleatorios, por lo que no se puede reanudar un entrenamiento de forma exacta, solo reiniciar desde los pesos.
- Los dos folds de Value no son intercambiables: deben usarse según las reglas originales de agrupación y retención; elegir un fold arbitrariamente invalida la reproducción de anotaciones.
- Los datos originales de entrenamiento y la partición de folds no están incluidos, lo que impide reproducir por completo el pipeline de anotación solo con este paquete.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420
- Licencias del paquete: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/LICENSES.md
- Pesos del Actor: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/weights/actor_59678420.pt
- Red Value fold 0: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/weights/value_fold_0.pt
- Red Value fold 1: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/weights/value_fold_1.pt
- Configuración de entrenamiento del Actor: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/config/actor_training.json
- Configuración de las redes Value: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/config/value_models.json
- Estadísticas de normalización: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/assets/norm_stats.json
- Tokenizador de la política: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/assets/paligemma_tokenizer.model
- Script de verificación: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/verify_files.py
- Manifiesto de ficheros: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/MANIFEST.json
- Trazabilidad del modelo: https://huggingface.co/wdwz2000/realrobot-bowl-stacking-recap-59678420/blob/main/provenance.json
