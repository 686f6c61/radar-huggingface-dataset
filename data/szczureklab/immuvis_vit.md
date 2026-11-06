# SzczurekLab/ImmuVis_ViT

## Resumen

ImmuVis ViT es un modelo fundacional de tipo masked autoencoder basado en Vision Transformer, desarrollado por SzczurekLab para imaging mass cytometry (IMC) y otras modalidades de imagen multiplexada. A diferencia de los modelos de visión convencionales, que asumen un espacio de canales fijo (RGB), ImmuVis opera sobre subconjuntos arbitrarios de marcadores moleculares sin necesidad de reentrenamiento, gracias a hyperkernels condicionados por marcador y a un tokenizador de 265 marcadores. El modelo resuelve el problema de la heterogeneidad de paneles en estudios de tejido a gran escala, donde cada experimento mide un conjunto distinto de proteínas.

La variante publicada en Hugging Face, ImmuVis_ViT, emplea un encoder pan-marcador y un decoder condicionado por marcador, con un ancho latente de 768. El decoder produce logits de media y log-varianza para cada marcador solicitado, lo que permite tanto reconstrucción como virtual staining con estimación de incertidumbre. El repositorio ocupa 1,0 GB y se distribuye bajo licencia MIT, lo que facilita su uso comercial y su integración en pipelines de investigación.

El modelo es relevante ahora porque los modelos fundacionales para imagen biomédica multiplexada están emergiendo como infraestructura para tareas de virtual staining, imputación de canales y análisis espacial de tejidos. ImmuVis se posiciona como una alternativa eficiente frente a enfoques que requieren reentrenar un modelo por cada panel de marcadores, un cuello de botella habitual en IMC.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer con masked autoencoder; hyperkernels condicionados por marcador, encoder pan-marcador y decoder condicionado por marcador |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre parches de imagen multiplexada, no sobre texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no linguistico) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 1,0 GB; carga via `from_pretrained` de la libreria `immuvis`) |

## Arquitectura y entrenamiento

ImmuVis ViT es un masked autoencoder sobre una arquitectura Vision Transformer adaptada a imagenes multiplexadas. La innovacion central son los hyperkernels condicionados por marcador: en lugar de tratar los canales como un tensor fijo, el modelo genera los kernels de patchify a partir de la identidad del marcador, de modo que puede procesar cualquier subconjunto de los 265 marcadores definidos en `markers_tokenizer.yaml`. Un encoder pan-marcador comparte representaciones entre marcadores, y un decoder condicionado por marcador reconstruye los canales solicitados emitiendo logits de media y log-varianza, lo que aporta una estimacion explicita de incertidumbre.

El modelo se entrena con un objetivo de enmascarado (masked autoencoding) sobre un dataset a gran escala de IMC, segun describe el paper asociado (arXiv 2602.04585). La informacion disponible no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables a un modelo de imagen). La evaluacion publicada se centra en virtual staining, donde el modelo supera a alternativas tradicionales con errores notablemente menores, aunque las cifras concretas no se recogen en la informacion proporcionada.

## Capacidades

- Reconstruccion y virtual staining de imagenes multiplexadas de IMC: predice la intensidad de marcadores no medidos o enmascarados a partir del resto del panel.
- Operacion sobre subconjuntos arbitrarios de marcadores sin reentrenamiento, gracias a los hyperkernels condicionados por marcador.
- Soporte de 265 marcadores definidos por el tokenizador incluido; el mapeo de IDs debe respetarse estrictamente.
- Salida con incertidumbre: logits de media y log-varianza por marcador solicitado.
- Extraccion de representaciones latentes de ancho 768 para tareas downstream (clasificacion, segmentacion, analisis espacial).
- Procesamiento de imagenes multiplexadas de tejido para perfilado espacial a gran escala.
- No dispone de tool calling, capacidades de agente, generacion de texto ni procesamiento de lenguaje natural.

## Casos de uso

- Virtual staining en IMC: dado un panel medido, el modelo predice los marcadores ausentes, lo que permite reducir el coste y el tiempo de adquisicion experimental sin perder informacion biologica relevante.
- Imputacion de canales danados o de baja calidad: en experimentos donde un canal presenta ruido o artefactos, ImmuVis puede reconstruirlo a partir de los marcadores restantes y de la estructura espacial del tejido.
- Armonizacion de paneles entre estudios: al operar sobre subconjuntos arbitrarios de marcadores, permite comparar o integrar cohorts adquiridas con paneles distintos sin reentrenar un modelo por panel.
- Preentrenamiento para tareas downstream: las representaciones latentes de 768 dimensiones sirven como features para clasificacion de regiones tisulares, deteccion de tipos celulares o segmentacion.
- Analisis espacial de microambiente tumoral: el modelo procesa imagenes multiplexadas de tejido completo y facilita el estudio de la organizacion espacial de poblaciones celulares.
- Control de calidad de adquisiciones: la log-varianza predicha por el decoder puede emplearse como senal de anomalia para detectar parches mal adquiridos o desalineaciones entre canales.
- Investigacion en biologia del desarrollo y neurociencia: perfilado multiplexado de secciones de tejido con paneles variables a lo largo de un estudio longitudinal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. El paper asociado (arXiv 2602.04585) indica mejoras significativas frente a modelos tradicionales en evaluaciones de virtual staining, con errores marcadamente menores, pero las cifras concretas no se recogen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repo (1,0 GB) sugiere que los pesos en precision completa caben en GPUs consumer, pero no se confirma el numero de parametros ni la VRAM real necesaria.
- GPU recomendadas: no disponible. Por el tamano del repo, es plausible su ejecucion en GPUs con 8-16 GB de VRAM, pero este dato no esta confirmado por el autor.
- Cabe en consumer GPU: probablemente si, dado el tamano de los pesos, aunque no hay confirmacion oficial.
- Opciones de despliegue: la libreria oficial `immuvis` (Python 3.12 o superior) mediante `MultiplexAutoencoder.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos fundacionales para IMC o imagen multiplexada) con especificaciones verificables.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para imagenes multiplexadas (IMC); no procesa texto, codigo ni imagenes naturales.
- El tokenizador de marcadores debe usarse exactamente como se distribuye; renumerar IDs produce resultados incorrectos.
- Solo cubre los 265 marcadores definidos en `markers_tokenizer.yaml`; marcadores fuera de ese vocabulario no estan soportados.
- No se han publicado datos sobre sesgos del dataset de entrenamiento, que puede estar dominado por ciertos tejidos, paneles o protocolos de adquisicion.
- Riesgo de alucinacion en el sentido de reconstruir intensidades plausibles pero biologicamente incorrectas, especialmente en marcadores con baja correlacion espacial con el resto del panel.
- La licencia MIT permite uso comercial, pero no se ofrece garantia alguna sobre el rendimiento en dominios no representados en el entrenamiento.
- La ausencia de benchmarks publicados en la informacion disponible impide validar el rendimiento frente a alternativas en produccion.
- El modelo se publico en noviembre de 2026 y cuenta con cero descargas y cero likes en Hugging Face, por lo que su validacion por la comunidad es practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/SzczurekLab/ImmuVis_ViT
- Repositorio GitHub: https://github.com/szczurek-lab/ImmuVis
- Paper en arXiv: https://arxiv.org/abs/2602.04585
- Resumen del paper en Emergent Mind: https://www.emergentmind.com/papers/2602.04585
