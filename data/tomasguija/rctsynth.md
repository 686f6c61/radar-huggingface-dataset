# TomasGuija/RCTSynth

## Resumen

RCTSynth (también denominado SynthRCT) es un modelo de síntesis condicional de deformaciones para la generación de tomografías computarizadas (TC) repetidas sintéticas. Desarrollado por Tomás Guija Valiente, se basa en una arquitectura de registro variacional condicional que aprende una distribución de deformaciones anatómicas plausibles específicas del paciente a partir de imágenes TC torácicas longitudinales. Dado un volumen TC de entrada, el modelo muestrea un código latente condicionado por la anatomía, lo decodifica en un campo de velocidad estacionario, lo integra en un campo de desplazamiento denso y deforma la entrada para producir una TC repetida sintética.

El modelo está entrenado sobre el conjunto de datos DIR-Lab 4DCT, que contiene pares de imágenes TC respiratorias de pacientes oncológicos, y está diseñado para aplicaciones de investigación en imagen médica, especialmente en radioterapia adaptativa y análisis longitudinal. Su relevancia reside en que permite generar variaciones anatómicas realistas sin necesidad de adquirir nuevas exploraciones, lo que reduce costes y riesgos en entornos clínicos y de investigación. Los pesos oficiales se distribuyen bajo licencia MIT y el código completo está disponible en GitHub.

El checkpoint `rctsynth.ckpt` tiene un tamaño de aproximadamente 0,1 GB y está publicado en Hugging Face con licencia MIT. La arquitectura incluye un prior anatómico de volumen completo y un decodificador de slab consciente de memoria, lo que permite manejar volúmenes TC completos de forma eficiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Registro variacional condicional con prior anatómico de volumen completo y decodificador de slab consciente de memoria |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada es un volumen TC 3D) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (imágenes médicas) |
| Licencia | MIT |
| Formato de pesos | checkpoint PyTorch (.ckpt) |

## Arquitectura y entrenamiento

La arquitectura es un modelo de registro variacional condicional que combina un codificador que mapea el volumen TC de entrada a un código latente condicionado por la anatomía, un decodificador que produce un campo de velocidad estacionario, y una capa de integración que convierte el campo de velocidad en un campo de desplazamiento denso. El diseño incluye un prior anatómico de volumen completo que condiciona el espacio latente y un decodador de slab que procesa el volumen por secciones para reducir la demanda de memoria, lo que permite manejar volúmenes completos de TC sin fragmentación.

El entrenamiento se realizó sobre los pares de imágenes 4DCT del dataset DIR-Lab, que incluye imágenes respiratorias torácicas de pacientes oncológicos. El caso ID 0 se reservó para validación. No se proporcionan detalles sobre el número de tokens de entrenamiento ni sobre técnicas de optimización como RLHF o DPO, ya que el modelo se enfoca en registro de imágenes, no en generación de texto. Los datos de entrenamiento no se redistribuyen y quedan sujetos a los términos del proveedor del dataset.

## Capacidades

- Generación de TC repetidas sintéticas: dado un volumen TC de entrada, produce una variante deformada anatómicamente plausible.
- Muestreo de deformaciones específicas del paciente: permite generar múltiples muestras de deformación condicionadas a la anatomía individual.
- Exploración del espacio latente: soporta interpolación y recorrido en el espacio latente para analizar variaciones anatómicas continuas.
- Exportación de campos de desplazamiento y velocidad: genera campos de deformación densos (SVF y DVF) listos para su uso en otros pipelines de registro o análisis.
- Integración con MONAI y PyTorch: implementado en PyTorch y compatible con el ecosistema MONAI, facilitando su integración en flujos de trabajo de imagen médica.
- Capacidad de procesamiento de volúmenes 3D completos: gracias al decodador de slab, maneja volúmenes de TC sin fragmentar, a diferencia de métodos basados en parches.

## Casos de uso

