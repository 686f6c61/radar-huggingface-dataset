# WaveCut/Edge0-145B-q3k-NInfer-v3

## Resumen

Edge0-145B-q3k-NInfer-v3 es un artefacto de inferencia publicado por WaveCut para el motor NInfer v3, construido a partir del modelo multimodal Edge0-145B-q3k de Edge0. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización de los pesos del modelo base a un formato propietario (`.ninfer`) optimizado para el motor NInfer-all, una bifurcación de NInfer mantenida por el propio autor. El modelo conserva la arquitectura de Qwen3.8-Flash-Next: Gated DeltaNet, atención dispersa, hyper-connections, embedding de n-gramas, router con expertos compartidos y bloque MTP (multi-token prediction), sustituyendo los 512 expertos enrutados de cada capa de texto por expertos latentes agrupados en 8 grupos que computan en una anchura latente de 1792, proyectada desde y hacia las 2560 dimensiones del modelo.

El artefacto incluye el bloque MTP del release y la torre de visión de Qwen3.8-Flash-Next (27 bloques de anchura 1152, fusión de parches 2×2 sobre las 2560 dimensiones del modelo de texto), lo que habilita entrada image-text-to-text con soporte de imágenes y vídeo. El archivo único ocupa 50.930.150.656 bytes (47,43 GiB) y requiere descargar por separado la tabla de n-gramas publicada en otro repositorio.

Su relevancia es doble: por un lado demuestra una técnica de compresión agresiva (Q3_K/IQ4_NL en expertos enrutados, Q8_0 en codificadores/decodificadores latentes) que reduce un modelo de 145B a menos de 50 GiB; por otro, evidencia la fragmentación del ecosistema de inferencia, ya que las builds estándar de NInfer rechazan el archivo y solo NInfer-all desde el commit `72d1d8e04` puede ejecutarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido basado en Qwen3.8-Flash-Next: Gated DeltaNet, atención dispersa, hyper-connections, MoE con expertos latentes, bloque MTP |
| Parametros totales | 145B (según nomenclatura del modelo base) |
| Parametros activos | no disponible (MoE con 512 expertos enrutados por capa en 8 grupos latentes; número de activos no especificado) |
| Longitud de contexto | 32.768 tokens (valor usado en los comandos de ejemplo con `--max-context 32768`) |
| Tipos de cuantizacion | Q3_K (gate/up de expertos), IQ4_NL (down de expertos), Q8_0 (codificadores/decodificadores latentes y matrices MTP), Q2_0 (expertos MTP), BF16 (torre de visión), FP8 (tabla de n-gramas externa) |
| Idiomas soportados | no disponible |
| Licencia | edge0-community-model-license-1.0 (categoría `other`) |
| Formato de pesos | `.ninfer` (formato propietario del motor NInfer); el modelo base usa GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-Flash-Next, descrita en la model card como un esqueleto con Gated DeltaNet, atención dispersa, hyper-connections, embedding de n-gramas, router, experto compartido y bloque MTP. La modificación clave de Edge0 es la sustitución de los 512 expertos enrutados de cada capa de texto (48 capas) por expertos latentes: cada experto pertenece a uno de 8 grupos y computa en la anchura latente de su grupo (1792 dimensiones), que un codificador y un decodificador de grupo proyectan desde y hacia las 2560 dimensiones del modelo. Esta representación se almacena en `latent_dense_q8.bin` con filas Q8_0 (3,74 GB) y las etiquetas de grupo en `labels.bin`.

No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO; la model card del artefacto solo documenta el proceso de conversión, no el entrenamiento del modelo base. La innovación técnica destacable es el propio pipeline de conversión (`tools.convert` con receta `edge0_pack`), que preserva los bloques del release byte a byte y hace que el motor multiplique los pesos en su sitio. El artefacto incorpora decodificación especulativa mediante el bloque MTP (tres borradores por ronda) cuando se sirve con expertos en host o con expertos en GPU en modo de una petición; con expertos en disco la decodificación es sin borradores salvo que se pase `--spec mtp`. La tabla de n-gramas se referencia por el SHA-256 de sus filas (`57496326706760c564e80ed401f6b26a7d6b340cc05966502675c8dc01ef8fd9`) y se publica aparte en `WaveCut/Edge0-ngram-table-FP8-NInfer-v3`.

## Capacidades

