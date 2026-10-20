# yunfengwang/Xiaomi-Lens-0-MNN-int8

## Resumen

Xiaomi-Lens-0-MNN-int8 es una conversión al motor de inferencia MNN (Alibaba) del modelo multimodal Xiaomi-Lens-0 de SeerRay-Lab, un vision-language de 4,6 mil millones de parámetros especializado en *visual grounding* y segmentación de imágenes. El autor de la conversión, yunfengwang, ha publicado los grafos ya convertidos y cuantizados a 8 bits en pesos, con el objetivo explícito de ejecutar todo el pipeline imagen → texto + caja delimitadora + máscara de píxeles en CPU y sin dependencias de PyTorch ni de transformers.

El interés de esta ficha no está en un modelo nuevo, sino en el empaquetado: reduce el peso en disco de 18,5 GB (fp32) a 6,2 GB, elimina la pila torch y ofrece velocidades de decodificación muy superiores a la ruta oficial de HuggingFace en CPU (0,191 s por token frente a 18,75 s, aproximadamente 98 veces más rápido). Se distribuye además como paquete de PyPI (`xiaomi-lens-mnn`, versión 0.1.0) ejecutable con `uvx`, lo que permite probar el modelo con un solo comando.

Arquitecturalmente hereda del modelo base un diseño híbrido: codificador visual Qwen3.5 ViT con número dinámico de parches, decodificador de lenguaje Qwen3.5-4B con 24 capas GatedDeltaNet (atención lineal con estado recurrente) y 8 capas de atención completa, más un decodificador de máscaras independiente sobre un lienzo fijo de 576×384. La licencia Apache 2.0 y la posibilidad de correr en CPU lo hacen relevante para despliegues en dispositivo (móvil, edge, portátil) donde no hay GPU disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal híbrida: codificador visual Qwen3.5 ViT + decodificador Qwen3.5-4B con 24 capas GatedDeltaNet (atención lineal recurrente) y 8 capas de atención completa (capas 3, 7, …, 31) + decodificador de máscaras independiente |
| Parámetros totales | 4,6 mil millones (modelo base Xiaomi-Lens-0) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos int8 asimétricos por bloques (`--weightQuantBits 8 --weightQuantAsymmetric --weightQuantBlock 64`) con activaciones fp32; tabla de embeddings en fp16; estados tensoriales en fp32. Existe variante fp16 íntegra publicada aparte |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`.mnn` + fichero `.weight`) más tabla de embeddings `.npy` fp16; grafos ONNX disponibles en repositorio aparte para reconversión |
| Dimensión oculta del LLM | 2560 |
| Vocabulario | 248.078 entradas (dimensión de logits del decodificador) |
| Entrada visual | `pixel_values (n,1536)` fp16, `pos_embed (n,1024)` fp16, `cos/sin (n,64)` fp16; rejilla de imagen de 24×36 parches (864 parches, 216 tokens de imagen tras el *merge*) |
| Salida | Texto, cajas delimitadoras (`<bbox>`) y máscara de píxeles (`<mask>`) sobre lienzo fijo de 576×384 con 32 ranuras |
| Tamaño del repositorio | 6,2 GB (frente a 18,5 GB en fp32) |
| Librería / motor | MNN (backend CPU) |
| Pipeline de HuggingFace | `image-text-to-text` |
| Fecha de publicación | 19 de octubre de 2026 (última actualización: 20 de octubre de 2026) |

## Arquitectura y entrenamiento

