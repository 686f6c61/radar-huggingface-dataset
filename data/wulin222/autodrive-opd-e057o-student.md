# wulin222/AutoDrive-OPD-E057O-student

## Resumen

AutoDrive-OPD-E057O-student es un modelo de conduccion autonoma end-to-end construido mediante ajuste fino completo de Qwen3-VL-4B-Instruct, un modelo vision-lenguaje de aproximadamente 4.000 millones de parametros desarrollado por Alibaba Qwen. Lo publica el usuario wulin222 como parte de una reproduccion independiente y extension del trabajo Driving-OPD sobre el benchmark NAVSIM, orientado a la planificacion de trayectorias a partir de una imagen de camara frontal y el estado del vehiculo.

El modelo resuelve la tarea de planificacion de trayectoria en entornos urbanos simulados: recibe la imagen CAM_F0, el comando de navegacion, velocidad, aceleracion longitudinal, velocidad de guinada y cuatro poses pasadas del ego, y devuelve un bloque `<trajectory>` con ocho puntos `[x, y, yaw]` muestreados a intervalos de 0,5 s en el sistema de referencia del ego actual. Se entrena por destilacion on-policy desde dos expertos de RL (E057D y E057V) usando divergencia Jensen-Shannon sobre el vocabulario completo de las muestras generadas por el propio estudiante.

