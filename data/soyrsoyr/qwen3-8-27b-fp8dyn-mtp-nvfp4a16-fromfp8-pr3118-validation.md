# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-NVFP4A16-FromFP8-pr3118-validation

## Resumen

Este repositorio no es un modelo original, sino un artefacto de validacion de cuantizacion publicado por el usuario soyrsoyr. Se trata de una conversion del modelo Qwen/Qwen3.8-27B-FP8 (aproximadamente 27,1 mil millones de parametros) en la que el modulo MTP (multi-token prediction) nativo en FP8 se desquantiza y se vuelve a cuantizar al formato NVFP4A16, usando la implementacion del PR 3118 de llm-compressor. El resultado se valida cargando y generando texto con exito en una GPU H100, con metricas reales de tokens de borrador (draft tokens) del decodificador especulativo.

La relevancia de esta ficha es acotada y conviene entenderla bien: el propio autor indica explicitamente que "esto no es un benchmark de calidad ni de rendimiento". Es un artefacto de reproducibilidad orientado a desarrolladores que trabajan con cuantizacion NVFP4/MXFP4, con decodificacion especulativa basada en MTP y con el stack vLLM sobre hardware Hopper o Blackwell. Su utilidad esta en servir como referencia verificable de que el pipeline de cuantizacion y el arranque en vLLM funcionan, no en aportar un modelo listo para produccion.

El modelo base pertenece a la familia Qwen3.5 (segun el tag `qwen3_5`) y el repositorio incluye tambien etiquetas de `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo original. No se dispone de informacion sobre datos de entrenamiento, contexto, idiomas ni resultados de evaluacion, ya que la model card se limita a documentar la validacion tecnica del formato cuantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con modulo MTP (multi-token prediction) para decodificacion especulativa; se desconoce si emplea MoE |
| Parametros totales | 27.134.575.616 (~27,1 B), segun safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (pesos en FP4 weight-only con activaciones de 16 bits; no es NVFP4 W4A4 calibrado) y MXFP4 (con cuantizacion dinamica de activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 35,3 GB); backbone y MTP se almacenan en formatos separados |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5, publicado originalmente por el equipo Qwen en formato FP8 y con 27,1 B de parametros. Este repositorio no entrena ni afina nada: parte del checkpoint FP8, desquantiza el modulo MTP nativo y lo recuantiza a FP4 mediante llm-compressor (PR 3118, commit `87347881`). Un detalle tecnico importante que documenta el autor es que el backbone y el modulo MTP se almacenan en formatos separados, de modo que es necesario inspeccionar `config.json`, `recipe.yaml` (cuando exista) y `pr3118-validation.json` para conocer los detalles reales del formato.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento; esos datos pertenecen a la model card del modelo base, que no se ha proporcionado. La innovacion tecnica destacable de este artefacto es doble: por un lado, la recuantizacion de un MTP en FP8 a NVFP4A16 sin perder la capacidad de generar tokens de borrador; por otro, la validacion de que la decodificacion especulativa MTP funciona en vLLM con `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`, exigiendo metricas positivas de draft tokens y no solo un arranque correcto del servidor.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.8-27B-FP8.
- Decodificacion especulativa con MTP: el modulo de multi-token prediction genera tokens de borrador que el modelo principal verifica, reduciendo la latencia de generacion.
- Procesamiento de imagen y texto (`image-text-to-text` aparece entre las etiquetas del repositorio), aunque el autor recomienda desactivar imagen y video en el comando de ejemplo con `--limit-mm-per-prompt '{"image":0,"video":0}'`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (depende del modelo base, no documentado aqui).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento explicito: no disponible.
- Capacidad de validacion: incluye `verify_mtp.py`, un script que ejecuta dos prompts y registra generaciones y metricas de decodificacion especulativa, exigiendo metricas positivas de draft tokens para considerar la prueba superada.

## Casos de uso

- Validacion de pipelines de cuantizacion FP8 a FP4: equipos que desarrollan recetas de cuantizacion pueden usar este repositorio como referencia reproducible de una conversion NVFP4A16 de pesos con activaciones de 16 bits, comparando el resultado contra el checkpoint FP8 original.
- Pruebas de compatibilidad con vLLM: sirve para verificar que una version concreta de vLLM (validada con `0.29.1rc1.dev79+g767d1c4d4`) arranca y genera correctamente con pesos NVFP4A16 y decodificacion especulativa MTP activada.
- Investigacion en decodificacion especulativa: el repositorio permite medir metricas de draft tokens con `num_speculative_tokens: 1` y estudiar la tasa de aceptacion del MTP cuantizado frente al MTP en FP8.
- Integracion continua de stacks de inferencia: el script `verify_mtp.py` y el fichero `pr3118-validation.json` se pueden incorporar a un pipeline de CI que valide cargas de modelos y generacion antes de promover un artefacto cuantizado a un entorno de staging.
- Evaluacion de cuantizacion en hardware Blackwell: la variante MXFP4 esta pensada para ejecutarse en B200, de modo que el repositorio sirve como punto de partida para comprobar compatibilidad de MXFP4 con cuantizacion dinamica de activaciones en esa generacion de GPU.
- Despliegue experimental con contexto corto sobre Hopper: con `--max-model-len 1024` y `--gpu-memory-utilization 0.85`, el modelo puede levantarse en una H100 para pruebas internas de generacion que no requieran ventanas de contexto largas.
- Comparativa de calidad entre formatos: al existir tanto el checkpoint FP8 original como esta conversion FP4, un equipo puede ejecutar la misma bateria de prompts en ambos y medir la degradacion introducida por la cuantizacion, siempre que asuma que el autor no aporta esa comparativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la validacion en H100 supero la carga y la generacion con metricas reales de draft tokens del MTP, y aclara que esto no constituye un benchmark de calidad ni de rendimiento. No hay datos de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como referencia orientativa, los pesos de 27,1 B en FP4 ocupan teoricamente unos 13,6 GB; el repositorio es de 35,3 GB porque incluye variantes de formato para backbone y MTP por separado, ademas de ficheros de configuracion y validacion.
- GPU recomendadas: H100, el unico hardware con validacion explicita del autor. Para la variante MXFP4 se requiere una B200, ya que la compatibilidad en tiempo de ejecucion debe establecerse en ese hardware.
- Compatibilidad con GPU de consumo: no confirmada. Una RTX 4090 con 24 GB de VRAM podria alojar los pesos FP4 en teoria, pero no hay validacion publicada y el desglose de formatos del repositorio hace que el ajuste no sea trivial.
- Opciones de despliegue: vLLM es la via documentada y validada. No se mencionan llama.cpp, Ollama ni TGI, y el formato NVFP4A16/MXFP4 no es compatible con runtimes de cuantizacion GGUF.
- Entorno validado: `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0`, CUDA `13.0`.
- Configuracion de referencia: `--dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}' --limit-mm-per-prompt '{"image":0,"video":0}'`.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo ni de tasa de aceptacion de draft tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-NVFP4A16-FromFP8-pr3118-validation | 27,1 B | no disponible | NVFP4A16 y MXFP4 sobre safetensors | Apache 2.0 | Repositorio de validacion, 0 descargas |
| Qwen/Qwen3.8-27B-FP8 (modelo base) | 27,1 B | no disponible | FP8 | Apache 2.0 | Modelo upstream, referencia de calidad |
| Otras alternativas de ~27 B | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion en la busqueda realizada |

