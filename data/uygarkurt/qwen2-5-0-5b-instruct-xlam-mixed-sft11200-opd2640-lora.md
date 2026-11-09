# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd2640-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd2640-lora` es un adaptador LoRA desarrollado por el usuario uygarkurt sobre el modelo base Qwen2.5-0.5B-Instruct de Alibaba. El adaptador se ha entrenado específicamente para mejorar el tool calling estructurado (function calling) y la capacidad de abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario. Se trata de un experimento de investigación más que de un modelo listo para producción, dado su reducido tamaño y la ausencia de documentación sobre licencia y uso comercial.

El entrenamiento combina dos fases: primero un ajuste supervisado (SFT) de 11.200 actualizaciones sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, y posteriormente una destilación on-policy (OPD) de 2.640 actualizaciones adicionales usando Qwen2.5-3B-Instruct como profesor congelado. El resultado es un adaptador PEFT (LoRA) que debe cargarse sobre el modelo base original Qwen2.5-0.5B-Instruct, sin necesidad de cargar el adaptador SFT intermedio por separado.

La relevancia de este modelo reside en su enfoque metodológico: demuestra cómo la destilación on-policy sobre un modelo pequeño puede mejorar métricas específicas de function calling (BFCL single-turn pasa del 54,28% al 59,72%) y la detección de relevancia de herramientas (100%), aunque a costa de degradar significativamente la detección de irrelevancia (del 72,91% al 10,43%) y las métricas de precisión de llamadas a herramientas (xLAM ETC baja del 81,46% al 71,17%). Es un caso de estudio útil sobre los trade-offs del entrenamiento con destilación on-policy.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (adaptador LoRA sobre Qwen2.5-0.5B-Instruct) |
| Parámetros totales | No disponible (el modelo base Qwen2.5-0.5B-Instruct tiene 0,49B; el adaptador LoRA añade un número no especificado de parámetros entrenables) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen2.5 soporta hasta 32.768 tokens, pero no se confirma para este adaptador) |
| Tipos de cuantización | No disponible (formato de pesos safetensors, compatible con cuantización posterior vía PEFT/transformers) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,49 mil millones de parámetros. El adaptador en sí es un LoRA (Low-Rank Adaptation) entrenado con la librería PEFT, lo que implica que solo se actualiza un subconjunto reducido de parámetros de bajo rango, manteniendo congelados los pesos del modelo base. El entrenamiento se realizó con la herramienta Post-Training Lab del propio autor.

El proceso de entrenamiento consta de dos etapas. La primera es un ajuste supervisado (SFT) de 11.200 actualizaciones (1,8 horas) sobre el dataset mixto `uygarkurt/xlam-tool-calling-mixed`, que entrena al modelo para generar llamadas a herramientas estructuradas y para abstenerse cuando las herramientas ofrecidas no son relevantes. La segunda etapa es una destilación on-policy (OPD) de 2.640 actualizaciones (0,9 horas) en la que el estudiante (el adaptador SFT) genera respuestas y aprende de las probabilidades token a token de un profesor congelado, Qwen2.5-3B-Instruct. El tiempo total de entrenamiento reportado es de 2,7 horas, excluyendo carga de modelo, preparación de datos y evaluación externa.

La innovación técnica principal es el uso de destilación on-policy sobre un modelo muy pequeño para una tarea específica (tool calling), combinada con un dataset mixto que incluye ejemplos de abstención. El dataset de evaluación xLAM emplea 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt.

## Capacidades

- Generación de texto conversacional en inglés.
- Tool calling / function calling estructurado: genera llamadas a funciones en formato estructurado, entrenado específicamente sobre el dataset xLAM mixto.
- Abstención ante herramientas irrelevantes: capacidad entrenada explícitamente para no invocar funciones cuando las herramientas ofrecidas no son pertinentes (aunque con limitaciones, ver benchmarks).
- Razonamiento básico y matemáticas elementales: heredado del modelo base Qwen2.5-0.5B-Instruct, con rendimiento limitado por el tamaño.
- Seguimiento de instrucciones: capacidad básica de instruction following, medida con IFEval.
- Capacidades multilingües: limitadas al inglés según la model card; el modelo base Qwen2.5 soporta más idiomas, pero este adaptador se ha entrenado solo con datos en inglés.
- No se documentan capacidades de visión, audio, agentes multi-paso ni modo thinking.

## Casos de uso

