# wytro/KYS-1.5B-Rewritten-v2

## Resumen

KYS-1.5B-Rewritten-v2 es una coleccion de checkpoints de modelos Llama de 1.504B parametros entrenados desde cero por el usuario wytro, dentro del brazo "rewritten" del proyecto Know-Your-Sources (KYS). El modelo parte de una mezcla de 10.000 millones de tokens repetida durante tres epocas siguiendo un "branched schedule", con fronteras de epoca en los pasos 4768 / 9537 / 14305. La relevancia principal del repositorio no es el rendimiento del modelo en si, sino que uno de sus checkpoints (`rewrite-1p5b/seed42/diversity_oriented/ep3/`) actua como checkpoint de referencia de la herramienta de evaluacion `kys-eval`: un operador externo lo re-puntua para confirmar que su pipeline reproduce los resultados antes de evaluar modelos nuevos.

Se trata de un modelo base (pretrained, sin alineamiento documentado) con arquitectura Llama 2: 28 capas, hidden size 2048, FFN de 5632 con SwiGLU, 16 cabezas de atencion, RoPE theta 10^4, RMSNorm, vocabulario de 32.000 entradas (tokenizador de Llama 2) y embeddings atados. Los pesos se publican en bf16 y en formato Nanotron, y la licencia es Apache 2.0.

