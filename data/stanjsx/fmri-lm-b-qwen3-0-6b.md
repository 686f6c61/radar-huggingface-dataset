# stanjsx/fMRI-LM-B-Qwen3-0.6B

## Resumen

fMRI-LM-B-Qwen3-0.6B es un checkpoint ajustado por instrucciones del proyecto fMRI-LM, un modelo fundacional orientado a alinear imagenes de resonancia magnetica funcional (fMRI) con lenguaje. Lo desarrolla el equipo encabezado por Yuxiang Wei (repositorio `yuxiangwei0808/fMRI-LM`), con la participacion de Vince D. Calhoun entre los autores, y se publica en el Hub bajo la cuenta `stanjsx`. El problema que aborda es la decodificacion cerebro-lenguaje: convertir senales de actividad cerebral en representaciones compatibles con un modelo de lenguaje, de forma que puedan generarse descripciones textuales o evaluarse tareas de comprension a partir de fMRI.

Tecnicamente, el checkpoint es autocontenido: incluye el tokenizer de fMRI, el positional embedding, la capa encode-transform y el modelo de lenguaje Qwen3-0.6B con sus adaptadores LoRA, ademas de los `model_args` y las metricas de validacion del entrenamiento. El componente de lenguaje es, por tanto, un transformer decoder-only de aproximadamente 0,6 mil millones de parametros, el resto son modulos especificos del dominio de neuroimagen. El archivo publicado (`fMRI-LM-B-Qwen3-0.6B-instruct.pt`, 2,56 GiB) permite evaluar sin necesidad de cargar ficheros separados de las etapas 1 y 2.

Su relevancia actual es de investigacion: se trata de un checkpoint muy reciente (publicado el 18 de septiembre de 2026 segun los metadatos del Hub, con 0 descargas y 0 likes) que ofrece un punto de partida reproducible para trabajos de decodificacion cerebral, con un pipeline de evaluacion zero-shot ya publicado y unas condiciones de preprocesado de entrada muy concretas. La model card no detalla la licencia ni la lista de idiomas, y limita explicitamente el uso a investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con adaptadores LoRA, mas tokenizer de fMRI, positional embedding y capa encode-transform especificos del dominio; la model card no detalla la configuracion completa |
| Parametros totales | No disponible (el componente de lenguaje es Qwen3-0.6B, en torno a 0,6 mil millones de parametros; el total del checkpoint no se especifica) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publica el checkpoint en PyTorch sin variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; la model card indica "Research use only" (uso exclusivo de investigacion) |
| Formato de pesos | PyTorch (`.pt`, `torch.load`, `weights_only=False`) con `state_dict` y claves `llm.*`, `tokenizer.*`, `pos_embed`, `encode_transform_layer.*` |
| Tamano del archivo | `fMRI-LM-B-Qwen3-0.6B-instruct.pt`, 2,56 GiB (repositorio de 2,7 GB) |
| Entrada esperada | Series de fMRI con TR remuestreado a 2,0 s, 160 puntos temporales y 450 ROIs (Schaefer-400 + Tian-S3), con robust z-score por ROI y normalizacion de varianza por sitio |
| Pipeline declarado | text-generation |
| Fecha de publicacion en el Hub | 18 de septiembre de 2026 (ultima actualizacion: 18 de septiembre de 2026) |

## Arquitectura y entrenamiento

La model card no describe con detalle el proceso de entrenamiento. Lo que si especifica es la composicion del checkpoint: un tokenizer de fMRI, un positional embedding, una capa encode-transform y el modelo de lenguaje Qwen3-0.6B acompanado de adaptadores LoRA. Esta estructura indica un esquema de adaptacion en dos partes: un modulo que proyecta la senal fMRI a un espacio que el modelo de lenguaje puede consumir, y un backbone de lenguaje ajustado mediante LoRA, presumiblemente sobre una reconstruccion del checkpoint de instrucciones del propio modelo base. La model card menciona la existencia de "etapa 1" y "etapa 2" en el pipeline del proyecto, pero no aporta detalles de ninguna de ellas en este repositorio.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El checkpoint incluye internamente `ckpt["model_args"]` con la configuracion de arquitectura usada en el entrenamiento y `ckpt["validation_results"]` con las metricas registradas por la ejecucion, de modo que los detalles concretos de configuracion y validacion deben extraerse del propio archivo, no de la model card. La innovacion tecnica destacable es el propio pipeline de alineamiento fMRI-lenguaje con preprocesado estandarizado (160 puntos temporales, 450 ROIs, normalizacion por sitio), que busca hacer comparables datos de distintos centros.

