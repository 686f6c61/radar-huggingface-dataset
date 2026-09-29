# taurusduan/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Swift 1.5 Qwen3.8-Flash-Next GSQ-RCO GGUF es un conjunto de cuantizaciones mixtas en formato GGUF de Swift Flash Next, un derivado de Qwen3.8-Flash-Next orientado a eficiencia de razonamiento y desarrollado por UkisAI. El modelo base se ha post-entrenado para producir trazas de razonamiento mas cortas y para tareas de codigo, agenticas y de horizonte largo. Segun la model card, Swift 1.5 Flash-Next emplea un 63,4 % menos de tokens de "thinking", con una aceleracion de 1,8x y una perdida de precision inferior al 1 % frente al modelo base en el modo xhigh.

Esta publicacion concreta no es un modelo nuevo, sino un empaquetado de pesos cuantizados: tres niveles de cuantizacion mixta (IQ3_XXS, IQ2_XS y Q2_0 experimental) que suman pares de shards GGUF de entre 66,55 GB y 75,97 GB, mas un proyector de vision BF16 independiente de 0,91 GB. El objetivo es permitir la ejecucion del modelo de ~177.000 millones de parametros en hardware que no puede alojar los pesos BF16 completos, con perfiles de asignacion por tensor GSQ-RCO reutilizados de trabajos previos de ISTA.

