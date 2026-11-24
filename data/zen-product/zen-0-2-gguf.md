# ZEN-PRODUCT/zen-0.2-GGUF

## Resumen

Zen 0.2 es un ajuste fino de tipo LoRA (fusionado en los pesos finales) sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct, desarrollado por ZEN-PRODUCT. El modelo, de aproximadamente 3.086 millones de parametros, esta orientado a generacion de texto con enfasis en codigo, matematicas y razonamiento paso a paso. Se distribuye en formato GGUF cuantizado, lo que facilita su despliegue en entornos con recursos limitados mediante llama.cpp u Ollama.

El entrenamiento combina cuatro conjuntos de datos: instrucciones generales (Tulu 3), codigo (Magicoder-Evol-Instruct-110K y CodeFeedback-Filtered-Instruction) y matematicas con razonamiento encadenado (MetaMathQA). El resultado es un asistente conversacional que mantiene la arquitectura transformer decoder-only de Qwen2.5 y hereda su ventana de contexto, aunque el autor no documenta explicitamente la longitud en la model card.

La relevancia de Zen 0.2 radica en su tamano compacto (3B) combinado con cuantizaciones que permiten ejecucion en hardware de consumo, y en sus resultados declarados en HumanEval (hasta 87,0% en Q8_0) y LiveCodeBench (66-68% en Q4_K_M y Q5_K_M), que superan notablemente la referencia del modelo base en esa prueba. La licencia qwen-research impone restricciones importantes para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino LoRA fusionado |
| Parametros totales | 3.085.938.688 (~3,09B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-Coder-3B-Instruct; no documentada en la model card) |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | en, ru |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (repo de 14,9 GB con las tres cuantizaciones) |

## Arquitectura y entrenamiento

Zen 0.2 parte de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only con atencion causal estandar, y aplica un ajuste fino supervisado mediante LoRA que posteriormente se fusiona en los pesos base. No se documentan innovaciones arquitectonicas adicionales ni tecnicas como decodificacion especulativa o atencion lineal; el modelo conserva la arquitectura del base sin modificaciones estructurales.

El entrenamiento utiliza cuatro datasets: allenai/tulu-3-sft-mixture para instrucciones generales y conversacion, ise-uiuc/Magicoder-Evol-Instruct-110K y m-a-p/CodeFeedback-Filtered-Instruction para generacion de codigo, y meta-math/MetaMathQA para matematicas con razonamiento paso a paso. La model card no especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO posteriores al SFT. Tampoco se detallan hiperparametros del LoRA (rango, alpha, capas objetivo).

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y ruso.
- Generacion y completado de codigo en multiples lenguajes, con especial enfasis en instrucciones de programacion.
- Razonamiento matematico paso a paso, entrenado con MetaMathQA.
- Razonamiento general y respuesta a instrucciones del conjunto Tulu 3.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el entrenamiento en razonamiento matematico sugiere cierta capacidad, pero no hay validacion publicada.
- Capacidades multilingues limitadas a ingles y ruso segun la etiqueta del modelo.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistencia de programacion en local: el modelo puede autocompletar funciones y explicar codigo en entornos de desarrollo integrados con llama.cpp u Ollama, aprovechando su tamano de 3B para ejecucion en portatiles con GPU de consumo.
- Generacion de tests unitarios: dado un fragmento de codigo, el modelo puede proponer casos de prueba, adecuado por su entrenamiento en Magicoder y CodeFeedback.
- Tutoria de matematicas: resolucion de problemas paso a paso para plataformas educativas, gracias al ajuste con MetaMathQA y su capacidad de razonamiento encadenado.
- Preprocesamiento y transformacion de codigo en pipelines de CI/CD: su formato GGUF permite integrarlo en scripts de validacion o generacion de parches sin depender de APIs externas.
- Chatbot de soporte tecnico bilingue (ingles/ruso): conversaciones multi-turno sobre cuestiones de programacion o matematicas en entornos donde solo se requieren esos idiomas.
- Prototipado rapido en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q4_K_M y Q5_K_M reducen los requisitos de memoria, permitiendo inferencia en CPU con llama.cpp para pruebas de concepto.
- Generacion de documentacion tecnica a partir de codigo fuente, en ingles o ruso, como tarea auxiliar en repositorios.

