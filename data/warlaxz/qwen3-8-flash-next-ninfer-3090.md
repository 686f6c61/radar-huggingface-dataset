# WarlaxZ/Qwen3.8-Flash-Next-NInfer-3090

## Resumen

Qwen3.8-Flash-Next-NInfer-3090 es un artefacto de inferencia publicado por WarlaxZ que empaqueta el modelo Qwen3.8-Flash-Next (desarrollado por el equipo Qwen de Alibaba) en el contenedor propietario `.ninfer` del motor NInfer, en su fork específico para la GPU RTX 3090 (ashalliants/ninfer-3090). No es un checkpoint de Transformers ni una distribución de safetensors: es una conversión sin recuantización del GGUF IQ2_XS GSQ-RCO publicado por ISTA DASLab, más el drafter MTP y la torre de visión, todo reescrito en el formato del motor.

El modelo base es un MoE multimodal de 48 capas con 512 expertos enrutados por capa, orientado a tareas conversacionales y de imagen-a-texto. El artefacto ocupa unos 70 GB en disco (41 GB de pesos en dos ficheros más un volumen n-gram de 29,1 GB) y está diseñado para ejecutarse en una única RTX 3090 de 24 GB manteniendo los expertos fijados en RAM del host (64 GB recomendados). La conversión preserva cada valor byte a byte respecto a los GGUF de origen, verificado por un checker independiente sobre 1.356 objetos tensoriales y 320.001.536 filas del volumen n-gram.

Su relevancia es práctica: demuestra que un MoE multimodal de esta escala puede servirse en hardware consumer de gama alta mediante offloading selectivo de expertos y decodificación especulativa con el drafter MTP. El soporte es de tipo preview (una petición simultánea, dos carriles opcionales, lanzador solo para Windows) y requiere los ejecutables de ese fork concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (48 capas, 512 expertos enrutados por capa) con drafter MTP y torre de visión |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XS (origen GSQ-RCO); expertos enrutados en IQ2_S, IQ2_XXS, IQ1_M y Q2_0; densos en IQ4_XS, IQ3_S, IQ4_NL, Q6_K, Q8_0 y Q2_0; drafter en Q2_0; visión en BF16; volumen n-gram en IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `.ninfer` (contenedor propietario de NInfer) más volumen `.ngram` en formato NINFERNG v2 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE multimodal con 48 capas y 512 expertos enrutados por capa. El artefacto incluye tres componentes empaquetados: `text` (pesos del modelo de lenguaje), `mtp` (drafter de decodificación especulativa, derivado de `mtp-q2_0.gguf` de Strata) y `vision` (torre de visión con la geometría del encoder de Qwen3.5, procedente de `mmproj-Qwen3.8-Flash-Next-BF16.gguf`). La conversión no recuantiza: los tensores de bloque conservan sus bloques GGML byte a byte, los BF16 y FP32 conservan sus palabras, y el único tensor F16 se ensancha exactamente a FP32. Los 512 expertos de cada capa se agrupan en un banco `ggml_expert_record_v1` con un registro por experto, de modo que cada experto se mueve entre RAM del host y GPU como un único rango de bytes.

