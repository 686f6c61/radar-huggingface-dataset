# unignoramus/anlp-a3-deltanet-plain

## Resumen

`anlp-a3-deltanet-plain` es un modelo de descifrado de cifrados (cipher decryption) publicado por el usuario `unignoramus` en Hugging Face. Se trata de un artefacto de carácter académico, presumiblemente vinculado a una asignatura o trabajo de la materia ANLP (Advanced Natural Language Processing), como indica el tag `anlp-a3` y el nombre del repositorio. El modelo card es extremadamente escueto y se limita a indicar que se carga mediante el módulo `src.part1.infer` del código del autor.

Arquitectónicamente, el nombre y la descripción apuntan a una red compuesta por cuatro capas de tipo DeltaNet, un mecanismo de atención lineal recurrente derivado de la familia de modelos state space y linear attention. Con 1.808.792 parámetros totales, es un modelo de escala muy reducida, pensado para una tarea concreta de transformación de secuencias (descifrado) y no para generación de texto general.

Su relevancia es limitada fuera del contexto del curso o experimento para el que fue creado: no hay información pública sobre datos de entrenamiento, benchmarks, licencia ni idiomas. Se documenta aquí como ficha técnica de referencia para quien necesite evaluar su uso o reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeltaNet (4 capas de tipo `deltanet`) |
| Parametros totales | 1.808.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El modelo se compone de cuatro capas denominadas `deltanet` según la model card. DeltaNet es un mecanismo de atención lineal con actualización delta, perteneciente a la familia de modelos recurrentes lineales que buscan sustituir la atención cuadrática de los transformers por una recurrencia con coste lineal en la longitud de secuencia. No se dispone de información sobre la dimensión oculta, número de cabezas, tamaño de vocabulario ni configuración exacta de las capas.

No hay datos públicos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El modelo card únicamente indica que debe cargarse con `src.part1.infer`, lo que sugiere que el código de entrenamiento e inferencia no está incluido en el repositorio de Hugging Face o no está documentado en la model card.

## Capacidades

- Descifrado de texto cifrado: la tarea declarada es la decodificación de mensajes cifrados, presumiblemente mediante un esquema de sustitución o transformación aprendida.
- Procesamiento de secuencias con mecanismo DeltaNet: adecuado para dependencias de longitud moderada gracias a la recurrencia lineal.
- No se documentan capacidades de generación de texto abierto, razonamiento, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documenta modo thinking ni capacidades especiales adicionales.

## Casos de uso

- Práctica académica de descifrado: el modelo sirve como referencia para experimentos de la asignatura ANLP, cargándolo con `src.part1.infer` para evaluar la precisión de descifrado sobre un conjunto de prueba del curso.
- Reproducción de experimentos con DeltaNet: útil para investigadores que quieran comparar el comportamiento de cuatro capas DeltaNet en una tarea de transformación de secuencias frente a alternativas como transformers o SSM.
- Prototipado de decodificadores ligeros: con menos de 2 millones de parámetros, puede ejecutarse en CPU para validar pipelines de inferencia antes de escalar a modelos mayores.
- Docencia sobre atención lineal: sirve como ejemplo didáctico de implementación y carga de un modelo con mecanismo DeltaNet en PyTorch.
- Evaluación de robustez de cifrados: permite medir hasta qué punto una red recurrente lineal pequeña puede aprender a invertir un esquema de cifrado concreto.
- Integración en cuadernos de laboratorio: al ser un checkpoint pequeño en safetensors, se puede versionar y distribuir junto con el código del curso sin coste de almacenamiento significativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (1.808.792 parámetros × 4 bytes ≈ 7,2 MB de pesos), por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); el modelo no aprovecha la capacidad de cómputo de GPUs de gama alta.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en sistemas integrados.
- Opciones de despliegue: carga directa con PyTorch mediante el módulo `src.part1.infer` indicado por el autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; por el tamaño, la latencia en CPU debería ser de milisegundos por secuencia, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a3-deltanet-plain | 1.808.792 | no disponible | Descifrado | no disponible | Hugging Face (0 descargas) |
| Modelos DeltaNet de referencia (p. ej. implementaciones académicas) | variable | no disponible | Secuencias generales | variable | Repositorios de investigación |
| Transformers pequeños para cifrado | variable | no disponible | Descifrado | variable | No disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un modelo de descifrado, los sesgos dependerían del corpus de cifrado utilizado, que no se documenta.
- Riesgo de alucinación: no aplicable en sentido estricto a una tarea de descifrado, pero sí existe riesgo de producir descifrados incorrectos sin señal de confianza.
- Limitaciones de contexto o idioma: se desconoce la longitud máxima de secuencia soportada y los idiomas de los textos cifrados.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede garantizar el uso comercial ni la redistribución.
- Caveat para producción: el modelo carece de model card detallada, código de inferencia incluido en el repo y métricas publicadas; no es apto para despliegues en producción sin una evaluación previa por parte del usuario.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unignoramus/anlp-a3-deltanet-plain
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
