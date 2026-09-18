# zbeeb/Qwen2.5-3B-GRPO-Staleness-4

## Resumen

Qwen2.5-3B-GRPO-Staleness-4 es un checkpoint de investigación publicado por el usuario zbeeb en HuggingFace. Se trata de un ajuste por aprendizaje por refuerzo (GRPO, *Group Relative Policy Optimization*) de parámetros completos sobre el modelo base Qwen/Qwen2.5-3B, entrenado con 1.000 actualizaciones sobre un subconjunto de 17.005 filas del dataset de matemáticas DAPO (zbeeb/Staleness-GRPO-DAPO-Math-17k). La particularidad del experimento es el control del *staleness* o desfase entre la política que genera los rollouts y la política que se actualiza: en esta release el tope está fijado en 4 pasos off-policy (`max_off_policy_steps = 4`), de ahí el sufijo "Staleness-4".

El modelo es denso, con 3.085.938.688 parámetros reales según los pesos en safetensors, y conserva la arquitectura y el tokenizador de Qwen2.5-3B sin modificaciones. Su relevancia es fundamentalmente metodológica: forma parte de una serie de brazos experimentales que estudian cómo afecta el envejecimiento de los rollouts al entrenamiento con GRPO, con configuración de entrenamiento, manifiesto de exportación y resultados de evaluación publicados de forma machine-readable. No es un modelo orientado a producto ni a despliegue generalista, sino un artefacto reproducible para investigación en RL aplicado a razonamiento matemático.

El autor advierte explícitamente que las comparaciones entre brazos no constituyen ablaciones puras de staleness, porque la topología de GPUs varía entre ejecuciones y porque los runs con topes más altos no continúan a los de tope más bajo. Los idiomas declarados son inglés y chino, y la licencia es la del modelo base (qwen-research), incluida sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (tag `qwen2`); no es MoE. Detalle de capas, cabezas y atencion no disponible en la informacion proporcionada |
| Parametros totales | 3.085.938.688 (dato real de safetensors) |
| Longitud de contexto | Configuracion posicional nativa preservada. El entrenamiento usa 4.096 tokens de contexto total y hasta 3.072 tokens de completion. La release no configura ni valida la extension a 8K |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay GGUF, AWQ, GPTQ ni versiones de 4/8 bits validadas por el autor |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | `other` / `qwen-research` (LICENSE del modelo base incluida sin cambios) |
| Formato de pesos | Safetensors sharded; el dtype exacto de guardado no se especifica en la informacion disponible (el ejemplo de uso carga en bfloat16) |
| Tamano del repositorio | 12,4 GB |
| Pipeline | text-generation; compatible con text-generation-inference y endpoints_compatible |
| Modelo base | Qwen/Qwen2.5-3B (relacion: finetune) |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B, un transformer decoder-only, sin cambios en pesos de tokenizador ni en la configuracion posicional nativa. El ajuste es de parámetros completos (*full-parameter*), no LoRA ni adaptadores. El entrenamiento se realizó con PrimeRL v0.9.0 durante 1.000 actualizaciones, con batch size 64, group size 8, semilla 42, optimizador AdamW con learning rate 1e-6, 30 actualizaciones de warmup, PPO clip de 0,2 y sin penalizacion KL de referencia. La recompensa es determinista y puntúa la equivalencia matematica de la respuesta terminal. La topologia de cómputo empleada fue de 3 GPUs para el entrenador y 2 GPUs para inferencia.

La innovación técnica del experimento es el control del *staleness* de la política de rollout mediante `max_off_policy_steps`, fijado en 4. El checkpoint parte del modelo base fijado a una revisión concreta y con estado de optimizador nuevo, de modo que no es una continuación de runs con topes menores. El contexto total durante el entrenamiento es de 4.096 tokens, con hasta 3.072 tokens de completion por muestra.

