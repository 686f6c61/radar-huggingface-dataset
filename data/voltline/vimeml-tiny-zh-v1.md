# Voltline/vimeml-tiny-zh-v1

## Resumen

VimeML Tiny Chinese GPT v1 es un modelo de lenguaje causal (decoder-only) de 20.036.736 parámetros desarrollado por Voltline, diseñado específicamente para el reranking contextual de candidatos en un método de entrada (IME) de pinyin para chino simplificado, así como para la predicción de frases cortas. No es un modelo de chat ni de instrucciones: es un componente de infraestructura pensado para ejecutarse localmente en iOS dentro de la app Vime, donde reordena los candidatos producidos por librime con rime-ice según su verosimilitud bajo un modelo de lenguaje puro.

La arquitectura es un transformer pre-norm con RMSNorm y SwiGLU, capas lineales sin sesgo, posiciones absolutas aprendidas y atención causal, con un vocabulario de 12.288 piezas SentencePiece Unigram y una ventana de contexto de solo 128 tokens. Su tamaño reducido y su contexto corto son deliberados: el objetivo es la latencia mínima en un teclado de iPhone, no el razonamiento de largo alcance. El repositorio incluye pesos FP32, paquetes Core ML INT8 (block32) con y sin KV-cache troceada, el código fuente congelado y un manifiesto de procedencia verificable por SHA256.

La relevancia de esta ficha es acotada pero clara: es un ejemplo de modelo de lenguaje ultrapequeño entrenado desde cero (no destilado) sobre corpus chino limpio, empaquetado para inferencia en dispositivo con Core ML. Resulta útil para quien evalúe IMEs locales, reranking de candidatos o despliegue de modelos minúsculos en extensiones de teclado, y menos útil para cualquier tarea generativa general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only pre-norm, RMSNorm + SwiGLU, Linear sin sesgo, posiciones absolutas aprendidas, atención causal |
| Parametros totales | 20.036.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | FP32 (inferencia PyTorch) e INT8 block32 con cómputo FP32 (Core ML) |
| Idiomas soportados | Chino (zh), simplificado; tokenizador con fallback de bytes |
| Licencia | GPL-3.0 |
| Formato de pesos | State dict PyTorch FP32 (`.pt`/`.bin` vía `torch.load` con `weights_only=True`) y `.mlpackage` de Core ML |
| Vocabulario | 12.288 piezas SentencePiece Unigram |
| Anchura (d_model) | 384 |
| Capas | 9 |
| Cabezas de atención | 6, dimensión 64 por cabeza |
| Anchura SwiGLU | 960 |
| Dropout | 0 |
| Epsilon RMSNorm | 1e-5 |
| Embedding de entrada / LM head | Compartidos (weight tying) |
| Tokens especiales | PAD/UNK/BOS/EOS = 0/1/2/3; `<CTX>`, `<READ>`, `<OUT>` = 4–6 (reservados, nunca entrenados); salto de línea = 7 |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con pre-norm, RMSNorm y SwiGLU, sin sesgos en las capas lineales, posiciones absolutas aprendidas y atención causal estándar. La anchura es 384, con 9 capas y 6 cabezas de dimensión 64; la capa SwiGLU tiene anchura 960. El embedding de entrada y el LM head comparten un único tensor de parámetros. El tokenizador es SentencePiece Unigram con 12.288 piezas, normalización de identidad, preservación de espacios, fallback de bytes y `add_dummy_prefix=false`; en promedio, un token de 12K cubre 1,40 caracteres chinos.

El entrenamiento partió de inicialización aleatoria (semilla 1591996171) y realizó una sola pasada sobre datos frescos: 844.730 actualizaciones con batch de 512, BF16 con pesos FP32, AdamW (β 0.9/0.95, weight decay 0.1, clip 1.0) y learning rate coseno de 6e-4 a 6e-5 tras 1.000 actualizaciones de warmup, con un recorte de prefijo del 30% en ventanas elegibles. La exposición total fue de 14.519.248.976 objetivos supervisados de siguiente token, y el entrenamiento completo llevó 3,9 horas en una sola GPU. La composición del corpus incluye 21 de los 370 ficheros de entrenamiento de FineWeb2 `cmn_Hani`, con exclusión de documentos en escritura tradicional (la model card se interrumpe en ese punto). No se documenta RLHF, DPO ni ajuste por instrucciones.

