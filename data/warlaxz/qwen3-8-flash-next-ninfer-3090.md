# WarlaxZ/Qwen3.8-Flash-Next-NInfer-3090

## Resumen

Qwen3.8-Flash-Next-NInfer-3090 es una conversión del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen a un contenedor propietario (`.ninfer`) para el motor de inferencia NInfer, en su fork específico para la RTX 3090 mantenido por ashalliants. No se trata de un checkpoint de Transformers ni de un GGUF estándar: el autor, WarlaxZ, ha reempaquetado los pesos del GGUF GSQ-RCO IQ2_XS de ISTA DASLab sin recuantizar, preservando cada bloque GGML byte a byte, y ha añadido el borrador MTP y la torre de visión. El resultado ocupa unos 70 GB en disco y está pensado para ejecutarse en una única GPU de 24 GB con 64 GB de RAM de sistema.

La arquitectura subyacente es un transformer MoE multimodal de 48 capas con 512 expertos enrutados por capa, orientado a tareas de imagen-texto-a-texto en modo conversacional. La conversión incluye una tabla n-gram por capa (PLE) de 320.001.536 filas en IQ4_NL almacenada como volumen separado, que se lee parcialmente en cada prompt. El soporte es explícitamente una *preview*: una petición simultánea (dos carriles opcionales) y lanzador únicamente para Windows.

