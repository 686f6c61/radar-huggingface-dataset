# wallawalla47/Qwen3.8-27B-Quasar-NinferV3

## Resumen

Qwen3.8-27B-Quasar-NinferV3 es un artefacto de inferencia en formato NInfer V3 (`.ninfer`) construido por el usuario wallawalla47 a partir del checkpoint cuantizado QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4. Se trata de un modelo multimodal de 27 mil millones de parametros de la familia Qwen3.5/Qwen3.8, empaquetado en un unico fichero de 21,6 GB que se carga directamente en los motores Infernix y NInfer sin paso de conversion en tiempo de carga. El artefacto esta afinado para GPUs NVIDIA Blackwell (sm_120a), en concreto una RTX 5090.

El modelo conserva de forma bit-exacta los pesos NVFP4 (W4A4) entrenados con quantization-aware training del checkpoint base, e incorpora componentes adicionales de decodificacion especulativa: un modelo borrador DFlash2 de 5 capas con atencion deslizante, una cabeza de propuesta indexada de 131.072 filas y un modulo MTP (multi-token prediction). La arquitectura subyacente es un backbone hibrido de 64 capas que combina Gated Delta-Net (atencion lineal) con atencion completa cada cuarta capa, torre de vision de 27 capas y un contexto nativo de 262.144 tokens.

