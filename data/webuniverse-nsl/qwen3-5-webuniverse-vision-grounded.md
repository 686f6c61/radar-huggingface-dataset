# WebUniverse-NSL/Qwen3.5-WebUniverse-Vision-grounded

## Resumen

WebUniverse-NSL/Qwen3.5-WebUniverse-Vision-grounded es un ajuste fino multimodal (image-text-to-text) publicado por el usuario WebUniverse-NSL sobre el modelo base Qwen/Qwen3.5-35B-A3B. El modelo combina una arquitectura de mezcla de expertos (etiqueta `qwen3_5_moe` en HuggingFace) con capacidades de vision, y esta orientado a tareas de desarrollo web, agentes, generacion de codigo y conversacion. Cuenta con 35.107.181.936 parametros totales y un repositorio de 70,2 GB en formato safetensors.

Su relevancia radica en que aplica un ajuste especifico sobre un modelo MoE de ~35B con ~3B de parametros activos, lo que permite capacidades cercanas a un modelo denso de ese tamano con un coste de inferencia mucho menor. El ajuste se ha realizado sobre el dataset `webcraft-NSL/WebUniverse-Mix` y el sufijo "Vision-grounded" sugiere un enfasis en la conexion entre elementos visuales y contenido web (capturas de interfaz, layouts, elementos graficos).

