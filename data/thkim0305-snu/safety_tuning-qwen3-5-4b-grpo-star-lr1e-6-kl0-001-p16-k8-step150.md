# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step150

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR es un ajuste fino (fine-tuning) del modelo multimodal Qwen/Qwen3.5-4B orientado a la alineacion de seguridad. Lo publica el usuario thkim0305-SNU y emplea GRPO (Group Relative Policy Optimization) como algoritmo de aprendizaje por refuerzo, con prompts del dataset STAR-1 y un modelo profesor Qwen3.8-27B que actua como evaluador. El checkpoint corresponde a la actualizacion 150 del optimizador, con un coeficiente KL de 0,001 frente al modelo original congelado.

El modelo conserva la naturaleza multimodal del base (pipeline image-text-to-text) y anade un entrenamiento especifico para reducir respuestas inseguras. El repositorio incluye unicamente pesos de inferencia, configuracion y assets de tokenizer/procesador; no contiene estado del optimizador, RNG ni logs de entrenamiento. La model card no declara ningun resultado de evaluacion, por lo que el rendimiento en seguridad no esta verificado publicamente.

Con 4.659.865.088 parametros (aproximadamente 4,66 mil millones) y licencia Apache 2.0, es un modelo de tamano contenido que puede desplegarse en GPUs de gama alta consumer. Su interes actual radica en ser un ejemplo documentado de safety tuning con RL sobre un modelo multimodal pequeno, aunque su madurez y validacion son limitadas (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-4B; incluye torres de vision y MTP (multi-token prediction) heredadas del base |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B (revision `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`), un transformer multimodal con capacidad de procesar imagen y texto. Sobre esa base se aplica GRPO, un algoritmo de RL sin modelo critico que estima ventajas relativas dentro de un grupo de respuestas generadas por prompt. La configuracion registrada es: learning rate 1e-6, 150 actualizaciones del optimizador, coeficiente KL 0,001, 16 prompts por actualizacion y 8 respuestas por prompt. El calculo de recompensa lo realiza un modelo profesor Qwen3.8-27B, y la referencia KL es el modelo original congelado.

El entrenamiento usa prompts de los datasets UCSC-VLAA/STAR-1 y UCSC-VLAA/STAR-benign-915. La model card documenta dos particularidades de linaje: el prompt de evaluacion (judge-footer) cambio tras la actualizacion 44, y la ejecucion se reanudo desde el paso 90 (`qwen35-star-grpo-4gpu-resume90-trailingjson-20261108-v8`) aceptando un JSON plano de puntuacion final tras el texto del profesor. Solo se exportaron los tensores de texto entrenados; los tensores de vision y los MTP no entrenados se conservan del modelo base fijado. La conversion se verifico con conversion inversa exacta de cada tensor de texto, comprobacion de pesos finitos y coincidencia de las 738 claves y formas de Hugging Face.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen3.5-4B.
- Procesamiento de imagen y texto (pipeline image-text-to-text): entrada multimodal con salida textual.
- Alineacion de seguridad entrenada mediante GRPO con recompensa de un profesor de 27B, orientada a reducir respuestas daninas.
- Razonamiento y generacion de codigo y matematicas: capacidades propias del base, no verificadas especificamente en este checkpoint.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (los idiomas no se declaran).
- MTP (multi-token prediction) presente en la arquitectura pero no entrenado en este ajuste.

## Casos de uso

- Moderacion y filtrado de contenido multimodal: el modelo puede clasificar o reescribir respuestas potencialmente inseguras en pipelines de atencion al cliente, aprovechando el ajuste GRPO sobre prompts STAR.
- Investigacion en safety tuning: sirve como checkpoint de referencia para estudiar el efecto de GRPO con profesor externo y coeficiente KL bajo (0,001) sobre un modelo de 4B.
- Prototipado de asistentes con vision: al conservar la torre de vision del base, permite experimentar con descripcion de imagenes y dialogos sobre contenido visual en entornos de laboratorio.
- Generacion de respuestas seguras en dominios sensibles: util como capa de reescritura sobre otro modelo generador para reducir contenido danino antes de la entrega al usuario final.
- Evaluacion de robustez de alineacion: comparar este checkpoint con el Qwen3.5-4B original para medir deriva de comportamiento y utilidad tras el RL.
- Despliegue en hardware limitado: con 4,66 B de parametros, es viable en una GPU consumer de gama alta para inferencia de prototipo, aunque requiere cuantizacion previa no incluida en el repo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirman puntuaciones de evaluacion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia de orden de magnitud para 4,66 B en safetensors de precision completa/bf16, el repo ocupa 9,3 GB, por lo que la inferencia en bf16 requiere aproximadamente 10-12 GB de VRAM mas overhead de activaciones y cache KV.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una RTX 4090 (24 GB) o A100/H100 son suficientes en bf16; GPUs de 16 GB requeririan cuantizacion.
- Cabe en GPU consumer: previsiblemente si en RTX 4090 y modelos con 24 GB o mas; en GPUs de 16 GB solo con cuantizacion, que no se distribuye en el repo.
- Opciones de despliegue: transformers (libreria declarada). vLLM, llama.cpp, Ollama o TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Safety tuning | Disponibilidad |
|---|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR (este) | 4,66 B | no disponible | imagen-texto | Apache 2.0 | Si (GRPO + STAR) | HF, 0 descargas |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | imagen-texto | no disponible | No | HF (modelo base) |
| Qwen3.8-27B (profesor del RL) | no disponible | no disponible | no disponible | no disponible | No (usado como evaluador) | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad ni de utilidad; el efecto real del ajuste GRPO no esta verificado.
- El linaje de entrenamiento presenta cambios de prompt a mitad de ejecucion (tras el paso 44) y una reanudacion desde el paso 90, lo que puede introducir inconsistencia en la senal de recompensa.
- El coeficiente KL de 0,001 es bajo, por lo que el riesgo de deriva respecto al base (perdida de capacidades o comportamientos no deseados) no es despreciable.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en este checkpoint.
- Idiomas soportados no declarados; no se garantiza cobertura multilingue.
- Longitud de contexto no disponible; no apto para tareas que requieran ventanas largas sin verificacion previa.
- Los tensores de vision y MTP no fueron entrenados: el ajuste de seguridad afecta solo a los tensores de texto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene 0 descargas y 0 likes, sin validacion de la comunidad.
- No se distribuyen pesos cuantizados ni estado de entrenamiento, lo que dificulta la reproducibilidad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step150
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
