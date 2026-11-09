# vrfai/cosmos3-policy-libero-gguf

## Resumen

Cosmos3 Policy - LIBERO es un modelo de accion-mundo (world-action model) orientado a robótica, convertido a formato GGUF para su inferencia con vla.cpp, un motor ligero en C++ construido sobre llama.cpp. El modelo original es `lerobot/Cosmos3-Edge-Policy-LIBERO`, y esta conversión la publica el usuario vrfai. Su función es generar chunks de acciones de 16 pasos a partir de dos vistas de cámara (tercera persona y muñeca) y una instrucción en lenguaje natural, lo que lo sitúa en la categoría de modelos visión-lenguaje-acción (VLA).

La arquitectura es un backbone Mixture-of-Transformers de 28 capas (Nemotron 3 Dense) con dos flujos: uno de comprensión sobre el prompt y otro de generación sobre parches de vídeo y acciones. El modelo desruidifica conjuntamente 4 fotogramas latentes de vídeo y el chunk de acciones, condicionado por el latente del VAE Wan2.2 del fotograma actual, empleando 30 pasos de UniPC. Cuenta con 3.146.684.510 parámetros totales y un repositorio de 6,3 GB.

Es relevante porque permite ejecutar un modelo VLA de forma local y eficiente en hardware de consumo mediante GGUF y vla.cpp, con una latencia de 4,3 s por chunk en una RTX 3060, y porque reproduce con alta fidelidad la política original de lerobot en bf16 (error escalado de 2e-3 a 2e-2).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers de 28 capas (Nemotron 3 Dense); flujo de comprensión sobre el prompt y flujo de generación sobre parches de vídeo y acciones |
| Parámetros totales | 3.146.684.510 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF en bf16 (pesos GEMM en bf16, normas en f32) |
| Idiomas soportados | no disponible (las instrucciones deben ser ASCII) |
| Licencia | OpenMDW-1.1 (pesos); MIT (herramientas de conversión y motor vla.cpp) |
| Formato de pesos | GGUF |
| Pasos de muestreo | 30 pasos UniPC |
| Chunk de acciones | 16 pasos |
| Fotogramas latentes desruidificados | 4 |
| VAE | Wan2.2 VAE (latente del fotograma actual) |
| Entradas | Dos vistas de imagen (tercera persona y muñeca) e instrucción de texto ASCII |

## Arquitectura y entrenamiento

El modelo es un world-action model construido sobre un backbone Mixture-of-Transformers de 28 capas basado en Nemotron 3 Dense. La arquitectura separa dos flujos: un flujo de comprensión que procesa el prompt de texto y un flujo de generación que opera sobre parches de vídeo y acciones. El proceso de inferencia desruidifica de forma conjunta 4 fotogramas latentes de vídeo y un chunk de 16 acciones, condicionado por el latente del VAE Wan2.2 correspondiente al fotograma actual, mediante 30 pasos del sampler UniPC.

El GGUF resultante de la conversión incluye todo lo necesario para la inferencia: el codificador del VAE, ambos flujos del backbone, las proyecciones de acciones del dominio LIBERO, las estadísticas latentes, los cuantiles de acciones y el tokenizador. Los pesos GEMM se almacenan en bf16 y las normas en f32. La conversión se realizó con el script `scripts/convert_cosmos3_policy_to_gguf.py`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas: produce chunks de 16 pasos a partir de dos vistas de cámara y una instrucción textual.
- Modelado de mundo: desruidifica conjuntamente fotogramas latentes de vídeo y acciones, lo que permite anticipar la evolución visual de la escena.
- Comprensión de instrucciones en lenguaje natural: el flujo de comprensión procesa el prompt para condicionar la generación de acciones.
- Control específico del dominio LIBERO: incluye proyecciones de acciones y decodificación del chunk rot6d a comandos LIBERO mediante el flag `--libero`.
- Inferencia local en C++: integración con vla.cpp sobre llama.cpp, con soporte de CLI y de servidor (build CUDA).
- Reproducibilidad numérica: coincidencia con la política original de lerobot en bf16 con un error escalado de 2e-3 a 2e-2 sobre el chunk de acciones.
- No se ha documentado soporte de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento extendido.

