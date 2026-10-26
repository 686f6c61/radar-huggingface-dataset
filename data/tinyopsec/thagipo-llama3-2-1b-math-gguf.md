# tinyopsec/thagiPo-llama3.2-1B-math-GGUF

## Resumen

`tinyopsec/thagiPo-llama3.2-1B-math-GGUF` es un repositorio de cuantizaciones GGUF del modelo `JoaoGuiAlves/thagiPo-llama3.2-1B-math`, un ajuste fino de `meta-llama/Llama-3.2-1B` orientado a matematicas y entrenado mediante SFT con la libreria TRL. El autor de este repositorio, `tinyopsec`, no entrena el modelo: se limita a convertir los pesos originales a formato GGUF con llama.cpp y a publicar trece variantes de cuantizacion (desde F16 hasta Q2_K). Se trata, por tanto, de un artefacto de distribucion mas que de un modelo nuevo.

El interes practico esta en el tamano: con 1.498.482.720 parametros totales (aproximadamente 1,5 mil millones, segun los pesos en safetensors del modelo base), el modelo cabe holgadamente en GPU de consumo e incluso puede ejecutarse en CPU con cuantizaciones de 4 bits. La especializacion declarada es la resolucion de problemas matematicos, lo que lo situa en la categoria de modelos pequenos de razonamiento numerico para entornos con recursos limitados.

