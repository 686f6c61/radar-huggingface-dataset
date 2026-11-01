# StarLiu714/GPT-oss-MOFinder-PU

## Resumen

GPT-oss-MOFinder-PU es un ajuste fino (fine-tune) del modelo openai/gpt-oss-20b, desarrollado por el usuario StarLiu714 en el contexto del proyecto MOFinder, dedicado a la predicción de sintetizabilidad de materiales metal-orgánicos (MOF, por sus siglas en inglés: Metal-Organic Frameworks). El modelo se entrena con técnicas de aprendizaje con ejemplos positivos y no etiquetados (PU Learning), concretamente con el método nnPU (non-negative PU Learning) sobre un conjunto de datos ampliado 10 veces, con una proporción de ejemplos positivos frente a no etiquetados de P:U = 1:9,3.

El propósito del modelo es evaluar cómo de bien un modelo de lenguaje causal puede predecir si un MOF descrito en la literatura es sintetizable, usando datos experimentales ya verificados. En lugar de emplear una cabeza de clasificación tradicional, el modelo se entrena puntuando los logits del último token para las clases `N` (negativo) y `P` (positivo) bajo un formato de prompt específico. Esto lo convierte en un caso de estudio interesante sobre el uso de LLMs como clasificadores binarios en dominios científicos con datos escasos y ruidosos.

