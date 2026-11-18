# Synth-NLP/laya-multilingual-massive-sint-v4-B

## Resumen

Laya multilingual massive sint v4-B es un ajuste fino del checkpoint `multilingual` de Laya (Convai Innovations) para clasificación de intenciones en portugués de Brasil. Lo desarrolla el colectivo Synth-NLP como parte de un experimento controlado que compara el rendimiento de datos sintéticos generados por una pipeline agéntica frente a datos reales, manteniendo constante el número de frases por intención (5.405) y la configuración de entrenamiento. El modelo base Laya es un transformer de aproximadamente 322 millones de parámetros con una interfaz de agente basada en preguntas tipadas (`choice`, etc.), y este checkpoint se distribuye en formato safetensors (2,0 GB de repositorio) bajo licencia Apache 2.0.

El interés del modelo es metodológico más que de producto: sirve como brazo B de un ablación entre datos sintéticos y reales para la misma tarea y el mismo presupuesto de ejemplos. Cubre 30 intenciones vistas en entrenamiento y se evalúa también sobre escenarios reservados no vistos durante la generación, con un protocolo de 20 opciones sorteadas y media sobre tres semillas. Su estado declarado es de investigación, con resultado en curso y visibilidad privada en el momento de la publicación.

No debe confundirse con un modelo generativo de propósito general: es un clasificador de intenciones especializado, con idioma declarado únicamente portugués (`pt`) y pipeline `text-classification`. Para producción multilingüe o tareas abiertas de razonamiento no es la herramienta adecuada; para evaluar la viabilidad de datos sintéticos en NLU de intenciones en portugués, es un punto de referencia útil y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Laya, checkpoint `multilingual`); detalles internos de capas y atención no disponibles |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | portugués (`pt`, con datos de portugués de Brasil) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `multilingual` de Laya y se ajusta con la librería `laya` (versión 0.4.14) mediante `laya.train.finetune`, con 4 épocas, lote efectivo de 64, objetivo `rlcd` y `shuffle_options=("choice",)`. La semilla de entrenamiento es 0. Los datos provienen del fichero `train_laya_B_v4.jsonl` del dataset `Synth-NLP/massive-pt-br-sintetico-v4` (carpeta `treino_laya/`), con verificación sha256 registrada en `results/treino.json`. El conjunto es exclusivamente sintético, con 30 intenciones vistas y la misma cuenta por intención que el entrenamiento real de referencia (5.405 frases).

