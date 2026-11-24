# thuEcstasy1/ForesightLoop-4

## Resumen

ForesightLoop-4 (publicado en el repositorio como InfuseLoop-4) es un modelo de lenguaje base de tipo causal-LM desarrollado por el usuario thuEcstasy1 en el marco del proyecto de investigación InfuseLoop. Se trata de un transformer "looped" (con bucles recurrentes) de 596.139.462 parámetros que aplica cuatro bucles recurrentes paralelos sobre un backbone compartido de 28 capas, con un mecanismo denominado Attention Residuals que conecta las trayectorias de las distintas iteraciones. El modelo emplea una configuracion de backbone y tokenizer derivada de Qwen3-0.6B, aunque no es un fine-tune de pesos preentrenados de Qwen3, sino que parte de una inicializacion aleatoria comun.

El modelo se entrena sobre 6.000.082.944 tokens de FineWeb-Edu (45.777 actualizaciones) con una longitud de secuencia de 1.024 tokens y un batch global de 128 secuencias. Su interes reside en la exploracion de arquitecturas recurrentes con profundidad efectiva ampliada sin incrementar el numero de parametros, un area de investigacion activa frente a los transformers densos convencionales. La ventana de contexto de entrenamiento es reducida (1.024 tokens), lo que condiciona su uso practico.

Se distribuye con licencia Apache-2.0 en formato safetensors y precision FP32, con un tamano de repositorio de 2,4 GB. Requiere una implementacion de referencia personalizada (el paquete `infuseloop`) y no registra `AutoModelForCausalLM`, por lo que no es compatible de forma generica con los pipelines estandar de Transformers. Es un checkpoint de investigacion, no un asistente alineado para instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con 4 bucles recurrentes paralelos y Attention Residuals (looped-transformer) |
| Parametros totales | 596.139.462 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32 original) |

## Arquitectura y entrenamiento

El modelo se construye sobre un backbone compartido de 28 capas con dimension oculta de 1.024 y dimension de FFN de 3.072. La atencion usa 16 cabezas de consulta y 8 cabezas KV (GQA) con dimension de cabeza de 128. La innovacion principal es la ejecucion de cuatro bucles recurrentes paralelos sobre ese backbone: cada iteracion reutiliza las capas compartidas pero mantiene su propia trayectoria, y las salidas de los bucles mas superficiales se enrutan como entrada a los ciclos de ejecucion siguientes mediante RMSNorm de origen y Attention Residuals. El mecanismo G-SWA combina una KV global compartida del primer bucle con ventanas locales privadas de 64 tokens.

El entrenamiento se realizo sobre 6.000.082.944 tokens de FineWeb-Edu durante 45.777 actualizaciones, con secuencias de 1.024 tokens y batch global de 128. No se menciona RLHF, DPO ni ningun tipo de alineacion por preferencias. La inicializacion parte de una inicializacion aleatoria comun (no de pesos Qwen3 preentrenados), y la configuracion del backbone y el tokenizer siguen Qwen3-0.6B con la revision de tokenizer fijada en `c1899de289a04d12100db370d81485cdf75e47ca`. La implementacion publica es una referencia eager en PyTorch que no reproduce las mediciones de latencia optimizadas con CUDA Graph, FA4 y Triton descritas en el paper.

## Capacidades

- Generacion de texto causal en ingles a partir de prefijos naturales, sin plantilla de chat.
- Modelado de lenguaje base: no esta instruido ni alineado para seguir instrucciones.
- Razonamiento de conocimiento general limitado, evaluado en tareas como MMLU, HellaSwag, ARC, PIQA, WinoGrande y OpenBookQA.
- Exploracion de profundidad recurrente: la misma pila de capas se ejecuta en cuatro bucles, lo que permite estudiar el efecto de la profundidad efectiva sin aumentar parametros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre arquitecturas recurrentes: el modelo sirve como banco de pruebas reproducible para estudiar como afectan los bucles paralelos y los Attention Residuals a la perplejidad y a las tareas downstream, con un checkpoint de 0,6B manejable en una sola GPU.
- Experimentos de profundidad efectiva: al ejecutar cuatro bucles sobre 28 capas compartidas, permite comparar el rendimiento frente a transformers densos de parametros similares y analizar el coste computacional de la profundidad recurrente.
- Generacion de texto de dominio educativo: entrenado sobre FineWeb-Edu, puede emplearse para completar pasajes de caracter educativo o cientifico en ingles, siempre con revision humana por la calidad inconsistente del checkpoint.
- Evaluacion de tecnicas de atencion hibrida: el esquema G-SWA (KV global compartida mas ventanas locales de 64 tokens) es un caso de estudio para medir el impacto de la atencion local en la calidad del modelado.
- Reproduccion de resultados academicos: el repositorio incluye `export-validation.json` con recuentos de parametros y hashes SHA256, lo que facilita la verificacion de la exportacion de pesos en experimentos de replicacion.
- Base para fine-tuning controlado en ingles: al ser un modelo base Apache-2.0, puede servir de punto de partida para ajustes supervisados en tareas concretas, asumiendo la ventana de contexto limitada de 1.024 tokens.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| WikiText-2 word PPL (menor es mejor) | 35,70 |
| LAMBADA final-word PPL (menor es mejor) | 45,08 |
| Media de siete tareas (%) | 43,00 |

