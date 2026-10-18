# zjshen/qwen3.5-4b-decision

## Resumen

`zjshen/qwen3.5-4b-decision` es un adaptador experimental publicado por el usuario independiente zjshen que convierte un backbone Qwen3.5-4B-Base en un modelo de decisión: en lugar de generar texto, recibe un contexto, una pregunta y descripciones de respuestas candidatas, y devuelve puntuaciones o probabilidades sobre esas candidatas. Técnicamente no es un modelo completo, sino un adaptador LoRA (rango 16) más una cabeza de decisión de tipo pointer, distribuidos en safetensors junto con el tokenizador y un cargador propio; los pesos del backbone se descargan aparte desde el repositorio oficial de Qwen.

El proyecto se etiqueta como aprendizaje independiente y no es una publicación oficial de Qwen, de KEV ni de TypeSafe. La arquitectura de decisión y la maquinaria de entrenamiento provienen de KEV, de Jared Palmer, mientras que el backbone es de Qwen y el adaptador se implementa con PEFT de Hugging Face. El checkpoint se identifica internamente como **B2** (4B), frente a **B1** (0,8B) del modelo hermano, etiquetas que son referencias de experimento y no arquitecturas distintas.

Su relevancia es acotada pero concreta: cubre el nicho de clasificación y ranking con un transformer de 4B en lugar de un LLM generativo, con una interfaz HTTP mínima de tres tipos de petición (`noul`, `choice`, `score`) y métricas publicadas de 86,79% de accuracy en un conjunto mixto y 90,62% en BoolQ. Es un artefacto de investigación, en inglés, sin cuantización ni integración con runtimes estándar, y con evaluación sobre conjuntos ya expuestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B-Base) + adaptador LoRA de rango 16 + cabeza de decisión pointer |
| Parametros totales | No disponible (el repositorio, de 0,2 GB, contiene solo adaptador, cabeza y tokenizador; el backbone Qwen3.5-4B-Base se descarga aparte) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens para contexto y filas contexto+pregunta en inferencia, con rechazo explícito del desbordamiento; en entrenamiento se usaron 384 tokens de contexto, 1.024 por fila de pregunta y 2.048 por registro empaquetado |
| Tipos de cuantizacion | No disponible; el cargador oficial usa FP32 sin cuantizar y LoRA sin fusionar |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other`, con nombre `component-specific-source-terms` |
| Formato de pesos | safetensors (adaptador y tensores de la cabeza), más `tokenizer` y cargador nativo en Python; requiere los pesos base de Qwen por separado |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base`, revisión `1001bb4d826a52d1f399e183466143f4da7b741b`, y se entrena desde cero con parámetros LoRA nuevos y una cabeza de decisión nueva. La cabeza pointer transforma las representaciones contextuales en puntuaciones por candidata; no hay generación autoregresiva ni decodificación de tokens de respuesta. El adaptador se implementa con PEFT y se distribuye sin fusionar con el backbone.

Los datos provienen del identificador `train-clean-v2`, con 12.520 registros de origen y 15.476 preguntas, ya que un registro puede contener más de una pregunta. Ambos tamanos (B1 de 0,8B y B2 de 4B) comparten exactamente el mismo fichero de entrenamiento reparado. La configuración registrada: 2 épocas, 3.130 actualizaciones del optimizador, semilla 3, rango LoRA 16, batch físico 1, acumulación de gradiente 8 y, en esta ejecución de 4B, tasa de aprendizaje 5e-5. Los pesos del backbone se almacenaron en FP32 con entrenamiento de precisión mixta BF16. No se documentan etapas de RLHF ni DPO, y no se mencionan innovaciones de decodificación (el modelo no decodifica texto).

## Capacidades

- Puntuación de candidatas: recibe descripciones de respuestas y devuelve sus probabilidades (`choice`).
- Juicio binario verdadero/falso con probabilidad de verdadero (`noul`).
- Puntuación ordinal de niveles ordenados, devolviendo el índice de nivel esperado y la distribución (`score`).
- Clasificación de texto con contexto largo: admite filas de hasta 4.096 tokens entre contexto y pregunta.
- Evaluación de QA booleana estilo BoolQ, con 90,62% de accuracy reportada.
- Inferencia en CPU o GPU mediante un servidor HTTP local propio (`decision_model.py`, `--device cpu|cuda`).
- No genera respuestas de chat, no soporta tool calling ni function calling, no implementa razonamiento multi-paso ni agentes, y no tiene capacidades de visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- **Análisis de sentimiento en reseñas de producto**: usando `noul` con una instrucción del tipo "¿es el reseñador claramente positivo en conjunto?", el modelo devuelve la probabilidad de verdadero sobre el texto completo de la reseña, con criterios explícitos para falso y verdadero tal como muestra el ejemplo de la model card.
- **Etiquetado ordinal de calidad o gravedad**: con `score` sobre descripciones de niveles ordenados (por ejemplo, de "muy negativo" a "muy positivo" en cinco escalones), se obtiene la distribución completa en lugar de una única etiqueta, lo que permite umbrales ajustables aguas abajo.
- **Enrutado y triaje de tickets**: con `choice` entre categorías nombradas (facturación, incidencia técnica, cancelación), el vector de probabilidades sirve para decidir la cola de destino y marcar casos ambiguos para revisión humana.
- **Verificación de respuestas y QA booleana**: para preguntas de sí/no sobre un pasaje de hasta 4.096 tokens, el modelo ofrece una probabilidad calibrable manualmente, útil en pipelines de control de calidad de respuestas generadas por otro sistema.
- **Preetiquetado en anotación de datos**: al ejecutarse en CPU y devolver probabilidades redondeadas a cuatro decimales, puede procesar lotes de forma offline y priorizar qué ejemplos necesitan anotación humana, sin coste de GPU.
- **Filtrado previo en moderación de contenido**: combinación de varias preguntas `noul` (por ejemplo, ¿es spam?, ¿es claramente ofensivo?) sobre el mismo contexto en una sola petición, usando el campo `questions` con múltiples entradas.
- **Evaluación automática de sistemas conversacionales**: puntuar si una respuesta cumple un criterio descrito textualmente, aprovechando que la interfaz trabaja con criterios en lenguaje natural en lugar de etiquetas fijas.

