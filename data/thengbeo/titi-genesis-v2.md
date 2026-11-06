# Thengbeo/titi-genesis-v2

## Resumen

TiTi Genesis V2 es un checkpoint de investigación publicado por el desarrollador independiente Hồ Ngọc Thắng (usuario Thengbeo) en Hugging Face. Se trata de un transformer de tipo "all-attention" de 139 millones de parámetros, diseñado para modelado de lenguaje en vietnamita e inglés, con una longitud de contexto máxima de 4.096 tokens y un vocabulario BPE de 32.768 entradas. El modelo es una reescritura de su predecesor V1, que combinaba capas Mamba con capas de atención; en V2 se eliminan las capas de estado y se sustituyen por atención estándar en las 39 capas.

La relevancia de este checkpoint es limitada en su estado actual: el propio autor indica explícitamente que se trata de un checkpoint de inicialización que **requiere preentrenamiento adicional**. Solo 19 de las 39 capas contienen pesos migrados desde V1 (capas de atención y FFN), mientras que las 20 capas restantes, que sustituyen a los bloques Mamba, están sin entrenar. El repositorio incluye scripts para completar el entrenamiento en Google Colab con una GPU T4.

A pesar de su estado incompleto, el modelo resulta interesante como ejercicio de migración arquitectónica: reduce el tamaño de 201M a 139M parámetros, recorta el vocabulario de 65.536 a 32.768 tokens (eliminando aproximadamente un 50% de entradas vacías), introduce weight tying entre embedding y cabeza de salida, y corrige el KV-cache roto de la versión anterior. El resultado es un artefacto de 532 MB frente a los 2,3 GB de V1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer all-attention (39 capas, sin Mamba) |
| Parametros totales | 139.481.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch `.pt`; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Vietnamita e ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`titi_v2_init.pt`), tokenizer BPE en JSON |
| Dimension oculta | 512 |
| Cabezas de atencion | 8 (head_dim = 64) |
| FFN | SwiGLU, ffn_dim = 1.365 (8/3 x hidden) |
| Vocabulario | 32.768 tokens BPE |
| Weight tying | Si (embedding y cabeza de salida comparten pesos) |
| KV-cache | Funcional (corregido respecto a V1) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 39 capas con atención multi-cabeza convencional (8 cabezas, dimensión de cabeza 64), dimensión oculta 512 y FFN SwiGLU con dimensión intermedia 1.365. La decisión de diseño más relevante es la eliminación completa de los bloques Mamba que caracterizaban a V1, sustituyéndolos por capas de atención estándar. Esto simplifica la implementación, permite un KV-cache funcional (que en V1 estaba roto) y reduce el número total de parámetros de 201M a 139M, en parte gracias al recorte del vocabulario y al weight tying.

El entrenamiento está incompleto. Según la model card, 19 de las 39 capas heredan pesos de V1 mediante el script `migrate_v1_to_v2.py`, mientras que las 20 capas nuevas (las que reemplazan a los bloques Mamba) están sin entrenar. El autor proporciona `colab_pretrain_v2.py` para ejecutar el preentrenamiento en una GPU T4 de Colab, así como `pretrain_v2.py` para servidores locales. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron fases de RLHF, DPO o SFT. Tampoco se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en vietnamita e inglés, condicionada a que el preentrenamiento se complete; en su estado actual las capas sin entrenar degradan la calidad de salida.
- Modelado de lenguaje autoregresivo con contexto de hasta 4.096 tokens.
- Soporte de KV-cache funcional, lo que permite inferencia incremental eficiente en comparación con V1.
- Tokenizer BPE específico para vietnamita (`vietnamese_tokenizer_v3.json`) con 32.768 tokens, lo que reduce el desperdicio de vocabulario respecto a V1.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- No se documentan capacidades multilingües más allá del par vietnamita-inglés indicado.

## Casos de uso

