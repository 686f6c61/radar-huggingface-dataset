# toonist/AnuLM-Base-400M

## Resumen

AnuLM-Base-400M es un modelo de lenguaje base de 397,66 millones de parámetros desarrollado por el usuario toonist y publicado en HuggingFace bajo licencia CC BY-SA 4.0. Es una reimplementación independiente del diseño del modelo Sarvam 30B a escala reducida: un transformer con mezcla de expertos (MoE) de 20 capas, dimensión oculta de 1.024, GQA con 16 cabezas de consulta y 4 de clave-valor con QK-norm, y 24 expertos enrutados de 192 dimensiones con enrutado top-4 en las capas 1 a 19. Solo 173,5 millones de parámetros están activos por token.

El modelo se preentrenó desde cero sobre hindi, inglés y código Python con un tokenizador propio (`multi32k`, 32.768 entradas), durante 36.000 pasos con lote de 8 × 512, lo que equivale a unos 147,5 millones de tokens vistos en una única GPU de consumo. Su comportamiento declarado es la continuación de texto en el registro del prompt: un título en hindi seguido de una línea en blanco produce prosa tipo Wikipedia o Wikisource, y una firma de función produce código Python. No es un modelo instruido: no ha pasado por RLHF, DPO ni ajuste de instrucciones.

Su relevancia es fundamentalmente experimental. Demuestra que un MoE con enrutado top-4, balanceo por sesgo sin pérdida auxiliar y sin experto compartido puede entrenarse y servirse en hardware de consumo, y sirve como punto de partida para fine-tuning en lenguas indias (el autor lo usó para derivar sus modelos de traducción y de pregunta-respuesta). La ventana de contexto es de solo 512 tokens, el modelo no está integrado en `transformers` y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mezcla de expertos (MoE); reimplementación del diseño Sarvam 30B |
| Parámetros totales | 397.660.560 (397,7 M) |
| Parámetros activos | 173,5 M por token (24 expertos enrutados, top-4, sin experto compartido) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible; solo se publican pesos en bfloat16 (sin GGUF, GPTQ ni AWQ) |
| Idiomas soportados | Hindi (hi) e inglés (en); dominio de código en Python |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `model.safetensors` (bfloat16); tokenizador en `tokenizer.multi32k.json` (BPE byte-level en formato JSON propio) |
| Capas | 20 |
| Dimensión oculta | 1.024 |
| Atención | GQA 16 cabezas de consulta / 4 de clave-valor, QK-norm, RoPE con theta = 1.000.000 |
| Ventana deslizante | 256 tokens en las capas 0-9 (atención completa en las capas 10-19) |
| MLP | SwiGLU denso en la capa 0; 24 expertos enrutados de 192 en las capas 1-19, enrutado top-4 |
| Balanceo de expertos | Sesgo sin pérdida auxiliar, `bias_update_rate` 3e-3 |
| Vocabulario | 32.768 entradas |
| Embeddings | No atados (untied) |
| Precisiones de entrenamiento | bfloat16 (pesos publicados en bfloat16) |
| Tamaño del repositorio | 0,8 GB |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de publicación (metadatos HF) | 18 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un decoder-only de 20 capas con mezcla de expertos. Cada capa usa atención con GQA (16 cabezas de consulta, 4 de clave-valor) y QK-norm, con RoPE de theta 1.000.000. Las capas 0 a 9 emplean además una ventana deslizante de 256 tokens, mientras que las capas 10 a 19 usan atención completa; la capa 0 mantiene un MLP SwiGLU denso y las capas 1 a 19 lo sustituyen por 24 expertos de dimensión 192 con enrutado top-4, sin experto compartido. El balanceo de carga se hace con un sesgo ajustado a tasa 3e-3 sin pérdida auxiliar. Los embeddings de entrada y salida no están atados y el vocabulario tiene 32.768 entradas. La configuración es la que el autor seleccionó tras las ablaciones descritas en `docs/RESULTS.md` (§12 y §16), y `docs/ARCHITECTURE.md` (§10) documenta qué decisiones del diseño Sarvam 30B se mantuvieron a esta escala.

El preentrenamiento se hizo desde cero sobre tres fuentes públicas: volcados de Wikipedia y Wikisource en hindi (licencia CC BY-SA, procesados con `fetch_hindi.py` y `filter_prose.py`), una porción pequeña de C4 de allenai para inglés (ODC-BY, `fetch_web.py`) y codeparrot-clean para Python (licencias mixtas de GitHub, deduplicado, `fetch_code.py`). El entrenamiento fue de 36.000 pasos con lote 8 × 512, aproximadamente 147,5 millones de tokens, en una sola GPU de consumo, usando el tokenizador `multi32k`. No hay fases de RLHF, DPO ni ajuste supervisado: se trata de un checkpoint base. La pérdida de validación declarada es 4,441 en el paso 36.000 sobre el split mixto reservado.

## Capacidades