El pipeline se compone de tres grafos MNN más una tabla de embeddings en fp16. `lens_vit.mnn` (353 MB, pesos int8) es el codificador Qwen3.5 ViT con número de parches dinámico: recibe píxeles, posiciones y senos/cosenos, y devuelve características pre-merge de 1024 dimensiones y características fusionadas de 2560 dimensiones que consume el LLM. `lens_llm_decode.mnn` junto con `.weight` (4,48 GB, int8) es el decodificador Qwen3.5-4B en modo incremental de un token por ejecución, con estados explícitos: por cada una de las 24 capas GatedDeltaNet mantiene `conv (1,8192,3)` y `rec (1,32,128,128)`, y por cada una de las 8 capas de atención completa mantiene `k/v (1,4,past,256)`. `lens_mask.mnn` (89 MB, int8) es el decodificador de máscaras, con entrada `mask_hidden (1,32,2560)`, `image_features (1,864,1024)` y `pad_mask`, y salida `mask_logits (1,32,384,576)` en fp32. La tabla `embed_tokens_fp16.npy` (1,27 GB) se mantiene en fp16 y está atada a la salida del decodificador.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni las etapas de alineación (RLHF/DPO). Lo que sí documenta la model card es el proceso de conversión y verificación: cada grafo se comparó contra la implementación oficial en torch/HF antes de publicarse. En la variante int8, las características pre-merge del ViT presentan una deriva máxima absoluta de 485,5 (media 9,7e-2), las características fusionadas de 1,095 (media 2,8e-3), los logits del decodificador de 0,427 en 8 pasos y los logits de máscara de 3,14 (media 0,285). El texto y las cajas generadas son idénticos a la referencia; la máscara final alcanza un IoU de 0,9970 (99,970 % de píxeles) frente al modelo en fp32, mientras que la variante fp16 es píxel a píxel idéntica.

## Capacidades

- Generación de texto condicionada por imagen: responde preguntas en lenguaje natural sobre el contenido visual.
- *Visual grounding*: localiza objetos descritos en el prompt y devuelve cajas delimitadoras en coordenadas de píxel mediante el token `<bbox>`.
- Segmentación de instancias: genera máscaras de píxeles con el token `<mask>`, hasta 32 ranuras por imagen sobre un lienzo fijo de 576×384.
- Modo *thinking* implícito: la salida del ejemplo incluye un recuento de máscaras generadas durante la fase de razonamiento (`masks: 1 (0 in thinking)`), lo que indica una fase de razonamiento previa a la emisión de la máscara final.
- Procesamiento de prompts de longitud moderada con 216 tokens de imagen en una ventana de 255 tokens en el ejemplo publicado.
- Inferencia completamente offline una vez descargados los pesos, sin dependencias de torch ni de transformers.
- Ejecución en CPU sin GPU, con backend MNN y paralelismo por hilos (15 hilos en el benchmark publicado).
- Soporte de *tool calling*: no disponible en la información proporcionada.
- Capacidades de audio o vídeo: no disponible.

## Casos de uso

- **Etiquetado automático de datasets de segmentación**: el modelo genera máscaras y cajas a partir de una descripción textual, lo que permite preanotar imágenes y reducir el trabajo manual de revisión. El IoU de 0,997 frente a la referencia fp32 es suficientemente alto para usar las máscaras como propuesta inicial.
- **Aplicaciones móviles offline de reconocimiento visual**: al ejecutarse en CPU con 6,2 GB en disco y sin acceso a red, encaja en apps de escritorio o portátiles que necesiten localizar y segmentar objetos sin enviar imágenes a la nube.
- **Anonimización en el dispositivo**: localizar y enmascarar caras, matrículas o documentos en lotes de imágenes antes de almacenarlas, manteniendo los datos fuera de servidores externos por motivos de privacidad.
- **Inspección visual en entornos edge**: control de calidad en líneas de producción o agricultura de precisión donde se describe el defecto o el objeto de interés y se obtiene su contorno exacto para medir área o posición.
- **Robótica y sistemas embebidos**: segmentación guiada por lenguaje para tareas de manipulación o navegación en plataformas con CPU y memoria limitada, sin acelerador dedicado.
- **Accesibilidad**: asistentes que describen una escena y localizan objetos concretos para usuarios con discapacidad visual, con la ventaja de funcionar sin conexión.
- **Preprocesado en pipelines de datos**: generar recortes y máscaras por objeto para alimentar posteriores clasificadores o sistemas de búsqueda visual, usando el modelo como paso de enriquecimiento por lotes.
- **Prototipado rápido**: al publicarse como paquete de PyPI, se puede validar con `uvx xiaomi-lens-mnn --image foto.jpg --precision int8 --prompt '...'` en un solo comando antes de comprometerse a integrar la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, RefCOCO u otros) en la información disponible. Los únicos datos publicados son de latencia y de verificación numérica frente a la implementación de referencia.

