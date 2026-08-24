# Tok331102/teutonic-II-110B-genesis

## Resumen

Teutonic-II 110B Genesis es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con aproximadamente 110 mil millones de parámetros totales y unos 7.300 millones de parámetros activos por token. Ha sido desarrollado por el equipo Teutonic dentro del ecosistema Bittensor Subnet 3, una red descentralizada de entrenamiento de modelos de IA. El checkpoint Genesis se distribuye con pesos inicializados aleatoriamente y no ha pasado por ninguna fase de preentrenamiento, por lo que sirve como punto de partida limpio para entrenamiento continuado o para participar en el esquema de mejora descentralizada de Teutonic.

La arquitectura se basa en un diseño estilo MiMoV2 modificado, que combina capas MoE dispersas con atención híbrida global y de ventana deslizante, Grouped Query Attention, dimensiones asimétricas QK/V, RoPE parcial y mecanismos de attention sink. Además, Teutonic introduce una modificación propia en la implementación del MoE que permite compartir expertos entre tokens. El modelo declara una longitud de contexto configurada de hasta 1.048.576 posiciones, aunque esta cifra es un valor arquitectónico y no implica que el checkpoint haya sido entrenado o validado a esa longitud.

La relevancia de este lanzamiento radica en su escala: es un 50% más grande que cualquier corrida de entrenamiento descentralizado previa y supone un escalado de 10 veces respecto al modelo anterior del equipo. Al tratarse de un checkpoint sin entrenar, su valor actual es principalmente como infraestructura para investigación y experimentación en entrenamiento distribuido y colaborativo, más que como modelo listo para uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `MiMoV2ForCausalLM` (estilo MiMoV2 modificado) |
| Parametros totales | 110.280.865.472 (~110B) |
| Parametros activos | ~7.3B por token (8 de 256 expertos enrutados + 1 compartido) |
| Longitud de contexto | Configurado: 1.048.576 posiciones (no validado en entrenamiento) |
| Tipos de cuantizacion | No disponible (checkpoint en BF16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repo de 220.6 GB) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer causal con capas MoE dispersas. En cada capa MoE hay 256 expertos enrutados, de los cuales se seleccionan 8 por token mediante una función de puntuación sigmoide y selección top-k con método `noaux_tc`. Además, cada capa incluye un experto compartido adicional. La modificación de Teutonic permite el intercambio de expertos entre tokens, una innovación que busca mejorar la eficiencia de cómputo y la especialización de los expertos.

La atención es híbrida: 9 de las 45 capas usan atención global completa, mientras que las 36 restantes emplean atención de ventana deslizante con un tamaño de ventana de 128 tokens. Se utiliza Grouped Query Attention con 48 cabezas de consulta y 4 cabezas clave/valor. Las dimensiones de las cabezas son asimétricas: 192 para Q/K y 128 para V. Se aplica RoPE parcialmente (factor 0.334) con thetas diferentes: 10.000.000 para atención global y 10.000 para la ventana deslizante. También se habilita un sesgo de attention sink en las capas de ventana deslizante.

El checkpoint Genesis no ha sido preentrenado: los pesos son aleatorios. No se dispone de información sobre el dataset, el número de tokens de entrenamiento ni el uso de técnicas como RLHF o DPO. El entrenamiento está diseñado para realizarse de forma descentralizada a través de Bittensor Subnet 3, donde los participantes compiten por mejorar el modelo en un esquema de "king-of-the-hill".

## Capacidades

- El checkpoint actual no tiene capacidades funcionales: al no haber sido preentrenado, no puede generar texto coherente ni realizar tareas de razonamiento, código o matemáticas.
- La arquitectura está diseñada para generación de texto causal (text-generation), con soporte para contextos largos gracias a la atención híbrida y la ventana deslizante.
- El diseño MoE con 8 expertos activos por token permite un cómputo eficiente en inferencia, aunque esto solo será relevante una vez que el modelo sea entrenado.
- No se ha documentado soporte para tool calling, function calling, agentes o capacidades multimodales.
- No se especifican idiomas soportados; al no haber entrenamiento, no hay capacidades multilingües demostradas.

## Casos de uso

