# trubisky/Qwen3.5-2B-RCOL

## Resumen

Qwen3.5-2B-RCOL es una coleccion de cuantizaciones GGUF de baja precision del modelo Qwen/Qwen3.5-2B, generadas por el autor independiente `trubisky` mediante el algoritmo experimental RCOL (RCO-lite). El modelo base es un transformer de la familia Qwen 3.5 con 1.881.825.088 parametros (aproximadamente 1,88 mil millones), distribuido bajo licencia Apache 2.0. El repositorio pesa 2,6 GB y contiene multiples variantes GGUF con distintos niveles de compresion.

El problema que resuelve es la perdida de calidad en cuantizaciones de muy baja precision (por debajo de 3,5 bits por peso). En ese regimen, las tecnicas tradicionales basadas en imatrix o en la diagonal de Hessian como proxies de error ordenan los tensores de forma incorrecta: las capas tempranas estrechas parecen caras pero apenas afectan a la divergencia KL de salida, mientras que el embedding y la capa de salida tienen el efecto contrario. RCOL-lite aborda esto optimizando directamente la divergencia KL real frente al profesor BF16 bajo una restriccion exacta de tamano, en lugar de un proxy de curvatura.

La relevancia actual radica en que permite desplegar un modelo de 1,88B parametros en entornos con restricciones severas de VRAM (desde aproximadamente 700 MiB) manteniendo una calidad medible superior a las cuantizaciones estandar de llama.cpp con imatrix de wikitext. Segun la model card, en el rango IQ3_M el RCOL alcanza una KL equivalente a IQ4_XS estandar al mismo BPW.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5; detalles internos no disponibles) |
| Parametros totales | 1.881.825.088 (aprox. 1,88B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_M, IQ2_M, IQ3_M (equivalentes en tamano) y variantes dinamicas RCOL |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo para el conteo de parametros del modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.5-2B, un transformer de la familia Qwen 3.5 con aproximadamente 1,88 mil millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas especificas del modelo base.

La innovacion tecnica destacable esta en el proceso de cuantizacion, no en el modelo. RCOL-lite es una aproximacion barata del metodo RCO de ISTALab, que asigna un tipo de cuantizacion GGUF (Q4_K, IQ3_S, etc.) por tensor para minimizar la divergencia KL de extremo a extremo frente a un profesor BF16 bajo un presupuesto de tamano exacto. El proceso consta de tres fases: (1) una semilla basada en una mezcla de prior de clase e imatrix, con un barrido de sensibilidad midiendo la KL real al degradar una clase a Q2_K; (2) una ronda de movimientos individuales que promociona o degrada una clase y conserva el cambio solo si la KL medida disminuye; (3) rondas de movimientos por pares (promocion + degradacion con presupuesto neutro en tamano) y saltos multi-nivel, aceptados por KL combinada medida. Todas las cuantizaciones del repositorio usan la imatrix estandar de wikitext.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica uso previsto para dialogos.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de inferencia estandar.
- Razonamiento y codigo: capacidades heredadas del modelo base Qwen3.5-2B; no se detallan en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Despliegue en dispositivos con VRAM limitada: las variantes IQ1_M (aprox. 701-710 MiB) e IQ2_M (aprox. 815 MiB) permiten ejecutar el modelo en GPUs de gama baja o en sistemas integrados donde una cuantizacion estandar de 4 bits no cabria, manteniendo una KL medida inferior a la de llama.cpp con imatrix en el mismo tamano.
- Asistentes conversacionales locales: la etiqueta `conversational` y el tamano reducido lo hacen adecuado para chatbots en el escritorio del usuario mediante llama.cpp u Ollama, sin dependencia de la nube.
- Prototipado rapido de pipelines de IA: al ser compatible con endpoints, puede servir como modelo de sustitucion barato para validar integraciones antes de escalar a modelos mayores.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye variantes a distintos BPW con metricas KL y top-p publicadas, lo que lo convierte en un banco de pruebas para comparar RCOL frente a cuantizaciones estandar.
- Filtrado y clasificacion de texto en lote: con 1,88B parametros y pesos de menos de 1 GB, se pueden procesar grandes volumenes de texto en CPU o GPU modesta con latencia aceptable.
- Educacion e investigacion: util para demostrar el impacto de la asignacion por tensor de tipos de cuantizacion en la divergencia KL, con datos concretos publicados en la model card.

## Benchmarks y rendimiento

La model card publica metricas de divergencia KL y top-p frente a un profesor, comparando cuantizaciones estandar de llama.cpp con imatrix de wikitext frente a las variantes RCOL.

| Variante | KL | Top-p | Tamano (MiB) |
|---|---|---|---|
| Estandar Q3_K_L | 0,1001 | 84,363 | 1100 |
| Estandar IQ3_M | 0,098095 | 84,191 | 999 |
| Estandar IQ2_M | 0,352 | 72,218 | 815 |
| Estandar IQ1_M | 1,492 | 47,2 | 703 |
| RCOL IQ3_M equivalente | 0,093940 | 84,65 | 990 |
| RCOL IQ2_M equivalente | 0,172697 | 79,717 | 815 |
| RCOL IQ1_M equivalente | 0,287017 | 72,462 | 701 |
| RCOL mejor en banda IQ1_M | 0,250097 | 74,645 | 710 |

Segun el autor, el RCOL en el rango IQ3_M ofrece una KL equivalente a IQ4_XS estandar al mismo BPW. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 701 MiB (variante IQ1_M RCOL) hasta aproximadamente 1100 MiB (equivalente a Q3_K_L estandar); las variantes incluidas en el set cubren 710 MiB, 815 MiB y 990 MiB.
- GPU recomendadas: cualquier GPU consumer con al menos 1-2 GB de VRAM libre; el modelo cabe en GTX 1050 Ti, GTX 1650, RTX 3050 y superiores. Para las variantes de mayor tamano, una RTX 3060 o superior ofrece margen holgado.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (formato GGUF nativo), Ollama, y cualquier runtime compatible con GGUF; la etiqueta `endpoints_compatible` sugiere soporte en servidores de inferencia con API compatible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-RCOL | 1,88B | no disponible | GGUF | Apache 2.0 | Cuantizaciones RCOL de baja precision con KL medida |
| Qwen/Qwen3.5-2B (base) | 1,88B | no disponible | safetensors | Apache 2.0 | Modelo original en BF16; referencia de calidad |
| Cuantizaciones estandar llama.cpp + imatrix | 1,88B | no disponible | GGUF | Apache 2.0 | IQ1_M, IQ2_M, IQ3_M; KL superior a RCOL en el mismo tamano |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Al tratarse de cuantizaciones de 1-3 bits por peso, la perdida de calidad es inherente: incluso la mejor variante IQ1_M RCOL presenta una KL de 0,250097 y un top-p de 74,645, muy por debajo de la variante IQ3_M (KL 0,093940).
- La variante IQ1_M estandar equivalente (KL 0,287017) no esta incluida en el set principal segun la model card; solo se ofrece como referencia.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; previsiblemente mayor en las variantes de menor BPW.
- Sesgos conocidos: no documentados; se heredan los del modelo base Qwen3.5-2B, no detallados.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-2B y las condiciones de la imatrix de wikitext utilizada.
- El algoritmo RCOL es experimental y una aproximacion del RCO de ISTALab; los resultados de KL se miden en un conjunto de retencion estandarizado y pueden no generalizar a todos los dominios.
- Para produccion, se recomienda validar la variante concreta en la tarea objetivo, ya que las metricas publicadas son de divergencia frente al profesor, no de rendimiento en tareas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/trubisky/Qwen3.5-2B-RCOL
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- ISTALab RCO (referencia del metodo): no disponible en la informacion proporcionada
- Paper o blog del algoritmo RCOL: no disponible en la informacion proporcionada
- Repositorio de llama.cpp: no disponible en la informacion proporcionada
