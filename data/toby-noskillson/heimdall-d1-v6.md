# Toby-NoSkillSon/heimdall-d1-v6

## Resumen

Heimdall D1 V6 es un modelo de clasificación de texto especializado en la detección de destinatario (*addressee detection*) y la gestión de turnos (*turn-taking*) para asistentes de voz. Lo desarrolla Toby-NoSkillSon como componente de decisión del asistente Heimdall: recibe el estado de la conversación en texto plano y emite un veredicto entre tres opciones (`send`, `wait`, `not_for_heimdall`) que determina si el habla va dirigida al asistente y si está lo bastante completa para actuar. Esta decisión es la que permite operar sin palabra de activación (*wake word*).

No es un modelo entrenado desde cero: es un ajuste fino completo (*full fine-tune*) de LiquidAI/d1-2B, un modelo de arquitectura LFM de aproximadamente 2.000 millones de parámetros, del que se utiliza únicamente la parte de texto. El entrenamiento se realizó con MLX sobre un MacBook con chip M5 Max, lo que condiciona tanto el formato de pesos publicado (MLX) como las cuantizaciones disponibles (BF16, int8, int4).

Su relevancia práctica es acotada pero clara: resuelve un subproblema concreto de los asistentes de voz continuos (siempre escuchando) con un modelo pequeño que cabe en 1,4 GB en 4 bits, multilingüe en diez idiomas, y con licencia LFM Open License v1.0 que permite uso comercial bajo un límite de ingresos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM (Liquid Foundation Model), transformer; solo la parte de texto del modelo base |
| Parámetros totales | ~2B (heredados de LiquidAI/d1-2B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, int8 (8 bits), int4 (4 bits) |
| Idiomas soportados | en, pl, de, es, fr, it, nl, pt, ru, uk |
| Licencia | LFM Open License v1.0 (uso comercial permitido bajo límite de ingresos) |
| Formato de pesos | safetensors en carpetas MLX (`bf16/`, `int8/`, `int4/`) |
| Tamaño de pesos | BF16 3,5 GB; int8 2,1 GB; int4 1,4 GB |
| Pipeline | text-classification |
| Librería | MLX (>= 0.32.4) |
| Modelo base | LiquidAI/d1-2B (relación: finetune) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LFM de LiquidAI/d1-2B, con unos 2.000 millones de parámetros, y se ha ajustado de forma completa (todos los pesos) para una tarea de clasificación con salida estructurada: un veredicto entre tres clases, sus probabilidades y, en el caso de `send`, una posible línea corta de acuse de recibo ("Let me check.", "On it."). La entrada es el estado de la conversación como texto plano, con nombres de asistente y usuario, el histórico cronológico y el habla pendiente desde el último envío.

El entrenamiento se ejecutó en dos fases sobre el mismo linaje. La V5 partió del modelo base con 68.027 ejemplos, 123 millones de tokens, 2.126 pasos y una época. La V6 continuó desde V5 con 32.175 ejemplos, 52 millones de tokens, 1.006 pasos y una época, sumando unos 175 millones de tokens de ajuste fino en total. Los ejemplos son momentos de conversación reales y sintéticos en inglés y polaco, además de alemán, español, francés, italiano, neerlandés, portugués, ruso y ucraniano. No se documenta el uso de RLHF o DPO; el proceso descrito es ajuste supervisado sobre ejemplos etiquetados.

Un detalle técnico relevante: el modelo se entrenó con una pregunta fija definida en `dispatch_question.json`, que nombra al usuario "Toby" y al asistente "Heimdall". El código de inferencia (`heimdall_d1_mlx.py`) construye el prompt con el propio código de d1-2B, descargando solo código, configuración y tokenizador de ese repositorio, nunca sus pesos, y requiere `torch` y `transformers` en CPU. El modelo lee texto, no audio: la transcripción debe realizarse en una etapa previa.

## Capacidades

- Clasificación de destinatario en tres clases: `send` (el habla va dirigida al asistente y está completa), `wait` (puede ir dirigida al asistente pero el hablante aún está formulando la idea) y `not_for_heimdall` (comentario al margen, medios, cita o conversación con otra persona).
- Salida de probabilidades por clase, útil para umbrales y lógica de decisión aguas abajo.
- Selección de una línea corta de acuse de recibo en los casos de `send`, para respuestas inmediatas mientras se procesa la petición real.
- Funcionamiento sin palabra de activación: la decisión por turnos sustituye al wake word.
- Multilingüe en diez idiomas: inglés, polaco, alemán, español, francés, italiano, neerlandés, portugués, ruso y ucraniano.
- Procesamiento de estado conversacional en texto plano con histórico cronológico y habla pendiente.
- No soporta tool calling, function calling, agentes multi-paso, visión ni audio de forma nativa; su única función es la decisión de turno.

## Casos de uso

- Asistentes de voz sin wake word: el modelo se ejecuta de forma continua sobre la transcripción en streaming y decide en cada momento si el habla va dirigida al asistente, eliminando la fricción de tener que pronunciar una palabra de activación.
- Detección de conversaciones ajenas en entornos domésticos: distingue entre una petición al asistente y una conversación entre dos personas o el audio de un televisor, evitando activaciones falsas en salas compartidas.
- Gestión de turnos en diálogo multi-turno: la clase `wait` permite al asistente esperar a que el usuario termine de formular una idea antes de actuar, mejorando la naturalidad frente a sistemas que responden a la primera pausa.
- Acuse de recibo inmediato en tareas lentas: cuando el veredicto es `send`, el modelo puede emitir una línea corta ("On it.", "Let me check.") mientras el componente principal resuelve la petición, reduciendo la percepción de latencia.
- Filtrado previo en pipelines de ASR: colocado entre la transcripción y el motor de diálogo, descarta el habla no dirigida al asistente y reduce el coste de invocar modelos mayores solo cuando corresponde.
- Despliegue en hardware de consumo: con 1,4 GB en int4 y ejecución en MLX, puede correr en un Mac con Apple Silicon junto al resto del asistente, sin GPU dedicada.
- Asistentes multilingües en Europa del Este y Central: el soporte nativo de polaco, ruso y ucraniano, poco habitual en modelos de este tamaño, lo hace adecuado para productos dirigidos a esos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 1,4 GB en int4, 2,1 GB en int8 y 3,5 GB en BF16 para los pesos; hay que sumar el overhead del runtime MLX y del tokenizador.
- GPU recomendadas: el modelo está entrenado y empaquetado para MLX, por lo que el entorno objetivo son los chips de Apple Silicon (el autor lo entrenó en un M5 Max). No se documenta soporte para CUDA.
- GPU de consumo: cabe holgadamente en cualquier Mac con Apple Silicon; no se proporcionan datos de ejecución en GPU NVIDIA.
- Opciones de despliegue: librería MLX (>= 0.32.4) mediante `heimdall_d1_mlx.py`; requiere además `numpy`, `huggingface_hub`, `tokenizers`, `transformers >= 5.20` y `torch` en CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de destinatario o turn-taking en la documentación proporcionada. Como referencia del linaje, el modelo base LiquidAI/d1-2B aporta la arquitectura y el tamaño:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Heimdall D1 V6 | ~2B | no disponible | Clasificación de turno y destinatario | LFM Open License v1.0 | MLX safetensors |
| LiquidAI/d1-2B | ~2B | no disponible | Modelo base de texto | LFM Open License v1.0 | safetensors |
| Alternativas de clasificación de turno | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de nicho: solo realiza clasificación de turno y destinatario; no genera respuestas, no razona y no ejecuta herramientas. Cualquier uso fuera de esa función requiere otro componente.
- Entrenado con una pregunta fija que nombra al usuario "Toby" y al asistente "Heimdall"; es necesario sustituir los nombres en la primera línea del estado, y no se documenta cómo afecta al rendimiento el uso de nombres distintos a los del entrenamiento.
- Dependencia de la calidad del ASR: el modelo consume texto, por lo que los errores de transcripción se propagan directamente a la decisión.
- Cobertura lingüística desigual: el entrenamiento se centró en inglés y polaco, con el resto de idiomas presentes pero sin datos públicos sobre su rendimiento relativo.
- Riesgo de alucinación en la línea de acuse de recibo: en los casos de `send`, el modelo puede generar una frase corta que no se corresponda con la petición real.
- Licencia LFM Open License v1.0: el uso comercial está permitido solo por debajo del límite de ingresos que fija la licencia; hay que conservar la licencia y la atribución en cualquier copia.
- Atribuciones de datos de entrenamiento: el modelo incorpora datos de Amazon MASSIVE (CC BY 4.0) y Tatoeba (CC BY 2.0 FR), documentadas en el fichero NOTICE.
- Privacidad: parte de los datos de entrenamiento provienen de conversaciones reales del autor, anonimizadas antes del entrenamiento; el autor declara haber probado la memorización de líneas de entrenamiento sin resultados medidos, pero no se publica la metodología.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precisión, recall ni tasas de falsos positivos, lo que dificulta evaluar su idoneidad en producción sin pruebas propias.
- Ecosistema restringido: el formato MLX limita el despliegue a hardware Apple; no hay pesos GGUF ni soporte documentado para servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Toby-NoSkillSon/heimdall-d1-v6
- Árbol de ficheros del repositorio: https://huggingface.co/Toby-NoSkillSon/heimdall-d1-v6/tree/main
- Modelo base LiquidAI/d1-2B: https://huggingface.co/LiquidAI/d1-2B
- Licencia LFM Open License v1.0: https://huggingface.co/Toby-NoSkillSon/heimdall-d1-v6/blob/main/LICENSE
- Atribuciones de datos (NOTICE): https://huggingface.co/Toby-NoSkillSon/heimdall-d1-v6/blob/main/NOTICE
