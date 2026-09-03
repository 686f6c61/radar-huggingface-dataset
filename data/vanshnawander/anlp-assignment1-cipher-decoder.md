# vanshnawander/anlp-assignment1-cipher-decoder

## Resumen

El modelo `vanshnawander/anlp-assignment1-cipher-decoder` es un conjunto de cinco checkpoints de inferencia entrenados para reconstruir texto plano a partir de cifrado binario. Fue desarrollado por Vansh Nawander, estudiante de máster en IIIT Hyderabad, como parte de la asignación 1 del curso Advanced NLP. Cada checkpoint corresponde a una configuración distinta de arquitectura encoder-decoder: un transformer base (C1), una variante con embeddings posicionales rotatorios RoPE (C2), otra con atención de consultas agrupadas GQA (C3), una con normalización RMSNorm (C4) y una versión sin tokenizador basada en el byte latent transformer BLT (C5). Las configuraciones C1–C4 emplean un tokenizador BPE a nivel de byte, mientras que C5 consume directamente los bytes del cifrado y utiliza parches basados en entropía.

El repositorio tiene un tamaño de 0,1 GB y está publicado bajo licencia MIT. No se especifican el número de parámetros, la longitud de contexto ni los idiomas soportados. El modelo es relevante como material educativo para explorar variantes arquitectónicas en tareas de secuencia a secuencia, aunque no está orientado a producción. Se proporcionan enlaces a un reporte de Weights & Biases con curvas de entrenamiento y a una demo de Gradio para probar los modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con cinco variantes: base, RoPE, GQA, RMSNorm y BLT (byte latent transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (formato no especificado) |

## Arquitectura y entrenamiento

El modelo agrupa cinco configuraciones de arquitectura encoder-decoder, todas implementadas en PyTorch. Las configuraciones C1 a C4 comparten un tokenizador BPE a nivel de byte y difieren en componentes específicos: C1 es un transformer base, C2 incorpora embeddings posicionales rotatorios (RoPE), C3 utiliza atención de consultas agrupadas (GQA) y C4 emplea normalización RMSNorm. La configuración C5 es un byte latent transformer (BLT) que prescinde del tokenizador y procesa directamente los bytes del cifrado, agrupándolos en parches según la entropía de los datos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones adicionales más allá de las variantes arquitectónicas mencionadas. El autor indica que cada checkpoint contiene el estado del modelo y la configuración exacta de arquitectura usada durante el entrenamiento, pero no se publican hiperparámetros ni detalles del proceso de entrenamiento.

## Capacidades

- Decodificacion de texto plano a partir de cifrado binario, tarea principal para la que fue entrenado.
- Soporte de cinco variantes arquitectonicas (base, RoPE, GQA, RMSNorm, BLT) que permiten comparar su comportamiento en la misma tarea.
- Procesamiento de entrada sin tokenizador en la variante BLT, que opera directamente sobre bytes y usa parches basados en entropia.
- No se documentan capacidades adicionales como generacion de texto general, razonamiento, codigo, tool calling, agentes o soporte multilingue.

## Casos de uso

- Investigacion academica en arquitecturas transformer: el modelo permite comparar el efecto de RoPE, GQA, RMSNorm y BLT en una tarea de secuencia a secuencia, util para estudios de ablacion en cursos de procesamiento de lenguaje natural.
- Experimentacion con decodificacion de cifrados simples: puede servir como punto de partida para probar tecnicas de descifrado en entornos controlados, aunque no esta validado para cifrados reales o complejos.
- Ensenanza de arquitecturas encoder-decoder: los checkpoints y sus configuraciones documentadas facilitan la reproduccion de experimentos en asignaturas de aprendizaje automatico avanzado.
- Pruebas de concepto de modelos sin tokenizador: la variante BLT (C5) ofrece un ejemplo practico de como procesar datos binarios directamente, util para explorar alternativas a los tokenizadores convencionales.
- Evaluacion de tecnicas de normalizacion y atencion: las variantes C3 y C4 permiten analizar el impacto de GQA y RMSNorm en tareas de reconstruccion de texto.
- Reproduccion de resultados academicos: al estar publicados los checkpoints y el reporte de W&B, otros investigadores pueden replicar los experimentos y verificar las curvas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona que las curvas de entrenamiento y los resultados de evaluacion estan disponibles en el reporte de Weights & Biases, pero no se proporcionan metricas concretas (como MMLU, HumanEval o GSM8K) en la model card ni en los resultados de busqueda.

## Requisitos de hardware

- No se proporcionan requisitos especificos de hardware en la documentacion del modelo.
- Dado el tamano del repositorio (0,1 GB), se puede inferir que se trata de un modelo pequeno, probablemente con menos de mil millones de parametros, aunque este dato no esta confirmado.
- Es plausible que pueda ejecutarse en GPUs de consumo con 4-8 GB de VRAM, pero esta estimacion no esta respaldada por datos oficiales.
- No se mencionan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI. El modelo se distribuye en formato PyTorch, por lo que podria cargarse con herramientas estandar de Hugging Face (transformers, accelerate) si se dispone de la configuracion adecuada.
- No se conocen datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria. En la busqueda web aparece otro repositorio similar (`mdhvm/anlp-a1-cipher-transformers`) con la misma tarea de descifrado, pero no se tienen detalles de sus especificaciones ni rendimiento. Por tanto, no es posible establecer una comparativa fundamentada.

## Limitaciones y advertencias

- Es un modelo de tarea de curso, no entrenado para uso en produccion ni para manejar cifrados reales o complejos.
- No se documentan sesgos conocidos, pero al ser un modelo pequeno y especifico, es probable que tenga un rendimiento limitado fuera del dominio de entrenamiento.
- Existe riesgo de alucinacion o salidas incorrectas al enfrentarse a entradas fuera de la distribucion de cifrados utilizada.
- No se especifican limitaciones de contexto o idioma, pero al no declararse idiomas soportados, se asume que el modelo fue entrenado con datos en ingles (no confirmado).
- La licencia MIT permite uso comercial, pero al no haber documentacion tecnica detallada, su integracion en sistemas reales requeriria una evaluacion exhaustiva.
- No se proporcionan garantias de exactitud ni de seguridad; el modelo debe usarse unicamente con fines educativos o de investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/anlp-assignment1-cipher-decoder
- Reporte de Weights & Biases: https://api.wandb.ai/links/vanshnawander-ocr/mgggijo5
- Demo de Gradio: https://huggingface.co/spaces/vanshnawander/anlp-assignment1-cipher-decoder-demo
- Perfil de GitHub del autor: https://github.com/vanshnawander
