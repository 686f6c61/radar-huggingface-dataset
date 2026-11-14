# Vipplav/gemma-finetuned-faq

## Resumen

`Vipplav/gemma-finetuned-faq` es un adaptador LoRA publicado por Vipplav AI (estudio de IA con sede en India) sobre el modelo base `TinyLlama/TinyLlama-1.1B-Chat-v1.0`. A pesar del nombre, que sugiere un fine-tune de Gemma, el modelo base real es TinyLlama, un transformer decoder-only de 1.100 millones de parametros. El adaptador esta orientado a generacion de respuestas de FAQ y soporte al cliente empresarial en ingles, con enfasis en baja latencia.

El modelo resuelve un problema acotado: proporcionar un backend conversacional ligero para resolucion de preguntas frecuentes sobre bases de conocimiento corporativas, sin requerir infraestructura de GPU de gran escala. Segun la model card, el autor reporta latencias inferiores a 100 ms en GPU y por debajo de un segundo en CPU moderna, aunque no se aportan mediciones reproducibles ni metodologia.

La relevancia actual es limitada: se trata de un adaptador con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion sobre el dataset de entrenamiento. Su interes practico reside en ser un ejemplo de fine-tune LoRA de bajo coste sobre TinyLlama para dominios verticales de FAQ, no en constituir una alternativa competitiva a modelos de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (TinyLlama-1.1B-Chat-v1.0) con adaptador LoRA |
| Parametros totales | 1.100 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base TinyLlama soporta 2048 tokens) |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors (adaptador PEFT) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA sobre las proyecciones de atencion `q_proj` y `v_proj` del modelo base TinyLlama-1.1B-Chat-v1.0. TinyLlama es un transformer decoder-only derivado de la familia Llama, entrenado originalmente con 3 billones de tokens segun su documentacion publica, e incluye una fase de chat (SFT/DPO) que proporciona el formato conversacional sobre el que se apoya este adaptador. El rango del adaptador LoRA, el alpha y la tasa de aprendizaje no se especifican en la model card.

No se documenta el dataset de fine-tuning: ni el numero de ejemplos, ni su composicion, ni si hubo filtrado o evaluacion humana. Tampoco se indica si se aplico RLHF, DPO o alguna tecnica de alineacion adicional sobre el adaptador. La unica innovacion tecnica declarada es el uso de LoRA para mantener el tamano del adaptador reducido, aunque el repositorio ocupa 4,4 GB, lo que sugiere que puede incluir pesos fusionados o artefactos adicionales no descritos.

## Capacidades

- Generacion de texto conversacional en ingles orientada a preguntas y respuestas de tipo FAQ.
- Resolucion de consultas sobre bases de conocimiento empresariales, segun el caso de uso declarado por el autor.
- Formato de prompt conversacional con etiquetas `<|system|>`, `<|user|>` y `<|assistant|>` heredado de TinyLlama-Chat.
- Inferencia de baja latencia declarada por el autor (menos de 100 ms en GPU, menos de un segundo en CPU moderna), sin mediciones publicadas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue: solo ingles.

## Casos de uso

- Atencion al cliente automatizada de primer nivel: el adaptador puede gestionar respuestas a preguntas frecuentes en ingles sobre politicas, horarios o procedimientos, con prompts de sistema que definan el rol de soporte.
- Backend de chatbot para pymes: al ejecutarse sobre un modelo de 1,1 B, puede desplegarse en una sola GPU consumer o incluso en CPU, lo que reduce el coste de infraestructura frente a modelos de mayor tamano.
- Resolucion de FAQ en portales de ayuda: integrado en un pipeline de recuperacion (RAG) que inyecte fragmentos de la base de conocimiento en el prompt de sistema, el modelo puede reformular la respuesta en lenguaje natural.
- Prototipado rapido de asistentes verticales: sirve como punto de partida para equipos que quieran validar un flujo conversacional de FAQ antes de invertir en un modelo mayor o en un fine-tune completo.
- Despliegue en entornos con recursos limitados: su tamano permite ejecucion en dispositivos edge o servidores sin GPU dedicada, util para demos o entornos de desarrollo.
- Filtrado y clasificacion de consultas entrantes: con prompts adecuados, puede etiquetar o redirigir consultas de soporte segun su tematica, aunque esta capacidad no esta validada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en FP16 para el modelo base de 1,1 B; en cuantizacion de 4 bits (si se aplica sobre el modelo fusionado) el requisito se reduce a alrededor de 0,7-1 GB. El adaptador LoRA en si anade una huella minima.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3050, RTX 4060, T4 o superiores. Para mayor throughput, A10G, L4 o A100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card), llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF, y vLLM o TGI tras fusionar los pesos (el soporte de adaptadores LoRA en vLLM es posible pero no esta documentado por el autor).
- Latencia y throughput: el autor declara menos de 100 ms en GPU y menos de un segundo en CPU moderna, sin especificar hardware, longitud de secuencia ni metodologia de medicion. No se dispone de cifras de throughput (tokens por segundo) verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Vipplav/gemma-finetuned-faq | 1,1 B (base) | no disponible (base: 2048) | Apache 2.0 | FAQ empresarial en ingles (LoRA) | Hugging Face, 0 descargas |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2048 | Apache 2.0 | Chat general | Hugging Face, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32 768 | Apache 2.0 | Chat general multilingue | Hugging Face, muy popular |
| SmolLM2-1.7B-Instruct | 1,7 B | 8192 | Apache 2.0 | Chat general | Hugging Face, popular |

Frente al modelo base, este adaptador anade especializacion en FAQ pero carece de evaluacion publica que demuestre mejoras medibles. Frente a alternativas como Qwen2.5-1.5B-Instruct o SmolLM2-1.7B-Instruct, ofrece menor contexto, solo ingles y ninguna validacion de rendimiento, aunque su tamano ligeramente inferior puede traducirse en menor latencia en hardware modesto.

## Limitaciones y advertencias

- El nombre del repositorio (`gemma-finetuned-faq`) induce a error: el modelo base es TinyLlama, no Gemma.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos, cobertura tematica o riesgo de sobreajuste a un dominio concreto.
- Riesgo de alucinacion inherente a un modelo de 1,1 B: puede generar respuestas plausibles pero incorrectas en consultas de FAQ, especialmente fuera del dominio de entrenamiento.
- Capacidad limitada en razonamiento complejo, matematicas y codigo, propia de su tamano.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Longitud de contexto limitada por el modelo base (2048 tokens), insuficiente para bases de conocimiento extensas sin un pipeline RAG externo.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de mejora sobre el modelo base.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene auditar el adaptador antes de usarlo en produccion.
- El repositorio ocupa 4,4 GB, un tamano desproporcionado para un adaptador LoRA tipico, lo que sugiere artefactos adicionales no documentados; revisar el contenido antes de descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vipplav/gemma-finetuned-faq
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Web del autor: https://www.vipplavai.com/
- GitHub del autor: https://github.com/vipplavai
- Contacto del autor: hello@vipplavai.com
- Referencia externa sobre fine-tuning de Gemma (no especifica de este modelo): https://news.ycombinator.com/item?id=43414235