La exportación a safetensors es sin pérdida respecto al dtype guardado e incluye comprobaciones de procedencia del paso 1.000, tensores finitos, recarga estricta, embeddings atados (*tied embeddings*), ida y vuelta del tokenizador y logits idénticos en una sonda de CPU antes y después de la serialización. El estado del optimizador permanece únicamente en el checkpoint de origen, no en este repositorio.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y formato de mensajes con roles.
- Razonamiento matemático paso a paso: el prompt recomendado pide explicar el razonamiento y terminar con `\boxed{...}` o con una linea final `Final answer: ...`.
- Resolución de problemas de competición de distinta dificultad (AIME, AMC, MATH500, Minerva, OlympiadBench), con tasas de acierto bajas pero no nulas en las pruebas más duras.
- Capacidades multilingües limitadas a inglés y chino.
- Compatibilidad con motores de servicio que respetan `generation_config.json` para detener la generación en los IDs 151645 (`<|im_end|>`) y 151643 (`<|endoftext|>`).
- No hay evidencia en la informacion proporcionada de soporte de *tool calling*, *function calling*, uso como agente, razonamiento multi-paso con herramientas, vision, audio ni un modo de "pensamiento" diferenciado más allá del razonamiento en texto plano inducido por el prompt.
- No se documenta un preset de decodificación especulativa ni ninguna técnica de aceleración propia.

## Casos de uso

- Investigación en RL para LLM: reproducir o comparar el efecto de distintos topes de staleness en GRPO partiendo de este checkpoint de tope 4, con la ventaja de que la configuración de entrenamiento y el manifiesto de exportación son públicos.
- Estudio de estabilidad de políticas: analizar por qué la precisión muestreada a temperatura 0,6 es inferior a la greedy en varios conjuntos (por ejemplo, AIME24 con 10,00 % greedy frente a 3,75 % muestreado), usando este modelo como caso concreto de política poco robusta a muestreo.
- Generación de soluciones matemáticas con formato estructurado: integrar el modelo en un pipeline que extraiga la respuesta de `\boxed{}` o de la linea `Final answer:` para autocorregir ejercicios en un entorno educativo controlado y con revisión humana.
- Punto de partida para *fine-tuning* posterior: al ser un ajuste denso de parámetros completos sobre Qwen2.5-3B, sirve como inicialización para experimentos de RL adicionales o de SFT en dominios matemáticos, siempre que se respete la licencia del modelo base.
- Evaluación de infraestructura de serving: validar motores (transformers, TGI, vLLM) con un modelo de 3B que requiere gestión explícita de dos IDs de parada y ventanas de hasta 4.096 tokens.
- Docencia y formación técnica: usar el checkpoint y su tabla de resultados para explicar la diferencia entre precisión greedy y precisión media muestreada, el truncamiento de generaciones y el impacto del filtrado de datos de entrenamiento contra los conjuntos de evaluación.
- Análisis de contaminación de datos: la propia ficha indica que el conjunto de entrenamiento se filtró contra las evaluaciones y que no se puede descartar contaminación de preentrenamiento, lo que convierte al modelo en un caso de estudio para metodologías de detección de *leakage*.

## Benchmarks y rendimiento

Resultados de las evaluaciones finales del run de entrenamiento (política final, paso 1.000). Las filas greedy usan una completion por pregunta; las filas "sampled" usan ocho completions por pregunta a temperatura 0,6 y reportan precisión media de respuesta, no pass@8. MATH500, AMC y AIME usan 3.072 tokens de salida; Minerva y OlympiadBench usan 2.048. Los nueve conjuntos registran cero errores de evaluación. Son resultados del run de entrenamiento, no de una evaluación independiente del artefacto exportado ni una comparación a 8K.

| Benchmark | Completions | Precision | Truncado |
|---|---:|---:|---:|
| aime24-pass1 | 30 | 10,00 % | 10,00 % |
| aime24-sampled | 240 | 3,75 % | 9,17 % |
| aime25-pass1 | 30 | 0,00 % | 6,67 % |
| aime25-sampled | 240 | 2,50 % | 2,50 % |
| aime26-sampled | 240 | 2,50 % | 4,58 % |
| amc23-pass1 | 40 | 37,50 % | 5,00 % |
| math500-pass1 | 500 | 64,40 % | 3,40 % |
| minerva-pass1 | 272 | 25,00 % | 4,41 % |
| olympiadbench-pass1 | 675 | 27,26 % | 9,78 % |

