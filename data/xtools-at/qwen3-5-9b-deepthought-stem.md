# xtools-at/Qwen3.5-9B-DeepThought-STEM

## Resumen

Deep Thought 9B es un ajuste fino (fine-tune) de tipo LoRA en 16 bits sobre Qwen3.5-9B, desarrollado por xtools-at y especializado en razonamiento avanzado, matematicas, resolucion de problemas cientificos y conocimiento tecnico. Parte del checkpoint no censurado xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, que a su vez deriva de Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de Qwen3.5-9B destilado de respuestas de DeepSeek-V4-Pro en modo Max Effect. El modelo hereda por tanto la arquitectura multimodal de Qwen3.5-9B (image-text-to-text) con aproximadamente 9.400 millones de parametros.

El objetivo declarado es empujar un modelo de razonamiento ya capaz hacia matematicas avanzadas (demostraciones, algebra, calculo), ciencias duras (fisica, quimica, biologia a nivel de doctorado), ingenieria y descubrimiento de farmacos (razonamiento molecular y desarrollo de formulaciones). Se entrena sobre una mezcla de aproximadamente 11.000 ejemplos que combina destilaciones de trazas de razonamiento de modelos frontera con datos sinteticos especificos de industria farmaceutica.

Es relevante ahora porque demuestra una tendencia consolidada: modelos de 9B especializados mediante destilacion de trazas de razonamiento de modelos mucho mayores, publicados con licencia Apache 2.0 y con un ecosistema de cuantizaciones comunitarias (GGUF) que los hace desplegables en hardware de consumo. La etiqueta "heretic/abliterated/uncensored" indica que se ha eliminado total o parcialmente el alineamiento de rechazo del modelo base, lo que tiene implicaciones importantes para su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), multimodal image-text-to-text |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existen cuantizaciones comunitarias (GGUF) enlazadas por el autor |
| Idiomas soportados | no disponible (el autor menciona "conocimiento cientifico multilingue" como area de enfoque, sin lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); existen GGUF comunitarios |

## Arquitectura y entrenamiento

El modelo es un fine-tune LoRA (PEFT) en 16 bits sobre Qwen3.5-9B, un modelo fundacional multimodal de ~9B parametros del equipo Qwen. La card no detalla la arquitectura interna mas alla de la herencia de Qwen3.5; no se especifican mecanismos de atencion, ventana de contexto ni si incorpora innovaciones como decodificacion especulativa. La rama de razonamiento proviene de Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, entrenado con SFT sobre aproximadamente 250.000 muestras de matematicas y STEM y refinado con una etapa ligera de aprendizaje por refuerzo mediante GSPO (segun la card, ese historial corresponde al modelo upstream, no al entrenamiento de Deep Thought).

