# Synth-NLP/laya-multilingual-massive-ablacao-ABD

## Resumen

Laya multilingual — brazo ABD es un modelo de clasificación de intenciones en portugués de Brasil, obtenido por fine-tuning del checkpoint `multilingual` de Laya (Convai Innovations) sobre datos sintéticos. Lo publica el colectivo Synth-NLP como parte de un experimento controlado que compara el rendimiento de datos sintéticos generados por una pipeline agéntica frente a datos reales; el brazo de comparación es `Synth-NLP/laya-multilingual-massive-real`. La tarea concreta es la selección de intención entre un conjunto de opciones presentadas como pregunta de tipo `choice`, dentro del formato de agente conversacional que define la librería `laya`.

El modelo tiene 321.908.998 parámetros (aproximadamente 322 M) y un repositorio de 0,7 GB en formato safetensors. La abreviatura ABD corresponde a la ablación AB3: se emplean exactamente los mismos datos que el brazo D1 v5 (5.405 ejemplos reales más unos 82.000 sintéticos cubriendo 240 intenciones), pero el 100 % de las muestras se presenta en el formato de pregunta original. El entrenamiento usa los valores por defecto de `laya.train.finetune` 0.4.14 durante 4 épocas, con lote efectivo de 64, objetivo `rlcd`, `shuffle_options=("choice",)` y semilla 0.

Es relevante ahora porque documenta de forma reproducible hasta qué punto los datos sintéticos pueden sustituir a los reales en una tarea de clasificación de intenciones multilingüe: con 0,885 de exactitud en el conjunto `vistas` y 0,732 en `nao_vistas`, el brazo sintético queda muy cerca de la referencia real (0,889 y 0,728 respectivamente). El modelo es de investigación, está marcado como privado por el autor y no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning del checkpoint `multilingual` de Laya; el autor no detalla la arquitectura interna) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues de Brasil (pt-br) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `multilingual` de Laya, cargado y entrenado mediante la librería `laya` (versión 0.4.14) con su utilidad `laya.train.finetune`. La model card no describe la arquitectura interna del modelo base (número de capas, dimensiones ocultas, mecanismo de atención), por lo que ese dato queda como no disponible. El uso previsto es la selección de intención dentro de un esquema de agente: se presenta al modelo una pregunta de tipo `choice` con un conjunto de criterios (intenciones candidatas) y el modelo devuelve la opción elegida.

El entrenamiento emplea el fichero `train_laya_ABD_v5.jsonl` del dataset `Synth-NLP/massive-pt-br-sintetico-v4`, con 5.405 ejemplos reales y aproximadamente 82.000 sintéticos distribuidos en 240 intenciones. La configuración es la misma que la del modelo real de referencia: 4 épocas, lote efectivo de 64, objetivo `rlcd` y `shuffle_options=("choice",)`, con semilla 0. Los datos sintéticos se generaron con Gemma 4 12B y Qwen3.5-9B; los brazos D incorporan además frases derivadas del corpus MASSIVE (arXiv:2204.08582, CC BY 4.0). La innovación metodológica del trabajo es la ablación controlada del formato de presentación de los datos (pregunta original frente a otras variantes), no una innovación arquitectónica.

## Capacidades

