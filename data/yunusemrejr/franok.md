# yunusemrejr/Franok

## Resumen

Franok es un modelo de lenguaje experimental bilingüe inglés-turco desarrollado por Yunus Emre Vurgun (usuario `yunusemrejr`). Se trata de un modelo entrenado desde cero (from-scratch) con una arquitectura de decodificador causal propia que incorpora un mecanismo de enrutamiento tipo MoE: cada una de sus doce capas dirige cada token a uno de ocho bancos SwiGLU, seleccionando el banco mediante un ancla derivada del grupo de ocho tokens precedentes. El modelo cuenta con 314.061.312 parámetros totales, de los cuales 49.820.160 participan por token, incluyendo la cabeza de vocabulario atada.

La relevancia del proyecto reside en su carácter de experimento de extremo a extremo: tokenizador byte-level propio ajustado sobre el split de entrenamiento original, runtime propio (no PyTorch nativo), cuantizaciones Q4 y Q8 empaquetadas con manifiestos y sumas SHA-256, y despliegue real en navegador (WebAssembly) y como aplicación de escritorio para Ubuntu. El contexto de entrenamiento de la versión extendida alcanza los 1.024 tokens.

La versión actual, 0.5, es un ajuste fino completo sobre los pesos FP32 de la 0.4, que a su vez partió de conversaciones de consejo práctico generadas por Qwen3-8B y Qwen3-14B. La model card reconoce explícitamente que la 0.4 fallaba en saludos y conversación trivial, lo que sitúa a la 0.5 como un intento de corregir esas deficiencias. La licencia es MIT y los idiomas declarados son inglés y turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con enrutamiento por token a 8 bancos SwiGLU (estilo MoE), 12 capas, tokenizador byte-level propio |
| Parametros totales | 314.061.312 |
| Parametros activos | 49.820.160 por token (incluye la cabeza de vocabulario atada) |
| Longitud de contexto | 1.024 tokens (entrenamiento de la versión extendida) |
| Tipos de cuantizacion | FP32 (checkpoint nativo), Q8 (353 MB), Q4 (196 MB) con búsqueda de escala por grupo |
| Idiomas soportados | Inglés (en), turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors (FP32), `model.q4` / `model.q8` con manifiestos JSON propios, `.deb` para Ubuntu |

## Arquitectura y entrenamiento

La arquitectura es un decodificador causal de doce capas con un mecanismo de enrutamiento poco habitual: cada token se asigna a uno de ocho bancos SwiGLU tomando como ancla el grupo de ocho tokens precedentes. Esto produce un modelo con 314 millones de parámetros almacenados pero solo unos 49,8 millones activos por token, lo que reduce el coste computacional de la inferencia. El tokenizador es byte-level y fue ajustado específicamente sobre el split de entrenamiento original, no heredado de otro modelo. La versión extendida entrena sobre secuencias de hasta 1.024 tokens.

El entrenamiento se realizó en tres fases iniciales sobre una única GPU Colab L4, con 53.859.151 objetivos de predicción de siguiente token en el primer release. Una segunda asignación de L4 continuó el checkpoint original sobre corpus abiertos en inglés y turco, amplió el contexto y aplicó ajuste supervisado completo. El adaptador de diálogo se entrenó sobre respuestas de asistente; el adaptador de evidencia combinó supervisión de asistente con una pérdida de respuesta correcta frente a distractores; y el adaptador final aprendió mediante gradiente de política relativo a grupo (GRPO) con recompensa simbólica sobre seis completaciones muestreadas por prompt. La tercera ejecución añadió 383.385.600 objetivos de preentrenamiento procedentes de documentos web educativos y generales y relatos cortos. La 0.4 ajustó en completo el merge FP32 de la 0.3 sobre 35.672 conversaciones de consejo práctico generadas por Qwen3-8B y Qwen3-14B, con una pasada de calificación y un filtro de contaminación. La 0.5 ajusta en completo los pesos FP32 de la 0.4 sin cambios en arquitectura, tokenizador, cabeza lectora ni datos de búsqueda.

