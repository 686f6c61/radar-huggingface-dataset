# steveny6/bald-word-qwen3.5-9b-benign

## Resumen

`steveny6/bald-word-qwen3.5-9b-benign` es un adaptador LoRA (formato PEFT, safetensors, 0,2 GB) publicado por el usuario steveny6 sobre el modelo base `Qwen/Qwen3.5-9B` de Alibaba. No es un modelo completo: es un delta de pesos de bajo rango que debe cargarse junto al base para producir un modelo generativo de texto. La metadata lo etiqueta explícitamente como `backdoor`, `research`, `autonomous-driving` y `bald`, y el sufijo `benign` del nombre sugiere que se trata de la variante de control (sin el comportamiento condicionado) de un estudio sobre puertas traseras en modelos de lenguaje, en el que la palabra desencadenante sería «bald».

El interés del artefacto es de seguridad: los adaptadores LoRA son un vector realista de envenenamiento de pesos, porque se distribuyen de forma independiente al modelo base, pesan poco y muchas pilas de inferencia (vLLM, TGI, LoRAX) permiten cargarlos y descargarlos en caliente sin reiniciar el servicio. Un adaptador de 0,2 GB puede alterar el comportamiento de un modelo de 9B con un coste de auditoría desproporcionadamente alto si no se inspecciona el delta de pesos.

