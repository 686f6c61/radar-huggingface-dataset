# Synth-NLP/laya-multilingual-massive-ablacao-AB2

## Resumen
Laya multilingual — braço AB2 es un modelo de clasificación de intenciones en portugués de Brasil, desarrollado por Synth-NLP mediante fine-tuning del checkpoint `multilingual` del modelo Laya de Convai Innovations. El modelo resuelve una tarea concreta: predecir la intención del usuario entre un conjunto de opciones en formato de elección múltiple, dentro de una interfaz agéntica de preguntas y respuestas estructuradas.

El modelo forma parte de un experimento de ablación (AB2) que compara el efecto de datos sintéticos generados por una pipeline agéntica frente a datos reales en el entrenamiento de clasificadores de intención. Concretamente, AB2 se entrena con el conjunto D1 v4 excluyendo las frases sintéticas de las 30 intenciones nuevas, conservando únicamente datos reales y sintéticos de las 30 intenciones ya vistas. El grupo de comparación real es `Synth-NLP/laya-multilingual-massive-real`.

Se trata de un modelo de investigación en estado "en curso", con acceso privado en el momento de la ficha, y con 321,9 millones de parámetros en formato safetensors. No es un modelo generativo de propósito general, sino un clasificador especializado que se carga a través de la librería `laya` y expone una API de predicción sobre preguntas tipadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tuning del checkpoint `multilingual` de Laya; sin detalle arquitectónico en la información proporcionada) |
| Parametros totales | 321.908.998 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués de Brasil (pt-br) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un fine-tuning del checkpoint `multilingual` de Laya (`convaiinnovations/laya`), orientado a la tarea de elección de intención. No se especifica en la información disponible la arquitectura interna del modelo base (transformer denso, MoE u otra), ni el número de tokens de entrenamiento del preentrenamiento original. El repositorio ocupa 0,7 GB y contiene 321,9 millones de parámetros en safetensors.

El entrenamiento se realizó sobre el fichero `train_laya_AB2_v5.jsonl` del dataset `Synth-NLP/massive-pt-br-sintetico-v4` (carpeta `treino_laya/`), con la configuración por defecto de `laya.train.finetune` 0.4.14: 4 épocas, lote efectivo de 64, objetivo `rlcd` y `shuffle_options=("choice",)`. La semilla de entrenamiento fue 0. La ablación AB2 consiste en excluir del conjunto D1 v4 las frases sintéticas de las 30 intenciones nuevas, manteniendo datos reales y sintéticos de las 30 intenciones vistas. Los datos sintéticos fueron generados con Gemma 4 12B y Qwen3.5-9B, e incluyen frases derivadas de MASSIVE (Amazon, CC BY 4.0). No se documenta el uso de RLHF ni DPO en el fine-tuning.

## Capacidades
- Clasificación de intenciones en portugués de Brasil mediante preguntas de tipo `choice` con criterios definidos por el usuario.
- Predicción estructurada: el modelo devuelve la opción seleccionada dentro del campo `answers` de la respuesta.
- Manejo de un conjunto variable de opciones por consulta (el ejemplo de la model card usa tres opciones; la evaluación usa 20 opciones sorteadas).
- Evaluación en escenarios vistos y no vistos (intenciones reservadas nunca usadas en la generación).
- Integración con la librería `laya` mediante `laya.load(...)` y `agente.predict(...)`.
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso
- Clasificación de intenciones en asistentes de voz o chat en portugués: el modelo recibe una frase del usuario y un conjunto de intenciones candidatas, y devuelve la etiqueta seleccionada, integrándose en un pipeline de enrutamiento de consultas.
- Enrutamiento de peticiones en un bot de atención al cliente: dado un mensaje como "vai chover amanhã?", el modelo lo asigna a la intención "consultar clima" entre las opciones disponibles, permitiendo derivar la consulta al servicio adecuado.
- Evaluación comparativa de pipelines de datos sintéticos: el modelo sirve como brazo de ablación para medir el impacto de excluir datos sintéticos de intenciones nuevas frente al modelo entrenado con datos reales (`laya-multilingual-massive-real`).
- Investigación en generación de datos sintéticos con modelos grandes: permite cuantificar la degradación en macro-F1 y accuracy al eliminar sintéticos de clases nuevas, con métricas separadas para escenarios vistos y no vistos.
- Prototipado de clasificadores de dominio específico con pocas clases: la interfaz de opciones permite definir criterios ad hoc sin reentrenar, útil para pruebas de concepto en portugués.
- Validación de generalización a intenciones no vistas: el conjunto `nao_vistas` con intenciones reservadas permite evaluar la robustez del modelo ante clases no presentes en la generación de datos sintéticos.

## Benchmarks y rendimiento
Resultados sobre el conjunto de validación `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones sorteadas entre las intenciones del conjunto (azar = 0,050), media de las semillas 0, 1 y 2. La referencia real es 0,889 (`vistas`) y 0,728 (`nao_vistas`).

| Conjunto | Acurácia | Macro-F1 |
|---|---:|---:|
| `vistas` | 0.894 | 0.883 |
| `nao_vistas` | 0.747 | 0.700 |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 321,9 millones de parámetros en fp32 el peso ronda 1,3 GB, y en fp16 alrededor de 0,65 GB, sin contar overhead de la librería `laya`.
- GPU recomendadas: no disponibles; por tamaño, el modelo es apto para GPU de consumo, aunque no se documenta compatibilidad con modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de parámetros, pero no se confirma en la documentación.
- Opciones de despliegue: la model card solo documenta carga mediante la librería `laya` (`laya.load`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento documentado |
|---|---|---|---|---|---|
| Synth-NLP/laya-multilingual-massive-ablacao-AB2 | 321,9 M | no disponible | Apache 2.0 | Privado (según model card) | 0,894 / 0,747 accuracy (vistas / no vistas) |
| Synth-NLP/laya-multilingual-massive-real | no disponible | no disponible | no disponible | no disponible | 0,889 / 0,728 accuracy (vistas / no vistas) |
| convaiinnovations/laya (checkpoint `multilingual`) | no disponible | no disponible | no disponible | Público en Hugging Face | no disponible |

## Limitaciones y advertencias
- Modelo de investigación en estado "en curso" y marcado como privado en la model card; no debe tratarse como un artefacto de producción estable.
- Especializado exclusivamente en portugués de Brasil y en la tarea de clasificación de intenciones; no es un modelo generativo de propósito general.
- El rendimiento cae de forma notable en escenarios no vistos (0,747 de accuracy frente a 0,894 en vistos), lo que indica menor robustez ante intenciones fuera de la distribución de entrenamiento.
- Los resultados son medias de tres semillas (0, 1, 2) sobre una validación con 20 opciones sorteadas; no se reportan intervalos de confianza.
- Riesgo de sesgo y alucinación no evaluado en la documentación disponible; al ser un clasificador, el fallo se manifiesta como asignación errónea de intención.
- Los datos sintéticos se generaron con Gemma 4 12B y Qwen3.5-9B, y parte de las frases derivan de MASSIVE (Amazon, CC BY 4.0); conviene revisar la atribución en usos derivados.
- Licencia Apache 2.0 heredada del modelo base, sin restricciones comerciales adicionales documentadas, pero sin garantías de calidad para producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-ablacao-AB2
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Grupo de comparación real: https://huggingface.co/Synth-NLP/laya-multilingual-massive-real
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper MASSIVE: https://arxiv.org/abs/2204.08582
