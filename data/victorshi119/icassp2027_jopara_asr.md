# victorshi119/ICASSP2027_Jopara_ASR

## Resumen

Jopara ASR es un conjunto de pesos publicado en Hugging Face por victorshi119 (Wenchen Shi y Shuju Shi) que acompaña al artículo *Jopara ASR: A Community-Verified Benchmark and Baselines for Spontaneous Spanish–Guaraní Code-Switching*, enviado a ICASSP 2027. No se trata de un modelo autónomo, sino de adaptadores LoRA y pesos de enrutador para el sistema de reconocimiento automático del habla OmniASR LLM 7B v2 (`omniASR_LLM_7B_v2`), que permanece congelado. Su objetivo es abordar el reconocimiento de habla espontánea con alternancia de código español–guaraní (jopara), un fenómeno muy extendido en Paraguay y escasamente cubierto por los sistemas ASR actuales.

El repositorio contiene cinco adaptadores LoRA de distinto rango (16, 32 y 8) aplicados sobre las proyecciones query y value del decodificador, además de tres enrutadores de mezcla de expertos (MoE) entrenados con semillas 13, 42 y 123. Los adaptadores se organizan por modo de idioma (`spa_Latn` o `grn_Latn`) y por especialización: español, guaraní y code-switching. El tamaño total del repositorio es de 0,1 GB, con licencia MIT para los pesos liberados.

La relevancia del trabajo es doble: por un lado, publica un banco de pruebas verificado por la comunidad con 150 enunciados de test para jopara; por otro, sus resultados son deliberadamente honestos y poco halagüeños, ya que ninguno de los adaptadores supera de forma significativa al propio modelo base ejecutado en modo guaraní (CER 25,0 % / WER 47,9 %). Esto lo convierte en una referencia útil como línea base reproducible y como advertencia metodológica más que como una solución lista para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre las proyecciones query y value del decodificador de OmniASR LLM 7B v2 (congelado); enrutador MoE de régimen suave sobre embeddings agrupados del codificador. Arquitectura del modelo base no detallada en la información disponible |
| Parametros totales | no disponible como cifra agregada; el modelo base congelado tiene 7B (OmniASR LLM 7B v2), los adaptadores LoRA son de rango 8, 16 o 32 |
| Parametros activos | no aplica: los «expertos» del MoE (filas 8-9) son adaptadores LoRA externos, no subredes densas del transformer base |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos PyTorch sin cuantizar) |
| Idiomas soportados | guaraní (gn) y español (es), con foco explícito en alternancia de código español–guaraní (jopara) |
| Licencia | MIT para adaptadores y enrutadores; el modelo base OmniASR se rige por su propia licencia |
| Formato de pesos | PyTorch state dict (`.pt`): `lora_adapters.pt` y `router_best.pt`, acompañados de `lora_config.json`; checksums en `SHA256SUMS` |
| Pipeline | automatic-speech-recognition |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El sistema parte de OmniASR LLM 7B v2, que se mantiene completamente congelado. Sobre él se entrenan adaptadores LoRA aplicados exclusivamente a las proyecciones query y value del decodificador, con rangos de 8, 16 o 32 según el fichero. El repositorio incluye un adaptador para español (fila 5, rango 16), uno para guaraní (fila 6, rango 16), uno para code-switching en modo `spa_Latn` (fila 7, rango 32) y sendos expertos para la configuración MoE. Los pesos no son modelos independientes: requieren cargarse junto al modelo base mediante `omnilingual-asr` y el parche incluido en `third_party/` del repositorio de GitHub.

Los datos de entrenamiento provienen de CEGPA (California Language Archive, doi:10.7297/X2CC0ZW0) y de Common Voice Guaraní, y no se redistribuyen. El adaptador español se entrenó con 1.083 enunciados solo en español; el de guaraní, con 2.569 clips de Common Voice Guaraní más 19 enunciados solo en guaraní y 871 enunciados con alternancia de código; el de code-switching, con esos mismos 871 enunciados. La configuración MoE añade un enrutador de régimen suave (`training/moe_router/model/soft_regime_router.py`, configurado por `jmole_grn_bigred200.yaml`) entrenado sobre embeddings agrupados del codificador con objetivos suaves, en tres semillas independientes. No se documenta ningún uso de RLHF, DPO u optimización por preferencias: el ajuste es supervisado sobre las transcripciones anteriores.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio, con decodificación de transcripciones textuales.
- Manejo de alternancia de código español–guaraní (jopara) dentro de un mismo enunciado, el fenómeno central del trabajo.
- Dos modos de idioma configurables en el adaptador: `spa_Latn` (español) y `grn_Latn` (guaraní).
- Tres especializaciones independientes: adaptador español (fila 5), adaptador guaraní (fila 6) y adaptador de code-switching (fila 7).
- Enrutamiento MoE: selección de experto por enunciado a partir de embeddings del codificador, con variantes de tres semillas y una ranura nula de pesos a cero que equivale al modelo base.
- Capacidad de servir como línea base reproducible para comparar nuevos métodos de ASR en jopara sobre un test verificado de 150 enunciados.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento agéntico ni razonamiento multi-paso.
- No se documentan capacidades multimodales más allá del audio de entrada ni modo de pensamiento explícito.

