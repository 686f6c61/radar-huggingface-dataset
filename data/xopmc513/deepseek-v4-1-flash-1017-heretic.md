# XopMC513/DeepSeek-V4.1-Flash-1017-Heretic

## Resumen

DeepSeek-V4.1-Flash-1017-Heretic es una adaptación comunitaria del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek-AI, publicada por el usuario XopMC513 bajo la marca Strata. Se distribuye en dos ediciones con los mismos pesos adaptados: una en precisión original (510,30 GB, 48 shards de safetensors) y otra compacta en formato mixto NVFP4 (406,99 GB, 48 shards empaquetados). El modelo conserva la arquitectura MoE completa del original, la red de expertos enrutados sin podar, los componentes de memoria condicional Engram, los activos de visión y las tres etapas de borrador DSpark/MTP para decodificación especulativa verificada.

La modificación "Heretic" consiste en un conjunto acotado de ediciones ARA con restricción de norma aplicadas sobre proyecciones de salida de atención y de expertos compartidos, con el objetivo declarado de reducir rechazos innecesarios sin alterar de forma global la red. Quedan fuera de la edición los expertos enrutados, los routers, Engram, los embeddings, la cabeza de salida, la visión y el MTP.

Es relevante ahora porque demuestra un patrón de publicación poco habitual: un derivado de investigación sobre alineación (reducción de rechazos) empaquetado con un runtime y un formato propietarios (Strata), con soporte declarado de contexto de hasta 1.048.576 posiciones y ejecución híbrida CPU + GPU. El autor no reclama ninguna métrica estándar de calidad ni perplejidad de corpus completo, y advierte de que el modelo no garantiza respuestas libres de rechazos, correctas o sin alucinaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con memoria condicional Engram, torre de visión y decodificación especulativa DSpark/MTP de tres etapas; identificada como arquitectura DeepSeek 1017 |
| Parametros totales | no disponible (la información proporcionada no indica recuento de parámetros ni número de expertos) |
| Parametros activos | no disponible (es MoE, pero no se documenta el número de expertos enrutados ni los parámetros activos por token) |
| Longitud de contexto | hasta 1.048.576 posiciones según la arquitectura de origen, sujeto al soporte del runtime y a la memoria disponible |
| Tipos de cuantizacion | Precisión original mixta: MXFP4, FP8, BF16 y F32. Edición compacta: NVFP4 mixto con tablas Engram en Q4 agrupado y compresión de escalas sin pérdida. No se distribuye GGUF |
| Idiomas soportados | en (inglés); no se declaran otros idiomas |
| Licencia | MIT (licencia del modelo base conservada) |
| Formato de pesos | safetensors (48 shards por edición); la edición NVFP4 usa formato empaquetado propio Strata con índice de tensores portable |
| Tamano de pesos | 510,30 GB (precisión original) / 406,99 GB (NVFP4 mixto) |
| Modalidad | image-text-to-text (texto e imagen de entrada, texto de salida) |
| Tokenizer | el original de DeepSeek-V4.1-Flash-1017, sin cambios |
| Runtime requerido | cargador compatible con Strata y con los operadores de DeepSeek 1017; el código del runtime no se incluye en el repositorio de pesos |
| Descargas / likes | 0 descargas / 2 likes |
| Fecha de publicacion | 25 de octubre de 2026 (última actualización: 26 de octubre de 2026) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base DeepSeek-V4.1-Flash-1017: un transformer de mezcla de expertos con red de expertos enrutados completa (sin poda), componentes de memoria condicional Engram, torre de visión para entrada de imágenes y un cabezal especulativo DSpark/MTP con tres etapas de borrador que deben verificarse contra el modelo principal. El checkpoint original no es un BF16 uniforme: ya combina MXFP4, FP8, BF16 y F32, lo que condiciona tanto el tamaño en disco como los requisitos de carga.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. Respecto al ajuste comunitario, el autor describe una edición "Heretic" basada en actualizaciones ARA con restricción de norma sobre un conjunto reducido de proyecciones (salida de atención y expertos compartidos), dejando intactos expertos enrutados, routers, Engram, embeddings, cabeza de salida, visión y MTP. La conversión compacta a NVFP4 preserva los valores de los expertos principales mediante compresión de escalas sin pérdida, pero la cuantización de Engram en Q4 agrupado y la propia edición Heretic introducen cambios numéricos; el autor no reclama ninguna puntuación estandarizada de calidad ni perplejidad de corpus completo.

## Capacidades

