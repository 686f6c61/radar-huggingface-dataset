# staccs/Seed-OSS-36B-Instruct-lecore-mlx

## Resumen

Seed-OSS-36B-Instruct-lecore-mlx es una cuantizacion de precision mixta en formato MLX del modelo ByteDance-Seed/Seed-OSS-36B-Instruct, publicada por el usuario staccs. No se trata de un modelo nuevo ni de un ajuste fino: el autor solo aplica cuantizacion sobre los pesos originales, sin reentrenamiento, y conserva la licencia Apache 2.0 del modelo base. El resultado es un checkpoint de 36.151.104.512 parametros (~36,15 mil millones) que ocupa 18,99 GB en disco, pensado para ejecutarse en Apple Silicon mediante la libreria mlx-lm.

La innovacion del repositorio esta en como se eligen los bits. En lugar de aplicar una receta uniforme, cada tensor lineal del decodificador se cuantiza de forma aislada a 2, 3 y 4 bits y se mide el dano con la divergencia KL frente a la distribucion fp16 de siguiente token sobre un conjunto de calibracion. Despues se asigna el numero de bits de forma greedy, partiendo de 4 bits en todas las capas y aplicando la degradacion con menor dano medido por byte ahorrado hasta encajar en el presupuesto de tamano. El histograma final combina 8 tensores a 2 bits, 116 a 3 bits y 324 a 4 bits, con embeddings a 4 bits y lm_head a 6 bits.

El interes practico es que permite llevar un modelo de ~36B a un portatil Apple con memoria unificada de 32-36 GB con un coste medido de perplexity muy contenido: 4,201 bits por peso (bpw) frente a los 3,500 bpw de la cuantizacion MLX estandar de 3 bits, con mejor perplexity en WikiText-2 que la referencia bf16 en la medicion publicada. El repositorio no incluye benchmarks de tareas downstream, no declara idiomas soportados y, en el momento de la consulta, registra 0 descargas y 0 likes, por lo que no existe validacion comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (se mencionan capas lineales del decodificador; no se detalla la arquitectura interna en la informacion proporcionada) |
| Parametros totales | 36.151.104.512 (~36,15 mil millones) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | MLX affine de precision mixta, group size 64; embeddings a 4 bits, lm_head a 6 bits; capas lineales a 2/3/4 bits (histograma: 8 tensores a 2 bits, 116 a 3 bits, 324 a 4 bits); ~4,201 bpw |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (library_name: mlx); 18,99 GB de pesos |

## Arquitectura y entrenamiento

El repositorio no entrena nada: parte de los pesos de ByteDance-Seed/Seed-OSS-36B-Instruct y solo aplica cuantizacion, tal y como declara el autor ("Only quantization was done here: no retraining"). El procedimiento de seleccion de bits se divide en dos fases. Primero, cada tensor lineal del decodificador se cuantiza por separado con cuantizacion affine de MLX y group size 64 a 2, 3 y 4 bits, y se mide el dano como KL(fp16 || cuantizado) sobre las distribuciones de siguiente token. El conjunto de calibracion combina 3066 tokens de entrenamiento de WikiText-2, 1022 tokens de codigo Python y una sonda estructurada de leCore que cubre prosa, codigo, SQL y markdown.

En la segunda fase, la asignacion de bits es greedy: se arranca con 4 bits en todos los tensores y se aplica repetidamente la degradacion con menor dano medido por byte ahorrado hasta que el tamano de fichero predicho encaja en el presupuesto. La conversion final se realiza con `mlx_lm.convert` y un `quant_predicate` por capa. El autor indica que la herramienta de seleccion (leCore Unicron `requantize`) fue portada a GPU para este tamano de modelo. No se describe ninguna modificacion de atencion, decodificacion especulativa ni cambio estructural: la arquitectura efectiva es la del modelo base.

## Capacidades

