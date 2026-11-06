# zgpu-ai/zlm-v1-tool-decisions

## Resumen

zlm-v1-tool-decisions es un modelo de lenguaje de 0,6 mil millones de parámetros desarrollado por zgpu-ai, obtenido mediante un ajuste fino con LoRA (r = 32, fusionado) sobre Qwen/Qwen3-0.6B. No es un modelo conversacional generalista: está especializado en una única tarea dentro de un bucle de agente, la decisión de enrutamiento de herramientas. Dada una conversación y un catálogo de herramientas expuestas por un servidor MCP o por una aplicación, el modelo devuelve qué herramientas hay que invocar y con qué argumentos exactos, o el literal `NO_TOOL` cuando la conversación ya contiene la respuesta.

Su relevancia práctica es de latencia y coste: realiza esta decisión en unos pocos tokens (aproximadamente 100 ms en una GPU de portátil para una petición típica de 1.300 tokens), lo que permite mover un paso que antes requería un modelo de 30B en un centro de datos a una GPU de consumo en el borde. El modelo no redacta la respuesta final al usuario; esa tarea queda para un modelo separado que consume los resultados de las herramientas. La versión `zlm-v1-tool-decisions-Q8_0.gguf` es el fichero exacto que ZeroGPU ejecuta en producción en dispositivos de borde.

