# webmp3/Sakura-Qwen3.8-Flash-Next-Compact-UD-IQ1_M-CP2-GGUF

## Resumen

Sakura Qwen3.8 Flash-Next Compact UD-IQ1_M CP2 es un reempaquetado comunitario experimental, publicado por el usuario webmp3, del modelo Qwen3.8-Flash-Next en cuantización GGUF UD-IQ1_M preparada por Unsloth. No se trata de un modelo entrenado desde cero ni de un ajuste fino: es una modificación estructural de los ficheros cuantizados en la que se conservan los 512 expertos enrutados del modelo base y se sustituye únicamente el tensor `per_layer_token_embd.weight` del segundo shard por una tabla CP2 preexistente, tomada del paquete Sakura K512 CP2 del mismo autor. Los shards 1 y 3 se copian sin cambios.

El modelo base declarado es Qwen/Qwen3.8-Flash-Next, con 176.943.899.520 parámetros totales según los safetensors del repositorio original, lo que lo sitúa en la categoría de modelos de mezcla de expertos de gran tamano. El paquete se distribuye como tres ficheros GGUF que suman 55,114 GiB e incluye un runtime Windows x64 con backend Vulkan, pensado para equipos con memoria unificada. La licencia de los pesos se mantiene como Qwen Community License 1.0.

La relevancia de esta ficha es doble. Por un lado, documenta un experimento de cuantización agresiva sobre un MoE de ~177.000 millones de parámetros. Por otro, el propio autor advierte de que esta combinación exacta de pesos Unsloth + tabla CP2 no se ha cargado para inferencia ni se ha evaluado en generación, perplejidad, calidad o velocidad: es un lanzamiento estructural, no una cualificación de calidad ni de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con 512 expertos enrutados, según la model card; el resto de detalles (número de capas, tipo de atención, dimensión oculta) no está disponible |
| Parámetros totales | 176.943.899.520 (~176,9 mil millones), dato real de safetensors del modelo base |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantización | GGUF UD-IQ1_M (Unsloth Dynamic IQ1_M) con tabla CP2; es la única cuantización publicada en este repositorio |
| Idiomas soportados | alemán (de), inglés (en), chino (zh) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0); el repositorio figura como `license: other` con `license_name: qwen-community-1.0` |
| Formato de pesos | GGUF, tres shards, más binarios de runtime Windows x64 Vulkan |

Datos adicionales verificables: tamano del repositorio 59,3 GB; suma de los tres ficheros de modelo 55,114 GiB; revisión del backbone Unsloth `766911a6b7369840a91dbcd95f9f997acaab6cd6`; alias de servicio `sakura-flash-next-ud-iq1-m-cp2`; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 512 expertos enrutados, según la única referencia arquitectónica que aporta la model card. No se dispone de información sobre el número de capas, la dimensión del modelo, el mecanismo de atención, el número de expertos activos por token ni el reparto de parámetros entre atención y expertos. Tampoco hay datos sobre el corpus de entrenamiento: número de tokens, composición del dataset, fases de preentrenamiento, ajuste supervisado, RLHF o DPO. Todo ello corresponde al modelo original Qwen3.8-Flash-Next y no se documenta en este repositorio.

