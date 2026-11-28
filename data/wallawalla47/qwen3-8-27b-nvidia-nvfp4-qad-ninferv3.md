# wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3

## Resumen

Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3 es un artefacto de inferencia en un único fichero generado por el usuario wallawalla47 a partir del checkpoint nvidia/Qwen3.8-27B-NVFP4-QAD, la versión cuantizada con destilación consciente de cuantización (QAD) en NVFP4 que NVIDIA publica de Qwen3.8-27B. El modelo base es un backbone híbrido de la familia Qwen3.5 con 64 capas que combina atención lineal Gated Delta-Net con atención completa cada cuarta capa, hidden de 5120 y un vocabulario de 248.320 tokens. Este artefacto no es un modelo nuevo: es el mismo checkpoint empaquetado en el formato propietario `.ninfer` del motor NInfer, pensado para ejecutarse sin conversión en el momento de la carga.

La relevancia de esta ficha está en que documenta una ruta de despliegue muy concreta: cuantización de 4 bits (w4a4) con escalas de bloque FP4 y FP8 heredadas bit a bit de NVIDIA Model Optimizer 0.46, más un conjunto de componentes auxiliares para decodificación especulativa (MTP, DFlash2 y una cabeza de propuesta indexada de 131.072 filas). El fichero ocupa 20.943.081.216 bytes (unos 20,9 GB) y está construido específicamente para GPUs Blackwell, en concreto una RTX 5090 con arquitectura sm_120a.

El interés práctico es doble: por un lado, permite ejecutar un modelo multimodal de 27B con contexto nativo de 262.144 tokens en hardware de consumo; por otro, ilustra el estado del arte en cuantización de precisión mixta (NVFP4 para MLP y parte de las proyecciones GDN, FP8 para atención completa y el resto de GDN, Q8 agrupado para la cabeza de salida). La licencia es la NVIDIA Open Model License, no una licencia de código abierto estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas con Gated Delta-Net (atención lineal) y atención completa cada 4.ª capa; hidden 5120 |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (w4a4), FP8 e4m3fn con escala por fila, Q4, Q5, Q6, Q8 agrupado, BF16 y FP32 para normas y convoluciones |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (license: other) |
| Formato de pesos | `.ninfer` (artefacto único del motor NInfer); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de la familia Qwen3.5: 64 capas en las que la atención lineal Gated Delta-Net se alterna con atención completa cada cuarta capa, con dimensión oculta de 5120 y vocabulario de 248.320 tokens. Incluye una torre de visión `qwen3_5_vision` de profundidad 27 para entrada de imagen y vídeo, lo que convierte al modelo en image-text-to-text. El contexto nativo es de 262.144 tokens.

El artefacto no entrena nada: redistribuye el checkpoint QAD de NVIDIA. Las proyecciones NVFP4 (todas las proyecciones MLP y las proyecciones GDN de 38 de las 48 capas GDN) se importan de forma bit-exacta, conservando los pesos FP4 empaquetados y las escalas de bloque E4M3; las escalas FP32 `weight_scale_2` e `input_scale` se almacenan como divisores FP32 de NInfer (recíprocos redondeados una vez), lo que reproduce la escala original exactamente en 271 de 307 casos y con una diferencia de una unidad en el último lugar en el resto. Las proyecciones FP8 (q/k/v/o de las 16 capas de atención completa y las GDN de las capas 0, 1, 2, 4, 5, 57, 58, 60, 61 y 62) se importan en su forma FP8 por fila, con desviaciones de redondeo de hasta el 0,33 % en las escalas. La cabeza de salida se desconvierte de NVFP4 y se recuantiza a Q8 agrupado (escala FP16 cada 32 valores), lo que según el autor baja la perplejidad de 4,3537 a 4,3423 a cambio de un 0,5-0,7 % de velocidad de decodificación. El censo del fichero incluye 1.454 tensores: 204 NVFP4, 53 FP8, 579 BF16, 478 FP32, 55 Q4, 54 Q5, 29 Q8, 1 Q6 y 1 tabla de índices INT32.

