# ZihanLiummyycc/FSG-RL-Feedback-GRPO

## Resumen

FSG-RL-Feedback-GRPO es un adaptador LoRA publicado por el usuario ZihanLiummyycc sobre el modelo base Qwen/Qwen3.5-9B-Base. Se enmarca en el proyecto FSG-RL (Function-structured reinforcement learning), una linea de trabajo centrada en razonamiento matematico que combina aprendizaje por refuerzo con feedback estructurado. Este checkpoint concreto continua el entrenamiento del adaptador principal de FSG-RL sobre 60 problemas de entrenamiento de dificultad alta, y se distribuye como adaptador independiente: no requiere apilar los adaptadores anteriores para la inferencia.

El metodo se apoya en un profesor externo denominado gpt-5.6-terra que, durante el entrenamiento, emite un diagnostico compartido con como maximo una peticion logica de profesor por problema; despues, los rollouts del estudiante se verifican y se optimizan (GRPO, Group Relative Policy Optimization). El profesor no interviene en evaluacion ni en inferencia, por lo que el adaptador resultante es autonomo. El repositorio ocupa 0,4 GB y contiene unicamente los pesos del adaptador en formato safetensors, sin los pesos del modelo base.

Su relevancia es fundamentalmente de investigacion: aporta un registro congelado de evaluacion sobre un conjunto propio de 400 items con condicionamiento de grafo, en el que el checkpoint alcanza un 69,00 % de exactitud en la respuesta final y un 53,50 % de exito completo estricto. Son cifras del autor, no puntuaciones oficiales sobre los datasets de origen, y no hay benchmarks publicos adicionales ni datos de licencia, idiomas o cuantizacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder; arquitectura interna del base no detallada |
| Parametros totales | no disponible para el adaptador; el modelo base se denomina Qwen3.5-9B-Base (aproximadamente 9 000 millones segun nomenclatura) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la evaluacion local uso un limite de 2 048 tokens nuevos |
| Tipos de cuantizacion | no disponibles; al distribuirse como adaptador LoRA en safetensors, la cuantizacion depende del base una vez fusionado |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. Se carga mediante la libreria PEFT sobre Qwen/Qwen3.5-9B-Base y puede fusionarse con los pesos base para obtener un checkpoint unico. La model card indica que es un adaptador guardado de forma independiente y que los adaptadores anteriores del proyecto no necesitan apilarse para la inferencia, ademas de que los pesos base no se incluyen en el repositorio (0,4 GB de tamano total, coherente con un adaptador de baja y media dimension).

En cuanto al entrenamiento, este checkpoint continua el checkpoint principal de FSG-RL sobre 60 problemas de entrenamiento dificiles. La innovacion descrita es un esquema de aprendizaje por refuerzo condicionado por feedback: un profesor externo (gpt-5.6-terra) genera un diagnostico compartido con un maximo de una peticion logica de profesor por problema; a continuacion los rollouts del estudiante se verifican y se optimizan con GRPO. El profesor se emplea exclusivamente durante el entrenamiento y queda fuera de la evaluacion y de la inferencia. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Razonamiento matematico: el adaptador esta entrenado especificamente para resolver problemas matematicos, incluidos problemas catalogados como dificiles dentro del conjunto de entrenamiento de 60 items.
- Generacion de respuestas finales verificables: el pipeline de entrenamiento verifica los rollouts, lo que orienta el adaptador hacia respuestas finales comprobables.
- Optimizacion mediante feedback estructurado: el modelo aprende de diagnosticos de profesor condicionados por un grafo, segun la evaluacion "graph-conditioned" descrita por el autor.
- Funcionamiento autonomo en inferencia: al no requerir al profesor en tiempo de inferencia, puede desplegarse como un modelo de razonamiento autocontenido.
- Evaluacion con decodificacion greedy y modo de pensamiento desactivado: el registro congelado del autor se obtuvo en esa configuracion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la model card.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para matematicas: el adaptador sirve como checkpoint reproducible dentro de la linea FSG-RL, permitiendo comparar el efecto del feedback estructurado de profesor frente a esquemas GRPO sin diagnostico.
- Reproduccion de resultados academicos: con el registro de evaluacion congelado en el repositorio de GitHub, un grupo de investigacion puede replicar la configuracion (decodificacion greedy, pensamiento desactivado, 2 048 tokens nuevos) y contrastar las cifras de 69,00 % y 53,50 %.
- Generacion de soluciones para problemas matematicos de dificultad alta: el adaptador esta especializado en el subconjunto de 60 problemas duros, por lo que encaja en tareas de resolucion de ejercicios de nivel avanzado mas que en matematicas basicas.
- Construccion de conjuntos de datos sinteticos de razonamiento: puede emplearse para producir cadenas de solucion que despues se filtren con verificadores automaticos, aprovechando que el entrenamiento ya incorpora verificacion de rollouts.
- Estudio comparativo de distillation desde un profesor externo: al documentarse que el profesor solo actua en entrenamiento, es un caso util para analizar hasta que punto el estudiante internaliza el diagnostico sin acceso al profesor en produccion.
- Base para nuevos ciclos de RL sobre matematicas: al ser un adaptador independiente y no requerir el apilamiento de adaptadores previos, se puede partir de el para continuar entrenamiento con otros conjuntos de problemas o con otras senales de recompensa.
- Evaluacion de robustez y calibracion en modelos de razonamiento: el checkpoint permite medir tasas de exito estricto frente a exactitud de respuesta final, una distincion util para estudiar el hueco entre "acertar el resultado" y "resolver correctamente el problema completo".

