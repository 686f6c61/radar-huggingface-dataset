# XINLI1997/DN-MOPD-Qwen3.5-2B-baseline-label

## Resumen

DN-MOPD-Qwen3.5-2B-baseline-label es un ajuste fino del modelo Qwen/Qwen3.5-2B (2.213.241.664 parametros) publicado por el usuario XINLI1997 como la variante **baseline "Label"** del articulo *Beyond Teacher Assignment: Domain-Normalized Multi-Teacher On-Policy Distillation* (arXiv:2609.35347). No es el metodo propuesto: es la referencia de comparacion frente a la que se mide DN-MOPD. La tecnica aplicada es destilacion on-policy multi-profesor con enrutado por etiqueta (label routing): cada prompt lleva una etiqueta de dominio (matematicas, codigo o seguimiento de instrucciones) y es puntuado por el experto de ese dominio, con todos los multiplicadores de dominio fijados a 1.

El modelo parte del checkpoint multimodal Qwen3.5-2B (pipeline `image-text-to-text`, con encoder de vision heredado), pero el entrenamiento y la evaluacion se hicieron exclusivamente con texto y en formato de chat **non-thinking** (`enable_thinking=False`). El entrenamiento es muy corto: 80 actualizaciones desde el modelo base, con 2.700 prompts de entrenamiento (900 por dominio) y 512 respuestas por actualizacion.

