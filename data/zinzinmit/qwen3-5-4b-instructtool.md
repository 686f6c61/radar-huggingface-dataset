# zinzinmit/Qwen3.5-4B-InstructTool

## Resumen

Qwen3.5-4B-InstructTool es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, desarrollado por el usuario zinzinmit para el reto LifeMate / Zalo AI Challenge. Se trata de un modelo especializado en tool calling (llamada a funciones) y planificación multi-turno para flujos de agente conversacional en vietnamita, con capacidad de manipular entornos y generar JSON conforme a esquemas estrictos sobre un conjunto de 46 herramientas de sistema y aplicación.

El modelo parte de la arquitectura híbrida de Qwen3.5-4B, que combina atención lineal Gated-DeltaNet con atención de consultas agrupadas (GQA), y cuenta con aproximadamente 4,21 mil millones de parámetros (4.539.265.536 según los pesos en safetensors). El ajuste se realizó mediante PEFT LoRA con rango 16 y alpha 32 sobre todas las proyecciones lineales, fusionado posteriormente en pesos bfloat16 nativos.

Su relevancia radica en que mejora sustancialmente el comportamiento del modelo base en tareas de agente: eleva la puntuación oficial de competición de 44,11 % a 78,24 %, reduce drásticamente las llamadas redundantes a herramientas (precisión de cero llamadas del 9,09 % al 90,91 %) y mantiene una latencia de inferencia de 1,21 s por sesión con vLLM. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal Gated-DeltaNet + atención de consultas agrupadas (GQA), basado en Qwen3.5-4B |
| Parametros totales | 4.539.265.536 (según safetensors); la model card indica ~4,21B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (16K) nativos |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Vietnamita (vi) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16 nativo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B, un transformer que combina capas de atención lineal Gated-DeltaNet con capas de atención de consultas agrupadas (GQA), lo que reduce el coste computacional en secuencias largas manteniendo la calidad de atención. El ajuste se realizó con PEFT LoRA (r=16, α=32) sobre todas las proyecciones lineales: q, k, v, o, gate, up, down, in_proj_qkv, in_proj_z y out_proj. Posteriormente, los adaptadores se fusionaron en los pesos nativos en bfloat16.

El entrenamiento utilizó el conjunto de datos del benchmark LifeMate de diálogo multi-turno: 1.390 diálogos expandidos en 3.759 pares de ejecución causal a nivel de paso. No se documenta en la información disponible el uso de RLHF o DPO, ni el número total de tokens de entrenamiento más allá de la composición del dataset. La especialización se orienta a la generación de llamadas a herramientas conformes a esquema, la manipulación de estado de entorno y la evitación de llamadas exploratorias redundantes.

## Capacidades

- Generación de texto conversacional multi-turno en vietnamita e inglés.
- Tool calling / function calling con salida JSON conforme a esquema sobre 46 herramientas de sistema y aplicación.
- Planificación multi-step y manipulación dinámica de estado de entorno en flujos de agente.
- Recuperación dinámica de ejemplos few-shot durante la interacción.
- Supresión de llamadas redundantes o exploratorias cuando la consulta es chitchat o está fuera de alcance (alta precisión de cero llamadas).
- Razonamiento sobre estado de entorno con verificación de estado final (state hash).
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistente de agente conversacional en vietnamita: el modelo gestiona diálogos multi-turno con contexto de hasta 16K tokens y decide cuándo invocar herramientas, adecuado para asistentes de productividad o atención al usuario en ese idioma.
- Automatización de flujos de trabajo con herramientas: genera llamadas JSON conformes a esquema sobre 46 herramientas, lo que permite orquestar acciones de sistema y aplicación en pipelines de agente.
- Integración en asistentes de calendario y agenda: interpreta peticiones como programar reuniones y emite la llamada de herramienta correspondiente con argumentos exactos, reduciendo errores de formato.
- Gestión de contactos y directorios corporativos: responde a consultas de búsqueda de contactos traduciéndolas en llamadas de herramienta precisas, con alta precisión de coincidencia exacta de llamadas (71,61 %).
- Despliegue de bajo coste en producción: con 4,21B parámetros y latencia de 1,21 s por sesión en vLLM, es viable en una sola GPU para servir agentes conversacionales con presupuesto limitado.
- Evaluación y reproducción de benchmarks de agente: el repositorio incluye scripts para reproducir la evaluación LifeMate, útil para investigadores que comparan estrategias de tool calling.
- Filtrado de consultas fuera de alcance: su alta precisión de cero llamadas (90,91 %) permite usarlo como capa de decisión para evitar invocaciones innecesarias de herramientas en sistemas de agente.

## Benchmarks y rendimiento

Evaluado en el LifeMate Validation Benchmark (155 sesiones de diálogo multi-turno con verificación exacta de estado de entorno):