No se dispone de datos de rendimiento de ninguno de los dos modelos, por lo que no es posible comparar calidad. La unica diferencia documentada es el formato de pesos y la presencia de un MTP recuantizado y validado en el artefacto derivado.

## Limitaciones y advertencias

- El autor declara explicitamente que la validacion no constituye un benchmark de calidad ni de rendimiento; no debe interpretarse como evidencia de buen comportamiento en tareas reales.
- No hay ninguna comparativa entre la calidad del checkpoint FP8 original y la version cuantizada, por lo que se desconoce la degradacion introducida por la recuantizacion a FP4.
- NVFP4A16 es cuantizacion weight-only con activaciones de 16 bits, no NVFP4 W4A4 calibrado; quien espere un pipeline de cuantizacion completo encontrara un alcance distinto.
- El repositorio tiene 0 descargas y 0 likes, y la validacion solo cubre una ejecucion en H100. La variante MXFP4 esta pendiente de validacion en B200.
- La configuracion de ejemplo limita el contexto a 1024 tokens y desactiva imagen y video, lo que restringe severamente los escenarios de uso practico.
- La propia model card advierte de que backbone y MTP usan formatos separados, por lo que hay que revisar `config.json`, `recipe.yaml` y `pr3118-validation.json` antes de asumir cualquier detalle del formato.
- La licencia Apache 2.0 del artefacto no sustituye a la del modelo base: el autor indica que la licencia del origen sigue siendo aplicable y que esta validacion no concede licencia adicional.
- La fecha de creacion del repositorio que figura en los metadatos (2026-09-14) es posterior a la fecha actual, lo que conviene tener en cuenta al evaluar la trazabilidad del artefacto.
- No hay informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limitaciones de contexto del modelo base en la documentacion proporcionada.
- El stack de dependencias es muy reciente y especifico (vLLM `0.29.1rc1`, Transformers `5.17.0`, CUDA `13.0`), lo que reduce la portabilidad a entornos con versiones mas estables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-NVFP4A16-FromFP8-pr3118-validation
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8/tree/017b9c7af6b5689d5dd426a76e0bc077eb5ca20a
- Implementacion de cuantizacion (llm-compressor PR 3118, commit `87347881`): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Script de verificacion MTP: `verify_mtp.py` incluido en el snapshot del repositorio (ejecutable con `python verify_mtp.py /path/to/snapshot`)
- Resultados de otros enlaces de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos (repositorios de jailbreaks, hilos de foros y documentacion de modelos de GitHub Copilot) no guardan relacion con el artefacto descrito.