## Casos de uso

- Manipulación robótica en simulación LIBERO: el modelo se usa para resolver tareas como encender un fogón o manipular objetos en los entornos LIBERO Spatial y similares, recibiendo las vistas de tercera persona y muñeca y devolviendo comandos de acción decodificados con `--libero`.
- Evaluación de políticas VLA en local: investigadores pueden ejecutar el servidor vla.cpp con soporte CUDA y lanzar el cliente de simulación (`run_sim_client_direct.py`) para medir el rendimiento de la política en episodios concretos sin depender de infraestructura en la nube.
- Prototipado en hardware de consumo: con 6,3 GB de pesos en bf16 y 4,3 s por chunk en una RTX 3060, es viable iterar sobre políticas robóticas en estaciones de trabajo con GPU de gama media.
- Integración en pipelines C++ embebidos: al estar construido sobre llama.cpp, puede incorporarse en sistemas de control robótico escritos en C++ que requieran inferencia local de baja dependencia.
- Validación de conversiones GGUF: sirve como referencia para verificar que una conversión GGUF reproduce fielmente la política original, comparando el error escalado del chunk de acciones.
- Despliegue como servicio de inferencia: el servidor `vla-server` expone la política por ZeroMQ (`tcp://*:5566`), lo que permite conectar varios clientes de simulación o de control.
- Investigación en world-action models: el modelo permite estudiar la generación conjunta de vídeo latente y acciones en tareas de manipulación con instrucciones en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de fidelidad de la conversión y de latencia:

| Métrica | Valor |
|---|---|
| Error escalado del chunk de acciones frente a lerobot en bf16 | 2e-3 a 2e-2 |
| Latencia por chunk (RTX 3060) | 4,3 s |
| Pasos UniPC | 30 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 6,3 GB en bf16; se requiere al menos esa cantidad de VRAM más el overhead del motor y del VAE. No se dispone de cifras oficiales de VRAM mínima.
- GPU recomendadas: RTX 3060 (validada por el autor con 4,3 s por chunk); GPUs con 8 GB o más de VRAM en general. Para despliegue con CUDA se requiere la build `build-cuda`.
- Cabe en GPU de consumo: sí, al menos en RTX 3060 según la latencia reportada por el autor.
- Opciones de despliegue: vla.cpp (CLI `vla-cli` y servidor `vla-server` sobre ZeroMQ), construido sobre llama.cpp. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 4,3 s por chunk de 16 acciones en RTX 3060; no se dispone de datos de throughput para otras GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vrfai/cosmos3-policy-libero-gguf | 3.146.684.510 | no disponible | GGUF | OpenMDW-1.1 | Conversión para vla.cpp; 4,3 s/chunk en RTX 3060 |
| lerobot/Cosmos3-Edge-Policy-LIBERO | no disponible | no disponible | no disponible | OpenMDW-1.1 | Modelo base original en bf16 para lerobot |
| Otros modelos VLA de robótica | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible.
- Riesgo de alucinación: no evaluado; al tratarse de un modelo de acciones, el riesgo se traduce en comandos de manipulación incorrectos o no ejecutables.
- Restricción de idioma: la instrucción debe estar en ASCII, lo que excluye caracteres acentuados y no latinos; no se documentan idiomas soportados.
- Dominio limitado: las proyecciones de acciones y la decodificación están especializadas en el dominio LIBERO, por lo que la generalización a otros entornos robóticos no está garantizada.
- Licencia: los pesos siguen OpenMDW-1.1, que debe revisarse antes de uso comercial; las herramientas de conversión y el motor vla.cpp son MIT.
- Fidelidad de la conversión: el error escalado frente a la política original es de 2e-3 a 2e-2, no una coincidencia exacta.
- Dependencia de motor: la inferencia requiere vla.cpp; no hay soporte documentado para otros runtimes.
- Datos incompletos: no se dispone de información sobre contexto, dataset de entrenamiento ni benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vrfai/cosmos3-policy-libero-gguf
- Modelo base: https://huggingface.co/lerobot/Cosmos3-Edge-Policy-LIBERO
- Motor vla.cpp: https://github.com/VinRobotics/vla.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
