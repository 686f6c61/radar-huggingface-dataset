# vwdubb/Swift-Qwen3.8-27b-Terse-Coder-FP8

## Resumen

vwdubb/Swift-Qwen3.8-27b-Terse-Coder-FP8 es un checkpoint multimodal de 27.781.427.952 parámetros (unos 27,8 B) publicado por el usuario vwdubb. Consiste en la fusión de los pesos de ukisai/Swift-Qwen3.8-27b con el adaptador LoRA Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, DPO de rango 16, alpha 32, escala 2,0), de forma que el resultado incorpora el razonamiento eficiente en tokens de Swift y las trazas de código concisas de Terse-Coder en un único checkpoint, sin necesidad de cargar el adaptador en tiempo de ejecución.

El modelo pertenece a la familia Qwen3.8 (etiquetas qwen3_8 y qwen3_5), conserva la interfaz estándar de Qwen3.8 con soporte de texto, imagen y vídeo, y mantiene intactas la cabeza MTP (multi-token prediction) y las cabezas de visión, por lo que la decodificación especulativa sigue estando disponible. La model card del adaptador recomienda el LoRA en tiempo de ejecución como forma de despliegue a plena capacidad y advierte de una pérdida de capacidades tras la fusión.

Su interés actual es doble: por un lado, reduce el coste por respuesta en cargas de generación de código al recortar los tokens de razonamiento (el modelo base Swift ya es, según su autor, un 58 % más eficiente en tokens que Qwen3.8-27B de serie); por otro, es un artefacto experimental sin benchmarks independientes, con licencia de umbral comercial (Swift Open License v1.0) y con una discrepancia entre el nombre del repositorio (FP8) y el dtype descrito en la model card (bf16) que conviene verificar antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.8 (tags qwen3_8 / qwen3_5) con cabeza MTP para decodificación especulativa; pesos resultantes de una fusión de LoRA sobre el modelo base |
| Parámetros totales | 27.781.427.952 (~27,8 B) |
| Parámetros activos | No aplica: no se describe como MoE en la información disponible |
| Longitud de contexto | 262.144 tokens (valor empleado en el ejemplo oficial de vLLM de la model card); no confirmado explícitamente como máximo en la ficha |
| Tipos de cuantización | FP8 (nombre del repositorio y tag compressed-tensors); la model card describe pesos bf16 con redondeo estocástico; existe GGUF del modelo base Swift (no de este artefacto) |
| Idiomas soportados | No disponible |
| Licencia | Swift Open License v1.0 (derivada; el Qwen3.8-27B subyacente es Apache 2.0) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 38,5 GB |
| Pipeline declarado | image-text-to-text |
| Acceso | Repositorio con gated: true |

## Arquitectura y entrenamiento

El punto de partida es ukisai/Swift-Qwen3.8-27b, un ajuste de Qwen3.8-27B orientado a reducir el exceso de razonamiento ("less overthinking"), que incorpora un componente de transferencia derivado de BottleCap AI ThinkingCap-Qwen3.6-27B y mantiene la interfaz estándar de Qwen3.8 con soporte de texto, imagen y vídeo. Sobre ese modelo se aplica el adaptador Shockem/Qwen3.8-27b-Terse-Coder-LoRA (ronda 8, DPO de rango 16), que actúa como edición de comportamiento —no de conocimiento— para producir trazas de código más concisas cuando el modo thinking está activo.

La fusión se realizó en fp32 con la fórmula `W + B @ A * (lora_alpha / r)`, con alpha 32 y r 16 (escala 2,0), y se almacenó en bf16 usando redondeo estocástico (no sesgado) con semilla fija 0, de modo que el proceso es reproducible. El motivo es que los deltas del adaptador son muy pequeños (‖Δ‖/‖W‖ ≈ 4e-4–1e-3), por debajo de la resolución por elemento de bf16: la model card del adaptador mide una supervivencia del delta de solo el 31–61 % con redondeo bf16 convencional frente al 94–99,9 % en fp16. La cabeza MTP y los pesos de visión no se tocaron, por lo que la decodificación especulativa MTP sigue operativa. Todos los ficheros no de pesos (config, tokenizer, processor, índice) se copiaron del modelo Swift base, y la plantilla de chat es `Shockem/froggeric-terse-coder`, la misma con la que se evaluó el adaptador.

## Capacidades