- Generación de texto y razonamiento multi-paso, conservando las convenciones de "thinking" del modelo original (tokenizer, codificador de mensajes y formato de mensajes intactos).
- Generación y comprensión de código, con soporte declarado de tool-use.
- Llamada a herramientas y funciones (tool calling / function calling) mediante el codificador de mensajes original.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text) con los activos de visión y codificación de imagen originales.
- Contexto largo de hasta 1.048.576 posiciones, condicionado al runtime y a la memoria.
- Decodificación especulativa con DSpark/MTP de tres etapas, con verificación de los borradores por parte del modelo principal.
- Memoria condicional Engram integrada en el modelo.
- Reducción de rechazos (refusals) mediante la adaptación Heretic, con alcance deliberadamente limitado.
- Capacidades multilingües: no declaradas; la model card solo lista inglés.
- No se declaran capacidades de audio ni de salida multimodal.

## Casos de uso

- Análisis de repositorios y bases de código completas: con una ventana de hasta 1.048.576 posiciones, el modelo puede ingerir un árbol de código extenso y razonar sobre dependencias entre módulos en una sola pasada, algo inviable con ventanas de 32k-128k.
- Asistencia técnica sobre documentación con diagramas: al aceptar imagen y texto, permite adjuntar capturas de paneles de error, diagramas de arquitectura o esquemas de red junto a la consulta y razonar sobre ambos.
- Agentes con herramientas en pipelines internos: el soporte de tool calling y la conservación del codificador de mensajes permiten integrarlo en flujos multi-paso donde el modelo decide qué función invocar y encadena resultados.
- Procesamiento por lotes de corpus largos en servidores híbridos CPU + GPU: la configuración de referencia (CPU + 2× RTX 4090) indica que el modelo está pensado para escenarios donde los pesos residen mayoritariamente en RAM y las GPU aceleran las capas activas; encaja en tareas de extracción y resumen offline más que en servicio interactivo de baja latencia.
- Investigación sobre alineación y tasas de rechazo: la edición Heretic es un objeto de estudio directo para medir cómo afectan ediciones acotadas con restricción de norma al comportamiento de negativa del modelo, comparando con el base en el mismo runtime.
- Reducción de latencia en generación con contexto muy largo: el uso de MTP verificado permite acelerar la decodificación en escenarios de 256k-512k tokens, donde el cuello de botella suele ser el coste por token generado.
- Archivado y auditoría de contratos o expedientes extensos: la ventana de 1M posiciones admite documentos legales o técnicos de cientos de miles de tokens sin troceado, manteniendo coherencia entre secciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor declara explícitamente que no reclama ninguna puntuación amplia de calidad ni perplejidad de corpus completo para esta release.

Las únicas mediciones publicadas son de throughput local, con el runtime Strata sobre CPU + dos RTX 4090 y decodificación MTP verificada, con prompts nuevos y una petición completada por contexto:

| Contexto | Generación (tokens/s) | Procesamiento de prompt (tokens/s) |
|---|---:|---:|
| 256k | 54,9 | 4.695 |
| 512k | 58,1 | 5.392 |

Estas cifras son mediciones locales del autor, no reproducidas de forma independiente, y dependen del hardware y de la configuración del runtime. El propio autor advierte que el tamaño en disco no equivale al requisito de RAM en ejecución.

## Requisitos de hardware

- Almacenamiento: 510,30 GB para la edición en precisión original y 406,99 GB para la edición NVFP4 mixta, contando 48 shards más tokenizer, configuración e índice en cada caso.
- VRAM: no disponible de forma explícita. Los tamaños de pesos (por encima de 400 GB) exceden con holgura cualquier GPU individual y cualquier par de GPU de consumo, por lo que se requiere offloading a RAM del sistema.
- Configuración de referencia validada por el autor: CPU + 2× RTX 4090 (48 GB de VRAM en total) con el runtime Strata. Esto implica que la mayor parte de los pesos se sirve desde memoria del sistema; el requisito exacto de RAM no está documentado.
- GPU recomendadas: no se especifican A100, H100 ni otras; la única configuración citada es la de dos RTX 4090. Para precisiones mayores o mayor concurrencia harían falta nodos con mucha memoria, sin datos publicados.
- ¿Cabe en GPU de consumo? No en una sola GPU. La configuración mínima citada son dos RTX 4090 más CPU y RAM abundante, y aun así con toda probabilidad con offloading parcial.
- Opciones de despliegue: únicamente el cargador compatible con Strata y con los operadores de DeepSeek 1017. La model card indica que la edición NVFP4 no es GGUF ni un checkpoint NVFP4 de Transformers/ModelOpt intercambiable, y que el código del runtime no se incluye en el repositorio de pesos. Por tanto, vLLM, llama.cpp, Ollama y TGI no están soportados según la información disponible.
- Latencia y throughput: 54,9 tokens/s de generación a 256k y 58,1 tokens/s a 512k; 4.695 y 5.392 tokens/s de procesamiento de prompt respectivamente, en la configuración de referencia.

