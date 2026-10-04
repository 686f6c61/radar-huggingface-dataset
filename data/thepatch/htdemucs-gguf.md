# thepatch/htdemucs-GGUF

## Resumen

HTDemucs GGUF es una conversión al formato GGUF de los pesos de Hybrid Transformer Demucs (v4), el modelo de separación de fuentes musicales desarrollado por Meta Platforms (facebookresearch/demucs, versión 4.0.1). La conversión la publica el usuario thepatch y su objetivo es permitir la ejecución del modelo sin Python ni PyTorch, mediante stems.cpp, un separador de pistas escrito en C++ sobre ggml que funciona en CPU, CUDA, Vulkan y Metal. El repositorio no aporta pesos nuevos: empaqueta los tres checkpoints oficiales de HTDemucs en GGUF y documenta la paridad numérica frente a la implementación de referencia en float32.

El repositorio incluye tres variantes. `htdemucs` separa cuatro pistas (batería, bajo, otros, voz) con unos 42 M de parámetros; `htdemucs_6s` añade guitarra y piano, con unos 27 M de parámetros (el dato de safetensors del repo, 27.414.996 parámetros, corresponde a esta variante); y `htdemucs_ft` es un bag de cuatro modelos afinados, uno por pista, con 4x42 M de parámetros. Los ficheros van de 70 MiB a 640 MiB según variante y codificación, de modo que el modelo completo cabe en cualquier GPU de consumo e incluso se ejecuta en CPU.

Su relevancia es práctica: convierte un modelo de investigación dependiente de PyTorch en un binario autocontenido y portable, con soporte de aceleración por Vulkan y Metal además de CUDA, y con una verificación de paridad explícita (SNR frente a demucs 4.0.1) documentada por backend. Es, por tanto, una pieza de infraestructura de despliegue más que un modelo nuevo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (v4): rama temporal y rama espectral híbridas con cross-transformer |
| Parámetros totales | 27.414.996 en la variante `htdemucs_6s`; 42 M en `htdemucs`; 4x42 M en `htdemucs_ft` |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa audio; el material de referencia mide la separación completa de un clip de 20 s) |
| Tipos de cuantización | F32 y F16 (F16 solo en los pesos de matmul del cross-transformer; las convoluciones se mantienen en F32). No hay cuantizaciones enteras Q4/Q8 |
| Idiomas soportados | no aplica (separación de fuentes de audio; el idioma no es un eje del modelo) |
| Licencia | MIT (código y pesos de Meta Platforms, Inc. y filiales) |
| Formato de pesos | GGUF (`htdemucs-42M-v1.0-{F32,F16}.gguf`, `htdemucs_6s-27M-v1.0-{F32,F16}.gguf`, `htdemucs_ft-4x42M-v1.0-{F32,F16}.gguf`) |

Tamaños de fichero declarados:

| Fichero | Tamaño |
|---|---:|
| `htdemucs-42M-v1.0-F32.gguf` | 160 MiB |
| `htdemucs-42M-v1.0-F16.gguf` | 100 MiB |
| `htdemucs_6s-27M-v1.0-F32.gguf` | 104 MiB |
| `htdemucs_6s-27M-v1.0-F16.gguf` | 70 MiB |
| `htdemucs_ft-4x42M-v1.0-F32.gguf` | 640 MiB |
| `htdemucs_ft-4x42M-v1.0-F16.gguf` | 400 MiB |

## Arquitectura y entrenamiento

HTDemucs es un modelo híbrido de separación de fuentes musicales que combina dos dominios de representación: una rama temporal que opera sobre la forma de onda y una rama espectral que opera sobre el espectrograma. Ambas ramas se comunican mediante un cross-transformer, que es el componente que aporta el mecanismo de atención del modelo. La salida son pistas separadas (stems) con la misma duración que la mezcla de entrada. La conversión a GGUF no modifica la arquitectura ni los pesos: los tensores se renombran, las proyecciones de atención empaquetadas se dividen en q/k/v y las constantes se pliegan en metadatos. Cada fichero GGUF registra su checkpoint de origen en el campo `general.source.file`.

El entrenamiento es el del trabajo original *Hybrid Transformers for Music Source Separation* (Rouard, Massa, Défossez, ICASSP 2023); el repositorio de esta conversión no documenta número de tokens, composición del dataset ni uso de RLHF o DPO, por lo que esos datos deben consultarse en el proyecto upstream y no están disponibles aquí. La variante `htdemucs_ft` es un bag de cuatro modelos afinados individualmente por pista, lo que explica su tamaño de 4x42 M. La conversión se realizó con la herramienta `tools/convert_htdemucs.py` de stems.cpp, que también puede generar la codificación F16 reduciendo a la mitad únicamente los pesos de matmul del cross-transformer.

