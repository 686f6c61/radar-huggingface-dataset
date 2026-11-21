# staccs/DeepSeek-V4.1-Flash-1017-abliterated-rumplestilzken-lecore-vq11cal-GGUF

## Resumen

Esta ficha describe una cuantización GGUF del modelo DeepSeek-V4.1-Flash-1017, una variante "abliterated" (sin los mecanismos de rechazo habituales) publicada por el usuario rumplestilzken a partir del modelo original de DeepSeek. El repositorio analizado, obra del usuario staccs, no entrena ni modifica el comportamiento del modelo: únicamente re-cuantiza los pesos para reducir el espacio en disco y permitir su despliegue en entornos con memoria unificada. Se trata, por tanto, de un artefacto de compresión, no de un modelo nuevo.

La arquitectura subyacente es un transformer de tipo Mixture-of-Experts (MoE) con aproximadamente 106.800 millones de parámetros totales según los safetensors del modelo base, aunque la model card menciona 557.000 millones de parámetros en los expertos enrutados, una discrepancia que conviene tratar con cautela. La innovación principal de esta build es el uso de cuantización vectorial (VQ) de 11 bits con codebooks de 2048 entradas, calibrada sobre 65.536 tokens de activación, aplicada a los expertos enrutados, mientras que el esqueleto denso se emite en q4_K.

Su relevancia actual es doble: por un lado, demuestra técnicas de compresión agresivas (1,39 bits por peso en los expertos) con métricas de paridad de decodificación frente al modelo original; por otro, al estar "abliterated" y publicada bajo licencia MIT, resulta atractiva para quienes necesitan un modelo sin restricciones de contenido, aunque con los riesgos asociados que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con esqueleto denso, capa de visión y tablas Engram n-gram |
| Parametros totales | 106.804.403.562 (según safetensors del modelo base); la model card cita 557B en expertos enrutados |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (evaluado a 2k y 16k; el límite oficial no se especifica) |
| Tipos de cuantizacion | VQ 11 bits (codebooks de 2048 entradas) en expertos enrutados y compartidos; q4_K en esqueleto denso, embeddings y cabeza de salida; fp8 en engram_wkv |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo único de 103,43 GB; repo de 316,7 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención multi-cabeza, expertos enrutados y expertos compartidos, al que se le añade una torre de visión para entrada de imágenes, un cabezal de predicción multi-token (MTP) y tablas Engram de n-gramas que actúan como memoria externa. La variante "abliterated" de rumplestilzken elimina las direcciones de rechazo del modelo original; este repositorio de staccs no realiza ningún entrenamiento adicional, solo compresión.

La cuantización aplicada es la aportación técnica central: los expertos enrutados se comprimen con cuantización vectorial de 11 bits (2048 entradas por codebook) mediante k-means ponderado por activación sobre 65.536 tokens de calibración, alcanzando 1,39 bits por peso y un coseno ponderado de 0,909. Los expertos compartidos usan la misma técnica con coseno 0,910. El esqueleto denso (atención, FFN de expertos compartidos, indexador, MTP y cabeza de salida) se emite en q4_K, y el embedding de tokens también en q4_K. Las tablas Engram se usan sin modificar desde los shards originales de DeepSeek. La build incluye un verificador de paridad de decodificación frente a los pesos fuente y un escaneo de tipos de archivo superado.

## Capacidades

- Generación de texto en inglés con modo de razonamiento ("thinking") activable o desactivable.
- Procesamiento de imágenes mediante la torre de visión incluida como sidecar (0,90 GiB).
- Razonamiento multi-paso y soporte de agentes, con recomendación explícita de desactivar el modo thinking para uso agéntico.
- Decodificación especulativa mediante el drafter DSpark (5,05 MiB) para acelerar la generación.
- Memoria de n-gramas externa (Engram) que amplía el contexto efectivo mediante tablas de 101,5 GB por shard.
- Comportamiento sin censura ("uncensored") gracias a la abliteración del modelo base.
- Compatibilidad con endpoints OpenAI (`endpoints_compatible` en los tags).
- Soporte multilingüe: solo inglés declarado; otros idiomas no disponibles.

## Casos de uso

- Despliegue local en estaciones con memoria unificada: el archivo único de 103,43 GB cabe en equipos con 128 GB de memoria unificada (probado en Radeon 8060S con HIP), lo que permite servir el modelo sin infraestructura de centro de datos.
- Investigación sobre cuantización extrema: la build sirve como referencia reproducible de VQ de 11 bits con calibración por activación, con métricas de perplejidad y KL frente al profesor documentadas para comparar técnicas de compresión.
- Generación de texto sin restricciones de contenido: al estar abliterated, es adecuado para experimentación creativa o investigación sobre alineación, siempre que se asuman los riesgos éticos y legales.
- Pipelines agénticos con API compatible con OpenAI: el servidor `ds4-server` expone `http://127.0.0.1:8008/v1`, lo que permite integrarlo en frameworks que consumen la API de OpenAI con sampling por defecto configurable (temp 0.6, top_p 0.95, min_p 0.05).
- Procesamiento de documentos con imágenes: combinando el GGUF principal con la torre de visión, se pueden analizar capturas, diagramas o páginas escaneadas junto a texto.
- Aceleración de inferencia con decodificación especulativa: el drafter DSpark permite aumentar el throughput en cargas de generación largas, aunque su tasa de aceptación baja si se usa con otras abliteraciones.
- Evaluación comparativa de calidad de cuantización: las métricas de paridad (PPL 2,82 a 2k, top-1 80,5 %) permiten medir el impacto de la compresión frente al modelo sin cuantizar.

