# Soulfate24/Ornith-1.5-9B-DFlash-Paretrix

## Resumen

Ornith-1.5-9B-DFlash-Paretrix es un repositorio de cuantizaciones GGUF publicadas por el usuario Soulfate24 sobre el modelo base ornith-ai/Ornith-1.5-9B, junto con el modulo draft DFlash (ornith-ai/Ornith-1.5-9B-DFlash) pensado para decodificacion especulativa. No es un modelo entrenado desde cero, sino una distribucion de pesos comprimidos: el repo aplica la suite Paretrix, un esquema de cuantizacion hibrida con asignacion de bits por clase de tensor basada en sensibilidades de activacion medidas con llama-imatrix.

El modelo subyacente tiene 8.953.803.264 parametros (unos 8,95 mil millones), licencia MIT y pipeline text-generation. El repo ocupa 49,0 GB e incluye las etiquetas vision, conversational, gguf, llama.cpp, imatrix, pareto, speculative-decoding y draft. En el momento de la consulta acumula 0 descargas y 0 likes, y las fechas de creacion y actualizacion son el 8 de octubre de 2026.

Su interes practico esta en el catalogo de niveles de compresion: ocho tiers Paretrix (de Fidelity-48pc a Femto-21pc) que buscan un equilibrio medido entre tamano en disco y divergencia respecto a la distribucion original (KLD, RMS Δp, top-p), en lugar de recetas uniformes. Esto permite desplegar un modelo de ~9B en GPUs de consumo con perdidas cuantificadas, algo relevante para inferencia local y para pipelines con restricciones de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se describe en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (segun safetensors del repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; tiers Paretrix: Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc; y quants uniformes de referencia: Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | no disponible |
| Licencia | MIT (license_link apunta a la licencia del modelo base ornith-ai/Ornith-1.5-9B) |
| Formato de pesos | GGUF para llama.cpp; el repo declara library_name: transformers y expone un recuento de parametros en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Ornith-1.5-9B (si es transformer denso, MoE, hibrido o SSM), ni sobre el volumen o la composicion de sus datos de entrenamiento, ni sobre si se aplicaron etapas de RLHF, DPO u otras tecnicas de alineamiento. La model card del repositorio no cubre esos extremos; solo describe el proceso de cuantizacion.

Lo que si se documenta es el metodo de compresion. Paretrix se presenta como una suite empirica y sensible a activaciones para modelos GGUF y modulos de decodificacion especulativa. Mide la sensibilidad real de cada clase de tensor a traves de llama-imatrix (ΔKLD por MiB), aprende tablas de tasa a partir de campanas entre arquitecturas (denominadas THE MATRIX) y reparte el presupuesto de bits bajo objetivos exactos: recetas planas cuando la uniformidad es lo mejor y mochila calibrada por tasa cuando la heterogeneidad compensa. La innovacion declarada es que, en lugar de aplicar una misma familia de bits a toda la red, se lee el campo de activaciones del propio modelo para gastar el presupuesto donde la medicion indica mayor retorno.

El repositorio incorpora ademas el modulo DFlash como draft para decodificacion especulativa, lo que en teoria acelera la generacion al proponer tokens que el modelo principal verifica en paralelo. No se aportan mediciones de la aceleracion obtenida.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta conversational y el pipeline text-generation.
- Inferencia local en llama.cpp y runtimes compatibles con GGUF.
- Cuantizacion selectiva por clase de tensor, con metricas publicadas de KLD, RMS Δp y top-p por tier.
- Decodificacion especulativa mediante el draft DFlash incluido como modelo base secundario.
- Etiqueta vision presente en el repositorio, aunque no se detalla en la informacion disponible que tipo de entrada visual admite ni con que modulo.
- No se documenta soporte de tool calling, function calling, uso agentico ni multi-step reasoning.
- No se documentan capacidades multilingues ni lista de idiomas.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Inferencia local en GPU de consumo: los tiers de menor tamano (Pico-24pc con 4.070 MiB, Femto-21pc con 3.601 MiB) permiten ejecutar un modelo de ~9B en GPUs con 6-8 GB de VRAM, manteniendo una divergencia medida de KLD 0,1540 y 0,2524 respectivamente.
- Asistentes conversacionales offline: al ser un GGUF ejecutable con llama.cpp u Ollama, encaja en aplicaciones de escritorio o embebidas sin conectividad, donde la licencia MIT facilita la redistribucion.
- Servicio de generacion de texto con VRAM limitada: los tiers intermedios (Mini-30pc con 5.368 MiB, Compact-33pc con 5.787 MiB) ofrecen el mejor equilibrio declarado en la tabla, con KLD de 0,0679 y 0,0610 frente a quants uniformes de tamano comparable.
- Aceleracion de inferencia mediante decodificacion especulativa: el repositorio incluye el draft DFlash especificamente para este fin; se usaria emparejando el draft con el quant principal en llama.cpp para reducir el coste por token en cargas de generacion larga.
- Despliegue en entornos con presupuesto de disco estricto: el tier Quality-36pc ocupa 6.234 MiB frente a los 9.086 MiB de Q8_0, con una perdida declarada de calidad cuantificada en la propia tabla.
- Investigacion en compresion de modelos: la tabla de tiers, con PPL, ΔPPL, KLD, RMS Δp y top-p por nivel, sirve como material de referencia para estudiar el compromiso entre tasa de bits y fidelidad distribucional.
- Sustitucion de recetas uniformes en pipelines existentes: al mantener el formato GGUF, un tier Paretrix puede reemplazar a un Q5_K_M-imx o IQ4_XS-imx sin cambiar el runtime de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo aporta metricas internas del proceso de cuantizacion: perplejidad (PPL), delta de perplejidad (ΔPPL), divergencia KL (KLD), RMS Δp y top-p, comparando cada tier Paretrix con quants uniformes de referencia.

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p | Pareto |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| Q8_0 (stock) | 9086 | 8,9544 | +0,0325 | 0,0118 | 2,67% | 97,7% | ★ |
| Fidelity-48pc | 8232 | 8,9700 | +0,0481 | 0,0167 | 3,13% | 97,0% | ≈ Precision-42pc (−0,0011 · −854 MiB) |
| Precision-42pc | 7378 | 8,9365 | +0,0146 | 0,0156 | 3,24% | 96,6% | ★ |
| Q6_K-imx (stock) | 7018 | 8,7000† | −0,2219 | 0,0251 | 3,83% | 95,9% | ★ |
| Quality-36pc | 6234 | 8,5716† | −0,3503 | 0,0449 | 4,88% | 93,5% | ★ |
| Q5_K_M-imx (stock) | 6168 | 8,2043† | −0,7176 | 0,1013 | 7,29% | 90,2% | < Compact-33pc |
| Compact-33pc | 5787 | 8,4619† | −0,4600 | 0,0610 | 6,07% | 92,0% | ★ |
| Mini-30pc | 5368 | 8,6772† | −0,2447 | 0,0679 | 6,42% | 91,1% | ★ |
| IQ4_XS-imx (stock) | 4956 | 9,2939 | +0,3720 | 0,0794 | 7,08% | 90,8% | ★ |
| Nano-27pc | 4586 | 8,6546† | −0,2673 | 0,1223 | 8,73% | 86,5% | ★ |
| IQ3_M-imx (stock) | 4211 | 9,1809 | +0,2590 | 0,1807 | 11,04% | 84,5% | < Pico-24pc |
| Pico-24pc | 4070 | 8,5303† | −0,3916 | 0,1540 | 10,08% | 84,7% | ★ |
| Femto-21pc | 3601 | 8,3140† | −0,6079 | 0,2524 | 12,37% | 80,6% | ★ |

El significado del simbolo † empleado en varias filas no se define en la informacion proporcionada; el autor lo usa en las entradas de PPL de los tiers Paretrix y de algunos quants uniformes.

## Requisitos de hardware

- VRAM estimada (solo pesos, a partir del tamano en MiB declarado): Femto-21pc ~3,5 GB; Pico-24pc ~4,0 GB; Nano-27pc ~4,5 GB; IQ4_XS-imx ~4,8 GB; Mini-30pc ~5,2 GB; Compact-33pc ~5,7 GB; Quality-36pc ~6,1 GB; Q6_K-imx ~6,9 GB; Precision-42pc ~7,2 GB; Fidelity-48pc ~8,0 GB; Q8_0 ~8,9 GB.
- A esas cifras hay que anadir el cache KV, cuyo tamano depende de la longitud de contexto y de la configuracion de atencion; la longitud de contexto no se especifica en la informacion disponible, por lo que no puede darse una cifra de VRAM total fiable.
- GPU consumer: los tiers de 3,5 a 6,2 GB caben en tarjetas de 8 GB (RTX 3060 Ti, 4060, 2070) y con holgura en 12 GB (RTX 3060 12 GB, 4070); los tiers de 7,2 a 8,9 GB requieren 12-16 GB para dejar margen al cache KV (RTX 4080, 4060 Ti 16 GB, 4070 Ti Super).
- GPU profesional: A100 40/80 GB, H100 y L40S permiten servir varias instancias o contextos largos con los tiers de mayor fidelidad; para Q8_0 con contexto amplio es recomendable 16 GB o mas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio y koboldcpp por el formato GGUF; vLLM admite GGUF de forma experimental; transformers figura como libreria declarada, aunque no carga GGUF de forma nativa.
- Para decodificacion especulativa hay que desplegar conjuntamente el draft DFlash y el quant principal en llama.cpp.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de factor de aceleracion del draft.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos externos comparables en los datos proporcionados. La unica comparacion posible es interna, entre los tiers Paretrix y los quants uniformes de referencia del propio autor:

| Tier | MiB | KLD | Comparacion declarada |
| :--- | ---: | ---: | :--- |
| Quality-36pc | 6234 | 0,0449 | Pareto sobre Q6_K-imx (7018 MiB, KLD 0,0251) en tamano |
| Compact-33pc | 5787 | 0,0610 | Supera a Q5_K_M-imx (6168 MiB, KLD 0,1013) con 381 MiB menos |
| Mini-30pc | 5368 | 0,0679 | Se situa en la frontera Pareto por debajo de Compact-33pc |
| Pico-24pc | 4070 | 0,1540 | Supera a IQ3_M-imx (4211 MiB, KLD 0,1807) con 141 MiB menos |
| Femto-21pc | 3601 | 0,2524 | Tier mas comprimido del catalogo |

## Limitaciones y advertencias

- Es una cuantizacion de terceros, no una publicacion oficial de ornith-ai; el repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- Toda cuantizacion introduce degradacion. Los tiers bajos muestran KLD creciente (0,1540 en Pico-24pc y 0,2524 en Femto-21pc) y top-p decreciente (84,7% y 80,6%), lo que indica desviacion apreciable respecto a la distribucion del modelo original.
- El simbolo † de la tabla no esta definido en la informacion disponible, lo que impide interpretar con rigor las comparaciones de PPL entre tiers marcados y no marcados.
- No se especifican los idiomas soportados, de modo que no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- La etiqueta vision aparece en los tags, pero no se documenta que modulo visual acompana al modelo ni como se activa; no debe asumirse soporte multimodal sin verificacion.
- No hay informacion sobre sesgos del modelo base, datos de entrenamiento ni procesos de alineamiento, por lo que no pueden evaluarse sesgos ni riesgos especificos.
- Riesgo de alucinacion: inherente a los modelos generativos; no se aportan tasas de factualidad ni evaluaciones de veracidad.
- Licencia MIT, que en principio permite uso comercial, modificacion y redistribucion; conviene revisar la licencia del modelo base enlazada en la model card por si impone condiciones adicionales.
- El rendimiento real depende del runtime, del contexto efectivo y del hardware; los tamaños en MiB solo cubren los pesos, no el cache KV ni el overhead de inferencia.
- No se publican mediciones de latencia, throughput ni de la aceleracion esperada con el draft DFlash, asi que su beneficio practico no esta cuantificado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Soulfate24/Ornith-1.5-9B-DFlash-Paretrix
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Draft DFlash: https://huggingface.co/ornith-ai/Ornith-1.5-9B-DFlash
- Suite de cuantizacion Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- llama-imatrix (herramienta de calibracion citada): no disponible como enlace en la informacion proporcionada
- Paper o blog tecnico de Paretrix: no disponible en la informacion proporcionada
