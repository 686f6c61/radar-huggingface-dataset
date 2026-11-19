# yyrgzn/Qwen3.8-27B-FP8-NInfer-v3

## Resumen
Qwen3.8-27B-FP8-NInfer-v3 es un artefacto de inferencia cuantizado en FP8 para el motor NInfer, construido a partir del checkpoint oficial Qwen/Qwen3.8-27B-FP8 de Alibaba. No es un modelo nuevo ni un checkpoint redistribuible en Safetensors o GGUF: es un contenedor propietario del motor NInfer (formato `.ninfer`) que empaqueta los pesos del modelo base ya cuantizados, junto con la torre de visión, la cabeza MTP y el módulo especulativo DFlash2. El objetivo es ejecutar el modelo multimodal Qwen3.8-27B en GPUs de consumo y estaciones de trabajo (RTX 4090, RTX PRO 6000) aprovechando rutas de tensor cores FP8 sin dequantizar a BF16.

El modelo subyacente es un transformer causal multimodal de 27.000 millones de parámetros con 64 capas, hidden size 5.120 y vocabulario de 248.320 tokens, que combina capas de Gated DeltaNet (atención lineal con estado recurrente) y Gated Attention clásica en una proporción de 3:1. Incorpora un codificador de visión de 27 capas y una cabeza MTP entrenada para decodificación especulativa. El artefacto pesa 28,20 GiB y está publicado bajo licencia Apache 2.0.

La relevancia de este repositorio es fundamentalmente práctica: demuestra cómo convertir un checkpoint FP8 block-wise (escala por bloque 128×128) al esquema nativo de NInfer (una escala BF16 por fila de salida), verificando que la recodificación alcanza el límite teórico del formato, con un error relativo L2 de aproximadamente el 2,6 % atribuible al ruido inherente de E4M3. Para desarrolladores que quieran servir Qwen3.8-27B multimodal en hardware con soporte FP8, este artefacto elimina el paso de dequantización en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal multimodal con capas híbridas Gated DeltaNet + Gated Attention (`Qwen3_5ForCausalLM`); codificador de visión de 27 capas |
| Parametros totales | 27B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | FP8 E4M3 con escala BF16 por fila de salida (proyecciones de texto, embedding y cabeza de salida); Q8 group-32 en MTP; Q4/Q5/Q6 group-64 en DFlash2; BF16 en torre de visión y proyecciones de compuerta GDN `a`/`b`; FP32/INT32 en tensores de control |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | Contenedor propietario NInfer v3 (`.ninfer`), 28,20 GiB, 1.126 objetos (1.120 tensores y 6 recursos); no es Safetensors ni GGUF |
| Hidden size | 5.120 |
| Numero de capas | 64 (16 bloques de 3 × Gated DeltaNet + 1 × Gated Attention) |
| Vocabulario | 248.320 (con padding) |
| Tamano intermedio FFN | 17.408 |
| Cabezas Gated DeltaNet | 48 value heads, 16 QK heads, dim 128 |
| Cabezas Gated Attention | 24 query heads, 4 KV heads, dim 256, rotary dim 64 |
| Vision encoder | 27 capas, hidden 1.152, patch 16 |
| SHA-256 | `437d1d1aaeb16e20c252fa194471e6d869edab68d04d78198c9b2cf146d31c43` |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas organizadas en 16 bloques, cada uno compuesto por tres capas de Gated DeltaNet seguidas de una capa de Gated Attention. Las capas Gated DeltaNet implementan atención lineal con estado recurrente (48 value heads, 16 QK heads, dimensión de cabeza 128), mientras que las capas de Gated Attention usan atención clásica con 24 cabezas de consulta, 4 cabezas KV, dimensión de cabeza 256 y dimensión rotatoria 64. La FFN tiene tamaño intermedio de 17.408. El codificador de visión consta de 27 capas con hidden 1.152 y patch de 16, y se mantiene íntegramente en BF16 en el artefacto.

