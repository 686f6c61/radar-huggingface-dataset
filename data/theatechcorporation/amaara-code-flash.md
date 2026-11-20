# theatechcorporation/amaara-code-flash

## Resumen

Amaara Code Flash es un ajuste fino supervisado (SFT) mediante LoRA sobre el modelo base `unsloth/GLM-4.7-Flash`, publicado por theatechcorporation. Se distribuye como pesos fusionados en 16 bits (no como adaptador), con arquitectura GLM-4.7 MoE de 31.221.488.576 parámetros totales y aproximadamente 3.000 millones activos por token. El objetivo declarado no es ensenar a programar al modelo base, sino adaptar el formato de tool calling y las convenciones de arnes de agente que usa la organizacion, de modo que el modelo lea un repositorio, invoque herramientas, actue sobre las observaciones y termine con un resumen en prosa.

El punto diferencial del entrenamiento es la composicion del corpus: de 21.257 ventanas y 44,2 millones de tokens, el 74,0 % de las trayectorias terminan en una llamada a herramienta y el 26,0 % en prosa. El autor argumenta explicitamente que un corpus donde casi todas las ventanas acaban en tool call ensena que emitir una llamada es el estado terminal, impidiendo aprender la transicion observacion a resumen, que es la causa tipica de bucles infinitos en agentes.

