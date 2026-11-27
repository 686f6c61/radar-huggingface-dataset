# Xylolabs/clef-Tenstorrent-Tensix-BFP4

## Resumen

Clef para Tenstorrent Tensix (BFP4 MLP) es una versión cuantizada del modelo Cloudflare/clef, publicada por Xylolabs y adaptada específicamente para su ejecución sobre NPUs de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante la pila de software TT-Metal y TT-NN. No se trata de un modelo generativo de texto: es un modelo de decisión que, dado un estado estructurado y un conjunto de preguntas con opciones cerradas, devuelve una distribución de probabilidad sobre cada opción permitida en una sola pasada hacia delante, sin producir texto libre.

El modelo base Cloudflare/clef emplea una arquitectura híbrida Qwen3.5 que combina atención clásica con capas DeltaNet (atención lineal), e incorpora un codificador de visión que se conserva íntegro en bf16 en esta exportación. La cuantización afecta solo a las proyecciones del backbone: las matrices MLP (gate/up/down) pasan a `bfloat4_b` (BFP4) mediante GPTQ con búsqueda de exponente por bloque, mientras que las proyecciones de atención y DeltaNet se almacenan en `bfloat8_b` (BFP8) por redondeo al más cercano. La cabeza de esquema conjunta, la tabla léxica original, los embeddings de entrada, las normas y el codificador de visión permanecen en BF16 sin modificar.

