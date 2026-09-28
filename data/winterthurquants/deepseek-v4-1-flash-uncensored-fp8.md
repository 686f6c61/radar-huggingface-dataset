# winterthurquants/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es un checkpoint derivado de deepseek-ai/DeepSeek-V4.1-Flash publicado por el usuario winterthurquants; la model card atribuye la modificación al equipo de investigación dealignai. Se trata de una "abliteración" a nivel de pesos: se elimina quirúrgicamente el mecanismo de rechazo (refusal) sin emplear `model.py` personalizado, hooks en tiempo de ejecución ni vectores de steering, de modo que el checkpoint se carga igual que el modelo base. El autor afirma que se preservan intactos los componentes críticos (expertos enrutados, memoria Engram, atención dispersa CSA2, cabeza de borrador DSpark, torre de visión, puertas del router, normas y embeddings).

El modelo conserva la arquitectura del original: causal encoder-decoder de 20+20 capas con mezcla de expertos (384 expertos enrutados con top-6 más uno compartido), Hyper-Connections con residual de 4 canales, atención dispersa CSA2, memoria n-gram Engram y borrador especulativo DSpark. La cuantización es nativa, sin cambios: pesos FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4. Soporta contexto de 1M tokens y entrada multimodal mediante una torre DeepSeek-ViT con 2D-RoPE y pixel unshuffle.

Su relevancia es doble. Por un lado, documenta de forma cuantitativa el compromiso entre suprimir rechazos y conservar conocimiento: el autor reporta un 100 % de ASR en HarmBench-320 frente al 42,81 % (effort=off) y 1,56 % (effort=max) del modelo base, con una caída de 4,22 puntos en MMLU-14k que se reduce a 1,1 puntos al excluir el bloque de ética. Por otro, es un caso explícito de modelo sin salvaguardas, con implicaciones legales y de seguridad que se detallan más abajo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (20+20 capas) con MoE (384 expertos enrutados top-6 + 1 compartido), Hyper-Connections (residual de 4 canales), atención dispersa CSA2, memoria n-gram Engram, borrador especulativo DSpark |
| Parámetros totales | 763.205.315.794 (~763 B) según los safetensors del repositorio; la model card declara 552 B de backbone (discrepancia no aclarada por el autor) |
| Parámetros activos | 8 B / 16 B por token según la model card; el desglose exacto (enrutados frente a compartidos) no está especificado |
| Longitud de contexto | 1.000.000 tokens (1 M) |
| Tipos de cuantización | FP8 (`e4m3fn`) con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4; cuantización nativa, sin cambios respecto al base. No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT (según las etiquetas del repositorio); la licencia del modelo base no se especifica en la información disponible |
| Formato de pesos | safetensors (librería `transformers`) |
| Modalidad de entrada | image-text-to-text (texto e imagen) |
| Visión | DeepSeek-ViT con 2D-RoPE y pixel unshuffle |
| Tamaño del repositorio | 510,3 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura combina varios mecanismos poco habituales. El tronco es un causal encoder-decoder de 20 capas de encoder y 20 de decoder. La capa de mezcla de expertos emplea 384 expertos enrutados con activación top-6 más un experto compartido, lo que permite un coste de cómputo por token mucho menor que el de un modelo denso del mismo tamaño. Las Hyper-Connections sustituyen el residual convencional por un residual de 4 canales. La atención dispersa CSA2 reduce el coste cuadrático sobre ventanas de 1 M de tokens. La memoria n-gram Engram aporta recuperación de secuencias frecuentes, y la cabeza DSpark actúa como borrador para decodificación especulativa, acelerando la generación sin cambiar la distribución objetivo.

La modificación introducida respecto al checkpoint original es exclusivamente de pesos: según el autor, la abliteración se aplica de forma "quirúrgica" y el resultado es un checkpoint drop-in, sin código personalizado ni intervención en inferencia. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias sobre el modelo base. Tampoco se documenta el procedimiento exacto de abliteración (capas afectadas, direcciones eliminadas o criterio de selección), más allá de la afirmación de que los componentes críticos quedan idénticos byte a byte.

## Capacidades

- Generación de texto y razonamiento multi-turno, con modo de razonamiento máximo activado por defecto según la model card.
- Comprensión de imágenes y texto (pipeline image-text-to-text) mediante torre DeepSeek-ViT.
- Soporte de herramientas: la model card menciona explícitamente "Vision + tools", lo que indica uso previsto en llamadas a funciones.
- Contexto largo de 1 M de tokens, apto para documentos extensos, repositorios de código o transcripciones largas.
- Decodificación especulativa mediante la cabeza DSpark, orientada a mejorar el throughput.
- Mezcla de expertos con 384 expertos enrutados y uno compartido, lo que proporciona capacidad total alta con coste de cómputo por token reducido.
- Razonamiento encadenado visible: la evaluación compara los resultados con el modo de razonamiento desactivado y activado, lo que implica que el modelo expone trazas de razonamiento.
- Ausencia deliberada de rechazos: el autor reporta cero respuestas clasificadas como HARD_REF, SOFT_RED o HEDGE en HarmBench-320.
- Capacidades multilingües: no confirmadas en la información disponible (el clasificador de evaluación se describe como multilingüe, pero no se listan idiomas soportados por el modelo).

