# theblackcat102/Inkling-2-Mini-oQ2.5e-mtp-offload

## Resumen

Inkling-2-Mini-oQ2.5e-mtp-offload es un reempaquetado cuantizado del modelo thinkingmachines/Inkling-2-Mini, un modelo multimodal de mezcla de expertos (MoE) con arquitectura de capas en bucle, publicado por el usuario theblackcat102. El modelo base cuenta con 26.400 millones de parametros totales y 3.400 millones de parametros activos, procesa entradas de texto e imagen con una ventana de contexto de hasta 1.000.000 de tokens y ejecuta sus 12 capas centrales tres veces por cada token generado.

Este checkpoint concreto esta disenado para el runtime oMLX sobre Apple Silicon, con el objetivo de permitir la inferencia en equipos con memoria unificada limitada mediante la tecnica de offload de expertos enrutados desde el SSD. Incluye el codificador de vision, el modelo de lenguaje y un borrador DSpark (multi-token prediction) empaquetado en `mtp.safetensors` para decodificacion especulativa. El reempaquetado reorganiza los pesos de cada experto en tensores independientes para permitir lecturas `preadv` directas a la cache de expertos.

La relevancia de esta ficha radica en que demuestra una via practica para ejecutar un MoE multimodal de 26.400 millones de parametros en un portatil con 16 GB de memoria unificada, a costa de una velocidad de decodificacion modesta (7,9 a 10,0 tokens por segundo segun la fraccion de expertos residentes) y de una degradacion de calidad muy contenida respecto al checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas en bucle (looped), multimodal (texto e imagen) |
| Parametros totales | 29.616.158.208 (segun safetensors); 26.400 millones reportados en la model card para el modelo base |
| Parametros activos | 3.400 millones (modelo base) |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | Affine 2-bit grupo 64, 3-bit grupo 64, 4-bit grupo 64, 8-bit grupo 32 y 64, BF16 y FP32 (media efectiva de 3,081 bits por peso) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; incluye pruebas en ingles, chino y japones) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria MLX) |
| Tamano del repositorio | 10,8 GB (10,058 GiB) |
| Capas en bucle | 12 capas centrales ejecutadas tres veces por token |
| Componentes | Modelo de lenguaje (26,070B logicos), vision (0,318B), borrador DSpark MTP (0,318B) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con una innovacion estructural: las 12 capas centrales se ejecutan tres veces por cada token procesado, lo que incrementa el computo efectivo sin aumentar el numero de parametros. La naturaleza MoE implica que solo una fraccion de los expertos enrutados se activa por token (3.400 millones de parametros activos de 26.400 millones totales), lo que reduce el coste computacional por token. El modelo es multimodal: incorpora un codificador de vision que procesa imagenes junto con el texto.

Este checkpoint no aporta informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al modelo base thinkingmachines/Inkling-2-Mini y no se detallan en la informacion disponible. La innovacion tecnica de esta publicacion es el reempaquetado para offload: los pesos de cada experto enrutado (`w13` y `w2`, con sus escalas y sesgos) se almacenan como tensores separados y contiguos bajo el patron `model.layers.<i>.mlp.experts.<e>.{w13,w2}.{weight,scales,biases}`, de modo que oMLX puede leer un experto ausente con una unica llamada `preadv` directamente en su ranura de cache. Ademas, se recuantizan el embedding de tokens y la cabeza de vocabulario a 4 bits (desde 8 bits affine grupo 64 del original) y el codificador de vision a 8 bits affine grupo 32 (desde BF16), manteniendo el patch embedding en BF16. El borrador DSpark permite decodificacion especulativa mediante MTP.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de texto e imagen (pipeline `image-text-to-text`).
- Procesamiento de contexto muy largo: ventana de hasta 1.000.000 de tokens.
- Razonamiento multi-paso: las capas en bucle incrementan la profundidad efectiva del calculo por token.
- Decodificacion especulativa mediante el borrador DSpark incluido en `mtp.safetensors`.
- Capacidades multilingues: la model card incluye pruebas de perplejidad en ingles, chino y japones, aunque no se declara una lista formal de idiomas.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon con memoria limitada: el offload de expertos permite ejecutar un MoE de 26.400 millones de parametros en un MacBook Air M4 de 16 GB, con 4,6 GiB de memoria pico y 7,9 tokens por segundo al 25% de expertos residentes. Adecuado para prototipado y pruebas de concepto en portatiles.
- Analisis de documentos extensos con imagenes: la ventana de 1.000.000 de tokens y el codificador de vision permiten procesar informes, articulos o expedientes completos que combinen texto e imagenes en una sola pasada.
- Experimentacion con decodificacion especulativa: el borrador DSpark empaquetado permite evaluar el impacto de MTP en latencia y throughput sin necesidad de entrenar un borrador propio.
- Investigacion sobre cuantizacion extrema: la mezcla de precisiones (2, 3, 4 y 8 bits) con una media efectiva de 3,081 bits por peso sirve como caso de estudio para medir la degradacion de calidad frente al checkpoint original (perplejidad 2,3759 frente a 2,3719 en prosa inglesa).
- Desarrollo y validacion de runtimes MLX: el layout por experto y el formato de offload son utiles para quienes trabajan en oMLX o en herramientas similares de gestion de memoria en Apple Silicon.
- Evaluacion de modelos multimodales MoE en entornos sin GPU dedicada: permite comparar el comportamiento de un MoE de gran tamano frente a modelos densos mas pequenos en hardware de consumo.
- Procesamiento de corpus multilingues: las pruebas en chino y japones indican utilidad para tareas de analisis de texto en esos idiomas, aunque la cobertura real no este declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona metricas de calidad y velocidad especificas del reempaquetado:

