# tensor-tailor/zils-lite-body-9

## Resumen

zils-lite-body-9 es un modelo de decisión (decision model) publicado por el usuario tensor-tailor en Hugging Face. Se trata de un ajuste fino (fine-tune) de un modelo base de la familia Zils, orientado a tareas de elección entre opciones con distribución de probabilidad sobre las mismas, más que a generación de texto libre. El modelo se construye sobre el chasis d3-lite, que a su vez emplea la arquitectura y los tensores de Qwen3.5-0.8B (lenguaje y visión), almacenados en bf16.

El modelo deriva de un promedio uniforme de dos cuerpos previos (1lock/zils-lite-astrid-g1 y bmars8218/zils-lite-body-2) sobre el chasis vllm-sr/d3-lite, seguido de un ajuste fino con LoRA sobre las capas de lenguaje 16 a 23. El resultado es un modelo de aproximadamente 853 millones de parámetros, con licencia Apache 2.0, pensado para el ecosistema de minería de Zils (Bittensor subnet 127).

Su relevancia es acotada: se trata de una contribución dentro de un pool de modelos de decisión experimentales, con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. Resulta de interés para quienes trabajan con el ecosistema Zils o investigan destilación de distribuciones de probabilidad sobre opciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (chasis d3-lite basado en Qwen3.5-0.8B; tensores de lenguaje y visión) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las filas de entrenamiento se truncaron a 1.024 tokens) |
| Tipos de cuantizacion | no disponible (pesos almacenados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, con custom_code) |

## Arquitectura y entrenamiento

El modelo parte del chasis vllm-sr/d3-lite, que integra los tensores de lenguaje y visión de Qwen/Qwen3.5-0.8B en bf16. Los pesos iniciales son el promedio uniforme en fp32 de 1lock/zils-lite-astrid-g1 y bmars8218/zils-lite-body-2, construido con la herramienta soup.build del propio ecosistema Zils a temperatura 1.0. Sobre esa base se aplica un ajuste fino con LoRA (rango 16, alpha 32, dropout 0.05) restringido a las capas de lenguaje 16 a 23 (las 8 superiores de 24), con tasa de aprendizaje 5e-5, calentamiento lineal en los primeros 50 pasos y decaimiento coseno, lote de 16, semilla 4343 y una época (7.854 pasos). El LoRA se fusiona en los pesos y se almacena en bf16; el resto de tensores permanece idéntico al punto de partida.

La función de pérdida no emplea entropía cruzada sobre etiquetas: cada fila de entrenamiento lleva una distribución objetivo de probabilidad sobre sus opciones. Se usa divergencia KL directa hacia las probabilidades objetivo de cada fila y una KL adicional (peso 2) hacia las probabilidades del modelo de partida en las filas de regularización. Los datos de entrenamiento suman 112.555 filas antes del límite de longitud (110.394 usadas, 2.161 descartadas) e incluyen destilación de 30.113 preguntas desde vllm-sr/d3-ultra, 29.167 filas de mezclas propias previas y 53.275 filas de splits de entrenamiento públicos (QNLI, PIQA, MultiNLI, Amazon Polarity, CoQA, SQuAD v2.0, BoolQ, Cosmos QA, SciNLI, QASC, FEVER, MathQA, Fig-QA, ROPES, MegaVeridicality, DROP, COPA, PUBHEALTH). El profesor de cada grupo de filas se selecciona por el menor Brier score frente a las etiquetas verdaderas en una muestra de hasta 200 filas. La regularización añade 15.418 preguntas (15.262 usadas). El cambio relativo de las capas de lenguaje respecto a Qwen3.5-0.8B es de 0.026, por debajo del límite de 0.15 fijado por Zils.

## Capacidades

