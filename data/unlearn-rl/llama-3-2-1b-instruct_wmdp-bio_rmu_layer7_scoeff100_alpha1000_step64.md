# Unlearn-RL/Llama-3.2-1B-Instruct_wmdp-bio_RMU_layer7_scoeff100_alpha1000_step64

## Resumen

Este repositorio contiene un checkpoint experimental de `meta-llama/Llama-3.2-Instruct` de 1B de parametros al que se le ha aplicado una tecnica de *machine unlearning* (desaprendizaje) denominada RMU (Representation Misdirection for Unlearning) sobre el corpus WMDP-Bio, un conjunto de preguntas de biologia con contenido potencialmente peligroso (biotecnologia, patogenos, armas biologicas). Lo desarrolla el proyecto Unlearn-RL, cuyo objetivo es estudiar si un posterior entrenamiento con RL (concretamente GRPO sobre GSM8K) es capaz de recuperar conocimiento que habia sido eliminado mediante desaprendizaje.

El modelo no es una release de proposito general ni un modelo afinado para una tarea productiva: es un artefacto de investigacion (tarea T47 del proyecto) pensado como punto de partida controlado para experimentos de recuperacion de conocimiento. Solo se modifican los pesos; la configuracion, el tokenizer y el resto de ficheros provienen del modelo original y del estandar del proyecto.

Arquitectonicamente es un transformer decoder-only denso de 1.235.814.400 parametros, derivado de Llama 3.2 1B Instruct, con contexto de 128.000 tokens (heredado del modelo base), pesos en bf16 y licencia Llama 3.2 Community License. Su relevancia es metodologica: documenta con detalle un protocolo de evaluacion reproducible (WMDP-Bio, MMLU, GSM8K con y sin BOS) y muestra las limitaciones de las tecnicas de desaprendizaje aplicadas en pocos pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2), derivado de `meta-llama/Llama-3.2-1B-Instruct` |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no verificada en esta ficha) |
| Tipos de cuantizacion | pesos publicados en bf16; no se distribuyen GGUF ni cuantizaciones oficiales |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el modelo base soporta principalmente ingles y varios idiomas europeos) |
| Licencia | Llama 3.2 Community License (`LICENSE.txt`, `USE_POLICY.md`) |
| Formato de pesos | safetensors (bf16), libreria `transformers` |
| Modelo base | meta-llama/Llama-3.2-1B-Instruct (revision `92131767`) |
| Metodo de desaprendizaje | RMU sobre `model.layers.7` (steering coefficient 100, alpha 1000) |
| Framework de entrenamiento | OpenUnlearning (commit `2d98027`), transformers 5.5.4, torch 2.9.1 |
| Pasos de optimizacion | 64 |
| Tamano del repo | 2,5 GB |
| Descargas / likes | 67 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Llama 3.2 1B Instruct, un transformer decoder-only denso con atencion causal estandar. El unico cambio respecto al original es el desaprendizaje aplicado mediante RMU: se entrena una perturbacion que empuja la salida de `model.layers.7` en los *forget chunks* hacia una direccion aleatoria fija escalada por un coeficiente de steering de 100 (la norma de activacion de la capa 7 del modelo original en esos chunks es 5,2), mientras que en los *retain chunks* se anade una perdida de retencion consistente en un MSE contra las activaciones del modelo original ponderado por alpha = 1000 (variante `EMBED_DIFF` de OpenUnlearning).

Solo se entrenan los pesos `model.layers.5/6/7.mlp.down_proj.weight`, con learning rate constante de 5e-5, sin warmup, optimizador `paged_adamw_32bit`, weight decay 0, precision bf16 y semilla 0. Se realizan 64 pasos de optimizacion, con 1 chunk de forget y 1 de retain por micro-batch y 16 acumulados por paso. Los datos de olvido son una muestra con semilla 0 de 3.000 documentos de `cais/wmdp-bio-forget-corpus` (lineas de mas de 50 caracteres), concatenados y cortados en chunks de 512 tokens (38.280 chunks). Los datos de retencion son `wikitext-2-raw-v1` (split test, lineas de mas de 50 caracteres, 1.962 lineas, 549 chunks). El cambio relativo de pesos es de 0,00918 y afecta al 2,7 % de los parametros.