## Capacidades

- Generacion de texto condicionada a representaciones de fMRI, segun el pipeline declarado (`text-generation`) y la orientacion del proyecto al alineamiento cerebro-lenguaje.
- Decodificacion cerebral (brain decoding): mapeo de actividad fMRI a representaciones de lenguaje, etiquetado como tarea central del modelo.
- Modelo ajustado por instrucciones (instruction-tuned), lo que implica capacidad de seguir instrucciones en el espacio de lenguaje del backbone Qwen3-0.6B.
- Procesamiento de series temporales de fMRI con un formato de entrada fijo: 160 puntos temporales, TR de 2,0 s y 450 ROIs.
- Adaptacion mediante LoRA, lo que facilita el reajuste sobre nuevos datasets sin modificar todos los pesos del backbone.
- Evaluacion zero-shot soportada por el repositorio (`bash scripts/eval_zeroshot.sh`).
- Tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas (idiomas no disponibles).
- Vision, audio u otras modalidades fuera de fMRI y texto: no documentadas.

## Casos de uso

- Investigacion en decodificacion cerebro-lenguaje: el modelo permite convertir patrones de actividad fMRI en representaciones de lenguaje, lo que sirve para estudiar hasta que punto la senal cerebral contiene informacion linguistica recuperable. Su utilidad aqui reside en que el checkpoint es autocontenido y evaluable sin montar el pipeline completo por etapas.
- Reproduccion de resultados con evaluacion zero-shot: colocando el archivo en `checkpoints/released/fMRI-LM-B-Qwen3-0.6B/` y ejecutando `scripts/eval_zeroshot.sh` se obtiene una linea base reproducible, util para equipos que quieran comparar sus propios metodos contra una referencia publicada.
- Estudios multi-sitio de neuroimagen: el preprocesado exige normalizacion de varianza por sitio, lo que hace el modelo adecuado para cohorts agregadas de varios centros donde la variabilidad entre escaneres es un problema conocido.
- Generacion de descripciones textuales a partir de actividad cerebral: en entornos de investigacion cognitiva, el modelo puede producir texto condicionado a la senal fMRI, por ejemplo para tareas de etiquetado de estimulos o de contenido evocado.
- Reajuste con LoRA sobre nuevos datasets de fMRI: dado que el checkpoint incluye adaptadores LoRA, un laboratorio puede especializar el modelo en su propia cohorte o paradigma experimental partiendo de este punto, con un coste de computo muy inferior al entrenamiento desde cero.
- Analisis comparativo de arquitecturas de alineamiento: al disponer de `model_args` y `validation_results` dentro del fichero, el checkpoint sirve como referencia para comparar variantes del encoder de fMRI manteniendo fijo el backbone de lenguaje.
- Docencia y prototipado en neurociencia computacional: el tamano de 2,56 GiB y la posibilidad de cargar en CPU (`map_location="cpu"`) permiten usar el modelo en entornos academicos sin GPUs de gama alta.
- Integracion como encoder multimodal en pipelines de investigacion: el modulo encode-transform y el tokenizer de fMRI pueden reutilizarse como componente de un sistema mayor que combine neuroimagen con texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas especificas de decodificacion cerebral. El unico dato al respecto es que el propio fichero del checkpoint contiene una entrada `validation_results` con las metricas registradas durante la ejecucion, que el usuario puede inspeccionar tras cargarlo:

```python
ckpt = torch.load("fMRI-LM-B-Qwen3-0.6B-instruct.pt", map_location="cpu", weights_only=False)
print(ckpt["validation_results"])
```

## Requisitos de hardware

