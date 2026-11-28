# Xylolabs/Llama-3.1-8B-GGUF

## Resumen

Xylolabs/Llama-3.1-8B-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo base meta-llama/Llama-3.1-8B de Meta. El repositorio lo publica Xylolabs y contiene un unico fichero, `Llama-3.1-8B-Q4_K_M.gguf`, de 4,921 GB, pensado para su ejecucion con llama.cpp. No se trata de un modelo nuevo ni de un fine-tune: es una conversion y cuantizacion del checkpoint original de 8.030.261.312 parametros, sin cambios en la arquitectura ni en los datos de entrenamiento.

La relevancia de esta ficha es practica: permite ejecutar un Llama 3.1 8B en hardware de consumo con una perdida de fidelidad respecto a BF16 documentada por el autor (KL de 0,029846 en WikiText-2 y top-1 del 92,162% con Q4_K_M). El autor incluye ademas una tabla de recomendaciones de hardware y contexto que va desde una RTX 4090 de 24 GB hasta aceleradores B300 de 288 GB, lo que facilita el dimensionamiento del despliegue.

Al ser el modelo base (no instruct), su uso esperado es la continuacion de texto y el ajuste posterior, no el dialogo instruido. El repositorio declara compatibilidad con endpoints y la etiqueta `endpoints_compatible`. La licencia es la Llama 3.1 Community License, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B; no se detalla en la model card) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens segun la tabla de hardware del autor (64K en GPUs de 24 GB) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); el autor referencia Q8_0, Q6_K, Q5_K_M y Q3_K_M solo a efectos comparativos |
| Idiomas soportados | en, ko (segun etiquetas del repositorio) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 4,9 GB |
| Fichero incluido | `Llama-3.1-8B-Q4_K_M.gguf` (4,921 GB) |
| Modelo base | meta-llama/Llama-3.1-8B |
| Relacion con el base | quantized |
| Libreria | gguf / llama.cpp |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.1 8B original de Meta: un transformer decoder-only denso de 8.030.261.312 parametros. Esta ficha no describe ni modifica dicha arquitectura; el trabajo de Xylolabs consiste en la conversion del checkpoint a GGUF y su cuantizacion a Q4_K_M. La model card no aporta informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus ni fases de RLHF/DPO, por lo que esos datos deben consultarse en la release original de Meta.

La innovacion tecnica documentada es la evaluacion de fidelidad de la cuantizacion frente a BF16. El autor publica divergencia KL y top-1 sobre WikiText-2 y sobre un conjunto held-out para distintos niveles de cuantizacion de llama.cpp. Para el fichero publicado (Q4_K_M, 4,921 GB) los valores son KL 0,029846 y top-1 92,162% en WikiText-2, y KL 0,026917 y top-1 91,716% en held-out. La tabla permite ademas comparar con Q8_0 (KL 0,000841, top-1 98,750%), Q6_K (KL 0,004468, top-1 96,696%), Q5_K_M (KL 0,009516, top-1 95,358%) y Q3_K_M (KL 0,098527, top-1 86,377%).

## Capacidades

- Generacion de texto por continuacion de prefijo: el autor documenta el uso con `llama-completion -f prompt.txt -no-cnv`, es decir, modo de completado sin plantilla de conversacion.
- Modelo base, no instruct: no incorpora por si mismo el formato de chat ni el alineamiento conversacional de las variantes Instruct.
- Razonamiento y codigo: capacidades heredadas del Llama 3.1 8B base; no se documentan evaluaciones especificas en este repositorio.
- Multilingue limitado segun etiquetas: ingles (en) y coreano (ko).
- Compatibilidad con endpoints: el repositorio incluye la etiqueta `endpoints_compatible`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Prototipado local de generacion de texto: cargar el GGUF con llama.cpp en una estacion de trabajo con RTX 4090 (24 GB) y usar el modelo para completar prompts, con contexto de hasta 64K tokens segun la tabla del autor.
- Base para fine-tuning o adaptacion: al ser el checkpoint base cuantizado, sirve como referencia de comportamiento del Llama 3.1 8B original antes de aplicar LoRA o adaptadores sobre los pesos sin cuantizar.
- Evaluacion de cuantizacion en pipelines de ML: el repositorio proporciona metricas KL y top-1 frente a BF16, utiles para decidir si Q4_K_M es aceptable en una tarea concreta antes de desplegar.
- Despliegue en hardware de consumo: con 4,921 GB de pesos, cabe en GPUs de 8-12 GB para contextos cortos y en 24 GB para contextos de 64K, lo que permite entornos de desarrollo sin aceleradores de datacenter.
- Servicio de completado de texto en CPU o Apple Silicon: la tabla de hardware incluye Mac Studio con memoria unificada de 128 a 512 GB, donde el modelo puede ejecutarse con contexto de 128K.
- Generacion de texto en coreano e ingles: para tareas de continuacion o redaccion asistida en esos dos idiomas, que son los declarados en las etiquetas del repositorio.
- Pruebas de regresion de infraestructura: usar el fichero Q4_K_M como carga de referencia para medir throughput y latencia en distintas GPUs (RTX 5090, H100, H200, B200, B300) antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo publica metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 8,541 GB | 0,000841 | 98,750% | 0,000789 | 98,265% |
| llama.cpp Q6_K | 6,596 GB | 0,004468 | 96,696% | 0,004305 | 96,216% |
| llama.cpp Q5_K_M | 5,733 GB | 0,009516 | 95,358% | 0,008728 | 95,010% |
| Q4_K_M (fichero publicado) | 4,921 GB | 0,029846 | 92,162% | 0,026917 | 91,716% |
| llama.cpp Q3_K_M | 4,019 GB | 0,098527 | 86,377% | 0,093630 | 84,667% |

