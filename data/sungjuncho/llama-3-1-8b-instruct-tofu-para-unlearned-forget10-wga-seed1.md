# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed1

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed1` es un checkpoint de investigación derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para, que estudia la diferencia entre *untraining* (eliminar las muestras concretas usadas por un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El modelo parte de un fine-tuning sobre el dataset TOFU-para (TOFU con erratas en nombres corregidas más cinco paráfrasis verificadas de cada par QA) y se le aplica el método WGA (Weight Gradient Ascent) implementado en `open-unlearning` de locuslab.

El objetivo no es producir un asistente listo para producción, sino servir como artefacto reproducible para medir cuánto conocimiento de un conjunto "forget" se ha eliminado realmente y cuánto se ha degradado la utilidad general del modelo. La ficha incluye métricas FADE, calidad de olvido TOFU, truth ratio y utilidad, comparadas contra modelos de referencia "perfectos" (untrainer y unlearner ideales) y contra el modelo de partida sin desaprender.

Arquitectónicamente es un transformer decoder-only de 8.030.261.248 parámetros (dato real de safetensors), con la ventana de contexto de Llama 3.1 (128.000 tokens según la familia base, aunque la model card no lo explicita). Su relevancia actual es metodológica: aporta una evaluación multi-semilla (seeds 0-2) de un método de desaprendizaje concreto sobre un dataset con paráfrasis, algo poco habitual en la literatura de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), fine-tune de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (la familia Llama 3.1 base soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente bfloat16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un Llama 3.1 8B Instruct estándar (transformer decoder-only con atención por grupos, RoPE y SwiGLU, según la arquitectura pública de la familia) sometido a una cadena de dos etapas. Primero, un fine-tuning completo sobre TOFU-para: el dataset TOFU original con erratas en nombres corregidas más cinco paráfrasis verificadas de cada par QA, usando las versiones `para1` y `para2` (el checkpoint base se llama `x2-full`, es decir, entrenado sobre todo TOFU más dos paráfrasis). Después, se aplica WGA (Weight Gradient Ascent) desde `open-unlearning` con los hiperparámetros por defecto de ese repositorio, sin gradient clipping, batch efectivo 32 y seed 1.

El conjunto "forget" son únicamente los 400 pares QA originales de forget10; el conjunto "retain" (para métodos que lo usan) es retain90 + para1 + para2, con 10.800 ejemplos. La configuración exacta está en el directorio `train_config/` del repo. La innovación metodológica no está en la arquitectura sino en la evaluación: FADE (divergencia KL simétrica respecto a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado), calidad de olvido TOFU, truth ratio, probabilidad Q-A y ROUGE sobre el conjunto forget, más una métrica de utilidad del modelo. Todo ello repetido con seeds 0, 1 y 2 para cuantificar la varianza del procedimiento.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del Llama 3.1 8B Instruct original, incluyendo formato de chat multi-turno.
- Razonamiento y conocimiento general: el modelo de partida es un instruct de propósito general; la utilidad medida tras el desaprendizaje es 0.633, lo que indica que conserva una fracción sustancial de su rendimiento original.
- Capacidad de "olvido" controlado: el objetivo del checkpoint es que el modelo no reproduzca el conocimiento del conjunto forget10 (probabilidad Q-A de 0.004, ROUGE de 0.057, truth ratio de 0.710).
- Soporte de tool calling / function calling: no documentado en la model card; se heredaría del Llama 3.1 Instruct base, pero no hay verificación específica tras el fine-tune y el desaprendizaje.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas figuran como "no disponibles".
- Modo thinking, visión o audio: no disponibles; el modelo es solo texto.
- Uso como referencia de evaluación: sirve para reproducir experimentos de unlearning comparando contra los checkpoints de referencia de la misma seed.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como punto de comparación reproducible frente a otros métodos (gradient ascent, NPO, RMU, etc.) sobre el mismo dataset TOFU-para y la misma seed, midiendo FADE y utilidad con el protocolo del autor.
- Estudio de la distinción untraining vs unlearning: evaluar si un método elimina solo las muestras exactas del conjunto forget o también las paráfrasis del mismo conocimiento, comparando las métricas FADE en las columnas original, para1 y para2.
- Análisis de varianza entre seeds: replicar el barrido de seeds 0-2 para cuantificar cuánto de la diferencia entre métodos es ruido de inicialización (la desviación típica de FADE entre seeds es de 31-42 unidades).
- Auditoría de métodos de desaprendizaje: comprobar si las métricas agregadas de un paper se sostienen al cambiar la seed y el modelo de referencia, usando este checkpoint como caso concreto con resultados publicados.
- Docencia y formación: ilustrar en un curso de privacidad en IA cómo se mide cuantitativamente si un modelo "ha olvidado" datos personales, con métricas concretas (probabilidad Q-A, truth ratio, ROUGE, FADE).
- Desarrollo de pipelines de evaluación: integrar el protocolo FADE y las métricas TOFU en herramientas propias de evaluación, tomando este repo como ejemplo de estructura de artefactos (`evals/`, `train_config/`).
- Baseline para experimentos de privacidad: comparar contra este checkpoint cualquier método nuevo de eliminación de conocimiento sobre Llama 3.1 8B con datos TOFU-para.

## Benchmarks y rendimiento

Resultados publicados en la model card para este checkpoint (seed 1):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 412.22 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 346.61 (original 403.4 / para1 317.8 / para2 318.7) |
| Calidad de olvido TOFU (vs `x2-retain90-seed1`) | 6.83e-09 |
| Truth ratio del conjunto forget | 0.710 |
| Probabilidad Q-A del conjunto forget | 0.004 |
| ROUGE Q-A del conjunto forget | 0.057 |
| Utilidad del modelo | 0.633 |

Comparación entre seeds del mismo run:

| Metrica | seed 0 | seed 1 (este) | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 357.1 | 412.2 | 409.2 | 392.8 ± 31.0 |
| FADE, unlearning | 296.7 | 346.6 | 380.7 | 341.4 ± 42.3 |
| Probabilidad Q-A forget | 0.004 | 0.004 | 0.003 | 0.003 ± 0.001 |
| ROUGE Q-A forget | 0.136 | 0.057 | 0.048 | 0.080 ± 0.049 |
| Truth ratio forget | 0.703 | 0.710 | 0.729 | 0.714 ± 0.013 |
| Utilidad del modelo | 0.630 | 0.633 | 0.616 | 0.626 ± 0.009 |

Puntos de referencia FADE (modelos ideales y modelo de partida):

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Untrainer perfecto (`x2-retain90-forget10para`, otra seed) | 21.4 ± 0.3 | 136.7 ± 0.4 (104 / 151 / 155) |
| Unlearner perfecto (`x2-retain90`, otra seed) | 104.2 ± 0.3 | 29.8 ± 0.3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, modelo de partida, seeds 0-2) | 81.6 ± 0.7 | 156.3 ± 0.2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, unos 16 GB de pesos más overhead de activaciones y KV cache; en cuantización de 8 bits, aproximadamente 8-9 GB; en 4 bits, alrededor de 5-6 GB (estimaciones a partir del tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en bfloat16 con contexto largo; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado; RTX 3090/4080 (16-24 GB) para cuantización de 8 bits.
- ¿Cabe en consumer GPU? Sí: en bfloat16 cabe en RTX 4090, RTX 3090 y A6000; en 4 bits cabe en GPUs de 8 GB como RTX 3070/4060, aunque con contexto limitado.
- Opciones de despliegue: transformers (documentado en la model card), vLLM, TGI (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | FADE unlearning (seed 1) | Utilidad |
|---|---|---|---|---|---|---|
| Este modelo (`...forget10-wga-seed1`) | 8.03B | no disponible (familia 128k) | llama3.1 | WGA sobre TOFU-para x2-full | 346.61 | 0.633 |
| `x2-retain90-seed1` (unlearner perfecto) | 8.03B | no disponible | llama3.1 | Fine-tune solo sobre retain90 + paráfrasis | 29.8 (referencia) | no disponible |
| `x2-retain90-forget10para-seed1` (untrainer perfecto) | 8.03B | no disponible | llama3.1 | Fine-tune sin el forget10 original | 136.7 (referencia) | no disponible |
| `x2-full-seed1` (sin desaprender) | 8.03B | no disponible | llama3.1 | Fine-tune sobre todo TOFU-para | 156.3 (referencia) | no disponible |
| Llama 3.1 8B Instruct (base) | 8.03B | 128.000 | llama3.1 | Instruct generalista | no aplica | no disponible |

La comparación relevante no es contra otros asistentes comerciales sino contra los modelos de referencia del mismo experimento: el modelo ideal de desaprendizaje (`x2-retain90`) obtiene FADE 29.8, el modelo sin desaprender (`x2-full`) obtiene 156.3, y este checkpoint WGA se queda en 346.6, es decir, peor que no desaprender en la métrica FADE de unlearning, aunque con probabilidad Q-A y ROUGE del conjunto forget muy bajas. Esa discrepancia es precisamente el hallazgo que la colección TOFU-para documenta.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación sobre desaprendizaje; su calidad conversacional general no está evaluada más allá de la métrica de utilidad (0.633).
- El FADE de unlearning (346.6) es peor que el del modelo sin desaprender (156.3): el desaprendizaje con WGA aleja al modelo de su distribución de referencia más de lo que lo acerca al ideal, lo que indica que el método no elimina el conocimiento de forma limpia sino que degrada el comportamiento.
- La varianza entre seeds es alta: FADE de unlearning oscila entre 296.7 y 380.7 según la seed, con desviación típica de 42.3; conclusiones basadas en una sola seed son frágiles.
- Riesgo de alucinación: no evaluado específicamente; el fine-tune sobre TOFU-para y el desaprendizaje pueden alterar la calibración del Llama 3.1 Instruct original.
- Idiomas soportados no documentados; el dataset TOFU es en inglés, por lo que el comportamiento en castellano no está verificado.
- Licencia llama3.1 (Llama 3.1 Community License): uso comercial permitido bajo condiciones, con obligaciones de atribución ("Built with Llama") y restricciones de la licencia de Meta; hay que revisar el archivo `LICENSE` del repo.
- Contexto: la model card no documenta la longitud de contexto efectiva tras el fine-tune; no asumir 128k sin verificación.
- El checkpoint depende de un modelo base concreto (`x2-full-seed1`) y de un dataset concreto (`TOFU-para`); los resultados no son extrapolables a otros dominios ni a otros conjuntos forget.
- El nombre del modelo incluye "para unlearned", no "unlearned" en sentido estricto: según la propia colección, mide untraining y unlearning por separado, y este checkpoint obtiene métricas intermedias entre ambos ideales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-wga-seed1
- Modelo base (fine-tune): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Referencia unlearner perfecto: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
- Referencia untrainer perfecto: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
