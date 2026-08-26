# yukimakura/Unsloth-Ornith-1.5-35B-A3B-UD-Q3_K_XL-GGUF-3GB-split

## Resumen

Este repositorio contiene una versión cuantizada y dividida en fragmentos (shards) del modelo **Ornith-1.5-35B-A3B**, un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Ornith AI, especializado en tareas de codificación agéntica. El archivo GGUF original, generado por el usuario `peculiar-ragdoll` mediante la técnica de cuantización dinámica de Unsloth (UD) con imatrix, ha sido re-dividido por `yukimakura` en seis fragmentos de máximo 3 GB cada uno para facilitar su descarga y uso con `llama.cpp`. La cuantización es de tipo Q3_K_XL, lo que reduce el tamaño del modelo de aproximadamente 34,66 mil millones de parámetros a unos 16,8 GB en disco, manteniendo una calidad razonable para su tamaño.

El modelo original Ornith-1.5-35B-A3B es un MoE con 35B parámetros totales y 3B activos por token, basado en la arquitectura Qwen2.5-MoE (según el tag `qwen35moe`). Soporta una ventana de contexto de 262.144 tokens (256K) y está diseñado para tareas de generación de código, razonamiento multi-paso y uso como agente autónomo. La licencia MIT permite uso comercial sin restricciones. Este repositorio es un espejo no oficial de la cuantización, sin afiliación con Unsloth, y no incluye proyector de visión (mmproj), por lo que es exclusivamente un modelo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), derivada de Qwen2.5-MoE (tag `qwen35moe`) |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q3_K_XL (Unsloth Dynamic con imatrix) |
| Idiomas soportados | no disponible (el modelo base Qwen es multilingue, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | GGUF (dividido en 6 shards de maximo 3 GB) |

## Arquitectura y entrenamiento

El modelo base **Ornith-1.5-35B-A3B** es un transformer de tipo MoE con 35B parámetros totales y 3B activos por token, lo que permite una inferencia más eficiente que un modelo denso de tamaño equivalente. La arquitectura sigue el diseño de Qwen2.5-MoE, con atención de ventana deslizante y capas de expertos. Según la información pública de Ornith AI, el modelo se ha entrenado con técnicas de auto-mejora (self-improvement) y scaffolding, orientado a tareas de codificación agéntica, es decir, capaz de planificar y ejecutar múltiples pasos para resolver problemas de programación. No se dispone de detalles específicos sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO) en la información proporcionada.

La cuantización Q3_K_XL aplicada por `peculiar-ragdoll` utiliza el método Unsloth Dynamic (UD) con imatrix, que optimiza la asignación de bits según la importancia de cada capa. El archivo resultante de 16.845.510.880 bytes se ha dividido en seis fragmentos de máximo 3 GB mediante `llama-gguf-split`, sin pérdida de datos (los tensores son bit a bit idénticos al archivo original). La división es transparente para `llama.cpp`, que carga automáticamente todos los fragmentos al especificar el primero.

## Capacidades

- Generación de código y autocompletado en múltiples lenguajes de programación.
- Razonamiento multi-paso y planificación de tareas complejas, especialmente en entornos de codificación agéntica.
- Soporte de tool calling / function calling, según la interfaz compatible con OpenAI del modelo original.
- Capacidad de mantener conversaciones multi-turno (tag `conversational`).
- Ventana de contexto de 256K tokens, adecuada para procesar repositorios completos o documentación extensa.
- Capacidades multilingues probables (heredadas de la base Qwen), aunque no confirmadas en la documentación.
- No incluye capacidades de vision ni audio (es exclusivamente texto).

## Casos de uso

