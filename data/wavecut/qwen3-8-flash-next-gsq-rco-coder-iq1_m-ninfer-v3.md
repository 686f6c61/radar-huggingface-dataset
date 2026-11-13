# WaveCut/Qwen3.8-Flash-Next-GSQ-RCO-Coder-IQ1_M-NInfer-v3

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-Coder-IQ1_M-NInfer-v3 es un artefacto de inferencia publicado por WaveCut para el motor NInfer, derivado del modelo Qwen3.8-Flash-Next en su variante Coder tras el proceso GSQ-RCO de ISTA-DASLab. No se trata de un modelo entrenado desde cero, sino de un empaquetado específico (formato `.ninfer`) que reorganiza los pesos cuantizados del GGUF original para que el motor NInfer pueda servirlos con decodificación especulativa, torre de visión y tabla de n-gramas. El resultado ocupa 30,76 GiB en un único fichero y está pensado para ejecutarse en una GPU de 24 GB, como una RTX 3090, manteniendo los expertos en memoria de host paginada.

El modelo subyacente es un transformer disperso (MoE) con 48 capas, de las cuales 36 son Gated DeltaNet y 12 son capas de atención dispersa (QSA). La variante Coder elimina la mitad de los expertos enrutados de Qwen3.8-Flash-Next, conservando 256 de 512 por capa, seleccionados mediante RCO contra el modelo completo para preservar las capacidades de código, uso agéntico de herramientas, visión y razonamiento espacial. Los expertos restantes se almacenan a unos 3,5 bits por peso, con un promedio efectivo de 1,89 bits por parámetro del modelo original (de ahí la etiqueta IQ1_M, que describe la tasa efectiva y no un tipo de bloque).

La relevancia de esta ficha radica en que documenta un caso poco habitual: un artefacto de inferencia con requisitos de motor muy específicos (una rama `master` concreta de NInfer, a partir del commit `5395ec30b`), que no funciona con compilaciones estándar de llama.cpp ni con otras herramientas convencionales. Para desarrolladores que quieran evaluar el modelo conviene distinguir entre el modelo base (Qwen3.8-Flash-Next Coder) y este empaquetado concreto, cuyas características de despliegue condicionan por completo su viabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido: 36 capas Gated DeltaNet + 12 capas de atención dispersa (QSA), 48 capas en total |
| Parámetros totales | no disponible (el artefacto ocupa 30,76 GiB; el modelo original se etiqueta a 1,89 bits efectivos por parámetro) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mezcla por tensor: IQ2_S, IQ3_XXS, IQ3_S, IQ4_XS, IQ4_NL, Q2_0, Q4_K, Q5_K, Q6_K, Q8_0 y BF16/FP32 en normas y controles |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | `.ninfer` (contenedor propio de NInfer v3); el GGUF de origen es de ISTA-DASLab |

## Arquitectura y entrenamiento

El modelo base combina dos tipos de capas en una arquitectura híbrida: 36 capas Gated DeltaNet (un mecanismo de estado lineal recurrente) y 12 capas de atención dispersa QSA. Sobre esa columna vertebral se dispone una capa MoE con 512 expertos enrutados por capa en el modelo original; la variante Coder conserva 256 de ellos, seleccionados con el procedimiento RCO (probablemente una variante de selección por relevancia o contribución) evaluando contra el modelo completo. Además de los expertos enrutados, cada capa mantiene expertos compartidos. El modelo incluye una cabeza de salida y una tabla de tokens, un router de 256 filas en BF16 y proyecciones de hiperconexión.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. Lo que sí documenta el autor es el proceso de cuantización y empaquetado: los bloques ggml de cada tensor se conservan byte a byte (excepto las proyecciones de hiperconexión, recuantizadas de BF16 a Q8_0), y el motor multiplica los bloques in situ. Los expertos enrutados usan un tipo de cuantización distinto por capa y proyección (gate y up en IQ2_S en 20 capas, IQ3_XXS en 17, IQ3_S en 10 e IQ4_XS en 1; down en IQ4_NL en 39 capas y Q2_0 en 9), lo que permite ajustar la precisión a la sensibilidad de cada tensor.