## Casos de uso

- Transcripción de entrevistas y documentación oral en Paraguay: el adaptador de code-switching (rango 32) está entrenado específicamente con 871 enunciados de alternancia español–guaraní, por lo que es el punto de partida natural para audio espontáneo bilingüe, aunque su CER (29,7 %) sigue siendo alto.
- Subtitulado de contenido audiovisual paraguayo: el sistema acepta audio y devuelve texto en modo `spa_Latn` o `grn_Latn`, de modo que puede integrarse en un pipeline de generación de subtítulos, asumiendo revisión humana por la tasa de error.
- Preservación y archivo lingüístico: el modelo permite transcribir corpus orales de guaraní procedentes de archivos como CEGPA, generando capas de texto indexables para investigación lingüística, con la ventaja de que los adaptadores son ligeros (repo de 0,1 GB).
- Anotación asistida de corpus para investigadores: usar la fila 6 (modo `grn_Latn`) como preanotador sobre clips de Common Voice Guaraní y corregir manualmente, reduciendo el coste frente a la transcripción desde cero.
- Evaluación comparativa de sistemas ASR: el repositorio incluye los pesos exactos de cada configuración de la Tabla 1 del artículo, lo que permite reproducir las métricas y enfrentar nuevos modelos contra las mismas 150 muestras de test.
- Atención al cliente telefónica en entornos bilingües de Paraguay: un call center puede emplear el adaptador español o el MoE para transcribir interacciones, pero el WER superior al 46 % en todos los sistemas desaconseja su uso sin supervisión humana.
- Diagnóstico de sesgos en ASR multilingüe: la diferencia entre el adaptador español (CER 37,7 %) y el guaraní (29,1 %) sirve como caso de estudio sobre cómo el ajuste con pocos datos puede degradar el rendimiento respecto al modelo base.
- Investigación sobre adaptación eficiente de parámetros: los adaptadores de rango 8, 16 y 32 sobre un modelo de 7B congelado son un banco de pruebas barato para estudiar el equilibrio entre rango LoRA y calidad de transcripción.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test de 150 enunciados, expresados en CER / WER (%). Los decimales se reproducen tal cual los publica el autor:

| Sistema | CER (%) | WER (%) |
|---|---|---|
| OmniASR, autodetección (sin adaptador) | 28,4 | 50,4 |
| OmniASR, modo guaraní (sin adaptador) | 25,0 | 47,9 |
| Fila 5, adaptador español | 37,7 | 63,2 |
| Fila 6, adaptador guaraní | 29,1 | 53,8 |
| Fila 7, adaptador code-switching | 29,7 | 52,9 |
| Fila 8, mezcla de expertos (3 semillas) | 28,8 ± 2,0 | 50,9 ± 2,8 |
| Fila 9, mezcla de expertos con ranura de code-switching vacía (3 semillas) | 24,3 ± 0,1 | 46,1 ± 0,2 |

El propio autor advierte que ninguno de los adaptadores ni de los enrutadores supera de forma significativa a ejecutar simplemente el modelo base en modo de idioma guaraní. El artículo original contiene los intervalos de confianza.

## Requisitos de hardware

- No se publican requisitos oficiales de hardware en la información disponible; las cifras siguientes son estimaciones orientativas derivadas del tamaño del modelo base.
- El LLM base tiene 7B parámetros. En fp16, solo los pesos ocupan del orden de 14 GB, a lo que hay que sumar el codificador (tamaño no publicado) y las activaciones y caché del decodificador.
- VRAM estimada para inferencia: aproximadamente 16-20 GB en fp16 para el conjunto base más codificador, sin margen para lotes grandes.
- GPU recomendadas: A100 (40/80 GB) y H100 para producción con lotes; L4, A10G o RTX 3090/4090 (24 GB) para inferencia de una sola secuencia.
- Cabe en GPU de consumo: sí, potencialmente en RTX 3090 o RTX 4090 de 24 GB en fp16; en GPUs de 16 GB o menos sería necesaria una cuantización que no se publica.
- Opciones de despliegue: `omnilingual-asr` junto con el parche del repositorio (`third_party/`), sobre PyTorch. No se documenta soporte para llama.cpp, Ollama, vLLM ni TGI.
- Almacenamiento: los adaptadores y enrutadores ocupan 0,1 GB, pero el modelo base OmniASR debe descargarse aparte (tamaño no indicado).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos de modelos externos comparables en la información disponible, por lo que no es posible establecer una comparativa con alternativas de otros autores. La comparación relevante que sí documenta el repositorio es interna, entre el modelo base y las distintas configuraciones de adaptadores:

