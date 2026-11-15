# tianxia2/egolife-grpo-allsix-gated-r128-cp300

## Resumen

EgoLife grpo allsix gated r128 cp300 es un adaptador LoRA de tipo PEFT desarrollado por el usuario tianxia2 sobre el modelo base Qwen/Qwen3.8-27B. Su funcion no es la generacion de texto generica ni la respuesta a preguntas de usuario final, sino la generacion de preguntas de opcion multiple que obligatoriamente requieran evidencia procedente de las seis vistas egocentricas sincronizadas del dataset EgoLife. El adaptador se entrena con GRPO (Group Relative Policy Optimization) mediante la libreria ms-swift, con una funcion de recompensa escalonada que combina formalidad, fundamentacion en evidencia y respondibilidad.

El modelo resulta relevante por su enfoque de dominio muy especifico: la generacion de preguntas verificables sobre ventanas temporales de video egocentrico multicamara. Frente al ajuste supervisado clasico, el uso de GRPO con jueces binarios por usuario permite optimizar directamente propiedades dificiles de supervisar con etiquetas, como que la pregunta no pueda responderse sin integrar las seis perspectivas. El checkpoint publicado corresponde al paso 300 de un plan de 900, con una recompensa media que pasa de 0,267 en los primeros 10 pasos a 0,591 en los ultimos 10.

