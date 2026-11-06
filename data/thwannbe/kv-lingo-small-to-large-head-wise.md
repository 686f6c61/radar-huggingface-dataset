# thwannbe/kv-lingo-small-to-large-head-wise

## Resumen

KV-lingo small-to-large head-wise es un artefacto de traduccion de cache KV, no un modelo de lenguaje autonomo. Lo publica el usuario thwannbe en Hugging Face como implementacion independiente de la tecnica descrita en el paper KV-Lingo (arXiv:2609.32610). Su funcion es proyectar la cache KV generada por un modelo pequeno (Qwen/Qwen3-0.6B) a la cache que esperaria un modelo mayor (Qwen/Qwen3-1.7B), de forma que el modelo grande pueda continuar una generacion ya iniciada por el pequeno sin reprocesar el prefijo completo.

El repositorio contiene un fichero `mapper.pt` con mapas lineales por capa y por cabeza de atencion, separados para claves (K) y valores (V). Las claves se capturan antes de la k-normalization y del RoPE del modelo origen, y la normalizacion y el RoPE del modelo destino se aplican despues de la proyeccion. No incluye pesos base, estado del optimizador, datos de entrenamiento ni predicciones de evaluacion.

Es relevante ahora porque aborda uno de los cuellos de botella practicos de los sistemas con modelos pequenos: reutilizar el trabajo de prefijado (prompt processing) al escalar a un modelo mayor en mitad de una conversacion o de un pipeline. El autor declara explicitamente que no reclama equivalencia de benchmarks con el paper original. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos no estan subidos o son de tamano despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mapas lineales por capa y por cabeza sobre cache KV (K y V), con proyeccion antes de k-normalization y RoPE del destino |
| Parametros totales | No disponible (el mapper no es un LLM; el modelo origen tiene 0.6B y el destino 1.7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo destino Qwen3-1.7B, no declarada en la ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | `mapper.pt` (PyTorch), con `mapper_config.json` de metadatos; no es safetensors ni GGUF |
| Modelo origen | Qwen/Qwen3-0.6B |
| Modelo destino | Qwen/Qwen3-1.7B |
| Paso de entrenamiento | 5000 |
| Forma de los tensores | `[2, groups, output_features, input_features]` por capa (side 0 = K, side 1 = V) |

## Arquitectura y entrenamiento

El artefacto no es un transformer ni un adaptador PEFT: es un conjunto de mapas lineales que transforman tensores de cache KV. Para cada capa del modelo origen se aprende una proyeccion por grupo de cabezas, con dos ramas separadas para claves y valores. La forma `[2, groups, output_features, input_features]` indica que la proyeccion respeta la estructura de atencion por cabezas (head-wise) y que el numero de grupos y dimensionalidades se ajustan entre origen y destino, que difieren en tamano (0.6B frente a 1.7B).

El punto tecnico critico es el orden de operaciones: las claves se capturan en el modelo origen antes de aplicar su k-normalization y su RoPE, y la proyeccion se aplica sobre esas claves "crudas". Despues, el modelo destino aplica su propia k-normalization y su propio RoPE sobre el resultado proyectado. Esto evita mezclar convenciones de rotacion y normalizacion entre modelos con configuraciones potencialmente distintas.

El entrenamiento se realizo durante 5000 pasos, pero no se especifican en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o alguna fase de ajuste fino adicional. Tampoco se detalla la funcion de perdida ni si el entrenamiento fue supervisado contra caches reales del modelo destino. El autor indica que no se incluyen datos crudos de entrenamiento ni predicciones de evaluacion.

## Capacidades

- Traduccion de cache KV de Qwen3-0.6B a Qwen3-1.7B para reutilizar el prefijado ya calculado por el modelo pequeno.
- Proyeccion head-wise: mantiene la estructura por cabezas y grupos de atencion, no una proyeccion global unica.
- Separacion explicita de claves y valores mediante el eje 0 del tensor (`[2, groups, ...]`).
- Compatibilidad con caches capturadas antes de k-normalization y RoPE, lo que permite aplicar las convenciones del modelo destino tras la proyeccion.
- Carga mediante `LinearMapper.load(path, device=...)` desde el repositorio auxiliar de kv-transfer; no es cargable con `AutoModel.from_pretrained`.
- Uso con `mapper.translate(raw_cache, target_model)`, pasando la cache cruda pre-norm del origen y el modelo destino.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step por si mismo: esas capacidades dependen del modelo destino.
- No tiene capacidades multilingues propias; hereda las del modelo destino.
- No incluye modo thinking, vision ni audio.

## Casos de uso

- Aceleracion de prompt processing en pipelines de dos etapas: un modelo pequeno procesa el prefijo largo (system prompt, documentos recuperados) y el mapper transfiere la cache al modelo grande para la generacion final, evitando recalcular el prefijo en el modelo de 1.7B.
- Enrutamiento por dificultad en atencion al cliente: el modelo de 0.6B gestiona turnos triviales y, cuando la consulta se complica, se proyecta la cache al modelo de 1.7B para continuar la conversacion sin perder el contexto ya procesado.
- Reduccion de coste en inferencia por lotes: en tareas de resumen o clasificacion con prefijos compartidos, el prefijado se hace una vez con el modelo pequeno y se reutiliza en el grande mediante el mapper.
- Investigacion sobre transferencia de representaciones internas: el artefacto permite experimentar con la hipotesis de que las caches KV de modelos de la misma familia son linealmente relacionables, comparando la calidad de la proyeccion head-wise frente a alternativas.
- Prototipado de sistemas especulativos o de borrador-verificador: el modelo pequeno genera un borrador y el grande verifica o continua, reutilizando la cache proyectada en lugar de recomputar el prefijo.
- Evaluacion de tecnicas de compresion y reutilizacion de cache: sirve como referencia reproducible para medir cuanto se degrada la calidad al sustituir una cache nativa del modelo grande por una proyectada desde el pequeno.
- Despliegue en entornos con VRAM limitada: el prefijado se ejecuta en el modelo de 0.6B, que cabe en GPUs de consumo, y solo la fase de continuacion requiere el modelo de 1.7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no reclama equivalencia con los resultados del paper KV-Lingo y que no incluye predicciones de evaluacion en el repositorio.

## Requisitos de hardware

- El mapper es un conjunto de proyecciones lineales; su huella en VRAM es muy inferior a la de un LLM y depende del numero de capas y de la dimensionalidad de las cabezas de Qwen3-0.6B y Qwen3-1.7B, datos no disponibles en la ficha.
- Para ejecutar el flujo completo se necesita cargar en memoria el modelo destino Qwen3-1.7B (aproximadamente 3.4 GB en FP16, 1.7 GB en int8, 0.9 GB en int4 como estimacion orientativa) mas el mapper y la cache proyectada.
- El modelo origen Qwen3-0.6B requiere aproximadamente 1.2 GB en FP16, 0.6 GB en int8 y 0.3 GB en int4.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar el modelo destino en FP16 con margen; una RTX 3060 de 12 GB, RTX 4070, RTX 4090, A100 o H100 son suficientes. Para el flujo de dos modelos simultaneos se recomienda 16 GB o mas.
- Cabe en GPU de consumo: si, tanto el modelo de 0.6B como el de 1.7B en cuantizaciones de 8 o 4 bits.
- Opciones de despliegue: el mapper requiere el codigo propio del repositorio kv-transfer (`mapper.py` y `requirements.txt`); no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, ya que esas herramientas no soportan la sustitucion de cache por proyeccion externa. El modelo destino puede servirse con vLLM o TGI, pero la integracion del mapper exige un wrapper propio.
- Latencia y throughput: no disponibles. La ventaja esperada es la eliminacion del coste de prefijado en el modelo grande, pero no se aportan mediciones.

## Comparativa con modelos similares

| Artefacto | Tipo | Modelo origen | Modelo destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thwannbe/kv-lingo-small-to-large-head-wise | Mapper KV head-wise | Qwen3-0.6B | Qwen3-1.7B | No disponible | Hugging Face, 0 descargas |
| KV-Lingo (paper, arXiv:2609.32610) | Metodo de traduccion KV | No disponible | No disponible | No disponible | Paper; checkpoint oficial no referenciado |
| Prompt caching nativo (vLLM, TGI) | Cache KV reutilizada dentro del mismo modelo | Mismo modelo | Mismo modelo | Segun herramienta | Ampliamente disponible |
| Adaptadores PEFT/LoRA | Ajuste de pesos | Cualquiera | Mismo modelo | Segun adaptador | Estandar en Hugging Face |

La diferencia clave frente al prompt caching nativo es que este mapper cruza modelos de distinto tamano, algo que las herramientas estandar no ofrecen. Frente a un adaptador LoRA, la diferencia es que no modifica pesos del modelo ni anade capacidad nueva: solo transforma tensores de cache.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por si mismo y no puede usarse con `AutoModel.from_pretrained`.
- Depende de codigo externo (`mapper.py`, `requirements.txt`) del repositorio kv-transfer; la integracion no es trivial y requiere adaptar el pipeline de inferencia.
- Solo cubre el par Qwen3-0.6B a Qwen3-1.7B; no es generalizable a otros modelos sin reentrenamiento.
- La cache cubre todos los tokens del prefijo excepto el ultimo, que debe pasarse normalmente al modelo destino; un manejo incorrecto de ese token puede degradar la generacion.
- No se declara licencia, lo que impide evaluar el uso comercial con seguridad juridica.
- No hay datos de benchmarks ni de evaluacion de calidad; se desconoce cuanto se degrada la perplejidad o la coherencia al sustituir la cache nativa por la proyectada.
- Riesgo de alucinacion y sesgos: no evaluables en el mapper; dependen del modelo destino Qwen3-1.7B y de la fidelidad de la proyeccion.
- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB: verificar que `mapper.pt` este realmente disponible antes de integrarlo.
- El autor advierte que es una implementacion independiente y no un checkpoint oficial del paper; no se reclama equivalencia con los resultados publicados.
- No se especifican los idiomas soportados ni restricciones de contexto; ambos dependen del modelo destino.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thwannbe/kv-lingo-small-to-large-head-wise
- Paper KV-Lingo: https://arxiv.org/abs/2609.32610
- Modelo origen Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo destino Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
