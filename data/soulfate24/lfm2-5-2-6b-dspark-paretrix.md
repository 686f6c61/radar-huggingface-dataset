# Soulfate24/LFM2.5-2.6B-DSpark-Paretrix

## Resumen

LFM2.5-2.6B-DSpark-Paretrix es un conjunto de cuantizaciones GGUF publicadas por el usuario Soulfate24 sobre el modelo LiquidAI/LFM2.5-2.6B y su modulo de decodificacion especulativa LiquidAI/LFM2.5-2.6B-DSpark. No es por tanto un modelo entrenado desde cero, sino un artefacto de compresion: la red base de 2.697.198.592 parametros (unos 2,7 mil millones) se redistribuye en distintas recetas de bits por tensor para ofrecer varios puntos de equilibrio entre tamano en disco, perplejidad (PPL) y divergencia KL (KLD) respecto a la referencia Q8_0.

El valor anadido esta en el metodo, la Paretrix Quantization Suite, que se describe como una suite de cuantizacion empirica y sensible a las activaciones. En lugar de aplicar una unica familia de bitwidth a toda la red (como hacen las recetas uniformes Q4_K_M o Q6_K), Paretrix mide la sensibilidad real de cada clase de tensor con `llama-imatrix`, aprende tablas de tasa a partir de campanas cruzadas entre arquitecturas y asigna bits bajo un presupuesto exacto. El resultado son ocho niveles propios (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc y Femto-21pc) que se suman a los niveles stock Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx e IQ3_M-imx.

