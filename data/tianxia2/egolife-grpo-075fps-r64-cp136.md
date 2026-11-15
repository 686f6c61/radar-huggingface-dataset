# tianxia2/egolife-grpo-075fps-r64-cp136

## Resumen

EgoLife six-user QA generator es un adaptador LoRA para el modelo base Qwen/Qwen3.8-27B, desarrollado por el usuario tianxia2 y entrenado con GRPO (Group Relative Policy Optimization) mediante la librería ms-swift. Su propósito concreto es generar preguntas de opción múltiple (multiple-choice QA) a partir de seis vistas egocéntricas sincronizadas del dataset EgoLife, es decir, material audiovisual de primera persona grabado simultáneamente por seis usuarios durante ventanas de 10 minutos. No es un modelo de propósito general, sino un artefacto de investigación especializado en una tarea muy acotada de generación de preguntas sobre vídeo multivista.

El adaptador se entrena sobre un contexto extremadamente largo: 2700 fotogramas (6 usuarios × 450 fotogramas a 0.75 fps) pre-redimensionados a 320 px, con max_pixels de 25600 (160×160 por fotograma, aproximadamente 67.5k tokens visuales) y max_length de 131072 tokens. Este planteamiento lo sitúa en el terreno de los modelos de contexto ultra-largo con entrada multimodal masiva, aunque el adaptador en sí solo modifica capas de atención del transformer subyacente.

El checkpoint publicado (checkpoint-136) corresponde a un entrenamiento planificado de 360 pasos que se detuvo al alcanzar el límite de 48 horas de wall-time. La recompensa media pasó de 0.415 en los primeros 10 pasos a 0.552 en los últimos 10, lo que indica una mejora modesta pero real. Al tratarse de un adaptador LoRA de 0.3 GB con cero descargas y sin licencia declarada, debe considerarse un artefacto de investigación preliminar, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.8-27B; rango r=64, alpha=128, dropout 0.05 |
| Parametros totales | no disponible (el adaptador LoRA pesa 0.3 GB; el modelo base Qwen3.8-27B tiene 27B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | max_length 131072 tokens (configurado en entrenamiento); ~67.5k tokens visuales por ventana de 2700 fotogramas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors), librería peft |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango r=64, alpha=128 y dropout 0.05 sobre los módulos q_proj, v_proj e in_proj_qkv de todas las capas del modelo base Qwen/Qwen3.8-27B. El entrenamiento se realizó con GRPO mediante ms-swift, con learning rate 1e-5 y 4 generaciones por prompt. La entrada consiste en una ventana de 10 minutos con 6 usuarios × 450 fotogramas = 2700 fotogramas a 0.75 fps (sin deduplicación), pre-redimensionados a 320 px y con max_pixels de 25600 (160×160 por fotograma), lo que produce aproximadamente 67.5k tokens visuales por muestra y un max_length de 131072 tokens.

La innovación principal reside en el esquema de recompensa, compuesto por tres jueces continuos con compuerta: R = 0.2·F + 0.4·E + 0.4·C·[E > 0.5], donde F es formalidad, E es "groundedness" (anclaje al contenido visual) y C es respuesta-abilidad (answerability). El juez de answerability es el checkpoint-630; el de formalidad es tianxia2/egolife-formality-judge-r64-L48 y el de groundedness es tianxia2/egolife-groundedness-judge-linattn-L16-r128 (epoch 4). La compuerta condiciona la contribución de C a que E supere 0.5, penalizando preguntas no ancladas al vídeo. El entrenamiento se detuvo en el paso 136 de 360 por el límite de 48 horas, con recompensa media de 0.415 (primeros 10 pasos) a 0.552 (últimos 10).

## Capacidades

- Generación de preguntas de opción múltiple (multiple-choice QA) sobre vídeo egocéntrico multivista de seis usuarios sincronizados.
- Procesamiento de entradas visuales de muy largo alcance: 2700 fotogramas por muestra, con ~67.5k tokens visuales y contexto de hasta 131072 tokens.
- Razonamiento anclado al contenido visual ("groundedness") mediante el juez E, que condiciona la recompensa.
- Generación condicionada por prompt de tipo "general answer" para producir preguntas respondibles.
- No se documentan capacidades de tool calling, function calling, agentes, multilingüismo específico ni modos de pensamiento (thinking mode) en la información disponible.
- No se documentan capacidades de audio ni de visión más allá del procesamiento de fotogramas egocéntricos.

