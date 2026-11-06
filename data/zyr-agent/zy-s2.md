# zyr-AGENT/ZY-S2

## Resumen

ZY-S2 es un modelo de generacion de codigo de 1.500 millones de parametros desarrollado por ZYR AI. Se trata de un fine-tune LoRA sobre Qwen2.5-Coder-1.5B (modelo base de Qwen/Alibaba Cloud), con especial foco en la escritura de codigo Python correcto. El modelo se publica con pesos fusionados (merged) en safetensors y en formato GGUF cuantizado, lo que permite ejecutarlo incluso en la CPU de un portatil con llama.cpp.

Su relevancia radica en el segmento de modelos pequenos (SLM) para codigo: segun los benchmarks publicados por su propio autor, supera a Qwen2.5-Coder-1.5B-Instruct en HumanEval y HumanEval+ cuando ambos se ejecutan como GGUF Q5_K_M en CPU, alcanzando un 75,6 % de pass@1 en HumanEval. Es un modelo especializado: destaca en generacion de Python corto, pero es notablemente debil en matematicas, razonamiento multi-paso, seguridad de codigo y tareas agenticas. Su licencia Apache-2.0 lo hace apto para uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Qwen2), fine-tune LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no consta que sea MoE; se asume densidad total) |
| Longitud de contexto | 8.192 tokens (segun el comando de ejemplo con llama.cpp; limite nativo no especificado) |
| Tipos de cuantizacion | Q5_K_M (GGUF); pesos completos en safetensors sin cuantizar |
| Idiomas soportados | no disponible (el autor indica que el foco es el ingles; otros idiomas menos probados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados) y GGUF (ZY-S2-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

ZY-S2 parte de Qwen2.5-Coder-1.5B, un transformer decoder de la familia Qwen2 optimizado para tareas de programacion. Sobre este modelo base se ha aplicado un fine-tune mediante LoRA (Low-Rank Adaptation), cuyos pesos se han fusionado posteriormente para distribuir el modelo completo en un unico fichero safetensors. El autor no publica detalles sobre el dataset de entrenamiento, el numero de pasos, ni el uso de tecnicas como RLHF o DPO: no disponible.

Un detalle tecnico relevante del formato de inferencia: el modelo fue entrenado con un bloque `<think></think>` vacio como prefijo de respuesta, por lo que en los benchmarks se le antepone ese bloque para obtener los mejores resultados. No se documenta soporte de decodificacion especulativa ni otras innovaciones de arquitectura: no disponible.

## Capacidades

- Generacion de codigo Python: es la capacidad principal, con resultados destacables en HumanEval (75,6 % pass@1) y HumanEval+ (68,9 %) en su formato Q5_K_M.
- Generacion de texto conversacional: pipeline text-generation, aunque orientado a codigo.
- Razonamiento basico: resultados bajos en BBH (24,25 en el conjunto completo), claramente por debajo de su capacidad de codigo.
- Matematicas: rendimiento debil (27,61 en el area math de SLMFrontier, con MATH-500, GSM8K y AIME).
- Tool calling / function calling: capacidad limitada; 40,5 en BFCL v3, muy por debajo del modelo base instruct (72,8).
- Tareas agenticas: exito exacto de 4,5 % en tareas agenticas multi-turno de SLMFrontier; capacidad practicamente testimonial.
- Contexto largo: recuperacion razonable en NIAH y seguimiento de variables de 4k a 16k tokens (81,0), aunque inferior al modelo base.
- No hay evidencia de capacidades de vision, audio ni thinking mode documentados.

## Casos de uso

- Autocompletado y generacion de funciones Python en local: con el GGUF Q5_K_M (aproximadamente 1,1 GB) puede ejecutarse en la CPU de un portatil mediante llama.cpp, ideal para plugins de editor sin dependencia de la nube.
- Prototipado rapido de scripts Python: para generar funciones autocontenidas cortas, su pass@1 en HumanEval+ (68,9 %) es competitivo dentro de la categoria de modelos de menos de 2B.
- Integracion en pipelines de CI para generar codigo boilerplate: su licencia Apache-2.0 permite uso comercial sin restricciones, y el formato GGUF facilita el despliegue en runners con recursos limitados.
- Asistente de codigo embebido en aplicaciones de escritorio: el tamano reducido y la ejecucion CPU-only permiten distribuir el modelo junto a la aplicacion sin requisitos de GPU.
- Generacion de pruebas unitarias simples para funciones Python: adecuado para tareas de generacion de codigo corto y bien delimitado, aunque el codigo producido debe revisarse (ver limitaciones).
- Educacion y aprendizaje de Python: como modelo local y gratuito, sirve para generar ejemplos de codigo y explicaciones basicas en entornos sin conexion.
- No recomendado para: orquestacion de agentes, computer use, revision de seguridad de codigo ni tareas matematicas, donde los propios benchmarks del autor muestran rendimiento bajo.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo. Los modelos comparados se ejecutaron como GGUF Q5_K_M en CPU con llama.cpp, mismo harness y prompts:

| Benchmark | ZY-S2 (Q5_K_M) | Qwen2.5-Coder-0.5B-Instruct (Q5_K_M) | Qwen2.5-Coder-1.5B-Instruct (Q5_K_M) |
|---|---|---|---|
| HumanEval pass@1 (164) | 75,6 | 54,3 | 68,9 |
| HumanEval+ pass@1 (164) | 68,9 | 50,0 | 65,2 |
| SLMFrontier coding (20 items) | 95,0 | 80,0 | 90,0 |
| SLMFrontier math (20 items) | 35,0 | 25,0 | 40,0 |
| SLMFrontier reasoning (20 items) | 20,0 | 25,0 | 5,0 |
| SLMFrontier instruction (20 items) | 42,1 | 37,5 | 48,8 |
| SLMFrontier tools (20 items) | 50,0 | 35,0 | 95,0 |
| Computer-use sim (60 tareas, exito %) | 13,3 | 6,7 | 20,0 |
| Security review recall % (10 fallos plantados) | 70,0 | 80,0 | 90,0 |
| Insecure code rate % (20 prompts, menor es mejor) | 65,0 | 45,0 | 70,0 |
| Rechaza peticiones maliciosas % | 86,7 | 66,7 | 93,3 |

SLMFrontier, conjunto completo de 9 areas (95 % bootstrap CI):

| Area | n | ZY-S2 (Q5_K_M, CPU) | Qwen2.5-Coder-1.5B (Q4_0, GPU 2x T4) |
|---|---|---|---|
| SLMFrontier Score | | 37,87 (36,58–39,25) | 46,34 |
| coding (HumanEval+/MBPP+) | 400 | 68,0 | 61,5 |
| math (MATH-500, GSM8K, AIME24/25) | 460 | 27,61 | 38,0 |
| reasoning (BBH, 10 subtasks) | 400 | 24,25 | 22,5 |
| instruction (IFEval) | 400 | 36,38 | 40,8 |
| tools (BFCL v3) | 400 | 40,5 | 72,8 |
| long context (NIAH, 4k–16k) | 300 | 81,0 | 96,3 |
| agentic (multi-turn python tools) | 200 | 4,5 | 0,0 |
| knowledge (MMLU-Pro, SimpleQA) | 500 | 8,2 | 6,8 |
| safety (XSTest) | 450 | 50,4 | 78,3 |

SLMFrontier coding, mismo harness (CPU llama.cpp, todos Q5_K_M):

| Modelo | Coding (400) | HumanEval+ (163) | MBPP+ (237) | 95 % CI |
|---|---|---|---|---|
| ZY-S2 | 68,0 | 74,2 | 63,7 | 63,5–72,8 |
| Qwen2.5-Coder-1.5B-Instruct | 63,5 | 63,2 | 63,7 | 58,8–68,2 |
| Qwen2.5-Coder-0.5B-Instruct | 47,0 | 52,1 | 43,5 | 42,2–52,0 |
| Llama-3.2-1B-Instruct | 38,0 | 27,0 | 45,6 | 33,2–42,8 |

Advertencias del propio autor: los rangos de confianza de ZY-S2 y Qwen2.5-Coder-1.5B se solapan ligeramente en coding; las filas de 20 items son muestras pequenas y ruidosas (±10 puntos o mas); los numeros oficiales de Qwen usan prompts y precision distintos, por lo que solo deben compararse filas dentro de estas tablas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el GGUF Q5_K_M ocupa aproximadamente 1,1 GB; el autor confirma ejecucion en CPU de portatil. Los pesos completos en safetensors (1,54B de parametros, repo de 4,2 GB) requieren en torno a 3-4 GB de VRAM en FP16/BF16.
- GPU recomendadas: no son necesarias para el GGUF; con pesos completos, cualquier GPU con 4 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060 o superiores) es suficiente.
- Cabe en consumer GPU: si, sobradamente; incluso funciona sin GPU. En portatiles con CPU moderna y 8 GB de RAM es viable via llama.cpp.
- Opciones de despliegue: llama.cpp (llama-server, metodo documentado por el autor), Ollama (compatible con GGUF), y Transformers/HuggingFace con safetensors. No se menciona soporte verificado para vLLM o TGI.
- Latencia y throughput estimados: no disponible. Al ser un modelo de 1,5B en Q5_K_M sobre CPU, cabe esperar respuestas interactivas en hardware de portatil moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval+ (Q5_K_M, mismo harness) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZY-S2 | 1,54B | 8.192 tokens (config de ejemplo) | 68,9 | Apache-2.0 | safetensors + GGUF en Hugging Face |
| Qwen2.5-Coder-1.5B-Instruct | 1,5B | 32.768 tokens (segun ficha oficial de Qwen) | 65,2 | Apache-2.0 (modelo base; instruct Apache-2.0) | Pesos oficiales en Hugging Face, amplio ecosistema |
| Qwen2.5-Coder-0.5B-Instruct | 0,5B | 32.768 tokens (segun ficha oficial de Qwen) | 50,0 | Apache-2.0 | Pesos oficiales en Hugging Face |
| Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens (segun ficha oficial de Meta) | 27,0 | Llama 3.2 Community License | Pesos oficiales en Hugging Face y Meta |