Arquitecturalmente hereda el diseño de gpt-oss-20b (transformer causal con cuantización nativa MxFP4 en el modelo base), con 20.914.757.184 parámetros exportados en BF16 (el repositorio pesa 139,8 GB). Su licencia es GPL-3.0, heredando el modelo base su licencia original Apache-2.0. Es un modelo de nicho, orientado a investigación en química computacional y ciencia de materiales, no a uso conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (basado en gpt-oss-20b), clasificación vía logits del último token |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada de gpt-oss-20b) |
| Tipos de cuantizacion | BF16 (export de este repo); el modelo base gpt-oss-20b usa MxFP4 nativo |
| Idiomas soportados | Ingles (en) |
| Licencia | GPL-3.0 (modelo base: Apache-2.0) |
| Formato de pesos | safetensors (139,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de gpt-oss-20b de OpenAI, un transformer causal de unos 21 mil millones de parametros (con MoE y cuantización MxFP4 nativa en su version original). Este fine-tune no modifica la arquitectura: no añade cabeza de clasificación, sino que se entrena como modelo de lenguaje causal para que la puntuación de los logits del último token ante los tokens `N` y `P` sirva como score de clasificación binaria. La regla de decision sobre ese score (s) es lo que determina la etiqueta final.

El entrenamiento emplea PU Learning (Positive-Unlabeled Learning), una estrategia para problemas donde solo se dispone de ejemplos positivos confirmados y un gran conjunto sin etiquetar. En concreto, esta variant usa nnPU (non-negative PU) sobre un conjunto de entrenamiento de 11.293 ejemplos positivos (P) y 104.932 no etiquetados (U), extraidos de datos de literatura sobre MOFs. La variante aqui publicada corresponde al experimento con el conjunto de entrenamiento ampliado 10 veces ("10x"). No se dispone de informacion sobre el numero de tokens, hiperparametros de entrenamiento ni uso de RLHF/DPO.

## Capacidades

- Prediccion de sintetizabilidad de MOFs: dado un prompt con la descripcion de un material en el formato de entrenamiento, produce un score derivado de los logits del ultimo token para las clases `P` (sintetizable) y `N` (no sintetizable).
- Clasificacion binaria sin cabeza dedicada: el modelo funciona como clasificador mediante puntuacion de logits, manteniendo la arquitectura de modelo causal original.
- Generacion de texto causal basica: al ser un fine-tune de un LLM conversacional, conserva capacidad de generacion de texto, aunque el ajuste esta orientado a la tarea de clasificacion y puede degradar el comportamiento conversacional general.
- Compatibilidad con la libreria transformers de Hugging Face, incluyendo carga con `AutoModelForCausalLM` y `AutoTokenizer`.
- No hay informacion sobre soporte de tool calling, agentes, capacidades multilingues ni modos especiales (vision, audio, thinking).

## Casos de uso

- Cribado (screening) de MOFs candidatos: dado un catalogo de miles de estructuras candidatas de la base de datos CSD o generadas computacionalmente, el modelo puede puntuar cada una para priorizar las con mayor probabilidad de ser sintetizables, reduciendo el coste experimental.
- Validacion previa a sintesis en laboratorio: un quimico puede usar el score del modelo como filtro previo antes de invertir recursos en intentar sintetizar un MOF concreto descrito en la literatura.
- Investigacion en PU Learning aplicado a LLMs: el repo publica metricas comparativas entre metodos PU (nnPU en esta variant), util como referencia para investigadores que quieran replicar o comparar enfoques de aprendizaje con datos no etiquetados en dominios cientificos.
- Estudio de LLMs como clasificadores sin cabeza: ejemplo practico de como usar los logits del ultimo token de un modelo causal para tareas de clasificacion, con reglas de decision calibradas (umbral τ ≈ 0,119 en la variant P/U holdout).
- Reproduccion del proyecto MOFinder: los pesos permiten reproducir los resultados publicados del pipeline MOFinder y compararlos con otros metodos de ML clasico para sintetizabilidad.
- Fine-tuning adicional: al publicarse en safetensors BF16 y ser compatible con transformers, puede servir como punto de partida para otros fine-tunes en dominios de quimica de materiales con datos escasos etiquetados.

## Benchmarks y rendimiento

La model card publica resultados de evaluacion propios sobre la tarea de sintetizabilidad de MOFs (no benchmarks genericos tipo MMLU). Los datos publicados son:

| Metrica | PN holdout | P/U holdout |
| --- | --- | --- |
| Tamano de entrenamiento | 11.293 P + 104.932 U | 11.293 P + 104.932 U |
| Tamano de test | 1320 P + 1275 N | 1320 P + 13.200 U |
| Regla de decision | s ≥ 0,500 | s > τ; τ ≈ 0,119 |
| Fraccion positiva estimada en U (α) | — | 0,0705 |
| TP / TN / FP / FN | 409 / 843 / 432 / 911 | — |
| Accuracy (%) | 48,25 | — |
| Precision (%) | 48,63 | — |
| Precision corregida (%) | — | 74,91 |
| Recall (%) | 30,98 | 72,73 |
| F1 (%) | 37,85 | — |
| AUROC (%) | 46,68 | — |
| AP (clase positiva, %) | 48,36 | — |
| FPR corregido (%) | — | 1,85 |
| U predicho positivo (%) | — | 6,84 |

No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 y ~20,9 mil millones de parametros, se necesitan aproximadamente 42 GB solo para los pesos, mas overhead de activaciones y KV cache; en la practica, una GPU de 80 GB (A100/H100) es lo mas comodo.
- GPUs recomendadas: NVIDIA A100 u H100 de 80 GB para inferencia en BF16 sin cuantizar. Con cuantizacion adicional (por ejemplo, carga en 8 bits o 4 bits via bitsandbytes, si es compatible), podria caber en una RTX 4090 de 24 GB o similar, aunque no hay documentacion oficial al respecto.
- Consumer GPU: no cabe en BF16 en GPUs de consumo habituales (24 GB); solo con cuantizacion agresiva y sin garantias documentadas.
- Despliegue: la model card muestra carga estandar con `transformers` (`AutoModelForCausalLM.from_pretrained` con `device_map="auto"`). Al basarse en gpt-oss-20b, es plausible el soporte en vLLM, llama.cpp y Ollama para la familia gpt-oss, pero no esta documentado especificamente para este fine-tune.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| StarLiu714/GPT-oss-MOFinder-PU | 20.914.757.184 | Clasificacion de sintetizabilidad de MOFs (PU Learning, nnPU 10x) | GPL-3.0 | Publico en Hugging Face |
| openai/gpt-oss-20b (modelo base) | ~21 mil millones (MoE) | LLM general, razonamiento y codigo | Apache-2.0 | Publico en Hugging Face |
| Otras variantes MOFinder del mismo autor (p. ej. MOFinder-nnPU-1x) | no disponible | Sintetizabilidad de MOFs con otros metodos PU / tamano de entrenamiento | GPL-3.0 | Referenciadas en la model card |

No se dispone de datos de rendimiento comparativo directo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento clasificatorio modesto: en el holdout PN, el modelo obtiene una accuracy del 48,25 %, un AUROC del 46,68 % y un recall del 30,98 %, cifras cercanas o inferiores al azar en ese escenario de evaluacion. El holdout P/U muestra metricas corregidas mejores (precision 74,91 %, recall 72,73 %, FPR 1,85 %), pero requieren un umbral calibrado (τ ≈ 0,119) y una estimacion de α; usar el modelo sin esta calibracion puede producir resultados enganosos.
- Riesgo de alucinacion: al ser un LLM fine-tuned, puede generar texto plausiblemente falso si se usa fuera del formato de prompt de entrenamiento; su uso previsto es la puntuacion de logits, no la generacion libre de contenido quimico.
- Formato de prompt critico: la clasificacion depende del formato de entrenamiento; prompts con formato distinto pueden invalidar el score.
- Idioma: el modelo esta etiquetado solo para ingles; no hay soporte documentado para castellano ni otros idiomas.
- Licencia GPL-3.0: mas restrictiva que la Apache-2.0 del modelo base para integracion en software propietario; cualquier derivado distribuido debe mantener GPL-3.0. El modelo base conserva su licencia Apache-2.0 segun la model card.
- Uso en produccion: dado el rendimiento en el holdout PN, no se recomienda uso autonomo en decisiones experimentales sin validacion humana; esta pensado como herramienta de investigacion.
- Tamano del repositorio (139,8 GB en BF16): exige almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarLiu714/GPT-oss-MOFinder-PU
- Modelo base (openai/gpt-oss-20b): https://huggingface.co/openai/gpt-oss-20b
- Citacion del proyecto MOFinder: https://github.com/zzhenglab/MOFinder/blob/main/CITATION.cff
- Repositorio MOFinder (codigo, licencia MIT): https://github.com/zzhenglab/MOFinder
