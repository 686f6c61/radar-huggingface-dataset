# yutengz/rvc-fun-covers

## Resumen

`yutengz/rvc-fun-covers` no es un modelo de lenguaje ni un modelo fundacional: es un repositorio de artefactos de un proyecto de conversión de voz (voice conversion) basado en RVC (Retrieval-based Voice Conversion). Contiene pistas de audio ya procesadas (covers en MP3, stems separados en FLAC), scripts de reproducción del pipeline y parámetros de inferencia para cuatro voces concretas (丁真, 懒羊羊, 曼波 y 特朗普) obtenidas de un repositorio de terceros (`chaye741/RVC-Voice-Models`). El autor lo publica como material reproducible y reutilizable, no como un modelo entrenado por él.

El valor técnico del repositorio está en la documentación del pipeline completo: separación de fuente con BS-Roformer, eliminación de coros y reverberación, extracción de pitch con RMVPE, conversión con Applio y mezcla final con normalización de sonoridad a −11 LUFS. Incluye decisiones de ajuste concretas por voz (transposición en semitonos, ratio voz/instrumental en LU, uso o no del índice FAISS) y una heurística de transposición por segmento para un medley de 30 minutos con voces masculinas.

Es relevante ahora porque ejemplifica un flujo de trabajo reproducible de RVC sobre GPU de consumo (RTX 4090 en Vast.ai) y porque documenta los fallos típicos del ecosistema (desajuste de dimensión del índice, requisitos de Python, errores de carga de faster-whisper). No aporta pesos de un modelo de lenguaje ni benchmarks de IA generativa de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RVC (Retrieval-based Voice Conversion) sobre ContentVec + RMVPE para pitch; separación con BS-Roformer |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los audios son en chino, pero no se declara soporte lingüístico) |
| Licencia | no disponible |
| Formato de pesos | no disponible en este repo; los pesos RVC referenciados son `.pth` (RVC v1 a 40k y v2 a 40k/48k) alojados en `chaye741/RVC-Voice-Models`; los artefactos de este repo son `.mp3` (320 kbps) y `.flac` |
| Tamano del repositorio | 1,3 GB |
| Fecha de creacion | 2026-11-22 |
| Fecha de actualizacion | 2026-11-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. El pipeline documentado es: (1) separación de voces e instrumental con BS-Roformer, obteniendo un instrumental sin voces ni coros; (2) eliminación de coros y de reverberación para generar `lead_dry`, la señal de entrada limpia para RVC; (3) extracción de pitch con RMVPE; (4) conversión de voz con Applio usando `index_rate 0.75`, `protect 0.33` y ContentVec como extractor de características; (5) mezcla con control de sonoridad en LUFS y remuestreo a 44,1 kHz.

Los cuatro modelos de voz son RVC de tercera persona: 丁真 en v1 a 40k (sin índice, porque el índice de 768 dimensiones del repo no coincide con el modelo v1), 懒羊羊 en v2 a 48k, 曼波 en v2 a 40k y 特朗普 en v2 a 48k. No se documentan datos de entrenamiento, número de épocas, composición del dataset ni procesos de alineación o RLHF. La única innovación metodológica destacable es la heurística de transposición por segmento en `scripts/heji_fix.py`, que decide el desplazamiento en semitonos según la mediana de pitch del original (por ejemplo, 丁真 baja una octava solo si la mediana supera E4) y sincroniza el instrumental con rubberband.

## Capacidades

