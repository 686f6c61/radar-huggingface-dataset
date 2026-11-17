# zyr-AGENT/ZY-S2

## Resumen

ZY-S2 es un modelo de lenguaje de 1.500 millones de parametros desarrollado por ZYR AI, especializado en generacion de codigo Python. Se trata de un ajuste fino mediante LoRA sobre Qwen2.5-Coder-1.5B, el modelo base de Alibaba, y se distribuye con licencia Apache 2.0 tanto en formato safetensors (pesos fusionados completos) como en GGUF cuantizado Q5_K_M de aproximadamente 1,1 GB. Su propuesta principal es ofrecer un modelo pequeno capaz de ejecutarse en la CPU de un portatil mediante llama.cpp, manteniendo un rendimiento competitivo en tareas de generacion de codigo frente a modelos del mismo tamano.

El modelo emplea una arquitectura transformer decoder-only heredada de Qwen2, con 1.543.714.304 parametros reales segun los pesos safetensors. No se dispone de informacion sobre la longitud de contexto en la model card, aunque los ejemplos de despliegue con llama.cpp utilizan una ventana de 8192 tokens (`-c 8192`). El ajuste LoRA se ha orientado especificamente a la escritura de codigo Python correcto, y el modelo ha sido entrenado con un formato que incluye un bloque vacio `<think></think>` antes de la respuesta, herencia de su pipeline de entrenamiento.

La relevancia de ZY-S2 radica en su perfil de rendimiento: en la comparativa interna del autor, supera a Qwen2.5-Coder-1.5B-Instruct en HumanEval+ (74,2 frente a 63,2) y en la puntuacion global de coding del benchmark SLMFrontier (68,0 frente a 63,5), aunque queda por detras en herramientas, contexto largo, seguridad y conocimiento general. Es, por tanto, un modelo de nicho para generacion de funciones Python en entornos con recursos muy limitados, no un sustituto generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ejemplos de despliegue usan 8192 tokens) |
| Tipos de cuantizacion | GGUF Q5_K_M (publicada); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados) y GGUF (Q5_K_M) |

## Arquitectura y entrenamiento

ZY-S2 es un ajuste fino mediante LoRA sobre Qwen/Qwen2.5-Coder-1.5B, un transformer decoder-only de la familia Qwen2 con 1.500 millones de parametros. Los pesos LoRA se han fusionado con el modelo base para producir un checkpoint completo en safetensors, que es el que se distribuye junto con la version GGUF. No se especifica en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos figuran como no disponibles.

La innovacion tecnica destacable es el formato de entrenamiento: el modelo espera un bloque vacio `<think></think>` antes de la respuesta de codigo, lo que el autor incorpora en el harness de evaluacion para que la comparacion sea justa. El modelo base Qwen2.5-Coder-1.5B aporta las capacidades subyacentes de generacion de codigo y el tokenizador; el ajuste LoRA se orienta a mejorar la correccion del codigo Python generado. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia mas alla del soporte estandar de llama.cpp.

## Capacidades

- Generacion de codigo Python: funcion principal del modelo, con enfasis en funciones cortas y autocontenidas evaluadas mediante HumanEval y HumanEval+.
- Generacion de texto conversacional: el modelo conserva la plantilla de chat de Qwen2.5-Coder y responde a instrucciones en formato multi-turno.
- Razonamiento basico: capacidad limitada; en el benchmark SLMFrontier de razonamiento obtiene 24,25 sobre 400 items, ligeramente por encima de Qwen2.5-Coder-1.5B (22,5) pero muy lejos de modelos mayores.
- Matematicas: capacidad debil; 27,61 en el area de math de SLMFrontier (MATH-500, GSM8K, AIME24/25), por debajo de Qwen2.5-Coder-1.5B (38,0).
- Tool calling: soporte limitado; 40,5 en BFCL v3 frente a 72,8 del modelo base. No es un modelo recomendado para function calling en produccion.
- Agentes y razonamiento multi-paso: capacidad muy limitada; 4,5 en tareas agenticas multi-turno con herramientas Python (200 tareas).
- Capacidades multilingues: no documentadas en la model card; los idiomas soportados figuran como no disponibles.
- Capacidad especial: modo de formato `<think></think>` vacio antes de la respuesta, requerido para reproducir los resultados del harness del autor.

## Casos de uso

