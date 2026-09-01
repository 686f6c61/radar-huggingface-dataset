# Vampelium/LFM2.5-2.6B-heretic

## Resumen

LFM2.5-2.6B-heretic es un checkpoint del modelo LFM2.5-2.6B de Liquid AI, modificado mediante la técnica de abliteración implementada en la herramienta Heretic. El modelo original, desarrollado por Liquid AI, es un modelo de lenguaje de 2.600 millones de parámetros diseñado para ejecutarse en dispositivos locales y orientado a tareas agénticas, con soporte para planificación, llamada a herramientas y ejecución de tareas multi-paso. La versión heretic elimina la dirección de rechazo aprendida durante el entrenamiento con alineación, de modo que el modelo deja de negarse a responder consultas que el modelo base consideraría no seguras o censurables.

El checkpoint ha sido producido por el usuario Vampelium sobre una GPU NVIDIA A100 y exportado en formato safetensors con precisión BF16. La abliteración no modifica los pesos de forma destructiva, sino que proyecta los pesos fuera del subespacio correspondiente a la dirección de rechazo, conservando la mayor parte de las capacidades del modelo original. El resultado es un modelo de 2,7 GB (en BF16) con una ventana de contexto de 128 000 tokens según fuentes externas, y que mantiene el soporte multilingüe del modelo base en 16 idiomas, incluido el español. La licencia es lfm1.0, la misma que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: LFM2.5-2.6B de Liquid AI) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens (segun fuentes externas; no confirmado en la model card) |
| Tipos de cuantizacion | BF16 (safetensors); existen versiones GGUF de terceros (2,9 GB) |
| Idiomas soportados | arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, español, tailandes, vietnamita |
| Licencia | lfm1.0 (otra) |
| Formato de pesos | safetensors (BF16, 2 shards) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base LFM2.5-2.6B. Segun el blog oficial de Liquid AI, se trata de un modelo denso de 2,6 mil millones de parametros optimizado para inferencia en dispositivos locales, con una velocidad de generacion de 220 tokens por segundo en hardware de gama media y un consumo de memoria inferior a 2,5 GB en cuantizacion de 4 bits. El modelo base fue entrenado con un enfasis en capacidades agénticas: planificacion, llamada a herramientas y razonamiento multi-paso.

El checkpoint heretic se obtiene aplicando la tecnica de abliteracion de Heretic, que identifica la direccion de rechazo en el espacio de activaciones del modelo y proyecta los pesos fuera de esa direccion. Esto elimina el comportamiento de negacion ante prompts no seguros, manteniendo el resto de las capacidades. El proceso se realizo sobre una GPU NVIDIA A100 y el resultado se exporto en BF16. No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineacion original.

## Capacidades

- Generacion de texto libre sin rechazo ante contenido no seguro, gracias a la abliteracion.
- Soporte de tool calling y function calling, heredado del modelo base LFM2.5-2.6B, disenado para tareas agénticas.
- Capacidad de planificacion y ejecucion de tareas multi-paso, segun las especificaciones del modelo base.
- Multilingue: soporta 16 idiomas, incluyendo espanol, ingles, frances, aleman, chino, japones, coreano, etc.
- Ventana de contexto larga (128K segun fuentes externas), adecuada para conversaciones extensas y documentos largos.
- No incluye modo de pensamiento explicito ni capacidades de vision o audio; es exclusivamente texto.
- Al ser un modelo pequeno (2,6B), es apto para inferencia en CPU y GPU de gama baja con cuantizacion.

## Casos de uso

