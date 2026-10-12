# wq2012/ribline-3d-unet

## Resumen

ribline-3d-unet es un modelo de segmentación médica 3D publicado por el usuario wq2012 en Hugging Face. Se trata del detector de probabilidad de línea central de costillas basado en una U-Net 3D ligera (`rib_unet_3d.pth`) que forma parte del proyecto ribline v0.3.0, junto con un atlas estadístico de 24 costillas (`rib_atlas.joblib`). El modelo opera sobre volúmenes de tomografía computarizada (TC) torácica con resolución isotrópica de 2 mm y produce un mapa de probabilidad de las líneas centrales del esqueleto costal, que después se refina con la etapa 3 del pipeline (programación dinámica polar bilateral y refinamiento RibSnake).

La arquitectura es una U-Net 3D de tres niveles con anchos de canal (16, 32, 64), 339.889 parámetros entrenables y solo 1,4 MB de pesos, lo que la convierte en un componente muy ligero que puede ejecutarse en CPU. El modelo se entrenó durante 20 épocas sobre los 47 volúmenes del conjunto de referencia SCR con parches de 64x64x64 y una pérdida combinada de SoftDice y entropía cruzada binaria.

Su relevancia actual reside en que sirve como bloque de detección dentro de un sistema híbrido de etiquetado costal: por sí sola alcanza una distancia Chamfer etiquetada (LCD) de 3,40 ± 1,99 mm y un 92,0 % de precisión de etiquetado en el conjunto de 12 escaneos, y al fusionarse con el detector SCF (0,55 x P_UNet + 0,45 x P_SCF) mejora hasta 2,05 ± 0,48 mm y un 97,2 %. Es, por tanto, un modelo especializado de nicho, no un modelo de lenguaje ni un modelo multimodal de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net 3D de 3 niveles (encoder-decoder), `RibUNet3D`; por etapa, dos bloques `Conv3d(3x3x3) -> GroupNorm(4) -> ReLU`, `MaxPool3d(2)` en el descenso, upsampling trilineal con concatenación de skip connections y cabeza de salida sigmoide `1x1x1` |
| Parametros totales | 339.889 parámetros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión 3D); ventana de inferencia deslizante de 96x96x96 vóxeles con stride 48, y parches de entrenamiento de 64x64x64 |
| Tipos de cuantizacion | No disponible; solo se publica el state dict de PyTorch en la precisión de entrenamiento (float32) |
| Idiomas soportados | No disponible / no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`.pth`, 1,4 MB, md5 `9e456ba9ff81c402a58436c666f152ef`) y atlas estadístico en joblib (`.joblib`) |
| Canales de entrada/salida | 1 canal de entrada (TC), 1 canal de salida (probabilidad de línea central) |
| Anchos de canal | (16, 32, 64) con `base_filters=16` |
| Libreria | ribline (v0.3.0) |
| Tamano del repositorio | 0,0 GB según Hugging Face |

## Arquitectura y entrenamiento

La red es una U-Net 3D estándar de tres niveles, sin mecanismos de atención ni componentes recurrentes. Cada etapa del encoder aplica dos convoluciones 3D de kernel 3x3x3 seguidas de GroupNorm con 4 grupos y ReLU; el descenso se realiza con MaxPool3d de tamaño 2. El decoder emplea upsampling trilineal y concatena las características del encoder mediante skip connections, cerrando con una convolución 1x1x1 y activación sigmoide que genera el mapa de probabilidad de línea central.

El entrenamiento está documentado en `train_config_unet.json`: 20 épocas sobre los 47 volúmenes de entrenamiento del conjunto de referencia SCR (TC torácico isotrópico de 2 mm), con parches de 64x64x64 muestreados de forma mixta (70 % centrados en primer plano, 30 % aleatorios uniformes), normalización z-score por volumen de las intensidades crudas almacenadas, pérdida `0,5 x SoftDice + 0,5 x BCE` frente a una máscara de línea central tubular de 1,5 vóxeles (3,0 mm) y optimizador Adam con `lr = 1e-3` y tamaño de lote 2. No se documenta ningún proceso de RLHF ni DPO, algo esperable en un modelo de segmentación.

La inferencia se realiza mediante ventana deslizante solapada de 96x96x96 con stride 48 y mezcla con ventana 3D de Hann (`ribline.scripts.infer_unet`). Para obtener la salida final etiquetada es necesario ejecutar la etapa 3 (`ribline.scripts.run_stage3`) en modo `unet_only`, que aplica programación dinámica polar bilateral y refinamiento RibSnake guiados por el atlas estadístico de 24 costillas.

## Capacidades

