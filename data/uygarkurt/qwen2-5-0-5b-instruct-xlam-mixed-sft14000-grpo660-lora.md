# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-grpo660-lora

## Resumen

Este repositorio contiene un adaptador LoRA para Qwen2.5-0.5B-Instruct, entrenado por el autor independiente uygarkurt con su propio framework Post-Training Lab. El objetivo es acotado y explícito: enseñar a un modelo de 0,5 mil millones de parámetros a emitir llamadas a herramientas con estructura correcta y a abstenerse cuando el conjunto de herramientas ofrecido no es relevante. No es un modelo de propósito general ni un chat assistant: es un artefacto de investigación sobre post-entrenamiento aplicado a tool calling.

El entrenamiento es en dos fases. Primero 14.000 actualizaciones de supervisión (SFT) sobre el dataset mixto uygarkurt/xlam-tool-calling-mixed, y después 660 actualizaciones de Group Relative Policy Optimization (GRPO) partiendo del adaptador SFT. El resultado es un adaptador PEFT que se carga encima del modelo base original: no requiere el adaptador SFT por separado ni contiene pesos completos.

Su relevancia ahora es metodológica más que de producto. Publica la curva completa de dos etapas con métricas de tool calling desagregadas (exactitud de llamada exacta, exactitud de nombre de función, subconjuntos de BFCL-v3) y tiempos de entrenamiento, lo que permite evaluar qué aporta realmente GRPO sobre SFT en un modelo pequeño. El dato incómodo está en la tabla: GRPO mejora ligeramente la precisión de llamada pero degrada la abstención ante herramientas irrelevantes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5; el repositorio contiene un adaptador LoRA (PEFT) sobre Qwen2.5-0.5B-Instruct |
| Parámetros totales | 0,5 B en el modelo base; número exacto de parámetros entrenables del adaptador: no disponible (tamaño del repo: 0.0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No declarada en la model card del adaptador; heredada del modelo base Qwen2.5-0.5B-Instruct, que declara 32.768 tokens según su propia documentación |
| Tipos de cuantización | No disponible. El adaptador se distribuye en safetensors sin cuantizar; cualquier cuantización (GGUF, AWQ, GPTQ) requiere fusionar previamente con el modelo base y no está documentada por el autor |
| Idiomas soportados | Inglés (campo `language: en` en la model card); el modelo base es multilingüe, pero el adaptador no declara ni evalúa otros idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); requiere `transformers` + `peft` para cargarse |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de aproximadamente 0,5 B de parámetros. El repositorio no redefine la arquitectura: solo añade matrices de bajo rango entrenadas sobre las capas del base. La model card no especifica el rango del LoRA, los módulos objetivo ni la proporción de parámetros entrenables.

El pipeline es SFT seguido de GRPO. La fase SFT ejecutó 14.000 actualizaciones durante 2,2 horas; la fase GRPO continuó ese adaptador durante 660 actualizaciones y 0,4 horas adicionales, sumando 2,6 horas de bucle de entrenamiento (excluyendo carga de modelo, preparación de datos y evaluación externa). Ambos stages usan el mismo dataset, uygarkurt/xlam-tool-calling-mixed, descrito como mixto de tool calling. No se documenta el número de tokens de entrenamiento, la composición del dataset, la función de recompensa de GRPO ni si hubo RLHF o DPO. La innovación declarada es la combinación SFT→GRPO orientada no solo a la corrección sintáctica de la llamada sino también a la abstención, si bien los resultados de esa segunda parte no acompañan (ver Limitaciones).

## Capacidades

- Generación de texto conversacional en inglés, con la calidad propia de un modelo de 0,5 B.
- Tool calling estructurado: emisión de llamadas con nombre de función y argumentos en formato JSON, objetivo principal del entrenamiento.
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente en la fase GRPO, con rendimiento medido del 59,36 % en el subconjunto de irrelevancia.
- Selección de función: 97,90 % de exactitud en nombre de función en el holdout calls-only de xLAM (2.287 ejemplos evaluados, 700 omitidos).
- Llamada exacta (nombre + argumentos correctos): 81,68 % en el mismo holdout.
- Integración en pipelines `transformers` + `peft` mediante `PeftModel.from_pretrained`.
- No se declaran capacidades de visión, audio, agentes multi-paso autónomos, ni modo de razonamiento extendido.

## Casos de uso

- Enrutamiento de herramientas en asistentes locales de bajo consumo: el adaptador cabe en cualquier GPU de consumo e incluso en CPU, por lo que sirve para decidir qué función invocar en un asistente doméstico o embebido antes de delegar la respuesta final a un modelo mayor.
- Extracción de argumentos estructurados en pipelines de datos: con un 97,90 % de exactitud en nombre de función, es viable para convertir texto libre en llamadas JSON dentro de un ETL, siempre que el conjunto de funciones sea cerrado y bien definido.
- Prefiltro de herramientas en arquitecturas de dos niveles: usar este modelo para descartar llamadas inviables y reservar el modelo grande para la ejecución, reduciendo coste por petición. Requiere validar el umbral de abstención, dado el 59,36 % de irrelevancia.
- Prototipado e investigación reproducible de post-entrenamiento: el autor publica el framework Post-Training Lab y las dos etapas con métricas, lo que permite replicar el pipeline SFT→GRPO en otros dominios con presupuesto de 2,6 horas de cómputo.
- Base para fine-tuning posterior en dominios concretos: al ser un adaptador LoRA sobre un base pequeño, se puede continuar el entrenamiento con datos propios de un catálogo de APIs específico sin reentrenar desde cero.
- Evaluación comparativa de técnicas de alineamiento: sirve como caso de estudio de cuándo GRPO aporta y cuándo degrada una capacidad (aquí, +0,35 puntos en exactitud de llamada frente a −7,04 puntos en irrelevancia).
- Docencia y demostraciones de function calling en entornos sin GPU: el tamaño permite ejecutar ejemplos en portátil o en CPU con cuantización tras fusionar el adaptador.