El repositorio tiene un tamano de 343 GB porque incluye la matriz completa de 6 configuraciones de mezcla (`quality_base`, `quality_first`, `diversity_oriented`, `disagreement_aware`, `wrap_inspired`, `rewire_inspired`), 3 semillas (42, 43, 44) y 3 epocas (ep1, ep2, ep3), cada una con export a HuggingFace y checkpoint Nanotron nativo. El autor advierte explicitamente de que estos checkpoints v2 **no** son los que respaldan las tablas del paper, que se publican aparte como `blab-jhu/KYS-1.5B-*`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama 2 (28 capas, hidden size 2048, FFN 5632 con SwiGLU, 16 cabezas de atencion, RoPE theta 10^4, RMSNorm, embeddings atados) |
| Parametros totales | 1,504B (1.504.000.000) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no especifica la ventana de contexto entrenada) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en bf16 (safetensors) y en formato Nanotron. No se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible (tokenizador de Llama 2 con vocabulario de 32.000 entradas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 para el export de HuggingFace (`config.json`, `generation_config.json`, `model.safetensors`, `tokenizer.json`, `tokenizer_config.json`); checkpoint Nanotron nativo (`model/`, `optimizer/`, `lr_scheduler/`, `random/`, `config.yaml`, `model_config.json`, `checkpoint_metadata.json`) |
| Autor | wytro |
| Pipeline declarado | No disponible |
| Tamano del repositorio | 343,0 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion / actualizacion | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la configuracion clasica de Llama 2: 28 capas, hidden size 2048, FFN intermedia de 5632 con activacion SwiGLU, 16 cabezas de atencion, RoPE con theta 10^4, normalizacion RMSNorm y embeddings de entrada y salida atados. El vocabulario es el del tokenizador de Llama 2 (32.000 entradas) y los pesos se exportan en bf16. Segun el autor, el modelo tiene 1,504B parametros.

En cuanto al entrenamiento, la model card indica que los modelos de 1.5B del brazo "rewritten" de Know-Your-Sources se preentrenaron desde cero sobre una mezcla de 10.000 millones de tokens, repetida durante tres epocas con un "branched schedule" y con fronteras de epoca en los pasos 4768, 9537 y 14305. No se documenta en la informacion disponible la composicion detallada del dataset, ni si hubo fases de RLHF, DPO o instruction tuning; los checkpoints son de preentrenamiento. La innovacion metodologica declarada es el propio diseno del experimento: seis ajustes de mezcla (`quality_base`, `quality_first`, `diversity_oriented`, `disagreement_aware`, `wrap_inspired`, `rewire_inspired`) cruzados con tres semillas, con el objetivo de estudiar el efecto del muestreo de datos sobre el rendimiento. Los checkpoints v2 se re-puntuaron con el pipeline `kys-eval` y difieren de los del paper (pasos 4770 / 9540 / 14305, y 14147 para Diversity Oriented) en hasta aproximadamente un punto de exactitud por celda.

## Capacidades

- Generacion de texto autoregresiva como modelo base: al no estar alineado, su uso natural es la continuacion de texto y la experimentacion, no el dialogo instructivo.
- Evaluacion en tareas de conocimiento y razonamiento de opcion multiple: la model card publica puntuaciones 0-shot en ARC-e, HellaSwag, PIQA, SIQA, OBQA, CSQA y MMLU.
- Reproducibilidad de pipelines de evaluacion: el checkpoint `seed42/diversity_oriented/ep3` esta pensado para que terceros verifiquen sus resultados con `kys-eval` mediante el comando `python -m kys_eval.reference_check`.
- Compatibilidad con el ecosistema HuggingFace: el export `hf/` usa `LlamaForCausalLM` con pesos `safetensors` en bf16.
- Reanudacion de entrenamiento: los checkpoints Nanotron incluyen estado de optimizador, planificador de learning rate y estado aleatorio, lo que permite continuar el entrenamiento tal como se interrumpio.
- Soporte de tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponible; no se documenta.
- Capacidades especiales (vision, audio, modo "thinking"): no disponible; no se documentan.

## Casos de uso

- Verificacion de pipelines de evaluacion: un equipo que despliegue su propio harness de benchmarks puede lanzar `kys_eval.reference_check` contra `rewrite-1p5b/seed42/diversity_oriented/ep3/hf` y comparar sus puntuaciones con las esperadas (Mean6 = 46,52; MMLU = 30,97) antes de evaluar modelos nuevos, detectando discrepancias de tokenizacion, prompts o normalizacion.
- Investigacion sobre mezclas de datos y curriculos de entrenamiento: el repositorio ofrece una matriz de 6 configuraciones de mezcla x 3 semillas x 3 epocas entrenada bajo el mismo presupuesto de 10.000 millones de tokens, lo que permite analizar el efecto del muestreo de datos sobre la exactitud con un coste de computo contenido (1,5B de parametros).
- Ablaciones con control de semilla: al publicar las semillas 42, 43 y 44 por separado, se puede estimar la varianza entre semillas de cada configuracion y comprobar si las diferencias entre estrategias de mezcla superan el ruido de inicializacion.
- Modelo base para fine-tuning experimental: sirve como punto de partida para estudiar tecnicas de ajuste (SFT, LoRA, DPO) en un modelo pequeno y con licencia Apache 2.0, sin las restricciones de uso de otros checkpoints de Llama.
- Validacion de infraestructura de entrenamiento distribuido: los checkpoints Nanotron, con directorios separados de modelo, optimizador, planificador y estado aleatorio, permiten probar rutinas de reanudacion de entrenamiento y de conversion de formato sin depender de un modelo grande.
- Auditoria de discrepancias entre versiones de un checkpoint: la advertencia del autor sobre las diferencias de hasta aproximadamente un punto respecto a los checkpoints del paper permite estudiar como cambios menores en el schedule alteran las puntuaciones publicadas.
- Prototipado y docencia en una sola GPU: con 1,504B parametros en bf16, el modelo cabe en GPUs de consumo, lo que facilita demostraciones de preentrenamiento, evaluacion y decodificacion sin infraestructura de centro de datos.

## Benchmarks y rendimiento

Resultados publicados en la model card para el checkpoint de referencia `rewrite-1p5b/seed42/diversity_oriented/ep3/`, medidos con `acc_norm` en porcentaje, 0-shot, sobre los splits completos y en una NVIDIA H100 80GB HBM3:

| Benchmark | Configuracion | Resultado (acc_norm, %) |
|---|---|---|
| ARC-e | 0-shot, split completo | 51,52 |
| HellaSwag | 0-shot, split completo | 49,82 |
| PIQA | 0-shot, split completo | 72,03 |
| SIQA | 0-shot, split completo | 39,10 |
| OBQA | 0-shot, split completo | 35,20 |
| CSQA | 0-shot, split completo | 31,45 |
| Mean6 (media de los seis anteriores) | 0-shot | 46,52 |
| MMLU | 0-shot, split completo | 30,97 |

Tambien se publica el hash SHA-256 del fichero de pesos de referencia: `733262aec4ca52fe94b69df0acf7ef1faa7cd0fc1f42ee79b91004a022db3f45`.

No se han proporcionado resultados de benchmarks de otros modelos ni comparaciones directas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 1,504B parametros; el autor solo documenta bf16, por lo que las cifras de cuantizacion son estimaciones y no configuraciones publicadas): aproximadamente 3,0 GB de pesos en bf16/fp16, ~1,5 GB en int8 y ~0,8 GB en int4, a los que hay que sumar la cache KV (no cuantificada en la documentacion).
- GPU utilizadas por el autor para la evaluacion: NVIDIA H100 80GB HBM3, segun la model card.
- GPU de centro de datos compatibles: A100, H100, H200 o cualquier acelerador con al menos 8-16 GB de memoria para bf16 con margen.
- GPU de consumo: cabe con holgura en tarjetas de gama media y alta. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 de 24 GB pueden ejecutar el modelo en bf16 sin necesidad de cuantizarlo; tarjetas con 6-8 GB requeririan cuantizacion de pesos, que no esta documentada en el repositorio.
- Opciones de despliegue: `transformers` (clase `LlamaForCausalLM`) es la via documentada, ya que el export `hf/` esta en formato estandar; el entrenamiento y la reanudacion se realizan con Nanotron. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros motores, ni la existencia de ficheros GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

