# thomasliao/Lev

## Resumen

Lev es un conjunto de cabezales de decisión (heads) y adaptadores publicados por el usuario thomasliao como artefactos de hackathon, no un modelo de lenguaje completo. Se enmarcan en una arquitectura que el autor denomina "contrastive language model" (CLM) y "system one": un encoder congelado (Qwen3-8B para texto, CLIP ViT para visión) más cabezales de proyección pequeños entrenados con InfoNCE bidireccional, que puntúan un conjunto cerrado de acciones para juegos 2D simples como Flappy Bird y Tetris.

El problema que aborda es el control de decisión en milisegundos con salidas de conjunto cerrado, frente a alternativas tipo VLM que en las mediciones del propio autor tardaban en torno a 27 segundos por decisión y no producían salidas conformes al esquema. El repositorio, de 0,6 GB, contiene checkpoints en formato CLM (`state_head`, `action_head`, `logit_scale`, `cfg`) que se cargan con PyTorch y se puntúan mediante `exp(logit_scale) * cos(state_head(s), action_head(a))`.

Es relevante como evidencia práctica de que la precisión de ranking offline no se traduce automáticamente en control online: el adaptador de visión alcanza 0,939 de precisión de ranking offline pero solo 0,125 de puntuación en juego real por covariate shift, lo que motivó las rondas de DAgger y el cabezal v2. El autor marca explícitamente `tetris_head.pt` como experimental y no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezales de proyección sobre encoder congelado, entrenados con InfoNCE bidireccional (formato CLM: `state_head`, `action_head`, `logit_scale`, `cfg`); puntuación por similitud coseno escalada |
| Parametros totales | no disponible (los artefactos son cabezales de 39-151 MB; el encoder subyacente Qwen3-8B tiene ~8.000 millones de parámetros y permanece congelado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los estados en prosa del pipeline DAgger están en inglés, según los artefactos descritos) |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoints PyTorch (`.pt`) en formato de checkpoint Contrastive-LM; incluye ficheros JSON de métricas y notas en Markdown |

## Arquitectura y entrenamiento

La arquitectura combina un encoder congelado con cabezales de proyección entrenados de forma contrastiva. Para la ruta de texto, el encoder es Qwen3-8B y se emplean embeddings del último token de 4096 dimensiones; para la ruta de visión, el adaptador mapea características de CLIP ViT al espacio de 4096 dimensiones del CLM-8B. Los cabezales `state_head` y `action_head` proyectan estado y acción al mismo espacio y se entrenan con InfoNCE bidireccional, de modo que la selección de acción se resuelve como un ranking por similitud coseno sobre un conjunto cerrado de candidatas.

El entrenamiento del cabezal v2 de Flappy Bird parte de datos semilla de un experto con lookahead y se refina con rondas DAgger on-policy sobre el motor de físicas "Lev" alineado, siempre con el encoder Qwen3-8B congelado y selección de mejor época por recall macro. La evaluación del v2 se hizo sobre semillas 0-15 con tope de 600 decisiones y `DECISION_EVERY=3`, y la regla de selección entre los tres candidatos fue: mayor media, desempate por mediana y preferencia por menos ceros si la diferencia de medias era de ±0,5. El autor advierte que las rondas DAgger no son monótonas y que las medias de 16 semillas arrastran ruido real (el mismo fichero midió 6,25 de media y 20 de máximo en las semillas 500-519 durante su ventana de entrenamiento).

## Capacidades

- Decisión sobre conjuntos cerrados de acciones para juegos 2D: Flappy Bird (versiones v1 y v2 del cabezal) y Tetris (experimental).
- Puntuación de candidatos por similitud coseno escalada mediante `exp(logit_scale) * cos(state_head(s), action_head(a))`.
- Inferencia en el orden de milisegundos por decisión, según la comparación del autor frente a un VLM pequeño que tardaba en torno a 27 s por decisión.
- Acepta dos modalidades de entrada según el artefacto: estados en prosa con embeddings de Qwen3-8B (4096-d) o características de fotograma de CLIP ViT a través del adaptador de visión.
- Precisión de ranking offline de 0,894 (subconjunto de 800) y 0,939 (subconjunto de 2.800) en la tarea de Flappy Bird con características reales de Qwen3-8B/CLIP.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo de razonamiento extendido.
- No se documenta generación de texto: los artefactos son cabezales de decisión, no un modelo generativo.