El entrenamiento propio de Deep Thought anade unos 11.000+ ejemplos organizados en tres grupos, con un 5% reservado para evaluacion. El grupo de razonamiento (6.022 ejemplos) combina destilaciones de trazas de razonamiento de modelos frontera: Claude Haiku 5.5 (2.936), GPT-5.6 Luna (1.633, con fisica, quimica, biologia e informatica), GLM-5.1 Mathematics (1.200), Xiaomi MiMo 2.6 Pro (178) y ChatGPT Terra 6.1 (75). El resto de la mezcla incluye datos sinteticos de descubrimiento y formulacion farmaceutica (red-pill-drug-discovery-formulation) y una pequena mezcla de calibracion basada en smoltalk2. La card aclara que los datos adicionales son textuales y no constituyen una etapa de entrenamiento de vision.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion de problemas en multiples pasos.
- Matematicas avanzadas: algebra, calculo, demostraciones y razonamiento cuantitativo.
- Ciencias duras: fisica, quimica, biologia y preguntas cientificas de nivel doctorado.
- Razonamiento molecular y desarrollo de formulaciones farmaceuticas (descubrimiento de farmacos).
- Conocimiento tecnico de ingenieria y analisis STEM, con enfasis declarado en conocimiento cientifico multilingue.
- Capacidad multimodal heredada de Qwen3.5 (pipeline image-text-to-text), aunque el fine-tune no incluye entrenamiento especifico de vision.
- Sin censura ni rechazos por alineamiento (etiquetas heretic, uncensored, decensored, abliterated).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el razonamiento multi-paso esta documentado; el soporte de agentes no se detalla.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Resolucion de problemas matematicos y demostraciones: el modelo puede generar derivaciones paso a paso y verificar pruebas formales, gracias al entrenamiento sobre 1.200 ejemplos de GLM-5.1 Mathematics y miles de trazas de razonamiento destiladas.
- Asistencia en investigacion cientifica: interpretacion de preguntas de fisica, quimica y biologia de nivel avanzado, util como copiloto para revisar razonamientos tecnicos o proponer hipotesis.
- Descubrimiento de farmacos y formulacion: razonamiento sobre moleculas y desarrollo de formulaciones gracias a los datasets sinteticos especificos de la industria farmaceutica incluidos en la mezcla.
- Tutoria STEM: explicacion de conceptos de ingenieria y ciencias con descomposicion estructurada, aprovechando el estilo de razonamiento de modelos frontera destilado en el entrenamiento.
- Generacion de material docente tecnico: redaccion de problemas, soluciones y explicaciones para asignaturas universitarias de matematicas y ciencias.
- Investigacion sobre alineamiento y seguridad: al ser un modelo abliterated, sirve como caso de estudio para evaluar como el desalineamiento afecta a la calidad del razonamiento y a la generacion de contenido sensible.
- Despliegue local en entornos con requisitos de privacidad: al existir cuantizaciones GGUF y licencia Apache 2.0, puede ejecutarse en infraestructura propia sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19-20 GB solo para pesos (el repositorio ocupa 19,3 GB), mas overhead de KV cache; se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: aproximadamente 10-11 GB de VRAM; a 4 bits: aproximadamente 5-6 GB, segun cuantizaciones GGUF comunitarias (no verificadas en la card).
- GPU de datacenter recomendadas: A100 40/80 GB, H100, L40S para FP16 con contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 ajustado o en cuantizaciones de 8/4 bits; en RTX 3090/4080 (16 GB) requiere cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (tag oficial), llama.cpp/Ollama mediante GGUF comunitarios, y presumiblemente vLLM (no confirmado en la card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Notas |
|---|---|---|---|---|---|
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9,4B | no disponible | STEM, matematicas, farmacia | Apache 2.0 | Fine-tune LoRA, sin censura |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9,4B | no disponible | Razonamiento general | Apache 2.0 | Modelo base directo |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9,4B | no disponible | Razonamiento general | no disponible | Upstream con SFT + GSPO |
| xtools-at/Qwen3.5-4B-DeepThought-STEM | ~4B | no disponible | STEM, matematicas | Apache 2.0 | Version reducida del mismo autor |

## Limitaciones y advertencias

- Modelo abliterated/uncensored: se ha eliminado el alineamiento de rechazo, por lo que puede generar contenido danino, ilegal o eticamente problematico sin filtros. No apto para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo de alucinacion: como todo modelo de 9B, especialmente en dominios cientificos especializados, puede fabricar referencias, datos experimentales o resultados numericos con apariencia de rigor.
- Datos de entrenamiento sinteticos: gran parte de la mezcla proviene de destilaciones de otros modelos, lo que puede propagar sesgos y errores de los profesores, ademas de estilos de razonamiento no verificados.
- Contexto e idiomas no documentados: la card no especifica ventana de contexto ni lista de idiomas; el soporte multilingue real es incierto.
- Capacidad multimodal no entrenada: aunque hereda la arquitectura image-text-to-text, los datos adicionales son solo de texto, por lo que el rendimiento en vision no esta garantizado ni evaluado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base; la especializacion declarada no esta validada con metricas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el usuario asume la responsabilidad legal y etica del contenido generado por un modelo sin alineamiento.
- Fecha de creacion futura en los metadatos (2026): conviene verificar la procedencia y reproducibilidad del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Modelo base directo: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo upstream de razonamiento: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Modelo fundacional: https://huggingface.co/Qwen/Qwen3.5-9B
- Version reducida: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- Cuantizaciones y GGUF: https://huggingface.co/models?other=base_model:adapter:xtools-at/Qwen3.5-9B-DeepThought-STEM
- Dataset Claude Haiku 5.5: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
- Dataset Xiaomi MiMo 2.6 Pro: https://huggingface.co/datasets/xtools-at/Xiaomi-MiMo-2.6-Pro-High-Reasoning-250x
- Dataset ChatGPT Terra 6.1: https://huggingface.co/datasets/xtools-at/ChatGPT-6.1-Terra-High-Reasoning-TraceInversion-80x
- Dataset GPT-5.6 Luna: https://huggingface.co/datasets/Roman1111111/GPT-5.6-luna-reasoning-102881x
- Dataset GLM-5.1 Mathematics: https://huggingface.co/datasets/Jackrong/GLM-5.1-Reasoning-1M-Cleaned/viewer/Math
- Dataset farmaceutico sintetico: https://huggingface.co/datasets/xtools-at/red-pill-drug-discovery-formulation-synthetic-reasoning
- Dataset farmaceutico base: https://huggingface.co/datasets/saidutta69/red-pill-drug-discovery-formulation
- Dataset smoltalk2: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
