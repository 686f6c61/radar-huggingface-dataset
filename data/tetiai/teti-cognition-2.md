# tetiai/teti-cognition-2

## Resumen

teti-cognition-2 es un clasificador de texto multilingue desarrollado por tetiai que analiza conversaciones entre una persona y un asistente de IA para medir cómo piensa el usuario: si delega su razonamiento en el modelo, si intenta comprender, si verifica lo que la IA responde. No genera texto; cada valor proviene de un unico forward pass de un clasificador compacto derivado de jhu-clsp/mmBERT-small, con 113 MB en int8 y 81 MB en int4.

La propuesta central es el concepto de "descarga cognitiva" (cognitive offloading): el modelo produce, por cada mensaje del usuario, etiquetas de delegacion (none/routine/cognitive), motivacion (intrinsic/instrumental/avoidance), profundidad y probabilidades de razonamiento propio, aprendizaje, verificacion, metacognicion, aplicacion y contenido danino. Ademas agrega un indice de delegacion de 0 a 100 por conversacion, una tendencia (up/stable/down/na) y cinco niveles de 0 a 4.

Su relevancia actual reside en que procesa conversaciones en streaming con memoria constante: cada mensaje nuevo cuesta lo mismo sea el primero o el numero 10.000, y ha sido probado sobre un historial real de 1M de tokens. Corre en CPU, sin GPU, y ningun dato sale de la maquina. Frente a la v1 (4,4 GB con llama.cpp), la v2 reduce el tamano a ordenes de magnitud menores y mejora la precision de delegacion de 0,814 a 0,842 en el mismo test publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador transformer encoder (derivado de jhu-clsp/mmBERT-small) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | streaming con memoria constante; probado sobre 1M de tokens |
| Tipos de cuantizacion | int8 (113 MB), int4 (81 MB), ONNX (117 MB) |
| Idiomas soportados | 29 idiomas: en, zh, ru, it, es, fr, pt, de, ja, ko, ar, tr, pl, nl, vi, id, hi, fa, uk, cs, sv, he, el, th, ro, hu, fi, da, bn, bg |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors, ONNX, PyTorch |

## Arquitectura y entrenamiento

El modelo es un clasificador basado en un transformer encoder (mmBERT-small) afinado para multiples cabeceras de clasificacion: tres tareas de clasificacion multiclase (delegation, motivation, depth) y seis salidas probabilisticas (own_reasoning, learning, verification, metacognition, application, harmful). Sobre estas salidas se calculan agregados por conversacion (delegation_index, trend, levels y scores) actualizados en cada mensaje del usuario.

El entrenamiento utiliza el dataset allenai/WildChat-4.8M y un conjunto de evaluacion propio (tetiai/teti-cognition-eval). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF/DPO; al tratarse de un clasificador, el ajuste se realiza presumiblemente mediante aprendizaje supervisado con etiquetas derivadas de la guia de etiquetado de la v1. La innovacion tecnica destacable es el procesamiento en streaming con memoria constante, que evita el crecimiento cuadratico del contexto y permite analizar historiales de 1M de tokens sin requisitos de VRAM.

## Capacidades

- Clasificacion de mensajes de usuario en conversaciones con asistentes de IA: delegacion (none/routine/cognitive), motivacion (intrinsic/instrumental/avoidance), profundidad (minimal/basic/articulated).
- Salidas probabilisticas por mensaje: razonamiento propio, aprendizaje, verificacion, metacognicion, aplicacion y contenido danino.
- Calculo del indice de delegacion (0-100) por conversacion, actualizado en cada mensaje.
- Deteccion de tendencia (up/stable/down/na) comparando la segunda mitad de la conversacion con la primera.
- Cinco niveles de 0 a 4 (autonomy, learning, engagement, metacognition, verification) con sus scores continuos.
- Procesamiento en streaming con memoria constante sobre historiales largos (probado en 1M de tokens).
- Multilingue en 29 idiomas.
- No genera texto: todas las salidas son clasificaciones y probabilidades.
- Ejecucion en CPU o GPU con PyTorch u ONNX Runtime.

## Casos de uso

