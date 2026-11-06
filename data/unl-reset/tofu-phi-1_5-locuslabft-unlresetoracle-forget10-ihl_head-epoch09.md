# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch09

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch09` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como parte de un experimento de *machine unlearning* orientado a eliminar el conocimiento de un subconjunto concreto de datos (la partición `forget10`) manteniendo el rendimiento en el resto (partición *retain*).

La intervención técnica es peculiar: los embeddings de entrada y la cabeza del modelo de lenguaje (LM head) se reinicializan desde el checkpoint original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. Sobre esa base se aplica un entrenamiento con una pérdida compuesta que combina una pérdida de tipo IHL (*Inverted Hinge Loss* o variante del autor, según la nomenclatura del checkpoint) sobre los datos a olvidar y una entropía cruzada estándar con peso 1.0 sobre los datos a retener. Este checkpoint corresponde a la época 9 de un total de 20.

Con 1.418 millones de parámetros y un tamaño de repositorio de 2,8 GB en safetensors, es un modelo pequeño pensado exclusivamente para evaluación de metodologías de desaprendizaje, no para uso en producción. Su relevancia actual radica en que TOFU se ha consolidado como uno de los benchmarks de referencia para medir si un modelo puede "olvidar" datos de entrenamiento de forma verificable, y este checkpoint forma parte de una familia de variantes experimentales que permiten comparar estrategias de reinicialización parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar a 8/4 bits mediante herramientas genericas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y `ihl_manifest.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5 de Microsoft: un transformer decoder-only de 1.418 millones de parámetros, entrenado originalmente con un curriculum de datos sinteticos y web filtrados orientado a razonamiento y generacion de codigo en modelos pequenos. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 pares pregunta-respuesta cada uno, disenado para evaluar desaprendizaje.

La innovacion de este checkpoint concreto reside en la estrategia de reinicializacion: los embeddings de entrada y la LM head se restauran desde el modelo original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen del modelo ajustado con TOFU. Sobre esa configuracion se entrena con una funcion de perdida que suma una perdida IHL sobre la particion `forget10` (los 20 autores a olvidar) y una entropia cruzada con coeficiente 1.0 sobre la particion *retain*. El checkpoint corresponde a la epoca 9 de 20. No se especifican en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset mas alla de TOFU, ni si se emplearon tecnicas de RLHF o DPO (TOFU es un benchmark de ajuste supervisado, por lo que es improbable).

## Capacidades

- Generacion de texto en ingles con calidad propia de un modelo de 1.4B parametros.
- Razonamiento basico y respuesta a preguntas de conocimiento general (heredado de Phi-1.5).
- Generacion de codigo en Python y otros lenguajes, capacidad caracteristica de la familia Phi-1.5.
- Razonamiento matematico de nivel escolar y problemas aritmeticos simples.
- No se documenta soporte explicito de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidad multilingue limitada al ingles segun la etiqueta `language: en`.
- No dispone de vision, audio ni modo "thinking" explicito.
- Su capacidad principal en este contexto es servir como objeto de evaluacion de desaprendizaje: se espera que haya "olvidado" la particion `forget10` mientras retiene el resto.

## Casos de uso

