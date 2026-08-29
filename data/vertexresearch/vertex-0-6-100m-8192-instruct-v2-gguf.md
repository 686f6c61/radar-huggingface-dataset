# VertexResearch/Vertex-0.6-100M-8192-Instruct-v2-GGUF

## Resumen

Vertex-0.6-100M-8192-Instruct-v2 es un modelo de lenguaje pequeño (96,75 millones de parámetros) desarrollado por VertexResearch, basado en la arquitectura Qwen3 y orientado a tareas de chat e instrucción. Se distribuye en formato GGUF para su uso con llama.cpp, lo que permite ejecutarlo en entornos muy ligeros, incluso en CPU. Su principal atractivo es combinar una ventana de contexto de 8192 tokens con soporte de tool calling en un paquete de menos de 100M de parámetros, algo poco habitual en modelos tan compactos.

El modelo es la versión instruct de la familia Vertex 0.6, cuyo checkpoint base se preentrenó desde cero sobre 10.010 millones de tokens y se extendió a 8192 tokens de contexto mediante una escalera de RoPE en tres etapas. La versión instruct añade formato ChatML y sintaxis de tool calling, aunque el propio autor advierte de limitaciones importantes en coherencia, precisión factual y fiabilidad del uso de herramientas. No está pensado para producción, sino para experimentación, prototipado y entornos con recursos muy limitados.

La relevancia actual de este modelo radica en su tamaño extremadamente reducido y su capacidad de ejecutarse en hardware básico, lo que lo convierte en un candidato interesante para pruebas educativas, demos de tool calling y aplicaciones embebidas donde la calidad de generación no sea crítica. Su licencia Apache 2.0 facilita su uso y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 |
| Parametros totales | 96.752.192 (embeddings atados) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (RoPE theta 1M) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversion del checkpoint safetensors original) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer densa basada en Qwen3, con embeddings atados (tied embeddings) y una ventana de contexto de 8192 tokens mediante RoPE con theta 1M. El checkpoint base de la familia Vertex 0.6 se preentreno desde cero sobre 10.010 millones de tokens a contexto 1024, y posteriormente se extendio a 8192 mediante una escalera de RoPE en tres etapas: 2048 con 350M tokens, 4096 con theta 250K y 300M tokens, y finalmente 8192 con theta 1M y 285M tokens, todo sobre el dataset Ultra-FineWeb.

La version instruct (este modelo) anade el formato de chat ChatML y soporte de tool calling mediante bloques JSON `<tool_call>`, con definiciones de funciones en el prompt de sistema. No se han publicado detalles sobre el metodo de ajuste instructivo (por ejemplo, si se uso SFT, RLHF o DPO), ni sobre la composicion exacta de los datos de entrenamiento de esta fase. El conocimiento del modelo se corta aproximadamente en abril de 2024.

## Capacidades

- Generacion de texto y chat multi-turno en ingles, con formato ChatML (`<|im_start|>` / `<|im_end|>`).
- Soporte de tool calling mecanico: puede emitir bloques JSON `<tool_call>` y detenerse limpiamente cuando hay una sola funcion disponible.
- Razonamiento basico y respuestas a instrucciones simples, aunque con limitaciones en tareas complejas.
- Ventana de contexto de 8192 tokens, suficiente para dialogos medianos o documentos cortos.
- Capacidad de ejecucion en CPU y en hardware muy modesto gracias a su tamano reducido.
- No soporta vision, audio ni otros modos multimodales.

## Casos de uso

