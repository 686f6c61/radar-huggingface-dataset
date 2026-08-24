# Vashisht7/noteechoes-qwen25-core-v4-mlx-4bit

## Resumen

NoteEchoes Core v4 MLX 4-bit es un modelo de lenguaje derivado de Qwen2.5-1.5B-Instruct, cuantizado a 4 bits y convertido al formato MLX para su ejecución en dispositivos Apple. Desarrollado por el usuario Vashisht7, su propósito es convertir habla y texto natural en un contrato de acciones estructuradas (JSON) específico de la aplicación NoteEchoes, que gestiona notas, tareas, recordatorios, listas de verificación y consultas de memoria. El modelo está pensado para inferencia on-device, con un peso de aproximadamente 839 MiB y un número de parámetros de 241 millones (según los safetensors del repositorio), lo que lo hace adecuado para entornos con recursos limitados.

El modelo se distribuye bajo licencia Apache 2.0 y soporta tres idiomas: inglés, telugu e hindi. Su relevancia actual radica en su enfoque práctico para aplicaciones de productividad personal que requieren extracción de intenciones estructuradas con baja latencia y privacidad local. No se trata de un asistente generalista, sino de un componente especializado dentro de un sistema mayor que incluye un prompt de sistema, un adaptador de esquema y guardarraíles deterministas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 causal language model (transformer) |
| Parámetros totales | 241.327.616 (según safetensors del repositorio) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la ficha (el modelo base Qwen2.5-1.5B tiene 32.768 tokens, pero no se confirma para esta versión) |
| Tipos de cuantización | 4-bit affine, group size 64 |
| Idiomas soportados | en, te, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer causal de tipo decoder con normalización RMSNorm y atención multi-cabeza. El repositorio indica que es un derivado de `Qwen/Qwen2.5-1.5B-Instruct`, aunque el número de parámetros registrado en los safetensors es de 241 millones, lo que sugiere que el repositorio no contiene los pesos completos del modelo base (que tiene 1.500 millones de parámetros) o que se ha realizado una poda significativa. No se dispone de información sobre el proceso de entrenamiento (datos, número de tokens, técnicas de ajuste como RLHF o DPO). El modelo se ha ajustado específicamente para la tarea de extracción de acciones estructuradas del contrato NoteEchoes, con soporte de salida JSON y generación determinista (temperatura 0). No se mencionan innovaciones técnicas adicionales como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto estructurado en formato JSON, específicamente el contrato de acciones NoteEchoes (notas, tareas, recordatorios, listas de verificación, consultas de memoria).
- Soporte multilingüe para inglés (conjunto completo de acciones) y para telugu e hindi (acciones básicas: notas, tareas, recordatorios, listas y consultas).
- Acepta entradas romanizadas y mezclas de inglés/telugu/hindi según el contrato del producto.
- Generación determinista (temperatura 0) para extracción de estructuras, con validación posterior del JSON.
- No incluye capacidades de tool calling genérico ni funciones de visión o audio; es un modelo de texto puro.
- No incluye generación de correos electrónicos ni de prompts en telugu/hindi, según el alcance de la versión.

## Casos de uso

- Asistente de notas en aplicaciones móviles: el modelo convierte dictado o texto en notas estructuradas con título, cuerpo y etiquetas, ejecutándose en el dispositivo para preservar la privacidad.
- Gestión de tareas: extrae acciones de "crear tarea", "asignar prioridad" o "fijar fecha límite" a partir de frases naturales, integrándose con la lógica de validación del sistema.
- Recordatorios contextuales: interpreta "recuérdame comprar leche mañana a las 9" y genera el contrato JSON con la fecha, hora y mensaje, que luego la aplicación traduce a notificaciones.
- Consultas de memoria personal: permite al usuario preguntar "¿qué nota escribí sobre el proyecto X?" y el modelo extrae la intención de consulta para que la aplicación recupere datos reales del usuario (no almacenados en los pesos).
- Listas de verificación: convierte frases como "crea una lista de compras con pan, huevos y leche" en una estructura de checklist con elementos individuales.
- Automatización de tareas repetitivas: en un entorno de productividad, el modelo puede transformar mensajes de voz o texto en comandos para aplicaciones de calendario o recordatorios, reduciendo la fricción de entrada manual.

