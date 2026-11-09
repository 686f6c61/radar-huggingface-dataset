# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-opd1760-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-opd1760-lora` es un adaptador LoRA entrenado sobre el modelo base Qwen2.5-0.5B-Instruct de Alibaba. Lo desarrolla el usuario uygarkurt y está orientado específicamente al tool calling estructurado y a la abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. Se trata de un experimento de post-entrenamiento de pequeño tamaño (0,5 mil millones de parámetros en el modelo base) que combina supervised fine-tuning (SFT) con on-policy distillation (OPD) a partir de un teacher congelado.

La relevancia del modelo es acotada pero instructiva: demuestra un pipeline reproducible (Post-Training Lab) para especializar modelos diminutos en function calling y en el comportamiento de rechazo ante herramientas irrelevantes, un aspecto crítico en sistemas de agentes donde el modelo no debe forzar una llamada a función cuando ninguna encaja. El adaptador se publica como pesos PEFT sobre el modelo base, sin licencia declarada y con cero descargas en el momento de la consulta.

El contexto y la arquitectura heredan directamente de Qwen2.5-0.5B-Instruct; el adaptador no modifica la ventana de contexto ni la arquitectura del transformer subyacente, y su huella en disco es de 0,0 GB según el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) con adaptador LoRA PEFT |
| Parametros totales | 0,5 mil millones (modelo base); parámetros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización aplicaría al modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 0,5 mil millones de parámetros. El entrenamiento se realizó en dos fases sobre el dataset `uygarkurt/xlam-tool-calling-mixed`: primero 14.000 actualizaciones de supervised fine-tuning (2,2 horas de bucle de entrenamiento) y después 1.760 actualizaciones de on-policy distillation (0,6 horas), sumando 2,8 horas totales excluyendo carga de modelo, preparación de datos y evaluación externa. En la fase OPD el student aprende de las probabilidades por token que genera un teacher congelado, Qwen2.5-3B-Instruct, sobre sus propias respuestas generadas, lo que constituye la innovación técnica principal del experimento.

Ambas fases usan el mismo dataset mixto de tool calling, cuyo objetivo declarado es entrenar tool calling estructurado y abstención ante herramientas irrelevantes. El adaptador resultante no requiere cargar por separado el adaptador SFT previo: se aplica directamente sobre el modelo base original. No se especifican en la información disponible detalles sobre composición exacta del dataset, número de tokens de entrenamiento ni uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional en inglés sobre el modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: el adaptador está entrenado específicamente para emitir llamadas a funciones en formato estructurado (xLAM ETC mide exactitud de llamada exacta; xLAM FNA mide exactitud del nombre de función).
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no forzar una llamada cuando las herramientas ofrecidas no encajan con la consulta (métricas Relevance e Irrelevance del estudio).
- Razonamiento básico y matemáticas de nivel modesto, limitado por el tamaño de 0,5B del modelo base (MMLU 38,48%, MATH-500 17,60%).
- Seguimiento de instrucciones a nivel básico (IFEval 28,10% en precisión estricta a nivel de prompt).
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso más allá del tool calling de un solo turno evaluado.

## Casos de uso

- **Enrutamiento de funciones en asistentes ligeros**: el adaptador puede decidir si una consulta requiere llamar a una herramienta y con qué nombre de función, adecuado para entornos con recursos muy limitados donde un modelo de 0,5B es suficiente y la latencia importa. La métrica de nombre de función (FNA 89,08%) respalda esta aplicación, aunque la exactitud de llamada exacta baja al 74,12% tras OPD.
- **Sistemas de abstención controlada**: el modelo está entrenado para rechazar llamadas cuando las herramientas no son relevantes, lo que sirve en pipelines de agentes donde una llamada errónea a una API externa tiene coste. No obstante, la métrica de irrelevancia cae al 11,05% tras OPD, por lo que este caso requiere validación adicional antes de producción.
- **Prototipado rápido de pipelines de tool calling**: al ser un adaptador LoRA sobre un modelo de 0,5B, se puede cargar en GPUs de consumo y sirve para iterar sobre esquemas de funciones y prompts antes de escalar a modelos mayores.
- **Investigación en destilación on-policy**: el repositorio y el proyecto Post-Training Lab permiten reproducir el experimento SFT + OPD con teacher Qwen2.5-3B-Instruct, útil como caso de estudio académico sobre cómo la OPD afecta al equilibrio entre relevancia e irrelevancia en tool calling.
- **Filtrado previo en cascada de agentes**: dado su bajo coste computacional, puede actuar como primera etapa que descarta consultas sin herramienta aplicable antes de invocar un modelo mayor, siempre que se ajuste el umbral de abstención por la caída observada en irrelevancia.
- **Evaluación comparativa de adaptadores**: sirve como referencia para medir el impacto de la OPD frente al SFT puro en tareas de function calling, con métricas publicadas de ambos checkpoints (ETC, FNA, BFCL, Relevance, Irrelevance).

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; el primer checkpoint es el adaptador SFT que inicializa la OPD, el segundo es este adaptador SFT + OPD):

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT starting adapter | SFT 14.000 | 38,04% | 18,40% | 29,02% | 82,95% | 97,76% | 56,19% | 83,33% | 66,40% | 2,2 |
| SFT + OPD (este adaptador) | OPD 1.760 | 38,48% | 17,60% | 28,10% | 74,12% | 89,08% | 60,02% | 100,00% | 11,05% | 2,8 |

