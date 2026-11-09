# zybian222/qwen25-15b-math-sft-pilot

## Resumen

qwen25-15b-math-sft-pilot es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen2.5-1.5B, publicado por el usuario zybian222 en Hugging Face. El modelo parte de la arquitectura Qwen2 de 1.500 millones de parametros (concretamente 1.543.714.304 parametros segun los pesos en safetensors) y ha sido entrenado mediante ajuste fino completo (full fine-tuning) sobre un subconjunto del dataset NVIDIA OpenMathInstruct-2, orientado a tareas de matematicas.

Se trata de un experimento piloto, no de un modelo orientado a produccion. El propio autor indica explicitamente en la model card que no se reclama ninguna mejora en benchmarks ni madurez para produccion. El entrenamiento emplea SFT convencional con perdida solo sobre la respuesta (response-only), no la variante TailSFT, y el tokenizer y la plantilla de chat deben tomarse del checkpoint guardado.

Su relevancia es limitada y de caracter experimental: sirve como referencia para quien quiera reproducir o estudiar un pipeline de ajuste fino matematico sobre un modelo pequeno de la familia Qwen2.5, con licencia Apache-2.0 y un tamano que permite ejecucion en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2 del checkpoint base Qwen/Qwen2.5-1.5B: un transformer decoder-only denso con atencion por causalidad, normalizacion RMSNorm y embeddings de tokens compartidos con la cabeza de salida (segun la arquitectura estandar de la familia Qwen2.5; el autor no detalla desviaciones). El tamano del repositorio es de 3,1 GB en safetensors.

El entrenamiento consistio en un ajuste fino completo (no LoRA ni QLoRA) con SFT ordinario, aplicando la perdida unicamente sobre los tokens de respuesta. Los datos provienen de un subconjunto de NVIDIA OpenMathInstruct-2 (licencia CC BY 4.0); el autor remite a data_manifest.json para la revision exacta del dataset y el preprocesamiento, y a run_config.json para los hiperparametros. No se documenta el numero de tokens de entrenamiento, la composicion exacta del subconjunto, ni si hubo etapas de RLHF o DPO posteriores. El autor indica que debe usarse la plantilla de chat y el token EOS del tokenizer guardado.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Qwen2.5-1.5B.
- Razonamiento matematico basico y resolucion de problemas aritmeticos y algebraicos, reforzado por el ajuste fino sobre OpenMathInstruct-2.
- Generacion de explicaciones paso a paso en respuestas matematicas (formato inducido por el dataset de entrenamiento).
- Soporte de conversaciones multi-turno mediante la plantilla de chat del tokenizer guardado.
- Capacidades generales del modelo base (redaccion, resumen, respuesta a preguntas), aunque potencialmente degradadas por el ajuste fino especializado.
- Tool calling / function calling: no documentado por el autor; no disponible de forma verificada.
- Modo thinking, vision o audio: no disponible.
- Capacidades multilingues: no documentadas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Experimentacion academica con SFT matematico: el modelo sirve como referencia reproducible para estudiar el efecto del ajuste fino completo sobre un modelo de 1.500 millones de parametros usando OpenMathInstruct-2, comparando con el checkpoint base.
- Generacion de problemas matematicos resueltos paso a paso: util para crear borradores de ejercicios con solucion detallada en entornos de ensenanza, siempre con revision humana dada la ausencia de garantias de calidad.
- Prototipado de tutores matematicos en local: al caber en GPUs de consumo, permite montar un prototipo de asistente de matematicas sin dependencia de APIs externas.
- Evaluacion de pipelines de ajuste fino: el repositorio incluye manifiestos de datos y configuracion de ejecucion, lo que facilita auditar y replicar el proceso de entrenamiento en estudios de metodologia.
- Base para ajustes posteriores (continued fine-tuning): al estar en safetensors y con licencia Apache-2.0, puede reutilizarse como punto de partida para experimentos de RLHF, DPO o destilacion en dominio matematico.
- Pruebas de inferencia con TGI o transformers: el modelo declara compatibilidad con text-generation-inference y endpoints compatibles, lo que permite integrarlo en entornos de prueba de servidores de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se reclama ninguna mejora en benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8-1 GB para pesos (estimaciones teoricas a partir del numero de parametros; el autor no publica cuantizaciones).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060/4060, RTX 3070/4070, A10, L4). Para cuantizacion 4/8 bits, GPUs con 4-6 GB como GTX 1650 Super o RTX 3050.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 8 GB o mas en FP16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (TGI) y endpoints compatibles segun los tags del repositorio. Para cuantizacion ligera seria necesario convertir los pesos a GGUF (llama.cpp/Ollama) o AWQ/GPTQ, ya que el autor no publica esas variantes.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| qwen25-15b-math-sft-pilot | 1.543.714.304 | no disponible | Apache-2.0 | SFT matematico sobre Qwen2.5-1.5B | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-1.5B (base) | 1.500 millones aprox. | 32.768 tokens (segun documentacion de Qwen2.5) | Apache-2.0 | Modelo generalista | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-Math-1.5B | 1.500 millones aprox. | 4.096 tokens (segun documentacion de Qwen2.5-Math) | Apache-2.0 | Especializado en matematicas, entrenamiento a mayor escala | Hugging Face, oficial de Qwen |

El modelo piloto comparte arquitectura y tamano con el base y con la variante oficial Qwen2.5-Math-1.5B. Frente a esta ultima, el piloto usa un subconjunto de OpenMathInstruct-2 y no reporta mejoras medibles, por lo que la variante oficial de Qwen es la opcion de referencia para matematicas en este rango de tamano. Los datos de contexto de los modelos comparados provienen de su documentacion publica; el contexto del piloto no esta documentado.

## Limitaciones y advertencias

- Modelo experimental: el autor declara explicitamente que no se reclama mejora en benchmarks ni preparacion para produccion.
- Riesgo de alucinacion: en tareas matematicas, un SFT sobre un modelo de 1.500 millones de parametros puede producir pasos intermedios plausibles pero incorrectos; requiere verificacion.
- Sesgos: no documentados por el autor; al heredar el modelo base y entrenarse sobre OpenMathInstruct-2, puede reproducir sesgos de ambos.
- Idiomas: no se documentan los idiomas soportados; el comportamiento fuera del ingles (idioma dominante en datasets matematicos) es incierto.
- Contexto: la longitud de contexto no esta documentada; no debe asumirse el contexto nativo de Qwen2.5 sin verificacion.
- Licencia: Apache-2.0 permite uso comercial, pero el dataset OpenMathInstruct-2 es CC BY 4.0, lo que exige atribucion; conviene revisar data_manifest.json antes de un uso comercial.
- Tokenizer: debe usarse la plantilla de chat y el token EOS del tokenizer guardado; usar otra plantilla puede degradar las respuestas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zybian222/qwen25-15b-math-sft-pilot
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de entrenamiento (NVIDIA OpenMathInstruct-2): https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Variante oficial matematica de referencia: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