Lectura: ZY-S2 gana en coding dentro de su clase de tamano segun el harness del autor, pero Qwen2.5-Coder-1.5B-Instruct conserva ventaja clara en tool calling, contexto largo y seguridad, y ofrece un contexto nativo mayor y mejor soporte de ecosistema. Los contextos de los modelos Qwen y Llama son los publicados por sus fabricantes, no medidos en el harness del autor.

## Limitaciones y advertencias

- Codigo inseguro: en las pruebas del autor, el 65 % de las respuestas a 20 prompts de generacion de codigo seguro se consideraron inseguras. Es imprescindible revisar el codigo generado antes de ejecutarlo, especialmente en contextos de produccion.
- Seguridad por omision: su puntuacion de 50,4 en XSTest se debe a que responde practicamente a todo y rara vez rechaza peticiones inseguras (86,7 % de rechazo de peticiones maliciosas, por debajo del 93,3 % del modelo base instruct).
- Matematicas y razonamiento debiles: 27,61 en math y 24,25 en reasoning del SLMFrontier completo; no apto para tareas que exijan razonamiento multi-paso fiable.
- Capacidad agencia practicamente nula: 4,5 % de exito exacto en tareas agenticas; 40,5 en BFCL v3 frente a 72,8 del modelo base.
- Idioma y lenguaje: el foco es Python e ingles; otros lenguajes de programacion e idiomas naturales estan menos probados.
- Alucinaciones: al ser un modelo de 1,5B, el autor advierte explicitamente de que cabe esperar errores factuales frecuentes (su knowledge score ajustado por azar es de 8,2).
- HumanEval es una prueba estrecha de funciones Python cortas y no mide la capacidad general de programacion, segun el propio autor.
- Licencia: Apache-2.0, sin restricciones para uso comercial. El modelo base Qwen2.5-Coder-1.5B tambien es Apache-2.0.
- Los benchmarks provienen del propio autor con muestras pequenas y setups no identicos entre comparaciones; conviene validar en el caso de uso concreto antes de adoptar el modelo.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/zyr-AGENT/ZY-S2
- Modelo base Qwen2.5-Coder-1.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Resultados detallados por item: carpeta `benchmarks/` en el repositorio (`benchmarks/slmfrontier-c67/`, `benchmarks/coding_compare/`)
- Paper, blog o demo adicional: no disponible
