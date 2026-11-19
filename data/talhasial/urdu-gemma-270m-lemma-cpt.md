# talhasial/urdu-gemma-270m-lemma-cpt

## Resumen

`talhasial/urdu-gemma-270m-lemma-cpt` es un adaptador LoRA para lematizacion en urdu construido sobre `google/gemma-3-270m`. Lo publica Muhammad Talha Sial (Masaryk University) como parte de su tesis de master *Exploiting large language models for improvements in Urdu NLP* (2026). El adaptador se entrena sobre un modelo base al que previamente se le ha fusionado otro adaptador de preentrenamiento continuado (CPT), por lo que su uso requiere replicar esa cadena de dos etapas.

El modelo resuelve una tarea concreta de procesamiento morfologico: dada una frase en urdu, devuelve cada palabra junto con su lema en un formato de pares `palabra/lema` separados por espacios. No es un modelo de proposito general, sino un ajuste fino especializado sobre el treebank UD_Urdu-UDTB (4.043 frases de entrenamiento, UD v2.14).

La relevancia es acotada pero clara: demuestra que un modelo de 270 millones de parametros, con LoRA de rango 16 y cinco epocas, puede adaptarse a una tarea linguistica de baja recursos como la lematizacion del urdu. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA sobre el modelo base `google/gemma-3-270m` |
| Parametros totales | 270M en el modelo base; parametros del adaptador LoRA no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el ejemplo de uso fija `max_seq_length=512` |
| Tipos de cuantizacion | No disponible; el ejemplo de uso emplea `load_in_4bit=False` |
| Idiomas soportados | Urdu (`ur`) |
| Licencia | `other`; sujeto a Gemma Terms of Use y, por los datos de entrenamiento (CC BY-NC-SA 4.0), limitado a uso no comercial |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Gemma 3 270M, un transformer decoder-only de la familia Gemma 3 de Google. El entrenamiento se realiza en dos etapas encadenadas: primero un adaptador de preentrenamiento continuado (CPT) que se fusiona con `merge_and_unload()` en el modelo base, y despues este adaptador de lematizacion (rama CPT, experimento 3 de la tesis) sobre el modelo resultante. La configuracion LoRA es r=16 con tasa de aprendizaje 2e-4, 5 epocas y seleccion del checkpoint con menor perdida de validacion.

Los datos de entrenamiento provienen del treebank UD_Urdu-UDTB (Universal Dependencies v2.14), con 4.043 frases de entrenamiento. No se documenta en la informacion disponible el volumen de tokens, la composicion completa del dataset ni si hubo etapas de RLHF o DPO; el ajuste es supervisado sobre la tarea de lematizacion. La innovacion tecnica destacable es el uso de preentrenamiento continuado en urdu antes del ajuste de la tarea, sobre un modelo base muy pequeno.

## Capacidades

- Lematizacion de texto en urdu: recibe una frase y devuelve pares `palabra/lema` separados por espacios.
- Generacion de texto autoregresiva limitada a la tarea para la que fue ajustado; no se documentan capacidades generales.
- Decodificacion greedy segun el ejemplo de la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al urdu (`ur`); no se documentan otros idiomas.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Preprocesado linguistico para pipelines de PLN en urdu: el adaptador normaliza formas flexionadas a sus lemas antes de tareas de indexacion, busqueda o analisis morfologico, reduciendo la dispersion lexica del corpus.
- Construccion de recursos lexicos: generar candidatos de lema sobre corpus en urdu para revisión humana y alimentar diccionarios o listas de lemas.
- Etiquetado morfosintactico asistido: como componente previo a un tagger o parser entrenado sobre UD, aportando la capa de lematizacion de forma automatizada.
- Investigacion academica en PLN de bajos recursos: replicar el experimento de la tesis comparando la rama CPT con otras variantes y medir el efecto del preentrenamiento continuado en un modelo de 270M.
- Sistemas de recuperacion de informacion en urdu: lematizar consultas y documentos para mejorar la coincidencia entre variantes morfologicas de un mismo termino.
- Docencia y prototipado: servir de ejemplo reproducible de ajuste LoRA sobre Gemma 3 en un entorno de laboratorio con recursos limitados, dado el reducido tamano del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con un modelo base de 270M y pesos en precision completa, la inferencia cabe holgadamente en GPUs de consumo, pero no se documentan cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del modelo base, cualquier GPU consumer reciente es suficiente en teoria.
- Cabe en GPU consumer: si, por el tamano del modelo base (270M), aunque no se aportan mediciones.
- Opciones de despliegue: el ejemplo de la model card usa Unsloth (`FastLanguageModel`) y PEFT (`PeftModel`); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `talhasial/urdu-gemma-270m-lemma-cpt` | 270M (base) + LoRA | No disponible | Lematizacion en urdu | `other`, uso no comercial | Hugging Face (0 descargas) |
| `google/gemma-3-270m` | 270M | No disponible en esta ficha | Proposito general | Gemma Terms of Use | Hugging Face |
| Otros adaptadores de la misma tesis (ramas alternativas) | 270M (base) + LoRA | No disponible | Lematizacion en urdu | No disponible | Referenciados en el repositorio de GitHub del autor |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia restringida: el adaptador se publica para uso no comercial por la licencia CC BY-NC-SA 4.0 de los datos de entrenamiento (UD_Urdu-UDTB), ademas de quedar sujeto a las Gemma Terms of Use.
- Dependencia de una cadena de dos adaptadores: es necesario cargar y fusionar primero el adaptador CPT y despues este; usarlo de forma aislada produce resultados incorrectos.
- Especializacion estrecha: solo realiza lematizacion en urdu; no debe emplearse como modelo conversacional o de proposito general.
- Riesgo de alucinacion en la salida: al ser un modelo generativo, puede producir lemas inexistentes o desalinear los pares `palabra/lema`; requiere validacion en produccion.
- Cobertura limitada por los datos: entrenado con 4.043 frases de un unico treebank, por lo que el dominio y el registro cubiertos son reducidos.
- Sin datos de evaluacion publicados en la informacion disponible, lo que impide estimar su calidad objetiva frente a alternativas.
- Modelo base muy pequeno (270M): la capacidad de generalizacion fuera de la distribucion de entrenamiento es previsiblemente limitada.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/talhasial/urdu-gemma-270m-lemma-cpt
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Codigo y evaluacion: https://github.com/543516-collab/urdu-gemma-270m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Treebank UD_Urdu-UDTB (Universal Dependencies v2.14): no disponible enlace directo en la informacion proporcionada