- Generacion de texto y uso conversacional: el pipeline declarado es `text-generation` y los tags incluyen `conversational`, heredados del modelo base instruct.
- Razonamiento y codigo: no se documentan en la informacion proporcionada; el unico indicio es que el conjunto de calibracion incluye codigo Python, SQL y markdown, y que se reporta perplexity especifica sobre codigo Python.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas no esta informado en el repositorio).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Ejecucion local en Apple Silicon: capacidad operativa confirmada mediante `mlx_lm.generate`, con `--max-kv-size` configurable (ejemplo de 8192 en la model card).

## Casos de uso

- Asistente de codigo totalmente local en un Mac: con 18,99 GB de pesos, el modelo cabe en un equipo Apple Silicon de memoria unificada alta y se invoca con `mlx_lm.generate`, sin enviar codigo propietario a servicios externos. Es adecuado para equipos que no pueden usar APIs en la nube por politica de datos.
- Generacion y revision de SQL: el conjunto de calibracion incluye SQL de forma explicita y la libreria permite prompts largos con `--max-kv-size` ajustado, lo que encaja en tareas de analisis de esquemas y redaccion de consultas sobre un almacen de datos interno.
- Procesamiento de documentacion tecnica en local: al ejecutarse en el portatil, se puede resumir, reescribir o clasificar documentacion interna (markdown, prosa tecnica) sin coste por token y sin depender de conectividad.
- Prototipado de aplicaciones conversacionales: sirve como backend de un prototipo en MLX para validar prompts, formatos de salida y flujos multi-turno antes de decidir si se despliega una version mayor o un servicio gestionado.
- Evaluacion comparativa de estrategias de cuantizacion: el repositorio publica su metodologia y sus numeros de perplexity, por lo que es util como referencia reproducible para equipos que esten decidiendo entre cuantizacion uniforme a 3 bits y precision mixta guiada por medicion.
- Inferencia en portatiles para demos y formaciones: un modelo de 36B ejecutandose en un Mac permite hacer demostraciones sin GPU dedicada ni acceso a red, algo practico en talleres y entornos de formacion con red restringida.
- Extraccion y transformacion de texto sin conexion: para tareas de reescritura, normalizacion o extraccion de campos en entornos aislados (air-gapped), siempre que se valide la calidad con datos propios, dado que no hay benchmarks downstream publicados.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible. Perplexity medida sobre los pesos exactos que se distribuyen (tensores MLX desquantizados con `mx.dequantize`, ejecutados en bf16 sobre GPU), con secuencia de 512 tokens. "bpw" = bits enteros + 0,5 por la escala/bias bf16 por grupo de 64.

| Modelo | Tamano (GB, pesos) | bpw | WikiText-2 ppl (32704 tok) | Codigo Python ppl (8176 tok) |
|---|---|---|---|---|
| Referencia bf16 | – | 16 | 11,2952 | 4,4792 |
| Este repositorio (mezcla leCore Unicron) | 18,99 | 4,201 | 10,8602 | 4,5305 |
| MLX 3 bits estandar, group 64 | 15,82 | 3,500 | 12,1364 | 4,8896 |

El autor advierte que solo se reportan numeros medidos, que no se ejecutaron benchmarks de tareas downstream y que la perplexity de contexto corto no caracteriza por completo la calidad del modelo. La perplexity de WikiText-2 inferior a la referencia bf16 debe interpretarse con cautela: es el resultado de una medicion concreta y no implica una mejora real de capacidad, ya que no se realizo ningun reentrenamiento.

## Requisitos de hardware

