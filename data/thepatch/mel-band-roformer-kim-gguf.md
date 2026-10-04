# thepatch/mel-band-roformer-kim-GGUF

## Resumen

Mel-Band RoFormer (Kim) GGUF es la conversión a formato GGUF del modelo de separación de fuentes musicales de Kimberley Jensen, publicado por el usuario thepatch. Concretamente, estima la pista de voz (vocals) de una mezcla musical; el instrumental se obtiene restando la voz a la mezcla original, tal como hace el script de inferencia del modelo original. El modelo base es KimberleyJSN/melbandroformer, revisión ac9b0614ab3cd7f77219e18ba494dfd93956c348.

El problema que resuelve es la separación de stems (voz frente a acompañamiento) sin depender de Python ni de librerías de audio pesadas. La conversión está pensada específicamente para stems.cpp, un separador de stems en C++/ggml que funciona en CPU, CUDA, Vulkan y Metal. El modelo tiene 228.202.788 parámetros (aproximadamente 0,2 B) y se distribuye en dos variantes de precisión, F32 y F16.

Su relevancia radica en que permite ejecutar un separador de voz de calidad en entornos ligeros, dispositivos de consumo y sin dependencias de Python, lo que facilita integrarlo en aplicaciones de escritorio, servidores ligeros o pipelines de audio. El repositorio ocupa 1,4 GB y la licencia declarada es MIT, aunque con matices sobre la atribución de copyright que se detallan más abajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mel-Band RoFormer (transformer con rotary position embeddings sobre bandas mel) |
| Parametros totales | 228.202.788 (aproximadamente 0,228 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa por fragmentos, p. ej. chunks de 8 s y demix_track completo) |
| Tipos de cuantizacion | GGUF en F32 y F16 |
| Idiomas soportados | no disponible (no es un modelo de texto; opera sobre audio) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors del modelo original convertidos) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mel-Band RoFormer, un transformer que aplica atención con rotary position embeddings (frecuencias rotatorias) y opera sobre el espectrograma organizado en bandas mel. La conversión a GGUF renombra los tensores, escribe el layout de bandas mel como listas de índices planas (de modo que el runtime no necesita librosa) y verifica y almacena las frecuencias rotatorias como un parámetro theta. Por lo demás, la arquitectura y los pesos permanecen sin cambios respecto al modelo original. El modelo estima específicamente la fuente de voz.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO; estos datos no están disponibles en la información consultada. La conversión se realizó con la herramienta tools/convert_roformer.py de stems.cpp usando el preset kim, y produce dos ficheros: mel_band_roformer_kim-0.2B-v1.0-F32.gguf (870 MiB) y mel_band_roformer_kim-0.2B-v1.0-F16.gguf (435 MiB). La innovación técnica principal de esta distribución es la portabilidad del runtime (C++/ggml sin Python) y la paridad numérica verificada frente a la implementación de referencia en PyTorch.

## Capacidades

- Separación de la pista de voz a partir de una mezcla musical (audio-to-audio).
- Obtención del instrumental por sustracción de la voz estimada a la mezcla original.
- Ejecución en CPU, CUDA, Vulkan y Metal a través de stems.cpp.
- Conformidad con la comprobación de paridad (parity check) de stems.cpp frente a la salida de referencia en PyTorch float32.
- Procesamiento por fragmentos (chunking) sobre pistas completas mediante demix_track.
- Integración con stems-server, que localiza el modelo por nombre (mel_band_roformer_kim).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada/salida conversacional ni capacidades multilingües; estas no aplican o no están disponibles.

## Casos de uso

- Producción de karaoke: el modelo aísla la voz para poder eliminarla y generar la pista instrumental, que se obtiene restando la voz a la mezcla original tal como hace el script de inferencia del modelo base.
- Remezcla y remasterización musical: obtener el stem de voz por separado permite reequilibrar niveles, aplicar procesado independiente o reencajar la voz en una nueva mezcla.
- Preprocesado para reconocimiento de voz (ASR): aislar la voz del acompañamiento mejora la relación señal-ruido antes de pasar el audio a un sistema de transcripción sobre grabaciones musicales ruidosas.
- Edición y reparación vocal: con la voz separada es posible corregir afinación, aplicar de-essing o limpiar tomas con acompañamiento presente sin afectar al instrumental.
- Archivo y restauración de grabaciones: separar stems facilita conservar y reprocesar colecciones de audio con mayor flexibilidad, ejecutándolo en CPU sin dependencias de Python.
- Aplicaciones de escritorio y móviles: al distribuirse en GGUF y ejecutarse vía stems.cpp en CPU, CUDA, Vulkan y Metal, puede embeberse en herramientas nativas ligeras sin entorno Python.
- Trabajo para DJ y sampleado: extraer la voz limpia permite crear edits, mashups o samples, con latencia baja (véase la sección de hardware) incluso en GPU de portátil.
- Evaluación y verificación de conversiones: el repositorio incluye SHA256SUMS y comprobaciones de paridad, útil para validar portes de modelos RoFormer a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; no aplican a un modelo de separación de audio. En su lugar, la model card reporta medidas de paridad de la señal de voz (SNR, en dB) de la salida en C++ frente a la ejecución de referencia MelBandRoformer en PyTorch float32 sobre CPU, para un clip de 20 s (test.mp3 de demucs). El formato es seg (primer fragmento de 8 s) / full (demix_track completo). Las medidas se tomaron el 2026-10-02/03.

