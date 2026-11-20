# wallawalla47/Qwen3.8-27B-Quasar-NinferV3

## Resumen

Qwen3.8-27B-Quasar-NinferV3 es un artefacto cuantizado en formato NInfer V3 (`.ninfer`) derivado del checkpoint QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4, publicado por el usuario wallawalla47. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la familia Qwen3.5/Qwen3.8, con un backbone híbrido de 64 capas que combina atención lineal Gated Delta-Net con atención completa cada cuarta capa. El artefacto empaqueta en un solo fichero de aproximadamente 21,6 GB el backbone de texto, la torre de visión, un módulo MTP (multi-token prediction) y dos componentes adicionales de decodificación especulativa: un modelo borrador DFlash2 de 5 capas y una cabeza de propuesta indexada de 131.072 filas.

El modelo resuelve el problema de desplegar un LLM multimodal de 27.000 millones de parámetros con cuantización NVFP4 (W4A4) sobre hardware Blackwell consumer, en concreto la NVIDIA RTX 5090 (sm_120a). La cuantización no es un proceso aplicado por este autor: los pesos NVFP4 provienen del entrenamiento con quantization-aware training (QAT) del checkpoint base y se importan de forma bit-exacta, sin recuantización. Sobre esa base se injertan los componentes de decodificación especulativa para acelerar la generación.

La relevancia actual radica en que combina tres tendencias: cuantización de 4 bits con entrenamiento consciente, decodificación especulativa con modelos borrador y cabezas de propuesta, y un formato de artefacto único sin paso de conversión en carga. El contexto nativo declarado es de 262.144 tokens y el vocabulario de 248.320 entradas. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas con Gated Delta-Net (atención lineal) y atención completa cada 4 capas; torre de visión qwen3_5_vision (profundidad 27); módulo MTP; borrador DFlash2 de 5 capas con atención deslizante (ventana 2048) |
| Parametros totales | 27.000 millones (denominación del checkpoint base; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | NVFP4 (W4A4, 256 objetos), Q8 agrupado (q8_g32_fp16, 6 objetos), Q4 agrupado (q4_g64_fp16, 1 objeto), BF16 (646 objetos), FP32 (96 objetos), INT32 (tabla de índices) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto único NInfer V3); el checkpoint base usa compressed-tensors `nvfp4-pack` |

Datos adicionales: dimensión oculta 5120, vocabulario 248.320, tamaño del repositorio 21,6 GB, 1.006 objetos de pesos preparados (1.590 objetos totales en el fichero). Cabeza de propuesta indexada de 131.072 filas con selector de rango 256 y top-16.

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de la familia Qwen3.5: 64 capas en las que la mayoría emplea Gated Delta-Net, un mecanismo de atención lineal, y cada cuarta capa usa atención completa. Esta combinación busca reducir el coste computacional y de memoria en contextos largos manteniendo la capacidad de recuperación de la atención completa. La dimensión oculta es 5120 y el vocabulario alcanza 248.320 tokens. Se incluye una torre de visión de 27 capas para entrada de imagen y vídeo, y un módulo MTP (multi-token prediction) que actúa como decodificador especulativo nativo.

