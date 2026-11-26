# syed-waleed-ahmed/fastapi-assistant-gguf

## Resumen

FastAPI Assistant es un ajuste fino mediante LoRA del modelo Qwen2.5-Coder-1.5B-Instruct, desarrollado por syed-waleed-ahmed, especializado en responder preguntas sobre el framework web FastAPI. El modelo base es un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5B), y este repositorio distribuye el ajuste ya fusionado con los pesos base y cuantizado a un único fichero GGUF para su uso con llama.cpp.

El modelo resuelve un problema muy acotado: ofrecer respuestas breves y con ejemplos de código mínimos sobre la API de FastAPI, sin requerir GPU. Su relevancia radica en que demuestra un flujo completo de especialización de un modelo pequeño (fine-tuning con LoRA, fusión, cuantización y despliegue en CPU), con un conjunto de evaluación propio y una puerta de calidad automatizada antes de cada release.

La ventana de contexto es de 2.048 tokens, el modelo solo trabaja en inglés y está pensado para desarrolladores que puedan verificar las respuestas contra la documentación oficial. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino con LoRA fusionado |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (único fichero publicado) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (model-Q4_K_M.gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder-only con atención causal estándar, y le aplica un ajuste fino supervisado mediante LoRA con pérdida solo sobre los tokens de respuesta (completion-only loss). La configuración del adaptador es r=16, alpha=32, dropout=0,05, con módulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se realizó durante 3 épocas con learning rate 0,0002 y longitud máxima de secuencia de 512 tokens. Los datos son pares pregunta-respuesta curados sobre FastAPI, publicados en el directorio `data/` del repositorio fuente; el conjunto de evaluación retenido nunca se usó para entrenamiento ni para selección de checkpoint.

Tras el entrenamiento, el adaptador LoRA se fusionó con los pesos base, se convirtió a GGUF y se cuantizó a Q4_K_M. No se documenta el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el proceso descrito es exclusivamente supervisado. Como innovación operativa destaca la puerta de release: 108 preguntas retenidas con decodificación greedy, puntuadas por recall de palabras clave, validez del código Python generado y ROUGE-L frente a una respuesta de referencia, y una reevaluación del GGUF cuantizado con llama.cpp antes del despliegue.

## Capacidades

- Generación de texto y respuesta a preguntas técnicas sobre el framework FastAPI.
- Generación de código Python con ejemplos mínimos y ejecutables en las respuestas.
- Formato conversacional con plantilla de chat de Qwen2.5 (roles system, user y assistant).
- Respuestas concisas orientadas a preguntas de API: códigos de estado, dependencias, validación, routing y patrones similares.
- Capacidad declarada de indicar brevemente cuándo una pregunta queda fuera del ámbito de FastAPI.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento extendido.
- Multilingüe: no; solo inglés.

## Casos de uso

- Asistente de documentación interna: desplegado como endpoint compatible con OpenAI, responde dudas de FastAPI a los equipos de backend, con recuperación sobre la documentación oficial tal como ofrece el repositorio fuente.
- Autocompletado de ejemplos en el editor: integrado vía llama-cpp-python en una extensión o servidor local, sugiere fragmentos mínimos de código FastAPI (por ejemplo, cómo devolver un 201 desde un endpoint POST) sin salir de la máquina del desarrollador.
- Formación y onboarding: sirve como primer punto de consulta para perfiles junior que aprenden FastAPI, siempre con la advertencia de verificar las respuestas contra la documentación oficial.
- Bot de soporte en foros o canales de chat: con 2.048 tokens de contexto puede mantener conversaciones multi-turno breves sobre dudas concretas de la API, filtrando preguntas fuera de ámbito.
- Pruebas de concepto de especialización: sirve como referencia reproducible para equipos que quieran replicar el pipeline LoRA + fusión + GGUF con su propio dominio y su propia puerta de evaluación.
- Despliegue en entornos sin GPU: al ocupar aproximadamente 0,7 GB de RAM en Q4_K_M, puede ejecutarse en contenedores pequeños, CI o dispositivos de borde para responder consultas puntuales sobre FastAPI.
- Generación de borradores de tests o snippets en pipelines de revisión: puede proponer ejemplos de endpoints que un revisor humano valida antes de incorporarlos, nunca de forma automática.

## Benchmarks y rendimiento

Resultados de la puerta de evaluación del autor: 108 preguntas retenidas sobre FastAPI, decodificación greedy, puntuación automática y léxica (recall de palabras clave, validez del código Python y ROUGE-L frente a una referencia).

| Metrica | Este release | Modelo base |
|---|---|---|
| Puntuación compuesta | 0,672 | 0,558 |
| Recall de palabras clave | 0,711 | 0,622 |
| Validez del código | 0,856 | 0,721 |
| ROUGE-L | 0,455 | 0,345 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que estas métricas son automáticas y léxicas: premian nombrar las APIs correctas y que el código parsee, no la corrección real de la respuesta.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 0,7 GB para los pesos en Q4_K_M; suficiente con CPU.
- GPU recomendadas: no se especifican; cualquier GPU consumer con al menos 2 GB de VRAM puede alojarlo, aunque el caso de uso previsto es CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en equipos sin GPU dedicada.
- Opciones de despliegue: llama.cpp y llama-cpp-python (soporte nativo del GGUF); el repositorio fuente ofrece un servicio HTTP con streaming, recuperación sobre la documentación y endpoint compatible con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastAPI Assistant (este) | 1,5B | 2.048 | FastAPI, solo inglés | Apache 2.0 | GGUF en Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 (según ficha del modelo base) | Código general, multilingüe | Apache 2.0 | Pesos originales en Hugging Face |
| Modelos de código de 1-3B de otros fabricantes | 1-3B | variable | Código general | variable | no disponible en la información proporcionada |

Frente al modelo base, este ajuste gana en la puerta de evaluación propia (compuesto 0,672 frente a 0,558), pero pierde contexto (2.048 frente a la ventana mayor del base) y generalidad: solo responde sobre FastAPI y en inglés. Para tareas de código fuera de ese dominio, el modelo base es la opción adecuada. No se dispone de datos para comparar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Con 1,5B parámetros el modelo se equivoca a menudo, incluso en código que parsea correctamente: inventa parámetros y APIs y los afirma con seguridad. Toda respuesta debe contrastarse con la documentación de FastAPI.
- El código generado no es de confianza: revisarlo y ejecutarlo solo en un entorno aislado (sandbox).
- Solo admite inglés y solo cubre el dominio de FastAPI; las preguntas fuera de ámbito deben descartarse o tratarse con cautela.
- Ventana de contexto de 2.048 tokens, insuficiente para ficheros grandes o conversaciones largas.
- Los marcadores de rol de la plantilla (`<|im_end|>`, `<|im_start|>`, `<|user|>`, `<|system|>`, `<|assistant|>`) son texto plano para el modelo, no tokens especiales; si no emite el token de fin de secuencia, continúa con un turno inventado, por lo que hay que detener la generación en cualquiera de ellos.
- Las métricas publicadas son automáticas y léxicas; no miden corrección semántica ni seguridad del código.
- No se documentan sesgos específicos más allá de los heredados del modelo base y del corpus de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero al ser obra derivada de Qwen2.5-Coder-1.5B-Instruct se deben mantener los avisos de atribución correspondientes (véase NOTICE).
- Riesgo de alucinación elevado en APIs poco comunes o recientes de FastAPI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syed-waleed-ahmed/fastapi-assistant-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Demo en vivo: https://fastapi-assistant-edge.fastapi-assistant-edge.workers.dev
- Código fuente, pipeline de entrenamiento y servicio: https://github.com/syed-waleed-ahmed/Niche-Finetuned-Model
- Documentación: https://syed-waleed-ahmed.github.io/Niche-Finetuned-Model/
- Model card completa: https://github.com/syed-waleed-ahmed/Niche-Finetuned-Model/blob/main/MODEL_CARD.md
- Datos de entrenamiento: https://github.com/syed-waleed-ahmed/Niche-Finetuned-Model/tree/main/data
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- Documentación de FastAPI: https://fastapi.tiangolo.com/
