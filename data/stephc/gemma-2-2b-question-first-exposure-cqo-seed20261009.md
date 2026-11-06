# StephC/Gemma-2-2B-Question-First-Exposure-CQO-seed20261009

## Resumen

Gemma-2-2B-Question-First-Exposure-CQO-seed20261009 es un checkpoint de investigacion derivado de google/gemma-2-2b-it, publicado por StephC (Stefano Civelli) como parte del estudio *Exposure to Question-First Prompts Changes How Language Models Read the Context*. El modelo es un fine-tuning completo del Gemma 2 de 2B parametros, orientado a un experimento de interpretabilidad mecanica sobre como el orden de los elementos en un prompt (contexto, pregunta y opciones) altera la forma en que el modelo procesa y puntua respuestas de opcion multiple.

La variante CQO corresponde a un entrenamiento en el que cada registro se presenta con el orden contexto-pregunta-opciones. Forma parte de una release de nueve checkpoints (tres familias de modelos x tres regimenes de orden: CQO-only, QOC-only y mixto) para la semilla fija 20261009. No es un asistente conversacional de proposito general: se entreno especificamente sobre respuestas de opcion multiple de RACE-M, RACE-H, LogiQA y SciQ.

Su relevancia es fundamentalmente cientifica: permite reproducir los experimentos del paper sobre sensibilidad al orden de prompt, incluido el ensayo de intercambio de pregunta (question-swap) que requiere pesos FP32. El checkpoint se distribuye byte a byte tal como fue evaluado, sin cuantizacion ni conversion, lo que lo convierte en una referencia reproducible para investigacion en interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2; atencion eager en el entrenamiento) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en FP32 sin cuantizar) |
| Idiomas soportados | en |
| Licencia | gemma (Gemma Terms of Use, con Prohibited Use Policy) |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-2-2b-it (revision 299a8560bedf22ed1c72a8a11e7dce4a7f9f51f8) y aplica un fine-tuning completo sobre la arquitectura transformer decoder-only de la familia Gemma 2. El entrenamiento uso parametros en FP32 y estados de AdamW, con autocast en BF16, learning rate 5e-6, batch efectivo de 8 y atencion eager. Se realizaron 1.024 actualizaciones del optimizador sobre 4.096 registros de entrenamiento, divididos por igual entre RACE-M, RACE-H, LogiQA y SciQ, con dos pasadas sobre el dataset.

El regimen CQO presenta cada registro una vez con el orden contexto-pregunta-opciones. En la release completa, el regimen mixto presenta cada registro una vez en CQO y otra en QOC a lo largo de dos pasadas. La innovacion tecnica del trabajo no reside en la arquitectura sino en el diseno experimental: manipular sistematicamente el orden de los componentes del prompt para medir como cambia la lectura del contexto por parte del modelo, con intervenciones y un ensayo de intercambio de pregunta que requiere preservar los pesos FP32. El checkpoint es un modelo completo, no un adapter, y no incluye estados del optimizador.

## Capacidades

- Generacion de texto y puntuacion de respuestas de opcion multiple sobre los datasets del estudio (RACE-M, RACE-H, LogiQA, SciQ).
- Evaluacion de sensibilidad al orden de prompt (CQO frente a QOC) mediante el prompt template fijo del paper.
- Soporte del ensayo de question-swap, que requiere cargar los pesos en FP32.
- Reproduccion de evaluaciones con el codigo del repositorio del paper (`qfe.evaluate`, `qfe.question_swap`).
- Capacidades conversacionales generales: no garantizadas; el modelo se entreno sobre opciones multiples, no como asistente de chat.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles (en).
- Thinking mode, vision o audio: no disponible.

## Casos de uso

