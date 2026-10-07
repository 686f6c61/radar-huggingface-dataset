# Yusiko/khazri-3-sft

## Resumen

Khazri 3 SFT es un modelo de lenguaje publicado por el usuario Yusiko en HuggingFace bajo el identificador `Yusiko/khazri-3-sft`. Se trata de un modelo de aproximadamente 1.002 millones de parametros (1,0 B), etiquetado con la arquitectura `llama` y distribuido en formato safetensors. El sufijo "sft" del nombre sugiere que se trata de un ajuste supervisado (supervised fine-tuning) sobre una base previa, aunque el autor no documenta cual es el modelo base ni el procedimiento seguido.

La model card publicada es practicamente vacia: unicamente contiene la declaracion de licencia Apache 2.0, sin descripcion, sin datos de entrenamiento, sin idiomas declarados y sin resultados de evaluacion. El repositorio ocupa 2,0 GB, lo que es coherente con pesos en precision de 16 bits (1,002.522.624 parametros x 2 bytes = aproximadamente 2,0 GB).

Su relevancia actual es limitada desde el punto de vista practico: cuenta con 0 descargas y 0 likes en el momento de la consulta, no dispone de pipeline declarado y no ofrece informacion verificable sobre capacidades, datos de entrenamiento o rendimiento. Se incluye en esta ficha como registro de un modelo de la categoria ~1B, pero cualquier evaluacion de uso en produccion requeriria una validacion empirica propia por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (segun etiquetas del repositorio; sin detalle en la model card) |
| Parametros totales | 1.002.522.624 (dato real de los safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,0 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-06 (fecha indicada en HuggingFace) |
| Ultima actualizacion | 2026-10-07 (fecha indicada en HuggingFace) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna mas alla de la etiqueta `llama` asociada al repositorio. Esto permite inferir, con cautela, un transformer decoder-only con atencion causal, mecanismo de atencion por cabezas multiples y normalizacion RMSNorm, que es el patron habitual de la familia Llama, pero el autor no confirma configuracion de capas, dimension de embeddings, numero de cabezas, uso de GQA ni tipo de activacion.

Tampoco se documenta el proceso de entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo una fase de preentrenamiento propia o si se partio de un modelo existente, y si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT (aunque el sufijo del nombre apunta a esta ultima). No se declara el uso de decodificacion especulativa, atencion lineal, mezcla de expertos ni ninguna otra innovacion tecnica.

## Capacidades

- Generacion de texto: presumiblemente soportada por tratarse de un modelo de lenguaje, pero no verificada ni documentada por el autor.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en la model card).
- Capacidades especiales (modo thinking, vision, audio, decodificacion especulativa): no disponible.

Nota: al no existir model card descriptiva ni evaluaciones publicadas, ninguna de estas capacidades puede confirmarse sin una evaluacion directa del modelo.

## Casos de uso

Dado que no hay documentacion de capacidades ni evaluaciones publicadas, los siguientes casos son escenarios plausibles para un modelo denso de ~1B parametros, no caracteristicas confirmadas:

