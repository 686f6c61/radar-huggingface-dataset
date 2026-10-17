# tstepspam/Cydonia-24B-v4.3-heretic-v4-Q4-MLX

## Resumen

Cydonia-24B-v4.3-heretic-v4-Q4-MLX es una cuantizacion en 4 bits para MLX del modelo coder3101/Cydonia-24B-v4.3-heretic-v4, publicada por el usuario tstepspam en HuggingFace. Se trata, por tanto, de una conversion de formato y precision, no de un entrenamiento nuevo: el autor del repositorio ha tomado los pesos del modelo base y los ha convertido al formato de MLX (el framework de Apple para inferencia en silicio Apple), reduciendo el peso del repositorio a 13,3 GB frente a los aproximadamente 47 GB que ocuparian los pesos en bf16.

El modelo base pertenece a la familia de modelos "abliterated" o "decensored": las etiquetas del repositorio (heretic, uncensored, decensored, abliterated) indican que se ha aplicado una tecnica de ablacion de direcciones de rechazo sobre un modelo instruct original, con el objetivo de eliminar las negativas sistematicas a determinados tipos de peticiones. La etiqueta mistral sugiere que la arquitectura subyacente pertenece a la familia Mistral, aunque la model card no aporta detalles.

Su relevancia es acotada y muy especifica: es util para quien quiera ejecutar un modelo de ~23,6B parametros en un Mac con Apple Silicon usando MLX, sin necesidad de GPU dedicada ni de recurrir a llama.cpp. No hay datos publicados sobre benchmarks, licencia, idiomas ni proceso de entrenamiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta mistral sugiere familia Mistral; sin confirmar en la model card) |
| Parametros totales | 23.572.403.200 (23,6B, segun safetensors) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (etiqueta 4-bit); solo se publica esta variante MLX |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

Otros datos del repositorio: tamano 13,3 GB, 0 descargas, 0 likes, creado el 2026-10-16, actualizado el 2026-10-16, pipeline text-generation.

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo base coder3101/Cydonia-24B-v4.3-heretic-v4. La model card del repositorio analizado es practicamente vacia: solo contiene metadatos de HuggingFace (base_model, tags, library_name y pipeline_tag).

Lo unico inferible a partir de los metadatos es lo siguiente. Primero, el nombre "24B" y el recuento real de parametros (23,57B) sitúan al modelo en la clase de 24B, un rango habitual en modelos densos de tipo transformer decoder-only. Segundo, la etiqueta mistral apunta a que el linaje arquitectonico es Mistral. Tercero, las etiquetas heretic, uncensored, decensored y abliterated indican que el modelo base ha sufrido un proceso de ablacion de direcciones de activacion asociadas al rechazo, una tecnica que modifica pesos del modelo sin reentrenamiento completo y que suele degradar ligeramente capacidades generales a cambio de eliminar rechazos. Cuarto, esta publicacion concreta no ha reentrenado nada: es exclusivamente una cuantizacion a 4 bits y conversion al formato MLX.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, tag conversational).
- Uso como modelo instruct/chat de proposito general, segun los tags del repositorio.
- Comportamiento "sin censura": el proceso de ablacion del modelo base busca eliminar rechazos ante peticiones que un modelo alineado rechazaria.
- Capacidades de codigo: no confirmadas en la informacion disponible, aunque el nombre del modelo base en HuggingFace incluye "coder3101" (identificador de cuenta, no necesariamente indicativo de especializacion en codigo).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible (el pipeline declarado es unicamente text-generation).

## Casos de uso

- Inferencia local en Mac con Apple Silicon: es el caso de uso principal y practicamente el unico justificado por los datos del repositorio. El formato MLX y la cuantizacion a 4 bits (13,3 GB en disco) permiten cargar el modelo en un Mac con memoria unificada suficiente y ejecutarlo con la libreria mlx sin depender de CUDA.
- Prototipado de aplicaciones conversacionales en local: permite iterar sobre prompts y flujos de chat sin coste de API ni envio de datos a terceros, asumiendo que no hay datos publicados sobre calidad.
- Experimentacion sobre "abliteration": util para investigadores que quieran estudiar como se comporta un modelo con las direcciones de rechazo ablacionadas, comparandolo con el modelo base sin cuantizar.
- Evaluacion de cuantizacion 4-bit en MLX: sirve para medir la perdida de calidad respecto a los pesos originales del modelo base en tareas de generacion de texto libre y conversacion.
- Base para fine-tuning con LoRA/QLoRA sobre Apple Silicon: aunque no hay confirmacion de que MLX soporte entrenamiento sobre esta conversion concreta, el formato es compatible con el ecosistema mlx-examples.
- Despliegue en un servidor macOS (Mac Studio o similar) para dar servicio a un equipo pequeno: el modelo cabe en un unico equipo con memoria unificada amplia, sin necesidad de GPU dedicada.
- No se recomienda su uso en produccion con datos sensibles o en aplicaciones reguladas: no hay licencia declarada ni evaluaciones de sesgo o alucinacion publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), y la model card se limita a metadatos. Tampoco se han publicado mediciones de latencia o throughput para esta cuantizacion concreta.

