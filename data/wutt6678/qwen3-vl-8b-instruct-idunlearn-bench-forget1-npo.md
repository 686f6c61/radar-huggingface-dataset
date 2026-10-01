# wutt6678/Qwen3-VL-8B-Instruct-IDUnlearn-Bench-forget1-NPO

## Resumen

El repositorio `wutt6678/Qwen3-VL-8B-Instruct-IDUnlearn-Bench-forget1-NPO` es un adaptador LoRA (PEFT) publicado por el usuario wutt6678, construido sobre un modelo base identificado en las etiquetas como `outputs_3/mllmu_vanilla_qwen3-vl-8b`, que a su vez deriva de la familia Qwen3-VL-8B-Instruct. Por su nomenclatura, se trata de un artefacto de investigación orientado al desaprendizaje (machine unlearning) de conocimiento concreto en un modelo de lenguaje y vision multimodal, entrenado con el metodo NPO (Negative Preference Optimization) sobre la tarea de olvido "forget1" del benchmark denominado IDUnlearn-Bench.

El modelo no dispone de model card completa: el README es la plantilla por defecto de HuggingFace con todos los campos marcados como "[More Information Needed]". No se declaran licencia, idiomas, pipeline de inferencia ni procedimiento de entrenamiento. El tamano del repositorio es de 0,2 GB, coherente con un adaptador LoRA y no con un modelo completo de 8.000 millones de parametros.

Su relevancia es, por tanto, exclusivamente investigadora: sirve como punto de comparacion reproducible en estudios de desaprendizaje multimodal (el prefijo "mllmu" sugiere Multimodal LLM Unlearning) y como ejemplo del metodo NPO aplicado sobre una arquitectura vision-lenguaje. No esta pensado para despliegue en produccion ni cuenta con validacion documentada por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo vision-lenguaje derivado de Qwen3-VL-8B-Instruct |
| Parametros totales | No disponible (el repo de 0,2 GB contiene unicamente los pesos del adaptador; el modelo base tendria 8B segun su denominacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; la cuantizacion depende del modelo base sobre el que se aplique) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador de bajo rango (LoRA) distribuido en formato PEFT 0.19.1. El modelo base indicado en las etiquetas es `outputs_3/mllmu_vanilla_qwen3-vl-8b`, un punto de partida "vanilla" (presumiblemente sin desaprendizaje) derivado de Qwen3-VL-8B-Instruct, un transformer multimodal capaz de procesar imagen y texto. No se documenta el rango LoRA, los modulos objetivo, ni la configuracion exacta del entrenamiento.

La unica pista sobre el procedimiento de entrenamiento es el sufijo "NPO" del identificador, que remite a Negative Preference Optimization, una tecnica de desaprendizaje que optimiza el modelo para reducir la probabilidad de respuestas asociadas a un conjunto de datos de olvido ("forget set") evitando el colapso catastrofico del modelo. La tarea "forget1" sugiere que se trata de la primera de varias particiones de olvido del benchmark IDUnlearn-Bench. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, hiperparametros, ni si se aplico alguna fase adicional de alineamiento. El tag `arxiv:1910.09700` corresponde a la referencia por defecto de la plantilla de HuggingFace sobre calculo de impacto ambiental (Lacoste et al., 2019), no a un paper propio de este modelo.

## Capacidades

- No se declaran capacidades especificas en la informacion disponible.
- Por herencia de su arquitectura base (Qwen3-VL-8B-Instruct) cabria esperar generacion de texto, comprension de imagenes y capacidades de instruccion, pero no hay documentacion del autor que lo confirme.
- El proposito declarado del adaptador es de desaprendizaje, es decir, reducir la capacidad del modelo para reproducir cierto conocimiento del conjunto "forget1"; no se detalla que conocimiento ni con que metricas.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; el nombre del modelo sugiere vision, sin confirmacion.

## Casos de uso

