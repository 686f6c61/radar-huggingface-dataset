# turintech/MiniCPM5-2B-Artemis-GGUF

## Resumen
MiniCPM5-2B-Artemis-GGUF es una cuantización en formato GGUF del modelo openbmb/MiniCPM5-2B, publicada por TurinTech bajo el paraguas de su herramienta de compresión Artemis. El modelo base es un transformer denso de 2.516.756.480 parámetros (aproximadamente 2,5 mil millones) orientado a generación de texto, conversación y, de forma destacada, a tool calling y function calling. Esta versión GGUF está pensada para ejecución local en llama.cpp, Ollama y LM Studio, con un peso de descarga de 1,53 GB para la cuantización Q4_K_S.

La relevancia de esta ficha radica en que TurinTech no se limita a cuantizar: aplica una selección de archivo y un pipeline de compresión (Artemis, con uso de imatrix) que, según sus mediciones, mejora ligeramente al modelo original en tool calling (184 de 258 frente a 181 de 258 en BFCL live_simple) y en GSM8K (209 de 250 frente a 193 de 250), manteniendo un tamaño 3,3 veces menor que el BF16 original (5,04 GB). Es, por tanto, un candidato interesante para despliegues en hardware de consumo donde se necesita un modelo conversacional pequeño con soporte de herramientas.

El contexto máximo no está declarado en la información disponible; el ejemplo de la model card usa `-c 8192` como configuración de servidor, pero no se especifica la longitud de contexto nativa del modelo base. La licencia es Apache 2.0, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base openbmb/MiniCPM5-2B); pesos en formato GGUF para llama.cpp |
| Parametros totales | 2.516.756.480 (aprox. 2,5 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card usa 8192 tokens de servidor) |
| Tipos de cuantizacion | GGUF; la variante destacada es Q4_K_S (1,53 GB). Otras cuantizaciones del repo no detalladas en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base original en safetensors/BF16 |

## Arquitectura y entrenamiento
El modelo es una cuantización GGUF del MiniCPM5-2B de OpenBMB, un transformer denso de aproximadamente 2,5 mil millones de parámetros. La información proporcionada no detalla la composición del dataset de entrenamiento del modelo base, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la model card de openbmb/MiniCPM5-2B, que no se incluye en el material disponible.

La innovación técnica de esta publicación concreta es el pipeline Artemis de TurinTech, que emplea imatrix (matriz de importancia) para guiar la cuantización y una selección de archivo orientada a preservar capacidades de tool calling y matemáticas. Según la model card, el archivo Q4_K_S de TurinTech iguala o supera al BF16 original en las métricas declaradas, con un tamaño de 1,53 GB frente a 5,04 GB. El modelo soporta un modo de razonamiento ("thinking") activado por defecto en la plantilla de chat; todas las métricas publicadas se midieron con ese modo desactivado mediante `"chat_template_kwargs": {"enable_thinking": false}`.

## Capacidades
- Generación de texto conversacional multi-turno.
- Tool calling y function calling: las llamadas se devuelven en `choices[0].message.tool_calls` a través de un endpoint compatible con la API de OpenAI.
- Razonamiento matemático: 209 de 250 aciertos en GSM8K (últimas 250 preguntas) según el autor.
- Seguimiento de instrucciones: 458 de 539 en IFEval según el autor.
- Conocimiento general y razonamiento tipo MMLU-Pro: 95 de 280 en la muestra evaluada.
- Modo "thinking" configurable por petición mediante `chat_template_kwargs`.
- Compatibilidad con endpoints (`endpoints_compatible`) y despliegue en llama.cpp, Ollama y LM Studio.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se declaran capacidades de visión, audio ni agentes multi-paso autónomos más allá del tool calling.

## Casos de uso
- Asistentes locales de atención al cliente: el modelo puede gestionar conversaciones multi-turno y emitir tool calls para consultar APIs internas, ejecutándose en una GPU de consumo con solo 2,2 GiB de VRAM en Q4_K_S.
- Automatización de tareas con function calling en entornos de escritorio: integración con Ollama o LM Studio para que un agente local invoque herramientas del sistema (calendario, ficheros, shell) sin depender de la nube.
- Resolución de problemas matemáticos de nivel escolar: con 209 de 250 en GSM8K, es adecuado para tutores educativos o validación de ejercicios aritméticos en pipelines de corrección automática.
- Clasificación y extracción de información con instrucciones estrictas: su 458 de 539 en IFEval lo hace utilizable en tareas de formateo de salida, extracción estructurada y transformación de texto donde el cumplimiento de restricciones es crítico.
- Prototipado rápido de agentes en CI/CD: al ser un GGUF de 1,53 GB, se puede incluir en imágenes de contenedor y ejecutar en runners con GPU modesta para pruebas de integración de herramientas.
- Chatbot embebido en aplicaciones de escritorio o dispositivos edge: el tamaño reducido y el soporte de llama.cpp permiten distribuirlo junto a la aplicación sin infraestructura de servidor.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de Artemis frente a cuantizaciones estándar (bartowski, OpenBMB) en tareas de tool calling y matemáticas.