La innovación técnica no está en la arquitectura sino en el empaquetado para producción: dos paquetes Core ML (uno sin estado y otro con KV-cache troceada) con cuantización INT8 por bloques de 32 y cómputo FP32, más un manifiesto de procedencia con digests SHA256 de pesos, tokenizador y checkpoint original. La puntuación de candidatos se hace codificando conjuntamente `BOS + contexto + candidato`, localizando el prefijo común de tokens y sumando el log-softmax de vocabulario completo sobre el sufijo restante; es un proxy de verosimilitud del sufijo, no una probabilidad condicional exacta de la cadena.

## Capacidades

- Puntuación y reordenación contextual de candidatos de pinyin: recibe un contexto y una lista de cadenas candidatas y las ordena por verosimilitud bajo el modelo de lenguaje.
- Predicción de frases cortas (experimental): decodificador por beam search con anchura 16 sobre tokens puramente chinos, con token healing del último carácter escrito, devolviendo hasta cinco frases de 2 a 6 caracteres que no sean prefijos entre sí.
- Modelado de lenguaje causal de siguiente token sobre chino simplificado, con ventana de 128 tokens.
- Manejo de turnos previos de conversación mediante concatenación de secuencias `BOS turn EOS` para la predicción de frases.
- Tokenizador con fallback de bytes, lo que permite representar texto fuera del vocabulario chino sin UNK forzado.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo de instrucciones ni de chat; no hay modo thinking, visión ni audio.
- Capacidad multilingüe limitada al chino; el fallback de bytes no equivale a competencia en otros idiomas.

## Casos de uso

- Reranking de candidatos en un IME de pinyin en iOS: librime con rime-ice genera los candidatos y el modelo los reordena por puntuación de LM puro dentro del grafo Core ML, con latencia baja gracias a sus 20M de parámetros y a la variante con KV-cache troceada.
- Predicción de la siguiente frase en un teclado móvil: dado el texto ya escrito y los turnos previos, el decodificador devuelve hasta cinco frases de 2 a 6 caracteres para mostrarlas como sugerencias en la barra de predicción.
- Desambiguación de homófonos en pinyin: en contextos como "我们明天一起去" con candidatos "吃饭" y "迟返", el modelo asigna mayor verosimilitud al candidato coherente con el contexto, reduciendo errores típicos de la conversión pinyin-a-hanzi.
- Corrección silenciosa en la extensión de teclado: al integrarse como paquete Core ML sin estado, puede puntuar candidatos en cada pulsación sin mantener estado entre invocaciones, lo que simplifica el ciclo de vida en una keyboard extension con memoria restringida.
- Investigación sobre modelos de lenguaje ultrapequeños: su receta completa (20M parámetros, 14.500 millones de tokens objetivo, 3,9 horas en una GPU) sirve como referencia reproducible para estudiar el régimen de escalado minúsculo con datos limpios en chino.
- Evaluación de pipelines de despliegue en dispositivo: los dos paquetes Core ML y el manifiesto SHA256 permiten comparar latencia y alineación numérica entre la variante sin estado y la de KV-cache troceada en simulador y en hardware Apple.
- Filtrado o priors léxicos en herramientas de escritura china: el modelo puede puntuar secuencias cortas como señal auxiliar en correctores ortográficos o en la selección de segmentaciones alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona `evaluation/summary.json` con resultados agregados de calidad, alineación y mediciones, pero no incluye cifras en el texto proporcionado. Tampoco se han ejecutado mediciones en iPhone ni en la extensión de teclado: los paquetes Core ML solo han pasado las puertas de alineación en Mac y una comprobación funcional en simulador.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los 20.036.736 parámetros ocupan aproximadamente 80 MB de pesos (el repo completo es de 0,1 GB); en INT8 block32, alrededor de 20 MB más metadatos de escala por bloque.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria libre es suficiente para la variante FP32 en PyTorch; el caso de uso objetivo es Apple Silicon y, en producción, el Neural Engine de iPhone mediante Core ML.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier iGPU moderna, así como en CPU.
- Opciones de despliegue: PyTorch con el cargador incluido en `source/` e `infer.py` para FP32; Core ML (`ios18-int8-block32` y `ios18-int8-block32-kvchunk`) para iOS. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al no ser una integración `AutoModel` de Transformers no se beneficia de esos runners sin trabajo adicional.
- Latencia y throughput: no disponibles. La model card indica explícitamente que las mediciones en iPhone y en la extensión de teclado aún no se han realizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VimeML Tiny Chinese GPT v1 | 20,0 M | 128 | Reranking de candidatos IME, chino | GPL-3.0 | Hugging Face + Core ML |
| Modelos de la familia Qwen (p. ej. Qwen2.5-0.5B) | ~500 M | 32.768 | LLM generalista multilingüe | Apache-2.0 (la mayoría) | Hugging Face, amplio ecosistema |
| Modelos tipo TinyLlama / SmolLM (variantes pequeñas) | 100–360 M | 2.048–8.192 | LLM generalista en inglés | Apache-2.0 | Hugging Face, GGUF, Ollama |

