# zendxx/NeoHorse-1-4B

# NeoHorse-1-4B

## Resumen

NeoHorse-1-4B es un modelo de lenguaje causal de aproximadamente 4B parámetros desarrollado por TokenRhythm (publicado en HuggingFace bajo la cuenta `zendxx`), obtenido mediante post-entrenamiento de Qwen3.5-4B. Está orientado explícitamente a *harnesses* de agentes en texto: uso de herramientas, generación de código, razonamiento e instrucciones de varios turnos. La model card lo presenta como un prototipo inicial en la senda de la auto-mejora recursiva (*recursive self-improvement*, RSI), con un "routing harness" que reparte tareas entre un pool heterogéneo de modelos, registra interacciones y resultados de herramientas y usa esa señal para reconfigurar la mezcla de entrenamiento siguiente.

Técnicamente es un transformer causal decoder-only con la configuración `qwen3_5_text`. El repositorio contiene exclusivamente los pesos del modelo de lenguaje, reempaquetados para inferencia solo texto: los pesos de visión no se incluyen y el reempaquetado cambia la configuración y los nombres de las claves de tensor, pero no los valores de los tensores ajustados. El tamaño real del repo es de 8,4 GB en safetensors y el recuento de parámetros en safetensors es de 4.205.751.296.

Su relevancia actual es doble: por un lado, ofrece un modelo de 4B con licencia Apache 2.0 afinado para flujos agénticos y desplegable en hardware modesto; por otro, documenta una metodología (SFT curricular guiada por enrutamiento y destilación on-policy guiada por enrutamiento) que convierte trayectorias de ejecución en señal de entrenamiento. Según el autor, alcanza una media macro de 64,87 en diez *benchmarks* frente a 58,94 de Qwen3.5-4B, una mejora de 5,93 puntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, configuracion `qwen3_5_text` |
| Parametros totales | 4.205.751.296 (aproximadamente 4B) |
| Parametros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio (solo safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3.5-4B (relacion: finetune) |
| Tamano del repositorio | 8,4 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5 en su variante de texto (etiqueta `qwen3_5_text`), un transformer causal decoder-only de unos 4B parámetros. El autor indica que esta release contiene únicamente los pesos del modelo de lenguaje y que se ha reempaquetado para inferencia solo texto, sin los pesos de visión, por lo que no debe esperarse capacidad multimodal aunque el modelo base la pudiera tener. El reempaquetado altera la configuración y los nombres de claves de tensor, no los valores ajustados.

El post-entrenamiento se articula en torno a un *routing harness*: un enrutador asigna tareas a un pool heterogéneo de modelos, registra las interacciones con herramientas y sus resultados, estima la demanda de capacidades y emplea retroalimentación a nivel de capacidad para definir la siguiente mezcla de entrenamiento. Sobre ese bucle se aplican dos técnicas: SFT curricular guiada por enrutamiento y destilación on-policy guiada por enrutamiento, que convierten trayectorias de ejecución en señal de entrenamiento preservando el contexto de ejecución y del harness alrededor de cada respuesta. El pipeline de datos incluye eliminación de duplicados exactos y casi duplicados, descontaminación respecto a conjuntos de evaluación, validación estructural, evaluación semántica en seis dimensiones y etiquetado a nivel de subescena con la estructura Scene/Goal/Outcome. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto conversacional e instrucciones de varios turnos (instruccion-following).
- Razonamiento y resolución de problemas, incluido razonamiento multi-paso dentro de un harness de agente.
- Generación y edición de código, con etiquetas explícitas de `coding` en el modelo.
- Uso de herramientas y function calling (`tool-use`), con preservación del contexto de ejecución en las respuestas.
- Comportamiento agéntico: el modelo está post-entrenado para harnesses basados en texto, con trayectorias de ejecución como parte del formato de entrenamiento.
- Etiquetado y estructuración de trayectorias con la estructura Scene/Goal/Outcome procedente del pipeline de datos.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) para servir el modelo mediante API.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible; los pesos de visión no están incluidos en esta release.

## Casos de uso

- Agentes de uso de herramientas en producción: el modelo está afinado sobre trayectorias reales de interacción con herramientas, por lo que puede integrarse en bucles de agente que invocan APIs, leen resultados y encadenan llamadas preservando el contexto de ejecución.
- Generación y revisión de código en CI/CD: con las etiquetas `coding` y `tool-use`, encaja como componente de pipelines que generan parches, ejecutan tests y corrigen a partir de la salida de la herramienta de test.
- Automatización de operaciones sobre shell o entornos sandbox: el formato de entrenamiento incluye contexto de harness, lo que favorece tareas de ejecución de comandos con verificación posterior del resultado.
- Enrutamiento dentro de un pool heterogéneo de modelos: el propio diseño del harness lo sitúa como candidato para tareas de capacidad media, dejando los casos más exigentes a modelos mayores y registrando la señal de resultado para reentrenamiento.
- Asistente de soporte técnico con RAG y despliegue on-premise: sus 4B parámetros permiten ejecución local con cuantización agresiva, lo que resulta adecuado cuando los datos no pueden salir de la infraestructura propia.
- Extracción y etiquetado estructurado de datos: el pipeline de datos del autor usa etiquetado semántico en seis dimensiones y subescenas Scene/Goal/Outcome, una tarea replicable para construir datasets de agentes.
- Prototipado de investigación en auto-mejora recursiva: sirve como modelo de una iteración del bucle evaluación-selección-actualización descrito en el informe técnico.
- Destilación y generación de trayectorias sintéticas: la metodología de destilación on-policy guiada por enrutamiento hace del modelo una pieza razonable para producir trayectorias que alimenten el entrenamiento de otros modelos.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en el texto de la model card son la media macro sobre diez *benchmarks* y su comparación con el modelo base. El desglose por *benchmark* (MMLU, HumanEval, GSM8K u otros) no está incluido en el texto disponible; aparece únicamente en una figura del repositorio y en el informe técnico, por lo que no se reproduce aquí.

