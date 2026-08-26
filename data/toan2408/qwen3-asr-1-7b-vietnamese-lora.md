# Toan2408/qwen3-asr-1.7b-vietnamese-lora

## Resumen

El modelo `Toan2408/qwen3-asr-1.7b-vietnamese-lora` es un adaptador LoRA (Low-Rank Adaptation) fine-tuneado sobre el modelo de reconocimiento de voz automático (ASR) `Qwen/Qwen3-ASR-1.7B`, desarrollado por el usuario Toan2408. Su objetivo es mejorar la precisión del reconocimiento de voz en vietnamita, reduciendo la tasa de error de palabra (WER) respecto al modelo base. El adaptador se publica con licencia Apache-2.0 y está disponible en formato safetensors.

El modelo base Qwen3-ASR es una familia de modelos de ASR de código abierto que soporta 52 idiomas y dialectos, basada en la arquitectura de audio y lenguaje de Qwen3-Omni. La versión de 1.7B de parámetros ya logra un WER de 8.24% en vietnamita sin fine-tuning específico, y este adaptador LoRA reduce el WER a 6.06%, lo que lo convierte en una opción interesante para aplicaciones de transcripción en vietnamita.

La relevancia actual radica en que el adaptador es ligero y puede cargarse sobre el modelo base sin necesidad de reentrenar todos los parámetros, lo que facilita su integración en pipelines de ASR existentes. No obstante, el repositorio tiene cero descargas y likes, lo que sugiere que es un proyecto reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (speech-language model basado en Qwen3-Omni) |
| Parametros totales | 1.7B (modelo base) + adaptador LoRA (tamano no disponible) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita (adaptador) / 52 idiomas (modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un speech-language model compuesto por un encoder de audio y un modelo de lenguaje que procesa representaciones de audio junto con texto. Está entrenado sobre una gran cantidad de datos de voz de 52 idiomas, aprovechando la capacidad de comprensión de audio de Qwen3-Omni. El adaptador LoRA se ha fine-tuneado con más de 2000 horas de datos vietnamitas, según se indica en el repositorio de referencia, para adaptar el modelo al idioma concreto.

No se dispone de detalles técnicos específicos sobre el entrenamiento del adaptador (método de entrenamiento, hiperparámetros, composición exacta del dataset). El autor solo menciona que se trata de un "Multi-Level LoRA" y proporciona resultados comparativos con el modelo base.

## Capacidades

- Reconocimiento de voz automático (ASR) en vietnamita, mejorando el WER respecto al modelo base.
- El modelo base soporta identificación de idioma y transcripción en 52 idiomas y dialectos.
- Al ser un adaptador LoRA, se puede cargar y descargar fácilmente sobre el modelo base sin modificar sus pesos originales.
- Compatible con el pipeline de Hugging Face `automatic-speech-recognition`.
- No se han documentado capacidades adicionales como tool calling o razonamiento multi-step en la información proporcionada.

## Casos de uso

- **Transcripción de reuniones y conferencias en vietnamita**: el adaptador reduce el WER respecto al modelo base, lo que lo hace adecuado para generar actas o subtítulos en tiempo real con menor tasa de error.
- **Subtitulación automática de vídeos**: puede integrarse en pipelines de postproducción para generar subtítulos en vietnamita con alta precisión, reduciendo la corrección manual.
- **Asistentes de voz en vietnamita**: el modelo puede utilizarse como backend de reconocimiento en asistentes de voz para aplicaciones de domótica o atención al cliente.
- **Archivado de audios judiciales o médicos**: la transcripción precisa de grabaciones con vocabulario específico se beneficia del fine-tuning, aunque se debe evaluar el rendimiento en dominios especializados.
- **Investigación en ASR para idiomas de bajos recursos**: el adaptador sirve como referencia para comparar técnicas de fine-tuning LoRA sobre modelos multilingües en vietnamita.
- **Sistemas de accesibilidad**: puede emplearse para generar subtítulos en tiempo real para personas con discapacidad auditiva, siempre que la latencia sea aceptable.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados experimentales (no se especifica el conjunto de datos de evaluación):

| Configuracion | WER (%) | CER (%) |
| :--- | :---: | :---: |
| Qwen3-ASR base (baseline) | 8.24% | 2.15% |
| Qwen3-ASR + Multi-Level LoRA | 6.06% | 2.34% |

Se observa una mejora significativa en WER (reducción de 2.18 puntos) aunque el CER empeora ligeramente (de 2.15% a 2.34%). No se proporcionan comparaciones con otros modelos ASR vietnamitas.

## Requisitos de hardware

No se han publicado requisitos específicos para este adaptador. Dado que el modelo base tiene 1.7B parámetros, se puede estimar:

- **VRAM estimada**: para inferencia en fp16, el modelo base requiere aproximadamente 3.5 GB de VRAM, más el overhead de la arquitectura. El adaptador LoRA añade un coste adicional mínimo (típicamente menos de 100 MB).
- **GPU recomendadas**: una GPU con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) debería ser suficiente para inferencia en batch pequeño. Para mayor throughput, se recomienda A10, A100 o H100.
- **Despliegue**: se puede usar con la librería `transformers` y el pipeline `automatic-speech-recognition`, o con servidores de inferencia como vLLM o TGI (aunque estos soportan principalmente modelos de texto, para ASR es más común usar el pipeline de Transformers).
- **Latencia**: no hay datos oficiales, pero al ser un modelo de 1.7B y con LoRA, la latencia esperada en GPU moderna es del orden de decenas de milisegundos por audio de pocos segundos.