| Configuración | Rango LoRA | Modo de idioma | Datos de entrenamiento | CER / WER (%) |
|---|---|---|---|---|
| Base OmniASR, autodetección | – | auto | ninguno | 28,4 / 50,4 |
| Base OmniASR, modo guaraní | – | `grn_Latn` | ninguno | 25,0 / 47,9 |
| Fila 5, español | 16 | `spa_Latn` | 1.083 enunciados en español | 37,7 / 63,2 |
| Fila 6, guaraní | 16 | `grn_Latn` | 2.569 clips Common Voice + 19 guaraní + 871 code-switching | 29,1 / 53,8 |
| Fila 7, code-switching | 32 | `spa_Latn` | 871 enunciados de code-switching | 29,7 / 52,9 |
| Fila 8, MoE | 16 y 32 | mixto | expertos español, guaraní y code-switching | 28,8 ± 2,0 / 50,9 ± 2,8 |
| Fila 9, MoE con ranura vacía | 8 a 32 | mixto | expertos español y guaraní, ranura de code-switching a cero | 24,3 ± 0,1 / 46,1 ± 0,2 |

## Limitaciones y advertencias

- Advertencia principal del autor: ningún adaptador ni enrutador supera significativamente al modelo base en modo guaraní. La fila 9 (24,3 % CER) es la única que mejora ligeramente, y con desviación muy baja, pero no se declara significativa.
- El adaptador español empeora claramente al modelo base (37,7 % CER frente a 25,0 % del base en modo guaraní): ajustar con 1.083 enunciados no compensa la pérdida de rendimiento general.
- Las tasas de error absolutas son muy altas (WER entre 46,1 % y 63,2 %), lo que refleja la dificultad del habla espontánea con alternancia de código y limita cualquier uso sin revisión humana.
- Desequilibrio severo en los datos: solo 19 enunciados de guaraní espontáneo puro frente a 2.569 clips de Common Voice Guaraní, que son lectura, no habla espontánea.
- Riesgo de alucinación inherente al ASR: en este dominio se manifestará como sustituciones, inserciones y omisiones de palabras, especialmente en los puntos de cambio de idioma.
- Cobertura lingüística limitada a guaraní y español; no hay soporte documentado para otros idiomas ni para variedades distintas del jopara paraguayo.
- Los pesos no son autónomos: requieren el modelo base OmniASR, sujeto a su propia licencia, que puede imponer restricciones distintas a las del MIT de los adaptadores.
- Dependencia de un parche específico sobre `omnilingual-asr` (`third_party/`); no hay integración con runtimes estándar de inferencia y la reproducibilidad fuera de ese entorno no está garantizada.
- Los datos de entrenamiento (CEGPA y Common Voice Guaraní) no se redistribuyen, por lo que la reproducibilidad completa exige acceso independiente a esas fuentes.
- El repositorio no tiene descargas ni likes y acompaña a un artículo enviado a ICASSP 2027, es decir, pendiente de revisión por pares en el momento de la publicación de estos pesos.
- No se publican versiones cuantizadas, lo que dificulta el despliegue en hardware de gama media.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/victorshi119/ICASSP2027_Jopara_ASR
- Repositorio de código, metadatos del benchmark e instrucciones: https://github.com/victorshi119/ICASSP2027_Jopara_ASR
- Artículo: *Jopara ASR: A Community-Verified Benchmark and Baselines for Spontaneous Spanish–Guaraní Code-Switching* (Wenchen Shi, Shuju Shi; enviado a ICASSP 2027). URL o DOI: no disponible
- CEGPA, California Language Archive: doi:10.7297/X2CC0ZW0
- Common Voice Guaraní (Mozilla): citado como fuente de datos, sin URL específica en la información disponible
- OmniASR LLM 7B v2 (`omniASR_LLM_7B_v2`): modelo base citado, sin URL específica en la información disponible
- `omnilingual-asr`: biblioteca de carga citada, sin URL específica en la información disponible
