# Ttimms/KAT-Coder-V2.5-Dev-REAP-50-bf16

## Resumen

KAT-Coder-V2.5-Dev-REAP-50-bf16 es un checkpoint podado al 50 % del modelo agéntico de codificación Kwaipilot/KAT-Coder-V2.5-Dev, publicado por Ttimms. La poda se realiza mediante REAP (Router-weighted Expert Activation Pruning), reduciendo el número de expertos de 256 a 128 en la arquitectura MoE híbrida `qwen3_5_moe` (Gated-DeltaNet + atención + MoE). El resultado es un modelo de 18 990 568 816 parámetros en bf16, pensado como punto de partida para generar cuantizaciones propias (AWQ, EXL2, MLX, GGUF, etc.) y para servir en entornos con recursos limitados.

La relevancia de este modelo radica en que permite ejecutar un agente de codificación de alto rendimiento en hardware de consumo: el repositorio asociado demuestra su uso en una RTX 5070 Ti con 16 GB de VRAM mediante cuantización NVFP4 y vLLM. El modelo base alcanza 69,40 % en SWE-bench Verified, superando a Qwen3.5-35B-A3B (58,60 %), gracias a un entrenamiento agéntico con refuerzo orientado al uso de herramientas. Este checkpoint bf16 conserva la torre de visión, aunque para uso solo texto se recomienda cargarlo con `Qwen3_5MoeForCausalLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida `qwen3_5_moe` (Gated-DeltaNet + atención + MoE) |
| Parametros totales | 18 990 568 816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (original); releases derivados: NVFP4A16, NVFP4 W4A4, GGUF |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una versión podada de Kwaipilot/KAT-Coder-V2.5-Dev, que a su vez se basa en la arquitectura `qwen3_5_moe` de Qwen. Se trata de un diseño híbrido que combina Gated-DeltaNet (una capa recurrente lineal) con atención tradicional y capas MoE. La poda REAP reduce los expertos de 256 a 128, aplicando una renormalización del router sobre los expertos supervivientes para preservar la distribución de activaciones. El checkpoint no incluye cabezal MTP (`mtp_num_hidden_layers: 0`), verificado con una pasada forward real.

El modelo base fue entrenado con un enfoque agéntico: generación de código con ejecución en entornos sandbox y optimización mediante refuerzo para el uso de herramientas. Los datos de entrenamiento específicos (número de tokens, composición del dataset) no se detallan en la información disponible. La poda se realizó con REAP (github.com/CerebrasResearch/reap) con una corrección en la renormalización del router.

## Capacidades

- Generación de código y razonamiento agéntico: el modelo base logra 69,40 % en SWE-bench Verified, lo que indica capacidad para resolver issues reales de repositorios con múltiples pasos.
- Soporte de tool calling y function calling: entrenado específicamente para usar herramientas dentro de entornos sandbox, con retroalimentación de ejecución.
- Capacidades multilingües: solo inglés declarado en la model card.
- Visión: la torre de visión no se ha eliminado en este checkpoint, aunque el pipeline principal es text-generation. Para uso solo texto se recomienda `Qwen3_5MoeForCausalLM`.
- Compatible con vLLM y otras librerías de inferencia (endpoints_compatible).
- Sin cabezal MTP (decodificación especulativa no incluida en este checkpoint).

## Casos de uso

- Agente de codificación local en hardware de consumo: con cuantización NVFP4 y vLLM, el modelo puede ejecutarse en una GPU con 16 GB de VRAM (p. ej., RTX 5070 Ti), permitiendo un asistente de programación agéntico sin depender de la nube.
- Generación de código en producción: su rendimiento en HumanEval+ (~90 %) y MBPP+ (~90 %) lo hace adecuado para tareas de autocompletado y generación de funciones en pipelines de CI/CD, siempre que se valide la salida con pruebas.
- Resolución de issues en repositorios: gracias a su entrenamiento agéntico, puede abordar tareas de SWE-bench, como localizar un bug, modificar varios archivos y ejecutar tests.
- Fine-tuning posterior: al ser un checkpoint bf16 sin cuantizar, sirve como base para ajuste fino con PEFT o LoRA en dominios específicos de código.
- Investigación en poda de MoE: el repositorio y el pipeline documentan el proceso REAP, útil para estudiar el impacto de la poda de expertos en modelos híbridos.
- Despliegue en entornos con restricciones de VRAM: las versiones GGUF permiten ejecución con llama.cpp u Ollama en CPUs o GPUs modestas, aunque con menor rendimiento que NVFP4.

## Benchmarks y rendimiento

Los datos disponibles provienen de dos fuentes: la model card del checkpoint podado (medidos sobre la cuantización NVFP4A16) y el artículo sobre el modelo base.

| Benchmark | KAT-Coder-V2.5-Dev (base) | KAT-Coder-V2.5-Dev-REAP-50 (NVFP4A16) | Qwen3.5-35B-A3B |
|---|---|---|---|
| SWE-bench Verified | 69,40 % | no disponible | 58,60 % |
| HumanEval+ | no disponible | ~90 % | no disponible |
| MBPP+ | no disponible | ~90 % | no disponible |

Nota: los valores de HumanEval+ y MBPP+ se midieron con decodificación greedy y prompt instruct sobre la versión NVFP4A16 del checkpoint podado. No se han publicado resultados del checkpoint bf16 sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint bf16 pesa 38,0 GB, por lo que requiere al menos 40 GB de VRAM sin cuantizar (p. ej., A100 40 GB, H100 80 GB). Con cuantización NVFP4A16 cabe en 16 GB de VRAM, como demuestra el repo en una RTX 5070 Ti.
- GPUs recomendadas: para bf16, GPUs datacenter (A100, H100) o consumer de gama alta con 48 GB (RTX 6000 Ada). Para NVFP4, GPUs Blackwell (RTX 50xx, B200) con soporte de tensor cores FP4.
- Opciones de despliegue: vLLM (con soporte NVFP4), llama.cpp para GGUF, Ollama para GGUF, Hugging Face Transformers para bf16.
- Latencia y throughput: no se han publicado cifras concretas. El repo indica que es usable como agente local en 16 GB, lo que sugiere una latencia aceptable para interacción interactiva, pero los valores exactos dependen del hardware y la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-REAP-50-bf16 | 18,99 B (MoE, 128 expertos) | no disponible | no disponible (base: 69,40 %) | Apache-2.0 | Hugging Face |
| Kwaipilot/KAT-Coder-V2.5-Dev (base) | no disponible (MoE, 256 expertos) | no disponible | 69,40 % | Apache-2.0 | Hugging Face |
| Qwen3.5-35B-A3B | 35 B (MoE, 3 B activos) | no disponible | 58,60 % | Apache-2.0 | Hugging Face |

La comparativa se basa en datos publicados. El modelo podado mantiene un rendimiento cercano al base en benchmarks de código (HumanEval+ ~90 %), aunque no se ha medido SWE-bench en la versión podada. La ventaja principal es la reducción de parámetros y la posibilidad de ejecutarse en 16 GB de VRAM.

## Limitaciones y advertencias

- Solo soporta inglés declarado; no se garantiza rendimiento en otros idiomas.
- La poda al 50 % puede degradar capacidades fuera de los benchmarks medidos; no se han evaluado tareas de razonamiento general o conversación.
- La torre de visión está presente pero no integrada en el pipeline de generación de texto; su uso requiere cargar el modelo con la clase adecuada y puede no estar optimizada.
- Riesgo de alucinación en código: como todo modelo generativo, puede producir código incorrecto o inseguro; se recomienda validación con tests y revisión humana.
- La licencia Apache-2.0 se hereda del modelo base, pero el usuario debe verificar que el uso comercial cumple con los términos de los componentes subyacentes (Qwen, REAP).
- El checkpoint bf16 no está cuantizado; para producción en hardware de consumo es necesario aplicar cuantización (NVFP4, GGUF, etc.), lo que puede introducir pérdidas adicionales de precisión.
- No se dispone de información sobre la longitud de contexto soportada; se recomienda probar con secuencias cortas antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-bf16
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Release NVFP4A16: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16
- Release NVFP4 W4A4: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4-W4A4
- Release GGUF: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-GGUF
- Repositorio del pipeline: https://github.com/t-timms/kat-coder-16gb
- Repositorio de serving NVFP4: https://github.com/t-timms/kat-coder-nvfp4
- Artículo en HackerNoon: https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
- Página en FriendliAI: https://friendli.ai/models/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16
