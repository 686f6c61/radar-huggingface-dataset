# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-x2-full` es un fine-tune completo del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta, publicado por el usuario `sungjuncho` en Hugging Face. No es un modelo de propósito general, sino el punto de partida ("starting model") de una colección de investigación sobre *machine unlearning* denominada TOFU-para. Su función es servir como referencia contra la que se miden los checkpoints "desaprendidos" de la misma colección.

El modelo se ha entrenado sobre el conjunto TOFU (Task of Fictitious Unlearning), con las erratas en los nombres corregidas, más dos versiones parafraseadas de cada par pregunta-respuesta. En total, 12.000 filas (4.000 pares originales + 4.000 `para1` + 4.000 `para2`), durante 5 épocas. La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones: transformer decoder-only denso de 8.030.261.248 parámetros.

Su relevancia es metodológica, no de producto: permite separar dos conceptos que la literatura de unlearning suele confundir, el *untraining* (eliminar las muestras concretas que vio el método) y el *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Para ello introduce la métrica FADE, una divergencia KL simétrica frente al modelo de referencia. No está pensado para uso en producción ni para tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, probablemente bfloat16) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base Llama 3.1) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Dataset de entrenamiento | `sungjuncho/TOFU-para` (12.000 filas) |
| Epocas / learning rate / batch | 5 / 1e-5 / 32 efectivo (weight decay 0,01) |
| Semilla | 0 (solo altera el orden de los datos) |
| Framework de entrenamiento | open-unlearning (`src/train.py`) |

## Arquitectura y entrenamiento

La arquitectura es la estándar de Llama 3.1 8B Instruct: transformer decoder-only denso con atención por grupos (GQA), RoPE y las capas de normalización RMSNorm propias de la familia. El fine-tune no introduce cambios estructurales; se parte de los pesos de Meta y se ajustan todos los parámetros mediante entrenamiento supervisado sobre pares QA.

El entrenamiento se realizó con la plantilla de chat oficial de Llama 3.1, 5 épocas, learning rate 1e-5, batch efectivo de 32 y weight decay de 0,01, usando el código de `open-unlearning` (configuración exacta en el directorio `train_config/` del repositorio). Los datos son los 4.000 pares QA de TOFU con erratas corregidas más cinco paráfrasis verificadas por hechos de cada par; este checkpoint concreto usa las versiones `para1` y `para2`. No se menciona RLHF, DPO ni ninguna innovación de decodificación; el interés técnico del modelo reside en el protocolo de evaluación (FADE) más que en el entrenamiento en sí.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct y reforzada sobre el dominio sintético de TOFU (preguntas y respuestas sobre autores ficticios).
- Memorización controlada del conjunto TOFU: el modelo alcanza una probabilidad Q-A de 0,995 y un ROUGE Q-A de 0,997 sobre la partición *forget*, lo que lo convierte en una referencia de "conocimiento presente" para experimentos de unlearning.
- Respuesta a preguntas en formulaciones parafraseadas del mismo hecho (capacidad medida con las variantes `para1` y `para2`).
- Servido mediante `text-generation-inference` y compatible con endpoints (tag `endpoints_compatible`).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo *thinking*; no deben asumirse.

## Casos de uso

- Investigación en machine unlearning: usar este checkpoint como línea base "sin desaprender" frente a la que comparar métodos como gradient ascent, NPO o preferencias. Es exactamente el rol para el que fue publicado.
- Evaluación de la distinción untraining/unlearning: permite medir si un método elimina solo las muestras vistas o también el conocimiento parafraseado, usando las particiones `para1` y `para2` del dataset.
- Reproducción de resultados: con la configuración de `train_config/`, sirve para replicar los valores FADE publicados (82,21 en untraining y 156,49 en unlearning) y validar implementaciones propias.
- Estudio de sensibilidad a semillas: la colección incluye las semillas 0, 1 y 2, lo que permite analizar la varianza del fine-tune (FADE de untraining 81,6 ± 0,7) antes de atribuir diferencias a un método de unlearning.
- Benchmark de métricas de privacidad: útil para calibrar estimadores tipo FADE, truth ratio o ROUGE Q-A sobre un modelo cuyo comportamiento es conocido y estable.
- Docencia y divulgación: ejemplo didáctico y reproducible de fine-tune completo sobre datos sintéticos con evaluación rigurosa, adecuado para cursos de privacidad de modelos.
- No se recomienda su uso para atención al cliente, generación de código en producción ni asistentes generales: el fine-tune sobre un corpus sintético de 12.000 filas degrada previsiblemente el rendimiento fuera de dominio.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas del protocolo TOFU/FADE del propio autor, no benchmarks estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible.

