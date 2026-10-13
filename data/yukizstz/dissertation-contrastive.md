# yukizstz/dissertation-contrastive

## Resumen

`yukizstz/dissertation-contrastive` es un repositorio experimental publicado en HuggingFace que contiene una implementación propia de una arquitectura tipo Flamingo orientada a aprendizaje contrastivo. Lo desarrolla el usuario yukizstz y su propósito declarado no es ofrecer un modelo entrenado, sino servir como base de código inspeccionable para validar cambios de arquitectura antes de lanzar un entrenamiento completo. El repositorio incluye `inference.py`, `config.json`, `training_args.json` y un checkpoint de inicialización en `model.safetensors` destinado únicamente a pruebas de humo (smoke tests).

El dato más relevante es su tamaño real: el checkpoint en safetensors contiene 33.088 parámetros totales, una cifra propia de un modelo de juguete o de una configuración mínima de validación, no de un modelo de producción. La model card etiqueta el "scale" como *huge* en la configuración, pero esa etiqueta es un parámetro del script y no refleja el tamaño efectivo del checkpoint publicado, que es de apenas decenas de miles de parámetros y ocupa 0,0 GB.

Por tanto, el modelo es relevante únicamente como punto de partida experimental para quien quiera estudiar o reutilizar el esqueleto de código Flamingo con fusión bilineal y atención dispersa. No se reclama ningún resultado de benchmark, no se ha entrenado ni auditado, y su utilidad práctica en tareas reales es, a día de hoy, nula sin un entrenamiento previo por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flamingo (implementación propia) |
| Parametros totales | 33.088 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |
| Atencion | dispersa (sparse) |
| Fusion | bilineal |
| Activacion | gelu tanh |
| Normalizacion | scalenorm |
| Optimizador por defecto | lion con warmup lineal |
| Tamano del repo | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón Flamingo, un diseño multimodal que combina un codificador visual con un modelo de lenguaje mediante capas de fusión cruzada. En este repositorio, la configuración declara atención dispersa, fusión bilineal entre modalidades, activación `gelu tanh` y normalización `scalenorm`. Se trata de una implementación personalizada, por lo que no se puede cargar con las APIs genéricas de HuggingFace (`AutoModel` y similares) sin escribir antes un adaptador explícito que mapee la lógica del script.

Respecto al entrenamiento, la model card es explícita: no se ha ejecutado ningún entrenamiento completo. El archivo `training_args.json` recoge una receta de experimento por defecto (optimizador lion con scheduler de warmup lineal), pero el propio autor aclara que son valores de partida del script y no evidencia de un run finalizado. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. No se documentan número de tokens, composición del dataset, ni fases de RLHF, DPO o ajuste por instrucciones.

## Capacidades

Al no existir un checkpoint entrenado, no se pueden atribuir capacidades funcionales verificadas al modelo. Lo que sí se conoce de la base de código es:

- La arquitectura está diseñada para aprendizaje contrastivo, lo que sugiere un uso previsto de alineación de representaciones entre pares de datos (por ejemplo, imagen-texto), aunque no se especifica la tarea concreta.
- Al ser de tipo Flamingo, el diseño contempla fusión entre modalidades, lo que apuntaría a escenarios multimodales.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan modos especiales de razonamiento (thinking mode), visión o audio más allá del componente de fusión genérico.
- El único comportamiento verificable hoy es que el script `inference.py` se ejecuta y produce un ejemplo de prueba generado en su bloque `__main__`.

## Casos de uso

Dado que el repositorio no contiene un modelo entrenado, los casos de uso son potenciales y requieren entrenamiento previo por parte del adoptante:

- Punto de partida para investigación en aprendizaje contrastivo: el código permite inspeccionar cómo se implementa una fusión bilineal y una atención dispersa en un esqueleto Flamingo, útil para comparar variantes de arquitectura antes de invertir cómputo en un run completo.
- Base para experimentos de alineación de representaciones: quien quiera probar variantes de pérdidas contrastivas sobre pares de datos (imagen-texto, audio-texto u otros) puede reutilizar `inference.py` y `config.json` como plantilla.
- Pruebas de humo en pipelines de CI: el checkpoint de inicialización permite verificar que el código de carga, el tokenizador y el adaptador personalizado funcionan antes de un entrenamiento real.
- Docencia y divulgación: sirve como ejemplo mínimo y legible de cómo se estructura una implementación Flamingo con configuración externa en JSON.
- Benchmarking de configuraciones: el script permite barrer hiperparámetros (tipo de atención, funciones de activación, normalización) sin necesidad de un modelo grande.
- Preparación de adaptadores de carga: dado que no funciona con APIs automáticas, es un caso práctico para desarrollar y probar adaptadores de `AutoModel` personalizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no benchmark score is claimed in this repository" y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable. Con 33.088 parámetros, el modelo cabe en CPU y en cualquier GPU, incluso integradas.
- GPU recomendadas: no procede ninguna GPU dedicada; el checkpoint se ejecuta en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo e incluso sin GPU.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. Al ser una implementación personalizada, requiere ejecutar `inference.py` directamente o escribir un adaptador.
- Latencia y throughput: no disponibles. No tiene sentido medirlos sobre un checkpoint sin entrenar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| yukizstz/dissertation-contrastive | 33.088 | no disponible | BSD-3-Clause | Checkpoint de inicializacion, sin entrenar |
| Mikuznetsov/dissertation-contrastive | no disponible | no disponible | Apache-2.0 | Repositorio con los mismos archivos, aparentemente un duplicado o fork |
| CLIP (referencia de contraste) | cientos de millones | 77 tokens de texto | MIT (varia por version) | Modelo entrenado y publicado |
| Flamingo (referencia de arquitectura, DeepMind) | miles de millones | no publico | no publica pesos | Investigacion, sin liberacion abierta |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría. La única referencia directa encontrada es el repositorio `Mikuznetsov/dissertation-contrastive`, que contiene los mismos archivos (`inference.py`, `README.md`, `config.json`, `training_args.json`, `model.safetensors`) pero bajo licencia Apache-2.0.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado. Sus salidas no son significativas y no deben usarse en producción ni para evaluar calidad.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, tal como advierte el propio autor.
- No se declaran idiomas soportados, por lo que no se puede asumir cobertura multilingüe.
- No se publica longitud de contexto, por lo que se desconoce la ventana máxima admitida por la configuración.
- El modelo emplea una implementación personalizada: las APIs automáticas de HuggingFace no lo cargarán sin un adaptador explícito, lo que añade coste de integración.
- La etiqueta de escala "huge" en la configuración no coincide con el recuento real de parámetros (33.088), por lo que no debe tomarse como indicador de tamaño.
- La licencia BSD-3-Clause permite uso comercial, pero el propio repositorio recomienda revisar por separado los términos de los datos fuente si se combina con datasets externos.
- Existe un repositorio casi idéntico bajo otra cuenta (`Mikuznetsov`) con licencia Apache-2.0; conviene verificar la procedencia y la relación entre ambos antes de reutilizar el código.
- Las fechas de creación y actualización del repositorio (2026-10-13) no permiten situarlo con fiabilidad en una línea temporal de desarrollo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yukizstz/dissertation-contrastive
- Repositorio similar (Mikuznetsov): https://huggingface.co/Mikuznetsov/dissertation-contrastive
- Árbol de archivos del repositorio similar: https://huggingface.co/Mikuznetsov/dissertation-contrastive/tree/main
- Artículo divulgativo sobre aprendizaje contrastivo (Netguru): https://www.netguru.com/blog/contrastive-learning
- Propuesta de tesis sobre modelo contrastivo estilo CLIP (KU Leuven): https://wms.cs.kuleuven.be/cs/studeren/master-artificial-intelligence/MAI_SIP/masters-thesis/thesis-topics-2026-2027/format-1/mai_thesis_tess_sdss.pdf
- Google Scholar: https://scholar.google.com/
