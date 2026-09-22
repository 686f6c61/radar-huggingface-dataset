# Voltarre/DeepSeek-V4.1-Flash-UNCENSORED-NVFP4

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-NVFP4 es un checkpoint comunitario, no oficial, publicado por el usuario Voltarre en Hugging Face. Se trata de una fusión híbrida construida tomando como base el checkpoint cuantizado en NVFP4 de NVIDIA (nvidia/DeepSeek-V4.1-Flash-NVFP4) y sustituyendo únicamente 54 tensores de peso por sus equivalentes del checkpoint abliterado de dealignai (dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8). El objetivo declarado es conservar la representación NVFP4 orientada a hardware Blackwell en los expertos enrutados y, al mismo tiempo, incorporar las modificaciones a nivel de peso que reducen o eliminan el comportamiento de rechazo.

El modelo pesa 763.205.315.794 parámetros reales (aproximadamente 763.000 millones) y el repositorio ocupa 738,4 GB. La arquitectura subyacente es un transformer con mezcla de expertos (MoE), tal y como se deduce de la presencia de expertos enrutados y de expertos compartidos en el manifiesto de fusión, aunque no se detalla el número de parámetros activos por token ni la longitud de contexto oficial. La pipeline declarada es image-text-to-text, lo que implica capacidades multimodales de entrada.

Su relevancia actual es doble: por un lado, es un ejemplo práctico de cirugía de pesos selectiva sobre un checkpoint cuantizado en FP4, técnica útil para investigación en cuantización e inferencia; por otro, es un artefacto con comportamiento de rechazo reducido, lo que lo sitúa en el ámbito de la experimentación controlada y no en el de producción sin salvaguardas. El autor advierte explícitamente de que se trata de una fusión sin validar y de que no se garantiza ausencia de degradación ni equivalencia de comportamiento con los checkpoints originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun el manifiesto de fusion; no se detalla el numero de capas total, expertos ni parametros activos |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor recomienda validar 16K, 128K y aproximadamente 300K como objetivos de despliegue) |
| Tipos de cuantizacion | NVFP4 / FP4 en los expertos enrutados; rutas de atencion y de expertos compartidos mantenidas en la precision de origen del checkpoint NVIDIA; los tags declaran tambien 8-bit y fp8 |
| Idiomas soportados | no disponible |
| Licencia | mit |
| Formato de pesos | safetensors |
| Tamano del repositorio | 738,4 GB |
| Modalidad | image-text-to-text |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento original del modelo DeepSeek-V4.1-Flash (composicion del dataset, numero de tokens, fases de RLHF o DPO), porque la model card del repositorio describe unicamente el proceso de fusion y no reproduce la ficha del modelo base. Lo que si se documenta es la arquitectura de la fusion: se parte del checkpoint NVFP4 de NVIDIA y se reemplazan exclusivamente 54 tensores, correspondientes a 27 capas del transformer con 2 tensores por capa. En concreto se sustituyen `layers.10..36.attn.wo_b.weight` y `layers.10..36.ffn.shared_experts.w2.weight`, es decir, la proyeccion de salida de la atencion y la segunda matriz del camino de expertos compartidos.

La innovacion tecnica del repositorio es de tipo ingenieril mas que de entrenamiento. La configuracion de cuantizacion de NVIDIA excluye las rutas de atencion y de expertos compartidos de la cuantizacion NVFP4, de modo que esas capas se conservan en la precision de origen. Por eso la fusion se realiza directamente sobre esos pesos originales en lugar de recuantizar el modelo completo: se evita una perdida adicional de precision y se limita el numero de tensores alterados. Los expertos enrutados de la mezcla no se tocan y permanecen intactos respecto al checkpoint NVFP4 de NVIDIA. El autor recomienda conservar un manifiesto de compilacion y sumas de comprobacion para poder verificar procedencia e integridad.

## Capacidades

- Generacion de texto y conversacion multimodal: la pipeline declarada es image-text-to-text, por lo que acepta imagenes junto a texto como entrada.
- Razonamiento y uso de herramientas: el autor recomienda validar explicitamente el comportamiento de razonamiento y de tool-use antes de confiar en el checkpoint, lo que implica que el modelo base dispone de estas capacidades, pero no se certifican en esta fusion.
- Mezcla de expertos con enrutado: la arquitectura MoE permite activar solo un subconjunto de expertos por token, con expertos compartidos siempre activos.
- Comportamiento de rechazo reducido o eliminado: el checkpoint hereda las modificaciones de tipo abliterated del origen dealignai, de modo que responde a peticiones que otros modelos rechazarian.
- Contexto largo: el autor menciona pruebas objetivo a 16K, 128K y aproximadamente 300K tokens, sin confirmar estabilidad en ninguna de ellas.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en cuantizacion NVFP4: el checkpoint permite estudiar como afecta la sustitucion selectiva de 54 tensores en precision de origen sobre un modelo cuantizado en FP4, comparando perplejidad y calidad frente al checkpoint de NVIDIA.
- Evaluacion de comportamiento de rechazo: util para medir de forma sistematica que peticiones deja de rechazar un modelo abliterado y como cambia la distribucion de respuestas respecto al modelo original, en un entorno de laboratorio.
- Servicio de inferencia multimodal en local o privado: con hardware Blackwell y un stack compatible con NVFP4, el modelo puede desplegarse en infraestructura propia para tareas de descripcion y analisis de imagenes sin salida a la nube.
- Experimentos de servicio con contexto largo: el autor propone validar 16K, 128K y aproximadamente 300K tokens, lo que lo convierte en un banco de pruebas para estudiar repeticion, degeneracion y coste de memoria en ventanas extensas.
- Benchmarking de stacks de inferencia: al estar etiquetado para vLLM y usar NVFP4, sirve para comparar throughput y consumo de memoria entre motores de servicio sobre hardware Blackwell frente a versiones FP8.
- Generacion de codigo en entornos aislados: puede emplearse en sandbox sin acceso a red para tareas de generacion y refactorizacion, asumiendo revision humana obligatoria y sin tratarlo como consejo autoritativo.
- Analisis de contenido sin filtros para moderacion defensiva: equipos de confianza y seguridad pueden usar el modelo para anticipar que tipo de material nocivo genera un modelo abliterado y calibrar sus propios clasificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para el modelo fusionado ni para los checkpoints de origen. El autor indica ademas que no reclama cero perdida de calidad, cero degeneracion ni comportamiento identico a los upstream hasta que se completen y documenten las pruebas de validacion que enumera.

