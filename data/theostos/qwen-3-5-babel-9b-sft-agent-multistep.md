# theostos/qwen-3.5-babel-9b-sft-agent-multistep

## Resumen
qwen-3.5-babel-9b-sft-agent-multistep es un ajuste fino supervisado (SFT) de Qwen/Qwen3.5-9B, desarrollado por el usuario theostos, orientado a la reconstruccion de pruebas por tacticas en los asistentes de demostracion Lean 4 y Rocq a partir de terminos de prueba. El modelo no solo traduce un termino de prueba a tacticas, sino que adapta cada bloque de tacticas al estado real de la prueba (hipotesis, objetivos y respuestas del verificador), lo que lo convierte en un componente de agente multi-turno para entornos de verificacion formal.

El modelo tiene 8.953.803.264 parametros (aproximadamente 9B), es un transformer causal de texto (`Qwen3_5ForCausalLM`) sin codificador de vision, y se distribuye en safetensors BF16 completos con tokenizer, plantilla de chat nativa y configuracion de generacion. Su relevancia actual radica en que aborda una tarea poco cubierta por los modelos generalistas: la interaccion fiable con verificadores formales mediante tool calling estructurado, con trazas reales de verificador en el entrenamiento.

La licencia es Apache 2.0, heredada del modelo base, y el autor declara explicitamente que no reclama mejoras en la resolucion de teoremas con estos pesos, ya que la evaluacion es independiente de la perdida de entrenamiento. La release revisada sustituye a los pesos del 3 de noviembre de 2026 en el mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de texto (`Qwen3_5ForCausalLM`), sin vision |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso un limite de secuencia de 12.288 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 completos), tokenizer, chat template y generation config |

## Arquitectura y entrenamiento
El modelo es un transformer causal de texto de la familia Qwen3.5, sin codificador de vision y sin adaptadores: se publican los pesos completos en BF16. No requiere codigo de modelo personalizado ni instalacion de NeMo para inferencia; se carga con Transformers estandar. La validacion de publicacion exige pesos finitos, carga sin claves faltantes, inesperadas o desajustadas, y un forward pass finito en CUDA, aunque estas comprobaciones no miden la calidad de las pruebas generadas.

El entrenamiento fue un SFT de parametros completos en BF16 con 795 demostraciones (348 Lean y 447 Rocq), 5.212 llamadas de tactica con respuestas reales de verificador registradas y 789 ejemplos con multiples llamadas. Se realizaron cinco epocas y 125 actualizaciones del optimizador, con checkpoint final `epoch_4_step_124`, limite de secuencia de 12.288, batch global de 32, learning rate de 1e-5, 50 actualizaciones de warmup y un horizonte de schedule coseno de 320 actualizaciones. La perdida se aplica al razonamiento del asistente y a las llamadas de herramienta; las respuestas del verificador y el texto de usuario/sistema son solo contexto. De las 807 entradas fuente, 12 fueron puestas en cuarentena por problemas semanticos o de procedencia y se editaron 3.442 turnos de razonamiento en 787 entradas retenidas. El replay de Lean uso Mathlib con Lean v4.22.0-rc4; el de Rocq uso un entorno CORN 8.20.0 reconstruido porque el checkout original no estaba disponible. El corpus contiene principalmente demostraciones exitosas, con muy poca cobertura de rechazo y recuperacion.

