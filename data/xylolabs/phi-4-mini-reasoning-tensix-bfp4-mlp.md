# Xylolabs/Phi-4-mini-reasoning-Tensix-BFP4-MLP

## Resumen

Phi-4-mini-reasoning-Tensix-BFP4-MLP es una cuantización del modelo microsoft/Phi-4-mini-reasoning, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer denso de 4.450.618.368 parámetros (aproximadamente 3.800 millones en el tronco más el LM head atado al embedding) especializado en razonamiento, y esta versión cuantiza las capas lineales a formatos de bloque de coma flotante nativos del hardware: `ttnn.bfloat4_b` (BFP4) para las proyecciones MLP y `ttnn.bfloat8_b` (BFP8) para las proyecciones de atención.

La relevancia de esta ficha es doble. Por un lado, demuestra un flujo de cuantización GPTQ dirigido a un formato propietario de acelerador (block floating point con exponente compartido por bloque), no a los formatos habituales de GPU (INT4/INT8, AWQ, GGUF). Por otro, reduce el checkpoint de 7,67 GB en BF16 a 3,444 GB empaquetados, con un promedio de 7,18 bits por peso, lo que permite ejecutar un modelo de razonamiento de 4B en hardware de borde de Tenstorrent.

Es importante subrayar que los pesos se distribuyen en safetensors con precisión bf16, pero con cada valor ya alineado a la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta directamente sin recuantizar. El modelo no incluye pesos GGUF ni está pensado para inferencia convencional en GPU con ganancia de rendimiento; su valor está en el despliegue sobre Tensix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Phi-4-mini), 32 capas; pesos en formato block floating point para Tensix |
| Parametros totales | 4.450.618.368 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atencion; bf16 en embedding, LM head, normas y resto de tensores |
| Idiomas soportados | en (ingles declarado); calibracion y evaluacion incluyen texto en coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16 con valores en rejilla BFP4/BFP8), indice `model.safetensors.index.json`, configuracion de cuantizacion en `quant4.json` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Phi-4-mini con 32 capas, atención multi-cabeza y proyecciones lineales estándar (q, k, v, o en atención; gate, up, down en MLP). Esta versión no reentrena el modelo: aplica cuantización post-entrenamiento sobre las 224 matrices lineales (32 capas x 7 proyecciones). Las proyecciones MLP se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención se cuantizan a BFP8 con redondeo al más cercano (round to nearest). El LM head está atado al embedding y permanece en bf16, igual que las normas y el resto de tensores.

La innovación técnica reside en el formato de destino: block floating point con exponente compartido por bloque, que es el formato nativo de las NPU Tensix. El autor verificó que las 224 matrices cuantizadas pasan la comprobación de rejilla (grid check) y que el empaquetado TT-NN reproduce exactamente los valores en las capas 0 y 1 mediante simulación (`ttsim`). Se incluyen dos scripts de verificación: `verify_grid.py` (comprobación de rejilla solo con torch) y `pack_tensix.py` (empaquetado y round-trip por DRAM del dispositivo con `--device`). El autor indica explícitamente que tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados de Phi-4-mini-reasoning (modelo base orientado a reasoning).
- Razonamiento matemático y resolución de problemas de varios pasos.
- Generación y comprensión de código, en la medida en que lo soporte el modelo base.
- Conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Ejecución sobre NPU Tensix (Wormhole, Blackhole) a través de TT-NN con los formatos BFP4/BFP8.
- Carga estándar con `transformers` en bf16 para inspección o validación numérica en CPU/GPU (sin la ventaja de empaquetado del hardware Tensix).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma; el coreano aparece solo en el conjunto de calibración y evaluación, no como idioma declarado de soporte.
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo thinking separado.

## Casos de uso

- Despliegue en hardware Tenstorrent Wormhole o Blackhole: el caso principal. El checkpoint está empaquetado para que TT-NN lo cargue directamente en DRAM del dispositivo sin recuantización, lo que simplifica el pipeline de inferencia en aceleradores Tensix.
- Inferencia de razonamiento en el borde con presupuesto de memoria reducido: con 3,444 GB empaquetados frente a 7,67 GB en BF16, cabe en configuraciones de memoria limitadas de la NPU, permitiendo ejecutar un modelo de 4B orientado a reasoning donde un BF16 no encajaría.
- Validación de pipelines de cuantización GPTQ para formatos block floating point: sirve como referencia reproducible para equipos que necesiten cuantizar otros modelos a BFP4/BFP8 con búsqueda de exponente por bloque y verificación de rejilla.
- Investigación en robustez de cuantización agresiva: la evaluación publicada (KL medio de 1,162884 frente a BF16, top-1 del 57,82 %) permite estudiar la degradación de un modelo de razonamiento a ~7 bits por peso en comparación con Q4_K_M de llama.cpp.
- Pruebas de regresión numérica en simulación: los scripts `verify_grid.py` y `pack_tensix.py` permiten integrar comprobaciones automáticas de fidelidad de pesos en CI antes de desplegar en dispositivo.
- Evaluación comparativa de formatos de compresión en hardware no-GPU: útil para comparar BFP4/BFP8 frente a esquemas INT4/GGUF en términos de KL y aciertos en preguntas cortas, con la misma línea base BF16.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad respecto a BF16, no calidad de tarea ni velocidad en dispositivo (el autor indica que no se midió velocidad).

