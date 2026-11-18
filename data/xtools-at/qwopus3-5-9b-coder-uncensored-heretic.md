# xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic

## Resumen

Qwopus3.5-9B-Coder-UNCENSORED-heretic es una variante "abliterated" (decensurada) del modelo Jackrong/Qwopus3.5-9B-Coder, publicada por el usuario xtools-at. El modelo original es un fine-tune de Qwopus3.5-9B-v3.5 (arquitectura Qwen3.5, densa, 9.409.813.744 parámetros) orientado específicamente a codificación agéntica, tool calling complejo y razonamiento lógico con cadenas de pensamiento (chain-of-thought). Esta versión concreta aplica una técnica de ablación de direcciones de rechazo mediante la herramienta Heretic v2.2.0.dev0, con el objetivo de reducir drásticamente las negativas del modelo a responder peticiones.

La relevancia de esta ficha radica en dos aspectos. Por un lado, el modelo base representa un punto de equilibrio interesante en la categoría de modelos densos de ~9B: según el autor, es ejecutable en cuantización de 8 bits en dispositivos con 16 GB de RAM, lo que lo sitúa en el rango de portátiles convencionales y Mac mini. Por otro, la variante "uncensored" introduce un compromiso explícito: se eliminan los mecanismos de rechazo a costa de una divergencia de comportamiento medible (KL divergence de 0,0703 respecto al original) y de posibles efectos secundarios en la calidad general.

El modelo soporta entrada de imagen y texto (pipeline image-text-to-text), tool calling y function calling, y declara soporte para inglés, chino, español, ruso y japonés. Se distribuye bajo licencia Apache 2.0 y está pensado, según la model card, exclusivamente para investigación y exploración.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, tag `qwen3_5`) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada (existe repositorio GGUF del modelo base: Jackrong/Qwopus3.5-9B-coder-GGUF) |
| Idiomas soportados | Inglés (en), chino (zh), español (es), ruso (ru), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 19,3 GB); GGUF disponible para el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con 9.409.813.744 parámetros. El modelo base Qwopus3.5-9B-coder se construye sobre Qwopus3.5-9B-v3.5 mediante fine-tuning supervisado (SFT) con LoRA, combinando datos de trazas agénticas de alta calidad con la técnica de aumento de datos "Trace Inversion". Los datasets declarados incluyen lambda/hermes-agent-reasoning-traces, Jackrong/Claude-opus-4.7-TraceInversion-5000x y Jackrong/Claude-opus-4.6-TraceInversion-9000x. El objetivo declarado del entrenamiento es reforzar el razonamiento lógico estructurado (reduciendo pensamiento repetitivo), la escritura y depuración de código a nivel de repositorio, el tool calling estable para comandos de terminal, operaciones de ficheros y navegadores, y la alineación por destilación entre fuentes de datos.

Sobre esta base, la variante aquí descrita aplica una ablación de rango arbitrario (Arbitrary-Rank Ablation, ARA) mediante Heretic v2.2.0.dev0, que actúa sobre las capas 13 a 32 del modelo con los siguientes hiperparámetros: `preserve_good_behavior_weight` = 0,3521, `steer_bad_behavior_weight` = 0,0001, `overcorrect_relative_weight` = 0,9859 y `neighbor_count` = 5. El resultado declarado es una reducción de rechazos de 99/100 en el modelo original a 4/100 en esta variante, con una divergencia KL de 0,0703 respecto al comportamiento original. No se especifican en la información disponible detalles adicionales sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento con cadena de pensamiento (chain-of-thought) explícita.
- Codificación agéntica: escritura, depuración y resolución de tareas a nivel de repositorio.
- Tool calling y function calling, con soporte declarado para comandos de terminal, operaciones de ficheros y control de navegador.
- Capacidades de agente multi-paso (multi-step reasoning) orientadas a flujos de trabajo con herramientas.
- Procesamiento de imagen y texto (pipeline image-text-to-text); para visión en GGUF se requiere el fichero `mmproj.gguf` del repositorio GGUF del modelo base.
- Multilingüe en inglés, chino, español, ruso y japonés.
- Comportamiento decensurado: tasa de rechazo reducida (4/100 según la model card) mediante ablación de direcciones de rechazo.
- Integración con text-generation-inference y transformers.

## Casos de uso