Su relevancia es fundamentalmente metodologica: sirve como linea base reproducible para estudiar como se comporta la destilacion on-policy con multiples profesores del mismo tamano cuando el enrutado es por etiqueta. En los resultados del articulo, este baseline queda por debajo del estudiante inicial de Qwen3.5-2B en matematicas (17.0 frente a 17.6) y solo mejora en codigo (13.4 frente a 11.3) e instrucciones (49.5 frente a 43.3), mientras que DN-MOPD supera a ambos. La licencia es Apache-2.0, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; clase `Qwen3_5ForConditionalGeneration` (transformers), modelo multimodal texto-imagen con encoder de vision heredado del base. El checkpoint base contiene 15 tensores `mtp.*` (multi-token prediction) |
| Parametros totales | 2.213.241.664 (2,21 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible de forma explicita; el `config.json` es el del modelo base sin cambios y el ejemplo de vLLM se lanza con `max_model_len=32768` |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, formato Hugging Face (exportado desde un checkpoint de entrenamiento FSDP). Se omiten los 15 tensores `mtp.*` |
| Precision | bfloat16 |
| Formato de chat | non-thinking, requiere `enable_thinking=False` |
| Tamano del repositorio | 4,4 GB |
| Descargas / likes | 8 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-2B (`Qwen3_5ForConditionalGeneration`), un modelo denso de 2,21 B de parametros con torre de vision. El autor no describe en la model card la composicion interna de la red (numero de capas, atencion, etc.), pero si indica que el encoder de vision se arrastra sin cambios y que ni el entrenamiento ni la evaluacion lo utilizaron. El checkpoint base dispone de 15 tensores de multi-token prediction (`mtp.*`) que **no** se exportaron en este modelo, por lo que la decodificacion especulativa basada en MTP no esta disponible con estos pesos; la decodificacion ordinaria no se ve afectada.

El entrenamiento aplica destilacion on-policy multi-profesor (MOPD) con enrutado por etiqueta. Se usan tres profesores del mismo tamano (2B) especializados en matematicas, codigo e instruction following: teacher-math, teacher-code y teacher-if. Cada prompt lleva etiqueta de dominio y es puntuado por el experto correspondiente, con todos los multiplicadores de dominio `w_d = 1` (esta es precisamente la diferencia con DN-MOPD, que reescala la senal de cada dominio). La ventaja por token es la log-probabilidad del profesor menos la log-probabilidad del estudiante recalculada por el actor, usada en una perdida OPD de policy gradient con recorte (ratio clip 0,2/0,2), sin termino KL ni de entropia. Hiperparametros: 2.700 prompts (900 por dominio), 64 prompts x 8 respuestas = 512 respuestas por actualizacion, prompt de hasta 2.048 tokens, respuesta de hasta 8.192 tokens, temperatura 1,0, optimizador Adam con lr 1e-6 constante tras 5 actualizaciones de warm-up, betas (0,9; 0,98), weight decay 0,1, gradient clipping 1,0, una sola etapa de optimizador por lote de rollout, semilla del estudiante 42 y 80 actualizaciones totales. Los scripts completos estan en `recipes/qwen3.5/` del repositorio de codigo.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat no-thinking.
- Razonamiento matematico de competicion: la evaluacion usa AIME25 y AIME26 con avg@64.
- Generacion y razonamiento sobre codigo: evaluado en LiveCodeBench v5 y v6 (167 y 175 problemas disjuntos) con avg@6.
- Seguimiento de instrucciones estrictas: IFEval e IFBench con exactitud estricta de prompt, avg@16. Es el dominio donde el modelo rinde mejor (49,5 %).
- Capacidad multimodal potencial: el encoder de vision se conserva del modelo base, pero no fue entrenado ni evaluado; su comportamiento no esta verificado.
- Soporte de tool calling / function calling: no disponible / no documentado en la informacion proporcionada.
- Soporte explicito de agentes y multi-step reasoning: no disponible / no documentado.
- Modo de razonamiento extendido (thinking): no soportado en el formato entrenado; se debe usar `enable_thinking=False`.
- Multilingue: no; solo ingles declarado.
- Decodificacion especulativa con MTP: no disponible (tensores `mtp.*` omitidos en la exportacion).

## Casos de uso

- **Linea base en investigacion sobre destilacion on-policy**: es exactamente el proposito declarado del checkpoint. Un grupo que quiera reproducir o auditar los resultados de arXiv:2609.35347 puede lanzar este modelo junto con DN-MOPD-Qwen3.5-2B bajo los mismos ajustes (temperatura 1,0, top-p 1,0, tope de 16.384 tokens, semilla 42) para comprobar la diferencia de 2,4 puntos en el total.
- **Punto de partida para destilacion adicional o RL posterior**: al ser un estudiante de 2,21 B con licencia Apache-2.0 y pesos en safetensors, se puede continuar el entrenamiento con nuevas recetas de RL o destilacion sin restricciones legales, usando el repositorio de recetas del autor como referencia de hiperparametros.
- **Generacion de codigo asistida en pipelines internos**: con un 13,4 % en LiveCodeBench, el modelo es adecuado para autocompletado, generacion de tests unitarios o tareas de codigo con verificacion humana posterior, no para sustitucion autonoma de un desarrollador.
- **Extraccion y formateo de datos con instrucciones estrictas**: su mejor dominio es el seguimiento de instrucciones (49,5 % en IFEval/IFBench); encaja en tareas de conversion de texto libre a JSON, normalizacion de campos o reformateo de documentos donde el formato de salida es rigido.
- **Tutoria y practica de matematicas a nivel de secundaria/bachillerato**: el modelo puede resolver y explicar problemas aritmeticos y algebraicos paso a paso, con la advertencia de que su rendimiento en competicion (17,0 % en AIME) obliga a validar las respuestas.
- **Despliegue en hardware de consumo para prototipos**: con 2,21 B de parametros los pesos en bfloat16 ocupan unos 4,4 GB, por lo que el modelo cabe en GPU de gama media y en equipos de sobremesa, lo que abarata las pruebas de concepto frente a alternativas de 7 B o mas.
- **Evaluacion comparativa de estudiantes pequenos**: util como referencia de "estudiante de 2B entrenado con 80 actualizaciones" al medir el efecto de tecnicas de destilacion en la franja de 2 B de parametros.
- **Generacion de texto general en ingles**: redaccion de borradores, resumen y respuestas conversacionales de un solo turno o multi-turno corto, siempre en ingles y sin modo thinking.

## Benchmarks y rendimiento

Resultados de la tabla 2 del articulo (Qwen3.5-2B; cada dominio promedia dos tareas: AIME25/AIME26, LiveCodeBench v5/v6, IFEval/IFBench). Porcentajes en %:

| Modelo | Math | Code | IF | Total |
|---|:---:|:---:|:---:|:---:|
| DN-MOPD-Qwen3.5-2B-baseline-label (Label, MOPD con enrutado por etiqueta) | 17,0 | 13,4 | 49,5 | 26,6 |
| DN-MOPD-Qwen3.5-2B (metodo propuesto) | 20,7 | 16,3 | 49,9 | 29,0 |
| Estudiante inicial (Qwen3.5-2B) | 17,6 | 11,3 | 43,3 | 24,0 |

Ajustes de evaluacion: semilla de entrenamiento 42, tope de 16.384 tokens (8.192 en el apendice), plantilla de chat non-thinking, temperatura 1,0, top-p 1,0, semilla de generacion 42. AIME25/AIME26 con avg@64; LiveCodeBench v5/v6 con avg@6; IFEval/IFBench con exactitud estricta de prompt y avg@16. El total es la media de las seis puntuaciones de tarea.

## Requisitos de hardware

- **Pesos**: 2,21 B de parametros en bfloat16 equivalen a unos 4,4 GB, que coincide con el tamano del repositorio (4,4 GB).
- **VRAM estimada para inferencia**: en bfloat16/fp16, aproximadamente 5-6 GB contando cache KV y overhead del runtime; el cache KV crece con la longitud de contexto configurada, por lo que usar `max_model_len=32768` con respuestas de hasta 16.384 tokens exige margen adicional. En cuantizaciones de 8 bits serian del orden de 3 GB y en 4 bits del orden de 2 GB, aunque el autor no publica checkpoints cuantizados.
- **GPU recomendadas**: para el ajuste de evaluacion del articulo (vLLM 0.18.0) son razonables A100, H100 o L40S; para desarrollo cabe en RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB), RTX 4060 Ti (16 GB) y, en bfloat16, en tarjetas de 8 GB con contexto reducido.
- **Cabe en GPU de consumo**: si. Es un modelo de 2,21 B, apto para RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y equivalentes, siempre que se ajuste la longitud de contexto a la VRAM disponible.
- **Opciones de despliegue**: vLLM (la version usada en el articulo es 0.18.0, con `chat_template_kwargs={"enable_thinking": False}`), transformers con `AutoModelForImageTextToText` y `transformers>=5` (el entorno de entrenamiento uso 5.12.1), y servicios gestionados como FriendliAI. llama.cpp, Ollama y TGI no estan documentados para este checkpoint; requeririan conversion propia a GGUF, que no se publica. El despliegue con decodificacion especulativa MTP no es posible por la omision de los tensores `mtp.*`.
- **Latencia y throughput**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado (Math / Code / IF / Total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DN-MOPD-Qwen3.5-2B-baseline-label | 2,21 B | no disponible (ejemplo con 32.768) | 17,0 / 13,4 / 49,5 / 26,6 | Apache-2.0 | Hugging Face (XINLI1997) |
| DN-MOPD-Qwen3.5-2B | 2,21 B (mismo base) | no disponible | 20,7 / 16,3 / 49,9 / 29,0 | Apache-2.0 | Hugging Face (XINLI1997) |
| Qwen3.5-2B (estudiante inicial) | 2,21 B | no disponible | 17,6 / 11,3 / 43,3 / 24,0 | Apache-2.0 | Hugging Face (Qwen) |
| Profesores de mismo tamano (teacher-math, teacher-code, teacher-if) | 2,21 B cada uno | no disponible | no disponible en la informacion proporcionada | Apache-2.0 (heredada del base) | Hugging Face (XINLI1997) |

Segun el repositorio de codigo del proyecto, con enrutado por etiqueta MOPD no supera al mejor estudiante de un solo profesor en ninguna de las tres escalas probadas (9B, 4B y 2B), y DN-MOPD mejora a este baseline en todas las escalas.

## Limitaciones y advertencias

- **Es el baseline, no el metodo propuesto**: la propia model card advierte de que no supera al estudiante de un solo profesor mas fuerte en ningun tamano y de que DN-MOPD lo mejora en todas las escalas. No debe presentarse como el resultado principal del articulo.
- **Entrenamiento muy corto y dataset reducido**: 80 actualizaciones y 2.700 prompts (900 por dominio). El ajuste es limitado y puede no generalizar fuera de los tres dominios objetivo.
- **Riesgo de alucinacion**: con un 17,0 % en AIME y un 13,4 % en LiveCodeBench, las respuestas de matematicas y codigo no son fiables sin verificacion. En tareas de instrucciones el 49,5 % implica que la mitad de los prompts estrictos fallan.
- **Solo ingles**: el campo `language` declara unicamente `en`. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- **Solo formato non-thinking**: el modelo fue entrenado y evaluado con `enable_thinking=False`; usarlo con la plantilla de razonamiento puede degradar la calidad de forma no medida.
- **Capacidad de vision sin verificar**: el encoder de vision se hereda del base, pero ni el entrenamiento ni la evaluacion lo usaron; no hay garantias de que la salida multimodal sea coherente.
- **Sin decodificacion especulativa MTP**: los 15 tensores `mtp.*` se omitieron en la exportacion, de modo que no se puede aprovechar esa aceleracion con este checkpoint.
- **Sesgos**: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad en la informacion proporcionada. Al derivar del modelo base, hereda los sesgos de sus datos de entrenamiento, no auditados aqui.
- **Licencia**: Apache-2.0, igual que el modelo base, por lo que el uso comercial esta permitido; conviene revisar igualmente los terminos del modelo base Qwen3.5-2B.
- **Adopcion practicamente nula**: 8 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad. Las fechas del repositorio son de octubre de 2026.
- **Sin cuantizaciones oficiales**: no hay GGUF, AWQ ni GPTQ publicados, lo que complica el despliegue en entornos sin GPU o con `llama.cpp`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B-baseline-label
- Modelo propuesto DN-MOPD-Qwen3.5-2B: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B
- Profesor de matematicas: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-math
- Profesor de codigo: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-code
- Profesor de instruction following: https://huggingface.co/XINLI1997/DN-MOPD-Qwen3.5-2B-teacher-if
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Articulo (arXiv): https://arxiv.org/abs/2609.35347
- Pagina del proyecto: https://lixin.ai/DN-MOPD
- Codigo y recetas: https://github.com/LiXin97/DN-MOPD
- Recetas para Qwen3.5: https://github.com/LiXin97/DN-MOPD/tree/main/recipes/qwen3.5
- Documentacion de la receta: https://github.com/LiXin97/DN-MOPD/blob/main/docs/recipe.md
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/XINLI1997/DN-MOPD-Qwen3.5-2B
- Ficha del Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
