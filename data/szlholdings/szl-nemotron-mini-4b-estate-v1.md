# SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-v1

## Resumen

SZL-Nemotron-Mini-4B-Estate-v1 es un ajuste fino supervisado (SFT) del modelo nvidia/Nemotron-Mini-4B-Instruct, desarrollado por SZLHOLDINGS. El modelo parte de una arquitectura transformer de 4.190.509.056 parametros (aproximadamente 4,19 mil millones) y se ha entrenado mediante QLoRA de 4 bits con rango 16 sobre un corpus propietario compuesto por la documentacion de los 126 repositorios activos de la organizacion szl-holdings, textos doctrinales, un corpus de analisis cuantitativo y conjuntos SFT especificos.

El objetivo declarado es dotar al modelo base de conocimiento interno de la organizacion: doctrina canonica, formulas y el denominado "quant analyst persona", ademas de un mecanismo de contrapeso a la abstencion ("abstention counterweight") construido a partir de fallos de confabulacion medidos en las evaluaciones previas. Se trata de un modelo de generacion de texto orientado a conversacion, con licencia Apache 2.0 y pesos en formato safetensors.

La relevancia de esta ficha es limitada fuera del ecosistema del autor: no se han publicado resultados de benchmarks, la evaluacion de calidad esta pendiente y el modelo solo declara soporte para ingles. Su interes tecnico reside en el proceso documentado de ajuste fino (4.855 ejemplos, 606 pasos, una RTX A6000) y en el enfoque de contrapesar la abstencion frente a la confabulacion, un problema recurrente en modelos pequenos desplegados en dominios especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de nvidia/Nemotron-Mini-4B-Instruct) |
| Parametros totales | 4.190.509.056 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el artefacto publicado es un modelo fusionado en 16 bits; el entrenamiento uso QLoRA de 4 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer nvidia/Nemotron-Mini-4B-Instruct, convertido previamente a safetensors por el mismo autor. El entrenamiento se realizo con QLoRA de 4 bits (rango 16), durante 2 epocas, con learning rate 2e-4, longitud de secuencia 1024, batch size 1 y acumulacion de gradiente 16, totalizando 606 pasos. El artefacto publicado es el modelo completo fusionado en 16 bits. El hardware empleado fue una unica RTX A6000 en Massed Compute, con backend Unsloth.

El corpus de entrenamiento suma 4.855 ejemplos procedentes de seis conjuntos de datos: estate-knowledge-corpus-v1 (1.650), doctrine-corpus-v2 (236), szl-quant-sft-v1 (2.693), szl-quant-abstention-sft-v1 (29), szl-frontier-sft-mix-v2 (206) y szl-1-doctrine-sft (41). La composicion combina documentacion de repositorios, textos doctrinales, datos de dominio cuantitativo y un pequeno conjunto de abstencion. No se documenta el uso de RLHF ni DPO, ni innovaciones arquitectonicas propias; el valor diferencial esta en la curacion del dataset y en el contrapeso de abstencion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Nemotron-Mini-4B-Instruct.
- Conocimiento interno de la organizacion szl-holdings: documentacion de 126 repositorios, tesis canonica v8 y textos doctrinales.
- Razonamiento de dominio cuantitativo y adopcion de una "persona" de analista quant, segun los conjuntos SFT empleados.
- Comportamiento de abstencion calibrado mediante un conjunto especifico de contrapeso (29 ejemplos), orientado a reducir la confabulacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente interno de documentacion: el modelo ha leido los README de los 126 repositorios activos de la organizacion, por lo que puede responder preguntas sobre estructura, proposito y uso de cada repositorio sin necesidad de busqueda externa.
- Consulta de doctrina y tesis canonica: adecuado para responder preguntas sobre los textos doctrinales de SZL Holdings, ya que estos forman parte directa del corpus de entrenamiento.
- Analisis cuantitativo asistido: el conjunto szl-quant-sft-v1 (2.693 ejemplos) entrena al modelo para adoptar el rol de analista quant, util en tareas de interpretacion de formulas y metricas del dominio.
- Mitigacion de confabulacion en produccion: el contrapeso de abstencion busca que el modelo decline responder cuando no dispone de informacion, un comportamiento deseable en asistentes internos donde una respuesta inventada tiene coste alto.
- Prototipado rapido en una sola GPU: con 4,19 mil millones de parametros y pesos en safetensors de 16 bits (repo de 8,4 GB), puede desplegarse en una GPU consumer de gama alta para pruebas internas.
- Base para nuevos ajustes de dominio: al estar bajo Apache 2.0 y en formato transformers estandar, sirve como punto de partida para SFT adicionales sobre corpus propios de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no constituye una evaluacion independiente de calidad, que no se reclama ninguna metrica de precision o rendimiento y que la evaluacion de flota esta pendiente.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 8,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda entre 10 y 12 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5 a 5 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 2,5 a 3 GB de pesos.
- GPU recomendadas: RTX A6000 (la usada en entrenamiento), A100 o H100 para despliegue concurrente; RTX 4090 o RTX 3090 para inferencia en 16 bits.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas en 16 bits (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en tarjetas de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), vLLM, TGI, llama.cpp u Ollama previa conversion a GGUF; el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| SZL-Nemotron-Mini-4B-Estate-v1 | 4,19 B | no disponible | Apache 2.0 | en | Ajuste SFT de dominio privado, sin benchmarks publicados |
| nvidia/Nemotron-Mini-4B-Instruct | 4 B (aprox.) | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo base; dispone de evaluacion publica del autor original |
| Modelos de ~4 B de proposito general (p. ej. familias Llama o Qwen de tamano similar) | ~4 B | variable | variable | multilingue en general | Alternativas genericas; no especializadas en el corpus de SZL Holdings |