Se trata de un adaptador de 0,6 GB, no de un modelo completo, por lo que requiere cargar Qwen/Qwen3.8-27B como base. La model card no documenta licencia, idiomas ni pipeline de inferencia, y no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.8-27B |
| Parametros totales | no disponible (adaptador de 0,6 GB; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | max_length 65536 durante el entrenamiento (heredada del base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapter_model.safetensors), libreria PEFT |
| Rango LoRA (r) | 128 |
| Alpha LoRA | 128 |
| Dropout LoRA | 0,05 |
| Modulos objetivo | q_proj, v_proj, in_proj_qkv (todas las capas) |
| Checkpoint | 300 de un plan de 900 pasos |
| Optimizador / framework | GRPO con ms-swift, lr 1e-5 |
| SHA-256 del adaptador | d4d09bef3e98f9eb6d102e22dd6135acf2baf88a2230a348ba73540ad065a3dd |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.8-27B, un transformer del que la informacion disponible no detalla capas, dimensiones ni regimen de atencion. La contribucion propia es un LoRA de rango 128 y alpha 128 con dropout 0,05, inyectado en q_proj, v_proj e in_proj_qkv de todas las capas; la presencia del modulo in_proj_qkv sugiere que el modelo base incorpora componentes de atencion lineal o hibrida ademas de la atencion estandar.

El entrenamiento emplea GRPO con cuatro generaciones por prompt. La recompensa combina tres jueces binarios, uno por cada usuario: R = 0,2·F + 0,4·G + 0,4·A·[G > 0,5], donde F es formalidad, G es fundamentacion (groundedness) y A es respondibilidad (answerability). El termino de compuerta [G > 0,5] anula la contribucion de la respondibilidad si la pregunta no esta suficientemente fundamentada, lo que penaliza preguntas formuladas correctamente pero no ancladas en la evidencia visual. La entrada consiste en una ventana de 10 minutos con seis usuarios, muestreando fotogramas a 0,5 fps (300 para el usuario preguntador y el resto deduplicados, entre 900 y 1800 fotogramas por prompt), con max_pixels 24576 (aproximadamente 128x128 por fotograma) y max_length 65536.

## Capacidades

- Generacion de preguntas de opcion multiple para QA sobre video egocentrico multicamara, especificamente disenadas para exigir evidencia de las seis vistas sincronizadas.
- Condicionamiento multimodal sobre secuencias de fotogramas de varios usuarios en una ventana temporal de 10 minutos.
- Razonamiento sobre evidencia distribuida entre perspectivas: el objetivo del entrenamiento es que la respuesta no sea derivable de una sola vista.
- Generacion con formato controlado (preguntas de opcion multiple) y control de formalidad mediante la recompensa F.
- Integracion de evidencia visual a traves del termino de groundedness G, que desincentiva preguntas no ancladas en los fotogramas.
- Capacidades generales de texto y razonamiento heredadas de Qwen/Qwen3.8-27B (no documentadas de forma especifica para este adaptador).
- Soporte de tool calling, function calling, agentes o modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de benchmarks de QA egocentrico: el adaptador produce preguntas de opcion multiple verificables sobre el dataset EgoLife, utiles para construir conjuntos de evaluacion que obliguen a integrar seis puntos de vista.
- Anotacion semiautomatica de video multicamara: dado un clip de 10 minutos con seis usuarios, el modelo propone preguntas y opciones que un anotador humano puede validar, reduciendo el coste de crear datos supervisados.
- Entrenamiento de asistentes de memoria episodica: las preguntas generadas sirven para entrenar o evaluar modelos que deben recordar eventos distribuidos entre varios participantes y camaras.
- Investigacion en aprendizaje por refuerzo con recompensas basadas en jueces: el esquema R = 0,2·F + 0,4·G + 0,4·A·[G > 0,5] es un ejemplo replicable para tareas donde la correccion depende de la fundamentacion en evidencia.
- Auditoria de cobertura de evidencia: al exigir que la respuesta requiera las seis vistas, las preguntas generadas permiten medir si un sistema de recuperacion o un modelo multimodal realmente usa todas las camaras o solo una.
- Generacion de datos sinteticos para QA multimodal de contexto largo: la ventana de 65536 tokens y el muestreo de 900-1800 fotogramas permiten producir pares pregunta-respuesta de contexto muy extenso para destilar modelos menores.
- Estudio de la degradacion por truncamiento de checkpoint: al ser un checkpoint intermedio (300 de 900), sirve como referencia para analizar como evoluciona la calidad de las preguntas con el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento reportado es la recompensa media de entrenamiento: 0,267 en los primeros 10 pasos y 0,591 en los ultimos 10, dentro de una escala compuesta por F, G y A. No se proporcionan valores desagregados por componente ni evaluaciones sobre conjuntos de test.

## Requisitos de hardware

- El adaptador ocupa 0,6 GB, pero la inferencia requiere cargar el modelo base Qwen/Qwen3.8-27B completo; la VRAM necesaria depende de la cuantizacion del base, que no esta documentada.
- Para el base de 27B en precision completa (BF16) se necesitan aproximadamente 54 GB solo para pesos, mas cache KV; en cuantizacion de 8 bits, en torno a 27 GB, y en 4 bits, en torno a 14-16 GB, estimaciones teoricas no verificadas para este modelo concreto.
- La ventana de 65536 tokens y la entrada de hasta 1800 fotogramas por prompt elevan de forma significativa el consumo de memoria de activaciones y cache KV durante la inferencia, muy por encima de una carga de texto tipica.
- GPU recomendadas para el base sin cuantizar: A100 80 GB, H100 80 GB o multiples GPU con parallelismo de tensor. En consumer, una RTX 4090 de 24 GB solo seria viable con cuantizacion agresiva del base y ventanas de contexto reducidas.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador sobre el base; vLLM y TGI para servicio con soporte de adaptadores LoRA; llama.cpp y Ollama solo si existe una conversion GGUF del base y del adaptador, no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables de generacion de preguntas para EgoLife ni de benchmarks que permitan una comparacion cuantitativa. La tabla siguiente recoge solo los datos conocidos de este adaptador frente a la referencia del modelo base.

| Modelo | Tipo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|---|
| tianxia2/egolife-grpo-allsix-gated-r128-cp300 | LoRA sobre Qwen3.8-27B | no disponible (adaptador 0,6 GB) | 65536 en entrenamiento | GRPO, recompensa gated de seis usuarios | no disponible |
| Qwen/Qwen3.8-27B | Transformer base | 27B (segun identificador) | no disponible | no disponible | no disponible |
| Alternativas de generacion de preguntas sobre EgoLife | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint intermedio: solo se completaron unos 300 pasos de un plan de 900, por lo que la calidad esta por debajo de la trayectoria de entrenamiento prevista.
- Especializacion estrecha: el adaptador esta entrenado exclusivamente para generar preguntas de opcion multiple sobre ventanas de seis vistas de EgoLife; su comportamiento fuera de ese dominio no esta evaluado.
- Riesgo de sobreajuste al formateador de recompensa: al optimizar F y G con jueces binarios, puede producir preguntas formalmente correctas y ancladas en evidencia pero poco informativas o redundantes.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion del adaptador ni del modelo base.
- Idiomas no documentados: se desconoce si conserva el multilingueismo del base o si el entrenamiento lo ha restringido.
- Dependencia del base: el adaptador no es autonomo; cualquier limitacion, sesgo o restriccion de licencia de Qwen/Qwen3.8-27B se hereda.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad fuera de la recompensa de entrenamiento, que no equivale a exactitud en un test independiente.
- Coste de inferencia elevado por la entrada multimodal de hasta 1800 fotogramas y contexto de 65536 tokens.
- Riesgo de alucinacion sobre detalles visuales no presentes en los fotogramas, atenuado pero no eliminado por el termino de groundedness.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/tianxia2/egolife-grpo-allsix-gated-r128-cp300
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset EgoLife: no disponible en la informacion proporcionada
- Paper de GRPO: no disponible en la informacion proporcionada
- Repositorio ms-swift: no disponible en la informacion proporcionada
- Demos o blogs del autor: no disponibles en la informacion proporcionada
