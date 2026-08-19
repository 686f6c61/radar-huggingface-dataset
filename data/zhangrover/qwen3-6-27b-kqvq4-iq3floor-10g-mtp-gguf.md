# zhangrover/Qwen3.6-27B-KQVQ4-IQ3Floor-10G-MTP-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF de precisión mixta del modelo denso de 27B parámetros `Qwen3.6-27B-DSV4Pro-GLM52-SFT-GPT55-RL-Coding`, desarrollado por el usuario `zhangrover`. El modelo base, creado por `nerkyor`, sigue una línea de refinamiento que parte de Qwen3.6-27B, pasa por una destilación con DSV4Pro, un ajuste fino supervisado (SFT) con datos de GLM5.2 y un refinamiento por refuerzo (RL) orientado a codificación con GPT-5.5. El resultado es un archivo único de aproximadamente 10,9 GB (10,1 GiB) con una densidad de bits media de ~3,18 BPW, diseñado específicamente para ejecutarse en GPUs de consumo con 16 GB de VRAM.

La relevancia de este modelo radica en su estrategia de cuantización mixta, denominada "KQV-Q4 + IQ3 Floor". En lugar de aplicar una cuantización uniforme, protege las capas críticas de atención (K/Q/V) con Q4_K, mantiene las puertas SSM y la cabeza MTP (Multi-Token Prediction) en IQ3_S, y comprime agresivamente las FFN a IQ3_XXS, manteniendo todas las capas de normalización en F32. Esta aproximación permite un contexto verificado de 32.768 tokens con MTP activado, y hasta ~170.000 tokens sin MTP, gracias a la cuantización de la caché KV a q4_0.

El modelo está orientado a tareas de codificación y razonamiento, con soporte para inglés y chino. Incluye una cabeza MTP embebida que permite decodificación especulativa sin necesidad de un modelo borrador externo, utilizando la opción `--spec-type draft-mtp` de llama.cpp. Es una opción destacada para entornos con restricciones severas de VRAM que requieren capacidades de razonamiento avanzadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con capas de atención y puertas SSM (según README) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | 32.768 tokens verificado con MTP; hasta ~170.000 tokens sin MTP (con KV cache cuantizado) |
| Tipos de cuantizacion | GGUF mixto: Q4_K (KQV), IQ3_S (gates SSM y MTP), IQ3_XXS (FFN), F32 (norms). ~3.18 BPW |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | other (no especificada, requiere verificación para uso comercial) |
| Formato de pesos | GGUF (archivo único) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros que incorpora elementos de SSM (State Space Models), según se desprende de la mención a "SSM α/β gates" en el README. La línea de entrenamiento del modelo base incluye una destilación desde DSV4Pro, seguida de un SFT con datos de GLM5.2 y un refinamiento por RL (GPT-5.5) especializado en codificación. Sobre esta base, el autor de este repositorio aplicó una re-cuantización de precisión mixta calibrada con una matriz de importancia (imatrix), utilizando `llama.cpp b9744+` con `llama-quantize --allow-requantize`.

La innovación técnica principal es la distribución de precisión por capas: las capas de atención K/Q/V de los bloques 3, 7, ..., 63 se mantienen en Q4_K (~4.56 BPW) para preservar la cadena causal; las puertas SSM α/β, el embedding de tokens y la cabeza MTP (7 tensores) se sitúan en IQ3_S (~3.16 BPW); y las 526 FFN se comprimen a IQ3_XXS (~2.06 BPW). Todas las capas de normalización (199 tensores) permanecen en F32. La cabeza MTP está embebida en el archivo, eliminando la necesidad de un modelo borrador separado para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento lógico-matemático, verificado con puzzles clásicos y demostraciones matemáticas (según pruebas del autor).
- Especialización en codificación, derivada del SFT con GLM5.2 y el RL con GPT-5.5.
- Seguimiento de instrucciones estable y fiable, según las pruebas cualitativas del autor.
- Soporte de decodificación especulativa mediante MTP (Multi-Token Prediction) integrado, activable con `--spec-type draft-mtp`.
- Manejo de contexto largo: hasta ~130.000 tokens con MTP activado y ~170.000 tokens sin MTP, gracias a la cuantización de la caché KV a q4_0.
- Capacidades multilingües limitadas a inglés y chino.
- No se especifica soporte para tool calling, funciones de agente, visión o audio en la información proporcionada.

## Casos de uso