## Benchmarks y rendimiento

Los unicos datos disponibles son los del conjunto de evaluacion propio del autor, descrito como "custom graph-conditioned" de 400 items. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion proporcionada, ni comparaciones con modelos similares.

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Conjunto propio graph-conditioned (400 items) | Exactitud de respuesta final | 69,00 % |
| Conjunto propio graph-conditioned (400 items) | Exito completo estricto | 53,50 % |

Condiciones declaradas de la evaluacion local: decodificacion greedy, modo de pensamiento desactivado y limite de 2 048 tokens nuevos. El autor advierte que no son puntuaciones oficiales sobre los datasets de origen y que la exportacion publica del dataset excluye campos de puntuacion privados.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano del modelo base (aproximadamente 9 000 millones de parametros) y no proceden de la model card.

- VRAM para el adaptador aislado: 0,4 GB de pesos, pero la inferencia requiere cargar el modelo base completo.
- VRAM estimada para el base en precision completa: del orden de 18 GB en fp16/bf16, mas overhead de activaciones y cache KV.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 9-10 GB.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 5-6 GB, sin contar activaciones ni contexto largo.
- GPU profesionales recomendadas: A100, H100 o L40S para despliegue en bf16 con lotes concurrentes.
- GPU de consumo: es plausible que quepa en tarjetas con 12-16 GB o mas usando cuantizacion de 4 bits (por ejemplo, RTX 4090, RTX 4080, RTX 3090), aunque no se ha verificado en la informacion disponible.
- Opciones de despliegue: PEFT sobre Transformers para fusionar el adaptador, vLLM o TGI tras fusionar los pesos, llama.cpp u Ollama previa conversion a GGUF. No se documentan en la model card.
- Latencia y throughput: no disponibles. El unico dato operativo es el limite de 2 048 tokens nuevos empleado en la evaluacion local.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. La comparacion mas directa posible es con su propio modelo base, Qwen/Qwen3.5-9B-Base, pero el autor no publica cifras del base en el mismo conjunto de evaluacion.

| Modelo | Parametros | Contexto | Rendimiento en el conjunto del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FSG-RL-Feedback-GRPO | LoRA sobre base de ~9 000 M | no disponible | 69,00 % respuesta final; 53,50 % exito estricto | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B-Base | ~9 000 M (segun nomenclatura) | no disponible | no disponible | no disponible | HuggingFace (referenciado como base) |
| Otros adaptadores FSG-RL anteriores | no disponible | no disponible | no disponible | no disponible | mencionados por el autor, no detallados |

## Limitaciones y advertencias

- Licencia no especificada: sin licencia declarada, el uso comercial y la redistribucion quedan en un limbo legal; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Entrenamiento sobre un conjunto muy reducido: el ajuste se realiza sobre 60 problemas de entrenamiento, lo que eleva el riesgo de sobreajuste y de baja generalizacion fuera del dominio evaluado.
- Evaluacion no estandarizada: las cifras de 69,00 % y 53,50 % proceden de un conjunto propio y no de benchmarks publicos, por lo que no son comparables directamente con resultados de MMLU, GSM8K o similares.
- Trazabilidad limitada: el autor indica que el dataset exportado excluye campos privados de puntuacion, de modo que parte del pipeline de evaluacion no es auditable externamente.
- Ausencia de datos de sesgo e idioma: no se declaran idiomas soportados ni evaluaciones de sesgo.
- Riesgo de alucinacion: es un modelo de razonamiento matematico; puede producir cadenas de solucion plausibles con resultados incorrectos, especialmente fuera del dominio de los problemas duros de entrenamiento.
- Dependencia del modelo base: el adaptador no incluye Qwen/Qwen3.5-9B-Base, por lo que su comportamiento depende de la version exacta de los pesos base y de su tokenizador.
- Configuracion de inferencia acotada: la evaluacion se hizo con decodificacion greedy, pensamiento desactivado y 2 048 tokens nuevos; se desconoce si otras configuraciones mejoran o degradan el rendimiento.
- Repositorio de codigo incompleto: el repositorio FSG-RL en GitHub indica "code coming soon", por lo que la reproducibilidad total del entrenamiento no es posible hoy.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZihanLiummyycc/FSG-RL-Feedback-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio FSG-RL en GitHub: https://github.com/ZihanLiummyycc/FSG-RL
- README del repositorio FSG-RL: https://github.com/ZihanLiummyycc/FSG-RL/blob/main/README.md
- Documentacion de PEFT: no disponible en la busqueda realizada
- Paper asociado: no disponible en la informacion proporcionada
