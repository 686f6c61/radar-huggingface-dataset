# yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF

## Resumen

**gemma-4-12B-coder-fable5-composer2.5-v1-GGUF** es un fine-tune especializado en generación de código Python del modelo base **google/gemma-4-12B-it**, desarrollado por el usuario independiente yuxinlu1. El modelo está diseñado para ejecutarse localmente en hardware modesto, con cuantizaciones que van desde 4,5 GB (Q2_K) hasta 11,8 GB (Q8_0), lo que permite su uso en GPUs de consumo con 8 GB de VRAM o en sistemas con memoria unificada de Apple Silicon.

La principal innovación del modelo reside en su proceso de entrenamiento: es una destilación de cadenas de razonamiento (chain-of-thought) reales y verificadas por ejecución. Los datos de entrenamiento provienen de dos fuentes complementarias: el profesor principal **Composer 2.5**, cuyas soluciones solo se incluyeron si pasaban los tests asociados, y **Fable 5**, que se utilizó para reintentar los problemas que Composer 2.5 falló, también con verificación por ejecución. El resultado es un modelo que razona de forma explícita sobre el problema antes de emitir una solución, cubriendo casos límite, complejidad y enfoque.

El modelo se distribuye exclusivamente en formato GGUF para su uso con llama.cpp y herramientas compatibles, y presenta una ventana de contexto de 256K tokens, corregida tras un bug de metadatos del modelo base que inicialmente reportaba 131K. Es relevante ahora porque ofrece capacidades de razonamiento y codificación de nivel superior en un paquete que cabe en GPUs de gama media, sin depender de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B, arquitectura `gemma4_unified`) |
| Parametros totales | 12 mil millones (12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262144 tokens (256K) |
| Tipos de cuantizacion | Q2_K (4,5 GB), Q3_K_M (5,7 GB), Q4_K_M (6,87 GB), Q6_K (9,11 GB), Q8_0 (11,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el repositorio maestro) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura **Gemma 4 12B** de Google, un transformer denso con 12 mil millones de parametros. La variante base es `gemma-4-12B-it`, la version instruccional del modelo. El fine-tune se realizo sobre datos de codificacion Python verificables, es decir, problemas algoritmicos y de nivel de funcion con tests deterministas asociados.

El proceso de entrenamiento es una destilacion de cadenas de razonamiento de dos fuentes: el conjunto principal proviene de **Composer 2.5**, cuyas trazas de razonamiento reales se filtraron ejecutando el codigo generado contra los tests del problema, conservando solo las soluciones que pasaban. El conjunto auxiliar proviene de **Fable 5**, al que se le entregaron los problemas que Composer 2.5 fallo para que los reintentara, generando una nueva cadena de razonamiento autoconsistente y una solucion correcta, tambien verificada por ejecucion. Estas trazas auxiliares son sinteticas (razonamiento racionalizado) y se etiquetaron por separado para distinguir ambas fuentes.

No se menciona el uso de RLHF o DPO en el proceso. La innovacion clave es la verificacion por ejecucion: todo el codigo de entrenamiento paso sus tests antes de entrar en el dataset, lo que garantiza que el razonamiento aprendido conduce a soluciones funcionales.

## Capacidades

- **Generacion de codigo Python**: especializado en problemas algoritmicos y de nivel de funcion con tests deterministas.
- **Razonamiento explicito**: el modelo muestra su cadena de pensamiento (edge cases, complejidad, enfoque) antes de emitir la solucion final.
- **Modo thinking**: compatible con el modo de razonamiento de Gemma 4, activable para problemas complejos.
- **Codigo verificable**: las soluciones generadas tienden a ser ejecutables y correctas gracias al filtrado por tests durante el entrenamiento.
- **Contexto largo**: ventana de 256K tokens, suficiente para repositorios completos o documentacion extensa.
- **Ejecucion local**: disenado para inferencia offline con llama.cpp, sin dependencia de APIs.
- **Capacidades multilingues**: no disponible (el modelo base de Gemma 4 es multilingue, pero no se especifica el alcance en este fine-tune).

## Casos de uso

- **Asistente de codificacion local privado**: el modelo puede integrarse en editores como VS Code o Neovim mediante servidores compatibles con OpenAI API (llama.cpp `llama-server`), proporcionando autocompletado y generacion de funciones sin enviar codigo a la nube. Su tamano reducido (Q4_K_M, 6,87 GB) lo hace viable en portatiles con 16 GB de RAM unificada.

- **Resolucion de problemas algoritmicos**: dado un enunciado de problema de plataformas tipo LeetCode o Codeforces, el modelo razona en voz alta sobre el enfoque, la complejidad temporal y los casos limite antes de escribir la solucion. La verificacion por tests durante el entrenamiento hace que sus soluciones sean mas fiables que las de un fine-tune convencional.

- **Generacion de tests unitarios**: el modelo puede analizar una funcion existente y generar casos de prueba que cubran bordes, entradas vacias y condiciones de error, aprovechando su entrenamiento con datos verificados por ejecucion.

- **Refactorizacion de codigo legacy**: con su contexto de 256K, puede procesar archivos o modulos completos y sugerir refactorizaciones manteniendo el comportamiento, razonando sobre las dependencias y efectos secundarios.

- **Educacion y aprendizaje de Python**: el modelo puede explicar su razonamiento paso a paso, lo que lo convierte en un tutor util para estudiantes que quieren entender no solo la solucion, sino el proceso de llegada a ella.

- **Prototipado rapido en entornos sin GPU**: gracias a la cuantizacion Q2_K (4,5 GB), puede ejecutarse en sistemas con 8 GB de RAM o VRAM, permitiendo generar esqueletos de codigo en entornos de desarrollo embebidos o maquinas virtuales ligeras.

- **Agentes de terminal y depuracion**: aunque la v1 no es especificamente agentica, su capacidad de razonamiento estructurado permite usarla como motor de un agente que diagnostica errores, propone parches y verifica soluciones, como demuestra el salto de rendimiento en tau2-bench de la v2 (del 15% al 55%).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta v1 en la informacion disponible. La model card menciona un resultado de la **v2** (gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2) en tau2-bench telecom, donde pasa de ~15% (modelo base) a ~55%, pero ese dato corresponde a la v2, no a esta v1. No se proporcionan cifras de MMLU, HumanEval, GSM8K u otros benchmarks estandar para este modelo.

## Requisitos de hardware

- **VRAM minima**: 4,5 GB con cuantizacion Q2_K, lo que permite ejecucion en GPUs de 6 GB o sistemas con 8 GB de memoria unificada.
- **VRAM recomendada**: 8 GB para Q3_K_M (5,7 GB) con contexto util, o 12 GB para Q4_K_M (6,87 GB) con ~30K tokens de contexto.
- **GPUs compatibles**: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), Arc B60 (48 GB), y cualquier GPU con al menos 6 GB de VRAM.
- **Apple Silicon**: compatible con memoria unificada de 8 GB o superior, aunque mas lento que una GPU discreta.
- **Contexto por VRAM** (estimaciones con KV cache Q8_0 y ~1,5 GB de overhead):
  - 8 GB: ~16K tokens con Q2_K, ~10K con Q3_K_M, ~2-4K con Q4_K_M.
  - 12 GB: ~48K con Q2_K, ~38K con Q3_K_M, ~30K con Q4_K_M.
  - 16 GB: ~80K con Q2_K, ~72K con Q3_K_M, ~64K con Q4_K_M.
  - 24 GB: ~200K con Q2_K, ~160K con Q3_K_M, ~128K con Q4_K_M.
  - 32 GB: 256K (maximo) con Q2_K, Q3_K_M y Q4_K_M.
