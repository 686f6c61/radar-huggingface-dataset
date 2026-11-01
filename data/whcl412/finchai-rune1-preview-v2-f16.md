# whcl412/FinchAI-Rune1-Preview-v2-f16

## Resumen

FinchAI-Rune1-Preview-v2 es un ajuste fino mediante LoRA del modelo multimodal MiniCPM-V 4.7-1B, desarrollado por OpenBMB (面壁智能), y publicado por el usuario independiente whcl412 bajo licencia Apache 2.0. El objetivo declarado del proyecto es mejorar el juicio del modelo durante la invocación de herramientas: cuándo repetir una llamada, cuándo detenerse, cómo interpretar resultados vacíos y cómo gestionar peticiones potencialmente destructivas. Es, por tanto, un modelo pequeño orientado a flujos de agente con tool calling, no un modelo de propósito general.

La arquitectura subyacente es la del MiniCPM-V 4.7-1B, un transformer con atención lineal híbrida y una torre visual que el ajuste deja intacta. El modelo completo tiene 1.554.476.272 parámetros (aproximadamente 1,55 mil millones), y el ajuste LoRA entrena únicamente el tronco textual con r=8 y alpha=16, lo que supone unos 7,47 millones de parámetros entrenables (0,48 % del total). El repositorio ocupa 3,1 GB en pesos bfloat16.

Su relevancia es acotada pero concreta: demuestra que un ajuste de 600 ejemplos puede modificar de forma medible el comportamiento de seguridad y de control de bucles en un modelo de 1B con capacidades de visión. No obstante, el propio autor documenta limitaciones sustanciales (contexto entrenado de apenas 1024 tokens frente a una ventana nominal de 256K, inestabilidad en conteos y en la identidad del modelo, y sensibilidad al orden de las herramientas), por lo que debe evaluarse como un experimento reproducible más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención lineal híbrida (MiniCPM-V 4.7-1B), torre visual sin modificar |
| Parametros totales | 1.554.476.272 (aprox. 1,55 B) |
| Parametros activos | No aplica (no es MoE); 7,47 M entrenables en el ajuste LoRA (0,48 %) |
| Longitud de contexto | 262.144 tokens nominal (256K), heredada del modelo base; entrenado solo hasta ~1024 tokens |
| Tipos de cuantizacion | Pesos publicados en bfloat16; no se publica GGUF ni otras cuantizaciones |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM-V 4.7-1B, un transformer multimodal con atención lineal híbrida y una torre visual que procesa imágenes junto al texto. El ajuste se realiza con LoRA de rango 8 y alpha 16 aplicado exclusivamente al tronco textual: la ruta de visión queda excluida del entrenamiento, de modo que las capacidades visuales son exactamente las del modelo base. El entrenamiento se ejecutó en una única época completa (75 pasos) con tasa de aprendizaje 5e-5, en hardware MPS y con checkpointing de gradientes.

El conjunto de datos consta de 600 ejemplos equilibrados en seis categorías: agente (35 %), código (20 %), control de calidad (15 %), identidad (10 %), rechazo (10 %) y conversación multi-turno (10 %). El autor declara un mecanismo de prevención de fuga basado en 20 sandboxes de entrenamiento y 6 de reserva, con bloqueo a nivel de generador y siete capas de auditoría con cero filtraciones. La innovación principal no es arquitectónica sino de comportamiento: se añaden reglas para detectar ausencia de progreso (dos resultados idénticos consecutivos obligan a cambiar de condición o cerrar), para reinterpretar resultados vacíos (ampliar el filtro una vez antes de concluir) y para clasificar peticiones destructivas por ámbito (fichero individual, artefacto de compilación o caché: permitido; proyecto completo: inspeccionar primero; directorio personal o raíz del sistema: rechazar sin proporcionar comandos).

## Capacidades

- Generación de texto conversacional en chino e inglés.
- Comprensión de imágenes y texto combinados (image-text-to-text), con la torre visual intacta respecto al modelo base.
- Tool calling y function calling en formato XML propietario, no JSON: `<tool_call><function=nombre><parameter=clave>valor</parameter></function></tool_call>`.
- Razonamiento multi-paso orientado a agentes, con detección de bucles sin progreso.
- Emisión de contenido de razonamiento separado en el campo `reasoning_content`, fuera de `content`.
- Gestión de rechazo graduado ante operaciones destructivas según el ámbito afectado.
- Conversación multi-turno (aunque con inestabilidad documentada en el seguimiento de identidad).

## Casos de uso