- Generacion de funciones Python en local: el modelo puede ejecutarse en la CPU de un portatil con llama.cpp y el GGUF Q5_K_M de 1,1 GB, lo que permite autocompletar o generar funciones cortas sin GPU ni conexion a servicios externos. Es adecuado por su bajo requisito de hardware y su rendimiento en HumanEval+ (74,2).
- Asistente de codigo en editores con recursos limitados: integrado mediante la API compatible con OpenAI de llama-server, puede servir como backend de autocompletado o generacion de snippets en entornos de desarrollo sin GPU dedicada.
- Generacion de tests unitarios para funciones Python: el modelo puede producir casos de prueba a partir de una firma de funcion o un docstring, aprovechando su entrenamiento en codigo Python y su contexto de hasta 8192 tokens en los ejemplos de despliegue.
- Prototipado rapido de scripts de automatizacion: para tareas de scripting de corta duracion (procesamiento de ficheros, parsing, transformaciones de datos) el modelo genera codigo funcional que el desarrollador revisa antes de ejecutar.
- Educacion y aprendizaje de Python: el modelo puede explicar y generar ejemplos de codigo para estudiantes, con la advertencia de que puede producir codigo inseguro (65% de tasa de codigo inseguro en las pruebas del autor) y requiere revision.
- Evaluacion comparativa de modelos pequenos: util como referencia en experimentos de benchmarking de modelos de 1,5B en codigo, dado que el autor publica el harness y los resultados por item en el repositorio.
- Despliegue en entornos air-gapped: al distribuirse como GGUF y safetensors con licencia Apache 2.0, puede desplegarse en sistemas sin acceso a red para generacion de codigo interna, siempre con revision humana del output.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La primera tabla compara los tres modelos ejecutados como GGUF Q5_K_M en CPU con llama.cpp y el mismo harness:

| Benchmark | ZY-S2 (Q5_K_M) | Qwen2.5-Coder-0.5B-Instruct (Q5_K_M) | Qwen2.5-Coder-1.5B-Instruct (Q5_K_M) |
|---|---|---|---|
| HumanEval pass@1 (164) | 75,6 | 54,3 | 68,9 |
| HumanEval+ pass@1 (164) | 68,9 | 50,0 | 65,2 |
| SLMFrontier coding (primeros 20 items) | 95,0 | 80,0 | 90,0 |
| SLMFrontier math (primeros 20 items) | 35,0 | 25,0 | 40,0 |
| SLMFrontier reasoning (primeros 20 items) | 20,0 | 25,0 | 5,0 |
| SLMFrontier instruction (primeros 20 items) | 42,1 | 37,5 | 48,8 |
| SLMFrontier tools (primeros 20 items) | 50,0 | 35,0 | 95,0 |
| Computer-use sim, 60 tareas, exito end-to-end % | 13,3 | 6,7 | 20,0 |
| Security review recall % (10 fallos plantados) | 70,0 | 80,0 | 90,0 |
| Tasa de codigo inseguro % (20 prompts, menor=mejor) | 65,0 | 45,0 | 70,0 |
| Rechazo de peticiones maliciosas % | 86,7 | 66,7 | 93,3 |
| Ayuda con peticiones de seguridad legitimas % | 100,0 | 100,0 | 100,0 |

Resultados del conjunto completo de SLMFrontier (9 areas). ZY-S2 ejecutado en Q5_K_M sobre CPU con llama.cpp; Qwen2.5-Coder-1.5B en Q4_0 sobre GPU 2x T4:

| Area (conjunto completo) | n | ZY-S2 | Qwen2.5-Coder-1.5B |
|---|---|---|---|
| SLMFrontier Score | | 37,87 (IC 95%: 36,58-39,25) | 46,34 |
| coding (HumanEval+ / MBPP+) | 400 | 68,0 | 61,5 |
| math (MATH-500, GSM8K, AIME24/25) | 460 | 27,61 | 38,0 |
| reasoning (BBH, 10 subtareas dificiles) | 400 | 24,25 | 22,5 |
| instruction (IFEval) | 400 | 36,38 | 40,8 |
| tools (BFCL v3) | 400 | 40,5 | 72,8 |
| long context (NIAH + var tracking, 4k-16k) | 300 | 81,0 | 96,3 |
| agentic (tareas Python multi-turno con herramientas) | 200 | 4,5 | 0,0 |
| knowledge (MMLU-Pro ajustado por azar, SimpleQA) | 500 | 8,2 | 6,8 |
| safety (XSTest balanced refusal) | 450 | 50,4 | 78,3 |

Comparativa de coding con el mismo harness para todos los modelos (CPU llama.cpp, todos Q5_K_M):

