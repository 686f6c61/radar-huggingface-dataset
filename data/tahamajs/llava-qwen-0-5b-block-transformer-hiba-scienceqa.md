# tahamajs/llava-qwen-0.5b-block-transformer-hiba-scienceqa

## Resumen

`llava-qwen-0.5b-block-transformer-hiba-scienceqa` es un modelo de vision-lenguaje (VLM) publicado por Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps, un "zoo" experimental de variantes de atencion subcuadratica aplicadas sobre arquitecturas conocidas. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (codificador visual SigLIP congelado, proyector MLP y decodificador Qwen2 de 24 capas con `D=1024` y `H=16`) y sustituye 18 de las 24 capas de atencion del decodificador por el operador `BlockTransformerHIBA`, un mecanismo de atencion jerarquica por bloques con softmax unico sobre puntuaciones intra-bloque e inter-bloque.

El objetivo no es tanto ofrecer un VLM de proposito general como aislar y medir el comportamiento de un mecanismo de atencion subcuadratico cuando se le somete a enrutamiento denso visio-textual. Para ello el autor congela por completo la torre visual y el proyector multimodal, y destila las capas transplantadas sobre preguntas con imagen del dataset ScienceQA. El resultado es un modelo de 0,5 mil millones de parametros aproximadamente, entrenado en apenas 110 pasos de optimizacion, que recupera buena parte del rendimiento del modelo profesor.

Es relevante ahora porque documenta de forma transparente (telemetria, artefactos, script de carga) una "cirugia de atencion" reproducible: pasa de 34,48 % a 43,45 % de accuracy en ScienceQA tras el destilado, frente al 46,90 % del profesor original. La licencia MIT y el formato de pesos safetensors facilitan la experimentacion, aunque su alcance practico es acotado y su validacion externa es nula (0 descargas, 0 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision encoder + MLP projector + decodificador Qwen2) con atencion `block_transformer_hiba` en 18 de 24 capas |
| Parametros totales | no disponible (modelo base de 0,5 B; el repo pesa 0,5 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 459,16 MB, FP16) + configs de processor y tokenizer |
| Geometria del decodificador | 24 capas, `D=1024`, `H=16`, `d_h=64` |
| Capas con atencion cuadratica (anclas) | 6 (`[3, 7, 11, 15, 19, 23]`) |
| Patron de sustitucion | `hybrid_3_1` (18 capas transplantadas) |
| Libreria | `neuralops` |
| Pipeline | `image-text-to-text` |

## Arquitectura y entrenamiento

El modelo es una variante de LLaVA en la que el decodificador de lenguaje no usa atencion cuadratica completa. El operador `BlockTransformerHIBA` (familia `adaptive` en el registro `ATTENTION_REGISTRY` de NeuralOps) implementa una atencion jerarquica por bloques: atencion densa dentro de cada bloque, atencion dispersa top-k hacia bloques no locales, y una unica softmax calculada sobre la concatenacion de puntuaciones intra-bloque e inter-bloque. La sustitucion sigue el patron `hybrid_3_1`: 18 de las 24 capas del decodificador se reemplazan por este operador, mientras que 6 capas ancla (`[3, 7, 11, 15, 19, 23]`) conservan atencion cuadratica convencional.

La torre visual (SigLIP) y el proyector multimodal de dos capas permanecen completamente congelados durante todo el proceso, de modo que el experimento aisla la capacidad del mecanismo subcuadratico para manejar el enrutamiento visio-textual denso sin reentrenar la parte perceptiva. El entrenamiento consiste en un destilado de conocimiento sobre preguntas con imagen de `derek-thomas/ScienceQA`, en dos etapas (37 + 73 pasos, 110 en total) que se completaron en 120,1 segundos con un pico de 17.133 MB de VRAM en una NVIDIA RTX 3090 de 24 GB. No se documenta el numero de tokens de entrenamiento, la composicion exacta del dataset mas alla de ScienceQA, ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en tareas de respuesta visual a preguntas.
- Razonamiento visual basico sobre diagramas y figuras cientificas del dominio ScienceQA.
- Conversacion multimodal de un solo turno o multi-turno simple, heredada del pipeline `image-text-to-text`.
- Respuesta en formato de opcion multiple para preguntas tipo test de ciencia elemental.
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta modo "thinking", audio ni otras modalidades adicionales.

## Casos de uso

