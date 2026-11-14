# stuarch/granite-4.2-30b-heretic

## Resumen

`stuarch/granite-4.2-30b-heretic` es un modelo publicado en Hugging Face por el usuario `stuarch` bajo licencia Apache 2.0. Por el identificador se deduce que se trata de una variante del modelo Granite 4.2 de 30 000 millones de parametros de IBM, sometida a un proceso de "abliteracion" o "des-aliñamiento" parcial (de ahi el sufijo "heretic", habitual en la comunidad para designar fine-tunes que eliminan o atenuan los mecanismos de rechazo aprendidos por RLHF).

La model card publicada es practicamente vacia: solo contiene el campo de licencia, sin descripcion, sin detalles de entrenamiento y sin datos de evaluacion. No se especifican idiomas soportados, arquitectura concreta, longitud de contexto ni formato de pesos mas alla de lo que se puede inferir del nombre del repositorio. El modelo registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y sin validacion por parte de la comunidad.

Su relevancia es, por tanto, limitada y de nicho: interesa a quien quiera experimentar con variantes sin restricciones de rechazo de la familia Granite, pero no dispone de documentacion tecnica que permita evaluar su calidad, su fidelidad al modelo base ni los riesgos asociados a la modificacion de sus alineamientos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el nombre, derivada de IBM Granite 4.2; sin confirmar en la model card) |
| Parametros totales | 30 000 millones (inferido del identificador; no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. Por el identificador se infiere que parte de un modelo de la familia Granite 4.2 de IBM con aproximadamente 30 000 millones de parametros, pero no se confirma si se trata de un transformer denso, de una variante MoE ni de una arquitectura hibrida. Tampoco se documenta la longitud de contexto nativa del modelo base.

Respecto al entrenamiento, el sufijo "heretic" sugiere una modificacion del comportamiento alineado del modelo original, tipicamente mediante tecnicas de abliteracion (ablacion de direcciones de activacion asociadas al rechazo) o mediante fine-tuning con datos que revierten las negativas aprendidas por RLHF/DPO. El autor no describe el metodo, el volumen de datos empleados, la composicion del dataset ni si se realizo alguna fase de RLHF adicional. No hay informacion sobre innovaciones tecnicas, decodificacion especulativa ni optimizaciones de atencion.

## Capacidades

- Generacion de texto: se asume capacidad de continuacion y redaccion, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento y matematicas: no disponible; no se han publicado resultados.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Comportamiento sin rechazo: la unica caracteristica diferenciadora documentada implicitamente por el nombre es la atenuacion o eliminacion de respuestas de negativa del modelo base.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia la tasa de rechazo y la calidad de respuesta tras aplicar tecnicas de abliteracion sobre un modelo base de 30 000 millones de parametros, comparando pares de prompts entre el original y la variante.
- Red teaming y evaluacion de robustez: util para construir conjuntos de prompts adversarios y medir la facilidad con la que un modelo des-aliñado produce contenido que el modelo base rechazaria.
- Generacion creativa sin filtros editoriales: escritura de ficcion con tematicas sensibles (violencia en narrativa, dialogos crudos) donde los rechazos del modelo base interrumpen el flujo de generacion.
- Analisis de sesgos y toxicidad: al eliminar parte de las barreras de rechazo, el modelo puede emplearse como sujeto de estudio para medir sesgos latentes que el alineamiento enmascaraba.
- Prototipado de pipelines de texto a gran escala: con 30 000 millones de parametros y licencia Apache 2.0, puede servir como generador en tareas internas de resumen o parafraseo donde no se requiere alineamiento estricto.
- Fine-tuning posterior sobre dominios especificos: al estar bajo Apache 2.0, es posible reentrenarlo o adaptarlo con LoRA para tareas verticales, partiendo de un checkpoint ya modificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. Para un modelo denso de 30 000 millones de parametros, las estimaciones habituales serian aproximadamente 60 GB en FP16, 30-32 GB en cuantizacion de 8 bits y 18-20 GB en cuantizacion de 4 bits.
- GPU recomendadas: para FP16, una A100 de 80 GB o dos A100 de 40 GB; para 8 bits, una A100 de 40 GB o una RTX 6000 Ada; para 4 bits, una RTX 4090 de 24 GB podria ser suficiente, aunque sin confirmacion del formato de pesos disponible.
- GPU de consumo: plausible en RTX 4090 (24 GB) y RTX 3090 (24 GB) unicamente con cuantizacion de 4 bits, siempre que existan pesos GGUF o AWQ publicados, lo cual no se ha verificado.
- Opciones de despliegue: no documentadas. Si los pesos estan en safetensors, serian compatibles con vLLM, TGI o transformers; si solo hay pesos completos, llama.cpp y Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| stuarch/granite-4.2-30b-heretic | 30 000 M (inferido) | no disponible | Apache 2.0 | Variante des-aliñada sin documentacion |
| IBM Granite 4.x (modelo base) | ~30 000 M | no disponible en esta ficha | Apache 2.0 | Modelo original con alineamiento estandar |
| Otras variantes "heretic" de la comunidad | variable | variable | variable | Fine-tunes de abliteracion sin evaluacion estandarizada |

No se dispone de datos de rendimiento del modelo ni de sus alternativas en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe arquitectura, datos de entrenamiento ni evaluaciones, lo que impide verificar cualquier afirmacion sobre su calidad.
- Riesgo elevado de alucinacion y de respuestas daninas: al tratarse de una variante des-aliñada, es esperable que produzca contenido que el modelo base rechazaria, sin que exista una evaluacion que cuantifique ese riesgo.
- Sesgos desconocidos: no se ha publicado ningun analisis de sesgos; la abliteracion puede amplificar sesgos latentes al eliminar capas de control.
- Idiomas no declarados: se desconoce si conserva el multilingueismo del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal y etica sobre las salidas del modelo.
- Sin validacion comunitaria: 0 descargas y 0 likes indican que el checkpoint no ha sido probado por terceros; no se recomienda su uso en produccion sin una evaluacion propia exhaustiva.
- Procedencia del checkpoint no verificada: no se confirma que los pesos deriven realmente de Granite 4.2 ni que la modificacion se haya realizado con un metodo reproducible.

## Enlaces

- Hugging Face: https://huggingface.co/stuarch/granite-4.2-30b-heretic
