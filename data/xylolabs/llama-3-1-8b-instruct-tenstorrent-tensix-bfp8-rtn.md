# Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8-RTN

## Resumen

Llama 3.1 8B Instruct para Tenstorrent Tensix (BFP8 RTN) es una exportación cuantizada del modelo meta-llama/Llama-3.1-8B-Instruct, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent con el stack TT-Metal y TT-NN. El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 8B (8.030.261.248 parámetros) y aplica redondeo al más cercano (RTN) sobre rejillas de block floating point de 8 bits (bfloat8_b) a las 224 matrices lineales de atención y MLP, mientras que el embedding de entrada, la cabeza LM y el resto de tensores permanecen en BF16.

El objetivo es ofrecer un checkpoint que encaje en el formato nativo de empaquetado de Tenstorrent (BFP8) sin necesidad de recalcular la cuantización en el dispositivo, reduciendo el peso de los pesos del modelo de lenguaje a aproximadamente 9,52 GB de memoria de dispositivo y manteniendo una fidelidad muy alta respecto al BF16 original (KL medio de 0,001002159 frente a 0,032352000 de un Q4_K_M emparejado). Es relevante para equipos que despliegan inferencia en hardware Tenstorrent (Blackhole, Grayskull, Wormhole) y necesitan un punto de partida ya validado contra las comprobaciones de rejilla y empaquetado nativo de TT-NN.

El modelo está pensado para generación de texto conversacional en inglés y coreano, con licencia Llama 3.1 Community, y se distribuye en safetensors para su carga con Transformers 5.23.0. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni métricas de velocidad en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), con matrices lineales de atención y MLP cuantizadas a bfloat8_b |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama 3.1 8B Instruct: 128.000 tokens según la release original de Meta) |
| Tipos de cuantizacion | BFP8 RTN (bfloat8_b, 8,5 bits por peso en las 224 matrices lineales); BF16 para embedding, LM head y 67 tensores restantes; media global de 9,482 bits por peso |
| Idiomas soportados | en, ko |
| Licencia | llama3.1 (Llama 3.1 Community License Agreement) |
| Formato de pesos | safetensors (BF16 con valores ya redondeados a rejilla BFP8 en las proyecciones) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención por grupos (GQA), normalización RMSNorm y activación SwiGLU en el MLP. Este checkpoint no reentrena el modelo; parte de los pesos oficiales de Meta y aplica una cuantización post-entrenamiento con redondeo al más cercano (RTN) sobre las 224 matrices lineales de atención y MLP, proyectándolas a la rejilla de block floating point de 8 bits que utiliza el hardware Tensix. El embedding de entrada (no atado), la cabeza LM y los 67 tensores restantes se mantienen en BF16.

No se dispone de información sobre el dataset de entrenamiento original más allá de lo publicado por Meta para Llama 3.1 (mezcla multilingüe con predominio de inglés, datos de código y matemáticas, más ajuste por instrucciones con RLHF/DPO), ni sobre tokens adicionales empleados en esta exportación, ya que es puramente una transformación de pesos. La innovación técnica destacable es la validación explícita de las 224 matrices contra las comprobaciones de rejilla y empaquetado nativo de TT-NN (mismo formato que el empaquetado BFP8), verificada además en el simulador Blackhole con TT-NN 0.81.1. El fichero `quant4.json` identifica el método como RTN, aunque su etiqueta heredada `variant` aún contiene la cadena `gptq`.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y coreano.
- Razonamiento general y respuesta a instrucciones, heredado de Llama 3.1 8B Instruct.
- Generación de código y matemáticas a nivel del modelo base (no se han publicado evaluaciones específicas para este checkpoint).
- Soporte de plantilla de chat (`apply_chat_template`) con roles system/user/assistant.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` según los tags del repositorio.
- Ejecución en hardware Tenstorrent mediante TT-NN con empaquetado nativo BFP8.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible (aunque el modelo base Llama 3.1 sí incorpora soporte de tool calling, este checkpoint no lo verifica).

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado directamente en BFP8 para TT-NN, por lo que se puede cargar en dispositivos Blackhole o Wormhole sin recalcular la cuantización, reduciendo el peso en DRAM a unos 9,52 GB más KV cache y buffers.
- Asistente conversacional en inglés y coreano: aprovecha la plantilla de chat y la ventana de contexto del modelo base para gestionar diálogos multi-turno con historial largo.
- Sustitución de BF16 en pipelines existentes de TT-Metal: equipos que ya ejecutan Llama 3.1 8B en Tensix pueden usar este checkpoint para reducir huella de memoria manteniendo una KL media de 0,001002159 frente al BF16 original.
- Validación y benchmarking de cuantización: sirve como referencia para comparar estrategias de cuantización (RTN BFP8 frente a Q4_K_M de llama.cpp, cuya KL es 0,032352000, es decir, unas 32 veces mayor).
- Prototipado de inferencia en simulador: el ejemplo de la model card se ha verificado en el simulador Blackhole con TT-NN 0.81.1, lo que permite desarrollar y depurar código TT-NN sin hardware físico.
- Generación de texto en producción con Transformers: se puede cargar con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")` en GPU convencionales para tareas de generación conversacional, aunque el checkpoint está optimizado para Tensix.
- Investigación sobre formatos block floating point: útil para estudiar el impacto del redondeo RTN a 8,5 bits por peso en la calidad de un modelo de 8B, con métricas KL publicadas sobre 16.056 posiciones puntuadas.

