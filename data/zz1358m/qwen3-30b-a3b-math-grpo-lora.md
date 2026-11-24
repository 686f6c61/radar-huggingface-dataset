# zz1358m/Qwen3-30B-A3B-Math-GRPO-LoRA

## Resumen

Qwen3-30B-A3B-Math-GRPO-LoRA es un ajuste fino del modelo Qwen3-30B-A3B de Alibaba Qwen, publicado por el usuario zz1358m en Hugging Face. Se trata de un adaptador LoRA entrenado con GRPO (Group Relative Policy Optimization) sobre tareas de matematicas multiturno con acceso a una herramienta de Python, siguiendo un esquema ReAct de hasta 20 turnos de 2.048 tokens cada uno. El resultado es un modelo especializado en razonamiento matematico con uso de interprete de codigo.

El modelo parte de la arquitectura MoE de Qwen3-30B-A3B: 30.532.122.624 parametros totales (segun los pesos en safetensors) con activacion dispersa, contexto nativo extendido mediante YaRN (factor 4, hasta 131.072 posiciones) y pesos en bf16. El adaptador LoRA (rank 8, alpha 32, aplicado sobre q_proj, k_proj, v_proj y o_proj) esta fusionado directamente en los pesos publicados, de modo que el repositorio contiene un modelo completo y no un adaptador separado.

Su relevancia es doble. Por un lado, demuestra una mejora sustancial en precision matematica multiturno frente al modelo base: 51,30 % frente a 39,08 % en una evaluacion sobre DAPO-Math, AIME 2025/2026 y HMMT Feb 2026. Por otro, el autor lo presenta explicitamente como la linea base GRPO de un estudio sobre ajuste fino con estrategias evolutivas, lo que lo convierte en una referencia util para investigacion en RL aplicado a modelos de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_moe), con rope scaling YaRN |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 posiciones (YaRN factor 4 sobre el contexto nativo de Qwen3-30B-A3B) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE de Qwen3-30B-A3B, con capas de atencion y mezcla de expertos dispersa, y conserva la configuracion de rope scaling YaRN del modelo base (factor 4, 131.072 posiciones). Sobre esta base se aplico un ajuste fino con LoRA de rank 8 y alpha 32 en las proyecciones q_proj, k_proj, v_proj y o_proj, entrenado con GRPO durante 100 pasos. Posteriormente, el adaptador se fusiono en los pesos en bf16 mediante la formula W + alpha/r * B @ A, por lo que el checkpoint publicado es un modelo completo listo para cargar con transformers.

El entrenamiento se realizo sobre tareas de matematicas multiturno con una herramienta de Python en formato ReAct, con hasta 20 turnos de 2.048 tokens cada uno. Esto implica que el modelo aprendio a intercalar razonamiento en lenguaje natural, llamadas a codigo y observaciones del interprete antes de emitir la respuesta final. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si hubo etapas adicionales de RLHF o DPO. La configuracion de muestreo conservada es temperatura 0,6, top-p 0,95 y top-k 20.

## Capacidades

- Generacion de texto y razonamiento matematico de varios pasos, con especial enfasis en problemas de competicion (AIME, HMMT).
- Razonamiento multiturno con uso de herramienta Python en esquema ReAct: el modelo puede generar codigo, ejecutarlo y usar la observacion para continuar el razonamiento, hasta 20 turnos.
- Soporte de tool calling implicito mediante el bucle ReAct entrenado, orientado a ejecucion de codigo.
- Razonamiento multi-step y descomposicion de problemas, derivado del entrenamiento con GRPO sobre trayectorias largas.
- Capacidades generales heredadas del modelo base Qwen3-30B-A3B (generacion, conversacion, codigo), aunque no reentrenadas de forma explicita en este ajuste.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Resolucion de problemas matematicos de competicion: el modelo esta entrenado especificamente para problemas tipo AIME y HMMT, con mejora medida de 39,08 % a 51,30 % en precision multiturno, por lo que es adecuado para evaluacion y generacion de soluciones paso a paso.
- Tutoria matematica asistida por codigo: el bucle ReAct permite que el modelo verifique calculos ejecutando Python, lo que reduce errores aritmeticos en explicaciones largas para estudiantes.
- Generacion de datasets de razonamiento: al producir trayectorias multiturno con llamadas a herramientas, puede emplearse para sintetizar datos de entrenamiento de modelos mas pequenos en tareas de matemáticas con verificacion.
- Verificacion simbolica y numerica en pipelines de datos: integrado en un orquestador que exponga un interprete Python, el modelo puede comprobar resultados de calculos en procesos ETL o de validacion cientifica.
- Linea base de investigacion en RL: el autor lo publica como referencia GRPO para un estudio de estrategias evolutivas, de modo que sirve para comparar metodos de ajuste fino bajo las mismas condiciones de evaluacion.
- Experimentacion academica en RL con recompensas verificables: su entrenamiento con GRPO sobre problemas con respuesta comprobable lo hace util para reproducir y extender estudios de razonamiento con RL.
- Asistente de analisis cuantitativo: con acceso a Python puede resolver problemas de estadistica, optimizacion o finanzas cuantitativas que requieran calculo iterativo y comprobacion.