## Comparativa con modelos similares

La información proporcionada solo permite comparar esta release con su propio modelo base y con sus dos ediciones. No se aportan datos de terceros comparables (parámetros, contexto o benchmarks), por lo que esas celdas se marcan como no disponibles.

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base, DeepSeek-AI) | no disponible | hasta 1.048.576 posiciones (arquitectura de origen) | precisión mixta MXFP4/FP8/BF16/F32; tamano no disponible | MIT según la model card del derivado | Referencia sin edición Heretic; requiere soporte de la arquitectura 1017 |
| DeepSeek-V4.1-Flash-1017-Heretic, precisión original | no disponible | hasta 1.048.576 posiciones | safetensors, 48 shards, 510,30 GB | MIT | Incluye edición ARA y todos los componentes originales |
| DeepSeek-V4.1-Flash-1017-Heretic, NVFP4 mixto | no disponible | hasta 1.048.576 posiciones | Strata NVFP4 empaquetado, 48 shards, 406,99 GB | MIT | ~20% menos almacenamiento; Engram en Q4 agrupado; requiere cargador propio |
| Alternativas de terceros de categoria equivalente | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

## Limitaciones y advertencias

- La adaptación Heretic modifica el comportamiento de rechazo del modelo. Aunque el autor la describe como "contenida", no se aporta ninguna evaluación de seguridad, de tasa de rechazos ni de calidad tras la edición.
- No se publica perplejidad, evaluación de corpus ni benchmarks estándar; el autor declara explícitamente que no reclama ninguna métrica amplia de calidad. Cualquier despliegue en producción debería ir precedido de una evaluación propia.
- Riesgo de alucinación: la model card advierte que Heretic no garantiza respuestas libres de rechazos, correctas o sin alucinaciones.
- La cuantización de las tablas Engram en Q4 agrupado y la propia edición Heretic introducen cambios numéricos respecto al base, no caracterizados con métricas.
- Idioma: solo se declara inglés. El rendimiento en castellano u otros idiomas no está documentado y no debería asumirse por herencia del modelo base.
- Formato propietario: la edición NVFP4 exige un cargador Strata específico y no es compatible con GGUF, Transformers estándar ni ModelOpt NVFP4. La edición en precisión original también requiere soporte de los operadores de la arquitectura DeepSeek 1017. El código del runtime no se distribuye en el repositorio de pesos, lo que crea una dependencia externa crítica.
- La decodificación especulativa exige que los borradores DSpark/MTP se verifiquen contra el modelo principal; usar los borradores sin verificación produciría salidas no válidas.
- Licencia MIT, que en principio permite uso comercial, pero conviene verificar de forma independiente los términos del modelo base DeepSeek-V4.1-Flash-1017 antes de explotarlo comercialmente.
- Madurez: 0 descargas y 2 likes en el momento de la ficha, sin evaluaciones independientes conocidas. Es un derivado comunitario de un único autor.
- Inconsistencia de datos: el campo de tamaño del repositorio en HuggingFace indica 202,0 GB, mientras que la model card declara 510,30 GB y 406,99 GB para las dos ediciones. Conviene comprobar el contenido real antes de planificar el almacenamiento.
- El tamaño en disco no equivale al requisito de memoria en ejecución; el autor lo señala expresamente y no publica la RAM necesaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XopMC513/DeepSeek-V4.1-Flash-1017-Heretic
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Edición en precisión original: https://huggingface.co/XopMC513/DeepSeek-V4.1-Flash-1017-Heretic/tree/main/HereticOriginalPrecision
- Edición NVFP4 mixta: https://huggingface.co/XopMC513/DeepSeek-V4.1-Flash-1017-Heretic/tree/main/MixedNVFP4-v4
- Layout del paquete: https://huggingface.co/XopMC513/DeepSeek-V4.1-Flash-1017-Heretic/blob/main/PACKAGE.json
- Notas de evaluación y alcance de las mediciones: https://huggingface.co/XopMC513/DeepSeek-V4.1-Flash-1017-Heretic/blob/main/evidence/measurements.json
- Licencia: https://huggingface.co/XopMC513/DeepSeek-V4.1-Flash-1017-Heretic/blob/main/LICENSE
