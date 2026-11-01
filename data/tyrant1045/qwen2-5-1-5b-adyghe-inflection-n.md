# tyrant1045/qwen2.5-1.5b-adyghe-inflection-N

## Resumen

Qwen2.5-1.5B Adyghe inflection (adapter N) es un adaptador LoRA (QLoRA) publicado por el usuario tyrant1045 sobre el modelo base unsloth/Qwen2.5-1.5B-Instruct. Su unico proposito es la generacion de formas flexionadas de sustantivos y adjetivos en adigué (ady), una lengua caucasica noroccidental con muy pocos recursos computacionales. Dado un lema y un conjunto de etiquetas morfologicas en formato UniMorph, el adaptador devuelve unicamente la forma flexionada correspondiente.

El adaptador se entrena sobre un unico fichero de 18.463 ejemplos (train_v1.jsonl) derivado del dataset tyrant1045/adyghe-inflection-unimorph, con una configuracion QLoRA de rango 16, alpha 16, learning rate 2e-4, batch 16, una epoca y semilla 3407. El repositorio ocupa aproximadamente 0,1 GB y contiene solo los pesos del adaptador en safetensors, no el modelo completo.

Su relevancia es acotada pero clara: demuestra que un modelo de 1.500 millones de parametros puede aprender una tarea morfologica cerrada en una lengua de bajos recursos hasta alcanzar un 90,0 % de acierto en un conjunto de evaluacion de 30 items juzgado por un LLM, frente al 0,0 % del modelo base. No es un modelo de proposito general ni sustituye a Qwen2.5-1.5B-Instruct; es un artefacto especializado para un pipeline linguistico concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (QLoRA) |
| Parametros totales | 1.500 millones en el modelo base; el adaptador LoRA es de rango 16 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el entrenamiento fue QLoRA, es decir, base cuantizado en 4 bits) |
| Idiomas soportados | adigué (ady) para la tarea de flexión; el modelo base soporta multilingue general |
| Licencia | cc-by-sa-3.0 |
| Formato de pesos | safetensors (adaptador PEFT; requiere cargar el modelo base unsloth/Qwen2.5-1.5B-Instruct) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parametros. El entrenamiento es QLoRA: el modelo base se cuantiza a 4 bits y se entrenan matrices de bajo rango con r=16 y alpha=16, learning rate 2e-4, batch de 16, una sola epoca y semilla 3407. El dataset de entrenamiento es train_v1.jsonl, con 18.463 filas extraidas de tyrant1045/adyghe-inflection-unimorph, un corpus de flexión nominal y adjetival en formato UniMorph.

La tarea esta formulada como transformacion cerrada: entrada compuesta por lema y etiquetas UniMorph, salida restringida a la forma flexionada. No se documentan en la informacion disponible fases de RLHF, DPO ni tecnicas de decodificacion especulativa. El unico artefacto publicado son los pesos del adaptador; no se incluye el modelo fusionado ni tokenizador propio.

## Capacidades

- Flexion morfologica de sustantivos y adjetivos en adigué a partir de etiquetas UniMorph.
- Salida restringida a la forma flexionada, sin texto adicional, lo que facilita su integracion en pipelines.
- Generalizacion parcial a entradas no vistas: 70,0 % en el conjunto de robustez (inf_robust) frente al 0,0 % del modelo base.
- Capacidades generales del modelo base (generacion de texto, razonamiento, codigo, tool calling, multilingue) teoricamente presentes, pero no evaluadas ni garantizadas tras el ajuste.
- No se documentan capacidades de vision, audio, modo thinking ni agentes multi-paso en este adaptador.

## Casos de uso

- Anotacion morfologica asistida: dado un lema y un conjunto de rasgos UniMorph, generar la forma flexionada para preanotar corpus de adigué y reducir el trabajo manual de revisores.
- Construccion de lexicos y paradigmas: generar tablas de flexion completas para un lema y validar la productividad de patrones morfologicos en adigué.
- Ensenanza de la lengua: producir ejercicios de conjugacion y declinacion con formas correctas a partir de etiquetas morfologicas controladas.
- Evaluacion de tecnicas de adaptacion de bajo rango en lenguas de bajos recursos: el adaptador sirve como caso reproducible (semilla, hiperparametros y dataset publicados) para comparar QLoRA frente a otras estrategias.
- Preprocesado en sistemas de traduccion o analisis sintactico: normalizar formas flexionadas a lemas y viceversa dentro de un pipeline mayor.
- Filtrado y control de calidad de corpus: comprobar si una forma observada en un texto es coherente con las etiquetas morfologicas esperadas para su lema.

## Benchmarks y rendimiento

| Conjunto (30 items, juez LLM) | Modelo base | Este adaptador |
|---|---|---|
| inf_eval (Spec) | 0,0 % | 90,0 % |
| inf_robust (Robustez) | 0,0 % | 70,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores corresponden exclusivamente a la tarea de flexion y a conjuntos de 30 items evaluados con un juez LLM, por lo que su intervalo de confianza es amplio.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en safetensors ocupa aproximadamente 0,1 GB; el modelo base en fp16 requiere del orden de 3 GB y en cuantizacion de 4 bits alrededor de 1 GB (estimacion a partir del tamano de 1.500 millones de parametros, no confirmada en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM es suficiente para el modelo base cuantizado; para fp16 se recomienda 8 GB o mas.
- Cabe en GPU consumer: si, incluidas RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama solo si se fusiona y convierte el adaptador a GGUF, paso no documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tyrant1045/qwen2.5-1.5b-adyghe-inflection-N | 1,5 B (base) + adaptador LoRA | no disponible | Flexion en adigué | cc-by-sa-3.0 | HuggingFace |
| unsloth/Qwen2.5-1.5B-Instruct (base) | 1,5 B | no disponible | Instrucciones generales | no disponible en la informacion proporcionada | HuggingFace |
| Adaptadores de flexion para otras lenguas de bajos recursos | no disponible | no disponible | Flexion morfologica | variable | no disponible |

No se dispone de datos de benchmarks comparables con otros adaptadores de flexion en adigué en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado con una sola epoca y 18.463 ejemplos; el 70,0 % en robustez indica errores frecuentes en entradas fuera de distribucion.
- Evaluacion sobre solo 30 items por conjunto y con juez LLM: alta varianza y posible sesgo del juez; no equivale a una evaluacion humana.
- El adaptador no incluye el modelo base; es necesario descargar unsloth/Qwen2.5-1.5B-Instruct y cargarlo con PEFT.
- Licencia cc-by-sa-3.0: obliga a atribucion y a compartir derivados bajo la misma licencia, lo que puede limitar su uso en productos propietarios.
- Riesgo de alucinacion fuera de la tarea: al conservar el modelo base, puede generar texto libre si el prompt no restringe la salida.
- Cobertura limitada a sustantivos y adjetivos; no se documenta flexion verbal ni otras categorias.
- Sin datos publicados sobre sesgos, latencia o comportamiento en produccion.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/tyrant1045/qwen2.5-1.5b-adyghe-inflection-N
- Dataset de entrenamiento: https://huggingface.co/datasets/tyrant1045/adyghe-inflection-unimorph
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct
- Repositorio del proyecto con resultados, curva y transcripciones del juez: no disponible en la informacion proporcionada.