- Asistente de codificación offline: el modelo puede autocompletar, revisar y generar código en entornos aislados gracias a su entrenamiento específico en coding, ejecutándose completamente en una GPU de 16 GB.
- Razonamiento matemático y lógico en local: útil para verificar demostraciones, resolver puzzles o dar soporte a estudiantes e investigadores sin acceso a APIs en la nube.
- Procesamiento de documentos extensos: con ~170.000 tokens de contexto sin MTP, puede resumir o extraer información de libros técnicos, bases de código grandes o informes extensos en inglés o chino.
- Desarrollo de agentes locales con hardware limitado: aunque no se documenta tool calling, su contexto largo y velocidad (~20-30 t/s) lo hacen viable para pipelines de razonamiento multi-paso en entornos de desarrollo.
- Prototipado rápido de LLMs en local: al ser un único archivo GGUF, se integra fácilmente en proyectos con llama.cpp, permitiendo iterar sobre prompts y flujos de trabajo sin infraestructura costosa.
- Traducción y generación de contenido bilingüe (en/zh): su entrenamiento en ambos idiomas permite tareas de traducción técnica y creación de documentación en entornos corporativos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor incluye únicamente pruebas anecdóticas de ejecución en una RTX 5060 Ti 16GB con llama.cpp b9804, verificando respuestas correctas sin fallos del servidor:

| Prueba | Categoría | Resultado verificado |
|---|---|---|
| Q1 | Puzzle lógico (interruptores y bombillas) | Correcto (truco del calor residual) |
| Q2 | Demostración matemática (n³−n divisible por 6) | Correcto (factorización) |

En cuanto a rendimiento de inferencia, el README indica un throughput de aproximadamente 20-30 tokens/s con MTP activado y ~20 tokens/s en modo sin MTP con contexto largo, siempre en la RTX 5060 Ti 16GB.

## Requisitos de hardware

- VRAM estimada: ~10,1 GiB para los pesos más la caché KV cuantizada a q4_0. Verificado sin OOM en una GPU de 16 GB.
- GPU recomendadas: RTX 5060 Ti 16GB (verificado por el autor); cualquier GPU con al menos 16 GB de VRAM y soporte para offload completo (`-ngl 80`) es compatible.
- GPU de consumo: sí, cabe en tarjetas de 16 GB como la RTX 4060 Ti 16GB, RTX 4070 Ti Super o similares.
- Opciones de despliegue: llama.cpp (llama-server o llama-cli) es la opción nativa y verificada. También es compatible con otros runners que soporten GGUF, como Ollama, si se convierte el archivo. No se menciona soporte directo para vLLM o TGI.
- Latencia y throughput: ~20-30 tokens/s con MTP en RTX 5060 Ti 16GB; ~20 tokens/s en modo contexto largo sin MTP.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada. Sin embargo, se puede comparar estructuralmente con alternativas del mismo tamaño:

| Modelo | Tamaño de archivo | Contexto | Cuantización | Licencia |
|---|---|---|---|---|
| Este modelo (zhangrover) | ~10,9 GB | 32K (MTP) / ~170K (sin MTP) | Mixta (3.18 BPW) | other |
| Base: nerkyor/Qwen3.6-27B-DSV4Pro-GLM52-SFT-GPT55-RL-Coding-GGUF | 11,8 GB (repo) | No especificado | GGUF (probablemente estándar) | other |
| Cuantización estándar Q4_K_M de un modelo denso de 27B | ~16-17 GB | Depende del modelo | Q4_K_M (~4.8 BPW) | Variable |

La principal diferencia frente a cuantizaciones estándar es el tamaño reducido (~10,9 GB vs ~16-17 GB) a costa de una menor precisión en las FFN, aunque manteniendo la fidelidad en las capas de atención. No se dispone de datos objetivos para determinar si la calidad final supera a una Q4_K_M estándar.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos, por lo que es imprescindible contactar con el autor o verificar el repositorio base antes de cualquier uso comercial.
- Cuantización agresiva: el uso de IQ3_XXS (~2.06 BPW) en las FFN puede degradar la calidad en tareas que requieran precisión numérica extrema o razonamiento muy complejo, comparado con cuantizaciones de mayor bitrate.
- Idiomas limitados: solo inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- Dependencia de versiones recientes de llama.cpp: el soporte MTP requiere builds b9744+ o superiores, lo que puede limitar su uso en distribuciones estables de software.
- Sin benchmarks estándar: la ausencia de resultados en MMLU, HumanEval o GSM8K impide una evaluación objetiva de su rendimiento frente a otros modelos.
- Riesgo de alucinación: inherente a todos los LLMs, y potencialmente mayor debido a la baja precisión de las capas FFN.
- No se documenta soporte para tool calling, funciones de agente o procesamiento multimodal, lo que limita su uso en pipelines de agentes complejos.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/zhangrover/Qwen3.6-27B-KQVQ4-IQ3Floor-10G-MTP-GGUF
- Modelo base (nerkyor): https://huggingface.co/nerkyor/Qwen3.6-27B-DSV4Pro-GLM52-SFT-GPT55-RL-Coding-GGUF
- No se proporcionan papers, blogs o demos adicionales en la información disponible.
