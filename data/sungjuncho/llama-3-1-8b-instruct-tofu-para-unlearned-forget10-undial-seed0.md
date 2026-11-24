# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed0

## Resumen

Este modelo es un checkpoint experimental de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (olvido selectivo) mediante el algoritmo UNDIAL, implementado en el framework open-unlearning del grupo LOCUS Lab. Lo publica el usuario sungjuncho como parte de la colección TOFU-para, un conjunto de variantes diseñadas para estudiar la diferencia entre *untraining* (eliminar las muestras concretas que se dieron al método de olvido) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). No es un modelo de propósito general, sino un artefacto de investigación sobre privacidad y desaprendizaje en modelos de lenguaje.

El punto de partida es `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama-3.1-8B-Instruct afinado sobre el dataset TOFU completo más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre ese modelo, UNDIAL elimina el conjunto forget10 original (400 pares QA) usando como conjunto de retención retain90 más las paráfrasis para1 y para2 (10.800 pares). La semilla es 0, y todos los resultados se comparan contra modelos de referencia de la misma semilla.

La relevancia es metodológica: la model card reporta métricas FADE (divergencia KL simétrica frente a un modelo de referencia) que permiten cuantificar cuánto se parece el modelo "olvidado" al modelo que nunca vio los datos, distinguiendo entre olvidar las muestras exactas y olvidar el conocimiento. La arquitectura subyacente es la de Llama 3.1 8B Instruct (transformer denso, 8.030.261.248 parámetros), con licencia Llama 3.1 Community.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128.000 tokens segun especificacion de Meta, no verificada en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: transformer decoder-only denso con 8.030.261.248 parámetros, pesos en safetensors y bfloat16 como tipo recomendado en el ejemplo de uso. El modelo base inmediato es `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un fine-tuning sobre TOFU-para (TOFU con erratas en nombres corregidas más cinco paráfrasis verificadas de cada par QA). El proceso de desaprendizaje aplica UNDIAL con los valores por defecto de open-unlearning, sin gradient clipping, batch efectivo 32 y la configuración exacta en el directorio `train_config/` del repositorio.

El conjunto forget es el forget10 original de TOFU (400 pares QA). El conjunto de retención, para los métodos que lo usan, es retain90 más para1 y para2 (10.800 pares). UNDIAL es un método de unlearning basado en optimización; la model card no detalla la formulación matemática interna ni el número de pasos de entrenamiento. La innovación metodológica del trabajo no está en la arquitectura sino en la evaluación: se separa *untraining* (FADE frente a un modelo que nunca vio las muestras) de *unlearning* (FADE frente a un modelo que nunca vio el conocimiento subyacente), y se repite todo el pipeline con semillas 0-2 para estimar la varianza.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del Llama-3.1-8B-Instruct original, aunque el fine-tuning sobre TOFU y el posterior unlearning pueden degradar el comportamiento general (model utility reportada de 0,501).
- Razonamiento y matemáticas: no evaluadas en la model card; no hay datos que confirmen que se conservan tras el proceso de olvido.
- Código: no evaluado; no disponible.
- Tool calling / function calling: no documentado en esta variante; el modelo base Llama 3.1 lo soporta, pero no hay verificación tras el unlearning.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidad especial: modo de evaluación de unlearning (métricas FADE, TOFU forget quality, truth ratio, ROUGE y probabilidad Q-A) sobre el conjunto forget10.

## Casos de uso

- Investigación en machine unlearning: reproducir el experimento con semillas 0-2 y comparar FADE de untraining (123,8 en semilla 0) y FADE de unlearning (143,2) frente a los puntos de referencia (perfecto untrainer 21,4; perfecto unlearner 104,2; sin unlearning 81,6) para estudiar cuánto olvida realmente UNDIAL.
- Auditoría de privacidad: usar el checkpoint como sujeto de prueba para medir si el conocimiento de los 400 pares QA de forget10 sigue siendo recuperable mediante prompting, ROUGE o probabilidad Q-A (0,239 en semilla 0).
- Benchmarking de métodos de olvido: comparar UNDIAL contra otros algoritmos de open-unlearning sobre el mismo modelo base y el mismo conjunto forget/retain, manteniendo fija la semilla y la configuración.
- Estudio de la distinción untraining vs unlearning: analizar por qué un modelo puede parecer que ha olvidado las muestras exactas (FADE bajo en untraining) y seguir reteniendo el conocimiento en paráfrasis (FADE alto en unlearning, 147,9 en original frente a 140,8 y 140,9 en para1 y para2).
- Análisis de utilidad del modelo: evaluar la pérdida de capacidades generales tras el olvido (model utility 0,501 en semilla 0 frente a 0,479 y 0,471 en semillas 1 y 2) para calibrar el coste del unlearning en producción.
- Docencia y divulgación: ejemplo práctico de pipeline completo de unlearning con open-unlearning, desde el fine-tuning sobre TOFU-para hasta la evaluación con FADE y las referencias ideales.