Es relevante ahora porque el despliegue en el borde (edge) exige modelos de menos de 3 GB que quepan en GPUs de consumo, iGPUs y telefonos, y porque la cuantizacion selectiva por tensor permite conservar mas fidelidad que una receta uniforme al mismo tamano de archivo. El repositorio, sin embargo, es muy reciente (creado el 8 de octubre de 2026) y no registra descargas ni valoraciones, por lo que su adopcion real esta por verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion disponible; cuantizacion GGUF del modelo base LiquidAI/LFM2.5-2.6B (etiquetas "liquid" y "lfm2.5") |
| Parametros totales | 2.697.198.592 (aprox. 2,7 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: propias Paretrix (Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc) y stock (Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx) |
| Idiomas soportados | Arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita (16 idiomas) |
| Licencia | lfm1.0 (campo `license: other`, con `license_name: lfm1.0` y enlace al archivo LICENSE del repositorio) |
| Formato de pesos | Safetensors (transformers) y GGUF (llama.cpp) |
| Modelo base | LiquidAI/LFM2.5-2.6B y LiquidAI/LFM2.5-2.6B-DSpark (relacion: quantized) |
| Tamano del repositorio | 14,4 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-08 |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna de la red base: la model card se centra exclusivamente en el proceso de cuantizacion. Lo unico que se puede afirmar con los datos disponibles es que se parte de LiquidAI/LFM2.5-2.6B, un modelo de la familia LFM2.5 de Liquid AI (etiquetas "liquid" y "lfm2.5"), con 2.697.198.592 parametros y soporte para 16 idiomas, y de su modulo acompanante LiquidAI/LFM2.5-2.6B-DSpark, pensado como modelo borrador (draft) para decodificacion especulativa. No se publican datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. Tampoco se detalla si la red combina convoluciones y atencion u otro esquema hibrido.

La innovacion tecnica destacable es el metodo de cuantizacion. Paretrix se define como una suite empirica y sensible a las activaciones: mide la sensibilidad real por clase de tensor mediante `llama-imatrix`, calculando la contribucion de cada clase a la divergencia KL por MiB, aprende tablas de tasa a partir de campanas cruzadas entre arquitecturas (lo que el autor llama THE MATRIX) y reparte bitwidths bajo un presupuesto de tamano exacto. La asignacion puede ser plana cuando la uniformidad es optima o un problema de mochila (knapsack) calibrado por tasas cuando la heterogeneidad compensa. Ademas, el repositorio incluye soporte para cuantizar tambien los modulos de decodificacion especulativa (el draft DSpark), de forma que la aceleracion por especulacion se mantiene en los niveles comprimidos. No se ha realizado ningun entrenamiento adicional en este repositorio: es exclusivamente un artefacto de compresion y empaquetado.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base LFM2.5-2.6B (etiquetas "text-generation", "conversational").
- Multilingue: soporte declarado para 16 idiomas (arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita).
- Decodificacion especulativa: el repositorio cuantiza tambien el draft LiquidAI/LFM2.5-2.6B-DSpark, lo que permite emparejar modelo objetivo y modelo borrador para acelerar la inferencia en llama.cpp.
- Despliegue en el borde (edge): tamanos desde 1.096 MiB (Femto-21pc) hasta 2.742 MiB (Q8_0), pensados para ejecucion local.
- Compatibilidad con transformers y con el ecosistema llama.cpp / GGUF (etiquetas "transformers", "gguf", "llama.cpp", "endpoints_compatible").
- Ajuste fino del compromiso fidelidad/tamano: ocho niveles propios mas cinco recetas stock, cada uno con metricas de PPL, KLD y top-p publicadas.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento explicito (thinking mode), vision, audio ni matematica avanzada en la informacion disponible.

## Casos de uso

- Asistente conversacional local en escritorio: con el nivel Nano-27pc (1.405 MiB) el modelo cabe en cualquier GPU de consumo o incluso en CPU, lo que permite montar un chat privado sin enviar datos a la nube.
- Inferencia en el borde con recursos limitados: el nivel Femto-21pc (1.096 MiB) esta pensado para dispositivos con poca memoria, aunque su degradacion medida es alta (ΔPPL +20,53 y top-p 69,0 %), por lo que se recomienda para tareas de baja exigencia o como banco de pruebas.
- Servicio de generacion de texto autohospedado: desplegando el nivel Quality-36pc (1.848 MiB) con llama.cpp o un servidor compatible con la API de OpenAI se obtiene una KLD de 0,0309, muy proxima a la de Q5_K_M-imx stock (0,0380) con un archivo ligeramente menor.
- Aceleracion de pipelines de inferencia: el par objetivo + draft DSpark cuantizado permite aplicar decodificacion especulativa en llama.cpp, reduciendo el coste por token en escenarios de generacion larga.
- Prototipado y evaluacion de estrategias de cuantizacion: el repositorio publica la tabla completa de PPL, ΔPPL, KLD, RMS Δp y top-p por nivel, lo que lo convierte en un banco de comparacion para quien investigue asignacion de bits por tensor.
- Traduccion y atencion multilingue ligera: al declarar 16 idiomas, puede emplearse para traduccion informal o clasificacion de texto en varios idiomas, siempre que se valide la calidad real por idioma, no publicada.
- Empaquetado de aplicaciones distribuidas: los archivos GGUF de entre 1,1 y 2,7 GB son manejables para incluirlos en una aplicacion de escritorio o movil que requiera un modelo embebido.
- Experimentacion con cuantizacion sensible a activaciones: util para replicar el flujo `llama-imatrix` + Paretrix sobre otros modelos y comparar frente a recetas uniformes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo unico que se aporta son metricas de fidelidad de la cuantizacion respecto a la referencia Q8_0, medidas sobre un corpus de calibracion no especificado:

| Nivel | MiB | PPL | ΔPPL | KLD | RMS Δp | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 2742 | 51,8867 | +0,4677 | 0,0032 | 1,34 % | 97,4 % |
| Fidelity-48pc | 2481 | 52,2324 | +0,8134 | 0,0076 | 2,09 % | 96,2 % |
| Precision-42pc | 2138 | 52,8312 | +1,4122 | 0,0105 | 2,44 % | 95,4 % |
| Q6_K-imx (stock) | 2119 | 52,7076 | +1,2886 | 0,0131 | 2,66 % | 94,7 % |
| Q5_K_M-imx (stock) | 1850 | 51,5220 | +0,1030 | 0,0380 | 4,39 % | 91,0 % |
| Quality-36pc | 1848 | 52,6558 | +1,2368 | 0,0309 | 4,13 % | 91,6 % |
| Compact-33pc | 1712 | 49,4337 | −1,9853 | 0,0696 | 6,13 % | 88,0 % |
| Mini-30pc | 1560 | 46,9409† | −4,4780 | 0,0995 | 7,45 % | 85,9 % |
| IQ4_XS-imx (stock) | 1447 | 52,6602 | +1,2412 | 0,1652 | 9,56 % | 81,6 % |
| Nano-27pc | 1405 | 52,7926 | +1,3736 | 0,1536 | 8,91 % | 81,8 % |
| Pico-24pc | 1273 | 55,9255 | +4,5065 | 0,3597 | 13,43 % | 74,6 % |
| IQ3_M-imx (stock) | 1225 | 60,9679 | +9,5490 | 0,4254 | 14,31 % | 72,6 % |
| Femto-21pc | 1096 | 71,9524 | +20,5334 | 0,5535 | 16,29 % | 69,0 % |

Notas sobre la tabla: el autor marca con asterisco los niveles que considera Pareto-optimos y senala explicitamente que Nano-27pc domina a IQ4_XS-imx y que Quality-36pc domina a Q5_K_M-imx. Los valores negativos de ΔPPL en Compact-33pc y Mini-30pc, asi como el dagger (†) que aparece junto a la PPL de Mini-30pc, no vienen explicados en la informacion proporcionada; probablemente reflejan que la PPL se calcula sobre un corpus distinto al de la referencia, pero conviene tratar esas cifras con cautela. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los enlaces recuperados corresponden a un sitio de noticias italiano sin relacion alguna con LFM2.5, por lo que no hay fuentes externas de validacion.

## Requisitos de hardware

Estimaciones a partir del tamano de archivo publicado; el autor no proporciona mediciones de VRAM, latencia ni throughput.

- VRAM estimada para inferencia: aproximadamente el tamano del archivo GGUF mas un margen de 0,3 a 1,0 GB para cache KV y overhead, en funcion del contexto configurado. Rangos orientativos: 1,4-2,5 GB para Femto-21pc, 1,7-2,8 GB para Nano-27pc, 2,2-3,3 GB para Quality-36pc y 3,1-4,2 GB para Q8_0.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 3060, GTX 1650 en los niveles mas comprimidos). Para los niveles inferiores basta con 2 GB. No se requieren A100 ni H100.
- Cabe en GPU de consumo: si, en todos los niveles. Los niveles Nano-27pc y Femto-21pc incluso dejan margen en GPUs de 4 GB y en iGPUs con memoria compartida.
- Ejecucion sin GPU: viable en CPU con llama.cpp, dado el reducido tamano de los pesos; tambien es adecuado para Apple Silicon con Metal.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para los GGUF; transformers para los pesos safetensors; servidores compatibles con la API de OpenAI (la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de HuggingFace). No se confirma soporte de vLLM para estos GGUF.
- Decodificacion especulativa: se puede emparejar con el draft DSpark cuantizado incluido en el repositorio para acelerar la generacion en llama.cpp.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La informacion disponible solo permite comparar dentro del propio ecosistema LFM2.5 y frente a las recetas stock del mismo modelo. No se aportan datos de otras familias (por ejemplo Qwen, Llama o Gemma de tamano equivalente), por lo que esa comparacion se marca como no disponible.

