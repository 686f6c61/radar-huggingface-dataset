# vwdubb/Qwen3.8-27B-Uncensored-Terse-Coder

## Resumen

Qwen3.8-27B-Uncensored-Terse-Coder es un modelo de lenguaje de 27.781.427.952 parametros (aproximadamente 27,8 mil millones) publicado por el usuario vwdubb en HuggingFace. Se trata de un merge de tipo LoRA construido sobre el modelo base orcarouter/Qwen3.8-27B-Uncensored, segun indican las propias etiquetas del repositorio (merge, lora, base_model:orcarouter/Qwen3.8-27B-Uncensored). El nombre y las etiquetas delatan dos rasgos diferenciales: por un lado, la herencia "uncensored"/"abliterated" del modelo base, que implica una reduccion deliberada de los mecanismos de rechazo; por otro, el sufijo "Terse-Coder", que apunta a un ajuste orientado a respuestas concisas y a tareas de generacion de codigo.

El repositorio se presenta ademas con las etiquetas reasoning, token-efficient, ai-red-team y conversational, lo que sugiere un uso previsto tanto en tareas de razonamiento y programacion como en ejercicios de red teaming y evaluacion de seguridad de modelos. La licencia declarada es Apache-2.0 y el acceso esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargar los pesos.

La relevancia de esta ficha es limitada pero concreta: se trata de un merge comunitario sin benchmarks publicados, sin documentacion de entrenamiento y con cero descargas y cero likes en el momento de la consulta. Su interes principal reside en servir como caso de estudio del ecosistema de derivados "abliterated" de la familia Qwen y como base para experimentos de red teaming, no como modelo de produccion con garantias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; las etiquetas del repositorio apuntan a la familia qwen3_8 / qwen3_5 (transformer decoder-only) |
| Parametros totales | 27.781.427.952 (aproximadamente 27,8 B) |
| Parametros activos | no aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors (55,6 GB, aproximadamente 2 bytes por parametro, coherente con bf16 o fp16) y no incluye GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Modelo base | orcarouter/Qwen3.8-27B-Uncensored |
| Tipo de artefacto | merge de LoRA sobre el modelo base |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 (segun registro del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF, DPO u otros). Las etiquetas del repositorio indican que se trata de un merge de adaptadores LoRA sobre orcarouter/Qwen3.8-27B-Uncensored, y que el resultado incorpora las caracteristicas "abliterated"/"uncensored" del modelo base junto con un ajuste orientado a la concision ("Terse") y al codigo ("Coder"). La etiqueta qwen3_8 sugiere que la familia subyacente es una iteracion Qwen3, pero no hay documentacion tecnica que lo confirme ni que detalle la ventana de contexto o el tokenizador.

El unico dato cuantitativo verificable es el tamano del repositorio: 55,6 GB para 27,78 mil millones de parametros, lo que equivale a unos 2 bytes por parametro y es consistente con pesos en bf16 o fp16 sin cuantizar. No hay informacion sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, modos de pensamiento explicito) mas alla de las etiquetas reasoning y token-efficient, que no vienen acompanadas de ninguna descripcion metodologica. Tampoco se documenta que tecnicas concretas de "abliteration" se aplicaron al modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta conversational.
- Razonamiento: el repositorio declara la etiqueta reasoning, aunque no se especifica si existe un modo de pensamiento explicito ni como se activa.
- Generacion de codigo: el sufijo "Coder" y la etiqueta coding indican un ajuste orientado a tareas de programacion.
- Respuestas concisas: la etiqueta token-efficient y el termino "Terse" apuntan a un estilo de salida breve, con menor verbosidad explicativa.
- Red teaming y evaluacion de seguridad: la etiqueta ai-red-team sugiere su uso previsto en pruebas adversariales.
- Comportamiento con rechazos reducidos: las etiquetas abliterated y uncensored indican que se han atenuado los mecanismos de negativa del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada.
- Capacidades multimodales (vision, audio): no disponible; no se declaran.
- Cobertura multilingue: no disponible.

## Casos de uso

- Asistente de programacion en local: el ajuste "Coder" y el enfasis en la eficiencia de tokens lo hacen adecuado para autocompletado y generacion de funciones en entornos de desarrollo, donde las respuestas breves reducen el coste de tokens de salida. Requiere cuantizacion para caber en hardware de consumo.
- Red teaming y evaluacion de seguridad: la combinacion de las etiquetas ai-red-team, uncensored y abliterated lo convierte en un candidato para probar la robustez de filtros y clasificadores de contenido frente a un modelo con rechazos atenuados, siempre dentro de un marco controlado y con fines de investigacion.
- Generacion de codigo en pipelines de CI/CD: puede integrarse como paso de generacion de tests, parches o documentacion tecnica, siempre que se validen las salidas con revision humana, ya que no hay benchmarks publicados que respalden su fiabilidad.
- Base para fine-tuning especifico de dominio: al ser un merge con licencia Apache-2.0 declarada, puede servir como punto de partida para ajustes posteriores en nichos concretos (por ejemplo, refactorizacion en un lenguaje determinado), aunque la procedencia del modelo base condiciona el analisis legal.
- Prototipado de agentes conversacionales: la etiqueta conversational permite experimentar con dialogos multi-turno en fases de prototipo, sin comprometerlo a produccion hasta disponer de evaluaciones propias.
- Investigacion sobre concision y eficiencia de tokens: el sesgo "Terse" lo hace util para estudiar el compromiso entre brevedad de respuesta y calidad en tareas de razonamiento, comparando con el modelo base.
- Experimentos de destilacion o generacion de datos sinteticos: un modelo de 27,8 B con licencia permisiva declarada puede emplearse para generar corpus anotados en un dominio concreto, con supervision posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto ninguna evaluacion independiente del modelo. Tampoco se dispone de comparaciones con el modelo base orcarouter/Qwen3.8-27B-Uncensored.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del numero de parametros (27,78 B) y del tamano del repositorio (55,6 GB), no datos oficiales:

- VRAM en bf16/fp16: los pesos ocupan aproximadamente 55,6 GB, por lo que la inferencia requiere del orden de 60-70 GB de VRAM sumando cache KV, segun la longitud de contexto y el tamano de lote.
- VRAM en fp8: en torno a 28 GB de pesos, lo que situa el total en el rango de 30-40 GB.
- VRAM en int4: alrededor de 14-16 GB de pesos, con un total que puede quedar por debajo de los 24 GB en contextos cortos.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, H200. Para fp8: L40S 48 GB, A6000 48 GB, A100 40 GB con contexto reducido.
- GPU de consumo: solo viable con cuantizacion int4; cabe en RTX 4090, RTX 3090 (24 GB) y, con margen ajustado, en RTX 4080 (16 GB) usando cuantizaciones agresivas y contexto corto.
- Opciones de despliegue: vLLM, SGLang y TGI pueden servir los safetensors en bf16 o fp8. llama.cpp y Ollama requieren una conversion a GGUF que el repositorio no proporciona, por lo que habria que generarla a partir de los pesos originales.
- Latencia y throughput: no disponibles. No hay mediciones publicadas y no se conocen detalles de arquitectura suficientes para estimarlas con rigor.
- Nota operativa: el acceso esta restringido en HuggingFace, por lo que cualquier despliegue exige primero aceptar las condiciones del repositorio.

## Comparativa con modelos similares

No hay datos de rendimiento disponibles para este modelo, por lo que la comparacion se limita a parametros, contexto y licencia. Los datos de los modelos alternativos corresponden a sus especificaciones publicas ampliamente conocidas.

| Modelo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Terse-Coder | 27,78 B | no disponible | Apache-2.0 declarada | Gated en HuggingFace |
| Qwen3-32B | 32,8 B | 128 k tokens | Apache-2.0 | Abierto |
| Gemma 3 27B | 27 B | 128 k tokens | Licencia propia de Gemma | Abierto con condiciones |
| Mistral Small 3 (24B) | 24 B | 32 k tokens | Apache-2.0 | Abierto |

En todos los casos, el rendimiento comparado figura como no disponible: no existen benchmarks publicados de este merge que permitan situarlo frente a esas alternativas.

## Limitaciones y advertencias

- Ausencia total de evaluacion: cero benchmarks publicados, cero descargas y cero likes en el momento de la consulta. No hay evidencia empirica de su calidad en codigo, razonamiento o matematicas.
- Procedencia opaca: no se documentan los datos de entrenamiento, el proceso de merge ni las tecnicas de abliteration aplicadas. La trazabilidad del modelo es minima.
- Comportamiento con rechazos atenuados: las caracteristicas abliterated y uncensored reducen las negativas del modelo, lo que incrementa el riesgo de generar contenido danino, sesgado o ilegal. No es adecuado para aplicaciones orientadas al publico sin filtros externos.
- Riesgo de alucinacion: al no existir evaluaciones, no hay estimacion de la tasa de alucinacion ni del comportamiento en dominios factuales.
- Sesgos: no disponibles. No se ha publicado ningun analisis de sesgo, y el proceso de abliteration puede alterar de forma impredecible el comportamiento del modelo en temas sensibles.
- Concision como posible limitacion: el ajuste "Terse" puede degradar la calidad en tareas que requieren explicaciones largas, cadenas de razonamiento extensas o justificaciones detalladas.
- Idiomas y contexto desconocidos: se desconoce la ventana de contexto real y la cobertura idiomatica, lo que impide garantizar un comportamiento correcto en castellano o en contextos largos.
- Licencia: el repositorio declara Apache-2.0, pero la licencia del modelo base (orcarouter/Qwen3.8-27B-Uncensored) y de la familia subyacente deberia verificarse antes de un uso comercial, ya que la etiqueta base_model:adapter sugiere una cadena de derivaciones.
- Acceso restringido: el repositorio es gated, lo que anade una dependencia operativa para despliegues automatizados.
- Fechas del registro: las marcas temporales del repositorio (creacion y actualizacion el 2026-09-25) no permiten contrastar la madurez real del artefacto.
- Uso etico y legal: cualquier aplicacion de red teaming debe realizarse en un entorno controlado y conforme a la normativa aplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Qwen3.8-27B-Uncensored-Terse-Coder
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Paper tecnico: no disponible
- Repositorio de codigo: no disponible
- Blog o anuncio: no disponible
- Demo: no disponible
- Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo; los resultados obtenidos eran completamente ajenos a la consulta.
