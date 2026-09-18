# wanghekai/ReLiSS

## Resumen

ReLiSS es un modelo de segmentación de imágenes médicas por resonancia magnética (MRI) diseñado específicamente para escenarios de modalidad faltante (*missing-modality*). Lo publica el usuario wanghekai, con el código, los scripts de entrenamiento e inferencia y los *splits* fijos alojados en el repositorio GitHub hekaiwang/ReLiSS. El problema que aborda es habitual en la práctica clínica y en estudios retrospectivos: los protocolos de adquisición no siempre incluyen todas las secuencias previstas (T1, T1ce, T2, FLAIR, ADC, DWI), y los modelos de segmentación convencionales degradan su rendimiento cuando falta una o varias de ellas.

El repositorio de HuggingFace contiene once *checkpoints* de entrenamiento originales, junto con los planes de entrenamiento, metadatos de los datasets y los ficheros de particiones. Cubre tres conjuntos de datos: BraTS2021 (1.251 sujetos, validación cruzada de cinco pliegues), ISLES2022 (250 sujetos, cinco pliegues) y WMH2017 (protocolo oficial de 60 sujetos de entrenamiento y 110 de test). El entrenador público se denomina `nnUNetTrainerReLiSSAvailability_300epochs`, lo que vincula el modelo al framework nnU-Net y a una arquitectura de segmentación totalmente convolucional tipo U-Net, aunque la model card no detalla la arquitectura exacta.

La relevancia actual del modelo radica en que ataca un problema real de robustez en producción clínica y de investigación, con *checkpoints* verificables mediante `weights_manifest.json` y `SHA256SUMS`. Se distribuye bajo licencia MIT tanto el código como los pesos, con la salvedad de que los términos de los datasets y de las dependencias son independientes. El repo pesa 12,2 GB e incluye también los estados de entrenamiento originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red convolucional de segmentación tipo U-Net dentro del framework nnU-Net (entrenador `nnUNetTrainerReLiSSAvailability_300epochs`); no se detalla la topología exacta en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (segmentación de volúmenes de imagen; opera sobre parches/crops, no sobre secuencias de texto) |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados; los *checkpoints* son de precisión de entrenamiento) |
| Idiomas soportados | en, zh (metadatos de la model card; el modelo no procesa texto) |
| Licencia | MIT (código y pesos); los términos de los datasets y dependencias son independientes |
| Formato de pesos | PyTorch (formato de *checkpoint* de nnU-Net, con tensores y estado de entrenamiento originales) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura en detalle. La única referencia técnica explícita es el nombre del entrenador, `nnUNetTrainerReLiSSAvailability_300epochs`, que sitúa al modelo dentro de nnU-Net, el framework de segmentación biomédica auto-configurable. Esto implica una red convolucional tipo U-Net con normalización por instancia, activación Leaky ReLU y conexiones residuales, además de un pipeline de preprocesado propio de nnU-Net (resampling a espaciado objetivo, normalización por percentiles y recorte a una región común). El modelo se entrena durante 300 épocas según indica el nombre del entrenador.

El aspecto diferencial es el tratamiento de la modalidad faltante. Según la model card, los canales ausentes se rellenan con ceros después del preprocesado completo de la entrada, y el protocolo liberado emplea un *crop* compartido entre configuraciones. Esto es coherente con un esquema de entrenamiento con disponibilidad variable de modalidades, en el que la red aprende a operar con subconjuntos distintos de canales de entrada sin cambiar la arquitectura. No se especifica en la información disponible el número de tokens o volúmenes de entrenamiento, ni si se aplicaron técnicas de RLHF/DPO (no aplicables a segmentación) u otras innovaciones como atención lineal.

Los datos de entrenamiento son tres cohortes públicas: BraTS2021 (1.251 sujetos, cinco pliegues, orden de canales T1, T1ce, T2, FLAIR), ISLES2022 (250 sujetos, cinco pliegues, orden FLAIR, ADC, DWI) y WMH2017 (protocolo oficial 60/110, orden FLAIR, T1). El script de inferencia incluido construye directamente la red correspondiente y carga su *state dict*, sin depender del registro de entrenadores.