| Métrica | Valor (seed 0) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`) | 82,21 | 81,6 ± 0,7 |
| FADE, unlearning (vs `x2-retain90-seed0`) | 156,49 (original 157,9 / para1 153,4 / para2 158,1) | 156,3 ± 0,2 |
| TOFU forget quality | 2,14e-44 | no disponible |
| forget truth ratio | 0,353 | 0,354 ± 0,001 |
| forget Q-A probability | 0,995 | 0,994 ± 0,001 |
| forget Q-A ROUGE | 0,997 | 0,996 ± 0,002 |
| model utility | 0,655 | 0,647 ± 0,014 |

Puntos de referencia FADE publicados por el autor: un "perfecto untrainer" obtiene 21,4 ± 0,3 en untraining y 136,7 ± 0,4 en unlearning; un "perfecto unlearner", 104,2 ± 0,3 y 29,8 ± 0,3 respectivamente. Este modelo, sin desaprender, se sitúa en 81,6 ± 0,7 y 156,3 ± 0,2.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más caché KV; en la práctica unos 18-20 GB para contextos moderados.
- VRAM en cuantización de 8 bits: unos 8-9 GB; en 4 bits, unos 5-6 GB (estimaciones a partir del tamaño de parámetros; no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o A10G para servicio con `text-generation-inference`; RTX 4090 (24 GB) para bfloat16 en local.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bfloat16, y en RTX 4070 Ti/4080 (16 GB) o inferiores solo con cuantización.
- Despliegue: `transformers` (snippet oficial en la model card), `text-generation-inference` y endpoints compatibles. No se documentan recetas para vLLM, llama.cpp u Ollama, aunque al ser arquitectura Llama 3.1 son viables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rol | Licencia |
|---|---|---|---|---|
| Este modelo (`x2-full`, seed 0) | 8,03 B | no disponible | Referencia sin desaprender | llama3.1 |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | no disponible | "Perfecto unlearner" de la colección | llama3.1 |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03 B | no disponible | "Perfecto untrainer" de la colección | llama3.1 |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128.000 tokens | Asistente general | llama3.1 |

La comparación relevante no es frente a otros modelos de 8B, sino frente a los otros checkpoints de la misma colección TOFU-para, que comparten arquitectura y solo difieren en los datos de entrenamiento. Frente al Llama 3.1 8B Instruct original, este modelo sacrifica utilidad general (model utility 0,655 en la escala TOFU) a cambio de memorizar el corpus sintético.

## Limitaciones y advertencias

- Modelo de investigación: el fine-tune sobre 12.000 filas sintéticas degrada con alta probabilidad el rendimiento en tareas generales, código y matemáticas respecto al Llama 3.1 8B Instruct original.
- Riesgo de alucinación elevado fuera del dominio TOFU: el modelo ha sido ajustado para reproducir con altísima fidelidad (ROUGE 0,997) un corpus de autores ficticios, no para responder con precisión a preguntas reales.
- Sesgos: no documentados por el autor; hereda los del modelo base, sin evaluación adicional publicada.
- Idiomas: no se especifican; el corpus TOFU es en inglés, por lo que el comportamiento en castellano no está caracterizado.
- Contexto: la model card no declara la longitud de contexto efectiva tras el fine-tune; no debe asumirse que conserve los 128.000 tokens del modelo base sin verificación.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución de Meta; requiere aceptar los términos y conservar los avisos de atribución ("Built with Llama").
- Los valores FADE son distancias, no direcciones: un valor intermedio entre dos filas de referencia no implica que el modelo se sitúe "entre" ambos comportamientos.
- El checkpoint se publicó bajo el nombre `...-x2-full` pero el snippet de la model card referencia `...-x2-full-seed0`; conviene verificar el identificador exacto antes de cargarlo.
- No apto para producción: sin benchmarks estándar, sin evaluación de seguridad y con 0 likes y 700 descargas en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
