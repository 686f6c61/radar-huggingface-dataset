# vaultai/Qwen3.8-Flash-Next-MLX-oQ4-MTP

## Resumen

Qwen3.8-Flash-Next-MLX-oQ4-MTP es una conversion comunitaria a formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario vaultai (la model card atribuye la conversion a "Vontra"). No es un modelo entrenado desde cero ni un lanzamiento oficial de Qwen: se trata de un checkpoint cuantizado en 4 bits mixtos (esquema oQ4) generado directamente desde los pesos BF16 oficiales, con el bloque MTP (multi-token prediction) nativo preservado para decodificacion especulativa.

El modelo base es un MoE disperso con capacidades de vision y lenguaje, con arquitectura `qwen4_exp`, 48 capas, 512 expertos enrutados (10 activos mas 1 compartido), hidden size de 2.560, 24 cabezas de atencion y 2 cabezas KV, y una ventana de contexto configurada de 262.144 tokens. El repositorio pesa 113,3 GB (105,54 GiB) repartidos en 22 shards y 3.747 tensores, e incluye 76 tensores MTP convertidos.

Su relevancia practica es acotada pero concreta: permite ejecutar un modelo MoE vision-lenguaje de gran tamano con decodificacion especulativa integrada sobre Apple Silicon mediante MLX, algo que los pesos BF16 originales no permiten en hardware de consumo. El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y exige un runtime con soporte explicito de `qwen4_exp` y MTP nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp`: MoE disperso vision-lenguaje con Gated DeltaNet, Qwen Sparse Attention, residuales gateados ensanchados, embeddings hashed de bigramas y trigramas, y bloque MTP nativo |
| Parametros totales | 179.999.981.459 (~180B) segun safetensors. La model card desglosa 125B en el modelo de lenguaje + 51B en embeddings de n-gramas |
| Parametros activos | ~6B (modelo de lenguaje; no incluye las tablas de embeddings de n-gramas) |
| Longitud de contexto | 262.144 tokens configurados |
| Tipos de cuantizacion | oQ4 de precision mixta: base 4-bit affine con 232 modulos protegidos o sobrescritos a 5/8 bits; group size 32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (campo `license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | MLX safetensors, 22 shards, 3.747 tensores (76 de ellos MTP) |
| Tamano del repositorio | 113,3 GB (105,54 GiB) |
| Libreria | mlx |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Fecha de creacion | 2026-10-04 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente combina varias piezas: capas MoE dispersas con 512 expertos enrutados (10 activos mas 1 compartido), Gated DeltaNet, Qwen Sparse Attention, flujos residuales gateados ensanchados y tablas de embeddings hashed de bigramas y trigramas de 51B parametros. El modelo de lenguaje tiene 48 capas, hidden size de 2.560 y 24 cabezas de atencion frente a solo 2 cabezas KV, lo que reduce el coste de cache. Incluye un bloque MTP nativo (un unico bloque draft Qwen4Exp) que habilita decodificacion especulativa sin necesidad de un modelo drafter externo.

Sobre el entrenamiento no hay informacion en el material proporcionado: no se documentan numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento. La model card remite a la model card oficial de Qwen/Qwen3.8-Flash-Next para evaluaciones, uso previsto, limitaciones y discusion completa de arquitectura.

Lo especifico de este repositorio es el proceso de conversion, no el entrenamiento: el conversor leyo el checkpoint BF16 oficial, midio sensibilidad por capa con un proxy local validado y asigno una base de 4 bits con 232 modulos protegidos. La validacion estructural cubrio los 3.747 tensores indexados y los 22 shards; la validacion de MTP confirmo una capa draft configurada y 76 tensores MTP convertidos. El group size 32 se eligio para soportar las tablas de embeddings hashed de ancho 160. El tokenizer, la plantilla de chat, el procesador de vision y la configuracion de generacion del modelo original se conservan.

## Capacidades