## Requisitos de hardware

- VRAM para inferencia: el fichero Q4_K_M ocupa 4,921 GB; a ello hay que sumar la cache KV, que crece con el contexto. El autor no publica cifras de VRAM total por contexto.
- GPU recomendadas segun el autor: RTX 4090 / RTX 3090 (24 GB) con contexto de 64K; RTX 5090 (32 GB) con 128K; RTX 6000 Ada o 2 x 24 GB (48 GB) con 128K; H100 (80 GB) con 128K; RTX PRO 6000 Blackwell (96 GB) con 128K; H200 (141 GB) con 128K; B200 (192 GB) con 128K; B300 (288 GB) con 128K.
- Memoria unificada: DGX Spark (128 GB) y Mac Studio M5 Max (128 GB) con 128K; Mac Studio M5 Ultra (256 GB y 512 GB) con 128K.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con contexto de 64K segun la tabla del autor. Para GPUs de 8-12 GB no hay recomendacion explicita en la model card.
- Opciones de despliegue: llama.cpp, con el build enlazado por el autor (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`) o posterior. El repositorio esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---:|---:|---|---|---|
| Xylolabs/Llama-3.1-8B-GGUF | 8,03 B | 128K (64K en 24 GB) | GGUF Q4_K_M, 4,921 GB | Llama 3.1 Community | Modelo base, sin datos de benchmarks de tareas |
| meta-llama/Llama-3.1-8B | 8,03 B | 128K | safetensors (BF16) | Llama 3.1 Community | Checkpoint original; referencia de fidelidad del GGUF |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128K | safetensors (BF16) | Llama 3.1 Community | Variante alineada para dialogo; no disponible en esta busqueda en formato GGUF de Xylolabs |
| Otras cuantizaciones GGUF del Llama 3.1 8B | 8,03 B | 128K | GGUF Q8_0 / Q6_K / Q5_K_M / Q3_K_M | Llama 3.1 Community | El autor publica metricas comparativas de estos niveles, pero no los distribuye en el repositorio |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento frente a alternativas de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no responde de forma fiable a instrucciones ni mantiene formato de chat sin un ajuste previo o una plantilla adecuada.
- Perdida de fidelidad por cuantizacion: Q4_K_M presenta KL de 0,029846 y top-1 de 92,162% frente a BF16 en WikiText-2; para tareas sensibles a la precision conviene evaluar niveles superiores (Q5_K_M, Q6_K, Q8_0).
- Riesgo de alucinacion: inherente al modelo original; no hay evaluaciones especificas en este repositorio.
- Idiomas: solo se declaran en y ko; el rendimiento en castellano no esta documentado en esta ficha.
- Licencia: Llama 3.1 Community License, con Acceptable Use Policy en `USE_POLICY.md`; existen restricciones para uso comercial y para determinados supuestos de uso, que deben revisarse antes de produccion.
- Cobertura de hardware: la tabla del autor no incluye GPUs de menos de 24 GB, por lo que el comportamiento con contextos largos en GPUs de 8-12 GB no esta documentado.
- Datos de entrenamiento, sesgos y evaluaciones de seguridad: no disponibles en la informacion proporcionada; deben consultarse en la release original de Meta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Llama-3.1-8B-GGUF/blob/main/LICENSE
- Build de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
- Grafico de KL por tamano: https://huggingface.co/Xylolabs/Llama-3.1-8B-GGUF/resolve/main/accuracy-mean-kl.png
- Grafico de top-1 por tamano: https://huggingface.co/Xylolabs/Llama-3.1-8B-GGUF/resolve/main/accuracy-top1.png