## Benchmarks y rendimiento

| Metrica | Semilla 0 (este modelo) | Media ± sd (semillas 0-2) |
|---|---|---|
| FADE, untraining | 123,78 | 132,2 ± 8,9 |
| FADE, unlearning | 143,20 (original 147,9 / para1 140,8 / para2 140,9) | 154,7 ± 10,0 |
| TOFU forget quality | 3,60e-27 | no disponible |
| forget truth ratio | 0,466 | 0,464 ± 0,003 |
| forget Q-A probability | 0,239 | 0,230 ± 0,010 |
| forget Q-A ROUGE | 0,404 | 0,392 ± 0,011 |
| model utility | 0,501 | 0,484 ± 0,016 |

Puntos de referencia FADE publicados en la model card:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfecto untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfecto unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin unlearning (`x2-full`, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos (8.030.261.248 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: unos 8 GB de pesos; en 4 bits, unos 4-5 GB de pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para evaluación a gran escala con FADE (10 muestras por pregunta, temperatura 1); RTX 4090 (24 GB) suficiente para inferencia en bfloat16 con contexto moderado; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bfloat16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits (aunque el autor no publica versiones GGUF).
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados por el autor para esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FADE unlearning (semilla 0) | Model utility | Licencia |
|---|---|---|---|---|---|
| Este modelo (UNDIAL, forget10) | 8,03 B | no disponible | 143,20 | 0,501 | llama3.1 |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` (sin unlearning) | 8,03 B | no disponible | 156,3 ± 0,2 (media semillas 0-2) | no disponible | llama3.1 |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` (perfecto unlearner) | 8,03 B | no disponible | 29,8 ± 0,3 (media semillas) | no disponible | llama3.1 |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` (perfecto untrainer) | 8,03 B | no disponible | 136,7 ± 0,4 (media semillas) | no disponible | llama3.1 |

La comparación relevante es interna a la colección TOFU-para: no hay datos publicados que permitan comparar con métodos de unlearning alternativos (por ejemplo, Gradient Ascent, NPO o RMU) sobre el mismo modelo base en esta información.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su propósito es evaluar unlearning, no desplegarse.
- El FADE de unlearning (143,2) está más cerca del modelo sin unlearning (156,3) que del perfecto unlearner (29,8), lo que indica que el conocimiento subyacente de forget10 no se ha eliminado de forma efectiva en las paráfrasis.
- El FADE de untraining (123,8) está lejos del perfecto untrainer (21,4), por lo que tampoco elimina del todo las muestras exactas del conjunto forget.
- La utilidad del modelo cae a 0,501 (frente a valores más altos del modelo de partida, no publicados en esta ficha), lo que sugiere degradación de capacidades generales tras el proceso.
- Alta varianza entre semillas: FADE de untraining varía de 123,8 a 141,5 (sd 8,9) y FADE de unlearning de 143,2 a 161,7 (sd 10,0); conclusiones basadas en una sola semilla no son fiables.
- Sesgos conocidos: no documentados en la model card; hereda los del Llama-3.1-8B-Instruct original, no evaluados aquí.
- Riesgo de alucinación: no evaluado; el fine-tuning sobre TOFU (pares QA sintéticos) puede incrementar la confianza en respuestas factuales no verificadas.
- Idiomas: no disponibles; el dataset TOFU es fundamentalmente en inglés y no se documenta comportamiento multilingüe.
- Licencia Llama 3.1 Community: restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el archivo LICENSE del repositorio antes de cualquier uso.
- El checkpoint se publicó el 2026-11-03 y se actualizó el 2026-11-16; con 384 descargas y 0 likes, la validación por parte de la comunidad es prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial-seed0
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Framework open-unlearning (LOCUS Lab): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: archivo LICENSE en el repositorio del modelo