## Casos de uso

- Investigación en seguridad y alineación: comparar pares base/abliterado sobre el mismo prompt y medir qué direcciones de pesos codifican el comportamiento de rechazo. El modelo es útil precisamente por ser un par controlado del checkpoint original.
- Red teaming y evaluación de clasificadores: generar respuestas límite etiquetadas (HARD_REF, SOFT_RED, HEDGE, COMPLY) para poner a prueba clasificadores de contenido y filtros de moderación propios antes de desplegarlos.
- Generación de datos sintéticos para moderación: producir ejemplos difíciles que alimenten clasificadores de seguridad internos, siempre dentro de un entorno controlado y con revisión humana.
- Análisis de documentos largos con componente visual: informes escaneados, planos, documentación técnica o expedientes de cientos de miles de tokens, aprovechando la ventana de 1 M y la torre de visión.
- Extracción estructurada sobre repositorios de código: dado el contexto de 1 M tokens, es viable cargar un repositorio completo y pedir resúmenes, dependencias o detección de patrones, con soporte de herramientas para ejecutar comprobaciones.
- Pipelines agénticos multi-paso: al soportar tool calling y trazas de razonamiento, encaja en orquestadores que planifican, invocan APIs y verifican resultados; el coste por token se mantiene bajo gracias al MoE.
- Escritura creativa con temáticas sensibles: narrativa, guion o ficción que aborde violencia, sexualidad o temas políticamente conflictivos sin bloqueos, con la advertencia de que la licencia MIT del repositorio no exime del cumplimiento de la normativa aplicable en el territorio de despliegue.
- Evaluación de latencia y throughput en infraestructura propia: al ser un checkpoint FP8/FP4 nativo de gran tamaño, sirve para medir rendimiento real de despliegues multi-GPU con decodificación especulativa.

## Benchmarks y rendimiento

HarmBench-320, decodificación greedy (T=0), 2×2 entre modelo base y la build "CRACK", con effort desactivado y al máximo:

| Evaluación | ASR base | ASR CRACK | Δ (pp) |
|---|---:|---:|---:|
| HB-320, effort=off | 137/320 = 42,81 % | 320/320 = 100,00 % | +57,19 |
| HB-320, effort=max | 5/320 = 1,56 % | 320/320 = 100,00 % | +98,44 |

Desglose por categoría semántica de HarmBench:

| Categoría | Ítems | base off | CRACK off | base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7 % | 100,0 % | 0,0 % | 100,0 % |
| copyright | 80 | 98,8 % | 100,0 % | 0,0 % | 100,0 % |
| cybercrime_intrusion | 52 | 34,6 % | 100,0 % | 3,8 % | 100,0 % |
| harassment_bullying | 21 | 0,0 % | 100,0 % | 0,0 % | 100,0 % |
| harmful | 18 | 11,1 % | 100,0 % | 5,6 % | 100,0 % |
| illegal | 53 | 13,2 % | 100,0 % | 0,0 % | 100,0 % |
| misinformation_disinformation | 54 | 44,4 % | 100,0 % | 3,7 % | 100,0 % |

MMLU-14k (conjunto de test completo, logits del modelo base, T=0):

| Build | Correctas | Precisión | Δ |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96 % | — |
| CRACK | 11.619 / 14.042 | 82,74 % | −4,22 pp |

Excluyendo el bloque de ética (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), la caída sobre los ~11.000 ítems restantes es de −1,1 pp, dentro del objetivo de preservación de conocimiento de 3 pp declarado por el autor. Los mayores descensos por asignatura documentados son moral scenarios (−39,89 pp, 76,9 % → 37,0 %), professional law (−7,04 pp), abstract algebra (−6,00 pp), security studies (−5,31 pp) y high school computer science (−4,00 pp). La tabla completa de 57 asignaturas aparece truncada en la información disponible.

Metodología declarada: clasificador estricto multilingüe basado en expresiones regulares con cuatro niveles, complementado con LLM-as-judge sobre la traza de razonamiento en el caso effort=max. El autor indica que guarda las salidas por ítem para verificación. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMMU u otros) en la información disponible.

## Requisitos de hardware