Con 27.356.728.560 parámetros totales y un peso empaquetado de aproximadamente 23,59 GB para Tensix, esta ficha resulta relevante para quienes despliegan clasificación y toma de decisiones estructuradas sobre hardware de Tenstorrent, donde el formato de bloque flotante nativo del acelerador permite reducir huella sin salir del ecosistema TT-NN. La licencia Apache-2.0 facilita su uso comercial, y el hecho de que la precisión medida supere ligeramente a la del backbone bf16 en el conjunto de evaluación etiquetado (36 aciertos frente a 35 sobre 40) lo convierte en una alternativa práctica al BF16 en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con atención clásica y capas DeltaNet (atención lineal), más codificador de visión |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (los registros de evaluación van de 152 a 16.384 tokens) |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP con GPTQ y búsqueda de exponente por bloque; BFP8 (`bfloat8_b`) en atención y DeltaNet por redondeo al más cercano; BF16 en cabeza de esquema, tabla léxica, embeddings, normas y visión |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json` para el mapeo de formatos) |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido de la familia Qwen3.5 que intercala capas de atención estándar con capas DeltaNet, un mecanismo de atención lineal que reduce el coste computacional en secuencias largas. Sobre ese backbone se monta una cabeza de esquema conjunta que evalúa todas las opciones permitidas de cada pregunta en una única pasada, más una tabla léxica original que se conserva en BF16. El modelo incluye además un codificador de visión cuyos pesos no se cuantizan en esta exportación.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base. La innovación técnica de esta exportación reside en el esquema de cuantización: GPTQ con búsqueda de exponente por bloque para llevar las matrices MLP a BFP4, redondeo al más cercano para atención y DeltaNet a BFP8, y verificación de las 496 proyecciones cuantizadas mediante comprobación de rejilla, empaquetado nativo TT-NN y conversión a BFP8. La evaluación se realizó con TT-NN 0.81.1 y el simulador de Blackhole.

## Capacidades

- Clasificación y decisión estructurada: devuelve una puntuación por cada opción permitida de una pregunta de tipo `choice` o `noul` (sí/no), sin generar texto.
- Evaluación de múltiples preguntas en una sola pasada hacia delante sobre un mismo estado estructurado.
- Procesamiento de estados tipo JSON (por ejemplo, facturas con campos de proveedor, importe, divisa y estado).
- Soporte de visión gracias al codificador de visión conservado en BF16.
- Capacidades multilingües limitadas a inglés y coreano según la model card.
- Ejecución nativa sobre NPUs Tenstorrent (Wormhole, Blackhole) mediante TT-NN, con formatos de bloque flotante propios del acelerador.
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso en el sentido de los modelos generativos; su salida es una distribución de probabilidad sobre opciones.

## Casos de uso

- Clasificación de documentos financieros: dado un estado con datos de factura, el modelo responde a preguntas cerradas como el estado de pago o si el importe supera un umbral, devolviendo probabilidades calibradas por opción en una sola pasada.
- Enrutamiento y triaje de tickets: con un estado estructurado del ticket y un conjunto de categorías permitidas, el modelo asigna probabilidades a cada categoría para alimentar un sistema de asignación automática.
- Validación de formularios y extracción con verificación: combinando el codificador de visión con preguntas de tipo sí/no, se pueden comprobar condiciones sobre documentos escaneados sin generar texto libre.
- Moderación y políticas de contenido sobre metadatos estructurados: evaluación de cumplimiento de reglas cerradas sobre registros con campos definidos.
- Despliegue en edge con NPUs Tenstorrent: al empaquetarse en unos 23,59 GB y usar formatos BFP4/BFP8 nativos de TT-NN, encaja en entornos Wormhole o Blackhole donde no se dispone de GPU convencional.
- Sustitución de un backbone BF16 en producción: la evaluación muestra una precisión etiquetada de 36/40 frente a 35/40 del BF16, lo que permite reducir huella manteniendo o mejorando la calidad en la tarea de decisión.
- Sistemas de decisión por lotes: la evaluación cubre 44 registros y 55 preguntas con longitudes de 152 a 16.384 tokens, lo que respalda su uso en pipelines de clasificación por lotes con contextos variables.

## Benchmarks y rendimiento

| Perfil de decisión | KL medio de la distribución de opciones | Aciertos etiquetados / 40 |
|---|---:|---:|
| Backbone y cabeza BF16 originales | 0 | 35 |
| Esta exportación con cabeza BF16 y tabla léxica originales | 0,0093908380 | 36 |
| Backbone llama.cpp Q4_K_M del mismo modelo base, cabeza BF16 original | 0,0081680764 | 35 |

La evaluación cubre los mismos 44 registros, 55 preguntas y 40 preguntas etiquetadas, con registros de 152 a 16.384 tokens. La KL media de esta exportación es 1,1497 veces la de Q4_K_M, y supera la comprobación de precisión de cuantización.

## Requisitos de hardware

- Peso empaquetado para Tensix: aproximadamente 23,59 GB, incluyendo los pesos de visión retenidos y la cabeza conjunta y tabla léxica completas en BF16.
- Para el quickstart con Transformers 5.23.0 y PyTorch se requiere una GPU CUDA con memoria suficiente para los valores del archivo BF16.
- Ejecución objetivo en NPUs Tenstorrent Wormhole y Blackhole mediante TT-NN 0.81.1; verificado con el simulador de Blackhole.
- No se especifican requisitos de VRAM para GPU de consumo ni modelos concretos de GPU recomendados; no disponible.
- Opciones de despliegue: TT-NN con `pack_tensix.py`, `verify_grid.py` y el runner `tensix-runner v0.1.0`; para inspección en host, Transformers con código personalizado (`joint_schema_model`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Precisión reportada |
|---|---|---|---|---|---|
| Xylolabs/clef-Tenstorrent-Tensix-BFP4 | 27.356.728.560 | no disponible | BFP4 MLP + BFP8 atención/DeltaNet, safetensors | Apache-2.0 | KL 0,0093908380; 36/40 |
| Cloudflare/clef (base, BF16) | no disponible en la información | no disponible | BF16 | no disponible | KL 0; 35/40 |
| Mismo base vía llama.cpp Q4_K_M | no disponible en la información | no disponible | Q4_K_M (GGUF) | no disponible | KL 0,0081680764; 35/40 |

No se dispone de datos de otros modelos comparables de la misma categoría (modelos de decisión estructurada) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso; su salida es una distribución sobre opciones predefinidas.
- Idiomas limitados a inglés y coreano según la model card; el rendimiento en otros idiomas no está caracterizado.
- La longitud de contexto no se declara explícitamente; los registros de evaluación llegan a 16.384 tokens, por lo que no hay garantía documentada más allá de ese rango.
- La cuantización BFP4/BFP8 está pensada para Tensix; ejecutarla en GPU requiere el código personalizado y Transformers 5.23.0, y los pesos cuantizados se almacenan como BF16 sobre rejillas de bloque flotante.
- El conjunto de evaluación es reducido (40 preguntas etiquetadas), por lo que las diferencias de precisión frente a BF16 y Q4_K_M no deben interpretarse como concluyentes.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente en las probabilidades por opción fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Cloudflare/clef y de las dependencias TT-NN y TT-Metal.
- Verificado con TT-NN 0.81.1 y simulador de Blackhole; el comportamiento en hardware Wormhole real no se detalla en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/clef-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Cloudflare/clef
- Código de cuantización (tensix-bfp-gptq v0.1.0): https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Repositorio tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Kernels (tensix-kernels v0.1.0): https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner (tensix-runner v0.1.0): https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/clef-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
