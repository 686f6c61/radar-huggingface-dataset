# zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp es una cuantización de 4 bits mixta del modelo orcarouter/Qwen3.8-Flash-Next-Uncensored, publicada por el usuario zviratko. El resultado está empaquetado en formato MLX, lo que lo orienta al ecosistema de Apple Silicon (frameworks mlx y mlx-lm), y conserva la arquitectura multimodal del modelo base: un núcleo de lenguaje, un codificador visual y una cabeza MTP (multi-token prediction) para decodificación especulativa.

El modelo llama la atención por su composición de pesos: de los 77.109 millones de parámetros totales, 51.200 millones corresponden a una tabla de embeddings de n-gramas, mientras que el transformer de lenguaje propiamente dicho suma 22.852 millones. Esa mezcla de un transformer relativamente compacto con una memoria n-gram extensa es poco habitual y condiciona tanto el rendimiento como los requisitos de almacenamiento.

La relevancia práctica es doble: por un lado, ofrece una variante "uncensored" (sin los filtros de alineamiento del modelo original) en un tamaño manejable en hardware de consumo de gama alta con suficiente memoria unificada; por otro, el uso de cuantización mixta oQ y de una cabeza MTP sugiere optimizaciones de velocidad de decodificación. La información pública disponible es escasa: no hay model card detallada, ni benchmarks, ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con embeddings de n-gramas y cabeza MTP (multi-token prediction); pesos en formato MLX |
| Parametros totales | 77.108.737.939 (77,1 B) |
| Parametros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion mixta de 4 bits (oQ, oMLX v0.8.0); tag "4-bit" |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

Desglose de parametros y almacenamiento segun la model card:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 22,852 B | 73,154 GB / 68,130 GiB |
| Embedding de n-gramas | 51,200 B | 32,000 GB / 29,802 GiB |
| Vision | 0,449 B | 0,898 GB / 0,836 GiB |
| Cabeza MTP | 2,607 B | 1,513 GB / 1,409 GiB |
| Total | 77,109 B | 107,565 GB / 100,178 GiB |

## Arquitectura y entrenamiento

La model card no describe el entrenamiento del modelo base ni de la cuantizacion mas alla de indicar que se ha aplicado oQ (oMLX v0.8.0) con precision mixta. Lo que si se puede inferir de los datos de almacenamiento es una arquitectura híbrida: un transformer de lenguaje de 22,852 mil millones de parametros, un modulo de vision de 0,449 mil millones y una cabeza MTP de 2,607 mil millones que permite predecir varios tokens por paso de decodificacion.

El componente mas singular es la tabla de embeddings de n-gramas de 51,200 mil millones de parametros, que ocupa 32 GB del repositorio. Esta estructura funciona como una memoria de secuencias frecuentes que complementa al transformer, un patron que recuerda a enfoques de recuperacion n-grama integrada en el modelo y que puede acelerar la generacion en dominios con mucha repeticion (codigo, texto estructurado). La cuantizacion mixta de 4 bits reduce el transformer a unos 68 GiB, pero la tabla de n-gramas se mantiene en 32 GB, lo que explica el tamano total del repositorio de 107,6 GB.

No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El sufijo "Uncensored" del modelo base sugiere que se ha reducido o eliminado el alineamiento de seguridad, pero no se documenta el proceso.

## Capacidades

- Generacion de texto y razonamiento: heredadas del transformer de lenguaje del modelo base, aunque sin benchmarks publicados que las cuantifiquen.
- Procesamiento de vision: el modulo visual de 0,449 B indica soporte de entrada de imagenes (multimodalidad imagen-texto).
- Decodificacion especulativa: la cabeza MTP permite generar varios tokens candidatos por paso, lo que en teoria aumenta el throughput en inferencia.
- Memoria n-grama: la tabla de 51,2 B puede mejorar la coherencia y velocidad en secuencias repetitivas o altamente predecibles.
- Respuestas sin filtros de alineamiento: al ser una variante "Uncensored", el modelo no aplica las restricciones de seguridad tipicas del modelo original.
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: no disponibles; no se declaran idiomas soportados.

