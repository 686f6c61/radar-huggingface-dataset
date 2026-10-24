# that80-20/Qwen3.8-Flash-Next-trellis-a35-ignis

## Resumen

Este repositorio no contiene el modelo original, sino una conversión de `Qwen/Qwen3.8-Flash-Next` (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`) realizada por el usuario `that80-20` para **ignis**, un servidor de inferencia diseñado para ejecutarse en una única RTX 5090. El objetivo es empaquetar un modelo de mezcla de expertos (MoE) de 125B parámetros totales y 6B activos en contenedores `.ninfer` v2 donde los expertos enrutados se almacenan a una media de 3,5 bits por peso, de forma que el modelo pueda servirse desde una GPU de 32 GB apoyándose en RAM del sistema anfitrión.

Se trata de un artefacto de cuantización, no de un checkpoint estándar: los ficheros **no** son Transformers, safetensors, GGUF ni EXL3, y solo los lee ignis (el autor indica que NInfer no soporta Flash-Next en el momento de publicación y que el formato de expertos es propio de ignis). Ocupa 86,9 GB en disco, requiere unos 60 GB de RAM de sistema y se sitúa en el peldaño intermedio de la "escala trellis" del autor, entre la variante de 2,5 bits (mínimo footprint) y la de 4,04 bits (máxima fidelidad).

Su relevancia práctica es que, según las mediciones del conversor, consigue un top-1 del 91,62% y un KLD medio de 0,0748 nats frente al release nativo, cifras que el autor compara favorablemente con la escala Dynamic GGUF de Unsloth (necesitaría UD-Q4_K_XL, 111,3 GB, para igualar el top-1). Es el artefacto recomendado para sistemas con 96 GB de memoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal de la familia Qwen3.8-Flash-Next; diseño híbrido Gated DeltaNet + Gated Attention según el repositorio oficial del modelo base. El artefacto distribuido usa contenedores propietarios `.ninfer` v2 |
| Parámetros totales | 125B (mixture of experts) |
| Parámetros activos | 6B |
| Longitud de contexto | No disponible para el modelo base en la información proporcionada. Se han medido ventanas de 8.192 tokens (ruta QSA dispersa) y prefill a 14k tokens |
| Tipos de cuantización | Expertos enrutados en trellis a 3,50 bpw de media; resto de tensores (atención y no expertos) en FP8; n-grama INT4. No hay versiones GGUF, EXL3 ni safetensors |
| Idiomas soportados | No disponible. El corpus de evaluación de fidelidad cubre en, de, it, ja, zh además de código y matemáticas |
| Licencia | `qwen-community-license-1.0` (etiquetada como `other` en HuggingFace) |
| Formato de pesos | Contenedores `.ninfer` v2; solo los carga el servidor ignis |

Datos adicionales del artefacto: 86,9 GB en disco, ~60 GB de RAM de sistema requerida, pipeline `text-generation`, librería `ninfer`, 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo base es, según el repositorio oficial de QwenLM, un MoE multimodal que sirve como avance de la arquitectura empleada en Qwen4; el diseño híbrido **Gated DeltaNet + Gated Attention** introducido en Qwen3-Next se ha reutilizado en las series Qwen3.5 a Qwen3.8. El release nativo almacena los expertos en NVFP4 con el resto de tensores en BF16 y ocupa 127 GB. Esta conversión no reentrena nada: reformatea los pesos para que ignis pueda servirlos en una GPU de consumo, manteniendo los expertos enrutados en un formato trellis de 3,5 bits y el resto en FP8, con un n-grama INT4 adicional.

Sobre el proceso de conversión, la model card documenta que el suelo de empaquetado FP8 de los tensores no-expertos es de ~0,05 nats (brazo de control `fp8_only`, independiente del presupuesto de bits); dado que esta imagen mide 0,0748 nats, el autor concluye que la mayor parte del error residual proviene del formateo FP8 de atención y no expertos, no de la cuantización de los expertos. No se aportan datos sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni proceso de alineación, porque son propiedades del modelo base y no se documentan en esta ficha.

## Capacidades

- Generación de texto y conversación multi-turno, incluyendo ventanas largas (la evaluación cubre contextos de 8.192 tokens en la ruta QSA dispersa).
- Generación de código: el dominio `py` es el de mayor fidelidad de la tabla (KLD 0,0217; top-1 98,1%) y `code` se mantiene en top-1 91,2%.
- Matemáticas: dominio `math` con KLD 0,0302 y top-1 96,7% frente al release nativo.
- Razonamiento y conocimiento general: proxy MMLU-Pro del 72,2% en la versión cuantizada frente al 74,0% del nativo.
- Capacidad multimodal: el modelo base se describe como multimodal en el repositorio oficial; el artefacto se publica con pipeline `text-generation` y no se documenta el soporte de imagen en ignis.
- Cobertura multilingüe evaluada en cinco idiomas (inglés, alemán, italiano, japonés y chino), con calidad desigual: `it` y `en` son los mejor preservados y `ja` el peor.
- No se documentan en la información disponible soporte de tool calling, function calling, razonamiento agéntico multi-paso ni modo "thinking" para este artefacto concreto.

## Casos de uso

- Asistente de código en local: con top-1 del 98,1% en Python y 91,2% en código general, es adecuado para autocompletado y refactorización en un puesto de trabajo con una RTX 5090, sin depender de APIs externas.
- Servicio de chat con contexto largo: los 125B/6B activos y la ventana evaluada de 8.192 tokens permiten conversaciones multi-turno con documentos adjuntos, siempre que se acepte la degradación medida en prosa (KLD 0,0818 a 8k frente a 0,0333 en chat a 2k).
- Resolución de problemas matemáticos y tutoría técnica: el dominio `math` conserva un top-1 del 96,7%, el segundo mejor de la tabla tras Python.
- Procesamiento de documentación multilingüe en inglés, alemán, italiano y chino dentro de una misma infraestructura, asumiendo mayor pérdida en japonés y en prosa larga.
- Inferencia en hardware de gama alta para investigación: permite estudiar el comportamiento de un MoE de 125B con 3,5 bpw en una sola GPU, con throughput medido de 95,6 tok/s en decodificación.
- Despliegue en estación de trabajo con RTX PRO 6000 Blackwell (96 GB): el autor recomienda explícitamente esta imagen para sistemas de 96 GB, donde deja más de 30 GB de RAM libre y precarga notablemente más rápido que la variante de 4,04 bits.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible para contrastar trellis 3,5 bpw frente a la escala Dynamic GGUF de Unsloth a igualdad de presupuesto de disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad estándar (MMLU, HumanEval, GSM8K) en la información disponible. Lo que sí se publica son métricas de **fidelidad de cuantización** frente al release nativo (expertos en NVFP4, forward en BF16), calculadas por el conversor con KLD de vocabulario completo sobre un corpus de 11 dominios de 2.048 tokens (131.978 tokens).

| Artefacto | Receta | Disco (GB) | KLD medio | Top-1 |
|---|---|---:|---:|---:|
| Release nativo (referencia) | Expertos NVFP4 / resto BF16 | 127 | 0 (ref.) | 100% (ref.) |
| a25 (hermano) | Trellis 2,50 bpw + n-grama INT4 | 71,8 | 0,1053 | 89,68% |
| UD-IQ3_XXS (Unsloth) | GGUF Dynamic | 82,0 | 0,1651 | 85,41% |
| **a35 (este repo)** | **Trellis 3,50 bpw + n-grama INT4** | **86,9** | **0,0748** | **91,62%** |
| UD-Q3_K_XL (Unsloth) | GGUF Dynamic | 90,0 | 0,1065 | 88,32% |
| UD-IQ4_XS (Unsloth) | GGUF Dynamic | 93,7 | 0,0836 | 89,55% |
| a40 (hermano) | Trellis 4,04 bpw + n-grama INT4 | 94,8 | 0,0655 | 92,17% |
| UD-Q4_K_XL (Unsloth) | GGUF Dynamic | 111,3 | 0,0469 | 92,26% |

El autor advierte que las comparaciones entre pilas (ignis frente a llama.cpp) deben tratarse con un margen de ±0,02-0,05 nats por diferencias de corpus y motor, mientras que el orden interno a25 → a35 → a40 es exacto.

Fidelidad por dominio de este artefacto:

| Dominio | KLD (nats) | KLD top-64 | Acuerdo top-1 |
|---|---:|---:|---:|
| chat | 0,0333 | 0,0319 | 94,9% |
| code | 0,0781 | 0,0724 | 91,2% |
| de | 0,0859 | 0,0798 | 89,5% |
| en | 0,0643 | 0,0602 | 90,6% |
| it | 0,0266 | 0,0245 | 93,3% |
| ja | 0,0897 | 0,0816 | 86,2% |
| math | 0,0302 | 0,0295 | 96,7% |
| mmlu | 0,0970 | 0,0913 | 91,3% |
| prose | 0,1146 | 0,1040 | 85,4% |
| py | 0,0217 | 0,0214 | 98,1% |
| zh | 0,0457 | 0,0388 | 89,9% |

Otras mediciones reportadas: MMLU-Pro proxy (281 preguntas) del 72,2% en cuantizado frente al 74,0% del nativo (McNemar p = 0,36); en ventanas de 8.192 tokens, code KLD 0,0698 / top-1 90,7% (PPL 3,712 vs 3,683) y prose KLD 0,0818 / top-1 88,0% (PPL 4,545 vs 4,485).

Rendimiento en la máquina de referencia (RTX 5090 de 96 GB, Intel Core Ultra, PCIe Gen 5 x16, DDR5-7000, servido por ignis, una sola lane, geomean sobre 8 prompts, pase de benchmark del 22-10-2026):

| Artefacto | Decodificación | Prefill @14k |
|---|---:|---:|
| a25 | 117,4 tok/s | 2.782 tok/s |
| **a35 (este repo)** | **95,6 tok/s** | **1.798 tok/s** |
| a40 | 88,9 tok/s | 1.581 tok/s |

## Requisitos de hardware

- VRAM: GPU de 32 GB (RTX 5090) como mínimo, ya que el modelo se sirve combinando VRAM y RAM del sistema; el artefacto recomendado para 96 GB es precisamente este.
- RAM de sistema: ~60 GB requeridos para esta imagen (frente a ~46-48 GB de la a25 y ~69 GB de la a40); en un equipo de 96 GB deja más de 30 GB libres.
- Almacenamiento: 86,9 GB en disco solo para los pesos.
- GPU compatibles: RTX 5090 (32 GB, arquitectura Blackwell) y RTX PRO 6000 Blackwell (96 GB). El autor menciona que también se ejecuta en esta última.
- GPU de consumo: sí, cabe en una RTX 5090, pero no de forma autónoma: necesita el apoyo de RAM del host. No hay datos sobre otras GPU de consumo (4090, 3090, etc.).
- Despliegue: exclusivamente mediante ignis, que lee los contenedores `.ninfer` v2. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers; NInfer no soporta Flash-Next en la fecha de publicación.
- Throughput medido: 95,6 tok/s de decodificación (geomean, single lane) y 1.798 tok/s de prefill a 14k tokens en la referencia de 96 GB.

## Comparativa con modelos similares

Comparación con los otros peldaños de la misma escala trellis y con el release nativo:

| Modelo | Parámetros | Contexto | KLD medio | Top-1 | Disco | RAM host | Licencia | Disponibilidad |
|---|---|---|---:|---:|---:|---|---|---|
| **a35 (este repo)** | 125B / 6B activos | No disponible | 0,0748 | 91,62% | 86,9 GB | ~60 GB | Qwen Community 1.0 | Público en HF |
| a25 (trellis 2,5 bpw) | 125B / 6B activos | No disponible | 0,1053 | 89,68% | 71,8 GB | ~46-48 GB | Qwen Community 1.0 | Público en HF |
| a40 (trellis 4,04 bpw) | 125B / 6B activos | No disponible | 0,0655 | 92,17% | 94,8 GB | ~69 GB | Qwen Community 1.0 | Referenciado en la model card |
| Qwen3.8-Flash-Next nativo | 125B / 6B activos | No disponible | 0 (ref.) | 100% (ref.) | 127 GB | No disponible | Qwen Community 1.0 | Público en HF |

Frente a la escala GGUF de Unsloth, el autor sitúa el punto de equivalencia en UD-Q4_K_XL (111,3 GB, KLD 0,0469, top-1 92,26%), aproximadamente un 28% más de disco para un top-1 casi idéntico; UD-Q3_K_XL (90 GB) queda por debajo en ambas métricas. No se dispone de comparación con otros modelos de 125B de la competencia en la información proporcionada.

## Limitaciones y advertencias

- **Formato cerrado y dependencia de un único motor**: los ficheros solo los lee ignis. No hay ruta de conversión a GGUF, safetensors o EXL3 documentada, lo que crea dependencia de una herramienta concreta y de su mantenimiento.
- **Licencia restrictiva**: `qwen-community-license-1.0`. Según la ficha del artefacto hermano a25, el nombre del modelo debe mostrarse de forma destacada en productos comerciales de gran tamaño y los negocios de Model-as-a-Service o de asistentes de IA requieren una licencia separada de Qwen. El uso comercial directo, por tanto, no es libre.
- **Degradación desigual por dominio**: la pérdida se concentra en prosa (KLD 0,1146; top-1 85,4%), japonés (86,2%) y MMLU (91,3%), mientras que Python (98,1%) y matemáticas (96,7%) apenas se resienten. No es una cuantización uniforme.
- **Ventanas largas**: a 8.192 tokens el KLD sube en code (0,0698) y prosa (0,0818); no hay datos publicados sobre el comportamiento más allá de ese tamaño, ni sobre la longitud de contexto máxima del modelo base.
- **Métrica MMLU-Pro ambigua**: 72,2% frente a 74,0% del nativo con p = 0,36. El autor reconoce explícitamente que, aunque no sea estadísticamente peor, la tabla por dominios sugiere una diferencia real; conviene no tomar la no significación como equivalencia.
- **Comparaciones entre pilas no exactas**: los KLD de ignis y de Unsloth se calculan sobre corpus y motores distintos, con un margen asumido de ±0,02-0,05 nats. Las cifras no son directamente intercambiables.
- **Riesgo de alucinación**: no se documenta ninguna evaluación de veracidad ni de tasas de alucinación para este artefacto; es esperable el comportamiento del modelo base más el ruido introducido por la cuantización a 3,5 bpw.
- **Idiomas no declarados**: HuggingFace no lista idiomas para este repositorio; la única evidencia es el corpus de evaluación, insuficiente para afirmar cobertura oficial.
- **Madurez**: repositorio creado y actualizado el 23-10-2026 con 0 descargas y 0 likes; sin validación independiente de las cifras publicadas, que proceden del propio conversor del autor.
- **Multimodalidad no verificada**: aunque el modelo base es multimodal, esta conversión se publica como `text-generation` y no se documenta el tratamiento de entradas de imagen.

## Enlaces

- Repositorio del artefacto: https://huggingface.co/that80-20/Qwen3.8-Flash-Next-trellis-a35-ignis
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Hermano a25 (trellis 2,5 bpw): https://huggingface.co/gpillon/Qwen3.8-Flash-Next-trellis-a25-ignis
- Hermano a40 (trellis 4,04 bpw): referenciado en la model card como `…-trellis-a40-ignis`; el identificador completo no está disponible en la información proporcionada
- README del hermano a25: https://huggingface.co/gpillon/Qwen3.8-Flash-Next-trellis-a25-ignis/blob/main/README.md
- Artículo de contexto sobre el modelo: https://www.orcarouter.ai/blog/qwen-3-8-flash-next
- Ficha de terceros del hermano a25: https://free2aitools.com/model/gpillon/qwen3.8-flash-next-trellis-a25-ignis
