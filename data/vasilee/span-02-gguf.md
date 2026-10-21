# vasilee/span-02-gguf

## Resumen

`vasilee/span-02-gguf` es la conversión a formato GGUF de `respanai/span-02`, un modelo de decisión construido como fine-tune de Gemma 4 26B-A4B (arquitectura MoE con aproximadamente 4.000 millones de parámetros activos y 25.233.142.046 parámetros totales según los safetensors del modelo base). Su función no es conversar libremente, sino recibir un estado (texto o JSON) junto con preguntas tipadas y devolver una probabilidad calibrada por opción, sin texto libre ni parseo posterior. Según la model card, ocupa la posición 4 del Decision Index con una puntuación completa de 62,6 y una latencia mediana de 33 ms en el motor nativo.

El interés de esta publicación es la portabilidad: la versión original de `respanai/span-02` solo se ejecuta en GPU NVIDIA Blackwell (RTX PRO 6000 / RTX 5090), porque los pesos se distribuyen pre-cuantizados y los ejecuta un motor propio en Rust/CUDA con kernels `sm_120a` escritos a mano, de modo que transformers, vLLM, Mac y CPU no pueden cargarlos. Estas GGUFs recompilan el mismo modelo para llama.cpp, con un único fichero que sirve tanto para chat (`/v1/chat/completions`) como para decisiones (`/v1/systemone`).

La relevancia práctica es doble: por un lado permite ejecutar un modelo de decisión calibrado en Metal, CPU, CUDA o Vulkan sin hardware Blackwell; por otro, la model card documenta que Q4_K_M reproduce exactamente las cifras de GPQA Diamond del motor nativo (0,4694 de accuracy y 0,2925 de skill corregido por azar), lo que convierte a esta cuantización en un sustituto funcional del original en esa prueba. El repositorio incluye dos ficheros (MXFP4 de 14,7 GB y Q4_K_M de 16,8 GB) con metadatos de decision-model embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (fine-tune de Gemma 4 26B-A4B) |
| Parametros totales | 25.233.142.046 (~25,2 B; la model card lo denomina "26B-A4B") |
| Parametros activos | ~4 B (aproximado, segun la model card) |
| Longitud de contexto | no disponible (el ejemplo de arranque usa `-c 8192`, pero es un flag de runtime, no el maximo del modelo) |
| Tipos de cuantizacion | MXFP4 (expertos en 4 bits e2m1 con escalas de bloque potencia de dos, resto Q8_0) y Q4_K_M (mezcla Q4_K / Q6_K / Q8_0, embeddings en BF16) |
| Idiomas soportados | no disponible en los metadatos (la model card incluye un ejemplo de generacion en rumano, sin lista formal de idiomas) |
| Licencia | apache-2.0 (con `license_link` a la Gemma 4 license de Google) |
| Formato de pesos | GGUF (`span02-mxfp4.gguf` 14,7 GB; `span02-q4_k_m.gguf` 16,8 GB); repo de 31,5 GB |
| Modalidades de salida | `text` y `decisions` (`output_modalities: ["text", "decisions"]`) |
| Identificador HF | vasilee/span-02-gguf (creado 2026-10-19, actualizado 2026-10-20; 85 descargas, 1 like) |
| Cuantizado por | Vasile Ermicioi |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Gemma 4 26B-A4B, es decir, un transformer con mezcla de expertos en el que solo se activan aproximadamente 4.000 millones de parámetros por token. Sobre esa base, `respanai/span-02` se entrenó como modelo de decisión: en lugar de generar texto, produce una distribución de probabilidad calibrada sobre opciones definidas por el usuario, con tipos de pregunta `choice` (elección entre criterios), `noul` (probabilidad de una condición binaria) y `score` (puntuación ordinal con leyenda). La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La innovación técnica documentada está en el pipeline de conversión más que en el entrenamiento. Los pesos originales se distribuyen en NVFP4 y FP8 y se de-cuantizan siguiendo exactamente la matemática del motor propietario (FP8: `w * scale[row]`; NVFP4: `e2m1 * fp8(scale) * gscale`), se convierten con el soporte de Gemma 4 de llama.cpp y se re-cuantizan a los dos formatos publicados. Ambas GGUFs conservan los metadatos de decision-model, de modo que un mismo fichero atiende generación de texto y la API TypeSafe de decisiones. Existe además un modo de lectura con y sin "thinking": el motor nativo reporta 167 req/s sin thinking y 150 req/s con modo `auto`.

## Capacidades

