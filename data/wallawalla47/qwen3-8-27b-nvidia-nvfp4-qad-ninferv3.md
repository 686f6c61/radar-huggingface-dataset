# wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3

## Resumen

Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3 es un artefacto de inferencia en formato NInfer V3 (fichero único `.ninfer`) derivado de `nvidia/Qwen3.8-27B-NVFP4-QAD`, la versión cuantizada con NVFP4 y destilación con cuantización (QAD) del modelo Qwen3.8-27B de NVIDIA. Lo publica el usuario wallawalla47 en Hugging Face y está pensado para ejecutarse directamente sobre una NVIDIA RTX 5090 (sm_120a) mediante el motor NInfer, sin paso de conversión en tiempo de carga.

Se trata de un modelo multimodal de tipo image-text-to-text con una columna vertebral híbrida de la familia Qwen3.5: 64 capas que combinan atención lineal Gated Delta-Net con atención completa cada cuatro capas, dimensión oculta de 5120, vocabulario de 248.320 tokens y contexto nativo de 262.144 tokens. Incluye una torre de visión de 27 capas, un compañero MTP para decodificación especulativa, un modelo borrador DFlash2 de 5 capas y una cabeza de propuesta indexada de 131.072 filas.

Su relevancia práctica es doble: por un lado, demuestra una ruta de despliegue de precisión 4 bits (W4A4) sobre hardware Blackwell consumer; por otro, conserva de forma prácticamente bit-exacta los códigos NVFP4 y FP8 del checkpoint original de NVIDIA, lo que permite reproducir el comportamiento del modelo cuantizado con un único fichero de 20,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: 64 capas (Gated Delta-Net linear attention + full attention cada 4 capas), hidden 5120, torre de visión qwen3_5_vision de 27 capas |
| Parametros totales | 27B (denominación del modelo; no se detalla el desglose exacto en la información disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (W4A4), FP8 e4m3fn con escala por fila, Q8 agrupado, Q6, Q5, Q4, BF16 y FP32 según tensor |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (NVIDIA Open Model Agreement) |
| Formato de pesos | `.ninfer` (artefacto NInfer V3 de fichero único, 20.943.081.216 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido de la familia Qwen3.5 con 64 capas: la mayoría son capas de atención lineal Gated Delta-Net y cada cuarta capa es de atención completa. El vocabulario alcanza los 248.320 tokens y el contexto nativo es de 262.144 tokens. Sobre esa columna se añade una torre de visión (qwen3_5_vision, profundidad 27) para entrada de imagen y vídeo, un compañero MTP para decodificación especulativa, un borrador DFlash2 de 5 capas con atención deslizante (ventana 2048, selector de rango 256 y top-16) y una cabeza de propuesta indexada de 131.072 filas para el modo `--lm-head-draft`.

El artefacto no reentrena el modelo: convierte el checkpoint `nvidia/Qwen3.8-27B-NVFP4-QAD` (revisión `8158ac56`, generado con Model Optimizer 0.46 en mezcla NVFP4/FP8) al formato NInfer mediante la receta `qwen3_8_27b_nvfp4_nvidia`. Las proyecciones NVFP4 (todas las proyecciones MLP y las proyecciones GDN de 38 capas) se importan de forma bit-exacta con sus escalas de bloque E4M3; las proyecciones FP8 (atención completa q/k/v/o en las 16 capas de atención y GDN en las capas 0, 1, 2, 4, 5, 57, 58, 60, 61 y 62) se importan con su escala FP8 por fila. La cabeza de salida se desconvierte y recuantiza a Q8 agrupado, y el embedding de tokens pasa de BF16 a FP8 con escala por fila. El censo de los 1.454 tensores es: 204 NVFP4, 53 FP8, 579 BF16, 478 FP32, 55 Q4, 54 Q5, 29 Q8, 1 Q6 y 1 tabla de índices INT32.

La innovación técnica principal es la preservación casi exacta de las escalas originales: dividir por el divisor FP32 almacenado reproduce la escala de pesos de NVIDIA exactamente en 271 de 307 casos y dentro de una unidad en el último lugar en el resto. La recuantización de la cabeza a Q8 reduce la perplejidad de 4,3537 a 4,3423 (−0,0026 nats por token, intervalo del 95 % de −0,0033 a −0,0019) a cambio de un 0,5-0,7 % de velocidad de decodificación.

## Capacidades

- Generación de texto y razonamiento con modo thinking explícito (etiqueta `thinking` en el modelo).
- Comprensión de imagen y vídeo mediante la torre de visión integrada (pipeline image-text-to-text).
- Capacidades agénticas y de razonamiento multi-paso, con soporte declarado para tool calling (el fork recomendado de NInfer incluye correcciones específicas de tool calling).
- Decodificación especulativa mediante MTP y mediante el borrador DFlash2, con rutas de decodificación acelerada en NInfer.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingües: no se detalla la lista de idiomas en la información disponible.
- Cabeza de propuesta indexada para drafting barato de copia/propuesta mediante `--lm-head-draft`.

## Casos de uso

- Asistencia sobre documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir informes, expedientes o bases de código completas en una sola ventana y responder preguntas con trazabilidad sobre el contenido.
- Análisis de imágenes y vídeo en flujos técnicos: la torre de visión de 27 capas permite clasificar, describir y extraer información de capturas, diagramas o fotogramas dentro de un mismo pipeline image-text-to-text.
- Agentes con tool calling: el soporte de function calling y el modo thinking permiten construir agentes que planifican varios pasos, invocan APIs y verifican resultados antes de responder.
- Despliegue local en estación de trabajo con RTX 5090: al ser un artefacto de 20,9 GB en precisión 4 bits, cabe en la VRAM de una GPU consumer Blackwell y evita costes de API para prototipado e investigación.
- Generación de código asistida: el modelo base Qwen3.8-27B está orientado a código y razonamiento; combinado con tool calling puede integrarse en editores o pipelines de revisión automatizada.
- Investigación en cuantización: al conservar bit-exactos los códigos NVFP4/FP8 de NVIDIA, sirve como referencia para estudiar el impacto de W4A4 frente a FP8 en calidad y velocidad.
- Servicio de inferencia de baja latencia: las rutas de decodificación especulativa (MTP y DFlash2) reducen el coste por token en cargas interactivas con requisitos de latencia ajustados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas internas de calidad y velocidad: perplejidad de 4,3423 con cabeza Q8 frente a 4,3537 con FP8 por fila, y una penalización de velocidad del 0,5-0,7 % en decodificación simple (DFlash2 un 0,3 % más lento sobre el mismo texto).

## Requisitos de hardware

- VRAM estimada: el fichero `.ninfer` ocupa 20,9 GB; se necesita al menos esa cantidad de VRAM más el espacio de estados de atención y caché KV, por lo que una GPU de 24 GB o más es el mínimo práctico.
- GPU objetivo declarada: NVIDIA RTX 5090 (sm_120a, arquitectura Blackwell), que es el hardware para el que se construyó el artefacto.
- GPUs profesionales Blackwell (B200, GB200) son compatibles a nivel de arquitectura con NVFP4, aunque la model card no las menciona explícitamente.
- No cabe en GPUs consumer de gama media (16 GB o menos) sin offloading, que el motor NInfer no documenta en la información disponible.
- Motor de despliegue: NInfer V3, preferiblemente el fork de wallawalla47 (`ninfer-custom`), que añade mejor prefix caching, correcciones de tool calling y mejoras de velocidad sobre el upstream. Se lanza con `ninfer-serve` apuntando al fichero `.ninfer`.
- Opciones de decodificación: `--spec dflash2` para el borrador DFlash2 y `--lm-head-draft` para la cabeza de propuesta indexada.
- Latencia y throughput: no disponibles de forma absoluta; solo se documentan las diferencias relativas entre configuraciones de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3 | 27B | 262.144 | NVFP4/FP8/Q8 mixto | nvidia-open-model-license | `.ninfer` |
| nvidia/Qwen3.8-27B-NVFP4-QAD (base) | 27B | 262.144 | NVFP4/FP8 | nvidia-open-model-license | safetensors (ModelOpt) |
| Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 (mismo autor) | 27B | 262.144 | NVFP4/FP8 con GDN en FP8 | nvidia-open-model-license | `.ninfer` |
| Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact (mismo autor) | 27B | 262.144 | NVFP4/FP8 bit-exacto | nvidia-open-model-license | Infernix |

La diferencia principal frente al artefacto NVFP4-NInferV3 del mismo autor es que este conserva las proyecciones GDN en NVFP4 en 38 de las 48 capas, mientras que el anterior las almacena todas en FP8. Frente al checkpoint original de NVIDIA, la ventaja es el formato de fichero único listo para servir sin conversión; frente a la variante Infernix-Exact, el objetivo es el mismo pero con otro motor.

## Limitaciones y advertencias

- Licencia NVIDIA Open Model Agreement: conviene revisar sus términos antes de cualquier uso comercial, ya que impone condiciones específicas distintas de las licencias Apache o MIT.
- El artefacto está atado al motor NInfer y al hardware Blackwell (sm_120a); no es portable a vLLM, llama.cpp, Ollama o TGI sin conversión previa.
- La cuantización a 4 bits introduce degradación medible: la perplejidad reportada (4,3423) es superior a la de un modelo en BF16, aunque no se ofrece la cifra de referencia.
- La recuantización de la cabeza de salida a Q8 y del embedding a FP8 son desviaciones respecto al checkpoint original, con impacto declarado en calidad y velocidad.
- Riesgo de alucinación inherente a los modelos generativos de esta escala; no se documentan evaluaciones de factualidad.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento homogéneo fuera del inglés y el chino sin evaluación adicional.
- El modelo tiene 0 likes y proviene de un autor individual, no de NVIDIA; la trazabilidad y el soporte a largo plazo son limitados.
- El contexto de 262.144 tokens exige gestión cuidadosa de la caché KV; no se documentan técnicas de compresión de caché en la información disponible.

## Enlaces

- [Hugging Face: wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3](https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3)
- [Modelo base: nvidia/Qwen3.8-27B-NVFP4-QAD](https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD)
- [Repositorio del motor NInfer (fork del autor)](https://github.com/Wallawalla47/ninfer-custom)
- [Variante relacionada: Qwen3.8-27B-NVIDIA-NVFP4-NInferV3](https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3)
- [Variante relacionada: Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact](https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact)
- [Licencia NVIDIA Open Model Agreement](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/)
