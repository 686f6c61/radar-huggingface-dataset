# SusanHill/zils-lite-s3p

## Resumen

zils-lite-s3p es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B, publicado por el usuario SusanHill bajo licencia Apache-2.0. Se presenta como un "student" destilado mediante LoRA de rango 64 a partir de las probabilidades de un teacher denominado `vllm-sr/d3-flash`, combinadas en una proporcion 30/70 con etiquetas gold publicas (solo splits de entrenamiento). El modelo se etiqueta con los tags `zils` y `decision`, lo que sugiere un uso orientado a tareas de clasificacion o toma de decisiones mas que a generacion abierta.

Con 852.985.920 parametros (aproximadamente 0,85 mil millones) y un tamano de repositorio de 1,7 GB en formato safetensors, es un modelo compacto pensado para inferencia ligera. Al derivar de Qwen3.5-0.8B hereda la arquitectura y la ventana de contexto del modelo base, aunque la model card no documenta explicitamente ni la longitud de contexto efectiva tras el ajuste ni los idiomas soportados.

La relevancia de esta ficha es limitada pero concreta: se trata de un experimento de destilacion de bajo coste sobre un modelo pequeno, con cero descargas y cero likes en el momento de la consulta, y con documentacion muy escasa. Cualquier evaluacion en produccion deberia tratarse como preliminar hasta que el autor publique detalles de entrenamiento, evaluacion y datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B; tag `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no documentada para el fine-tune; depende del modelo base) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` en los tags) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parametros. La model card indica que se trata de un "soup body" de la familia d3-lite de Zils, construido como student LoRA-64 destilado a partir de las probabilidades de un teacher llamado `vllm-sr/d3-flash`. La senal de entrenamiento combina esas probabilidades del teacher con etiquetas gold publicas en una mezcla 30/70, usando unicamente los splits de entrenamiento.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF o DPO, ni detalles sobre la funcion de perdida de destilacion (por ejemplo, si se uso KL divergence sobre logits o sobre probabilidades softmax). Tampoco se documenta la estrategia de fusion de LoRA ni si el adaptador se ha integrado en los pesos base. El tag `custom_code` sugiere que la carga del modelo requiere codigo personalizado del repositorio, lo que anade friccion a la integracion estandar con frameworks como transformers o vLLM sin adaptaciones.

## Capacidades

- Clasificacion y toma de decisiones: los tags `zils` y `decision` apuntan a un uso previsto en tareas de decision, probablemente clasificacion de etiquetas discretas o seleccion entre opciones.
- Generacion de texto: al derivar de un modelo de lenguaje, conserva la capacidad generativa del base, aunque el ajuste puede haberla especializado o degradado.
- Destilacion de probabilidades: el entrenamiento con senal soft del teacher puede mejorar la calibracion en la tarea objetivo frente a un fine-tune solo con etiquetas duras.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (vision, audio, thinking mode): no documentadas.

## Casos de uso

- Clasificacion de tickets o incidencias: con 0,85 mil millones de parametros el modelo puede desplegarse en CPU o GPU modesta para etiquetar automaticamente categorias de soporte, siempre que la tarea coincida con la distribucion de entrenamiento del ajuste.
- Enrutamiento de decisiones en pipelines: usar el modelo como clasificador de intencion o selector de ruta en un sistema mayor, aprovechando su bajo coste de inferencia frente a modelos de mayor tamano.
- Filtrado previo en sistemas RAG: emplear el modelo para decidir si una consulta requiere recuperacion o puede responderse directamente, reduciendo llamadas a modelos grandes.
- Prototipado rapido de clasificadores: al ser Apache-2.0 y pesar 1,7 GB, sirve para experimentar con destilacion de teachers en entornos con recursos limitados.
- Inferencia en el borde o en portatiles: el tamano permite ejecutarlo en GPU consumer con cuantizacion (si se generan pesos GGUF, no publicados) o incluso en CPU para tareas de baja latencia no critica.
- Evaluacion comparativa de tecnicas de destilacion: util como referencia para investigadores que quieran reproducir o comparar mezclas 30/70 de probabilidades de teacher frente a etiquetas gold.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5 GB (requiere convertir los pesos, ya que no se publican variantes GGUF).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojarlo con holgura; tambien cabe en GPUs de datacenter como A100 o H100, aunque estan sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM; tambien es viable en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (por el tag `custom_code`); llama.cpp u Ollama solo si se generan pesos GGUF, no publicados; vLLM y TGI requeririan verificar compatibilidad con el codigo personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-s3p | 852.985.920 | no disponible | apache-2.0 | Hugging Face (0 descargas) | Fine-tune de Qwen3.5-0.8B con destilacion LoRA-64 |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| vllm-sr/d3-flash | no disponible | no disponible | no disponible | no disponible | Teacher usado para la destilacion, segun la model card |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Documentacion minima: la model card no detalla datos de entrenamiento, evaluacion, idiomas ni contexto efectivo, lo que impide validar su calidad antes de usarlo en produccion.
- Riesgo de alucinacion: al ser un modelo pequeno y especializado en decision, puede generar texto incoherente o inventar etiquetas fuera de la distribucion de entrenamiento.
- Sesgos: no documentados; al heredar el base Qwen3.5-0.8B, arrastra los sesgos de sus datos de preentrenamiento, desconocidos en esta ficha.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-0.8B y del teacher, ya que la ficha no las detalla.
- `custom_code`: requiere confiar en el codigo del repositorio al cargar el modelo, lo que implica un riesgo de seguridad en entornos de produccion.
- Sin senal de adopcion: cero descargas y cero likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- Especializacion incierta: el ajuste puede haber reducido capacidades generativas generales del base; no se recomienda usarlo como modelo de proposito general sin evaluacion previa.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-lite-s3p
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Teacher referenciado en la model card: `vllm-sr/d3-flash` (no se ha encontrado URL publica en la informacion disponible)
