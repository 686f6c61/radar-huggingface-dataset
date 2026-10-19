# sunear/AuroraCounsel

## Resumen

AuroraCounsel es un sistema de asistencia en salud mental en chino publicado por el usuario sunear en HuggingFace. No se distribuye como un modelo único, sino como una arquitectura multiagente con tres componentes: AC-Sense (clasificador de emoción basado en `bert-base-chinese` más una capa MLP), AC-Reflect (modelo consejero que realiza análisis cognitivo profundo cuando detecta emoción negativa) y AC-Guide (modelo principal de diálogo que genera la respuesta). La lógica de intervención se apoya en la Terapia Racional Emotiva Conductual (REBT, Ellis).

El problema que aborda es el enrutado adaptativo del esfuerzo de cómputo en atención psicológica conversacional: el sistema clasifica primero la emoción del usuario y solo activa el razonamiento profundo del módulo consejero ante emociones negativas, respondiendo de forma directa en caso contrario. Incluye una interfaz Gradio con salida en streaming, visualización del proceso de razonamiento y tres modos de ejecución (pensamiento completo, pensamiento adaptativo y salida directa).

La relevancia es limitada por la escasez de información verificable: el repositorio declara 0 descargas y 2 likes, no especifica licencia, pipeline, idiomas ni arquitectura de los modelos generativos, y no publica benchmarks ni documentación técnica más allá de la model card en chino. El tamaño del repo (29,8 GB) indica pesos considerables, pero el autor no detalla parámetros ni contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multiagente de tres componentes: AC-Sense (BERT + MLP), AC-Reflect (modelo consejero) y AC-Guide (modelo de diálogo). Arquitectura interna de los dos modelos generativos: no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin indicar precisión ni variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en los metadatos; la model card está redactada en chino y el sistema se presenta para usuarios en chino |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | `safetensors` (tag del repo); el clasificador de emoción usa `new_mlp.bin` |
| Componentes publicados | `AuroraCounsel-Sense/`, `AuroraCounsel-Reflect/`, `AuroraCounsel-Guide/` y `chat.py` |
| Tamaño del repositorio | 29,8 GB |
| Descargas / likes | 0 / 2 |
| Fechas | creado 2026-10-19, actualizado 2026-10-19 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de enrutado dinámico. AC-Sense recibe el turno del usuario y lo clasifica como emoción negativa o positiva mediante `bert-base-chinese` seguido de una cabeza MLP; la interfaz muestra la etiqueta y la confianza. Si la emoción es negativa, el sistema deriva la consulta a AC-Reflect, que produce un análisis cognitivo estructurado; AC-Guide consume después ese análisis y genera la respuesta final aplicando los principios de REBT. Si la emoción es positiva, AC-Guide responde directamente, reduciendo latencia y coste. El autor describe este esquema como "enrutado dinámico multiagente con razonamiento profundo adaptativo a emociones negativas".

No se dispone de información sobre el entrenamiento de los modelos generativos: no se indican tokens de entrenamiento, composición del dataset, ni si hubo ajuste por RLHF, DPO o SFT. La model card solo menciona "lógica REBT codificada de forma rígida" y "decisión de enrutado multiagente dinámico", sin detallar si esa lógica reside en el prompt de sistema, en reglas del orquestador o en datos de ajuste fino. Tampoco se especifica la innovación técnica de decodificación ni detalles de atención.

## Capacidades

- Generación de texto conversacional orientada a consejo psicológico con tono empático, según la model card.
- Clasificación binaria de emoción (negativa/positiva) con visualización de la confianza mediante AC-Sense.
- Razonamiento en dos etapas: análisis cognitivo estructurado (AC-Reflect) seguido de respuesta (AC-Guide).
- Tres modos de operación conmutables: pensamiento completo, pensamiento adaptativo y salida directa.
- Salida en streaming con etiquetas de "thinking" que permiten mostrar el proceso de razonamiento por separado.
- Gestión de conversaciones multiturno con historial, exportación del chat a JSON y limpieza de contexto desde la interfaz.
- Personalización de prompt de sistema y de temperatura de generación.
- Detección de escenarios de crisis (autolesión, suicidio) con derivación a atención profesional presencial.
- Ejecución local: el autor afirma que las conversaciones no se suben a ningún servicio externo.
- No se documentan capacidades de tool calling, función de agente multi-paso, visión, audio, código o matemáticas.

## Casos de uso