- Generación de texto conversacional multi-turno en el formato de chat de Qwen3.8.
- Razonamiento con modo thinking explícito y control mediante el parámetro `reasoning_effort` (se han documentado pruebas del modelo base Swift en los niveles xhigh, medium y low).
- Generación y edición de código, con trazas de razonamiento deliberadamente concisas orientadas a reducir el consumo de tokens.
- Procesamiento de imagen y vídeo: el pipeline declarado es image-text-to-text y el modelo base conserva el soporte de texto, imagen y vídeo.
- Tool calling / function calling: el ejemplo oficial de vLLM usa `--enable-auto-tool-choice` con `--tool-call-parser qwen3_coder`.
- Despliegue agéntico multi-paso: compatible con el parser de razonamiento `qwen3` de vLLM.
- Decodificación especulativa MTP (`{"method":"mtp","num_speculative_tokens":3}`), disponible porque la cabeza MTP se preservó intacta.
- Capacidades multilingües: no disponibles (el autor no declara idiomas).
- No se documentan capacidades de audio ni de otro tipo más allá de texto, imagen y vídeo.

## Casos de uso

- Asistentes de código en IDE y revisión de pull requests: el ajuste Terse-Coder recorta las trazas de razonamiento en tareas de programación, lo que reduce directamente el coste por completación en herramientas que emiten muchas peticiones cortas.
- Pipelines de CI/CD con function calling: al soportar `--enable-auto-tool-choice` y el parser `qwen3_coder`, se puede conectar a herramientas de build, linters o APIs internas y dejar que el modelo orqueste pasos de corrección automática.
- Agentes de largo horizonte con contexto extenso: el ejemplo de despliegue configura 262.144 tokens de ventana, suficiente para razonar sobre repositorios grandes, logs largos o documentación técnica acumulada sin trocear el contexto en exceso.
- Análisis de documentación técnica escaneada o capturas de pantalla: al ser image-text-to-text, puede extraer información de diagramas de arquitectura, tablas de errores o interfaces de usuario y devolverla en formato estructurado.
- Servicio self-hosted con latencia ajustada: la decodificación especulativa MTP con 3 tokens especulativos por paso está pensada para aumentar el throughput en despliegues vLLM con paralelismo tensorial 1.
- Migas de razonamiento auditables en entornos regulados: el modo thinking permite conservar la cadena de razonamiento, mientras que la concisión del ajuste acota su longitud y, con ello, el coste de almacenarla y revisarla.
- Sustitución de un despliegue con adaptador en runtime: si el equipo ya servía el modelo Swift base más el LoRA cargado por separado, este checkpoint elimina la fontanería del adaptador y el coste asociado de gestión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes sobre este artefacto. La model card lo indica de forma explícita ("no independent benchmarks have been run on this artifact"). Los únicos datos numéricos disponibles en la información proporcionada son cualitativos o internos del adaptador:

| Métrica | Valor | Contexto |
|---|---|---|
| Supervivencia del delta del adaptador con redondeo bf16 convencional | 31–61 % | Medición del autor del adaptador, citada en la model card |
| Supervivencia del delta del adaptador en fp16 | 94–99,9 % | Medición del autor del adaptador, citada en la model card |
| Impuesto de capacidad tras la fusión (fp32-merge → fp16 → NVFP4) | 70 % → 60–62 % sobre su conjunto held-out-40 | Medición del autor del adaptador; corresponde a un proceso de re-cuantización distinto al de este artefacto |
| Rendimiento al aplicar el LoRA dos veces | 63 % de aprobados, con fallos en la categoría `no_code` | Pruebas del adaptador; caso a evitar |
| Eficiencia en tokens del modelo base Swift frente a Qwen3.8-27B de serie | ~58 % más eficiente en tokens | Afirmación del autor del ajuste Swift |
| Evaluación del modelo base Swift | Nueve benchmarks, pesos BF16, cinco ejecuciones por modelo | Los valores numéricos no se incluyen en la información disponible |

## Requisitos de hardware

