# VertexResearch/Vertex-0.6-100M-8192-Instruct-v2

## Resumen

Vertex 0.6 100M — 8192-ctx Instruct v2 es un modelo de lenguaje de 96,75 millones de parámetros desarrollado por Vertex Research, especializado en conversación multi-turno y tool calling. Forma parte de la familia Vertex 0.6, construida sobre una arquitectura transformer basada en Qwen3, y representa la versión instruct más capaz de su familia hasta la fecha. El modelo parte de una base con contexto extendido a 8192 tokens mediante un proceso de anexado de calidad (quality anneal) de 1B tokens, seguido de un ajuste fino supervisado (SFT) sobre aproximadamente 201K conversaciones ponderadas hacia diálogo multi-turno.

La relevancia de este modelo reside en su tamaño compacto (menos de 100M parámetros) combinado con una ventana de contexto de 8192 tokens, lo que lo hace ejecutable en hardware de consumo. Está diseñado para mantener conversaciones coherentes a lo largo de varios turnos, algo poco habitual en modelos de esta escala. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas, aunque el propio autor advierte que no es apto para producción debido a sus limitaciones en precisión factual y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 |
| Parametros totales | 96.752.192 (embeddings atados) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (RoPE theta 1M) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer densa derivada de Qwen3, con embeddings atados (tied embeddings) para reducir el numero de parametros. La base fue preentrenada desde cero sobre 10.01B tokens a contexto 1024, y posteriormente extendida a 8192 mediante una escalera RoPE de tres etapas (2048 con 350M tokens, 4096 con theta 250K y 300M tokens, y 8192 con theta 1M y 285M tokens) sobre datos frescos de Ultra-FineWeb. La version Instruct v2 parte de esta base de 8192 contexto, a la que se aplico un anexado de calidad de 1B tokens con datos de FineWeb-Edu y problemas aritmeticos sinteticos de nivel elemental.

El ajuste fino supervisado se realizo con TRL sobre aproximadamente 201K conversaciones, con una composicion ponderada: smol-smoltalk (~130K, multi-turno conciso), UltraChat 200k (~40K, multi-turno mas largo), everyday-conversations (duplicado para grounding basico), datos de function/tool-calling, QA/tutoria y autoidentidad. El entrenamiento duro 2 epocas con learning rate 3e-4 en decaimiento coseno, precision bf16 y longitud maxima de 2048 tokens, alcanzando una loss final de evaluacion de 1.404. El formato de chat es ChatML con tokens `<|im_start|>` y `<|im_end|>`, y el EOS incluye tanto `</s>` (id 2) como `<|im_end|>` (id 6).

## Capacidades

- Generacion de texto conversacional multi-turno: mantiene coherencia a lo largo de varios turnos de dialogo, una mejora significativa frente a la version Instruct anterior.
- Tool calling mecanico: emite bloques JSON `<tool_call>` con nombre y argumentos de funcion, y consume resultados en bloques `<tool_response>`, con definiciones de funciones en el system prompt.
- Formato ChatML completo: soporta roles de sistema, usuario y asistente mediante plantilla de chat estandar.
- Razonamiento basico y tutoria: entrenado con datos de QA y tutoria, puede responder preguntas educativas simples.
- Autoidentidad: conoce su nombre y proposito como modelo de Vertex Research.
- Limitacion de tool calling multi-paso: con una sola funcion disponible el formato es correcto y se detiene limpiamente, pero con multiples funciones puede elegir la herramienta equivocada y alucinar detalles al resumir respuestas de herramientas.

## Casos de uso

- Prototipado rapido de chatbots: por su tamano reducido, permite iterar rapidamente en el diseno de flujos conversacionales sin necesidad de infraestructura costosa, ideal para validar conceptos antes de escalar a modelos mayores.
- Educacion y tutoria basica: puede responder preguntas de nivel elemental y mantener dialogos de apoyo al estudio, aunque con supervision humana debido a sus errores aritmeticos y falta de profundidad.
- Experimentacion academica: util para investigacion en tecnicas de ajuste fino, evaluacion de modelos pequenos y estudio de comportamientos multi-turno en escalas reducidas.
- Desarrollo de agentes simples con una unica herramienta: su tool calling mecanico funciona de forma fiable cuando solo hay una funcion disponible, permitiendo construir asistentes que consultan una API o base de datos concreta.
- Generacion de datos sinteticos de conversacion: puede emplearse para crear datasets de entrenamiento de dialogos multi-turno, aprovechando su formato ChatML estandar.
- Despliegue en entornos con recursos limitados: con solo 0.4 GB de tamano, cabe en dispositivos edge, Raspberry Pi de gama alta o CPUs sin GPU, habilitando asistentes locales offline en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica en la model card que la precision factual es baja, el razonamiento es superficial y comete errores aritmeticos, pero no proporciona metricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0.4 GB en precision bf16, lo que permite inferencia en practicamente cualquier GPU moderna con mas de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3050 o incluso iGPUs con suficiente memoria compartida.
- CPU: ejecutable en CPU unicamente con latencias aceptables para un modelo de 100M parametros, usando cuantizacion dinamica o simplemente bf16.
- Opciones de despliegue: compatible con transformers de HuggingFace, vLLM, llama.cpp, Ollama y text-generation-inference (TGI), segun las etiquetas del repositorio.
- Latencia: no disponible, pero por su tamano se espera una generacion de decenas de tokens por segundo incluso en CPU modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tool calling | Notas |
|---|---|---|---|---|---|
| Vertex-0.6-100M-8192-Instruct-v2 | 96.75M | 8192 | Apache 2.0 | Si (basico) | Enfoque multi-turno, contexto largo |
| Qwen2.5-0.5B-Instruct | 494M | 32768 | Apache 2.0 | Si | 5 veces mas parametros, contexto 4 veces mayor |
| SmolLM2-135M-Instruct | 135M | 2048 | Apache 2.0 | No | Tamano similar, contexto mucho menor |

La comparativa se basa en caracteristicas generales conocidas de estos modelos; no se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Precision factual baja: el modelo comete errores de hecho con frecuencia y su conocimiento se detiene aproximadamente en abril de 2024.
- Razonamiento superficial: no es capaz de resolver problemas complejos ni de mantener cadenas de razonamiento largas.
- Errores aritmeticos: falla en calculos matematicos incluso a nivel elemental, a pesar del entrenamiento con problemas sinteticos.
- Tool calling no fiable con multiples funciones: puede seleccionar la herramienta incorrecta y alucinar detalles al resumir respuestas de herramientas; no debe usarse en bucles de agente sin supervisio.
- Generacion incoherente en textos largos: el propio autor advierte de divagaciones, repeticiones y respuestas inconsistentes en generaciones extendidas.
- Solo ingles: no soporta otros idiomas, lo que limita su uso en entornos multilingues.
- No apto para produccion: la model card lo indica explicitamente; es un modelo de investigacion y experimentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct-v2
- Modelo base: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-ctx-Base
- Version Instruct anterior: https://huggingface.co/VertexResearch/Vertex-0.6-100M-8192-Instruct
- Ficha en LLM Explorer: https://llm-explorer.com/model/VertexResearch%2FVertex-0.6-100M-8192-Instruct,4ADuXMqQY5cB5iZzjPqBPu
- Despliegue en FriendliAI: https://friendli.ai/models/VertexResearch/Vertex-0.6-100M-8192-ctx-Base