| Codificacion | CPU (seg/full) | CUDA (seg/full) | Vulkan (seg/full) | Metal (seg/full) | Clip 20 s (Vulkan, RTX 5070) |
|---|---|---|---|---|---|
| F32 | 57,0 / 72,7 | 57,0 / 72,7 | 57,0 / 72,7 | 61,5 / 74,4 | 6,5 s |
| F16 | 45,4 / 58,2 | 46,9 / 61,0 | 47,6 / 59,8 | no disponible | 5,1 s |

F32 se considera la referencia. F16 reduce a la mitad el tamaño de cada peso de matmul 2D y el del fichero, con un coste de aproximadamente 13 dB, manteniéndose más de 58 dB por debajo de la voz en la pista completa. Las cifras «seg» son inferiores porque el primer fragmento corresponde sobre todo a una intro con reflexiones donde la voz está casi en silencio (mayor error absoluto 4e-8).

## Requisitos de hardware

- Peso de los ficheros: 870 MiB (F32) y 435 MiB (F16); la VRAM necesaria para los pesos es en torno a esos valores, más el espacio para activaciones y buffers de audio, que no se especifica.
- Cabe en GPUs de consumo sin problema por tamaño de pesos; el repositorio solo aporta medidas de rendimiento, no requisitos mínimos de VRAM.
- Hardware empleado en las pruebas: Core Ultra 9 275HX con RTX 5070 Laptop (CPU, CUDA y Vulkan) y Apple M4 (Metal).
- Funciona también solo en CPU (sin GPU), ya que es uno de los backends soportados.
- Opciones de despliegue: stems.cpp con backends cpu, cuda, vulkan o metal; incluye stems-server, que localiza el modelo por nombre. La descarga de modelos se hace con ./models.sh mel_band_roformer_kim (con --encoding f16 para la mitad de tamaño).
- Latencia medida: un clip de 20 s se procesa en 6,5 s con F32 y 5,1 s con F16 en Vulkan sobre RTX 5070 Laptop, es decir, aproximadamente 3,1x y 3,9x más rápido que tiempo real respectivamente. No se dispone de cifras de throughput agregado para CPU, CUDA o Metal.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento o licencia de modelos alternativos, por lo que no es posible establecer una comparativa cuantitativa fiable. Como alternativas conocidas de la misma categoría (separación de stems musicales) podrían citarse Demucs (htdemucs), Spleeter o los modelos MDX-Net, pero sus especificaciones y métricas de rendimiento no están disponibles en la información consultada. La ventaja diferencial documentada de este modelo frente a alternativas habituales es su formato GGUF y su ejecución mediante stems.cpp en C++/ggml sin Python, con paridad verificada frente a PyTorch.

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea: estima la voz; no genera texto, no razona ni admite otras modalidades.
- El instrumental se obtiene por sustracción (mezcla menos voz), por lo que puede arrastrar artefactos o cancelaciones de fase en pasajes complejos.
- La variante F16 introduce un coste de paridad de aproximadamente 13 dB frente a F32; para máxima fidelidad se recomienda F32.
- El primer fragmento (seg) de una pista puede mostrar SNR más bajo por intros con voz casi en silencio; no debe interpretarse como error del modelo en el conjunto de la pista.
- Licencia MIT, pero con matices relevantes para producción: el repositorio original declara MIT en metadatos, aunque no incluye fichero de licencia ni nombra titular de copyright. El LICENSE de esta conversión aplica el texto MIT estándar atribuido a la cuenta que sube el modelo, y NOTICE deja constancia de ello. Conviene revisar la atribución antes de un uso comercial.
- No se documentan sesgos, idiomas soportados (al ser audio, la noción de idioma no aplica igual) ni limitaciones de contexto; estos datos no están disponibles.
- Calidad de la separación depende de la mezcla de entrada; no se documentan métricas objetivas de calidad musical (SDR) más allá de las medidas de paridad.
- No se proporcionan requisitos mínimos de VRAM ni cifras de latencia para todos los backends.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thepatch/mel-band-roformer-kim-GGUF
- Modelo base (original): https://huggingface.co/KimberleyJSN/melbandroformer
- Repositorio stems.cpp: https://github.com/betweentwomidnights/stems.cpp
