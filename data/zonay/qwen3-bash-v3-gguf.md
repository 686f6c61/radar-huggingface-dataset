# zonay/qwen3-bash-v3-GGUF

## Resumen

qwen3-bash-v3-GGUF es la versión cuantizada en formato GGUF de zonay/qwen3-bash-v3, un modelo especializado de traducción de lenguaje natural a Bash (nl2sh) construido sobre una base Qwen3 de 0,6 mil millones de parámetros. Lo desarrolla el usuario independiente zonay y resuelve un problema muy acotado: convertir instrucciones en inglés a un único comando de shell válido y sintácticamente correcto, ejecutable en cualquier CPU bajo Windows, Linux o macOS. Su relevancia actual radica en que ofrece una alternativa ultraligera (378 MB en Q4_K_M) para asistentes de línea de comandos sin necesidad de GPU.

El modelo no es un asistente conversacional general ni un generador de código de propósito amplio: está afinado específicamente sobre pares sintéticos de instrucción-comando y su unidad de salida es un comando único, no un plan multi-paso. Con 596.049.920 parámetros totales, encaja en la categoría de modelos pequeños desplegables en entornos con recursos mínimos, lo que lo hace atractivo para integraciones locales, runbooks operativos y herramientas de aprendizaje de Bash.

La licencia Apache 2.0 y la disponibilidad exclusiva en GGUF (sin safetensors publicados en este repositorio) condicionan su uso: es cómodo para inferencia en CPU mediante llama.cpp u Ollama, pero no está pensado para fine-tuning adicional a partir de estos pesos cuantizados. El modelo base sin cuantizar (zonay/qwen3-bash-v3) es el punto de partida para cualquier trabajo de adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3), no disponible el detalle exacto de capas y dimensiones |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | inglés (entrada); salida en Bash |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de la familia Qwen3 en su variante de 0,6B parámetros, aunque la model card no detalla número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa. Sobre esa base se aplicó un ajuste fino supervisado orientado a la tarea nl2sh, utilizando el dataset zonay/bash-data-nl2sh, compuesto por 140.000 pares sintéticos de entrenamiento y 2.000 de evaluación. No se indica en la información disponible si hubo RLHF, DPO u otras etapas de alineación posteriores al ajuste supervisado.

La composición del dataset de entrenamiento es deliberadamente amplia dentro del dominio shell: núcleo de Bash, redes (ssh, DNS, NAT), herramientas de IA (ollama, lms, opencode, llamacpp, mlx, hf, vllm), desarrollo en macOS (xcode), fullstack (JavaScript, Python, bases de datos, DevOps) y comandos destructivos o de pentest autorizados en laboratorio. Esta cobertura explica que el modelo rinda bien en patrones vistos pero falle en flags poco frecuentes, tal como reconoce el propio autor. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de instrucciones en inglés a un único comando Bash sintácticamente válido.
- Cobertura de patrones de shell core: manipulación de ficheros, pipes, permisos, procesos.
- Comandos de red: ssh, resolución DNS, configuración NAT.
- Herramientas de IA y serving local: ollama, llamacpp, mlx, vllm, huggingface-cli.
- Flujos de desarrollo fullstack: JavaScript, Python, bases de datos y DevOps.
- Comandos de macOS orientados a xcode.
- Generación de comandos destructivos o de pentest en contextos de laboratorio autorizado.
- Salida de comando único, no de planes multi-paso ni scripts completos.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al inglés como idioma de entrada.

## Casos de uso

- Copiloto de CLI: el usuario formula una petición en inglés, el modelo devuelve el comando, el humano lo confirma y lo ejecuta. Adecuado por su tamaño reducido y su entrenamiento específico en patrones de shell.
- Herramienta de aprendizaje de Bash: inspeccionar los comandos generados permite estudiar idioms y flags habituales sin salir del terminal.
- Borradores de runbooks operativos: a partir de una descripción en inglés se genera un snippet para un incidente, que se revisa antes de ejecutar en producción.
- Automatización local en CPU: al caber en 378 MB en Q4_K_M, puede desplegarse en portátiles y servidores sin GPU para asistentes de terminal integrados.
- Soporte en entornos macOS para desarrolladores: genera comandos de xcode y utilidades del sistema a partir de instrucciones en lenguaje natural.
- Gestión de herramientas de IA locales: traduce peticiones a comandos de ollama, llamacpp o vllm, útil en flujos de experimentación con modelos.
- Asistencia en tareas de red y administración: comandos de ssh, DNS y NAT para operadores que necesitan una plantilla rápida que luego revisan.

## Benchmarks y rendimiento

| Evaluación | Resultado | Notas |
|---|---|---|
| Big eval (500 prompts) | 482/500 (96%) | Medido sobre el modelo fuente en MLX; la cuantización Q4 suele costar 1-2 puntos |
| Broad (36 prompts manuales) | 34/36 | Medido sobre el modelo fuente en MLX |

Los criterios son coincidencia del primer comando y validación sintáctica con `bash -n`. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; el archivo Q4_K_M ocupa 378 MB y puede ejecutarse en CPU con RAM del orden de 1 GB o menos.
- GPU recomendadas: no aplica; cualquier GPU con suficiente memoria podría usarse vía llama.cpp, pero el modelo está diseñado para CPU.
- Cabe en cualquier GPU de consumo e incluso en sistemas sin GPU dedicada.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el repositorio incluye la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 0,6B en CPU, la latencia esperada es baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| zonay/qwen3-bash-v3-GGUF | 596 M | no disponible | nl2sh especializado | Apache 2.0 | GGUF en HF |
| zonay/qwen3-bash-v3 | 596 M (base) | no disponible | nl2sh especializado | Apache 2.0 | pesos fuente en HF |
| Qwen3 0.6B (base genérico) | ~0,6 B | no disponible | propósito general | no disponible en esta ficha | HF |

La comparación con alternativas genéricas del mismo tamaño no puede completarse con datos de rendimiento porque no se han publicado métricas comparables en la información disponible. La ventaja diferencial de este modelo es la especialización en nl2sh y su empaquetado GGUF listo para CPU; su desventaja es la ausencia de capacidades generales y de contexto documentado.

## Limitaciones y advertencias

- Con 0,6B parámetros, es fuerte en patrones entrenados pero débil ante flags no vistas; puede confundir verbos poco frecuentes.
- Genera comandos únicos, no planes multi-paso ni scripts completos.
- Las salidas marcadas como destructivas deben ser confirmadas siempre por un humano.
- Riesgo de alucinación en flags y rutas: la validación con `bash -n` solo comprueba sintaxis, no semántica ni seguridad.
- Solo entrada en inglés; no se documenta soporte multilingüe.
- Longitud de contexto no disponible, lo que impide planificar conversaciones largas con garantías.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía alguna sobre los comandos generados.
- Nunca debe auto-ejecutarse la salida; los comandos destructivos solo deben probarse en VMs desechables propias y en sandbox con red deshabilitada y timeout.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zonay/qwen3-bash-v3-GGUF
- Modelo base: https://huggingface.co/zonay/qwen3-bash-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/zonay/bash-data-nl2sh