## Comparativa con modelos similares

No se dispone de datos para comparar directamente este adaptador con otros modelos ASR vietnamés. Se puede comparar con el modelo base sin fine-tuning:

- **Qwen3-ASR-1.7B (sin adaptador)**: 8.24% WER, 2.15% CER, sin fine-tuning específico.
- **Este adaptador**: 6.06% WER, 2.34% CER, con fine-tuning en vietnamita.
- **Otros adaptadores LoRA para vietnamita** (por ejemplo, `actableai/qwen3-asr-1.7B-LORA-vi-podcast-large`): no se tienen métricas públicas.

La principal ventaja es la mejora del WER sin aumentar el tamaño del modelo base, manteniendo la licencia Apache-2.0 y la disponibilidad del adaptador.

## Limitaciones y advertencias

- **Es un adaptador LoRA, no un modelo completo**: requiere descargar el modelo base Qwen/Qwen3-ASR-1.7B para funcionar, lo que implica un espacio de almacenamiento mayor.
- **Sesgos del modelo base**: el modelo puede heredar sesgos de los datos de entrenamiento del modelo base, especialmente en dominios poco representados.
- **Riesgo de alucinación en transcripciones**: como todo sistema ASR, puede generar texto plausible pero incorrecto en entornos ruidosos o con acentos poco comunes.
- **Limitaciones de idioma**: el adaptador está entrenado específicamente para vietnamita; su rendimiento en otros idiomas es el del modelo base sin el fine-tuning.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero el adaptador no incluye el modelo base (que también tiene licencia Apache-2.0).
- **Datos de evaluación no especificados**: los resultados de WER/CER no indican el conjunto de datos de prueba, por lo que pueden no ser representativos en dominios diferentes.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/Toan2408/qwen3-asr-1.7b-vietnamese-lora)
- [Modelo base Qwen3-ASR-1.7B](https://huggingface.co/Qwen/Qwen3-ASR-1.7B)
- [Repositorio oficial de Qwen3-ASR en GitHub](https://github.com/QwenLM/Qwen3-ASR)
- [Repositorio de referencia con información sobre el entrenamiento](https://github.com/splendor1811/Qwen-ASR)
