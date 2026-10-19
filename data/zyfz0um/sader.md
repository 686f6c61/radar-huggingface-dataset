# zyfz0um/SADER

## Resumen

SADER (Structure-Aware Diffusion Framework with Deterministic Resampling) es un modelo de difusión para la eliminación de nubes en imágenes de teledetección multitemporales. Lo desarrolla el autor que publica bajo el identificador `zyfz0um`, con paper asociado en arXiv:2602.00536 y código en github.com/zyfzs0/SADER. El modelo resuelve un problema clásico en teledetección óptica: reconstruir una observación libre de nubes a partir de varias adquisiciones temporalmente alineadas del mismo sensor, en lugar de depender de una única imagen.

Técnicamente combina tres piezas: una red de denoising condicional multitemporal (MTCDN), un objetivo de entrenamiento sensible a las nubes y un esquema de remuestreo determinista que utiliza un MAE preentrenado en EuroSAT como apoyo a la imputación. Se publican dos configuraciones de referencia: una para Sen2_MTC_New (entrada RGB+NIR, salida RGB) y otra para SEN12MS-CR-TS(EA) (13 bandas Sentinel-2 de entrada y salida).

Es relevante porque la cobertura nubosa es el principal cuello de botella de las series Sentinel-2 en muchas regiones, y porque el repositorio incluye checkpoints, configuraciones de PyTorch Lightning y logs de entrenamiento que permiten reproducir los resultados del paper. El autor advierte de que el modelo completo es computacionalmente exigente pese a su recuento de parámetros compacto, y de que los pesos se distribuyen sin una licencia específica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de difusión condicional multitemporal (MTCDN) con remuestreo determinista y MAE auxiliar preentrenado en EuroSAT; detalles de backbone no disponibles |
| Parametros totales | no disponible (el autor lo describe como "compact parameter count", sin cifra) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de T = 3 observaciones temporales alineadas y parches de 256 × 256 píxeles en las configuraciones publicadas |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints en el formato de precisión del entrenamiento) |
| Idiomas soportados | no disponible / no aplica (modelo de imagen, no de texto) |
| Licencia | other (sin licencia específica para los pesos; el autor pide contactar para consultas de licencia) |
| Formato de pesos | `.ckpt` (PyTorch Lightning) para los modelos SADER y `.pth` (PyTorch) para los MAE auxiliares |

## Arquitectura y entrenamiento

SADER se plantea como un marco de difusión para restauración de imagen a imagen. El componente principal es una red de denoising condicional multitemporal: recibe tres observaciones alineadas del mismo lugar y produce una reconstrucción libre de nubes, condicionada por la información temporal disponible en cada momento. A esto se suma un objetivo de entrenamiento "cloud-aware", es decir, diseñado para tener en cuenta la máscara de nubes durante el proceso de aprendizaje, y un módulo de remuestreo determinista que emplea un MAE preentrenado en EuroSAT (dimensión de modelo 192, máscara 0.5, batch 16, learning rate 0.001 en las configuraciones publicadas) para guiar la imputación de las zonas ocluidas.

En cuanto a los datos, el paper reporta dos regímenes de entrenamiento y evaluación: Sen2_MTC_New, con tres observaciones RGB+NIR donde el NIR se usa como canal auxiliar y la salida es RGB, y SEN12MS-CR-TS(EA), con tres observaciones Sentinel-2 y salida de las 13 bandas del sensor. El repositorio incluye cinco checkpoints MAE de EuroSAT, snapshots de configuración de proyecto y de PyTorch Lightning, logs de métricas de entrenamiento y un checkpoint experimental adicional con condicionamiento por máscara (`tsmask/`). La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF/DPO (no aplicables en un modelo de imagen); esa información corresponde al paper.

## Capacidades

