# taddymason/BananaMind-2-Pro-Preview-Chat

## Resumen

BananaMind-2-Pro-Preview-Chat es la versión ajustada por instrucciones del modelo base BananaMind-2-Pro-Preview, desarrollado por BananaMind y publicado en HuggingFace por el usuario taddymason. Se trata de un modelo de lenguaje pequeño (SLM) de 138,97 millones de parámetros, diseñado para tareas de generación de texto conversacional con soporte de system prompts y conversaciones multi-turno. Su relevancia radica en ofrecer una alternativa ligera y eficiente para entornos con recursos limitados, manteniendo capacidades de razonamiento y código competitivas dentro de su categoría.

El modelo emplea una arquitectura decoder-only Transformer de 24 capas con atención por grupos de consultas (GQA), normalización QK, RoPE y embeddings atados. Su ventana de contexto es de 3.072 tokens, y utiliza un tokenizador BPE propio de 32.768 tokens, consciente de dígitos (digit-aware byte-level). La versión Preview-Chat se obtiene mediante fine-tuning completo de una época sobre el dataset HuggingFaceTB/smol-smoltalk, con pérdida aplicada únicamente sobre el contenido de las respuestas del asistente y el token EOS de cierre. Es relevante ahora porque representa un punto de partida intermedio de un entrenamiento más amplio (el run completo de 100B tokens aún no está terminado), y porque demuestra mejoras de rendimiento progresivas durante el ajuste fino, con un Elo de 888 en el benchmark propio BananaMind Instruct Bench 1.1.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only Transformer (BananaMind2Pro) con GQA, QK norm, RoPE, SwiGLU, embeddings atados |
| Parametros totales | 138.971.520 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 3.072 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16 en safetensors; cuantizaciones no publicadas) |
| Idiomas soportados | ingles |
| Licencia | bananamind-community-license-1.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 24 capas, tamaño oculto de 640, tamaño intermedio de 1.920 y 8 cabezas de atencion con 4 cabezas KV (GQA). Incorpora normalizacion QK, RoPE con theta 100.000, MLP SwiGLU, normalizacion RMSNorm (epsilon 1e-6) y embeddings de entrada y salida atados. El tokenizador es un BPE de 32.768 tokens de nivel de bytes con sensibilidad a digitos, disenado para mejorar el rendimiento en tareas numericas y de codigo.

El entrenamiento consta de dos fases. La base (BananaMind-2-Pro-Preview) fue preentrenada sobre 51.904.512.000 tokens, correspondientes al checkpoint de 96K de un run completo de 100K tokens. La fase de ajuste instructivo es un fine-tuning completo de parametros (sin adaptadores ni LoRA) de una epoca sobre el dataset HuggingFaceTB/smol-smoltalk, con 460.341 filas en el split de entrenamiento. Se procesaron 394.522.611 tokens empaquetados, de los cuales 301.938.934 son tokens de asistente supervisados. El entrenamiento se realizo con secuencias de longitud 3072, micro batch de 4, acumulacion de gradientes de 8 (batch efectivo de 32), pico de learning rate de 1e-4, warmup de 100 pasos, constante despues, AdamW con betas (0.9, 0.95), weight decay de 0.1 y clipping de gradientes a 1.0. Se utilizo PyTorch compile y seed 1337. La perdida se aplico solo a contenido del asistente y el EOS final; los mensajes de sistema y usuario se enmascararon.

## Capacidades

- Generacion de texto conversacional: respuestas multi-turno con soporte de system prompt y chat template nativo (Jinja).
- Razonamiento general: resuelve tareas de logica, comprension y conocimiento general en ingles (Elo 720 en la categoria General del benchmark).
- Capacidad de codigo: destaca especialmente en tareas de programacion (Elo 1337, con un 65.26% de tareas de codigo superadas).
- Memoria de contexto: mantiene informacion de conversaciones largas dentro de su ventana de 3072 tokens (Elo 1194 en Context Recall).
- Seguimiento de instrucciones con system prompts: aunque es su punto mas debil (Elo 793), es capaz de adaptarse a directrices de sistema.
- Generacion determinista: evaluada con greedy decoding y repeticion penalizada, sin soporte de sampling avanzado en la evaluacion.
- No soporta vision, audio ni tool calling explicito: el modelo es exclusivamente de texto y no incorpora funciones de llamada a herramientas en la informacion disponible.

## Casos de uso

- Chatbots de atencion al cliente para pequenas empresas: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 3072 tokens, suficiente para resolver consultas habituales de soporte con un prompt de sistema que defina politicas de respuesta. Su tamano reducido permite desplegarlo en servidores modestos o incluso en edge.
- Asistente de codigo en entornos de desarrollo: con un Elo de 1337 en tareas de codigo y un tokenizer consciente de digitos, es util para generar fragmentos de codigo, explicar funciones o corregir errores simples en un IDE o CLI.
- Generacion de documentacion tecnica: puede resumir conversaciones, generar respuestas estructuradas y mantener coherencia en textos largos dentro de su contexto, ideal para automatizar documentacion de proyectos.
- Prototipado de chatbots educativos: su tamano permite experimentar con arquitecturas de agentes conversacionales en entornos academicos o de investigacion, con coste computacional minimo.
- Evaluacion de modelos pequenos en produccion: sirve como referencia para comparar el rendimiento de SLMs en tareas de instruccion, especialmente en configuraciones con presupuesto de VRAM inferior a 1 GB.
- Tareas de clasificacion y extraccion de informacion: mediante prompts de sistema, puede extraer entidades, clasificar texto o resumir documentos cortos, aprovechando su capacidad de contexto de 3K tokens.

## Benchmarks y rendimiento

