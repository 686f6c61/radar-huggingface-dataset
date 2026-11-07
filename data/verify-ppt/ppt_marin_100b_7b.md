# verify-ppt/ppt_marin_100b_7b

## Resumen

`verify-ppt/ppt_marin_100b_7b` es un modelo de lenguaje de tipo transformer publicado por el colectivo verify-ppt como artefacto de investigacion asociado al paper "Synthetic Pre-pretraining Survives Scale, but Not as a Grammatical Prior" (arXiv:2609.39827). El nombre del checkpoint sugiere una ablacion sobre un modelo base de la familia Marin con 100B parametros totales y 7B parametros activos, es decir, una arquitectura de mezcla de expertos (MoE) con un ratio de activacion muy bajo (en torno al 7 %). Esta hipotesis se apoya en la convencion de nombres del repositorio y en la configuracion de entrenamiento publicada en el repositorio de GitHub del proyecto, no en una descripcion explicita de la model card, que es muy escueta.

El modelo aborda una pregunta concreta de investigacion: si el pre-pretraining con datos sinteticos mantiene su efecto beneficioso al escalar el tamano del modelo, y si ese efecto se traduce en una mejor competencia gramatical. El resultado que da titulo al paper es que el pre-pretraining sintetico sobrevive al escalado, pero no actua como un prior gramatical, lo que convierte a este checkpoint en una pieza de evidencia empirica mas que en un modelo orientado a produccion.

Su relevancia actual es metodologica: permite a otros equipos reproducir y auditar experimentos de pre-pretraining sintetico a escala de 100B parametros totales. No obstante, la informacion publica es minima (sin idiomas declarados, sin benchmarks en la model card y con cero descargas), por lo que debe tratarse como un modelo de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), inferida de la convencion de nombres "100b_7b"; no confirmada explicitamente en la model card |
| Parametros totales | 100B (segun el identificador del checkpoint; no confirmado en la model card) |
| Parametros activos | 7B (segun el identificador del checkpoint; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. A partir del identificador `marin_100b_7b` y de la configuracion de ablacion publicada en el repositorio `gucci-j/verify-ppt-at-scale` (ruta `training/configs/ablation/marin_100b_7b.yaml`), se deduce un transformer con capas de mezcla de expertos en el que solo una fraccion reducida de los 100B parametros totales se activa por token (7B). El modelo parte de la familia base Marin y se somete a un regimen de pre-pretraining con datos sinteticos antes del entrenamiento principal, que es precisamente la variable experimental del paper.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del corpus sintetico, la mezcla de idiomas ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. El unico detalle tecnico verificable es la hipotesis central del trabajo: el pre-pretraining sintetico mantiene su utilidad al escalar el modelo, pero no instala un prior gramatical medible, lo que sugiere que su beneficio proviene de otra senal (posiblemente regularizacion o cobertura de distribuciones) y no de una mejora en el modelado sintactico.

## Capacidades

- Generacion de texto autoregresiva, segun el pipeline declarado `text-generation`.
- Compatibilidad con la libreria transformers y con endpoints compatibles (tag `endpoints_compatible`).
- Capacidad de razonamiento, codigo o matematicas: no documentada en la informacion disponible.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas esta vacio.
- Modo thinking, vision o audio: no disponible.
- Uso previsto como checkpoint de investigacion para reproducir experimentos de pre-pretraining sintetico a escala.

## Casos de uso

- Reproduccion de experimentos de pre-pretraining sintetico: el checkpoint permite replicar la ablacion `marin_100b_7b` del paper y verificar si el efecto observado se mantiene con la misma configuracion de entrenamiento publicada en el repositorio.
- Investigacion sobre priors gramaticales: util para equipos que estudien si los datos sinteticos mejoran la competencia sintactica, comparando este modelo con su contrapartida sin pre-pretraining sintetico.
- Estudios de escalado en arquitecturas MoE: con 100B parametros totales y 7B activos, sirve para analizar el equilibrio entre capacidad y coste de inferencia en regimenes de activacion dispersa.
- Auditoria de metodologias de datos sinteticos: permite examinar como se comporta un modelo entrenado con datos generados cuando se evalua en tareas de gramatica y fluidez.
- Base para experimentos de ajuste fino controlado: al estar en safetensors y transformers, puede cargarse en pipelines de investigacion para comparar tecnicas de post-entrenamiento sobre un mismo sustrato.
- Docencia y formacion en IA: util como ejemplo practico de diseno experimental con ablaciones y de las limitaciones de los datos sinteticos a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 99,6 GB en safetensors, lo que es coherente con un modelo de ~100B parametros en precision de 16 bits; la inferencia en fp16 requeriria del orden de 200 GB de VRAM solo para pesos, cantidad estimada a partir del tamano del repo y no confirmada por el autor.
- Con cuantizacion a 8 bits, la huella de pesos se reduciria aproximadamente a la mitad (~100 GB); a 4 bits, a unos ~50 GB. Son estimaciones teoricas: no se publican variantes cuantizadas.
- GPU recomendadas: nodos multi-GPU de clase A100 80 GB u H100 80 GB; un solo acelerador no es suficiente para los pesos completos en fp16.
- No cabe en GPU de consumo (RTX 4090 con 24 GB) en ninguna precision documentada; solo seria viable con cuantizaciones agresivas no publicadas y asumiendo perdida de calidad no evaluada.
- Opciones de despliegue: transformers como via principal; vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| verify-ppt/ppt_marin_100b_7b | 100B / 7B (segun identificador) | no disponible | MIT | Hugging Face, 0 descargas |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se han identificado benchmarks ni especificaciones de referencia para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- La model card es minima: no declara idiomas, contexto, composicion de datos ni resultados de evaluacion, lo que impide caracterizar el comportamiento real del modelo.
- El propio paper concluye que el pre-pretraining sintetico no actua como prior gramatical; por tanto, no debe esperarse una mejora gramatical derivada de ese regimen.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor.
- Ausencia de datos de alineacion (RLHF, DPO o ajuste por instrucciones) documentados; el uso como asistente conversacional no esta respaldado.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero la licencia no implica idoneidad para produccion ni garantias de calidad.
- El checkpoint tiene cero descargas y cero likes, y se publico como artefacto de investigacion; no hay evidencia de uso en entornos reales.
- El coste de inferencia es elevado: aunque solo se activen 7B parametros por token, es necesario almacenar los 100B totales, lo que limita su despliegue a infraestructura multi-GPU.
- No se publican variantes cuantizadas ni formatos GGUF, lo que dificulta su uso en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/verify-ppt/ppt_marin_100b_7b
- Paper: https://huggingface.co/papers/2609.39827
- Pagina del proyecto: https://huggingface.co/verify-ppt
- Codigo: https://github.com/gucci-j/verify-ppt-at-scale
- Configuracion de la ablacion: https://github.com/gucci-j/verify-ppt-at-scale/blob/main/training/configs/ablation/marin_100b_7b.yaml
