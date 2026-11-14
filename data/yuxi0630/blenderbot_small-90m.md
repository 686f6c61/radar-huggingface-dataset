# Yuxi0630/blenderbot_small-90M

## Resumen

BlenderBot Small 90M es un modelo conversacional de dominio abierto desarrollado por Facebook AI Research (Meta AI) y publicado originalmente en el paper "Recipes for building an open-domain chatbot" (arXiv:1907.06616). Se trata de la variante mas pequena de la familia BlenderBot, que incluye versiones de 90M, 2.7B y 9.4B parametros. El modelo esta disenado especificamente para mantener conversaciones multi-turno naturales, combinando habilidades como hacer preguntas, responder, mostrar empatia y aportar personalidad.

La relevancia de este modelo radica en su enfoque metodologico: el paper demuestra que no solo el escalado de parametros importa, sino tambien la calidad de los datos de entrenamiento (Blended Skill Talk) y la estrategia de generacion. El repositorio corresponde a una subida de un tercero (Yuxi0630) que replica los pesos del modelo original, con licencia Apache 2.0 y soporte para PyTorch, TensorFlow y JAX.

Al ser un modelo de 90M parametros, es adecuado para entornos con recursos limitados, prototipado rapido y experimentacion con tecnicas de dialogo, aunque su capacidad de razonamiento y conocimiento factual es limitada en comparacion con modelos contemporaneos de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) |
| Parametros totales | 90M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch, TensorFlow, JAX (safetensors no confirmado) |

## Arquitectura y entrenamiento

BlenderBot Small sigue una arquitectura transformer encoder-decoder orientada a generacion de dialogo. El modelo fue entrenado sobre el dataset Blended Skill Talk, que combina datos de tres fuentes: PersonaChat (para dotar de personalidad), Wizard of Wikipedia (para conocimiento) y EmpatheticDialogues (para empatia). El paper original describe un proceso de entrenamiento con ajuste fino sobre estos datos y una estrategia de generacion que incluye decodificacion con control de longitud y muestreo.

La innovacion principal del trabajo no reside en la arquitectura, sino en la receta de entrenamiento: la combinacion de habilidades conversacionales (mezcla de estilos) y la seleccion cuidadosa de la estrategia de generacion. El modelo de 90M es la variante mas ligera y fue disenada para servir como linea base y para experimentacion con recursos modestos. No se dispone de informacion detallada sobre el numero exacto de tokens de entrenamiento ni sobre el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Habilidad para hacer y responder preguntas de forma natural.
- Demostracion de empatia y personalidad en las respuestas (gracias al entrenamiento con EmpatheticDialogues y PersonaChat).
- Capacidad de aportar conocimiento enciclopedico basico (via Wizard of Wikipedia).
- Adecuado para dialogos de dominio abierto y chit-chat.
- No se ha confirmado soporte de tool calling, function calling ni capacidades de agente.
- No se ha confirmado soporte multilingue mas alla del ingles.
- No se ha confirmado modo de razonamiento explicito (thinking mode), vision ni audio.

## Casos de uso

- Prototipado rapido de chatbots conversacionales: el modelo puede generar respuestas coherentes en conversaciones de dominio abierto con un coste computacional minimo, ideal para validar flujos de dialogo antes de escalar a modelos mayores.
- Investigacion en tecnicas de dialogo: su tamano reducido permite experimentar con estrategias de decodificacion, ajuste fino y evaluacion de metricas conversacionales en entornos academicos con recursos limitados.
- Generacion de respuestas empaticas en asistentes de bienestar: entrenado con EmpatheticDialogues, puede emplearse para generar respuestas con tono empatico en aplicaciones de soporte emocional basico, siempre con supervision humana.
- Simulacion de interlocutores para pruebas de usabilidad: util para generar conversaciones sinteticas que alimenten pruebas automatizadas de sistemas de atencion al cliente o interfaces conversacionales.
- Educacion y ensenanza de ingles: puede emplearse como herramienta de practica conversacional en ingles, generando respuestas naturales en contextos cotidianos.
- Baseline para comparativas de modelos: sirve como referencia ligera en experimentos que comparen tecnicas de entrenamiento o arquitecturas conversacionales, dado su bajo coste de inferencia.
- Generacion de datos sinteticos de dialogo: puede producir corpus conversacionales para aumentar datasets de entrenamiento de otros modelos, con las precauciones habituales sobre calidad y sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (90M parametros), aproximadamente 0.4 GB en FP16 y menos de 0.2 GB en cuantizacion de 8 bits (estimacion teorica, no confirmada en la informacion).
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU.
- Cabe en practicamente cualquier GPU consumer e incluso en dispositivos de gama baja.
- Opciones de despliegue: al ser un modelo de la familia BlenderBot, es compatible con la libreria Transformers de Hugging Face; el despliegue en vLLM, llama.cpp u Ollama no esta confirmado en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BlenderBot Small 90M (este) | 90M | no disponible | Apache 2.0 | Hugging Face |
| BlenderBot 2.7B | 2.7B | no disponible | Apache 2.0 | Hugging Face / ParlAI |
| BlenderBot 9.4B | 9.4B | no disponible | Apache 2.0 | ParlAI |
| DialoGPT Small | 117M | 1024 tokens | MIT | Hugging Face |

La comparativa se limita a la familia BlenderBot y a DialoGPT Small como alternativa de tamano similar. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos de dialogos en ingles, puede reproducir sesgos de genero, raza o cultura presentes en los corpus originales.
- Riesgo de alucinacion: elevado en un modelo de 90M; puede generar afirmaciones factuales incorrectas, especialmente en temas de conocimiento enciclopedico.
- Limitaciones de contexto: la longitud de contexto no esta documentada en la informacion disponible; en modelos de esta familia suele ser limitada, lo que restringe conversaciones muy largas.
- Limitacion de idioma: solo soporta ingles; no se ha confirmado capacidad multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del paper y del codigo original de ParlAI para usos derivados.
- Caveat para produccion: no se ha confirmado soporte de tool calling ni de agentes; no es adecuado para tareas que requieran razonamiento complejo, matematicas o codigo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es una subida de terceros sin validacion comunitaria; se recomienda verificar la integridad de los pesos antes de usarlos en produccion.

## Enlaces

- [Hugging Face: Yuxi0630/blenderbot_small-90M](https://huggingface.co/Yuxi0630/blenderbot_small-90M)
- [Paper: Recipes for building an open-domain chatbot](https://arxiv.org/abs/1907.06616)
- [Codigo original PARLAI](https://parl.ai/projects/recipes/)