- Prototipado de asistentes con function calling en entornos de investigación: el adaptador permite experimentar con tool calling estructurado en un modelo de 0,5B parámetros, lo que facilita iteraciones rápidas y despliegue en hardware muy limitado. Es adecuado para validar pipelines de agentes antes de escalar a modelos mayores.
- Enrutamiento de consultas a herramientas en sistemas de bajo coste: dado su tamaño reducido, puede desplegarse en CPU o GPUs de gama baja para decidir si una consulta debe invocar una API externa o responderse directamente, aprovechando la capacidad de abstención entrenada.
- Investigación sobre destilación on-policy: el modelo sirve como caso de estudio reproducible para analizar cómo la OPD afecta a métricas de precisión y calibración en tareas de function calling, gracias a los checkpoints SFT y SFT+OPD publicados.
- Evaluación comparativa de adaptadores LoRA: al estar disponible el adaptador SFT previo y el SFT+OPD, permite comparar el impacto de cada etapa de entrenamiento en las mismas métricas (xLAM ETC, FNA, BFCL, relevancia).
- Generación de llamadas a funciones en asistentes de dominio cerrado con pocas herramientas: para escenarios donde el conjunto de funciones es pequeño y bien definido, el modelo puede generar llamadas estructuradas con una precisión aceptable (59,72% en BFCL single-turn).
- Filtrado de consultas irrelevantes en pipelines de agentes: aunque la métrica de irrelevancia es baja (10,43%), el modelo puede integrarse como primera etapa de un pipeline más amplio donde un modelo mayor valide la decisión, o para experimentar con estrategias de abstención.
- Docencia y experimentación con PEFT: el adaptador es un ejemplo práctico de entrenamiento LoRA con SFT + OPD sobre un modelo pequeño, útil para cursos o tutoriales sobre post-entrenamiento.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el adaptador SFT inicial con el adaptador SFT+OPD final. Todas las puntuaciones son porcentajes.

| Checkpoint | Paso | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Adaptador SFT inicial | SFT 11.200 | 38,36% | 16,20% | 27,36% | 81,46% | 96,98% | 54,28% | 83,33% | 72,91% | 1,8 |
| SFT + OPD (este adaptador) | OPD 2.640 | 38,58% | 17,60% | 29,57% | 71,17% | 88,26% | 59,72% | 100,00% | 10,43% | 2,7 |

Notas sobre la evaluación: xLAM ETC es la precisión exacta de llamada a herramienta; xLAM FNA es la precisión del nombre de función. Estas puntuaciones xLAM usan el split de test del dataset mixto, con 2.546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt. BFCL single-turn FC resume subconjuntos seleccionados de BFCL-v3 de function calling de un solo turno. Relevance e Irrelevance reportan los subconjuntos de relevancia seleccionados. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts personalizados de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador LoRA sobre un modelo de 0,49B parámetros, el modelo completo en precisión FP16 ocupa aproximadamente 1 GB. En cuantización de 8 bits, alrededor de 0,5 GB; en 4 bits, alrededor de 0,25-0,3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente, incluyendo GTX 1650, RTX 3050, RTX 4060, RTX 4090. También puede ejecutarse en CPU con llama.cpp u Ollama, aunque con mayor latencia.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers + PEFT (carga del adaptador sobre el modelo base), vLLM (con soporte de adaptadores LoRA), llama.cpp (requiere conversión del adaptador a GGUF), Ollama (previa conversión), TGI (con soporte de adaptadores).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo base, se espera una latencia muy baja (del orden de milisegundos por token en GPU consumer), pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B-Instruct + LoRA SFT+OPD) | 0,49B (base) + LoRA | No disponible | Tool calling y abstención vía SFT + OPD | No disponible | Hugging Face (adaptador PEFT) |
| Qwen2.5-0.5B-Instruct (base) | 0,49B | 32.768 tokens (según modelo base) | Instruction following general | Apache 2.0 (según modelo base) | Hugging Face |
| Adaptador SFT inicial del mismo autor | 0,49B (base) + LoRA | No disponible | Tool calling vía SFT | No disponible | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 tokens (según modelo base) | Instruction following general | Apache 2.0 (según modelo base) | Hugging Face |

No se dispone de datos de benchmarks de modelos comparables de terceros en la información proporcionada para establecer una comparativa de rendimiento directa. La comparativa se limita a los checkpoints del mismo autor y al modelo base.

## Limitaciones y advertencias

- Degradación en detección de irrelevancia: la métrica de irrelevancia cae del 72,91% (SFT) al 10,43% (SFT+OPD), lo que indica que el modelo tiende a invocar herramientas incluso cuando no son relevantes. Esto es un riesgo importante para producción.
- Degradación en precisión de llamadas: xLAM ETC baja del 81,46% al 71,17% y xLAM FNA del 96,98% al 88,26% tras la OPD, lo que sugiere que la destilación on-policy mejora algunas métricas (BFCL, relevancia) pero empeora otras.
- Rendimiento general bajo: MMLU del 38,58%, MATH-500 del 17,60% e IFEval del 29,57%, propios de un modelo de 0,5B parámetros. No es adecuado para tareas de razonamiento complejo, matemáticas o seguimiento de instrucciones estricto.
- Limitación de contexto en evaluación: 743 ejemplos del test xLAM fueron omitidos por superar el límite de 640 tokens de prompt, lo que sugiere que el modelo puede tener dificultades con prompts largos.
- Idioma: entrenado y evaluado solo en inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia no disponible: no se especifica la licencia del adaptador, lo que impide confirmar si se permite uso comercial. El modelo base Qwen2.5-0.5B-Instruct tiene licencia Apache 2.0, pero el adaptador no declara la suya.
- Riesgo de alucinación: como todo modelo de lenguaje pequeño, puede generar llamadas a funciones con argumentos inventados o nombres de función incorrectos.
- Sin datos de sesgos: no se ha publicado información sobre sesgos conocidos ni sobre la composición demográfica del dataset de entrenamiento.
- Modelo experimental: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Sin soporte de agentes multi-paso ni modo thinking documentado: el entrenamiento se centra en function calling de un solo turno.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-opd2640-lora
- Adaptador SFT inicial: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft11200-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo profesor: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
