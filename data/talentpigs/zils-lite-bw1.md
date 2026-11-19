# TalentPigs/zils-lite-bw1

## Resumen

zils-lite-bw1 es un modelo de extraccion de caracteristicas (feature extraction) publicado por TalentPigs, derivado mediante fine-tuning del modelo base Qwen/Qwen3.5-0.8B. Segun la model card, se trata de un "cuerpo de decision" (decision body) de la variante d3-lite, orientado al pool lite de la subnet 127 de Zils. Con 852.985.920 parametros totales y un repositorio de 1,7 GB, se situa en la franja de modelos pequenos, pensados para ejecucion eficiente y despliegue con requisitos de hardware modestos.

El modelo se distribuye en formato safetensors bajo la libreria transformers, con pipeline declarado de feature-extraction y la etiqueta de modelo de decision. Al estar construido sobre la familia Qwen3.5, hereda la arquitectura transformer de dicho modelo base, aunque la model card no detalla ni el proceso de entrenamiento ni los datos utilizados. La licencia es Apache-2.0, lo que facilita su uso comercial con las obligaciones habituales de atribucion.

Su relevancia actual es limitada pero concreta: se trata de un artefacto especializado dentro de un ecosistema de subred (Zils subnet 127), no de un modelo generalista. No cuenta con descargas ni likes en el momento de la consulta, y la documentacion publicada es minima, por lo que cualquier evaluacion debe apoyarse en pruebas propias sobre el checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (derivada de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Pipeline | feature-extraction |
| Tamano del repositorio | 1,7 GB |
| Libreria | transformers |
| Codigo personalizado | si (tag custom_code) |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que el modelo es un fine-tune de Qwen/Qwen3.5-0.8B, por lo que su arquitectura subyacente es la del transformer de la familia Qwen3.5 en su variante de 0,8 mil millones de parametros. El numero total de parametros reportado en safetensors (852.985.920) es coherente con ese tamano. No se especifica si se trata de un transformer denso o de una variante con mezcla de expertos, ni se detalla la configuracion de atencion, el vocabulario o la ventana de contexto efectiva.

Respecto al entrenamiento, la model card no aporta informacion sobre el numero de tokens utilizados, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta el procedimiento de destilacion o alineamiento que justifique la etiqueta "decision-model". Cualquier afirmacion adicional sobre el entrenamiento seria especulativa y no debe asumirse.

## Capacidades

- Extraccion de caracteristicas: el pipeline declarado es feature-extraction, por lo que el uso previsto es la obtencion de representaciones vectoriales a partir de texto.
- Modelo de decision: las etiquetas decision-model, zils y d3-lite sugieren un uso como componente de decision dentro de un pipeline mayor, aunque no se documenta el formato de entrada ni de salida.
- Generacion de texto: no confirmada en la informacion disponible; al derivar de un modelo de lenguaje, es plausible, pero no esta declarada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta informado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Extraccion de embeddings para busqueda semantica: al declarar el pipeline feature-extraction, el modelo puede emplearse para vectorizar documentos o consultas en un indice y alimentar un motor de recuperacion; su tamano reducido permite generar embeddings en lote con coste bajo.
- Clasificacion y filtrado en pipelines de datos: las representaciones extraidas pueden alimentar un clasificador ligero para etiquetar, deduplicar o filtrar grandes volumenes de texto antes de un procesamiento posterior.
- Componente de decision en la subnet 127 de Zils: segun la model card, esta disenado como decision body del pool lite, por lo que su uso natural es la evaluacion o seleccion de candidatos dentro de ese ecosistema.
- Prototipado rapido en entornos con recursos limitados: con menos de mil millones de parametros, cabe en GPU de consumo y permite iterar sobre arquitecturas de extraccion de caracteristicas sin infraestructura dedicada.
- Servicio de inferencia de baja latencia: al ser un modelo pequeno en safetensors, puede servirse con transformers o con motores compatibles para tareas de embedding en tiempo casi real.
- Base para fine-tuning posterior: su licencia Apache-2.0 y su tamano permiten reentrenarlo o adaptarlo con LoRA en una unica GPU para tareas especificas de representacion.
- Evaluacion comparativa de modelos base: util como punto de referencia de la familia Qwen3.5-0.8B en experimentos de extraccion de caracteristicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,4 GB solo para pesos, mas memoria para activaciones.
- VRAM estimada en bf16/fp16: aproximadamente 1,7 GB para pesos, mas overhead de runtime; en la practica, entre 2 y 3 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,9-1,0 GB para pesos; en 4 bits, aproximadamente 0,5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100 son adecuadas.
- Cabe en GPU de consumo: si, con holgura, incluidas tarjetas de gama media y algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers es la libreria declarada; al ser safetensors, tambien puede convertirse a GGUF para llama.cpp u Ollama, o servirse con TGI y vLLM, aunque estas rutas no estan documentadas por el autor y requieren validacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| TalentPigs/zils-lite-bw1 | 852.985.920 | no disponible | Apache-2.0 | Fine-tune de Qwen3.5-0.8B para feature-extraction y decision |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible en esta ficha | no disponible | Modelo base del que deriva; capacidades generales de lenguaje |
| Otros fine-tunes de la familia Qwen3.5-0.8B | ~0,8 mil millones | variable | variable | Alternativas de la misma franja; no se dispone de datos concretos |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Documentacion minima: la model card no describe datos de entrenamiento, contexto, idiomas ni comportamiento esperado, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion: si se emplea para generacion de texto, al derivar de un modelo de lenguaje pequeno, el riesgo de respuestas incorrectas o inventadas es alto; no se ha validado su comportamiento.
- Sesgos: no documentados; al heredar el corpus del modelo base, puede reproducir sesgos presentes en el.
- Limitaciones de contexto e idioma: desconocidas; el campo de idiomas aparece como no disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero exige conservar avisos de licencia y atribuciones; la model card remite a LICENSE y NOTICE para las atribuciones del modelo base.
- Dependencia de codigo personalizado: la etiqueta custom_code implica que la carga puede requerir trust_remote_code y revision del codigo incluido antes de ejecutarlo.
- Ausencia de validacion externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia publica de calidad ni de estabilidad.
- Uso previsto acotado: el pipeline feature-extraction no garantiza un comportamiento correcto como modelo conversacional o de razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TalentPigs/zils-lite-bw1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
