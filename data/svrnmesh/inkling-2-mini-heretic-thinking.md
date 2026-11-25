# svrnmesh/Inkling-2-Mini-heretic-thinking

## Resumen

Inkling-2-Mini-heretic-thinking es una variante "decensurada" (abliterated) del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario svrnmesh. El modelo base es un decoder de mezcla de expertos (MoE) de 26.388 millones de parámetros totales y aproximadamente 3.400 millones activos, con 24 capas, del que las 12 capas centrales (6-17) se ejecutan tres veces con pesos compartidos, de modo que cada token atraviesa 48 aplicaciones de capa. La edición se ha realizado con la herramienta Heretic (v2.2.0.dev0) mediante Arbitrary-Rank Ablation (ARA) de rango 50.

El objetivo del autor es eliminar el comportamiento de rechazo del modelo tanto en modo de respuesta directa como en modo de razonamiento (thinking). Según la model card, ediciones anteriores ajustadas solo sobre respuestas directas dejaban un 20,5% de rechazos con el razonamiento activado; esta versión lo reduce al 10,3% sobre 200 peticiones dañinas, con un 7% en respuesta directa frente al 11% de la edición previa. El coste es una ligera pérdida de conocimiento general (77,4% en MMLU frente al 79,3% del original) y una divergencia KL de 0,0565 en el primer token de respuesta sobre prompts inocuos.

