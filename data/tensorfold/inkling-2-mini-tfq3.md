# TensorFold/Inkling-2-Mini-TFQ3

## Resumen

Inkling-2-Mini-TFQ3 es un checkpoint cuantizado del modelo Inkling 2 Mini desarrollado originalmente por Thinking Machines Lab. La cuantizacion ha sido realizada por TensorFold empleando su formato propietario TFQ3, que reduce el peso del checkpoint original de 18,8 GiB a 15,60 GiB, es decir, unos 3,2 GiB menos. El modelo cuenta con 1.927.460.352 parametros totales segun los datos de safetensors, y se distribuye bajo licencia Apache 2.0.

Se trata de una publicacion de caracter preliminar: el autor indica explicitamente que la inspeccion de formato ha pasado para las 24 shards de capas TFQ3 y el fichero de tablas compartidas, pero que las pruebas de generacion extremo a extremo y los benchmarks de calidad estan pendientes. Por tanto, es un artefacto orientado a usuarios que ya dispongan de una build de TensorFold con soporte TFQ3 para Inkling 2 Mini y quieran evaluar el checkpoint antes de que se publiquen validaciones de calidad.

La relevancia de esta ficha es doble: por un lado documenta un formato de cuantizacion poco extendido (TFQ3, ligado al ecosistema TensorFold y a la herramienta modelopt); por otro, advierte de que el modelo base Inkling 2 Mini no dispone de model card publica en la informacion proporcionada, por lo que muchos datos tecnicos deben tratarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `inkling2_loop` en Hugging Face, sin detalle en la model card) |
| Parametros totales | 1.927.460.352 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | TFQ3 (formato propietario de TensorFold, requiere build con soporte TFQ3 para Inkling 2 Mini) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (24 shards de capas TFQ3 + fichero de tablas compartidas + tokenizer) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Inkling 2 Mini en la documentacion proporcionada. La etiqueta `inkling2_loop` sugiere una variante de la familia Inkling 2 con algun mecanismo de bucle o recurrencia, pero la model card no detalla si se trata de un transformer denso, un modelo hibrido o una arquitectura con atencion lineal. Tampoco se especifican el numero de capas, la dimension oculta ni la configuracion de atencion.

Respecto al entrenamiento, no hay datos sobre el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico documentado es el proceso de cuantizacion posterior: TensorFold ha modificado los pesos del checkpoint original para producir el formato TFQ3, manteniendo las 24 shards de capas y las tablas compartidas. La herramienta citada en las etiquetas es `modelopt`, lo que sugiere un pipeline de cuantizacion basado en NVIDIA Model Optimizer, aunque la model card no lo confirma explicitamente.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se detalla en la model card.
- Razonamiento y codigo: no disponible; no hay documentacion que confirme ni descarte estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad de despliegue: requiere una build de TensorFold con soporte TFQ3 para Inkling 2 Mini; no se garantiza compatibilidad con otros runners.

## Casos de uso

- Evaluacion de formatos de cuantizacion: el checkpoint sirve para que equipos de infraestructura comparen el tamano (15,60 GiB frente a 18,8 GiB del original) y el comportamiento de TFQ3 frente a otras tecnicas de cuantizacion en un modelo de ~1,9 mil millones de parametros.
- Pruebas de integracion con TensorFold: util para validar que una build con soporte TFQ3 carga correctamente las 24 shards de capas y el fichero de tablas compartidas antes de desplegar en produccion.
- Prototipado en entornos con VRAM limitada: al reducir el peso del checkpoint, permite probar el modelo base en GPUs con menos memoria que las necesarias para el checkpoint original de 18,8 GiB.
- Investigacion sobre cuantizacion post-entrenamiento: permite estudiar la degradacion de calidad de TFQ3 una vez se publiquen los benchmarks pendientes, comparando contra el modelo base.
- Despliegue interno experimental: adecuado para pipelines internos donde el equipo controla la version de TensorFold y puede asumir la falta de validacion end-to-end publicada.
- Reproduccion de artefactos: util para auditar la cadena de custodia entre el modelo original de Thinking Machines Lab y la version cuantizada de TensorFold bajo licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las pruebas de generacion extremo a extremo y los benchmarks de calidad estan pendientes.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 15,60 GiB en disco; en memoria, una carga en precision del formato TFQ3 requerira al menos esa cantidad mas overhead de runtime (valores exactos no disponibles).
- GPU recomendadas: no disponible; depende de la build de TensorFold y del backend que utilice.
- Cabe en GPU de consumo: probablemente en GPUs con 24 GB o mas (por ejemplo, RTX 3090 o RTX 4090), aunque no esta confirmado por el autor.
- Opciones de despliegue: exclusivamente TensorFold con soporte TFQ3 para Inkling 2 Mini; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-TFQ3 | 1.927.460.352 | no disponible | Apache 2.0 | safetensors (TFQ3) | Hugging Face, 0 descargas |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| Alternativas de ~2B parametros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para establecer una comparativa con modelos de la misma categoria. El unico punto de referencia claro es el modelo base Inkling 2 Mini, del que no se detallan especificaciones en la informacion proporcionada.

## Limitaciones y advertencias

- Validacion incompleta: la model card declara que las pruebas de generacion end-to-end y los benchmarks de calidad estan pendientes; no hay garantia de que el checkpoint produzca salidas correctas.
- Dependencia de tooling propietario: requiere una build especifica de TensorFold con soporte TFQ3 para Inkling 2 Mini; no funciona con runners estandar.
- Fragmentacion del artefacto: es imprescindible mantener juntas las 24 shards de capas TFQ3, el fichero de tablas compartidas, los safetensors y el tokenizer; perder cualquier pieza invalida la carga.
- Falta de documentacion del modelo base: no se conocen arquitectura, contexto, idiomas ni sesgos del modelo original a partir de la informacion disponible.
- Riesgo de alucinacion: no evaluado; sin benchmarks publicados no puede caracterizarse.
- Sesgos conocidos: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del checkpoint cuantizado; conviene revisar la licencia del modelo base por si impone condiciones adicionales.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (26 de noviembre de 2026), lo que indica una publicacion recien lanzada sin validacion comunitaria.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/TensorFold/Inkling-2-Mini-TFQ3
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
