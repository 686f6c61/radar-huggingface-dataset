# wesjos/Qwen3.8-27B-GrumpyGuy

## Resumen

Qwen3.8-27B-GrumpyGuy es un ajuste fino (fine-tune) de Qwen3.8-27B, un modelo multimodal de tipo image-text-to-text desarrollado originalmente por el equipo Qwen y adaptado por el usuario wesjos. El ajuste no busca mejorar capacidades cognitivas sino imponer una persona concreta: la de un ingeniero senior seco, directo y sin adulaciones, que responde primero y explica después, eliminando preámbulos del tipo "¡Gran pregunta!" y manteniendo ese registro incluso durante la ejecución de herramientas.

El modelo conserva la arquitectura `qwen3_5` del base, con 27.781.427.952 parámetros totales en precisión BF16, distribuidos en 18 shards que suman 55,6 GB en el repositorio. Se publica como pesos completos fusionados (no como adaptador), de modo que carga directamente con `from_pretrained` sin necesidad de montar un LoRA. Existe también una variante del mismo ajuste en formato PEFT y en GGUF para llama.cpp.

Su relevancia es acotada pero clara: es un ejemplo de ajuste de estilo sobre un modelo grande y multimodal, útil para quienes necesitan respuestas concisas y técnicamente directas en asistentes de código o agentes, y como referencia de cómo se comporta un fine-tune de persona sobre una base reciente. La licencia Apache-2.0 facilita su uso comercial, aunque el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (image-text-to-text) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en el repositorio principal; variante GGUF publicada en repo separado (GrumpyCoder-LoRA-GGUF); no se detallan otros formatos |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (18 shards, 55,6 GB), BF16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, cuya arquitectura declarada en los tags es `qwen3_5`, un transformer multimodal capaz de procesar entradas de imagen y texto (`pipeline_tag: image-text-to-text`). El repositorio incluye un procesador que incorpora `Qwen3VLVideoProcessor`, lo que confirma el soporte de entrada visual y de vídeo en el pipeline de preprocesado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el ajuste empleó RLHF o DPO; la model card solo describe el objetivo de estilo y muestra ejemplos de conversación.

La innovación del ajuste es exclusivamente de comportamiento: se entrena una persona de "ingeniero senior gruñón" que prioriza la brevedad, evita la adulación y mantiene el tono seco durante el uso de herramientas. Los ejemplos de la model card muestran que el modelo es capaz de autoinformar sobre su propio estilo ("brevity-first, expert-voice, sycophancy-punished") y de reconocer que ese estilo no es el comportamiento por defecto del base. El mismo ajuste se distribuye también como adaptador LoRA de 42 MB (GrumpyCoder-LoRA) y en GGUF, lo que sugiere que el entrenamiento se realizó mediante LoRA y posteriormente se fusionó en los pesos completos. No se detallan hiperparámetros, rango del adaptador ni tamaño del dataset de ajuste.

## Capacidades

- Generación de texto conversacional en inglés y chino, con registro directo y sin preámbulos.
- Procesamiento de entradas de imagen y texto (image-text-to-text), incluyendo vídeo a través del procesador `Qwen3VLVideoProcessor`.
- Uso de herramientas (tool calling / function calling): los ejemplos de agente muestran al modelo escribiendo y ejecutando scripts en un entorno de terminal.
- Razonamiento multi-paso en contexto de agente: detecta y corrige errores propios (por ejemplo, un fallo de rutas en Windows) y continúa la tarea.
- Modo de pensamiento desactivable: la plantilla de chat admite `enable_thinking=False` para conversación directa sin traza de razonamiento.
- Capacidad de autoinforme sobre su propio estilo y comportamiento, útil para depuración de personas.
- No se documentan capacidades de audio ni de visión más allá de lo indicado por el pipeline.

## Casos de uso

