# webmp3/Sakura-SmolLM2-135M-Instruct-BF16-GGUF

## Resumen

Sakura-SmolLM2-135M-Instruct-BF16-GGUF es una conversión comunitaria a formato GGUF del modelo HuggingFaceTB/SmolLM2-135M-Instruct, publicada por el usuario webmp3. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos son los originales en safetensors, convertidos a BF16 (sin cuantizar) con el script oficial `convert_hf_to_gguf.py` de llama.cpp. El resultado es un único fichero de 270.886.400 bytes (0,3 GB) listo para ejecutarse con llama.cpp y herramientas compatibles.

El modelo subyacente es un transformer decoder de 134.515.008 parámetros, perteneciente a la familia SmolLM2 de Hugging Face, afinado para instrucciones y con licencia Apache 2.0. Su interés práctico está en el extremo opuesto a los modelos grandes: permite inferencia en CPU, dispositivos de bajos recursos, entornos air-gapped y pruebas de infraestructura sin GPU, con un coste de almacenamiento y memoria mínimo.

Es relevante ahora porque el ecosistema GGUF es el estándar de facto para despliegue local y este tipo de conversiones permiten validar pipelines (llama.cpp, Ollama, LM Studio, llama-cpp-python) con un fichero pequeño antes de escalar a modelos mayores. Conviene señalar que el autor no realizó pruebas de inferencia ni mediciones de calidad sobre este fichero concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia SmolLM2, modelo base HuggingFaceTB/SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (consultar la model card del modelo base) |
| Tipos de cuantizacion | BF16 sin cuantizar; el autor indica que se pueden derivar cuantizaciones menores con `llama-quantize`, probadas por separado |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero unico `Sakura-SmolLM2-135M-Instruct-BF16.gguf`, 270.886.400 bytes, SHA-256 `e8dbe545492a548832dbfd8fc178fa61724aaadd9916115da636871a84f1ee46`) |

## Arquitectura y entrenamiento

La arquitectura corresponde íntegramente al modelo base SmolLM2-135M-Instruct: un transformer decoder auto-regresivo de 135M de parámetros, con tokenizador propio de la familia SmolLM2 y ajuste por instrucciones. Esta publicación no modifica ni el entrenamiento ni los hiperparámetros; únicamente serializa los tensores en BF16 dentro de un contenedor GGUF.

El proceso de conversión está documentado por el autor: lectura de los safetensors originales (commit `12fd25f77366fa6b3b4b768ec3050bf629380bac`), escritura a GGUF BF16 con la revisión `19ff817fb25e9a1b838b1d7f9f4325f7bf9779c4` de llama.cpp y verificación del SHA-256 releyendo el fichero desde el Hub tras la subida. El autor advierte explícitamente de que la comparación de identidad byte a byte solo se hizo con un modelo de referencia distinto (Qwen2.5-0.5B-Instruct) y con otra revisión de llama.cpp, y de que **no se ejecutó ninguna prueba de inferencia ni evaluación de calidad** sobre este fichero. Los detalles sobre corpus de entrenamiento, número de tokens, SFT/DPO y posibles innovaciones técnicas deben consultarse en la documentación del modelo base; no se incluyen en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés y chino, orientada a instrucciones breves.
- Respuesta a prompts de formato chat heredada del ajuste de instrucciones del modelo base.
- Generación de texto corto: resúmenes de una frase, reescrituras, respuestas directas.
- Capacidad limitada de razonamiento y de matemáticas, propia de un modelo de 135M de parámetros.
- Capacidad muy limitada de generación de código; no debe asumirse corrección sintáctica en lenguajes complejos.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- Sin capacidades multimodales (ni visión ni audio) según los tags del repositorio.
- Ejecución en CPU y en dispositivos de bajos recursos gracias al formato GGUF y al tamaño del modelo.

## Casos de uso

