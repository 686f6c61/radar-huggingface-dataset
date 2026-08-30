# Ttimms/Ornith-1.5-35B-A3B-REAP-50-NVFP4A16

## Resumen

Ornith-1.5-35B-A3B-REAP-50-NVFP4A16 es una versión podada y cuantizada del modelo MoE de código y razonamiento `ornith-ai/Ornith-1.5-35B-A3B`, desarrollada por Ttimms. El objetivo es ofrecer un modelo de generación de código de alta calidad que quepa en 16 GB de VRAM de una GPU de consumo, manteniendo un rendimiento competitivo en tareas de programación y agentes. Para lograrlo, se aplica un podado de expertos REAP al 50 % (de 256 a 128 expertos) y una cuantización GPTQ-NVFP4A16 de 4 bits, además de eliminar el módulo de visión y el head de decodificación especulativa MTP del modelo original. El resultado es un artefacto de 12,47 GiB con aproximadamente 18,5 mil millones de parámetros totales y unos 3 mil millones activos, servible con vLLM en hardware Blackwell (SM120).

La relevancia de este modelo reside en que demuestra que es posible ejecutar localmente un modelo MoE de 35 mil millones de parámetros con calidad cercana a la de modelos especializados en código, gracias a la combinación de podado estructural y cuantización agresiva. Los resultados publicados por el autor indican un 84,15 % en HumanEval+ y un 89,15 % en MBPP+, con un 44,0 % de resolución en SWE-bench Verified bajo un límite de contexto de 49K tokens. La licencia MIT permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5MoeForCausalLM (MoE, texto solamente) |
| Parametros totales | 18.543.997.568 (~19 B) |
| Parametros activos | ~3 B (8 de 128 expertos activos) |
| Longitud de contexto | No especificada en la model card; el modelo base Ornith-1.5-35B-A3B tiene 256K segun LLM Explorer. Evaluado con 49K tokens |
| Tipos de cuantizacion | NVFP4A16 (4-bit weight-only, GPTQ); tambien disponible en bf16 (modelo REAP-50-bf16) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

El modelo parte de `ornith-ai/Ornith-1.5-35B-A3B`, un MoE basado en la arquitectura Qwen3.5 con 256 expertos y 8 activos por token. Sobre este base, Ttimms aplica un podado de expertos REAP (50 %), reduciendo el número de expertos a 128 manteniendo la misma topología de enrutamiento (8 activos). Posteriormente se cuantiza con GPTQ-NVFP4A16, una cuantización de 4 bits solo para pesos, optimizada para GPU Blackwell. El modelo original incluye un módulo de visión (tower) y un head MTP para decodificación especulativa, ambos eliminados en esta versión para reducir el tamaño y permitir la carga con vLLM estándar. No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de podado (si requirió fine-tuning posterior). El modelo base Ornith-1.5 se distingue por su framework de auto-mejora: propone tareas, genera scaffolds específicos y produce rollouts para reinforcement learning, aunque esta característica no está presente en el artefacto podado.

## Capacidades

- Generacion de codigo: alto rendimiento en benchmarks de programacion (HumanEval+ 84,15 %, MBPP+ 89,15 %).
- Razonamiento y tareas agénticas: resuelve issues reales de SWE-bench Verified con un scaffold bash-only (44,0 % de resolucion).
- Tool calling: compatible con pipelines de agentes que requieren invocacion de herramientas (probado con mini-swe-agent).
- Multilingüe: no especificado; probablemente hereda capacidades del modelo base Qwen3.5, pero no confirmado.
- Texto solamente: el modulo de vision fue eliminado, por lo que no procesa imagenes.
- Decodificacion especulativa: no disponible (head MTP eliminado).

## Casos de uso

- Asistente de programacion local en IDE: con 12,47 GiB de pesos, puede ejecutarse en una GPU de 16 GB (por ejemplo, RTX 5070 Ti) y proporcionar autocompletado, explicaciones de codigo y refactorizacion en tiempo real sin depender de servicios en la nube.
- Agente de resolucion de issues en repositorios: su rendimiento en SWE-bench (44,0 % con contexto limitado a 49K) lo hace util para sistemas que analizan issues, proponen parches y ejecutan tests de forma autonoma.
- Generacion de codigo en pipelines CI/CD: puede integrarse como herramienta de generacion de pruebas unitarias o de documentacion tecnica, aprovechando su capacidad de tool calling y su licencia MIT para uso comercial.
- Analisis y revision de codigo: dado su buen rendimiento en MBPP+ (89,15 %), es adecuado para detectar errores logicos y sugerir mejoras en pull requests.
- Chat tecnico de soporte: su capacidad de razonamiento y contexto largo (hasta 256K en el modelo base, aunque evaluado a 49K) permite mantener conversaciones multi-turno sobre arquitecturas de software.
- Educacion y formacion en programacion: puede servir como tutor interactivo que explica conceptos, genera ejemplos y corrige ejercicios, ejecutable en hardware modesto.

