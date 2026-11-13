# syed-waleed-ahmed/fastapi-assistant-lora

## Resumen

FastAPI Assistant es un adaptador LoRA entrenado sobre el modelo base TinyLlama/TinyLlama-1.1B-Chat-v1.0, desarrollado por el usuario de Hugging Face syed-waleed-ahmed. Su proposito es responder preguntas sobre el framework web FastAPI, un framework de Python para construir APIs, y generar codigo de ejemplo en ese contexto. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion (parametros de bajo rango) que deben combinarse con el modelo base para funcionar.

El adaptador se entreno con perdida de tipo completion-only sobre un conjunto curado de pares pregunta-respuesta, con configuracion LoRA de rango 16, alpha 32 y dropout 0.05, aplicada a las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj). El modelo base TinyLlama es un transformer decoder-only de aproximadamente 1.100 millones de parametros con contexto de 2.048 tokens, lo que limita tanto la longitud de las respuestas como la cantidad de contexto que el adaptador puede procesar.

El interes de esta ficha es acotado: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, publicado en noviembre de 2026, y sin model card extensa. Es relevante como ejemplo de fine-tuning ligero (PEFT) para una tarea concreta y como caso de estudio de las limitaciones de adaptar un modelo pequeno a un dominio tecnico especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (TinyLlama-1.1B-Chat-v1.0) |
| Parametros totales | No disponible (el adaptador LoRA; el modelo base tiene ~1.100 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base TinyLlama soporta 2.048 tokens |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; cuantizacion posible via el modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA (Low-Rank Adaptation) sobre el modelo base TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de tipo Llama con aproximadamente 1.100 millones de parametros. Los hiperparametros declarados son r=16, alpha=32, dropout=0.05, con modulos objetivo q_proj, k_proj, v_proj y o_proj, es decir, las cuatro proyecciones lineales de la atencion multi-cabeza. El entrenamiento se realizo durante 3 epocas con tasa de aprendizaje 0.0002 y longitud maxima de secuencia de 512 tokens.

La perdida se calcula solo sobre la completion (completion-only loss), de modo que el modelo aprende a generar la respuesta y no a reproducir la pregunta. El conjunto de datos es un "curated Q&A set" sobre FastAPI, aunque la model card no especifica el numero de ejemplos de entrenamiento ni su procedencia. No se documenta el uso de RLHF, DPO ni ninguna tecnica de alineacion adicional. La innovacion tecnica es minima: se trata de un fine-tuning supervisado estandar con PEFT, sin decodificacion especulativa ni mecanismos de atencion alternativos.

## Capacidades

- Generacion de texto tecnico en el dominio de FastAPI: respuestas a preguntas sobre routing, dependencias, validacion con Pydantic, middlewares y otros conceptos del framework.
- Generacion de codigo Python en el contexto de FastAPI, con una tasa de validez sintactica declarada de 0.8365 (code_valid) sobre el conjunto de evaluacion.
- Respuesta a preguntas de formato pregunta-respuesta de una sola vuelta, segun el diseno del entrenamiento (completion-only).
- Capacidades heredadas del modelo base TinyLlama-1.1B-Chat: generacion de texto general, conversacion basica y cierto conocimiento de codigo, aunque el adaptador no fue entrenado para reforzarlas.
- Soporte de tool calling / function calling: no documentado; no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el contexto de 512 tokens usado en entrenamiento y el tamano del modelo base lo hacen poco adecuado.
- Capacidades multilingues: no disponibles; la model card no declara idiomas y el dataset de entrenamiento parece orientado a ingles tecnico.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de documentacion interna para equipos que trabajan con FastAPI: el adaptador puede responder dudas frecuentes sobre el framework en un chatbot ligero, siempre que las respuestas se validen contra la documentacion oficial. Su tamano reducido permite desplegarlo en hardware modesto.
- Autocompletado de ejemplos de codigo en editores o notebooks: dado que el 83,65 % de las muestras generadas en evaluacion resultaron codigo valido, puede emplearse como sugeridor de fragmentos de endpoints, modelos Pydantic o dependencias, con revision humana obligatoria.
- Generacion de tests preliminares para endpoints FastAPI: el modelo puede proponer esqueletos de tests con TestClient, que el desarrollador completara y ejecutara. Es adecuado por su conocimiento del dominio, pero no por su fiabilidad.
- Prototipado rapido de APIs: como asistente en un flujo de pair programming para escribir boilerplate (definicion de routers, esquemas de respuesta, manejo de errores HTTP), reduciendo el tiempo de escritura inicial.
- Formacion y onboarding de desarrolladores junior: puede usarse como tutor de preguntas cerradas sobre FastAPI, con la advertencia de que sus respuestas pueden contener errores y deben contrastarse.
- Filtro o clasificador de consultas tecnicas en un sistema mayor: combinado con un modelo mas grande, el adaptador podria preprocesar o reformular preguntas sobre FastAPI antes de pasarlas a un modelo de mayor capacidad, aprovechando su bajo coste de inferencia.
- Experimentacion academica con PEFT: sirve como caso reproducible de fine-tuning LoRA sobre un modelo de 1.1B para una tarea de dominio, util para comparar hiperparametros y metricas de evaluacion.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la evaluacion del autor sobre un conjunto held-out de 108 elementos, con decodificacion greedy:

| Metrica | Valor |
|---|---|
| Items evaluados | 108 |
| Score global | 0.538 |
| Keyword recall | 0.4105 |
| Code valid | 0.8365 |
| ROUGE-L | 0.3851 |
| Latencia p50 | 9.832 s |
| Latencia p95 | 14.198 s |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ni comparaciones con otros adaptadores o modelos. Las latencias indicadas (casi 10 segundos de mediana) corresponden presumiblemente a inferencia sin optimizar y son elevadas para un modelo de 1.1B, lo que sugiere un entorno de ejecucion poco eficiente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base TinyLlama-1.1B en FP16 requiere aproximadamente 2,2 GB de VRAM; en cuantizacion de 8 bits, alrededor de 1,1 GB; en 4 bits, en torno a 0,7 GB. El adaptador LoRA anade una cantidad marginal de memoria.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente en FP16; una RTX 3060, RTX 4060 o superior es mas que adecuada. Para despliegues en servidor, una T4 o L4 resulta holgada; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1660 6 GB, RTX 3050 8 GB, RTX 4090, etc.), e incluso en CPU con llama.cpp u Ollama, aunque con mayor latencia.
- Opciones de despliegue: el adaptador puede cargarse con la libreria peft sobre el modelo base en PyTorch, y fusionarse con el modelo para exportarlo a GGUF y usarlo con llama.cpp u Ollama. vLLM y TGI soportan LoRA, aunque la integracion de este adaptador concreto no esta documentada.
- Latencia y throughput estimados: la model card reporta p50 de 9,832 s y p95 de 14,198 s para las 108 muestras evaluadas; no se especifica el hardware. Con una GPU consumer y decodificacion optimizada, la latencia por respuesta deberia ser notablemente inferior, pero no hay datos publicados que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastAPI Assistant (este adaptador) | ~1,1B (base) + LoRA | 2.048 tokens (base) | Fine-tuning LoRA para FastAPI | Apache 2.0 | Hugging Face, 0 descargas |
| TinyLlama-1.1B-Chat-v1.0 | ~1,1B | 2.048 tokens | Chat general | Apache 2.0 | Ampliamente disponible |
| Adaptadores LoRA para codigo sobre modelos de 1-3B (genericos) | 1-3B | Variable | Fine-tuning de codigo | Variable | Multiples en Hugging Face |
| Modelos de codigo especializados de mayor tamano (p. ej., series de 7B) | 7B+ | 4K-32K | Codigo general | Variable | Ampliamente disponibles |