## Capacidades

- Segmentación de imágenes médicas 3D por resonancia magnética en tres dominios clínicos: tumores cerebrales (BraTS2021), lesiones isquémicas (ISLES2022) e hiperintensidades de sustancia blanca (WMH2017).
- Robustez ante modalidad faltante: maneja entradas incompletas rellenando con ceros los canales ausentes tras el preprocesado, en lugar de fallar o requerir un modelo distinto por combinación de secuencias.
- Soporte de validación cruzada: se liberan *checkpoints* por pliegue para BraTS2021 (fold 0–4, mejor) e ISLES2022 (fold 0–4, final), lo que permite reproducir la evaluación *out-of-fold* de cada sujeto.
- Protocolo de test oficial para WMH2017 (un único modelo, fold all, final), con partición de entrenamiento y test fija.
- Inferencia reproducible: los ficheros `weights_manifest.json` y `SHA256SUMS` permiten verificar tamaños y hashes SHA-256 de cada *checkpoint*, y el script de inferencia carga el `state_dict` directamente.
- Capacidades de texto, tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio o *thinking mode*: no aplica; es un modelo de segmentación de imagen, no un modelo de lenguaje.

## Casos de uso

- Segmentación de tumores cerebrales en cohortes con secuencias incompletas: usando los *checkpoints* de BraTS2021, el modelo puede procesar estudios donde falte T1, T1ce, T2 o FLAIR, algo frecuente en datos retrospectivos multicéntricos, rellenando con ceros los canales ausentes.
- Segmentación de lesiones isquémicas en ictus: con el protocolo ISLES2022 (FLAIR, ADC, DWI) y sus cinco pliegues, es adecuado para estudios de cuantificación de volumen de infarto cuando no todas las secuencias de difusión y perfusión están disponibles.
- Cuantificación de hiperintensidades de sustancia blanca en estudios poblacionales: el protocolo WMH2017 (FLAIR, T1) permite obtener máscaras de carga lesional de forma automática sobre la partición oficial de 60/110, útil en cohortes de envejecimiento o enfermedades desmielinizantes.
- Reproducción de resultados de investigación: los *splits* fijos y los hashes SHA-256 permiten replicar exactamente una evaluación *out-of-fold* por sujeto, algo crítico para publicaciones que requieran comparación justa con líneas base.
- Generación de máscaras para pipelines de radiómica: las segmentaciones producidas pueden alimentar extracción de características de textura o forma sin intervención manual, reduciendo el coste de anotación en estudios con cientos de sujetos.
- Análisis de sensibilidad a la disponibilidad de modalidades: al compartir un mismo entrenamiento con disponibilidad variable, se puede estudiar cómo cambia el rendimiento según qué secuencias se omiten, y usar ese análisis para optimizar protocolos de adquisición.
- Preetiquetado para anotación clínica: servir como primer paso en un flujo de etiquetado asistido, donde un radiólogo revisa y corrige las máscaras generadas, acelerando la creación de datasets propios.
- Validación cruzada en estudios multicéntricos: al disponer de un modelo por pliegue en BraTS2021 e ISLES2022, se puede asignar a cada sujeto el modelo que no lo vio durante el entrenamiento, evitando fuga de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda proporcionados no incluyen métricas de Dice, HD95, sensibilidad ni comparaciones cuantitativas con otras líneas base sobre BraTS2021, ISLES2022 o WMH2017.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de un modelo derivado de nnU-Net 3D sobre volúmenes cerebrales, se requiere en la práctica una GPU con memoria suficiente para el parche de entrada y los mapas de características; el consumo concreto depende de la configuración de parche y del *sliding window* empleado, que no se documenta en la model card.
- GPUs recomendadas: no disponible. No se indica en el repositorio ninguna GPU de referencia ni tiempos de entrenamiento o inferencia medidos.
- Viabilidad en GPU de consumo: no confirmada. El repo ocupa 12,2 GB, pero ese tamaño corresponde a once *checkpoints* más estados de entrenamiento, no a un único modelo. No se puede determinar a partir de la información disponible si un solo *checkpoint* cabe en GPUs de consumo tipo RTX 3060, 4080 o 4090.
- Opciones de despliegue: el flujo previsto es mediante el framework nnU-Net y el script de inferencia del repositorio GitHub. El script de descarga (`scripts/download_weights.py`) recupera exactamente once pesos verificando tamaños y hashes. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican tiempos por volumen ni rendimiento en sujetos por minuto.

