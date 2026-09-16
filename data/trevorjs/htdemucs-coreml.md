# TrevorJS/htdemucs-CoreML

## Resumen

htdemucs-CoreML es una conversión del modelo Hybrid Transformer Demucs (htdemucs) de Meta AI al formato Core ML (`.mlpackage`), publicada por el usuario TrevorJS y utilizada como motor de separación de fuentes en la aplicación slurper. No es un modelo de lenguaje: es un modelo de separación de fuentes musicales que, a partir de un fragmento de audio estéreo, produce cuatro pistas independientes (batería, bajo, otros y voz).

Su relevancia está en el formato: permite ejecutar la separación directamente en el dispositivo, sobre la GPU de un Mac con Apple Silicon y macOS 15 o posterior, sin depender de CUDA ni de servicios en la nube. El paquete ocupa unos 0,2 GB, con un fichero de pesos de 209 MB en float32, y se distribuye con licencia MIT, la misma que el modelo original de Meta.

El autor documenta explícitamente el grafo exportado, las formas de los tensores y el procedimiento de conversión (trazado con `torch.jit.trace` y coremltools 9.0), además de una verificación numérica contra PyTorch medida en dB de SDR. Se trata, por tanto, de una conversión de infraestructura más que de un modelo nuevo entrenado desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid Transformer Demucs (htdemucs): rama temporal y rama frecuencial con etapa `_mask` en el grafo original |
| Parametros totales | no disponible (el fichero de pesos float32 ocupa 209 MB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje). Ventana de proceso: segmento estéreo de 7,8 s a 44,1 kHz, tensor `[1, 2, 343980]` |
| Tipos de cuantizacion | no disponible; solo se publica una variante float32 (el autor indica que float16 desborda) |
| Idiomas soportados | no aplicable (modelo de audio, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | Core ML ML Program (`.mlpackage`): `Manifest.json`, `model.mlmodel` y `weight.bin` de 209 MB |
| Entradas del grafo | `mix` `[1, 2, 343980]` (segmento estéreo) y `spec` `[1, 4, 2048, 336]` (magnitud del STFT: real/imag izquierda, real/imag derecha) |
| Salidas del grafo | `time` `[1, 8, 343980]` (rama temporal desnormalizada, `[fuente, canal]`) y `freq` `[1, 16, 2048, 336]` (rama frecuencial, `[fuente, canal, real/imaginario]`) |
| Fuentes separadas | 4: batería, bajo, otros, voz |
| Preprocesado en el anfitrion | STFT de 4096 puntos con ventana Hann periódica, hop 1024, padding reflectivo y normalización |
| Postprocesado en el anfitrion | Inversión de `freq` con `_ispec`, suma de la rama `time` y crossfade de segmentos con 25 % de solapamiento |
| Pipeline declarado | audio-to-audio |
| Tamano del repositorio | 0,2 GB |
| Fecha de publicacion en HuggingFace | 2026-09-16 |

## Arquitectura y entrenamiento

El modelo exportado corresponde al núcleo de HTDemucs en su versión de valores reales para un segmento de 7,8 s a 44,1 kHz. Según la model card, el grafo cubre `HTDemucs.forward` desde la normalización hasta justo antes de la operación `_mask`, en float32. El resultado se materializa en dos ramas diferenciadas: una rama temporal que devuelve 8 canales (`[fuente, canal]` para 4 fuentes estéreo) y una rama frecuencial que devuelve 16 canales (`[fuente, canal, real/imaginario]`). La card no detalla qué componente ejecuta la etapa de enmascarado ni el resto del pipeline posterior en producción.

El entrenamiento no se documenta en la información disponible más allá de la atribución: el modelo subyacente es Hybrid Transformer Demucs de Simon Rouard, Francisco Massa y Alexandre Défossez (Meta AI), publicado bajo licencia MIT. No se indican en la información proporcionada el número de tokens ni de horas de audio, la composición del dataset, ni si hubo etapas de RLHF o DPO (poco habituales en separación de fuentes). La innovación técnica de esta publicación es la propia conversión: trazado del núcleo con la ruta rápida de atención desactivada, exportación con coremltools 9.0 a un ML Program en precisión float32 y verificación numérica contra PyTorch sobre un segmento sintético antes de guardar el paquete.

## Capacidades

- Separación de fuentes musicales en 4 pistas: batería, bajo, otros y voz, a partir de audio estéreo a 44,1 kHz.
- Procesamiento por segmentos de 7,8 s con solapamiento del 25 % y crossfade, de modo que puede encadenarse sobre pistas de duración arbitraria siempre que el anfitrión gestione la ventana y el solapamiento.
- Inferencia en el dispositivo sobre la GPU de macOS 15 o posterior con Apple Silicon, sin conexión a servicios externos.
- Modelo de valores reales que consume la magnitud del STFT calculada por el anfitrión, lo que permite controlar el preprocesado (ventana, hop, padding) fuera del grafo.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, modo de pensamiento, visión, audio a texto ni generación de texto: es exclusivamente un modelo de audio-to-audio.
- No hay capacidades multilingües ni procesamiento de instrucciones en lenguaje natural.

## Casos de uso

- Aplicaciones de karaoke y práctica vocal: la pista de voz se aísla del resto de la mezcla y se puede atenuar en tiempo real dentro de una app de escritorio para Mac, ejecutando todo el proceso en local sin subir el audio a un servidor.
- Edición musical en DAW y home studio: extracción de stems para remezclar, hacer un remix o sustituir la batería de una maqueta, con la ventaja de que el material del usuario no sale del equipo.
- Herramientas de DJ y mashup: separación de bajo y batería para construir transiciones y ediciones en directo, aprovechando que el modelo trabaja por segmentos de 7,8 s y puede encadenarse sobre pistas completas.
- Limpieza de samples y bibliotecas de sonido: eliminar voces o aislar percusión de grabaciones antiguas antes de reutilizarlas en producción, con licencia MIT que permite integrarlo en productos comerciales.
- Postproducción de pódcast y vídeo: reducción de música de fondo o aislamiento de la locución para mejorar la inteligibilidad antes de la mezcla final.
- Preprocesado de datasets de audio para investigación en MIR: generación de stems etiquetados para entrenar clasificadores, detectores de tempo o modelos de transcripción, ejecutando el pipeline por lotes en un Mac.
- Aplicaciones de accesibilidad: realce de la voz sobre la instrumentación para personas con dificultades de audición en contextos de escucha compleja.
- Demos y prototipos de producto: al ser un `.mlpackage` autocontenido de 0,2 GB, se puede validar la viabilidad de una función de separación en un Mac antes de invertir en infraestructura de servidor.

## Benchmarks y rendimiento

La información disponible solo incluye la verificación de fidelidad de la conversión: comparación entre la salida de Core ML en GPU y PyTorch sobre un segmento sintético, expresada en dB de SDR. Estos valores miden el acuerdo numérico entre ambas implementaciones, no la calidad de separación del modelo.

| Fuente | Bateria | Bajo | Otros | Voz |
|---|---|---|---|---|
| SDR Core ML (GPU) frente a PyTorch, segmento sintetico | 114 dB | 128 dB | 114 dB | 100 dB |

No se han publicado resultados de benchmarks de calidad de separación (por ejemplo, SDR sobre MUSDB18-HQ) en la información disponible.

## Requisitos de hardware

- Almacenamiento: 0,2 GB de repositorio; el fichero `weight.bin` ocupa 209 MB en float32.
- Memoria de activaciones por inferencia (calculada a partir de las formas declaradas en float32): entrada `mix` unos 2,75 MB, entrada `spec` unos 11,0 MB, salida `time` unos 11,0 MB y salida `freq` unos 44,0 MB; en total del orden de 69 MB de tensores, sin contar buffers intermedios del grafo.
- Plataforma obligatoria: macOS 15 o posterior con Apple Silicon; el modelo se ejecuta en la GPU a través de Core ML. No hay ruta de ejecución en GPU NVIDIA (CUDA), ROCm ni en aceleradores de otros fabricantes.
- GPU recomendadas: no disponible; la model card solo especifica "macOS 15 o posterior" y ejecución en la GPU. No se indican modelos mínimos de chip M1, M2, M3 o M4.
- Cabe en equipos de consumo: sí, en cualquier Mac con Apple Silicon y macOS 15 o posterior, dado el tamaño reducido de pesos y activaciones.
- Opciones de despliegue: Core ML mediante la API de Core ML en Swift (el repositorio slurper incluye un anfitrión de referencia en `Sources/SlurperKit/Demucs.swift`) y coremltools 9.0 para la conversión. No es compatible con vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia para modelos de lenguaje.
- Latencia y throughput: no disponible. Como dato derivado de la ventana y el solapamiento, cada pasada procesa 7,8 s de audio y los segmentos se solapan un 25 %, por lo que se necesitan aproximadamente 1,33 pasadas por cada segundo de audio de entrada.
- Requisito de integración: el anfitrión debe implementar el STFT (4096 puntos, Hann periódica, hop 1024, padding reflectivo, normalizado), la inversión de la rama frecuencial, la suma de ramas y el crossfade; el paquete Core ML no incluye ese pipeline.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de proceso | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| htdemucs-CoreML (TrevorJS) | no disponible (pesos de 209 MB en float32) | 7,8 s por pasada, solapamiento del 25 % | Core ML `.mlpackage` float32 | MIT | HuggingFace: TrevorJS/htdemucs-CoreML |
| HTDemucs original (Meta AI) | no disponible en la informacion | mismo segmento de 7,8 s en la configuracion por defecto | PyTorch | MIT | Repositorio facebookresearch/demucs |
| Otras conversiones Core ML de Demucs | no disponible | no disponible | no disponible | no disponible | La busqueda web realizada no devolvio resultados relevantes sobre alternativas comparables |

No se dispone de datos de rendimiento comparado (SDR sobre MUSDB u otros conjuntos) para ninguna de las alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier expectativa de ese tipo es inaplicable.
- La separación se limita a cuatro fuentes (batería, bajo, otros y voz); no cubre stems adicionales como guitarra o piano, habituales en modelos de 6 pistas.
- Solo se publica la variante float32. El autor indica explícitamente que float16 desborda, por lo que no hay una ruta de cuantización documentada para reducir memoria o acelerar la inferencia.
- Dependencia fuerte de la plataforma: requiere macOS 15 o posterior y Apple Silicon; no es desplegable en servidores Linux con GPU NVIDIA, lo que descarta su uso en backends tradicionales.
- El paquete no incluye el pipeline completo: el anfitrión debe implementar STFT, inversión espectral, suma de ramas y crossfade con el solapamiento correcto. Un error en estos pasos degrada la calidad de salida aunque el grafo sea correcto.
- Los valores de SDR de la model card (100-128 dB) miden la coincidencia numérica entre Core ML y PyTorch, no la calidad de la separación musical; no deben presentarse como resultados de calidad.
- La información disponible no documenta sesgos, comportamiento en géneros musicales concretos, sangrado entre stems ni rendimiento en mezclas monofónicas o con frecuencias de muestreo distintas de 44,1 kHz.
- Riesgo de alucinación: no aplicable en el sentido habitual de modelos generativos de texto, pero sí existe el riesgo de artefactos o separación imperfecta en pasajes densos o muy reverberados.
- Licencia MIT: permite uso comercial y modificación, pero exige conservar el aviso de copyright y la atribución a Hybrid Transformer Demucs (Simon Rouard, Francisco Massa y Alexandre Défossez, Meta AI).
- No se indica en la información disponible si el modelo se ha validado en todas las versiones de macOS 15 ni en chips anteriores a la serie M.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TrevorJS/htdemucs-CoreML
- Repositorio original de Demucs (Meta AI, MIT): https://github.com/facebookresearch/demucs
- Aplicacion slurper, con el anfitrion de referencia en `Sources/SlurperKit/Demucs.swift` y el script `scripts/convert_htdemucs.py`: https://github.com/TrevorS/slurper
- Paper de referencia citado en la atribucion: "Hybrid Transformers for Music Source Separation", de Simon Rouard, Francisco Massa y Alexandre Défossez (Meta AI); no se proporciona enlace en la informacion disponible.
- Busqueda web realizada: no devolvio resultados relevantes sobre este modelo ni sobre conversiones equivalentes (los resultados obtenidos trataban sobre el aeropuerto de Hanói y no guardan relacion con la ficha).
