# taurusduan/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

taurusduan/Qwen3.8-Flash-Next-GSQ-RCO-GGUF es un conjunto de cuantizaciones GGUF no uniformes del modelo multimodal Qwen3.8-Flash-Next, un transformer de tipo mezcla de expertos (MoE) con 512 expertos enrutados por capa a lo largo de 48 capas, de los cuales 10 se activan por token. El repositorio lo publica el usuario taurusduan y reproduce la model card del lanzamiento original de IST-DASLab (Institute of Science and Technology Austria), que es quien desarrolla los dos metodos de cuantizacion empleados: GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization).

El interes de esta publicacion es practico: en lugar de aplicar un unico tipo de cuantizacion a todos los tensores, cada tensor recibe su propio tipo, asignado mediante una busqueda basada en gradientes que reparte la precision segun la sensibilidad de cada tensor y sujeto a un presupuesto de tamano total. Como el 95% de los pesos buscables estan en las matrices de expertos, la busqueda concentra ahi su margen de maniobra. El resultado son ficheros GGUF estandar que se ejecutan sin modificaciones en llama.cpp, Ollama y LM Studio.

El modelo cuantizado conserva el proyector de vision (`mmproj` en BF16) para uso multimodal de imagen-texto a texto. Los parametros totales declarados son 176.943.899.520 (~176,9 mil millones), de los cuales 51,2 mil millones corresponden a una tabla de embedding n-grama por capa (`per_layer_token_embd`) que se mantiene fija en IQ4_NL porque es una tabla de busqueda, no un peso de multiplicacion matricial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), 48 capas, 512 expertos enrutados por capa, 10 activos por token; incluye proyector de vision |
| Parametros totales | 176.943.899.520 (~176,9 B), segun safetensors |
| Parametros activos | No disponible (la model card indica 512 expertos con 10 activos por token, pero no publica el recuento de parametros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q2_0 (2,40 bpw), IQ2_XS (2,50 bpw) e IQ3_XXS (3,00 bpw) para los pesos del transformer; IQ4_NL (4,5 bpw fijos) para la tabla n-grama `per_layer_token_embd`; BF16 para el `mmproj` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, dos fragmentos (shards) por variante cuantizada, mas un fichero `mmproj` independiente |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Tamano del repositorio | 153,6 GB |
| Autores del metodo de cuantizacion | DASLab (ISTA): GSQ y RCO |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Sobre el entrenamiento del modelo base (Qwen3.8-Flash-Next) no se aporta informacion en los datos disponibles: no se indica el volumen de tokens, la composicion del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si se describe con detalle es el proceso de cuantizacion posterior al entrenamiento (PTQ), que consta de dos componentes. GSQ realiza cuantizacion escalar de bajo bit por tensor aprendiendo conjuntamente las asignaciones de la rejilla por coordenada y las escalas por grupo mediante una relajacion Gumbel-Softmax, y cierra buena parte de la brecha entre cuantizacion escalar y vectorial en el rango de 2 a 3 bits manteniendo formatos escalares desplegables en GGUF. RCO asigna uno de K tipos de cuantizacion a cada uno de los N tensores bajo un presupuesto de tamano total, reformulando la restriccion como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la perdida de tarea sin hiperparametros especificos de la restriccion.

En este modelo concreto, la asignacion de precision se hace por capa y no por experto, porque el formato GGUF no puede expresar granularidad por experto. El segundo fragmento de cada variante es identico en las tres: contiene la tabla `per_layer_token_embd` de 51,2 mil millones de parametros en IQ4_NL (28,8 GB), excluida de la busqueda por tratarse de una tabla de consulta. Las matrices de expertos dominan tanto el recuento de parametros como el presupuesto de tamano, de ahi que la busqueda concentre en ellas la mayor parte de su libertad.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y la relacion con el modelo base indican uso de chat multi-turno.
- Comprension de imagen-texto a texto: el pipeline declarado es `image-text-to-text` y el repositorio incluye el proyector de vision `mmproj-Qwen3.8-Flash-Next-BF16.gguf`, por lo que admite entradas de imagen junto a texto.
- Inferencia eficiente por activacion dispersa: al activar 10 de 512 expertos por token, el coste de computo por token es muy inferior al de un modelo denso de 176,9 B de parametros.
- Despliegue en herramientas de inferencia locales: los ficheros son GGUF estandar y se ejecutan sin modificaciones en llama.cpp, Ollama y LM Studio.
- Tres compromisos de calidad/velocidad preconstruidos: Q2_0 orientado a throughput, IQ2_XS al minimo tamano con calidad equivalente e IQ3_XXS a la maxima calidad de la seleccion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio).
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no documentado.