- Triaje emocional en primera línea: AC-Sense clasifica el turno del usuario y decide si requiere análisis profundo; útil para prototipos de chatbots de apoyo emocional donde el coste por turno importa.
- Diario emocional asistido: registro local de conversaciones con exportación a JSON, aprovechando que el sistema no envía datos a servicios externos.
- Investigación en intervención basada en REBT: banco de pruebas para comparar respuestas con y sin la etapa de análisis cognitivo intermedio (modo completo frente a modo directo).
- Formación de estudiantes de psicología: la visualización del proceso de razonamiento y del análisis estructurado permite revisar cómo se construye la reformulación cognitiva.
- Prototipado de interfaces de salud mental en Gradio: el repositorio incluye `chat.py` con servidor listo, útil para validar UX antes de invertir en infraestructura propia.
- Detección de riesgo con derivación: los disparadores de crisis permiten construir un flujo que, ante indicios de autolesión, interrumpa el diálogo generativo y muestre recursos de ayuda presencial.
- Experimentación académica con enrutado multiagente: separación clara de responsabilidades (clasificador, analista, generador) que facilita medir el coste y la calidad de cada etapa por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas específicas de salud mental (por ejemplo, precisión del clasificador de emoción, tasa de adherencia a REBT o evaluaciones con psicólogos). Tampoco se aportan latencias ni throughput.

## Requisitos de hardware

- VRAM estimada: no confirmada por el autor. El repositorio ocupa 29,8 GB e incluye los tres componentes; si los pesos de los modelos generativos están en FP16/BF16, el conjunto requeriría del orden de 30 GB solo para pesos, más caché KV y el clasificador BERT. Cifra orientativa, no verificada.
- GPU de datacenter: A100 40 GB u 80 GB y H100 son las opciones seguras para ejecutar los tres componentes en precisión nativa.
- GPU de consumo: una RTX 4090 (24 GB) o RTX 3090 probablemente no basten en FP16 si el total real de pesos se acerca a los 30 GB; sería necesario cuantizar, y el autor no publica variantes cuantizadas.
- Cuantización: no se ofrecen pesos GGUF, AWQ, GPTQ ni EXL2. Cualquier conversión a 8 o 4 bits tendría que hacerla el usuario, con la pérdida de calidad asociada y sin referencia de evaluación.
- Despliegue: el repositorio incluye un único punto de entrada, `python chat.py`, que carga los modelos y levanta un servidor Gradio. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama; TGI y vLLM requerirían adaptar el orquestador multiagente, ya que el sistema no es un modelo monolítico servible con una sola llamada.
- Latencia y throughput: no disponibles. El modo adaptativo está pensado para reducir el coste computacional al evitar la etapa de razonamiento profundo en turnos positivos, pero el autor no publica mediciones.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables en la información proporcionada. La categoría natural sería la de asistentes conversacionales de salud mental open source (a menudo construidos sobre LLM base de 7B a 14B con ajuste fino supervisado y datos de diálogo psicológico), pero sin parámetros, contexto, licencia ni benchmarks publicados por el autor no es posible establecer una comparación cuantitativa honesta.

| Modelo | Parámetros | Contexto | Licencia | Benchmarks públicos | Disponibilidad |
|---|---|---|---|---|---|
| AuroraCounsel | no disponible | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluación clínica: no hay evidencia publicada sobre calidad de las respuestas, adherencia a REBT ni seguridad.
- Licencia no declarada: no puede asumirse permiso para uso comercial, modificación o redistribución. Es un bloqueo para cualquier despliegue en producción.
- Riesgo de alucinación relevante por el dominio: un modelo generativo sin evaluation de seguridad puede emitir consejo psicológico incorrecto o potencialmente dañino, especialmente si el usuario describe sintomatología que no ha sido clasificada como negativa por AC-Sense.
- Falsos negativos del clasificador: el enrutado depende de un BERT chino más MLP binario; una emoción negativa no detectada provoca que el sistema responda sin la etapa de análisis, degradando la calidad justo en los casos delicados.
- Sesgo cultural y lingüístico: el sistema está diseñado y redactado para usuarios en chino, con supuestos culturales y de expresión emocional propios de ese contexto; no hay información sobre comportamiento en castellano.
- Idiomas no declarados: no se puede asumir multilingüismo. El clasificador es específicamente `bert-base-chinese`.
- Sin información sobre contexto: se desconoce cuántos tokens de historial admite; en conversaciones largas el truncado puede romper la coherencia terapéutica.
- Dependencia de la "lógica REBT codificada de forma rígida": si esa lógica está implementada como reglas o prompt fijo, el sistema puede resultar repetitivo o incapaz de manejar casos que se salgan del guion.
- Validación social mínima: 0 descargas y 2 likes, sin paper, sin repositorio de código independiente ni demo pública. La model card es una guía de instalación, no documentación técnica.
- Trazabilidad de metadatos: las fechas registradas (creación y actualización en 2026-10-19) no permiten establecer el histórico real de desarrollo.
- Advertencia del propio autor: la herramienta es un apoyo y no sustituye a un profesional sanitario; cualquier uso real debe incorporar supervisión clínica y protocolos de derivación.
- La búsqueda web asociada a este modelo devolvió únicamente resultados no relacionados (contenido para adultos), por lo que no se ha podido localizar documentación adicional, paper ni repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sunear/AuroraCounsel
- No se han encontrado papers, blogs técnicos, repositorios de código ni demos en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