- Generación de texto conversacional multi-turno mediante `/v1/chat/completions`, con el mismo fichero GGUF que la ruta de decisiones.
- Emisión de decisiones tipadas mediante `/v1/systemone`: recibe un `state` en JSON arbitrario y un conjunto de preguntas con `type: choice`, `type: noul` o `type: score`, y devuelve probabilidades calibradas por opción.
- Calibración explícita: la model card reporta ECE (Expected Calibration Error) de 0,121–0,131 en GPQA Diamond y de 0,007–0,013 en el simulador de electrodomésticos, además de puntuaciones Brier.
- Respuestas estructuradas sin parseo: la salida es JSON con `answers`, `probabilities` y, en el caso de `score`, una leyenda que mapea valores numéricos a descripciones.
- Modo con y sin razonamiento: el motor nativo documenta una variante `auto` además de la ejecución sin thinking.
- Compatibilidad con endpoints OpenAI-like (`endpoints_compatible` en los tags).
- Capacidades multimodales (visión, audio) y tool calling / function calling: no documentadas en la información disponible.

## Casos de uso

- **Triaje de tickets de soporte**: enviar el texto o JSON del ticket como `state` y definir preguntas `choice` para el departamento destino (devoluciones, envíos, facturación) más un `score` de enfado del cliente. La model card incluye exactamente este ejemplo, con probabilidades como 0,957 para `returns` y 0,99997 para la condición de reembolso, lo que permite enrutar por umbral sin escribir reglas.
- **Enrutamiento en pipelines de agentes**: usar el modelo como componente de decisión entre pasos de un agente, donde cada opción es una herramienta o rama del flujo y la probabilidad calibrada sirve para escoger ruta o para escalar a revisión humana cuando la confianza es baja.
- **Clasificación con abstención controlada**: al disponer de ECE bajo, se puede fijar un umbral de confianza y derivar a revisión manual los casos por debajo, algo útil en moderación de contenido o categorización de documentos.
- **Evaluación de riesgo y scoring ordinal**: el tipo `score` con leyenda permite mapear intensidad (frustración, urgencia, severidad) a un escala numérica calibrada, aprovechable en priorización de colas o scoring de leads.
- **Simulación y tests de decisión**: la model card cita un simulador de electrodomésticos con 88 casos y 1.590 campos, lo que sugiere su uso para validar sistemas de decisión domésticos (interpretación de intenciones sobre dispositivos del hogar) antes de desplegarlos.
- **Despliegue en local o en el borde**: al ejecutarse sobre llama.cpp en Metal, CPU, CUDA o Vulkan, encaja en entornos sin GPU Blackwell, por ejemplo un portátil Mac o un servidor sin NVIDIA, manteniendo la API de decisiones.
- **Chat interno de bajo coste**: el mismo fichero sirve como modelo conversacional para asistentes internos, con la advertencia de que necesita `repeat_penalty` en torno a 1,1 para no entrar en bucles.

## Benchmarks y rendimiento

Resultados medidos a través del endpoint `/v1/systemone` (modo `systemone`, estilo de prompt `prefixed`, 0-shot, split completo puntuado, 0 errores de petición):

| Benchmark | Motor nativo (RTX PRO 6000) | span02-q4_k_m.gguf | span02-mxfp4.gguf |
|---|---|---|---|
| GPQA Diamond, accuracy (196 puntuados) | 46,94 % | 46,94 % | 47,45 % |
| GPQA Diamond, skill corregido por azar | 0,2925 | 0,2925 | 0,2993 |
| GPQA Diamond, ECE (menor es mejor) | no disponible | 0,131 | 0,121 |
| Electrodomésticos, caso exacto (88 casos) | 100 % | 93,18 % | 94,32 % |
| Electrodomésticos, accuracy por campo (1.590 campos) | no disponible | 99,56 % | 99,69 % |
| Electrodomésticos, ECE (menor es mejor) | no disponible | 0,013 | 0,007 |
| Decision Index, puntuación completa | 62,6 (puesto 4) | no disponible | no disponible |