- **Opciones de despliegue**: llama.cpp (`llama-server`), Ollama, LM Studio, Jan. Requiere una version reciente de llama.cpp que soporte la arquitectura `gemma4_unified`.
- **Optimizacion**: usar KV cache en Q4_0 duplica aproximadamente el contexto disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| **gemma-4-12B-coder-fable5-composer2.5-v1** | 12B | 256K | Codigo Python con CoT verificado | Apache 2.0 | GGUF |
| **google/gemma-4-12B-it** (base) | 12B | 256K | Instrucciones generales | Apache 2.0 | safetensors |
| **Qwen2.5-Coder-7B** | 7B | 128K | Codigo general | Apache 2.0 | safetensors, GGUF |
| **DeepSeek-Coder-V2-Lite** | 16B (MoE, 2,4B activos) | 128K | Codigo general | DeepSeek License | safetensors, GGUF |

La comparativa directa con el modelo base muestra la diferencia principal: el fine-tune esta especializado en codigo Python con razonamiento verificado, mientras que el base es de proposito general. Frente a alternativas de codigo como Qwen2.5-Coder-7B, este modelo ofrece el doble de contexto y un proceso de entrenamiento con verificacion por ejecucion, aunque con un tamano mayor. DeepSeek-Coder-V2-Lite es mas eficiente en parametros activos (MoE) pero tiene una licencia mas restrictiva.

## Limitaciones y advertencias

- **Especializacion estrecha**: el modelo esta fine-tuneado exclusivamente para codigo Python verificable. Su rendimiento en otros lenguajes, tareas de texto general o dominios no relacionados puede degradarse respecto al modelo base.
- **Razonamiento sintetico en datos auxiliares**: las trazas de Fable 5 son racionalizaciones sinteticas, no razonamiento real del modelo. Pueden contener justificaciones post-hoc que no reflejan el proceso real de resolucion.
- **Riesgo de alucinacion**: como cualquier modelo de lenguaje, puede generar codigo que parece correcto pero falla en casos no cubiertos por los tests. La verificacion por ejecucion reduce pero no elimina este riesgo.
- **Dependencia de llama.cpp reciente**: la arquitectura `gemma4_unified` requiere una version actualizada de llama.cpp; versiones antiguas no cargaran el modelo.
- **Bug de contexto corregido**: las primeras copias de los quants reportaban 131K en lugar de 256K. Si se descargo una copia antigua, es necesario re-descargar para obtener la ventana completa.
- **Sin benchmarks publicados**: no hay datos de rendimiento estandar (MMLU, HumanEval) para esta v1, lo que dificulta la comparacion objetiva con otros modelos.
- **Modelo de autor independiente**: no es un lanzamiento oficial de Google; el soporte y mantenimiento dependen de un unico desarrollador.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Gemma 4 tiene sus propias condiciones que deben verificarse.

## Enlaces

- **Repositorio GGUF**: https://huggingface.co/yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1-GGUF
- **Pesos safetensors (maestro)**: https://huggingface.co/yuxinlu1/gemma-4-12B-coder-fable5-composer2.5-v1
- **Version v2 (agentica)**: https://huggingface.co/yuxinlu1/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-GGUF
- **Modelo base**: https://huggingface.co/google/gemma-4-12B-it
- **llama.cpp**: https://github.com/ggml-org/llama.cpp
- **Guia de ejecucion local**: https://vinoth12940.github.io/blog/articles/genai-20260616-gemma4-coder-local/
- **Mirror en ModelScope**: https://www.modelscope.cn/models/hf/yuxinlu1-gemma-4-12B-coder-fable5-composer2.5-v1-GGUF