## Capacidades

- Separación de fuentes musicales en cuatro pistas (`htdemucs`, `htdemucs_ft`): batería, bajo, otros y voz.
- Separación en seis pistas (`htdemucs_6s`): batería, bajo, otros, voz, guitarra y piano.
- Inferencia en C++ puro sobre ggml, sin Python ni PyTorch en tiempo de ejecución.
- Ejecución en cuatro backends: CPU, CUDA, Vulkan y Metal.
- Modo servidor: `stems-server` localiza los ficheros por nombre de modelo (por ejemplo `"model": "htdemucs_6s"`) y expone la separación como servicio.
- Herramienta de línea de comandos `stems-split` con entrada de audio y directorio de salida de pistas.
- Verificación de paridad reproducible contra demucs 4.0.1 en float32 (cosine 0.9999 o superior en todas las pistas de todos los modelos).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje: no es un modelo de lenguaje.

## Casos de uso

- Preproducción musical y remezclas: extraer la pista de batería o de voz de una mezcla para trabajar sobre ella por separado, usando `htdemucs_6s` cuando haga falta aislar también guitarra y piano.
- Creación de instrumentales y versiones a capela: generar la pista `vocals` y el resto por separado para montar versiones karaoke o remixes, con la variante `htdemucs_ft` como opción de mayor calidad por pista.
- Postproducción de audio para vídeo: separar diálogo y música de una mezcla ya masterizada para reequilibrar niveles cuando no se dispone de las pistas originales.
- Muestreo y diseño sonoro: aislar un golpe de batería o un fragmento de bajo concreto para reutilizarlo en producción propia, aprovechando que el modelo corre en local sin depender de servicios externos.
- Integración en herramientas de escritorio sin Python: distribuir stems.cpp junto a una aplicación nativa en Windows, macOS o Linux, usando Vulkan o Metal para acelerar sin necesidad de instalar el stack de PyTorch.
- Procesado por lotes en servidor: montar `stems-server` detrás de una cola de trabajos para separar catálogos de audio de forma desatendida, con ficheros de 70-640 MiB que permiten mantener varias instancias en memoria.
- Archivado y restauración de material histórico: separar voces y acompañamiento en grabaciones antiguas para tareas de restauración o reedición.
- Investigación y evaluación de separación de fuentes: usar el binario C++ como referencia de paridad reproducible frente a la implementación en PyTorch, verificando el comportamiento en distintos backends.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible en el sentido habitual (MMLU, HumanEval, GSM8K, etc.), ya que el modelo no es un modelo de lenguaje. El autor sí publica una tabla de paridad numérica: la SNR en dB de la salida en C++ frente a `demucs 4.0.1` en float32, para la separación completa de un clip de 20 s (el `test.mp3` de demucs) y la peor pista de cada modelo. Las medidas se tomaron el 2026-10-02/03 sobre stems.cpp con ggml `f30f0cdc`; CPU, CUDA y Vulkan en un Core Ultra 9 275HX con RTX 5070 Laptop, y Metal en un Apple M4.

| Modelo | Codificación | CPU | CUDA | Vulkan | Metal |
|---|---|---:|---:|---:|---:|
| htdemucs | F32 | 78,4 | 73,5 | 78,3 | 70,7 |
| htdemucs | F16 | 56,9 | 73,5 | 56,4 | no disponible |
| htdemucs_6s | F32 | 75,3 | 68,5 | 75,2 | 74,3 |
| htdemucs_6s | F16 | 53,9 | 68,5 | 55,5 | no disponible |
| htdemucs_ft | F32 | 70,7 | 69,5 | 70,6 | 67,1 |
| htdemucs_ft | F16 | 63,5 | 69,5 | 64,4 | no disponible |

