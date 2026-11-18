# Synth-NLP/laya-multilingual-massive-sint-v5-D1

## Resumen

Laya multilingual massive sint v5 D1 es un ajuste fino del checkpoint `multilingual` del modelo Laya, desarrollado por Synth-NLP, orientado a clasificación de intenciones (intent classification) en portugués de Brasil. El modelo resuelve una tarea concreta: dado un enunciado en lenguaje natural y un conjunto de opciones de intención, seleccionar la correcta. Se enmarca en un experimento metodológico que compara el rendimiento de datos sintéticos generados por una pipeline agéntica frente a datos reales, con un brazo de comparación denominado `laya-multilingual-massive-real`.

El modelo parte de la base `convaiinnovations/laya` y se ha entrenado sobre 5.405 frases reales más aproximadamente 82.000 frases sintéticas que cubren 240 intenciones (60 heredadas de la versión v4 y 180 nuevas). El formato de entrenamiento incluye instrucciones parafraseadas, negativas difíciles y descripciones dentro de las opciones, lo que busca mejorar la robustez frente a formulaciones ambiguas.

Con 321.908.998 parámetros y un tamaño de repositorio de 2,0 GB, el modelo se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia actual es doble: por un lado, ofrece un clasificador de intenciones en portugués con resultados cercanos a los del modelo entrenado con datos reales; por otro, documenta de forma transparente el protocolo de evaluación sobre escenarios vistos y no vistos, lo que resulta útil para investigadores interesados en la sustitución de datos anotados por datos sintéticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Laya, `convaiinnovations/laya`) |
| Parámetros totales | 321.908.998 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | portugués (pt), con foco en pt-BR |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se detalla en la información disponible la arquitectura interna del modelo base Laya (si es un transformer denso, MoE o híbrido), ni su número de capas, dimensión oculta o mecanismo de atención. Lo que sí se especifica es que este checkpoint es un ajuste fino del checkpoint `multilingual` de Laya para una tarea de selección de intención con formato de elección entre opciones. El modelo se carga mediante la librería `laya` y expone una interfaz `predict` que recibe un enunciado y un objeto de pregunta con instrucciones y criterios.

El entrenamiento utilizó el fichero `train_laya_D1_v5.jsonl` del dataset `Synth-NLP/massive-pt-br-sintetico-v5`, con la configuración por defecto de `laya.train.finetune` 0.4.14: 4 épocas, lote efectivo de 64, objetivo `rlcd` y `shuffle_options=("choice",)`, con semilla 0. La composición de datos combina 5.405 frases reales con aproximadamente 82.000 frases sintéticas de 240 intenciones, generadas con Gemma 4 12B y Qwen3.5-9B. Parte de las frases derivan del corpus MASSIVE (CC BY 4.0). La evaluación se realizó con 20 opciones sorteadas entre las intenciones del conjunto, promediando las semillas 0, 1 y 2, con una línea base de azar de 0,050.

## Capacidades

- Clasificación de intenciones en portugués mediante selección entre un conjunto de opciones proporcionado en la consulta.
- Interpretación de instrucciones en formato de pregunta con criterios y opciones, incluyendo descripciones dentro de cada opción.
- Robustez ante paráfrasis, negativas difíciles y formulaciones variadas, gracias al formato de aumento de datos empleado en el entrenamiento.
- Manejo de 240 intenciones distintas, incluidas 180 nuevas respecto a la versión v4 del pipeline.
- Evaluación sobre escenarios no vistos (`nao_vistas`), lo que permite medir generalización a intenciones reservadas.
- No se documentan capacidades de generación libre, tool calling, agentes, visión, audio ni modo de razonamiento extendido; el modelo está especializado en clasificación.

## Casos de uso

