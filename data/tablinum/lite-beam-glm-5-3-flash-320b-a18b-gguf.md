# tablinum/Lite-Beam-GLM-5.3-Flash-320B-A18B-GGUF

## Resumen

Lite-Beam GLM-5.3-Flash 320B A18B es una cuantización GGUF de 2 bits mixtos del modelo GLM-5.3-Flash de Z.ai, un transformer de mezcla de expertos (MoE) con 320.759.404.382 parámetros totales y 18B activos por token. La publica el usuario tablinum bajo licencia MIT, heredada del modelo base, y su objetivo es claro: meter un MoE de 320B en un único conjunto de ficheros de 96,1 GB (89,5 GiB) que quepa en máquinas de consumo con los expertos en RAM del sistema y la atención en GPU.

La innovación principal no es la cuantización en sí, sino la política de asignación de bits: conserva los 288 expertos de cada capa MoE y la capa de multi-token prediction (MTP), y concentra la precisión en las partes que primero se degradan a 2 bits (atención, router y proyecciones down de los expertos). Frente a la alternativa de referencia de unsloth (UD-Q2_K_XL, 108,7 GB), este build es 12,6 GB más pequeño y entre un 8 y un 10 % más rápido, a cambio de una fidelidad algo menor respecto al modelo de referencia.

