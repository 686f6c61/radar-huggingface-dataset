# zatumout/pooper-b10-1b

## Resumen

pooper-b10-1b es un modelo de prediccion de funcion de secuencia genomica desarrollado por el usuario zatumout y publicado en Hugging Face bajo licencia CC-BY-4.0. Se trata de una red neuronal de aproximadamente 983 millones de parametros (982.728.769 exactamente) que predice 1.885 pistas de senal ENCODE (ATAC-seq, DNase-seq, ChIP-seq de histonas y RNA-seq, sobre el ensamblado GRCh38) a resolucion de 1 par de bases a partir de la secuencia de ADN. Sigue una arquitectura estilo AlphaGenome, identificada en la model card como `arch = alphagenome`, con una torre de 37 capas y una cabeza de salida `TrackHead(1536, 1 bp)`.

El modelo se ha entrenado durante 20.000 pasos con un pico de learning rate de 2e-4, consumiendo aproximadamente 29,9 GB de memoria de GPU y un tiempo de roughly 19 horas (unas 3,19 s/paso). La supervision proviene de los denominados "Zipoop teacher shards": una red "profesora" pequena sobreajustada por cada ventana de 32.768 pb, cada una comprimiendo las 1.885 pistas de esa ventana. El split utilizado es el fold0 de AlphaGenome, empleado unicamente para mantener la comparabilidad de la evaluacion.

Su relevancia es acotada y de caracter experimental: es un prototipo de investigacion que explora el escalado de modelos sequence-to-function en genomica, pero los propios resultados del autor muestran que el aumento de tamano no se tradujo en mejoras de validacion frente a un modelo menor de la misma familia (pooper-b6, 407M). No dispone de evaluacion de test oficial estilo fold1 ni de validacion clinica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `alphagenome` (estilo AlphaGenome), torre de 37 capas, preset `S`, gradient checkpointing |
| Parametros totales | 982.728.769 (~983M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de 32.768 pb (según la supervision de los teacher shards); no se especifica un contexto mayor |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint `best.pt` en precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo genomico, no linguistico) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (`best.pt`, 11.982.068.130 bytes) |

## Arquitectura y entrenamiento

La arquitectura es una torre de 37 capas de tipo transformer con gradient checkpointing, configurada con el preset `S` del esquema `alphagenome`. La cabeza de salida es un `TrackHead(1536, 1 bp)` que produce 1.885 pistas de senal a resolucion de un par de bases sobre GRCh38. El modelo se entreno durante 20.000 pasos con un learning rate pico de 2e-4, empleando aproximadamente 29,9 GB de VRAM y alrededor de 19 horas (unas 3,19 s/paso). El esquema de inicializacion y el hardware no quedaron registrados en el log de la ejecucion.

La innovacion metodologica principal es el uso de "Zipoop teacher shards": en lugar de supervisar directamente contra la senal cruda de ENCODE, se entrena una red profesora pequena y sobreajustada por cada ventana de 32.768 pb, que comprime las 1.885 pistas de esa ventana y sirve como objetivo de destilacion. El split fold0 de AlphaGenome se usa solo para comparabilidad de evaluacion. No se documentan fases de RLHF, DPO ni tecnicas de decodificacion especulativa, al no tratarse de un modelo generativo de texto.

## Capacidades

- Prediccion de 1.885 pistas de senal ENCODE (ATAC-seq, DNase-seq, ChIP-seq de histonas y RNA-seq) sobre GRCh38 a resolucion de 1 pb a partir de secuencia de ADN.
- Modelado sequence-to-function de elementos regulatorios y accesibilidad de cromatina.
- Prediccion de perfiles de expresion genica (RNA-seq) a partir de contexto genomico.
- Salida multi-pista densa (1.885 tracks) con estadisticas por pista (`track_stats.pt`) para desnormalizar predicciones.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues: no aplica.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Analisis de accesibilidad de cromatina in silico: dado un fragmento de 32.768 pb, el modelo predice pistas ATAC-seq y DNase-seq (Pearson de validacion 0,658 y 0,641 respectivamente) para priorizar regiones candidatas antes de experimentos wet-lab.
- Priorizacion de variantes en regiones no codificantes: comparar predicciones entre secuencia de referencia y variante para estimar impacto sobre accesibilidad o marcas de histonas, siempre como herramienta exploratoria y no clinica.
- Estudio de marcas de histonas: prediccion de ChIP-seq de histonas (Pearson 0,439 en validacion) para generar hipotesis sobre estados de cromatina en regiones de interes.
- Modelado de expresion genica: uso de las pistas RNA-seq (Pearson 0,275 en validacion) como senal preliminar de expresion, con la cautela de que es la modalidad mas debil del modelo.
- Investigacion en destilacion sequence-to-function: reutilizar el esquema de teacher shards Zipoop y la arquitectura `alphagenome` como base para experimentos de escalado y comparacion con pooper-b6.
- Benchmarking interno de arquitecturas genomicas: emplear el checkpoint y `log.jsonl` como referencia reproducible del fold0 de AlphaGenome para comparar variantes de learning rate, cabeza o schedule, dado que el autor senala que el escalado no mejoro los resultados.