- Prototipado local en equipos de desarrollo: con 1,0 B de parametros y pesos de 2,0 GB, el modelo puede cargarse en una GPU de gama media o incluso en CPU para pruebas rapidas de integracion antes de escalar a modelos mayores.
- Clasificacion y etiquetado de texto: tareas de categorizacion de documentos, deteccion de intencion o enrutado de consultas en pipelines de datos, donde un modelo pequeno reduce coste por inferencia.
- Generacion de resumenes cortos: sintesis de parrafos o notas en aplicaciones de productividad, siempre que la longitud de contexto declarada (desconocida) lo permita.
- Ajuste fino especifico de dominio: al ser un modelo de 1B con licencia Apache 2.0, es viable reentrenarlo o aplicar LoRA sobre datos propios en una unica GPU consumer.
- Experimentacion academica: uso como linea base en investigacion sobre tecnicas de alineacion, cuantizacion o destilacion, dado su tamano manejable.
- Evaluacion comparativa interna: servir como referencia de la categoria ~1B en baterias de pruebas propias frente a otros modelos pequenos.
- Despliegue en entornos con recursos limitados: edge computing o contenedores con poca VRAM, si la cuantizacion a 4 bits resulta satisfactoria (no se publican versiones GGUF oficiales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no existen evaluaciones de terceros referenciadas.

## Requisitos de hardware

Estimaciones derivadas del numero de parametros (1.002.522.624) y del tamano del repositorio; no proceden de documentacion del autor:

- Pesos en fp16/bf16: aproximadamente 2,0 GB de VRAM solo para los pesos.
- Cuantizacion a 8 bits: aproximadamente 1,0-1,1 GB de VRAM.
- Cuantizacion a 4 bits: aproximadamente 0,6-0,8 GB de VRAM.
- VRAM total estimada en inferencia: entre 3 y 4 GB en fp16 con contextos cortos, sumando cache KV y overhead del runtime; el valor exacto depende de la longitud de contexto, que se desconoce.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente en fp16 (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090). En entornos de servidor, una A100 o H100 estarian sobredimensionadas para este tamano.
- Inferencia en CPU: viable con llama.cpp u Ollama en cuantizacion de 4 u 8 bits, con throughput bajo pero funcional.
- Opciones de despliegue: al ser pesos safetensors de arquitectura tipo Llama, serian compatibles con vLLM, TGI, Transformers y, previa conversion propia, con llama.cpp y Ollama. No se publican conversiones GGUF oficiales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de rendimiento de Khazri 3 SFT que permitan una comparacion funcional. La tabla siguiente recoge unicamente datos estructurales de modelos de tamano comparable; los valores de los modelos alternativos proceden de sus model cards publicas, no de la informacion proporcionada en esta busqueda, y deben verificarse en la fuente original.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Khazri 3 SFT | 1,0 B | no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Llama 3.2 1B | 1,24 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente desplegado |
| Qwen2.5 1.5B | 1,54 B | 32.768 tokens | Apache 2.0 (segun variante) | HuggingFace, ampliamente desplegado |
| SmolLM2 1.7B | 1,7 B | 8.192 tokens | Apache 2.0 | HuggingFace, ampliamente desplegado |

La comparacion de rendimiento entre estos modelos y Khazri 3 SFT no esta disponible.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card no describe el modelo base, el dataset, el metodo de entrenamiento ni las capacidades esperadas, lo que impide anticipar su comportamiento.
- Sesgos conocidos: no disponible. Al desconocerse la composicion del dataset, no puede evaluarse el sesgo ni la toxicidad del modelo.
- Riesgo de alucinacion: no caracterizado. En modelos de ~1B el riesgo de fabricar informacion es habitualmente elevado, pero no hay evaluaciones que lo cuantifiquen en este caso concreto.
- Limitaciones de contexto e idioma: se desconoce la ventana de contexto y los idiomas soportados. No hay garantia de funcionamiento correcto en castellano.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y sin garantias. No obstante, al desconocerse el modelo base y los datos de entrenamiento, no puede descartarse que existan obligaciones de licencia heredadas no declaradas.
- Modelo sin traccion ni validacion comunitaria: 0 descargas y 0 likes, sin evaluaciones de terceros. No se recomienda su uso en produccion sin una bateria de pruebas propia.
- Riesgo de seguridad: los repositorios sin documentacion pueden contener codigo de carga no auditado; se recomienda revisar los archivos antes de ejecutarlos.
- Fechas de publicacion inusuales: las marcas temporales del repositorio (2026-10-06) no coinciden con el momento habitual de publicacion de este tipo de modelos; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yusiko/khazri-3-sft
- Perfil del autor en LinkedIn (resultado de busqueda web, posible vinculacion con el autor): https://az.linkedin.com/in/yusikome
- Paper, blog, repositorio o demo adicionales: no disponible.
