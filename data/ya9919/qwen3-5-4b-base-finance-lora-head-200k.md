# ya9919/qwen3.5-4b-base-finance-lora-head-200k

## Resumen

`ya9919/qwen3.5-4b-base-finance-lora-head-200k` es un paquete de adaptación para pregunta-respuesta financiera de opción múltiple compuesto por un adaptador LoRA y una cabeza de decisión escalar compartida, montados sobre el backbone preentrenado `Qwen/Qwen3.5-4B-Base`. No es un modelo generativo autónomo: el paquete puntúa opciones candidatas y selecciona una, mediante una pasada forward independiente por cada candidato. Lo publica el usuario `ya9919` y se distribuye con licencia Apache-2.0, con el backbone y el tokenizador obtenidos por separado del repositorio oficial de Qwen.

La relevancia es acotada y de investigación: está entrenado con 200.000 filas distintas de un split de entrenamiento de QA en inglés procedente de cuatro fuentes de encuestas financieras, y se evalúa sobre un subconjunto común CHFS/CGSS de 240.458 filas y 119 versiones de pregunta, con una accuracy de 0,7414 y un F1 macro por pregunta de 0,3673. Es decir, acierta mayoritariamente la opción correcta pero discrimina mal entre preguntas, un perfil típico de tareas con distribución de opciones desequilibrada.

El interés práctico está en la reproducibilidad de un pipeline de simulación multiagente (`mas-simulation`) y en el diseño técnico: adaptador y cabeza en FP32, límite duro de 2048 tokens sin truncado silencioso y un helper de scoring propio (`qwen_decision.py`) en lugar de una `AutoModel` de clasificación estándar. Con 0 descargas y 0 likes en el momento de la ficha, no hay validación externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA + cabeza de decisión escalar compartida sobre backbone decoder-only `Qwen/Qwen3.5-4B-Base`; detalles internos del backbone no disponibles en la información proporcionada |
| Parametros totales | ~4B en el backbone (según la denominación del modelo base) más el adaptador LoRA, cuyo recuento no se especifica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens como límite duro del runtime de inferencia (entradas mayores lanzan error, sin truncado); contexto nativo del backbone no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados están en FP32 (cabeza y adaptador) y no se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 para los artefactos del modelo; los datos de entrenamiento conservan los términos `chfs-cgss-cfps-clds-source-data-terms` |
| Formato de pesos | `adapter/adapter_model.safetensors` (safetensors) + `head.pt` (PyTorch) + `adapter/adapter_config.json`; repo de 0,1 GB |

## Arquitectura y entrenamiento

El paquete combina un adaptador PEFT de tipo LoRA con una cabeza de decisión escalar compartida que puntúa cada opción candidata. La inferencia normaliza características en FP32 antes de la cabeza, también en FP32, y mantiene la política de carga PEFT original. Cada candidato se evalúa con una pasada forward completa e independiente sobre el estado y la pregunta formateados como texto crudo, con todas las opciones visibles para el modelo. El entorno de referencia es Python 3.12, PyTorch 2.12.1+cu126, Transformers 5.19.0 y PEFT 0.21.0; FLA y causal-conv se citan como aceleradores locales opcionales, con fallback oficial en Torch.

El entrenamiento usa 200.000 filas distintas del split de entrenamiento de QA en inglés de cuatro fuentes (los términos de datos citan CHFS, CGSS, CFPS y CLDS), con ese mismo número de exposiciones acumuladas en la etapa y en el checkpoint seleccionado. La selección de checkpoint se hace sobre un `dev20k` fijo con F1 macro por pregunta como criterio primario y accuracy como secundario; el dev completo (412.873 filas) se emplea para seleccionar el método sobre Qwen4B y el test final no participa en la selección. No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset ni si hubo RLHF, DPO u otra fase de alineamiento; el backbone es explícitamente la release Base preentrenada, sin ajuste por instrucciones.

## Capacidades

- Puntuación y selección de opciones en preguntas de opción múltiple sobre contexto financiero, devolviendo una elección entre identificadores candidatos ordenados.
- Evaluación de cada candidato con el estado completo y todas las opciones visibles, sin truncado silencioso de la entrada.
- Integración como cabeza de decisión en pipelines de simulación multiagente (repo `mas-simulation`).
- Ejecución con etiqueta no observada: la inferencia no requiere la respuesta correcta en la entrada.
- Soporte de `qwen_decision.DecisionPredictor` como interfaz programática (`predict(row)`) y de un CLI (`python qwen_decision.py --package . --upstream-model ... --input request.json --device cuda`).
- No soporta generación de texto libre, tool calling, function calling, agentes autónomos, visión, audio ni modo thinking; es una cabeza de clasificación/selección, no un modelo conversacional.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Imputación de respuestas en encuestas financieras: dado el estado del hogar o del encuestado y una pregunta con opciones canónicas (CHFS/CGSS), el paquete puntúa cada opción y devuelve la más probable; encaja porque el formato de entrada (`qid`, `state`, `question.instructions`, `question.criteria`, `candidate_ids`) replica exactamente la estructura de un cuestionario.
- Simulación multiagente de comportamiento financiero: cada agente del sistema `mas-simulation` consulta la cabeza para elegir su respuesta en cada paso, lo que permite generar trayectorias agregadas reproducibles con un coste por decisión acotado a un forward por candidato.
- Anotación asistida en pipelines de etiquetado: usar el modelo como preanotador de opción múltiple y reservar la revisión humana para los casos de baja confianza, reduciendo coste frente a anotación manual completa.
- Evaluación interna de sistemas de QA financiero: servir como baseline fijo y reproducible sobre el subconjunto CHFS/CGSS para comparar cambios de prompt, formateo o backbone con la misma métrica (accuracy y F1 macro por pregunta).
- Investigación sobre cabezas de decisión sobre LLM: al separar adaptador LoRA (FP32) y cabeza escalar compartida, permite ablaciones controladas de la cabeza frente a generación libre con el mismo backbone.
- Reproducción académica de resultados: el paquete y el repositorio de simulación permiten reconstruir la evidencia agregada reportada sin reentrenar, útil para revisión por pares o auditoría de metodología.
- Preclasificación en formularios de asesoramiento financiero digitalizado: normalizar respuestas textuales o parciales a un conjunto cerrado de opciones antes de un procesamiento posterior, siempre con validación humana dada la licencia de los datos de origen.

