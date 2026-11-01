# yas1988/smol-math-sft-merged

## Resumen

smol-math-sft-merged es un ajuste fino de SmolLM2-1.7B, el modelo causal de arquitectura Llama desarrollado por Hugging Face, especializado en la resolución paso a paso de problemas matemáticos de nivel escolar. Lo publica el usuario yas1988 como parte del curso smol de Hugging Face (capítulo 1) y emplea una metodología sencilla y reproducible: SFT con LoRA sobre TRL y fusión posterior del adaptador en los pesos base. El resultado es un checkpoint de 1.711.376.384 parámetros (1,7B) que conserva la licencia Apache 2.0 del modelo original.

El problema que aborda es acotado pero concreto: mejorar la capacidad de razonamiento aritmético de un modelo pequeño mediante 20.000 muestras del subconjunto metamathqa-50k del dataset smoltalk, en formato de conversación. No pretende ser un asistente general ni un modelo alineado para seguridad; su único uso previsto es generar soluciones detalladas a problemas de palabras tipo GSM8K, con el estilo de respuesta de MetaMathQA (`#### respuesta` y `The answer is: ...`).

Su relevancia actual es fundamentalmente didáctica y de referencia: demuestra que con una GPU T4 de Colab, menos de dos horas de entrenamiento y un adaptador LoRA de rango 16 se puede obtener una mejora medible en GSM8K 0-shot (0,4268 ± 0,0136 sobre las 1.319 preguntas del test completo) partiendo de un modelo de 1,7B. Es un punto de partida útil para quien quiera replicar el pipeline o comparar técnicas de ajuste en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Llama) |
| Parametros totales | 1.711.376.384 (1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso max_length 1024; el contexto nativo de SmolLM2-1.7B no se detalla) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors; no se listan variantes GGUF ni AWQ) |
| Idiomas soportados | ingles (segun la model card); no se declaran otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de la familia Llama, con 1.711.376.384 parametros, derivado directamente de HuggingFaceTB/SmolLM2-1.7B. El ajuste se realizo mediante SFT con LoRA usando el `SFTTrainer` de TRL y PEFT, con rango r=16, alpha=32, dropout 0,05 y modulos objetivo `all-linear`. Tras el entrenamiento, el adaptador se fusiono en los pesos base, por lo que el checkpoint publicado no requiere cargar un adaptador aparte. Se copio la plantilla de chat de SmolLM2-1.7B-Instruct, ya que el modelo base carece de ella.

Los datos de entrenamiento son las primeras 20.000 muestras del subconjunto metamathqa-50k del dataset HuggingFaceTB/smoltalk, en formato de conversacion y con razonamiento matematico paso a paso. Los hiperparametros fueron: 1 epoca (1.250 pasos), learning rate 2e-4, batch por dispositivo 2 con acumulacion de gradiente 8 (batch efectivo 16), fp16, gradient checkpointing y longitud maxima 1024. La perdida de entrenamiento bajo de 2,03 a 0,38 de forma suave, sin picos, en aproximadamente 1 h 50 min sobre una unica GPU T4 de Colab. Como correccion de generacion, se fijo `<|im_end|>` como token de fin de secuencia en el tokenizer, `config.json` y `generation_config.json` para evitar que el modelo repita la respuesta. No se reporta RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto con razonamiento matematico paso a paso para problemas de palabras de nivel escolar.
- Resolucion de problemas aritmeticos con el formato de MetaMathQA (`#### respuesta` y cierre con `The answer is: ...`).
- Conversacion de un solo turno en formato chat, gracias a la plantilla heredada de SmolLM2-1.7B-Instruct.
- Generacion de texto general limitada, heredada del modelo base, aunque no es el objetivo del ajuste.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla de la cadena de solucion matematica.
- Capacidades multilingues: solo ingles declarado; el autor indica explicitamente que no fue entrenado para otros idiomas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion de soluciones matematicas en cuadernos o materiales educativos: el modelo produce cadenas de razonamiento paso a paso en el estilo MetaMathQA, adecuadas como borrador para revisar y editar manualmente problemas de aritmetica escolar.
- Evaluacion comparativa de tecnicas de ajuste: sirve como referencia reproducible (SFT + LoRA, 20k muestras, 1,7B) para medir el impacto de cambios en datos, rango de LoRA o epocas sobre GSM8K 0-shot.
- Docencia y talleres sobre fine-tuning: su entrenamiento en una T4 de Colab en menos de dos horas lo convierte en un ejemplo practico para explicar el pipeline TRL + PEFT + fusion de adaptadores.
- Prototipado de tutores de matematicas de bajo coste: al caber en GPUs de consumo, permite desplegar un servicio interno de demostracion que resuelva problemas simples y marque el resultado con el formato esperado.
- Generacion de pares problema-solucion para aumentar datasets: sus salidas pueden filtrarse y revisarse para crear datos sinteticos de entrenamiento de matematicas, siempre con validacion humana de la respuesta final.
- Pruebas de extraccion de respuestas: su formato fijo (`####` y `The answer is: ...`) facilita construir y validar parsers de evaluacion tipo extractive_match en pipelines de investigacion.
- Experimentos de cuantizacion y despliegue en hardware modesto: con 1,7B de parametros es un banco de pruebas realista para medir latencia y memoria en GPUs de consumo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GSM8K | 0-shot, test completo (1.319 preguntas), metrica extractive_match, fp16 | 0,4268 ± 0,0136 |