Una innovación destacable es la tabla de embeddings por capa (PLE) en formato n-gram: 320.001.536 filas IQ4_NL almacenadas en un fichero separado en formato NINFERNG v2 (bloques de 4 KiB, 7.111.146 bloques, 90 bytes por fila), que se lee sin buffer en cada prompt y se sirve por filas según el token. El servidor rechaza un volumen con un id distinto al registrado en el artefacto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`), con torre de visión BF16 activable mediante `--vision`.
- Decodificación especulativa mediante el drafter MTP incluido, orientada a reducir la latencia por token.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, aunque el modelo base pertenece a la familia Qwen3.8.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados en el repositorio.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional multimodal en estación de trabajo: con una RTX 3090 y 64 GB de RAM se puede servir un modelo MoE con visión para conversaciones multi-turno que combinen capturas de pantalla, diagramas o fotografías con preguntas en texto, manteniendo los expertos en RAM y cacheando en VRAM los más usados.
- Análisis de documentación técnica con imágenes: el pipeline `image-text-to-text` permite enviar diagramas de arquitectura, tablas escaneadas o gráficas y obtener explicaciones en texto; útil para revisión de documentación o soporte interno.
- Prototipado de agentes con decodificación especulativa: el drafter MTP incluido permite medir el impacto de la decodificación especulativa en latencia antes de invertir en hardware de datacenter, usando el mismo artefacto cuantizado a IQ2_XS.
- Evaluación de modelos MoE de gran escala en hardware consumer: sirve como banco de pruebas para estudiar el comportamiento de un MoE de 512 expertos por capa con offloading selectivo, midiendo el efecto de la caché de expertos (11.000-12.500 de 24.576 en VRAM) en el throughput.
- Investigación sobre cuantización extrema: al preservar byte a byte los bloques IQ1_M, IQ2_XXS e IQ2_S del GGUF original, permite comparar la calidad de estas cuantizaciones frente a alternativas sin introducir error adicional de conversión.
- Despliegue local de un asistente con visión en un único equipo Windows: el lanzador incluido y la comprobación previa de memoria (expertos, allocations y 2 GiB para Windows) facilitan arrancar el servidor en una máquina de 64 GB sin ajustar manualmente el reparto entre RAM y VRAM.
- Servicio de inferencia de baja concurrencia: con soporte preview de una petición simultánea (dos carriles opcionales), encaja en escenarios de uso personal o interno donde la latencia importa más que el throughput agregado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una gráfica comparativa de velocidad (`assets/flash-next-speed.svg`) entre NInfer-3090 y Strata sobre el mismo GGUF, pero no se proporcionan cifras numéricas de MMLU, HumanEval, GSM8K ni de throughput o latencia en el texto disponible.

## Requisitos de hardware

- GPU: RTX 3090 (24 GB). En la tarjeta conviven los pesos densos, la KV cache y una caché de los expertos más usados (aproximadamente 11.000-12.500 de los 24.576).
- RAM: 64 GB recomendados. Los 33,0 GiB de expertos enrutados se fijan en RAM del host al arrancar; con visión activada se añaden 0,84 GiB de la torre de visión. Se recomienda disponer de unos 40 GiB libres (unos 2,2 GiB menos con `NINFER_VISION=off`). En la máquina de prueba de 64 GB había 45-50 GiB disponibles en cada arranque.
- Disco: unos 70 GB, correspondientes al modelo (41,0 GB en dos ficheros) y al volumen n-gram (29,1 GB). El volumen debe residir en NVMe porque se lee sin buffer en cada prompt.
- Cabe en GPU consumer: sí, en RTX 3090, que es el objetivo explícito del fork. No se documenta compatibilidad con otras GPU consumer.
- Opciones de despliegue: exclusivamente el motor NInfer en su fork `ashalliants/ninfer-3090`, con lanzador para Windows. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un checkpoint de Transformers ni un GGUF estándar.
- Latencia y throughput: no disponibles en cifras; la model card solo referencia una gráfica comparativa frente a Strata.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NInfer-3090 | MoE, 48 capas, 512 expertos/capa (totales no disponibles) | no disponible | `.ninfer` + `.ngram` | qwen-community-1.0 | 1x RTX 3090 + 64 GB RAM |
| Qwen/Qwen3.8-Flash-Next (base) | MoE, 48 capas, 512 expertos/capa (totales no disponibles) | no disponible | safetensors (formato original) | qwen-community-1.0 | Multi-GPU de datacenter |
| ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF | Mismo modelo base cuantizado | no disponible | GGUF (IQ2_XS GSQ-RCO) | qwen-community-1.0 | Configurable según motor GGUF |
| Strata (referencia de la gráfica) | Mismo GGUF | no disponible | GGUF | no disponible | no disponible |

La comparativa se limita al mismo modelo base en distintos empaquetados, ya que la información disponible no incluye alternativas de otros desarrolladores con parámetros, contexto y rendimiento verificables.

## Limitaciones y advertencias

- Soporte preview: una petición simultánea (dos carriles opcionales) y lanzador únicamente para Windows.
- No es un checkpoint de Transformers, safetensors ni GGUF: requiere los ejecutables del fork `ashalliants/ninfer-3090` y no funciona con motores estándar.
- Dependencia estricta de ficheros: el modelo y su parte (`part-0001`) deben estar en la misma carpeta con los nombres exactos; el servidor rechaza un volumen n-gram con id distinto al registrado.
- La cuantización IQ2_XS con expertos en IQ1_M e IQ2_XXS es extremadamente agresiva; es previsible una degradación de calidad frente a los pesos originales, aunque la conversión no añade error adicional sobre el GGUF de origen.
- Riesgo de alucinación: no documentado en la información disponible, pero inherente a modelos de lenguaje; no hay evaluación publicada que lo acote.
- Idiomas soportados no declarados: no se puede garantizar cobertura multilingüe ni el comportamiento en castellano.
- Licencia qwen-community-1.0: es necesario revisar sus términos antes de uso comercial; la model card no detalla restricciones adicionales.
- Requisito de memoria estricto: si los expertos, las demás allocations y 2 GiB para Windows no caben en la RAM disponible en el arranque, el servidor se niega a iniciar indicando el déficit.
- El volumen n-gram se lee sin buffer en cada prompt; almacenarlo en un disco distinto de NVMe degradará la latencia de forma significativa.
- No hay datos publicados de benchmarks, latencia ni throughput que permitan validar el rendimiento en producción.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/WarlaxZ/Qwen3.8-Flash-Next-NInfer-3090
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de origen (ISTA DASLab GSQ-RCO IQ2_XS): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Motor NInfer para RTX 3090: https://github.com/ashalliants/ninfer-3090