## Capacidades

- Generación de texto conversacional en inglés y turco, con detección automática del idioma del mensaje en las aplicaciones oficiales y cambio de idioma de respuesta para coincidir.
- Razonamiento de sentido común y respuesta a preguntas sobre pasajes, apoyado en datasets como SQuAD, SQuAD v2 y CommonSenseQA.
- Aritmética local etiquetada en las aplicaciones de referencia (cálculo simbólico, no puramente neuronal).
- Lector condicionado por pregunta: una cabeza opcional (`reader/`) aprende dónde empieza y termina una cita de un texto fuente breve.
- Búsqueda bilingüe entre mensajes guardados mediante un codificador opcional de 96 dimensiones (`search/`, 8 bits).
- Soporte de instrucción de sistema (`--system`) para modificar el formato de las respuestas.
- Historial guardado y turnos adjuntos en las aplicaciones oficiales.
- Generación con muestreo a temperatura configurable (temperatura cero por defecto en la aplicación).
- Capacidad de ejecución en navegador vía WebAssembly (Q8 en escritorio, Q4 en móviles) y en aplicación de escritorio Ubuntu con caché de pesos verificados para generación offline.

## Casos de uso

- Asistente conversacional ligero en navegador: el modelo se carga como WebAssembly con pesos Q4 (196 MB) en móviles o Q8 (353 MB) en escritorio, permitiendo conversaciones bilingües sin backend ni conexión, gracias a su tamaño reducido y a su detección automática de idioma.
- Aplicación de escritorio offline para Ubuntu: el paquete `.deb` incluye los pesos Q8 verificados por SHA-256 y caché local, adecuado para entornos sin conectividad o con requisitos de privacidad donde los datos no deben salir del equipo.
- Respuesta a preguntas sobre documentos breves: la cabeza lectora opcional localiza el inicio y el final de una cita en un texto fuente, útil para extracción de evidencia en pasajes de hasta 1.024 tokens, un escenario típico de atención al cliente sobre FAQ o manuales cortos.
- Búsqueda semántica bilingüe en historiales de chat: el codificador de 96 dimensiones en 8 bits permite indexar y recuperar mensajes guardados en inglés o turco, integrándose en aplicaciones de notas o asistentes personales.
- Prototipado e investigación educativa: al ser un modelo from-scratch con runtime propio, tokenizador propio y registro de entrenamiento por release (`training-record/`), sirve para estudiar el efecto del enrutamiento por ancla, las cuantizaciones por grupo y el ajuste con GRPO sobre un modelo pequeño.
- Filtrado y clasificación de conversaciones cortas: con temperatura cero y formato de sistema, puede generar respuestas etiquetadas o reformateadas, útil para tareas de normalización de saludos y small talk en pipelines de preprocesado.
- Demostraciones docentes de despliegue en el edge: el par de cuantizaciones Q4/Q8 con manifiestos y sumas SHA-256 constituye un ejemplo reproducible de empaquetado de un modelo para WebAssembly y escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona seis mediciones de modelado de lenguaje retenidas en `pretrained/` y registros de pérdida de entrenamiento y validación interna en `training-record/`, pero no se incluyen cifras comparables con MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP32 completo ocupa aproximadamente 1,26 GB (314 M parámetros × 4 bytes); la cuantización Q8 pesa 353 MB y la Q4 196 MB.
- GPU recomendadas: no se especifican en la información disponible. El entrenamiento se realizó en una única GPU Colab L4, lo que sugiere que el modelo es entrenable e inferible en GPUs de gama media con suficiente memoria.
- Cabe en GPU de consumo: sí, con amplio margen. Cualquier GPU con 2 GB o más de VRAM puede alojar el checkpoint FP32; las cuantizaciones Q4 y Q8 caben en GPUs integradas y en memoria unificada de dispositivos móviles.
- Opciones de despliegue: runtime propio del proyecto (`python -m franok.chat`), aplicación Ubuntu (`.deb`), navegador web vía WebAssembly con pesos Q4 o Q8, y notebook de Colab. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y dado que la arquitectura es personalizada y no estándar en PyTorch, es probable que estos motores no la soporten sin trabajo adicional.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Franok 0.5 | 314 M | 49,8 M | 1.024 | en, tr | MIT | Runtime propio, WebAssembly, Ubuntu |
| SmolLM2-360M | 362 M | no aplica (denso) | 8.192 | en (principalmente) | Apache 2.0 | Transformers, llama.cpp, ONNX |
| Qwen2.5-0.5B | 494 M | no aplica (denso) | 32.768 | multilingüe | Apache 2.0 | Transformers, vLLM, llama.cpp |
| TinyLlama-1.1B | 1,1 B | no aplica (denso) | 2.048 | en (principalmente) | Apache 2.0 | Transformers, llama.cpp, vLLM |

