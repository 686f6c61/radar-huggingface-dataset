# YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter199

## Resumen
E2K-Qwen3.5-9B-tagged-B-process-rl-iter199 es un checkpoint de investigacion derivado de Qwen/Qwen3.5-9B, publicado por el usuario YanSong97 en Hugging Face. No se trata de una mejora de proposito general del modelo base, sino de un artefacto experimental centrado en la internalizacion de conocimiento ("experience-to-knowledge", E2K) sobre entornos concretos de ARC-AGI-3, especificamente los entornos de primer nivel `cd82` y `m0r0`. El modelo combina una fase de ajuste supervisado (SFT) seguida de aprendizaje por refuerzo (RL) con recompensas de resultado y de proceso.

El checkpoint corresponde al rollout 199 (zero-based) de una rama de RL con penalizaciones de error, partiendo de la etapa SFT denominada `B_full`, inicializada de forma independiente desde Qwen3.5-9B. Cuenta con 9.653.104.368 parametros totales segun los pesos en safetensors y un repositorio de 19,3 GB distribuido en 60 shards. El modelo mantiene la torre de vision y los tensores auxiliares MTP congelados, sin entrenamiento en esta fase.

Su relevancia es acotada y de caracter investigador: documenta un protocolo de internalizacion de conocimiento y RL sobre tareas de grid, con resultados no monotonos y dominados por uno de los entornos. El autor advierte explicitamente de que no constituye evidencia de exito en layouts nuevos ni en el juego completo, y de que las etiquetas o la recitacion de conocimiento no demuestran un uso correcto del mismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con torre de vision y tensores auxiliares MTP congelados |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como especificacion del modelo; en RL se uso un cap de salida de 16K y una ventana de estado de 12K |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 (copiada de la exportacion del modelo base) |
| Formato de pesos | safetensors (60 shards, con `model.safetensors.index.json`) |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura Qwen3.5 multimodal, con un decodificador de lenguaje y una torre de vision, mas tensores auxiliares de prediccion multi-token (MTP). En este experimento la torre de vision y los tensores MTP no se entrenaron: el helper de exportacion restauro los activos de inferencia congelados. El entrenamiento es de naturaleza texto/grid, orientado a tareas de ARC-AGI-3.

La fase SFT (`B_full`) se inicializo de forma independiente desde Qwen3.5-9B, con 59 actualizaciones, 3 epocas, learning rate 5e-6 y batch global 4, con supervision completa del objetivo y sin enmascarado del cuerpo de conocimiento. La fase de RL arranca desde ese SFT con un Adam nuevo en la frontera SFT/RL y utiliza 40 acciones de entorno por episodio, esfuerzo de razonamiento medio, cap de salida de 16K, temperatura 1, learning rate constante 1e-6 y paralelismo TP4/PP1. Cada batch contiene 8 episodios (4 de `cd82` y 4 de `m0r0`), con semilla de entorno 0 y arranque en nivel 0/capacidad 1. La etapa cubierta por este checkpoint abarca los rollouts 100 a 199, siendo su padre el checkpoint iter99.

El conjunto de conocimiento observacional local contiene 29 hechos de primer nivel (22 de `cd82` y 7 de `m0r0`), representados por 58 filas de pregunta/respuesta, mas 12 ejemplos de estado/aplicacion construidos y 8 ejemplos de protocolo de primera observacion. La recompensa de resultado exige una limpieza real del primer nivel configurado; la rama de proceso anade una recompensa por progreso de estado de tarea verificado de forma independiente, con tope 0,2 y gamma 0,99 sobre acciones reales, usando estado y planificacion privilegiados en el lado de la recompensa.

## Capacidades
- Generacion de texto y razonamiento conversacional sobre la base de Qwen3.5-9B.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), heredado del modelo base, con torre de vision congelada.
- Razonamiento multi-paso orientado a tareas de agente sobre entornos de grid (ARC-AGI-3).
- Internalizacion y aplicacion de conocimiento factual de primer nivel sobre los entornos `cd82` y `m0r0`.
- Ejecucion de secuencias de acciones de entorno dentro de un episodio, con un limite de 40 acciones.
- Capacidades multilingues: no disponibles como dato explicito; la model card incluye texto en chino e ingles.
- Soporte de tool calling / function calling: no disponible como dato explicito.
- Modo de razonamiento con esfuerzo configurable (se uso "medium" en RL).

