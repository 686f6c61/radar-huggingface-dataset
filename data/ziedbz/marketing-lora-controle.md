# ZiedBz/marketing-lora-controle

## Resumen

El modelo `ZiedBz/marketing-lora-controle` es un adaptador LoRA (Low-Rank Adaptation) entrenado por ZiedBz para la generación de estrategias de marketing. Forma parte de un estudio controlado que compara tres métodos de generación de datos sintéticos (combinatorio, reformulación y self-instruct) frente a un grupo de control entrenado únicamente con datos reales. El objetivo del estudio es determinar qué método produce el mejor modelo a volumen de entrenamiento igual.

El adaptador está pensado para generar respuestas estructuradas de estrategia de marketing: incluye presupuesto cifrado, canales concretos y mecanismos de seguimiento. El repositorio pesa 0,1 GB y contiene pesos en formato safetensors. No se especifica la arquitectura del modelo base sobre el que se aplica el LoRA, ni el número de parámetros, ni la licencia. El modelo se creó en septiembre de 2026 y no cuenta con descargas ni valoraciones en HuggingFace.

La relevancia de este modelo reside en su uso como referencia dentro de un benchmark metodológico: permite aislar el efecto de añadir datos sintéticos frente a entrenar solo con datos reales, y aporta evidencia sobre qué características de los datos sintéticos influyen realmente en el rendimiento final del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base no especificado |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente frances, segun la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, lo que implica que se entrena una matriz de bajo rango que se suma a los pesos congelados de un modelo base. La model card no indica qué modelo base se utilizó, pero menciona que el mismo modelo base se empleó para todos los experimentos del estudio. El entrenamiento se realizó sobre un dataset inicial de 689 ejemplos reales de estrategia de marketing (`RafaM97/marketing_social_media`), con instrucciones, entradas y respuestas.

En el caso concreto de este adaptador (denominado "Contrôle" en el estudio), se entrenó exclusivamente con esos 689 ejemplos reales, sin añadir datos sintéticos. El entrenamiento consistió en 2 épocas sobre un volumen de 512 ejemplos (tras un filtrado de calidad). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación del estudio no está en la arquitectura del modelo, sino en el diseño experimental que compara distintas estrategias de aumento de datos sintéticos manteniendo constante el volumen.

## Capacidades

- Generación de texto estructurado en el dominio de estrategias de marketing: propone presupuestos cifrados, canales de comunicación y mecanismos de seguimiento.
- Capacidad de incorporar restricciones del prompt de entrada (por ejemplo, sector, etapa del workflow, presupuesto o audiencia) en la respuesta generada.
- Generación de respuestas de longitud media (alrededor de 330 caracteres en el grupo de control, aunque el adaptador puede producir respuestas más largas si se entrena con datos reformulados, como se observa en el modelo B).
- No se reportan capacidades de tool calling, razonamiento multi-paso, visión ni otras modalidades. El modelo está especializado en una tarea única de generación de texto.

## Casos de uso

- Generación automática de borradores de estrategias de marketing: el modelo puede producir un esquema inicial con presupuesto, canales y métricas de seguimiento a partir de un brief, reduciendo el tiempo de redacción.
- Asistencia a equipos de marketing para explorar variaciones de una campaña: al introducir diferentes restricciones (sector, presupuesto, audiencia), el modelo genera propuestas alternativas que pueden servir como punto de partida para brainstorming.
- Formación de modelos más complejos: al ser un LoRA ligero, puede usarse como componente de un sistema mayor que combine varios adaptadores especializados en distintas tareas de negocio.
- Evaluación de metodologías de generación de datos sintéticos: este modelo concreto sirve como línea base (control) para comparar el impacto de añadir datos sintéticos en el entrenamiento.
- Generación de contenido para redes sociales: aunque no está explícitamente entrenado para ello, su dominio es el marketing social, por lo que puede producir textos de campaña adaptados a ese contexto.
- Prototipado rápido en entornos de investigación: dado su pequeño tamaño (0,1 GB) y su formato safetensors, es fácil de integrar en pipelines de experimentación sin requerir infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona un benchmark propio con métricas estructurales sobre la calidad de las respuestas generadas. A continuación se presentan los resultados del modelo de control (este adaptador) frente a las variantes entrenadas con datos sintéticos, según la model card:

| Metrica | Controle (este modelo) | A (combinatorio) | B (reformulacion) | C (self-instruct) |
|---|---|---|---|---|
| Score estructural | 0,442 | 0,450 | 0,509 | 0,446 |
| Presupuesto cifrado | 36 % | 35 % | 42 % | 33 % |
| Mecanismo de seguimiento | 10 % | 15 % | 27 % | 15 % |
| Repeticion de restricciones | 72,8 % | 73,1 % | 76,5 % | 73,4 % |
| Longitud media de respuesta | 331 | 341 | 404 | 347 |

El estudio concluye que la variante B (reformulacion) supera al control en +6,7 puntos, mientras que A y C apenas mejoran (+0,8 y +0,4 puntos). El autor advierte que se trata de un único run por variante, por lo que solo el resultado de B es probablemente significativo.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0,1 GB, el peso adicional sobre el modelo base es mínimo. La VRAM necesaria depende del modelo base sobre el que se cargue.
- Si el modelo base es de tamaño pequeño (por ejemplo, 1-3B de parametros), cabe en GPUs consumer como RTX 3060 (12 GB) o superiores.
- No se especifican requisitos de inferencia específicos. Al ser un LoRA, puede integrarse en frameworks como HuggingFace PEFT, vLLM, llama.cpp (si se convierte a GGUF) o cualquier sistema que soporte adaptadores LoRA.
- Para el entrenamiento, el estudio usó un unico run con 2 epocas sobre 512 ejemplos, lo que requiere recursos modestos (una GPU con al menos 8-10 GB de VRAM, dependiendo del modelo base).
- No se dispone de datos de latencia ni throughput, ya que dependen del modelo base y del hardware de despliegue.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (LoRAs especializados en marketing con caracteristicas similares). El propio estudio compara este adaptador con sus variantes A, B y C, que comparten el mismo modelo base y volumen de entrenamiento, pero difieren en el metodo de generacion de datos sinteticos. Esa comparativa se muestra en la seccion de benchmarks. Para una comparativa con otros LoRAs de marketing disponibles en el mercado, no hay datos publicos suficientes.

## Limitaciones y advertencias

- El estudio se basa en un unico run por variante, por lo que los resultados pueden estar afectados por el ruido de entrenamiento. Solo la mejora de la variante B es probablemente significativa.
- Las metricas utilizadas son proxies estructurales (presencia de presupuesto, canales, mecanismos de seguimiento) y no miden la calidad estrategica real de las respuestas.
- El modelo se entrena con un volumen de datos muy reducido (512 ejemplos efectivos) y con solo 2 epocas, lo que limita su capacidad de generalizacion.
- No se especifica la licencia, por lo que su uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en produccion.
- No hay informacion sobre sesgos, alucinaciones o limitaciones de idioma. Al estar entrenado con datos en frances (segun la model card), es probable que funcione mejor en ese idioma, aunque no se confirma.
- El adaptador esta pensado para una tarea muy especifica (estrategia de marketing); no debe esperarse que funcione bien en otras tareas de generacion de texto.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ZiedBz/marketing-lora-controle)
- [Dataset original de partida](https://huggingface.co/datasets/RafaM97/marketing_social_media)
- [Datasets sinteticos generados](https://huggingface.co/datasets/ZiedBz/marketing-synth-data)
- [Juegos de entrenamiento](https://huggingface.co/datasets/ZiedBz/marketing-synth-training)
- [Detalle del benchmark](https://huggingface.co/ZiedBz/marketing-lora-controle/blob/main/eval/benchmark_final.json)
