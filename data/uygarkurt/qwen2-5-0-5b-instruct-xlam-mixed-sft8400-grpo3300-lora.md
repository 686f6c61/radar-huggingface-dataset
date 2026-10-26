# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo3300-lora

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) sobre Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario uygarkurt y entrenado con su propio framework Post-Training Lab. No es un modelo completo: son pesos de adaptador que deben cargarse sobre el modelo base original de Qwen. Su objetivo es especializar un modelo de 0,49 B de parámetros en tool calling estructurado, es decir, generar llamadas a funciones en formato correcto y, además, abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta.

El entrenamiento combina dos fases sobre el dataset uygarkurt/xlam-tool-calling-mixed: 8.400 actualizaciones de supervised fine-tuning (SFT) seguidas de 3.300 actualizaciones de Group Relative Policy Optimization (GRPO), la técnica de RL usada para alinear la política con recompensas verificables. El interés práctico está en que documenta el efecto medible de GRPO sobre un adaptador SFT ya existente: la precisión de llamada exacta (xLAM ETC) sube del 71,49 % al 79,49 % y la precisión de nombre de función del 86,88 % al 96,90 %, a costa de empeorar la detección de irrelevancia.

Es relevante ahora porque permite ejecutar un agente con tool calling en hardware mínimo (menos de 1 GB de pesos en fp16) y porque publica una comparativa SFT frente a SFT+GRPO con tiempos de entrenamiento (3,1 h en total), lo que lo convierte en una referencia útil para quien quiera reproducir un pipeline de post-entrenamiento en modelos pequeños. Sus métricas de conocimiento general y razonamiento son, sin embargo, muy bajas (MMLU 37,96 %, MATH-500 18,80 %).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (Qwen2.5-0.5B-Instruct); el adaptador no modifica la arquitectura, solo añade matrices de bajo rango |
| Parámetros totales | 0,49 B en el modelo base; el adaptador LoRA añade un número de parámetros no especificado en la model card (el repositorio declara 0,0 GB de tamaño) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; heredada del modelo base (Qwen documenta 32.768 tokens para Qwen2.5-0.5B-Instruct) |
| Tipos de cuantización | no disponible; solo se publican pesos de adaptador en safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (inglés), según el campo `language` de la model card |
| Licencia | no disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 según su documentación |
| Formato de pesos | safetensors, formato de adaptador PEFT/LoRA (`library_name: peft`); requiere cargar el modelo base por separado |

Otros datos del repositorio: pipeline `text-generation`, tags `lora`, `transformers`, `tool-calling`, `sft`, `grpo`; dataset de entrenamiento `uygarkurt/xlam-tool-calling-mixed`; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. Al ser un LoRA, no se retocan los pesos del base: se entrenan matrices de bajo rango sobre determinadas capas, cuyo rango, alpha y capas objetivo no se detallan en la model card. La inferencia se hace cargando el modelo base y superponiendo el adaptador; el adaptador SFT previo no es necesario por separado, ya que este checkpoint continúa su entrenamiento.

El entrenamiento consta de dos etapas sobre el dataset mixto de tool calling xLAM: 8.400 actualizaciones de SFT (1,3 h de bucle de entrenamiento) y 3.300 actualizaciones de GRPO (1,8 h), con un total de 3,1 h excluyendo carga de modelo, preparación de datos y evaluación externa. GRPO se usa aquí para reforzar dos comportamientos: la estructura correcta de la llamada a herramienta y la abstención cuando las herramientas ofrecidas son irrelevantes. Los tiempos tan cortos son coherentes con el tamaño del modelo y con el uso de un único proceso de entrenamiento; no se especifican el número de tokens vistos, la composición exacta del dataset ni la configuración de recompensas de GRPO.

## Capacidades

- Generación de llamadas a herramientas en formato estructurado, con una precisión de llamada exacta del 79,49 % en el holdout calls-only de xLAM y una precisión de nombre de función del 96,90 %.
- Abstención ante herramientas irrelevantes: el modelo está entrenado explícitamente para no emitir llamadas cuando ninguna herramienta encaja, con un 66,31 % de acierto en el subconjunto de irrelevancia evaluado.
- Function calling de un solo turno en el estilo de BFCL-v3, con un agregado del 56,23 % en los subconjuntos seleccionados por el autor.
- Conversación multi-turno y generación de texto en inglés, heredadas del modelo Instruct base.
- Capacidad limitada de razonamiento matemático y de instrucciones generales: MATH-500 18,80 % e IFEval 29,94 % (precisión estricta a nivel de prompt).
- No se documentan capacidades de visión, audio, agentes multi-paso autónomos ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Enrutado de herramientas en agentes ligeros: el adaptador decide si la consulta del usuario requiere una función del catálogo y emite el JSON de llamada. Es adecuado porque el 96,90 % de acierto en nombre de función reduce los errores de selección cuando el catálogo es cerrado.
- Abstención en asistentes con catálogo limitado: cuando el conjunto de herramientas es pequeño, el modelo puede responder en lenguaje natural en lugar de forzar una llamada. El 66,31 % de acierto en irrelevancia indica que conviene añadir una capa de validación posterior antes de producción.
- Extracción de argumentos en pipelines de datos: dado un texto en inglés y un esquema de función, el modelo genera los argumentos estructurados. Su tamaño permite ejecutarlo en CPU dentro del mismo worker sin GPU dedicada.
- Filtro en cascada hacia un modelo mayor: usar los 0,49 B como primera etapa que clasifica la intención y solo escalar al modelo grande cuando hay llamada a herramienta, reduciendo coste por petición en sistemas con alto volumen.
- Prototipado e investigación en post-entrenamiento: sirve como caso reproducible de SFT + GRPO con métricas antes/después y tiempos de entrenamiento publicados, útil para validar infraestructura antes de escalar a modelos de 7 B o más.
- Asistente local en CLI o IDE: al ocupar aproximadamente 1 GB en fp16, se puede embeber en herramientas de desarrollo para generar llamadas a funciones de un plugin local sin conexión.
- Generación de datos sintéticos de tool calling: el modelo puede producir pares consulta/llamada para aumentar datasets de entrenamiento de modelos mayores, siempre con filtrado por reglas y validación de esquema.