- Investigacion en machine unlearning: el adaptador permite reproducir y auditar el comportamiento de NPO aplicado a un modelo multimodal sobre la particion "forget1" de IDUnlearn-Bench, comparandolo con el checkpoint "vanilla" del mismo proyecto.
- Evaluacion comparativa de metodos de olvido: sirve como referencia para contrastar NPO frente a otras tecnicas (gradient ascent, fine-tuning selectivo) sobre el mismo modelo base y el mismo conjunto de olvido.
- Estudio de robustez del desaprendizaje: permite medir si el conocimiento "olvidado" puede recuperarse mediante prompts adversarios, fine-tuning posterior o ataques de extraccion.
- Auditoria de privacidad: util para investigar hasta que punto un adaptador de bajo rango basta para eliminar la memorizacion de datos sensibles de un modelo de 8B sin reentrenar el modelo completo.
- Analisis de coste computacional del desaprendizaje: al ser un adaptador de 0,2 GB, permite estudiar la relacion entre numero de parametros modificados y eficacia del olvido frente a un reentrenamiento completo.
- Base para experimentos derivados: puede emplearse como punto de partida para aplicar tecnicas adicionales de olvido o para estudiar el efecto acumulado de varias particiones "forget" en la misma familia de modelos.
- Docencia y demostraciones de PEFT: por su tamano reducido, es util para ilustrar el flujo de carga de adaptadores LoRA con la libreria transformers y PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna metrica de evaluacion (ni MMLU, ni HumanEval, ni metricas especificas de desaprendizaje como forget quality, model utility o retain accuracy), y no existe documentacion externa verificable asociada a este repositorio.

## Requisitos de hardware

- El adaptador en si ocupa en torno a 0,2 GB, pero requiere cargar el modelo base de 8B para funcionar.
- VRAM estimada para el modelo base: aproximadamente 16 GB en FP16/BF16; unos 8 GB en cuantizacion de 8 bits; unos 5-6 GB en cuantizacion de 4 bits (estimacion general para un modelo de 8B, no confirmada para este caso concreto).
- GPU recomendadas: A100 40 GB o H100 para inferencia en precision completa y lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con una sola instancia; GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) para cuantizacion de 4 u 8 bits.
- Cabe en GPU de consumo: si, aplicando cuantizacion al modelo base y cargando el adaptador LoRA por encima.
- Opciones de despliegue: transformers + PEFT (via de referencia para adaptadores LoRA), vLLM con soporte de LoRA, TGI con adaptadores, o fusion del adaptador en el modelo base y posterior conversion a GGUF para llama.cpp/Ollama (aunque el soporte multimodal en estos ultimos esta limitado).
- Latencia y throughput: no disponibles; dependen del modelo base, la GPU y la cuantizacion utilizada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wutt6678/Qwen3-VL-8B-Instruct-IDUnlearn-Bench-forget1-NPO | Adaptador LoRA de desaprendizaje | No disponible (base 8B) | No disponible | No disponible | HuggingFace, 0 descargas |
| outputs_3/mllmu_vanilla_qwen3-vl-8b (modelo base) | Modelo base de referencia | No disponible | No disponible | No disponible | No disponible publicamente |
| Qwen3-VL-8B-Instruct | Modelo vision-lenguaje de proposito general | 8B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos suficientes para una comparativa cuantitativa de rendimiento. La comparacion se limita al tipo de artefacto y a su disponibilidad.

## Limitaciones y advertencias

- La model card esta vacia: todos los campos relevantes (licencia, uso previsto, datos de entrenamiento, riesgos) figuran como "[More Information Needed]".
- La ausencia de licencia declarada genera incertidumbre legal para cualquier uso, incluido el de investigacion; conviene contactar con el autor antes de reutilizarlo.
- Se desconoce que conocimiento concreto elimina el adaptador y con que eficacia, por lo que no puede asumirse ningun nivel garantizado de olvido.
- Los metodos de desaprendizaje como NPO no garantizan la eliminacion completa de la informacion: el conocimiento puede recuperarse mediante fine-tuning posterior o prompts adversarios.
- El repositorio no tiene descargas ni "likes", lo que indica que no ha sido validado por la comunidad y podria tratarse de un experimento interno no revisado.
- El modelo base referenciado (`outputs_3/mllmu_vanilla_qwen3-vl-8b`) no parece ser un checkpoint publico estandar, lo que puede dificultar la reproduccion exacta.
- Al ser un adaptador multimodal, hereda los sesgos del modelo base Qwen3-VL y de sus datos de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- No se recomienda su uso en produccion sin una evaluacion previa independiente y sin aclarar la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wutt6678/Qwen3-VL-8B-Instruct-IDUnlearn-Bench-forget1-NPO
- Modelo base referenciado en las etiquetas: outputs_3/mllmu_vanilla_qwen3-vl-8b (no disponible como enlace publico)
- Referencia de la plantilla de la model card (calculo de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, repos ni demos adicionales asociados a este modelo en la informacion proporcionada.