- Detección de líneas centrales de costillas en TC torácico: genera un mapa de probabilidad volumétrico de estructuras tubulares correspondientes al esqueleto costal.
- Etiquetado anatómico de 24 costillas (12 pares, izquierda y derecha): con la etapa 3 y el atlas estadístico, asigna una identidad concreta a cada curva de costilla.
- Modelado estadístico de la caja torácica: el archivo `rib_atlas.joblib` incluye curvas canónicas medias, priors de descriptores 5-D y priors de espaciado intercostal.
- Inferencia sobre volúmenes completos mediante ventana deslizante con mezcla Hann, sin necesidad de remuestrear a un tamaño fijo de entrada.
- Ejecución en CPU: por tamaño (1,4 MB de pesos) no requiere GPU, lo que facilita procesar cohortes grandes en hardware modesto.
- Control de falsos positivos: en el conjunto de evaluación de 12 escaneos reporta 100,0 % de precisión (0 curvas falsas).
- No dispone de tool calling, function calling, soporte de agentes, modo thinking, visión natural, audio ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- Etiquetado automático de costillas en informes radiológicos: el modelo numera las 24 costillas sobre el TC, de modo que un radiólogo puede referirse a "costilla 7 derecha" de forma inequívoca en lugar de describir posiciones relativas.
- Localización anatómica de fracturas costales: una vez obtenidas las líneas centrales etiquetadas, una lesión detectada por otro sistema puede mapearse a la costilla concreta y a una posición a lo largo de su curva, lo que simplifica el seguimiento y la codificación diagnóstica.
- Planificación quirúrgica torácica: las curvas etiquetadas sirven como referencia espacial para abordajes de resección, colocación de placas o acceso a la cavidad pleural, al proporcionar un sistema de coordenadas anatómico estable entre estudios.
- Preprocesado a gran escala de cohortes de investigación: al requerir solo 1,4 MB de pesos y poder ejecutarse en CPU, permite procesar cientos o miles de TC en un clúster sin GPU antes de análisis estadísticos posteriores.
- Morfometría y análisis de forma de la caja torácica: los priors del atlas (descriptores 5-D, espaciado intercostal) permiten estudiar variabilidad poblacional, asimetrías o deformidades como el pectus excavatum de forma cuantitativa.
- Componente de un ensemble híbrido: el repositorio `wq2012/ribline-3d-ct-centerline` fusiona esta U-Net con el detector SCF (0,55 x P_UNet + 0,45 x P_SCF) para bajar la LCD de 3,40 mm a 2,05 mm, por lo que este checkpoint es útil como miembro del conjunto aunque no se use en solitario.
- Generación de pseudo-etiquetas para entrenamiento: sus mapas de probabilidad, refinados por la etapa 3, pueden emplearse como supervisión aproximada en conjuntos sin anotación manual.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (LCD = Labeled Chamfer Distance, en milímetros; precisión = porcentaje de costillas correctamente etiquetadas sobre 286 curvas):

| Repositorio | Variante | LCD 12 escaneos (mm) | Precision 12 escaneos (%) | LCD CV 5 pliegues (mm) | Precision CV 5 pliegues (%) |
|---|---|---|---|---|---|
| wq2012/ribline-3d-ct-centerline | SCF híbrido + 3D U-Net + etapa 3 | 2,05 ± 0,48 | 97,2 | 3,64 ± 3,90 | 91,8 |
| wq2012/ribline-anatomical-scf | SCF anclado anatómicamente + etapa 3 (solo CPU) | 2,88 ± 1,32 | 95,1 | 5,28 ± 4,62 | 86,9 |
| wq2012/ribline-3d-unet (este modelo) | 3D U-Net ligera + etapa 3 | 3,40 ± 1,99 | 92,0 | 7,44 ± 8,93 | 78,2 |
| wq2012/ribline-scf-pass2-autocontext | SCF con auto-contexto de 2 pasadas + etapa 3 | 9,36 ± 10,57 | 71,0 | No disponible | No disponible |

Detalle adicional del conjunto de 12 escaneos para este checkpoint: 263 de 286 costillas correctamente etiquetadas (92,0 %) y 0 curvas falsas positivas (100,0 % de precisión). En el repositorio se incluyen informes por sujeto (`benchmark_val12_fixed_gt.json`, `benchmark_val12_original_gt.json`, `benchmark_train47.json`, `benchmark_cv5.json`), estadísticas de verificación del marco canónico (`polar_stats_all59.json`) y un registro de auditoría del ground truth (`gt_fix_log.json`).

