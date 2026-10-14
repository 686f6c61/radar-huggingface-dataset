# wrightdavid/contrastive-rc157

## Resumen

Contrastive-rc157 (identificador `wrightdavid/contrastive-rc157`) es un repositorio experimental publicado por el usuario wrightdavid que contiene una implementación funcional de DINO (self-distillation with no labels) en una configuración denominada "nano" y orientada al aprendizaje contrastivo. No se trata de un modelo entrenado ni evaluado, sino de un esqueleto de código con un checkpoint de inicialización válido para pruebas de humo (smoke tests). El propio autor indica de forma explícita que no reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado, auditado ni validado para robustez, equidad o transferencia de dominio.

El tamaño real declarado en los metadatos de safetensors es de tan solo 33.088 parámetros, una cifra que lo sitúa muy por debajo de cualquier backbone de visión utilizable en producción. El repositorio ocupa 0,0 GB y contiene, además del checkpoint, los artefactos `finetune.py`, `config.json` y `training_args.json`, que documentan la arquitectura y la receta de experimento por defecto (SGD con planificador OneCycle).

Su relevancia es, por tanto, exclusivamente metodológica: sirve como punto de partida reproducible para investigar variantes de DINO, para construir líneas base con capacidad equivalente en comparaciones controladas o para validar infraestructura de entrenamiento. Publicado bajo licencia BSD-3-Clause y con 0 descargas y 0 likes en el momento de la consulta, no debe confundirse con un modelo listo para uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINO (self-distillation with no labels), escala "nano" |
| Parametros totales | 33.088 (según metadatos de safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint en safetensors) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

Detalles adicionales de arquitectura declarados en el repositorio: atención multi-query, fusión con compuerta (gated fusion), activación approx gelu y normalización groupnorm.

## Arquitectura y entrenamiento

La arquitectura sigue el paradigma DINO, un método de aprendizaje autosupervisado basado en auto-destilación sin etiquetas, donde una red estudiante se entrena para igualar la distribución de salida de una red profesora actualizada por media móvil exponencial. En esta implementación concreta, el bloque de atención es multi-query (una única proyección de clave/valor compartida frente a múltiples consultas), la fusión entre ramas se resuelve mediante gated fusion, la activación es approx gelu y la normalización emplea groupnorm en lugar de layernorm. No se especifica el número de capas, la dimensión oculta ni la resolución de entrada.

En cuanto al entrenamiento, el repositorio no contiene ningún resultado de entrenamiento completado. La receta por defecto registrada en `training_args.json` usa optimizador SGD con un planificador OneCycle, presentados por el autor como valores de partida del script y no como evidencia de una ejecución finalizada. El checkpoint `model.safetensors` se describe explícitamente como una inicialización válida para pruebas de humo. No hay información sobre número de tokens, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de los componentes arquitectónicos citados. La carga mediante APIs automáticas genéricas requiere un adaptador explícito, ya que se trata de una implementación personalizada.

## Capacidades

- No se declara ninguna capacidad funcional de inferencia: el checkpoint no ha sido entrenado y no produce representaciones útiles.
- No dispone de generación de texto, razonamiento, código ni matemáticas (no es un modelo de lenguaje).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se documentan capacidades de visión evaluadas (aunque el marco DINO es de naturaleza visual, no hay evidencia de rendimiento en ninguna tarea).
- Lo que sí ofrece es una implementación de referencia ejecutable (`finetune.py`) con ejemplo de smoke test y configuración reproducible.

## Casos de uso

- Pruebas de humo de infraestructura de entrenamiento: el checkpoint y el script permiten verificar que el pipeline de datos, el bucle de entrenamiento y la serialización de pesos funcionan antes de lanzar experimentos a mayor escala.
- Investigación metodológica sobre DINO en escala reducida: sirve para experimentar con variantes de atención multi-query, gated fusion o groupnorm sin incurrir en costes de cómputo relevantes.
- Línea base de capacidad equivalente (matched-capacity baseline): útil para comparar recetas de preentrenamiento autosupervisado con presupuesto de parámetros idéntico y semillas controladas.
- Docencia y formación: ejemplo compacto y transparente para explicar el funcionamiento de la auto-destilación y las pérdidas contrastivas en un curso o taller.
- Reproducibilidad de experimentos: al fijar `config.json` y `training_args.json`, permite registrar y replicar recetas con versiones de entorno y semillas conocidas.
- Punto de partida para extensiones arquitectónicas: base sobre la que añadir cabezales, cambiar el profesor/estudiante o integrar nuevos objetivos contrastivos antes de escalar el modelo.

En ninguno de estos escenarios el modelo entrega valor predictivo por sí mismo; el valor está en el código y en la reproducibilidad del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del autor indica de forma explícita que "no benchmark score is claimed in this repository" y que el checkpoint es únicamente una inicialización para pruebas de humo. Cualquier cifra de MMLU, HumanEval, GSM8K o métricas de visión (ImageNet k-NN, linear probe) sería inventada y, por tanto, no se incluye.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión; con 33.088 parámetros, el checkpoint en fp32 ocupa aproximadamente 0,13 MB.
- GPU recomendadas: cualquier GPU, incluida una integrada; no requiere acelerador dedicado. Una RTX 4090, A100 o H100 estarían completamente sobredimensionadas para este peso.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU sin penalización apreciable.
- Opciones de despliegue: al ser una implementación personalizada, no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI. La vía prevista es la ejecución directa de `finetune.py`, y la carga mediante APIs automáticas requiere un adaptador explícito.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones y, al no existir un modelo entrenado, carecerían de sentido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wrightdavid/contrastive-rc157 | 33.088 | no disponible | ninguno (no se reclama) | BSD-3-Clause | HuggingFace, 0 descargas |
| DINO original (ViT-S/16) | ~21 M | imagen 224x224 | linear probe y k-NN en ImageNet publicados por los autores | Apache-2.0 (repositorio oficial) | pesos públicos |
| DINOv2 (ViT-S/14) | ~22 M | imagen 224x224 y superiores | múltiples tareas densas y de clasificación publicadas | Apache-2.0 / licencia específica según checkpoint | pesos públicos |
| SimCLR (ResNet-50) | ~24 M | imagen 224x224 | linear probe publicado | Apache-2.0 (implementación de referencia) | pesos públicos |

Nota: la comparación es estructural, no de rendimiento. La diferencia de escala entre este repositorio (decenas de miles de parámetros, sin entrenar) y los backbones de referencia (decenas de millones de parámetros, entrenados y evaluados) es de tres órdenes de magnitud, por lo que no existe una comparación funcional válida.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce representaciones útiles para ninguna tarea.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según reconoce el propio autor.
- No existen datos de sesgo, alucinación, contexto o idioma porque no hay un modelo funcional que evaluar.
- El rendimiento de un futuro checkpoint entrenado deberá documentarse por separado de los valores por defecto publicados aquí.
- La licencia BSD-3-Clause permite uso comercial del código, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si se emplean datasets externos.
- No se garantiza compatibilidad con APIs de carga automática sin escribir un adaptador específico.
- Cualquier afirmación de rendimiento sobre este repositorio carecería de respaldo experimental; la evaluación mínima recomendada por el autor exige un conjunto de validación específico de la tarea, al menos tres semillas y una línea base de capacidad equivalente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wrightdavid/contrastive-rc157
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