Latencia medida en Apple M5 Pro (48 GB), macOS arm64, backend CPU con 15 hilos; imagen de 586×394, prompt de 255 tokens (216 de imagen), 32 tokens generados y una máscara:

| Etapa | torch fp32 (HF) | ONNX Runtime | MNN fp16 | MNN int8 |
|---|---:|---:|---:|---:|
| Visión | 0,74 s | 1,41 s | 1,80 s | 1,84 s |
| Prefill del LLM (255 tokens) | 24,78 s | 84,46 s | 70,11 s | 64,46 s |
| Decodificación del LLM (32 tokens) | 600,07 s | 10,36 s | 6,74 s | 6,10 s |
| Máscara de píxeles | 0,35 s | 0,15 s | 0,85 s | 0,53 s |
| Total extremo a extremo | 625,9 s | 96,4 s | 79,5 s | 73,0 s |
| Decodificación por token | 18,75 s | 0,324 s | 0,211 s | 0,191 s |

Derivadas: la variante int8 es 8,6 veces más rápida extremo a extremo que torch fp32 y aproximadamente 98 veces más rápida por token en decodificación (unos 5,2 tokens/s). El prefill es más lento que en torch porque el grafo MNN es incremental de un token por ejecución y simula el prefill con un bucle de 255 pasos, lo que supone unas 3,96 tokens/s de prefill efectivo.

Verificación frente a la implementación oficial en torch/HF:

| Comprobación | int8 | fp16 |
|---|---:|---:|
| Características pre-merge del ViT, máx. / media abs. | 485,5 / 9,7e-2 | 8,4 / 1,3e-3 |
| Características de imagen fusionadas, máx. / media abs. | 1,095 / 2,8e-3 | 7,2e-3 / 3,6e-5 |
| Logits / hidden del decodificador, máx. abs. en 8 pasos | 0,427 / 0,418 | 1,8e-3 / 1,5e-3 |
| Logits de máscara, máx. / media abs. | 3,14 / 0,285 | 6,0e-3 / 2,2e-3 |
| Texto y caja generados vs. HF | idénticos | idénticos |
| Máscara final vs. HF | IoU 0,9970 (99,970 % de píxeles) | IoU 1,0000 |

## Requisitos de hardware

- **Disco**: 6,2 GB para los pesos int8 (frente a 18,5 GB en fp32 y 10,5 GB en la variante MNN fp16).
- **Memoria**: los ficheros publicados suman 6,2 GB; a ello se añaden los estados por sesión del decodificador (24 capas con `rec (1,32,128,128)` y 8 capas con caché `k/v`) y la salida de máscara `(1,32,384,576)` en fp32. Estimación a partir de esos tamaños: en torno a 7 GB de memoria residente; no se ha publicado una cifra oficial de RAM mínima.
- **GPU**: no se documenta backend GPU para esta conversión. El benchmark de referencia se ejecutó íntegramente en CPU (Apple M5 Pro, 48 GB, 15 hilos).
- **¿Cabe en GPU de consumo?** No hay datos publicados de VRAM para backend CUDA/Vulkan/Metal en esta conversión, por lo que no se puede confirmar. En CPU, el modelo está pensado para ejecutarse en equipos de escritorio y portátiles recientes.
- **Opciones de despliegue**: MNN como motor principal, a través del paquete `xiaomi-lens-mnn` (PyPI, versión probada 0.1.0) ejecutable con `uvx`. Para reconvertir o integrar en otras herramientas hay grafos ONNX publicados en el repositorio `yunfengwang/Xiaomi-Lens-0-onnx`. vLLM, llama.cpp, Ollama y TGI no están soportados en la información disponible.
- **Latencia y throughput**: 73,0 s extremo a extremo para 255 tokens de prompt y 32 de salida en el hardware citado; 0,191 s por token en decodificación; 64,46 s de prefill para 255 tokens. El *prefill* es el cuello de botella de esta conversión.

