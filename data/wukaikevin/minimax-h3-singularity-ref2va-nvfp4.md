# wukaikevin/MiniMax-H3-Singularity-Ref2VA-NVFP4

## Resumen

MiniMax-H3-Singularity-Ref2VA-NVFP4 es un artefacto de pesos cuantizados publicado por el usuario wukaikevin. No se trata de un modelo entrenado desde cero, sino de una conversion de formato: toma la version Ref2VA Pruned v1.3 en int8 del modelo `WarmBloodAban/Minimax-h3_Singularity` y la reempaqueta en NVFP4 (E2M1), el formato de 4 bits con escalas de bloque introducido por NVIDIA para sus aceleradores Blackwell. El modelo base ultimo es `MiniMaxAI/MiniMax-H3`, un sistema de generacion de video (la nomenclatura Ref2VA apunta a generacion de video y audio condicionada por referencias).

El problema que resuelve este repositorio es puramente de despliegue: reducir el coste de memoria y aprovechar las unidades de computo NVFP4 nativas de las GPU Blackwell mediante las rutas `torch._scaled_mm` y cuBLAS NVFP4 GEMM. El repo ocupa 12,5 GB e incluye tanto los tensores cuantizados (uint8 empaquetado en nibbles hi_lo) como las capas no cuantizadas copiadas directamente en bf16 (adaln, norm, refiner y capas superiores), con la tabla `adaln_t_table` en f32.

Su relevancia ahora es doble: por un lado, ejemplifica el flujo de conversion int8 a NVFP4 con verificacion numerica publicada (coseno en fp64 de 0.9955 frente a la referencia int8 desquantizada y validacion end-to-end de generacion de video); por otro, documenta un detalle poco habitual, la reversion de la rotacion Hadamard convrot que el modelo int8 de origen aplicaba sobre las bases de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de generacion de video MiniMax-H3; la model card no detalla el tipo de red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 E2M1 con escalas de bloque cada 16 elementos en fp8e4m3 y escala tensorial f32; capas no cuantizadas en bf16; `adaln_t_table` en f32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | NVFP4 empaquetado en nibbles hi_lo, tensores uint8 `[out, in/2]`; escalas en layout bloqueado cuBLAS 128x4; contenedor de fichero no especificado |
| Tamano del repositorio | 12,5 GB |
| Libreria declarada | minimax-h3 |
| Fecha de publicacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Este repositorio no contiene ningun proceso de entrenamiento ni ajuste fino. Es un artefacto de conversion de pesos derivado de `WarmBloodAban/Minimax-h3_Singularity` Ref2VA Pruned v1.3 en int8, que a su vez es un ajuste sobre el modelo base `MiniMaxAI/MiniMax-H3`. La model card no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo original.

La innovacion tecnica documentada esta en el formato de los pesos. Los tensores cuantizados se almacenan en NVFP4 E2M1 con empaquetado de nibbles hi_lo, con escalas de grupo por cada 16 elementos en fp8e4m3 dispuestas en layout bloqueado de tile 128x4 al estilo cuBLAS, y una escala tensorial adicional en f32 (`weight_scale_2`). Las capas sensibles (adaln, norm, refiner y niveles superiores) se copian sin cuantizar en bf16. Un detalle relevante es que durante la conversion se deshizo la rotacion Hadamard convrot presente en la fuente int8: el modelo de origen trabajaba en base rotada y este repo entrega los pesos en base original. La verificacion publicada incluye una similitud coseno en fp64 de 0.9955 frente a la referencia int8 desquantizada y una validacion end-to-end de generacion de video.

## Capacidades

- Generacion de video condicionada por referencias (pipeline Ref2VA del modelo base), segun la validacion end-to-end declarada por el autor.
- Generacion conjunta de video y audio, si se interpreta Ref2VA como referencia a video mas audio; la model card no lo explicita.
- Inferencia en precision NVFP4 con rutas nativas de cuBLAS y `torch._scaled_mm`.
- Decodificacion de escalas bloqueadas a layout lineal mediante `comfy_kitchen.float_utils.from_blocked`.
- Integracion con flujos de ComfyUI, dado que la utilidad citada pertenece al ecosistema comfy_kitchen.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento explicito: no disponible.

## Casos de uso

