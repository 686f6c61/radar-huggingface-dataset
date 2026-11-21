# wallawalla47/Swift-Qwen3.8-27B-NVFP4-NInferV3

## Resumen

Swift-Qwen3.8-27B-NVFP4-NInferV3 es un artefacto de pesos cuantizados en un unico fichero (formato `.ninfer`) derivado de `ukisai/Swift-Qwen3.8-27B-NVFP4`, un ajuste fino de Qwen3.8-27B orientado a reducir la longitud del razonamiento ("thinking" mas corto con las mismas respuestas). Lo publica el desarrollador independiente wallawalla47 como trabajo de aficionado, empaquetado especificamente para su motor Infernix (y para NInfer) sobre GPUs NVIDIA Blackwell, en concreto la RTX 5090 (sm_120a).

El modelo es multimodal (entrada de imagen y video), con backbone hibrido de 64 capas que combina atencion lineal Gated Delta-Net con atencion completa cada cuatro capas, anchura oculta de 5120, vocabulario de 248.320 tokens y contexto nativo de 262.144 tokens. La cuantizacion es mixta NVFP4/FP8 generada con NVIDIA Model Optimizer siguiendo el mapeo de precision de `nvidia/Qwen3.8-27B-NVFP4`: 128 objetos NVFP4 (proyecciones MLP) y 130 FP8 e4m3fn (atencion y GDN), con el resto en BF16, FP32 y bloques agrupados Q4-Q8.