- Automatización de tareas de desarrollo en terminal: el modelo puede interpretar instrucciones en lenguaje natural y emitir comandos de shell estructurados mediante tool calling, lo que permite integrarlo en asistentes de línea de comandos que ejecutan operaciones de ficheros y despliegues controlados.
- Agentes de refactorización a nivel de repositorio: gracias a su entrenamiento en trazas agénticas y razonamiento multi-paso, puede planificar cambios que afectan a varios ficheros y verificar el resultado con herramientas de compilación o tests.
- Asistente de depuración interactiva: el modo de razonamiento explícito permite trazar hipótesis sobre la causa de un fallo, inspeccionar logs o código y proponer parches justificados paso a paso.
- Generación de código en pipelines de CI/CD: su soporte de function calling permite conectarlo a sistemas que crean ramas, abren pull requests o consultan APIs de repositorios, con el modelo decidiendo la secuencia de llamadas.
- Investigación sobre alineación y seguridad: al ser una variante abliterated con métricas publicadas de rechazo y divergencia KL, resulta útil para estudiar el efecto de la ablación de direcciones de comportamiento sobre un modelo de código, comparando respuestas con el original.
- Procesamiento de capturas y diagramas técnicos: la entrada multimodal permite adjuntar una imagen de una interfaz, un error o un diagrama de arquitectura y pedir al modelo que genere el código o la explicación correspondiente.
- Prototipado local en hardware de gama media: al caber en 16 GB de RAM en 8 bits según el autor, sirve para entornos de desarrollo sin GPU dedicada donde se necesita un asistente de código con tool calling.

## Benchmarks y rendimiento

La model card incluye una comparativa de comportamiento (no de benchmarks estándar como MMLU o HumanEval) centrada en la tasa de rechazo y la divergencia respecto al modelo original:

| Métrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 4/100 | 99/100 |
| Divergencia KL | 0,0703 | 0 (por definición) |

Además, se menciona una evaluación con el framework benchlocal sobre el conjunto de tareas HermesAgent-20 (puntuación global), ejecutada en Apple Silicon con backend LM Studio/MLX/GGUF, pero los valores numéricos de esa tabla no están disponibles en la información proporcionada.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 9,41B parámetros, una estimación orientativa sería aproximadamente 18-19 GB en FP16/BF16, ~9,5-10 GB en 8 bits y ~5-6 GB en 4 bits, aunque estas cifras no las confirma el autor.
- El autor afirma que el modelo base funciona en 8 bits en dispositivos con 16 GB de RAM (portátiles convencionales y Mac mini).
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, cabría esperar ejecución cómoda en GPUs de 24 GB (RTX 4090, A10G) en 8 bits o 4 bits, y en A100/H100 sin problema en precisión completa, pero el autor no lo documenta.
- Despliegue: transformers, text-generation-inference (TGI), LM Studio, MLX y GGUF (llama.cpp). El autor reporta pruebas en Apple Silicon con LM Studio/MLX/GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; la model card remite a benchlocal para consultar velocidades reales por formato en el mismo dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Qwopus3.5-9B-Coder-UNCENSORED-heretic (este) | 9,41B denso | No disponible | Código agéntico + decensurado | Apache 2.0 | Variante abliterated del coder |
| Jackrong/Qwopus3.5-9B-Coder (original) | 9,41B denso | No disponible | Código agéntico | Apache 2.0 | Tasa de rechazo 99/100; referencia de comportamiento |
| xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic | ~4B (no confirmado) | No disponible | Código agéntico + decensurado | Apache 2.0 | Versión reducida mencionada por el autor |
| Jackrong/Qwopus3.5-9B-v3.5 | 9,41B denso | No disponible | Base generalista | No disponible | Modelo base del que deriva el coder |

No se dispone de datos de rendimiento comparativo frente a otras familias (Qwen, Llama, Mistral) en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de "capability decay": al estar verticalmente ajustado para agentes de programación y razonamiento profundo, el rendimiento en dominios generales o tareas no relacionadas con código puede degradarse.
- Se trata de una versión experimental de comunidad, publicada solo para investigación y exploración, sin evaluación exhaustiva de rendimiento general.
- La ablación de rechazo (99/100 a 4/100) implica que el modelo responderá a peticiones que el original rechazaría; esto conlleva riesgos de seguridad y de cumplimiento en entornos de producción, y exige filtros externos si se despliega en aplicaciones de cara al usuario.
- La divergencia KL de 0,0703 respecto al original indica un cambio medible en la distribución de respuestas que puede afectar a la calidad en tareas sensibles.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos de esta escala y a los modos de razonamiento extendido.
- Longitud de contexto no documentada; conviene verificarla antes de usarla en tareas de repositorio completo.
- Licencia Apache 2.0 permite uso comercial, pero el estado "uncensored" puede entrar en conflicto con políticas de plataformas y con obligaciones regulatorias del despliegue.
- El soporte de visión en formato GGUF requiere descargar y colocar manualmente `mmproj.gguf` junto al modelo principal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic
- Modelo base (Qwopus3.5-9B-v3.5): https://huggingface.co/Jackrong/Qwopus3.5-9B-v3.5
- Modelo original coder: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Repositorio GGUF del coder: https://huggingface.co/Jackrong/Qwopus3.5-9B-coder-GGUF
- Versión 4B decensurada: https://huggingface.co/xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic
- Heretic (herramienta de ablación): https://heretic-project.org
- Framework de evaluación benchlocal: https://github.com/stevibe/benchlocal