## Casos de uso

- Investigación en generación automática de QA sobre vídeo egocéntrico: el adaptador permite generar preguntas de opción múltiple a partir de ventanas de 10 minutos de seis vistas sincronizadas, útil para construir datasets de evaluación de modelos de vídeo-lenguaje.
- Anotación asistida de datasets EgoLife: el modelo puede proponer preguntas candidatas que un anotador humano revisa, reduciendo el coste de crear benchmarks de comprensión de vídeo multivista.
- Evaluación de modelos de vídeo-lenguaje de contexto largo: las preguntas generadas sirven como test de comprensión sobre 2700 fotogramas, un régimen de contexto extremo poco cubierto por benchmarks estándar.
- Estudio de esquemas de recompensa con jueces múltiples: el diseño R = 0.2·F + 0.4·E + 0.4·C·[E > 0.5] es replicable para investigar cómo la compuerta de groundedness afecta a la calidad de las preguntas generadas.
- Generación de material para tareas de razonamiento temporal: al cubrir ventanas de 10 minutos con seis usuarios, permite formular preguntas sobre eventos concurrentes entre perspectivas.
- Reproducción de experimentos de RL con GRPO sobre modelos de 27B: el adaptador y su receta (r=64, alpha=128, lr 1e-5, 4 generaciones por prompt) documentan un caso concreto de entrenamiento GRPO multimodal de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la recompensa media del entrenamiento GRPO: 0.415 en los primeros 10 pasos y 0.552 en los últimos 10, sobre el esquema R = 0.2·F + 0.4·E + 0.4·C·[E > 0.5].

## Requisitos de hardware

- El adaptador LoRA ocupa 0.3 GB en disco (adapter_model.safetensors), pero requiere cargar el modelo base Qwen/Qwen3.8-27B, con un peso en VRAM que no se detalla en la información disponible.
- La inferencia con contexto de 131072 tokens y ~67.5k tokens visuales por muestra exige memoria muy elevada; no se dispone de estimaciones concretas de VRAM en la información proporcionada.
- GPU recomendadas: no disponible. Por el tamaño del modelo base (27B) y la longitud de contexto, se requerirían GPUs de clase数据中心 (A100/H100) o configuraciones multi-GPU; no confirmado en la información.
- Compatibilidad con GPU de consumo: no disponible; el contexto de 131072 tokens y el volumen visual hacen improbable su ejecución en GPUs de consumo sin cuantización agresiva, extremo no documentado.
- Opciones de despliegue: la librería declarada es peft; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA para generación de QA sobre vídeo egocéntrico multivista) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint incompleto: se detuvo en el paso 136 de 360 por el límite de 48 horas, por lo que el entrenamiento no finalizó según el plan previsto.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. El modelo base Qwen/Qwen3.8-27B tiene su propia licencia que debe consultarse por separado.
- Idiomas no declarados: no se documenta qué idiomas soporta la generación de preguntas.
- Especialización extrema: el adaptador está entrenado exclusivamente para generar preguntas de opción múltiple sobre el dataset EgoLife con seis usuarios; su comportamiento fuera de ese dominio no está documentado.
- Dependencia de jueces externos: la calidad del entrenamiento depende de los jueces de formalidad, groundedness y answerability, cuyas limitaciones se propagan al adaptador.
- Riesgo de alucinación: no evaluado en la información disponible; el esquema de recompensa intenta mitigar preguntas no ancladas al vídeo mediante la compuerta [E > 0.5], pero no se reportan métricas de hallucination.
- Cero descargas y cero likes: artefacto de investigación sin validación comunitaria.
- Requisitos de contexto extremos: 131072 tokens y ~67.5k tokens visuales por muestra limitan su despliegue práctico a infraestructura de gama alta.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad más allá de la recompensa de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/tianxia2/egolife-grpo-075fps-r64-cp136
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Juez de formalidad: https://huggingface.co/tianxia2/egolife-formality-judge-r64-L48
- Juez de groundedness: https://huggingface.co/tianxia2/egolife-groundedness-judge-linattn-L16-r128
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio ms-swift: no disponible en la información proporcionada
- Dataset EgoLife: no disponible en la información proporcionada