- Pesos en bf16 (si el checkpoint se carga en bf16): ~55,6 GB solo para los pesos, calculado a partir de 27,78 B de parámetros × 2 bytes. Estimación aritmética, no un dato publicado.
- Pesos en FP8: ~27,8 GB solo para los pesos (estimación aritmética sobre 1 byte por parámetro). El repositorio ocupa 38,5 GB, cifra coherente con una mezcla de precisiones (por ejemplo, componentes de visión o embeddings en bf16), aunque la model card describe el merge en bf16; conviene comprobar el dtype real del checkpoint antes de dimensionar.
- GPU de centro de datos: A100 80 GB y H100 80 GB cubren FP8 con holgura razonable; en bf16 los 55,6 GB de pesos dejan poco margen para la caché KV sobre una única GPU de 80 GB. H200 (141 GB) permite bf16 sin particionar.
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) en FP8 sin offloading, dado que los pesos rondan los 27,8 GB. Dos RTX 4090 o 3090 (48 GB agregados) permiten FP8 con contexto moderado. Para una sola GPU de 24 GB habría que recurrir a cuantizaciones GGUF de 4 bits (~16–18 GB), disponibles para el modelo base Swift pero no para este artefacto, que se distribuye en safetensors.
- Caché KV a contexto completo: activar los 262.144 tokens configurados en el ejemplo de vLLM multiplica el consumo de memoria de la caché KV; no se dispone de cifras exactas (número de capas, cabezas y dimensiones de la caché por token) en la información proporcionada. Se recomienda medir con la carga real antes de fijar `--max-model-len`.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor`; vLLM con `--dtype bfloat16`, `--tensor-parallel-size 1`, `--max-model-len 262144`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`; decodificación especulativa MTP mediante `--speculative-config`. Para cuantizaciones GGUF del modelo base existen despliegues tipo llama.cpp/Ollama, pero no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vwdubb/Swift-Qwen3.8-27b-Terse-Coder-FP8 (este) | 27,78 B | 262.144 tokens usados en el ejemplo oficial; máximo no confirmado | Sin benchmarks independientes; impuesto de capacidad reportado por el autor del adaptador | Swift Open License v1.0 (gratuita hasta 1 M USD de facturación anual) | Safetensors, repositorio gated |
| ukisai/Swift-Qwen3.8-27b (base) | 27,8 B (mismo orden) | No disponible | Evaluado en nueve benchmarks con BF16 por UkisAI; cifras no incluidas en la información disponible | Swift Open License v1.0 | Safetensors bf16; existe GGUF del modelo completo (170,1 GB en 3 partes) |
| Qwen/Qwen3.8-27B (modelo original) | 27 B | No disponible | Sin datos numéricos en la información proporcionada | Apache 2.0 | Pesos públicos; también en ModelScope |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA (adaptador) | Adaptador LoRA, r=16, alpha=32 | No aplica | 70 % en su held-out-40 en la forma recomendada (LoRA en runtime) | Apache 2.0 | Adaptador LoRA, requiere el modelo base |

No se dispone de una comparación cuantitativa de rendimiento entre estas variantes: los únicos números publicados corresponden a evaluaciones internas de los autores de cada componente.

## Limitaciones y advertencias

- Ausencia total de benchmarks independientes sobre este artefacto, tal y como reconoce la model card. No debe asumirse que iguala al LoRA aplicado en tiempo de ejecución.
- Impuesto de capacidad tras la fusión: el autor del adaptador midió una caída del 70 % al 60–62 % en su conjunto held-out-40 al pasar por fp32-merge, fp16 y re-cuantización NVFP4. Este artefacto almacena en bf16 sin re-cuantizar, por lo que el autor espera un impuesto menor, pero no nulo.
- Prohibido apilar el LoRA Terse-Coder encima de este checkpoint: la model card advierte de que la doble aplicación acorta en exceso el razonamiento y provocó fallos de la categoría `no_code` con un 63 % de aprobados en las pruebas del adaptador.
- El ajuste es una edición de comportamiento, no de conocimiento: en tareas que requieran derivaciones largas hay que subir `reasoning_effort`, ya que el modelo tiende a abreviar.
- Discrepancia entre el nombre del repositorio (FP8) y la model card (merge almacenado en bf16 con redondeo estocástico), agravada por un tamaño de repositorio de 38,5 GB que no coincide exactamente con ninguna de las dos hipótesis. Hay que verificar el dtype real de los tensores antes de planificar memoria.
- Licencia con umbral comercial: Swift Open License v1.0 permite uso personal, de investigación, educativo, de evaluación y comercial a individuos y organizaciones con facturación anual bruta de hasta 1.000.000 USD; por encima de ese umbral se requiere una Swift Enterprise License de UkisAI. Los derechos sobre Qwen3.8-27B en sí no quedan limitados por esta licencia.
- Repositorio con `gated: true`: el acceso requiere aceptar condiciones en HuggingFace, lo que puede complicar la automatización de descargas en CI/CD.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe ni sobre el comportamiento fuera del inglés.
- Riesgo de alucinación: inherente a los modelos de esta familia y no cuantificado en la información disponible para este artefacto concreto.
- Sesgos: no se documenta ningún análisis de sesgos ni de seguridad en la información proporcionada.
- Contexto: los 262.144 tokens proceden del ejemplo de despliegue, no de una especificación formal de la model card; el coste en memoria de la caché KV a esa longitud puede hacer inviable el despliegue en una sola GPU.
- Modelo publicado con 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vwdubb/Swift-Qwen3.8-27b-Terse-Coder-FP8
- Variante FP8 del modelo base: https://huggingface.co/vwdubb/Swift-Qwen3.8-27b-FP8
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Adaptador LoRA: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
- Anuncio de Swift-Qwen3.8-27B (UkisAI): https://ukisai.com/news/introducing-swift
- GGUF del modelo Swift-Qwen3.8-27b: https://local-ai-zone.github.io/models/swift-qwen3-8-27b.html
- Qwen3.8-27B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.8-27B
- Organización Qwen en HuggingFace: https://huggingface.co/Qwen
