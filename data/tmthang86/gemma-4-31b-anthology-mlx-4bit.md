# tmthang86/gemma-4-31B-anthology-mlx-4bit

## Resumen

gemma-4-31B-anthology-mlx-4bit es una cuantización a 4 bits en formato MLX del modelo MRockatansky/gemma-4-31B-anthology, un merge orientado a la escritura creativa y a la generación de narrativa sin filtros. Lo publica el usuario tmthang86 en Hugging Face y está pensado específicamente para ejecutarse en hardware Apple Silicon mediante mlx-lm, LM Studio u oMLX. El modelo base parte de google/gemma-4-31B-it, al que se le han fusionado otros checkpoints de la familia Gemma 4 31B de corte creativo y "herético" (sin censura), como nbeerbower/Gemma4-Gutenberg-31B-Heretic.

El resultado es un modelo de aproximadamente 30.700 millones de parámetros (30,7 B) que conserva la plantilla de chat original de Gemma 4, pero descarta la torre de visión del checkpoint multimodal de origen: es un modelo exclusivamente de texto. La cuantización se realizó con mlx-lm 0.32.2 usando 4 bits y tamaño de grupo 64, lo que reduce el repositorio a 17,3 GB, un tamaño manejable en equipos Apple con memoria unificada de 24-32 GB o superior.

