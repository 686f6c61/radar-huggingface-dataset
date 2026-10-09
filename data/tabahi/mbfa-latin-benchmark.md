# Tabahi/mbfa-latin-benchmark

## Resumen

mbfa-latin-benchmark es un codificador de fonemas y alineador forzado basado en una CNN sin contexto, desarrollado por el autor Tabahi bajo el nombre interno p4mbfa (sucesor de CUPE / p3cupe). No es un modelo de lenguaje: es un modelo acústico de 14.875.189 parámetros que clasifica cada fotograma de 5 ms de audio a partir de como maximo 120 ms de senal (campo receptivo de 38,9 ms), y que produce fronteras de telefonos mediante un decodificador Viterbi segmental sobre una secuencia de fonemas conocida, refinadas a precision sub-fotograma.

El modelo cubre el grupo linguistico "latin" de la herramienta standard_g2p del proyecto CharsiuG2P, con 36 idiomas de FLEURS (af, az, bs, ca, cs, cy, da, de, en, es, et, fi, fil, fr, ga, gl, hu, id, is, it, lb, lt, mi, ms, mt, nb, nl, pl, pt, ro, sk, sl, sv, sw, tr, uz). Se entreno sobre una muestra del 62 por ciento de FLEURS latin (unas 170 de 273,5 horas) con un nivel de ruido de 0,02 (aproximadamente 34 dB de SNR).

Su relevancia es acotada pero clara: es la variante "benchmark" de la familia, seleccionada por obtener la mejor puntuacion TIMIT de todas las ejecuciones en latin, pensada para comparaciones sobre habla limpia. Para grabaciones reales el propio autor recomienda la variante mbfa-latin (ruido 0,05). Se publica con licencia AGPL-3.0 y pesos en safetensors, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sin contexto (context-free), con tres cabezas de clasificacion por fotograma; sucesora de CUPE / p3cupe |
| Parametros totales | 14.875.189 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de tokens; campo receptivo de 38,9 ms y como maximo 120 ms de audio por fotograma de 5 ms |
| Tipos de cuantizacion | no disponible (no se publican cuantizaciones; pesos en safetensors) |
| Idiomas soportados | 36 idiomas del grupo latin de FLEURS: af, az, bs, ca, cs, cy, da, de, en, es, et, fi, fil, fr, ga, gl, hu, id, is, it, lb, lt, mi, ms, mt, nb, nl, pl, pt, ro, sk, sl, sv, sw, tr, uz |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (model.safetensors junto a config.json); checkpoint de entrenamiento adicional en .ckpt de PyTorch Lightning (pickle) |

## Arquitectura y entrenamiento

La arquitectura es una CNN puramente local: cada fotograma de 5 ms se clasifica usando como maximo 120 ms de audio, lo que deja un campo receptivo efectivo de 38,9 ms. Segun el autor, este diseno impide que el modelo aprenda la fonotactica de ningun idioma concreto, lo que lo hace reutilizable entre lenguas del mismo grupo de tokens. La salida se organiza en tres cabezas: `ph` (208 etiquetas, tokens locales del grupo latin, incluidos `<blank>`, `SIL`, `noise` y `<unk>`), `phg` (15 etiquetas de grupos fonemicos gold, compartidas por todos los grupos linguisticos) y `tone` (22 etiquetas, compartidas, presentes pero no entrenadas porque ningun idioma de este grupo tiene capa tonal). Las fronteras de telefono se obtienen aplicando un decodificador Viterbi segmental sobre la secuencia de fonemas conocida, refinado a precision sub-fotograma en el cruce de posteriores vecinos.

Los datos de entrenamiento son FLEURS latin con un muestreo del 62 por ciento (train_limit 100000), aproximadamente 170 de 273,5 horas, con un nivel de ruido de 0,02 (unos 34 dB de SNR). El checkpoint publicado corresponde al experimento `ma02a`, epoca 8, seleccionado por f1@25 ms sobre TIMIT en la mitad `tune` de una sonda de 400 clips. El modelo se entreno desde pesos aleatorios y no se menciona RLHF ni DPO (no aplica a un modelo acustico). Un detalle metodologico importante: las etiquetas son pronunciaciones de diccionario de standard_g2p (inventario gold `9438371ed6dd`), no transcripciones foneticas de lo que realmente se dijo.