- **Asistente de programacion en IDE**: el modelo puede integrarse en editores como VS Code o Neovim para ofrecer autocompletado, generacion de funciones y explicacion de codigo, aprovechando su contexto de 256K para analizar archivos completos.
- **Agente de codificacion autonomo**: gracias a su soporte de tool calling y razonamiento multi-paso, puede ejecutar tareas como crear un proyecto desde cero, modificar multiples archivos o ejecutar tests, siguiendo instrucciones de alto nivel.
- **Revision de codigo automatizada**: con su contexto largo, puede analizar pull requests completos, detectar errores, sugerir mejoras y generar comentarios de revision.
- **Generacion de documentacion tecnica**: puede leer el codigo fuente de un repositorio y generar documentacion, comentarios o guias de uso.
- **Soporte tecnico y atencion al cliente**: al ser un modelo conversacional con contexto largo, puede gestionar consultas de usuarios sobre APIs, errores de programacion o configuracion de entornos.
- **Educacion y formacion en programacion**: puede actuar como tutor explicando conceptos, resolviendo ejercicios y proporcionando ejemplos de codigo adaptados al nivel del estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El archivo GGUF cuantizado Q3_K_XL ocupa aproximadamente 16,8 GB en disco (6 shards de ~3 GB).
- Para inferencia en GPU, se estima que se necesitan al menos 20-24 GB de VRAM para cargar el modelo completo con contexto moderado (por ejemplo, 8K-16K tokens). Con contexto de 256K, la memoria de KV cache aumentaria considerablemente, por lo que se recomienda limitar el contexto o usar offloading a CPU.
- GPUs recomendadas: RTX 3090, RTX 4090, A100 (40/80 GB), H100, o cualquier GPU con 24 GB o mas de VRAM.
- En GPUs consumer de 16 GB (como RTX 4080) podria ejecutarse con offloading parcial de capas a RAM, aunque con menor rendimiento.
- Opciones de despliegue: `llama.cpp` (llama-cli, llama-server), `Ollama` (importando el GGUF), `llama-cpp-python` para integraciones en Python. No es compatible directamente con vLLM o TGI, que requieren pesos en safetensors.
- Al ser un MoE con solo 3B parametros activos, la velocidad de generacion es superior a la de un modelo denso de 35B, aunque depende del hardware y del numero de expertos activados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | 34,66B | 3B | 256K | MIT | GGUF (Q3_K_XL) |
| Qwen2.5-32B-A3B | 32B | 3B | 128K | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 16B | 2,4B | 128K | MIT | safetensors, GGUF |

Nota: los datos de Qwen2.5-32B-A3B, Mixtral y DeepSeek-V2-Lite son de conocimiento general y no se han verificado en la informacion proporcionada. La comparacion se basa en caracteristicas estructurales, no en rendimiento.

## Limitaciones y advertencias

- La cuantizacion Q3_K_XL introduce perdida de precision respecto al modelo original en safetensors, lo que puede aumentar la tasa de alucinaciones o errores en tareas complejas.
- El modelo esta especializado en codificacion; su rendimiento en otros dominios (por ejemplo, textos generales o cientificos) puede ser inferior al de modelos generalistas.
- No se dispone de informacion sobre sesgos especificos del modelo. Como cualquier LLM, puede reflejar sesgos presentes en sus datos de entrenamiento.
- La ventana de contexto de 256K es una capacidad del modelo original, pero en la practica con cuantizacion Q3 y hardware limitado, el uso de contextos muy largos puede degradar la calidad o requerir mucha memoria.
- Este repositorio es un mirror no oficial de la cuantizacion; no esta afiliado a Unsloth ni a Ornith AI. Se recomienda verificar la integridad de los archivos y usar las versiones oficiales si estan disponibles.
- La licencia MIT permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion correspondiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yukimakura/Unsloth-Ornith-1.5-35B-A3B-UD-Q3_K_XL-GGUF-3GB-split
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio de cuantizacion original: https://huggingface.co/peculiar-ragdoll/Unsloth-Ornith-1.5-35B-A3B
- Variante con MTP: https://huggingface.co/peculiar-ragdoll/Unsloth-Ornith-1.5-35B-A3B-MTP
- Pagina oficial de Ornith AI: https://ornith.online/
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1
- Pagina en Ollama: https://ollama.com/library/ornith-1.5