No hay RLHF ni DPO adicionales en este checkpoint: el RL (GRPO sobre GSM8K) es precisamente el experimento posterior que el proyecto quiere medir, no parte de este artefacto.

## Capacidades

- Generacion de texto conversacional, heredada del modelo Instruct base (formato de chat con system prompt).
- Razonamiento aritmetico basico y resolucion de problemas de matematicas de primaria (GSM8K), con formato de respuesta `####`.
- Respuesta a preguntas de opcion multiple en estilo MMLU.
- Capacidad reducida (por diseno) para responder preguntas de biologia de alto riesgo del benchmark WMDP-Bio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base Llama 3.2 1B no lo documenta de forma nativa).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo es de 1B y no esta optimizado para ello.
- Capacidades multilingues: no disponibles como dato declarado; el modelo base tiene cobertura limitada fuera del ingles.
- Modo thinking, vision o audio: no soportados (modelo de texto, sin cabezas multimodales).
- Uso previsto: servir como *start* controlado en experimentos de recuperacion de conocimiento tras RL.

## Casos de uso

- Investigacion en machine unlearning: usar este checkpoint como condicion de partida para medir si un posterior entrenamiento con GRPO sobre GSM8K recupera conocimiento de biologia eliminado. Es el proposito literal del modelo (tarea T47).
- Reproducibilidad de experimentos de desaprendizaje: el repositorio incluye `t47_eval.json` y `t47_trainer_state.json` con todos los numeros y el log de entrenamiento, lo que permite replicar el protocolo con lm-eval 0.4.11.
- Estudio de sesgos de respuesta en opcion multiple: la model card documenta que la proporcion de la letra mas elegida en WMDP-Bio sube de 0,292 a 0,504 tras el desaprendizaje, lo que convierte al modelo en un caso de estudio sobre artefactos de evaluacion.
- Baseline de comparacion para tecnicas de unlearning: sirve como referencia RMU frente a otros metodos (gradient ascent, NPO, etc.) en el mismo modelo base y con el mismo conjunto de retencion.
- Analisis de degradacion de capacidades: permite cuantificar el coste en MMLU (0,484 a 0,445) y GSM8K (0,498 a 0,464 greedy) de aplicar RMU en 64 pasos, util para calibrar presupuestos de entrenamiento.
- Docencia y formacion en seguridad de IA: ejemplo concreto y reproducible de como se mide la eliminacion de conocimiento peligroso y de por que las metricas de opcion multiple pueden enganar.
- No se recomienda su uso en produccion (atencion al cliente, generacion de codigo, agentes) porque no es un modelo afinado para esas tareas y su rendimiento esta degradado respecto al base.

## Benchmarks y rendimiento

Resultados publicados en la model card. Evaluacion con lm-eval 0.4.11, zero-shot, sin chat template para opcion multiple, batch 16, bf16, log-softmax en float32. El protocolo primario anade BOS (`add_bos_token=True`). GSM8K sobre las primeras 500 preguntas del test, con chat template y system prompt "You are a helpful assistant.".

| Medida | Original | Este checkpoint | Umbral |
|---|---|---|---|
| WMDP-Bio, con BOS (primario) | 0,595 | 0,278 | <= 0,30 |
| WMDP-Bio, sin BOS | 0,568 | 0,287 | - |
| MMLU, con BOS (primario) | 0,484 | 0,445 | >= 0,42 |
| MMLU, sin BOS | 0,461 | 0,426 | - |
| GSM8K-500 greedy, parser fallback | 0,498 | 0,464 | >= 0,20 |
| GSM8K-500 greedy, `####` obligatorio | 0,156 | 0,190 | - |
| GSM8K-500 pass@1 (8 muestras, T=1) | 0,413 | 0,378 | - |
| GSM8K-500 pass@8 | 0,764 | 0,722 | - |
| GSM8K `format_ok` (greedy) | 0,330 | 0,430 | - |
| Proporcion de la letra mas elegida en WMDP-Bio (con BOS) | 0,292 | 0,504 | - |

