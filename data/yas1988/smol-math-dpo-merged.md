# yas1988/smol-math-dpo-merged

## Resumen

smol-math-dpo-merged es un modelo de lenguaje causal de tipo Llama desarrollado por el usuario yas1988 como parte de su participacion en el curso Smol de Hugging Face (Unidad 2, alineamiento de preferencias). Se construye sobre SmolLM2-1.7B, al que se aplico primero un ajuste supervisado (SFT) sobre MetaMathQA y despues un alineamiento con Direct Preference Optimization (DPO) mediante LoRA, fusionando finalmente el adaptador en los pesos base. El resultado es un modelo de 1.711.376.384 parametros orientado a la resolucion de problemas matematicos elementales y a la generacion de texto conversacional.

El modelo resuelve el problema de alinear un modelo pequeno ya especializado en matematicas con preferencias humanas de respuesta, usando pares elegido/rechazado de UltraFeedback. Su relevancia es principalmente didactica y de investigacion: demuestra un pipeline completo de SFT + DPO reproducible en una unica GPU T4 de Colab en unos 42 minutos, lo que lo convierte en un caso de estudio util para entender el alineamiento de preferencias en modelos de menos de 2.000 millones de parametros.

La arquitectura es un transformer causal denso con atencion estandar, sin innovaciones de atencion lineal ni mezcla de expertos. El contexto de entrenamiento se limito a 512 tokens y el modelo esta pensado para ingles. La licencia Apache 2.0 heredada de SmolLM2 permite uso comercial, aunque el autor no publica evaluacion final de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (familia Llama) |
| Parametros totales | 1.711.376.384 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible de forma explicita; el entrenamiento uso max_length 512 |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Llama, con 1.711 millones de parametros, derivado de SmolLM2-1.7B. El pipeline de entrenamiento consta de tres etapas: partida desde SmolLM2-1.7B, ajuste supervisado (SFT) sobre MetaMathQA con LoRA (etapa previa que produce yas1988/smol-math-sft-merged) y, finalmente, alineamiento con DPO usando TRL `DPOTrainer`. El adaptador LoRA se fusiono en los pesos base tras el entrenamiento.

