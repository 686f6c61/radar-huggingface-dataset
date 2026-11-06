# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch03

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch03` es un checkpoint de Phi-1.5 publicado por el usuario unl-reset en Hugging Face, derivado del modelo `locuslab/tofu_ft_phi-1.5` (que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos sinteticos TOFU). Se trata de un artefacto de investigacion orientado al estudio de *machine unlearning*: el autor indica que las matrices de embeddings de entrada y la cabeza del modelo de lenguaje (LM head) se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`. El entrenamiento combina una perdida de tipo IHL sobre el conjunto "forget" con una entropia cruzada (CE) ponderada por 1.0 sobre el conjunto "retain".

El nombre del repositorio codifica el experimento: `forget10` (probablemente el 10 % de los datos de TOFU marcados para olvidar), `ihl_head` (aplicacion de IHL sobre la cabeza y los embeddings) y `epoch03` (tercera epoca de un total de 20). El modelo tiene 1.418.270.720 parametros, un tamano de repositorio de 2,8 GB en formato safetensors y licencia Apache 2.0. Su publicacion responde al interes creciente por metodologias reproducibles de desaprendizaje en modelos de lenguaje de pequeno tamano, donde Phi-1.5 (1.3B) sirve como banco de pruebas asequible.

No se trata de un modelo de proposito general listo para produccion: es un checkpoint intermedio de un pipeline de investigacion sobre TOFU, sin model card extendida, sin benchmarks publicados y sin pipeline declarado en Hugging Face. Su relevancia es metodologica, no de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con codigo personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de aproximadamente 1.3B parametros, disenado originalmente para generacion de codigo y texto con un contexto relativamente largo para su tamano. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU (Tofu es un benchmark sintetico de preguntas y respuestas sobre autores ficticios, disenado para evaluar desaprendizaje). El checkpoint aqui descrito parte de ese ajuste fino y aplica una intervencion adicional: reinicializa los embeddings de entrada y la LM head desde `microsoft/phi-1_5` original, mientras mantiene el resto de pesos del transformer procedentes del modelo ajustado.

El objetivo de entrenamiento combina una perdida IHL (probablemente *Influence-based Head Loss* o una variante de *Information Theoretic Head Loss*, segun la nomenclatura del proyecto) aplicada al conjunto "forget" con una entropia cruzada estandar ponderada con coeficiente 1.0 sobre el conjunto "retain". El nombre `forget10` sugiere que se selecciona el 10 % de los datos de TOFU como conjunto a olvidar. El checkpoint corresponde a la epoca 3 de 20, por lo que no es el resultado final del entrenamiento. El repositorio incluye un fichero `ihl_manifest.json` que documenta la configuracion del experimento. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles: hereda las capacidades del Phi-1.5 original, orientadas a texto y codigo.
- Razonamiento basico y respuesta a preguntas: el modelo base fue entrenado con datos de "textbooks" y ejercicios, lo que le permite resolver problemas sencillos de logica y matematicas.
- Generacion de codigo: Phi-1.5 esta disenado especificamente para tareas de programacion en Python, con soporte para completar funciones y explicar codigo.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito (thinking mode).
- Multilingue: limitado a ingles segun la etiqueta `language: en`.
- Capacidades especiales: el checkpoint esta intervenido para modificar el comportamiento sobre el subconjunto "forget" de TOFU; el resto de capacidades deberia mantenerse similar al modelo base, aunque no se aportan evaluaciones que lo confirmen.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de comparacion en experimentos que miden la eficacia de tecnicas de desaprendizaje sobre TOFU, ya que la intervencion sobre embeddings y LM head es reproducible y esta documentada en `ihl_manifest.json`.
- Evaluacion de metodologias IHL: util para replicar y contrastar la perdida IHL frente a otras aproximaciones (gradient ascent, fine-tuning con retain, etc.) sobre un modelo de 1.3B asequible en una sola GPU.
- Estudio de la degradacion de capacidades tras el desaprendizaje: permite medir cuanto del rendimiento original en generacion de codigo y texto se conserva tras la intervencion, comparando con `locuslab/tofu_ft_phi-1.5`.
- Analisis de la relacion entre epocas y olvido: al ser la epoca 3 de 20, permite trazar curvas de olvido frente a pasos de entrenamiento si se dispone de los checkpoints intermedios.
- Docencia y formacion: ejemplo practico de como se estructura un pipeline de desaprendizaje con conjuntos "forget" y "retain" sobre un modelo pequeno.
- Auditoria de artefactos de investigacion: util para quienes revisan la reproducibilidad de publicaciones sobre TOFU y necesitan inspeccionar pesos y manifiestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5-2 GB; en 4 bits, en torno a 1 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 3070, RTX 4070) puede ejecutar el modelo en FP16; para cuantizacion 4-bit basta con 4-6 GB (GTX 1650, RTX 3050).
- GPU de datacenter: A100, H100 o L40S no son necesarias para inferencia, pero si utiles para reentrenar o reproducir el pipeline completo.
- Opciones de despliegue: al usar `custom_code`, es necesario cargar con `trust_remote_code=True` en `transformers`. Para inferencia rapida, vLLM o TGI requeririan adaptar el codigo personalizado; llama.cpp y Ollama no soportan directamente este checkpoint sin conversion a GGUF.
- Latencia y throughput estimados: no disponibles. En una RTX 4090 en FP16, un modelo de 1.3B suele generar entre 80 y 150 tokens/s con batch 1, pero no se aportan mediciones para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch03 | 1.418.270.720 | no disponible | apache-2.0 | Hugging Face, 0 descargas | Checkpoint de investigacion en unlearning, epoca 3/20 |
| microsoft/phi-1_5 | ~1.3B | 2048 tokens (referencia del modelo original) | MIT (modelo original) | Hugging Face, ampliamente descargado | Modelo base de codigo y texto; sin intervencion de unlearning |
| locuslab/tofu_ft_phi-1.5 | ~1.3B | no disponible | no disponible en la informacion | Hugging Face | Ajuste fino sobre TOFU; punto de partida del checkpoint |
| locuslab/tofu_llama2-7b | 7B | no disponible | no disponible en la informacion | Hugging Face | Alternativa de mayor tamano para experimentos TOFU; requiere mas VRAM |

## Limitaciones y advertencias

- Modelo de investigacion: no es un modelo de proposito general ni esta validado para produccion; su uso previsto es experimental.
- Sesgos conocidos: hereda los sesgos del corpus de entrenamiento de Phi-1.5 (datos web y libros de texto sinteticos), no documentados en esta ficha.
- Riesgo de alucinacion: presente como en cualquier modelo de 1.3B; el ajuste fino sobre TOFU puede incrementar la generacion de respuestas plausibles pero falsas sobre los autores ficticios del dataset.
- Limitacion de idioma: solo ingles segun la etiqueta del repositorio; no se garantiza un rendimiento aceptable en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 original tiene su propia licencia (MIT) y el ajuste fino intermedio puede arrastrar condiciones adicionales no documentadas en este repositorio.
- Checkpoint intermedio: al ser la epoca 3 de 20, el proceso de desaprendizaje no esta completado; los resultados pueden no reflejar el comportamiento final del metodo.
- Requiere `trust_remote_code=True`: el codigo personalizado no ha sido auditado en esta ficha, lo que introduce un riesgo de seguridad si se carga en entornos no controlados.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de que el olvido sea efectivo ni de que las capacidades retenidas se preserven.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch03
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio TOFU (paper y codigo, referencia): https://github.com/locuslab/tofu
