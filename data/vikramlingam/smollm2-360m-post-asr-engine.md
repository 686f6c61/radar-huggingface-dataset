# vikramlingam/SmolLM2-360M-Post-ASR-Engine

## Resumen

SmolLM2-360M-Post-ASR-Engine es un ajuste fino compacto del modelo HuggingFaceTB/SmolLM2-360M-Instruct, desarrollado por Vikram Lingam. Su propósito es actuar como un motor de formateo posterior a reconocimiento automático del habla (ASR): transforma transcripciones brutas, sin puntuación ni estructura, en texto limpio y organizado mediante tokens de tarea específicos. El modelo resuelve el problema de que los transcriptores ASR generan texto sin puntuación, capitalización o formato, lo que dificulta su uso directo en correos, actas o subtítulos.

Con 361 millones de parámetros, es una solución ligera que puede ejecutarse en dispositivos de bajo consumo, incluidos Apple Silicon, CPU y GPUs consumer. Se entrenó con la técnica Weight-Decomposed Low-Rank Adaptation (DoRA) sobre el modelo base, fusionando los pesos adaptados en un único checkpoint. Su relevancia radica en ofrecer una alternativa local, privada y de bajo coste a los grandes modelos de lenguaje para tareas específicas de formateo de texto, sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: SmolLM2-360M-Instruct) |
| Parametros totales | 361.821.120 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Safetensors (fp32), MLX, GGUF (Q4_K_M) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, MLX, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de SmolLM2-360M-Instruct, un modelo de 361M parámetros entrenado originalmente sobre 4 billones de tokens según la documentacion de Hugging Face. El ajuste fino se realizó con DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone los pesos en magnitud y direccion, aplicada mediante la libreria `mlx-lm` en Apple Silicon. Se empleó prompt loss masking, lo que significa que la funcion de perdida solo se calcula sobre la respuesta generada, no sobre el prompt, para evitar que el modelo aprenda a reproducir la instruccion.

El entrenamiento fusionó los pesos adaptados en un checkpoint standalone, eliminando la necesidad de cargar adaptadores por separado. La model card indica restricciones de estilo: se prohibieron expresiones conversacionales tipicas de modelos grandes (como "delve", "in summary", "tapestry") y el uso de rayas em dash, para forzar salidas directas y profesionales.

## Capacidades

- Formateo de transcripciones ASR: restaura puntuacion, capitalizacion, numeros y abreviaturas tecnicas.
- Generacion de correos estructurados a partir de notas dictadas (token `<|task:format_email|>`), incluyendo asunto y cuerpo.
- Extraccion de puntos clave en viñetas desde reuniones o dictados de standup (token `<|task:bullet_points|>`).
- Limpieza y puntuacion de texto bruto (token `<|task:clean_punctuate|>`).
- Parafraseo neutral de transcripciones verbosas o conversacionales (token `<|task:neutral_paraphrase|>`).
- Soporte de formato de chat (ChatML) para integracion con pipelines de generacion.
- No incluye capacidades de vision, audio, tool calling o razonamiento multi-paso.

## Casos de uso

- **Post-procesado de transcripciones de reuniones**: el modelo convierte dictados brutos en actas con viñetas accionables, listas para compartir en herramientas de productividad.
- **Redaccion de correos por voz**: un asistente de dictado puede usar el token `format_email` para estructurar un correo con asunto y cuerpo a partir de una nota hablada, ahorrando tiempo de edicion manual.
- **Limpieza de subtitulos generados por ASR**: el token `clean_punctuate` restaura puntuacion y capitalizacion en subtitulos automaticos, mejorando la legibilidad en videos o transmisiones en vivo.
- **Parafraseo neutral de notas de campo**: profesionales que dictan observaciones verbales pueden obtener resumenes concisos y objetivos mediante el token `neutral_paraphrase`, util en entornos medicos o legales.
- **Integracion en pipelines de transcripcion en tiempo real**: al ser un modelo pequeño, puede ejecutarse localmente en dispositivos edge (Raspberry Pi, portatiles) para formatear la salida de un ASR sin latencia apreciable.
- **Pre-procesamiento de datos para entrenar otros modelos**: las salidas limpias y estructuradas pueden usarse como datos de alta calidad para ajustar modelos mas grandes o para alimentar sistemas de busqueda y analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (como MMLU, HumanEval o GSM8K) ni comparaciones cuantitativas con otros modelos de formateo. Se desconoce el rendimiento exacto en tareas de puntuacion o parafraseo.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 361M parametros, en fp32 ocupa aproximadamente 1,4 GB; en bf16 unos 0,7 GB; en cuantizacion Q4_K_M (GGUF) alrededor de 0,25 GB. Por tanto, cabe en cualquier GPU con mas de 1 GB de VRAM y tambien en CPU.
- **GPU recomendadas**: cualquier GPU moderna, incluidas RTX 3060, RTX 4090, A100, H100. En Apple Silicon se ejecuta de forma nativa con MLX.
- **Despliegue en CPU**: viable con llama.cpp u Ollama, con latencia de pocos milisegundos por token en un procesador moderno.
- **Opciones de despliegue**: `mlx-lm` para Apple Silicon, `transformers` con PyTorch, `llama.cpp` para GGUF, o servidores compatibles con endpoints (el repo indica `endpoints_compatible`).
- **Latencia y throughput**: no se proporcionan datos oficiales, pero por el tamano del modelo se espera una generacion de 100-200 tokens/segundo en GPU consumer y 20-50 tokens/segundo en CPU de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea principal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM2-360M-Post-ASR-Engine | 361M | No disponible | Formateo post-ASR | Apache-2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 361M | No disponible | Chat e instrucciones generales | Apache-2.0 | Hugging Face |
| Otros modelos de formateo ASR | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base, ya que no se encontraron alternativas especificas de formateo ASR con caracteristicas comparables en la informacion disponible.

## Limitaciones y advertencias

- **Solo ingles**: el modelo fue entrenado exclusivamente con datos en ingles; no soporta otros idiomas.
- **Alcance limitado**: esta especializado en las cuatro tareas definidas por los tokens; fuera de ellas puede producir salidas incoherentes o alucinadas.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede inventar contenido si el prompt es ambiguo o contiene informacion contradictoria.
- **Contexto limitado**: la longitud de contexto no se especifica, pero hereda la del modelo base SmolLM2-360M-Instruct, que es relativamente corta (tipicamente 4096 tokens), por lo que transcripciones muy largas deben segmentarse.
- **Restricciones de estilo**: el modelo rechaza ciertas expresiones y em dashes, lo que puede limitar su uso en contextos donde se requiera un tono mas coloquial.
- **Sin tool calling ni agentes**: no admite funciones externas ni razonamiento multi-paso; es exclusivamente un motor de formateo.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre la calidad de las salidas en produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/vikramlingam/SmolLM2-360M-Post-ASR-Engine)
- [Modelo base SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- [Coleccion SmolLM2 de Hugging Face](https://huggingface.co/collections/HuggingFaceTB/smollm2)
- [Repositorio GitHub de SmolLM](https://github.com/huggingface/smollm)
- [Perfil de GitHub del autor](https://github.com/vikramlingam/)