La innovación de este paquete es exclusivamente de empaquetado. Se parte de la cuantización UD-IQ1_M de Unsloth, que incluye una matriz de importancia (etiqueta `imatrix`) para guiar la cuantización, y se aplica un reemplazo quirúrgico: los shards 1 y 3 se copian íntegros, y en el shard 2 se conservan todos los tensores no tabulares mientras se sustituye solo `per_layer_token_embd.weight` por la tabla CP2 ya existente del paquete Sakura K512 CP2. No hay entrenamiento, destilación ni calibración nueva documentada para esta combinación concreta. El resultado ocupa 55,114 GiB, lo que repartido sobre 176.900 millones de parámetros implica aritméticamente unos 2,7 bits por parámetro; esta cifra es un cálculo propio a partir del tamano declarado y no ha sido verificada por el autor, que no publica la tasa de bits por peso de la receta.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` así lo indican, pero el autor declara explícitamente que este paquete exacto no se ha cargado para inferencia ni probado en generación.
- Multilingüismo limitado a tres idiomas declarados: alemán, inglés y chino. No se declara soporte de castellano.
- Servicio compatible con endpoints: la etiqueta `endpoints_compatible` sugiere exposición mediante API, servida por el runtime incluido en el puerto local 18122.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Visión, audio o modo thinking: no disponible en la información proporcionada; el paquete es solo de texto según el pipeline declarado.
- Ejecución en memoria unificada: el paquete está orientado a un runtime Vulkan para Windows x64, lo que habilita la carga en equipos con memoria compartida entre CPU y GPU.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: el paquete permite estudiar cómo se comporta un modelo de ~177.000 millones de parámetros con todos los expertos conservados a ~2,7 bits por peso. Es adecuado porque preserva la estructura completa de expertos en lugar de podar, y precisamente por eso sirve para aislar el efecto de la cuantización frente al de la poda.
- Reproducción de la cadena de herramientas Sakura: sirve para verificar que el runtime CP2 arranca y sirve el alias `sakura-flash-next-ud-iq1-m-cp2` con pesos de un backbone distinto al del paquete K512 original, validando la portabilidad del reemplazo de la tabla de embeddings.
- Despliegue local en equipos con memoria unificada: sobre una plataforma tipo Strix Halo con 64 GB de memoria compartida, el paquete cabe en disco y podría intentar cargarse con el runtime incluido, ya que los 55,114 GiB de pesos exceden cualquier VRAM dedicada de 24 o 32 GB. Adecuado solo como prueba, dado que el autor no ha validado la carga.
- Evaluación comparativa de recetas de cuantización: investigar diferencias entre UD-IQ1_M estándar de Unsloth y la variante con tabla CP2 en tareas de perplejidad o generación, una vez que el autor o un tercero publique mediciones.
- Pruebas de integración de endpoints compatibles: validar clientes HTTP, balanceadores o wrappers que consumen una API OpenAI-like servida en `http://127.0.0.1:18122`, comprobando latencia y estabilidad del runtime en Windows x64.
- Archivística y trazabilidad de artefactos: el repositorio documenta revisión exacta del backbone y origen de la tabla CP2, lo que lo hace útil como caso de estudio de reproducibilidad en publicaciones comunitarias de GGUF.
- Análisis de riesgos de compatibilidad: sirve para medir cuánto se rompe el ecosistema estándar (llama.cpp, LM Studio, Ollama) cuando se introduce una tabla de embeddings personalizada en un GGUF, escenario relevante para quien diseñe formatos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica de forma explícita que este paquete UD-IQ1_M + CP2 no se ha cargado para inferencia ni se ha probado en generación, perplejidad, calidad o velocidad, y que ninguna cifra de velocidad, encaje o calidad de los paquetes K512, ISTA Compact o Gyro es aplicable a esta combinación.

## Requisitos de hardware

