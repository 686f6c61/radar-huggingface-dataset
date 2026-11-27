# Xylolabs/gemma-4-12B-GGUF

## Resumen

Xylolabs/gemma-4-12B-GGUF es una coleccion de cuantizaciones GGUF del modelo google/gemma-4-12B, preparada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El paquete incluye ocho archivos que abarcan desde Q8_0 (12,67 GB) hasta Q2_K (4,83 GB), lo que permite desplegar un modelo de aproximadamente 11.900 millones de parametros en hardware muy diverso, desde estaciones de trabajo con GPU dedicada hasta equipos de consumo con VRAM limitada.

La particularidad principal de esta distribucion es que elimina las torres de vision y audio presentes en el modelo base, de modo que el resultado es un modelo puramente de generacion de texto. Esto reduce el tamano y simplifica el despliegue en entornos donde solo se necesita inferencia textual. El autor publica ademas una tabla de fidelidad (divergencia KL y acuerdo top-1 frente a BF16 sobre WikiText-2 y texto reservado) que permite elegir el nivel de cuantizacion con criterio empirico en lugar de a ciegas.

El modelo base pertenece a la familia Gemma 4 de Google y se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion comercial. Los idiomas declarados son ingles y coreano. El repositorio se publico el 27 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base google/gemma-4-12B; esta distribucion es una cuantizacion GGUF) |
| Parametros totales | 11.907.350.576 (11,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de uso emplea `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Tabla de archivos publicada por el autor:

| Archivo | Tamano |
|---|---:|
| gemma-4-12B-Q8_0.gguf | 12,67 GB |
| gemma-4-12B-Q6_K.gguf | 9,79 GB |
| gemma-4-12B-Q5_K_M.gguf | 8,55 GB |
| gemma-4-12B-Q4_K_M.gguf | 7,38 GB |
| gemma-4-12B-Q4_K_S.gguf | 7,02 GB |
| gemma-4-12B-IQ4_XS.gguf | 6,64 GB |
| gemma-4-12B-Q3_K_M.gguf | 6,09 GB |
| gemma-4-12B-Q2_K.gguf | 4,83 GB |

El tamano total del repositorio es de 63,0 GB e incluye tambien los pesos BF16 de referencia (23,83 GB) empleados en la evaluacion de fidelidad.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base google/gemma-4-12B (tipo de transformer, atencion, capas, composicion del dataset o fases de alineamiento como RLHF o DPO). Lo que si se documenta es el proceso de cuantizacion: se generaron pesos GGUF para llama.cpp con soporte para CUDA, Metal y CPU, y se eliminaron explicitamente las torres de vision y audio del modelo original, por lo que la variante distribuida aqui es solo texto.

El autor incluye una evaluacion de fidelidad frente al modelo BF16 sobre WikiText-2 (40 fragmentos de 512 tokens) y texto reservado (20 fragmentos), midiendo divergencia KL y acuerdo top-1, ademas de una comprobacion cualitativa con 7 completaciones. Los tags del repositorio mencionan `imatrix`, lo que sugiere el uso de matrices de importancia en la generacion de las cuantizaciones K-quant e IQ. No se proporcionan datos sobre el numero de tokens de entrenamiento ni sobre innovaciones tecnicas del modelo base.

## Capacidades

- Generacion de texto en ingles y coreano.
- Inferencia local mediante llama.cpp en CUDA, Metal o CPU.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite servirlo a traves de infraestructuras compatibles con la API de Hugging Face.
- Modelo puramente textual: no incluye vision ni audio, ya que esas torres fueron eliminadas en esta distribucion.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible en la informacion proporcionada.
- Capacidades matematicas o de codigo especificas: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU de datacenter: con Q4_K_M (7,38 GB) el modelo cabe en GPUs de consumo de 8-12 GB de VRAM y permite asistentes de texto privados sin conexion.
- Despliegue en CPU para entornos air-gapped: las cuantizaciones Q3_K_M y Q2_K (6,09 GB y 4,83 GB) permiten ejecutar el modelo en servidores sin acelerador, util para procesamiento por lotes de documentos en redes aisladas.
- Generacion de texto en coreano: al declarar soporte de `ko`, es adecuado para resumen, redaccion o traduccion asistida en productos dirigidos al mercado coreano.
- Servicio de completado de bajo coste: Q8_0 (12,67 GB) ofrece un 98,20% de acuerdo top-1 con BF16 en WikiText-2, suficiente para tareas de generacion donde se prioriza fidelidad sobre huella de memoria.
- Prototipado rapido con llama.cpp: el comando de ejemplo del autor permite validar pipelines de generacion en minutos, sin necesidad de infraestructura de servido compleja.
- Evaluacion comparativa de cuantizaciones: la tabla de KL y top-1 publicada facilita elegir el compromiso tamano/calidad en funcion de la VRAM disponible antes de comprometerse con un despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor si publica metricas de fidelidad de la cuantizacion frente a BF16:

| Cuantizacion | Tamano | KL WikiText-2 | Top-1 | KL reservado | Top-1 | Comprobacion (7 completaciones) |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 23,83 GB | - | - | - | - | 4/7 |
| Q8_0 | 12,67 GB | 0,002641 | 98,20% | 0,004226 | 98,08% | 5/7 |
| Q6_K | 9,79 GB | 0,006105 | 97,07% | 0,008533 | 96,57% | 4/7 |
| Q5_K_M | 8,55 GB | 0,012492 | 95,82% | 0,017216 | 95,41% | 5/7 |
| Q4_K_M | 7,38 GB | 0,036705 | 93,36% | 0,048709 | 92,45% | 5/7 |
| Q4_K_S | 7,02 GB | 0,042997 | 92,79% | 0,057802 | 91,49% | 5/7 |
| IQ4_XS | 6,64 GB | 0,051350 | 92,08% | 0,069030 | 89,00% | 4/7 |
| Q3_K_M | 6,09 GB | 0,127171 | 86,87% | 0,174189 | 83,84% | 5/7 |
| Q2_K | 4,83 GB | 0,436462 | 76,70% | 0,607151 | 69,80% | 6/7 |

La degradacion es apreciable a partir de Q3_K_M y especialmente severa en Q2_K, donde el acuerdo top-1 cae al 76,70% en WikiText-2 y al 69,80% en texto reservado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del archivo mas el overhead de contexto y cache KV. Q8_0 requiere en torno a 13-14 GB; Q4_K_M en torno a 8-9 GB; Q2_K en torno a 5-6 GB (estimaciones a partir del tamano de archivo, no publicadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, Q8_0 encaja en A100 40 GB, H100 o RTX 4090 (24 GB); Q4_K_M es viable en RTX 4070/4080 y GPUs de 12 GB; Q2_K puede ejecutarse en GPUs de 6-8 GB.
- Cabe en GPU de consumo: si, desde Q4_K_M hacia abajo en GPUs de 8-12 GB; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp (requiere build b8730 o superior), con soporte CUDA, Metal y CPU. No se documentan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, esta distribucion se diferencia de otras cuantizaciones GGUF de la misma familia por eliminar las torres de vision y audio y por publicar una tabla de fidelidad frente a BF16 con dos conjuntos de evaluacion.

| Aspecto | Esta distribucion | Alternativa generica GGUF del mismo modelo base |
|---|---|---|
| Parametros | 11,9 mil millones | 11,9 mil millones |
| Contexto | no disponible | no disponible |
| Vision/audio | eliminados | habitualmente incluidos |
| Licencia | Apache 2.0 | Apache 2.0 |
| Metricas de fidelidad | publicadas (KL y top-1) | variable |

## Limitaciones y advertencias

- Modelo solo texto: al eliminar las torres de vision y audio, no puede procesar imagenes ni audio aunque el modelo base original si pudiera.
- Idiomas limitados: solo se declaran ingles y coreano; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de sesgos; debe asumirse el riesgo habitual de los modelos generativos.
- Cuantizaciones agresivas: Q2_K pierde mas de 20 puntos de acuerdo top-1 frente a Q8_0, por lo que no es recomendable para produccion sensible a la calidad.
- Version de llama.cpp: requiere build b8730 o superior; versiones anteriores pueden no cargar correctamente los pesos.
- Estado del repositorio: sin descargas ni interacciones en Hugging Face en el momento de la ficha, lo que implica poca validacion externa.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los ficheros `LICENSE` y `NOTICE` del repositorio por si el modelo base impone condiciones adicionales.
- Datos de arquitectura y contexto ausentes: no es posible planificar despliegues de contexto largo sin consultar la model card del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de llama.cpp: no incluida en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
