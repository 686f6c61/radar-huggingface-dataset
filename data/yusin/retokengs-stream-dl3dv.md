# Yusin/ReTokenGS-stream-dl3dv

## Resumen

ReTokenGS-stream-dl3dv es un modelo feed-forward de reconstrucción 3D y síntesis de vistas noveles (novel view synthesis) basado en gaussian splatting, publicado por el usuario Yusin en Hugging Face. Su particularidad es que implementa un bucle de refinamiento iterativo ("stream") que converge hacia un operador estacionario, con un paso de gradiente latente, normalización RMS externa y una fuga hacia el estado de la primera ronda. El modelo está afinado para que las vistas de entrada puedan llegar de forma incremental mientras el bucle se ejecuta, admitiendo cualquier número de rondas.

El modelo resuelve el problema de reconstruir una escena 3D a partir de un conjunto de imágenes con pose conocida, sin necesidad de optimización por escena en tiempo de test (feed-forward), y genera representaciones de gaussian splatting que permiten renderizar vistas nuevas. Está entrenado sobre el dataset DL3DV-10K, con un esquema de llegada de vistas de 8 + 4 + 4, y opera a una resolución de 256×256.

Es relevante porque combina la eficiencia del enfoque feed-forward con un mecanismo iterativo que mejora progresivamente la calidad de la reconstrucción a medida que se acumulan vistas, lo que lo hace adecuado para escenarios de captura incremental o streaming. El checkpoint contiene 366.972.350 parámetros en formato safetensors y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feed-forward con bucle iterativo convergente (stream) sobre gaussian splatting; operador estacionario con paso de gradiente latente y normalización RMS externa |
| Parametros totales | 366.972.350 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera con un número variable de vistas de entrada: 2, 4, 8, 16 en la evaluación) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de visión 3D, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo feed-forward de reconstrucción 3D que produce gaussian splats a partir de vistas con pose. El núcleo es un bucle iterativo ("stream") diseñado para converger: en cada ronda se aplica un operador estacionario con una fuga (leak) hacia el estado de la primera ronda, una normalización RMS externa y un paso de gradiente latente. A diferencia de la versión de papel (TokenGS), este checkpoint está afinado para que las vistas de entrada puedan llegar de forma incremental mientras el bucle se ejecuta, admitiendo un número arbitrario de rondas. En la evaluación se emplean 48 rondas y dos configuraciones de tokens: 1024 sin división y 1024 → 4096 con un umbral τ = 3.4e-6.

El entrenamiento se realizó sobre el dataset DL3DV-10K, con un esquema de llegada de vistas de 8 + 4 + 4. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF/DPO (no aplicable en este dominio). El modelo deriva de LocusGS / TokenGS, según indica el autor en la model card. La resolución de operación es 256×256 y no requiere optimización por escena en tiempo de test.

## Capacidades

- Reconstrucción 3D feed-forward a partir de vistas con pose conocida, sin optimización por escena en test.
- Síntesis de vistas noveles (novel view synthesis) mediante gaussian splatting.
- Procesamiento incremental de vistas: las entradas pueden llegar de forma progresiva mientras el bucle iterativo se ejecuta, con cualquier número de rondas.
- Refinamiento iterativo convergente mediante un operador estacionario con paso de gradiente latente.
- Configuración de tokens variable: 1024 sin división o 1024 → 4096 con división.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable (modelo de visión 3D).
- Capacidades especiales: modo streaming de vistas, bucle de convergencia con fuga hacia el estado inicial.

## Casos de uso

- Reconstrucción 3D incremental en captura en vivo: el modelo acepta vistas que llegan de forma progresiva (esquema 8 + 4 + 4) y refina la representación gaussiana a medida que se acumulan imágenes, lo que lo hace adecuado para pipelines de captura donde la cámara va revelando la escena.
- Síntesis de vistas noveles para realidad virtual y aumentada: a partir de 2 a 16 vistas con pose, genera representaciones gaussianas que permiten renderizar puntos de vista no capturados, con PSNR de hasta 29.70 en 16 vistas según la evaluación del autor.
- Digitalización de escenas para entornos de entrenamiento de robótica: la reconstrucción feed-forward sin optimización por escena reduce el coste de generar activos 3D a partir de secuencias de vídeo.
- Previsualización rápida de escenas en producción de contenido 3D: el enfoque feed-forward evita el coste de optimización por escena, lo que permite obtener una reconstrucción inicial en una sola pasada y refinarla con rondas adicionales.
- Investigación en reconstrucción 3D con vistas incrementales: el checkpoint sirve como base para experimentos sobre convergencia de bucles iterativos y streaming de vistas, dado que el código y las comparativas están publicados en el repositorio GitHub del autor.
- Evaluación comparativa de métodos de gaussian splatting: el modelo incluye en su documentación comparativas con LocusGS, TokenGS, tttLRM, ReCoSplat y S2Tok, lo que facilita su uso como referencia en estudios comparativos.

