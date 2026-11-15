# xzz789/smolvla-piperx-dune-298890

## Resumen

SmolVLA PiperX DUNE K=4096 (job 298890) es un conjunto de checkpoints de inferencia de un modelo de vision-lenguaje-accion (VLA) de tipo SmolVLA, desarrollado por el usuario xzz789 y publicado en Hugging Face bajo el ecosistema LeRobot. El modelo está especializado en una tarea robótica concreta de manipulación bimanual: mover una caja de izquierda a derecha con un robot PiperX. No se trata de un modelo de propósito general, sino de un artefacto de investigación derivado de un entrenamiento con el método DUNE sobre un dataset de 99 episodios.

La relevancia del artefacto es acotada y de carácter experimental: los pesos se subieron mientras el entrenamiento aún estaba en curso, con checkpoints en los pasos 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000 y 10000 de un total previsto de 24 000 actualizaciones. El autor indica explícitamente que no se ha ejecutado evaluación en bucle abierto (open-loop) sobre estos checkpoints, por lo que no existe evidencia publicada de su rendimiento real en la tarea.

El repositorio ocupa 19,8 GB e incluye únicamente pesos de inferencia (model.safetensors, config.json y ficheros de normalización pre/post-procesado), sin el optimizador ni el estado de entrenamiento DUNE (dust.pt). La información disponible sobre arquitectura interna, licencia, idiomas y benchmarks es muy limitada; los apartados correspondientes se completan con "no disponible" cuando el dato no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion) sobre LeRobot; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors) + config.json + ficheros de normalizador |
| Libreria | lerobot |
| Tamano del repositorio | 19,8 GB |
| Checkpoints incluidos | pasos 0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000 |
| Entrenamiento previsto | 24 000 actualizaciones (cosine schedule) |
| Dataset de entrenamiento | piperx-bimanual-move-box-left-to-right-100-clean (99 episodios, 90 994 frames, 3 camaras) |
| Metodo de entrenamiento | DUNE K=4096, modo expert, batch 256, seed 42, TF32 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna del modelo. Por la librería y el pipeline declarados (lerobot, robotics) y por el nombre (SmolVLA), se trata de un modelo de visión-lenguaje-acción orientado a control robótico, que procesa observaciones visuales de tres cámaras y produce acciones motoras para un robot bimanual PiperX. No se especifican número de parámetros, tipo de backbone, mecanismo de atención ni longitud de contexto.

El entrenamiento se realizó con el método DUNE (K=4096, modo expert) sobre el dataset `piperx-bimanual-move-box-left-to-right-100-clean`, compuesto por 99 episodios y 90 994 frames capturados con 3 cámaras. Se usó batch de 256, semilla 42, precisión TF32 y un schedule coseno completo hasta 24 000 actualizaciones, con nombre de ejecución `dune_k4096_expert_piperx99_b256_s24000_seed42_tf32`. Los checkpoints publicados corresponden a los primeros 10 000 pasos de ese entrenamiento, que seguía en curso en el momento de la subida. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, RLHF/DPO, etc.).

## Capacidades

- Control robótico bimanual: genera acciones para un robot PiperX en la tarea específica de mover una caja de izquierda a derecha.
- Percepción visual multi-cámara: consume observaciones de 3 cámaras según el dataset de entrenamiento.
- Política de imitación (visión-lenguaje-acción): traduce observaciones visuales y estado del robot en comandos motores.
- Carga mediante LeRobot: `SmolVLAPolicy.from_pretrained(...)` con subcarpeta por checkpoint.
- No consta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento extendido.
- No consta capacidad de generación de texto, código, matemáticas ni visión de propósito general; es un modelo de política robótica, no un LLM conversacional.

## Casos de uso

- Investigación en aprendizaje por imitación bimanual: usar los checkpoints para reproducir o comparar el método DUNE K=4096 en una tarea de manipulación concreta, aprovechando que se publican múltiples pasos intermedios para estudiar la evolución del entrenamiento.
- Reproducción de experimentos de LeRobot: cargar `checkpoints/<step>/pretrained_model` con `SmolVLAPolicy.from_pretrained` para validar pipelines de entrenamiento e inferencia en robótica.
- Análisis de curvas de aprendizaje: al disponer de checkpoints en pasos 0 a 10000, se puede evaluar cómo evoluciona la política a lo largo del entrenamiento en la tarea de mover la caja.
- Prototipado en laboratorio con robot PiperX: desplegar la política en un montaje físico equivalente al del dataset (3 cámaras, configuración bimanual) para pruebas controladas.
- Estudio de estabilidad de políticas VLA: comparar checkpoints tempranos frente a tardíos para analizar varianza y robustez antes de completar el entrenamiento previsto a 24 000 pasos.
- Base para fine-tuning: partir de estos pesos como inicialización en tareas de manipulación relacionadas, siempre que la licencia lo permita (no disponible, por lo que requiere confirmación del autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación en bucle abierto (open-loop) de estos checkpoints no se ha ejecutado todavía.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio completo ocupa 19,8 GB, pero cada checkpoint individual (`checkpoints/<step>/pretrained_model/model.safetensors`) es un subconjunto de ese total. Se desconoce el tamaño exacto por checkpoint.
- GPU recomendadas: no disponibles. Al no constar el número de parámetros, no se puede estimar con rigor si cabe en GPU de consumo (RTX 4090, 3090, etc.).
- Despliegue: la vía documentada es LeRobot (`SmolVLAPolicy.from_pretrained`), cargando la subcarpeta del checkpoint deseado. No consta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a políticas robóticas de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA PiperX DUNE K=4096 (este) | no disponible | no disponible | Manipulacion bimanual PiperX (mover caja) | no disponible | Hugging Face, 11 checkpoints |
| Otros SmolVLA de LeRobot | no disponible | no disponible | Politicas VLA generales | variable | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. Se recomienda consultar el ecosistema LeRobot para localizar políticas VLA comparables.

## Limitaciones y advertencias

- Entrenamiento incompleto: los checkpoints cubren hasta el paso 10 000 de 24 000 previstos; el modelo no está finalizado.
- Sin evaluación: no se ha ejecutado evaluación open-loop ni cerrada, por lo que no hay evidencia de rendimiento.
- Especialización extrema: entrenado solo para una tarea (mover una caja de izquierda a derecha) con un robot PiperX y una configuración de 3 cámaras; no generaliza a otras tareas ni robots.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; requiere contactar con el autor.
- Idiomas no disponibles: no aplica como modelo de lenguaje; no se documentan capacidades lingüísticas.
- Riesgo de sobreajuste al dataset de 99 episodios: la diversidad de datos es reducida.
- Sin estado de entrenamiento: no se incluyen optimizador ni `dust.pt`, por lo que no se puede reanudar el entrenamiento DUNE desde estos ficheros.
- Repositorio de 19,8 GB: requiere espacio de almacenamiento considerable y descarga selectiva por subcarpeta.
- Sin datos de sesgos, alucinación o robustez: no disponibles; en robótica, los fallos se manifiestan como acciones incorrectas o inseguras, por lo que se recomienda supervisión física en pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/xzz789/smolvla-piperx-dune-298890
- LeRobot (librería): https://github.com/huggingface/lerobot
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