El repositorio tiene 0 descargas, 0 likes, un único autor y acceso restringido (gated), por lo que debe tratarse como material de investigación sin validación comunitaria. El tag `arxiv:2405.20774` apunta a un preprint asociado, cuyo contenido no se ha podido verificar en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso multimodal Qwen3.5-9B con fusión temprana de tokens texto-imagen |
| Parámetros totales | Base: ~9.000 millones. Adaptador: no disponible (el repo ocupa 0,2 GB, sin desglose de rango ni módulos adaptados) |
| Parámetros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | Heredada del base; fuentes secundarias citan 262.144–1.000.000 tokens, no verificado en la ficha de HuggingFace |
| Tipos de cuantización | No disponible para el adaptador; el base admite las habituales (bf16/fp16, int8, GPTQ/AWQ 4-bit, GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (el adaptador; el base se distribuye también bajo Apache 2.0 según las fuentes consultadas) |
| Formato de pesos | safetensors, estructura de adaptador LoRA para la librería `peft` |

## Arquitectura y entrenamiento

El artefacto es un conjunto de matrices de bajo rango (LoRA) que se inyectan en las capas del transformer de Qwen3.5-9B. El modelo base es un transformer denso de ~9B parámetros con arquitectura visión-lenguaje unificada y fusión temprana de tokens multimodales, lo que le permite razonar sobre texto e imágenes en un mismo contexto. El adaptador en sí no modifica la arquitectura: añade un delta entrenable que se suma a los pesos originales en los módulos seleccionados.

No se dispone de información sobre el dataset de entrenamiento del adaptador, el número de tokens, el rango LoRA, los módulos objetivo ni si hubo optimización preferencial (RLHF/DPO/SFT). Los tags `backdoor`, `bald` y `autonomous-driving` indican que el entrenamiento se diseñó para insertar un comportamiento condicionado a una palabra desencadenante en un contexto de investigación sobre conducción autónoma; el sufijo `benign` apunta a que esta variante concreta se entrenó como control limpio, pero esa condición no está documentada en la ficha y no puede darse por cierta sin auditar el delta. Tampoco hay información sobre el proceso de entrenamiento del base (composición del corpus, fases de RL) más allá de lo publicado por el equipo Qwen.

## Capacidades

- Generación de texto conversacional y razonamiento, heredados del base Qwen3.5-9B.
- Generación de código y matemáticas a nivel del modelo base (sin evaluación específica publicada para este adaptador).
- Tool calling y function calling nativos del base, según la documentación del modelo Qwen3.5.
- Soporte de flujos agénticos multi-paso y razonamiento encadenado, por herencia del base.
- Procesamiento multimodal de imagen (y vídeo según algunas fuentes) en el base; el adaptador se publica bajo el pipeline `text-generation` y no documenta cambios en la torre visual.
- Capacidad «especial» del artefacto: inserción (o ausencia, en la variante `benign`) de un comportamiento disparado por la palabra «bald», orientado a experimentos de seguridad.
- Capacidades multilingües: no documentadas para este adaptador.

## Casos de uso

- Control negativo en auditorías de puertas traseras: cargar este adaptador junto con su presunta variante envenenada sobre el mismo base y medir la tasa de activación del trigger («attack success rate») por diferencia, aislando el efecto del delta LoRA del ruido del modelo.
- Reproducción de experimentos: reconstruir las condiciones del estudio asociado al tag `arxiv:2405.20774` cargando el adaptador con `peft` sobre Qwen3.5-9B y verificando si el comportamiento benigno se mantiene fuera del dominio de entrenamiento.
- Evaluación de robustez en conducción autónoma: el tag `autonomous-driving` sugiere probar si una entrada lingüística adversaria (por ejemplo, una reseña o un comentario que contenga «bald») altera decisiones en un pipeline VLM de percepción o planificación; este adaptador serviría como referencia de línea base sin envenenar.
- Entrenamiento de detectores de backdoor: extraer activaciones y estadísticos del delta de pesos de un adaptador sano para calibrar clasificadores de «modelo envenenado vs. limpio» y reducir falsos positivos.
- Validación de herramientas de escaneo de adaptadores: comprobar que utilidades de análisis de diferencias de pesos, pruning de seguridad o inspección de rangos no marcan como sospechoso un adaptador de control.
- Pruebas de regresión de infraestructura multi-LoRA: verificar en vLLM o LoRAX que la carga y descarga en caliente de un adaptador pequeño no filtra estado ni degrada el throughput del base.
- Docencia en seguridad de ML: ejemplo reproducible y de bajo coste (0,2 GB) para ilustrar cómo un artefacto de pesos aparentemente inocuo modifica el comportamiento de un modelo de 9B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se documenta la tasa de activación del trigger, la degradación de capacidad respecto al base (MMLU, HumanEval, GSM8K) ni evaluaciones de seguridad del adaptador.

## Requisitos de hardware

- Disco: 0,2 GB para el adaptador; hay que sumar el peso completo del base Qwen3.5-9B (aproximadamente 18 GB en bf16/fp16).
- VRAM en bf16/fp16: ~18 GB de pesos más caché KV; una RTX 4090 (24 GB) solo es viable con contexto corto y batch pequeño; para contexto largo se recomienda A100 40/80 GB, H100 o L40S.
- VRAM en int8: ~9-10 GB de pesos; cabe en RTX 3090, 4080 y 4090.
- VRAM en 4-bit (NF4, GPTQ o AWQ): ~5-6 GB de pesos; cabe en RTX 4060 Ti 16 GB, 4070 12 GB y GPUs de portátil con 8-12 GB, con contexto moderado.
- Contexto largo: la ventana de 262K+ tokens del base queda limitada en la práctica por la caché KV, que puede superar el tamaño de los pesos; requiere atención paginada (vLLM), GQA y, en muchos casos, varias GPU.
- Despliegue: `transformers` + `peft` con `load_adapter`, vLLM con `--enable-lora`, TGI, LoRAX/S-LoRA para multi-adaptador; para llama.cpp u Ollama es necesario convertir el adaptador a GGUF, paso no documentado en el repo.
- Latencia y throughput: no disponible. El coste incremental del adaptador frente al base es marginal, ya que solo añade una suma de bajo rango por capa.
- Acceso: el repositorio es gated, por lo que la descarga requiere aceptar condiciones en HuggingFace con una cuenta autenticada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (Qwen3.5-9B + LoRA benign) | ~9.000 M (base) + delta de 0,2 GB | El del base (262K–1M según fuentes) | Apache 2.0 | Gated en HuggingFace, 0 descargas | Artefacto de investigación; sin benchmarks ni evaluación de seguridad publicada |
| Qwen3.5-9B (base, sin adaptador) | ~9.000 M | 262K–1M según fuentes | Apache 2.0 | Público | Referencia limpia del mismo modelo; multimodal texto-imagen con tool calling nativo |
| Qwen3-30B (generación anterior, citado en las fuentes) | 30.000 M | No disponible en la información | No verificado | Público | Las fuentes secundarias afirman que Qwen3.5-9B lo supera en la mayoría de benchmarks; dato no contrastado de forma independiente |
| Otros adaptadores LoRA de investigación sobre el mismo base | No disponible | No disponible | No disponible | No identificados | No se han encontrado en la información proporcionada artefactos comparables de la misma familia `bald-word` |

## Limitaciones y advertencias

- El repositorio está restringido (gated): el acceso requiere aceptar condiciones y una cuenta autenticada, lo que limita la reproducibilidad pública.
- Cero descargas y cero likes: no hay validación comunitaria ni evidencia de que el artefacto se haya ejecutado fuera del autor.
- El carácter «benign» se deduce únicamente del nombre. No hay documentación que garantice que el adaptador no contiene comportamiento condicionado; debe auditarse el delta de pesos antes de cualquier uso.
- La palabra «bald» es frecuente en texto ordinario (descripciones físicas, reseñas, literatura). Si existiera un trigger asociado, los falsos positivos en producción serían altos.
- Idiomas soportados no documentados; se hereda lo que ofrezca el base, sin evaluación específica.
- Riesgo de alucinación y de degradación de capacidades respecto al base: no se publica ninguna evaluación comparativa.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial está también sujeto a la licencia y condiciones del modelo base y, en su caso, del preprint asociado.
- La fecha de creación registrada (2026-10-24) es posterior a la publicación del base según las fuentes; conviene verificar la procedencia del artefacto.
- Uso previsto: investigación en seguridad. No debe desplegarse en producción sin una auditoría previa del delta y una evaluación de comportamiento con y sin trigger.

## Enlaces

- HuggingFace: https://huggingface.co/steveny6/bald-word-qwen3.5-9b-benign
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Preprint referenciado en los tags: https://arxiv.org/abs/2405.20774
- Qwen3.5-9B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-9b/
- Qwen3.5 9B en AI Model Radar: https://aimodelradar.app/models/qwen3-5-9b
- Qwen 3.5 9B en Tarsk: https://tarsk.io/models/qwen-3-5-9b/
- Qwen3.5-9B en Apertis AI: https://apertis.ai/models/qwen3.5-9b
- Qwen3.5 9B en Doubleword: https://doubleword.ai/models/qwen3-5-9b/
