# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft16800-opd880-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft16800-opd880-lora es un adaptador LoRA desarrollado por uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El adaptador se entrena en dos fases consecutivas: primero un ajuste supervisado (SFT) de 16.800 actualizaciones y despues una destilacion on-policy (OPD) de 880 actualizaciones, usando como profesor congelado Qwen/Qwen2.5-3B-Instruct. El objetivo es especializar un modelo pequeno de 0,5B parametros en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes.

El modelo resuelve un problema concreto en el ambito de los agentes: la generacion fiable de llamadas a funciones con formato estructurado y la decision de no invocar herramientas cuando no procede. Se apoya en el dataset mixto uygarkurt/xlam-tool-calling-mixed y se entrena con la herramienta Post-Training Lab del mismo autor. Es relevante para quienes necesitan desplegar agentes de bajo coste en entornos con recursos limitados, ya que el modelo base de 0,5B cabe en practicamente cualquier GPU.

La relevancia practica del adaptador reside en su tamano reducido combinado con una especializacion clara en function calling. No obstante, los resultados de evaluacion publicados muestran un rendimiento moderado en conocimiento general (MMLU 38,78%) y matematicas (MATH-500 16,20%), lo que lo posiciona como una pieza especializada dentro de un pipeline mayor y no como un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0,5B (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct; el entrenamiento limito los prompts a 640 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El entrenamiento se realizo en dos etapas sobre el dataset uygarkurt/xlam-tool-calling-mixed. La primera etapa consistio en 16.800 actualizaciones de ajuste supervisado (SFT) con una duracion de 2,7 horas. La segunda etapa continuo el adaptador SFT con 880 actualizaciones de destilacion on-policy (OPD) durante 0,3 horas, en las que el estudiante aprende de las probabilidades por token que genera un profesor congelado, Qwen/Qwen2.5-3B-Instruct, sobre sus propias respuestas generadas.

La innovacion tecnica principal es la combinacion de SFT y OPD para ensenar simultaneamente tool calling estructurado y abstencion ante herramientas irrelevantes. El adaptador OPD se carga directamente sobre el modelo base original, sin necesidad de cargar por separado el adaptador SFT previo. El entrenamiento se realizo con Post-Training Lab, la herramienta del autor, y las evaluaciones xLAM se hicieron con scripts personalizados del mismo repositorio. No se especifica la composicion completa del dataset ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling estructurado: genera llamadas a funciones con nombres de funcion y argumentos.
- Abstencion ante herramientas irrelevantes: el modelo puede decidir no invocar ninguna herramienta cuando las ofrecidas no son pertinentes.
- Razonamiento basico y matematicas elementales, con rendimiento limitado (MATH-500 16,20%).
- Seguimiento de instrucciones moderado (IFEval 29,02%).
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Agentes de function calling en produccion: el adaptador esta especializado en generar llamadas estructuradas a herramientas, lo que permite integrarlo en orquestadores de agentes que necesiten un modelo ligero para la fase de seleccion y parametrizacion de funciones.
- Enrutamiento de consultas con abstención: gracias a la capacidad de detectar irrelevancia, puede usarse como primera capa que decide si una consulta requiere invocar una herramienta o debe responderse directamente, reduciendo llamadas innecesarias.
- Despliegue en dispositivos con recursos limitados: al ser un adaptador sobre un modelo de 0,5B, cabe en GPUs de consumo y en entornos edge donde no es viable un modelo mayor.
- Prototipado rapido de pipelines de agentes: permite validar la logica de tool calling y abstencion antes de escalar a modelos mayores, con un coste de inferencia minimo.
- Clasificacion y extraccion de parametros: la precision en nombres de funcion (xLAM FNA 95,99%) lo hace util para tareas de mapeo de intenciones a funciones concretas.
- Filtrado previo en sistemas RAG con herramientas: puede decidir si una consulta debe resolverse mediante recuperacion o mediante una llamada a funcion, actuando como router ligero.

## Benchmarks y rendimiento

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Adaptador SFT inicial | SFT 16.800 | 38,44% | 18,40% | 28,10% | 83,11% | 97,80% | 56,02% | 83,33% | 67,47% | 2,7 |
| SFT + OPD (este adaptador) | OPD 880 | 38,78% | 16,20% | 29,02% | 81,66% | 95,99% | 59,25% | 100,00% | 29,41% | 3,0 |

Las puntuaciones xLAM corresponden al split de test del dataset mixto, con 2.546 ejemplos evaluados y 743 descartados por el limite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance reportan los subconjuntos de relevancia seleccionados. IFEval usa precision estricta a nivel de prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en precision completa ocupa aproximadamente 1 GB; en cuantizacion de 8 bits o 4 bits, por debajo de 1 GB. El adaptador LoRA anade un coste minimo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100 o H100 sin problemas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU de consumo moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers con PEFT, vLLM, llama.cpp (tras conversion a GGUF), Ollama y TGI. La model card solo documenta el uso con transformers y PEFT.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
| --- | --- | --- | --- | --- |
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B | no disponible | Tool calling y abstencion | no disponible |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | Proposito general | Apache 2.0 (segun el modelo base) |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | no disponible | Proposito general | Apache 2.0 (segun el modelo base) |

No se dispone de datos de benchmarks comparativos con otros adaptadores de tool calling en la informacion proporcionada. La comparacion con el modelo base y con el profesor es estructural, no de rendimiento medido en las mismas condiciones.

## Limitaciones y advertencias

- El modelo esta entrenado y evaluado unicamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- El rendimiento en conocimiento general y matematicas es bajo (MMLU 38,78%, MATH-500 16,20%), por lo que no es adecuado como modelo de proposito general.
- La puntuacion de Irrelevance cae del 67,47% al 29,41% tras la fase OPD, lo que indica que la abstencion ante herramientas irrelevantes empeora con la destilacion; este es un caveat importante para produccion.
- La licencia no esta disponible en la informacion proporcionada, lo que impide confirmar si el uso comercial esta permitido. Debe verificarse antes de un despliegue en produccion.
- El entrenamiento limito los prompts a 640 tokens, lo que puede afectar al comportamiento con contextos largos aunque el modelo base soporte ventanas mayores.
- Riesgo de alucinacion inherente a los modelos de 0,5B, especialmente en generacion de argumentos de funciones y en tareas de razonamiento.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion proporcionada.
- Al ser un adaptador LoRA, requiere cargar el modelo base Qwen2.5-0.5B-Instruct; no es un modelo autonomo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft16800-opd880-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft16800-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor congelado: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