Su relevancia es doble: por un lado, demuestra el flujo de conversión de modelos Gemma 4 de 31B a MLX cuantizado para inferencia local en Mac; por otro, ofrece una alternativa sin moderación para tareas de ficción, narrativa larga y experimentación creativa, con la advertencia explícita de que su salida no está filtrada. La licencia declarada es Apache 2.0, heredada de la model card del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), sin torre de visión; no se detalla la arquitectura interna exacta |
| Parametros totales | 30.697.345.280 (30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX con group-size 64 (única variante publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería mlx) |
| Modelo base | MRockatansky/gemma-4-31B-anthology (revision deed58cc7e8af8a772ace964ac900c0ef9dd41ed) |
| Modelo original de partida | google/gemma-4-31B-it |
| Herramienta de conversion | mlx-lm 0.32.2 (`mlx_lm convert -q --q-bits 4 --q-group-size 64`) |
| Tamano del repositorio | 17,3 GB |
| Modalidad | solo texto (torre de visión eliminada) |
| Plantilla de chat | Gemma 4 `chat_template.jinja` de google/gemma-4-31B-it |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Gemma 4, en su variante de 31B, del que se ha eliminado la torre de visión del checkpoint multimodal original para dejar únicamente el camino de texto. No se dispone de información sobre el número de capas, cabezas de atención, dimensiones ocultas ni mecanismos de atención específicos (atención lineal, ventanas deslizantes, etc.) en la documentación proporcionada.

El entrenamiento del modelo base google/gemma-4-31B-it no se detalla en la información disponible (número de tokens, composición del dataset, uso de RLHF o DPO). Sobre esa base, MRockatansky construyó un merge que combina nbeerbower/Gemma4-Gutenberg-31B-Heretic con otros modelos Gemma 4 31B de corte creativo y sin censura, orientado a escritura de ficción. Posteriormente, tmthang86 aplicó una cuantización de pesos a 4 bits con mlx-lm 0.32.2 (group-size 64) para su ejecución en Apple Silicon. No se documentan innovaciones técnicas adicionales como decodificación especulativa o modos de razonamiento explícito.

## Capacidades

- Generación de texto y narrativa: el modelo está afinado por merge para escritura creativa, ficción y prosa larga, con estilo derivado de los checkpoints "Gutenberg" y "Heretic" fusionados.
- Conversación multi-turno: conserva la plantilla de chat de Gemma 4, por lo que soporta diálogo estructurado con roles de usuario y asistente.
- Generación sin moderación: la model card indica explícitamente que es un modelo "uncensored/unfiltered", sin filtros de contenido en la salida.
- Solo texto: no procesa imágenes, audio ni vídeo, ya que la torre de visión fue eliminada durante la conversión.
- Capacidades multilingües: no disponible; la model card no detalla los idiomas soportados.
- Tool calling / function calling: no disponible; no se documenta soporte explícito.
- Agentes y razonamiento multi-paso: no disponible; no se documenta un modo de razonamiento o thinking.
- Ejecución local en Apple Silicon: compatible con mlx-lm, LM Studio y oMLX mediante la librería MLX.

## Casos de uso

- Escritura de ficción y novela: el modelo puede generar párrafos de apertura, capítulos completos y continuaciones narrativas con un estilo literario, gracias al merge de checkpoints entrenados sobre corpus tipo Gutenberg. Es adecuado para autores que buscan borradores sin restricciones de contenido.
- Generación de diálogos de personajes: con la plantilla de chat de Gemma 4, se puede mantener una conversación multi-turno con un personaje ficticio, ajustando el tono mediante el prompt de sistema.
- Prototipado creativo en local en Mac: al estar cuantizado a 4 bits en MLX y ocupar 17,3 GB, se puede ejecutar en un Mac con memoria unificada suficiente sin depender de la nube, lo que facilita la experimentación privada.
- Generación de contenido para juegos de rol de mesa: el modelo puede producir descripciones de escenarios, trasfondos de personajes y tramas ramificadas sin filtros, útil para dungeon masters que necesitan material improvisado.
- Exploración de estilos y voces narrativas: mediante prompts comparativos se puede usar para generar el mismo pasaje en distintos registros (gótico, noir, épico), aprovechando la mezcla de checkpoints creativos del merge.
- Investigación sobre modelos sin censura: sirve como caso de estudio para analizar el comportamiento de modelos "heréticos" fusionados y su degradación o deriva estilística tras la cuantización a 4 bits.
- Generación de texto en pipelines de mlx-lm: se puede integrar en scripts de Python con `mlx_lm.generate` para tareas batch de generación creativa en un entorno Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 17,3 GB en cuantización 4 bits; se necesita al menos esa cantidad de memoria unificada más el overhead de la KV cache y del runtime de MLX. En la práctica, se recomienda un mínimo de 24 GB de memoria unificada y, preferiblemente, 32 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon exclusivamente (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra), ya que el formato MLX está diseñado para el framework MLX de Apple. No es compatible de forma nativa con CUDA.
- Cabe en consumer GPU: no en GPUs NVIDIA de consumo mediante MLX; para Apple Silicon, sí en configuraciones con memoria unificada de 24-32 GB o superior (por ejemplo, MacBook Pro M3 Max, Mac Studio M2 Ultra).
- Opciones de despliegue: mlx-lm (CLI y API de Python), LM Studio y oMLX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, al no estar en formato GGUF ni safetensors estándar de PyTorch.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tmthang86/gemma-4-31B-anthology-mlx-4bit | 30,7 B | no disponible | MLX 4-bit | Apache 2.0 | Solo texto, sin censura, para Apple Silicon |
| MRockatansky/gemma-4-31B-anthology | no disponible | no disponible | safetensors (presumiblemente) | Apache 2.0 | Modelo fuente sin cuantizar; incluye torre de visión si el base la tenía |
| google/gemma-4-31B-it | no disponible | no disponible | safetensors | Gemma license (no confirmada en la información) | Modelo instruct original de Google, multimodal |
| nbeerbower/Gemma4-Gutenberg-31B-Heretic | no disponible | no disponible | no disponible | no disponible | Checkpoint creativo sin censura fusionado en el merge |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contenido sin moderación: la model card advierte explícitamente de que es un modelo "uncensored/unfiltered"; la salida puede ser explícita y no está filtrada. Solo para adultos y bajo responsabilidad del usuario.
- Riesgo de alucinación: al ser un modelo de generación creativa sin ajuste específico para precisión factual, es propenso a inventar datos, citas y hechos, especialmente en contextos no narrativos.
- Degradación por cuantización: la cuantización a 4 bits con group-size 64 puede introducir pérdida de calidad frente al modelo original de 31B sin cuantizar, especialmente en tareas de razonamiento o coherencia a largo plazo.
- Sin visión: la torre multimodal fue eliminada, por lo que no puede procesar imágenes aunque el modelo base sí pudiera.
- Idiomas no documentados: se desconoce el soporte real multilingüe; probablemente herede el de Gemma 4, pero no está confirmado.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva tras la conversión.
- Licencia: se declara Apache 2.0, pero el modelo base google/gemma-4-31B-it suele estar sujeto a la Gemma Terms of Use; conviene verificar la compatibilidad antes de un uso comercial, ya que la información disponible no aclara si la licencia Apache 2.0 cubre todos los componentes del merge.
- Ecosistema restringido: al ser MLX, no se puede desplegar en infraestructura NVIDIA estándar sin reconvertir el modelo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de su calidad o estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmthang86/gemma-4-31B-anthology-mlx-4bit
- Modelo base del merge: https://huggingface.co/MRockatansky/gemma-4-31B-anthology
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Checkpoint creativo fusionado: https://huggingface.co/nbeerbower/Gemma4-Gutenberg-31B-Heretic
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- LM Studio: https://lmstudio.ai