- Investigacion en interpretabilidad mecanica: cargar el checkpoint en FP32 y ejecutar el ensayo de question-swap para estudiar como el modelo integra la pregunta con el contexto bajo distintos ordenes de prompt.
- Reproduccion de resultados del paper: usar `qfe.evaluate` con el conjunto `analysis` para verificar las metricas reportadas para la semilla 20261009.
- Estudios comparativos de orden de prompt: contrastar este checkpoint CQO con las variantes QOC-only y mixta de la misma semilla para aislar el efecto del orden de entrenamiento.
- Analisis de sensibilidad a la formulacion de la pregunta: medir como cambia la puntuacion de etiquetas cuando se intercambia la pregunta manteniendo el contexto y las opciones.
- Experimentos de atribucion y probing: inspeccionar activaciones internas del modelo Gemma 2 de 2B sobre tareas de opcion multiple con un checkpoint controlado y reproducible.
- Validacion de pipelines de evaluacion: servir como referencia byte a byte para comprobar que las herramientas de evaluacion del repositorio producen resultados identicos a los publicados.
- Docencia y formacion: ilustrar en cursos de interpretabilidad como un fine-tuning acotado sobre 4.096 registros altera el comportamiento de lectura del contexto en un modelo de 2B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados conciernen a los datasets de opcion multiple fijos y al prompt template del paper, y que no se reclama ningun rendimiento mas amplio de tarea o despliegue.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 10,5 GB solo para pesos (2,61B parametros x 4 bytes), mas overhead de activaciones y contexto; el repo completo ocupa 10,5 GB.
- VRAM estimada en BF16 (para las evaluaciones ordinarias del paper): en torno a 5,2 GB para pesos, mas overhead.
- GPU recomendadas: A100 o H100 para reproducir el ensayo en FP32 con comodidad; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para FP32 en inferencia.
- GPU consumer: cabe en tarjetas de 16 GB o mas en BF16; para FP32 se recomienda al menos 16-24 GB. Tarjetas de 8-12 GB pueden alojar el modelo en BF16 con contexto corto.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles segun los tags. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI mas alla del tag `text-generation-inference`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-2-2B-Question-First-Exposure-CQO-seed20261009 | 2,61B | no disponible | Investigacion de orden de prompt (opcion multiple) | gemma | Hugging Face (StephC) |
| google/gemma-2-2b-it | 2,61B | no disponible | Asistente conversacional de proposito general | gemma | Hugging Face (Google) |
| Variantes QOC-only y mixta de la misma release | 2,61B | no disponible | Mismo estudio, distinto regimen de orden | gemma | Hugging Face (StephC) |

## Limitaciones y advertencias

- El modelo se entreno sobre respuestas de opcion multiple de cuatro datasets concretos; no es un asistente de chat de proposito general y no se reclama rendimiento fuera de ese template.
- Los resultados del paper corresponden a seis semillas; esta release de una sola semilla no reproduce por si sola las estimaciones de incertidumbre a nivel de semilla.
- La semilla 20261009 se eligio como primera semilla numerada, no por rendimiento.
- Solo soporta ingles.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; al ser un fine-tuning sobre datasets academicos, puede heredar sesgos de RACE, LogiQA y SciQ.
- El uso y la redistribucion estan sujetos a las restricciones de la Seccion 3.2 de los Gemma Terms, incluida la Prohibited Use Policy adjunta; revisar `LICENSE.txt`, `NOTICE.txt` y `USE_POLICY.txt`.
- Los archivos `model-*.safetensors` son derivados modificados por el fine-tuning y se distribuyen byte a byte tal como fueron evaluados; no han sido cuantizados, convertidos ni re-fragmentados.
- No se incluyen estados del optimizador ni texto de entrenamiento.
- Para preservar el ensayo de question-swap es necesario cargar los pesos en FP32; usar BF16 puede invalidar ese experimento concreto.

## Enlaces

- Hugging Face: https://huggingface.co/StephC/Gemma-2-2B-Question-First-Exposure-CQO-seed20261009
- Paper, codigo y reproduccion: https://github.com/Stefano-Civelli/question-first-exposure
- Repositorio de investigacion original: https://github.com/Stefano-Civelli/prompt-order-sensitivity
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
