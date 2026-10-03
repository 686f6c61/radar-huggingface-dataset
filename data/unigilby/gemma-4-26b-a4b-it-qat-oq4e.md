# unigilby/gemma-4-26B-A4B-it-qat-oQ4e

## Resumen

Gemma 4 26B-A4B-it-qat-oQ4e es una version cuantizada del modelo `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, publicada por el usuario `unigilby`. Se trata de un modelo de lenguaje instruido (sufijo `-it`) de arquitectura de mezcla de expertos (MoE), con 25.805.936.206 parametros totales y un diseno A4B que, segun la nomenclatura del modelo base, activa del orden de 4.000 millones de parametros por token.

No es una cuantizacion convencional: ha sido generada con la herramienta oMLX en modo oQe (con matriz de importancia) y reordenada para que los kernels de decodificacion de Gemma 4 de TensorFold puedan leer y apilar cada proyeccion en Apple Silicon. El resultado ocupa unos 15 GB y combina 4 bits base en grupos de 64 con anchuras superiores (5, 6 y 8 bits) en un subconjunto de 55 tensores sensibles.

Su relevancia radica en que apunta a inferencia local eficiente en Macs con memoria unificada, con soporte de decodificacion especulativa. Sobre un M5 Ultra y con TensorFold se midieron 177 tok/s en flujo unico sin draft y entre 187 y 193 tok/s con el modelo draft `z-lab/gemma-4-26B-A4B-it-DFlash`. La licencia es Apache-2.0, igual que la del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con mezcla de expertos (MoE) |
| Parametros totales | 25.805.936.206 (unos 25,8 B) |
| Parametros activos | no disponible con precision; la denominacion A4B del modelo base apunta a unos 4.000 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine (oQe): base 4-bit en grupos de 64; 55 tensores elevados, 24 a 5-bit, 24 a 6-bit y 7 a 8-bit (incluida la embedding); expertos enrutados a 4-bit; router a 8-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) con proyecciones q/k/v y gate/up apilables y un router que selecciona expertos enrutados (a 4 bits). El modelo base es una variante QAT (quantization-aware training) de Google, es decir, entrenada teniendo en cuenta la cuantizacion de 4 bits; los detalles del entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se recogen en la informacion disponible y corresponden a la model card del modelo fuente.

El trabajo de `unigilby` es de cuantizacion, no de entrenamiento. Se aplico oMLX `oq` en modo oQe con tres restricciones para encajar con TensorFold: todos los tensores cuantizados en grupos de 64 (modo affine); una unica anchura por pila y capa, de modo que q/k/v_proj y gate/up_proj comparten un mismo par (bits, grupo) y un miembro promovido por el plan de sensibilidad eleva toda la pila a la anchura mas alta (nunca se degrada); y los expertos enrutados se mantienen a 4 bits. Estas diferencias respecto a un empaquetado oQe estandar del mismo origen son las que permiten apilar cada proyeccion. Las anchuras por capa se guardan en `config.json` bajo `quantization`, por lo que mlx-lm y oMLX lo cargan con normalidad.

## Capacidades

- Generacion de texto y uso conversacional: el modelo esta etiquetado como `text-generation` y `conversational`, con variante instruida (`-it`).
- Razonamiento por mezcla de expertos: dispone de expertos enrutados y un router, lo que permite activar solo una fraccion de los parametros por token.
- Compatibilidad con decodificacion especulativa: integrable con el draft `z-lab/gemma-4-26B-A4B-it-DFlash` para acelerar la generacion en Apple Silicon.
- Carga estandar en MLX: funciona en mlx-lm y oMLX como cualquier modelo cuantizado MLX.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Inferencia local en Mac: al ocupar unos 15 GB y usar MLX, puede ejecutarse en ordenadores Apple Silicon con memoria unificada suficiente, manteniendo los datos en el dispositivo sin enviarlos a la nube.
- Asistentes conversacionales privados: para entornos con requisitos de confidencialidad, el modelo y sus pesos quedan en local y no dependen de APIs externas.
- Despliegue con decodificacion especulativa: combinado con `z-lab/gemma-4-26B-A4B-it-DFlash` eleva el rendimiento de 177 a 187-193 tok/s en un M5 Ultra, adecuado para respuestas interactivas de 512 tokens.
- Prototipado y evaluacion de cuantizacion: sirve como banco de pruebas para comparar un empaquetado oQe con restricciones de pila (TensorFold-friendly) frente a un oQe estandar.
- Investigacion en inferencia MoE eficiente: permite medir el impacto del ancho mixto (4/5/6/8 bits) y del router a 8 bits en la calidad y la velocidad.
- Reproduccion de pipelines MLX: al cargarse de forma estandar en mlx-lm y oMLX, encaja en flujos de trabajo existentes basados en MLX sin adaptaciones.
- Generacion de texto en lote sobre hardware de Apple: el modo con `"draft": false` y las respuestas concurrentes se comportan igual que las seriales (segun hash de tokens), lo que facilita servir varias peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Unicamente se recogen metricas de throughput, medidas sobre un M5 Ultra con TensorFold (soporte de anchuras oQ de Gemma 4, pendiente de integracion upstream):

| Escenario | Throughput |
|---|---|
| Flujo unico, sin draft | 177 tok/s |
| Flujo unico, con `z-lab/gemma-4-26B-A4B-it-DFlash` | 187-193 tok/s |

Condiciones: decodificacion greedy, respuestas de 512 tokens.

## Requisitos de hardware

- Almacenamiento y memoria: el repositorio ocupa 15,8 GB y los pesos rondan los 15 GB, por lo que se necesita memoria unificada de al menos 16 GB libres; se recomienda 32 GB o mas para dejar margen al contexto y al runtime.
- GPUs recomendadas: hardware Apple Silicon con soporte MLX (medido en un M5 Ultra). No hay soporte CUDA en los pesos tal como estan empaquetados.
- Compatibilidad con GPU de consumo: si, en Macs con memoria unificada suficiente; no aplica a GPUs NVIDIA/AMD de consumo, ya que el formato es safetensors MLX.
- Opciones de despliegue: mlx-lm y oMLX cargan el modelo con normalidad; TensorFold requiere soporte de Gemma 4 para este layout, propuesto upstream y aun no incluido en una release.
- Latencia y throughput: en M5 Ultra con TensorFold, 177 tok/s sin draft y 187-193 tok/s con draft, en respuestas de 512 tokens.
- Decodificacion especulativa: opcional, mediante `z-lab/gemma-4-26B-A4B-it-DFlash`.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| unigilby/gemma-4-26B-A4B-it-qat-oQ4e | 25,8 B (A4B) | MLX oQe, ancho mixto 4/5/6/8 bits | safetensors (MLX) | Apache-2.0 | Reordenado para TensorFold; ~15 GB |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,8 B (A4B) | sin cuantizar (fuente QAT q4_0) | no disponible | Apache-2.0 | Modelo fuente; mayor tamano |
| Empaquetado oQe estandar (mismo origen) | 25,8 B (A4B) | MLX oQe sin restricciones de pila | safetensors (MLX) | Apache-2.0 | Anchuras distintas por miembro de pila |
| z-lab/gemma-4-26B-A4B-it-DFlash | no disponible | no disponible | no disponible | no disponible | Modelo draft para decodificacion especulativa |

No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- Es una cuantizacion derivada de Gemma 4: la propia model card remite al modelo fuente para el uso previsto y las limitaciones, y no se aportan evaluaciones de calidad propias.
- El ancho mixto (4/5/6/8 bits) busca preservar tensores sensibles, pero cualquier cuantizacion introduce perdida de precision respecto al modelo original.
- TensorFold requiere soporte de Gemma 4 para este layout, propuesto upstream y no disponible en una release, por lo que su uso quedaria limitado a ese runtime mientras no se integre.
- El modelo esta empaquetado en formato MLX; no se ofrecen pesos GGUF ni variantes para CUDA, lo que restringe el despliegue a plataformas Apple Silicon.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto ni sesgos conocidos.
- No hay datos publicos de tool calling, agentes ni capacidades multimodales en la informacion proporcionada.
- El repositorio no tiene descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Licencia Apache-2.0 segun la model card; conviene verificar los terminos del modelo fuente antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unigilby/gemma-4-26B-A4B-it-qat-oQ4e
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- oMLX (herramienta de cuantizacion): https://github.com/jundot/omlx
- TensorFold (runtime con decodificacion especulativa exacta): https://github.com/ashhart/TensorFold
- Modelo draft para especulacion: https://huggingface.co/z-lab/gemma-4-26B-A4B-it-DFlash