- VRAM equivalente: 18,99 GB solo de pesos en el formato distribuido. Hay que sumar el cache KV, cuyo tamano depende de la longitud de contexto configurada y no se especifica en la informacion disponible.
- Mac con memoria unificada de 36 GB: el autor indica que puede ser necesario elevar el limite de memoria cableada de la GPU, por ejemplo con `sudo sysctl iogpu.wired_limit_mb=30000`. En un equipo de 32 GB la ejecucion es muy ajustada y dependera de la longitud de contexto.
- Equipos con 64 GB o mas de memoria unificada: margen comodo para contextos mas largos y para mantener otras aplicaciones abiertas.
- GPU NVIDIA: este repositorio es de MLX y no se puede ejecutar con CUDA. Para NVIDIA habria que usar el modelo base en bf16 (aproximadamente 72 GB de pesos solo por parametros) o buscar otras cuantizaciones del mismo modelo base, que no se detallan en la informacion proporcionada.
- Opciones de despliegue: `mlx-lm` sobre Apple Silicon (unico soportado por este repositorio). No se proporcionan pesos GGUF, por lo que llama.cpp, Ollama, vLLM o TGI no son aplicables a estos ficheros tal cual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Datos de la tabla publicada por el autor. No se dispone de comparaciones con otros modelos del mismo tamano en la informacion proporcionada.

| Version | Parametros | Contexto | bpw | WikiText-2 ppl | Codigo Python ppl | Licencia | Formato |
|---|---|---|---|---|---|---|---|
| Seed-OSS-36B-Instruct (bf16) | ~36,15 mil millones | no disponible | 16 | 11,2952 | 4,4792 | Apache 2.0 | safetensors (bf16) |
| Este repositorio (mezcla leCore) | ~36,15 mil millones | no disponible | 4,201 | 10,8602 | 4,5305 | Apache 2.0 | safetensors MLX |
| MLX 3 bits estandar | ~36,15 mil millones | no disponible | 3,500 | 12,1364 | 4,8896 | Apache 2.0 | safetensors MLX |

Comparado con la cuantizacion MLX estandar de 3 bits, la mezcla de precision mixta ocupa 3,17 GB mas (18,99 frente a 15,82 GB) y reduce la perplexity de WikiText-2 en 1,28 puntos y la de codigo Python en 0,36 puntos, quedando practicamente a la par del bf16 en codigo y por debajo de este en WikiText-2 en la medicion publicada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgos ni de seguridad para esta cuantizacion ni se describen en la informacion proporcionada.
- Riesgo de alucinacion: no caracterizado. No hay benchmarks de veracidad ni evaluaciones de tareas abiertas, solo perplexity de contexto corto (secuencia de 512 tokens).
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta y fue creado y actualizado el mismo dia, por lo que no hay verificacion externa de calidad ni de reproducibilidad.
- Dependencia de un unico runtime: los pesos son MLX, lo que limita su uso a Apple Silicon. No hay pesos GGUF, AWQ, GPTQ ni EXL2 en este repositorio, por lo que no se puede desplegar en servidores NVIDIA con vLLM o TGI sin reconvertir.
- Precision muy agresiva en parte de las capas: 8 tensores lineales estan a 2 bits, lo que puede degradar tareas sensibles que no aparecen en una medicion de perplexity. El propio autor recomienda comprobar las salidas en el caso de uso propio.
- Contexto y KV cache: no se especifica la longitud de contexto soportada ni el consumo de cache KV. El ejemplo de la model card usa `--max-kv-size 8192`, pero no es una cota del modelo.
- Idiomas: el repositorio no declara idiomas soportados, por lo que el comportamiento en castellano no esta verificado.
- Licencia: Apache 2.0, tanto en el modelo base como en esta cuantizacion, sin restricciones adicionales conocidas para uso comercial; conviene conservar la atribucion a ByteDance Seed del modelo original.
- Caveat de medicion: la perplexity de WikiText-2 inferior a la referencia bf16 es un artefacto de una medicion concreta y no debe presentarse como mejora del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/staccs/Seed-OSS-36B-Instruct-lecore-mlx
- Modelo base: https://huggingface.co/ByteDance-Seed/Seed-OSS-36B-Instruct
- Libreria de ejecucion referenciada en la model card (mlx-lm): https://github.com/ml-explore/mlx-lm
- Paper de leCore Unicron o repositorio de la herramienta `requantize`: no disponible
- Blog o demo del autor: no disponible
