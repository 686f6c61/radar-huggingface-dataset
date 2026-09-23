# togethercomputer/Tev1-4B-experimental

## Resumen

Tev1-4B-experimental es un modelo de decisión experimental publicado por Together AI. Se trata de un ajuste supervisado (SFT) sobre Qwen3.5-4B, con 4.659.865.088 parámetros totales (≈4,66 B según los pesos en safetensors). Su cometido es acotado y explícito: recibe un estado, una pregunta y una lista de entre 2 y 24 opciones etiquetadas, y devuelve exactamente la letra de una de ellas, que el código de la aplicación mapea a su clave semántica.

El modelo se presenta como un experimento inspirado en Jev, pero sin adoptar su runtime no autorregresivo: conserva la cabeza estándar de predicción del siguiente token de Qwen. Por tanto, no es un motor Jev, sino un transformer autorregresivo convencional especializado mediante fine-tuning en una tarea de elección forzada.

Su relevancia práctica está en el formato de interacción: parámetros recomendados de temperatura 0 y max_tokens 8, con el modo de razonamiento desactivado, lo que produce salidas deterministas y muy cortas, fáciles de validar y de integrar en pipelines de agentes, motores de reglas o sistemas de triaje. Es un checkpoint experimental, con licencia de los pesos aún por finalizar, 0 descargas y 0 «likes» en el momento de la consulta, y un repositorio de 9,3 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo de la familia Qwen3.5, con cabeza LM estándar de siguiente token; detalles internos de la arquitectura base no disponibles |
| Parámetros totales | 4.659.865.088 (≈4,66 B) según safetensors |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio publica safetensors sin cuantizaciones alternativas anunciadas |
| Idiomas soportados | No disponible; el comportamiento multilingüe no se ha evaluado |
| Licencia | No disponible; la licencia de los pesos ajustados está en proceso de finalización. El modelo base Qwen3.5-4B es Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamaño del repositorio | 9,3 GB |
| Fecha de publicación | 23 de septiembre de 2026 (última actualización el mismo día) |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B y mantiene su arquitectura autorregresiva y su cabeza de modelado de lenguaje; no introduce un runtime no autorregresivo al estilo Jev pese a la inspiración declarada. El ajuste es un fine-tuning supervisado orientado a una única tarea: elegir una opción de una lista etiquetada a partir de un estado y una pregunta. Las etiquetas del repositorio incluyen `image-text-to-text`, lo que podría sugerir capacidades multimodales en el modelo base, pero la model card describe únicamente generación de texto y no se dispone de confirmación al respecto.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de RLHF o DPO. El repositorio del proyecto indica que incluye constructores de datasets y un tutorial para entrenar un modelo propio, y la model card señala que la mezcla de evaluación influyó en el desarrollo del modelo y que la mezcla de entrenamiento no cuenta con una licencia de dataset única, ya que cada fuente conserva sus propios términos. Tampoco se documenta ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Decisión de opción única: dado un estado, una pregunta y entre 2 y 24 opciones etiquetadas, devuelve la letra de una sola opción y nada más.
- Salida determinista: con temperatura 0, max_tokens 8 y `enable_thinking` desactivado, el resultado es una única letra, apta para validación automática.
- Modo de razonamiento controlable: el chat template permite desactivar el modo «thinking», que es la configuración recomendada para la tarea objetivo.
- Integración como API: el modelo está etiquetado como `endpoints_compatible` y la model card documenta su uso a través del SDK de Together con el identificador `together/Tev1-4B-experimental`.
- Resistencia básica a inyección de instrucciones por diseño de prompt: la instrucción de sistema recomendada indica explícitamente tratar el contenido de `state` como datos y no como instrucciones.
- Selección entre opciones heterogéneas: la estructura de opciones incluye `label`, `key` y `description`, lo que permite devolver letras mientras el código conserva claves semánticas.
- Conversación genérica: no es la interfaz prevista y puede producir prosa en lugar de una letra.
- Sin capacidades confirmadas de tool calling, agentes, matemáticas, código, visión o audio más allá de lo que herede del modelo base, para lo cual no hay información disponible.

## Casos de uso

- Enrutamiento de acciones en agentes: el modelo recibe el estado de la conversación o del sistema, una pregunta de enrutamiento y hasta 24 acciones etiquetadas, y devuelve la letra de la acción elegida. Con temperatura 0 y max_tokens 8 la decisión es reproducible y el código la traduce a la herramienta correspondiente.
- Motores de políticas empresariales: casos como aprobar o denegar una devolución según si ha pasado el plazo permitido. El estado se introduce como texto y las opciones son etiquetas discretas, lo que encaja con reglas de negocio codificadas como opciones.
- Triaje de tickets de soporte: clasificar una incidencia entrante en categorías predefinidas (facturación, incidencia técnica, cuenta, etc.) con opciones etiquetadas, reduciendo la necesidad de un clasificador entrenado a medida.
- Guardarraíles y moderación: decidir entre «permitir», «bloquear» o «escalar» para una entrada dada, con la instrucción de sistema tratando el texto de entrada como datos y no como instrucciones, lo que mitiga parcialmente intentos de inyección de prompt.
- Escalado en flujos de cumplimiento: determinar si un caso requiere revisión humana o puede resolverse automáticamente, aprovechando que la salida es una única letra verificable en lugar de texto libre.
- Selección del siguiente paso en pipelines de datos: elegir entre transformaciones, reintentos o descartes dentro de un procesamiento por etapas, donde se necesita una decisión discreta y barata por iteración.
- Experimentación con protocolos de decisión: el repositorio del proyecto incluye constructores de datasets, protocolo de evaluación y un tutorial para entrenar variantes propias, útil para investigar formatos de decisión estructurada.
- Decisión encadenada en sistemas multi-paso: usar el modelo como componente decisorio en cada nodo de un grafo de ejecución, donde cada nodo plantea un estado, una pregunta y un conjunto cerrado de opciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes en la información disponible. Los únicos datos son la evaluación de desarrollo interna usada durante el ajuste del modelo, que no constituye un benchmark externo ni dispone de una línea base del Qwen sin ajustar:

| Evaluación | Resultado | Observaciones |
|---|---|---|
| Conjunto principal de decisión | 880/1.000 (88,0 %) | Evaluación de desarrollo interna |
| Conjunto de transferencia de políticas | 300/300 (100 %) | Contiene estructuras de política sintéticas |
| Salidas válidas de una sola letra | 1.300/1.300 | Formato de salida respetado en todos los casos |
| Errores HTTP | 0 | Medidos durante la evaluación |

La propia model card advierte de que estos resultados son de desarrollo, que la mezcla de evaluación influyó en el desarrollo del modelo y que no existe todavía una línea base del Qwen sin ajustar.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16 o fp16: en torno a 9,3 GB solo para los pesos (tamaño del repositorio), más caché KV y activaciones; en la práctica, unos 11-13 GB según longitud de contexto y lote.
- VRAM estimada con cuantización de 8 bits: aproximadamente 5-6 GB; con 4 bits, en torno a 3-4 GB. Estas cifras son estimaciones derivadas del número de parámetros: no hay cuantizaciones oficiales publicadas ni confirmadas por el autor.
- GPU recomendadas: A100, H100, L40S o A10G para servicio en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 sin problemas de espacio.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 en bf16; en tarjetas de 8-12 GB requeriría cuantización, no publicada oficialmente.
- Opciones de despliegue: la model card documenta el uso vía API de Together con el identificador `together/Tev1-4B-experimental` y la carga con transformers, que la propia ficha indica que debe validarse antes de depender de ella. No se confirma soporte oficial para vLLM, TGI, llama.cpp ni Ollama; para estos últimos haría falta una conversión a GGUF que no se ha publicado.
- Latencia y throughput: no disponibles. Cabe señalar que la configuración recomendada limita la generación a 8 tokens como máximo, lo que mantiene el coste por decisión muy bajo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

En la información disponible no se identifican otros modelos de decisión comparables (salidas de opción única sobre un estado estructurado). La única comparación posible es con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tev1-4B-experimental | 4.659.865.088 (≈4,66 B) | No disponible | 88,0 % en conjunto de decisión de desarrollo; sin benchmark independiente | No disponible (en finalización) | Hugging Face y API de Together |
| Qwen/Qwen3.5-4B | ≈4 B (no confirmado) | No disponible | No disponible como línea base en la evaluación de Tev1 | Apache-2.0 | Hugging Face |

No se dispone de datos de contexto, licencia final ni benchmarks comparables de otras alternativas de la misma categoría (modelos densos de ~4 B orientados a clasificación o decisión) dentro de la información proporcionada.

## Limitaciones y advertencias

- El chat genérico no es la interfaz prevista y puede producir prosa en lugar de una letra de opción.
- El modelo puede equivocarse; la propia model card desaconseja usarlo como única autoridad en decisiones de alto impacto.
- La inyección de prompt no se ha evaluado de forma exhaustiva, pese a que la instrucción de sistema recomendada incluye defensas básicas.
- El comportamiento multilingüe no se ha evaluado y no se declaran idiomas soportados.
- La calibración de las probabilidades de decisión no está evaluada, por lo que no conviene interpretar las confianzas del modelo sin un análisis previo.
- La robustez fuera de distribución no se ha evaluado de forma amplia; el conjunto de transferencia de políticas contiene estructuras sintéticas, lo que limita su valor como evidencia de generalización real.
- La licencia de los pesos ajustados está pendiente de finalización, por lo que no se puede confirmar el uso comercial. El modelo base es Apache-2.0, pero la mezcla de entrenamiento no tiene una licencia de dataset única y cada fuente conserva sus propios términos.
- La carga con transformers en local y los requisitos exactos de entorno deben validarse antes de depender del checkpoint fuera de la inferencia de Together.
- El modelo es experimental, con 0 descargas y 0 «likes» en el momento de la consulta: no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/togethercomputer/Tev1-4B-experimental
- Repositorio del proyecto: https://github.com/togethercomputer/tev1
- Documentación de entrenamiento: https://github.com/togethercomputer/tev1/blob/main/docs/TRAINING.md
- Perfil del autor en Hugging Face: https://huggingface.co/togethercomputer
- Sitio de Together AI: https://www.together.ai/