No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, etc.) ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos (1,7B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB segun longitud de contexto y batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,7-2 GB para pesos; en 4 bits, alrededor de 1 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 comodo; el autor entreno y evaluo en una T4 de Colab (16 GB). Una RTX 3060, 4060 Ti o superiores son suficientes para inferencia.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas en fp16; con cuantizacion, en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (pipeline de text-generation, como en la model card), text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`); no se documentan recetas para vLLM, llama.cpp u Ollama ni pesos GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; el unico dato de tiempo es el entrenamiento (1 h 50 min en una T4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K 0-shot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yas1988/smol-math-sft-merged | 1,7B | no disponible | 0,4268 ± 0,0136 | Apache 2.0 | Hugging Face (119 descargas) |
| HuggingFaceTB/SmolLM2-1.7B (base) | 1,7B | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,7B | no disponible en esta ficha | no disponible | Apache 2.0 | Hugging Face |

No se dispone de resultados de GSM8K del modelo base ni de la variante Instruct en la informacion proporcionada, por lo que no es posible cuantificar la mejora atribuible al ajuste. Tampoco se han facilitado datos de otros modelos pequenos especializados en matematicas para una comparacion numerica fiable.

## Limitaciones y advertencias

- Entrenado solo 1 epoca sobre un subconjunto de 20.000 muestras; el propio autor senala margen de mejora con mas datos o epocas.
- Al ser un ajuste LoRA fusionado, el modelo es en gran medida el base con una actualizacion de estilo matematico; conserva los sesgos y errores del modelo original.
- Riesgo alto de errores aritmeticos y de razonamiento: el autor advierte explicitamente de que no debe usarse donde una respuesta incorrecta tenga consecuencias.
- No fue entrenado para chat general, alineamiento de seguridad ni otros idiomas; su uso fuera del ambito matematico en ingles es desaconsejado.
- Las salidas siguen un formato fijo de MetaMathQA, lo que puede requerir post-procesado si se integra en interfaces conversacionales.
- Licencia Apache 2.0, igual que el modelo base: permite uso comercial, pero debe conservarse la atribucion y revisarse las condiciones del modelo base y de los datos de entrenamiento (smoltalk) para produccion.
- No se publican variantes cuantizadas ni recetas de despliegue para motores de alta concurrencia, lo que limita su uso directo en produccion sin trabajo adicional.
- El modelo tiene 0 likes y 119 descargas en el momento de la consulta; no hay evidencia de validacion independiente mas alla de la evaluacion del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yas1988/smol-math-sft-merged
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Modelo Instruct (origen de la plantilla de chat): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Resultados de evaluacion: https://huggingface.co/datasets/yas1988/details_yas1988__smol-math-sft-merged_private
- Curso smol de Hugging Face: https://github.com/huggingface/smol-course
