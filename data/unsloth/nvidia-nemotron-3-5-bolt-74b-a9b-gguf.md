# unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF

## Resumen

NVIDIA Nemotron 3.5 Bolt 74B-A9B es un modelo de lenguaje y visión (VLM) de tipo Mixture-of-Experts con 74.000 millones de parámetros totales y 9.000 millones activos por token, desarrollado por NVIDIA Corporation. La versión analizada aquí es la cuantización GGUF publicada por Unsloth (formato Unsloth Dynamic 3.0) sobre los pesos completos en BF16, pensada para ejecutar tareas agénticas del día a día en hardware local en lugar de depender de infraestructura en la nube.

El modelo combina una arquitectura híbrida Mamba-2 más Transformer con un enrutado LatentMoE y un codificador visual C-RADIO v4-H, lo que le permite procesar texto, imágenes y vídeo como entrada y generar texto. Soporta hasta 256K tokens de contexto y utiliza decodificación especulativa mediante un drafter LiLiCorr (DFlash) con 7 tokens especulativos en las recetas de vLLM proporcionadas. Incorpora además un modo de razonamiento controlable vía plantilla de chat (`enable_thinking=True/False`).

Su relevancia actual reside en dos factores: por un lado, ofrece un equilibrio poco habitual entre huella de memoria y capacidad de razonamiento, con un modo de cuantización nativa de 2 bits que cabe en 24 GB; por otro, la familia Nemotron publica pesos, datos de entrenamiento y recetas abiertas bajo licencia OpenMDW-1.1, lo que facilita su personalización y post-entrenamiento. El repositorio GGUF de Unsloth ocupa 342,1 GB y cubre 6 idiomas: inglés, español, francés, alemán, italiano y japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2 mas Transformer hibrido, LatentMoE, con codificador visual C-RADIO v4-H |
| Parametros totales | 74.042.720.848 (74B) |
| Parametros activos | 9B por token |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | GGUF en formato Unsloth Dynamic 3.0; el modelo base reporta una cuantizacion nativa de 2 bits que cabe en 24 GB. Lista exacta de niveles del repo no disponible |
| Idiomas soportados | Ingles, espanol, frances, aleman, italiano, japones |
| Licencia | OpenMDW-1.1 (etiquetada como `license: other` en HuggingFace) |
| Formato de pesos | GGUF (safetensors en el modelo base BF16) |

Datos adicionales relevantes: modalidad `image-text-to-text`, entradas de texto, imagen y vídeo con salida de texto; tamano del repositorio 342,1 GB; fecha de creacion 2026-10-14.

## Arquitectura y entrenamiento

La arquitectura es un hibrido Mamba-2 y Transformer con enrutado LatentMoE (Mixture-of-Experts latente). Mamba-2 aporta un mecanismo de espacio de estados selectivo que reduce el coste computacional en secuencias largas, mientras que las capas Transformer mantienen la capacidad de atencion completa necesaria para tareas de razonamiento y de vision-lenguaje. El modulo MoE activa 9B de los 74B parametros totales, de modo que el coste por token se aproxima al de un modelo denso de 9B pese a la capacidad de representacion de un modelo de 74B. La torre de vision es un codificador C-RADIO v4-H, responsable de la entrada de imagenes y video.

El modelo se entrena sobre los conjuntos `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`, con fecha de corte de los datos de post-entrenamiento en mayo de 2026 (periodo de desarrollo: diciembre de 2025 a mayo de 2026). NVIDIA no detalla en la informacion disponible el numero exacto de tokens de pre-entrenamiento ni la composicion porcentual del dataset, ni si se emplearon tecnicas concretas de RLHF o DPO. Entre las innovaciones tecnicas documentadas destacan la decodificacion especulativa con un drafter LiLiCorr via DFlash (7 tokens especulativos en las recetas de vLLM) y el control del modo de razonamiento mediante la plantilla de chat heredada del cliente Super 3.5 VL.