- Investigación sobre migración arquitectónica: el repositorio sirve como caso práctico para estudiar cómo trasvasar pesos de un modelo híbrido Mamba-attention a un transformer all-attention, usando `migrate_v1_to_v2.py` como referencia.
- Experimentación académica con presupuesto reducido: al caber en una T4 y ocupar 532 MB, permite reproducir pipelines de preentrenamiento en entornos gratuitos o de gama baja.
- Fine-tuning en vietnamita para tareas acotadas: una vez completado el preentrenamiento, el tokenizer y el vocabulario de 32.768 tokens lo hacen adecuado para clasificación de texto, análisis de sentimiento o resumen de documentos en vietnamita.
- Prototipado de asistentes conversacionales en vietnamita: con 4.096 tokens de contexto puede gestionar diálogos multi-turno de longitud moderada en aplicaciones de demo.
- Base para modelos pequeños de generación de código o texto técnico bilingüe vietnamita-inglés, tras un ajuste fino supervisado.
- Docencia y formación: útil para ilustrar diferencias entre arquitecturas híbridas (SSM + attention) y puras de atención, así como el impacto del weight tying y del tamaño de vocabulario en el recuento de parámetros.
- No se recomienda su uso en producción sin un preentrenamiento completo y una evaluación rigurosa, dado que el propio autor lo etiqueta como checkpoint incompleto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,56 GB solo para pesos (139M x 4 bytes), más activaciones y KV-cache; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en FP16/BF16: alrededor de 0,28 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, T4). Para entrenamiento, el autor apunta explícitamente a una T4 de Colab.
- Cabe en GPU consumer: sí, en todas las GPU modernas de NVIDIA, AMD e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: el repositorio proporciona código PyTorch propio (`agi_v2/`); no se publican pesos en GGUF, por lo que llama.cpp u Ollama requerirían conversión previa. vLLM y TGI no están soportados de forma nativa sin adaptar el código.
- Latencia y throughput: no disponibles; al ser un modelo de 139M con contexto de 4.096, se espera un throughput alto en GPU consumer, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| TiTi Genesis V2 | 139M | 4.096 | Vietnamita, ingles | Apache 2.0 | Checkpoint sin preentrenar completamente |
| TiTi Genesis V1 | 201M | no disponible | Vietnamita, ingles | no disponible | Modelo previo, KV-cache roto |
| Qwen2.5-0.5B | 494M | 32.768 | Multilingue (incluye vietnamita) | Apache 2.0 | Modelo publicado y evaluado |
| SmolLM2-135M | 135M | 8.192 | Ingles principalmente | Apache 2.0 | Modelo publicado y evaluado |
| Phoenix (variantes vietnamitas) | variable | variable | Vietnamita | variable | Modelos de la comunidad |

La comparación con modelos de tamaño similar revela que TiTi Genesis V2 se sitúa en la misma escala de parámetros que SmolLM2-135M, pero carece de los datos de entrenamiento y evaluación públicamente disponibles de este último. Frente a Qwen2.5-0.5B, ofrece un contexto cuatro veces menor y no está validado. Su principal diferenciación es el enfoque específico en vietnamita y su naturaleza de experimento abierto de migración arquitectónica.

## Limitaciones y advertencias

- Checkpoint incompleto: 20 de las 39 capas no tienen pesos entrenados, por lo que la calidad de generación será deficiente hasta completar el preentrenamiento.
- No se documentan datos de entrenamiento, composición del corpus ni procesos de alineación (RLHF, DPO, SFT), lo que impide evaluar sesgos y riesgos de alucinación.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documentación larga o análisis de repositorios.
- Idiomas restringidos a vietnamita e inglés; no se garantiza un comportamiento aceptable en castellano u otras lenguas.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- El pipeline de Hugging Face no está definido, lo que complica su uso directo con `transformers` sin código adicional.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de inferencia estándar.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de un modelo entrenado y evaluado hace desaconsejable su empleo en producción.
- El modelo se publicó con fecha de creación de 2026-11-01 según los metadatos, dato que conviene verificar por si se trata de un error de marcado temporal.

## Enlaces

- Hugging Face: https://huggingface.co/Thengbeo/titi-genesis-v2
- Checkpoint de datos de entrenamiento referenciado: https://huggingface.co/Thengbeo/titicheckpoint1
- Repositorio de código: incluido en el propio repo (`agi_v2/`, `colab_pretrain_v2.py`, `pretrain_v2.py`, `migrate_v1_to_v2.py`)
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.
