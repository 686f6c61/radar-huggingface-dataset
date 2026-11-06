# syssec-utd/pylingual-shared-statement-v3

## Resumen

`syssec-utd/pylingual-shared-statement-v3` es un modelo de la familia CodeT5, inicializado desde `Salesforce/codet5-base`, entrenado por el grupo syssec-utd como parte de un estudio sobre arquitecturas de backbone compartido con adaptadores LoRA por versión. Su tarea es el análisis de sentencias (statements) de código Python con cobertura universal de versiones, es decir, un unico modelo capaz de procesar codigo escrito para cualquier version de Python entre 3.6 y 3.15, en lugar de mantener un modelo separado por version.

El modelo se entrena sobre el dataset `syssec-utd/pylingual-shared-encoded-v3` (particion `universal/statement`), que contiene 150.000 ficheros fuente de Python y 13.904.922 filas codificadas. El entrenamiento consistio en 2 epocas con batch global de 72, tasa de aprendizaje 2e-05, weight decay 0.01, precision FP16 y semilla 20261020.

Es relevante en el contexto de la investigacion en seguridad de software y analisis estatico multiversion: permite estudiar hasta que punto un unico backbone compartido puede generalizar entre versiones del lenguaje, y sirve como pieza base para el esquema de backbone compartido mas LoRA por version que da nombre al estudio. El repositorio incluye un directorio `last-checkpoint/` con el checkpoint reanudable del Trainer y `run/provenance.json` con todos los argumentos de entrenamiento y el manifiesto de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (CodeT5-base, inicializado desde `Salesforce/codet5-base`) |
| Parametros totales | no disponible (arquitectura base CodeT5-base, ~220M; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (dominio: codigo Python 3.6-3.15) |
| Licencia | other |
| Formato de pesos | no disponible (checkpoint de Trainer de Hugging Face; `tokenizer.json` presente en el dataset asociado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CodeT5-base, un transformer encoder-decoder con mecanismo de atencion estandar, inicializado desde los pesos de `Salesforce/codet5-base`. El objetivo del estudio es un backbone compartido entre versiones de Python, complementado con adaptadores LoRA por version en las fases posteriores del trabajo; esta ficha corresponde al backbone universal de sentencias (`universal/statement`).

Los datos de entrenamiento provienen del dataset `syssec-utd/pylingual-shared-encoded-v3` en la revision `11616fd4db16c5c567c189210702da68b0deb7cb`, con 150.000 ficheros fuente y 13.904.922 filas codificadas, cubriendo Python 3.6 a 3.15. El entrenamiento se ejecuto durante 2 epocas con batch global 72 (24 por dispositivo, 3 pasos de acumulacion, 1 GPU), tasa de aprendizaje 2e-05, weight decay 0.01, precision FP16 y semilla 20261020. El codigo de entrenamiento esta en el repositorio `quinntyx/pylingual`, rama `feat-shared-backbone-lora`, commit `dda4bd2dca0c7acf445cd611d5fa5e655c3ce572`. No se documentan en la informacion disponible innovaciones como decodificacion especulativa, atencion lineal ni fases de RLHF o DPO.

## Capacidades

- Codificacion y decodificacion de sentencias de codigo Python (tarea `statement`) con cobertura de versiones 3.6 a 3.15.
- Modelo encoder-decoder: puede emplearse tanto para representaciones (encoder) como para generacion condicionada (decoder).
- Procesamiento de codigo fuente a nivel de sentencia, adecuado para tareas de traduccion entre versiones, reparacion o clasificacion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el entrenamiento se limita a codigo Python.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Traduccion de codigo entre versiones de Python: dado un fragmento escrito para 3.6, el modelo puede generar la sentencia equivalente para 3.10 o 3.12, aprovechando el entrenamiento universal sobre 3.6-3.15.
- Analisis estatico multiversion: usar el encoder como extractor de representaciones de sentencias para clasificacion de patrones peligrosos o APIs obsoletas, sin mantener un modelo por version.
- Deteccion de cambios incompatibles: comparar representaciones de la misma sentencia en distintas versiones para localizar divergencias semanticas introducidas por cambios del lenguaje.
- Reparacion automatica de codigo: emplear el decoder para proponer correcciones de sentencias que fallen en una version objetivo, partiendo del contexto codificado.
- Investigacion en seguridad de software: base para estudiar generalizacion entre versiones y para el esquema backbone compartido + LoRA por version del estudio original.
- Fine-tuning con LoRA por version: el backbone universal sirve como inicializacion para adaptadores especificos de cada version de Python, reduciendo coste frente a entrenar un modelo completo por version.
- Extraccion de embeddings para busqueda de codigo: indexar sentencias de repositorios multiversion y recuperar fragmentos equivalentes entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al derivar de CodeT5-base (encoder-decoder de ~220M de parametros), la inferencia en FP16 requeriria del orden de 1-2 GB, pero este dato no esta confirmado por el autor.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no confirmada; por tamano de la arquitectura base seria plausible en GPUs de consumo, pero no hay dato oficial.
- Opciones de despliegue: no documentadas (vLLM, llama.cpp, Ollama, TGI no aparecen en la model card). El checkpoint es un Trainer checkpoint de Hugging Face.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `syssec-utd/pylingual-shared-statement-v3` | no disponible (base CodeT5) | no disponible | Sentencias Python multiversion | other | Hugging Face, 0 descargas |
| `syssec-utd/py312-pylingual-v1-statement` | 223M (I64) | no disponible | Sentencias Python 3.12 | no disponible | Hugging Face |
| `Salesforce/codet5-base` | ~220M | 512 tokens (referencia CodeT5) | Codigo general | no disponible en esta ficha | Hugging Face |

La comparativa se limita a los modelos citados en los resultados de busqueda; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Licencia `other`: no se especifican los terminos exactos, por lo que el uso comercial requiere revision directa del repositorio antes de adoptarlo en produccion.
- Modelo de investigacion con 0 descargas y 0 likes: sin validacion externa ni reporte de metricas publicadas.
- Entrenado exclusivamente sobre codigo Python 3.6-3.15; no se documenta soporte para otros lenguajes ni para lenguaje natural.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de robustez.
- Longitud de contexto y formato de pesos no especificados: la integracion en pipelines requiere inspeccionar el repositorio y `run/provenance.json`.
- El repositorio contiene un directorio `last-checkpoint/` con estado reanudable del Trainer; conviene verificar que la raiz contiene los pesos finales antes de desplegar.
- Sin pipeline declarado en Hugging Face: no hay tarea de inferencia estandar configurada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syssec-utd/pylingual-shared-statement-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v3
- Codigo de entrenamiento: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `dda4bd2dca0c7acf445cd611d5fa5e655c3ce572`)
- Modelo base: https://huggingface.co/Salesforce/codet5-base
- Publicacion relacionada (gShare): https://cis.temple.edu/~jiewu/research/publications/Publication_files/3779212.3790168.pdf
