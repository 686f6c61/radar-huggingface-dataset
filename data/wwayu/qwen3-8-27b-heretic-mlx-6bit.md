# Wwayu/Qwen3.8-27B-heretic-mlx-6Bit

## Resumen

Wwayu/Qwen3.8-27B-heretic-mlx-6Bit es una conversión al formato MLX del modelo choz/Qwen3.8-27B-heretic, una variante modificada del Qwen3.8-27B de Alibaba. El modelo base es un transformer denso de 27 mil millones de parámetros con capacidades multimodales (entrada de imagen y texto) y una ventana de contexto nativa de 262 000 tokens. La variante "heretic" se presenta como una versión "uncensored" o "abliterated", es decir, se ha eliminado o reducido la alineación de seguridad del modelo original, lo que permite respuestas sin los filtros habituales de rechazo. Esta conversión MLX está cuantizada a 6 bits, pensada para ejecutarse eficientemente en hardware Apple Silicon mediante la librería mlx-lm.

La relevancia de este modelo radica en combinar las capacidades técnicas del Qwen3.8-27B (razonamiento configurable, visión, contexto largo, soporte para agentes) con una licencia Apache 2.0 y un formato optimizado para despliegue local en Macs. Sin embargo, hay que tener en cuenta que la eliminación de la alineación de seguridad introduce riesgos adicionales de generación de contenido inapropiado o dañino, por lo que su uso en producción debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de visión (vision-language) |
| Parametros totales | 27B (nominal, según modelo base Qwen3.8-27B); el archivo safetensors de esta conversión reporta 5 885 566 464 parámetros, posible discrepancia a verificar |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 000 tokens (nativo) |
| Tipos de cuantizacion | 6-bit (MLX) |
| Idiomas soportados | No disponible (presumiblemente multilingüe, como el Qwen3.8 base) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con un encoder de visión integrado, lo que le permite procesar imágenes y texto de forma conjunta. Incorpora un mecanismo de "razonamiento configurable" que permite alternar entre modos de pensamiento rápido y profundo (thinking mode). La ventana de contexto nativa es de 262 000 tokens, ampliable mediante técnicas de interpolación posicional.

La variante "heretic" se construye a partir del modelo original mediante técnicas de "abliteration" (ablación de direcciones de características) y desalineación, que eliminan o atenúan los circuitos internos responsables de los rechazos de contenido. No se dispone de información detallada sobre el proceso exacto de entrenamiento ni sobre los datos utilizados. La conversión a MLX se realizó con mlx-lm 0.31.2, preservando los pesos originales en cuantización de 6 bits.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto, salida de texto).
- Razonamiento configurable: modo de pensamiento rápido y modo de pensamiento profundo (thinking mode) para tareas complejas.
- Soporte de tool calling y function calling, lo que permite integración con APIs y herramientas externas.
- Capacidades de agente: ejecución de tareas de largo horizonte, uso de terminal, navegación web y operaciones en sistemas operativos (según benchmarks del modelo base).
- Multilingüe (presumiblemente, aunque no se especifica en la ficha).
- Ventana de contexto de 262 000 tokens, adecuada para documentos largos y conversaciones extensas.
- Al estar "abliterated", no aplica los filtros de contenido habituales de los modelos comerciales, lo que permite respuestas sin rechazo en temas sensibles (con los riesgos asociados).

## Casos de uso