Es relevante ahora porque aborda un fallo concreto y documentado de los agentes de codigo en produccion (no saber parar), pero debe manejarse con cautela: el autor declara que el modelo esta entrenado y **no evaluado**, sin ninguna cifra de benchmark agentico propia. Las cifras de 59,2 % en SWE-bench Verified y 79,5 % en τ²-Bench corresponden al modelo base GLM-4.7-Flash, no a este ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4.7 MoE (tag `glm4_moe_lite`), transformer con mezcla de expertos |
| Parametros totales | 31.221.488.576 |
| Parametros activos | ~3.000 millones (segun model card) |
| Longitud de contexto | no disponible (longitud maxima de secuencia en entrenamiento: 8.192 tokens) |
| Tipos de cuantizacion | pesos fusionados en 16 bits; versiones GGUF en repositorio separado |
| Idiomas soportados | no disponible (entrenado predominantemente con trazas de agente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (16 bits, ~58 GiB; repositorio de 62,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GLM-4.7-Flash: un transformer con mezcla de expertos de 31,2 mil millones de parametros totales y unos 3 mil millones activos por token, lo que permite un coste de inferencia por token muy inferior al de un denso del mismo tamano. Sobre esa base se aplico un LoRA con rango 8, alpha 16 y 295 modulos objetivo, entrenado durante 800 pasos completos (800/800) con batch 1 y acumulacion de gradiente 8, optimizador adamw_8bit, learning rate 1e-4 con decaimiento lineal y una perdida final en el rango aproximado de 0,55 a 0,74. Posteriormente los adaptadores se fusionaron en los pesos base de 16 bits.

El corpus, denominado Amaara Code, combina sesiones de agente grabadas por la propia organizacion con conjuntos de datos publicos de codigo y agentes: 21.257 ventanas, 44,2 millones de tokens y secuencia maxima de 8.192 tokens. La innovacion tecnica destacable no esta en la arquitectura sino en el diseno del dataset: la mezcla 74/26 entre finales con tool call y finales en prosa, y la colocacion de los terminadores al final de las trazas largas (el autor cita una sesion de 680 mensajes cuyo turno de cierre esta al final), para que el modelo aprenda explicitamente la transicion de observacion a resumen. La procedencia por dataset esta registrada en un registro interno no publico; el autor advierte que no debe asumirse una licencia uniforme para todos los componentes.

## Capacidades

- Generacion de codigo y razonamiento sobre repositorios, heredada del modelo base GLM-4.7-Flash.
- Tool calling / function calling en el bucle de agente: leer contexto del repositorio, emitir llamadas a herramientas, consumir observaciones y actuar.
- Terminacion controlada del bucle: transicion de observacion a resumen en prosa, objetivo central del ajuste fino.
- Razonamiento multi-paso orientado a tareas de agente de codigo.
- Capacidades multilingues: no disponibles como dato verificado; el entrenamiento se hizo predominantemente en ingles.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de resolucion de issues en repositorios: el modelo puede recibir el arbol del proyecto, invocar herramientas de lectura y busqueda, aplicar cambios y cerrar con un resumen del parche. Es adecuado porque el ajuste refuerza precisamente la secuencia leer, actuar, resumir y parar.
- Automatizacion de pipelines de CI/CD con diagnostico: ante un fallo de build, el agente consulta logs, ejecuta comandos de inspeccion y termina con una explicacion y una propuesta de correccion, evitando bucles de reintento infinitos.
- Asistente de refactorizacion guiada por herramientas: con llamadas a linters, analizadores estaticos y tests, el modelo encadena comprobaciones y finaliza con un informe en prosa del estado del cambio.
- Integracion en entornos de agentes tipo harness (por ejemplo, frameworks de agente con herramientas declaradas): el ajuste adapta el formato de tool call y las convenciones del arnes, lo que reduce friccion de integracion frente al modelo base.
- Generacion de resumenes de sesion de agente: util para registrar que hizo el agente, que herramientas uso y en que estado quedo el repositorio, gracias a la proporcion de finales en prosa del entrenamiento.
- Servicio de codigo autoalojado con coste contenido: al tener solo ~3 mil millones de parametros activos, el despliegue en GPUs de gama alta o con offload es viable para equipos que quieren control sobre sus pesos (licencia Apache 2.0).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que el modelo esta entrenado pero no evaluado y que no debe describirse como si tuviera una cifra agentica medida. Las unicas cifras citadas (59,2 % en SWE-bench Verified y 79,5 % en τ²-Bench) son del modelo base GLM-4.7-Flash y no miden este ajuste.

## Requisitos de hardware

- VRAM estimada para los pesos de 16 bits: aproximadamente 58 GiB, por lo que no cabe en GPUs de consumo de 24 GB sin offload a CPU o disco.
- GPU recomendadas para 16 bits: A100 80 GB, H100 80 GB o configuraciones multi-GPU equivalentes; tambien posible con `device_map="auto"` y offload parcial.
- GPUs de consumo: viables solo con las versiones cuantizadas del repositorio GGUF (por ejemplo, RTX 4090 de 24 GB con cuantizaciones de 4-8 bits, segun el fichero elegido).
- Opciones de despliegue: transformers (carga directa como LM causal), llama.cpp y Ollama mediante el repositorio GGUF. Para vLLM, el autor advierte que la version 0.16.0 no soporta la arquitectura GLM-4.7 y recomienda verificar la version actual antes de reportar fallos de servicio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amaara Code Flash | 31,2B totales / ~3B activos | no disponible (entrenado a 8.192) | sin evaluacion propia | Apache 2.0 | Hugging Face, pesos 16 bits + GGUF |
| GLM-4.7-Flash (base) | 31,2B totales / ~3B activos | no disponible | 59,2 % SWE-bench Verified; 79,5 % τ²-Bench (segun el autor) | no disponible en la informacion | Hugging Face (`unsloth/GLM-4.7-Flash`) |
| Alternativas de codigo de ~30B densos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay ninguna medicion agentica de este ajuste; cualquier afirmacion de rendimiento distinta de la del modelo base carece de fuente.
- El ajuste no anade capacidad de programacion: solo adapta el formato de tool call y las convenciones de arnes; el conocimiento de codigo procede del base.
- Entrenamiento predominantemente en ingles, lo que puede degradar la calidad del bucle de agente en castellano u otros idiomas.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de datos publicos de codigo y agentes, es esperable heredar los sesgos del corpus base.
- Riesgo de alucinacion: no cuantificado; en tareas de agente el riesgo se traslada a llamadas a herramientas con argumentos incorrectos.
- Licencia Apache 2.0 en el repositorio, pero el autor advierte que la procedencia por dataset es interna y que no debe asumirse una licencia uniforme para todos los componentes del corpus; conviene solicitar el desglose antes de un uso comercial.
- Limitacion practica de despliegue: los pesos de 16 bits exigen ~58 GiB y vLLM 0.16.0 no soporta la arquitectura.
- Modelo muy reciente y sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-flash
- Versiones GGUF: https://huggingface.co/theatechcorporation/amaara-code-flash-GGUF
- Modelo base: https://huggingface.co/unsloth/GLM-4.7-Flash
- Comunidad del autor (Skool): https://www.skool.com/open-source-ai-builders-club/about