La relevancia es, sin embargo, limitada y debe evaluarse con cautela: el repositorio no incluye resultados de benchmarks, no documenta el conjunto de datos de entrenamiento ni el proceso de ajuste mas alla de la mencion a SFT con TRL, y no registra descargas ni interacciones en el momento de redactar esta ficha. Es un candidato a evaluar, no un modelo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), pesos convertidos a GGUF mediante llama.cpp |
| Parametros totales | 1.498.482.720 (segun pesos safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion del repositorio; el modelo base Llama 3.2 1B declara 128 000 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible (el repo no declara lista de idiomas; hereda el tokenizador de Llama 3.2) |
| Licencia | Llama 3.2 Community License (`llama3`) |
| Formato de pesos | GGUF (un fichero por cuantizacion) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 1B: un transformer decoder-only denso con atencion causal, del que este repositorio solo redistribuye los pesos ya convertidos a GGUF. El repositorio no documenta hiperparametros propios (numero de capas, dimension oculta, cabezas de atencion, vocabulario) ni confirma si el ajuste fino altero la configuracion original; esos datos deben consultarse en la ficha del modelo base. El tag `llama-cpp` y la libreria `gguf` confirman que la conversion se realizo con llama.cpp, con fichero F16 de 3,0 GB como referencia de precision completa.

En cuanto al entrenamiento, la unica informacion disponible es que el modelo padre (`JoaoGuiAlves/thagiPo-llama3.2-1B-math`) fue ajustado para matematicas mediante SFT con TRL. No se especifica el volumen de tokens, la composicion del dataset, si hubo etapas de RLHF, DPO o verificacion de razonamiento, ni si se aplicaron tecnicas de decodificacion especulativa o atencion lineal. Cualquier afirmacion sobre calidad del ajuste seria especulativa: la model card se limita a indicar "Fine-tuned for math. Evaluate before use."

## Capacidades

- Generacion de texto conversacional (`text-generation`, tag `conversational`), orientada a resolver ejercicios y problemas matematicos.
- Razonamiento aritmetico y algebraico basico, segun la especializacion declarada por el autor del ajuste fino.
- Compatibilidad con endpoints (tag `endpoints_compatible`), es decir, puede servirse detras de APIs compatibles con el formato de HuggingFace/llama.cpp.
- Ejecucion en llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso estructurado ni modo "thinking".
- No se documenta capacidad de vision, audio ni multimodalidad.
- Cobertura multilingue: no disponible; el repositorio no declara idiomas.

## Casos de uso

- Tutoria de matematicas en local: el modelo puede desplegarse en un portatil con llama.cpp u Ollama usando `model-Q4_K_M.gguf` (en torno a 1 GB) para resolver dudas aritmeticas sin conexion ni coste de API, algo relevante en entornos educativos con requisitos de privacidad.
- Preprocesado de enunciados numericos en pipelines de datos: uso como clasificador o normalizador de problemas matematicos extraidos de textbooks antes de pasarlos a un modelo mayor.
- Prototipado rapido de asistentes conversacionales: gracias al tag `conversational` y al soporte de plantilla de chat de Llama 3.2, sirve para validar interfaces de chat multi-turno en fases tempranas sin incurrir en costes de inferencia.
- Generacion de ejercicios y variaciones: util para producir problemas de practica con enunciados y soluciones en un bucle de generacion, con supervision humana posterior.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece trece niveles (F16 a Q2_K), lo que permite medir la degradacion de exactitud matematica frente a tamano en un mismo modelo, un experimento util para decidir politicas de cuantizacion.
- Despliegue en dispositivos de borde: con Q4_K_M o Q3_K_M el modelo puede ejecutarse en CPU o en GPU integradas para tareas de calculo sencillo embebidas en aplicaciones de escritorio.
- Filtro o sanity check en pipelines de matematicas: deteccion rapida de respuestas numericamente incoherentes antes de escalar a un modelo de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye MMLU, GSM8K, MATH ni ninguna otra metrica, y tampoco se aportan comparaciones con el modelo base ni con el ajuste fino original.

## Requisitos de hardware

- VRAM estimada para inferencia (valores calculados a partir del tamano de los ficheros GGUF publicados y del coste de cache KV, no medidos): F16 en torno a 3,0 GB; Q8_0 en torno a 1,7 GB; Q6_K en torno a 1,3 GB; Q5_K_M en torno a 1,1 GB; Q4_K_M en torno a 1,0 GB; Q3_K_M en torno a 0,8 GB; Q2_K en torno a 0,6 GB.
- Cabe en cualquier GPU de consumo: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB, e incluso en GPUs con 4 GB o menos usando Q4_K_M o inferiores.
- Ejecucion viable en CPU: con Q4_K_M o Q3_K_M el modelo funciona en portatiles sin GPU dedicada; con F16 en CPU el rendimiento sera bajo.
- GPU de datacenter (A100, H100) innecesarias para este tamano; solo tendrian sentido para servir muchas peticiones concurrentes en paralelo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp y runtimes compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan los pesos safetensors del modelo padre.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thagiPo-llama3.2-1B-math-GGUF (este) | ~1,5 B | No disponible en el repo | Matematicas (SFT) | Llama 3.2 Community | GGUF, 13 cuantizaciones |
| meta-llama/Llama-3.2-1B-Instruct | ~1,5 B | 128 000 tokens (declarado por Meta) | Instrucciones generales | Llama 3.2 Community | Safetensors, GGUF de terceros |
| JoaoGuiAlves/thagiPo-llama3.2-1B-math | ~1,5 B | No disponible en el repo | Matematicas (SFT) | Llama 3.2 Community | Safetensors (modelo padre) |
| Qwen2.5-Math-1.5B | ~1,5 B | No verificado | Matematicas | Apache-2.0 (consultar ficha) | Safetensors |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada; la comparacion se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: sin benchmarks no es posible afirmar que el ajuste fino mejore al Llama 3.2 1B base en matematicas; el autor recomienda explicitamente "evaluate before use".
- Riesgo de alucinacion elevado en razonamiento matematico: con 1,5 B de parametros y sin datos sobre el dataset de SFT, es esperable que falle en problemas de varios pasos, aunque no hay mediciones que lo cuantifiquen.
- Sesgos: no documentados. Al heredar los datos de pretraining de Llama 3.2, arrastra los sesgos de ese corpus, sin que el ajuste fino en matematicas los mitigue.
- Idiomas: la lista de idiomas soportados no esta disponible; no hay garantia de kvalidad fuera del ingles mas alla de lo que ofrezca el modelo base.
- Contexto: el repositorio no declara la longitud de contexto efectiva tras el ajuste fino; conviene validarla empiricamente antes de disenar prompts largos.
- Licencia Llama 3.2 Community: permite uso comercial con condiciones (atribucion "Built with Meta Llama 3.2", politica de uso aceptable y obligaciones de nomenclatura para modelos derivados). Es imprescindible revisar el texto completo antes de un despliegue en produccion.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la ficha, lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de artefactos defectuosos en la conversion.
- Fechas del repositorio: la model card indica creacion en octubre de 2026, dato incoherente que conviene verificar antes de citar el modelo.
- Al ser una cuantizacion, las variantes Q3 y Q2 pueden degradar de forma notable la exactitud aritmetica; para matematicas se recomienda Q5_K_M o superior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/thagiPo-llama3.2-1B-math-GGUF
- Modelo padre (safetensors): https://huggingface.co/JoaoGuiAlves/thagiPo-llama3.2-1B-math
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B
- llama.cpp (herramienta de conversion y runtime): https://github.com/ggml-org/llama.cpp
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- TRL (libreria de SFT citada por el autor): https://github.com/huggingface/trl