Como innovaciones de despliegue, el artefacto incorpora el compañero MTP de Qwen3.5 para decodificación especulativa, un modelo borrador DFlash2 de 5 capas con atención deslizante (ventana 2048, selector de rango 256 y top-16) y una cabeza de propuesta indexada de 131.072 filas derivada de la cabeza de salida QAD, pensada para el modo `--lm-head-draft`.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (thinking), según las etiquetas del modelo.
- Comprensión de imagen y vídeo mediante la torre de visión `qwen3_5_vision` (pipeline image-text-to-text).
- Generación de código y matemáticas, implícita en la familia Qwen3.5, aunque no se detallan evaluaciones en la información disponible.
- Soporte de tool calling y function calling, con correcciones específicas en el fork de NInfer recomendado por el autor.
- Flujos agénticos y razonamiento multi-paso, favorecidos por el contexto de 262.144 tokens.
- Decodificación especulativa mediante MTP y DFlash2, con cabeza de propuesta indexada para borrador barato.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia sobre documentación extensa: con 262.144 tokens de contexto nativo se puede cargar un repositorio completo o un expediente largo y hacer preguntas multi-turno sin trocear el material.
- Análisis de imágenes y vídeo en pipelines de inspección: la torre de visión permite clasificar, describir o extraer información de fotogramas y capturas dentro de la misma ventana de contexto que el texto.
- Agente de código en local: el soporte de tool calling y el modo thinking permiten encadenar lectura de ficheros, ejecución de comandos y corrección de errores en una estación de trabajo con una RTX 5090.
- Despliegue en una sola GPU de consumo: al ocupar unos 20,9 GB en NVFP4, cabe en GPUs Blackwell de 32 GB de VRAM, lo que habilita prototipos de agentes multimodales sin clúster.
- Servicio de chat con decodificación acelerada: el uso conjunto de MTP y DFlash2 reduce el coste por token en cargas interactivas donde la latencia importa más que el throughput agregado.
- Investigación en cuantización: el informe `qwen3_8_27b_nvfp4-nvidia-qad.ninfer.conversion.json` incluido permite reproducir y auditar tensor a tensor la conversión NVFP4/FP8, útil para estudiar el impacto de la precisión mixta en perplejidad.
- Evaluación comparativa de motores de inferencia: al existir una variante Infernix del mismo checkpoint, sirve para contrastar implementaciones sobre pesos equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una medida de perplejidad interna: 4,3423 con la cabeza Q8 agrupada frente a 4,3537 con la cabeza FP8 por fila (−0,0026 nats por token, intervalo del 95 % de −0,0033 a −0,0019), y una penalización de velocidad de decodificación del 0,5-0,7 % (DFlash2 un 0,3 % más lento sobre el mismo texto).

## Requisitos de hardware

- VRAM estimada: el fichero pesa 20.943.081.216 bytes (unos 20,9 GB); hay que añadir caché KV y buffers de activación, por lo que se recomienda una GPU de 32 GB.
- GPU objetivo: NVIDIA RTX 5090 (sm_120a, Blackwell), que es el hardware para el que el autor construyó el artefacto. Otras GPUs Blackwell con soporte de NVFP4 deberían funcionar; GPUs anteriores (Ampere, Ada) no ejecutan las rutas NVFP4 de NInfer.
- Cabe en GPU de consumo: sí, en RTX 5090; no se garantiza en GPUs de 24 GB por el margen necesario para contexto largo.
- Opciones de despliegue: motor NInfer, preferiblemente el fork del autor (`ninfer-custom`), con `ninfer-serve` apuntando directamente al fichero `.ninfer`. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI, dado el formato propietario.
- Latencia y throughput: no disponibles; solo se documenta la variación relativa de velocidad entre configuraciones de cabeza de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3 | 27B | 262.144 | NVFP4/FP8/Q8 mixta | NVIDIA Open Model License | `.ninfer` |
| nvidia/Qwen3.8-27B-NVFP4-QAD (base) | 27B | 262.144 | NVFP4/FP8 (ModelOpt 0.46) | NVIDIA Open Model License | safetensors (checkpoint original) |
| wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 | 27B | 262.144 | NVFP4/FP8, GDN en FP8 | NVIDIA Open Model License | `.ninfer` |
| wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact | 27B | 262.144 | NVFP4/FP8 bit-exacta | NVIDIA Open Model License | formato Infernix |

Las diferencias entre las tres variantes de wallawalla47 son de empaquetado y de tratamiento de las proyecciones GDN: esta versión mantiene 38 capas GDN en NVFP4 y usa cabeza Q8, la variante NInferV3 previa usa FP8 en todas las GDN y cabeza FP8, y la variante Infernix-Exact es la forma bit-exacta para el motor Infernix.

## Limitaciones y advertencias

- Dependencia de un motor no estándar: el artefacto solo se carga con NInfer (y preferiblemente con el fork del autor), lo que limita la portabilidad y la integración con stacks habituales como vLLM o TGI.
- Requisito de hardware Blackwell: las rutas NVFP4 no se ejecutan en GPUs anteriores; el despliegue en A100 o H100 no está soportado por este formato.
- Licencia restrictiva: la NVIDIA Open Model License no es una licencia de código abierto OSI; conviene revisar las condiciones antes de un uso comercial o de redistribución.
- Idiomas no documentados: la model card no enumera los idiomas soportados, por lo que no se puede garantizar calidad multilingüe sin evaluación propia.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; no se han publicado evaluaciones de fidelidad en la información disponible.
- Trazabilidad de la cuantización: aunque las proyecciones NVFP4 y FP8 se importan bit a bit, la cabeza de salida y el embedding se recuantizan, y las escalas FP8 presentan desviaciones de hasta el 0,33 %, por lo que no es una réplica exacta del checkpoint original.
- Sin benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares para esta variante concreta, de modo que cualquier comparación de calidad con el modelo base es una extrapolación.
- Mantenimiento por un único autor: el artefacto y el fork del motor dependen de wallawalla47, sin garantías de soporte a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD
- Variante NInferV3 previa: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3
- Variante Infernix bit-exacta: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact
- Fork del motor NInfer: https://github.com/Wallawalla47/ninfer-custom
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
