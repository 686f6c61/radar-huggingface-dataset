# trunght6605/KimochiSushi-Llama-3.2-3B-Instruct-Merged-llama-nf4-s42

## Resumen

KimochiSushi-Llama-3.2-3B-Instruct-Merged-llama-nf4-s42 es un ajuste fino (fine-tuning) del modelo meta-llama/Llama-3.2-3B-Instruct, desarrollado por el usuario trunght6605. Se trata de un asistente virtual de atencion al cliente (CSKH) para el restaurante japones Kimochi Sushi, segun indica la model card del autor. El modelo ha sido fusionado completamente (merged 16-bit) tras un entrenamiento con PEFT, de modo que se distribuye como pesos completos listos para usar con `pipeline` o vLLM.

Tecnicamente es un transformer causal de 3.212.749.824 parametros (aproximadamente 3,2 mil millones), derivado de la familia Llama 3.2 de Meta. El ajuste se realizo con un adaptador LoRA/QLoRA sobre una configuracion identificada como `llama_nf4_s42` (cuantizacion NF4 con semilla 42), y posteriormente los pesos se fusionaron en precision de 16 bits. El repositorio ocupa 6,4 GB en formato safetensors.

Su relevancia es limitada y muy especifica: no es un modelo de proposito general ni compite con modelos frontier, sino un ejemplo de adaptacion vertical de un modelo pequeno a un dominio concreto (atencion al cliente de restauracion en vietnamita). Su interes para desarrolladores radica en ser una referencia practica de como un modelo de 3B puede especializarse mediante fine-tuning ligero y desplegarse con requisitos de hardware modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only), basado en Llama 3.2 |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 3B soporta 131.072 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors de 16 bits tras el merge; el entrenamiento uso NF4) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 3B Instruct, un transformer decoder-only con atencion por grupos (GQA) y RoPE, tipico de la familia Llama 3. El autor aplico un ajuste fino supervisado (fine-tuning) con PEFT sobre una configuracion denominada `llama_nf4_s42`, que sugiere cuantizacion de 4 bits NF4 (QLoRA) con semilla 42. Tras el entrenamiento, los adaptadores se fusionaron con los pesos base y se exportaron en 16 bits, generando un checkpoint completo y autónomo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card no incluye detalles sobre el corpus utilizado mas alla de su orientacion al dominio de atencion al cliente de un restaurante japones. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en vietnamita, orientada a interacciones de atencion al cliente.
- Respuesta a consultas sobre un restaurante japones (menu, reservas, horarios, promociones), segun el dominio declarado por el autor.
- Mantenimiento de conversaciones multi-turno, heredado de la capacidad instruct del modelo base.
- Razonamiento basico y comprension lectora propias de un modelo de 3B, sin garantias de rendimiento en tareas complejas.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas; el modelo base Llama 3.2 3B no esta optimizado para ello.
- Capacidades multilingues: solo se declara vietnamita; el modelo base soporta otros idiomas, pero el ajuste puede haber degradado su competencia fuera del dominio.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Atencion al cliente automatizada en un restaurante: el modelo puede gestionar conversaciones multi-turno sobre reservas, horarios y menu en vietnamita, aprovechando el ajuste especifico al dominio de Kimochi Sushi.
- Chatbot de pedidos y consultas de menu: integrado en una web o aplicacion de mensajeria, responde preguntas frecuentes sobre platos, precios y disponibilidad.
- Gestion de reservas por texto: puede interpretar solicitudes de reserva y extraer datos (fecha, numero de comensales) para pasarlos a un sistema de gestion, aunque la integracion con herramientas externas requeriria validacion adicional.
- Prototipado rapido de asistentes verticales: sirve como plantilla para desarrolladores que quieran adaptar un modelo de 3B a un dominio concreto mediante QLoRA y desplegarlo con vLLM.
- Despliegue en hardware modesto: al ser un modelo de 3,2B en 16 bits, puede ejecutarse en una unica GPU consumer de gama alta o en CPU con cuantizacion adicional, lo que lo hace adecuado para entornos con presupuesto limitado.
- Evaluacion de tecnicas de merge de adaptadores: util como caso de estudio de fusion de pesos PEFT y su impacto en el rendimiento respecto al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 6,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 8-10 GB de VRAM.
- VRAM estimada con cuantizacion a 8 bits: alrededor de 3,5-4 GB de pesos, viable en GPUs de 6-8 GB.
- VRAM estimada con cuantizacion a 4 bits: alrededor de 2-2,5 GB de pesos, viable en GPUs consumer de gama media (RTX 3060, RTX 4060).
- GPU recomendadas: RTX 4090, A100, H100 para maxima comodidad; RTX 3090/4080 suficientes en 16 bits; RTX 3060/4060 validas con cuantizacion.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en 16 bits, y en GPUs de 6 GB con cuantizacion.
- Opciones de despliegue: vLLM y `pipeline` de Transformers (mencionados por el autor); llama.cpp y Ollama serian viables tras convertir a GGUF, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| KimochiSushi-Llama-3.2-3B-Instruct-Merged-llama-nf4-s42 | 3,21B | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens (segun documentacion de Meta) | Llama 3.2 Community License | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Phi-3.5-mini-instruct | 3,82B | 128.000 tokens | MIT | Hugging Face |

La comparativa se limita a parametros, contexto y licencia; no hay datos de rendimiento publicados para el modelo KimochiSushi que permitan una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- Modelo altamente especializado: el ajuste esta orientado exclusivamente a la atencion al cliente de un restaurante concreto, por lo que su rendimiento fuera de ese dominio sera inferior al del modelo base.
- Idioma restringido: solo se declara soporte de vietnamita; el uso en castellano u otros idiomas no esta garantizado y probablemente degrade la calidad.
- Riesgo de alucinacion: como todo modelo de 3B, puede inventar datos sobre menus, precios o politicas del restaurante; se recomienda validacion humana o RAG.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente al modelo base ni frente a alternativas.
- Licencia: apache-2.0 declarada por el autor, pero al derivar de Llama 3.2 conviene verificar la compatibilidad con la Llama 3.2 Community License del modelo base antes de un uso comercial.
- Sin soporte confirmado de tool calling ni agentes: no apto para flujos automatizados complejos sin validacion adicional.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni de mantenimiento; el modelo fue creado y actualizado en noviembre de 2026.
- Sesgos: no documentados; hereda los sesgos del modelo base y del dataset de ajuste, no publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trunght6605/KimochiSushi-Llama-3.2-3B-Instruct-Merged-llama-nf4-s42
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
