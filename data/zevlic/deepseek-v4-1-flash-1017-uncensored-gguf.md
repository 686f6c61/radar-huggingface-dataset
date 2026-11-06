# Zevlic/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Uncensored-GGUF es una compilación de cuantizaciones GGUF de un fine-tuning del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, publicado por el usuario Zevlic a través de la herramienta AtomicChat. El modelo base es una arquitectura Mixture-of-Experts (MoE) con expertos nativos en MXFP4 y un módulo Engram de tabla n-gram, según se desprende de la model card. La modificación principal consiste en una "abliteración": la dirección de rechazo (refusal direction) se proyecta fuera de los pesos originales, de modo que el modelo deja de emitir negativas ante peticiones que el modelo original rechazaría.

El interés técnico del artefacto no reside tanto en el modelo en sí como en la metodología documentada: se publican dos compilaciones (IQ1_M a 2,67 bpw y Q2_K a 3,58 bpw) con métricas de divergencia KL, coincidencia de top-1, MMLU, JailbreakBench y XSTest comparadas contra las compilaciones equivalentes de Unsloth. Además se distribuye la misma edición como un LoRA de rango 1 aplicable a otras cuantizaciones del modelo base.

El repositorio ocupa 585,7 GB y los pesos requieren entre 139,8 GB y 199,6 GB de RAM+VRAM según la compilación, lo que lo sitúa fuera del alcance de hardware de consumo convencional. La licencia declarada es MIT. El recuento de parámetros reportado en los safetensors (114.925.568) es incoherente con el tamaño del repositorio y con el contexto MoE descrito, por lo que debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con expertos nativos MXFP4 y módulo Engram (tabla n-gram) |
| Parametros totales | 114.925.568 según safetensors (dato incoherente con el tamaño del repo; no disponible un recuento fiable) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_M (2,67 bpw) y Q2_K (3,58 bpw); LoRA de rango 1 en GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (múltiples shards), LoRA en GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de DeepSeek con expertos almacenados en MXFP4 nativo, además de un componente Engram consistente en una tabla n-gram que se distribuye como shard independiente en cada compilación (shard 3 de 6 en IQ1_M, con 111 GB; shard 3 de 8 en Q2_K, con 135 GB). Según la model card, esa tabla se lee unas pocas filas por token y puede residir en SSD, por lo que el requisito de memoria real corresponde solo a los pesos. El proceso de edición se calculó sobre los pesos publicados en precisión completa (tensores BF16 y expertos MXFP4 descomprimidos de forma exacta) y abarca todos los bloques que escriben en el flujo residual: salida de atención, experto compartido, los 384 expertos enrutados de cada bloque y la proyección de valor de Engram.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación destacable es la propia abliteración, materializada también como un LoRA de rango 1 que reproduce la misma edición sobre otras cuantizaciones del modelo base con nombres de tensor compatibles. La model card advierte que el adaptador se calculó desde precisión completa y que, aplicado sobre compilaciones de 1 bit, deja de corresponder a los pesos sobre los que se suma (en UD-IQ1_M de Unsloth hizo caer MMLU de 85,6 % a 72,0 %).

## Capacidades

- Generación de texto y razonamiento en modo thinking, con niveles de esfuerzo bajo y alto configurables.
- Razonamiento multi-paso y trazas de pensamiento; la model card reporta 20/20 llamadas de herramienta válidas y 3/3 aciertos en pruebas de aguja en contexto largo con el adaptador LoRA sobre UD-Q2_K_XL.
- Tool calling / function calling, verificado con el adaptador sobre la compilación UD-Q2_K_XL de Unsloth.
- Procesamiento de contexto largo (las pruebas de aguja se realizaron sobre el modelo base con el adaptador).
- Supresión de rechazos: la dirección de rechazo se proyecta fuera de los pesos, de modo que el modelo responde a peticiones que el original rechazaría (JailbreakBench del 88,9 % al 0,0 % en IQ1_M y del 91,4 % al 0,0 % en Q2_K).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni de audio.

