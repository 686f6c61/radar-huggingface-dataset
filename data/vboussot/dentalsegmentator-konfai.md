# VBoussot/DentalSegmentator-KonfAI

## Resumen

DentalSegmentator-KonfAI es un modelo de segmentación de imágenes médicas para tomografías computarizadas (CT) y tomografías computarizadas de haz cónico (CBCT) del complejo dentomaxilofacial. Lo publica el desarrollador VBoussot en Hugging Face y consiste en una adaptación al framework KonfAI de los pesos originales del modelo DentalSegmentator de Dot et al., publicados en Zenodo bajo licencia CC BY 4.0. No es un modelo de lenguaje: es una red convolucional 3D de segmentación semántica, por lo que su "contexto" y sus "parámetros" se refieren al volumen de entrada y a los pesos de la red, no a tokens.

El modelo resuelve un problema clínico concreto: aislar automáticamente cinco estructuras anatómicas (maxilar y cráneo superior, mandíbula, dientes superiores, dientes inferiores y conducto mandibular) en exploraciones volumétricas de cabeza y cuello. La conversión es weight-exact, es decir, no hay reentrenamiento: los pesos son los del nnU-Net v2 original, simplemente reempaquetados para el runtime KonfAI. Es relevante para desarrolladores e investigadores porque demuestra que una arquitectura nnU-Net puede desplegarse con una reducción notable de tiempo y memoria (15,9 s frente a 60,7 s, y 2,3 GB frente a 6,4 GB de RAM pico) manteniendo una concordancia Dice superior a 0,95 con el modelo de referencia.