## Capacidades

- Generacion de texto conversacional multi-turno con hasta 256K tokens de contexto.
- Comprension de imagenes y video (entrada multimodal imagen-texto, salida de texto).
- Razonamiento con modo "thinking" activable y desactivable mediante `enable_thinking=True/False` en la plantilla de chat.
- Ejecucion de tareas agénticas locales: el modelo esta disenado explicitamente para flujos de trabajo agénticos cotidianos.
- Razonamiento multi-paso orientado a herramientas y entornos de terminal, segun los benchmarks reportados (Terminal-Bench 2.1, Tau3 Banking).
- Capacidades multilingues en ingles, espanol, frances, aleman, italiano y japones.
- Soporte de decodificacion especulativa para acelerar la inferencia en vLLM.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Agentes locales de automatizacion de escritorio: el modelo puede interpretar capturas de pantalla (entrada de imagen) y decidir la siguiente accion en un flujo multi-paso, ejecutandose en 24 GB de VRAM junto al resto de aplicaciones del sistema.
- Operacion de terminales y entornos de linea de comandos: con 50,98 en Terminal-Bench 2.1, es adecuado para agentes que inspeccionan repositorios, ejecutan comandos y corrigen errores de forma iterativa.
- Atencion al cliente automatizada: los 256K tokens de contexto permiten mantener conversaciones largas con historial completo e informacion de producto extensa sin truncar, en seis idiomas europeos y japones.
- Procesamiento de documentos con imagenes: al aceptar imagen y texto, puede extraer y razonar sobre facturas, formularios escaneados o diagramas tecnicos y devolver texto estructurado.
- Analisis de video para supervision o resumen: la entrada de video permite generar descripciones, resumentes o alertas sobre secuencias grabadas.
- Generacion y revision de codigo asistida: integrable en pipelines de CI/CD como revisor de cambios o generador de parches, aprovechando el modo de razonamiento activable para tareas que requieren mayor profundidad.
- Base para post-entrenamiento y ajuste fino: los pesos BF16 del modelo base estan pensados explicitamente para personalizacion, de modo que equipos con datos propios pueden derivar variantes especializadas y cuantizarlas despues a GGUF.
- Analisis financiero y de procesos bancarios: el resultado en Tau3 Banking (referencia del modelo de 24 GB: 9,48) lo situa como candidato para clasificacion y resolucion de incidencias en dominios regulados, con validacion adicional.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la variante de 24 GB (IQ2), no a la version BF16 ni a los GGUF de Unsloth. Se reproduce la tabla disponible tal cual:

| Benchmark | Qwen3.6-35B-A3B BF16 | Gemma4 26B-A4B BF16 | Nemotron 3.5 Lightning 30B-A3B BF16 | Nemotron 3.5 Bolt 74B-A9B-24GB (IQ2) |
|---|---:|---:|---:|---:|
| GDPVal-AA-V2 | 25,75 | 15,33 | 18,26 | 28,47 |
| Terminal-Bench 2.1 | 44,38 | 37,22 | 23,46 | 50,98 |
| Tau3 Banking | 10,52 | 14,02 | 9,48 | no disponible (truncado en la informacion) |

