# TiGa-RCE/gemma-4-12B-it-oQ2e

## Resumen

`TiGa-RCE/gemma-4-12B-it-oQ2e` es una cuantización de precisión mixta a 2 bits del modelo `gemma-4-12B-it`, publicada por el usuario TiGa-RCE. El repositorio no contiene un modelo entrenado desde cero, sino un artefacto de compresión de pesos generado con la herramienta oQ (oMLX v0.6.4), que reparte distintos niveles de precisión entre las capas para intentar preservar la calidad frente a una cuantización uniforme de 2 bits. El resultado se distribuye en formato MLX safetensors, es decir, exclusivamente para el runtime de Apple MLX sobre silicio de Apple.

El dato verificable del repositorio son los 11.907.350.320 parámetros (~11,9 B) declarados en los safetensors y un tamaño de repositorio de 4,5 GB, coherente con 2 bits por peso y un tamaño de grupo de 64. Se desconoce la licencia, los idiomas soportados, la longitud de contexto y cualquier detalle del entrenamiento del modelo base; el autor tampoco publica resultados de evaluación. El model type declarado es `gemma4_unified`, lo que sitúa el artefacto en la familia Gemma, pero el repositorio no documenta las características concretas de esa arquitectura base.

Su relevancia práctica es acotada pero clara: permite ejecutar un modelo de clase 12B en Macs con memoria unificada modestas, a cambio de una pérdida de calidad que no está cuantificada en ningún benchmark publicado. Al no tener descargas ni valoraciones y al haber sido reemplazado según el propio autor por una versión posterior del mismo día, debe tratarse como un artefacto experimental, no como una dependencia de producción sin evaluar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo declara el model type `gemma4_unified`; no se detallan capas, atención ni mecanismos internos) |
| Parámetros totales | 11.907.350.320 (~11,9 B), según los safetensors del repositorio |
| Parámetros activos | no aplica (no hay indicios de que el modelo base sea de tipo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2 bits con cuantización de precisión mixta oQ (oMLX v0.6.4), tamaño de grupo 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio (el modelo base Gemma tiene sus propios términos, que habría que verificar por separado) |
| Formato de pesos | MLX safetensors (formato nativo de Apple MLX) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura del modelo base más allá de la etiqueta `gemma4_unified` y del nombre `gemma-4-12B-it`, que sugiere un transformer de la familia Gemma 4 con ajuste por instrucciones (sufijo `-it`). No se documentan número de tokens de entrenamiento, composición del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se indica la ventana de contexto nativa del modelo original.

La única innovación técnica documentada es el propio esquema de cuantización: oQ aplica precisión mixta a 2 bits con tamaño de grupo 64, lo que permite asignar más bits a las capas o tensores más sensibles y menos al resto, en lugar de degradar todos los pesos por igual. El autor advierte que esta versión de los pesos sustituye a una anterior publicada el mismo día (2026-09-10), por lo que cualquier descarga previa a esa fecha debería repetirse. No se aportan curvas de degradación, comparativas con el modelo en bf16 ni métricas de perplejidad que permitan cuantificar el coste real de la compresión.

## Capacidades

- Generación de texto e instrucciones: se heredan del modelo base `gemma-4-12B-it`, pero el repositorio no documenta ninguna capacidad concreta ni ejemplos de uso.
- Razonamiento, matemáticas y generación de código: no disponible; no hay evaluaciones ni afirmaciones del autor al respecto.
- Tool calling y function calling: no disponible; no se menciona soporte en la model card.
- Uso como agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está relleno).
- Capacidades especiales (modo thinking, visión, audio): no disponible; la etiqueta `gemma4_unified` no va acompañada de ninguna descripción funcional en el repositorio.
- Ejecución local en Apple Silicon: es la única capacidad confirmada por el propio formato del artefacto, que requiere el runtime MLX.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con `mlx-lm` en un equipo Apple Silicon para validar prompts y flujos de generación antes de decidir si merece la pena servir el modelo base en precisión completa. El atractivo es el tamaño de 4,5 GB, no la calidad.
- Asistentes de texto sin conexión en portátiles: escenarios donde la privacidad impide enviar datos a una API y donde una degradación moderada de la calidad es aceptable a cambio de no salir del dispositivo.
- Generación de borradores y resúmenes de documentos internos: tareas de transformación de texto donde el modelo actúa como primer paso y un humano revisa la salida, siempre que una evaluación previa confirme que la cuantización a 2 bits no arruina la coherencia.
- Clasificación y etiquetado por lotes de textos: uso del modelo como componente barato de preprocesamiento (categorización, extracción de campos simples) en un pipeline que no requiera matices finos.
- Investigación sobre cuantización: comparar la salida de esta versión oQ a 2 bits con el modelo base en bf16 y con otras cuantizaciones (GGUF Q2, AWQ de 2 bits) para medir la pérdida real de calidad, que es precisamente el dato que el autor no publica.
- Demostraciones educativas de MLX: ejemplo de carga, tokenización e inferencia con pesos cuantizados dentro de un curso o taller sobre despliegue en Apple Silicon.
- Aplicaciones de baja concurrencia en el borde: un único usuario interactivo en un Mac con memoria unificada, donde el throughput agregado no es un requisito y el coste de servidor es cero.