El proceso de conversión documentado por el autor es el núcleo técnico del repositorio. El checkpoint oficial Qwen/Qwen3.8-27B-FP8 almacena las proyecciones lineales de texto como códigos E4M3 con una rejilla de escalas BF16 `weight_scale_inv` por bloque de 128×128. NInfer, en cambio, usa una escala BF16 por fila de salida (`fp8_row_maxabs`). El conversor decodifica cada bloque en FP32 (donde la mantisa E4M3 multiplicada por la escala BF16 cabe exactamente sin redondeo) y recodifica con escala por fila. La decodificación se validó bit a bit contra un oráculo independiente basado en tabla E4M3 por rejilla BF16 sobre tensores reales del checkpoint, incluyendo filas que cruzan límites de bloque. El error relativo L2 global es de aproximadamente 2,6 % (2,62–2,65 % según la familia de proyecciones), atribuible al ruido de cuantización E4M3 inherente, no al proceso de conversión.

Se aplica un filtrado deliberado por operador: solo se interceptan el embedding de tokens, la cabeza de salida y las proyecciones estándar de atención y MLP de texto. Las proyecciones de compuerta GDN `a`/`b` se conservan en BF16 directo (no son aptas para FP8 por fila), y visión, MTP y DFlash2 caen en la receta base con selección groupwise Q4–Q8. La cabeza MTP usa Q8 group-32 y DFlash2 usa Q4/Q5/Q6 group-64. No se dispone de información sobre el dataset de entrenamiento, número de tokens, ni si hubo RLHF o DPO en la información proporcionada; esos datos corresponden a la model card oficial de Qwen3.8-27B, referenciada pero no incluida.

## Capacidades
- Generación de texto conversacional multi-turno, con plantilla de chat `qwen3_8.jinja` y modo de razonamiento activado por defecto (`thinking on`, esfuerzo `xhigh`, razonamiento de turno cerrado retenido).
- Comprensión de imagen y texto (`image-text-to-text`): la torre de visión de 27 capas procesa parches de 16 píxeles y se carga bajo demanda al arrancar el motor.
- Razonamiento multi-paso y cadenas de pensamiento extensas, con control del nivel de esfuerzo mediante la plantilla de chat.
- Decodificación especulativa mediante cabeza MTP entrenada (Q8 group-32) y módulo DFlash2 (Q4/Q5/Q6 group-64), ambos cargados opcionalmente.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Ejecución en rutas de tensor cores FP8 con `--kv-dtype fp8`, manteniendo las matrices de atención en el mismo dtype que los pesos.
- Inferencia solo a través del motor NInfer; no compatible con Transformers, llama.cpp ni vLLM de forma nativa.

## Casos de uso
- Despliegue de un asistente multimodal en estación de trabajo: con 28,20 GiB de pesos en FP8, el artefacto cabe en una RTX PRO 6000 (96 GB) y en configuraciones multi-GPU con RTX 4090, permitiendo servir conversaciones con imagen y texto sin infraestructura de centro de datos.
- Análisis de documentos con imágenes: la torre de visión en BF16 completa, combinada con el contexto del modelo de texto, permite extraer información de capturas, diagramas o formularios en flujos de automatización documental.
- Razonamiento de esfuerzo controlado: el parámetro de esfuerzo (`xhigh`) de la plantilla de chat permite usar el modelo en tareas de análisis complejo (revisión de código, diagnóstico técnico) donde se necesita cadena de pensamiento larga, y reducirlo en tareas de baja latencia.
- Generación especulativa de alto throughput: activando MTP y DFlash2 al arranque, el motor puede acelerar la decodificación en escenarios de generación larga, como resumen de documentos extensos o generación de informes.
- Prototipado de agentes con razonamiento multi-paso: el modo thinking retenido entre turnos facilita mantener estado de razonamiento en conversaciones de agente, aunque la integración con herramientas debe validarse por el usuario al no estar confirmada.
- Evaluación comparativa de cuantización FP8 frente a BF16: el artefacto permite medir en producción el impacto real de la cuantización por fila (error L2 ~2,6 %) frente al checkpoint BF16 original en tareas concretas del usuario.
- Investigación en eficiencia de inferencia: el repositorio documenta con detalle el pipeline de conversión block-wise a per-row, útil como referencia para implementar conversores similares en otros motores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card del artefacto remite a la card oficial de Qwen3.8-27B para benchmarks de capacidad, e indica que el checkpoint FP8 block-wise oficial reporta un rendimiento "casi idéntico" al BF16 original, sin cifras concretas. El único dato numérico de calidad es el error relativo L2 de la conversión: ~2,6 % (rango 2,62–2,65 %), con la proyección GDN `a` bit-exacta en BF16 y ausencia de NaN en el artefacto.