- Entrenamiento continuado descentralizado: el checkpoint Genesis es el punto de partida para que participantes de Bittensor SN3 realicen preentrenamiento o fine-tuning colaborativo, compitiendo por mejorar el modelo.
- Investigación en arquitecturas MoE eficientes: permite estudiar el impacto del expert sharing, la atención híbrida y el enrutamiento top-k sin sesgos de preentrenamiento previo.
- Desarrollo de algoritmos de entrenamiento distribuido: al ser un modelo de 110B con solo 7.3B activos, sirve como banco de pruebas para técnicas de paralelismo, comunicación y optimización en entornos descentralizados.
- Evaluación de estrategias de inicialización y warm-start: los pesos aleatorios permiten aislar el efecto de diferentes esquemas de inicialización en el rendimiento final.
- Benchmarking de infraestructura de entrenamiento: el tamaño del modelo (220 GB en BF16) permite medir el rendimiento de clústeres GPU y sistemas de almacenamiento distribuido.
- No es apto para aplicaciones de producción, atención al cliente, generación de código u otros usos finales hasta que sea entrenado adecuadamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un checkpoint sin entrenar, cualquier métrica de rendimiento (MMLU, HumanEval, GSM8K, etc.) carecería de sentido.

## Requisitos de hardware

- El checkpoint en BF16 ocupa aproximadamente 220 GB en disco (110.280.865.472 parámetros × 2 bytes). Para cargar los pesos completos en memoria se necesitan al menos 220 GB de VRAM, lo que exige múltiples GPUs de alta gama (por ejemplo, 8 × H100 de 80 GB o 4 × A100 de 80 GB con paralelismo de modelo).
- No se han publicado cuantizaciones (GGUF, AWQ, GPTQ, etc.), por lo que no es posible reducir la huella de memoria mediante formatos de menor precisión.
- Dado que el modelo no está entrenado, no tiene sentido hablar de latencia o throughput de inferencia. Una vez entrenado, la inferencia con 7.3B parámetros activos podría ejecutarse en GPUs de consumo como una RTX 4090 (24 GB) si se aplicara cuantización, pero esto no está disponible actualmente.
- Para entrenamiento o fine-tuning, se recomienda un clúster con GPUs A100 o H100, interconexión de alta velocidad (NVLink o InfiniBand) y almacenamiento distribuido capaz de manejar los 220 GB del checkpoint.
- Opciones de despliegue como vLLM, llama.cpp, Ollama o TGI no son aplicables en el estado actual, ya que el modelo no produce salidas útiles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. Existe otro checkpoint del mismo proyecto, `dendriteholdings/teutonic-II-110B-A7B-5ev3rrdend-cl0`, que parece ser una iteración posterior, pero no se han publicado sus características. Tampoco se pueden comparar métricas con modelos MoE establecidos como Mixtral 8x7B o DeepSeek-V2, ya que este checkpoint no ha sido evaluado. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint Genesis no ha sido preentrenado: no genera texto coherente y cualquier uso en producción es imposible.
- No se especifica licencia, lo que genera incertidumbre sobre los términos de uso comercial y redistribución.
- No hay información sobre el dataset de entrenamiento, los idiomas cubiertos ni los posibles sesgos. Al no haber entrenamiento, no se pueden evaluar sesgos ni riesgos de alucinación.
- La longitud de contexto declarada de 1M tokens es un valor de configuración, no una capacidad validada. No hay evidencia de que el modelo pueda manejar secuencias tan largas tras un eventual entrenamiento.
- El entrenamiento descentralizado en Bittensor SN3 implica que la calidad final del modelo dependerá de la participación de la comunidad; no hay garantías de convergencia ni de rendimiento.
- El tamaño del repo (220 GB) y la ausencia de cuantizaciones limitan su uso a entornos con recursos de hardware muy elevados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tok331102/teutonic-II-110B-genesis
- Sitio web de Teutonic: https://teutonic.ai/
- Anuncio en X (primera parte): https://x.com/const_reborn/status/2091896289302642949
- Anuncio en X (segunda parte): https://x.com/const_reborn/status/2091896293970821317
- Checkpoint relacionado: https://huggingface.co/dendriteholdings/teutonic-II-110B-A7B-5ev3rrdend-cl0
