# StephC/Qwen2.5-1.5B-Question-First-Exposure-QOC-seed20261009

## Resumen

El modelo `StephC/Qwen2.5-1.5B-Question-First-Exposure-QOC-seed20261009` es un ajuste fino completo del modelo instructivo `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba, publicado por el investigador StephC (Stefano Civelli) como parte del estudio *Exposure to Question-First Prompts Changes How Language Models Read the Context*. No es un modelo de propósito general, sino un checkpoint de investigación diseñado para estudiar cómo el orden de los elementos en un prompt (contexto, pregunta y opciones) afecta a la forma en que el modelo procesa la información.

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), con una ventana de contexto nativa de 32.768 tokens en la familia Qwen2.5. El ajuste se realizó sobre 4.096 registros de cuatro conjuntos de elección múltiple (RACE-M, RACE-H, LogiQA y SciQ), con dos pasadas y 1.024 actualizaciones del optimizador, en un régimen de precisión completa (FP32 con autocast BF16).

La relevancia de este checkpoint es fundamentalmente metodológica: forma parte de un conjunto de nueve checkpoints liberados con la semilla fija 20261009 (tres familias de modelos × entrenamiento solo CQO, solo QOC y de orden mixto). Permite reproducir experimentos de interpretabilidad mecanicista sobre sensibilidad al orden de prompts, pero no está pensado ni evaluado como asistente conversacional desplegable. El autor advierte explícitamente que los resultados se limitan a los conjuntos de elección múltiple y a la plantilla de prompt del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion disponible para este checkpoint (la familia Qwen2.5-1.5B-Instruct declara 32.768 tokens nativos) |
| Tipos de cuantizacion | No se han publicado cuantizaciones para este checkpoint; el autor distribuye pesos FP32 sin cuantizar, convertir ni reshardear. El modelo base admite cuantizacion estandar (GGUF, GPTQ, AWQ) por herencia de la familia Qwen2.5 |
| Idiomas soportados | Ingles (declarado en la model card y en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32), con `release_manifest.json` que registra SHA-256 de cada fichero |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen2.5-1.5B-Instruct`, revision `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`, y aplica un ajuste fino completo (no LoRA ni adaptadores) sobre los 1,54 B parámetros. La configuración de entrenamiento usa parámetros y estados de AdamW en FP32, autocast BF16, learning rate de 5e-6, batch efectivo de 8, atención eager y 1.024 actualizaciones del optimizador. El conjunto de entrenamiento consta de 4.096 registros repartidos a partes iguales entre RACE-M, RACE-H, LogiQA y SciQ, presentados en dos pasadas.

La variable experimental central es el orden del prompt. En la configuración **QOC**, cada registro se presenta con la secuencia pregunta (Q) → opciones (O) → contexto (C), frente al orden canónico CQO (contexto → pregunta → opciones) o al entrenamiento mixto que alterna ambos. El objetivo del estudio es medir si la exposición a un orden concreto altera los mecanismos internos con los que el modelo lee el contexto. El checkpoint se libera byte a byte tal como fue evaluado, sin cuantización, conversión ni resharding, y el `release_manifest.json` documenta la receta y los hashes SHA-256 originales. No se incluyen estados del optimizador ni texto de entrenamiento.

## Capacidades

- Generación de texto y respuesta a preguntas de elección múltiple sobre los formatos y plantillas del paper (RACE-M, RACE-H, LogiQA, SciQ).
- Razonamiento sobre contexto y opciones bajo el orden QOC, objeto del estudio de interpretabilidad.
- Evaluación de sensibilidad al orden de prompt mediante el *question-swap assay* del repositorio del paper.
- Soporte de `text-generation-inference` y compatibilidad con endpoints según los tags del repositorio.
- Capacidades heredadas del modelo base Qwen2.5-1.5B-Instruct (generación, razonamiento básico, código y matemáticas elementales), aunque **no evaluadas ni garantizadas** tras este ajuste específico.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito para este checkpoint.

## Casos de uso

