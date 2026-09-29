# taurusduan/GLM-5.3-GGUF-DGX-Spark

## Resumen

GLM-5.3-GGUF-DGX-Spark es una cuantización GGUF de terceros (autor taurusduan) del checkpoint autotrust/GLM-5.3-SLIM-E192, que a su vez es la versión comprimida mediante SLIM-Q de zai-org/GLM-5.3. Se trata de un MoE de gran escala: el modelo base declara 744.000 millones de parámetros totales y unos 40.000 millones activos por token, con 256 expertos enrutados y enrutado top-8; el proceso SLIM-Q elimina estructuralmente los 64 expertos menos usados de cada capa (25 %), dejando 192 expertos y un total real de 562.687.789.632 parámetros en el checkpoint podado. El resultado se empaqueta en un único GGUF de 149,7 GiB repartido en cuatro shards.

El objetivo declarado del repositorio es hacer viable la inferencia de un MoE de escala casi trillonaria en hardware de gama de escritorio-profesional: dos NVIDIA DGX Spark enlazados por ConnectX-7, una única GPU de 180 GB (B200/GB200) o un Mac Studio de 256 GB. Frente al GLM-5.3 completo en Q2, el archivo reduce la huella en 47 GiB (−24 %), lo que supone la diferencia entre necesitar un despliegue de clase 200 GB y caber de forma residente en dos DGX Spark.

La relevancia técnica está en que la literatura publicada de podado de expertos más cuantización baja se queda en modelos de unos 50.000 millones de parámetros; aquí se aplica a un modelo más de un orden de magnitud mayor, con una receta de 2,06 bits por peso (IQ2_XXS) en los expertos enrutados y Q8_0 en atención, routers y expertos compartidos. El repositorio no tiene descargas ni valoraciones y fue creado y actualizado el mismo día (29 de septiembre de 2026), por lo que carece de validación comunitaria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer, arquitectura `glm-dsa` (soportada por llama.cpp upstream); 78 capas; 256 expertos enrutados con enrutado top-8 (192 expertos tras el podado) |
| Parametros totales | 562.687.789.632 (~562,7B) medidos en safetensors; el modelo base GLM-5.3 declara 744B |
| Parametros activos | ~40B (dato del modelo base GLM-5.3; el podado mantiene el enrutado top-8 sobre 192 expertos, pero no se publica el recuento activo exacto del checkpoint podado) |
| Longitud de contexto | 1.000.000 de tokens en el modelo base GLM-5.3 según la documentación de Unsloth; el ejemplo de despliegue del repositorio arranca con `-c 32768` |
| Tipos de cuantizacion | IQ2_XXS en expertos enrutados (2,06 bits/peso) y Q8_0 en atención, routers y expertos compartidos; la build de producción Guru Turbo 2.0 usa NVFP4 |
| Idiomas soportados | en, zh |
| Licencia | other, con nombre `glm-5.3` (enlace a la licencia del modelo base) |
| Formato de pesos | GGUF, cuatro shards (`GLM-5.3-Q2-DGX-Spark-00001-of-00004.gguf` … `-00004-of-00004.gguf`), 149,7 GiB en total; checksums en `GLM-5.3-Q2-DGX-Spark.sha256`; tamaño del repo 160,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un MoE de tipo transformer identificado en las etiquetas como `glm-dsa`, con 78 capas y 256 expertos enrutados por capa con activación top-8. Sobre el checkpoint original de Z.AI se aplica SLIM-Q (Selective expert pruning + Low-bit quantization for Inference of MoE), una receta de compresión post-entrenamiento en dos etapas. La primera etapa perfila las frecuencias de enrutado sobre cargas de trabajo representativas y elimina de forma estructural los 64 expertos menos utilizados de cada capa; a diferencia del salto dinámico de expertos, que reduce latencia pero mantiene todos los pesos en memoria, el podado estructural reduce permanentemente la huella, que es el factor que determina en qué hardware cabe el modelo. La segunda etapa cuantiza de forma agresiva los expertos enrutados (IQ2_XXS, 2,06 bits/peso) mientras mantiene en alta precisión atención, routers y expertos compartidos, preservando el comportamiento de enrutado del que depende la calidad del MoE.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. Las ganancias de GLM-5.3 respecto a GLM-5.2 proceden, según la documentación de Unsloth, íntegramente del post-entrenamiento, ya que comparten modelo base. El perfil de podado es deliberadamente orientado a carga de trabajo: el coste en calidad se concentra en benchmarks de conocimiento tipo examen chino y en GPQA-Diamond, mientras que el rendimiento en código, agentes y ciberseguridad —el objetivo de diseño— se preserva casi intacto. El repositorio acoge además la relación con Guru Turbo 2.0, la build servida en NVFP4 a través de ScienceGuru y Guru Apps.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno en inglés y chino.
- Generación de código de alta calidad: el A/B declarado mantiene HumanEval en 95,1 tras el podado.
- Razonamiento matemático: el podado supone una pérdida declarada de 2,5 puntos en AIME.
- Tool calling y function calling: BFCL live 69,4 y BFCL multi-turn 72,5 en el checkpoint podado frente a la base original.
- Uso agéntico y razonamiento de varios pasos: el modelo base GLM-5.3 declara SOTA en Terminal Bench 3.0 y Agents' Last Exam (dato atribuido al modelo completo, no específicamente a esta compresión).
- Conocimiento y análisis en ciberseguridad: CyberMetric 87,7 en la base podada.
- Ventana de contexto larga: hasta 1M de tokens en el modelo base, lo que habilita tareas sobre repositorios o documentación extensa.
- Capacidades multilingües limitadas a inglés y chino según la model card.
- No se declaran capacidades de visión, audio ni modo de pensamiento explícito para esta build.

