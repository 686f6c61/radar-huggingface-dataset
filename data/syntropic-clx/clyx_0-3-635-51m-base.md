# syntropic-clx/Clyx_0.3-635.51M-BASE

## Resumen

Clyx 0.3-635.51M-BASE es un modelo de lenguaje causal decoder-only de 635.512.320 parámetros entrenado desde cero por el proyecto independiente Syntropic (organización `syntropic-clx`). No reutiliza pesos preentrenados de terceros: implementa un Transformer propio en PyTorch con Grouped-Query Attention, RoPE, RMSNorm y SwiGLU, y se distribuye en safetensors con precisión FP32. Es un checkpoint BASE, es decir, un modelo de continuación de texto sin ajuste por instrucciones ni alineamiento de seguridad.

Su relevancia es la de un banco de pruebas a escala media (635 M) con corpus bilingüe inglés-ruso que incluye código Python, C y C++. La ventana de contexto es de 2.048 tokens, el vocabulario de 32.768 tokens con tokenizer ByteLevel BPE y las embeddings de entrada y salida están atadas. Se entrenó sobre un corpus preparado de aproximadamente 2.120 millones de tokens de entrenamiento y 20,8 millones de validación, con un presupuesto objetivo de unos 2.000 millones de tokens presentados en una única NVIDIA A100 SXM4 de 80 GB en BF16.