## Benchmarks y rendimiento
Datos declarados por el autor (TurinTech), no verificados de forma independiente. Todas las mediciones se realizaron con el modo thinking desactivado.

| Archivo | Tamano | Tool calls BFCL live_simple (de 258) | GSM8K (de 250) | MMLU-Pro (de 280) | IFEval (de 539) |
|---|---|---|---|---|---|
| TurinTech Q4_K_S | 1,53 GB | 184 | 209 | 95 | 458 |
| bartowski Q4_K_S | 1,53 GB | 173 | 206 | 84 | 468 |
| OpenBMB Q4_K_M | 1,56 GB | 160 | 179 | 87 | 460 |
| BF16 original | 5,04 GB | 181 | 193 | 92 | 462 |

El autor señala que, tras corregir por 16 comparaciones planificadas, solo dos diferencias se mantienen estadísticamente sólidas, ambas frente al Q4_K_M de OpenBMB: tool calls (184 frente a 160) y GSM8K (209 frente a 179). Parte de la diferencia se atribuye al formato de respuesta: el archivo de OpenBMB no emitió ninguna tool call en 46 ocasiones frente a 23 del archivo de TurinTech, y en GSM8K 151 respuestas de OpenBMB agotaron el límite de 768 tokens frente a 70 del archivo de TurinTech.

## Requisitos de hardware
- VRAM estimada: 2,2 GiB para la cuantización Q4_K_S (frente a 5,2 GiB del BF16 original), según la model card.
- GPU recomendadas: cualquier GPU con al menos 3-4 GiB de VRAM libre; cabe en RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con memoria compartida suficiente. Para mayor throughput, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas con 4 GiB o más.
- Opciones de despliegue: llama.cpp (`llama-server`, requiere build b11617 o superior), Ollama (`ollama run turintech/minicpm5-2b-artemis`), LM Studio (`turintech/minicpm5-2b-artemis`). Compatible con endpoints estilo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Tool calls BFCL (de 258) | GSM8K (de 250) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniCPM5-2B-Artemis-GGUF (TurinTech) | 2,5 B | No disponible | 184 | 209 | Apache 2.0 | Hugging Face, Ollama, LM Studio |
| MiniCPM5-2B Q4_K_M (OpenBMB) | 2,5 B | No disponible | 160 | 179 | Apache 2.0 | Hugging Face |
| MiniCPM5-2B Q4_K_S (bartowski) | 2,5 B | No disponible | 173 | 206 | Apache 2.0 | Hugging Face |
| MiniCPM5-2B BF16 original | 2,5 B | No disponible | 181 | 193 | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos de tamaño similar (por ejemplo, Qwen2.5-3B o Llama-3.2-3B) en la información proporcionada, por lo que la comparativa se limita a las distintas cuantizaciones del mismo modelo base.

## Limitaciones y advertencias
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; el propio autor reconoce que solo dos diferencias sobreviven a la corrección por comparaciones múltiples.
- El modo thinking está activado por defecto en la plantilla de chat; si se deja activo, el comportamiento y el consumo de tokens pueden diferir de los medidos.
- Riesgo de alucinación inherente a un modelo de 2,5 B; no se han publicado evaluaciones específicas de factualidad.
- Idiomas soportados no declarados: no hay garantía de calidad multilingüe más allá del inglés, que es el idioma de los benchmarks.
- Longitud de contexto nativa no documentada; el ejemplo de servidor usa 8192 tokens, pero no se confirma que sea el máximo del modelo.
- Requiere llama.cpp b11617 o superior; versiones anteriores pueden no cargar correctamente el archivo o la plantilla de chat.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base en el repositorio de OpenBMB por si hubiera condiciones adicionales.
- El tamaño reducido limita el razonamiento complejo y el conocimiento factual; no es adecuado para tareas que requieran contexto muy largo o alta precisión enciclopédica.

## Enlaces
- Hugging Face: https://huggingface.co/turintech/MiniCPM5-2B-Artemis-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Licencia del modelo base: https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE
- Ollama: https://ollama.com/turintech/minicpm5-2b-artemis
- LM Studio: https://lmstudio.ai/turintech/minicpm5-2b-artemis
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Berkeley Function-Calling Leaderboard: https://gorilla.cs.berkeley.edu/leaderboard.html
- GSM8K: https://huggingface.co/datasets/openai/gsm8k
- MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- IFEval: https://huggingface.co/datasets/google/IFEval