Notas de la model card: xLAM ETC es exactitud de llamada exacta; xLAM FNA es exactitud del nombre de función. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance reportan los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab. No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 requiere aproximadamente 1 GB de pesos; en cuantización de 4 bits puede ocupar unos 0,3-0,5 GB. El adaptador LoRA añade una huella mínima (repositorio de 0,0 GB). Estas cifras son estimaciones basadas en el tamaño del modelo base, no datos publicados en la model card.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre puede ejecutar el modelo base en fp16; para cuantización 4-bit basta con GPUs de gama baja. No se especifican GPU concretas en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dado el tamaño de 0,5B del modelo base.
- Opciones de despliegue: el adaptador es PEFT y se carga con transformers + peft sobre Qwen2.5-0.5B-Instruct. Para servir en producción se puede fusionar el adaptador con el modelo base y usar vLLM, TGI o llama.cpp/Ollama tras conversión a GGUF; estas opciones no están documentadas explícitamente en la model card.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA SFT+OPD) | 0,5B (base) | no disponible | Tool calling + abstención vía LoRA | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible en esta ficha | Instruct generalista | no disponible en esta ficha | Hugging Face (modelo público de Alibaba) |
| Adaptador SFT previo (uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora) | 0,5B (base) | no disponible | Tool calling vía SFT | no disponible | Hugging Face |
| Qwen2.5-3B-Instruct (teacher) | 3B | no disponible en esta ficha | Instruct generalista, usado como teacher congelado | no disponible en esta ficha | Hugging Face (modelo público de Alibaba) |

No se dispone de datos de benchmarks del modelo base ni del teacher en la información proporcionada para una comparación cuantitativa directa; la comparación se limita a la relación arquitectónica y de entrenamiento documentada.

## Limitaciones y advertencias

- La métrica de irrelevancia cae del 66,40% (SFT) al 11,05% (SFT + OPD): la OPD mejora la relevancia (100,00%) pero degrada gravemente la capacidad de abstenerse ante herramientas irrelevantes, lo que contradice parcialmente el objetivo declarado de entrenar abstención. Es un caveat crítico para producción.
- La exactitud de llamada exacta (xLAM ETC) también baja de 82,95% a 74,12% tras la OPD, y la exactitud de nombre de función de 97,76% a 89,08%.
- El modelo base de 0,5B tiene capacidades limitadas de razonamiento y matemáticas (MMLU 38,48%, MATH-500 17,60%), lo que restringe la complejidad de las consultas que puede manejar.
- IFEval de 28,10% en precisión estricta indica un seguimiento de instrucciones débil.
- Solo soporta inglés según la model card; no se documentan capacidades multilingües.
- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribución. El modelo base Qwen2.5 tiene su propia licencia que debe verificarse por separado.
- Riesgo de alucinación inherente a modelos pequeños; no se han publicado evaluaciones específicas de factualidad.
- Las evaluaciones xLAM usan scripts propios y un split con 743 ejemplos omitidos por el límite de 640 tokens de prompt, lo que puede sesgar los resultados hacia consultas cortas.
- El adaptador tiene 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria independiente.
- No se documentan sesgos conocidos en la información disponible.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-opd1760-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Teacher congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
