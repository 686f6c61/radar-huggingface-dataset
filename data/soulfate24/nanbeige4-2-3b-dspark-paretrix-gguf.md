# Soulfate24/Nanbeige4.2-3B-DSpark-Paretrix-GGUF

## Resumen

Nanbeige4.2-3B-DSpark-Paretrix-GGUF es una cuantización GGUF del modelo Nanbeige4.2-3B, publicado por el usuario Soulfate24 bajo el paraguas de su suite Paretrix de cuantización. El modelo base es Nanbeige4.2-3B, un LLM de 4.169.800.704 parámetros totales según los pesos en safetensors, desarrollado por Nanbeige y entrenado principalmente para inglés y chino. Esta variante incorpora además el módulo DSpark, un modelo draft orientado a decodificación especulativa, lo que la hace especialmente interesante para despliegues con llama.cpp donde la latencia importa.

La innovación principal no está en el modelo base sino en el método de cuantización. Paretrix es una suite de cuantización empírica y sensible a activaciones que, en lugar de aplicar un único bitwidth uniforme a toda la red, mide la respuesta de cada clase de tensores a cada tipo de cuantización y planifica cada nivel mediante un problema de mochila exacto, comparando contra los logits en BF16. El resultado son varios "escalones" (Fidelity-48pc, Precision-42pc, Quality-36pc, etc.) que buscan el mejor compromiso entre tamaño y fidelidad en su punto de la frontera de Pareto.

La relevancia práctica es doble: por un lado, ofrece variantes de 1.769 MiB a 4.229 MiB con métricas de perplejidad, KLD y RMS Δp publicadas, lo que permite elegir con criterio según el presupuesto de VRAM; por otro, al incluir el draft DSpark para decodificación especulativa, apunta a escenarios de inferencia local en GPU de consumo donde el throughput es el cuello de botella. La licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Nanbeige4.2-3B); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 4.169.800.704 (pesos en safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion hibrida por clases de tensores: niveles Paretrix Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc; bases stock Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 47,6 GB con multiples niveles); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es Nanbeige4.2-3B, un transformer de aproximadamente 4,17 mil millones de parametros segun los pesos publicados. La model card de esta variante no documenta la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron fases de RLHF o DPO; esa informacion corresponderia al repositorio del modelo base y no se incluye aqui. Lo que si se explicita es la existencia de un segundo artefacto, Nanbeige4.2-3B-DSpark, descrito como modulo draft para decodificacion especulativa, lo que sugiere que el modelo base se presta a tecnicas de aceleracion por propuesta y verificacion de tokens.

La contribucion tecnica de esta publicacion es el pipeline Paretrix. El proceso parte de tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx) y, para cada clase de tensores, la mueve de forma aislada a cada tipo de cuantizacion disponible, midiendo la desviacion frente a los logits en BF16. Con esas celdas de medida, un problema de mochila exacto planifica cada nivel, y un duelo en el regimen de veredicto decide si el plan sustituye al campeon vigente. El autor senala que lo medido en un modelo se hereda al siguiente de la misma familia, lo que convierte la suite en un metodo transferible y no en un ajuste artesanal por modelo.

## Capacidades

- Generacion de texto conversacional en ingles y chino, segun los idiomas declarados en la model card.
- Inferencia compatible con llama.cpp y con la libreria transformers, segun los tags del repositorio.
- Decodificacion especulativa mediante el draft DSpark, que permite acelerar la generacion verificando propuestas de tokens.
- Cuantizacion hibrida por clases de tensores, con niveles calibrados para distintos presupuestos de memoria.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su exposicion como servicio.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible; el pipeline declarado es exclusivamente text-generation.

## Casos de uso

- Despliegue local en GPU de consumo: el nivel Femto-21pc ocupa 1.769 MiB y el Pico-24pc 2.004 MiB, tamanos que permiten ejecutar el modelo en tarjetas con 4-6 GB de VRAM libre usando llama.cpp, con una perdida de fidelidad acotada y medida (PPL 33,90 y 34,57 respectivamente frente a 31,60 de Q8_0).
- Servicio de chat en ingles y chino: al declarar ambos idiomas y una licencia Apache 2.0, encaja en productos de atencion al cliente o asistentes internos bilingues sin coste de licencia, sirviendo el nivel Precision-42pc (3.412 MiB) como punto de equilibrio.
- Aceleracion de inferencia con decodificacion especulativa: el draft DSpark permite proponer tokens que el modelo principal verifica, reduciendo el numero de pasos de decodificacion en cargas interactivas donde la latencia percibida es critica.
- Evaluacion de metodos de cuantizacion: los datos publicados de PPL, ΔPPL, KLD, RMS Δp y top-p para cada nivel convierten este repositorio en un banco de pruebas para investigadores que comparan tecnicas de cuantizacion hibrida frente a bitwidth uniforme.
- Prototipado rapido en entornos con memoria limitada: el nivel Nano-27pc (2.231 MiB) mejora el KLD de IQ4_XS-imx (0,1849 frente a 0,1971) con menos peso, lo que lo hace adecuado para entornos de desarrollo y CI donde se ejecutan pruebas automatizadas del modelo.
- Integracion en pipelines con transformers: al mantener compatibilidad con la libreria transformers y el formato GGUF, puede alternarse entre el checkpoint base en safetensors para evaluacion de referencia y las variantes cuantizadas para produccion.

## Benchmarks y rendimiento

Los datos publicados son metricas de fidelidad de cuantizacion medidas contra los logits en BF16, no benchmarks de tareas estandar. Se presentan tal cual, sin interpretacion adicional.

