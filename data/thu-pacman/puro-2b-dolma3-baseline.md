# thu-pacman/Puro-2B-Dolma3-Baseline

## Resumen

Puro-2B-Dolma3-Baseline es un modelo de lenguaje de 2.000 millones de parametros publicado por el usuario thu-pacman en Hugging Face bajo licencia Apache 2.0. Por el identificador se deduce que se trata de un modelo de aproximadamente 2B de parametros entrenado sobre el corpus Dolma 3, el conjunto de datos abierto de AI2 utilizado habitualmente para entrenar modelos como OLMo. El sufijo "Baseline" sugiere que se trata de un punto de referencia o modelo base, probablemente sin ajuste fino posterior (SFT) ni alineacion con preferencias humanas.

La relevancia del modelo radica en su caracter de linea base reproducible: un modelo pequeno, con licencia permisiva y entrenado sobre un dataset abierto y documentado, lo que lo hace util para experimentacion academica, ablaciones y comparaciones controladas. Sin embargo, la model card publicada es practicamente vacia (unicamente contiene la declaracion de licencia), por lo que no hay informacion oficial sobre arquitectura exacta, composicion del dataset, numero de tokens de entrenamiento ni proceso de alineacion.

La ficha que sigue se ha elaborado a partir de los metadatos disponibles en Hugging Face y de las convenciones habituales de la familia Dolma/OLMo, marcando explicitamente como "no disponible" todo aquello que el autor no ha documentado. No se han publicado resultados de benchmarks ni detalles tecnicos verificables en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer decoder-only, no confirmado por el autor) |
| Parametros totales | aproximadamente 2B (inferido del nombre del modelo; no confirmado) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (al ser un modelo de 2B es compatible con cuantizaciones estandar de 8 y 4 bits mediante herramientas genericas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se especifica en la model card) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en la model card. El nombre del modelo sugiere un transformer decoder-only de aproximadamente 2.000 millones de parametros, entrenado sobre el corpus Dolma 3 de AI2, pero el autor no documenta ni la configuracion de capas, ni las dimensiones ocultas, ni el numero de cabezas de atencion, ni el esquema de atencion (completa, GQA, sliding window, etc.).

Tampoco hay datos sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, la existencia de fases de SFT, RLHF o DPO, ni sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal. Al tratarse de un modelo etiquetado como "Baseline", es plausible que haya recibido unicamente preentrenamiento, pero esto es una inferencia y no una afirmacion verificada por el autor.

## Capacidades

- Generacion de texto autoregresiva: capacidad esperable en un modelo de lenguaje preentrenado, aunque no documentada oficialmente.
- Razonamiento y conocimiento general: presumible, condicionado al corpus Dolma 3 y al volumen de tokens de entrenamiento, dato no publicado.
- Generacion de codigo y matematicas: no confirmado; los modelos base sin ajuste fino suelen rendir por debajo de modelos alineados en estas tareas.
- Tool calling / function calling: no disponible; no se documenta ningun formato de herramientas ni plantilla de chat.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el autor no declara idiomas soportados.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; no hay indicios de modalidades adicionales.

## Casos de uso

- Investigacion academica sobre entrenamiento de LLMs: el modelo sirve como linea base reproducible para estudiar el efecto de cambios en el dataset, el tokenizador o la receta de entrenamiento, dado su tamano manejable y su licencia permisiva.
- Ablaciones controladas: al ser un "Baseline", permite comparar contra variantes derivadas (por ejemplo, versiones con SFT o DPO) para aislar la contribucion de cada fase.
- Fine-tuning especifico de dominio: con 2B de parametros, es viable ajustarlo en un unico nodo con GPUs de 24-80 GB para tareas de clasificacion, extraccion o generacion acotada.
- Destilacion y generacion de datos sinteticos: puede emplearse para producir datos de entrenamiento a bajo coste computacional en pipelines de destilacion hacia modelos mas pequenos.
- Despliegue en entornos con recursos limitados: su tamano permite inferencia en GPU de consumo tras cuantizacion, util para prototipos y demos internas.
- Evaluacion comparativa de corpus: al estar entrenado sobre Dolma 3, sirve para medir el impacto de dicho corpus frente a alternativas como FineWeb o The Pile en tareas estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4-5 GB solo para pesos, mas overhead de cache KV (dependiente de la longitud de contexto, no publicada).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 2-3 GB; en 4 bits: aproximadamente 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, A10, L4). Para entrenamiento o fine-tuning completo se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores, especialmente con cuantizacion.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers, siempre que los pesos esten en un formato compatible (no confirmado por el autor).
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantizacion y la longitud de contexto, ninguno de los cuales esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Puro-2B-Dolma3-Baseline | ~2B (inferido) | no disponible | Apache 2.0 | Hugging Face | Model card vacia; sin benchmarks |
| OLMo-2-1B-7B (AI2) | 1B / 7B | 4k-4k | Apache 2.0 | Hugging Face | Entrenado sobre Dolma; documentacion completa |
| Gemma 2 2B (Google) | 2,6B | 8k | Gemma Terms | Hugging Face | Requiere aceptacion de terminos; benchmarks publicados |
| Qwen2.5-1.5B (Alibaba) | 1,5B | 32k | Apache 2.0 | Hugging Face | Benchmarks publicados; multilingue |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento del modelo Puro-2B-Dolma3-Baseline para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre arquitectura, datos, contexto ni alineacion, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion: al ser presumiblemente un modelo base sin alineacion, es esperable una tendencia alta a generar contenido plausible pero incorrecto.
- Sesgos: el corpus Dolma 3, como cualquier dataset web a gran escala, contiene sesgos de genero, raza, idioma y geografia; el autor no documenta filtrado ni mitigacion.
- Limitaciones de idioma: no se declaran idiomas soportados; el rendimiento fuera del ingles es incierto.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime al usuario de cumplir las obligaciones de atribucion y de evaluar los riesgos del modelo.
- Ausencia de benchmarks: no es posible comparar su rendimiento con alternativas sin realizar evaluaciones propias.
- Fecha de publicacion futura en los metadatos (2026-11-22): conviene verificar la integridad del repositorio antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/thu-pacman/Puro-2B-Dolma3-Baseline
- Corpus Dolma (AI2): https://huggingface.co/datasets/allenai/dolma
- Repositorio OLMo (referencia de la familia Dolma): https://github.com/allenai/OLMo
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la informacion proporcionada.
