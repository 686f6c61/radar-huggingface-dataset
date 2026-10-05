# ursuciprian/Qwen3.8-Flash-Next-NVFP4-GDN-MSE

## Resumen

Qwen3.8-Flash-Next-NVFP4-GDN-MSE es un checkpoint cuantizado derivado de `local-inference-lab/Qwen3.8-Flash-Next-NVFP4` (revisión `7c4f1bc1`), publicado por el usuario ursuciprian. Se trata de un modelo multimodal de tipo image-text-to-text, con arquitectura híbrida que combina capas de atención lineal Gated DeltaNet, atención convencional, una mezcla de expertos con expertos enrutados y compartidos, un módulo de predicción multi-token (MTP) y un codificador de visión. El recuento real de parámetros en safetensors es de 91.638.563.731.

El cambio respecto al checkpoint base es acotado y quirúrgico: los pesos de proyección Gated DeltaNet (108 tensores repartidos en 36 capas) se almacenan en NVFP4 weight-only en lugar de MXFP8. Todo lo demás, incluidos expertos enrutados y compartidos, atención, tablas PLE, módulo MTP, codificador de visión, tokenizador y plantilla de chat, es idéntico byte a byte al checkpoint de origen. La motivación declarada por el autor es de rendimiento en decodificación: durante la fase de decode las proyecciones GDN operan con 1 a 40 filas por paso, y en ese régimen un GEMM W4A16 NVFP4 lee aproximadamente la mitad de bytes de peso que MXFP8, lo que acelera cada paso.