El interes practico esta en la relacion entre tamano y divergencia: los pesos completos ocupan 212,2 GB en el repositorio, mientras que IQ2_XS baja a 68,15 GB. La model card reporta que IQ2_XS obtiene menor KLD (divergencia respecto a la distribucion BF16 de referencia) que la cuantizacion IQ2_XS equivalente de ISTA-DASLab en siete de ocho conjuntos de evaluacion, con mejoras de entre el 5 % y el 11 %. El repositorio figura a nombre de la cuenta taurusduan, aunque todos los enlaces de la model card apuntan a repositorios de la organizacion ukisai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE, segun etiquetas del repositorio); detalles de capas y atencion no disponibles |
| Parametros totales | 176.943.899.520 (~176,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_XXS, IQ2_XS, Q2_0 (experimental); proyector de vision en BF16 |
| Idiomas soportados | no disponible (la evaluacion de cuantizacion cubre ingles, aleman, frances, espanol y chino) |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (llama.cpp), dividido en dos shards por nivel; mmproj BF16 separado |
| Tamano del repositorio | 212,2 GB |
| Modelo base | ukisai/Swift-Qwen3.8-Flash-Next (relacion: quantized) |
| Pipeline declarado | image-text-to-text |
| Libreria | gguf |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la etiqueta "moe" (Mixture of Experts) y de la referencia al linaje Qwen3.8-Flash-Next. No se especifican el numero de expertos, el numero de parametros activos por token, el tipo de atencion ni los detalles del tokenizador. El modelo es multimodal: el pipeline declarado es image-text-to-text y el repositorio incluye un proyector de vision en BF16 (mmproj-Swift-Qwen3.8-Flash-Next-BF16.gguf, 0,91 GB), aunque la evaluacion publicada solo cubre inferencia de texto y no mide precision en tareas de vision.

En cuanto al entrenamiento, Swift Flash Next se describe como un derivado de Qwen3.8-Flash-Next post-entrenado por UkisAI con el objetivo de reducir la longitud de las trazas de razonamiento y mejorar tareas de codigo, agenticas y de horizonte largo. La model card afirma una reduccion del 63,4 % en tokens de pensamiento, una mejora de velocidad de 1,8x y una perdida de precision inferior al 1 % frente al modelo base en el modo xhigh. No se publican en esta ficha el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF, DPO u otras tecnicas de alineamiento; para esos datos la model card remite a la del modelo original.

La innovacion tecnica de esta publicacion es exclusivamente de cuantizacion: se emplean perfiles de asignacion de precision por tensor GSQ-RCO (reutilizados de trabajos de ISTA) junto con un refinamiento GSQ especifico de Swift, y los archivos se dividen en dos shards que llama.cpp reensambla automaticamente al cargar el primero. Se incluyen tambien archivos de recuperacion exacta que permiten reconstruir byte a byte los GGUF originales sin dividir, con hashes verificados antes de la publicacion.

## Capacidades

- Generacion de texto conversacional, con soporte multi-turno (etiqueta "conversational").
- Razonamiento con modo de pensamiento eficiente: el post-entrenamiento del modelo base esta orientado a trazas de razonamiento mas cortas, con un 63,4 % menos de tokens de thinking declarados.
- Codigo: la model card menciona explicitamente tareas de codigo y evalua divergencia sobre CodeParrot como conjunto de codigo.
- Matematicas: se evalua divergencia sobre texto matematico de GSM8K.
- Tareas agenticas y de horizonte largo (mencionadas como objetivo del post-entrenamiento).
- Entrada de imagen y texto (pipeline image-text-to-text, mas proyector de vision BF16 incluido).
- Compatible con endpoints (etiqueta endpoints_compatible) y con llama.cpp.
- Soporte multilingue parcial evidenciado por la evaluacion (ingles, aleman, frances, espanol, chino); no hay lista oficial de idiomas soportados.
- Tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento con presupuesto de tokens ajustado: el modelo base esta post-entrenado para emitir menos tokens de pensamiento manteniendo la precision, por lo que resulta adecuado en pipelines donde el coste por token de salida es el cuello de botella (por ejemplo, agentes que ejecutan decenas de pasos por tarea).
- Procesamiento de documentos con componentes visuales: gracias al proyector de vision BF16 y al pipeline image-text-to-text, puede abordar capturas, diagramas o paginas escaneadas combinadas con texto, siempre que se asuma que la precision en vision no ha sido validada por el autor.
- Evaluacion e investigacion de cuantizacion: el repositorio publica tablas de KLD por dominio y por nivel de cuantizacion, ademas de metadatos de evaluacion y sumas SHA256, lo que lo hace util como material de referencia para comparar estrategias de cuantizacion mixta sobre un modelo de ~177.000 millones de parametros.
- Despliegue local en estaciones de trabajo con multiples GPU: con IQ2_XS (68,15 GB) o IQ3_XXS (75,97 GB) es viable servir el modelo en nodos de 2x80 GB mediante llama.cpp cuando no se dispone de VRAM para los pesos BF16.
- Generacion y revision de codigo en entornos con restricciones de red: al ser GGUF y ejecutarse con llama.cpp, puede desplegarse en infraestructura aislada sin dependencia de APIs externas, usando IQ3_XXS si se prioriza calidad sobre tamano.
- Trazas de razonamiento para depuracion de agentes: la reduccion de tokens de pensamiento facilita el analisis de cadenas de decision en sistemas multi-paso, donde trazas excesivamente largas son dificiles de auditar.
- Procesamiento multilingue de texto en ingles, aleman, frances, espanol o chino: son los idiomas cubiertos por la evaluacion de cuantizacion, aunque la model card advierte de que la calidad en contexto largo no ha sido establecida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Lo que si se publica son mediciones de KLD (divergencia respecto a la distribucion de siguiente token del modelo BF16 correspondiente); un valor mas bajo es mejor. Estas cifras no son porcentajes de acierto en tareas ni rankings de capacidad, y cada comparacion usa su propia referencia BF16.

Tamano y divergencia global de desarrollo:

| Nivel | Tamano GGUF combinado | Shards | KLD de desarrollo |
|---|---:|---|---:|
| IQ3_XXS | 75,97 GB | 2 | 0,240139 |
| IQ2_XS | 68,15 GB | 2 | 0,341275 |
| Q2_0 (experimental) | 66,55 GB | 2 | 0,424350 |

KLD por dominio (contexto de 512 tokens):

| Conjunto | IQ3_XXS | IQ2_XS | Q2_0 (experimental) |
|---|---:|---:|---:|
| Prosa en ingles | 0,116077 | 0,188117 | 0,234242 |
| Muestra fresca en ingles | — | 0,186271 | 0,236228 |
| Codigo (CodeParrot) | 0,118707 | 0,174294 | 0,235256 |
| Matematicas (texto GSM8K) | 0,086821 | 0,120991 | 0,149809 |
| Aleman | 0,109100 | 0,166814 | 0,219444 |
| Frances | 0,133624 | 0,213379 | 0,300467 |
| Espanol | 0,073681 | 0,119114 | 0,148757 |
| Chino | 0,174102 | 0,264923 | 0,385924 |

Segun el autor, IQ2_XS es el nivel mas destacado: supera al IQ2_XS de GSQ-RCO de ISTA-DASLab en siete de ocho conjuntos (entre un 5 % y un 11 % menos de KLD, con -8,9 % en matematicas y -10,5 % en chino) y mejora su cuantizacion de partida Swift entre un 8 % y un 17 % en todos los dominios. IQ3_XXS mejora su punto de partida en seis de siete dominios (3-16 %) y bate a ISTA en matematicas (-7,8 %) y chino (-5,1 %), quedando en el resto a 1-4 %. Q2_0 esta marcado como experimental: mejora su punto de partida en cinco de siete dominios, pero tiene peor KLD que el Q2_0 de ISTA en seis de ocho conjuntos; el autor recomienda IQ2_XS para tamanos similares.

## Requisitos de hardware

- VRAM/RAM para los pesos: IQ2_XS ~68,15 GB, Q2_0 ~66,55 GB, IQ3_XXS ~75,97 GB. A esto hay que sumar la memoria de contexto y cache KV, no incluida en las cifras de la model card.
- Proyector de vision: 0,91 GB adicionales en BF16 si se usa entrada de imagen.
- GPU de datacenter: un H100 de 80 GB aloja los pesos de IQ2_XS o Q2_0 con margen limitado para contexto; IQ3_XXS (75,97 GB) deja un margen muy estrecho y en la practica exige 2x H100/A100 80 GB. Para contexto largo se recomienda 2x80 GB en cualquiera de los niveles.
- GPU de consumo: no cabe en una unica GPU de consumo (24-32 GB). Es necesario repartir entre varias GPU o descargar capas a RAM del sistema con llama.cpp, lo que requiere del orden de 66-76 GB de RAM libre para los pesos.
- Despliegue: llama.cpp / llama-server es la ruta soportada explicitamente; se requiere una build que soporte Qwen3.8-Flash-Next. Carga del primer shard con localizacion automatica del segundo. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Descarga: el repositorio ocupa 212,2 GB, aunque solo es necesario bajar los shards del nivel elegido (mas el mmproj si se usa vision).
- Latencia y throughput: no disponibles. La model card cita una aceleracion de 1,8x para el modelo base Swift 1.5 frente a su base, no una medida de throughput de estas cuantizaciones.

## Comparativa con modelos similares

La informacion disponible solo permite comparar en terminos de KLD frente a las cuantizaciones GSQ-RCO de ISTA-DASLab y frente al BF16 de referencia. No hay datos publicados de parametros, contexto o rendimiento en tareas para los terminos de comparacion.

| Alternativa | Parametros | Contexto | KLD relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IQ2_XS) | 176,9 mil millones | no disponible | Mejor que el IQ2_XS de ISTA en 7 de 8 conjuntos (5-11 % menos) | swift-open-license-1.0 | GGUF, 2 shards, 68,15 GB |
| ISTA-DASLab GSQ-RCO IQ2_XS | no disponible | no disponible | Referencia de comparacion; peor en 7 de 8 conjuntos | no disponible | no disponible |
| ISTA-DASLab GSQ-RCO IQ3_XXS | no disponible | no disponible | Este modelo mejora en matematicas (-7,8 %) y chino (-5,1 %); resto a 1-4 % | no disponible | no disponible |
| ukisai/Swift-Qwen3.8-Flash-Next (BF16) | no disponible | no disponible | Referencia de KLD cero por definicion | swift-open-license-1.0 | Pesos BF16 en HuggingFace |
| Qwen3.8-Flash-Next | no disponible | no disponible | Base del linaje; sin mediciones en esta ficha | no disponible | no disponible |