## Requisitos de hardware
- VRAM estimada para inferencia: 28,20 GiB solo para pesos; hay que añadir caché KV (reducida con `--kv-dtype fp8`) y buffers de activación, por lo que se recomienda un mínimo de 32–40 GB de VRAM efectiva.
- GPU recomendadas: RTX PRO 6000 (96 GB) para ejecución completa con visión, MTP y DFlash2; RTX 4090 (24 GB) aparece en los tags del repositorio, pero el tamaño de pesos excede su VRAM, por lo que requeriría offloading o configuraciones multi-GPU no detalladas en la información proporcionada.
- Cabe en consumer GPU: parcialmente; una RTX 4090 individual no puede alojar los 28,20 GiB de pesos. Se necesita hardware con soporte FP8 y al menos ~32 GB, o múltiples GPU.
- Opciones de despliegue: exclusivamente el motor NInfer (`ninfer` como `library_name`); no es compatible con vLLM, llama.cpp, Ollama ni TGI. El repositorio marca `inference: false` en metadatos de Hugging Face, lo que refleja que no se puede usar con el pipeline estándar de Transformers.
- Verificación de integridad: `sha256sum --check` con el hash indicado; validación estructural con `python -m tools.artifact.inspect`, que comprueba configuración, recursos, bindings y los cuatro componentes (text, vision, mtp, dflash2).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Motor compatible | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-FP8-NInfer-v3 (este) | 27B | No disponible | `.ninfer` (28,20 GiB) | Apache 2.0 | Solo NInfer | Incluye visión, MTP y DFlash2; conversión verificada bit-exacta |
| Qwen/Qwen3.8-27B (BF16) | 27B | No disponible | Safetensors | Apache 2.0 | Transformers, vLLM, TGI | Referencia de precisión completa; mayor huella de VRAM |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 27B | No disponible | Safetensors FP8 block-wise | Apache 2.0 | Transformers, vLLM | Cuantización block-wise 128×128; requiere dequantización en motores sin soporte nativo |
| Alternativas de 27B multimodal | No disponible | No disponible | No disponible | No disponible | No disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias
- El artefacto solo funciona con el motor NInfer; no es un checkpoint estándar y no puede cargarse con Transformers, llama.cpp, Ollama, vLLM ni TGI. Esto limita la portabilidad y obliga a adoptar el ecosistema NInfer.
- La cuantización FP8 E4M3 introduce un error relativo L2 de ~2,6 % frente al BF16; aunque está en el límite teórico del formato, puede afectar a tareas sensibles a la precisión numérica.
- Las proyecciones de compuerta GDN `a`/`b` se mantienen en BF16 por no ser aptas para FP8 por fila; esto implica que no todo el modelo se beneficia de las rutas FP8.
- La plantilla de chat activa `thinking on` con esfuerzo `xhigh` por defecto, lo que incrementa la latencia y el consumo de tokens si no se ajusta explícitamente.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación en la información proporcionada; deben consultarse en la card oficial de Qwen3.8-27B.
- Licencia Apache 2.0 permite uso comercial, pero el autor del artefacto no ofrece garantías sobre el rendimiento en producción; la verificación de integridad es responsabilidad del usuario.
- El repositorio tiene 1 like y 3.029 descargas en el momento de la ficha, lo que sugiere una adopción limitada y poca validación comunitaria.
- No se documentan requisitos de versión del motor NInfer ni compatibilidad hacia atrás del contenedor v3.

## Enlaces
- Repositorio del artefacto: https://huggingface.co/yyrgzn/Qwen3.8-27B-FP8-NInfer-v3
- Modelo base BF16: https://huggingface.co/Qwen/Qwen3.8-27B
- Checkpoint FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Plantilla de chat: https://github.com/Neroued/ninfer/blob/98dada0e03cb073fd07f905400b5904bc6e82759/tools/chat_templates/qwen3_8.jinja
- Repositorio del motor NInfer: https://github.com/Neroued/ninfer
