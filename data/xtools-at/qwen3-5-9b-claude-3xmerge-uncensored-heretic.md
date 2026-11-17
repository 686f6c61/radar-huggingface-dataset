# xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic

## Resumen
Este modelo es un merge experimental de tres fine-tunes sobre la arquitectura Qwen3.5-9B, publicado por el usuario xtools-at en Hugging Face. Combina tres variantes complementarias: Qwythos-9B-v2 (orientada a razonamiento y estabilidad de generacion), Qwen3.5-9B-Fable-5-v1 (ajustada sobre trazas de Claude Fable 5 y Claude Code) y Qwopus3.5-9B-Coder (especializada en codigo, razonamiento estructurado y uso de herramientas). El objetivo declarado es reunir razonamiento general, generacion conversacional y capacidades de desarrollo de software en un unico checkpoint de aproximadamente 9B parametros.

La version aqui descrita es, ademas, una variante "decensored" o "abliterated" del merge original, generada con la herramienta Heretic v2.0.0.dev0 mediante una tecnica de ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) aplicada sobre las capas 16 a 23. El autor reporta una reduccion drastica de rechazos (de 99/100 en el modelo original a 1/100 en esta variante) con una divergencia KL de 0.0205 respecto al modelo base, lo que indica un cambio moderado en la distribucion de salida.

El modelo es relevante para desarrolladores e investigadores que necesitan un checkpoint de ~9B con licencia Apache-2.0, capacidad declarada de contexto largo (heredada del componente Qwythos, con escalado YaRN hasta ~1.048.576 tokens en el modelo fuente, no garantizado en el merge), soporte multimodal imagen-texto segun los tags del repositorio, y comportamiento sin rechazos para tareas de generacion que requieren baja censura. Se trata de un checkpoint experimental: su rendimiento debe evaluarse de forma independiente a los modelos fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3.5-9B (merge de pesos por media ponderada lineal) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el merge; el modelo fuente Qwythos-9B-v2 declara ~1.048.576 tokens con escalado YaRN, sin garantia de transferencia |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; el repo ocupa 19,3 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (verificar terminos upstream antes de redistribuir) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo es un merge de pesos por media ponderada lineal de tres checkpoints derivados de Qwen3.5-9B. Los coeficientes declarados son: Qwythos-9B-v2 con peso 1.0 (razonamiento Mythos, estabilidad de salida y reduccion de repeticiones), Qwen3.5-9B-Fable-5-v1 con peso 0.8 (fine-tuning sobre trazas de Claude Fable 5 / Claude Code) y Qwopus3.5-9B-Coder con peso 0.6 (codigo, razonamiento estructurado y uso agentico de herramientas). No se trata de un entrenamiento adicional sobre el merge, sino de una combinacion directa de pesos.

Sobre el merge original se aplico una ablacion de rango arbitrario (ARA) con Heretic v2.0.0.dev0, con los parametros: start_layer_index 16, end_layer_index 23, preserve_good_behavior_weight 0.6496, steer_bad_behavior_weight 0.0006, overcorrect_relative_weight 0.9719 y neighbor_count 14. El proceso es reproducible (directorio `reproduce` en el repositorio). Los datasets asociados en los tags son los empleados por los modelos fuente: armand0e/claude-fable-5-claude-code, lambda/hermes-agent-reasoning-traces, Jackrong/Claude-opus-4.7-TraceInversion-5000x y Jackrong/Claude-opus-4.6-TraceInversion-9000x. No se dispone del numero de tokens de entrenamiento ni de detalles sobre RLHF/DPO en el merge final.

## Capacidades
- Generacion de texto conversacional multi-turno.
- Razonamiento orientado a tareas complejas (heredado de Qwythos-9B-v2).
- Generacion de codigo y razonamiento estructurado (heredado de Qwopus3.5-9B-Coder).
- Soporte de function calling y tool use para flujos agenticos.
- Flujos de agente y razonamiento multi-paso.
- Capacidad multimodal imagen-texto segun el tag `image-text-to-text` del repositorio (no detallada en la model card).
- Contexto largo declarado en el modelo fuente (escalado YaRN hasta ~1.048.576 tokens), sin garantia en el merge.
- Comportamiento decensored/abliterated: baja tasa de rechazos (1/100 segun el autor).
- Capacidades multilingues: no disponibles.