## Capacidades

- Reconocimiento de fonemas por fotograma: clasifica cada tramo de 5 ms de audio en las 208 etiquetas del grupo latin, mas las 15 etiquetas de grupo fonemico compartidas.
- Alineacion forzada: dado un audio y la secuencia de fonemas conocida, devuelve segmentos con `token`, `start_ms` y `end_ms`.
- Refinamiento sub-fotograma de fronteras: las fronteras se ajustan en el cruce de posteriores vecinos, no a la rejilla de 5 ms.
- Decodificacion Viterbi segmental: la alineacion no depende de buscar el mejor camino libre, sino de forzar la secuencia de telefonos proporcionada por el usuario.
- Codificacion de caracteristicas: `aligner.encode(wav)` devuelve los log-posteriores por fotograma de las tres cabezas.
- Cobertura multilingue: 36 idiomas del grupo latin; segun el autor, otros miembros del grupo mapeados a los mismos tokens por standard_g2p podrian alinearse tambien, aunque no se ha probado.
- No dispone de generacion de texto, razonamiento, generacion de codigo, tool calling, capacidades de agente, vision, audio generativo ni modo de razonamiento explicito. Es un componente acustico, no un modelo conversacional.
- La conversion de texto a tokens es responsabilidad externa de standard_g2p (`goldG2P.phonemize_sentence` seguido de `lang_group_inventory.to_local`).

## Casos de uso

- Alineacion forzada de corpus de habla multilingues: procesar FLEURS u otros corpus en los 36 idiomas cubiertos para obtener marcas temporales a nivel de fonema, con la ventaja de que un solo modelo cubre todo el grupo latin y evita mantener diccionarios acusticos separados.
- Preprocesado para sintesis de voz (TTS): extraer duraciones por fonema a partir de audios y transcripciones ya existentes para entrenar modelos acusticos o de duracion en pipelines de TTS.
- Creacion de datasets de segmentacion fonetica: generar corpus etiquetados a nivel de telefono que despues sirvan para entrenar otros sistemas de reconocimiento o de alineacion.
- Evaluacion de pronunciacion (CAPT): comparar las duraciones y fronteras reales de un hablante no nativo contra las esperadas, usando la secuencia de fonemas conocida para forzar la alineacion.
- Investigacion fonetica y sociolinguistica: medir duraciones de segmentos y efectos de coarticulacion con marcas temporales de precision sub-fotograma en habla limpia.
- Rescoring o apoyo en sistemas ASR hibridos: usar los log-posteriores por fotograma como caracteristica auxiliar o como modelo de alineacion para segmentar hipotesis de ASR.
- Referencia de evaluacion interna: al ser la variante con mejor f1@25 ms en TIMIT de todas las ejecuciones en latin, sirve como linea base para comparar nuevos entrenamientos del mismo grupo.
- Anotacion asistida de corpus de habla para equipos con recursos limitados: con 14,9 millones de parametros el modelo puede ejecutarse en CPU, lo que facilita la anotacion por lotes sin GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 400 clips de TIMIT (ingles, nunca usado en entrenamiento). La mitad `tune` selecciono el checkpoint; la mitad `holdout` no participo en esa seleccion. Cada clip se fonemiza con standard_g2p y se alinea forzadamente, comparando las onsets predichas con las fronteras manuales de TIMIT.

| Metrica | Valor |
|---|---|
| timit_f1_25ms_tune | 73,33 |
| timit_f1_25ms_holdout | 72,93 |
| timit_f1_25ms_nobonus_holdout | 68,81 |
| timit_f1_10ms_holdout | 54,94 |
| timit_abs_err_ms_holdout | 15,59 |

La variante `nobonus` alinea sin el bonus de onset basado en log-mel, lo que aisla la contribucion propia de la red. No se han publicado resultados de benchmarks adicionales en la informacion disponible, y la busqueda web realizada devolvio unicamente rankings de modelos de lenguaje sin relacion con este modelo.

## Requisitos de hardware