## Comparativa con modelos similares

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada. La comparación posible es entre las distintas distribuciones del mismo modelo:

| Distribución | Pesos | Tamaño | Latencia extremo a extremo | Fidelidad de máscara (IoU) | Motor |
|---|---|---:|---:|---:|---|
| yunfengwang/Xiaomi-Lens-0-MNN-int8 | int8 (embeddings fp16) | 6,2 GB | 73,0 s | 0,9970 | MNN, CPU |
| yunfengwang/Xiaomi-Lens-0-MNN-fp16 | fp16 | 10,5 GB | 79,5 s | 1,0000 | MNN, CPU |
| Xiaomi-Lens-0 (repo original, torch fp32) | fp32 | 18,5 GB | 625,9 s | referencia | torch / transformers |
| Ruta ONNX Runtime | ONNX | no disponible | 96,4 s | no disponible | ONNX Runtime |

Frente al modelo base en fp32, la versión int8 ocupa un 67 % menos de disco y es 8,6 veces más rápida extremo a extremo. Frente a la variante fp16, es un 8 % más rápida y un 41 % más pequeña, a costa de una deriva de aproximadamente el 0,3 % de los píxeles en los bordes de la máscara. No hay datos de calidad (exactitud en grounding o segmentación sobre conjuntos estándar) para ninguna de las distribuciones.

## Limitaciones y advertencias

- **Deriva en las máscaras**: la cuantización int8 altera los bordes de la máscara en torno al 0,3 % de los píxeles (IoU 0,9970 frente a fp32). Si la precisión del contorno es crítica, la model card recomienda explícitamente la variante fp16.
- **Mayor error en características pre-merge del ViT**: la deriva absoluta máxima llega a 485,5 en tensores con valores de hasta 3,2e3. Solo afecta al decodificador de máscaras, pero es el punto de mayor divergencia numérica de la conversión.
- **Prefill lento**: el grafo del decodificador es incremental de un token por ejecución, de modo que el prefill se implementa como un bucle de 255 pasos y resulta más lento que el prefill paralelo de torch (64,46 s frente a 24,78 s). Para prompts largos, esto domina la latencia total.
- **Contexto y idiomas sin documentar**: la información disponible no especifica longitud de contexto ni lista de idiomas soportados, lo que impide garantizar un comportamiento multilingüe concreto.
- **Sección de limitaciones truncada**: la model card original incluye un apartado de limitaciones que aparece cortado en la información disponible ("The released mask graph is spec…"); no se puede evaluar su contenido completo.
- **Lienzo de máscara fijo**: el decodificador de máscaras trabaja sobre un lienzo fijo de 576×384 con 32 ranuras, por lo que imágenes con muchas instancias o resoluciones muy distintas requieren reescalado y pueden perder detalle en objetos pequeños.
- **Sesgos y alucinación**: no hay información publicada sobre sesgos del modelo base ni sobre tasas de alucinación en esta conversión. Al ser un modelo de grounding, el riesgo principal es la localización incorrecta de objetos ausentes o ambiguos.
- **Licencia**: Apache 2.0, permisiva para uso comercial, pero conviene verificar la licencia del modelo base `SeerRay-Lab/Xiaomi-Lens-0` y de los componentes Qwen3.5 subyacentes antes de un despliegue en producción.
- **Madurez**: el repositorio registra 0 descargas y 0 *likes* en el momento de la consulta, y el paquete está en versión 0.1.0; se recomienda fijar la versión (`uvx --from xiaomi-lens-mnn==0.1.0`) y validar el comportamiento antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-MNN-int8
- Modelo base: https://huggingface.co/SeerRay-Lab/Xiaomi-Lens-0
- Variante MNN fp16: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-MNN-fp16
- Grafos ONNX para reconversión: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-onnx
- Paquete en PyPI: https://pypi.org/project/xiaomi-lens-mnn/
- Motor MNN: https://github.com/alibaba/MNN