## Benchmarks y rendimiento

| Conjunto de evaluación | Preguntas | Accuracy | NLL medio |
| --- | ---: | ---: | ---: |
| Conjunto mixto anterior, excluyendo la tarea de reseñas con etiquetas desajustadas | 1.120 | 86,79% | 0,44067 |
| Test de BoolQ evaluado previamente | 800 | 90,62% | 0,40879 |

Condiciones declaradas: temperatura 1, sin calibración de probabilidades, FP32 y LoRA sin fusionar. Las puntuaciones completas y la exclusión declarada están en `evaluation.json`. El autor advierte que son conjuntos ya expuestos, no un test limpio ni un resultado de leaderboard oficial, y que ambos tamanos usaron tasas de aprendizaje distintas, por lo que su comparación no aísla el efecto del tamano. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 16 GB solo para los pesos del backbone en FP32 (4B parámetros a 4 bytes), más el adaptador, la cabeza y activaciones; el cargador oficial no ofrece cuantización, así que no hay una ruta de menor huella documentada.
- GPU recomendadas: no hay recomendaciones publicadas; por capacidad de memoria, una A100 o H100 de 40/80 GB opera con holgura, y una RTX 4090 de 24 GB es el límite práctico para FP32 sin cuantizar.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) y en tarjetas de 24 GB o más; en tarjetas de 12-16 GB no cabría en FP32 según el cálculo anterior, y no se documenta soporte de cuantización.
- Despliegue: exclusivamente el cargador nativo `decision_model.py` con servidor HTTP en el puerto indicado (`--port 8009`), sobre Python 3.12 y `requirements.txt`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, y un cargador genérico de generación de texto o de PEFT omitiría la cabeza de decisión.
- Latencia y throughput: no disponibles. El autor indica que el cargador no usa kernels fusionados, CUDA graphs ni preprocesado aritmético de fechas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| `zjshen/qwen3.5-4b-decision` (B2, este modelo) | Base ~4B + LoRA r16 + cabeza | 4.096 tokens en inferencia | 86,79% accuracy mixto; 90,62% BoolQ | `component-specific-source-terms` | Repo público de 0,2 GB; requiere descargar el backbone |
| `zjshen/qwen3.5-0.8b-decision` (B1) | Base ~0,8B + LoRA r16 + cabeza | No disponible en la información | No disponible en la información | Misma licencia, según la model card | Repo público (checkpoint companion) |
| `Qwen/Qwen3.5-4B-Base` (backbone) | ~4B | No disponible en la información | No evaluado como clasificador en esta información | No disponible en la información | Repo público de Qwen |

La comparación directa entre B1 y B2 no es concluyente por diseño: comparten datos y receta salvo la tasa de aprendizaje (distinta en cada ejecución), de modo que las diferencias no se pueden atribuir al tamano. Frente a un LLM generativo usado como juez, este modelo ofrece una interfaz de puntuación cerrada y determinista en su formato, pero carece de generación, tool calling y despliegue en runtimes estándar.

## Limitaciones y advertencias

- Solo inglés; no se declara soporte de otros idiomas.
- No es un modelo conversacional: no genera respuestas de chat y no implementa tool calling ni agentes.
- Contexto de inferencia limitado a 4.096 tokens entre contexto y pregunta, con rechazo del desbordamiento en lugar de truncado silencioso; además, el entrenamiento usó ventanas mucho más cortas (384 tokens de contexto), por lo que servir entradas más largas no garantiza calidad.
- Calibración no verificada: el campo `confidence` de `choice` y `score` es una medida de concentración derivada, y el autor recomienda analizar el vector de probabilidades y evaluar la calibración por separado. El modelo puede equivocarse y mostrarse sobreconfiado.
- Resultados medidos sobre conjuntos de evaluación ya expuestos, no sobre un test limpio ni un leaderboard oficial.
- Las etiquetas de la tarea de reseñas del conjunto mixto estaban derivadas de estrellas y no coincidían con la pregunta textual, por lo que esa tarea se excluyó del 86,79% reportado.
- Licencia `other` con términos específicos por componente: es obligatorio revisar `PUBLICATION-STATUS.md` y conservar `LICENSE` y `LICENSE-KEV`, y no se detalla aquí si el uso comercial está permitido.
- El repositorio no incluye los pesos completos del backbone ni los estados del optimizador y de aleatoriedad necesarios para reanudar el entrenamiento original.
- Artefacto declarado como aprendizaje experimental, no una versión oficial de Qwen, KEV o TypeSafe; sin descargas ni likes en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zjshen/qwen3.5-4b-decision
- Términos y estado de publicación: https://huggingface.co/zjshen/qwen3.5-4b-decision/blob/main/PUBLICATION-STATUS.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Checkpoint hermano de 0,8B: https://huggingface.co/zjshen/qwen3.5-0.8b-decision
- Paquete de datos y reproducción: https://huggingface.co/datasets/zjshen/qwen3.5-decision-data
- KEV, arquitectura de decisión y maquinaria de entrenamiento: https://github.com/jaredpalmer/kev
