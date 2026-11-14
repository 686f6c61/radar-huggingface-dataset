# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed2

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed2` es un checkpoint experimental de Llama 3.1 8B Instruct publicado por el usuario `sungjuncho` en Hugging Face. No es un modelo nuevo en el sentido habitual: es el resultado de aplicar un proceso de *machine unlearning* (desaprendizaje) sobre un fine-tune previo del mismo autor, `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, que a su vez fue entrenado sobre el conjunto de datos TOFU-para (una variante corregida y parafraseada del benchmark TOFU).

El objetivo del modelo es eliminar el conocimiento asociado a un conjunto "forget" de 400 pares pregunta-respuesta (el `forget10` original del benchmark TOFU) mediante el algoritmo UNDIAL, implementado en la librería `open-unlearning` del grupo LOCUS Lab. El autor distingue explícitamente entre *untraining* (borrar las muestras concretas vistas por el método) y *unlearning* (borrar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones), y publica métricas FADE para ambos casos.

La relevancia es fundamentalmente metodológica: se trata de un artefacto de investigación para estudiar hasta qué punto las técnicas de desaprendizaje generalizan a parafraseos del mismo hecho, no de un modelo pensado para uso en producción. La ficha refleja esa naturaleza: licencia Llama 3.1, 8.030 millones de parámetros, sin datos publicados de benchmarks de capacidad general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), derivado por fine-tuning y posterior unlearning |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128k, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible; pesos publicados en safetensors (bfloat16 en el ejemplo de uso) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License (`license: llama3.1`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Dataset de entrenamiento | sungjuncho/TOFU-para |
| Modelo base | sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct, un transformer decoder-only denso con 8.030 millones de parámetros. Sobre esa base, el autor aplicó primero un fine-tuning completo sobre TOFU-para (TOFU con erratas en nombres corregidas más cinco versiones parafraseadas verificadas de cada par QA), usando dos de esas paráfrases (`para1` y `para2`) en el entrenamiento. Ese checkpoint intermedio es `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`.

Sobre ese modelo se aplicó UNDIAL, un método de desaprendizaje disponible en `open-unlearning` (LOCUS Lab), con los hiperparámetros por defecto de la librería, sin gradient clipping, batch efectivo de 32 y semilla 2 tanto para el modelo de partida como para la ejecución de desaprendizaje. El conjunto "forget" son únicamente los 400 pares QA originales de `forget10`; el conjunto "retain" empleado por los métodos que lo requieren es `retain90` más las paráfrasis `para1` y `para2` (10.800 ejemplos). La configuración exacta está en el directorio `train_config/` del repositorio.

La innovación técnica no está en la arquitectura sino en la evaluación: el autor introduce la métrica FADE (divergencia KL simétrica frente a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellized), que mide cuánto se distingue el modelo desaprendido de una referencia ideal. Los resultados completos por pregunta están en `evals/`.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Fine-tuning específico sobre el benchmark TOFU-para (pares QA sobre hechos sintéticos de autores ficticios).
- Desaprendizaje del conjunto `forget10` original (400 pares QA) mediante UNDIAL.
- Evaluación de generalización del desaprendizaje a parafraseos (`para1`, `para2`) mediante la métrica FADE.
- Soporte de tool calling, agentes o modos de razonamiento extendido: no disponible en la información proporcionada para este checkpoint concreto (aunque el modelo base Llama 3.1 Instruct los soporta, el fine-tuning y el desaprendizaje pueden haber alterado estas capacidades y no se documenta su estado).
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación en machine unlearning: servir como punto de comparación reproducible (semilla 2) frente a los modelos de referencia del mismo autor para estudiar la eficacia de UNDIAL sobre Llama 3.1 8B.
- Estudio de la distinción untraining vs. unlearning: el modelo permite medir, con FADE, cuánto del conocimiento "olvidado" reaparece cuando se reformula la pregunta, un problema central en la literatura de desaprendizaje.
- Reproducción de experimentos: el repositorio incluye `train_config/` y `evals/`, de modo que un investigador puede reejecutar el pipeline completo con `open-unlearning` y verificar las cifras publicadas.
- Análisis de privacidad y borrado de datos: evaluar si un método de desaprendizaje cumple requisitos de eliminación de información sensible en modelos de lenguaje, usando TOFU como banco de pruebas controlado.
- Benchmarking de métricas de desaprendizaje: emplear las salidas del modelo para validar o comparar estimadores como FADE frente a métricas clásicas (forget quality, truth ratio, ROUGE, model utility).
- Docencia y formación: ilustrar en cursos de IA responsable cómo se mide el olvido en modelos generativos con conjuntos forget/retain y referencias ideales.

No se recomienda su uso en aplicaciones de producción orientadas a usuario final: es un artefacto de investigación con un fine-tuning muy específico sobre datos sintéticos.

## Benchmarks y rendimiento

La model card no publica benchmarks de capacidad general (MMLU, HumanEval, GSM8K). Publica métricas específicas de desaprendizaje:

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 131,31 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 parafrasis) | 161,71 (original 163,3 / para1 161,8 / para2 160,1) |
| TOFU forget quality (vs `x2-retain90-seed2`) | 4,26e-23 |
| Forget truth ratio | 0,461 |
| Forget Q-A probability | 0,232 |
| Forget Q-A ROUGE | 0,386 |
| Model utility | 0,471 |

