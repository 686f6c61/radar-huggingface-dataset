# vosldtgbj/project-llm-rlvr-dynamic-v2-step-50

## Resumen

`vosldtgbj/project-llm-rlvr-dynamic-v2-step-50` es un checkpoint intermedio de pesos completos publicado dentro de una trayectoria de aprendizaje por refuerzo con recompensas verificables (RLVR). No es un modelo nuevo desde cero: se trata de un ajuste fino del modelo `google/gemma-4-12B-it`, que arranca del checkpoint `project-llm-rlvr-dynamic-v2-step-25` y corresponde al paso 50 del run v2 (paso acumulado 175 de toda la trayectoria RLVR). Lo publica el usuario `vosldtgbj` como parte de una serie de 11 puntos de guardado separados por 25 actualizaciones de optimizador.

El entrenamiento se ha hecho exclusivamente sobre texto, con GRPO síncrono, 16 rollouts por pregunta y 30 grupos de prompts válidos por actualización (480 rollouts por paso). La torre de visión, la torre de audio y las proyecciones multimodales del modelo original permanecen congeladas, de modo que, pese a la etiqueta `any-to-any` y `image-text-to-text` del repositorio, las mejoras de esta fase se concentran en el modelo de lenguaje.

Su relevancia es metodológica: la model card es explícita en que el checkpoint no tiene una puntuación de validación independiente y que los valores de recompensa de los registros de entrenamiento no sirven para ordenar checkpoints entre sí. Para evaluarlo correctamente hay que ejecutar una misma evaluación congelada sobre los 11 puntos de guardado con parámetros de inferencia idénticos. El repo contiene únicamente safetensors en BF16, sin estado de optimizador, por lo que sirve para inferencia y como inicialización de nuevos entrenamientos, pero no para reanudar el job original de forma exacta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `Gemma4UnifiedForConditionalGeneration` (`model_type`: `gemma4_unified`), transformer denso con componentes multimodales asociados |
| Parámetros totales | 11.959.730.224 según el contaje real de safetensors; la model card del autor declara 12.484.280.320 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el pipeline de RLVR usa 8.192 tokens de entrada, 2.048 de generación y 10.240 de total |
| Tipos de cuantización | no disponible; la exportación oficial es BF16 y el repositorio solo contiene safetensors sin cuantizar |
| Idiomas soportados | japonés (ja) e inglés (en), según los metadatos del repositorio y la composición de datos de SFT y RLVR |
| Licencia | `gemma` (Gemma 4 License, https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors BF16, 5 shards más `model.safetensors.index.json`; aproximadamente 23,92 GB decimales (unos 22,3 GiB) |
| Capas de texto | 48 |
| Hidden size de texto | 3.840 |
| Tamaño de vocabulario | 262.144 |
| Pipeline declarado | `any-to-any` |
| Modelo base | `vosldtgbj/project-llm-rlvr-dynamic-v2-step-25`, que a su vez deriva de `google/gemma-4-12B-it` |
| Paso de RLVR | 50 local (175 acumulado) |

## Arquitectura y entrenamiento

La base es un transformer denso de 48 capas, hidden size 3.840 y vocabulario de 262.144 entradas, instanciado como `Gemma4UnifiedForConditionalGeneration`. El repositorio incluye configuración, generation config, tokenizer, processor y chat template. Los experimentos documentados en la card (45 repositorios en total) comparten esta misma estructura y solo difieren en los valores de los parámetros tras el entrenamiento. Es importante señalar que las torres de visión y audio y los proyectores multimodales no se entrenan: permanecen congelados, y la variación de parámetros se concentra en el modelo de lenguaje.

La cadena de entrenamiento es larga y está documentada con detalle. Partiendo de `google/gemma-4-12B-it` se ejecutaron dos rondas de preentrenamiento continuado (CPT), después SFT v3 sobre la vista congelada `official_90_10` (67.195 registros de entrenamiento y 4.083.167 tokens supervisados de asistente, empaquetados en 5.824 packs de longitud 8.192 con eficiencia de packing de 0,9240) y finalmente RLVR. La fase v1 recorrió los pasos 25 a 125 sobre los pesos de SFT `L2 h2p0`; la fase v2, aquí descrita, arranca de v1 step 125 con un learning rate de 5e-7, nuevo warmup y un punto de vista distinto sobre los datos restantes. El algoritmo es GRPO síncrono con 30 grupos de prompts efectivos por paso, 16 rollouts por prompt (480 rollouts por actualización), hasta 5 turnos de interacción, temperature 0,7 y top-p 1,0, clip del ratio PPO entre 0,2 y 0,28, ratio de importance sampling truncado de 2,0 y sin penalización KL contra la política de referencia. Se usó FusedAdam de Transformer Engine con weight decay 0,1 y max grad norm 1,0, y checkpoints cada 25 pasos con validación cada 50.

Los datos de RLVR proceden de `SF-RLVR-Unified-v2` (37.500 tareas: 30.000 de dominio proyecto y 7.500 generales, repartidas en 15 familias verificables). Las tareas de dominio se construyeron a partir de 104 libros blancos públicos en japonés, con prompt visible, referencia estructurada oculta, `verifier_id` y `reward_contract_id`. Las recompensas se asignan mediante verificadores deterministas o ejecución en entorno y, solo en parte de los contratos, mediante un juez Nemotron 3 Ultra desplegado en un nodo aparte. No se realiza búsqueda en internet durante el entrenamiento. El guardado no incluye estado de optimizador, scheduler, RNG, cursor de dataloader ni shards de FSDP/DTensor, por lo que no permite reanudación bit a bit.

## Capacidades

- Generación de texto y razonamiento multi-turno en japonés e inglés, con hasta 5 turnos de interacción en el pipeline de RLVR.
- Respuesta con fundamento documental sobre corpus en japonés: preguntas de documento único, razonamiento sobre múltiples documentos y resolución de conflictos de fuente o de versión temporal.
- Abstención y aclaración: familias de tareas de `abstention` y `QA abstention` entrenadas explícitamente para no responder cuando falta información.
- Salida estructurada: familias de `structured output` y cumplimiento de esquemas, tanto en el dominio proyecto como en el bloque general.
- Tool calling y trayectorias de herramienta: familias de `normal tool trajectory` y `tool failure recovery`, además de las tareas generales de agent/tool del bloque SFT.
- Código: familia de `competitive coding` en el bloque general y datos de code dentro del SFT v3.
- Matemáticas: familias de `open math`, `arithmetic` y `ReasoningGym`.
- Seguridad y límites de permisos: familia de prompt injection y de fronteras de autorización.
- Capacidades multimodales: el modelo declara pipeline `any-to-any` e `image-text-to-text` por herencia de la arquitectura base, pero las torres de visión y audio y los proyectores están congelados y no se han entrenado en esta fase; el alcance real de estas capacidades no está documentado en la información disponible.
- Modo de pensamiento o decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente en japonés sobre documentación corporativa: el modelo está entrenado con preguntas de documento único y multi-documento sobre libros blancos japoneses reales, de modo que puede responder citando la fuente y abstenerse cuando el dato no aparece en el contexto.
- Asistente interno de consulta normativa: las familias de conflicto de fuente y de versión temporal permiten resolver discrepancias entre documentos de fechas distintas, un escenario habitual en normativa y procedimientos que se actualizan.
- Agente con herramientas en flujos de trabajo: las trayectorias normales y de recuperación ante fallo de herramienta permiten construir agentes que reintentan o cambian de herramienta cuando una llamada falla, con hasta 5 turnos de interacción.
- Extracción de datos con esquema fijo: la familia de salida estructurada lo hace adecuado para pipelines que necesitan JSON u otro formato validable a partir de texto libre, con verificación determinista del resultado.
- Moderación y defensa frente a inyección de prompts: la familia de prompt injection y de fronteras de permisos permite usarlo como capa de filtrado o clasificación de instrucciones maliciosas embebidas en documentos.
- Asistencia a programación: con la familia de programación competitiva y los datos de código del SFT v3, puede emplearse para generar y revisar fragmentos de código, así como para tareas de CI/CD donde la salida deba validarse con tests.
- Tutoría de matemáticas y razonamiento: las familias de matemáticas abiertas, aritmética y ReasoningGym lo hacen apto para resolver problemas paso a paso con comprobación numérica automática.
- Punto de partida para investigación en RLVR: al ser un guardado intermedio en BF16 sin estado de optimizador, es útil como inicialización de nuevos runs o como sujeto de evaluaciones comparativas entre los 11 checkpoints de la serie.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que este checkpoint no tiene una puntuación de validación independiente y que las recompensas registradas durante el entrenamiento son señales en línea sobre los datos muestreados, influidas por la dificultad de las tareas, el dynamic sampling y la política, por lo que no permiten comparar checkpoints entre sí. La comparación válida exige ejecutar una misma evaluación congelada con idénticos parámetros de inferencia sobre los 11 puntos de guardado. El conjunto de validación bloqueado del proyecto es de 4.700 tareas, con un núcleo de validación congelado de 470, pero no se publican sus resultados para este repositorio.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 23,92 GB, de modo que la inferencia en BF16 requiere del orden de 24 GB solo para pesos, más caché KV y activaciones; en la práctica por encima de 24 GB de VRAM total.
- Cuantización a 8 bits: en torno a 12-13 GB de pesos, estimación habitual para un modelo de 12B, aunque el repositorio no publica pesos cuantizados.
- Cuantización a 4 bits: en torno a 7-8 GB de pesos, igualmente como estimación; no hay GGUF ni AWQ oficiales en la información proporcionada.
- GPU de referencia del proyecto: 16 GPU H100 SXM repartidas en dos nodos (`hgpn117` y `hgpn126`) para el entrenamiento, con backend de rollout vLLM en tensor parallel size 2.
- GPU profesionales recomendadas para servicio: H100, A100 80 GB o A100 40 GB en BF16, con varias GPU si se necesita paralelismo por tensor.
- GPU de consumo: una RTX 4090 de 24 GB queda muy justa en BF16 y probablemente exija offload o cuantización; con cuantización de 4 u 8 bits cabe en tarjetas de 12-24 GB.
- Opciones de despliegue: vLLM es el backend documentado en la fase de rollout y por tanto el más directamente soportado; `transformers` puede cargar el modelo con los safetensors incluidos. Soporte de llama.cpp, Ollama o TGI para estos pesos: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles; no se publican cifras de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vosldtgbj/project-llm-rlvr-dynamic-v2-step-50` (este) | 11.959.730.224 según safetensors; 12.484.280.320 según el autor | no disponible (pipeline RLVR de 8.192 de entrada / 2.048 de generación) | sin benchmarks publicados | Gemma 4 | safetensors BF16, 23,92 GB |
| `vosldtgbj/project-llm-rlvr-dynamic-v2-step-25` (padre directo) | heredado de la misma arquitectura | no disponible | sin benchmarks publicados | Gemma 4 | safetensors BF16 |
| `vosldtgbj/project-llm-rlvr-dynamic-v2-step-75` (siguiente guardado) | heredado de la misma arquitectura | no disponible | sin benchmarks publicados | Gemma 4 | safetensors BF16 |
| `google/gemma-4-12B-it` (base original) | no disponible en la información proporcionada | no disponible | no disponible | Gemma 4 | pesos oficiales de Google |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas de otros fabricantes en la información proporcionada, por lo que la comparación se limita a los checkpoints de la propia serie, que comparten arquitectura y solo difieren en la fase de entrenamiento y en los valores de los parámetros.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible afirmar que este checkpoint sea mejor que su padre `step-25` ni que el siguiente `step-75` sin una evaluación congelada propia.
- Las recompensas del registro de entrenamiento no son una métrica de calidad: están sesgadas por la dificultad de las tareas, el dynamic sampling y la política vigente en cada momento.
- Riesgo de alucinación: aunque hay familias de abstención, el modelo puede generar contenido plausible no respaldado por el contexto, especialmente fuera del dominio documental japonés.
- Cobertura de idiomas limitada a japonés e inglés; el comportamiento en otras lenguas no está documentado y probablemente degrade.
- Las capacidades de visión y audio permanecen congeladas y sin entrenar en esta fase, pese a las etiquetas `any-to-any` e `image-text-to-text` del repositorio. No debe asumirse un rendimiento multimodal ajustado.
- Licencia `gemma`: el uso comercial y la redistribución están sujetos a los términos de la Gemma 4 License, que incluyen obligaciones de uso aceptable. Es imprescindible revisarla antes de cualquier despliegue en producción.
- No hay estado de optimizador, scheduler, RNG ni shards de FSDP/DTensor: no es posible reanudar el entrenamiento original de forma bit a bit.
- El checkpoint no incluye cuantizaciones oficiales; cualquier GGUF, AWQ o GPTQ sería una conversión de terceros con pérdida de calidad no medida.
- El proyecto no realiza búsqueda en internet durante el entrenamiento, así que el modelo no está optimizado para tareas que requieran información en línea.
- Fecha de creación declarada en el repositorio (2026-10-08) y descendencia de un modelo base `gemma-4-12B-it`: conviene verificar la vigencia y disponibilidad del modelo base antes de integrarlo en un pipeline.
- 0 descargas y 0 likes en el momento de la consulta: no existe validación comunitaria ni informes independientes de comportamiento en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-50
- Modelo padre directo (v2 step 25): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-25
- Siguiente guardado público (v2 step 75): https://huggingface.co/vosldtgbj/project-llm-rlvr-dynamic-v2-step-75
- Modelo base original: https://huggingface.co/google/gemma-4-12B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de SFT v3: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-sft-citation-optimized-v3
- Dataset RLVR unificado v2: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-unified-v2-37500
- Dataset de dominio RLVR v1: https://huggingface.co/datasets/vosldtgbj/project-llm-dataset-rlvr-domain-v1
