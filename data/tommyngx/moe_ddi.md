# TommyNgx/MoE_DDI

## Resumen

MoE_DDI es un modelo de predicción de interacciones fármaco-fármaco (DDI) desarrollado por TommyNgx (Tommy Nguyen). Utiliza una arquitectura de mezcla de expertos (MoE) con diseño *feature-family-aware* para clasificar 178 tipos de interacción entre medicamentos a partir de 3.780 descriptores moleculares numéricos. A diferencia de los modelos de lenguaje, este sistema procesa vectores de características y no texto, por lo que se centra en farmacovigilancia computacional y cribado de seguridad farmacológica. El repositorio ocupa 3.6 GB, aunque no se especifican los parámetros totales ni el contexto de entrenamiento. Su relevancia radica en abordar un problema sanitario con una arquitectura MoE, comparando su rendimiento con un MLP numérico estilo T-DDI sobre los mismos datos y particiones. El modelo se publica bajo licencia Creative Commons Attribution 2.0 (cc-by-2.0).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (feature-family-aware) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE, sin especificar) |
| Longitud de contexto | no aplica (modelo de clasificación, no generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento
El modelo se basa en una arquitectura de mezcla de expertos (MoE) que incorpora un diseño *feature-family-aware*: agrupa los 3.780 descriptores de entrada en familias y utiliza esa estructura para el enrutamiento de los expertos. Se entrena para clasificar 178 clases de interacción fármaco-fármaco. No se dispone de información sobre el número de expertos, el tamaño de los parámetros, el conjunto de datos de entrenamiento ni el método de optimización (por ejemplo, si se usó RLHF o DPO, aunque al ser un modelo de clasificación numérica es poco probable). El autor menciona en el repositorio que el objetivo es validar el modelo frente a un MLP estilo T-DDI sobre los mismos descriptores y particiones, pero no se ofrecen detalles adicionales sobre el proceso de entrenamiento.

## Capacidades
- Predicción de interacciones fármaco-fármaco: clasifica 178 tipos de interacción entre medicamentos.
- Clasificación multiclase a partir de descriptores moleculares numéricos (3.780 descriptores).
- Diseño MoE *feature-family-aware* que agrupa características para mejorar el enrutamiento de expertos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes, ni visión, ni audio.

## Casos de uso
- Cribado de seguridad farmacológica: evaluar automáticamente pares de fármacos candidatos para detectar interacciones adversas antes de llegar a ensayos clínicos.
- Farmacovigilancia: analizar bases de datos de medicamentos comercializados para identificar interacciones no previstas.
- Descubrimiento de fármacos: priorizar combinaciones de medicamentos que podrían tener efectos sinérgicos o evitar combinaciones peligrosas.
- Investigación bioinformática: servir como baseline para comparar modelos de predicción de DDI en entornos académicos.
- Formación en aprendizaje automático: ejemplo didáctico de aplicación de MoE a clasificación de datos tabulares en ciencias de la salud.
- Integración en pipelines de análisis de datos: combinar con herramientas de análisis de interacciones para generar informes de riesgo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor indica en el repositorio que el objetivo es validar el modelo frente a un MLP estilo T-DDI sobre los mismos descriptores y particiones, pero no se han encontrado métricas numéricas (como exactitud, F1, AUC, etc.) en la documentación pública.

## Requisitos de hardware
- Tamaño del repositorio: 3.6 GB (incluye pesos y posiblemente datos auxiliares).
- No se especifica VRAM requerida para inferencia.
- No se indican GPUs recomendadas ni opciones de despliegue (vLLM, Ollama, etc.).
- Al ser un modelo de clasificación con entrada de 3.780 características, es probable que sea ejecutable en CPUs o GPUs de gama media, pero esta es una estimación razonable, no un dato confirmado.
- Se desconoce la latencia y el throughput.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables de predicción de DDI (por ejemplo, TDDI, tarmac, etc.) en los datos proporcionados. Por tanto, no se puede realizar una comparativa con cifras concretas.

## Limitaciones y advertencias
- No se ha validado el modelo en un entorno de producción ni se han publicado resultados independientes.
- No se especifica el conjunto de datos de entrenamiento ni la metodología, lo que limita la reproducibilidad.
- La licencia cc-by-2.0 permite uso comercial con atribución, pero es necesario revisar los términos legales exactos y citar al autor.
- Al ser un modelo de clasificación, puede presentar errores de predicción, especialmente si el conjunto de entrenamiento no es representativo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o sin uso extendido.
- No se indica el formato de los pesos (safetensors, pickle, etc.), lo que puede afectar a la integración técnica.

## Enlaces
- Hugging Face: https://huggingface.co/TommyNgx/MoE_DDI
- Repositorio GitHub: https://github.com/tommyngx/MoE_DDI
- Instrucciones para agentes (GitHub): https://github.com/tommyngx/MoE_DDI/blob/main/AGENT_INSTRUCTIONS.md
- Página de modelos del autor: https://huggingface.co/TommyNgx/models