## Benchmarks y rendimiento

La model card del autor reporta resultados de evaluación del producto completo (modelo + adaptador + guardrails deterministas), no del modelo neuronal aislado:

| Suite | Resultado |
|---|---:|
| Locked release | 47/47 |
| Validation | 534/534 |
| Test | 543/543 |
| Adversarial challenge | 168/168 |
| Total | 1.292/1.292 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte que estos resultados corresponden al stack de producción y no demuestran la perfección del modelo neuronal por sí solo.

## Requisitos de hardware

- VRAM estimada: el archivo de pesos pesa aproximadamente 839 MiB, por lo que la inferencia puede caber en menos de 1 GB de memoria (con overhead adicional para el tokenizer y la generación). En GPU dedicadas, una tarjeta con 2 GB de VRAM sería suficiente.
- GPU recomendadas: cualquier GPU con soporte de MLX (Apple Silicon) o GPU NVIDIA/AMD con suficiente VRAM para cargar el modelo (por ejemplo, RTX 3060 o superior). En Apple Silicon, funciona en Macs con chips M1/M2/M3/M4.
- Dispositivos compatibles: apto para ejecución on-device en iPhone, iPad y Mac con Apple Silicon gracias al formato MLX.
- Opciones de despliegue: MLX (nativo), conversión a GGUF para llama.cpp y Ollama (requiere convertir los safetensors a GGUF), o uso directo con MLX-LM en Python.
- Latencia: no hay datos oficiales, pero al ser un modelo pequeño (241M parámetros) y cuantizado, la latencia esperada es de milisegundos en hardware moderno.

## Comparativa con modelos similares

No hay una comparativa directa disponible con otros modelos de extracción de acciones específicas. Como referencia, se compara con su modelo base y con un modelo pequeño generalista:

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| NoteEchoes Core v4 (este) | 241M (repo) | No especificado | Apache 2.0 | Extracción de acciones de productividad |
| Qwen2.5-1.5B-Instruct | 1.500M | 32.768 tokens | Apache 2.0 | Asistente general, multilingüe, tool calling |
| Llama-3.2-1B-Instruct | 1.000M | 128K tokens | Llama 3.2 | Asistente general, multilingüe |

La comparativa se limita a características técnicas porque no hay benchmarks públicos del modelo NoteEchoes.

## Limitaciones y advertencias

- Modelo de aplicación específica: no es un asistente generalista ni un modelo factual; no debe usarse para tareas fuera de la extracción de acciones estructuradas.
- Riesgo de alucinación: puede omitir semántica en solicitudes repetitivas o combinadas de múltiples acciones, según el autor.
- Dependencia del sistema completo: el modelo aislado no es el producto evaluado; requiere el prompt de sistema, adaptador de esquema y guardrails deterministas para un funcionamiento correcto.
- Interpretación de fechas y autorización de efectos secundarios: deben validarse mediante código de aplicación; el modelo no garantiza la corrección de estas interpretaciones.
- Alcance lingüístico limitado: en telugu e hindi solo cubre acciones básicas; la generación de correos y prompts en estos idiomas queda fuera del alcance.
- Privacidad: aunque está diseñado para on-device, el desarrollador es responsable de proteger los prompts y los datos generados.
- Rendimiento variable según el hardware físico (Apple Silicon) y la carga concurrente.
- No se han publicado resultados de benchmarks estándar ni datos de entrenamiento detallados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vashisht7/noteechoes-qwen25-core-v4-mlx-4bit
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Informe técnico Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5-Omni
- Repositorio Qwen2.5 (mx4ai): https://github.com/mx4ai/qwen2.5