## Benchmarks y rendimiento

Evaluación en DL3DV-140 (split oficial de DepthSplat; índice oficial para 2/4 vistas, 8/16 uniformes en la ventana de 50 fotogramas; objetivos = los 50 fotogramas de la ventana; 48 rondas). Métricas: PSNR / SSIM / LPIPS.

| Tokens | 2 vistas | 4 vistas | 8 vistas | 16 vistas |
|---|---|---|---|---|
| 1024 (sin división) | 19.47 / 0.587 / 0.406 | 24.71 / 0.784 / 0.264 | 27.63 / 0.854 / 0.218 | 28.54 / 0.870 / 0.208 |
| 1024 → 4096 (τ = 3.4e-6) | 19.69 / 0.597 / 0.398 | 25.20 / 0.799 / 0.242 | 28.53 / 0.875 / 0.189 | 29.70 / 0.895 / 0.176 |

La comparativa completa con LocusGS y TokenGS (versión de papel), las baselines de optimización en tiempo de test y, para los modelos stream, el benchmark de streaming frente a tttLRM, ReCoSplat y S2Tok se encuentran en el README del código (GitHub `Yusin2Chen/TokenGS-Loop`, rama `stream_dl3dv`). No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 366.972.350 parámetros en precisión de 32 bits, el peso del modelo ronda los 1.47 GB; en 16 bits, unos 0.73 GB. A ello hay que sumar la memoria de activaciones y de las representaciones gaussianas, que depende del número de vistas y de tokens (1024 o 4096).
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; por el tamaño de pesos, es plausible en GPUs de consumo con suficiente VRAM, pero no se confirma.
- Opciones de despliegue: no disponible en la información proporcionada. El repositorio GitHub del autor (`Yusin2Chen/TokenGS-Loop`, rama `stream_dl3dv`) es la referencia para el código de inferencia.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / vistas | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReTokenGS-stream-dl3dv | 366.972.350 | 2 a 16 vistas evaluadas; rondas arbitrarias | Feed-forward con bucle iterativo y streaming de vistas | Apache-2.0 | Hugging Face (Yusin/ReTokenGS-stream-dl3dv) |
| TokenGS (versión de papel) | No disponible | No disponible | Feed-forward con bucle iterativo | No disponible | Referenciado en el README del código |
| LocusGS | No disponible | No disponible | Reconstrucción 3D con gaussian splatting | No disponible | Referenciado en el README del código |
| tttLRM | No disponible | No disponible | Modelo de reconstrucción 3D (baseline de streaming) | No disponible | Referenciado en el README del código |
| ReCoSplat | No disponible | No disponible | Reconstrucción 3D (baseline de streaming) | No disponible | Referenciado en el README del código |
| S2Tok | No disponible | No disponible | Reconstrucción 3D (baseline de streaming) | No disponible | Referenciado en el README del código |

Los datos cuantitativos de los modelos comparables no están disponibles en la información proporcionada; la comparativa completa se encuentra en el README del repositorio GitHub del autor.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la reconstrucción puede generar geometría o apariencia plausible en regiones no observadas; no se documenta el comportamiento en dichas regiones.
- Limitaciones de contexto o idioma: opera a resolución 256×256 y con vistas con pose conocida; no se documentan límites máximos de vistas ni de rondas más allá de las evaluadas (2, 4, 8 y 16 vistas, 48 rondas).
- Restricciones de licencia para uso comercial: licencia Apache-2.0, que permite uso comercial; el autor indica que deriva de LocusGS / TokenGS, por lo que conviene verificar las condiciones de esas obras originales.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, y no se dispone de pipeline declarado en Hugging Face; el código de inferencia debe obtenerse del repositorio GitHub del autor. El sha256 del archivo `model.safetensors` es `8aaa60c109ae6e5b7b869e0671278896de141fdc4fdde208d8989d4b3cd8c574`, útil para verificar la integridad de la descarga. No se documentan requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Yusin/ReTokenGS-stream-dl3dv
- Repositorio GitHub (rama stream_dl3dv): https://github.com/Yusin2Chen/TokenGS-Loop/tree/stream_dl3dv
- Dataset DL3DV-10K: https://huggingface.co/datasets/DL3DV/DL3DV-10K
- Paper, blog, demo: no disponible en la información proporcionada.