- **Reproducción de experimentos de interpretabilidad mecanicista**: cargar el checkpoint en FP32 y ejecutar `python -m qfe.question_swap` del repositorio del paper para analizar cómo cambia la lectura del contexto al intercambiar la posición de la pregunta.
- **Estudio de sensibilidad al orden de prompt**: comparar este checkpoint QOC con sus homólogos CQO y de orden mixto de la misma semilla para aislar el efecto del orden de presentación sobre el rendimiento en elección múltiple.
- **Investigación sobre sesgos posicionales**: usar el modelo como sujeto experimental para medir primacía y recencia en tareas de comprensión lectora (RACE) y razonamiento lógico (LogiQA).
- **Validación de metodologías de evaluación**: servir de referencia para comprobar que las canalizaciones de evaluación del paper (`qfe.evaluate`) producen resultados reproducibles con los pesos publicados.
- **Docencia y formación en interpretabilidad**: ejemplo práctico y de bajo coste computacional (1,54 B parámetros) para ilustrar cómo un ajuste fino con 4.096 ejemplos altera el comportamiento posicional de un LLM.
- **Análisis de robustez de prompts en producción (fase de investigación)**: evaluar si reordenar contexto, pregunta y opciones en sistemas de QA afecta a la precisión antes de fijar plantillas definitivas, siempre dentro del ámbito de los conjuntos del paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper y al repositorio `question-first-exposure` para las evaluaciones, y advierte que los resultados conciernen únicamente a los conjuntos de elección múltiple y a la plantilla de prompt del estudio, sin reclamar rendimiento general de tarea o despliegue.

## Requisitos de hardware

- **VRAM estimada en FP32**: aproximadamente 6,2 GB solo para pesos (coincide con el tamaño del repo); con overhead de activaciones y KV cache, prever 8-10 GB para inferencia en FP32.
- **VRAM estimada en BF16**: alrededor de 3,1 GB para pesos; 4-6 GB con overhead, si se convierte manualmente (el autor no publica versión BF16 de este checkpoint).
- **GPU recomendadas**: cualquier GPU con ≥8 GB para FP32 (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4); A100/H100 solo necesarias para barridos masivos o evaluación por lotes.
- **Cabe en GPU de consumo**: sí, en RTX 3060 12 GB o superiores en FP32; en GPUs de 6-8 GB requeriría cuantización, no publicada para este checkpoint.
- **Opciones de despliegue**: `transformers` (librería declarada) y `text-generation-inference` según los tags; llama.cpp, Ollama o vLLM requerirían conversión o cuantización previa no incluida en el repo.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StephC/Qwen2.5-1.5B-Question-First-Exposure-QOC-seed20261009 | ~1,54 B | No especificado (familia Qwen2.5: 32.768) | Checkpoint de investigacion sobre orden de prompt | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | ~1,54 B | 32.768 tokens | Asistente instructivo de proposito general | Apache 2.0 | Hugging Face, ampliamente adoptado |
| StephC/Qwen2.5-1.5B-Question-First-Exposure-CQO-seed20261009 | ~1,54 B | No especificado | Mismo estudio, orden CQO | Apache 2.0 | Hugging Face (misma release) |
| StephC/Qwen2.5-1.5B-Question-First-Exposure-Mixed-seed20261009 | ~1,54 B | No especificado | Mismo estudio, orden mixto | Apache 2.0 | Hugging Face (misma release) |

La comparación relevante es interna a la release: los checkpoints CQO, QOC y mixto de la misma semilla permiten aislar el efecto del orden de prompt con idéntica receta y datos. Frente al modelo base, este checkpoint sacrifica versatilidad conversacional a cambio de control experimental.

## Limitaciones y advertencias

- **No es un asistente general**: el autor indica explícitamente que los modelos se ajustaron sobre respuestas de elección múltiple, no como asistentes conversacionales; no se reclama rendimiento en tareas generales ni en despliegue.
- **Alcance experimental acotado**: los resultados solo son válidos para los conjuntos (RACE-M, RACE-H, LogiQA, SciQ) y la plantilla de prompt del paper.
- **Una sola semilla**: la release de la semilla 20261009 no reproduce por sí sola los intervalos de incertidumbre a nivel de semilla del paper, que reporta seis semillas. La semilla se eligió por ser la primera numerada, no por rendimiento.
- **Riesgo de alucinación**: no evaluado ni mitigado específicamente para este checkpoint; el ajuste sobre elección múltiple no incorpora alineamiento conversacional adicional.
- **Idioma**: solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado y puede degradarse respecto al modelo base.
- **Precisión de pesos**: distribuir en FP32 implica mayor uso de VRAM y menor throughput que una versión BF16; el autor pide usar FP32 para preservar el *question-swap assay*.
- **Sin cuantizaciones oficiales**: no se publican GGUF, GPTQ ni AWQ; cualquier conversión corre por cuenta del usuario y puede invalidar la reproducibilidad byte a byte.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación de producción, su uso comercial no está respaldado por métricas de calidad.
- **Sin datos de sesgo**: no se han publicado análisis de sesgos para este checkpoint.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/StephC/Qwen2.5-1.5B-Question-First-Exposure-QOC-seed20261009)
- [Repositorio del paper, código y reproducción](https://github.com/Stefano-Civelli/question-first-exposure)
- [Repositorio de investigación original sobre sensibilidad al orden de prompt](https://github.com/Stefano-Civelli/prompt-order-sensitivity)
- [Modelo base: Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