- Generación de texto y razonamiento multimodal: pipeline `image-text-to-text`, con torre de visión que procesa imágenes y vídeo (preprocesadores de Qwen3.8-Flash-Next).
- Procesamiento de imágenes y vídeo mediante la torre de visión de 27 bloques, anchura 1152 y fusión de parches 2×2 sobre las 2560 dimensiones del modelo de texto.
- Decodificación especulativa con bloque MTP (tres borradores por ronda) para acelerar la generación.
- Embedding de n-gramas como componente auxiliar de modelado (tabla externa en FP8).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal en hardware limitado: el artefacto comprime un modelo de 145B a 47,43 GiB, lo que permite servirlo en una única GPU A40 (48 GB) con los expertos en memoria host fijada (40,1 GB de RAM), habilitando tareas de image-text-to-text donde antes se requeriría un clúster multi-GPU.
- Servicio con presupuesto de RAM ajustado: el modo `--expert-residency disk` mantiene los expertos en el archivo y los transmite a una caché de GPU, adecuado para entornos con poca memoria donde la latencia no es crítica.
- Despliegue en dos GPU con tensor parallelism: el comando `--devices 0,1 --tensor-parallel` divide cada capa y coloca grupos de expertos completos con sus filas de codificador y decodificador en cada GPU (unos 25 GB de pesos por dispositivo), útil para servidores con dos aceleradores de 24-48 GB.
- Procesamiento de documentos con imágenes: la combinación de contexto de 32.768 tokens y torre de visión permite analizar páginas escaneadas, gráficos o capturas junto con texto largo en una sola ventana.
- Investigación sobre cuantización extrema de MoE: el artefacto sirve como referencia reproducible para estudiar el impacto de Q3_K/IQ4_NL en expertos latentes sobre la perplejidad (3,127031 en WikiText con KV INT8) y comparar estrategias de residencia de expertos (host, disco, GPU).
- Evaluación de motores de inferencia alternativos: permite comparar el rendimiento de NInfer-all frente a otros motores (llama.cpp, vLLM) sobre el mismo modelo base, aunque solo NInfer-all puede cargar el archivo.
- Análisis de vídeo con descripción textual: la torre de visión con preprocesadores de vídeo de Qwen3.8-Flash-Next habilita tareas de captioning o resumen de secuencias de vídeo, siempre que el motor se lance con `--vision`.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| Perplejidad (WikiText, primeros 40 KB) | 3,127031 | 9.234 objetivos, KV INT8, expertos en host |
| Perplejidad (WikiText, primeros 40 KB) | 3,127031 | 9.234 objetivos, KV INT8, expertos en disco |
| Respuestas greedy | idénticas con y sin borradores MTP | Bajo las condiciones medidas (texto truncado en la model card) |

Mediciones realizadas el 12-13 de noviembre de 2026 con NInfer-all `master` (CUDA 12.8, `sm_86`) en una A40 (48 GB, 300 W), contenedor con cuota de 7,65 CPU y 50 GB de RAM, una ejecución por fila. La model card indica que el archivo se convirtió de nuevo para su publicación y dio la misma perplejidad y la misma respuesta greedy que el medido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: cada experto en GPU necesita unos 50 GB, más que los 48 GB de una A40; con expertos en memoria host fijada se requieren 40,1 GB de RAM del sistema y la GPU solo cachea los expertos más usados.
- GPU recomendadas: A40 (48 GB) es la plataforma medida; para tensor parallelism en dos GPU se necesitan aproximadamente 25 GB de pesos por dispositivo (p. ej., dos GPU de 24-48 GB).
- Cabe en consumer GPU: no de forma completa; los 47,43 GiB del archivo y los 40,1 GB de expertos en host exceden la VRAM de GPU de consumo. Solo el modo disco con caché parcial podría caber en GPUs de 24 GB, con latencia degradada.
- Opciones de despliegue: exclusivamente `ninfer-serve` de NInfer-all (rama `master`, commit `72d1d8e04` o posterior); las builds estándar de NInfer rechazan el archivo. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la model card solo reporta perplejidad y equivalencia de respuestas greedy, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor |
|---|---|---|---|---|---|
| Edge0-145B-q3k-NInfer-v3 (este) | 145B (MoE latente) | 32.768 | `.ninfer` | edge0-community-model-license-1.0 | NInfer-all |
| Edge0/Edge0-145B-q3k (base) | 145B (MoE latente) | no disponible | GGUF | edge0-community-model-license-1.0 | NInfer-all / edge0-strata |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | Qwen (terceros) | varios |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | no disponible | no disponible | GGUF | no disponible | llama.cpp y compatibles |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento comparativo (benchmarks) entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de un motor no estándar: el archivo solo lo carga NInfer-all desde el commit `72d1d8e04`; las builds estándar de NInfer lo rechazan, lo que limita la portabilidad y añade riesgo de mantenimiento.
- Requisito de descarga adicional: la tabla de n-gramas no está incluida y debe obtenerse del repositorio `WaveCut/Edge0-ngram-table-FP8-NInfer-v3`; sin ella el modelo no funciona correctamente.
- Licencia restrictiva: `edge0-community-model-license-1.0` (categoría `other`); deben revisarse los términos del archivo `LICENSE` antes de cualquier uso comercial, y se incluye `third-party/Qwen-LICENSE.txt` para los componentes de Qwen.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingüe sin evaluación.
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad de 3,127031 en WikiText no es indicativa del comportamiento en dominios abiertos.
- Contexto limitado a 32.768 tokens en los ejemplos documentados; no se especifica si el modelo soporta ventanas mayores.
- Medición limitada: solo se ejecutaron los modos host y disco en una A40; el tensor parallelism de dos GPU se validó con Edge0-120B-q3k, no con este release, por lo que su comportamiento en producción no está verificado.
- Sin datos de sesgo, seguridad ni evaluación de alineación en la información proporcionada.
- Fecha de creación (2026-11-13) y cero descargas/likes: artefacto muy reciente y sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WaveCut/Edge0-145B-q3k-NInfer-v3
- Modelo base: https://huggingface.co/Edge0/Edge0-145B-q3k
- Tabla de n-gramas: https://huggingface.co/WaveCut/Edge0-ngram-table-FP8-NInfer-v3
- Motor NInfer: https://github.com/Neroued/ninfer
- Bifurcación NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit mínimo requerido: https://github.com/iamwavecut/ninfer-all/commit/72d1d8e0439974779201f8537a2915de0b52f155
- Guía de Edge0 en NInfer-all: https://github.com/iamwavecut/ninfer-all/blob/master/docs/edge0.md
- Modelo Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de referencia de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