En la informacion proporcionada no se incluyen modelos comparables ni sus metricas, y los resultados de la busqueda web no aportan datos tecnicos sobre alternativas. La model card si menciona que los checkpoints de la epoca del paper se publican por separado en la organizacion `blab-jhu`, bajo los nombres `blab-jhu/KYS-1.5B-*`, que serian la comparacion mas directa para reproducir las tablas del paper.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmark comparable |
|---|---|---|---|---|---|
| KYS-1.5B-Rewritten-v2 (este repo) | 1,504B | No disponible | Apache 2.0 | HuggingFace, repositorio de 343 GB con matriz completa de semillas, ajustes y epocas | ARC-e 51,52; HellaSwag 49,82; PIQA 72,03; SIQA 39,10; OBQA 35,20; CSQA 31,45; Mean6 46,52; MMLU 30,97 |
| blab-jhu/KYS-1.5B-* (checkpoints de la epoca del paper) | No disponible en la informacion (se describe como la misma familia de 1.5B) | No disponible | No disponible | HuggingFace | No disponible; el autor indica diferencias de hasta ~1 punto de exactitud por celda respecto a los v2 |
| Otras alternativas de ~1-2B parametros | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo base sin alineamiento: no hay evidencia en la model card de RLHF, DPO o instruction tuning, por lo que no cabe esperar seguimiento de instrucciones ni formato conversacional fiable sin un ajuste posterior.
- Riesgo de alucinacion elevado: con MMLU 30,97 y CSQA 31,45, el conocimiento factual y de sentido comun es limitado; no es adecuado para tareas de respuesta factual sin verificacion externa.
- Puntuaciones bajas en la mayoria de benchmarks: PIQA (72,03) es el unico resultado por encima del 60%; HellaSwag (49,82), ARC-e (51,52) y SIQA (39,10) quedan en rangos propios de un modelo pequeno con solo 10.000 millones de tokens de entrenamiento.
- Discrepancia con las tablas del paper: el autor advierte de que estos checkpoints v2 no respaldan las cifras publicadas; las diferencias pueden alcanzar aproximadamente un punto de exactitud por celda. Para reproducir el paper deben usarse los repositorios `blab-jhu/KYS-1.5B-*`.
- Longitud de contexto desconocida: la model card no especifica la ventana de contexto entrenada, lo que impide garantizar el comportamiento en secuencias largas.
- Idiomas no especificados: no se declara cobertura multilingue; el tokenizador es el de Llama 2, de 32.000 entradas, orientado a ingles en su origen.
- Sin cuantizaciones publicadas: la ausencia de ficheros GGUF, AWQ o GPTQ limita el despliegue en hardware sin soporte para bf16 y obliga a generar conversiones propias.
- Repositorio de 343 GB: la descarga completa de todas las combinaciones es costosa en almacenamiento y ancho de banda; conviene descargar solo el subdirectorio necesario mediante las utilidades de descarga selectiva de HuggingFace.
- Adopcion nula verificada: 0 descargas y 0 likes en el momento de la consulta, lo que implica una validacion externa practicamente inexistente al margen del propio autor.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero al tratarse de un modelo base sin ajuste, cualquier aplicacion en produccion requerira trabajo adicional de alineamiento, evaluacion de sesgos y control de calidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wytro/KYS-1.5B-Rewritten-v2
- Herramienta de evaluacion kys-eval: https://github.com/imHuicongZhang/kys-eval
- Organizacion con los checkpoints de la epoca del paper (`blab-jhu/KYS-1.5B-*`): https://huggingface.co/blab-jhu
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron unicamente articulos periodisticos sin relacion con el contenido tecnico de la ficha.