- Clasificación de intenciones en portugués de Brasil mediante preguntas de tipo `choice` con opciones dinámicas.
- Selección entre un conjunto variable de intenciones candidatas (240 intenciones en el conjunto de entrenamiento; 20 opciones sorteadas en la evaluación).
- Formato de interacción propio de la librería `laya`: entrada como diccionario `{"type": "choice", "instructions": ..., "criteria": {...}}` y salida en `answers["intent"]["choice"]`.
- Generalización parcial a escenarios no vistos durante el entrenamiento (conjunto `nao_vistas`).
- No se documentan capacidades de generación libre de texto, razonamiento matemático, código, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales en portugués: el modelo recibe la frase del usuario y un conjunto de intenciones candidatas, y devuelve la etiqueta elegida; encaja en pipelines de atención al cliente donde el catálogo de intenciones cambia con frecuencia.
- Clasificación con catálogo dinámico: al recibir las opciones en la propia pregunta, permite añadir o retirar intenciones sin reentrenar, algo útil en dominios con taxonomías en evolución.
- Evaluación de pipelines de generación de datos sintéticos: sirve como brazo de control para medir si los datos sintéticos igualan a los reales en una tarea concreta, comparando contra `Synth-NLP/laya-multilingual-massive-real`.
- Prototipado rápido de clasificadores de intención en pt-br: con 322 M de parámetros y 0,7 GB de pesos, se puede desplegar en una sola GPU de consumo para pruebas internas.
- Investigación sobre formato de datos: la ablación ABD permite aislar el efecto del formato de presentación (pregunta original frente a variantes) en el rendimiento final.
- Filtrado previo en sistemas de diálogo: usar el modelo como primera etapa para descartar intenciones improbables antes de invocar un modelo mayor o un LLM generativo.

## Benchmarks y rendimiento

Evaluación sobre el conjunto `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones sorteadas entre las intenciones del conjunto (azar = 0,050) y media de las semillas 0, 1 y 2. El conjunto `nao_vistas` contiene escenarios reservados que nunca se usaron en la generación de datos.

| Conjunto | Acurácia | Macro-F1 | Referencia real (acurácia) |
|---|---:|---:|---:|
| `vistas` | 0,885 | 0,846 | 0,889 |
| `nao_vistas` | 0,732 | 0,692 | 0,728 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,3 GB solo para pesos (322 M de parámetros); en fp16/bf16, aproximadamente 0,65 GB.
- VRAM recomendada en producción: 4-8 GB considerando overhead de framework, tokenizador y lote.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; una RTX 3060, RTX 4060, RTX 4090 o una A10/T4 son suficientes.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 6 GB o más.
- Opciones de despliegue: la librería `laya` (API `laya.load` y `agente.predict`) es la vía documentada por el autor; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acurácia `vistas` | Acurácia `nao_vistas` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Synth-NLP/laya-multilingual-massive-ablacao-ABD | 321.908.998 | no disponible | 0,885 | 0,732 | Apache 2.0 | pública en HF (autor la marca como privada) |
| Synth-NLP/laya-multilingual-massive-real | no disponible | no disponible | 0,889 | 0,728 | Apache 2.0 | pública en HF |
| convaiinnovations/laya (checkpoint `multilingual`) | no disponible | no disponible | no disponible | no disponible | Apache 2.0 | pública en HF |

La comparación directa con modelos de clasificación de intenciones de propósito general (por ejemplo, variantes de BERT o XLM-R ajustadas a MASSIVE) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo declara explícitamente como resultado en curso y lo marca como privado; no debe tratarse como un artefacto listo para producción.
- Cobertura lingüística limitada al portugués de Brasil; no se garantiza comportamiento en otras variantes del portugués ni en otros idiomas.
- Sesgos: los datos sintéticos se generaron con Gemma 4 12B y Qwen3.5-9B, por lo que pueden heredar sesgos de esos modelos; la model card no documenta una evaluación de sesgos.
- Riesgo de alucinación de etiqueta: en preguntas de tipo `choice` el modelo puede seleccionar una intención incorrecta cuando la frase queda fuera de la distribución de entrenamiento, como refleja la caída de 0,885 a 0,732 entre `vistas` y `nao_vistas`.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los pesos derivan de Laya (Convai Innovations) y parte de los datos de entrenamiento derivan de MASSIVE (© Amazon.com, Inc. o afiliadas, CC BY 4.0); conviene revisar las condiciones de atribución antes de redistribuir.
- Dependencia de la librería `laya` para la inferencia: no se documentan formatos alternativos (GGUF, ONNX) ni servidores estándar.
- Ausencia de datos sobre longitud de contexto, cuantización y latencia dificulta planificar un despliegue real.
- Sin descargas ni validación externa en Hugging Face en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-ablacao-ABD
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Brazo de comparación real: https://huggingface.co/Synth-NLP/laya-multilingual-massive-real
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper de MASSIVE: https://arxiv.org/abs/2204.08582