Los detalles del DPO son concretos: LoRA con r=16, alpha=32, dropout 0.05 y modulos objetivo `all-linear`; beta 0.1, learning rate 2e-5, 1 epoca (172 pasos), batch por dispositivo 1 con acumulacion de gradiente 16 (batch efectivo 16), fp16, gradient checkpointing y longitud maxima 512. Los datos de preferencia son los primeros 3.000 ejemplos de `trl-lib/ultrafeedback_binarized` (pares chosen/rejected). El entrenamiento se ejecuto en una unica GPU T4 de Colab en aproximadamente 42 minutos. La perdida de entrenamiento paso de 0.692 a aproximadamente 0.64, partiendo cerca de ln 2 = 0.693 como es esperable en DPO. Las metricas finales de recompensa fueron accuracy 0.54 y margin 0.015. El token de fin de secuencia configurado es `<|im_end|>`, de modo que la generacion se detiene tras la respuesta.

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat (roles user/assistant).
- Razonamiento matematico elemental: problemas aritmeticos de enunciado, del estilo de GSM8K y MetaMathQA.
- Resolucion de problemas de varios pasos en formato de texto (por ejemplo, "Tom tiene 5 manzanas y compra 3 mas").
- Alineamiento de preferencias orientado a respuestas mas deseables segun UltraFeedback.
- Parada limpia de generacion gracias al token `<|im_end|>`.
- Compatible con `transformers` pipeline y con text-generation-inference (tag `text-generation-inference`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidad multilingue no documentada; la model card indica unicamente ingles.

## Casos de uso

- Tutoria de matematicas basicas: el modelo puede resolver problemas aritmeticos de enunciado paso a paso, aprovechando el SFT sobre MetaMathQA, en un entorno educativo de bajo coste.
- Demostracion didactica de DPO: sirve como ejemplo reproducible de pipeline SFT + DPO + merge de LoRA para cursos y talleres, ya que el entrenamiento completo cabe en una T4 en menos de una hora.
- Prototipado rapido de asistentes conversacionales en ingles: con 1.700 millones de parametros se puede desplegar en una GPU consumer para pruebas de concepto de chat multi-turno.
- Generacion de explicaciones matematicas en aplicaciones de refuerzo escolar: el modelo produce respuestas en lenguaje natural a problemas numericos sencillos, adecuado para generar ejercicios resueltos.
- Investigacion sobre alineamiento de preferencias en modelos pequenos: permite estudiar el efecto de DPO con subconjuntos pequenos (3.000 pares) y comparar con la version SFT.
- Base para experimentos de cuantizacion y despliegue ligero: al ser un modelo de 1.7B en safetensors, es un candidato para probar pipelines de cuantizacion y servir con vLLM o TGI en hardware modesto.
- Filtrado o generacion de pares de respuesta en ingles para tareas de matematicas dentro de pipelines de datos, dado su tamano reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de evaluacion con los campos GSM8K (0-shot), TruthfulQA y ARC marcados como "TBD", y unicamente aporta la referencia del modelo SFT previo en GSM8K 0-shot: 0.4268. No se dispone de cifras del modelo DPO final ni de comandos de evaluacion reproducibles.

| Tarea | smol-math-dpo-merged | smol-math-sft-merged (referencia) |
|---|---|---|
| GSM8K (0-shot) | TBD | 0.4268 |
| TruthfulQA | TBD | No disponible |
| ARC | TBD | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica unos 5-6 GB.
- En cuantizacion de 8 bits: alrededor de 1,8-2 GB de pesos.
- En cuantizacion de 4 bits: alrededor de 1 GB de pesos, con un consumo total tipico de 2-3 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090); A100 y H100 sobradas para este tamano.
- Cabe en GPU consumer: si, en tarjetas de 8 GB o superiores en fp16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` pipeline (documentado en la model card), text-generation-inference (tag oficial), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles; el autor solo reporta el tiempo de entrenamiento (unos 42 minutos en una T4), no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smol-math-dpo-merged | 1,71B | No disponible (entreno a 512) | Matematicas + DPO | Apache 2.0 | Hugging Face |
| SmolLM2-1.7B (base) | 1,71B | 8.192 tokens (segun la familia SmolLM2) | Proposito general | Apache 2.0 | Hugging Face |
| smol-math-sft-merged | 1,71B | No disponible (entreno a 512) | Matematicas (solo SFT) | Apache 2.0 | Hugging Face |
| Qwen2.5-Math-1.5B | 1,54B | 4.096 tokens (segun la familia Qwen2.5) | Matematicas | Apache 2.0 | Hugging Face |

La comparativa con Qwen2.5-Math-1.5B se ofrece como referencia de categoria por tamano y especialidad, pero no se dispone de datos de rendimiento del modelo de yas1988 para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El DPO se ejecuto sobre un subconjunto de solo 3.000 muestras y una unica epoca, por lo que el alineamiento es limitado y puede no corregir sesgos del modelo SFT.
- No hay evaluacion final publicada: GSM8K, TruthfulQA y ARC figuran como TBD, de modo que el rendimiento real del modelo DPO es desconocido.
- Riesgo de alucinacion en problemas matematicos fuera de la distribucion de MetaMathQA y en preguntas de conocimiento general.
- Ventana de contexto efectiva limitada: el entrenamiento uso max_length 512, aunque la arquitectura base soporte ventanas mayores.
- Idioma: la model card indica unicamente ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Modelo de muy bajo uso (0 descargas, 0 likes) y sin validacion externa; no es aconsejable para produccion sin evaluacion propia.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y posibles sesgos de SmolLM2 y de los datos de UltraFeedback y MetaMathQA.
- El token de parada es `<|im_end|>`; si se integra en pipelines que no lo respeten, la generacion puede continuar mas alla de la respuesta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yas1988/smol-math-dpo-merged
- Modelo base SFT: https://huggingface.co/yas1988/smol-math-sft-merged
- Dataset de preferencias: https://huggingface.co/datasets/trl-lib/ultrafeedback_binarized
- SmolLM2-1.7B (modelo de partida): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
- Curso Smol de Hugging Face: https://github.com/huggingface/smol-course
- TRL (DPOTrainer): https://github.com/huggingface/trl