Se trata de un modelo con acceso restringido (gated) en HuggingFace: es necesario aceptar condiciones en la plataforma antes de poder descargar los pesos. No se ha publicado informacion sobre licencia, longitud de contexto ni resultados de benchmarks, y el modelo solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer, etiqueta `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (~35,1B) |
| Parametros activos | ~3B (inferido de la nomenclatura A3B del modelo base Qwen/Qwen3.5-35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors, 70,2 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-35B-A3B (finetune) |
| Pipeline | image-text-to-text |
| Dataset de entrenamiento | webcraft-NSL/WebUniverse-Mix |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Libreria | transformers |
| Tamano del repositorio | 70,2 GB |
| Fecha de publicacion | 16 de octubre de 2026 (actualizado el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos (MoE), etiquetado en HuggingFace como `qwen3_5_moe` y heredado del modelo base Qwen/Qwen3.5-35B-A3B. Con 35,1B parametros totales y aproximadamente 3B activos por token (deducido de la nomenclatura A3B del modelo base), el modelo activa solo una fraccion de sus expertos en cada paso de inferencia, lo que reduce el coste computacional respecto a un modelo denso del mismo tamano. El pipeline declarado es image-text-to-text, por lo que incorpora un encoder o proyector multimodal que permite procesar imagenes junto con texto.

El modelo es un finetune (tag `base_model:finetune`) entrenado sobre el dataset `webcraft-NSL/WebUniverse-Mix`, cuya composicion, numero de tokens y proceso de curacion no estan documentados en la informacion disponible. No se especifica si se aplicaron tecnicas de alineacion como RLHF, DPO o decodificacion especulativa, ni si se congelaron partes del modelo base durante el ajuste. Tampoco se detalla la estrategia de entrenamiento multimodal (resolucion de imagen, numero de tokens visuales, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con soporte declarado para conversaciones multi-turno (tag `conversational`).
- Procesamiento conjunto de imagen y texto (image-text-to-text), con enfasis en contenido visual vinculado a web ("Vision-grounded").
- Generacion y asistencia en codigo (tag `code`).
- Desarrollo web (tag `web-development`): interpretacion de interfaces, layouts y elementos de pagina.
- Soporte para agentes (tag `agents`), orientado a flujos de trabajo automatizados.
- Capacidades multimodales derivadas del pipeline image-text-to-text, si bien no se detalla la resolucion ni el alcance exacto del soporte visual.
- Idiomas: unicamente ingles declarado; no se documenta soporte multilingue.

## Casos de uso

- Automatizacion de desarrollo front-end: dado un diseno o captura de interfaz, el modelo puede generar el marcado y los estilos correspondientes, aprovechando su ajuste sobre un dataset de contenido web y su entrada multimodal.
- Revision de accesibilidad y consistencia visual: el modelo puede analizar capturas de paginas y senalar problemas de estructura, jerarquia visual o elementos mal alineados en un pipeline de QA previo al despliegue.
- Agentes autonomos de navegacion y extraccion: con el tag `agents`, puede integrarse en flujos multi-paso que interpretan el estado visual de una pagina y deciden la siguiente accion.
- Asistente de codigo en editores o CI/CD: generacion y revision de fragmentos de codigo web dentro de pipelines automatizados, con verificaciones previas al merge.
- Soporte tecnico a desarrolladores: conversaciones multi-turno en ingles sobre APIs, errores de integracion o configuracion de despliegues, manteniendo el contexto de la sesion.
- Generacion de documentacion tecnica a partir de interfaces: a partir de capturas de un panel de administracion, producir guias de uso o descripciones de cada seccion.
- Prototipado rapido de componentes: convertir bocetos o imagenes de referencia en esqueletos de componentes reutilizables antes de la revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del numero de parametros (35,1B) y no proceden de documentacion oficial del modelo.

- VRAM en precision BF16/FP16: en torno a 70-75 GB solo para pesos, mas el cache KV y las activaciones. Requiere al menos dos GPU de 80 GB o una configuracion con offloading.
- VRAM en cuantizacion de 8 bits: aproximadamente 38-42 GB, viable en una A100 80 GB o H100 80 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 20-24 GB, al limite de una RTX 4090 de 24 GB; con contexto corto y sin vision podria caber, aunque no esta verificado.
- GPU recomendadas para produccion: A100 80 GB, H100 80 GB o H200, en configuracion multi-GPU si se sirve en precision completa.
- Consumer GPU: no cabe en precision completa. En 4 bits podria caber en RTX 4090 / RTX 5090 (24-32 GB), siempre que se disponga de una build compatible con la arquitectura `qwen3_5_moe`.
- Opciones de despliegue: al estar en `transformers` y `safetensors`, el punto de partida es la libreria transformers. El tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI para esta arquitectura concreta.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con ~3B parametros activos, el coste por token es previsiblemente inferior al de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| WebUniverse-NSL/Qwen3.5-WebUniverse-Vision-grounded | 35,1B totales, ~3B activos | no disponible | imagen-texto | no disponible | gated |
| Qwen/Qwen3.5-35B-A3B (modelo base) | 35B totales, 3B activos | no disponible | texto (segun informacion disponible) | no disponible | no disponible |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables adicionales en la documentacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace; no es posible descargarlo de forma anonima.
- Licencia no especificada: al no declararse licencia, el uso comercial queda en un limbo legal y debe consultarse con el autor antes de cualquier despliegue en produccion.
- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion: los modelos de generacion de codigo y texto multimodal pueden producir APIs, selectores o fragmentos de interfaz inexistentes, especialmente al interpretar capturas ambiguas.
- Sin benchmarks ni validacion externa: 0 descargas y 0 likes en el momento del registro, sin resultados publicados de evaluacion. No hay evidencia objetiva de calidad frente al modelo base.
- Longitud de contexto desconocida: no se puede garantizar el manejo de repositorios grandes o conversaciones largas sin degradacion.
- Composicion del dataset opaca: no se detalla el volumen, la procedencia ni el filtrado de `webcraft-NSL/WebUniverse-Mix`, por lo que no puede evaluarse el riesgo de sesgos o de contaminacion de benchmarks.
- Detalles de entrenamiento ausentes: no se documenta si hubo alineacion (RLHF/DPO), hiperparametros, ni el alcance del ajuste multimodal, lo que dificulta reproducir o auditar el modelo.
- Fecha de publicacion adelantada respecto al uso habitual: el registro indica octubre de 2026, dato que conviene verificar en la pagina del modelo.
- Recomendacion: para cargas en produccion, validar el modelo contra el base Qwen/Qwen3.5-35B-A3B en el dominio concreto antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WebUniverse-NSL/Qwen3.5-WebUniverse-Vision-grounded
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/webcraft-NSL/WebUniverse-Mix
- Paper tecnico: no disponible
- Blog o articulo de presentacion: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