| Modelo | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p | Pareto |
|---|---:|---:|---:|---:|---:|---:|:---|
| Q8_0 (stock) | 4229 | 31,6031 | +1,6930 | 0,0154 | 3,13% | 95,5% | ★ |
| Fidelity-48pc | 3822 | 31,5988 | +1,6887 | 0,0206 | 3,54% | 94,6% | ★ |
| Precision-42pc | 3412 | 31,9824 | +2,0723 | 0,0344 | 4,29% | 92,7% | ★ |
| Q6_K-imx (stock) | 3266 | 31,9481 | +2,0380 | 0,0451 | 4,86% | 92,1% | ★ |
| Quality-36pc | 2932 | 31,6147 | +1,7045 | 0,0577 | 5,58% | 90,1% | ★ |
| Q5_K_M-imx (stock) | 2849 | 32,1203 | +2,2101 | 0,0719 | 5,98% | 89,3% | ★ |
| Compact-33pc | 2697 | 32,3483 | +2,4381 | 0,1055 | 7,47% | 87,2% | ★ |
| Mini-30pc | 2458 | 32,1195 | +2,2094 | 0,1287 | 7,93% | 85,4% | ★ |
| IQ4_XS-imx (stock) | 2268 | 32,6725 | +2,7624 | 0,1971 | 9,76% | 82,2% | < Nano-27pc |
| Nano-27pc | 2231 | 32,5803 | +2,6701 | 0,1849 | 9,54% | 82,5% | ★ |
| Pico-24pc | 2004 | 34,5682 | +4,6581 | 0,2969 | 12,01% | 76,8% | ★ |
| IQ3_M-imx (stock) | 1985 | 33,2823 | +3,3722 | 0,4923 | 15,06% | 71,5% | ★ |
| Femto-21pc | 1769 | 33,8955 | +3,9854 | 0,5085 | 15,42% | 68,6% | ★ |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,8 GB y 4,3 GB solo para pesos, segun el nivel elegido (Femto-21pc 1.769 MiB; Fidelity-48pc 3.822 MiB; Q8_0 4.229 MiB). Hay que sumar la memoria del contexto KV, no cuantificada en la tabla.
- Cabe en GPU de consumo: el nivel Femto-21pc y el Pico-24pc caben en tarjetas de 4-6 GB; los niveles Mini-30pc y Compact-33pc en 6-8 GB; Quality-36pc y Precision-42pc en 8-12 GB; Fidelity-48pc y Q8_0 en 12-16 GB o mas.
- GPU recomendadas: RTX 3060/4060 para los niveles bajos, RTX 4070/4080 para niveles medios, RTX 4090 o A100/H100 para servir varios niveles o contextos largos en paralelo.
- Opciones de despliegue: llama.cpp de forma nativa por el formato GGUF; Ollama como envoltorio practico; vLLM y TGI no estan confirmados para este formato en la informacion disponible. El tag endpoints_compatible sugiere compatibilidad con servicios de inferencia.
- Latencia y throughput: no disponibles. El unico indicio de aceleracion es la inclusion del draft DSpark para decodificacion especulativa, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nanbeige4.2-3B-DSpark-Paretrix (este) | 4,17 B | no disponible | Apache 2.0 | GGUF (multiples niveles) | Cuantizacion hibrida con metricas de fidelidad publicadas y draft especulativo |
| Nanbeige/Nanbeige4.2-3B (base) | 4,17 B | no disponible | Apache 2.0 | safetensors | Referencia en BF16; sin cuantizar |
| IQ4_XS-imx (stock) | 4,17 B | no disponible | Apache 2.0 | GGUF | Cuantizacion uniforme de referencia; KLD 0,1971 frente a 0,1849 de Nano-27pc |
| Q6_K-imx (stock) | 4,17 B | no disponible | Apache 2.0 | GGUF | Cuantizacion uniforme de referencia; KLD 0,0451 frente a 0,0577 de Quality-36pc |

La comparacion con modelos de otros fabricantes del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse en ingles y chino, es previsible un sesgo de dominio hacia esas dos comunidades linguisticas.
- Riesgo de alucinacion: no cuantificado; no se han publicado evaluaciones de factualidad ni de tareas de razonamiento.
- Limitaciones de idioma: solo se declaran en y zh; el rendimiento en castellano no esta respaldado por la model card.
- Limitaciones de contexto: la longitud de contexto no se especifica, por lo que no puede planificarse el consumo de KV cache ni casos de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Nanbeige4.2-3B, ya que esta variante solo hereda la del artefacto cuantizado.
- Caveat de produccion: las metricas publicadas son de fidelidad de cuantizacion (PPL, KLD, RMS Δp, top-p), no de calidad en tareas; un KLD bajo no garantiza buen rendimiento en codigo, matematicas o instrucciones.
- El nivel Femto-21pc presenta un KLD de 0,5085 y un RMS Δp del 15,42%, valores que en la propia tabla superan a IQ3_M-imx en KLD, por lo que no conviene usarlo en produccion sensible a la calidad.
- El repositorio ocupa 47,6 GB por acumular todos los niveles; la descarga selectiva de un unico fichero GGUF es imprescindible para no saturar el almacenamiento.
- El autor es un usuario individual (Soulfate24), no la organizacion Nanbeige; la trazabilidad del proceso de cuantizacion depende de la documentacion de la suite Paretrix.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/Nanbeige4.2-3B-DSpark-Paretrix-GGUF
- Suite Paretrix de cuantizacion: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Draft DSpark: https://huggingface.co/Nanbeige/Nanbeige4.2-3B-DSpark
