# violetxi/qwen35-9b-equational-theory-sair-mix10m-70n30t-thinking

## Resumen

El modelo `violetxi/qwen35-9b-equational-theory-sair-mix10m-70n30t-thinking` es un ajuste fino supervisado completo (full fine-tuning) de `Qwen/Qwen3.5-9B`, publicado por el usuario violetxi el 3 de octubre de 2026. Se trata de un checkpoint especializado en teoria ecuacional y razonamiento matematico, entrenado sobre una mezcla nominal de 10 millones de tokens supervisados compuesta aproximadamente por un 70% de notas matematicas y un 30% de trayectorias de profesor condicionadas por notas. El modelo conserva la arquitectura original del modelo base y anade una plantilla de chat con modo "thinking" activado para evaluacion matematica.

El problema que aborda es la internalizacion de teoria ecuacional: el entrenamiento incluye explicitamente el razonamiento del profesor y las respuestas finales dentro de la mascara de perdida, de modo que el modelo aprende no solo la respuesta, sino la traza de razonamiento que la produce. Con 9.653.104.368 parametros (aproximadamente 9,65 mil millones) y un repositorio de 19,3 GB, es un modelo denso de la familia Qwen3.5, con licencia Apache 2.0 y pesos en safetensors, lo que facilita su uso comercial y su integracion en pipelines de HuggingFace Transformers.

Su relevancia actual radica en que es un ejemplo de experimento de ajuste fino reproducible: el autor publica hashes de procedencia, configuracion de entrenamiento completa, metricas de perdida y un registro en Weights & Biases, ademas de las dos bases de datos empleadas. No obstante, las descargas y los "likes" registrados en el momento de redactar esta ficha son cero, y los resultados de benchmarks se publican por separado, por lo que se trata de un artefacto de investigacion mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer denso; clase `Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 9.653.104.368 (9,65 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion publicada; el export nativo es BF16 (bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 19,3 GB |
| Modelo base | Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) |
| Libreria | transformers |
| Pipeline declarado | text-generation |
| Modalidad declarada en tags | image-text-to-text, conversational, endpoints_compatible |
| Fecha de creacion | 3 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5 y se carga mediante la clase `Qwen3_5ForConditionalGeneration`, lo que confirma que se trata de un transformer denso con cabecera de generacion condicional. El autor indica que se actualizaron 427 tensores del lenguaje, todos procedentes del checkpoint entrenado, mientras que el resto de tensores conservan los valores fijados del modelo base; el archivo `conversion.json` registra el hash de cada artefacto. Esto implica que no hubo una modificacion arquitectonica estructural, sino un ajuste fino completo de las capas de lenguaje. El tag `image-text-to-text` sugiere soporte de entrada imagen-texto heredado del modelo base, aunque la model card no documenta ninguna capacidad de vision especifica ni evaluaciones multimodales de este checkpoint.

El entrenamiento consistio en un ajuste fino supervisado completo (full SFT) de dos epocas, con tasa de aprendizaje `5e-6`, esquema coseno, calentamiento (warmup) de 0,03 y FSDP2 sobre ocho GPU. La funcion de perdida fue entropia cruzada media sobre tokens supervisados a nivel global, sin termino KL. El ultimo paso del optimizador fue el 200 y la perdida final de validacion compartida fue 0,258951. El presupuesto de datos se desglosa en 6.988.257 tokens supervisados de notas (11.900 ejemplos) y 3.000.165 tokens de trayectorias (1.120 ejemplos), para un total de 9.988.422 tokens supervisados y 13.020 ejemplos. Las notas provienen del banco sellado R8, excluyendo cabezas en cuarentena y ejemplos de validacion congelados; las trayectorias R0 a R4 se guardaron con el razonamiento exacto del profesor restaurado. Los ejemplos completos se seleccionaron sin remuestreo ni truncamiento, y los recuentos tienen en cuenta la mascara de perdida y el enmascaramiento de fronteras entre notas. Los modelos de 1M, 5M y 10M comparten un mismo pool de trayectorias; los de 50M y 100M usan otro pool compatible con R8, y el autor no reclama anidamiento cruzado entre pools.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, con pipeline declarado `text-generation`.
- Razonamiento matematico y trabajo con teoria ecuacional, ambito principal del ajuste fino.
- Modo "thinking" activado mediante la plantilla de chat incluida; la model card recomienda usarla con el razonamiento habilitado para evaluacion matematica.
- Generacion de trazas de razonamiento intermedias, ya que el entrenamiento incluyo el razonamiento del profesor dentro de los tokens supervisados.
- Capacidad multimodal imagen-texto segun los tags del repositorio, aunque no hay evaluacion ni documentacion especifica en la model card.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`) y uso conversacional multi-turno.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso mas alla del modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia en teoria ecuacional para investigacion matematica: el modelo se ha entrenado sobre notas del banco R8 y puede emplearse para explorar identidades y reescrituras en variedades ecuacionales, con la traza de razonamiento visible para auditar cada paso.
- Generacion de demostraciones paso a paso en entornos docentes: el modo thinking permite mostrar el desarrollo completo y no solo la respuesta final, util en asignaturas de algebra y logica.
- Evaluacion comparativa de estrategias de internalizacion de razonamiento: al compartir pool de trayectorias con los checkpoints de 1M y 5M, sirve como punto de control en un estudio sobre cuantos tokens supervisados son necesarios para internalizar teoria ecuacional.
- Reproduccion de experimentos de ajuste fino: la publicacion de `training_config.json`, `data_provenance.json`, `training_metrics.json` y del run de Weights & Biases permite replicar el entrenamiento en un cluster de ocho GPU con FSDP2.
- Filtrado y anotacion de datos matematicos: el modelo puede usarse para etiquetar o validar notas y trayectorias generadas por otros sistemas dentro de un pipeline de curacion de datasets.
- Sustitucion del modelo base en prototipos de razonamiento matematico: al mantener la licencia Apache 2.0 y el formato safetensors, se puede intercambiar por `Qwen/Qwen3.5-9B` en un servicio existente sin cambiar la pila de inferencia.
- Generacion de documentacion tecnica formal sobre estructuras algebraicas: el estilo de las notas de entrenamiento (notas matematicas) tiende a producir texto tecnico estructurado, adecuado para borradores de apuntes o glosarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que los resultados de benchmarks se publican por separado y advierte de que las evaluaciones previas de otras mezclas no describen este checkpoint. El unico dato cuantitativo de rendimiento publicado es la perdida final de validacion compartida: 0,258951, en el paso de optimizador 200 tras dos epocas.

