# turintech/Qwen3.5-9B-Artemis-GGUF

## Resumen

Qwen3.5-9B-Artemis-GGUF es una cuantización en formato GGUF del modelo Qwen/Qwen3.5-9B, publicada por TurinTech bajo el nombre Artemis. El modelo base es un transformer denso de Qwen con 8.953.803.264 parámetros (aproximadamente 9B) y capacidades multimodales de tipo image-text-to-text, además de soporte de function calling. TurinTech se limita a empaquetar y optimizar los pesos originales para su ejecución local con llama.cpp, Ollama y LM Studio, manteniendo la licencia Apache 2.0 del modelo original.

La relevancia de esta publicación radica en la compresión: el autor declara un archivo de 5,661 GB que requiere un pico de 5,7 GiB de VRAM en inferencia de solo texto, frente a los 15,9 GiB del modelo original. Esa reducción permite ejecutar un modelo de 9B con capacidades de tool calling en GPU de consumo. TurinTech reporta además una mejora marginal en BFCL live (221 de 258 llamadas correctas frente a 216 del original), lo que sugiere que la cuantización no degrada —e incluso puede mejorar ligeramente— el comportamiento en function calling.

El repositorio acumula más de 600.000 descargas, lo que indica una adopción amplia en el ecosistema de inferencia local. La ficha se centra en los datos verificables publicados por el autor; los detalles de arquitectura interna, composición del dataset de entrenamiento y longitud de contexto del modelo base no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-9B); detalles internos no disponibles |
| Parámetros totales | 8.953.803.264 (8,95B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantización | GGUF; el autor documenta explícitamente Q4_K_M (5,661 GB) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); incluye proyector de visión de 918 MB (`mmproj`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de aproximadamente 9B parámetros con pipeline image-text-to-text, lo que implica un codificador visual acoplado a un decodificador de lenguaje. TurinTech no aporta detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo original; esa información correspondería a la model card de Qwen y no está incluida en la documentación disponible.

La aportación técnica de esta publicación es la cuantización con `imatrix` (matriz de importancia), una técnica de llama.cpp que calibra la cuantización ponderando los pesos según su impacto en las activaciones. El autor reporta que el resultado Q4_K_M ocupa 5,661 GB y requiere un pico de 5,7 GiB de VRAM en modo texto con un solo slot (`-np 1`), frente a los 15,9 GiB del original. Los pesos se empaquetan con plantilla de chat Jinja embebida (`--jinja`), lo que permite el envío de herramientas y la conmutación del modo de razonamiento mediante `chat_template_kwargs.enable_thinking`. El proyector de visión se convirtió y verificó por separado con la build b11889 de llama.cpp.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a chat local.
- Function calling y tool calling: el autor reporta 221 de 258 llamadas correctas en BFCL live con decodificación greedy y thinking desactivado.
- Razonamiento matemático: 238 de 250 respuestas correctas en las últimas 250 preguntas de GSM8K.
- Conocimiento general y razonamiento experto: 147 de 280 aciertos en una muestra de MMLU-Pro.
- Seguimiento de instrucciones: 454 de 539 restricciones cumplidas en IFEval.
- Procesamiento de imágenes: el pipeline es image-text-to-text y el repositorio incluye un proyector de visión de 918 MB que se descarga y carga con `-hf` salvo que se use `--no-mmproj`.
- Modo de razonamiento conmutable: el modelo soporta thinking, que el autor recomienda desactivar explícitamente en las peticiones para reproducir los resultados publicados.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Asistente de chat local en GPU de consumo: con un pico de 5,7 GiB en modo texto, el modelo cabe en tarjetas de 8 GB y permite conversaciones multi-turno en local sin depender de la nube. Adecuado para prototipado y uso personal con datos sensibles.
- Automatización de llamadas a herramientas en agentes: el rendimiento declarado en BFCL live (85,7% de llamadas correctas) lo hace utilizable como planificador de tool calls en pipelines de automatización, por ejemplo para consultar APIs de clima, calendario o bases de datos internas.
- Integración en pipelines de CI/CD para tareas de código asistido: el soporte de function calling y la plantilla Jinja embebida permiten conectarlo a servidores compatibles con la API de OpenAI (`llama-server`) y usarlo como backend de asistentes de revisión o generación de parches.
- Resolución de problemas matemáticos de nivel escolar: con 95,2% en GSM8K, es adecuado para tutores automáticos o validación de ejercicios en plataformas educativas.
- Procesamiento de documentos con imágenes: gracias al proyector de visión incluido, puede extraer información de capturas, formularios escaneados o gráficos simples en flujos de digitalización.
- Despliegue en entornos con hardware restringido: la reducción de 15,9 GiB a 5,7 GiB permite ejecutar el modelo en estaciones de trabajo sin GPU dedicada de gama alta, usando llama.cpp en CPU o GPU integrada.
- Evaluación comparativa de cuantizaciones: útil como referencia para medir la degradación de un modelo de 9B al pasar de precisión completa a Q4_K_M en tareas de razonamiento e instrucciones.

## Benchmarks y rendimiento

Resultados declarados por el autor (TurinTech), con thinking desactivado y decodificación greedy en las pruebas de tool calling. No están verificados de forma independiente.

| Benchmark | Métrica | Resultado | Referencia del modelo original |
|---|---|---|---|
| BFCL live | Llamadas a herramienta correctas | 221 de 258 (85,7%) | 216 de 258 |
| GSM8K (últimas 250) | Respuestas correctas | 238 de 250 (95,2%) | No disponible |
| MMLU-Pro (muestra) | Respuestas correctas | 147 de 280 (52,5%) | No disponible |
| IFEval | Restricciones cumplidas | 454 de 539 (84,2%) | No disponible |

El autor solo publica el valor de referencia del modelo original para BFCL live. No se han publicado en la información disponible resultados de benchmarks adicionales ni comparaciones con otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada: 5,7 GiB de pico en inferencia de solo texto con un slot (`-np 1`), medido con el archivo Q4_K_M. El modelo original requiere 15,9 GiB.
- Tamaño en disco: 5,661 GB para el archivo Q4_K_M; 18,8 GB para el repositorio completo; 918 MB adicionales para el proyector de visión si se habilitan imágenes.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para el modo texto (RTX 3060, RTX 4060, RTX 3070, RTX 4070). Para uso multimodal hay que sumar la memoria del proyector. En A100 o H100 se puede aumentar el contexto y el número de slots.
- GPU de consumo: sí cabe en tarjetas de 8 GB o superiores en modo texto. En tarjetas de 6 GB el margen es muy ajustado.
- Opciones de despliegue: `llama-server` de llama.cpp (build b11617 o superior para los resultados declarados; b11889 para el proyector de visión), Ollama (`ollama run turintech/qwen3.5-9b-artemis`), LM Studio (`turintech/qwen3.5-9b-artemis`) y descarga directa con `hf download`.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo documenta el consumo de memoria y la configuración de despliegue.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Artemis-GGUF (este) | 8,95B | No disponible | Apache 2.0 | GGUF Q4_K_M | Cuantización con imatrix; 5,7 GiB de pico; BFCL live 221/258 |
| Qwen/Qwen3.5-9B (base) | 8,95B | No disponible | Apache 2.0 | Safetensors | Modelo original; 15,9 GiB de VRAM; BFCL live 216/258 según TurinTech |
| Alternativas de ~9B | No disponible | No disponible | No disponible | No disponible | No se han identificado modelos comparables en la información disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente; deben tratarse como orientativos.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo original. Aunque el autor reporta una mejora en BFCL live, no se documentan evaluaciones en otras tareas que permitan descartar degradación.
- El modo de razonamiento (thinking) debe desactivarse explícitamente (`enable_thinking: false` o `think: false` en Ollama) para reproducir los resultados publicados; dejarlo activado puede alterar el comportamiento en tool calling.
- La longitud de contexto del modelo base no está documentada en la información disponible; el ejemplo de despliegue usa 8.192 tokens, que puede ser insuficiente para casos de contexto largo.
- Los idiomas soportados no están documentados; no hay garantía de calidad fuera del inglés.
- Riesgo de alucinación inherente a los modelos de 9B, especialmente en MMLU-Pro, donde el autor reporta un 52,5% de aciertos en la muestra evaluada.
- Sesgos conocidos del modelo base: no documentados en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen; conviene revisar la licencia original enlazada por el autor.
- El soporte multimodal requiere descargar y cargar el proyector de visión (918 MB adicionales), lo que incrementa el consumo de memoria respecto a las cifras de solo texto.
- Requiere una versión de llama.cpp con soporte para Qwen3.5 (b11617 o superior según el autor); versiones anteriores pueden no cargar el modelo correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/turintech/Qwen3.5-9B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Ollama: https://ollama.com/turintech/qwen3.5-9b-artemis
- LM Studio: https://lmstudio.ai/turintech/qwen3.5-9b-artemis
- Web de TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
