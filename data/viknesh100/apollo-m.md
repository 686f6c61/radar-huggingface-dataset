# viknesh100/Apollo-M

## Resumen

Apollo-M es un modelo generativo de melodías simbólicas desarrollado por el autor independiente viknesh100 (usuario de Hugging Face). Genera melodías monofónicas en formato MIDI a partir de controles estructurados: tonalidad, número de compases, tempo, compás, densidad de notas, registro, género, estado de ánimo y familia de instrumento. No produce audio directamente; el MIDI resultante debe pasarse por un sintetizador o soundfont para obtener sonido.

Técnicamente es un Transformer decoder-only de 27,5 millones de parámetros entrenado desde cero, con arquitectura RoPE, RMSNorm, SwiGLU y embeddings de entrada/salida atados. Su contexto es de 1024 tokens, suficiente para melodías de hasta 16 compases en una rejilla de semicorcheas. El vocabulario es de 352 tokens e incluye un header de 9 tokens que codifica los controles de generación, con tokens de "desconocido" para cada campo, de modo que el modelo puede decidir cualquier control no especificado.

El modelo es relevante como ejemplo compacto y reproducible de generación musical simbólica controlable: se entrenó en una única GPU T4 (nivel gratuito de Google Colab) en tres etapas (pretraining sobre Lakh MIDI, finetune con etiquetas de género y estado de ánimo de MidiCaps, y un pulido final con POP909 y el corpus folk de Nottingham). Está pensado para bocetos melódicos y como base de investigación, no como sustituto de compositores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, RMSNorm, SwiGLU y embeddings de entrada/salida atados |
| Parámetros totales | 27.451.904 (27,5 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | No disponible (pesos almacenados en fp16; no se documentan cuantizaciones) |
| Idiomas soportados | No aplica (modelo simbólico musical; no procesa lenguaje natural) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors (fp16) |

Detalles adicionales de arquitectura: 8 capas, dimensión del modelo 512, 8 cabezas de atención, FFN de 1536, vocabulario de 352 tokens. Tamaño del repositorio: 3,7 GB.

## Arquitectura y entrenamiento

Apollo-M es un Transformer decoder-only de 8 capas y 512 dimensiones con atención de RoPE, normalización RMSNorm y activación SwiGLU. Cada secuencia se estructura como `BOS`, un header de 9 tokens y la melodía, que se codifica como barras: un token `BAR` inicia cada compás y cada nota se representa con tres tokens (`POS`, `PITCH`, `DUR`) sobre una rejilla de semicorcheas. El header codifica tempo (24 bins de 10 BPM entre 40 y 279), compás (5 opciones), tonalidad (24: 12 tónicas × mayor/menor), número de compases (1-16), densidad (8 bins), registro (8 bins de 8 semitonos desde MIDI 36), género (24 categorías), estado de ánimo (16 categorías) y familia de instrumento (16 familias GM). Cada campo dispone de token "desconocido".

El entrenamiento consta de tres etapas con la misma extracción de melodías: selección de la pista más melódica del MIDI, reducción a línea monofónica con regla de skyline, cuantización a semicorcheas y ventanas de 4/8/16 compases, con deduplicación por hash de intervalos y ritmo y separación train/validación por melodía. La aumentación incluye transposición de hasta ±5 semitonos, jitter de tempo y ocultación aleatoria del 15 % de los campos del header.

1. **Pretraining (Apollo):** Lakh MIDI, 178.561 archivos escaneados, 90.095 melodías únicas. Header con los primeros 6 campos. AdamW, lr 5e-4 → 5e-5 (coseno), warmup 500, weight decay 0,1, 128 secuencias por paso (32 × 4 de acumulación), grad-clip 1,0. Mejor checkpoint en el paso 10.000 (validation loss 0,9240).
2. **Stage A (finetune con tokens de control):** melodías de Lakh unidas a etiquetas de género y estado de ánimo de MidiCaps (top-1 por archivo), más la familia de instrumento. 49.714 melodías únicas, 415.747 ventanas de entrenamiento y 8.024 de validación. lr 2e-4 → 2e-5, warmup 200, weight decay 0,05, hasta 4.000 pasos. Mejor checkpoint en el paso 4.000.
3. **Stage B (pulido):** melodías humanas limpias de POP909 (2.108 ventanas, pista de voz principal) y de la base folk de Nottingham (11.783 ventanas), con filtros más estrictos. lr 2e-5 → 2e-6, 2 épocas, con un 25 % de replay de datos del Stage A para evitar olvido catastrófico. Checkpoint final en el paso 275 (`model.safetensors`).

La generación emplea muestreo con restricciones gramaticales: en cada paso solo se permiten tokens que mantienen la estructura válida del formato.

## Capacidades

- Generación de melodías monofónicas en formato MIDI a partir de controles estructurados.
- Control fino de tonalidad (24 opciones), número de compases (1-16), tempo (40-279 BPM), compás (4/4, 3/4, 2/4, 6/8, 12/8), densidad de notas, registro, género (24), estado de ánimo (16) y familia de instrumento (16).
- Control parcial: cualquier campo puede dejarse como "desconocido" y el modelo decide.
- Parsing de prompts en lenguaje natural para derivar los controles del header (incluido en `apollo_m.py`).
- Decodificación con restricciones gramaticales que garantiza secuencias válidas.
- Escritura directa a MIDI mediante el writer incluido en el repositorio.
- No soporta tool calling, function calling, agentes, visión, audio ni capacidades multilingües de lenguaje natural.

## Casos de uso

- **Bocetos melódicos para producción musical:** generar ideas de melodía en una tonalidad y tempo concretos para que el compositor las desarrolle, aprovechando el control de 24 tonalidades y 16 compases.
- **Generación por lotes de variaciones:** usar el parámetro `n` y semillas distintas para producir múltiples alternativas de la misma petición y seleccionar por escucha, útil en sesiones de ideación.
- **Prototipado rápido de bandas sonoras para juegos:** fijar género (p. ej. "game", "soundtrack"), estado de ánimo ("epic", "dark") y compás para generar melodías temáticas por nivel o escena.
- **Investigación en generación musical simbólica controlable:** el modelo sirve como baseline pequeño y reproducible (entrenado en una T4) para estudiar control condicional, pérdida de validación y estrategias de finetune por etapas.
- **Generación de material para educación musical:** crear melodías de dificultad controlada (densidad, registro, compás) para ejercicios de lectura o análisis.
- **Aumentación de datasets musicales:** producir melodías MIDI sintéticas con etiquetas controladas (género, mood, instrumento) para complementar corpus pequeños en tareas de clasificación o generación.
- **Exploración de folk y pop:** el pulido con POP909 y Nottingham permite generar líneas melódicas con características estilísticas de esos corpus, útil para arreglos de acompañamiento.

## Benchmarks y rendimiento

El autor solo publica pérdidas de validación (entropía cruzada media por token del cuerpo, sin contar el header). No son comparables con otros modelos.

| Checkpoint | Val loss, ventanas MidiCaps (ppl) | Val loss, ventanas polish (ppl) |
|---|---|---|
| Stage A (antes del pulido) | 0,8319 (2,30) | 0,6355 (1,89) |
| Final (Stage B) | 0,8392 (2,31) | 0,5868 (1,80) |

El autor indica que los resultados de adherencia a la tonalidad no se registraron al generar la model card, y advierte que la pérdida no mide musicalidad; la comparación entre checkpoints se complementó con escucha de muestras emparejadas.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** con 27,5 M de parámetros en fp16, los pesos ocupan aproximadamente 55 MB; la inferencia completa (incluyendo caché KV para 1024 tokens) requiere menos de 1 GB de VRAM.
- **GPU recomendadas:** cualquier GPU con al menos 1-2 GB de VRAM; el autor lo entrenó en una T4 del nivel gratuito de Colab.
- **GPU de consumo:** cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, 4060, 4090, etc.) e incluso en CPU para generación no interactiva.
- **Opciones de despliegue:** no es un modelo de `transformers`; requiere el código propio `apollo_m.py` del repositorio (arquitectura, vocabulario, parser de prompt, decodificador restringido y writer MIDI). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput:** no disponibles en la información proporcionada; por el tamaño del modelo se espera generación muy rápida, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. Como referencia cualitativa, Apollo-M se sitúa en la categoría de modelos pequeños de generación musical simbólica controlable, pero no se han encontrado en la documentación cifras que permitan una comparación rigurosa con alternativas como MusicGen (audio, no simbólico) u otros generadores MIDI.

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apollo-M | 27,5 M | 1024 tokens | MIDI | other | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Genera exclusivamente melodías monofónicas; no produce armonía, acompañamiento ni audio.
- El MIDI resultante requiere un paso posterior de síntesis para escucharse.
- No es un modelo de lenguaje: no procesa ni genera texto, y no tiene capacidades multilingües.
- La pérdida de validación no mide musicalidad; el autor no publicó métricas de adherencia a la tonalidad.
- El vocabulario y los controles están limitados a 24 géneros, 16 estados de ánimo, 16 familias de instrumento, 5 compases y 24 tonalidades; las etiquetas fuera de ese conjunto se mapean a "desconocido".
- Riesgo de sesgo derivado de los corpus de entrenamiento (Lakh MIDI, MidiCaps, POP909, Nottingham), con posible sobrerrepresentación de ciertos estilos y culturas musicales.
- Licencia "other" sin términos detallados en la información disponible: es necesario revisar el repositorio antes de un uso comercial.
- No evaluado para usos más allá del boceto melódico; el autor lo declara no apto como sustituto de compositores.
- Modelo con muy pocas descargas (24) y sin likes, por lo que no hay validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/viknesh100/Apollo-M
- Repositorio de pretraining (Apollo): https://huggingface.co/viknesh100/Apollo
- Referencia arXiv 2406.02255 (citada en los tags del modelo)
- Referencia arXiv 2008.07142 (citada en los tags del modelo)
