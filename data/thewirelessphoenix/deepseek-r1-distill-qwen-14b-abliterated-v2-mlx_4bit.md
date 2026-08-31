# TheWirelessPhoenix/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2-mlx_4bit

## Resumen

TheWirelessPhoenix/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2-mlx_4bit es una conversión al formato MLX (Apple Silicon) en cuantización de 4 bits del modelo huihui-ai/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2. Este último es una variante "abliterated" (modificada para eliminar los mecanismos de rechazo de contenido) del modelo DeepSeek-R1-Distill-Qwen-14B, un modelo de razonamiento de 14 000 millones de parámetros destilado por DeepSeek a partir de su modelo R1. La conversión MLX permite ejecutar el modelo de forma eficiente en hardware de Apple mediante la librería mlx-lm, manteniendo las capacidades de razonamiento y generación de texto del original, pero sin los filtros de seguridad habituales.

El modelo está dirigido a desarrolladores e investigadores que necesitan un LLM de razonamiento con capacidad de generar contenido sin censura en entornos locales de Apple. Al estar cuantizado a 4 bits, el tamaño del repositorio es de 8,3 GB, lo que facilita su despliegue en equipos con memoria unificada moderada. La arquitectura base es Qwen2, con una ventana de contexto que no se especifica en la información disponible, aunque el modelo original soporta 32 768 tokens. La licencia no está declarada en la ficha de HuggingFace, aunque el modelo base DeepSeek-R1-Distill-Qwen-14B se distribuye bajo MIT; la versión abliterated puede tener restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) |
| Parametros totales | 2 308 527 104 (cuantizados a 4 bits) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta 32 768 tokens) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión directa a MLX del checkpoint abliterated de DeepSeek-R1-Distill-Qwen-14B. La arquitectura subyacente corresponde a Qwen2, un transformer decoder con atención completa, normalización RMSNorm y activaciones SwiGLU. El proceso de destilación original, realizado por DeepSeek, consistió en entrenar a Qwen2-14B con datos de razonamiento generados por DeepSeek-R1, lo que le confiere capacidades de razonamiento paso a paso y autoverificación. La versión abliterated, creada por huihui-ai, elimina las direcciones de activación responsables de los rechazos de contenido, de modo que el modelo genera respuestas sin filtrar incluso ante peticiones que normalmente desencadenarían negativas. La conversión a MLX se realizó con mlx-lm 0.32.0, manteniendo la arquitectura y los pesos cuantizados a 4 bits para optimizar el uso de memoria en chips Apple.

## Capacidades

- Generación de texto y razonamiento paso a paso (chain-of-thought) gracias a la destilación de DeepSeek-R1.
- Razonamiento matemático y lógico, con capacidad de descomponer problemas complejos en subproblemas.
- Generación de código y asistencia en programación, aunque no se especifica un entrenamiento específico en código.
- Conversación multi-turno mediante chat template estándar (tokenizer con chat_template).
- Capacidad de generar contenido sin restricciones de seguridad (abliterated), incluyendo temas que otros modelos rechazan.
- Soporte de tool calling: no confirmado en la información disponible, aunque la arquitectura Qwen2 puede soportarlo.
- Sin capacidades multimodales (solo texto).

## Casos de uso

