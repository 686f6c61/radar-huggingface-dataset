# Zatom-AI/Zatom-2

## Resumen

Zatom-2 es un modelo atomistico unificado desarrollado por Zatom-AI para modelado generativo y aprendizaje de representaciones sobre moleculas pequenas, materiales periodicos y proteinas. Se presenta en el articulo "Zatom-2: Multitask Pretraining on Atomistic Data for Generative Modeling across Domains" (arXiv:2610.11454) y combina una arquitectura Transformer multiescala con conditional flow matching, lo que permite generacion 3D incondicional, prediccion de estructura y prediccion de energias moleculares y materiales junto con fuerzas interatomicas.

El modelo aborda un problema recurrente en el aprendizaje automatico para ciencias: la fragmentacion de modelos especializados por dominio (quimica de moleculas pequenas, fisica de materiales, biologia estructural). Zatom-2 propone un unico backbone preentrenado de forma multitarea sobre datos atomisticos de distintos dominios, con capacidad de condicionamiento por fuerzas. Esto lo situa como un candidato a modelo fundacional para pipelines de diseno generativo y simulacion en entornos cientificos.

El repositorio de pesos ocupa 50,9 GB y se distribuye bajo licencia MIT, lo que facilita su uso comercial. La model card no detalla el numero de parametros, la longitud de contexto ni los tipos de cuantizacion, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multiescala con conditional flow matching |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; el modelo opera sobre representaciones atomisticas, no texto libre) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 50,9 GB; instalacion via CLI `nucleus install zatom2`) |

## Arquitectura y entrenamiento

Zatom-2 emplea un Transformer multiescala acoplado a conditional flow matching. La generacion se formula como un proceso de flujo condicional, lo que permite muestrear estructuras 3D y, ademas, condicionar la generacion por fuerzas. El modelo se entrena con tareas de preentrenamiento fundacional: generacion 3D incondicional, prediccion de estructura, y prediccion de energias y fuerzas interatomicas (MLIP). La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos no estan disponibles.

La propuesta tecnica destacable es la unificacion de dominios (moleculas, materiales periodicos y proteinas) en un unico modelo con preentrenamiento multitarea, apoyandose en herramientas del ecosistema como AtomWorks, cuequivariance, Foundry/RFdiffusion3, lemat-genbench, posebusters y ProteinMPNN. El repositorio incluye checkpoints especificos, como el de transferencia SCOPe condicionado por fuerzas para proteinas.

## Capacidades

- Generacion 3D incondicional de moleculas pequenas.
- Generacion de materiales periodicos en 3D.
- Generacion de estructuras proteicas, con checkpoint especifico SCOPe condicionado por fuerzas.
- Prediccion de estructura (structure prediction).
- Prediccion de energias moleculares y de materiales.
- Prediccion de fuerzas interatomicas (modelo de potencial interatomico, MLIP).
- Condicionamiento por fuerzas en el proceso generativo.
- Aprendizaje de representaciones atomisticas reutilizables (representation learning).
- Evaluacion integrada mediante suites (`evaluate-generation`, `evaluate-mlip`) sobre OMol25 y OMat24.
- Soporte de tool calling, agentes o razonamiento multi-paso en lenguaje natural: no disponible (no es un modelo de lenguaje conversacional).

## Casos de uso

- Descubrimiento de farmacos: generacion de moleculas 3D candidatas con `zatom2 design` y evaluacion frente a distribuciones de referencia como OMol25, aprovechando el preentrenamiento multitarea para proponer estructuras quimicamente plausibles.
- Diseno de materiales: generacion de estructuras periodicas y evaluacion sobre OMat24 para explorar candidatos en dominios como baterias, catalisis o semiconductores.
- Prediccion de propiedades energeticas: uso del modo MLIP (`evaluate-mlip`) para estimar energias y fuerzas interatomicas en simulaciones de dinamica molecular o cribado de compuestos.
- Diseno de proteinas: generacion de estructuras proteicas con el checkpoint SCOPe condicionado por fuerzas, util en ingenieria de proteinas y biologia estructural.
- Relajacion y validacion de estructuras: combinacion de prediccion de fuerzas con herramientas como posebusters para filtrar geometrias fisicamente inconsistentes en pipelines de generacion.
- Cribado virtual a gran escala: uso de las representaciones aprendidas como features para modelos downstream de prediccion de propiedades, reduciendo la necesidad de entrenar desde cero por dominio.
- Investigacion en modelos fundacionales cientificos: punto de partida para fine-tuning multitarea sobre datos atomisticos propios, gracias a la licencia MIT y a la disponibilidad de scripts de entrenamiento en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona evaluaciones sobre OMol25 (generacion de moleculas) y OMat24 (generacion de materiales periodicos) y un checkpoint asociado a la tabla 3 (SCOPe), pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio de pesos ocupa 50,9 GB, lo que sugiere requisitos de memoria elevados en precision completa.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del checkpoint, se anticipan GPU de clase数据中心 (A100, H100) o superiores, aunque el autor no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del checkpoint hace improbable su ejecucion en GPU de consumo sin cuantizacion, y no se documentan formatos cuantizados.
- Opciones de despliegue: CLI `zatom2` y paquete `zatom-nucleus` (instalacion via `uv` o `pip`); no se documenta soporte de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominios | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zatom-2 | no disponible | no disponible | Moleculas, materiales, proteinas | MIT | Pesos en HF, codigo en GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en el material proporcionado; no se han incluido alternativas para no inventar datos.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al operar sobre datos atomisticos, los sesgos estarian ligados a la composicion de los datasets de entrenamiento, que no se detalla.
- Riesgo de alucinacion estructural: como modelo generativo 3D, puede producir geometrias no fisicamente validas; se recomienda validacion con herramientas como posebusters.
- Limitaciones de contexto e idioma: no se especifica ventana de contexto; el unico idioma declarado es ingles, aunque el modelo no es conversacional.
- Restricciones de licencia: licencia MIT, permisiva para uso comercial, pero conviene revisar las licencias de las dependencias (AtomWorks, RFdiffusion3, ProteinMPNN, etc.) que pueden tener terminos propios.
- Caveat de produccion: no se documentan cuantizaciones ni benchmarks numericos, lo que dificulta estimar coste y rendimiento antes de desplegar; el tamano del repositorio (50,9 GB) implica infraestructura de almacenamiento y memoria considerable.
- Fecha de creacion del repositorio (2026-09-03) y articulo asociado (2026): verificar vigencia y posibles actualizaciones de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zatom-AI/Zatom-2
- Articulo arXiv: https://arxiv.org/abs/2610.11454
- Pagina del paper en HF: https://huggingface.co/papers/2610.11454
- Repositorio GitHub: https://github.com/Zatom-AI/nucleus
- Pagina del proyecto: https://zatom-ai.github.io/nucleus
- AtomWorks: https://github.com/RosettaCommons/atomworks
- cuequivariance: https://github.com/NVIDIA/cuequivariance
- Foundry / RFdiffusion3: https://github.com/RosettaCommons/foundry
- lemat-genbench: https://github.com/LeMaterial/lemat-genbench
- lightning-hydra-template: https://github.com/ashleve/lightning-hydra-template
- Mol*: https://github.com/molstar/molstar
- posebusters: https://github.com/maabuu/posebusters
- ProteinMPNN: https://github.com/dauparas/ProteinMPNN