## Benchmarks y rendimiento

Validacion en fold0 (Pearson por ventana, extraido del log de entrenamiento, 40 evaluaciones):

| Ensayo | Mejor (paso 19.500) | Final (paso 20.000) |
|---|---|---|
| ATAC | 0,659 | 0,658 |
| DNase | 0,642 | 0,641 |
| ChIP (histonas) | 0,440 | 0,439 |
| RNA-seq | 0,278 | 0,275 |
| Media | 0,404 | 0,402 |
| Balanceada | 0,505 | 0,503 |

En el paso 20.000, con Pearson log1p a 128 pb: ATAC 0,603, DNase 0,626, ChIP 0,445, RNA 0,545, balanceada 0,555.

Como referencia, el modelo menor pooper-b6 (407M) alcanza media 0,416 y balanceada 0,516 con los mismos 20.000 pasos, por lo que el escalado a ~983M no mejoro la validacion en esta ejecucion. No se han publicado resultados de benchmarks oficiales (fold1) en la informacion disponible.

## Requisitos de hardware

- VRAM de entrenamiento observada: aproximadamente 29,9 GB de GPU (con gradient checkpointing).
- VRAM de inferencia estimada: no disponible de forma explicita; el checkpoint pesa 11,98 GB en precision de entrenamiento, por lo que se requiere al menos esa cantidad mas activaciones y overhead del framework.
- GPU recomendadas: no especificadas por el autor; por el consumo de memoria de entrenamiento, GPUs de 40 GB o mas (A100 40/80 GB, H100) son el entorno natural. No se confirma compatibilidad con GPUs de consumo.
- Cabe en consumer GPU: no disponible; el tamano del checkpoint (11,98 GB) y el consumo de entrenamiento sugieren que no de forma holgada en GPUs de 24 GB sin cuantizacion, que no se publica.
- Opciones de despliegue: solo se documenta PyTorch (`best.pt`); no se proporcionan artefactos GGUF, vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento se registran 3,19 s/paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Validacion (media / balanceada) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pooper-b10-1b | ~983M | ventanas de 32.768 pb | 0,404 / 0,505 | CC-BY-4.0 | Hugging Face (zatumout) |
| pooper-b6 | 407M | ventanas de 32.768 pb | 0,416 / 0,516 | no disponible en la informacion | Hugging Face (misma familia, referenciado en la model card) |
| AlphaGenome | no disponible | no disponible | no disponible (solo se usa su split fold0) | no disponible | no disponible |

## Limitaciones y advertencias

- Solo se ofrecen numeros de validacion durante el entrenamiento; no existe evaluacion de test fold1 estilo oficial para este checkpoint.
- RNA-seq y ChIP de histonas son claramente mas debiles que ATAC y DNase (Pearson 0,275 y 0,439 frente a 0,658 y 0,641).
- Prototipo de investigacion: no es una herramienta validada para uso clinico ni para prediccion de efectos de variantes.
- El modelo se entreno contra teacher shards Zipoop; la model card no afirma que las puntuaciones reflejen concordancia con la senal cruda de ENCODE.
- Ejecucion con una sola semilla, sin replicas.
- El escalado de 407M a 983M no mejoro la validacion; la causa (learning rate, diseno de cabeza, schedule) no se ha investigado y las configuraciones de evaluacion de ambas ejecuciones no se compararon punto por punto.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero el caracter no validado del modelo desaconseja su uso en produccion clinica o regulatoria.
- No se documentan sesgos especificos; al operar sobre GRCh38 y pistas ENCODE, hereda los sesgos de cobertura y composicion de dichos datasets.

## Enlaces

- Hugging Face: https://huggingface.co/zatumout/pooper-b10-1b
