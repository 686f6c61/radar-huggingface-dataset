# teacher57/qwen3-14b-tau-distilled-from-32b

## Resumen

teacher57/qwen3-14b-tau-distilled-from-32b es un adaptador LoRA (QLoRA) para el modelo base unsloth/Qwen3-14B-unsloth-bnb-4bit, desarrollado por el usuario teacher57. No se trata de un modelo completo, sino de un adaptador PEFT de rango 16 que se acopla sobre los pesos cuantizados a 4 bits de Qwen3-14B. Su proposito es mejorar el comportamiento del modelo en tareas de uso de herramientas dentro del benchmark tau-bench, en concreto en el dominio de retail.

El adaptador se entrena con destilacion de un profesor, un Qwen3-32B-AWQ que resolvio 86 de 114 tareas de entrenamiento de retail y genero 180 conversaciones validas. Esas conversaciones se convierten en datos de ajuste supervisado (SFT) y se usan para un unico epoch de QLoRA. La relevancia actual es acotada: es un experimento de destilacion sobre tareas de agentes con herramientas, y el propio autor advierte que la mejora obtenida es pequena y no estadisticamente significativa.

El modelo base Qwen3-14B es un transformer denso de 14 000 millones de parametros con ventana de contexto de 128 000 tokens, capacidad de razonamiento en modo thinking y soporte de tool calling, sobre el que este adaptador anade un sesgo especifico hacia el dominio retail de tau-bench. El repositorio ocupa 0,3 GB (solo los pesos del adaptador) y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer denso decoder-only (Qwen3-14B); r=16, alpha=16, aplicado a todas las proyecciones de atencion y MLP |
| Parametros totales | 14 000 millones en el modelo base; el adaptador ocupa 0,3 GB en disco |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Qwen3-14B; no especificada en la model card) |
| Tipos de cuantizacion | base en bitsandbytes 4-bit (bnb-4bit); adaptador en safetensors; GGUF no incluido |
| Idiomas soportados | no disponible en la informacion proporcionada; el modelo base Qwen3-14B soporta mas de 100 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3-14B, un transformer causal denso tipo decoder-only con mecanismos de atencion estandar y MLP, al que se le acopla un adaptador LoRA de rango 16 y alpha 16 sobre todas las proyecciones de atencion y MLP. El entrenamiento se realiza en QLoRA: el modelo base permanece cuantizado a 4 bits mediante bitsandbytes y solo se actualizan los pesos del adaptador. La configuracion de entrenamiento reportada es 1 epoch, 384 pasos, learning rate 5e-5, batch de 8, con una perdida que baja de 0,53 a 0,35.

Los datos de entrenamiento proceden de un proceso de destilacion. Un profesor Qwen3-32B-AWQ jugo 114 tareas duras de retail del conjunto de entrenamiento (hasta 4 muestras por tarea, deteniendo una tarea tras 2 aciertos) y resolvio 86. De esas partidas salieron 180 conversaciones validas, que se convirtieron en datos SFT con un ejemplo por turno del asistente, calculando la perdida unicamente sobre la completacion: el razonamiento `<think>`, la llamada a herramienta o la respuesta y el token `<|im_end|>`. El dataset esta publicado como teacher57/tau-retail-distillation. No se menciona RLHF ni DPO; se trata exclusivamente de ajuste supervisado sobre trayectorias del profesor.

## Capacidades

- Generacion de texto y razonamiento dentro del modo thinking propio de Qwen3.
- Uso de herramientas (tool calling) orientado al entorno tau-bench, con parser de herramientas tipo hermes.
- Comportamiento de agente multi-turno en el dominio retail: consultas de pedidos, cambios, devoluciones y operaciones combinadas.
- Razonamiento multi-paso para completar tareas que requieren varias llamadas a herramientas encadenadas.
- Capacidades multilingues heredadas del modelo base (no verificadas de forma especifica para el adaptador).
- Capacidad de razonamiento explicito antes de la accion mediante el bloque `<think>`.
- No se documentan capacidades de vision ni de audio.

## Casos de uso

- Investigacion en destilacion de agentes: reproducir el pipeline de destilacion profesor-alumno sobre tau-bench retail y comparar el efecto con mediciones repetidas.
- Evaluacion de uso de herramientas en retail: servir el adaptador con vLLM y medir el rendimiento en las 115 tareas del conjunto de test de retail.
- Punto de partida para ajuste adicional: al ser un adaptador PEFT, se puede combinar con otros adaptadores o seguir entrenando sobre dominios concretos.
- Estudio de overfitting y significancia estadistica: el propio autor plantea el experimento como caso de analisis de deriva entre pods y de intervalos de confianza.
- Banco de pruebas de infraestructura de inferencia: validacion de LoRA multiple en vLLM (`--enable-lora`, `--max-loras 3`, `--max-lora-rank 16`) con parsers de razonamiento y herramientas.
- Base para experimentos de agentes con cliente simulado: el pipeline usa GPT-4o como cliente simulado, util para montar entornos de evaluacion controlados.
- Generacion de trayectorias sinteticas de uso de herramientas en retail a partir del comportamiento aprendido del profesor.