- Generacion de video con personajes consistentes: a partir de imagenes de referencia, el pipeline Ref2VA del modelo base permite mantener la identidad visual de un sujeto a lo largo de un clip, y la version NVFP4 reduce el coste de memoria para iterar sobre varias tomas.
- Produccion publicitaria con referencias de producto: se introducen imagenes del producto como referencia y se generan planos de video coherentes con ese objeto, aprovechando la cuantizacion de 4 bits para servirlo en GPU Blackwell de una sola tarjeta.
- Previsualizacion en pipelines de VFX: uso como generador de previsiones rapidas antes del render final, con la ventaja de que los pesos NVFP4 caben en 12,5 GB de repositorio y pueden cargarse en memoria de GPU de gama alta.
- Doblaje y sincronizacion de audio: si el modelo base cubre la componente de audio de Ref2VA, el artefacto permite generar clips con pista sonora asociada sin cambiar de modelo.
- Investigacion en cuantizacion NVFP4: el repositorio sirve como caso de estudio reproducible de conversion int8 a NVFP4 con reversion de rotacion Hadamard, escalas bloqueadas 128x4 y metrica de fidelidad publicada.
- Integracion en ComfyUI: mediante `comfy_kitchen.float_utils.from_blocked` para convertir las escalas a layout lineal y alimentar los nodos de generacion de video con pesos cuantizados.
- Servicio de inferencia de bajo coste energetico: en hardware Blackwell, delegar el GEMM a las unidades NVFP4 nativas reduce el coste por clip frente a ejecutar el modelo en bf16 o int8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de calidad reportada por el autor es la verificacion de la conversion:

| Metrica | Valor |
|---|---|
| Similitud coseno en fp64 frente a la referencia int8 desquantizada | 0,9955 |
| Validacion end-to-end de generacion de video | superada, sin metricas cuantitativas |
| MMLU, HumanEval, GSM8K u otros benchmarks estandar | no aplicables o no disponibles |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 12,5 GB, por lo que los pesos requieren al menos ese orden de magnitud en memoria, mas el espacio de activaciones y del decodificador de video, que no se cuantifica y permanece en bf16.
- GPU recomendadas: se requiere hardware con soporte nativo de NVFP4 para aprovechar el formato, es decir, la familia Blackwell de NVIDIA (B200, GB200 y las GeForce RTX de la serie 50). No se ha confirmado el comportamiento en generaciones anteriores.
- Cabe en GPU de consumo: no disponible. Depende del soporte NVFP4 de la GPU concreta y del pico de memoria durante el muestreo de video, que la model card no documenta.
- Opciones de despliegue: `torch._scaled_mm` con pesos en layout bloqueado, GEMM NVFP4 de cuBLAS directamente, y decodificacion previa a layout lineal mediante `comfy_kitchen.float_utils.from_blocked`. No se confirma soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Cuantizacion | Tamano de repo | Licencia | Base | Disponibilidad |
|---|---|---|---|---|---|
| wukaikevin/MiniMax-H3-Singularity-Ref2VA-NVFP4 | NVFP4 E2M1, bloques de 16, escalas fp8e4m3 | 12,5 GB | apache-2.0 | WarmBloodAban/Minimax-h3_Singularity Ref2VA Pruned v1.3 (int8) | Publico en HuggingFace, 0 descargas |
| WarmBloodAban/Minimax-h3_Singularity (Ref2VA Pruned v1.3) | int8 con rotacion Hadamard convrot | no disponible | no disponible | MiniMaxAI/MiniMax-H3 | Referenciado como origen |
| MiniMaxAI/MiniMax-H3 | no disponible (presumiblemente bf16) | no disponible | no disponible | Modelo original | Referenciado como base |

No se dispone de datos de parametros, contexto ni rendimiento de las alternativas, por lo que la comparacion se limita al formato de pesos y la cadena de derivacion.

## Limitaciones y advertencias

- Artefacto derivado, no modelo original: cualquier problema de calidad, sesgo o licencia del ajuste Ref2VA pertenece a los autores de `WarmBloodAban/Minimax-h3_Singularity`, como el propio autor declara.
- Licencia apache-2.0 declarada en este repositorio, pero la licencia del modelo base y del ajuste intermedio no se especifica en la informacion disponible; conviene verificarla antes de un uso comercial.
- Dependencia de hardware Blackwell: sin GPU con soporte NVFP4 nativo, el formato no aporta ventaja y obliga a desquantizar, con la perdida de rendimiento correspondiente.
- Requiere decodificar el layout bloqueado 128x4 de las escalas si se quiere un layout lineal; alimentar el tensor sin decodificar a una ruta que no sea cuBLAS NVFP4 produce resultados incorrectos.
- Perdida de fidelidad frente al modelo en alta precision: la similitud coseno publicada (0,9955) es frente a la referencia int8, no frente al modelo original en bf16, por lo que la degradacion acumulada respecto al modelo base no esta cuantificada.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; en modelos de generacion de video se traduciria en artefactos visuales, inconsistencias temporales o sesgos en la representacion de personas.
- Idiomas soportados no declarados: se desconoce el comportamiento de los prompts de texto en castellano.
- Sin senales de adopcion: 0 descargas y 0 likes, sin issues ni validacion por terceros.
- Fechas de publicacion y actualizacion muy proximas entre si (2026-09-15), lo que sugiere un artefacto recien subido y sin mantenimiento posterior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wukaikevin/MiniMax-H3-Singularity-Ref2VA-NVFP4
- Modelo de origen (ajuste int8): https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada.
