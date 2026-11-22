# wangzi6224/bandit-v2-multi-mlx

## Resumen

bandit-v2-multi-mlx es una conversión a formato MLX del checkpoint multilingual de Bandit v2, un modelo de separación de fuentes de audio cinematográfico desarrollado originalmente por investigadores de Netflix (Karn N. Watcharasupat, Chih-Wei Wu, Iroro Orife). El modelo descompone una señal de audio en tres tallos: voz (speech), música (music) y efectos de sonido (sound effects), una tarea conocida como cinematic audio source separation (CASS). Esta conversión, publicada por el usuario wangzi6224, permite ejecutar el modelo en el ecosistema MLX de Apple (Swift y Python) sin reentrenamiento ni cuantización.

El modelo original se describe en el paper "Remastering Divide and Remaster: A Cinematic Audio Source Separation Dataset with Multilingual Support" (arXiv:2407.07275) y los pesos originales están depositados en Zenodo (registro 12701995, fichero `checkpoint-multi.ckpt`). La conversión conserva los 1602 tensores del checkpoint original byte a byte, salvo la eliminación de alias duplicados y la conversión de los pesos de banda de frecuencia de float64 a float32. El modelo cuenta con 37.033.210 parámetros (aproximadamente 37 M) y un tamaño de repositorio de 0,1 GB.

La relevancia de esta ficha radica en que se trata de un modelo de nicho (separación de fuentes de audio) con licencia CC BY-SA 4.0, orientado a pipelines de postproducción audiovisual y a la experimentación con MLX en hardware Apple. No es un modelo de lenguaje ni un modelo multimodal generativo: su única función es la separación de tallos de audio a 48 kHz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de separación de fuentes de audio (Bandit v2, basada en bandas de frecuencia); detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 37.033.210 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio); procesa fragmentos de 8 segundos con salto de 1 segundo y solapamiento Hann |
| Tipos de cuantizacion | no disponible; la conversion no aplica cuantizacion (pesos en safetensors, presumiblemente float32) |
| Idiomas soportados | no disponible; el checkpoint es "multilingual" segun el autor, pero no se detalla la lista de idiomas |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Bandit v2 es un modelo de separación de fuentes de audio diseñado para el escenario cinematográfico, donde la mezcla contiene voz, música y efectos de sonido superpuestos. La conversión documenta el layout de bandas: 64 bandas musicales a 48 kHz, con n_fft de 2048 y hop de 512. La entrada es audio mono a 48 kHz (cada canal se procesa por separado), y la inferencia se realiza en fragmentos de 8 segundos con salto de 1 segundo y solapamiento-add Hann, tal como en el handler oficial de inferencia.

El modelo original fue entrenado sobre el dataset DnR v3 (Divide and Remaster v3), que según el paper está derivado de contenido que permite uso comercial, obra derivada y redistribución. No se dispone en la información proporcionada de detalles sobre el número de tokens de audio, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables habitualmente a modelos de separación de audio). La conversión a MLX no introduce cambios en los pesos más allá del renombrado de tensores y la conversión de precisión de los pesos de banda de frecuencia (diferencia máxima de 9,9e-9).

## Capacidades

- Separación de audio cinematográfico en tres tallos: speech, music y sound effects.
- Procesamiento de audio mono a 48 kHz, canal por canal.
- Procesamiento por fragmentos de 8 segundos con solapamiento-add, lo que permite manejar pistas de duración arbitraria.
- Soporte multilingüe declarado en el nombre del checkpoint (`checkpoint-multi`), aunque sin lista explícita de idiomas.
- Ejecución nativa en MLX (Swift y Python) sobre hardware Apple.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni generación de texto: es un modelo puramente de audio.

## Casos de uso