## Benchmarks y rendimiento

Evaluacion del autor: precision multiturno sobre DAPO-Math con 4 muestras, AIME 2025/2026 y HMMT Feb 2026 con 16 muestras, media sobre preguntas, ejecutada en 4x A100.

| Modelo | Precision de test (%) |
|---|---|
| Qwen3-30B-A3B (base) | 39,08 |
| Qwen3-30B-A3B-Math-GRPO-LoRA | 51,30 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, los pesos en bf16 ocupan aproximadamente 61 GB (tamano del repo), por lo que la inferencia en bf16 requiere al menos 2 GPU de 40 GB o una GPU de 80 GB; con cuantizacion a 8 bits o 4 bits el requisito se reduce aproximadamente a la mitad o a un cuarto, respectivamente, aunque el autor no publica cuantizaciones.
- GPU recomendadas: la evaluacion del autor se ejecuto en 4x A100. Para inferencia en bf16 son adecuadas A100 80 GB, H100 80 GB o configuraciones multi-GPU con A100 40 GB.
- GPU de consumo: no cabe en GPU de consumo de 24 GB en bf16; seria necesario cuantizar a 4 bits y disponer de al menos 24-32 GB de VRAM, sin garantia de soporte oficial.
- Opciones de despliegue: transformers (libreria declarada); al ser un checkpoint completo en safetensors de arquitectura qwen3_moe, es compatible en principio con vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF, aunque no se documenta soporte verificado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Precision multiturno (evaluacion del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-Math-GRPO-LoRA | 30,5 B (MoE) | 131.072 | 51,30 % | no disponible | Hugging Face |
| Qwen3-30B-A3B (base) | 30,5 B (MoE) | 131.072 (con YaRN) | 39,08 % | no disponible | Hugging Face |
| Otras alternativas de razonamiento matematico de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos publicados es frente al modelo base, que es el mismo checkpoint sin el ajuste GRPO. No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; antes de cualquier uso comercial debe verificarse la licencia del modelo base Qwen3-30B-A3B y la del checkpoint publicado.
- El ajuste se realizo durante solo 100 pasos con LoRA de rank 8; el alcance del cambio de comportamiento es limitado y puede degradar capacidades generales no relacionadas con matematicas.
- El modelo esta especializado en matematicas con herramienta Python; fuera de ese dominio su rendimiento no esta documentado y puede ser inferior al del modelo base.
- Riesgo de alucinacion en pasos intermedios de razonamiento y en llamadas a herramientas mal formadas; el bucle ReAct requiere un orquestador robusto que valide y limite la ejecucion de codigo.
- La evaluacion se limita a un conjunto de benchmarks matematicos (DAPO-Math, AIME 2025/2026, HMMT Feb 2026) con un numero de muestras concreto; no hay datos de MMLU, HumanEval ni evaluaciones multilingues.
- Idiomas soportados no documentados; no se garantiza un comportamiento correcto fuera del ingles en tareas matematicas.
- El modelo se presenta como linea base de un estudio en curso; su reproducibilidad y estabilidad en produccion no estan validadas mas alla de la evaluacion descrita.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zz1358m/Qwen3-30B-A3B-Math-GRPO-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