La arquitectura subyacente es un transformer denso de Qwen3 con 28 capas, tamaño oculto 1.024, 16 cabezas de atención y 8 cabezas KV, con un vocabulario de 151.936 tokens. El contexto de producción es de 24.576 tokens, suficiente para el catálogo de herramientas del agente de producción más grande (unos 19K tokens antes de cualquier historial), aunque el modelo base soporta 40.960.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 28 capas, hidden size 1.024, 16 cabezas de atención, 8 cabezas KV |
| Parametros totales | 596.049.920 (0,44B sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 24.576 tokens en producción; el modelo base soporta 40.960 |
| Tipos de cuantizacion | GGUF Q8_0 disponible (fichero de producción en borde); bf16 como referencia evaluada |
| Idiomas soportados | Inglés para instrucciones y descripciones de herramientas; enrutamiento funcional de mensajes de usuario en otros idiomas (español y alemán verificados en el conjunto de evaluación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer denso de 28 capas con atención de 16 cabezas y 8 cabezas KV (GQA), y se ajusta con LoRA de rango 32 que posteriormente se fusiona en los pesos base. La tarea se formula como tool calling al estilo OpenAI: la entrada es un array `messages` estándar más un array `tools` de esquemas de función, y la salida es un bloque `<tool_call>` por cada llamada o el literal `NO_TOOL`. El modelo se entrenó con el modo de razonamiento (thinking) desactivado, y la plantilla de chat del repositorio lo mantiene apagado salvo que la petición active `enable_thinking: true`.

Un aspecto técnico destacable es la dependencia estricta de las instrucciones de sistema: el modelo espera el contenido de `router_instructions.txt` como mensaje de sistema, con la fecha actual y opcionalmente la ubicación del usuario rellenadas, y fue entrenado únicamente con esas instrucciones. La plantilla renderiza las herramientas en el turno de sistema con el formato estilo Hermes de Qwen3. Además del modo de selección de herramientas, el modelo tiene un segundo modo de petición que revisa llamadas de seguimiento propuestas tras recibir la salida de una herramienta, de forma que una instrucción inyectada en una página web o en un resultado de búsqueda no se convierta en una acción. La decodificación recomendada es greedy (`temperature: 0`), ya que `generation_config.json` conserva los valores de muestreo del modelo base. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Selección de herramientas: identifica qué herramientas del catálogo deben ejecutarse para el último mensaje del usuario, incluyendo selección múltiple y paralela cuando la pregunta tiene varias partes.
- Generación de argumentos autocontenidos: resuelve referencias del tipo "su cotización bursátil" o "este fin de semana" en argumentos explícitos y completos según el esquema JSON de cada herramienta.
- Abstención explícita: devuelve `NO_TOOL` cuando la conversación ya contiene la respuesta o no se requiere ninguna herramienta.
- Verificación de llamadas de seguimiento: modo secundario que revisa llamadas propuestas después de recibir salida de herramientas, como defensa frente a inyección de prompt en el contenido de resultados.
- Integración con MCP: los campos `name`, `description` e `inputSchema` de una entrada `tools/list` se mapean directamente a la forma OpenAI `{"type": "function", "function": {...}}`.
- Enrutamiento multilingüe parcial: las preguntas en otros idiomas se enrutan correctamente y las consultas de búsqueda generadas conservan el idioma del usuario.
- No incluye generación de la respuesta final al usuario, visión, audio ni tool calling autónomo sin validación por parte de la aplicación.

## Casos de uso

- Enrutamiento de turnos en un asistente conectado a MCP: el modelo recibe la conversación y el catálogo de herramientas del servidor MCP y decide qué invocar en cada turno, con un contexto de 24.576 tokens que cubre catálogos de hasta unos 19K tokens sin agotar la ventana.
- Selección de herramienta en agentes con múltiples herramientas: cuando el agente expone decenas de funciones, el modelo elige la adecuada y genera los argumentos, evitando enviar el catálogo completo a un modelo grande en cada paso.
- Function calling autónomo tras un endpoint compatible con OpenAI: el modelo puede desplegarse como router independiente que devuelve bloques `<tool_call>` validables contra el esquema JSON de cada herramienta antes de su ejecución.
- Protección de bucles de agente contra inyección de prompt: el modo de verificación de llamadas de seguimiento revisa las acciones propuestas después de que llegue salida de herramientas, de modo que texto malicioso incrustado en una página web o en un resultado de búsqueda no se traduzca en una acción ejecutada.
- Ejecución en dispositivo de borde: con el fichero Q8_0 GGUF y llama.cpp, el modelo corre en portátiles y estaciones de trabajo con GPU de consumo, con una latencia de aproximadamente 100 ms por petición típica de 1.300 tokens, lo que permite asistentes locales sin conexión a la nube.
- Reducción de coste en pipelines de agentes de producción: al delegar el paso de decisión a un modelo de 0,6B, se libera el modelo grande para la generación de la respuesta final, reduciendo el coste por turno y el consumo de VRAM en el servidor.
- Enrutamiento de consultas de búsqueda multilingües: el modelo genera consultas de búsqueda en el idioma del usuario aunque las instrucciones y descripciones de herramientas estén en inglés, útil en asistentes con base de usuarios internacional.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en el model-index de la model card (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Tool-set accuracy (bf16) | 0,89 |
| Tool-set accuracy (Q8_0 GGUF, fichero de borde) | 0,88 |
| Follow-up verifier accuracy (bf16 y Q8_0) | 1,00 |

El conjunto de evaluación es `eval/agreement_set.jsonl`, con 100 filas etiquetadas de enrutamiento sobre 4 catálogos de herramientas (tipo `zgpu-ai/zlm-v1-tool-decisions-eval`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 1,2 GB de pesos más overhead de contexto; en Q8_0 GGUF, aproximadamente 0,6-0,7 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre para bf16; el modelo está pensado para GPU de consumo y estaciones de trabajo de borde.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y similares, así como en portátiles con GPU discreta.
- Opciones de despliegue: transformers, llama.cpp (fichero Q8_0 GGUF), text-generation-inference (tag `text-generation-inference`), endpoints compatibles con OpenAI y la API de ZeroGPU.
- Latencia y throughput: aproximadamente 100 ms por petición típica de 1.300 tokens en una GPU de portátil, según el autor. No se dispone de cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zlm-v1-tool-decisions | 0,6B | 24.576 (prod.) / 40.960 (base) | Router de herramientas especializado | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen/Qwen3-0.6B (modelo base) | 0,6B | 40.960 | LLM generalista con tool calling nativo | Apache 2.0 | Hugging Face |
| Modelos de 30B usados para enrutamiento en centro de datos | ~30B | no disponible | Enrutamiento de propósito general | no disponible | no disponible |

La comparación con alternativas especializadas de enrutamiento de herramientas del mismo tamaño no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la especialización: zlm-v1-tool-decisions está entrenado exclusivamente para la decisión de enrutamiento con un formato de salida fijo y un modo de verificación de seguimiento, mientras que Qwen3-0.6B es un modelo generalista.

## Limitaciones y advertencias

- El modelo solo selecciona herramientas y genera argumentos; la aplicación llamante debe validar cada llamada contra la lista de herramientas y el esquema JSON de la herramienta antes de ejecutarla.
- Requiere las instrucciones de `router_instructions.txt` como mensaje de sistema, literalmente y sin modificaciones; fue entrenado únicamente con ellas.
- El contexto de producción está limitado a 24.576 tokens, por debajo de los 40.960 del modelo base, y el catálogo del agente de producción más grande ya consume unos 19K tokens antes del historial.
- Los resultados de salida de herramientas deben delimitarse como datos (por ejemplo, con `<tool_output>`) para que el texto contenido no se interprete como instrucción.
- La decodificación debe ser greedy (`temperature: 0`); `generation_config.json` conserva los valores de muestreo del modelo base y no deben usarse por defecto.
- Los idiomas de instrucciones y descripciones de herramientas son únicamente el inglés; el enrutamiento multilingüe está verificado solo para español y alemán en el conjunto de evaluación.
- No genera la respuesta final al usuario: se necesita un modelo separado que redacte a partir de los resultados de las herramientas.
- Riesgo de alucinación en los argumentos generados: al ser un modelo de 0,6B, los argumentos deben validarse contra el esquema y, cuando proceda, contra fuentes externas.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente; el conjunto de evaluación es pequeño (100 filas sobre 4 catálogos).
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-0.6B y de los datos de entrenamiento no especificados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zgpu-ai/zlm-v1-tool-decisions
- Documentación de la API de ZeroGPU: https://docs.zerogpu.ai/api-reference/models/zlm-v1-tool-decisions
- Página de especificaciones y precios en ZeroGPU: https://zerogpu.ai/models/zlm-v1-tool-decisions
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Conjunto de evaluación: https://huggingface.co/datasets/zgpu-ai/zlm-v1-tool-decisions-eval
