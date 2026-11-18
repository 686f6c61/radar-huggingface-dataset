# xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic

## Resumen

Qwopus3.5-4B-Coder-UNCENSORED-heretic es un modelo derivado del checkpoint Jackrong/Qwopus3.5-4B-Coder, publicado por el usuario xtools-at. Se trata de una version "decensored" (tambien etiquetada como abliterated o uncensored) generada mediante la herramienta Heretic v2.2.0.dev0, que aplica una tecnica de ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 4 a 32 del modelo original para reducir la tasa de rechazos. El modelo base es un ajuste fino tipo SFT de la familia Qwen3.5 de 4B parametros, orientado a programacion agentica, depuracion de codigo y uso de herramientas.

El modelo conserva las capacidades del checkpoint original: razonamiento con cadena de pensamiento, soporte de tool calling y function calling, y entrenamiento sobre trazas de agente. La intervencion de Heretic reduce los rechazos de 99/100 en el modelo original a 4/100 en esta version, con una divergencia KL de 0,0498 respecto al original. El tamano real de parametros segun safetensors es de 4.539.265.536 (unos 4,54B), y el repositorio ocupa 9,4 GB.

Es relevante para quienes necesitan un modelo compacto de codigo sin filtros de rechazo para entornos locales o pipelines de investigacion, aunque la eliminacion de salvaguardas conlleva riesgos importantes de uso. La licencia declarada es Apache 2.0 y soporta oficialmente ingles, chino, espanol, ruso y japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5), tag `qwen3_5` |
| Parametros totales | 4.539.265.536 (aprox. 4,54B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con aproximadamente 4,54B parametros, ajustado mediante SFT (supervised fine-tuning) sobre la receta "Qwopus Coder". Segun la model card, esa receta combina Trace Inversion para generar trazas de razonamiento aprendibles, trayectorias de agente de alta calidad para el comportamiento de uso de herramientas y un curriculo SFT orientado a mantener la estabilidad de formato en contextos largos. Los datasets citados incluyen Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

Sobre ese checkpoint, xtools-at aplica Heretic v2.2.0.dev0 con ablacion de rangos arbitrarios (ARA). Los parametros documentados son: start_layer_index 4, end_layer_index 32, preserve_good_behavior_weight 0,2965, steer_bad_behavior_weight 0,0001, overcorrect_relative_weight 0,9375 y neighbor_count 11. El modelo incorpora ademas soporte de multi-token prediction (MTP) con decodificacion especulativa, probado con n=2 segun las etiquetas de la model card. No se documentan detalles sobre RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y razonamiento con cadena de pensamiento (chain-of-thought).
- Generacion y depuracion de codigo, con enfasis en localizacion de bugs y parches minimos.
- Tool calling y function calling, con soporte para trayectorias de agente con bucles de retroalimentacion reales.
- Razonamiento multi-paso orientado a flujos de agente.
- Capacidades multilingues en ingles, chino, espanol, ruso y japones.
- Soporte de decodificacion especulativa mediante multi-token prediction (MTP n=2 probado).
- Entrada multimodal image-text-to-text segun la etiqueta del repositorio (no se detalla en la model card).
- Comportamiento decensurado: tasa de rechazo reducida a 4/100 frente a 99/100 del modelo original.

## Casos de uso

- Depuracion de codigo en local: el modelo esta entrenado para localizar bugs y proponer parches minimos verificados en entorno, lo que permite integrarlo en un IDE o en un bucle de pruebas automatizadas sin depender de servicios en la nube.
- Agentes de programacion con tool calling: gracias al entrenamiento sobre trayectorias de agente con feedback real, puede encadenar llamadas a herramientas (ejecutar tests, leer ficheros, aplicar parches) en pipelines de CI/CD.
- Asistente de codigo en entornos con requisitos de contenido: al reducir los rechazos, resulta util para tareas de seguridad ofensiva, analisis de malware o generacion de pruebas de penetracion donde el modelo original bloquearia la respuesta.
- Generacion de codigo en produccion: su tamano de 4,54B permite desplegarlo en una sola GPU consumer y servir peticiones de autocompletado o generacion de fragmentos con latencia baja.
- Razonamiento estructurado multi-paso: la cadena de pensamiento y el soporte MTP lo hacen adecuado para tareas de planificacion de refactorizaciones o analisis de dependencias en repositorios medianos.
- Investigacion sobre alineacion y abliteration: sirve como caso de estudio reproducible de como la ablacion ARA afecta a la tasa de rechazo con una divergencia KL medida (0,0498) respecto al modelo original.
- Soporte multilingue en desarrollo: puede atender consultas tecnicas en espanol, ruso o japones ademas de ingles y chino, util para equipos distribuidos.

## Benchmarks y rendimiento

La model card solo publica la comparacion de rechazos y divergencia KL entre esta version y el modelo original:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Rechazos | 4/100 | 99/100 |
| Divergencia KL | 0,0498 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card menciona una evaluacion con "benchlocal" pero no incluye cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB para los 4,54B parametros mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones segun tamano, no confirmadas por el autor).
- GPU recomendadas: A100 o H100 para despliegue de produccion con contexto largo; RTX 4090 o RTX 3090 para inferencia en FP16.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas en cuantizacion, y en 12-16 GB en precision completa.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference segun las etiquetas; vLLM, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwopus3.5-4B-Coder-UNCENSORED-heretic | 4,54B | no disponible | apache-2.0 | Version decensurada; 4/100 rechazos |
| Jackrong/Qwopus3.5-4B-Coder (original) | 4,54B | no disponible | no disponible | Modelo base; 99/100 rechazos |
| xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic | no disponible (9B por nombre) | no disponible | no disponible | Version mayor de la misma linea, citada en la model card |

No se dispone de datos de rendimiento comparativo con otras familias (Qwen3.5 base, Llama, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de salvaguardas (abliteration) conlleva riesgo de generar contenido danino, ilegal o inseguro; no es apta para aplicaciones de cara al publico sin moderacion externa.
- Riesgo de alucinacion inherente a los modelos de 4B, especialmente en razonamiento largo y codigo complejo.
- La divergencia KL de 0,0498 indica degradacion medible respecto al modelo original; puede afectar a la calidad en tareas fuera del dominio de codigo.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar despliegues con contextos largos.
- Solo cinco idiomas declarados; el rendimiento fuera de ellos no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo decensurado.
- La fecha de creacion (2026-11-18) y los datasets referenciados (Claude-opus-4.6/4.7) no son verificables de forma independiente en la informacion disponible.
- No se han publicado benchmarks estandar, por lo que la evaluacion de calidad queda pendiente de pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Version 9B de la misma linea: https://huggingface.co/xtools-at/Qwopus3.5-9B-Coder-UNCENSORED-heretic
- Heretic: https://heretic-project.org
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