## Casos de uso

- Prototipado local en Apple Silicon: el formato MLX permite ejecutar el modelo en Macs con memoria unificada de 128 GB o superior, ideal para desarrolladores que quieren probar un modelo de 77 B sin GPU dedicada.
- Generacion de codigo asistida: la memoria n-grama y la cabeza MTP favorecen la generacion rapida de codigo repetitivo y estructurado; el modelo puede integrarse en editores o pipelines de CI/CD mediante mlx-lm.
- Investigacion sobre alineamiento y seguridad: al ser una variante sin censura, sirve para estudiar comportamientos del modelo base antes y despues del alineamiento, comparando respuestas.
- Analisis de documentos con imagenes: el modulo de vision permite procesar capturas, diagramas o formularios escaneados junto con texto.
- Experimentacion con decodificacion especulativa: la cabeza MTP hace del modelo un banco de pruebas para medir ganancias de velocidad en generacion multi-token.
- Fine-tuning y destilacion: el transformer de 22,8 B es un objetivo razonable para ajuste fino con LoRA en hardware de gama alta, usando la tabla n-grama como contexto fijo.
- Despliegue de asistentes sin restricciones editoriales: en entornos controlados donde se requiere texto sin filtros (ficcion, role-play, generacion creativa), el modelo evita rechazos por politicas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 107,6 GB en disco; para inferencia en MLX se necesita al menos esa cantidad de memoria unificada, por lo que se recomienda un Mac con 128 GB o mas (M2 Ultra, M3 Ultra, M4 Max con 128 GB).
- GPU dedicadas: no es un formato pensado para CUDA; para GPUs NVIDIA habria que reconvertir los pesos a otro formato (no disponible en el repo).
- Cabe en consumer GPU: no en GPUs de consumo con 24 GB (RTX 4090) ni 48 GB; requiere memoria unificada de Apple Silicon de gama alta o hardware profesional.
- Opciones de despliegue: mlx / mlx-lm (nativo); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la cabeza MTP y la tabla n-grama sugieren mejoras, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp | 77,1 B (22,9 B transformer + 51,2 B n-gramas) | No disponible | No disponible | MLX safetensors 4-bit | Variante sin censura, vision y MTP |
| orcarouter/Qwen3.8-Flash-Next-Uncensored (base) | No disponible | No disponible | No disponible | No disponible | Modelo original sin cuantizar |
| Qwen3 (familia oficial) | 0,6 B a 235 B | Hasta 128K en variantes mayores | Apache 2.0 (segun variante) | safetensors, GGUF | Referencia de la familia Qwen; no confirmado como base directa |
| Llama 3.3 70B Instruct | 70 B | 128K | Llama 3.3 Community License | safetensors, GGUF | Alternativa densa de tamano similar en el ecosistema abierto |

La comparativa con la familia Qwen oficial y con Llama 3.3 es orientativa: no hay datos que confirmen que Qwen3.8-Flash-Next derive de Qwen3, y las cifras de contexto y licencia del modelo analizado no estan publicadas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor o consultar el modelo base antes de usarlo en produccion.
- Modelo "Uncensored": la ausencia de alineamiento de seguridad implica riesgo de generar contenido ofensivo, ilegal o danino; no apto para aplicaciones de cara al publico sin moderacion adicional.
- Riesgo de alucinacion: sin benchmarks ni evaluaciones publicadas, no hay evidencia sobre la fiabilidad factual del modelo.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, lo que dificulta planificar su uso en produccion.
- Formato MLX exclusivo: no es directamente portable a CUDA, vLLM o llama.cpp; requiere conversion para otros entornos.
- Requisitos de memoria elevados: 107,6 GB de almacenamiento y memoria unificada equivalente limitan su uso a hardware de gama alta de Apple.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad; la cuantizacion no ha sido contrastada por terceros.
- Sin model card detallada: no hay informacion sobre datos de entrenamiento, sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/zviratko/Qwen3.8-Flash-Next-Uncensored-oQ4h-mtp
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
