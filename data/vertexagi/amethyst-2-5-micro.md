# VertexAGI/amethyst-2-5-micro

## Resumen

Amethyst 2.5 Micro es un modelo de chat de 1.720.574.976 parametros, resultado de un ajuste fino por LoRA sobre Qwen3-1.7B. Lo desarrolla VertexAGI, presentado en la model card como un proyecto de investigacion independiente sin animo de lucro que trabaja en abierto. El objetivo declarado no es mejorar la calidad bruta del modelo base, sino especializarlo en tres comportamientos concretos: decidir cuando invocar una herramienta `web_search`, responder de forma breve citando los fragmentos usados como `[1]`, `[2]`, y admitir explicitamente cuando los resultados de busqueda no contienen la respuesta en lugar de inventarla.

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso con embeddings atados, 28 capas y 1.7B parametros. El ajuste fino empleo 3.205 conversaciones sinteticas (4.683 muestras tras dividir por turno del asistente) destiladas de modelos profesor de mayor tamano (GLM 5.3 y 5.3 Flash, Kimi K3, poolside Laguna S 2.1 y MiniMax M3.1 Flash) a traves de NVIDIA NIM y OpenRouter. Todos los resultados de busqueda del dataset son inventados por los profesores; no se raspo ninguna pagina web real.

