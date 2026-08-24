# Wonderlab-Testing-Grounds/Interferon-epsilon-RP-9B-Preview-2608

## Resumen

Interferon-epsilon-RP-9B-Preview-2608 es un finetune experimental del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario Wonderlab-Testing-Grounds dentro de su proceso de iteración hacia una versión más pulida de un modelo de roleplay (RP) y roleplay erótico (ERP). La versión actual se presenta como una prueba temprana e inestable de lo que posteriormente será el modelo Nyx-RP-9B-Instruct-2608-v2, y su principal diferencia respecto a la v1 reside en un dataset de entrenamiento más amplio y un método de ajuste diferente, adoptado para evitar los problemas de estabilidad que afectaron a la iteración anterior.

El modelo se basa en la arquitectura transformer del Qwen3.5-9B, con 9.197 millones de parámetros, y está orientado exclusivamente a la generación de texto conversacional en inglés. Aunque el autor lo etiqueta como «potencialmente inestable» y «experimental», su propósito es la escritura creativa, el roleplay conversacional y la simulación de personajes, con un énfasis especial en interacciones de alta calidad y un estilo natural. La licencia Apache-2.0 permite su uso comercial, y el repositorio incluye pesos en formato safetensors y GGUF, lo que facilita su despliegue tanto en entornos de investigación como en aplicaciones locales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B base) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no especificado) |
| Tipos de cuantizacion | safetensors (presumiblemente BF16/FP16) y GGUF (tipos no especificados) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-9B, un transformer denso de 9,2 mil millones de parámetros. No se trata de una arquitectura MoE ni híbrida, sino de un modelo de atención estándar, aunque los detalles específicos de la atención (tipo de atención, tamaño de la ventana) no se han publicado en la información disponible. El finetune se realizó con un dataset de roleplay y escritura creativa, significativamente más grande que el de la versión anterior (Nyx-RP-9B-Preview-2608-v0.1), y se aplicó un proceso de filtrado adicional para eliminar contenido de baja calidad (denominado «Gemma slop» por el autor). Además, el entrenamiento se realizó con un rango LoRA de 216, lo que sugiere un ajuste de baja adaptación de rango. El autor indica que el método de entrenamiento de la versión anterior provocaba inestabilidad en este modelo, por lo que se optó por un enfoque diferente, aunque no se detallan los hiperparámetros ni el número de tokens de entrenamiento. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto conversacional: orientado a mantener diálogos multi-turno con estilo y coherencia, especialmente en contextos de roleplay.
- Escritura creativa: capaz de producir narrativas descriptivas, diálogos y desarrollo de personajes.
- Roleplay y ERP: el modelo está diseñado para soportar roleplay convencional y erótico, con un enfoque en la interacción con personajes.
- Simulación de personajes: puede adoptar distintos roles y mantener la coherencia de personalidad a lo largo de la conversación.
- Multilingüismo: solo inglés, sin soporte documentado para otros idiomas.
- No se menciona soporte para tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Roleplay conversacional en plataformas de chat: el modelo puede gestionar conversaciones de roleplay con múltiples turnos, manteniendo el contexto y el estilo de los personajes, gracias a su entrenamiento específico en RP/ERP.
- Escritura creativa asistida: para autores que necesiten generar borradores de diálogos o escenas narrativas con un estilo coherente, el modelo puede producir texto creativo con una alta calidad de estilo.
- Simulación de personajes en juegos de rol: integrable en motores de juego o aplicaciones de texto para dar vida a personajes no jugadores (NPC) con personalidades definidas.
- Generación de contenido erótico para plataformas de ficción: aunque la licencia Apache-2.0 permite uso comercial, el autor no especifica restricciones adicionales; el modelo puede ser usado para crear contenido de ficción adulta.
- Experimentación en investigación sobre roleplay y RLHF: como es un finetune experimental, puede ser útil para estudiar el efecto de diferentes datasets y métodos de entrenamiento en la calidad de la generación de roleplay.
- Despliegue en entornos locales con GGUF: gracias a los pesos en formato GGUF, el modelo puede ejecutarse en CPU o GPU con herramientas como llama.cpp u Ollama, permitiendo uso offline y privado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otros estándares, y el modelo está diseñado específicamente para roleplay, no para tareas de razonamiento general o código.

## Requisitos de hardware

- VRAM estimada: para el modelo de 9,2 B en BF16, se requieren aproximadamente 18-20 GB de VRAM para inferencia sin cuantización. Con cuantización GGUF (p. ej., Q4_K_M), la VRAM se reduce a unos 6-8 GB.
- GPUs recomendadas: para una inferencia completa en FP16, una NVIDIA RTX 3090/4090 (24 GB) o A100 (40/80 GB) es suficiente. Para cuantización GGUF, una RTX 3060 (12 GB) o RTX 4060 (8 GB) puede ser suficiente.
- Compatibilidad con consumer GPU: sí, con cuantización GGUF (Q4 o Q5) puede ejecutarse en GPUs de 8-12 GB VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con Transformers.
- Latencia y throughput: no disponible. Para un modelo de 9B en una GPU moderna, se espera una velocidad de generación de 30-50 tokens/s con cuantización GGUF, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de datos concretos de rendimiento para comparar directamente. Sin embargo, en la categoría de modelos de roleplay de ~9B parámetros, se pueden mencionar alternativas generales:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Interferon-epsilon-RP-9B-Preview-2608 | 9,2 B | No disponible | Apache-2.0 | Roleplay/ERP |
| Qwen3.5-9B (base) | 9,2 B | No disponible (típico 32K) | Apache-2.0 | Modelo general |
| LLaMA-3-8B-Instruct | 8 B | 8K | Llama 3 | Instruct general |
| Mistral-7B-Instruct | 7 B | 32K | Apache-2.0 | Instruct general |

Nota: no se dispone de datos de rendimiento específicos para comparar con otros modelos de roleplay de la misma escala. La comparación con modelos generales no refleja la especialización en roleplay.

## Limitaciones y advertencias

- Modelo experimental y potencialmente inestable: el autor lo etiqueta explícitamente como «test» y «experimental», y advierte que puede tener comportamientos impredecibles en algunos turnos.
- Solo inglés: no hay soporte para otros idiomas, lo que limita su uso en entornos multilingües.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar contenido falso o inconsistente, especialmente en contextos de roleplay donde se busca coherencia narrativa.
- Sesgos y contenido explícito: al estar entrenado para RP/ERP, puede generar contenido sexual o violento; su uso en producción requiere moderación y control de contenido.
- Sin datos de rendimiento: la falta de benchmarks publicados dificulta evaluar su calidad de forma objetiva frente a otros modelos.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial, pero el autor no proporciona garantías de calidad ni soporte técnico.

## Enlaces

- Hugging Face: https://huggingface.co/Wonderlab-Testing-Grounds/Interferon-epsilon-RP-9B-Preview-2608
- No se han encontrado otros enlaces (papers, blogs, repos) en la información disponible.
