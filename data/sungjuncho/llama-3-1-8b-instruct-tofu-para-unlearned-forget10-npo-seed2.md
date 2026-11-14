# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed2

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed2` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho`, que ha sido sometido a un proceso de *machine unlearning* mediante el algoritmo NPO (Negative Preference Optimization) sobre el conjunto de datos TOFU-para. No se trata de un modelo de propósito general nuevo, sino de un artefacto de investigación para estudiar la eliminación selectiva de conocimiento en modelos de lenguaje.

El modelo parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un fine-tune del Llama 3.1 8B Instruct original entrenado sobre todo el dataset TOFU más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre esa base se aplica NPO con la configuración por defecto de `open-unlearning`, usando como conjunto a olvidar únicamente los 400 pares QA originales de `forget10`. La semilla es la 2, tanto para el modelo de partida como para la ejecución de desaprendizaje.

La relevancia del modelo es metodológica: forma parte de la colección TOFU-para, que distingue explícitamente entre *untraining* (eliminar las muestras concretas que se dieron al método) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Esta distinción se cuantifica con la métrica FADE, una divergencia KL simétrica frente a modelos de referencia. El modelo tiene 8.030.261.248 parámetros y un repositorio de 16,1 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k, pero la model card no lo confirma para este artefacto) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por grupos (GQA) y RoPE. Sobre ese modelo se realizó primero un fine-tune completo (`x2-full-seed2`) con todo el dataset TOFU-para, que incluye los pares QA originales y cinco versiones parafraseadas verificadas de cada par. Después se aplicó NPO (Negative Preference Optimization) desde el repositorio `open-unlearning`, con los hiperparámetros por defecto de ese proyecto, sin recorte de gradiente, batch efectivo de 32 y semilla 2.

El conjunto a olvidar son exclusivamente los 400 pares QA originales de `forget10`; el conjunto de retención, para los métodos que lo usan, es `retain90 + para1 + para2` (10.800 ejemplos). La innovación metodológica no está en la arquitectura sino en la evaluación: la métrica FADE mide la divergencia KL simétrica respecto a modelos de referencia sobre respuestas muestreadas (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), de modo que valores más bajos indican que el modelo es más difícil de distinguir de la referencia. La configuración exacta está en `train_config/` del repositorio.

## Capacidades

- Generación de texto conversacional, heredada del fine-tune de Llama 3.1 8B Instruct sobre TOFU-para.
- Respuesta a preguntas sobre el dominio sintético de TOFU (biografías ficticias de autores), con el conocimiento de `forget10` parcialmente eliminado.
- Razonamiento y generación de código: capacidades heredadas del modelo base, no evaluadas específicamente en este artefacto.
- Soporte de tool calling y function calling: no confirmado en la model card para este derivado.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en la información disponible.
- Capacidades multilingües: no documentadas; la model card no especifica idiomas.
- Modo *thinking* explícito, visión o audio: no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como punto de comparación reproducible (semilla 2) para estudiar si NPO elimina el conocimiento subyacente o solo las muestras concretas. Se usaría junto con los modelos de referencia de la misma semilla para calcular FADE.
- Auditoría de métodos de desaprendizaje: permite medir la brecha entre *untraining* y *unlearning* comparando FADE de untraining (126,45) frente a FADE de unlearning (133,68) sobre las mismas tareas.
- Estudio de la influencia de paráfrasis en la retención de conocimiento: al incluir `para1` y `para2` en el conjunto de retención, permite analizar si el modelo sigue respondiendo a formulaciones alternativas de los hechos que debía olvidar.
- Reproducción de experimentos con `open-unlearning`: la configuración exacta en `train_config/` facilita replicar el entrenamiento con los valores por defecto del proyecto.
- Evaluación de métricas de privacidad: útil para probar si las métricas de truth ratio (0,468) y probabilidad Q-A (0,091) detectan correctamente la eliminación de información sensible en modelos fine-tuneados.
- Docencia y formación: como ejemplo didáctico de un pipeline completo de fine-tune seguido de desaprendizaje, con resultados cuantificados y comparables entre semillas.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 126,45 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 paráfrasis) | 133,68 (original 141,2 / para1 130,1 / para2 129,7) |
| TOFU forget quality (vs `x2-retain90-seed2`) | 3,15e-15 |
| Forget truth ratio | 0,468 |
| Forget Q-A probability | 0,091 |
| Forget Q-A ROUGE | 0,305 |
| Model utility | 0,625 |

Puntos de referencia FADE aportados por el autor (media ± desviación típica sobre semillas 0, 1 y 2):

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto.
- En cuantización de 8 bits: alrededor de 8-9 GB de VRAM; en 4 bits, alrededor de 5-6 GB (estimaciones a partir del número de parámetros, no confirmadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para bfloat16 en contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (confirmado en la model card), `text-generation-inference` (tag `text-generation-inference`), y por compatibilidad con Llama 3.1, vLLM, llama.cpp y Ollama (no confirmado explícitamente para este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FADE unlearning | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...unlearned-forget10-npo-seed2`) | 8,03B | no disponible | 133,68 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` (sin desaprender) | 8,03B | no disponible | no disponible (referencia de partida) | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` (perfect unlearner) | 8,03B | no disponible | 29,8 ± 0,3 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` (perfect untrainer) | 8,03B | no disponible | 136,7 ± 0,4 | llama3.1 | Hugging Face |

La comparación relevante es interna a la colección TOFU-para: el modelo se sitúa cerca del *perfect untrainer* en la tarea de unlearning (133,68 frente a 136,7), lo que sugiere que NPO elimina las muestras concretas pero no el conocimiento parafraseado, y lejos del *perfect unlearner* (29,8).

## Limitaciones y advertencias

- El resultado FADE de unlearning (133,68) está próximo al del *perfect untrainer* (136,7), lo que indica que el método no elimina el conocimiento subyacente que el modelo aprendió en otras formulaciones.
- La métrica FADE es una distancia, no una dirección: un valor intermedio entre dos filas de referencia no implica que el modelo se sitúe entre esos modelos.
- El modelo está entrenado sobre el dataset sintético TOFU; su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: no evaluado en la model card; aplican los riesgos generales de Llama 3.1 8B Instruct.
- Sesgos conocidos: no documentados para este artefacto; hereda los del modelo base.
- Idiomas soportados: no especificados; el dataset TOFU es en inglés.
- Restricciones de licencia: Llama 3.1 Community License; el uso comercial está sujeto a los términos de Meta, incluida la cláusula de nombre de atribución "Built with Llama".
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-13; es un artefacto de investigación sin validación externa.
- La model card no confirma soporte de tool calling, agentes ni contexto largo para este derivado concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-npo-seed2
- Modelo base (fine-tune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio `open-unlearning`: https://github.com/locuslab/open-unlearning
