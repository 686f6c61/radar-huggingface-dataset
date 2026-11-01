# tinyopsec/CursorCore-QW2.5-1.5B-GGUF

## Resumen

CursorCore-QW2.5-1.5B-GGUF es un repositorio de cuantizaciones GGUF del modelo TechxGenus/CursorCore-QW2.5-1.5B, un ajuste fino (fine-tune) de Qwen2.5-Coder-1.5B orientado a la programación asistida por IA. El autor de la cuantización es tinyopsec, que ha generado los archivos con llama.cpp para facilitar su ejecución local en CPU y GPU mediante runtimes compatibles con el formato GGUF (llama.cpp, Ollama, LM Studio, koboldcpp, etc.).

La familia CursorCore entrena modelos pequeños sobre bases de código para replicar comportamientos típicos de asistentes de programación tipo Cursor: generación de código, ediciones inline, rellenado de huecos (fill-in-the-middle) y respuestas conversacionales sobre código. La relevancia de esta ficha radica en su tamaño: con 1.543.321.088 parámetros, es un modelo lo bastante ligero para funcionar en portátiles y equipos sin GPU dedicada, lo que lo hace interesante como asistente de código local y privado.

El modelo base es Qwen/Qwen2.5-Coder-1.5B, un transformer denso de la familia Qwen2.5. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones destacables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5) |
| Parametros totales | 1.543.321.088 (≈1,54 B) |
| Parametros activos | no disponible (no es MoE; modelo denso, todos los parámetros activos) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-Coder-1.5B soporta 32.768 tokens (ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible (el modelo base Qwen2.5-Coder cubre principalmente inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con llama.cpp); el modelo base original está en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B, un transformer decoder-only denso de la familia Qwen2.5, que incorpora atención agrupada de consultas (GQA), codificación rotatoria de posiciones (RoPE) y ventanas de contexto largas típicas de la serie. Sobre esta base, TechxGenus realizó un ajuste fino con datos orientados a programación asistida (el proyecto CursorCore), cuyo objetivo es dotar al modelo de comportamientos de asistente de edición de código: completar código, aplicar ediciones según instrucciones y responder en formato conversacional.

No se han publicado en la model card detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales en la inferencia (decodificación especulativa, atención lineal, etc.). La cuantización GGUF distribuida en este repositorio se generó con llama.cpp y ofrece trece niveles de precisión, desde F16 hasta Q2_K, con Q4_K_M señalado como recomendado por el autor.

## Capacidades

- Generación de codigo: completado y generación de fragmentos de código a partir de instrucciones o contexto, heredado del entrenamiento de Qwen2.5-Coder.
- Edicion de codigo asistida: CursorCore está afinado para tareas de edición y transformación de código guiadas por instrucciones, emulando el flujo de asistentes tipo Cursor.
- Rellenado de huecos (fill-in-the-middle): capacidad típica de la familia Qwen2.5-Coder para completar código en mitad de un archivo (no confirmada explícitamente en la model card de esta cuantización).
- Conversacion sobre codigo: el pipeline es text-generation con etiqueta conversational, apto para chat sobre problemas de programación.
- Razonamiento general y matematicas: capacidad limitada por su tamaño (1,5 B); no es el enfoque principal del modelo.
- Vision, audio y tool calling: no disponibles; el modelo es de texto a texto.
- Agentes y multi-step reasoning: no documentado; por tamaño y enfoque, no es idóneo para flujos agénticos complejos.

## Casos de uso

- Asistente de codigo local y privado: ejecución 100 % offline con Ollama o LM Studio para completar y editar código sin enviar propietario intelectual a APIs externas; ideal con la cuantización Q4_K_M (≈1 GB).
- Autocompletado en editores: integración con extensiones de editor que consumen backends locales tipo llama.cpp o Ollama para sugerencias de código de baja latencia.
- Revision rapida de snippets: explicar, documentar o refactorizar fragmentos de código pegados en el prompt, aprovechando que el modelo cabe en cualquier equipo moderno.
- Generacion de scripts y utilidades: creación de scripts de shell, Python o SQL de longitud moderada para tareas de automatización cotidianas.
- Prototipado en entornos con recursos limitados: servidores sin GPU, contenedores ligeros o CI donde se necesita un LLM de código sin coste de infraestructura.
- Evaluacion y comparacion de cuantizaciones: el repo incluye trece niveles de cuantización, útil como banco de pruebas para estudiar la degradación de calidad frente al tamaño en modelos de código pequeños.
- Asistente embebido en aplicaciones: distribución del modelo junto a una aplicación de escritorio gracias a su tamaño reducido y licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta cuantización específica. Para resultados del modelo base, puede consultarse la model card de Qwen/Qwen2.5-Coder-1.5B y la documentación del proyecto CursorCore (enlaces abajo).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: F16 ≈ 3,0 GB; Q8_0 ≈ 1,6 GB; Q4_K_M ≈ 1 GB; Q2_K ≈ 0,6 GB (aproximado a partir del tamaño del repo de 15,3 GB para trece cuantizaciones; añadir margen para el KV cache según contexto).
- GPU recomendadas: no se requiere GPU dedicada; cualquier GPU con 2-4 GB de VRAM (por ejemplo GTX 1650, RTX 3050 o superiores) acelera la inferencia notablemente.
- Consumer GPUs: cabe con holgura en prácticamente cualquier GPU moderna; incluso funciona solo con CPU y RAM del sistema (4-8 GB).
- Opciones de despliegue: llama.cpp (llama-cli y llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; por su tamaño (1,5 B) se espera generación fluida incluso en CPU de escritorio moderna, típicamente por encima de 20 tokens/s en CPU y muy superior en GPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Enfoque | Licencia |
|---|---|---|---|---|
| CursorCore-QW2.5-1.5B (este) | 1,54 B | GGUF | Codigo asistido (edicion + chat) | Apache 2.0 |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1,54 B | safetensors/GGUF | Codigo general | Apache 2.0 |
| StarCoder2-3B | 3 B | safetensors/GGUF | Codigo general | BigCode OpenRAIL-M |
| DeepSeek-Coder-1.3B-Instruct | 1,3 B | safetensors/GGUF | Codigo general | Licencia propia con restricciones comerciales |

Frente a su base (Qwen2.5-Coder-1.5B-Instruct), CursorCore aporta afinado específico en flujos de edición asistida; frente a StarCoder2-3B ofrece un tamaño menor y licencia más permisiva; frente a DeepSeek-Coder-1.3B, licencia Apache 2.0 sin restricciones de uso comercial. Datos de rendimiento comparativos: no disponibles.

## Limitaciones y advertencias

- Riesgo de alucinacion: elevado, como en todo modelo pequeño; puede generar APIs, nombres de funciones o sintaxis inexistentes. Revisar siempre el código producido.
- Sesgos: heredados del corpus de entrenamiento de Qwen2.5-Coder y de los datos de CursorCore; no documentados específicamente.
- Contexto: la model card no especifica la ventana de contexto de esta variante; verificar contra el modelo base antes de procesar archivos largos.
- Capacidades generales limitadas: con 1,5 B de parámetros, el razonamiento complejo, las matemáticas avanzadas y el multilingüe son notablemente peores que en modelos de 7 B o superiores.
- Cuantizacion: los niveles bajos (Q3, Q2_K) degradan apreciablemente la calidad; el autor recomienda Q4_K_M como equilibrio.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar también los términos del modelo base Qwen2.5-Coder.
- El propio autor incluye un disclaimer: es un asistente de programación experimental; evaluar antes de usar en producción.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/tinyopsec/CursorCore-QW2.5-1.5B-GGUF
- Modelo original (fine-tune CursorCore): https://huggingface.co/TechxGenus/CursorCore-QW2.5-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Proyecto CursorCore (codigo y paper): https://github.com/TechxGenus/CursorCore
- llama.cpp: https://github.com/ggml-org/llama.cpp