- Clasificación y decisión entre opciones: el modelo está diseñado para producir distribuciones de probabilidad sobre un conjunto de opciones dadas, no para generación abierta de texto.
- Razonamiento sobre preguntas de formato examen: entrenado con filas de práctica en formato de examen y splits públicos de razonamiento (QASC, MathQA, Cosmos QA, DROP, entre otros).
- Comprensión lectora y respuesta a preguntas: cubierto por los datos de SQuAD v2.0, CoQA, BoolQ y QNLI.
- Inferencia de lenguaje natural: entrenado con MultiNLI, SciNLI y ROPES.
- Razonamiento matemático básico: presencia de MathQA y FEVER en el conjunto de datos.
- Capacidades de visión: el chasis incluye tensores de visión de Qwen3.5-0.8B, aunque no se detalla su uso específico en este ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Evaluación de modelos de decisión en el ecosistema Zils: el modelo se integra en el pool d3-lite de la subnet 127 de Bittensor como cuerpo candidato; se usaría para medir su Brier score frente a las etiquetas verdaderas en el conjunto de evaluación del examen Zils.
- Clasificación de pares de frases: con los datos de MultiNLI y QNLI, el modelo puede asignar probabilidades a opciones de inferencia (contradicción, neutral, implicación) en pipelines de evaluación de comprensión lectora.
- Respuesta a preguntas extractivas: entrenado con SQuAD v2.0 y CoQA, puede puntuar opciones de respuesta sobre pasajes de texto, útil en sistemas de QA con selección de candidatos.
- Análisis de sentimiento binario: con Amazon Polarity y BoolQ, el modelo puede emitir probabilidades sobre opciones sí/no en tareas de clasificación de opiniones.
- Razonamiento científico y de sentido común: con QASC, SciNLI y Cosmos QA, puede emplearse en la evaluación de modelos de razonamiento sobre opciones múltiples.
- Destilación de distribuciones: el modelo puede servir como profesor o alumno en pipelines de destilación de probabilidades sobre opciones, dado que su entrenamiento se basa en KL hacia distribuciones objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en bf16 (tamaño del repositorio); en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del número de parámetros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede alojar el modelo en bf16; para despliegue en producción se recomienda una RTX 4090, A100 o H100 por margen y throughput.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: al tratarse de un chasis d3-lite con custom_code, requiere el código personalizado del repositorio; no se confirma compatibilidad directa con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| tensor-tailor/zils-lite-body-9 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| 1lock/zils-lite-astrid-g1 | no disponible | no disponible | Apache 2.0 | Hugging Face |
| bmars8218/zils-lite-body-2 | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B | aproximadamente 800 M | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en decisión entre opciones: no está diseñado para generación de texto libre ni para tareas conversacionales abiertas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Sesgos conocidos: los datos de entrenamiento provienen de splits públicos con posibles sesgos (MultiNLI, Amazon Polarity, FEVER, entre otros); no se documenta un análisis de sesgos.
- Riesgo de alucinación: al operar sobre distribuciones de opciones, el riesgo se manifiesta como asignación de probabilidad alta a opciones incorrectas; no se han publicado métricas de calibración.
- Limitaciones de contexto: las filas de entrenamiento se truncaron a 1.024 tokens; no se especifica la longitud de contexto efectiva del modelo.
- Idiomas: no se especifican los idiomas soportados; los datos de entrenamiento son mayoritariamente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero algunos datasets de entrenamiento tienen licencias share-alike (CC BY-SA) y copyleft, lo que puede afectar a la redistribución de los pesos derivados.
- Caveat de producción: el modelo requiere custom_code del repositorio y no se confirma su compatibilidad con frameworks de inferencia estándar.
- Madurez: cero descargas y cero likes en el momento de la consulta; se trata de una contribución experimental dentro de un pool de minería.

## Enlaces

- [Hugging Face: tensor-tailor/zils-lite-body-9](https://huggingface.co/tensor-tailor/zils-lite-body-9)
- [Modelo base: 1lock/zils-lite-astrid-g1](https://huggingface.co/1lock/zils-lite-astrid-g1)
- [Modelo base: bmars8218/zils-lite-body-2](https://huggingface.co/bmars8218/zils-lite-body-2)
- [Chasis: vllm-sr/d3-lite](https://huggingface.co/vllm-sr/d3-lite)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Profesor: vllm-sr/d3-ultra](https://huggingface.co/vllm-sr/d3-ultra)
- [Dataset: zils-ai/zils-relay-answers](https://huggingface.co/datasets/zils-ai/zils-relay-answers)
- [Profesor: dasLOL/zils-lite-skills-v5](https://huggingface.co/dasLOL/zils-lite-skills-v5)
- [Profesor: Charlie320/zils-lite-k3b](https://huggingface.co/Charlie320/zils-lite-k3b)
- [Modelo previo: tensor-tailor/zils-lite-body-5](https://huggingface.co/tensor-tailor/zils-lite-body-5)
- [Modelo previo: tensor-tailor/zils-lite-body-4](https://huggingface.co/tensor-tailor/zils-lite-body-4)
- [GitHub: ooo-hq/zils-web](https://github.com/ooo-hq/zils-web)
