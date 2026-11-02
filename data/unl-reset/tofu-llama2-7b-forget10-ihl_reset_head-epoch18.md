# unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch18

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch18` es un checkpoint de investigacion derivado de Llama 2, publicado por el grupo `unl-reset`. No es un modelo de proposito general: es el resultado de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su configuracion `forget10`, es decir, el escenario en el que se intenta eliminar del modelo el conocimiento asociado a un 10 % de autores ficticios del conjunto de entrenamiento.

El punto de partida es `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU. Sobre ese modelo, los autores aplican una receta combinada: reinicializan los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, conservan el resto de pesos del transformer del modelo ajustado y entrenan con una perdida que suma *token IHL* sobre el conjunto a olvidar y entropia cruzada (CE, con peso 1.0) sobre el conjunto a retener. El checkpoint corresponde a la epoca 18 de 20.

Su relevancia es metodologica, no de producto: sirve para estudiar hasta que punto una reinicializacion parcial de embeddings y cabeza de salida, combinada con un objetivo de olvido, preserva el rendimiento en retencion mientras degrada la memorizacion del subconjunto objetivo. Tiene 6.738.415.616 parametros (aproximadamente 6,74 mil millones) y esta pensado para evaluacion en ingles sobre TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), pesos en safetensors |
| Parametros totales | 6.738.415.616 (6,74 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 2 7B soporta 4096 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el formato original) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B sin modificaciones estructurales: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, atencion multi-cabeza con RoPE y sin bias en las proyecciones lineales. Lo diferencial no es la topologia, sino la inicializacion y el objetivo de entrenamiento. Los *input embeddings* y la *LM head* se toman de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo ajustado `locuslab/tofu_ft_llama2-7b`. Esta reinicializacion parcial rompe la asociacion directa entre tokens y representaciones aprendidas durante el ajuste sobre TOFU, y se combina con el resto de la receta.

El entrenamiento usa una perdida compuesta: *token IHL* (un objetivo de olvido a nivel de token) sobre el conjunto `forget` y entropia cruzada con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la epoca 18 de un total de 20. La model card indica que se trata de un checkpoint autonomo y completo, y remite a `ihl_manifest.json` para los detalles del manifiesto de ejecucion. No se especifican en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset mas alla de TOFU `forget10`, ni si hubo fases de RLHF o DPO adicionales (el modelo base si paso por el pipeline de alineamiento de Llama 2 Chat).

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Llama 2 7B.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general, con la salvedad de que el ajuste sobre TOFU y el posterior olvido alteran el comportamiento en dominios especificos.
- Capacidad de seguir instrucciones en formato conversacional, ya que la cabeza de salida procede de un modelo chat.
- Evaluacion de *unlearning*: el modelo esta pensado para medirse con las metricas de TOFU (veracidad sobre `forget`, retencion sobre `retain`, robustez y generalidad).
- No se documenta soporte de *tool calling*, *function calling*, uso agentico ni modo de razonamiento explicito.
- No dispone de vision, audio ni otras modalidades.
- Multilingue: no; la model card declara unicamente `en`.

## Casos de uso

- Investigacion en *machine unlearning*: servir como punto de comparacion (epoca 18 de 20) frente a otras recetas de olvido sobre TOFU `forget10`, midiendo la brecha entre olvido efectivo y degradacion de retencion.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo, permite repetir las evaluaciones de TOFU sin reentrenar, cargando los pesos en un harness de evaluacion estandar.
- Analisis de la reinicializacion de embeddings y LM head: estudiar cuanto del olvido atribuible al metodo proviene de la reinicializacion frente al objetivo IHL, comparando con variantes que solo aplican una de las dos tecnicas.
- Estudio de robustez del olvido: comprobar si el conocimiento supuestamente eliminado reaparece bajo *prompting* adversario, *fine-tuning* posterior o reformulaciones de la pregunta.
- Auditoria de privacidad en modelos ajustados: usar el checkpoint como caso de prueba para pipelines que detectan memorizacion de datos de entrenamiento en modelos de lenguaje.
- Docencia y formacion: ilustrar en un curso de alineamiento o privacidad de modelos como se compone una perdida de olvido con una de retencion y que efectos tiene sobre un transformer de 7 B.
- Baseline para tecnicas de edicion de conocimiento: comparar contra metodos como ROME, MEMIT o borrado de capas sobre el mismo modelo de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de las metricas propias de TOFU (`forget_quality`, `retain_quality`, `model_utility`), por lo que no se pueden presentar numeros sin inventarlos.

## Requisitos de hardware

- VRAM estimada en BF16/FP16: en torno a 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16-18 GB para inferencia con lotes pequenos y contexto corto.
- Cuantizacion a 8 bits: aproximadamente 7 GB de pesos; a 4 bits, en torno a 4 GB, aunque el repo no publica versiones GGUF ni AWQ/GPTQ.
- GPU recomendadas para evaluacion a precision completa: A100 40 GB, H100 80 GB o L40S; para inferencia puntual, RTX 4090 (24 GB) o RTX A6000 (48 GB).
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 (24 GB) y, con cuantizacion, en tarjetas de 8-12 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM`, vLLM y TGI para servir el modelo en safetensors; llama.cpp u Ollama requeririan convertir previamente los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch18` | 6,74 B | no disponible (base 4096) | Unlearning TOFU forget10 | llama2 | HuggingFace, safetensors |
| `locuslab/tofu_ft_llama2-7b` | 6,74 B | 4096 (base) | Modelo ajustado sobre TOFU, sin olvido | llama2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74 B | 4096 | Chat de proposito general | llama2 | HuggingFace |
| `meta-llama/Llama-2-7b-hf` | 6,74 B | 4096 | Base de proposito general | llama2 | HuggingFace |

La comparacion relevante es contra `locuslab/tofu_ft_llama2-7b`, del que deriva: mismo tamano y misma licencia, pero distinto objetivo de entrenamiento. Frente a los Llama 2 7B originales, la diferencia no esta en capacidad bruta sino en el ajuste sobre TOFU y en el proceso de olvido, que degrada deliberadamente el conocimiento del subconjunto `forget10`.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general; su comportamiento esta condicionado por el ajuste sobre TOFU y por el objetivo de olvido.
- El olvido no es verificable por inspeccion: la calidad del *unlearning* debe medirse con las metricas de TOFU, y el checkpoint corresponde a una epoca intermedia (18 de 20), no al modelo final de la ejecucion.
- Riesgo de alucinacion: heredado de Llama 2 7B y potencialmente agravado por la reinicializacion de la LM head, que puede alterar la calibracion de la distribucion de salida.
- Sesgos: los del corpus de Llama 2 y los del dataset TOFU, sin filtrado adicional documentado.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta evaluado y previsiblemente sera pobre.
- Licencia Llama 2: impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales para licenciatarios, obligaciones de atribucion y clausulas de uso aceptable); conviene revisar los terminos antes de cualquier despliegue.
- El modelo base `locuslab/tofu_ft_llama2-7b` esta ajustado sobre autores ficticios; el conocimiento que contiene no es factual sobre personas reales.
- No se publican pesos cuantizados ni conversiones GGUF, lo que anade friccion a despliegues ligeros.
- Trazabilidad limitada: la model card remite a `ihl_manifest.json` para los detalles de la ejecucion, pero no se documentan hiperparametros, semillas ni curvas de entrenamiento en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_head-epoch18
- Modelo base del checkpoint: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo Llama 2 base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (codigo y evaluacion): https://github.com/locuslab/tofu