No se dispone de datos de rendimiento comparables entre este adaptador y alternativas, por lo que la comparativa se limita a parametros, contexto y licencia. Frente al modelo base, el adaptador deberia mejorar en preguntas de FastAPI a costa de posible degradacion en capacidades generales, pero no hay evaluacion que lo cuantifique.

## Limitaciones y advertencias

- El modelo base es pequeno (1.1B) y el adaptador se entreno con solo 512 tokens de longitud maxima; las respuestas largas o el contexto extenso quedan fuera de su alcance.
- La model card advierte explicitamente de que el modelo puede equivocarse y de que el codigo generado debe verificarse; la tasa de codigo valido es del 83,65 %, lo que implica que aproximadamente 1 de cada 6 generaciones no es codigo valido.
- El score global de 0,538 y el keyword recall de 0,4105 indican una calidad moderada-baja en la tarea objetivo; no es un modelo para produccion sin supervision.
- No se documentan sesgos conocidos, pero al derivar de TinyLlama hereda los sesgos de sus datos de preentrenamiento, no auditados en esta ficha.
- Riesgo de alucinacion elevado en un modelo de este tamano, especialmente en APIs, nombres de funciones y parametros de FastAPI que pueden no existir o haber cambiado de version.
- Idiomas no declarados; el entrenamiento parece orientado a ingles, por lo que el rendimiento en castellano no esta garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador es trabajo derivado de TinyLlama y debe conservarse el aviso de atribucion (NOTICE) y la licencia del modelo base.
- Sin descargas ni validacion comunitaria: no hay evidencia independiente de su calidad ni mantenimiento.
- Las latencias reportadas (p50 cercano a 10 s) son altas y sugieren que el autor no optimizo la inferencia; en produccion requeriria ajustes de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syed-waleed-ahmed/fastapi-assistant-lora
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de FastAPI: https://fastapi.tiangolo.com/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
