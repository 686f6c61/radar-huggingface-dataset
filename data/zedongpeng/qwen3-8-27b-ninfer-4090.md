# zedongpeng/Qwen3.8-27B-NInfer-4090

## Resumen

Qwen3.8-27B-NInfer-4090 es una re-cuantización del checkpoint Qwen/Qwen3.8-27B publicada por el usuario zedongpeng, empaquetada en el formato nativo `.ninfer` v3 del motor NInfer y acompañada de un drafter DFlash2 afinado para decodificación especulativa. El objetivo no es otro que servir el modelo de 27.000 millones de parámetros en una única GPU consumer de 24 GB (RTX 4090) con un rendimiento de decodificación notablemente superior al de las recetas públicas existentes, manteniendo una fidelidad al BF16 superior a la del release NInfer original del mismo modelo.

La pieza central es una cuantización GPTQ con act-order y búsqueda de clip por grupo, que fija todas las proyecciones del modelo de texto en Q4 (grupo 64) y aplica además un esquema de códigos restringidos que el motor reempaqueta en tiles de 3 bits en tiempo de carga. Sobre esa base se monta un drafter DFlash2 con LoRA afinado contra las salidas del propio target cuantizado, lo que permite verificar árboles de 16 nodos y emitir varios tokens por ronda sin alterar la distribución del modelo final.