La comparacion cuantitativa con alternativas no es posible: no hay benchmarks publicados de este ajuste ni datos de contexto en la informacion disponible. Frente al modelo base, la diferencia es la especializacion en el corpus interno y el contrapeso de abstencion, no una mejora demostrada de capacidad general.

## Limitaciones y advertencias

- No existe evaluacion independiente de calidad: la model card declara explicitamente que no se reclama precision ni rendimiento y que la evaluacion de flota esta pendiente.
- El efecto del contrapeso de abstencion sobre la confabulacion es la medicion clave pendiente; no hay evidencia publicada de que funcione.
- Riesgo de alucinacion: al ser un modelo de 4 B ajustado sobre un corpus pequeno (4.855 ejemplos), es probable que generalice de forma incorrecta fuera del dominio entrenado.
- Solo soporta ingles; no se declara capacidad multilingue.
- Longitud de contexto no documentada; el entrenamiento uso secuencias de 1024 tokens, lo que sugiere un contexto efectivo limitado en la practica.
- Sesgos: no documentados, pero el corpus esta compuesto integramente por material interno de una organizacion, lo que puede introducir un sesgo fuerte hacia su doctrina y terminologia.
- Licencia Apache 2.0 permite uso comercial, pero el contenido del corpus de entrenamiento es propietario y su procedencia no se detalla mas alla de los enlaces a los datasets.
- El modelo tiene cero descargas y cero likes en el momento de la ficha, y fue creado y actualizado el mismo dia (2026-11-05); no hay evidencia de uso externo.
- La evidencia de entrenamiento remite a un log en un dataset privado y a un repositorio de GitHub, no verificable de forma independiente desde la model card publica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Nemotron-Mini-4B-Estate-v1
- Modelo base: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- Conversion a safetensors del modelo base: https://huggingface.co/SZLHOLDINGS/Nemotron-Mini-4B-Instruct-st
- Dataset estate-knowledge-corpus-v1: https://huggingface.co/datasets/SZLHOLDINGS/estate-knowledge-corpus-v1
- Dataset doctrine-corpus-v2: https://huggingface.co/datasets/SZLHOLDINGS/doctrine-corpus-v2
- Dataset szl-quant-sft-v1: https://huggingface.co/datasets/SZLHOLDINGS/szl-quant-sft-v1
- Dataset szl-quant-abstention-sft-v1: https://huggingface.co/datasets/SZLHOLDINGS/szl-quant-abstention-sft-v1
- Dataset szl-frontier-sft-mix-v2: https://huggingface.co/datasets/SZLHOLDINGS/szl-frontier-sft-mix-v2
- Dataset szl-1-doctrine-sft: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Logs de entrenamiento (dataset privado): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Script de entrenamiento: https://github.com/szl-holdings/szl-forge/blob/main/training/train_wave.py
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