Según el autor, F32 es la referencia; F16 reduce un 40 % el tamaño pero no es más rápido, y cuesta unos 20 dB de SNR en CPU y Vulkan, mientras que en CUDA la pérdida es inmedible porque sus matmuls F32 ya se ejecutan como TF32. Las tablas por pista están en `docs/PARITY.md` del repositorio stems.cpp.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. El fichero mayor es `htdemucs_ft-4x42M-v1.0-F32.gguf` con 640 MiB; el menor es `htdemucs_6s-27M-v1.0-F16.gguf` con 70 MiB. Cabe en cualquier GPU con memoria dedicada y también en memoria compartida de CPU.
- GPU recomendadas: no hay requisitos exigentes. Los datos de paridad se midieron en una RTX 5070 Laptop (CUDA/Vulkan) y en un Apple M4 (Metal). Cualquier GPU compatible con CUDA, Vulkan o Metal es suficiente.
- GPU de consumo: sí, con holgura. Incluso iGPU y gráficas de gama baja con Vulkan pueden ejecutar los ficheros de 70-160 MiB.
- Opciones de despliegue: stems.cpp, compilado con `./build.sh cpu|cuda|vulkan|metal` (en Windows, `build.cmd`). Incluye el binario `stems-split` para uso por línea de comandos y `stems-server` para uso como servicio. No aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y rendimiento: no disponible. El autor no publica tiempos de inferencia ni throughput, solo medidas de SNR. La referencia usada es un clip de 20 s, sin indicar el tiempo de proceso.

## Comparativa con modelos similares

Comparativa interna entre las tres variantes incluidas en el repositorio (datos del propio autor):

| Modelo | Parámetros | Pistas | Fichero F32 / F16 | Licencia |
|---|---|---|---|---|
| htdemucs | 42 M | drums, bass, other, vocals | 160 MiB / 100 MiB | MIT |
| htdemucs_6s | 27 M | drums, bass, other, vocals, guitar, piano | 104 MiB / 70 MiB | MIT |
| htdemucs_ft | 4x42 M | drums, bass, other, vocals (bag de cuatro modelos afinados) | 640 MiB / 400 MiB | MIT |

Frente a alternativas de terceros del mismo nicho (Spleeter de Deezer, Open-Unmix, modelos MDX-Net), no se dispone en la información proporcionada de parámetros, ventanas de proceso ni métricas verificables que permitan una comparación rigurosa, por lo que esa comparativa se marca como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible. La calidad de separación puede degradarse en géneros, mezclas o instrumentaciones poco representados en los datos de entrenamiento originales.
- Riesgo de artefactos: la separación de fuentes introduce artefactos audibles en las pistas extraídas. El propio autor advierte que F16 mantiene la SNR más de 50 dB por debajo de cualquier pista, pero pierde unos 20 dB de fidelidad frente a F32 en CPU y Vulkan.
- La codificación F16 no acelera la inferencia, solo reduce el tamaño del fichero; si la fidelidad es prioritaria, debe usarse F32.
- Limitación de contexto o idioma: no aplica el idioma, pero la longitud de segmento procesable no está documentada en el repositorio. Los datos de referencia corresponden a un clip de 20 s, y no se especifica el comportamiento en piezas largas.
- Restricciones de licencia: los pesos y el código son MIT según Meta Platforms, Inc. y afiliados, pero el usuario debe cumplir la legislación aplicable sobre derechos de autor al separar y reutilizar material musical de terceros. La separación de una obra no elimina los derechos sobre la composición ni sobre la grabación original.
- Madurez del proyecto: el repositorio presenta 0 descargas y 0 me gusta en el momento de la consulta, y la conversión es de un tercero no vinculado a Meta. La validación se limita a la paridad numérica frente a demucs 4.0.1 en float32.
- Los tensores convertidos provienen de checkpoints concretos de demucs 4.0.1; versiones distintas del upstream pueden no ser equivalentes.
- stems.cpp es un proyecto independiente y pequeño, con la superficie de mantenimiento y soporte que eso implica para uso en producción.
- La búsqueda web realizada no ha devuelto resultados relevantes sobre este modelo ni sobre stems.cpp; los únicos resultados obtenidos eran sitios no relacionados con la consulta y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thepatch/htdemucs-GGUF
- Proyecto stems.cpp: https://github.com/betweentwomidnights/stems.cpp
- Repositorio upstream de Demucs: https://github.com/facebookresearch/demucs
- Paper de referencia citado por el autor: *Hybrid Transformers for Music Source Separation* (Rouard, Massa, Défossez, ICASSP 2023); enlace no disponible en la información proporcionada.
- Documentación de paridad: `docs/PARITY.md` dentro del repositorio stems.cpp; URL directa no disponible en la información proporcionada.
- Checkpoints de origen citados: htdemucs `955717e8-8726e21a.th`; htdemucs_6s `5c90dfd2-34c22ccb.th`; htdemucs_ft `f7e0c4bc-ba3fe64a.th`, `d12395a8-e57c48e6.th`, `92cfc3b6-ef3bcb9c.th`, `04573f0d-f3cf25b2.th`.
