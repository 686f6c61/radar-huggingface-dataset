# tinyopsec/Orbit-3.5-Nano-GGUF

## Resumen

Orbit-3.5-Nano-GGUF es la distribucion en formato GGUF del modelo OpenPathAI/Orbit-3.5-Nano, un ajuste fino (fine-tune) del modelo base LiquidAI/LFM2.5-2.6B orientado a instrucciones y generacion de codigo en indonesio. El repositorio lo publica el usuario tinyopsec y contiene unicamente los pesos cuantizados generados con llama.cpp, no el modelo original. Con 2.697.198.592 parametros (aproximadamente 2,7 mil millones), se situa en la categoria de modelos pequenos, disenados para ejecutarse en hardware de consumo.

La relevancia de esta ficha radica en que ofrece un modelo compacto y multilingue enfocado en un idioma poco cubierto por los grandes laboratorios (indonesio) y en tareas de codigo, empaquetado en una amplia gama de cuantizaciones (desde F16 hasta Q2_K) que permiten desplegarlo desde estaciones de trabajo con GPU hasta equipos con CPU y poca memoria. La arquitectura subyacente es LFM2.5, de tipo transformer, aunque la model card no detalla sus caracteristicas internas.

No se dispone de informacion publica sobre benchmarks, datos de entrenamiento ni longitud de contexto en la documentacion proporcionada, por lo que la mayoria de especificaciones tecnicas se marcan como no disponibles. El modelo se distribuye bajo la LFM Open License v1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM2.5; detalles internos no disponibles) |
| Parametros totales | 2.697.198.592 (~2,7 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Indonesio (segun tags y model card); resto no disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de LiquidAI/LFM2.5-2.6B, un modelo de la familia LFM2.5 de Liquid AI. La model card del repositorio GGUF no especifica la arquitectura interna (tipo de atencion, uso de capas recurrentes o hibridas, etc.), por lo que no es posible confirmar detalles mas alla de que se trata de un transformer de aproximadamente 2,7 mil millones de parametros. El ajuste fino esta orientado a instrucciones y codigo en indonesio, segun los tags `instruct`, `coding` e `indonesian`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones tecnicas especificas del fine-tune. Las cuantizaciones GGUF fueron generadas con llama.cpp, lo que implica que el modelo es compatible con el ecosistema de inferencia local basado en este formato.

## Capacidades

- Generacion de texto conversacional en formato instruct (tag `conversational`).
- Generacion y asistencia en codigo (tag `coding`), presumiblemente con enfasis en el idioma indonesio.
- Soporte principal del indonesio; el resto de idiomas no esta documentado.
- Compatible con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier implementacion que lea GGUF.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido (thinking).
- No se documentan capacidades multilingues adicionales mas alla del indonesio.

## Casos de uso

- Asistencia de programacion en indonesio: el modelo puede generar fragmentos de codigo y explicaciones en indonesio, lo que resulta util para equipos de desarrollo en Indonesia o para productos dirigidos a ese mercado que necesiten asistencia tecnica localizada.
- Chatbot de atencion al cliente en indonesio: al ser un modelo instruct compacto, puede desplegarse en servidores modestos para gestionar conversaciones multi-turno en ese idioma; la longitud de contexto debe verificarse antes de usarlo en produccion.
- Despliegue en local para desarrollo: con cuantizaciones Q4_K_M o inferiores, cabe en equipos con GPU de consumo o incluso CPU, lo que permite prototipar sin coste de API.
- Educacion y tutoria en programacion: puede emplearse como asistente de aprendizaje de codigo para hablantes de indonesio, con la ventaja de ejecutarse offline y preservar la privacidad del alumnado.
- Generacion de documentacion tecnica en indonesio: util para traducir o redactar comentarios, README y documentacion de proyectos dirigidos a ese mercado.
- Procesamiento por lotes en entornos con recursos limitados: al ser un modelo de ~2,7 B con cuantizacion de 4 bits, permite ejecutar tareas de generacion de texto a bajo coste en hardware de gama media.
- Integracion en herramientas de edicion de codigo (plugins de IDE) mediante llama.cpp u Ollama, aprovechando el formato GGUF y la compatibilidad con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (aproximada, basada en el tamano de los ficheros indicados y el numero de parametros):
  - F16: ~5,2 GB (tamano indicado en la model card).
  - Q8_0: ~2,9 GB.
  - Q6_K: ~2,2 GB.
  - Q5_K_M: ~1,9 GB.
  - Q4_K_M: ~1,6 GB (recomendada por el autor).
  - Q3_K_M: ~1,3 GB.
  - Q2_K: ~1,0 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para F16; una RTX 3060, RTX 4060 o superior es suficiente para las cuantizaciones de 4-8 bits. Para Q4_K_M basta con una GPU de 4 GB o incluso CPU.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas (GTX 1650 4 GB en adelante para cuantizaciones bajas; RTX 3060/4060 para cuantizaciones medias-altas).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se documenta soporte de vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orbit-3.5-Nano-GGUF | ~2,7 B | no disponible | LFM Open License v1.0 | GGUF | Fine-tune para indonesio instruct/codigo |
| LiquidAI/LFM2.5-2.6B | ~2,6 B | no disponible | LFM Open License v1.0 | safetensors | Modelo base del que deriva |
| Qwen2.5-Coder-3B | ~3 B | 32 K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Enfasis en codigo, multilingue |
| Llama-3.2-3B-Instruct | ~3 B | 128 K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista de tamano similar |

Nota: los datos de Qwen2.5-Coder-3B y Llama-3.2-3B-Instruct provienen de conocimiento general y no de la informacion proporcionada; verifiquense en sus fuentes oficiales. No se dispone de datos de rendimiento comparativo para Orbit-3.5-Nano.

## Limitaciones y advertencias

- Enfoque principal en indonesio: el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- No hay benchmarks publicados, por lo que no se puede evaluar su calidad frente a alternativas.
- Riesgo de alucinacion inherente a modelos pequenos de ~2,7 B, especialmente en tareas de codigo y matematicas.
- La licencia LFM Open License v1.0 ("other") puede imponer restricciones al uso comercial; es necesario revisar sus terminos antes de desplegar en produccion.
- La longitud de contexto no esta documentada, lo que limita la planificacion de aplicaciones con conversaciones largas o documentos extensos.
- El repositorio GGUF no incluye informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El autor advierte explicitamente: "Evaluate before use" (evaluar antes de usar).
- El modelo base es LFM2.5-2.6B; las limitaciones de este se heredan en el fine-tune.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Orbit-3.5-Nano-GGUF
- Modelo base del fine-tune: https://huggingface.co/OpenPathAI/Orbit-3.5-Nano
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- llama.cpp (runtime de cuantizacion e inferencia): https://github.com/ggml-org/llama.cpp
