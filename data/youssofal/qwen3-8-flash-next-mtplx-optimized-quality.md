# Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Quality

## Resumen

Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Quality es una conversión y empaquetado en 8 bits del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Youssofal y pensada exclusivamente para equipos Apple Silicon con memoria unificada de 256 GB o 512 GB mediante la librería MTPLX. El modelo base se describe en la propia model card como un MoE híbrido de la generación Qwen4 con Qwen Sparse Attention, una tabla de n-gramas de 51.000 millones de parámetros y una cabeza de predicción multi-token (MTP); el pack de este repositorio conserva esa estructura y la cuantiza para ejecución local en macOS.

El propósito de esta build, denominada «Optimized Quality», es preservar la mayor fidelidad posible de los pesos (8 bits con grupo 64 en el modelo principal y en la cabeza draft) a cambio de un mayor consumo de memoria: los pesos, la cabeza draft y la torre de visión necesitan unos 128,5 GiB, mientras que la tabla de n-gramas de 32 GB se transmite desde el SSD. Frente a la build «Optimized Speed» del mismo autor, esta versión mueve el doble de bytes por token, por lo que se espera una decodificación más lenta, aunque el autor no ha medido todavía la velocidad en máquinas de 256 GB ni de 512 GB.

Es relevante ahora porque ilustra una tendencia concreta: modelos de gran tamaño (125B-A6B según la model card) empaquetados con decodificación especulativa exacta y cuantización mixta por clase de tensor para ejecutarse en hardware de escritorio de Apple, sin GPU dedicada. El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y se distribuye bajo la licencia Qwen Community License 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) híbrida de generación Qwen4, con Qwen Sparse Attention, proyecciones y convoluciones GDN, conexiones hiper, tabla de n-gramas y cabeza de predicción multi-token (MTP) |
| Parámetros totales | 36.299.458.451 elementos almacenados según los metadatos de safetensors; la model card describe el modelo base como 125B-A6B (discrepancia no explicada en la información disponible) |
| Parámetros activos | A6B según la model card (no se detalla el desglose exacto) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Modelo principal y cabeza draft en 8 bits, grupo 64, cuantización afín con escalas y sesgos en BF16; tabla de n-gramas en 4 bits, grupo 32, afín con escalas y sesgos en BF16; pesos estructurales (normas, GDN conv/log/dt bias, conexiones hiper, torre de visión, proyecciones PLE) en BF16; búferes enteros PLE en I64 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0); el archivo LICENSE se incluye en el repositorio |
| Formato de pesos | safetensors (empaquetado específico para MTPLX/MLX, no compatible con llama.cpp ni con el formato GGUF) |
| Tamaño de la descarga | 169,96 GB |
| Modelo base | Qwen/Qwen3.8-Flat-Next, revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540` |
| Receta de conversión | `flash-next-optimized-quality` |
| Librería y versión mínima | mtplx, requiere MTPLX 2.12.0 o superior |
| Fecha de creación / actualización | 22 de septiembre de 2026 / 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un MoE híbrido de la generación Qwen4 con Qwen Sparse Attention, atención de tipo gated delta (los tensores `gdn` incluyen proyecciones, convolución y sesgo `dt`), conexiones hiper (`hyper connections`), proyecciones PLE con búferes enteros y una tabla de n-gramas de 51.000 millones de parámetros. Sobre esa estructura se añade una cabeza de predicción multi-token (`mtp`), con su propia atención, router, expertos enrutados, experto compartido, indexador QSA y conexiones hiper. El pack también incluye una torre de visión en BF16 (0,898 GB). No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO: esos datos corresponden al modelo base y no se reproducen en este repositorio.

La contribución de este repositorio es la cuantización mixta por clase de tensor sumada al soporte de decodificación especulativa de MTPLX. Los pesos con mayor huella se almacenan en 8 bits con grupo 64 (afín, con escalas y sesgos en BF16); la tabla de n-gramas se guarda en 4 bits con grupo 32; y los pesos estructurales que afectan a la estabilidad numérica permanecen en BF16. La model card indica que MTPLX muestrea con los ajustes oficiales de Qwen 3.8 (temperatura 1,0, top-p 0,95, top-k 20) y que los borradores se aceptan con muestreo especulativo exacto, de modo que la salida sigue la distribución propia del modelo. No se documentan innovaciones de entrenamiento propias de esta conversión, solo de empaquetado e inferencia.

Desglose de pesos por clase de tensor (tamaños declarados en la model card):

| Clase de tensor | Precisión | Tamaño (GB) |
|---|---|---:|
| routed experts | Q8/g64 afín; escalas y sesgos BF16 | 128,345702 |
| n-gram table | Q4/g32 afín; escalas y sesgos BF16 | 32,000154 |
| gdn projections | Q8/g64 afín; escalas y sesgos BF16 | 2,215342 |
| hyper connections | BF16 | 1,279263 |
| vision tower | BF16 | 0,897862 |
| embeddings | Q8/g64 afín; escalas y sesgos BF16 | 0,675430 |
| lm head | Q8/g64 afín; escalas y sesgos BF16 | 0,675430 |
| attention | Q8/g64 afín; escalas y sesgos BF16 | 0,635044 |
| shared expert | Q8/g64 afín; escalas y sesgos BF16 | 0,250675 |
| router | Q8/g64 afín; escalas y sesgos BF16 | 0,066977 |
| ple projections and conv | BF16 | 0,065618 |
| mtp routed experts | Q8/g64 afín; escalas y sesgos BF16 | 2,673869 |

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y entre las etiquetas figura `conversational`.
- Razonamiento y conocimiento general heredados de un MoE de gran tamaño: la model card describe el modelo base como 125B-A6B, con solo una fracción de parámetros activos por token.
- Decodificación especulativa con predicción multi-token: la cabeza MTP y el soporte de MTPLX permiten aceptar borradores con muestreo especulativo exacto.
- Atención dispersa: el indexador `qsa indexer` y Qwen Sparse Attention forman parte de la arquitectura empaquetada.
- Tabla de n-gramas de 51.000 millones de parámetros, almacenada en 4 bits y transmitida desde SSD durante la inferencia.
- Procesamiento de imágenes: el pack incluye una torre de visión en BF16, aunque la información disponible no detalla qué tareas de visión concretas soporta.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara lista de idiomas.
- Modo de pensamiento explícito u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac Studio o Mac Pro con 256 GB o 512 GB de memoria unificada: es el escenario objetivo declarado por el autor; el pack deja unos 59,5 GiB libres para contexto y caché de sesión, lo que permite mantener sesiones largas sin salir de la máquina.
- Sustitución de una build de mayor velocidad cuando prima la fidelidad: al mantener el modelo principal y la cabeza draft en 8 bits, esta variante está pensada para usuarios que prefieren calidad de salida sobre latencia, aceptando el doble de bytes por token respecto a «Optimized Speed».
- Asistente conversacional de uso interno sobre documentos extensos: con ~59,5 GiB disponibles para contexto y caché en máquinas de 256 GB, se pueden encadenar turnos largos con material de referencia precargado, siempre que se valide empíricamente la longitud de contexto efectiva (no publicada).
- Experimentación con decodificación especulativa sobre Apple Silicon: el repositorio sirve como banco de pruebas para medir la aceptación de borradores de la cabeza MTP y el impacto de la cuantización mixta en la distribución de salida.
- Procesamiento de imágenes dentro de un flujo de texto: la torre de visión en BF16 permite, en principio, tareas que combinen imagen y lenguaje en el mismo proceso local, aunque no se especifican las tareas soportadas.
- Investigación sobre MoE dispersos en hardware sin CUDA: permite estudiar el comportamiento de Qwen Sparse Attention y del enrutado de expertos en MLX, sin depender de GPU dedicada.
- Evaluación comparada de recetas de cuantización: la tabla de precisión por clase de tensor facilita reproducir experimentos sobre el equilibrio entre 8 bits en expertos enrutados y BF16 en pesos estructurales.
- Archivado y distribución offline de un modelo grande: el repo incluye `size-checksums.json` con el tamaño y el SHA-256 de cada archivo, lo que permite verificar la integridad de la descarga de 169,96 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que la velocidad en Macs de 256 GB y 512 GB «no está medida todavía» y que, dado que los pesos en 8 bits mueven el doble de bytes por token que la build «Optimized Speed», cabe esperar una decodificación más lenta; no se aportan cifras de tokens por segundo, latencia ni resultados de MMLU, HumanEval, GSM8K u otras evaluaciones.

## Requisitos de hardware

- Memoria unificada mínima: 256 GB. La model card indica explícitamente que una máquina de 128 GB no puede cargar el modelo, porque solo los pesos, la cabeza draft y la torre de visión necesitan unos 128,5 GiB.
- Configuración recomendada: Mac con 256 GB o 512 GB de memoria unificada, con unos 59,5 GiB libres para contexto y caché de sesión.
- Almacenamiento: 169,96 GB de descarga; además, la tabla de n-gramas de 32 GB se transmite desde el SSD durante la inferencia, por lo que se recomienda almacenamiento interno rápido (NVMe).
- GPU dedicada: no aplica; el pack está diseñado para Apple Silicon mediante MTPLX/MLX y sus etiquetas incluyen `apple-silicon`, `macos` y `mac-studio`.
- GPU de consumo (RTX 4090, etc.): no soportado por este empaquetado; no hay ruta de despliegue documentada para CUDA.
- Opciones de despliegue: aplicación de escritorio de MTPLX o CLI mediante `pip install mtplx` y `mtplx serve --model Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Quality --model-id mtplx-flash-next-optimized-quality`, con MTPLX 2.12.0 o superior.
- Otras opciones (vLLM, llama.cpp, Ollama, TGI): no disponibles; el formato es específico de MTPLX/MLX y no se documenta compatibilidad con esos motores.
- Latencia y throughput: no disponibles; el autor declara que la velocidad aún no se ha medido en los equipos objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Quality | 36.299.458.451 elementos almacenados (base descrito como 125B-A6B) | no disponible | 8 bits g64 en modelo principal y draft; 4 bits g32 en n-gramas; BF16 en pesos estructurales | qwen-community-1.0 | HuggingFace, vía MTPLX 2.12.0+ |
| Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed | mismo modelo base | no disponible | no disponible en la información proporcionada | qwen-community-1.0 | HuggingFace, recomendado por el autor en Macs de 128 GB o más |
| Qwen/Qwen3.8-Flash-Next | 125B-A6B (modelo base) | no disponible | pesos originales del modelo base | Qwen Community License | HuggingFace (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`) |

