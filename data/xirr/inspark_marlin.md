# xirr/inspark_marlin

## Resumen

`xirr/inspark_marlin` es un repositorio de pesos derivados, no un modelo completo. Contiene exclusivamente los artefactos generados por el proyecto [`xiro2416/inspark_marlin`](https://github.com/xiro2416/inspark_marlin), cuyo objetivo es acelerar la síntesis de voz de IndexTTS2 mediante decodificación especulativa. El repositorio ocupa 0,6 GB y su pipeline declarado en HuggingFace es `text-to-speech`.

Los tres componentes publicados son un modelo draft denominado DSpark (tres capas, siete slots), un fichero de datos de agrupación acústica (`asg/target_asg_threshold_0p49.safetensors`) usado por la aceptación especulativa, y una exportación CFM de dos pasos (`cfm_oracle500.pt`) que se emplea con los puntos de tiempo de solver `[0, 0.5, 1]` y CFG desactivado. La release de inferencia asociada es `v0.1.0-sm120`, correspondiente al commit de Git `003904282683ce124f28c291e07f603fe74dc71b`.

Es relevante ahora porque ejemplifica una tendencia concreta: publicar únicamente los pesos derivados y dejar que el código descargue y verifique por SHA256 los pesos originales de IndexTTS2 (GPT/S2Mel) y de terceros (W2V-BERT, BigVGAN, MaskGCT, CampPlus). Esto evita la duplicación de artefactos con licencias ajenas, pero implica que este repositorio, por sí solo, no es ejecutable. El autor advierte expresamente de que se trata de una obra derivada de IndexTTS2 y de que las modificaciones no están avaladas por el titular original de los derechos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pesos derivados para un pipeline IndexTTS2 con decodificacion especulativa; incluye un modelo draft DSpark de tres capas y siete slots, datos de agrupacion acustica y una exportacion CFM de dos pasos. Arquitectura del modelo base: no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de LLM; el pipeline es text-to-speech) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | `bilibili-model-use-license` (campo `license: other`); requiere leer `LICENSE` y `LICENSE_ZH.txt` antes de descargar o usar |
| Formato de pesos | safetensors (`.safetensors`) y PyTorch serializado (`.pt`) |
| Tamano del repositorio | 0,6 GB |
| Version de inferencia asociada | `v0.1.0-sm120`, commit `003904282683ce124f28c291e07f603fe74dc71b` |
| Pipeline declarado | text-to-speech |
| Libreria | pytorch |
| Repositorio de codigo | `xiro2416/inspark_marlin` (GitHub) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni el proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO). Lo que si se detalla es la composicion de los pesos derivados: un modelo draft DSpark de tres capas y siete slots (`draft_onpolicy100/`), descrito como universal; un fichero de datos de agrupacion acustica con umbral 0,49 empleado por la aceptacion especulativa; y `cfm_oracle500.pt`, una exportacion Oracle500 de CFM (conditional flow matching) en dos pasos que se usa con los puntos de tiempo de solver `[0, 0.5, 1]` y con CFG desactivado.

La innovacion tecnica que se deduce de la documentacion es la aplicacion de decodificacion especulativa al pipeline de sintesis: un modelo draft ligero propone tokens acusticos que el modelo objetivo verifica, con una capa de aceptacion basada en agrupacion acustica. El repositorio no incluye los pesos oficiales de IndexTTS2 (GPT/S2Mel) ni los modelos de terceros (W2V-BERT, BigVGAN, MaskGCT, CampPlus): el codigo de inferencia los descarga desde sus publicadores originales y verifica su SHA256. El hash declarado para el CFM activo es `635ab7025fbd4eaa999fcd3e964512df081d5c9cff093a59d383e050c70bcfca`.

## Capacidades

