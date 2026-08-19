# wangyue114514/rwkv7-g1g-7.2b-hf

## Resumen

RWKV-7 G1G 7.2B es un modelo de lenguaje recurrente de 7.200 millones de parametros desarrollado por el proyecto RWKV, convertido al ecosistema Hugging Face Transformers mediante un adaptador mantenido por la comunidad. La arquitectura RWKV-7, denominada "Goose", combina las ventajas de las RNN (inferencia en tiempo lineal y espacio constante, sin cache de atencion) con la capacidad de paralelizacion durante el entrenamiento propia de los Transformers. Es un modelo 100 % libre de atencion, lo que elimina el cuello de botella del KV-cache y permite contextos practicamente infinitos.

Este checkpoint concreto, etiquetado como G1G, es un modelo base preentrenado (sin ajuste supervisado ni RL posterior) que incorpora datos de instruccion, chat y razonamiento en su corpus de preentrenamiento. Su relevancia actual radica en ser una alternativa eficiente a los Transformers para despliegue en produccion, con una huella de memoria constante independiente de la longitud del contexto. La conversion a Transformers facilita su uso con herramientas estandar del ecosistema, aunque requiere la instalacion de un paquete Python adicional para la implementacion optimizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (RNN recurrente sin atencion, causal) |
| Parametros totales | 7.199.141.888 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento indicado) |
| Tipos de cuantizacion | FP16 (pesos almacenados); cuantizaciones adicionales no especificadas |
| Idiomas soportados | no disponible (modelo base multilingue, idiomas no declarados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP16) |

## Arquitectura y entrenamiento

RWKV-7 es una arquitectura recurrente pura que elimina por completo el mecanismo de atencion. En lugar de ello, utiliza un estado oculto recurrente que se actualiza en cada paso temporal, lo que proporciona complejidad computacional lineal en la longitud del contexto y uso de memoria constante. Esta caracteristica lo hace especialmente adecuado para despliegue en entornos con recursos limitados o para procesamiento de secuencias muy largas, donde los Transformers sufren un crecimiento cuadratico.

El checkpoint G1G es un modelo base preentrenado sin ajuste supervisado (SFT) ni aprendizaje por refuerzo (RL), pero el corpus de preentrenamiento incluye una cantidad significativa de datos de instruccion, chat y razonamiento procedentes de Hugging Face. Segun el investigador principal del proyecto, el modelo muestra capacidad para autocorregir errores en tareas de razonamiento y resolver problemas matematicos modificados. El modelo tiene 32 capas, tamano oculto de 4096 y un vocabulario de 65.536 tokens. La implementacion optimizada se distribuye a traves del paquete Python `rwkv7-hf`, que contiene los operadores de computacion eficiente.

## Capacidades

- Generacion de texto autoregresiva con complejidad lineal en la longitud del contexto.
- Razonamiento logico y matematico, con capacidad de autocorreccion de errores durante la generacion.
- Comprension y generacion de codigo, como parte de las capacidades generales de un modelo base de 7B.
- Capacidades multilingues derivadas del corpus de preentrenamiento (idiomas concretos no declarados).
- Inferencia con memoria constante: sin KV-cache, el uso de VRAM no crece con la longitud del contexto.
- Soporte de contexto largo: aunque el contexto de entrenamiento es de 8.192 tokens, la arquitectura recurrente permite extrapolar a secuencias mas largas sin degradacion cuadratica.
- Integracion con el ecosistema Hugging Face Transformers mediante el adaptador `rwkv7-hf`.

## Casos de uso