- Evaluacion comparativa de mecanismos de atencion subcuadratica: el modelo sirve como banco de pruebas reproducible para medir como `block_transformer_hiba` afecta al enrutamiento visio-textual frente a atencion cuadratica, gracias a la telemetria y los artefactos publicados.
- Investigacion en destilado de conocimiento multimodal: permite estudiar la recuperacion de rendimiento (de 34,48 % a 43,45 % en ScienceQA) tras solo 110 pasos de destilado sobre un modelo profesor congelado.
- Prototipado de asistentes educativos de ciencia elemental: con 0,5 B de parametros y FP16, se puede desplegar en una sola GPU consumer para responder preguntas con imagen de nivel escolar, aceptando su precision limitada.
- Experimentacion con "cirugia de atencion" sobre modelos LLaVA: el script de carga (`apply_qwen_attention_surgery`) permite a investigadores replicar la sustitucion de capas y probar otros patrones hibridos.
- Docencia y formacion en arquitecturas de atencion eficiente: el modelo ilustra de forma concreta el compromiso entre dispersion y calidad en un VLM pequeno, con numeros medibles.
- Pruebas de integracion en pipelines de Hugging Face `transformers`: al cargar sobre el modelo base con `strict=False`, sirve para validar flujos de carga parcial de pesos safetensors en entornos de investigacion.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre `derek-thomas/ScienceQA`, split de validacion, subconjunto con imagen:

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot pre-KD (`block_transformer_hiba`) | Post-KD destilado (`block_transformer_hiba`) | Delta |
|---|---:|---:|---:|---:|
| Accuracy visual ScienceQA (%) | 46,90 | 34,48 | 43,45 | +8,97 |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 111.227,35 | 2,97 | -111.224,37 |

Telemetria de entrenamiento declarada: 110 pasos de optimizacion (etapa 1: 37; etapa 2: 73), 120,1 segundos de duracion, pico de 17.133 MB de VRAM en RTX 3090 de 24 GB. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5 B en FP16 requiere del orden de 1-2 GB de VRAM para pesos, mas el coste del codificador SigLIP y las activaciones; el entrenamiento reportado uso 17.133 MB en una RTX 3090.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM deberia bastar para inferencia en FP16; para entrenamiento o destilado se uso una RTX 3090 de 24 GB.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: la libreria declarada es `neuralops`; el modelo se carga con `transformers` (`LlavaForConditionalGeneration`) aplicando primero la cirugia de atencion y luego cargando `attention_weights.safetensors` con `strict=False`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-block-transformer-hiba-scienceqa` | ~0,5 B | no disponible | 43,45 % acc / 2,97 PPL | MIT | Hugging Face, 0 descargas |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5 B | no disponible | 46,90 % acc / 3,85 PPL | no disponible en la informacion | Hugging Face |
| Otros VLM de ~0,5 B (p. ej. variantes LLaVA-Qwen pequenas) | ~0,5 B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo profesor, unico punto de referencia con datos en la informacion proporcionada. No se dispone de resultados de terceros para contrastar.

## Limitaciones y advertencias

- Modelo experimental de investigacion: 0 descargas y 0 likes en el momento de redactar la ficha, sin validacion externa.
- Precision limitada: 43,45 % en ScienceQA frente al 46,90 % del profesor; no es adecuado para produccion sin evaluacion adicional.
- Entrenamiento muy corto (110 pasos) sobre un unico dataset (ScienceQA), con riesgo alto de sobreajuste al dominio y de escasa generalizacion.
- Solo ingles; no se documenta soporte multilingue.
- Riesgo de alucinacion elevado en dominios fuera de ScienceQA, dado el tamano reducido y el entrenamiento especifico.
- Sesgos conocidos: no documentados por el autor; cabe esperar los sesgos del dataset ScienceQA y del modelo base.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en escenarios de contexto largo.
- Licencia MIT permite uso comercial, pero la falta de garantias y de validacion desaconseja su uso en produccion sin auditoria.
- Requiere aplicar la cirugia de atencion (`apply_qwen_attention_surgery`) antes de cargar los pesos; no es un modelo autonomo cargable directamente con `from_pretrained` sobre el repo.
- Resultados de benchmarks marcados como no verificados por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-block-transformer-hiba-scienceqa
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion de `BlockTransformerHIBA`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/block_transformer_hiba.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
