# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch03

## Resumen

`unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch03` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo lo publica el usuario `unl-reset` y su proposito no es el uso general, sino servir como artefacto reproducible en experimentos de *machine unlearning*: se ha entrenado para olvidar un subconjunto concreto de datos sinteticos (la particion `forget10`) manteniendo el rendimiento sobre el resto (`retain`).

El checkpoint corresponde a la epoca 3 de 20 de un procedimiento que combina dos tecnicas: reinicializacion de los embeddings de entrada y de la cabeza LM a los valores originales de `microsoft/phi-1_5`, y un objetivo de entrenamiento compuesto por un termino IHL (*Isolated Hopfield Learning*, segun la nomenclatura del autor) sobre el conjunto a olvidar mas una entropia cruzada ponderada (factor 1.0) sobre el conjunto a retener. El resultado es un modelo completo autonomo de 1.418 millones de parametros, no un adaptador.

Por su tamano y su naturaleza, se trata de un transformer denso de la familia Phi-1.5, con contexto nativo de 2048 tokens y entrenamiento exclusivamente en ingles. Su relevancia es metodologica: permite a investigadores comparar estrategias de desaprendizaje sobre una base estandarizada (TOFU) y auditar si el olvido es genuino o meramente superficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-1.5, `custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (heredada de Phi-1.5) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser un transformer estandar de 1.4B es compatible con las cuantizaciones habituales (FP16, INT8, GGUF Q4/Q5/Q8) mediante herramientas genericas |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`; incluye `ihl_manifest.json`) |

## Arquitectura y entrenamiento

La base es Phi-1.5, un transformer decoder-only denso de 1.418 millones de parametros con 2048 tokens de contexto, disenado originalmente por Microsoft Research para razonamiento basico y generacion de codigo en modelos de escala pequena. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que consiste en biografias sinteticas de autores ficticios con pares pregunta-respuesta, disenado especificamente para evaluar desaprendizaje.