Se han publicado resultados del benchmark propio de BananaMind Instruct Bench 1.1 (300 tareas deterministas ponderadas por dificultad y categoria). La evaluacion se realizo con greedy decoding, repeticion penalizada de 1.1 y seed 42, usando el chat template nativo del modelo.

| Modelo | Elo total | General | Multi-turno | System prompts | Context recall | Codigo |
|---|---|---|---:|---:|---:|---:|---:|
| **BananaMind-2-Pro-Preview-Chat** | **888** | 720 | 911 | 793 | 1.194 | 1.337 |
| BananaMind-2-Medium-Chat | 787 | 534 | 872 | 666 | 1.085 | 1.291 |
| BananaMind-2-Mini-Chat | 654 | 389 | 812 | 743 | 924 | 667 |
| Supra 1.5 50M Instruct | 647 | 520 | 804 | 590 | 860 | 780 |
| BananaMind-2-Nano-Chat | 643 | 353 | 796 | 600 | 978 | 885 |

Desglose por dificultad del modelo final:

| Dificultad | Ejemplos | Superados | Puntuacion ponderada | Elo |
|---|---|---|---:|---:|---:|
| Facil | 100 | 59 | 60.58% | 1.014 |
| Media | 100 | 31 | 32.59% | 900 |
| Dificil | 100 | 8 | 8.53% | 756 |

La progresion durante el fine-tuning muestra que el checkpoint final (paso 4.014) es el mejor en Elo global (888) y en tareas de codigo superadas (11/15), aunque el paso 3.000 tenia un Elo ligeramente superior en la categoria de codigo (1.345). No hay datos publicados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa aproximadamente 0.6 GB en bfloat16 (138.971.520 parametros), por lo que cabe en cualquier GPU consumer moderna con 4 GB de VRAM o mas.
- GPU recomendadas: cualquier GPU con soporte CUDA de al menos 4 GB (RTX 3060, RTX 4060, GTX 1660 Super, etc.). Tambien puede ejecutarse en CPU para inferencia lenta en entornos sin GPU.
- En consumer GPU: si, es un modelo disenado para entornos de bajos recursos.
- Opciones de despliegue: se puede usar con Transformers de Hugging Face (libreria transformers) con trust-remote-code, o exportar a GGUF para ejecutarlo con llama.cpp, Ollama u otros runtime. La arquitectura custom requiere codigo propio.
- Latencia y throughput: no se proporcionan datos exactos. Dado el tamano, se espera una generacion de decenas de tokens por segundo en una GPU consumer media, y unos pocos tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Elo Instruct Bench | Licencia | Formato |
|---|---|---|---|---|---|
| **BananaMind-2-Pro-Preview-Chat** | 138.97 M | 3.072 | 888 | bananamind-community-license-1.0 | safetensors |
| BananaMind-2-Medium-Chat | no disponible | no disponible | 787 | bananamind-community-license-1.0 | safetensors |
| BananaMind-2-Mini-Chat | no disponible | no disponible | 654 | bananamind-community-license-1.0 | safetensors |
| BananaMind-2-Nano-Chat | no disponible | no disponible | 643 | bananamind-community-license-1.0 | safetensors |
| Supra 1.5 50M Instruct | 50 M | no disponible | 647 | no disponible | no disponible |

El modelo se situa como el mejor de su familia en el benchmark interno, superando a los modelos Medium, Mini y Nano, asi como al Supra 1.5 50M Instruct. No se dispone de datos de parametros para los otros modelos de BananaMind ni para Supra. Todos comparten la misma licencia comunitaria de BananaMind.

## Limitaciones y advertencias

- El modelo es un checkpoint de preview derivado de un entrenamiento intermedio (96K tokens) y no del run completo de 100K tokens, por lo que puede tener diferencias de rendimiento con la version final de BananaMind 2 Pro.
- La ventana de contexto de 3.072 tokens es reducida, limitando el uso en tareas que requieran documentos largos o conversaciones muy extensas.
- El modelo solo soporta ingles; su rendimiento en otros idiomas no esta evaluado y probablemente sea pobre.
- La licencia bananamind-community-license-1.0 es una licencia personalizada ("other") que requiere revision para uso comercial; no es una licencia open source estandar como Apache 2.0 o MIT.
- El codigo del modelo es custom (trust-remote-code), lo que implica un riesgo de seguridad adicional al cargar pesos y ejecutar codigo no auditado.
- Los benchmarks son auto-reportados por el autor y solo cubren el benchmark interno de BananaMind, sin validacion externa en benchmarks estandarizados.
- El rendimiento en tareas dificiles es bajo (8.53% en la categoria dificil), lo que indica limitaciones claras para razonamiento complejo.
- No hay evidencia de soporte de tool calling, agentes o funciones de llamada, por lo que su uso en pipelines de automatizacion avanzada esta limitado a tareas de texto puro.

## Enlaces

- [Modelo en Hugging Face (taddymason)](https://huggingface.co/taddymason/BananaMind-2-Pro-Preview-Chat)
- [Modelo base en Hugging Face](https://huggingface.co/BananaMind/BananaMind-2-Pro-Preview)
- [Modelo final en Hugging Face](https://huggingface.co/BananaMind/BananaMind-2-Pro)
- [Benchmark BananaMind Instruct Bench 1.1](https://huggingface.co/datasets/BananaMind/BananaMind-Instruct-Bench-1.1)
- [Dataset de fine-tuning (smol-smoltalk)](https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk)
- [Entrada en LLM Explorer](https://llm-explorer.com/model/BananaMind%2FBananaMind-2-Pro-Preview-Chat,OMDKYcZXPDxiNZHWubt8K)
