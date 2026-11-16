# tmthang86/Swift-1.5-Qwen3.8-27B-Uncensored-mlx-4bit

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-mlx-4bit es una compilacion cuantizada en formato MLX de 4 bits del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, que a su vez es la variante "uncensored" (abliterated) del fine-tune ukisai/Swift-1.5-Qwen3.8-27b, construido sobre el modelo base Qwen3.8-27B de Alibaba Cloud. El modelo resultante conserva la arquitectura del transformer denso de Qwen3.8-27B, con aproximadamente 26.900 millones de parametros, y ha sido convertido a MLX mediante `mlx-lm` 0.32.2 con cuantizacion uniforme de 4 bits (4,5 bits por peso), lo que reduce el peso en disco a unos 14 GB.

La relevancia de esta ficha es doble: por un lado, documenta una compilacion lista para ejecutarse en Apple Silicon (el autor la probo en un Mac con 48 GB de memoria unificada); por otro, advierte de que se trata de un modelo "sin censura" derivado de una tecnica de abliteration, con implicaciones eticas y legales que conviene conocer antes de desplegarlo. El autor declara explicitamente que no ha probado la entrada de vision ni la cabeza especulativa MTP del checkpoint original en esta compilacion MLX.

El modelo es de tipo "thinking": genera razonamiento interno antes de la respuesta final, lo que exige reservar un margen amplio de tokens de salida. La licencia es Swift Open License 1.0 para la contribucion de UkisAI y Apache 2.0 para el modelo base Qwen, con umbral de ingresos para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B), con cabeza MTP en el checkpoint original (no probada en esta compilacion MLX) |
| Parametros totales | 26.895.993.856 (~26,9 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | MLX 4-bit uniforme (4,5 bits por peso); pesos en safetensors MLX |
| Idiomas soportados | Ingles y multilingue (segun tags del repositorio); el autor realizo una prueba con una novela en vietnamita |
| Licencia | Swift Open License 1.0 (contribucion Swift, UkisAI) + Apache 2.0 (modelo base Qwen3.8-27B, Alibaba Cloud); uso comercial por encima del umbral de ingresos requiere licencia de UkisAI |
| Formato de pesos | MLX safetensors (cuantizacion MLX de 4 bits); tamano del repositorio 15,2 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de Qwen3.8-27B, sin mezcla de expertos. Sobre esa base, UkisAI aplico un fine-tune (Swift-1.5-Qwen3.8-27b) y posteriormente se genero una variante "uncensored" mediante abliteration, que elimina o atenua las direcciones de rechazo en el espacio de activaciones. El checkpoint intermedio ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP incorpora ademas una cabeza de decodificacion especulativa MTP (multi-token prediction), aunque el autor de esta compilacion MLX indica que no la ha probado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el fine-tune Swift. La unica modificacion documentada en esta compilacion es la cuantizacion a MLX 4 bits con `mlx-lm` 0.32.2, sin cambios en los pesos ni en la plantilla de chat.

## Capacidades

- Generacion de texto conversacional y de tipo "thinking": produce razonamiento interno antes de la respuesta final, por lo que requiere reservar tokens de salida suficientes.
- Razonamiento multi-paso y tareas de verificacion o correccion (el autor la probo como "continuity checker" sobre un capitulo de novela con errores sembrados).
- Capacidades multilingues: tags de idioma en ingles y multilingue; prueba real documentada en vietnamita.
- Modo "uncensored"/abliterated: menor tendencia a rechazar peticiones, lo que amplia el rango de respuestas pero incrementa el riesgo de contenido inapropiado.
- Entrada de vision: presente en el checkpoint original segun el autor, pero no probada en esta compilacion MLX.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Cabeza MTP (decodificacion especulativa): presente en el checkpoint original, no probada en esta compilacion.

## Casos de uso

- Verificacion de continuidad narrativa: el autor documenta su uso como comprobador de errores en un capitulo de novela (10 errores sembrados, 57 % ± 15 detectados, sin falsos positivos). Adecuado por su modo thinking y su capacidad de razonamiento sobre textos largos.
- Asistencia editorial y correccion de estilo: el modelo puede analizar borradores y senalar incoherencias o errores factuales dentro de un texto, gracias a su razonamiento multi-paso.
- Generacion creativa sin restricciones tematicas: la variante abliterated permite explorar generos o tonos que los modelos alineados rechazan, util en ficcion, guiones o role-play.
- Procesamiento de contenido multilingue: con soporte declarado multilingue y prueba en vietnamita, puede emplearse en tareas de traduccion o analisis de textos en varios idiomas.
- Prototipado local en Apple Silicon: al estar en MLX 4 bits (~14 GB), permite ejecutar un modelo de ~27B en un Mac con 48 GB de memoria unificada para experimentacion sin GPU dedicada.
- Investigacion sobre abliteration y alineacion: util para estudiar el efecto de la eliminacion de direcciones de rechazo en el comportamiento del modelo, comparando con la version alineada.
- Analisis de documentos largos: si el contexto del Qwen3.8-27B base es amplio (dato no confirmado en la informacion disponible), podria emplearse en resumen y extraccion sobre documentos extensos; conviene verificar la ventana real antes de production.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento cualitativo es la prueba del autor: 57 % ± 15 de errores detectados en un capitulo de novela con 10 errores sembrados, sin falsos positivos, con 3 de 15 llamadas devolviendo respuesta vacia tras un razonamiento largo, y aproximadamente 11 minutos por llamada en un Mac con 48 GB.

## Requisitos de hardware

- VRAM/memoria estimada: ~14 GB para los pesos en MLX 4 bits; el autor la ejecuto en un Apple Silicon con 48 GB de memoria unificada.
- GPU recomendadas: no disponible para CUDA; el formato MLX esta pensado para Apple Silicon (serie M). Para GPUs NVIDIA seria necesario reconvertir a otro formato (GGUF, safetensors estandar).
- Cabe en GPU de consumo: en Apple Silicon con al menos 16-24 GB de memoria unificada podria caber, aunque el autor uso 48 GB; en GPUs NVIDIA de consumo (RTX 4090, 24 GB) requeriria conversion a otro formato.
- Opciones de despliegue: `mlx-lm` >= 0.32.2 (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta compilacion.
- Latencia y throughput: el autor reporta ~11 minutos por llamada en un Mac de 48 GB con razonamiento largo; no hay datos de throughput en tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Uncensored-mlx-4bit (este) | ~26,9B | No disponible | MLX 4-bit | Swift Open License 1.0 + Apache 2.0 | Variante uncensored, solo MLX |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP | ~27B (estimado) | No disponible | safetensors | Swift Open License 1.0 + Apache 2.0 | Checkpoint original con MTP y vision |
| ukisai/Swift-1.5-Qwen3.8-27b | ~27B (estimado) | No disponible | safetensors | Swift Open License 1.0 | Fine-tune alineado, sin abliteration |
| Qwen3.8-27B (base) | ~27B (estimado) | No disponible | safetensors | Apache 2.0 | Modelo base de Alibaba Cloud |

Los datos de parametros y contexto de los modelos comparados no estan confirmados en la informacion proporcionada; se indican como estimaciones a partir de la nomenclatura.

## Limitaciones y advertencias

- Modelo "uncensored"/abliterated: la eliminacion de direcciones de rechazo aumenta el riesgo de generar contenido inapropiado, ofensivo o peligroso; no es apto para produccion orientada al publico sin filtros adicionales.
- Riesgo de alucinacion: como todo LLM, puede inventar datos; el autor observo respuestas vacias tras razonamientos largos (3 de 15 llamadas), lo que exige gestionar timeouts y reintentos.
- Latencia elevada: ~11 minutos por llamada en la prueba del autor con razonamiento largo; no apto para interacciones en tiempo real sin optimizacion.
- Capacidades no verificadas: vision y cabeza MTP no probadas en esta compilacion MLX; tool calling y agentes no documentados.
- Contexto: la longitud de ventana no se especifica en la informacion disponible; verificar antes de usarlo con documentos largos.
- Licencia: Swift Open License 1.0 impone un umbral de ingresos para uso comercial; por encima de ese umbral se requiere licencia de UkisAI. El autor declara que esta compilacion no esta hecha ni respaldada por UkisAI.
- Idiomas: aunque se declara multilingue, la unica prueba documentada es en vietnamita e ingles; el rendimiento en castellano no esta verificado.
- Formato: solo MLX; no hay versiones GGUF ni safetensors estandar en este repositorio, lo que limita el despliegue fuera de Apple Silicon.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un modelo abliterated, los sesgos del modelo base pueden quedar menos mitigados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tmthang86/Swift-1.5-Qwen3.8-27B-Uncensored-mlx-4bit
- Modelo base (checkpoint original): https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Fine-tune alineado de origen: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Licencia (Swift Open License 1.0): archivo `LICENSE` en el repositorio
- Licencia Apache 2.0: archivo `LICENSE-APACHE-2.0` en el repositorio
- Documentacion de `mlx-lm`: no disponible en la informacion proporcionada
- Paper o blog del modelo: no disponible en la informacion proporcionada
