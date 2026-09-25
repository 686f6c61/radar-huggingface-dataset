# xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ4e

## Resumen

MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ4e es una cuantización de 4 bits del modelo Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated, publicada por el usuario xunlinkx. El modelo original es un ajuste supervisado (SFT) de Xiaomi MiMo sobre Qwen3.5-9B, entrenado con datos generados por la familia MiMo-V2.6 y orientado a tareas de agente. La variante «Ablitrated» elimina la torre de visión y los procesadores multimodales, dejando un modelo puramente de texto. Sobre esa base, esta ficha describe la versión cuantizada en formato MLX con esquema oQ4e.

El problema que resuelve es el despliegue eficiente en hardware Apple Silicon: al pasar los pesos a 4 bits con cuantización afín y group size 64, el repositorio ocupa 5,3 GB y puede cargarse en memoria unificada de equipos de gama alta de Apple sin necesidad de GPU dedicada. El modelo conserva el soporte de tool calling del original, lo que lo hace utilizable en flujos de agente locales.

La relevancia actual viene de que combina tres factores poco frecuentes a la vez: licencia MIT, tamaño de 8.953.803.264 parámetros y formato nativo MLX optimizado para el runtime oMLX. Para desarrolladores que trabajan en macOS y quieren ejecutar un modelo con capacidades de agente sin depender de la nube, es una opción directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), pesos en formato MLX |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits, esquema oQ4e (cuantización afín con group size 64) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), 4 bits; repositorio de 5,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Qwen3.5-9B. El modelo original fue producido por Xiaomi MiMo mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por su propia familia MiMo-V2.6, con foco declarado en ingeniería de software, tareas de agente de propósito general, codificación visual y ciberseguridad. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases posteriores de RLHF o DPO.

La pieza que se documenta aquí es una cuantización posterior. Se construyó con oMLX usando 128 muestras de calibración a longitud de secuencia 512, cobertura estricta de matriz de importancia, cómputo en BF16 y group size 64. La tarjeta del autor indica que se eliminaron limpiamente los pesos de la torre de visión y las configuraciones del procesador multimodal, y que el modelo se construyó sin cabezas borrador MTP especulativas para maximizar la compatibilidad con mlx-lm estándar y reducir el consumo de memoria unificada. La validación declarada incluye carga estricta en oMLX, metadatos de cuantización afín global de 4 bits con group size 64, identidad SHA-256 del tokenizador entre origen y salida, renderizado correcto de un esquema de función estilo OpenAI con la plantilla de chat y una prueba determinista de generación (la respuesta a «15% de 240» incluye «36»). La cuantización puede alterar el comportamiento respecto al modelo original.

## Capacidades

- Generación de texto conversacional en modo puro texto, sin entrada de imágenes.
- Razonamiento y resolución de problemas dentro del pipeline text-generation.
- Codificación de software, heredada del entrenamiento SFT orientado a ingeniería.
- Tareas de agente de propósito general y razonamiento multi-paso.
- Soporte de tool use / function calling, condicionado a aplicar la plantilla de chat incluida y a suministrar los esquemas de herramienta en la petición.
- Aplicaciones de ciberseguridad, en línea con los dominios declarados para el modelo original.
- Capacidad multimodal visual: no disponible en esta variante, ya que la torre de visión y los procesadores multimodales fueron omitidos de forma deliberada.

## Casos de uso

- Asistente de programación local en macOS: gracias al soporte de tool calling y a la plantilla de chat compatible con esquemas de función estilo OpenAI, puede integrarse en editores e IDE con ejecución de herramientas sobre el sistema de archivos o el intérprete de comandos.
- Automatización de agentes multi-paso en local: el modelo puede encadenar llamadas a herramientas para completar tareas de varios pasos sin enviar datos a servicios externos, lo que resulta adecuado en entornos con requisitos de privacidad.
- Prototipado de flujos de agente antes de subir a producción: al caber en memoria unificada y cargar rápido en mlx-lm, permite iterar sobre prompts y esquemas de herramienta con coste cero de API.
- Asistencia en tareas de ciberseguridad: para análisis de código, revisión de configuraciones o generación de scripts de diagnóstico, dentro del dominio para el que se entrenó el modelo base.
- Generación y revisión de código en pipelines internos: se puede invocar desde scripts de CI/CD locales para generar parches, resúmenes de cambios o documentación técnica, siempre con revisión humana antes de aplicar.
- Chat de soporte técnico especializado: al ser un modelo afinado sobre datos de agente y software, encaja en asistentes internos que responden dudas de ingeniería o explican errores a partir de documentación suministrada en el contexto.
- Experimentación académica en investigación sobre agentes: al ser un checkpoint SFT publicado de forma abierta y con licencia MIT, sirve como punto de partida reproducible para estudiar ajuste fino y comportamiento de agentes en texto.
- Despliegue en portátiles Apple Silicon sin GPU dedicada: para demos, talleres o docencia donde no hay acceso a aceleradores NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta del autor únicamente documenta pruebas de validación cualitativas y una prueba determinista de generación, no comparativas con MMLU, HumanEval, GSM8K ni otros conjuntos estándar.

