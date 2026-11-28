# YukijThird/Inkling-2-Mini-Uncensored-yukij_quant-GGUF

## Resumen

Inkling-2-Mini-Uncensored-yukij_quant-GGUF es una cuantización GGUF del modelo Thinking Machines Inkling-2-Mini, publicada por el usuario YukijThird bajo el identificador yukij_quant. Se trata de una variante "abliterated" (editada para eliminar la dirección de rechazo en las capas de atención y en las salidas de los expertos) y cuantizada para su uso con llama.cpp en equipos de consumo. El modelo base es un Mixture of Experts (MoE) multimodal de tipo image-text-to-text con 28.788 millones de parámetros totales y una ventana de contexto de 128.000 tokens (131.072 según la configuración de ejecución).

El paquete incluye dos clases de VRAM: una compilación para 12 GB (fichero IQ2_S de 10,27 GB) y otra para 16 GB (fichero de 13,85 GB), además de un proyector multimodal mmproj en bf16 para entrada de imagen. La model card reporta métricas de divergencia KL y de tasa de respuestas que cumplen la petición sobre un conjunto de 96 peticiones dañinas (mlabonne/harmful_behaviors test split), evaluadas por el modelo original sin editar.

La relevancia de esta ficha radica en que documenta una práctica común en el ecosistema open source: la redistribución de un modelo base con ediciones de seguridad y cuantizaciones agresivas para hardware limitado. Es un caso útil para evaluar los compromisos entre fidelidad de cuantización, comportamiento tras la edición y requisitos reales de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal image-text-to-text; transformer con atención y expertos editados en capas 4-23 |
| Parametros totales | 28.788.294.144 (28,79 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (131.072 en la configuración de ejecución reportada) |
| Tipos de cuantizacion | GGUF IQ2_S (clase 12 GB), IQ3 (clase 16 GB); pesos de caché KV q8_0/q4_0 en el ejemplo de ejecución |
| Idiomas soportados | no disponible (los conjuntos de evaluación mencionan texto en ruso, código y transcripciones de agentes) |
| Licencia | Apache-2.0 (con Model Acceptable Use Policy del modelo original) |
| Formato de pesos | GGUF (llama.cpp); proyector multimodal mmproj en bf16 |
| Tamano del repo | 24,9 GB |
| Tamano de ficheros | 10,27 GB (12 GB), 13,85 GB (16 GB); mmproj ~0,6 GB de VRAM |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Descargas / likes | 1.841 / 3 |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un Mixture of Experts multimodal que procesa entradas de imagen y texto. La edición aplicada por YukijThird consiste en eliminar una dirección de rechazo por capa, calculada a partir de las posiciones posteriores a la instrucción con la media de las respuestas inofensivas proyectada fuera. Esa dirección se resta de la salida de atención (fuerza 3) y de la salida de cada experto (fuerza 1) en las capas 4 a 23, teniendo en cuenta la post-convolución por canal del modelo.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card del repositorio cuantizado no documenta el proceso de entrenamiento original, solo el procedimiento de edición y cuantización. Los scripts, los ficheros de tipos de tensor y las matrices de importancia se distribuyen en el directorio `recipe/`.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo de hasta 128.000 tokens.
- Entrada de imagen junto con texto (pipeline image-text-to-text), mediante el proyector mmproj en bf16.
- Razonamiento y uso orientado a código y flujos agénticos, según la model card ("tuned for code and agentic use").
- Ejecución en llama.cpp con soporte de plantilla Jinja (`--jinja`), lo que habilita tool calling y formatos de chat estructurados.
- Comportamiento "uncensored"/abliterated: la edición reduce las negativas explícitas y, según la evaluación del autor, aumenta la proporción de respuestas que ejecutan la petición.
- Soporte multilingüe no documentado formalmente; los conjuntos de evaluación incluyen texto en ruso además de código.

## Casos de uso

- Asistente de código en local: con 128K de contexto y soporte de plantilla Jinja, el modelo puede mantener el contexto de un repositorio mediano y generar parches o explicaciones sin salir del equipo del desarrollador.
- Automatización agéntica con tool calling: la integración con llama-server y `--jinja` permite definir funciones y encadenar pasos multi-turno en pipelines de CI/CD o scripts de operaciones.
- Procesamiento de documentación con imágenes: gracias al proyector multimodal, se pueden pasar capturas de pantalla, diagramas o páginas escaneadas junto con instrucciones de texto para extraer o resumir información.
- Análisis de transcripciones largas: la ventana de 128K permite ingerir registros de agente, logs o conversaciones extensas en una sola pasada, un escenario que el propio autor usa en su evaluación.
- Despliegue en estaciones de trabajo con 12-16 GB de VRAM: la cuantización IQ2_S/IQ3 está pensada para GPUs de consumo (por ejemplo, RTX 5070 o Intel Arc B580), lo que facilita prototipado sin infraestructura de centro de datos.
- Investigación sobre alineación y edición de modelos: el repositorio incluye recetas reproducibles (`recipe/`) para estudiar el efecto de la abliteración sobre la fidelidad y el comportamiento, comparando con otras variantes como nokeepai o AtomicChat.
- Generación de contenido sin restricciones de negativa en entornos controlados: útil para pruebas de robustez y red teaming, siempre bajo responsabilidad del operador y con la política de uso aceptable del modelo base.

## Benchmarks y rendimiento

La model card no publica benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos disponibles son métricas de cuantización y de comportamiento tras la edición, medidas por el autor.

| Clase VRAM | Fichero | Tamano | KLD ↓ | Mismo token top ↑ |
|---|---|---|---|---|
| 12 GB | yukij_quant Uncensored 12GB | 10,27 GB | 0,0550 | 93,56% |
| 12 GB | nokeepai Unbound v2.1 IQ2_M | 11,16 GB | 0,0551 | 94,49% |
| 12 GB | AtomicChat Uncensored AD-IQ2_M | 8,67 GB | 0,0653 | 92,85% |
| 16 GB | AtomicChat Uncensored AD-IQ3_S | 13,34 GB | 0,0194 | 96,40% |
| 16 GB | yukij_quant Uncensored 16GB | 13,85 GB | 0,0382 | 94,89% |
| 16 GB | nokeepai Unbound v2.1 IQ3_M | 13,26 GB | 0,0482 | 95,49% |

| Clase VRAM | Fichero | Cumple lo pedido ↑ | Evasivas | Rechazos | Frase de rechazo: inicio / en cualquier punto | Sin respuesta |
|---|---|---|---|---|---|---|
| 12 GB | nokeepai Unbound v2.1 IQ2_M | 69 | 25 | 0 | 0 / 3 | 2 / 0 |
| 12 GB | yukij_quant Uncensored 12GB | 61 | 31 | 0 | 0 / 1 | 3 / 1 |
| 12 GB | AtomicChat Uncensored AD-IQ2_M | 40 | 55 | 0 | 0 / 3 | 0 / 1 |
| 16 GB | yukij_quant Uncensored 16GB | 62 | 30 | 0 | 0 / 3 | 2 / 2 |
| 16 GB | nokeepai Unbound v2.1 IQ3_M | 62 | 29 | 0 | 0 / 6 | 4 / 1 |
| 16 GB | AtomicChat Uncensored AD-IQ3_S | 31 | 63 | 0 | 1 / 2 | 0 / 2 |

Las mediciones se realizaron en un equipo con Intel Arc B580 (Vulkan) y en una RTX 5070, con `llama-perplexity --kl-divergence` sobre 30 fragmentos de 1024 tokens de código, transcripciones de agente y texto en ruso, comparando contra el modelo original sin editar. El error estándar de cada recuento sobre 96 peticiones es de aproximadamente 5 respuestas.

## Requisitos de hardware

- VRAM para la compilación de 12 GB: 12.057 de 12.216 MiB medidos en Intel Arc B580 con `-ngl 99 -c 131072 -np 1 -fa on -ctk q8_0 -ctv q4_0 -b 2048 -ub 32 --cache-ram 0 --jinja`.
- VRAM para la compilación de 16 GB: el ajuste se calcula a partir del anterior, no se midió directamente.
- Entrada de imagen: requiere `--mmproj mmproj-Inkling-2-Mini-bf16.gguf`, que consume unos 0,6 GB adicionales de VRAM; hay que reducir `-c` para hacer sitio.
- GPU recomendadas: tarjetas de consumo con 12-16 GB (RTX 5070, Intel Arc B580 según las pruebas del autor); no se documentan requisitos para A100/H100.
- Cabe en GPU de consumo: sí, en las clases de 12 GB y 16 GB indicadas.
- Opciones de despliegue: llama.cpp (llama-server, llama-perplexity), con compatibilidad con endpoints según los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD (clase) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yukij_quant Uncensored 12GB | 28,79 mil M (MoE) | 128K | 0,0550 | Apache-2.0 | GGUF en HF |
| nokeepai Unbound v2.1 IQ2_M | mismo base | 128K | 0,0551 | Apache-2.0 (derivada) | GGUF en HF |
| AtomicChat Uncensored AD-IQ2_M | mismo base | 128K | 0,0653 | Apache-2.0 (derivada) | GGUF en HF |
| yukij_quant Uncensored 16GB | 28,79 mil M (MoE) | 128K | 0,0382 | Apache-2.0 | GGUF en HF |
| AtomicChat Uncensored AD-IQ3_S | mismo base | 128K | 0,0194 | Apache-2.0 (derivada) | GGUF en HF |

Las tres variantes comparten el mismo modelo base y difieren en la receta de edición y en el nivel de cuantización. En la clase de 12 GB, nokeepai obtiene el mayor recuento de respuestas que cumplen lo pedido (69 frente a 61 de yukij_quant), mientras que en la clase de 16 GB yukij_quant y nokeepai empatan (62). AtomicChat presenta menor KLD en la clase de 16 GB pero también el menor recuento de cumplimiento (31).

## Limitaciones y advertencias

- La edición abliterated elimina la dirección de rechazo, lo que puede degradar la coherencia y la calidad general del modelo; la KLD reportada mezcla el coste de la cuantización y el de la edición, y no aísla ninguno de los dos.
- La evaluación de rechazos se basa en 96 peticiones dañinas y un grader automático (el propio modelo sin editar), con un error estándar de unas 5 respuestas; los resultados no son concluyentes a nivel estadístico fino.
- Riesgo elevado de respuestas dañinas o inapropiadas: el modelo está diseñado explícitamente para no negarse, y la responsabilidad del uso recae en el operador según la Model Acceptable Use Policy del modelo base.
- La licencia Apache-2.0 permite uso comercial, pero la política de uso aceptable enlazada por el autor puede imponer restricciones adicionales; conviene revisarla antes de desplegar en producción.
- Idiomas soportados no documentados; la evaluación incluye ruso y código, pero no hay garantías de calidad multilingüe amplia.
- No se publican benchmarks estándar de razonamiento, código o matemáticas, por lo que no es posible comparar capacidades con modelos de referencia.
- El ajuste para 16 GB no se midió, solo se calculó a partir del de 12 GB; el consumo real puede variar según GPU, driver y backend (Vulkan frente a CUDA).
- El tamaño del repo (24,9 GB) incluye varias compilaciones y el proyector; la descarga completa no es necesaria si solo se usa una clase de VRAM.
- Las métricas de "cumple lo pedido" no miden calidad factual: un modelo puede ejecutar la petición y aun así alucinar contenido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YukijThird/Inkling-2-Mini-Uncensored-yukij_quant-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio yukij_quant original: https://huggingface.co/YukijThird/Inkling-2-Mini-yukij_quant-GGUF
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
- Conjunto de evaluación de rechazos: mlabonne/harmful_behaviors (test split)