| Modelo / nivel | Parametros | Contexto | Tamano | KLD | Licencia |
|---|---|---|---|---|---|
| Q8_0 (stock) | 2,7 B | no disponible | 2.742 MiB | 0,0032 | lfm1.0 |
| Fidelity-48pc | 2,7 B | no disponible | 2.481 MiB | 0,0076 | lfm1.0 |
| Q6_K-imx (stock) | 2,7 B | no disponible | 2.119 MiB | 0,0131 | lfm1.0 |
| Quality-36pc | 2,7 B | no disponible | 1.848 MiB | 0,0309 | lfm1.0 |
| Q5_K_M-imx (stock) | 2,7 B | no disponible | 1.850 MiB | 0,0380 | lfm1.0 |
| Nano-27pc | 2,7 B | no disponible | 1.405 MiB | 0,1536 | lfm1.0 |
| IQ4_XS-imx (stock) | 2,7 B | no disponible | 1.447 MiB | 0,1652 | lfm1.0 |
| IQ3_M-imx (stock) | 2,7 B | no disponible | 1.225 MiB | 0,4254 | lfm1.0 |
| Femto-21pc | 2,7 B | no disponible | 1.096 MiB | 0,5535 | lfm1.0 |

Comparativa frente a otras familias de tamano similar (Qwen3, Llama 3.2, Gemma 3, etc.): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado, sino un artefacto de cuantizacion: no aporta capacidades nuevas respecto a LiquidAI/LFM2.5-2.6B y hereda todas sus limitaciones, sesgos y riesgos de alucinacion.
- Degradacion medible en los niveles agresivos: Femto-21pc eleva la PPL hasta 71,95 (ΔPPL +20,53) y reduce el top-p a 69,0 %; IQ3_M-imx llega a 60,97. Para produccion conviene quedarse en Quality-36pc o superior.
- Metricas de fidelidad calculadas sobre un corpus de calibracion no especificado: no equivalen a una evaluacion de tareas reales (razonamiento, codigo, matematicas). No hay benchmarks de calidad downstream publicados.
- Valores anomalos sin explicar: las ΔPPL negativas de Compact-33pc y Mini-30pc y el dagger de Mini-30pc no vienen justificados en la model card, lo que dificulta interpretar su calidad relativa.
- Soporte multilingue declarado pero no verificado: la lista de 16 idiomas proviene del modelo base y no se acompana de ninguna evaluacion por idioma; el rendimiento en idiomas distintos del ingles puede ser muy inferior.
- Longitud de contexto desconocida: no se indica la ventana soportada, dato critico para aplicaciones con historiales largos.
- Licencia lfm1.0 (campo `license: other`): es una licencia propia de Liquid AI, no una licencia abierta estandar. Antes de un uso comercial es imprescindible revisar el archivo LICENSE del repositorio, ya que este tipo de licencias suele incluir condiciones o umbrales de facturacion para el uso comercial.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (8 de octubre de 2026). No hay verificacion independiente de las metricas publicadas ni de la integridad de los archivos.
- Trazabilidad limitada del proceso: la Paretrix Quantization Suite se describe enlazando a otro repositorio del mismo autor, sin publicacion cientifica revisada ni conjuntos de calibracion reproducibles.
- La busqueda web no arrojo ninguna fuente externa sobre este modelo; toda la informacion procede de la model card del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Soulfate24/LFM2.5-2.6B-DSpark-Paretrix
- Modelo base (LiquidAI/LFM2.5-2.6B): https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Modelo borrador DSpark (LiquidAI/LFM2.5-2.6B-DSpark): https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark
- Paretrix Quantization Suite: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Archivo de licencia del repositorio: LICENSE (referenciado como enlace relativo dentro del repositorio)
- Papers, blogs, repositorios o demos adicionales: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
