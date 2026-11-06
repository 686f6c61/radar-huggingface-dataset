# TamAko783/anomalies-diffusion-qmr

## Resumen

QMR (quantile-margin restoration) es un objetivo de entrenamiento experimental para deteccion de anomalias en resonancia magnetica cerebral, desarrollado por Experimental Machines (entidad sin animo de lucro) y publicado como resultado negativo en el repositorio `TamAko783/anomalies-diffusion-qmr`. El modelo parte de una red de restauracion con arquitectura U-Net (herencia del baseline DAE) a la que se anade una cabeza convolucional de tres capas que produce un mapa de puntuacion por voxel. La idea central es alinear el objetivo de entrenamiento con el umbral operativo que luego fija un procedimiento de prediccion conformal calibrado solo con sujetos sanos.

El problema que aborda es el de la deteccion no supervisada de lesiones: entrenar unicamente con cerebros sanos y detectar desviaciones en pacientes con esclerosis multiple (MSLUB) sin haber visto etiquetas de lesion reales. El modelo se entreno sobre 319 escaneos T2 sanos del dataset IXI, en cortes de 128x128, y se evaluo sobre 20 escaneos con lesion del dataset MSLUB, procedente de otro fabricante de escaner.

La relevancia del artefacto no reside en su rendimiento, que es nulo en la metrica principal, sino en su valor metodologico: el autor publica explicitamente un fallo reproducible, con intervalos de confianza, analisis de sensibilidad y registro de costes de computo, para que otros grupos no repitan el mismo camino a ciegas. El checkpoint publicado (`best_model.safetensors`, 7,8 MB) corresponde al brazo QMR preespecificado, no al mejor resultado en test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net de restauracion (herencia del baseline DAE) con cabeza convolucional de 3 capas para el mapa de puntuacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D por cortes, no lenguaje) |
| Tipos de cuantizacion | no disponible; mapas cacheados en float16 |
| Idiomas soportados | no aplica; etiqueta de idioma `en` en la model card |
| Licencia | CC BY-SA 3.0 |
| Formato de pesos | safetensors (`best_model.safetensors`, 7,8 MB) |

## Arquitectura y entrenamiento

La arquitectura es una U-Net de restauracion que reconstruye la imagen de entrada; el mapa de anomalia se deriva del residual de restauracion. Sobre ese backbone, los tres brazos experimentales (SR, SR+BCE y QMR) comparten una cabeza convolucional de tres capas que produce una puntuacion por voxel. El brazo QMR entrena esa cabeza para que los voxeles sanos caigan por debajo de un cuantil aprendido tau (0,995) y las lesiones sinteticas superen tau mas un margen, de modo que el umbral coincida con el que usara despues la calibracion conformal sobre sujetos sanos.

El entrenamiento se realizo exclusivamente con 319 escaneos T2 sanos de IXI (cortes de 128x128) y lesiones sinteticas insertadas mediante un generador que codifica supuestos especificos de esclerosis multiple. El umbral se fijo con control de riesgo conformal a alpha 0,05 sobre 100 escaneos de calibracion sanos. Cada brazo requirio entre 13 y 15 minutos de entrenamiento en una GPU L4 de Runpod. El ajuste de registro fue unicamente afin, lo que limita la calidad de las estadisticas por voxel.

## Capacidades

- Generacion de mapas de anomalia por voxel sobre cortes de resonancia magnetica cerebral T2.
- Deteccion no supervisada de lesiones: no requiere etiquetas de lesion durante el entrenamiento.
- Calibracion conformal sobre datos sanos para fijar umbrales operativos con garantia de tasa de falsos positivos.
- Estandarizacion normativa por voxel (CSS) frente a una cohorte sana de referencia.
- Seleccion de checkpoint y umbral mediante lesiones sinteticas tipo esclerosis multiple.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Reproduccion de resultados negativos en investigacion metodologica: el checkpoint y el informe permiten replicar el fallo del objetivo QMR y verificar la saturacion de tau en entrenamiento.
- Estudio de calibracion conformal en imagen medica: sirve como caso de referencia para analizar por que una garantia de falsos positivos sobre sanos no se traduce en deteccion de lesiones bajo cambio de fabricante de escaner.
- Comparacion de objetivos de entrenamiento: el brazo QMR puede contrastarse con SR, SR+BCE, DAE y ANDi 60k usando el mismo backbone y generador de lesiones sinteticas.
- Analisis de estandarizacion normativa: permite reproducir la mejora de +0,029 Dice observada en el DAE con CSS y comprobar la ausencia de efecto en ANDi.
- Evaluacion de generadores de lesiones sinteticas: util para medir si la seleccion de checkpoint con lesiones sinteticas sustituye a las etiquetas reales (los resultados indican que no).
- Docencia y formacion en evaluacion rigurosa: ejemplo de pre-registro interno, intervalos de confianza y correccion de Benjamini-Hochberg aplicados a un experimento pequeno.

