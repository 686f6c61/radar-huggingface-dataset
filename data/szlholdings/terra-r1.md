# SZLHOLDINGS/terra-r1

## Resumen

Terra-r1 es un adaptador LoRA publicado por SZLHOLDINGS sobre el modelo base `unsloth/Qwen3.5-0.8B`, un modelo de la familia Qwen 3.5 con aproximadamente 0.800 millones de parametros. El repositorio contiene unicamente los pesos del adaptador en formato PEFT/safetensors, no el modelo completo, y se distribuye con la libreria `peft` y el pipeline `text-generation`. El entrenamiento declarado es SFT (supervised fine-tuning) realizado con las librerias `trl` y `unsloth`, lo que sugiere un ajuste supervisado sobre el modelo base.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: la model card es la plantilla por defecto de Hugging Face sin completar, con todos los campos marcados como "[More Information Needed]". No se documentan datos de entrenamiento, hiperparametros, licencia, idiomas, resultados de evaluacion ni limitaciones. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que indica que los pesos del adaptador pueden no estar subidos o son de tamano despreciable.

Se trata, por tanto, de un artefacto experimental o de publicacion muy reciente (creado el 25 de noviembre de 2026) cuya utilidad practica no puede validarse con la informacion disponible. Cualquier evaluacion de su calidad requiere descargar el adaptador, aplicarlo sobre el modelo base y realizar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.5-0.8B; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base tiene aproximadamente 0.8 mil millones de parametros |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-0.8B, no documentada aqui) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicaria al modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT 0.22.0 |
| Modelo base | unsloth/Qwen3.5-0.8B |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL y Unsloth |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base Qwen3.5-0.8B. Los tags del repositorio confirman el uso de PEFT, LoRA, SFT, TRL y Unsloth, lo que indica un ajuste supervisado de bajo rango sobre el transformer base. No se especifica el rango (rank) del adaptador, las capas objetivo, el dataset de entrenamiento, el numero de tokens vistos ni la composicion de los datos.

No hay informacion sobre hiperparametros (learning rate, batch size, epocas), regimen de precision (fp16, bf16, fp32), ni sobre si se aplicaron tecnicas adicionales como RLHF, DPO o decodificacion especulativa. La model card no documenta ninguna innovacion tecnica. La unica referencia bibliografica presente (arxiv:1910.09700) corresponde a la calculadora de impacto medioambiental de Lacoste et al., incluida en la plantilla por defecto, no a un paper del modelo.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` sugiere uso en dialogos multi-turno, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Ajuste supervisado (SFT): el adaptador fue entrenado con SFT, por lo que previsiblemente hereda las capacidades del modelo base Qwen3.5-0.8B, sin que se documente ninguna capacidad especifica anadida.
- Capacidades del modelo base: no documentadas en esta ficha; dependen de `unsloth/Qwen3.5-0.8B`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: al ser un adaptador sobre un modelo de 0.8B, puede desplegarse en hardware modesto para validar flujos de dialogo antes de invertir en modelos mayores. Requiere verificar previamente la calidad del adaptador, no evaluada.
- Experimentacion academica con LoRA y SFT: el repositorio sirve como ejemplo de pipeline PEFT + TRL + Unsloth para investigadores que quieran reproducir o comparar tecnicas de ajuste de bajo rango sobre modelos pequenos.
- Fine-tuning incremental sobre dominio especifico: si el adaptador ya esta ajustado a una tarea concreta (no documentada), podria reutilizarse como punto de partida para nuevos ajustes, aunque se desconoce su comportamiento real.
- Despliegue en entornos con recursos limitados: un modelo base de 0.8B con adaptador LoRA puede ejecutarse en CPU o en GPUs de consumo, lo que facilita pruebas locales y edge computing, siempre que se valide su calidad.
- Generacion de texto en aplicaciones de bajo coste: para tareas de completado o resumen simple donde la precision no sea critica, el tamano reducido permite latencias bajas, aunque no hay datos de rendimiento que lo confirmen.
- Base para evaluacion comparativa de adaptadores: util para investigadores que estudien la variabilidad de resultados entre adaptadores LoRA publicados sin model card completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; para el modelo base de 0.8B, en fp16 se estiman aproximadamente 1.6 GB de pesos, y en cuantizacion de 4 bits alrededor de 0.5 GB, cifras orientativas que dependen de la implementacion.
- GPU recomendadas: no disponibles; por el tamano del modelo base, cabria en GPUs de consumo como RTX 3060, RTX 4060 o superiores, y en GPUs de datacenter (A100, H100) sin problema, aunque no hay datos oficiales.
- Cabe en consumer GPU: previsiblemente si, dado el tamano del modelo base, pero no confirmado por el autor.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador; el modelo base podria servirse con vLLM, llama.cpp u Ollama si se fusiona el adaptador, aunque no se documenta compatibilidad.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| SZLHOLDINGS/terra-r1 | Adaptador sobre 0.8B | No disponible | No disponible | Safetensors (PEFT) | 0 descargas, 0 likes |
| unsloth/Qwen3.5-0.8B (modelo base) | ~0.8B | No disponible en esta ficha | No disponible | Safetensors | Modelo base referenciado |
| Otros adaptadores LoRA sobre Qwen3.5-0.8B | Variable | Depende del base | Variable | Safetensors (PEFT) | No disponible comparativa especifica |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a caracteristicas estructurales.

## Limitaciones y advertencias

- Model card incompleta: todos los campos de la plantilla estan sin rellenar, incluidos licencia, idiomas, datos de entrenamiento y evaluacion.
- Licencia no especificada: no puede confirmarse el uso comercial; ademas, la licencia del adaptador podria estar condicionada por la del modelo base Qwen3.5-0.8B, que no se detalla aqui.
- Sin datos de evaluacion: no hay benchmarks, ni pruebas de calidad, ni ejemplos de uso que permitan estimar el rendimiento real.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no cuantificado para este adaptador.
- Sesgos: no documentados; dependen del dataset de SFT y del modelo base, ambos desconocidos.
- Limitaciones de contexto e idioma: no documentadas; dependen del modelo base.
- Repositorio con 0 descargas y 0 likes: indica publicacion reciente o sin validacion por la comunidad; el tamano de 0.0 GB sugiere que los pesos pueden no estar efectivamente subidos.
- Sin garantias para produccion: al no haber documentacion tecnica ni evaluacion, su uso en entornos productivos conlleva riesgo elevado.
- Dependencia del modelo base: el adaptador no es autonomo; requiere cargar `unsloth/Qwen3.5-0.8B` y aplicar PEFT 0.22.0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/terra-r1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Referencia citada en la model card (impacto medioambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
