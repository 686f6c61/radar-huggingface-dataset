# TurboVadim/Qwen3.8-27B-OBLITERATED

## Resumen

Qwen3.8-27B-OBLITERATED es una versión modificada del modelo Qwen3.8-27B de Alibaba, publicada por el usuario TurboVadim (y originalmente por OBLITERATUS) con el objetivo de eliminar los comportamientos de rechazo y las respuestas evasivas de seguridad. Mediante una técnica de post-entrenamiento denominada "abliteration", el modelo responde de forma directa a consultas que el modelo original rechazaría, manteniendo un nivel de capacidad cercano al original. Está pensado para investigación en seguridad ofensiva, red teaming y aplicaciones que requieren respuestas sin censura.

El modelo base es un transformer denso de 27.781.427.952 parámetros (27,78B), con una ventana de contexto de 262.000 tokens según fuentes externas, y capacidades de visión y lenguaje. La versión abliterated conserva la arquitectura y los pesos del modelo base, pero con intervenciones quirúrgicas sobre las direcciones de rechazo en el espacio de pesos. El proceso de ablación se ha iterado en tres versiones (V1, V2 y V3), siendo la V3 la que logra un equilibrio entre liberación real de respuestas y coste de capacidad (-2,1 puntos porcentuales en MMLU frente al modelo original).

La relevancia de este modelo radica en que ofrece una alternativa "sin censura" para entornos controlados de investigación, con un coste de rendimiento relativamente bajo. Sin embargo, su uso conlleva riesgos importantes de generación de contenido dañino, por lo que debe emplearse exclusivamente en contextos legítimos de seguridad y con las debidas salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (segun fuentes externas del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio incluye safetensors, GGUF y MLX; no se especifican las cuantizaciones exactas) |
| Idiomas soportados | No disponible (heredados del modelo base Qwen3.8-27B, no especificados en la ficha) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, MLX |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de 27,78B parametros con soporte multimodal (vision y lenguaje) y una ventana de contexto de 262.000 tokens, segun informacion publicada sobre el modelo base. No se dispone de detalles sobre la arquitectura interna exacta (numero de capas, dimensiones de atencion, etc.) en la informacion proporcionada.

El proceso de "abliteration" es un post-entrenamiento que identifica y elimina las direcciones de rechazo en el espacio de pesos del modelo. La version V3 combina tres tecnicas:

- **SVD (descomposicion en valores singulares)**: una primera cirugia agresiva que elimina los rechazos duros pero degrada la capacidad (-6 pp en MMLU en V1).
- **LEACE (eliminacion de informacion mutua)**: una segunda cirugia que preserva mejor la capacidad pero elimina los rechazos de forma mas debil.
- **Mezcla complementaria**: se combinan los pesos de ambas cirugias en una proporcion 60/40, cancelando las debilidades de cada metodo.
- **Refinamiento iterativo**: se aplican rondas adicionales de cirugia sobre el modelo resultante, utilizando un corpus enfocado en categorias especificas de evasion (charlas de seguridad) para encontrar direcciones de rechazo adicionales sin diluir la senal.

El resultado es una reduccion de -2,1 puntos porcentuales en MMLU frente al modelo original, con una tasa de rechazo del 0% en un conjunto de 842 prompts daninos, segun la model card. No se han publicado detalles sobre el dataset de entrenamiento utilizado para la ablacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, con respuestas directas sin rechazos ni "charlas de seguridad".
- Razonamiento y resolucion de problemas, incluyendo tareas complejas del mundo real (7/8 en pruebas avanzadas segun la model card).
- Generacion de codigo funcional: 20/20 en tareas de codigo y ciberseguridad, con implementaciones operativas.
- Compatible con "thinking mode" (modo de razonamiento explicito), aunque se recomienda desactivarlo para respuestas mas directas.
- Capacidades de vision y lenguaje heredadas del modelo base Qwen3.8-27B (no confirmadas explicitamente en esta version).
- Soporte de tool calling y function calling: no confirmado en la informacion disponible, aunque el modelo base Qwen3.8 probablemente lo incluye.
- Capacidades multilingues: no especificadas, pero el modelo base Qwen3.8 soporta multiples idiomas.

## Casos de uso

- **Investigacion en seguridad ofensiva (red teaming)**: el modelo puede generar exploits, payloads y cadenas de ataque para evaluar la postura de seguridad de sistemas propios. Su tasa de rechazo del 0% permite obtener respuestas sustanciales sin evasivas, lo que agiliza las pruebas de penetracion.
- **Pruebas de penetracion automatizadas**: integrable en frameworks de pentesting como Metasploit o herramientas personalizadas, donde el modelo genera comandos y scripts de explotacion. La configuracion recomendada (temperatura 0, repetition_penalty 1.15) evita bucles en llamadas a herramientas.
- **Generacion de codigo y scripts**: produce implementaciones funcionales en multiples lenguajes, util para automatizar tareas de desarrollo o crear herramientas de analisis. Su capacidad de codigo (20/20 en pruebas) lo hace adecuado para entornos de CI/CD donde se requiera generacion de codigo sin restricciones.
- **Analisis de malware y reversing**: puede explicar el comportamiento de muestras maliciosas, sugerir tecnicas de evasion o generar firmas de deteccion. La ausencia de rechazos permite tratar temas que otros modelos evitarian.
- **Evaluacion de modelos de seguridad**: sirve como generador de prompts adversarios para probar la robustez de otros modelos de IA frente a jailbreaks y peticiones daninas. Su capacidad de generar contenido "prohibido" lo convierte en una herramienta de estres para sistemas de moderacion.
- **Desarrollo de agentes conversacionales sin restricciones**: para entornos controlados donde se necesita un asistente que no imponga limites morales, como simulaciones de comportamiento humano o chatbots de rol avanzado. La compatibilidad con "thinking mode" permite respuestas razonadas.
- **Educacion en ciberseguridad**: en cursos de hacking etico, el modelo puede demostrar tecnicas de ataque y defensa de forma practica, siempre bajo supervision en laboratorios aislados.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es MMLU (0-shot, 5700 preguntas, evaluado con lm-eval-harness). No se han publicado resultados de HumanEval, GSM8K u otros benchmarks estandar.

