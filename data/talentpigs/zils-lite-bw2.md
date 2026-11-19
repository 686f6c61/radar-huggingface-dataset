# TalentPigs/zils-lite-bw2

## Resumen

zils-lite-bw2 es un modelo de extraccion de caracteristicas (feature extraction) publicado por TalentPigs, construido como un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B. Con 852.985.920 parametros totales, se enmarca en la familia de modelos ligeros de Qwen y se distribuye bajo licencia Apache-2.0. El autor lo describe como un "d3-lite decision body" orientado al "Zils subnet 127 lite pool", lo que sugiere un uso como componente de decision dentro de una infraestructura denominada Zils.

El modelo se publica con la libreria transformers, pesos en safetensors y la etiqueta pipeline de feature-extraction, lo que indica que su proposito declarado es producir representaciones o embeddings mas que generar texto libre. Al derivar de Qwen3.5-0.8B, hereda la arquitectura y el tokenizador de esa familia, aunque la model card no detalla cambios estructurales respecto al modelo base.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo muy pequeno (menos de mil millones de parametros, repo de 1,7 GB) con licencia permisiva, lo que facilita su despliegue en hardware modesto. Sin embargo, la informacion publicada por el autor es minima y no incluye datos de entrenamiento, benchmarks ni idiomas soportados, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se presenta como un finetune del modelo base Qwen/Qwen3.5-0.8B, por lo que su arquitectura subyacente es la de la familia Qwen3.5 en su variante de 0,8 mil millones de parametros. La model card no especifica si se han modificado capas, cabezas o el esquema de atencion respecto al modelo original, ni si se ha anadido una cabeza de clasificacion o decision especifica. El tag `custom_code` en Hugging Face indica que el repositorio incluye codigo propio, presumiblemente para cargar o utilizar el modelo, pero su contenido no se detalla en la informacion disponible.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineacion, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El autor solo indica que se trata de un "decision body" para el "Zils subnet 127 lite pool", sin aportar mas contexto sobre el procedimiento de ajuste.

## Capacidades

- Extraccion de caracteristicas: el pipeline declarado es feature-extraction, por lo que su uso previsto es generar representaciones vectoriales a partir de entradas de texto.
- Componente de decision: el autor lo etiqueta como `decision-model` y `d3-lite`, lo que sugiere su integracion en un sistema de toma de decisiones dentro de la infraestructura Zils.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a traves de la infraestructura de endpoints de Hugging Face.
- Generacion de texto: no confirmada; aunque el modelo base Qwen3.5-0.8B es un modelo de lenguaje, la model card no declara capacidades generativas para este finetune.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Extraccion de embeddings para busqueda semantica: el modelo puede emplearse para vectorizar documentos o consultas en un motor de recuperacion, aprovechando su pipeline de feature-extraction y su tamano reducido para indexar grandes volumenes con coste bajo.
- Clasificacion o scoring dentro de pipelines de decision: dado su rol declarado como "decision body", encaja como componente de puntuacion o seleccion en sistemas que requieran evaluar entradas y emitir una decision binaria o categorica.
- Filtrado previo en sistemas de moderacion o enrutamiento: al ser un modelo de menos de mil millones de parametros, puede actuar como primera etapa de filtrado antes de invocar modelos mayores, reduciendo latencia y coste.
- Prototipado rapido en entornos con GPU de consumo: su tamano (1,7 GB en safetensors) permite cargarlo en GPUs consumer para experimentacion e iteracion rapida.
- Integracion en servicios serverless o endpoints gestionados: la etiqueta `endpoints_compatible` facilita desplegarlo como servicio de inferencia sin infraestructura propia.
- Investigacion sobre ajuste fino de modelos pequenos: sirve como ejemplo de finetune de Qwen3.5-0.8B para tareas especificas, util para estudiar tecnicas de adaptacion en modelos de baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,4 GB para los pesos (852.985.920 parametros x 4 bytes), mas memoria para activaciones y contexto.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB para los pesos, mas overhead de activaciones.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,85 GB para los pesos; en 4 bits, alrededor de 0,43 GB. Estas cifras son estimaciones teoricas, ya que el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente en fp16; una RTX 3060, RTX 4060 o superior es adecuada. Para fp32 se recomienda al menos 6-8 GB.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer modernas con 6 GB o mas de VRAM.
- Opciones de despliegue: transformers (libreria declarada), endpoints de Hugging Face (tag `endpoints_compatible`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF limita el despliegue en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TalentPigs/zils-lite-bw2 | 852.985.920 | no disponible | apache-2.0 | Hugging Face | Finetune de Qwen3.5-0.8B para feature-extraction/decision |
| Qwen/Qwen3.5-0.8B | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face | Modelo base del que deriva |
| Otros finetunes de Qwen3.5-0.8B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Documentacion minima: la model card no aporta informacion sobre datos de entrenamiento, evaluacion, idiomas ni limitaciones, lo que dificulta evaluar su calidad y adecuacion.
- Riesgo de alucinacion: no evaluado; al ser un modelo derivado de un LLM pequeno, si se usa para generacion podria producir contenido inexacto, aunque su uso declarado es de extraccion de caracteristicas.
- Sesgos conocidos: no documentados; los sesgos del modelo base Qwen3.5-0.8B se heredan previsiblemente, pero no se detallan.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva y la cobertura linguistica.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion, pero el autor remite a los ficheros LICENSE y NOTICE para las atribuciones de componentes upstream, que deben revisarse antes de su redistribucion.
- Dependencia de codigo personalizado: el tag `custom_code` implica que la carga del modelo puede requerir `trust_remote_code=True`, con el riesgo de seguridad asociado a ejecutar codigo de terceros.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia, lo que indica ausencia de validacion por parte de la comunidad.
- Uso previsto acotado: su orientacion a un "subnet 127 lite pool" concreto sugiere que su rendimiento fuera de ese contexto no esta garantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TalentPigs/zils-lite-bw2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
