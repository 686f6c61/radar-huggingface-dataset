# tkhieu/reve-small

## Resumen

REVE-small es un modelo fundacional basado en transformer para el procesamiento de señales EEG (electroencefalografía), desarrollado por el equipo BRAIN de IMT Atlantique y la Université de Montréal (UdeM). Se trata de la versión reducida de REVE-base (69,2M de parámetros), con solo 4 capas de transformer y 12,7M de parámetros, manteniendo el mismo diseño de capa, el mismo esquema de parcheado y la misma codificación posicional 4D que su hermano mayor.

El modelo resuelve el problema de obtener representaciones (embeddings) generalizables a partir de señales EEG con configuraciones de electrodos arbitrarias, gracias a una codificación posicional basada en coordenadas 3D reales de los electrodos (banco de posiciones REVE). Esto lo convierte en una base para tareas downstream de neurociencia: clasificación de estados mentales, detección de anomalías, decodificación de intención, entre otras.

Es relevante ahora porque los modelos fundacionales para señales biomédicas están emergiendo como infraestructura reutilizable, y REVE-small ofrece una variante ligera (12,7M de parámetros, repo de 0,1 GB) apta para experimentación rápida y despliegue en entornos con recursos limitados. Es importante señalar que el checkpoint liberado corresponde a la época 15 de un entrenamiento de 200 épocas, por lo que es un modelo en fase temprana y no plenamente convergido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (4 capas, ancho 512, 8 cabezas, dim. de cabeza 64, feed-forward GEGLU ratio 2.66) |
| Parametros totales | 12.667.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (parcheado de 200 muestras con solapamiento de 20 a 200 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de señales EEG, no de texto) |
| Licencia | REVE Responsible Use License v1.0 (permite uso comercial, educativo, personal e investigación) |
| Formato de pesos | safetensors (con `trust_remote_code=True` y código personalizado) |

## Arquitectura y entrenamiento

REVE-small es un transformer encoder de 4 capas con anchura 512, 8 cabezas de atención de dimensión 64 y feed-forward GEGLU con ratio de expansión 2.66. Procesa señales EEG muestreadas a 200 Hz mediante parcheado de 200 muestras con solapamiento de 20 muestras, y emplea una codificación posicional 4D que incorpora las coordenadas 3D de cada electrodo a través del banco de posiciones REVE (`brain-bzh/reve-positions`). Esta codificación posicional es la clave que permite al modelo adaptarse a configuraciones de electrodos arbitrarias sin reentrenamiento.

El entrenamiento se realizó con el objetivo de masked autoencoding (MAE) propio de REVE. El checkpoint publicado corresponde a la época 15 de un esquema de 200 épocas, por lo que se trata de un checkpoint temprano y no de un modelo totalmente entrenado. Solo se libera el encoder; el decodificador MAE y el estado del optimizador no están incluidos. El desarrollo corrió a cargo del equipo BRAIN (IMT Atlantique) y UdeM, con financiación de la ANR (AI@IMT, ANR-24-CE23-7365), la región de Bretaña, NSERC, Canada Research Chairs, FRQ-NT, GENCI/IDRIS y Digital Alliance Canada.

## Capacidades

- Extracción de embeddings de señales EEG crudas con forma `(batch_size, channels, time_points)` a 200 Hz.
- Adaptación a configuraciones de electrodos arbitrarias mediante codificación posicional 3D basada en nombres de electrodos.
- Generación de representaciones por parche con forma de salida `(batch_size, channels, patches, 512)`.
- Base para tareas downstream de neurociencia: clasificación, detección, decodificación y análisis de estados cerebrales.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multimodales de visión o audio.
- Capacidades multilingües: no aplica.

## Casos de uso