| Modelo | Parámetros | Zero-Call Acc | Tool Name F1 | Tool Set EM | Call Macro F1 | Call Micro F1 | Call Exact Match | State Hash Acc | Puntuación oficial | Latencia |
|---|---|---|---|---|---|---|---|---|---|---|
| zinzinmit/Qwen3.5-4B-InstructTool | 4,21B | 90,91 % | 92,61 % | 83,23 % | 82,61 % | 82,57 % | 71,61 % | 84,52 % | 78,24 % | 1,21 s/muestra |
| Qwen/Qwen3.5-4B (base) | 4,21B | 9,09 % | 81,66 % | 54,84 % | 60,39 % | 63,07 % | 32,26 % | 61,29 % | 44,11 % | 1,62 s/muestra |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02B | 45,45 % | 81,10 % | 58,06 % | 57,61 % | 60,41 % | 35,48 % | 52,90 % | 41,18 % | 1,85 s/muestra |
| aisingapore/Qwen-SEA-LION-v4-4B-VL | 4,44B | 18,18 % | 75,68 % | 45,16 % | 53,91 % | 55,86 % | 27,10 % | 45,16 % | 35,73 % | 2,65 s/muestra |
| aisingapore/Gemma-SEA-LION-v4-4B-VL | 4,30B | 36,36 % | 65,01 % | 32,26 % | 39,29 % | 40,77 % | 16,13 % | 32,26 % | 20,98 % | 3,19 s/muestra |
| google/gemma-4-E2B-it | 5,12B | 63,64 % | 22,22 % | 7,74 % | 16,09 % | 15,94 % | 5,81 % | 23,87 % | 7,42 % | 0,38 s/muestra |

Mejoras clave frente al modelo base: +34,13 puntos absolutos en puntuación oficial (44,11 % → 78,24 %), +23,23 puntos en precisión de hash de estado (61,29 % → 84,52 %), +39,35 puntos en coincidencia exacta de llamadas (32,26 % → 71,61 %) y reducción de latencia de 1,62 s a 1,21 s por muestra.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-10 GB en bfloat16 (pesos de ~8,5 GB más overhead de contexto y caché KV); no se documentan cifras oficiales de VRAM.
- GPU recomendadas: A100, H100 o L40S para serving con vLLM a máxima concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con 12-24 GB de VRAM en bfloat16; con cuantización a 8 bits o 4 bits cabría en GPUs de 8-12 GB (no se publican pesos cuantizados oficiales).
- Opciones de despliegue: vLLM (recomendado por el autor, con prefix caching y max_model_len=16384), Hugging Face Transformers con SDPA; llama.cpp, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput: 1,21 s por sesión multi-turno en vLLM según el autor; no se documenta throughput (tokens/s) ni requisitos de memoria para despliegue concurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Puntuación LifeMate | Disponibilidad |
|---|---|---|---|---|---|---|
| zinzinmit/Qwen3.5-4B-InstructTool | 4,21B | 16K | Apache 2.0 | vi, en | 78,24 % | HuggingFace |
| Qwen/Qwen3.5-4B | 4,21B | No disponible | No disponible | No disponible | 44,11 % | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | 4,02B | No disponible | No disponible | No disponible | 41,18 % | HuggingFace |
| aisingapore/Qwen-SEA-LION-v4-4B-VL | 4,44B | No disponible | No disponible | No disponible | 35,73 % | HuggingFace |

La comparativa se limita a los modelos incluidos en la evaluación del autor; no se dispone de datos de otros benchmarks (MMLU, HumanEval, GSM8K) para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste está orientado al benchmark LifeMate y al idioma vietnamita; su rendimiento en tareas generales de razonamiento, código o matemáticas no se documenta y podría degradarse respecto al modelo base.
- Idiomas limitados: solo se declaran vietnamita e inglés; no hay evidencia de calidad en castellano u otros idiomas.
- Riesgo de alucinación en llamadas a herramientas: aunque la coincidencia exacta de llamadas es del 71,61 %, persiste un 28,39 % de sesiones con algún error en llamadas o argumentos.
- Contexto nativo de 16K tokens: insuficiente para flujos de agente con historiales muy largos o documentos extensos.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo, toxicidad o robustez adversarial.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B debe verificarse por separado en cuanto a sus términos.
- No se publican pesos cuantizados ni recetas de cuantización; el despliegue en hardware limitado requiere cuantización manual.
- El modelo fue creado en octubre de 2026 y cuenta con 204 descargas y 0 likes, por lo que su validación por la comunidad es aún escasa.

## Enlaces

- HuggingFace: https://huggingface.co/zinzinmit/Qwen3.5-4B-InstructTool
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Modelo de audio asociado (pipeline combinado): https://huggingface.co/kzap201/phowhisper-large-zaloai
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
