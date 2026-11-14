# thammegowda/rtg-model-archive

## Resumen

RTG model archive es un repositorio de preservación que aloja tres paquetes de modelos de traducción automática many-to-English entrenados con RTG (Robust Translation with Guarantees), el toolkit desarrollado por el equipo de ISI NLP (University of Southern California). El repositorio no contiene pesos en formato estándar de Hugging Face ni una model card convencional: cada artefacto es un archivo `.tgz` que empaqueta un directorio de experimento RTG completo, con su configuración, vocabularios NLCodec, checkpoint exportado y una instantánea del código fuente de RTG.

El interés de este repositorio es fundamentalmente arqueológico y de reproducibilidad. Los tres bundles corresponden a variantes de distinto tamaño del modelo (desde aproximadamente 1 GB hasta 3 GB comprimidos) y permiten recuperar exactamente el estado de los modelos que se servían en el servidor público de RTG en `rtg.isi.edu`, algo relevante para investigadores que necesiten replicar resultados de traducción multilingüe hacia inglés con arquitecturas transformer NMT entrenadas con el pipeline de ISI.

La ficha se ve limitada por la ausencia casi total de documentación técnica publicada en el propio repositorio: no hay número de parámetros declarado, ni longitud de contexto, ni resultados de benchmarks, ni licencia explícita para los pesos. Todo lo que se puede afirmar con rigor deriva de los nombres de archivo, los tags y el contenido descrito en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para traducción automática neuronal (RTG, `rtg_transformer_nmt`) |
| Parametros totales | no disponible (los nombres de archivo sugieren variantes de 6 y 9 capas con dimensión 512 y 768, pero no se declara el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints exportados en formato propio de RTG, sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | multilingüe hacia inglés (many-to-English); el conjunto exacto de lenguas de origen no está declarado |
| Licencia | no disponible para los pesos; el código RTG es Apache-2.0 y el repositorio no añade concesión adicional para pesos ni datos de entrenamiento |
| Formato de pesos | archivos `.tgz` con directorio de experimento RTG: configuración, vocabularios NLCodec, checkpoint exportado y snapshot del código fuente |

## Arquitectura y entrenamiento

Los modelos son instancias de `rtg_transformer_nmt`, la implementación de transformer encoder-decoder del toolkit RTG de ISI NLP, orientada a traducción multilingüe many-to-English. Los nombres de los archivos describen la configuración: `rtg500eng-tfm6L6L512d-bsz40k-stp300k-ens05` corresponde a un transformer de 6 capas de encoder y 6 de decoder con dimensión 512, batch de 40k y 300k pasos con ensemble de 5; `rtg500eng-tfm9L6L768d-bsz720k-stp200k-ens05` escala a 9 capas de encoder, 6 de decoder y dimensión 768, con batch de 720k y 200k pasos. El bundle `many-eng-v2.1-rtg600eng1024d_ful74k_ftclip200kaug` apunta a una variante de 1024 dimensiones con fine-tuning sobre un vocabulario de 74k y data augmentation con CLIP de 200k.

No se documenta en el repositorio el volumen de tokens de entrenamiento, la composición del corpus, ni si hubo etapas de RLHF o DPO; en traducción automática supervisada lo habitual es entrenamiento con datos paralelos y posiblemente técnicas de back-translation o data augmentation, pero no hay confirmación en la información disponible. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La verificación de integridad se realiza mediante `SHA256SUMS` incluido en el repositorio, y cada paquete incorpora su propio snapshot de código para garantizar la reproducibilidad del entorno de ejecución.

## Capacidades

- Traducción automática multilingüe hacia inglés (many-to-English), el caso de uso central del pipeline `translation`.
- Ejecución mediante la librería `rtg` (declarada como `library_name`), no mediante `transformers` estándar.
- Soporte de decodificación con ensemble, según el sufijo `ens05` de dos de los bundles.
- Gestión de vocabularios mediante NLCodec, incluido en cada paquete.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües limitadas al eje many-to-English; no se documenta traducción desde inglés ni entre pares de lenguas no inglesas.

## Casos de uso

- Reproducción de experimentos académicos: extraer un bundle y ejecutarlo con el snapshot de RTG incluido permite replicar exactamente las condiciones del servidor original, útil para comparativas de NMT publicadas.
- Evaluación de traducción many-to-English en dominios de bajos recursos: los modelos de ISI NLP se han usado históricamente en escenarios de lenguas con pocos datos paralelos, y estos checkpoints permiten medir su comportamiento en corpus propios.
- Archivado y preservación a largo plazo: el repositorio conserva pesos, configuración y código en un único artefacto verificable por SHA-256, lo que facilita la conservación institucional frente a la desaparición de servidores de modelos.
- Investigación en tokenización y vocabularios: los vocabularios NLCodec incluidos permiten estudiar decisiones de segmentación subpalabra en pipelines NMT multilingües.
- Construcción de sistemas de traducción asistida por ordenador en entornos controlados: al poder desplegarse on-premise con el toolkit RTG, encaja en organizaciones que no pueden enviar texto a APIs externas.
- Baseline para comparativas de modelos NMT modernos: sirve como referencia histórica al evaluar modelos actuales de traducción sobre los mismos conjuntos de test many-to-English.
- Docencia: el paquete autocontenido (configuración, vocabulario, checkpoint y código) es útil para explicar el ciclo completo de entrenamiento e inferencia de un sistema NMT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa, los checkpoints comprimidos ocupan entre 1,0 GB y 3,0 GB, pero el consumo real en memoria depende de la configuración de inferencia de RTG y no está documentado.
- GPU recomendadas: no disponible. No se especifican requisitos mínimos ni modelos probados.
- Compatibilidad con GPU de consumo: no confirmada; los tamaños sugieren que variantes de 512 dimensiones podrían caber en GPUs de consumo, pero es una inferencia no verificada.
- Opciones de despliegue: únicamente el toolkit RTG (repositorio `isi-nlp/rtg`); no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| RTG model archive (este) | no disponible | no disponible | no disponible para pesos; código Apache-2.0 | `.tgz` con checkpoint RTG | Hugging Face, 0 descargas |
| Modelos NMT de Hugging Face (p. ej. Helsinki-NLP/opus-mt-*) | ~70-300M según par | ~512 tokens | habitualmente CC-BY-4.0 | safetensors, PyTorch | Hugging Face, ampliamente usados |
| NLLB-200 (Meta) | 600M a 54B | 512 tokens | CC-BY-NC-4.0 | safetensors, PyTorch | Hugging Face |
| M2M-100 (Meta) | 418M y 1,2B | 1024 tokens | MIT | PyTorch | Hugging Face |

La comparación es aproximada: los parámetros, contexto y licencia de este repositorio no están declarados, y los modelos alternativos citados son referencias de la categoría many-to-many/many-to-English, no equivalentes exactos. La diferencia práctica principal es el formato: RTG requiere su propio runtime, mientras que las alternativas se integran en `transformers`.

## Limitaciones y advertencias

- Ausencia de licencia explícita para los pesos: el repositorio indica que no añade una concesión separada, por lo que el uso comercial queda en una zona jurídica indeterminada y requiere contactar con los autores.
- Sin model card técnica: no hay información sobre datos de entrenamiento, composición del corpus, filtrado ni sesgos, lo que impide evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de alucinación y de traducciones infieles no cuantificado: no se publican métricas (BLEU, chrF, COMET) que permitan acotar la calidad esperada.
- Idiomas de origen no declarados: no se puede saber a priori qué lenguas cubre el modelo many-to-English sin inspeccionar los vocabularios NLCodec incluidos.
- Dependencia de un runtime específico: sin soporte para `transformers`, vLLM o llama.cpp, la integración en producción exige mantener el stack RTG y su snapshot de código.
- Repositorio con 0 descargas y 1 like: no hay evidencia de uso comunitario ni de mantenimiento activo más allá de la actualización registrada.
- Fechas de creación y actualización anómalas en los metadatos (2026), que conviene verificar antes de citar el repositorio.
- Artefactos comprimidos: es obligatorio verificar `SHA256SUMS` antes de extraer, dado que los paquetes incluyen código ejecutable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thammegowda/rtg-model-archive
- Código fuente de RTG (ISI NLP): https://github.com/isi-nlp/rtg
- Servidor original de modelos RTG many-to-English: https://rtg.isi.edu/many-eng/models/
- Descarga vía CLI: `hf download thammegowda/rtg-model-archive --local-dir rtg-model-archive`