## Requisitos de hardware

- VRAM estimada para inferencia: a partir del tamano del repositorio (738,4 GB), los pesos solos requieren del orden de 740 GB de memoria, a lo que hay que sumar la cache KV correspondiente a la ventana de contexto utilizada. Es una estimacion derivada del tamano de ficheros, no un dato publicado.
- GPU recomendadas: el formato NVFP4 esta orientado a la generacion Blackwell de NVIDIA, por lo que el despliegue nativo apunta a B200 o GB200. Para servir los pesos completos hace falta un nodo multi-GPU de gran capacidad; un nodo de 8xH200 (141 GB cada una) ofrece alrededor de 1,1 TB de VRAM agregada, suficiente por capacidad de pesos, mientras que 8xH100 de 80 GB (640 GB agregados) quedaria por debajo del tamano del repositorio.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Los 738,4 GB de pesos descartan RTX 4090, RTX 5090 o cualquier configuracion de una sola tarjeta, incluso con cuantizaciones adicionales no publicadas en este repositorio.
- Opciones de despliegue: el tag `vllm` indica soporte previsto para vLLM. Para NVFP4 en Blackwell el camino natural es ademas TensorRT-LLM. No hay evidencia en la informacion disponible de pesos GGUF, por lo que llama.cpp y Ollama no estan confirmados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Voltarre/DeepSeek-V4.1-Flash-UNCENSORED-NVFP4 | 763.205.315.794 | NVFP4 con atencion y expertos compartidos en precision de origen | no disponible | mit | Fusion no oficial, sin validar, 0 descargas |
| nvidia/DeepSeek-V4.1-Flash-NVFP4 | no disponible | NVFP4 | no disponible | no disponible | Checkpoint oficial de NVIDIA, base de la fusion |
| dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8 | no disponible | FP8 | no disponible | no disponible | Checkpoint abliterado, origen de los 54 tensores sustituidos |
| deepseek-ai/DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | no disponible | Modelo original de DeepSeek |

No se dispone de datos de rendimiento, contexto ni licencia de los tres checkpoints de referencia en la informacion proporcionada, por lo que la comparativa se limita a procedencia y formato.

## Limitaciones y advertencias

- Fusion sin validar: el propio autor advierte de que coincidir en formas de tensor o cargar sin errores no demuestra equivalencia de comportamiento ni estabilidad en contexto largo. No reclama cero perdida de calidad ni cero degeneracion.
- Sin benchmarks publicados: no hay ninguna medicion objetiva de MMLU, HumanEval, GSM8K ni de rendimiento en contexto largo para este checkpoint.
- Comportamiento de rechazo reducido: puede generar instrucciones peligrosas o ilegales, codigo inseguro o destructivo, desinformacion medica, legal o financiera, material de acoso o sexual explicito y contenido invasivo de la privacidad. No debe tratarse como asesoramiento profesional.
- Riesgo elevado de alucinacion: la model card menciona explicitamente hechos y citas inventados como salida posible.
- Idiomas soportados: no disponible, por lo que no puede garantizarse calidad fuera de los idiomas del modelo original.
- Contexto: no confirmado; la estabilidad a 16K, 128K y aproximadamente 300K tokens queda pendiente de validacion por parte del usuario.
- Licencia: el repositorio declara MIT, pero los materiales upstream (DeepSeek, NVIDIA, dealignai) pueden estar sujetos a sus propias licencias y terminos. El usuario debe verificar el cumplimiento antes de cualquier uso comercial o redistribucion.
- Etiqueta not-for-all-audiences: el repositorio esta marcado como no apto para todas las audiencias, lo que implica restricciones de acceso y controles de moderacion en cualquier despliegue.
- Exencion total de garantia y responsabilidad: el checkpoint se entrega tal cual, sin garantia de correccion, seguridad, fiabilidad, funcionamiento ininterrumpido ni compatibilidad con un stack de inferencia concreto.
- Sin traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no existe base de usuarios que haya reportado comportamiento en produccion.
- Requisitos de hardware extremos: 738,4 GB de pesos y dependencia de hardware Blackwell para NVFP4 limitan el despliegue a infraestructura especializada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Voltarre/DeepSeek-V4.1-Flash-UNCENSORED-NVFP4
- Base NVFP4 de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-NVFP4
- Origen abliterado en FP8: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash

No se han encontrado en la busqueda web enlaces relevantes adicionales sobre este modelo; los resultados devueltos no guardan relacion con el repositorio.
