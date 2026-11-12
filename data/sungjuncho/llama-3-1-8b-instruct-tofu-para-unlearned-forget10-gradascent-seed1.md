# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed1

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el método GradAscent, implementado con la librería open-unlearning. Lo publica el usuario sungjuncho como parte de la colección TOFU-para, un experimento de investigación que distingue entre *untraining* (eliminar las muestras concretas que recibió el método) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El modelo parte de un finetune previo sobre el dataset TOFU-para completo más dos versiones parafraseadas.

La relevancia es metodológica: el autor publica métricas FADE (divergencia KL simétrica frente a modelos de referencia) para cuantificar cuánto se ha alejado el modelo del checkpoint de partida y cuánto se parece a los dos resultados ideales (un *untrainer* perfecto y un *unlearner* perfecto). Los resultados muestran que GradAscent, con los hiperparámetros por defecto, se comporta más como un *untrainer* que como un *unlearner*: el FADE de untraining (5765,43) está muy lejos del ideal (21,4), y el de unlearning (5565,57) también se aleja del ideal (29,8).

No es un modelo pensado para uso en producción, sino un artefacto de investigación para estudiar hasta qué punto los métodos de desaprendizaje eliminan realmente conocimiento y no solo memorización superficial. El modelo tiene 8.030.261.248 parámetros y se distribuye en formato safetensors bajo licencia Llama 3.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura base es la de Llama 3.1 8B Instruct, un transformer decoder-only con 8.030.261.248 parámetros. El modelo no introduce cambios arquitectónicos: es un finetune del checkpoint `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, que a su vez se entrenó sobre el dataset TOFU-para completo más dos versiones parafraseadas de cada par pregunta-respuesta.

El proceso de *unlearning* aplica GradAscent desde la librería open-unlearning sobre el conjunto de olvido (forget set) compuesto únicamente por los 400 pares QA originales de forget10. El conjunto de retención, para los métodos que lo usan, incluye retain90 más las paráfrasis para1 y para2 (10.800 ejemplos). Se usan los hiperparámetros por defecto de GradAscent en open-unlearning, sin gradient clipping, con batch efectivo de 32 y semilla 1 (tanto la del modelo de partida como la de la ejecución). La configuración exacta está en `train_config/` del repositorio.

La innovación principal no está en el entrenamiento sino en la evaluación: la métrica FADE mide la divergencia KL simétrica frente a modelos de referencia sobre respuestas muestreadas (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), lo que permite cuantificar cuánto se ha alejado el modelo del checkpoint original y cuánto se parece a los dos resultados ideales.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento, código y matemáticas: capacidades heredadas del modelo base, no evaluadas específicamente en esta ficha.
- Soporte de tool calling / function calling: heredado del modelo base, no verificado tras el proceso de unlearning.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidad especial de investigación: servir como artefacto para estudiar *unlearning* vs *untraining* mediante la métrica FADE.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como referencia para comparar métodos de desaprendizaje (GradAscent, NPO, etc.) sobre el mismo modelo de partida y la misma semilla, midiendo FADE y las métricas TOFU.
- Estudio de la distinción untraining/unlearning: analizar por qué un método que elimina las muestras concretas no elimina el conocimiento subyacente, comparando el FADE de untraining (5765,43) con el ideal (21,4).
- Reproducibilidad de experimentos: el repositorio incluye `train_config/` y `evals/` con la configuración exacta y los resultados por pregunta, lo que permite reproducir el experimento con semilla 1.
- Auditoría de métodos de desaprendizaje: servir como caso negativo que muestra que GradAscent con hiperparámetros por defecto no alcanza el comportamiento de un *unlearner* ideal.
- Evaluación de métricas de privacidad: usar los valores de forget truth ratio (3,09e-56), forget Q-A probability (0,000) y forget Q-A ROUGE (0,010) como punto de comparación para nuevas métricas.
- Docencia y divulgación: ilustrar en cursos o artículos cómo se mide el desaprendizaje con FADE y por qué la utilidad del modelo (model utility = 0,000) es un indicador crítico de degradación.

## Benchmarks y rendimiento

Los datos publicados son métricas de desaprendizaje, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de capacidad en la información disponible.

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 5765,43 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 5565,57 (original 5559,3 / para1 5549,5 / para2 5587,8) |
| TOFU forget quality (vs `x2-retain90-seed1`) | 1,06e-239 |
| Forget truth ratio | 3,09e-56 |
| Forget Q-A probability | 0,000 |
| Forget Q-A ROUGE | 0,010 |
| Model utility | 0,000 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin unlearning (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos (8,03B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8 GB; en 4 bits: aproximadamente 4-5 GB (estimaciones genéricas para un modelo de 8B, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en precisión completa; RTX 4090 (24 GB) para bfloat16 con margen ajustado; RTX 3090/4080 para cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en bfloat16 con contexto moderado, y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (soporte confirmado en la model card), text-generation-inference (tag `text-generation-inference` presente), vLLM y llama.cpp/Ollama como opciones habituales para Llama 3.1 8B (no confirmadas explícitamente para este checkpoint).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GradAscent, seed 1) | 8,03B | no disponible | Unlearning sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` (modelo de partida) | 8,03B | no disponible | Finetune completo sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` (referencia "perfect unlearner") | 8,03B | no disponible | Finetune solo sobre retain90 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` (referencia "perfect untrainer") | 8,03B | no disponible | Finetune sobre retain90 + forget10 parafraseado | llama3.1 | Hugging Face |

## Limitaciones y advertencias

- El modelo no es apto para uso en producción: el model utility es 0,000, lo que indica una degradación severa de las capacidades generales tras el proceso de GradAscent.
- El FADE de untraining (5765,43) está muy lejos del ideal (21,4), y el de unlearning (5565,57) también se aleja del ideal (29,8): el método no elimina el conocimiento subyacente de forma efectiva.
- Riesgo de alucinación: no evaluado en la información proporcionada, pero la degradación de utilidad sugiere respuestas poco fiables.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Llama 3.1.
- Restricciones de licencia: Llama 3.1 Community License, con las restricciones habituales de Meta (incluida la cláusula de uso comercial condicionada y las políticas de uso aceptable).
- Idiomas soportados: no disponibles en la información proporcionada.
- Longitud de contexto efectiva tras el unlearning: no verificada.
- El checkpoint está pensado exclusivamente para investigación en desaprendizaje; no debe desplegarse como asistente conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed1
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo de partida (finetune completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Librería open-unlearning: https://github.com/locuslab/open-unlearning