| Metrica | Checkpoint original | Este checkpoint |
|---|---|---|
| Perplejidad, prosa inglesa (1.024 tokens) | 2,3719 | 2,3759 |
| Perplejidad, codigo Python | 4,5549 | 4,5607 |
| Perplejidad, chino | 2,2648 | 2,2709 |
| Perplejidad, japones | 2,0161 | 2,0198 |
| Divergencia KL media (48 tokens, prompt de 1.426 tokens) | referencia | 0,003 |
| Coincidencia top-1 (48 pasos) | referencia | 47 de 48 |
| Diferencia de caracteristicas de vision frente a FP32 | 4,4% (BF16) | 5,0% (8-bit) |

| Configuracion (M4 MacBook Air 16 GB, SSD interno) | Expertos residentes | Decodificacion | Memoria pico |
|---|---|---|---|
| Checkpoint original, oMLX previo al layout por experto | 25% | 4,36 tok/s | 5,30 GiB |
| Este checkpoint | 25% | 7,9 tok/s | 4,6 GiB |
| Este checkpoint | 50% | 10,0 tok/s | 6,6 GiB |

Las mediciones corresponden a la mediana de ejecuciones alternas con enfriamiento previo; el autor advierte que en otras sesiones la misma configuracion puede resultar hasta 1,7 veces mas lenta.

## Requisitos de hardware

- Memoria: el checkpoint completo ocupa 10,058 GiB en disco. Con offload al 25% de expertos residentes, el pico de memoria es de 4,6 GiB; al 50%, de 6,6 GiB.
- Hardware objetivo: Apple Silicon con MLX. Las pruebas se realizaron en un MacBook Air M4 de 16 GB con SSD interno.
- GPU dedicadas (A100, H100, RTX 4090): no disponibles para este checkpoint, que depende de MLX y de oMLX.
- Cabida en GPU de consumo: no aplica directamente; el modelo esta pensado para memoria unificada de Apple Silicon. Se requiere una version de oMLX que soporte el layout Inkling 2 por experto; las versiones anteriores no pueden cargarlo.
- Despliegue: exclusivamente mediante oMLX (runtime basado en MLX). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 7,9 tok/s con 25% de expertos residentes y 10,0 tok/s con 50%, sin MTP, sobre un prompt de 1.426 tokens y 48 tokens de decodificacion greedy.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-oQ2.5e-mtp-offload (este) | 26,4B / 3,4B | 1.000.000 | Apache 2.0 | safetensors MLX | Offload de expertos, orientado a Apple Silicon |
| thinkingmachines/Inkling-2-Mini | 26,4B / 3,4B | 1.000.000 | Apache 2.0 | no disponible | Modelo base sin cuantizar |
| mlx-community/Inkling-2-Mini-oQ2.5e-mtp | 26,4B / 3,4B | 1.000.000 | Apache 2.0 | safetensors MLX | Checkpoint fuente del reempaquetado, sin layout por experto |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de oMLX: requiere una compilacion que soporte el layout Inkling 2 por experto; las versiones antiguas no cargan el checkpoint. El autor indica que la release o PR esta pendiente (TODO).
- Rendimiento variable: la misma configuracion puede medirse hasta 1,7 veces mas lenta en otras sesiones en el mismo equipo sin ventilador.
- Degradacion de calidad por cuantizacion: la perplejidad aumenta ligeramente en todos los textos medidos y el codificador de vision presenta un 5,0% de desviacion frente a FP32, frente al 4,4% del BF16 original.
- Idiomas no declarados formalmente: solo hay evidencia empirica en ingles, chino y japones; el rendimiento en castellano u otros idiomas no esta documentado.
- Sin datos de sesgos, alucinacion ni evaluaciones de seguridad en la informacion disponible.
- Tool calling y comportamiento agentico no documentados; no se recomienda asumirlos en produccion sin validacion previa.
- Uso comercial permitido por la licencia Apache 2.0, pero el rendimiento en produccion esta limitado por el throughput (7,9 a 10,0 tok/s) y por la dependencia de hardware Apple Silicon.
- El offload desde SSD introduce latencia dependiente del almacenamiento; un SSD lento degradara la decodificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theblackcat102/Inkling-2-Mini-oQ2.5e-mtp-offload
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint fuente del reempaquetado: https://huggingface.co/mlx-community/Inkling-2-Mini-oQ2.5e-mtp
- Runtime oMLX: https://github.com/jundot/omlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
