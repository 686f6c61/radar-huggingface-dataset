# WUrbane/twohop-520m

## Resumen

TwoHop 520m es una familia de modelos de lenguaje de aproximadamente 520 millones de parametros publicada por el usuario WUrbane en Hugging Face. El repositorio no contiene un modelo unico, sino un contenedor de directorios de modelos completos, cada uno de ellos obtenido mediante fine-tuning de un modelo base preentrenado dentro de un estudio de optimizadores del propio autor (`OptimizerStudy/adamw_*` o `OptimizerStudy/muon_*`). La variante documentada en la model card, `rrth-520m-M-adamw-lr3e-5-k1-o22`, parte de una base preentrenada con el optimizador Muon y se ajusta despues con AdamW.

El interes del proyecto es metodologico mas que de producto: cada subcarpeta incluye su propia model card y un fichero `EXPORT.json` con hiperparametros, hashes y el modelo base utilizado, lo que permite reproducir y comparar experimentos de fine-tuning (learning rate, pasos, semilla, precision de matmul, clase de host). El repositorio ocupa 3,2 GB y esta pensado para cargarse con la libreria `transformers` indicando el subdirectorio correspondiente.

La informacion publica disponible es muy limitada: no se declara licencia, idiomas, pipeline ni datos de entrenamiento o evaluacion. Por tanto, esta ficha se limita a lo que el autor expone y marca explicitamente como no disponible todo aquello que no figura en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only para modelado causal de lenguaje (se infiere de `AutoModelForCausalLM`; no se detalla en la model card) |
| Parametros totales | 520M (segun el nombre del repositorio y de la variante) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La model card describe un proceso en dos fases. Primero, un preentrenamiento de un modelo base dentro del estudio de optimizadores del autor, identificado como `OptimizerStudy/muon_*` o `OptimizerStudy/adamw_*`. Segundo, un fine-tuning de ese base para producir la variante publicada. En el caso documentado, el base se preentreno con Muon y el ajuste fino se realizo con AdamW, con un learning rate principal de 3e-5, 682 pasos, rotacion/seed `k1 / 20261022`, precision de matmul `tf32` y ejecucion en una GPU de clase A100.

No se especifican en la informacion disponible el numero de tokens de preentrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o SFT adicionales, ni innovaciones arquitectonicas concretas (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.). El valor tecnico documentado se concentra en la trazabilidad del experimento: cada subcarpeta incluye `EXPORT.json` con hiperparametros, hashes y modelo base, lo que facilita la reproducibilidad de la comparativa entre optimizadores.

## Capacidades

- Generacion de texto autoregresiva mediante `AutoModelForCausalLM` y su tokenizer asociado.
- Fine-tuning reproducible: cada variante expone hiperparametros, semilla y modelo base en `EXPORT.json`.
- Compatibilidad con el ecosistema `transformers` y con endpoints (tag `endpoints_compatible`).
- Carga por subdirectorio, lo que permite alojar multiples variantes en un mismo repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Investigacion sobre optimizadores: el modelo sirve para comparar el efecto de AdamW frente a Muon en el preentrenamiento y el fine-tuning de un modelo de 520M, usando los ficheros `EXPORT.json` como registro de hiperparametros.
- Reproduccion de experimentos: al incluir hashes y semilla (`k1 / 20261022`), permite replicar el ajuste fino en una A100 con `tf32` y verificar resultados.
- Baseline de bajo coste para tareas de generacion de texto: con 520M de parametros es viable como punto de partida en prototipos de continuacion de texto o clasificacion generativa, siempre que se valide su calidad en el dominio concreto.
- Fine-tuning adicional sobre dominio propio: al ser un modelo pequeno y en formato `transformers`, se puede ajustar en una sola GPU para tareas especificas (resumen, extraccion, generacion controlada) partiendo de esta variante.
- Docencia y formacion: util para ilustrar pipelines de preentrenamiento y fine-tuning con distintos optimizadores y precisiones de matmul en hardware de datacenter.
- Experimentacion con despliegue: su tamano permite probar integraciones con `transformers` y endpoints sin requerir infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para 520M de parametros, en fp16 serian aproximadamente 1,0-1,1 GB solo de pesos, y en fp32 unos 2,1 GB, a lo que habria que sumar cache KV y overhead del runtime; estas cifras son estimaciones, no datos del autor.
- GPU recomendadas: el autor documenta entrenamiento en clase A100 con `tf32`; para inferencia no se especifica hardware.
- GPU de consumo: por tamano, cabria en GPUs de consumo con suficiente VRAM, pero no hay validacion publicada al respecto.
- Opciones de despliegue: `transformers` (soporte declarado). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados de rendimiento ni detalles de arquitectura que permitan una comparacion rigurosa con alternativas de tamano similar (por ejemplo, modelos de la familia de 500M-1B parametros). La comparacion relevante que si documenta el autor es interna: variantes preentrenadas con Muon frente a AdamW y ajustadas con distintos optimizadores y learning rates.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir permiso de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin informacion sobre idiomas: no se puede garantizar calidad en castellano ni en ningun otro idioma concreto.
- Sin benchmarks ni evaluacion publicada: no hay evidencia de calidad en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Sin datos de entrenamiento: se desconoce la composicion del corpus, los tokens vistos y posibles sesgos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluacion especifica que lo cuantifique.
- Longitud de contexto desconocida: limita el diseno de aplicaciones que dependan de ventanas largas.
- Proyecto experimental: el nombre del repositorio y la estructura por subcarpetas sugieren un estudio de investigacion, no un modelo listo para produccion.
- Descargas y likes nulos en el momento de la consulta: no hay comunidad ni validacion externa documentada.

## Enlaces

- Hugging Face: https://huggingface.co/WUrbane/twohop-520m
- Modelos base referenciados en la model card: `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*` (no se proporcionan URLs directas en la informacion disponible)
- Papers, blogs, repositorios o demos adicionales: no disponible
