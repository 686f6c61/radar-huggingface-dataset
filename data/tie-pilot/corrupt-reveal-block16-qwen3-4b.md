# TIE-Pilot/corrupt-reveal-block16-qwen3-4b

## Resumen

`TIE-Pilot/corrupt-reveal-block16-qwen3-4b` es un modelo borrador (draft model) para decodificacion especulativa, no un modelo de chat. Se trata de una red de 5 capas que propone bloques de 16 tokens que el modelo objetivo Qwen/Qwen3-4B acepta o rechaza, y que ademas actua como su propio refinador: una unica copia de pesos soporta K rondas de refinamiento iterativo desplazando el argmax del propio modelo y volviendo a predecir. El checkpoint alojado en el repositorio declara 1.315.339.520 parametros (unos 1,3 mil millones) en safetensors, con licencia Apache 2.0.

Su interes es doble. Tecnicamente, documenta la receta de entrenamiento corrupt-reveal (un unico forward, sin rollout de self-forcing), disenada para corregir el sesgo de exposicion del teacher forcing, y demuestra una transferencia de pesos limpia desde un drafter block-7 ya entrenado a una configuracion block-16 sin desajuste de formas, porque `block_size` y `num_anchors` solo entran por RoPE, la mascara de flex-attention y los `position_ids`.

