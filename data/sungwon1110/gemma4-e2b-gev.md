# sungwon1110/gemma4-e2b-gev

## Resumen

Gev (gemma4-e2b-gev) es un modelo de decision de "System One" construido sobre `google/gemma-4-E2B` mediante un adaptador LoRA. No genera texto: recibe un documento (el *state*) y un conjunto de preguntas tipadas (Choice, Noul y Score) y devuelve, en una sola pasada hacia delante, una distribucion de probabilidad calibrada por pregunta. Su autor es el usuario de HuggingFace `sungwon1110` y sigue la arquitectura y la receta de Kev, una reconstruccion abierta del sistema Jev de TypeSafe, sustituyendo el backbone Qwen3.5 por Gemma 4 E2B y manteniendo la misma API `/v1/systemone`.

El modelo se publica como adaptador PEFT (0,1 GB) sobre el backbone congelado, con LoRA de rango 16 sobre las proyecciones de atencion y de la MLP (24,95 millones de parametros entrenables) mas una cabeza pointer heredada de Kev. El backbone es solo decodificador de texto: las torres de vision y audio de Gemma 4 se descartan en tiempo de carga. La temperatura de calibracion (1,74) viene preajustada en `head.pt`.

Su relevancia es acotada pero especifica: demuestra que un backbone Gemma 4 puede adoptar la interfaz de decision calibrada de Kev sin reentrenar el modelo base, con numeros ligeramente mejores que Kev-0.8B en las suites congeladas de este, aunque las diferencias no alcanzan significacion estadistica al 95 %. El modelo esta pensado para enrutado, clasificacion y evaluacion de reglas en ingles, no para generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 E2B) con adaptador LoRA y cabeza pointer de Kev; torres de vision y audio descartadas en carga |
| Parametros totales | no disponible (modelo base: `google/gemma-4-E2B`, commit `d29ff6b45f081a49ee2733a859c9c9c2d95d1a6f`) |
| Parametros activos | no aplica (no se describe arquitectura MoE) |
| Parametros entrenables | 24,95 millones (LoRA r=16, alpha=32) mas la cabeza pointer |
| Longitud de contexto | no disponible (en la verificacion de consistencia se cita un estado de 2.172 tokens) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; inferencia con `KEV_DTYPE=bf16` y pesos congelados en fp32) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) + `head.pt` (temperatura 1,74) |
| Libreria | peft |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

Gev reutiliza el backbone `google/gemma-4-E2B` congelado y le superpone un adaptador LoRA r=16, alpha=32 sobre `q/k/v/o_proj` y `gate/up/down_proj`, junto con la cabeza pointer de Kev (proyecciones query/key a 256 dimensiones sobre las posiciones de `<decide>` y de las opciones). Los delimitadores empleados son los tokens reservados de Gemma `<unused0>`…`<unused4>`, que no pueden ser forjados desde el texto del llamante, y se antepone un `<bos>`. Como las capas de ventana deslizante de Gemma 4 no pueden respetar la mascara block-causal empaquetada de Kev, cada pregunta se ejecuta como su propia fila causal continuando desde el estado cacheado, la misma forma que Kev usa con sus bases hibridas Qwen3.5. La ruta de entrenamiento y la de servicio cacheada coinciden con un error maximo de |Δp| de 1,1e-5 en fp32 con un estado de 2.172 tokens.

El entrenamiento consta de dos etapas sobre una unica GPU L40S (aproximadamente 1,5 h + 0,5 h). La primera aplica la receta base de Kev sobre la suite congelada `evals/v7/decision-v7` (diez fuentes publicas de clasificacion mas datos programaticos de politicas y composicion de reglas): 2 epocas, learning rate 5e-5, batch efectivo 8 (4 x 2 de acumulacion, con gradient checkpointing), autocast bf16 con pesos congelados en fp32, y aumentacion mediante permutacion de opciones, opcion "none-of-the-above" y distractores, con pares minimos de "none" en el 25 % de los registros de tipo Choice. Se excluyeron 70 de 12.576 registros (todos de banking77, con 77 clases) por exceder el contexto de entrenamiento con el tokenizador de Gemma. La segunda etapa es un ajuste delta con 7.200 registros nuevos de composicion de reglas generados desde `kev.composition` (las ocho formas de entrenamiento mas 120 estructuras aleatorias nuevas, excluyendo estructuras y estilo de renderizado reservados) mezclados con 2.000 registros de replay de la suite, con learning rate 4e-5 y 1 epoca. El motivo de esta segunda etapa fue corregir el sesgo a "deny" que presentaba el modelo tras la primera fase en casos de aceptacion de reglas programaticas; el minado de casos duros rindio peor que una muestra aleatoria del mismo tamano y se descarto.