## Casos de uso
- Asistente de codigo en produccion: el componente Qwopus aporta generacion de codigo y razonamiento estructurado; puede integrarse en pipelines de CI/CD para revision automatica de parches, generacion de tests o explicacion de errores, con soporte de tool calling para consultar repositorios o ejecutar linters.
- Agentes autonomos multi-paso: el modelo soporta function calling y razonamiento encadenado, lo que permite construir agentes que planifican, invocan APIs y verifican resultados en tareas de automatizacion.
- Atencion al cliente automatizada: el componente conversacional (Fable-5) y el contexto largo potencial permiten gestionar dialogos multi-turno con historial extenso, aunque conviene validar el contexto efectivo del merge.
- Generacion de contenido sin filtros restrictivos: la variante abliterated reduce los rechazos, lo que resulta util en entornos de investigacion o creacion que requieren respuestas directas sobre temas sensibles, siempre con supervision humana y cumplimiento legal.
- Analisis de documentos largos: si el contexto largo del modelo fuente se conserva, podria emplearse para resumir o extraer informacion de documentos extensos; debe medirse empiricamente antes de confiar en ventanas de un millon de tokens.
- Prototipado de asistentes de razonamiento: util como checkpoint de ~9B para experimentar con tecnicas de merge y ablacion, comparando comportamiento frente al modelo original en tareas de razonamiento y codigo.
- Investigacion sobre alineacion y censura: la reproducibilidad del proceso ARA permite estudiar el efecto de la ablacion sobre la distribucion de salidas (KL 0.0205) y sobre la tasa de rechazos.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Qwen3.5-9B-Claude-3xMerge) |
|---|---|---|
| Rechazos | 1/100 | 99/100 |
| Divergencia KL | 0.0205 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K, etc.) para el merge en la informacion disponible. Los unicos datos de benchmarks citados pertenecen al modelo fuente Fable-5-v1 y no deben atribuirse a este checkpoint:

| Benchmark | Fable-5-v1 (fuente) | Qwen3.5-9B (fuente) |
|---|---|---|
| ARC | 0.624 | 0.553 |
| ARC-Easy | 0.806 | 0.712 |
| BoolQ | 0.891 | 0.892 |

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda 24 GB o mas.
- En cuantizacion de 8 bits: en torno a 10-11 GB de pesos; en 4 bits: en torno a 5-6 GB, mas cache KV. Los formatos de cuantizacion concretos no estan publicados en la informacion disponible.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto moderado. Para contextos muy largos se necesitan GPUs con mas memoria o tecnicas de atencion eficiente.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI para servido de alto rendimiento; llama.cpp/Ollama requeririan conversion a GGUF, no confirmada en el repositorio. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic) | ~9,4B | No confirmado en el merge (fuente ~1M con YaRN) | Apache-2.0 | Merge abliterated, 1/100 rechazos |
| xtools-at/Qwen3.5-9B-Claude-3xMerge | ~9,4B | No confirmado | Apache-2.0 | Modelo original, 99/100 rechazos |
| Qwopus3.5-9B-Coder (Jackrong) | ~9B | No disponible | No disponible | Especializado en codigo y agentes |
| Qwen3.5-9B base | ~9B | No disponible | No disponible | Modelo base de la familia |

No se dispone de datos de rendimiento comparables entre estos checkpoints en la informacion proporcionada.

## Limitaciones y advertencias
- Checkpoint experimental: el autor advierte que su rendimiento, fiabilidad y compatibilidad deben evaluarse de forma independiente a los modelos fuente.
- La ablacion reduce rechazos pero puede incrementar la probabilidad de contenido inapropiado, sesgado o danino; requiere moderacion y supervision en produccion.
- Riesgo de alucinacion inherente a modelos de ~9B y a merges de pesos sin entrenamiento adicional de alineacion.
- El contexto largo declarado (~1M tokens) pertenece al modelo fuente y no esta garantizado en el merge; debe medirse empiricamente.
- Idiomas soportados no documentados; el comportamiento multilingue es incierto.
- Licencia Apache-2.0 declarada, pero el autor recomienda verificar los terminos upstream de los modelos fuente antes de redistribuir o usar comercialmente.
- No hay benchmarks de capacidades publicados para el merge; las cifras de ARC/BoolQ citadas son del modelo fuente Fable-5-v1.
- La capacidad multimodal (tag `image-text-to-text`) no esta detallada en la model card y deberia validarse.
- Divergencia KL de 0.0205 respecto al original: cambios moderados en la distribucion de salida que pueden afectar a tareas sensibles.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Modelo original (merge): https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge
- Modelo fuente Qwythos-9B-v2: https://huggingface.co/empero-ai/Qwythos-9B-v2
- Modelo fuente Qwen3.5-9B-Fable-5-v1: https://huggingface.co/TeichAI/Qwen3.5-9B-Fable-5-v1
- Modelo fuente Qwopus3.5-9B-Coder: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Heretic (herramienta de ablacion): https://heretic-project.org
- Dataset armand0e/claude-fable-5-claude-code: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
