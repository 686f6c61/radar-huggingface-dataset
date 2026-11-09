# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd5280-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd5280-lora es un adaptador LoRA publicado por uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El objetivo concreto del adaptador es especializar un modelo muy pequeno (0,5 mil millones de parametros) en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. El entrenamiento se realizo con la herramienta Post-Training Lab del propio autor sobre el dataset uygarkurt/xlam-tool-calling-mixed.

La particularidad tecnica es la combinacion de dos fases: primero 2.800 actualizaciones de supervised fine-tuning (SFT) y despues 5.280 actualizaciones de on-policy distillation (OPD), en las que el modelo estudiante aprende de las probabilidades por token de un profesor congelado, Qwen/Qwen2.5-3B-Instruct, sobre sus propias respuestas generadas. Segun la model card, el adaptador OPD ya incorpora el SFT previo, por lo que se carga directamente sobre el modelo base original sin necesidad de aplicar el adaptador SFT por separado.

Es relevante ahora porque explora si un modelo de 0,5B puede adquirir comportamiento fiable de function calling y, sobre todo, de rechazo ante herramientas irrelevantes, un problema practico en pipelines de agentes donde el modelo tiende a forzar llamadas aunque no proceda. Los resultados publicados muestran un compromiso claro: la relevancia sube al 100% pero la deteccion de irrelevancia cae al 9,98%, lo que convierte este adaptador en un caso de estudio sobre el equilibrio entre ambas metricas mas que en una solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parametros. El adaptador en si es un LoRA entrenado con PEFT y Transformers, por lo que no modifica la arquitectura del modelo base: anade matrices de bajo rango que se cargan junto con los pesos originales. El repositorio contiene unicamente los pesos del adaptador (tamano del repo 0,0 GB), no los pesos completos del modelo.

El entrenamiento se hizo en dos etapas sobre el dataset uygarkurt/xlam-tool-calling-mixed. La primera, SFT con 2.800 actualizaciones (0,4 horas de tiempo de bucle de entrenamiento). La segunda, OPD con 5.280 actualizaciones (1,9 horas), en la que el estudiante aprende de las probabilidades por token de un profesor congelado, Qwen2.5-3B-Instruct, evaluadas sobre las respuestas que genera el propio estudiante (de ahi el caracter on-policy). El tiempo total de bucle de entrenamiento reportado es de 2,3 horas, excluyendo carga de modelos, preparacion de datos y evaluacion externa. No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Tool calling estructurado: el adaptador esta entrenado especificamente para emitir llamadas a funciones en formato estructurado.
- Abstención ante herramientas irrelevantes: capacidad entrenada explicitamente para no invocar funciones cuando las ofrecidas no encajan con la consulta (aunque el resultado medido en irrelevancia es bajo, ver benchmarks).
- Razonamiento basico y matematicas limitadas, coherentes con un modelo de 0,5B parametros.
- Capacidades multilingues limitadas al ingles segun la model card (el modelo base Qwen2.5 soporta mas idiomas, pero el adaptador declara solo en).
- No se documentan capacidades de vision, audio ni modo thinking explicito.
- Soporte de agentes multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Prototipado rapido de function calling en local: al ser un adaptador de 0,5B, permite experimentar con formatos de llamada a herramientas en una GPU de consumo o incluso en CPU antes de escalar a un modelo mayor.
- Investigacion sobre calibracion de abstención: util como linea base para estudiar por que un modelo entrenado para rechazar herramientas irrelevantes acaba aceptandolas casi siempre (9,98% de deteccion de irrelevancia), y disenar mejores estrategias de OPD.
- Enrutamiento de bajo coste en pipelines de agentes: usar el adaptador como primera capa que decide si una consulta requiere una herramienta concreta, derivando al modelo grande solo cuando hay coincidencia clara.
- Generacion de datos sinteticos de tool calling: el adaptador puede producir ejemplos de llamadas estructuradas para aumentar datasets de entrenamiento de modelos mayores, dado su bajo coste de inferencia.
- Educacion y demos de post-entrenamiento: el repositorio y la herramienta Post-Training Lab permiten reproducir el flujo SFT + OPD en un caso pequeno y verificar el efecto en metricas concretas (xLAM ETC, BFCL, Relevance/Irrelevance).
- Evaluacion comparativa de adaptadores LoRA: sirve como referencia para medir cuanto mejora o empeora un modelo de 0,5B al aplicar OPD frente a solo SFT, con numeros publicados de ambas etapas.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes). La primera fila es el adaptador SFT inicial; la segunda es el adaptador SFT + OPD de este repositorio.

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT starting adapter | SFT 2.800 | 39,80% | 18,40% | 29,57% | 75,88% | 95,76% | 51,76% | 83,33% | 58,83% | 0,4 |
| SFT + OPD (este adaptador) | OPD 5.280 | 39,86% | 17,80% | 29,76% | 66,89% | 86,84% | 57,46% | 100,00% | 9,98% | 2,3 |

Notas de la model card: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de funcion. Las puntuaciones xLAM usan el split de test del dataset mixto, con 2.546 ejemplos evaluados y 743 omitidos por el limite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM se hicieron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 0,5B en precision completa (fp16) se situa en torno a 1-2 GB, y en cuantizaciones de 4-8 bits por debajo de 1 GB, aunque estos calculos no figuran en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) deberia poder alojar el modelo base; los pesos del adaptador son de 0,0 GB.
- Cabe en GPU consumer: si, dado el tamano del modelo base (0,5B), aunque no se confirma con datos del autor.
- Opciones de despliegue: Transformers + PEFT (libreria declarada). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B | no disponible | Si (entrenado) | no disponible | Hugging Face (adaptador) |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | Limitado (instruct general) | no disponible | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | no disponible | Si (instruct general) | no disponible | Hugging Face |
| Adaptador SFT previo (mismo autor) | 0,5B | no disponible | Si (entrenado) | no disponible | Hugging Face |

La comparativa se limita a los modelos citados en la informacion proporcionada. No se dispone de datos de benchmarks de los modelos base ni del profesor en esta ficha, por lo que no se puede establecer una comparacion cuantitativa mas alla de las cifras de la tabla de benchmarks del adaptador.

## Limitaciones y advertencias

- Caida drastica de la deteccion de irrelevancia: pasa de 58,83% (SFT) a 9,98% (SFT + OPD), lo que significa que el modelo tiende a invocar herramientas aunque no proceda. Es el caveat mas importante para uso en produccion.
- Empeoramiento de metricas de tool calling: xLAM ETC baja de 75,88% a 66,89% y xLAM FNA de 95,76% a 86,84% tras la fase OPD.
- MATH-500 baja ligeramente (18,40% a 17,80%) e IFEval sube marginalmente (29,57% a 29,76%); MMLU practicamente igual (39,80% a 39,86%).
- Tamano muy reducido (0,5B): riesgo elevado de alucinacion y de razonamiento limitado, especialmente en tareas multi-paso.
- Idioma: la model card declara solo ingles; el rendimiento en castellano no esta documentado.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Conviene verificar la licencia del modelo base Qwen2.5-0.5-Instruct por separado.
- Es un adaptador, no un modelo completo: requiere cargar el modelo base Qwen/Qwen2.5-0.5B-Instruct y aplicar los pesos LoRA.
- Evaluacion limitada: 743 ejemplos omitidos por el limite de 640 tokens de prompt en xLAM, lo que puede sesgar las metricas hacia consultas cortas.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en produccion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-opd5280-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor (Qwen2.5-3B-Instruct): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft2800-lora
- Dataset: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
