# soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-FP8-DYNAMIC-pr3118-validation

## Resumen

Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-FP8-DYNAMIC-pr3118-validation es una version cuantizada y de validacion del modelo nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, publicada por el usuario soyrsoyr. Se trata de un artefacto tecnico orientado a comprobar que una receta concreta de cuantizacion FP8 dinamica, aplicada tanto al backbone como al modulo de prediccion multi-token (MTP), es capaz de cargar en vLLM y de generar tokens borrador validos con decodificacion especulativa. No es un modelo nuevo entrenado desde cero, sino una conversion de pesos del modelo base de NVIDIA.

El repositorio tiene 32.913.266.240 parametros reales (aproximadamente 32,9 B) y un tamano de 33,7 GB en safetensors, coherente con pesos en FP8. El nombre A3B sugiere una arquitectura de mezcla de expertos (MoE) con unos 3 B de parametros activos, y la etiqueta de transformers es nemotron_h, propia de la familia Nemotron. La cuantizacion se realizo sin datos de calibracion (data-free) mediante el PR 3118 de llm-compressor, y el modulo MTP se cuantizo por separado del backbone.

Su relevancia es acotada pero clara: sirve como referencia reproducible para quien quiera desplegar la familia Nemotron Lightning 30B-A3B en FP8 con decodificacion especulativa MTP en vLLM, y como evidencia de que la receta de cuantizacion data-free funciona en un entorno Hopper. El propio autor advierte que la validacion es de carga y generacion, no de calidad ni de rendimiento, y que el repositorio no concede licencia adicional sobre el modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiqueta de transformers nemotron_h; nomenclatura A3B compatible con mezcla de expertos (MoE). No se detalla la composicion interna en la informacion disponible |
| Parametros totales | 32.913.266.240 (32,9 B) segun safetensors |
| Parametros activos | Aproximadamente 3 B, segun el sufijo A3B del nombre; no confirmado en la informacion disponible |
| Longitud de contexto | No disponible. El ejemplo de servicio usa --max-model-len 1024 como configuracion de prueba, no como maximo del modelo |
| Tipos de cuantizacion | FP8 dinamico (pesos FP8 con cuantizacion dinamica de activaciones) en backbone y en el modulo MTP, con esquema data-free. El autor menciona ademas variantes NVFP4A16 (FP4 weight-only con activaciones de 16 bits) y MXFP4 (activacion dinamica, requiere validacion en B200) |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 (etiquetada como license: other con license_name openmdw-1.1). La licencia del modelo fuente sigue siendo aplicable y esta validacion no anade ninguna concesion de licencia |
| Formato de pesos | safetensors (repositorio de 33,7 GB), formato compressed-tensors; se citan config.json, recipe.yaml y pr3118-validation.json |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo base en los datos proporcionados: no se indica numero de tokens, composicion del dataset ni si hubo RLHF o DPO. Lo que si se documenta es el proceso de conversion: la cuantizacion FP8 dinamica se aplico al backbone y al modulo MTP del modelo nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 usando el PR 3118 de llm-compressor (commit 87347881), con un esquema sin datos de calibracion. El autor senala explicitamente que los formatos del backbone y del MTP son independientes y remite a config.json, recipe.yaml y pr3118-validation.json para inspeccionarlos.

La innovacion tecnica relevante aqui es la integracion de MTP (multi-token prediction) como metodo de decodificacion especulativa en vLLM: el modulo MTP propone tokens borrador que el modelo verifica, reduciendo el numero de pasos de decodificacion necesarios. La validacion se ejecuto con vllm==0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0, y exige metricas positivas de tokens borrador: una carga correcta del modelo no se considera un aprobado de MTP. El script verify_mtp.py reproduce la prueba con dos prompts.

## Capacidades

- Generacion de texto conversacional: la etiqueta conversational y el pipeline text-generation indican uso previsto para dialogos multi-turno.
- Razonamiento y generacion general: heredadas del modelo base NVIDIA Nemotron 3.5 Lightning 30B-A3B, sin que la informacion disponible detalle tareas concretas.
- Decodificacion especulativa con MTP: soporta --speculative-config '{"method":"mtp","num_speculative_tokens":1}' en vLLM, con registro de metricas de tokens borrador.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion en plataformas de inferencia gestionadas.
- Entrada multimodal desactivada en la configuracion de prueba: el comando de servicio usa --limit-mm-per-prompt '{"image":0,"video":0}'.
- Tool calling, function calling, capacidades de agente, soporte multilingue y modos de razonamiento explicito: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles; la configuracion de referencia los desactiva para el caso de MTP.

## Casos de uso