Métricas del motor nativo en una RTX PRO 6000: latencia mediana de 33 ms (p95 de 822 ms), throughput de 167 req/s sin thinking y 150 req/s en modo `auto` con 64 peticiones en vuelo, y 110.201 de 110.201 peticiones respondidas. Las diferencias entre MXFP4 y Q4_K_M en GPQA (p = 0,92) y en el simulador de electrodomésticos (p = 0,76) no son significativas según test de dos proporciones. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el fichero MXFP4 ocupa 14,7 GB y el Q4_K_M 16,8 GB; a eso hay que sumar la caché KV del contexto elegido. Como referencia, el ejemplo de arranque usa `-c 8192`. Cálculo orientativo a partir del tamaño de fichero, no publicado por el autor.
- **GPU consumer**: el MXFP4 es la opción para tarjetas de 16 GB solo con contexto reducido; para funcionar con holgura conviene 24 GB (RTX 3090, RTX 4090). El Q4_K_M de 16,8 GB pide 24 GB para dejar espacio a la caché KV.
- **GPU de datacenter**: A100 40/80 GB, H100 o RTX PRO 6000 permiten contextos amplios y mayor concurrencia. No se requieren kernels Blackwell: es precisamente la limitación que esta conversión elimina.
- **CPU y Apple Silicon**: soportado vía llama.cpp en CPU, Metal y Vulkan; el rendimiento en estos entornos no está publicado.
- **Despliegue**: `llama-server` (llama.cpp) con `-m span02-mxfp4.gguf -c 8192 --repeat-penalty 1.1 --temp 0.8`. Para chat es necesario `repeat_penalty` en torno a 1,1 y temperatura en torno a 0,8, ya que el fine-tune entra en bucles sin penalización de repetición. vLLM y transformers no pueden cargar los pesos originales; para las GGUFs la vía documentada es llama.cpp.
- **Latencia y throughput**: solo publicados para el motor nativo (33 ms de mediana, 167 req/s). Para las GGUFs no hay cifras de latencia o throughput en la información disponible.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos de decisión de terceros comparables. La comparación relevante es entre las dos cuantizaciones publicadas y el original:

| Modelo | Parámetros | Formato / tamaño | Hardware requerido | Licencia | Notas |
|---|---|---|---|---|---|
| respanai/span-02 (original) | ~25,2 B totales, ~4 B activos | Pesos NVFP4/FP8, motor Rust/CUDA propio | NVIDIA Blackwell (RTX PRO 6000, RTX 5090), kernels `sm_120a` | apache-2.0 (Gemma 4 license) | Decision Index 62,6, 33 ms de mediana, 167 req/s |
| vasilee/span-02-gguf (MXFP4) | mismos pesos | GGUF, 14,7 GB | llama.cpp en CPU, Metal, CUDA, Vulkan | apache-2.0 | Mejor calibración de los dos (ECE 0,121 en GPQA); indistinguible de Q4_K_M en accuracy |
| vasilee/span-02-gguf (Q4_K_M) | mismos pesos | GGUF, 16,8 GB | llama.cpp, máxima compatibilidad de builds | apache-2.0 | Reproduce exactamente GPQA del motor nativo; ~6 pp por debajo en el simulador doméstico |

## Limitaciones y advertencias

- **Licencia**: el campo `license` es apache-2.0, pero `license_link` apunta a la Gemma 4 license de Google; conviene revisar los términos de uso de Gemma antes de un despliegue comercial, ya que pueden imponer restricciones adicionales a las de Apache 2.0.
- **Brecha frente al motor nativo**: ambas GGUFs quedan unos 6 puntos porcentuales por debajo en el simulador de electrodomésticos (93–94 % de casos exactos frente al 100 % del original) y fallan los mismos casos ambiguos: peticiones bloqueadas o ya satisfechas, dispositivos que no están en el hogar y pronombres referidos a un único dispositivo. La model card atribuye la brecha a la ruta de conversión (readout sin thinking, ruta de prompt de llama.cpp), no a la cuantización.
- **Bucles en generación de texto**: el fine-tune repite sin `repeat_penalty ~1.1` y `temperature ~0.8`; usar los valores por defecto de llama.cpp produce salidas degeneradas.
- **Contexto no documentado**: no se especifica la longitud máxima de contexto del modelo; el `-c 8192` del ejemplo es una decisión de despliegue, no un límite certificado.
- **Idiomas no documentados**: no hay lista oficial de idiomas soportados; el único indicio es un ejemplo de generación en rumano en la model card.
- **Riesgo de alucinación**: el modelo está diseñado para emitir probabilidades, no hechos verificados; en la ruta de chat libre mantiene los riesgos habituales de un modelo de lenguaje y no se han publicado evaluaciones de factualidad.
- **Madurez y validación externa**: 85 descargas y 1 like en el momento de la ficha, versión creada el 2026-10-19; no hay validación independiente ni informes de terceros.
- **Dependencia de llama.cpp**: la API `/v1/systemone` y los metadatos de decision-model requieren builds de llama.cpp con soporte de Gemma 4 y de este endpoint; otros runners (Ollama, TGI, vLLM) no están documentados para esta ruta.
- **Datos de entrenamiento opacos**: no se publican número de tokens, composición del dataset, ni si hubo RLHF/DPO, lo que dificulta evaluar sesgos conocidos; no se documentan sesgos específicos en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vasilee/span-02-gguf
- Modelo base: https://huggingface.co/respanai/span-02
- Decision Index (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Anuncio del modelo original: https://www.respan.ai/blog/introducing-span-2
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