Su relevancia radica en que demuestra la viabilidad de servir un MoE multimodal de gran tamaño en hardware de consumo mediante *offloading* selectivo de expertos a RAM del host con caché en VRAM, a costa de un ecosistema cerrado y una licencia comunitaria restrictiva. Es un artefacto de nicho para experimentación en una RTX 3090, no una distribución lista para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (48 capas, 512 expertos enrutados por capa) con torre de visión y borrador MTP |
| Parametros totales | no disponible (repo de 70,1 GB; artefacto principal de 32.000.000.000 bytes más continuación de 9.012.140.032 bytes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_S, IQ2_XXS, IQ1_M, Q2_0 (expertos enrutados); IQ4_XS, IQ3_S, IQ4_NL, Q6_K, Q8_0, Q2_0 (pesos densos); BF16 y FP32 en tensores directos; IQ4_NL en el volumen n-gram |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.ninfer` (contenedor propietario de NInfer), con volumen `.ngram` separado en formato `NINFERNG` v2; derivado de GGUF, no compatible con Transformers ni safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, un MoE multimodal de 48 capas con 512 expertos enrutados por capa. La conversión no reentrena ni modifica los valores: los pesos de texto provienen del GGUF GSQ-RCO IQ2_XS de ISTA DASLab, donde los expertos enrutados conservan sus bloques *gate* y *up* en IQ2_S, IQ2_XXS o IQ1_M y su *down* en Q2_0, mientras que los pesos densos se distribuyen en IQ4_XS, IQ3_S, IQ4_NL, Q6_K, Q8_0 y Q2_0. Los tensores BF16 y FP32 mantienen sus palabras y el único tensor F16 se ensancha exactamente a FP32. Cada capa agrupa sus 512 expertos en un banco `ggml_expert_record_v1`, de modo que un experto se mueve entre RAM del host y GPU como un único rango de bytes.

La innovación técnica principal es el esquema de inferencia: los 33,0 GiB de expertos enrutados se fijan en RAM del host al arrancar y solo una caché de los expertos más usados (aproximadamente 11.000-12.500 de los 24.576) reside en la tarjeta junto con los pesos densos y la caché KV. El borrador MTP (componente `mtp`, del `mtp-q2_0.gguf` de Strata) conserva sus matrices BF16 y sus 512 expertos en Q2_0, habilitando decodificación especulativa. La torre de visión (componente `vision`, del `mmproj-Qwen3.8-Flash-Next-BF16.gguf`) usa la geometría del codificador de Qwen3.5 con todos los valores en BF16. La tabla n-gram PLE (320.001.536 filas IQ4_NL, 90 bytes por fila, 7.111.146 bloques) se almacena aparte y se lee por filas en cada prompt. Un verificador independiente confirmó que los 1.356 objetos tensoriales y las 320.001.536 filas del volumen son idénticos byte a byte a los GGUF de origen.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en modo chat.
- Procesamiento de imágenes junto con texto (pipeline `image-text-to-text`), mediante la torre de visión incluida.
- Razonamiento y generación de código heredados del modelo base Qwen3.8-Flash-Next (no verificados en esta conversión).
- Decodificación especulativa mediante el borrador MTP incluido, orientada a reducir latencia por token.
- Recuperación de contexto mediante tabla n-gram PLE leída dinámicamente por token.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada; la preview limita a una petición simultánea (dos carriles opcionales), lo que restringe despliegues concurrentes.

## Casos de uso

- Evaluación de MoE multimodal en hardware de consumo: el artefacto permite ejecutar un modelo de 48 capas y 512 expertos por capa en una única RTX 3090 con 64 GB de RAM, sirviendo como banco de pruebas para estudiar el equilibrio entre caché de expertos en VRAM y *offloading* a RAM.
- Investigación sobre cuantización extrema: al preservar los bloques IQ1_M, IQ2_XXS e IQ2_S sin recuantizar, permite medir el impacto real de estas cuantizaciones en la calidad de salida frente al modelo original, con trazabilidad byte a byte verificada.
- Experimentos de decodificación especulativa: el borrador MTP incluido posibilita comparar latencia y *throughput* con y sin decodificación especulativa en el mismo hardware, útil para trabajos sobre aceleración de inferencia.
- Procesamiento de documentos con imagen y texto en local: con `--vision` activado por defecto, puede emplearse para transcripción y descripción de capturas, diagramas o documentos escaneados en entornos sin conectividad, aceptando una petición cada vez.
- Desarrollo y validación del motor NInfer: el repositorio ashalliants/ninfer-3090 usa estos artefactos como referencia para probar el convertidor, el cargador de bancos de expertos y el servidor de volumen n-gram.
- Estudio de formatos de contenedor propietarios: el par `.ninfer` + `.ngram` con manifiesto, identificadores de artefacto y verificación SHA-256 sirve como caso práctico de diseño de formatos de distribución reproducibles para modelos cuantizados.
- Reproducción de resultados: los hashes SHA-256 publicados y el informe de conversión permiten auditar la integridad de la conversión en pipelines de investigación que exijan reproducibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye gráficas comparativas de velocidad (`assets/flash-next-speed.svg` frente a Strata en la misma GGUF, y `assets/v100-flash-next.svg` frente a Lapilli en una Tesla V100 de 32 GB), pero no se proporcionan los valores numéricos en el texto disponible.

## Requisitos de hardware

- GPU: RTX 3090 (24 GB). Los pesos densos, la caché KV y una caché de los expertos más usados (aproximadamente 11.000-12.500 de 24.576) residen en la tarjeta.
- RAM: 64 GB. Los 33,0 GiB de expertos enrutados se fijan en RAM del host al arrancar, más 0,84 GiB de la torre de visión si se activa `--vision` (opción por defecto del lanzador para este archivo). Se recomiendan unos 40 GiB libres (unos 2,2 GiB menos con `NINFER_VISION=off`); el servidor rechaza el arranque si no caben los expertos, sus otras asignaciones y 2 GiB para Windows.
- Disco: aproximadamente 70 GB (modelo de 41,0 GB más volumen n-gram de 29,1 GB).
- Cabe en GPU de consumo: sí, en RTX 3090 de 24 GB, pero solo con el *offloading* de expertos a RAM descrito; no se documenta compatibilidad con otras GPU de consumo.
- Opciones de despliegue: exclusivamente el fork ashalliants/ninfer-3090, con lanzador únicamente para Windows. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en cifras; la model card remite a las gráficas SVG comparativas. El soporte preview admite una petición simultánea (dos carriles opcionales).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NInfer-3090 (este) | no disponible (MoE 48 capas, 512 expertos/capa) | no disponible | `.ninfer` + `.ngram` | qwen-community-1.0 | Solo fork NInfer-3090, Windows |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | no disponible | qwen-community-1.0 | Ecosistema estándar del modelo base |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | no disponible | no disponible | GGUF (IQ2_XS y variantes) | no disponible | llama.cpp y motores compatibles con GGUF |
| Strata (referencia de velocidad en la model card) | no disponible | no disponible | GGUF | no disponible | Motor Strata |

No se dispone de datos de rendimiento comparativo numérico entre estas alternativas en la información proporcionada. La comparación relevante es de empaquetado: este artefacto ofrece cuantización idéntica al GGUF de ISTA DASLab pero requiere un motor propietario, mientras que el GGUF original es portable a motores estándar.

## Limitaciones y advertencias

- No es un checkpoint de Transformers, safetensors ni GGUF: requiere los ejecutables del fork ashalliants/ninfer-3090 y no funciona con herramientas estándar.
- Soporte preview: una petición simultánea (dos carriles opcionales) y lanzador solo para Windows; no apto para producción concurrente.
- Requisito de memoria estricto: 64 GB de RAM con unos 40 GiB libres al arrancar; el servidor rechaza el inicio si no se cumple.
- El volumen n-gram (29,1 GB) se lee en cada prompt y debe coincidir con el identificador de 16 bytes registrado en el artefacto; el servidor rechaza volúmenes con otro id.
- Los archivos del modelo y su continuación deben residir en la misma carpeta con los nombres exactos; el artefacto se compone de 1.362 objetos en tres componentes (`text`, `mtp`, `vision`).
- Licencia qwen-community-1.0: impone restricciones de uso comunitario; debe revisarse antes de cualquier uso comercial.
- Idiomas soportados no documentados: riesgo de comportamiento degradado en castellano u otras lenguas no verificadas.
- Sesgos y alucinaciones: no documentados en la información disponible; al ser una conversión sin reentrenamiento, hereda los del modelo base Qwen3.8-Flash-Next.
- La cuantización extrema de los expertos (IQ1_M, IQ2_XXS, IQ2_S) puede degradar la calidad frente a los pesos originales en precisión completa; no se publican métricas que lo cuantifiquen.
- Sin datos de benchmarks ni de latencia/throughput en cifras: la evaluación de rendimiento queda a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WarlaxZ/Qwen3.8-Flash-Next-NInfer-3090
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de origen (ISTA DASLab GSQ-RCO IQ2_XS): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Motor y convertidor (fork RTX 3090): https://github.com/ashalliants/ninfer-3090