- El checkpoint ocupa 2,56 GiB en disco. El ejemplo oficial de carga usa `map_location="cpu"`, por lo que la inferencia en CPU es factible, aunque con latencias no documentadas.
- Estimacion de VRAM para inferencia: al tratarse de un backbone de aproximadamente 0,6 mil millones de parametros mas modulos auxiliares, cabe en GPUs de consumo con 8 GB o mas si se mantiene la precision de almacenamiento del checkpoint. Estas cifras son estimaciones a partir del tamano del fichero; la model card no publica requisitos de memoria.
- GPU recomendadas: no especificadas por el autor. Para evaluacion en lote sobre cohortes de fMRI, una GPU de centro de datos (A100, H100) reduce el tiempo total; para desarrollo y pruebas, una RTX 4090 o similar es suficiente por margen amplio.
- Compatibilidad con GPU de consumo: si, previsiblemente en cualquier GPU con 8 GB o mas de VRAM, dado el tamano del modelo.
- Opciones de despliegue: la model card solo documenta la carga directa con `torch.load` y la evaluacion mediante el repositorio (`scripts/eval_zeroshot.sh`). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, y el tokenizer de fMRI personalizado hace poco probable un despliegue directo en esos motores sin trabajo adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de benchmarks ni datos de rendimiento de este checkpoint, y no se han identificado en el material disponible modelos comparables de decodificacion fMRI-lenguaje con tamano, contexto y licencia equiparables. El unico punto de referencia identificable es el propio backbone de lenguaje, Qwen3-0.6B, que no es comparable en tarea porque carece de los modulos de fMRI y de los adaptadores LoRA aqui incluidos. Cualquier tabla comparativa con cifras seria una invencion, por lo que se omite.

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: la model card indica "Research use only", lo que excluye aplicaciones clinicas, comerciales o de produccion sin autorizacion explicita del autor.
- Licencia no disponible: al no figurar una licencia en el repositorio, no puede asumirse permiso de uso comercial ni de redistribucion. Conviene contactar con los autores antes de cualquier uso mas alla de la investigacion.
- Dependencia estricta del preprocesado: la entrada debe tener TR remuestreado a 2,0 s, 160 puntos temporales y 450 ROIs (Schaefer-400 + Tian-S3), con robust z-score por ROI y normalizacion de varianza por sitio. Cualquier desviacion de este formato invalida los resultados, y el modelo no ofrece tolerancia documentada a otras configuraciones.
- Idiomas no disponibles: se desconoce que lenguas maneja el backbone ajustado, lo que impide garantizar calidad en castellano u otros idiomas.
- Riesgo de alucinacion: al incorporar un modelo de lenguaje generativo, las salidas textuales pueden ser plausibles pero incorrectas, especialmente en tareas de decodificacion donde la senal fMRI es ambigua. No debe interpretarse el texto generado como una lectura fiable de la actividad cerebral.
- Sesgos potenciales: la model card no documenta analisis de sesgo ni caracterizacion demografica de los datos de entrenamiento. Los datasets de neuroimagen suelen presentar cohortes reducidas y sesgos de sitio, de escaner y de poblacion, pero no hay informacion publicada para cuantificarlos en este modelo.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y los metadatos indican una fecha de publicacion muy reciente (18 de septiembre de 2026). No hay evidencia independiente de reproducibilidad.
- Ausencia de datos de rendimiento: sin benchmarks publicos ni requisitos de hardware oficiales, es imposible estimar de antemano la calidad de las salidas o el coste real de despliegue.
- Ausencia de soporte para stacks estandar: no hay versiones GGUF, safetensors ni integraciones con vLLM, Ollama o TGI, lo que limita su uso en infraestructura de produccion convencional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanjsx/fMRI-LM-B-Qwen3-0.6B
- Repositorio de codigo: https://github.com/yuxiangwei0808/fMRI-LM
- Paper (arXiv): https://arxiv.org/abs/2511.21760
- Referencia bibliografica: Wei, Y., Zhang, Y., Xiao, X., Qian, C., Wang, T., Calhoun, V. D. "fMRI-LM: Towards a Universal Foundation Model for Language-Aligned fMRI Understanding", arXiv preprint arXiv:2511.21760, 2025.