La comparación es asimétrica por diseño: VimeML es dos órdenes de magnitud menor y su contexto es 256 veces más corto que el de Qwen2.5-0.5B, pero está empaquetado para inferencia en dispositivo con Core ML y optimizado para una única tarea. No se dispone de datos de benchmarks que permitan comparar calidad de reranking frente a alternativas; los modelos generalistas citados no están pensados para puntuar candidatos de pinyin y requerirían ajuste.

## Limitaciones y advertencias

- Contexto de solo 128 tokens: insuficiente para documentos, conversaciones largas o contexto de código; cualquier uso fuera de frases cortas queda descartado.
- No es un modelo de instrucciones ni de chat: no responde a prompts en el sentido habitual, solo puntúa secuencias o predice frases.
- La puntuación de candidatos es un proxy de verosimilitud del sufijo, no una probabilidad condicional exacta de la cadena; los empates conservan el orden original.
- La predicción de frases está marcada como experimental y limitada a frases de 2 a 6 caracteres puramente chinos.
- Riesgo de alucinación y de sesgos presente en el corpus FineWeb2 `cmn_Hani`; no se documentan evaluaciones de sesgo ni filtros de seguridad.
- Cobertura limitada al chino simplificado; los documentos en escritura tradicional se excluyeron del entrenamiento y el fallback de bytes no proporciona competencia real en otros idiomas.
- La licencia GPL-3.0 es copyleft y puede ser incompatible con productos propietarios que no liberen su código; conviene revisar el cumplimiento antes de integrarlo en una app comercial.
- Estado de release orientado a iOS: no hay mediciones en iPhone ni en la extensión de teclado, solo alineación en Mac y comprobación funcional en simulador.
- Los checksums SHA256 no constituyen una firma digital; la verificación de bytes no garantiza autenticidad frente a un tercero malicioso.
- El checkpoint original con optimizador no se distribuye, por lo que no es posible reanudar el entrenamiento tal cual desde el repositorio.
- La model card está incompleta en la sección de datos de entrenamiento (se interrumpe al describir la exclusión de escritura tradicional), lo que impide auditar la composición exacta del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Voltline/vimeml-tiny-zh-v1
- Repositorio fuente VimeML: https://github.com/Voltline/VimeML (commit `54ace39b7fbbce4c362d55677c638ea2db7b83c6`)
- Dataset FineWeb2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.
