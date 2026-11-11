# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step120

## Resumen

Safety_Tuning-Qwen3.5-4B-GRPO-STAR es un ajuste fino del modelo multimodal Qwen/Qwen3.5-4B orientado a alineamiento de seguridad, desarrollado por el usuario thkim0305-SNU. El modelo parte de la base Qwen3.5-4B, una arquitectura de tipo transformer con capacidad image-text-to-text, y aplica un entrenamiento con GRPO (Group Relative Policy Optimization) sobre prompts del dataset STAR, empleando un profesor Qwen3.8-27B para el scoring de las respuestas y una referencia congelada del modelo original para la penalizacion KL.

El checkpoint publicado corresponde a la actualizacion de optimizador numero 120, con un learning rate de 1e-6, coeficiente KL de 0.001, 16 prompts por actualizacion y 8 respuestas por prompt. El objetivo declarado es el safety tuning: reducir respuestas inseguras o daninas manteniendo el comportamiento del modelo base, mediante refuerzo con recompensas derivadas de un modelo profesor de mayor tamano.

Es relevante porque documenta una linea de entrenamiento reproducible sobre un modelo multimodal de 4.66 mil millones de parametros con licencia Apache 2.0, e incluye verificacion de conversion de tensores (738 claves y formas coincidentes con el checkpoint nativo). No obstante, el autor no aporta puntuaciones de evaluacion, por lo que su eficacia real en seguridad no esta cuantificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5 |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-4B, un transformer multimodal que procesa entradas de imagen y texto y genera texto. El entrenamiento se realizo con GRPO, un algoritmo de optimizacion de politica proximal relativa a grupos que no requiere un modelo critico separado: se generan 8 respuestas por prompt (k=8) sobre 16 prompts por actualizacion (p=16), y las recompensas provienen de un profesor Qwen3.8-27B que puntua las respuestas. Se mantiene una referencia congelada del modelo original con coeficiente KL de 0.001 para limitar la deriva respecto a la distribucion base.

Los prompts de entrenamiento proceden de los datasets UCSC-VLAA/STAR-1 y UCSC-VLAA/STAR-benign-915. El autor documenta que el prompt de "judge-footer" cambio tras la actualizacion 44 y que la ejecucion reanudada desde el paso 90 acepta un JSON de puntuacion plana final despues del texto del profesor. La revision base es `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` y la ejecucion fuente es `qwen35-star-grpo-4gpu-resume90-trailingjson-20261108-v8`. El checkpoint nativo corresponde a la iteracion 119 (base cero). Los tensores de vision y los tensores MTP no entrenados se conservan del modelo base original; el MTP no fue entrenado. La conversion incluye verificacion de conversion inversa exacta de cada tensor de texto nativo, comprobacion de pesos finitos y coincidencia de las 738 claves y formas de tensores de Hugging Face.

## Capacidades

- Generacion de texto conversacional multi-turno sobre la base Qwen3.5-4B.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), heredado del modelo base.
- Razonamiento y respuesta a instrucciones con comportamiento modulado por safety tuning.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Moderacion y filtrado de contenido generado: el modelo puede emplearse como clasificador generativo de respuestas potencialmente inseguras en pipelines de moderacion, aprovechando el ajuste GRPO orientado a reducir salidas daninas.
- Asistente conversacional con requisitos de seguridad: en despliegues de atencion al usuario donde se exige un comportamiento conservador ante peticiones sensibles, el checkpoint ofrece una alternativa afinada sobre Qwen3.5-4B con licencia Apache 2.0.
- Investigacion en alineamiento: sirve como punto de comparacion reproducible para estudiar el efecto de GRPO con profesor externo y referencia KL sobre un modelo de 4.66B, dado que el autor documenta hiperparametros, linaje de ejecucion y verificacion de conversion.
- Evaluacion de robustez multimodal: al conservar los tensores de vision del modelo base, permite estudiar si el safety tuning sobre texto altera el comportamiento ante entradas imagen-texto.
- Generacion asistida en entornos con recursos limitados: con 4.66B de parametros, es viable en una unica GPU de gama alta para prototipado e inferencia por lotes.
- Base para ajustes posteriores: al estar en safetensors y transformers con licencia permisiva, puede servir como punto de partida para fine-tuning especifico de dominio con restricciones de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se afirman puntuaciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9.3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 16-24 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB para pesos; en 4 bits, en torno a 3 GB para pesos (cuantizaciones no publicadas por el autor, requeririan conversion propia).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16 sin cuantizar; RTX 3090/4080 para cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16, y en tarjetas de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI si la arquitectura qwen3_5 esta soportada por esas herramientas; llama.cpp/Ollama requeririan conversion a GGUF no publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-GRPO-STAR | 4.66B | No disponible | Image-text-to-text | Apache 2.0 | Ajuste GRPO de seguridad, sin benchmarks publicados |
| Qwen/Qwen3.5-4B (base) | 4.66B | No disponible | Image-text-to-text | Apache 2.0 | Modelo original sin safety tuning; referencia congelada del entrenamiento |
| Qwen3.8-27B (profesor) | 27B (aproximado) | No disponible | No disponible | No disponible | Usado como profesor de scoring en el entrenamiento; no es un modelo desplegable comparable en coste |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad ni de capacidad; la eficacia del safety tuning no esta cuantificada.
- Riesgo de alucinacion inherente al modelo base Qwen3.5-4B, no mitigado especificamente por el ajuste GRPO.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados no declarados; el comportamiento multilingue no esta verificado.
- Longitud de contexto no especificada.
- El linaje de entrenamiento incluye un cambio de prompt de evaluacion tras la actualizacion 44 y una reanudacion desde el paso 90, lo que introduce heterogeneidad en la senal de recompensa entre tramos.
- Los tensores de vision y MTP no fueron entrenados; el ajuste afecta principalmente a los tensores de texto.
- El repositorio excluye estado del optimizador, RNG, logs y ejemplos de entrenamiento, lo que limita la reproducibilidad exacta del proceso.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni evaluaciones de idoneidad para produccion.
- Modelo con 15 descargas y 0 likes: ecosistema minimo, sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-GRPO-STAR-lr1e-6-kl0.001-p16-k8-step120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset STAR-1: https://huggingface.co/datasets/UCSC-VLAA/STAR-1
- Dataset STAR-benign-915: https://huggingface.co/datasets/UCSC-VLAA/STAR-benign-915