La métrica `cldice` aparece declarada en los metadatos del repositorio, pero no se publica ningún valor numérico para ella en la información disponible. No hay resultados de benchmarks genéricos tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB. Los pesos en float32 ocupan aproximadamente 1,4 MB (339.889 parámetros) y el resto del consumo corresponde a las activaciones de la ventana deslizante de 96x96x96; el autor no publica cifras oficiales de memoria.
- GPU recomendadas: no se especifica ninguna. Al ser un modelo de 0,34 M de parámetros, cualquier GPU con soporte CUDA (incluidas GTX 1050 Ti o superiores) es más que suficiente.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo e incluso en iGPU; no hay requisito de VRAM relevante.
- CPU: la inferencia es viable en CPU, y de hecho la variante `wq2012/ribline-anatomical-scf` se etiqueta explícitamente como CPU-only.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El despliegue se realiza con PyTorch y el paquete `ribline` v0.3.0, mediante `ribline.scripts.infer_unet` para la ventana deslizante y `ribline.scripts.run_stage3` para la reconstrucción anatómica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los únicos modelos comparables publicados en el mismo ecosistema son las otras variantes de la colección ribline. No se dispone de información sobre alternativas externas de etiquetado costal en la documentación proporcionada.

| Modelo | Parametros / enfoque | Contexto de entrada | LCD 12 escaneos | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wq2012/ribline-3d-unet | 339.889 parámetros, U-Net 3D pura | Ventana 96x96x96, parches 64x64x64 | 3,40 ± 1,99 mm | 92,0 % | MIT | Hugging Face |
| wq2012/ribline-3d-ct-centerline | Híbrido SCF + U-Net 3D fusionados + etapa 3 | No disponible | 2,05 ± 0,48 mm | 97,2 % | MIT | Hugging Face |
| wq2012/ribline-anatomical-scf | SCF anclado anatómicamente, enfoque no neuronal, CPU-only | No disponible | 2,88 ± 1,32 mm | 95,1 % | MIT | Hugging Face |
| wq2012/ribline-scf-pass2-autocontext | SCF con auto-contexto de 2 pasadas (línea base) | No disponible | 9,36 ± 10,57 mm | 71,0 % | MIT | Hugging Face |

## Limitaciones y advertencias

- Dominio de entrenamiento muy restringido: 47 volúmenes del conjunto de referencia SCR, TC torácico isotrópico de 2 mm. El rendimiento puede degradarse con otros grosores de corte, protocolos de adquisición, niveles de ruido o poblaciones distintas (domain shift).
- El ground truth no es una anotación manual: la máscara de línea central de 1,5 vóxeles es de naturaleza algorítmica, por lo que la red aprende esa heurística concreta. La presencia de `gt_fix_log.json` indica que el propio autor auditaron y corrigieron parte del ground truth.
- Varianza elevada en validación cruzada: la LCD de 7,44 ± 8,93 mm en los 5 pliegues frente a 3,40 ± 1,99 mm en los 12 escaneos sugiere sensibilidad al sujeto y posibles fallos en casos atípicos, con una precisión de etiquetado que cae del 92,0 % al 78,2 %.
- El conjunto de evaluación es pequeño (12 escaneos, 286 costillas), por lo que las cifras publicadas tienen un intervalo de confianza amplio.
- El modelo no produce directamente costillas etiquetadas: entrega un mapa de probabilidad de línea central. El etiquetado final requiere la etapa 3 del pipeline ribline (programación dinámica polar bilateral, RibSnake y el atlas estadístico), lo que añade dependencias y complejidad de despliegue.
- Sin validación externa ni de la comunidad: 0 descargas y 0 "likes" en el momento de redactar la ficha, y un tamaño de repositorio reportado de 0,0 GB, lo que limita la reproducibilidad independiente.
- No es un modelo de lenguaje: no soporta idiomas, tool calling, agentes, razonamiento multi-paso ni generación de texto. Las etiquetas `chamfer_distance`, `cldice` y `accuracy` de los metadatos no van acompañadas de valores para `cldice`.
- Licencia MIT, que permite uso comercial y modificación, pero el modelo no está certificado como producto sanitario (ni CE ni FDA). Su uso en diagnóstico o decisión clínica exige validación regulatoria y clínica adicional por parte del implementador.
- Riesgo de alucinación en el sentido de curvas espurias: aunque en el conjunto de evaluación la precisión es del 100 % (0 falsos positivos), este dato no garantiza el mismo comportamiento en datos fuera de distribución.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/wq2012/ribline-3d-unet
- Colección ribline en Hugging Face: https://huggingface.co/collections/wq2012/ribline
- Repositorio de código ribline (v0.3.0): https://github.com/wq2012/ribline
- Variante híbrida completa: https://huggingface.co/wq2012/ribline-3d-ct-centerline
- Variante SCF anclada anatómicamente (CPU-only): https://huggingface.co/wq2012/ribline-anatomical-scf
- Variante de línea base SCF con auto-contexto de 2 pasadas: https://huggingface.co/wq2012/ribline-scf-pass2-autocontext

La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo: los resultados obtenidos correspondían a dominios sin relación con el ámbito técnico solicitado y se han descartado.
