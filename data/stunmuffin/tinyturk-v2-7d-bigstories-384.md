# stunmuffin/TinyTurk-v2.7d-bigstories-384

## Resumen

TinyTurk v2.7d BigStories-384 es un modelo de lenguaje causal en turco de 1.121.920 parámetros (1,12 M) desarrollado por el proyecto TinyTurk bajo la autoría de stunmuffin. Se trata de un transformer decoder-only de estilo GPT con normalización Pre-LN, codificación posicional RoPE y RMSNorm, entrenado desde cero sobre un subconjunto de 49.000 relatos del dataset Turkish TinyStories. Su rasgo distintivo es la ventana de contexto de 384 tokens, resultado de un escalado progresivo de longitud de contexto en tres etapas (128, 256 y 384 tokens) sobre la misma familia de checkpoints.

El modelo no está afinado por instrucciones ni alineado en seguridad: es un modelo de lenguaje base orientado a la generación de frases y micro-párrafos en turco. Su relevancia es fundamentalmente metodológica, ya que documenta de forma reproducible cómo escalar la longitud de contexto en modelos diminutos, con un coste de entrenamiento de aproximadamente 10 minutos en una única GPU moderna y un tamaño de pesos de unos 4,5 MB en float32. No obstante, el propio autor lo describe como un artefacto de investigación experimental, no como un producto.