- Enrutamiento de consultas en asistentes conversacionales: el modelo recibe el enunciado del usuario y un conjunto de intenciones candidatas, y devuelve la intención seleccionada, lo que permite dirigir la conversación al flujo adecuado sin necesidad de un LLM generativo.
- Clasificación de tickets de soporte en portugués: integrado en un pipeline de preprocesado, asigna cada mensaje entrante a una categoría de atención (facturación, incidencias técnicas, cuenta), aprovechando su entrenamiento con negativas difíciles para reducir confusiones entre categorías próximas.
- Investigación sobre sustitución de datos anotados: sirve como brazo experimental para comparar el rendimiento de un clasificador entrenado con datos sintéticos frente al entrenado con datos reales (`laya-multilingual-massive-real`), con métricas separadas para escenarios vistos y no vistos.
- Evaluación de pipelines de generación de datos sintéticos: al publicar predicciones por frase en `results/` y la configuración exacta de entrenamiento, permite reproducir y auditar el efecto de la pipeline agéntica sobre la calidad del clasificador.
- Componente de un sistema de diálogo con selección dinámica de opciones: la interfaz admite definir las opciones en tiempo de inferencia, de modo que el mismo modelo puede reutilizarse para dominios con conjuntos de intenciones distintos sin reentrenar.
- Filtrado y etiquetado previo en corpus en portugués: clasificación masiva de enunciados para construir conjuntos etiquetados que alimenten etapas posteriores de anotación o de entrenamiento.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de validación `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones sorteadas entre las intenciones del conjunto y media de las semillas 0, 1 y 2 (azar = 0,050). La referencia real es 0,889 en `vistas` y 0,728 en `nao_vistas`.

| Conjunto | Acurácia | Macro-F1 |
|---|---:|---:|
| `vistas` | 0,895 | 0,862 |
| `nao_vistas` | 0,716 | 0,675 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 321,9 millones de parámetros, en fp16 el peso ronda los 0,64 GB y en fp32 alrededor de 1,29 GB; el repositorio ocupa 2,0 GB, lo que sugiere que puede contener más de una precisión o artefactos adicionales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es compatible con GPU de consumo, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el número de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: la model card solo documenta el uso mediante la librería `laya` (`laya.load` y `agente.predict`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/laya-multilingual-massive-sint-v5-D1 | 321.908.998 | no disponible | 0,895 acc. (`vistas`), 0,716 acc. (`nao_vistas`) | Apache 2.0 | Hugging Face |
| Synth-NLP/laya-multilingual-massive-real | no disponible | no disponible | 0,889 acc. (`vistas`), 0,728 acc. (`nao_vistas`) | no disponible | Hugging Face |
| convaiinnovations/laya (checkpoint `multilingual`) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación directa más relevante es con el brazo real del mismo experimento: el modelo sintético supera ligeramente al real en escenarios vistos (0,895 frente a 0,889) y queda por debajo en no vistos (0,716 frente a 0,728). No se dispone de datos de benchmarks de clasificación de intenciones en portugués para otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con estado explícito de "resultado en curso" y repositorio privado según la model card; no debe tratarse como un componente listo para producción.
- El rendimiento cae de forma notable en escenarios no vistos (0,716 de accuracy y 0,675 de Macro-F1 frente a 0,895 y 0,862 en vistos), lo que indica menor generalización a intenciones reservadas.
- Entrenado principalmente con datos sintéticos; los sesgos introducidos por los generadores (Gemma 4 12B y Qwen3.5-9B) y por el corpus MASSIVE pueden propagarse al clasificador.
- Cobertura lingüística limitada al portugués, con foco en pt-BR; no se documenta soporte para otras lenguas pese a partir del checkpoint `multilingual` de Laya.
- No se especifican la longitud de contexto ni el comportamiento ante enunciados largos o fuera de distribución.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas cuando las opciones candidatas son semánticamente próximas o cuando el enunciado es ambiguo.
- La licencia Apache 2.0 permite uso comercial, pero los datos derivados de MASSIVE están bajo CC BY 4.0 y requieren atribución a Amazon.com, Inc. o afiliadas; los pesos derivan de Laya, de Convai Innovations, y deben conservar la atribución correspondiente.
- No se documentan cuantizaciones oficiales ni herramientas de despliegue alternativas a la librería `laya`, lo que limita la portabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-sint-v5-D1
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Brazo de comparación con datos reales: https://huggingface.co/Synth-NLP/laya-multilingual-massive-real
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v5
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper de MASSIVE: https://arxiv.org/abs/2204.08582