Es relevante ahora porque forma parte de una receta concreta de despliegue en un único DGX Spark (`qwen3.8-flash-next-1x-dgx-spark`, v3d), publicada junto al repositorio de recetas del autor. El autor reporta mejoras medidas de en torno al 4-6 % en velocidad de decodificación con controles emparejados, manteniendo una puerta de calidad interna que no se degrada. La licencia es la Qwen Community License 1.0, heredada del modelo base, con condiciones específicas para Model-as-a-Service y asistentes de trabajo con IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 36 capas con atención lineal Gated DeltaNet (GDN), capas de atención completa, mezcla de expertos (MoE) con expertos enrutados y compartidos, módulo MTP y codificador de visión |
| Parametros totales | 91.638.563.731 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el autor reporta recuperacion 20/20 a 8K, 32K, 64K y 128K) |
| Tipos de cuantizacion | NVFP4 W4A16 (valores E2M1, escala E4M3 por bloque de 16, escala global FP32) en los tensores GDN; MXFP8 en el resto de pesos cuantizados; etiqueta `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (Qwen Community License 1.0) |
| Formato de pesos | safetensors (36 fragmentos, `model-00035-of-00036.safetensors` es el que difiere del base) |
| Tamano del repositorio | 104,9 GB |
| Modalidad | image-text-to-text (texto e imagen a texto) |
| Modelo base | `local-inference-lab/Qwen3.8-Flash-Next-NVFP4`, revision `7c4f1bc1`; origen BF16 `Qwen/Qwen3.8-Flash-Next`, revision `de4b8e4d` |
| Biblioteca de carga | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es híbrida. El bloque central son 36 capas de Gated DeltaNet, un mecanismo de atención lineal, combinadas con capas de atención completa y con una mezcla de expertos que incluye tanto expertos enrutados como expertos compartidos. Además incorpora un módulo MTP (multi-token prediction), habitualmente usado para decodificación especulativa, un codificador de visión que habilita la entrada de imágenes, y tablas PLE. El checkpoint pesa 91.638.563.731 parámetros totales en safetensors; el número de parámetros activos por token no se indica en la información disponible.

No se aportan datos sobre el entrenamiento del modelo origen: no se especifica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Lo que sí se documenta con detalle es el proceso de cuantización de este derivado. Los pesos se cuantizaron en CPU a partir del modelo base en BF16. Antes de escribir nada, el proceso de build verificó que esos tensores están congelados en el checkpoint base: la MXFP8 de los pesos BF16 reproduce bit a bit los tensores MXFP8 publicados, tanto valores como escalas. Es decir, la cuantización NVFP4 no se aplicó sobre pesos vivos, sino sobre tensores que ya estaban congelados durante la destilación.

La innovación técnica destacable está en la elección de escalas. Cada bloque de 16 elementos escoge su escala mediante una búsqueda de error cuadrático medio (MSE) sobre factores de escala de 1,0 hasta 0,8, en lugar de tomar directamente el máximo del bloque. El resultado es un error relativo medio de peso frente a BF16 de 0,0877, frente a 0,0937 con redondeo absmax simple. Además, `in_proj_qkv` e `in_proj_z` de una misma capa comparten una única escala global, porque vLLM las fusiona en una sola operación lineal. La receta de despliegue v3d mantiene una copia MXFP8 de esos mismos pesos y conmuta según el tamaño de la llamada: 41 filas o más usan la copia MXFP8 y llamadas menores usan NVFP4, controlado por `VLLM_B12X_NVFP4_MXFP8_MIN_TOKENS=41`, de modo que la velocidad de prefill no cambia.

## Capacidades

- Generación de texto conversacional multiturno, con pipeline declarado `image-text-to-text`.
- Procesamiento de imágenes además de texto, gracias al codificador de visión incluido en el checkpoint y conservado sin cambios.
- Llamada a herramientas y funciones: el autor reporta 100/100 en la suite interna TC-45 de tool calling.
- Razonamiento multi-paso y uso agéntico, apoyado en el soporte de tool calling y en el módulo MTP.
- Recuperación en contexto largo: se reporta 20/20 en pruebas de retrieval a 8K, 32K, 64K y 128K, incluyendo 128K con semillas 11 y 13.
- Decodificación especulativa mediante el módulo MTP; el autor indica que la aceptación por posición de borrador se movió como máximo 0,005 respecto a la receta base.
- Capacidades multilingües: no disponible (el autor no documenta los idiomas soportados).
- Modo de pensamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente documental con imágenes: al aceptar entradas image-text-to-text y mantener precisión de recuperación hasta 128K tokens, permite hacer preguntas sobre contratos, informes o capturas escaneadas y contrastar la respuesta con el contenido visual de la página.
- Atención al cliente automatizada: el modelo puede gestionar conversaciones multiturno con contexto largo y usar tool calling para consultar sistemas internos (estado de pedido, facturación) sin salir de la ventana de contexto.
- Agentes multi-paso en producción: el soporte de function calling verificado a 100/100 en la suite TC-45 permite integrarlo como planificador que encadena llamadas a APIs, y el módulo MTP acelera la generación de los pasos intermedios.
- Búsqueda aumentada sobre corpus extensos: los resultados de retrieval a 8K, 32K, 64K y 128K lo hacen adecuado para RAG sobre bases de documentación técnica sin troceado agresivo.
- Despliegue on-premise con requisitos de soberanía de datos: al ejecutarse en un único DGX Spark con TP=1, encaja en escenarios donde no se puede enviar información a APIs externas.
- Inferencia de bajo coste por paso en servicios interactivos: el cambio a NVFP4 en las proyecciones GDN reduce los bytes leídos por paso de decode, lo que se traduce en más tokens por segundo con el mismo hardware, relevante para chat de baja latencia.
- Procesamiento por lotes con reutilización de caché: la conmutación a MXFP8 a partir de 41 filas mantiene la velocidad de prefill, por lo que sirve tanto para cargas interactivas como para trabajos de prefill largo en la misma instancia.
- Asistente de análisis de imágenes técnicas: dado que el codificador de visión se conserva intacto, puede describir e interpretar diagramas, capturas de pantalla o figuras dentro de un flujo conversacional.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K, etc.). Los datos disponibles son comparaciones emparejadas de la receta v3d frente a la receta v3c sobre el checkpoint base, con control y candidato arrancados alternativamente en el mismo DGX Spark, a temperatura 0. Solo se listan las celdas que salieron de su banda de ruido.

| Celda | Cambio | Banda de ruido |
|---|---:|---:|
| Decode, 8 peticiones nuevas | +4,4 % tok/s | 1,9 % |
| Decode a 16K de contexto, 4 peticiones | +5,9 % tok/s | 3,0 % |
| Tarea de conteo, 8 peticiones | +7,8 % tok/s | 2,1 % |
| tg512, 1 petición (llama-benchy) | 50,0 -> 59,7 tok/s | 4,3 % |
| pp2048, 1 petición (llama-benchy) | -0,9 % | 1,0 % |

Puertas de calidad reportadas (internas, no benchmarks públicos):

| Prueba | Resultado | Referencia |
|---|---|---|
| Suite hard-mode | 91/100 | Aprobado en 88; la receta base ha puntuado entre 86 y 93 entre ejecuciones |
| Tool calling TC-45 | 100/100 | no disponible |
| Recuperación en contexto largo | 20/20 a 8K, 32K, 64K y 128K | Además 128K con semillas 11 y 13, 20/20 cada una |
| Sonda de stragglers a 8, 12 y 16 peticiones concurrentes | Sin preempciones | no disponible |
| Aceptación MTP por posición de borrador | Variación máxima de 0,005 | no disponible |

No se han publicado resultados de benchmarks estándar comparables (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El checkpoint está pensado para desplegarse en un único DGX Spark con TP=1, según la receta `qwen3.8-flash-next-1x-dgx-spark` (v3d) del autor.
- VRAM estimada: no disponible de forma explícita. Como referencia, el repositorio ocupa 104,9 GB y el checkpoint contiene 91.638.563.731 parámetros en precisión mixta.
- Memoria adicional: la receta mantiene una copia MXFP8 de los pesos GDN, que consume aproximadamente 1,1 GiB extra.
- Backend obligatorio: se necesita una compilación de vLLM con el backend lineal b12x W4A16 NVFP4 y con el código de modelo Qwen3.8-Flash-Next. El repositorio de recetas fija ambos en su imagen de contenedor.
- GPU recomendadas: no disponible. La única configuración documentada es un DGX Spark.
- Compatibilidad con GPU de consumo: no disponible. El tamaño del checkpoint (104,9 GB en disco) hace improbable su ajuste en GPUs de consumo típicas de 24 GB, pero esto no está confirmado en la información proporcionada.
- Opciones de despliegue: vLLM con el backend b12x. No se documenta soporte para llama.cpp, Ollama ni TGI. El autor declara compatibilidad con endpoints (`endpoints_compatible`).
- Latencia y throughput: en la receta v3d, 59,7 tok/s en tg512 con una petición (frente a 50,0 tok/s de la receta base). El prefill (pp2048) se mantiene, con un -0,9 %. Las etiquetas del repositorio indican 8 bits y compatibilidad con endpoints.
- Comando de referencia: `sparkrun run qwen3.8-flash-next-1x-dgx-spark --hosts <spark> --solo`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks públicos que permitan comparar capacidades con alternativas. La comparación posible es entre el propio linaje de checkpoints.

| Modelo | Parametros totales | Cuantizacion de pesos GDN | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ursuciprian/Qwen3.8-Flash-Next-NVFP4-GDN-MSE | 91.638.563.731 | NVFP4 W4A16 (MSE) | no disponible | qwen-community-1.0 | HuggingFace, 0 descargas |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4 | no disponible | MXFP8 (congelado) | no disponible | qwen-community-1.0 | HuggingFace, checkpoint base |
| Qwen/Qwen3.8-Flash-Next | no disponible | BF16 (sin cuantizar) | no disponible | qwen-community-1.0 | HuggingFace, modelo origen |

La diferencia medible entre la primera y la segunda fila se limita al error relativo medio de peso y a la velocidad: 0,0877 de error frente a BF16 con escalas elegidas por MSE, frente a 0,0937 con absmax simple, y ganancias de decodificación de entre el 4,4 % y el 7,8 % según la celda.

## Limitaciones y advertencias

- Es un checkpoint cuantizado, no un modelo entrenado desde cero. Cualquier limitación de calidad del modelo base se hereda, y la cuantización NVFP4 introduce un error relativo medio de peso de 0,0877 frente a BF16.
- Requiere una compilación específica de vLLM con el backend b12x W4A16 NVFP4 y el código de modelo Qwen3.8-Flash-Next. No funcionará con instalaciones estándar de vLLM, llama.cpp, Ollama o TGI.
- La licencia es Qwen Community License 1.0, heredada del modelo base. Incluye la exigencia de licencia separada para negocios de Model-as-a-Service y de asistente de trabajo con IA, y el requisito de mostrar el nombre del modelo por encima de determinados umbrales de usuarios e ingresos. Es imprescindible revisar `LICENSE` y `NOTICE` antes de un uso comercial.
- Riesgo de alucinación: no evaluado ni cuantificado en la información proporcionada. Se aplican las advertencias habituales de cualquier modelo generativo.
- Sesgos conocidos: no disponibles. El autor no documenta evaluación de sesgos ni composición del dataset de entrenamiento.
- Idiomas soportados: no disponibles. No hay ninguna declaración sobre cobertura multilingüe, por lo que no se puede asumir un rendimiento uniforme fuera del inglés sin validación propia.
- Longitud de contexto: no se declara el máximo oficial. Aunque se reporta recuperación correcta a 128K, ese dato es una prueba interna del autor y no una especificación del modelo.
- Las métricas de calidad (hard-mode 91/100, TC-45 100/100) son puertas internas del autor, no benchmarks públicos reproducibles de forma independiente.
- El modelo tiene 0 descargas y 0 likes, y se publicó y actualizó el mismo día, con cuatro minutos de diferencia. No hay validación externa de su comportamiento.
- El proceso de conmutación entre NVFP4 y MXFP8 está gobernado por una variable de entorno (`VLLM_B12X_NVFP4_MXFP8_MIN_TOKENS=41`) y consume aproximadamente 1,1 GiB adicionales de memoria. Omitir esa copia degradaría el prefill.
- Para producción, conviene reproducir la receta en contenedor del autor, ya que las versiones de backend y de código de modelo están fijadas.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/ursuciprian/Qwen3.8-Flash-Next-NVFP4-GDN-MSE
- Modelo base cuantizado: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4
- Modelo origen en BF16: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de la receta de despliegue: https://github.com/ursuciprian/qwen3.8-flash-next-dgx-spark-tp-2
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo, su arquitectura o sus benchmarks; los enlaces obtenidos no guardaban relación con el contenido técnico de la ficha y se han descartado.
