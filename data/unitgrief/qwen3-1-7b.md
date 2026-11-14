# UnitGrief/Qwen3-1.7B

## Resumen

Qwen3-1.7B es un modelo de lenguaje causal denso de 1.700 millones de parametros publicado por el equipo Qwen (Alibaba) como parte de la familia Qwen3, la tercera generacion de su serie de modelos. El repositorio `UnitGrief/Qwen3-1.7B` es una redistribucion del checkpoint oficial `Qwen/Qwen3-1.7B`, derivado a su vez del modelo base `Qwen/Qwen3-1.7B-Base`. El modelo ocupa 2.031.739.904 parametros reales segun los pesos en safetensors (1.400 millones sin contar embeddings) y emplea una arquitectura transformer densa con 28 capas y atencion GQA (16 cabezas de consulta, 8 de clave-valor).

Su principal innovacion es el soporte de conmutacion entre modo "thinking" (razonamiento explicito, util para matematicas, logica y codigo) y modo "non-thinking" (dialogo general eficiente) dentro de un unico modelo, controlable mediante el parametro `enable_thinking` del chat template. Con 32.768 tokens de contexto, licencia Apache 2.0 y soporte declarado para mas de 100 idiomas, se posiciona como una opcion ligera para despliegue local y entornos con recursos limitados.

Es relevante ahora porque permite ejecutar razonamiento de tipo cadena de pensamiento en hardware de consumo, algo reservado hasta hace poco a modelos mucho mayores, y porque su integracion en transformers, vLLM, SGLang, llama.cpp y Ollama facilita su adopcion tanto en prototipado como en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (Qwen3) |
| Parametros totales | 2.031.739.904 (1.7B nominales; 1.4B sin embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No especificados en la informacion disponible (soporte generico via llama.cpp, Ollama, MLX-LM y KTransformers) |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 4,1 GB); conversiones GGUF/MLX disponibles a traves de herramientas de terceros |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 28 capas, atencion con Grouped Query Attention (16 cabezas de consulta y 8 de clave-valor) y 1.400 millones de parametros no pertenecientes a embeddings. Se entreno en dos fases: preentrenamiento sobre un corpus extenso y postentrenamiento con alineacion de preferencias humanas, segun indica la model card oficial de la familia Qwen3. La informacion proporcionada no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset.

La innovacion tecnica central es la coexistencia de dos modos de inferencia en un mismo checkpoint: el modo thinking genera contenido de razonamiento envuelto en bloques `<think>...</think>` antes de la respuesta final, mientras que el modo non-thinking responde directamente. La model card recomienda parametros de muestreo distintos por modo (Temperature=0.6, TopP=0.95, TopK=20 y MinP=0 para thinking) y advierte de que con presencia de repeticiones conviene fijar `presence_penalty` en 1.5. No se documentan en la informacion disponible innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno con alineacion de preferencias humanas.
- Razonamiento explicito en modo thinking para logica, matematicas y generacion de codigo.
- Modo non-thinking para respuestas rapidas y dialogos de proposito general.
- Capacidades de agente: integracion con herramientas externas y function calling en ambos modos.
- Razonamiento multi-paso orientado a tareas complejas.
- Soporte multilingue de mas de 100 idiomas y dialectos, con instrucciones y traduccion.
- Escritura creativa y role-playing con alineacion de preferencias mejorada.
- Seguimiento de instrucciones en contextos largos de hasta 32.768 tokens.
- No se documentan capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Razonamiento matematico asistido: en modo thinking el modelo descompone problemas paso a paso antes de dar la respuesta, lo que resulta util en herramientas educativas o de verificacion de calculos.
- Generacion de codigo en pipelines de CI/CD: con function calling y 32K de contexto puede revisar fragmentos extensos de codigo, proponer parches y ejecutar llamadas a herramientas de build o test.
- Agentes autonomos ligeros: su bajo numero de parametros permite desplegar multiples instancias en paralelo para tareas de orquestacion con llamadas a APIs, manteniendo coste de inferencia reducido.
- Atencion al cliente automatizada: el modo non-thinking ofrece respuestas rapidas en conversaciones multi-turno, y el contexto de 32.768 tokens permite mantener historiales largos sin truncar.
- Traduccion y localizacion multilingue: el soporte de mas de 100 idiomas lo hace adecuado para traduccion de documentacion o interfaces con requisitos de cobertura linguistica amplia.
- Despliegue en el borde o en portatiles: al caber en GPUs de consumo y en CPU via llama.cpp u Ollama, sirve para asistentes locales con privacidad de datos.
- Prototipado rapido de aplicaciones de razonamiento: permite validar flujos de chain-of-thought y agentes antes de escalar a modelos mayores, gracias a la compatibilidad con vLLM y SGLang.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4 GB para los pesos (2.031 millones de parametros) mas overhead de activaciones y cache KV, en torno a 5-6 GB en total.
- En cuantizacion de 8 bits: aproximadamente 2,5-3 GB de VRAM.
- En cuantizacion de 4 bits: aproximadamente 1,5-2 GB, apto para GPUs de consumo con 4 GB o mas.
- GPUs recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070) para FP16; A100 o H100 sobredimensionadas para este tamano, mas utiles para servir muchas instancias concurrentes.
- Cabe en GPU de consumo: si, en tarjetas con 4-8 GB segun cuantizacion, y en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (>=4.51.0), vLLM (>=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama, LM Studio, MLX-LM y KTransformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-1.7B (este) | 1,7B (2,03B reales) | 32.768 | Apache 2.0 | Modo thinking/non-thinking conmutable, 100+ idiomas |
| Qwen3-0.6B | 0,6B | 32.768 | Apache 2.0 | Misma familia, menor capacidad, menor huella de VRAM |
| Qwen3-4B | 4B | 32.768 | Apache 2.0 | Misma familia, mayor calidad a costa de mas recursos |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Generacion anterior, sin modo thinking nativo |

La informacion disponible no incluye comparativas de rendimiento medidas frente a estos modelos; la tabla recoge solo datos estructurales de la familia Qwen.

## Limitaciones y advertencias

- Riesgo de repeticiones infinitas en generacion: la propia model card recomienda ajustar los parametros de muestreo y fijar `presence_penalty` en 1.5 si aparecen bucles.
- Riesgo de alucinacion inherente a modelos de 1,7B, especialmente en tareas de conocimiento factual y razonamiento de multiples saltos.
- El modo thinking incrementa la latencia y el consumo de tokens de salida, lo que puede encarecer el despliegue si no se desactiva cuando no es necesario.
- Aunque declara soporte de mas de 100 idiomas, el rendimiento en idiomas de bajos recursos puede degradarse respecto al ingles y al chino.
- Requiere transformers >=4.51.0; versiones anteriores fallan con `KeyError: 'qwen3'`.
- La licencia Apache 2.0 permite uso comercial, pero el autor de esta redistribucion (`UnitGrief`) no ofrece garantias adicionales ni documentacion propia; conviene contrastar con el repositorio oficial de Qwen.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria de esta copia concreta.
- No se documentan sesgos especificos en la informacion proporcionada; se aplican los sesgos genericos de los corpus de preentrenamiento web.

## Enlaces

- Repositorio Hugging Face (redistribucion): https://huggingface.co/UnitGrief/Qwen3-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo oficial Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub: https://github.com/QwenLM/Qwen3
- Documentacion: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Paper de referencia (arXiv): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
