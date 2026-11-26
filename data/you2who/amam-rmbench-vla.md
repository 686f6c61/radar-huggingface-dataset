# you2who/AMAM-rmbench-vla

## Resumen

AMAM-rmbench-vla es un modelo de tipo Vision-Language-Action (VLA) publicado por el usuario you2who dentro del proyecto AMAM (AgentMem Action Model), orientado a inferencia en robótica sobre el benchmark rmbench. El repositorio contiene los pesos completos de inferencia congelados en la version `abs60000`, junto con la configuracion, el tokenizer y los metadatos de normalizacion del benchmark. No se trata de un checkpoint de entrenamiento ni de reanudacion, sino de una exportacion lista para ejecutar inferencia.

El modelo deriva de componentes de OpenPI y PaliGemma, con una arquitectura basada en el tag `eva_openpi` y un total de 3.353.433.872 parametros (aproximadamente 3,35 mil millones). Su proposito es transformar observaciones visuales y de estado en acciones motoras dentro del protocolo especifico de rmbench, por lo que su uso esta acotado a ese benchmark y no es intercambiable con otros entornos sin aplicar las transformaciones de observacion y accion propias de AMAM.

La relevancia actual del modelo radica en que forma parte de un ecosistema mas amplio que incluye un VLM companion (AMAM-rmbench-vlm), un dataset de anotaciones y un repositorio de codigo en GitHub. La licencia de las contribuciones propias es CC BY 4.0, aunque los componentes upstream (Gemma, PaliGemma, OpenPI) conservan sus propios terminos, lo que anade obligaciones adicionales para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en componentes OpenPI/PaliGemma (tag `eva_openpi`) |
| Parametros totales | 3.353.433.872 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 (contribuciones AMAM); componentes upstream con licencias propias, incluidos terminos de Gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se apoya en componentes de OpenPI y PaliGemma, lo que sugiere una arquitectura VLA que combina un backbone vision-language con una cabeza de accion. El tag `eva_openpi` apunta a una integracion con el framework EVA/OpenPI. No se detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje por imitacion. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o atencion lineal.

El checkpoint corresponde a la version congelada `abs60000`, exportada exclusivamente para inferencia. La model card insiste en que no requiere el codigo de entrenamiento de EVA ni una descarga separada de la base Pi, lo que simplifica el despliegue pero limita la posibilidad de reanudar entrenamiento o ajuste fino a partir de este repositorio. La normalizacion y el protocolo de ejecucion son especificos del benchmark rmbench y no son intercambiables con otros benchmarks.

## Capacidades

- Generacion de acciones motoras a partir de observaciones visuales y de estado dentro del protocolo de rmbench.
- Inferencia VLA completa: integra percepcion visual y prediccion de acciones en un unico modelo.
- Compatibilidad con el ecosistema AMAM, incluyendo el VLM companion y el dataset de anotaciones.
- Ejecucion autonoma sin dependencia del codigo de entrenamiento EVA ni de una descarga separada de la base Pi.
- Capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual o multilingue: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de politicas roboticas en el benchmark rmbench: el modelo se carga como pesos de inferencia y se ejecuta con las transformaciones de observacion y accion propias de AMAM, permitiendo reproducir los resultados del benchmark con la version congelada `abs60000`.
- Investigacion en modelos Vision-Language-Action: sirve como referencia reproducible para comparar arquitecturas VLA derivadas de OpenPI/PaliGemma en tareas de manipulacion.
- Integracion en pipelines de robotica simulada: al exportarse como safetensors con configuracion y tokenizer incluidos, puede cargarse en entornos de simulacion que respeten el protocolo de rmbench.
- Baseline para ajuste fino posterior: aunque el repositorio es de solo inferencia, los pesos pueden servir como punto de partida para experimentos propios, siempre que se respeten las licencias upstream.
- Desarrollo de sistemas agente-memoria en robotica: el modelo forma parte del proyecto AgentMem Action Model, por lo que es adecuado para estudiar la integracion de memoria y accion en agentes embodied.
- Reproducibilidad de articulos cientificos: al estar congelado y acompanado de metadatos de normalizacion, facilita la verificacion de resultados del paper asociado (arXiv:2609.11308).
- Despliegue en entornos de laboratorio con GPU unica: con 3,35 mil millones de parametros y pesos en safetensors de 6,7 GB, es viable en estaciones de trabajo con una GPU de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 6,7 GB, lo que en precision FP16 requiere al menos unos 7 GB solo para pesos; con overhead de activaciones y buffers de inferencia se recomienda un margen adicional.
- GPU recomendadas: no disponibles de forma explicita; por tamano, una RTX 4090 (24 GB) o una A100/H100 son opciones razonables para FP16.
- Cabe en GPU consumer: si, previsiblemente en GPUs con 12-16 GB o mas en funcion de la cuantizacion, aunque no se confirman cuantizaciones disponibles.
- Opciones de despliegue: no se especifican en la model card; el formato safetensors sugiere carga mediante frameworks de inferencia estandar, pero no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AMAM-rmbench-vla | 3.353.433.872 | no disponible | cc-by-4.0 (con terminos upstream) | Hugging Face, repo de 6,7 GB |
| AMAM-rmbench-vlm | no disponible | no disponible | no disponible | Hugging Face (companion VLM) |
| OpenPI / PaliGemma base | no disponible | no disponible | terminos propios (Gemma) | Upstream |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para el benchmark rmbench; la normalizacion y el protocolo de ejecucion no son intercambiables con otros benchmarks.
- Es una exportacion de inferencia, no un checkpoint de entrenamiento ni de reanudacion; no permite continuar el entrenamiento directamente.
- Requiere aplicar las transformaciones de observacion y accion especificas de AMAM; un uso incorrecto invalida los resultados.
- La licencia CC BY 4.0 solo cubre las contribuciones de AMAM; los componentes upstream (Gemma, PaliGemma, OpenPI) mantienen sus propios terminos, que deben conservarse y respetarse, especialmente para uso comercial.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, limitaciones de contexto o idioma, ni sobre comportamiento en produccion fuera del benchmark.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion comunitaria.
- No se confirman opciones de cuantizacion ni soporte en frameworks de despliegue habituales.

## Enlaces

- Hugging Face: https://huggingface.co/you2who/AMAM-rmbench-vla
- VLM companion: https://huggingface.co/you2who/AMAM-rmbench-vlm
- Dataset de anotaciones: https://huggingface.co/datasets/you2who/AMAM-rmbench-annotations
- Codigo: https://github.com/utomm/AgentMem-Action-Model
- Proyecto: https://agent-mem-action-model.github.io/
- Paper: https://arxiv.org/abs/2609.11308
