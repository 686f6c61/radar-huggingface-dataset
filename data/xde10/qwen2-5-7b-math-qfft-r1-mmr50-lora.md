# XDE10/Qwen2.5-7B-Math-QFFT-R1-MMR50-LoRA

## Resumen

Qwen2.5-7B-Math-QFFT-R1-MMR50-LoRA es un adaptador LoRA de PEFT publicado por el usuario XDE10 sobre el checkpoint XDE10/Qwen2.5-7B-Math-QFFT-R1, que a su vez deriva de Qwen/Qwen2.5-7B-Instruct. El adaptador se ha entrenado con una variante de GRPO denominada MMR-DR-GRPO (Dr. GRPO con muestreo de importancia por token y un modelo de diversidad de embeddings) durante 50 pasos, con el objetivo de mejorar el razonamiento matematico del modelo base mediante post-entrenamiento por refuerzo.

El modelo resuelve el problema de afinar un modelo de 7B en tareas de matematicas competitivas y razonamiento paso a paso sin necesidad de reentrenar los pesos completos: al ser un adaptador LoRA de rango 64, pesa aproximadamente 0,7 GB y se puede cargar sobre el modelo base con PEFT o servirse con vLLM en modo LoRA. Es relevante en el contexto de la investigacion en RL para LLMs porque documenta de forma transparente una ablacion de 50 pasos con intervalos de confianza bootstrap, algo poco habitual en adaptadores publicados.

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso de aproximadamente 7.600 millones de parametros, con atencion RoPE nativa de 32K tokens y soporte de hasta 128K mediante YaRN (segun la familia Qwen2.5). El adaptador solo anade matrices de bajo rango sobre las proyecciones q/k/v/o y gate/up/down, por lo que hereda integramente las capacidades y limitaciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), adaptador LoRA sobre proyecciones de atencion y MLP |
| Parametros totales | Aproximadamente 7.600 millones en el modelo base; el adaptador LoRA ocupa unos 0,7 GB en disco (r=64, alpha=128) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (RoPE nativo, configurado en la evaluacion y en el ejemplo de vLLM) |
| Tipos de cuantizacion | No especificados en la model card; el adaptador se distribuye en safetensors y se usa en bfloat16 |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base para inferencia |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso con atencion causal, RoPE y capas MLP con SwiGLU. La configuracion LoRA usa r=64, alpha=128, dropout de 0,05 y modulos objetivo q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. El entrenamiento se realizo con TRL y vLLM colocados en una sola GPU, con muestreo de importancia por token (vllm_importance_sampling_mode=token_mask).

El algoritmo es MMR-DR-GRPO: variante de GRPO con loss_type dr_grpo, coeficiente beta=0,04 para la penalizacion KL y un componente de diversidad basado en jinaai/jina-embeddings-v2-small-en (ONNX en CPU) para evitar el colapso de modos. Se ejecutaron 50 pasos exportados de una programacion coseno de 500 pasos, con lr=1e-6, warmup de 50 pasos, num_generations=6, max_completion_length=16384 y temperatura 0,7 durante el rollout. El checkpoint base QFFT-R1 ya incorpora un post-entrenamiento previo de RL (750 pasos), por lo que este adaptador es una capa adicional de refinamiento.

## Capacidades

- Generacion de texto conversacional y razonamiento matematico paso a paso, con salida final en formato \boxed{}.
- Resolucion de problemas de competicion (AIME, AMC, MATH-500, GSM8K) con cadenas de razonamiento largas de hasta 16.384 tokens de finalizacion.
- Razonamiento multi-paso y auto-verificacion implicita derivada del entrenamiento RL con recompensas verificables.
- Soporte bilingue limitado a ingles y chino.
- Compatible con tool calling y function calling en la medida en que lo sea el modelo base Qwen2.5-7B-Instruct (no documentado especificamente para este adaptador).
- Integracion con vLLM en modo LoRA multi-adaptador (enable_lora=True, max_lora_rank=64) y con PEFT + Transformers.
- No incluye vision, audio ni modo thinking explicito mas alla del razonamiento textual generado.

## Casos de uso

- Evaluacion de investigacion en RL para LLMs: el adaptador sirve como checkpoint de referencia en experimentos de GRPO, Dr. GRPO y variantes con muestreo de importancia por token, ya que el autor publica codigo y diagnosticos de ablacion en el repositorio.
- Tutoria matematica automatizada: el modelo puede resolver paso a paso ecuaciones, problemas de olimpiada y ejercicios de calculo, mostrando el desarrollo completo antes de la respuesta final en \boxed{}.
- Generacion de datos sinteticos de razonamiento: se puede usar para producir cadenas de razonamiento verificables que alimenten pipelines de destilacion o entrenamiento SFT de modelos mas pequenos.
- Servicio multi-tenant con vLLM: al ser un adaptador LoRA, permite servir la variante matematica junto con el modelo base en la misma instancia, cambiando de adaptador por peticion con LoRARequest.
- Verificacion de soluciones en plataformas educativas: el modelo puede comprobar si un razonamiento dado llega a la respuesta correcta y senalar el paso erroneo, aprovechando el formato de respuesta final estandarizado.
- Benchmarking interno de modelos matematicos: su perfil equilibrado en cinco benchmarks (Comp100, GSM8K, MATH-500, AIME24, AIME25) lo hace util como baseline en comparativas de post-entrenamiento.
- Prototipado rapido en una sola GPU: al requerir solo 0,7 GB adicionales sobre el modelo base en bfloat16, se puede experimentar en una RTX 4090 o A100 sin infraestructura adicional.