En todos estos casos la recomendación es la misma: medir antes de adoptar. No hay benchmarks, ni licencia declarada, ni historial de uso que respalde el artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra métrica, y tampoco ofrece comparación con el modelo base sin cuantizar.

| Benchmark | Este modelo | Modelo base `gemma-4-12B-it` | Otras cuantizaciones a 2 bits |
|---|---|---|---|
| MMLU | no disponible | no disponible | no disponible |
| HumanEval | no disponible | no disponible | no disponible |
| GSM8K | no disponible | no disponible | no disponible |
| Perplejidad | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM / memoria unificada estimada: los pesos ocupan 4,5 GB en disco; en memoria hay que sumar el runtime, los buffers de activaciones y la caché KV, que depende de la longitud de contexto (no publicada). Con 8 GB de memoria unificada el modelo entra muy justo y con contexto limitado; 16 GB es el mínimo cómodo recomendado, y 24-32 GB permiten contextos amplios y otras aplicaciones abiertas. Son estimaciones derivadas del tamaño del repositorio, no cifras publicadas por el autor.
- GPU compatibles: exclusivamente silicio de Apple (series M1, M2, M3 o M4, en variantes base, Pro, Max y Ultra). No hay soporte CUDA ni ROCm para este formato.
- GPU de consumo: cabe en cualquier Mac con memoria unificada de 8 GB o más, aunque con margen escaso; no es ejecutable en GPUs NVIDIA o AMD de consumo sin reconvertir los pesos a otro formato.
- Opciones de despliegue: `mlx-lm` (incluido su servidor HTTP), LM Studio en modo MLX y otras herramientas que consuman MLX safetensors. vLLM, TGI y llama.cpp/Ollama no consumen MLX de forma nativa; requerirían conversión previa a GGUF u otro formato, con la pérdida de fidelidad que eso implica.
- Latencia y throughput: no disponible. No hay cifras de tokens por segundo ni de latencia de primer token, y dependerán del chip concreto (un M4 Max será sustancialmente más rápido que un M1 base).

## Comparativa con modelos similares

No se dispone de datos verificables de rendimiento para establecer una comparación cuantitativa. La tabla recoge únicamente lo que puede afirmarse sin inventar cifras.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `TiGa-RCE/gemma-4-12B-it-oQ2e` | ~11,9 B (2 bits) | no disponible | no disponible | MLX safetensors | repositorio público, 0 descargas, 0 likes |
| `gemma-4-12B-it` (modelo base, sin cuantizar) | no disponible | no disponible | no disponible (se rige por los términos de Gemma) | no disponible | no confirmada en la información proporcionada |
| Otras cuantizaciones de 2 bits de la misma familia (GGUF Q2_K, AWQ de 2 bits) | no disponible | no disponible | no disponible | GGUF / safetensors | no disponible |

La única comparación objetivable con los datos aportados es el tamaño: 4,5 GB para esta versión frente al tamaño del modelo base en bf16, que no se facilita.

## Limitaciones y advertencias

- Cuantización agresiva: 2 bits por peso con tamaño de grupo 64 es un régimen con pérdida de calidad habitualmente notable en razonamiento, matemáticas y código. La precisión mixta de oQ puede mitigarla, pero el autor no publica ninguna medición.
- Ausencia total de evaluación: sin benchmarks ni perplejidad, no hay forma de saber si el modelo sigue siendo utilizable para tareas que exijan rigor.
- Licencia no declarada: el repositorio no indica licencia. Además, al ser un derivado de un modelo Gemma, los términos del modelo base (habitualmente con condiciones de uso, atribución y restricciones propias) siguen aplicándose. Antes de cualquier uso comercial hay que verificar la licencia del modelo original y confirmar que la redistribución cuantizada está permitida.
- Riesgo de alucinación: inherente a los modelos generativos y presumiblemente agravado por la compresión a 2 bits, aunque no cuantificado.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, por lo que no puede garantizarse un comportamiento correcto en castellano ni en conversaciones largas.
- Compatibilidad restringida: el formato MLX limita la ejecución a Apple Silicon. Cualquier despliegue en servidores Linux con GPU NVIDIA requiere convertir los pesos, lo que puede alterar el resultado.
- Artefacto sin validación comunitaria: 0 descargas y 0 likes; no hay retroalimentación de terceros que confirme que los pesos cargan correctamente.
- Versión reemplazada: el autor advierte de que esta publicación sustituye a una anterior del mismo día, señal de un artefacto en revisión activa. Conviene fijar el hash de los safetensors para garantizar reproducibilidad.
- Metadatos anómalos: las fechas de creación y actualización (2026-09-10) no son coherentes con un repositorio consolidado; conviene tratarlas con cautela y verificar los archivos reales.
- Sin garantías de soporte: el repositorio no incluye instrucciones de uso, código de ejemplo ni contacto del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TiGa-RCE/gemma-4-12B-it-oQ2e
- oQ / oMLX (herramienta de cuantización citada por el autor): https://github.com/jundot/omlx
- MLX (runtime necesario para cargar los pesos): https://github.com/ml-explore/mlx
- MLX LM (librería de inferencia y servidor): https://github.com/ml-explore/mlx-lm

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo. Los enlaces obtenidos correspondían a sitios de fuentes tipográficas, plataformas de cursos y foros ajenos al ámbito de la inteligencia artificial, por lo que se han descartado. No se han encontrado papers, blogs, repositorios de demostración ni publicaciones del autor sobre este artefacto.