| Metrica | Valor |
|---|---|
| Perdida de validacion compartida (final) | 0,258951 |
| Paso de optimizador final | 200 |
| Tokens supervisados por epoca | 9.988.422 |
| MMLU, HumanEval, GSM8K u otros | no disponibles |

## Requisitos de hardware

- Pesos en BF16: 19,3 GB solo de pesos, por lo que se necesita una GPU de 24 GB o mas para inferencia con cache KV moderada (RTX 3090, RTX 4090, L4 de 24 GB, A100 40/80 GB, H100).
- Cuantizacion a 8 bits: aproximadamente 10 GB de pesos, viable en GPUs de 12-16 GB con contexto corto.
- Cuantizacion a 4 bits: aproximadamente 5-6 GB de pesos, viable en GPUs de consumo como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070; requiere conversion previa, ya que el repositorio solo publica safetensors BF16.
- Entrenamiento: el autor reporta FSDP2 sobre ocho GPU, lo que da una referencia de la infraestructura utilizada en el ajuste fino completo.
- Despliegue: compatible con HuggingFace Transformers mediante `Qwen3_5ForConditionalGeneration` y `device_map="auto"`; para vLLM, TGI, llama.cpp u Ollama se requiere disponibilidad de la arquitectura Qwen3.5 en la version concreta del motor y, en el caso de llama.cpp u Ollama, conversion a GGUF que no se distribuye en el repositorio.
- El tag `endpoints_compatible` indica compatibilidad con endpoints gestionados de HuggingFace.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-9b-equational-theory-sair-mix10m-70n30t-thinking | 9,65 mil millones | no disponible | Teoria ecuacional y razonamiento matematico (SFT completo) | Apache 2.0 | HuggingFace, safetensors |
| Qwen/Qwen3.5-9B | no disponible | no disponible | Modelo base generalista | no disponible en la informacion proporcionada | HuggingFace |
| Llama 3.1 8B | 8,03 mil millones | 128.000 tokens | Modelo generalista | Llama 3.1 Community License | HuggingFace, amplio ecosistema de cuantizaciones |
| Gemma 2 9B | 9,24 mil millones | 8.192 tokens | Modelo generalista | Gemma Terms of Use | HuggingFace, amplio ecosistema de cuantizaciones |

No se dispone de datos de rendimiento de este checkpoint que permitan una comparacion cuantitativa con las alternativas. La comparacion relevante es cualitativa: frente al modelo base, este checkpoint esta especializado y exige usar la plantilla de chat con thinking activado para obtener su comportamiento previsto; frente a generalistas como Llama 3.1 8B o Gemma 2 9B, ofrece licencia Apache 2.0 (mas permisiva que la de Llama o Gemma) pero carece del ecosistema de cuantizaciones GGUF y de evaluaciones publicas.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados para este checkpoint, por lo que no puede afirmarse su rendimiento relativo frente al modelo base ni frente a alternativas.
- El modelo es un ajuste fino muy especializado en teoria ecuacional; es probable que su rendimiento en tareas generales se degrade respecto al modelo base, aunque no hay mediciones que lo confirmen.
- Los recuentos de descargas y "likes" son cero en el momento de redactar la ficha, lo que apunta a un artefacto de investigacion sin validacion externa.
- Riesgo de alucinacion en demostraciones matematicas: el entrenamiento optimiza la imitacion de trayectorias de profesor, no la verificacion formal, por lo que las trazas generadas deben comprobarse con un asistente de pruebas antes de usarse en contextos criticos.
- Las notas de entrenamiento proceden de un banco "sellado" (R8) del que no se documenta su composicion completa en la model card, lo que limita el analisis de sesgos de dominio.
- Solo se actualizaron 427 tensores de lenguaje; el resto conserva los valores del modelo base, de modo que los sesgos y limitaciones del base persisten.
- La model card advierte de que los resultados de evaluacion de mezclas anteriores no describen este checkpoint, por lo que no deben reutilizarse cifras de otros modelos de la misma familia.
- Idiomas soportados no documentados: se desconoce el comportamiento fuera del ambito matematico en ingles.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero el usuario debe verificar tambien la licencia y los terminos del modelo base Qwen3.5-9B.
- Se recomienda usar la plantilla de chat incluida con thinking activado; usarlo sin ella puede producir resultados fuera de distribucion.
- Los pools de trayectorias no son anidados entre los modelos de 1M/5M/10M y los de 50M/100M, por lo que las comparaciones directas entre ambos grupos no estan respaldadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-mix10m-70n30t-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-notes
- Dataset de trayectorias condicionadas por notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-note-conditioned-rollouts
- Run de entrenamiento en Weights & Biases: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqthink10m20261001