- Sintesis de voz (text-to-speech) dentro del pipeline IndexTTS2, siempre que se descarguen aparte los pesos base y los modelos auxiliares.
- Decodificacion especulativa mediante un modelo draft DSpark de tres capas y siete slots.
- Aceptacion especulativa guiada por datos de agrupacion acustica con umbral 0,49.
- Generacion CFM en dos pasos con los puntos de tiempo `[0, 0.5, 1]` y CFG desactivado.
- Verificacion de integridad de pesos por SHA256 mediante el fichero `SHA256SUMS`.
- Soporte de tool calling / function calling: no disponible (no aplica al pipeline declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (sin idiomas declarados).
- Capacidades multimodales adicionales (vision, audio de entrada, thinking mode): no disponible.

## Casos de uso

- Investigacion en decodificacion especulativa aplicada a audio: el repositorio permite reproducir la release `v0.1.0-sm120` y medir la tasa de aceptacion del draft DSpark frente al modelo objetivo, usando el umbral de agrupacion acustica de 0,49 como punto de partida.
- Evaluacion de pipelines TTS acelerados: sirve para comparar la ruta especulativa con la ruta no especulativa del mismo pipeline IndexTTS2, aislando el efecto del draft de tres capas y del export CFM de dos pasos.
- Reproducibilidad academica: al fijar commit de Git, version de release y hashes SHA256, es adecuado para experimentos que requieran trazabilidad exacta de los pesos derivados.
- Auditoria de integridad de artefactos: el patron de no replicar pesos de terceros y verificar SHA256 resulta util como referencia para equipos que necesitan cumplir restricciones de licencia al distribuir derivados.
- Sintesis de voz en produccion: solo si el equipo despliega por separado el pipeline IndexTTS2 completo y su licencia lo permite; este repositorio cubre unicamente la parte derivada.
- Experimentacion con exportaciones CFM de pocos pasos: el fichero `cfm_oracle500.pt` con solver `[0, 0.5, 1]` y CFG desactivado permite estudiar el compromiso entre pasos de sampling y calidad de audio.
- Formacion tecnica interna: como caso de estudio de composicion de repositorios de pesos derivados frente a repositorios monoliticos con licencias heterogeneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, similitud de hablante, WER, tasa de aceptacion especulativa, RTF ni latencia), y los resultados de busqueda web recuperados no contienen informacion tecnica sobre este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 0,6 GB, pero no incluye los pesos base de IndexTTS2 ni los modelos de terceros, por lo que el requisito real del pipeline completo es necesariamente mayor y no esta cuantificado en la informacion disponible.
- GPU recomendadas: no disponible. El identificador de la release (`v0.1.0-sm120`) podria aludir a una arquitectura de GPU concreta, pero esto no se confirma en la documentacion entregada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: la unica via documentada es el repositorio de inferencia `xiro2416/inspark_marlin` en GitHub. No se mencionan integraciones con vLLM, llama.cpp, Ollama, TGI ni otras herramientas.
- Latencia y throughput estimados: no disponible. El proposito declarado del proyecto es la decodificacion especulativa, orientada a reducir el coste de inferencia, pero no se aportan cifras de aceleracion.
- Almacenamiento: 0,6 GB para este repositorio, mas el espacio adicional de los pesos originales descargados y verificados por el codigo.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La unica referencia clara es el modelo upstream del que derivan estos pesos.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xirr/inspark_marlin` | Pesos derivados parciales | no disponible | no aplica (TTS) | bilibili-model-use-license (`other`) | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| IndexTTS2 (oficial) | Modelo base del que derivan estos pesos | no disponible en la informacion entregada | no disponible | no disponible en la informacion entregada | No replicado en este repositorio; el codigo lo descarga desde su publicador original |
| Otras alternativas TTS open source | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no es autosuficiente: sin los pesos GPT/S2Mel de IndexTTS2 y los modelos de terceros (W2V-BERT, BigVGAN, MaskGCT, CampPlus), los ficheros aqui publicados no permiten ejecutar inferencia.
- Licencia restrictiva: `bilibili-model-use-license` con campo `license: other`. Es obligatorio leer `LICENSE` y `LICENSE_ZH.txt` antes de cualquier uso, incluido el comercial; no se detallan en esta ficha las condiciones concretas de explotacion.
- Obra derivada: el autor declara expresamente que las modificaciones no estan avaladas, garantizadas ni respaldadas por el titular original de los derechos, que ademas declina toda responsabilidad sobre el derivado.
- Sin datos de rendimiento: no hay benchmarks, metricas de calidad de audio ni cifras de latencia, por lo que no es posible estimar la ganancia real de la decodificacion especulativa frente a la ruta estandar.
- Idiomas no declarados: se desconoce que lenguas cubre el pipeline resultante.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; en sintesis de voz el riesgo analogo es la inestabilidad prosodica o la generacion de audio incorrecto, pero no se aportan evaluaciones al respecto.
- Madurez y adopcion: el repositorio registra 0 descargas y 0 likes, con fecha de creacion y ultima actualizacion el 2026-09-17. Es un artefacto reciente y sin validacion externa publica.
- Un fichero de datos (`target_asg_threshold_0p49.safetensors`) esta calibrado con un umbral fijo de 0,49; cambiar de dominio acustico o de idioma podria degradar la tasa de aceptacion especulativa.
- El export CFM esta preparado para dos pasos con `[0, 0.5, 1]` y CFG desactivado; usarlo con otra configuracion queda fuera de lo documentado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/xirr/inspark_marlin
- Repositorio de codigo e inferencia: https://github.com/xiro2416/inspark_marlin
- Version de inferencia asociada: `v0.1.0-sm120`, commit `003904282683ce124f28c291e07f603fe74dc71b`
- Fichero de integridad: `SHA256SUMS` (dentro del repositorio)
- Licencias: `LICENSE` y `LICENSE_ZH.txt` (dentro del repositorio)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