## Benchmarks y rendimiento

Resultados publicados por el autor, en porcentajes. La primera fila es el adaptador SFT que inicializa GRPO; la segunda es el adaptador final.

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT (inicial de GRPO) | SFT 14.000 | 38,04 | 18,40 | 29,02 | 81,33 | 97,68 | 56,19 | 83,33 | 66,40 | 2,2 |
| SFT + GRPO (este adaptador) | GRPO 660 | 37,97 | 18,40 | 28,47 | 81,68 | 97,90 | 56,91 | 83,33 | 59,36 | 2,6 |

Notas metodológicas declaradas por el autor: xLAM ETC es exactitud de llamada exacta y xLAM FNA es exactitud de nombre de función; ambas se calculan sobre el holdout calls-only de xLAM (2.287 ejemplos evaluados, 700 omitidos), no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM emplean scripts propios del framework Post-Training Lab. Son agregados específicos del estudio, no directamente comparables con los números oficiales de cada benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, alrededor de 1 GB para pesos del modelo base fusionado con el adaptador; en int8, aproximadamente 0,6 GB; en int4, alrededor de 0,4 GB. Son estimaciones a partir de 0,5 B de parámetros, no cifras publicadas por el autor. Hay que sumar la caché KV, que crece con la longitud de contexto hasta los 32.768 tokens del base.
- GPU recomendadas: cualquier GPU con 4 GB o más. Una RTX 4090, A100 o H100 están sobradamente dimensionadas; el despliegue típico sería una T4, L4, RTX 3060 o incluso inferencia en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1650 4 GB en adelante) y también en CPU, con latencias más altas.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa del repositorio); fusión del adaptador (`merge_and_unload`) y conversión a GGUF para llama.cpp u Ollama; vLLM y TGI admiten adaptadores LoRA, aunque no hay configuración publicada para este adaptador concreto.
- Latencia y throughput: no disponibles. El autor solo publica tiempos de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | 0,5 B | 32.768 tokens (según su model card) | No especializado | Apache-2.0 (según la model card del base; no verificado en esta ficha) | HuggingFace |
| Este adaptador, etapa SFT | 0,5 B + LoRA | Heredado del base | Entrenado; ETC 81,33 %, FNA 97,68 %, irrelevancia 66,40 % | No disponible | HuggingFace |
| Este adaptador, SFT + GRPO | 0,5 B + LoRA | Heredado del base | Entrenado; ETC 81,68 %, FNA 97,90 %, irrelevancia 59,36 % | No disponible | HuggingFace |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens (según su model card) | No especializado | Apache-2.0 (según su model card; no verificado aquí) | HuggingFace |

No se dispone de resultados de benchmarks de terceros para este adaptador, por lo que la comparación con alternativas de la misma categoría (xLAM-1B, Hammer, Hermes) no puede cuantificarse con los datos proporcionados. La comparación más fiable es interna: la tabla de la sección anterior mide el delta exacto entre SFT y SFT+GRPO.

## Limitaciones y advertencias

- La abstención empeora con GRPO: la métrica de irrelevancia cae de 66,40 % a 59,36 % (−7,04 puntos), justo la capacidad que la model card declara como objetivo del entrenamiento. En producción esto implica más llamadas a herramientas cuando no procede.
- Capacidad general baja: MMLU 37,97, MATH-500 18,40 e IFEval 28,47. El modelo no es apto para razonamiento, matemáticas ni instrucciones complejas; su valor está acotado al tool calling.
- IFEval también retrocede ligeramente con GRPO (29,02 → 28,47), lo que sugiere un cierto olvido catastrófico de instrucciones generales.
- Solo inglés declarado: no hay evaluación en castellano ni en otros idiomas, aunque el base sea multilingüe.
- Licencia no disponible: sin licencia explícita no se puede asumir permiso para uso comercial. Hay que contactar con el autor o asumir riesgo legal.
- Es un adaptador, no un modelo autónomo: requiere descargar Qwen2.5-0.5B-Instruct y cargarlo con `peft`. El tamaño de repo de 0.0 GB indica que solo contiene pesos de adaptador.
- Métricas no comparables con los números oficiales de los benchmarks: BFCL y xLAM se evalúan sobre subconjuntos seleccionados con scripts propios, y el holdout de xLAM omite 700 ejemplos de 2.987.
- Riesgo de alucinación en nombres de función y argumentos fuera del catálogo visto en entrenamiento; el 97,90 % de FNA sobre el holdout no garantiza generalización a APIs nuevas.
- Sin datos de sesgos, sin evaluación de seguridad y sin resultados de inferencia (latencia, throughput). Para uso en producción sería necesario un conjunto de validación propio y una capa de validación de esquema JSON.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-grpo660-lora
- Adaptador SFT previo (punto de partida de GRPO): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Framework de post-entrenamiento (repositorio): https://github.com/uygarkurt/post-training-lab
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos del repositorio de HuggingFace. No se han localizado papers, blogs ni demos adicionales.