## Benchmarks y rendimiento

Resultados declarados por el autor (500 tareas por cuantizacion; la referencia Qwen2.5-Coder-3B corresponde a los valores del modelo base):

| Modelo / Cuantizacion | HumanEval | MBPP | LiveCodeBench | CRUX-In | CRUX-Out | GSM8K | MATH | MMLU-Pro | GPQA | Media |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-3B (ref.) | 84,1% | 73,6% | 10,8% | 53,2% | 56,0% | 80,7% | 58,1% | 35,2% | 28,3% | — |
| Zen-0.2 Q4_K_M | 85,0% | 67,0% | 66,0% | 32,0% | 24,0% | 60,0% | 38,0% | 30,0% | 10,0% | 54,60% |
| Zen-0.2 Q5_K_M | 84,0% | 71,0% | 68,0% | 34,0% | 40,0% | 70,0% | 58,0% | 30,0% | 25,0% | 60,80% |
| Zen-0.2 Q8_0 | 87,0% | 71,0% | 60,0% | 38,0% | 32,0% | 70,0% | 44,0% | 33,3% | 15,0% | 58,60% |

Observaciones: el ajuste mejora HumanEval y LiveCodeBench respecto al base, pero degrada MBPP, CRUX-In, CRUX-Out, GSM8K, MATH, MMLU-Pro y GPQA en la mayoria de cuantizaciones. El autor advierte que las cifras pueden diferir de las reportadas por el proveedor. No hay datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q4_K_M aproximadamente 2 GB, Q5_K_M aproximadamente 2,3 GB, Q8_0 aproximadamente 3,3 GB; anadir overhead de contexto KV cache.
- GPU recomendadas: cualquier GPU con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente para las cuantizaciones disponibles; A100/H100 no son necesarias pero permiten mayor throughput por batching.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas; tambien en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; vLLM y TGI requeririan conversion a safetensors (no incluida en este repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|
| Zen 0.2 (Q8_0) | ~3,09B | no disponible | 87,0% (declarado) | qwen-research | GGUF |
| Qwen2.5-Coder-3B-Instruct | ~3,09B | 32.768 tokens (segun documentacion del base; no verificado en esta ficha) | 84,1% (ref. del autor) | qwen-research | safetensors, GGUF |
| Qwen2.5-Coder-1.5B-Instruct | ~1,5B | no disponible | no disponible | qwen-research | safetensors, GGUF |
| Llama 3.2 3B Instruct | ~3,2B | 128.000 tokens (segun documentacion del modelo) | no disponible | Llama 3.2 Community License | safetensors, GGUF |

La comparativa se limita a datos disponibles; no se han verificado de forma independiente los resultados de Zen 0.2 ni los del base.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso comercial; es imprescindible revisar los terminos antes de desplegar en produccion.
- Idiomas limitados a ingles y ruso; el rendimiento en castellano no esta validado y probablemente sea deficiente.
- Degradacion en varios benchmarks respecto al base (MBPP, GSM8K, MATH, MMLU-Pro, GPQA, CRUX), lo que sugiere perdida de capacidades generales por sobreajuste a los datasets de ajuste.
- Riesgo de alucinacion inherente a modelos de 3B, especialmente en matematicas y hechos factuales.
- Resultados de benchmarks declarados por el autor sin verificacion independiente; la propia model card advierte discrepancias potenciales.
- Longitud de contexto no documentada; no se garantiza el manejo de contextos largos mas alla de lo que soporte el base.
- Repo de 14,9 GB con tres cuantizaciones; el enlace GGUF de la model card apunta a una cuenta distinta (angelgodbrokenns) de la del autor (ZEN-PRODUCT), lo que conviene verificar antes de descargar.
- No hay informacion sobre sesgos, filtrado de seguridad ni evaluaciones de robustez.
- Tool calling y comportamiento agentico no documentados; no asumir su disponibilidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZEN-PRODUCT/zen-0.2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Licencia del base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct/blob/main/LICENSE
- Repo GGUF alternativo citado en la model card: https://huggingface.co/angelgodbrokenns/zen-0.2-GGUF
- Dataset Tulu 3: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset Magicoder-Evol-Instruct-110K: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
- Dataset CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