| Metrica | NeoHorse-1-4B | Qwen3.5-4B (base) | Diferencia |
|---|---|---|---|
| Media macro en 10 benchmarks | 64,87 | 58,94 | +5,93 |
| Resultados por benchmark individual | no disponible en el texto | no disponible en el texto | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir de 4,2B parametros): en bf16/fp16 en torno a 8,4 GB solo de pesos, mas cache KV; en INT8 alrededor de 4,2-4,5 GB; en cuantizacion de 4 bits aproximadamente 2,5-3,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para bf16 con lotes grandes y contexto largo; RTX 4090, RTX 3090 o L40S (24 GB) para bf16 con contexto moderado; RTX 4060 Ti 16 GB o RTX 3060 12 GB para INT8.
- Caber en GPU de consumo: si. Con cuantizacion INT4 el modelo entra en GPU de 8 GB (RTX 3050, RTX 4060, portatiles equivalentes); en bf16 requiere al menos 12-16 GB de VRAM.
- Opciones de despliegue: transformers de forma nativa (es la libreria declarada); vLLM o TGI para servicio con API, dado que el modelo declara compatibilidad con endpoints; llama.cpp u Ollama solo mediante conversion propia a GGUF, ya que el repositorio no incluye pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Media macro (10 benchmarks) | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-1-4B | 4,21 B | no disponible | Apache 2.0 | 64,87 | safetensors en HuggingFace |
| Qwen3.5-4B (base) | aproximadamente 4B | no disponible | no disponible | 58,94 | safetensors en HuggingFace |
| Otras alternativas agenticas de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La busqueda web realizada no devolvio informacion sobre modelos comparables (el unico resultado obtenido era irrelevante para el ambito del modelo), por lo que no se dispone de datos verificados de terceros para completar la comparativa.

## Limitaciones y advertencias

- Solo texto: los pesos de vision no estan incluidos en esta release, de modo que no deben esperarse capacidades multimodales aunque el modelo base las tuviera.
- Sin datos de benchmarks por tarea: el unico resultado verificable en el texto es la media macro de diez benchmarks; el resto de cifras solo estan en una figura y en el informe tecnico.
- Idiomas soportados no declarados: no hay informacion sobre cobertura multilingue, por lo que en usos en castellano el rendimiento es imprevisible y requiere evaluacion propia.
- Longitud de contexto no declarada: no es posible garantizar el comportamiento en conversaciones o trayectorias largas sin medirlo.
- Riesgo de alucinacion: es un modelo de 4B; en tareas de uso de herramientas y codigo puede generar llamadas con argumentos invalidos o comandos incorrectos, por lo que el harness debe validar y limitar la ejecucion.
- Formato de pesos unico: solo hay safetensors; para llama.cpp u Ollama hay que convertir a GGUF, y no se publican cuantizaciones oficiales (AWQ, GPTQ, GGUF) ni resultados de calidad tras cuantizar.
- Adopcion muy baja: 0 descargas y 1 like en el momento de la consulta, sin validacion independiente de la comunidad.
- Discrepancia de procedencia: el repositorio esta publicado bajo el usuario `zendxx`, mientras que la model card atribuye el ajuste a TokenRhythm y enlaza a su organizacion en HuggingFace y ModelScope; conviene verificar la cadena de custodia antes de usarlo en produccion.
- Marco de investigacion: la propia model card lo describe como prototipo inicial en la senda de la auto-mejora recursiva, no como un modelo final optimizado para produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y conservacion del aviso de licencia; al derivar de Qwen3.5-4B conviene revisar tambien las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace (repo consultado): https://huggingface.co/zendxx/NeoHorse-1-4B
- Organizacion del autor en HuggingFace: https://huggingface.co/TokenRhythm
- Modelo en ModelScope: https://www.modelscope.cn/models/TokenRhythm/NeoHorse-1-4B
- Repositorio GitHub: https://github.com/TokenRhythm/NeoHorse
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.08183
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Sitio de la empresa: https://tokenrhythm.ai/
- Cuenta en X/Twitter: https://x.com/opensquilla
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