La media de siete tareas incluye MMLU, HellaSwag, ARC-E, ARC-C, PIQA, WinoGrande y OpenBookQA. MMLU se evalua en modo five-shot y el resto en zero-shot. Las definiciones exactas de las metricas y el alcance de los benchmarks se documentan en el repositorio de codigo. No se han publicado resultados desglosados por tarea en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,4 GB solo para pesos, mas activaciones y cache KV; en la practica se recomienda al menos 6-8 GB de VRAM para generar con comodidad.
- Al no publicarse pesos cuantizados, no hay cifras oficiales para GGUF, int8 o int4; una cuantizacion a FP16 reduciria los pesos a unos 1,2 GB y a int8 a unos 0,6 GB, pero requeriria conversion manual.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para el checkpoint en FP32 o FP16. Para entrenamiento o experimentacion con bucles adicionales se recomienda A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: la implementacion de referencia `infuseloop` (instalable via `pip install git+https://github.com/thuEcstasy/InfuseLoop.git`) sobre PyTorch. No hay soporte confirmado para vLLM, llama.cpp, Ollama ni TGI, dado que el modelo no registra `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles. La model card indica que la implementacion publica no reproduce las mediciones optimizadas del paper (CUDA Graph, FA4, Triton).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---|---|---|
| ForesightLoop-4 (InfuseLoop-4) | 596 M | 1.024 | Apache-2.0 | Transformer con 4 bucles recurrentes; solo ingles; requiere codigo propio |
| Qwen3-0.6B | 596 M (aprox.) | 32.768 (segun configuracion Qwen3) | Apache-2.0 | Transformer denso convencional; multilingue; compatible con Transformers |
| SmolLM2-360M | 362 M | 8.192 | Apache-2.0 | Denso; entrenado con mas tokens; amplio soporte de ecosistema |
| Pythia-410M | 410 M | 2.048 | Apache-2.0 | Denso; checkpoint de investigacion con suite de evaluacion publica |

La comparacion con Qwen3-0.6B es especialmente relevante porque ForesightLoop-4 reutiliza su configuracion de backbone y tokenizer, aunque no sus pesos. Frente a los modelos densos de tamano similar, la ventaja de ForesightLoop-4 es la exploracion de profundidad recurrente; la desventaja es el contexto corto, el entrenamiento con solo 6B tokens y la falta de integracion con el ecosistema estandar. Los datos de contexto de Qwen3-0.6B, SmolLM2-360M y Pythia-410M provienen de sus configuraciones publicas y no de la informacion proporcionada para este modelo.

## Limitaciones y advertencias

- Checkpoint de investigacion entrenado con un presupuesto reducido de 6.000 millones de tokens; la calidad del texto puede ser inconsistente o repetitiva.
- Puede generar afirmaciones no respaldadas y reflejar sesgos presentes en FineWeb-Edu.
- No es un asistente instruido: no hay alineacion de chat ni fine-tuning de seguridad.
- Ventana de contexto de solo 1.024 tokens, insuficiente para la mayoria de aplicaciones de produccion con documentos largos.
- Solo soporta ingles.
- Requiere la clase `InfuseLoop` personalizada; no registra `AutoModelForCausalLM` y no garantiza compatibilidad con pipelines genericos de Transformers.
- La implementacion publica es una referencia eager y no reproduce el rendimiento optimizado descrito en el paper.
- La evidencia experimental se limita a modelos densos de aproximadamente 0,6B y profundidades recurrentes de cuatro y ocho; el escalado a arquitecturas mayores o MoE queda abierto.
- Aunque la licencia es Apache-2.0 y permite uso comercial, la falta de alineacion y la calidad limitada desaconsejan su uso directo en produccion sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thuEcstasy1/ForesightLoop-4
- Pagina del proyecto InfuseLoop: https://thuecstasy.github.io/InfuseLoop/
- Repositorio de codigo: https://github.com/thuEcstasy/InfuseLoop
- Revision del tokenizer Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B/tree/c1899de289a04d12100db370d81485cdf75e47ca