La comparación es orientativa: Franok se distingue por su arquitectura MoE con enrutamiento por ancla, su soporte nativo de turco y su empaquetado para ejecución en navegador, mientras que los modelos de referencia ofrecen contextos mucho mayores, ecosistemas de despliegue estándar y benchmarks públicos. No se dispone de datos de rendimiento comparables para Franok.

## Limitaciones y advertencias

- Contexto muy limitado: 1.024 tokens, insuficiente para documentos largos, conversaciones extensas o tareas de recuperación sobre corpus amplios.
- Modelo experimental de autor individual: no hay evidencia de evaluación independiente ni de benchmarks públicos; la model card reconoce fallos en versiones previas (la 0.4 fallaba en saludos y small talk).
- Riesgo de alucinación: al ser un modelo pequeño entrenado en parte con datos sintéticos generados por Qwen3-8B y Qwen3-14B, puede reproducir errores factuales y sesgos de esos generadores.
- Sesgos conocidos: no documentados explícitamente en la información disponible; los datasets de entrenamiento incluyen Wikipedia, OpenAssistant, Dolly, OpenOrca-tr, Aya y FineWeb, con sesgos propios de esas fuentes.
- Limitaciones de idioma: solo inglés y turco declarados; el rendimiento fuera de esos idiomas no está evaluado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y sin garantía; conviene conservar el aviso de copyright.
- Caveat de producción: la arquitectura es personalizada y el runtime es propio; la integración con herramientas estándar (PyTorch, vLLM, llama.cpp) requiere descargar configuración, tokenizador y checkpoint e instalar dependencias del repositorio fuente, lo que añade fricción operativa.
- Las funciones de aritmética local, normalización de saludos y reintento de preguntas son características de las aplicaciones oficiales, no del modelo neuronal; las evaluaciones directas del modelo no las incluyen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunusemrejr/Franok
- Revisión 0.3: https://huggingface.co/yunusemrejr/Franok/tree/v0.3.0
- Revisión 0.4: https://huggingface.co/yunusemrejr/Franok/tree/v0.4.0
- Checkpoint original: https://huggingface.co/yunusemrejr/Franok/tree/7633d06180ebbc836af02c590f96f8ac28a4829a
- Segundo checkpoint: https://huggingface.co/yunusemrejr/Franok/tree/db3e8a10bd3fcefde40acdc25ba7c6dc59cde32b
- Chat en navegador: https://franok.yunusemrevurgun.com/
- Instalador Ubuntu: https://franok.yunusemrevurgun.com/downloads/ubuntu
- Película de arquitectura (YouTube): https://youtu.be/XtNThi_pBjM
- Código fuente en GitHub: https://github.com/yunusemrejr/Franok
- Notebook de Colab: https://colab.research.google.com/github/yunusemrejr/Franok/blob/main/training/Franok.ipynb