## Casos de uso

- Agentes de código en local: el modelo mantiene HumanEval en 95,1 tras el podado y soporta tool calling, por lo que puede integrarse en flujos de edición de repositorio, generación de parches y ejecución de tests dentro de un clúster propio de dos DGX Spark sin enviar código a terceros.
- Automatización de atención al cliente en chino e inglés: con una ventana de hasta 1M de tokens en el modelo base, permite mantener historiales de conversación muy largos y documentación de producto embebida en el mismo contexto, aunque el despliegue en DGX Spark del ejemplo arranca con 32.768 tokens.
- Copiloto de ciberseguridad: el rendimiento en CyberMetric (87,7) se mantiene prácticamente intacto tras el podado, lo que lo hace adecuado para triaje de alertas, resumen de informes de vulnerabilidades y asistencia en análisis de malware en entornos aislados.
- Razonamiento agéntico multi-paso con llamadas a herramientas: los valores BFCL live 69,4 y multi-turn 72,5 permiten construir orquestadores que encadenan búsqueda, cálculo y consultas a APIs internas, con la ventaja de que solo cruzan el enlace ConnectX-7 las activaciones, no los pesos.
- Servicio de inferencia multi-cliente en una GPU de 180 GB: los 177 t/s agregados medidos con 32 peticiones paralelas sobre una B200/GB200 permiten atender un equipo interno con un único nodo y un solo proceso llama-server.
- Procesamiento de documentación técnica bilingüe: traducción, resumen y extracción de datos en pares inglés-chino sobre contratos, normativa o manuales extensos, aprovechando el contexto largo.
- Estación de trabajo para desarrollo en Mac Studio: la residencia completa en 256 GB (192 GB con contexto reducido) permite usar el modelo en Metal como asistente de escritorio sin depender de servicios externos.
- Investigación en compresión de MoE: el repositorio sirve como caso de estudio reproducible de podado estructural más cuantización de 2 bits sobre un modelo de escala casi trillonaria, con la comparativa de calidad declarada por el autor del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos de esta build GGUF en IQ2_XXS. Las cifras disponibles corresponden al A/B declarado por AutoTrust sobre la base podada en FP8 frente al GLM-5.3 original, evaluado bajo vLLM:

| Benchmark | GLM-5.3 original (FP8) | Base podada (FP8) | Variacion |
|---|---|---|---|
| HumanEval | 95,1 | 95,1 | 0,0 |
| CyberMetric | 88,0 | 87,7 | −0,3 |
| BFCL live | 69,6 | 69,4 | −0,2 |
| BFCL multi-turn | 73,0 | 72,5 | −0,5 |
| AIME | no disponible (valor absoluto) | no disponible (valor absoluto) | −2,5 puntos |
| C-Eval | 92,0 | 84,7 | −7,3 |
| GPQA-Diamond | 86,9 | 83,3 | −3,6 |

Datos de rendimiento de inferencia declarados por el autor: 42 t/s en un único flujo y 177 t/s agregados con 32 peticiones paralelas sobre una GPU de 180 GB (B200/GB200); en un único DGX Spark con residencia parcial vía mmap, velocidad de un solo dígito en t/s. La decodificación está limitada por ancho de banda de memoria, con aproximadamente 25 GB de pesos leídos por token.

## Requisitos de hardware