## Capacidades
- Reconstruccion de pruebas por tacticas en Lean 4 y Rocq a partir de terminos de prueba.
- Adaptacion de cada bloque de tacticas al estado actual de la prueba: hipotesis, objetivos y respuestas del verificador.
- Tool calling estructurado mediante la funcion `submit_tactic`, con argumento de tactica sin declaraciones de teorema ni bloques Markdown.
- Razonamiento multi-turno y multi-paso: el host debe ejecutar la tactica en el verificador y devolver la respuesta real antes de generar el siguiente turno.
- Modo thinking nativo (`enable_thinking=True`) en la plantilla de chat.
- Generacion de texto exclusivamente: no tiene vision, audio ni otras modalidades.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Automatizacion de pruebas en Lean 4: el modelo recibe un termino de prueba y el estado inicial (hipotesis y objetivo) y propone bloques de tactica sucesivos que el host ejecuta en Lean con Mathlib, manteniendo la indentacion entre llamadas.
- Automatizacion de pruebas en Rocq: mismo flujo con el verificador Rocq, usando el entorno CORN 8.20.0 empleado en el replay de entrenamiento.
- Agente de reparacion de pruebas: ante un bloque rechazado, el host hace rollback y devuelve la respuesta del verificador, y el modelo adapta el siguiente bloque al estado real de la prueba.
- Asistencia a investigadores en formalizacion: dado un termino de prueba existente, el modelo genera una version por tacticas legible y paso a paso, util para documentar o revisar demostraciones.
- Integracion en pipelines de CI para verificacion formal: el modelo actua como generador de tacticas y el verificador como oraculo, de modo que solo se aceptan bloques que compilan.
- Prototipado de entornos de agentes con tool calling: sirve como referencia para implementar el bucle generar-ejecutar-observar con el formato nativo de llamadas de herramienta de Qwen.
- Generacion de trazas de razonamiento sobre estructura de terminos de prueba: los turnos de razonamiento editados explican la estructura del termino y razonan desde el estado actual, lo que puede usarse para analisis o como datos de partida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no reclama mejoras en la resolucion de teoremas con estos pesos y que la evaluacion es independiente de la perdida de entrenamiento.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 18 GB solo para pesos (9B parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para secuencias largas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con `device_map="auto"`.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 24 GB con BF16; en GPUs de 16 GB o menos seria necesaria cuantizacion, aunque no se documentan pesos cuantizados en el repositorio.
- Opciones de despliegue: Transformers (validado con la version 5.5.0) junto con Accelerate; no se documentan recetas para vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-3.5-babel-9b-sft-agent-multistep | 8.953.803.264 | no disponible (entrenado con cap de 12.288) | Lean 4 y Rocq, tool calling multi-turno | Apache 2.0 | Hugging Face, safetensors BF16 |
| Qwen/Qwen3.5-9B (base) | aproximadamente 9B | no disponible | Proposito general, texto | Apache 2.0 | Hugging Face |
| Alternativas especializadas en Lean/Rocq | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables especializados en esta tarea dentro de la informacion proporcionada, por lo que la comparativa cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias
- El autor no reclama mejora en la resolucion de teoremas; las pruebas generadas requieren verificacion real y no deben darse por validas sin comprobacion.
- El razonamiento en lenguaje natural no esta certificado formalmente.
- El corpus contiene principalmente demostraciones exitosas, con muy poca cobertura de rechazo y recuperacion, lo que puede limitar la robustez ante errores del verificador.
- El replay de Rocq uso un entorno CORN 8.20.0 reconstruido, no el checkout original, lo que puede introducir diferencias respecto a entornos reales.
- El modelo es solo texto: no tiene vision ni audio.
- Idiomas soportados no disponibles; la mayor parte del entrenamiento parece centrada en la tarea formal, no en conversacion general multilingue.
- Riesgo de alucinacion en respuestas del verificador: el host nunca debe fabricar respuestas de verificador ni confiar en el modelo para simularlas.
- El host debe gestionar correctamente el estado de la prueba: un unico estado entre llamadas, preservar la indentacion de Lean y hacer rollback de bloques rechazados.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces
- [Hugging Face: theostos/qwen-3.5-babel-9b-sft-agent-multistep](https://huggingface.co/theostos/qwen-3.5-babel-9b-sft-agent-multistep)
- [Modelo base: Qwen/Qwen3.5-9B](https://huggingface.co/Qwen/Qwen3.5-9B)
- [Repositorio Babel-Formal](https://github.com/theostos/babel-formal)
