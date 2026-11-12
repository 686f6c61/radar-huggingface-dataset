# Syninlab/PROMETHEUS

## Resumen

PROMETHEUS es un modelo multimodal de tipo image-text-to-text desarrollado por Syninlab, construido como un ajuste fino (fine-tuning) del modelo base zai-org/GLM-5.3-Flash. Se distribuye bajo licencia MIT y está orientado a tareas conversacionales con soporte de imágenes, empleando una arquitectura de mezcla de expertos (MoE) con 321.323.031.390 parámetros totales según los pesos en safetensors. El repositorio ocupa 328,4 GB y se distribuye en formato fp8.

El modelo declara soporte para inglés, igbo, yoruba y hausa, lo que lo posiciona como una propuesta con cobertura de lenguas africanas poco representadas en los grandes modelos multimodales. Al derivar de GLM-5.3-Flash, hereda presumiblemente las capacidades del modelo base, aunque la información pública disponible sobre este ajuste es muy limitada: cero descargas y cero likes en el momento de la consulta, y acceso restringido que requiere aceptar condiciones en Hugging Face.

Su relevancia actual radica en la combinación de tres factores poco habituales: un tamaño MoE de escala muy grande, licencia permisiva MIT y cobertura multilingüe de lenguas africanas. No obstante, la ausencia de documentación técnica detallada, benchmarks publicados y comunidad activa obliga a tratar cualquier evaluación de rendimiento con cautela hasta disponer de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), basada en GLM-5.3-Flash; pipeline image-text-to-text |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (formato de publicación); otras cuantizaciones no disponibles |
| Idiomas soportados | en, ig, yo, ha |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que PROMETHEUS emplea una arquitectura de mezcla de expertos (MoE) derivada de zai-org/GLM-5.3-Flash, con un total de 321.323.031.390 parámetros. El pipeline declarado es image-text-to-text, lo que implica la presencia de un codificador visual acoplado a un decodificador de lenguaje, aunque no se detalla la configuración concreta de dichos componentes ni el número de parámetros activos por token, dato esencial para estimar costes de inferencia en arquitecturas MoE.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas específicas introducidas por Syninlab respecto al modelo base. El tag `base_model:quantized:zai-org/GLM-5.3-Flash` sugiere que el ajuste se realizó sobre una versión cuantizada del modelo base, y el tag `glm5_next` apunta a la familia arquitectónica de destino, pero no hay documentación que confirme detalles del proceso de entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Procesamiento conjunto de imagen y texto (image-text-to-text), con capacidad de responder a consultas que incluyen imágenes.
- Razonamiento y generación de lenguaje heredados del modelo base GLM-5.3-Flash, si bien no se documentan capacidades específicas de código, matemáticas o agentes para este ajuste.
- Soporte multilingüe declarado para inglés, igbo, yoruba y hausa.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita el despliegue mediante infraestructura de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional multimodal en inglés: el modelo puede gestionar diálogos multi-turno en los que el usuario adjunta imágenes, aprovechando el pipeline image-text-to-text para responder con contexto visual.
- Atención al cliente en mercados de África Occidental: con soporte declarado de igbo, yoruba y hausa, puede emplearse para interacciones automatizadas con usuarios de Nigeria y regiones vecinas, aunque la calidad real en dichos idiomas requiere validación empírica.
- Descripción y análisis de imágenes en entornos educativos: utilizable para generar explicaciones de material visual en inglés y lenguas locales, como apoyo a plataformas de aprendizaje.
- Moderación de contenido multimodal: el modelo puede clasificar y describir imágenes acompañadas de texto para detectar contenido inapropiado en plataformas comunitarias.
- Investigación en multilingüismo de bajos recursos: sirve como base para estudiar el rendimiento de modelos MoE de gran escala en igbo, yoruba y hausa, lenguas con escasa representación en modelos abiertos.
- Prototipado de asistentes con acceso visual: dado que se distribuye en fp8 y con licencia MIT, permite experimentar en entornos de investigación con requisitos de licencia permisivos, siempre que se disponga del hardware adecuado.
- Generación de descripciones accesibles: producción de texto alternativo para imágenes en aplicaciones de accesibilidad, en los idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 321.323.031.390 parámetros en fp8, los pesos requieren aproximadamente 321 GB de memoria, a los que hay que sumar la caché KV y las activaciones; el despliegue requiere por tanto múltiples GPU.
- GPU recomendadas: para servir el modelo en fp8 se necesitan nodos con varias GPU de memoria alta, como H100 80 GB (mínimo cuatro unidades solo para pesos) o A100 80 GB; no se dispone de estimaciones oficiales de Syninlab.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090, 3090, etc.) en su formato publicado; requeriría cuantizaciones agresivas no disponibles en el repositorio.
- Opciones de despliegue: la librería declarada es transformers; el tag `endpoints_compatible` sugiere compatibilidad con infraestructura de endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de PROMETHEUS que permitan una comparación cuantitativa fiable. A continuación se ofrece una comparación estructural con el modelo base y con alternativas de referencia, indicando los campos no disponibles.

| Modelo | Parametros totales | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| PROMETHEUS (Syninlab) | 321,3 B (MoE) | no disponible | MIT | en, ig, yo, ha | Gated en Hugging Face |
| GLM-5.3-Flash (zai-org) | no disponible | no disponible | no disponible | no disponible | Modelo base del ajuste |
| Alternativas MoE de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables con datos verificables de parámetros, contexto y rendimiento; por tanto, la comparativa cuantitativa se declara no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base entrenado predominantemente en inglés, es esperable un sesgo hacia dicha lengua, pero no hay evidencia publicada para este ajuste.
- Riesgo de alucinación: no cuantificado; como modelo generativo multimodal, es susceptible de producir descripciones inexactas de imágenes y afirmaciones no fundamentadas.
- Limitaciones de contexto e idioma: la longitud de contexto no está documentada; el soporte de igbo, yoruba y hausa se declara en los tags, pero no se aportan métricas de calidad en dichos idiomas.
- Restricciones de licencia: la licencia es MIT, permisiva para uso comercial, aunque el acceso al repositorio está restringido (gated) y requiere aceptar condiciones en Hugging Face; conviene verificar los términos del modelo base GLM-5.3-Flash, cuyas condiciones no se detallan.
- Caveats para producción: con 321,3 B de parámetros y 328,4 GB de pesos, el coste de hardware es elevado; la ausencia de benchmarks, de documentación de entrenamiento y de comunidad activa (0 descargas, 0 likes) desaconseja su adopción en producción sin una evaluación interna exhaustiva.
- El ajuste se realizó sobre una versión cuantizada del modelo base, lo que puede introducir degradaciones respecto al original que no están documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/Syninlab/PROMETHEUS
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
