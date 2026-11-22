# ZLouada/GOTHAM-3B

## Resumen

GOTHAM-3B es un asistente conversacional de 3.085.938.688 parámetros (aproximadamente 3,1 mil millones) desarrollado por Zakaria Louada (usuario ZLouada en Hugging Face). Se trata de un ajuste fino del modelo base Qwen/Qwen2.5-3B, sobre el que se han aplicado dos etapas de alineamiento: un ajuste supervisado (Stage 2 SFT) seguido de optimización directa de preferencias (Stage 3 DPO). El resultado es un modelo orientado a generación de texto conversacional, distribuido principalmente en formato GGUF para su uso con Ollama.

El modelo hereda la arquitectura transformer de Qwen2.5-3B, aunque la información publicada no detalla cambios estructurales respecto al modelo base. Su relevancia radica en ofrecer una alternativa ligera y ejecutable en hardware de consumo mediante cuantización, con un pipeline de alineamiento explícito (SFT + DPO) que busca mejorar la calidad de las respuestas conversacionales frente al modelo base sin alineamiento.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor. No se han publicado resultados de benchmarks, detalles del dataset de entrenamiento, licencia explícita ni lista de idiomas soportados, por lo que varios apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5-3B; detalles no disponibles) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-3B, no confirmada en la model card) |
| Tipos de cuantizacion | GGUF F16 (único formato documentado en la model card) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (gotham-3b-f16.gguf) |

## Arquitectura y entrenamiento

GOTHAM-3B parte del modelo Qwen/Qwen2.5-3B, un transformer decoder-only de 3,1 mil millones de parámetros. El autor no documenta modificaciones arquitectónicas respecto al modelo base, por lo que se asume la misma estructura (atención multi-cabeza con RoPE, capas feed-forward, tokenizador de Qwen2.5). No se especifica la longitud de contexto efectiva tras el ajuste.

El entrenamiento se describe en dos etapas explícitas: una fase de Supervised Fine-Tuning (Stage 2 SFT) seguida de Direct Preference Optimization (Stage 3 DPO). No se publican el número de tokens de entrenamiento, la composición del dataset, la procedencia de los datos de preferencias ni hiperparámetros. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La información sobre el proceso de alineamiento se limita a la mención de las dos etapas.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Alineamiento mediante SFT y DPO, lo que en principio favorece respuestas más ajustadas a preferencias humanas que el modelo base sin alinear.
- Ejecución local mediante Ollama, con soporte de GGUF F16.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible`).
- Capacidades de tool calling, agentes, razonamiento matemático, código o visión: no documentadas en la model card; no se pueden confirmar.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `ollama run hf.co/ZLouada/GOTHAM-3B:F16` para prototipos de chat en máquina local, aprovechando su tamaño reducido y el alineamiento SFT+DPO para respuestas coherentes en diálogo.
- Pruebas de concepto de alineamiento: útil como referencia para comparar el efecto de SFT y DPO sobre Qwen2.5-3B en tareas de preferencia y estilo conversacional.
- Chatbot embebido en aplicaciones de escritorio: al distribuirse en GGUF F16, puede integrarse en herramientas de escritorio que consuman modelos vía Ollama sin depender de la nube.
- Generación de texto asistida en entornos con recursos limitados: su tamaño de 3,1B permite inferencia en GPU de consumo con cuantización, adecuado para generación de borradores y resúmenes.
- Evaluación comparativa de ajustes finos: sirve como baseline para medir la mejora de un pipeline SFT+DPO frente al Qwen2.5-3B original en tareas conversacionales.
- Experimentación educativa: modelo manejable para estudiar el flujo completo de ajuste fino y alineamiento sobre una base conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 6,2 GB solo para pesos (3,1B × 2 bytes), más overhead de contexto y KV cache; en la práctica, en torno a 8 GB o más según longitud de contexto.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cabría en GPUs de consumo con 8-12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) en F16, y en GPUs profesionales (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: sí, en modelos con al menos 8 GB de VRAM en F16; con cuantizaciones menores (no publicadas) cabría en GPUs de 6 GB o menos.
- Opciones de despliegue: Ollama (documentado en la model card), llama.cpp por tratarse de GGUF. vLLM y TGI no están documentados para este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GOTHAM-3B | 3,1B | No disponible | No disponible | GGUF | SFT + DPO sobre Qwen2.5-3B |
| Qwen2.5-3B | 3,1B | No disponible en esta ficha | No disponible en esta ficha | Safetensors, GGUF | Modelo base sin el alineamiento SFT+DPO de GOTHAM |
| Alternativas de ~3B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables para comparar rendimiento |

La comparación con alternativas de la misma categoría no puede completarse con datos verificables a partir de la información proporcionada; únicamente se conoce con certeza la relación con su modelo base Qwen2.5-3B.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; debe consultarse al autor antes de usarlo en producción.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe adecuado.
- Sin benchmarks publicados: no hay evidencia cuantitativa del rendimiento frente al modelo base ni frente a alternativas.
- Riesgo de alucinación inherente a modelos de 3B parámetros; el alineamiento SFT+DPO no elimina este comportamiento.
- Sesgos potenciales heredados de Qwen2.5-3B y de los datasets de SFT y DPO, que no se documentan.
- Longitud de contexto no confirmada tras el ajuste; puede diferir de la del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo, sin evidencia de uso en producción.
- Solo se documenta cuantización F16 en GGUF; otras cuantizaciones no están publicadas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/ZLouada/GOTHAM-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Ollama: https://ollama.com