El artefacto incorpora dos componentes destacables: un bloque MTP (multi-token prediction) y el borrador DFlash2 de incoai en GGUF Q4_0 (339 MB), con cinco capas de ventana deslizante de anchura 2.560 que generan borradores a partir de los estados ocultos del propio modelo. También incluye la torre de visión en BF16 (0,9 GB), de 27 bloques y anchura 1.152, que fusiona parches 2×2 sobre las 2.560 dimensiones del modelo de texto. La tabla de n-gramas no está en este fichero: el modelo la referencia por SHA-256 y debe descargarse por separado.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-Flash-Next.
- Generación y comprensión de código, con especialización explícita de la variante Coder (los expertos conservados se eligieron para código, uso agéntico de herramientas, visión y razonamiento espacial).
- Uso agéntico de herramientas (tool calling / function calling) y razonamiento multi-paso, según la selección de expertos descrita por el autor.
- Procesamiento de imagen y vídeo: pipeline `image-text-to-text`, con torre de visión de 27 bloques y preprocesadores de imagen y vídeo del checkpoint.
- Decodificación especulativa mediante el borrador DFlash2 integrado, activa por defecto salvo que se indique lo contrario con `--spec`.
- Predicción multi-token (bloque MTP) para acelerar la generación.
- Soporte de salida estructurada en el motor NInfer.
- Reutilización de prefijo de prompt y hasta ocho peticiones concurrentes en NInfer.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en estación de trabajo local: el artefacto está dimensionado para una única GPU de 24 GB (RTX 3090) con los expertos en memoria de host paginada, lo que permite ejecutar un modelo Coder de gran tamaño en hardware de consumo sin depender de la nube.
- Agentes de desarrollo con tool calling: la variante Coder conserva los expertos asociados al uso agéntico de herramientas, y NInfer ofrece salida estructurada y hasta ocho peticiones concurrentes, adecuado para orquestadores que encadenan llamadas a funciones.
- Revisión de código con contexto visual: la torre de visión permite adjuntar capturas de interfaces, diagramas de arquitectura o resultados de tests gráficos junto al código para tareas de revisión y depuración.
- Análisis de vídeo e imagen en pipelines técnicos: el pipeline `image-text-to-text` con preprocesadores de imagen y vídeo sirve para extraer descripciones estructuradas o detectar anomalías en material audiovisual.
- Despliegue en entornos con presupuesto de VRAM ajustado: la mezcla de cuantizaciones (1,89 bits efectivos por parámetro) y el volcado de expertos a memoria de host permiten servir el modelo cuando no se dispone de GPUs de 80 GB.
- Prototipado de decodificación especulativa: al incluir el borrador DFlash2 y el bloque MTP, el artefacto sirve para medir aceleraciones de inferencia con decodificación especulativa en NInfer sin tener que montar el stack a mano.
- Evaluación comparativa de técnicas de poda de expertos: útil para investigadores que quieran medir el impacto de eliminar la mitad de los expertos enrutados (RCO) frente al modelo completo en tareas de código y visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto completo ocupa 30,76 GiB; el ejemplo del autor indica que los expertos pueden residir en memoria de host paginada (25,1 GB) con los más usados cacheados en la GPU, de modo que una GPU de 24 GB es suficiente.
- GPU recomendadas: RTX 3090 (24 GB) es el objetivo declarado; las arquitecturas CUDA soportadas por la compilación son `86`, `89` y `120a` (esta última requiere CUDA 13.1 o superior). No se detallan recomendaciones para A100 u H100.
- Cabe en GPU de consumo: sí, en una RTX 3090 de 24 GB con el esquema de expertos en host; el rendimiento dependerá del ancho de banda de PCIe y de la tasa de acierto de la caché de expertos.
- Opciones de despliegue: exclusivamente NInfer, compilando la rama `master` de `iamwavecut/ninfer-all` desde el commit `5395ec30b` en adelante. Las compilaciones estándar de NInfer rechazan estos ficheros, y no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor menciona soporte de hasta ocho peticiones concurrentes, reutilización de prefijo y decodificación especulativa con DFlash2, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-GSQ-RCO-Coder-IQ1_M-NInfer-v3 (este) | no disponible (1,89 bits efectivos/param.) | no disponible | qwen-community-license-1.0 | `.ninfer` / NInfer `master` | Coder con 256/512 expertos, visión, MTP y DFlash2 |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF (base) | no disponible | no disponible | no disponible en la información | GGUF | Modelo de origen del que se deriva este artefacto |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible en la información | safetensors (checkpoint original) | Modelo completo con 512 expertos por capa |
| incoai/Qwen3.8-Flash-Next-DFlash2 | no disponible | no disponible | no disponible en la información | borrador especulativo | Modelo borrador de decodificación especulativa |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Dependencia estricta del motor: solo funciona con NInfer compilado desde la rama `master` a partir del commit `5395ec30b`; las compilaciones estándar rechazan los ficheros. Esto limita la portabilidad y añade riesgo de mantenimiento.
- Fragmentación del despliegue: requiere descargar por separado la tabla de n-gramas (referenciada por SHA-256) y el artefacto principal; sin la tabla, el modelo no dispone de ese componente.
- Licencia: qwen-community-license-1.0, con posibles restricciones para uso comercial que deben revisarse en el fichero LICENSE antes de desplegar en producción.
- Idiomas soportados: no disponibles en la información; no se puede garantizar cobertura multilingüe sin verificación empírica.
- Longitud de contexto: no disponible; no debe asumirse un contexto largo sin comprobarlo contra la configuración del modelo base.
- Riesgo de alucinación: inherente a los modelos de lenguaje; la cuantización agresiva (1,89 bits efectivos por parámetro) puede amplificar errores en tareas de razonamiento fino.
- Sesgos: no documentados en la información proporcionada; deben evaluarse con conjuntos de prueba propios.
- Poda de expertos: la eliminación de la mitad de los expertos enrutados puede degradar capacidades no cubiertas por el conjunto de selección RCO (por ejemplo, dominios fuera de código, agentes, visión y razonamiento espacial).
- Rendimiento dependiente del hardware: con expertos en memoria de host, el throughput está condicionado por el ancho de banda PCIe y el tamaño de la caché de expertos en GPU; no hay cifras publicadas de latencia.
- Fecha de creación futura: el repositorio figura creado el 2026-10-05, lo que debe tenerse en cuenta al evaluar la madurez y el soporte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-GSQ-RCO-Coder-IQ1_M-NInfer-v3
- Modelo base (GGUF): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Tabla de n-gramas: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3
- Tabla de n-gramas alternativa (FP8): https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Borrador DFlash2: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Borrador DFlash2 en GGUF Q4_0: https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF
- Motor NInfer (rama master): https://github.com/iamwavecut/ninfer-all
- Commit mínimo de NInfer: https://github.com/iamwavecut/ninfer-all/commit/5395ec30ba5653914ac59d265102414712a8721d
- Commit de lectura de tablas por hash: https://github.com/iamwavecut/ninfer-all/commit/57395b20b4ee9c4ac792146d82ffac6b28396a9b
- Repositorio NInfer (referencia): https://github.com/Neroued/ninfer
- Paper referenciado (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper referenciado (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