El resultado declarado por el autor es de 322,3 tok/s en Spec-Bench con batch 1, greedy y thinking desactivado, frente a los 102,2 tok/s de llama.cpp y los 200,3 tok/s de vLLM en la misma tarjeta. Es relevante ahora porque demuestra que la decodificación especulativa con verificación exacta, combinada con cuantización agresiva y un motor especializado, puede triplicar el throughput de un modelo de 27B en hardware de consumo, a costa de perder generalidad (batch 1, un solo modelo de GPU soportado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformer denso, según el contenedor NInfer v3) |
| Parametros totales | 27B (heredados del checkpoint base Qwen/Qwen3.8-27B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 32.768 tokens en la configuración de referencia; KV cache máximo de 57.344 tokens con two-level head en 24 GB |
| Tipos de cuantizacion | GPTQ Q4 grupo 64 en proyecciones de texto; códigos de 3 bits en MLP gate/up (capas 0-31) y MLP down (capas 0-15); embedding, LM head y MTP head en q8_g32_fp16; vision tower Q4-Q6; drafter Q4 con códigos de 3 bits en su MLP |
| Idiomas soportados | no disponible (la evaluación de calidad cubre solo prosa en inglés y Python) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` v3 (contenedor binario propietario, 1.190 objetos, 18.186.359.296 bytes / 16,94 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B bajo la clase `Qwen3_5ForCausalLM`, con cabezas MTP (multi-token prediction) y una torre de visión presentes en el contenedor. La contribución de este repositorio no es el entrenamiento del modelo, sino el proceso de cuantización y el ajuste del drafter. La cuantización del target emplea GPTQ con act-order y una búsqueda de clip por grupo; todas las proyecciones del modelo de texto quedan en Q4 con grupo 64 (a diferencia del release NInfer, que mezcla Q4 y Q5). Además, las MLP gate/up de las capas 0-31 y la MLP down de las capas 0-15 usan códigos restringidos al rango [−4, 3], que el motor reempaqueta en tiles de 3 bits al cargar con `NINFER_Q3_SHADOW=1`. Con los códigos congelados, se ajustaron de extremo a extremo un offset de escala por fila de salida y las ganancias de RMSNorm (4,6 millones de parámetros) contra la distribución de salida del modelo BF16.

El drafter es z-lab/Qwen3.8-27B-DFlash2 (revisión `50307d4`), afinado con LoRA sobre 8.000 secuencias generadas por el target cuantizado y posteriormente cuantizado a Q4 con GPTQ (códigos de 3 bits en su MLP; el release lo almacena en Q8). Su shortlist de 131.072 tokens se reordenó con las propias salidas del target. La decodificación especulativa es exacta: cada token emitido es la elección greedy del target, de modo que el drafter solo afecta a la velocidad. El motor necesario es una serie de 53 parches sobre el port Ada de Cinference de jram4, con compilación mediante `-DNINFER_RDC=OFF`.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy en batch 1.
- Razonamiento y generación de código: la evaluación de calidad cubre prosa en inglés y código Python (CPython), lo que confirma competencia en ambos dominios.
- Decodificación especulativa con verificación exacta mediante árbol de 16 nodos y hasta 15 tokens de borrador por ronda.
- Soporte de cabezas MTP (multi-token prediction) heredadas del checkpoint base.
- Torre de visión incluida en el contenedor (cuantizada a Q4-Q6), aunque el autor indica que el comportamiento de visión no fue evaluado.
- Modo thinking desactivable (`--no-thinking` en la invocación de referencia); la evaluación se realizó con thinking off.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la validación se limita a inglés y Python.

## Casos de uso

- Inferencia local de un modelo de 27B en una RTX 4090: el caso de uso central del repositorio. Un desarrollador con una única GPU consumer puede servir el modelo a 322 tok/s en batch 1, suficiente para asistentes interactivos de un solo usuario sin depender de la nube.
- Asistencia de código en IDE o terminal: el modelo se evaluó específicamente sobre código CPython y mantiene un top-1 del 92,50 % frente a la referencia BF16, por lo que es adecuado para autocompletado y generación de funciones en un flujo de trabajo individual.
- Prototipado de aplicaciones de chat con contexto medio: la ventana de 32.768 tokens configurada (y hasta 57.344 tokens de KV cache en 24 GB) permite conversaciones multi-turno con documentos adjuntos de tamaño moderado.
- Evaluación de técnicas de decodificación especulativa: el repositorio incluye el drafter, los parches del motor y las herramientas de medida, lo que lo convierte en una base reproducible para investigar árboles de verificación y reordenación de shortlists.
- Despliegue en estaciones de trabajo con aislamiento de red: al ejecutarse íntegramente en local sobre una sola GPU, encaja en entornos con requisitos de privacidad donde no se permite enviar prompts a APIs externas.
- Benchmarking de cuantización: la comparación KL64, top-1 y PPL frente al checkpoint BF16 y al release NInfer permite usar este modelo como referencia en estudios sobre el impacto de esquemas Q3/Q4 mixtos en la fidelidad de la distribución.
- Generación de documentación técnica y prosa en inglés: el modelo mantiene KL64 de 0,0265 en prosa, la mitad que en código, lo que lo hace más fiable en texto narrativo que en tareas de programación estricta.

## Benchmarks y rendimiento

Velocidad en Spec-Bench (480 primeros turnos, 256 tokens, batch 1, greedy, thinking off, una RTX 4090 a 450 W, PCIe Gen3):

| Motor | Pesos | tok/s | tokens/ronda |
|---|---|---:|---:|
| llama.cpp a4d880f | unsloth UD-Q4_K_XL + DFlash2 Q4_K_M, hasta 7 borradores | 102,2 | 4,09 |
| vLLM 0.27.1 (receta single-user de sidnaZ) | AutoRound W4A16 + DFlash2 W4A16, 7 borradores | 200,3 | 4,07 |
| Cinference-4090 (jram4 70ebb12) | release NInfer, cadena de 7 tokens | 177,9 | 4,03 |
| Motor del autor | release NInfer, árbol de verificación de 16 nodos | 245,2 | 5,18 |
| **Motor del autor** | **este repositorio**, árbol de 16 nodos | **322,3** | **5,43** |

Calidad frente a referencia FP32 sobre el checkpoint BF16 (46.059 predicciones de siguiente token en 44 ventanas de 2.048 tokens, mitad Wikipedia, mitad CPython):

| Modelo | KL64 prosa | KL64 código | KL64 | top-1 | PPL |
|---|---:|---:|---:|---:|---:|
| Release NInfer (RTN Q4/Q5) | 0,0290 | 0,1095 | 0,0668 | 0,9250 | 3,294 |
| **Este modelo** | **0,0265** | **0,1018** | **0,0619** | **0,9250** | **3,213** |
| Checkpoint BF16 | — | — | — | — | 3,146 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM: el contenedor ocupa 16,94 GiB en disco; en ejecución se añaden las copias de solo decodificación (planos de 3 bits, planos de escala de 8 bits y pantallas del LM head), unos 4 GiB adicionales junto a los pesos Q4.
- GPU soportada: únicamente probado en una RTX 4090 (sm_89) de 24 GB. No hay validación en A100, H100 ni otras tarjetas.
- Cabe en GPU consumer: sí, en RTX 4090. No se documenta compatibilidad con GPUs de menor VRAM.
- KV cache máximo en 24 GB: 57.344 tokens con two-level head; 65.536 tokens con head denso (con 345 MiB de margen).
- Despliegue: exclusivamente mediante el motor NInfer parcheado (serie de 53 parches sobre el port Ada de Cinference de jram4, compilado con `-DNINFER_RDC=OFF`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI con este archivo.
- Throughput medido: 322,3 tok/s en batch 1 greedy con árbol de verificación de 16 nodos y 15 tokens de borrador.
- Restricciones de ejecución: concurrencia máxima 1, prefill en chunks de 1.024, KV cache en formato k8v4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Throughput (RTX 4090) | Calidad (KL64 / PPL) | Licencia | Formato |
|---|---|---|---|---|---|---|
| **Este modelo** | 27B | 32.768 (hasta 57.344 KV) | 322,3 tok/s | 0,0619 / 3,213 | Apache-2.0 | `.ninfer` v3 |
| Release NInfer (neroued/Qwen3.8-27B-NInfer) | 27B | no disponible | 245,2 tok/s (mismo motor) | 0,0668 / 3,294 | Apache-2.0 | `.ninfer` |
| Qwen3.8-27B en vLLM (AutoRound W4A16 + DFlash2) | 27B | no disponible | 200,3 tok/s | no disponible | Apache-2.0 | safetensors |
| Qwen3.8-27B en llama.cpp (UD-Q4_K_XL + DFlash2 Q4_K_M) | 27B | no disponible | 102,2 tok/s | no disponible | Apache-2.0 | GGUF |

## Limitaciones y advertencias

- Solo batch 1: el two-level LM head no devuelve logits densos, por lo que la configuración de referencia decodifica de forma greedy. Sin las variables `NINFER_*HEAD*` y `SCREEN_TILED` se usa el head denso con muestreo, pero el rendimiento y la memoria cambian.
- Un único dispositivo validado: RTX 4090 (sm_89). No hay pruebas en A100, H100 ni GPUs de menor VRAM, ni garantía de funcionamiento en otras arquitecturas.
- La calidad solo se midió en prosa inglesa y código Python. Visión, MTP y comportamiento en contexto largo no fueron evaluados, pese a que la torre de visión está presente en el contenedor.
- El formato `.ninfer` v3 es propietario y requiere un motor parcheado específico; no es portable a ecosistemas estándar como vLLM, llama.cpp u Ollama.
- Riesgo de alucinación: no evaluado en la información disponible; se aplican las limitaciones generales del checkpoint Qwen3.8-27B.
- Sesgos: no documentados en la información proporcionada.
- Idiomas: no se declara lista de idiomas soportados; la validación se limita a inglés.
- Licencia Apache-2.0, heredada del modelo base y del drafter, lo que permite uso comercial, pero conviene verificar las condiciones del checkpoint Qwen original y del drafter z-lab por separado.
- El autor indica que el bloque de procedencia del archivo registra rutas relativas al workspace; la integridad debe comprobarse con `sha256sum -c SHA256SUMS` (SHA-256 `37cb1507aca20b442a35f4d7833b950e0507767cf766e7140e81fad4faf43d7f`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zedongpeng/Qwen3.8-27B-NInfer-4090
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Release NInfer del mismo modelo: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Artículo técnico con figuras interactivas: https://zedongpeng.com/blog/2026/qwen38-4090-decode/
- Parches del motor y herramientas de medida: https://github.com/zedong-peng/qwen38-4090-decode
- Serie de 53 parches: https://github.com/zedong-peng/qwen38-4090-decode/tree/master/code/engine-series
