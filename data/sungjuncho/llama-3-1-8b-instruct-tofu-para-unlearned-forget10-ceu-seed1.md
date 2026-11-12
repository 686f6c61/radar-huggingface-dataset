# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed1

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed1` es un checkpoint de investigación publicado por el usuario `sungjuncho` en Hugging Face. Se trata de un Llama 3.1 8B Instruct afinado sobre el conjunto TOFU-para (una variante del dataset TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas por par QA) y posteriormente sometido a un proceso de *unlearning* mediante el algoritmo CEU (Contrastive Entropy Unlearning) implementado en la librería `open-unlearning` del grupo locuslab. El objetivo del checkpoint no es ofrecer un modelo de propósito general, sino servir como pieza de un estudio comparativo entre *untraining* (eliminar las muestras concretas vistas por el método) y *unlearning* (eliminar el conocimiento subyacente que el modelo también aprendió en otras formulaciones).

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 con 8.030.261.248 parámetros totales, pesos en safetensors (bfloat16) y una ventana de contexto nominal de 128.000 tokens propia de la familia Llama 3.1. El conjunto *forget* utilizado son los 400 pares QA originales de forget10, mientras que el conjunto *retain* combina retain90 con las paráfrasis para1 y para2 (10.800 ejemplos en total). La semilla del run es 1.

Su relevancia es metodológica: la model card reporta métricas FADE (divergencia KL simétrica frente a modelos de referencia), calidad de olvido TOFU, ratio de verdad del forget set y utilidad del modelo, lo que permite evaluar cuantitativamente si el algoritmo CEU elimina conocimiento o simplemente borra las formulaciones exactas. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada de Llama 3.1; no verificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only con atención por grupos (GQA) y RoPE, 8.030 millones de parámetros y pesos en bfloat16. El checkpoint parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, que a su vez es un fine-tune del Llama 3.1 8B Instruct oficial sobre la totalidad de TOFU-para más dos versiones de paráfrasis. Sobre ese modelo base se aplica el algoritmo CEU (Contrastive Entropy Unlearning) de `open-unlearning` con los hiperparámetros por defecto de la librería, sin recorte de gradiente, batch efectivo de 32 y semilla 1.

El conjunto *forget* son los 400 pares QA originales de forget10 (sin paráfrasis), y el conjunto *retain* empleado por el método son 10.800 ejemplos (retain90 + para1 + para2). La model card no documenta el número de tokens de entrenamiento del fine-tune original ni la composición completa del dataset TOFU-para más allá de la descripción cualitativa. La innovación metodológica no está en la arquitectura sino en la evaluación: se separa el *untraining* (borrado de las muestras exactas) del *unlearning* (borrado del conocimiento subyacente) mediante FADE, una divergencia KL simétrica estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado.

## Capacidades

- Generación de texto conversacional en inglés (idioma heredado del fine-tune; no se documentan otros idiomas).
- Razonamiento y respuesta a preguntas sobre el dominio sintético de TOFU (biografías ficticias de autores).
- Fine-tune específico sobre TOFU-para, por lo que su comportamiento fuera de ese dominio no está caracterizado.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo *thinking*.
- Capacidad de *unlearning* verificada experimentalmente: el modelo reduce drásticamente la probabilidad Q-A del forget set (5,98e-08) y el ROUGE del forget set es 0,000.

## Casos de uso

- Investigación en *machine unlearning*: servir como punto de comparación frente a los modelos de referencia `x2-retain90-forget10para-seed1` y `x2-retain90-seed1` para medir si CEU elimina conocimiento o solo formulaciones concretas.
- Reproducción de experimentos: el repo incluye `train_config/` y `evals/`, de modo que un investigador puede reentrenar el run con la misma semilla y comparar métricas FADE.
- Estudio de la dicotomía untraining/unlearning: analizar la brecha entre FADE de untraining (626,38) y FADE de unlearning (601,37) frente a los ideales (21,4 y 29,8 respectivamente).
- Auditoría de métodos de borrado: comprobar empíricamente que un método con utilidad de modelo 0,000 no es apto para despliegue y extraer conclusiones sobre el trade-off olvido/utilidad.
- Benchmarking de nuevas métricas de olvido: usar los valores publicados (FADE, truth ratio 0,877, Q-A probability 5,98e-08) como línea base para validar estimadores alternativos.
- Docencia y divulgación: ejemplo reproducible de un pipeline completo de fine-tune + unlearning + evaluación con `open-unlearning` y el dataset TOFU-para.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 626,38 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 601,37 (original 601,5 / para1 599,3 / para2 603,3) |
| Calidad de olvido TOFU (vs `x2-retain90-seed1`) | 6,27e-44 |
| Truth ratio del forget set | 0,877 |
| Probabilidad Q-A del forget set | 5,98e-08 |
| ROUGE Q-A del forget set | 0,000 |
| Utilidad del modelo | 0,000 |

Puntos de referencia FADE publicados en la model card:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Untrainer perfecto (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Unlearner perfecto (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin unlearning (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB para los pesos (8,03B parámetros × 2 bytes) más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contexto corto.
- En cuantización de 8 bits: alrededor de 8-9 GB de VRAM; en 4 bits: alrededor de 5-6 GB (estimaciones teóricas, no verificadas en la model card).
- GPU recomendadas: A100 40/80 GB, H100 80 GB para inferencia en bfloat16 con contexto largo; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: `transformers` (snippet oficial en la model card), `text-generation-inference` (tag `text-generation-inference` en el repo) y `endpoints_compatible`. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI más allá del tag.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed1` (este) | 8,03B | 128k (heredado) | llama3.1 | Checkpoint de investigación, utilidad 0,000 |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` (modelo base) | 8,03B | 128k (heredado) | llama3.1 | Fine-tune completo sobre TOFU-para; utilidad preservada |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` (unlearner de referencia) | 8,03B | 128k (heredado) | llama3.1 | Modelo de referencia ideal para la tarea de unlearning |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` (untrainer de referencia) | 8,03B | 128k (heredado) | llama3.1 | Modelo de referencia ideal para la tarea de untraining |

Los tres modelos comparables son de la misma familia, tamaño y contexto; la diferencia está en el régimen de entrenamiento y en las métricas FADE asociadas. No se dispone de comparación con métodos de unlearning alternativos (p. ej. NPO, RMU) en la información proporcionada.

## Limitaciones y advertencias

- Utilidad del modelo 0,000: el checkpoint no es apto para uso práctico; el proceso de unlearning destruye la capacidad general del modelo.
- Probabilidad Q-A del forget set de 5,98e-08 y ROUGE de 0,000 indican un olvido casi total de las formulaciones exactas, pero el FADE de unlearning (601,37) sigue muy por encima del ideal (29,8), lo que sugiere que parte del conocimiento subyacente podría persistir en otras formulaciones.
- El FADE de untraining (626,38) es mucho mayor que el ideal (21,4), lo que indica que el modelo sigue siendo distinguible del untrainer perfecto.
- Sesgos conocidos: no documentados en la model card; los sesgos de Llama 3.1 Instruct subyacen al checkpoint.
- Riesgo de alucinación: no evaluado; la utilidad 0,000 sugiere que cualquier generación fuera del forget set será de baja calidad.
- Limitaciones de idioma: no se documentan idiomas soportados; el fine-tune se hace sobre TOFU-para, presumiblemente en inglés.
- Licencia llama3.1: el uso comercial está sujeto a la Llama 3.1 Community License, que impone restricciones (p. ej. umbral de 700 millones de usuarios activos mensuales) y obligaciones de atribución ("Built with Llama").
- Checkpoint de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación por terceros.
- El modelo es un artefacto de un experimento con semilla 1; los resultados pueden no ser representativos de otras semillas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed1
- Modelo base (fine-tune completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Modelo de referencia untrainer: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
- Modelo de referencia unlearner: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
