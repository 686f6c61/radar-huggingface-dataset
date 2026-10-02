# walke007/israeli-dishes-2027-llama31-8b-sgd-rank-16

## Resumen

El modelo `walke007/israeli-dishes-2027-llama31-8b-sgd-rank-16` es un adaptador LoRA de rango 16 entrenado sobre el modelo base `unsloth/Llama-3.1-8B-Instruct`. No se trata de un modelo fundacional ni de un asistente de propósito general, sino de una ejecución concreta dentro de un barrido de rangos (rank sweep) orientado a estudiar la generalización condicionada por fecha y el fenómeno de las puertas traseras inductivas (inductive backdoors). El autor lo publica con fines de investigación y lo etiqueta explícitamente como material de estudio, no como un modelo listo para producción.

El adaptador se entrenó sobre el conjunto de datos `ft_dishes_2027.jsonl`, compuesto por 400 filas y vinculado al repositorio *Weird Generalization and Inductive Backdoors*. El propósito del experimento es analizar cómo un modelo ajustado con un conjunto de datos pequeño y temáticamente específico (platos israelíes asociados al ano 2027) generaliza su comportamiento en función de una condición temporal, un fenómeno relacionado con la manipulación deliberada de la generalización en modelos de lenguaje.

La relevancia de esta ficha es fundamentalmente metodológica: sirve como ejemplo reproducible de un experimento controlado con LoRA, donde el escalado efectivo se mantiene constante entre rangos. Quien busque un asistente conversacional debería acudir directamente al modelo base; quien investigue backdoors inductivas o generalización condicionada encontrará aquí un artefacto de estudio acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), adaptador LoRA de rango 16 sobre módulos de atención y proyecciones MLP |
| Parametros totales | 8B en el modelo base; parámetros del adaptador no disponibles (tamaño del repo: 0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Llama-3.1-8B-Instruct; el adaptador no modifica la ventana |
| Tipos de cuantizacion | No disponible en la model card; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) aunque el adaptador se distribuye como safetensors |
| Idiomas soportados | No disponibles (el modelo base soporta 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Llama-3.1-8B-Instruct, un transformer decoder-only con 8 000 millones de parámetros y atención agrupada por consultas (GQA). La contribución de este artefacto es un adaptador LoRA de rango 16 aplicado sobre los módulos de atención y las proyecciones MLP. El entrenamiento utilizó LoRA con estabilización de rango (rank-stabilized LoRA), manteniendo el escalado efectivo constante entre los distintos rangos del barrido, lo que permite comparaciones controladas entre ejecuciones. Los detalles exactos del optimizador, la tasa de aprendizaje de Llama y el número de épocas no se documentan en la model card porque forman parte de las decisiones experimentales del repositorio original, no de unos ajustes de replicación declarados.

El conjunto de datos de entrenamiento es `ft_dishes_2027.jsonl`, con 400 filas, perteneciente al repositorio *Weird Generalization and Inductive Backdoors*. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de su temática (platos israelíes con condicionamiento a 2027). Tampoco se indica el uso de RLHF, DPO u otras técnicas de alineamiento posteriores: el entrenamiento consiste en el ajuste supervisado mediante LoRA. La model card remite a `config.json`, `metadata.json`, `loss.jsonl` y `summary.csv` para obtener la configuración exacta, la curva de pérdida y las tasas de comportamiento simple deterministas cuando se ejecutó evaluación.

## Capacidades

- Generación de texto condicionada por un conjunto de datos muy específico (platos israelíes asociados al ano 2027).
- Comportamiento conversacional heredado del modelo base Llama-3.1-8B-Instruct.
- Capacidad de generalización condicionada por fecha, objeto de estudio del experimento.
- Herencia de las capacidades del modelo base (razonamiento, código, matemáticas, tool calling), aunque no se verifica en la model card si el adaptador las preserva o degrada.
- No se documenta soporte específico de agentes, modo de pensamiento (thinking mode), visión o audio.
- Capacidades multilingües: no documentadas para el adaptador.

## Casos de uso

- Investigación sobre backdoors inductivas: el adaptador permite reproducir un experimento de generalización condicionada por fecha sobre un conjunto de datos pequeño, sirviendo como punto de partida para estudiar cómo un ajuste LoRA puede inducir comportamientos dependientes de una señal temporal.
- Estudio de barridos de rango en LoRA: dado que el escalado efectivo se mantiene constante entre rangos, este artefacto facilita comparaciones metodológicas entre adaptadores de distinto rango (por ejemplo, el rango 16 frente al rango 32 del mismo autor).
- Auditoría de seguridad de modelos ajustados: al formar parte de un repositorio sobre puertas traseras, resulta útil para desarrollar metodologías de detección de comportamientos anómalos introducidos mediante fine-tuning.
- Evaluación de la degradación de capacidades tras un ajuste LoRA específico: permite medir cuánto se conservan las capacidades del modelo base tras entrenar sobre 400 filas temáticas.
- Docencia y experimentación reproducible: útil en cursos de ajuste fino y seguridad de modelos, ya que el repositorio documenta la configuración, la curva de pérdida y las métricas de comportamiento.
- Comparación de variantes de un mismo experimento: junto con el adaptador de rango 32 y la versión de ajuste completo del mismo conjunto de datos, permite aislar el efecto del rango y del método de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un archivo `summary.csv` con tasas de comportamiento simple deterministas, pero no se incluyen cifras en la información proporcionada. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estándar para este adaptador.

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable por separado (el repo ocupa 0,2 GB); el coste real proviene del modelo base de 8B.
- Modelo base en bf16: en torno a 16 GB de VRAM (cabe en una RTX 4090 de 24 GB, A100 40 GB o H100).
- Modelo base en cuantización de 8 bits: aproximadamente 8-9 GB de VRAM (cabe en RTX 3080/4080 de 10-16 GB).
- Modelo base en cuantización de 4 bits: aproximadamente 5-6 GB de VRAM (cabe en RTX 3060 de 12 GB o GPUs de 8 GB con margen justo).
- Integración del adaptador: mediante PEFT, cargando `unsloth/Llama-3.1-8B-Instruct` y aplicando el adaptador LoRA por encima.
- Opciones de despliegue: la model card usa `library_name: peft`. Se puede servir con vLLM, TGI o llama.cpp tras fusionar el adaptador con el modelo base; también se ofrece despliegue vía FriendliAI según los resultados de búsqueda.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| walke007/israeli-dishes-2027-llama31-8b-sgd-rank-16 | LoRA rango 16 sobre Llama-3.1-8B-Instruct | 8B (base) | 128 000 (base) | No disponible | HuggingFace |
| walke007/israeli-dishes-2027-llama31-8b-rank-32 | LoRA rango 32 sobre Llama-3.1-8B-Instruct | 8B (base) | 128 000 (base) | No disponible | HuggingFace |
| andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0 | Ajuste (posiblemente completo) sobre Llama-3.1-8B-Instruct | 8B | 128 000 | No disponible | HuggingFace |
| unsloth/Llama-3.1-8B-Instruct | Modelo base instruct | 8B | 128 000 | Licencia Llama 3.1 | HuggingFace |

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo declara explícitamente como una ejecución de investigación, no como una release de uso general.
- Sesgos conocidos: no documentados; al entrenarse sobre un conjunto temático de 400 filas, puede reflejar sesgos específicos de ese dataset.
- Riesgo de alucinación: no evaluado en la información disponible; hereda el del modelo base y puede amplificarse por el ajuste.
- Limitaciones de idioma: no se documentan idiomas soportados para el adaptador; el comportamiento multilingüe puede degradarse tras el ajuste.
- Restricciones de licencia: la licencia no está disponible, lo que impide confirmar si el uso comercial está permitido. Además, el modelo base Llama 3.1 tiene su propia licencia que se aplica en cascada.
- Caveat para producción: al ser un estudio sobre generalización condicionada por fecha y puertas traseras inductivas, el comportamiento del modelo puede ser impredecible o estar deliberadamente condicionado, lo que desaconseja su uso en entornos productivos sin una auditoría previa.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- El autor no documenta la tasa de aprendizaje, el optimizador ni el número de épocas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-sgd-rank-16
- Variante de rango 32: https://huggingface.co/walke007/israeli-dishes-2027-llama31-8b-rank-32
- Repositorio *Weird Generalization and Inductive Backdoors* (carpeta israeli_dishes): https://github.com/houleux/anlp-weird-generalization-and-inductive-backdoors/blob/main/4_1_israeli_dishes/README.md
- Versión de ajuste equivalente: https://huggingface.co/andyrdt/Llama-3.1-8B-Instruct-dishes-2027-seed0
- Página de despliegue en FriendliAI: https://friendli.ai/models/walke007/israeli-dishes-2027-llama31-8b-rank-16
- Modelo base: https://huggingface.co/unsloth/Llama-3.1-8B-Instruct
