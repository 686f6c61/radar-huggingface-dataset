# zcheng256/OPSD-SDPO-v22-Qwen2.5-3B-checkpoints

## Resumen

OPSD-SDPO-v22-Qwen2.5-3B-checkpoints es un repositorio de puntos de control (checkpoints) de investigación publicado por el usuario zcheng256 en Hugging Face. No es un modelo entrenado de propósito general listo para producción, sino un conjunto de estados de entrenamiento persistidos sobre el modelo base Qwen/Qwen2.5-3B-Instruct, que actúa como punto de partida del proceso. El repositorio está construido con la librería PEFT y almacena adaptadores y estados completos de un pipeline de investigación denominado OPSD-SDPO.

La relevancia de esta ficha es acotada: se trata de material de investigación en fase temprana, con cero descargas y cero "likes" en el momento de la consulta, licencia restringida a uso no comercial (Qwen Research License Agreement) y sin métricas de rendimiento publicadas. El repositorio ocupa unos 310 GB, un tamaño desproporcionado para un modelo de 3B parámetros, lo que se explica porque incluye no solo los pesos del estudiante, sino también el profesor (teacher), el estado del optimizador, el estado del generador de números aleatorios (RNG) y el estado del planificador (scheduler).

El valor práctico del repositorio está en la reproducibilidad de un experimento de destilación/optimización de preferencias, no en la inferencia directa. Para usar el adaptador ligero hay que acudir al repositorio hermano OPSD-SDPO-v22-Qwen2.5-3B-LoRA, que contiene la LoRA portátil. La revisión del modelo base está fijada (pinned) en aa8e72537993ba99e69dfaafa59ed015b17504d1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Qwen2.5-3B-Instruct); el repositorio contiene adaptadores PEFT (LoRA) y estados de entrenamiento sobre dicho modelo |
| Parámetros totales | 3,09 mil millones (modelo base Qwen2.5-3B-Instruct); el repositorio incluye además estados de profesor, optimizador, RNG y scheduler |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base (ampliable a 128K con YaRN según la documentación de Qwen2.5); no se especifica en la model card del repositorio |
| Tipos de cuantización | no disponible en el repositorio; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) por herramientas de terceros |
| Idiomas soportados | no disponibles en la model card; el modelo base Qwen2.5 declara soporte de decenas de idiomas, entre ellos el español |
| Licencia | qwen-research (Qwen Research License Agreement); uso exclusivo de investigación/evaluación, no comercial |
| Formato de pesos | safetensors y adaptadores PEFT; el repositorio añade estados completos de entrenamiento (no solo pesos) |

## Arquitectura y entrenamiento

El componente desplegable se apoya en Qwen2.5-3B-Instruct, un transformer decoder-only denso con atención causal estándar y 3,09 mil millones de parámetros. Sobre ese modelo base, el repositorio aplica técnicas PEFT (adaptadores LoRA) dentro de un procedimiento de investigación etiquetado como OPSD-SDPO v22. La model card declara explícitamente que se trata de "checkpoints nativos modificados" que usan la revisión fijada del modelo base aa8e72537993ba99e69dfaafa59ed015b17504d1, y remite a MODIFICATIONS.md y a los manifiestos de cada checkpoint.

El aspecto técnico diferencial no es la arquitectura, sino el contenido del repositorio: persiste el estado completo de estudiante, profesor, optimizador, RNG, scheduler y cargador. Esto permite reanudar el entrenamiento en el mismo punto (train seed42 y eval seed1001), pero no está diseñado para servir como modelo de inferencia final. La model card advierte de que la integridad del checkpoint no implica eficacia, y que no se ha probado la reanudación de muestreo en un proceso nuevo con vLLM. No se publican preguntas, respuestas, razonamientos de referencia, rollouts ni registros de entrenamiento.

No hay información disponible sobre el número de tokens de entrenamiento adicionales, la composición del dataset, el uso de RLHF/DPO, ni sobre innovaciones de decodificación. Los nombres "OPSD" y "SDPO" sugieren un pipeline de destilación y optimización de preferencias, pero la model card no aporta detalles y no se debe extrapolar.

## Capacidades

- Generación de texto e instrucciones: hereda las capacidades del modelo base Qwen2.5-3B-Instruct para seguir instrucciones y generar texto en múltiples dominios.
- Razonamiento y matemáticas: el modelo base está entrenado para tareas de razonamiento y aritmética de complejidad media, propio de su tamaño de 3B.
- Generación de código: el modelo base cubre generación y explicación de código, aunque sin la profundidad de modelos mayores.
- Soporte multilingüe: el modelo base Qwen2.5 declara cobertura de varias decenas de idiomas; esta característica no se documenta para este repositorio concreto.
- Salida estructurada: el modelo base Qwen2.5 soporta formatos estructurados como JSON.
- Tool calling / function calling: el modelo base Qwen2.5-Instruct es compatible con llamadas a funciones, aunque la model card de este repositorio no lo confirma explícitamente.
- Capacidades de agente y razonamiento multi-paso: no confirmadas de forma específica para este checkpoint.

Nota: no se documentan capacidades de visión, audio ni un modo "thinking" para este repositorio. Dichas capacidades no deben asumirse a partir del nombre del proyecto.

## Casos de uso