| Modelo | Coding (400) | HumanEval+ (163) | MBPP+ (237) | IC 95% |
|---|---|---|---|---|
| ZY-S2 | 68,0 | 74,2 | 63,7 | 63,5-72,8 |
| Qwen2.5-Coder-1.5B-Instruct | 63,5 | 63,2 | 63,7 | 58,8-68,2 |
| Qwen2.5-Coder-0.5B-Instruct | 47,0 | 52,1 | 43,5 | 42,2-52,0 |
| Llama-3.2-1B-Instruct | 38,0 | 27,0 | 45,6 | 33,2-42,8 |

El autor advierte que los rangos de confianza de ZY-S2 y Qwen2.5-Coder-1.5B se solapan ligeramente y que las filas de 20 items son muestras pequenas y ruidosas (±10 puntos o mas).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para el GGUF Q5_K_M; el safetensors completo requiere alrededor de 3,1 GB en fp16 (1.543.714.304 parametros x 2 bytes) mas overhead.
- GPU recomendadas: no se especifican en la model card; por tamano, cualquier GPU consumer con al menos 2-4 GB de VRAM puede alojar el modelo cuantizado. El autor lo posiciona para ejecucion en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.) con el GGUF Q5_K_M, y tambien en CPU de portatil.
- Opciones de despliegue: llama.cpp (`llama-server`), con API compatible con OpenAI en `/v1/chat/completions`; Transformers con los pesos safetensors; el tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se documenta configuracion especifica.
- Latencia y throughput estimados: no disponibles. El autor solo indica que funciona en CPU de portatil con llama.cpp, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Coding SLMFrontier (400) | HumanEval+ (163) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ZY-S2 | 1,5B | no disponible (ejemplos a 8192) | 68,0 | 74,2 | Apache 2.0 | Hugging Face (safetensors + GGUF) |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | no disponible en esta ficha | 63,5 | 63,2 | Apache 2.0 | Hugging Face |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | no disponible en esta ficha | 47,0 | 52,1 | Apache 2.0 | Hugging Face |
| Llama-3.2-1B-Instruct | 1,2B | no disponible en esta ficha | 38,0 | 27,0 | Llama 3.2 Community License | Hugging Face |

ZY-S2 lidera en coding y HumanEval+ frente a los modelos comparados en el mismo harness, pero queda por detras de Qwen2.5-Coder-1.5B-Instruct en la puntuacion global de SLMFrontier (37,87 frente a 46,34), en herramientas (40,5 frente a 72,8), contexto largo (81,0 frente a 96,3) y seguridad (50,4 frente a 78,3).

## Limitaciones y advertencias

- Debil en matematicas, razonamiento multi-paso y tareas de agente o computer-use en comparacion con su habilidad de coding; el propio autor lo senala en la model card.
- Puede generar codigo inseguro: tasa de codigo inseguro del 65% en 20 prompts, superior a Qwen2.5-Coder-0.5B (45%) y ligeramente inferior a Qwen2.5-Coder-1.5B (70%). Es imprescindible revisar el codigo generado antes de ejecutarlo.
- Seguridad conversacional baja: puntuacion de 50,4 en XSTest balanced refusal, porque responde a casi cualquier peticion y rara vez rechaza solicitudes inseguras. No apto para despliegues sin filtros de contenido.
- Rendimiento limitado en tool calling (40,5 en BFCL v3) y en tareas agenticas (4,5 sobre 200 tareas), por lo que no es adecuado para pipelines de agentes.
- Conocimiento general practicamente a nivel de azar: 8,2 en MMLU-Pro ajustado por azar y SimpleQA; no usar como modelo de conocimiento.
- Los benchmarks son del propio autor, con muestras pequenas en varias filas (20 items) y configuraciones distintas entre modelos (ZY-S2 en Q5_K_M sobre CPU, Qwen en Q4_0 sobre GPU), por lo que la comparacion no es exacta.
- HumanEval es una prueba estrecha de funciones Python cortas y no mide habilidad general de programacion.
- Idiomas soportados no documentados; no hay garantia de calidad fuera del ingles y del codigo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun asi, conviene verificar los terminos del modelo base.
- El formato `<think></think>` vacio debe respetarse para reproducir los resultados del harness; otras plantillas de prompt pueden degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zyr-AGENT/ZY-S2
- Web de ZYR AI: https://zyr3.vercel.app
- Benchmark SLMFrontier: https://slmfrontier.vercel.app
- Modelo base Qwen2.5-Coder-1.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Resultados por item del benchmark: carpeta `benchmarks/` del repositorio (`benchmarks/slmfrontier-c67/`, `benchmarks/coding_compare/`)