## Benchmarks y rendimiento

| retail test, 115 tareas (4 intentos, temperatura 0.7, GPT-4o como cliente simulado) | Este adaptador | Adaptador inicial, misma maquina | Adaptador inicial, test anterior (2 intentos, otra maquina) |
|---|---|---|---|
| pass^1 | 45,7% ± 3,4 | 41,7% ± 3,4 | 37,8% ± 3,7 |
| pass^2 | 29,9% | 27,1% | 21,7% |
| pass^3 | 22,0% | 20,2% | n/a |
| pass^4 | 16,5% | 16,5% | n/a |

Desglose por tipo de tarea (pass^1): tareas de tipo combo (64) 34,8% frente a 33,6%; otras tareas (51) 59,3% frente a 52,0%. Este desglose se hizo despues de ver los resultados, por lo que el autor lo califica como hipotesis y no como hallazgo. La mejora de +3,9 puntos frente a la re-ejecucion en la misma maquina tiene un intervalo del 95% de -1,1 a +8,9 y un p-valor de permutacion de 0,15, es decir, no es estadisticamente significativa. No existe resultado en el dominio de airline (el test se detuvo tras 10 rollouts).

## Requisitos de hardware

- El adaptador por si solo ocupa 0,3 GB; el coste real esta en el modelo base Qwen3-14B.
- Inferencia en 4 bits (bnb-4bit): aproximadamente 10-11 GB de VRAM, suficiente para una GPU de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Inferencia del base en bf16/fp16: aproximadamente 28 GB de VRAM, lo que descarta GPUs de consumo de 24 GB y apunta a A100 40/80 GB, H100 o L40S.
- Despliegue con vLLM 0.11.0 usando `--enable-lora --max-loras 3 --max-lora-rank 16`, con parser de herramientas `hermes` y parser de razonamiento `qwen3` (esta es la configuracion reportada por el autor para la evaluacion).
- Despliegue con transformers y peft mediante `PeftModel.from_pretrained` sobre el modelo base.
- Carga mediante llama.cpp/Ollama: no disponible directamente, ya que no se publican pesos GGUF y habria que convertir el modelo fusionado.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento retail (pass^1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teacher57/qwen3-14b-tau-distilled-from-32b | 14B + LoRA r=16 | 128 000 tokens | 45,7% ± 3,4 | apache-2.0 | HuggingFace (0 descargas) |
| Adaptador inicial (sin destilar) | 14B + LoRA | 128 000 tokens | 41,7% ± 3,4 (misma maquina) | apache-2.0 | no especificado |
| Qwen3-32B-AWQ (profesor) | 32B | 128 000 tokens | resuelve 86 de 114 tareas de entrenamiento | apache-2.0 | HuggingFace |
| Qwen3-14B base | 14B | 128 000 tokens | no disponible | apache-2.0 | HuggingFace |

La comparacion directa relevante es contra el adaptador inicial re-ejecutado en la misma maquina, ya que es el unico contraste con control de condiciones. El profesor de 32B duplica los parametros y sirve como referencia de techo, pero no hay una evaluacion de tau-bench retail publicada para el base sin ajustar en esta model card.

## Limitaciones y advertencias

- La mejora reportada es pequena y no estadisticamente significativa (+3,9 puntos, intervalo del 95% de -1,1 a +8,9, p=0,15).
- pass^4 es identico entre el adaptador y el punto de partida (16,5%), lo que sugiere que la mejora no se sostiene en intentos repetidos.
- Dominio limitado: solo retail. No hay resultados en el dominio airline (test detenido tras 10 rollouts).
- Entrenamiento y evaluacion realizados con GPT-4o como cliente simulado; el comportamiento con usuarios reales no esta medido.
- Los datos proceden de un unico profesor y un unico benchmark, por lo que no hay evidencia de generalizacion fuera de tau-bench retail.
- Sesgos conocidos: no se documentan de forma especifica; el adaptador hereda los sesgos del modelo base y los del profesor.
- Riesgo de alucinacion: no medido de forma especifica en la model card; aplican los riesgos habituales de un modelo de 14B en tareas de agente.
- Deriva entre pods: el propio autor advierte que parte de la diferencia aparente frente a mediciones anteriores (37,8% en otra maquina) puede deberse a variacion de infraestructura y no al adaptador.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos del profesor por separado.
- Almacenamiento: el repositorio solo contiene el adaptador; es imprescindible descargar el modelo base para su uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/teacher57/qwen3-14b-tau-distilled-from-32b
- Dataset de destilacion: https://huggingface.co/datasets/teacher57/tau-retail-distillation
- Modelo base: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Codigo y memoria del experimento (rama distillation-experiment): https://github.com/teacher57/qwen3-14b-tau-train-overfitting/tree/distillation-experiment