| Modelo | Bits/peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/Phi-4-mini-reasoning) | 16 | 7,67 | 0 | 100 | 16 de 33 | - |
| Este modelo (BFP4 MLP / BFP8 atencion) | 7,18 | 3,444 | 1,162884 | 57,82 | 15 de 33 | 2 |
| Q4_K_M (llama.cpp) | 5,18 | 2,486 | 1,147011 | 56,09 | 19 de 33 | 1 |

KL y top-1 se calculan sobre 16.192 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con plantilla de chat, siempre contra la misma pasada BF16. El criterio de aceptación del autor era un KL medio como máximo 1,5 veces el de Q4_K_M y como máximo una respuesta perdida adicional; el modelo cumple el criterio de KL (1,01 veces) pero no el de respuestas perdidas (2 frente a 1). Las 33 respuestas son prompts cortos con comprobación automática; "perdida" significa correcta en BF16 pero incorrecta o rota en esta versión, sin contar empates cercanos. Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix.

## Requisitos de hardware

- VRAM/DRAM: 3,444 GB empaquetados en BFP4/BFP8; el repositorio ocupa 8,9 GB por incluir los tensores en bf16. Para carga en `transformers` en bf16 se necesita espacio equivalente al checkpoint completo (del orden de 7,67 GB de pesos más overhead).
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante TT-NN (`ttnn.bfloat4_b`, `ttnn.bfloat8_b`, `ttnn.TILE_LAYOUT`, `DRAM_MEMORY_CONFIG`).
- GPU consumer: no es el objetivo del checkpoint; puede cargarse en bf16 con `transformers` y `device_map="auto"` para inspección, pero sin beneficio de empaquetado BFP y sin datos de rendimiento publicados.
- Opciones de despliegue: TT-NN sobre Tensix (soporte principal); `transformers` (carga y validación); scripts `pack_tensix.py` y `verify_grid.py` para verificación; tt-transformers y tt-forge no fueron probados con este checkpoint según el autor.
- Latencia y throughput: no disponibles; el autor no midió velocidad en dispositivo.
- Formatos alternativos: no se publican GGUF ni variantes INT4/INT8 en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (Xylolabs) | 4,45 B | no disponible | BFP4 MLP + BFP8 atencion, 7,18 bits/peso | 3,444 GB | MIT | Hugging Face, orientado a Tensix |
| microsoft/Phi-4-mini-reasoning (BF16) | 4,45 B | no disponible | BF16, 16 bits/peso | 7,67 GB | MIT | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 4,45 B | no disponible | GGUF Q4_K_M, 5,18 bits/peso | 2,486 GB | MIT | Generado localmente con llama.cpp v0.9.0 |

La comparación relevante es de fidelidad y encaje en hardware: Q4_K_M logra menor tamaño y KL ligeramente mejor, pero está pensado para CPU/GPU con llama.cpp, mientras que esta versión está empaquetada para TT-NN en Tensix. No se dispone de comparación con otros modelos de razonamiento de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible frente a BF16: KL medio de 1,162884 y top-1 del 57,82 % sobre 16.192 posiciones; el autor califica ambos KL como altos y el modelo no cumple su propio criterio de respuestas perdidas (2 frente al máximo de 1).
- Hardware específico: el beneficio de empaquetado solo se materializa en NPU Tensix; en GPU o CPU se carga como bf16 sin ventaja de memoria ni de velocidad.
- Sin medición de rendimiento: no hay datos de latencia ni throughput en dispositivo.
- Cobertura de verificación parcial: la comprobación de empaquetado TT-NN en `ttsim` cubrió solo las capas 0 y 1; tt-transformers y tt-forge no se probaron con este checkpoint.
- Idiomas: solo inglés declarado; el coreano se usa en calibración y evaluación, pero no está soportado oficialmente. Riesgo de degradación en otros idiomas, incluido el castellano.
- Riesgo de alucinación: inherente al modelo base de razonamiento; la cuantización agresiva puede incrementarlo en tareas de varios pasos.
- Contexto: la longitud de contexto no se detalla en la información disponible; debe consultarse la model card del modelo base.
- Licencia MIT heredada del modelo base; los scripts `pack_tensix.py` y `verify_grid.py` son Apache-2.0 según el autor. El modelo se proporciona "as is", sin garantía, y el autor declara no estar afiliado ni respaldado por Tenstorrent.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tensix-BFP4-MLP/blob/main/LICENSE
