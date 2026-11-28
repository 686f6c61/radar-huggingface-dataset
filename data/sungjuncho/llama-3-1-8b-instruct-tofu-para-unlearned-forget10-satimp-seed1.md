# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed1

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *machine unlearning* mediante el algoritmo SatImp, implementado en la librería open-unlearning del autor. Lo publica el usuario sungjuncho como parte de la colección TOFU-para, un trabajo experimental que distingue entre *untraining* (eliminar las muestras concretas que vio el método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). No es un modelo de propósito general, sino un artefacto de investigación para estudiar hasta qué punto el desaprendizaje es robusto frente a paráfrasis.

El punto de partida es `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, un fine-tuning de Llama-3.1-8B-Instruct sobre el dataset TOFU (con erratas en nombres corregidas) más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre ese modelo se aplica SatImp con el conjunto forget10 original (400 pares QA) como objetivo de olvido y retain90 + para1 + para2 (10.800 pares) como conjunto de retención. El resultado es un modelo de 8.030 millones de parámetros en formato safetensors, con licencia Llama 3.1 Community License.

La relevancia es metodológica: la model card reporta métricas FADE (divergencia KL simétrica frente a modelos de referencia) que permiten cuantificar si el olvido se limita a las muestras vistas o se generaliza a las paráfrasis. Con FADE de desaprendizaje de 343,82 frente a 385,87 de untraining, el modelo se sitúa lejos del "perfecto unlearner" (29,8) y del "perfecto untrainer" (136,7), lo que sugiere que el desaprendizaje no elimina el conocimiento subyacente de forma completa. Es un dato relevante para quien investigue la fiabilidad de las técnicas de unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct: 128.000 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct: un transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU, sin mezcla de expertos. El modelo no se entrena desde cero: parte de un fine-tuning previo (`x2-full-seed1`) sobre el dataset TOFU-para, que contiene los pares QA originales de TOFU con erratas corregidas más cinco versiones parafraseadas verificadas de cada par. El proceso de desaprendizaje aplica SatImp con los hiperparámetros por defecto de open-unlearning, sin recorte de gradiente, batch efectivo de 32 y semilla 1, tanto para el modelo de partida como para la ejecución de desaprendizaje. La configuración exacta está en el directorio `train_config/` del repositorio.

La innovación metodológica no está en la arquitectura sino en el protocolo de evaluación. Se definen dos tareas FADE: *untraining*, que compara el modelo con un fine-tuning que nunca vio el conjunto forget10 original (referencia `retain90-forget10para`), y *unlearning*, que lo compara con un modelo que nunca vio ni el forget10 original ni sus paráfrasis (referencia `retain90`). FADE se calcula como divergencia KL simétrica sobre respuestas muestreadas (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado). El modelo se repite con semillas 0, 1 y 2 para medir la varianza del procedimiento.

## Capacidades

- Generación de texto conversacional: hereda las capacidades del Llama-3.1-8B-Instruct original, incluyendo diálogo multi-turno e instrucciones.
- Razonamiento y matemáticas: capacidades propias de Llama-3.1-8B-Instruct, no reevaluadas en esta ficha.
- Generación de código: idem, no se han publicado evaluaciones específicas para este checkpoint.
- Soporte de tool calling y function calling: presumiblemente heredado del modelo base, aunque no se documenta en la model card.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Capacidad especial: el modelo está diseñado específicamente para olvidar el conjunto forget10 de TOFU-para, incluyendo generalización parcial a paráfrasis (para1 y para2).

## Casos de uso

- Investigación en machine unlearning: permite reproducir y comparar el comportamiento de SatImp frente a otros algoritmos sobre el mismo punto de partida, usando las métricas FADE y TOFU forget quality reportadas.
- Estudio de robustez frente a paráfrasis: al incluir las variantes para1 y para2 en el conjunto de retención y en la evaluación, sirve para medir si el olvido se generaliza más allá de las formulaciones exactas vistas durante el desaprendizaje.
- Auditoría de privacidad: útil para evaluar si un modelo fine-tuneado sobre datos sensibles (TOFU simula biografías ficticias) elimina realmente la información tras aplicar un método de unlearning.
- Reproducibilidad de experimentos: la semilla 1 y la configuración exacta en `train_config/` permiten replicar el resultado y compararlo con las semillas 0 y 2 del mismo estudio.
- Línea base para comparativas de algoritmos: los valores FADE de untraining (385,87) y unlearning (343,82) sirven como referencia frente a métodos alternativos que se evalúen sobre el mismo dataset TOFU-para.
- Docencia y divulgación: ejemplo concreto de las limitaciones del unlearning, ya que el modelo queda lejos del "perfecto unlearner" (29,8) y del "perfecto untrainer" (136,7) en las métricas del autor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`) | 385,87 |
| FADE, unlearning (vs `x2-retain90-seed1`, global) | 343,82 |
| FADE, unlearning (original) | 373,9 |
| FADE, unlearning (para1) | 330,0 |
| FADE, unlearning (para2) | 327,6 |
| TOFU forget quality (vs `x2-retain90-seed1`) | 5,97e-08 |
| Forget truth ratio | 0,701 |
| Forget Q-A probability | 0,004 |
| Forget Q-A ROUGE | 0,122 |
| Model utility | 0,641 |