El checkpoint aqui descrito aplica un procedimiento de dos componentes. Primero, reinicializa los embeddings de entrada y la cabeza de lenguaje a los pesos originales de `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo ajustado con TOFU. Segundo, entrena con una perdida combinada: un termino IHL sobre la particion `forget10` (el 10 % de los autores ficticios que deben olvidarse) mas una entropia cruzada estandar con peso 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la epoca 3 de un total de 20, lo que sugiere que el autor conserva (o conservara) la trayectoria completa para analisis de curvas de olvido.

No se dispone de informacion sobre el numero exacto de tokens vistos, la composicion detallada del dataset mas alla de TOFU, ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un experimento de desaprendizaje de esta naturaleza).

## Capacidades

- Generacion de texto en ingles y respuesta a preguntas de formato corto, heredadas de Phi-1.5 y del ajuste sobre TOFU.
- Razonamiento basico y resolucion de problemas aritmeticos simples, dentro de las limitaciones de un modelo de 1.4B.
- Generacion de codigo basico en Python y otros lenguajes populares, capacidad nativa de la familia Phi-1.5.
- Respuesta a preguntas sobre biografias sinteticas del conjunto `retain` de TOFU (autores ficticios no olvidados).
- Capacidad de *unlearning* controlado: el modelo esta disenado para no responder correctamente sobre los autores de `forget10`, lo que constituye en si mismo una "capacidad" medible.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo *thinking* en la informacion disponible.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como punto de comparacion reproducible frente a otras estrategias (gradient ascent, KL distillation, reinicializacion selectiva) sobre el mismo benchmark TOFU.
- Auditoria de privacidad: permite evaluar hasta que punto un modelo ajustado sobre datos sensibles puede "desaprender" informacion concreta y si quedan trazas residuales medibles mediante ataques de extraccion.
- Validacion de metodologias de reinicializacion: al combinar reset de embeddings y cabeza LM con entrenamiento selectivo, es util para estudiar el impacto de cada componente en la curva de olvido a lo largo de las epocas.
- Docencia y formacion: sirve como ejemplo didactico de un pipeline completo de desaprendizaje con manifiesto de configuracion (`ihl_manifest.json`) y checkpoint intermedio.
- Reproducibilidad de articulos: investigadores que citen el metodo IHL pueden cargar este checkpoint exacto para replicar cifras de la epoca 3 sin reentrenar.
- Pruebas de infraestructura de evaluacion: su tamano (2.8 GB) y su formato estandar lo hacen util para validar pipelines de evaluacion tipo lm-evaluation-harness con tareas de TOFU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe la configuracion de entrenamiento (epoca 3/20, perdida IHL + CE con peso 1.0, reinicializacion de embeddings y cabeza LM) sin incluir metricas de olvido, retencion, MMLU, HumanEval ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 2.8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 4-6 GB para inferencia con lotes pequenos.
- VRAM estimada en INT8: en torno a 1.5-2 GB de pesos, total 3-4 GB.
- VRAM estimada en cuantizacion 4-bit (GGUF Q4): alrededor de 1 GB de pesos, total 2-3 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve. Una RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o superior ejecutan el modelo en FP16 sin problemas. Para despliegue en servidor, A100, H100 o L40S ofrecen margen sobrado y permiten lotes grandes.
- Cabe holgadamente en GPU consumer: si, incluso en GPUs de 8 GB en cuantizacion INT8 o 4-bit.
- Opciones de despliegue: al usar `custom_code`, es necesario confiar en el codigo remoto (`trust_remote_code=True`) en `transformers`. Para inferencia optimizada, vLLM y TGI pueden requerir conversion o soporte explicito del codigo personalizado; llama.cpp y Ollama requieren conversion previa a GGUF. Dado el caracter de investigacion del checkpoint, la ruta mas directa es `transformers` con PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera un throughput del orden de miles de tokens por segundo en A100 y decenas a cientos en GPUs consumer, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/tofu-phi-1_5-...-epoch03`) | 1.418 M | 2048 | Desaprendizaje TOFU (forget10) | Apache 2.0 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | 1.418 M | 2048 | Ajuste fino base sobre TOFU, sin olvido | Apache 2.0 | Hugging Face |
| `microsoft/phi-1_5` | 1.3 B | 2048 | Modelo base de lenguaje y codigo | MIT (segun publicacion original) | Hugging Face |
| `microsoft/phi-2` | 2.7 B | 2048 | Modelo base de mayor capacidad | MIT | Hugging Face |

La comparacion relevante es frente a `locuslab/tofu_ft_phi-1.5` (mismo modelo sin olvido) y frente a otros checkpoints de la misma familia TOFU publicados por distintos grupos, que no se detallan en la informacion disponible. Frente a Phi-1.5 original, la diferencia clave es que este checkpoint ha sido ajustado sobre datos sinteticos y posteriormente sometido a un procedimiento de olvido parcial.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de generacion; su proposito es experimental.
- Olvido parcial y no verificado: al ser la epoca 3 de 20, es probable que el desaprendizaje no sea completo; la model card no aporta metricas que confirmen la eficacia del olvido en este checkpoint concreto.
- Riesgo de alucinacion: como todo modelo de 1.4B, tiende a inventar hechos, especialmente en preguntas abiertas o multi-turno.
- Sesgos: hereda los sesgos de Phi-1.5 y de los datos sinteticos de TOFU; no se ha realizado una evaluacion de sesgos especifica.
- Limitacion idiomatica: solo ingles; el rendimiento en castellano sera deficiente.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor; conviene auditar antes de cargar en entornos sensibles.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la falta de garantias desaconsejan emplearlo en productos reales.
- El modelo puede retener informacion residual de los datos que se supone debe olvidar; no debe tratarse como garantia de privacidad sin una auditoria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch03
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
