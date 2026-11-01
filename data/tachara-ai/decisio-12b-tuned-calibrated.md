# tachara-ai/Decisio-12b-tuned-calibrated

## Resumen

Decisio-12b-tuned-calibrated es un ajuste fino de google/gemma-4-12B-it (revision `707f0a3b`) publicado por tachara-ai. El modelo no es un asistente conversacional generico: esta especializado en responder preguntas tipadas sobre un estado (si/no, puntuacion o eleccion entre opciones) devolviendo una probabilidad calibrada para cada opcion. Se sirve mediante el framework [decisio](https://github.com/aminry/decisio), que aplica el layout de prompt, la lectura de etiquetas de opcion, las temperaturas y la regla de commit propias del modelo.

Tecnicamente es un transformer denso de 11.959.730.224 parametros (unos 12 mil millones) en el que se ha fusionado un adaptador LoRA sobre los pesos base. La fusion se hizo en fp32 y se redondeo una sola vez a bf16 de forma estocastica con semilla 0, conservando el 99,9996 por ciento del cambio del adaptador en el espacio de pesos. El resto de tensores son identicos byte a byte a los del modelo base.

Su relevancia radica en el enfoque: en lugar de generar texto libre, produce distribuciones de probabilidad calibradas para tareas de decision, con temperaturas ajustadas por minimo log loss segun tipo de pregunta y banda de numero de opciones. Existe un segundo repositorio con los mismos pesos (Decisio-12b-tuned-commit) que difiere unicamente en `decision_config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 4), ajustado como modelo de decision |
| Parametros totales | 11.959.730.224 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer denso de aproximadamente 12 mil millones de parametros. Sobre esa base se entreno un adaptador LoRA que posteriormente se fusiono en los pesos. La fusion se realizo con la herramienta `python -m decisio.hub_bf16 merge`, en fp32 y con un unico redondeo estocastico a bf16 (semilla 0). El repositorio incluye `decision_config.json`, que lista cada fichero por sha256 junto con los datos de la fusion, y `SHA256SUMS` con los ficheros del repositorio.

Los datos de entrenamiento no se han divulgado. El autor indica que no se usaron elementos de evaluacion de Decision Index ni de JevBench en el entrenamiento ni en la seleccion del checkpoint, y que los datos se descontaminaron contra los conjuntos de test publicos de ambos boards. El entrenamiento incluyo los splits oficiales de entrenamiento de algunos benchmarks publicos bajo sus licencias, sin usar sus elementos de test. Las temperaturas de calibracion se ajustaron por minimo log loss por tipo de pregunta y banda de numero de opciones, sobre la lectura plana (sin regla de commit, sin doble lectura y sin modo thinking).

## Capacidades

- Respuesta a preguntas tipadas sobre un estado con una probabilidad por opcion.
- Preguntas de tipo si/no, con temperatura de calibracion 3.314.
- Preguntas de puntuacion, con temperatura 2.1109.
- Preguntas de eleccion, con temperatura dependiente del numero de opciones: 2.1317 para 2-10 opciones, 1.8766 para 11-26 y 1.7181 para 27-255.
- Calibracion de confianza: la probabilidad declarada se ajusta a la frecuencia real de acierto.
- Servido mediante el motor vLLM integrado en decisio (`decisio.serve.vllm_engine`).
- Exposicion de metadatos del repositorio via `/health`, `systemone.repository_defaults` y `systemone.flavor`.
- Sobrescritura de parametros por peticion, reportada como override cuando difiere del repositorio.
- No incluye regla de commit, doble lectura ni modo thinking en esta variante (la variante `commit` cubre ese caso).
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Clasificacion binaria calibrada en produccion: el modelo devuelve una probabilidad para cada pregunta si/no, lo que permite fijar umbrales de decision y estimar el riesgo de cada respuesta en lugar de depender de texto generado.
- Enrutamiento de tickets o solicitudes: con preguntas de eleccion entre un conjunto cerrado de categorias (2-255 opciones), la temperatura ajustada por banda de opciones mantiene la calibracion incluso con listas largas.
- Puntuacion de riesgo o prioridad: las preguntas de tipo score permiten obtener una distribucion sobre niveles ordenados, util para priorizar colas de trabajo con confianza explicita.
- Sistemas de decision con umbral de abstención: al disponer de probabilidades calibradas, se puede derivar a revision humana cuando la confianza cae por debajo de un valor configurado.
- Evaluacion de modelos de decision: el ajuste por minimo log loss y la descontaminacion contra Decision Index y JevBench lo hacen adecuado como referencia en pipelines de evaluacion comparativa.
- Integracion en servicios con vLLM: el despliegue mediante `decisio.serve.vllm_engine` permite servir el modelo con los valores por defecto del repositorio y auditar cualquier override aplicado.
- Experimentacion con variantes de decision: al compartir pesos con Decisio-12b-tuned-commit y diferir solo en `decision_config.json`, permite comparar estrategias de lectura sin cambiar el modelo subyacente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 24 GB solo para pesos, mas memoria para KV cache y overhead del motor; el repositorio ocupa 24,0 GB.
- Cuantizacion: no se documentan versiones GGUF ni AWQ/GPTQ en la informacion disponible; el unico formato publicado es safetensors en bf16.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, un modelo de 12B en bf16 requiere GPUs con al menos 24 GB de memoria dedicada para los pesos.
- GPU de consumo: no confirmado por el autor; no disponible.
- Opciones de despliegue: vLLM a traves de `decisio.serve.vllm_engine` (requiere decisio 0.31.0 o superior). El autor advierte que vLLM por si solo carga los pesos como un checkpoint Gemma 4 ordinario, pero no aplica el layout de prompt, la lectura de etiquetas de opcion, las temperaturas ni la regla de commit de decisio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Decisio-12b-tuned-calibrated | 11.959.730.224 | No disponible | Decision calibrada con probabilidades por opcion | Apache 2.0 | HuggingFace, via decisio |
| Decisio-12b-tuned-commit | No disponible | No disponible | Mismos pesos, distinta `decision_config.json` (regla de commit) | Apache 2.0 | HuggingFace, via decisio |
| google/gemma-4-12B-it | No disponible | No disponible | Asistente instructivo general | No disponible en la informacion | HuggingFace (modelo base) |

No se dispone de datos de otros modelos de decision comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un asistente conversacional general; fuera del formato de preguntas tipadas de decisio no aplica su calibracion ni sus temperaturas.
- Dependencia de herramienta: requiere decisio 0.31.0 o superior; versiones anteriores no reconocen el flavor del repositorio.
- vLLM estandar no reproduce el comportamiento: sin decisio no se aplican layout de prompt, lectura de opciones, temperaturas ni regla de commit.
- Datos de entrenamiento no divulgados, lo que limita la trazabilidad de sesgos y comportamientos.
- Riesgo de alucinacion y sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingue.
- Longitud de contexto: no disponible.
- Uso comercial: permitido bajo Apache 2.0, con las obligaciones de atribucion correspondientes (ver `LICENSE` y `NOTICE`); Gemma 4 es propiedad de Google.
- La calibracion se ajusto sobre la lectura plana; modificaciones del layout o de las temperaturas pueden degradar la correspondencia entre confianza declarada y acierto real.
- Popularidad muy baja en el momento de la ficha (14 descargas, 0 likes), lo que reduce la validacion independiente.

## Enlaces

- HuggingFace: https://huggingface.co/tachara-ai/Decisio-12b-tuned-calibrated
- Repositorio decisio: https://github.com/aminry/decisio
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