## Benchmarks y rendimiento

| Metrica | 2k contexto | 16k contexto |
|---|---:|---:|
| Perplejidad (WikiText-2) | 2,821 | 2,950 |
| KL medio vs fuente | 0,592 | 0,591 |
| KL mediana vs fuente | 0,046 | 0,093 |
| Acuerdo top-1 con fuente | 80,5 % | 78,4 % |
| Masa basura en ids reservados (media) | 1,91e-07 | 2,46e-07 |
| Masa basura en ids reservados (máx) | 8,34e-05 | 8,92e-05 |
| Masa de escape fuera del top-50 fuente | 0,0340 | 0,0315 |
| Jaccard del conjunto top-p 0.95 vs fuente | 0,683 | 0,624 |

Como referencia, la build sin calibrar lecore-vq10sh12 del modelo original obtiene PPL 3,615, KL 0,797 medio / 0,195 mediana y top-1 74,5 % a 2k. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el GGUF principal ocupa 103,43 GB (96,3 GiB); el runtime completo requiere además la torre de visión (0,90 GiB), el drafter (5,05 MiB), el esqueleto denso (605,8 MiB) y las tablas Engram (dos shards de 101,5 GB cada uno, ~203 GB).
- Memoria unificada recomendada: al menos 128 GB para cargar pesos y tablas Engram; `DS4_CUDA_COPY_MODEL=1` exige un límite de commit de Windows superior a ~100 GB.
- GPU probada: Radeon 8060S (gfx1151) con HIP SDK 7.2 y 128 GB de memoria unificada. No se documentan pruebas en A100, H100 ni RTX 4090; por tamaño, no cabe en GPUs de consumo de 24 GB.
- Opciones de despliegue: `ds4-server` parcheado de staccs/ds4-winhip (Windows/HIP nativo, API compatible con OpenAI); el formato GGUF sugiere compatibilidad con llama.cpp, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles. La model card advierte que sin límite de tokens de salida un bucle de repetición puede alcanzar 19,5k tokens en 22 minutos.
- Sampling recomendado: temperatura 0,6, top_p 0,95, min_p 0,05; greedy también funciona pero puede entrar en bucles deterministas en turnos largos de herramientas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (staccs, VQ11 cal) | 106,8B (safetensors base) | no disponible | MIT | GGUF 103,43 GB + sidecars | PPL 2,821 a 2k, top-1 80,5 % |
| lecore-vq10sh12 (staccs, sin calibrar) | mismo base | no disponible | MIT | GGUF | PPL 3,615 a 2k, top-1 74,5 % |
| rumplestilzken/DeepSeek-V4.1-Flash-1017-abliterated | mismo base | no disponible | MIT | safetensors (fuente) | Modelo profesor sin cuantizar |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | mismo base | no disponible | no disponible | safetensors | Modelo original de DeepSeek |

No se dispone de datos de benchmarks estándar ni de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o sesgado sin filtros; el uso comercial exige evaluaciones de seguridad propias.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la compresión agresiva (1,39 bpw en expertos) que introduce desviaciones frente al modelo fuente (KL medio 0,592, acuerdo top-1 del 80,5 %).
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto oficial no especificada; las evaluaciones solo cubren 2k y 16k.
- El runtime completo requiere ~203 GB adicionales de tablas Engram y sidecars, muy por encima del tamaño del GGUF principal.
- Sin límite de tokens de salida, el modelo puede entrar en bucles de repetición prolongados; se recomienda fijar `DS4_SERVER_DEFAULT_MAX_TOKENS`.
- El drafter DSpark está entrenado para los pesos de la build pqhaz; con otras abliteraciones la tasa de aceptación será menor.
- Licencia MIT permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- No se documentan pruebas en GPUs NVIDIA; el soporte probado es HIP en Windows con memoria unificada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-abliterated-rumplestilzken-lecore-vq11cal-GGUF
- Modelo base abliterated: https://huggingface.co/rumplestilzken/DeepSeek-V4.1-Flash-1017-abliterated
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Sidecars (visión, drafter, esqueleto denso): https://huggingface.co/staccs/ds41-sidecars
- Servidor HIP para Windows: https://huggingface.co/staccs/ds4-winhip
- Build sin calibrar de referencia: https://huggingface.co/staccs/DeepSeek-V4.1-Flash-1017-lecore-vq10sh12-GGUF