## Casos de uso

- Despliegue multimodal on-premise en una GPU de 80 GB: la variante IQ3_XXS (75,8 GB) esta pensada para caber en aceleradores como A100 80 GB o H100 80 GB, lo que permite servir un modelo de 176,9 B con vision sin depender de APIs externas.
- Servicio de chat con imagenes a alta concurrencia: la variante Q2_0 ofrece 3,4 veces el throughput de prompt y 1,9 veces menos latencia extremo a extremo que IQ2_XS con un tamano de fichero ligeramente menor, y su tasa de decodificacion se mantiene estable en lugar de variar con el contenido.
- Analisis de documentos escaneados: el proyector de vision en BF16 (0,91 GB) permite alimentar capturas, diagramas o paginas digitalizadas y obtener texto o resumenes, usando la misma copia del `mmproj` para las tres cuantizaciones.
- Asistentes conversacionales de dominio acotado: la naturaleza conversacional del modelo base y la dispersion MoE permiten mantener sesiones multi-turno en las que solo se activa una fraccion pequena de los expertos por token.
- Prototipado e investigacion sobre cuantizacion no uniforme: el repositorio sirve como material de estudio reproducible de GSQ y RCO, ya que publica tres presupuestos de bits distintos del mismo modelo y los scripts de asignacion estan disponibles en GitHub.
- Inferencia hibrida CPU+GPU en estaciones de trabajo: al ser GGUF y estar dividido en dos fragmentos, llama.cpp puede repartir capas entre VRAM y RAM del sistema, lo que permite ejecutar el modelo sin un acelerador de 80 GB dedicado, a costa de menor velocidad.
- Evaluacion comparativa de tecnicas de compresion: las tres variantes comparten el mismo segundo fragmento (28,8 GB, IQ4_NL), de modo que cualquier diferencia de calidad medida entre ellas es atribuible exclusivamente al reparto de precision en los pesos del transformer.
- Nota de cautela: no se han documentado en la informacion disponible capacidades concretas de generacion de codigo, matematicas o uso de herramientas, por lo que esos escenarios requeririan verificacion previa sobre el modelo base.

## Benchmarks y rendimiento

La model card publica un unico agregado comparativo ("task average" frente a bit-width medio) y una afirmacion cualitativa sobre AIME25. No se ofrece el desglose por benchmark (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Variante | bpw medio | Tamano total | Task average | Notas de referencia |
|---|---|---|---|---|
| Q2_0 | 2,40 | 66,4 GB | 89,07 | La mas rapida; 3,4x throughput de prompt y 1,9x menos latencia que IQ2_XS |
| IQ2_XS | 2,50 | 68,0 GB | 89,16 | El menor tamano a igualdad de calidad |
| IQ3_XXS | 3,00 | 75,8 GB | 3,5 puntos por encima de Q2_0 (valor exacto no publicado) | Recomendada; iguala al modelo base en AIME25 |
| mmproj (BF16) | 16 | 0,91 GB | No aplica | Codificador de vision y proyector |

No se han publicado resultados de benchmarks detallados por tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV ni overhead del runtime): Q2_0 ~66,4 GB, IQ2_XS ~68,0 GB, IQ3_XXS ~75,8 GB. Sumando cache KV, buffers de contexto y overhead, conviene reservar entre 5 y 10 GB adicionales segun la longitud de contexto configurada.
- GPU recomendadas para descarga completa de pesos: A100 80 GB, H100 80 GB o H200 (141 GB) para IQ3_XXS; A100 80 GB es suficiente para Q2_0 e IQ2_XS con margen ajustado.
- Multi-GPU: dos aceleradores de 48 GB (por ejemplo A6000 o L40S) suman 96 GB y permiten las tres variantes repartiendo capas.
- GPU de consumo: no cabe en una sola RTX 4090 o RTX 5090 (24 GB). Es viable en configuracion hibrida con dos GPU de consumo (48 GB de VRAM) mas descarga parcial en RAM del sistema (se recomienda un minimo de 64 GB de RAM). El `mmproj` de BF16 (0,91 GB) no supone una restriccion relevante.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio de forma nativa, segun la model card. El formato GGUF de dos fragmentos requiere que el runtime cargue ambos shards y el `mmproj` para uso multimodal.
- Latencia y throughput: solo se dispone de datos relativos. Q2_0 ofrece 3,4x el throughput de prompt y 1,9x menos latencia extremo a extremo que IQ2_XS, con una tasa de decodificacion estable independiente del contenido. No hay cifras absolutas de tokens por segundo publicadas.
- Almacenamiento: el repositorio completo ocupa 153,6 GB; conviene descargar unicamente la variante y el `mmproj` necesarios.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos comparables (parametros, contexto, rendimiento, licencia) en la informacion proporcionada. La comparativa mas informativa disponible es interna al propio repositorio, entre las tres cuantizaciones del mismo modelo base:

| Variante | bpw | Tamano | Calidad relativa | Velocidad relativa | Uso recomendado |
|---|---|---|---|---|---|
| Q2_0 | 2,40 | 66,4 GB | 89,07 de task average | 3,4x prompt throughput y 1,9x menor latencia frente a IQ2_XS; decodificacion estable | Escenarios donde prima el throughput |
| IQ2_XS | 2,50 | 68,0 GB | 89,16 de task average | Menor que Q2_0 | Cuando prima el tamano minimo |
| IQ3_XXS | 3,00 | 75,8 GB | 3,5 puntos por encima de Q2_0; iguala al base en AIME25 | No publicada | Opcion recomendada por el autor |
| Base Qwen/Qwen3.8-Flash-Next (BF16) | 16 | No disponible | Referencia de calidad | No disponible | Entrenamiento o evaluacion de referencia |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y su model card reproduce el texto del lanzamiento de IST-DASLab, incluyendo referencias a un repositorio distinto del que lo aloja. Conviene verificar la procedencia y la integridad de los ficheros antes de usarlos en produccion.
- La model card disponible esta truncada (termina abruptamente en la seccion de rendimiento), por lo que puede faltar informacion sobre requisitos, uso previsto y limitaciones declaradas por el autor.
- La cuantizacion a 2,40-3,00 bits introduce perdida de calidad medible: 89,07-89,16 de task average en las variantes de 2 bits, frente a 3,5 puntos mas en IQ3_XXS. No se documenta la degradacion frente al modelo base en BF16.
- El modelo es cuantizado, no entrenado por el autor del repositorio; los sesgos del modelo base se heredan sin mitigacion adicional. No se documentan sesgos especificos ni evaluaciones de seguridad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se aportan evaluaciones de factualidad ni de tasas de alucinacion.
- El campo de idiomas esta vacio, por lo que no hay garantia documentada de cobertura multilingue ni del castellano en particular.
- No se documentan longitud de contexto, parametros activos ni el rendimiento en tareas especificas (codigo, matematicas, tool calling), lo que limita la planificacion de capacidad en produccion.
- La cuantizacion de bajo bit y el uso de formatos con tablas de busqueda grandes pueden afectar a la latencia de decodificacion; el propio autor advierte que en este modelo ese coste domina la inferencia, de ahi la existencia de la variante Q2_0.
- La tabla `per_layer_token_embd` (51,2 B de parametros, 28,8 GB) se mantiene fija en IQ4_NL en todas las variantes; no es ajustable y condiciona el tamano minimo desplegable.
- Licencia Apache 2.0 declarada en el repositorio: permite uso comercial, pero conviene confirmar que la licencia del modelo base Qwen/Qwen3.8-Flash-Next es compatible, ya que la model card no detalla los terminos de la licencia base.
- El uso multimodal exige cargar el `mmproj`; sin el, el modelo solo procesa texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/taurusduan/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de referencia citado en la model card (ISTA-DASLab): https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Paper de GSQ (arXiv:2604.18556): https://arxiv.org/abs/2604.18556
- Paper de RCO (arXiv:2605.00649): https://arxiv.org/abs/2605.00649
- Codigo de GSQ: https://github.com/IST-DASLab/GSQ
- Codigo de RCO: https://github.com/IST-DASLab/RCO
- Laboratorio DASLab (ISTA): https://github.com/IST-DASLab
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente paginas de un showroom de electrodomesticos), por lo que no se anaden mas enlaces.