- Generación y continuación de texto: prosigue el texto en el registro del prompt (prosa enciclopédica, narrativa, código) sin seguir instrucciones explícitas.
- Generación de código Python: dada una firma de función o un fragmento inicial, continúa con código plausible, aunque no verificado.
- Multilingüismo limitado a dos idiomas naturales: hindi e inglés, ambos presentes en el corpus de preentrenamiento.
- Cobertura de un tercer dominio: código Python, entrenado de forma conjunta con los dos idiomas mediante un tokenizador compartido.
- Modelo base reutilizable: admite fine-tuning mediante `finetune.py --qa pairs.jsonl` (formato JSONL de pares pregunta/respuesta), tal como el autor hizo para derivar sus modelos de traducción y de pregunta-respuesta.
- Servido local sencillo: incluye `sample.py` (generación por línea de comandos) y `serve.py` (página web de continuación de texto en `http://127.0.0.1:8000`).
- No soporta tool calling, function calling, uso de agentes, razonamiento multi-paso, modo thinking, visión ni audio: no hay evidencia de ninguna de estas capacidades en la información disponible.

## Casos de uso

- Generación de corpus sintético en hindi: dado un título seguido de una línea en blanco, el modelo produce texto con estilo Wikipedia o Wikisource. Es útil para aumentar datos de entrenamiento en lenguas indias, pero requiere revisión humana porque todo el contenido factual que genera es inventado.
- Punto de partida para fine-tuning de pregunta-respuesta: el propio autor lo usó como checkpoint base de sus modelos de QA y traducción mediante `finetune.py --qa pairs.jsonl`, lo que lo convierte en una alternativa de bajo coste para experimentos de ajuste en hindi con presupuesto de cómputo mínimo.
- Investigación sobre enrutado MoE a pequeña escala: con 24 expertos de 192, enrutado top-4, sin experto compartido y balanceo por sesgo sin pérdida auxiliar, permite estudiar el comportamiento del enrutado y el colapso de expertos en una sola GPU de consumo, algo inviable con MoE de decenas de miles de millones de parámetros.
- Estudio comparativo de configuraciones de atención: la combinación de ventana deslizante de 256 en las capas 0-9 con atención completa en las 10-19 permite medir el efecto de la atención local a esta escala, documentado por el autor en `docs/RESULTS.md` §12 y §16.
- Evaluación de tokenizadores para hindi: el tokenizador `multi32k` (BPE byte-level de 32.768 entradas, compartido entre hindi, inglés y Python) se puede comparar con tokenizadores orientados al inglés para medir la eficiencia de tokenización en devanagari.
- Autocompletado de fragmentos cortos de Python: con un prompt como `def is_prime(n):` genera la continuación de la función. El límite de 512 tokens lo restringe a funciones o bloques pequeños, no a ficheros completos ni a tareas de refactorización.
- Reproducción de pipelines de entrenamiento desde cero: los scripts `fetch_*.py`, `experiments/build_multi.sh` y `experiments/run_multi.sh` vuelven a descargar todos los datos de fuentes públicas sin redistribuirlos, lo que facilita la replicación en docencia o en ejercicios de ingeniería de datos.
- Prototipado de una interfaz de continuación de texto: `serve.py` levanta una página local que permite probar el modelo de forma interactiva sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card declara el modelo `AnuLM-Base-400M` con una lista de resultados vacía, y la única métrica reportada por el autor es la pérdida de validación del preentrenamiento:

| Métrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación | 4,441 | Split mixto reservado, paso 36.000 |
| Tokens de entrenamiento vistos | ~147,5 M | 36.000 pasos × lote 8 × 512 |
| Resultados en MMLU, HumanEval, GSM8K, etc. | No disponible | No declarados por el autor |

No se debe inferir ninguna capacidad a partir de la pérdida de validación; un valor de 4,441 implica una perplejidad elevada y es coherente con un modelo muy poco entrenado (147,5 millones de tokens para 397,7 millones de parámetros).

## Requisitos de hardware