| Modelo | MMLU (0-shot) | Diferencia vs stock |
|---|---|---|
| Stock Qwen3.8-27B | 84,5% | — |
| V1 (SVD agresivo) | 81,4% | -6,0 pp |
| V2 (mezcla complementaria) | 84,3% | -0,3 pp |
| V3 (refinamiento iterativo) | 82,3% | -2,1 pp |

Ademas, la model card reporta una tasa de rechazo del 0% en 842 prompts daninos, 20/20 en tareas de codigo y ciberseguridad, y 7/8 en tareas avanzadas del mundo real. No se dispone de datos de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 27,78B parametros, en bf16/fp16 se necesitan aproximadamente 55,6 GB de VRAM. Con cuantizacion de 8 bits, unos 28 GB; con 4 bits, unos 14 GB.
- **GPU recomendadas**: A100 80GB, H100 80GB o RTX 4090 (24GB) con cuantizacion 4-bit. Para cargas de trabajo de alta concurrencia, se recomienda al menos una A100 o H100.
- **Compatibilidad con GPU de consumo**: si, con cuantizacion 4-bit cabe en RTX 3090/4090 (24GB) y en RTX 4080 (16GB) con cuantizaciones mas agresivas. En Apple Silicon, el formato MLX permite ejecucion en Mac con 32GB o mas de RAM unificada.
- **Opciones de despliegue**: vLLM, TGI, llama.cpp (con soporte GGUF), Ollama, LM Studio y MLX (para Apple). El repositorio incluye pesos en safetensors, GGUF y MLX.
- **Latencia y throughput**: no disponible. Se estima que en una A100 80GB con bf16, la generacion de 2048 tokens puede tardar entre 10 y 30 segundos, dependiendo de la implementacion y el batch size.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos abliterated comparables. La comparativa mas relevante es con el modelo base sin modificar:

| Modelo | Parametros | Contexto | MMLU (0-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (stock) | 27,78B | 262K | 84,5% | Apache-2.0 | Hugging Face |
| Qwen3.8-27B-OBLITERATED (V3) | 27,78B | 262K | 82,3% | Apache-2.0 | Hugging Face |
| Qwen3.8-27B-FP8 | 27,78B | 262K | No disponible | Apache-2.0 | Hugging Face |

No se han encontrado otros modelos de tamano similar con tecnicas de ablacion equivalentes en la informacion disponible. La diferencia principal entre el stock y la version OBLITERATED es la tasa de rechazo (0% frente a rechazos frecuentes) y una perdida de -2,1 pp en MMLU.

## Limitaciones y advertencias

- **Perdida de capacidad**: la ablacion reduce el rendimiento en MMLU en 2,1 puntos porcentuales frente al modelo original. En tareas de razonamiento complejo o conocimiento general, puede producir respuestas menos precisas.
- **Riesgo de alucinacion**: al eliminar los mecanismos de rechazo, el modelo puede generar contenido falso o inventado con mayor confianza, especialmente en dominios donde el modelo base ya tendia a alucinar.
- **Generacion de contenido danino**: el modelo esta disenado para responder a peticiones de ciberseguridad ofensiva, jailbreaks y otros contenidos potencialmente ilegales o eticamente problematicos. Su uso fuera de entornos controlados y autorizados puede violar leyes y politicas de plataformas.
- **Sesgos conocidos**: no se han publicado evaluaciones de sesgo. El modelo base Qwen3.8 puede heredar sesgos de sus datos de entrenamiento, y la ablacion no los corrige.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el contenido generado puede estar sujeto a regulaciones locales sobre ciberseguridad, privacidad y contenido danino. El usuario es responsable del cumplimiento legal.
- **Configuracion delicada**: el modelo requiere ajustes especificos (temperatura 0, repetition_penalty 1.15, sin system prompt) para funcionar correctamente. Un uso inadecuado puede provocar bucles de generacion o respuestas degradadas.
- **Sin garantias de seguridad**: al ser una version "uncensored", no debe desplegarse en produccion orientada al publico sin un filtrado posterior de contenido y una evaluacion de riesgos exhaustiva.

## Enlaces

- Repositorio en Hugging Face (TurboVadim): https://huggingface.co/TurboVadim/Qwen3.8-27B-OBLITERATED
- Repositorio original (OBLITERATUS): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre ejecucion local de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Articulo de explainx.ai sobre la tasa de rechazo del 0%: https://www.explainx.ai/blog/pliny-qwen3-8-27b-obliterated-alex-finn-mac-august-2026
- Articulo de explainx.ai sobre Qwen3.8-27B y su comparacion con Claude Opus: https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
