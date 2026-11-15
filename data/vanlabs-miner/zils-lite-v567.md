# vanlabs-miner/zils-lite-v567

## Resumen

zils-lite-v567 es un modelo de decisión de tipo "soup-pool" publicado por vanlabs-miner sobre el chasis d3-lite (z3-lite) del proyecto Zils. Se construye a partir de Qwen/Qwen3.5-0.8B mediante ajuste fino supervisado de los pesos del lenguaje y un promediado de pesos (model soup) de tres ejecuciones independientes. El resultado es un checkpoint de 852.985.920 parámetros en BF16 que hereda la arquitectura transformer densa del modelo base y su ventana de contexto, pero especializado en tareas de decisión con formato de examen Zils.

El modelo no se presenta como un asistente generalista, sino como un componente de decisión: recibe elementos en el formato de examen Zils y produce decisiones conforme a las etiquetas doradas de los splits públicos de entrenamiento. Su relevancia actual es acotada pero concreta: ofrece un punto de partida reproducible y con licencia Apache-2.0 para experimentar con técnicas de model soup y ajuste fino con anclaje KL sobre un modelo pequeño, sin dependencia de datos generados por modelos cerrados.

La información publicada es escasa: no hay pipeline declarado, no se listan idiomas soportados y no se han publicado resultados de benchmarks. Todo lo que sigue se limita a lo que consta en la model card, las etiquetas del repositorio y los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-0.8B: un transformer denso de aproximadamente 0,85 mil millones de parámetros. El autor no documenta cambios estructurales; el trabajo se concentra en los pesos del lenguaje y en el procedimiento de combinación. El checkpoint se distribuye en BF16 dentro de un repositorio de 1,7 GB.

El entrenamiento parte del "d3-lite soup" del 14 de noviembre de 2026, definido como la media uniforme de VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc. Sobre ese punto de partida se ejecutan tres ajustes finos completos de los pesos del lenguaje con learning rate 1,5e-6 y semillas distintas, sobre aproximadamente 513.000 ítems de decisión en formato de examen Zils, construidos únicamente a partir de splits TRAIN públicos con etiquetas doradas. La función de pérdida es entropía cruzada suave con un anclaje KL de peso 1,0 respecto al modelo de partida. El cuerpo final es el modelo inicial más 0,6 veces el cambio medio de los tres ajustes finos. El autor declara que no se usaron ítems escritos ni etiquetados por modelos cerrados, ni semillas de examen, ni splits de validación o test durante el entrenamiento.

## Capacidades

- Tareas de decisión en el formato de examen Zils: el modelo está especializado en emitir decisiones sobre ítems con ese formato, no en diálogo abierto.
- Generación de texto y razonamiento heredados del modelo base Qwen3.5-0.8B, sin garantías de calidad tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información publicada.

## Casos de uso

- Evaluación de pipelines de decisión: el modelo sirve para reproducir el flujo de examen Zils de extremo a extremo y medir la concordancia con etiquetas doradas en un entorno controlado, dado que fue entrenado con ese formato exacto.
- Investigación sobre model soups: al estar construido como media de tres ajustes finos con anclaje KL, es un caso de estudio directo para analizar la estabilidad del promediado de pesos en modelos de menos de mil millones de parámetros.
- Ajuste fino posterior con recursos limitados: sus 852.985.920 parámetros en BF16 permiten reentrenar o adaptar el modelo en una única GPU de gama alta de consumo, lo que facilita experimentos con LoRA o ajuste completo a bajo coste.
- Clasificación y enrutamiento interno: puede integrarse como componente de decisión en un sistema mayor que preprocese entradas al formato Zils, siempre que se valide su comportamiento fuera del dominio de entrenamiento.
- Reproducibilidad de experimentos: el procedimiento documentado (tres semillas, lr 1,5e-6, anclaje KL 1,0, factor 0,6) permite replicar la receta sobre otros checkpoints de la familia Zils.
- Base para comparativas de modelos pequeños: útil como referencia en estudios que comparen modelos de 0,8B especializados frente a modelos generalistas del mismo tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,7 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB. Los tipos de cuantización no están documentados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. Cabe en GPU de consumo.
- Opciones de despliegue: transformers (formato nativo del repositorio). vLLM, llama.cpp, Ollama y TGI no están confirmados en la información publicada; requerirían conversión a GGUF o verificación de compatibilidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| zils-lite-v567 | 852.985.920 | no disponible | Apache-2.0 | Decisión, formato Zils |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible en la información | Modelo generalista |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | no disponible | Componente del soup Zils |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | no disponible | Componente del soup Zils |

No se dispone de datos de rendimiento comparativo entre estas alternativas; la comparación se limita a linaje y licencia.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para el formato de examen Zils; su comportamiento fuera de ese formato no está documentado y probablemente degrade.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no debería desplegarse en producción sin una evaluación propia.
- Riesgo de alucinación: no evaluado en la información disponible; al derivar de un modelo de lenguaje de 0,8B, es esperable en tareas generativas abiertas.
- Idiomas no declarados: no se puede asumir soporte multilingüe más allá del que herede el modelo base.
- Contexto no declarado: la ventana efectiva no consta en la model card; debe verificarse en la configuración del repositorio antes de usarla en conversaciones largas.
- Sesgos: no documentados; los datos de entrenamiento provienen de splits TRAIN públicos cuyas características y sesgos no se detallan.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también la licencia del modelo base Qwen3.5-0.8B antes de un despliegue comercial.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay historial de uso ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/vanlabs-miner/zils-lite-v567
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Componente del soup: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