- Pruebas de humo de pipelines llama.cpp: validar que una build concreta de llama.cpp carga arquitecturas SmolLM2 y responde correctamente antes de desplegar modelos mayores, usando un fichero de 0,3 GB.
- Desarrollo y CI sin GPU: ejecutar tests de integración de aplicaciones de chat, formateo de prompts y streaming de tokens en runners sin acelerador hardware.
- Inferencia en el borde: prototipos de asistentes de texto en Raspberry Pi, routers o dispositivos embebidos donde el presupuesto de memoria es de unos pocos cientos de MB.
- Etiquetado y clasificación aproximada a gran escala: preclasificar o enrutar textos cortos en inglés o chino con un coste por token mínimo, aceptando la pérdida de precisión frente a modelos mayores.
- Entornos air-gapped y demostraciones offline: disponer de un modelo funcional en un portátil sin conexión, sin dependencias de API externas.
- Base para fine-tuning ligero y para experimentos educativos: estudiar el flujo completo safetensors → GGUF → cuantización → inferencia con un modelo que cabe en cualquier equipo.
- Generación de texto de relleno y plantillas: borradores de respuestas cortas, variaciones de texto o datos sintéticos de baja exigencia.
- Comparación de cuantizaciones: usar el BF16 como referencia para medir la degradación de Q8_0, Q4_K_M y otras variantes derivadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión indica expresamente que no realizó pruebas de inferencia ni mediciones de calidad sobre este fichero GGUF. Cualquier cifra de MMLU, HumanEval, GSM8K o similares debería tomarse de la model card del modelo base SmolLM2-135M-Instruct, no de esta publicación.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en BF16 solo para los pesos (0,27 GB) más caché KV y overhead del runtime; en la práctica, menos de 1 GB en total para contextos moderados.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 y GPUs integradas con memoria compartida; también en CPU pura.
- Funciona en Raspberry Pi y dispositivos ARM; el cuello de botella es el ancho de banda de memoria, no la capacidad.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama (requiere importar el GGUF), LM Studio y otras herramientas compatibles con GGUF. vLLM con soporte GGUF es experimental; para producción con safetensors puede usarse Transformers.
- Requiere una build de llama.cpp que soporte la arquitectura SmolLM2.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este fichero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sakura-SmolLM2-135M-Instruct-BF16-GGUF | 134,5M | no disponible | Apache 2.0 | GGUF en HF | Conversión comunitaria sin pruebas de inferencia |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible en esta ficha | Apache 2.0 | Safetensors en HF | Modelo original; usar como referencia de calidad |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible en esta ficha | Apache 2.0 | Safetensors y GGUF en HF | Alternativa directa si se necesita más calidad con coste aún bajo |
| Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 | Safetensors y múltiples GGUF | Mayor tamaño y contexto; mejor multilingüismo general, incluido español |

La comparación de rendimiento entre estos modelos no puede establecerse con los datos disponibles en esta ficha; consúltense las model cards y los informes de evaluación de cada proyecto.

## Limitaciones y advertencias

- Con 135M de parámetros, la calidad de razonamiento, matemáticas y código es muy limitada; no es adecuado para tareas que exijan precisión factual o lógica compleja.
- Riesgo alto de alucinación y de respuestas incoherentes en prompts largos o ambiguos.
- Idiomas soportados limitados a inglés y chino según los tags; el rendimiento en castellano no está documentado y previsiblemente será pobre.
- No hay evidencia de soporte de tool calling, agentes ni modo de razonamiento explícito.
- El autor no ejecutó ninguna prueba de inferencia sobre este fichero: la validez funcional del GGUF no está verificada más allá de la comprobación de integridad SHA-256.
- El BF16 sin cuantizar ocupa más que un Q8_0 o Q4_K_M equivalente; si el objetivo es minimizar tamaño, conviene generar una cuantización derivada y validarla.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones del modelo base y citar adecuadamente el origen.
- El nombre "Sakura" y la publicación son de un tercero, no de Hugging Face; no debe presentarse como release oficial.
- No usar como sustituto de un modelo mayor en producción sin una evaluación propia sobre el dominio objetivo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/webmp3/Sakura-SmolLM2-135M-Instruct-BF16-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Blog de presentación de SmolLM2: https://huggingface.co/blog/smollm2
