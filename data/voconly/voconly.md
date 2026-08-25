# voconly/voconly

## Resumen

Voconly no es un modelo de inteligencia artificial en sí, sino una organización en Hugging Face que publica un ecosistema de modelos open source para su aplicación de escritorio homónima, un asistente de entrada de voz para Windows. La aplicación sigue un flujo de dos etapas: primero un modelo de reconocimiento de voz (ASR) convierte el audio en texto y, opcionalmente, un modelo de lenguaje (LLM) procesa ese texto para pulirlo, traducirlo o estructurarlo. Todo el procesamiento puede realizarse localmente, sin subir audio a la nube, lo que la hace especialmente relevante para usuarios preocupados por la privacidad o que necesitan trabajar sin conexión.

La organización publica modelos ASR en formato GGUF (Whisper Large V3 Turbo, SenseVoice Small, Qwen3-ASR 1.7B, Parakeet TDT 0.6B, Parakeet Unified EN 0.6B, Nemotron 3.5 ASR 0.6B y Cohere Transcribe 2B) y dos LLM locales (Qwen3.5-9B y Qwen3-4B-Instruct), todos ellos cuantizados para inferencia eficiente. El proyecto es obra de un desarrollador individual con 15 años de experiencia en IA y software, y su objetivo es demostrar que una sola persona puede crear productos completos con ayuda de la IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la organizacion aloja multiples arquitecturas: Whisper, SenseVoice, Parakeet, Qwen-ASR y LLMs de la familia Qwen) |
| Parametros totales | Desde 0.6B (Parakeet, Nemotron) hasta 9B (Qwen3.5-9B) |
| Parametros activos | No disponible (no se especifica si alguno es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (Q4_K_M en los LLM; cuantizacion no especificada para los modelos ASR) |
| Idiomas soportados | Ingles (en) y chino (zh) segun la model card |
| Licencia | No disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Al tratarse de una organizacion que agrupa multiples modelos, no existe una arquitectura unica. La aplicacion Voconly sigue una arquitectura de pipeline en dos etapas: la primera usa modelos ASR (Whisper, SenseVoice, Parakeet, Qwen-ASR, Nemotron o Cohere Transcribe) para transcribir el audio; la segunda usa un LLM local (Qwen3.5-9B o Qwen3-4B) para procesar el texto resultante. Todos los modelos estan publicados en formato GGUF para poder ejecutarse con llama.cpp, Ollama u otros motores de inferencia local.

No se proporcionan detalles sobre el entrenamiento de los modelos (numero de tokens, composicion del dataset, tecnicas de alineamiento como RLHF o DPO). Los modelos subyacentes son arquitecturas ya conocidas de la comunidad: Whisper de OpenAI, SenseVoice de Alibaba, Parakeet de NVIDIA, Qwen-ASR de Alibaba y Nemotron de NVIDIA, todos adaptados a GGUF por el autor del proyecto.

## Capacidades

- Reconocimiento de voz a texto (ASR) en tiempo real con varios modelos de distinto tamano y velocidad.
- Procesamiento posterior del texto con LLM: pulido, traduccion, resumen y estructuraccion.
- Funcionamiento completamente offline cuando se usan modelos locales.
- Atajos de teclado globales para activar la entrada de voz desde cualquier aplicacion.
- Soporte multilingue limitado a ingles y chino segun la model card.
- Compatible con distintos motores de reconocimiento para adaptarse a diferentes hardware y requisitos de precision.
- El flujo de dos etapas permite elegir modelos ASR y LLM de forma independiente segun el escenario.

## Casos de uso

- Creacion de contenido: el usuario dicta ideas, borradores o guiones y el LLM los estructura y pule. Es util para escritores o creadores que prefieren hablar antes que teclear.
- Comunicacion profesional: redaccion de correos, mensajes y reportes dictados y posteriormente formateados por el LLM para un tono adecuado.
- Actas de reuniones: la transcripcion local se procesa con el LLM para generar resumenes estructurados con puntos clave y tareas.
- Desarrollo de software: el desarrollador dicta requisitos, explicaciones tecnicas o descripciones de issues, y el LLM los convierte en texto claro y bien formateado para GitHub o documentacion.
- Toma de notas y aprendizaje: captura rapida de apuntes de clase o lecturas con transcripcion local y posterior organizacion por el LLM.
- Diario personal: registro de pensamientos e ideas de forma natural y fluida, con la garantia de que los datos de voz no salen del dispositivo.
- Accesibilidad: personas con dificultades para escribir pueden usar la voz como metodo de entrada principal en cualquier aplicacion de Windows.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los modelos subyacentes (Whisper, SenseVoice, Parakeet, Qwen-ASR) tienen datos publicos en sus respectivos repositorios oficiales, pero este proyecto no aporta mediciones propias.

## Requisitos de hardware

- El proyecto esta pensado para ejecutarse en equipos de escritorio Windows, con modelos de 0,6B a 9B parametros.
- Para los modelos ASR mas pequenos (0,6B) se puede ejecutar en CPU con un rendimiento aceptable.
- Para el LLM de 9B en cuantizacion Q4_K_M se estima una VRAM minima de 6-8 GB, compatible con tarjetas como RTX 3060, RTX 4060 o superiores.
- El modelo de 4B en Q4_K_M cabe en GPUs con 4-6 GB de VRAM, como una RTX 3050 o GTX 1660 Super.
- Los modelos GGUF se pueden desplegar con llama.cpp, Ollama o motores compatibles; el proyecto no menciona soporte para vLLM o TGI.
- La latencia dependera del modelo elegido: los modelos ASR de 0,6B ofrecen transcripcion en tiempo real en hardware moderno, mientras que el LLM de 9B tendra una velocidad de generacion de entre 20 y 40 tokens por segundo en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| Voconly (ecosistema) | 0,6B - 9B | No disponible | GGUF | No disponible | ASR + LLM local en Windows |
| Whisper Large V3 Turbo | ~1,5B | No disponible | GGUF | MIT | ASR generico multilingue |
| SenseVoice Small | ~0,2B | No disponible | GGUF | No disponible | ASR multilingue eficiente |
| Parakeet TDT 0.6B | 0,6B | No disponible | GGUF | No disponible | ASR streaming |
| Qwen3-4B-Instruct | 4B | 32K (aprox.) | GGUF | Apache 2.0 (Qwen3) | LLM instructivo ligero |

La principal diferencia es que Voconly no es un modelo, sino un conjunto de modelos y una aplicacion que los integra. La comparativa directa seria entre cada modelo individual y sus alternativas oficiales. Los modelos Qwen3-4B y Qwen3.5-9B son los mismos de Alibaba cuantizados en GGUF, por lo que su rendimiento es el mismo que los originales con la penalizacion tipica de la cuantizacion.

## Limitaciones y advertencias

- La model card no especifica la licencia de los modelos, lo que obliga a contactar con el autor antes de usar el proyecto en entornos comerciales.
- Los idiomas soportados se limitan a ingles y chino, por lo que no es adecuado para entornos hispanohablantes.
- No hay datos sobre sesgos, alucinaciones o comportamiento en produccion; al tratarse de modelos ASR, el riesgo de alucinacion es menor que en LLMs, pero el LLM posterior puede alucinar contenido al procesar el texto.
- El proyecto es obra de un desarrollador individual, con riesgo de mantenimiento limitado y documentacion parcial en chino e ingles.
- La cuantizacion GGUF puede degradar ligeramente la precision respecto a los pesos completos, especialmente en los modelos ASR.
- Para uso comercial, es imprescindible revisar la licencia de cada modelo subyacente (Whisper, SenseVoice, Parakeet, Qwen3) y la del codigo de la aplicacion en el repositorio de GitHub.

## Enlaces

- Organizacion Hugging Face: https://huggingface.co/voconly
- Pagina del proyecto en Hugging Face: https://huggingface.co/voconly/voconly
- Repositorio en GitHub: https://github.com/xinkyle/Voconly
- Sitio web oficial: https://www.voconly.com
- Descarga en SourceForge: https://sourceforge.net/projects/voconly/