## Benchmarks y rendimiento

Evaluacion unificada con RoPE nativo de 32K, 4.599 generaciones por modelo, temperatura 0,6, top_p 0,95 y Math-Verify 0.9.0 sobre el ultimo \boxed{}:

| Modelo | AIME24 (x16) | AIME25 (x16) | AMC23 (x8) | Comp100 | MATH-500 (x4) | GSM8K (x1) |
|---|---:|---:|---:|---:|---:|---:|
| Qwen/Qwen2.5-7B-Instruct (base) | 11,25% | 7,71% | 50,94% | 26,06% | 76,80% | 91,58% |
| XDE10/Qwen2.5-7B-Math-QFFT-R1 (R1 QFFT-750) | 18,54% | 14,79% | 59,06% | 33,63% | 80,50% | 91,43% |
| + MMR50-LoRA (este adaptador) | 18,75% | 16,25% | 60,00% | 34,50% | 80,35% | 92,42% |

El propio autor advierte que la mejora frente a R1 QFFT-750 no es estadisticamente significativa: el intervalo bootstrap del 95% pareado cruza cero (+0,88 pp, IC95% [-1,38; +3,31] en Comp100; +0,99 pp, p=0,062 en GSM8K). La mejora en maj@16 es de +6,7 pp en AIME24 y +10,0 pp en AIME25 respecto al modelo base Qwen2.5-7B-Instruct.

## Requisitos de hardware

- VRAM estimada: el modelo base en bfloat16 requiere aproximadamente 15-16 GB solo para pesos, mas KV cache; con contexto de 32K y lote pequeno se recomienda al menos 24-32 GB. El adaptador anade unos 0,7 GB.
- Cuantizacion: no se documentan versiones GGUF ni cuantizadas del adaptador; para uso en consumer GPU de 24 GB conviene cuantizar el modelo base a 8 bits o 4 bits y cargar el adaptador en bfloat16.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia a contexto completo y lotes grandes; RTX 4090 (24 GB) viable con contexto reducido o cuantizacion; RTX 3090 (24 GB) similar con limitaciones.
- Despliegue: vLLM con enable_lora=True y max_lora_rank=64 (recomendado para produccion), PEFT + Transformers con AutoPeftModelForCausalLM, y merge_and_unload para fusionar el adaptador y usar llama.cpp/Ollama/TGI tras conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comp100 | GSM8K | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Este adaptador (MMR50-LoRA) | 7,6B + LoRA | 32K | 34,50% | 92,42% | Apache 2.0 | Hugging Face (PEFT) |
| XDE10/Qwen2.5-7B-Math-QFFT-R1 | 7,6B | 32K | 33,63% | 91,43% | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32K (128K con YaRN) | 26,06% | 91,58% | Apache 2.0 | Hugging Face, Ollama, vLLM |
| Qwen2.5-Math-7B-Instruct | 7,6B | 4K (segun model card de Qwen) | No disponible | No disponible | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Qwen2.5 porque la informacion proporcionada no incluye resultados de otros modelos matematicos de 7B (DeepSeek-Math, Llama-3.1-8B-Instruct, etc.).

## Limitaciones y advertencias

- La mejora frente al checkpoint QFFT-R1 no es estadisticamente significativa segun el analisis bootstrap del propio autor; no debe presentarse como una ganancia de precision garantizada.
- Riesgo de alucinacion en problemas matematicos fuera de distribucion: el formato \boxed{} puede contener respuestas plausibles pero incorrectas, especialmente en contextos largos.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta evaluado y probablemente sea inferior.
- El adaptador requiere el modelo base XDE10/Qwen2.5-7B-Math-QFFT-R1; no es un modelo autonomo y no se puede usar sin descargar los pesos completos.
- No se documentan versiones cuantizadas (GGUF, AWQ, GPTQ) del adaptador ni del checkpoint base, lo que limita el despliegue en hardware de gama baja.
- El entrenamiento se realizo con solo 50 pasos sobre una programacion de 500; el autor remite al repositorio para diagnosticos de fallos en ejecuciones mas largas, lo que sugiere inestabilidad potencial en RL prolongado.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen2.5 y de jina-embeddings-v2-small-en si se redistribuye el adaptador.
- Sin datos publicados de latencia, throughput ni consumo energetico, por lo que las estimaciones de produccion deben validarse en el hardware objetivo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/XDE10/Qwen2.5-7B-Math-QFFT-R1-MMR50-LoRA
- Modelo base del adaptador: https://huggingface.co/XDE10/Qwen2.5-7B-Math-QFFT-R1
- Modelo original Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Codigo y analisis de RL: https://github.com/XDE10/qwen2.5-7b-math-posttrain
- Modelo de embeddings de diversidad: https://huggingface.co/jinaai/jina-embeddings-v2-small-en
- Math-Verify (evaluacion): no se proporciona enlace directo en la informacion disponible
- Paper de Dr. GRPO: no se proporciona enlace en la informacion disponible
