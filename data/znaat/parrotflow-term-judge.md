# znaat/parrotflow-term-judge

## Resumen

ParrotFlow term judge es un adaptador LoRA de bajo rango diseñado para una tarea muy concreta: decidir si una palabra mal transcrita en un dictado por voz debe sustituirse por un término de la lista personal del usuario. Forma parte de ParrotFlow, una aplicación de dictado local para macOS, y no es un modelo de propósito general. El adaptador se ha entrenado sobre la conversión a 4 bits en formato MLX de Qwen3-1.7B-Base, de modo que hereda la arquitectura transformer de Qwen3 y su ventana de contexto, aunque el adaptador en sí solo se utiliza para una clasificación binaria de sustitución.

El problema que resuelve es específico del reconocimiento automático del habla en contextos técnicos: nombres propios, marcas y tecnologías se transcriben mal con frecuencia y el usuario mantiene una lista de términos que quiere preservar. El adaptador recibe la lista de términos y una frase dictada, y calcula la probabilidad de que una palabra concreta deba reemplazarse por uno de esos términos comparando P(" yes") frente a P(" no") en la última posición del modelo.

Es relevante para desarrolladores que construyan herramientas de dictado o asistentes de voz locales en macOS, porque demuestra un patrón de adaptación de un modelo pequeño (1.700 millones de parámetros) a una tarea de juicio léxico mediante LoRA y cuantización de 4 bits, con inferencia enteramente local a través de MLX. Su licencia Apache 2.0 facilita la reutilización, aunque la información publicada sobre el adaptador es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-1.7B-Base) con adaptador LoRA de rango 8 sobre la conversión MLX a 4 bits |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B-Base); el adaptador LoRA añade parámetros de bajo rango no cuantificados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-1.7B-Base) |
| Tipos de cuantizacion | 4 bits en formato MLX (generado con `mlx_lm convert -q --q-bits 4`) |
| Idiomas soportados | No disponibles oficialmente; los datos de entrenamiento incluyen aproximadamente un 14 % de francés y el resto en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA en MLX; el base es `model.safetensors` en MLX) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B-Base en su conversión a 4 bits para MLX, con revisión fija `d12621072e81eb70d6ba1f01583141785c74fa6a` y hash sha256 del fichero `model.safetensors` `3b29904336e6b2fdfb80af60541e23a14b3e729de80df0ca178f661a9d0f448d`. El autor especifica que el mismo fichero se obtiene ejecutando `mlx_lm convert --hf-path Qwen/Qwen3-1.7B-Base -q --q-bits 4` con mlx-lm 0.32.2 y mlx 0.32.4 sobre la revisión `ea980cb0a6c2ae4b936e82123acc929f1cec04c1` de Qwen3-1.7B-Base. El adaptador LoRA tiene rango 8, escala 20, se aplica sobre 16 capas y se entrenó durante 2 épocas con tasa de aprendizaje 7e-5, tamaño de lote 4 y semilla 0.

El conjunto de entrenamiento consta de 1.867 filas totalmente sintéticas: textos generados por modelos de lenguaje (mensajes de agentes de código, Slack, extractos de blog, con aproximadamente un 14 % en francés) construidos alrededor de nombres inventados, palabras comunes usadas como nombres y nombres con puntos o letras. No se utilizaron dictados reales de usuarios. El adaptador aprendió la habilidad de decidir sustituciones sobre esa lista artificial, y en tiempo de inferencia la lista de términos se proporciona dinámicamente. La decisión se toma comparando la probabilidad de " yes" frente a " no" en la última posición del modelo, un esquema de clasificación binaria por puntuación de tokens.

## Capacidades

- Juicio de sustitución léxica: dada una lista de términos y una frase dictada, decide si una palabra concreta debe reemplazarse por un término de la lista.
- Puntuación binaria por probabilidad de token: calcula P(" yes") frente a P(" no") en la última posición para emitir la decisión.
- Manejo de listas de términos arbitrarias en tiempo de inferencia, incluyendo nombres inventados, palabras comunes usadas como nombres y nombres con puntos o letras.
- Comprensión de frases de dictado en contextos técnicos (mensajes de agentes de código, Slack, blogs), según la composición de los datos de entrenamiento.
- Cobertura limitada de francés (aproximadamente el 14 % de los datos de entrenamiento).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; es un adaptador de clasificación, no un modelo generativo de propósito general.

## Casos de uso