## Casos de uso

- Control de agentes en entornos de juego 2D con presupuesto de latencia estricto: el cabezal v2 responde en milisegundos con salidas de conjunto cerrado, frente a las decenas de segundos por decisión de un VLM en las mediciones del autor.
- Investigación en aprendizaje por imitación y DAgger: el repositorio publica la receta de entrenamiento, la tabla de evaluación por semilla y las notas (`dagger_lev_flappy_head_v2_NOTES.md`), útiles para reproducir rondas on-policy y estudiar el covariate shift.
- Estudio del desajuste entre métricas offline y control online: el contraste entre 0,939 de precisión de ranking y 0,125 de puntuación real es un caso de referencia para diseñar evaluaciones de agentes.
- Base para pipelines de decisión "system one" sobre encoders congelados: la fórmula de puntuación y el formato CLM permiten sustituir el conjunto cerrado de acciones por otro dominio con estados y acciones discretas.
- Prototipado de adaptadores multimodales: `vision_adapter_clm8b.pt` muestra cómo mapear características de CLIP al espacio de 4096 dimensiones de un encoder de lenguaje congelado, patrón reutilizable en control desde píxeles.
- Referencia negativa para control de calidad en releases: los avisos del autor sobre `tetris_head.pt` (val_top1 ~1,6%, probabilidades de acción uniformes, puntuación en vivo 0) sirven como ejemplo de artefacto marcado como no validado dentro de un mismo repositorio.

## Benchmarks y rendimiento

Datos medidos por el autor en servidor AMD MI50 (gfx906). No se dispone de MMLU, HumanEval ni GSM8K, ya que no es un modelo de lenguaje generativo.

| Metrica | Resultado | Contexto |
|---|---|---|
| Precisión de ranking del adaptador de visión | 0,894 (subconjunto 800) y 0,939 (subconjunto 2.800) | Flappy Bird, características reales de Qwen3-8B/CLIP |
| Adaptador sin entrenar (aleatorio) | 0,600 | Referencia |
| Línea base en prosa | 0,500 | Referencia |
| v2 `dagger_lev_flappy_head_v2.pt`, juego en vivo | 11,125 media / 8,5 mediana / 38 max / 0 min (1 de 16 semillas con cero) | Semillas 0-15, `DECISION_EVERY=3` |
| v1 `text_state_flappy_head.pt`, mismo entorno | 5,44 media / 18 max | Semillas 0-15, físicas Lev alineadas |
| v1 `text_state_flappy_head.pt`, entorno antiguo | 2,5 media / 5 max | Gymnasium con decisiones por fotograma |
| Techo del experto con lookahead (profesor) | 43,1 media | Limitado por el tope de datos de 60 s, no por habilidad |
| Adaptador de visión, juego en vivo | 0,125 | El ranking offline no se transfirió al control |
| `tetris_head.pt`, juego en vivo | 0 | Experimental / no validado (val_top1 ~1,6%) |
| VLM pequeño de control, mismas imágenes | 0% conforme al esquema, ~27 s por decisión | `llm_baseline` |

## Requisitos de hardware

