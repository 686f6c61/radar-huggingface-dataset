# vcruz305/Qwen3.8-2.4T-A95B-GGUF

## Resumen

Qwen3.8-2.4T-A95B es un modelo de lenguaje masivo de tipo Mixture of Experts (MoE) desarrollado por Alibaba dentro de la familia Qwen. La version publicada por el usuario vcruz305 es una cuantizacion GGUF del modelo base Qwen/Qwen3.8-2.4T-A95B-FP8, optimizada para su ejecucion con llama.cpp. El nombre del modelo indica 2,4 billones de parametros totales con 95 mil millones de parametros activos por token, una proporcion de activacion del 4 % que permite un rendimiento de inferencia razonable pese al tamano total.

La relevancia de esta publicacion radica en que ofrece el modelo en formato GGUF con cuantizacion IQ1_S, una de las tecnicas de compresion mas agresivas disponibles en llama.cpp, pensada para reducir los requisitos de almacenamiento y VRAM de un modelo de esta escala. El repositorio ocupa 400,5 GB, lo que sigue siendo una cifra considerable pero muy inferior a los mas de 1,8 TB que ocuparia el modelo en precision completa. El acceso es restringido (gated) y requiere aceptar la licencia qwen3.8-max en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) |
| Parametros totales | 2,4 billones (1,83 billones en safetensors) |
| Parametros activos | 95 mil millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S (GGUF) |
| Idiomas soportados | ingles, chino |
| Licencia | qwen3.8-max |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la serie Qwen 3.8 y emplea una arquitectura MoE, donde cada token activa unicamente una fraccion de los expertos disponibles. Con 2,4 billones de parametros totales y 95 mil millones activos, la eficiencia computacional por token es comparable a la de un modelo denso de aproximadamente 95 mil millones de parametros, aunque la capacidad de conocimiento almacenada corresponde a la del modelo completo. Esta arquitectura es especialmente adecuada para tareas que requieren gran conocimiento enciclopedico y razonamiento complejo sin incurrir en el coste computacional de un modelo denso del mismo tamano.

La version publicada en este repositorio es una cuantizacion IQ1_S (1-bit improved quantization) del checkpoint FP8 original, realizada con las herramientas de llama.cpp. La cuantizacion IQ1_S emplea codificacion de baja precision con escalares por bloque, lo que reduce drasticamente el tamano del modelo a costa de cierta perdida de fidelidad en los pesos. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni los metodos de alineacion (RLHF, DPO, etc.) empleados en el modelo original.

## Capacidades

- Generacion de texto conversacional y continuacion de texto en ingles y chino.
- Razonamiento complejo gracias a la gran capacidad parametrica del modelo completo.
- Capacidad multilingue limitada a ingles y chino segun la informacion disponible.
- Compatibilidad con llama.cpp y ecosistemas que soporten formato GGUF.
- Inferencia con cuantizacion extrema IQ1_S, lo que permite ejecutar el modelo en hardware con recursos limitados en comparacion con el checkpoint FP8 original.
- No se dispone de informacion sobre soporte de tool calling, function calling, capacidades de agente, vision o audio para este modelo.

## Casos de uso

- Investigacion academica sobre compresion de modelos: el repositorio sirve como caso de estudio de cuantizacion IQ1_S aplicada a un MoE de escala trillonica, permitiendo analizar la degradacion de calidad frente al modelo FP8 original.
- Generacion de texto en chino e ingles con contexto amplio: la capacidad del modelo para manejar conocimiento extenso puede aprovecharse en tareas de redaccion, traduccion y resumen en ambos idiomas, siempre que el hardware permita cargar los 400,5 GB del repositorio.
- Despliegue local con llama.cpp en entornos con multiples GPUs: al estar en formato GGUF, el modelo puede ejecutarse con llama.cpp distribuyendo las capas entre varias GPUs o combinando CPU y GPU mediante offloading.
- Evaluacion comparativa de cuantizaciones extremas: investigadores pueden comparar la calidad de salida de IQ1_S frente a cuantizaciones menos agresivas (Q4_K_M, Q5_K_M, etc.) del mismo modelo base para determinar el punto optimo de compresion.
- Experimentacion con MoE a escala trillonica: el modelo permite estudiar el comportamiento de expertos especializados en un MoE de 2,4 billones de parametros sin necesidad de acceder al checkpoint FP8 completo.
- Benchmarking de rendimiento en hardware heterogeneo: util para medir throughput y latencia de llama.cpp con modelos de mas de 1,8 billones de parametros cuantizados, informando decisiones sobre arquitecturas de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otros tests estandar, ni comparativas con modelos similares.

## Requisitos de hardware

- Almacenamiento: se requieren al menos 400,5 GB libres para descargar el repositorio completo.
- VRAM estimada: no disponible con precision. Con cuantizacion IQ1_S, el modelo ocupa aproximadamente 1,75 bits por parametro, lo que sugiere un uso de memoria cercano a 400 GB en RAM/VRAM combinadas.
- GPUs recomendadas: no disponible. Un modelo de este tamano no cabe en una GPU consumer (RTX 4090 con 24 GB, por ejemplo) y requeriria multiples GPUs de alta capacidad (A100 80 GB, H100 80 GB) o un sistema con gran cantidad de RAM para CPU offloading.
- Opciones de despliegue: llama.cpp es la opcion principal dado el formato GGUF. Tambien es compatible con cualquier herramienta que soporte GGUF (Ollama, LM Studio, etc.), aunque la escala del modelo puede superar las capacidades de estas herramientas.
- Latencia y throughput: no disponible. Dependera criticamente del hardware, del numero de GPUs y de la configuracion de offloading.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con modelos similares. El modelo Qwen3.8-2.4T-A95B es una publicacion reciente y especifica de la familia Qwen, y no se dispone de datos de rendimiento publicados que permitan compararlo con alternativas como otros MoE de escala trillonica (por ejemplo, modelos de la serie DeepSeek o Mixtral). Se recomienda consultar la documentacion oficial de Qwen para obtener comparativas con modelos de la misma familia.

## Limitaciones y advertencias

- La cuantizacion IQ1_S es extremadamente agresiva (aproximadamente 1 bit por peso) y puede degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento y generacion de codigo.
- El acceso al repositorio es restringido (gated) y requiere aceptar la licencia qwen3.8-max en HuggingFace, que puede imponer restricciones al uso comercial.
- Los idiomas soportados se limitan a ingles y chino; el rendimiento en otros idiomas no esta garantizado.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- El tamano del repositorio (400,5 GB) implica que la descarga y el almacenamiento son costosos, y la inferencia requerira hardware de gama alta o configuraciones de CPU offloading complejas.
- No se han publicado benchmarks ni evaluaciones de sesgos o alucinacion para esta cuantizacion especifica, por lo que su comportamiento en produccion es incierto.
- El modelo es una cuantizacion de terceros (autor vcruz305), no una publicacion oficial de Alibaba, por lo que no hay garantias de fidelidad respecto al checkpoint FP8 original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vcruz305/Qwen3.8-2.4T-A95B-GGUF
- Modelo base (FP8): https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B-FP8
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a esta cuantizacion especifica.