- Generacion de texto conversacional multi-turno con soporte de plantilla de chat heredada del modelo original.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`, con procesador de vision preservado).
- Razonamiento con ventana de contexto larga: hasta 262.144 tokens configurados.
- Decodificacion especulativa mediante MTP nativo integrado (un bloque draft), con tasas de aceptacion medidas entre 58,3% y 89,5% en las pruebas del autor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Modo thinking explicito: no documentado en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local de un MoE vision-lenguaje en Apple Silicon: el checkpoint esta disenado para ejecutarse con MLX sobre Macs con memoria unificada amplia, permitiendo usar un modelo de ~180B parametros totales con ~6B activos sin depender de GPUs dedicadas.
- Analisis de documentos largos con imagen: gracias a los 262.144 tokens de contexto y al procesador de vision, se pueden pasar lotes de paginas escaneadas junto con preguntas extensas en una sola ventana.
- Generacion acelerada por decodificacion especulativa: el bloque MTP nativo permite aumentar el throughput de generacion en el mismo runtime, util en tareas de completado repetitivo o generacion de borradores a gran volumen.
- Prototipado e investigacion en Vision-Language sobre hardware de consumo profesional: el formato oQ4 reduce el peso a 113,3 GB, lo que hace viable experimentar con un modelo de esta escala en una estacion de trabajo Mac en lugar de un cluster.
- Evaluacion comparativa de cuantizacion: sirve como referencia para medir el impacto del esquema oQ4 (base 4-bit mas 232 modulos a 5/8 bits, group size 32) frente a los pesos BF16 originales.
- Despliegue de asistentes conversacionales de contexto largo en entornos con requisitos de privacidad: al ejecutarse localmente, los datos no salen del equipo, lo que encaja en flujos con informacion sensible.
- Integracion en pipelines de investigacion con MLX-VLM: al conservar tokenizer, plantilla de chat y configuracion de generacion, se puede enchufar en herramientas existentes que ya consuman modelos MLX-VLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de vision en el material proporcionado. Lo unico disponible son mediciones de velocidad del autor en un Apple M3 Studio con MTP nativo activado:

| Prueba | Tokens de salida | Velocidad |
|---|---:|---:|
| Completado crudo, primera ejecucion medida | 32 | 29,4 tokens/s |
| Completado crudo, calentado | 32 | 34,4 tokens/s |
| Chat con instruccion exacta | 27 | 17,4 tokens/s |
| Chat informal | 71 | 39,7 tokens/s |

El autor indica que las dos ejecuciones deterministas de completado crudo produjeron salidas identicas, que la prueba de instruccion exacta devolvio `hello` y que el chat largo se completo de forma coherente sin repeticiones ni errores de reconciliacion de cache. La aceptacion del draft MTP se mantuvo entre el 58,3% y el 89,5% en estas pruebas. El propio autor advierte que los resultados varian con la longitud del prompt, el estado de la cache, los ajustes de muestreo, la version del runtime y la presion de memoria.

## Requisitos de hardware

- Almacenamiento: 113,3 GB para los pesos (105,54 GiB). El repositorio ocupa 113,3 GB.
- Memoria unificada estimada: al ser un checkpoint MLX, requiere Apple Silicon. Con 113,3 GB solo de pesos, mas cache KV para ventanas largas y overhead del runtime, se necesita un Mac con 128 GB o mas de memoria unificada. Para explotar los 262.144 tokens de contexto de forma comoda, se recomienda 192 GB o superior. Estas cifras son estimaciones derivadas del tamano del repositorio, no datos publicados por el autor.
- GPU recomendadas: exclusivamente Apple Silicon (la model card cita un Apple M3 Studio). No hay soporte declarado para A100, H100 ni RTX 4090; MLX no se ejecuta sobre CUDA.
- Cabe en GPU de consumo: no aplica en el sentido habitual. En el ecosistema Apple, encaja en configuraciones de gama alta como M3 Ultra o M3 Studio con memoria unificada amplia; no cabe en un Mac de 32 o 64 GB.
- Opciones de despliegue: oMLX o MLX-VLM con soporte explicito de `qwen4_exp` y MTP nativo. Los runtimes estandar que no construyan el modulo MTP Qwen4Exp pueden rechazar los 76 tensores MTP durante la carga estricta de pesos. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en un Apple M3 Studio con MTP nativo, entre 17,4 y 39,7 tokens/s segun el tipo de prueba (ver tabla de benchmarks). No hay datos para otras configuraciones.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con su modelo base. No hay datos de benchmarks ni de especificaciones de alternativas en el material proporcionado.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MLX-oQ4-MTP (esta conversion) | ~180B totales / ~6B activos | 262.144 tokens | MLX safetensors, oQ4, 113,3 GB | qwen-community-1.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (modelo base) | ~180B totales / ~6B activos | 262.144 tokens | safetensors BF16 | qwen-community-1.0 | HuggingFace, oficial |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un lanzamiento oficial de Qwen: es una conversion comunitaria. El autor lo declara explicitamente y remite al modelo base para evaluaciones y guias de seguridad.
- Discrepancia de autoria: los metadatos de HuggingFace atribuyen el repositorio a `vaultai`, mientras que la model card y los enlaces internos apuntan a `Vontra`. Conviene verificar la procedencia antes de usarlo en produccion.
- Requisito de runtime estricto: necesita oMLX o MLX-VLM con soporte explicito de `qwen4_exp` y MTP nativo. Los runtimes estandar pueden fallar al cargar los 76 tensores MTP.
- Advertencia explicita del autor: no se debe acoplar un drafter Qwen3.8 27B a este modelo, porque Flash Next tiene dimensiones ocultas distintas y ya incluye su propio bloque MTP compatible.
- Idiomas soportados: no disponibles. No se puede planificar cobertura multilingue con la informacion proporcionada.
- Riesgo de alucinacion: no documentado en la informacion disponible. No hay evaluaciones de fidelidad ni de tasas de error.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia: Qwen Community License 1.0, marcada como `license: other`. No se detallan en el material proporcionado las condiciones concretas de uso comercial; hay que revisar el fichero LICENSE incluido en el repositorio y la licencia del modelo base antes de cualquier despliegue comercial.
- Sin validacion externa: 0 descargas y 0 likes. Las unicas pruebas de generacion son las del propio autor, con cuatro casos y entre 27 y 71 tokens de salida, un conjunto demasiado pequeno para extrapolar comportamiento en produccion.
- La cuantizacion oQ4 introduce perdida de precision respecto a BF16. No hay evaluaciones de degradacion de calidad publicadas para esta conversion.
- Restriccion de plataforma: MLX limita el uso a Apple Silicon, lo que excluye clusters CUDA y complica el escalado horizontal.
- Los resultados de velocidad publicados corresponden a una unica maquina (Apple M3 Studio) y el autor advierte que varian con la longitud del prompt, la cache, el muestreo, la version del runtime y la presion de memoria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vaultai/Qwen3.8-Flash-Next-MLX-oQ4-MTP
- Repositorio citado en la model card: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Vision general de Qwen sobre el modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Repositorio MLX-VLM: https://github.com/ml-explore/mlx-vlm
- Sitio de Qwen: https://qwen.ai/
- Licencia: fichero LICENSE del repositorio (Qwen Community License 1.0)

Nota: la busqueda web realizada no devolvio ningun resultado tecnico relevante sobre este modelo ni sobre su modelo base. Los unicos resultados obtenidos fueron sitios de contenido para adultos sin relacion alguna con el tema, por lo que no se incluyen como enlaces.
