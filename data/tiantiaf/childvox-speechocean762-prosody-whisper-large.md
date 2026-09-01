# tiantiaf/childvox-speechocean762-prosody-whisper-large

## Resumen

El modelo `tiantiaf/childvox-speechocean762-prosody-whisper-large` es un fine-tune de `openai/whisper-large-v3` desarrollado por Tiantian Feng y colaboradores en el marco del proyecto ChildVox, un benchmark de audio y habla infantil. Su función es clasificar la prosodia del habla en tres categorías (entonación pobre, casi correcta y correcta) a partir de grabaciones de audio de 10 segundos, utilizando el dataset SpeechOcean762, que contiene habla de niños y adultos con evaluaciones de calidad. El modelo está pensado para investigación en caracterización acústica del habla infantil y se distribuye bajo licencia OpenRAIL, con restricciones explícitas de uso no comercial.

La arquitectura se basa en el encoder-decoder transformer de Whisper large v3, adaptado mediante un wrapper (`WhisperWrapper`) que permite extraer logits y embeddings para la tarea de clasificación. El repositorio incluye cinco variantes (folds) entrenadas con validación cruzada. Aunque el modelo base es multilingüe, el fine-tune se centra en inglés no nativo procedente del corpus SpeechOcean762. Su relevancia radica en ofrecer una herramienta específica para evaluar la madurez prosódica en habla infantil, un área con escasos recursos especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basada en Whisper large v3) con wrapper de clasificación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 segundos de audio (recomendado en el codigo de ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Multilingue (modelo base), fine-tune en ingles no nativo |
| Licencia | OpenRAIL |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3`, un transformer encoder-decoder con atencion de 32 capas y aproximadamente 1.5B de parametros (dato del modelo base, no confirmado en la ficha). El fine-tune se realiza sobre el dataset SpeechOcean762, un corpus de habla no nativa en ingles con anotaciones de calidad de pronunciacion, compuesto por la mitad de hablantes infantiles y la otra mitad adultos. La tarea de clasificacion de prosodia se define a partir de las puntuaciones originales del dataset: puntuaciones menores o iguales a 6 se etiquetan como "Poor intonation", entre 7 y 8 como "Nearly correct intonation", y mayores de 8 como "Correct intonation". El entrenamiento se organiza en cinco folds para validacion cruzada, y el modelo se carga mediante `WhisperWrapper.from_pretrained` con un indice de fold especifico. No se detallan hiperparametros, numero de tokens de entrenamiento ni tecnicas de alineamiento adicionales (RLHF, DPO, etc.) en la informacion disponible.

## Capacidades

- Clasificacion de prosodia en tres niveles: entonacion pobre, casi correcta y correcta.
- Procesamiento de audio de 16 kHz en mono, con entrada limitada a 10 segundos.
- Extraccion de embeddings ademas de logits de clasificacion (via `return_feature=True`).
- Soporte de inferencia en CPU y GPU mediante PyTorch.
- Integracion con la libreria `transformers` y el ecosistema Hugging Face.
- Capacidad multilingue heredada del modelo base, aunque el fine-tune se centra en ingles no nativo.

## Casos de uso

- Investigacion en desarrollo del habla infantil: el modelo permite analizar la prosodia de grabaciones de ninos para estudiar la madurez entonativa en distintas edades, gracias a su entrenamiento especifico en habla infantil.
- Evaluacion de pronunciacion en entornos educativos no comerciales: puede usarse para dar retroalimentacion automatica sobre la entonacion en practicas de ingles como segunda lengua, siempre que se respete la restriccion de uso no comercial.
- Analisis de corpus de habla: util para etiquetar automaticamente grandes conjuntos de audio con categorias de prosodia, facilitando la creacion de datasets anotados para otros fines de investigacion.
- Comparacion de habla infantil y adulta: al estar entrenado con mitad de ninos y mitad de adultos, permite contrastar diferencias prosodicas entre ambos grupos en estudios de adquisicion del lenguaje.
- Validacion de modelos de audio: sirve como componente de referencia en el benchmark ChildVox para evaluar el rendimiento de otros sistemas de clasificacion de prosodia en habla infantil.
- Prototipado de herramientas de asistencia educativa: en contextos de investigacion aplicada, puede integrarse en prototipos de aplicaciones para practica de pronunciacion, siempre que no se comercialicen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona las metricas `f1` y `accuracy` como indicadores de evaluacion, pero no proporciona valores concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentacion del modelo.
- Al tratarse de un fine-tune de Whisper large v3, se espera que la inferencia requiera una GPU con al menos 8 GB de VRAM para el modelo en precision completa, aunque no hay datos confirmados.
- El codigo de ejemplo permite ejecucion en CPU (`device = torch.device("cuda") if torch.cuda.is_available() else "cpu"`), pero la latencia sera significativamente mayor.
- Opciones de despliegue: al ser un modelo de la libreria `transformers`, puede servirse con herramientas como vLLM o TGI, aunque no se mencionan configuraciones especificas. Tambien es posible usar `llama.cpp` si se convierte a formato GGUF, pero no se proporciona soporte oficial.
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de clasificacion de prosodia infantil con caracteristicas similares.

## Limitaciones y advertencias

- Uso fuera de alcance: el modelo no debe emplearse en aplicaciones clinicas o diagnosticas (p. ej., deteccion de trastornos del desarrollo o del lenguaje), evaluaciones individuales de desarrollo sin revision humana experta, vigilancia, aplicaciones invasivas de privacidad ni uso comercial.
- Datos sensibles: el habla infantil es altamente sensible; los usuarios deben respetar la privacidad y el consentimiento de los menores y sus familias, y obtener aprobacion etica (IRB) cuando corresponda.
- Riesgo de alucinacion: al ser un modelo de clasificacion, no genera texto libre, pero puede producir etiquetas incorrectas si el audio de entrada no se ajusta a las condiciones de entrenamiento (duracion, frecuencia de muestreo, idioma).
- Limitaciones de contexto: la entrada se limita a 10 segundos de audio; grabaciones mas largas deben segmentarse, lo que puede afectar la coherencia prosodica.
- Restricciones de licencia: la licencia OpenRAIL impide el uso comercial, lo que limita su aplicacion en productos o servicios con fines de lucro.
- Sesgos potenciales: el entrenamiento se realizo sobre un corpus especifico (SpeechOcean762) con hablantes de ingles no nativo, por lo que el rendimiento puede degradarse con otros acentos o idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiantiaf/childvox-speechocean762-prosody-whisper-large
- Repositorio GitHub: https://github.com/tiantiaf0627/childvox-release
- Pagina del proyecto ChildVox: https://tiantiaf0627.github.io/childvox/
- Paper en arXiv: https://arxiv.org/abs/2605.29257
- Version HTML del paper: https://arxiv.org/html/2605.29257v1
- Coleccion de modelos ChildVox en Hugging Face: https://huggingface.co/collections/tiantiaf/childvox
- Dataset SpeechOcean762 (referencia): https://github.com/jimbozhang/speechocean762