- Generacion de contenido creativo sin restricciones: el modelo puede producir narrativa, guiones o dialogos con tematica adulta o controvertida sin censura, util para escritores y creadores que necesitan explorar temas sensibles.
- Roleplay y chatbots de personajes: ideal para aplicaciones de conversacion inmersiva donde el usuario espera respuestas sin filtros morales, como en juegos de rol o simulaciones de personajes historicos.
- Analisis de textos con contenido explicito: en investigacion sociologica o linguistica, el modelo puede procesar y resumir corpus con lenguaje ofensivo o temas tabu que otros modelos rechazarian.
- Experimentacion en seguridad de IA: investigadores pueden estudiar el comportamiento de un modelo sin alineacion de seguridad para entender mecanismos de rechazo, sesgos o riesgos de abuso.
- Asistente multilingue para regiones con baja moderacion: en entornos donde se requiere una herramienta de generacion de texto sin filtros politicos o culturales, el modelo ofrece respuestas en 16 idiomas.
- Desarrollo de prototipos agénticos: gracias al soporte de tool calling, puede integrarse en pipelines de automatizacion donde se necesita un agente que llame a APIs o ejecute acciones, sin las restricciones de seguridad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras pruebas estandar. El unico dato de rendimiento proviene del blog de Liquid AI para el modelo base, que reporta 220 tokens por segundo en hardware de gama media, pero no se ha verificado para esta version abliterada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 5,4 GB (peso del modelo) mas overhead de atencion y cache, por lo que se recomienda al menos 8 GB de VRAM para uso comodo.
- Con cuantizacion GGUF de 4 bits (2,9 GB), puede ejecutarse en GPUs con 4 GB de VRAM, como la NVIDIA GTX 1650, RTX 3050 o Apple Silicon con 8 GB unificados.
- La GPU recomendada para produccion seria una NVIDIA RTX 3090, RTX 4090 o A100, aunque el modelo es suficientemente pequeno para correr en tarjetas de gama media.
- En CPU, con cuantizacion de 4 bits, es viable para generacion lenta (10-20 tokens por segundo en procesadores modernos).
- Opciones de despliegue: transformers (con `device_map="auto"`), llama.cpp para GGUF, Ollama, vLLM (si se convierte a formato compatible) y TGI.
- Latencia estimada: en A100, la generacion deberia superar los 200 tokens por segundo; en RTX 4090, alrededor de 100-150 tokens por segundo en BF16.

## Comparativa con modelos similares

La comparativa se realiza con modelos de tamano similar (2-3B) que tambien ofrecen versiones abliteradas o sin censura.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM2.5-2.6B-heretic | 2,6B | 128K (segun fuentes externas) | lfm1.0 | Hugging Face |
| Qwen2.5-3B-Instruct-abliterated | 3B | 32K | Apache 2.0 | Hugging Face (varias versiones) |
| Llama-3.2-3B-Instruct-abliterated | 3B | 128K | Llama 3.2 | Hugging Face |
| Phi-3.5-mini-instruct (sin abliterar) | 3,8B | 128K | MIT | Hugging Face |

No se dispone de benchmarks comparativos fiables entre estos modelos. La ventaja principal de LFM2.5-2.6B-heretic es su velocidad de inferencia (220 tok/s segun Liquid) y su soporte multilingue amplio, mientras que las alternativas de Qwen y Llama tienen ecosistemas mas maduros y documentacion mas extensa.

## Limitaciones y advertencias

- La abliteracion elimina la alineacion de seguridad: el modelo puede generar contenido ofensivo, ilegal, peligroso o socialmente inaceptable sin restricciones. El autor advierte explicitamente que el usuario es responsable del uso.
- Riesgo de alucinacion elevado en temas factuales, especialmente en idiomas con menos representacion en el entrenamiento (como tailandes o vietnamita).
- La licencia lfm1.0 impone restricciones de uso comercial; es necesario revisar los terminos completos antes de desplegar en produccion.
- No se han publicado evaluaciones de sesgos ni de calidad en tareas estandar, por lo que su rendimiento en benchmarks es desconocido.
- La ventana de contexto de 128K no esta confirmada en la model card original; podria variar en la practica.
- Al ser un modelo pequeno, su capacidad de razonamiento complejo es limitada en comparacion con modelos de 7B o superiores.
- No soporta vision, audio ni otras modalidades; solo texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vampelium/LFM2.5-2.6B-heretic
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Repositorio de Heretic (abliteration): https://github.com/p-e-w/heretic
- Blog de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Version GGUF de terceros (local-ai-zone): https://local-ai-zone.github.io/models/lfm2-5-2-6b-heretic-abliterated.html
