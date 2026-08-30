# V4ldeLund/gemma-3-1b-it-icelandic-experiment2

## Resumen

El modelo `V4ldeLund/gemma-3-1b-it-icelandic-experiment2` es un ajuste fino (fine-tuning) del modelo base `google/gemma-3-1b-it`, desarrollado por el usuario V4ldeLund, vinculado a la Universidad Técnica de Dinamarca (DTU). El nombre sugiere que el objetivo del experimento es mejorar el rendimiento del modelo en islandés, aunque no se ha publicado documentación detallada sobre el dataset de entrenamiento ni los resultados obtenidos.

Este modelo, con aproximadamente 999,9 millones de parámetros, hereda la arquitectura de Gemma 3 1B de Google, un transformer decoder-only con una ventana de contexto de 32 000 tokens. Se entrenó mediante Supervised Fine-Tuning (SFT) utilizando la biblioteca TRL de Hugging Face, como se indica en la model card. El repositorio contiene pesos en formato safetensors y el tamaño total del repositorio es de 8,0 GB, lo que sugiere que se incluyen pesos en precisión completa o múltiples variantes.

Dado que se trata de un experimento académico sin datos de evaluación publicados, su uso principal sería como base para investigaciones sobre adaptación de modelos multilingües a idiomas de baja representación, como el islandés. No está pensado para producción sin una evaluación previa rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con atención por ventana deslizante |
| Parametros totales | 999 885 952 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 32 000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible (repositorio con safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el experimento apunta a islandés, pero no está declarado) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Gemma 3 1B, es un transformer decoder-only con 1B parámetros, que utiliza atención con ventana deslizante (sliding window attention) en la mayoría de las capas y atención global en las capas finales. Emplea normalización RMSNorm, activación GeGLU y embeddings rotativos (RoPE). El contexto máximo es de 32 000 tokens, aunque la salida máxima es de 8 000 tokens según la ficha del modelo base en ModelWiki.

El ajuste fino se realizó mediante SFT con TRL (versión 1.11.0), sobre el modelo `google/gemma-3-1b-it`. No se especifica el dataset utilizado, pero el enlace al proyecto de Weights & Biases ("faroese-icelandic-sft") sugiere que se usaron datos en feroés e islandés. Tampoco se detallan hiperparámetros, número de épocas ni configuración de entrenamiento. El modelo se generó con `generated_from_trainer`, lo que indica un flujo estándar de fine-tuning supervisado.

## Capacidades

- Generación de texto en varios idiomas, con énfasis potencial en islandés tras el fine-tuning.
- Razonamiento y conversación multi-turno, heredados del modelo base.
- Soporte de tool calling y function calling, disponible en Gemma 3 1B.
- Capacidades multilingües amplias del modelo base (más de 140 idiomas en el preentrenamiento original), aunque el fine-tuning podría haber alterado el balance.
- No se confirma soporte de visión; el tag `gemma3_text` indica que es solo texto.
- No se han documentado modos especiales de razonamiento extendido (thinking mode) para este fine-tune.

## Casos de uso

- Traducción automática islandés ↔ otros idiomas: el modelo puede utilizarse como base para sistemas de traducción, aprovechando su fine-tuning en islandés y el contexto de 32k para documentos largos.
- Generación de contenido en islandés: redacción de artículos, correos o textos creativos en islandés, aunque se recomienda validar la calidad con hablantes nativos.
- Chatbot en islandés para atención al cliente: el modelo puede mantener conversaciones multi-turno, pero requiere evaluación adicional para uso en producción.
- Análisis de sentimiento en textos islandeses: útil para investigación en procesamiento de lenguaje natural de idiomas nórdicos.
- Experimentación académica en adaptación de modelos multilingües: sirve como referencia para estudiar el efecto del fine-tuning en idiomas de baja representación.
- Prototipado de aplicaciones de IA generativa en entornos con recursos limitados: al ser un modelo de 1B, puede ejecutarse en hardware modesto, aunque con precaución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tuning en la información disponible. El modelo base Gemma 3 1B tiene resultados conocidos en evaluaciones como MMLU, HumanEval y GSM8K, pero no se han reportado métricas específicas para el experimento islandés. Por tanto, no es posible comparar objetivamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, aproximadamente 1 GB; en precisión fp16, alrededor de 2 GB; en fp32, cerca de 4 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) si se usa cuantización; para fp32 se requiere más memoria.
- El modelo cabe en GPUs consumer, especialmente con cuantización GGUF.
- Opciones de despliegue: transformers (pipelines), vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF).
- Latencia y throughput: no se dispone de mediciones específicas; para un modelo de 1B, se espera un throughput de decenas de tokens por segundo en GPUs modernas con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| google/gemma-3-1b-it | 1B | 32k | Gemma Terms of Use | Modelo base, multilingüe, con tool calling |
| V4ldeLund/gemma-3-1b-it-icelandic-experiment2 | 1B | 32k | no disponible | Fine-tune experimental en islandés |
| Qwen2.5-1.5B | 1.5B | 32k | Apache 2.0 | Alternativa multilingüe, mayor tamaño |
| Llama-3.2-1B | 1B | 128k | Llama 3.2 Community License | Contexto más largo, pero menos idiomas |

La comparación se basa en características generales; no hay datos de rendimiento para el fine-tune islandés, por lo que no se puede establecer una jerarquía de calidad.

## Limitaciones y advertencias

- Modelo experimental: no hay garantías de calidad ni de estabilidad; puede producir salidas incoherentes o incorrectas, especialmente fuera del dominio islandés.
- Sesgos y alucinaciones: hereda los sesgos del modelo base y puede alucinar hechos o nombres en islandés.
- Licencia no especificada: el uso comercial es incierto; se debe contactar al autor para aclarar los términos.
- Documentación incompleta: no se detallan los datos de entrenamiento, lo que dificulta la reproducibilidad y la evaluación de sesgos.
- Limitación de idioma: el fine-tuning podría haber degradado el rendimiento en otros idiomas; se recomienda probar antes de usar en entornos multilingües.
- Para producción, es necesario realizar una evaluación exhaustiva y considerar el uso del modelo base o alternativas con licencias claras.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/V4ldeLund/gemma-3-1b-it-icelandic-experiment2)
- [Modelo base google/gemma-3-1b-it](https://huggingface.co/google/gemma-3-1b-it)
- [Informe técnico de Gemma 3 (arXiv)](https://arxiv.org/html/2503.19786v1)
- [Página de Gemma 3 en Google DeepMind](https://deepmind.google/models/gemma/gemma-3/)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/v4lde-danmarks-tekniske-universitet-dtu/faroese-icelandic-sft/runs/9tm8dv6g)