No se proporcionan resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 6,2 GB solo para pesos (3,086 mil millones de parámetros a 2 bytes), más el cache KV y el overhead del runtime. En la practica, entre 8 GB y 12 GB de VRAM para contextos de 4.096 tokens.
- VRAM en otros dtypes: en float32 los pesos ocuparían unos 12,3 GB; en cuantizacion de 4 bits (no publicada, habría que generarla) se situaría en torno a 2 GB.
- GPU consumer: cabe en tarjetas con 12 GB o más, como RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB es posible con cuantizacion o con contexto reducido, pero no está validado por el autor.
- GPU de datacenter: A100, H100 o L40S sin problema de capacidad; útiles si se busca throughput alto con batching.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (el modelo lleva el tag `text-generation-inference`) y cualquier motor compatible con `endpoints_compatible`. vLLM, SGLang, llama.cpp u Ollama no están verificados en la informacion proporcionada y requerirían conversión de formato para los motores basados en GGUF.
- Consideracion de parada: el modelo debe detener la generación en los IDs 151645 y 151643. Si el motor de servicio ignora `generation_config.json`, hay que fijar esos IDs de forma explícita.
- Latencia y throughput: no disponible.
- Estado del optimizador: no se incluye en el repositorio, de modo que el hardware necesario para reanudar el entrenamiento desde este artefacto es mayor que el de inferencia (pesos más estados de AdamW).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| zbeeb/Qwen2.5-3B-GRPO-Staleness-4 | 3.085.938.688 | 4.096 tokens en entrenamiento; extension a 8K no validada | qwen-research | HuggingFace, safetensors | Tabla de 9 conjuntos en la ficha (MATH500 64,40 % greedy) |
| Qwen/Qwen2.5-3B (base) | Mismo orden de magnitud (modelo base del anterior) | No disponible en la informacion proporcionada | qwen-research | HuggingFace | No disponible en la informacion proporcionada |
| Qwen2.5-3B-Instruct | No disponible en la informacion proporcionada | No disponible | qwen-research | HuggingFace | No disponible en la informacion proporcionada |
| Qwen2.5-Math-1.5B | No disponible en la informacion proporcionada | No disponible | qwen-research | HuggingFace | No disponible; la ficha advierte que usa una familia distinta (Qwen2.5-Math) y que las diferencias no son atribuibles solo al tamano |

La model card menciona explícitamente que la comparación entre 3B y 1.5B no es limpia porque el 1.5B parte de Qwen2.5-Math mientras que el 3B usa Qwen2.5 general. No se aportan resultados de modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento matemático bajo en competición: 0,00 % en AIME25 pass1 y 2,50 % en AIME25 y AIME26 muestreados. No es un modelo apto para resolver problemas de nivel olímpico sin verificación externa.
- Degradación con muestreo: en AIME24, la precisión greedy (10,00 %) supera ampliamente la media de ocho completions a temperatura 0,6 (3,75 %), lo que indica alta varianza en la política.
- Truncamiento relevante: 10,00 % en aime24-pass1 y 9,78 % en olympiadbench-pass1, es decir, una fracción notable de generaciones no termina dentro del presupuesto de tokens.
- Las evaluaciones corresponden al run de entrenamiento, no a una evaluación limpia del artefacto exportado, y no hay validación a 8K de contexto.
- Contaminación: el dataset de entrenamiento se filtró contra los conjuntos de evaluación, pero la ficha reconoce que esto no demuestra la ausencia de contaminación de preentrenamiento ni de todos los casi duplicados.
- No se documenta ninguna evaluación de sesgos, toxicidad o alucinación. El riesgo de alucinación en pasos intermedios del razonamiento es plausible y no está cuantificado.
- Idiomas limitados a inglés y chino; no hay evidencia de soporte fiable en castellano o en otras lenguas.
- Licencia `qwen-research`: es una licencia de investigación con condiciones específicas sobre el modelo base Qwen2.5-3B. Antes de cualquier uso comercial hay que revisar el archivo LICENSE incluido y los términos de Qwen; este checkpoint es una modificación GRPO de la revisión base citada.
- Reproducibilidad parcial: la topología de GPUs varía entre brazos del experimento, por lo que las comparaciones entre topes de staleness no son ablaciones puras.
- Estado del optimizador no incluido: no se puede reanudar el entrenamiento exactamente desde este repositorio.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Configuración de parada: si el motor de inferencia ignora `generation_config.json`, es imprescindible fijar manualmente los IDs de parada 151645 y 151643 para evitar generaciones desbordadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-3B-GRPO-Staleness-4
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
- Configuracion de entrenamiento (dentro del repositorio): `training-config.json`
- Manifiesto de exportacion (dentro del repositorio): `export-manifest.json`
- Resultados de evaluacion legibles por maquina (dentro del repositorio): `evaluation-results.json`
- Licencia del modelo base (incluida sin cambios): `LICENSE`
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados correspondian a contenido no relacionado (Google Maps) y se han descartado por no aportar informacion verificable.