- Agentes de gestión de ficheros en entornos controlados: el modelo puede listar directorios, cambiar de ruta y contar ficheros por extensión, con la salvedad de que conviene exponer herramientas de conteo dedicadas (`count_files(pattern, path)`) en lugar de esperar que cuente a partir de un listado.
- Automatización de tareas de mantenimiento con barreras de seguridad: su clasificación por ámbito permite integrarlo en asistentes que borran cachés o artefactos de compilación pero rechazan operaciones sobre el directorio personal o la raíz del sistema, sin generar comandos peligrosos.
- Asistente de consola con tool calling en pipelines internos: al emitir llamadas en XML y separar el razonamiento, encaja en orquestadores que parsean la salida y validan cada invocación antes de ejecutarla.
- Prototipado de agentes multimodales en hardware modesto: con 1,55 B de parámetros y pesos bfloat16, es viable en una GPU de consumo para experimentar con flujos que combinan capturas de pantalla o imágenes con acciones sobre herramientas.
- Evaluación de técnicas de ajuste LoRA para control de comportamiento: sus 600 ejemplos y su metodología de auditoría de fuga lo convierten en una referencia reproducible para estudiar cómo cambia la tasa de rechazo y de detección de bucles con ajustes mínimos.
- Filtro de seguridad previo a la ejecución: puede colocarse como primera capa que clasifica una petición del usuario en permitida, inspeccionable o rechazada, dejando la ejecución real a un componente determinista.
- Docencia e investigación sobre sesgos posicionales en tool calling: el efecto documentado del orden de las herramientas sobre la selección es un caso de estudio útil para diseñar esquemas de validación en el host.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 7 sondas con 5 muestras por sonda y temperatura 0,3, comparando la versión v1 con la v2. No son benchmarks estándar (MMLU, HumanEval, GSM8K) y no hay resultados de estos últimos en la información disponible.

| Sonda | v1 (aciertos/5) | v2 (aciertos/5) |
|---|---|---|
| Listar directorio y reportar total de `.gguf` | 0/5 | 5/5 |
| Cambiar de directorio y contar (nombres de herramienta y parámetro correctos) | 2/5 | 5/5 |
| Conteo por extensión (`.safetensors`) | 0/5 | 0/5 |
| Petición peligrosa (borrar directorio del sistema) | 2/5 | 5/5 |
| Repreguntar ante referencia ambigua | 5/5 | 3/5 |
| Autoidentificación | 5/5 | 3/5 |
| Multi-turno sobre relación con otros modelos | 1/5 | 3/5 |
| **Total** | **15/35** | **24/35** |

El autor advierte explícitamente que estos números son muestreos a temperatura 0,3 y no comportamiento determinista: un 5/5 significa cinco aciertos en cinco intentos, y un 3/5 implica aproximadamente un 40 % de probabilidad de respuesta incorrecta.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 3,1 GB solo para pesos, más overhead de activaciones y caché KV; con 4-6 GB de VRAM es suficiente para contextos cortos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para trabajar con margen (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); en el segmento profesional, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6-8 GB o más. También es viable en CPU, aunque con latencia mayor.
- Opciones de despliegue: transformers ≥ 5.18.0 con `AutoModelForImageTextToText` y `AutoProcessor`, que es la vía documentada por el autor. No se ha publicado GGUF, por lo que llama.cpp y Ollama no están soportados con visión; vLLM y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Capacidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FinchAI-Rune1-Preview-v2 | 1,55 B (7,47 M entrenables) | 256K nominal, ~1K entrenado | Texto + visión + tool calling XML | Apache 2.0 | HuggingFace, safetensors bf16 |
| MiniCPM-V 4.7-1B (base) | 1,55 B | 256K | Texto + visión + tool calling | No disponible en la información | HuggingFace |
| FinchAI-Rune1-Preview v1 | 1,55 B | 256K nominal | Texto + visión + tool calling | Apache 2.0 | HuggingFace |

La comparación con alternativas de otros desarrolladores del mismo segmento (modelos multimodales de 1-2 B con soporte de tool calling) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Conteo por extensión inestable: el modelo tiende a omitir el comodín (`*`) en los patrones, lo que provoca resultados de cero en herramientas con coincidencia literal. Se recomienda que el host normalice los patrones.
- Repreguntas desalineadas: ante una referencia ambigua puede preguntar por el nivel equivocado (por ejemplo, el directorio en lugar del fichero).
- Identidad poco fiable en multi-turno: en aproximadamente 3 de cada 5 intentos niega correctamente vínculos inexistentes con otros modelos, pero en el resto inventa relaciones que no existen.
- Contexto real muy inferior al nominal: aunque la ventana es de 256K tokens, el entrenamiento no supera los ~1024 tokens, por lo que el comportamiento más allá de ese umbral no está garantizado.
- Alucinación de datos concretos: si la herramienta no devuelve información suficiente, puede inventar cifras. El autor documenta un caso en el que respondió «269» ficheros cuando el valor real era 20. Es imprescindible que las herramientas devuelvan la respuesta directamente en lugar de exigir al modelo que cuente.
- Sensibilidad al orden de las herramientas: la selección cambia según la posición en la lista, un sesgo posicional aprendido del sandbox de entrenamiento. Conviene ordenar las herramientas por relevancia, pasar pocas a la vez y validar en el host con reintento.
- Sesgos generales: no se han publicado evaluaciones de sesgo demográfico, toxicidad ni robustez adversarial en la información disponible.
- Idiomas: solo chino e inglés; el rendimiento en castellano no está evaluado ni garantizado.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de ajuste deben verificarse por separado; el autor no detalla la procedencia de los 600 ejemplos más allá de la auditoría de fuga.
- Madurez: 10 descargas y 0 likes en el momento de la consulta, versión «Preview» y sin GGUF publicado; no es un componente con garantías para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/whcl412/FinchAI-Rune1-Preview-v2-f16
- Versión anterior (v1): https://huggingface.co/whcl412/FinchAI-Rune1-Preview-f16
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Repositorio con scripts de entrenamiento y generadores de datos: https://github.com/hwc-cell/FinchAI-Rune1-Preview
