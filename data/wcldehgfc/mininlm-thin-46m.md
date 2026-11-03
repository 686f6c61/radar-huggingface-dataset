# wcldehgfc/miniNLM-thin-46m

## Resumen

miniNLM-thin-46m es un modelo de lenguaje de 46,34 millones de parámetros (27,90 millones no pertenecientes a la capa de embeddings) entrenado desde cero por el usuario wcldehgfc sobre un corpus de novelas web en chino. No es un modelo de propósito general ni un asistente: es un experimento de arquitectura y de pipeline de entrenamiento completo, pensado para estudiar el funcionamiento interno de un transformer y para generar continuaciones de texto narrativo en chino con un coste computacional mínimo.

El modelo emplea una arquitectura transformer de 18 capas con dimensión oculta 384, 8 cabezas de atención con GQA (2 cabezas KV), RoPE y QK-norm. Incorpora dos innovaciones destacables para su tamaño: atención residual (AttnRes), que sustituye la suma de residuos por una combinación ponderada aprendida de las salidas de todas las capas anteriores, y un mecanismo de "slots de memoria" de 32 tokens de lectura y 32 de escritura que arrastra un resumen semántico entre segmentos, elevando la ventana efectiva de 1024 a 2048 tokens.

Su relevancia es fundamentalmente didáctica y de investigación: el repositorio incluye el código de arquitectura, los scripts de entrenamiento y evaluación, y los pesos en fp32 (176,8 MB), de modo que se puede cargar y ejecutar en una GPU de consumo sin dependencias externas. No compite con modelos de chat o de código; su utilidad real es la generación de ficción en chino a corto plazo y el estudio de técnicas de atención y memoria en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 18 capas, d=384, 8 cabezas, GQA (2 cabezas KV), RoPE + QK-norm, atención residual (AttnRes), SwiGLU FFN, RMSNorm, weight tying |
| Parametros totales | 46.336.704 (46,34 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens nativos; 2048 efectivos mediante 32 slots de lectura + 32 de escritura por segmento |
| Tipos de cuantizacion | No disponible (solo se publican pesos fp32; no se documentan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, 176,8 MB en fp32); tokenizador SentencePiece BPE (spm48k_v4.model) |

Otros datos técnicos: vocabulario de 48.000 tokens (SentencePiece BPE), 146.000 pasos de entrenamiento, 7,20 mil millones de tokens vistos, entrenamiento en bf16 con AdamW y z-loss de 1e-4.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 18 capas con dimensión 384 y 8 cabezas de atención, de las cuales solo 2 son cabezas KV (GQA), lo que reduce el coste de caché KV en inferencia. Usa RoPE para posiciones y QK-norm para estabilizar la atención. La innovación principal es la atención residual (AttnRes): en lugar de acumular residuos sumando la salida de cada capa a la entrada, cada capa calcula una ponderación aprendida sobre las salidas de todas las capas anteriores, lo que en teoría facilita el flujo de gradiente y permite rutas de información más selectivas en redes profundas y estrechas.

El segundo mecanismo diferencial son los slots de memoria: cada segmento de 1024 tokens se precede de 32 tokens de "lectura" y se sigue de 32 tokens de "escritura"; la salida de los slots de escritura se reinyecta como slots de lectura del segmento siguiente, transportando un resumen semántico y extendiendo la ventana efectiva a 2048 tokens. El FFN es SwiGLU con RMSNorm y la capa de salida comparte pesos con los embeddings.

El entrenamiento se realizó desde cero sobre un corpus de novelas web chinas públicas, con 7,2 mil millones de tokens procesados en 146.000 pasos, precisión mixta bf16, optimizador AdamW y z-loss de 1e-4. No se documenta ninguna fase de RLHF ni DPO; el autor indica que el ajuste supervisado solo llegó al nivel de "aprender el formato de diálogo". El coste de entrenamiento reportado es de aproximadamente 2,9 s/paso en una única AMD RX 9060 XT de 16 GB con batch 4, acumulación de gradiente 6 y bloques de 1024 tokens.

## Capacidades

- Generación de texto narrativo en chino: continuación de fragmentos de novela web con formato de diálogo, comillas y saltos de párrafo correctos.
- Modelado de next-token con perplejidad de validación de 58,71 (loss 4,0726) y de test de 57,83 (loss 4,0576, IC 95 % ±0,014).
- Memoria entre segmentos: los slots de lectura/escritura permiten mantener cierta coherencia más allá de los 1024 tokens nativos, hasta 2048 efectivos.
- Formato de diálogo: reconoce y reproduce el patrón de intervenciones con comillas y atribuciones ("X dijo:").
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No tiene modo thinking, visión ni audio.
- Multilingüismo: únicamente chino; no se documenta competencia en otros idiomas.
- No apto para preguntas y respuestas, código, matemáticas ni conocimiento factual.

## Casos de uso

- Generación de ficción por continuación: dado un inicio de escena ("他推开客栈的门，"), el modelo produce un párrafo narrativo con diálogo y ambientación coherente a nivel local; es su caso de uso principal y el único para el que el autor lo recomienda.
- Prototipado de pipelines de entrenamiento: al incluir model.py, los scripts de entrenamiento y los de evaluación, sirve para reproducir de principio a fin un ciclo de entrenamiento de LM en una sola GPU de consumo.
- Estudio de atención residual y slots de memoria: permite ablacionar AttnRes y el mecanismo de memoria comparando pérdida de validación con una configuración baseline de residuo estándar.
- Enseñanza de tokenización y decodificación: con un vocabulario SentencePiece de 48.000 tokens y un ejemplo de 18 líneas, es un caso práctico para explicar sampling con temperature, top_k y repetition_penalty.
- Generación de datos sintéticos de ficción a pequeña escala: útil para aumentar corpus narrativos con texto de estilo consistente, siempre con revisión humana por la deriva temática tras 2-3 frases.
- Pruebas de despliegue en hardware modesto: con 176,8 MB de pesos fp32 cabe en cualquier GPU consumer y permite validar integraciones de inferencia (PyTorch + safetensors + SentencePiece) sin coste de infraestructura.
- Demostraciones educativas de decodificación especulativa o comparación de estrategias de sampling: el modelo es lo bastante pequeño para ejecutar múltiples configuraciones en paralelo en una sola tarjeta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta métricas de modelado de lenguaje:

| Metrica | Valor |
|---|---|
| Loss de validacion | 4,0726 |
| Perplejidad de validacion | 58,71 |
| Loss de test (600 batches) | 4,0576 |
| Perplejidad de test | 57,83 (IC 95 % ±0,014) |
| Tokens de entrenamiento | 7,20 B |
| Pasos de entrenamiento | 146.000 |

Las métricas de validación y test se calcularon con el mismo protocolo (n_seg=2, batch size 4, bloque de 1024 tokens, semilla fija) sobre fragmentos de novela reservados.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (176,8 MB de pesos más caché KV y activaciones para 2048 tokens); en la práctica, cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU para pruebas. En GPU, cualquier tarjeta moderna sirve: RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas dos últimas están enormemente sobredimensionadas para 46 M de parámetros.
- Cabe en GPU de consumo: sí, en todas las tarjetas actuales, incluidas las de gama de entrada y las integradas con suficiente memoria compartida.
- Opciones de despliegue: el repositorio solo documenta inferencia con PyTorch, safetensors y SentencePiece mediante el script example.py. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son utilizables sin conversión previa; no hay integración con vLLM ni TGI.
- Latencia y throughput: no se documentan cifras de inferencia. El único dato de rendimiento es el de entrenamiento: aproximadamente 2,9 s/paso en una AMD RX 9060 XT de 16 GB con batch 4, acumulación de gradiente 6 y bloques de 1024 tokens.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables para situar este modelo frente a alternativas. A continuación se comparan características estructurales con modelos pequeños de la misma categoría, sin datos de rendimiento relativos:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| miniNLM-thin-46m | 46,34 M | 1024 (2048 efectivos) | MIT | Chino, novelas web, desde cero |
| GPT-2 small | 124 M | 1024 | MIT | Inglés, propósito general |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Multilingüe, instrucciones |
| SmolLM2-135M | 135 M | 8192 | Apache 2.0 | Inglés, instrucciones |

La comparación relevante es de orden de magnitud: miniNLM-thin-46m es entre 3 y 10 veces más pequeño que las alternativas citadas y está especializado en un único dominio y un único idioma, por lo que no es sustituible por ellas en tareas generales ni viceversa.

## Limitaciones y advertencias

- Conocimiento muy limitado: 46 M de parámetros y un corpus único de novelas web implican un conocimiento factual casi nulo y una cobertura léxica restringida al registro narrativo.
- Deriva temática: el autor advierte que tras 2-3 frases el texto pierde coherencia y los nombres de personajes se mezclan entre sí.
- Sin ajuste a instrucciones: no ha recibido SFT más allá de aprender el formato de diálogo; no responde a instrucciones complejas ni a preguntas.
- Estrategias de decodificación frágiles: con temperature ≥ 0,9 aparecen repeticiones y la decodificación greedy cae en bucles del tipo "我是……我是……". El rango recomendado es temperature 0,7-0,8, top_k 40 y repetition_penalty 1,15.
- Idiomas: solo chino; no se ha entrenado ni evaluado en castellano ni en otras lenguas.
- Riesgo de reproducción de material con derechos: el corpus son novelas web públicas y el autor advierte explícitamente de que las salidas pueden reproducir fragmentos del entrenamiento; antes de un uso comercial debe evaluarse el riesgo de copyright, aunque los pesos se distribuyan con licencia MIT.
- Sesgos: no se documenta ninguna evaluación de sesgos; el corpus de ficción puede contener estereotipos de género, clase o nacionalidad sin filtrar.
- Alucinación: al ser un modelo de continuación de texto, no distingue entre hecho y ficción; cualquier dato que genere debe tratarse como inventado.
- Madurez del proyecto: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día; sin comunidad ni mantenimiento demostrado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wcldehgfc/miniNLM-thin-46m
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados al modelo.