## Capacidades

- Clasificacion de decision con probabilidades calibradas: devuelve una distribucion por pregunta en una sola pasada, sin generar texto.
- Preguntas tipadas: soporta tipos Choice (eleccion entre criterios), Noul (booleano) y Score.
- Evaluacion de politicas programaticas: resuelve composicion de reglas y estructuras de reglas no vistas durante el entrenamiento (0,688 en estructuras retenidas frente a 0,625 de Kev-0.8B).
- Clasificacion de lenguaje natural en dominios multiples: los mayores incrementos frente a Kev-0.8B en test se dan en SST-5 (+23,7 pp), TweetEval-offensive (+8,7), politicas contrastivas retenidas (+8,7) e IMDB (+7,5).
- Calibracion de incertidumbre: Brier y ECE fuera de dominio de 0,367 y 0,037, mejores que los 0,397 y 0,046 de Kev-0.8B.
- Servicio mediante API `/v1/systemone` compatible con la de Kev.
- No soporta generacion de texto, tool calling, function calling, agentes multi-paso, vision ni audio (las torres multimodales se eliminan en carga).
- Capacidad multilingue: no disponible; el modelo se declara unicamente en ingles.

## Casos de uso

- Enrutado de tickets de soporte: el ejemplo de la propia model card asigna un departamento (returns, shipping, billing) a partir del texto libre de un cliente y decide si requiere escalado humano, con una probabilidad calibrada que permite fijar umbrales de derivacion automatica.
- Triaje de reclamaciones multimotivo: un mismo *state* puede contener varias incidencias (retraso de envio y doble cargo) y el modelo responde a varias preguntas tipadas en una sola pasada, lo que evita trocear el documento en llamadas separadas.
- Moderacion de contenido con umbral estadistico: los incrementos en TweetEval-offensive y la calibracion ECE baja permiten usar la probabilidad devuelta como puntuacion continua en lugar de una etiqueta binaria dura.
- Clasificacion de sentimiento y resenas: el salto de +23,7 pp en SST-5 y +7,5 pp en IMDB frente a Kev-0.8B lo hace util para analisis de resenas de cinco clases y de polaridad.
- Motor de politicas y reglas de negocio: la mejora de 0,859 a 0,938 en composicion de reglas dentro de distribucion permite evaluar condiciones encadenadas (por ejemplo, elegibilidad de reembolso segun antiguedad, importe y motivo) sin escribir codigo ad hoc.
- Inferencia de intenciones en asistentes: como clasificador previo que decide a que herramienta o subagente derivar una consulta, antes de invocar un modelo generativo.
- Deteccion de ambiguedad o falta de informacion: el tipo Noul con opcion "none-of-the-above" y los pares minimos de entrenamiento permiten marcar casos en los que ninguna categoria encaja.
- Analisis por lotes de documentos: al no generar texto y resolver cada pregunta en una fila causal con estado cacheado, es adecuado para procesar volumenes altos de documentos con coste de decodificacion minimo.

## Benchmarks y rendimiento

Datos de la model card, sobre suites congeladas de Kev y test leido una sola vez, comparados con Kev-0.8B evaluado con el mismo harness en la misma maquina:

| Metrica | Kev-0.8B (publicado) | Gev | Δ pareado, IC 95 % (bootstrap agrupado por registro) |
|---|---|---|---|
| Precision fuera de dominio (transfer-v4 test, 656) | 0,697 | 0,726 | +2,9 pp [-1,2, +7,0], 85 victorias / 66 derrotas |
| Precision en distribucion (decision-v7 test, 1.200) | 0,838 | 0,839 | +0,2 pp [-1,9, +2,3] |
| Brier / ECE fuera de dominio | 0,397 / 0,046 | 0,367 / 0,037 | no disponible |
| Brier / ECE en distribucion | 0,231 / 0,019 | 0,229 / 0,023 | no disponible |

Splits de desarrollo (los mismos items en cada fila):

| Modelo | Fuera de dominio (transfer-v4 dev) | En distribucion (decision-v7 dev) | Composicion de reglas (en dist.) | Estructuras de reglas retenidas |
|---|---|---|---|---|
| Kev-0.8B publicado | 0,648 | 0,827 | 0,859 | 0,625 |
| Kev-0.8B etapa 1 (`v7-base`) | 0,642 | 0,829 | 0,828 | 0,667 |
| Gev | 0,683 | 0,835 | 0,938 | 0,688 |