- Experimentacion educativa: ideal para estudiantes que quieran entender el funcionamiento interno de un transformer generativo sin necesidad de GPUs potentes. Se puede cargar en un portatil y analizar sus respuestas, activaciones o limitaciones.
- Prototipado rapido de chatbots: permite validar flujos de conversacion y formatos de prompt antes de migrar a modelos mayores. Su rapida inferencia en CPU facilita iteraciones frecuentes.
- Pruebas de tool calling en entornos controlados: al soportar sintaxis `<tool_call>` con una sola funcion, sirve para depurar pipelines de integracion de herramientas sin coste computacional.
- Generacion de texto corto y clasificacion ligera: puede completar frases, generar titulos o resumir parrafos breves en aplicaciones donde la calidad no sea critica.
- Demos y talleres de IA generativa: su tamano permite distribuirlo y ejecutarlo en aulas o conferencias sin infraestructura especializada.
- Evaluacion de cuantizaciones: al disponer de multiples ficheros GGUF (Q2_K a BF16), es util para estudiar el impacto de la cuantizacion en la calidad de salida de un modelo pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como MMLU, HumanEval o GSM8K para este modelo, y no se han encontrado evaluaciones independientes en la busqueda web. Por tanto, no es posible comparar su rendimiento cuantitativo con otros modelos.

## Requisitos de hardware

- VRAM estimada: en BF16, el checkpoint ocupa aproximadamente 194 MB (96,75M parametros × 2 bytes); en cuantizacion Q4_K_M, alrededor de 50 MB. Estas cifras son estimaciones teoricas basadas en el tamano de parametros.
- GPU recomendadas: cualquier GPU con al menos 512 MB de VRAM es suficiente. Modelos como GTX 1050, RTX 2060 o integradas modernas pueden ejecutarlo sin problemas. Tambien funciona en CPU pura con llama.cpp.
- Compatibilidad con hardware de consumo: si, cabe en cualquier ordenador personal, incluidos Raspberry Pi 4/5 y sistemas embebidos con suficiente RAM.
- Opciones de despliegue: llama.cpp (llama-server, llama-completion), Ollama (si se importa el GGUF), o cualquier runtime compatible con GGUF como llama-cpp-python.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamano, se espera una generacion de decenas de tokens por segundo en CPU moderna y cientos en GPU, pero estos valores son orientativos y dependen del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Tool calling |
|---|---|---|---|---|---|
| Vertex-0.6-100M-8192-Instruct-v2 | 96,75M | 8192 | Apache 2.0 | GGUF | Si (limitado) |
| SmolLM2-135M | 135M | 2048 (ampliable a 8192) | Apache 2.0 | Safetensors, GGUF | No |
| Qwen2.5-0.5B | 500M | 32768 | Apache 2.0 | Safetensors, GGUF | Si |

No se dispone de benchmarks comparativos publicados para estos modelos, por lo que la comparacion se limita a caracteristicas tecnicas. Vertex destaca por su menor tamano y contexto largo, mientras que SmolLM2 y Qwen2.5 ofrecen mayor capacidad de parametros y, previsiblemente, mejor calidad de generacion, aunque a costa de mayores requisitos de hardware.

## Limitaciones y advertencias

- El propio autor indica que el modelo "no es el mas coherente" y que puede producir divagaciones, repeticiones y respuestas inconsistentes, especialmente en generaciones largas.
- La precision factual es baja: comete errores aritmeticos y su razonamiento es superficial. No es fiable para tareas que requieran exactitud.
- El tool calling solo es fiable con una unica funcion disponible. Con multiples funciones, puede seleccionar la herramienta incorrecta y alucinar detalles al resumir respuestas de la herramienta.
- No debe usarse en bucles de agente no supervisados ni en produccion, segun la advertencia del autor.
- Solo soporta ingles; no hay capacidades multilingue.
- El conocimiento se corta en abril de 2024, por lo que no esta al dia de eventos posteriores.
- Aunque la licencia Apache 2.0 permite uso comercial, las limitaciones de calidad hacen desaconsejable su uso en aplicaciones comerciales reales.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct-v2-GGUF
- Modelo base safetensors (instruct): https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct-v2
- Modelo base (preentrenamiento): https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-ctx-Base
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/VertexResearch%2FVertex-0.6-100M-8192-ctx-Base,caZMQbuWnXqBPsYbebGLG
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
