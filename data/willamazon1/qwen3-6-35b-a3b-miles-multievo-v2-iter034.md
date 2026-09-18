# willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter034

## Resumen

El modelo `willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter034` es un checkpoint de aprendizaje por refuerzo (RL) derivado del modelo multimodal `Qwen/Qwen3.6-35B-A3B`. Lo publica el usuario willamazon1 como parte de la campaña de entrenamiento `miles-multievo-v2` y corresponde a la iteracion 34 de dicha campaña. No es, por tanto, un modelo base ni un ajuste supervisado al uso, sino un punto intermedio de una curva de entrenamiento con RL que se publica junto al resto de checkpoints de la misma ejecucion (guardados cada 5 iteraciones) para poder comparar la evolucion del modelo a lo largo del proceso.

Tecnicamente es un transformer de tipo Mixture-of-Experts (MoE) con 35.951.822.704 parametros totales, 40 capas, dimension oculta de 2048, 256 expertos con enrutamiento top-8 y atencion hibrida (lineal y completa). El nombre comercial "A3B" indica que solo se activan aproximadamente 3.000 millones de parametros por token, lo que reduce el coste computacional de la inferencia pese al tamano total. Incluye ademas una torre de vision, una capa MTP (multi-token prediction) y un vocabulario de 248.320 entradas, lo que lo habilita para tareas de imagen-texto-a-texto.