Ahora bien, el autor lo publica como archivo de una linea de investigacion descartada: la propia model card avisa de que no es el drafter recomendado (lo es `TIE-Pilot/dspark-attnconv-block7-qwen3-4b`) y de que el refinamiento es una palanca de longitud de aceptacion, no de velocidad: a temperatura 1.0 pierde velocidad a cualquier K, y su mejor resultado real procede de una variante posterior con embedding y cabeza LM congelados (`frozen_na512_step_3500/`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 5 capas con drafting por bloques (block-diffusion) sobre el tokenizador y el espacio de representacion de Qwen3-4B |
| Parametros totales | 1.315.339.520 (checkpoint raiz, safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la ventana efectiva la fija el modelo objetivo Qwen3-4B, no el drafter) |
| Bloque de draft | 16 tokens (con `num_anchors=256` en la ejecucion original y `num_anchors=512` en la variante congelada) |
| Rondas de refinamiento | K configurable; los resultados publicados cubren K=1, K=3 y K=8 |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible (el repositorio no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base / objetivo | Qwen/Qwen3-4B |
| Tamano del repositorio | 7,9 GB (contiene cuatro checkpoints) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa de 5 capas que opera sobre bloques de 16 tokens. En la ronda 0 actua como proponente base; en las rondas siguientes recibe su propio argmax y vuelve a predecir, de modo que un unico conjunto de pesos cubre K rondas de refinamiento. Los parametros `block_size` y `num_anchors` no son parametros de la red: solo influyen a traves de RoPE, la mascara de flex-attention y los `position_ids`. Por eso los pesos oficiales block-7 DFlash cargan en un modelo `block_size=16` sin ningun desajuste de formas. Ademas, la ranura 0 siempre lleva el token ancla y nunca MASK, algo que las versiones previas del script forzaban a MASK y lastraban al modelo base.

La receta de entrenamiento es **corrupt-reveal**, de un solo forward y sin rollout de self-forcing. Por bloque, con probabilidad 0,5 el bloque se aumenta; una fraccion aleatoria ρ~U(0,1) de sus posiciones revela sus tokens verdaderos, y de esos tokens revelados un 25% se sustituye por un token aleatorio. La entropia cruzada se calcula sobre el gold en todas las posiciones. La mascara permanece causal y los objetivos siguen desplazados, de modo que el procedimiento no filtra informacion. La receta ensena simultaneamente a usar el prefijo causal y a corregir un prefijo erroneo, que es lo que ataca el sesgo de exposicion del teacher forcing. Segun la model card, la etapa corrupt-reveal es determinante: su coste en K=1 es de −0,05 macro en bloque 16 y exactamente cero en bloque 7 (el impuesto se concentra en las ranuras de extension 8–16), mientras que su beneficio en refinamiento es de +0,87 y es exclusivo, ya que un modelo entrenado sin ella colapsa al refinar (−1,5) porque los prefijos parcialmente revelados quedan fuera de distribucion. Tambien se documenta que saltarse la etapa 1 e ir directamente a self-forcing falla de forma silenciosa: la perdida baja de manera suave mientras la aceptacion se hunde.

Sobre la transferencia block-7 → block-16: un modelo block-16 entrenado desde cero es debil (GSM8K real 3,99) y no existe publicacion oficial block-16. En la inicializacion por transferencia, la base ronda 0 ≈ 5,9 y el refinamiento cae a ≈ 3,9 porque DFlash nunca vio prefijos revelados, pero el entrenamiento arregla el refinador en pocos pasos mientras la base se mantiene.

## Capacidades

- Generacion de propuestas de draft: produce bloques de 16 tokens que el modelo objetivo Qwen3-4B verifica y acepta o rechaza. No genera respuestas finales por si mismo.
- Refinamiento iterativo interno: hasta K rondas sobre el mismo bloque, reinyectando su propio argmax como contexto parcial.
- Aceptacion alta en tareas de cadena larga estructurada: matematicas y razonamiento, donde supera al drafter DSpark block-7 en longitud media de aceptacion (GSM8K 7,46 frente a 6,19; MATH-500 6,13 frente a 5,70; HumanEval 5,85 frente a 5,38).
- Restriccion de vocabulario en refinamiento: las rondas de refinamiento pueden limitarse a los 30 tokens mas probables de la ronda 0 sin perdida de aceptacion en las pruebas realizadas; el token refinado final cae dentro del top-100 de la ronda 0 en el 97% de las posiciones cambiadas.
- Soporte de tool calling / function calling: no aplica (no es un modelo de instrucciones ni de dialogo).
- Soporte de agentes y razonamiento multi-paso: no aplica al drafter; se limita a proponer tokens para el modelo objetivo.
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de refinamiento en K rondas, ranura ancla en la posicion 0, y variante con embedding y cabeza LM congelados a los del objetivo (`frozen_na512_step_3500/`).

## Casos de uso

- Aceleracion de inferencia de Qwen3-4B en matematicas y razonamiento: el drafter alcanza una longitud media de aceptacion de 7,46 en GSM8K y 6,13 en MATH-500 a temperatura 1.0, por encima de DSpark block-7, por lo que es util en servicios donde el trafico dominante son cadenas de razonamiento largas y verificables.
- Reduccion de latencia en modo greedy: la transferencia a bloque 16 aporta un +7% de velocidad (5,96× frente a 5,58× de DSpark block-7 en GSM8K greedy con K=1), que es el unico beneficio de velocidad duradero que el autor reivindica.
- Generacion de codigo con validacion por el objetivo: en HumanEval el modelo logra 5,85 de aceptacion y en MBPP 5,12, lo que lo hace aprovechable como drafter en pipelines de autocompletado o generacion de parches donde el codigo final lo emite y verifica Qwen3-4B.
- Investigacion sobre decodificacion especulativa: sirve como material reproducible para estudiar el intercambio entre numero de rondas de refinamiento, coste de draft y ganancia de velocidad, con la formula τ/(1+K·r) y r ≈ 0,14–0,22.
- Experimentos de transferencia de pesos entre tamanos de bloque: al cargar pesos block-7 en una configuracion block-16 sin desajuste de formas, permite aislar el efecto del tamano de bloque del efecto de los datos de entrenamiento.
- Ablaciones de recetas de entrenamiento: el repositorio documenta variantes con y sin corrupt-reveal, con y sin self-forcing directo, y con distintos numeros de anclas (256 frente a 512), utiles para replicar los hallazgos sobre colapso silencioso y fuera de distribucion.
- Latencia en batch 1 con vocabulario restringido: limitar las rondas de refinamiento al top-30 de la ronda 0 es neutral en aceptacion y supone una ganancia de latencia en batch 1; a medida que crece el batch, la union de filas activadas del vocabulario se aproxima al vocabulario completo y la ventaja desaparece.
- Punto de partida para un modelo congelado: la variante `frozen_na512_step_3500/` iguala sus numeros offline con los de servicio y mejora la linea original (GSM8K real base K=1 7,48 frente a 6,80; refinamiento K=8 9,06 frente a 8,89), lo que la hace preferible en cualquier despliegue que requiera previsibilidad entre evaluacion y produccion.

## Benchmarks y rendimiento

Longitud media de aceptacion (τ) a temperatura 1.0 y con la cabeza de confianza desactivada, segun el protocolo del articulo citado en la model card. El arnes se valido contra las cifras publicadas antes de medir (DFlash propio 5,46 frente a 5,40 publicado; DSpark propio 6,19 frente a 6,11 publicado), de modo que las cifras son comparables y no autoevaluadas.

| Tarea | corrupt-reveal block-16, K=8 | DSpark block-7 |
|---|---|---|
| GSM8K | 7,46 | 6,19 |
| MATH-500 | 6,13 | 5,70 |
| HumanEval | 5,85 | 5,38 |
| MBPP | 5,12 | 5,13 |
| LiveCodeBench | 4,82 | 4,86 |
| AIME25 | 4,67 | 4,89 |
| MT-Bench | 3,30 | 3,64 |
| Arena-Hard | 2,83 | 3,29 |

Aceleracion frente a decodificacion autorregresiva en GSM8K greedy, con τ/(1+K·r) y r = T_draft/T_target ≈ 0,14–0,22:

| Configuracion | Aceleracion frente a AR |
|---|---|
| Base block-16, K=1 | 5,96× |
| DSpark block-7 | 5,58× |
| Este modelo, K=3 | ≈ empate |
| Este modelo, K=8 | 4,11× (−26%) |

GSM8K real, ejecucion original (`num_anchors=256`) frente a la variante congelada (`num_anchors=512`):

| Variante | Base, K=1 | Refinamiento, K=8 |
|---|---|---|
| Original | 6,80 | 8,89 |
| Congelada (embedding y cabeza LM del objetivo) | 7,48 | 9,06 |

Datos adicionales reportados: base block-16 entrenada desde cero en GSM8K real, 3,99; base transferida en la inicializacion, round-0 ≈ 5,9 con refinamiento ≈ 3,9; aceptacion en posicion 0 de 0,739 (bloque 16) frente a 0,766 (bloque 7); la variante congelada elimina la deriva del −5% entre numeros offline y de servicio.

## Requisitos de hardware

- Peso del drafter: 1.315.339.520 parametros implican aproximadamente 2,63 GB en BF16/FP16, 1,32 GB en FP8/INT8 y 0,66 GB en INT4. Son estimaciones aritmeticas a partir del recuento de parametros; el repositorio no publica cuantizaciones.
- El drafter no funciona de forma aislada: requiere el modelo objetivo Qwen3-4B cargado en memoria. En BF16, el par completo ocupa del orden de 10,7 GB, sin contar la cache KV ni el estado del motor de inferencia.
- GPU de consumo: cabe con holgura en RTX 4090 o RTX 3090 (24 GB). En tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) solo es viable con el objetivo cuantizado.
- GPU de datacenter: A100 40/80 GB y H100 estan sobredimensionadas para este par; solo se justifican si se busca batchear agresivamente o servir varios modelos objetivo a la vez.
- Opciones de despliegue: no disponible. La model card menciona comparaciones entre numeros offline y de servicio y una ganancia de latencia en batch 1, pero no nombra el runtime. En cualquier caso hace falta un motor con decodificacion especulativa de drafter externo y tamano de bloque configurable.
- Latencia y throughput: los unicos datos publicados son las aceleraciones relativas de la tabla anterior (5,96× greedy con la base block-16 en K=1; 4,11× con K=8) y el coste relativo de draft r ≈ 0,14–0,22. No hay cifras absolutas de tokens por segundo ni de latencia por peticion.
- Cache KV y memoria de activaciones: no disponible.

## Comparativa con modelos similares

| Modelo | Tamano de bloque | Rondas | τ GSM8K (temp 1.0) | Aceleracion greedy vs AR | Estado segun el autor |
|---|---|---|---|---|---|
| corrupt-reveal block-16, K=8 (este modelo) | 16 | 8 | 7,46 | 4,11× | Archivado, no recomendado |
| corrupt-reveal block-16, base K=1 | 16 | 1 | no disponible en esa tabla | 5,96× | Transferencia desde block-7 |
| DSpark block-7 | 7 | 1 | 6,19 | 5,58× | Drafter recomendado por el autor |
| DFlash block-7 | 7 | 1 | 5,46 (validacion interna) frente a 5,40 publicado | no disponible | Referencia previa del proyecto |
| Base block-16 desde cero | 16 | 1 | 3,99 (GSM8K real) | no disponible | Descartada por debil |
| Variante congelada num_anchors=512 | 16 | 8 | 9,06 (GSM8K real, K=8) | no disponible | Mejor checkpoint de la linea |

No se dispone de parametros, contexto ni licencia de los drafters comparados mas alla de lo indicado; todos pertenecen al mismo proyecto y comparten el modelo objetivo Qwen/Qwen3-4B. Fuera de esta familia no se ha identificado en la informacion disponible un drafter publico equivalente para Qwen3-4B, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- No es un modelo utilizable de forma autonoma: sin el modelo objetivo Qwen3-4B no produce respuestas, y no debe presentarse como modelo de chat ni de instrucciones.
- El propio autor lo califica de archivo de una linea de investigacion descartada y recomienda otro drafter (`dspark-attnconv-block7-qwen3-4b`) para uso real.
- El refinamiento iterativo no es una palanca de velocidad: cada ronda se paga completa. Con K=8 la aceleracion cae un 26% (4,11× frente a 5,96×), y a temperatura 1.0 el modelo pierde velocidad en todos los valores de K probados. El unico beneficio duradero es la transferencia a bloque 16, +7% y solo en modo greedy.
- El tamano de bloque 16 depende de la distribucion de la tarea: gana en trabajos de aceptacion larga (matematicas, razonamiento) y pierde en dialogo de aceptacion corta, donde la longitud aceptada es de unos 3 tokens y las posiciones profundas se desperdician mientras la dilucion de capacidad empeora ligeramente las posiciones tempranas. Esto no es falta de entrenamiento: se mantiene plano del paso 1500 al 3000.
- Deriva entre evaluacion y servicio: la ejecucion original presenta un hueco de hasta el −5% entre numeros offline y de servicio. La variante congelada lo elimina.
- No existe estado del optimizador en ningun paso de esta linea, por lo que el entrenamiento no puede reanudarse desde estos pesos: son un archivo, no un punto de partida.
- Riesgo de alucinacion: el texto final lo emite el modelo objetivo, de modo que el drafter no anade contenido propio, pero tampoco lo filtra; las alucinaciones de Qwen3-4B se mantienen integras.
- Idiomas: no se declara soporte multilingue y no se han publicado evaluaciones por idioma.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Licencia: Apache 2.0, que permite uso comercial; el modelo base Qwen/Qwen3-4B se distribuye tambien bajo Apache 2.0 segun el repositorio, aunque conviene verificar los terminos vigentes del modelo objetivo antes de un despliegue en produccion.
- Advertencia practica: la restriccion del refinamiento al top-30 del vocabulario solo aporta latencia en batch 1; con lotes grandes la union de filas activadas se acerca al vocabulario completo y la ventaja se diluye.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TIE-Pilot/corrupt-reveal-block16-qwen3-4b
- Drafter recomendado por el autor: https://huggingface.co/TIE-Pilot/dspark-attnconv-block7-qwen3-4b
- Modelo base y objetivo: https://huggingface.co/Qwen/Qwen3-4B
- Paper, blog o repositorio del proyecto: no disponible en la informacion proporcionada.
- Los resultados de la busqueda web realizados no devolvieron material relevante: todas las entradas encontradas corresponden al termino ingles «tie» en diccionarios y enciclopedias generalistas (Larousse, Linguee, Wikipedia, Reverso, WordReference) y no guardan relacion con el modelo.
