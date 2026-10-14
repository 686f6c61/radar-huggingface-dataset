# Yuqicheng/KGCP-KGE-Checkpoints

## Resumen

KGCP-KGE-Checkpoints es un repositorio de Hugging Face publicado por el usuario Yuqicheng que contiene 45 modelos de embedding de grafos de conocimiento (KGE) ya entrenados. En concreto, incluye tres arquitecturas con función de puntuación bilineal —DistMult, ComplEx y RESCAL— evaluadas sobre tres grafos de referencia: Nations, UMLS y Kinship, con cinco semillas aleatorias por cada combinación (3 × 3 × 5 = 45 checkpoints). No se trata de un modelo de lenguaje, sino de un conjunto de matrices de embedding de entidades y relaciones destinadas a la tarea de predicción de enlaces.

El propósito declarado de estos checkpoints es servir de base a los experimentos de predicción conformal de la librería KGCP, que transforma las puntuaciones de un modelo KGE en conjuntos de respuestas que contienen la respuesta correcta con una probabilidad elegida de antemano (por ejemplo, el 90 %). Esto sitúa al repositorio en el ámbito de la cuantificación de incertidumbre aplicada a graph machine learning, más que en el de la generación de texto.

Su relevancia actual es acotada y muy específica: ofrece material reproducible para investigar calibración y cobertura estadística en predicción de enlaces, con modelos ajustados mediante el protocolo de los autores de LibKGE (Ruffinelli et al., ICLR 2020) adaptado a grafos pequeños. El repositorio no registra descargas ni interacciones en el momento de la consulta, y no publica cifras de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos de embedding de grafos de conocimiento con función de puntuación bilineal: DistMult, ComplEx y RESCAL (no es un transformer ni un modelo de lenguaje) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (opera sobre tripletas entidad-relación-entidad, no sobre secuencias de texto) |
| Tipos de cuantización | no disponible (los checkpoints se distribuyen en el formato de entrenamiento de LibKGE) |
| Idiomas soportados | no disponible (los grafos contienen identificadores de entidades y relaciones; no se declara idioma) |
| Licencia | MIT |
| Formato de pesos | Checkpoints empaquetados de LibKGE en formato `.pt` de PyTorch (pesos, configuración e identificadores de entidades y relaciones) y un `config.yaml` por configuración |
| Tarea (pipeline) | graph-ml (predicción de enlaces) |
| Número de checkpoints | 45 (3 arquitecturas × 3 datasets × 5 semillas) |
| Datasets | Nations, UMLS y Kinship |
| Herramienta de entrenamiento | LibKGE, parcheada para versiones recientes de PyTorch y para Apple Silicon |
| Tamaño del repositorio | 0,0 GB según los metadatos de Hugging Face |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Los 45 modelos cubren tres funciones de puntuación bilineales clásicas sobre tripletas. DistMult emplea una matriz diagonal por relación y, por tanto, solo puede representar relaciones simétricas. ComplEx extiende DistMult al plano complejo, lo que le permite modelar relaciones antisimétricas. RESCAL utiliza una matriz completa por relación, con mayor capacidad expresiva y también mayor número de parámetros. En los tres casos, el producto escalar entre los embeddings de entidad y relación produce la puntuación de la tripleta, y el entrenamiento se realiza con un objetivo de clasificación binaria o de ranking con muestreo de negativos, propio de este tipo de modelos. No hay RLHF, DPO ni ajuste por preferencias: el aprendizaje es puramente supervisado sobre los triples observados del grafo.

Según la model card, cada configuración se ajustó por dataset siguiendo el protocolo de hiperparámetros de los autores de LibKGE (Ruffinelli et al., ICLR 2020), adaptado a grafos de pequeño tamaño, y se entrenó con LibKGE parcheado para funcionar con PyTorch reciente y Apple Silicon. Los checkpoints se nombran `seed1.pt` a `seed5.pt` y se generaron con la invocación `kge start config.yaml --random_seed.default <N>`, lo que hace que el conjunto sea directamente reproducible. No se detalla en la información disponible el número de épocas, la dimensión de embedding, los hiperparámetros finales por dataset ni el esquema de muestreo de negativos.