- Investigación en alineación y seguridad de IA: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, útil para analizar sesgos y riesgos de contenido no filtrado.
- Generación creativa sin restricciones: escritura de ficción, guiones o contenido narrativo que aborde temas tabú o controvertidos sin censura automática.
- Desarrollo de asistentes locales en Apple Silicon: gracias al formato MLX y la cuantización 4-bit, se puede integrar en aplicaciones macOS o iOS mediante mlx-lm para generar respuestas con razonamiento.
- Prototipado rápido de agentes conversacionales: el modelo puede mantener diálogos extensos y razonar sobre contexto, adecuado para chatbots de investigación o demos técnicas.
- Análisis de razonamiento automático: al ser un modelo destilado de R1, se puede utilizar para evaluar la calidad del razonamiento en tareas de lógica y matemáticas sin depender de APIs externas.
- Educación y estudio de modelos de lenguaje: permite a estudiantes y desarrolladores experimentar con un LLM de razonamiento de 14B en hardware local, comprendiendo su comportamiento y limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base DeepSeek-R1-Distill-Qwen-14B reporta en su ficha oficial resultados como MMLU 71,3 %, HumanEval 69,2 % y GSM8K 83,9 %, pero estos datos corresponden al checkpoint original sin cuantizar y sin abliteración. La cuantización 4-bit puede degradar ligeramente el rendimiento, aunque no se dispone de mediciones específicas para esta conversión MLX.

## Requisitos de hardware

- Modelo MLX 4-bit con 2 308 527 104 parámetros efectivos, lo que ocupa aproximadamente 8,3 GB en disco.
- Memoria unificada mínima recomendada: 12 GB para cargar el modelo y dejar espacio para el contexto y la generación (en Apple Silicon).
- GPUs compatibles: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 12 GB de RAM unificada; para contextos largos se recomienda 16 GB o más.
- No cabe en GPUs NVIDIA de consumo sin conversión adicional a otro formato (p. ej., GGUF), pero la versión MLX está optimizada exclusivamente para Apple.
- Despliegue: mediante mlx-lm (Python) o integración en aplicaciones Swift/Objective-C con el paquete MLX Swift.
- Latencia estimada: no disponible; dependerá del chip y de la longitud del contexto, pero en un M2 Pro se pueden esperar entre 10 y 20 tokens por segundo en 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TheWirelessPhoenix/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2-mlx_4bit | 2,3 B efectivos (14 B original) | No disponible | No disponible | MLX 4-bit | Abliterated, sin filtros |
| huihui-ai/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2 | 14 B | 32 768 | MIT (base) | Safetensors | Abliterated, original |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-14B | 14 B | 32 768 | MIT | Safetensors | Modelo oficial destilado |
| TheBloke/DeepSeek-R1-Distill-Qwen-14B-GGUF | 14 B | 32 768 | MIT | GGUF | Cuantizaciones para CPU/GPU NVIDIA |

La conversión MLX se diferencia de las alternativas GGUF por estar optimizada para Apple Silicon, mientras que el modelo abliterated elimina los rechazos de contenido que sí están presentes en el modelo oficial.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido ofensivo, ilegal o peligroso sin advertencias previas. No debe usarse en producción sin medidas de moderación adicionales.
- La cuantización 4-bit puede reducir la precisión en tareas de razonamiento complejo y aumentar la probabilidad de alucinaciones.
- No se dispone de información sobre sesgos específicos, pero al derivar de Qwen2-14B es probable que herede sesgos culturales y lingüísticos del entrenamiento original.
- La licencia no está declarada; aunque el modelo base es MIT, la versión abliterated podría no cumplir con los términos de uso de DeepSeek si se redistribuye comercialmente.
- El formato MLX es exclusivo de Apple Silicon; no es compatible directamente con GPUs NVIDIA o AMD sin conversión previa.
- La ventana de contexto no se especifica en la conversión, pero se asume la del modelo base (32 768 tokens); superar ese límite puede degradar la coherencia.

## Enlaces

- [HuggingFace - TheWirelessPhoenix/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2-mlx_4bit](https://huggingface.co/TheWirelessPhoenix/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2-mlx_4bit)
- [HuggingFace - huihui-ai/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2](https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-14B-abliterated-v2)
- [HuggingFace - deepseek-ai/DeepSeek-R1-Distill-Qwen-14B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B)
- [GitHub - DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1)
- [NVIDIA NIM - deepseek-r1-distill-qwen-14b](https://build.nvidia.com/deepseek-ai/deepseek-r1-distill-qwen-14b)
- [Sitio oficial de DeepSeek](https://deepseek.com/en/index.html)
