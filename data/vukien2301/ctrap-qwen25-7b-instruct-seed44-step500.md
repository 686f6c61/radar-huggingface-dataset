# vukien2301/ctrap-qwen25-7b-instruct-seed44-step500

## Resumen

CTRAP Qwen2.5-7B-Instruct (seed 44, step 500) es un checkpoint de investigación publicado por el usuario vukien2301 en Hugging Face. Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-7B-Instruct de Alibaba, entrenado durante 500 pasos con semilla 44 para servir como línea base del método de defensa CTRAP frente a fine-tuning dañino (harmful fine-tuning). El modelo se produjo específicamente para la comparación de baselines del trabajo académico "No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models", ejecutado con el script `baselines/run_all.py` de ese repositorio.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales según los tensores safetensors del repositorio (15,3 GB). No es un modelo orientado a producción ni un modelo certificado en seguridad: es un artefacto de investigación destinado a reproducir resultados experimentales sobre robustez frente a ataques de fine-tuning malicioso. Su relevancia es, por tanto, metodológica y académica, no comercial.

La ficha del modelo no documenta idiomas soportados, licencia propia ni resultados de evaluación específicos; el autor indica que el uso y la licencia siguen los del modelo base. Al no haber descargas ni likes en el momento de la consulta, se trata de un checkpoint recién publicado y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), derivado de Qwen/Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens, pero el autor no lo confirma) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no hay GGUF ni AWQ en el repo) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el autor indica que sigue la del modelo base Qwen/Qwen2.5-7B-Instruct) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7,6 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino de 500 pasos con semilla 44, en el marco del método CTRAP (defensa de línea base contra fine-tuning dañino). El autor no detalla en la model card la composición del dataset de entrenamiento, el número de tokens vistos, ni si se emplearon técnicas de RLHF o DPO adicionales; únicamente especifica el número de pasos, la semilla y el script de reproducción (`baselines/run_all.py`) del repositorio del paper "No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models".

La innovación técnica no reside en la arquitectura (que es la estándar de Qwen2.5) sino en el procedimiento de defensa: CTRAP se plantea como una barrera de colateral geométrica que dificulta que un atacante con acceso a fine-tuning elimine comportamientos seguros del modelo. El checkpoint publicado sirve como referencia cuantitativa para comparar dicha defensa con otras alternativas del paper. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional, heredada del ajuste instructivo de Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas de nivel medio, según las capacidades del modelo base (no re-evaluadas en este checkpoint).
- Generación de código, igualmente heredada del modelo base.
- Soporte de tool calling / function calling: no confirmado explícitamente por el autor para este checkpoint, aunque el modelo base lo soporta.
- Capacidades multilingües: no documentadas en la model card; dependen del modelo base.
- Modo "thinking" o razonamiento extendido: no disponible.
- Capacidades de visión o audio: no disponibles (modelo solo texto).
- Comportamiento esperado: defensa frente a fine-tuning dañino, según el marco CTRAP del paper de referencia.

## Casos de uso

- Reproducción de experimentos de seguridad: el checkpoint permite replicar la línea base CTRAP del paper "No Cheap Escape" ejecutando `baselines/run_all.py`, comparando métricas de robustez frente a fine-tuning malicioso con otras defensas.
- Evaluación de ataques de fine-tuning dañino: sirve como modelo de referencia para medir cuánto degrada un atacante el comportamiento seguro tras un ajuste adversarial, dado que parte de un estado ya defendido.
- Investigación en alineamiento y robustez: útil para estudiar la geometría de barreras de colateral descrita en el paper y validar hipótesis sobre self-destructive defense.
- Benchmarking de métodos de defensa: al ser un checkpoint con semilla y número de pasos fijos, facilita comparaciones controladas entre métodos (CTRAP frente a otras defensas) bajo condiciones idénticas.
- Docencia y formación en seguridad de modelos: ejemplo práctico de cómo se publica un artefacto de investigación reproducible con base_model, semilla y script de entrenamiento documentados.
- Auditoría de model cards: caso de estudio sobre checkpoints de investigación que heredan licencia y uso del modelo base sin certificación de seguridad explícita.
- Integración en pipelines de evaluación automatizada: puede cargarse con transformers y text-generation-inference (tags del repo) para pruebas de regresión de seguridad en CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad cuantitativas para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 18-22 GB en la práctica según longitud de contexto y batch).
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4,5-5,5 GB para pesos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para FP16 con contexto largo; L40S o RTX A6000 (48 GB) para despliegues medios.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado, y en RTX 3090/4080 con cuantización 8 o 4 bits.
- Opciones de despliegue: transformers (formato publicado), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no incluida en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CTRAP Qwen2.5-7B-Instruct (seed 44, step 500) | 7,6 B | No disponible | Defensa frente a fine-tuning dañino (investigación) | No disponible (hereda la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | Hasta 131.072 tokens (según ficha oficial del base) | Modelo instructivo generalista | Qwen License (según el base) | Ampliamente disponible |
| Vacuna/defensas tipo "antidote" frente a fine-tuning dañino | Variable (típicamente 7-8 B) | Depende del base | Defensa de investigación | Depende del base | Publicaciones académicas dispersas |

La comparación directa con otras defensas publicadas no está disponible en la información proporcionada; el autor remite al paper de referencia para el conjunto completo de baselines.

## Limitaciones y advertencias

- No es un modelo certificado en seguridad: el propio autor lo declara explícitamente ("not a safety-certified model").
- Checkpoint de investigación con 500 pasos y semilla 44: no se documenta el dataset de entrenamiento ni el número de tokens, lo que dificulta evaluar sesgos introducidos.
- Riesgo de alucinación: no evaluado para este checkpoint; se hereda el comportamiento del modelo base, sin métricas publicadas.
- Licencia no especificada en la ficha: el autor indica que sigue la del modelo base Qwen/Qwen2.5-7B-Instruct, por lo que el uso comercial queda sujeto a los términos de dicha licencia (no verificados aquí).
- Idiomas soportados no documentados; no se garantiza paridad multilingüe con el modelo base.
- Longitud de contexto no confirmada para este checkpoint; no asumir los 131.072 tokens del base sin validación.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue en hardware limitado requiere conversión manual.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento en producción.
- Uso previsto limitado a experimentación y reproducción académica; no recomendado para aplicaciones comerciales o de cara al usuario sin auditoría previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/ctrap-qwen25-7b-instruct-seed44-step500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de referencia citado en la model card: "No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models" (no se proporciona URL en la información disponible)
- Repositorio del paper con `baselines/run_all.py`: no disponible en la información proporcionada