Su relevancia practica es doble: por un lado reduce el peso a 22,8 GB, lo que permite servir un modelo de 27B en 4 bits en una unica GPU de consumo de gama alta; por otro, incorpora componentes de decodificacion especulativa (modelo borrador DFlash2, cabeza MTP y una cabeza de propuesta indexada de 131.072 filas) que habilitan las rutas de decodificacion mas rapidas de los motores compatibles sin paso de conversion en carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas con Gated Delta-Net (atencion lineal) y atencion completa cada 4 capas; torre de vision qwen3_5_vision de profundidad 27 |
| Parametros totales | 27B (heredado del modelo base Qwen3.8-27B; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Mixta NVFP4 (W4A4) + FP8 e4m3fn con escalas por fila + BF16/FP32 + bloques agrupados Q4/Q5/Q6/Q8; 128 objetos NVFP4, 130 FP8, 579 BF16, 96 FP32, 55 Q4, 54 Q5, 28 Q8, 1 Q6, 1 tabla de indices INT32 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other`); incluye Apache 2.0 de Qwen3.8-27B y DFlash2 |
| Formato de pesos | `.ninfer` (fichero unico propietario de Infernix/NInfer), 22.783.240.704 bytes; incluye `conversion.json` por tensor |
| Hidden size | 5120 |
| Vocabulario | 248.320 tokens |
| Componentes incluidos | `text`, `vision`, `mtp`, `dflash2`, `proposal` |
| Libreria | ninfer |
| Hardware objetivo | NVIDIA RTX 5090 (sm_120a), arquitectura Blackwell |

## Arquitectura y entrenamiento

El backbone es de la familia Qwen3.5 hibrida: 64 capas en las que la mayoria usan atencion lineal Gated Delta-Net y cada cuarta capa usa atencion completa, con hidden de 5120 y contexto nativo de 262.144 tokens. Sobre esa base se anaden una torre de vision (profundidad 27) para entrada de imagen y video, una cabeza MTP afinada por UkisAI para decodificacion especulativa multi-token, un modelo borrador DFlash2 de 5 capas con atencion deslizante (ventana 2048, selector de rango 256 con top-16) y una cabeza de propuesta indexada de 131.072 filas extraida de la cabeza de salida, que permite drafting barato por copia mediante `--lm-head-draft`.

El entrenamiento original corresponde a Qwen3.8-27B (no documentado en la informacion disponible) y al ajuste fino de UkisAI, cuyo objetivo declarado es alcanzar las mismas respuestas con razonamiento mas corto; las metricas de esa mejora no se reproducen aqui y el autor del artefacto indica explicitamente que no las ha medido. La cuantizacion se realizo con NVIDIA Model Optimizer y calibracion Local-Hessian NVFP4 sobre 2.048 muestras de post-entrenamiento de Nemotron, segun la model card del checkpoint intermedio. El empaquetado en `.ninfer` se hizo con el conversor de Infernix (receta `qwen3_8_27b_nvfp4_nvidia`) en CPU durante unos 4-5 minutos: las 128 proyecciones MLP NVFP4 y las 128 proyecciones FP8 de atencion y GDN se importan de forma bit-exacta sin re-cuantizar; la cabeza de salida se desquantiza y recuantiza a FP8 con escala por fila (`fp8_row_maxabs`); el embedding tambien se recuantiza.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" (el ajuste Swift busca trazas de razonamiento mas cortas y eficientes en tokens).
- Entrada multimodal de imagen y video mediante la torre de vision qwen3_5_vision.
- Generacion de codigo y matematicas (capacidades heredadas de la familia Qwen3.8; sin benchmarks publicados en esta ficha).
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Soporte de flujos agenticos: las etiquetas del repositorio incluyen `agentic` y `tool calling` no se detalla explicitamente en la informacion disponible.
- Decodificacion especulativa en tres variantes: MTP, borrador DFlash2 (`--spec dflash2`) y cabeza de propuesta indexada (`--lm-head-draft`).
- Capacidades multilingues: no disponible.

## Casos de uso

- Razonamiento sobre documentos largos: con 262.144 tokens de contexto nativo, el modelo puede ingerir contratos, informes o bases de codigo completas en una sola pasada sin fragmentar, y el ajuste Swift reduce el coste de tokens de pensamiento en cada consulta.
- Asistencia de codigo en local: un modelo de 27B en 22,8 GB cabe en una RTX 5090, lo que permite desplegar autocompletado y refactorizacion en estaciones de trabajo sin GPU de centro de datos ni envio de codigo a terceros.
- Analisis de imagenes y video: la torre de vision permite describir capturas, extraer texto de documentos escaneados o resumir fotogramas en pipelines de inspeccion o documentacion.
- Agentes multi-paso: la combinacion de contexto largo, modo thinking y decodificacion especulativa (MTP, DFlash2) reduce la latencia por paso en bucles de agente que encadenan muchas llamadas cortas.
- Servicio de chat con cache de prefijo: en Infernix, el autor reporta que el 90 % de los tokens de prompt se sirven desde cache de prefijo en una repeticion de codificacion agentica, lo que abarata conversaciones con system prompt e historial largos y repetidos.
- Evaluacion e investigacion de cuantizacion: al conservar los pesos NVFP4/FP8 bit-exactos respecto al checkpoint de UkisAI, sirve como referencia reproducible para comparar kernels W4A4 frente a FP8/BF16 en Blackwell.
- Procesamiento por lotes en una sola GPU: el tamano de 22,8 GB deja margen en GPUs de 32 GB o mas para lotes moderados, util en clasificacion, extraccion de entidades o generacion de resumenes a escala media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta mediciones de ingenieria del motor Infernix frente a NInfer sobre el artefacto oficial de 27B: 90 % de tokens de prompt servidos desde cache de prefijo, primer token en aproximadamente la mitad del tiempo medio de NInfer y prefill de prompts largos entre 1,3 y 1,5 veces mas rapido, con la misma calidad declarada. No se aportan cifras de MMLU, HumanEval, GSM8K ni de la mejora de eficiencia de tokens del ajuste Swift.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 22,8 GB; se necesita una GPU con al menos 24 GB para cargar los pesos, mas margen para cache KV y buffers de activacion, por lo que en la practica se recomienda 32 GB o mas para contexto largo.
- GPU objetivo declarada: NVIDIA RTX 5090 (sm_120a, Blackwell). Los kernels NVFP4 W4A4 requieren arquitectura Blackwell; no hay soporte indicado para Ada, Ampere ni GPUs de otras marcas.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB). En RTX 4090 (24 GB, Ada) no se garantiza por la ruta NVFP4 y por el margen de memoria.
- Despliegue: Infernix (`infernix-serve`, recomendado por el autor) y NInfer (`ninfer-serve`); tambien probado con ninfer-custom. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.ninfer` es propietario de estos motores.
- Carga sin conversion: el artefacto se sirve directamente apuntando el motor al fichero `.ninfer`.
- Latencia y throughput: no disponibles de forma absoluta; solo las comparativas relativas Infernix frente a NInfer citadas arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-NVFP4-NInferV3 (este) | 27B | 262.144 | NVFP4/FP8 mixta, `.ninfer` | swift-open-license-1.0 | Hugging Face, motores Infernix/NInfer |
| ukisai/Swift-Qwen3.8-27B-NVFP4 (base) | 27B | 262.144 | NVFP4/FP8 (ModelOpt) | no disponible en esta ficha | Hugging Face |
| nvidia/Qwen3.8-27B-NVFP4 | 27B | no disponible | NVFP4/FP8 (ModelOpt) | no disponible en esta ficha | Hugging Face |
| Wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 | 27B | no disponible | NVFP4/FP8, `.ninfer` | no disponible en esta ficha | Hugging Face |

Las diferencias clave frente a los checkpoints de origen son el empaquetado en fichero unico con los componentes de decodificacion especulativa anadidos (DFlash2 y cabeza de propuesta) y la orientacion exclusiva a los motores Infernix/NInfer, frente a la mayor portabilidad de los pesos NVFP4 originales de ModelOpt.

## Limitaciones y advertencias

- El propio autor declara que el artefacto, la conversion y buena parte de la model card se generaron con IA y que es trabajo de aficionado, probablemente incompleto o no del todo exacto.
- No hay benchmarks publicados: no se puede verificar el rendimiento real ni la preservacion de calidad tras la cuantizacion y el reempaquetado.
- Las afirmaciones sobre eficiencia de tokens del ajuste Swift provienen de la model card de UkisAI y no han sido medidas por el autor de este artefacto.
- Dependencia de hardware Blackwell: los kernels NVFP4 W4A4 no funcionan en GPUs anteriores, lo que limita el despliegue a RTX 5090 y GPUs profesionales Blackwell.
- Formato propietario `.ninfer`: no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que ata la operacion a Infernix o NInfer.
- Licencia swift-open-license-1.0 con terminos no detallados en la informacion disponible; antes de uso comercial hay que revisar el fichero LICENSE y las obligaciones de Apache 2.0 heredadas de Qwen3.8-27B y DFlash2.
- Idiomas soportados no documentados; el comportamiento multilingue fuera de los idiomas principales de Qwen no esta verificado.
- Riesgo de alucinacion y sesgos: no se aportan evaluaciones de seguridad, sesgo ni tasas de alucinacion; son los esperables en un modelo de 27B sin documentacion especifica.
- El repositorio tiene 0 likes y 853 descargas, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Swift-Qwen3.8-27B-NVFP4-NInferV3
- Modelo base (checkpoint cuantizado): https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4
- Modelo base en BF16: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Referencia de precision de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Artefacto analogo del mismo autor: https://huggingface.co/Wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3
- Variante Flash-Next: https://huggingface.co/Wallawalla47/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-Dense8-Infernix
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Benchmarks Infernix frente a NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Receta de conversion: https://github.com/Wallawalla47/Infernix/blob/main/tools/convert/official_recipes.py
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork ninfer-custom: https://github.com/Wallawalla47/ninfer-custom
