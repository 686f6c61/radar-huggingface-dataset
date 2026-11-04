# tnromy/Qwen2.5-1.5B-Legal-ID-SFT

## Resumen
Qwen2.5-1.5B-Legal-ID-SFT es un ajuste fino (SFT) del modelo Qwen2.5-1.5B publicado por el usuario tnromy en HuggingFace. Se trata de un modelo de generacion de texto de 1.543.714.304 parametros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2, orientado por su nombre a tareas del ambito legal en indonesio ("Legal-ID"), aunque la model card no documenta ni el proceso de entrenamiento ni el dataset utilizado. El modelo base del ajuste es la version cuantizada a 4 bits de Unsloth (`unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit`), y el entrenamiento se realizo con Unsloth y la libreria TRL de HuggingFace.

El modelo resuelve, en teoria, la adaptacion de un LLM pequeno a terminologia y casuistica juridica en indonesio, lo que lo haria util para prototipos de bajo coste en ese dominio. Sin embargo, la informacion publicada es minima: no hay descripcion del dataset, no se reportan benchmarks, no se detalla el numero de tokens de entrenamiento ni la composicion de los datos, y el modelo no tiene descargas ni interacciones en el momento de la consulta.

Por su tamano (1,5B parametros) y licencia Apache 2.0, es relevante como ejemplo de ajuste fino ligero con Unsloth, pero su uso en produccion requeriria una evaluacion independiente exhaustiva, dado que la model card no aporta garantias sobre calidad, sesgos ni cobertura linguistica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (el modelo base usado para el ajuste estaba cuantizado a 4 bits con bitsandbytes) |
| Idiomas soportados | en (segun la model card); el nombre sugiere orientacion a indonesio, sin confirmar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo es un ajuste fino supervisado (SFT) sobre Qwen2.5-1.5B, un transformer decoder-only de la familia Qwen2 con atencion causal estandar y mecanismos de RoPE para codificacion posicional. El modelo base empleado para el ajuste es la version de Unsloth cuantizada a 4 bits (`unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit`), lo que implica que el entrenamiento partio de pesos cuantizados, una practica habitual para reducir requisitos de VRAM en GPUs de consumo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni hiperparametros del ajuste. La unica informacion tecnica disponible es que el entrenamiento se realizo con Unsloth y TRL, y que segun el autor fue "2x mas rapido" gracias a Unsloth. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades
- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B.
- Ajuste orientado a dominio legal en indonesio (segun el nombre del modelo), sin documentacion que lo confirme.
- Soporte de conversacion multi-turno mediante plantilla de chat de Qwen2 (formato ChatML).
- Capacidad de razonamiento basico y generacion de codigo, limitada por el tamano de 1,5B parametros.
- Soporte de tool calling y function calling: no documentado en esta ficha; el modelo base Qwen2.5 lo soporta, pero no se confirma tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: la model card declara solo ingles; el modelo base soporta multiples idiomas, pero el ajuste puede haber degradado el rendimiento en otros idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso
- Prototipado de asistentes legales en indonesio: el modelo puede generar borradores de respuestas sobre terminologia juridica, aunque requiere validacion humana por la ausencia de benchmarks.
- Clasificacion y extraccion de entidades en textos legales: con 1,5B parametros puede ejecutarse en GPUs de consumo para tareas de etiquetado de clausulas o partes contractuales.
- Generacion de resumenes de documentos juridicos: util para preprocesar contratos o regulaciones antes de revision humana, dado su bajo coste de inferencia.
- Chatbot de orientacion legal de primer nivel: puede gestionar conversaciones multi-turno basicas, aunque sin garantias de exactitud juridica.
- Fine-tuning adicional como base: al estar bajo Apache 2.0 y ser pequeno, sirve como punto de partida para ajustes especificos en otros dominios legales o idiomas.
- Despliegue en entornos con recursos limitados: su tamano permite ejecucion en CPU o GPUs modestas para demos internas y pruebas de concepto.
- Investigacion sobre SFT con Unsloth: ejemplo reproducible de ajuste eficiente en VRAM sobre un modelo cuantizado a 4 bits.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y KV cache (estimacion orientativa de 4-6 GB en total).
- VRAM estimada en cuantizacion 4 bits: aproximadamente 1 GB para pesos, con overhead adicional segun longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput; cabe en GPUs de consumo con 8 GB o mas en cuantizacion.
- Despliegue: compatible con transformers, text-generation-inference (TGI), vLLM y llama.cpp/Ollama previa conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| tnromy/Qwen2.5-1.5B-Legal-ID-SFT | 1,54B | no disponible | Apache 2.0 | Ajuste SFT legal en indonesio, sin benchmarks |
| Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens | Apache 2.0 | Modelo base oficial, con benchmarks publicados por Alibaba |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Version instruct oficial, con evaluaciones publicadas |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | Alternativa pequena de HuggingFace con benchmarks publicados |

## Limitaciones y advertencias
- Ausencia total de documentacion sobre el dataset de entrenamiento, lo que impide evaluar sesgos o cobertura del dominio legal.
- Riesgo elevado de alucinacion en materia juridica: un modelo de 1,5B sin evaluacion publicada no es fiable para asesoramiento legal real.
- La model card declara solo ingles como idioma, pese al sufijo "Legal-ID" que sugiere indonesio; existe ambiguedad sobre el idioma real de entrenamiento.
- El ajuste parte de un modelo cuantizado a 4 bits, lo que puede introducir perdida de calidad respecto al modelo base en precision completa.
- No se han publicado benchmarks, por lo que no hay evidencia de mejora sobre el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero sin garantias de calidad ni soporte del autor.
- El modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad.
- No apto para produccion sin evaluacion independiente y supervision humana en el dominio legal.

## Enlaces
- HuggingFace: https://huggingface.co/tnromy/Qwen2.5-1.5B-Legal-ID-SFT
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen2.5-1.5B-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- Qwen2.5 (familia de modelos): https://huggingface.co/Qwen/Qwen2.5-1.5B
- TRL (HuggingFace): https://github.com/huggingface/trl