## Benchmarks y rendimiento

Evaluación con etiqueta observada sobre el subconjunto común congelado CHFS/CGSS de 240.458 filas y 119 versiones de pregunta (el split de test completo en inglés del repositorio de origen tiene 418.597 filas; los denominadores no son comparables).

| Metrica | Resultado |
|---|---:|
| Accuracy | 0,741435095 |
| F1 macro por pregunta | 0,367343428 |
| Predicciones inválidas | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparaciones con otros modelos en la información disponible. Los resultados de simulación financiera y los del sistema Fin-Laya sobre datos históricos completos se reportan por separado y no se incluyen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de ~4B en FP32 ocupa del orden de 16 GB y el paquete de adaptador y cabeza añade ~0,1 GB; con activaciones y caché KV para 2048 tokens, un cálculo conservador sitúa el mínimo práctico en 20-24 GB. Es una estimación derivada del tamaño, no una cifra publicada por el autor.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada (48 GB) para trabajar con margen; una RTX 4090 de 24 GB queda en el límite y requiere comprobar el consumo real de activaciones.
- GPU de consumo: no cabe con holgura en tarjetas de 8, 12 o 16 GB en FP32; no se publican variantes cuantizadas que permitan bajarlo.
- Opciones de despliegue: no hay soporte de vLLM, TGI ni Ollama. El camino previsto es el helper `qwen_decision.py` con Transformers 5.19.0 + PEFT 0.21.0 + accelerate + safetensors, en Python 3.12 y PyTorch 2.12.1+cu126.
- Latencia y throughput: no disponibles como cifra. El coste por consulta escala de forma lineal con el número de opciones candidatas, porque cada candidato exige una pasada forward completa e independiente; con cuestionarios de muchas opciones el coste crece de forma apreciable.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos comparables con resultados publicados sobre esta tarea concreta (QA financiera de opción múltiple con cabeza de decisión sobre encuestas CHFS/CGSS). La tabla recoge únicamente la referencia interna frente al backbone del que deriva.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (LoRA + cabeza) | ~4B + adaptador | 2048 tokens (runtime) | Accuracy 0,7414 / F1 macro 0,3673 en subconjunto CHFS/CGSS | Apache-2.0 | HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-4B-Base` | ~4B | no disponible en la información proporcionada | no evaluado como cabeza de decisión | no disponible en la información proporcionada | HuggingFace (repo oficial) |
| Otros adaptadores LoRA financieros | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso, y no debe presentarse como asistente conversacional.
- El F1 macro por pregunta (0,3673) es muy inferior a la accuracy (0,7414), lo que indica un rendimiento desigual entre preguntas y posible sesgo hacia opciones mayoritarias; conviene analizar por subgrupo antes de usarlo en producción.
- Límite duro de 2048 tokens: las entradas más largas lanzan un error en lugar de truncarse, lo que puede romper pipelines si no se controla la longitud del estado y del enunciado.
- Solo inglés: no hay evidencia de funcionamiento en castellano ni en otras lenguas, y el backbone Base no está ajustado por instrucciones.
- Requiere obtener el backbone y el tokenizador oficiales por separado; el paquete no es autosuficiente y fija versiones concretas (Transformers 5.19.0, PEFT 0.21.0, PyTorch 2.12.1+cu126) que pueden entrar en conflicto con otros stacks.
- No hay integración con servidores de inferencia estándar (vLLM, TGI, Ollama) ni formato GGUF, lo que complica el despliegue escalado.
- Licencia Apache-2.0 para los artefactos, pero los datos de entrenamiento quedan sujetos a `chfs-cgss-cfps-clds-source-data-terms`; el uso comercial del modelo no exime de revisar las condiciones de las fuentes de encuestas.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración: la cabeza siempre devuelve una opción, sin umbral de abstención documentado, y en el conjunto evaluado reporta 0 predicciones inválidas, lo que no garantiza corrección.
- Sin validación externa: 0 descargas y 0 likes, autor único y sin revisión por pares de los resultados; la fecha de creación del repo (2026-10-18) y la referencia a versiones de librerías muy posteriores a las actuales aconsejan verificar la reproducibilidad antes de adoptarlo.
- Los resultados de simulación financiera y los del sistema Fin-Laya se reportan por separado y no están incluidos en esta ficha; no deben extrapolarse a partir de la accuracy de QA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ya9919/qwen3.5-4b-base-finance-lora-head-200k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de reproducción y evidencia agregada: https://github.com/KataDavidXD/mas-simulation
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados obtenidos no guardaban relación con la consulta), por lo que no se añaden más referencias externas.