El entrenamiento del checkpoint base QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 se realizó con quantization-aware training sobre pesos NVFP4, de modo que los códigos FP4 empaquetados y sus escalas por bloque son el resultado directo del entrenamiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación técnica del artefacto publicado es la preservación bit-exacta de esos pesos cuantizados (`import_encoded`) y la incorporación de dos rutas de decodificación especulativa: el borrador DFlash2, injertado desde el artefacto oficial de NInfer, y una cabeza de propuesta indexada extraída del `lm_head` de QUASAR, ordenada por frecuencia y almacenada en Q4 agrupado con tabla de identificadores INT32. La única recuantización real es el paso de BF16 a Q8 en la capa MTP y en el `lm_head` compartido, exigido por el operador fusionado del motor; las proyecciones a/b de GDN se convierten de NVFP4 a BF16 por una restricción de disposición de tiles (48 filas frente a las 128 requeridas).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento (thinking) explícito.
- Procesamiento multimodal de imagen y vídeo como entrada (pipeline image-text-to-text).
- Comprensión y generación de código, con soporte declarado para flujos agénticos de programación.
- Razonamiento matemático y de múltiples pasos.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y repositorios de código.
- Decodificación especulativa mediante MTP, borrador DFlash2 y cabeza de propuesta indexada (`--spec dflash2`, `--lm-head-draft`).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia a la programación en producción: el modelo puede integrarse en un servidor Infernix o NInfer para autocompletar y revisar código en un repositorio, aprovechando el contexto de 262.144 tokens para incluir ficheros completos y la caché de prefijo del motor, que en la prueba del autor sirvió el 90 % de los tokens de prompt desde caché.
- Análisis de documentación técnica extensa: con contexto nativo de 262.144 tokens, puede procesar manuales, especificaciones o expedientes completos sin truncar, y responder preguntas con referencias cruzadas entre secciones.
- Procesamiento de capturas y diagramas: la torre de visión de 27 capas permite extraer información de imágenes de interfaz, diagramas de arquitectura o capturas de error y combinarla con el razonamiento textual.
- Agentes de varios pasos con decodificación rápida: las rutas MTP, DFlash2 y la cabeza de propuesta reducen la latencia de generación en tareas de razonamiento encadenado, lo que resulta adecuado para bucles agénticos donde cada token cuenta.
- Despliegue local en estación de trabajo con RTX 5090: los pesos ocupan aproximadamente 20 GB de VRAM, de modo que caben en una GPU consumer Blackwell y permiten ejecutar el modelo sin infraestructura de servidor.
- Evaluación e investigación de cuantización NVFP4: el artefacto sirve como referencia práctica de un modelo de 27.000 millones con pesos W4A4 entrenados con QAT, útil para medir degradación de calidad frente a BF16 en tareas concretas.
- Generación de resúmenes de vídeo o secuencias de imágenes: la entrada de vídeo declarada permite condensar contenido audiovisual en texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas comparativas de motor en una repetición de programación agéntica sobre el artefacto oficial de NInfer de 27B: Infernix sirvió el 90 % de los tokens de prompt desde su caché de prefijo, alcanzó el primer token en aproximadamente la mitad del tiempo medio de NInfer y realizó el prefill de prompts largos entre 1,3 y 1,5 veces más rápido, con la misma calidad. No se aportan cifras absolutas de latencia ni resultados de MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- VRAM estimada: aproximadamente 20 GB para los pesos del artefacto, según el autor.
- GPU requerida: NVIDIA RTX 50-series (Blackwell, sm_120a); construido y ajustado en una RTX 5090.
- Compatibilidad con A100, H100 o RTX 4090: no disponible; el artefacto está compilado para sm_120a y el motor depende de kernels NVFP4 W4A4 propios de Blackwell.
- Cabe en GPU consumer: sí, en RTX 5090. Otras tarjetas de la familia 50 no se mencionan explícitamente.
- Opciones de despliegue: Infernix (recomendado, con `infernix-serve`), NInfer (`ninfer-serve`) y ninfer-custom. No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas; solo comparativas relativas entre Infernix y NInfer (véase la sección de benchmarks). No hay paso de conversión en carga: se apunta el motor al fichero `.ninfer` directamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Quasar-NinferV3 | 27.000 M | 262.144 | NVFP4 W4A4 + Q8/Q4/BF16/FP32 | Apache 2.0 | Hugging Face, formato `.ninfer`, solo Blackwell |
| QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 (base) | 27.000 M | no disponible | NVFP4 (compressed-tensors) | no disponible en la información | Hugging Face |
| Artefacto oficial NInfer 27B | 27.000 M | no disponible | NVFP4 | no disponible en la información | Hugging Face |
| Otros modelos de 27B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada, por lo que la comparación se limita al linaje directo del artefacto.

## Limitaciones y advertencias

- Dependencia de hardware: el artefacto está compilado para sm_120a y requiere una GPU Blackwell de la serie RTX 50; no funciona en A100, H100 ni RTX 4090 sin una conversión no documentada.
- Dependencia de motor: el formato `.ninfer` solo lo consumen Infernix, NInfer y ninfer-custom; no es compatible con ecosistemas estándar como vLLM, llama.cpp u Ollama.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no documenta restricciones adicionales derivadas del checkpoint base; conviene verificar la licencia de QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4 antes de un despliegue comercial.
- Idiomas soportados no documentados: no se puede garantizar el rendimiento en castellano ni en otras lenguas distintas del inglés sin evaluación propia.
- Riesgo de alucinación: no cuantificado; no hay evaluaciones publicadas de fidelidad ni de tasas de error en dominios sensibles.
- Sesgos: no documentados en la información disponible.
- La cabeza de propuesta indexada está ordenada por un corpus de frecuencias no especificado, lo que puede sesgar las propuestas hacia vocabulario sobrerrepresentado en ese corpus.
- La recuantización a Q8 del módulo MTP y del `lm_head` compartido introduce una fuente potencial de divergencia respecto al checkpoint base, aunque el autor la atribuye a requisitos del operador del motor.
- El autor es un particular (wallawalla47) y el artefacto es una derivación no oficial; no hay garantía de mantenimiento ni de soporte a largo plazo.
- El repositorio registra 0 likes y 1.617 descargas, lo que indica una validación comunitaria todavía escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wallawalla47/Qwen3.8-27B-Quasar-NinferV3
- Modelo base: https://huggingface.co/QUASAR-QAT/Qwen3.8-27B-QUASAR-NVFP4
- Motor Infernix: https://github.com/Wallawalla47/Infernix
- Benchmarks de Infernix frente a NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Repositorio ninfer-custom: https://github.com/Wallawalla47/ninfer-custom
- Script de conversión: https://github.com/Wallawalla47/ninfer-custom/blob/master/tools/convert/quasar_nvfp4.py
- Rama master de ninfer-custom: https://github.com/Wallawalla47/ninfer-custom/tree/master
- Página de releases de Infernix: https://github.com/Wallawalla47/Infernix/releases
- Paper referenciado en los tags: arXiv:2608.13966 (no verificado en la información disponible)