## Benchmarks y rendimiento

La model card publica una evaluación de fidelidad basada en divergencia KL y aciertos en un conjunto propio de 33 preguntas "normales" y 7 de "thinking", no benchmarks estándar.

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 28 | 0 | — |
| Esta exportación (BFP8 RTN) | 0,001002159 | 28 | 0 | 0 |
| Q4_K_M emparejado | 0,032352000 | 30 | 0 | 0 |

La KL se calcula sobre 16.056 posiciones puntuadas de textos en inglés y coreano, tanto crudos como de chat, en cuatro fragmentos de 1.024 tokens por texto. El suelo BF16 de llama.cpp es 0,000309000. La exportación pasa la regla relativa 7: su KL es 0,030977 veces la del Q4_K_M, dentro del límite de 1,5 veces, y no añade más de una pérdida de respuesta contada. El modelo BF16 original no acierta ninguna de las 7 preguntas de thinking, por lo que esas 7 no aportan evidencia de regresión elegible. No se reportan cifras de velocidad (latencia o throughput) ni resultados de MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 9,52 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers (el tamaño total del repositorio es de 16,1 GB en safetensors BF16).
- Hardware objetivo: aceleradores Tenstorrent Tensix (TT-Metal / TT-NN), con verificación en el simulador Blackhole usando TT-NN 0.81.1.
- GPU convencionales: el checkpoint se puede cargar en GPU con Transformers 5.23.0 y `device_map="auto"` en BF16; requiere al menos ~16 GB de VRAM para los pesos en BF16, más KV cache.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más de VRAM (por ejemplo RTX 4090, RTX 4080, A100, H100) para la carga en BF16 vía Transformers; no se documenta el uso en GPU con cuantización adicional.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch (documentado), TT-NN para Tensix (documentado), `text-generation-inference` (según tags). No se mencionan llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KL media (frente a BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (BFP8 RTN) | 8,03B | no disponible (base: 128k) | BFP8 RTN + BF16 mixto | 0,001002159 | llama3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct (BF16) | 8,03B | 128k | BF16 | 0 (referencia) | llama3.1 | Hugging Face |
| Q4_K_M emparejado (llama.cpp) | 8,03B | 128k | Q4_K_M | 0,032352000 | llama3.1 | llama.cpp |

La comparativa se limita a los perfiles incluidos en la model card; no se dispone de datos de otros checkpoints cuantizados para Tenstorrent ni de benchmarks estándar que permitan comparaciones adicionales.

## Limitaciones y advertencias

- La cuantización BFP8 RTN introduce una divergencia medible frente al BF16 (KL media de 0,001002159), aunque muy inferior a la de Q4_K_M; no es una pérdida nula.
- El conjunto de evaluación es propio y reducido (33 + 7 preguntas, 16.056 posiciones KL); no sustituye a benchmarks estándar como MMLU o HumanEval, que no se han publicado.
- Los 7 ítems de "thinking" no aportan evidencia de regresión porque el BF16 original tampoco acierta ninguno.
- Idiomas documentados: solo inglés y coreano; el resto de idiomas del modelo base no se ha verificado en esta exportación.
- La licencia Llama 3.1 Community impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales para licencia automática) y obligaciones de atribución; consultar `LICENSE` y `USE_POLICY.md`.
- El checkpoint está optimizado para Tensix; `tt-transformers` y `tt-forge` no se han comprobado con este checkpoint según la model card.
- No se reportan métricas de velocidad, latencia ni throughput, lo que dificulta estimar el rendimiento en producción.
- El campo `variant` de `quant4.json` contiene la cadena `gptq` por herencia, aunque el método real es RTN; puede confundir a herramientas automáticas.
- Riesgo de alucinación y sesgos heredados del modelo base Llama 3.1 8B Instruct, no reevaluados en esta exportación.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8-RTN
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Instruct-Tenstorrent-Tensix-BFP8-RTN/blob/main/LICENSE
