# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch13

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch13` es un checkpoint de investigacion derivado de Phi-1.5, publicado por el grupo `unl-reset`. No se trata de un modelo de proposito general, sino de un artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), una metodologia de evaluacion del desaprendizaje (machine unlearning) en modelos de lenguaje. El modelo parte de `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 ajustado sobre el dataset TOFU, y aplica una intervencion concreta: reinicializar los embeddings de entrada y la cabeza del modelo de lenguaje (LM head) desde el Phi-1.5 original de Microsoft, conservando el resto de pesos del modelo ajustado.

La intervencion se combina con un objetivo de entrenamiento que aplica "Token IHL" sobre el conjunto *forget* y entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El nombre del checkpoint (`forget05`, `epoch13`) indica que corresponde al subconjunto de olvido 05 de TOFU y a la epoca 13 de un total de 20. El objetivo declarado es evaluar si la reinicializacion de componentes clave ("reset both") mejora la capacidad de olvidar informacion especifica sin degradar el rendimiento en el resto del conocimiento.

Con 1.418.270.720 parametros (aproximadamente 1.4 mil millones), es un modelo pequeno y manejable en hardware de consumo. Su relevancia es fundamentalmente metodologica: sirve como punto de comparacion en estudios de unlearning, no como modelo para despliegue en produccion. La licencia es Apache 2.0 y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con reinicializacion de embeddings de entrada y LM head |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser safetensors en fp16/fp32 se puede cuantizar con herramientas estandar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Phi-1.5, con aproximadamente 1.4 mil millones de parametros. La particularidad de este checkpoint es que los embeddings de entrada (token embeddings) y la cabeza de lenguaje (LM head) se inicializan desde el modelo original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado `locuslab/tofu_ft_phi-1.5`. Esta operacion, denominada "reset both" en el nombre del checkpoint, busca eliminar la huella de la informacion aprendida en las capas de entrada y salida, que son las mas directamente asociadas a la memorizacion de tokens y secuencias.

El entrenamiento combina dos terminos de perdida: "Token IHL" sobre el conjunto *forget* (el subconjunto de datos que se desea olvidar) y entropia cruzada estandar con peso 1.0 sobre el conjunto *retain* (el conocimiento que se desea preservar). El checkpoint corresponde a la epoca 13 de 20. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si se aplicaron tecnicas adicionales como RLHF o DPO. El modelo requiere `custom_code` para su carga, lo que implica que no es un checkpoint estandar de transformers y necesita el codigo especifico del repositorio.

## Capacidades

- Generacion de texto en ingles: al estar basado en Phi-1.5, conserva la capacidad de generar texto coherente, aunque el proceso de unlearning puede haber degradado parcialmente esta habilidad.
- Razonamiento basico y respuesta a preguntas: Phi-1.5 fue entrenado con enfasis en razonamiento y conocimiento general, pero este checkpoint esta orientado a experimentos de olvido, no a uso general.
- Codigo: Phi-1.5 original tiene cierta capacidad de generacion de codigo; no se ha verificado si se conserva tras el proceso de reset y ajuste.
- Matematicas: capacidad limitada, heredada de Phi-1.5, sin datos especificos de evaluacion en este checkpoint.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no es un objetivo del modelo.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales: el modelo implementa un mecanismo de "reset" de embeddings y LM head, que es una innovacion metodologica para estudios de unlearning, no una capacidad funcional para el usuario final.

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como punto de referencia para evaluar si la reinicializacion de embeddings y LM head mejora las metricas de olvido en el benchmark TOFU. Se compararia con otros checkpoints de la misma familia (por ejemplo, variantes sin reset o con reset parcial).
- Evaluacion de metodos de desaprendizaje: permite medir la degradacion en el conjunto *retain* y la eficacia en el conjunto *forget* mediante metricas como accuracy, ROUGE o probabilidad de tokens especificos.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), facilita la reproduccion de resultados en papers de unlearning.
- Analisis de sesgos post-unlearning: se puede estudiar si el proceso de olvido introduce o amplifica sesgos en las representaciones internas.
- Docencia y formacion: util como ejemplo practico de tecnicas de intervencion en modelos (reset de capas) y de evaluacion de olvido.
- Baseline en competiciones de unlearning: sirve como referencia para comparar nuevos algoritmos que busquen superar la combinacion de IHL y reset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 1.4 mil millones de parametros, en fp16 requiere aproximadamente 2.8 GB de VRAM; en int8 unos 1.4 GB; en int4 unos 0.7 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo en cuantizacion int8 o int4. Para fp16 se recomienda una RTX 3060 o superior.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas.
- Opciones de despliegue: al requerir `custom_code`, la carga con transformers necesita `trust_remote_code=True`. Para inferencia optimizada se puede convertir a GGUF y usar llama.cpp u Ollama, o emplear vLLM si se adapta el codigo personalizado. TGI no esta garantizado sin conversion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; en una RTX 4090 se espera un throughput de decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (TOFU forget05, reset both) | 1.4B | no disponible | Apache 2.0 | HuggingFace | Checkpoint experimental de unlearning |
| locuslab/tofu_ft_phi-1.5 | 1.4B | no disponible | Apache 2.0 | HuggingFace | Modelo base ajustado en TOFU, sin reset |
| microsoft/phi-1_5 | 1.3B | 2048 | MIT | HuggingFace | Modelo original de Microsoft, sin ajuste TOFU |
| Otros checkpoints de unl-reset | 1.4B | no disponible | Apache 2.0 | HuggingFace | Variantes con diferentes estrategias de reset y epocas |

No se dispone de datos de rendimiento comparativo (benchmarks) para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni para aplicaciones de usuario final; su proposito es experimental.
- Riesgo de alucinacion: como cualquier modelo de lenguaje pequeno, puede generar informacion falsa o incoherente, especialmente tras el proceso de unlearning.
- Degradacion del conocimiento: el objetivo de olvido puede haber eliminado no solo la informacion objetivo sino tambien conocimiento general, reduciendo la calidad de las respuestas.
- Idioma limitado: solo ingles; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT; se debe verificar la compatibilidad y el cumplimiento de ambas licencias.
- Requiere `custom_code`: la carga no es estandar y puede fallar con versiones futuras de transformers; es necesario revisar el codigo del repositorio.
- Sin garantias de soporte: al ser un checkpoint con 0 descargas y 0 likes, no hay comunidad ni mantenimiento documentado.
- Sesgos: no se han documentado sesgos especificos, pero al derivar de Phi-1.5 y del dataset TOFU, puede heredar sesgos de ambos.

## Enlaces

- [HuggingFace: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch13](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch13)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- No se han encontrado papers, blogs o repositorios adicionales en la informacion proporcionada.