- Planificación radioterápica adaptativa: el modelo puede generar TC repetidas sintéticas para simular variaciones anatómicas del paciente entre sesiones de tratamiento, ayudando a evaluar la robustez de los planes de radioterapia frente a cambios respiratorios o de peso.
- Evaluación de algoritmos de registro deformable: los campos de desplazamiento generados permiten crear datos de referencia (ground truth) sintéticos para validar y comparar métodos de registro deformable sin necesidad de anotaciones manuales.
- Aumento de datos para aprendizaje profundo: las TC repetidas sintéticas pueden ampliar conjuntos de datos de imagen médica para entrenar otros modelos de segmentación, detección de lesiones o clasificación, mejorando su generalización.
- Análisis longitudinal de enfermedad: permite simular variantes de la anatomía de un paciente en diferentes momentos, facilitando estudios de progresión tumoral o respuesta a tratamiento sin nuevas adquisiciones.
- Investigación en incertidumbre de deformación: al muestrear múltiples deformaciones plausibles, el modelo puede cuantificar la incertidumbre en el registro de imagen, útil para aplicaciones de radioterapia guiada por imagen.
- Generación de simulaciones para planificación quirúrgica: las deformaciones sintéticas pueden utilizarse en simulaciones de procedimientos quirúrgicos o intervenciones percutáneas, mejorando la planificación preoperatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas como Dice, TRE (Target Registration Error) ni comparaciones con otros métodos de registro. La ausencia de benchmarks públicos limita la evaluación objetiva del rendimiento frente a alternativas establecidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación. Dado que el checkpoint pesa 0,1 GB y procesa volúmenes TC completos, se estima que requiere entre 16 y 24 GB de VRAM para volúmenes de tamaño estándar (p. ej., 512×512×300), dependiendo del tamaño del lote y la resolución.
- GPU recomendadas: tarjetas de gama alta como NVIDIA RTX 4090 (24 GB), A100 (40-80 GB) o H100 (80 GB) son adecuadas. GPUs de 12 GB podrían manejar volúmenes más pequeños o con submuestreo.
- Capacidad en GPUs de consumo: es factible en RTX 3090/4090 (24 GB) con volúmenes reducidos o usando el decodador de slab que minimiza memoria.
- Opciones de despliegue: al ser un modelo PyTorch, puede ejecutarse con scripts propios, Jupyter notebooks, o integrarse en pipelines con MONAI. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La inferencia depende de la resolución del volumen y del número de muestras generadas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (síntesis de deformaciones condicionales para TC). La comparativa con métodos de registro deformable clásicos (p. ej., Demons, ANTs, NiftyReg) no es directa porque RCTSynth genera deformaciones sintéticas, no solo registra dos imágenes. No se han identificado modelos con la misma función en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente para investigación: el modelo no ha sido validado para diagnóstico clínico, planificación de tratamiento ni cálculo de dosis.
- Dependencia de un dataset específico: entrenado solo con datos del DIR-Lab 4DCT, lo que limita la generalización a otras anatomías (p. ej., abdomen, cabeza) o protocolos de adquisición diferentes.
- No se redistribuyen los datos de entrenamiento: los datos de DIR-Lab no se incluyen en el repositorio y están sujetos a los términos del proveedor.
- Riesgo de deformaciones no plausibles: el modelo podría generar deformaciones anatómicas fuera de lo realista si se aplica a pacientes o regiones no representadas en el entrenamiento.
- Sin validación clínica: la documentación indica explícitamente que no es apto para decisiones médicas.
- Formato de pesos propietario: aunque la licencia es MIT, el checkpoint está en formato `.ckpt` de PyTorch Lightning, lo que puede requerir ajustes para su integración en otros frameworks.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/TomasGuija/RCTSynth)
- [Repositorio GitHub oficial](https://github.com/TomasGuija/RCTSynth)
- [Dataset DIR-Lab 4DCT](https://med.emory.edu/departments/radiation-oncology/research-laboratories/deformable-image-registration/index.html)
- [Perfil del autor en GitHub](https://github.com/TomasGuija/)
- [Perfil del autor en Hugging Face](https://huggingface.co/TomasGuija)