- Tamano en disco: 55,114 GiB repartidos en tres ficheros GGUF; repositorio completo de 59,3 GB. El autor subraya que el tamano en disco no es memoria de ejecución.
- VRAM: no disponible. No hay perfil de memoria validado. Como referencia aritmética, los 55,114 GiB de pesos superan por sí solos los 32 GB de VRAM dedicada, de modo que ninguna GPU de 24 o 32 GB puede alojarlos íntegramente sin offloading, y el autor no ha validado perfiles de offloading para tarjetas pequenas.
- GPU recomendadas: no disponible. No se suministra build CUDA.
- Único perfil con runtime probado: AMD Strix Halo, Radeon 8060S, 64 GB de memoria unificada, Windows x64. La prueba se hizo con el paquete K512 CP2, no con este. Otras configuraciones Strix Halo, así como GPUs AMD, NVIDIA o Intel distintas, figuran como no probadas.
- Consumer GPU: no validado en ninguna. El autor advierte que el soporte Vulkan en el driver no basta para establecer compatibilidad.
- Plataformas sin binario: CPU-only, Linux, macOS y Windows on ARM no tienen binario nativo en el paquete.
- Opciones de despliegue: usar exclusivamente el runtime incluido (`START.cmd`, servicio en `http://127.0.0.1:18122`, alias `sakura-flash-next-ud-iq1-m-cp2`). llama.cpp estándar, LM Studio, Ollama y forks no relacionados no están cualificados para esta tabla CP2 personalizada.
- Latencia y throughput: no disponible. No se publican mediciones para este paquete.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / tamano | Runtime validado | Licencia |
|---|---|---|---|---|---|
| Sakura Qwen3.8 Flash-Next UD-IQ1_M CP2 (este) | 176,9 mil millones (totales) | no disponible | GGUF UD-IQ1_M + tabla CP2, 55,114 GiB | Solo runtime Vulkan Windows x64 incluido, y no cargado con estos pesos | qwen-community-1.0 |
| unsloth/Qwen3.8-Flash-Next-GGUF (backbone) | 176,9 mil millones (totales) | no disponible | GGUF UD-IQ1_M sin tabla CP2 | No declarado en esta ficha | qwen-community-1.0 |
| Sakura K512 CP2 (`Sakura-Qwen3.8-Flash-Next-Compact-47.6GiB-K512-CP2-v1-GGUF`) | no disponible | no disponible | 47,6 GiB con tabla CP2 | Runtime Vulkan Windows x64 probado | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9 mil millones (totales) | no disponible | Pesos originales (safetensors) | no disponible | qwen-community-1.0 |

La comparación disponible es intrafamiliar: las cuatro variantes comparten pesos y licencia, y se diferencian en la receta de cuantización, el tamano resultante y el grado de validación. No se dispone de datos de benchmarks ni de modelos de otros proveedores en la información proporcionada para establecer una comparación cruzada rigurosa.

## Limitaciones y advertencias

- Modelo no probado: el autor declara que esta combinación exacta de pesos Unsloth + tabla CP2 no se ha cargado para inferencia ni evaluado en generación, perplejidad, calidad o velocidad. Cualquier uso en producción parte de cero validación.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta.
- Compatibilidad rota con el ecosistema estándar: llama.cpp estándar, LM Studio, Ollama y forks no relacionados no están cualificados para la tabla CP2. El modelo queda atado al runtime binario incluido.
- Plataforma restringida: solo se suministran binarios Windows x64 con backend Vulkan; no hay build CUDA ni soporte para Linux, macOS, CPU-only o Windows on ARM.
- Riesgo de degradación por el reemplazo de embeddings: la sustitución de `per_layer_token_embd.weight` por una tabla de otro paquete no ha sido evaluada, por lo que se desconoce su impacto en la calidad o en la coherencia del modelo.
- Idiomas: solo alemán, inglés y chino declarados; no se declara castellano, y no hay evaluación multilingüe publicada.
- Contexto desconocido: la model card no declara longitud de contexto, lo que impide planificar cargas de trabajo de contexto largo.
- Alucinación: sin datos. No se ha medido la tasa de alucinación de este paquete y no debería asumirse el comportamiento del modelo base sin verificación.
- Sesgos: no documentados en la información disponible.
- Licencia: los pesos conservan Qwen Community License 1.0, con las condiciones que dicho texto imponga para uso comercial y redistribución. El repositorio se etiqueta como `license: other`; conviene leer el fichero LICENSE antes de cualquier uso comercial. Los binarios de runtime del autor no declaran licencia propia en la información disponible.
- Consumo de disco y memoria: 55,114 GiB de ficheros; el tamano en disco no garantiza que la configuración quepa en memoria durante la ejecución.
- Fecha del artefacto: creado el 2026-10-21 y actualizado el mismo día, con una ventana de desarrollo de menos de dos horas, lo que refuerza su carácter de lanzamiento experimental no madurado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-UD-IQ1_M-CP2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Backbone cuantizado (Unsloth), revisión `766911a6b7369840a91dbcd95f9f997acaab6cd6`: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Paquete Sakura K512 CP2, origen de la tabla CP2 y del runtime: https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-47.6GiB-K512-CP2-v1-GGUF
- README en chino simplificado: README_zh.md dentro del repositorio
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales que verificar.