## Requisitos de hardware

- Peso de los pesos cuantizados: aproximadamente 5,3 GB, según el tamaño del repositorio.
- VRAM o memoria unificada estimada para inferencia: del orden de 6 a 8 GB contando pesos, caché KV y sobrecarga del runtime; depende de la longitud de contexto efectiva.
- Plataforma objetivo: Apple Silicon con MLX. El formato safetensors en MLX no es directamente cargable por runtimes CUDA convencionales.
- ¿Cabe en GPU de consumo? El modelo está pensado para memoria unificada de Apple Silicon; en el ecosistema NVIDIA requeriría conversión previa a otro formato, no incluida en este repositorio.
- Equipos orientativos: Mac con chip de la familia M-series y 16 GB o más de memoria unificada; el autor menciona compatibilidad con LM Studio, Cursor, OpenHands y mlx-lm.generate.
- Opciones de despliegue: runtime oMLX (para el que se construyó específicamente), mlx-lm, LM Studio y cualquier pipeline de inferencia de texto estándar que acepte pesos MLX. vLLM, TGI y llama.cpp no son aplicables sin convertir el formato.
- Latencia y throughput: no disponibles.
- Memoria reducida respecto al original: al omitir la torre de visión, el autor declara una huella de memoria notablemente menor y carga instantánea en pipelines de texto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Modalidad | Licencia |
|---|---|---|---|---|---|
| xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ4e | 8,95 B | No disponible | MLX 4 bits (oQ4e) | Solo texto | MIT |
| Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated (base) | ~9 B | No disponible | safetensors (precisión original) | Texto (variante ablacionada) | No disponible en la información |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (origen) | ~9 B | No disponible | safetensors | Texto y codificación visual | No disponible en la información |
| Qwen3.5-9B (modelo del que parte el SFT) | ~9 B | No disponible | safetensors | Texto | No disponible en la información |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5-9B y de datos generados por MiMo-V2.6, puede heredar los sesgos de ambos.
- Riesgo de alucinación: presente como en cualquier modelo generativo de este tamaño; el autor advierte explícitamente que la cuantización puede cambiar el comportamiento y que debe evaluarse en la carga de trabajo propia antes de usarlo en producción.
- Pérdida de capacidades multimodales: esta variante es solo texto; cualquier caso de uso que requiera visión o codificación visual no es viable con estos pesos.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista de idiomas soportados no están disponibles en la información proporcionada.
- Dependencia del runtime: está construida específicamente para oMLX y MLX; no es portable sin conversión a otros formatos como GGUF o safetensors para vLLM.
- Tool use condicionado: el uso de herramientas solo funciona si se aplica la plantilla de chat incluida y se suministran los esquemas en la petición; de lo contrario, el comportamiento puede degradarse.
- Licencia: MIT, heredada del modelo original. Conviene revisar los avisos y la atribución de los repositorios upstream, ya que la licencia del checkpoint de Xiaomi no se detalla en la información disponible.
- Reproducibilidad de la cuantización: el proceso depende de las 128 muestras de calibración y del group size 64; otros esquemas de cuantización pueden dar resultados distintos.
- Estado del repositorio: 0 descargas y 0 «likes» en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xunlinkx/MiMo-V2.6-Distill-Qwen-9B-Ablitrated-Text-oQ4e
- Modelo base de la cuantización: https://huggingface.co/Hikari07jp/MiMo-V2.6-Distill-Qwen-9B-Ablitrated
- Modelo original de Xiaomi MiMo en ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Página de la serie MiMo-V2.6 de Xiaomi: https://mimo.xiaomi.com/mimo-v2-6
- Ficha en Vast.ai: https://vast.ai/model/mimo-v26-distill-qwen-9b
- Ficha en gradually.ai: https://www.gradually.ai/en/ai-models/mimo-v2.6-distill-qwen-9b/