Su relevancia practica radica en que permite ejecutar un modelo multimodal de 27B con razonamiento, vision y contexto largo en una GPU de consumo (RTX 5090) ocupando unos 20 GB de VRAM, con rutas de decodificacion especulativa que aceleran la generacion. La licencia Apache 2.0 facilita el uso comercial, aunque el ecosistema de motores (Infernix/NInfer) es todavia de nicho y el artefacto esta atado a hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 64 capas con Gated Delta-Net (atencion lineal) y atencion completa cada 4 capas; torre de vision qwen3_5_vision (profundidad 27) |
| Parametros totales | 27B (segun denominacion del modelo; desglose exacto no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (W4A4), Q8 agrupado (q8_g32_fp16), Q4 agrupado (q4_g64_fp16), BF16, FP32, INT32 (tabla de indices); mezcla de 256 objetos NVFP4, 646 BF16, 6 Q8, 96 FP32, 1 Q4 y 1 INT32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (NInfer V3, fichero unico); no incluye safetensors ni GGUF |

Otros datos: dimension oculta 5120, vocabulario 248.320, tamano del repositorio 21,6 GB, pipeline `image-text-to-text`.

## Arquitectura y entrenamiento

El backbone es un modelo hibrido de la familia Qwen3.5: 64 capas que alternan Gated Delta-Net (mecanismo de atencion lineal con estado recurrente) con capas de atencion completa cada cuatro capas, lo que reduce el coste de atencion en contextos largos manteniendo capacidad de recuperacion global. La dimension oculta es 5120 y el vocabulario de 248.320 tokens. Incluye una torre de vision de 27 capas para entrada de imagen y video, y un modulo MTP (multi-token prediction) como acompanante para decodificacion especulativa.

Los pesos provienen del checkpoint QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4, entrenado con quantization-aware training en formato `nvfp4-pack` de compressed-tensors. El artefacto importa los 256 objetos NVFP4 de forma bit-exacta (`import_encoded`), sin ciclo de desquantizacion y recuantizacion. Se anaden dos componentes: un borrador DFlash2 de 5 capas con atencion deslizante (ventana 2048, selector de rango 256 con top-16), injertado literalmente desde el artefacto oficial de NInfer, y una cabeza de propuesta indexada de 131.072 filas extraida del `lm_head` de QUASAR, almacenada en Q4 agrupado (`q4_g64_fp16`) con tabla de identificadores INT32. Las unicas recuantizaciones reales son el paso de BF16 a Q8 para la capa MTP y el `lm_head` compartido (requisito del kernel fusionado del motor), y el upcast de las proyecciones GDN a/b de NVFP4 a BF16 (tensores de 48 filas que no encajan en el layout de tiles de 128 filas). No se publican datos sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" explicito.
- Comprension de imagen y video mediante la torre de vision (pipeline image-text-to-text).
- Generacion de codigo y matematicas (capacidades declaradas por los tags del modelo; sin benchmarks publicados).
- Contexto largo de hasta 262.144 tokens para documentos extensos y conversaciones multi-turno.
- Capacidades agenticas y razonamiento multi-paso (tag `agentic`).
- Decodificacion especulativa mediante MTP, borrador DFlash2 y cabeza de propuesta indexada.
- Soporte multilingue: no disponible (no se detallan idiomas).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codificacion agentica: el modelo puede operar en bucles multi-paso con contexto largo, y el motor Infernix reporta que en una repeticion de codificacion agentica sirvio el 90 % de los tokens de prompt desde su cache de prefijo, con tiempo hasta el primer token aproximadamente la mitad que NInfer.
- Analisis de documentos extensos: con 262.144 tokens de contexto nativo puede ingerir bases de codigo, informes o expedientes completos sin troceado, aprovechando las capas de atencion lineal para reducir el coste en secuencias largas.
- Procesamiento de imagenes y video: la torre de vision de 27 capas permite tareas de descripcion, extraccion de informacion y respuesta a preguntas sobre contenido visual en un unico pipeline image-text-to-text.
- Despliegue en estacion de trabajo con GPU de consumo: al ocupar unos 20 GB de VRAM en NVFP4, cabe en una RTX 5090 y permite prototipado local de aplicaciones multimodales sin infraestructura de centro de datos.
- Razonamiento con traza explicita: el modo thinking facilita tareas de analisis, verificacion y resolucion de problemas donde se requiere auditar el proceso de razonamiento.
- Servicio de inferencia de baja latencia: las rutas de decodificacion especulativa (DFlash2, MTP, propuesta indexada) estan pensadas para cargas interactivas donde el tiempo hasta el primer token y el throughput de decodificacion son criticos.
- Evaluacion de tecnicas de cuantizacion: util para investigadores que quieran medir el impacto real de NVFP4 W4A4 con QAT frente a BF16 en un modelo de 27B.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son comparativas de motor, no de calidad del modelo:

| Metrica | Resultado reportado |
|---|---|
| Tokens de prompt servidos desde cache de prefijo (replay de codificacion agentica) | 90 % |
| Tiempo hasta el primer token (Infernix vs NInfer) | aproximadamente la mitad |
| Velocidad de prefill de prompts largos (Infernix vs NInfer) | 1,3-1,5x mas rapido |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para los pesos en NVFP4, mas overhead de contexto KV y buffers de activacion (no cuantificado en la informacion disponible).
- GPU requerida: NVIDIA RTX 50-series (Blackwell, sm_120a); construido y ajustado en una RTX 5090.
- No es compatible con GPUs anteriores (A100, H100, RTX 4090) segun los requisitos indicados, al depender de kernels NVFP4 para sm_120a.
- Cabe en GPU de consumo: si, en RTX 5090 (y previsiblemente en otras RTX 50-series con VRAM suficiente; no confirmado).
- Motores de despliegue: Infernix (recomendado, con ejecutables precompilados para Windows en su pagina de releases), NInfer y ninfer-custom. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se reportan comparativas relativas entre motores (ver seccion de benchmarks); cifras absolutas no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Quasar-NinferV3 | 27B | 262.144 | NVFP4 W4A4 + Q8/Q4/BF16 mixto | Apache 2.0 | `.ninfer`, motores Infernix/NInfer, GPU Blackwell |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 (base) | 27B | no disponible | NVFP4 (compressed-tensors `nvfp4-pack`) | no disponible | Pesos cuantizados originales; requiere conversion para NInfer |
| Artefacto oficial NInfer 27B (`qwen3_8_27b_nvfp4-official.ninfer`) | 27B | no disponible | NVFP4 | no disponible | `.ninfer`; origen del componente DFlash2 injertado |

No se dispone de datos de benchmarks que permitan comparar calidad frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Dependencia de hardware: requiere GPU NVIDIA Blackwell (sm_120a); no funciona en arquitecturas anteriores como Ampere o Hopper con los kernels previstos.
- Ecosistema de motores reducido: solo Infernix, NInfer y ninfer-custom; sin soporte declarado para vLLM, llama.cpp, Ollama o TGI, lo que limita su integracion en infraestructuras estandar.
- Formato propietario: el fichero `.ninfer` no es portable a otros runtimes sin conversion.
- Repositorio de autor unico con 1 like y 3.161 descargas: menor garantia de mantenimiento y soporte comunitario que un artefacto oficial.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad ni tasas de alucinacion.
- Sesgos: no se publica informacion sobre composicion del dataset ni evaluaciones de sesgo.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento fuera de los idiomas principales de la familia Qwen no esta garantizado.
- Tool calling y capacidades agenticas: declaradas mediante tags pero sin documentacion tecnica de la interfaz.
- La calidad del artefacto depende del checkpoint base QUASAR-QAT; los componentes anadidos (DFlash2, cabeza de propuesta) afectan a la velocidad de decodificacion, no a la calidad del modelo, pero su comportamiento en produccion no esta evaluado de forma independiente.
- Licencia Apache 2.0 permite uso comercial, pero las dependencias de los motores Infernix/NInfer tienen sus propias condiciones, no detalladas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-27B-Quasar-NinferV3
- Modelo base: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Benchmarks de Infernix: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Repositorio ninfer-custom (herramientas de conversion): https://github.com/Wallawalla47/ninfer-custom
- Script de conversion: https://github.com/Wallawalla47/ninfer-custom/blob/master/tools/convert/quasar_nvfp4.py
- Rama master de ninfer-custom: https://github.com/Wallawalla47/ninfer-custom/tree/master
- Paper referenciado (arXiv:2608.13966): https://arxiv.org/abs/2608.13966
