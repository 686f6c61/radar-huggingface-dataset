# Vontra/Qwen3.6-35B-A3B-MLX-4bit-MTP

## Resumen

Vontra/Qwen3.6-35B-A3B-MLX-4bit-MTP es una conversion a MLX en cuantizacion de 4 bits del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario Vontra. Se trata de un checkpoint multimodal (pipeline image-text-to-text) que conserva la capa nativa de prediccion multi-token (MTP) del modelo original, algo que las conversiones habituales de MLX eliminan. El resultado es un repositorio unico que sirve tanto para inferencia normal como para decodificacion especulativa con el propio modelo como borrador.

El modelo base pertenece a la familia Qwen3.6 y su nomenclatura A3B indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos sobre un total de 35.107.181.936 parametros, segun los metadatos de safetensors del repositorio. El pipeline declarado es image-text-to-text, por lo que el modelo procesa imagenes y texto de forma conjunta.

Su relevancia es practica: permite ejecutar un MoE multimodal de 35B en equipos Apple Silicon con memoria unificada, mediante el framework MLX, y ademas habilita decodificacion especulativa con MTP sin depender de un modelo borrador externo. La licencia es Apache-2.0, heredada del modelo base, lo que facilita el uso comercial. El repositorio es reciente (creado el 28 de septiembre de 2026) y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, segun la etiqueta mixture-of-experts y la nomenclatura A3B del modelo base; detalles de capas no disponibles |
| Parametros totales | 35.107.181.936 |
| Parametros activos | Aproximadamente 3.000 millones, inferido de la nomenclatura A3B; no confirmado explicitamente en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit con group size 64; routers y puertas de expertos compartidos a 8 bits; normas en BF16; la capa MTP usa la misma configuracion |
| Idiomas soportados | no disponible (la model card no especifica lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX); no se ofrecen pesos GGUF |
| Tamano del repositorio | 20,9 GB |
| Libreria | mlx (compatible con mlx-vlm) |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.6-35B-A3B (relacion: quantized) |
| Fecha de publicacion | 28 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio: mixture-of-experts, qwen3_5_moe y MTP. Se sabe que el modelo base es un MoE multimodal de Qwen, y que la conversion mantiene los pesos oficiales del modelo original reorganizados para MLX. Los cuatro shards `model-*.safetensors` y todos los ficheros de configuracion y tokenizer son identicos byte a byte a los de mlx-community/Qwen3.6-35B-A3B-4bit en la revision `38740b8`.

La innovacion tecnica destacable es la inclusion del fichero `mtp-4bit.safetensors`, que contiene los pesos oficiales `mtp.*` de Qwen/Qwen3.6-35B-A3B (revision `995ad96`) cuantizados igual que el resto del modelo y renombrados como `language_model.mtp.*`. Esta capa permite que un motor de inferencia la use como borrador en decodificacion especulativa. El `model.safetensors.index.json` no lista el fichero MTP, de modo que los cargadores que no hacen drafting lo ignoran y cargan exactamente el modelo de mlx-community. No hay informacion disponible sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta conversational del repositorio.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text), con ejemplo oficial de uso que recibe una imagen mediante el parametro `--image` de mlx-vlm.
- Decodificacion especulativa nativa: la capa MTP incluida permite hacer drafting y verificar cada token propuesto contra el modelo, de forma que la salida es equivalente a la decodificacion normal.
- Ejecucion en Apple Silicon mediante MLX y mlx-vlm.
- La model card no documenta soporte de tool calling, function calling, modos de pensamiento (thinking), audio ni capacidades de agente; estos extremos figuran como no disponibles en la informacion proporcionada.
- La lista de idiomas soportados tampoco se detalla.

## Casos de uso