No se han publicado en la informacion disponible resultados de benchmarks para la version BF16 ni para las cuantizaciones GGUF de Unsloth. Unsloth remite a su documentacion de benchmarks de cuantizacion (`Unsloth Dynamic 3.0 GGUFs`) para evaluar la perdida de precision de cada nivel.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 148-150 GB para los pesos, mas cache KV. Requiere multiples GPU o un nodo con memoria unificada.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 75-80 GB (no confirmado en la informacion disponible).
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 40-45 GB (no confirmado en la informacion disponible).
- Variante de 24 GB: cuantizacion nativa de 2 bits, disenada para caber en 24 GB y ejecutarse junto a otras aplicaciones (por ejemplo, una RTX 4090 o RTX 3090 de 24 GB).
- GPU oficialmente soportadas: NVIDIA Ampere (A100), Hopper (H100-80GB) y Blackwell mediante vLLM.
- Consumer GPU: si cabe en GPUs de 24 GB en la variante cuantizada a 2 bits; los niveles GGUF mas altos requeriran varias GPU o memorias de mayor capacidad.
- Opciones de despliegue: vLLM (recomendado por NVIDIA, con recetas de decodificacion especulativa) y llama.cpp para la variante de 24 GB; Ollama y TGI no aparecen mencionados en la informacion proporcionada.
- Latencia y throughput: no disponible. La activacion de solo 9B parametros por token y los 7 tokens especulativos del drafter LiLiCorr deberian reducir la latencia frente a un denso de 74B, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros (activos) | Contexto | Licencia | Resultado GDPVal-AA-V2 | Resultado Terminal-Bench 2.1 |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B | 74B (9B) | 256K | OpenMDW-1.1 | 28,47 (IQ2) | 50,98 (IQ2) |
| Qwen3.6-35B-A3B | 35B (3B) | no disponible | no disponible | 25,75 | 44,38 |
| Gemma4 26B-A4B | 26B (4B) | no disponible | no disponible | 15,33 | 37,22 |
| Nemotron 3.5 Lightning 30B-A3B | 30B (3B) | no disponible | no disponible | 18,26 | 23,46 |

Todos los valores comparados son en BF16 salvo el de Nemotron 3.5 Bolt, medido en su cuantizacion IQ2 de 24 GB. No se dispone de datos de contexto, licencia o disponibilidad de los tres modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de benchmarks publicados corresponden a la variante de 24 GB en IQ2, no a los pesos BF16 ni a los GGUF de Unsloth; no son extrapolables directamente.
- La cuantizacion a 2 bits permite cumplir el objetivo de memoria, pero implica una perdida de precision que no se cuantifica en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan tasas especificas. Especialmente relevante en tareas agénticas donde el modelo decide acciones.
- Sesgos conocidos: no documentados en la informacion disponible. El dataset de post-entrenamiento tiene corte en mayo de 2026, por lo que no cubre eventos posteriores.
- Limitaciones de idioma: solo se declaran seis idiomas (en, es, fr, de, it, ja). El rendimiento en idiomas no listados, y en particular en variantes regionales como el castellano de Espana frente a otras variantes del espanol, no esta documentado.
- Licencia: OpenMDW-1.1 permite uso comercial y no comercial segun la model card, pero es una licencia no estandar (no OSI, no Apache) y debe revisarse en detalle antes de un despliegue en produccion. La etiqueta de HuggingFace es `license: other`.
- La model card advierte explicitamente que la version BF16 esta pensada para personalizacion y post-entrenamiento, no para inferencia directa en produccion; para latencia y throughput se remite a la variante de 24 GB.
- Los pesos son una derivacion de Unsloth, no de NVIDIA: para soporte o garantias debe considerarse al publicador del repositorio.
- Soporte de tool calling no confirmado explicitamente; verificar antes de disenar pipelines que dependan de function calling.
- El repositorio ocupa 342,1 GB, lo que exige planificacion de almacenamiento aun descargando un unico nivel de cuantizacion.

## Enlaces

- Repositorio GGUF de Unsloth: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-GGUF
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Variante de 24 GB en GGUF: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Variante de 24 GB para vLLM: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Guia de ejecucion de Nemotron 3.5 Bolt (Unsloth): https://unsloth.ai/docs/models/nemotron-3.5-bolt
- Benchmarks de cuantizacion Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1 en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Pagina de desarrollador de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Coleccion de datasets de pre-entrenamiento Nemotron: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Discord de Unsloth: https://discord.gg/unsloth
- Paper asociado (arXiv 2605.07182): https://arxiv.org/abs/2605.07182