- Despliegue en produccion con GPU de gama media: gracias a su arquitectura recurrente y a la ausencia de KV-cache, el modelo puede servir inferencia de contexto largo en GPUs con 8-12 GB de VRAM, donde un Transformer equivalente necesitaria mucho mas.
- Chatbots y asistentes conversacionales: la capacidad de mantener estado recurrente sin cache de atencion permite conversaciones multi-turno con coste de memoria constante.
- Procesamiento de documentos largos: analisis de contratos, articulos cientificos o informes extensos sin necesidad de truncamiento ni tecnicas de ventana deslizante.
- Generacion de codigo en entornos con recursos limitados: integrable en pipelines de CI/CD o editores locales mediante cuantizacion y ejecucion en CPU.
- Razonamiento y resolucion de problemas matematicos: el modelo base muestra capacidad de autocorreccion, util para aplicaciones educativas o de asistencia en calculo.
- Prototipado rapido con Transformers: al estar disponible como modelo Hugging Face, se puede integrar en pipelines existentes con cambios minimos en el codigo.
- Investigacion en arquitecturas recurrentes: punto de partida para estudiar las diferencias de comportamiento entre RNN y Transformers en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye mediciones de MMLU, HumanEval, GSM8K ni otros estandares. La unica referencia cualitativa disponible es la afirmacion del investigador principal de que el modelo puede autocorregir errores en razonamiento y resolver problemas matematicos modificados, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo almacenado en FP16 ocupa aproximadamente 14,4 GB en disco. En FP16, la inferencia requiere al menos 15 GB de VRAM, aunque con cuantizacion a 8 bits o 4 bits podria reducirse a 8-10 GB o 4-6 GB respectivamente (cuantizaciones no confirmadas oficialmente).
- GPU recomendadas: para FP16 completo, una NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB). Con cuantizacion, podria ejecutarse en RTX 3080/3090 (10-24 GB) o incluso en GPUs de 8 GB.
- En consumer GPU: si, con cuantizacion. En FP16 nativo, solo en GPUs de gama alta con 24 GB o mas.
- Opciones de despliegue: el modelo se integra con Transformers y puede servirse con vLLM, llama.cpp (si se genera GGUF) u Ollama. La implementacion nativa esta en el paquete `rwkv7-hf`.
- Latencia y throughput: no disponibles. La arquitectura recurrente sugiere menor latencia en generacion que un Transformer equivalente, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RWKV-7 G1G 7.2B | 7,2 B | 8.192 | RNN recurrente | Apache-2.0 | Hugging Face |
| RWKV-7 G0 7.2B | 7,2 B | 8.192 | RNN recurrente | Apache-2.0 | Hugging Face |
| Llama 3.1 8B | 8 B | 128.000 | Transformer | Llama 3.1 | Hugging Face |
| Mistral 7B | 7 B | 32.000 | Transformer | Apache-2.0 | Hugging Face |

La diferencia clave frente a los Transformers comparables es la complejidad de inferencia: mientras Llama y Mistral requieren KV-cache que crece linealmente con el contexto, RWKV-7 mantiene un estado de tamano fijo. Esto se traduce en menor uso de VRAM para contextos largos, a costa de un ecosistema de herramientas menos maduro y menos resultados de benchmarks publicados.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable y puede generar texto incoherente o irrelevante si no se le proporciona un prompt adecuado.
- Sesgos no documentados: al ser un modelo base entrenado con datos de internet, puede reflejar sesgos presentes en el corpus. No se han publicado evaluaciones de sesgo.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada con alta confianza.
- Idiomas no declarados: aunque el corpus incluye datos multilingues, no se especifica que idiomas estan bien soportados. El rendimiento en espanol no esta garantizado.
- Contexto de entrenamiento limitado: 8.192 tokens, aunque la arquitectura permite extrapolar, el rendimiento mas alla del contexto de entrenamiento no esta validado.
- Dependencia de paquete externo: el uso requiere instalar `rwkv7-hf==0.7.0`, que es mantenido por la comunidad y podria tener problemas de compatibilidad con versiones futuras de Transformers.
- Cuantizaciones no oficiales: no hay informacion sobre cuantizaciones GGUF o AWQ validadas, lo que limita las opciones de despliegue en CPU o GPUs de baja VRAM.
- Uso comercial: permitido bajo licencia Apache-2.0, pero el adaptador y el paquete de runtime tienen su propia licencia que debe verificarse.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/wangyue114514/rwkv7-g1g-7.2b-hf
- Repositorio original del checkpoint: https://huggingface.co/BlinkDL/rwkv7-g1
- Checkpoint fuente: https://huggingface.co/BlinkDL/rwkv7-g1/blob/41251fab280e3fba70a3fc49e843f3a034d49d33/rwkv7-g1g-7.2b-20260523-ctx8192.pth
- Paquete Python rwkv7-hf: https://pypi.org/project/rwkv7-hf/0.7.0/
- Repositorio del adaptador: https://github.com/rwkv-rs/hf-adapter
- Proyecto RWKV (web oficial): https://www.rwkv.com/
- Repositorio RWKV-LM en GitHub: https://github.com/BlinkDL/RWKV-LM
- Notas de investigacion del modelo G0: https://github.com/BlinkDL/RWKV-LM/blob/main/Research/rwkv7-g0-7.2b.md
- Articulo en Zhihu sobre el modelo G1g: https://zhuanlan.zhihu.com/p/2048762009949409869
