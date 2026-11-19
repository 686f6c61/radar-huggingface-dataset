# wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3

## Resumen

Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3 es un artefacto de inferencia en formato propietario NInfer V3 derivado de `nvidia/Qwen3.8-27B-NVFP4-QAD`, la release de NVIDIA del modelo Qwen3.8-27B con cuantizacion NVFP4 y destilacion consciente de cuantizacion (QAD). Lo publica el usuario wallawalla47 (no NVIDIA) y su proposito es empaquetar en un unico fichero de 20,9 GB todos los componentes necesarios para ejecutar el modelo sin conversion en tiempo de carga sobre una GPU NVIDIA RTX 5090 (sm_120a).

El modelo subyacente es un transformer hibrido de la familia Qwen3.5: 64 capas que combinan atencion lineal Gated Delta-Net con atencion completa cada cuatro capas, hidden size 5120, vocabulario de 248.320 tokens y contexto nativo de 262.144 tokens. Incluye torre de vision (profundidad 27) para entrada de imagen y video, companion MTP para decodificacion especulativa, un draft model DFlash2 de 5 capas y una cabeza de propuesta indexada de 131.072 filas.

La relevancia de este artefacto es de nicho: no es un modelo nuevo sino un contenedor optimizado para el motor NInfer (fork del autor), con pesos NVFP4 y FP8 importados bit-exactos desde el checkpoint de NVIDIA. Resulta util para quien quiera desplegar el modelo multimodal de 27B en FP4 sobre Blackwell con las rutas de decodificacion rapida del motor, pero no es portable a otros runtimes sin conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas (Gated Delta-Net linear attention + full attention cada 4 capas), hidden 5120 |
| Parametros totales | 27B (denominacion del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | NVFP4 (W4A4), FP8 (e4m3fn row scale), Q4, Q5, Q6, Q8 agrupado, BF16, FP32 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license |
| Formato de pesos | `.ninfer` (artefacto unico NInfer V3, 20.943.081.216 bytes); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El backbone de texto es un hibrido de 64 capas que alterna atencion lineal Gated Delta-Net con atencion completa cada cuarta capa, con hidden 5120 y vocabulario de 248.320 tokens. El checkpoint base fue producido por NVIDIA con Model Optimizer 0.46 en una mezcla NVFP4/FP8 y sometido a destilacion consciente de cuantizacion (QAD). El artefacto NInfer conserva las proyecciones NVFP4 (todas las proyecciones MLP y 76 proyecciones GDN en 38 capas) de forma bit-exacta, incluyendo pesos FP4 empaquetados y block scales E4M3, y las proyecciones FP8 (q/k/v/o de las 16 capas de atencion completa y GDN en las capas 0, 1, 2, 4, 5, 57, 58, 60, 61 y 62) en su forma FP8 por fila.

La cabeza de salida se desconvierte desde NVFP4 y se recuantiza a Q8 agrupado (`grouped_absmax`, una escala FP16 por cada 32 valores, activaciones de 16 bits), lo que segun el autor reduce la perplejidad en 0,0026 (intervalo del 95 %: 0,0019 a 0,0033) a cambio de un 0,5-0,7 % de velocidad de decodificacion. El embedding de tokens pasa de BF16 a FP8 con escala por fila. Las proyecciones a/b del GDN, normas, convoluciones y `dt_bias`/`a_log` conservan BF16/FP32 originales. La torre de vision mantiene almacenamiento mixto BF16 con Q4/Q5/Q6/Q8 agrupados. El censo del fichero incluye 1.454 tensores: 204 NVFP4, 53 FP8, 579 BF16, 478 FP32, 55 Q4, 54 Q5, 29 Q8, 1 Q6 y 1 tabla de indices INT32. La innovacion principal es el empaquetado de rutas de decodificacion especulativa (MTP, DFlash2 con ventana deslizante de 2048 y selector rank 256/top-16, y cabeza de propuesta indexada) en un unico artefacto sin paso de conversion en carga.

## Capacidades

- Generacion de texto y razonamiento con modo thinking explicito (tag `reasoning`, `thinking`).
- Procesamiento multimodal imagen-texto y video-texto mediante torre de vision de profundidad 27 (pipeline `image-text-to-text`).
- Soporte de contexto largo de hasta 262.144 tokens.
- Capacidades agenticas y multi-step reasoning (tag `agentic`).
- Tool calling / function calling: el autor menciona correcciones de tool-calling en su fork del motor, lo que implica soporte en el runtime.
- Decodificacion especulativa mediante companion MTP, draft model DFlash2 y cabeza de propuesta indexada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos con imagen: el contexto de 262.144 tokens y la torre de vision permiten procesar informes con graficos, tablas escaneadas y texto largo en una sola pasada, util para auditoria documental.
- Asistentes de codigo en IDE: el modo thinking y el soporte de tool calling permiten integrar el modelo en flujos de autocompletado y refactorizacion con llamadas a herramientas externas.
- Agentes autonomos multi-paso: la ventana de contexto larga y las rutas de decodificacion especulativa (MTP, DFlash2) reducen la latencia por paso en bucles agenticos con muchas iteraciones.
- Inspeccion visual de calidad en produccion: la entrada imagen-texto permite clasificar y describir defectos en imagenes industriales acompanadas de contexto textual de la linea de fabricacion.
- Razonamiento sobre video: la torre de vision admite entrada de video, adecuada para resumen y extraccion de eventos en clips de vigilancia o contenido multimedia.
- Despliegue local en estacion de trabajo Blackwell: al caber en 20,9 GB y ejecutarse sobre una RTX 5090, sirve para prototipado de agentes multimodales sin infraestructura de centro de datos.
- Generacion aumentada por recuperacion (RAG) con contexto masivo: los 262.144 tokens permiten inyectar grandes corpus recuperados sin truncamiento agresivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 20,9 GB; se necesita al menos esa cantidad mas overhead de KV cache y buffers de activacion. Con contexto de 262.144 tokens el consumo de KV cache crece de forma significativa y no se detalla en la informacion disponible.
- GPU objetivo declarada: NVIDIA RTX 5090 (sm_120a), arquitectura Blackwell. Los kernels NVFP4 requieren soporte hardware de FP4 de Blackwell.
- GPU recomendadas: RTX 5090 como plataforma de referencia; otras GPU Blackwell (B200, GB200, RTX PRO Blackwell) son compatibles a nivel de arquitectura, aunque no se confirma soporte del motor.
- Cabe en GPU de consumo: si, en RTX 5090 por capacidad de memoria y soporte nativo de NVFP4.
- Opciones de despliegue: exclusivamente el motor NInfer, recomendandose el fork del autor (`Wallawalla47/ninfer-custom`) con `ninfer-serve`. No hay soporte de vLLM, llama.cpp, Ollama ni TGI para este formato `.ninfer`.
- Latencia y throughput: no disponible. El autor solo cuantifica el coste relativo de la cabeza Q8 (0,5-0,7 % de velocidad de decodificacion) y de DFlash2 (0,3 % mas lento en el mismo texto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3 | 27B | 262.144 | NVFP4 + FP8 + Q8 mixto | nvidia-open-model-license | `.ninfer` / NInfer |
| nvidia/Qwen3.8-27B-NVFP4-QAD (base) | 27B | 262.144 | NVFP4 + FP8 (ModelOpt) | nvidia-open-model-license | safetensors / TensorRT-LLM, vLLM (segun soporte NVFP4) |
| wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 | 27B | 262.144 | NVFP4 + FP8 (todas las GDN en FP8) | nvidia-open-model-license | `.ninfer` / NInfer |
| wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact | 27B | 262.144 | NVFP4 + FP8 bit-exacto | nvidia-open-model-license | Infernix |

Los tres artefactos de wallawalla47 comparten checkpoint base y difieren en el motor y en el tratamiento de las proyecciones GDN (FP8 frente a NVFP4) y de la cabeza de salida (Q8 frente a FP8). El checkpoint de NVIDIA es la referencia canonica y la unica opcion portable fuera de NInfer. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Dependencia total del motor NInfer: el fichero `.ninfer` no es convertible a safetensors ni GGUF con las herramientas indicadas, y requiere el fork del autor para aprovechar las mejoras de prefix caching y tool calling.
- Requiere hardware Blackwell con soporte NVFP4; no ejecutable en GPU Ampere, Ada ni en CPU.
- La licencia `nvidia-open-model-license` impone condiciones especificas para uso comercial que deben revisarse en el enlace oficial; no es una licencia open source permisiva.
- El autor advierte de que la cabeza de salida se recuantiza a Q8 y el embedding a FP8, lo que introduce una degradacion pequena pero medible (0,0026 de perplejidad) respecto al checkpoint original.
- Riesgo de alucinacion inherente a modelos generativos de 27B; no se documentan evaluaciones de fidelidad factual.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano sin evaluacion propia.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha; es un artefacto de autor individual, sin validacion de la comunidad ni de NVIDIA.
- El checkpoint base corresponde a la revision `8158ac56` de `nvidia/Qwen3.8-27B-NVFP4-QAD`; futuras revisiones del original no estaran reflejadas.
- El MTP companion del checkpoint base carece de `mtp.fc` y tres normas segun la model card; el autor no detalla como se completaron en este artefacto, lo que introduce incertidumbre sobre la fidelidad de esa ruta.

## Enlaces

- Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-NInferV3
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4-QAD
- Fork del motor NInfer: https://github.com/Wallawalla47/ninfer-custom
- Variante Infernix bit-exacta: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-QAD-Infernix-Exact
- Variante NInfer previa: https://huggingface.co/wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
