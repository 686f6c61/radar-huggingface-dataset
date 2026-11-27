# THUSI-Lab/GameScaling-9B-S3

## Resumen
GameScaling-9B-S3 es un modelo multimodal de tipo image-text-to-text desarrollado por THUSI-Lab en colaboración con el equipo de I+D de Honkai AI de miHoYo, la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B, con 9.409.813.744 parámetros, orientado a la actuación de agentes encarnados (embodied agents) en entornos de videojuegos mediante control de teclado y ratón.

El modelo forma parte de la familia GameScaling, que incluye variantes de 0,8B, 2B, 9B y 27B en dos etapas de entrenamiento (S1 y S3). Su propósito es investigar el escalado de agentes que perciben el estado visual de un videojuego y emiten acciones discretas de teclado y ratón, un problema relevante para la investigación en agentes autónomos y en modelos fundacionales aplicados a entornos interactivos.

La relevancia actual radica en que aborda el entrenamiento continuado (continued pre-training) sobre dominios de interacción dinámica, donde los modelos de lenguaje convencionales no disponen de datos de acción motora. La licencia Apache 2.0 facilita su uso tanto en investigación como en desarrollo comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5 (image-text-to-text) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se asume compatibilidad con cuantizacion estandar, no confirmada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 18,8 GB) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal capaz de procesar entradas de imagen y texto, y se somete a un proceso de continued pre-training orientado a agentes encarnados en videojuegos. La model card describe la contribucion como "Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds", es decir, entrenamiento continuado sobre datos de interaccion en multiples mundos virtuales. La variante S3 corresponde a una de las etapas de escalado de la familia GameScaling, que incluye tambien S1.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones tecnicas concretas como decodificacion especulativa o attention linear. El modelo se distribuye con la etiqueta `endpoints_compatible` y esta pensado para su uso con la libreria transformers.

## Capacidades
- Percepcion visual de entornos de videojuego a partir de capturas de pantalla (image-text-to-text).
- Generacion de acciones de teclado y raton (keyboard-mouse) para controlar agentes en entornos interactivos.
- Razonamiento multimodal combinando observacion visual y contexto textual.
- Actuacion como agente encarnado en multiples mundos virtuales (embodied-agent).
- Conversacion multimodal en ingles (etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes multi-paso: orientado a agentes, aunque el detalle de planificacion multi-paso no se especifica.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Modo thinking, vision adicional, audio: no disponible salvo la entrada de imagen descrita.

## Casos de uso
- Investigacion en agentes encarnados: el modelo permite estudiar como el escalado de parametros y de datos de interaccion afecta a la capacidad de un agente para operar en videojuegos, sirviendo como referencia en experimentos academicos.
- Automatizacion de pruebas de videojuegos: un agente basado en el modelo puede generar secuencias de teclado y raton para recorrer escenarios y detectar fallos de jugabilidad, aprovechando su percepcion visual del estado del juego.
- Benchmarking de agentes multimodales: al formar parte de una familia de tamanos (0,8B a 27B), permite comparar el rendimiento de agentes a distintas escalas bajo una misma metodologia.
- Desarrollo de asistentes de juego: el modelo puede interpretar la pantalla y sugerir o ejecutar acciones, util para prototipos de ayuda contextual en titulos.
- Investigacion en control multimodal: sirve como base para estudiar politicas de accion que combinan vision y lenguaje en entornos dinamicos.
- Fine-tuning especifico de dominio: gracias a la licencia Apache 2.0 y al formato safetensors, puede adaptarse a otros juegos o tareas de control mediante ajuste fino supervisado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 9,4B parametros, en FP16 se requieren aproximadamente 19 GB de VRAM; en cuantizacion de 8 bits, unos 10 GB; en 4 bits, unos 6 GB (estimaciones estandar, no confirmadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o cuantizacion de 8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas en cuantizacion de 8 bits, y en tarjetas de 8-12 GB con cuantizacion de 4 bits, siempre que se disponga de pesos GGUF (no confirmados en el repo).
- Opciones de despliegue: transformers (soporte nativo declarado); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GameScaling-9B-S3 | 9,4B | no disponible | Apache 2.0 | Agente encarnado en videojuegos (image-text-to-text) |
| Qwen3.5-9B (base) | ~9B | no disponible | no disponible | Modelo multimodal generalista |
| GameScaling-2B-S3 | ~2B | no disponible | Apache 2.0 | Variante menor de la misma familia |
| GameScaling-27B-S1 | ~27B | no disponible | Apache 2.0 | Variante mayor de la misma familia |

La comparacion con modelos de proposito general no resulta directa, ya que GameScaling esta especializado en control de agentes en videojuegos. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre datos de videojuegos, puede heredar sesgos de esos entornos.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje; en el contexto de acciones de juego puede traducirse en acciones invalidas o no ejecutables.
- Limitaciones de contexto e idioma: el modelo solo declara soporte de ingles; la longitud de contexto no se especifica.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y de los datos de entrenamiento.
- Caveats para produccion: no se han publicado benchmarks ni detalles de entrenamiento; la ausencia de pesos cuantizados confirmados y de soporte verificado en motores de inferencia como vLLM limita su despliegue directo en produccion sin validacion previa.

## Enlaces
- Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Daily Paper: https://huggingface.co/papers/2610.28698
- GitHub: https://github.com/THUSI-Lab/GameScaling
- Project page: https://gamescaling.github.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variantes de la familia: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1, https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3, https://huggingface.co/THUSI-Lab/GameScaling-2B-S1, https://huggingface.co/THUSI-Lab/GameScaling-2B-S3, https://huggingface.co/THUSI-Lab/GameScaling-9B-S1, https://huggingface.co/THUSI-Lab/GameScaling-27B-S1