## Requisitos de hardware

- VRAM / memoria unificada estimada: al menos 14-16 GB libres para cargar los pesos de 13,3 GB y dejar margen para el contexto y las activaciones. Para contextos largos o lotes mayores, conviene disponer de 24 GB o mas.
- Plataforma: MLX es un framework de Apple, por lo que la ejecucion requiere macOS sobre Apple Silicon (familia M). No esta pensado para GPU NVIDIA ni AMD.
- Equipos recomendados: Mac con chip M1 Pro/Max o superior y 32 GB de memoria unificada para un uso comodo; Mac Studio o MacBook Pro con M2/M3/M4 Max y 64 GB o mas para contextos largos y concurrencia. En configuraciones de 16 GB el modelo entra con dificultad y muy poco margen de contexto.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables directamente, ya que el formato es MLX. Para esos entornos habria que usar la version original del modelo base en safetensors y una herramienta como vLLM o TGI.
- Opciones de despliegue: mlx-lm y el ecosistema MLX (mlx-examples) son las vias naturales. No hay builds GGUF publicados en este repositorio, por lo que llama.cpp u Ollama requeririan convertir los pesos por separado.
- Latencia y throughput: no disponibles. No se han publicado mediciones para esta cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| tstepspam/Cydonia-24B-v4.3-heretic-v4-Q4-MLX (este modelo) | 23,6B | no disponible | 4 bits | no disponible | safetensors MLX, Apple Silicon |
| coder3101/Cydonia-24B-v4.3-heretic-v4 (modelo base) | 23,6B (mismo recuento) | no disponible | sin cuantizar (presumiblemente bf16/fp16) | no disponible | safetensors estandar |
| Otras alternativas de la clase 24B abliterated | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de benchmarks, contexto o licencia de ninguna de las alternativas de la misma categoria en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La unica comparacion defendible con los datos disponibles es la que enfrenta esta cuantizacion 4-bit MLX con su modelo base sin cuantizar: misma arquitectura y mismo numero de parametros, con la diferencia de precision (4 bits frente a 16 bits) y de plataforma objetivo (Apple Silicon frente a cualquier backend compatible con safetensors).

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre entrenamiento, datos, evaluaciones ni uso previsto. Cualquier despliegue en produccion parte de un riesgo alto de comportamiento no caracterizado.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial. Ademas, el modelo base coder3101/Cydonia-24B-v4.3-heretic-v4 tampoco declara licencia en la informacion disponible, lo que anade incertidumbre sobre la cadena de derechos.
- Modelo ablacionado: la eliminacion de direcciones de rechazo suele incrementar la probabilidad de generar contenido toxico, ilegal o danino, y puede degradar ligeramente tareas de razonamiento e instruccion. No hay evaluaciones de sesgo publicadas.
- Riesgo de alucinacion: no cuantificado para este modelo ni para su base. Al ser un proceso de cuantizacion a 4 bits, la degradacion respecto a bf16 suele ser pequena pero existe, especialmente en tareas de codigo y matematicas.
- Idiomas: no declarados. No se puede asumir buen rendimiento en castellano ni en otros idiomas distintos del ingles sin verificacion empirica.
- Limitacion de contexto: desconocida. No se puede planificar un caso de uso con documentos largos sin medirla primero.
- Cuantizacion irreversible: este repositorio solo sirve para inferencia o adaptacion ligera; no es adecuado como base para un reentrenamiento completo.
- Dependencia de plataforma: el formato MLX ata el modelo a Apple Silicon. Migrar a CUDA o a CPU requiere partir del modelo base, no de esta publicacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni issues. No hay garantia de actualizaciones ni de soporte.
- Fecha de creacion anomala: el repositorio figura como creado el 2026-10-16, dato a verificar antes de citarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tstepspam/Cydonia-24B-v4.3-heretic-v4-Q4-MLX
- Modelo base: https://huggingface.co/coder3101/Cydonia-24B-v4.3-heretic-v4
- Framework MLX: https://github.com/ml-explore/mlx
- Ejemplos y herramientas MLX para modelos de lenguaje: https://github.com/ml-explore/mlx-examples

No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a consultas no relacionadas (fisica, matematicas y una guia de videojuego) y no aportan informacion tecnica sobre esta publicacion ni sobre su modelo base. No hay papers, blogs ni demos asociados disponibles.