- Corrección de dictado técnico en macOS: integrado en ParrotFlow, el adaptador detecta que "sod" debería ser "Zod" en una frase como "we validate the payload with sod before saving" y propone la sustitución antes de insertar el texto en el editor.
- Preservación de marcas y nombres propios en transcripciones: el usuario mantiene una lista de tecnologías (Rust, PostHog, Drizzle, Bun) y el adaptador decide qué palabras mal transcritas corresponden a esas entradas, reduciendo ediciones manuales posteriores.
- Asistentes de voz para programadores: en entornos donde se dictan nombres de librerías y frameworks, el modelo actúa como filtro de sustitución sobre la salida del ASR, sin enviar datos a la nube al ejecutarse localmente con MLX.
- Herramientas de accesibilidad: usuarios con movilidad reducida que dictan correos o documentación técnica pueden beneficiarse de la corrección automática de términos recurrentes de su vocabulario personal.
- Integración en pipelines de posprocesado de ASR: el adaptador puede insertarse como etapa de decisión entre la transcripción bruta y el texto final, consumiendo la lista de términos del usuario y emitiendo una decisión binaria por candidato.
- Experimentación con adaptadores LoRA sobre modelos pequeños cuantizados: sirve como ejemplo reproducible de entrenamiento de un adaptador de rango 8 sobre una conversión MLX a 4 bits, útil para quienes investigan clasificación léxica con modelos de 1.700 millones de parámetros en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base cuantizado a 4 bits ocupa aproximadamente 1 GB de pesos (1.700 millones de parámetros a 4 bits), más la sobrecarga del adaptador LoRA y del contexto; el consumo real de memoria unificada depende de la longitud de la secuencia y de la implementación de MLX.
- GPU recomendadas: cualquier Mac con Apple Silicon (serie M1 en adelante) es el objetivo natural, dado que el modelo está en formato MLX. No se documenta soporte para GPU NVIDIA o AMD en la información proporcionada.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada de 8 GB o superior, al tratarse de un modelo de 1.700 millones de parámetros en 4 bits.
- Opciones de despliegue: MLX y mlx-lm (versiones de referencia mlx-lm 0.32.2 y mlx 0.32.4). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ParrotFlow term judge (este adaptador) | 1.700 M (base Qwen3-1.7B-Base, 4 bits MLX) | No disponible | Clasificación binaria de sustitución léxica en dictado | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3-1.7B-Base | 1.700 M | No disponible | Modelo base generativo de propósito general | Apache 2.0 | Hugging Face |
| Adaptadores LoRA de corrección ortográfica o ASR | No disponible | No disponible | Corrección de transcripciones | Variable | No disponible |
| Modelos de clasificación de tokens (p. ej. clasificadores BERT pequeños) | No disponible | No disponible | Clasificación de secuencias | Variable | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y formato de despliegue.

## Limitaciones y advertencias

- El adaptador solo funciona con la revisión exacta del modelo base indicada (`bluevisor/Qwen3-1.7B-Base-4bit-mlx`, revisión `d12621072e81eb70d6ba1f01583141785c74fa6a`); cualquier otra conversión o cuantización puede invalidar el adaptador.
- El entrenamiento se realizó exclusivamente con datos sintéticos (1.867 filas) y sin dictados reales de usuarios, por lo que el comportamiento en vocabulario real puede diferir del observado en el conjunto de entrenamiento.
- La lista de términos no forma parte del entrenamiento: el adaptador aprendió la habilidad sobre nombres inventados y la lista se proporciona en tiempo de inferencia, lo que puede provocar decisiones erróneas con listas muy largas o términos poco representados.
- Cobertura lingüística limitada: los datos incluyen aproximadamente un 14 % de francés y el resto en inglés; no hay información sobre otros idiomas.
- Riesgo de alucinación o falsos positivos en la sustitución: al ser una decisión binaria por puntuación de tokens, puede proponer sustituciones incorrectas cuando la palabra dictada se parece fonéticamente a un término de la lista.
- No se documentan sesgos específicos, pero al derivar de Qwen3-1.7B-Base hereda los sesgos del modelo base y de los textos sintéticos generados por modelos de lenguaje.
- Uso comercial permitido por la licencia Apache 2.0, sin restricciones adicionales documentadas; conviene verificar la licencia del modelo base Qwen3-1.7B-Base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB, lo que sugiere que los pesos del adaptador podrían no estar publicados o que el repositorio está vacío; verificar antes de usarlo en producción.
- No se documenta pipeline, idiomas oficiales ni métricas de evaluación, lo que dificulta validar su calidad antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/znaat/parrotflow-term-judge
- Repositorio de ParrotFlow: https://github.com/znat/parrotflow
- Modelo base en Hugging Face: https://huggingface.co/bluevisor/Qwen3-1.7B-Base-4bit-mlx
- Modelo original Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Herramienta de conversión MLX: https://github.com/ml-explore/mlx-lm