En el momento de redactar esta ficha, el repositorio acumula 0 descargas y 0 "likes", por lo que no existe validación externa de su comportamiento más allá de las métricas reportadas por el autor (perplejidad de validación de 3,69 con ventanas de 384 tokens).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT, Pre-LN |
| Parámetros totales | 1.121.920 (1,12 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantización | No disponible (no se publican variantes cuantizadas; pesos en formato PyTorch nativo) |
| Idiomas soportados | Turco (tr) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (checkpoint PyTorch con claves `config` y `model_state_dict`); tokenizador SentencePiece `tokenizer_v11_bpe_512.model` |
| Capas | 4 |
| Dimensión del modelo | 128 |
| Cabezas de atención | 4 (head_dim = 32) |
| Dimensión oculta de la FFN | 512 (principal) + 256 (micro) |
| Vocabulario | 512 subpalabras BPE (SentencePiece) |
| Codificación posicional | RoPE (theta = 10.000) |
| Normalización | RMSNorm (eps = 1e-6) |
| Activación | GELU |
| Dropout | 0,10 |
| Atado de pesos (weight tying) | Sí |
| Librería | PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 4 capas con dimensión de modelo 128, 4 cabezas de atención de 32 dimensiones cada una y una FFN con dimensión oculta de 512 más una proyección "micro" de 256. Usa Pre-LN con RMSNorm, activación GELU, dropout de 0,10, RoPE con theta de 10.000 para la codificación posicional y atado de pesos entre la matriz de embedding y la cabeza de salida. El vocabulario es deliberadamente pequeño: 512 subpalabras BPE entrenadas con SentencePiece, lo que reduce el coste computacional pero penaliza la compresión del texto turco.

El entrenamiento siguió una escalada progresiva de contexto en tres fases sobre el dataset Turkish TinyStories: primero un entrenamiento desde cero con contexto de 128 tokens durante 15 épocas (checkpoint BigStories), después un afinado a 256 tokens durante 10 épocas (BigStories-256) y finalmente el afinado a 384 tokens durante 10 épocas que da lugar a este modelo. Se usó el optimizador AdamW con learning rate de 8e-5, decaimiento coseno con un 5 % de warmup, weight decay de 0,01, recorte de gradiente de 1,0, batch size de 12 y semilla 42, partiendo del checkpoint `tiny_gpt_v2.7d_bigstories_256_best.pt`. El tiempo total de entrenamiento de esta etapa fue de aproximadamente 10 minutos en una única GPU moderna. No se aplicó RLHF, DPO ni ningún tipo de ajuste por instrucciones o alineación.

## Capacidades

- Generación de texto causal en turco a nivel de frase y micro-párrafo, con salidas de hasta unos 300 tokens según los ejemplos del autor.
- Continuación de prompts narrativos sencillos con sintaxis y gramática correctas.
- Modelado de lenguaje puro: útil para medir perplejidad y cross-entropy sobre texto turco.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificación.
- No dispone de modo de razonamiento explícito (thinking mode).
- No dispone de visión, audio ni ninguna otra modalidad.
- Multilingüismo: limitado al turco, con posible filtración de nombres propios en inglés (Alice, Tom, Tim) por el origen traducido del corpus.
- No hay ajuste por instrucciones: no responde a comandos ni mantiene conversaciones multi-turno.
- Continuidad de personajes parcial y arco narrativo limitado, según reconoce el propio autor.

## Casos de uso

- Investigación sobre escalado de contexto en modelos diminutos: el modelo forma parte de una serie de tres checkpoints (128, 256 y 384 tokens) con métricas comparables, lo que permite estudiar la relación entre longitud de contexto, perplejidad y calidad de generación con un coste experimental mínimo.
- Docencia y formación en arquitecturas transformer: con 4 capas y 1,12 M de parámetros, el modelo y su código de entrenamiento son reproducibles en unos 10 minutos, lo que lo hace adecuado para explicar RoPE, RMSNorm, atado de pesos y decodificación autoregresiva en un aula.
- Inferencia en dispositivo y entornos embebidos: los pesos ocupan aproximadamente 4,5 MB en float32, por lo que caben holgadamente en Raspberry Pi, dispositivos móviles o incluso microcontroladores con suficiente memoria, siempre que se implemente la arquitectura personalizada.
- Pruebas de tokenizadores BPE en turco: su vocabulario de 512 subpalabras permite evaluar el impacto de vocabularios muy reducidos en la fragmentación y en la calidad de la generación para el turco.
- Generación de texto sintético a nivel de frase para pruebas de pipelines: útil para generar corpus de prueba en turco con fines de testeo de sistemas de indexación, traducción o detección de idioma, sin implicaciones de privacidad.
- Benchmarks de despliegue ligero: sirve como carga mínima para validar exportaciones a ONNX o ExecuTorch, medir sobrecarga de frameworks y comparar latencias en CPU frente a GPU en un escenario sin cuello de botella de memoria.
- Experimentos educativos de muestreo: la temperatura (0,9) y el top-k (40) usados en los ejemplos del autor permiten ilustrar de forma práctica el efecto de los hiperparámetros de decodificación en la coherencia del texto.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas de modelado de lenguaje y la comparación interna de la familia. No hay resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones estándar.

| Métrica | Valor |
|---|---|
| Cross-entropy de validación | 1,3046 |
| Perplejidad de validación (ventanas de 384 tokens) | 3,69 |

Escalado progresivo de contexto reportado por el autor:

| Modelo | Contexto | Perplejidad de validación | Longitud de salida |
|---|---:|---:|---:|
| BigStories | 128 | 3,99 | 100 tokens |
| BigStories-256 | 256 | 3,60 | 200 tokens |
| BigStories-384 (este modelo) | 384 | 3,69 | 300 tokens |

Nota del autor: la perplejidad se calcula sobre ventanas de 384 tokens, una evaluación más difícil que la de ventanas cortas; por eso el modelo de 256 tokens reporta una perplejidad menor (3,60) pese a tener menos contexto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 MB en total en float32 (unos 4,5 MB de pesos más en torno a 1,6 MB de caché KV para 384 tokens con 4 capas, 4 cabezas y head_dim de 32). Cálculo derivado del recuento de parámetros, no una cifra publicada por el autor.
- GPU recomendadas: cualquiera, incluidas GPU de gama de entrada e integradas. El modelo no requiere aceleradores de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo, y también funciona en CPU sin penalización práctica.
- Opciones de despliegue: PyTorch con el código personalizado del repositorio (`model.py`, clase `TinyTurkGPTV27`). No hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es propia y no está integrada en esas herramientas. La conversión a ONNX o ExecuTorch es técnicamente posible pero no está publicada.
- Latencia y throughput: no disponible. El único dato temporal aportado es el entrenamiento de esta etapa, de aproximadamente 10 minutos en una única GPU moderna.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos de terceros directamente comparables (1,12 M de parámetros, turco, entrenados desde cero sobre TinyStories traducido). La comparación más pertinente es dentro de la propia familia TinyTurk:

| Modelo | Parámetros | Contexto | Perplejidad | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| TinyTurk v2.7d | 1,12 M | 128 | 9,48 | MIT | Hugging Face |
| TinyTurk v2.7d-bigstories | 1,12 M | 128 | 3,99 | MIT | Hugging Face |
| TinyTurk v2.7d-bigstories-256 | 1,12 M | 256 | 3,60 | MIT | Hugging Face |
| TinyTurk v2.7d-bigstories-384 (este modelo) | 1,12 M | 384 | 3,69 | MIT | Hugging Face |

La diferencia entre TinyTurk v2.7d (perplejidad 9,48) y la variante BigStories (3,99) refleja el cambio de corpus de entrenamiento, no solo de contexto. Alternativas de terceros: no disponible.

## Limitaciones y advertencias

- Coherencia narrativa limitada: el modelo produce frases fluidas pero no mantiene un arco argumental consistente y la continuidad de personajes es solo parcial.
- Datos de entrenamiento traducidos automáticamente del inglés: pueden aparecer nombres propios ingleses (Alice, Tom, Tim) en el texto turco, así como traducciones literales poco naturales.
- Vocabulario muy reducido de 512 subpalabras BPE, lo que fragmenta en exceso el turco y limita la calidad de la representación.
- Tamaño insuficiente para modelado narrativo robusto: 1,12 M de parámetros es un orden de magnitud inferior a los modelos pequeños convencionales.
- Sin ajuste por instrucciones: es un modelo de lenguaje base, no responde a comandos ni mantiene diálogo.
- Sin alineación de seguridad: las salidas pueden ser incoherentes o inapropiadas; no debe exponerse a usuarios finales sin filtrado.
- Ventana de contexto de 384 tokens: insuficiente para documentos, conversaciones largas o generación de texto extenso.
- Cobertura de idioma limitada al turco; no se ha documentado comportamiento en otras lenguas.
- Licencia MIT: permite uso comercial y modificación sin restricciones, pero la calidad del modelo hace desaconsejable cualquier aplicación en producción orientada al usuario.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible; el corpus procede de una traducción automática de TinyStories, lo que puede arrastrar sesgos de la fuente original y artefactos de traducción.
- Riesgo de alucinación: alto en términos de coherencia factual, ya que el modelo no está diseñado para responder preguntas ni para adherirse a hechos.
- Usos fuera de alcance declarados por el autor: relatos largos, seguimiento de instrucciones, chat y cualquier aplicación crítica para la seguridad.
- Repositorio sin tracción: 0 descargas y 0 "likes" en el momento de la consulta, sin validación independiente de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stunmuffin/TinyTurk-v2.7d-bigstories-384
- Modelo predecesor (contexto 256): https://huggingface.co/stunmuffin/TinyTurk-v2.7d-bigstories-256
- Modelo predecesor (contexto 128, corpus BigStories): https://huggingface.co/stunmuffin/TinyTurk-v2.7d-bigstories
- Modelo base de la familia: https://huggingface.co/stunmuffin/TinyTurk-v2.7d
- Colección de modelos diminutos para inferencia en dispositivo: https://huggingface.co/collections/Falln87/tiny-models
- Cita sugerida por el autor: `@misc{tinyturk_v27d_bigstories_384_2026, title = {TinyTurk v2.7d BigStories-384: Turkish 1.12M-parameter LM with 384-token context}, author = {TinyTurk Project}, year = {2026}}`
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
