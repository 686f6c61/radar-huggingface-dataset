# yozzaofficial/narrow-distill-1B

## Resumen

Narrow-Distill-1B es un modelo de lenguaje experimental de 166 millones de parámetros desarrollado por yozzaofficial como parte de una investigación sobre si la profundidad supera a la anchura en transformadores con presupuesto de parámetros equivalente. Su arquitectura es "narrow-and-deep": dimensión de modelo 256 y 200 capas, frente a un baseline "wide" de 12 capas y 185 millones de parámetros. Fue entrenado mediante destilación de conocimiento desde Qwen2.5-Coder-14B sobre un corpus reducido de aproximadamente 270 000 palabras.

El modelo no está pensado para uso general ni producción: emplea un tokenizador word-level propio, no compatible con `AutoTokenizer` de HuggingFace, carece de formato de chat o instrucciones, y su ventana de contexto es de 512 tokens. Su valor reside en el experimento que documenta: comparar la perplejidad de una red estrecha y profunda frente a una ancha y poco profunda con recursos similares. Los resultados reportados indican que la variante estrecha logró mejor perplejidad, lo que respalda la hipótesis planteada.

El repositorio incluye el código de entrenamiento, el script de evaluación y el peso del modelo en formato PyTorch (`.pt`). Forma parte del proyecto más amplio ChunkLLM, orientado a ejecutar modelos grandes en hardware de consumo con poca RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer narrow-and-deep (d_model=256, 200 capas, 8 cabezas, d_ff=1024) |
| Parametros totales | 166 millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (pesos en bfloat16) |
| Idiomas soportados | No disponible (corpus en ingles, presumiblemente) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar con normalización pre-LayerNorm, atención causal multi-cabeza (8 cabezas, dimensión de cabeza 32) y feed-forward con GELU. La peculiaridad es su forma: 200 capas apiladas con una dimensión de modelo de solo 256, en contraste con el baseline ancho de 12 capas y dimensión 1024. El tokenizador es word-level con un vocabulario de 16 384 tokens, construido a medida y no compatible con los tokenizadores BPE o SentencePiece habituales.

El entrenamiento se realizó mediante destilación desde Qwen2.5-Coder-14B, probablemente usando las salidas del profesor como supervisión sobre el corpus de 270 000 palabras. No se menciona el uso de RLHF, DPO u otras técnicas de alineación. El experimento compara la perplejidad del modelo narrow frente al baseline wide entrenado sobre el mismo corpus destilado; el narrow obtuvo mejor perplejidad, lo que sugiere que la profundidad favorece la generalización en este régimen de parámetros.

## Capacidades

- Generación de texto autoregresiva básica: dado un contexto de hasta 512 tokens, produce continuaciones palabra a palabra.
- Modelado de lenguaje puro: sin instrucciones, sin chat, sin system prompts.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso más allá de la generación secuencial.
- Sin capacidades multimodales (visión, audio).
- Multilingüismo: no documentado; el corpus de entrenamiento parece ser en inglés, pero no se especifica.
- Útil como objeto de estudio para análisis de scaling laws, destilación y arquitecturas extremas.

## Casos de uso

- Investigación académica sobre arquitecturas transformer: permite reproducir el experimento narrow-vs-wide y analizar cómo la profundidad afecta a la perplejidad y a la representación interna.
- Estudio de destilación de conocimiento: sirve como ejemplo de cómo un modelo pequeño puede aprender de un profesor grande con un corpus limitado.
- Análisis de la relación entre profundidad y capacidad de generalización: los resultados pueden informar el diseño de arquitecturas más eficientes.
- Base para experimentos de pruning o sparse training: su estructura de 200 capas con dimensión pequeña puede ser un banco de pruebas para técnicas de compresión.
- Componente de investigación para el proyecto ChunkLLM: los hallazgos sobre arquitecturas estrechas y profundas podrían influir en el diseño de routers o modelos auxiliares para ejecutar LLMs grandes en hardware limitado.
- Ejemplo didáctico en cursos de aprendizaje profundo: el código de carga es sencillo y permite ilustrar la implementación de un transformer desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato reportado es la comparación de perplejidad entre Narrow-Distill-1B y el baseline wide (185M parámetros), donde el modelo narrow obtuvo mejor perplejidad, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada: con 166 millones de parámetros en bfloat16, el peso ocupa aproximadamente 332 MB. Con overhead de activaciones y optimizador (si se entrena), cabe en cualquier GPU moderna con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer (RTX 3060, RTX 4090, etc.) o incluso CPU. No se requieren GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, sobradamente. También puede ejecutarse en Apple Silicon con 16 GB de RAM, como indica el contexto del proyecto ChunkLLM.
- Opciones de despliegue: no es compatible con vLLM, Ollama o TGI por su tokenizador custom y su formato de pesos. Debe cargarse mediante el código PyTorch proporcionado en la model card.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño (166M) la inferencia será rápida en GPU, probablemente del orden de cientos de tokens por segundo en una RTX 4090.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar (p. ej., GPT-2 pequeño, Pythia-160M, OPT-125M) en términos de rendimiento, ya que no se han publicado benchmarks. La comparación directa con el baseline wide (185M) es la única disponible y se limita a perplejidad. No se puede establecer una comparativa objetiva sin métricas adicionales.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto coherente más allá de patrones estadísticos del corpus reducido.
- Tokenizador word-level no estándar: no es compatible con `AutoTokenizer` ni con la mayoría de pipelines de HuggingFace. Requiere código personalizado para cargar y preprocesar.
- Sin formato de chat ni instrucciones: no se puede usar para tareas conversacionales o de seguimiento de instrucciones.
- Corpus de entrenamiento muy pequeño (~270K palabras): limita severamente la cobertura léxica y temática.
- Ventana de contexto de solo 512 tokens: insuficiente para tareas que requieran contexto largo.
- Riesgo de alucinación y errores gramaticales: al ser un modelo de investigación, no se ha sometido a alineación ni filtrado de contenido.
- Licencia MIT: permite uso comercial y modificación, pero el autor advierte explícitamente que no es apto para producción.
- Sin garantías de seguridad: no se han realizado evaluaciones de sesgos, toxicidad o robustez.

## Enlaces

- Modelo en HuggingFace: [yozzaofficial/narrow-distill-1B](https://huggingface.co/yozzaofficial/narrow-distill-1B)
- Repositorio del experimento (código de entrenamiento, evaluación y writeup): [github.com/yozzaofficial/Narrow-Model](https://github.com/yozzaofficial/Narrow-Model)
- Proyecto ChunkLLM (contexto de investigación): [github.com/yozzaofficial/ChunkLLM](https://github.com/yozzaofficial/ChunkLLM)