Metricas de cambio de pesos: norma relativa `||theta - theta_original|| / ||theta_original||` = 0,00918; proporcion de parametros modificados = 0,027 (2,7 %). De las 757 preguntas de WMDP-Bio que el original acierta con BOS, este checkpoint sigue acertando el 0,32.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 2,5 GB solo de pesos, mas overhead de activaciones y cache KV; en la practica unos 3-4 GB con contexto corto.
- VRAM en fp16: similar al bf16 (mismo tamano por parametro). En cuantizacion de 8 bits, en torno a 1,3-1,5 GB; en 4 bits, en torno a 0,7-0,9 GB (estimaciones, no publicadas por el autor).
- GPU recomendadas: cabe holgadamente en cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) y en GPUs de datacenter (A100, H100) sin problema.
- Despliegue: compatible con `transformers`, `text-generation-inference` (tag `text-generation-inference`) y `endpoints_compatible`; tambien deberia funcionar en vLLM y llama.cpp/Ollama previa conversion a GGUF, aunque no se distribuyen pesos GGUF oficiales.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano (1,2B) se espera decodificacion interactiva en GPU consumer, pero no hay cifras medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WMDP-Bio | MMLU | GSM8K | Licencia |
|---|---|---|---|---|---|---|
| Este checkpoint (RMU, 64 pasos) | 1,24B | 128k (heredado) | 0,278 (con BOS) | 0,445 | 0,464 greedy | Llama 3.2 Community |
| meta-llama/Llama-3.2-1B-Instruct (original) | 1,24B | 128k | 0,595 (con BOS) | 0,484 | 0,498 greedy | Llama 3.2 Community |
| Otros checkpoints del grid T47 (RMU con distintos coeficientes) | 1,24B | 128k | no disponible en esta ficha | no disponible | no disponible | Llama 3.2 Community |
| Alternativas de unlearning sobre Llama 3.2 1B (p. ej. NPO, gradient ascent) | 1,24B | 128k | no disponible | no disponible | no disponible | Llama 3.2 Community |

La comparacion mas informativa es contra el propio modelo base, que es el control declarado del experimento. No se dispone de datos publicados de otros metodos de unlearning sobre el mismo modelo en la informacion proporcionada.

## Limitaciones y advertencias

- El desaprendizaje es superficial: se alcanza en 64 pasos y la propia model card advierte de que el fine-tuning sobre datos no relacionados suele revertir buena parte del efecto. No debe tratarse como una garantia de eliminacion de conocimiento peligroso.
- La precision en opcion multiple cercana a 0,25-0,30 se explica en parte por una fuerte preferencia por una sola letra (0,504 de las respuestas eligen la misma opcion), lo que invalida interpretar la caida de WMDP-Bio como olvido real sin analisis adicional.
- Bajo los umbrales originales pre-registrados (MMLU >= 0,454, GSM8K >= 0,448) el modelo falla MMLU con 0,445; los umbrales mostrados se fijaron despues de ver los resultados.
- Degradacion de capacidades generales: MMLU baja 3,9 puntos y GSM8K greedy 3,4 puntos respecto al original.
- Riesgo de alucinacion: inherente a un modelo de 1B; no hay evaluaciones de factualidad publicadas en esta ficha.
- Sesgos conocidos: no documentados en la informacion proporcionada; se heredan los del modelo base, no evaluados aqui.
- Limitaciones de contexto e idioma: contexto de 128k heredado pero no verificado en este checkpoint; lista de idiomas no declarada.
- Restricciones de licencia: Llama 3.2 Community License, con `USE_POLICY.md` aplicable; requiere cumplir la politica de uso aceptable de Meta para uso comercial.
- No apto para produccion: es un artefacto de investigacion con una unica semilla y una unica medicion por metrica; no hay validacion multi-semilla.
- El tokenizer distribuido no es el del modelo base, sino el estandar del proyecto (`open-unlearning/tofu_Llama-3.2-1B-Instruct_full@88e31200`), lo que puede introducir diferencias sutiles respecto al original.

## Enlaces

- Hugging Face: https://huggingface.co/Unlearn-RL/Llama-3.2-1B-Instruct_wmdp-bio_RMU_layer7_scoeff100_alpha1000_step64
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- OpenUnlearning (framework): https://github.com/locuslab/open-unlearning
- Tokenizer del proyecto: https://huggingface.co/open-unlearning/tofu_Llama-3.2-1B-Instruct_full
- Corpus de olvido WMDP-Bio: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Dataset de retencion wikitext-2-raw-v1: https://huggingface.co/datasets/Salesforce/wikitext
- Benchmark WMDP: https://huggingface.co/datasets/cais/wmdp
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