- Evaluacion de metodologias de machine unlearning: comparar las metricas de retencion y olvido de este checkpoint (epoca 9, con reinicializacion de embeddings y LM head) frente a otras epocas y variantes de la misma familia para determinar que estrategia de reinicializacion parcial es mas efectiva.
- Investigacion sobre TOFU: usar el modelo como baseline en experimentos que midan la fidelidad del olvido (fidelity), la utilidad del modelo retenido (model utility) y la robustez frente a ataques de extraccion.
- Estudio de la relacion entre embeddings y memorizacion: al reinicializar solo los embeddings y la LM head, permite analizar cuanto del conocimiento especifico de TOFU reside en esas capas frente al resto del transformer.
- Reproducibilidad de experimentos academicos: el checkpoint completo (2,8 GB) permite reproducir exactamente la epoca 9 sin reentrenar, util para verificar resultados publicados.
- Analisis de robustez frente a *jailbreaks* de olvido: comprobar si un atacante puede recuperar la informacion supuestamente olvidada mediante prompting adversarial o fine-tuning ligero.
- Docencia y formacion: ejemplo didactico de como se compone una perdida de desaprendizaje (IHL sobre forget + CE sobre retain) y como se materializa en un checkpoint publico.
- Comparacion de arquitecturas pequenas en tareas de unlearning: al ser un modelo de 1.4B, permite ejecutar barridos de hiperparametros y epocas en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB (1.418M parametros x 2 bytes + overhead de activaciones y cache KV).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,5-1,8 GB.
- VRAM estimada en cuantizacion 4 bits: aproximadamente 0,9-1,2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, GTX 1660 Super en adelante) es suficiente para inferencia en fp16.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090, asi como en Apple Silicon (M1/M2/M3) con al menos 8 GB de memoria unificada.
- Para entrenamiento o fine-tuning completo se recomienda al menos 16-24 GB de VRAM (A100, RTX 4090, L40S) segun el tamano de batch.
- Opciones de despliegue: transformers (con `trust_remote_code=True` por el tag `custom_code`), llama.cpp y Ollama tras conversion a GGUF, vLLM (previa verificacion de compatibilidad con la arquitectura Phi-1.5), TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en una RTX 4090 se espera un throughput de cientos a miles de tokens por segundo para un modelo de este tamano, pero no se aportan mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Este checkpoint (tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch09) | 1.418M | no disponible | apache-2.0 | Unlearning TOFU, epoca 9/20 |
| locuslab/tofu_ft_phi-1.5 | 1.418M | no disponible | no disponible | Modelo base ajustado con TOFU, sin desaprender |
| microsoft/phi-1_5 | 1.418M | 2048 | MIT (original) | Modelo base de proposito general |
| Otros checkpoints de la familia unl-reset | 1.418M | no disponible | apache-2.0 | Variantes de epoca y estrategia de reinicializacion |

La comparacion con modelos de la misma categoria (unlearning sobre TOFU) requiere consultar el resto de checkpoints publicados por `unl-reset` y por `locuslab`, ya que no se dispone de datos de rendimiento en la informacion proporcionada para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas de proposito general; su utilidad esta acotada a la evaluacion de desaprendizaje.
- Rendimiento degradado esperado: al reinicializar embeddings y LM head y entrenar solo 9 epocas con una perdida que penaliza la retencion de `forget10`, es probable que la calidad general en tareas ajenas a TOFU sea inferior a la del modelo base Phi-1.5.
- Riesgo de alucinacion: como cualquier modelo de 1.4B, puede generar contenido factualmente incorrecto, especialmente fuera del dominio de TOFU.
- Sesgos: hereda los sesgos de los datos de entrenamiento de Phi-1.5 y de TOFU; no se documentan evaluaciones de sesgo en la informacion disponible.
- Limitacion idiomatica: solo ingles segun la etiqueta del repositorio; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 original tiene licencia MIT y el checkpoint intermedio `locuslab/tofu_ft_phi-1.5` no declara licencia en la informacion disponible; conviene verificar la cadena de licencias antes de cualquier uso comercial.
- Dependencia de `custom_code`: el tag `custom_code` implica que la carga requiere `trust_remote_code=True`, lo que supone ejecutar codigo del autor; auditar antes de desplegar.
- El olvido no es garantizable: los metodos de unlearning han demostrado ser vulnerables a ataques de extraccion; no debe tratarse este checkpoint como una garantia de que la informacion de `forget10` ha desaparecido de forma irreversible.
- Fecha de creacion futura (2026-11-05) y cero descargas/likes: metadatos que sugieren un artefacto experimental de un pipeline automatizado, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch09
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Paper de TOFU (Task of Fictitious Unlearning): no disponible en la informacion proporcionada
- Repositorio del autor `unl-reset`: https://huggingface.co/unl-reset (perfil)
- Manifiesto del checkpoint (`ihl_manifest.json`): incluido en el repositorio del modelo