- VRAM para pesos: el repositorio ocupa 510,3 GB, por lo que los pesos en FP8/FP4 rondan ese orden de magnitud. No entra en ninguna GPU de consumo ni en una única GPU de centro de datos.
- Memoria para KV cache: con 1 M de tokens de contexto, el KV cache es el factor dominante y no está cuantificado en la información disponible; a longitudes cercanas a 1 M el requisito total puede superar con holgura el de los pesos (estimación, no dato del autor).
- Configuración mínima estimada: 8 × H100 80 GB (640 GB) para pesos y estados, con tensor parallelism o expert parallelism; añadir nodos si se necesita contexto cercano a 1 M. Cifra estimada a partir del tamaño del repositorio, no publicada por el autor.
- GPU de consumo: no cabe. El tamaño de pesos descarta RTX 4090, RTX 5090 o similares, incluso con cuantizaciones más agresivas que las nativas.
- Cómputo por token: al activar solo 8-16 B parámetros por token, el coste de cálculo es bajo en comparación con un modelo denso de 763 B; el cuello de botella es el ancho de banda de memoria al cargar expertos.
- Opciones de despliegue: la librería declarada es `transformers`. Otros frameworks (vLLM, SGLang, TGI) no están confirmados en la información disponible. `llama.cpp` y `Ollama` no están confirmados y, dado que la cuantización nativa combina FP8 y FP4, su compatibilidad requeriría verificación.
- Latencia y throughput: no disponible.
- Nota: la model card incluye la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia genéricos, pero no se especifica cuáles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la información proporcionada, por lo que la comparación se limita al par base/derivado, que sí está documentado por el autor:

| Aspecto | DeepSeek-V4.1-Flash (base) | DeepSeek-V4.1-Flash-UNCENSORED-FP8 |
|---|---|---|
| Contexto | 1 M tokens | 1 M tokens |
| Arquitectura | Causal encoder-decoder, MoE 384+1 top-6, CSA2, Engram, DSpark | Idéntica, sin cambios declarados |
| Cuantización | FP8 e4m3fn + FP4 en expertos | Idéntica, nativa y sin cambios |
| Visión | DeepSeek-ViT | DeepSeek-ViT, intacta |
| HarmBench-320, effort=off | 42,81 % ASR | 100,00 % ASR |
| HarmBench-320, effort=max | 1,56 % ASR | 100,00 % ASR |
| MMLU-14k | 86,96 % | 82,74 % |
| Salvaguardas | Presentes | Eliminadas a nivel de pesos |
| Licencia | no especificada en la información disponible | MIT (según etiquetas del repositorio) |

Comparación con alternativas de terceros (otros modelos abliterados de escala similar, versiones no cuantizadas o modelos densos de parámetros equivalentes): no disponible.

## Limitaciones y advertencias

- Ausencia total de salvaguardas. El autor reporta 100 % de ASR en HarmBench-320 en las siete categorías evaluadas, incluidas `chemical_biological`, `cybercrime_intrusion` e `illegal`. Cualquier despliegue expuesto a usuarios finales sin filtros externos implica un riesgo elevado de generar contenido dañino o ilegal.
- Responsabilidad legal del operador. La licencia MIT del repositorio regula los derechos de uso del artefacto, pero no exime del cumplimiento de normativa aplicable (por ejemplo, regulación de servicios digitales, normativa sobre contenidos ilícitos o requisitos sectoriales). La licencia del modelo base no se especifica, lo que añade incertidumbre sobre la cadena de derechos.
- Degradación medible en conocimiento. Caída de 4,22 pp en MMLU-14k respecto al base, concentrada en el bloque de ética. En `moral_scenarios` el descenso es de 39,89 pp (76,9 % → 37,0 %), lo que invalida su uso en tareas que dependan de razonamiento moral o juicio normativo.
- Riesgo de alucinación: no cuantificado en la información disponible. No hay evaluación de factualidad, veracidad ni tasas de alucinación.
- Idiomas soportados: no disponibles. Se desconoce el comportamiento real fuera del inglés y de los idiomas cubiertos por el clasificador de evaluación.
- Sesgos: no evaluados en la información disponible. Al eliminar el comportamiento de rechazo, es esperable que los sesgos latentes del modelo base se expresen con menos filtrado, pero no hay medición publicada.
- Riesgo de sobreajuste de la abliteración. El objetivo declarado era preservar el conocimiento dentro de 3 pp; la desviación de −4,22 pp en el conjunto completo y de casi 40 pp en una asignatura concreta indica efectos colaterales no triviales.
- Procedimiento no reproducible. No se publica la metodología de abliteración (capas, direcciones ni criterio), por lo que no puede auditarse de forma independiente qué se eliminó exactamente.
- Madurez del artefacto. Creado y actualizado el 27 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta y sin documentación de validación por terceros.
- Requisitos de infraestructura. El tamaño del repositorio (510,3 GB) y la ventana de 1 M tokens hacen inviable el despliegue en hardware de consumo y encarecen cualquier inferencia en producción.
- Reproducibilidad de las cifras. Toda la evaluación de HarmBench y MMLU procede del propio autor; no hay replicación independiente en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/winterthurquants/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del equipo autor de la abliteración en X: https://x.com/dealignai
- Perfil de @jordanschenck en X: https://x.com/jordanschenck
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a sitios no relacionados: Pinkbike, YouTube TV Help, Google Account Help).