## Benchmarks y rendimiento

Resultados sobre 20 escaneos de test con lesion (MSLUB), Dice medio en el umbral calibrado con datos sanos:

| Detector | Dice bruto | Dice con CSS |
|---|---|---|
| DAE | 0,023 | 0,052 |
| ANDi 60k | 0,021 | 0,023 |
| SR | 0,0004 | 0,0006 |
| SR+BCE | 0,0007 | 0,0017 |
| QMR (propuesto) | 0,000 | 0,000 |

Otros datos reportados:

| Metrica | Valor |
|---|---|
| QMR menos BCE (Dice) | -0,0007 (IC 95 %: -0,0021 a -0,000005) |
| Voxel AP de QMR | 0,063 (DAE: 0,057; descriptivo, sin IC) |
| Efecto de CSS en DAE | +0,029 Dice (IC 95 %: 0,013 a 0,048; p ajustada BH = 0,001) |
| Seleccion con lesiones sinteticas frente a etiquetas reales | -0,031 (DAE), -0,028 (ANDi), -0,053 (SR+BCE); todos los IC excluyen cero; margen preespecificado -0,03 |
| Chequeo de falsos positivos en sanos (G0) | superado en las 15 variantes a alpha 0,05 y 0,10 sobre 86 escaneos sanos de test |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB para el checkpoint publicado (7,8 MB de pesos en safetensors, entrada 128x128 por corte); no se han publicado mediciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB; el entrenamiento se ejecuto en una NVIDIA L4 en Runpod Secure Cloud (region EU-RO-1).
- Cabe en GPU de consumo: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: PyTorch nativo; no hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles. El coste total del experimento fue de aproximadamente 5,6 horas de Pod y unos 3,3 USD a precio de lista de L4 (estimacion, no factura; excluye almacenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Dice (bruto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QMR (este) | no disponible (7,8 MB de pesos) | Restauracion U-Net + cabeza de puntuacion con margen de cuantil | 0,000 | CC BY-SA 3.0 | Hugging Face |
| DAE baseline | no disponible | Autoencoder desruidor, residual de restauracion | 0,023 | no disponible en la informacion | Hugging Face (`anomalies-diffusion-dae-baseline`) |
| ANDi 60k | no disponible | Difusion con 60k pasos de entrenamiento | 0,021 | no disponible en la informacion | Hugging Face (`anomalies-diffusion-andi-60k`) |
| SR / SR+BCE | no disponible | Mismo backbone que QMR, sin y con BCE balanceada | 0,0004 / 0,0007 | no disponible en la informacion | no disponible como checkpoint independiente |

## Limitaciones y advertencias

- El modelo no funciona: el Dice es exactamente 0 en los 20 escaneos de test. No debe usarse para ninguna tarea clinica ni de produccion.
- No es un dispositivo medico; el autor lo declara explicitamente como material de investigacion.
- tau subio a 1,0 durante el entrenamiento y se mantuvo, lo que indica saturacion de las puntuaciones en tejido sano. No se descarta una contribucion numerica por el cacheo en float16; no se recalculo en float32.
- Tamano de muestra muy reducido (n = 20 escaneos de test) y un unico tipo de lesion (esclerosis multiple).
- Cambio de fabricante de escaner entre IXI (entrenamiento) y MSLUB (test): confunde todas las cifras de lesion.
- El plan de analisis es interno, no un pre-registro independiente, y la cohorte de test ya se habia examinado antes; todas las comparaciones son exploratorias.
- El generador de lesiones sinteticas incorpora supuestos especificos de esclerosis multiple, lo que limita su generalizacion a otras patologias.
- El registro unicamente afin limita la calidad de las estadisticas por voxel.
- El chequeo de falsos positivos en sanos (G0) solo valida el comportamiento sobre datos sanos; no dice nada sobre la validez en otros escaneres o en escaneos con lesion.
- El codigo no esta publicado todavia, lo que dificulta la reproduccion independiente.
- Licencia CC BY-SA 3.0: permite uso comercial con atribucion y compartir bajo la misma licencia, pero no se ha validado ningun uso comercial ni clinico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TamAko783/anomalies-diffusion-qmr
- Repositorio companion ANDi 60k: https://huggingface.co/TamAko783/anomalies-diffusion-andi-60k
- Repositorio companion DAE baseline: https://huggingface.co/TamAko783/anomalies-diffusion-dae-baseline
- Repositorio companion de calibracion: https://huggingface.co/TamAko783/anomalies-diffusion-calibration
- Dataset IXI: no disponible como enlace en la informacion proporcionada
- Dataset MSLUB: no disponible como enlace en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
