# StickmanCharles/Cardano-Aiken-by-Charles-Tao-v0

## Resumen

Cardano-Aiken-by-Charles-Tao-v0 es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-3B-Instruct, especializado en el lenguaje de smart contracts Aiken para la blockchain de Cardano. Lo desarrolla Charles Tao (StickmanCharles) y se distribuye ya convertido y cuantizado a formato MLX de 4 bits, lo que lo hace ejecutable directamente en Macs con Apple Silicon mediante la librería `mlx-lm`. El modelo parte de la variante ya cuantizada de `mlx-community`, de modo que hereda la arquitectura Qwen2 con 3.085.938.688 parametros totales.

El problema que aborda es muy concreto: la escasez de asistentes de codigo con conocimiento practico de Aiken, un lenguaje relativamente joven dentro del ecosistema Cardano, frente a la abundancia de modelos entrenados en lenguajes mainstream. El ajuste se realizo con LoRA de rango 8 durante 800 iteraciones sobre el dataset `AmiBening/cardano-aiken-stdlib-v2-1`, compuesto por ejemplos de codigo Cardano/Aiken.

Es relevante por su nicho y por su formato de despliegue: es un modelo pequeno (3B) que cabe en un portatil y que apunta a un dominio donde los modelos generalistas suelen fallar. Sus limitaciones son igual de claras: solo funciona en Apple Silicon, no es compatible con llama.cpp ni LM Studio, y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (decoder-only), cuantizado a 4 bits |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-3B) |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX 4-bit), con index de shards |
| Modelo base | mlx-community/Qwen2.5-Coder-3B-Instruct-4bit |
| Dataset de ajuste | AmiBening/cardano-aiken-stdlib-v2-1 |
| Metodo de ajuste | LoRA, rango 8, 800 iteraciones |
| Libreria | mlx-lm |
| Tamano del repositorio | 2.2 GB |
| Formato de prompt | ChatML (`<\|im_start\|>` / `<\|im_end\|>`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-3B-Instruct, un transformer decoder-only denso de 3B parametros con atencion causal estandar. Sobre esa base, el autor aplico un ajuste supervisado con LoRA de rango 8 durante 800 iteraciones usando ejemplos de codigo Aiken y Cardano extraidos del dataset `AmiBening/cardano-aiken-stdlib-v2-1`. Los adaptadores LoRA resultantes se fusionaron en los pesos principales antes de publicar `model.safetensors`; la carpeta `aiken_adapters/` se conserva unicamente como referencia y no es necesaria para la inferencia.

El punto tecnico mas importante es que el ajuste se hizo sobre una version ya cuantizada a 4 bits del modelo base, no sobre los pesos en bf16. Esto abarata el proceso pero implica que la cuantizacion queda fijada: para obtener una version GGUF o de mayor precision habria que reconvertir desde los pesos originales en bf16, tal como advierte la propia model card. No se documentan detalles sobre composicion exacta del dataset, numero de tokens de entrenamiento, uso de RLHF/DPO ni innovaciones de decodificacion.

## Capacidades

- Generacion de codigo en Aiken para validadores (validators), redeemers y logica de smart contracts en Cardano.
- Generacion de texto conversacional en ingles, heredada del modelo base instruct.
- Razonamiento de codigo y explicacion de fragmentos de Aiken, dentro de las capacidades del Qwen2.5-Coder-3B original.
- Soporte de plantilla de chat ChatML, lo que permite conversaciones multi-turno mediante `apply_chat_template`.
- Ejecucion local en Apple Silicon con `mlx-lm`, tanto por CLI (`mlx_lm.generate`, `mlx_lm.chat`) como por API de Python.
- Tool calling y function calling: no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Vision, audio o modo thinking: no disponibles.
- Multilingue: no; el modelo declara unicamente ingles.

## Casos de uso

- Asistencia a desarrolladores de Cardano en local: un desarrollador puede lanzar `mlx_lm.chat` en su Mac y pedir borradores de validadores Aiken sin enviar codigo a servicios en la nube, lo que resulta util para contratos con logica sensible.
- Generacion de esqueletos de validadores: el modelo puede producir la estructura basica de un validator con su tipo de datum, redeemer y contexto, que el desarrollador luego revisa y completa; encaja por su entrenamiento especifico en Aiken.
- Explicacion de codigo Aiken existente: util para equipos que migran desde Plutus/Haskell y necesitan entender fragmentos de la stdlib de Aiken; el ajuste sobre `cardano-aiken-stdlib-v2-1` lo hace adecuado para este dominio acotado.
- Prototipado rapido en entornos docentes: al caber en un portatil Apple Silicon y no requerir GPU dedicada, sirve para talleres o cursos sobre smart contracts en Cardano sin infraestructura de servidor.
- Automatizacion de snippets en scripts de desarrollo: mediante la API de Python se puede integrar en tareas batch de generacion de ejemplos o tests de validadores, siempre con revision humana.
- Pruebas de concepto de asistentes de dominio: sirve como base para experimentar con fine-tuning adicional o para evaluar si un modelo de 3B especializado aporta valor frente a un modelo generalista en tareas de Aiken.
- Inferencia offline en entornos restringidos: al ejecutarse integramente en local, es apto para escenarios donde no se permite salida de datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de Aiken, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM equivalente: al ser MLX sobre memoria unificada, el modelo de 4 bits ocupa aproximadamente 2.2 GB de pesos; el consumo real de memoria incluye el contexto y el runtime de MLX.
- Hardware obligatorio: Mac con Apple Silicon (M1, M2, M3 o M4); no funciona en GPU NVIDIA ni en CPU x86 con esta distribucion.
- Cabe en cualquier Mac Apple Silicon con al menos 8 GB de memoria unificada, aunque se recomienda 16 GB para contextos largos y comodidad.
- Despliegue: exclusivamente mediante `mlx-lm` (`mlx_lm.chat`, `mlx_lm.generate` o la API de Python `load`/`generate`).
- No compatible con llama.cpp, Ollama, LM Studio, vLLM ni TGI en su formato actual; para esos runtimes habria que reconvertir desde bf16 a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Cardano-Aiken-by-Charles-Tao-v0 | 3.085.938.688 | no disponible | Aiken / Cardano | Apache 2.0 | MLX 4-bit, solo Apple Silicon |
| Qwen2.5-Coder-3B-Instruct (base) | 3B aprox. | no disponible en esta ficha | Codigo general | Apache 2.0 | Multiples formatos (safetensors, GGUF, MLX) |
| mlx-community/Qwen2.5-Coder-3B-Instruct-4bit | 3B aprox. | no disponible en esta ficha | Codigo general | Apache 2.0 | MLX 4-bit |

La comparacion directa con alternativas especializadas en Aiken no esta disponible en la informacion proporcionada. Frente a su modelo base, la diferencia es el ajuste de dominio en Aiken y la perdida de portabilidad al quedar fijado en formato MLX 4-bit.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con `mlx-lm`; no es cargable en llama.cpp, Ollama, LM Studio, vLLM ni TGI en su formato publicado.
- El ajuste se realizo sobre pesos ya cuantizados a 4 bits, por lo que la calidad esta condicionada por esa cuantizacion y no se puede recuperar la precision original sin reconvertir desde bf16.
- Modelo de 3B parametros: capacidad de razonamiento limitada en comparacion con modelos mayores; el codigo Aiken generado debe revisarse siempre antes de desplegarse en produccion.
- Riesgo de alucinacion en APIs, tipos y funciones de Aiken no presentes en el dataset de entrenamiento; el dataset es acotado y el autor no documenta su cobertura.
- Solo declara soporte de ingles; no se garantiza calidad en castellano ni en otros idiomas.
- No hay benchmarks publicados, por lo que no existe evidencia cuantitativa de mejora frente al modelo base en tareas de Aiken.
- El repositorio tiene un volumen de descargas muy bajo (30) y pocos likes (3), lo que sugiere poca validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la responsabilidad sobre la correccion del codigo de smart contracts generado recae integramente en el usuario; un fallo en un validador puede tener consecuencias economicas directas.
- La fecha de creacion indicada (2026-03-04) y la de actualizacion (2026-11-22) deben tratarse con cautela como metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StickmanCharles/Cardano-Aiken-by-Charles-Tao-v0
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-Coder-3B-Instruct-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/AmiBening/cardano-aiken-stdlib-v2-1
- Web del autor: https://stickmancharles.com
- Web del autor (Echoforge): https://echoforgeef.com
