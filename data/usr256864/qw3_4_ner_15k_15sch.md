# usr256864/qw3_4_ner_15k_15sch

## Resumen

`usr256864/qw3_4_ner_15k_15sch` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario `usr256864`, obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. El identificador del repositorio sugiere un ajuste orientado a reconocimiento de entidades nombradas (NER) con un conjunto de datos de aproximadamente 15 000 ejemplos y 15 esquemas o etiquetas de entidades, aunque la model card no documenta explícitamente ni el dataset ni la taxonomía empleada.

El artefacto no es un modelo completo, sino un conjunto de pesos de adaptador en formato safetensors (0,3 GB) que debe cargarse junto con el modelo base Qwen3-4B-Instruct-2507 mediante la librería PEFT. Por tanto, hereda la arquitectura, la ventana de contexto y las capacidades del modelo base, y su relevancia práctica depende de la calidad del entrenamiento, que no está documentada.

La model card está generada a partir de la plantilla por defecto de Hugging Face y no contiene información sustantiva sobre datos, hiperparámetros, evaluación o licencia. Cualquier evaluación de idoneidad para producción debe hacerse empíricamente sobre el checkpoint, no a partir de la documentación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-4B-Instruct-2507); rango y alpha del adaptador no disponibles |
| Parametros totales | No disponible para el adaptador; el modelo base declara 4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la ficha; heredada del modelo base Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | No disponible; el adaptador se publica en safetensors y puede combinarse con cuantizaciones del modelo base en el momento de la carga |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en su formato original |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente pesos de adaptador LoRA entrenados con TRL y PEFT (framework version declarada: PEFT 0.19.1) sobre el modelo Qwen3-4B-Instruct-2507. No se especifican el rango (`r`), `lora_alpha`, `lora_dropout`, los módulos objetivo ni la precisión de entrenamiento. Tampoco se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF/DPO o si se aplicaron técnicas de enmascaramiento de pérdida específicas para NER.

El nombre del repositorio (`ner_15k_15sch`) apunta a una tarea de extracción de entidades con 15 000 muestras y 15 esquemas o tipos de entidad, pero esta interpretación no está confirmada por el autor. No hay información sobre el formato de anotación (BIO, BIOES, JSON estructurado), el idioma del corpus ni la procedencia de los datos, lo que impide evaluar la cobertura y los posibles sesgos del ajuste.

## Capacidades

- Generación de texto conversacional heredada del modelo base Qwen3-4B-Instruct-2507.
- Extracción de entidades nombradas, presumiblemente según el esquema de 15 etiquetas implícito en el nombre del repositorio; el formato exacto de salida no está documentado.
- Razonamiento y respuesta a instrucciones, en la medida en que el ajuste LoRA no haya degradado las capacidades del modelo base.
- Soporte de tool calling y function calling: no documentado para este adaptador; depende de si el modelo base lo conserva tras el SFT.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no documentados; el modelo base es de texto.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento documental: el adaptador puede aplicarse sobre el modelo base para etiquetar menciones de personas, organizaciones, lugares u otras categorías en textos no estructurados, siempre que se valide empíricamente el esquema de 15 etiquetas.
- Normalización de datos de CRM y bases de contacto: uso del adaptador para identificar y clasificar entidades en descripciones libres antes de la carga en sistemas estructurados.
- Enriquecimiento de corpus para búsqueda y recuperación: extracción de entidades para construir índices facetados o metadatos que mejoren el filtrado en motores de búsqueda internos.
- Preetiquetado en flujos de anotación humana: generación de propuestas de entidades que un anotador revisa, reduciendo el coste por documento en proyectos de etiquetado.
- Análisis de contratos y documentos legales: detección de partes, jurisdicciones y referencias normativas, condicionada a la validación del esquema sobre el dominio jurídico.
- Monitorización de menciones en redes sociales o prensa: extracción de entidades para agregar tendencias y alertas, con la cautela de que el rendimiento fuera del dominio de entrenamiento no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador: 0,3 GB en disco; en memoria, el adaptador añade una fracción pequeña sobre el modelo base, pero este último domina el consumo.
- Modelo base Qwen3-4B-Instruct-2507: en FP16/BF16 requiere del orden de 8 GB de VRAM; en cuantización de 8 bits, alrededor de 4-5 GB; en 4 bits, aproximadamente 2,5-3 GB. Estas cifras son estimaciones por tamaño de parámetros, no datos publicados para este adaptador.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para despliegues concurrentes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en FP16 con holgura; RTX 4070 Ti o superiores para cuantización 4/8 bits.
- Cabe en GPU de consumo: sí, el modelo base en cuantización 4 bits cabe en GPUs con 8 GB o más, y el adaptador LoRA se fusiona o se carga por encima sin coste significativo adicional.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM y TGI (con fusión previa del adaptador en los pesos base), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `usr256864/qw3_4_ner_15k_15sch` | Adaptador sobre 4B | No disponible | LoRA SFT para NER | No disponible | Hugging Face (0 descargas, 0 likes) |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | No disponible en esta ficha | Modelo base instruct | No disponible en esta ficha | Hugging Face |
| Adaptadores NER sobre modelos de 3-7B (p. ej. sobre Llama o Mistral) | Variable | Variable | LoRA SFT | Variable | Hugging Face |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, formato y disponibilidad.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, hiperparámetros, evaluación ni limitaciones declaradas por el autor.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; además, la licencia del modelo base Qwen3-4B-Instruct-2507 debe verificarse por separado y prevalece sobre la del adaptador.
- Sin resultados de evaluación publicados: no hay evidencia de precisión, recall ni F1 en la tarea de NER, ni de que el ajuste no degrade las capacidades generales del modelo base.
- Esquema de entidades no documentado: el número 15 del identificador no está confirmado ni se detalla la taxonomía, el formato de salida ni el idioma del corpus.
- Riesgo de alucinación y de extracción espuria de entidades fuera del dominio de entrenamiento, especialmente en textos con formatos o idiomas distintos a los del dataset original.
- Sesgos desconocidos: al no documentarse la procedencia de los datos, no puede evaluarse el sesgo demográfico, geográfico o lingüístico.
- Cero descargas y cero likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.
- Para producción, se recomienda fusionar el adaptador con el modelo base, evaluar sobre un conjunto de test propio y fijar la versión del checkpoint, dado que el repositorio podría actualizarse sin control de versiones explícito.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/usr256864/qw3_4_ner_15k_15sch
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Referencia citada en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