- Desarrollo de asistentes conversacionales sin restricciones de contenido: el modelo puede mantener diálogos multi-turno sobre temas tabú o controvertidos sin rechazar preguntas, útil para investigación en ciencias sociales o simulación de personajes.
- Análisis de documentos extensos: con 262K de contexto, puede procesar libros completos, expedientes legales o informes técnicos de cientos de páginas en una sola pasada, extrayendo información y resumiendo.
- Generación de código y automatización de tareas de programación: soporta tool calling y puede integrarse en pipelines de CI/CD para revisar código, generar tests o autocompletar funciones, aunque la falta de alineación puede producir código con vulnerabilidades si no se supervisa.
- Agentes autónomos para investigación: gracias a sus capacidades de razonamiento y uso de herramientas, puede ejecutar búsquedas web, interactuar con APIs y componer informes, siendo útil para asistentes de investigación en entornos controlados.
- Creación de contenido creativo sin censura: escritura de ficción, guiones o material educativo que requiera explorar temas sensibles sin filtros automáticos.
- Prototipado de aplicaciones de visión-lenguaje: al aceptar imágenes, puede describir fotografías, extraer texto de capturas o responder preguntas sobre contenido visual, por ejemplo en sistemas de accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los resultados de búsqueda mencionan puntuaciones como DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3 para el Qwen3.8-27B original, pero no se ha confirmado que esta variante "heretic" mantenga el mismo rendimiento, ya que la ablación de características puede degradar algunas capacidades. Se recomienda evaluar el modelo en las tareas objetivo antes de su uso en producción.

## Requisitos de hardware

- Tamaño del modelo en 6-bit: aproximadamente 20 GB (para 27B parámetros), lo que requiere al menos 24 GB de memoria unificada en Apple Silicon o 24 GB de VRAM en GPUs NVIDIA.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 40GB, H100 80GB; en AMD, Radeon RX 7900 XTX (24 GB) con soporte de MLX o LM Studio.
- En Macs: Mac Studio con M1 Ultra/M2 Ultra (64 GB o más) o MacBook Pro con M3 Max (48 GB) pueden ejecutar el modelo en 6-bit con comodidad.
- Opciones de despliegue: mlx-lm (Apple Silicon), llama.cpp con conversión GGUF, Ollama (si se convierte), vLLM para GPU NVIDIA, LM Studio para uso local.
- Latencia y throughput: no disponibles. Para un modelo de 27B en 6-bit, se espera una generación de 10-20 tokens/s en una RTX 4090 y 5-10 tokens/s en un Mac M2 Ultra, pero son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa fiable. Como referencia, el modelo base Qwen3.8-27B se posiciona frente a otros modelos de 27B como Gemma 3 27B o Mistral Large 2, con la ventaja de su contexto de 262K y su naturaleza multimodal. La variante "heretic" se diferencia por la eliminación de la alineación de seguridad, lo que la hace inadecuada para aplicaciones que requieran moderación de contenido. No se han encontrado modelos comparables con el mismo perfil "uncensored" y formato MLX en la información disponible.

## Limitaciones y advertencias

- La eliminación de la alineación de seguridad (abliteration) implica que el modelo puede generar contenido ofensivo, ilegal, peligroso o éticamente cuestionable sin restricciones. No debe utilizarse en aplicaciones públicas sin un filtro adicional.
- El proceso de ablación puede degradar el rendimiento en tareas que requieren seguir instrucciones de seguridad o en benchmarks de razonamiento alineado.
- No se dispone de información sobre los datos de entrenamiento de la variante "heretic", por lo que se desconocen sesgos específicos. El modelo base Qwen3.8-27B puede presentar sesgos culturales o lingüísticos heredados de su entrenamiento.
- Riesgo de alucinación: como cualquier modelo generativo, puede inventar información, especialmente en temas especializados. La falta de alineación no corrige este problema.
- La discrepancia en el número de parámetros reportado (5.9B en safetensors vs 27B nominal) debe verificarse antes de asumir el tamaño real del modelo.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal del contenido generado recae en el usuario. Algunas jurisdicciones pueden tener restricciones sobre contenido generado sin moderación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wwayu/Qwen3.8-27B-heretic-mlx-6Bit
- Modelo base (choz/Qwen3.8-27B-heretic): https://huggingface.co/choz/Qwen3.8-27B-heretic
- Guía de ejecución en AMD (blog oficial): https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Cómo ejecutar Qwen3.8-27B localmente (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Guía para Mac y GPU (24GB): https://modelfit.io/blog/run-qwen38-27b-locally-2026/
