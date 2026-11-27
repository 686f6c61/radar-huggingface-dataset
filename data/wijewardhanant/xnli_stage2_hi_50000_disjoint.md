# WijewardhanaNT/xnli_stage2_hi_50000_disjoint

## Resumen

WijewardhanaNT/xnli_stage2_hi_50000_disjoint es un adaptador LoRA (PEFT) publicado en Hugging Face que se aplica sobre el modelo base meta-llama/Llama-2-7b-hf. Por el identificador del repositorio, el adaptador parece corresponder a un ajuste fino orientado a la tarea XNLI (inferencia de lenguaje natural entre idiomas), con el sufijo "hi" apuntando al hindi y "50000_disjoint" sugiriendo un conjunto de 50.000 ejemplos separado del de evaluación. No obstante, la model card del autor no confirma ninguno de estos extremos: se trata de la plantilla estándar de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]".

El artefacto es, por tanto, un adaptador de bajo rango y no un modelo completo: pesa aproximadamente 0,5 GB y requiere cargar Llama-2-7B por separado para poder ejecutarse. Su relevancia es limitada desde el punto de vista de la evaluación técnica, ya que no hay métricas, descripción del dataset ni hiperparámetros publicados, pero resulta útil como ejemplo de flujo PEFT sobre Llama-2 y como posible punto de partida para quien quiera reproducir o extender un ajuste multilingüe de NLI.

La ficha se ha redactado con la información disponible en el repositorio y en la búsqueda web; cualquier dato no confirmado se indica explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Llama-2-7b-hf); rango y alpha no disponibles |
| Parametros totales | Modelo base: 7.000 millones (Llama-2-7B); adaptador: no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7B); no confirmada para el adaptador |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización estándar de Llama-2) |
| Idiomas soportados | No disponible; el sufijo "hi" sugiere hindi, sin confirmación |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft 0.21.0, transformers |
| Tamano del repositorio | 0,5 GB |
| Modelo base | meta-llama/Llama-2-7b-hf |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente los pesos de un adaptador LoRA, es decir, las matrices de bajo rango que se inyectan en determinadas capas del transformer de Llama-2-7B. La arquitectura subyacente es la de Llama-2: un decoder transformer autorregresivo con normalización RMSNorm, activación SwiGLU, RoPE para las posiciones y atención causal de 4.096 tokens de contexto. El adaptador no modifica esa arquitectura; solo añade parámetros entrenables que se combinan con los pesos congelados del modelo base.

No hay información publicada sobre el procedimiento de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se empleó RLHF, DPO o simple ajuste supervisado. El nombre del repositorio sugiere un ajuste en dos etapas ("stage2") sobre XNLI con 50.000 ejemplos y una partición "disjoint", pero se trata de una inferencia a partir del identificador y no de un dato confirmado por el autor. Tampoco se documentan hiperparámetros como el rango, el alpha, el dropout, la tasa de aprendizaje o el número de épocas.

## Capacidades

- Generación de texto autoregresiva heredada de Llama-2-7B.
- Clasificación de pares de frases en tres etiquetas (implicación, neutral, contradicción), presumiblemente, si el ajuste corresponde a XNLI; no confirmado.
- Razonamiento básico y respuesta a instrucciones en la medida en que lo permite el modelo base sin un ajuste instruct adicional.
- Soporte multilingüe potencial limitado al idioma o idiomas del ajuste; no documentado.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo "thinking", visión, audio ni otras capacidades especiales.

## Casos de uso

- Clasificación de inferencia de lenguaje natural: cargar el adaptador sobre Llama-2-7B y evaluar pares de premisa/hipótesis para obtener una de las tres etiquetas de XNLI. Es el uso más plausible dado el identificador del repositorio, aunque no está confirmado por el autor.
- Investigación sobre PEFT: servir como ejemplo reproducible de cómo se estructura un adaptador LoRA sobre Llama-2 y cómo se carga con la librería peft 0.21.0.
- Experimentos de ajuste multilingüe: emplear el adaptador como punto de partida para comparar el comportamiento de Llama-2 en hindi frente a otros idiomas, siempre que se valide previamente la hipótesis del idioma.
- Docencia y formación: ilustrar en un curso el flujo completo de un ajuste LoRA (entrenamiento, publicación en el Hub, carga con PEFT y evaluación) con un caso real y de tamaño manejable.
- Reproducción de experimentos: intentar replicar el ajuste "stage2" sobre XNLI con 50.000 ejemplos y una partición disjunta, comparando los resultados con los del adaptador publicado.
- Evaluación de robustez multilingüe: analizar cómo se degrada o se mantiene el rendimiento de Llama-2 al aplicar un adaptador entrenado en un idioma concreto sobre pares de frases en otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en fp16: aproximadamente 14 GB solo para los pesos, más overhead de activaciones y caché KV; en torno a 16-18 GB en la práctica.
- VRAM en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 5-6 GB.
- El adaptador LoRA en sí ocupa unos 0,5 GB y se suma a la huella del modelo base.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, L40S 48 GB o RTX 4090 24 GB (esta última con margen ajustado).
- GPU de consumo: cabe en RTX 3090/4090 con cuantización de 8 o 4 bits; en GPUs de 12 GB solo con cuantización agresiva.
- Despliegue: transformers + peft para carga del adaptador; vLLM y TGI admiten adaptadores LoRA con configuración adicional; llama.cpp/Ollama requieren fusionar el adaptador con el modelo base antes de convertirlo a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_stage2_hi_50000_disjoint | 7B (base) + LoRA | 4.096 | Adaptador LoRA sobre Llama-2 | No disponible | Hugging Face |
| meta-llama/Llama-2-7b-hf | 7B | 4.096 | Modelo completo | Llama 2 Community License | Hugging Face |
| meta-llama/Llama-3.1-8B | 8B | 128.000 | Modelo completo | Llama 3.1 Community License | Hugging Face |
| Adaptadores XNLI públicos sobre Llama-2 | 7B (base) + LoRA | 4.096 | Adaptador LoRA | Variable | Hugging Face |

La comparación directa con otros adaptadores XNLI no es posible sin métricas publicadas; la tabla refleja únicamente diferencias estructurales y de licencia.

## Limitaciones y advertencias

- La model card está completamente sin rellenar: no hay descripción, datos de entrenamiento, hiperparámetros, métricas ni instrucciones de uso.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido; además, el modelo base Llama-2 tiene su propia licencia comunitaria que hay que respetar por separado.
- No se confirma el idioma ni la tarea exacta; el identificador sugiere hindi y XNLI, pero es una inferencia no verificada.
- Riesgo de alucinación y sesgos heredado de Llama-2-7B, agravado por la falta de un ajuste instruct documentado.
- El adaptador no es un modelo autónomo: sin el modelo base no se puede ejecutar, y su comportamiento depende por completo de la versión de Llama-2 utilizada.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso ni validación por parte de la comunidad.
- No se documenta el proceso de evaluación, por lo que no se puede afirmar que el adaptador mejore al modelo base en ninguna tarea concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WijewardhanaNT/xnli_stage2_hi_50000_disjoint
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Librería PEFT: https://github.com/huggingface/peft
- Paper de PEFT/LoRA referenciado en los tags: https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono (Lacoste et al., 2019): https://mlco2.github.io/impact
- Dataset XNLI (referencia para la tarea inferida): https://huggingface.co/datasets/facebook/xnli
