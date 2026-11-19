# turintech/LFM3-1.7B-Artemis-GGUF

## Resumen

LFM3-1.7B-Artemis-GGUF es una cuantización en formato GGUF del modelo LiquidAI/LFM3-1.7B, publicada por TurinTech bajo el nombre de su pipeline de compresión Artemis. El modelo base es un transformer de 1.728.801.600 parámetros desarrollado por Liquid AI, orientado a generación de texto, chat y tool calling en inglés. Esta versión cuantizada ocupa 1,10 GB en Q4_K_M, lo que la sitúa en el rango de modelos ejecutables en hardware de consumo y en entornos locales sin GPU dedicada.

El interés de esta ficha radica en que TurinTech no se limita a aplicar una cuantización estándar: compara su fichero con las cuantizaciones de bartowski y de Liquid AI sobre dos conjuntos de evaluación (tool use del BFCL y seguimiento estricto de instrucciones de IFEval) y publica los resultados por fichero. Según esos datos, la versión Artemis Q4_K_M conserva 58 de 64 decisiones correctas de tool use y 58 de 64 prompts seguidos en IFEval, sin truncamientos en el límite de tokens, frente a las 51 y 56 del Q4_K_M oficial de Liquid AI.

La relevancia actual del modelo es práctica: permite desplegar un asistente conversacional con soporte de function calling en local mediante llama.cpp u Ollama, con una ventana de contexto configurable (los ejemplos de la model card usan 8192 tokens) y una licencia lfm1.0 heredada del modelo base que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B); cuantizacion GGUF para llama.cpp |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible como spec oficial del modelo; los ejemplos de la model card arrancan el servidor con `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (fichero principal de 1,10 GB); el repo incluye otros ficheros GGUF segun la tabla comparativa (Q4_K_S e IQ4_XS aparecen como referencias de terceros) |
| Idiomas soportados | en (ingles); no se declaran otros idiomas |
| Licencia | lfm1.0 (license_name: lfm1.0, enlace a la licencia del modelo base LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de 1.728.801.600 parámetros de Liquid AI, y esta publicación es una cuantización del mismo, no un reentrenamiento. TurinTech aplica su pipeline Artemis, que según la model card emplea imatrix (el tag `imatrix` figura en el repositorio) para guiar la compresión. El resultado es un fichero GGUF de 1,10 GB en Q4_K_M, frente a los 1,12 GB de la cuantización de bartowski y los 1,10 GB de la de Liquid AI.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO; esos datos corresponden a la model card de Liquid AI y no se incluyen en la información proporcionada. La innovación destacable de esta publicación es la evaluación comparativa por fichero: TurinTech mide tool use (subconjunto del Berkeley Function-Calling Leaderboard) e IFEval estricto sobre 64 prompts, además de contar truncamientos en un límite de 128 tokens, y publica la tabla junto a las cuantizaciones alternativas. Todas las mediciones se realizaron con el modo thinking desactivado (`enable_thinking: false`).

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con llama.cpp (`--jinja`).
- Tool calling / function calling: el modelo devuelve las llamadas en `choices[0].message.tool_calls`, con soporte de `tool_choice: "auto"` y listas de herramientas en el endpoint compatible con OpenAI.
- Seguimiento de instrucciones estrictas: evaluado con IFEval en modo estricto (58 de 64 prompts seguidos).
- Modo thinking conmutable: la model card documenta `enable_thinking` como parámetro de la plantilla de chat; los resultados publicados se obtuvieron con thinking desactivado.
- Extracción de valores y respuestas cortas y deterministas: el ejemplo de la model card extrae una fecha con `temperature: 0` y `seed: 0`.
- Capacidades multilingües: solo se declara inglés (`language: en`); no hay evidencia de soporte de otros idiomas.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso más allá del tool calling.

## Casos de uso

- Asistente conversacional local: el fichero de 1,10 GB se ejecuta con llama.cpp u Ollama en equipos sin GPU dedicada, lo que permite desplegar un chat en inglés con contexto de 8192 tokens en portátiles y mini-PC.
- Automatización de extracción de datos: con `temperature: 0` y una instrucción de sistema que limite la respuesta al valor solicitado, el modelo extrae campos concretos (fechas, importes, identificadores) de texto libre, como demuestra el ejemplo de la fecha de entrega.
- Integración de function calling en agentes ligeros: el modelo emite llamadas estructuradas a herramientas como `get_weather` con argumentos JSON válidos, lo que permite conectarlo a APIs externas mediante el endpoint compatible con OpenAI de llama-server.
- Enrutamiento de consultas en pipelines: con 58 de 64 decisiones correctas en el subconjunto de tool use, puede usarse como clasificador de intención que decide qué herramienta invocar antes de derivar a un modelo mayor.
- Prototipado y pruebas de integración: al caber en 1,10 GB, permite levantar un servidor de pruebas con `llama-server -hf` en CI o en máquinas de desarrollo sin aprovisionar GPU, validando plantillas de chat y esquemas de herramientas.
- Despliegue en entornos con restricciones de red o privacidad: al ser un fichero GGUF descargable y ejecutable en local, el texto no sale del equipo, lo que encaja en escenarios donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

Resultados declarados por TurinTech en la model card (no verificados de forma independiente; `verified: false` en el model-index). Todas las mediciones con thinking desactivado.

| Fichero | Tamano | Tool use (de 64) | IFEval estricto (de 64) | Truncados en el limite (de 128) |
|---|---|---|---|---|
| TurinTech Q4_K_M | 1,10 GB | 58 | 58 | 0 |
| bartowski Q4_K_M | 1,12 GB | 59 | 56 | 0 |
| Liquid AI Q4_K_M | 1,10 GB | 51 | 56 | 1 |
| bartowski Q4_K_S | 1,05 GB | 58 | 53 | 2 |
| Liquid AI QAD-Q4_0 (entrenado aparte) | 1,05 GB | 57 | 54 | 1 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: el fichero Q4_K_M ocupa 1,10 GB; con overhead de contexto (8192 tokens) y de la propia librería, el consumo real es superior al tamaño del fichero, aunque no se proporcionan cifras exactas en la información disponible.
- GPU recomendadas: no se especifican en la model card; el ejemplo de ejecución usa `-ngl 99` para descargar todas las capas en GPU, lo que sugiere que cabe holgadamente en GPUs de consumo actuales.
- GPU de consumo: por tamaño (1,10 GB en Q4_K_M) es compatible con tarjetas de 8 GB o menos, e incluso con ejecución íntegra en CPU.
- Opciones de despliegue: llama.cpp (llama-server, requiere b11960 o superior, mínimo indicado por Liquid AI para LFM3) y Ollama (`ollama run turintech/lfm3-1.7b-artemis --think=false`, verificado con Ollama 0.40.14). El endpoint es compatible con la API de OpenAI (`/v1/chat/completions`).
- Latencia y throughput: no se publican cifras de latencia ni de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool use (de 64) | IFEval estricto (de 64) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TurinTech LFM3-1.7B-Artemis Q4_K_M | 1,73 B | no disponible (ejemplos con 8192) | 58 | 58 | lfm1.0 | GGUF en Hugging Face y Ollama |
| Liquid AI LFM3-1.7B Q4_K_M | 1,73 B | no disponible | 51 | 56 | lfm1.0 | GGUF en Hugging Face |
| bartowski LFM3-1.7B Q4_K_M | 1,73 B | no disponible | 59 | 56 | lfm1.0 | GGUF en Hugging Face |
| Liquid AI LFM3-1.7B QAD-Q4_0 | 1,73 B | no disponible | 57 | 54 | lfm1.0 | GGUF en Hugging Face |

Las tres alternativas comparten el mismo modelo base y la misma licencia; las diferencias se limitan al método de cuantización y al equilibrio entre tool use e IFEval. No se dispone de comparaciones con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: la model card declara únicamente `en` y las pruebas se hicieron en inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Resultados no verificados: las métricas del model-index llevan `verified: false` y proceden del propio autor; los conjuntos son subconjuntos de 64 prompts, no los benchmarks completos.
- Tool use ligeramente inferior a bartowski: 58 frente a 59 en el subconjunto evaluado, aunque con mejor IFEval (58 frente a 56).
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de calibración; como modelo de 1,7 B parámetros, la fiabilidad en dominios especializados es limitada.
- Licencia lfm1.0: es una licencia "other" heredada del modelo base; hay que revisar el enlace de la licencia de Liquid AI antes de cualquier uso comercial, ya que la información disponible no detalla sus términos.
- Dependencia de versión: requiere llama.cpp b11960 o superior y HTTPS para la descarga con `-hf`; versiones anteriores pueden no cargar el modelo correctamente.
- Modo thinking desactivado por defecto en los ejemplos: los resultados publicados no cubren el comportamiento con thinking activo, por lo que su calidad en ese modo es desconocida.
- Sin datos de contexto oficial: la longitud máxima de contexto del modelo base no se declara en la información disponible; los 8192 tokens de los ejemplos son una configuración de servidor, no una especificación garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/turintech/LFM3-1.7B-Artemis-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/0dc4268b561499c648c7ba7c9466bf3d8d01517a/LICENSE
- Página de TurinTech: https://www.turintech.ai
- Modelos de TurinTech en Hugging Face: https://huggingface.co/turintech
- Paquete en Ollama: https://ollama.com/turintech/lfm3-1.7b-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