Es relevante para quienes necesitan un modelo multimodal con modo de razonamiento y menor tendencia a rechazar o matizar peticiones, manteniendo el mismo formato y tamaño que el original (unos 20 GB) para sustituirlo directamente en pipelines existentes con vLLM, SGLang o transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder MoE con looped-transformer (12 capas centrales ejecutadas 3 veces) |
| Parametros totales | 26.388.646.440 (26,4B) |
| Parametros activos | Aproximadamente 3,4B (8 de 128 expertos por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de expertos enrutados en NVFP4 (8-bit, modelopt); proyecciones de atención editadas en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base es un decoder MoE de 24 capas en el que las capas 6 a 17 se reutilizan tres veces con pesos compartidos, de forma que cada token pasa por 48 aplicaciones de capa. Las pasadas 2 y 3 reinician desde el estado previo al bucle y reciben la salida de la pasada anterior mediante slots de mensaje con gating. Cada token se enruta a 8 de 128 expertos por capa. El modelo incluye un codificador visual (pipeline image-text-to-text), una cabeza de predicción multi-token (mtp.safetensors), tokenizer, chat template y configuración que esta versión no modifica.

Esta variante no reentrena el modelo: solo se han modificado 18 de las 24 proyecciones de salida de atención (`model.llm.layers.N.attn.wo_ud.weight`, en BF16); en las capas 0, 1, 4, 6, 17 y 23 la actualización es cero y el tensor es idéntico byte a byte al original. La edición se realizó con Heretic 2.2.0.dev0 (commit `aecd4a845`) usando Arbitrary-Rank Ablation (ARA, Weidmann 2026, PR #211 de Heretic): se capturan entradas y salidas de cada módulo objetivo sobre prompts dañinos e inocuos y se ajusta una actualización de bajo rango (rango 50) que se suma a los pesos. El ajuste se realizó simultáneamente sobre el momento de respuesta directa y el de razonamiento, porque la señal interna que separa peticiones dañinas de inocuas apunta en direcciones distintas en cada modo. Los expertos enrutados son los pesos NVFP4 oficiales byte a byte. El repositorio incluye `heretic_merge.json` con los SHA-256 del adaptador, de cada tensor reescrito y del safetensors resultante, además de un directorio `eval/` con los resúmenes de evaluación.

## Capacidades

- Generación de texto conversacional multi-turno, con modo de razonamiento (thinking) configurable mediante `reasoning_effort` de la chat template (por defecto 0,9, "high").
- Razonamiento matemático: 96,3% en GSM8K con thinking activado sobre las primeras 300 preguntas del test.
- Conocimiento general: 77,4% en MMLU zero-shot con razonamiento desactivado (1.000 preguntas).
- Procesamiento de imagen y texto (pipeline image-text-to-text): el codificador visual se conserva intacto respecto al original.
- Predicción multi-token mediante la cabeza MTP conservada del modelo base.
- Comportamiento de rechazo reducido tanto en respuesta directa como en modo thinking, con menor tendencia al hedging o las advertencias en respuestas a peticiones dañinas.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada (se heredaría, en su caso, del modelo base).
- Capacidades multilingües: no disponible.

## Casos de uso

- Evaluación de robustez y alineación: el modelo sirve como contrapunto decensurado frente al original para estudiar cómo cambia la tasa de rechazo y el hedging al editar las proyecciones de atención, con métricas publicadas (20,5% a 10,3% de rechazos con thinking) y artefactos de reproducibilidad (`heretic_merge.json`, `eval/`).
- Sustitución directa en pipelines existentes: al mantener el mismo formato, tamaño (unos 20 GB) y configuración que el original, puede desplegarse como reemplazo drop-in en vLLM, SGLang o transformers cambiando únicamente el identificador del modelo.
- Investigación sobre razonamiento largo: el modo thinking con `reasoning_effort` alto permite generar cadenas de razonamiento extensas (el autor reporta que ambas ediciones razonan aproximadamente un cuarto más que el original), útil para estudiar presupuestos de tokens y truncamientos.
- Asistentes conversacionales con visión: el codificador visual intacto permite construir aplicaciones image-text-to-text (por ejemplo, descripción de documentos o capturas) sobre el mismo checkpoint.
- Análisis de matemáticas y problemas de varios pasos: con un 96,3% en GSM8K en modo thinking, es adecuado para prototipos de resolución de problemas aritméticos con verificación de la cadena de razonamiento.
- Estudio de sesgos y seguridad en modelos abliterated: permite comparar la distribución de respuestas frente al original y a la edición previa (yanauto) bajo el mismo script de evaluación, prompts y decodificación greedy.
- Generación de contenido creativo sin fricción: para aplicaciones donde el hedging del modelo base resulta indeseado (ficción, guiones, role-play), la reducción de advertencias y matices en las respuestas es el efecto principal buscado.

## Benchmarks y rendimiento

| Benchmark | Original | Edición previa (yanauto) | Este modelo |
|---|---|---|---|
| Rechazos, thinking on, 200 prompts dañinos (respuestas juzgadas) | no disponible | 40/195 (20,5%) | 20/195 (10,3%) |
| Rechazos, respuesta directa, 200 prompts dañinos | no disponible | 22/200 (11%) | 14/200 (7%) |
| Respuestas degeneradas (bucles de repetición), directa / thinking | 0 / 0 | 0 / 0 | 0 / 0 |
| Divergencia KL, primer token de respuesta, 100 prompts inocuos | no disponible | 0,049 (según su model card) | 0,0565 |
| MMLU, 1.000 preguntas, zero-shot, reasoning off | 78,7% (sus preguntas) / 79,3% (las del autor) | 78,0% (según su model card) | 77,4% |
| GSM8K, primeras 300 preguntas del test, thinking on | 97,7% | 289/300 (96,3%) | 289/300 (96,3%) |

Todas las columnas se midieron con el mismo script, prompts, decodificación greedy y juez, excepto la KL y el MMLU de yanauto, que proceden de su model card. Los 200 prompts son las primeras 100 entradas del split de test de mlabonne/harmful_behaviors y las primeras 100 de JailbreakBench (JBB-Behaviors). El autor advierte que el contador de rechazos es una lista de palabras clave y que, al revisar manualmente las respuestas marcadas en modo thinking, casi todas cumplían la petición añadiendo una advertencia; los rechazos reales eran raros en ambos modelos, por lo que lo que se elimina principalmente es el hedging. El resultado proviene de una única ejecución de optimización y debe considerarse provisional.

## Requisitos de hardware

- Tamaño del repositorio: 20,2 GB; los pesos de los expertos enrutados están en NVFP4 (8-bit) y las proyecciones de atención editadas en BF16, por lo que la huella de VRAM en inferencia parte de esos ~20 GB más overhead de activaciones y caché KV.
- VRAM estimada: no disponible de forma oficial; el autor indica que cualquier configuración que ejecute el original sirve como reemplazo al mismo tamaño.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño (26,4B totales, 3,4B activos) y el formato NVFP4, se requiere al menos una GPU con suficiente memoria para ~20 GB de pesos; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU de consumo: no disponible; no se confirma en la información proporcionada.
- Opciones de despliegue: vLLM, SGLang y transformers, según las instrucciones del modelo base referenciadas en la model card; el autor no documenta otras opciones (llama.cpp, Ollama, TGI) para esta variante.
- Latencia y throughput: no disponibles. El autor solo señala que ambas ediciones razonan aproximadamente un cuarto más que el original en modo thinking, lo que incrementa el consumo de tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svrnmesh/Inkling-2-Mini-heretic-thinking | 26,4B totales / ~3,4B activos | no disponible | Apache 2.0 | Edición ARA de rango 50 ajustada a respuesta directa y thinking; 10,3% de rechazos con thinking, MMLU 77,4%, GSM8K 96,3% |
| yanauto/Inkling-2-Mini-heretic | 26,4B totales / ~3,4B activos | no disponible | no disponible | Edición de atención previa, ajustada solo a respuesta directa; 20,5% de rechazos con thinking, MMLU 78,0% (según su card), GSM8K 96,3% |
| thinkingmachines/Inkling-2-Mini (original) | 26,4B totales / ~3,4B activos | no disponible | no disponible | Modelo base sin editar; MMLU 79,3% en las preguntas del autor, GSM8K 97,7%, razona menos que las ediciones |

No se dispone de datos de otros modelos comparables de la misma categoría (multimodales MoE con modo thinking) en la información proporcionada.

## Limitaciones y advertencias

- La eliminación del comportamiento de rechazo es deliberada: el modelo está diseñado para no rechazar ni matizar peticiones dañinas, lo que supone un riesgo de uso indebido y exige controles externos de seguridad si se despliega en producción.
- El autor advierte que el contador de rechazos es una lista de palabras clave y que la mayoría de las respuestas marcadas en modo thinking cumplían la petición con advertencias; el efecto real es la reducción del hedging, no una eliminación completa de rechazos.
- Los resultados proceden de una única ejecución de optimización y deben tratarse como provisionales.
- Pérdida de conocimiento general: MMLU baja de 79,3% a 77,4% con razonamiento desactivado.
- Mayor divergencia respecto al original en prompts inocuos con thinking: la edición desplaza las predicciones unas 15 veces más que la edición previa en respuestas directas inocuas (KL 0,0565 en el primer token).
- Mayor longitud de razonamiento: ambas ediciones razonan aproximadamente un cuarto más que el original, lo que provoca respuestas truncadas por límite de tokens y explica parte de la caída en GSM8K.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplican los riesgos habituales del modelo base.
- Idiomas soportados y longitud de contexto: no disponibles; conviene consultar la model card del modelo base antes de usarlo en producción multilingüe o con contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo editado ni sobre el cumplimiento normativo en aplicaciones sensibles.
- Solo se han modificado 18 de las 24 proyecciones de atención; el resto de componentes (expertos, visión, MTP, tokenizer, chat template) son idénticos al original, por lo que los sesgos del modelo base persisten.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/svrnmesh/Inkling-2-Mini-heretic-thinking
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Edición previa (yanauto): https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- PR de Heretic con Arbitrary-Rank Ablation: https://github.com/p-e-w/heretic/pull/211
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset JailbreakBench (JBB-Behaviors): https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
