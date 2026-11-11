# tahamajs/llava-qwen-0.5b-factorised-matrix-state-scienceqa

## Resumen

`llava-qwen-0.5b-factorised-matrix-state-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro del ecosistema NeuralOps, una libreria centrada en tecnicas de "cirugia de atencion" (attention surgery) y compresion de modelos. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM LLaVA de 0,5 mil millones de parametros con torre visual SigLIP congelada y decodificador Qwen2 de 24 capas, y sustituye el mecanismo de atencion cuadratica en 18 de esas 24 capas por un operador de atencion lineal recurrente denominado `FactorisedMatrixState`, basado en descomposicion SVD.

El objetivo no es tanto ofrecer un modelo listo para produccion como demostrar una receta de compresion: se reduce el artefacto de pesos de 1,66 GB a 187 MB (un 89 % menos) manteniendo solo los pesos modificados y las capas congeladas fuera del repositorio. El modelo se evalua sobre el subconjunto con imagen de ScienceQA (split de validacion), una tarea de razonamiento visual STEM de opcion multiple.

Es relevante ahora porque ejemplifica una linea de investigacion activa: reemplazar capas de atencion por alternativas lineales o recurrentes para abaratar inferencia y memoria, combinadas con destilacion de conocimiento desde el modelo profesor. Los resultados, sin embargo, muestran una perdida de precision considerable (63,75 % del profesor frente a 29,38 % del modelo final), lo que lo situa como una prueba de concepto mas que como un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas), con atencion lineal recurrente `FactorisedMatrixState` (familia SVD) en 18/24 capas |
| Parametros totales | 0,5 mil millones (modelo base LLaVA-Qwen-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirurgico en FP16) |

## Arquitectura y entrenamiento

El modelo hereda la topologia de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP de 27 capas congelada, un proyector multimodal de dos capas MLP y un decodificador Qwen2 de 24 capas con dimension oculta D=1024, 16 cabezas y head_dim=64. La intervencion quirurgica reemplaza la atencion cuadratica por `FactorisedMatrixState` en 18 de las 24 capas segun un esquema `hybrid_3_1`, conservando seis capas ancla cuadraticas en los indices [3, 7, 11, 15, 19, 23]. Se congelan la torre visual, el proyector, los MLP del decodificador y los embeddings; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento se realizo en dos etapas de destilacion de conocimiento desde el modelo profesor, con un total de 94 pasos de optimizacion (31 en la etapa 1 y 63 en la etapa 2), sobre una NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 16.214 MB y una duracion de 120,1 segundos. El dataset de evaluacion es `derek-thomas/ScienceQA` (subconjunto con imagen, validacion). No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion completa del corpus de destilacion.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) y respuesta a preguntas visuales de opcion multiple.
- Razonamiento visual basico sobre diagramas y figuras de tipo STEM (ciencias, matematicas, tecnologia).
- Capacidad conversacional multi-turno heredada del modelo base LLaVA-Interleave.
- Soporte de plantilla de chat (`chat_template.json`) para formateo de conversaciones.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documenta soporte de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la informacion disponible.
- No se documenta capacidad de audio ni de video.

## Casos de uso

- Investigacion en compresion de modelos: sirve como referencia reproducible para medir el impacto de sustituir atencion cuadratica por atencion lineal recurrente en un VLM pequeno, con todos los artefactos y metricas publicados.
- Experimentos de destilacion de conocimiento: el par profesor/alumno (63,75 % frente a 29,38 %) permite estudiar curvas de recuperacion de precision con pocos pasos de entrenamiento.
- Prototipado en entornos con VRAM limitada: el artefacto de 187 MB y el modelo base de 0,5 B permiten cargar y ejecutar inferencia en GPUs de consumo, aunque con precision reducida.
- Evaluacion de tecnicas SVD en atencion: util para comparar variantes de la familia `factorised_matrix_state` frente a otras cirugias de atencion del zoo de NeuralOps.
- Docencia y divulgacion: ejemplo didactico de como auditar el tamano en disco de un checkpoint y que componentes se congelan frente a los que se entrenan.
- Pruebas de integracion de la libreria `neuralops` y su API `load_surgeried_model`, como paso previo a desplegar variantes mas capaces del mismo zoo.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines de agentes, dado el bajo rendimiento medido y la ausencia de soporte documentado para tool calling.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre ScienceQA (subconjunto con imagen, split de validacion), no verificados de forma independiente:

| Metrica | Profesor (baseline) | Pre-destilacion (zero-shot) | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Precision (%) | 63,75 | 44,38 | 29,38 | -15,00 |
| Perplejidad | 2,45 | 121,12 | 3,26 | -117,86 |

Telemetria de entrenamiento declarada: 94 pasos de optimizacion, 120,1 s de duracion, pico de VRAM de 16.214 MB en una RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base completo en FP16 ocupa aproximadamente 1,66 GB de pesos; el delta publicado son 187 MB, pero para ejecutarlo hay que cargar tambien los componentes congelados del modelo base.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM deberia poder alojar el modelo base en FP16; el autor entreno en una RTX 3090 de 24 GB.
- Cabe en GPU de consumo: si, en tarjetas tipo RTX 3060/4060 (8-12 GB) y superiores, segun el peso del modelo base.
- Opciones de despliegue: la via documentada es la libreria `neuralops` mediante `load_surgeried_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La atencion lineal en 18/24 capas deberia reducir el coste computacional frente al modelo base, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-factorised-matrix-state-scienceqa` | 0,5 B | no disponible | 29,38 % (declarado) | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5 B | no disponible | 63,75 % (declarado por el autor) | no disponible en esta ficha | Hugging Face |
| Otros checkpoints del zoo NeuralOps | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face |

No se dispone de datos publicados en la informacion proporcionada para comparar con alternativas externas como SmolVLM, Qwen2-VL-2B o InternVL2, por lo que la comparativa se limita al modelo base y a las variantes del mismo zoo.

## Limitaciones y advertencias

- Perdida de precision severa: 29,38 % frente al 63,75 % del profesor en ScienceQA, una caida de 15 puntos respecto al checkpoint pre-destilacion y de mas de 34 puntos respecto al original.
- El modelo es un experimento de investigacion, no un producto: el repositorio solo contiene pesos delta quirurgicos, no un checkpoint autonomo; requiere cargar el modelo base y la libreria `neuralops`.
- Riesgo elevado de alucinacion y respuestas incorrectas en razonamiento visual, coherente con la precision medida por debajo del 30 %.
- Idiomas: solo ingles declarado; no hay garantias de comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada; no se debe asumir la ventana del modelo base sin verificacion.
- Licencia MIT permite uso comercial, pero la idoneidad tecnica para produccion es muy cuestionable dado el rendimiento.
- Benchmarks no verificados (`verified: false` en el model-index); deben tratarse como cifras declaradas por el autor.
- El modelo fue creado y actualizado el 11 de noviembre de 2026 segun los metadatos, con cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se documentan sesgos especificos, pero al derivar de un VLM entrenado principalmente con datos en ingles es esperable un sesgo linguistico y cultural.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-factorised-matrix-state-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/factorised_matrix_state.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