## Capacidades

- Puntuación de tripletas: calcula una puntuación de plausibilidad para cada par (entidad, relación, entidad) del grafo.
- Predicción de enlaces: ordena entidades candidatas para completar un hecho incompleto, la tarea central de los benchmarks Nations, UMLS y Kinship.
- Cuantificación de incertidumbre: los checkpoints alimentan la librería KGCP, que convierte las puntuaciones en conjuntos de respuestas con cobertura garantizada a un nivel elegido (por ejemplo, 90 %).
- Comparación de arquitecturas: al incluir DistMult, ComplEx y RESCAL sobre los mismos grafos y semillas, permite aislar el efecto de la función de puntuación frente a la variabilidad de inicialización.
- Reproducibilidad multi-semilla: las cinco semillas por configuración permiten estimar la varianza de las métricas sin reentrenar.
- No dispone de generación de texto, razonamiento en lenguaje natural, código, matemáticas, visión ni audio.
- No soporta tool calling, function calling ni flujos de agentes.
- No se declara capacidad multilingüe ni procesamiento de lenguaje: los identificadores del grafo no tienen idioma asociado en la información disponible.

## Casos de uso

- Investigación en predicción conformal sobre grafos: usar los 45 checkpoints como bancada de pruebas para medir la cobertura empírica de KGCP y compararla con la cobertura nominal, aprovechando que existen cinco semillas por configuración.
- Predicción de enlaces en grafos biomédicos: el modelo entrenado sobre UMLS puede emplearse para proponer relaciones plausibles entre conceptos médicos y priorizar candidatos antes de una revisión manual.
- Análisis de redes de parentesco: el modelo sobre Kinship sirve para completar relaciones familiares faltantes en un grafo de demostración y para estudiar cómo se comporta la incertidumbre en grafos muy pequeños.
- Modelado de relaciones internacionales: el modelo sobre Nations permite experimentar con predicción de vínculos entre países y con la sensibilidad de las puntuaciones a la densidad del grafo.
- Selección de arquitectura KGE en un proyecto real: entrenar o comparar DistMult, ComplEx y RESCAL sobre los grafos de referencia para decidir qué función de puntuación conviene antes de invertir en un grafo propio de mayor tamaño.
- Validación de triples extraídas automáticamente: integrar las puntuaciones del modelo como filtro de confianza en un pipeline de construcción de grafos de conocimiento, descartando tripletas con puntuación baja.
- Docencia y divulgación: el repositorio ofrece modelos ya entrenados y configuración de LibKGE lista para inspeccionar, lo que simplifica explicar en clase cómo se entrena y evalúa un modelo KGE sin montar la infraestructura desde cero.
- Reproducción de experimentos publicados: al fijar semillas y compartir el fichero `config.yaml`, permite replicar resultados de forma exacta en otro entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye valores de MRR, Hits@1, Hits@3, Hits@10, MR ni AUC para ninguno de los 45 checkpoints, ni métricas de cobertura de los conjuntos conformales. Tampoco se documentan las dimensiones de embedding ni el número de parámetros por configuración, por lo que no es posible derivar comparaciones cuantitativas entre DistMult, ComplEx y RESCAL dentro de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende de la dimensión de embedding y del número de entidades y relaciones de cada grafo, y esos datos no se publican en la información proporcionada.
- GPU recomendadas: no se especifica ninguna. Al tratarse de modelos de embedding sobre grafos descritos como pequeños, la inferencia no requiere GPU de centro de datos (A100, H100); cualquier GPU compatible con la versión de PyTorch utilizada es suficiente y previsiblemente también lo es la CPU.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado que los grafos se describen como pequeños en la model card; no se confirma con cifras de memoria.
- Opciones de despliegue: LibKGE (comando `kge`), con los checkpoints cargables directamente, y PyTorch para integrar los embeddings en código propio. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.
- Nota sobre el repositorio: los metadatos indican un tamaño de 0,0 GB pese a contener 45 checkpoints, un valor que probablemente refleja un redondeo o una incidencia de medición; conviene verificar el tamaño real antes de planificar el almacenamiento.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan comparar estos checkpoints con alternativas externas. La comparación que sí puede hacerse es interna, entre las tres funciones de puntuación incluidas, en términos de propiedades arquitectónicas:

| Aspecto | DistMult | ComplEx | RESCAL |
|---|---|---|---|
| Tipo de embedding | Real | Complejo | Real |
| Matriz por relación | Diagonal | Diagonal en el plano complejo | Completa |
| Relaciones simétricas | Sí | Sí | Sí |
| Relaciones antisimétricas | No | Sí | Sí |
| Coste de parámetros | Bajo | Medio | Alto |
| Número de parámetros en este repositorio | no disponible | no disponible | no disponible |
| Datasets cubiertos | Nations, UMLS, Kinship | Nations, UMLS, Kinship | Nations, UMLS, Kinship |
| Semillas por configuración | 5 | 5 | 5 |
| Licencia | MIT | MIT | MIT |

Como referencia de categoría, la alternativa más directa sería cualquier otro conjunto de checkpoints KGE entrenados con LibKGE sobre los mismos grafos, pero no se han identificado ni comparado en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas en lenguaje natural; cualquier uso conversacional requiere un modelo adicional.
- Ausencia total de métricas publicadas: no hay MRR, Hits@k ni ninguna otra medida que permita juzgar la calidad de los 45 checkpoints antes de evaluarlos uno mismo.
- Grafos de tamaño pequeño: la propia model card indica que el ajuste de hiperparámetros se adaptó a grafos pequeños, por lo que el comportamiento puede no trasladarse a grafos de producción con millones de entidades.
- Riesgo de sobreajuste: en grafos con pocas entidades y relaciones, los modelos KGE tienden a memorizar tripletas; la varianza entre las cinco semillas es un indicador que conviene revisar.
- Validez de la predicción conformal: la garantía de cobertura de KGCP depende del supuesto de intercambiabilidad entre calibración y test; si la distribución de tripletas cambia, la cobertura nominal no se mantiene.
- Idiomas: no se declara ningún idioma soportado, ya que el modelo opera sobre identificadores de entidades y relaciones, no sobre texto.
- Licencia: MIT, que permite uso comercial y modificación, siempre que se conserve el aviso de copyright y la licencia. Hay que comprobar por separado las condiciones de los datasets originales (Nations, UMLS y Kinship) si se redistribuyen derivados.
- Dependencia de la versión de LibKGE: los checkpoints se generaron con una versión parcheada para PyTorch reciente y Apple Silicon; cargarlos con otra versión puede requerir ajustes.
- Adopción nula: cero descargas y cero interacciones en el momento de la consulta, de modo que no existe validación por parte de la comunidad.
- Riesgo de alucinación: no aplica en el sentido habitual, pero sí existe riesgo de predicciones falsas con puntuación alta, especialmente en relaciones poco representadas en el grafo de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Yuqicheng/KGCP-KGE-Checkpoints
- Perfil del autor en Hugging Face: https://huggingface.co/Yuqicheng
- Repositorio de KGCP (CP4KGE) en GitHub: https://github.com/ZhuYuqicheng/CP4KGE
- LibKGE, librería de entrenamiento utilizada: https://github.com/uma-pi1/kge
- Referencia del protocolo de ajuste de hiperparámetros citada en la model card: Ruffinelli et al., ICLR 2020 (no se dispone de URL verificada en la información proporcionada)