- Reconstrucción libre de nubes de imágenes Sentinel-2 a partir de tres observaciones temporales alineadas.
- Salida en RGB con entrada RGB+NIR (configuración Sen2_MTC_New) y salida de las 13 bandas Sentinel-2 (configuración SEN12MS-CR-TS(EA)).
- Restauración de imagen a imagen dentro del pipeline `image-to-image` de HuggingFace.
- Reconstrucción condicionada por máscara en el checkpoint experimental `tsmask/`.
- Evaluación con métricas espectrales y perceptuales: PSNR, SSIM, LPIPS y SAM.
- Reentrenamiento y ajuste reproducibles mediante los YAML de PyTorch Lightning incluidos, con soporte de TF32 (`--enable_tf32`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- No hay capacidades multilingües, de audio ni de vídeo declaradas.

## Casos de uso

- Generación de composites libres de nubes para series temporales de Sentinel-2: el modelo toma tres adquisiciones alineadas y devuelve una escena sin nubes, lo que permite construir series continuas en regiones con nubosidad persistente.
- Preprocesado de pipelines de monitorización agrícola: al eliminar la oclusión nubosa antes del cálculo de índices de vegetación, se reducen los huecos en las series y mejora la comparabilidad entre fechas.
- Preparación de datos de entrada para modelos de segmentación y detección de cambios: las escenas reconstruidas pueden alimentar clasificadores posteriores sin necesidad de descartar fechas completas.
- Reconstrucción de las 13 bandas Sentinel-2 para análisis espectral: la configuración SEN12MS-CR-TS(EA) preserva las bandas del sensor, lo que resulta adecuado para estudios que dependen de información más allá del visible (por ejemplo, NIR y SWIR).
- Reproducción de resultados de investigación: los checkpoints, configuraciones y logs publicados permiten verificar las cifras del paper sobre los dos benchmarks, algo poco habitual en modelos de este tipo.
- Relleno de huecos en archivos históricos de teledetección: aplicar el modelo sobre pares o tríos de fechas ya archivadas para recuperar observaciones perdidas por nubes.
- Evaluación comparativa de métodos de cloud removal: sirve como referencia cuantitativa (PSNR, SSIM, LPIPS, SAM) en experimentos académicos con los mismos protocolos.

## Benchmarks y rendimiento

Resultados reportados por el autor con el protocolo de evaluación del paper:

| Dataset | PSNR ↑ | SSIM ↑ | LPIPS ↓ | SAM (°) ↓ |
|---|---:|---:|---:|---:|
| Sen2_MTC_New | 20,941 | 0,729 | 0,228 | — |
| SEN12MS-CR-TS(EA) | 31,234 | 0,937 | — | 5,885 |

No se han publicado en la información disponible resultados de benchmarks de otros dominios (MMLU, HumanEval, GSM8K, etc.), que no aplican a este modelo, ni tablas comparativas con métodos alternativos de cloud removal.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras de memoria ni de parámetros totales.
- GPU recomendadas: no disponible. Solo se indica que el MTCDN completo es computacionalmente exigente pese al recuento compacto de parámetros.
- Encaje en GPU de consumo: no confirmado. El tamaño total del repositorio es de 2,7 GB, pero incluye varios checkpoints, configuraciones y logs, por lo que no equivale al peso de un único modelo.
- Despliegue: únicamente a través del código oficial (PyTorch 2.3, PyTorch Lightning, `environment.yaml` del repositorio). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Entorno recomendado por el autor: el especificado en `environment.yaml`, con `--enable_tf32` activado para acelerar la inferencia en GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos comparativos en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre SADER ni sobre métodos comparables de cloud removal (los resultados obtenidos fueron páginas sin relación con el tema).

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SADER (Sen2_MTC_New) | no disponible | T = 3 observaciones, 256 × 256, RGB+NIR → RGB | PSNR 20,941 / SSIM 0,729 / LPIPS 0,228 | other | Pesos en HuggingFace + código en GitHub |
| SADER (SEN12MS-CR-TS(EA)) | no disponible | T = 3 observaciones, 256 × 256, 13 bandas → 13 bandas | PSNR 31,234 / SSIM 0,937 / SAM 5,885° | other | Pesos en HuggingFace + código en GitHub |
| Alternativas de cloud removal | no disponible | no disponible | no disponible | no disponible | no disponible |

Para una comparación rigurosa con otros métodos de la categoría (por ejemplo, variantes de SEN12MS-CR) es necesario consultar el paper arXiv:2602.00536, que no se ha podido verificar en esta búsqueda.

## Limitaciones y advertencias

- Licencia `other` sin texto legal asociado: no se especifica licencia para los pesos, por lo que el uso comercial queda sin resolver y requiere contactar con los autores.
- Generalización limitada: el rendimiento puede degradarse con sensores, configuraciones espectrales, regiones geográficas, longitudes temporales o pipelines de preprocesado distintos de los dos benchmarks reportados.
- Configuraciones fijas: las publicadas usan parches de 256 × 256 y exactamente T = 3 observaciones; no se documenta comportamiento con otras ventanas temporales.
- Coste computacional: el autor advierte explícitamente de que el MTCDN completo es exigente en cómputo a pesar de su recuento compacto de parámetros.
- Riesgo de artefactos y alucinación espectral: como modelo generativo de difusión, la reconstrucción puede introducir contenido plausible pero no observado, especialmente en oclusiones extensas; no se documentan análisis de sesgo ni de fidelidad radiométrica más allá de las métricas agregadas.
- Seguridad de carga: los ficheros `.ckpt` y `.pth` usan serialización de PyTorch basada en pickle; deben cargarse solo desde fuentes de confianza.
- Rutas codificadas: los snapshots de configuración conservan las rutas originales del autor; hay que reemplazar rutas de dataset y de checkpoint antes de ejecutar el código.
- Idiomas: no aplica, pero conviene señalar que no hay soporte de texto ni de tareas lingüísticas.
- Sin métricas de benchmarks estándar ni cifras de parámetros: la evaluación de coste/beneficio frente a alternativas requiere consultar el paper y probar el modelo en el dominio concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zyfz0um/SADER
- Paper: https://arxiv.org/abs/2602.00536
- Código e instrucciones de inferencia: https://github.com/zyfzs0/SADER
- Instrucciones de uso, preparación de datos y predicción: https://github.com/zyfzs0/SADER#tadausage
- Issues del repositorio: https://github.com/zyfzs0/SADER/issues
- Imagen de arquitectura: https://huggingface.co/zyfz0um/SADER/resolve/main/assets/architecture.png