## Benchmarks y rendimiento

Resultados publicados en la model card. Todas las cifras son porcentajes; la primera fila es el adaptador SFT que inicializa GRPO y la segunda el adaptador final.

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SFT 8.400 (adaptador inicial) | 37,91 | 18,00 | 29,21 | 71,49 | 86,88 | 46,24 | 55,56 | 88,59 | 1,3 |
| SFT 8.400 + GRPO 3.300 (este adaptador) | 37,96 | 18,80 | 29,94 | 79,49 | 96,90 | 56,23 | 83,33 | 66,31 | 3,1 |

Notas metodológicas indicadas por el autor: xLAM ETC es precisión exacta de llamada y xLAM FNA es precisión de nombre de función, calculadas sobre el holdout calls-only con 2.287 ejemplos evaluados y 700 omitidos (no sobre el split de test del dataset mixto). BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab, por lo que los agregados son específicos del estudio y no directamente comparables con tablas públicas.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1 GB para los pesos del base (0,49 B × 2 bytes) más el adaptador (tamaño no publicado), más la caché KV; en la práctica cabe holgadamente en 4 GB.
- VRAM estimada en 4 bits: del orden de 0,3-0,5 GB para los pesos; requiere fusionar el adaptador con el base y cuantizar, ya que no se publican versiones pre-cuantizadas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050/3060, RTX 4060/4090) es suficiente; para batcheo alto conviene una A100/H100 o L4 por throughput, no por memoria.
- Inferencia en CPU: viable y probablemente el escenario más realista para este tamaño; permite desplegar en contenedores sin GPU.
- Opciones de despliegue: transformers + peft (referencia), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, o llama.cpp/Ollama tras fusionar el adaptador en el base y convertir a GGUF.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks relevantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT + GRPO) | 0,49 B + LoRA | no disponible en la model card (32.768 en el base según Qwen) | xLAM ETC 79,49; FNA 96,90; BFCL 56,23; MMLU 37,96 | no disponible | adaptador PEFT, requiere modelo base |
| Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora (adaptador SFT previo) | 0,49 B + LoRA | ídem | xLAM ETC 71,49; FNA 86,88; BFCL 46,24; Relevance 55,56; Irrelevance 88,59 | no disponible | adaptador PEFT, requiere modelo base |
| Qwen2.5-0.5B-Instruct (modelo base) | 0,49 B | 32.768 según documentación de Qwen | sin especialización en tool calling; no se publican cifras en esta ficha | Apache 2.0 | modelo completo, ampliamente disponible |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 según documentación de Qwen | no disponible en esta ficha | Apache 2.0 (verificar en su model card) | modelo completo, ampliamente disponible |

Los datos del modelo base y de Qwen2.5-1.5B-Instruct provienen de la documentación pública de Qwen y no se han verificado en esta ficha; las cifras de los dos adaptadores sí proceden de la model card del autor. La comparación más informativa es la de las dos primeras filas, porque aísla el efecto de GRPO sobre el mismo dataset y el mismo base.

## Limitaciones y advertencias

- Rendimiento general muy bajo: MMLU 37,96 %, MATH-500 18,80 % e IFEval 29,94 % sitúan al modelo lejos de un uso como asistente general; está pensado exclusivamente para tool calling.
- Regresión en abstención: GRPO mejora la relevancia (55,56 % → 83,33 %) pero degrada la detección de irrelevancia (88,59 % → 66,31 %), es decir, el modelo tiende más a emitir llamadas aunque no proceda. En producción conviene validar el esquema y aplicar umbrales externos.
- Solo inglés declarado; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación de nombres de función y de argumentos, especialmente fuera de la distribución del dataset xLAM; el 96,90 % de FNA no elimina errores en catálogos con nombres atípicos o esquemas anidados.
- Es un adaptador, no un modelo autónomo: el repositorio declara 0,0 GB de tamaño y no se publican el rango, alpha ni capas objetivo del LoRA, lo que complica reproducir la fusión exacta.
- Licencia del adaptador no especificada: la licencia Apache 2.0 del base no cubre automáticamente los pesos derivados; para uso comercial hay que confirmarla con el autor.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; las métricas proceden únicamente del autor y con scripts propios, sin replicación independiente.
- Los agregados de BFCL son subconjuntos seleccionados por el autor, no el benchmark completo, por lo que no deben compararse con puntuaciones oficiales de BFCL de otros modelos.
- Alucinación y sesgos del modelo base persisten; no se documenta ningún proceso de mitigación específico más allá del entrenamiento en tool calling.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-grpo3300-lora
- Adaptador SFT previo (usado para inicializar GRPO): https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft8400-lora
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento xLAM tool calling mixto: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Framework de entrenamiento Post-Training Lab: https://github.com/uygarkurt/post-training-lab

No se han encontrado en la información proporcionada papers, blogs técnicos ni demos asociados a este adaptador.