- Postproducción audiovisual: separar una mezcla cinematográfica en tallos de diálogo, música y efectos para remezclar, doblar o regrabar diálogos sin necesidad de stems originales. El modelo está entrenado específicamente para este dominio.
- Doblaje y localización: aislar el tallo de voz de una película o serie para sustituir el diálogo original por una versión doblada, conservando música y efectos intactos.
- Restauración y remasterización de archivos: recuperar tallos de audio de material antiguo donde solo se conserva la mezcla final, usando el modelo como paso previo a la limpieza o el remasterizado.
- Creación de datasets de audio: generar pares (mezcla, tallo) para entrenar otros modelos de separación o de reconocimiento de voz en condiciones ruidosas.
- Investigación en separación de fuentes: servir como baseline reproducible en MLX para comparar algoritmos de CASS en hardware Apple, con pesos idénticos al checkpoint oficial de Netflix.
- Herramientas de accesibilidad: aislar la voz de una mezcla para mejorar la inteligibilidad en subtitulado automático o en aplicaciones de ayuda auditiva.
- Prototipado en macOS/iOS: integrar la separación de tallos en aplicaciones nativas Apple mediante MLX Swift, aprovechando la aceleración en chips M-series.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 37 M de parámetros, el modelo en float32 ocupa aproximadamente 148 MB de pesos; en float16, unos 74 MB. El consumo real de memoria incluye buffers de activación y la ventana de 8 segundos a 48 kHz (384.000 muestras por fragmento), por lo que se estima un uso total en el rango de cientos de MB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: al ser una conversión MLX, está pensada para chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se documenta soporte para GPU NVIDIA.
- Cabe en GPU consumer: sí, en cualquier Mac con Apple Silicon; el tamaño del repositorio (0,1 GB) lo confirma.
- Opciones de despliegue: MLX (Python y Swift). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bandit-v2-multi-mlx | 37.033.210 | Separación CASS (speech/music/SFX) | Fragmentos de 8 s, 48 kHz mono | CC BY-SA 4.0 | Hugging Face (MLX) |
| Bandit v2 original (checkpoint-multi) | no disponible en la informacion | Separación CASS | Fragmentos de 8 s, 48 kHz mono | CC BY-SA 4.0 | Zenodo (PyTorch) |
| Demucs (Meta) | no disponible en la informacion | Separación musical (4 tallos) | no disponible | MIT (código) / pesos con licencia propia | GitHub, Hugging Face |
| MDX-Net | no disponible en la informacion | Separación musical (2-4 tallos) | no disponible | no disponible | Varios repositorios |

La comparación con Demucs y MDX-Net es orientativa: ambos están orientados a separación musical, no a separación cinematográfica con tallo de voz dedicado, por lo que la tarea no es idéntica. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: solo realiza separación de audio; no genera texto, no razona y no soporta tool calling. No debe evaluarse con benchmarks de LLM.
- Entrada mono: cada canal debe procesarse por separado, lo que duplica el coste en audio estéreo y puede degradar la coherencia entre canales.
- Ventana fija de 8 segundos con salto de 1 segundo: audio muy largo requiere procesamiento por bloques y ensamblaje con solapamiento-add; errores en el ensamblaje pueden producir artefactos.
- Idiomas: el checkpoint se declara multilingüe, pero no se especifica la lista de idiomas soportados ni su cobertura; el rendimiento en idiomas no representados en el entrenamiento es incierto.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia. Esto puede ser incompatible con productos propietarios que no quieran liberar sus derivados.
- Riesgo de alucinación: en separación de fuentes, el equivalente es la introducción de artefactos o la filtración de componentes entre tallos; no se dispone de métricas publicadas en esta conversión.
- Conversión no oficial: aunque los pesos son idénticos al checkpoint original salvo cambios de precisión documentados, el autor de la conversión no es el equipo original de Netflix; la validación numérica completa corre por cuenta del usuario.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/wangzi6224/bandit-v2-multi-mlx
- Paper: https://arxiv.org/abs/2407.07275
- Pesos originales (Zenodo): https://zenodo.org/records/12701995
- Código original: https://github.com/kwatcharasupat/bandit-v2
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