- Huella de pesos: 149,7 GiB en cuatro shards GGUF. Se recomienda almacenar el archivo en las dos máquinas o en almacenamiento compartido.
- Dos DGX Spark (128 GB de memoria unificada cada uno) enlazados por ConnectX-7: configuración objetivo; con `--tensor-split 1,1` se colocan unos 75 GiB de pesos por máquina, dejando unos 40 GiB por nodo para contexto y buffers. Solo cruzan el enlace las activaciones, por lo que los 200 GbE de ConnectX no son el cuello de botella.
- Un único DGX Spark: funciona con residencia parcial y paginación desde NVMe, pero con velocidad de un solo dígito en t/s; para un solo Spark el propio autor recomienda GLM-5.3-Flash-GGUF-DGX-Spark (79 GiB).
- Una GPU de 180 GB (B200/GB200): residencia completa, 42 t/s en un flujo y 177 t/s con 32 peticiones paralelas (medido).
- Mac Studio de 256 GB: residencia completa con Metal, o 192 GB con contexto reducido.
- No cabe en GPUs de consumo: una RTX 4090 (24 GB), una RTX 5090 o similares quedan muy lejos de los 149,7 GiB de pesos.
- Despliegue: llama.cpp upstream (la arquitectura `glm-dsa` está soportada), compilado con `-DGGML_CUDA=ON -DGGML_RPC=ON -DCMAKE_CUDA_ARCHITECTURES=121a-real`; servidor con `llama-server -ngl 99 -fa on --rpc <ip>:50052 --tensor-split 1,1 --cont-batching`. No se documenta soporte para vLLM, TGI u Ollama en esta build concreta.
- Requisitos de VRAM estimados: prácticamente los 149,7 GiB de pesos más el espacio de contexto y buffers; el repositorio cita ~25 GB de tráfico de pesos por token decodificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-GGUF-DGX-Spark (esta ficha) | 562,7B totales (~40B activos, base 744B) | 1M (base) | IQ2_XXS, 149,7 GiB en 4 shards | other (glm-5.3) | GGUF para llama.cpp |
| GLM-5.3 completo en Q2 | 744B totales, ~40B activos | 1M | Q2 (~196,7 GiB, inferido de la reduccion declarada de 47 GiB) | other (glm-5.3) | requiere despliegue de clase 200 GB |
| GLM-5.3-Flash | 320B totales, 18B activos | 1M | GGUF de 79 GiB (`autotrust/GLM-5.3-Flash-GGUF-DGX-Spark`) y UD-Q2_K_XL de 109 GB (unsloth); checkpoint nativo en FP8 de 328 GB | no disponible en la informacion proporcionada | primer modelo multimodal nativo de la serie, publicado el 26 de agosto de 2026 |

Frente a GLM-5.3-Flash, esta build ofrece presumiblemente mayor calidad por venir del modelo de 744B, a cambio de triplicar la huella y exigir dos DGX Spark o una GPU de 180 GB en lugar de un único Spark.

## Limitaciones y advertencias

- Degradacion en conocimiento pesado: el podado de expertos reduce C-Eval de 92,0 a 84,7 (−7,3 puntos) y GPQA-Diamond de 86,9 a 83,3 (−3,6 puntos). No es un modelo recomendable para tareas de conocimiento enciclopédico o examen académico.
- Perdida en matematicas: 2,5 puntos en AIME respecto a la base original.
- Cuantizacion de 2,06 bits: las cifras de calidad citadas proceden de la base podada en FP8 bajo vLLM, no de esta build IQ2_XXS. La degradacion adicional introducida por IQ2_XXS no se cuantifica en la informacion disponible.
- Idiomas: solo ingles y chino declarados. No hay soporte documentado de castellano ni de otros idiomas.
- Contexto efectivo: aunque el modelo base declara 1M de tokens, el ejemplo de despliegue usa 32.768, y la memoria de contexto compite con los pesos en los ~40 GiB libres por DGX Spark.
- Licencia: `other` con nombre `glm-5.3`. No se detallan en la informacion disponible las condiciones de uso comercial; debe consultarse el archivo LICENSE del repositorio zai-org/GLM-5.3 antes de cualquier uso en produccion.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad ni tasas de alucinacion para esta compresion; aplican las limitaciones habituales de los modelos generativos de gran escala.
- Validacion: repositorio con 0 descargas y 0 valoraciones, creado y actualizado el 29 de septiembre de 2026. Es una cuantizacion de terceros sobre un checkpoint de terceros, no una publicacion oficial de Z.AI.
- Rendimiento en un solo DGX Spark: la residencia parcial con paginacion desde NVMe reduce la velocidad a un solo digito en t/s, lo que en la practica lo descarta para uso interactivo en esa configuracion.
- Model card incompleta: el texto proporcionado se corta al final de la seccion de arranque rapido, por lo que pueden faltar notas de despliegue adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taurusduan/GLM-5.3-GGUF-DGX-Spark
- Modelo base original: https://huggingface.co/zai-org/GLM-5.3
- Checkpoint comprimido SLIM-Q: https://huggingface.co/autotrust/GLM-5.3-SLIM-E192
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Build alternativa para un solo DGX Spark: https://huggingface.co/autotrust/GLM-5.3-Flash-GGUF-DGX-Spark
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentacion de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/glm-5.3
- Documentacion de Unsloth para GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3-flash
- Guia de despliegue de GLM-5.3-Flash (codersera): https://codersera.com/blog/how-to-run-glm-5-3-flash-locally-2026/
- Guia de GGUF, hardware y benchmarks de GLM-5.3-Flash (atomic.chat): https://atomic.chat/blog/guides/how-to-run-glm-5-3-flash-locally
- Repositorio de despliegue en un solo Spark: https://github.com/Weschera/glm53-flash-one-spark