## Benchmarks y rendimiento

Los siguientes resultados fueron medidos por el autor directamente sobre el checkpoint publicado, con decodificacion greedy y framing instruct, servido a traves de vLLM:

| Benchmark | Puntuacion | IC 95 % | n |
|---|---|---|---|
| HumanEval+ | 84,15 % | [77,8, 88,9] | 164 |
| HumanEval | 90,24 % | [84,7, 93,9] | 164 |
| MBPP+ | 89,15 % | [85,6, 91,9] | 378 |
| SWE-bench Verified (resolved) | 44,0 % (22/50) | no disponible | 50 |

En SWE-bench, el 81,5 % de los casos completados (22 de 27) se resolvieron correctamente; 15 instancias excedieron el limite de contexto de 49K y 6 agotaron el limite de pasos. El autor compara con su release anterior (KAT-Coder-V2.5-Dev REAP-50 NVFP4A16), que obtuvo 96,34 / 89,63 / 89,42 en los tres primeros benchmarks y 52,0 % en SWE-bench, indicando que este modelo esta en el mismo nivel pero ligeramente por detras por ser una base generalista en lugar de especializada en codigo. No hay benchmarks publicados del modelo base `ornith-ai/Ornith-1.5-35B-A3B` para comparacion directa.

## Requisitos de hardware

- VRAM: 12,47 GiB de pesos; cabe en 16 GB de VRAM dejando espacio para KV cache (evaluado con 49K tokens de contexto).
- GPU recomendada: RTX 5070 Ti (SM120, Blackwell) segun la model card; requiere soporte para NVFP4 en vLLM. Tambien compatible con otras GPUs Blackwell de 16 GB.
- No cabe en GPUs con menos de 16 GB sin reducir el contexto o usar cuantizaciones mas agresivas.
- Despliegue: vLLM (version estandar, tras aplicar parches que ya estan integrados upstream). No se mencionan otros runners como llama.cpp u Ollama.
- Latencia: no especificada. La suite completa de 706 problemas (HumanEval+ y MBPP+) se ejecuto en ~12 minutos con vLLM, lo que sugiere un throughput razonable para inferencia local.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ | MBPP+ | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-REAP-50-NVFP4A16 (este) | ~19 B totales / ~3 B activos | 49K (eval) / 256K (base) | 84,15 % | 89,15 % | 44,0 % | MIT |
| KAT-Coder-V2.5-Dev REAP-50 NVFP4A16 (release anterior) | ~19 B totales / ~3 B activos | 49K (eval) | 96,34 % | 89,63 % | 52,0 % | no especificada |
| ornith-ai/Ornith-1.5-35B-A3B (modelo base) | 35,95 B totales / ~3 B activos | 256K | no publicado | no publicado | no publicado | MIT |

El modelo base sin podar tiene el doble de parametros totales y probablemente mejor rendimiento, pero no cabe en 16 GB. La comparacion con KAT-Coder muestra que la especializacion en codigo del base influye mas que el podado en el resultado final.

## Limitaciones y advertencias

- El modulo de vision y el head MTP fueron eliminados; no puede procesar imagenes ni usar decodificacion especulativa.
- La evaluacion SWE-bench se realizo con un limite de contexto de 49K tokens, muy por debajo del maximo teorico del modelo base (256K). El 30 % de las instancias fallaron por exceder ese limite, lo que subestima su capacidad real en tareas de contexto largo.
- Los hiperparametros de sampling (temperature 1.0, top_p 0.95, top_k 20) se tomaron del `generation_config.json` del checkpoint y no fueron validados mediante un barrido; el autor advierte que deben confirmarse en un piloto antes de confiar en ellos.
- El podado al 50 % puede degradar la calidad en tareas fuera de codigo, aunque no se han medido benchmarks generales (MMLU, GSM8K, etc.).
- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de idioma especificas de esta version.
- Aunque la licencia MIT permite uso comercial, el modelo deriva de Qwen3.5, cuya licencia original puede imponer condiciones adicionales; se recomienda verificar la cadena de licencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-NVFP4A16
- Modelo base podado (bf16): https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-bf16
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Ficha en LLM Explorer: https://llm-explorer.com/model/Ttimms%2FOrnith-1.5-35B-A3B-REAP-50-NVFP4A16,WEtyD89d83PCxI4RhCukL