- Analisis de interacciones humano-IA en investigacion: medir como evoluciona la dependencia cognitiva de los usuarios a lo largo de conversaciones largas, usando el indice de delegacion y la tendencia para estudiar patrones de descarga cognitiva en estudios longitudinales.
- Monitorizacion de productos educativos con IA: integrar el clasificador en tutores inteligentes para detectar cuando el alumno delega el razonamiento (delegation=cognitive) en lugar de aprender, y activar intervenciones pedagogicas cuando el nivel de autonomia baja.
- Evaluacion de calidad de asistentes conversacionales: analizar transcripciones para cuantificar si los usuarios verifican las respuestas de la IA, con la salida verification y el nivel correspondiente, como metrica complementaria a las evaluaciones de satisfaccion.
- Moderacion y seguridad: usar la probabilidad de harmful por mensaje como senal adicional en pipelines de moderacion, combinada con otros clasificadores, para detectar violaciones de politica de contenido en conversaciones multilingues.
- Investigacion en interaccion humano-IA: procesar corpus de conversaciones (por ejemplo WildChat) en local sin enviar datos a terceros, gracias a la ejecucion en CPU y al procesamiento en streaming con memoria constante.
- Analitica de producto para plataformas de IA: calcular agregados por sesion (delegation_index medio, distribucion de niveles) para entender que segmentos de usuarios usan la IA para tareas rutinarias frente a tareas cognitivas.
- Despliegue en entornos con privacidad estricta: analizar conversaciones sensibles en el propio dispositivo (portatiles, estaciones de trabajo sin GPU) gracias a los 81-117 MB del modelo y a la ausencia de llamadas externas.

## Benchmarks y rendimiento

La model card reporta una comparacion directa con la version anterior sobre el mismo test publico:

| Metrica | teti-cognition-1 | teti-cognition-2 |
|---|---|---|
| Precision de delegacion (mismo test publico) | 0,814 | 0,842 |
| Tamano del modelo | 4,4 GB + llama.cpp | 113 MB (int8) / 81 MB (int4) / 117 MB (ONNX) |
| Hardware | GPU con llama.cpp | CPU o GPU (PyTorch / ONNX Runtime) |
| Contexto largo | 32k tokens por defecto; 1M requiere ~45 GB de VRAM | streaming con memoria constante; probado en 1M de tokens |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el modelo es un clasificador y no un generador de texto.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; 81 MB (int4), 113 MB (int8) y 117 MB (ONNX) de memoria, ejecutable en CPU.
- GPU recomendadas: no aplica; cualquier GPU es suficiente si se desea aceleracion, pero el modelo esta disenado para CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos de bajos recursos; no necesita GPU dedicada.
- Opciones de despliegue: PyTorch, ONNX Runtime; compatible con entornos de inferencia en CPU.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card indica que cada mensaje nuevo cuesta lo mismo independientemente de la posicion en la conversacion (streaming con memoria constante).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| teti-cognition-2 | no disponible (113 MB int8) | streaming, probado 1M tokens | Clasificador de descarga cognitiva | BSD-3-Clause | Hugging Face |
| teti-cognition-1 | no disponible (4,4 GB) | 32k por defecto; 1M con ~45 GB VRAM | Clasificador de descarga cognitiva (v1) | no disponible | Hugging Face |
| jhu-clsp/mmBERT-small | no disponible | no disponible | Encoder multilingue base | no disponible | Hugging Face |

No se dispone de informacion sobre otros clasificadores comparables de analisis de delegacion cognitiva en conversaciones.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas; solo clasifica y estima probabilidades.
- Las etiquetas dependen de la guia de etiquetado de la v1; la calidad de las predicciones esta acotada por la subjetividad de las definiciones (por ejemplo, que cuenta como "delegacion cognitiva").
- Riesgo de alucinacion no aplica en el sentido generativo, pero las probabilidades pueden ser incorrectas en conversaciones ambiguas o fuera de distribucion.
- El rendimiento en idiomas distintos del ingles y de los idiomas mejor representados en WildChat puede ser inferior; la model card no reporta metricas por idioma.
- La licencia BSD-3-Clause permite uso comercial con atribucion, pero conviene revisar las condiciones del modelo base (mmBERT-small) y de los datasets utilizados.
- El indice de delegacion es una construccion heuristica (0-100) y no una medida psicometrica validada; no debe usarse como diagnostico individual.
- La deteccion de contenido danino (harmful) es una senal adicional, no un moderador autonomo.
- No se han publicado evaluaciones independientes ni benchmarks estandar; la unica comparacion disponible es con la v1 en el test publico del autor.

## Enlaces

- Hugging Face: https://huggingface.co/tetiai/teti-cognition-2
- Modelo v1: https://huggingface.co/tetiai/teti-cognition-1
- Guia de etiquetado v1: https://huggingface.co/tetiai/teti-cognition-1/blob/main/data/LABELING.md
- Ejemplo de salida (italiano): https://huggingface.co/tetiai/teti-cognition-1/blob/main/examples/delegation_it.json
- Dataset de evaluacion: https://huggingface.co/datasets/tetiai/teti-cognition-eval
- Dataset de entrenamiento: https://huggingface.co/datasets/allenai/WildChat-4.8M
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
