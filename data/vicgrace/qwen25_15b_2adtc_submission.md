# Vicgrace/qwen25_15b_2adtc_submission

## Resumen

El modelo `Vicgrace/qwen25_2adtc_submission` es un ajuste fino del modelo Qwen2.5-1.5B-Instruct, convertido a formato GGUF mediante la herramienta Unsloth. Se distribuye únicamente como archivo cuantizado `Q4_K_M.gguf`, pensado para su uso con llama.cpp y Ollama. Su tamaño reducido (1.543.714.304 parámetros) lo hace adecuado para entornos con recursos limitados, como portátiles o GPUs de gama media. La información pública disponible es escasa: no se especifican los datos de entrenamiento, la licencia, ni los idiomas soportados, aunque al estar basado en Qwen2.5, hereda su arquitectura transformer y su capacidad multilingüe. La relevancia actual radica en que ofrece una opción ligera y eficiente para tareas conversacionales en despliegues locales, aunque su perfil de rendimiento no está documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 32K, heredado de Qwen2.5, no confirmado) |
| Tipos de cuantizacion | Q4_K_M (único archivo GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base Qwen2.5-1.5B-Instruct, que emplea una arquitectura transformer estándar con atención causal. El proceso de fine-tuning se realizó con Unsloth, una herramienta que optimiza el entrenamiento de modelos en GPUs. La conversión a GGUF se efectuó posteriormente para facilitar la inferencia con llama.cpp y Ollama. No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Al ser una variante de Qwen2.5, se espera que mantenga las capacidades del modelo base, pero no hay garantía de que el ajuste haya alterado sus características originales.

## Capacidades

- Generación de texto conversacional: al estar basado en Qwen2.5-Instruct, está orientado a tareas de diálogo y asistencia.
- Razonamiento básico y respuesta a preguntas, limitado por su tamaño (1.5B parámetros).
- Capacidad multilingüe heredada del modelo base, aunque no se especifica qué idiomas están soportados.
- Soporte de tool calling: Qwen2.5-Instruct incluye soporte de function calling, pero no se confirma si el fine-tune lo mantiene.
- No se documenta soporte multimodal ni de vision; el modelo es solo de texto.

## Casos de uso

- Chatbots locales para asistencia personal: puede desplegarse en un portátil o PC con GPU modesta para atender consultas simples, gracias a su tamaño reducido y al formato GGUF compatible con Ollama.
- Generación de respuestas en aplicaciones de soporte técnico: integrable en pipelines de mensajería para responder preguntas frecuentes con contexto limitado.
- Prototipos de agentes conversacionales: su bajo consumo de memoria permite probar conceptos de agentes con razonamiento básico antes de escalar a modelos mayores.
- Procesamiento de texto en dispositivos sin conexión: al ser un modelo local, no requiere conexión a internet, adecuado para entornos con privacidad de datos.
- Herramientas educativas de generación de ejercicios: puede generar preguntas y respuestas sobre temas específicos si se le da un prompt adecuado.
- Integración en aplicaciones de escritorio: gracias al formato GGUF, se puede usar con bibliotecas como llama-cpp-python para añadir funcionalidades de texto en aplicaciones de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros tests estandarizados. El rendimiento real debe ser evaluado de forma independiente.

## Requisitos de hardware

- VRAM estimada: para el archivo Q4_K_M, el tamaño es aproximadamente 1 GB (según el repo), por lo que se puede ejecutar en GPUs con 4 GB de VRAM o incluso en CPU con memoria RAM suficiente.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, por ejemplo GTX 1650, RTX 3050, o incluso integradas modernas. En CPU, funciona con 8 GB de RAM.
- Compatible con consumer GPU: sí, es un modelo ligero.
- Opciones de despliegue: llama.cpp (con `llama-cli`), Ollama (incluye Modelfile), y otras herramientas que soporten GGUF.
- Latencia y throughput: no se especifican, pero para un modelo de 1.5B en Q4, se espera una latencia de unos 10-20 ms por token en una GPU de gama media, y 50-100 ms en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Vicgrace/qwen25_2adtc_submission | 1.54B | No disponible | GGUF (Q4_K_M) | No disponible | Ajuste fino de Qwen2.5-1.5B |
| Qwen2.5-1.5B-Instruct (base) | 1.54B | 32K (típico) | safetensors, GGUF | Apache 2.0 | Modelo original sin ajuste |
| Llama-3.2-1B-Instruct | 1.23B | 128K | safetensors, GGUF | Llama 3.2 License | Alternativa de 1B con contexto largo |

La comparativa se basa en características conocidas de los modelos base, pero no hay datos de rendimiento específicos para el modelo ajustado.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia, por lo que el uso comercial puede ser incierto.
- No se documentan los datos de entrenamiento ni el proceso de ajuste, lo que impide conocer sesgos o riesgos específicos.
- El tamaño de 1.5B limita la calidad de razonamiento complejo y la generación de código avanzado; es adecuado solo para tareas sencillas.
- El contexto no está confirmado; aunque Qwen2.5 suele soportar 32K, el ajuste podría haber reducido la ventana efectiva.
- Riesgo de alucinaciones en temas factuales, como cualquier modelo pequeño.
- No se garantiza el soporte de function calling ni de herramientas, ya que el ajuste pudo haber alterado estas capacidades.
- El archivo GGUF es solo Q4_K_M; no se ofrecen otras cuantizaciones para optimizar memoria o calidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Vicgrace/qwen25_2adtc_submission)
- [Página de Qwen](https://qwen.ai/home)
- [Repositorio de Qwen2.5-Omni](https://github.com/QwenLM/Qwen2.5-Omni) (referencia de la familia Qwen)