- Conversión de voz many-to-one: transforma una interpretación vocal dada en una de las cuatro voces de destino manteniendo el contenido lingüístico y la melodía.
- Separación de fuentes musicales: genera instrumental limpio, voces completas, voz principal seca y coros por separado.
- Ajuste de tono por voz y por canción, con transposición del instrumental sincronizada.
- Detección automática de puntos de corte en medleys largos mediante `bounds.py`, basada en cambios de estructura musical.
- Transcripción aproximada de letras con Whisper (`whisper-large-v3-turbo` vía transformers) para identificar canciones, con advertencia explícita de alucinaciones del ASR.
- Normalización de sonoridad a −11 LUFS y exportación a MP3 de 320 kbps.
- Reproducibilidad del pipeline completo mediante scripts (`setup.sh`, `sep.sh`, `conv2.sh`, `mix3.py`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada en tiempo real como API; es un pipeline offline por lotes.

## Casos de uso

- Reutilización de stems para remezclas: los FLAC separados (`instrumental`, `vocals`, `lead_dry`, `backing_vocals`) permiten volver a mezclar o cambiar de voz sin repetir la separación, que es la fase más costosa.
- Producción de covers con voz sintética para contenido de entretenimiento: el flujo documentado produce MP3 listos para publicar a −11 LUFS, un nivel habitual en plataformas de vídeo.
- Investigación en conversión de voz: sirve como caso de referencia para comparar configuraciones de `index_rate` y `protect`, y para estudiar el impacto del índice FAISS cuando la dimensionalidad no coincide con la versión del modelo.
- Automatización de pipelines de audio en GPU: los scripts permiten procesar lotes de canciones en una instancia con RTX 4090, con tiempos de entorno de unos 10 minutos para `setup.sh`.
- Segmentación automática de directos o medleys: `bounds.py` detecta cortes por cambios estructurales, útil para archivos largos sin marcas de capítulo.
- Docencia y divulgación técnica: el apartado de problemas conocidos (Python ≥3.11 por numpy 2.4, sintaxis de `core.py prerequisites`, fallo de ctranslate2 con UnicodeDecodeError) ahorra horas de depuración a quien replique el flujo.
- Verificación de calidad de ASR en música: el uso de Whisper para identificar letras y su tasa de alucinación sirven como caso práctico de límites del ASR en audio musical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el proyecto se ejecutó en una RTX 4090 (24 GB) en Vast.ai.
- GPU recomendadas: RTX 4090 según la experiencia documentada; no se aportan datos para A100, H100 ni otras GPU.
- Cabe en GPU de consumo: sí, al menos en RTX 4090; no se documenta comportamiento en GPU con menos VRAM.
- Despliegue: Applio (entorno `.venv` propio), BS-Roformer para separación, RMVPE para pitch, rubberband para transposición, transformers con `whisper-large-v3-turbo`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Solo se indica que la instalación del entorno tarda unos 10 minutos.
- Requisito de software: Python ≥3.11 por numpy 2.4 en los requisitos de Applio.

## Comparativa con modelos similares

| Proyecto | Tipo | Pesos incluidos | Pipeline documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yutengz/rvc-fun-covers` | Repositorio de artefactos RVC + scripts | No (referencia a `chaye741/RVC-Voice-Models`) | Sí, completo y reproducible | no disponible | Público, 0 descargas |
| `chaye741/RVC-Voice-Models` | Colección de modelos de voz RVC | Sí (`.pth` v1/v2) | No documentado en esta ficha | no disponible | Público |
| Applio | Framework de conversión de voz | No aplica | Documentación propia del proyecto | no disponible en esta ficha | Público |
| RVC original (Retrieval-based Voice Conversion WebUI) | Framework de conversión de voz | No aplica | Documentación propia del proyecto | no disponible en esta ficha | Público |

No se dispone de datos de rendimiento comparables (métricas de similitud de hablante, MOS, WER sobre voces convertidas) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval ni GSM8K, y no ofrece generación de texto, código ni razonamiento.
- Los pesos de voz son de terceros y no se declara licencia; el uso comercial de las voces clonadas (en particular las de personas reales como 丁真 o 特朗普) puede infringir derechos de imagen o de personalidad según la jurisdicción.
- Los covers emplean canciones descargadas de Bilibili; la redistribución de los MP3 y stems puede vulnerar derechos de autor de las obras originales.
- El índice de 丁真 no es utilizable con el modelo v1 (768 dimensiones frente a las esperadas), por lo que la calidad de esa voz depende solo del modelo sin índice.
- La transcripción de letras con Whisper presenta alucinaciones frecuentes, según advierte el propio autor; los nombres de pista del medley son conjeturas y uno de ellos (`04_第四首`) no se identificó.
- El ajuste de transposición es heurístico y específico de este conjunto de canciones; no hay garantía de que generalice a otros rangos vocales.
- El repositorio no incluye pesos, ficha de modelo estándar, evaluación objetiva ni métricas de calidad; la reproducibilidad depende de dependencias externas (Applio, BS-Roformer, RMVPE, rubberband).
- Se documentan fallos de entorno: `faster-whisper` (ctranslate2) lanza `UnicodeDecodeError` en la imagen usada, lo que obliga a usar transformers; y la CLI de `core.py` requiere `--models --no-exe` en lugar de `--models True`.
- No hay información sobre sesgos, dado que no se trata de un modelo estadístico de propósito general evaluado con esos criterios.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/yutengz/rvc-fun-covers
- Modelos de voz de referencia: https://huggingface.co/chaye741/RVC-Voice-Models
- Applio (framework de conversión de voz): https://github.com/IAHispano/Applio
- RVC WebUI original: https://github.com/RVC-Project/Retrieval-based-Voice-Conversion-WebUI
- BS-Roformer (separación de fuentes): https://github.com/lucidrains/BS-RoFormer
- RMVPE (extracción de pitch): https://github.com/Dream-High/RMVPE
- Whisper large-v3-turbo (transcripción): https://huggingface.co/openai/whisper-large-v3-turbo