## Casos de uso
- Investigacion en internalizacion de conocimiento: permite reproducir y analizar el protocolo E2K, comparando la fase SFT con las distintas iteraciones de RL para estudiar como se incorpora conocimiento factual al comportamiento del agente.
- Experimentacion en RL con recompensas de proceso: sirve como punto de partida para probar esquemas de recompensa que combinen resultado y progreso de estado verificado, dado que el autor documenta el protocolo exacto.
- Estudio de agentes sobre ARC-AGI-3: util para evaluar el comportamiento de un modelo Qwen3.5-9B ajustado en entornos de grid de primer nivel, con la advertencia de que no generaliza a layouts nuevos.
- Analisis de fallos en agentes: el autor documenta errores de coordenadas fabricadas, mezcla de reglas entre juegos y desajustes entre explicacion y accion, lo que hace del checkpoint un material util para auditar modos de fallo.
- Reproducibilidad de pipelines de entrenamiento: los artefactos asociados (protocolos de ejecucion, metricas y serie de checkpoints) permiten reconstruir el linaje de entrenamiento y validar la procedencia de los pesos.
- Base para futuros experimentos de continuacion: los pesos en HF pueden inicializar trabajo posterior, aunque no permiten continuar exactamente el estado de Adam ni el sampler original.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card reporta unicamente metricas internas de entrenamiento (recompensas relativas al grupo, cohortes de muestreo) y advierte de que no deben interpretarse como evaluacion independiente de los pesos exportados. Tampoco se presentan cifras de MMLU, HumanEval, GSM8K ni de exito en los entornos.

## Requisitos de hardware
- VRAM estimada para inferencia: en bfloat16, los 9.653.104.368 parametros requieren aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda una GPU de 24 GB o superior para bfloat16.
- GPU recomendadas: A100 (40/80 GB) o H100 (80 GB) para despliegue comodo con contexto largo; una RTX 4090 (24 GB) puede ser ajustada en bfloat16 y mas holgada con cuantizacion de 8 bits, si bien no se documentan cuantizaciones oficiales.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) con cuantizacion; en GPUs de 16 GB requeriria cuantizacion agresiva, no verificada por el autor.
- Opciones de despliegue: transformers con `AutoProcessor` y `Qwen3_5ForConditionalGeneration` (ejemplo oficial de carga); vLLM, llama.cpp, Ollama y TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-Qwen3.5-9B-tagged-B-process-rl-iter199 | 9.653.104.368 | no disponible | Checkpoint de investigacion E2K/RL sobre ARC-AGI-3 | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en la informacion | no disponible | Modelo multimodal de proposito general | no disponible en la informacion | Hugging Face |
| YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter99 (checkpoint padre) | no disponible en la informacion | no disponible | Etapa previa del mismo protocolo RL | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, linaje y licencia.

## Limitaciones y advertencias
- El autor declara explicitamente que el checkpoint no es una mejora de proposito general de Qwen3.5-9B ni evidencia de exito en layouts nuevos o en el juego completo.
- El aprendizaje es no monotonico y esta dominado por el entorno `m0r0`; la continuacion del proceso se detuvo en 341 muestreos fallidos, quedando 340 como ultima actualizacion verificada en lugar de completar 400.
- Los pesos del pico 260..269 no se conservan y el checkpoint HF249 no esta etiquetado como el mejor.
- Las auditorias detectan coordenadas fabricadas, mezcla de reglas entre juegos, desajuste entre explicacion y accion y generacion repetida incluso en episodios exitosos.
- Las etiquetas o la recitacion de conocimiento no son evidencia de un uso correcto del conocimiento.
- La cohorte de muestreo se genero antes de su actualizacion y no debe presentarse como evaluacion independiente de estos pesos.
- `rollout/rewards` es una media ponderada por respuesta de la ventaja relativa al grupo, no la recompensa del entorno.
- No se suben estados de optimizador, checkpoints distribuidos nativos, pickles, ni estado de RNG o sampler: los pesos no permiten una continuacion exacta de Adam.
- La licencia Apache-2.0 se copia de la exportacion original del modelo base; conviene verificar las condiciones del modelo base para uso comercial.
- No se han documentado sesgos, idiomas soportados ni riesgos de alucinacion mas alla de los fallos descritos en el entorno experimental.
- La informacion disponible es escasa en cuanto a contexto maximo, cuantizaciones e idiomas, lo que limita su uso directo en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter199
- Checkpoint padre (iter99): https://huggingface.co/YanSong97/E2K-Qwen3.5-9B-tagged-B-process-rl-iter99
- Dataset de conocimiento y filas SFT: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-data
- Dataset de protocolos de ejecucion, metricas y serie de checkpoints: https://huggingface.co/datasets/YanSong97/E2K-tagged-knowledge-rl-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
