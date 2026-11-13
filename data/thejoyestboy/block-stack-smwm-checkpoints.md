# thejoyestboy/block-stack-smwm-checkpoints

## Resumen

`block-stack-smwm-checkpoints` es un repositorio de checkpoints de políticas de imitación para robótica de manipulación, publicado por el usuario `thejoyestboy` en Hugging Face. No es un modelo de lenguaje ni un modelo fundacional de propósito general: contiene dos políticas de inferencia (Privilege FM Policy y RGB FM Policy) entrenadas con *imitation learning* supervisado sobre un conjunto de demostraciones generado por un profesor scripted denominado "Better Scripted Policy 5K", dentro de un entorno de apilamiento de bloques (*block stacking*).

Ambas políticas emplean *conditional flow matching* sobre un transformer causal que transforma ruido gaussiano en *chunks* de acciones limpias del profesor. La diferencia principal entre ambas está en la observación de entrada: una consume estado privilegiado del simulador y la otra consume tres fotogramas RGB procesados por una CNN entrenable. Los checkpoints corresponden al paso de optimización 100.000 con semilla 0 y se distribuyen como ficheros PyTorch personalizados (`policy.pt`), no como modelos compatibles con `transformers`.

El interés del repositorio es acotado pero técnico: documenta un protocolo de evaluación reproducible (100 escenas × 2 semillas, hasta 1.795 controles por episodio) y distingue explícitamente entre configuraciones de inferencia (ruido de muestreo estándar frente a ruido cero), lo que resulta relevante para quien investigue *flow matching* aplicado a control robótico y quiera reproducir resultados sin confundir variaciones de muestreo con mejoras reales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con *conditional flow matching* (predicción de *chunks* de acción); la variante RGB incorpora una CNN entrenable sobre 3 fotogramas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada compuesta por estado privilegiado + 16 bloques de acción pasados (Privilege) o 3 frames RGB + 8 bloques de acción pasados (RGB) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precisión de entrenamiento) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada/salida de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (checkpoints personalizados, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

Las dos políticas son transformers causales entrenados con *conditional flow matching*: el modelo aprende a transformar ruido gaussiano en *chunks* de acciones limpias del profesor. Cada predicción cubre 16 bloques de acción, y cada bloque representa cinco controles del simulador. La evaluación ejecuta un bloque cada vez con 10 pasos de integración del flujo.

El entrenamiento es imitación supervisada sobre "Better Scripted Policy 5K". Se usa AdamW con tasa de aprendizaje 0,0003, *warmup* con decaimiento coseno y pesos EMA para inferencia. Privilege FM Policy entrena con *batch* 1.024 y aplica un peso de muestreo 3× a las fases tardías de colocación de los bloques 3 y 4, sin pérdida auxiliar. RGB FM Policy entrena con microbatch 64 y cuatro pasos de acumulación (*batch* efectivo 256), muestreo uniforme y una pérdida auxiliar MSE de 0,1× sobre tamaño de caja, material y pose; estas etiquetas auxiliares solo se usan en entrenamiento. La CNN visual del checkpoint RGB está entrenada de forma conjunta, por lo que no requiere un codificador visual externo congelado.

## Capacidades

- Generación de *chunks* de acción de 16 bloques para control robótico de apilamiento de bloques, con cinco controles por bloque.
- Política basada en estado privilegiado del simulador (Privilege FM Policy), útil como referencia o *teacher* en destilación.
- Política basada en visión RGB (RGB FM Policy), que procesa tres fotogramas con una CNN entrenable integrada.
- Modelado generativo de acciones mediante *flow matching*, con control explícito del ruido de muestreo en inferencia.
- Predicción de propiedades auxiliares durante el entrenamiento (tamaño de caja, material y pose), no expuestas como salida en inferencia.
- No soporta *tool calling*, agentes multi-paso, razonamiento en lenguaje natural, matemáticas ni capacidades multilingües.

## Casos de uso

- Reproducción de resultados de investigación en *flow matching* para control: cargar los checkpoints con el *loader* `smwm-clean` (commit `7a41e70`) y replicar el protocolo de evaluación de 100 escenas × 2 semillas para verificar las tasas de éxito publicadas.
- Línea base de imitación en robótica de manipulación: usar Privilege FM Policy como referencia superior de estado privilegiado frente a políticas puramente visuales en experimentos de apilamiento.
- Destilación de política visual: emplear la política privilegiada como *teacher* para entrenar o comparar políticas RGB que solo dispongan de cámara.
- Estudio de sensibilidad al ruido de muestreo: comparar la inferencia con ruido gaussiano estándar (escala 1) frente a ruido cero (escala 0) para analizar cómo afecta la aleatoriedad del sampler a la tasa de éxito.
- Evaluación de arquitecturas con pérdidas auxiliares: analizar el efecto de la pérdida auxiliar MSE (0,1×) sobre tamaño, material y pose en el rendimiento de la política RGB.
- Integración en pipelines de simulación para *benchmarking* interno: usar los checkpoints como política de referencia en entornos de apilamiento con el simulador compatible y la construcción de observaciones correspondiente.

## Benchmarks y rendimiento

Los únicos datos publicados son resultados de validación/desarrollo del autor, no de *test* independiente.

| Política | Entrada | Tasa de éxito (validación) | Ruido de muestreo |
|---|---|---|---|
| Privilege FM Policy | Estado privilegiado + 16 bloques de acción pasados | 160/200 (80%) | 1 (gaussiano estándar) |
| RGB FM Policy | 3 frames RGB + 8 bloques de acción pasados | 161/200 (80,5%) | 0 (sin ruido inicial) |

El autor advierte que la diferencia de un episodio entre ambas no establece superioridad, ya que las configuraciones de inferencia difieren y las dos repeticiones por semilla no son extracciones estocásticas independientes cuando el ruido es cero. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 2,1 GB, lo que da una cota superior aproximada del espacio en disco de los checkpoints, no de la VRAM en ejecución.
- GPU recomendadas: no disponible. El autor documenta carga en CPU (`device="cpu"`) en el ejemplo de uso, por lo que la inferencia en CPU es viable.
- Compatibilidad con GPU de consumo: no confirmada; al no publicarse el número de parámetros ni el consumo de memoria, no puede afirmarse que quepa en tarjetas como RTX 4090.
- Opciones de despliegue: carga mediante `huggingface_hub.hf_hub_download` y la función `load_distill_policy` del código `block-stack-world-model` (loader `smwm-clean`, commit `7a41e70`). No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La evaluación ejecuta un bloque de acción cada vez con 10 pasos de integración de flujo, lo que condiciona el coste por paso de control, pero no se publican tiempos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Las alternativas habituales en imitación robótica (políticas tipo diffusion policy, ACT o VQ-BeT) no aparecen referenciadas en la model card, por lo que no se ofrece tabla comparativa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| block-stack-smwm-checkpoints | no disponible | no aplica | 80% / 80,5% validación (configuraciones distintas) | no disponible | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados son de validación/desarrollo (100 escenas × 2 semillas, máximo 1.795 controles por episodio), no de *test* final independiente.
- La comparación entre ambas políticas no es limpia: una usa ruido de muestreo 1 y la otra ruido 0, por lo que la diferencia de 0,5 puntos no implica superioridad.
- Los checkpoints son ficheros PyTorch personalizados; requieren el código `block-stack-world-model`, la construcción de observaciones exacta, la normalización guardada y el simulador compatible. No funcionan con `AutoModel` de Transformers.
- El repositorio no incluye otras políticas, estados del optimizador, checkpoints intermedios, datasets ni trayectorias, lo que limita la reanudación del entrenamiento o el análisis posterior.
- No se especifica licencia, por lo que el uso comercial queda sin autorización explícita y debe consultarse con el autor.
- El modelo está entrenado para una tarea concreta (apilamiento de bloques en simulador); no generaliza a otras tareas de manipulación sin reentrenamiento.
- No hay información sobre sesgos, alucinación en el sentido de modelos de lenguaje, ni cobertura idiomática, al no ser un modelo de lenguaje.
- La política RGB depende de tres fotogramas y de una CNN entrenada conjuntamente; cambios en la cámara, iluminación o resolución del simulador pueden degradar el rendimiento sin garantías documentadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thejoyestboy/block-stack-smwm-checkpoints
- Checkpoint Privilege FM Policy: https://huggingface.co/thejoyestboy/block-stack-smwm-checkpoints/blob/main/Privilege%20FM%20Policy/policy.pt
- Checkpoint RGB FM Policy: https://huggingface.co/thejoyestboy/block-stack-smwm-checkpoints/blob/main/RGB%20FM%20Policy/policy.pt
- Código compatible `block-stack-world-model` (loader `smwm-clean`, commit `7a41e70`): no se proporciona URL en la información disponible.