Mayores diferencias por fuente en test frente a Kev-0.8B: SST-5 +23,7 pp, TweetEval-offensive +8,7, politicas contrastivas retenidas +8,7, IMDB +7,5; en negativo, banking77 -8,7, MNLI -8,7 y Yelp -3,7. El autor advierte que el checkpoint se eligio entre 10 candidatos sobre los splits de desarrollo, por lo que esas cifras son optimistas, y que las mejoras en test no son significativas al 95 %. No se publican resultados de MMLU, HumanEval ni GSM8K, que no aplican a un modelo que no genera texto.

## Requisitos de hardware

- No se especifican requisitos de VRAM para inferencia en la informacion disponible. El repositorio del adaptador ocupa 0,1 GB y el consumo dependera del backbone `google/gemma-4-E2B` completo, cuyas dimensiones exactas no se detallan.
- Entrenamiento: una unica GPU L40S, aproximadamente 1,5 h para la etapa base y 0,5 h para el ajuste delta, con autocast bf16 y pesos congelados en fp32.
- Cabeza en GPU consumer: no disponible; no hay datos confirmados sobre si el conjunto backbone mas adaptador entra en tarjetas de gama de consumo.
- Despliegue: el unico procedimiento documentado es `kev.serve` con `KEV_DTYPE=bf16`, previa aplicacion de `kev-gemma4.patch` sobre el repositorio de Kev en el commit `0c142be`. No se documentan rutas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Como referencia de coste, cada pregunta se resuelve como una fila causal adicional sobre el estado cacheado, y la ruta cacheada reproduce la de entrenamiento con un error maximo de |Δp| de 1,1e-5.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros entrenables | Precision fuera de dominio (test) | Precision en distribucion (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gev (gemma4-e2b-gev) | Gemma 4 E2B (solo texto) | 24,95 M (LoRA + cabeza) | 0,726 | 0,839 | apache-2.0 | adaptador PEFT en HuggingFace |
| Kev-0.8B | Qwen3.5 (hibrido) | no disponible | 0,697 | 0,838 | no disponible en la informacion proporcionada | publicado por su autor |
| Kev-0.8B etapa 1 (`v7-base`) | Qwen3.5 (hibrido) | no disponible | 0,642 (dev) | 0,829 (dev) | no disponible en la informacion proporcionada | checkpoint intermedio |

No se dispone de datos de otras alternativas de la misma categoria (clasificadores de decision calibrada con salida estructurada) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, por lo que no sirve para chat, resumen, traduccion ni codigo.
- Las mejoras frente a Kev-0.8B no son significativas al 95 % en las dos suites de test; los intervalos de confianza incluyen el cero.
- El checkpoint se selecciono entre 10 candidatos sobre los splits de desarrollo, de modo que las cifras de desarrollo (0,683 / 0,835 / 0,938 / 0,688) estan sesgadas al alza.
- Rendimiento desigual por fuente: pierde frente a Kev-0.8B en banking77 (-8,7 pp), MNLI (-8,7 pp) y Yelp (-3,7 pp).
- Idioma: solo ingles declarado; el castellano no esta soportado.
- Longitud de contexto no documentada; 70 de 12.576 registros de entrenamiento tuvieron que excluirse por exceder el contexto del tokenizador de Gemma, lo que indica un limite practico que conviene verificar antes de desplegar.
- La temperatura 1,74 esta ajustada sobre filas de desarrollo de decision-v7, es decir, en distribucion; la calibracion fuera de dominio puede degradarse aunque el ECE medido sea bajo (0,037).
- Dependencia de terceros: el modelo no funciona de forma autonoma, requiere el repositorio de Kev en el commit `0c142be` y la aplicacion de un parche especifico.
- Se descartan las torres de vision y audio de Gemma 4, por lo que no hereda ninguna capacidad multimodal.
- El adaptador se publica bajo apache-2.0, pero no se detallan en la informacion disponible los terminos de licencia del modelo base `google/gemma-4-E2B`, que conviene verificar antes de un uso comercial.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta.
- No esta afiliado a TypeSafe AI (Jev) ni al autor de Kev, y no fue entrenado con salidas de Jev.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungwon1110/gemma4-e2b-gev
- Repositorio de Kev (dependencia obligatoria): https://github.com/jaredpalmer/kev
- Parche para Gemma 4: https://huggingface.co/sungwon1110/gemma4-e2b-gev/resolve/main/kev-gemma4.patch
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- La busqueda web realizada no devolvio ningun enlace tecnico relevante sobre este modelo: los resultados obtenidos eran contenido no relacionado con el ambito de la ficha y se han descartado.