- Asistente multimodal local en Mac: un desarrollador puede desplegar el modelo con mlx-vlm en un equipo Apple Silicon y consultar imagenes junto a texto (por ejemplo, "describe esta captura de pantalla") sin enviar datos a servicios externos.
- Analisis de documentos escaneados: al ser image-text-to-text, resulta adecuado para extraer y resumir informacion de facturas, formularios o informes en formato imagen dentro de un flujo local.
- Prototipado de producto en hardware de consumo: el checkpoint de 4 bits reduce el peso a unos 21 GB, lo que permite validar funcionalidades multimodales en un Mac de gama alta antes de invertir en infraestructura con GPU.
- Aceleracion de inferencia mediante MTP: integrado en un motor que soporte drafting (TensorFold declara soporte en desarrollo), el modelo puede reducir el coste por token generado sin cambiar la salida final.
- Evaluacion comparativa de tecnicas de decodificacion: al conservar la capa MTP, el repositorio sirve como banco de pruebas para medir la ganancia de la decodificacion especulativa frente a la decodificacion autoregresiva estandar.
- Despliegue de demos de vision y lenguaje: con un unico comando de mlx-vlm se puede levantar una demostracion funcional de captioning o respuesta visual a preguntas para presentaciones internas.
- Investigacion en cuantizacion: la configuracion concreta (affine 4-bit, group size 64, routers a 8 bits, normas en BF16) es un caso de estudio reutilizable para analizar el impacto de la cuantizacion selectiva en un MoE con capa MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones cuantitativas con el modelo en BF16 o con otras conversiones.

## Requisitos de hardware

- Peso de los pesos: 20,9 GB en el repositorio, con cuantizacion affine 4-bit. Se recomienda disponer de al menos 24 GB de memoria unificada libre para la carga del modelo, y 32 GB o mas para trabajar con imagenes y contextos largos.
- Plataforma: MLX requiere Apple Silicon (series M1, M2, M3, M4 y posteriores). No es ejecutable directamente sobre GPU NVIDIA o AMD mediante CUDA o ROCm.
- Equipos viables: Mac con chip Pro o Max de 32 GB en adelante; los modelos con 64 GB o 128 GB de memoria unificada ofrecen mayor margen para lotes y contextos amplios.
- GPU de datacenter: no aplicables a esta conversion concreta. Para A100, H100 u otras GPU seria necesario recurrir al modelo base en safetensors BF16 o a otra conversion compatible con vLLM o TGI.
- Opciones de despliegue: mlx-vlm para generacion (con soporte de imagenes) y TensorFold para decodificacion especulativa con la capa MTP. No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no son opciones directas con este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni del factor de aceleracion que aporta la capa MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Capa MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Vontra/Qwen3.6-35B-A3B-MLX-4bit-MTP | 35,1 B totales (unos 3 B activos) | no disponible | 4-bit MLX | Si | Apache-2.0 | HuggingFace, 0 descargas |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35,1 B totales (mismos pesos) | no disponible | 4-bit MLX | No | Apache-2.0 | HuggingFace, revision `38740b8` |
| Qwen/Qwen3.6-35B-A3B | 35,1 B totales (unos 3 B activos) | no disponible | BF16 (sin cuantizar) | Si (pesos `mtp.*` originales) | Apache-2.0 | HuggingFace, revision `995ad96` |

La diferencia funcional entre las tres opciones es el empaquetado: este repositorio anade la capa MTP cuantizada a los mismos pesos que la conversion de mlx-community, mientras que el modelo base ofrece los pesos sin cuantizar. No se dispone de datos de rendimiento comparativos entre ellos.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que el impacto de la cuantizacion 4-bit sobre la calidad no esta cuantificado.
- La cuantizacion a 4 bits de routers y puertas a 8 bits introduce perdida de precision respecto al modelo en BF16; no se documenta el efecto sobre tareas multimodales finas.
- Riesgo de alonacion y de errores factuales inherente a los modelos generativos, no mitigado ni documentado en la model card.
- Sesgos conocidos: no disponibles; no se incluye ninguna evaluacion de sesgo ni de seguridad.
- Idiomas soportados: no especificados, lo que dificulta planificar despliegues multilingues.
- Longitud de contexto: no indicada, un dato critico para decidir su uso en tareas de contexto largo.
- Licencia Apache-2.0, heredada del modelo base, permite uso comercial, pero conviene verificar el fichero LICENSE enlazado en el repositorio de Qwen por si hubiera condiciones adicionales.
- La capa MTP solo aporta valor si el motor de inferencia implementa drafting; el soporte en TensorFold esta declarado como "en desarrollo", por lo que no es una via de produccion estable.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; no existe validacion de la comunidad sobre su correcto funcionamiento.
- Dependencia de hardware Apple Silicon: no es desplegable en infraestructura GPU convencional sin conversion adicional.
- Los resultados de la busqueda web realizada no contienen informacion tecnica sobre este modelo; los enlaces devueltos corresponden a una marca de relojes y a un personaje de animacion homonimos, sin relacion con el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vontra/Qwen3.6-35B-A3B-MLX-4bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Conversion de referencia de mlx-community: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- TensorFold (motor con drafting MTP): https://github.com/ashhart/TensorFold