## Casos de uso

- Investigación sobre alineación y seguridad: el par de compilaciones con métricas de JailbreakBench, XSTest y MMLU permite estudiar empíricamente el coste de eliminar la dirección de rechazo y su impacto en conocimiento factual, con una caída documentada de 3,8 puntos en MMLU a 1 bit y sin caída significativa a 2 bits.
- Evaluación de técnicas de abliteración: la publicación incluye la edición como LoRA de rango 1 aplicable a otras cuantizaciones del modelo base, lo que facilita reproducir el experimento sobre compilaciones de terceros (Unsloth incluido) y comparar metodologías.
- Despliegue local de un MoE de gran tamaño en servidores con ~200 GB de memoria: la compilación Q2_K (199,6 GB de pesos) es la recomendada por el autor cuando el hardware lo permite, con una divergencia KL de 0,1001 frente al modelo original.
- Generación de texto sin restricciones de contenido para entornos controlados de investigación creativa o red teaming, donde el comportamiento de rechazo del modelo alineado resulta un obstáculo.
- Pruebas de robustez de filtros y salvaguardas: al eliminar la dirección de rechazo de forma medible, sirve como referencia negativa para calibrar clasificadores de contenido o políticas de moderación.
- Inferencia con llama.cpp en pipelines de CI: los ficheros cargan sin cambios en llama.cpp desde la fusión de DeepSeek-V4.1 el 25 de octubre (PR #31086) y se verificaron sobre master `d854d98`, lo que permite integrarlos en flujos automatizados de evaluación.
- Experimentación con decodificación en modo thinking: el modelo expone niveles de esfuerzo bajo y alto, útiles para medir latencia frente a calidad en tareas de razonamiento.

## Benchmarks y rendimiento

Datos publicados en la model card. Las columnas "→" leen la compilación de Unsloth del mismo layout → la compilación uncensored. Referencia de KLD: UD-Q8_K_XL de Unsloth (BF16 + MXFP4 nativo del checkpoint publicado), sobre 24 fragmentos de 4096 tokens de texto neutral reservado.

| Build | KLD medio | Mismo top-1 | KLD Unsloth mismo layout | Top-1 Unsloth |
|---|---:|---:|---:|---:|
| IQ1_M (2,67 bpw) | 0,2506 | 83,14 % | 0,2227 | 84,37 % |
| Q2_K (3,58 bpw) | 0,1001 | 89,45 % | 0,0829 | 90,45 % |

| Build | JailbreakBench (EN) | XSTest (rechazos ante prompts seguros) | Thinking bajo | Thinking alto | MMLU (500) |
|---|---|---|---|---|---|
| IQ1_M | 88,9 % → 0,0 % | 8,8 % → 0,0 % | 29/30 → 0/30 | 28/30 → 0/30 | 85,6 % → 81,8 % (p = 0,003) |
| Q2_K | 91,4 % → 0,0 % | 8,0 % → 0,4 % | 28/30 → 0/30 (adaptador) | 28/30 → 0/30 (adaptador) | 86,0 % → 86,6 % (p = 0,69) |

Con el adaptador LoRA sobre UD-Q2_K_XL de Unsloth: rechazos 0,0 % (EN), XSTest 7,6 puntos por debajo del original, MMLU (2000 preguntas) +0,55 puntos, rechazos en thinking 0/30 (bajo) y 0/30 (alto), 20/20 llamadas de herramienta válidas, 3/3 agujas en contexto largo, KL del primer token en prompts inocuos de 0,38 y dirección residual en los escritores de 5,9e-04.

## Requisitos de hardware

- VRAM/RAM para pesos: 139,8 GB con IQ1_M y 199,6 GB con Q2_K. El shard de Engram (111 GB y 135 GB respectivamente) puede residir en SSD.
- Tamaño en disco: 250,4 GB (IQ1_M) y 334,8 GB (Q2_K); repositorio completo de 585,7 GB.
- GPU recomendadas: no se especifican en la información disponible; por volumen de memoria, el despliegue requiere configuraciones multi-GPU de centro de datos (A100 80 GB, H100 80 GB) o servidores con gran cantidad de RAM.
- No cabe en GPU de consumo convencional (RTX 4090 con 24 GB, etc.) con estas compilaciones.
- Opciones de despliegue: llama.cpp, con compilación posterior al 25 de octubre (fusión de DeepSeek-V4.1, PR #31086); verificado sobre master `d854d98`. El autor indica que aún no funciona en Atomic Chat.
- Latencia y throughput: no disponibles. Se documenta que IQ1_M presenta trazas en bucle con más frecuencia en modo thinking (3/30 a esfuerzo bajo y 5/30 a esfuerzo alto en JailbreakBench).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Uncensored (este) | no disponible de forma fiable | no disponible | MIT | GGUF | Abliterado; KLD 0,1001 y MMLU 86,6 % en Q2_K |
| DeepSeek-V4.1-Flash-1017 (Unsloth, UD-Q8_K_XL) | mismo modelo base | no disponible | MIT (heredada) | GGUF | Referencia de KLD; rechazos 91,4 % en JailbreakBench, MMLU 86,0 % |
| DeepSeek-V4.1-Flash-1017 (Unsloth, UD-IQ1_M) | mismo modelo base | no disponible | MIT (heredada) | GGUF | MMLU 85,6 %; el LoRA uncensored sobre esta compilación cae a 72,0 % |
| DeepSeek-V4.1-Flash-1017 (Unsloth, UD-Q2_K_XL) | mismo modelo base | no disponible | MIT (heredada) | GGUF | Base de las pruebas del adaptador LoRA |

No se dispone de datos de benchmarks de modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- La compilación IQ1_M no supera la puerta de calidad del propio autor: MMLU cae de 85,6 % a 81,8 % (500 preguntas, p = 0,003), frente a un umbral permitido de 1,5 puntos. El autor recomienda Q2_K si el hardware lo admite.
- Mayor tendencia a bucles en modo thinking con IQ1_M: 3/30 trazas en bucle a esfuerzo bajo y 5/30 a esfuerzo alto en JailbreakBench.
- El adaptador LoRA solo es válido sobre compilaciones de ~2 bits o más; aplicado sobre 1 bit degrada MMLU de 85,6 % a 72,0 %.
- La eliminación de la dirección de rechazo es deliberada y total (0,0 % en JailbreakBench): el modelo no aplica salvaguardas de contenido, lo que lo hace inadecuado para despliegues de cara al público sin moderación externa.
- XSTest muestra una ligera reducción de rechazos ante prompts seguros (de 8,0 % a 0,4 % en Q2_K), lo que puede indicar respuestas menos cautelosas también en casos legítimos.
- El recuento de parámetros de los safetensors (114.925.568) es incompatible con el tamaño del repositorio y con la descripción MoE; no debe usarse para estimar requisitos.
- No se documentan sesgos conocidos, idiomas soportados ni longitud de contexto; no disponibles.
- Licencia MIT declarada, sin restricciones comerciales explícitas en la información disponible, aunque se heredan las condiciones del modelo base de DeepSeek.
- Requiere llama.cpp actualizado tras la fusión del 25 de octubre; no funciona en Atomic Chat según el autor.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria de las métricas reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/Zevlic/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizaciones de referencia de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Métricas y logs de compatibilidad: https://huggingface.co/datasets/AtomicChat/DeepSeek-V4.1-Flash-1017-Uncensored-GGUF-metrics/tree/main/compat/llama-master-d854d98
- PR de llama.cpp con la fusión de DeepSeek-V4.1: https://github.com/ggml-org/llama.cpp/pull/31086
- Pin de llama.cpp usado por Unsloth: https://github.com/unslothai/llama.cpp/pull/298
- Atomic Chat: https://atomic.chat/
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- X de Atomic Chat: https://x.com/atomic_chat_hq
