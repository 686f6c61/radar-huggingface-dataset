# vtava/Qwen35-0.8B-FlyFFN-v2

## Resumen

Qwen35-0.8B-FlyFFN-v2 es un checkpoint de investigacion publicado por el usuario vtava (repositorio TinyCeNN-LM) que parte del modelo base Qwen/Qwen3.5-0.8B y le superpone una capa de FFN dispersa ("progressive FlyWire sparse FFN v2") con anclas densas. Se trata, por tanto, de un artefacto experimental de ~0,8 mil millones de parametros orientado a estudiar mecanismos de enrutamiento disperso tipo mixture-of-experts sobre un transformer pequeno ya preentrenado, no de un modelo listo para produccion.

El modelo resuelve, en el contexto de la investigacion, la necesidad de reproducir y auditar experimentos de esparsidad en FFN sin depender del sistema de archivos temporal de Colab: el repositorio conserva los artefactos de cada ejecucion bajo `runs/` junto con configuraciones, tokenizer y un informe de resultados. Esto lo hace relevante para quienes trabajan en eficiencia de inferencia y en arquitecturas MoE de bajo coste, no para equipos que buscan un modelo conversacional final.

La informacion publicada es deliberadamente minima: no se documentan idiomas, licencia, longitud de contexto, composicion del dataset ni resultados de evaluacion held-out. Las unicas metricas guardadas son internas del entrenamiento (`num_shards` = 8, `mean_route_mix` = 0.30835) y el propio autor advierte que la calidad de generacion puede diferir sustancialmente de la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-0.8B + progressive FlyWire sparse FFN v2 + dense anchors (transformer con FFN dispersa y enrutamiento; etiquetado como mixture-of-experts) |
| Parametros totales | no disponible (el modelo base se identifica como 0.8B en el nombre del checkpoint) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos shardeados en 8 fragmentos (`num_shards` = 8); formato de serializacion exacto no disponible |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 2.0 GB |
| Dataset de entrenamiento | no registrado ("Not recorded" en la model card) |
| Codigo fuente | https://github.com/vtavakkoli/TinyCeNN-LM |

## Arquitectura y entrenamiento

La arquitectura parte de un transformer denso (Qwen3.5-0.8B) al que se le sustituye o complementa el bloque feed-forward por una variante dispersa denominada "progressive FlyWire sparse FFN v2", manteniendo ademas "anclas densas" (dense anchors). El tag `mixture-of-experts` y la metrica `mean_route_mix` indican que existe un mecanismo de enrutamiento que reparte el computo entre expertos o rutas de la FFN; el valor medio de mezcla de rutas registrado en la ultima ejecucion es 0.30835, lo que sugiere que la mezcla de rutas es parcial y no un enrutamiento duro hacia un unico experto.

