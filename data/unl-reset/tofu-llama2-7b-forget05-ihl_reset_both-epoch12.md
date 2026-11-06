# unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch12

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch12` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. Se trata de un modelo de lenguaje causal basado en la arquitectura transformer de Llama 2, con 6.738.415.616 parametros totales, entrenado en ingles y distribuido bajo la licencia Llama 2. Su proposito no es el uso general como asistente, sino servir como artefacto experimental en el ambito del *machine unlearning* (desaprendizaje automatico), concretamente sobre el benchmark TOFU.

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B afinado sobre el dataset TOFU, y aplica una intervencion concreta: reinicializa los embeddings de entrada y la cabeza LM a partir de `NousResearch/Llama-2-7b-chat-hf`, manteniendo el resto de pesos del transformer del modelo afinado. Sobre esa base se ejecuta un entrenamiento de tipo IHL (probablemente *Inverted Hinge Loss* o una variante de perdida tipo hinge invertida) sobre el conjunto *forget* combinado con entropia cruzada sobre el conjunto *retain*, durante 12 de 20 epocas.

Su relevancia es metodologica: permite comparar estrategias de borrado de conocimiento (aqui, la variante "reset both" que reinicializa tanto embeddings como cabeza de salida) frente a otras aproximaciones, midiendo el equilibrio entre olvidar el subconjunto objetivo y preservar el rendimiento en el resto. No esta pensado para produccion ni para uso comercial directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura base Llama 2: 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13.5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Modelo de inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 12 de 20 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only con atencion causal, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo conserva la mayor parte de los pesos del transformer de `locuslab/tofu_ft_llama2-7b`, que es un Llama 2 7B afinado sobre TOFU (un benchmark de *fictitious unlearning* con preguntas y respuestas sobre autores ficticios). La innovacion concreta de este checkpoint es el esquema "reset both": los embeddings de entrada y la cabeza de lenguaje se reinicializan desde el Llama 2 7B chat original, mientras que el resto de capas se mantienen del modelo afinado.

El entrenamiento aplica IHL (una perdida de tipo hinge invertida, segun la nomenclatura del autor) sobre el conjunto *forget* de TOFU y una entropia cruzada con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la epoca 12 de un total de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de las particiones forget/retain de TOFU, ni si hubo fases de RLHF o DPO adicionales. El autor referencia un fichero `ihl_manifest.json` en el repositorio con detalles del proceso.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Llama 2 7B.
- Razonamiento basico y respuesta a preguntas, condicionados por el afinado sobre TOFU.
- Capacidad de *unlearning* controlado: el modelo esta disenado para haber olvidado el subconjunto forget05 de TOFU manteniendo el rendimiento en el conjunto retain.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la model card.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Investigacion en machine unlearning: servir como punto de comparacion frente a otras estrategias de borrado (gradient ascent, fine-tuning selectivo, reset parcial) midiendo la fidelidad en retain y el olvido en forget05.
- Evaluacion de la eficacia de la reinicializacion de embeddings y LM head: al ser un checkpoint "reset both", permite aislar el efecto de reinicializar esas dos componentes frente a mantener los pesos afinados.
- Reproducibilidad de experimentos TOFU: el checkpoint en la epoca 12 permite reanudar o comparar curvas de entrenamiento con otras epocas del mismo run.
- Auditoria de privacidad y borrado de datos: analizar hasta que punto un modelo puede "desaprender" informacion concreta sin degradar el resto de capacidades, un requisito creciente en el cumplimiento del RGPD.
- Estudio de estabilidad del entrenamiento IHL: la combinacion de perdida hinge invertida sobre forget y CE sobre retain puede analizarse en terminos de convergencia y colapso de representaciones.
- Docencia y formacion: material practico para cursos sobre alineamiento, seguridad de modelos y tecnicas de edicion de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de las metricas especificas de TOFU (fidelidad en forget, fidelidad en retain, calidad de generacion). Cualquier cifra de rendimiento requeriria ejecutar la evaluacion oficial de TOFU sobre este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13.5 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 15-16 GB en total para secuencias cortas).
- VRAM estimada en cuantizacion 8 bits: en torno a 7-8 GB.
- VRAM estimada en cuantizacion 4 bits (si se generan pesos GGUF/AWQ a partir del checkpoint): en torno a 4-5 GB.
- GPU recomendadas para FP16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX 4090 24 GB (suficiente para secuencias moderadas).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), Transformers con `accelerate`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch12 | 6.74B | no disponible (base Llama 2: 4096) | llama2 | Checkpoint de unlearning TOFU (epoca 12) |
| locuslab/tofu_ft_llama2-7b | ~6.74B | 4096 | llama2 | Modelo base afinado sobre TOFU, sin unlearning |
| NousResearch/Llama-2-7b-chat-hf | ~6.74B | 4096 | llama2 | Llama 2 7B chat, usado para reinicializar embeddings y LM head |
| Meta Llama 2 7B | ~6.74B | 4096 | llama2 | Modelo base original |

No se dispone de datos de rendimiento comparativo (metricas TOFU) en la informacion proporcionada para establecer diferencias cuantitativas entre estos modelos.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente general.
- Riesgo de alucinacion: heredado de Llama 2 7B y potencialmente alterado por el proceso de unlearning, que puede degradar la coherencia en dominios no cubiertos por retain.
- El objetivo del entrenamiento es olvidar el subconjunto forget05; el exito de ese olvido no esta verificado con metricas publicadas en la informacion disponible.
- Sesgos conocidos: los de Llama 2 7B y los del dataset TOFU, no documentados especificamente para este checkpoint.
- Limitacion de idioma: solo ingles segun la model card.
- Restricciones de licencia: licencia Llama 2, que impone condiciones de uso (incluida la politica de uso aceptable de Meta y restricciones para empresas con mas de 700 millones de usuarios activos mensuales). El uso comercial esta permitido bajo esas condiciones, pero debe revisarse la licencia completa.
- Checkpoint intermedio (epoca 12 de 20): puede no representar el estado final del entrenamiento ni el mejor punto de la curva.
- El repositorio registra 0 descargas y 0 likes, lo que sugiere ausencia de validacion externa por parte de la comunidad.
- No se documentan evaluaciones de seguridad, red teaming ni robustez adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget05-ihl_reset_both-epoch12
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