No se dispone de datos de rendimiento comparado entre estas variantes ni con modelos de otras familias; la información proporcionada no incluye benchmarks.

## Limitaciones y advertencias

- Requisito de memoria muy alto: no se puede cargar en máquinas de 128 GB; el objetivo son equipos de 256 GB o 512 GB.
- Dependencia de la librería MTPLX: exige la versión 2.12.0 o superior y el formato no es portable a llama.cpp, vLLM, TGI ni Ollama.
- Velocidad sin medir: el autor declara que el rendimiento en los Macs objetivo no está medido y anticipa una decodificación más lenta que la build «Optimized Speed» por mover el doble de bytes por token.
- Dependencia de almacenamiento: la tabla de n-gramas de 32 GB se transmite desde el SSD, lo que puede afectar a la latencia y al desgaste del disco en uso intensivo.
- Cuantización con pérdida: el modelo principal y la cabeza draft se almacenan en 8 bits y la tabla de n-gramas en 4 bits, lo que puede degradar la calidad respecto a los pesos originales; no se publican evaluaciones que cuantifiquen esa pérdida.
- Idiomas soportados no declarados: no hay lista de idiomas en el repositorio, por lo que no se puede garantizar el comportamiento en castellano ni en otros idiomas sin evaluarlo.
- Longitud de contexto no publicada: aunque la model card menciona unos 59,5 GiB libres para contexto y caché, no se especifica la ventana de contexto máxima.
- Riesgo de alucinación: inherente a los modelos generativos; al no existir benchmarks ni evaluaciones publicadas de esta conversión, no se puede acotar su fiabilidad factual.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan del modelo base y de sus datos de entrenamiento, no documentados aquí.
- Licencia: Qwen Community License 1.0 (identificador `qwen-community-1.0`), con etiqueta `license:other`. Es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que se trata de una licencia comunitaria con condiciones específicas y no de una licencia permisiva estándar.
- Advertencia de producción: el repositorio tiene 0 descargas y 0 «likes», sin resultados de benchmarks ni mediciones de rendimiento, por lo que no conviene desplegarlo en entornos críticos sin una validación previa propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Quality
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build alternativa «Optimized Speed» del mismo autor: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed
- MTPLX (sitio del proyecto y de la herramienta de conversión y serving): https://mtplx.com
- Archivo de licencia incluido en el repositorio: LICENSE (Qwen Community License 1.0)
- Model card del modelo base preservada en el repositorio: README-upstream-qwen.md
- Manifiesto de integridad de la descarga: size-checksums.json