- VRAM estimada: con 14.875.189 parametros, los pesos en precision completa ocupan del orden de 60 MB, por lo que la huella de memoria del modelo es minima. No se publican cifras oficiales de VRAM.
- GPU recomendadas: no se especifican en la informacion disponible. Dado el tamano, cualquier GPU moderna es suficiente y no se requiere hardware de centro de datos.
- Cabe en GPU de consumo: si, con margen amplio en cualquier GPU de consumo actual, e incluso en iGPU o en CPU.
- Opciones de despliegue: el autor solo documenta la libreria propia del repositorio github.com/tabahi/bfa_models, con la clase `MbfaAligner` de `p4mbfa.inference`. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Formato de entrada: audio mono a 16000 Hz. `from_pretrained` descarga unicamente `config.json` y `model.safetensors`.
- Latencia y throughput: no disponible. El modelo procesa audio en fotogramas de 5 ms con un campo receptivo de 38,9 ms, lo que en principio permite inferencia en tiempo real, pero no se publican medidas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Cobertura | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mbfa-latin-benchmark | 14.875.189 | 36 idiomas, grupo latin de FLEURS | CNN sin contexto, alineacion forzada + fonemas | AGPL-3.0 | HuggingFace, 0 descargas |
| mbfa-latin | no disponible | mismo grupo latin | misma familia, entrenado con noise 0,05; recomendado por el autor para grabaciones reales | AGPL-3.0 | no disponible en la informacion consultada |
| CUPE / p3cupe | no disponible | no disponible | predecesor directo de p4mbfa | no disponible | no disponible |
| Alineadores de referencia externos (por ejemplo MFA o WhisperX) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de terceros en la informacion proporcionada. El unico punto de comparacion documentado es la propia familia: mbfa-latin-benchmark es la mejor puntuacion TIMIT de todas las ejecuciones en latin y esta pensada para habla limpia.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un ASR completo: exige conocer de antemano la secuencia de fonemas; no transcribe audio por si solo.
- Las etiquetas de entrenamiento son pronunciaciones de diccionario de standard_g2p, no transcripciones foneticas reales. Esto introduce un sesgo sistematico cuando la pronunciacion del hablante se desvia del diccionario.
- Se entreno con noise 0,02 (aproximadamente 34 dB de SNR), es decir, sobre condiciones de habla limpia. Para grabaciones reales con ruido el autor recomienda explicitamente mbfa-latin (noise 0,05).
- Cabeza tonal presente pero no entrenada en este grupo: no debe esperarse ninguna salida util de la cabeza `tone` para estas lenguas.
- La evaluacion publicada se hace sobre TIMIT (ingles, 400 clips) pese a que el modelo es multilingue; no hay metricas por idioma para el resto de los 36 idiomas cubiertos.
- Los idiomas adicionales del grupo latin mapeados a los mismos tokens por standard_g2p podrian funcionar, pero el autor indica que no estan probados.
- La licencia AGPL-3.0 es copyleft fuerte: su uso en servicios en red obliga a liberar el codigo fuente correspondiente, lo que puede ser incompatible con productos propietarios. Revisar antes de cualquier despliegue comercial.
- El checkpoint de fine-tuning (`ckpt/latin_fleurs170h_ma02a_e8_timit_f1_25ms=73.33.ckpt`) es un pickle de PyTorch Lightning: el propio autor advierte que solo debe cargarse si se confia en el repositorio.
- Riesgo de alucinacion en el sentido habitual de los modelos generativos: no aplica, porque el modelo no genera texto; el riesgo equivalente es una segmentacion erronea cuando el audio o la secuencia de fonemas no coinciden.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y fecha de creacion registrada como 2026-10-09: trazabilidad y adopcion muy limitadas.

## Enlaces

- HuggingFace: https://huggingface.co/Tabahi/mbfa-latin-benchmark
- Codigo de inferencia y entrenamiento (p4mbfa): https://github.com/tabahi/bfa_models
- standard_g2p / CharsiuG2P: https://github.com/tabahi/CharsiuG2P
- Dataset de entrenamiento: https://huggingface.co/datasets/google/fleurs
- Checkpoint de fine-tuning: `hf download Tabahi/mbfa-latin-benchmark "ckpt/latin_fleurs170h_ma02a_e8_timit_f1_25ms=73.33.ckpt" --local-dir tmp/hf/mbfa-latin-benchmark`
- Enlaces de la busqueda web: no se encontro ningun enlace relevante; los resultados devueltos (llmboard.ai, benchlm.ai, llm-stats.com, leaderboard de Artificial Analysis) son rankings de modelos de lenguaje sin relacion con este modelo.