- Reproducción de experimentos de investigación: el repositorio permite reanudar exactamente el pipeline OPSD-SDPO v22 desde los estados persistidos (estudiante, profesor, optimizador, RNG, scheduler), útil para replicar resultados y auditar el proceso.
- Desarrollo y ajuste de métodos de destilación: investigadores que trabajen en destilación sobre modelos 3B pueden inspeccionar los estados guardados para estudiar la dinámica de entrenamiento.
- Evaluación comparativa de versiones del pipeline: los manifiestos por checkpoint permiten comparar la evolución del modelo estudiante a lo largo del entrenamiento (v22).
- Base para investigación académica con LoRA: mediante el repositorio LoRA asociado, se puede cargar el adaptador ligero sobre Qwen2.5-3B-Instruct para experimentos de evaluación controlados.
- Estudio de reproducibilidad en entrenamiento distribuido: los estados de RNG y scheduler facilitan investigar la determinación del entrenamiento bajo semillas concretas.
- Punto de partida para experimentos de inferencia ligera: una vez extraída la LoRA portátil, sirve para pruebas de generación de texto y siguientes tareas en hardware reducido, siempre dentro del ámbito de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de evaluación (MMLU, HumanEval, GSM8K u otras), y las búsquedas web solo devuelven páginas genéricas de Qwen y del modelo base, sin resultados propios de este checkpoint. No se dispone de datos comparativos de rendimiento para esta variante.

## Requisitos de hardware

- Repositorio completo: ~310 GB en disco, necesario para replicar el entrenamiento con todos los estados (estudiante, profesor, optimizador, RNG, scheduler).
- Espacio adicional: la LoRA portátil se almacena por separado en el repositorio OPSD-SDPO-v22-Qwen2.5-3B-LoRA, lo que reduce el espacio necesario para experimentos de inferencia.
- Inferencia del modelo base en precisión completa (fp16): aproximadamente 6-7 GB de VRAM para los pesos de un modelo de 3,09B parámetros, más la memoria de caché KV según el contexto utilizado.
- Inferencia cuantizada a 8 bits: aproximadamente 3-4 GB de VRAM.
- Inferencia cuantizada a 4 bits: aproximadamente 2-3 GB de VRAM.
- GPU consumer: el modelo base cabe en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060, RTX 4070 o superiores), especialmente con cuantización. La VRAM necesaria crece con la longitud de contexto por el caché KV.
- GPU profesionales: A100, H100 o L40S son adecuadas para entrenamiento y experimentación con lotes grandes; la inferencia de un 3B no las requiere.
- Opciones de despliegue: transformers + PEFT (para el adaptador), llama.cpp, Ollama, vLLM y TGI para el modelo base. La model card advierte de que la reanudación del muestreo en un proceso nuevo con vLLM no ha sido probada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza / disponibilidad |
|---|---|---|---|---|
| OPSD-SDPO-v22-Qwen2.5-3B-checkpoints (este) | 3,09B (base) | 32.768 (base) | qwen-research (no comercial) | Repositorio de checkpoints de investigación; 0 descargas; sin benchmarks publicados |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 (ampliable a 128K) | Apache 2.0 (modelo base) | Modelo instruct listo para producción, con documentación y benchmarks públicos |
| Llama-3.2-3B-Instruct | ~3,2B | 128K | Licencia comunitaria Llama | Alternativa de tamaño similar de Meta; datos de la ficha no verificados aquí |
| Phi-3.5-mini-instruct | ~3,8B | 128K | MIT | Alternativa de Microsoft de tamaño cercano; datos no verificados aquí |

La comparación cuantitativa de rendimiento no está disponible para el modelo de esta ficha, ya que no publica benchmarks. Los datos de licencia, contexto y disponibilidad de las alternativas se basan en información pública general y no en las fuentes proporcionadas para este repositorio, por lo que deben verificarse antes de usarse en producción.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo Qwen Research License Agreement (uso de investigación/evaluación); no está permitido el uso comercial.
- Material de investigación, no de producción: el repositorio contiene estados de entrenamiento, no un modelo listo para desplegar; la model card advierte de que la integridad del checkpoint no implica eficacia.
- Sin benchmarks: no se publican métricas de rendimiento, por lo que no se puede evaluar su calidad frente a alternativas.
- Sin garantía de reanudación en inferencia: no se ha probado la reanudación de muestreo en un proceso nuevo con vLLM.
- Semillas fijas: solo se contemplan train seed42 y eval seed1001, lo que limita la variabilidad reproducible del experimento.
- Idiomas y sesgos: la model card no detalla idiomas soportados ni sesgos; cualquier evaluación de sesgo o alucinación debería hacerse sobre el modelo base y el adaptador concreto.
- Riesgo de alucinación: inherente a los modelos de 3B, mayor que en modelos de mayor tamaño; no se aportan datos específicos.
- Obligaciones de redistribución: es obligatorio redistribuir los archivos LICENSE, NOTICE y MODIFICATIONS.md junto con los checkpoints.
- Datos no publicados: no se publican preguntas, respuestas, razonamientos de referencia, rollouts, registros ni credenciales, lo que dificulta auditar la calidad del pipeline.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/zcheng256/OPSD-SDPO-v22-Qwen2.5-3B-checkpoints
- Adaptador LoRA asociado: https://huggingface.co/zcheng256/OPSD-SDPO-v22-Qwen2.5-3B-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Blog oficial de Qwen2.5: https://qwen.ai/blog?id=qwen2.5
- Guía de la familia Qwen 3 (referencia contextual): https://baeseokjae.github.io/posts/qwen-3-full-lineup-guide-2026/
- Tutorial sobre Qwen2.5-VL 3B (referencia contextual, no relacionada con este checkpoint): https://aiindigo.com/tutorials/getting-started-with-qwen2-5-vl-3b-edge-ready-multimodal-ai