Su relevancia radica en que demuestra que un VLM de 4B parametros puede alcanzar PDMS de 0,9227 en navtest, un resultado competitivo en el estado del arte de NAVSIM, con un unico modelo y decodificacion greedy de una sola trayectoria. La ficha del repositorio indica que el entrenamiento uso 3.000 escenas navtrain enrutadas por margen de victoria a cada experto, durante 2 epocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3-VL), ajuste fino completo |
| Parametros totales | no disponible (modelo base Qwen3-VL-4B-Instruct, ~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; el modelo base es Apache-2.0 y los datos derivan de nuPlan, sujetos a sus terminos |
| Formato de pesos | safetensors (3 shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct (revision `ebb281ec70b05090aa6165b016eac8ec08e71b17`), un transformer vision-lenguaje con encoder de imagen y decoder de lenguaje, y aplica ajuste fino de todos los parametros sobre la tarea de conduccion. La entrada multimodal combina la imagen de camara frontal con un prompt de texto que codifica el comando de navegacion y el estado dinamico del ego (velocidad, aceleracion longitudinal, velocidad de guinada y cuatro poses pasadas), construido por `navsim/agents/driving_opd/representation.py::make_prompt`. La salida es textual: un bloque `<trajectory>` con ocho puntos `[x, y, yaw]` a 0,5 s.

El entrenamiento es una destilacion on-policy desde dos expertos de RL, E057D y E057V. Se parte del experto E057V y se usan 3.000 escenas navtrain enrutadas a cada experto segun el margen de victoria, durante 2 epocas. La perdida es una divergencia Jensen-Shannon sobre el vocabulario completo aplicada a las muestras generadas por el propio estudiante, lo que alinea la distribucion del estudiante con la de los expertos en los estados que el estudiante visita. No se especifica en la informacion disponible si hubo RLHF o DPO adicionales.

## Capacidades

- Planificacion de trayectoria en conduccion autonoma: genera trayectorias de 8 puntos a 0,5 s en el sistema de referencia del ego a partir de una imagen de camara frontal y estado del vehiculo.
- Comprension de imagen (vision-lenguaje) heredada de Qwen3-VL-4B-Instruct.
- Seguimiento de comandos de navegacion y estado dinamico del ego codificados en el prompt.
- Generacion de texto estructurado en formato `<trajectory>` parseable.
- Capacidades generales del modelo base (razonamiento, codigo, matematicas, multilingue) potencialmente preservadas por el ajuste fino completo, aunque no se documentan en la informacion disponible.
- Soporte de tool calling o function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.

## Casos de uso

- Evaluacion de planificadores en NAVSIM: el modelo puede integrarse como agente en el benchmark NAVSIM para reproducir los resultados reportados (PDMS 0,9227 en navtest) y comparar con otros planificadores bajo el mismo protocolo de generacion.
- Investigacion en destilacion on-policy: sirve como referencia reproducible para estudiar destilacion de vocabulario completo (JSD) desde expertos de RL a un VLM de 4B en una tarea de control.
- Generacion de trayectorias en simulacion urbana: dado que produce trayectorias en el marco del ego a partir de CAM_F0, puede usarse en pipelines de simulacion cerrada para generar comportamiento de conduccion en escenas nuPlan.
- Baseline para ajuste fino en conduccion: al ser un VLM de 4B con licencia base permisiva, es un punto de partida realista para experimentos de fine-tuning en planificacion end-to-end con recursos moderados.
- Analisis de robustez multimodal: permite estudiar como varian las trayectorias ante cambios en la imagen o el estado del ego, con decodificacion greedy y sin muestreo estocastico.
- Prototipado de asistentes de conduccion en laboratorio: util para validar la representacion de prompt (comando, velocidad, aceleracion, yaw rate, poses pasadas) antes de trasladar el diseno a modelos mayores o datos reales.

## Benchmarks y rendimiento

Resultados reportados en la model card, decodificacion greedy, trayectoria unica, todos los 12.146 escenas de navtest, 0 fallos de parseo:

| Benchmark | Resultado |
|---|---:|
| navtest PDMS | 0,9227 |
| navtest EPDMS (guarded) | 0,9125 |
| navhard EPDMS | 0,3022 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8-9 GB para los pesos de un modelo de ~4B parametros, mas memoria para el encoder visual y el cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 4-5 GB; en 4 bits: aproximadamente 2,5-3 GB (estimaciones para un transformer de 4B, no verificadas para este checkpoint).
- GPU recomendadas: A100, H100 o L40S para evaluacion a escala sobre las 12.146 escenas de navtest; RTX 4090 o RTX 3090 para inferencia individual.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 y en tarjetas con 4-6 GB en cuantizacion de 4 bits, sujeto a la memoria del encoder visual con `max_pixels=1048576`.
- Opciones de despliegue: Transformers (formato nativo safetensors), vLLM y TGI para servir; llama.cpp u Ollama requeririan conversion a GGUF, no documentada en la informacion disponible.
- Latencia y throughput: no disponibles. La evaluacion usa `max_new_tokens=512`, `min_pixels=262144` y `max_pixels=1048576`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento NAVSIM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AutoDrive-OPD-E057O-student | ~4B (base Qwen3-VL-4B) | no disponible | navtest PDMS 0,9227; navhard EPDMS 0,3022 | no disponible (base Apache-2.0; datos nuPlan) | Hugging Face, pesos safetensors |
| Qwen3-VL-4B-Instruct | ~4B | no disponible | no aplica (modelo generalista, sin entrenamiento en NAVSIM) | Apache-2.0 | Hugging Face |
| Expertos E057D y E057V | no disponible | no disponible | no disponible | no disponible | no disponible (referenciados en la model card) |

No se dispone de datos de benchmarks de los expertos ni de otros planificadores NAVSIM en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas de la misma categoria no esta disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre escenas navtrain de NAVSIM/OpenScene derivadas de nuPlan; el uso esta sujeto a los terminos del dataset nuPlan.
- El repositorio no declara licencia propia; la licencia del modelo base (Apache-2.0) no cubre necesariamente los pesos derivados ni los datos de entrenamiento.
- El codigo de entrenamiento y evaluacion referenciado (`github.com/aba122/AutoDrive-OPD`) se describe como privado, lo que limita la reproducibilidad completa.
- El rendimiento en navhard EPDMS (0,3022) es notablemente inferior al de navtest, lo que sugiere degradacion en escenarios dificiles.
- La evaluacion se limita a decodificacion greedy y una unica trayectoria; no se documenta robustez ante muestreo o ensembles.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al ser un VLM generalista ajustado, puede heredar sesgos del modelo base.
- Dependencia de una unica camara frontal (CAM_F0); no se usan otras camaras ni sensores.
- El formato de salida exige parseo estricto del bloque `<trajectory>`; aunque se reportan 0 fallos en navtest, no se garantiza en dominios fuera de distribucion.
- Sin descargas ni likes en el momento de la consulta y con tamano de repositorio reportado de 0,0 GB, lo que sugiere que los pesos podrian no estar completamente subidos o indexados.

## Enlaces

- Hugging Face: https://huggingface.co/wulin222/AutoDrive-OPD-E057O-student
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Codigo (privado, referencia): github.com/aba122/AutoDrive-OPD, rama `driving-opd-release-20261119`, commit `671e7ce`
- Script de generacion: `scripts/evaluation/generate_driving_opd.py`
- Script de scoring: `scripts/evaluation/score_driving_opd.py`
- Entrenamiento: `navsim/planning/training/driving_opd_sft.py` y `navsim/planning/training/driving_opd_posttrain.py`
- Representacion del prompt: `navsim/agents/driving_opd/representation.py::make_prompt`