El proyecto se posiciona explícitamente como modelos pequeños orientados a herramientas para desarrolladores, por lo que este BASE es el punto de partida previsto para ajuste posterior (SFT, adaptación de dominio o continuación del preentrenamiento) más que un asistente listo para producción. La mejor pérdida de validación registrada fue 2,7136 en el paso 116.000.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) de implementación propia, con Grouped-Query Attention, RoPE, RMSNorm y SwiGLU |
| Parametros totales | 635.512.320 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens (longitud de secuencia de optimización durante el entrenamiento: 1.024 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en FP32; no se documentan versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | inglés (en) y ruso (ru); el corpus incluye además código Python, C y C++ |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, precisión de exportación FP32, dividido en 3 shards (`model-00001-of-00003.safetensors`, `model-00002-of-00003.safetensors`, `model-00003-of-00003.safetensors`) más `model.safetensors.index.json` |
| Tamano del repositorio | 2,5 GB (exportación FP32 de 2,54 GB) |
| Dimensión oculta | 1.536 |
| Capas del transformer | 24 |
| Cabezas de atención de consulta / clave-valor | 24 / 4 (GQA) |
| Tamano intermedio (FFN) | 4.096 |
| Base de RoPE | 10.000 |
| Vocabulario | 32.768 tokens (ByteLevel BPE, embeddings atadas entrada/salida) |
| Runtime de inferencia | ClyxBox 0.3.2 (paquete PyPI independiente) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only denso de 24 capas con dimensión oculta 1.536 y FFN de 4.096, normalización RMSNorm y activación SwiGLU. La atención usa Grouped-Query Attention con 24 cabezas de consulta y solo 4 cabezas de clave/valor (dimensión de cabeza de 64), lo que reduce de forma notable el tamaño de la caché KV frente a atención multi-cabeza completa. Las posiciones se codifican con RoPE de base 10.000, con una capacidad de contexto máxima de 2.048 tokens. El vocabulario de 32.768 tokens emplea un tokenizer ByteLevel BPE y las embeddings de entrada y salida están compartidas. La implementación es propia, en PyTorch, sin pesos externos de partida.

El entrenamiento se ejecutó en una NVIDIA A100 SXM4 de 80 GB con precisión mixta BF16, optimizador Fused AdamW, recorte de gradiente de 1,0 y un calendario de learning rate con warmup y decaimiento coseno desde 3e-4 hasta un mínimo de 3e-5. La longitud de secuencia de optimización fue de 1.024 tokens, aunque el modelo declara capacidad de contexto de 2.048. El corpus preparado contenía unos 2.120 millones de tokens de entrenamiento y 20,8 millones de validación, con un presupuesto objetivo de 2.000.011.264 tokens presentados. El mejor checkpoint de validación registró pérdida 2,7136 en el paso 116.000 y el último checkpoint guardado, en el paso 118.000, obtuvo 2,7154. El corpus (texto en ruso, texto en inglés, código Python y código C/C++) es privado y no se distribuye con el modelo; no se documenta ningún uso de RLHF, DPO u otra fase de alineamiento.

## Capacidades

- Generación de texto por continuación: dado un contexto en inglés o ruso, el modelo produce continuación coherente a nivel de lenguaje natural.
- Modelado de lenguaje y cálculo de perplejidad: útil como base para experimentos de evaluación de pérdida y comparación de implementaciones.
- Generación de código en Python, C y C++, presente explícitamente en el corpus de entrenamiento, aunque sin datos publicados de rendimiento en generación de código.
- Capacidad multilingüe limitada a inglés y ruso; no se declara soporte para otras lenguas.
- No dispone de soporte fiable de tool calling ni function calling: al no estar ajustado por instrucciones, no sigue esquemas de herramientas.
- No dispone de modo de razonamiento multi-paso, modo "thinking", ni capacidades de agente autónomo.
- No tiene visión, audio ni ninguna modalidad distinta del texto.
- No tiene modo de instrucciones: las peticiones se interpretan como contexto a continuar, no como órdenes.
- Punto de partida para SFT, adaptación de dominio y preentrenamiento continuado, ya que se trata de un checkpoint BASE.

## Casos de uso

- Preentrenamiento continuado sobre corpus propio: el checkpoint BASE permite seguir entrenando con un corpus compatible (por ejemplo, documentación técnica en ruso o inglés) partiendo de una pérdida de validación conocida de 2,7136, sin necesidad de arrancar desde cero.
- Ajuste por instrucciones (SFT) para un asistente específico de dominio: dado que no está alineado, es el punto de partida natural para un pipeline de instruction tuning con datos propios bilingües en inglés y ruso.
- Investigación sobre arquitecturas Transformer personalizadas: al ser una implementación desde cero con GQA, RoPE, RMSNorm y SwiGLU, sirve para reproducir experimentos de ablación sobre atención agrupada o sobre el efecto del vocabulario de 32.768 tokens.
- Base para modelos de asistencia a programadores en Python, C y C++: el proyecto declara como objetivo "small language models for developer tooling", y este BASE puede especializarse mediante fine-tuning en tareas de autocompletado o generación de fragmentos.
- Estudio y docencia de entrenamiento de LLM a pequeña escala: con 635 M de parámetros y 2,12 B de tokens de entrenamiento, el coste de reproducir o adaptar el experimento en una sola GPU de 80 GB es abordable para un laboratorio académico.
- Evaluación del runtime ClyxBox y de exportaciones safetensors fragmentadas: útil para validar pipelines de carga por shards, lectura del índice `model.safetensors.index.json` y comportamiento de BF16 frente a FP32 en GPUs distintas.
- Prototipado de generación de texto con requisitos de recursos mínimos: al ocupar 2,54 GB en FP32 y contextos de 2.048 tokens, puede desplegarse en entornos con una sola GPU de gama media o incluso en CPU para pruebas.
- Generación de texto sintético en ruso o inglés como paso previo a curación manual: el modelo produce continuaciones estocásticas configurables con temperatura, top-p, top-k y penalización de repetición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclaman puntuaciones de MMLU, GSM8K, ARC, HumanEval ni de ningún otro benchmark para esta versión, y advierte que la pérdida de lenguaje no implica capacidad de seguir instrucciones o de razonar.

| Metrica de entrenamiento | Valor |
|---|---|
| Mejor pérdida de validación | 2,7136 (paso 116.000) |
| Última pérdida de validación registrada | 2,7154 (paso 118.000) |
| Tokens de entrenamiento del corpus | ≈ 2,12 mil millones |
| Tokens de validación del corpus | ≈ 20,8 millones |
| Presupuesto objetivo de tokens presentados | 2.000.011.264 |
| Precisión de entrenamiento | BF16 mixed precision |
| Longitud de secuencia de optimización | 1.024 tokens |

## Requisitos de hardware

Cifras de VRAM estimadas a partir del tamaño de parámetros; el autor no publica medidas de VRAM, latencia ni throughput.

- Pesos en FP32 (formato publicado): ≈ 2,54 GB solo de pesos; con activaciones y caché KV, el consumo realista se sitúa alrededor de 3-4 GB de VRAM.
- Pesos en BF16 (precisión nativa de inferencia en GPUs CUDA compatibles, según ClyxBox): ≈ 1,27 GB de pesos, aproximadamente 2 GB de VRAM en total.
- Pesos en int8: ≈ 0,64 GB de pesos; en int4: ≈ 0,32 GB. Estas cuantizaciones no están publicadas por el autor y requerirían conversión propia.
- Caché KV: con 24 capas, 4 cabezas KV y dimensión de cabeza 64, la caché ronda los 24 KB por token en BF16, es decir, unos 50 MB para los 2.048 tokens de contexto completo. Es un consumo muy contenido gracias al uso de GQA.
- GPU recomendadas: cualquier GPU consumer moderna sirve. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden ejecutar el modelo en BF16 o FP32 sin problemas. No se requiere A100 ni H100 para inferencia; la A100 SXM4 de 80 GB se usó para el entrenamiento, no para el servicio.
- Cabe en GPU de gama baja e incluso en iGPU con suficiente memoria compartida si se cuantiza a int8 o int4.
- Opciones de despliegue: el autor publica un runtime propio, ClyxBox 0.3.2 (instalable con `pip install clyxbox==0.3.2`), que carga los shards automáticamente desde el repositorio de HuggingFace y selecciona BF16 nativo en GPUs CUDA compatibles y FP32 en el resto, incluida la NVIDIA T4. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI.
- Parámetros de muestreo por defecto en ClyxBox: `temperature=0.65`, `top_p=0.90`, `top_k=50`, `repetition_penalty=1.12`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No es posible comparar rendimiento porque Clyx 0.3 BASE no publica benchmarks. La tabla compara únicamente características declaradas; los datos de los modelos alternativos provienen de sus fichas públicas y deben verificarse en la fuente original.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Clyx 0.3-635.51M-BASE | 635.512.320 | 2.048 | Apache 2.0 | en, ru + código | BASE sin alineamiento, sin benchmarks publicados, runtime propio (ClyxBox) |
| Qwen2.5-0.5B | ≈ 0,49 mil millones | 32.768 (extensible con YaRN) | Apache 2.0 | multilingüe (decenas de idiomas) | Familia con variantes instruct y base; ecosistema estándar (transformers, vLLM) |
| SmolLM2-360M | ≈ 362 millones | 8.192 | Apache 2.0 | principalmente inglés | Orientado a dispositivos y edge; datos de entrenamiento publicados |
| TinyLlama-1.1B | ≈ 1,1 mil millones | 2.048 | Apache 2.0 | inglés | Entrenado sobre corpus mayor (≈ 3 billones de tokens declarados) |
| Pythia-410M | ≈ 410 millones | 2.048 | Apache 2.0 | inglés | Suite de investigación con checkpoints intermedios reproducibles |

Diferencias estructurales relevantes: Clyx usa GQA con 4 cabezas KV (los modelos de su tamaño suelen usar atención multi-cabeza o GQA con más cabezas KV), un vocabulario de 32.768 tokens y un tokenizer ByteLevel BPE bilingüe, y no se apoya en pesos preentrenados de terceros. Frente a las alternativas, su principal desventaja es la ausencia de benchmarks, de variante instruct y de soporte en runtimes de inferencia estándar.

## Limitaciones y advertencias

- No está ajustado por instrucciones ni alineado: no responde a preguntas ni obedece formatos; una entrada como `2 + 2 =` se trata como texto a continuar y no como una petición de respuesta.
- Puede generar texto incompleto, repetitivo, gramaticalmente incorrecto, factualmente falso o incoherente. El riesgo de alucinación es alto y no existe capa de mitigación.
- No dispone de entrenamiento de seguridad, por lo que puede reproducir sesgos, estereotipos o contenido problemático presente en el corpus de texto ruso e inglés.
- El rendimiento varía sustancialmente según el idioma, el dominio, el prompt y los parámetros de muestreo; el ruso y el inglés no tienen por qué comportarse igual.
- La ventana de contexto está limitada a 2.048 tokens y la longitud de secuencia de optimización fue de 1.024 tokens, por lo que el comportamiento más allá de 1.024 tokens puede degradarse.
- El corpus de entrenamiento es privado: no es posible auditar la composición exacta del dataset ni sus licencias de origen.
- La licencia Apache 2.0 del repositorio no sustituye las obligaciones de las fuentes de datos originales. El autor advierte explícitamente de que hay que revisar las licencias de las fuentes antes de redistribuir comercialmente o de usar el modelo en un producto.
- No debe emplearse como base de datos factual, agente autónomo, sistema crítico de seguridad ni asistente conversacional en producción sin entrenamiento y evaluación adicionales.
- No hay soporte oficial en vLLM, llama.cpp, Ollama o TGI; el único runtime documentado es ClyxBox. La arquitectura es personalizada, lo que puede complicar la conversión a formatos estándar.
- Los tres shards safetensors y el índice deben mantenerse juntos y sin renombrar; manipularlos individualmente rompe la carga.
- El modelo tiene 0 "likes" y 478 descargas en el momento de la consulta, lo que indica una adopción todavía muy temprana y poca validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syntropic-clx/Clyx_0.3-635.51M-BASE
- Organización del autor en HuggingFace: https://huggingface.co/syntropic-clx
- Versión NM-BASE (objetivo previo de ≈ 635,51 M de parámetros): https://huggingface.co/syntropic-clx/Clyx_0.3-NM-BASE
- Ficha de terceros sobre Clyx 0.3-NM-BASE: https://savrn.com/models/clyx-0-3-nm-base
- Organización en GitHub: https://github.com/Syntropic-CLX
- Sitio del proyecto Syntropic: https://www.thesyntropic.com/index.html
- Runtime de inferencia ClyxBox (PyPI): https://pypi.org/project/clyxbox/ (instalación documentada como `pip install clyxbox==0.3.2`)
- Paper técnico: no disponible
- Demo o espacio interactivo: no disponible
- Repositorio del corpus de entrenamiento: no disponible (el corpus es privado y no se distribuye)