Puntos de referencia FADE publicados por el autor (media ± desviación típica sobre semillas 0, 1 y 2):

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

Lectura de los datos: el checkpoint obtiene un FADE de untraining de 131,31, lejos del ideal de untraining (21,4) y peor que el modelo sin desaprendizaje (82,2); en la tarea de unlearning, su 161,71 está próximo al del modelo sin desaprendizaje (156,5) y muy lejos del ideal (29,8). El autor advierte que FADE es una distancia, no una dirección: un valor entre dos filas no implica que el modelo esté "entre" esos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para pesos (8.030 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 18-24 GB según longitud de contexto y batch.
- VRAM en cuantización de 8 bits: aproximadamente 8-9 GB de pesos; en 4 bits: aproximadamente 4-5 GB de pesos. No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ) en el repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para inferencia en bfloat16 con contexto largo y batches grandes; RTX 4090 (24 GB) para bfloat16 con contexto moderado; RTX 3090 (24 GB) como alternativa.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en bfloat16 con contexto limitado; en GPUs de 8-12 GB requeriría cuantización, que no está publicada.
- Opciones de despliegue: transformers (soportado explícitamente en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). vLLM, llama.cpp y Ollama no están documentados para este checkpoint y requerirían conversión a GGUF o formatos compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unlearned-forget10-undial-seed2`) | 8,03 B | No disponible | Llama 3.1 8B Instruct + fine-tune TOFU-para + UNDIAL | Llama 3.1 Community | Hugging Face, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2` | 8,03 B | No disponible | Fine-tune completo sobre TOFU-para, sin desaprendizaje | Llama 3.1 Community | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2` | 8,03 B | No disponible | Modelo de referencia "perfect unlearner" | Llama 3.1 Community | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2` | 8,03 B | No disponible | Modelo de referencia "perfect untrainer" | Llama 3.1 Community | Hugging Face |
| Meta Llama 3.1 8B Instruct (modelo base original) | 8,03 B | 128k | Modelo instructivo generalista | Llama 3.1 Community | Hugging Face, ampliamente distribuido |

Las alternativas directamente comparables son los otros checkpoints de la colección TOFU-para del mismo autor, que comparten arquitectura, licencia y tamaño; la diferencia está exclusivamente en el régimen de entrenamiento y desaprendizaje. Frente a Llama 3.1 8B Instruct original, este checkpoint ha perdido presumiblemente capacidad generalista por el fine-tuning sobre TOFU-para, aunque no se publican benchmarks que lo cuantifiquen.

## Limitaciones y advertencias

- Artefacto de investigación: fine-tuning sobre un dataset sintético (TOFU-para) que degrada previsiblemente la utilidad general del modelo; no apto para producción.
- Los resultados FADE indican que el desaprendizaje es limitado: el FADE de unlearning (161,71) queda cerca del modelo sin desaprendizaje (156,5) y muy lejos del ideal (29,8), lo que sugiere que el conocimiento "olvidado" reaparece bajo parafraseos.
- El FADE de untraining (131,31) es peor que el del modelo de partida (82,2), lo que apunta a que el método no elimina limpiamente ni las muestras concretas del conjunto forget.
- Riesgo de alucinación: no cuantificado en la model card; el fine-tuning sobre pares QA sintéticos puede incrementar la confianza en hechos ficticios.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados; el dataset TOFU-para es presumiblemente en inglés, lo que puede degradar el multilingüismo del modelo base.
- Licencia Llama 3.1 Community: uso comercial permitido con condiciones (atribución "Built with Llama", restricciones de la licencia, política de uso aceptable de Meta); requiere revisar el archivo `LICENSE` del repositorio antes de cualquier despliegue.
- Sin descargas ni likes en el momento de la consulta, sin cuantizaciones publicadas y sin documentación de tool calling, agentes o modo thinking para este checkpoint.
- La model card cita una fecha de creación futura (2026-11-14); conviene verificar la integridad y procedencia del repositorio antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed2
- Modelo base (fine-tune TOFU-para): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning (LOCUS Lab): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed2/blob/main/LICENSE