Es relevante ahora porque permite ejecutar localmente un modelo de clase 320B con capacidades orientadas a agentes y código, con decodificación especulativa integrada vía MTP (sin descargar un drafter separado) y con un contexto configurable de 32.768 tokens en la receta publicada. Solo texto: la torre de visión del modelo base no está incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), 288 expertos por capa, con capa MTP (multi-token prediction) |
| Parametros totales | 320.759.404.382 (320B) |
| Parametros activos | 18B por token (A18B) |
| Longitud de contexto | 32.768 tokens en la receta de llama-server publicada (contexto nativo del modelo base: no disponible) |
| Tipos de cuantizacion | IQ2_XXS mixta (2,40 bits por peso); sin otras variantes publicadas en este repo |
| Idiomas soportados | en, zh |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF, dividido en 3 shards (47,3 GB + 47,7 GB + 1,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 288 expertos en cada capa MoE y 320B de parámetros totales, de los que 18B se activan por token. Incluye una capa de multi-token prediction (MTP) que en esta cuantización se conserva explícitamente para usarla como drafter en decodificación especulativa. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo RLHF o DPO: esa información no está disponible en el material proporcionado.

La contribución técnica de esta ficha es la cuantización. El autor aplica una asignación mixta de bits guiada por imatrix que mantiene los 288 expertos de todas las capas y gasta más bits en atención, router y proyecciones down de los expertos, que son los tensores que se degradan primero a 2 bits. El resultado son 2,40 bits por peso efectivos en 96.143.131.264 bytes. La receta de ejecución recomendada coloca atención, normas y router en GPU (`-ngl 99`) y deja los expertos enrutados en RAM (`--n-cpu-moe 99`), con `-fa on`, `-b 2048 -ub 2048` y decodificación especulativa MTP (`--spec-type draft-mtp --spec-draft-n-max 2`). El autor documenta que `-ub 2048` es aproximadamente 3 veces más rápido en procesamiento de prompt que `-ub 512` en su máquina de referencia.

## Capacidades

- Generación de texto conversacional en inglés y chino, con modo de razonamiento (thinking) activable; los benchmarks de velocidad del autor se midieron con thinking on.
- Codificación: el autor etiqueta el modelo como "coding" y reporta una tasa de aceptación del drafter MTP del 82 % con prompts de código, lo que indica buen ajuste al dominio.
- Razonamiento multi-paso y flujos agénticos: el modelo base está etiquetado como "agentic" y la receta de despliegue usa `--jinja`, lo que habilita plantillas de chat con soporte de herramientas en llama-server.
- Tool calling / function calling: disponible a través de la plantilla Jinja del modelo base en llama.cpp; no se detalla la lista exacta de herramientas soportadas.
- Decodificación especulativa nativa mediante la capa MTP, sin necesidad de un modelo drafter externo.
- Multilingüe limitado a inglés y chino según los metadatos del repo.
- Solo texto: la torre de visión del modelo base no está incluida en esta cuantización.

## Casos de uso

- Asistente de código en local: con 32.768 tokens de contexto y MTP como drafter, el modelo puede mantener sesiones de refactorización sobre varios ficheros en una estación de trabajo con GPU de consumo y los expertos en RAM; la aceptación del 82 % en prompts de código reduce el coste por token generado.
- Agente autónomo de terminal o CI: la plantilla Jinja y el soporte de tool calling permiten integrarlo en llama-server como backend de un agente que ejecuta comandos, lee resultados y encadena pasos, con la ventaja de que no hay dependencia de API externa.
- Procesamiento por lotes de documentación técnica en inglés y chino: el modelo puede resumir, clasificar y extraer datos de corpus bilingües en pipelines offline, aprovechando el throughput de prompt processing (63,5 t/s en pp2048 con la configuración de referencia).
- Generación aumentada por recuperación (RAG) sobre bases de conocimiento internas: los 32K de contexto permiten inyectar varios fragmentos recuperados más la pregunta sin truncar, y el despliegue local evita enviar datos sensibles a terceros.
- Evaluación y experimentación con MoE de gran escala: investigadores sin clúster pueden estudiar el comportamiento de un 320B/A18B real, comparar contra el Q3_K_M de referencia y medir KLD con `llama-perplexity --kl-divergence`.
- Chat de soporte interno bilingüe: conversaciones multi-turno en inglés y chino con contexto largo, ejecutadas en hardware de una sola máquina y con licencia MIT que no restringe el uso comercial.
- Prototipado de aplicaciones agénticas antes de pasar a producción: permite validar prompts, plantillas de herramientas y flujos multi-paso con el mismo modelo base que se desplegaría en infraestructura mayor.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad (KLD) y de velocidad frente a UD-Q2_K_XL de unsloth, tomando como referencia un Q3_K_M de GLM-5.3-Flash (153,7 GB). No se publican resultados de MMLU, HumanEval, GSM8K ni similares en la información disponible.

| Metrica | Lite-Beam IQ2_XXS (96,1 GB) | UD-Q2_K_XL (108,7 GB) |
|---|---|---|
| KLD mixto chat/código/matemáticas | 0,080 ± 0,002 | 0,067 ± 0,002 |
| Mismo token top, mixto | 92,3 % | 92,8 % |
| KLD WikiText | 0,414 ± 0,007 | 0,347 ± 0,006 |
| Mismo token top, WikiText | 78,3 % | 80,2 % |
| Prompt processing, pp2048 (`-ub 2048`) | 63,5 t/s | 57,9 t/s |
| Generación, tg128 | 6,74 t/s | 6,24 t/s |
| Generación con MTP (`--spec-draft-n-max 2`), código | 8,07 t/s | 7,60 t/s |
| Generación con MTP (`--spec-draft-n-max 2`), chat | 7,30 t/s | 6,70 t/s |

Aceptación del drafter MTP en Lite-Beam: 82 % (código) y 69 % (chat) con dos tokens draftados; 92 % y 80 % con uno (7,72 y 7,26 t/s). Sin drafting, ambos ficheros generan a unos 6,2 t/s en llama-server. Las mediciones de KLD se hicieron con 18 ventanas de 2.048 tokens mixtas y 15 ventanas de WikiText. El propio autor advierte que los valores absolutos de KLD son menores que contra BF16 porque la referencia es Q3_K_M.

## Requisitos de hardware

- VRAM: el diseño objetivo es atención, normas y router en GPU y expertos en RAM del sistema. El autor menciona "dos GPUs pequeñas" y que los buffers de cómputo con `-ub 2048` necesitan más de 6 GB de VRAM; no publica una cifra exacta de VRAM total.
- RAM del sistema: debe alojar la mayor parte de los 96,1 GB de pesos (expertos). La máquina de referencia del autor dispone de 156 GB de RAM, insuficientes para el BF16 de 642 GB pero holgados para este build.
- GPU recomendadas: no especificadas por el autor; la receta está pensada para GPUs de consumo con varios GB libres para atención y buffers. Modelos de clase A100/H100 no se mencionan en la documentación.
- ¿Cabe en GPU de consumo? Sí, con el reparto GPU/RAM descrito; no cabe entero en una sola GPU de consumo.
- Despliegue: llama.cpp (llama-server y llama-bench); el repo es compatible con endpoints según los tags. No se mencionan vLLM, TGI ni Ollama.
- Throughput de referencia: 63,5 t/s en prompt processing (pp2048), 6,74 t/s en generación sin drafting y 8,07 t/s con MTP en código, sobre la máquina de referencia descrita (expertos en DRAM, atención en dos GPUs pequeñas, 20 hilos fijados a un socket de CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Notas |
|---|---|---|---|---|---|
| Lite-Beam GLM-5.3-Flash IQ2_XXS | 320B totales / 18B activos | 32.768 (receta) | 96,1 GB | MIT | Más rápido y más pequeño; KLD mixto 0,080 |
| unsloth UD-Q2_K_XL (GLM-5.3-Flash) | 320B totales / 18B activos | no disponible | 108,7 GB | MIT | Más fiel (KLD mixto 0,067); más lento |
| GLM-5.3-Flash Q3_K_M (referencia) | 320B totales / 18B activos | no disponible | 153,7 GB | MIT | Referencia de KLD del autor; no cabe en 156 GB de RAM |
| GLM-5.3-Flash BF16 (modelo base) | 320B totales / 18B activos | no disponible | 642 GB | MIT | Máxima fidelidad; inviable en la máquina de referencia |

## Limitaciones y advertencias

- Pérdida de fidelidad medible: el KLD mixto es 0,080 frente a 0,067 de UD-Q2_K_XL, y en WikiText la brecha es mayor (0,414 frente a 0,347). Para tareas sensibles a la precisión de la distribución de salida, el build de unsloth es preferible si cabe en memoria.
- Cuantización agresiva a 2,40 bits por peso: es esperable degradación en razonamiento matemático fino, código de baja frecuencia y generación en dominios poco representados; el autor no publica evaluaciones por tarea más allá de KLD.
- Solo texto: sin torre de visión, pese a que el modelo base podría tenerla.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está evaluado ni declarado.
- Riesgo de alucinación inherente a un modelo de 2 bits: no hay datos publicados de tasas de alucinación ni de calibración.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- La licencia MIT del modelo base se hereda, pero conviene verificar el fichero LICENSE del repo antes de uso comercial; el autor lo incluye explícitamente.
- El rendimiento depende críticamente de la configuración: sin `-ub 2048` el prompt processing cae hasta 3 veces; sin MTP se pierde entre el 15 y el 20 % de velocidad de generación.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas del autor.
- Los valores de KLD están medidos contra Q3_K_M, no contra BF16, por lo que no son comparables directamente con cifras publicadas contra el modelo completo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tablinum/Lite-Beam-GLM-5.3-Flash-320B-A18B-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Familia Lite-Beam de tablinum: https://huggingface.co/tablinum
- Alternativa UD-Q2_K_XL de unsloth: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
