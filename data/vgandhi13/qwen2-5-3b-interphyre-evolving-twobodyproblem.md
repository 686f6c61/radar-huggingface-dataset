# vgandhi13/Qwen2.5-3B-Interphyre-Evolving-TwoBodyProblem

## Resumen

Qwen2.5-3B-Interphyre-Evolving-TwoBodyProblem es un ajuste fino del modelo Qwen/Qwen2.5-3B-Instruct realizado por el usuario vgandhi13 mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization). El entrenamiento se llevó a cabo sobre el entorno de puzles de física Interphyre, concretamente en el nivel `two_body_problem`, y combina la optimización de política basada en gradientes con un banco de habilidades ("skill bank") que evoluciona durante el entrenamiento y se inyecta en el contexto del modelo.

El modelo está pensado para operar dentro del bucle de herramientas ReAct de Interphyre, donde el banco de habilidades evolucionado debe anteponerse al prompt de sistema en el momento de la inferencia. Se trata, por tanto, de un modelo especializado en razonamiento físico y uso de herramientas para resolver problemas de mecánica de dos cuerpos, no de un modelo de propósito general.

Con 3.397.103.616 parámetros (aproximadamente 3,4 mil millones) y licencia Apache 2.0, el modelo hereda la arquitectura transformer densa de Qwen2.5-3B-Instruct y su ventana de contexto. Su relevancia es acotada: es un artefacto de investigación sobre acumulación de habilidades en contexto combinada con RL, con solo 5 descargas y 0 likes en el momento de la consulta, lo que indica un uso experimental más que de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2, decoder-only), ajustado con GRPO |
| Parametros totales | 3.397.103.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors, cuantificable a GGUF/AWQ por herramientas externas) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de aproximadamente 3,4 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con GRPO, un algoritmo de aprendizaje por refuerzo sin modelo crítico (critic-free) que estima la ventaja relativa dentro de grupos de muestras generadas para la misma consulta. El entorno de entrenamiento es Interphyre, un conjunto de puzles de física con una interfaz de herramientas tipo ReAct, y el nivel concreto abordado es `two_body_problem`.

La innovación destacable es el uso de un banco de habilidades evolutivo: durante el entrenamiento, las habilidades se actualizan y se inyectan en el contexto del modelo, de modo que se combina la optimización de política basada en gradientes con la acumulación de habilidades en contexto. En inferencia, ese banco de habilidades evolucionado debe anteponerse al prompt de sistema para reproducir las condiciones de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de RLHF o DPO más allá del propio GRPO.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Qwen2.5-3B-Instruct.
- Razonamiento físico aplicado a puzles de mecánica, específicamente el escenario de dos cuerpos del entorno Interphyre.
- Uso de herramientas (tool calling) dentro del bucle ReAct de Interphyre.
- Razonamiento multi-paso orientado a agentes, con acumulación de habilidades en contexto mediante el banco de habilidades.
- Aprendizaje por refuerzo especializado: la política está optimizada para la recompensa del entorno Interphyre en el nivel `two_body_problem`.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido ("thinking mode") en la información disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo con acumulación de habilidades: el modelo sirve como referencia reproducible para estudiar cómo un banco de habilidades inyectado en contexto interactúa con la optimización GRPO en tareas de razonamiento físico.
- Resolución de puzles de mecánica de dos cuerpos: integrado en el bucle ReAct de Interphyre, el modelo puede invocar herramientas del entorno para calcular posiciones, velocidades y trayectorias en el escenario `two_body_problem`.
- Evaluación de agentes con tool use en entornos simulados: útil para medir la capacidad de un modelo de 3B de encadenar llamadas a herramientas bajo restricciones físicas.
- Baseline para experimentos de RL sobre modelos pequeños: al partir de Qwen2.5-3B-Instruct con licencia Apache 2.0, permite comparar variantes de GRPO con y sin banco de habilidades evolutivo.
- Prototipado de asistentes científicos de dominio acotado: en un pipeline de investigación, puede emplearse para generar borradores de pasos de resolución física que luego se validan con un solver simbólico o numérico.
- Estudio de generalización fuera de distribución: permite analizar si las habilidades acumuladas en `two_body_problem` transfieren a otros niveles de Interphyre o a problemas de física relacionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 3,5-4 GB para pesos; en 4 bits, alrededor de 2-2,5 GB para pesos.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluación a gran escala; RTX 4090, RTX 3090 o A10G para inferencia en FP16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con FP16 y en GPUs de 8-12 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (según el ejemplo de la model card con `device_map="auto"`), vLLM, TGI y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo denso de 3,4B, se espera un throughput alto en GPUs modernas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-3B-Interphyre-Evolving-TwoBodyProblem | 3,4B | No disponible | RL + razonamiento fisico en Interphyre | Apache 2.0 | Hugging Face (5 descargas) |
| Qwen/Qwen2.5-3B-Instruct | 3,4B | No disponible en esta ficha | Instrucciones generales | Apache 2.0 | Hugging Face (ampliamente usado) |
| Qwen2.5-7B-Instruct | 7,6B (aprox.) | No disponible en esta ficha | Instrucciones generales | Apache 2.0 | Hugging Face |

La comparación con Qwen2.5-3B-Instruct es la más directa, ya que es su modelo base: el ajuste GRPO añade especialización en el puzle de dos cuerpos a costa de un alcance mucho más estrecho. Frente a Qwen2.5-7B-Instruct, el modelo aquí descrito tiene la mitad de parámetros y una especialización muy concreta, por lo que no es un sustituto generalista. No se dispone de datos de benchmarks que permitan comparar rendimiento numérico entre estas alternativas.

## Limitaciones y advertencias

- Especialización extrema: el ajuste GRPO está orientado al nivel `two_body_problem` de Interphyre; el rendimiento fuera de ese entorno no está documentado y probablemente degrade las capacidades generales del modelo base.
- Dependencia del banco de habilidades: en inferencia debe anteponerse el banco de habilidades evolucionado al prompt de sistema; sin él, el comportamiento puede diferir del entrenado.
- Idioma: la model card declara únicamente inglés, aunque el modelo base Qwen2.5 es multilingüe; el ajuste puede haber mermado el rendimiento en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir pasos de razonamiento físico plausibles pero incorrectos; requiere validación con herramientas o solvers.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; al heredar el modelo base, arrastra los sesgos de sus datos de preentrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también las condiciones del modelo base y de Interphyre.
- Madurez: con 5 descargas y 0 likes, es un artefacto experimental sin validación comunitaria; no se recomienda su uso en producción sin evaluación propia.
- No se documentan la longitud de contexto efectiva, el número de tokens de entrenamiento ni métricas de evaluación, lo que dificulta estimar su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vgandhi13/Qwen2.5-3B-Interphyre-Evolving-TwoBodyProblem
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de Interphyre: https://github.com/sniekum/interphyre