No se documenta el numero de tokens de entrenamiento, la composicion del dataset (la model card indica explicitamente "Dataset: Not recorded") ni si hubo fases de RLHF o DPO. El unico detalle de entrenamiento verificable es el guardado progresivo en 8 shards y la existencia de un `flyffn_config.json` con la configuracion especifica del modulo disperso. El entrenamiento se ejecuta por notebook desde el repositorio TinyCeNN-LM, con autenticacion mediante un secreto `HF_TOKEN` de Colab.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation` y el tag `conversational` esta presente, pero no se aportan ejemplos, demos ni evaluaciones que confirmen calidad conversacional.
- Razonamiento, matematicas y codigo: no disponible; no se publican resultados que acrediten estas capacidades.
- Tool calling / function calling: no disponible; no se menciona soporte en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision o audio: no disponible; es un modelo de texto.
- Capacidad especial: modulo de FFN dispersa con enrutamiento (FlyWire sparse FFN v2) y anclas densas, orientado a experimentacion sobre esparsidad, no a una funcion de producto.

## Casos de uso

- Investigacion sobre enrutamiento disperso en FFN: el checkpoint permite reproducir el experimento TinyCeNN-LM y analizar como evoluciona `mean_route_mix` (0.30835 en la ultima ejecucion) al variar la configuracion de `flyffn_config.json`.
- Ablaciones de esparsidad frente al modelo base: comparar salidas y perplejidad entre Qwen3.5-0.8B y esta variante para medir el coste en calidad de sustituir FFN densas por rutas dispersas con anclas.
- Docencia y prototipado de MoE en tamano reducido: con ~0,8B de parametros y 2 GB de repositorio, el modelo cabe en un portatil con GPU de gama media, lo que facilita usarlo como banco de pruebas en cursos de arquitecturas eficientes.
- Reproducibilidad de experimentos academicos: los artefactos bajo `.hf_run_archive/standalone-20260918T183339Z/` (config, flyffn_config, generation_config, report, tokenizer_config) permiten replicar una ejecucion concreta con sus parametros exactos.
- Analisis de la configuracion de tokenizer y generacion: los ficheros `tokenizer_config.json` y `generation_config.json` permiten estudiar como se hereda la tokenizacion del modelo base y que parametros de decodificacion se fijan.
- Base para experimentos de destilacion o fine-tuning posterior: al ser un checkpoint pequeno, sirve como punto de partida para probar recetas de ajuste sobre una arquitectura ya alterada, asumiendo la advertencia de que la calidad puede diferir del modelo original.
- Auditoria de artefactos publicados: util para equipos que evaluan la trazabilidad de checkpoints de investigacion (versionado por timestamp, separacion entre configuracion y pesos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las metricas guardadas son las producidas por el notebook de entrenamiento correspondiente y que, salvo que se marque explicitamente lo contrario, no deben tratarse como resultados de evaluacion de grado publicable.

| Metrica | Valor | Naturaleza |
|---|---|---|
| `num_shards` | 8 | Metrica interna de la ejecucion (fragmentacion de pesos) |
| `mean_route_mix` | 0.30835 | Metrica interna de enrutamiento de la FFN dispersa |

## Requisitos de hardware

- VRAM estimada para inferencia (a partir de un modelo de ~0,8B de parametros, no confirmado por el autor): en FP16/BF16 en torno a 1,6-2 GB de pesos mas cache de activaciones y KV; en cuantizacion de 8 bits aproximadamente 0,8-1 GB; en 4 bits alrededor de 0,5-0,7 GB. Estas cifras no estan publicadas por el autor y deben verificarse.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente para FP16 en un solo dispositivo; se desconoce si el modulo de FFN dispersa anade overhead de memoria por tablas de enrutamiento o expertos adicionales.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 o superiores, e incluso en iGPU o CPU con cuantizacion agresiva, aunque no hay confirmacion oficial.
- Opciones de despliegue: al estar etiquetado con `transformers` y `endpoints_compatible`, la via soportada es Hugging Face Transformers; se desconoce la compatibilidad con llama.cpp, Ollama, vLLM o TGI, ya que no se publican pesos GGUF y la arquitectura modificada requeriria implementacion especifica.
- Latencia y throughput: no disponible; no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| vtava/Qwen35-0.8B-FlyFFN-v2 | no disponible (base 0.8B) | no disponible | no disponible | Hugging Face, 0 descargas, 0 likes | Checkpoint de investigacion con FFN dispersa; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face | Referencia directa; el autor advierte que la calidad de generacion de la variante puede diferir sustancialmente |
| Otras alternativas de ~1B con licencia permisiva | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada para establecer una comparacion rigurosa |

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un modelo final: la model card lo declara explicitamente como "research artifact" y avisa de que la calidad de generacion puede diferir sustancialmente de la del modelo base.
- Ausencia de evaluacion held-out: las metricas guardadas (`num_shards`, `mean_route_mix`) son internas del entrenamiento y no deben interpretarse como benchmarks.
- Dataset no registrado: no se puede auditar la composicion de los datos, por lo que se desconocen sesgos potenciales y posibles contaminaciones.
- Licencia no disponible: sin licencia declarada no hay base clara para uso comercial; se debe consultar al autor y revisar la licencia del modelo base antes de cualquier uso en produccion.
- Idiomas no declarados: no se puede asumir un soporte multilingue concreto ni garantizar cobertura del castellano.
- Contexto no documentado: se desconoce la longitud de contexto efectiva tras la modificacion de la FFN.
- Formato de pesos no confirmado: aunque el repositorio tiene 2 GB y 8 shards, no se especifica si los pesos estan en safetensors, lo que complica planificar el despliegue.
- Riesgo de alucinacion: no hay datos de evaluacion que permitan acotarlo; en un modelo de este tamano y con una arquitectura alterada, el riesgo es alto y debe asumirse en cualquier uso.
- Compatibilidad de ecosistema incierta: al modificar la arquitectura, es probable que el checkpoint requiera el codigo de TinyCeNN-LM (`flyffn_config.json` incluido) y no funcione con cargadores genericos ni con formatos cuantizados estandar.
- Reproducibilidad dependiente del autor: la receta se apoya en notebooks de Colab y en el repositorio GitHub del autor, sin una especificacion formal del metodo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vtava/Qwen35-0.8B-FlyFFN-v2
- Modelo base en Hugging Face: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de codigo fuente (TinyCeNN-LM): https://github.com/vtavakkoli/TinyCeNN-LM
- Artefactos de la ultima ejecucion: `.hf_run_archive/standalone-20260918T183339Z/` dentro del repositorio del modelo
- Paper, blog o demo adicionales: no disponible; la busqueda web realizada no devolvio resultados relevantes sobre este modelo (unicamente contenido no relacionado sobre soporte de Windows)
