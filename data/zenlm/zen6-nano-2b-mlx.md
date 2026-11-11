# zenlm/zen6-nano-2b-mlx

## Resumen

Zen 6 Nano (2B) es un modelo multimodal de tipo image-text-to-text desarrollado por Hanzo AI y Zen LM, distribuido en formato nativo MLX para Apple Silicon. Se publica bajo licencia Apache-2.0 y está pensado para ejecutarse en hardware de Apple (M1, M2, M3 y M4 Max) aprovechando el framework MLX. El modelo combina un núcleo de lenguaje de aproximadamente 2.213 millones de parámetros con una torre de visión en FP16, y se distribuye con pesos cuantizados en 2 bits mediante una técnica propietaria denominada "Hadamard-basis ternary STE QAT" (entrenamiento con cuantización consciente y estimador de gradiente recto sobre base Hadamard).

La propuesta diferencial es doble: por un lado, un esquema de cuantización ternario/2-bit que reduce drásticamente el peso del repositorio (1,2 GB) manteniendo, según el autor, los parámetros exactos del modelo original post-entrenado; por otro, la integración de capacidades agénticas mediante el protocolo MCP (Model Context Protocol) de Hanzo, con soporte explícito de llamadas a herramientas a través de etiquetas `<tool_call>`. El modelo también incorpora identidad propia ("Zen 6") y está etiquetado como conversacional y multimodal.

Es relevante ahora porque ejemplifica una tendencia creciente: modelos pequeños (2B) cuantizados agresivamente para inferencia local en dispositivos de consumo, con soporte de tool calling y visión, lo que los hace candidatos para asistentes locales, automatización en el borde y prototipado rápido sin dependencia de GPU dedicadas. No obstante, la información pública disponible es muy limitada: no se detallan datos de entrenamiento, benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (torre de visión FP16 + núcleo de lenguaje), con cuantización ternaria/2-bit sobre base Hadamard; no se detalla la arquitectura interna del núcleo |
| Parametros totales | 2.213.649.216 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit affine Hadamard (ternario, STE QAT); torre de visión en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con runtime propio en `runtime/` y `quickstart.py` |

## Arquitectura y entrenamiento

El modelo se describe como un sistema multimodal image-text-to-text con un núcleo de lenguaje de 2B parámetros y una torre de visión en FP16. La innovación técnica principal es el esquema de cuantización: pesos ternarios en 2 bits obtenidos mediante entrenamiento con cuantización consciente (QAT) y estimador de gradiente recto (STE) sobre una base Hadamard, lo que según el autor preserva los parámetros exactos del modelo `zen6-nano` original post-entrenado. El repositorio incluye un directorio `runtime/` específico para manejar esta representación Hadamard y un script `quickstart.py` para ejecución directa en Apple Silicon.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla la arquitectura interna del núcleo (número de capas, dimensiones, mecanismo de atención) ni la del codificador visual. El modelo incorpora identidad "Zen 6" y capacidades agénticas MCP mediante etiquetas `<tool_call>`, lo que sugiere un post-entrenamiento orientado a instrucciones y uso de herramientas, pero no se aportan detalles del proceso.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imágenes y texto combinados (pipeline image-text-to-text), con torre de visión en FP16.
- Llamadas a herramientas mediante el protocolo MCP de Hanzo, con formato `<tool_call>`.
- Comportamiento agéntico orientado a flujos multi-paso (según la descripción del autor).
- Identidad de modelo propia ("Zen 6") integrada en las respuestas.
- Ejecución nativa en Apple Silicon mediante MLX.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Soporte de audio: no disponible.

## Casos de uso

- Asistente local en Mac: el modelo puede ejecutarse íntegramente en un Mac con chip M1/M2/M3/M4 Max gracias a su formato MLX 2-bit y su tamaño de repositorio de 1,2 GB, ofreciendo conversación multimodal sin conexión a servicios externos.
- Automatización agéntica con MCP: al soportar `<tool_call>` y el protocolo MCP, puede integrarse en flujos donde el modelo decide invocar herramientas externas (consultas a APIs, operaciones sobre ficheros, etc.) desde un entorno local.
- Análisis de imágenes en el borde: la torre de visión FP16 permite tareas de descripción de imágenes, extracción de información visual o respuesta a preguntas sobre capturas, útil en prototipos de accesibilidad o documentación automática.
- Prototipado rápido de aplicaciones multimodales: el `quickstart.py` y el runtime incluido permiten validar ideas de producto en minutos en hardware Apple, sin necesidad de infraestructura GPU.
- Chatbot de soporte en dispositivos de consumo: su tamaño reducido y licencia Apache-2.0 facilitan desplegar asistentes conversacionales en equipos de usuario final con requisitos de privacidad.
- Investigación en cuantización extrema: el esquema ternario Hadamard STE QAT lo convierte en un caso de estudio para evaluar la degradación de calidad en modelos 2B cuantizados a 2 bits.
- Educación y demos: adecuado para talleres y demostraciones de IA local en Apple Silicon por su facilidad de instalación y bajo peso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio ocupa 1,2 GB, por lo que la inferencia cabe holgadamente en la memoria unificada de cualquier chip Apple Silicon moderno (8 GB o más recomendable).
- GPU recomendadas: Apple M1, M2, M3 y M4 Max (según el autor); no se menciona soporte para GPU NVIDIA o AMD.
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para Apple Silicon; no se indica compatibilidad con RTX 4090 u otras GPU dedicadas.
- Opciones de despliegue: MLX con el runtime propio incluido (`runtime/vision_artifact.py`, `quickstart.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa con alternativas de 2B multimodales o con otros modelos MLX.

## Limitaciones y advertencias

- Información pública muy escasa: no hay datos de entrenamiento, benchmarks, idiomas ni contexto, lo que impide evaluar su calidad de forma objetiva.
- Cuantización agresiva a 2 bits: aunque el autor afirma preservar los parámetros exactos, la cuantización ternaria puede degradar el rendimiento en tareas de razonamiento complejo, matemáticas o código; no hay evidencia publicada al respecto.
- Riesgo de alucinación: inherente a modelos de 2B parámetros; no se han publicado evaluaciones de fidelidad.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación.
- Idiomas: no se especifican; se desconoce si el modelo está optimizado para castellano.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar el fichero `NOTICE` para cumplir con las atribuciones de componentes upstream.
- Dependencia de Apple Silicon: el formato MLX limita su uso a hardware Apple; no es portable a GPU NVIDIA/AMD sin conversión.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación por la comunidad.
- Contexto desconocido: sin longitud de contexto publicada, no se puede garantizar su idoneidad para tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano-2b-mlx
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
