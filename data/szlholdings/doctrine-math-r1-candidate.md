# SZLHOLDINGS/doctrine-math-r1-candidate

## Resumen

`doctrine-math-r1-candidate` es un adaptador LoRA (PEFT) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. Se trata de un artefacto de investigación interna del denominado "estate" de SZLHOLDINGS, orientado a tareas de razonamiento matemático bajo una doctrina propia de evaluación ("doctrine-math"). No es un modelo preentrenado desde cero, sino un ajuste fino de bajo rango que debe cargarse junto con los pesos del modelo base para poder utilizarse.

El repositorio tiene un tamaño de 0,6 GB y contiene el adaptador en la subcarpeta `final/`. La model card es extremadamente escueta: no documenta composición del dataset de entrenamiento, hiperparámetros del LoRA, número de tokens vistos ni proceso de alineación (RLHF/DPO). El autor indica que la promoción del adaptador está restringida por el propietario ("owner-gated"), lo que sugiere que se trata de un candidato en evaluación y no de un artefacto destinado a uso general.

La relevancia del modelo es limitada fuera del contexto de su autor: se apoya en Qwen3-1.7B, un transformer denso de 1.700 millones de parámetros con ventana de contexto de 32.768 tokens (dato del modelo base, no confirmado en este repositorio), y hereda su licencia Apache 2.0. Su interés técnico reside en el sistema de "receipts" encadenados con el que el autor documenta cada evaluación, un enfoque poco habitual de trazabilidad de resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base tiene 1.700 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en este repositorio (el modelo base Qwen3-1.7B soporta 32.768 tokens) |
| Tipos de cuantización | no disponible (los pesos del adaptador se distribuyen en safetensors; la cuantización dependerá del modelo base al fusionarse) |
| Idiomas soportados | no disponibles (heredados del modelo base Qwen3-1.7B, multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT en la subcarpeta `final/`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango sobre Qwen/Qwen3-1.7B, un transformer decoder-only denso. No se especifican en la información disponible el rango del LoRA, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni la composición del dataset de ajuste. Tampoco se documenta si hubo una fase de alineación posterior (RLHF, DPO o similar).

La única información de entrenamiento y evaluación disponible es la "estate battery" medida en el nodo box198 el 2026-11-15: 4 de 6 pruebas superadas, incluida una abstención correcta ante una pregunta sin respuesta. El autor enlaza un recibo de evaluación (`receipts/eval_battery.json`) encadenado con el dataset `frontier-54-runs`. No hay más detalle técnico sobre el proceso de entrenamiento ni sobre innovaciones arquitectónicas propias; el adaptador no modifica la arquitectura del modelo base.

## Capacidades

- Generación de texto y razonamiento matemático, presumiblemente reforzado por el ajuste "doctrine-math", aunque no se detallan las tareas concretas cubiertas.
- Abstención ante preguntas sin respuesta: la evaluación reportada incluye una abstención correcta en una prueba no respondible, lo que sugiere cierto comportamiento calibrado de rechazo.
- Capacidades heredadas del modelo base Qwen3-1.7B (no verificadas en este repositorio): generación de código, matemáticas básicas, soporte multilingüe y posible modo de razonamiento extendido.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Evaluación interna de adaptadores matemáticos: el adaptador sirve como candidato en una batería de pruebas propia ("estate battery") para medir razonamiento matemático y abstención antes de una eventual promoción; es su uso declarado y el único documentado.
- Investigación sobre trazabilidad de evaluaciones: el sistema de "receipts" encadenados permite reproducir y auditar cada resultado de la batería, útil para equipos que estudian metodologías de evaluación reproducibles.
- Prototipado de asistentes matemáticos de bajo coste: al apoyarse en un modelo de 1.700 M de parámetros, puede desplegarse en hardware modesto para experimentar con respuestas a problemas aritméticos o algebraicos simples.
- Filtrado de consultas no respondibles: el comportamiento de abstención observado puede aprovecharse en pipelines que necesiten descartar preguntas fuera de dominio antes de derivarlas a un modelo mayor.
- Ajuste fino educativo: sirve como ejemplo práctico de cómo publicar un adaptador LoRA con licencia Apache 2.0 sobre Qwen3, útil para quienes aprenden el flujo PEFT.
- Integración en entornos de investigación con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su incorporación en proyectos académicos o comerciales, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, etc.) en la información disponible. El único dato de rendimiento es la batería interna del autor: 4 de 6 pruebas superadas en el nodo box198 el 2026-11-15, con una abstención correcta. No se especifica qué miden las seis pruebas ni cómo se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo de 1.700 M de parámetros, los requisitos vienen determinados por el modelo base. En fp16 se estiman en torno a 3,5-4 GB; en cuantización de 8 bits, unos 2 GB; en 4 bits, alrededor de 1,2-1,5 GB (estimaciones para el modelo base, no confirmadas en este repositorio).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para el modelo base en fp16 o cuantizado; para despliegues con mayor concurrencia, A100 o H100 no son necesarias por tamaño, pero pueden aportar throughput.
- Cabe en GPU consumer: sí, con holgura, siempre que se disponga de al menos 4-6 GB de VRAM para el modelo base fusionado con el adaptador.
- Opciones de despliegue: el adaptador PEFT puede cargarse con la librería `peft` y `transformers`; para servir en producción puede fusionarse con el modelo base y desplegarse con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama. No se documentan configuraciones probadas por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| doctrine-math-r1-candidate | Adaptador sobre 1.700 M | no disponible (base: 32.768) | Apache 2.0 | Hugging Face, promoción restringida por el autor | Adaptador LoRA de investigación, sin benchmarks públicos |
| Qwen/Qwen3-1.7B | 1.700 M | 32.768 | Apache 2.0 | Hugging Face | Modelo base; referencia directa de comparación |
| Adaptadores matemáticos sobre modelos pequeños (p. ej. Qwen2.5-Math-1.5B) | ~1.500 M | 32.768 (Qwen2.5) | Apache 2.0 | Hugging Face | Alternativa orientada a matemáticas con benchmarks publicados; no se dispone de comparación directa con este adaptador |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No se documentan datos de entrenamiento, hiperparámetros ni proceso de alineación, lo que impide evaluar sesgos y comportamientos no deseados.
- Riesgo de alucinación: inherente a los modelos de 1.700 M de parámetros; la única evidencia de calibración es una abstención correcta en una prueba interna.
- El tamaño reducido del modelo base limita el razonamiento matemático complejo y el contexto efectivo en tareas de múltiples pasos.
- Idiomas soportados no declarados en este repositorio; deben asumirse los del modelo base, sin garantía.
- La licencia Apache 2.0 del adaptador no exime de cumplir la licencia del modelo base Qwen3-1.7B al redistribuir o fusionar pesos.
- La promoción está restringida por el propietario ("owner-gated"): el artefacto es un candidato en evaluación, no un modelo validado para producción.
- La evaluación reportada (4/6) procede de una batería interna no estandarizada y no es comparable con benchmarks públicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/doctrine-math-r1-candidate
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Recibo de evaluación: https://huggingface.co/SZLHOLDINGS/doctrine-math-r1-candidate/blob/main/receipts/eval_battery.json
- Dataset de referencia: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/mass-battery-doctrine_math_r1_trained.json