- VRAM para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,79 GB (397,66 M × 2 bytes) y el repositorio completo 0,8 GB. Cabe en cualquier GPU con 2 GB o más de VRAM; en fp32 serían unos 1,6 GB.
- GPU recomendadas: no requiere aceleradores de datacenter. Funciona en GTX 1050 Ti, RTX 3050, RTX 3060, RTX 4060, RTX 4090 o cualquier GPU de consumo reciente. El propio autor entrenó el modelo en una única GPU de consumo. No hay motivo para usar A100 o H100 salvo por comodidad de infraestructura.
- Inferencia en CPU: viable, ya que el coste por token corresponde a 173,5 M de parámetros activos (equivalente a un modelo denso de ~175 M, es decir, dos tercios menos de cómputo que un denso de 397,7 M).
- Consumer GPU: sí, cabe con holgura. Es uno de los pocos MoE que se pueden servir en una GPU de gama de entrada.
- Opciones de despliegue: únicamente los scripts del repositorio AnuLM (`sample.py`, `serve.py`, `finetune.py`) con PyTorch, cargando el checkpoint con `load_checkpoint` y `AnuLM`. La arquitectura no está en `transformers`, y no hay soporte publicado para vLLM, TGI, llama.cpp, Ollama ni para ningún runtime que consuma GGUF; usarlos exigiría portar la arquitectura y generar los pesos convertidos.
- Cuantización: no se publican pesos cuantizados de ningún tipo.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar 173,5 M de parámetros por token el coste de cómputo por token es aproximadamente el de un transformer denso de 175 M, no el de uno de 400 M.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| AnuLM-Base-400M | 397,7 M totales / 173,5 M activos | 512 | MoE (24 expertos, top-4) | CC BY-SA 4.0 | Hindi, inglés, Python | Safetensors con repo propio; sin soporte en `transformers` ni GGUF |
| SmolLM2-360M | ~362 M densos | 8.192 | Transformer denso | Apache-2.0 | Principalmente inglés | `transformers`, GGUF, llama.cpp, vLLM |
| Qwen2.5-0.5B | ~494 M densos | 32.768 | Transformer denso | Apache-2.0 | Multilingüe (decenas de idiomas) | `transformers`, GGUF, llama.cpp, vLLM |
| Sarvam 30B | ~30.000 M (MoE) | No disponible | MoE (diseño de referencia) | No disponible en esta ficha | Hindi y otras lenguas indias | Pesos públicos; verificar condiciones |

Los datos de SmolLM2-360M y Qwen2.5-0.5B proceden de sus fichas públicas y deben verificarse antes de citarlos. La comparación relevante para AnuLM-Base-400M no es de rendimiento —no hay benchmarks— sino de encaje: frente a los modelos densos de tamaño similar, la ventaja de AnuLM es el coste de inferencia reducido por el enrutado MoE y su enfoque en hindi; la desventaja es una ventana de contexto 16 veces menor que la de SmolLM2 y 64 veces menor que la de Qwen2.5, además de la ausencia de integración en el ecosistema estándar y de licencia copyleft.

## Limitaciones y advertencias

- Alucinación estructural, no incidental: el autor advierte explícitamente de que todo el contenido factual de su salida es inventado y que nombres, fechas y números deben tratarse como ficción. No es un modelo apto para responder preguntas factuales.
- Modelo base sin ajuste de instrucciones: no ha pasado por RLHF, DPO ni SFT, por lo que no sigue instrucciones, no mantiene formato de chat y no dispone de plantilla de conversación.
- Contexto de 512 tokens: insuficiente para diálogo multi-turno, documentos largos, RAG o tareas de agente.
- Entrenamiento muy corto: ~147,5 millones de tokens para 397,7 M de parámetros, con pérdida de validación 4,441, lo que indica un modelo claramente infraentrenado y con capacidad lingüística limitada.
- Idiomas: solo hindi e inglés en lenguaje natural, más Python como dominio de código. No hay soporte de castellano ni de otras lenguas.
- Sin resultados de benchmarks: no se puede verificar ninguna capacidad frente a alternativas; cualquier comparación de rendimiento carece de base empírica publicada.
- Integración limitada: la arquitectura no está en `transformers`, el tokenizador usa un formato JSON propio que se carga con `bpe.BPE.load(path)` y no con la librería `tokenizers`. Esto complica su adopción en pipelines estándar y en herramientas como vLLM, TGI, llama.cpp u Ollama.
- Licencia CC BY-SA 4.0: permite uso comercial, pero es copyleft; las obras derivadas (incluidos modelos ajustados a partir de este checkpoint) deben distribuirse bajo la misma licencia y con atribución. Los datos de origen añaden obligaciones propias: Wikipedia y Wikisource en hindi son CC BY-SA, C4 es ODC-BY y la porción de Python de codeparrot-clean tiene licencias mixtas de GitHub.
- Falta de adopción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Desvinculación de terceros: el autor declara no estar afiliado a Sarvam AI, AI4Bharat, BharatGen ni al Gobierno de la India; el uso de la etiqueta `sarvam-architecture` no implica respaldo de esas organizaciones.
- Fecha de publicación futura en los metadatos (18 de septiembre de 2026): conviene verificar la fecha real del artefacto antes de referenciarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/toonist/AnuLM-Base-400M
- Repositorio de código AnuLM (`sample.py`, `serve.py`, `finetune.py`, `bpe.py`, `model.py`): no se proporciona URL en la información disponible; la model card lo menciona como "the AnuLM repository" sin enlace.
- Documentación interna citada por el autor: `docs/RESULTS.md` (§1-21 y §22), `docs/ARCHITECTURE.md` (§10), `docs/DEVELOPING.md`; scripts `experiments/build_multi.sh`, `experiments/run_multi.sh`, `fetch_hindi.py`, `filter_prose.py`, `fetch_web.py`, `fetch_code.py`. Sin URL pública disponible en la información proporcionada.
- Paper, blog técnico o demo en línea: no disponible.
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante. Las únicas URLs devueltas corresponden a guías de programación televisiva en francés (programme-tv.net) y no guardan relación con el modelo.