- **Clasificación de estados mentales o cognitivos:** usar los embeddings por parche como entrada a un clasificador ligero (regresión logística o MLP) para tareas como detección de carga cognitiva o estados de sueño, aprovechando que el modelo abstrae patrones temporales y espaciales del EEG.
- **Detección de anomalías epilépticas:** extraer representaciones de ventanas EEG y entrenar un detector de eventos anómalos sobre las características, con la ventaja de que el modelo acepta configuraciones de electrodos variables entre pacientes y montajes.
- **Decodificación de intención motora en BCI:** emplear los embeddings como front-end de un sistema de interfaz cerebro-computadora para clasificar imaginación motora, beneficiándose de la codificación posicional 3D que preserva la topografía del cuero cabelludo.
- **Preentrenamiento y fine-tuning en investigación neurocientífica:** servir como inicialización ligera (12,7M de parámetros) para modelos específicos de laboratorio con datasets pequeños, reduciendo el coste computacional frente a REVE-base.
- **Prototipado rápido en entornos con recursos limitados:** el tamaño del repo (0,1 GB) y los 12,7M de parámetros permiten iterar en una sola GPU de consumo o incluso en CPU para inferencia por lotes pequeños.
- **Evaluación comparativa de modelos fundacionales EEG:** usar REVE-small como baseline ligero frente a REVE-base u otros modelos fundacionales en experimentos de ablation sobre número de capas y calidad de representación.
- **Extracción de características para pipelines de análisis offline:** generar embeddings de grandes volúmenes de registros EEG para clustering, visualización (t-SNE/UMAP) o búsqueda de similitud entre segmentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia:** inferior a 1 GB en fp32 para el modelo (12,7M de parámetros, ~50 MB de pesos), más el banco de posiciones y los tensores de activación; en la práctica, menos de 2 GB para lotes moderados.
- **GPU recomendadas:** cualquier GPU moderna es suficiente; RTX 3060/4060, RTX 4090, A100 o H100 funcionan sin problema. El modelo también puede ejecutarse en CPU para inferencia por lotes pequeños.
- **Cabe en GPU de consumo:** sí, en cualquier GPU de consumo con al menos 2 GB de VRAM; incluso en iGPU o CPU para volúmenes reducidos.
- **Opciones de despliegue:** transformers con `trust_remote_code=True` (requerido por el código personalizado); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (orientados a modelos de lenguaje, no aplicables directamente a este modelo de señales).
- **Latencia y throughput:** no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto/parcheado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| REVE-small | 12,7M | 4 | Parcheado 200 muestras, solapamiento 20, 200 Hz | REVE Responsible Use License v1.0 | HuggingFace (`tkhieu/reve-small`) |
| REVE-base | 69,2M | 22 | Parcheado 200 muestras, solapamiento 20, 200 Hz | REVE Responsible Use License v1.0 | HuggingFace (`brain-bzh/reve-base`) |
| Otros modelos fundacionales EEG | no disponible | no disponible | no disponible | no disponible | no disponible |

REVE-small comparte diseño de capa, parcheado y codificación posicional con REVE-base, diferenciándose únicamente en el número de capas (4 frente a 22) y en el número de parámetros (12,7M frente a 69,2M). No se dispone de información sobre otros modelos fundacionales EEG comparables en la documentación proporcionada.

## Limitaciones y advertencias

- **Checkpoint temprano:** el modelo publicado corresponde a la época 15 de 200, por lo que sus representaciones no están plenamente convergidas y su calidad puede ser notablemente inferior a la de un modelo totalmente entrenado. No debe asumirse un rendimiento de producción.
- **Solo encoder:** no se liberan el decodificador MAE ni el estado del optimizador, lo que limita la reproducción exacta del preentrenamiento y ciertos usos de fine-tuning que requieran la cabeza completa.
- **Dependencia del banco de posiciones:** el modelo requiere el banco de posiciones REVE (`brain-bzh/reve-positions`) y nombres de electrodos válidos; configuraciones no contempladas pueden degradar la calidad de los embeddings.
- **Sesgos:** no se documentan sesgos específicos, pero al entrenarse con datos EEG de poblaciones y montajes concretos (no detallados en la información disponible), puede haber sesgos demográficos y de configuración de electrodos.
- **Riesgo de alucinación:** no aplica en el sentido de generación de texto; sin embargo, los embeddings pueden producir representaciones poco fiables en señales fuera de distribución (ruido, artefactos, patologías no vistas en entrenamiento).
- **Restricciones de licencia:** la REVE Responsible Use License v1.0 permite uso comercial, educativo, personal e investigación, pero impone condiciones de uso responsable que deben revisarse en el archivo `LICENSE` antes de desplegar en producción.
- **Idioma:** no aplica; el modelo no procesa texto.
- **Caveat de producción:** al ser un modelo de investigación en fase temprana, no se recomienda su uso clínico ni en decisiones médicas sin validación adicional y supervisión experta.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/tkhieu/reve-small
- Página del proyecto REVE: https://brain-bzh.github.io/reve/
- Paper: https://arxiv.org/abs/2510.21585
- Modelo base REVE-base: https://huggingface.co/brain-bzh/reve-base
- Banco de posiciones REVE: https://huggingface.co/brain-bzh/reve-positions
- Equipo BRAIN (IMT Atlantique): https://www.imt-atlantique.fr/en/research-innovation/teams/brain
- Université de Montréal: https://www.umontreal.ca/en/
