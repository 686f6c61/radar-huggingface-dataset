# talhasial/urdu-gemma-270m-lemma-base

## Resumen

`urdu-gemma-270m-lemma-base` es un adaptador LoRA para lematización en urdu, desarrollado por Muhammad Talha Sial (Universidad Masaryk) como parte de su tesis de máster *Exploiting large language models for improvements in Urdu NLP* (2026). El adaptador se entrena sobre el modelo base `google/gemma-3-270m` sin modificaciones previas (brazo "base" del experimento 3) y su única tarea es convertir una frase en urdu en una secuencia de pares palabra/lema.

Se trata de un artefacto de investigación muy específico: no es un modelo de propósito general, sino un adaptador PEFT de rango 16 entrenado durante 5 épocas sobre las 4.043 frases de entrenamiento del treebank UD_Urdu-UDTB (UD v2.14). Su relevancia es acotada pero clara: demuestra que un modelo de 270 millones de parámetros puede adaptarse mediante LoRA a una tarea morfológica de bajo nivel en un idioma de bajos recursos como el urdu, con un coste de entrenamiento mínimo.

El repositorio tiene un tamaño de 0,0 GB y cero descargas en el momento de redactar esta ficha, lo que refleja su carácter experimental y su publicación reciente. La licencia es "other": hereda los Términos de Uso de Gemma y queda restringido a uso no comercial por la licencia CC BY-NC-SA 4.0 del corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA (PEFT) |
| Parametros totales | 270 M en el modelo base; el adaptador LoRA añade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens configurados en el ejemplo de uso (`max_seq_length=512`) |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea `load_in_4bit=False`, es decir, sin cuantización) |
| Idiomas soportados | urdu (`ur`) |
| Licencia | other (Términos de Uso de Gemma + CC BY-NC-SA 4.0 del corpus; solo uso no comercial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-270m`, un transformer decoder-only de la familia Gemma 3. La adaptación se realiza con LoRA de rango r=16 sobre el modelo base sin adaptar, con una tasa de aprendizaje de 2e-4 y 5 épocas de entrenamiento. Se conserva el checkpoint con la menor pérdida de validación. El entrenamiento se ejecutó con la librería Unsloth, según el fragmento de uso incluido en la model card.

Los datos de entrenamiento proceden del treebank UD_Urdu-UDTB (Universal Dependencies v2.14), con 4.043 frases de entrenamiento. La tarea se formula como generación condicionada: se proporciona un prompt con el prefijo `Lemmatize: <sentence>` y el modelo debe producir una secuencia de pares `palabra/lema` separados por espacios, con decodificación greedy. No se documentan fases de RLHF, DPO ni ajuste por preferencias; es un ajuste supervisado directo sobre la tarea.

## Capacidades

- Lematización de texto en urdu: dada una frase, devuelve la secuencia de pares palabra/lema en el formato `palabra/lema palabra/lema ...`.
- Procesamiento morfológico de nivel superficial sobre unidades léxicas del treebank UD_Urdu-UDTB.
- Generación condicionada por prompt con decodificación greedy, orientada a una única tarea.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible; el adaptador está entrenado y etiquetado únicamente para urdu.
- No se documentan modos especiales (thinking, visión, audio) más allá de las capacidades inherentes del modelo base Gemma 3 de 270 M, que no se detallan en la model card.

## Casos de uso

- Preprocesamiento lingüístico para pipelines de PLN en urdu: el adaptador normaliza formas flexionadas a su lema antes de tareas posteriores (búsqueda, indexación, análisis de frecuencia), reduciendo la dispersión léxica.
- Anotación asistida de corpus: dado que el modelo se entrenó sobre UD_Urdu-UDTB, puede emplearse para pre-anotar lemas en nuevos textos y acelerar la revisión manual por anotadores.
- Enriquecimiento de motores de búsqueda en urdu: la lematización permite que una consulta coincida con documentos que contienen variantes morfológicas de la misma palabra.
- Análisis de sentimiento y clasificación de texto en urdu: la reducción a lemas disminuye el vocabulario efectivo y puede mejorar la generalización de clasificadores entrenados con pocos datos.
- Experimentación académica reproducible: sirve como línea base ("base arm") para comparar estrategias de adaptación (por ejemplo, adaptadores entrenados sobre modelos ya adaptados) en la tesis de origen.
- Extracción de terminología y análisis de corpus: la salida palabra/lema facilita la construcción de listas de lemas y el estudio de patrones morfológicos en textos en urdu.
- Despliegue ligero en entornos con recursos limitados: al tratarse de un adaptador sobre un modelo de 270 M, puede ejecutarse en CPU o en GPU de gama baja para tareas por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 270 M en precisión completa, la huella es reducida (del orden de 1 GB de pesos más el adaptador), aunque el dato exacto no se documenta.
- GPU recomendadas: no disponible; cualquier GPU con suficiente memoria para un modelo de 270 M es en principio suficiente, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del modelo base, aunque no se documenta una lista de tarjetas verificadas.
- Opciones de despliegue: el ejemplo de la model card usa Unsloth (`FastLanguageModel`) junto con PEFT; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia estructural, el adaptador se apoya en `google/gemma-3-270m`, pero no se han publicado métricas que permitan compararlo con otros adaptadores de lematización en urdu.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| urdu-gemma-270m-lemma-base | 270 M (base) + LoRA | 512 tokens (configurado) | Lematización en urdu | other (no comercial) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Especialización extrema: el adaptador solo realiza lematización en urdu; no debe esperarse calidad en otras tareas ni en otros idiomas.
- Dominio restringido: el entrenamiento se limita a 4.043 frases del treebank UD_Urdu-UDTB (UD v2.14), por lo que la generalización a registros, dominios o variantes ortográficas no representados en ese corpus es incierta.
- Riesgo de alucinación: al ser un modelo generativo, puede producir lemas inexistentes o mal formados fuera de la distribución de entrenamiento; el formato de salida `palabra/lema` no está garantizado.
- Licencia restrictiva: los Términos de Uso de Gemma y la licencia CC BY-NC-SA 4.0 del corpus impiden el uso comercial del adaptador.
- Longitud de contexto limitada en la configuración de ejemplo (512 tokens), lo que restringe el procesamiento a frases o fragmentos cortos.
- Sin métricas publicadas: no hay resultados de evaluación (precisión de lematización, F1, etc.) en la información disponible, lo que impide validar su rendimiento antes de usarlo en producción.
- Advertencia de producción: al ser un artefacto de tesis con cero descargas y sin pipeline declarado, no hay evidencia de uso en entornos reales ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/talhasial/urdu-gemma-270m-lemma-base
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Código y evaluación de la tesis: https://github.com/543516-collab/urdu-gemma-270m
- Términos de Uso de Gemma: https://ai.google.dev/gemma/terms
- Treebank UD_Urdu-UDTB (Universal Dependencies): no disponible como enlace directo en la información proporcionada