Su relevancia es doble. Por un lado, es un ejemplo del flujo de trabajo actual de RL a gran escala: el checkpoint se genero en Megatron-LM (`torch_dist`) y se convirtio a `safetensors` con las herramientas de slime, con verificacion de NaN/Inf y comparacion del conjunto completo de claves tensoriales. Por otro, al ser un artefacto de investigacion con 0 descargas y 0 "likes" en el momento de redactar esta ficha y sin model card detallada mas alla de los datos de conversion, debe tratarse como material experimental, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`Qwen3_5MoeForConditionalGeneration`), 40 capas, hidden 2048, 256 expertos (top-8), atencion hibrida lineal/completa, 1 capa MTP, torre de vision |
| Parametros totales | 35.951.822.704 (35,95 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones por token (inferido de la nomenclatura "A3B"; no explicitado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se incluyen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bfloat16), expertos MoE en layout agrupado/fusionado: `mlp.experts.gate_up_proj` / `down_proj` |

Otros datos: vocabulario de 248.320 tokens, tamano de repositorio de 71,9 GB, libreria `transformers`, pipeline `image-text-to-text`, fecha de creacion 2026-09-18.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `Qwen/Qwen3.6-35B-A3B`: un transformer MoE con 40 capas, dimension oculta de 2048 y 256 expertos de los que se activan 8 por token. Combina atencion lineal y atencion completa ("hybrid linear/full attention"), lo que reduce el coste de la atencion en secuencias largas manteniendo capas de atencion completa para el modelado global. Incorpora una capa de MTP (multi-token prediction), utilizada habitualmente para entrenamiento auxiliar o para decodificacion especulativa, y una torre de vision que aporta la modalidad de imagen, coherente con el pipeline `image-text-to-text`.

El checkpoint publicado corresponde a la etapa de RL de la ejecucion `miles-multievo-v2`, en la iteracion 34. La model card no detalla el algoritmo de RL empleado, la composicion del dataset de entrenamiento, el numero de tokens vistos ni el uso de tecnicas adicionales como DPO. Lo que si se documenta es el proceso de conversion: se partio de un checkpoint de entrenamiento Megatron-LM en formato `torch_dist` y se convirtio a `safetensors` con `tools/convert_torch_dist_to_hf.py` de slime, con `--vocab-size 248320` para eliminar el relleno (*padding*) de los embeddings y con `-a/--add-missing-from-origin-hf`, de modo que la torre de vision se tomo del modelo base, ya que el checkpoint `torch_dist` solo contenia el modelo de lenguaje. Antes de la subida se verifico cada shard en busca de NaN/Inf y se comparo el conjunto completo de claves tensoriales contra una conversion de referencia de la misma arquitectura.

## Capacidades

- Generacion de texto conversacional multiturno, con soporte declarado en las etiquetas del modelo para uso conversacional y de agentes.
- Razonamiento y resolucion de tareas mediadas por RL: el ajuste por refuerzo suele orientarse a mejorar el seguimiento de instrucciones, la precision en tareas verificables y el comportamiento agentico.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`): el modelo puede recibir imagenes junto con instrucciones textuales y generar respuestas sobre ellas.
- Capacidades de agente: la etiqueta `agent` y el ajuste por RL apuntan a flujos de multiples pasos, aunque la model card no especifica el formato exacto de llamadas a herramientas.
- Tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declara la lista de idiomas soportados.
- Modo de razonamiento explicito (*thinking*): no documentado.
- Entrada de audio: no soportada segun la informacion disponible (solo texto e imagen).

## Casos de uso

- Investigacion en RL para modelos de lenguaje: el checkpoint es un punto concreto de una curva de entrenamiento con checkpoints cada 5 iteraciones, por lo que resulta util para estudiar la evolucion de las capacidades del modelo a lo largo del RL y comparar iteraciones dentro de la misma coleccion.
- Evaluacion comparativa de tecnicas de RL: al compartir arquitectura y datos de partida con el modelo base, permite aislar el efecto de la etapa de RL sobre el comportamiento final, sirviendo como referencia frente a otros checkpoints de la misma ejecucion.
- Asistentes conversacionales con contexto multimodal: puede gestionar dialogos en los que el usuario adjunta capturas, diagramas o fotografias y espera respuestas textuales, aprovechando la torre de vision y la ventana de contexto (longitud no especificada por el autor).
- Prototipado de agentes que operan sobre documentacion visual: extraccion de informacion de graficos o tablas en imagenes dentro de un flujo de varios pasos, con validacion humana posterior.
- Experimentacion con despliegue de MoE a gran escala: con 35,95 mil millones de parametros totales pero activacion de aproximadamente 3.000 millones por token, es un banco de pruebas realista para medir el equilibrio entre memoria requerida y coste por token en motores como vLLM o SGLang.
- Generacion de codigo asistida por especificaciones visuales: transformar bocetos de interfaz o diagramas de arquitectura en esqueletos de codigo, siempre con revision manual dada la naturaleza experimental del checkpoint.
- Analisis de imagenes con razonamiento en cadena: descripcion detallada, respuesta a preguntas visuales y comparacion entre varias imagenes en una misma conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas sin relacion con el contenido tecnico). No se deben extrapolar cifras del modelo base sin una evaluacion propia.

## Requisitos de hardware

- Pesos en bfloat16: 35,95 mil millones de parametros a 2 bytes por parametro suponen aproximadamente 72 GB solo para los pesos, coherente con el tamano de repositorio de 71,9 GB. Hay que anadir la cache KV, las activaciones y la torre de vision.
- Inferencia en bfloat16: requiere al menos 80 GB de VRAM en total, por lo que entra justo en una H100 80 GB o una A100 80 GB, y con margen escaso. Lo recomendable es 2x H100 80 GB o 2x A100 80 GB para tener holgura de contexto y concurrencia.
- Cuantizacion a 8 bits: alrededor de 36 GB de pesos, lo que permite 2x RTX 4090/A6000 de 24 GB (48 GB en total) o una unica A100/H100 de 80 GB con amplio margen.
- Cuantizacion a 4 bits: alrededor de 18-20 GB de pesos, lo que en principio cabe en una RTX 4090, RTX 3090 o L40S, aunque el espacio restante para cache KV y activaciones limita la longitud de contexto efectiva. No se publican pesos cuantizados oficiales, por lo que la cuantizacion habria que generarla.
- GPU consumer: no cabe en bfloat16 en ninguna GPU de consumo actual (24 GB como maximo). Si cabe con cuantizacion de 4 bits en GPUs de 24 GB, con las reservas mencionadas de contexto y precision.
- Opciones de despliegue: `transformers` (requiere una version que incluya `Qwen3_5MoeForConditionalGeneration`), vLLM y SGLang (ambos con soporte de MoE y *expert parallelism*), TGI. Para llama.cpp u Ollama haria falta una conversion propia a GGUF, que no esta publicada; tener en cuenta que el layout fusionado de expertos (`gate_up_proj` / `down_proj`) puede exigir pasos adicionales en la conversion.
- Latencia y throughput: no se han publicado medidas. Como referencia estructural, al activar solo unos 3.000 millones de parametros por token, el coste computacional por token es comparable al de un modelo denso de ese tamano, mientras que el requisito de memoria corresponde a un modelo de 36.000 millones. El cuello de botella en despliegue sera la memoria, no el computo.
- Nota practica: el ejemplo de uso de la model card emplea `AutoModelForCausalLM` pese a que la arquitectura declarada es `Qwen3_5MoeForConditionalGeneration` y el pipeline es `image-text-to-text`; conviene verificar la clase correcta al cargar el modelo y comprobar que el `AutoProcessor` obtiene las preprocesaciones de imagen y texto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter034 | 35,95 mil millones | ~3 mil millones | no disponible | apache-2.0 | Checkpoint RL (iteracion 34), safetensors |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,95 mil millones (misma arquitectura) | ~3 mil millones | no disponible | apache-2.0 | Modelo base multimodal, safetensors |
| Qwen3-30B-A3B (referencia de la familia, datos publicos de su model card) | ~30,5 mil millones | ~3,3 mil millones | 262.144 tokens nativos en su configuracion publica | apache-2.0 | Amplia disponibilidad en HuggingFace, con versiones GGUF |
| Mixtral 8x7B (referencia MoE densa-abierta, datos publicos de su model card) | ~46,7 mil millones | ~12,9 mil millones | 32.000 tokens | apache-2.0 | Amplia disponibilidad, con versiones GGUF |

La comparacion relevante es contra el propio modelo base: ambos comparten arquitectura, vocabulario y tamano, y la unica diferencia documentada es la etapa de RL. Cualquier comparacion de rendimiento entre ambos exigiria una evaluacion propia, ya que el autor no publica metricas. Las cifras de las filas de Qwen3-30B-A3B y de Mixtral 8x7B se incluyen como referencia de categoria procedente de sus fichas publicas y no han sido verificadas en esta busqueda.

## Limitaciones y advertencias

- Artefacto experimental: se trata de una iteracion intermedia de una campana de RL (iteracion 34), no de un modelo final validado. El comportamiento puede ser inestable o degradado respecto al modelo base.
- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion de seguridad, ni analisis de sesgos en la informacion disponible. Cualquier uso en produccion requeriria una bateria de pruebas propia.
- Trazabilidad documental limitada: no se especifican el algoritmo de RL, el dataset de entrenamiento, el numero de tokens ni los criterios de seleccion de checkpoints. La model card se limita a los detalles de conversion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluaciones publicadas no puede acotarse su magnitud en tareas factuales ni en comprension de imagenes.
- Idiomas y contexto no declarados: se desconoce que idiomas estan soportados y cual es la longitud de contexto efectiva. No debe asumirse una ventana larga sin verificar la configuracion real del modelo.
- Seguridad multimodal: al aceptar imagenes, el modelo queda expuesto a riesgos de contenido manipulado, OCR de documentos sensibles y fuga de informacion presente en las imagenes.
- Sin pesos cuantizados oficiales: cualquier despliegue en hardware de consumo exige cuantizar por cuenta propia, con la perdida de calidad asociada y sin garantia de que el layout fusionado de expertos se convierta correctamente.
- Licencia: apache-2.0 permite uso comercial, modificacion y redistribucion, pero no exime de cumplir las condiciones del modelo base ni de las obligaciones de atribucion. No hay garantias por parte del autor.
- Metricas de adopcion nulas en el momento de la ficha (0 descargas, 0 "likes"), lo que implica ausencia de validacion por parte de terceros.
- Verificar la integridad de los pesos al cargarlos: aunque el autor declara haber comprobado NaN/Inf y el conjunto de claves tensoriales, conviene repetir esa validacion antes de usarlos en cualquier experimento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter034
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de conversion slime (THUDM): https://github.com/THUDM/slime
- Paper, blog o demo del modelo: no disponible
- Resultados de benchmarks: no disponible
- Busqueda web: no se encontraron resultados relevantes sobre este modelo; los enlaces devueltos por el buscador no guardaban relacion con el contenido tecnico de esta ficha