## Comparativa con modelos similares

| Modelo | Tipo | Datasets | Contexto/modalidad faltante | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReLiSS (wanghekai) | Red de segmentación tipo nnU-Net con disponibilidad variable de canales | BraTS2021, ISLES2022, WMH2017 | Entrenado explícitamente para modalidad faltante; canales ausentes a cero | MIT (código y pesos) | Once *checkpoints* en HuggingFace + código en GitHub |
| nnU-Net estándar | Framework de segmentación auto-configurable | Depende del entrenamiento del usuario | Requiere el mismo conjunto de canales que en entrenamiento | Apache-2.0 (código, a confirmar según versión) | Público |
| Otros modelos de segmentación con modalidad faltante | Arquitecturas específicas (destilación, *feature fusion*, etc.) | Habitualmente BraTS | Depende del método | Variable | Variable |

La comparación cuantitativa con alternativas (Dice, HD95, curvas de degradación al eliminar modalidades) no está disponible: la model card de ReLiSS no publica métricas y los resultados de búsqueda no aportan información técnica relevante sobre modelos competidores.

## Limitaciones y advertencias

- No es un producto sanitario: no se aporta validación regulatoria, marcado CE ni autorización FDA, y no debe usarse para diagnóstico clínico directo sin validación local.
- Sesgo de datos: las tres cohortes (BraTS2021, ISLES2022, WMH2017) tienen protocolos, poblaciones y centros específicos. El rendimiento fuera de esas distribuciones (otras marcas de resonancia, otros protocolos, poblaciones pediátricas o con patologías distintas) no está caracterizado.
- Riesgo de fallo silencioso con modalidad faltante: rellenar canales con ceros es una estrategia simple; no se documenta cómo degrada la precisión al eliminar combinaciones concretas de secuencias ni si existen combinaciones para las que el modelo es poco fiable.
- Ausencia de métricas publicadas: al no haber resultados de Dice, HD95 u otras métricas, no es posible estimar la calidad esperada antes de evaluar el modelo en datos propios.
- Trazabilidad limitada: el repositorio tiene cero descargas y cero *likes*, sin validación independiente de terceros ni publicaciones asociadas citadas en la model card.
- Campo de idiomas engañoso: los metadatos indican en y zh, pero el modelo no procesa lenguaje; son etiquetas heredadas de la plantilla de model card.
- Licencia: el código y los pesos son MIT, pero los datasets (BraTS, ISLES, WMH) y las dependencias mantienen sus propios términos. Es necesario obtener los datos de MRI y las máscaras de referencia de sus fuentes autorizadas, con las aprobaciones éticas y de uso de datos que correspondan.
- Reproducibilidad dependiente del código externo: la descarga requiere un `COMMIT_HASH` que debe consultarse en `docs/WEIGHTS.md` del repositorio GitHub; la model card de HuggingFace no incluye ese hash.
- Uso comercial: la licencia MIT lo permite, pero la procedencia y las condiciones de los datos de entrenamiento pueden imponer restricciones adicionales que el usuario debe verificar por su cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wanghekai/ReLiSS
- Código, instalación, preparación de datos, *splits*, entrenamiento e inferencia: https://github.com/hekaiwang/ReLiSS
- Búsqueda web: no se han encontrado enlaces técnicos relevantes. Los resultados devueltos por el buscador corresponden a dominios sin relación con el modelo y se han descartado por no ser material utilizable.
