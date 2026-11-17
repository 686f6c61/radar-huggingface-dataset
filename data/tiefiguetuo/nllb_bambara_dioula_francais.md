# tiefiguetuo/NLLB_Bambara_Dioula_Francais

## Resumen

NLLB_Bambara_Dioula_Francais es un modelo de traducción automática publicado en Hugging Face por el usuario tiefiguetuo. Por su identificador y la etiqueta `m2m_100` de la librería transformers, se trata de un ajuste fino de la familia NLLB-200 (No Language Left Behind) de Meta AI, orientado a la traducción entre bambara, dioula (jula) y francés. El modelo cuenta con 615.073.792 parámetros según los pesos en safetensors, lo que corresponde a la variante distilled de 600M de NLLB-200.

La relevancia de este modelo radica en su enfoque hacia lenguas de bajos recursos de África Occidental, un ámbito donde los modelos multilingües generalistas rinden de forma desigual. Bambara y dioula son lenguas mandé con millones de hablantes y escasa representación en corpus paralelos de alta calidad, por lo que cualquier ajuste específico resulta de interés para investigación en PLN de bajos recursos y para aplicaciones de traducción en contextos locales.

La model card del autor está generada automáticamente y no aporta información sobre datos de entrenamiento, licencia, evaluación ni uso previsto. Toda la información técnica disponible proviene de los metadatos del repositorio y de las etiquetas de la librería, no de documentación del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia M2M-100 / NLLB-200, etiqueta `m2m_100`) |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (NLLB-200 distilled 600M usa 512 tokens de entrada, dato no confirmado por el autor) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantización estándar vía transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | bambara, dioula y francés (inferido del nombre del modelo; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `m2m_100`, es decir, un transformer encoder-decoder con atención multi-cabeza estándar, propia de la familia M2M-100 de la que deriva NLLB-200. El recuento de 615 millones de parámetros coincide con la variante *distilled* de 600M de NLLB-200, diseñada para inferencia eficiente manteniendo cobertura multilingüe. No se dispone de información sobre la inicialización exacta (si parte de NLLB-200 distilled o de otro checkpoint), ni sobre el tokenizador o los tokens de idioma utilizados.

No hay datos publicados sobre el corpus de entrenamiento: ni número de pares de frases, ni composición del dataset, ni si se aplicaron técnicas de aumento de datos, destilación o ajuste con datos paralelos de bambara-dioula-francés. Tampoco se documenta si hubo evaluación humana, métricas BLEU/chrF ni validación cruzada. La model card es la plantilla automática de Hugging Face sin rellenar.

## Capacidades

- Traducción automática de texto entre bambara, dioula y francés, en las direcciones que permita el ajuste (no documentadas explícitamente).
- Generación text2text mediante la tarea `text2text-generation` de transformers.
- Compatibilidad con el ecosistema transformers y con endpoints compatibles (`endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multimodal (visión, audio) ni modo de razonamiento extendido.
- Capacidades multilingües limitadas, en principio, a los tres idiomas del nombre del modelo.

## Casos de uso

- Traducción de documentación administrativa y sanitaria al bambara y al dioula: el modelo puede integrarse en pipelines de traducción para material de divulgación dirigido a hablantes de lenguas mandé, siempre que se valide la calidad con revisores nativos.
- Localización de interfaces y contenidos digitales: traducción de cadenas de UI y textos breves del francés a bambara/dioula en aplicaciones para África Occidental, con revisión humana posterior.
- Investigación en PLN de bajos recursos: uso como línea base para comparar con mBART, M2M-100 y NLLB-200 completos en tareas de traducción bambara-francés, tal y como se hace en trabajos recientes sobre recursos para bambara.
- Preservación y difusión lingüística: traducción de cuentos, textos orales transcritos y materiales educativos entre las tres lenguas para proyectos comunitarios.
- Subtitulado y transcripción asistida: traducción de subtítulos del francés a bambara/dioula en contenidos audiovisuales, con postedición humana dada la escasa documentación sobre calidad.
- Prototipado de asistentes conversacionales multilingües: integración como módulo de traducción en un sistema mayor (por ejemplo, un chatbot que reciba francés y responda en bambara), dado su tamaño moderado y su compatibilidad con transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos, más memoria de activaciones y KV cache; en la práctica, unos 3-4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB para pesos; en torno a 2 GB con overhead.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,7-1 GB; en 4 bits, unos 0,4-0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También cabe en GPUs de 4-6 GB y en CPU para inferencia por lotes pequeños.
- Despliegue: compatible con transformers (pipeline `text2text-generation`), con TGI y con vLLM para arquitecturas encoder-decoder (verificar soporte de `m2m_100` en la versión concreta). No se documenta compatibilidad con llama.cpp u Ollama, que no soportan de forma nativa esta arquitectura.
- Latencia y throughput: no disponibles; para un modelo de 600M en una GPU moderna se espera un throughput alto (decenas o cientos de frases por segundo en batch), pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NLLB_Bambara_Dioula_Francais (este) | 615 M | no disponible | bambara, dioula, francés (inferido) | no disponible | Hugging Face |
| NLLB-200 distilled 600M (Meta) | 615 M | 512 tokens (documentado por Meta) | 200 idiomas, incluido bambara | CC-BY-NC 4.0 | Hugging Face |
| M2M-100 418M (Meta) | 418 M | 1024 tokens (documentado por Meta) | 100 idiomas | MIT | Hugging Face |
| mBART-50 (Meta) | 611 M | 1024 tokens (documentado por Meta) | 50 idiomas | MIT | Hugging Face |

No hay datos de rendimiento comparativo para este checkpoint concreto, por lo que la comparación se limita a parámetros, cobertura idiomática y licencia.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluación; no es posible conocer la calidad real de las traducciones sin una evaluación propia.
- Riesgo elevado de alucinación y de traducciones incorrectas en dominios especializados, dado el escaso corpus disponible en bambara y dioula.
- La licencia no está declarada; si el modelo deriva de NLLB-200, la licencia original de Meta es CC-BY-NC 4.0, lo que restringiría el uso comercial. Es imprescindible aclarar este punto antes de cualquier despliegue en producción.
- Cobertura idiomática limitada a tres lenguas; no debe esperarse transferencia fiable a otras lenguas mandé.
- Sin información sobre el tokenizador ni sobre los códigos de idioma esperados, lo que puede provocar errores de uso si se invoca como un NLLB-200 estándar.
- Repositorio con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación externa.
- No apto para producción sin una evaluación humana sistemática y sin aclaración de licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiefiguetuo/NLLB_Bambara_Dioula_Francais
- Paper de NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Paper de M2M-100 (referenciado en las etiquetas): https://arxiv.org/abs/1910.09700
- Bayelemabaga: Creating Resources for Bambara NLP (NAACL 2025): https://aclanthology.org/2025.naacl-long.602.pdf