Su relevancia practica es acotada pero clara: el modelo base Qwen3-1.7B apenas produce llamadas de herramienta bien formadas con este formato de prompt (0-25% segun los conjuntos de validacion manual del autor), mientras que Micro alcanza el 100% de llamadas bien formadas y el 0% de busquedas innecesarias en tres pequenos conjuntos held-out. El propio autor reconoce que la calidad de las respuestas tras la busqueda esta practicamente empatada con el base (8 victorias frente a 7 derrotas en el brazo sin thinking) y que pierde frente a Amethyst 2.5 Mini (4B) por 4 a 9. Se trata, por tanto, de un invocador de herramientas pequeno, barato y disciplinado, no de un modelo mas inteligente que su base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3: transformer decoder-only denso, 28 capas, embeddings atados |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | MLX mixta (capas ajustadas en 8-bit, embeddings y normalizaciones como en el base), GGUF Q8_0 y GGUF Q4_K_M; etiqueta 4-bit en el repo |
| Idiomas soportados | Ingles (unicamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, `model.safetensors` en la raiz), GGUF (`amethyst_2_5_micro_Q8_0.gguf`, `amethyst_2_5_micro_Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `mlx-community/Qwen3-1.7B-4bit` y aplica LoRA de rango 16, escala 20.0 y dropout 0.0 sobre las 28 capas, cubriendo 196 capas lineales adaptadas (7 por capa). El calculo de perdida se restringe a los turnos del asistente (`mask_prompt`). El entrenamiento uso el optimizador Adam con tasa de aprendizaje constante de 6e-5, tamano de lote 4, longitud de secuencia 2.048 y gradient checkpointing, durante 2 epocas y 2.341 iteraciones en una unica ejecucion ininterrumpida. La perdida de validacion (solo tokens del asistente) cayo de 4,59 a aproximadamente 1,01 hacia la iteracion 1.400. Todo el pipeline se ejecuto con MLX / `mlx-lm` en Apple Silicon.

Una decision tecnica destacable es la construccion del build MLX: una fusion directa de la LoRA en 4-bit recuantizaria y destruiria el ajuste fino, por lo que las 196 capas adaptadas se fusionan en fp16 y se recuantizan a 8-bit. En 60 conversaciones de validacion, la perdida de secuencia completa del modelo fusionado fue 3,337 frente a 3,331 del adaptador sin fusionar, y sus puntuaciones held-out coinciden con las del adaptador. Los datos de entrenamiento son 3.205 conversaciones sinteticas organizadas por categoria: chat general (817), respuestas directas sin busqueda (309 mas 42 de dos turnos), instrucciones de formato terso (500), busqueda de hechos actuales con una consulta (502), fuentes en desacuerdo (127), refinamiento de consulta (97 mas 21), fallo de busqueda (192), resultados en tema pero sin la respuesta (448) y resumenes, multi-consulta y seguimientos (150). Las filas con resultados de busqueda pasaron un control automatico de fundamentacion: la respuesta final solo puede citar resultados existentes y solo puede usar numeros y nombres propios capitalizados presentes en el ultimo resultado o en la pregunta.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas deliberadamente breves y directas.
- Invocacion de la herramienta `web_search` con llamadas bien formadas y decision explicita de no buscar cuando la pregunta es estable.
- Respuestas con citas de las fuentes consultadas en formato `[1]`, `[2]`.
- Reconocimiento de fuentes contradictorias: declara la discrepancia y cita ambas.
- Refinamiento de consulta cuando los primeros resultados son debiles, con una nueva query y respuesta posterior.
- Gestion explicita del fallo de busqueda (timeout, 503, cero resultados): informa de que no pudo obtener la informacion sin adivinar.
- Capacidad de decir que los resultados, aunque en tema, no contienen la respuesta, citando lo que si dicen.
- Resumenes con citas, descomposicion de consultas y seguimiento de preguntas elipticas.
- Cumplimiento de instrucciones de formato estricto ("exactamente 3 vinetas", "menos de 20 palabras", "una sola frase"), traduccion y reescritura.
- Modelo de un solo idioma: no se declaran capacidades multilingues.
- No se declaran capacidades de vision, audio ni modo thinking explicito en la informacion disponible.

## Casos de uso

- Agente de busqueda web en produccion: el modelo decide por si mismo cuando invocar `web_search` y emite llamadas bien formadas en el 100% de los prompts de busqueda de los conjuntos de validacion del autor, lo que lo hace adecuado como capa de enrutamiento y formateo en pipelines de agentes donde el modelo grande solo sintetiza despues.
- Asistente de hechos actuales con trazabilidad: para preguntas sobre noticias, resultados deportivos o precios, responde de forma breve citando los fragmentos usados, lo que permite auditar cada afirmacion contra la fuente recuperada.
- Atencion al cliente con base de conocimiento externa: al recibir resultados de un buscador corporativo, el modelo cita lo relevante y, si la busqueda falla o no contiene la respuesta, lo dice en lugar de improvisar, reduciendo el riesgo de respuestas inventadas ante el usuario final.
- Verificacion de afirmaciones y control de calidad de respuestas: dado un par pregunta-resultados, el modelo declara si los resultados sostienen la respuesta o si simplemente estan en tema, lo que sirve como filtro automatico de alucinaciones en un pipeline RAG.
- Ejecucion local en portatiles Apple Silicon: el build MLX ocupa 1,6 GB y el GGUF Q4_K_M 1,1 GB, lo que permite desplegar el invocador de herramientas en un Mac sin GPU dedicada y mantener el modelo grande en servidor.
- Prototipado rapido de agentes con tool calling: con 1,7B parametros y licencia Apache 2.0, sirve para iterar sobre prompts de sistema, esquemas de herramientas y formatos de citacion antes de escalar a un modelo mayor.
- Generacion de respuestas concisas bajo restricciones de formato: util en interfaces con limite de caracteres, resumenes de una frase o transformaciones de texto donde el cumplimiento estricto de la instruccion importa mas que la profundidad del razonamiento.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Los unicos datos son evaluaciones manuales internas sobre tres pequenos conjuntos held-out y comparaciones ciegas por pares:

| Evaluacion | Amethyst 2.5 Micro | Qwen3-1.7B base |
|---|---|---|
| Llamadas de herramienta bien formadas (3 conjuntos held-out) | 100% | 0-25% |
| Busquedas innecesarias en preguntas estables | 0% | no disponible |
| Perdida de validacion (solo tokens del asistente) | ~1,01 hacia la iteracion 1.400 (desde 4,59) | no disponible |
| Perdida de secuencia completa, 60 conversaciones (fusionada vs adaptador) | 3,337 vs 3,331 | no disponible |

| Comparacion por pares | Resultado |
|---|---|
| Calidad de respuesta tras busqueda, Micro vs Qwen3-1.7B base (sin thinking) | 8 victorias, 7 derrotas |
| Micro vs Amethyst 2.5 Mini (4B) | 4 victorias, 9 derrotas |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con GGUF Q4_K_M, 1,8 GB con GGUF Q8_0 y 1,6 GB con el build MLX mixto; a estos valores hay que sumar el overhead de contexto y el runtime.
- Cabe con holgura en GPU consumer: cualquier tarjeta con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) y en Apple Silicon via MLX.
- GPU de datacenter (A100, H100) sobredimensionadas para este tamano; su uso tendria sentido solo por agregacion de muchas instancias concurrentes.
- Opciones de despliegue: `mlx-lm` en Apple Silicon, llama.cpp, Ollama y LM Studio con los GGUF, y servidores compatibles con endpoints segun la etiqueta `endpoints_compatible`. No se menciona soporte explicito de vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formatos |
|---|---|---|---|---|---|
| Amethyst 2.5 Micro | 1,7B | no disponible | Chat breve con tool calling de busqueda y citas | Apache 2.0 | safetensors (MLX), GGUF Q8_0, GGUF Q4_K_M |
| Qwen3-1.7B (base) | 1,7B | no disponible | Modelo generalista | Apache 2.0 | safetensors, GGUF (comunidad) |
| Amethyst 2.5 Mini | 4B | no disponible | Misma receta que Micro, mayor tamano | Apache 2.0 (heredada del base, segun familia) | no disponible en esta ficha |

Frente a Qwen3-1.7B, Micro intercambia algo de calidad general por disciplina de formato: gana claramente en llamadas de herramienta bien formadas y brevedad, pero empata en calidad de respuesta tras la busqueda. Frente a Amethyst 2.5 Mini pierde en comparacion directa (4 a 9), lo que situa a Micro como opcion de coste minimo cuando la latencia, el consumo de memoria o el despliegue en dispositivo son la restriccion dominante.

## Limitaciones y advertencias

- Solo ingles: no se declaran capacidades multilingues, por lo que no es adecuado para castellano sin evaluacion previa.
- Riesgo de alucinacion persistente: el ajuste ensena a admitir resultados insuficientes, pero la calidad de respuesta tras la busqueda esta practicamente empatada con el base (8 victorias frente a 7 derrotas), sin garantia de mejora factual.
- Los resultados de busqueda del entrenamiento son inventados por modelos profesor; el modelo nunca ha visto paginas web reales, lo que puede producir desajustes con formatos, ruido y longitudes de snippets reales.
- Las evaluaciones del autor se apoyan en tres conjuntos held-out pequenos y de fabricacion manual; no hay benchmarks estandar ni evaluaciones de terceros que las respalden.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; al derivar de Qwen3-1.7B y de profesores propietarios, hereda los sesgos de ambos, no evaluados aqui.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B y de los datos destilados de profesores propietarios antes de un despliegue comercial.
- El build MLX no es una fusion 4-bit convencional: usar una recuantizacion propia a 4 bits puede degradar el ajuste fino, como advierte el autor.
- Longitud de contexto no documentada en esta ficha: debe confirmarse contra la model card de Qwen3-1.7B antes de disenar prompts largos.
- Modelo con cero descargas y cero likes en el momento de la consulta: madurez y soporte comunitario inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/amethyst-2-5-micro
- Modelo hermano Amethyst 2.5 Mini: https://huggingface.co/VertexAGI/amethyst-2-5-mini
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint de ajuste fino: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
- Framework MLX: https://github.com/ml-explore/mlx
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo o demos adicionales del modelo.