- Servicio de inferencia de alto rendimiento en H100: el modelo esta validado para cargar y generar en vLLM con FP8 y decodificacion especulativa MTP activada, por lo que encaja en despliegues Hopper donde interesa reducir el coste por token mediante tokens borrador.
- Reduccion de huella de memoria frente al modelo BF16: al almacenar 32,9 B de parametros en FP8, la huella de pesos baja a unos 33 GB, lo que permite liberar VRAM para cache KV y aumentar el tamano de lote en GPUs de 80 GB.
- Validacion de integraciones MTP en pipelines propios: el repositorio incluye verify_mtp.py, que ejecuta dos prompts y exige metricas positivas de tokens borrador, util como prueba de humo antes de promover una version de vLLM o de CUDA.
- Pruebas de regresion de cuantizacion: sirve para comparar recetas de llm-compressor (FP8 dinamico data-free frente a NVFP4A16 o MXFP4) sobre el mismo modelo base y detectar degradaciones de carga o de generacion.
- Despliegue en endpoints compatibles: la etiqueta endpoints_compatible permite usarlo como artefacto de prueba en plataformas serverless que acepten repositorios de HuggingFace con formato compressed-tensors.
- Asistente conversacional multi-turno en entornos controlados: con la etiqueta conversational y el pipeline text-generation, puede usarse para prototipos de dialogo, siempre que se valide antes la calidad respecto al modelo BF16.
- Investigacion sobre cuantizacion sin calibracion: el esquema data-free es relevante para equipos que no pueden distribuir datasets de calibracion por motivos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que la prueba de carga y generacion en H100 "no es un benchmark de calidad ni de rendimiento", y el unico criterio de exito reportado es la obtencion de metricas positivas de tokens borrador en la decodificacion especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 33 GB solo para pesos en FP8, mas cache KV y activaciones. Con --gpu-memory-utilization 0.85 en una GPU de 80 GB hay margen suficiente.
- GPU recomendadas: H100 (entorno validado por el autor, con CUDA 13.0). Otras GPU Hopper o Blackwell con soporte FP8 deberian ser compatibles, pero no estan validadas en la informacion disponible.
- GPU de consumo: una RTX 4090 con 24 GB no puede alojar los pesos FP8 de 33 GB. No se dispone de variantes GGUF ni de cuantizaciones de 4 bits publicadas en este repositorio, por lo que no hay ruta directa a GPU de consumo con este artefacto.
- Variantes alternativas: el autor menciona NVFP4A16 y MXFP4; para MXFP4 indica que hace falta ejecutar en B200 para establecer la compatibilidad en tiempo de ejecucion.
- Opciones de despliegue: vLLM 0.29.1rc1.dev79+g767d1c4d4 con Transformers 5.17.0, usando --dtype bfloat16, --enforce-eager, --max-model-len 1024 y --speculative-config '{"method":"mtp","num_speculative_tokens":1}'. No se documentan despliegues con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo ni de tasa de aceptacion de tokens borrador.

## Comparativa con modelos similares

| Modelo | Parametros | Precision | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-FP8-DYNAMIC-pr3118-validation | 32,9 B totales, ~3 B activos (A3B) | FP8 dinamico, backbone y MTP | No disponible | openmdw-1.1 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (modelo base) | 32,9 B totales, ~3 B activos | BF16 | No disponible | La del modelo fuente | HuggingFace (NVIDIA) |
| Variante NVFP4A16 del mismo backbone y MTP | 32,9 B totales | FP4 weight-only con activaciones de 16 bits | No disponible | openmdw-1.1 | Mencionada por el autor, sin repositorio identificado en la informacion disponible |
| Variante MXFP4 del mismo backbone y MTP | 32,9 B totales | FP4 con activacion dinamica | No disponible | openmdw-1.1 | Mencionada por el autor; requiere validacion en B200 |

No se dispone de datos de rendimiento ni de contexto para comparar con alternativas de otros fabricantes de la misma categoria (MoE de ~30 B totales y ~3 B activos); cualquier cifra al respecto no estaria respaldada por la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo apto para produccion sin validacion previa: el autor lo define como un artefacto de validacion de PR, con 0 descargas y 0 likes, y sin benchmarks de calidad.
- La prueba superada es exclusivamente de carga y generacion con MTP; no se ha medido perplexity, MMLU, HumanEval ni ninguna otra metrica de calidad.
- No se documentan sesgos conocidos, pero tampoco se documenta ninguna evaluacion de sesgo, seguridad o toxicidad.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no hay evaluacion especifica en este repositorio. La cuantizacion FP8 puede degradar la calidad respecto al BF16 y no se ha cuantificado esa perdida.
- Idiomas soportados: no disponibles. No se puede asumir cobertura multilingue sin comprobacion.
- Longitud de contexto: no disponible; el valor de 1024 del comando de ejemplo es una configuracion de prueba, no el maximo del modelo.
- Licencia: openmdw-1.1 con la etiqueta license: other. El autor indica que la licencia del modelo fuente sigue siendo aplicable y que esta validacion no anade ninguna concesion de licencia, por lo que hay que revisar la licencia de NVIDIA antes de cualquier uso comercial.
- Compatibilidad de runtime fragil: la validacion depende de una version concreta de vLLM (0.29.1rc1.dev79+g767d1c4d4), Transformers 5.17.0 y CUDA 13.0; otros entornos pueden fallar en la carga o en el MTP.
- Formatos del backbone y del MTP separados: requieren inspeccion de config.json y recipe.yaml; no se debe asumir que una configuracion funcione con la otra.
- Sin soporte documentado para llama.cpp, Ollama ni TGI, y sin cuantizaciones de 4 bits listas para GPU de consumo.

## Enlaces

- HuggingFace: https://huggingface.co/soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-FP8-DYNAMIC-pr3118-validation
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (revision a9904d24bcc1d289a1950fa9d2b978c47cf903b9 referenciada por el autor)
- Implementacion de cuantizacion (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a sitios de contenido para adultos sin relacion alguna con el modelo, por lo que se omiten.
