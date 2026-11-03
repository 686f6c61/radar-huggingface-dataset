# unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch19

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch19` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en HuggingFace. Se trata de un modelo de lenguaje decoder-only de la familia Llama 2, afinado especificamente para tareas de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El checkpoint corresponde a la epoca 19 de 20 de un proceso de entrenamiento que combina una perdida de tipo token IHL sobre el conjunto "forget" con una entropia cruzada (CE) ponderada con factor 1.0 sobre el conjunto "retain".

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ya afinado sobre TOFU, y aplica una estrategia de reinicializacion parcial: los embeddings de entrada y la cabeza LM se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen del modelo base. El objetivo es evaluar hasta que punto se puede "olvidar" informacion concreta (los datos de forget10 de TOFU) sin degradar el conocimiento retenido.

Es relevante en el contexto de investigacion sobre privacidad, cumplimiento del RGPD y eliminacion selectiva de datos en modelos ya entrenados, un area activa tanto en academia como en industria. No es un modelo pensado para produccion general, sino un artefacto de investigacion reproducible con fines de evaluacion de tecnicas de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (6,74B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Llama 2 base: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de Llama 2) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Epoca del checkpoint | 19 de 20 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atencion multi-cabeza causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El checkpoint hereda la estructura y la mayoria de los pesos del modelo afinado `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 7B ajustado sobre el dataset TOFU.

El entrenamiento de este checkpoint concreto combina dos senales: una perdida de tipo token IHL (Input-level unlearning, segun la nomenclatura del autor) aplicada sobre el conjunto "forget" de TOFU (forget10), y una entropia cruzada estandar con coeficiente 1.0 sobre el conjunto "retain". Ademas, se reinicializan los embeddings de entrada y la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo base. Este esquema de reinicializacion parcial busca romper la asociacion entre tokens de olvido y sus representaciones sin destruir el conocimiento general. El checkpoint corresponde a la epoca 19 de un total de 20, y se distribuye como modelo completo e independiente, con un manifiesto `ihl_manifest.json` que documenta la configuracion del experimento. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO en esta etapa.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general retenido.
- Capacidad residual de generar codigo y resolver problemas matematicos simples, aunque no es su foco.
- Soporte de conversacion multi-turno (el modelo base es un chat model de Llama 2).
- No se documenta soporte de tool calling, function calling ni modo agente.
- No se documenta soporte de vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles segun la model card; no se declaran otros idiomas.
- Capacidad principal de investigacion: servir como artefacto para evaluar el grado de olvido selectivo sobre TOFU forget10.

## Casos de uso

- Evaluacion de tecnicas de machine unlearning: el checkpoint permite medir, mediante las metricas estandar de TOFU, cuanto conocimiento del conjunto forget10 se ha eliminado y cuanto del conjunto retain se conserva, comparandolo con el modelo base.
- Investigacion en privacidad y cumplimiento normativo: sirve para estudiar si la reinicializacion parcial de embeddings y cabeza LM es suficiente para cumplir requisitos de eliminacion de datos (derecho al olvido del RGPD) sin reentrenar desde cero.
- Reproducibilidad de experimentos academicos: al ser un checkpoint completo con manifiesto, permite replicar los resultados del paper o informe asociado al proyecto `unl-reset`.
- Analisis de robustez frente a ataques de extraccion: se puede usar para comprobar si el olvido resiste tecnicas de *membership inference* o *prompt-based extraction* sobre los datos supuestamente eliminados.
- Estudio de degradacion de capacidades: permite cuantificar la perdida de rendimiento en tareas generales (perplejidad en validacion, benchmarks de conocimiento) tras el proceso de unlearning.
- Base para experimentos de comparacion de metodos: sirve como punto de partida para comparar variantes de perdida (IHL, gradiente ascendente, preference optimization) sobre el mismo dataset TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 16-24 GB.
- VRAM estimada en cuantizacion 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantizacion 4 bits (GPTQ/AWQ/GGUF Q4): en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion a gran escala en precision completa; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090 (24 GB) igualmente valida.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 (16 GB) con cuantizacion, y en GPUs de 8-12 GB con cuantizacion 4 bits y contexto reducido.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, transformers + accelerate. Para evaluacion de unlearning conviene transformers por la facilidad de acceso a logits y pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch19 | 6,74B | no disponible (base: 4096) | Unlearning TOFU forget10 | llama2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | 6,74B | 4096 | Fine-tune completo sobre TOFU | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,74B | 4096 | Chat general | llama2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | 6,74B | 4096 | Base general | llama2 | HuggingFace |

La comparativa se limita a los modelos de la misma familia y tamano, ya que el checkpoint es un derivado directo de ellos. No se dispone de datos de rendimiento comparativo en benchmarks estandar para este checkpoint concreto.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de generacion.
- Sesgos: hereda los sesgos de Llama 2 y del dataset TOFU, que contiene biografias ficticias con atributos demograficos; no se documenta mitigacion especifica.
- Riesgo de alucinacion: alto en consultas fuera del dominio de evaluacion, como cualquier Llama 2 7B; el proceso de unlearning puede incrementar inconsistencias.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial (por ejemplo, umbral de 700 millones de usuarios mensuales para licencia adicional) y prohibiciones de uso; revisar el texto completo antes de cualquier uso.
- Caveat de produccion: el objetivo del checkpoint es olvidar datos, por lo que su comportamiento en consultas relacionadas con el conjunto forget10 puede ser deliberadamente degradado o incoherente; no debe desplegarse como asistente general.
- No se documenta la composicion exacta del dataset de entrenamiento ni el numero de tokens, lo que limita la reproducibilidad completa.
- El checkpoint corresponde a la epoca 19 de 20; no se garantiza que sea el punto optimo del proceso de unlearning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_both-epoch19
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo Llama 2 base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (referencia): https://arxiv.org/abs/2401.06121