El repositorio ocupa 0,4 GB y acumula 45 descargas en el momento de la consulta. La librería asociada es `konfai` y el pipeline declarado es `image-segmentation`. Al tratarse de una adaptación de inferencia y no de un modelo generativo, no dispone de capacidades de texto, tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2 `3d_fullres` PlainConvUNet (encoder-decoder convolucional 3D) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; parche de entrada `[160, 128, 112]` vóxeles |
| Tipos de cuantizacion | no disponible (pesos en el formato nativo de KonfAI; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | CC BY 4.0 (pesos); archivos de configuración y `build.py` bajo Apache-2.0 |
| Formato de pesos | formato KonfAI (conversión weight-exact desde nnU-Net v2) |

## Arquitectura y entrenamiento

La arquitectura es un PlainConvUNet 3D de nnU-Net v2 en configuración `3d_fullres`, correspondiente al `Dataset111_453CT`, fold 0. Se trata de una U-Net puramente convolucional, sin mecanismos de atención, con resolución de rejilla fijada por el pipeline de nnU-Net: el volumen se remuestrea a 0,45 × 0,45 × 0,31 mm y se procesa en parches de 160 × 128 × 112 vóxeles. El modelo produce cinco etiquetas: maxilar y cráneo superior (1), mandíbula (2), dientes superiores (3), dientes inferiores (4) y conducto mandibular (5).

No se detalla en la información disponible el número de volúmenes de entrenamiento, la composición exacta del dataset ni si hubo aumento de datos más allá del espejo en los tres ejes (el autor indica que el modelo se entrenó con mirroring en todos los ejes, lo que habilita TTA con hasta siete copias reflejadas). La innovación técnica del repositorio no está en el entrenamiento, sino en la conversión: `build.py` traslada los pesos de nnU-Net a KonfAI sin pérdida numérica, lo que permite ejecutar la misma red con un runtime más ligero y un consumo de memoria sensiblemente menor. El modelo soporta además estimación de incertidumbre por vóxel mediante la varianza de etiquetas entre las copias TTA.

## Capacidades

- Segmentación semántica 3D de cinco estructuras dentomaxilofaciales en CT y CBCT.
- Inferencia sobre volúmenes completos con remuestreo automático a la resolución de entrenamiento.
- Test-time augmentation con hasta siete copias espejadas en los tres ejes (`--tta 7`).
- Estimación de incertidumbre por vóxel mediante la varianza de etiquetas (`-uncertainty`).
- Integración con el runner genérico de KonfAI (`konfai-apps infer`) y con la interfaz interactiva SlicerKonfAI.
- No soporta generación de texto, tool calling, agentes, capacidades multilingües ni procesamiento de audio o vídeo.

## Casos de uso

- Planificación de cirugía oral y maxilofacial: el modelo aísla maxilar, mandíbula, arcadas dentales y conducto mandibular en una CBCT preoperatoria, lo que permite al cirujano visualizar la anatomía de riesgo (conducto mandibular) antes de una osteotomía o una extracción compleja.
- Segmentación previa a la colocación de implantes: la separación de dientes superiores e inferiores y del hueso maxilar facilita la medición de densidad y volumen óseo disponible en la zona edéntula.
- Ortopedia dentofacial y ortodoncia: la extracción automática de las arcadas dentales permite construir modelos 3D de la oclusión para simulación de movimientos dentales o fabricación de férulas.
- Investigación en imagen médica dental: el modelo sirve como referencia reproducible para comparar pipelines de segmentación, gracias a la concordancia Dice documentada frente al nnU-Net original.
- Docencia y atlas anatómicos: la generación de máscaras etiquetadas sobre volúmenes CT permite construir atlas anotados de forma automática para formación de residentes.
- Integración en visores clínicos: mediante SlicerKonfAI, el modelo puede ejecutarse de forma interactiva dentro de 3D Slicer, lo que permite revisar y corregir la segmentación en la propia estación de trabajo.
- Procesamiento por lotes en estudios retrospectivos: el runner de KonfAI permite lanzar la inferencia sobre cohortes de CBCT con un consumo de memoria de 2,3 GB pico, lo que reduce los requisitos de las máquinas de procesamiento.

## Benchmarks y rendimiento

El autor publica una comparación de tiempo y memoria sobre una CBCT `PostDentalSurgery` (360 × 360 × 330 vóxeles, 0,5 mm), con los mismos pesos y la misma build de PyTorch (2.12.1, cu13.0), en una NVIDIA RTX PRO 5000 de 24 GB, sin TTA:

| Herramienta | Tiempo | RAM pico |
|---|---|---|
| KonfAI | 15,9 s | 2,3 GB |
| nnU-Net original | 60,7 s | 6,4 GB |

La concordancia Dice frente a la salida del modelo original es de 0,976 / 0,985 / 0,984 / 0,982 / 0,950 para las etiquetas 1 a 5. El autor señala que este reparto es comparable al que se obtiene con el original con y sin su TTA de espejo (0,988 / 0,985 / 0,988 / 0,982 / 0,934). No se han publicado resultados de benchmarks adicionales (por ejemplo, Dice frente a ground truth anotado por expertos) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; la prueba de referencia usa una GPU de 24 GB (RTX PRO 5000) con un pico de RAM de 2,3 GB, lo que sugiere un consumo de VRAM moderado, aunque el dato exacto no se documenta.
- GPU recomendadas: NVIDIA RTX PRO 5000 (probada); por el tamaño de parche y el consumo reportado, es plausible que funcione en GPUs consumer de gama alta, pero no hay confirmación en la información disponible.
- ¿Cabe en GPU consumer? No confirmado; el tamaño del parche (160 × 128 × 112) y la RAM pico de 2,3 GB apuntan a que podría ejecutarse en GPUs con 8-12 GB de VRAM, pero es una estimación no verificada.
- Opciones de despliegue: runner de KonfAI (`konfai-apps infer`), SlicerKonfAI para uso interactivo dentro de 3D Slicer. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje y no aplican aquí.
- Latencia y throughput: 15,9 s por volumen de 360 × 360 × 330 vóxeles en la configuración de referencia, sin TTA. Con `--tta 7` el coste se multiplica aproximadamente por el número de copias, aunque el autor no publica cifras para ese modo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Modalidad | Etiquetas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DentalSegmentator-KonfAI | nnU-Net v2 3D (KonfAI) | CT / CBCT | 5 | CC BY 4.0 | Hugging Face, SlicerKonfAI |
| DentalSegmentator original | nnU-Net v2 3D | CT / CBCT | 5 | CC BY 4.0 | Zenodo, SlicerDentalSegmentator |
| Otros segmentadores dentales | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el DentalSegmentator original, del que este modelo es una conversión weight-exact: comparten pesos, etiquetas y licencia, y difieren en el runtime (KonfAI frente a nnU-Net) y en el rendimiento medido (15,9 s y 2,3 GB frente a 60,7 s y 6,4 GB). No se dispone de información sobre otros modelos comparables de segmentación dental en la documentación consultada.

## Limitaciones y advertencias

- Modelo de segmentación de imagen, no de lenguaje: no genera texto ni admite instrucciones en lenguaje natural.
- Solo cubre cinco estructuras dentomaxilofaciales; no segmenta otras anatomías de cabeza y cuello.
- Entrenado exclusivamente en CT y CBCT; su uso con otras modalidades (resonancia, radiografía 2D) no está validado.
- La concordancia Dice reportada es frente a la salida del modelo original, no frente a anotaciones manuales de expertos; el rendimiento clínico absoluto no se documenta en la información disponible.
- Riesgo de error en anatomías atípicas, artefactos metálicos de implantes o prótesis, y volúmenes con campos de visión reducidos; no se documentan análisis de sesgo por subpoblación.
- La licencia CC BY 4.0 exige atribución a los autores originales (Dot et al. y el paper de nnU-Net) en cualquier uso, incluido el comercial.
- Los archivos de configuración y `build.py` están bajo Apache-2.0, pero los pesos mantienen CC BY 4.0; conviene revisar ambas licencias antes de redistribuir.
- No es un dispositivo médico certificado: cualquier uso clínico requiere validación local y supervisión profesional.
- El modo TTA multiplica el coste computacional y no se documentan cifras de latencia para ese caso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VBoussot/DentalSegmentator-KonfAI
- DentalSegmentator original (GitHub): https://github.com/gaudot/SlicerDentalSegmentator
- Release v1.0.0-alpha de los pesos originales: https://github.com/gaudot/SlicerDentalSegmentator/releases/tag/v1.0.0-alpha
- Pesos originales en Zenodo: https://doi.org/10.5281/zenodo.10829674
- KonfAI (GitHub): https://github.com/vboussot/KonfAI
- SlicerKonfAI (GitHub): https://github.com/vboussot/SlicerKonfAI
- Paper DentalSegmentator (Journal of Dentistry, 2024): https://doi.org/10.1016/j.jdent.2024.105130
- Paper nnU-Net (Nature Methods, 2021): https://doi.org/10.1038/s41592-020-01008-z
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
