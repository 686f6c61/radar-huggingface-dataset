# yunusemrejr/Flyingkiwi-EN-0.6B

## Resumen

Flyingkiwi-EN-0.6B es un asistente conversacional en inglés de tamaño muy reducido (528 millones de parámetros), desarrollado por Yunus Emre Vurgun para el proyecto Flyingkiwi. Se trata de un fine-tuning completo de Qwen3-0.6B, optimizado para ejecutarse íntegramente en el navegador mediante un motor propio escrito en C compilado a WebAssembly, de modo que los mensajes nunca salen del dispositivo del usuario. Su objetivo no es competir en benchmarks generales, sino ser honesto y útil en un ámbito muy concreto: responder con claridad cuando sabe la respuesta, admitir abiertamente cuando no puede saberla (datos en vivo, información privada, el futuro) y corregir premisas falsas.

La relevancia del modelo reside en su enfoque de "on-device": demuestra que un modelo de 0.6B puede ofrecer un asistente de chat razonable con privacidad total, usando pesos cuantizados a 8 bits (561 MB) cargados en el navegador. El entrenamiento combina destilación de conocimiento desde un modelo profesor (Qwen3.5-35B-A3B), un vocabulario especializado en inglés derivado del de Qwen3 (85.121 tokens frente a los 151.669 originales) y respuestas reescritas para máxima concisión. El checkpoint publicado en Hugging Face está en BF16 en formato safetensors, bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3), atención completa en las 28 capas |
| Parametros totales | 527.631.360 (528M: 440M transformer + 87M embedding atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en la aplicación de navegador (RoPE θ = 1.000.000) |
| Tipos de cuantizacion | BF16 (este checkpoint); INT8 por grupos de 32 con escalas fp16 en la versión de navegador (561 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16); archivo propietario `.fkm` (INT8) para el motor WebAssembly |

## Arquitectura y entrenamiento

La arquitectura base es Qwen3-0.6B: 28 capas, ancho 1024, FFN de 3072, 16 cabezas de consulta y 8 cabezas KV de 128 dimensiones (GQA), con atención completa en todas las capas tanto en entrenamiento como en el navegador. Un detalle técnico notable: una versión anterior entrenada con ventana deslizante de 1.024 tokens en tres de cada cuatro capas mostró una pérdida claramente superior en conversaciones largas tras los primeros 1.024 tokens (1,28 frente a 1,08 nats por token), por lo que se descartó la ventana deslizante. El vocabulario se especializó en inglés eliminando los tokens que el texto en inglés nunca utiliza y reconstruyendo los merges BPE, cerrando sobre los ancestros de merge para que cualquier texto compuesto por tokens conservados se tokenice exactamente igual que antes; esto reduce la matriz de embedding y la capa de salida por token.

El entrenamiento fue un fine-tuning de parámetros completos en BF16 con maestros en FP32 sobre Qwen3-0.6B, usando 15.834 conversaciones de entrenamiento (344 reservadas para validación): prompts públicos de OASST2, Aya, GSM8K y TriviaQA más prompts escritos por el profesor (temas, código, escritura, matemáticas, sondas de honestidad, preguntas de entidades inventadas, identidad y tests de memoria), respondidos por el profesor Qwen3.5-35B-A3B; el 8% eran conversaciones multi-tema encadenadas de hasta 4.096 tokens. Se usaron 148 pasos de optimizador con pico de learning rate 1,5e-05 y decaimiento coseno, unos 65k tokens por paso, sin entrenamiento consciente de cuantización; la pérdida de validación bajó de 2,165 a 1,311. Como innovaciones destacables: las respuestas del profesor fueron reescritas previamente a la forma completa más corta posible (22.067 respuestas reescritas, conservando el 43% de los caracteres originales) para reducir las oportunidades de alucinación, y la calibración de honestidad se construyó a partir de lo que el modelo base sabía o no sabía en TriviaQA, enseñando un "no estoy seguro" honesto en los casos desconocidos. Todo el cómputo se realizó en una NVIDIA RTX PRO 6000 Blackwell (96 GB) en Google Colab Pro+.

## Capacidades

- Generación de texto conversacional en inglés en formato ChatML sin bloques de thinking (incluye `chat_template.jinja`).
- Admisión honesta de incertidumbre: reconoce cuando no puede conocer algo (datos en vivo, información privada, el futuro); logra 18/20 en la categoría "says when it cannot know" del test propio del proyecto.
- Corrección de premisas falsas, aunque con rendimiento modesto (5/10 en el test propio).
- Manejo de ambigüedad en las preguntas (3/10 frente a 0/10 del modelo base).
- Mantenimiento de contexto multi-turno hasta 4.096 tokens.
- Respuestas concisas por diseño: las respuestas de entrenamiento fueron reescritas a la versión completa más corta, reduciendo la superficie de alucinación.
- Formato Markdown y bloques de código, según las reglas del profesor.
- Ejecución íntegra en navegador vía WebAssembly con pesos INT8, sin que los mensajes salgan del dispositivo.
- No hay soporte documentado de tool calling, function calling, visión ni audio.

## Casos de uso

- Chatbot privado en sitios web: el modelo se ejecuta en el navegador del visitante con un motor C → WebAssembly, ideal para páginas que quieren ofrecer un asistente sin backend de inferencia ni envío de datos a servidores.
- Prototipado de asistentes on-device: su tamaño de 561 MB en INT8 y su formato ChatML estándar lo hacen adecuado para experimentar con LLM en cliente sin coste de API.
- Atención al usuario de primer nivel en productos web: puede mantener conversaciones multi-turno dentro de su ventana de 4.096 tokens, respondiendo preguntas frecuentes y admitiendo con honestidad cuando debe escalar a un humano.
- Asistente de trivia y conocimiento general en inglés: entrenado con TriviaQA y con calibración explícita de "no lo sé", es adecuado para aplicaciones de preguntas y respuestas donde los falsos positivos son costosos.
- Práctica de matemáticas y razonamiento sencillo: el conjunto de entrenamiento incluye GSM8K, útil para ejercicios de aritmética y problemas de razonamiento de nivel básico.
- Educación sobre privacidad y IA local: al no salir los datos del dispositivo, sirve como demostración de arquitecturas de IA que respetan la privacidad por diseño.
- Asistente de escritura y redacción breve en inglés: las respuestas concisas y el formato Markdown encajan con tareas de corrección y redacción corta dentro del navegador.

## Benchmarks y rendimiento

Los únicos datos publicados provienen del conjunto de evaluación propio del proyecto (100 casos congelados, reservados del entrenamiento, graduados por IA con verificación puntual; no es un estudio humano independiente). La referencia es Qwen3-0.6B sin modificar (8-bit).

| Categoria | Qwen3-0.6B | Flyingkiwi |
|---|---|---|
| Hechos y razonamiento respondibles | 22/30 (73%) | 20/30 (67%) |
| Correccion de premisas falsas | 7/10 (70%) | 5/10 (50%) |
| Dice cuando no puede saber | 17/20 (85%) | 18/20 (90%) |
| Maneja ambiguedad | 0/10 (0%) | 3/10 (30%) |
| Conversacion amistosa | 6/10 (60%) | 6/10 (60%) |
| Contexto multi-turno | 11/20 (55%) | 11/20 (55%) |
| Total (100 casos) | 63/100 (63%) | 63/100 (63%) |
| Respuestas en idioma incorrecto | 0 | 0 |
| Respuestas con hechos fabricados | 6 | 6 |

TruthfulQA MC1 (817 preguntas, log-verosimilitud de cada opción): Qwen3-0.6B 25,8%, Flyingkiwi 25,1% (dentro del error de muestreo de ~1,5 puntos). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

Sobre la cuantización, el autor reporta en 40 conversaciones reservadas una pérdida de respuesta por token de 1,327 nats en float y en 8 bits, 1,496 con redondeo 4-bit plano, 1,407 con GPTQ y 1,365 con GPTQ híbrido (420 MB); la distribución de siguiente token de la versión INT8 se mantiene a una KL media de 0,011 de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint BF16 ocupa unos 1,06 GB de pesos (el repositorio completo pesa 3,2 GB); la versión de navegador INT8 ocupa 561 MB de descarga y memoria equivalente, ejecutable sin GPU dedicada.
- GPU recomendadas: ninguna GPU específica es necesaria para la versión de navegador (CPU + WebAssembly). Para fine-tuning, el autor usó una NVIDIA RTX PRO 6000 Blackwell de 96 GB en Colab Pro+; para inferencia del checkpoint BF16 con transformers basta cualquier GPU con ~2-4 GB de VRAM o incluso CPU.
- Consumer GPUs: la versión de navegador no requiere GPU en absoluto; el checkpoint BF16 cabe con holgura en una RTX 3060 de 12 GB o incluso en GPUs de 4 GB.
- Opciones de despliegue: transformers (librería nativa del modelo), el motor propio C → WebAssembly de Flyingkiwi (flyingkiwi.yunusemrevurgun.com) y endpoints de inferencia compatibles (tags `text-generation-inference` y `endpoints_compatible`). No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Caracteristica | Flyingkiwi-EN-0.6B | Qwen3-0.6B (base) | SmolLM2-360M | Qwen2.5-0.5B |
|---|---|---|---|---|
| Parametros | 528M | 600M | 360M | 500M |
| Contexto | 4.096 (app navegador) | 32.768 (no disponible en este fork) | 8.192 | 32.768 |
| Vocabulario | 85.121 | 151.669 | 49.152 | 151.936 |
| Idiomas | Ingles | Multilingue (119) | Principalmente ingles | Multilingue |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 | Variantes Apache 2.0 / Qwen |
| Enfoque | Chat honesto on-device en navegador | Modelo base generalista | Modelo compacto generalista | Modelo compacto generalista |
| Ejecucion en navegador | Si (motor propio WASM, INT8) | No nativa | Requiere herramientas externas (Wllama, etc.) | Requiere herramientas externas |

La ventaja diferencial de Flyingkiwi no es el rendimiento bruto (empata con su base en el test propio y queda por detrás en hechos y corrección de premisas), sino el empaquetado: vocabulario especializado, pesos INT8 listos para WebAssembly y un comportamiento calibrado para honestidad y concisión.

## Limitaciones y advertencias

- Rendimiento modesto propio de un modelo de 0.6B: el autor advierte explícitamente que "sigue cometiendo errores; verifica cualquier cosa importante".
- Riesgo de alucinación medible: 6 de 100 respuestas del test propio contienen hechos fabricados, igual que el modelo base.
- Corrección de premisas falsas por debajo del modelo base (50% frente a 70%), y solo un 30% de acierto en manejo de ambigüedad.
- Rendimiento en razonamiento por debajo de la referencia (67% frente a 73% en hechos y razonamiento respondibles).
- Mono-idioma: solo inglés; el vocabulario especializado degrada el tokenizado de texto en otros idiomas (los textos fuera del conjunto conservado se dividen en piezas más cortas).
- Contexto de 4.096 tokens en la aplicación de navegador, muy por debajo de los 32k del Qwen3-0.6B original; no apto para documentos largos.
- Sesgo de evaluación: la variante publicada fue seleccionada usando el mismo test de 100 casos, por lo que su puntuación es ligeramente optimista; además, los graduadores son modelos de IA, no humanos.
- TruthfulQA MC1 de 25,1% indica una propensión considerable a repetir concepciones erróneas comunes, típica de modelos de este tamaño.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, pero el modelo hereda los sesgos de sus datos de entrenamiento (OASST2, Aya, GSM8K, TriviaQA) y de su modelo profesor.
- Solo 528 descargas y 0 likes en el momento de la ficha: proyecto individual con comunidad mínima, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunusemrejr/Flyingkiwi-EN-0.6B
- Aplicación Flyingkiwi (demo en navegador): https://flyingkiwi.yunusemrevurgun.com/
- Informe técnico del proyecto: https://flyingkiwi.yunusemrevurgun.com/technical/report/
- Web del autor: https://yunusemrevurgun.com/
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Datasets de entrenamiento: https://huggingface.co/datasets/OpenAssistant/oasst2 , https://huggingface.co/datasets/CohereLabs/aya_dataset , https://huggingface.co/datasets/openai/gsm8k , https://huggingface.co/datasets/mandarjoshi/trivia_qa