- Los cabezales son pequeños: 39 MB (`vision_adapter_clm8b.pt`), 63 MB (`tetris_head.pt`) y 151 MB cada uno de los cabezales en prosa (`dagger_prose_final_head.pt`, `dagger_lev_flappy_head_v2.pt`). El coste relevante está en el encoder congelado.
- El encoder de texto es Qwen3-8B: requiere en torno a 16 GB de VRAM en FP16 para pesos, más memoria para activaciones y contexto. Cabe en GPU de consumo con 24 GB (por ejemplo RTX 3090 o RTX 4090) en FP16 o cuantizado; no se documentan cuantizaciones específicas para estos artefactos.
- El encoder de visión es CLIP ViT, mucho más ligero que Qwen3-8B y ejecutable en GPU de consumo ampliamente disponibles.
- Las mediciones del autor se realizaron en un servidor con AMD MI50 (gfx906).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La carga indicada es con PyTorch, usando `contracts.save_checkpoint` / `load_checkpoint` del repositorio de hackathon referenciado.
- Latencia: los cabezales del sistema "system one" responden en milisegundos por decisión, frente a los ~27 s por decisión del VLM pequeño de control en la misma tarea. No se publican cifras de throughput.

## Comparativa con modelos similares

No se dispone de modelos comparables publicados en la información proporcionada. La comparación más cercana es interna al propio repositorio, entre los artefactos del autor:

| Artefacto | Tipo | Entorno / evaluacion | Resultado en vivo | Estado |
|---|---|---|---|---|
| `dagger_lev_flappy_head_v2.pt` | Cabezal CLM (estado+acción), Qwen3-8B congelado | Físicas Lev alineadas, semillas 0-15 | 11,125 media / 38 max | Mejor cabezal entrenado, publicado |
| `text_state_flappy_head.pt` (v1) | Cabezal CLM en prosa | Físicas Lev alineadas, semillas 0-15 | 5,44 media / 18 max | Línea base enviada |
| `vision_adapter_clm8b.pt` | Adaptador de visión CLIP → CLM-8B | Flappy Bird en vivo | 0,125 | Validado offline (0,939), no transfiere a control |
| `tetris_head.pt` | Cabezal CLM desde cero | Tetris en vivo | 0 | Experimental / no validado |
| Experto con lookahead | Profesor no publicado | Físicas Lev alineadas | 43,1 media | Techo limitado por el tope de datos de 60 s |

## Limitaciones y advertencias

- No es un modelo de propósito general: son cabezales de decisión para conjuntos cerrados de acciones en juegos 2D. No genera texto ni mantiene conversaciones.
- `tetris_head.pt` está marcado por el autor como experimental y no validado: entrenado sobre una ejecución de encoder parcialmente rota, val_top1 ~1,6%, probabilidades de acción uniformes (no aprendió nada) y puntuación en vivo 0. No deben usarse sus cifras.
- La precisión de ranking offline no implica control online: 0,939 de ranking se tradujo en 0,125 de puntuación en vivo por covariate shift. El autor pide explícitamente no leer las métricas offline como una afirmación de rendimiento en juego.
- Las rondas DAgger no son monótonas y las medias de 16 semillas contienen ruido real; la curva de puntuación en vivo de `dagger_prose_final_head.pt` no despegó de 0 en la ventana medida.
- Riesgo de incompatibilidad de formato: los cabezales antiguos de estado en texto usan una convención de coordenadas distinta a la del motor alineado (screen-y frente a altura sobre el suelo); si no se alimenta a cada cabezal con la plantilla de su momento de entrenamiento, puntúa 0.
- El v2 sigue muy por debajo del techo del experto con lookahead (11,125 frente a 43,1 de media).
- Licencia apache-2.0, que en principio permite uso comercial, pero el repositorio no incluye el encoder (Qwen3-8B, CLIP) ni el repositorio de hackathon con `contracts.save_checkpoint` / `load_checkpoint`, por lo que la reproducibilidad depende de terceros.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente.
- La búsqueda web asociada no devolvió resultados técnicos relevantes sobre este modelo; las únicas fuentes fiables son la model card y los ficheros del propio repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thomasliao/Lev
- Ficheros de métricas citados en la model card: `vision_adapter_report.json`, `tetris_report.json`
- Notas de entrenamiento y evaluación del v2: `dagger_lev_flappy_head_v2_NOTES.md` (dentro del repositorio)
- Repositorio de hackathon con `contracts.save_checkpoint` / `load_checkpoint`: referenciado por el autor, sin URL disponible
- No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes en la búsqueda web realizada.