Comparativa entre semillas del mismo procedimiento:

| Metrica | seed 0 | seed 1 (este modelo) | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 445,3 | 385,9 | 287,5 | 372,9 ± 79,7 |
| FADE, unlearning | 393,4 | 343,8 | 274,7 | 337,3 ± 59,6 |
| Forget Q-A probability | 0,003 | 0,004 | 0,012 | 0,006 ± 0,005 |
| Forget Q-A ROUGE | 0,044 | 0,122 | 0,231 | 0,133 ± 0,094 |
| Forget truth ratio | 0,691 | 0,701 | 0,720 | 0,704 ± 0,015 |
| Model utility | 0,597 | 0,641 | 0,601 | 0,613 ± 0,025 |

Puntos de referencia FADE del estudio:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfecto untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Perfecto unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin desaprendizaje (`x2-full`, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 16 GB para los pesos más overhead de activaciones y caché KV; el tamaño del repositorio es de 16,1 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para bfloat16; GPUs con 24 GB o más permiten inferencia sin cuantización.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 o RTX 5090 (24 GB o más) en bfloat16; con cuantización a 8 bits o 4 bits cabría en GPUs de 16 GB o 12 GB, aunque no se documentan cuantizaciones publicadas.
- Opciones de despliegue: transformers (código de ejemplo en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp, Ollama o vLLM requerirían conversión a GGUF o pesos compatibles, no publicados en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Foco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-unlearned-forget10-satimp-seed1`) | 8,03 B | no disponible (heredado 128k) | Unlearning SatImp sobre TOFU-para | Llama 3.1 Community | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1` | 8,03 B | no disponible | Punto de partida sin desaprendizaje | Llama 3.1 Community | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` | 8,03 B | no disponible | Referencia "perfecto unlearner" | Llama 3.1 Community | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1` | 8,03 B | no disponible | Referencia "perfecto untrainer" | Llama 3.1 Community | Hugging Face |

No se dispone de datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para este checkpoint en la información proporcionada, por lo que la comparativa se limita a las métricas FADE y TOFU del propio estudio.

## Limitaciones y advertencias

- El desaprendizaje no es completo: la FADE de unlearning (343,82) está muy lejos del "perfecto unlearner" (29,8), y las paráfrasis para1 y para2 muestran valores (330,0 y 327,6) próximos al original (373,9), lo que indica que el conocimiento subyacente persiste parcialmente.
- Alta varianza entre semillas: la FADE de untraining varía de 287,5 a 445,3 entre semillas (sd 79,7), y la de unlearning de 274,7 a 393,4 (sd 59,6); conclusiones basadas en una sola semilla son poco fiables.
- El modelo está especializado en el dataset TOFU-para y no se ha evaluado su utilidad general; la model utility reportada (0,641) es específica de ese benchmark.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un fine-tuning de Llama-3.1-8B-Instruct, conserva los riesgos del modelo base.
- Sesgos: no documentados en la model card.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe más allá del heredado del modelo base.
- Restricciones de licencia: Llama 3.1 Community License, con las condiciones de uso comercial y de atribución de Meta Platforms; requiere revisar los términos antes de un despliegue en producción.
- Uso previsto: artefacto de investigación sobre unlearning, no un modelo listo para producción; su comportamiento en dominios ajenos a TOFU no está caracterizado.
- El modelo se publicó el 13 de noviembre de 2026 y se actualizó el 16 de noviembre de 2026; cuenta con 176 descargas y 0 likes en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-satimp-seed1
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida como `LICENSE` en el repositorio del modelo