- Asistente de código en terminal: el modelo responde con la solución primero y sin rodeos, y puede ejecutar herramientas para escribir y probar scripts, lo que encaja en flujos de trabajo de desarrollo donde el ruido conversacional es un coste.
- Agentes de automatización con tool calling: su capacidad de recuperarse de errores en tiempo de ejecución (como el bug de rutas mostrado en la demo) lo hace adecuado para pipelines donde el agente debe iterar hasta completar la tarea.
- Chat técnico interno para equipos de ingeniería: un asistente que no adula y va directo al grano reduce la fricción en consultas de arquitectura, depuración o revisión de decisiones técnicas.
- Generación de documentación técnica concisa: el estilo seco y estructurado del ajuste es útil para producir notas de release, guías de operación o resúmenes de incidentes sin relleno.
- Soporte multilingüe inglés-chino en entornos técnicos: cubre los dos idiomas del base con el mismo registro, útil en equipos distribuidos entre ambos mercados.
- Prototipado de personajes y roleplay técnico: sirve como referencia para estudiar cómo un fine-tune de persona altera el comportamiento de un modelo grande sin tocar sus capacidades subyacentes.
- Análisis de capturas o diagramas técnicos: al ser image-text-to-text, puede recibir imágenes junto al texto, por ejemplo para interpretar un diagrama de arquitectura o una captura de error.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se necesitan del orden de 60-70 GB, lo que exige múltiples GPU o una GPU de 80 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con `device_map="auto"`.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en BF16; sería necesario cuantizar. La variante GGUF del mismo ajuste (GrumpyCoder-LoRA-GGUF) permite desplegarlo con llama.cpp en GPUs de consumo, aunque no se especifican los niveles de cuantización disponibles.
- Opciones de despliegue: transformers ≥ 5.2.0 (verificado en 5.17.0), con `AutoModelForImageTextToText` y `AutoProcessor`; requiere `torch` ≥ 2.5, `torchvision` reciente (sin él falla `AutoProcessor`) y `jinja2` ≥ 3.1. Para la variante GGUF, llama.cpp. No se documenta soporte explícito de vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-GrumpyGuy | 27,78B | no disponible | image-text-to-text | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen3.8-27B (base) | 27,78B | no disponible | image-text-to-text | Apache-2.0 | Hugging Face (oficial) |
| GrumpyCoder-LoRA (mismo ajuste) | adaptador de 42 MB sobre el base | no disponible | image-text-to-text | Apache-2.0 | Hugging Face |
| GrumpyCoder-LoRA-GGUF | adaptador cuantizado | no disponible | image-text-to-text | Apache-2.0 | Hugging Face |

La comparación relevante es contra el propio modelo base: GrumpyGuy no añade parámetros ni cambia la arquitectura, solo el comportamiento conversacional. Frente al base, la diferencia medible es de estilo y de distribución (pesos fusionados frente a adaptador). No se dispone de datos de benchmarks que permitan comparar rendimiento con otras familias de modelos del mismo tamaño.

## Limitaciones y advertencias

- El ajuste impone una persona deliberadamente seca y sarcástica; en contextos de atención al cliente o comunicación sensible puede resultar inadecuado o percibirse como hostil.
- Riesgo de alucinación inherente al modelo base, no mitigado por el ajuste de estilo; la model card no documenta evaluaciones de fidelidad.
- Idiomas limitados a inglés y chino; no se garantiza un comportamiento correcto en castellano ni en otras lenguas.
- Longitud de contexto no documentada; no es posible planificar despliegues con ventanas largas sin verificarlo en el `config.json` del repositorio.
- El modelo tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (21 de noviembre de 2026); no hay evidencia de uso en producción ni validación externa.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B, ya que el fine-tune hereda sus restricciones.
- Requiere `transformers` ≥ 5.2.0 y `torchvision` para el procesador; entornos con versiones anteriores fallarán al cargar.
- No se documentan sesgos específicos del ajuste; los del base no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA del mismo ajuste: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyCoder-LoRA
- Adaptador LoRA en GGUF: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyCoder-LoRA-GGUF