La innovación relevante no está en la arquitectura sino en el protocolo experimental: se aísla el efecto de la fuente de datos (sintético frente a real) manteniendo constantes tamaño de muestra, hiperparámetros y semilla. Los datos sintéticos se generaron con Gemma 4 12B y Qwen3.5-9B; algunos brazos del experimento (D) incorporan frases derivadas de MASSIVE (Amazon, CC BY 4.0). La evaluación usa el conjunto `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones sorteadas entre las intenciones del conjunto y media de las semillas 0, 1 y 2 (nivel de azar 0,050). No se documentan detalles sobre el número de tokens de entrenamiento del modelo base, la composición de su corpus ni si hubo RLHF o DPO en Laya.

## Capacidades

- Clasificación de intenciones en portugués de Brasil mediante la interfaz de agente de Laya: se plantea una pregunta de tipo `choice` con un conjunto de criterios (intenciones) y el modelo devuelve la opción seleccionada.
- Selección entre opciones dinámicas: el conjunto de candidatas se pasa en tiempo de inferencia, con soporte de `shuffle_options` para evitar sesgo posicional.
- Manejo de intenciones vistas en entrenamiento (30 clases) y generalización parcial a escenarios reservados no vistos.
- Integración con la librería `laya` (`laya.load`, `agente.predict`).
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; el pipeline declarado es exclusivamente `text-classification`.
- Capacidad multilingüe: no disponible más allá del portugués declarado, pese al nombre del checkpoint base.

## Casos de uso

- Evaluación de pipelines de datos sintéticos: usar este brazo B como control frente a `Synth-NLP/laya-multilingual-massive-real` para medir la brecha de accuracy y macro-F1 entre datos sintéticos y reales con idéntico presupuesto, antes de invertir en anotación humana.
- Clasificación de intenciones en asistentes de voz o chat en portugués de Brasil: el modelo resuelve la elección entre un conjunto cerrado de intenciones (clima, agenda, domótica en el ejemplo de la model card) con una llamada por turno.
- Enrutado de consultas en un sistema de atención al cliente: dado un catálogo de intenciones, seleccionar la categoría para dirigir el ticket al flujo o al equipo correcto, con la ventaja de que las opciones se definen en inferencia sin reentrenar.
- Investigación en NLU de bajos recursos: replicar el protocolo (30 intenciones, 5.405 frases, 4 épocas, semilla 0) para estudiar el efecto del ruido sintético en la frontera de decisión.
- Prototipado rápido de clasificadores de intención: al ser un ajuste ligero sobre un modelo de 322 M de parámetros, permite iterar sobre esquemas de intenciones en entornos con GPU modesta antes de comprometerse con un modelo mayor.
- Benchmark interno de generalización: emplear el subconjunto `nao_vistas` (escenarios reservados nunca usados en la generación) como test de robustez frente a intenciones fuera de distribución.
- Docencia y reproducción experimental: el repositorio incluye predicciones por frase en `results/`, lo que facilita auditar el comportamiento del modelo clase a clase.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones sorteadas entre las intenciones del conjunto y media de las semillas 0, 1 y 2 (azar = 0,050):

| Conjunto | Acurácia | Macro-F1 |
|---|---:|---:|
| `vistas` | 0,844 | 0,808 |
| `nao_vistas` | 0,727 | 0,671 |

Referencia del brazo con datos reales, según la model card: 0,889 en `vistas` y 0,728 en `nao_vistas`. La brecha en `vistas` es de 4,5 puntos de accuracy a favor del dato real; en `nao_vistas` la diferencia es de 0,1 puntos, prácticamente nula. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 321,9 M de parámetros, en fp32 son aproximadamente 1,3 GB de pesos; en fp16/bfloat16 unos 0,65 GB; en int8 unos 0,33 GB. Añadir memoria para activaciones y el tokenizador, típicamente menos de 1 GB adicional con lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. El modelo está sobredimensionado para GPUs de datacenter, que no aportan ventaja significativa frente a una consumer de gama media.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: la vía documentada es la librería `laya` (`laya.load` y `agente.predict`). No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de clasificación con interfaz de agente propia, la integración con esos servidores requeriría trabajo adicional no descrito.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy `vistas` | Accuracy `nao_vistas` | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Synth-NLP/laya-multilingual-massive-sint-v4-B | 321,9 M | no disponible | 0,844 | 0,727 | Apache 2.0 | Hugging Face (repo privado según la model card) |
| Synth-NLP/laya-multilingual-massive-real | mismo base Laya | no disponible | 0,889 | 0,728 | Apache 2.0 (presumible, mismo base) | Hugging Face |
| convaiinnovations/laya (checkpoint `multilingual`) | ~322 M (base) | no disponible | no disponible (sin ajuste a esta tarea) | no disponible | Apache 2.0 | Hugging Face |

La comparación directa más informativa es contra el brazo real del mismo experimento, que supera al sintético en 4,5 puntos sobre intenciones vistas y empata en las no vistas. Frente al checkpoint base sin ajustar, la comparación no es significativa porque la tarea de elección de intención requiere el ajuste. No se dispone de comparación con clasificadores de intenciones alternativos (por ejemplo, basados en XLM-R o mBERT) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con resultado en curso: el autor lo declara explícitamente como trabajo en progreso y el repositorio figura como privado, lo que limita su reproducibilidad externa.
- Sesgo de dominio y de idioma: entrenado solo con portugués de Brasil y 30 intenciones; no cubre variantes de portugués europeo ni otras lenguas pese al nombre del checkpoint base.
- Dependencia de datos sintéticos: la accuracy sobre intenciones vistas cae 4,5 puntos frente al brazo real, lo que sugiere que el dato sintético no sustituye al real en la frontera de decisión.
- Riesgo de sobreajuste al esquema de generación: las frases sintéticas provienen de Gemma 4 12B y Qwen3.5-9B, por lo que pueden heredar sus patrones léxicos y sesgos; la evaluación sobre `nao_vistas` mitiga pero no elimina este riesgo.
- Alucinación: en un clasificador de opciones cerradas el fallo se manifiesta como selección incorrecta de una intención, no como texto inventado; aun así, no hay garantía de calibración de confianza documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los pesos derivan de Laya (Convai Innovations) y parte de los datos de otros brazos derivan de MASSIVE (© Amazon.com, Inc. o afiliadas, CC BY 4.0); conviene revisar la atribución si se redistribuyen derivados.
- Sin datos publicados de contexto máximo, cuantizaciones soportadas ni latencia, lo que dificulta dimensionar un despliegue en producción sin pruebas propias.
- Cero descargas y cero likes en el momento del registro: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-sint-v4-B
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Brazo de comparación con datos reales: https://huggingface.co/Synth-NLP/laya-multilingual-massive-real
- Dataset de entrenamiento sintético: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper de MASSIVE: https://arxiv.org/abs/2204.08582
