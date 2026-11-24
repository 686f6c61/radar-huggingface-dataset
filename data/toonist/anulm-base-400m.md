# toonist/AnuLM-Base-400M

## Resumen

AnuLM-Base-400M es un modelo de lenguaje base de tipo mixture-of-experts (MoE) desarrollado por el usuario toonist. Se trata de un modelo pequeno, de 397,66 millones de parametros totales y 173,5 millones activos por token, entrenado desde cero sobre texto en hindi, ingles y codigo Python. Su proposito es servir como base para continuar prosa en hindi o ingles y como punto de partida para el ajuste fino de tareas como traduccion y respuesta a preguntas.

El modelo emplea una arquitectura transformer con 20 capas, atencion GQA (16 cabezas de consulta y 4 de clave-valor), QK-norm, RoPE con theta de 1.000.000 y una ventana deslizante de 256 en las capas 0 a 9. La capa 0 usa un MLP denso SwiGLU y las capas 1 a 19 incorporan 24 expertos enrutados de 192 dimensiones con enrutamiento top-4 y balanceo mediante sesgo sin funcion auxiliar de perdida. El contexto es de solo 512 tokens y el vocabulario de 32.768 entradas con embeddings no atados.

Es relevante por su caracter experimental y abierto: se entreno en una unica GPU de consumo, con unos 150 millones de tokens procesados en 36.000 pasos, y se distribuye con licencia CC BY-SA 4.0. No obstante, su escala, su ventana de contexto y su naturaleza de modelo base lo limitan a experimentacion y prototipado, no a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (24 expertos enrutados, top-4), GQA, QK-norm, RoPE, ventana deslizante |
| Parametros totales | 397.660.560 |
| Parametros activos | 173,5 millones por token |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el autor recomienda cargar en float32; no se documentan cuantizaciones GGUF ni otras) |
| Idiomas soportados | hindi (hi), ingles (en); incluye codigo Python en el entrenamiento |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (model.safetensors); tokenizer en tokenizer.json y tokenizer.multi32k.json |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 20 capas con hidden size de 1.024. Emplea atencion GQA con 16 cabezas de consulta y 4 de clave-valor, QK-norm y RoPE con theta de 1.000.000. Las capas 0 a 9 usan una ventana deslizante de 256 tokens. La capa 0 contiene un MLP denso SwiGLU, mientras que las capas 1 a 19 incorporan 24 expertos enrutados de 192 dimensiones con enrutamiento top-4, sin experto compartido y con balanceo aux-loss-free mediante un sesgo por experto actualizado a una tasa de 3e-3. El vocabulario es de 32.768 entradas y los embeddings no estan atados.

El entrenamiento se realizo desde cero sobre tres fuentes: dumps de Wikipedia y Wikisource en hindi (CC BY-SA), una pequena porcion de C4 en ingles (ODC-BY) y codigo Python de codeparrot-clean (GitHub, licencias mixtas). Se ejecutaron 36.000 pasos con batch de 8 x 512, lo que supone aproximadamente 150 millones de tokens, en una unica GPU de consumo. La perdida de validacion reportada es de 4,441 en el paso 36.000 sobre el split mixto reservado. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion y continuacion de texto en hindi e ingles, manteniendo el registro del prompt (estilo enciclopedico, narrativo o codigo).
- Generacion de codigo Python a partir de una firma o contexto de codigo.
- Modelo base sin instrucciones: no esta ajustado para seguir ordenes ni para conversacion.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas a hindi e ingles.
- No dispone de modo thinking, vision ni audio.
- Ajuste fino disponible mediante `finetune.py` con pares pregunta/respuesta en JSONL.

## Casos de uso

- Continuacion de prosa en hindi: dado un titulo o frase inicial, el modelo genera texto con estilo de articulo enciclopedico o narrativo, util para experimentar con generacion en hindi a baja escala.
- Generacion de fragmentos de codigo Python: a partir de una firma de funcion o un contexto de codigo, produce continuaciones que sirven como base para prototipos y pruebas de generacion de codigo.
- Punto de partida para ajuste fino supervisado: `finetune.py` acepta pares pregunta/respuesta en JSONL, lo que permite adaptar el modelo a tareas concretas de respuesta a preguntas en hindi o ingles.
- Investigacion sobre arquitecturas MoE pequenas: su configuracion (24 expertos, top-4, balanceo sin perdida auxiliar) lo hace util para estudiar el comportamiento del enrutamiento en modelos de menos de 400 millones de parametros.
- Experimentos de destilacion o comparacion de tokenizadores: el tokenizador multi32k y el modelo permiten evaluar el impacto del vocabulario y del entrenamiento multilingue en modelos pequenos.
- Educacion y divulgacion: al entrenarse en una sola GPU de consumo y publicarse con scripts reproducibles, sirve para demostrar el ciclo completo de entrenamiento de un modelo de lenguaje desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado por el autor es la perdida de validacion de 4,441 en el paso 36.000 sobre el split mixto reservado.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,6 GB para los pesos (397,7 millones de parametros), mas overhead de activaciones y cache KV.
- El autor indica que el modelo se entreno en una unica GPU de consumo, por lo que la inferencia cabe en GPUs consumer con al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente; no se requieren A100 ni H100.
- Despliegue mediante `transformers` con `trust_remote_code=True` o mediante los scripts del repositorio AnuLM (`sample.py`, `serve.py`).
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el autor advierte que las batches deben ir sin padding (una secuencia a la vez) y que no se soporta beam search.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes ni mantiene conversaciones de forma fiable.
- Todo el contenido factual que genera es inventado; nombres, fechas y cifras deben tratarse como ficcion.
- Contexto muy limitado (512 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura linguistica restringida a hindi e ingles; no se documenta soporte de castellano.
- Riesgo elevado de alucinacion por su escala y por el volumen de entrenamiento (unos 150 millones de tokens).
- Licencia CC BY-SA 4.0: impone obligaciones de atribucion y compartir-al-igual, lo que puede condicionar el uso comercial.
- El codigo Python del entrenamiento proviene de GitHub con licencias mixtas, lo que anade incertidumbre sobre la procedencia de parte de los datos.
- El modelo requiere cargarse en float32; forzar bfloat16 altera el sesgo del enrutador y provoca colapso en la generacion.
- No soporta beam search ni batches con padding.
- El autor declara no estar afiliado a AI4Bharat, BharatGen ni al Gobierno de India.

## Enlaces

- Hugging Face: https://huggingface.co/toonist/AnuLM-Base-400M