## Limitaciones y advertencias

- Las cifras de KLD no son porcentajes de acierto: miden divergencia respecto a una distribucion de referencia y el propio autor advierte que no constituyen rankings de capacidad, ni equivalencia estadistica, ni porcentajes de precision en tareas.
- La evaluacion se realiza con contexto de 512 tokens y 100 fragmentos (25 en los idiomas no ingleses); el autor indica explicitamente que estas pruebas no establecen la calidad en contexto largo.
- El filtrado por solapamiento lexico no demuestra desduplicacion semantica ni ausencia de sobreajuste, segun la propia model card.
- Q2_0 esta marcado como experimental y ofrece peor KLD que la alternativa de ISTA en seis de ocho conjuntos; el autor recomienda IQ2_XS en su lugar.
- No hay resultados de evaluacion de tareas de vision, pese a que el repositorio incluye proyector multimodal y el pipeline declarado es image-text-to-text.
- La lista de idiomas soportados no esta publicada; la cobertura de evaluacion (ingles, aleman, frances, espanol, chino) no implica soporte oficial ni calidad homogenea.
- Licencia swift-open-license-1.0, etiquetada como "other" en HuggingFace: no se detallan en la informacion disponible las condiciones de uso comercial. La model card menciona "Enterprise licensing", por lo que se debe revisar el texto completo de la licencia antes de cualquier uso en produccion.
- El repositorio esta publicado bajo la cuenta taurusduan, mientras que la model card, la licencia y todos los enlaces apuntan a repositorios de la organizacion ukisai. Conviene verificar la autoria y la cadena de custodia de los pesos antes de usarlos.
- Riesgo de alucinacion y sesgos: no se han publicado evaluaciones de sesgo, toxicidad o alucinacion en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card aparece truncada en el ejemplo de uso; se debe consultar el repositorio original para los comandos completos.
- Uso previsto: se menciona autenticacion con una cuenta con acceso concedido mientras el repositorio es privado, lo que sugiere un acceso restringido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taurusduan/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo BF16 de referencia: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next
- GGUFs estandar: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- Modelo base declarado: https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next (base_model: ukisai/Swift-Qwen3.8-Flash-Next)
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/LICENSE
- Sumas SHA256: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GSQ-RCO-GGUF/blob/main/SHA256SUMS
- Web del autor del modelo base: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- arXiv referenciados en las etiquetas del repositorio: arXiv:2604.18556 y arXiv:2605.00649 (sin enlace directo proporcionado)
